import React, {useEffect,useRef,useState} from 'react';
import type {ApiClient} from '../shared/api/client.ts';
import {searchCatalog,type PublicCard} from '../shared/library/lists.ts';
import {HomeVideoCard} from './HomeVideos.tsx';
import {LoadMore} from './LoadMore.tsx';

/** Parent keys the list by exact channel ID; no display-name matching. */
export function ChannelVideos({client,channelId}:{client:Pick<ApiClient,'request'>;channelId:string}) {
 const [items,setItems]=useState<PublicCard[]>([]),[cursor,setCursor]=useState<string|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(false);
 const pending=useRef(false),generation=useRef(0),controller=useRef<AbortController|null>(null);
 async function load(after:string|null){
  if(pending.current)return;
  pending.current=true;setLoading(true);setError(false);
  const stamp=generation.current,ctl=new AbortController();controller.current=ctl;
  try{
   const page=await searchCatalog(client,{text:'',tags:[],match:'any',sort:'new',channelId},after,ctl.signal);
   if(stamp!==generation.current)return;
   setItems(previous=>{const unique=new Map((after?previous:[]).map(item=>[item.id,item]));for(const item of page.items)unique.set(item.id,item);return [...unique.values()];});
   setCursor(page.next);
  }catch{if(stamp===generation.current&&!ctl.signal.aborted)setError(true);}
  finally{if(stamp===generation.current){pending.current=false;setLoading(false);}}
 }
 useEffect(()=>{
  generation.current++;pending.current=false;setItems([]);setCursor(null);void load(null);
  return()=>{generation.current++;controller.current?.abort();};
 },[client,channelId]);
 return <section className="channel-videos" aria-labelledby="channel-videos-title" aria-busy={loading}>
  <div className="section-head"><h2 id="channel-videos-title">Видео канала</h2></div>
  {loading&&!items.length&&<p role="status" className="muted">Загружаем видео…</p>}
  {!loading&&!error&&!items.length&&<p className="muted">Видео этого канала пока не добавлены в YouPoisk.</p>}
  <div className="video-grid">{items.map(video=><HomeVideoCard key={video.id} video={{...video,siteRecommended:false}}/>)}</div>
  <LoadMore cursor={cursor??(error?'retry':null)} loaded={items.length} busy={loading} error={error} onMore={()=>void load(cursor)}/>
 </section>;
}

