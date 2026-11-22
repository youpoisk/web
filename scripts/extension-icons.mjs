// Render the existing rhino logo into square browser toolbar/add-on assets.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
const root=new URL('../extension/assets/',import.meta.url);
let svg=await readFile(new URL('rhino.svg',root),'utf8');
svg=svg.replace('viewBox="0 0 96 64"','viewBox="0 0 96 96"').replace('height="64" rx="16"','height="96" rx="24"').replace('<g fill="#fff">','<g fill="#fff" transform="translate(0 16)">').replace('cy="32"','cy="48"');
await writeFile(new URL('icon.svg',root),svg);
await mkdir(new URL('icons/',root),{recursive:true});
for(const size of [16,19,24,32,38,48,64,96,128]){
 const png=new Resvg(svg,{fitTo:{mode:'width',value:size},font:{loadSystemFonts:false}}).render().asPng();
 if(png.readUInt32BE(16)!==size||png.readUInt32BE(20)!==size)throw Error('Incorrect icon dimensions');
 await writeFile(new URL(`icons/icon-${size}.png`,root),png);
}
console.log('Generated square YouPoisk toolbar/add-on icons.');
