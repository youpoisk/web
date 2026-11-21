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
  completeCallback(rawURL: string, replaceURL: (clean: string) => void): Promise<{ returnHash: string; outcome?: 'login_required' | 'access_denied' } | null>;
  logout(): Promise<'revoked' | 'local'>;
};
export type AuthView =
  | { status: 'loading' | 'guest' | 'redirecting'; user: null; message?: string }
  | { status: 'authenticated'; user: Readonly<User>; message?: string }
  | { status: 'error'; user: null; message: string };
export type Browser = { href: string; hash: string; replace: (clean: string) => void; assign: (target: string) => void };

const route = (hash: string) => (hash.startsWith('#/') ? hash : '#/');

export function authConfig(env: Record<string, string | undefined>, location: { origin: string; pathname: string }) {
  return {
    apiOrigin: env.VITE_API_ORIGIN || 'http://127.0.0.1:18080',
    callback: env.VITE_AUTH_CALLBACK || location.origin + location.pathname
  };
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
      ? 'Не удалось связаться с сервером входа. Обновите страницу, чтобы повторить.'
      : 'Не удалось завершить вход. Обновите страницу и попробуйте ещё раз.';
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

export async function signOut(session: SessionPort): Promise<AuthView> {
  try {
    const result = await session.logout();
    return { status: 'guest', user: null, message: result === 'revoked' ? 'Вы вышли из аккаунта.' : 'Вы вышли на этом устройстве. Сервер был недоступен, сессия завершится автоматически.' };
  } catch (error) {
    return failure(error);
  }
}
