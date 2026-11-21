import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { MAX_MESSAGE_LENGTH, loadConversations, loadMessages, markConversationRead, mergeMessages, messageError, messageGap, sendMessage, type Conversation, type Message } from '../shared/library/lists.ts';

const initial = (name: string) => [...name][0];
const when = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const preview = (m: Message) => (m.mine ? 'Вы: ' : '') + (m.body ?? (m.video ? `видео «${m.video.title ?? m.video.youtube_video_id}»` : ''));
const POLL_MS = 15000;

/** Account-keyed by the parent. Late responses after unmount are dropped. */
export function ConversationsList({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [items, setItems] = useState<Conversation[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false), [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), reading = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    if (reading.current) return;
    const stamp = generation.current; reading.current = true; setLoading(true); setError(false);
    try {
      const page = await loadConversations(client, after, signal);
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
  return <section className="panel" aria-busy={loading}>
    <div className="actions"><button className="secondary" disabled={loading} onClick={() => void load(null)}>Обновить</button></div>
    {loading && !items.length && <p role="status">Загружаем переписки…</p>}
    {error && <p role="alert">Не удалось загрузить переписки. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!loading && !error && !items.length && <p className="notice">Переписок пока нет. Написать другу можно из его профиля.</p>}
    {items.map(it => <a className={`conversation-line${it.unread_count ? ' unread' : ''}`} key={it.id} href={`#/messages/${it.user.id}`}>
      <span className="avatar small-avatar" aria-hidden="true">{initial(it.user.name || it.user.login)}</span>
      <span className="conversation-text"><strong>{it.user.name || it.user.login}</strong><span className="small muted"><bdi dir="auto">{preview(it.last_message)}</bdi></span></span>
      <span className="small muted">{when(it.last_message.created_at)}</span>
      {it.unread_count > 0 && <span className="unread-badge"><span className="sr-only">Непрочитанных: </span>{it.unread_count}</span>}
    </a>)}
    {next && <button className="secondary" disabled={loading} onClick={() => void load(next)}>Показать ещё</button>}
  </section>;
}

const MAX_GAP_PAGES = 20;

export function ChatThread({ client, userId }: { client: Pick<ApiClient, 'request'>; userId: string }) {
  const [items, setItems] = useState<Message[]>([]), [user, setUser] = useState<{ login: string; name: string | null } | null>(null);
  const [canSend, setCanSend] = useState(false), [otherRead, setOtherRead] = useState(0), [older, setOlder] = useState<number | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [text, setText] = useState(''), [sending, setSending] = useState(false), [notice, setNotice] = useState('');
  const [olderLoading, setOlderLoading] = useState(false);
  const pending = useRef<{ key: string; text: string } | null>(null), generation = useRef(0), serial = useRef(0), readUpTo = useRef(0);
  const loaded = useRef<Message[]>([]), initialized = useRef(false), olderBusy = useRef(false);
  // The ref mirrors the rendered list so async merges never use a stale copy.
  const apply = (incoming: Message[]) => { loaded.current = mergeMessages(loaded.current, incoming); setItems(loaded.current); };
  async function refresh(signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current;
    const live = () => stamp === generation.current && read === serial.current;
    try {
      const page = await loadMessages(client, userId, null, signal);
      if (!live()) return;
      // seq is consecutive: after missed polls, fill the hole before showing
      // the page as complete or marking it read.
      let collected = page.items, gap = messageGap(loaded.current, collected);
      for (let i = 0; gap !== null && i < MAX_GAP_PAGES; i++) {
        const more = await loadMessages(client, userId, gap, signal);
        if (!live()) return;
        collected = [...collected, ...more.items];
        gap = more.items.length ? messageGap(loaded.current, collected) : null;
      }
      setUser({ login: page.user.login, name: page.user.name }); setCanSend(page.can_send); setOtherRead(page.other_read_seq); setError('');
      apply(collected);
      if (!initialized.current) { initialized.current = true; setOlder(page.next_before ?? null); }
      if (gap !== null) { setNotice('Часть новых сообщений не загрузилась. Обновите страницу.'); return; }
      const latest = page.items[0]?.seq ?? 0;
      if (document.visibilityState === 'visible' && latest > Math.max(page.read_seq, readUpTo.current)) {
        readUpTo.current = latest;
        markConversationRead(client, userId, latest).catch(() => { readUpTo.current = 0; });
      }
    } catch (failure) {
      if (live() && !signal?.aborted) setError(failure instanceof ApiError && failure.status === 404 ? 'Переписка недоступна: пользователь не найден или ограничил общение.' : 'Не удалось загрузить переписку.');
    } finally { if (stamp === generation.current) setLoading(false); }
  }
  useEffect(() => {
    generation.current++; readUpTo.current = 0; pending.current = null; loaded.current = []; initialized.current = false;
    setItems([]); setUser(null); setOlder(null); setLoading(true); setError(''); setText(''); setNotice('');
    const ctl = new AbortController(); void refresh(ctl.signal);
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void refresh(ctl.signal); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(ctl.signal); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { generation.current++; ctl.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [client, userId]);
  async function loadOlder() {
    if (!older || olderBusy.current) return;
    const stamp = generation.current; olderBusy.current = true; setOlderLoading(true);
    try {
      const page = await loadMessages(client, userId, older);
      if (stamp !== generation.current) return;
      apply(page.items); setOlder(page.next_before ?? null);
    } catch { if (stamp === generation.current) setNotice('Не удалось загрузить ранние сообщения.'); }
    finally { olderBusy.current = false; if (stamp === generation.current) setOlderLoading(false); }
  }
  async function send() {
    if (sending || !text.trim()) return;
    const stamp = generation.current;
    // The same text keeps its key, so a retry after an unclear failure never duplicates.
    const attempt = pending.current?.text === text ? pending.current : { key: crypto.randomUUID(), text };
    pending.current = attempt; setSending(true); setNotice('');
    try {
      const message = await sendMessage(client, userId, attempt.key, attempt.text);
      if (stamp !== generation.current) return;
      pending.current = null; setText(current => current === attempt.text ? '' : current); apply([message]);
    } catch (failure) {
      if (stamp !== generation.current) return;
      if (failure instanceof ApiError && [403, 404, 409, 422].includes(failure.status)) pending.current = null;
      if (failure instanceof ApiError && failure.status === 403) setCanSend(false);
      setNotice(messageError(failure));
    } finally { if (stamp === generation.current) setSending(false); }
  }
  const lastMine = [...items].reverse().find(m => m.mine);
  const title = user ? user.name || user.login : 'Переписка';
  return <section className="panel chat" aria-busy={loading} aria-labelledby="chat-title">
    <div className="chat-head"><a href="#/messages">← Все переписки</a><h2 id="chat-title">{user ? <a href={`#/user/${userId}`}>{title} <span className="small muted">@{user.login}</span></a> : title}</h2></div>
    {loading && <p role="status">Загружаем переписку…</p>}
    {error && <p role="alert">{error} <button className="text-button" onClick={() => { setLoading(true); void refresh(); }}>Повторить</button></p>}
    {older && <button className="secondary" disabled={olderLoading} onClick={() => void loadOlder()}>{olderLoading ? 'Загружаем…' : 'Показать ранние сообщения'}</button>}
    {!loading && !error && !items.length && <p className="notice">Сообщений пока нет.</p>}
    <ol className="messages-list" aria-label="Сообщения">
      {items.map(m => <li className={`message${m.mine ? ' mine' : ''}`} key={m.seq}>
        <span className="sr-only">{m.mine ? 'Вы' : title}: </span>
        {m.body && <p><bdi dir="auto">{m.body}</bdi></p>}
        {m.video && <a href={`#/video/${m.video.youtube_video_id}`}>▶ <bdi dir="auto">{m.video.title ?? m.video.youtube_video_id}</bdi></a>}
        <span className="small muted">{when(m.created_at)}{m === lastMine && otherRead >= m.seq ? ' · прочитано' : ''}</span>
      </li>)}
    </ol>
    {user && !canSend && <p className="notice">Писать можно только друзьям. История переписки сохраняется.</p>}
    {user && canSend && <form className="chat-compose" onSubmit={e => { e.preventDefault(); void send(); }}>
      <label className="sr-only" htmlFor="chat-text">Сообщение</label>
      <textarea id="chat-text" value={text} maxLength={MAX_MESSAGE_LENGTH} rows={3} placeholder="Сообщение" onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }}/>
      <div className="actions"><span className="small muted">{[...text].length}/{MAX_MESSAGE_LENGTH} · Ctrl+Enter — отправить</span><button className="primary" type="submit" disabled={sending || !text.trim()}>{sending ? 'Отправляем…' : 'Отправить'}</button></div>
    </form>}
    <p role="status" className="small">{notice}</p>
  </section>;
}
