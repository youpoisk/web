import test from 'node:test';
import assert from 'node:assert/strict';
import { routeList, loadList, toCard, searchCatalog, toPublicCard } from '../src/shared/library/lists.ts';

const item = (over = {}) => ({
  id: '00000000-0000-4000-8000-0000000000a1', youtube_video_id: 'AbCdEf_12-3', title: 'Видео', duration_seconds: 3725,
  availability: 'unknown', url: 'https://www.youtube.com/watch?v=AbCdEf_12-3', preview_url: 'https://i.ytimg.com/vi/AbCdEf_12-3/hqdefault.jpg',
  hashtags: ['обзор'], hashtags_observation_status: 'partial',
  channel: { id: '00000000-0000-4000-8000-0000000000c1', youtube_channel_id: 'UC' + 'a'.repeat(22), name: 'Канал', url: 'https://www.youtube.com/channel/UC' + 'a'.repeat(22), identity_verified: true, association_verified: false },
  rating: { count: 2, average: 7.5 }, my_state: { revision: 3, rating: 8, added: true, later: true }, listed_at: '2026-11-21T10:00:00Z', ...over
});

test('routes map to own server lists only', () => {
  assert.equal(routeList('/library'), null);
  assert.equal(routeList('/watchlist'), 'watchlist');
  assert.equal(routeList('/ratings'), 'ratings');
  assert.equal(routeList('/'), null);
  assert.equal(routeList('/feed'), null);
});

test('loadList calls the matching operation with limit and optional cursor', async () => {
  const calls = [];
  const client = { async request(op, options) { calls.push([op, options.query]); return { items: [item()], next_cursor: 'c2' }; } };
  assert.deepEqual(await loadList(client, 'library', null), { items: [item()], next: 'c2' });
  const end = { async request(op, options) { calls.push([op, options.query]); return { items: [] }; } };
  assert.deepEqual(await loadList(end, 'watchlist', 'c2'), { items: [], next: null });
  await loadList(client, 'ratings', '');
  assert.deepEqual(calls, [['listLibrary', { limit: 12 }], ['listWatchlist', { limit: 12, after: 'c2' }], ['listRatings', { limit: 12 }]]);
});

test('toCard keeps real data and never invents titles or durations', () => {
  const card = toCard(item());
  assert.equal(card.id, 'AbCdEf_12-3');
  assert.equal(card.title, 'Видео');
  assert.equal(card.channel, 'Канал');
  assert.equal(card.duration, '1:02:05');
  assert.equal(card.rating, 7.5);
  assert.equal(card.myRating, 8);
  assert.equal(card.later, true);
  assert.equal(card.tag, 'обзор');
  assert.ok(['forest', 'city', 'mountain', 'music', 'tech', 'art'].includes(card.color));
  const bare = toCard(item({ title: null, duration_seconds: null, channel: null, hashtags: [], rating: { count: 0, average: null }, my_state: { revision: 0, rating: null } }));
  assert.equal(bare.title, 'Название пока неизвестно');
  assert.equal(bare.duration, '');
  assert.equal(bare.channel, '');
  assert.equal(bare.channelId, '');
  assert.equal(bare.channelSource, '');
  assert.equal(bare.tag, '');
  assert.equal(bare.rating, 0);
  assert.equal(bare.myRating, null);
  assert.equal(bare.later, false);
  assert.equal(toCard(item({ duration_seconds: 59 })).duration, '0:59');
  assert.equal(toCard(item({ channel: { ...item().channel, youtube_channel_id: null, url: undefined } })).channelId, '');
});

test('toCard exposes the internal id and own revision for writes', () => {
  const card = toCard(item());
  assert.equal(card.uuid, '00000000-0000-4000-8000-0000000000a1');
  assert.equal(card.revision, 3);
});

test('StateWriter issues one lease, a fresh key per command, and renews an expired lease once', async () => {
  const { StateWriter, conflicted } = await import('../src/shared/library/lists.ts');
  const { ApiError } = await import('../src/shared/api/client.ts');
  const calls = [];
  let fail410 = 1;
  let n = 0;
  const client = {
    async request(op, options) {
      calls.push([op, options]);
      if (op === 'issueOfflineLease') return { lease: 'lease-' + calls.filter((c) => c[0] === op).length, valid_for_seconds: 604800 };
      if (fail410-- > 0) throw new ApiError('http', 410, 'reconcile_required');
      return { kind: 'video_state', target_id: options.path.id, state: { revision: options.body.expected_revision + 1, rating: null, added: true, later: options.body.later }, change_seq: 5 };
    }
  };
  const writer = new StateWriter(client, () => 'key-' + ++n);
  const state = await writer.patch('vid', 3, { later: false });
  assert.deepEqual(state, { revision: 4, rating: null, added: true, later: false });
  const patches = calls.filter((c) => c[0] === 'patchVideoState').map((c) => c[1]);
  assert.equal(patches.length, 2);
  assert.deepEqual(patches[0].header, { 'Idempotency-Key': 'key-1', 'X-Offline-Lease': 'lease-1' });
  assert.deepEqual(patches[1].header, { 'Idempotency-Key': 'key-2', 'X-Offline-Lease': 'lease-2' });
  assert.deepEqual(patches[1].body, { expected_revision: 3, later: false });
  await writer.patch('vid', 4, { rating: 9 });
  assert.equal(calls.filter((c) => c[0] === 'issueOfflineLease').length, 2, 'lease reused');
  const always410 = { async request(op) { if (op === 'issueOfflineLease') return { lease: 'l', valid_for_seconds: 604800 }; throw new ApiError('http', 410); } };
  await assert.rejects(new StateWriter(always410, () => 'k').patch('vid', 1, { later: true }), (e) => e.status === 410);
  const conflict = { async request(op) { if (op === 'issueOfflineLease') return { lease: 'l', valid_for_seconds: 604800 }; throw new ApiError('http', 409, 'conflict'); } };
  await assert.rejects(new StateWriter(conflict, () => 'k').patch('vid', 1, { later: true }), (e) => conflicted(e));
  assert.equal(conflicted(new Error('x')), false);
  assert.equal(conflicted(new ApiError('network')), false);
});

test('loadCard reads by YouTube id and maps 404 to null', async () => {
  const { loadCard } = await import('../src/shared/library/lists.ts');
  const { ApiError } = await import('../src/shared/api/client.ts');
  const seen = [];
  const ok = { async request(op, options) { seen.push([op, options.path]); return item(); } };
  assert.equal((await loadCard(ok, 'AbCdEf_12-3')).youtube_video_id, 'AbCdEf_12-3');
  assert.deepEqual(seen, [['getVideoCardByYoutube', { youtube_id: 'AbCdEf_12-3' }]]);
  assert.equal(await loadCard({ async request() { throw new ApiError('http', 404, 'not_found'); } }, 'AbCdEf_12-3'), null);
  await assert.rejects(loadCard({ async request() { throw new ApiError('http', 503); } }, 'AbCdEf_12-3'), (e) => e.status === 503);
});

test('an uncertain write keeps its key for an identical retry; a definite answer drops it', async () => {
  const { StateWriter } = await import('../src/shared/library/lists.ts');
  const { ApiError } = await import('../src/shared/api/client.ts');
  const keys = [];
  let leases = 0;
  const outcomes = [new ApiError('network'), new ApiError('http', 503), 'ok', new ApiError('http', 409), 'ok'];
  const client = {
    async request(op, options) {
      if (op === 'issueOfflineLease') { leases++; return { lease: 'l', valid_for_seconds: 604800 }; }
      keys.push(options.header['Idempotency-Key']);
      const next = outcomes.shift();
      if (next !== 'ok') throw next;
      return { kind: 'video_state', target_id: 'v', state: { revision: options.body.expected_revision + 1, later: options.body.later }, change_seq: 1 };
    }
  };
  let n = 0;
  const writer = new StateWriter(client, () => 'k' + ++n);
  await assert.rejects(writer.patch('v', 1, { later: true }));
  await assert.rejects(writer.patch('v', 1, { later: true }));
  await writer.patch('v', 1, { later: true });
  assert.deepEqual(keys, ['k1', 'k1', 'k1'], 'identical retries replay the same key');
  await assert.rejects(writer.patch('v', 2, { later: false }));
  await writer.patch('v', 2, { later: false });
  assert.deepEqual(keys.slice(3), ['k2', 'k3'], 'a definite 409 drops the key');
  const other = new StateWriter({ async request(op) { if (op === 'issueOfflineLease') return { lease: 'l', valid_for_seconds: 604800 }; throw new ApiError('network'); } }, () => 'x' + ++n);
  await assert.rejects(other.patch('v', 1, { later: true }));
  await assert.rejects(other.patch('v', 1, { rating: 5 }), 'a different command gets a new key');
  assert.equal(leases, 1);
});

test('concurrent first writes share one lease request and a failed lease is retried later', async () => {
  const { StateWriter } = await import('../src/shared/library/lists.ts');
  let leases = 0;
  let failLease = true;
  const client = {
    async request(op, options) {
      if (op === 'issueOfflineLease') { leases++; if (failLease) { failLease = false; throw new Error('offline'); } return { lease: 'l' + leases, valid_for_seconds: 604800 }; }
      return { kind: 'video_state', target_id: options.path.id, state: { revision: 2 }, change_seq: 1 };
    }
  };
  const writer = new StateWriter(client, () => 'k');
  await assert.rejects(writer.patch('a', 1, { later: true }));
  await Promise.all([writer.patch('a', 1, { later: true }), writer.patch('b', 1, { later: true })]);
  assert.equal(leases, 2, 'failed lease forgotten; then one shared lease request');
});

test('searchCatalog sends trimmed text, multiple tags, match mode, sort and cursor; cards carry no own state', async () => {
  const calls = [];
  const { my_state, listed_at, ...publicItem } = item();
  const client = { async request(op, options) { calls.push([op, options.query]); return calls.length === 1 ? { items: [publicItem], next_cursor: 'n1' } : { items: [] }; } };
  const page = await searchCatalog(client, { text: '  кот ' + 'x'.repeat(200), tags: ['обзор', 'игры'], match: 'all', sort: 'top' }, null);
  assert.equal(page.next, 'n1');
  assert.equal(page.items[0].publicCard, true);
  assert.equal(page.items[0].votes, 2);
  assert.equal(page.items[0].rating, 7.5);
  assert.equal('uuid' in page.items[0] || 'later' in page.items[0] || 'myRating' in page.items[0], false);
  assert.deepEqual(await searchCatalog(client, { text: ' ', tags: [], match: 'any', sort: 'new' }, 'n1'), { items: [], next: null });
  assert.equal(calls[0][1].q.length, 100);
  assert.deepEqual(calls[0][1].tag, ['обзор', 'игры']);
  assert.equal(calls[0][1].match, 'all');
  assert.deepEqual(calls[1], ['searchVideos', { limit: 12, sort: 'new', after: 'n1' }]);
  const bare = toPublicCard({ ...publicItem, title: null, duration_seconds: null, channel: null, hashtags: [], rating: { count: 0, average: null } });
  assert.deepEqual([bare.title, bare.duration, bare.channel, bare.tag, bare.rating, bare.votes], ['Название пока неизвестно', '', '', '', 0, 0]);
});

test('own reviews load and write through distinct idempotency scopes with one shared lease', async () => {
  const { StateWriter, loadReview } = await import('../src/shared/library/lists.ts');
  const calls=[];let n=0;
  const client={async request(op,options){calls.push([op,options]);if(op==='issueOfflineLease')return{lease:'lease'};if(op==='getVideoReview')return{review:{revision:7,text:null}};if(op==='putVideoReview')return{review:{revision:options.body.expected_revision+1,text:options.body.text}};return{state:{revision:1}}}};
  const controller=new AbortController();assert.deepEqual(await loadReview(client,'v',controller.signal),{revision:7,text:null});assert.equal(calls[0][1].signal,controller.signal);
  const writer=new StateWriter(client,()=> 'key-'+ ++n);
  assert.deepEqual(await writer.review('v',7,'Текст'),{revision:8,text:'Текст'});assert.deepEqual(await writer.review('v',8,null),{revision:9,text:null});await writer.patch('v',0,{later:true});
  assert.equal(calls.filter(c=>c[0]==='issueOfflineLease').length,1);
  assert.deepEqual(calls.filter(c=>c[0]==='putVideoReview').map(c=>c[1].body),[{expected_revision:7,text:'Текст'},{expected_revision:8,text:null}]);
  assert.deepEqual(calls.filter(c=>c[0]==='putVideoReview').map(c=>c[1].header['Idempotency-Key']),['key-1','key-2']);
});

test('uncertain state and review commands never clobber each other, and old receipts require reconciliation',async()=>{
  const {StateWriter}=await import('../src/shared/library/lists.ts');const{ApiError}=await import('../src/shared/api/client.ts');let n=0;const seen=[];let fail=true,expired=false;
  const client={async request(op,o){if(op==='issueOfflineLease')return{lease:'l'};seen.push([op,o.header['Idempotency-Key']]);if(expired)throw new ApiError('http',410);if(fail)throw new ApiError('network');return op==='putVideoReview'?{review:{revision:1,text:o.body.text}}:{state:{revision:1}}}};
  const writer=new StateWriter(client,()=> 'k'+ ++n);
  await assert.rejects(writer.patch('v',0,{later:true}));await assert.rejects(writer.review('v',0,'text'));fail=false;
  await writer.patch('v',0,{later:true});await writer.review('v',0,'text');assert.deepEqual(seen.map(c=>c[1]),['k1','k2','k1','k2']);
  fail=true;await assert.rejects(writer.review('v',1,'changed'));expired=true;const before=seen.length;await assert.rejects(writer.review('v',1,'changed'),e=>e.status===410);assert.equal(seen.length,before+1,'uncertain intent must not silently renew after 410');
});

test('late writes cannot clear a newer uncertain command for the same object',async()=>{
 const {StateWriter}=await import('../src/shared/library/lists.ts');const{ApiError}=await import('../src/shared/api/client.ts');let release,n=0;const keys=[];let attempt=0;
 const client={async request(op,o){if(op==='issueOfflineLease')return{lease:'l'};keys.push(o.header['Idempotency-Key']);if(++attempt===1)return new Promise(resolve=>{release=resolve});if(attempt===2)throw new ApiError('network');return{review:{revision:2,text:o.body.text}}}};
 const writer=new StateWriter(client,()=> 'k'+ ++n);const older=writer.review('v',0,'old');await new Promise(r=>setImmediate(r));await assert.rejects(writer.review('v',1,'new'));release({review:{revision:1,text:'old'}});await older;await writer.review('v',1,'new');assert.deepEqual(keys,['k1','k2','k2']);
});

test('account changes discard late replies and do not reuse another account lease or uncertain key',async()=>{
 const {StateWriter}=await import('../src/shared/library/lists.ts');const{ApiError}=await import('../src/shared/api/client.ts');let scope='A',n=0,release;const seen=[];
 const client={async request(op,o){seen.push([op,o]);if(op==='issueOfflineLease')return{lease:'lease-'+scope};if(scope==='A')return new Promise(resolve=>{release=resolve});return{review:{revision:1,text:'B'}}}};
 const writer=new StateWriter(client,()=> 'k'+ ++n,()=>scope);const old=writer.review('v',0,'A');await new Promise(r=>setImmediate(r));scope='B';assert.equal((await writer.review('v',0,'B')).text,'B');release({review:{revision:1,text:'A'}});await assert.rejects(old,e=>e instanceof ApiError&&e.kind==='stale_session');
 assert.deepEqual(seen.filter(c=>c[0]==='putVideoReview').map(c=>c[1].header['X-Offline-Lease']),['lease-A','lease-B']);
 let deliver;scope='A';const anchorWriter=new StateWriter({async request(op){if(op==='issueOfflineLease')return new Promise(resolve=>{deliver=resolve});throw Error('must not send old intent')}},()=> 'key',()=>scope);const pending=anchorWriter.review('v',0,'A');scope='B';deliver({lease:'A'});await assert.rejects(pending,e=>e.kind==='stale_session');
});

test('an uncertain review retains its original lease when another operation refreshes the shared lease',async()=>{
 const {StateWriter}=await import('../src/shared/library/lists.ts');const{ApiError}=await import('../src/shared/api/client.ts');let n=0,anchors=0,reviews=0,patches=0;const seen=[];
 const client={async request(op,o){if(op==='issueOfflineLease')return{lease:'lease-'+ ++anchors};seen.push([op,o.header]);if(op==='putVideoReview'){if(++reviews===1)throw new ApiError('network');return{review:{revision:1,text:'text'}}}if(++patches===1)throw new ApiError('http',410);return{state:{revision:1}}}};
 const writer=new StateWriter(client,()=> 'k'+ ++n);await assert.rejects(writer.review('v',0,'text'));await writer.patch('v',0,{later:true});await writer.review('v',0,'text');
 const reviewCalls=seen.filter(c=>c[0]==='putVideoReview');assert.deepEqual(reviewCalls.map(c=>c[1]),[{'Idempotency-Key':'k1','X-Offline-Lease':'lease-1'},{'Idempotency-Key':'k1','X-Offline-Lease':'lease-1'}]);assert.equal(anchors,2);
});

test('searchCatalog preserves multiple tags and ANY mode on subsequent pages', async () => {
  const tags = Object.freeze(['gta6', 'моряк']);
  const client = { async request(operation, options) {
    assert.equal(operation, 'searchVideos');
    assert.deepEqual(options.query, {limit: 12, sort: 'popular', tag: ['gta6', 'моряк'], match: 'any', after: 'cursor-two'});
    return {items: [], next_cursor: null};
  }};
  assert.deepEqual(await searchCatalog(client, {text: '', tags, match: 'any', sort: 'popular'}, 'cursor-two'), {items: [], next: null});
});
test('channel reads use internal UUID and distinct own-rating operation', async () => {
 const {loadChannel,loadChannelRating} = await import('../src/shared/library/lists.ts');
 const id=item().channel.id, controller=new AbortController(), calls=[];
 const card={id,name:'Канал',youtube_channel_id:null,identity_verified:false,rating:{count:0,average:null}};
 const client={async request(op,options){calls.push([op,options]);return op==='getChannelCard'?card:{state:{revision:3,rating:8}};}};
 assert.deepEqual(await loadChannel(client,id,controller.signal),card);
 assert.deepEqual(await loadChannelRating(client,id,controller.signal),{revision:3,rating:8});
 assert.deepEqual(calls,[['getChannelCard',{path:{id},signal:controller.signal}],['getChannelRating',{path:{id},signal:controller.signal}]]);
 assert.equal(toPublicCard(item()).channelUuid,id);
 assert.equal(toCard(item()).channelUuid,id);
 assert.equal(toPublicCard(item({channel:null})).channelUuid,'');
});

test('channel rating retries preserve receipt and original lease, independent of video state', async () => {
 const {StateWriter} = await import('../src/shared/library/lists.ts');
 const {ApiError} = await import('../src/shared/api/client.ts');
 const calls=[];let n=0,fail=true;
 const client={async request(op,options){calls.push([op,options]);if(op==='issueOfflineLease')return {lease:'shared'};
  if(op==='putChannelRating'&&fail){fail=false;throw new ApiError('network');}
  return {state:{revision:options.body.expected_revision+1,rating:options.body.rating??null}};
 }};
 const writer=new StateWriter(client,()=> 'key-'+ ++n);
 await assert.rejects(writer.channelRating('same-id',0,7),e=>e.kind==='network');
 await writer.patch('same-id',0,{rating:4});
 assert.deepEqual(await writer.channelRating('same-id',0,7),{revision:1,rating:7});
 const writes=calls.filter(([op])=>op==='putChannelRating');
 assert.deepEqual(writes[0][1],writes[1][1]);
 assert.notEqual(calls.find(([op])=>op==='patchVideoState')[1].header['Idempotency-Key'],writes[0][1].header['Idempotency-Key']);
 assert.deepEqual(await writer.channelRating('same-id',1,null),{revision:2,rating:null});
 assert.equal(calls.filter(([op])=>op==='issueOfflineLease').length,1);
});

test('loadFriendRatings pages friends ratings of a video', async () => {
  const { loadFriendRatings } = await import('../src/shared/library/lists.ts');
  const calls = [];
  const rating = { user: { id: '00000000-0000-4000-8000-0000000000e1', login: 'anna', name: 'Анна' }, rating: 9, rated_at: '2026-11-21T10:00:00Z' };
  const client = { async request(op, options) { calls.push([op, options.path, options.query]); return calls.length === 1 ? { items: [rating], next_cursor: 'n1' } : { items: [] }; } };
  assert.deepEqual(await loadFriendRatings(client, 'v1', null), { items: [rating], next: 'n1' });
  assert.deepEqual(await loadFriendRatings(client, 'v1', 'n1'), { items: [], next: null });
  assert.deepEqual(calls, [['listFriendRatings', { id: 'v1' }, { limit: 20 }], ['listFriendRatings', { id: 'v1' }, { limit: 20, after: 'n1' }]]);
});

test('loadFriends pages the viewer friends', async () => {
  const { loadFriends } = await import('../src/shared/library/lists.ts');
  const calls = [];
  const friend = { user: { id: '00000000-0000-4000-8000-0000000000e1', login: 'anna', name: null }, since: '2026-11-21T10:00:00Z' };
  const client = { async request(op, options) { calls.push([op, options.query]); return calls.length === 1 ? { items: [friend], next_cursor: 'n1' } : { items: [] }; } };
  assert.deepEqual(await loadFriends(client, null), { items: [friend], next: 'n1' });
  assert.deepEqual(await loadFriends(client, 'n1'), { items: [], next: null });
  assert.deepEqual(calls, [['listFriends', { limit: 30 }], ['listFriends', { limit: 30, after: 'n1' }]]);
});

test('loadUserProfile and loadUserRecommendations read another user', async () => {
  const { loadUserProfile, loadUserRecommendations } = await import('../src/shared/library/lists.ts');
  const calls = [];
  const profile = { user: { id: 'u1', login: 'anna', name: 'Анна' }, relation: 'friend', ratings_visible: true, reviews_visible: false };
  const client = { async request(op, options) { calls.push([op, options.path, options.query]); if (op === 'getUserProfile') return profile; return calls.length === 2 ? { items: [{ rating: 9 }], next_cursor: 'n1' } : { items: [] }; } };
  assert.deepEqual(await loadUserProfile(client, 'u1'), profile);
  assert.deepEqual(await loadUserRecommendations(client, 'u1', null), { items: [{ rating: 9 }], next: 'n1' });
  assert.deepEqual(await loadUserRecommendations(client, 'u1', 'n1'), { items: [], next: null });
  assert.deepEqual(calls, [['getUserProfile', { id: 'u1' }, undefined], ['listUserRecommendations', { id: 'u1' }, { limit: 12 }], ['listUserRecommendations', { id: 'u1' }, { limit: 12, after: 'n1' }]]);
});

test('loadPrivacy and changePrivacy send one policy at the known revision', async () => {
  const { loadPrivacy, changePrivacy } = await import('../src/shared/library/lists.ts');
  const calls = [];
  const settings = { revision: 1, ratings: 'public', watchlist: 'public', recommendations: 'public', library: 'public', reviews: 'public', social: 'public' };
  const client = { async request(op, options) { calls.push([op, options.body]); return op === 'getPrivacy' ? { settings, change_seq: null } : { settings: { ...settings, revision: 2, reviews: 'friends' }, change_seq: 5 }; } };
  assert.deepEqual(await loadPrivacy(client), settings);
  assert.equal((await changePrivacy(client, 1, 'reviews', 'friends')).reviews, 'friends');
  assert.deepEqual(calls, [['getPrivacy', undefined], ['patchPrivacy', { expected_revision: 1, reviews: 'friends' }]]);
});

test('loadFeed pages friends recommendations', async () => {
  const { loadFeed } = await import('../src/shared/library/lists.ts');
  const calls = [];
  const client = { async request(op, options) { calls.push([op, options.query]); return calls.length === 1 ? { items: [{ rating: 9 }], next_cursor: 'n1' } : { items: [] }; } };
  assert.deepEqual(await loadFeed(client, null), { items: [{ rating: 9 }], next: 'n1' });
  assert.deepEqual(await loadFeed(client, 'n1'), { items: [], next: null });
  assert.deepEqual(calls, [['listFeed', { limit: 12 }], ['listFeed', { limit: 12, after: 'n1' }]]);
});

test('people search and friend request helpers call the right operations', async () => {
  const m = await import('../src/shared/library/lists.ts');
  const calls = [];
  const client = { async request(op, options) { calls.push([op, options.path, options.query, options.body]); if (op === 'searchPeople') return { items: [{ relation: 'none' }] }; if (op === 'listFriendRequests') return calls.length === 2 ? { items: [{ id: 'r1' }], next_cursor: 'n1' } : { items: [] }; if (op === 'sendFriendRequest') return { status: 'created' }; if (op === 'acceptFriendRequest') return { since: 'x' }; return null; } };
  assert.deepEqual(await m.searchPeople(client, '  ан' + 'x'.repeat(80)), [{ relation: 'none' }]);
  assert.deepEqual(await m.loadFriendRequests(client, 'incoming', null), { items: [{ id: 'r1' }], next: 'n1' });
  assert.deepEqual(await m.loadFriendRequests(client, 'outgoing', 'n1'), { items: [], next: null });
  assert.deepEqual(await m.sendFriendRequest(client, 'u1'), { status: 'created' });
  assert.deepEqual(await m.acceptFriendRequest(client, 'r1'), { since: 'x' });
  assert.equal(await m.deleteFriendRequest(client, 'r1'), undefined);
  assert.equal(await m.removeFriend(client, 'u1'), undefined);
  assert.equal(calls[0][2].q.length, 50);
  assert.deepEqual(calls.slice(1).map(c => [c[0], c[1], c[2], c[3]]), [
    ['listFriendRequests', undefined, { direction: 'incoming', limit: 30 }, undefined],
    ['listFriendRequests', undefined, { direction: 'outgoing', limit: 30, after: 'n1' }, undefined],
    ['sendFriendRequest', undefined, undefined, { user_id: 'u1' }],
    ['acceptFriendRequest', { id: 'r1' }, undefined, undefined],
    ['deleteFriendRequest', { id: 'r1' }, undefined, undefined],
    ['deleteFriend', { id: 'u1' }, undefined, undefined]]);
});

test('friendLimitMessage maps friend write rate limits', async () => {
  const { friendLimitMessage } = await import('../src/shared/library/lists.ts');
  const { ApiError } = await import('../src/shared/api/client.ts');
  assert.match(friendLimitMessage(new ApiError('http', 429, 'too_many_pending_requests')), /ждут ответа/);
  assert.match(friendLimitMessage(new ApiError('http', 429, 'rate_limited', '', 60)), /через минуту/);
  assert.equal(friendLimitMessage(new ApiError('http', 409, 'conflict')), null);
  assert.equal(friendLimitMessage(new Error('x')), null);
});

test('subscriptions map independent reads and idempotent writes without JSON bodies', async () => {
 const {loadRelationship,setFollowing,loadFollowing}=await import('../src/shared/library/lists.ts');
 const calls=[],id=item().channel.id,ctl=new AbortController();
 const relation={user_id:id,following:true,followed_by:false,friends:true,following_count:null,followers_count:null};
 const client={async request(op,options){calls.push([op,options]);if(op==='getRelationship')return relation;if(op.startsWith('list'))return {items:[],...(op==='listFollowing'?{next_cursor:'cursor'}:{})};}};
 assert.deepEqual(await loadRelationship(client,id,ctl.signal),relation);
 await setFollowing(client,id,true);await setFollowing(client,id,false);
 assert.deepEqual(await loadFollowing(client,'following',null,ctl.signal),{items:[],next:'cursor'});
 assert.deepEqual(await loadFollowing(client,'followers','cursor'),{items:[],next:null});
 assert.deepEqual(calls,[['getRelationship',{path:{id},signal:ctl.signal}],['followUser',{path:{id}}],['unfollowUser',{path:{id}}],['listFollowing',{query:{limit:30},signal:ctl.signal}],['listFollowers',{query:{limit:30,after:'cursor'},signal:undefined}]]);
});

test('current-list people filter matches name/login with Unicode normalization and never mutates source', async () => {
 const {filterPeopleList}=await import('../src/shared/library/lists.ts');
 const anna={user:{id:'a',login:'qa_friend_anna',name:'Анна QA'}};
 const sofia={user:{id:'s',login:'qa_friend_sofia',name:'София QA'}};
 const short={user:{id:'i',login:'qa_ivan',name:'Иван Майский'}};
 const unnamed={user:{id:'n',login:'anonymous',name:null}};
 const users=Object.freeze([anna,sofia,short,unnamed]);
 assert.deepEqual(filterPeopleList(users,' @QA_FRIEND_SOFIA '),[sofia]);
 assert.deepEqual(filterPeopleList(users,'аНнА'),[anna]);
 assert.deepEqual(filterPeopleList(users,short.user.name.normalize('NFD')),[short]);
 assert.deepEqual(filterPeopleList(users,'   '),users);
 assert.deepEqual(filterPeopleList(users,'нет такого'),[]);
 assert.deepEqual(filterPeopleList(users,'anonymous'),[unnamed]);
 assert.equal(users.length,4);
 assert.deepEqual(filterPeopleList([anna,...Array.from({length:30},(_,i)=>({user:{login:'user'+i}})),sofia],'София'),[sofia]);
});

test('blocks page preserves redacted identities, cursor and signal; writes are bodyless', async () => {
 const {loadBlocks,setBlocked}=await import('../src/shared/library/lists.ts');
 const id=item().channel.id,ctl=new AbortController(),calls=[];
 const block={user:{id,login:null,name:null},since:'2026-11-21T00:00:00Z'};
 const client={async request(op,options){calls.push([op,options]);return op==='listBlocks'?{items:[block],...(options.query.after?{}:{next_cursor:'cursor'})}:undefined;}};
 assert.deepEqual(await loadBlocks(client,null,ctl.signal),{items:[block],next:'cursor'});
 assert.deepEqual(await loadBlocks(client,'cursor'),{items:[block],next:null});
 await setBlocked(client,id,true);await setBlocked(client,id,false);
 assert.deepEqual(calls,[['listBlocks',{query:{limit:30},signal:ctl.signal}],['listBlocks',{query:{limit:30,after:'cursor'},signal:undefined}],['blockUser',{path:{id}}],['unblockUser',{path:{id}}]]);
 const failure=new Error('uncertain');
 await assert.rejects(setBlocked({request:async()=>{throw failure}},id,true),e=>e===failure);
 await assert.rejects(loadBlocks({request:async()=>{throw failure}},null),e=>e===failure);
});

test('feed video grouping merges authors across cursor pages without title joins or lost contributions', async()=>{
 const {groupFeedByVideo}=await import('../src/shared/library/lists.ts');
 const a=item({my_state:undefined}),b=item({id:'00000000-0000-4000-8000-0000000000b2',my_state:undefined});
 const one={user:{id:'author1',login:'one',name:null},video:a,rating:9,review:'First review',changed_at:'2026-11-22T10:00:00Z'};
 const two={user:{id:'author2',login:'two',name:'Two'},video:b,rating:null,review:'Other video, same title',changed_at:'2026-11-22T09:00:00Z'};
 const older={user:two.user,video:a,rating:7,review:null,changed_at:'2026-11-21T10:00:00Z'};
 const source=Object.freeze([Object.freeze(one),Object.freeze(two),Object.freeze(older)]);
 assert.deepEqual(groupFeedByVideo([]),[]);
 const first=groupFeedByVideo(source.slice(0,2));assert.equal(first.length,2);
 const groups=groupFeedByVideo([...source,{...one,rating:2,review:'Older duplicate',changed_at:'2026-11-20T00:00:00Z'}]);
 assert.deepEqual(groups.map(g=>g.video.id),[a.id,b.id]);
 assert.equal(groups[0].changedAt,one.changed_at);
 assert.deepEqual(groups[0].items,[one,older]);assert.deepEqual(groups[1].items,[two]);
 assert.equal(groups[0].video,a);assert.equal(groups[0].items[0].rating,9);
 assert.equal(source.length,3);assert.notEqual(groups[0].items,source);
});

test('direct message helpers call the right operations and merge by seq', async () => {
  const m = await import('../src/shared/library/lists.ts');
  const { ApiError } = await import('../src/shared/api/client.ts');
  const calls = [];
  const client = { async request(op, options) { calls.push([op, options.path, options.query, options.body]);
    if (op === 'listConversations') return calls.length === 1 ? { items: [{ id: 'c1' }], next_cursor: 'n1' } : { items: [] };
    if (op === 'listMessages') return { items: [{ seq: 2 }], can_send: true };
    if (op === 'sendMessage') return { created: true, message: { seq: 3 } };
    return { read_seq: 3, unread_count: 0 }; } };
  assert.deepEqual(await m.loadConversations(client, null), { items: [{ id: 'c1' }], next: 'n1' });
  assert.deepEqual(await m.loadConversations(client, 'n1'), { items: [], next: null });
  assert.equal((await m.loadMessages(client, 'u1', null)).can_send, true);
  await m.loadMessages(client, 'u1', 7);
  assert.deepEqual(await m.sendMessage(client, 'u1', 'k1', ' hi '), { seq: 3 });
  await m.sendMessage(client, 'u1', 'k2', '   ', 'v1');
  assert.deepEqual(await m.markConversationRead(client, 'u1', 3), { read_seq: 3, unread_count: 0 });
  assert.deepEqual(calls.map(c => [c[0], c[1], c[2], c[3]]), [
    ['listConversations', undefined, { limit: 30 }, undefined],
    ['listConversations', undefined, { limit: 30, after: 'n1' }, undefined],
    ['listMessages', { id: 'u1' }, { limit: 50 }, undefined],
    ['listMessages', { id: 'u1' }, { limit: 50, before: 7 }, undefined],
    ['sendMessage', { id: 'u1' }, undefined, { client_message_id: 'k1', body: ' hi ' }],
    ['sendMessage', { id: 'u1' }, undefined, { client_message_id: 'k2', video_id: 'v1' }],
    ['markConversationRead', { id: 'u1' }, undefined, { through_seq: 3 }]]);
  const a = { seq: 1, body: 'a' }, b = { seq: 2, body: 'old' }, b2 = { seq: 2, body: 'new' }, c = { seq: 3, body: 'c' };
  assert.deepEqual(m.mergeMessages([b, c], [a, b2]), [a, b2, c]);
  assert.deepEqual(m.mergeMessages([], []), []);
  assert.equal(m.messageGap([], [{ seq: 9 }]), null);
  assert.equal(m.messageGap([{ seq: 1 }], []), null);
  assert.equal(m.messageGap([{ seq: 3 }, { seq: 4 }], [{ seq: 6 }, { seq: 5 }]), null, 'page connects');
  assert.equal(m.messageGap([{ seq: 3 }, { seq: 4 }], [{ seq: 4 }]), null, 'overlap');
  assert.equal(m.messageGap([{ seq: 4 }, { seq: 3 }], [{ seq: 180 }, { seq: 131 }]), 131, 'missing 5..130');
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => ({ seq: from + i }));
  assert.equal(m.messageGap([...range(71, 120), { seq: 181 }], range(132, 181).reverse()), 132, 'own sent message above the hole');
  assert.equal(m.messageGap([...range(71, 120), ...range(130, 181)], range(171, 181)), 130, 'hole inside the loaded range');
  assert.equal(m.messageGap([...range(71, 120), { seq: 181 }], range(82, 181)), null, 'filled');
  for (const [status, text] of [[403, /друзьям/], [404, /недоступна/], [409, /другим текстом/], [422, /1000/], [429, /через минуту/], [503, /дубль не появится/]]) {
    assert.match(m.messageError(new ApiError('http', status, 'x')), text);
  }
  assert.match(m.messageError(new ApiError('network')), /дубль не появится/);
  assert.match(m.messageError(new Error('x')), /дубль не появится/);
});

test('notification helpers call the right operations and describe items', async () => {
  const m = await import('../src/shared/library/lists.ts');
  const calls = [];
  const client = { async request(op, options) { calls.push([op, options.path, options.query, options.body]);
    if (op === 'listNotifications') return calls.length === 1 ? { items: [{ id: 'n1' }], next_cursor: 'c1' } : { items: [] };
    if (op === 'countUnreadNotifications') return { unread_count: 4 };
    if (op === 'markAllNotificationsRead') return { unread_count: 1 };
    return null; } };
  assert.deepEqual(await m.loadNotifications(client, null), { items: [{ id: 'n1' }], next: 'c1' });
  assert.deepEqual(await m.loadNotifications(client, 'c1'), { items: [], next: null });
  assert.equal(await m.loadUnreadNotifications(client), 4);
  assert.equal(await m.markNotificationRead(client, 'n1'), undefined);
  assert.equal(await m.markAllNotificationsRead(client, '2026-11-22T10:00:00Z'), 1);
  assert.deepEqual(calls.map(c => [c[0], c[1], c[2], c[3]]), [
    ['listNotifications', undefined, { limit: 30 }, undefined],
    ['listNotifications', undefined, { limit: 30, after: 'c1' }, undefined],
    ['countUnreadNotifications', undefined, undefined, undefined],
    ['markNotificationRead', { id: 'n1' }, undefined, undefined],
    ['markAllNotificationsRead', undefined, undefined, { through: '2026-11-22T10:00:00Z' }]]);
  const actor = { id: 'u1', login: 'anna', name: null };
  const item = (over) => ({ id: 'n', kind: 'message', actor, count: 1, read: false, request_status: null, occurred_at: 'x', ...over });
  assert.match(m.notificationText(item({ kind: 'friend_request', request_status: 'pending' })), /anna хочет добавить/);
  assert.match(m.notificationText(item({ kind: 'friend_request', request_status: 'resolved' })), /неактуальна/);
  assert.match(m.notificationText(item({ kind: 'friend_accepted', actor: { ...actor, name: 'Анна' } })), /Анна принял/);
  assert.equal(m.notificationText(item({})), 'Сообщение от anna');
  assert.match(m.notificationText(item({ count: 3 })), /новых сообщений — 3/);
  assert.deepEqual(m.notificationTarget(item({ kind: 'friend_request', request_status: 'pending' })), { route: '/friends', tab: 'Заявки' });
  assert.deepEqual(m.notificationTarget(item({ kind: 'friend_request', request_status: 'resolved' })), { route: '/user/u1' });
  assert.deepEqual(m.notificationTarget(item({ kind: 'friend_accepted' })), { route: '/user/u1' });
  assert.deepEqual(m.notificationTarget(item({})), { route: '/messages/u1' });
});

test('report and moderation helpers call the right operations', async () => {
  const m = await import('../src/shared/library/lists.ts');
  const { ApiError } = await import('../src/shared/api/client.ts');
  const calls = [];
  const client = { async request(op, options) { calls.push([op, options.path, options.query, options.body]);
    if (op === 'getStaffRole') return { role: 'moderator' };
    if (op === 'listReports') return calls.length === 4 ? { items: [{ id: 'r1' }], next_cursor: 'c1' } : { items: [] };
    if (op === 'listModerationAudit') return calls.length === 7 ? { items: [{ id: 'a1' }], next_cursor: 'c2' } : { items: [] };
    if (op === 'resolveReport') return { id: 'r1', status: 'dismissed' };
    return { id: 'x', status: 'open', created: true }; } };
  assert.equal((await m.createReport(client, 'user', 'u1', 'spam', '  ')).created, true);
  await m.createReport(client, 'message', 'm1', 'abuse', ' угрозы ');
  assert.equal(await m.loadStaffRole(client), 'moderator');
  assert.deepEqual(await m.loadReports(client, 'open', null), { items: [{ id: 'r1' }], next: 'c1' });
  assert.deepEqual(await m.loadReports(client, 'actioned', 'c1'), { items: [], next: null });
  assert.deepEqual(await m.resolveReport(client, 'r1', 'dismiss'), { id: 'r1', status: 'dismissed' });
  assert.deepEqual(await m.loadAudit(client, null), { items: [{ id: 'a1' }], next: 'c2' });
  assert.deepEqual(await m.loadAudit(client, 'c2'), { items: [], next: null });
  assert.deepEqual(calls.map(c => [c[0], c[1], c[2], c[3]]), [
    ['createReport', undefined, undefined, { target_kind: 'user', target_id: 'u1', reason: 'spam' }],
    ['createReport', undefined, undefined, { target_kind: 'message', target_id: 'm1', reason: 'abuse', details: ' угрозы ' }],
    ['getStaffRole', undefined, undefined, undefined],
    ['listReports', undefined, { status: 'open', limit: 30 }, undefined],
    ['listReports', undefined, { status: 'actioned', limit: 30, after: 'c1' }, undefined],
    ['resolveReport', { id: 'r1' }, undefined, { action: 'dismiss' }],
    ['listModerationAudit', undefined, { limit: 30 }, undefined],
    ['listModerationAudit', undefined, { limit: 30, after: 'c2' }, undefined]]);
  assert.equal(m.REPORT_REASONS.length, 4);
  for (const [status, text] of [[404, /недоступен/], [422, /500/], [429, /через минуту/], [503, /ещё раз/]]) assert.match(m.reportError(new ApiError('http', status, 'x')), text);
  assert.match(m.reportError(new Error('x')), /ещё раз/);
  for (const [status, text] of [[403, /прав/], [409, /рассмотрена/], [422, /не подходит/], [429, /через минуту/], [503, /ещё раз/]]) assert.match(m.moderationError(new ApiError('http', status, 'x')), text);
  assert.match(m.moderationError(new Error('x')), /ещё раз/);
});


test('own display name and exact navigation count requests use only own endpoints',async()=>{
 const {changeMyName,loadNavigationCounts}=await import('../src/shared/library/lists.ts');
 const calls=[],signal=new AbortController().signal,user={id:'own',name:'Й',login:'owner',email:'owner@example.invalid'},counts={unread_conversations:2,incoming_friend_requests:3};
 const client={async request(op,options){calls.push([op,options]);return op==='changeMyName'?user:counts;}};
 assert.deepEqual(await changeMyName(client,'  И\u0306  '),user);
 assert.deepEqual(await loadNavigationCounts(client,signal),counts);
 assert.deepEqual(calls,[['changeMyName',{body:{name:'Й'}}],['getNavigationCounts',{signal}]]);
 const error=new Error('uncertain');await assert.rejects(changeMyName({request:async()=>{throw error}},'Имя'),e=>e===error);
});
