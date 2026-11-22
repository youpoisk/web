import { Avatar } from './Avatar.tsx';
import{Send,X,Search,Users,LoaderCircle,ArrowUpRight}from'lucide-react';
import React,{useEffect,useRef,useState}from'react';
import type{ApiClient}from'../shared/api/client.ts';
import{ApiError}from'../shared/api/client.ts';
import{loadFriends,sendMessage,messageError,type Friend}from'../shared/library/lists.ts';
export function ShareVideo({client,videoId}:{client:Pick<ApiClient,'request'>;videoId:string}){
 const[open,setOpen]=useState(false),[friends,setFriends]=useState<Friend[]>([]),[next,setNext]=useState<string|null>(null),[loading,setLoading]=useState(false),[sending,setSending]=useState<string|null>(null),[error,setError]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),[query,setQuery]=useState('');
 useEffect(()=>{const node=dialog.current;if(!node)return;if(open&&!node.open)node.showModal();else if(!open&&node.open)node.close();},[open]);
 useEffect(()=>{if(open&&query.trim()&&next&&!loading&&!error&&sending===null)void load(next);},[open,query,next,loading,error,sending]);
 const generation=useRef(0),busy=useRef(false),reading=useRef(false),attempts=useRef(new Map<string,string>());
 useEffect(()=>{generation.current++;attempts.current.clear();return()=>{generation.current++;};},[client,videoId]);
 async function load(after:string|null){if(reading.current)return;reading.current=true;const stamp=generation.current;setLoading(true);setError('');try{const page=await loadFriends(client,after);if(stamp!==generation.current)return;setFriends(prev=>after?[...prev,...page.items.filter(x=>!prev.some(y=>y.user.id===x.user.id))]:page.items);setNext(page.next);}catch{if(stamp===generation.current)setError('Не удалось загрузить друзей.');}finally{if(stamp===generation.current){reading.current=false;setLoading(false);}}}
 async function send(id:string){if(busy.current)return;busy.current=true;const stamp=generation.current;setSending(id);setError('');const key=attempts.current.get(id)??crypto.randomUUID();attempts.current.set(id,key);try{await sendMessage(client,id,key,'',videoId);if(stamp!==generation.current)return;attempts.current.delete(id);setOpen(false);location.hash=`#/messages/${id}`;}catch(e){if(stamp===generation.current){if(e instanceof ApiError&&[403,404,409,422].includes(e.status))attempts.current.delete(id);setError(messageError(e));}}finally{if(stamp===generation.current){busy.current=false;setSending(null);}}}
 const term=query.trim().toLocaleLowerCase('ru-RU'),visible=friends.filter(it=>(it.user.name+' '+it.user.login).toLocaleLowerCase('ru-RU').includes(term));
 return <><button className="secondary" aria-haspopup="dialog" onClick={()=>{setOpen(true);setQuery('');if(!friends.length)void load(null);}}><Send size={15}/>Отправить другу</button>
 <dialog ref={dialog} className="share-dialog" aria-labelledby="share-title" onClose={()=>setOpen(false)} onCancel={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
  <div className="share-dialog-content"><header className="share-dialog-head"><span className="share-heading-icon"><Send size={21}/></span><div><h2 id="share-title">Кому отправить</h2><p>Поделитесь видео в личной переписке</p></div><button type="button" className="icon-btn" aria-label="Закрыть выбор друга" onClick={()=>setOpen(false)}><X size={20}/></button></header>
  <label className="share-search"><Search size={18}/><input autoFocus aria-label="Поиск друга" placeholder="Поиск по имени или логину" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <div className="share-recipients" aria-busy={loading||sending!==null}>{visible.map((it,i)=><button className="share-recipient" key={it.user.id} disabled={sending!==null} onClick={()=>void send(it.user.id)}><Avatar client={client} userId={it.user.id} name={it.user.name || it.user.login} className={'avatar share-avatar color'+(i%3+1)}/><span className="share-recipient-name"><strong>{it.user.name||it.user.login}</strong><small>@{it.user.login}</small></span><span className="share-recipient-action">{sending===it.user.id?<LoaderCircle size={19} className="delete-spinner"/>:<ArrowUpRight size={19}/>}</span></button>)}
  {loading&&<p className="share-state" role="status"><LoaderCircle size={18} className="delete-spinner"/>Загружаем друзей…</p>}
  {error&&<p className="share-state" role="alert">{error}<button className="text-button" disabled={loading||sending!==null} onClick={()=>void load(friends.length?next:null)}>Повторить загрузку</button></p>}
  {!loading&&!error&&!visible.length&&(!term||!next)&&<div className="share-empty"><Users size={32}/><strong>{term?'Никого не нашли':'Пока нет друзей'}</strong><p>{term?'Попробуйте другое имя или логин':'Добавьте друзей, чтобы делиться с ними видео'}</p></div>}
  {next&&!term&&<button className="share-more text-button" disabled={loading||sending!==null} onClick={()=>void load(next)}>Показать ещё</button>}
  </div><p className="share-dialog-foot">Выберите друга — видео появится в вашей переписке</p></div>
 </dialog></>;
}
