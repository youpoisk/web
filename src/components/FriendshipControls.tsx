import React,{useEffect,useRef,useState}from'react';
import type{ApiClient}from'../shared/api/client.ts';
import{ApiError}from'../shared/api/client.ts';
import{loadFriendRequests,sendFriendRequest,acceptFriendRequest,deleteFriendRequest,removeFriend,friendLimitMessage,NOTIFICATIONS_CHANGED}from'../shared/library/lists.ts';

export function FriendshipControls({client,userId,friend,onChanged}:{client:Pick<ApiClient,'request'>;userId:string;friend:boolean;onChanged:()=>void}){
 const[pending,setPending]=useState<{id:string;direction:'incoming'|'outgoing'}|null>(null),[loading,setLoading]=useState(!friend),[saving,setSaving]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 const generation=useRef(0),busy=useRef(false);
 useEffect(()=>{
  const stamp=++generation.current,ctl=new AbortController();busy.current=false;setSaving(false);setPending(null);setError('');setLoading(!friend);
  if(!friend)void(async()=>{
   try{
    for(const direction of ['incoming','outgoing']as const){
     let after:string|null=null;const seen=new Set<string>();
     do{
      const page=await loadFriendRequests(client,direction,after,ctl.signal);
      if(stamp!==generation.current)return;
      const item=page.items.find(item=>item.user.id===userId);
      if(item){setPending({id:item.id,direction});return;}
      after=page.next;if(after&&seen.has(after))throw Error('Repeated cursor');if(after)seen.add(after);
     }while(after);
    }
   }catch{if(stamp===generation.current&&!ctl.signal.aborted)setError('Не удалось загрузить состояние дружбы.');}
   finally{if(stamp===generation.current)setLoading(false);}
  })();
  return()=>{generation.current++;ctl.abort();};
 },[client,userId,friend,revision]);
 async function act(accept=false){
  if(busy.current||loading||error)return;const stamp=generation.current;busy.current=true;setSaving(true);setError('');
  try{
   if(friend)await removeFriend(client,userId);
   else if(pending){if(accept)await acceptFriendRequest(client,pending.id);else await deleteFriendRequest(client,pending.id);}
   else await sendFriendRequest(client,userId);
   if(stamp!==generation.current)return;
   window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));onChanged();setRevision(v=>v+1);
  }catch(e){if(stamp===generation.current){if(e instanceof ApiError&&(e.status===404||e.status===409)){window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));onChanged();setRevision(v=>v+1);}else setError(friendLimitMessage(e)??'Не удалось изменить дружбу. Повторите попытку.');}}
  finally{if(stamp===generation.current){busy.current=false;setSaving(false);}}
 }
 return <div className="profile-friendship" aria-busy={loading||saving}>
  {error?<p role="status">{error} <button className="text-button" disabled={saving} onClick={()=>setRevision(v=>v+1)}>Повторить</button></p>:loading?<span className="muted">Проверяем дружбу…</span>:<>
   {pending?.direction==='incoming'&&<button className="primary" disabled={saving} onClick={()=>void act(true)}>Принять заявку</button>}
   <button className="secondary" disabled={saving} onClick={()=>void act()}>{friend?'Удалить из друзей':pending?.direction==='incoming'?'Отклонить заявку':pending?'Отменить заявку':'Добавить в друзья'}</button>
  </>}
 </div>;
}
