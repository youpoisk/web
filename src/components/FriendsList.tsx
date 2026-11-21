import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { loadFriends, type Friend } from '../shared/library/lists.ts';

/** «Мои друзья» from the API. Parent keys it by viewer. */
export function FriendsList({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [items, setItems] = useState<Friend[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), more = useRef(false);

  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current;
    setLoading(true); setError(false);
    try {
      const page = await loadFriends(client, after, signal);
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
    {loading && items.length === 0 && <p className="muted" role="status">Загружаем друзей…</p>}
    {error && <p className="notice" role="status">Не удалось загрузить друзей. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!loading && !error && items.length === 0 && <p className="notice">У вас пока нет друзей в YouPoisk.</p>}
    <div className="people-grid">{items.map((it, i) => <div className="panel person-card" key={it.user.id}>
      <span className={`avatar person-avatar color${i % 3 + 1}`} aria-hidden="true">{[...(it.user.name || it.user.login)][0]}</span>
      <h2>{it.user.name || it.user.login}</h2>
      <p className="muted">@{it.user.login} · друзья с {new Date(it.since).toLocaleDateString('ru-RU')}</p>
    </div>)}</div>
    {next && <div className="actions"><button className="secondary" disabled={loading} onClick={() => void loadMore()}>Показать ещё</button></div>}
  </section>;
}
