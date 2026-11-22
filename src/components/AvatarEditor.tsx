import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, LoaderCircle } from 'lucide-react';
import { ApiClient, ApiError } from '../shared/api/client.ts';
import { Avatar, invalidateAvatar } from './Avatar.tsx';
import { DeleteButton } from './DeleteButton.tsx';

type State = { revision: number; etag: string };
export function AvatarEditor({ client, userId, name }: { client: ApiClient; userId: string; name: string }) {
 const [current,setCurrent]=useState<State|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [draft,setDraft]=useState<{image:HTMLImageElement;url:string}|null>(null);
 const [zoom,setZoom]=useState(1),[x,setX]=useState(0),[y,setY]=useState(0);
 const canvas=useRef<HTMLCanvasElement>(null),working=useRef(false),generation=useRef(0),pick=useRef(0);
 useEffect(()=>{const ctl=new AbortController(),stamp=++generation.current;void client.request('getMyAvatarState',{signal:ctl.signal}).then(s=>{if(stamp===generation.current){setCurrent(s);invalidateAvatar(userId);}}).catch(()=>{if(!ctl.signal.aborted&&stamp===generation.current)setError('Не удалось загрузить аватар. Откройте настройки ещё раз.');});return()=>{generation.current++;pick.current++;ctl.abort();};},[client,userId]);
 useEffect(()=>()=>{if(draft)URL.revokeObjectURL(draft.url);},[draft]);
 useEffect(()=>{
  if(!draft||!canvas.current)return;
  const ctx=canvas.current.getContext('2d');if(!ctx)return;
  const image=draft.image,scale=Math.max(128/image.naturalWidth,128/image.naturalHeight)*zoom;
  const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  ctx.clearRect(0,0,128,128);ctx.drawImage(image,-(w-128)*(x+100)/200,-(h-128)*(y+100)/200,w,h);
 },[draft,zoom,x,y]);
 async function choose(file?:File){
  if(!file||working.current)return;const serial=++pick.current;setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<1||file.size>2097152){setError('Выберите JPEG, PNG или статический WebP размером до 2 МБ.');return;}
  const url=URL.createObjectURL(file),image=new Image();
  image.src=url;
  try{await image.decode();if(serial!==pick.current){URL.revokeObjectURL(url);return;}if(image.naturalWidth>4096||image.naturalHeight>4096||!image.naturalWidth||!image.naturalHeight)throw Error('dimensions');setDraft({image,url});setZoom(1);setX(0);setY(0);}
  catch{URL.revokeObjectURL(url);if(serial===pick.current)setError('Не удалось прочитать изображение. Максимальный размер — 4096 × 4096.');}
 }
 async function save(){
  if(working.current||!current||!draft||!canvas.current)return;
  working.current=true;setBusy(true);setError('');const stamp=generation.current,revision=current.revision;
  try{const blob=await new Promise<Blob>((resolve,reject)=>canvas.current!.toBlob(b=>b?resolve(b):reject(Error('canvas')),'image/png'));const state=await client.uploadAvatar(blob,revision);if(stamp!==generation.current)return;setCurrent(state);setDraft(null);invalidateAvatar(userId);}
  catch(e){if(stamp===generation.current){if(e instanceof ApiError&&e.status===409){setError('Аватар уже изменён на другом устройстве. Проверьте изображение и сохраните снова.');try{const s=await client.request('getMyAvatarState',{});if(stamp===generation.current){setCurrent(s);invalidateAvatar(userId);}}catch{if(stamp===generation.current)setCurrent(null);}}else setError(e instanceof ApiError&&e.status===429?'Слишком частая смена аватара. Попробуйте через час.':'Не удалось сохранить аватар. Повторите попытку.');}}
  finally{working.current=false;if(stamp===generation.current)setBusy(false);}
 }
 async function remove(){
  if(working.current||!current)return;
  working.current=true;setBusy(true);setError('');const stamp=generation.current,revision=current.revision;
  try{await client.request('deleteMyAvatar',{header:{'If-Match':`"${revision}"`}});if(stamp!==generation.current)return;setCurrent({revision:revision+1,etag:''});setDraft(null);invalidateAvatar(userId);}
  catch(e){if(stamp===generation.current){if(e instanceof ApiError&&e.status===409){setError('Аватар уже изменён. Проверьте его перед повторным удалением.');try{const s=await client.request('getMyAvatarState',{});if(stamp===generation.current){setCurrent(s);invalidateAvatar(userId);}}catch{if(stamp===generation.current)setCurrent(null);}}else setError('Не удалось удалить аватар. Повторите попытку.');}throw e;}
  finally{working.current=false;if(stamp===generation.current)setBusy(false);}
 }
 return <section className="panel avatar-editor" aria-busy={busy}>
  <div className="avatar-editor-title"><Camera size={21}/><h2>Аватар</h2></div>
  <div className="avatar-editor-body"><Avatar client={client} userId={userId} name={name} className="avatar profile-avatar"/><div><p className="muted">JPEG, PNG или статический WebP до 2 МБ.</p><label className="secondary avatar-file"><Upload size={16}/>Выбрать фото<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||!current} onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/></label></div></div>
  {draft&&<div className="avatar-crop"><canvas ref={canvas} width={128} height={128} aria-label="Предпросмотр аватара"/><div className="avatar-crop-controls"><label>Масштаб<input type="range" min="1" max="3" step="0.05" value={zoom} disabled={busy} onChange={e=>setZoom(Number(e.target.value))}/></label><label>По горизонтали<input type="range" min="-100" max="100" value={x} disabled={busy} onChange={e=>setX(Number(e.target.value))}/></label><label>По вертикали<input type="range" min="-100" max="100" value={y} disabled={busy} onChange={e=>setY(Number(e.target.value))}/></label></div></div>}
  <div className="actions">{draft&&<><button type="button" className="primary" disabled={busy||!current} onClick={()=>void save()}>{busy?<LoaderCircle size={16} className="delete-spinner"/>:<Upload size={16}/>}Сохранить аватар</button><button type="button" className="secondary" disabled={busy} onClick={()=>{pick.current++;setDraft(null);}}>Отменить</button></>}{current?.etag&&<DeleteButton disabled={busy} onDelete={remove}>Удалить аватар</DeleteButton>}</div>
  {error&&<p role="alert" className="notice">{error}</p>}
 </section>;
}
