import test from 'node:test';
import assert from 'node:assert/strict';
import {createPull} from '../auth/sync.mjs';
const owner='11111111-1111-4111-8111-111111111111',epoch='epoch-a',target='22222222-2222-4222-8222-222222222222',snapshot='33333333-3333-4333-8333-333333333333',scope={owner,epoch};
const item=(revision,value,operation='upsert')=>({kind:'video_state',target_id:target,revision,operation,value});
function fixture(){const db=new Map(),calls=[];let failCommit=false,currentEpoch=epoch,deltaError=null;
 const storage={async read(key){return structuredClone(db.get(key)??null)},async write(value,key){db.set(key,structuredClone(value))},async commit(entries){if(failCommit){failCommit=false;throw Error('quota')}for(const [key,value]of entries)db.set(key,structuredClone(value))}};
 const request=async(op,options)=>{calls.push({op,options});if(op==='createSyncSnapshot')return {id:snapshot,pages:2,cut_seq:10,cut_cursor:'cut'};if(op==='getSyncSnapshotPage'){const page=options.query.page;return {items:page===0?[item(2,{revision:2,rating:8})]:[],cut_seq:10,next_page:page===0?1:null,cut_cursor:'cut'};}if(deltaError)throw deltaError;return {items:[{seq:11,...item(3,null,'delete')}],cursor:'delta-11',more:false}};
 const check=async value=>{if(value.epoch!==currentEpoch)throw Object.assign(Error('stale'),{kind:'stale'})};
 return {db,calls,storage,create:()=>createPull({storage,request,check,now:()=>1000}),fail(){failCommit=true},switch(){currentEpoch='epoch-b'},deltaFail(error){deltaError=error}};
}
test('snapshot resumes between pages, activates atomically and delta tombstone does not touch pending',async()=>{
 const f=fixture(),pending='yp-operation-v1:'+owner+':pending';f.db.set(pending,{key:'original'});f.db.set('yp-canonical-v2:'+owner+':video_state:'+target,{revision:1,value:{rating:7},changeSeq:1});const sync=f.create();assert.equal((await sync.read(scope,'video_state',target)).value.rating,7);
 assert.equal((await sync.step(scope,{pages:1})).complete,false);assert.equal(f.db.get('yp-sync-v2:'+owner),undefined);assert.equal((await f.create().read(scope,'video_state',target)).value.rating,7);
 assert.equal((await f.create().step(scope,{pages:1})).complete,true);assert.equal((await sync.read(scope,'video_state',target)).value.rating,8);assert.equal(f.calls.filter(c=>c.op==='createSyncSnapshot').length,1);assert.equal(f.db.get('yp-sync-v2:'+owner).cursor,'cut');
 await f.create().step(scope);const deleted=await sync.read(scope,'video_state',target);assert.equal(deleted.operation,'delete');assert.equal(deleted.revision,3);assert.equal(deleted.value,null);assert.equal(f.db.get(pending).key,'original');assert.equal(f.db.get('yp-sync-v2:'+owner).cursor,'delta-11');
});
test('quota failure never advances page checkpoint or active generation and same page is retried',async()=>{
 const f=fixture();f.fail();await assert.rejects(f.create().step(scope,{pages:1}));assert.equal(f.db.get('yp-sync-progress-v2:'+owner).page,0);assert.equal(f.db.get('yp-sync-v2:'+owner),undefined);await f.create().step(scope,{pages:1});assert.equal(f.calls.filter(c=>c.op==='getSyncSnapshotPage'&&c.options.query.page===0).length,2);assert.equal(f.db.get('yp-sync-progress-v2:'+owner).page,1);
});
test('expired cursor requests full resync while retaining old generation, outbox and snapshots',async()=>{
 const f=fixture();await f.create().step(scope);f.deltaFail(Object.assign(Error('expired'),{status:410}));const result=await f.create().step(scope);assert.equal(result.reset,true);assert.equal(f.db.get('yp-sync-v2:'+owner).cursor,null);assert.equal((await f.create().read(scope,'video_state',target)).value.rating,8);
});
test('lost transport preserves progress, cooldown and newer local receipt; owner/epoch boundaries hold',async()=>{
 const f=fixture();await f.create().step(scope);f.db.set('yp-canonical-v2:'+owner+':video_state:'+target,{revision:4,value:{rating:10},changeSeq:12});assert.equal((await f.create().read(scope,'video_state',target)).value.rating,10);f.deltaFail(Object.assign(Error('rate'),{status:429,retryAfterSeconds:120}));assert.equal((await f.create().step(scope)).waiting,true);const calls=f.calls.length;assert.equal((await f.create().step(scope)).waiting,true);assert.equal(f.calls.length,calls);assert.equal(await f.create().read({owner:'other',epoch},'video_state',target),null);f.switch();await assert.rejects(f.create().step(scope,{pages:1}),e=>e.kind==='stale');
});

test('quota abort on the final snapshot page leaves the previous active generation intact',async()=>{
 const f=fixture();await f.create().step(scope,{pages:1});f.fail();await assert.rejects(f.create().step(scope,{pages:1}));assert.equal(f.db.get('yp-sync-v2:'+owner),undefined);assert.equal(f.db.get('yp-sync-progress-v2:'+owner).page,1);await f.create().step(scope,{pages:1});assert.equal(f.db.get('yp-sync-v2:'+owner).cursor,'cut');
});
