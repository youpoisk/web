importScripts('config.js','core.js','storage-chrome.js','auth-worker.js','background-common.js');
const session=YPAuth.createSession({origin:YPConfig.apiOrigin,store:{load:()=>YPStorageChrome.read('yp-auth-v1'),save:value=>YPStorageChrome.write(value,'yp-auth-v1')}});
YPWorker.start({api:chrome,storage:YPStorageChrome,session,backend:YPAuth.createBackend({session,storage:YPStorageChrome,origin:YPConfig.apiOrigin})});
