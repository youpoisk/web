// Explicit Firefox production placeholder: no network, credentials, storage or writes.
(() => {
 const api=globalThis.browser;
 api.runtime.onMessage.addListener((message,sender,reply)=>{
  if(typeof message?.type!=='string'||!message.type.startsWith('YP_'))return false;
  if(sender.id!==api.runtime.id){reply({ok:false,code:'forbidden',error:'Недопустимый отправитель'});return false;}
  reply({ok:false,code:'configuration',error:'Сервер YouPoisk пока не подключён. Вход и сохранение данных будут доступны после обновления расширения.'});
  return false;
 });
})();
