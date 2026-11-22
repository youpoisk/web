import test from 'node:test';
import assert from 'node:assert/strict';
import{watchMore}from'../src/shared/library/infinite.ts';
test('intersection loads once, ignores false/duplicate/late notifications and disconnects',()=>{
 const target={};let notify,observed,reads=0,disconnected=0;
 const dispose=watchMore(target,()=>reads++,callback=>{notify=callback;return{observe:node=>{observed=node},disconnect:()=>disconnected++}});
 assert.equal(observed,target);notify(false);assert.equal(reads,0);notify(true);notify(true);notify(false);assert.equal(reads,1);
 dispose();notify(true);assert.equal(reads,1);assert.equal(disconnected,1);
});
test('disposing before an intersection prevents a late request; a new page gets its own observer',()=>{
 let notify,reads=0;
 const factory=callback=>{notify=callback;return{observe:()=>{},disconnect:()=>{}}};
 const dispose=watchMore({},()=>reads++,factory);dispose();notify(true);assert.equal(reads,0);
 const next=watchMore({},()=>reads++,factory);notify(true);assert.equal(reads,1);next();
});
