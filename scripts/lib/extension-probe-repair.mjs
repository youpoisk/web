// Host-owned QA cleanup survives destruction of the Firefox test process.
export function createProbeRepair({request,logout,owner,recoverySession}){
 let card,state,review,testSession;
 return {
  async prepare(){card=await request('getVideoCardByYoutube',{path:{youtube_id:'p0iTgHMEoi4'}});state=(await request('getVideoState',{path:{id:card.id}})).state;review=(await request('getVideoReview',{path:{id:card.id}})).review;},
  register(value){if(value.owner!==owner||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.session)||value.session===recoverySession)throw Error('Invalid QA browser session');testSession=value.session;},
  async repair(){
   try{
    if(card&&state&&review){
     const {lease}=await request('issueOfflineLease');
     const currentReview=(await request('getVideoReview',{path:{id:card.id}})).review;
     if(currentReview.text!==review.text)await request('putVideoReview',{path:{id:card.id},header:{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease},body:{expected_revision:currentReview.revision,text:review.text}});
     const current=(await request('getVideoState',{path:{id:card.id}})).state;
     const before={rating:state.rating,later:state.later,added:state.added,mark:state.mark??null};
     if(JSON.stringify({...before,rating:current.rating,later:current.later,added:current.added,mark:current.mark??null})!==JSON.stringify(before))await request('patchVideoState',{path:{id:card.id},header:{'Idempotency-Key':crypto.randomUUID(),'X-Offline-Lease':lease},body:{expected_revision:current.revision,...before}});
     const verified=(await request('getVideoState',{path:{id:card.id}})).state,verifiedReview=(await request('getVideoReview',{path:{id:card.id}})).review;
     if(verifiedReview.text!==review.text||Object.entries(before).some(([key,value])=>(verified[key]??null)!==value))throw Error('QA fixture restoration mismatch');
    }
   }finally{try{if(testSession)try{await request('revokeSession',{path:{id:testSession}});}catch(error){if(error.status!==404)throw error;}}finally{await logout();}}
  }
 };
}
