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

/** Own-state writes from the site: one offline lease per page session, a fresh
 * Idempotency-Key per command; an expired/absent lease (410) is renewed once. */
export class StateWriter {
  readonly #client: Pick<ApiClient, 'request'>;
  readonly #uuid: () => string;
  #lease: string | null = null;
  constructor(client: Pick<ApiClient, 'request'>, uuid: () => string) { this.#client = client; this.#uuid = uuid; }
  async #anchor(): Promise<string> {
    if (this.#lease === null) this.#lease = (await this.#client.request('issueOfflineLease', {})).lease;
    return this.#lease;
  }
  async patch(videoId: string, expected: number, change: { rating?: number | null; later?: boolean; added?: boolean }): Promise<VideoState> {
    for (let attempt = 0; ; attempt++) {
      const lease = await this.#anchor();
      try {
        const result = await this.#client.request('patchVideoState', {
          path: { id: videoId },
          header: { 'Idempotency-Key': this.#uuid(), 'X-Offline-Lease': lease },
          body: { expected_revision: expected, ...change }
        });
        return result.state;
      } catch (error) {
        if (attempt === 0 && error instanceof ApiError && error.kind === 'http' && error.status === 410) { this.#lease = null; continue; }
        throw error;
      }
    }
  }
}

/** True when a write failed because the server state moved on (reload needed). */
export function conflicted(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'http' && error.status === 409;
}
