/* The preview adapter uses the same rules; installed extension writes only through its worker. */
(() => {
  const installed=typeof chrome!=='undefined'&&!!chrome.runtime?.id;
  const key='yp-library-v1';
  const trusted=installed&&['popup.html','options.html'].some(page=>location.href===chrome.runtime.getURL(page));
  async function request(type, payload={}) {
    if(installed){
      const commands={GET:trusted?'GET_ACCOUNT_LIBRARY':'GET_CURRENT_VIDEO_STATE',UPDATE:'UPDATE_CURRENT_VIDEO',OPTIONS:'OPTIONS'};
      if(!Object.hasOwn(commands,type)||Object.keys(payload).some(key=>!['video','patch','options'].includes(key)))throw Error('Неизвестная команда');
      const request={...payload,type:'YP_'+commands[type]};
      if(type==='GET'&&!trusted)request.videoId=YPCore.videoId(location.href);
      const result=await chrome.runtime.sendMessage(request);if(!result?.ok)throw Error(result?.error||'Расширение обновилось. Обновите вкладку YouTube.');return result.data;}
    const state=JSON.parse(localStorage.getItem(key)||'null')||YPCore.empty();
    if(type==='GET')return state;
    const next=YPCore.apply(state,{type,...payload});localStorage.setItem(key,JSON.stringify(next));dispatchEvent(new Event('yp-change'));return next;
  }
  function subscribe(callback){
    if(installed&&!trusted){const fn=message=>{if(message?.type==='YP_CHANGED')callback()};chrome.runtime.onMessage.addListener(fn);return()=>chrome.runtime.onMessage.removeListener(fn);}
    if(installed){const fn=(changes,area)=>{if(area==='local'&&changes[key])callback()};chrome.storage.onChanged.addListener(fn);return()=>chrome.storage.onChanged.removeListener(fn);}
    const fn=e=>{if(!e.key||e.key===key)callback()};addEventListener('storage',fn);addEventListener('yp-change',callback);return()=>{removeEventListener('storage',fn);removeEventListener('yp-change',callback)};
  }
  globalThis.YP={installed,request,subscribe};
})();
