importScripts('core.js');
const KEY='yp-library-v1';
let writes=Promise.resolve();
const ready=chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
async function read(){await ready;return (await chrome.storage.local.get(KEY))[KEY]||YPCore.empty();}
function authorize(command,sender){
  if(sender.id!==chrome.runtime.id)throw Error('Недопустимый отправитель');
  if(!sender.tab)return;
  if(sender.frameId!==0 || !YPCore.videoId(sender.url))throw Error('Доступно только на странице обычного видео YouTube');
  if(!['GET','UPDATE'].includes(command.type))throw Error('Команда недоступна странице');
  if(command.type==='UPDATE' && command.video?.id!==YPCore.videoId(sender.url))throw Error('Видео изменилось, повторите действие');
}
async function broadcast(){
  const tabs=await chrome.tabs.query({url:'https://www.youtube.com/*'});
  await Promise.allSettled(tabs.map(t=>chrome.tabs.sendMessage(t.id,{type:'YP_CHANGED'})));
}
chrome.runtime.onMessage.addListener((command,sender,respond)=>{
  if(!command?.type?.startsWith('YP_'))return;
  const request={...command,type:command.type.slice(3)};
  (async()=>{
    authorize(request,sender);
    if(request.type==='GET'){await writes;return read();}
    if(!['UPDATE','OPTIONS'].includes(request.type))throw Error('Неизвестная команда');
    const operation=writes.then(async()=>{const next=YPCore.apply(await read(),request);await chrome.storage.local.set({[KEY]:next});return next;});
    writes=operation.catch(()=>{});
    const result=await operation;
    broadcast().catch(()=>{});
    return result;
  })().then(data=>respond({ok:true,data}),error=>respond({ok:false,error:error.message}));
  return true;
});
