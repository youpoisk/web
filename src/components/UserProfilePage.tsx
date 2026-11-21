import {BlockControl} from './Blocks.tsx';
import {FollowControls} from './Subscriptions.tsx';
import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { loadUserProfile, loadUserRecommendations, type Recommendation, type UserProfile } from '../shared/library/lists.ts';

/** Another user's profile with his visible ratings and reviews. Parent keys it by viewer and user. */
export function UserProfilePage({ client, userId }: { client: Pick<ApiClient, 'request'>; userId: string }) {
  const [revision,setRevision]=useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [failedAfter, setFailedAfter] = useState<string | null>(null);
  const generation = useRef(0), more = useRef(false);

  async function loadPage(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current;
    setLoading(true); setError('');
    try {
      if (!after) {
        const value = await loadUserProfile(client, userId, signal);
        if (stamp !== generation.current) return;
        setProfile(value);
      }
      const page = await loadUserRecommendations(client, userId, after, signal);
      if (stamp !== generation.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.video.id === x.video.id))] : page.items);
      setNext(page.next);
    } catch (e) {
      if (stamp !== generation.current || signal?.aborted) return;
      setFailedAfter(after);
      setError(e instanceof ApiError && e.status === 404 ? 'Пользователь не найден или его профиль недоступен.' : 'Не удалось загрузить профиль.');
    } finally {
      if (stamp === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    generation.current++;
    const ctl = new AbortController();
    void loadPage(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client, userId, revision]);

  async function loadMore() {
    if (more.current || !next) return;
    more.current = true;
    try { await loadPage(next); } finally { more.current = false; }
  }
  const name = profile ? profile.user.name || profile.user.login : '';
  return <section aria-busy={loading}>
    <div className="page-head"><div>
      <div className="eyebrow">ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</div>
      <h1>{profile ? name : 'Профиль'}</h1>
      {profile && <p className="muted">@{profile.user.login}{profile.relation === 'friend' ? ' · у вас в друзьях' : profile.relation === 'self' ? ' · это вы' : ''}</p>}
    </div></div>
    {profile && <FollowControls client={client} userId={userId} canFollow={profile.relation!=='self'} onChanged={()=>{generation.current++;setProfile(null);setItems([]);setNext(null);setRevision(v=>v+1)}}/>}
    {profile && profile.relation === 'friend' && <p><a className="secondary" href={`#/messages/${userId}`}>Написать сообщение</a></p>}
    {profile && profile.relation !== 'self' && <BlockControl client={client} userId={userId} onBlocked={()=>{generation.current++;setProfile(null);setItems([]);setNext(null);setError('');location.hash='#/settings'}}/>}
    {profile && (!profile.ratings_visible || !profile.reviews_visible) && <p className="notice">
      {!profile.ratings_visible && !profile.reviews_visible ? 'Пользователь скрыл оценки и рецензии от вас.' : !profile.ratings_visible ? 'Пользователь скрыл от вас свои оценки; видны только рецензии.' : 'Пользователь скрыл от вас свои рецензии; видны только оценки.'}
    </p>}
    <div className="section-head"><h2>Рекомендации</h2></div>
    {loading && items.length === 0 && !error && <p className="muted" role="status">Загружаем профиль…</p>}
    {error && <p className="notice" role="status">{error} {error.startsWith('Не удалось') && <button className="text-button" onClick={() => void loadPage(failedAfter)}>Повторить</button>}</p>}
    {!loading && !error && profile && items.length === 0 && <p className="notice">Пока нет оценок и рецензий, которые вам видны.</p>}
    <div className="recommendation-list">{items.map(it => <article className="panel recommendation" key={it.video.id}>
      <a className="recommendation-poster" href={`#/video/${it.video.youtube_video_id}`}><img src={it.video.preview_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }}/></a>
      <div>
        <a className="card-title" href={`#/video/${it.video.youtube_video_id}`}>{it.video.title ?? 'Название пока неизвестно'}</a>
        {it.video.channel && <p className="small muted">{it.video.channel.name ?? 'Канал без названия'}</p>}
        <p className="small">{it.rating !== null && <b className="friend-score">Оценка {name ? `${name}: ` : ''}{it.rating}/10</b>}{it.rating !== null && ' · '}<span className="muted">{new Date(it.changed_at).toLocaleDateString('ru-RU')}</span></p>
        {it.review !== null && <p className="own-review-text">{it.review}</p>}
      </div>
    </article>)}</div>
    {next && <div className="actions"><button className="secondary" disabled={loading} onClick={() => void loadMore()}>Показать ещё</button></div>}
  </section>;
}
