/* Shared runtime worker. Runs in the Chrome MV3 service worker and in the
 * Firefox MV3 background event page; the browser API and the state store are
 * injected so the command handler stays identical on both. */
globalThis.YPWorker=(()=>{
 function start({api,storage,session,backend}){
  let writes=Promise.resolve();
  async function read(){return await storage.read()||YPCore.empty();}
  function fields(value,allowed,required=[]){
   if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(value,k)))throw Error('Некорректная команда');
  }
  function validate(command){
   fields(command,['type','videoId','video','patch','options','login','password','after','scope','ref','choice','expected'],['type']);
   const shapes={GET_CURRENT_VIDEO_STATE:['type','videoId'],UPDATE_CURRENT_VIDEO:['type','video','patch','scope'],GET_ACCOUNT_LIBRARY:['type','after'],OPTIONS:['type','options'],AUTH_STATUS:['type'],AUTH_LOGIN:['type','login','password'],AUTH_LOGOUT:['type'],SYNC_STATUS:['type'],SYNC_NOW:['type','scope'],QUEUE_CONFLICTS:['type','after'],QUEUE_RESOLVE:['type','scope','ref','choice','expected']};
   if(!Object.hasOwn(shapes,command.type))throw Error('Неизвестная команда');
   fields(command,shapes[command.type],shapes[command.type].filter(k=>!['after','scope'].includes(k)));
   if(command.after!==undefined&&(typeof command.after!=='string'||command.after.length>512))throw Error('Некорректный курсор');
   if(command.type==='GET_CURRENT_VIDEO_STATE'&&!/^[\w-]{11}$/.test(command.videoId))throw Error('Некорректный ID видео');
   if(command.type==='QUEUE_RESOLVE'){fields(command.expected,['revision','key','intent'],['revision','key','intent']);if(!Number.isSafeInteger(command.expected.revision)||command.expected.revision<0||typeof command.expected.key!=='string'||command.expected.key.length>64||typeof command.expected.intent!=='string'||command.expected.intent.length>10000)throw Error('Некорректная версия сверки');}
   if(command.type==='QUEUE_RESOLVE'&&(typeof command.ref!=='string'||command.ref.length>256||!['server','local'].includes(command.choice)))throw Error('Некорректное решение конфликта');
   if(command.type==='UPDATE_CURRENT_VIDEO'){
    fields(command.video,['id','title','url','preview','channel','channelUrl'],['id','title']);
    if(typeof command.video.id!=='string'||typeof command.video.title!=='string'||command.video.title.length>250||['url','preview','channel','channelUrl'].some(k=>Object.hasOwn(command.video,k)&&typeof command.video[k]!=='string'))throw Error('Некорректное видео');
    fields(command.patch,['rating','later','review','mark']);
    if(!Object.keys(command.patch).length)throw Error('Пустое изменение');
   }
   if(command.type==='OPTIONS'){fields(command.options,['enabled'],['enabled']);if(typeof command.options.enabled!=='boolean')throw Error('Некорректные настройки');}
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
   const options={enabled:state.options.enabled,site:globalThis.YPConfig.siteOrigin};
   const videos={};
   for(const id of access.trusted?Object.keys(state.videos):[access.id]){
    if(!Object.hasOwn(state.videos,id))continue;const v=state.videos[id];if(!v)continue;
    const safe={};for(const field of ['id','title','url','preview','channel','channelUrl','rating','later','review','mark','createdAt','updatedAt','reviewedAt','pending'])if(Object.hasOwn(v,field))safe[field]=v[field];
    videos[id]=safe;
   }
   return {version:1,options,videos,...(state.queued?{queued:true}:{}),...(state.auth?{auth:access.trusted?state.auth:{state:state.auth.state,scope:state.auth.epoch??null}}:{}),...(access.trusted?{next:state.next??null,...(state.queue?{queue:state.queue}:{})}:{})};
  }
  async function broadcast(){
   const tabs=await api.tabs.query({url:'https://www.youtube.com/*'});
   await Promise.allSettled(tabs.map(t=>api.tabs.sendMessage(t.id,{type:'YP_CHANGED'})));
   try{await api.runtime.sendMessage({type:'YP_CHANGED'});}catch{/* no open extension page */}
  }
  // Events wake the durable queue; deadlines live in IDB, not in worker timers.
  let recoveryQueued=false;
  async function recover(){
   if(!backend?.recover||!session||recoveryQueued)return;
   recoveryQueued=true;let continuePull=false;
   const work=writes.then(async()=>{
    if((await session.status()).state!=='authenticated')return;
    let after=undefined,sent=0;for(let page=0;page<10;page++){const result=await backend.recover(after);sent+=result.sent;after=result.next;if(!after)break;}
    const pulled=backend.pull?await backend.pull():null;continuePull=pulled?.complete===false||pulled?.reset===true;
    if(sent||pulled?.changed)await broadcast();
   });
   writes=work.catch(()=>{});try{await work;}finally{recoveryQueued=false;if(continuePull)setTimeout(wake,0);}
  }
  const wake=()=>{void recover().catch(()=>{});};
  if(api.alarms&&backend?.recover){
   api.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='yp-outbox')wake();});
   Promise.resolve(api.alarms.create('yp-outbox',{periodInMinutes:1})).catch(()=>{});
   api.runtime.onStartup?.addListener(wake);api.runtime.onInstalled?.addListener(wake);
   api.windows?.onFocusChanged?.addListener(id=>{if(id!==-1)wake();});wake();
  }
  api.runtime.onMessage.addListener((command,sender,respond)=>{
   if(typeof command?.type!=='string'||command.type==='YP_CHANGED'||!command.type.startsWith('YP_'))return;
   const request={...command,type:command.type.slice(3)};
   (async()=>{
    validate(request);await authorize(request,sender);
    const operation=writes.then(async()=>{
     let access=await authorize(request,sender);
     if(request.type.startsWith('AUTH_')){
      if(!session)throw Error('Авторизация недоступна');
      const result=request.type==='AUTH_LOGIN'?await session.login(request.login,request.password):request.type==='AUTH_LOGOUT'?await session.logout():await session.status();
      if(request.type!=='AUTH_STATUS')broadcast().catch(()=>{});return result;
     }
     let state=await read();const auth=session?await session.status():null;
     if(request.type==='QUEUE_CONFLICTS'||request.type==='QUEUE_RESOLVE'){
      if(auth?.state!=='authenticated')throw Object.assign(new Error('Authentication required'),{kind:'authentication'});
      if(request.type==='QUEUE_CONFLICTS')return {...await backend.conflicts(request.after),scope:auth.epoch};
      if(request.scope!==auth.epoch)throw Object.assign(new Error('Stale scope'),{kind:'stale'});
      await backend.resolve(request.ref,request.choice,request.expected);broadcast().catch(()=>{});return {scope:auth.epoch};
     }
     if(request.type==='SYNC_STATUS'||request.type==='SYNC_NOW'){
      if(auth?.state!=='authenticated')throw Object.assign(new Error('Authentication required'),{kind:'authentication'});
      if(request.type==='SYNC_NOW'){if(request.scope!==auth.epoch)throw Object.assign(new Error('Stale scope'),{kind:'stale'});await backend.recover();broadcast().catch(()=>{});}
      return {...await backend.queueStatus(),scope:auth.epoch};
     }
     if(request.type==='OPTIONS'){state=YPCore.apply(state,request);await storage.write(state);broadcast().catch(()=>{});return project({...state,auth},access);}
     if(auth?.state==='authenticated'){
      let result;
      if(request.type==='UPDATE_CURRENT_VIDEO'){
       if(request.scope!==auth.epoch)throw Object.assign(new Error('Stale UI scope'),{kind:'stale'});
       const validated=YPCore.apply(YPCore.empty(),{type:'UPDATE',video:request.video,patch:request.patch});
       const patch={...request.patch};if(Object.hasOwn(patch,'review'))patch.review=validated.videos[request.video.id]?.review??null;
       result=await backend.update(request.video,patch);broadcast().catch(()=>{});
      }else result=request.type==='GET_CURRENT_VIDEO_STATE'?await backend.current(request.videoId):await backend.library(request.after);
      if(access.trusted&&backend.queueStatus)result.queue=await backend.queueStatus();
      access=await authorize(request,sender);return project({...state,...result,auth},access);
     }
     if(request.type==='UPDATE_CURRENT_VIDEO'){
      if(session)throw Object.assign(new Error('Authentication required'),{kind:'authentication'});
      state=YPCore.apply(state,{...request,type:'UPDATE'});await storage.write(state);broadcast().catch(()=>{});
     }
     return project({...state,auth},access);
    });
    writes=operation.catch(()=>{});if(request.type==='GET_ACCOUNT_LIBRARY'||request.type==='AUTH_LOGIN')operation.finally(wake).catch(()=>{});return await operation;
   })().then(data=>respond({ok:true,data}),error=>respond({ok:false,error:error?.kind==='retry_later'?'Команда ожидает повторной отправки.':error?.kind==='authentication'?'Войдите в аккаунт расширения.':error?.kind==='reconcile_required'?'Данные изменились или есть неподтверждённая команда. Нужна сверка перед повтором.':'Не удалось выполнить действие. Проверьте текущую страницу, вход и соединение.'}));
   return true;
  });
 }
 return {start};
})();
