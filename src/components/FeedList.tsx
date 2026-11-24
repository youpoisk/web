import{UserName,ReviewText}from'./UserName.tsx';
import { Avatar } from './Avatar.tsx';
import{LoadMore}from'./LoadMore.tsx';
import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { groupFeedByVideo, loadFeed, readFeedView, saveFeedView, type FeedItem } from '../shared/library/lists.ts';
import { ReportButton } from './Moderation.tsx';

function FeedAuthor({ item: it, client }: { item: FeedItem; client: Pick<ApiClient, 'request'> }) {
  return <div className="feed-contribution">
    <div className="person-line">
      <Avatar client={client} userId={it.user.id} name={it.user.name||it.user.login} className="avatar small-avatar"/>
      <div><a href={`#/user/${it.user.id}`}><strong><bdi><UserName client={client} userId={it.user.id} name={it.user.name||it.user.login}/></bdi></strong></a><p className="muted small">{it.review !== null && it.rating !== null ? 'оценил и написал рецензию' : it.review !== null ? 'написал рецензию' : 'оценил видео'} · {new Date(it.changed_at).toLocaleDateString('ru-RU')}</p></div>
      {it.rating !== null && <b className="friend-score"><span className="rating-value">{it.rating}</span>/10</b>}
    </div>
    {it.review !== null && <p className="own-review-text" dir="auto"><ReviewText client={client} userId={it.user.id} text={it.review}/></p>}
    {it.review_id && <ReportButton client={client} kind="review" targetId={it.review_id} label="Пожаловаться на рецензию"/>}
  </div>;
}

const browserStorage = () => { try { return globalThis.localStorage; } catch { return undefined; } };

/** Grouping is presentation only: consumes the same permission-filtered cursor stream. */
export function FeedList({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [items, setItems] = useState<FeedItem[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null), [grouped, setGroupedState] = useState(() => readFeedView(browserStorage()));
  const setGrouped = (value: boolean) => { setGroupedState(value); saveFeedView(browserStorage(), value); };
  const generation = useRef(0), serial = useRef(0), reading = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current; reading.current = true; setLoading(true); setError(false);
    try {
      const page = await loadFeed(client, after, signal);
      if (stamp !== generation.current || read !== serial.current) return;
      const key = (x: FeedItem) => x.user.id + ':' + x.video.id;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => key(y) === key(x)))] : page.items);
      setNext(page.next);
    } catch {
      if (stamp === generation.current && read === serial.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally { if (stamp === generation.current && read === serial.current) { reading.current = false; setLoading(false); } }
  }
  useEffect(() => {
    generation.current++; const ctl = new AbortController(); void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client]);
  function read(after: string | null) { if (!reading.current) void load(after); }
  const groups = grouped ? groupFeedByVideo(items) : items.map(it => ({video: it.video, items: [it], changedAt: it.changed_at}));
  return <section aria-busy={loading}>
    <div className="filters" role="group" aria-label="Вид рекомендаций">
      <button className={!grouped ? 'selected' : ''} aria-pressed={!grouped} onClick={() => setGrouped(false)}>По авторам</button>
      <button className={grouped ? 'selected' : ''} aria-pressed={grouped} onClick={() => setGrouped(true)}>По видео</button>
    </div>
    {grouped && <p className="muted small">Одно видео — один пост с доступными вам оценками и рецензиями. Сначала видео с самыми свежими записями.{next ? ' «Показать ещё» дополнит общие посты более ранними оценками и рецензиями.' : ''}</p>}
    {loading && items.length === 0 && <p className="muted" role="status">Загружаем рекомендации…</p>}
    {error && <p className="notice" role="status">Не удалось загрузить рекомендации. <button className="text-button" disabled={loading} onClick={() => read(failedAfter)}>Повторить</button></p>}
    {!loading && !error && items.length === 0 && <p className="notice">У друзей и авторов, на которых вы подписаны, пока нет доступных оценок и рецензий.</p>}
    {groups.map(group => <article className="panel feed-post recommendation" key={grouped ? 'video:'+group.video.id : 'author:'+group.items[0].user.id+':'+group.video.id}>
      <a className="recommendation-poster" href={`#/video/${group.video.youtube_video_id}`}><img src={group.video.preview_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }}/></a>
      <div>
        <a className="card-title" href={`#/video/${group.video.youtube_video_id}`}>{group.video.title ?? 'Название пока неизвестно'}</a>
        {group.video.channel && <p className="small muted">{group.video.channel.name ?? 'Канал без названия'}</p>}
        {grouped && <p className="small muted">Показано авторов: {group.items.length}</p>}
        {group.items.map(it => <FeedAuthor key={it.user.id} item={it} client={client}/>)}
      </div>
    </article>)}
    <LoadMore cursor={next} loaded={items.length} busy={loading} error={error} onMore={()=>read(next)}/>
  </section>;
}
