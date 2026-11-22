import React,{useEffect,useRef}from'react';
import{watchMore}from'../shared/library/infinite.ts';

/** Cursor pages load near the viewport, with an explicit keyboard/retry path. */
export function LoadMore({cursor,loaded,busy,error=false,onMore}:{cursor:string|null;loaded:number;busy:boolean;error?:boolean;onMore:()=>void}){
 const target=useRef<HTMLDivElement>(null),last=useRef<string|null>(null),load=useRef(onMore);load.current=onMore;
 useEffect(()=>{
  if(!cursor||busy||error||!target.current||typeof IntersectionObserver==='undefined')return;
  const key=JSON.stringify([cursor,loaded]);if(last.current===key)return;
  return watchMore(target.current,()=>{last.current=key;load.current();},notify=>new IntersectionObserver(entries=>notify(entries.some(entry=>entry.isIntersecting)),{rootMargin:'200px 0px'}));
 },[cursor,loaded,busy,error]);
 if(!cursor)return null;
 return <div className="load-more" ref={target}>
  {error&&<p role="status" className="muted">Не удалось загрузить следующую порцию. Повторите загрузку кнопкой.</p>}
  <div className="actions"><button className="secondary" disabled={busy} onClick={()=>load.current()}>{busy?'Загружаем…':error?'Повторить загрузку':'Показать ещё'}</button></div>
 </div>;
}
