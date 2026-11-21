import { schema_BrowserNonce } from '../api/validators.js';

export class FlowError extends Error {
  readonly kind: 'configuration' | 'storage' | 'crypto' | 'pending' | 'protocol' | 'expired' | 'stale';
  constructor(kind: FlowError['kind']) {
    super(`Authorization flow ${kind}`); this.name = 'FlowError'; this.kind = kind;
  }
}
type Scope = { owner: string | null; epoch: string };
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;
type Crypto = Pick<globalThis.Crypto, 'getRandomValues' | 'subtle'>;
type Intent = 'restore' | 'login' | 'register';
export type Pending = {
  version: 1; state: string; verifier: string; challenge: string;
  callback: string; apiOrigin: string; owner: string | null; epoch: string;
  intent: Intent; returnHash: string; created: number;
};
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const keys = ['version', 'state', 'verifier', 'challenge', 'callback', 'apiOrigin', 'owner', 'epoch', 'intent', 'returnHash', 'created'];
function nonce(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function endpoint(raw: string, originOnly: boolean): URL {
  let url: URL;
  try { url = new URL(raw); } catch { throw new FlowError('configuration'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password ||
      raw.includes('?') || raw.includes('#') || (originOnly ? url.origin !== raw : url.href !== raw)) throw new FlowError('configuration');
  return url;
}
function route(hash: unknown): hash is string {
  return typeof hash === 'string' && hash.length <= 2048 && hash.startsWith('#/') && !/[\u0000-\u001F\u007F\uD800-\uDFFF]/u.test(hash);
}

/** Owns only per-tab PKCE state. Tokens/passwords and API-origin refresh proofs
 * never belong here. Navigation/exchange and identity commit are separate. */
export class PendingFlow {
  readonly #storage: Storage;
  readonly #crypto: Crypto;
  readonly #clock: () => number;
  readonly #scope: () => Scope;
  readonly #api: string;
  readonly #callback: string;
  readonly #key: string;
  constructor(config: { storage: Storage; crypto: Crypto; clock: () => number; scope: () => Scope; apiOrigin: string; callback: string }) {
    endpoint(config.apiOrigin, true); endpoint(config.callback, false);
    this.#api = config.apiOrigin; this.#callback = config.callback;
    this.#storage = config.storage; this.#crypto = config.crypto; this.#clock = config.clock; this.#scope = config.scope;
    this.#key = `yp.auth.pending.v1:${this.#api}:${encodeURIComponent(this.#callback)}`;
  }
  #identity(): Scope {
    const value = this.#scope();
    if (typeof value.epoch !== 'string' || !uuid.test(value.epoch) || (value.owner !== null && (typeof value.owner !== 'string' || !uuid.test(value.owner)))) throw new FlowError('configuration');
    return { ...value };
  }
  #read(): Pending | null {
    let raw: string | null;
    try { raw = this.#storage.getItem(this.#key); } catch { throw new FlowError('storage'); }
    if (raw === null) return null;
    let value: Pending;
    try { if (raw.length > 8192) throw new Error(); value = JSON.parse(raw); } catch { throw new FlowError('protocol'); }
    if (!value || typeof value !== 'object' || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key)) ||
        value.version !== 1 || value.callback !== this.#callback || value.apiOrigin !== this.#api ||
        !schema_BrowserNonce(value.state) || !schema_BrowserNonce(value.verifier) || !schema_BrowserNonce(value.challenge) ||
        typeof value.epoch !== 'string' || !uuid.test(value.epoch) || (value.owner !== null && (typeof value.owner !== 'string' || !uuid.test(value.owner))) ||
        !['restore', 'login', 'register'].includes(value.intent) || !route(value.returnHash) || !Number.isSafeInteger(value.created) || value.created < 0) throw new FlowError('protocol');
    return value;
  }
  #status(value: Pending): 'pending' | 'expired' | 'stale' {
    const now = this.#clock();
    if (!Number.isSafeInteger(now) || now < value.created || now - value.created > 15 * 60 * 1000) return 'expired';
    const current = this.#identity();
    return current.epoch !== value.epoch || current.owner !== value.owner ? 'stale' : 'pending';
  }
  #matches(value: Pending): void {
    const status = this.#status(value);
    if (status !== 'pending') throw new FlowError(status);
  }
  pendingSummary(): (Pick<Pending, 'state' | 'intent' | 'returnHash' | 'owner' | 'epoch' | 'created'> & { status: 'pending' | 'expired' | 'stale' }) | null {
    const pending = this.#read();
    if (!pending) return null;
    return { state: pending.state, intent: pending.intent, returnHash: pending.returnHash,
      owner: pending.owner, epoch: pending.epoch, created: pending.created, status: this.#status(pending) };
  }
  async begin(intent: Intent, returnHash: string) {
    if (!['restore', 'login', 'register'].includes(intent) || !route(returnHash)) throw new FlowError('protocol');
    if (this.#read()) throw new FlowError('pending');
    const scope = this.#identity();
    const created = this.#clock();
    if (!Number.isSafeInteger(created) || created < 0) throw new FlowError('configuration');
    let state: string, verifier: string, challenge: string;
    try {
      state = nonce(this.#crypto.getRandomValues(new Uint8Array(32)));
      verifier = nonce(this.#crypto.getRandomValues(new Uint8Array(32)));
      challenge = nonce(new Uint8Array(await this.#crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
      if (![state, verifier, challenge].every(schema_BrowserNonce)) throw new Error();
    } catch { throw new FlowError('crypto'); }
    const value: Pending = { version: 1, state, verifier, challenge, callback: this.#callback, apiOrigin: this.#api,
      owner: scope.owner, epoch: scope.epoch, intent, returnHash, created };
    this.#matches(value);
    // Recheck after asynchronous digest: another begin may have completed.
    if (this.#read()) throw new FlowError('pending');
    try { this.#storage.setItem(this.#key, JSON.stringify(value)); } catch { throw new FlowError('storage'); }
    return new URLSearchParams({ redirect_uri: value.callback, state, code_challenge: challenge, code_challenge_method: 'S256', intent });
  }
  capture(rawURL: string, replaceURL: (clean: string) => void): { code: string; pending: Pending } | null {
    let url: URL;
    try { url = new URL(rawURL); } catch { throw new FlowError('protocol'); }
    const callback = new URL(this.#callback);
    if (url.origin !== callback.origin) throw new FlowError('protocol');
    if (!url.searchParams.has('code') && !url.searchParams.has('state')) return null;
    // Scrub callback credentials before reading storage or validating payload.
    replaceURL(url.origin + url.pathname);
    if (url.pathname !== callback.pathname || url.username || url.password || url.hash ||
        [...url.searchParams.keys()].some(key => key !== 'code' && key !== 'state') ||
        url.searchParams.getAll('code').length !== 1 || url.searchParams.getAll('state').length !== 1) throw new FlowError('protocol');
    const code = url.searchParams.get('code')!;
    const state = url.searchParams.get('state')!;
    if (!schema_BrowserNonce(code) || !schema_BrowserNonce(state)) throw new FlowError('protocol');
    const pending = this.#read();
    if (!pending || pending.state !== state) throw new FlowError('protocol');
    this.#matches(pending);
    replaceURL(this.#callback + pending.returnHash);
    return { code, pending };
  }
  /** Broker refusal (`error`+`state`, no code). Scrubs the URL first; the
   * caller must cancel the matched flow. Never carries credentials. */
  captureDenied(rawURL: string, replaceURL: (clean: string) => void): { error: 'login_required' | 'access_denied'; pending: Pending } | null {
    let url: URL;
    try { url = new URL(rawURL); } catch { throw new FlowError('protocol'); }
    const callback = new URL(this.#callback);
    if (url.origin !== callback.origin) throw new FlowError('protocol');
    if (!url.searchParams.has('error')) return null;
    replaceURL(url.origin + url.pathname);
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    if (url.pathname !== callback.pathname || url.username || url.password || url.hash ||
        [...url.searchParams.keys()].some(key => key !== 'error' && key !== 'state') ||
        url.searchParams.getAll('error').length !== 1 || url.searchParams.getAll('state').length !== 1 ||
        (error !== 'login_required' && error !== 'access_denied') || !schema_BrowserNonce(state)) throw new FlowError('protocol');
    const pending = this.#read();
    if (!pending || pending.state !== state) throw new FlowError('protocol');
    replaceURL(this.#callback + pending.returnHash);
    return { error, pending };
  }
  acknowledge(state: string): void {
    const pending = this.#read();
    if (!pending || pending.state !== state) throw new FlowError('stale');
    this.#matches(pending);
    try { this.#storage.removeItem(this.#key); } catch { throw new FlowError('storage'); }
  }
  cancel(state: string): Pick<Pending, 'intent' | 'returnHash' | 'owner' | 'epoch'> {
    const pending = this.#read();
    if (!pending || pending.state !== state) throw new FlowError('stale');
    // Explicit cancellation also releases an expired/stale flow, but can never
    // delete a replacement with a different unpredictable state.
    try { this.#storage.removeItem(this.#key); } catch { throw new FlowError('storage'); }
    return { intent: pending.intent, returnHash: pending.returnHash, owner: pending.owner, epoch: pending.epoch };
  }
}

/** Top-level navigation target: the first-party broker page on the API origin. */
export function authorizationURL(apiOrigin: string, params: URLSearchParams): string {
  endpoint(apiOrigin, true);
  return `${apiOrigin}/auth/authorize?${params}`;
}
