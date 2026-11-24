import{useVisibleUserStatus}from'./UserName.tsx';
import React, { useEffect, useState } from 'react';
import type { ApiClient } from '../shared/api/client.ts';

type AvatarReader = Pick<ApiClient, 'request'> & Partial<Pick<ApiClient, 'avatar' | 'avatarScope'>>;
const listeners = new Set<(id?: string) => void>();
export function invalidateAvatar(userId?: string): void {
  for (const listener of listeners) listener(userId);
}
/** No shared cache: signed image URLs belong to the component's account scope. */
export function Avatar({ client, userId, name, className = 'avatar' }: { client: AvatarReader | null; userId: string; name: string; className?: string }) {
  const scope = client?.avatarScope;
  const{status,ref}=useVisibleUserStatus(client,userId);
  const [image, setImage] = useState<{ client: AvatarReader; userId: string; version: number; scope: string | undefined; url: string } | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = (id?: string) => { if (!id || id === userId) setVersion(v => v + 1); };
    listeners.add(bump);
    return () => { listeners.delete(bump); };
  }, [userId]);
  useEffect(() => {
    const controller = new AbortController();
    if (client?.avatar) void client.avatar(userId, controller.signal).then(url => {
      if (!controller.signal.aborted) setImage(url ? { client, userId, version, scope, url } : null);
    }).catch(() => { if (!controller.signal.aborted) setImage(null); });
    return () => controller.abort();
  }, [client, userId, version, scope]);
  const url = image?.client === client && image.userId === userId && image.version === version && image.scope === scope ? image.url : null;
  return <AvatarView forwardedRef={ref} className={className} url={url} name={name} blocked={status?.blocked===true} pending={status===null} onError={()=>setImage(null)}/>;
}
export function AvatarView({className='avatar',url,name,blocked,pending=false,onError=()=>{},forwardedRef}: {className?:string;url:string|null;name:string;blocked:boolean;pending?:boolean;onError?:()=>void;forwardedRef?:React.Ref<HTMLSpanElement>}){return <span ref={forwardedRef} className={className+(url?' has-image':'')+(blocked?' avatar-blocked':pending?' avatar-status-pending':'')} aria-hidden="true">{url?<img src={url} alt="" referrerPolicy="no-referrer" loading="lazy" onError={onError}/>:<span className="avatar-initial">{[...(name||'?')][0]}</span>}</span>}
