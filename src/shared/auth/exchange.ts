import type { components } from '../api/schema';
import { ApiError } from '../api/client.ts';
import { exchangeBrowserCode_request, exchangeBrowserCode_response_200, exchangeBrowserCode_response_default } from '../api/validators.js';
import { PendingFlow, FlowError } from './flow.ts';
import type { Pending } from './flow.ts';

export type ExchangeResult = {
  credentials: components['schemas']['WebCredentials'];
  scope: { owner: string | null; epoch: string };
  state: string;
  returnHash: string;
};

function scalarStrings(value: unknown): boolean {
  if (typeof value === 'string') return !/[\uD800-\uDFFF]/u.test(value);
  if (value && typeof value === 'object') return Object.entries(value).every(([key, item]) => scalarStrings(key) && scalarStrings(item));
  return true;
}
async function body(response: Response): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('Content-Type') ?? '')) throw new ApiError('protocol');
  const reader = response.body?.getReader();
  if (!reader) throw new ApiError('protocol');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      length += item.value.byteLength;
      if (length > 65536) { await reader.cancel(); throw new ApiError('protocol'); }
      chunks.push(item.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!scalarStrings(value)) throw new Error();
    return value;
  } catch { throw new ApiError('protocol'); }
}

/** Callback-only transport. No refresh, identity commit, storage of tokens or
 * automatic retry. A result remains bound to the original pending scope; the
 * coordinator must acknowledge and commit identity synchronously in that scope. */
export class CodeExchange {
  readonly #flow: PendingFlow;
  readonly #fetch: typeof fetch;
  readonly #timeout: number;
  #attempted: string | null = null;
  constructor(config: { flow: PendingFlow; fetch?: typeof fetch; timeoutMs?: number }) {
    this.#flow = config.flow; // Never store the bare global: calling it as a method throws Illegal invocation in browsers.
    this.#fetch = config.fetch ?? ((input, init) => globalThis.fetch(input, init));
    this.#timeout = config.timeoutMs ?? 15000;
    if (!Number.isSafeInteger(this.#timeout) || this.#timeout < 1 || this.#timeout > 120000) throw new ApiError('configuration');
  }
  #current(pending: Pending): void {
    const current = this.#flow.pendingSummary();
    if (!current || current.state !== pending.state || current.owner !== pending.owner || current.epoch !== pending.epoch || current.status !== 'pending') throw new ApiError('stale_session');
  }
  async exchangeCallback(rawURL: string, replaceURL: (clean: string) => void, externalSignal?: AbortSignal): Promise<ExchangeResult | null> {
    const captured = this.#flow.capture(rawURL, replaceURL);
    if (!captured) return null;
    const { code, pending } = captured;
    if (this.#attempted === pending.state) throw new FlowError('pending');
    const input = { authorization_code: code, code_verifier: pending.verifier, redirect_uri: pending.callback, state: pending.state };
    if (!exchangeBrowserCode_request(input)) throw new ApiError('invalid_input');
    this.#current(pending);
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.#timeout);
    const signal = AbortSignal.any([controller.signal, externalSignal ?? new AbortController().signal]);
    try {
      if (signal.aborted) throw new ApiError('aborted');
      // Persisted PKCE remains pending after uncertainty. A new code needs an
      // explicit cancel/restart via the live first-party session, not replay.
      this.#attempted = pending.state;
      const response = await this.#fetch(pending.apiOrigin + '/v1/auth/browser/exchange', {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(input),
        credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer', signal,
      });
      this.#current(pending);
      const parsed = await body(response);
      if (signal.aborted) throw new ApiError(timedOut ? 'timeout' : 'aborted');
      this.#current(pending);
      if (response.status !== 200) {
        if (response.ok || !exchangeBrowserCode_response_default(parsed)) throw new ApiError('protocol');
        const code = (parsed as { code: string }).code;
        const diagnostic = response.headers.get('X-Request-ID') ?? '';
        const retry = response.headers.get('Retry-After') ?? '';
        throw new ApiError('http', response.status, /^[a-z0-9_]{1,100}$/.test(code) ? code : '',
          /^[A-Za-z0-9_-]{1,128}$/.test(diagnostic) ? diagnostic : '', /^\d{1,6}$/.test(retry) ? Number(retry) : null);
      }
      if (!exchangeBrowserCode_response_200(parsed)) throw new ApiError('protocol');
      const credentials = parsed as components['schemas']['WebCredentials'];
      if (!/^[A-Za-z0-9_.-]{1,8192}$/.test(credentials.access_token)) throw new ApiError('protocol');
      if (pending.owner !== null && credentials.user.id !== pending.owner) throw new ApiError('stale_session');
      return { credentials, scope: { owner: pending.owner, epoch: pending.epoch }, state: pending.state, returnHash: pending.returnHash };
    } catch (error) {
      this.#current(pending);
      if (error instanceof ApiError || error instanceof FlowError) throw error;
      throw new ApiError(signal.aborted ? (timedOut ? 'timeout' : 'aborted') : 'network');
    } finally { clearTimeout(timer); }
  }
}
