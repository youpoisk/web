import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import{readFileSync}from'node:fs';
test('unconfigured production worker fails closed without network or credential access',()=>{
 let listener;const context={browser:{runtime:{id:'extension',onMessage:{addListener(fn){listener=fn}}}},fetch(){throw Error('Network must not be used')},indexedDB:{open(){throw Error('Storage must not be used')}}};vm.createContext(context);vm.runInContext(readFileSync(new URL('../background-unconfigured.js',import.meta.url),'utf8'),context);
 let reply;const send=value=>{reply=JSON.parse(JSON.stringify(value));};
 assert.equal(listener({type:'unrelated'},{id:'extension'},send),false);assert.equal(reply,undefined);
 listener({type:'YP_AUTH_LOGIN',login:'user',password:'secret'},{id:'other'},send);assert.equal(reply.code,'forbidden');
 for(const type of ['YP_AUTH_LOGIN','YP_UPDATE_CURRENT_VIDEO','YP_GET_ACCOUNT_LIBRARY','YP_SYNC_NOW']){listener({type},{id:'extension'},send);assert.equal(reply.ok,false);assert.equal(reply.code,'configuration');assert.match(reply.error,/пока не подключён/);assert.ok(!JSON.stringify(reply).includes('secret'));}
});
