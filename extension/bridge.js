/* The preview adapter uses the same rules; installed extension writes only through its worker. */
(() => {
  const installed=typeof chrome!=='undefined'&&!!chrome.runtime?.id;
  const key='yp-library-v1';
  async function request(type, payload={}) {
    if(installed){const result=await chrome.runtime.sendMessage({type:'YP_'+type,...payload});if(!result?.ok)throw Error(result?.error||'Расширение обновилось. Обновите вкладку YouTube.');return result.data;}
    const state=JSON.parse(localStorage.getItem(key)||'null')||YPCore.empty();
    if(type==='GET')return state;
    const next=YPCore.apply(state,{type,...payload});localStorage.setItem(key,JSON.stringify(next));dispatchEvent(new Event('yp-change'));return next;
  }
  function subscribe(callback){
    if(installed){const fn=(changes,area)=>{if(area==='local'&&changes[key])callback()};chrome.storage.onChanged.addListener(fn);return()=>chrome.storage.onChanged.removeListener(fn);}
    const fn=e=>{if(!e.key||e.key===key)callback()};addEventListener('storage',fn);addEventListener('yp-change',callback);return()=>{removeEventListener('storage',fn);removeEventListener('yp-change',callback)};
  }
  globalThis.YP={installed,request,subscribe};
})();
