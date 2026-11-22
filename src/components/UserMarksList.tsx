import React, { useEffect, useRef, useState } from 'react';
import { Eye, MinusCircle } from 'lucide-react';
import type { ApiClient } from '../shared/api/client.ts';
import { MARK_LABELS, loadUserMarks, type UserMark } from '../shared/library/lists.ts';
import { LoadMore } from './LoadMore.tsx';

/** «Отметки» of a profile (YP-102): own list, never mixed into recommendations.
 * The parent keys it by viewer, user and profile revision. */
export function UserMarksList({ client, userId, own, hidden = false }: { client: Pick<ApiClient, 'request'>; userId: string; own: boolean; hidden?: boolean }) {
  const [items, setItems] = useState<UserMark[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false), [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), more = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current;
    setLoading(true); setError(false);
    try {
      const page = await loadUserMarks(client, userId, after, signal);
      if (stamp !== generation.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.video.id === x.video.id))] : page.items);
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
  }, [client, userId]);
  async function loadMore() {
    if (more.current || !next) return;
    more.current = true;
    try { await load(next); } finally { more.current = false; }
  }
  return <section aria-busy={loading}>
    {loading && !items.length && <p className="muted" role="status">Загружаем отметки…</p>}
    {error && <p className="notice" role="alert">Не удалось загрузить отметки. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!loading && !error && !items.length && !next && <p className="notice">{own ? 'Вы ещё не отмечали видео как «Просмотрено» или «Неинтересно».' : hidden ? 'Пользователь скрыл свои отметки от вас.' : 'Нет отметок, которые вам видны.'}</p>}
    <div className="recommendation-list">{items.map(it => <article className="panel recommendation" key={it.video.id}>
      <a className="recommendation-poster" href={`#/video/${it.video.youtube_video_id}`}><img src={it.video.preview_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }}/></a>
      <div>
        <a className="card-title" href={`#/video/${it.video.youtube_video_id}`}>{it.video.title ?? 'Название пока неизвестно'}</a>
        {it.video.channel && <p className="small muted">{it.video.channel.name ?? 'Канал без названия'}</p>}
        <p className="small"><span className={`mark-badge mark-${it.mark}`}>{it.mark === 'watched' ? <Eye size={13} aria-hidden="true"/> : <MinusCircle size={13} aria-hidden="true"/>}{MARK_LABELS[it.mark]}</span>{' '}<span className="muted">{new Date(it.marked_at).toLocaleDateString('ru-RU')}</span></p>
      </div>
    </article>)}</div>
    <LoadMore cursor={next} loaded={items.length} busy={loading} error={error} onMore={() => void loadMore()}/>
  </section>;
}
