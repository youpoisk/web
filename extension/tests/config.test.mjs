import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
test('site destination comes from build configuration and cannot be changed by options',()=>{
 const ctx={URL,structuredClone,YPConfig:Object.freeze({mode:'production',siteOrigin:'https://site.example.invalid/'})};vm.createContext(ctx);vm.runInContext(readFileSync(new URL('../core.js',import.meta.url),'utf8'),ctx);assert.equal(ctx.YPCore.empty().options.site,'https://site.example.invalid/');assert.equal(ctx.YPCore.options({enabled:false}).site,'https://site.example.invalid/');assert.throws(()=>ctx.YPCore.options({site:'https://attacker.invalid/',enabled:true}));const html=readFileSync(new URL('../options.html',import.meta.url),'utf8');assert.doesNotMatch(html,/name="site"|Адрес сайта YouPoisk|127\.0\.0\.1/);
});
test('production build fails until its explicit site origin is supplied',()=>{
 assert.throws(()=>execFileSync(process.execPath,['scripts/build-firefox-extension.mjs','--production'],{cwd:new URL('../../',import.meta.url),stdio:'pipe'}),e=>e.status!==0&&e.stderr.toString().includes('Production site origin is not configured'));
});
