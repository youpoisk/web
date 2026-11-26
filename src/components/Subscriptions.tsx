import{UserName}from'./UserName.tsx';
import { PeopleSearch } from './FriendRequests.tsx';
import { Avatar } from './Avatar.tsx';
import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { filterPeopleList, loadFollowing, loadRelationship, setFollowing, type Friend, type Relationship } from '../shared/library/lists.ts';

/** Parent keys by viewer and direction. Never substitutes a mock social list. */
export function SubscriptionsList({ client, direction, search = '' }: { search?: string; client: Pick<ApiClient, 'request'>; direction: 'following' | 'followers' }) {
  const [items, setItems] = useState<Friend[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false);
  const [failedAfter, setFailedAfter] = useState<string | null>(null), [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const generation = useRef(0), serial = useRef(0), busy = useRef(false), more = useRef(false);
  async function load(after: string | null, signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current;
    setLoading(true); setError(false);
    try {
      const page = await loadFollowing(client, direction, after, signal);
      if (stamp !== generation.current || read !== serial.current) return;
      setItems(prev => after ? [...prev, ...page.items.filter(x => !prev.some(y => y.user.id === x.user.id))] : page.items);
      setNext(page.next);
    } catch {
      if (stamp === generation.current && read === serial.current && !signal?.aborted) { setError(true); setFailedAfter(after); }
    } finally { if (stamp === generation.current && read === serial.current) setLoading(false); }
  }
  useEffect(() => {
    generation.current++;
    const ctl = new AbortController(); void load(null, ctl.signal);
    return () => { generation.current++; ctl.abort(); };
  }, [client, direction]);
  async function remove(id: string) {
    if (busy.current || loading) return;
    const stamp = generation.current; busy.current = true; setSaving(true); setMessage('');
    try {
      await setFollowing(client, id, false);
      if (stamp !== generation.current) return;
      serial.current++; setItems(prev => prev.filter(x => x.user.id !== id)); setMessage('');
    } catch (failure) {
      if (stamp === generation.current) setMessage(failure instanceof ApiError && failure.status === 429 ? 'Слишком много изменений подписок. Подождите минуту.' : 'Не удалось подтвердить отписку. Повторите попытку.');
    } finally { if (stamp === generation.current) { busy.current = false; setSaving(false); } }
  }
  async function loadMore() { if (more.current || loading || !next) return; more.current = true; try { await load(next); } finally { more.current = false; } }
  const searchTerm=search.trim(), visible=filterPeopleList(items,searchTerm);
  useEffect(()=>{if(searchTerm&&next&&!loading&&!error&&!saving)void loadMore();},[searchTerm,next,loading,error,saving]);
  return <section aria-busy={loading || saving}>
    {searchTerm&&(loading||next!==null)&&!error&&<p className="muted" role="status">Ищем по всему списку…</p>}
    {searchTerm&&!loading&&!error&&!next&&visible.length===0&&<p className="notice" role="status">По вашему запросу никого не найдено.</p>}
    {loading && !items.length && !searchTerm && <p role="status">Загружаем {direction === 'following' ? 'подписки' : 'подписчиков'}…</p>}
    {error && <p role="alert">Не удалось загрузить список. <button disabled={loading || saving} onClick={() => void load(failedAfter)}>Повторить</button></p>}
    {!searchTerm && !loading && !error && !items.length && <p className="notice">{direction === 'following' ? 'Вы пока ни на кого не подписаны. Откройте профиль интересного автора и нажмите «Подписаться».' : 'У вас пока нет подписчиков.'}</p>}
    <div className="people-grid">{visible.map(it => <article className="panel person-card" key={it.user.id}>
      <Avatar client={client} userId={it.user.id} name={it.user.name||it.user.login} className="avatar person-avatar"/>
      <h2><UserName client={client} userId={it.user.id} name={it.user.name||it.user.login}/></h2><p className="muted">@{it.user.login} · подписка с {new Date(it.since).toLocaleDateString('ru-RU')}</p>
      <div className="actions person-card-actions"><a className="secondary" href={`#/user/${it.user.id}`}>Открыть профиль</a>{direction === 'following' && <button className="secondary" disabled={loading || saving} onClick={() => void remove(it.user.id)}>Отписаться</button>}</div>
    </article>)}</div>
    {!searchTerm && next && <button className="secondary" disabled={loading || saving} onClick={() => void loadMore()}>Показать ещё</button>}
    <p role="status">{message}</p>
  </section>;
}

/** Viewer-to-author subscription is independent of the profile friendship. */
export function FollowControls({ client, userId, canFollow, onChanged, inline = false }: { client: Pick<ApiClient, 'request'>; userId: string; canFollow: boolean; onChanged: () => void; inline?: boolean }) {
  const [relation, setRelation] = useState<Relationship | null>(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(''), [error, setError] = useState(false);
  const generation = useRef(0), serial = useRef(0), busy = useRef(false);
  async function load(signal?: AbortSignal) {
    const stamp = generation.current, read = ++serial.current; setLoading(true); setError(false);
    try { const value = await loadRelationship(client, userId, signal); if (stamp === generation.current && read === serial.current) setRelation(value); }
    catch { if (stamp === generation.current && read === serial.current && !signal?.aborted) setError(true); }
    finally { if (stamp === generation.current && read === serial.current) setLoading(false); }
  }
  useEffect(() => { generation.current++; const ctl = new AbortController(); void load(ctl.signal); return () => { generation.current++; ctl.abort(); }; }, [client, userId]);
  async function change() {
    if (busy.current || loading || error || !relation) return;
    const stamp = generation.current; busy.current = true; setSaving(true); setMessage('');
    try {
      await setFollowing(client, userId, !relation.following);
      if (stamp !== generation.current) return;
      // Parent drops the old profile and refetches privacy-filtered content.
      onChanged();
    } catch (failure) {
      if (stamp === generation.current) setMessage(failure instanceof ApiError && failure.status === 429 ? 'Слишком много изменений подписок. Подождите минуту.' : 'Не удалось подтвердить изменение подписки. Повторите попытку или обновите данные.');
    } finally { if (stamp === generation.current) { busy.current = false; setSaving(false); } }
  }
  if (inline) return <>
    <p className="profile-meta muted" role="status" aria-busy={loading || saving}>{loading ? 'Загружаем подписки…' : relation ? (relation.followers_count === null ? 'Счётчики подписок скрыты настройками приватности.' : `Подписчики: ${relation.followers_count} · Подписки: ${relation.following_count}`) + (relation.followed_by ? ' · подписан на вас' : '') : ''}</p>
    {error && <p className="profile-meta" role="alert">Не удалось загрузить подписки. <button className="text-button" disabled={loading || saving} onClick={() => void load()}>Повторить</button></p>}
    {relation && canFollow && <button className={relation.following ? 'secondary' : 'primary'} aria-pressed={relation.following} disabled={loading || saving || error} onClick={() => void change()}>{relation.following ? 'Отписаться' : 'Подписаться'}</button>}
    {message && <p className="profile-meta" role="status">{message}</p>}
  </>;
  return <div className="panel" aria-busy={loading || saving}>
    {loading && <p role="status">Загружаем подписки…</p>}
    {error && <p role="alert">Не удалось загрузить подписки. <button disabled={loading || saving} onClick={() => void load()}>Повторить</button></p>}
    {relation && <>
      <p>{relation.followers_count === null ? 'Счётчики подписок скрыты настройками приватности.' : `Подписчики: ${relation.followers_count} · Подписки: ${relation.following_count}`}</p>
      {relation.followed_by && <p className="muted">Подписан на вас</p>}
      {canFollow && <button className={relation.following ? 'secondary' : 'primary'} aria-pressed={relation.following} disabled={loading || saving || error} onClick={() => void change()}>{relation.following ? 'Отписаться' : 'Подписаться'}</button>}
    </>}
    <p role="status">{message}</p>
  </div>;
}

export function SubscriptionsPanel({client,view}:{client:Pick<ApiClient,'request'>;view:'all'|'following'|'followers'}){
 const [followingRevision,setFollowingRevision]=useState(0);
 return <><PeopleSearch client={client} onFollowingChanged={()=>setFollowingRevision(n=>n+1)}/>{view!=='followers'&&<section aria-label="Мои подписки"><h2>Мои подписки</h2><SubscriptionsList key={'following:'+followingRevision} client={client} direction="following"/></section>}{view!=='following'&&<section aria-label="Подписчики"><h2>Подписчики</h2><SubscriptionsList key="followers" client={client} direction="followers"/></section>}</>;
}
