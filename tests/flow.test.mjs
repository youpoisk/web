import test from 'node:test';
import assert from 'node:assert/strict';
import { PendingFlow, FlowError } from '../src/shared/auth/flow.ts';
const epoch='00000000-0000-4000-8000-000000000001';
const owner='00000000-0000-4000-8000-000000000002';
const callback='https://web.example/youpoisk/';
const code='A'.repeat(43);
const failure=kind=>error=>error instanceof FlowError&&error.kind===kind;
function fixture(overrides={}){
 const data=new Map();const env={now:1000000,scope:{owner,epoch},readFail:false,writeFail:false,removeFail:false};
 const storage={getItem(key){if(env.readFail)throw Error('private storage error');return data.get(key)??null},setItem(key,value){if(env.writeFail)throw Error('private quota error');data.set(key,value)},removeItem(key){if(env.removeFail)throw Error('private storage error');data.delete(key)}};
 const config={storage,crypto:globalThis.crypto,clock:()=>env.now,scope:()=>env.scope,apiOrigin:'https://api.example',callback,...overrides};
 const flow=new PendingFlow(config);
 const url=state=>callback+'?'+new URLSearchParams({code,state});
 return{flow,data,env,config,url};
}
test('canonical configuration and route inputs fail closed',async()=>{
 for(const apiOrigin of ['bad','http://evil.example','https://u:p@api.example','https://api.example/path','https://api.example?','https://api.example#','https://API.example','https://127.1'])assert.throws(()=>fixture({apiOrigin}),failure('configuration'));
 for(const cb of ['https://web.example/youpoisk/#','https://web.example/?q=1','https://web.example','http://evil.example/','https://web.example/a/../b'])assert.throws(()=>fixture({callback:cb}),failure('configuration'));
 for(const apiOrigin of ['http://localhost:18080','http://127.0.0.1:18080','http://[::1]:18080'])assert.ok(fixture({apiOrigin}));
 const{flow,env}=fixture();
 for(const hash of ['https://evil.example','/settings','#','#/bad\nroute','#/'+String.fromCharCode(0xd800),'#/'+ 'x'.repeat(2048)])await assert.rejects(flow.begin('restore',hash),failure('protocol'));
 await assert.rejects(flow.begin('invalid','#/'),failure('protocol'));
 env.scope={owner:null,epoch:'invalid'};await assert.rejects(flow.begin('restore','#/'),failure('configuration'));
 env.scope={owner:'invalid',epoch};await assert.rejects(flow.begin('restore','#/'),failure('configuration'));
 env.scope={owner:null,epoch};env.now=-1;await assert.rejects(flow.begin('restore','#/'),failure('configuration'));
});
test('RFC S256, state persistence and callback cleanup/acknowledgment',async()=>{
 const verifier='dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
 const bytes=Uint8Array.from(atob(verifier.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));let randomCalls=0;
 const crypto={subtle:globalThis.crypto.subtle,getRandomValues(target){randomCalls++;target.set(randomCalls===1?new Uint8Array(32):bytes);return target}};
 const{flow,data,url}=fixture({crypto});
 const params=await flow.begin('restore','#/settings');
 assert.equal(params.get('code_challenge'),'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
 assert.equal(params.get('code_challenge_method'),'S256');assert.equal(params.has('code_verifier'),false);
 const stored=JSON.parse([...data.values()][0]);assert.equal(stored.verifier,verifier);
 assert.equal(/access_token|refresh_token|password/.test([...data.values()][0]),false);
 const cleaned=[];const result=flow.capture(url(params.get('state')),value=>cleaned.push(value));
 assert.equal(result.code,code);assert.equal(result.pending.returnHash,'#/settings');assert.deepEqual(cleaned,[callback,callback+'#/settings']);
 assert.equal(data.size,1); // Consume only after successful exchange/identity checks.
 assert.throws(()=>flow.acknowledge('wrong'),failure('stale'));
 flow.acknowledge(params.get('state'));assert.equal(data.size,0);
 assert.throws(()=>flow.acknowledge(params.get('state')),failure('stale'));
});
test('bad callbacks scrub code before validation, retain the live pending flow',async()=>{
 const{flow,data,url}=fixture();const params=await flow.begin('login','#/');const state=params.get('state');
 assert.equal(flow.capture(callback,()=>assert.fail()),null);
 assert.throws(()=>flow.capture('bad',()=>assert.fail()),failure('protocol'));
 assert.throws(()=>flow.capture('https://evil.example/?code=x&state=y',()=>assert.fail()),failure('protocol'));
 for(const raw of [url(state)+'&code='+code,url(state)+'&extra=secret',url(state)+'#fragment',callback+'?state='+state,callback+'?code='+code,url('B'.repeat(42)+'A'),callback+'?code=bad&state='+state,'https://web.example/wrong/?code='+code+'&state='+state]){
  const cleaned=[];assert.throws(()=>flow.capture(raw,value=>cleaned.push(value)),failure('protocol'));assert.equal(cleaned.length,1);assert.equal(cleaned[0].includes('?'),false);assert.equal(data.size,1);
 }
 const empty=fixture();assert.throws(()=>empty.flow.capture(empty.url(state),()=>{}),failure('protocol'));
});
test('storage/crypto failures never produce a navigation request',async()=>{
 const{flow,env}=fixture();env.readFail=true;await assert.rejects(flow.begin('login','#/'),failure('storage'));env.readFail=false;env.writeFail=true;await assert.rejects(flow.begin('login','#/'),failure('storage'));
 for(const crypto of [{getRandomValues(){throw Error('private')},subtle:globalThis.crypto.subtle},{getRandomValues:globalThis.crypto.getRandomValues.bind(globalThis.crypto),subtle:{digest:async()=>{throw Error('private')}}},{getRandomValues(){return new Uint8Array(1)},subtle:globalThis.crypto.subtle}])await assert.rejects(fixture({crypto}).flow.begin('register','#/'),failure('crypto'));
 const f=fixture();const params=await f.flow.begin('login','#/');f.env.removeFail=true;
 assert.throws(()=>f.flow.acknowledge(params.get('state')),failure('storage'));
 assert.throws(()=>f.flow.cancel(params.get('state')),failure('storage'));
});
test('malformed stored state never supplies a verifier or redirect',async()=>{
 const f=fixture();const params=await f.flow.begin('restore','#/');const[key,original]=[...f.data.entries()][0];const valid=JSON.parse(original);
 for(const raw of ['x'.repeat(8193),'not-json','null',JSON.stringify({...valid,extra:'secret'}),JSON.stringify({...valid,version:2}),JSON.stringify({...valid,epoch:{toString:null}}),JSON.stringify({...valid,owner:{}}),JSON.stringify({...valid,callback:'https://evil.example/'}),JSON.stringify({...valid,created:NaN}),JSON.stringify({...valid,returnHash:'https://evil.example'}),JSON.stringify({...valid,state:'bad'}),JSON.stringify({...valid,intent:'bad'})]){
  f.data.set(key,raw);assert.throws(()=>f.flow.capture(f.url(params.get('state')),()=>{}),failure('protocol'));
 }
 f.data.set(key,original);f.env.readFail=true;assert.throws(()=>f.flow.capture(f.url(params.get('state')),()=>{}),failure('storage'));
});
test('expiry/account changes cannot commit, explicit cancellation permits safe restart',async()=>{
 const f=fixture();const p=await f.flow.begin('restore','#/draft');
 await assert.rejects(f.flow.begin('login','#/'),failure('pending'));
 f.env.now+=15*60*1000+1;assert.throws(()=>f.flow.capture(f.url(p.get('state')),()=>{}),failure('expired'));
 assert.throws(()=>f.flow.cancel('wrong'),failure('stale'));
 const old=f.flow.cancel(p.get('state'));assert.equal(old.returnHash,'#/draft');assert.equal(f.data.size,0);
 assert.throws(()=>f.flow.cancel(p.get('state')),failure('stale'));
 const fresh=await f.flow.begin('restore','#/');f.env.scope={owner:null,epoch};assert.throws(()=>f.flow.capture(f.url(fresh.get('state')),()=>{}),failure('stale'));
 f.flow.cancel(fresh.get('state'));
});
test('asynchronous digest cannot overwrite concurrent/new-account pending state',async()=>{
 let release;const ready=new Promise(resolve=>{release=resolve});
 const crypto={getRandomValues:globalThis.crypto.getRandomValues.bind(globalThis.crypto),subtle:{async digest(...args){await ready;return globalThis.crypto.subtle.digest(...args)}}};
 const f=fixture({crypto});const one=f.flow.begin('login','#/');const two=f.flow.begin('login','#/');release();
 const results=await Promise.allSettled([one,two]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.kind==='pending').length,1);
 let resume;const wait=new Promise(resolve=>{resume=resolve});const other=fixture({crypto:{...crypto,subtle:{async digest(...args){await wait;return globalThis.crypto.subtle.digest(...args)}}}});
 const pending=other.flow.begin('restore','#/');other.env.scope={owner,epoch:'00000000-0000-4000-8000-000000000003'};resume();await assert.rejects(pending,failure('stale'));assert.equal(other.data.size,0);
});

test('ordinary reload can inspect and explicitly cancel an interrupted flow without reading private proof',async()=>{
 const f=fixture();assert.equal(f.flow.pendingSummary(),null);
 const params=await f.flow.begin('restore','#/draft');
 const reloaded=new PendingFlow(f.config);
 assert.equal(reloaded.capture(callback,()=>assert.fail()),null);
 const summary=reloaded.pendingSummary();
 assert.equal(summary.state,params.get('state'));assert.equal(summary.status,'pending');
 assert.equal(summary.returnHash,'#/draft');assert.equal(Object.hasOwn(summary,'verifier'),false);assert.equal(Object.hasOwn(summary,'challenge'),false);
 f.env.scope={owner:null,epoch};assert.equal(reloaded.pendingSummary().status,'stale');
 f.env.now+=900001;assert.equal(reloaded.pendingSummary().status,'expired');
 const cancelled=reloaded.cancel(summary.state);assert.equal(cancelled.returnHash,'#/draft');
 const next=await reloaded.begin('login',cancelled.returnHash);assert.notEqual(next.get('state'),summary.state);
});
