import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { ApiError } from '../shared/api/client.ts';
import { friendLimitMessage, loadFriends, removeFriend, type Friend } from '../shared/library/lists.ts';

const confirmRemove = (it: Friend) => typeof window === 'undefined' || window.confirm(`Удалить ${it.user.name || it.user.login} из друзей?`);

/** «Мои друзья» from the API with removal. Parent keys it by viewer. */
export function FriendsList({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [items, setItems] = useState<Friend[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null), [message, setMessage] = useState('');
  const generation = useRef(0), more = useRef(false);

  async function remove(it: Friend) {
    if (busy || !confirmRemove(it)) return;
    setBusy(it.user.id); setMessage('');
    try {
      await removeFriend(client, it.user.id);
      setItems(prev => prev.filter(x => x.user.id !== it.user.id));
      setMessage(`${it.user.name || it.user.login} больше не в друзьях.`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) { setItems(prev => prev.filter(x => x.user.id !== it.user.id)); setMessage('Вы уже не друзья.'); }
      else setMessage(friendLimitMessage(e) ?? 'Не удалось удалить из друзей.');
    } finally {
      setBusy(null);
    }
  }

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
    {!loading && !error && items.length === 0 && <p className="notice">У вас пока нет друзей в YouPoisk. Найдите людей во вкладке «Все».</p>}
    {message && <p role="status" className="small">{message}</p>}
    <div className="people-grid">{items.map((it, i) => <div className="panel person-card" key={it.user.id}>
      <span className={`avatar person-avatar color${i % 3 + 1}`} aria-hidden="true">{[...(it.user.name || it.user.login)][0]}</span>
      <h2>{it.user.name || it.user.login}</h2>
      <p className="muted">@{it.user.login} · друзья с {new Date(it.since).toLocaleDateString('ru-RU')}</p>
      <a href={`#/user/${it.user.id}`}>Открыть профиль</a>
      <div className="actions"><button className="text-button" disabled={busy !== null} onClick={() => void remove(it)}>Удалить из друзей</button></div>
    </div>)}</div>
    {next && <div className="actions"><button className="secondary" disabled={loading} onClick={() => void loadMore()}>Показать ещё</button></div>}
  </section>;
}
