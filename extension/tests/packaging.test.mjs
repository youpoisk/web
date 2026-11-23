import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('normal Firefox package excludes QA probes, credentials, source plans and sample data',()=>{
 const result=execFileSync(process.execPath,['scripts/build-firefox-extension.mjs'],{cwd:root,encoding:'utf8'}),directory=result.trim().replace('Firefox extension built at ','');const files=readdirSync(directory,{recursive:true}).filter(file=>/\.(js|html|json|md|mjs)$/i.test(file));assert.ok(files.includes('auth-worker.js'));assert.ok(files.includes('content.js'));
 for(const file of files){assert.equal(/(?:demo|probe|tests?\/|tests?\\|\.mjs$|integration-plan)/i.test(file),false,file);const text=readFileSync(join(directory,file),'utf8');assert.equal(text.includes('qa_block_probe'),false,file);assert.equal(text.includes('Controlled ACK loss'),false,file);assert.equal(text.includes('YPContentHarness'),false,file);}
 const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));assert.equal(manifest.permissions.includes('storage'),false);assert.equal(manifest.permissions.includes('alarms'),true);assert.equal(manifest.web_accessible_resources,undefined);
});

test('Chrome build is clean and reproducible; invalid config fails closed',()=>{
 const build=()=>execFileSync(process.execPath,['scripts/build-chrome-extension.mjs'],{cwd:root,encoding:'utf8'}).trim().replace('Chrome extension built at ','');
 const first=build(),second=build();assert.deepEqual(JSON.parse(readFileSync(first+'.sha256.json')),JSON.parse(readFileSync(second+'.sha256.json')));
 const manifest=JSON.parse(readFileSync(join(first,'manifest.json')));assert.equal(manifest.background.service_worker,'background.js');assert.equal(readdirSync(first).includes('storage-firefox.js'),false);
 for(const args of [['--production'],['--api-origin=https://api.example.com'],['--unexpected'],['--production','--production'],['--production','--site-origin=https://site.example.com','--api-origin=http://api.example.com']])assert.throws(()=>execFileSync(process.execPath,['scripts/build-chrome-extension.mjs',...args],{cwd:root,stdio:'pipe'}));
});
