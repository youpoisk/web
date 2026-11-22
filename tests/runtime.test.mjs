import test from 'node:test';
import assert from 'node:assert/strict';
import { authConfig, bootAuth, changePassword, deleteAccount, signIn, signOut, scrubCallback, startupFailure, AuthConfigError } from '../src/shared/auth/runtime.ts';

const user = { id: '00000000-0000-4000-8000-000000000001', login: 'anton', name: 'Anton', email: 'a@example.invalid' };
function port(over = {}) {
  const calls = [];
  const s = {
    calls, scope: 'guest', user: null, pending: null, done: null,
    businessScope() { return { state: this.scope }; },
    currentUser() { return this.user; },
    pendingSummary() { return this.pending; },
    cancel(state) { calls.push(['cancel', state]); this.pending = null; },
    async authorize(intent, hash) { calls.push(['authorize', intent, hash]); return `https://api.example/auth/authorize?intent=${intent}`; },
    async completeCallback(href) { calls.push(['complete', href]); return this.done; },
    async logout() { calls.push(['logout']); return { result: 'revoked' }; },
    ...over
  };
  return s;
}
function browser(hash = '#/watchlist') {
  const b = { href: 'https://web.example/' + hash, hash, assigned: [], replace() {}, assign(t) { b.assigned.push(t); } };
  return b;
}
const kind = (k) => Object.assign(new Error(k), { kind: k });

test('authConfig uses explicit env or the current page as callback', () => {
  assert.deepEqual(authConfig({}, { origin: 'http://127.0.0.1:5173', pathname: '/' }), { apiOrigin: 'http://127.0.0.1:18080', callback: 'http://127.0.0.1:5173/' });
  assert.deepEqual(authConfig({ VITE_API_ORIGIN: 'https://api.x', VITE_AUTH_CALLBACK: 'https://x.github.io/yp/', PROD: true }, { origin: 'o', pathname: '/p' }), { apiOrigin: 'https://api.x', callback: 'https://x.github.io/yp/' });
  assert.throws(() => authConfig({ PROD: true, VITE_API_ORIGIN: 'https://api.x' }, { origin: 'o', pathname: '/p' }), AuthConfigError);
  assert.throws(() => authConfig({ PROD: true }, { origin: 'o', pathname: '/p' }), (e) => e.kind === 'configuration');
});

test('scrubCallback removes only callback parameters and keeps the route', () => {
  const seen = [];
  scrubCallback({ href: 'https://web.example/?code=x&state=y#/feed', replace: (v) => seen.push(v) });
  scrubCallback({ href: 'https://web.example/?logout=done', replace: (v) => seen.push(v) });
  scrubCallback({ href: 'https://web.example/?password=changed&state=s', replace: (v) => seen.push(v) });
  scrubCallback({ href: 'https://web.example/?account=deleted&state=s', replace: (v) => seen.push(v) });
  scrubCallback({ href: 'https://web.example/#/feed', replace: (v) => seen.push(v) });
  scrubCallback({ href: 'not a url', replace: (v) => seen.push(v) });
  assert.deepEqual(seen, ['https://web.example/#/feed', 'https://web.example/', 'https://web.example/', 'https://web.example/']);
});

test('startup failures have distinct messages', () => {
  assert.match(startupFailure(new AuthConfigError()).message, /настроен/);
  assert.match(startupFailure(kind('protocol')).message, /сброшены/);
  assert.match(startupFailure(kind('storage')).message, /хранение/);
  assert.match(startupFailure(new Error('SecurityError')).message, /хранение/);
});

test('boot completes a callback into an authenticated view', async () => {
  const s = port({ done: { returnHash: '#/' }, scope: 'authenticated', user });
  assert.deepEqual(await bootAuth(s, browser()), { status: 'authenticated', user, message: undefined });
});

test('boot after access_denied keeps the prior state with a notice', async () => {
  const out = port({ done: { returnHash: '#/', outcome: 'logged_out' } });
  assert.equal((await bootAuth(out, browser())).message, undefined);
  const s = port({ done: { returnHash: '#/', outcome: 'access_denied' } });
  assert.deepEqual(await bootAuth(s, browser()), { status: 'guest', user: null, message: 'Вход отменён.' });
  const t = port({ done: { returnHash: '#/', outcome: 'login_required' } });
  assert.equal((await bootAuth(t, browser())).status, 'guest');
});

test('boot restores a remembered account through the broker and abandons stale pending flows', async () => {
  const s = port({ scope: 'recovering', pending: { state: 'S', status: 'pending' } });
  const b = browser('#/ratings');
  assert.deepEqual(await bootAuth(s, b), { status: 'redirecting', user: null });
  assert.deepEqual(s.calls.slice(1), [['cancel', 'S'], ['authorize', 'restore', '#/ratings']]);
  assert.deepEqual(b.assigned, ['https://api.example/auth/authorize?intent=restore']);
  const t = port({ scope: 'recovering' });
  await bootAuth(t, browser(''));
  assert.deepEqual(t.calls.at(-1), ['authorize', 'restore', '#/']);
});

test('boot of a plain guest does nothing', async () => {
  const s = port();
  assert.deepEqual(await bootAuth(s, browser()), { status: 'guest', user: null, message: undefined });
  const auth = port({ scope: 'authenticated', user: null });
  assert.equal((await bootAuth(auth, browser())).status, 'guest');
});

test('boot failures map to user-facing errors without redirects', async () => {
  for (const [k, word] of [['storage', 'хранение'], ['authentication_unavailable', 'хранение'], ['network', 'связаться'], ['timeout', 'связаться'], ['protocol', 'завершить']]) {
    const s = port({ async completeCallback() { throw kind(k); } });
    const b = browser();
    b.href = 'https://web.example/?code=c&state=s';
    const cleaned = [];
    b.replace = (v) => cleaned.push(v);
    const view = await bootAuth(s, b);
    assert.deepEqual(cleaned, ['https://web.example/']);
    assert.equal(view.status, 'error');
    assert.match(view.message, new RegExp(word));
  }
  const odd = port({ async completeCallback() { throw 'plain'; } });
  assert.equal((await bootAuth(odd, browser())).status, 'error');
});

test('signIn cancels an abandoned flow and navigates to the broker', async () => {
  const s = port({ pending: { state: 'P', status: 'expired' } });
  const b = browser();
  assert.deepEqual(await signIn(s, b, 'register', '#/feed'), { status: 'redirecting', user: null });
  assert.deepEqual(s.calls, [['cancel', 'P'], ['authorize', 'register', '#/feed']]);
  assert.equal(b.assigned.length, 1);
  const t = port();
  await signIn(t, browser(), 'login', 'bad');
  assert.deepEqual(t.calls, [['authorize', 'login', '#/']]);
  await signIn(t, browser(), 'login');
  assert.deepEqual(t.calls.at(-1), ['authorize', 'login', '#/']);
  const u = port({ async authorize() { throw kind('crypto'); } });
  assert.equal((await signIn(u, browser(), 'login')).status, 'error');
});

test('signOut reports server logout or hands off to the broker cookie logout', async () => {
  assert.equal((await signOut(port(), browser())).message, undefined);
  const b = browser();
  assert.deepEqual(await signOut(port({ async logout() { return { result: 'broker', url: 'https://api.example/auth/logout?x' }; } }), b), { status: 'redirecting', user: null });
  assert.deepEqual(b.assigned, ['https://api.example/auth/logout?x']);
  const failed = await signOut(port({ async logout() { throw kind('storage'); } }), browser());
  assert.equal(failed.status, 'error');
  assert.match(failed.message, /Не удалось выйти/);
});

test('password change opens the API page and boot maps its outcomes to notices', async () => {
  const s = port({ passwordURL(hash) { this.calls.push(['password', hash]); return 'https://api.example/auth/password?x=1'; } });
  const b = browser('#/settings');
  assert.deepEqual(changePassword(s, b, '#/settings'), { status: 'redirecting', user: null });
  assert.deepEqual(s.calls, [['password', '#/settings']]);
  assert.deepEqual(b.assigned, ['https://api.example/auth/password?x=1']);
  changePassword(s, b);
  assert.deepEqual(s.calls.at(-1), ['password', '#/settings']);
  const broken = port({ passwordURL() { throw kind('storage'); } });
  assert.match(changePassword(broken, browser(), 'bad').message, /смену пароля/);
  for (const [outcome, text] of [['password_changed', null], ['password_uncertain', /подтвердить/], ['password_session', /Сессия завершилась/]]) {
    const view = await bootAuth(port({ done: { returnHash: '#/', outcome } }), browser());
    assert.equal(view.status, 'guest');
    if(text)assert.match(view.message, text);else assert.equal(view.message, undefined);
  }
});

test('account deletion opens the API page and boot maps its outcomes to notices', async () => {
  const s = port({ deleteAccountURL(hash) { this.calls.push(['delete', hash]); return 'https://api.example/auth/delete?x=1'; } });
  const b = browser('#/settings');
  assert.deepEqual(deleteAccount(s, b, '#/settings'), { status: 'redirecting', user: null });
  assert.deepEqual(b.assigned, ['https://api.example/auth/delete?x=1']);
  deleteAccount(s, b);
  assert.deepEqual(s.calls.at(-1), ['delete', '#/settings']);
  assert.match(deleteAccount(port({ deleteAccountURL() { throw kind('crypto'); } }), browser(), 'bad').message, /удаление аккаунта/);
  for (const [outcome, text] of [['account_deleted', null], ['account_uncertain', /подтвердить удаление/], ['account_session', /удалить аккаунт/]]) {
    const view = await bootAuth(port({ done: { returnHash: '#/', outcome } }), browser());
    assert.equal(view.status, 'guest');
    if(text)assert.match(view.message, text);else assert.equal(view.message, undefined);
  }
});

