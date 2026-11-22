import { Avatar } from './Avatar.tsx';
import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { loadFriendRatings, type FriendRating } from '../shared/library/lists.ts';

/** «Оценки друзей» on the server video page (YP-096). Parent keys it by viewer and video. */
export function FriendRatingsPanel({ client, videoId }: { client: Pick<ApiClient, 'request'>; videoId: string }) {
  const [items, setItems] = useState<FriendRating[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), more = useRef(false);

  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current;
    setLoading(true); setError(false);
    try {
      const page = await loadFriendRatings(client, videoId, after, signal);
      if (stamp !== generation.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.user.id === x.user.id))] : page.items);
      setNext(page.next);
    } catch {
      if (stamp === generation.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally {
      if (stamp === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    generation.current++; more.current = false; setItems([]); setNext(null);
    const ctl = new AbortController();
    void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client, videoId]);

  async function loadMore() {
    if (more.current || !next) return;
    more.current = true;
    try { await load(next); } finally { more.current = false; }
  }
  return <div className="panel friend-ratings" aria-busy={loading}>
    <h3>Оценки друзей</h3>
    {loading && items.length === 0 && <p className="small muted" role="status">Загружаем оценки друзей…</p>}
    {error && <p className="small muted" role="status">Не удалось загрузить оценки друзей. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!loading && !error && items.length === 0 && <p className="small muted">Никто из друзей не оценил это видео</p>}
    {items.map(it => <div className="person-line" key={it.user.id}>
      <Avatar client={client} userId={it.user.id} name={it.user.name || it.user.login} className="avatar small-avatar"/>
      <div><a href={`#/user/${it.user.id}`}><strong>{it.user.name || it.user.login}</strong></a><p className="small muted">@{it.user.login} · {new Date(it.rated_at).toLocaleDateString('ru-RU')}</p></div>
      <b className="friend-score"><span className="rating-value">{it.rating}</span>/10</b>
    </div>)}
    {next && <button className="text-button" disabled={loading} onClick={() => void loadMore()}>Показать ещё</button>}
  </div>;
}
