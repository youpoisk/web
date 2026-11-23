import {ApiClient,ApiError} from '../../src/shared/api/client.ts';
export class BackendError extends Error{constructor(kind){super('Extension backend '+kind);this.kind=kind;}}
/** Account-scoped online transport with durable exact-command replay. No token DTOs. */
export function createBackend({session,storage,origin,fetch,crypto=globalThis.crypto}){
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
 async function durable(operation,target,intent,scope,bodyFactory){
  const slot=`yp-operation-v1:${scope.owner}:${operation}:${target}`,fingerprint=JSON.stringify(intent);
  let pending=await storage.read(slot);
  if(pending){
   if(pending.version!==1||pending.owner!==scope.owner||pending.epoch!==scope.epoch||pending.operation!==operation||pending.target!==target||pending.fingerprint!==fingerprint||pending.state!=='pending')throw new BackendError('reconcile_required');
  }else{
   const body=await bodyFactory();const anchor=await request('issueOfflineLease',{},scope);
   pending={version:1,owner:scope.owner,epoch:scope.epoch,operation,target,fingerprint,body,lease:anchor.lease,key:crypto.randomUUID(),state:'pending'};
   await storage.write(pending,slot);
  }
  const live=await actor();if(live.owner!==scope.owner||live.epoch!==scope.epoch)throw new BackendError('stale');
  try{
   const options={body:pending.body,header:{'Idempotency-Key':pending.key,'X-Offline-Lease':pending.lease},...(operation==='addObservedVideo'?{}:{path:{id:target}})};
   const result=await request(operation,options,scope);
   const value=result.state??result.review;
   await storage.commit([[`yp-canonical-v2:${scope.owner}:${result.kind}:${result.target_id}`,{version:2,owner:scope.owner,kind:result.kind,target:result.target_id,revision:value.revision,value}],[slot,null]]);return result;
  }catch(error){
   if(error instanceof ApiError&&error.kind==='http'&&[409,410,422].includes(error.status)){await storage.write({...pending,state:'conflict'},slot);throw new BackendError('reconcile_required');}
   throw error;
  }
 }
 async function card(youtubeId,scope){try{const video=await request('getVideoCardByYoutube',{path:{youtube_id:youtubeId}},scope);if(video.youtube_video_id!==youtubeId)throw new BackendError('protocol');return video;}catch(error){if(error instanceof ApiError&&error.status===404)return null;throw error;}}
 async function check(scope){await session.authorize(async(_,live)=>{if(live.owner!==scope.owner||live.epoch!==scope.epoch)throw new BackendError('stale');});}
 function dto(video,review=null){
  if(!video.my_state)throw new BackendError('protocol');
  const own=video.my_state;
  return {id:video.youtube_video_id,title:video.title??'Видео YouTube',url:video.url,preview:video.preview_url,channel:video.channel?.name??'',channelUrl:video.channel?.url??'',rating:own.rating,later:own.later,mark:own.mark??null,review:review?.text??null,hasReview:video.has_review??(review?.text!==null&&review?.text!==undefined),createdAt:video.listed_at??new Date(0).toISOString(),updatedAt:video.listed_at??new Date(0).toISOString()};
 }
 return {
  recover:after=>exclusive(async()=>{
   const scope=await actor(),prefix=`yp-operation-v1:${scope.owner}:`;
   const page=await storage.entries(prefix,{after:after??null,limit:12});let sent=0,blocked=0;
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
    try{await durable(operation,target,intent,scope,async()=>{throw new BackendError('reconcile_required');});sent++;}catch(error){if(error instanceof ApiError&&error.kind==='invalid_input'){blocked++;continue;}throw error;}
   }
   await check(scope);return {sent,blocked,next:page.next};
  }),
  current:youtubeId=>exclusive(async()=>{const scope=await actor(),video=await card(youtubeId,scope);if(!video){await check(scope);return {videos:{}};}const {review}=await request('getVideoReview',{path:{id:video.id}},scope);await check(scope);return {videos:{[youtubeId]:dto(video,review)}};}),
  library:after=>exclusive(async()=>{const scope=await actor(),page=await request('listWatchlist',{query:{limit:12,...(after?{after}:{})}},scope);await check(scope);return {videos:Object.fromEntries(page.items.map(video=>[video.youtube_video_id,dto(video)])),next:page.next_cursor??null};}),
  update:(video,patch)=>exclusive(async()=>{
   const scope=await actor();
   if(await storage.read(`yp-operation-v1:${scope.owner}:addObservedVideo:${video.id}`))await durable('addObservedVideo',video.id,{id:video.id},scope,async()=>{throw new BackendError('reconcile_required');});
   let resolved=await card(video.id,scope);
   if(!resolved){
    await durable('addObservedVideo',video.id,{id:video.id},scope,async()=>({youtube_video_id:video.id,title:video.title,expected_revision:0}));
    resolved=await card(video.id,scope);if(!resolved)throw new BackendError('protocol');
   }
   const change={};for(const key of ['rating','later','mark'])if(Object.hasOwn(patch,key))change[key]=patch[key];
   if(Object.hasOwn(patch,'review')&&Object.keys(change).length)throw new BackendError('separate_operations_required');
   if(Object.keys(change).length){await durable('patchVideoState',resolved.id,change,scope,async()=>{const {state}=await request('getVideoState',{path:{id:resolved.id}},scope);return {expected_revision:state.revision,...change};});}
   if(Object.hasOwn(patch,'review')){await durable('putVideoReview',resolved.id,{text:patch.review},scope,async()=>{const {review}=await request('getVideoReview',{path:{id:resolved.id}},scope);return {expected_revision:review.revision,text:patch.review};});}
   const fresh=await card(video.id,scope),{review}=await request('getVideoReview',{path:{id:resolved.id}},scope);await check(scope);return {videos:{[video.id]:dto(fresh,review)}};
  })
 };
}
