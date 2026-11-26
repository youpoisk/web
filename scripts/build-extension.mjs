import {randomUUID,createHash} from 'node:crypto';
import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function buildExtension(browser,args=process.argv.slice(2)) {
 const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),source=resolve(root,'extension');
 for(const arg of args)if(!['--production','--allow-unconfigured-api'].includes(arg)&&!['--site-origin=','--api-origin=','--version='].some(prefix=>arg.startsWith(prefix)))throw Error('Unknown build argument');
 for(const prefix of ['--production','--allow-unconfigured-api','--site-origin=','--api-origin=','--version='])if(args.filter(arg=>prefix.startsWith('--')&&!prefix.endsWith('=')?arg===prefix:arg.startsWith(prefix)).length>1)throw Error('Duplicate build argument');
 const production=args.includes('--production'),value=prefix=>args.find(arg=>arg.startsWith(prefix))?.slice(prefix.length),site=value('--site-origin='),api=value('--api-origin='),version=value('--version='),unconfigured=args.includes('--allow-unconfigured-api');
 if(unconfigured&&(!production||browser!=='firefox'||api!==''))throw Error('Unconfigured API requires Firefox production and explicit --api-origin=');
 if(version!==undefined&&(!production||version.split('.').length>4||version.split('.').some(part=>!/^(0|[1-9][0-9]*)$/.test(part)||Number(part)>65535)))throw Error('Invalid production version');
 if(!production&&(site!==undefined||api!==undefined))throw Error('Origin override is only allowed for a production build');
 const origin=(value,label)=>{if(!value)throw Error(`Production ${label} origin is not configured`);const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.hostname==='localhost'||url.hostname.endsWith('.localhost')||/^(127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)||url.hostname.startsWith('['))throw Error(`Invalid production ${label} origin`);return url.origin;};
 const siteURL=value=>{if(!value)throw Error('Production site origin is not configured');const url=new URL(value);origin(url.origin,'site');if(url.username||url.password||url.search||url.hash)throw Error('Invalid production site URL');return url.href.endsWith('/')?url.href:url.href+'/';};
 const config=production?{mode:'production',siteOrigin:siteURL(site),apiOrigin:unconfigured?'':origin(api,'API')}:null;
 const manifest=JSON.parse(await readFile(resolve(source,browser==='firefox'?'manifest.firefox.json':'manifest.json'),'utf8'));
 if(production){manifest.host_permissions=['https://www.youtube.com/*',...(config.apiOrigin?[config.apiOrigin+'/*']:[])];if(version!==undefined)manifest.version=version;if(unconfigured)manifest.background={scripts:['config.js','background-unconfigured.js']};if(browser==='firefox')manifest.browser_specific_settings.gecko.id='{84d4b863-7681-4de6-9c80-980cb5944462}';}
 const out=resolve(root,`.artifacts/${browser}-extension`,randomUUID());
 const files=['config.js','core.js','bridge.js','content.js','content.css','auth-worker.js','background-common.js','storage-idb.js','popup.html','popup.js','options.html','options.js','extension.css','assets',...(unconfigured?['background-unconfigured.js']:[]),...(browser==='firefox'?['storage-firefox.js','background.firefox.js']:['storage-chrome.js','background.js'])];
 await mkdir(out,{recursive:true});for(const file of files)await cp(resolve(source,file),resolve(out,file),{recursive:true});
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 if(config)await writeFile(resolve(out,'config.js'),'globalThis.YPConfig=Object.freeze('+JSON.stringify(config)+');\n');
 const referenced=[...(manifest.background.scripts??[manifest.background.service_worker]),manifest.action.default_popup,manifest.options_page,...manifest.content_scripts.flatMap(entry=>[...entry.js,...entry.css])];
 for(const file of referenced)await readFile(resolve(out,file));
 const checksums={};for(const file of (await readdir(out,{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile()).map(entry=>resolve(entry.parentPath??entry.path,entry.name)).sort())checksums[relative(out,file).replaceAll('\\','/')]=createHash('sha256').update(await readFile(file)).digest('hex');
 await writeFile(out+'.sha256.json',JSON.stringify({browser,version:manifest.version,mode:production?'production':'development',files:checksums},null,2)+'\n');
 return out;
}
