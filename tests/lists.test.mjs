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
  assert.deepEqual(calls, [['listLibrary', { limit: 30 }], ['listWatchlist', { limit: 30, after: 'c2' }], ['listRatings', { limit: 30 }]]);
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

test('searchCatalog sends trimmed text, one tag, sort and cursor; cards carry no own state', async () => {
  const calls = [];
  const { my_state, listed_at, ...publicItem } = item();
  const client = { async request(op, options) { calls.push([op, options.query]); return calls.length === 1 ? { items: [publicItem], next_cursor: 'n1' } : { items: [] }; } };
  const page = await searchCatalog(client, { text: '  кот ' + 'x'.repeat(200), tag: 'обзор', sort: 'top' }, null);
  assert.equal(page.next, 'n1');
  assert.equal(page.items[0].publicCard, true);
  assert.equal(page.items[0].votes, 2);
  assert.equal(page.items[0].rating, 7.5);
  assert.equal('uuid' in page.items[0] || 'later' in page.items[0] || 'myRating' in page.items[0], false);
  assert.deepEqual(await searchCatalog(client, { text: ' ', tag: null, sort: 'new' }, 'n1'), { items: [], next: null });
  assert.equal(calls[0][1].q.length, 100);
  assert.deepEqual(calls[0][1].tag, ['обзор']);
  assert.deepEqual(calls[1], ['searchVideos', { limit: 30, sort: 'new', after: 'n1' }]);
  const bare = toPublicCard({ ...publicItem, title: null, duration_seconds: null, channel: null, hashtags: [], rating: { count: 0, average: null } });
  assert.deepEqual([bare.title, bare.duration, bare.channel, bare.tag, bare.rating, bare.votes], ['Название пока неизвестно', '', '', '', 0, 0]);
});
