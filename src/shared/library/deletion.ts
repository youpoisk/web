/** Returns cancellation; cancellation after execution has started cannot undo a request. */
export function deferDeletion(action:()=>void,schedule:(callback:()=>void,ms:number)=>unknown=(callback,ms)=>setTimeout(callback,ms),clear:(timer:unknown)=>void=timer=>clearTimeout(timer as ReturnType<typeof setTimeout>)){
 let active=true;
 const timer=schedule(()=>{if(!active)return;active=false;action();},5000);
 return()=>{active=false;clear(timer);};
}
