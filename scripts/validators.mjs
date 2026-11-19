import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standalone from 'ajv/dist/standalone/index.js';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
if (!['generate', 'check'].includes(mode) || process.argv.length !== 3) {
  throw new Error('Usage: node scripts/validators.mjs generate|check');
}
// Contract integrity and internal-only references are checked before compilation.
const { execFileSync } = await import('node:child_process');
execFileSync(process.execPath, [resolve(root, 'scripts/contract.mjs'), 'check'], { stdio: 'pipe' });
const spec = JSON.parse(await readFile(resolve(root, 'contracts/openapi.json'), 'utf8'));
const ajv = new Ajv({ strict: false, allErrors: false, inlineRefs: false, code: { source: true, esm: true, lines: true } });
addFormats(ajv);
const id = 'urn:youpoisk:contract';
ajv.addSchema({ ...spec, $id: id });
const refs = {};
const contract = {};
const pointer = value => value.replaceAll('~', '~0').replaceAll('/', '~1');
function register(name, fragment) {
  const ref = `${id}#${fragment}`;
  ajv.getSchema(ref);
  refs[name] = ref;
  return name;
}
for (const name of Object.keys(spec.components.schemas).sort()) {
  register(`schema_${name}`, `/components/schemas/${pointer(name)}`);
}
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    const prefix = `/paths/${pointer(path)}/${method}`;
    const responses = {};
    for (const [code, response] of Object.entries(operation.responses)) {
      responses[code] = response.content?.['application/json']?.schema
        ? register(`${operation.operationId}_response_${code}`, `${prefix}/responses/${code}/content/application~1json/schema`)
        : null;
    }
    const parameters = operation.parameters ?? [];
    const resolved = parameters.map(parameter => parameter.$ref
      ? spec.components.parameters[parameter.$ref.split('/').at(-1)] : parameter);
    const request = operation.requestBody?.content?.['application/json']?.schema
      ? register(`${operation.operationId}_request`, `${prefix}/requestBody/content/application~1json/schema`) : null;
    contract[operation.operationId] = { method: method.toUpperCase(), path, request, responses,
      auth: operation.security?.some(option => Object.hasOwn(option, 'Bearer'))
        ? (operation.security.some(option => Object.keys(option).length === 0) ? 'optional' : 'required') : 'none',
      parameters: resolved.map(parameter => ({ name: parameter.name, in: parameter.in, required: parameter.required ?? false })) };
  }
}
const code = standalone(ajv, refs);
const bundled = await build({ stdin: { contents: code, resolveDir: root, sourcefile: 'compiled-contract.js' },
  bundle: true, write: false, platform: 'browser', format: 'esm', target: 'es2022', legalComments: 'none', minify: false });
const notices = (await Promise.all(['ajv', 'ajv-formats'].map(async name =>
  `${name}:\n${(await readFile(resolve(root, `node_modules/${name}/LICENSE`), 'utf8')).replaceAll('\r\n', '\n')}`))).join('\n');
const content = '// Generated offline; no runtime schema compilation or eval.\n/*\n' + notices + '\n*/\n' + bundled.outputFiles[0].text +
  '\nexport const contract = ' + JSON.stringify(contract, null, 2) + ';\n';
if (/\b(?:eval\s*\(|new\s+Function\s*\()/.test(content)) throw new Error('Runtime code generation is forbidden');
const file = resolve(root, 'src/shared/api/validators.js');
const declarations = '// Generated; do not edit.\n' + Object.keys(refs).sort().map(name =>
  `export declare const ${name}: (value: unknown) => boolean;`).join('\n') +
  '\nexport declare const contract: Readonly<Record<string, { method: string; path: string; request: string | null; responses: Readonly<Record<string, string | null>>; auth: "none" | "optional" | "required"; parameters: ReadonlyArray<{ name: string; in: string; required: boolean }> }>>;\n';
if (mode === 'check') {
  if ((await readFile(file, 'utf8')).replaceAll('\r\n', '\n') !== content) throw new Error('Runtime validators drifted; run pnpm api:validators');
  if ((await readFile(file.replace(/\.js$/, '.d.ts'), 'utf8')).replaceAll('\r\n', '\n') !== declarations) throw new Error('Runtime validator declarations drifted');
} else {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
  await writeFile(file.replace(/\.js$/, '.d.ts'), declarations);
}
console.log(`Verified standalone runtime schemas for ${Object.keys(contract).length} operations.`);
