import React, { useEffect, useRef, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
import { REPORT_REASONS, createReport, loadAudit, loadStaffRole, loadReports, moderationError, reportError, resolveReport, type AdminReport, type AuditEntry, type ReportKind, type ReportReason } from '../shared/library/lists.ts';

const when = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Inline report form. The server decides whether the target is reportable. */
export function ReportButton({ client, kind, targetId, label = 'Пожаловаться' }: { client: Pick<ApiClient, 'request'>; kind: ReportKind; targetId: string; label?: string }) {
  const [open, setOpen] = useState(false), [reason, setReason] = useState<ReportReason>('spam'), [details, setDetails] = useState('');
  const [sending, setSending] = useState(false), [notice, setNotice] = useState(''), [done, setDone] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  async function submit() {
    if (sending) return;
    setSending(true); setNotice('');
    try {
      const result = await createReport(client, kind, targetId, reason, details);
      if (!mounted.current) return;
      setDone(true); setOpen(false);
      setNotice(result.created ? 'Жалоба отправлена. Спасибо — модераторы её рассмотрят.' : 'Вы уже жаловались на это. Жалоба на рассмотрении.');
    } catch (failure) { if (mounted.current) setNotice(reportError(failure)); }
    finally { if (mounted.current) setSending(false); }
  }
  return <span className="report-control">
    {!open && !done && <button type="button" className="text-button" onClick={() => setOpen(true)}>{label}</button>}
    {open && <form className="report-form" aria-label="Жалоба" onSubmit={e => { e.preventDefault(); void submit(); }}>
      <label>Причина<select value={reason} onChange={e => setReason(e.target.value as ReportReason)}>{REPORT_REASONS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
      <label>Комментарий (необязательно)<textarea value={details} maxLength={500} rows={2} onChange={e => setDetails(e.target.value)}/></label>
      <div className="actions"><button className="primary" type="submit" disabled={sending}>{sending ? 'Отправляем…' : 'Отправить жалобу'}</button><button className="secondary" type="button" disabled={sending} onClick={() => setOpen(false)}>Отмена</button></div>
    </form>}
    {notice && <span className="small" role="status">{notice}</span>}
  </span>;
}

type Status = 'open' | 'dismissed' | 'actioned';
const STATUS_LABEL: Record<Status, string> = { open: 'Открытые', dismissed: 'Отклонённые', actioned: 'С мерами' };
const REASON_LABEL = Object.fromEntries(REPORT_REASONS) as Record<string, string>;
const KIND_LABEL: Record<string, string> = { user: 'Пользователь', review: 'Рецензия', message: 'Сообщение' };
const ACTION_LABEL: Record<string, string> = { dismiss: 'Отклонил жалобу', hide: 'Скрыл рецензию', suspend: 'Заблокировал аккаунт' };
const person = (u: { login: string | null; status: string }) => (u.login ? '@' + u.login : 'удалённый аккаунт') + (u.status === 'disabled' ? ' (заблокирован)' : '');

/** Staff page. Account-keyed by the parent; the server enforces the role. */
export function ModerationPage({ client, role }: { client: Pick<ApiClient, 'request'>; role: 'admin' | 'moderator' }) {
  const [view, setView] = useState<Status | 'audit'>('open');
  const [items, setItems] = useState<AdminReport[]>([]), [audit, setAudit] = useState<AuditEntry[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState(''), [confirm, setConfirm] = useState<{ report: AdminReport; action: 'dismiss' | 'hide' | 'suspend' } | null>(null);
  const generation = useRef(0), busy = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current; setLoading(true); setError('');
    try {
      if (view === 'audit') {
        const page = await loadAudit(client, after, signal);
        if (stamp !== generation.current) return;
        setAudit(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.id === x.id))] : page.items); setNext(page.next);
      } else {
        const page = await loadReports(client, view, after, signal);
        if (stamp !== generation.current) return;
        setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.id === x.id))] : page.items); setNext(page.next);
      }
    } catch (failure) { if (stamp === generation.current && !signal?.aborted) setError(moderationError(failure)); }
    finally { if (stamp === generation.current) setLoading(false); }
  }
  useEffect(() => {
    generation.current++; setItems([]); setAudit([]); setNext(null); setConfirm(null); setNotice('');
    const ctl = new AbortController(); void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client, view]);
  async function resolve() {
    if (!confirm || busy.current) return;
    const stamp = generation.current, target = confirm; busy.current = true; setNotice('');
    try {
      await resolveReport(client, target.report.id, target.action);
      if (stamp !== generation.current) return;
      setItems(prev => prev.filter(x => x.id !== target.report.id)); setConfirm(null);
      setNotice(`Готово: ${ACTION_LABEL[target.action].toLowerCase()}.`);
    } catch (failure) { if (stamp === generation.current) setNotice(moderationError(failure)); }
    finally { busy.current = false; }
  }
  const views: Array<Status | 'audit'> = role === 'admin' ? ['open', 'dismissed', 'actioned', 'audit'] : ['open', 'dismissed', 'actioned'];
  return <section className="panel" aria-busy={loading}>
    <div className="tabs" role="tablist">{views.map(v => <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v === 'audit' ? 'Журнал' : STATUS_LABEL[v]}</button>)}</div>
    {loading && <p role="status">Загружаем…</p>}
    {error && <p role="alert">{error} <button className="text-button" onClick={() => void load(null)}>Повторить</button></p>}
    {view !== 'audit' && !loading && !error && !items.length && <p className="notice">Жалоб нет.</p>}
    {view === 'audit' && !loading && !error && !audit.length && <p className="notice">Журнал пуст.</p>}
    {view !== 'audit' && items.map(r => <article className="review" key={r.id}>
      <h3>{KIND_LABEL[r.target_kind]}: {person(r.target_user)}</h3>
      <p className="small muted">Причина: {REASON_LABEL[r.reason] ?? r.reason} · от {person(r.reporter)} · {when(r.created_at)}</p>
      {r.details && <p><bdi dir="auto">«{r.details}»</bdi></p>}
      {r.review && <blockquote><p className="small muted">Рецензия к видео «{r.review.title ?? r.review.youtube_video_id}»{r.review.moderation_status === 'hidden' ? ' · скрыта' : ''}</p>{r.review.text && <p><bdi dir="auto">{r.review.text}</bdi></p>}</blockquote>}
      {r.message && <blockquote><p className="small muted">Сообщение от {when(r.message.created_at)}</p>{r.message.body && <p><bdi dir="auto">{r.message.body}</bdi></p>}{r.message.has_video && <p className="small muted">С приложенным видео</p>}</blockquote>}
      {r.status === 'open' && <div className="actions">
        <button className="secondary" onClick={() => setConfirm({ report: r, action: 'dismiss' })}>Отклонить</button>
        {r.target_kind === 'review' && <button className="secondary" onClick={() => setConfirm({ report: r, action: 'hide' })}>Скрыть рецензию</button>}
        <button className="secondary" onClick={() => setConfirm({ report: r, action: 'suspend' })}>Заблокировать аккаунт</button>
      </div>}
      {confirm?.report.id === r.id && <div className="notice" role="group" aria-label="Подтверждение решения">
        <p>{confirm.action === 'suspend' ? `Заблокировать ${person(r.target_user)}? Все его сессии будут завершены, вернуть доступ может только оператор.` : confirm.action === 'hide' ? 'Скрыть эту рецензию от всех?' : 'Отклонить жалобу без мер?'}</p>
        <div className="actions"><button className="primary" onClick={() => void resolve()}>Подтвердить</button><button className="secondary" onClick={() => setConfirm(null)}>Отмена</button></div>
      </div>}
    </article>)}
    {view === 'audit' && audit.map(a => <article className="review" key={a.id}>
      <p><strong>{person(a.actor)}</strong> — {ACTION_LABEL[a.action] ?? a.action}: {KIND_LABEL[a.target_kind]} {person(a.target_user)}</p>
      <p className="small muted">{when(a.created_at)}</p>
    </article>)}
    {next && <button className="secondary" disabled={loading} onClick={() => void load(next)}>Показать ещё</button>}
    <p role="status" className="small">{notice}</p>
  </section>;
}

function useStaffRole(client: Pick<ApiClient, 'request'>): { role: 'admin' | 'moderator' | null; loading: boolean } {
  const [state, setState] = useState<{ role: 'admin' | 'moderator' | null; loading: boolean }>({ role: null, loading: true });
  useEffect(() => {
    const ctl = new AbortController(); let live = true;
    loadStaffRole(client, ctl.signal).then(role => { if (live) setState({ role, loading: false }); }).catch(() => { if (live) setState({ role: null, loading: false }); });
    return () => { live = false; ctl.abort(); };
  }, [client]);
  return state;
}

/** #/moderation: the role is checked by the server on every call as well. */
export function ModerationRoute({ client }: { client: Pick<ApiClient, 'request'> }) {
  const { role, loading } = useStaffRole(client);
  if (loading) return <p className="muted" role="status">Проверяем доступ…</p>;
  if (!role) return <p className="notice">Раздел доступен только модераторам.</p>;
  return <ModerationPage client={client} role={role}/>;
}

/** Sidebar link shown only to staff. */
export function ModerationLink({ client, active }: { client: Pick<ApiClient, 'request'>; active: boolean }) {
  const { role } = useStaffRole(client);
  return role ? <a className={active ? 'settings-link active' : 'settings-link'} href="#/moderation">Модерация</a> : null;
}
