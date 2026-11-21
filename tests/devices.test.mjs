import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDevices,revokeDevice,revokeOtherDevices} from '../src/shared/auth/devices.ts';
test('session helpers preserve pagination/current marker and invoke bodyless owned revocations',async()=>{
 const calls=[],id='00000000-0000-4000-8000-000000000001',signal=new AbortController().signal;
 const device={id,current:true,client_type:'web',device_label:'QA',created_at:'2026-11-21T00:00:00Z',updated_at:'2026-11-21T00:00:00Z',expires_at:'2026-11-28T00:00:00Z'};
 const client={async request(op,options){calls.push([op,options]);if(op==='listSessions')return {items:[device],...(options.query.after?{}:{next_cursor:'n'})};}};
 assert.deepEqual(await loadDevices(client,null,signal),{items:[device],next:'n'});
 assert.deepEqual(await loadDevices(client,'n'),{items:[device],next:null});
 await revokeDevice(client,id);await revokeOtherDevices(client);
 assert.deepEqual(calls,[['listSessions',{query:{limit:50},signal}],['listSessions',{query:{limit:50,after:'n'},signal:undefined}],['revokeSession',{path:{id}}],['logoutOtherSessions',{}]]);
});
test('uncertain session commands propagate failure without local success',async()=>{
 const failure=new Error('network'),client={request:async()=>{throw failure}};
 for(const command of [()=>loadDevices(client,null),()=>revokeDevice(client,'id'),()=>revokeOtherDevices(client)])await assert.rejects(command,e=>e===failure);
});
