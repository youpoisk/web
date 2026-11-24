import React,{useEffect,useState}from'react';
import{ShieldCheck,ShieldHalf}from'lucide-react';
import type{ApiClient}from'../shared/api/client.ts';
import{createBadgeLoader,type UserStatus}from'../shared/users/badges.ts';
type Client=Pick<ApiClient,'request'>;
const loaders=new WeakMap<Client,ReturnType<typeof createBadgeLoader>>();
function loader(client:Client){let value=loaders.get(client);if(!value){value=createBadgeLoader(ids=>client.request('getUserBadges',{body:{user_ids:ids}}));loaders.set(client,value)}return value;}
export function useUserStatus(client:Client|null,userId:string){const[snapshot,setSnapshot]=useState<{id:string;client:Client;status:UserStatus}|null>(null);useEffect(()=>{setSnapshot(null);if(!client||!userId)return;let live=true;const update=()=>{if(document.hidden)return;void loader(client).load(userId).then(status=>{if(live)setSnapshot({id:userId,client,status})},()=>{if(live)setSnapshot(null)})};update();const timer=setInterval(update,60000);document.addEventListener('visibilitychange',update);return()=>{live=false;clearInterval(timer);document.removeEventListener('visibilitychange',update)}},[client,userId]);return snapshot?.id===userId&&snapshot.client===client?snapshot.status:null;}
export function AdministratorBadge(){return <span className="administrator-badge" title="Администратор"><ShieldCheck size={16} role="img" aria-label="Администратор"/></span>}
export function ModeratorBadge(){return <span className="moderator-badge" title="Модератор"><ShieldHalf size={16} role="img" aria-label="Модератор"/></span>}
export function BlockedBadge(){return <span className="blocked-badge" title="Пользователь заблокирован" aria-label="Пользователь заблокирован">blocked</span>}
export function UserName({client,userId,name}:{client:Client|null;userId:string;name:string}){const status=useUserStatus(client,userId);return <UserNameView name={name} status={status}/>}
export function UserNameView({name,status}:{name:string;status:UserStatus|null}){return <span className="user-name-with-badge"><bdi>{name}</bdi>{status?.admin&&<AdministratorBadge/>}{status?.moderator&&<ModeratorBadge/>}{status?.blocked&&<BlockedBadge/>}</span>}
