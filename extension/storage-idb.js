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
 function accountStore(source=async()=>[]){
  const ready=Promise.resolve().then(source).then(migrate);ready.catch(()=>{});
  return {async read(key){await ready;return read(key)},async write(value,key){await ready;return write(value,key)},async commit(entries){await ready;return commit(entries)}};
 }
 return {read,write,commit,migrate,accountStore};
})();
