import React,{useEffect,useRef,useState}from'react';
import{ArrowRight,ChevronRight,Star}from'lucide-react';
import{ApiError,type ApiClient}from'../shared/api/client.ts';
import{appendSimilar,loadSimilar,similarDuration,type SimilarVideo}from'../shared/library/similar.ts';
import{LoadMore}from'./LoadMore.tsx';
export function SimilarVideos({client,youtubeId}:{client:Pick<ApiClient,'request'>;youtubeId:string}){
 const[items,setItems]=useState<SimilarVideo[]>([]),[next,setNext]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false),[restart,setRestart]=useState(false),[expanded,setExpanded]=useState(false);
 const generation=useRef(0),busy=useRef(false);
 async function load(after:string|null,signal?:AbortSignal){if(busy.current)return;busy.current=true;const stamp=generation.current;setLoading(true);setError(false);setRestart(false);if(after===null){setItems([]);setNext(null);}try{const page=await loadSimilar(client,youtubeId,after,signal);if(stamp!==generation.current)return;setItems(previous=>after?appendSimilar(previous,page.items):page.items);setNext(page.next_cursor??null);}catch(e){if(stamp===generation.current&&!signal?.aborted){setError(true);setRestart(e instanceof ApiError&&e.status===422);}}finally{if(stamp===generation.current){busy.current=false;setLoading(false);}}}
 useEffect(()=>{generation.current++;busy.current=false;setItems([]);setNext(null);setExpanded(false);const controller=new AbortController();void load(null,controller.signal);return()=>{generation.current++;controller.abort();};},[client,youtubeId]);
 return <SimilarVideosView items={items} next={next} loading={loading} error={error} restart={restart} expanded={expanded} onToggle={()=>setExpanded(value=>!value)} onLoad={after=>void load(after)}/>;
}
export function SimilarVideosView({items,next,loading,error,restart,expanded,onToggle,onLoad}:{items:SimilarVideo[];next:string|null;loading:boolean;error:boolean;restart:boolean;expanded:boolean;onToggle:()=>void;onLoad:(after:string|null)=>void}){
 if(!loading&&!error&&!items.length)return null;
 return <section className="similar-videos" aria-labelledby="similar-videos-title" aria-busy={loading}><div className="similar-videos-heading"><div><h2 id="similar-videos-title">Похожие видео</h2><p className="small muted">По общим хэштегам</p></div>{items.length>0&&<button className="text-button similar-expand" aria-expanded={expanded} onClick={onToggle}>{expanded?'Свернуть':'Все похожие'}<ChevronRight size={18}/></button>}</div>
 <div className={expanded?'similar-grid':'similar-rail'}>{items.map(v=><article className="similar-card" key={v.id}><a className="similar-poster" href={'#/video/'+v.youtube_video_id} aria-label={v.title??'Открыть видео'}><img src={v.preview_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={event=>{event.currentTarget.style.visibility='hidden'}}/><span className="similar-rating"><Star size={12}/><strong className="rating-number">{v.rating.average??'—'}</strong></span>{v.duration_seconds!==null&&<span className="similar-duration">{similarDuration(v.duration_seconds)}</span>}</a><a className="similar-title" href={'#/video/'+v.youtube_video_id}>{v.title??'Название пока неизвестно'}</a><p className="small muted">{v.channel?.name??'Канал неизвестен'}</p></article>)}</div>
 {loading&&!items.length&&<p className="muted small" role="status">Подбираем похожие видео…</p>}{error&&<p className="muted small" role="status">{restart?'Подборка изменилась. Загрузите её заново.':'Не удалось загрузить похожие видео.'} <button className="text-button" disabled={loading} onClick={()=>onLoad(restart?null:next)}>{restart?'Обновить подборку':'Повторить'}</button></p>}
 {expanded&&next&&!restart&&<LoadMore cursor={next} loaded={items.length} busy={loading} error={error} onMore={()=>onLoad(next)}/>}{!expanded&&next&&!error&&<button className="secondary similar-more" onClick={onToggle}>Смотреть все похожие<ArrowRight size={15}/></button>}</section>;
}

