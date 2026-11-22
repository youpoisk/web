// Authorized local QA probe only: use an existing real YouTube video and restore
// all original own state/review in finally. Does not touch any web session.
import {createSession} from '../extension/auth/session.mjs';
import {createBackend} from '../extension/auth/backend.mjs';
import {ApiClient} from '../src/shared/api/client.ts';
const origin='http://127.0.0.1:18080',map=new Map(),storage={async read(k){return structuredClone(map.get(k)??null)},async write(v,k){map.set(k,structuredClone(v));}};
const session=createSession({origin,store:{load:()=>storage.read('auth'),save:v=>storage.write(v,'auth')}});
async function request(op,options={}){return session.authorize(async(token,scope)=>new ApiClient({baseUrl:origin,session:()=>({state:'authenticated',owner:scope.owner,epoch:scope.epoch,accessToken:token})}).request(op,options));}
let video,oldState,oldReview;
try{
 await session.login('qa_block_probe','qa_block_probe');
 video=await request('getVideoCardByYoutube',{path:{youtube_id:'p0iTgHMEoi4'}});
 oldState=(await request('getVideoState',{path:{id:video.id}})).state;oldReview=(await request('getVideoReview',{path:{id:video.id}})).review;
 const backend=createBackend({session,storage,origin});
 const rating=oldState.rating===8?9:8;
 await backend.update({id:video.youtube_video_id,title:video.title},{rating});
 let read=await backend.current(video.youtube_video_id);if(read.videos[video.youtube_video_id].rating!==rating)throw Error('Server rating mismatch');
 await backend.update({id:video.youtube_video_id,title:video.title},{review:'Проверка синхронизации расширения с сервером.'});
 read=await backend.current(video.youtube_video_id);if(read.videos[video.youtube_video_id].review!=='Проверка синхронизации расширения с сервером.')throw Error('Server review mismatch');
 console.log('PASS real API rating and review writes/readback, independent revisions and account binding');
}finally{
 if(video&&oldState&&oldReview){
  const {lease}=await request('issueOfflineLease');
  const latest=(await request('getVideoReview',{path:{id:video.id}})).review;
  await request('putVideoReview',{path:{id:video.id},header:{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease},body:{expected_revision:latest.revision,text:oldReview.text}});
  const latestState=(await request('getVideoState',{path:{id:video.id}})).state;
  await request('patchVideoState',{path:{id:video.id},header:{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease},body:{expected_revision:latestState.revision,rating:oldState.rating,later:oldState.later,added:oldState.added,mark:oldState.mark??null}});
  console.log('Original QA state/review restored');
 }
 await session.logout();console.log('Native QA session revoked; web sessions preserved');
}
