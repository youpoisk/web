import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {IDBFactory,IDBObjectStore,IDBKeyRange,IDBCursor} from 'fake-indexeddb';
function idb(){const context={indexedDB:new IDBFactory(),IDBKeyRange};vm.createContext(context);vm.runInContext(readFileSync(new URL('../storage-idb.js',import.meta.url),'utf8'),context);return context.YPStorageIDB;}
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

test('private outbox pages exclude auth, other accounts and acknowledged null rows',async()=>{
 const s=idb(),prefix='yp-operation-v1:owner-A:';await s.write({refresh:'never return'},'yp-auth-v1');await s.write({owner:'B'},'yp-operation-v1:owner-B:one');
 for(let i=0;i<15;i++)await s.write({owner:'A',index:i},prefix+String(i).padStart(2,'0'));
 await s.write(null,prefix+'03');const account=s.accountStore();const first=await account.entries(prefix);assert.equal(first.items.length,12);assert.ok(first.next);assert.equal(first.items.some(([,v])=>v.index===3),false);
 const second=await account.entries(prefix,{after:first.next});assert.equal(second.items.length,2);assert.equal(second.next,null);assert.equal(new Set([...first.items,...second.items].map(([key])=>key)).size,14);
 assert.equal(JSON.stringify([...first.items,...second.items]).includes('never return'),false);await assert.rejects(account.entries('yp-auth-v1'));await assert.rejects(account.entries(prefix,{after:'yp-operation-v1:owner-B:one'}));await assert.rejects(account.entries(prefix,{limit:0}));
});

test('quota abort cannot commit only one half of a 429 command/account deadline',async()=>{
 const s=idb(),slot='yp-operation-v1:owner:state:target',key='yp-rate-limit-v1:owner';await s.write({nextAttemptAt:5000},slot);const original=IDBObjectStore.prototype.put;let puts=0;IDBObjectStore.prototype.put=function(...args){if(++puts===2)throw new DOMException('quota','QuotaExceededError');return original.apply(this,args)};
 try{await assert.rejects(s.commit([[slot,{nextAttemptAt:120000}],[key,{until:120000}]]));}finally{IDBObjectStore.prototype.put=original;}
 assert.equal((await s.read(slot)).nextAttemptAt,5000);assert.equal(await s.read(key),null);await s.commit([[slot,{nextAttemptAt:120000}],[key,{until:120000}]]);assert.equal((await s.read(slot)).nextAttemptAt,(await s.read(key)).until);
});

test('bounded resumable generation GC keeps active/staging, other owners and all outbox data',async()=>{
 const s=idb(),owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',prefix='yp-generation-v2:'+owner+':';await s.write({generation:'active'},'yp-sync-v2:'+owner);await s.write({id:'staging'},'yp-sync-progress-v2:'+owner);
 for(const generation of ['abandoned','active','staging','old'])for(let i=0;i<5;i++)await s.write({text:generation},prefix+generation+':video_review:'+i);
 const pending='yp-operation-v1:'+owner+':pending',foreign='yp-generation-v2:'+other+':old:video_review:1';await s.write({key:'original'},pending);await s.write({text:'other'},foreign);
 let passes=0,result;do{result=await s.accountStore().pruneGenerations(owner,{limit:3});passes++;assert.ok(passes<20)}while(!result.done);
 assert.ok(passes>1);for(let i=0;i<5;i++){assert.equal(await s.read(prefix+'old:video_review:'+i),null);assert.equal(await s.read(prefix+'abandoned:video_review:'+i),null);assert.equal((await s.read(prefix+'active:video_review:'+i)).text,'active');assert.equal((await s.read(prefix+'staging:video_review:'+i)).text,'staging');}
 assert.equal((await s.read(pending)).key,'original');assert.equal((await s.read(foreign)).text,'other');await s.commit([['yp-sync-v2:'+owner,{generation:'staging'}],['yp-sync-progress-v2:'+owner,null]]);do{result=await s.pruneGenerations(owner,{limit:3})}while(!result.done);assert.equal(await s.read(prefix+'active:video_review:0'),null);assert.equal((await s.read(prefix+'staging:video_review:0')).text,'staging');
});

test('explicit queue resume changes only own epoch; discard leaves source, receipts and other owners intact',async()=>{
 const s=idb(),a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',epoch='33333333-3333-4333-8333-333333333333';const op='yp-operation-v1:'+a+':state:target',intent='yp-intent-v1:'+a+':video:state',other='yp-operation-v1:'+b+':state:target',receipt='yp-receipt-v1:'+a+':key';const original={version:1,owner:a,epoch:'old',key:'original',body:{rating:8},lease:'original-lease',state:'pending'};await s.write(original,op);await s.write({version:1,owner:a,epoch:'old',patch:{rating:null}},intent);await s.write({owner:b,epoch:'old'},other);await s.write({revision:8},receipt);await s.write({version:1,videos:{original:true}},'yp-library-v1');
 assert.equal(await s.accountStore().mutateQueue(a,epoch,'resume'),2);const rebound=await s.read(op);assert.equal(rebound.epoch,epoch);assert.equal(rebound.key,'original');assert.equal(rebound.lease,'original-lease');assert.equal(JSON.stringify(rebound.body),JSON.stringify(original.body));assert.equal((await s.read(other)).epoch,'old');assert.equal(await s.mutateQueue(a,epoch,'discard'),2);assert.equal(await s.read(op),null);assert.equal(await s.read(intent),null);assert.equal((await s.read(receipt)).revision,8);assert.equal((await s.read(other)).owner,b);assert.equal((await s.read('yp-library-v1')).videos.original,true);
});

test('resume quota failure rolls back all epoch changes and preserves original command bodies',async()=>{
 const s=idb(),owner='11111111-1111-4111-8111-111111111111',epoch='33333333-3333-4333-8333-333333333333',keys=['yp-operation-v1:'+owner+':state:one','yp-intent-v1:'+owner+':video:state'];for(const key of keys)await s.write({version:1,owner,epoch:'old',body:{rating:8}},key);const update=IDBCursor.prototype.update;let writes=0;IDBCursor.prototype.update=function(...args){if(++writes===2)throw new DOMException('quota','QuotaExceededError');return update.apply(this,args)};try{await assert.rejects(s.mutateQueue(owner,epoch,'resume'));}finally{IDBCursor.prototype.update=update;}for(const key of keys){assert.equal((await s.read(key)).epoch,'old');assert.equal((await s.read(key)).body.rating,8);}
});
