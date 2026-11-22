import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {IDBFactory} from 'fake-indexeddb';
const source=readFileSync(new URL('../storage-firefox.js',import.meta.url),'utf8');
function store(indexedDB){const context={indexedDB};vm.createContext(context);vm.runInContext(source,context);return context.YPStorageFirefox;}
test('Firefox IDB persists a complete snapshot across worker restart and replaces it atomically',async()=>{
 const idb=new IDBFactory(),a=store(idb);assert.equal(await a.read(),null);const state={version:1,videos:{one:{rating:8,later:false,review:null}},options:{enabled:true}};await a.write(state);assert.deepEqual(JSON.parse(JSON.stringify(await a.read())),state);const b=store(idb);assert.deepEqual(JSON.parse(JSON.stringify(await b.read())),state);await b.write({...state,videos:{}});assert.deepEqual(JSON.parse(JSON.stringify(await a.read())),{...state,videos:{}});
});
test('Firefox open failure rejects and permits a later retry',async()=>{
 const idb=new IDBFactory();let count=0;const wrapped={open(...args){count++;if(count===1){const request={};queueMicrotask(()=>request.onerror());return request;}return idb.open(...args);}};const s=store(wrapped);await assert.rejects(s.read());assert.equal(await s.read(),null);
});
test('Firefox build omits storage permission and loads shared background in order',()=>{
 const m=JSON.parse(readFileSync(new URL('../manifest.firefox.json',import.meta.url)));assert.equal(m.manifest_version,3);assert.equal(m.background.service_worker,undefined);assert.equal(m.permissions.includes('storage'),false);assert.deepEqual(m.background.scripts,['config.js','core.js','storage-firefox.js','background-common.js','background.firefox.js']);for(const file of m.background.scripts)assert.ok(readFileSync(new URL('../'+file,import.meta.url)).length);assert.deepEqual(m.content_scripts[0].matches,['https://www.youtube.com/*']);assert.equal(m.externally_connectable,undefined);assert.deepEqual(m.host_permissions,['https://www.youtube.com/*']);
});

test('Firefox named auth records stay separate from legacy library snapshots',async()=>{
 const s=store(new IDBFactory()),library={version:1,videos:{},options:{enabled:true}};await s.write(library);await s.write({version:1,refresh:'private'},'yp-auth-v1');assert.deepEqual(JSON.parse(JSON.stringify(await s.read())),library);await s.write({...library,videos:{one:{rating:8}}});assert.equal((await s.read('yp-auth-v1')).refresh,'private');await s.write(null,'yp-auth-v1');assert.equal(await s.read('yp-auth-v1'),null);assert.equal((await s.read()).videos.one.rating,8);
});
