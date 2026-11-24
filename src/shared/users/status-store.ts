import type{UserStatus}from'./badges.ts';
type Ports={visible:()=>boolean;start:(tick:()=>void)=>()=>void};
type Entry={listeners:Set<(status:UserStatus|null)=>void>;pending:boolean};
/** One scheduler per client; last subscriber releases all timer/listener resources. */
export function createStatusStore(load:(id:string,force:boolean)=>Promise<UserStatus>,ports:Ports){
 const entries=new Map<string,Entry>();let stop:(()=>void)|null=null;
 function refresh(id:string,entry:Entry,force:boolean){if(!ports.visible()||entry.pending)return;entry.pending=true;void load(id,force).then(status=>publish(id,entry,status),()=>publish(id,entry,null)).finally(()=>{entry.pending=false})}
 function publish(id:string,entry:Entry,status:UserStatus|null){if(entries.get(id)!==entry)return;for(const listener of entry.listeners)listener(status)}
 function tick(){for(const[id,entry]of entries)refresh(id,entry,true)}
 return{subscribe(id:string,listener:(status:UserStatus|null)=>void){let entry=entries.get(id);if(!entry){entry={listeners:new Set(),pending:false};entries.set(id,entry)}entry.listeners.add(listener);if(!stop)stop=ports.start(tick);refresh(id,entry,false);return()=>{entry!.listeners.delete(listener);if(!entry!.listeners.size)entries.delete(id);if(!entries.size&&stop){stop();stop=null}}}};
}
