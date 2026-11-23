import test from 'node:test';
import assert from 'node:assert/strict';
import {zipDirectory} from '../../scripts/extension-zip.mjs';
import {buildExtension} from '../../scripts/build-extension.mjs';
import {readFile,writeFile,mkdtemp,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

test('release ZIP is byte reproducible and readable by independent .NET ZIP implementation',{skip:process.platform!=='win32'},async()=>{
 const a=await buildExtension('chrome',[]),b=await buildExtension('chrome',[]),bytes=await zipDirectory(a);assert.deepEqual(bytes,await zipDirectory(b));const temporary=await mkdtemp(join(tmpdir(),'youpoisk-zip-')),path=join(temporary,'package.zip');
 try{await writeFile(path,bytes);const result=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',`Add-Type -AssemblyName System.IO.Compression.FileSystem; $archive=[IO.Compression.ZipFile]::OpenRead($env:YP_ZIP_TEST); try { $hashes=@{}; foreach($entry in $archive.Entries){$stream=$entry.Open(); try {$sha=[Security.Cryptography.SHA256]::Create(); try {$hashes[$entry.FullName]=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant()} finally {$sha.Dispose()}} finally {$stream.Dispose()}}; $hashes | ConvertTo-Json -Compress } finally {$archive.Dispose()}`],{encoding:'utf8',env:{...process.env,YP_ZIP_TEST:path}});assert.deepEqual(JSON.parse(result),JSON.parse(await readFile(a+'.sha256.json','utf8')).files);}finally{await unlink(path);await rmdir(temporary);}
});
