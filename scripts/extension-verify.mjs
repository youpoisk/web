// Reproducible local extension gate. QA writes run serially and restore fixtures.
import {execFileSync} from 'node:child_process';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),withAPI=process.argv.includes('--api');
if(process.argv.slice(2).some(arg=>arg!=='--api'))throw Error('Usage: node scripts/extension-verify.mjs [--api]');
const directory=resolve(root,'.artifacts/extension-verification',randomUUID());await mkdir(directory,{recursive:true});const report={timestamp:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),trackedDirty:execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim().length>0,node:process.version,withAPI,stages:[],chromeInstalled:false};
async function stage(name,args){const started=Date.now();try{const output=execFileSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});await writeFile(resolve(directory,name+'.log'),output);report.stages.push({name,ok:true,durationMs:Date.now()-started});console.log('PASS '+name);return output;}catch(error){await writeFile(resolve(directory,name+'.log'),String(error.stdout??'')+String(error.stderr??''));report.stages.push({name,ok:false,durationMs:Date.now()-started});throw Error(name+' failed; see report directory');}}
try{
 await stage('contract',['scripts/contract.mjs','check']);await stage('validators',['scripts/validators.mjs','check']);await stage('bundle',['scripts/extension-auth-bundle.mjs','--check']);
 const tests=(await readdir(resolve(root,'extension/tests'))).filter(file=>file.endsWith('.test.mjs')).sort().map(file=>'extension/tests/'+file);await stage('unit',['--experimental-test-coverage','--test-coverage-lines=100','--test-coverage-functions=100','--test-coverage-include=extension/auth/*.mjs','--test',...tests]);
 const built=await stage('firefox-build',['scripts/build-firefox-extension.mjs']),source=built.trim().replace('Firefox extension built at ','');const pkg=JSON.parse(await readFile(resolve(root,'node_modules/web-ext/package.json'),'utf8')),bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin['web-ext'];await stage('firefox-lint',[resolve(root,'node_modules/web-ext',bin),'lint','--source-dir',source,'--self-hosted','--warnings-as-errors']);
 if(withAPI){for(const [name,args]of [['auth-api',['scripts/extension-auth-smoke.mjs']],['business-api',['scripts/extension-backend-smoke.mjs']],['sync-api',['scripts/extension-sync-smoke.mjs']],['import-api',['scripts/extension-import-smoke.mjs']],['firefox-dom-ack',['scripts/extension-firefox-smoke.mjs','--dom','--ack-restart']],['firefox-controlled-stop',['scripts/extension-firefox-smoke.mjs','--abort-after-write']]])await stage(name,args);}
 report.ok=true;
}finally{await writeFile(resolve(directory,'report.json'),JSON.stringify(report,null,2));console.log('Report: '+directory);}
