/* Shared domain rules. No DOM, network, or Chrome dependencies. */
(() => {
  const defaults = {enabled:true, channel:true, site:'http://127.0.0.1:5173/'};
  const empty = () => ({version:1,videos:{},channels:{},options:{...defaults}});
  function videoId(value) {
    try { const u=new URL(value); return u.protocol==='https:' && u.hostname==='www.youtube.com' && u.pathname==='/watch' && /^[\w-]{11}$/.test(u.searchParams.get('v')||'') ? u.searchParams.get('v') : null; } catch { return null; }
  }
  function channelUrl(value) {
    try { const u=new URL(value,'https://www.youtube.com'); return u.protocol==='https:' && u.hostname==='www.youtube.com' && /^\/(channel\/UC[\w-]{22}|@[\p{L}\p{N}_.%\-]{1,150})\/?$/u.test(u.pathname) ? u.origin+u.pathname.replace(/\/$/,'') : ''; } catch { return ''; }
  }
  function metadata(value) {
    if(!value || !/^[\w-]{11}$/.test(value.id||'')) throw Error('Некорректный ID видео');
    const title=String(value.title||'').trim().slice(0,250);
    if(!title) throw Error('Название видео ещё не загрузилось');
    return {id:value.id,title,url:`https://www.youtube.com/watch?v=${value.id}`,preview:`https://i.ytimg.com/vi/${value.id}/hqdefault.jpg`,channel:String(value.channel||'').slice(0,150),channelUrl:channelUrl(value.channelUrl)};
  }
  function rating(value) {if(value!==null && (!Number.isInteger(value)||value<1||value>10)) throw Error('Оценка должна быть целым числом от 1 до 10'); return value;}
  function options(value) {
    const site=new URL(String(value.site||defaults.site));
    if(site.protocol!=='https:' && !(site.protocol==='http:' && ['localhost','127.0.0.1'].includes(site.hostname))) throw Error('Сайт должен использовать HTTPS (HTTP разрешён только локально)');
    if(site.username||site.password||site.search||site.hash) throw Error('Укажите адрес сайта без пароля, параметров и #');
    return {enabled:value.enabled!==false,channel:value.channel!==false,site:site.href.replace(/\/?$/,'/')};
  }
  function apply(state, command, now=new Date().toISOString()) {
    const next=structuredClone(state);
    if(command.type==='OPTIONS') {next.options=options(command.options||{});return next;}
    if(command.type!=='UPDATE') throw Error('Неизвестная команда');
    const v=metadata(command.video); const patch=command.patch||{};
    if(Object.keys(patch).some(k=>!['rating','later','added','channelRating','recommended'].includes(k))) throw Error('Неизвестное поле');
    if('rating' in patch) rating(patch.rating);
    if('channelRating' in patch) {rating(patch.channelRating);if(!v.channelUrl) throw Error('Канал ещё не определён');}
    for(const key of ['later','added','recommended']) if(key in patch && typeof patch[key]!=='boolean') throw Error('Некорректное состояние списка');
    const previous=next.videos[v.id];
    next.videos[v.id]={rating:null,later:false,recommended:false,added:true,createdAt:now,...previous,...v,...('rating' in patch?{rating:patch.rating}:{}),...('later' in patch?{later:patch.later}:{}),...('added' in patch?{added:patch.added}:{}),...('recommended' in patch?{recommended:patch.recommended}:{}),updatedAt:now};
    if(patch.later===true || (patch.rating!=null))next.videos[v.id].added=true;
    if('channelRating' in patch)next.channels[v.channelUrl]={name:v.channel,url:v.channelUrl,rating:patch.channelRating,updatedAt:now};
    return next;
  }
  globalThis.YPCore={empty,videoId,channelUrl,metadata,options,apply};
})();
