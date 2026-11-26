import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackend} from '../auth/backend.mjs';
const owner='00000000-0000-4000-8000-000000000001',id='00000000-0000-4000-8000-000000000002',epoch='00000000-0000-4000-8000-000000000003',yt='p0iTgHMEoi4';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function fixture(){
 let state={revision:1,rating:null,added:true,later:false},review={revision:4,text:'Existing review'},exists=true,lose=false,failClear=false,who=owner,scope=epoch,seq=1,switchAt=0,authorizations=0,badReviewTarget=false,clock=1000000,failStatus=0,failCode='rate_limited',retryAfter=null,offline=false,afterReviewHook=null,addRace=false,channelProof=false,channelRating={revision:2,rating:3};
 const db=new Map(),receipts=new Map(),writes=[];
 const storage={async mutateQueue(owner,epoch,mode){let count=0;for(const [key,value]of db){if(!value||!['yp-operation-v1:'+owner+':','yp-intent-v1:'+owner+':'].some(prefix=>key.startsWith(prefix)))continue;if(mode==='discard'){db.delete(key);count++;}else if(value.epoch!==epoch){db.set(key,{...value,epoch});count++;}}return count},async entries(prefix,{after=null,limit=12}={}){const rows=[...db].filter(([k,v])=>k.startsWith(prefix)&&v&&(!after||k>after)).sort(([a],[b])=>a.localeCompare(b));return {items:structuredClone(rows.slice(0,limit)),next:rows.length>limit?rows[limit-1][0]:null};},async commit(entries,removals=[]){if(failClear&&entries.some(([key])=>key.startsWith('yp-canonical-v2:'))){failClear=false;throw Error('disk');}for(const key of removals)db.delete(key);for(const [key,value]of entries)db.set(key,structuredClone(value));},async read(key){return structuredClone(db.get(key)??null)},async write(value,key){if(value===null&&failClear){failClear=false;throw Error('disk');}db.set(key,structuredClone(value));}};
 const session={async status(){return {state:'authenticated',owner:who,epoch:scope}},async authorize(fn){if(++authorizations===switchAt)who='00000000-0000-4000-8000-000000000005';return fn('opaque',{owner:who,epoch:scope})}};
 const card=()=>({id,youtube_video_id:yt,title:'Real video',duration_seconds:null,availability:'unknown',url:'https://www.youtube.com/watch?v='+yt,preview_url:'https://i.ytimg.com/vi/'+yt+'/hqdefault.jpg',hashtags:[],hashtags_observation_status:'unknown',channel:channelProof?{id:owner,name:'Confirmed',youtube_channel_id:'UCabcdefghijklmnopqrstuv',url:'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv',identity_verified:true,association_verified:true}:null,rating:{count:0,average:null},my_state:state});
 const result=()=>({kind:'video_state',target_id:id,state,change_seq:seq});
 async function fetch(url,init){
  if(offline)throw Error('offline');
  const path=new URL(url).pathname;
  if(path==='/v1/me/content-policy')return json({revision:1,excluded_terms:['nude yoga']});
  if(path==='/v1/channels/'+owner)return json({id:owner,name:'Confirmed',youtube_channel_id:'UCabcdefghijklmnopqrstuv',url:'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv',identity_verified:true,rating:{count:0,average:null}});
  if(path==='/v1/me/channels/'+owner+'/rating'&&init.method==='GET')return json({kind:'channel_state',target_id:owner,state:channelRating,change_seq:null});
  if(path==='/v1/videos/'+id)return json(card());
  if(path==='/v1/me/sync/snapshots')return json({id:'00000000-0000-4000-8000-000000000006',pages:1,cut_seq:seq,cut_cursor:'unit-cut'});
  if(path.startsWith('/v1/me/sync/snapshots/'))return json({items:[{kind:'video_state',target_id:id,revision:state.revision,operation:'upsert',value:state}],next_page:null,cut_seq:seq,cut_cursor:'unit-cut'});
  if(path==='/v1/me/sync')return json({items:[],cursor:'unit-cut',more:false});
  if(path.includes('/by-youtube/'))return exists?json(card()):json({code:'not_found',message:'Missing',request_id:'request',field_errors:{}},404);
  if(path.endsWith('/offline-lease'))return json({lease:'original-signed-lease',valid_for_seconds:604800});
  if(init.method==='GET'&&path.endsWith('/state'))return json(result());
  if(init.method==='GET'&&path.endsWith('/review'))return json({kind:'video_review',target_id:badReviewTarget?owner:id,review,change_seq:null});
  if(path.endsWith('/watchlist'))return json({items:state.later?[{...card(),listed_at:'2026-11-22T00:00:00Z',has_review:true}]:[]});
  const key=init.headers.get('Idempotency-Key');writes.push({key,lease:init.headers.get('X-Offline-Lease'),body:JSON.parse(init.body),path});
  if(failStatus){const response=json({code:failCode,message:'Retry',request_id:'request',field_errors:{}},failStatus);if(retryAfter!==null)response.headers.set('Retry-After',String(retryAfter));return response;}
  if(path==='/v1/me/videos'&&addRace){addRace=false;state={...state,revision:state.revision+1,rating:10};return json({code:'revision_conflict',message:'Conflict',request_id:'request',field_errors:{}},409);}
  if(receipts.has(key))return json(receipts.get(key));
  const body=JSON.parse(init.body);let response;
  if(path.endsWith('/rating')){if(body.expected_revision!==channelRating.revision)return json({code:'revision_conflict',message:'Conflict',request_id:'request',field_errors:{}},409);channelRating={rating:body.rating,revision:channelRating.revision+1};response={kind:'channel_state',target_id:owner,state:channelRating,change_seq:++seq};}
  else if(path.endsWith('/review')){if(body.expected_revision!==review.revision)return json({code:'revision_conflict',message:'Conflict',request_id:'request',field_errors:{}},409);review={revision:review.revision+1,text:body.text};response={kind:'video_review',target_id:id,review,change_seq:++seq};}
  else if(path.endsWith('/state')){if(body.expected_revision!==state.revision)return json({code:'revision_conflict',message:'Conflict',request_id:'request',field_errors:{}},409);const {expected_revision,...patch}=body;state={...state,...patch,revision:state.revision+1};if(state.mark===null)delete state.mark;response=result();}
  else{exists=true;response=result();}
  if(path.endsWith('/review')&&afterReviewHook){const hook=afterReviewHook;afterReviewHook=null;hook();}receipts.set(key,structuredClone(response));if(lose){lose=false;throw Error('lost response');}return json(response);
 }
 const create=()=>createBackend({origin:'http://127.0.0.1:18080',session,storage,fetch,now:()=>clock,random:()=>1});
 return {create,storage,db,writes,confirmChannel(){channelProof=true},serverChannel(patch){channelRating={...channelRating,...patch}},raceAdd(){addRace=true},serverReview(patch){review={...review,...patch}},afterReview(fn){afterReviewHook=fn},offline(value=true){offline=value},serverState(patch){state={...state,...patch}},advance(ms=3600000){clock+=ms},failHTTP(status,seconds=null,code='rate_limited'){failStatus=status;retryAfter=seconds;failCode=code},badReview(){badReviewTarget=true},switchOnAuthorize(n){switchAt=n},video:{id:yt,title:'Real video'},missing(){exists=false},lose(){lose=true},failClear(){failClear=true},switchEpoch(){scope='00000000-0000-4000-8000-000000000004'},switchOwner(){who='00000000-0000-4000-8000-000000000005'}};
}
test('server state and review use independent revisions, preserve null/false and never expose auth',async()=>{
 const f=fixture(),b=f.create();assert.equal((await b.current(yt)).videos[yt].review,'Existing review');await b.update(f.video,{rating:8});await b.update(f.video,{later:false});const saved=await b.update(f.video,{review:'Edited review'});assert.equal(saved.videos[yt].rating,8);assert.equal(saved.videos[yt].review,'Edited review');assert.equal(f.writes[0].body.expected_revision,1);assert.equal(f.writes[2].body.expected_revision,4);await b.update(f.video,{rating:null});assert.equal(f.writes.at(-1).body.rating,null);await b.update(f.video,{later:true});assert.equal((await b.library()).videos[yt].hasReview,true);assert.equal(JSON.stringify(saved).includes('opaque'),false);
});
test('lost state response and worker restart replay original key/body/lease without double commit',async()=>{
 const f=fixture();f.lose();assert.equal((await f.create().update(f.video,{rating:9})).queued,true);assert.ok([...f.db.values()].some(Boolean));f.advance();await f.create().update(f.video,{rating:9});assert.deepEqual(f.writes[0],f.writes[1]);assert.equal((await f.create().current(yt)).videos[yt].rating,9);assert.equal([...f.db.entries()].filter(([key,value])=>key.startsWith('yp-operation-v1:')&&value).length,0);
});
test('lost storage acknowledgement replays receipt, different intent or epoch requires reconciliation',async()=>{
 const f=fixture();f.failClear();await assert.rejects(f.create().update(f.video,{later:true}));assert.equal((await f.create().update(f.video,{later:false})).queued,true);f.switchEpoch();await assert.rejects(f.create().update(f.video,{later:true}),e=>e.kind==='reconcile_required');assert.equal(f.writes.length,1);
});
test('unknown video add is durable and replayed even when the catalog insert already committed',async()=>{
 const f=fixture();f.missing();f.lose();assert.equal((await f.create().update(f.video,{rating:7})).queued,true);f.advance();await f.create().update(f.video,{rating:7});assert.equal(f.writes[0].path,'/v1/me/videos');assert.deepEqual(f.writes[0],f.writes[1]);assert.equal([...f.db.entries()].filter(([key,value])=>key.startsWith('yp-operation-v1:')&&value).length,0);
});

test('scope switch before write authorization cannot send an old owner command',async()=>{
 const f=fixture();f.switchOnAuthorize(4);await assert.rejects(f.create().update(f.video,{rating:9}),e=>e.kind==='stale');assert.equal(f.writes.length,0);assert.ok([...f.db.values()].some(Boolean));
});
test('scope switch between card and review or before final DTO cannot leak mixed data',async()=>{
 for(const point of [2,3]){const f=fixture();f.switchOnAuthorize(point);await assert.rejects(f.create().current(f.video.id),e=>e.kind==='stale');}
 const f=fixture();f.switchOnAuthorize(2);await assert.rejects(f.create().library(),e=>e.kind==='stale');
});

test('schema-valid response for another review target is rejected before producing a DTO',async()=>{const f=fixture();f.badReview();await assert.rejects(f.create().current(f.video.id),e=>e.kind==='protocol');assert.equal(f.writes.length,0);});

test('restart recovery enumerates and replays the exact durable command without another user click',async()=>{
 const f=fixture();f.lose();assert.equal((await f.create().update(f.video,{rating:9})).queued,true);f.advance();const result=await f.create().recover();assert.deepEqual(result,{sent:1,blocked:0,next:null});assert.deepEqual(f.writes[0],f.writes[1]);assert.equal((await f.create().current(yt)).videos[yt].rating,9);assert.equal((await f.create().recover()).sent,0);
});
test('recovery retains other accounts, old epochs and corrupt records without sending them',async()=>{
 const f=fixture();f.lose();assert.equal((await f.create().update(f.video,{later:true})).queued,true);f.switchEpoch();assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,1);f.switchOwner();assert.deepEqual(await f.create().recover(),{sent:0,blocked:0,next:null});assert.equal(f.writes.length,1);assert.ok([...f.db].some(([k,v])=>k.startsWith('yp-operation-v1:')&&v));
 const g=fixture();g.db.set('yp-operation-v1:'+owner+':patchVideoState:'+id,{version:1,owner,epoch,operation:'unknown',target:id,state:'pending'});assert.equal((await g.create().recover()).blocked,1);assert.equal(g.writes.length,0);
});
test('recovery acknowledgement failure retains original command and a second recovery uses its receipt',async()=>{
 const f=fixture();f.lose();assert.equal((await f.create().update(f.video,{review:'Recover me'})).queued,true);f.advance();f.failClear();await assert.rejects(f.create().recover());f.advance();assert.equal((await f.create().recover()).sent,1);assert.deepEqual(f.writes[0],f.writes[2]);
});

test('recovery blocks schema-valid body that no longer matches saved intent or YouTube target',async()=>{
 for(const scenario of ['state','review','add']){
  const f=fixture();if(scenario==='add')f.missing();f.lose();assert.equal((await f.create().update(f.video,scenario==='review'?{review:'Original'}:{rating:8})).queued,true);
  const [key,pending]=[...f.db].find(([k,v])=>k.startsWith('yp-operation-v1:')&&v);
  if(scenario==='add')pending.body.youtube_video_id='abcdefghijk';else if(scenario==='review')pending.body.text='Different';else pending.body.rating=1;
  f.db.set(key,pending);const count=f.writes.length;assert.deepEqual(await f.create().recover(),{sent:0,blocked:1,next:null});assert.equal(f.writes.length,count);assert.ok(f.db.get(key));
 }
});

test('damaged key, lease, revision or schema body is retained blocked without HTTP',async()=>{
 for(const field of ['key','lease','revision','schema']){
  const f=fixture();f.lose();assert.equal((await f.create().update(f.video,{rating:8})).queued,true);const [slot,p]=[...f.db].find(([k,v])=>k.startsWith('yp-operation-v1:')&&v);
  f.advance();if(field==='key')p.key='invalid';if(field==='lease')p.lease=null;if(field==='revision')p.body.expected_revision=-1;if(field==='schema'){p.body.rating=88;p.fingerprint=JSON.stringify({rating:88});}
  f.db.set(slot,p);const count=f.writes.length;assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,count);assert.ok(f.db.get(slot));
 }
});

test('durable retry deadline survives restart, respects Retry-After and keeps original command',async()=>{
 const f=fixture();f.failHTTP(429,120);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);const command=f.writes[0];assert.equal((await f.create().update(f.video,{review:'Must respect shared cooldown'})).queued,true);assert.equal(f.writes.length,1);const pending=[...f.db.values()].find(v=>v?.state==='pending');assert.equal(pending.attempts,1);assert.equal(pending.nextAttemptAt,1120000);assert.equal((await f.create().recover()).deferred,1);assert.equal(f.writes.length,1);
 f.advance(119999);assert.equal((await f.create().recover()).deferred,1);f.advance(1);f.failHTTP(0);assert.equal((await f.create().recover()).sent,1);assert.deepEqual(f.writes[1],command);
});
test('permanent HTTP failure is retained and never automatically resent',async()=>{
 const f=fixture();f.failHTTP(403);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);f.advance();assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,1);assert.equal([...f.db.values()].find(v=>v?.state==='rejected').errorStatus,403);
});

test('server failures increase persisted exponential delay across worker restarts',async()=>{
 const f=fixture();f.failHTTP(503);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);assert.equal((await f.create().recover()).deferred,1);f.advance(5000);await assert.rejects(f.create().recover());let row=[...f.db.values()].find(v=>v?.state==='pending');assert.equal(row.attempts,2);assert.equal(row.nextAttemptAt,1015000);assert.deepEqual(f.writes[0],f.writes[1]);f.advance(10000);f.failHTTP(0);assert.equal((await f.create().recover()).sent,1);
});

test('429 command deadline and account cooldown use a single atomic transaction',async()=>{
 const f=fixture();const commits=[],original=f.storage.commit;f.storage.commit=async entries=>{commits.push(structuredClone(entries));return original(entries)};f.failHTTP(429,120);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);const atomic=commits.find(entries=>entries.some(([key])=>key.startsWith('yp-rate-limit-v1:')));assert.ok(atomic);assert.equal(atomic.length,2);const [[slot,pending],[cooldownKey,cooldown]]=atomic;assert.ok(slot.startsWith('yp-operation-v1:'));assert.equal(cooldownKey,'yp-rate-limit-v1:'+owner);assert.equal(cooldown.until,pending.nextAttemptAt);assert.equal(cooldown.until,1120000);
});

test('conflict preview is owner-scoped and local choice uses fresh revision, key and archived original',async()=>{
 const f=fixture();f.failHTTP(409);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);f.serverState({revision:2,rating:10});f.failHTTP(0);const first=f.writes[0],page=await f.create().conflicts();assert.equal(page.items.length,1);assert.equal(page.items[0].local.rating,8);assert.equal(page.items[0].server.rating,10);assert.equal(page.items[0].title,'Real video');assert.equal(JSON.stringify(page).includes('original-signed-lease'),false);
 await f.create().resolve(page.items[0].ref,'local',page.items[0].expected);assert.notEqual(f.writes[1].key,first.key);assert.equal(f.writes[1].body.expected_revision,2);assert.equal(f.writes[1].body.rating,8);assert.equal((await f.create().current(yt)).videos[yt].rating,8);assert.ok([...f.db].some(([k,v])=>k.startsWith('yp-history-v1:')&&v.key===first.key));
});
test('keeping server archives the conflict without mutation, foreign and still pending references fail',async()=>{
 const f=fixture();f.failHTTP(409);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);f.failHTTP(0);const preview=(await f.create().conflicts()).items[0],ref=preview.ref;await assert.rejects(f.create().resolve(ref.replace(owner,'00000000-0000-4000-8000-000000000009'),'local'));await f.create().resolve(ref,'server',preview.expected);assert.equal(f.writes.length,1);assert.equal(await f.storage.read(ref),null);assert.equal((await f.create().conflicts()).items.length,0);
 const g=fixture();g.lose();assert.equal((await g.create().update(g.video,{later:true})).queued,true);const pending=[...g.db.keys()].find(k=>k.startsWith('yp-operation-v1:'));await assert.rejects(g.create().resolve(pending,'server'),e=>e.kind==='pending');assert.equal(g.writes.length,1);
});

test('offline 7 then 8 then delete persists the final unsent intent before any network and converges once',async()=>{
 const f=fixture();await f.create().current(yt);f.offline();for(const rating of [7,8,null]){const result=await f.create().update(f.video,{rating});assert.equal(result.queued,true);assert.equal(result.videos[yt].pending,true);assert.equal(result.videos[yt].rating,rating);}
 assert.equal(f.writes.length,0);const staged=[...f.db].filter(([key,v])=>key.startsWith('yp-intent-v1:')&&v);assert.equal(staged.length,1);assert.equal(staged[0][1].patch.rating,null);f.offline(false);assert.equal((await f.create().recover()).sent,1);assert.equal(f.writes.length,1);assert.equal(f.writes[0].body.expected_revision,1);assert.equal(f.writes[0].body.rating,null);assert.equal((await f.create().queueStatus()).pending,0);
});
test('sent command stays immutable while its successor rebases only after the exact receipt',async()=>{
 const f=fixture();await f.create().current(yt);f.lose();assert.equal((await f.create().update(f.video,{rating:7})).queued,true);const first=structuredClone(f.writes[0]);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);assert.equal((await f.create().update(f.video,{rating:null})).queued,true);assert.equal(f.writes.length,1);f.advance();await f.create().recover();assert.deepEqual(f.writes[1],first);assert.equal(f.writes[2].body.expected_revision,2);assert.equal(f.writes[2].body.rating,null);assert.notEqual(f.writes[2].key,first.key);assert.equal(f.writes.length,3);assert.equal((await f.create().queueStatus()).pending,0);
});
test('offline intent cannot silently overwrite a newer website edit and keeping server cannot resurrect it',async()=>{
 const f=fixture();await f.create().current(yt);f.offline();assert.equal((await f.create().update(f.video,{rating:8})).queued,true);f.serverState({revision:2,rating:10});f.offline(false);await f.create().recover();const conflict=(await f.create().conflicts()).items[0];assert.equal(conflict.local.rating,8);assert.equal(conflict.server.rating,10);await f.create().resolve(conflict.ref,'server',conflict.expected);const writes=f.writes.length;await f.create().recover();assert.equal(f.writes.length,writes);assert.equal((await f.create().current(yt)).videos[yt].rating,10);assert.equal((await f.create().queueStatus()).pending,0);
});

test('offline coalescing follows mark/later domain rules in both click orders',async()=>{
 for(const reverse of [false,true]){const f=fixture();await f.create().current(yt);f.offline();for(const patch of reverse?[{mark:'not_interested'},{later:true}]:[{later:true},{mark:'not_interested'}])assert.equal((await f.create().update(f.video,patch)).queued,true);f.offline(false);await f.create().recover();assert.equal(f.writes.length,1);assert.equal(f.writes[0].body.later,reverse);assert.equal(f.writes[0].body.mark,reverse?null:'not_interested');}
});

test('a server edit after conflict preview requires new confirmation and cannot be overwritten',async()=>{
 const f=fixture();f.failHTTP(409);assert.equal((await f.create().update(f.video,{rating:8})).queued,true);f.failHTTP(0);const preview=(await f.create().conflicts()).items[0];f.serverState({revision:2,rating:10});const before=f.writes.length;await assert.rejects(f.create().resolve(preview.ref,'local',preview.expected),e=>e.kind==='preview_changed');assert.equal(f.writes.length,before);assert.ok(await f.storage.read(preview.ref));const fresh=(await f.create().conflicts()).items[0];await f.create().resolve(fresh.ref,'local',fresh.expected);assert.equal(f.writes.at(-1).body.expected_revision,2);
});

test('offline current and watchlist use only real cached account data with explicit pending state',async()=>{
 const f=fixture();await f.create().current(yt);await f.create().update(f.video,{later:true});await f.create().library();f.offline();assert.equal((await f.create().update(f.video,{rating:8})).queued,true);const current=await f.create().current(yt),list=await f.create().library();assert.equal(current.offline,true);assert.equal(current.videos[yt].offline,true);assert.equal(current.videos[yt].pending,true);assert.equal(current.videos[yt].rating,8);assert.equal(current.videos[yt].ratingAverage,null);assert.equal(current.videos[yt].ratingCount,0);assert.equal(list.offline,true);assert.equal(list.videos[yt].pending,true);
 f.switchOwner();assert.deepEqual((await f.create().current(yt)).videos,{});assert.deepEqual((await f.create().library()).videos,{});
});
test('an offline intent without known base cannot silently overwrite an existing server revision',async()=>{
 const f=fixture();f.serverState({rating:10,revision:3});f.offline();assert.equal((await f.create().update(f.video,{rating:8})).queued,true);f.offline(false);await f.create().recover();assert.equal(f.writes[0].body.expected_revision,0);const preview=(await f.create().conflicts()).items[0];assert.equal(preview.server.rating,10);assert.equal(preview.local.rating,8);assert.equal((await f.create().current(yt)).videos[yt].conflict,true);
});

test('uncached offline intents remain visible after worker restart in current and pending watchlist',async()=>{
 const f=fixture();f.offline();assert.equal((await f.create().update(f.video,{later:true,rating:8})).queued,true);assert.equal((await f.create().update(f.video,{review:'Offline draft'})).queued,true);const current=await f.create().current(yt);assert.equal(current.videos[yt].rating,8);assert.equal(current.videos[yt].review,'Offline draft');assert.equal(current.videos[yt].pending,true);assert.equal(current.videos[yt].ratingCount,undefined);assert.equal(current.videos[yt].url,'https://www.youtube.com/watch?v='+yt);
 const list=await f.create().library();assert.equal(list.pendingVideos[yt].later,true);assert.equal(list.pendingVideos[yt].rating,8);assert.equal(Object.keys(list.pendingVideos).length,1);const page=await f.create().pendingLibrary();assert.equal(page.pendingVideos[yt].review,'Offline draft');f.switchOwner();assert.deepEqual((await f.create().pendingLibrary()).pendingVideos,{});
});
test('offline later on cached current is shown even when absent from the cached server watchlist',async()=>{
 const f=fixture();await f.create().current(yt);assert.deepEqual((await f.create().library()).videos,{});f.offline();await f.create().update(f.video,{later:true});const page=await f.create().library();assert.deepEqual(page.videos,{});assert.equal(page.pendingVideos[yt].pending,true);assert.equal(page.pendingVideos[yt].later,true);
});

test('import preview writes no server data, defaults can keep server and repeated commit never duplicates',async()=>{
 const f=fixture(),preview=await f.create().previewImport([{video:f.video,rating:8,review:'Imported review'}]);assert.equal(f.writes.length,0);assert.equal(preview.rows[0].existing,true);assert.equal((await f.create().importStatus(preview.id)).id,preview.id);assert.equal((await f.create().importStatus()).id,preview.id);assert.equal(preview.choices,null);const kept=await f.create().commitImport(preview.id,['server']);assert.equal(kept.rows[0].result,'skipped');assert.equal(f.writes.length,0);
 const next=await f.create().previewImport([{video:f.video,rating:8,review:'Imported review'}]);const done=await f.create().commitImport(next.id,['local']);assert.equal(done.rows[0].result,'imported');assert.equal(f.writes.length,2);await f.create().commitImport(next.id,['local']);assert.equal(f.writes.length,2);await assert.rejects(f.create().commitImport(next.id,['server']),e=>e.kind==='reconcile_required');assert.equal((await f.create().current(yt)).videos[yt].review,'Imported review');
});
test('import crash after server effect retries exact key/body and crash after ACK uses receipt marker',async()=>{
 for(const loseJournal of [false,true]){const f=fixture(),preview=await f.create().previewImport([{video:f.video,rating:8}]);if(!loseJournal)f.failClear();else{let lost=false;const write=f.storage.write;f.storage.write=async(value,key)=>{if(!lost&&key.startsWith('yp-import-v1:')&&value.rows?.[0].result==='imported'){lost=true;throw Error('journal')};return write(value,key)}}
  await assert.rejects(f.create().commitImport(preview.id,['local']));f.advance();const done=await f.create().commitImport(preview.id,['local']);assert.equal(done.rows[0].result,'imported');assert.equal(f.writes.length,loseJournal?1:2);if(!loseJournal)assert.deepEqual(f.writes[0],f.writes[1]);
 }
});
test('import uses preview revisions, blocks existing pending and never resumes under another epoch',async()=>{
 const f=fixture(),preview=await f.create().previewImport([{video:f.video,rating:8}]);f.serverState({rating:10,revision:2});const result=await f.create().commitImport(preview.id,['local']);assert.equal(result.rows[0].result,'conflict');assert.equal(f.writes[0].body.expected_revision,1);assert.equal((await f.create().current(yt)).videos[yt].rating,10);const count=f.writes.length;await f.create().commitImport(preview.id,['local']);assert.equal(f.writes.length,count);
 const g=fixture();g.offline();await g.create().update(g.video,{rating:7});g.offline(false);const blocked=await g.create().previewImport([{video:g.video,rating:8}]);assert.equal(blocked.rows[0].blocked,true);assert.equal((await g.create().commitImport(blocked.id,['local'])).rows[0].result,'blocked');assert.equal(g.writes.length,0);
 const h=fixture(),owned=await h.create().previewImport([{video:h.video,rating:8}]);h.switchEpoch();await assert.rejects(h.create().commitImport(owned.id,['local']),e=>e.kind==='reconcile_required');assert.equal(h.writes.length,0);
});

test('old session queue stays blocked until explicit resume and then replays original immutable command',async()=>{
 const f=fixture();f.lose();await f.create().update(f.video,{rating:8});f.switchEpoch();f.advance();assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,1);assert.ok((await f.create().queueStatus()).retained>0);await f.create().resumePending();await f.create().recover();assert.equal(f.writes.length,2);assert.deepEqual(f.writes[0],f.writes[1]);assert.equal((await f.create().queueStatus()).retained,0);
});

test('cached list pages have a bounded LRU without removing pending commands or other accounts',async()=>{
 const f=fixture(),pending='yp-operation-v1:'+owner+':probe';f.db.set(pending,{original:true});f.db.set('yp-library-page-v2:other:first',{items:[]});for(let i=0;i<12;i++)await f.create().library('cursor-'+i);assert.equal([...f.db.keys()].filter(key=>key.startsWith('yp-library-page-v2:'+owner+':')).length,10);assert.equal(f.db.has('yp-library-page-v2:'+owner+':cursor-0'),false);assert.equal(f.db.get(pending).original,true);assert.ok(f.db.has('yp-library-page-v2:other:first'));f.offline();assert.equal((await f.create().library('cursor-0')).cacheMiss,true);assert.equal((await f.create().library('cursor-11')).cacheMiss,undefined);
});

test('new-video observation receipt anchors the next state after ACK loss and background restart',async()=>{
 const f=fixture();f.missing();f.lose();assert.equal((await f.create().update(f.video,{rating:7})).queued,true);f.advance();await f.create().recover();assert.deepEqual(f.writes[0],f.writes[1]);assert.equal(f.writes[2].body.expected_revision,1);assert.equal(f.writes[2].body.rating,7);assert.equal((await f.create().current(yt)).videos[yt].rating,7);assert.equal((await f.create().queueStatus()).pending,0);
});
test('backend pull exposes real canonical generation and explicit discard preserves legacy source',async()=>{
 const f=fixture();assert.equal((await f.create().importStatus()).rows.length,0);assert.equal((await f.create().pull()).complete,true);assert.equal((await f.create().queueStatus()).sync.state,'idle');f.db.set('yp-library-v1',{source:true});f.offline();await f.create().update(f.video,{rating:8});assert.ok((await f.create().queueStatus()).pending>0);await f.create().discardPending();assert.equal((await f.create().queueStatus()).pending,0);assert.equal(f.db.get('yp-library-v1').source,true);
});

test('explicit import creates a missing video once and uses the observation receipt revision for state',async()=>{
 const f=fixture();f.missing();const preview=await f.create().previewImport([{video:f.video,rating:8}]);assert.equal(preview.rows[0].existing,false);const done=await f.create().commitImport(preview.id,['local']);assert.equal(done.rows[0].result,'imported');assert.equal(f.writes[0].path,'/v1/me/videos');assert.equal(f.writes[1].body.expected_revision,1);await f.create().commitImport(preview.id,['local']);assert.equal(f.writes.length,2);
});

test('unknown video offline review plus rating shares exact own add receipt in either click order',async()=>{
 for(const reverse of [false,true]){const f=fixture();f.missing();f.serverReview({revision:0,text:null});f.offline();for(const patch of reverse?[{rating:8},{review:'Offline new review'}]:[{review:'Offline new review'},{rating:8}])assert.equal((await f.create().update(f.video,patch)).queued,true);f.offline(false);await f.create().recover();const current=(await f.create().current(yt)).videos[yt];assert.equal(current.rating,8);assert.equal(current.review,'Offline new review');assert.equal((await f.create().queueStatus()).pending,0);assert.equal((await f.create().queueStatus()).blocked,0);assert.equal(f.writes.filter(value=>value.path==='/v1/me/videos').length,1);assert.equal(f.writes.find(value=>value.path.endsWith('/state')).body.expected_revision,1);}
});
test('shared observation receipt never rebases across a website edit after the add',async()=>{
 const f=fixture();f.missing();f.serverReview({revision:0,text:null});f.offline();await f.create().update(f.video,{review:'Offline new review'});await f.create().update(f.video,{rating:8});f.offline(false);f.afterReview(()=>f.serverState({revision:2,rating:10}));await f.create().recover();const conflict=(await f.create().conflicts()).items[0];assert.equal(conflict.server.rating,10);assert.equal(conflict.local.rating,8);assert.equal(f.writes.find(value=>value.path.endsWith('/state')).body.expected_revision,1);
});

test('description observation reaches add API for new and already-added video without hiding stale state',async()=>{
 for(const missing of [false,true]){const f=fixture();if(missing)f.missing();const b=f.create();await b.update({...f.video,observation:{source:'youtube-description-dom',status:'partial',tags:['Тест']}},{rating:8});const add=f.writes.find(row=>row.path==='/v1/me/videos');assert.deepEqual(add.body.hashtags,['Тест']);assert.equal(add.body.hashtags_observation_status,'partial');assert.equal(add.body.expected_revision,missing?0:1);}
 const f=fixture(),b=f.create();await b.current(yt);f.serverState({revision:2,rating:10});await b.update({...f.video,observation:{source:'youtube-description-dom',status:'complete',tags:[]}},{rating:8});assert.equal(f.writes.find(row=>row.path.endsWith('/state')).body.expected_revision,1);assert.equal((await b.queueStatus()).blocked>0,true);
});



test('optional CJK description metadata respects serialized request budget and never blocks a rating',async()=>{
 const f=fixture();f.missing();const tags=Array.from({length:30},(_,i)=>'漢'.repeat(98)+String(i).padStart(2,'0'));
 await f.create().update({...f.video,observation:{source:'youtube-description-dom',status:'complete',tags}},{rating:9});
 const add=f.writes.find(row=>row.path==='/v1/me/videos');assert.ok(new TextEncoder().encode(JSON.stringify(add.body)).length<=8192);assert.equal(add.body.hashtags_observation_status,'partial');assert.ok(add.body.hashtags.length<30);assert.equal(f.writes.at(-1).body.rating,9);
});

test('optional metadata Add409 does not strand independent review or bypass stale rating revision',async()=>{
 for(const review of [false,true]){const f=fixture(),b=f.create();await b.current(yt);f.raceAdd();await b.update({...f.video,observation:{source:'youtube-description-dom',status:'partial',tags:['tag']}},review?{review:'Own review'}:{rating:8});assert.equal([...f.db.entries()].filter(([key,value])=>key.includes(':addObservedVideo:')&&value).length,0);if(review)assert.equal((await b.current(yt)).videos[yt].review,'Own review');else{const conflicts=await b.conflicts();assert.equal(conflicts.items.length,1);assert.equal(conflicts.items[0].operation,'patchVideoState');assert.equal(f.writes.at(-1).body.expected_revision,1);}}
});

test('channel draft transfer requires authoritative association and an unchanged explicit preview',async()=>{
 const f=fixture(),b=f.create();await assert.rejects(b.channelPreview(yt),e=>e.kind==='channel_unconfirmed');f.confirmChannel();const preview=await b.channelPreview(yt);assert.equal(preview.rating,3);assert.equal(f.writes.length,0);await assert.rejects(b.channelConfirm(yt,{...preview,revision:0},8),e=>e.kind==='preview_changed');await b.channelConfirm(yt,preview,8);assert.equal(f.writes[0].body.rating,8);assert.equal(f.writes[0].body.expected_revision,2);const next=await b.channelPreview(yt);assert.equal(next.rating,8);
 f.lose();await assert.rejects(b.channelConfirm(yt,next,9));f.advance();await b.recover();assert.equal((await b.channelPreview(yt)).rating,9);assert.deepEqual(f.writes.at(-1),f.writes.at(-2));
});

test('confirmed channel transfer conflicts have an explicit per-item resolution',async()=>{
 const f=fixture(),b=f.create();f.confirmChannel();const preview=await b.channelPreview(yt);f.failHTTP(409);await assert.rejects(b.channelConfirm(yt,preview,7),e=>e.kind==='reconcile_required');f.failHTTP(0);const page=await b.conflicts();assert.equal(page.items[0].operation,'putChannelRating');assert.equal(page.items[0].local.rating,7);await b.resolve(page.items[0].ref,'local',page.items[0].expected);assert.equal((await b.channelPreview(yt)).rating,7);
});
test('review policy 422 preserves draft/intent and reports the exact safe reason without claiming success',async()=>{for(const code of ['review_links_not_allowed','review_abusive_language']){const f=fixture(),b=f.create();f.failHTTP(422,null,code);await assert.rejects(b.update(f.video,{review:'Rejected draft'}),e=>e.kind===code);const row=[...f.db.values()].find(v=>v.operation==='putVideoReview');assert.equal(row.errorCode,code);assert.equal(row.state,'conflict');const pending=(await b.conflicts()).items[0];assert.equal(pending.local.text,'Rejected draft');assert.equal(pending.server.text,'Existing review');const count=f.writes.length;await b.recover();assert.equal(f.writes.length,count);}});

 test('content policy is cached for 60s, unavailable without fresh rules, and survives restart',async()=>{const f=fixture(),b=f.create();const p=await b.contentPolicy();assert.equal(p.available,true);assert.deepEqual(p.excluded_terms,['nude yoga']);f.offline();assert.equal((await f.create().contentPolicy()).available,true);f.advance(60001);assert.equal((await b.contentPolicy()).available,false);f.offline(false);assert.equal((await b.contentPolicy()).available,true);const switched=fixture();switched.switchOnAuthorize(2);await assert.rejects(switched.create().contentPolicy(),e=>e.kind==='stale');});
 test('403 content filter retains rejected command without logout or duplicate retry',async()=>{const f=fixture(),b=f.create();f.failHTTP(403,null,'content_filtered');await assert.rejects(b.update(f.video,{review:'Review'}),e=>e.kind==='content_filtered');assert.equal(f.writes.length,1);await b.recover();assert.equal(f.writes.length,1);assert.ok([...f.db.values()].some(v=>v?.errorCode==='content_filtered'));});
