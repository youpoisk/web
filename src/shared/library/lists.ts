import { ApiError, type ApiClient } from '../api/client.ts';
import type { components } from '../api/schema';

export type ListKind = 'library' | 'watchlist' | 'ratings';
export type ListItem = components['schemas']['VideoListItem'];
export type ListPage = { items: ListItem[]; next: string | null };
/** Card shape used by the site's existing video grid. */
export type ListCard = {
  id: string; title: string; channel: string; handle: string; channelId: string; channelUuid: string; durationSeconds: number; duration: string;
  hashtags: readonly string[]; source: string; channelSource: string; checkedAt: string; color: string; tag: string; rating: number;
  myRating: number | null; later: boolean; uuid: string; revision: number;
};
export type VideoState = components['schemas']['VideoState'];

const operations = { library: 'listLibrary', watchlist: 'listWatchlist', ratings: 'listRatings' } as const;
const palette = ['forest', 'city', 'mountain', 'music', 'tech', 'art'];

/** Maps a hash route to the viewer's own server list, if any. The site has no
 * library page (customer decision 2026-11-21); 'library' stays an API list kind. */
export function routeList(route: string): ListKind | null {
  return route === '/watchlist' ? 'watchlist' : route === '/ratings' ? 'ratings' : null;
}

/** Loads one page of the viewer's own list (live Bearer via the client scope). */
export async function loadList(client: Pick<ApiClient, 'request'>, kind: ListKind, after: string | null, signal?: AbortSignal): Promise<ListPage> {
  const query: { limit: number; after?: string } = { limit: 30 };
  if (after) query.after = after;
  const page = await client.request(operations[kind], { query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}

export type SearchSort = 'new' | 'top' | 'popular';
export type PublicCard = Omit<ListCard, 'uuid' | 'revision' | 'later' | 'myRating'> & { publicCard: true; votes: number };
export type SearchPage = { items: PublicCard[]; next: string | null };

/** One page of the public catalog search (no viewer state, no Authorization). */
export async function searchCatalog(client: Pick<ApiClient, 'request'>, filter: { text: string; tags: readonly string[]; match: 'any' | 'all'; sort: SearchSort }, after: string | null, signal?: AbortSignal): Promise<SearchPage> {
  const query: { limit: number; sort: SearchSort; q?: string; tag?: string[]; match?: 'any' | 'all'; after?: string } = { limit: 30, sort: filter.sort };
  const text = filter.text.trim().slice(0, 100);
  if (text) query.q = text;
  if (filter.tags.length) { query.tag = [...filter.tags]; query.match = filter.match; }
  if (after) query.after = after;
  const page = await client.request('searchVideos', { query, signal });
  return { items: page.items.map(toPublicCard), next: page.next_cursor ?? null };
}

function duration(seconds: number | null): string {
  if (seconds === null) return '';
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : String(m)) + ':' + String(s).padStart(2, '0');
}

/** Server item → grid card. Unknown title/duration are shown as unknown, never invented. */
export function toCard(item: ListItem): ListCard {
  const seed = [...item.youtube_video_id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return {
    id: item.youtube_video_id,
    title: item.title ?? 'Название пока неизвестно',
    channel: item.channel?.name ?? '',
    handle: '',
    channelId: item.channel?.youtube_channel_id ?? '',
    channelUuid: item.channel?.id ?? '',
    durationSeconds: item.duration_seconds ?? 0,
    duration: duration(item.duration_seconds),
    hashtags: item.hashtags,
    source: item.url,
    channelSource: item.channel?.url ?? '',
    checkedAt: item.listed_at,
    color: palette[seed % palette.length],
    tag: item.hashtags[0] ?? '',
    rating: item.rating.average ?? 0,
    myRating: item.my_state.rating ?? null,
    later: item.my_state.later === true,
    uuid: item.id,
    revision: item.my_state.revision
  };
}

/** Own-state writes from the site. One offline lease per page session (the
 * request itself is shared, so concurrent first writes issue one lease). A
 * command whose outcome is uncertain (network/timeout/429/5xx) keeps its
 * Idempotency-Key: repeating the identical command replays it, so a request
 * that actually committed returns its original result instead of a false 409.
 * The key is dropped on a definite answer; a fresh command can renew an
 * expired lease once. A prior uncertain command returning 410 must reconcile. */
export type ChannelState = components['schemas']['ChannelState'];
export type ChannelCard = components['schemas']['ChannelCard'];
export async function loadChannel(client: Pick<ApiClient, 'request'>, id: string, signal?: AbortSignal): Promise<ChannelCard> {
  return client.request('getChannelCard', {path: {id}, signal});
}
export async function loadChannelRating(client: Pick<ApiClient, 'request'>, id: string, signal?: AbortSignal): Promise<ChannelState> {
  return (await client.request('getChannelRating', {path: {id}, signal})).state;
}

export type VideoReview = components['schemas']['VideoReview'];
type StateBody = { expected_revision: number; rating?: number | null; later?: boolean; added?: boolean };
type ReviewBody = { expected_revision: number; text: string | null };
type WriteCommand = { operation: 'patchVideoState'; body: StateBody } | { operation: 'putVideoReview'; body: ReviewBody } | { operation: 'putChannelRating'; body: {expected_revision: number; rating: number | null} };

export class StateWriter {
  readonly #client: Pick<ApiClient, 'request'>;
  readonly #uuid: () => string;
  readonly #scope: () => string;
  #context: string | null = null;
  #lease: Promise<string> | null = null;
  readonly #uncertain = new Map<string, { key: string; fingerprint: string; lease: string }>();
  constructor(client: Pick<ApiClient, 'request'>, uuid: () => string, scope: () => string = () => 'session') {
    this.#client = client; this.#uuid = uuid; this.#scope = scope;
  }
  #check(context: string): void {
    if (this.#scope() !== context) throw new ApiError('stale_session');
  }
  #anchor(): Promise<string> {
    if (this.#lease === null) {
      const pending = this.#client.request('issueOfflineLease', {}).then((r) => r.lease);
      this.#lease = pending;
      pending.catch(() => { if (this.#lease === pending) this.#lease = null; });
    }
    return this.#lease;
  }
  patch(videoId: string, expected: number, change: { rating?: number | null; later?: boolean; added?: boolean }): Promise<VideoState> {
    return this.#write(videoId, { operation: 'patchVideoState', body: { expected_revision: expected, ...change } });
  }
  review(videoId: string, expected: number, text: string | null): Promise<VideoReview> {
    return this.#write(videoId, { operation: 'putVideoReview', body: { expected_revision: expected, text } });
  }
  channelRating(channelId: string, expected: number, rating: number | null): Promise<ChannelState> {
    return this.#write(channelId, {operation: 'putChannelRating', body: {expected_revision: expected, rating}});
  }
  #write(videoId: string, command: {operation: 'putChannelRating'; body: {expected_revision: number; rating: number | null}}): Promise<ChannelState>;
  #write(videoId: string, command: { operation: 'patchVideoState'; body: StateBody }): Promise<VideoState>;
  #write(videoId: string, command: { operation: 'putVideoReview'; body: ReviewBody }): Promise<VideoReview>;
  async #write(videoId: string, command: WriteCommand): Promise<VideoState | VideoReview | ChannelState> {
    const context = this.#scope();
    if (context !== this.#context) { this.#context = context; this.#lease = null; this.#uncertain.clear(); }
    const slot = command.operation + ':' + videoId;
    const fingerprint = JSON.stringify(command.body);
    const previous = this.#uncertain.get(slot);
    const reusing = previous?.fingerprint === fingerprint;
    let key = reusing ? previous.key : this.#uuid();
    let originalLease = reusing ? previous.lease : null;
    for (let attempt = 0; ; attempt++) {
      const lease = originalLease ?? await this.#anchor();
      this.#check(context);
      this.#uncertain.set(slot, { key, fingerprint, lease });
      try {
        const options = { path: { id: videoId }, header: { 'Idempotency-Key': key, 'X-Offline-Lease': lease } };
        const result = command.operation === 'putChannelRating'
          ? (await this.#client.request('putChannelRating', {...options, body: command.body})).state
          : command.operation === 'putVideoReview'
          ? (await this.#client.request('putVideoReview', { ...options, body: command.body })).review
          : (await this.#client.request('patchVideoState', { ...options, body: command.body })).state;
        this.#check(context);
        if (this.#uncertain.get(slot)?.key === key) this.#uncertain.delete(slot);
        return result;
      } catch (error) {
        this.#check(context);
        const definite = error instanceof ApiError && error.kind === 'http' && error.status !== 429 && error.status < 500;
        if (definite && this.#uncertain.get(slot)?.key === key) this.#uncertain.delete(slot);
        if (error instanceof ApiError && error.kind === 'http' && error.status === 410) {
          this.#lease = null;
          // A fresh key cannot have an expired receipt. An uncertain prior
          // command can: never renew that old intent without reconciliation.
          if (attempt === 0 && !reusing) { key = this.#uuid(); originalLease = null; continue; }
        }
        throw error;
      }
    }
  }
}

/** Own review includes a persistent revision even when text is null. */
export async function loadReview(client: Pick<ApiClient, 'request'>, videoId: string, signal?: AbortSignal): Promise<VideoReview> {
  return (await client.request('getVideoReview', { path: { id: videoId }, signal })).review;
}

export type FriendRating = components['schemas']['FriendRating'];
/** One page of friends' ratings of a video (accepted friends whose privacy admits it). */
export async function loadFriendRatings(client: Pick<ApiClient, 'request'>, videoId: string, after: string | null, signal?: AbortSignal): Promise<{ items: FriendRating[]; next: string | null }> {
  const query: { limit: number; after?: string } = { limit: 20 };
  if (after) query.after = after;
  const page = await client.request('listFriendRatings', { path: { id: videoId }, query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}

export type Friend = components['schemas']['Friend'];
/** One page of the viewer's accepted friends, newest friendship first. */
export async function loadFriends(client: Pick<ApiClient, 'request'>, after: string | null, signal?: AbortSignal): Promise<{ items: Friend[]; next: string | null }> {
  const query: { limit: number; after?: string } = { limit: 30 };
  if (after) query.after = after;
  const page = await client.request('listFriends', { query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}

export type UserProfile = components['schemas']['UserProfile'];
export type Recommendation = components['schemas']['Recommendation'];
/** Another user's profile header as this viewer may see it. */
export async function loadUserProfile(client: Pick<ApiClient, 'request'>, userId: string, signal?: AbortSignal): Promise<UserProfile> {
  return client.request('getUserProfile', { path: { id: userId }, signal });
}
/** One page of the user's visible ratings and reviews. */
export async function loadUserRecommendations(client: Pick<ApiClient, 'request'>, userId: string, after: string | null, signal?: AbortSignal): Promise<{ items: Recommendation[]; next: string | null }> {
  const query: { limit: number; after?: string } = { limit: 30 };
  if (after) query.after = after;
  const page = await client.request('listUserRecommendations', { path: { id: userId }, query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}

/** True when a write failed because the server state moved on (reload needed). */
export function conflicted(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'http' && error.status === 409;
}

export type VideoCard = components['schemas']['VideoCard'];
/** Server card by YouTube id; my_state is present only for a live viewer. */
export async function loadCard(client: Pick<ApiClient, 'request'>, youtubeId: string, signal?: AbortSignal): Promise<VideoCard | null> {
  try {
    return await client.request('getVideoCardByYoutube', { path: { youtube_id: youtubeId }, signal });
  } catch (error) {
    if (error instanceof ApiError && error.kind === 'http' && error.status === 404) return null;
    throw error;
  }
}

/** Public search card → grid card without any own state. */
export function toPublicCard(item: VideoCard): PublicCard {
  const seed = [...item.youtube_video_id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return {
    id: item.youtube_video_id,
    title: item.title ?? 'Название пока неизвестно',
    channel: item.channel?.name ?? '',
    handle: '',
    channelId: item.channel?.youtube_channel_id ?? '',
    channelUuid: item.channel?.id ?? '',
    durationSeconds: item.duration_seconds ?? 0,
    duration: duration(item.duration_seconds),
    hashtags: item.hashtags,
    source: item.url,
    channelSource: item.channel?.url ?? '',
    checkedAt: '',
    color: palette[seed % palette.length],
    tag: item.hashtags[0] ?? '',
    rating: item.rating.average ?? 0,
    votes: item.rating.count,
    publicCard: true
  };
}
