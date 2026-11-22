import React, { useEffect, useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../shared/api/client.ts';
import { changeMyName, loadNavigationCounts, NOTIFICATIONS_CHANGED, type NavigationCounts, type OwnProfile } from '../shared/library/lists.ts';

export function useNavigationCounts(client: Pick<ApiClient,'request'> | null, owner: string | null) {
  const [snapshot,setSnapshot]=useState<{owner:string;counts:NavigationCounts}|null>(null);
  const generation=useRef(0);
  useEffect(()=>{
    const stamp=++generation.current,ctl=new AbortController();let busy=false,again=false;
    setSnapshot(null);
    const load=()=>{
      if(!client||!owner||document.visibilityState!=='visible')return;
      if(busy){again=true;return;}busy=true;again=false;
      loadNavigationCounts(client,ctl.signal).then(counts=>{if(stamp===generation.current)setSnapshot({owner,counts});})
        .catch(()=>{if(stamp===generation.current)setSnapshot(null);})
        .finally(()=>{if(stamp===generation.current){busy=false;if(again)load();}});
    };
    load();const timer=setInterval(load,30000);
    window.addEventListener(NOTIFICATIONS_CHANGED,load);document.addEventListener('visibilitychange',load);
    return()=>{generation.current++;ctl.abort();clearInterval(timer);window.removeEventListener(NOTIFICATIONS_CHANGED,load);document.removeEventListener('visibilitychange',load);};
  },[client,owner]);
  return client&&owner&&snapshot?.owner===owner?snapshot.counts:null;
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
