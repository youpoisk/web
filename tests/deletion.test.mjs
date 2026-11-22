import{test}from'node:test';import assert from'node:assert/strict';
import{deferDeletion}from'../src/shared/library/deletion.ts';
test('deletion waits five seconds and executes at most once',()=>{let callback,calls=0;const cancel=deferDeletion(()=>calls++,(cb,ms)=>{assert.equal(ms,5000);callback=cb;return 7;},timer=>assert.equal(timer,7));assert.equal(calls,0);callback();callback();assert.equal(calls,1);cancel();assert.equal(calls,1);});
test('cancel and cleanup prevent even a late queued deletion callback',()=>{let callback,calls=0;const cancel=deferDeletion(()=>calls++,(cb)=>{callback=cb;return 7;},()=>{});cancel();callback();assert.equal(calls,0);});
test('default scheduler is cancelled before deleting',()=>{const cancel=deferDeletion(()=>assert.fail('cancelled deletion ran'));cancel();});
