import {PeopleListSearch,peopleSearchPlaceholder} from './PeopleListSearch.tsx';
import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { NOTIFICATIONS_CHANGED, filterPeopleList, acceptFriendRequest, deleteFriendRequest, friendLimitMessage, loadFriendRequests, searchPeople, sendFriendRequest, type FriendRequest, type Person } from '../shared/library/lists.ts';

const initial = (name: string) => [...name][0];

/** Pending friend requests in one direction with accept/decline or cancel. Parent keys it by viewer. */
export function FriendRequestsList({ client, direction }: { client: Pick<ApiClient, 'request'>; direction: 'incoming' | 'outgoing' }) {
  const [searchText,setSearchText]=useState('');
  const [items, setItems] = useState<FriendRequest[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null), [message, setMessage] = useState('');
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const reading = useRef(false);
  const generation = useRef(0);

  async function load(after: string | null, signal?: AbortSignal) {
    if(reading.current)return;
    reading.current=true;
    const stamp = generation.current;
    setLoading(true); setError(false);
    try {
      const page = await loadFriendRequests(client, direction, after, signal);
      if (stamp !== generation.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.id === x.id))] : page.items);
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
  }, [client, direction]);

  async function act(item: FriendRequest, accept: boolean) {
    if (busy || loading) return;
    setBusy(item.id); setMessage('');
    try {
      if (accept) await acceptFriendRequest(client, item.id); else await deleteFriendRequest(client, item.id);
      setItems(prev => prev.filter(x => x.id !== item.id));
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
      setMessage(accept ? `Теперь вы друзья с ${item.user.name || item.user.login}.` : direction === 'incoming' ? 'Заявка отклонена.' : 'Заявка отменена.');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) { setItems(prev => prev.filter(x => x.id !== item.id)); setMessage('Этой заявки уже нет.'); window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED)); }
      else setMessage(friendLimitMessage(e) ?? 'Не удалось выполнить действие. Попробуйте ещё раз.');
    } finally {
      setBusy(null);
    }
  }
  const searchTerm=searchText.trim();
  const visible=filterPeopleList(items,searchTerm);
  useEffect(()=>{if(searchTerm && next && !loading && !error && busy===null)void load(next);},[searchTerm,next,loading,error,busy]);
  return <section aria-busy={loading}>
    <PeopleListSearch value={searchText} onChange={setSearchText}/>
    {searchTerm && (loading || next!==null) && !error && <p className="muted" role="status">Ищем по всему списку…</p>}
    {searchTerm && !loading && !error && !next && visible.length===0 && <p className="notice" role="status">По вашему запросу никого не найдено.</p>}
    {loading && items.length === 0 && <p className="muted" role="status">Загружаем заявки…</p>}
    {error && <p className="notice" role="status">Не удалось загрузить заявки. <button className="text-button" disabled={loading || busy!==null} onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!searchTerm && !loading && !error && items.length === 0 && <p className="notice">{direction === 'incoming' ? 'Новых заявок в друзья нет.' : 'Вы не отправляли заявок, которые ещё ждут ответа.'}</p>}
    {message && <p role="status" className="small">{message}</p>}
    <div className="people-grid">{visible.map((it, i) => <div className="panel person-card" key={it.id}>
      <span className={`avatar person-avatar color${i % 3 + 1}`} aria-hidden="true">{initial(it.user.name || it.user.login)}</span>
      <h2>{it.user.name || it.user.login}</h2>
      <p className="muted">@{it.user.login} · {direction === 'incoming' ? 'хочет добавить вас в друзья' : 'заявка отправлена'} {new Date(it.created_at).toLocaleDateString('ru-RU')}</p>
      <a href={`#/user/${it.user.id}`}>Открыть профиль</a>
      <div className="actions">{direction === 'incoming'
        ? <><button className="primary" disabled={busy !== null || loading} onClick={() => void act(it, true)}>Принять</button><button className="secondary" disabled={busy !== null || loading} onClick={() => void act(it, false)}>Отклонить</button></>
        : <button className="secondary" disabled={busy !== null || loading} onClick={() => void act(it, false)}>Отменить заявку</button>}</div>
    </div>)}</div>
    {!searchTerm && next && <div className="actions"><button className="secondary" disabled={loading} onClick={() => void load(next)}>Показать ещё</button></div>}
  </section>;
}

/** People search by login or name with the action that fits each relation. */
export function PeopleSearch({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [text, setText] = useState('');
  const [items, setItems] = useState<Person[] | null>(null);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    const query = text.trim();
    generation.current++;
    const stamp = generation.current;
    if ([...query.replace(/^@/, '')].length < 2) { setItems(null); setError(''); setLoading(false); return; }
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true); setError('');
      searchPeople(client, query, ctl.signal)
        .then(found => { if (stamp === generation.current) setItems(found); })
        .catch(() => { if (stamp === generation.current && !ctl.signal.aborted) setError('Не удалось выполнить поиск.'); })
        .finally(() => { if (stamp === generation.current) setLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [client, text]);

  async function send(person: Person) {
    if (busy) return;
    setBusy(person.user.id); setError('');
    try {
      const result = await sendFriendRequest(client, person.user.id);
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
      const relation = result.status === 'incoming' ? 'incoming' : 'outgoing';
      setItems(prev => prev && prev.map(x => x.user.id === person.user.id ? { ...x, relation } : x));
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setItems(prev => prev && prev.map(x => x.user.id === person.user.id ? { ...x, relation: 'friend' } : x));
      else setError(friendLimitMessage(e) ?? 'Не удалось отправить заявку.');
    } finally {
      setBusy(null);
    }
  }
  const status: Record<Person['relation'], string> = { self: 'Это вы', friend: 'У вас в друзьях', incoming: 'Ждёт вашего ответа во вкладке «Заявки»', outgoing: 'Заявка отправлена', none: '' };
  return <section className="panel">
    <h2>Найти людей</h2>
    <input aria-label="Поиск людей по логину или имени" placeholder={peopleSearchPlaceholder} value={text} maxLength={60} onChange={e => setText(e.target.value)}/>
    {loading && <p className="small muted" role="status">Ищем…</p>}
    {error && <p className="small" role="status">{error}</p>}
    {items && !loading && items.length === 0 && <p className="small muted">Никого не нашли.</p>}
    {items && items.map(it => <div className="person-line" key={it.user.id}>
      <span className="avatar small-avatar" aria-hidden="true">{initial(it.user.name || it.user.login)}</span>
      <div><a href={`#/user/${it.user.id}`}><strong>{it.user.name || it.user.login}</strong></a><p className="small muted">@{it.user.login}{status[it.relation] ? ' · ' + status[it.relation] : ''}</p></div>
      {it.relation === 'none' && <button className="secondary" disabled={busy !== null || loading} onClick={() => void send(it)}>Добавить в друзья</button>}
    </div>)}
  </section>;
}
