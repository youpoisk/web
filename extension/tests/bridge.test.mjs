import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function bridge(url){
 const sent=[],events={};const context={URL,structuredClone,location:{href:url},chrome:{runtime:{id:'test',getURL:p=>'chrome-extension://test/'+p,async sendMessage(message){sent.push(message);return {ok:true,data:{version:1}}},onMessage:{addListener(fn){events.runtime=fn},removeListener(){delete events.runtime}}},storage:{onChanged:{addListener(fn){events.storage=fn},removeListener(){delete events.storage}}}}};vm.createContext(context);for(const file of ['core.js','bridge.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);return {api:context.YP,sent,events};
}
test('content bridge sends current-video commands and subscribes to signal-only broadcasts',async()=>{
 const b=bridge('https://www.youtube.com/watch?v=aqz-KE-bpKQ');await b.api.request('GET');assert.equal(b.sent[0].type,'YP_GET_CURRENT_VIDEO_STATE');assert.equal(b.sent[0].videoId,'aqz-KE-bpKQ');
 await assert.rejects(b.api.request('GET',{type:'YP_GET_ACCOUNT_LIBRARY'}));
 let count=0;const stop=b.api.subscribe(()=>count++);assert.equal(b.events.storage,undefined);b.events.runtime({type:'YP_CHANGED'});assert.equal(count,1);stop();assert.equal(b.events.runtime,undefined);
});
test('trusted UI bridge gets library and keeps options updates on explicit command',async()=>{
 const b=bridge('chrome-extension://test/options.html');await b.api.request('GET');assert.equal(b.sent[0].type,'YP_GET_ACCOUNT_LIBRARY');await b.api.request('OPTIONS',{options:{enabled:false,site:'https://example.com/'}});assert.equal(b.sent[1].type,'YP_OPTIONS');let n=0;const stop=b.api.subscribe(()=>n++);b.events.storage({'yp-library-v1':{}},'local');assert.equal(n,1);stop();
});
