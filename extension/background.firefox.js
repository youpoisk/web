const session=YPAuth.createSession({origin:YPConfig.apiOrigin,store:{load:()=>YPStorageFirefox.read('yp-auth-v1'),save:value=>YPStorageFirefox.write(value,'yp-auth-v1')}});
YPWorker.start({api:browser,storage:YPStorageFirefox,session,backend:YPAuth.createBackend({session,storage:YPStorageFirefox,origin:YPConfig.apiOrigin})});
