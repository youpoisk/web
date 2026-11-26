import {readFile,writeFile} from 'node:fs/promises';
// Public 404 is also used locally; rewrite only the build output.
const base=process.env.PAGES_BASE_PATH;
if(!base||!base.startsWith('/')||!base.endsWith('/')||!/^[A-Za-z0-9_.-]+$/.test(base.slice(1,-1))||base.includes('..'))throw Error('A repository Pages base path is required');
const file=new URL('../dist/404.html',import.meta.url);
const html=await readFile(file,'utf8');
await writeFile(file,html.replaceAll('href="/"','href="'+base+'"').replaceAll('href="/#/login"','href="'+base+'#/login"'));
await writeFile(new URL('../dist/.nojekyll',import.meta.url),'');
console.log('Pages artifact prepared for '+base);
