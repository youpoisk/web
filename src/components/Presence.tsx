import { useEffect } from 'react';
import type { ApiClient } from '../shared/api/client.ts';
/** Only visible website activity contributes to the five-minute online metric. */
export function usePresence(client: Pick<ApiClient,'request'> | null, owner: string | null) {
 useEffect(()=>{
  if(!client||!owner)return;
  const controller=new AbortController();let pending=false,lastAttempt=0;
  const touch=()=>{
   if(document.hidden||pending||Date.now()-lastAttempt<60000)return;
   pending=true;lastAttempt=Date.now();
   void client.request('recordMyPresence',{signal:controller.signal}).catch(()=>{}).finally(()=>{pending=false;});
  };
  touch();const timer=setInterval(touch,60000);
  document.addEventListener('visibilitychange',touch);window.addEventListener('focus',touch);
  return()=>{controller.abort();clearInterval(timer);document.removeEventListener('visibilitychange',touch);window.removeEventListener('focus',touch);};
 },[client,owner]);
}
