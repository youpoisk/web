/* Firefox MV3 store: Firefox does not support storage.StorageArea.setAccessLevel,
 * so the library lives in extension-origin IndexedDB instead of browser.storage.
 * Content scripts run in the page origin and cannot reach this database, and the
 * Firefox manifest therefore does not request the storage permission at all. */
globalThis.YPStorageFirefox=(()=>{
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
 async function read(){
  const db=await open();
  return await new Promise((resolve,reject)=>{
   const transaction=db.transaction(STORE,'readonly'),request=transaction.objectStore(STORE).get(KEY);
   let result=null;request.onsuccess=()=>{result=request.result??null;};
   transaction.oncomplete=()=>resolve(result);
   transaction.onabort=()=>reject(transaction.error??new Error('Storage read aborted'));
   transaction.onerror=()=>reject(transaction.error??new Error('Storage read failed'));
   request.onerror=()=>reject(request.error);
  });
 }
 async function write(state){
  const db=await open();
  return await new Promise((resolve,reject)=>{
   const transaction=db.transaction(STORE,'readwrite');
   transaction.objectStore(STORE).put(state,KEY);
   transaction.oncomplete=()=>resolve();
   transaction.onerror=()=>reject(transaction.error);
   transaction.onabort=()=>reject(transaction.error);
  });
 }
 return {read,write};
})();
