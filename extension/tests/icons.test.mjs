import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('both browser manifests provide square real PNG toolbar and add-on icons',()=>{
 for(const name of ['manifest.json','manifest.firefox.json']){
  const m=JSON.parse(readFileSync(new URL('../'+name,import.meta.url)));for(const [size,path] of Object.entries({...m.icons,...m.action.default_icon})){
   const png=readFileSync(new URL('../'+path,import.meta.url));assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),Number(size));assert.equal(png.readUInt32BE(20),Number(size));
  }
 }
});
