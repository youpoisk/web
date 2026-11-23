import * as schemas from '../../src/shared/api/validators.js';
import {ApiClient,ApiError} from '../../src/shared/api/client.ts';
export class BackendError extends Error{constructor(kind){super('Extension backend '+kind);this.kind=kind;}}
/** Account-scoped online transport with durable exact-command replay. No token DTOs. */
export function createBackend({session,storage,origin,fetch,crypto=globalThis.crypto,now=Date.now,random=Math.random}){
 let tail=Promise.resolve();
 const exclusive=fn=>{const work=tail.then(fn);tail=work.catch(()=>{});return work;};
 async function request(operation,options={},expected){
  const result=await session.authorize(async(token,scope)=>{
   if(expected&&(scope.owner!==expected.owner||scope.epoch!==expected.epoch))throw new BackendError('stale');
   const client=new ApiClient({baseUrl:origin,fetch,session:()=>({state:'authenticated',owner:scope.owner,epoch:scope.epoch,accessToken:token})});
   try{return {status:200,data:await client.request(operation,options)};}catch(error){if(error instanceof ApiError&&error.status===401)return {status:401};throw error;}
  });
  if(options.path?.id&&result.data?.target_id!==undefined&&result.data.target_id!==options.path.id)throw new BackendError('protocol');
  return result.data;
 }
 async function actor(){const state=await session.status();if(state.state!=='authenticated')throw new BackendError('authentication');return state;}
 async function durable(operation,target,intent,scope,bodyFactory,stage=null){
  const cooldown=await storage.read(`yp-rate-limit-v1:${scope.owner}`);if(cooldown?.until>now())throw new BackendError('retry_later');
  const slot=`yp-operation-v1:${scope.owner}:${operation}:${target}`,fingerprint=JSON.stringify(intent);
  let pending=await storage.read(slot);
  if(pending){
   if(typeof pending.key!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(pending.key)||typeof pending.lease!=='string'||!pending.lease.length||pending.lease.length>16384)throw new BackendError('reconcile_required');
   if(!schemas[schemas.contract[operation].request](pending.body)||pending.fingerprint!==JSON.stringify(operation==='addObservedVideo'?{id:pending.body.youtube_video_id}:Object.fromEntries(Object.entries(pending.body).filter(([key])=>key!=='expected_revision'))))throw new BackendError('reconcile_required');
   if(pending.version!==1||pending.owner!==scope.owner||pending.epoch!==scope.epoch||pending.operation!==operation||pending.target!==target||pending.fingerprint!==fingerprint||pending.state!=='pending')throw new BackendError('reconcile_required');
  }else{
   const body=await bodyFactory();const anchor=await request('issueOfflineLease',{},scope);
   pending={version:1,owner:scope.owner,epoch:scope.epoch,operation,target,fingerprint,body,lease:anchor.lease,key:crypto.randomUUID(),state:'pending',createdAt:now(),attempts:0,nextAttemptAt:0};
   if(stage){stage.row.commandKey=pending.key;await storage.commit([[slot,pending],[stage.slot,stage.row]]);}else await storage.write(pending,slot);
  }
  if((pending.nextAttemptAt??0)>now())throw new BackendError('retry_later');
  const live=await actor();if(live.owner!==scope.owner||live.epoch!==scope.epoch)throw new BackendError('stale');
  const attempts=Math.min(30,(pending.attempts??0)+1);
  const delay=Math.min(3600000,5000*2**Math.min(attempts-1,10))*(0.5+0.5*random());
  pending={...pending,attempts,nextAttemptAt:now()+Math.ceil(delay)};
  await storage.write(pending,slot);
  try{
   const options={body:pending.body,header:{'Idempotency-Key':pending.key,'X-Offline-Lease':pending.lease},...(operation==='addObservedVideo'?{}:{path:{id:target}})};
   const result=await request(operation,options,scope);
   const value=result.state??result.review;
   await storage.commit([[`yp-canonical-v2:${scope.owner}:${result.kind}:${result.target_id}`,{version:2,owner:scope.owner,kind:result.kind,target:result.target_id,revision:value.revision,value}],[slot,null],[`yp-receipt-v1:${scope.owner}:${pending.key}`,{revision:value.revision,target:result.target_id,kind:result.kind}]]);return result;
  }catch(error){
   if(error instanceof ApiError&&error.kind==='http'){
    if(error.status===429||error.status>=500){const until=Math.max(pending.nextAttemptAt,now()+(error.retryAfterSeconds??0)*1000);if(error.status===429)await storage.commit([[slot,{...pending,nextAttemptAt:until}],[`yp-rate-limit-v1:${scope.owner}`,{until}]]);else await storage.write({...pending,nextAttemptAt:until},slot);}
    else if(error.status!==401){await storage.write({...pending,state:[409,410,422].includes(error.status)?'conflict':'rejected',errorStatus:error.status},slot);throw new BackendError('reconcile_required');}
   }
   throw error;
  }
 }
 async function card(youtubeId,scope){try{const video=await request('getVideoCardByYoutube',{path:{youtube_id:youtubeId}},scope);if(video.youtube_video_id!==youtubeId)throw new BackendError('protocol');return video;}catch(error){if(error instanceof ApiError&&error.status===404)return null;throw error;}}
 async function check(scope){await session.authorize(async(_,live)=>{if(live.owner!==scope.owner||live.epoch!==scope.epoch)throw new BackendError('stale');});}


 function transient(error){return ['network','timeout','retry_later'].includes(error.kind)||error instanceof ApiError&&(error.status>=500||error.status===429);}
 async function snapshot(video,review,scope){await storage.write({video,review},`yp-snapshot-v1:${scope.owner}:${video.youtube_video_id}`);}
 async function stageIntent(video,patch,scope){
  const review=Object.hasOwn(patch,'review');if(review&&Object.keys(patch).length!==1)throw new BackendError('separate_operations_required');
  const slot=`yp-intent-v1:${scope.owner}:${video.id}:${review?'review':'state'}`,existing=await storage.read(slot);
  if(existing&&existing.epoch!==scope.epoch)throw new BackendError('reconcile_required');
  const cached=await storage.read(`yp-snapshot-v1:${scope.owner}:${video.id}`),target=cached?.video.id;
  const operation=review?'putVideoReview':'patchVideoState',pending=target?await storage.read(`yp-operation-v1:${scope.owner}:${operation}:${target}`):null;
  const canonical=target?await storage.read(`yp-canonical-v2:${scope.owner}:${review?'video_review':'video_state'}:${target}`):null;
  const revisions=[canonical?.revision,review?cached?.review.revision:cached?.video.my_state.revision].filter(Number.isSafeInteger),revision=revisions.length?Math.max(...revisions):null;
  const row={version:1,owner:scope.owner,epoch:scope.epoch,video,patch:{...(existing?.patch??{}),...patch},baseRevision:existing?.baseRevision??revision,createdAt:existing?.createdAt??now(),...(pending?{predecessor:pending.key}:{})};
  // A sent command is immutable. Further clicks replace only the unsent successor.
  if(existing?.commandKey){row.predecessor=existing.commandKey;row.predecessorIntent=JSON.stringify(review?{text:existing.patch.review}:existing.patch);}
  else if(existing?.predecessor&&!row.predecessor){row.predecessor=existing.predecessor;row.predecessorIntent=existing.predecessorIntent;}
  if(pending&&!row.predecessorIntent)row.predecessorIntent=pending.fingerprint;
  await storage.write(row,slot);return {slot,row};
 }
 async function flushIntent(stage,scope){
  const {row,slot}=stage;const isReview=Object.hasOwn(row.patch??{},'review');
  const validPatch=isReview?schemas.putVideoReview_request({expected_revision:0,text:row.patch.review}):schemas.patchVideoState_request({expected_revision:0,...row.patch});
  if(!row.video||!/^[\w-]{11}$/.test(row.video.id)||typeof row.video.title!=='string'||!validPatch||slot!==`yp-intent-v1:${scope.owner}:${row.video.id}:${isReview?'review':'state'}`)throw new BackendError('reconcile_required');
  if(row.owner!==scope.owner||row.epoch!==scope.epoch)throw new BackendError('reconcile_required');
  if(row.commandKey&&await storage.read(`yp-receipt-v1:${scope.owner}:${row.commandKey}`)){await storage.write(null,slot);return false;}
  let resolved=await card(row.video.id,scope);
  const addSlot=`yp-operation-v1:${scope.owner}:addObservedVideo:${row.video.id}`;
  if(await storage.read(addSlot)||!resolved){await durable('addObservedVideo',row.video.id,{id:row.video.id},scope,async()=>({youtube_video_id:row.video.id,title:row.video.title,expected_revision:0}));resolved=await card(row.video.id,scope);}
  if(!resolved)throw new BackendError('protocol');
  const review=Object.hasOwn(row.patch,'review'),operation=review?'putVideoReview':'patchVideoState',pendingSlot=`yp-operation-v1:${scope.owner}:${operation}:${resolved.id}`;
  const predecessor=await storage.read(pendingSlot);
  if(predecessor&&predecessor.key!==row.commandKey){
   if(predecessor.epoch!==scope.epoch||predecessor.state!=='pending')throw new BackendError('reconcile_required');
   await durable(operation,resolved.id,JSON.parse(predecessor.fingerprint),scope,async()=>{throw new BackendError('reconcile_required');});
   row.predecessor=predecessor.key;row.predecessorIntent=predecessor.fingerprint;
  }
  if(row.predecessor){const receipt=await storage.read(`yp-receipt-v1:${scope.owner}:${row.predecessor}`);if(!receipt)throw new BackendError('reconcile_required');row.baseRevision=receipt.revision;if(row.predecessorIntent===JSON.stringify(review?{text:row.patch.review}:row.patch)){await storage.write(null,slot);return false;}}
  await durable(operation,resolved.id,review?{text:row.patch.review}:row.patch,scope,async()=>{
   const result=await request(review?'getVideoReview':'getVideoState',{path:{id:resolved.id}},scope),value=result.review??result.state;
   return {expected_revision:row.baseRevision??value.revision,...(review?{text:row.patch.review}:row.patch)};
  },stage);
  await storage.write(null,slot);return true;
 }
 async function flushIntents(scope){
  const cursorKey=`yp-intent-cursor-v1:${scope.owner}`,saved=await storage.read(cursorKey),after=saved?.epoch===scope.epoch?saved.after:null;
  const page=await storage.entries(`yp-intent-v1:${scope.owner}:`,{after:after??null,limit:12});
  let sent=0;for(const [slot,row]of page.items){if(row.version!==1||row.owner!==scope.owner||row.epoch!==scope.epoch)continue;try{if(await flushIntent({slot,row},scope))sent++;}catch(error){if(error.kind==='reconcile_required'||error.kind==='retry_later')continue;throw error;}}
  await storage.write({epoch:scope.epoch,after:page.next},cursorKey);return sent;
 }
 async function conflictRecord(ref,scope){
  const prefix=`yp-operation-v1:${scope.owner}:`;if(typeof ref!=='string'||!ref.startsWith(prefix))throw new BackendError('invalid_reference');
  const row=await storage.read(ref);if(!row||row.owner!==scope.owner||!['patchVideoState','putVideoReview'].includes(row.operation)||ref!==prefix+row.operation+':'+row.target||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(row.target))throw new BackendError('invalid_reference');
  if(row.state==='pending'&&row.epoch===scope.epoch)throw new BackendError('pending');
  let local=JSON.parse(row.fingerprint);const keys=Object.keys(local),allowed=row.operation==='patchVideoState'?['rating','later','mark']:['text'];
  if(!schemas[schemas.contract[row.operation].request](row.body)||!keys.length||keys.some(key=>!allowed.includes(key))||keys.some(key=>row.body?.[key]!==local[key]))throw new BackendError('invalid_reference');
  const result=await request(row.operation==='patchVideoState'?'getVideoState':'getVideoReview',{path:{id:row.target}},scope);
  const video=await request('getVideoCard',{path:{id:row.target}},scope);if(video.id!==row.target)throw new BackendError('protocol');
  const stageSlot=`yp-intent-v1:${scope.owner}:${video.youtube_video_id}:${row.operation==='putVideoReview'?'review':'state'}`,staged=await storage.read(stageSlot);
  if(staged&&staged.owner===scope.owner&&staged.epoch===scope.epoch){const desired=row.operation==='putVideoReview'?{text:staged.patch.review}:staged.patch;if(schemas[schemas.contract[row.operation].request]({expected_revision:0,...desired}))local=desired;}
  return {row,local,result,value:result.state??result.review,video,stageSlot,staged};
 }
 function dto(video,review=null){
  if(!video.my_state)throw new BackendError('protocol');
  const own=video.my_state;
  return {id:video.youtube_video_id,title:video.title??'Видео YouTube',url:video.url,preview:video.preview_url,channel:video.channel?.name??'',channelUrl:video.channel?.url??'',rating:own.rating,later:own.later,mark:own.mark??null,review:review?.text??null,hasReview:video.has_review??(review?.text!==null&&review?.text!==undefined),createdAt:video.listed_at??new Date(0).toISOString(),updatedAt:video.listed_at??new Date(0).toISOString()};
 }
 return {
  conflicts:after=>exclusive(async()=>{
   const scope=await actor(),page=await storage.entries(`yp-operation-v1:${scope.owner}:`,{after:after??null,limit:12}),items=[];
   for(const [ref,row]of page.items){if(row.state==='pending'&&row.epoch===scope.epoch)continue;try{const {local,value,video}=await conflictRecord(ref,scope);items.push({ref,operation:row.operation,title:video.title,local,server:value,status:row.errorStatus??null});}catch(error){if(error.kind==='invalid_reference')continue;throw error;}}
   await check(scope);return {items,next:page.next};
  }),
  resolve:(ref,choice)=>exclusive(async()=>{
   const scope=await actor();if(!['server','local'].includes(choice))throw new BackendError('invalid_reference');
   const {row,local,result,value,stageSlot,staged}=await conflictRecord(ref,scope),archive=`yp-history-v1:${scope.owner}:${crypto.randomUUID()}`;
   if(choice==='server'){
    await check(scope);await storage.commit([[archive,{...row,staged,resolution:'server'}],[`yp-canonical-v2:${scope.owner}:${result.kind}:${row.target}`,{version:2,owner:scope.owner,kind:result.kind,target:row.target,revision:value.revision,value}],[ref,null],[stageSlot,null]]);return;
   }
   const anchor=await request('issueOfflineLease',{},scope);
   const pending={version:1,owner:scope.owner,epoch:scope.epoch,operation:row.operation,target:row.target,fingerprint:JSON.stringify(local),body:{expected_revision:value.revision,...local},key:crypto.randomUUID(),lease:anchor.lease,state:'pending',createdAt:now(),attempts:0,nextAttemptAt:0};
   await check(scope);await storage.commit([[archive,{...row,staged,resolution:'local'}],[ref,pending],[stageSlot,null]]);
   await durable(row.operation,row.target,local,scope,async()=>{throw new BackendError('reconcile_required');});
  }),
  queueStatus:()=>exclusive(async()=>{
   const scope=await actor(),prefix=`yp-operation-v1:${scope.owner}:`;let after=null,pending=0,blocked=0,nextAttemptAt=null,pages=0;
   do{const page=await storage.entries(prefix,{after,limit:12});for(const [,row]of page.items){if(row.owner!==scope.owner||row.epoch!==scope.epoch||row.state!=='pending')blocked++;else{pending++;const due=row.nextAttemptAt??0;if(Number.isFinite(due))nextAttemptAt=nextAttemptAt===null?due:Math.min(nextAttemptAt,due);}}after=page.next;}while(after&&++pages<10);
   const intents=await storage.entries(`yp-intent-v1:${scope.owner}:`,{limit:12});for(const [,row]of intents.items){if(row.epoch===scope.epoch)pending++;else blocked++;}
   await check(scope);return {pending,blocked,nextAttemptAt,more:!!after||!!intents.next};
  }),
  recover:after=>exclusive(async()=>{
   const scope=await actor(),prefix=`yp-operation-v1:${scope.owner}:`,cursorKey=`yp-recovery-v1:${scope.owner}`;
   const saved=after===undefined?await storage.read(cursorKey):null;
   const cursor=after??(saved?.epoch===scope.epoch?saved.after:null);
   const page=await storage.entries(prefix,{after:cursor??null,limit:12});let sent=0,blocked=0,deferred=0;
   for(const [slot,pending] of page.items){
    await check(scope);
    const operation=pending?.operation,target=pending?.target;
    const supported=['addObservedVideo','patchVideoState','putVideoReview'].includes(operation);
    const validTarget=typeof target==='string'&&(operation==='addObservedVideo'?/^[\w-]{11}$/.test(target):/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(target));
    if(!supported||!validTarget||slot!==prefix+operation+':'+target||pending.version!==1||pending.owner!==scope.owner||pending.epoch!==scope.epoch||pending.state!=='pending'){blocked++;continue;}
    let intent;try{intent=JSON.parse(pending.fingerprint);}catch{blocked++;continue;}
    if(JSON.stringify(intent)!==pending.fingerprint||!intent||typeof intent!=='object'||Array.isArray(intent)){blocked++;continue;}
    const body=pending.body;
    const revisionOK=body&&Number.isSafeInteger(body.expected_revision)&&body.expected_revision>=0;
    const intentKeys=Object.keys(intent),allowed=operation==='patchVideoState'?['rating','later','mark']:operation==='putVideoReview'?['text']:['id'];
    let bound=revisionOK&&intentKeys.length>0&&intentKeys.every(key=>allowed.includes(key));
    if(operation==='addObservedVideo')bound=bound&&intentKeys.length===1&&intent.id===target&&body.youtube_video_id===target&&body.expected_revision===0&&typeof body.title==='string'&&Object.keys(body).every(key=>['youtube_video_id','title','expected_revision'].includes(key));
    else bound=bound&&Object.keys(body).length===intentKeys.length+1&&intentKeys.every(key=>Object.hasOwn(body,key)&&body[key]===intent[key]);
    const envelope=typeof pending.key==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(pending.key)&&typeof pending.lease==='string'&&pending.lease.length>0&&pending.lease.length<=16384;
    if(!bound||!envelope){blocked++;continue;}
    try{await durable(operation,target,intent,scope,async()=>{throw new BackendError('reconcile_required');});sent++;}catch(error){if(error instanceof ApiError&&error.kind==='invalid_input'){await storage.write({...pending,state:'invalid'},slot);blocked++;continue;}if(error.kind==='retry_later'){deferred++;continue;}if(error.kind==='reconcile_required'){blocked++;continue;}throw error;}
   }
   await check(scope);await storage.write({epoch:scope.epoch,after:page.next},cursorKey);sent+=await flushIntents(scope);return {sent,blocked,...(deferred?{deferred}:{}),next:page.next};
  }),
  current:youtubeId=>exclusive(async()=>{const scope=await actor(),video=await card(youtubeId,scope);if(!video){await check(scope);return {videos:{}};}const {review}=await request('getVideoReview',{path:{id:video.id}},scope);await check(scope);await snapshot(video,review,scope);return {videos:{[youtubeId]:dto(video,review)}};}),
  library:after=>exclusive(async()=>{const scope=await actor(),page=await request('listWatchlist',{query:{limit:12,...(after?{after}:{})}},scope);await check(scope);return {videos:Object.fromEntries(page.items.map(video=>[video.youtube_video_id,dto(video)])),next:page.next_cursor??null};}),
  update:(video,patch)=>exclusive(async()=>{
   const scope=await actor(),stage=await stageIntent(video,patch,scope);
   try{await flushIntent(stage,scope);}catch(error){
    if(!transient(error)&&error.kind!=='reconcile_required')throw error;
    await check(scope);const saved=await storage.read(`yp-snapshot-v1:${scope.owner}:${video.id}`);
    const base=saved?dto(saved.video,saved.review):{...video,rating:null,later:false,review:null,createdAt:'',updatedAt:''};
    return {queued:true,videos:{[video.id]:{...base,...patch,pending:true}}};
   }
   const fresh=await card(video.id,scope),{review}=await request('getVideoReview',{path:{id:fresh.id}},scope);await check(scope);await snapshot(fresh,review,scope);return {videos:{[video.id]:dto(fresh,review)}};
  })
 };
}
