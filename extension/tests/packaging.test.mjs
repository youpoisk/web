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

test('Firefox production supports the published site path and an explicit disconnected API package',()=>{
 const args=['--production','--site-origin=https://youpoisk.github.io/web/','--api-origin=','--allow-unconfigured-api','--version=1.0.0'];
 const out=execFileSync(process.execPath,['scripts/build-firefox-extension.mjs',...args],{cwd:root,encoding:'utf8'}).trim().replace('Firefox extension built at ','');
 const manifest=JSON.parse(readFileSync(join(out,'manifest.json'),'utf8')),config=readFileSync(join(out,'config.js'),'utf8');
 assert.equal(manifest.version,'1.0.0');assert.deepEqual(manifest.host_permissions,['https://www.youtube.com/*']);assert.deepEqual(manifest.background.scripts,['config.js','background-unconfigured.js']);assert.equal(manifest.browser_specific_settings.gecko.id,'{84d4b863-7681-4de6-9c80-980cb5944462}');assert.match(config,/'?apiOrigin'?":s*""/);assert.ok(config.includes('https://youpoisk.github.io/web/'));assert.ok(!config.includes('127.0.0.1'));
 for(const invalid of [['--production','--site-origin=https://site.example.com','--api-origin='],['--allow-unconfigured-api','--api-origin='],['--production','--site-origin=https://site.example.com','--api-origin=https://api.example.com','--allow-unconfigured-api'],['--production','--site-origin=https://site.example.com','--api-origin=https://api.example.com','--version=01.0'],['--production','--site-origin=https://site.example.com','--api-origin=https://api.example.com','--version=65536'],['--production','--site-origin=https://site.example.com/#/bad','--api-origin=https://api.example.com']])assert.throws(()=>execFileSync(process.execPath,['scripts/build-firefox-extension.mjs',...invalid],{cwd:root,stdio:'pipe'}));
 const full=execFileSync(process.execPath,['scripts/build-firefox-extension.mjs','--production','--site-origin=https://site.example.com/web/','--api-origin=https://api.example.com','--version=1.0.0'],{cwd:root,encoding:'utf8'}).trim().replace('Firefox extension built at ','');assert.deepEqual(JSON.parse(readFileSync(join(full,'manifest.json'))).host_permissions,['https://www.youtube.com/*','https://api.example.com/*']);
});

test('production IP API keeps port in requests and Chrome permission, but uses a portless Firefox permission',()=>{
 for(const browser of ['firefox','chrome']){
  const out=execFileSync(process.execPath,['scripts/build-'+browser+'-extension.mjs','--production','--site-origin=https://youpoisk.github.io/web/','--api-origin=https://91.228.154.168:8443','--version=1.0.1'],{cwd:root,encoding:'utf8'}).trim().replace(browser==='firefox'?'Firefox extension built at ':'Chrome extension built at ','');
  const manifest=JSON.parse(readFileSync(join(out,'manifest.json'),'utf8')),config=readFileSync(join(out,'config.js'),'utf8');
  assert.deepEqual(manifest.host_permissions,['https://www.youtube.com/*',browser==='firefox'?'https://91.228.154.168/*':'https://91.228.154.168:8443/*']);
  assert.ok(config.includes('"apiOrigin":"https://91.228.154.168:8443"'));
  assert.ok(config.includes('"siteOrigin":"https://youpoisk.github.io/web/"'));
  assert.ok(!config.includes('127.0.0.1'));
 }
});
