import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const yt='p0iTgHMEoi4',trusted={id:'extension',url:'moz-extension://extension/popup.html'},page={id:'extension',url:'https://www.youtube.com/watch?v='+yt,tab:{id:1},frameId:0};
function worker({scheduler=false}={}){let currentUrl=page.url,loginRound=0,listener,auth={state:'guest',owner:null,epoch:null,user:null},calls=0,legacy={version:1,options:{enabled:true,site:'https://old.invalid/'},videos:{[yt]:{id:yt,title:'Legacy',rating:3,later:true}}};let recoveries=0;const events={};const timers=[];const context={URL,structuredClone,setTimeout(fn){timers.push(fn)}};
 context.api={runtime:{id:'extension',getURL:p=>'moz-extension://extension/'+p,onMessage:{addListener(fn){listener=fn}},async sendMessage(){}},tabs:{async get(){return {url:currentUrl}},async query(){return[]},async sendMessage(){}}};
 if(scheduler){context.api.alarms={create(name,options){events.created={name,options}},onAlarm:{addListener(fn){events.alarm=fn}}};context.api.runtime.onStartup={addListener(fn){events.startup=fn}};context.api.runtime.onInstalled={addListener(fn){events.installed=fn}};context.api.windows={onFocusChanged:{addListener(fn){events.focus=fn}}};}
 context.storage={async read(){return structuredClone(legacy)},async write(v){legacy=structuredClone(v)}};
 context.session={async status(){return structuredClone(auth)},async login(){calls++;auth={state:'authenticated',owner:'owner',epoch:loginRound++===0?'epoch-a':'epoch-b',user:{id:'owner',login:'qa_owner',name:'QA'}};return auth},async logout(){calls++;auth={state:'guest',owner:null,epoch:null,user:null};return auth}};
 context.backend={async recover(){recoveries++;return {sent:0,blocked:0,next:null}},async queueStatus(){return {pending:2,blocked:1,nextAttemptAt:123,more:false}},
  async current(id){return {videos:{[id]:{id,title:'Server',rating:8,later:true,review:'Server review'}}};},
  async library(){return {videos:{[yt]:{id:yt,title:'Server',rating:8,later:true}},next:'next-page'};},
  async update(video,patch){calls++;return {videos:{[video.id]:{...video,...patch}}};}
 };
 vm.createContext(context);for(const file of ['config.js','core.js','background-common.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);vm.runInContext('YPWorker.start({api,storage,session,backend})',context);
 return {holdPull(fn){context.backend.pull=fn},timers,events,recoveries:()=>recoveries,navigate(url){currentUrl=url},holdCurrent(fn){context.backend.current=fn},send:(msg,sender=trusted)=>new Promise(resolve=>listener(msg,sender,resolve)),calls:()=>calls,legacy:()=>legacy};
}
test('auth is trusted-only and guest mutations do not write new local ratings',async()=>{
 const w=worker();const before=JSON.stringify(w.legacy());for(const type of ['YP_AUTH_LOGIN','YP_AUTH_LOGOUT','YP_AUTH_STATUS'])assert.equal((await w.send({type,...(type==='YP_AUTH_LOGIN'?{login:'name',password:'secret'}:{})},page)).ok,false);
 assert.equal(w.calls(),0);assert.equal((await w.send({type:'YP_UPDATE_CURRENT_VIDEO',video:{id:yt,title:'Video'},patch:{rating:9}},page)).ok,false);assert.equal(JSON.stringify(w.legacy()),before);
});
test('signed-in reads and writes use server data, with no legacy account mixing or content identity',async()=>{
 const w=worker();assert.equal((await w.send({type:'YP_AUTH_LOGIN',login:'name',password:'secret'})).ok,true);const list=(await w.send({type:'YP_GET_ACCOUNT_LIBRARY'})).data;assert.equal(list.videos[yt].rating,8);assert.equal(list.auth.user.login,'qa_owner');assert.equal(list.options.site,'http://127.0.0.1:5173/');assert.equal(list.next,'next-page');
 const current=(await w.send({type:'YP_GET_CURRENT_VIDEO_STATE',videoId:yt},page)).data;assert.equal(current.videos[yt].review,'Server review');assert.equal(current.auth.scope,'epoch-a');assert.equal(current.auth.owner,undefined);assert.equal(current.auth.user,undefined);
 const changed=await w.send({type:'YP_UPDATE_CURRENT_VIDEO',video:{id:yt,title:'Video'},patch:{rating:null,later:false},scope:'epoch-a'},page);assert.equal(changed.ok,true);assert.equal(changed.data.videos[yt].rating,null);assert.equal(changed.data.videos[yt].later,false);assert.equal(w.legacy().videos[yt].rating,3);assert.equal(JSON.stringify(changed).includes('secret'),false);
 await w.send({type:'YP_AUTH_LOGOUT'});assert.equal((await w.send({type:'YP_AUTH_STATUS'})).data.state,'guest');
});

test('an UPDATE from the previously displayed account scope is rejected before backend access',async()=>{
 const w=worker();await w.send({type:'YP_AUTH_LOGIN',login:'A',password:'secret'});await w.send({type:'YP_AUTH_LOGOUT'});await w.send({type:'YP_AUTH_LOGIN',login:'B',password:'secret'});const count=w.calls();const response=await w.send({type:'YP_UPDATE_CURRENT_VIDEO',video:{id:yt,title:'Video'},patch:{review:'Old A draft'},scope:'epoch-a'},page);assert.equal(response.ok,false);assert.equal(w.calls(),count);assert.equal((await w.send({type:'YP_UPDATE_CURRENT_VIDEO',video:{id:yt,title:'Video'},patch:{rating:7}},page)).ok,false);assert.equal(w.calls(),count);
});

test('a delayed server snapshot for the previous YouTube SPA video cannot be returned to the new page',async()=>{
 const w=worker();await w.send({type:'YP_AUTH_LOGIN',login:'name',password:'secret'});let release;const gate=new Promise(resolve=>{release=resolve});w.holdCurrent(async id=>{await gate;return {videos:{[id]:{id,title:'Old video',review:'Old review'}}};});const pending=w.send({type:'YP_GET_CURRENT_VIDEO_STATE',videoId:yt},page);await new Promise(setImmediate);w.navigate('https://www.youtube.com/watch?v=q-gZ6dppLT0');release();const result=await pending;assert.equal(result.ok,false);assert.equal(result.data,undefined);
});

test('alarms, startup, install, popup and window focus wake a serialized private recovery',async()=>{
 const w=worker({scheduler:true});await new Promise(setImmediate);assert.equal(w.recoveries(),0);assert.equal(w.events.created.name,'yp-outbox');assert.equal(w.events.created.options.periodInMinutes,1);
 await w.send({type:'YP_AUTH_LOGIN',login:'name',password:'secret'});await new Promise(setImmediate);assert.equal(w.recoveries(),1);
 for(const event of [()=>w.events.alarm({name:'yp-outbox'}),()=>w.events.startup(),()=>w.events.installed(),()=>w.events.focus(1)]){const before=w.recoveries();event();await new Promise(setImmediate);assert.equal(w.recoveries(),before+1);}
 const before=w.recoveries();w.events.alarm({name:'other'});w.events.focus(-1);await new Promise(setImmediate);assert.equal(w.recoveries(),before);
 const status=await w.send({type:'YP_SYNC_STATUS'});assert.equal(status.data.pending,2);assert.equal(status.data.scope,'epoch-a');assert.equal((await w.send({type:'YP_SYNC_STATUS'},page)).ok,false);assert.equal((await w.send({type:'YP_SYNC_NOW',scope:'old'})).ok,false);
 assert.equal((await w.send({type:'YP_SYNC_NOW',scope:'epoch-a'})).ok,true);const content=(await w.send({type:'YP_GET_CURRENT_VIDEO_STATE',videoId:yt},page)).data;assert.equal(content.queue,undefined);
});

test('unfinished pull continues in bounded batches, allowing durable alarm recovery after interruption',async()=>{
 const w=worker({scheduler:true});let pages=0;w.holdPull(async()=>({changed:false,complete:++pages>=2}));await w.send({type:'YP_AUTH_LOGIN',login:'name',password:'secret'});await new Promise(setImmediate);assert.equal(pages,1);assert.equal(w.timers.length,1);w.timers.shift()();await new Promise(setImmediate);assert.equal(pages,2);assert.equal(w.timers.length,0);assert.equal(w.recoveries(),2);
});
