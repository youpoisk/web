import type { components } from '../api/schema';

type User = components['schemas']['User'];
type Intent = 'login' | 'register';
type Scope = { state: 'guest' } | { state: 'recovering' } | { state: 'authenticated' };
/** Narrow view of BrowserSession used by the UI runtime (eases testing). */
export type SessionPort = {
  businessScope(): Scope;
  currentUser(): Readonly<User> | null;
  pendingSummary(): { state: string; status: 'pending' | 'expired' | 'stale' } | null;
  cancel(state: string): unknown;
  authorize(intent: 'restore' | Intent, returnHash: string): Promise<string>;
  completeCallback(rawURL: string, replaceURL: (clean: string) => void): Promise<{ returnHash: string; outcome?: 'login_required' | 'access_denied' | 'logged_out' | 'password_changed' | 'password_uncertain' | 'password_session' } | null>;
  passwordURL(returnHash: string): string;
  logout(): Promise<{ result: 'revoked' } | { result: 'broker'; url: string }>;
};
export type AuthView =
  | { status: 'loading' | 'guest' | 'redirecting'; user: null; message?: string }
  | { status: 'authenticated'; user: Readonly<User>; message?: string }
  | { status: 'error'; user: null; message: string };
export type Browser = { href: string; hash: string; replace: (clean: string) => void; assign: (target: string) => void };

const route = (hash: string) => (hash.startsWith('#/') ? hash : '#/');

export class AuthConfigError extends Error {
  readonly kind = 'configuration';
  constructor() { super('Authorization configuration missing'); this.name = 'AuthConfigError'; }
}

/** Local defaults exist only for development; production must be explicit. */
export function authConfig(env: Record<string, string | boolean | undefined>, location: { origin: string; pathname: string }) {
  const api = typeof env.VITE_API_ORIGIN === 'string' ? env.VITE_API_ORIGIN : '';
  const callback = typeof env.VITE_AUTH_CALLBACK === 'string' ? env.VITE_AUTH_CALLBACK : '';
  if (env.PROD === true && (!api || !callback)) throw new AuthConfigError();
  return { apiOrigin: api || 'http://127.0.0.1:18080', callback: callback || location.origin + location.pathname };
}

/** Removes callback/broker parameters left in the address bar after a failure. */
export function scrubCallback(browser: Pick<Browser, 'href' | 'replace'>): void {
  let url: URL;
  try { url = new URL(browser.href); } catch { return; }
  if (['code', 'state', 'error', 'logout', 'password'].some((key) => url.searchParams.has(key))) browser.replace(url.origin + url.pathname + url.hash);
}

export function startupFailure(error: unknown): AuthView {
  const kind = error && typeof error === 'object' && 'kind' in error ? String((error as { kind: unknown }).kind) : '';
  if (kind === 'configuration') return { status: 'error', user: null, message: 'Вход временно недоступен: сайт неверно настроен.' };
  if (kind === 'protocol') return { status: 'error', user: null, message: 'Данные входа на этом устройстве повреждены и были сброшены. Войдите снова.' };
  // A constructor error without a kind means the browser refused storage outright.
  if (kind === '') return failure({ kind: 'storage' });
  return failure(error);
}

function settled(session: SessionPort, message?: string): AuthView {
  const user = session.currentUser();
  if (session.businessScope().state === 'authenticated' && user) return { status: 'authenticated', user, message };
  return { status: 'guest', user: null, message };
}

function failure(error: unknown): AuthView {
  const kind = error && typeof error === 'object' && 'kind' in error ? String((error as { kind: unknown }).kind) : '';
  const message = kind === 'storage' || kind === 'authentication_unavailable'
    ? 'Браузер не разрешает сохранить состояние входа. Разрешите хранение данных для сайта и обновите страницу.'
    : kind === 'network' || kind === 'timeout'
      ? 'Не удалось связаться с сервером входа. Нажмите «Войти», чтобы повторить.'
      : 'Не удалось завершить вход. Нажмите «Войти», чтобы попробовать ещё раз.';
  return { status: 'error', user: null, message };
}

/** Page start: finish a callback if present, otherwise silently restore a
 * remembered account through the broker. Never loops: a broker refusal
 * demotes the scope to guest and stops. */
export async function bootAuth(session: SessionPort, browser: Browser): Promise<AuthView> {
  try {
    const done = await session.completeCallback(browser.href, browser.replace);
    if (done) {
      if (done.outcome === 'access_denied') return settled(session, 'Вход отменён.');
      if (done.outcome === 'logged_out') return settled(session, 'Вы вышли из аккаунта.');
      if (done.outcome === 'password_changed') return settled(session, 'Пароль изменён. Все входы завершены — войдите с новым паролем.');
      if (done.outcome === 'password_uncertain') return settled(session, 'Не удалось подтвердить смену пароля. Войдите снова: если смена прошла, подойдёт новый пароль.');
      if (done.outcome === 'password_session') return settled(session, 'Сессия завершилась. Войдите снова, чтобы сменить пароль.');
      return settled(session);
    }
    const pending = session.pendingSummary();
    // Returning without a callback (Back button, closed broker tab) abandons the flow.
    if (pending) session.cancel(pending.state);
    if (session.businessScope().state === 'recovering') {
      browser.assign(await session.authorize('restore', route(browser.hash)));
      return { status: 'redirecting', user: null };
    }
    return settled(session);
  } catch (error) {
    scrubCallback(browser);
    return failure(error);
  }
}

export async function signIn(session: SessionPort, browser: Browser, intent: Intent, returnHash = '#/'): Promise<AuthView> {
  try {
    const pending = session.pendingSummary();
    if (pending) session.cancel(pending.state);
    browser.assign(await session.authorize(intent, route(returnHash)));
    return { status: 'redirecting', user: null };
  } catch (error) {
    return failure(error);
  }
}

/** Opens the API-origin password page; the site never handles passwords. */
export function changePassword(session: SessionPort, browser: Browser, returnHash = '#/settings'): AuthView {
  try {
    browser.assign(session.passwordURL(route(returnHash)));
    return { status: 'redirecting', user: null };
  } catch {
    return { status: 'error', user: null, message: 'Не удалось открыть смену пароля. Обновите страницу и попробуйте ещё раз.' };
  }
}

export async function signOut(session: SessionPort, browser: Browser): Promise<AuthView> {
  try {
    const outcome = await session.logout();
    if (outcome.result === 'broker') {
      // The bearer could not revoke (expired or offline): the first-party page
      // revokes the cookie family by its own cookie, then returns here.
      browser.assign(outcome.url);
      return { status: 'redirecting', user: null };
    }
    return { status: 'guest', user: null, message: 'Вы вышли из аккаунта.' };
  } catch {
    return { status: 'error', user: null, message: 'Не удалось выйти. Обновите страницу и нажмите «Выйти» ещё раз.' };
  }
}
