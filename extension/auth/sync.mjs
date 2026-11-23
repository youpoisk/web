/** Personal pull sync: each page and its checkpoint commit together. */
export function createPull({storage,request,check,now=Date.now}){
 const pointer=owner=>`yp-sync-v2:${owner}`,progress=owner=>`yp-sync-progress-v2:${owner}`;
 const record=(scope,item,seq)=>({version:2,owner:scope.owner,kind:item.kind,target:item.target_id,revision:item.revision,value:item.value,operation:item.operation,changeSeq:seq});
 const key=(owner,generation,kind,target)=>`yp-generation-v2:${owner}:${generation}:${kind}:${target}`;
 const protocol=()=>Object.assign(new Error('Invalid sync page'),{kind:'protocol'});
 async function read(scope,kind,target){
  const active=await storage.read(pointer(scope.owner)),ack=await storage.read(`yp-canonical-v2:${scope.owner}:${kind}:${target}`);
  if(!active)return ack;
  const base=await storage.read(key(scope.owner,active.generation,kind,target));
  if(ack&&(ack.changeSeq??-1)>active.cutSeq&&(!base||ack.revision>base.revision))return ack;
  return base;
 }
 async function step(scope,{pages=5}={}){
  await check(scope);
  const gc=storage.pruneGenerations?await storage.pruneGenerations(scope.owner):{done:true};
  let active=await storage.read(pointer(scope.owner)),pending=await storage.read(progress(scope.owner));
  if(pending?.epoch!==scope.epoch)pending=null;
  const cooldown=await storage.read(`yp-sync-retry-v2:${scope.owner}`);if(cooldown?.until>now())return {changed:false,waiting:true,cleanupPending:!gc.done};
  let changed=false;
  try{
   for(let count=0;count<pages;count++){
    await check(scope);
    if(!active?.cursor){
     if(!pending){const header=await request('createSyncSnapshot',{},scope);pending={epoch:scope.epoch,id:header.id,page:0,pages:header.pages,cutSeq:header.cut_seq};await check(scope);await storage.write(pending,progress(scope.owner));}
     const page=await request('getSyncSnapshotPage',{path:{id:pending.id},query:{page:pending.page}},scope);
     const next=pending.page+1<pending.pages?pending.page+1:null;
     if(page.cut_seq!==pending.cutSeq||page.next_page!==next)throw protocol();
     const entries=[];
     for(const item of page.items){if(item.revision===null||item.operation==='invalidate')throw protocol();entries.push([key(scope.owner,pending.id,item.kind,item.target_id),record(scope,item,pending.cutSeq)]);}
     if(next===null){active={generation:pending.id,cutSeq:pending.cutSeq,seq:pending.cutSeq,cursor:page.cut_cursor,lastSyncAt:now()};entries.push([pointer(scope.owner),active],[progress(scope.owner),null]);pending=null;changed=true;}
     else{pending={...pending,page:next};entries.push([progress(scope.owner),pending]);}
     await check(scope);await storage.commit(entries);
     if(!pending)return {changed,complete:true,cleanupPending:true};
    }else{
     const page=await request('getSyncChanges',{query:{after:active.cursor}},scope),entries=[];let sequence=active.seq;
     for(const item of page.items){if(!Number.isSafeInteger(item.seq)||item.seq<=sequence)throw protocol();sequence=item.seq;
      if(item.operation==='invalidate'){entries.push([`yp-invalidation-v2:${scope.owner}:${item.kind}`,{seq:sequence}]);continue;}
      if(item.revision===null)throw protocol();entries.push([key(scope.owner,active.generation,item.kind,item.target_id),record(scope,item,sequence)]);
     }
     active={...active,seq:sequence,cursor:page.cursor,lastSyncAt:now()};entries.push([pointer(scope.owner),active]);await check(scope);await storage.commit(entries);changed=changed||page.items.length>0;if(!page.more)return {changed,complete:true,cleanupPending:!gc.done};
    }
   }
   return {changed,complete:false,cleanupPending:!gc.done};
  }catch(error){
   await check(scope);
   if(error.status===410){await storage.commit([[pointer(scope.owner),active?{...active,cursor:null}:null],[progress(scope.owner),null]]);return {changed,reset:true,cleanupPending:!gc.done};}
   if(['network','timeout'].includes(error.kind)||error.status===429||error.status>=500){const seconds=Math.max(30,error.retryAfterSeconds??0);await storage.write({until:now()+seconds*1000},`yp-sync-retry-v2:${scope.owner}`);return {changed,waiting:true,cleanupPending:!gc.done};}
   throw error;
  }
 }
 async function status(scope){const active=await storage.read(pointer(scope.owner)),pending=await storage.read(progress(scope.owner)),retry=await storage.read(`yp-sync-retry-v2:${scope.owner}`);return {state:retry?.until>now()?'offline':pending||!active?.cursor?'syncing':'idle',lastSyncAt:active?.lastSyncAt??null};}
 return {step,read,status};
}
