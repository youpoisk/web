const session=YPAuth.createSession({origin:YPConfig.apiOrigin,store:{load:()=>YPStorageFirefox.read('yp-auth-v1'),save:value=>YPStorageFirefox.write(value,'yp-auth-v1')}});
const accountStorage=YPStorageIDB.accountStore();
YPWorker.start({api:browser,storage:YPStorageFirefox,session,backend:YPAuth.createBackend({session,storage:accountStorage,origin:YPConfig.apiOrigin})});
