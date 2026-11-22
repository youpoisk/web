/* Chrome MV3 store: extension storage with trusted-contexts access. Content
 * scripts can reach the same storage API in Chrome, so access is narrowed to
 * trusted extension documents before any read or write. */
globalThis.YPStorageChrome=(()=>{
 const KEY='yp-library-v1';
 const ready=chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
 return {
  async read(){await ready;return (await chrome.storage.local.get(KEY))[KEY]||null;},
  async write(state){await ready;await chrome.storage.local.set({[KEY]:state});}
 };
})();
