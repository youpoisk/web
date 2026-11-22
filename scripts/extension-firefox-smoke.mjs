// Real Firefox integration via Mozilla web-ext. A fresh headless test profile,
// local QA native session, no primary-profile access or user browser automation.
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {cmd} from 'web-ext';
import {Script} from 'node:vm';
import {randomUUID} from 'node:crypto';
import browserProbe from '../extension/tests/browser-probe.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const line=execFileSync(process.execPath,['scripts/build-firefox-extension.mjs'],{cwd:root,encoding:'utf8'}).trim();
const sourceDir=line.replace('Firefox extension built at ','');
const nonce=randomUUID(),primary='moz-extension://9cb89df4-c00f-4717-9821-a9350fcebee8',backendRoot=resolve(root,'../youpoisk-backend');let configured=false;
async function configure(origin){await appendFile(resolve(backendRoot,'.env'),'\nFIREFOX_DEV_ORIGIN='+origin+'\n');execFileSync('docker',['compose','-p','youpoisk-yp040','up','-d','--no-deps','--force-recreate','api'],{cwd:backendRoot,stdio:'pipe',timeout:30000});for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:18080/readyz',{signal:AbortSignal.timeout(1000)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw Error('API not ready');}
let complete;const result=new Promise(resolve=>{complete=resolve});
const server=createServer(async(req,res)=>{
 if(req.method!=='POST'||![('/origin/'+nonce),('/result/'+nonce)].includes(req.url)){res.writeHead(404).end();return;}
 let raw='';for await(const data of req){raw+=data;if(raw.length>4096){res.writeHead(413).end();return;}}
 try{const value=JSON.parse(raw);if(req.url==='/origin/'+nonce){if(!/^moz-extension:\/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.origin))throw Error('Invalid test origin');configured=true;await configure(primary+','+value.origin);res.writeHead(200,{'Content-Type':'application/json'}).end('{}');return;}if(typeof value.ok!=='boolean')throw Error('Invalid probe');res.writeHead(200,{'Content-Type':'application/json'}).end('{}');complete(value);}catch{res.writeHead(400).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const report='http://127.0.0.1:'+server.address().port+'/result/'+nonce;
const originReport='http://127.0.0.1:'+server.address().port+'/origin/'+nonce;
const probe='('+browserProbe.toString()+')('+JSON.stringify(report)+','+JSON.stringify(originReport)+');';
new Script(probe,{filename:'browser-smoke.js'});
await writeFile(resolve(sourceDir,'browser-smoke.js'),probe);
const manifest=JSON.parse(await readFile(resolve(sourceDir,'manifest.json'),'utf8'));manifest.background.scripts.push('browser-smoke.js');await writeFile(resolve(sourceDir,'manifest.json'),JSON.stringify(manifest,null,2));
let runner,timer;
try{
 await mkdir(resolve(root,'.artifacts/firefox-smoke'),{recursive:true});
 runner=await cmd.run({sourceDir,artifactsDir:resolve(root,'.artifacts/firefox-smoke'),firefox:'C:/Program Files/Mozilla Firefox/firefox.exe',target:['firefox-desktop'],args:['-headless'],noReload:true,noInput:true,startUrl:['about:blank']});
 const outcome=await Promise.race([result,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Firefox smoke timed out')),45000);})]);
 await writeFile(resolve(root,'.artifacts/firefox-smoke/result.json'),JSON.stringify(outcome,null,2));
 console.log(JSON.stringify(outcome));if(!outcome.ok)throw Error('Firefox network smoke failed at '+outcome.stage);
 console.log('PASS actual Firefox login, refresh restore, rating/review writes, readback, fixture restore and logout');
}finally{clearTimeout(timer);try{if(runner){await runner.exit();await new Promise(resolve=>setTimeout(resolve,1000));}}finally{try{if(configured)await configure(primary);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}}
