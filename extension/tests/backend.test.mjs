import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackend} from '../auth/backend.mjs';
const owner='00000000-0000-4000-8000-000000000001',id='00000000-0000-4000-8000-000000000002',epoch='00000000-0000-4000-8000-000000000003',yt='p0iTgHMEoi4';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function fixture(){
 let state={revision:1,rating:null,added:true,later:false},review={revision:4,text:'Existing review'},exists=true,lose=false,failClear=false,who=owner,scope=epoch,seq=1,switchAt=0,authorizations=0,badReviewTarget=false,clock=1000000,failStatus=0,retryAfter=null;
 const db=new Map(),receipts=new Map(),writes=[];
 const storage={async entries(prefix,{after=null,limit=12}={}){const rows=[...db].filter(([k,v])=>k.startsWith(prefix)&&v&&(!after||k>after)).sort(([a],[b])=>a.localeCompare(b));return {items:structuredClone(rows.slice(0,limit)),next:rows.length>limit?rows[limit-1][0]:null};},async commit(entries){if(failClear){failClear=false;throw Error('disk');}for(const [key,value]of entries)db.set(key,structuredClone(value));},async read(key){return structuredClone(db.get(key)??null)},async write(value,key){if(value===null&&failClear){failClear=false;throw Error('disk');}db.set(key,structuredClone(value));}};
 const session={async status(){return {state:'authenticated',owner:who,epoch:scope}},async authorize(fn){if(++authorizations===switchAt)who='00000000-0000-4000-8000-000000000005';return fn('opaque',{owner:who,epoch:scope})}};
 const card=()=>({id,youtube_video_id:yt,title:'Real video',duration_seconds:null,availability:'unknown',url:'https://www.youtube.com/watch?v='+yt,preview_url:'https://i.ytimg.com/vi/'+yt+'/hqdefault.jpg',hashtags:[],hashtags_observation_status:'unknown',channel:null,rating:{count:0,average:null},my_state:state});
 const result=()=>({kind:'video_state',target_id:id,state,change_seq:seq});
 async function fetch(url,init){
  const path=new URL(url).pathname;
  if(path.includes('/by-youtube/'))return exists?json(card()):json({code:'not_found',message:'Missing',request_id:'request',field_errors:{}},404);
  if(path.endsWith('/offline-lease'))return json({lease:'original-signed-lease',valid_for_seconds:604800});
  if(init.method==='GET'&&path.endsWith('/state'))return json(result());
  if(init.method==='GET'&&path.endsWith('/review'))return json({kind:'video_review',target_id:badReviewTarget?owner:id,review,change_seq:null});
  if(path.endsWith('/watchlist'))return json({items:[{...card(),listed_at:'2026-11-22T00:00:00Z',has_review:true}]});
  const key=init.headers.get('Idempotency-Key');writes.push({key,lease:init.headers.get('X-Offline-Lease'),body:JSON.parse(init.body),path});
  if(failStatus){const response=json({code:'rate_limited',message:'Retry',request_id:'request',field_errors:{}},failStatus);if(retryAfter!==null)response.headers.set('Retry-After',String(retryAfter));return response;}
  if(receipts.has(key))return json(receipts.get(key));
  const body=JSON.parse(init.body);let response;
  if(path.endsWith('/review')){assert.equal(body.expected_revision,review.revision);review={revision:review.revision+1,text:body.text};response={kind:'video_review',target_id:id,review,change_seq:++seq};}
  else if(path.endsWith('/state')){assert.equal(body.expected_revision,state.revision);const {expected_revision,...patch}=body;state={...state,...patch,revision:state.revision+1};response=result();}
  else{exists=true;response=result();}
  receipts.set(key,structuredClone(response));if(lose){lose=false;throw Error('lost response');}return json(response);
 }
 const create=()=>createBackend({origin:'http://127.0.0.1:18080',session,storage,fetch,now:()=>clock,random:()=>1});
 return {create,storage,db,writes,advance(ms=3600000){clock+=ms},failHTTP(status,seconds=null){failStatus=status;retryAfter=seconds},badReview(){badReviewTarget=true},switchOnAuthorize(n){switchAt=n},video:{id:yt,title:'Real video'},missing(){exists=false},lose(){lose=true},failClear(){failClear=true},switchEpoch(){scope='00000000-0000-4000-8000-000000000004'},switchOwner(){who='00000000-0000-4000-8000-000000000005'}};
}
test('server state and review use independent revisions, preserve null/false and never expose auth',async()=>{
 const f=fixture(),b=f.create();assert.equal((await b.current(yt)).videos[yt].review,'Existing review');await b.update(f.video,{rating:8});await b.update(f.video,{later:false});const saved=await b.update(f.video,{review:'Edited review'});assert.equal(saved.videos[yt].rating,8);assert.equal(saved.videos[yt].review,'Edited review');assert.equal(f.writes[0].body.expected_revision,1);assert.equal(f.writes[2].body.expected_revision,4);await b.update(f.video,{rating:null});assert.equal(f.writes.at(-1).body.rating,null);assert.equal((await b.library()).videos[yt].hasReview,true);assert.equal(JSON.stringify(saved).includes('opaque'),false);
});
test('lost state response and worker restart replay original key/body/lease without double commit',async()=>{
 const f=fixture();f.lose();await assert.rejects(f.create().update(f.video,{rating:9}));assert.ok([...f.db.values()].some(Boolean));f.advance();await f.create().update(f.video,{rating:9});assert.deepEqual(f.writes[0],f.writes[1]);assert.equal((await f.create().current(yt)).videos[yt].rating,9);assert.equal([...f.db.entries()].filter(([key,value])=>key.startsWith('yp-operation-v1:')&&value).length,0);
});
test('lost storage acknowledgement replays receipt, different intent or epoch requires reconciliation',async()=>{
 const f=fixture();f.failClear();await assert.rejects(f.create().update(f.video,{later:true}));await assert.rejects(f.create().update(f.video,{later:false}),e=>e.kind==='reconcile_required');f.switchEpoch();await assert.rejects(f.create().update(f.video,{later:true}),e=>e.kind==='reconcile_required');assert.equal(f.writes.length,1);
});
test('unknown video add is durable and replayed even when the catalog insert already committed',async()=>{
 const f=fixture();f.missing();f.lose();await assert.rejects(f.create().update(f.video,{rating:7}));f.advance();await f.create().update(f.video,{rating:7});assert.equal(f.writes[0].path,'/v1/me/videos');assert.deepEqual(f.writes[0],f.writes[1]);assert.equal([...f.db.entries()].filter(([key,value])=>key.startsWith('yp-operation-v1:')&&value).length,0);
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
 const f=fixture();f.lose();await assert.rejects(f.create().update(f.video,{rating:9}));f.advance();const result=await f.create().recover();assert.deepEqual(result,{sent:1,blocked:0,next:null});assert.deepEqual(f.writes[0],f.writes[1]);assert.equal((await f.create().current(yt)).videos[yt].rating,9);assert.equal((await f.create().recover()).sent,0);
});
test('recovery retains other accounts, old epochs and corrupt records without sending them',async()=>{
 const f=fixture();f.lose();await assert.rejects(f.create().update(f.video,{later:true}));f.switchEpoch();assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,1);f.switchOwner();assert.deepEqual(await f.create().recover(),{sent:0,blocked:0,next:null});assert.equal(f.writes.length,1);assert.ok([...f.db].some(([k,v])=>k.startsWith('yp-operation-v1:')&&v));
 const g=fixture();g.db.set('yp-operation-v1:'+owner+':patchVideoState:'+id,{version:1,owner,epoch,operation:'unknown',target:id,state:'pending'});assert.equal((await g.create().recover()).blocked,1);assert.equal(g.writes.length,0);
});
test('recovery acknowledgement failure retains original command and a second recovery uses its receipt',async()=>{
 const f=fixture();f.lose();await assert.rejects(f.create().update(f.video,{review:'Recover me'}));f.advance();f.failClear();await assert.rejects(f.create().recover());f.advance();assert.equal((await f.create().recover()).sent,1);assert.deepEqual(f.writes[0],f.writes[2]);
});

test('recovery blocks schema-valid body that no longer matches saved intent or YouTube target',async()=>{
 for(const scenario of ['state','review','add']){
  const f=fixture();if(scenario==='add')f.missing();f.lose();await assert.rejects(f.create().update(f.video,scenario==='review'?{review:'Original'}:{rating:8}));
  const [key,pending]=[...f.db].find(([k,v])=>k.startsWith('yp-operation-v1:')&&v);
  if(scenario==='add')pending.body.youtube_video_id='abcdefghijk';else if(scenario==='review')pending.body.text='Different';else pending.body.rating=1;
  f.db.set(key,pending);const count=f.writes.length;assert.deepEqual(await f.create().recover(),{sent:0,blocked:1,next:null});assert.equal(f.writes.length,count);assert.ok(f.db.get(key));
 }
});

test('damaged key, lease, revision or schema body is retained blocked without HTTP',async()=>{
 for(const field of ['key','lease','revision','schema']){
  const f=fixture();f.lose();await assert.rejects(f.create().update(f.video,{rating:8}));const [slot,p]=[...f.db].find(([k,v])=>k.startsWith('yp-operation-v1:')&&v);
  f.advance();if(field==='key')p.key='invalid';if(field==='lease')p.lease=null;if(field==='revision')p.body.expected_revision=-1;if(field==='schema'){p.body.rating=88;p.fingerprint=JSON.stringify({rating:88});}
  f.db.set(slot,p);const count=f.writes.length;assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,count);assert.ok(f.db.get(slot));
 }
});

test('durable retry deadline survives restart, respects Retry-After and keeps original command',async()=>{
 const f=fixture();f.failHTTP(429,120);await assert.rejects(f.create().update(f.video,{rating:8}));const command=f.writes[0];await assert.rejects(f.create().update(f.video,{review:'Must respect shared cooldown'}),e=>e.kind==='retry_later');assert.equal(f.writes.length,1);const pending=[...f.db.values()].find(v=>v?.state==='pending');assert.equal(pending.attempts,1);assert.equal(pending.nextAttemptAt,1120000);assert.equal((await f.create().recover()).deferred,1);assert.equal(f.writes.length,1);
 f.advance(119999);assert.equal((await f.create().recover()).deferred,1);f.advance(1);f.failHTTP(0);assert.equal((await f.create().recover()).sent,1);assert.deepEqual(f.writes[1],command);
});
test('permanent HTTP failure is retained and never automatically resent',async()=>{
 const f=fixture();f.failHTTP(403);await assert.rejects(f.create().update(f.video,{rating:8}),e=>e.kind==='reconcile_required');f.advance();assert.equal((await f.create().recover()).blocked,1);assert.equal(f.writes.length,1);assert.equal([...f.db.values()].find(v=>v?.state==='rejected').errorStatus,403);
});

test('server failures increase persisted exponential delay across worker restarts',async()=>{
 const f=fixture();f.failHTTP(503);await assert.rejects(f.create().update(f.video,{rating:8}));assert.equal((await f.create().recover()).deferred,1);f.advance(5000);await assert.rejects(f.create().recover());let row=[...f.db.values()].find(v=>v?.state==='pending');assert.equal(row.attempts,2);assert.equal(row.nextAttemptAt,1015000);assert.deepEqual(f.writes[0],f.writes[1]);f.advance(10000);f.failHTTP(0);assert.equal((await f.create().recover()).sent,1);
});
