// Runs only in an isolated Firefox QA build, never in a shipped package.
export default async function browserProbe(report,originReport,options){
 let result={ok:false,stage:'login',origin:new URL(browser.runtime.getURL('')).origin};
 let active=session,card,originalState,originalReview;
 async function api(path,method='GET',body,headers={}){
  const response=await active.authorize(async token=>{
   const r=await fetch(YPConfig.apiOrigin+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)});
   return {status:r.status,data:await r.json()};
  });
  if(response.status!==200)throw Object.assign(Error('QA API failed'),{status:response.status});return response.data;
 }
 try{
  const setup=await fetch(originReport,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:result.origin}),signal:AbortSignal.timeout(30000)});if(!setup.ok)throw Error('Test origin setup failed');
  const signed=await active.login('qa_block_probe','qa_block_probe');if(signed.state!=='authenticated')throw Error('Invalid login');
  const record=await YPStorageFirefox.read('yp-auth-v1');const registered=await fetch(options.sessionReport,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner:record.owner,session:record.session})});if(!registered.ok)throw Error('QA recovery registration failed');
  result.stage='restore-session';
  active=YPAuth.createSession({origin:YPConfig.apiOrigin,store:{load:()=>YPStorageFirefox.read('yp-auth-v1'),save:value=>YPStorageFirefox.write(value,'yp-auth-v1')}});
  const resumed=await active.status();if(resumed.owner!==signed.owner||resumed.epoch!==signed.epoch)throw Error('Restored wrong owner');
  result.stage='read';
  card=await api('/v1/videos/by-youtube/p0iTgHMEoi4');originalState=(await api('/v1/me/videos/'+card.id+'/state')).state;originalReview=(await api('/v1/me/videos/'+card.id+'/review')).review;
  const backend=YPAuth.createBackend({session:active,storage:YPStorageFirefox,origin:YPConfig.apiOrigin});
  result.stage='write';const rating=originalState.rating===8?9:8;
  await backend.update({id:card.youtube_video_id,title:card.title},{rating});
  await backend.update({id:card.youtube_video_id,title:card.title},{review:'Проверка сохранения из Firefox.'});
  const current=await backend.current(card.youtube_video_id);
  if(current.videos[card.youtube_video_id].rating!==rating||current.videos[card.youtube_video_id].review!=='Проверка сохранения из Firefox.')throw Error('Server write mismatch');
  if(options.controlled){await fetch(options.writtenReport,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});await new Promise(()=>{});}
  result.ok=true;result.stage='done';
 }catch(error){result.kind=error.kind??'error';result.status=error.status??0;}
 finally{
  try{
   if(card&&originalState&&originalReview){
    const {lease}=await api('/v1/me/offline-lease');
    const latestReview=(await api('/v1/me/videos/'+card.id+'/review')).review;
    await api('/v1/me/videos/'+card.id+'/review','PUT',{expected_revision:latestReview.revision,text:originalReview.text},{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease});
    const latest=(await api('/v1/me/videos/'+card.id+'/state')).state;
    await api('/v1/me/videos/'+card.id+'/state','PATCH',{expected_revision:latest.revision,rating:originalState.rating,later:originalState.later,added:originalState.added,mark:originalState.mark??null},{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease});
    result.restored=true;
   }
  }catch{result.ok=false;result.stage='restore-fixture';}
  try{await active.logout();}catch{result.ok=false;result.stage='logout';}
  await fetch(report,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result),signal:AbortSignal.timeout(10000)});
 }
}
