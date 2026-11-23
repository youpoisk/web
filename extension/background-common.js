/* Shared runtime worker. Runs in the Chrome MV3 service worker and in the
 * Firefox MV3 background event page; the browser API and the state store are
 * injected so the command handler stays identical on both. */
globalThis.YPWorker=(()=>{
 function start({api,storage,session,backend}){
  let writes=Promise.resolve(),seenIdentity=null;
  function identity(auth){return JSON.stringify([auth?.state,auth?.owner,auth?.epoch]);}
  function observeAuth(auth){const next=identity(auth),changed=seenIdentity!==null&&next!==seenIdentity;seenIdentity=next;if(changed)broadcast().catch(()=>{});return auth;}
  async function authState(){try{return observeAuth(await session.status());}catch(error){if(session.peek&&(['network','timeout'].includes(error.kind)||error.status>=500||error.status===429))return observeAuth(await session.peek());throw error;}}
  async function read(){return await storage.read()||YPCore.empty();}
  function fields(value,allowed,required=[]){
   if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(value,k)))throw Error('Некорректная команда');
  }
  function validate(command){
   fields(command,['type','videoId','video','patch','options','login','password','after','scope','ref','choice','expected','id','choices','pendingAction'],['type']);
   const shapes={GET_CURRENT_VIDEO_STATE:['type','videoId'],UPDATE_CURRENT_VIDEO:['type','video','patch','scope'],GET_ACCOUNT_LIBRARY:['type','after'],GET_PENDING_LIBRARY:['type','after'],OPTIONS:['type','options'],AUTH_STATUS:['type'],AUTH_LOGIN:['type','login','password'],AUTH_LOGOUT:['type','scope','pendingAction'],SYNC_STATUS:['type'],SYNC_NOW:['type','scope'],QUEUE_CONFLICTS:['type','after'],QUEUE_RESOLVE:['type','scope','ref','choice','expected'],IMPORT_PREVIEW:['type','after','scope'],IMPORT_STATUS:['type','id'],IMPORT_COMMIT:['type','id','choices','scope'],QUEUE_RESUME:['type','scope'],QUEUE_DISCARD:['type','scope']};
   if(!Object.hasOwn(shapes,command.type))throw Error('Неизвестная команда');
   fields(command,shapes[command.type],shapes[command.type].filter(k=>!['after','scope','pendingAction'].includes(k)&&!(command.type==='IMPORT_STATUS'&&k==='id')));
   if(command.pendingAction!==undefined&&!['sync','keep','discard'].includes(command.pendingAction))throw Error('Некорректное действие с очередью');
   if(command.after!==undefined&&(typeof command.after!=='string'||command.after.length>512))throw Error('Некорректный курсор');
   if(command.type==='GET_CURRENT_VIDEO_STATE'&&!/^[\w-]{11}$/.test(command.videoId))throw Error('Некорректный ID видео');
   if(command.type==='IMPORT_COMMIT'&&(!Array.isArray(command.choices)||command.choices.length>12||command.choices.some(value=>!['server','local'].includes(value))))throw Error('Некорректный выбор импорта');
   if(command.id!==undefined&&(typeof command.id!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(command.id)))throw Error('Некорректный импорт');
   if(command.type==='QUEUE_RESOLVE'){fields(command.expected,['revision','key','intent'],['revision','key','intent']);if(!Number.isSafeInteger(command.expected.revision)||command.expected.revision<0||typeof command.expected.key!=='string'||command.expected.key.length>64||typeof command.expected.intent!=='string'||command.expected.intent.length>10000)throw Error('Некорректная версия сверки');}
   if(command.type==='QUEUE_RESOLVE'&&(typeof command.ref!=='string'||command.ref.length>256||!['server','local'].includes(command.choice)))throw Error('Некорректное решение конфликта');
   if(command.type==='UPDATE_CURRENT_VIDEO'){
    fields(command.video,['id','title','url','preview','channel','channelUrl','observation'],['id','title']);
    if(typeof command.video.id!=='string'||typeof command.video.title!=='string'||[...command.video.title.normalize('NFC')].length>250||['url','preview','channel','channelUrl'].some(k=>Object.hasOwn(command.video,k)&&typeof command.video[k]!=='string'))throw Error('Некорректное видео');
    if(command.video.observation)YPCore.observation(command.video.observation);
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
   const pick=v=>{const safe={};for(const field of ['id','title','url','preview','channel','channelUrl','rating','later','review','mark','createdAt','updatedAt','reviewedAt','pending','conflict','offline','ratingAverage','ratingCount'])if(Object.hasOwn(v,field))safe[field]=v[field];return safe;};
   for(const id of access.trusted?Object.keys(state.videos):[access.id]){
    if(!Object.hasOwn(state.videos,id))continue;const v=state.videos[id];if(!v)continue;
    videos[id]=pick(v);
   }
   return {version:1,options,videos,...(state.queued?{queued:true}:{}),...(state.offline?{offline:true}:{}),...(state.cacheMiss?{cacheMiss:true}:{}),...(state.auth?{auth:access.trusted?state.auth:{state:state.auth.state,scope:state.auth.epoch??null}}:{}),...(access.trusted?{next:state.next??null,pendingVideos:Object.fromEntries(Object.entries(state.pendingVideos??{}).map(([id,v])=>[id,pick(v)])),pendingNext:state.pendingNext??null,...(state.queue?{queue:state.queue}:{})}:{})};
  }
  async function broadcast(){
   let tabs=[];try{tabs=await api.tabs.query({url:'https://www.youtube.com/*'});}catch{/* closed browser surface */}
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
    const pulled=backend.pull?await backend.pull():null;continuePull=pulled?.complete===false||pulled?.reset===true||pulled?.cleanupPending===true;
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
      if(request.type==='AUTH_LOGOUT'&&backend?.queueStatus){const auth=await authState();if(request.scope!==undefined&&request.scope!==auth.epoch)throw Object.assign(new Error('Stale scope'),{kind:'stale'});if(auth.state==='authenticated'){let queue=await backend.queueStatus();if(queue.pending+queue.blocked>0){if(request.scope!==auth.epoch||!['sync','keep','discard'].includes(request.pendingAction))throw Object.assign(new Error('Choose pending action'),{kind:'pending_choice_required'});if(request.pendingAction==='discard')await backend.discardPending();if(request.pendingAction==='sync'){for(let page=0;page<10;page++){const result=await backend.recover();if(!result.next)break;}queue=await backend.queueStatus();if(queue.pending+queue.blocked>0)throw Object.assign(new Error('Queue not sent'),{kind:'pending_choice_required'});}}}}
      const result=request.type==='AUTH_LOGIN'?await session.login(request.login,request.password):request.type==='AUTH_LOGOUT'?await session.logout():await authState();
      observeAuth(result);if(request.type!=='AUTH_STATUS')broadcast().catch(()=>{});return result;
     }
     let state=await read();const auth=session?await authState():null;
     if(request.type==='QUEUE_RESUME'||request.type==='QUEUE_DISCARD'){
      if(auth?.state!=='authenticated'||request.scope!==auth.epoch)throw Object.assign(new Error('Stale scope'),{kind:'stale'});
      if(request.type==='QUEUE_RESUME'){await backend.resumePending();wake();}else await backend.discardPending();broadcast().catch(()=>{});return {...await backend.queueStatus(),scope:auth.epoch};
     }
     if(request.type.startsWith('IMPORT_')){
      if(auth?.state!=='authenticated')throw Object.assign(new Error('Authentication required'),{kind:'authentication'});
      if(request.type==='IMPORT_STATUS')return backend.importStatus(request.id);
      if(request.scope!==auth.epoch)throw Object.assign(new Error('Stale scope'),{kind:'stale'});
      if(request.type==='IMPORT_COMMIT'){const result=await backend.commitImport(request.id,request.choices);broadcast().catch(()=>{});return result;}
      if(request.after!==undefined&&!/^(0|[1-9][0-9]{0,6})$/.test(request.after))throw Error('Некорректная страница импорта');
      const ids=Object.keys(state.videos),offset=Number(request.after??0);ids.sort();const inputs=ids.slice(offset,offset+12).map(id=>{const saved=state.videos[id];try{if(!/^[\w-]{11}$/.test(id)||saved.id!==id)throw Error('invalid');return {...YPCore.metadata(saved),video:YPCore.metadata(saved),rating:saved.rating,later:saved.later,review:saved.review,mark:saved.mark};}catch{return {error:'Запись не является сохранением реального видео YouTube'};}});
      return backend.previewImport(inputs,offset+12<ids.length?String(offset+12):null);
     }
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
      }else result=request.type==='GET_PENDING_LIBRARY'?await backend.pendingLibrary(request.after):request.type==='GET_CURRENT_VIDEO_STATE'?await backend.current(request.videoId):await backend.library(request.after);
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
   })().then(data=>{try{respond({ok:true,data})}catch{/* UI closed */}},async error=>{
    if(session?.peek){try{observeAuth(await session.peek());}catch{}}
    const code=error?.name==='QuotaExceededError'?'quota':error?.kind??'unavailable';
    const messages={quota:'Не удалось сохранить на устройстве: недостаточно места. Освободите место и повторите.',storage:'Хранилище расширения недоступно. Сохраните черновик и повторите после восстановления доступа.',protocol:'Сервер вернул некорректный ответ. Сохранение не подтверждено.',stale:'Видео или аккаунт изменились. Повторите действие в текущем контексте.',pending_choice_required:'В очереди есть изменения. Выберите отправку, сохранение на устройстве или удаление очереди.',retry_later:'Команда ожидает повторной отправки.',authentication:'Войдите в аккаунт расширения.',reconcile_required:'Данные изменились или есть неподтверждённая команда. Нужна сверка перед повтором.'};
    try{respond({ok:false,code,error:messages[code]??'Не удалось выполнить действие. Проверьте текущую страницу, вход и соединение.'})}catch{/* UI closed */}
   });
   return true;
  });
 }
 return {start};
})();
