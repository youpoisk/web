import {buildExtension} from './build-extension.mjs';
import {zipDirectory} from './extension-zip.mjs';
import {randomUUID,createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
// Validate through builder before preparing any release report. No publication/signing.
const firefox=await buildExtension('firefox',args),chrome=await buildExtension('chrome',args);
const out=resolve(root,'.artifacts/extension-release',randomUUID());await mkdir(out,{recursive:true});
const report={publication:'not-performed',mode:args.includes('--production')?'production':'development',commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),trackedChanges:execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim(),packages:{},externalGates:['Production HTTPS site/API and hosted privacy policy','Store developer account, signature and review','Installed Chrome and manual live YouTube visual acceptance']};
for(const [browser,directory]of Object.entries({firefox,chrome})){
 const bytes=await zipDirectory(directory),manifest=JSON.parse(await readFile(resolve(directory,'manifest.json'),'utf8')),name=`youpoisk-${browser}-${manifest.version}-${report.mode}.zip`;
 await writeFile(resolve(out,name),bytes);await copyFile(directory+'.sha256.json',resolve(out,browser+'-files.sha256.json'));
 report.packages[browser]={version:manifest.version,directory,archive:name,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,signed:false};
}
for(const name of ['store-listing.md','privacy.md','release-checklist.md'])await copyFile(resolve(root,'extension/docs',name),resolve(out,name));
await writeFile(resolve(out,'release.json'),JSON.stringify(report,null,2)+'\n');console.log(`Extension preparation at ${out}`);
