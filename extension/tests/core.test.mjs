import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../core.js',import.meta.url),'utf8');
const sandbox={URL,structuredClone};vm.runInNewContext(code,sandbox);const core=sandbox.YPCore;
const video={id:'aqz-KE-bpKQ',title:' Test ',channel:'Channel',channelUrl:'https://www.youtube.com/@YouTube'};
const update=patch=>({type:'UPDATE',video,patch});
test('only ordinary canonical YouTube watch URLs are supported',()=>{
 assert.equal(core.videoId('https://www.youtube.com/watch?v=aqz-KE-bpKQ&t=10'),'aqz-KE-bpKQ');
 for(const url of ['https://www.youtube.com/shorts/aqz-KE-bpKQ','https://evil.test/watch?v=aqz-KE-bpKQ','https://www.youtube.com/watch?v=bad','http://www.youtube.com/watch?v=aqz-KE-bpKQ'])assert.equal(core.videoId(url),null);
});
test('metadata derives URLs instead of trusting client links',()=>{
 const result=core.metadata({...video,url:'javascript:alert(1)',preview:'https://evil.test/tracker',channelUrl:'https://evil.test/@name'});
 assert.equal(result.url,'https://www.youtube.com/watch?v=aqz-KE-bpKQ');assert.equal(result.preview,'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg');assert.equal(result.channelUrl,'');assert.equal(result.title,'Test');
});
test('rating, watch-later and review preserve each other; nothing is kept without them',()=>{
 const original=core.empty();let state=core.apply(original,update({rating:10}));state=core.apply(state,update({later:true}));state=core.apply(state,update({review:'  Отличное\r\nвидео  '}));state=core.apply(state,update({rating:null}));
 const saved=state.videos[video.id];
 assert.equal(saved.rating,null);assert.equal(saved.later,true);assert.equal(saved.review,'Отличное\nвидео');assert.ok(saved.reviewedAt);assert.equal('added' in saved,false);assert.equal(Object.keys(original.videos).length,0);
 state=core.apply(state,update({later:false}));assert.equal(state.videos[video.id].review,'Отличное\nвидео');
 state=core.apply(state,update({review:null}));assert.equal(state.videos[video.id],undefined,'no library: an empty record is dropped');
});
test('only rating, watch-later and review can be changed; reviews are validated',()=>{
 for(const patch of [{channelRating:7},{recommended:true},{added:true}])assert.throws(()=>core.apply(core.empty(),update(patch)),/Неизвестное поле/);
 for(const text of ['','   ',42,'я'.repeat(1001)])assert.throws(()=>core.apply(core.empty(),update({review:text})));
 assert.equal(core.apply(core.empty(),update({review:'я'.repeat(1000)})).videos[video.id].review.length,1000);
 assert.equal([...core.apply(core.empty(),update({review:'  '+'😀'.repeat(1000)+'  '})).videos[video.id].review].length,1000,'limit counts code points after trim');
 assert.throws(()=>core.apply(core.empty(),update({review:'😀'.repeat(1001)})));
 assert.equal(core.apply(core.empty(),update({review:'a\rb'})).videos[video.id].review,'a\nb');
 const legacy={...core.empty(),channels:{x:{rating:5}},videos:{[video.id]:{...core.metadata(video),rating:5,later:false,added:true,recommended:true,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'}}};
 const migrated=core.apply(legacy,update({later:true}));
 assert.equal(migrated.channels,undefined);assert.equal('recommended' in migrated.videos[video.id]||'added' in migrated.videos[video.id],false);assert.equal(migrated.videos[video.id].rating,5);
 assert.deepEqual({...core.options({site:'http://127.0.0.1:5173',channel:false})},{enabled:true,site:'http://127.0.0.1:5173/'});
});
test('reject invalid ratings, state and unsafe settings',()=>{
 for(const n of [0,11,1.1,'9',NaN])assert.throws(()=>core.apply(core.empty(),update({rating:n})));
 assert.throws(()=>core.apply(core.empty(),update({later:'yes'})));assert.throws(()=>core.apply(core.empty(),update({token:'secret'})));
 for(const site of ['javascript:alert(1)','http://example.com','https://user:pass@example.com','https://example.com/#/login'])assert.throws(()=>core.options({site}));
 assert.equal(core.options({site:'http://127.0.0.1:5173'}).site,'http://127.0.0.1:5173/');
});
function worker(){
 let listener,db={},fail=false;
 const chrome={runtime:{id:'test-extension',onMessage:{addListener(fn){listener=fn}}},storage:{local:{async setAccessLevel(){},async get(key){return structuredClone({[key]:db[key]})},async set(value){await new Promise(r=>setTimeout(r,2));if(fail){fail=false;throw Error('Storage full')}db={...db,...structuredClone(value)}}}},tabs:{async query(){return[]},async sendMessage(){}}};
 const context={chrome,URL,structuredClone,console,importScripts(){vm.runInContext(code,context)}};vm.createContext(context);vm.runInContext(readFileSync(new URL('../background.js',import.meta.url),'utf8'),context);
 const send=(command,sender={id:'test-extension'})=>new Promise(resolve=>listener(command,sender,resolve));
 return{send,failNext(){fail=true}};
}
test('worker serializes concurrent popup/content changes without losing data',async()=>{
 const w=worker();const responses=await Promise.all([w.send({type:'YP_UPDATE',video,patch:{rating:8}}),w.send({type:'YP_UPDATE',video,patch:{later:true}})]);assert.ok(responses.every(r=>r.ok));const snapshot=await w.send({type:'YP_GET'});assert.equal(snapshot.data.videos[video.id].rating,8);assert.equal(snapshot.data.videos[video.id].later,true);
});
test('worker denies other videos, frames and content settings writes',async()=>{
 const w=worker();const sender={id:'test-extension',frameId:0,tab:{id:1},url:'https://www.youtube.com/watch?v=aqz-KE-bpKQ'};
 assert.equal((await w.send({type:'YP_UPDATE',video:{...video,id:'jNQXAC9IVRw'},patch:{rating:8}},sender)).ok,false);
 assert.equal((await w.send({type:'YP_OPTIONS',options:{}},sender)).ok,false);
 assert.equal((await w.send({type:'YP_GET'},{...sender,frameId:1})).ok,false);
 assert.equal((await w.send({type:'YP_GET'},{id:'another-extension'})).ok,false);
});
test('failed storage write does not corrupt state or poison the queue',async()=>{
 const w=worker();w.failNext();assert.equal((await w.send({type:'YP_UPDATE',video,patch:{rating:8}})).ok,false);assert.equal((await w.send({type:'YP_UPDATE',video,patch:{later:true}})).ok,true);const snapshot=await w.send({type:'YP_GET'});assert.equal(snapshot.data.videos[video.id].rating,null);assert.equal(snapshot.data.videos[video.id].later,true);
});

test('manifest declares all runtime files and restricts content scripts to YouTube',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.manifest_version,3);assert.deepEqual(manifest.permissions,['storage','activeTab']);assert.equal(manifest.content_scripts.length,1);assert.deepEqual(manifest.content_scripts[0].matches,['https://www.youtube.com/*']);
 const files=[manifest.background.service_worker,manifest.action.default_popup,manifest.options_page,...manifest.content_scripts[0].js,...manifest.content_scripts[0].css];for(const file of files)assert.ok(readFileSync(new URL('../'+file,import.meta.url)).length>0,file);
 assert.equal(manifest.externally_connectable,undefined);
});

test('marks: watched keeps watch-later, not interested clears it, later clears not interested',()=>{
 let state=core.apply(core.empty(),update({mark:'watched'}));assert.equal(state.videos[video.id].mark,'watched');assert.equal(state.videos[video.id].later,false);
 state=core.apply(state,update({later:true}));assert.equal(state.videos[video.id].mark,'watched');assert.equal(state.videos[video.id].later,true);
 state=core.apply(state,update({mark:'not_interested'}));assert.equal(state.videos[video.id].mark,'not_interested');assert.equal(state.videos[video.id].later,false);
 state=core.apply(state,update({later:true}));assert.equal(state.videos[video.id].mark,null);assert.equal(state.videos[video.id].later,true);
 state=core.apply(state,update({later:false}));assert.equal(state.videos[video.id],undefined,'nothing kept without rating, later, review or mark');
 state=core.apply(core.empty(),update({mark:'not_interested'}));state=core.apply(state,update({mark:null}));assert.equal(state.videos[video.id],undefined);
 assert.throws(()=>core.apply(core.empty(),update({mark:'liked'})));assert.throws(()=>core.apply(core.empty(),update({mark:'not_interested',later:true})));
});

