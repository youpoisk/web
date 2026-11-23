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
