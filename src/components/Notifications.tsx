import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { NOTIFICATIONS_CHANGED, loadNotifications, loadUnreadNotifications, markAllNotificationsRead, markNotificationRead, notificationTarget, notificationText, type NotificationItem } from '../shared/library/lists.ts';

const initial = (name: string) => [...name][0];
const when = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const BADGE_POLL_MS = 60000;
const changed = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));

/** Header badge: polls while the tab is visible and refreshes on changes. */
export function NotificationBadge({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [count, setCount] = useState(0);
  const generation = useRef(0), busy = useRef(false), again = useRef(false);
  useEffect(() => {
    const stamp = ++generation.current, ctl = new AbortController();
    // A change during a request queues one more read, so the newest count wins.
    const load = () => {
      if (document.visibilityState !== 'visible') return;
      if (busy.current) { again.current = true; return; }
      busy.current = true; again.current = false;
      loadUnreadNotifications(client, ctl.signal).then(n => { if (stamp === generation.current) setCount(n); }).catch(() => {}).finally(() => {
        if (stamp !== generation.current) return;
        busy.current = false;
        if (again.current) load();
      });
    };
    load();
    const timer = setInterval(load, BADGE_POLL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    document.addEventListener('visibilitychange', load);
    return () => { generation.current++; ctl.abort(); busy.current = false; again.current = false; clearInterval(timer); window.removeEventListener(NOTIFICATIONS_CHANGED, load); document.removeEventListener('visibilitychange', load); };
  }, [client]);
  return count > 0 ? <><i className="notification-dot" aria-hidden="true"/><span className="sr-only">, непрочитанных: {count}</span></> : null;
}

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
          <span className="avatar small-avatar" aria-hidden="true">{initial(n.actor.name || n.actor.login)}</span>
          <span className="notification-text"><span>{!n.read && <span className="sr-only">Новое: </span>}<bdi dir="auto">{notificationText(n)}</bdi></span><span className="small muted">{when(n.occurred_at)}</span></span>
        </button>
      </li>)}
    </ul>
    {next && <button className="secondary" disabled={loading} onClick={() => void load(next)}>Показать ещё</button>}
    <p role="status" className="small">{notice}</p>
  </section>;
}
