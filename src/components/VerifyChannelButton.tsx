import React,{useEffect,useRef,useState}from'react';
import{BadgeCheck,LoaderCircle}from'lucide-react';
import{ApiError,type ApiClient,type ResponseBody}from'../shared/api/client.ts';
export function VerifyChannelButton({client,youtubeId,onVerified}:{client:Pick<ApiClient,'request'>;youtubeId:string;onVerified:(card:ResponseBody<'getVideoCardByYoutube'>)=>void}){
 const[busy,setBusy]=useState(false),[error,setError]=useState('');const pending=useRef(false),generation=useRef(0),request=useRef<AbortController|null>(null);
 useEffect(()=>{generation.current++;pending.current=false;setBusy(false);setError('');return()=>{generation.current++;request.current?.abort()}},[client,youtubeId]);
 async function verify(){if(pending.current)return;const stamp=generation.current,ctl=new AbortController();request.current=ctl;pending.current=true;setBusy(true);setError('');try{await client.request('resolveVideoChannelIdentity',{path:{youtube_id:youtubeId},body:{handle:''},signal:ctl.signal});const card=await client.request('getVideoCardByYoutube',{path:{youtube_id:youtubeId},signal:ctl.signal});if(stamp===generation.current)onVerified(card)}catch(e){if(stamp===generation.current)setError(e instanceof ApiError&&e.status===429?'Лимит проверок исчерпан. Попробуйте позже.':'Не удалось подтвердить канал через YouTube. Попробуйте позже.')}finally{if(stamp===generation.current){pending.current=false;setBusy(false)}}}
 return <><button className="secondary" type="button" disabled={busy} onClick={()=>void verify()} title="Проверить владельца видео через YouTube. Ваши оценки не отправляются автоматически.">{busy?<LoaderCircle size={17} className="spinning"/>:<BadgeCheck size={17}/>}Подтвердить канал</button>{error&&<span role="alert" className="small muted">{error}</span>}</>;
}
