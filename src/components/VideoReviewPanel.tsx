import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { conflicted, loadReview, type StateWriter, type VideoReview } from '../shared/library/lists.ts';

/** Own server-backed review. Parent keys this editor by viewer and video. */
export function VideoReviewPanel({ client, writer, videoId }: {
  client: Pick<ApiClient, 'request'>; writer: StateWriter; videoId: string;
}) {
  const [review, setReview] = useState<VideoReview | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState('');
  const generation = useRef(0), readSerial = useRef(0), busy = useRef(false);

  async function reload(keepDraft: boolean, signal?: AbortSignal): Promise<boolean> {
    const stamp = generation.current, serial = ++readSerial.current;
    setLoading(true); setLoadError(false);
    try {
      const value = await loadReview(client, videoId, signal);
      if (stamp !== generation.current || serial !== readSerial.current) return false;
      setReview(value);
      if (!keepDraft) setDraft(value.text ?? '');
      return true;
    } catch {
      if (stamp === generation.current && serial === readSerial.current) { setLoadError(true); setMessage('Не удалось загрузить рецензию. Попробуйте обновить её.'); }
      return false;
    } finally {
      if (stamp === generation.current && serial === readSerial.current) setLoading(false);
    }
  }
  useEffect(() => {
    generation.current++; busy.current = false; setSaving(false); setReview(null); setDraft(''); setMessage('');
    const ctl = new AbortController();
    void reload(false, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client, videoId]);

  const normalized = draft.replace(/\r\n?/g, '\n').normalize('NFC').replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g, '');
  const length = [...normalized].length;
  async function write(text: string | null) {
    if (busy.current || loading || loadError || !review) return;
    const stamp = generation.current;
    busy.current = true; setSaving(true); setMessage('');
    try {
      const value = await writer.review(videoId, review.revision, text);
      if (stamp !== generation.current) return;
      setReview(value); setDraft(value.text ?? '');
      setMessage(value.text === null ? 'Рецензия удалена из аккаунта.' : 'Рецензия сохранена в аккаунте.');
    } catch (error) {
      if (stamp !== generation.current) return;
      if (conflicted(error) || (error instanceof ApiError && error.kind === 'http' && error.status === 410)) {
        const fresh = await reload(true);
        if (stamp === generation.current && fresh) setMessage('Версия рецензии обновлена. Ваш черновик сохранён: проверьте текст и сохраните ещё раз.');
      } else {
        setMessage(error instanceof ApiError && error.status === 401 ? 'Для сохранения нужен действующий вход в аккаунт.' : 'Не удалось подтвердить сохранение. Повторите попытку или обновите рецензию.');
      }
    } finally {
      if (stamp === generation.current) { busy.current = false; setSaving(false); }
    }
  }
  return <section className="panel" id="review" aria-busy={loading || saving}>
    <h2>Рецензии</h2>
    <p className="muted">Ваша рецензия хранится в аккаунте. Рецензии других пользователей доступны в их профилях и рекомендациях с учётом приватности.</p>
    {loading && <p role="status">Загружаем рецензию…</p>}
    {review?.text != null && <div className="review"><strong>Ваша сохранённая рецензия</strong><p className="own-review-text">{review.text}</p></div>}
    <textarea aria-label="Текст рецензии" value={draft} disabled={loading || saving || loadError || !review} onChange={e => setDraft(e.target.value)} placeholder="Поделитесь впечатлениями о видео"/>
    <p className="small muted">{length} / 1000 символов</p>
    <div className="actions">
      <button className="primary" disabled={loading || saving || loadError || !review || length < 1 || length > 1000 || normalized === review.text} onClick={() => void write(normalized)}>{saving ? 'Сохраняем…' : 'Сохранить рецензию'}</button>
      {review?.text != null && <button className="secondary" disabled={loading || saving || loadError} onClick={() => void write(null)}>Удалить рецензию</button>}
      <button className="text-button" disabled={loading || saving} onClick={() => { setMessage(''); void reload(review !== null); }}>Обновить рецензию</button>
    </div>
    {message && <p role="status">{message}</p>}
  </section>;
}
