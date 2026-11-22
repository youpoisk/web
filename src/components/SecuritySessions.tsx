import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { activeDevices, loadDevices, revokeDevice, revokeOtherDevices, type Device } from '../shared/auth/devices.ts';

/** Account-keyed by parent. Current-device exit uses the site's auth coordinator. */
export function SecuritySessions({ client, onLogout }: { client: Pick<ApiClient, 'request'>; onLogout: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const [items, setItems] = useState<Device[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null), [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState<{id: string; label: string} | 'others' | null>(null);
  const generation = useRef(0), serial = useRef(0), reading = useRef(false), busy = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current; reading.current = true; setLoading(true); setError(false);
    try {
      const page = await loadDevices(client, after, signal);
      if (stamp !== generation.current || read !== serial.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.id === x.id))] : page.items); setNext(page.next);
    } catch {
      if (stamp === generation.current && read === serial.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally { if (stamp === generation.current && read === serial.current) { reading.current = false; setLoading(false); } }
  }
  useEffect(() => {
    generation.current++; const ctl = new AbortController(); void load(null, ctl.signal);
    const tick = () => setNow(Date.now());
    const refresh = () => {
      tick();
      if (document.visibilityState === 'visible' && !reading.current && !busy.current) {
        setConfirm(null); void load(null, ctl.signal);
      }
    };
    const timer = setInterval(tick, 15000);
    document.addEventListener('visibilitychange', refresh); window.addEventListener('focus', refresh);
    return () => { generation.current++; ctl.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); };
  }, [client]);
  function read(after: string | null) { if (!reading.current && !busy.current) { setConfirm(null); void load(after); } }
  async function revoke() {
    if (!confirm || reading.current || busy.current) return;
    const stamp = generation.current, target = confirm; busy.current = true; setSaving(true); setMessage('');
    try {
      if (target === 'others') await revokeOtherDevices(client); else await revokeDevice(client, target.id);
      if (stamp !== generation.current) return;
      setConfirm(null);
      if (target === 'others') { setItems(prev => prev.filter(x => x.current)); setNext(null); await load(null); }
      else setItems(prev => prev.filter(x => x.id !== target.id));
      if (stamp === generation.current) setMessage(target === 'others' ? 'Остальные сессии завершены. Текущая сессия сохранена.' : 'Выбранная сессия завершена.');
    } catch (failure) {
      if (stamp === generation.current) setMessage(failure instanceof ApiError && failure.status === 429 ? 'Слишком много действий подряд. Попробуйте позже.' : 'Не удалось подтвердить завершение сессии. Обновите список или повторите попытку.');
    } finally { if (stamp === generation.current) { busy.current = false; setSaving(false); } }
  }
  const visibleItems = activeDevices(items, now);
  return <section className="panel form-panel" aria-busy={loading || saving}>
    <h2>Активные сессии</h2>
    <p className="muted">Только действующие входы на сайте и в расширении. Завершённые и просроченные сессии не показываются. Новый вход на сайт автоматически завершает предыдущий web-вход. Сессии расширения независимы.</p>
    <div className="actions"><button className="secondary" disabled={loading || saving} onClick={() => read(null)}>Обновить список</button><button className="secondary" disabled={loading || saving || error} onClick={() => { setMessage(''); setConfirm('others'); }}>Выйти на остальных устройствах</button></div>
    {loading && <p role="status">Загружаем сессии…</p>}
    {error && <p role="alert">Не удалось загрузить сессии. <button disabled={loading || saving} onClick={() => read(failedAfter)}>Повторить</button></p>}
    {!loading && !error && !visibleItems.length && <p className="notice">Нет доступных сессий. Обновите список.</p>}
    {visibleItems.map(it => <article className="review" key={it.id}>
      <h3>{it.device_label || (it.client_type === 'web' ? 'Сайт' : 'Расширение')}{it.current ? ' · текущая сессия' : ''}</h3>
      <p className="small muted">Активна · {it.client_type === 'web' ? 'Сайт' : 'Расширение'} · действует до {new Date(it.expires_at).toLocaleString('ru-RU')}</p>
      {it.current ? <button className="secondary" disabled={loading || saving} onClick={onLogout}>Выйти на этом устройстве</button> : <button className="secondary" disabled={loading || saving || error} onClick={() => { setMessage(''); setConfirm({id: it.id, label: it.device_label || (it.client_type === 'web' ? 'Сайт' : 'Расширение')}); }}>Завершить сессию</button>}
    </article>)}
    {next && <button className="secondary" disabled={loading || saving} onClick={() => read(next)}>Показать ещё</button>}
    {confirm && <div className="notice" role="group" aria-label="Подтверждение завершения сессий">
      <p>{confirm === 'others' ? 'Завершить все остальные сессии, включая ещё не загруженные устройства? Текущая сессия останется активной.' : `Завершить сессию «${confirm.label}»? На этом устройстве потребуется новый вход.`}</p>
      <div className="actions"><button className="primary" disabled={loading || saving} onClick={() => void revoke()}>Подтвердить завершение</button><button className="secondary" disabled={saving} onClick={() => setConfirm(null)}>Отмена</button></div>
    </div>}
    <p role="status">{message}</p>
  </section>;
}
