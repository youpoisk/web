import React,{useEffect,useState}from'react';
import{ShieldCheck}from'lucide-react';
import type{ApiClient}from'../shared/api/client.ts';
import{createBadgeLoader}from'../shared/users/badges.ts';
type Client=Pick<ApiClient,'request'>;
const loaders=new WeakMap<Client,ReturnType<typeof createBadgeLoader>>();
function loader(client:Client){let value=loaders.get(client);if(!value){value=createBadgeLoader(ids=>client.request('getUserBadges',{body:{user_ids:ids}}));loaders.set(client,value)}return value;}
export function AdministratorBadge(){return <span className="administrator-badge" title="Администратор"><ShieldCheck size={16} role="img" aria-label="Администратор"/></span>}
export function UserName({client,userId,name}:{client:Client|null;userId:string;name:string}){const[snapshot,setSnapshot]=useState<{id:string;client:Client|null;admin:boolean}>({id:'',client:null,admin:false});useEffect(()=>{setSnapshot({id:userId,client,admin:false});if(!client||!userId)return;let live=true;const update=()=>{if(document.hidden)return;void loader(client).load(userId).then(value=>{if(live)setSnapshot({id:userId,client,admin:value})},()=>{if(live)setSnapshot({id:userId,client,admin:false})})};update();const timer=setInterval(update,60000);document.addEventListener('visibilitychange',update);return()=>{live=false;clearInterval(timer);document.removeEventListener('visibilitychange',update)}},[client,userId]);return <span className="user-name-with-badge"><bdi>{name}</bdi>{snapshot.id===userId&&snapshot.client===client&&snapshot.admin&&<AdministratorBadge/>}</span>}
