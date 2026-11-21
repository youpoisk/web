import test from 'node:test';
import assert from 'node:assert/strict';
import { BrowserSession } from '../src/shared/auth/session.ts';
import { FlowError } from '../src/shared/auth/flow.ts';
import { ApiError } from '../src/shared/api/client.ts';

const owner='00000000-0000-4000-8000-000000000001';
const credentials={access_token:'aaa.bbb.ccc',session_id:'00000000-0000-4000-8000-000000000002',user:{id:owner,login:'sample_login',name:'Owner',email:'owner@example.invalid'}};
const apiOrigin='https://api.example',callback='https://web.example/',code='A'.repeat(43);
const json=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
const fail=kind=>e=>(e instanceof ApiError||e instanceof FlowError)&&e.kind===kind;
function fixture(){
 const data=new Map(),env={reads:false,writes:false,removes:false,crypto:false,clear:false,clearAction:null,clears:0,now:1000,fetch:async()=>json(credentials)};
 const storage={getItem(k){if(env.reads)throw Error('private storage read');return data.get(k)??null},setItem(k,v){if(env.writes)throw Error('private storage write');data.set(k,v)},removeItem(k){if(env.removes)throw Error('private storage remove');data.delete(k)}};
 const crypto={randomUUID(){if(env.crypto)throw Error('private crypto error');return globalThis.crypto.randomUUID()},getRandomValues:v=>globalThis.crypto.getRandomValues(v),subtle:globalThis.crypto.subtle};
 const config={storage,crypto,clock:()=>env.now,apiOrigin,callback,clearPrivate(){env.clears++;if(env.clear)throw Error('private cache failure');const action=env.clearAction;env.clearAction=null;action?.()},fetch:(...args)=>env.fetch(...args)};
 const session=new BrowserSession(config);
 return{data,env,config,session,make:()=>new BrowserSession(config),scopeKey:()=>[...data.keys()].find(k=>k.startsWith('yp.auth.scope.'))};
}
async function start(session,intent='login'){const params=await session.start(intent,'#/watchlist');return callback+'?'+new URLSearchParams({code,state:params.get('state')});}
test('coordinator commits only validated callback and keeps tokens/profile in memory, scope survives full navigation',async()=>{
 const f=fixture();assert.deepEqual(f.session.businessScope(),{state:'guest'});assert.equal(f.session.currentUser(),null);assert.equal(f.session.pendingSummary(),null);
 assert.equal(await f.session.completeCallback(callback,()=>{}),null);
 const url=await start(f.session);const epoch=f.session.pendingSummary().epoch;
 const reloaded=f.make();assert.equal(reloaded.pendingSummary().status,'pending');assert.equal(reloaded.pendingSummary().epoch,epoch);
 assert.deepEqual(await reloaded.completeCallback(url,()=>{}),{returnHash:'#/watchlist'});
 const signed=reloaded.businessScope();assert.equal(signed.state,'authenticated');assert.equal(signed.owner,owner);assert.equal(signed.accessToken,credentials.access_token);assert.notEqual(signed.epoch,epoch);
 const copy=reloaded.currentUser();copy.id='changed';assert.equal(reloaded.currentUser().id,owner);assert.equal(reloaded.pendingSummary(),null);
 for(const secret of [credentials.access_token,credentials.user.email,credentials.user.name,credentials.user.login])assert.equal([...f.data.values()].join().includes(secret),false);
 const fresh=f.make();assert.equal(fresh.currentUser(),null);assert.deepEqual(fresh.businessScope(),{state:'recovering',owner,epoch:signed.epoch});
 fresh.markRecovering();assert.equal(fresh.businessScope().state,'recovering');
 const restore=await start(fresh,'restore');await fresh.completeCallback(restore,()=>{});assert.equal(fresh.businessScope().epoch,signed.epoch);
 fresh.markRecovering();assert.equal(fresh.currentUser(),null);assert.equal(fresh.businessScope().state,'recovering');
});
test('stored references are not credentials and malformed scope fails closed without overwrite',()=>{
 const invalid=['not json','x'.repeat(1025),'null','[]',JSON.stringify({version:1,owner,epoch:'bad'}),JSON.stringify({version:1,owner:'bad',epoch:owner}),JSON.stringify({version:2,owner:null,epoch:owner}),JSON.stringify({version:1,owner:null,epoch:owner,access_token:'secret'}),JSON.stringify({version:1,owner:null,epoch:42}),JSON.stringify({version:1,epoch:owner,other:1})];
 for(const raw of invalid){const f=fixture(),key=f.scopeKey();f.data.set(key,raw);assert.throws(f.make,fail('protocol'));assert.equal(f.data.get(key),raw);}
 const f=fixture();f.env.reads=true;assert.throws(f.make,fail('storage'));f.env.reads=false;f.data.clear();f.env.writes=true;assert.throws(f.make,fail('storage'));f.env.writes=false;f.env.crypto=true;assert.throws(f.make,fail('crypto'));
 const g=fixture();g.data.clear();g.config.crypto.randomUUID=()=> 'invalid';assert.throws(g.make,fail('crypto'));
});
test('forgetLocal clears private data, pending and generation but does not pretend to revoke a server session',async()=>{
 const f=fixture();await f.session.completeCallback(await start(f.session),()=>{});const before=f.session.businessScope();
 await start(f.session,'restore');assert.equal(f.session.businessScope().state,'recovering');
 f.session.forgetLocal();assert.equal(f.session.currentUser(),null);assert.deepEqual(f.session.businessScope(),{state:'guest'});assert.equal(f.session.pendingSummary(),null);assert.notEqual(JSON.parse(f.data.get(f.scopeKey())).epoch,before.epoch);assert.ok(f.env.clears>=3);
 f.session.forgetLocal();assert.equal(f.make().businessScope().state,'guest');
 const guest=fixture();guest.session.markRecovering();assert.deepEqual(guest.session.businessScope(),{state:'guest'});
});
test('late network result after local forget cannot commit identity',async()=>{
 const f=fixture();let release;f.env.fetch=()=>new Promise(r=>{release=r});const pending=f.session.completeCallback(await start(f.session),()=>{});f.session.forgetLocal();release(json(credentials));await assert.rejects(pending,fail('stale_session'));assert.equal(f.session.currentUser(),null);assert.deepEqual(f.session.businessScope(),{state:'guest'});
});
test('cache callbacks cannot invalidate pending scope and then commit stale credentials',async()=>{
 for(const action of ['forget','cancel','expire']){
  const f=fixture(),url=await start(f.session);f.env.clearAction=()=>{if(action==='forget')f.session.forgetLocal();else if(action==='cancel')f.session.cancel(f.session.pendingSummary().state);else f.env.now+=16*60*1000};
  await assert.rejects(f.session.completeCallback(url,()=>{}),fail('stale_session'));assert.equal(f.session.currentUser(),null);
 }
});
test('storage and cache errors never retain access or masquerade as successful authentication',async()=>{
 const f=fixture(),url=await start(f.session);f.env.writes=true;await assert.rejects(f.session.completeCallback(url,()=>{}),fail('storage'));assert.equal(f.session.currentUser(),null);assert.throws(()=>f.session.businessScope(),fail('authentication_unavailable'));assert.throws(()=>f.session.pendingSummary(),fail('authentication_unavailable'));f.env.writes=false;assert.equal(f.make().businessScope().state,'guest');
 const g=fixture(),callbackURL=await start(g.session);g.env.removes=true;await assert.rejects(g.session.completeCallback(callbackURL,()=>{}),fail('storage'));assert.equal(g.session.currentUser(),null);assert.equal(g.session.businessScope().state,'guest');g.env.removes=false;g.session.cancel(g.session.pendingSummary().state);assert.ok(await start(g.session));
 const h=fixture();h.env.clear=true;await assert.rejects(start(h.session),fail('authentication_unavailable'));assert.equal(h.session.currentUser(),null);assert.throws(()=>h.session.businessScope(),fail('authentication_unavailable'));
 const i=fixture(),input=await start(i.session);i.env.clear=true;await assert.rejects(i.session.completeCallback(input,()=>{}),fail('authentication_unavailable'));assert.equal(i.session.currentUser(),null);
});
test('forget remains fail-closed even if reading proof, clearing cache, crypto or writing scope fails',async()=>{
 for(const fault of ['reads','clear','crypto','writes','removes']){
  const f=fixture();await f.session.completeCallback(await start(f.session),()=>{});await start(f.session,'restore');const clears=f.env.clears;f.env[fault]=true;
  assert.throws(()=>f.session.forgetLocal());assert.equal(f.session.currentUser(),null);assert.throws(()=>f.session.businessScope(),fail('authentication_unavailable'));assert.ok(f.env.clears>clears);
 }
});
test('network failure preserves recoverable proof and requires explicit cancel/restart',async()=>{
 const f=fixture();const url=await start(f.session);f.env.fetch=async()=>{throw Error('private provider error')};await assert.rejects(f.session.completeCallback(url,()=>{}),fail('network'));assert.equal(f.session.currentUser(),null);assert.equal(f.session.pendingSummary().status,'pending');await assert.rejects(start(f.session),fail('pending'));
 const summary=f.session.pendingSummary();assert.equal(f.session.cancel(summary.state).returnHash,'#/watchlist');f.env.fetch=async()=>json(credentials);await f.session.completeCallback(await start(f.session),()=>{});assert.equal(f.session.businessScope().state,'authenticated');
});
test('another coordinator or external scope replacement cannot leave old access or profile usable',async()=>{
 const f=fixture();await f.session.completeCallback(await start(f.session),()=>{});const clears=f.env.clears;
 const fresh=f.make();fresh.forgetLocal();assert.equal(f.session.currentUser(),null);assert.throws(()=>f.session.businessScope(),fail('authentication_unavailable'));assert.ok(f.env.clears>clears);
 const g=fixture();await g.session.completeCallback(await start(g.session),()=>{});g.env.reads=true;assert.equal(g.session.currentUser(),null);assert.throws(()=>g.session.businessScope(),fail('authentication_unavailable'));
 const h=fixture();h.data.delete(h.scopeKey());assert.throws(()=>h.session.businessScope(),fail('stale_session'));
 const stale=fixture();const active=stale.make();await active.completeCallback(await start(active),()=>{});const reference=stale.data.get(stale.scopeKey());
 assert.throws(()=>stale.session.forgetLocal(),fail('stale_session'));assert.equal(stale.data.get(stale.scopeKey()),reference);assert.equal(active.businessScope().state,'authenticated');assert.equal(stale.session.currentUser(),null);
});
