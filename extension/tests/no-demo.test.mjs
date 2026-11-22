import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
test('installed extension has no sample catalog, example UI or browser-local preview fallback',()=>{
 for(const file of ['popup.js','popup.html','content.js','bridge.js'])assert.doesNotMatch(readFileSync(new URL('../'+file,import.meta.url),'utf8'),/YPDemoCatalog|demo-catalog|id="demo"|localStorage/);
 for(const file of ['demo.html','demo-page.js','demo-catalog.js'])assert.equal(existsSync(new URL('../'+file,import.meta.url)),false);
 const context={};vm.createContext(context);vm.runInContext(readFileSync(new URL('../bridge.js',import.meta.url),'utf8'),context);return assert.rejects(context.YP.request('GET'));
});
