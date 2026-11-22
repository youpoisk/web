import {schema_ExtensionCredentials,schema_Error} from '../../src/shared/api/validators.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const REFRESH=/^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/;
export class AuthError extends Error{constructor(kind,status=0){super('Extension auth '+kind);this.kind=kind;this.status=status;}}
/** Worker-only session coordinator. Its public results never contain credentials. */
export function createSession({origin,store,fetch:send=globalThis.fetch,crypto=globalThis.crypto,clock=()=>Date.now()}){
 let url;try{url=new URL(origin);}catch{throw new AuthError('configuration');}
 if(url.origin!==origin||url.username||url.password||url.search||url.hash||!(url.protocol==='https:'||(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname))))throw new AuthError('configuration');
 let record,access=null,user=null,until=0,tail=Promise.resolve();
 const exclusive=fn=>{const pending=tail.then(fn);tail=pending.catch(()=>{});return pending;};
 const snapshot=()=>({state:record?.refresh?'authenticated':record?.owner?'session-expired':'guest',owner:record?.owner??null,epoch:record?.epoch??null,user:user?{id:user.id,login:user.login,name:user.name}:null});
 async function load(){
  if(record!==undefined)return;
  let value;try{value=await store.load();}catch{throw new AuthError('storage');}
  if(value!==null&&(!value||value.version!==1||!UUID.test(value.owner)||!UUID.test(value.epoch)||!UUID.test(value.session)|| (value.refresh!==null&&!REFRESH.test(value.refresh)) ||Object.keys(value).some(k=>!['version','owner','epoch','session','refresh','attempt'].includes(k)) ||(value.attempt&&(!UUID.test(value.attempt.id)||!/^[A-Za-z0-9_-]{43}$/.test(value.attempt.proof)||Object.keys(value.attempt).some(k=>!['id','proof'].includes(k))))))throw new AuthError('storage');
  record=value;
 }
 async function persist(value){try{await store.save(value);}catch{throw new AuthError('storage');}record=value;}
 async function http(path,body,bearer){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await send(origin+path,{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json',Accept:'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})},credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});
   if(response.status===204){if((await response.text())!=='')throw new AuthError('protocol');return {status:204,data:null};}
   const reader=response.body?.getReader();let length=0;const chunks=[];
   if(!reader)throw new AuthError('protocol');
   try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>262144){await reader.cancel();throw new AuthError('protocol');}chunks.push(value);}}finally{reader.releaseLock();}
   if(!/^application\/json(?:\s*;|$)/i.test(response.headers.get('Content-Type')??''))throw new AuthError('protocol');
   const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   let data;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new AuthError('protocol');}
   if(response.status!==200&&!schema_Error(data))throw new AuthError('protocol');
   return {status:response.status,data};
  }catch(error){if(error instanceof AuthError)throw error;throw new AuthError(controller.signal.aborted?'timeout':'network');}finally{clearTimeout(timer);}
 }
 function checked(reply){if(reply.status!==200)throw new AuthError('http',reply.status);if(!schema_ExtensionCredentials(reply.data))throw new AuthError('protocol');return reply.data;}
 async function expire(){const next=record?{...record,refresh:null}:null;if(next)delete next.attempt;await persist(next);access=null;user=null;until=0;}
 function randomProof(){return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
 async function ensure(){
  await load();if(!record?.refresh)throw new AuthError('authentication');if(access&&clock()<until)return;
  if(!record.attempt)await persist({...record,attempt:{id:crypto.randomUUID(),proof:randomProof()}});
  const reply=await http('/v1/auth/refresh',{client_type:'extension',refresh_token:record.refresh,attempt_id:record.attempt.id,attempt_proof:record.attempt.proof});
  if([401,409].includes(reply.status)){await expire();throw new AuthError('authentication',reply.status);}
  const data=checked(reply);if(data.user.id!==record.owner||data.session_id!==record.session)throw new AuthError('protocol');
  await persist({version:1,owner:record.owner,epoch:record.epoch,session:record.session,refresh:data.refresh_token});access=data.access_token;user=data.user;until=clock()+10*60*1000;
 }
 return {
  status:()=>exclusive(async()=>{await load();if(record?.refresh){try{await ensure();}catch(error){if(error.kind==='authentication')return snapshot();throw error;}}return snapshot();}),
  login:(login,password)=>exclusive(async()=>{
   if(typeof login!=='string'||!login.trim()||login.length>254||typeof password!=='string'||!password||new TextEncoder().encode(password).length>1024)throw new AuthError('input');
   await load();if(record?.refresh)throw new AuthError('already_authenticated');
   const data=checked(await http('/v1/auth/login',{client_type:'extension',login,password}));
   const next={version:1,owner:data.user.id,epoch:crypto.randomUUID(),session:data.session_id,refresh:data.refresh_token};
   try{await persist(next);}catch{try{await http('/v1/auth/logout',{},data.access_token);}catch{}throw new AuthError('storage');}
   access=data.access_token;user=data.user;until=clock()+10*60*1000;return snapshot();
  }),
  logout:()=>exclusive(async()=>{await load();if(!record?.refresh){await persist(null);access=null;user=null;return snapshot();}await ensure();const reply=await http('/v1/auth/logout',{},access);if(reply.status!==204&&reply.status!==401)throw new AuthError('http',reply.status);await persist(null);access=null;user=null;until=0;return snapshot();}),
  /** Internal worker transport hook: never expose this function over runtime. */
  authorize:fn=>exclusive(async()=>{await ensure();const captured=record.epoch;let result=await fn(access,{owner:record.owner,epoch:captured});if(result?.status===401){access=null;until=0;await ensure();result=await fn(access,{owner:record.owner,epoch:captured});if(result?.status===401){await expire();throw new AuthError('authentication',401);}}if(record?.epoch!==captured)throw new AuthError('stale');return result;})
 };
}
