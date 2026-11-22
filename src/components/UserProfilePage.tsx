import { Avatar } from './Avatar.tsx';
import{ProfileStats}from'./ProfileStats.tsx';
import{FriendshipControls}from'./FriendshipControls.tsx';
import{LoadMore}from'./LoadMore.tsx';
import{UserMarksList}from'./UserMarksList.tsx';
import {BlockControl} from './Blocks.tsx';
import {FollowControls} from './Subscriptions.tsx';
import React, { useEffect, useRef, useState } from 'react';
import { ReportButton } from './Moderation.tsx';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { MARK_LABELS, NOTIFICATIONS_CHANGED, profileRecommendations, loadUserProfile, loadUserRecommendations, type Recommendation, type UserProfile } from '../shared/library/lists.ts';

/** Another user's profile with his visible ratings and reviews. Parent keys it by viewer and user. */
export function UserProfilePage({ client, userId, embedded=false, filter='all' }: { client: Pick<ApiClient, 'request'>; userId: string; embedded?:boolean; filter?:'all'|'ratings'|'reviews'|'marks' }) {
  const [revision,setRevision]=useState(0);
  const [view,setView]=useState<'recommendations'|'marks'>('recommendations');
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
  useEffect(()=>{if(embedded)window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));},[embedded,userId]);
  const marksView=embedded?filter==='marks':view==='marks';
  const visible=profileRecommendations(items,filter==='marks'?'all':filter);
  const name = profile ? profile.user.name || profile.user.login : '';
  return <section aria-busy={loading}>
    {!embedded&&<><div className="page-head"><div>
      <div className="profile-identity">
        {profile && <Avatar client={client} userId={profile.user.id} name={profile.user.name || profile.user.login} className="avatar profile-avatar"/>}
        <div className="profile-identity-text">
          <div className="eyebrow">ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</div>
          <h1>{profile ? name : 'Профиль'}</h1>
          {profile && <p className="muted profile-login">@{profile.user.login}{profile.relation === 'friend' ? ' · у вас в друзьях' : profile.relation === 'self' ? ' · это вы' : ''}</p>}
        </div>
      </div>
    </div></div>
    <ProfileStats counts={profile}/>
    {profile && <div className="panel profile-actions" role="group" aria-label="Действия с профилем">
      {profile.relation!=='self'&&<FriendshipControls client={client} userId={userId} friend={profile.relation==='friend'} onChanged={()=>{generation.current++;setProfile(null);setItems([]);setNext(null);setRevision(v=>v+1)}}/>}
      <FollowControls inline client={client} userId={userId} canFollow={profile.relation!=='self'} onChanged={()=>{generation.current++;setProfile(null);setItems([]);setNext(null);setRevision(v=>v+1)}}/>
      {profile.relation === 'friend' && <a className="secondary" href={`#/messages/${userId}`}>Написать сообщение</a>}
      {profile.relation !== 'self' && <span className="profile-actions-end"><ReportButton inline client={client} kind="user" targetId={userId} label="Пожаловаться"/><BlockControl inline client={client} userId={userId} onBlocked={()=>{generation.current++;setProfile(null);setItems([]);setNext(null);setError('');location.hash='#/settings'}}/></span>}
    </div>}
    </>}
    {profile && !marksView && (!profile.ratings_visible || !profile.reviews_visible) && <p className="notice">
      {!profile.ratings_visible && !profile.reviews_visible ? 'Пользователь скрыл оценки и рецензии от вас.' : !profile.ratings_visible ? 'Пользователь скрыл от вас свои оценки; видны только рецензии.' : 'Пользователь скрыл от вас свои рецензии; видны только оценки.'}
    </p>}
    {!embedded && profile && <div className="tabs" role="tablist" aria-label="Разделы профиля">{([['recommendations','Рекомендации'],['marks','Отметки']] as const).map(([key,label])=><button key={key} role="tab" aria-selected={view===key} className={view===key?'active':''} onClick={()=>setView(key)}>{label}</button>)}</div>}
    {marksView ? <>{embedded && <div className="section-head"><h2>Мои отметки</h2></div>}{profile && <UserMarksList key={userId+':marks:'+revision} client={client} userId={userId} own={profile.relation==='self'} hidden={profile.library_videos===null}/>}</> : <>
    <div className="section-head"><h2>{embedded?(filter==='ratings'?'Мои оценки видео':filter==='reviews'?'Мои отзывы':'Мои видео'):'Рекомендации'}</h2></div>
    {loading && items.length === 0 && !error && <p className="muted" role="status">Загружаем профиль…</p>}
    {error && <p className="notice" role="status">{error} {error.startsWith('Не удалось') && <button className="text-button" onClick={() => void loadPage(failedAfter)}>Повторить</button>}</p>}
    {!loading && !error && profile && visible.length === 0 && !next && <p className="notice">{embedded?(filter==='ratings'?'Вы ещё не оценивали видео.':filter==='reviews'?'Вы ещё не написали рецензий.':'Пока нет оценок и рецензий.'):'Пока нет оценок и рецензий, которые вам видны.'}</p>}
    <div className="recommendation-list">{visible.map(it => <article className="panel recommendation" key={it.video.id}>
      <a className="recommendation-poster" href={`#/video/${it.video.youtube_video_id}`}><img src={it.video.preview_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }}/></a>
      <div>
        <a className="card-title" href={`#/video/${it.video.youtube_video_id}`}>{it.video.title ?? 'Название пока неизвестно'}</a>
        {it.video.channel && <p className="small muted">{it.video.channel.name ?? 'Канал без названия'}</p>}
        <p className="small">{it.mark && <><span className={`mark-badge mark-${it.mark}`}>{MARK_LABELS[it.mark]}</span>{' '}</>}{it.rating !== null && <><span className="muted">Оценка{name ? ` ${name}` : ''}: </span><b className="friend-score"><span className="rating-value">{it.rating}</span>/10</b></>}{it.rating !== null && ' · '}<span className="muted">{new Date(it.changed_at).toLocaleDateString('ru-RU')}</span></p>
        {it.review !== null && <p className="own-review-text">{it.review}</p>}
        {it.review_id && profile?.relation !== 'self' && <ReportButton client={client} kind="review" targetId={it.review_id} label="Пожаловаться на рецензию"/>}
      </div>
    </article>)}</div>
    <LoadMore cursor={next} loaded={items.length} busy={loading} error={!!error} onMore={()=>void loadMore()}/>
    </>}
  </section>;
}
