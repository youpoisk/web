import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { conflicted, loadChannel, loadChannelRating, type ChannelCard, type ChannelState, type StateWriter } from '../shared/library/lists.ts';

/** Parent keys by viewer and canonical channel ID; no local score migration. */
export function ChannelPage({ publicClient, client, writer, channelId }: {
  publicClient: Pick<ApiClient, 'request'>; client: Pick<ApiClient, 'request'> | null;
  writer: StateWriter | null; channelId: string;
}) {
  const [card, setCard] = useState<ChannelCard | null>(null);
  const [own, setOwn] = useState<ChannelState | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const generation = useRef(0), busy = useRef(false), readSerial = useRef(0);

  async function refresh(signal?: AbortSignal) {
    const stamp = generation.current, serial = ++readSerial.current;
    setLoading(true); setError(''); setOwn(null);
    try {
      const value = await loadChannel(publicClient, channelId, signal);
      if (stamp !== generation.current || serial !== readSerial.current) return;
      setCard(value);
      if (client && value.identity_verified) {
        try {
          const state = await loadChannelRating(client, channelId, signal);
          if (stamp === generation.current && serial === readSerial.current) setOwn(state);
        } catch {
          if (stamp === generation.current && serial === readSerial.current) setMessage('Не удалось загрузить вашу оценку. Обновите данные перед изменением.');
        }
      }
    } catch (failure) {
      if (stamp === generation.current && serial === readSerial.current) {
        setCard(null);
        setError(failure instanceof ApiError && failure.status === 404 ? 'Канал не найден в YouPoisk.' : 'Не удалось загрузить канал.');
      }
    } finally {
      if (stamp === generation.current && serial === readSerial.current) setLoading(false);
    }
  }
  useEffect(() => {
    generation.current++;
    const ctl = new AbortController();
    void refresh(ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [publicClient, client, channelId]);

  async function rate(value: number | null) {
    if (busy.current || loading || !writer || !own || !card?.identity_verified) return;
    const stamp = generation.current;
    busy.current = true; setSaving(true); setMessage('');
    try {
      const state = await writer.channelRating(channelId, own.revision, value);
      if (stamp !== generation.current) return;
      setOwn(state);
      setMessage(value === null ? 'Оценка канала удалена.' : 'Оценка канала сохранена в аккаунте.');
      try {
        const fresh = await loadChannel(publicClient, channelId);
        if (stamp === generation.current) setCard(fresh);
      } catch {
        if (stamp === generation.current) setMessage('Оценка сохранена. Не удалось обновить общий рейтинг — обновите данные.');
      }
    } catch (failure) {
      if (stamp !== generation.current) return;
      if (conflicted(failure) || (failure instanceof ApiError && failure.status === 410)) {
        await refresh();
        if (stamp === generation.current) setMessage('Данные обновлены. Проверьте текущую оценку и выберите нужную ещё раз.');
      } else setMessage(failure instanceof ApiError && failure.status === 401 ? 'Для изменения оценки нужен действующий вход.' : 'Не удалось подтвердить изменение. Повторите попытку или обновите данные.');
    } finally {
      if (stamp === generation.current) { busy.current = false; setSaving(false); }
    }
  }
  return <section aria-busy={loading || saving}>
    <div className="eyebrow">СТРАНИЦА КАНАЛА</div>
    <h1>{card?.name ?? 'Канал YouPoisk'}</h1>
    {loading && <p role="status">Загружаем канал…</p>}
    {error && <p role="alert">{error}</p>}
    {card && <>
      <div className="panel rating-panel">
        <div className="big-score">{card.rating.average ?? '—'}</div>
        <p className="muted">{card.rating.count ? `Оценок в YouPoisk: ${card.rating.count}` : 'Пока нет оценок'}</p>
        {card.url && <a className="secondary" href={card.url} target="_blank" rel="noreferrer">Открыть канал на YouTube ↗</a>}
      </div>
      {!card.identity_verified ? <p className="notice">Идентичность канала пока не подтверждена. Оценка станет доступна после подтверждения.</p>
        : client && writer ? <div className="panel">
          <h2>Ваша оценка канала</h2>
          <div className="score-row">{Array.from({ length: 10 }, (_, i) => <button key={i} aria-pressed={own?.rating === i + 1} className={own?.rating === i + 1 ? 'chosen' : ''} disabled={loading || saving || !own} onClick={() => void rate(i + 1)}>{i + 1}</button>)}</div>
          {own?.rating != null && <button className="text-button" disabled={loading || saving} onClick={() => void rate(null)}>Удалить оценку канала</button>}
        </div> : <p><a href="#/login">Войдите</a>, чтобы оценить канал.</p>}
    </>}
    <div className="actions"><button className="secondary" disabled={loading || saving} onClick={() => { if (busy.current || loading) return; setMessage(''); void refresh(); }}>Обновить данные</button><a href="#/">К видео</a></div>
    {message && <p role="status">{message}</p>}
  </section>;
}
