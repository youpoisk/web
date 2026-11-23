// Local QA-only sync probe. Native session; restores the reserved fixture.
import assert from 'node:assert/strict';
import {createSession} from '../extension/auth/session.mjs';
import {createBackend} from '../extension/auth/backend.mjs';
import {ApiClient} from '../src/shared/api/client.ts';
const origin='http://127.0.0.1:18080',map=new Map();
const storage={async read(key){return structuredClone(map.get(key)??null)},async write(value,key){map.set(key,structuredClone(value))},async commit(entries){for(const [key,value]of entries)map.set(key,structuredClone(value))}};
const session=createSession({origin,store:{load:()=>storage.read('auth'),save:value=>storage.write(value,'auth')}});
async function request(operation,options={}){return session.authorize(async(token,scope)=>new ApiClient({baseUrl:origin,session:()=>({state:'authenticated',owner:scope.owner,epoch:scope.epoch,accessToken:token})}).request(operation,options))}
let video,oldState;
try{
 const auth=await session.login('qa_block_probe','qa_block_probe');video=await request('getVideoCardByYoutube',{path:{youtube_id:'p0iTgHMEoi4'}});oldState=(await request('getVideoState',{path:{id:video.id}})).state;
 const backend=()=>createBackend({session,storage,origin});let result;for(let i=0;i<400;i++){result=await backend().pull();if(result.complete)break;if(result.waiting)throw Error('Unexpected sync cooldown');}assert.equal(result.complete,true);
 const activeKey='yp-sync-v2:'+auth.owner,active=await storage.read(activeKey);assert.ok(active?.cursor);const cacheKey='yp-generation-v2:'+auth.owner+':'+active.generation+':video_state:'+video.id;
 const {lease}=await request('issueOfflineLease');let current=oldState;const patch=async value=>{const result=await request('patchVideoState',{path:{id:video.id},header:{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease},body:{expected_revision:current.revision,...value}});current=result.state;return result;};
 const rating=oldState.rating===8?9:8;await patch({rating});await backend().pull();assert.equal((await storage.read(cacheKey)).value.rating,rating);
 const pending='yp-operation-v1:'+auth.owner+':probe';await storage.write({key:'preserved'},pending);await patch({rating:null,added:false,later:false,mark:null});await backend().pull();const tombstone=await storage.read(cacheKey);assert.equal(tombstone.operation,'delete');assert.equal(tombstone.value,null);assert.equal(tombstone.revision,current.revision);assert.equal((await storage.read(pending)).key,'preserved');await backend().pull();assert.equal((await storage.read(activeKey)).generation,active.generation);
 console.log('PASS real API immutable snapshot, delta update, revisioned tombstone, restart cursor and preserved outbox');
}finally{
 try{if(video&&oldState){const latest=(await request('getVideoState',{path:{id:video.id}})).state,{lease}=await request('issueOfflineLease');await request('patchVideoState',{path:{id:video.id},header:{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease},body:{expected_revision:latest.revision,rating:oldState.rating,added:oldState.added,later:oldState.later,mark:oldState.mark??null}});const restored=(await request('getVideoState',{path:{id:video.id}})).state;for(const field of ['rating','added','later'])assert.equal(restored[field],oldState[field]);assert.equal(restored.mark??null,oldState.mark??null);console.log('Original QA state restored');}}finally{await session.logout();console.log('Native QA session revoked; web sessions preserved');}
}
