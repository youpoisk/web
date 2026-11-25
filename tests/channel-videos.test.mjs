import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
const directory=resolve('.artifacts/channel-video-tests',randomUUID());await mkdir(directory,{recursive:true});const file=resolve(directory,'view.mjs');
await build({entryPoints:['src/components/ChannelVideos.tsx'],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',plugins:[{name:'channel-hooks',setup(b){
 b.onResolve({filter:/^react$/},()=>({path:'react',namespace:'hooks'}));
 b.onLoad({filter:/.*/,namespace:'hooks'},()=>({contents:"export default {createElement:(type,props,...children)=>({type,props:{...props,children}})};export const useState=v=>{const h=globalThis.__channelHarness,i=h.index++;if(!(i in h.states))h.states[i]=v;return[h.states[i],x=>{h.states[i]=typeof x==='function'?x(h.states[i]):x}];};export const useRef=v=>{const h=globalThis.__channelHarness,i=h.index++;return h.refs[i]??=( {current:v} );};export const useEffect=fn=>{globalThis.__channelHarness.effect=fn;};",loader:'js'}));
 b.onResolve({filter:/HomeVideos.tsx$/},()=>({path:'cards',namespace:'cards'}));b.onLoad({filter:/.*/,namespace:'cards'},()=>({contents:'export function HomeVideoCard(){}',loader:'js'}));
}}]});
const {ChannelVideos}=await import(pathToFileURL(file).href);
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
const create=()=>globalThis.__channelHarness={index:0,states:[],refs:[]};
function render(client,channelId){globalThis.__channelHarness.index=0;return ChannelVideos({client,channelId});}
function more(tree){return tree.props.children.at(-1).props;}
test('channel list coalesces duplicate page loads and uses the server cursor',async()=>{
 const h=create(),calls=[];let resolvePage;const client={request:(op,options)=>{calls.push(options);return new Promise(r=>{resolvePage=r})}};
 render(client,'channel-a');const cleanup=h.effect();await settle();assert.equal(calls[0].query.channel,'channel-a');assert.equal(calls[0].query.limit,12);
 resolvePage({items:[],next_cursor:'next'});await settle();more(render(client,'channel-a')).onMore();more(render(client,'channel-a')).onMore();assert.equal(calls.length,2);assert.equal(calls[1].query.after,'next');
 resolvePage({items:[]});await settle();assert.equal(more(render(client,'channel-a')).cursor,null);cleanup();
});
test('unmount aborts old channel request and discards its late reply',async()=>{
 const h=create();let finish,signal;const client={request:(_op,options)=>{signal=options.signal;return new Promise(r=>{finish=r})}};
 render(client,'old');const cleanup=h.effect();cleanup();assert.equal(signal.aborted,true);const before=JSON.stringify(h.states);finish({items:[],next_cursor:'stale'});await settle();assert.equal(JSON.stringify(h.states),before);
});
test('failed first page offers retry without starting an unbounded loop',async()=>{
 const h=create();let calls=0;const client={request:async()=>{calls++;throw Error('offline')}};
 render(client,'channel');const cleanup=h.effect();await settle();const props=more(render(client,'channel'));assert.equal(props.error,true);assert.equal(props.cursor,'retry');assert.equal(calls,1);props.onMore();await settle();assert.equal(calls,2);cleanup();
});
