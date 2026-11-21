import { PendingFlow, FlowError, authorizationURL } from './flow.ts';
import { CodeExchange } from './exchange.ts';
import type { ExchangeResult } from './exchange.ts';
import { ApiError } from '../api/client.ts';
import type { SessionScope } from '../api/client.ts';
import type { components } from '../api/schema';

type Scope = { owner: string | null; epoch: string };
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;
type Crypto = Pick<globalThis.Crypto, 'randomUUID' | 'getRandomValues' | 'subtle'>;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

/** Per-tab browser coordinator. Durable scope is NOT authentication. Native
 * cookie recovery/navigation and server-side logout are separate adapters. */
export class BrowserSession {
  readonly #storage: Storage;
  readonly #crypto: Crypto;
  readonly #clearPrivate: () => void;
  readonly #key: string;
  readonly #flow: PendingFlow;
  readonly #exchange: CodeExchange;
  readonly #api: string;
  readonly #callback: string;
  readonly #flowStorage: Storage;
  readonly #fetch: typeof fetch;
  readonly #timeout: number;
  #scope: Scope = { owner: null, epoch: '' };
  #credentials: components['schemas']['WebCredentials'] | null = null;
  #blocked = false;
  #reference: string | null = null;
  constructor(config: { storage: Storage; flowStorage?: Storage; crypto: Crypto; clock: () => number; apiOrigin: string; callback: string; clearPrivate: () => void; fetch?: typeof fetch; timeoutMs?: number }) {
    this.#storage = config.storage; this.#crypto = config.crypto; this.#clearPrivate = config.clearPrivate;
    this.#api = config.apiOrigin; this.#fetch = config.fetch ?? ((input, init) => globalThis.fetch(input, init)); this.#timeout = config.timeoutMs ?? 10000;
    // PKCE state is per tab (sessionStorage in the browser) so tabs never cancel
    // each other's sign-in; only the non-secret scope reference is shared.
    this.#callback = config.callback; this.#flowStorage = config.flowStorage ?? config.storage;
    this.#flow = new PendingFlow({ ...config, storage: this.#flowStorage, scope: () => this.#identity() });
    this.#exchange = new CodeExchange({ flow: this.#flow, fetch: config.fetch, timeoutMs: config.timeoutMs });
    this.#key = `yp.auth.scope.v1:${config.apiOrigin}:${encodeURIComponent(config.callback)}`;
    let raw: string | null;
    try { raw = this.#storage.getItem(this.#key); } catch { throw new FlowError('storage'); }
    this.#reference = raw;
    if (raw === null) {
      this.#scope = { owner: null, epoch: this.#epoch() };
      this.#save(this.#scope);
    } else {
      try {
        if (raw.length > 1024) throw new Error();
        const value = JSON.parse(raw);
        if (!value || Object.keys(value).length !== 3 || value.version !== 1 || typeof value.epoch !== 'string' || !uuid.test(value.epoch) ||
            (value.owner !== null && (typeof value.owner !== 'string' || !uuid.test(value.owner)))) throw new Error();
        this.#scope = { owner: value.owner, epoch: value.epoch };
      } catch { throw new FlowError('protocol'); }
    }
  }
  #epoch(): string {
    try { const value = this.#crypto.randomUUID(); if (!uuid.test(value)) throw new Error(); return value; }
    catch { throw new FlowError('crypto'); }
  }
  #save(scope: Scope): void {
    try { const raw = JSON.stringify({ version: 1, owner: scope.owner, epoch: scope.epoch }); this.#storage.setItem(this.#key, raw); this.#reference = raw; }
    catch { this.#blocked = true; this.#credentials = null; throw new FlowError('storage'); }
  }
  #identity(): Scope {
    if (this.#blocked) throw new ApiError('authentication_unavailable');
    let raw: string | null;
    try { raw = this.#storage.getItem(this.#key); }
    catch { this.#blocked = true; this.#credentials = null; this.#clear(); throw new FlowError('storage'); }
    if (raw !== this.#reference) {
      this.#blocked = true; this.#credentials = null; this.#clear(); throw new ApiError('stale_session');
    }
    return { ...this.#scope };
  }
  #clear(): void {
    try { this.#clearPrivate(); }
    catch { this.#blocked = true; this.#credentials = null; throw new ApiError('authentication_unavailable'); }
  }
  #current(result: ExchangeResult): void {
    const scope = this.#identity();
    const pending = this.#flow.pendingSummary();
    if (scope.owner !== result.scope.owner || scope.epoch !== result.scope.epoch || !pending || pending.state !== result.state || pending.status !== 'pending') throw new ApiError('stale_session');
  }
  businessScope(): SessionScope {
    const scope = this.#identity();
    if (this.#credentials) return { state: 'authenticated', owner: this.#credentials.user.id, epoch: scope.epoch, accessToken: this.#credentials.access_token };
    return scope.owner === null ? { state: 'guest' } : { state: 'recovering', owner: scope.owner, epoch: scope.epoch };
  }
  currentUser(): Readonly<components['schemas']['User']> | null {
    try { this.#identity(); } catch { return null; }
    return this.#credentials ? { ...this.#credentials.user } : null;
  }
  pendingSummary() { this.#identity(); return this.#flow.pendingSummary(); }
  cancel(state: string) { this.#identity(); return this.#flow.cancel(state); }
  async start(intent: 'restore' | 'login' | 'register', returnHash: string): Promise<URLSearchParams> {
    this.#identity();
    const params = await this.#flow.begin(intent, returnHash);
    this.#credentials = null;
    this.#clear();
    return params;
  }
  /** Starts a flow and returns the broker page URL for top-level navigation. */
  async authorize(intent: 'restore' | 'login' | 'register', returnHash: string): Promise<string> {
    return authorizationURL(this.#api, await this.start(intent, returnHash));
  }
  get #logoutKey(): string { return `yp.auth.logout.v1:${this.#api}:${encodeURIComponent(this.#callback)}`; }
  /** Return from the broker logout page. Scrubs first; the message is shown only
   * for this tab's own logout nonce. A forged return cannot sign anyone in. */
  #captureLogout(rawURL: string, replaceURL: (clean: string) => void): boolean | null {
    let url: URL;
    try { url = new URL(rawURL); } catch { return null; }
    if (!url.searchParams.has('logout')) return null;
    replaceURL(url.origin + url.pathname);
    let expected: string | null = null;
    try { expected = this.#flowStorage.getItem(this.#logoutKey); this.#flowStorage.removeItem(this.#logoutKey); } catch { expected = null; }
    return expected !== null && url.searchParams.get('logout') === 'done' && url.searchParams.getAll('state').length === 1 && url.searchParams.get('state') === expected;
  }
  async completeCallback(rawURL: string, replaceURL: (clean: string) => void, signal?: AbortSignal): Promise<{ returnHash: string; outcome?: 'login_required' | 'access_denied' | 'logged_out' } | null> {
    const logout = this.#captureLogout(rawURL, replaceURL);
    if (logout !== null) return logout ? { returnHash: '#/', outcome: 'logged_out' } : null;
    this.#identity();
    const denied = this.#flow.captureDenied(rawURL, replaceURL);
    if (denied) {
      const live = this.#flow.pendingSummary()!.status === 'pending';
      this.#flow.cancel(denied.pending.state);
      // Only a current restore that found no live first-party session demotes
      // the remembered owner to guest. A stale/expired flow changes nothing.
      if (live && denied.error === 'login_required' && denied.pending.intent === 'restore') {
        const next = { owner: null, epoch: this.#epoch() };
        this.#credentials = null;
        this.#clear();
        this.#save(next);
        this.#scope = next;
      }
      return { returnHash: denied.pending.returnHash, outcome: denied.error };
    }
    const result = await this.#exchange.exchangeCallback(rawURL, replaceURL, signal);
    if (!result) return null;
    this.#current(result);
    // Keep the generation only when a restore returned the remembered account.
    const restore = this.#flow.pendingSummary()!.intent === 'restore' && result.scope.owner !== null && result.credentials.user.id === result.scope.owner;
    const next = { owner: result.credentials.user.id, epoch: restore ? result.scope.epoch : this.#epoch() };
    this.#credentials = null;
    this.#clear();
    this.#current(result);
    // Everything after this check is synchronous. Storage failures discard
    // credentials; a fresh first-party flow can recover without a password.
    this.#flow.acknowledge(result.state);
    this.#save(next);
    this.#scope = next;
    this.#credentials = { ...result.credentials, user: { ...result.credentials.user } };
    return { returnHash: result.returnHash };
  }
  markRecovering(): void {
    this.#identity(); this.#credentials = null; this.#clear();
  }
  /** Revokes the current API session with its bearer, then clears local state.
   * Network/401/503 outcomes still forget locally; a surviving cookie family
   * is either already revoked or replaced by the next login. */
  async logout(): Promise<{ result: 'revoked' } | { result: 'broker'; url: string }> {
    const token = this.#credentials?.access_token ?? null;
    let revoked = false;
    if (token) {
      try {
        const response = await this.#fetch(`${this.#api}/v1/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'omit', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(this.#timeout) });
        revoked = response.status === 204;
      } catch { /* fall back to the cookie-based broker logout */ }
    }
    // Local forget failures must not keep a live server session: forgetLocal
    // already blocks this coordinator before it throws.
    try { this.forgetLocal(); } catch { /* still revoke server-side below */ }
    if (revoked) return { result: 'revoked' };
    // Expired/absent bearer or network failure: the HttpOnly cookie family may
    // still be live. The first-party page revokes it by its own cookie. The
    // nonce only controls the "logged out" notice; losing it never blocks logout.
    const bytes = new Uint8Array(32);
    try { this.#crypto.getRandomValues(bytes); } catch { globalThis.crypto.getRandomValues(bytes); }
    const state = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    try { this.#flowStorage.setItem(this.#logoutKey, state); } catch { /* notice lost, logout continues */ }
    return { result: 'broker', url: `${this.#api}/auth/logout?${new URLSearchParams({ redirect_uri: this.#callback, state })}` };
  }
  /** Local privacy boundary only. Does not revoke an API session/cookie. */
  forgetLocal(): void {
    this.#credentials = null;
    let state: string | undefined;
    let readError: unknown;
    try { this.#identity(); state = this.#flow.pendingSummary()?.state; }
    catch (error) { readError = error; }
    // Block late callbacks even when crypto/storage/cache invalidation fails.
    this.#blocked = true;
    this.#clear();
    if (readError) throw readError;
    const next = { owner: null, epoch: this.#epoch() };
    if (state) this.#flow.cancel(state);
    this.#save(next);
    this.#scope = next;
    this.#blocked = false;
  }
}
