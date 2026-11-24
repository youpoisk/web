import{createAvatarLinkCache}from'../shared/users/avatar-links.ts';
import{useVisibleUserStatus}from'./UserName.tsx';
import React, { useEffect, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';

type AvatarReader = Pick<ApiClient, 'request'> & Partial<Pick<ApiClient, 'avatar' | 'avatarScope'>>;
let invalidation=0;
const caches=new WeakMap<AvatarReader,{revision:number;cache:ReturnType<typeof createAvatarLinkCache>}>();
function links(client:AvatarReader){let value=caches.get(client);if(!value){value={revision:invalidation,cache:createAvatarLinkCache(id=>client.avatar!(id),()=>client.avatarScope??'unscoped')};caches.set(client,value)}if(value.revision!==invalidation){value.cache.invalidate();value.revision=invalidation}return value.cache;}
const listeners = new Set<(id?: string) => void>();
export function invalidateAvatar(userId?: string): void {
 invalidation++;
  for (const listener of listeners) listener(userId);
}
/** Short lived per-client/per-auth-scope signed-link cache with in-flight dedupe. */
export function Avatar({ client, userId, name, className = 'avatar' }: { client: AvatarReader | null; userId: string; name: string; className?: string }) {
  const scope = client?.avatarScope;
  const{status,ref,visible}=useVisibleUserStatus(client,userId);
  const [image, setImage] = useState<{ client: AvatarReader; userId: string; version: number; scope: string | undefined; url: string } | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = (id?: string) => { if (!id || id === userId) {if(client)links(client).invalidate(id);setVersion(v => v + 1);} };
    listeners.add(bump);
    return () => { listeners.delete(bump); };
  }, [userId,client]);
  useEffect(() => {
    const controller = new AbortController();
    if (client?.avatar&&visible) void links(client).read(userId, controller.signal).then(url => {
      if (!controller.signal.aborted) setImage(url ? { client, userId, version, scope, url } : null);
    }).catch(() => { if (!controller.signal.aborted) setImage(null); });
    return () => controller.abort();
  }, [client, userId, version, scope,visible]);
  const url = image?.client === client && image.userId === userId && image.version === version && image.scope === scope ? image.url : null;
  return <AvatarView forwardedRef={ref} className={className} url={url} name={name} blocked={status?.blocked===true} pending={status===null} onError={()=>{setImage(null);if(client)links(client).invalidate(userId)}}/>;
}
export function AvatarView({className='avatar',url,name,blocked,pending=false,onError=()=>{},forwardedRef}: {className?:string;url:string|null;name:string;blocked:boolean;pending?:boolean;onError?:()=>void;forwardedRef?:React.Ref<HTMLSpanElement>}){return <span ref={forwardedRef} className={className+(url?' has-image':'')+(blocked?' avatar-blocked':pending?' avatar-status-pending':'')} aria-hidden="true">{url?<img src={url} alt="" referrerPolicy="no-referrer" loading="lazy" onError={onError}/>:<span className="avatar-initial">{[...(name||'?')][0]}</span>}</span>}
