import{createTabActivity}from'../shared/users/tab-activity.ts';
import{schema_ActivityCounts}from'../shared/api/validators.js';
import{authConfig}from'../shared/auth/runtime.ts';
import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { changeMyName, loadNavigationCounts, NOTIFICATIONS_CHANGED, type NavigationCounts, type OwnProfile } from '../shared/library/lists.ts';

type Activity={unread_conversations:number;incoming_friend_requests:number;outgoing_friend_requests:number;unread_notifications:number};
/** One minute poll reads only lightweight activity; profile totals are event driven. */
export function useNavigationCounts(client:Pick<ApiClient,'request'>|null,owner:string|null){
 const[snapshot,setSnapshot]=useState<{owner:string;counts:NavigationCounts}|null>(null);
 const[activity,setActivity]=useState<{owner:string;counts:Activity}|null>(null);
 const generation=useRef(0);const[leader,setLeader]=useState(false);
 useEffect(()=>{const stamp=++generation.current,ctl=new AbortController();let fullBusy=false,fullAgain=false,activityBusy=false,activityAgain=false,lastFull=0;setSnapshot(null);setActivity(null);let shared:ReturnType<typeof createTabActivity<Activity>>|undefined;
 const live=()=>stamp===generation.current&&!ctl.signal.aborted;
 const allowed=()=>!!client&&!!owner&&document.visibilityState==='visible'&&live();
 const full=(force=false)=>{if(!allowed())return;if(fullBusy){fullAgain=fullAgain||force;return;}if(!force&&Date.now()-lastFull<5000)return;fullBusy=true;lastFull=Date.now();void loadNavigationCounts(client!,ctl.signal).then(counts=>{if(live())setSnapshot({owner:owner!,counts})}).catch(()=>{if(live())setSnapshot(null)}).finally(()=>{fullBusy=false;if(live()&&fullAgain){fullAgain=false;full(true)}})};
 const poll=()=>{if(!allowed())return;if(shared){shared.refresh();return;}if(activityBusy){activityAgain=true;return;}activityBusy=true;void client!.request('getActivityCounts',{signal:ctl.signal}).then(counts=>{if(live())setActivity({owner:owner!,counts})}).catch(()=>{if(live())setActivity(null)}).finally(()=>{activityBusy=false;if(live()&&activityAgain){activityAgain=false;poll()}})};
 const refresh=()=>{full();if(shared)shared.visibility();else poll()};const changed=()=>{full(true);poll()};const route=()=>{if(['#/profile','#/watchlist','#/ratings'].includes(location.hash))full()};
 const scoped=client as (Pick<ApiClient,'request'>&Partial<Pick<ApiClient,'avatarScope'>>)|null;
 if(scoped?.avatarScope&&typeof BroadcastChannel!=='undefined'&&typeof navigator!=='undefined'&&navigator.locks){const api=authConfig((import.meta as unknown as{env?:Record<string,string|boolean|undefined>}).env??{},location).apiOrigin;const scope=()=>{try{return api+':'+scoped.avatarScope}catch{return ''}};const name='yp.activity.v1:'+scope();shared=createTabActivity<Activity>({scope,visible:()=>document.visibilityState==='visible',claim:async(signal,run)=>{await navigator.locks.request(name,{signal},run)},channel:new BroadcastChannel(name),read:signal=>client!.request('getActivityCounts',{signal}),valid:(v):v is Activity=>schema_ActivityCounts(v),receive:counts=>{if(live())setActivity(counts?{owner:owner!,counts}:null)},leader:value=>{if(live())setLeader(value)},later:(fn,delay)=>setTimeout(fn,delay),cancel:timer=>clearTimeout(timer as ReturnType<typeof setTimeout>),random:Math.random});}else setLeader(!!client&&!!owner);
 refresh();const timer=shared?null:setInterval(poll,60000);window.addEventListener(NOTIFICATIONS_CHANGED,changed);document.addEventListener('visibilitychange',refresh);window.addEventListener('focus',refresh);window.addEventListener('hashchange',route);
 return()=>{generation.current++;ctl.abort();shared?.close();if(timer!==null)clearInterval(timer);window.removeEventListener(NOTIFICATIONS_CHANGED,changed);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('focus',refresh);window.removeEventListener('hashchange',route)};
 },[client,owner]);
 const totals=client&&owner&&snapshot?.owner===owner?snapshot.counts:null;const current=client&&owner&&activity?.owner===owner?activity.counts:null;
 return {totals:totals?{...totals,...current}:null,activity:current,leader};
}

export function NavigationCount({count,label,showZero=false}:{count:number|undefined;label:string;showZero?:boolean}){
  return count===undefined||(!showZero&&count<1)?null:<span className={'navigation-count'+(count===0?' zero':'')}><span aria-hidden="true">{count}</span><span className="sr-only">{label}: {count}</span></span>;
}

/** Matches backend auth.MaxNameRunes (NFC code points after trim). */
export const MAX_NAME_LENGTH=30;

export function NameEditor({client,user,onSaved}:{client:Pick<ApiClient,'request'>;user:OwnProfile;onSaved:(user:OwnProfile)=>void}){
  const [name,setName]=useState(user.name),[saving,setSaving]=useState(false),[notice,setNotice]=useState('');
  const generation=useRef(0),busy=useRef(false);
  useEffect(()=>{generation.current++;return()=>{generation.current++;};},[client,user.id]);
  const normalized=name.normalize('NFC').trim(),length=[...normalized].length;
  async function save(e:React.FormEvent){
    e.preventDefault();if(busy.current||length<1||length>MAX_NAME_LENGTH||normalized===user.name)return;
    const stamp=generation.current;busy.current=true;setSaving(true);setNotice('');
    try{
      const value=await changeMyName(client,normalized);
      if(stamp!==generation.current)return;
      setName(value.name);onSaved(value);setNotice('');
    }catch(failure){if(stamp===generation.current)setNotice(failure instanceof ApiError&&failure.status===422?`Имя должно содержать от 1 до ${MAX_NAME_LENGTH} символов без управляющих знаков.`:'Не удалось подтвердить сохранение имени. Повторите попытку.');}
    finally{if(stamp===generation.current){busy.current=false;setSaving(false);}}
  }
  return <form onSubmit={e=>void save(e)} aria-busy={saving}>
    <label>Имя пользователя<input value={name} onChange={e=>setName(e.target.value)} disabled={saving} maxLength={60} autoComplete="nickname"/></label>
    <div className="actions"><span className={`small ${length>MAX_NAME_LENGTH?'over-limit':'muted'}`}>{length}/{MAX_NAME_LENGTH}</span><button className="secondary" type="submit" disabled={saving||length<1||length>MAX_NAME_LENGTH||normalized===user.name}>{saving?'Сохраняем…':'Сохранить имя'}</button></div>
    <p role="status">{notice}</p>
  </form>;
}
