import{SystemConversationLink}from'./SystemMessages.tsx';
import type{ResponseBody}from'../shared/api/client.ts';
import{createChatPolling}from'../shared/library/chat-polling.ts';
import{UserName}from'./UserName.tsx';
import { Avatar } from './Avatar.tsx';
import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { ReportButton } from './Moderation.tsx';
import { MAX_MESSAGE_LENGTH, loadConversations, loadMessages, markConversationRead, mergeMessages, messageError, messageGap, sendMessage, NOTIFICATIONS_CHANGED, type Conversation, type Message } from '../shared/library/lists.ts';

const when = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const preview = (m: Message) => (m.mine ? 'Вы: ' : '') + (m.body ?? (m.video ? `видео «${m.video.title ?? m.video.youtube_video_id}»` : ''));


/** Account-keyed by the parent. Late responses after unmount are dropped. */
export function ConversationsList({ client }: { client: Pick<ApiClient, 'request'> }) {
  const[system,setSystem]=useState<ResponseBody<'getSystemSummary'>|null>(null);
  const [items, setItems] = useState<Conversation[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false), [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), reading = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    if (reading.current) return;
    const stamp = generation.current; reading.current = true; setLoading(true); setError(false);
    try {
      const [page,summary] = await Promise.all([loadConversations(client, after, signal),client.request('getSystemSummary',{signal})]);
      if (stamp !== generation.current) return;
      setSystem(summary);setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.id === x.id))] : page.items); setNext(page.next);
    } catch {
      if (stamp === generation.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally { if (stamp === generation.current) { reading.current = false; setLoading(false); } }
  }
  useEffect(() => {
    generation.current++; reading.current = false; const ctl = new AbortController(); void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client]);
  const empty = !loading && !error && !items.length&&!system?.last_message;
  return <section className="panel conversations-panel" aria-busy={loading}>
    <div className="list-head">
      <h2>Диалоги{(items.length > 0||system?.last_message) && <span className="list-count">{items.length+(system?.last_message?1:0)}{next ? '+' : ''}</span>}</h2>
      <button className="secondary refresh-button" disabled={loading} onClick={() => void load(null)}><RefreshCw size={15} aria-hidden="true" className={loading ? 'spin' : undefined}/>Обновить</button>
    </div>
    {loading && !items.length && <p className="muted list-status" role="status">Загружаем переписки…</p>}
    {error && <p className="list-status" role="alert">Не удалось загрузить переписки. <button className="text-button" onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {empty && <div className="empty conversations-empty">
      <span className="empty-icon" aria-hidden="true"><MessageCircle size={28}/></span>
      <h2>Переписок пока нет</h2>
      <p>Писать можно только друзьям. Откройте профиль друга и нажмите «Написать сообщение», чтобы начать диалог.</p>
      <a className="primary" href="#/friends">Перейти к друзьям</a>
    </div>}
    {system&&<SystemConversationLink summary={system}/>}
    {items.map(it => <a className={`conversation-line${it.unread_count ? ' unread' : ''}`} key={it.id} href={`#/messages/${it.user.id}`}>
      <Avatar client={client} userId={it.user.id} name={it.user.name||it.user.login} className="avatar small-avatar"/>
      <span className="conversation-text"><strong><UserName client={client} userId={it.user.id} name={it.user.name||it.user.login}/></strong><span className="small muted"><bdi dir="auto">{preview(it.last_message)}</bdi></span></span>
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
  const loaded = useRef<Message[]>([]), initialized = useRef(false), olderBusy = useRef(false), polling = useRef(false);
  // The ref mirrors the rendered list so async merges never use a stale copy.
  const apply = (incoming: Message[]) => { loaded.current = mergeMessages(loaded.current, incoming); setItems(loaded.current); };
  const schedule=useRef<ReturnType<typeof createChatPolling>|null>(null),observed=useRef({read:0,canSend:false});
  async function refresh(signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current;
    polling.current = true;
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
      if(collected.some(item=>item.seq>(loaded.current.at(-1)?.seq??0))||page.other_read_seq!==observed.current.read||page.can_send!==observed.current.canSend)schedule.current?.activity();observed.current={read:page.other_read_seq,canSend:page.can_send};
      setUser({ login: page.user.login, name: page.user.name }); setCanSend(page.can_send); setOtherRead(page.other_read_seq); setError('');
      apply(collected);
      if (!initialized.current) { initialized.current = true; setOlder(page.next_before ?? null); }
      if (gap !== null) { setNotice('Часть новых сообщений не загрузилась. Обновите страницу.'); return; }
      const latest = page.items[0]?.seq ?? 0;
      if (document.visibilityState === 'visible' && latest > Math.max(page.read_seq, readUpTo.current)) {
        readUpTo.current = latest;
        markConversationRead(client, userId, latest).then(() => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))).catch(() => { readUpTo.current = 0; });
      }
    } catch (failure) {
      if (live() && !signal?.aborted) setError(failure instanceof ApiError && failure.status === 404 ? 'Переписка недоступна: пользователь не найден или ограничил общение.' : 'Не удалось загрузить переписку.');
    } finally { if (live()) { setLoading(false); polling.current = false; } }
  }
  useEffect(() => {
    generation.current++; readUpTo.current = 0; pending.current = null; loaded.current = []; initialized.current = false; polling.current = false;
    setItems([]); setUser(null); setOlder(null); setLoading(true); setError(''); setText(''); setNotice('');
    const ctl=new AbortController();observed.current={read:0,canSend:false};
    const scheduler=createChatPolling({read:()=>refresh(ctl.signal),visible:()=>document.visibilityState==='visible',now:Date.now,later:(fn,delay)=>setTimeout(fn,delay),cancel:timer=>clearTimeout(timer as ReturnType<typeof setTimeout>)});schedule.current=scheduler;
    const onVisible=()=>scheduler.refresh();
    document.addEventListener('visibilitychange',onVisible);window.addEventListener('focus',onVisible);
    return()=>{generation.current++;ctl.abort();scheduler.close();schedule.current=null;document.removeEventListener('visibilitychange',onVisible);window.removeEventListener('focus',onVisible)};
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
      pending.current = null;schedule.current?.activity(); setText(current => current === attempt.text ? '' : current); apply([message]);
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
    <div className="chat-head"><a href="#/messages">← Все переписки</a><h2 id="chat-title">{user ? <a href={`#/user/${userId}`}><UserName client={client} userId={userId} name={title}/> <span className="small muted">@{user.login}</span></a> : title}</h2></div>
    {loading && <p role="status">Загружаем переписку…</p>}
    {error && <p role="alert">{error} <button className="text-button" onClick={() => { setLoading(true); schedule.current?.refresh(); }}>Повторить</button></p>}
    {older && <button className="secondary" disabled={olderLoading} onClick={() => void loadOlder()}>{olderLoading ? 'Загружаем…' : 'Показать ранние сообщения'}</button>}
    {!loading && !error && !items.length && <p className="notice">Сообщений пока нет.</p>}
    <ol className="messages-list" aria-label="Сообщения">
      {items.map(m => <li className={`message${m.mine ? ' mine' : ''}`} key={m.seq}>
        <span className="sr-only">{m.mine?'Вы':<UserName client={client} userId={userId} name={title}/>}:</span>
        {m.body && <p><bdi dir="auto">{m.body}</bdi></p>}
        {m.video && <a href={`#/video/${m.video.youtube_video_id}`}>▶ <bdi dir="auto">{m.video.title ?? m.video.youtube_video_id}</bdi></a>}
        {!m.mine && <ReportButton client={client} kind="message" targetId={m.id}/>}
        <span className="small muted">{when(m.created_at)}{m === lastMine && otherRead >= m.seq ? ' · прочитано' : ''}</span>
      </li>)}
    </ol>
    {user && !canSend && <p className="notice">Писать можно только друзьям. История переписки сохраняется.</p>}
    {user && canSend && <form className="chat-compose" onSubmit={e => { e.preventDefault(); void send(); }}>
      <label className="sr-only" htmlFor="chat-text">Сообщение</label>
      <textarea id="chat-text" value={text} maxLength={MAX_MESSAGE_LENGTH} rows={3} placeholder="Сообщение" onChange={e => {setText(e.target.value);schedule.current?.activity()}}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }}/>
      <div className="actions"><span className="small muted">{[...text].length}/{MAX_MESSAGE_LENGTH} · Ctrl+Enter — отправить</span><button className="primary" type="submit" disabled={sending || !text.trim()}>{sending ? 'Отправляем…' : 'Отправить'}</button></div>
    </form>}
    <p role="status" className="small">{notice}</p>
  </section>;
}
