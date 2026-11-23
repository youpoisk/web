import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,AuthError} from '../auth/session.mjs';
const owner='00000000-0000-4000-8000-000000000001',sid='00000000-0000-4000-8000-000000000002';
const credentials=(n=0)=>({user:{id:owner,login:'qa_owner',name:'Owner',email:'qa@example.invalid'},access_token:'access-'+n,session_id:sid,refresh_token:sid+'.'+(n?'B':'A').repeat(42)+'A'});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const fail=(status)=>json({code:'unavailable',message:'do not leak',request_id:'request',field_errors:{}},status);
function fixture(fetch){let saved=null,now=0,writes=[];const store={async load(){return structuredClone(saved)},async save(value){saved=structuredClone(value);writes.push(saved)}};const config={origin:'http://127.0.0.1:18080',store,fetch,clock:()=>now};return {session:()=>createSession(config),store,writes,record:()=>saved,tick(){now+=11*60*1000;}};}
test('extension login sends credentials only to fixed API and never stores password/access/profile',async()=>{
 const f=fixture(async(url,init)=>{assert.equal(url,'http://127.0.0.1:18080/v1/auth/login');assert.equal(init.credentials,'omit');assert.equal(init.redirect,'error');assert.equal(init.referrerPolicy,'no-referrer');assert.deepEqual(JSON.parse(init.body),{client_type:'extension',login:'qa_owner',password:'private-password'});return json(credentials());});
 const s=f.session();assert.equal((await s.status()).state,'guest');const view=await s.login('qa_owner','private-password');assert.equal(view.owner,owner);assert.equal(view.user.login,'qa_owner');for(const value of [view,f.record()]){const wire=JSON.stringify(value);assert.equal(wire.includes('private-password'),false);assert.equal(wire.includes('access-0'),false);assert.equal(wire.includes('@example'),false);}assert.ok(f.record().refresh);await assert.rejects(s.login('another','password'),e=>e.kind==='already_authenticated');
});
test('worker restart rotates through durable attempt, refresh is single flight, owner/session remain bound',async()=>{
 let calls=0;const f=fixture(async(url,init)=>{if(url.endsWith('/login'))return json(credentials());calls++;const body=JSON.parse(init.body);assert.equal(body.attempt_id,f.record().attempt.id);assert.equal(body.attempt_proof,f.record().attempt.proof);assert.equal(body.refresh_token,credentials().refresh_token);return json(credentials(1));});
 await f.session().login('qa_owner','password');const resumed=f.session();const states=await Promise.all([resumed.status(),resumed.status()]);assert.equal(calls,1);assert.equal(states[0].epoch,states[1].epoch);assert.equal(f.record().attempt,undefined);assert.equal(f.record().refresh,credentials(1).refresh_token);
});
test('lost refresh response and lost rotated-token storage commit replay the exact durable attempt',async()=>{
 let requests=[],loseNetwork=true,loseStore=false;const f=fixture(async(url,init)=>{if(url.endsWith('/login'))return json(credentials());requests.push(JSON.parse(init.body));if(loseNetwork){loseNetwork=false;throw Error('private');}return json(credentials(1));});
 await f.session().login('qa_owner','password');const resumed=f.session();await assert.rejects(resumed.status(),e=>e.kind==='network');const pending=f.record();const original=f.store.save;f.store.save=async value=>{if(!value?.attempt&&!loseStore){loseStore=true;throw Error('disk');}return original(value);};await assert.rejects(resumed.status());assert.deepEqual(f.record(),pending);await f.session().status();assert.equal(requests.length,3);assert.deepEqual(requests[0],requests[1]);assert.deepEqual(requests[1],requests[2]);assert.equal(f.record().attempt,undefined);
});
test('expired session loses credentials but retains owner boundary; transient errors do not logout',async()=>{
 let status=503;const f=fixture(async url=>url.endsWith('/login')?json(credentials()):fail(status));await f.session().login('qa_owner','password');const resumed=f.session();await assert.rejects(resumed.status(),e=>e.status===503);assert.ok(f.record().refresh);status=401;const view=await resumed.status();assert.equal(view.state,'session-expired');assert.equal(view.owner,owner);assert.equal(f.record().refresh,null);assert.equal(f.record().attempt,undefined);
});
test('unexpected refresh owner is rejected, logout confirms server revocation and then clears storage',async()=>{
 let revoke=false;const f=fixture(async url=>{if(url.endsWith('/login'))return json(credentials());if(url.endsWith('/logout')){revoke=true;return new Response(null,{status:204});}return json({...credentials(1),user:{...credentials().user,id:sid}});});const s=f.session();await s.login('qa_owner','password');f.tick();await assert.rejects(s.status(),e=>e.kind==='protocol');assert.ok(f.record().refresh);
 const g=fixture(async url=>url.endsWith('/login')?json(credentials()):new Response(null,{status:204}));const signed=g.session();await signed.login('qa_owner','password');assert.equal((await signed.logout()).state,'guest');assert.equal(g.record(),null);assert.equal((await signed.logout()).state,'guest');assert.equal(revoke,false);
});
test('login storage failure revokes issued session and never commits a false authenticated state',async()=>{
 let revoked=false;const f=fixture(async url=>url.endsWith('/login')?json(credentials()):(revoked=true,new Response(null,{status:204})));f.store.save=async()=>{throw Error('quota')};await assert.rejects(f.session().login('qa_owner','password'),e=>e.kind==='storage');assert.equal(revoked,true);assert.equal(f.record(),null);
});
test('configuration, bounded body, malformed credentials and storage are rejected without disclosure',async()=>{
 for(const origin of ['https://user:pass@api.example','http://remote.example','https://api.example/path','https://api.example?x=1'])assert.throws(()=>createSession({origin}),e=>e.kind==='configuration');
 for(const response of [json({}),new Response('oops'),new Response(new Uint8Array(262145),{headers:{'Content-Type':'application/json'}}),fail(403)]){const f=fixture(async()=>response);await assert.rejects(f.session().login('qa_owner','password'),e=>e instanceof AuthError);}
 const f=fixture(async()=>json(credentials()));await assert.rejects(f.session().login('','x'),e=>e.kind==='input');f.store.load=async()=>({version:1,owner:'bad'});await assert.rejects(f.session().status(),e=>e.kind==='storage');
});

test('worker business calls refresh once on401, never403, and expire on repeated401',async()=>{
 let refreshes=0;const f=fixture(async url=>{if(url.endsWith('/login'))return json(credentials());refreshes++;return json(credentials(1));});const s=f.session();await s.login('qa_owner','password');let calls=0;const value=await s.authorize(async(token,scope)=>{assert.equal(scope.owner,owner);calls++;return {status:calls===1?401:200,token};});assert.equal(value.status,200);assert.equal(calls,2);assert.equal(refreshes,1);await s.authorize(async()=>({status:403}));assert.equal(refreshes,1);await assert.rejects(s.authorize(async()=>({status:401})),e=>e.kind==='authentication');assert.equal(f.record().refresh,null);
});

test('offline peek reveals only safe local identity and never authorizes a business request',async()=>{
 let calls=0,status=503;const f=fixture(async url=>{calls++;if(url.endsWith('/login'))return json(credentials());return fail(status)});await f.session().login('qa_owner','password');const resumed=f.session(),peek=await resumed.peek();assert.equal(calls,1);assert.equal(peek.state,'authenticated');assert.equal(peek.owner,owner);assert.equal(JSON.stringify(peek).includes('refresh'),false);assert.equal(JSON.stringify(peek).includes('access-'),false);let business=0;await assert.rejects(resumed.authorize(async()=>{business++;return {status:200}}));assert.equal(business,0);assert.equal((await resumed.peek()).state,'authenticated');status=401;assert.equal((await resumed.status()).state,'session-expired');assert.equal((await resumed.peek()).state,'session-expired');
});
