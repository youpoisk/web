import React, {useEffect, useRef, useState} from 'react';
import {ApiError, type ApiClient} from '../shared/api/client.ts';
import {loadRelationship, setFollowing} from '../shared/library/lists.ts';

/** Friendship and a one-way subscription are independent actions. */
export function SearchFollowButton({client,userId,onChanged}:{client:Pick<ApiClient,'request'>;userId:string;onChanged?:()=>void}){
 const [following,setSubscribed]=useState<boolean|null>(null),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const generation=useRef(0),busy=useRef(false);
 useEffect(()=>{
  const stamp=++generation.current,ctl=new AbortController();
  setSubscribed(null);setError('');busy.current=false;setSaving(false);
  loadRelationship(client,userId,ctl.signal).then(r=>{if(stamp===generation.current)setSubscribed(r.following);}).catch(()=>{if(stamp===generation.current&&!ctl.signal.aborted)setError('Не удалось загрузить подписку.');});
  return()=>{generation.current++;ctl.abort();};
 },[client,userId]);
 async function change(){
  if(busy.current)return;
  const stamp=generation.current;busy.current=true;setSaving(true);setError('');
  try{
   if(following===null){const r=await loadRelationship(client,userId);if(stamp===generation.current)setSubscribed(r.following);}
   else{await setFollowing(client,userId,!following);if(stamp===generation.current){setSubscribed(!following);onChanged?.();}}
  }catch(e){if(stamp===generation.current)setError(e instanceof ApiError&&e.status===429?'Слишком много действий. Повторите позже.':'Не удалось изменить подписку. Повторите попытку.');}
  finally{if(stamp===generation.current){busy.current=false;setSaving(false);}}
 }
 return <div className="search-follow-control"><button className="secondary" disabled={saving||(following===null&&!error)} aria-pressed={following===true} aria-busy={saving} onClick={()=>void change()}>{following===null?(error?'Повторить':'Загружаем…'):following?'Отписаться':'Подписаться'}</button>{error&&<span className="small muted" role="status">{error}</span>}</div>;
}
