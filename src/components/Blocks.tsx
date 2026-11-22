import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { loadBlocks, setBlocked, type Block } from '../shared/library/lists.ts';

type Client = Pick<ApiClient, 'request'>;
const failureMessage = (failure: unknown) => failure instanceof ApiError && failure.status === 429
  ? 'Слишком много действий подряд. Попробуйте через минуту.'
  : 'Не удалось подтвердить изменение. Повторите попытку или обновите список.';

/** A blocked profile is deliberately inaccessible; own settings remain the unblock entry point. */
export function BlocksPanel({ client }: { client: Client }) {
  const [items, setItems] = useState<Block[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(false), [message, setMessage] = useState('');
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), serial = useRef(0), busy = useRef(false), reading = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current;
    reading.current = true; setLoading(true); setError(false);
    try {
      const page = await loadBlocks(client, after, signal);
      if (stamp !== generation.current || read !== serial.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.user.id === x.user.id))] : page.items);
      setNext(page.next);
    } catch {
      if (stamp === generation.current && read === serial.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally {
      if (stamp === generation.current && read === serial.current) { reading.current = false; setLoading(false); }
    }
  }
  useEffect(() => {
    generation.current++; const ctl = new AbortController(); void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client]);
  async function remove(id: string) {
    if (busy.current || reading.current) return;
    const stamp = generation.current; busy.current = true; setSaving(true); setMessage('');
    try {
      await setBlocked(client, id, false);
      if (stamp !== generation.current) return;
      setItems(prev => prev.filter(x => x.user.id !== id));
      setMessage('');
    } catch (failure) { if (stamp === generation.current) setMessage(failureMessage(failure)); }
    finally { if (stamp === generation.current) { busy.current = false; setSaving(false); } }
  }
  function read(after: string | null) { if (!busy.current && !reading.current) void load(after); }
  return <section className="panel form-panel" aria-busy={loading || saving}>
    <h2>Заблокированные пользователи</h2>
    <p className="muted">Блокировка скрывает профили и рекомендации друг от друга, удаляет дружбу, подписки и заявки. Общие рейтинги видео остаются публичными. Снятие вашей блокировки не отменяет блокировку со стороны другого пользователя.</p>
    {loading && <p role="status">Загружаем список блокировок…</p>}
    {error && <p role="alert">Не удалось загрузить список. <button disabled={loading || saving} onClick={() => read(failedAfter)}>Повторить</button></p>}
    {!loading && !error && !items.length && <p className="notice">Вы никого не заблокировали.</p>}
    {items.map(it => <article className="review" key={it.user.id}>
      <h3>{it.user.name || it.user.login || 'Недоступный пользователь'}</h3>
      {it.user.login && <p className="muted">@{it.user.login}</p>}
      <p className="small muted">Заблокирован {new Date(it.since).toLocaleDateString('ru-RU')}</p>
      <button className="secondary" disabled={loading || saving} onClick={() => void remove(it.user.id)}>Разблокировать</button>
    </article>)}
    {next && <button className="secondary" disabled={loading || saving} onClick={() => read(next)}>Показать ещё</button>}
    <p role="status">{message}</p>
  </section>;
}

/** Explicit inline confirmation, with no optimistic success on an uncertain write. */
export function BlockControl({ client, userId, onBlocked, inline = false }: { client: Client; userId: string; onBlocked: () => void; inline?: boolean }) {
  const [confirming, setConfirming] = useState(false), [saving, setSaving] = useState(false), [message, setMessage] = useState('');
  const generation = useRef(0), busy = useRef(false);
  useEffect(() => { generation.current++; return () => { generation.current++; }; }, [client, userId]);
  async function block() {
    if (busy.current) return;
    const stamp = generation.current; busy.current = true; setSaving(true); setMessage('');
    try {
      await setBlocked(client, userId, true);
      if (stamp === generation.current) onBlocked();
    } catch (failure) { if (stamp === generation.current) setMessage(failureMessage(failure)); }
    finally { if (stamp === generation.current) { busy.current = false; setSaving(false); } }
  }
  if (inline) return <>
    {!confirming ? <button className="secondary danger-button" onClick={() => setConfirming(true)}>Заблокировать</button> : <div className="profile-confirm" role="group" aria-label="Подтверждение блокировки" aria-busy={saving}>
      <p>Заблокировать пользователя? Вы перестанете видеть профили и рекомендации друг друга. Дружба, обе подписки и заявки будут удалены. После разблокировки они автоматически не восстановятся.</p>
      <div className="actions"><button className="primary" disabled={saving} onClick={() => void block()}>{saving ? 'Блокируем…' : 'Подтвердить блокировку'}</button><button className="secondary" disabled={saving} onClick={() => { setConfirming(false); setMessage(''); }}>Отмена</button></div>
    </div>}
    {message && <p className="profile-meta" role="status">{message} <a href="#/settings">Управление блокировками в настройках</a></p>}
  </>;
  return <div className="panel" aria-busy={saving}>
    {!confirming ? <button className="secondary" onClick={() => setConfirming(true)}>Заблокировать пользователя</button> : <>
      <p>Заблокировать пользователя? Вы перестанете видеть профили и рекомендации друг друга. Дружба, обе подписки и заявки будут удалены. После разблокировки они автоматически не восстановятся.</p>
      <div className="actions"><button className="primary" disabled={saving} onClick={() => void block()}>Подтвердить блокировку</button><button className="secondary" disabled={saving} onClick={() => { setConfirming(false); setMessage(''); }}>Отмена</button></div>
    </>}
    <p role="status">{message}</p>
    {message && <a href="#/settings">Управление блокировками в настройках</a>}
  </div>;
}
