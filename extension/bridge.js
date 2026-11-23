/* Installed clients communicate only with the trusted worker. */
(() => {
  // Firefox exposes promise-based browser.*; Chrome exposes promise-capable chrome.*.
  const api=globalThis.browser??globalThis.chrome;
  const installed=!!api?.runtime?.id;
  const trusted=installed&&['popup.html','options.html'].some(page=>location.href===api.runtime.getURL(page));
  async function request(type, payload={}) {
    if(installed){
      const commands={GET:trusted?'GET_ACCOUNT_LIBRARY':'GET_CURRENT_VIDEO_STATE',UPDATE:'UPDATE_CURRENT_VIDEO',OPTIONS:'OPTIONS',CURRENT:'GET_CURRENT_VIDEO_STATE',AUTH_STATUS:'AUTH_STATUS',AUTH_LOGIN:'AUTH_LOGIN',AUTH_LOGOUT:'AUTH_LOGOUT',IMPORT_PREVIEW:'IMPORT_PREVIEW',IMPORT_STATUS:'IMPORT_STATUS',IMPORT_COMMIT:'IMPORT_COMMIT',PENDING:'GET_PENDING_LIBRARY',SYNC_STATUS:'SYNC_STATUS',SYNC_NOW:'SYNC_NOW',QUEUE_CONFLICTS:'QUEUE_CONFLICTS',QUEUE_RESOLVE:'QUEUE_RESOLVE'};
      if(!Object.hasOwn(commands,type)||Object.keys(payload).some(key=>!['video','patch','options','videoId','after','login','password','scope','ref','choice','expected','id','choices'].includes(key)))throw Error('Неизвестная команда');
      const request={...payload,type:'YP_'+commands[type]};
      if(type==='GET'&&!trusted)request.videoId=YPCore.videoId(location.href);
      const result=await api.runtime.sendMessage(request);if(!result?.ok)throw Error(result?.error||'Расширение обновилось. Обновите вкладку YouTube.');return result.data;}
    throw Error('Откройте установленное расширение YouPoisk.');
  }
  function subscribe(callback){
    // The worker signals both YouTube tabs and open extension pages. Taking the
    // signal from runtime messages works in Chrome and Firefox, including the
    // Firefox build that has no storage permission at all.
    if(installed){const fn=message=>{if(message?.type==='YP_CHANGED')callback()};api.runtime.onMessage.addListener(fn);return()=>api.runtime.onMessage.removeListener(fn);}
    return ()=>{};
  }
  globalThis.YPAPI=api;
  globalThis.YP={installed,request,subscribe};
})();
