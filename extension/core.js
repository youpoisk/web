/* Shared domain rules. No DOM, network, or Chrome dependencies. */
(() => {
  const defaults = {enabled:true, site:globalThis.YPConfig.siteOrigin};
  const empty = () => ({version:1,videos:{},options:{...defaults}});
  function videoId(value) {
    try { const u=new URL(value); return u.origin==='https://www.youtube.com' && !u.username && !u.password && u.pathname==='/watch' && /^[\w-]{11}$/.test(u.searchParams.get('v')||'') ? u.searchParams.get('v') : null; } catch { return null; }
  }
  function channelUrl(value) {
    try { const u=new URL(value,'https://www.youtube.com'); return u.origin==='https://www.youtube.com' && !u.username && !u.password && /^\/(channel\/UC[\w-]{22}|@[\p{L}\p{N}_.%\-]{1,150})\/?$/u.test(u.pathname) ? u.origin+u.pathname.replace(/\/$/,'') : ''; } catch { return ''; }
  }
  function metadata(value) {
    if(!value || !/^[\w-]{11}$/.test(value.id||'')) throw Error('Некорректный ID видео');
    const title=String(value.title||'').trim().slice(0,250);
    if(!title) throw Error('Название видео ещё не загрузилось');
    return {id:value.id,title,url:`https://www.youtube.com/watch?v=${value.id}`,preview:`https://i.ytimg.com/vi/${value.id}/hqdefault.jpg`,channel:String(value.channel||'').slice(0,150),channelUrl:channelUrl(value.channelUrl)};
  }
  // Review: plain text, 1..1000 characters after trim (null deletes it).
  function review(value) {
    if(value===null) return null;
    if(typeof value!=='string') throw Error('Рецензия должна быть текстом');
    const text=value.replace(/\r\n?/g,'\n').trim();
    if(!text) throw Error('Рецензия не может быть пустой');
    if([...text].length>1000) throw Error('Рецензия не может быть длиннее 1000 символов');
    return text;
  }
  function rating(value) {if(value!==null && (!Number.isInteger(value)||value<1||value>10)) throw Error('Оценка должна быть целым числом от 1 до 10'); return value;}
  function options(value) {
    if(Object.hasOwn(value,'site'))throw Error('Адрес сайта задаётся сборкой расширения');
    return {enabled:value.enabled!==false,site:defaults.site};
  }
  function apply(state, command, now=new Date().toISOString()) {
    const next=structuredClone(state);
    if(command.type==='OPTIONS') {next.options=options(command.options||{});return next;}
    if(command.type!=='UPDATE') throw Error('Неизвестная команда');
    const v=metadata(command.video); const patch=command.patch||{};
    // Rating, watch-later, review (customer decision 2026-11-21) and the
    // «Просмотрено»/«Неинтересно» marks next to the rating (YP-102).
    if(Object.keys(patch).some(k=>!['rating','later','review','mark'].includes(k))) throw Error('Неизвестное поле');
    if('rating' in patch) rating(patch.rating);
    if('later' in patch && typeof patch.later!=='boolean') throw Error('Некорректное состояние списка');
    if('mark' in patch && ![null,'watched','not_interested'].includes(patch.mark)) throw Error('Некорректная отметка');
    if(patch.mark==='not_interested' && patch.later===true) throw Error('«Неинтересно» и «Посмотрю позже» нельзя выбрать вместе');
    const text='review' in patch?review(patch.review):undefined;
    const {added:_a,recommended:_r,...previous}=next.videos[v.id]||{};
    const record={rating:null,later:false,review:null,mark:null,createdAt:now,...previous,...v,updatedAt:now};
    if('rating' in patch) record.rating=patch.rating;
    if('later' in patch) record.later=patch.later;
    if('mark' in patch) record.mark=patch.mark;
    if(patch.mark==='not_interested') record.later=false;
    else if(patch.later===true && record.mark==='not_interested') record.mark=null;
    if(text!==undefined){record.review=text;record.reviewedAt=text===null?null:now;}
    // No library: a video without rating, watch-later, review and mark is not kept.
    if(record.rating===null && !record.later && record.review===null && record.mark===null) delete next.videos[v.id];
    else next.videos[v.id]=record;
    delete next.channels;
    return next;
  }
  function deferDelete(action,schedule=(callback,ms)=>setTimeout(callback,ms),clear=timer=>clearTimeout(timer)){
    let active=true;const timer=schedule(()=>{if(!active)return;active=false;action();},5000);return()=>{active=false;clear(timer);};
  }
  function sameAuth(current,incoming,epoch){return current?.state==='authenticated'&&incoming?.state==='authenticated'&&typeof current.owner==='string'&&current.owner===incoming.owner&&current.epoch===epoch&&incoming.epoch===epoch;}
  globalThis.YPCore={empty,videoId,channelUrl,metadata,options,apply,deferDelete,sameAuth};
})();
