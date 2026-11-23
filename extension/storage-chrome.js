/* Chrome MV3 store: extension storage with trusted-contexts access. Content
 * scripts can reach the same storage API in Chrome, so access is narrowed to
 * trusted extension documents before any read or write. */
globalThis.YPStorageChrome=(()=>{
 const KEY='yp-library-v1';
 const ready=chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
 return {
  async entries(prefix){await ready;const all=await chrome.storage.local.get(null);return Object.entries(all).filter(([key])=>key.startsWith(prefix));},
  async read(key=KEY){await ready;return (await chrome.storage.local.get(key))[key]??null;},
  async write(state,key=KEY){await ready;await chrome.storage.local.set({[key]:state});}
 };
})();
