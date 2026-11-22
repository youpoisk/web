import { Avatar } from './Avatar.tsx';
import{DeleteButton}from'./DeleteButton.tsx';
import {PeopleListSearch} from './PeopleListSearch.tsx';
import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { ApiError } from '../shared/api/client.ts';
import { filterPeopleList, friendLimitMessage, loadFriends, removeFriend, type Friend } from '../shared/library/lists.ts';



/** «Мои друзья» from the API with removal. Parent keys it by viewer. */
export function FriendsList({ client, searchable = false }: { client: Pick<ApiClient, 'request'>; searchable?: boolean }) {
  const [searchText,setSearchText]=useState('');
  const [items, setItems] = useState<Friend[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null), [message, setMessage] = useState('');
  const reading = useRef(false);
  const generation = useRef(0), more = useRef(false);

  async function remove(it: Friend) {
    if (busy || loading) return;
    setBusy(it.user.id); setMessage('');
    try {
      await removeFriend(client, it.user.id);
      setItems(prev => prev.filter(x => x.user.id !== it.user.id));
      setMessage('');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) { setItems(prev => prev.filter(x => x.user.id !== it.user.id)); setMessage(''); }
      else setMessage(friendLimitMessage(e) ?? 'Не удалось удалить из друзей.');
    } finally {
      setBusy(null);
    }
  }

  async function load(after: string | null, signal?: AbortSignal) {
    if(reading.current)return;
    reading.current=true;
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
      if (stamp === generation.current) {reading.current=false;setLoading(false);}
    }
  }
  useEffect(() => {
    generation.current++;
    const ctl = new AbortController();
    void load(null, ctl.signal);
    return () => { generation.current++; reading.current=false; ctl.abort(); };
  }, [client]);

  async function loadMore() {
    if (more.current || !next) return;
    more.current = true;
    try { await load(next); } finally { more.current = false; }
  }
  const searchTerm=searchable ? searchText.trim() : '';
  const visible=filterPeopleList(items,searchTerm);
  useEffect(()=>{if(searchTerm && next && !loading && !error && busy===null)void load(next);},[searchTerm,next,loading,error,busy]);
  return <section aria-busy={loading}>
    {searchable && <PeopleListSearch value={searchText} onChange={setSearchText}/>}
    {searchTerm && (loading || next!==null) && !error && <p className="muted" role="status">Ищем по всему списку…</p>}
    {searchTerm && !loading && !error && !next && visible.length===0 && <p className="notice" role="status">По вашему запросу никого не найдено.</p>}
    {loading && items.length === 0 && <p className="muted" role="status">Загружаем друзей…</p>}
    {error && <p className="notice" role="status">Не удалось загрузить друзей. <button className="text-button" disabled={loading || busy!==null} onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!searchTerm && !loading && !error && items.length === 0 && <p className="notice">У вас пока нет друзей в YouPoisk. Найдите людей во вкладке «Все».</p>}
    {message && <p role="status" className="small">{message}</p>}
    <div className="people-grid">{visible.map((it, i) => <div className="panel person-card" key={it.user.id}>
      <Avatar client={client} userId={it.user.id} name={it.user.name || it.user.login} className={`avatar person-avatar color${i % 3 + 1}`}/>
      <h2>{it.user.name || it.user.login}</h2>
      <p className="muted">@{it.user.login} · друзья с {new Date(it.since).toLocaleDateString('ru-RU')}</p>
      <div className="actions person-card-actions"><a className="secondary" href={`#/user/${it.user.id}`}>Открыть профиль</a><DeleteButton className="secondary person-remove" disabled={busy !== null || loading} onDelete={() => remove(it)}>Удалить из друзей</DeleteButton></div>
    </div>)}</div>
    {!searchTerm && next && <div className="actions"><button className="secondary" disabled={loading} onClick={() => void loadMore()}>Показать ещё</button></div>}
  </section>;
}
