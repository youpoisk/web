import {randomUUID} from 'node:crypto';
// Builds the Firefox dev package: same runtime code, Firefox manifest with a
// background event page, and no storage permission (library lives in IDB).
// Output: .artifacts/firefox-extension (ignored); load it with web-ext run.
import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'extension');
const out = resolve(root, '.artifacts/firefox-extension', randomUUID());
const files = [
  'config.js', 'core.js', 'bridge.js', 'content.js', 'content.css',
  'auth-worker.js', 'background-common.js', 'storage-firefox.js', 'background.firefox.js',
  'popup.html', 'popup.js', 'options.html', 'options.js',
  'extension.css', 'assets'
];

const manifest = JSON.parse(await readFile(resolve(source, 'manifest.firefox.json'), 'utf8'));
const referenced = [
  ...manifest.background.scripts,
  manifest.action.default_popup,
  manifest.options_page,
  ...manifest.content_scripts.flatMap((entry) => [...entry.js, ...entry.css])
];
const production=process.argv.includes('--production');
const apiSupplied=process.argv.find(arg=>arg.startsWith('--api-origin='))?.slice('--api-origin='.length);
const supplied=process.argv.find(arg=>arg.startsWith('--site-origin='))?.slice('--site-origin='.length);
if(production&&!supplied)throw Error('Production site origin is not configured');
if(production&&!apiSupplied)throw Error('Production API origin is not configured');
if(supplied&&!production)throw Error('Site override is only allowed for a production build');

await mkdir(out, {recursive: true});
for (const file of files) await cp(resolve(source, file), resolve(out, file), {recursive: true});
for (const file of referenced) {
  try { await readFile(resolve(out, file)); }
  catch { throw new Error(`Firefox build is missing ${file}`); }
}
await writeFile(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');


if(production){const site=new URL(supplied),api=new URL(apiSupplied);if(api.protocol!=='https:'||api.username||api.password||api.search||api.hash||api.pathname!=='/'||['localhost','127.0.0.1','[::1]'].includes(api.hostname))throw Error('Invalid production API origin');manifest.host_permissions=['https://www.youtube.com/*',api.origin+'/*'];await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');if(site.protocol!=='https:'||site.username||site.password||site.search||site.hash||site.pathname!=='/'||['localhost','127.0.0.1','[::1]'].includes(site.hostname))throw Error('Invalid production site origin');await writeFile(resolve(out,'config.js'),'globalThis.YPConfig=Object.freeze('+JSON.stringify({mode:'production',siteOrigin:site.origin+'/',apiOrigin:api.origin})+');\n');}

console.log(`Firefox extension built at ${out}`);
