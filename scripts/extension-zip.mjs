// Deterministic ZIP STORE: fixed timestamps, sorted UTF-8 paths, no extra fields.
import {readdir,readFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
export async function zipDirectory(directory){
 const files=(await readdir(directory,{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile()).map(entry=>resolve(entry.parentPath??entry.path,entry.name)).sort();
 const chunks=[],central=[];let offset=0;
 for(const file of files){const name=Buffer.from(relative(directory,file).replaceAll('\\','/')),data=await readFile(file);let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
  const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(33,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(data.length,20);record.writeUInt32LE(data.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);
  chunks.push(header,name,data);central.push(record,name);offset+=header.length+name.length+data.length;
 }
 const directoryData=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directoryData.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...chunks,directoryData,end]);
}
