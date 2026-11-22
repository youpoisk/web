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
  'core.js', 'bridge.js', 'content.js', 'content.css',
  'background-common.js', 'storage-firefox.js', 'background.firefox.js',
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
await mkdir(out, {recursive: true});
for (const file of files) await cp(resolve(source, file), resolve(out, file), {recursive: true});
for (const file of referenced) {
  try { await readFile(resolve(out, file)); }
  catch { throw new Error(`Firefox build is missing ${file}`); }
}
await writeFile(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Firefox extension built at ${out}`);
