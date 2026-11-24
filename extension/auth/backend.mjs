import {createPull} from './sync.mjs';
import * as schemas from '../../src/shared/api/validators.js';
import {ApiClient,ApiError} from '../../src/shared/api/client.ts';
export class BackendError extends Error{constructor(kind){super('Extension backend '+kind);this.kind=kind;}}
/** Account-scoped online transport with durable exact-command replay. No token DTOs. */
export function createBackend({session,storage,origin,fetch,crypto=globalThis.crypto,now=Date.now,random=Math.random}){
 let tail=Promise.resolve();
 const exclusive=fn=>{const work=tail.then(fn);tail=work.catch(()=>{});return work;};
 const pull=createPull({storage,request,check,now});
 async function request(operation,options={},expected){
  const result=await session.authorize(async(token,scope)=>{
   if(expected&&(scope.owner!==expected.owner||scope.epoch!==expected.epoch))throw new BackendError('stale');
   const client=new ApiClient({baseUrl:origin,fetch,session:()=>({state:'authenticated',owner:scope.owner,epoch:scope.epoch,accessToken:token})});
   try{return {status:200,data:await client.request(operation,options)};}catch(error){if(error instanceof ApiError&&error.status===401)return {status:401};throw error;}
  });
  if(options.path?.id&&result.data?.target_id!==undefined&&result.data.target_id!==options.path.id)throw new BackendError('protocol');
  return result.data;
 }
 async function channelSnapshot(videoId,scope){
  const video=await card(videoId,scope),channel=video?.channel;
  if(!channel?.identity_verified||!channel.association_verified||!/^UC[\w-]{22}$/.test(channel.youtube_channel_id??''))throw new BackendError('channel_unconfirmed');
  const confirmed=await request('getChannelCard',{path:{id:channel.id}},scope);if(confirmed.id!==channel.id||!confirmed.identity_verified||confirmed.youtube_channel_id!==channel.youtube_channel_id)throw new BackendError('channel_unconfirmed');
  const {state}=await request('getChannelRating',{path:{id:channel.id}},scope);await check(scope);return {channelId:channel.id,uc:channel.youtube_channel_id,revision:state.revision,rating:state.rating};
 }
 async function actor(){let state;try{state=await session.status();}catch(error){if(!session.peek||!transient(error))throw error;state=await session.peek();}if(state.state!=='authenticated')throw new BackendError('authentication');return state;}
 async function durable(operation,target,intent,scope,bodyFactory,stage=null,fixedKey=null){
  const cooldown=await storage.read(`yp-rate-limit-v1:${scope.owner}`);if(cooldown?.until>now())throw new BackendError('retry_later');
  const slot=`yp-operation-v1:${scope.owner}:${operation}:${target}`,fingerprint=JSON.stringify(intent);
  let pending=await storage.read(slot);
  if(pending){
   if(fixedKey&&pending.key!==fixedKey)throw new BackendError('reconcile_required');
   if(typeof pending.key!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(pending.key)||typeof pending.lease!=='string'||!pending.lease.length||pending.lease.length>16384)throw new BackendError('reconcile_required');
   if(!schemas[schemas.contract[operation].request](pending.body)||pending.fingerprint!==JSON.stringify(operation==='addObservedVideo'?{id:pending.body.youtube_video_id}:Object.fromEntries(Object.entries(pending.body).filter(([key])=>key!=='expected_revision'))))throw new BackendError('reconcile_required');
   if(pending.version!==1||pending.owner!==scope.owner||pending.epoch!==scope.epoch||pending.operation!==operation||pending.target!==target||pending.fingerprint!==fingerprint||pending.state!=='pending')throw new BackendError('reconcile_required');
  }else{
   if(typeof bodyFactory!=='function')throw new BackendError('reconcile_required');
   const body=await bodyFactory();const anchor=await request('issueOfflineLease',{},scope);
   pending={version:1,owner:scope.owner,epoch:scope.epoch,operation,target,fingerprint,body,lease:anchor.lease,key:fixedKey??crypto.randomUUID(),state:'pending',createdAt:now(),attempts:0,nextAttemptAt:0};
   if(stage){stage.row[stage.field??'commandKey']=pending.key;await storage.commit([[slot,pending],[stage.slot,stage.row]]);}else await storage.write(pending,slot);
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
   await storage.commit([[`yp-canonical-v2:${scope.owner}:${result.kind}:${result.target_id}`,{version:2,owner:scope.owner,kind:result.kind,target:result.target_id,revision:value.revision,value,changeSeq:result.change_seq}],[slot,null],[`yp-receipt-v1:${scope.owner}:${pending.key}`,{revision:value.revision,target:result.target_id,kind:result.kind}]]);return result;
  }catch(error){
   if(error instanceof ApiError&&error.kind==='http'){
    if(error.status===429||error.status>=500){const until=Math.max(pending.nextAttemptAt,now()+(error.retryAfterSeconds??0)*1000);if(error.status===429)await storage.commit([[slot,{...pending,nextAttemptAt:until}],[`yp-rate-limit-v1:${scope.owner}`,{until}]]);else await storage.write({...pending,nextAttemptAt:until},slot);}
    else if(error.status!==401){await storage.write({...pending,state:[409,410,422].includes(error.status)?'conflict':'rejected',errorStatus:error.status,errorCode:error.code},slot);throw new BackendError(error.status===422&&['review_links_not_allowed','review_abusive_language'].includes(error.code)?error.code:'reconcile_required');}
   }
   throw error;
  }
 }
 async function card(youtubeId,scope){try{const video=await request('getVideoCardByYoutube',{path:{youtube_id:youtubeId}},scope);if(video.youtube_video_id!==youtubeId)throw new BackendError('protocol');return video;}catch(error){if(error instanceof ApiError&&error.status===404)return null;throw error;}}
 async function check(scope){if(session.peek){const live=await session.peek();if(live.state!=='authenticated'||live.owner!==scope.owner||live.epoch!==scope.epoch)throw new BackendError('stale');return;}await session.authorize(async(_,live)=>{if(live.owner!==scope.owner||live.epoch!==scope.epoch)throw new BackendError('stale');});}


 function observedBody(video,revision=0){const obs=video.observation,body={youtube_video_id:video.id,title:video.title,expected_revision:revision,...(obs?{hashtags:[...obs.tags],hashtags_observation_status:obs.status}:{})};if(obs)while(new TextEncoder().encode(JSON.stringify(body)).length>8192&&body.hashtags.length){body.hashtags.pop();body.hashtags_observation_status='partial';}return body;}
 function transient(error){return ['network','timeout','retry_later'].includes(error.kind)||error.status>=500||error.status===429;}
 async function cacheRecord(prefix,indexKey,id,value,limit){
  const slot=prefix+id,stored=await storage.read(indexKey),index=stored??[];if(!Array.isArray(index)||index.some(key=>typeof key!=='string'||!key.startsWith(prefix)))throw new BackendError('storage');
  const keys=[...new Set([slot,...index])],evicted=keys.slice(limit);await storage.commit([[slot,value],[indexKey,keys.slice(0,limit)]],evicted);
 }
 async function snapshot(video,review,scope){await cacheRecord(`yp-snapshot-v1:${scope.owner}:`,`yp-snapshot-index-v2:${scope.owner}`,video.youtube_video_id,{video,review},200);}
 async function stageIntent(video,patch,scope){
  const review=Object.hasOwn(patch,'review');if(review&&Object.keys(patch).length!==1)throw new BackendError('separate_operations_required');
  const slot=`yp-intent-v1:${scope.owner}:${video.id}:${review?'review':'state'}`,existing=await storage.read(slot);
  if(existing&&existing.epoch!==scope.epoch)throw new BackendError('reconcile_required');
  const cached=await storage.read(`yp-snapshot-v1:${scope.owner}:${video.id}`),target=cached?.video.id;
  const operation=review?'putVideoReview':'patchVideoState',pending=target?await storage.read(`yp-operation-v1:${scope.owner}:${operation}:${target}`):null;
  const canonical=target?await pull.read(scope,review?'video_review':'video_state',target):null;
  const revisions=[canonical?.revision,review?cached?.review.revision:cached?.video.my_state.revision].filter(Number.isSafeInteger),revision=revisions.length?Math.max(...revisions):null;
  const row={version:1,owner:scope.owner,epoch:scope.epoch,video,patch:{...(existing?.patch??{}),...patch},baseRevision:existing?.baseRevision??revision,createdAt:existing?.createdAt??now(),...(existing?.deferred?{deferred:true}:{}),...(existing?.addKey?{addKey:existing.addKey}:{}),...(existing?.observationOnly?{observationOnly:true,observationRevision:existing.observationRevision}:{}),...(existing?.observationSkipped?{observationSkipped:true}:{}),...(pending?{predecessor:pending.key}:{})};
  if(!review){if(patch.mark==='not_interested')row.patch.later=false;else if(patch.later===true&&row.patch.mark==='not_interested')row.patch.mark=null;}
  // A sent command is immutable. Further clicks replace only the unsent successor.
  if(existing?.commandKey){row.predecessor=existing.commandKey;row.predecessorIntent=JSON.stringify(review?{text:existing.patch.review}:existing.patch);}
  else if(existing?.predecessor&&!row.predecessor){row.predecessor=existing.predecessor;row.predecessorIntent=existing.predecessorIntent;}
  if(pending&&!row.predecessorIntent)row.predecessorIntent=pending.fingerprint;
  await storage.write(row,slot);return {slot,row};
 }
 async function flushIntent(stage,scope){
  const slot=stage.slot,row=await storage.read(slot);if(!row)throw new BackendError('storage');stage.row=row;const isReview=Object.hasOwn(row.patch??{},'review');
  const validPatch=isReview?schemas.putVideoReview_request({expected_revision:0,text:row.patch.review}):schemas.patchVideoState_request({expected_revision:0,...row.patch});
  if(!row.video||!/^[\w-]{11}$/.test(row.video.id)||typeof row.video.title!=='string'||!validPatch||slot!==`yp-intent-v1:${scope.owner}:${row.video.id}:${isReview?'review':'state'}`)throw new BackendError('reconcile_required');
  if(row.owner!==scope.owner||row.epoch!==scope.epoch)throw new BackendError('reconcile_required');
  if(row.commandKey&&await storage.read(`yp-receipt-v1:${scope.owner}:${row.commandKey}`)){await storage.write(null,slot);return false;}
  let resolved=await card(row.video.id,scope);
  const addSlot=`yp-operation-v1:${scope.owner}:addObservedVideo:${row.video.id}`;
  const priorAdd=await storage.read(addSlot);
  const observeExisting=resolved?.my_state?.added===true&&row.video.observation&&row.video.observation.status!=='unknown';
  if(priorAdd||!resolved||(!row.addKey&&!row.observationSkipped&&observeExisting)){
   if(!row.addKey&&!priorAdd&&resolved){row.observationOnly=true;row.observationRevision=resolved.my_state.revision;}
   row.addKey=priorAdd?.key??row.addKey??crypto.randomUUID();const peerSlot=`yp-intent-v1:${scope.owner}:${row.video.id}:${isReview?'state':'review'}`,peer=await storage.read(peerSlot),links=[[slot,row]];
   if(peer?.version===1&&peer.owner===scope.owner&&peer.epoch===scope.epoch&&peer.video?.id===row.video.id)links.push([peerSlot,{...peer,addKey:row.addKey,...(row.observationOnly?{observationOnly:true,observationRevision:row.observationRevision}:{})}]);
   await storage.commit(links);
   try{await durable('addObservedVideo',row.video.id,{id:row.video.id},scope,async()=>observedBody(row.video,row.observationRevision??0),{...stage,field:'addKey'},row.addKey);}
   catch(error){const pending=await storage.read(addSlot);if(!row.observationOnly||error.kind!=='reconcile_required'||pending?.errorStatus!==409)throw error;for(const [,linked]of links){delete linked.addKey;linked.observationSkipped=true;}await storage.commit([...links,[addSlot,null],[`yp-history-v1:${scope.owner}:${crypto.randomUUID()}`,{...pending,resolution:'optional_metadata_conflict'}]]);}
   resolved=await card(row.video.id,scope);
  }
  if(!resolved)throw new BackendError('protocol');
  const review=Object.hasOwn(row.patch,'review');if(!review&&row.addKey&&!row.observationOnly){const added=await storage.read(`yp-receipt-v1:${scope.owner}:${row.addKey}`);if(added?.kind==='video_state'&&added.target===resolved.id)row.baseRevision=added.revision;}
  const operation=review?'putVideoReview':'patchVideoState',pendingSlot=`yp-operation-v1:${scope.owner}:${operation}:${resolved.id}`;
  const predecessor=await storage.read(pendingSlot);
  if(predecessor&&predecessor.key!==row.commandKey){
   if(predecessor.epoch!==scope.epoch||predecessor.state!=='pending')throw new BackendError('reconcile_required');
   await durable(operation,resolved.id,JSON.parse(predecessor.fingerprint),scope,null);
   row.predecessor=predecessor.key;row.predecessorIntent=predecessor.fingerprint;
  }
  if(row.predecessor){const receipt=await storage.read(`yp-receipt-v1:${scope.owner}:${row.predecessor}`);if(!receipt)throw new BackendError('reconcile_required');row.baseRevision=receipt.revision;if(row.predecessorIntent===JSON.stringify(review?{text:row.patch.review}:row.patch)){await storage.write(null,slot);return false;}}
  await durable(operation,resolved.id,review?{text:row.patch.review}:row.patch,scope,async()=>{
   const result=await request(review?'getVideoReview':'getVideoState',{path:{id:resolved.id}},scope),value=result.review??result.state;
   return {expected_revision:row.baseRevision??(row.deferred?0:value.revision),...(review?{text:row.patch.review}:row.patch)};
  },stage);
  await storage.write(null,slot);return true;
 }
 async function flushIntents(scope){
  const cursorKey=`yp-intent-cursor-v1:${scope.owner}`,saved=await storage.read(cursorKey),after=saved?.epoch===scope.epoch?saved.after:null;
  const page=await storage.entries(`yp-intent-v1:${scope.owner}:`,{after:after??null,limit:12});
  let sent=0;for(const [slot,row]of page.items){if(row.version!==1||row.owner!==scope.owner||row.epoch!==scope.epoch)continue;try{if(await flushIntent({slot,row},scope))sent++;}catch(error){if(['reconcile_required','retry_later','review_links_not_allowed','review_abusive_language'].includes(error.kind))continue;throw error;}}
  await storage.write({epoch:scope.epoch,after:page.next},cursorKey);return sent;
 }
 async function conflictRecord(ref,scope){
  const prefix=`yp-operation-v1:${scope.owner}:`;if(typeof ref!=='string'||!ref.startsWith(prefix))throw new BackendError('invalid_reference');
  const row=await storage.read(ref);if(!row||row.owner!==scope.owner||!['patchVideoState','putVideoReview','putChannelRating'].includes(row.operation)||ref!==prefix+row.operation+':'+row.target||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(row.target))throw new BackendError('invalid_reference');
  if(row.state==='pending'&&row.epoch===scope.epoch)throw new BackendError('pending');
  let local=JSON.parse(row.fingerprint);const keys=Object.keys(local),allowed=row.operation==='patchVideoState'?['rating','later','mark']:row.operation==='putChannelRating'?['rating']:['text'];
  if(!schemas[schemas.contract[row.operation].request](row.body)||!keys.length||keys.some(key=>!allowed.includes(key))||keys.some(key=>row.body?.[key]!==local[key]))throw new BackendError('invalid_reference');
  const result=await request(row.operation==='patchVideoState'?'getVideoState':row.operation==='putChannelRating'?'getChannelRating':'getVideoReview',{path:{id:row.target}},scope);
  if(row.operation==='putChannelRating'){const channel=await request('getChannelCard',{path:{id:row.target}},scope);if(channel.id!==row.target)throw new BackendError('protocol');return {row,local,result,value:result.state,video:{title:channel.name??'Канал YouTube'},stageSlot:`yp-channel-transfer-v1:${scope.owner}:${row.target}`,staged:null};}
  const video=await request('getVideoCard',{path:{id:row.target}},scope);if(video.id!==row.target)throw new BackendError('protocol');
  const stageSlot=`yp-intent-v1:${scope.owner}:${video.youtube_video_id}:${row.operation==='putVideoReview'?'review':'state'}`,staged=await storage.read(stageSlot);
  if(staged&&staged.owner===scope.owner&&staged.epoch===scope.epoch){const desired=row.operation==='putVideoReview'?{text:staged.patch.review}:staged.patch;if(schemas[schemas.contract[row.operation].request]({expected_revision:0,...desired}))local=desired;}
  return {row,local,result,value:result.state??result.review,video,stageSlot,staged};
 }
 function dto(video,review=null){
  if(!video.my_state)throw new BackendError('protocol');
  const own=video.my_state;
  return {ratingAverage:video.rating?.average??null,ratingCount:video.rating?.count??0,id:video.youtube_video_id,title:video.title??'Видео YouTube',url:video.url,preview:video.preview_url,channel:video.channel?.name??'',channelUrl:video.channel?.url??'',rating:own.rating,later:own.later,mark:own.mark??null,review:review?.text??null,hasReview:video.has_review??(review?.text!==null&&review?.text!==undefined),createdAt:video.listed_at??new Date(0).toISOString(),updatedAt:video.listed_at??new Date(0).toISOString()};
 }
 async function decorated(video,review,scope,offline=false){
  const view=dto(video,review),state=await pull.read(scope,'video_state',video.id),ownReview=await pull.read(scope,'video_review',video.id);
  if(state&&state.revision>video.my_state.revision){const value=state.value;view.rating=value?.rating??null;view.later=value?.later??false;view.mark=value?.mark??null;}
  if(ownReview&&ownReview.revision>(review?.revision??-1)){view.review=ownReview.value?.text??null;view.hasReview=view.review!==null;}
  for(const kind of ['state','review']){const staged=await storage.read(`yp-intent-v1:${scope.owner}:${video.youtube_video_id}:${kind}`),pending=await storage.read(`yp-operation-v1:${scope.owner}:${kind==='review'?'putVideoReview':'patchVideoState'}:${video.id}`);
   if(pending&&(pending.state!=='pending'||pending.epoch!==scope.epoch))view.conflict=true;
   if(staged&&staged.owner===scope.owner&&staged.epoch===scope.epoch&&staged.video?.id===video.youtube_video_id){const valid=kind==='review'?schemas.putVideoReview_request({expected_revision:0,text:staged.patch?.review}):schemas.patchVideoState_request({expected_revision:0,...staged.patch});if(valid){Object.assign(view,staged.patch);view.pending=true;}}
  }
  if(offline)view.offline=true;return view;
 }
 async function pendingView(youtubeId,scope,offline=false){
  let view=null;for(const kind of ['state','review']){const row=await storage.read(`yp-intent-v1:${scope.owner}:${youtubeId}:${kind}`);if(!row||row.owner!==scope.owner||row.epoch!==scope.epoch||row.video?.id!==youtubeId)continue;
   const valid=kind==='review'?schemas.putVideoReview_request({expected_revision:0,text:row.patch?.review}):schemas.patchVideoState_request({expected_revision:0,...row.patch});if(!valid)continue;
   if(!view){const cached=await storage.read(`yp-snapshot-v1:${scope.owner}:${youtubeId}`);view=cached?await decorated(cached.video,cached.review,scope,offline):{id:youtubeId,title:String(row.video.title??'Видео YouTube').slice(0,250),url:'https://www.youtube.com/watch?v='+youtubeId,preview:'https://i.ytimg.com/vi/'+youtubeId+'/hqdefault.jpg',channel:'',channelUrl:'',rating:null,later:false,mark:null,review:null,createdAt:'',updatedAt:''};}
   Object.assign(view,row.patch);view.pending=true;if(offline)view.offline=true;
  }return view;
 }
 async function pendingPage(scope,after){
  const page=await storage.entries(`yp-intent-v1:${scope.owner}:`,{after:after??null,limit:12}),pendingVideos={};
  for(const [,row]of page.items){if(row?.owner!==scope.owner||row.epoch!==scope.epoch||row.patch?.later!==true||!/^[\w-]{11}$/.test(row.video?.id??''))continue;const view=await pendingView(row.video.id,scope);if(view?.later)pendingVideos[view.id]=view;}
  await check(scope);return {pendingVideos,pendingNext:page.next};
 }
 function importProjection(batch,scope){return {id:batch.id,scope:scope.epoch,account:scope.user?{login:scope.user.login,name:scope.user.name}:null,rows:batch.rows.map((row,index)=>({index,title:row.video?.title??'Некорректная запись',local:row.patch??{},review:row.review??null,server:row.server??null,existing:row.existing??false,blocked:row.blocked??false,error:row.error??null,result:row.result??null,partial:row.result==='conflict'&&!!(row.addedDone||row.stateDone||row.reviewDone)})),choices:batch.choices?JSON.parse(batch.choices):null,next:batch.next,completed:batch.completed??false};}
 async function importBatch(scope,id){if(typeof id!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id))throw new BackendError('invalid_reference');const batch=await storage.read(`yp-import-v1:${scope.owner}:${id}`);if(!batch||batch.owner!==scope.owner||batch.epoch!==scope.epoch||batch.version!==1)throw new BackendError('reconcile_required');return batch;}
 async function applyImportRow(row,scope){
  const marker=key=>storage.read(`yp-receipt-v1:${scope.owner}:${key}`);let target=row.target,revision=row.stateRevision;
  if(!target||revision===0){let receipt=await marker(row.keys.add);if(!receipt){await durable('addObservedVideo',row.video.id,{id:row.video.id},scope,async()=>observedBody(row.video),null,row.keys.add);receipt=await marker(row.keys.add);}if(!receipt)throw new BackendError('protocol');target=receipt.target;revision=receipt.revision;row.addedDone=true;}
  if(Object.keys(row.patch).length){if(!await marker(row.keys.state))await durable('patchVideoState',target,row.patch,scope,async()=>({expected_revision:revision,...row.patch}),null,row.keys.state);row.stateDone=true;}
  if(row.review!==null){if(!await marker(row.keys.review))await durable('putVideoReview',target,{text:row.review},scope,async()=>({expected_revision:row.reviewRevision,text:row.review}),null,row.keys.review);row.reviewDone=true;}
 }
 return {
  channelPreview:videoId=>exclusive(async()=>channelSnapshot(videoId,await actor())),
  channelConfirm:(videoId,expected,rating)=>exclusive(async()=>{const scope=await actor(),current=await channelSnapshot(videoId,scope);if(!expected||JSON.stringify(current)!==JSON.stringify(expected))throw new BackendError('preview_changed');await durable('putChannelRating',current.channelId,{rating},scope,async()=>({expected_revision:current.revision,rating}));}),
  resumePending:()=>exclusive(async()=>{const scope=await actor();return storage.mutateQueue(scope.owner,scope.epoch,'resume');}),
  discardPending:()=>exclusive(async()=>{const scope=await actor();return storage.mutateQueue(scope.owner,scope.epoch,'discard');}),
  pendingLibrary:after=>exclusive(async()=>{const scope=await actor();return {videos:{},...await pendingPage(scope,after)};}),
  previewImport:(inputs,next=null)=>exclusive(async()=>{
   const scope=await actor();if(!Array.isArray(inputs)||inputs.length>12)throw new BackendError('input');const rows=[];
   for(const input of inputs){if(input.error){rows.push({error:input.error});continue;}const row={video:input.video,patch:{},review:null,keys:{add:crypto.randomUUID(),state:crypto.randomUUID(),review:crypto.randomUUID()}};
    if(input.rating!==null&&input.rating!==undefined)row.patch.rating=input.rating;if(input.later===true)row.patch.later=true;if(['watched','not_interested'].includes(input.mark))row.patch.mark=input.mark;if(typeof input.review==='string'&&input.review.trim())row.review=input.review.trim().normalize('NFC');
    if(row.patch.mark==='not_interested')row.patch.later=false;
    if(!Object.keys(row.patch).length&&row.review===null){rows.push({...row,error:'Нет оценки, рецензии или отметки для импорта'});continue;}
    if(Object.keys(row.patch).length&&!schemas.patchVideoState_request({expected_revision:0,...row.patch})||row.review!==null&&!schemas.putVideoReview_request({expected_revision:0,text:row.review})){rows.push({...row,error:'Значения не соответствуют правилам сервера'});continue;}
    const video=await card(row.video.id,scope);row.target=video?.id??null;row.stateRevision=video?.my_state.revision??0;const review=video?(await request('getVideoReview',{path:{id:video.id}},scope)).review:{revision:0,text:null};row.reviewRevision=review.revision;row.server=video?{rating:video.my_state.rating,later:video.my_state.later,mark:video.my_state.mark??null,review:review.text}:null;row.existing=row.stateRevision>0||review.revision>0;
    row.blocked=!!(await storage.read(`yp-intent-v1:${scope.owner}:${row.video.id}:state`)||await storage.read(`yp-intent-v1:${scope.owner}:${row.video.id}:review`)||row.target&&(await storage.read(`yp-operation-v1:${scope.owner}:patchVideoState:${row.target}`)||await storage.read(`yp-operation-v1:${scope.owner}:putVideoReview:${row.target}`)));
    rows.push(row);
   }
   const batch={version:1,id:crypto.randomUUID(),owner:scope.owner,epoch:scope.epoch,rows,next,createdAt:now()};await check(scope);await storage.commit([[`yp-import-v1:${scope.owner}:${batch.id}`,batch],[`yp-import-last-v1:${scope.owner}`,batch.id]]);return importProjection(batch,scope);
  }),
  importStatus:id=>exclusive(async()=>{const scope=await actor(),latest=id??await storage.read(`yp-import-last-v1:${scope.owner}`);if(!latest)return {scope:scope.epoch,rows:[]};return importProjection(await importBatch(scope,latest),scope);}),
  commitImport:(id,choices)=>exclusive(async()=>{
   const scope=await actor(),batch=await importBatch(scope,id);if(!Array.isArray(choices)||choices.length!==batch.rows.length||choices.some(value=>!['server','local'].includes(value)))throw new BackendError('input');const fingerprint=JSON.stringify(choices);if(batch.choices&&batch.choices!==fingerprint)throw new BackendError('reconcile_required');batch.choices=fingerprint;const slot=`yp-import-v1:${scope.owner}:${id}`;await storage.write(batch,slot);
   for(let index=0;index<batch.rows.length;index++){const row=batch.rows[index];if(row.result)continue;if(row.error||row.blocked||choices[index]==='server'){row.result=row.error?'invalid':row.blocked?'blocked':'skipped';await storage.write(batch,slot);continue;}
    try{await applyImportRow(row,scope);row.result='imported';}catch(error){if(error.kind!=='reconcile_required')throw error;row.result='conflict';}
    await check(scope);await storage.write(batch,slot);
   }
   batch.completed=true;await storage.write(batch,slot);return importProjection(batch,scope);
  }),
  pull:()=>exclusive(async()=>{const scope=await actor();return pull.step(scope);}),
  conflicts:after=>exclusive(async()=>{
   const scope=await actor(),page=await storage.entries(`yp-operation-v1:${scope.owner}:`,{after:after??null,limit:12}),items=[];
   for(const [ref,row]of page.items){if(row.state==='pending'&&row.epoch===scope.epoch)continue;try{const {local,value,video}=await conflictRecord(ref,scope);items.push({ref,operation:row.operation,title:video.title,local,server:value,status:row.errorStatus??null,expected:{revision:value.revision,key:row.key,intent:JSON.stringify(local)}});}catch(error){if(error.kind==='invalid_reference')continue;throw error;}}
   await check(scope);return {items,next:page.next};
  }),
  resolve:(ref,choice,expected)=>exclusive(async()=>{
   const scope=await actor();if(!['server','local'].includes(choice))throw new BackendError('invalid_reference');
   const {row,local,result,value,stageSlot,staged}=await conflictRecord(ref,scope),archive=`yp-history-v1:${scope.owner}:${crypto.randomUUID()}`;
   if(!expected||expected.revision!==value.revision||expected.key!==row.key||expected.intent!==JSON.stringify(local))throw new BackendError('preview_changed');
   if(choice==='server'){
    await check(scope);await storage.commit([[archive,{...row,staged,resolution:'server'}],[`yp-canonical-v2:${scope.owner}:${result.kind}:${row.target}`,{version:2,owner:scope.owner,kind:result.kind,target:row.target,revision:value.revision,value}],[ref,null],[stageSlot,null]]);return;
   }
   const anchor=await request('issueOfflineLease',{},scope);
   const pending={version:1,owner:scope.owner,epoch:scope.epoch,operation:row.operation,target:row.target,fingerprint:JSON.stringify(local),body:{expected_revision:value.revision,...local},key:crypto.randomUUID(),lease:anchor.lease,state:'pending',createdAt:now(),attempts:0,nextAttemptAt:0};
   await check(scope);await storage.commit([[archive,{...row,staged,resolution:'local'}],[ref,pending],[stageSlot,null]]);
   await durable(row.operation,row.target,local,scope,null);
  }),
  queueStatus:()=>exclusive(async()=>{
   const scope=await actor(),prefix=`yp-operation-v1:${scope.owner}:`;let after=null,pending=0,blocked=0,retained=0,nextAttemptAt=null,pages=0;
   do{const page=await storage.entries(prefix,{after,limit:12});for(const [,row]of page.items){if(row.owner!==scope.owner||row.epoch!==scope.epoch||row.state!=='pending'){blocked++;if(row.owner===scope.owner&&row.epoch!==scope.epoch)retained++;}else{pending++;const due=row.nextAttemptAt??0;if(Number.isFinite(due))nextAttemptAt=nextAttemptAt===null?due:Math.min(nextAttemptAt,due);}}after=page.next;}while(after&&++pages<10);
   const intents=await storage.entries(`yp-intent-v1:${scope.owner}:`,{limit:12});for(const [,row]of intents.items){if(row.epoch===scope.epoch)pending++;else{blocked++;retained++;}}
   await check(scope);return {pending,blocked,retained,nextAttemptAt,more:!!after||!!intents.next,sync:await pull.status(scope)};
  }),
  recover:after=>exclusive(async()=>{
   const scope=await actor(),prefix=`yp-operation-v1:${scope.owner}:`,cursorKey=`yp-recovery-v1:${scope.owner}`;
   const saved=after===undefined?await storage.read(cursorKey):null;
   const cursor=after??(saved?.epoch===scope.epoch?saved.after:null);
   const page=await storage.entries(prefix,{after:cursor??null,limit:12});let sent=0,blocked=0,deferred=0;
   for(const [slot,pending] of page.items){
    await check(scope);
    const operation=pending?.operation,target=pending?.target;
    const supported=['addObservedVideo','patchVideoState','putVideoReview','putChannelRating'].includes(operation);
    const validTarget=typeof target==='string'&&(operation==='addObservedVideo'?/^[\w-]{11}$/.test(target):/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(target));
    if(!supported||!validTarget||slot!==prefix+operation+':'+target||pending.version!==1||pending.owner!==scope.owner||pending.epoch!==scope.epoch||pending.state!=='pending'){blocked++;continue;}
    let intent;try{intent=JSON.parse(pending.fingerprint);}catch{blocked++;continue;}
    if(JSON.stringify(intent)!==pending.fingerprint||!intent||typeof intent!=='object'||Array.isArray(intent)){blocked++;continue;}
    const body=pending.body;
    const revisionOK=body&&Number.isSafeInteger(body.expected_revision)&&body.expected_revision>=0;
    const intentKeys=Object.keys(intent),allowed=operation==='patchVideoState'?['rating','later','mark']:operation==='putVideoReview'?['text']:operation==='putChannelRating'?['rating']:['id'];
    let bound=revisionOK&&intentKeys.length>0&&intentKeys.every(key=>allowed.includes(key));
    if(operation==='addObservedVideo')bound=bound&&intentKeys.length===1&&intent.id===target&&body.youtube_video_id===target&&typeof body.title==='string'&&Object.keys(body).every(key=>['youtube_video_id','title','expected_revision','hashtags','hashtags_observation_status'].includes(key));
    else bound=bound&&Object.keys(body).length===intentKeys.length+1&&intentKeys.every(key=>Object.hasOwn(body,key)&&body[key]===intent[key]);
    const envelope=typeof pending.key==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(pending.key)&&typeof pending.lease==='string'&&pending.lease.length>0&&pending.lease.length<=16384;
    if(!bound||!envelope){blocked++;continue;}
    try{await durable(operation,target,intent,scope,null);sent++;}catch(error){if(error instanceof ApiError&&error.kind==='invalid_input'){await storage.write({...pending,state:'invalid'},slot);blocked++;continue;}if(error.kind==='retry_later'){deferred++;continue;}if(error.kind==='reconcile_required'){blocked++;continue;}throw error;}
   }
   await check(scope);await storage.write({epoch:scope.epoch,after:page.next},cursorKey);sent+=await flushIntents(scope);return {sent,blocked,...(deferred?{deferred}:{}),next:page.next};
  }),
  current:youtubeId=>exclusive(async()=>{
   const scope=await actor();try{const video=await card(youtubeId,scope);if(!video){await check(scope);const pending=await pendingView(youtubeId,scope);return {videos:pending?{[youtubeId]:pending}:{}};}const {review}=await request('getVideoReview',{path:{id:video.id}},scope);await check(scope);await snapshot(video,review,scope);return {videos:{[youtubeId]:await decorated(video,review,scope)}};}
   catch(error){if(!transient(error))throw error;await check(scope);const cached=await storage.read(`yp-snapshot-v1:${scope.owner}:${youtubeId}`);const view=cached?await decorated(cached.video,cached.review,scope,true):await pendingView(youtubeId,scope,true);return {offline:true,videos:view?{[youtubeId]:view}:{}};}
  }),
  library:after=>exclusive(async()=>{
   const scope=await actor(),slot=`yp-library-page-v2:${scope.owner}:${after??'first'}`;let page,offline=false,cacheMiss=false;
   try{page=await request('listWatchlist',{query:{limit:12,...(after?{after}:{})}},scope);await check(scope);await cacheRecord(`yp-library-page-v2:${scope.owner}:`,`yp-library-index-v2:${scope.owner}`,after??'first',page,10);}catch(error){if(!transient(error))throw error;await check(scope);page=await storage.read(slot);offline=true;if(!page){page={items:[],next_cursor:null};cacheMiss=true;}}
   const videos={};for(const video of page.items){const view=await decorated(video,null,scope,offline);if(view.later)videos[video.youtube_video_id]=view;}
   await check(scope);return {videos,next:page.next_cursor??null,...await pendingPage(scope),...(offline?{offline:true}:{}),...(cacheMiss?{cacheMiss:true}:{})};
  }),
  update:(video,patch)=>exclusive(async()=>{
   const scope=await actor(),stage=await stageIntent(video,patch,scope);
   try{await flushIntent(stage,scope);}catch(error){
    if(!transient(error)&&error.kind!=='reconcile_required')throw error;
    stage.row.deferred=true;await storage.write(stage.row,stage.slot);
    await check(scope);const saved=await storage.read(`yp-snapshot-v1:${scope.owner}:${video.id}`);
    const base=saved?dto(saved.video,saved.review):{...video,rating:null,later:false,review:null,createdAt:'',updatedAt:''};
    return {queued:true,videos:{[video.id]:{...base,...patch,pending:true}}};
   }
   const fresh=await card(video.id,scope),{review}=await request('getVideoReview',{path:{id:fresh.id}},scope);await check(scope);await snapshot(fresh,review,scope);return {videos:{[video.id]:dto(fresh,review)}};
  })
 };
}
