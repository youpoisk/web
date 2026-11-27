import React,{useEffect,useRef,useState}from'react';
import{TvMinimal,BadgeCheck,ArrowUpRight}from'lucide-react';
import type{ApiClient,ResponseBody}from'../shared/api/client.ts';
import{LoadMore}from'./LoadMore.tsx';
type Page=ResponseBody<'getChannelDirectory'>;
export function ChannelDirectory({client}:{client:Pick<ApiClient,'request'>|null}){
 const[items,setItems]=useState<Page['items']>([]),[cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false);
 const generation=useRef(0),pending=useRef(false),controller=useRef<AbortController|null>(null);
 async function load(after:string|null){if(!client||pending.current)return;const stamp=generation.current,ctl=new AbortController();controller.current=ctl;pending.current=true;setLoading(true);setError(false);
  try{const page=await client.request('getChannelDirectory',{query:{limit:12,...(after?{after}:{})},signal:ctl.signal});if(stamp!==generation.current)return;setItems(previous=>{const unique=new Map((after?previous:[]).map(item=>[item.id,item]));for(const item of page.items)unique.set(item.id,item);return [...unique.values()]});setCursor(page.next_cursor??null)}
  catch{if(stamp===generation.current&&!ctl.signal.aborted)setError(true)}finally{if(stamp===generation.current){pending.current=false;setLoading(false)}}
 }
 useEffect(()=>{generation.current++;pending.current=false;setItems([]);setCursor(null);setError(false);setLoading(!!client);if(client)void load(null);return()=>{generation.current++;controller.current?.abort()}},[client]);
 return <section className="channel-directory" aria-busy={loading}><div className="page-head"><div><div className="eyebrow">АВТОРЫ ХОРОШИХ ВИДЕО</div><h1>Каналы</h1><p className="muted">Каналы, чьи видео оценивают и обсуждают в YouPoisk.</p></div></div>
 {!client&&<p className="panel muted">Не удалось подключиться к YouPoisk.</p>}
 {loading&&!items.length&&<p className="muted" role="status">Загружаем каналы…</p>}
 {client&&!loading&&!error&&!items.length&&<div className="panel channel-directory-empty"><TvMinimal size={32}/><h2>Каналы скоро появятся</h2><p className="muted">Здесь будут авторы видео, у которых есть оценки или доступные вам рецензии.</p><a className="secondary" href="#/">Вернуться к видео</a></div>}
 <div className="channel-directory-grid">{items.map(item=><article className="channel-directory-card" key={item.id}><div className="channel-directory-card-head"><span className="channel-directory-icon" aria-hidden="true"><TvMinimal size={25}/></span><div><h2><a href={`#/channel/${item.id}`}>{item.name?.trim()||'Канал без названия'}</a>{item.identity_verified&&<BadgeCheck size={17} className="channel-directory-verified" aria-label="Подтверждённый канал"/>}</h2><p className="small muted">{item.identity_verified?'Подтверждён на YouTube':'Предварительная карточка'}</p></div></div><p className="channel-directory-stat"><strong>{item.videos_count}</strong><span>Видео с оценками или рецензиями</span></p><a className="secondary" href={`#/channel/${item.id}`}>Открыть канал<ArrowUpRight size={16} aria-hidden="true"/></a></article>)}</div>
 <LoadMore cursor={cursor??(error?'retry':null)} loaded={items.length} busy={loading} error={error} onMore={()=>void load(cursor)}/></section>
}
