import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {IDBFactory,IDBObjectStore} from 'fake-indexeddb';
function idb(){const context={indexedDB:new IDBFactory()};vm.createContext(context);vm.runInContext(readFileSync(new URL('../storage-idb.js',import.meta.url),'utf8'),context);return context.YPStorageIDB;}
test('v2 migration is atomic, repeatable and never overwrites newer IDB values or legacy data',async()=>{
 const s=idb();const legacy={version:1,videos:{old:{rating:7}}};await s.write(legacy,'yp-library-v1');await s.write({key:'new'},'yp-operation-v1:existing');await s.migrate([['yp-operation-v1:existing',{key:'old'}],['yp-operation-v1:copy',{key:'copy'}]]);assert.equal((await s.read('yp-layout-v2')).version,2);assert.equal((await s.read('yp-operation-v1:existing')).key,'new');assert.equal((await s.read('yp-operation-v1:copy')).key,'copy');assert.equal(JSON.stringify(await s.read('yp-library-v1')),JSON.stringify(legacy));await s.migrate([['yp-operation-v1:copy',{key:'do not repeat'}]]);assert.equal((await s.read('yp-operation-v1:copy')).key,'copy');
});
test('quota failure rolls back both migration marker and pending-record copies; retry is safe',async()=>{
 const s=idb(),original=IDBObjectStore.prototype.put;let puts=0;
 IDBObjectStore.prototype.put=function(...args){if(++puts===2)throw new DOMException('simulated quota','QuotaExceededError');return original.apply(this,args);};
 try{await assert.rejects(s.migrate([['pending',{body:{rating:null,later:false}}]]));}finally{IDBObjectStore.prototype.put=original;}
 assert.equal(await s.read('yp-layout-v2'),null);assert.equal(await s.read('pending'),null);await s.migrate([['pending',{body:{rating:null,later:false}}]]);assert.equal((await s.read('pending')).body.later,false);assert.equal((await s.read('yp-layout-v2')).version,2);
});
test('canonical cache and outbox acknowledgement commit atomically on quota failure',async()=>{
 const s=idb();await s.write({key:'operation'},'pending');await s.write({rating:7},'cache');const original=IDBObjectStore.prototype.put;let puts=0;IDBObjectStore.prototype.put=function(...args){if(++puts===2)throw new DOMException('simulated quota','QuotaExceededError');return original.apply(this,args);};
 try{await assert.rejects(s.commit([['cache',{rating:8}],['pending',null]]));}finally{IDBObjectStore.prototype.put=original;}
 assert.equal((await s.read('cache')).rating,7);assert.equal((await s.read('pending')).key,'operation');await s.commit([['cache',{rating:8}],['pending',null]]);assert.equal((await s.read('cache')).rating,8);assert.equal(await s.read('pending'),null);
});
test('unknown layout refuses migration and account facade waits for source snapshot',async()=>{
 const s=idb();await s.write({version:99},'yp-layout-v2');await assert.rejects(s.migrate([]));assert.equal((await s.read('yp-layout-v2')).version,99);
 const fresh=idb();let release;const waiting=new Promise(resolve=>{release=resolve});const account=fresh.accountStore(()=>waiting);let done=false;const read=account.read('pending').then(value=>{done=true;return value});await Promise.resolve();assert.equal(done,false);release([['pending',{key:'original'}]]);assert.equal((await read).key,'original');await account.commit([['cache',{rating:6}],['pending',null]]);assert.equal(await account.read('pending'),null);
});
test('Chrome legacy pending snapshot is read only after TRUSTED_CONTEXTS guard and excludes auth',async()=>{
 let release,getCalls=0;const guard=new Promise(resolve=>{release=resolve});const db={'yp-auth-v1':{refresh:'secret'},'yp-library-v1':{videos:{}},'yp-operation-v1:owner:state:target':{key:'operation'}};const context={chrome:{storage:{local:{setAccessLevel:()=>guard,async get(){getCalls++;return db},async set(){}}}}};vm.createContext(context);vm.runInContext(readFileSync(new URL('../storage-chrome.js',import.meta.url),'utf8'),context);const pending=context.YPStorageChrome.entries('yp-operation-v1:');await Promise.resolve();assert.equal(getCalls,0);release();const entries=await pending;assert.equal(entries.length,1);assert.equal(entries[0][0],'yp-operation-v1:owner:state:target');
});

test('canonical receipts never roll back a newer cached revision while pending removal remains atomic',async()=>{
 const s=idb();const key='yp-canonical-v2:owner:video_state:target';await s.write({version:2,revision:9,value:{rating:9}},key);await s.write({key:'old command'},'pending');await s.commit([[key,{version:2,revision:8,value:{rating:8}}],['pending',null]]);assert.equal((await s.read(key)).revision,9);assert.equal((await s.read(key)).value.rating,9);assert.equal(await s.read('pending'),null);
});

test('multiple receipts in one transaction keep the highest revision and corrupt cache cannot clear pending',async()=>{
 const s=idb(),key='yp-canonical-v2:owner:video_state:target';await s.commit([[key,{version:2,revision:9,value:{rating:9}}],[key,{version:2,revision:8,value:{rating:8}}]]);assert.equal((await s.read(key)).revision,9);await s.write({version:99,revision:10},key);await s.write({key:'operation'},'pending');await assert.rejects(s.commit([[key,{version:2,revision:11}],['pending',null]]));assert.equal((await s.read('pending')).key,'operation');
});
