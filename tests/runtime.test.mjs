import test from 'node:test';
import assert from 'node:assert/strict';
import { authConfig, bootAuth, signIn, signOut } from '../src/shared/auth/runtime.ts';

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
    async logout() { calls.push(['logout']); return 'revoked'; },
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
  assert.deepEqual(authConfig({ VITE_API_ORIGIN: 'https://api.x', VITE_AUTH_CALLBACK: 'https://x.github.io/yp/' }, { origin: 'o', pathname: '/p' }), { apiOrigin: 'https://api.x', callback: 'https://x.github.io/yp/' });
});

test('boot completes a callback into an authenticated view', async () => {
  const s = port({ done: { returnHash: '#/' }, scope: 'authenticated', user });
  assert.deepEqual(await bootAuth(s, browser()), { status: 'authenticated', user, message: undefined });
});

test('boot after access_denied keeps the prior state with a notice', async () => {
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
    const view = await bootAuth(s, browser());
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

test('signOut reports server or local-only logout and maps failures', async () => {
  assert.match((await signOut(port())).message, /вышли из аккаунта/);
  assert.match((await signOut(port({ async logout() { return 'local'; } }))).message, /на этом устройстве/);
  assert.equal((await signOut(port({ async logout() { throw kind('storage'); } }))).status, 'error');
});
