import React,{useEffect,useState}from'react';
import{ShieldCheck}from'lucide-react';
import type{ApiClient}from'../shared/api/client.ts';
import{createBadgeLoader,type UserStatus}from'../shared/users/badges.ts';
type Client=Pick<ApiClient,'request'>;
const loaders=new WeakMap<Client,ReturnType<typeof createBadgeLoader>>();
function loader(client:Client){let value=loaders.get(client);if(!value){value=createBadgeLoader(ids=>client.request('getUserBadges',{body:{user_ids:ids}}));loaders.set(client,value)}return value;}
export function useUserStatus(client:Client|null,userId:string){const[snapshot,setSnapshot]=useState<{id:string;client:Client;status:UserStatus}|null>(null);useEffect(()=>{setSnapshot(null);if(!client||!userId)return;let live=true;const update=()=>{if(document.hidden)return;void loader(client).load(userId).then(status=>{if(live)setSnapshot({id:userId,client,status})},()=>{if(live)setSnapshot(null)})};update();const timer=setInterval(update,60000);document.addEventListener('visibilitychange',update);return()=>{live=false;clearInterval(timer);document.removeEventListener('visibilitychange',update)}},[client,userId]);return snapshot?.id===userId&&snapshot.client===client?snapshot.status:null;}
export function AdministratorBadge(){return <span className="administrator-badge role-badge-tooltip" data-role-tooltip="Администратор" tabIndex={0}><ShieldCheck size={16} role="img" aria-label="Администратор"/></span>}
export function ModeratorBadge(){return <span className="moderator-badge role-badge-tooltip" data-role-tooltip="Модератор" tabIndex={0}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-star" role="img" aria-label="Модератор"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m12 7 1.4 2.8 3.1.5-2.2 2.1.5 3.1L12 14l-2.8 1.5.5-3.1-2.2-2.1 3.1-.5Z" fill="currentColor" strokeWidth=".7"/></svg></span>}
export function BlockedBadge(){return <span className="blocked-badge" title="Пользователь заблокирован" aria-label="Пользователь заблокирован">blocked</span>}
export function UserName({client,userId,name}:{client:Client|null;userId:string;name:string}){const status=useUserStatus(client,userId);return <UserNameView name={name} status={status}/>}
export function UserNameView({name,status}:{name:string;status:UserStatus|null}){return <span className="user-name-with-badge"><bdi>{status?.blocked===false?name:maskBlockedName(name)}</bdi>{status?.admin&&<AdministratorBadge/>}{status?.moderator&&<ModeratorBadge/>}{status?.blocked&&<BlockedBadge/>}</span>}

/** Fixed mask avoids exposing the review text or its length before status resolves. */
export function maskBlockedName(name:string){const letters=Array.from(name.normalize('NFC').trim());if(!letters.length)return '***';return letters[0]+'***'+(letters.length>1?letters.at(-1):'');}
export function ReviewText({client,userId,text}:{client:Client|null;userId:string;text:string}){return <ReviewTextView text={text} status={useUserStatus(client,userId)}/>;}
export function ReviewTextView({text,status}:{text:string;status:UserStatus|null}){return status?.blocked===false?<span>{text}</span>:<span className="masked-review" aria-label="Текст рецензии скрыт">********</span>;}
