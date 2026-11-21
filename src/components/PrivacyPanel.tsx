import React, { useEffect, useRef, useState } from 'react';
import { type ApiClient } from '../shared/api/client.ts';
import { Shield } from 'lucide-react';
import { changePrivacy, conflicted, loadPrivacy, type Audience, type PrivacyField, type PrivacySettings } from '../shared/library/lists.ts';

const fields: [PrivacyField, string][] = [['ratings', 'Кто видит мои оценки'], ['reviews', 'Кто видит мои рецензии'], ['watchlist', 'Кто видит «Посмотрю позже»'], ['social', 'Кто видит моих друзей и подписки']];
const audiences: [Audience, string][] = [['public', 'Все'], ['friends_and_followers', 'Друзья и подписчики'], ['friends', 'Только друзья'], ['private', 'Только я']];

/** Account privacy policies from the API (YP-056). Parent keys it by viewer. */
export function PrivacyPanel({ client }: { client: Pick<ApiClient, 'request'> }) {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const generation = useRef(0), busy = useRef(false);

  async function reload(signal?: AbortSignal) {
    const stamp = generation.current;
    setLoading(true); setLoadFailed(false);
    try {
      const value = await loadPrivacy(client, signal);
      if (stamp === generation.current) setSettings(value);
    } catch {
      if (stamp === generation.current && !signal?.aborted) { setLoadFailed(true); setMessage('Не удалось загрузить настройки приватности.'); }
    } finally {
      if (stamp === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    generation.current++;
    const ctl = new AbortController();
    void reload(ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client]);

  async function change(field: PrivacyField, value: Audience) {
    if (!settings || busy.current || settings[field] === value) return;
    const stamp = generation.current;
    busy.current = true; setSaving(true); setMessage('');
    try {
      const next = await changePrivacy(client, settings.revision, field, value);
      if (stamp === generation.current) { setSettings(next); setMessage('Настройка сохранена.'); }
    } catch (error) {
      if (stamp !== generation.current) return;
      if (conflicted(error)) { await reload(); if (stamp === generation.current) setMessage(m => m.startsWith('Не удалось') ? m : 'Настройки изменились на другом устройстве. Показаны актуальные — выберите снова.'); }
      else setMessage('Не удалось сохранить настройку. Попробуйте ещё раз.');
    } finally {
      if (stamp === generation.current) { busy.current = false; setSaving(false); }
    }
  }
  return <section className="panel form-panel" aria-busy={loading || saving}>
    <h2><Shield size={20}/>Приватность</h2>
    <p className="muted">По умолчанию всё открыто всем. Общий рейтинг видео учитывает любую оценку, но скрытые оценки и рецензии не показываются с вашим именем. «Друзья и подписчики» пока означает только друзей — подписки появятся позже. Ваши «Рекомендации» в профиле и ленте друзей — это ваши оценки и рецензии, поэтому они подчиняются первым двум настройкам. Настройки «Посмотрю позже» и друзей сохраняются сейчас и начнут действовать, когда эти списки станут видны другим.</p>
    {loading && !settings && <p className="muted" role="status">Загружаем настройки…</p>}
    {settings && fields.map(([field, label]) => <label className="setting-row" key={field}>{label}
      <select value={settings[field]} disabled={saving || loading} onChange={e => void change(field, e.target.value as Audience)}>
        {audiences.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>)}
    {message && <p role="status" className="small">{message} {loadFailed && <button className="text-button" onClick={() => { setMessage(''); void reload(); }}>Повторить</button>}</p>}
  </section>;
}
