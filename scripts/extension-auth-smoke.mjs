// Local real-API smoke. Creates and revokes a dedicated native extension session;
// it never replaces QA E2E's web session or writes ratings/reviews.
import {createSession} from '../extension/auth/session.mjs';
let value=null;const config={origin:'http://127.0.0.1:18080',store:{async load(){return structuredClone(value)},async save(record){value=structuredClone(record)}}};
let session=createSession(config);
try{
 const login=await session.login('qa_e2e_auth','qa_e2e_auth');
 if(login.state!=='authenticated'||JSON.stringify(login).includes('refresh_token'))throw Error('Unsafe login state');
 session=createSession(config);const restored=await session.status();
 if(restored.owner!==login.owner||restored.epoch!==login.epoch)throw Error('Owner mismatch after restart');
 const me=await session.authorize(async token=>{const response=await fetch(config.origin+'/v1/me',{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(15000)});return {status:response.status,body:await response.json()};});
 if(me.status!==200||me.body.id!==login.owner)throw Error('Wrong authenticated user');
 await session.logout();if(value!==null)throw Error('Logout retained credentials');
 console.log('PASS extension login, worker restart/refresh, owner-bound API request and logout; web session preserved');
}finally{if(value?.refresh)await createSession(config).logout();}
