import test from 'node:test';
import assert from 'node:assert/strict';
import {createProbeRepair} from '../../scripts/lib/extension-probe-repair.mjs';
test('host repairs mutations and revokes browser session after browser termination',async()=>{
 const owner='owner',sid='00000000-0000-4000-8000-000000000001';let state={revision:1,rating:null,later:false,added:false},review={revision:2,text:null},closed=false,revoked=false;
 const request=async(op,o={})=>{
  if(op==='getVideoCardByYoutube')return {id:'video'};
  if(op==='getVideoState')return {state:{...state}};
  if(op==='getVideoReview')return {review:{...review}};
  if(op==='issueOfflineLease')return {lease:'lease'};
  if(op==='patchVideoState'){assert.equal(o.body.expected_revision,state.revision);const {expected_revision,...patch}=o.body;state={...patch,revision:state.revision+1};return {state};}
  if(op==='putVideoReview'){assert.equal(o.body.expected_revision,review.revision);review={text:o.body.text,revision:review.revision+1};return {review};}
  if(op==='revokeSession'){assert.equal(o.path.id,sid);revoked=true;return;}
  throw Error('Unexpected operation');
 };
 const repair=createProbeRepair({request,owner,recoverySession:'host',logout:async()=>{closed=true}});await repair.prepare();repair.register({owner,session:sid});state={...state,revision:3,rating:9,later:true,added:true};review={revision:4,text:'Interrupted browser write'};await repair.repair();assert.equal(state.rating,null);assert.equal(state.later,false);assert.equal(state.added,false);assert.equal(review.text,null);assert.equal(revoked,true);assert.equal(closed,true);
});
test('host rejects foreign-session registration and still closes recovery session on restore failure',async()=>{
 let loggedOut=false;const repair=createProbeRepair({owner:'qa',recoverySession:'host',request:async()=>{throw Error('offline')},logout:async()=>{loggedOut=true}});assert.throws(()=>repair.register({owner:'other',session:'00000000-0000-4000-8000-000000000001'}));await repair.repair();assert.equal(loggedOut,true);
});
