/* Firefox MV3 background event page. manifest.firefox.json loads core.js,
 * storage-firefox.js and background-common.js before this file in the same
 * global scope, so the worker starts with the IndexedDB store. */
YPWorker.start({api:browser,storage:YPStorageFirefox});
