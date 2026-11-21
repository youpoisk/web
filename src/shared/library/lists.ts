import { ApiError, type ApiClient } from '../api/client.ts';
import type { components } from '../api/schema';

export type ListKind = 'library' | 'watchlist' | 'ratings';
export type ListItem = components['schemas']['VideoListItem'];
export type ListPage = { items: ListItem[]; next: string | null };
/** Card shape used by the site's existing video grid. */
export type ListCard = {
  id: string; title: string; channel: string; handle: string; channelId: string; durationSeconds: number; duration: string;
  hashtags: readonly string[]; source: string; channelSource: string; checkedAt: string; color: string; tag: string; rating: number;
  myRating: number | null; later: boolean; uuid: string; revision: number;
};
export type VideoState = components['schemas']['VideoState'];

const operations = { library: 'listLibrary', watchlist: 'listWatchlist', ratings: 'listRatings' } as const;
const palette = ['forest', 'city', 'mountain', 'music', 'tech', 'art'];

/** Maps a hash route to the viewer's own server list, if any. */
export function routeList(route: string): ListKind | null {
  return route === '/library' ? 'library' : route === '/watchlist' ? 'watchlist' : route === '/ratings' ? 'ratings' : null;
}

/** Loads one page of the viewer's own list (live Bearer via the client scope). */
export async function loadList(client: Pick<ApiClient, 'request'>, kind: ListKind, after: string | null, signal?: AbortSignal): Promise<ListPage> {
  const query: { limit: number; after?: string } = { limit: 30 };
  if (after) query.after = after;
  const page = await client.request(operations[kind], { query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
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
 * The key is dropped on any definite answer; 410 (no receipt stored) renews
 * the lease once and retries with a fresh key. */
export class StateWriter {
  readonly #client: Pick<ApiClient, 'request'>;
  readonly #uuid: () => string;
  #lease: Promise<string> | null = null;
  readonly #uncertain = new Map<string, { key: string; fingerprint: string }>();
  constructor(client: Pick<ApiClient, 'request'>, uuid: () => string) { this.#client = client; this.#uuid = uuid; }
  #anchor(): Promise<string> {
    if (this.#lease === null) {
      const pending = this.#client.request('issueOfflineLease', {}).then((r) => r.lease);
      this.#lease = pending;
      pending.catch(() => { if (this.#lease === pending) this.#lease = null; });
    }
    return this.#lease;
  }
  async patch(videoId: string, expected: number, change: { rating?: number | null; later?: boolean; added?: boolean }): Promise<VideoState> {
    const body = { expected_revision: expected, ...change };
    const fingerprint = JSON.stringify(body);
    const previous = this.#uncertain.get(videoId);
    let key = previous && previous.fingerprint === fingerprint ? previous.key : this.#uuid();
    for (let attempt = 0; ; attempt++) {
      const lease = await this.#anchor();
      this.#uncertain.set(videoId, { key, fingerprint });
      try {
        const result = await this.#client.request('patchVideoState', {
          path: { id: videoId }, header: { 'Idempotency-Key': key, 'X-Offline-Lease': lease }, body
        });
        this.#uncertain.delete(videoId);
        return result.state;
      } catch (error) {
        const definite = error instanceof ApiError && error.kind === 'http' && error.status !== 429 && error.status < 500;
        if (definite) this.#uncertain.delete(videoId);
        if (attempt === 0 && error instanceof ApiError && error.kind === 'http' && error.status === 410) { this.#lease = null; key = this.#uuid(); continue; }
        throw error;
      }
    }
  }
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
