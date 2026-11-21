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

export type PrivacySettings = components['schemas']['PrivacySettings'];
export type Audience = PrivacySettings['ratings'];
export type PrivacyField = 'ratings' | 'watchlist' | 'recommendations' | 'library' | 'reviews' | 'social';
/** The viewer's own privacy policies. */
export async function loadPrivacy(client: Pick<ApiClient, 'request'>, signal?: AbortSignal): Promise<PrivacySettings> {
  return (await client.request('getPrivacy', { signal })).settings;
}
/** Changes one policy at the known revision (409 when another device changed it). */
export async function changePrivacy(client: Pick<ApiClient, 'request'>, revision: number, field: PrivacyField, value: Audience): Promise<PrivacySettings> {
  return (await client.request('patchPrivacy', { body: { expected_revision: revision, [field]: value } })).settings;
}

export type FeedItem = components['schemas']['FeedItem'];
/** One page of «Рекомендации»: friends' visible ratings and reviews, newest first. */
export async function loadFeed(client: Pick<ApiClient, 'request'>, after: string | null, signal?: AbortSignal): Promise<{ items: FeedItem[]; next: string | null }> {
  const query: { limit: number; after?: string } = { limit: 30 };
  if (after) query.after = after;
  const page = await client.request('listFeed', { query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}

export type Person = components['schemas']['Person'];
export type FriendRequest = components['schemas']['FriendRequest'];
/** People search by login or name (never email); relation tells which action fits. */
export async function searchPeople(client: Pick<ApiClient, 'request'>, text: string, signal?: AbortSignal): Promise<Person[]> {
  return (await client.request('searchPeople', { query: { q: [...text.trim()].slice(0, 50).join(''), limit: 20 }, signal })).items;
}
/** One page of pending friend requests in one direction. */
export async function loadFriendRequests(client: Pick<ApiClient, 'request'>, direction: 'incoming' | 'outgoing', after: string | null, signal?: AbortSignal): Promise<{ items: FriendRequest[]; next: string | null }> {
  const query: { direction: 'incoming' | 'outgoing'; limit: number; after?: string } = { direction, limit: 30 };
  if (after) query.after = after;
  const page = await client.request('listFriendRequests', { query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}
export async function sendFriendRequest(client: Pick<ApiClient, 'request'>, userId: string) {
  return client.request('sendFriendRequest', { body: { user_id: userId } });
}
export async function acceptFriendRequest(client: Pick<ApiClient, 'request'>, id: string): Promise<Friend> {
  return client.request('acceptFriendRequest', { path: { id } });
}
export async function deleteFriendRequest(client: Pick<ApiClient, 'request'>, id: string): Promise<void> {
  await client.request('deleteFriendRequest', { path: { id } });
}
export async function removeFriend(client: Pick<ApiClient, 'request'>, userId: string): Promise<void> {
  await client.request('deleteFriend', { path: { id: userId } });
}

/** User-facing text for a rate-limited friend write (429), or null for other errors. */
export function friendLimitMessage(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 429) return null;
  if (error.code === 'too_many_pending_requests') return 'Слишком много заявок ждут ответа. Отмените часть отправленных заявок и попробуйте снова.';
  return 'Слишком много действий подряд. Попробуйте через минуту.';
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

export type Relationship = components['schemas']['Relationship'];
export async function loadRelationship(client: Pick<ApiClient,'request'>, id: string, signal?: AbortSignal): Promise<Relationship> {
 return client.request('getRelationship',{path:{id},signal});
}
export async function setFollowing(client: Pick<ApiClient,'request'>, id: string, enabled: boolean): Promise<void> {
 await client.request(enabled?'followUser':'unfollowUser',{path:{id}});
}
export async function loadFollowing(client: Pick<ApiClient,'request'>, direction: 'following'|'followers', after: string|null, signal?: AbortSignal): Promise<{items:Friend[];next:string|null}> {
 const query:{limit:number;after?:string}={limit:30};if(after)query.after=after;
 const page=await client.request(direction==='following'?'listFollowing':'listFollowers',{query,signal});
 return {items:page.items,next:page.next_cursor??null};
}

/** Local filtering of the viewer's paginated list; the UI walks remaining
 * pages while a query is active, so a match beyond page one is not missed. */
export function filterPeopleList<T extends {user:{login:string;name?:string|null}}>(items:readonly T[],text:string):T[]{
 const normalize=(value:string)=>value.normalize('NFC').toLocaleLowerCase('ru').trim().replace(/^@/,'').replace(/\s+/gu,' ');
 const query=normalize(text);
 return items.filter(item=>[item.user.login,item.user.name??''].some(value=>normalize(value).includes(query)));
}

export type Block = components['schemas']['Block'];
/** Only the viewer's own directed block list, including redacted unavailable users. */
export async function loadBlocks(client: Pick<ApiClient,'request'>, after: string|null, signal?: AbortSignal): Promise<{items:Block[];next:string|null}> {
 const query:{limit:number;after?:string}={limit:30};if(after)query.after=after;
 const page=await client.request('listBlocks',{query,signal});
 return {items:page.items,next:page.next_cursor??null};
}
export async function setBlocked(client: Pick<ApiClient,'request'>, id: string, enabled: boolean): Promise<void> {
 await client.request(enabled?'blockUser':'unblockUser',{path:{id}});
}

export type FeedVideoGroup = {video:FeedItem['video'];items:FeedItem[];changedAt:string};
/** Input is the server's newest-first visible stream. Keep the first (newest)
 * entry per author/video and the first metadata for a video; never merge by title.
 * Appending older pages enriches existing groups without changing their order. */
export function groupFeedByVideo(items:readonly FeedItem[]):FeedVideoGroup[]{
 const groups=new Map<string,FeedVideoGroup>();
 for(const item of items){
  let group=groups.get(item.video.id);
  if(!group){group={video:item.video,items:[],changedAt:item.changed_at};groups.set(item.video.id,group);}
  if(!group.items.some(existing=>existing.user.id===item.user.id))group.items.push(item);
 }
 return [...groups.values()];
}

// Direct messages (YP-079). The server checks friendship/blocks on send.
export type Conversation = components['schemas']['ConversationItem'];
export type Message = components['schemas']['Message'];
export type MessagePage = components['schemas']['MessagePage'];
export const MAX_MESSAGE_LENGTH = 2000;
export async function loadConversations(client: Pick<ApiClient, 'request'>, after: string | null, signal?: AbortSignal): Promise<{ items: Conversation[]; next: string | null }> {
  const query: { limit: number; after?: string } = { limit: 30 };
  if (after) query.after = after;
  const page = await client.request('listConversations', { query, signal });
  return { items: page.items, next: page.next_cursor ?? null };
}
export async function loadMessages(client: Pick<ApiClient, 'request'>, userId: string, before: number | null, signal?: AbortSignal): Promise<MessagePage> {
  const query: { limit: number; before?: number } = { limit: 50 };
  if (before) query.before = before;
  return client.request('listMessages', { path: { id: userId }, query, signal });
}
/** clientMessageId must be reused when retrying the same message. */
export async function sendMessage(client: Pick<ApiClient, 'request'>, userId: string, clientMessageId: string, text: string, videoId: string | null = null): Promise<Message> {
  const body: { client_message_id: string; body?: string; video_id?: string } = { client_message_id: clientMessageId };
  if (text.trim()) body.body = text;
  if (videoId) body.video_id = videoId;
  return (await client.request('sendMessage', { path: { id: userId }, body })).message;
}
export async function markConversationRead(client: Pick<ApiClient, 'request'>, userId: string, through: number) {
  return client.request('markConversationRead', { path: { id: userId }, body: { through_seq: through } });
}
/** Oldest first, one entry per seq (a later copy replaces an earlier one). */
export function mergeMessages(prev: Message[], next: Message[]): Message[] {
  const bySeq = new Map<number, Message>();
  for (const m of [...prev, ...next]) bySeq.set(m.seq, m);
  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}
/** seq is consecutive per conversation. Given the loaded messages (any order,
 * including the viewer's own just-sent ones) and a newest-first page, returns
 * the before-cursor that fetches the highest missing seq between the oldest
 * loaded message and the page, or null when that whole range is present. */
export function messageGap(loaded: Message[], page: Message[]): number | null {
  if (!loaded.length || !page.length) return null;
  const present = new Set([...loaded, ...page].map(m => m.seq));
  const lowest = Math.min(...loaded.map(m => m.seq));
  for (let seq = Math.min(...page.map(m => m.seq)) - 1; seq > lowest; seq--) {
    if (!present.has(seq)) return seq + 1;
  }
  return null;
}
/** User-facing text for a failed send; the default keeps the same key for a retry. */
export function messageError(error: unknown): string {
  const status = error instanceof ApiError && error.kind === 'http' ? error.status : 0;
  if (status === 403) return 'Писать можно только друзьям.';
  if (status === 404) return 'Переписка недоступна.';
  if (status === 409) return 'Это сообщение уже было отправлено с другим текстом. Обновите переписку.';
  if (status === 422) return `Сообщение пустое или длиннее ${MAX_MESSAGE_LENGTH} символов.`;
  if (status === 429) return 'Слишком много сообщений подряд. Попробуйте через минуту.';
  return 'Не удалось отправить сообщение. Повторите — дубль не появится.';
}

