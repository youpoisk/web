/* Shared runtime worker. Runs in the Chrome MV3 service worker and in the
 * Firefox MV3 background event page; the browser API and the state store are
 * injected so the command handler stays identical on both. */
globalThis.YPWorker=(()=>{
 function start({api,storage}){
  let writes=Promise.resolve();
  async function read(){return await storage.read()||YPCore.empty();}
  function fields(value,allowed,required=[]){
   if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(value,k)))throw Error('Некорректная команда');
  }
  function validate(command){
   fields(command,['type','videoId','video','patch','options'],['type']);
   const shapes={GET_CURRENT_VIDEO_STATE:['type','videoId'],UPDATE_CURRENT_VIDEO:['type','video','patch'],GET_ACCOUNT_LIBRARY:['type'],OPTIONS:['type','options']};
   if(!Object.hasOwn(shapes,command.type))throw Error('Неизвестная команда');
   fields(command,shapes[command.type],shapes[command.type]);
   if(command.type==='GET_CURRENT_VIDEO_STATE'&&!/^[\w-]{11}$/.test(command.videoId))throw Error('Некорректный ID видео');
   if(command.type==='UPDATE_CURRENT_VIDEO'){
    fields(command.video,['id','title','url','preview','channel','channelUrl'],['id','title']);
    if(typeof command.video.id!=='string'||typeof command.video.title!=='string'||command.video.title.length>250||['url','preview','channel','channelUrl'].some(k=>Object.hasOwn(command.video,k)&&typeof command.video[k]!=='string'))throw Error('Некорректное видео');
    fields(command.patch,['rating','later','review','mark']);
    if(!Object.keys(command.patch).length)throw Error('Пустое изменение');
   }
   if(command.type==='OPTIONS'){fields(command.options,['enabled','site'],['enabled','site']);if(typeof command.options.enabled!=='boolean'||typeof command.options.site!=='string')throw Error('Некорректные настройки');}
  }
  async function authorize(command,sender){
   if(sender.id!==api.runtime.id)throw Error('Недопустимый отправитель');
   const trusted=['popup.html','options.html'].find(page=>sender.url===api.runtime.getURL(page));
   if(trusted){if(sender.frameId!==undefined&&sender.frameId!==0)throw Error('Недопустимый frame');if(command.type==='OPTIONS'&&trusted!=='options.html')throw Error('Настройки доступны только со страницы настроек');return {trusted:true};}
   const id=YPCore.videoId(sender.url);
   if(!sender.tab||!Number.isInteger(sender.tab.id)||sender.frameId!==0||!id)throw Error('Доступно только на странице обычного видео YouTube');
   if(!['GET_CURRENT_VIDEO_STATE','UPDATE_CURRENT_VIDEO'].includes(command.type))throw Error('Команда недоступна странице');
   const target=command.type==='GET_CURRENT_VIDEO_STATE'?command.videoId:command.video.id;
   const tab=await api.tabs.get(sender.tab.id);
   if(target!==id||YPCore.videoId(tab.url)!==id)throw Error('Видео изменилось, повторите действие');
   return {trusted:false,id};
  }
  function project(state,access){
   const options={enabled:state.options.enabled,site:state.options.site};
   const videos={};
   for(const id of access.trusted?Object.keys(state.videos):[access.id]){
    if(!Object.hasOwn(state.videos,id))continue;const v=state.videos[id];if(!v)continue;
    const safe={};for(const field of ['id','title','url','preview','channel','channelUrl','rating','later','review','mark','createdAt','updatedAt','reviewedAt'])if(Object.hasOwn(v,field))safe[field]=v[field];
    videos[id]=safe;
   }
   return {version:1,options,videos};
  }
  async function broadcast(){
   const tabs=await api.tabs.query({url:'https://www.youtube.com/*'});
   await Promise.allSettled(tabs.map(t=>api.tabs.sendMessage(t.id,{type:'YP_CHANGED'})));
   try{await api.runtime.sendMessage({type:'YP_CHANGED'});}catch{/* no open extension page */}
  }
  api.runtime.onMessage.addListener((command,sender,respond)=>{
   if(typeof command?.type!=='string'||command.type==='YP_CHANGED'||!command.type.startsWith('YP_'))return;
   const request={...command,type:command.type.slice(3)};
   (async()=>{
    validate(request);let access=await authorize(request,sender);
    if(['GET_CURRENT_VIDEO_STATE','GET_ACCOUNT_LIBRARY'].includes(request.type)){await writes;const state=await read();access=await authorize(request,sender);return project(state,access);}
    const operation=writes.then(async()=>{
     await authorize(request,sender);const state=await read();
     const next=YPCore.apply(state,request.type==='OPTIONS'?request:{...request,type:'UPDATE'});
     access=await authorize(request,sender);await storage.write(next);return project(next,access);
    });
    writes=operation.catch(()=>{});const result=await operation;broadcast().catch(()=>{});return result;
   })().then(data=>respond({ok:true,data}),()=>respond({ok:false,error:'Не удалось выполнить действие. Проверьте текущую страницу и повторите попытку.'}));
   return true;
  });
 }
 return {start};
})();
