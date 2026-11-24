import{UserName}from'./UserName.tsx';
import { Avatar } from './Avatar.tsx';
import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { NOTIFICATIONS_CHANGED, loadNotifications, markAllNotificationsRead, markNotificationRead, notificationTarget, notificationText, type NotificationItem } from '../shared/library/lists.ts';

const when = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const changed = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));

/** Counter is owned by the shared minute activity poll; no extra HTTP loop. */
export function NotificationBadge({count=0}:{count?:number}){return count>0?<><i className="notification-dot" aria-hidden="true"/><span className="sr-only">, непрочитанных: {count}</span></>:null;}

/** Account-keyed by the parent. Late responses after unmount are dropped. */
export function NotificationsList({ client, open }: { client: Pick<ApiClient, 'request'>; open: (route: string, tab?: string) => void }) {
  const [items, setItems] = useState<NotificationItem[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false), [failedAfter, setFailedAfter] = useState<string | null>(null), [notice, setNotice] = useState('');
  const generation = useRef(0), reading = useRef(false), saving = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    if (reading.current) return;
    const stamp = generation.current; reading.current = true; setLoading(true); setError(false);
    try {
      const page = await loadNotifications(client, after, signal);
      if (stamp !== generation.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.id === x.id))] : page.items); setNext(page.next);
    } catch {
      if (stamp === generation.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally { if (stamp === generation.current) { reading.current = false; setLoading(false); } }
  }
  useEffect(() => {
    generation.current++; reading.current = false; const ctl = new AbortController(); void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client]);
  async function follow(n: NotificationItem) {
    const target = notificationTarget(n);
    if (!n.read) {
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      markNotificationRead(client, n.id).catch(() => {}).finally(changed);
    }
    open(target.route, target.tab);
  }
  async function readAll() {
    const newest = items[0];
    if (!newest || saving.current) return;
    const stamp = generation.current; saving.current = true; setNotice('');
    try {
      await markAllNotificationsRead(client, newest.occurred_at);
      if (stamp !== generation.current) return;
      setItems(prev => prev.map(x => Date.parse(x.occurred_at) <= Date.parse(newest.occurred_at) ? { ...x, read: true } : x));
      setNotice('');
      changed();
    } catch { if (stamp === generation.current) setNotice('Не удалось отметить уведомления. Повторите позже.'); }
    finally { saving.current = false; }
  }
  const unread = items.some(x => !x.read);
  return <section className="panel" aria-busy={loading}>
    <div className="actions"><button className="secondary" disabled={loading} onClick={() => void load(null)}>Обновить</button>{unread && <button className="secondary" onClick={() => void readAll()}>Отметить все прочитанными</button>}</div>
    {loading && !items.length && <p role="status">Загружаем уведомления…</p>}
    {error && <p role="alert">Не удалось загрузить уведомления. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!loading && !error && !items.length && <p className="notice">Уведомлений пока нет. Здесь появятся заявки в друзья и новые сообщения.</p>}
    <ul className="notification-list">
      {items.map(n => <li key={n.id} className={n.read ? 'notification' : 'notification unread'}>
        <button className="notification-button" onClick={() => void follow(n)}>
          <Avatar client={client} userId={n.actor.id} name={n.actor.name || n.actor.login} className="avatar small-avatar"/>
          <span className="notification-text"><span>{!n.read && <span className="sr-only">Новое: </span>}<bdi dir="auto">{(()=>{const name=n.actor.name||n.actor.login;const text=notificationText(n);const at=text.indexOf(name);return at<0?text:<>{text.slice(0,at)}<UserName client={client} userId={n.actor.id} name={name}/>{text.slice(at+name.length)}</>})()}</bdi></span><span className="small muted">{when(n.occurred_at)}</span></span>
        </button>
      </li>)}
    </ul>
    {next && <button className="secondary" disabled={loading} onClick={() => void load(next)}>Показать ещё</button>}
    <p role="status" className="small">{notice}</p>
  </section>;
}
