import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { loadFeed, type FeedItem } from '../shared/library/lists.ts';

/** «Рекомендации»: all visible ratings and reviews of the viewer's friends, newest first. */
export function FeedList({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), more = useRef(false);

  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current;
    setLoading(true); setError(false);
    try {
      const page = await loadFeed(client, after, signal);
      if (stamp !== generation.current) return;
      const key = (x: FeedItem) => x.user.id + ':' + x.video.id;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => key(y) === key(x)))] : page.items);
      setNext(page.next);
    } catch {
      if (stamp === generation.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally {
      if (stamp === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    generation.current++;
    const ctl = new AbortController();
    void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client]);

  async function loadMore() {
    if (more.current || !next) return;
    more.current = true;
    try { await load(next); } finally { more.current = false; }
  }
  return <section aria-busy={loading}>
    {loading && items.length === 0 && <p className="muted" role="status">Загружаем рекомендации друзей…</p>}
    {error && <p className="notice" role="status">Не удалось загрузить рекомендации. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!loading && !error && items.length === 0 && <p className="notice">Друзья пока ничего не оценили и не написали рецензий.</p>}
    {items.map(it => <article className="panel feed-post recommendation" key={it.user.id + ':' + it.video.id}>
      <a className="recommendation-poster" href={`#/video/${it.video.youtube_video_id}`}><img src={it.video.preview_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }}/></a>
      <div>
        <div className="person-line">
          <span className="avatar small-avatar" aria-hidden="true">{[...(it.user.name || it.user.login)][0]}</span>
          <div><a href={`#/user/${it.user.id}`}><strong>{it.user.name || it.user.login}</strong></a><p className="muted small">{it.review !== null && it.rating !== null ? 'оценил и написал рецензию' : it.review !== null ? 'написал рецензию' : 'оценил видео'} · {new Date(it.changed_at).toLocaleDateString('ru-RU')}</p></div>
          {it.rating !== null && <b className="friend-score">{it.rating}/10</b>}
        </div>
        <a className="card-title" href={`#/video/${it.video.youtube_video_id}`}>{it.video.title ?? 'Название пока неизвестно'}</a>
        {it.video.channel && <p className="small muted">{it.video.channel.name ?? 'Канал без названия'}</p>}
        {it.review !== null && <p className="own-review-text">{it.review}</p>}
      </div>
    </article>)}
    {next && <div className="actions"><button className="secondary" disabled={loading} onClick={() => void loadMore()}>Показать ещё</button></div>}
  </section>;
}
