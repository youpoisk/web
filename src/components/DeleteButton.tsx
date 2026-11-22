import{deferDeletion}from'../shared/library/deletion.ts';
import React,{useEffect,useRef,useState}from'react';
import{LoaderCircle}from'lucide-react';
export function DeleteButton({onDelete,children,disabled=false,className='secondary',label}:{onDelete:()=>void|Promise<unknown>;children:React.ReactNode;disabled?:boolean;className?:string;label?:string}){
 const[until,setUntil]=useState<number|null>(null),[remaining,setRemaining]=useState(5),[busy,setBusy]=useState(false),[error,setError]=useState(false);
 const action=useRef(onDelete),pending=useRef(false),live=useRef(true);action.current=onDelete;
 useEffect(()=>{live.current=true;return()=>{live.current=false;pending.current=false;};},[]);
 useEffect(()=>{if(disabled){pending.current=false;setUntil(null);}},[disabled]);
 useEffect(()=>{
  if(until===null)return;
  const tick=setInterval(()=>setRemaining(Math.max(1,Math.ceil((until-Date.now())/1000))),100);
  const cancel=deferDeletion(()=>{
   if(!pending.current)return;pending.current=false;setUntil(null);setBusy(true);
   void Promise.resolve().then(()=>action.current()).catch(()=>{if(live.current)setError(true);}).finally(()=>{if(live.current)setBusy(false);});
  });
  return()=>{cancel();clearInterval(tick);};
 },[until]);
 function click(){if(pending.current){pending.current=false;setUntil(null);return;}if(disabled||busy)return;pending.current=true;setError(false);setRemaining(5);setUntil(Date.now()+5000);}
 return <><button type="button" className={className+' deferred-delete'} aria-label={until!==null?'Отменить удаление':label} disabled={busy||(disabled&&until===null)} onClick={click}>{(until!==null||busy)&&<LoaderCircle size={14} className="delete-spinner" aria-hidden="true"/>}{until!==null?`Отменить удаление · ${remaining}`:busy?'Удаляем…':children}</button>{error&&<span role="alert">Не удалось удалить. Повторите попытку.</span>}</>;
}
