import test from 'node:test';
import assert from 'node:assert/strict';
import { routeList, loadList, toCard } from '../src/shared/library/lists.ts';

const item = (over = {}) => ({
  id: '00000000-0000-4000-8000-0000000000a1', youtube_video_id: 'AbCdEf_12-3', title: 'Видео', duration_seconds: 3725,
  availability: 'unknown', url: 'https://www.youtube.com/watch?v=AbCdEf_12-3', preview_url: 'https://i.ytimg.com/vi/AbCdEf_12-3/hqdefault.jpg',
  hashtags: ['обзор'], hashtags_observation_status: 'partial',
  channel: { id: '00000000-0000-4000-8000-0000000000c1', youtube_channel_id: 'UC' + 'a'.repeat(22), name: 'Канал', url: 'https://www.youtube.com/channel/UC' + 'a'.repeat(22), identity_verified: true, association_verified: false },
  rating: { count: 2, average: 7.5 }, my_state: { revision: 3, rating: 8, added: true, later: true }, listed_at: '2026-11-21T10:00:00Z', ...over
});

test('routes map to own server lists only', () => {
  assert.equal(routeList('/library'), 'library');
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
