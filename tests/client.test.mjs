import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient, ApiError } from '../src/shared/api/client.ts';
const id = '00000000-0000-4000-8000-000000000001';
const user = { id, login: 'test_user', name: 'Owner', email: 'owner@example.invalid' };
const signed = { state: 'authenticated', owner: id, epoch: 'one', accessToken: 'aaa.bbb.ccc' };
const guest = { state: 'guest' };
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', ...headers } });
const error = (status, headers) => json({ code: 'conflict', message: 'private message must not be copied', field_errors: {}, request_id: 'request' }, status, headers);
const fail = kind => exception => exception instanceof ApiError && exception.kind === kind;
const client = (fetch, session = () => signed, timeoutMs = 1000) => new ApiClient({ baseUrl: 'https://api.example.invalid', fetch, session, timeoutMs });

test('fixed origin configuration and bounded timeout', () => {
  for (const baseUrl of ['bad', 'http://evil.invalid', 'https://user:pass@example.com', 'https://example.com/p', 'https://example.com?', 'https://example.com#', 'file:///']) {
    assert.throws(() => new ApiClient({ baseUrl, session: () => guest }), fail('configuration'));
  }
  for (const baseUrl of ['http://localhost:18080', 'http://127.0.0.1:18080', 'http://[::1]:18080', 'https://example.com/']) {
    assert.ok(new ApiClient({ baseUrl, session: () => guest }));
  }
  for (const timeoutMs of [0, 120001, 1.5]) assert.throws(() => client(async () => json(user), undefined, timeoutMs), fail('configuration'));
});

test('private request uses captured bearer and browser-safe fetch flags', async () => {
  const c = client(async (url, options) => {
    assert.equal(url, 'https://api.example.invalid/v1/me');
    assert.equal(options.headers.get('Authorization'), 'Bearer aaa.bbb.ccc');
    assert.equal(options.headers.get('Content-Type'), null);
    assert.equal(options.credentials, 'omit'); assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store'); assert.equal(options.referrerPolicy, 'no-referrer');
    return json(user);
  });
  assert.deepEqual(await c.request('getMe', {}), user);
});

test('guest probes omit auth; no hidden guest fallback for private/recovering reads', async () => {
  const c = client(async (_, options) => {
    assert.equal(options.headers.has('Authorization'), false);
    return json({ status: 'ok' });
  }, () => guest);
  assert.deepEqual(await c.request('health', {}), { status: 'ok' });
  await assert.rejects(c.request('getMe', {}), fail('authentication_unavailable'));
  const recovering = client(async () => { throw new Error('must not fetch'); }, () => ({ state: 'recovering', owner: id, epoch: 'one' }));
  await assert.rejects(recovering.request('getVideoCard', { path: { id } }), fail('authentication_unavailable'));
  await assert.rejects(client(async () => json(user), () => ({ ...signed, accessToken: 'bad\ntoken' })).request('getMe', {}), fail('authentication_unavailable'));
  await assert.rejects(c.request('missing', {}), fail('invalid_input'));
  await assert.rejects(c.request('__proto__', {}), fail('invalid_input'));
  await assert.rejects(c.request('loginAccount', { body: {} }), fail('invalid_input'));
});

test('array query parameters repeat their key; public search works while recovering', async () => {
  const urls = [];
  const recovering = client(async (url, options) => { urls.push([url, options.headers.get('Authorization')]); return json({ items: [] }); }, () => ({ state: 'recovering', owner: id, epoch: 'one' }));
  await recovering.request('searchVideos', { query: { q: 'кот', tag: ['a', 'b'], match: 'all', sort: 'top', limit: 5 } });
  assert.deepEqual(urls, [['https://api.example.invalid/v1/videos?q=%D0%BA%D0%BE%D1%82&tag=a&tag=b&match=all&sort=top&limit=5', null]]);
  await assert.rejects(recovering.request('searchVideos', { query: { tag: Array(11).fill('a') } }), fail('invalid_input'));
});

test('path/query/header validation and immutable write serialization', async () => {
  const c = client(async (url, options) => {
    if (options.method === 'GET') {
      assert.equal(url, 'https://api.example.invalid/v1/me/sessions?limit=10');
      return json({ items: [] });
    }
    assert.equal(url, `https://api.example.invalid/v1/me/videos/${id}/state`);
    assert.equal(options.headers.get('Idempotency-Key'), id);
    assert.equal(options.headers.get('X-Offline-Lease'), 'lease');
    assert.equal(options.body, '{"expected_revision":0,"rating":8}');
    return json({ kind: 'video_state', target_id: id, state: { revision: 1, added: false, later: false, rating: 8 }, change_seq: 1 });
  });
  await c.request('listSessions', { query: { limit: 10 } });
  await c.request('patchVideoState', { path: { id }, header: { 'Idempotency-Key': id, 'X-Offline-Lease': 'lease' }, body: { expected_revision: 0, rating: 8 } });
  for (const options of [{}, { path: { id: '..' } }, { path: { id, extra: 'bad' } }]) {
    await assert.rejects(c.request('getVideoState', options), fail('invalid_input'));
  }
  for (const options of [{ path: { id }, body: {} }, { path: { id }, header: { 'Idempotency-Key': 'bad' }, body: {} }, { path: { id }, header: { 'Idempotency-Key': id, 'X-Offline-Lease': 'bad\nvalue' }, body: {} }]) {
    await assert.rejects(c.request('patchVideoState', options), fail('invalid_input'));
  }
  for (const body of [undefined, { expected_revision: 2 ** 60 }, { expected_revision: 0, rating: Infinity }, { expected_revision: 0, title: 'x'.repeat(9000) }, { expected_revision: 0, rating: 50 }, { expected_revision: 1n }]) {
    await assert.rejects(c.request('addObservedVideo', { header: { 'Idempotency-Key': id }, body }), fail('invalid_input'));
  }
  for (const rating of [Infinity, -Infinity, NaN]) {
    await assert.rejects(c.request('addObservedVideo', { header: { 'Idempotency-Key': id }, body: { youtube_video_id: 'AbCdEf_12-3', expected_revision: 0, rating } }), fail('invalid_input'));
  }
  await assert.rejects(c.request('getMe', { body: {} }), fail('invalid_input'));
});

test('204 is empty; statuses/errors retain safe diagnostics without secret bodies or retries', async () => {
  assert.equal(await client(async () => new Response(null, { status: 204 })).request('logoutCurrentSession', {}), undefined);
  for (const status of [401, 403, 409, 410, 429, 503]) {
    let calls = 0;
    const c = client(async () => { calls++; return error(status, { 'X-Request-ID': 'safe_request', 'Retry-After': '60' }); });
    await assert.rejects(c.request('getMe', {}), exception => {
      assert.equal(exception.kind, 'http'); assert.equal(exception.status, status);
      assert.equal(exception.code, 'conflict'); assert.equal(exception.requestId, 'safe_request');
      assert.equal(exception.retryAfterSeconds, 60);
      assert.equal(JSON.stringify(exception).includes('private message'), false);
      return true;
    });
    assert.equal(calls, 1);
  }
  await assert.rejects(client(async () => error(429, { 'Retry-After': 'tomorrow', 'X-Request-ID': 'invalid token value' })).request('getMe', {}), exception => exception.retryAfterSeconds === null && exception.requestId === '');
  await assert.rejects(client(async () => json({ code: 'UPPER', message: '', field_errors: {}, request_id: 'id' }, 400)).request('getMe', {}), exception => exception.code === '');
});

test('invalid success/body/schema/numbers/UTF8 fail closed', async () => {
  const responses = [json(user, 201), new Response('{}', { status: 200 }), new Response('not json', { headers: { 'Content-Type': 'application/json' } }), json({ ...user, refresh_token: 'secret' }), new Response(new Uint8Array([255]), { headers: { 'Content-Type': 'application/json' } }), new Response('x'.repeat(262145), { headers: { 'Content-Type': 'application/json' } }), new Response(null, { status: 200, headers: { 'Content-Type': 'application/json' } })];
  for (const response of responses) await assert.rejects(client(async () => response).request('getMe', {}), fail('protocol'));
  await assert.rejects(client(async () => new Response(null, { status: 204 })).request('getMe', {}), fail('protocol'));
  await assert.rejects(client(async () => json({ kind: 'video_state', target_id: id, state: { revision: 2 ** 60, added: false, later: false, rating: null }, change_seq: null })).request('getVideoState', { path: { id } }), fail('protocol'));
});

test('escaped Unicode must contain scalar values in both keys and values', async () => {
  for (const name of ['\uD800', '\uDC00']) {
    await assert.rejects(client(async () => json({ ...user, name })).request('getMe', {}), fail('protocol'));
    await assert.rejects(client(async () => json(user)).request('addObservedVideo', {
      header: { 'Idempotency-Key': id }, body: { youtube_video_id: 'AbCdEf_12-3', expected_revision: 0, title: name },
    }), fail('invalid_input'));
  }
  const malformedKeys = { code: 'invalid', message: '', field_errors: { ['\uD800']: 'invalid' }, request_id: 'id' };
  await assert.rejects(client(async () => json(malformedKeys, 422)).request('getMe', {}), fail('protocol'));
  for (const name of ['😀', '\uFFFD']) {
    assert.equal((await client(async () => json({ ...user, name })).request('getMe', {})).name, name);
  }
});

test('late success or failure from another account is discarded', async () => {
  for (const reject of [false, true]) {
    let scope = signed;
    const c = client(async () => { scope = { ...signed, owner: 'different' }; if (reject) throw new Error(); return json(user); }, () => scope);
    await assert.rejects(c.request('getMe', {}), fail('stale_session'));
  }
  let scope = signed;
  const response = json(user);
  const c = client(async () => {
    const reader = response.body.getReader();
    return new Response(new ReadableStream({ async pull(controller) {
      const value = await reader.read();
      scope = { ...signed, epoch: 'new' };
      if (value.done) controller.close(); else controller.enqueue(value.value);
    } }), { headers: { 'Content-Type': 'application/json' } });
  }, () => scope);
  await assert.rejects(c.request('getMe', {}), fail('stale_session'));
});

test('abort, timeout and network failures stay distinct', async () => {
  const pending = async (_, options) => new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('cancelled')), { once: true }));
  const aborted = new AbortController(); aborted.abort();
  await assert.rejects(client(pending).request('getMe', { signal: aborted.signal }), fail('aborted'));
  const controller = new AbortController();
  const request = client(pending).request('getMe', { signal: controller.signal }); controller.abort();
  await assert.rejects(request, fail('aborted'));
  await assert.rejects(client(pending, undefined, 2).request('getMe', {}), fail('timeout'));
  await assert.rejects(client(async () => { throw new TypeError('private body must not appear'); }).request('getMe', {}), exception => fail('network')(exception) && !exception.message.includes('private'));
});

test('default transport calls the global fetch unbound, as browsers require', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = function () { if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation'); return Promise.resolve(json(user)); };
  try { assert.deepEqual(await new ApiClient({ baseUrl: 'https://api.example.invalid', session: () => signed }).request('getMe', {}), user); }
  finally { globalThis.fetch = original; }
});

test('avatar upload validates binary input and transmits expected revision', async () => {
 const png = new Blob(['image'], {type:'image/png'});
 const state = {revision:1,etag:'ab'.repeat(32)};
 const c=client(async(url,options)=>{assert.equal(url,'https://api.example.invalid/v1/me/avatar');assert.equal(options.headers.get('If-Match'),'"0"'); assert.equal(options.body,png);return json(state);});
 assert.deepEqual(await c.uploadAvatar(png,0),state);
 for(const [blob,rev] of [[new Blob([],{type:'image/png'}),0],[new Blob(['x'],{type:'image/gif'}),0],[new Blob([new Uint8Array(2097153)],{type:'image/png'}),0],[png,-1],[png,1.5],[png,Number.MAX_SAFE_INTEGER]]) await assert.rejects(c.uploadAvatar(blob,rev),fail('invalid_input'));
 for(const scope of [guest,{...signed,accessToken:'bad\ntoken'}]) await assert.rejects(client(async()=>json(state),()=>scope).uploadAvatar(png,0),fail('authentication_unavailable'));
 for(const response of [new Response(null),new Response('bad',{headers:{'Content-Type':'text/plain'}}),json({wrong:true}),new Response('not json',{headers:{'Content-Type':'application/json'}}),new Response(new Uint8Array(262145)),error(409)]) {
  await assert.rejects(client(async()=>response).uploadAvatar(png,0),fail(response.status===409?'http':'protocol'));
 }
 let scope=signed;
 await assert.rejects(client(async()=>{scope={...signed,epoch:'changed'};return json(state);},()=>scope).uploadAvatar(png,0),fail('stale_session'));
 scope=signed;
 await assert.rejects(client(async()=>{scope=guest;throw Error('changed');},()=>scope).uploadAvatar(png,0),fail('stale_session'));
 const pending=async(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Error('cancelled')),{once:true}));
 const aborted=new AbortController();aborted.abort();
 await assert.rejects(client(pending).uploadAvatar(png,0,aborted.signal),fail('aborted'));
 await assert.rejects(client(pending,undefined,2).uploadAvatar(png,0),fail('timeout'));
 await assert.rejects(client(async()=>{throw Error('network');}).uploadAvatar(png,0),fail('network'));
 const cancelled=new AbortController();
 await assert.rejects(client(async()=>{cancelled.abort();return json(state);}).uploadAvatar(png,0,cancelled.signal),fail('aborted'));
});
test('avatar links stay on the trusted image endpoint and hide absent images', async()=>{
 const path=`/v1/users/${id}/avatar?token=abc.def`;
 assert.equal(await client(async()=>json({avatar_url:path,revision:1})).avatar(id),'https://api.example.invalid'+path);
 assert.equal(await client(async()=>error(404)).avatar(id),null);
 await assert.rejects(client(async()=>error(403)).avatar(id),fail('http'));
 await assert.rejects(client(async()=>json({})).avatar('invalid'),fail('invalid_input'));
 for(const avatar_url of ['https://evil.invalid'+path,`/v1/users/${id}/other?token=x`,path+'#x',path+'&extra=x',`/v1/users/${id}/avatar?token=`, `https://user:pass@api.example.invalid${path}`,path+'&token=z']) await assert.rejects(client(async()=>json({avatar_url,revision:1})).avatar(id),fail('protocol'));
});

test('avatar scope changes with account epoch and malformed links/status fail closed',async()=>{let scope=signed;const c=client(async()=>json({}),()=>scope);assert.equal(c.avatarScope,'authenticated:'+JSON.stringify([signed.owner,signed.epoch]));scope={state:'recovering',owner:signed.owner,epoch:signed.epoch};assert.equal(c.avatarScope,'recovering:'+JSON.stringify([signed.owner,signed.epoch]));scope=guest;assert.equal(c.avatarScope,'guest:guest');const png=new Blob(['x'],{type:'image/png'});await assert.rejects(client(async()=>json({revision:1,etag:'ab'.repeat(32)},201)).uploadAvatar(png,0),fail('protocol'));await assert.rejects(client(async()=>json({avatar_url:'http://[',revision:1})).avatar(id),fail('protocol'));});
