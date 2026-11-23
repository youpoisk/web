/* Private extension-origin IndexedDB: shared transactional account store. */
globalThis.YPStorageIDB=(()=>{
 const DB='youpoisk-extension',STORE='state',KEY='yp-library-v1';
 let opening=null;
 function open(){
  if(opening)return opening;
  opening=new Promise((resolve,reject)=>{
   const request=indexedDB.open(DB,1);let abandoned=false;
   request.onblocked=()=>{abandoned=true;opening=null;reject(new Error('Extension database is blocked'));};
   request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};
   request.onsuccess=()=>{const db=request.result;if(abandoned){db.close();return;}db.onversionchange=()=>{db.close();opening=null;};resolve(db);};
   request.onerror=()=>{opening=null;reject(request.error);};
  });
  return opening;
 }
 async function read(key=KEY){
  const db=await open();
  return await new Promise((resolve,reject)=>{
   const transaction=db.transaction(STORE,'readonly'),request=transaction.objectStore(STORE).get(key);
   let result=null;request.onsuccess=()=>{result=request.result??null;};
   transaction.oncomplete=()=>resolve(result);
   transaction.onabort=()=>reject(transaction.error??new Error('Storage read aborted'));
   transaction.onerror=()=>reject(transaction.error??new Error('Storage read failed'));
   request.onerror=()=>reject(request.error);
  });
 }
 async function entries(prefix,{after=null,limit=12}={}){
  if(typeof prefix!=='string'||!/^yp-(?:operation|intent)-v1:[^:]+:$/.test(prefix)||!Number.isInteger(limit)||limit<1||limit>100||after!==null&&(typeof after!=='string'||!after.startsWith(prefix)))throw new Error('Invalid queue page');
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly'),items=[];let next=null;
   const range=IDBKeyRange.bound(after??prefix,prefix+'\uffff',after!==null,false);
   const cursor=tx.objectStore(STORE).openCursor(range);
   cursor.onsuccess=()=>{const row=cursor.result;if(!row)return;if(row.value!==null){if(items.length===limit){next=items.at(-1)[0];return;}items.push([row.key,row.value]);}row.continue();};
   tx.oncomplete=()=>resolve({items,next});tx.onabort=()=>reject(tx.error??new Error('Queue read aborted'));tx.onerror=()=>reject(tx.error);
  });
 }
 async function write(state,key=KEY){
  const db=await open();
  return await new Promise((resolve,reject)=>{
   const transaction=db.transaction(STORE,'readwrite');
   transaction.objectStore(STORE).put(state,key);
   transaction.oncomplete=()=>resolve();
   transaction.onerror=()=>reject(transaction.error);
   transaction.onabort=()=>reject(transaction.error);
  });
 }

 async function commit(entries){
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite');try{const store=tx.objectStore(STORE),merged=new Map();for(const [key,value] of entries){if(key.startsWith('yp-canonical-v2:')&&value){if(value.version!==2||!Number.isSafeInteger(value.revision)||value.revision<0)throw new Error('Invalid canonical revision');const earlier=merged.get(key);if(earlier&&earlier.revision>value.revision)continue;}merged.set(key,value);}for(const [key,value] of merged){if(key.startsWith('yp-canonical-v2:')&&value){const old=store.get(key);old.onsuccess=()=>{try{if(old.result&&(old.result.version!==2||!Number.isSafeInteger(old.result.revision)||old.result.revision<0))throw new Error('Invalid cached revision');if(!old.result||old.result.revision<=value.revision)store.put(value,key);}catch(error){tx.abort();reject(error);}};}else store.put(value,key);}}catch(error){tx.abort();reject(error);return;}
   tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('Atomic write aborted'));tx.onerror=()=>reject(tx.error);
  });
 }
 async function migrate(entries){
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),marker=store.get('yp-layout-v2');
   marker.onsuccess=()=>{try{
    if(marker.result){if(marker.result.version!==2)throw new Error('Unknown storage layout');return;}
    for(const [key,value] of entries){const existing=store.get(key);existing.onsuccess=()=>{try{if(existing.result===undefined)store.put(value,key);}catch(error){tx.abort();reject(error);}};}
    store.put({version:2},'yp-layout-v2');
   }catch(error){tx.abort();reject(error);}};
   tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('Migration aborted'));tx.onerror=()=>reject(tx.error);
  });
 }
 async function pruneGenerations(owner,{limit=128}={}){
  if(typeof owner!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(owner)||!Number.isInteger(limit)||limit<1||limit>512)throw new Error('Invalid cache cleanup');
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),prefix=`yp-generation-v2:${owner}:`,gcKey=`yp-gc-v2:${owner}`;let active,staging,after,left=3,scanned=0,removed=0,done=true;
   const start=()=>{if(--left)return;const keep=new Set([active?.generation,staging?.id].filter(Boolean));const lower=typeof after==='string'&&after.startsWith(prefix)?after:null;const request=store.openCursor(IDBKeyRange.bound(lower??prefix,prefix+'\uffff',lower!==null,false));
    request.onsuccess=()=>{const row=request.result;if(!row){store.put(null,gcKey);return;}if(scanned>=limit){done=false;store.put(after,gcKey);return;}scanned++;after=row.key;const generation=row.key.slice(prefix.length).split(':',1)[0];if(!keep.has(generation)){row.delete();removed++;}row.continue();};
   };
   for(const [name,assign]of [[`yp-sync-v2:${owner}`,value=>{active=value}],[`yp-sync-progress-v2:${owner}`,value=>{staging=value}],[gcKey,value=>{after=value}]]){const read=store.get(name);read.onsuccess=()=>{assign(read.result);start();};}
   tx.oncomplete=()=>resolve({done,removed});tx.onabort=()=>reject(tx.error??new Error('Cache cleanup aborted'));tx.onerror=()=>reject(tx.error);
  });
 }
 async function mutateQueue(owner,epoch,mode){
  const uuid=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
  if(!uuid.test(owner)||!uuid.test(epoch)||!['resume','discard'].includes(mode))throw new Error('Invalid queue choice');
  const db=await open();return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);let changed=0;
   for(const type of ['operation','intent']){const prefix=`yp-${type}-v1:${owner}:`,request=store.openCursor(IDBKeyRange.bound(prefix,prefix+'\uffff'));
    request.onsuccess=()=>{try{const row=request.result;if(!row)return;if(row.value!==null){if(mode==='discard'){row.delete();changed++;}else if(row.value.owner===owner&&row.value.version===1&&row.value.epoch!==epoch){row.update({...row.value,epoch});changed++;}}row.continue();}catch(error){tx.abort();reject(error);}};
   }
   tx.oncomplete=()=>resolve(changed);tx.onabort=()=>reject(tx.error??new Error('Queue choice aborted'));tx.onerror=()=>reject(tx.error);
  });
 }
 function accountStore(source=async()=>[]){
  const ready=Promise.resolve().then(source).then(migrate);ready.catch(()=>{});
  return {async mutateQueue(owner,epoch,mode){await ready;return mutateQueue(owner,epoch,mode)},async pruneGenerations(owner,options){await ready;return pruneGenerations(owner,options)},async entries(prefix,options){await ready;return entries(prefix,options)},async read(key){await ready;return read(key)},async write(value,key){await ready;return write(value,key)},async commit(entries){await ready;return commit(entries)}};
 }
 return {read,write,entries,commit,migrate,pruneGenerations,mutateQueue,accountStore};
})();
