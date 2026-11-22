import{test}from'node:test';import assert from'node:assert/strict';
import{deferDeletion,DEFERRED_DELETE_MS}from'../src/shared/library/deletion.ts';
test('deletion waits three seconds and executes at most once',()=>{assert.equal(DEFERRED_DELETE_MS,3000);let callback,calls=0;const cancel=deferDeletion(()=>calls++,(cb,ms)=>{assert.equal(ms,3000);callback=cb;return 7;},timer=>assert.equal(timer,7));assert.equal(calls,0);callback();callback();assert.equal(calls,1);cancel();assert.equal(calls,1);});
test('cancel and cleanup prevent even a late queued deletion callback',()=>{let callback,calls=0;const cancel=deferDeletion(()=>calls++,(cb)=>{callback=cb;return 7;},()=>{});cancel();callback();assert.equal(calls,0);});
test('default scheduler is cancelled before deleting',()=>{const cancel=deferDeletion(()=>assert.fail('cancelled deletion ran'));cancel();});
