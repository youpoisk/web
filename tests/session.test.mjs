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
 const stale=fixture();await stale.session.completeCallback(await start(stale.session),()=>{});const active=stale.make();active.forgetLocal();stale.env.fetch=async()=>json({...credentials,user:{...credentials.user,id:'00000000-0000-4000-8000-000000000003'}});await active.completeCallback(await start(active),()=>{});const reference=stale.data.get(stale.scopeKey());
 assert.throws(()=>stale.session.forgetLocal(),fail('stale_session'));assert.equal(stale.data.get(stale.scopeKey()),reference);assert.equal(active.businessScope().state,'authenticated');assert.equal(stale.session.currentUser(),null);
});
test('authorize returns the broker URL with intent; refusals cancel the flow and only a live restore demotes to guest',async()=>{
 const f=fixture();const target=await f.session.authorize('login','#/feed');const url=new URL(target);
 assert.equal(url.origin+url.pathname,apiOrigin+'/auth/authorize');assert.equal(url.searchParams.get('intent'),'login');assert.equal(url.searchParams.get('redirect_uri'),callback);
 const denied=callback+'?'+new URLSearchParams({error:'access_denied',state:url.searchParams.get('state')});
 assert.deepEqual(await f.session.completeCallback(denied,()=>{}),{returnHash:'#/feed',outcome:'access_denied'});assert.equal(f.session.pendingSummary(),null);assert.deepEqual(f.session.businessScope(),{state:'guest'});
 await f.session.completeCallback(await start(f.session),()=>{});const signed=f.session.businessScope();
 const remembered=f.make();const restore=new URL(await remembered.authorize('restore','#/ratings'));
 assert.deepEqual(await remembered.completeCallback(callback+'?'+new URLSearchParams({error:'access_denied',state:restore.searchParams.get('state')}),()=>{}),{returnHash:'#/ratings',outcome:'access_denied'});
 assert.equal(remembered.businessScope().state,'recovering');
 const again=new URL(await remembered.authorize('restore','#/ratings'));
 assert.deepEqual(await remembered.completeCallback(callback+'?'+new URLSearchParams({error:'login_required',state:again.searchParams.get('state')}),()=>{}),{returnHash:'#/ratings',outcome:'login_required'});
 assert.deepEqual(remembered.businessScope(),{state:'guest'});assert.notEqual(JSON.parse(f.data.get(f.scopeKey())).epoch,signed.epoch);
 const expired=fixture();await expired.session.completeCallback(await start(expired.session),()=>{});const late=expired.make();const old=new URL(await late.authorize('restore','#/'));expired.env.now+=16*60*1000;
 assert.equal((await late.completeCallback(callback+'?'+new URLSearchParams({error:'login_required',state:old.searchParams.get('state')}),()=>{})).outcome,'login_required');assert.equal(late.businessScope().state,'recovering');
});
test('logout revokes with the bearer, otherwise hands off to the broker cookie logout with a per-tab nonce',async()=>{
 const f=fixture();await f.session.completeCallback(await start(f.session),()=>{});const seen=[];
 f.env.fetch=async(input,init)=>{seen.push([String(input),init.method,init.headers.Authorization,init.credentials]);return new Response(null,{status:204})};
 assert.deepEqual(await f.session.logout(),{result:'revoked'});assert.deepEqual(seen,[[apiOrigin+'/v1/auth/logout','POST','Bearer '+credentials.access_token,'omit']]);assert.deepEqual(f.session.businessScope(),{state:'guest'});
 for(const fault of [async()=>{throw Error('offline')},async()=>new Response(null,{status:401})]){
  const g=fixture();await g.session.completeCallback(await start(g.session),()=>{});g.env.fetch=fault;
  const out=await g.session.logout();assert.equal(out.result,'broker');const url=new URL(out.url);
  assert.equal(url.origin+url.pathname,apiOrigin+'/auth/logout');assert.equal(url.searchParams.get('redirect_uri'),callback);assert.match(url.searchParams.get('state'),/^[A-Za-z0-9_-]{43}$/);assert.deepEqual([...url.searchParams.keys()].sort(),['redirect_uri','state']);
  assert.deepEqual(g.session.businessScope(),{state:'guest'});
  const cleaned=[];assert.deepEqual(await g.session.completeCallback(callback+'?'+new URLSearchParams({logout:'done',state:url.searchParams.get('state')}),v=>cleaned.push(v)),{returnHash:'#/',outcome:'logged_out'});assert.deepEqual(cleaned,[callback]);
  assert.equal(await g.session.completeCallback(callback+'?'+new URLSearchParams({logout:'done',state:url.searchParams.get('state')}),()=>{}),null,'nonce is single-use');
 }
 const guest=fixture();assert.equal((await guest.session.logout()).result,'broker');
 const forged=fixture();const scrubbed=[];assert.equal(await forged.session.completeCallback(callback+'?logout=done&state='+'A'.repeat(43),v=>scrubbed.push(v)),null);assert.deepEqual(scrubbed,[callback]);
 await assert.rejects(forged.session.completeCallback('not a url',()=>{}),fail('protocol'));
 const blocked=fixture();await blocked.session.completeCallback(await start(blocked.session),()=>{});blocked.env.fetch=async()=>new Response(null,{status:401});blocked.config.crypto.getRandomValues=()=>{throw Error('no crypto')};blocked.env.writes=true;
 const still=await blocked.session.logout();assert.equal(still.result,'broker','storage/crypto failures never skip the cookie logout');assert.equal(new URL(still.url).searchParams.get('state'),'A'.repeat(43),'placeholder state when crypto fails');
 const dflt=fixture();const original=globalThis.fetch;const urls=[];globalThis.fetch=async input=>{urls.push(String(input));return String(input).endsWith('/v1/auth/logout')?new Response(null,{status:204}):json(credentials)};try{const s=new BrowserSession({...dflt.config,fetch:undefined});await s.completeCallback(await start(s),()=>{});assert.equal(s.businessScope().state,'authenticated');assert.deepEqual(await s.logout(),{result:'revoked'});assert.equal(urls.at(-1),apiOrigin+'/v1/auth/logout');}finally{globalThis.fetch=original}
});
test('per-tab flow storage: another tab cannot see or cancel this tab sign-in; another account commits with a fresh generation',async()=>{
 const f=fixture();const tabA=new Map(),tabB=new Map();const mk=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)});
 const a=new BrowserSession({...f.config,flowStorage:mk(tabA)}),b=new BrowserSession({...f.config,flowStorage:mk(tabB)});
 const url=callback+'?'+new URLSearchParams({code,state:(await a.start('login','#/feed')).get('state')});
 assert.equal(b.pendingSummary(),null);assert.equal([...f.data.keys()].some(k=>k.includes('pending')),false);
 assert.deepEqual(await a.completeCallback(url,()=>{}),{returnHash:'#/feed'});
 const remembered=a.businessScope();const other='00000000-0000-4000-8000-000000000009';
 f.env.fetch=async()=>json({...credentials,user:{...credentials.user,id:other}});
 const c=new BrowserSession({...f.config,flowStorage:mk(new Map())});const restore=callback+'?'+new URLSearchParams({code,state:(await c.start('restore','#/')).get('state')});
 await c.completeCallback(restore,()=>{});const now=c.businessScope();assert.equal(now.owner,other);assert.notEqual(now.epoch,remembered.epoch);
});
test('password page: nonce-bound outcomes end the local sign-in; cancelled or forged returns change nothing',async()=>{
 const signed=async()=>{const f=fixture();await f.session.completeCallback(await start(f.session),()=>{});assert.equal(f.session.businessScope().state,'authenticated');return f;};
 const f=await signed();const url=new URL(f.session.passwordURL('#/settings'));
 assert.equal(url.origin+url.pathname,apiOrigin+'/auth/password');assert.deepEqual([...url.searchParams.keys()].sort(),['redirect_uri','state']);
 assert.equal(url.searchParams.get('redirect_uri'),callback);assert.match(url.searchParams.get('state'),/^[A-Za-z0-9_-]{43}$/);
 const ret=(value,state=url.searchParams.get('state'))=>callback+'?'+new URLSearchParams({password:value,state});
 const cleaned=[];assert.deepEqual(await f.session.completeCallback(ret('changed'),v=>cleaned.push(v)),{returnHash:'#/',outcome:'password_changed'});
 assert.deepEqual(cleaned,[callback]);assert.deepEqual(f.session.businessScope(),{state:'guest'});assert.deepEqual(f.make().businessScope(),{state:'guest'},'scope demoted durably');
 const again=[];assert.equal(await f.session.completeCallback(ret('changed'),v=>again.push(v)),null,'nonce is single-use');assert.deepEqual(again,[callback]);
 for(const [value,outcome] of [['uncertain','password_uncertain'],['session','password_session']]){
  const g=await signed();const st=new URL(g.session.passwordURL('#/settings')).searchParams.get('state');
  assert.deepEqual(await g.session.completeCallback(callback+'?'+new URLSearchParams({password:value,state:st}),()=>{}),{returnHash:'#/',outcome});assert.deepEqual(g.session.businessScope(),{state:'guest'});
 }
 const c=await signed();const cs=new URL(c.session.passwordURL('#/settings')).searchParams.get('state');const back=[];
 assert.equal(await c.session.completeCallback(callback+'?'+new URLSearchParams({password:'cancelled',state:cs}),v=>back.push(v)),null);
 assert.deepEqual(back,[callback+'#/settings'],'cancel keeps the settings route for the normal restore');assert.equal(c.session.businessScope().state,'authenticated');
 const forged=await signed();forged.session.passwordURL('#/settings');const fs=[];
 assert.equal(await forged.session.completeCallback(callback+'?password=changed&state='+'B'.repeat(43),v=>fs.push(v)),null);assert.deepEqual(fs,[callback]);assert.equal(forged.session.businessScope().state,'authenticated');
 const none=await signed();assert.equal(await none.session.completeCallback(callback+'?password=changed&state='+'B'.repeat(43),()=>{}),null,'no saved nonce');assert.equal(none.session.businessScope().state,'authenticated');
 const odd=await signed();const os=new URL(odd.session.passwordURL('#/x')).searchParams.get('state');
 assert.equal(await odd.session.completeCallback(callback+'?'+new URLSearchParams({password:'other',state:os}),()=>{}),null,'unknown outcome');
 const dup=await signed();const ds=new URL(dup.session.passwordURL('#/settings')).searchParams.get('state');
 assert.equal(await dup.session.completeCallback(callback+'?password=changed&password=changed&state='+ds,()=>{}),null,'duplicate outcome');
 const bad=await signed();bad.session.passwordURL('#/settings');const key=[...bad.data.keys()].find(k=>k.startsWith('yp.auth.password.'));
 bad.data.set(key,'{broken');assert.equal(await bad.session.completeCallback(callback+'?password=changed&state=x',()=>{}),null,'damaged record');
 bad.data.set(key,JSON.stringify({state:'S'.repeat(43),returnHash:5}));const bh=[];
 assert.equal(await bad.session.completeCallback(callback+'?password=cancelled&state='+'S'.repeat(43),v=>bh.push(v)),null);assert.deepEqual(bh,[callback],'non-hash return ignored');
 const ws=await signed();ws.env.writes=true;assert.throws(()=>ws.session.passwordURL('#/settings'),fail('storage'));
 const cr=await signed();cr.config.crypto.getRandomValues=()=>{throw Error('no crypto')};assert.throws(()=>cr.session.passwordURL('#/settings'),fail('crypto'),'no fixed nonce for a sign-out-gating return');
});
test('account deletion page: nonce-bound outcomes end the local sign-in; cancel and forged returns change nothing',async()=>{
 const signed=async()=>{const f=fixture();await f.session.completeCallback(await start(f.session),()=>{});return f;};
 const f=await signed();const url=new URL(f.session.deleteAccountURL('#/settings'));
 assert.equal(url.origin+url.pathname,apiOrigin+'/auth/delete');assert.deepEqual([...url.searchParams.keys()].sort(),['redirect_uri','state']);
 const st=url.searchParams.get('state');const cleaned=[];
 assert.deepEqual(await f.session.completeCallback(callback+'?'+new URLSearchParams({account:'deleted',state:st}),v=>cleaned.push(v)),{returnHash:'#/',outcome:'account_deleted'});
 assert.deepEqual(cleaned,[callback]);assert.deepEqual(f.session.businessScope(),{state:'guest'});
 for(const [value,outcome] of [['uncertain','account_uncertain'],['session','account_session']]){
  const g=await signed();const s2=new URL(g.session.deleteAccountURL('#/settings')).searchParams.get('state');
  assert.deepEqual(await g.session.completeCallback(callback+'?'+new URLSearchParams({account:value,state:s2}),()=>{}),{returnHash:'#/',outcome});
 }
 const c=await signed();const cs=new URL(c.session.deleteAccountURL('#/settings')).searchParams.get('state');const back=[];
 assert.equal(await c.session.completeCallback(callback+'?'+new URLSearchParams({account:'cancelled',state:cs}),v=>back.push(v)),null);
 assert.deepEqual(back,[callback+'#/settings']);assert.equal(c.session.businessScope().state,'authenticated');
 const p=await signed();const ps=new URL(p.session.passwordURL('#/settings')).searchParams.get('state');
 assert.equal(await p.session.completeCallback(callback+'?'+new URLSearchParams({account:'deleted',state:ps}),()=>{}),null,'a password nonce cannot confirm a deletion');
 assert.equal(p.session.businessScope().state,'authenticated');
});

