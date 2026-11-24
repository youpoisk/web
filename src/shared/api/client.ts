import type { operations } from './schema';
import * as schemas from './validators.js';

type Operation = Exclude<keyof operations, 'registerAccount' | 'loginAccount' | 'refreshSession' | 'issueBrowserCode' | 'exchangeBrowserCode' | 'identifyBrowserSession'>;
type Part<T, N extends string> = [NonNullable<T>] extends [never] ? { [K in N]?: never }
  : undefined extends T ? { [K in N]?: NonNullable<T> } : { [K in N]: T };
type Body<K extends Operation> = operations[K] extends { requestBody: { content: { 'application/json': infer B } } }
  ? { body: B } : { body?: never };
export type RequestOptions<K extends Operation> = Body<K> &
  Part<operations[K]['parameters']['path'], 'path'> &
  Part<operations[K]['parameters']['query'], 'query'> &
  Part<operations[K]['parameters']['header'], 'header'> & { signal?: AbortSignal };
type Json<T> = T extends { content: { 'application/json': infer R } } ? R : void;
export type ResponseBody<K extends Operation> = Json<operations[K]['responses'][Extract<keyof operations[K]['responses'], 200 | 201 | 204>]>;
export type SessionScope = { state: 'guest' } | { state: 'recovering'; owner: string; epoch: string }
  | { state: 'authenticated'; owner: string; epoch: string; accessToken: string };
export type Failure = 'configuration' | 'invalid_input' | 'authentication_unavailable' | 'stale_session'
  | 'aborted' | 'timeout' | 'network' | 'protocol' | 'http';

export class ApiError extends Error {
  readonly kind: Failure;
  readonly status: number;
  readonly code: string;
  readonly requestId: string;
  readonly retryAfterSeconds: number | null;
  constructor(kind: Failure, status = 0, code = '', requestId = '', retryAfterSeconds: number | null = null) {
    super(`API ${kind}${status ? ` (${status})` : ''}`);
    this.name = 'ApiError'; this.kind = kind; this.status = status;
    this.code = code; this.requestId = requestId; this.retryAfterSeconds = retryAfterSeconds;
  }
}

function safeWireValues(value: unknown): void {
  if (typeof value === 'string' && /[\uD800-\uDFFF]/u.test(value)) throw new ApiError('protocol');
  if (typeof value === 'number' && (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))) {
    throw new ApiError('protocol');
  }
  if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) {
    safeWireValues(key); safeWireValues(item);
  }
}
function validates(name: string, value: unknown): boolean {
  const validator = (schemas as unknown as Record<string, (input: unknown) => boolean>)[name];
  return validator(value);
}
function scopeKey(scope: SessionScope): string {
  return scope.state === 'guest' ? 'guest' : JSON.stringify([scope.owner, scope.epoch]);
}
async function readBody(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      length += item.value.byteLength;
      if (length > 262144) { await reader.cancel(); throw new ApiError('protocol'); }
      chunks.push(item.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new ApiError('protocol'); }
}
async function readBytes(response: Response, limit: number): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      length += item.value.byteLength;
      if (length > limit) { await reader.cancel(); throw new ApiError('protocol'); }
      chunks.push(item.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
type RawReply = { status: number; type: string; bytes: Uint8Array; requestId: string; retryAfter: number | null };
function origin(raw: string): string {
  let url: URL;
  try { url = new URL(raw); } catch { throw new ApiError('configuration'); }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash || raw.includes('?') || raw.includes('#')) {
    throw new ApiError('configuration');
  }
  return url.origin;
}

/** Business transport only. Auth and browser grants belong to the first-party coordinator. */
export class ApiClient {
  readonly #origin: string;
  readonly #session: () => SessionScope;
  readonly #fetch: typeof fetch;
  readonly #timeout: number;
  constructor(config: { baseUrl: string; session: () => SessionScope; fetch?: typeof fetch; timeoutMs?: number }) {
    this.#origin = origin(config.baseUrl);
    this.#session = config.session;
    // Never store the bare global: calling it as a method throws Illegal invocation in browsers.
    this.#fetch = config.fetch ?? ((input, init) => globalThis.fetch(input, init));
    this.#timeout = config.timeoutMs ?? 15000;
    if (!Number.isSafeInteger(this.#timeout) || this.#timeout < 1 || this.#timeout > 120000) throw new ApiError('configuration');
  }
  get avatarScope(): string { const current=this.#session();return current.state+':'+scopeKey(current); }
  /** Avatar image I/O (YP-100): the only non-JSON bodies. A signed-in
   * session is required; the Bearer token is sent like every private call. */
  async #raw(method: 'GET' | 'PUT', path: string, init: { body?: Blob; contentType?: string; accept: string; cache: RequestCache; limit: number; revision: number; signal?: AbortSignal }): Promise<RawReply> {
    const scope = this.#session();
    if (scope.state !== 'authenticated' || !/^[A-Za-z0-9_.-]{1,8192}$/.test(scope.accessToken)) throw new ApiError('authentication_unavailable');
    const captured = scopeKey(scope);
    const headers = new Headers({ Accept: init.accept, Authorization: `Bearer ${scope.accessToken}` });
    if (init.contentType) headers.set('Content-Type', init.contentType);
    headers.set('If-Match', `"${init.revision}"`);
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.#timeout);
    const signal = AbortSignal.any([controller.signal, init.signal ?? new AbortController().signal]);
    try {
      if (signal.aborted) throw new ApiError('aborted');
      const response = await this.#fetch(this.#origin + path, { method, headers, body: init.body, signal, credentials: 'omit', redirect: 'error', cache: init.cache, referrerPolicy: 'no-referrer' });
      const bytes = await readBytes(response, init.limit);
      if (signal.aborted) throw new ApiError(timedOut ? 'timeout' : 'aborted');
      if (captured !== scopeKey(this.#session())) throw new ApiError('stale_session');
      const diagnostic = response.headers.get('X-Request-ID') ?? '';
      const retry = response.headers.get('Retry-After') ?? '';
      return { status: response.status, type: response.headers.get('Content-Type') ?? '', bytes, requestId: /^[A-Za-z0-9_-]{1,128}$/.test(diagnostic) ? diagnostic : '', retryAfter: /^\d{1,6}$/.test(retry) ? Number(retry) : null };
    } catch (error) {
      if (captured !== scopeKey(this.#session())) throw new ApiError('stale_session');
      if (error instanceof ApiError) throw error;
      throw new ApiError(signal.aborted ? (timedOut ? 'timeout' : 'aborted') : 'network');
    } finally { clearTimeout(timer); }
  }
  /** Parses a JSON reply of an avatar call: the declared schema on success,
   * the uniform Error otherwise. */
  #json(reply: RawReply, schema: string): unknown {
    if (!/^application\/json(?:\s*;|$)/i.test(reply.type)) throw new ApiError('protocol');
    let parsed: unknown;
    try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(reply.bytes)); safeWireValues(parsed); } catch { throw new ApiError('protocol'); }
    const ok = reply.status === 200;
    if (reply.status >= 200 && reply.status < 300 && !ok) throw new ApiError('protocol');
    if (!validates(ok ? schema : 'schema_Error', parsed)) throw new ApiError('protocol');
    if (!ok) {
      const code = (parsed as { code?: string }).code ?? '';
      throw new ApiError('http', reply.status, /^[a-z0-9_]{1,100}$/.test(code) ? code : '', reply.requestId, reply.retryAfter);
    }
    return parsed;
  }
  /** Uploads a JPEG/PNG avatar; the server stores a 128x128 PNG. */
  async uploadAvatar(image: Blob, revision: number, signal?: AbortSignal): Promise<{ revision: number; etag: string }> {
    if ((!['image/png', 'image/jpeg', 'image/webp'].includes(image.type)) || !Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER || image.size < 1 || image.size > 2097152) throw new ApiError('invalid_input');
    const reply = await this.#raw('PUT', '/v1/me/avatar', { body: image, contentType: image.type, accept: 'application/json', cache: 'no-store', limit: 262144, revision, signal });
    return this.#json(reply, 'schema_AvatarState') as { revision: number; etag: string };
  }
  /** Viewer/session-bound image URL. Never cache it across account scopes. */
  async avatar(userId: string, signal?: AbortSignal): Promise<string | null> {
    if (!UUID.test(userId)) throw new ApiError('invalid_input');
    let result: ResponseBody<'getAvatarLink'>;
    try { result = await this.request('getAvatarLink', { path: { id: userId }, signal }); }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'http' && error.status === 404) return null;
      throw error;
    }
    let url: URL;
    try { url = new URL(result.avatar_url, this.#origin); } catch { throw new ApiError('protocol'); }
    if (url.origin !== this.#origin || url.username || url.password || url.pathname !== `/v1/users/${userId}/avatar` || url.hash ||
        [...url.searchParams.keys()].length !== 1 || !/^[A-Za-z0-9_.-]{1,8192}$/.test(url.searchParams.get('token') ?? '')) throw new ApiError('protocol');
    return url.href;
  }
  async request<K extends Operation>(operation: K, options: RequestOptions<K>): Promise<ResponseBody<K>> {
    if (!Object.hasOwn(schemas.contract, operation)) throw new ApiError('invalid_input');
    const entry = schemas.contract[operation];
    if (!entry || ['registerAccount', 'loginAccount', 'refreshSession', 'issueBrowserCode', 'exchangeBrowserCode', 'identifyBrowserSession'].includes(operation)) throw new ApiError('invalid_input');
    const scope = this.#session();
    if (entry.auth !== 'none' && (scope.state === 'recovering' || (entry.auth === 'required' && scope.state === 'guest'))) {
      throw new ApiError('authentication_unavailable');
    }
    const captured = scopeKey(scope);
    const headers = new Headers({ Accept: 'application/json' });
    if (entry.auth !== 'none' && scope.state === 'authenticated') {
      if (!/^[A-Za-z0-9_.-]{1,8192}$/.test(scope.accessToken)) throw new ApiError('authentication_unavailable');
      headers.set('Authorization', `Bearer ${scope.accessToken}`);
    }
    let path = entry.path;
    const query = new URLSearchParams();
    const supplied = options as unknown as Record<string, Record<string, unknown> | undefined>;
    for (const location of ['path', 'query', 'header']) {
      const values = supplied[location] ?? {};
      for (const name of Object.keys(values)) {
        if (!entry.parameters.some(parameter => parameter.in === location && parameter.name === name)) throw new ApiError('invalid_input');
      }
      for (const parameter of entry.parameters.filter(parameter => parameter.in === location)) {
        const value = values[parameter.name];
        if (value === undefined) {
          if (parameter.required) throw new ApiError('invalid_input');
          continue;
        }
        if (!validates(parameter.validator, value)) throw new ApiError('invalid_input');
        if (location === 'path') path = path.replace(`{${parameter.name}}`, encodeURIComponent(String(value)));
        else if (location === 'query') {
          // Repeated keys for array parameters (style form, explode true).
          if (Array.isArray(value)) for (const item of value) query.append(parameter.name, String(item));
          else query.set(parameter.name, String(value));
        }
        else {
          if (!/^[\x21-\x7E]{1,8192}$/.test(String(value))) throw new ApiError('invalid_input');
          headers.set(parameter.name, String(value));
        }
      }
    }
    let body: string | undefined;
    if (entry.request) {
      try {
        safeWireValues(options.body);
        body = JSON.stringify(options.body);
        if (body === undefined || new TextEncoder().encode(body).length > 8192) throw new Error();
        const copy: unknown = JSON.parse(body);
        safeWireValues(copy);
        if (!validates(entry.request, copy)) throw new Error();
      } catch { throw new ApiError('invalid_input'); }
      headers.set('Content-Type', 'application/json');
    } else if (options.body !== undefined) throw new ApiError('invalid_input');
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.#timeout);
    const signal = AbortSignal.any([controller.signal, options.signal ?? new AbortController().signal]);
    try {
      if (signal.aborted) throw new ApiError('aborted');
      const response = await this.#fetch(this.#origin + path + (query.size ? `?${query}` : ''), {
        method: entry.method, headers, body, signal, credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer',
      });
      if (entry.auth !== 'none' && captured !== scopeKey(this.#session())) throw new ApiError('stale_session');
      const raw = await readBody(response);
      if (signal.aborted) throw new ApiError(timedOut ? 'timeout' : 'aborted');
      if (entry.auth !== 'none' && captured !== scopeKey(this.#session())) throw new ApiError('stale_session');
      const declared = Object.hasOwn(entry.responses, String(response.status));
      if (response.ok && !declared) throw new ApiError('protocol');
      const ref = declared ? entry.responses[String(response.status)] : entry.responses.default;
      const diagnostic = response.headers.get('X-Request-ID') ?? '';
      const requestId = /^[A-Za-z0-9_-]{1,128}$/.test(diagnostic) ? diagnostic : '';
      if (response.status === 204) {
        if (ref !== null || raw !== '') throw new ApiError('protocol');
        return undefined as ResponseBody<K>;
      }
      if (typeof ref !== 'string' || !/^application\/json(?:\s*;|$)/i.test(response.headers.get('Content-Type') ?? '')) throw new ApiError('protocol');
      let parsed: unknown;
      try { parsed = JSON.parse(raw); } catch { throw new ApiError('protocol'); }
      try { safeWireValues(parsed); } catch { throw new ApiError('protocol'); }
      if (!validates(ref, parsed)) throw new ApiError('protocol');
      if (!response.ok) {
        const code = (parsed as { code?: string }).code ?? '';
        const retry = response.headers.get('Retry-After') ?? '';
        const seconds = /^\d{1,6}$/.test(retry) ? Number(retry) : null;
        throw new ApiError('http', response.status, /^[a-z0-9_]{1,100}$/.test(code) ? code : '', requestId, seconds);
      }
      return parsed as ResponseBody<K>;
    } catch (error) {
      if (entry.auth !== 'none' && captured !== scopeKey(this.#session())) throw new ApiError('stale_session');
      if (error instanceof ApiError) throw error;
      throw new ApiError(signal.aborted ? (timedOut ? 'timeout' : 'aborted') : 'network');
    } finally { clearTimeout(timer); }
  }
}
