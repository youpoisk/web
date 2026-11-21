import test from 'node:test';
import assert from 'node:assert/strict';
import { CodeExchange } from '../src/shared/auth/exchange.ts';
import { PendingFlow, FlowError } from '../src/shared/auth/flow.ts';
import { ApiError } from '../src/shared/api/client.ts';

const owner='00000000-0000-4000-8000-000000000001',epoch='00000000-0000-4000-8000-000000000002';
const other='00000000-0000-4000-8000-000000000003',sid='00000000-0000-4000-8000-000000000004';
const callback='https://web.example/',code='A'.repeat(43);
const credentials={access_token:'aaa.bbb.ccc',session_id:sid,user:{id:owner,login:'owner',name:'Owner',email:'owner@example.invalid'}};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json',...headers}});
const failure=kind=>error=>error instanceof ApiError&&error.kind===kind;
const envelope=(status=503,headers={},code='unavailable')=>json({code,message:'secret must not escape',field_errors:{},request_id:'wire-id'},status,headers);
async function fixture(fetch=async()=>json(credentials),options={}){
 const data=new Map(),env={scope:{owner:null,epoch},now:1000};
 const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const flow=new PendingFlow({storage,crypto:globalThis.crypto,clock:()=>env.now,scope:()=>env.scope,apiOrigin:'https://api.example',callback});
 const params=await flow.begin('login','#/watchlist');
 const url=callback+'?'+new URLSearchParams({code,state:params.get('state')});
 const transport=new CodeExchange({flow,fetch,...options});
 const clean=[];
 return{flow,data,env,url,transport,clean,run:signal=>transport.exchangeCallback(url,v=>clean.push(v),signal)};
}
test('exchange scrubs callback, omits cookie/bearer and returns credentials only bound to the pending scope',async()=>{
 let input;
 const f=await fixture(async(url,options)=>{assert.equal(url,'https://api.example/v1/auth/browser/exchange');input=JSON.parse(options.body);assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(new Headers(options.headers).has('Authorization'),false);assert.equal(new Headers(options.headers).has('Origin'),false);assert.equal(options.method,'POST');assert.equal(options.signal.aborted,false);return json(credentials)});
 const result=await f.run();assert.deepEqual(result.credentials,credentials);assert.deepEqual(result.scope,{owner:null,epoch});assert.equal(result.returnHash,'#/watchlist');assert.equal(input.authorization_code,code);assert.equal(input.redirect_uri,callback);assert.equal(input.state,result.state);assert.equal(input.code_verifier.length,43);
 assert.deepEqual(f.clean,[callback,callback+'#/watchlist']);assert.equal(f.flow.pendingSummary().state,result.state);
 const stored=[...f.data.values()].join();for(const secret of [code,credentials.access_token,credentials.user.email])assert.equal(stored.includes(secret),false);
 await assert.rejects(f.run(),e=>e instanceof FlowError&&e.kind==='pending');
 f.flow.acknowledge(result.state);assert.equal(f.flow.pendingSummary(),null);
});
test('ordinary navigation makes no request, invalid callbacks fail before fetch and configuration is bounded',async()=>{
 const f=await fixture(()=>{throw Error('must not fetch')});
 assert.equal(await f.transport.exchangeCallback(callback,()=>{}),null);
 await assert.rejects(f.transport.exchangeCallback(callback+'?code=bad&state=bad',()=>{}),e=>e instanceof FlowError);
 for(const timeoutMs of [0,120001,1.5,NaN])assert.throws(()=>new CodeExchange({flow:f.flow,timeoutMs}),failure('configuration'));
 assert.ok(new CodeExchange({flow:f.flow}));
 const fake={capture:()=>({code,pending:{verifier:'bad',callback,state:code}})};
 await assert.rejects(new CodeExchange({flow:fake}).exchangeCallback(callback,()=>{}),failure('invalid_input'));
});
test('HTTP failures are sanitized, remain pending and never trigger automatic replay',async()=>{
 for(const [headers,errorCode,requestId,retry] of [[{'X-Request-ID':'safe_id','Retry-After':'42'},'unavailable','safe_id',42],[{'X-Request-ID':'bad id','Retry-After':'tomorrow'},'UPPER','',null],[{},'unavailable','',null],[{},'x'.repeat(101),'',null]]){
  let calls=0;const f=await fixture(async()=>{calls++;return envelope(503,headers,errorCode)});
  await assert.rejects(f.run(),e=>e instanceof ApiError&&e.kind==='http'&&e.status===503&&e.requestId===requestId&&e.retryAfterSeconds===retry&&e.code===(errorCode==='UPPER'||errorCode.length>100?'':errorCode)&&!JSON.stringify(e).includes('secret'));
  assert.ok(f.flow.pendingSummary());await assert.rejects(f.run(),e=>e instanceof FlowError&&e.kind==='pending');assert.equal(calls,1);
 }
 for(const status of [401,403,409,429]){const f=await fixture(async()=>envelope(status));await assert.rejects(f.run(),e=>e.status===status);}
});
test('response shape, content type, UTF8, scalar Unicode and streaming bound fail closed',async()=>{
 const cases=[()=>json(credentials,201),()=>json({},500),()=>new Response(null,{status:200,headers:{'Content-Type':'application/json'}}),()=>new Response('{}'),()=>new Response('{}',{headers:{'Content-Type':'text/plain'}}),()=>new Response('bad',{headers:{'Content-Type':'application/json'}}),()=>new Response(Uint8Array.of(0xff),{headers:{'Content-Type':'application/json'}}),()=>json(null),()=>json({...credentials,refresh_token:'forbidden'}),()=>json({...credentials,access_token:'not a token'}),()=>json({...credentials,user:{...credentials.user,name:'\ud800'}}),()=>json({['\ud800']:null}),()=>json({arbitrary:[null,42]}),()=>new Response(' '.repeat(65537),{headers:{'Content-Type':'application/json'}})];
 for(const reply of cases){const f=await fixture(async()=>reply());await assert.rejects(f.run(),failure('protocol'));assert.ok(f.flow.pendingSummary());}
});
test('cancel, expiry and account changes during network or body read discard late credentials and failures',async()=>{
 for(const change of [f=>{f.env.scope={owner:other,epoch}},f=>{f.env.now+=16*60*1000},f=>{f.flow.cancel(f.flow.pendingSummary().state)}]){
  let release;const f=await fixture(()=>new Promise(r=>{release=r}));const pending=f.run();change(f);release(json(credentials));await assert.rejects(pending,failure('stale_session'));
 }
 let release;const f=await fixture(()=>new Promise((_,reject)=>{release=reject}));const pending=f.run();f.env.scope={owner:null,epoch:other};release(Error('network secret'));await assert.rejects(pending,failure('stale_session'));
 let stream;const g=await fixture(async()=>new Response(new ReadableStream({start(controller){stream=controller}}),{headers:{'Content-Type':'application/json'}}));const late=g.run();await new Promise(r=>setImmediate(r));g.env.scope={owner:other,epoch};stream.enqueue(new TextEncoder().encode(JSON.stringify(credentials)));stream.close();await assert.rejects(late,failure('stale_session'));
 const h=await fixture();h.env.scope={owner,epoch};h.flow.cancel(h.flow.pendingSummary().state);const params=await h.flow.begin('restore','#/');const wrong=new CodeExchange({flow:h.flow,fetch:async()=>json({...credentials,user:{...credentials.user,id:other}})});
 assert.equal((await wrong.exchangeCallback(callback+'?'+new URLSearchParams({code,state:params.get('state')}),()=>{})).credentials.user.id,other); // another account is legitimate
 const correct=new CodeExchange({flow:h.flow,fetch:async()=>json(credentials)});assert.equal((await correct.exchangeCallback(callback+'?'+new URLSearchParams({code,state:params.get('state')}),()=>{})).credentials.user.id,owner);
});
test('abort, timeout and network are distinct and uncertain attempts keep proof for explicit restart',async()=>{
 const aborted=new AbortController();aborted.abort();let calls=0;
 const f=await fixture(async()=>{calls++;return json(credentials)});await assert.rejects(f.run(aborted.signal),failure('aborted'));assert.equal(calls,0);assert.ok(await f.run());
 const network=await fixture(async()=>{throw Error('private network message')});await assert.rejects(network.run(),e=>failure('network')(e)&&!e.message.includes('private'));
 const waits=(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('abort')),{once:true}));
 const timed=await fixture(waits,{timeoutMs:2});await assert.rejects(timed.run(),failure('timeout'));
 const controller=new AbortController();const external=await fixture(waits);const pending=external.run(controller.signal);controller.abort();await assert.rejects(pending,failure('aborted'));
 let release;const after=await fixture(async()=>{await new Promise(r=>{release=r});return json(credentials)});const p=after.run();release();await p;
 const streamAbort=new AbortController();const bodyAbort=await fixture(async()=>{streamAbort.abort();return json(credentials)});await assert.rejects(bodyAbort.run(streamAbort.signal),failure('aborted'));
 const state=network.flow.pendingSummary().state;network.flow.cancel(state);assert.ok(await network.flow.begin('restore','#/watchlist'));
});
test('default transport calls the global fetch unbound, as browsers require',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=function(...args){if(this!==undefined&&this!==globalThis)throw new TypeError('Illegal invocation');return Promise.resolve(json(credentials))};
 try{const f=await fixture(undefined);const result=await f.run();assert.deepEqual(result.credentials,credentials);}finally{globalThis.fetch=original}
});
