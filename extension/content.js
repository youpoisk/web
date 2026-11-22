(() => {
  let current=null, state=null, timer=null, generation=0, navigating=false, busy=false, nativeSizeObserver=null;
  // Unsaved review text per video: survives re-renders (rating/watch-later updates, YP_CHANGED, DOM refresh).
  const drafts=new Map();
  function context(){
    if(navigating)return null;
    const id=YPCore.videoId(location.href);
    if(!id)return null;
    const page=document.querySelector('ytd-watch-flexy');
    if(page?.getAttribute('video-id') && page.getAttribute('video-id')!==id)return null;
    const title=document.querySelector('ytd-watch-metadata h1 yt-formatted-string, #above-the-fold h1 yt-formatted-string, #title h1')?.textContent?.trim();
    const owner=document.querySelector('#owner ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a');
    if(!title)return null;
    return YPCore.metadata({id,title,channel:owner?.textContent?.trim(),channelUrl:owner?.getAttribute('href')});
  }
  function node(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
  function notify(text){const s=document.querySelector('#yp-panel .yp-status');if(s)s.textContent=text;}
  async function update(patch){
    if(busy)return false;
    const video=context();if(!video || video.id!==current?.id){schedule();return false;}
    busy=true;document.querySelectorAll('#yp-panel button').forEach(b=>b.disabled=true);
    try{state=await YP.request('UPDATE',{video,patch});if('review' in patch)drafts.delete(video.id);if(context()?.id===video.id){render();notify('Сохранено на этом устройстве');}return true;}
    catch(e){notify(e.message);return false;}finally{busy=false;document.querySelectorAll('#yp-panel button').forEach(b=>b.disabled=false);}
  }
  function scores(panel,value){
    const row=node('div','', 'yp-scores');
    for(let i=1;i<=10;i++){const b=node('button',String(i),value===i?'yp-active':'');b.type='button';b.setAttribute('aria-label',`Оценка видео: ${i}`);b.setAttribute('aria-pressed',String(value===i));b.onclick=()=>update({rating:i});row.append(b);}
    const clear=node('button','Сбросить');clear.type='button';clear.disabled=value==null;clear.onclick=()=>update({rating:null});row.append(clear);panel.append(row);
  }
  // «Неинтересно» / «Просмотрено» (YP-102) next to the rating; pressing the
  // active one again clears it.
  function marks(panel,value){
    const row=node('div','', 'yp-marks');row.setAttribute('role','group');row.setAttribute('aria-label','Отметка видео');
    for(const [mark,label] of [['not_interested','⊖ Неинтересно'],['watched','◉ Просмотрено']]){const b=node('button',label,value===mark?'yp-active':'');b.type='button';b.setAttribute('aria-pressed',String(value===mark));b.onclick=()=>update({mark:value===mark?null:mark});row.append(b);}
    panel.append(row);
  }
  function menuHost(){
    const menu=document.querySelector('ytd-watch-metadata #menu, #above-the-fold #menu');
    return menu?.querySelector('#top-level-buttons-computed')||menu;
  }
  function matchNativeRatingButton(rate,host){
    nativeSizeObserver?.disconnect();
    const segment=host.querySelector('segmented-like-dislike-button-view-model, ytd-segmented-like-dislike-button-renderer') || host;
    const native=[...segment.querySelectorAll('.ytSmartImationsContent')].find(el=>el.getBoundingClientRect().width>0) || (segment!==host?segment:null);
    if(!native)return;
    const label=segment.querySelector('.yt-core-attributed-string, .yt-spec-button-shape-next__button-text-content') || segment.querySelector('button') || native;
    const sync=()=>{
      if(!rate.isConnected)return;
      const rect=native.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0)return;
      const font=getComputedStyle(label);
      Object.assign(rate.style,{
        width:rect.width+'px',height:rect.height+'px',minWidth:rect.width+'px',
        borderRadius:(rect.height/2)+'px',boxSizing:'border-box',
        fontFamily:font.fontFamily,fontSize:font.fontSize,fontWeight:font.fontWeight,
        lineHeight:font.lineHeight,letterSpacing:font.letterSpacing,fontStyle:font.fontStyle,
      });
    };
    sync();nativeSizeObserver=new ResizeObserver(sync);nativeSizeObserver.observe(native);
  }
  function render(){
    const host=menuHost();
    if(!host||!current||!state)return;
    if(state.options.enabled===false){document.getElementById('yp-panel')?.remove();return;}
    const panel=node('div');panel.id='yp-panel';panel.setAttribute('aria-label','Действия YouPoisk');
    const saved=state.videos[current.id]||{};
    const rate=node('button','','yp-rate-trigger');const star=document.createElementNS('http://www.w3.org/2000/svg','svg');star.setAttribute('viewBox','0 0 24 24');star.setAttribute('aria-hidden','true');star.classList.add('yp-rate-icon');const starPath=document.createElementNS('http://www.w3.org/2000/svg','path');starPath.setAttribute('d','m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3.2 9.6l6.3-.9Z');star.append(starPath);rate.replaceChildren(star,node('span',saved.rating?String(saved.rating)+'/10':'Оценить','yp-rate-label'));if(saved.mark){const m=node('span',saved.mark==='watched'?'Просмотрено':'Неинтересно','yp-mark-chip');rate.append(m);}rate.type='button';rate.title='Оценка YouPoisk от 1 до 10';rate.setAttribute('aria-expanded','false');rate.setAttribute('aria-haspopup','dialog');
    const popover=node('div','', 'yp-rating-popover');popover.id='yp-rating-popover';popover.setAttribute('popover','auto');popover.setAttribute('role','dialog');popover.setAttribute('aria-label','Оценка YouPoisk');
    popover.append(node('strong','YouPoisk'),node('p','Ваша оценка видео'));scores(popover,saved.rating);marks(popover,saved.mark||null);
    popover.append(node('small','Сохраняется на этом устройстве.'));
    rate.onclick=()=>{
      if(popover.matches(':popover-open')){popover.hidePopover();return;}
      const rect=rate.getBoundingClientRect();
      popover.style.left=Math.max(8,Math.min(rect.left,innerWidth-350))+'px';
      popover.style.top=Math.max(8,Math.min(rect.bottom+8,innerHeight-260))+'px';
      popover.showPopover();
      const height=popover.getBoundingClientRect().height;popover.style.top=Math.max(8,Math.min(rect.bottom+8,innerHeight-height-8))+'px';
    };
    popover.addEventListener('toggle',()=>{rate.setAttribute('aria-expanded',String(popover.matches(':popover-open')));});
    const write=node('button',saved.review?'✎ Моя рецензия':'✎ Написать рецензию','yp-review');write.type='button';write.setAttribute('aria-pressed',String(!!saved.review));write.setAttribute('aria-haspopup','dialog');
    const editor=node('div','', 'yp-rating-popover yp-review-popover');editor.id='yp-review-popover';editor.setAttribute('popover','auto');editor.setAttribute('role','dialog');editor.setAttribute('aria-label','Рецензия YouPoisk');
    const area=node('textarea');area.rows=6;area.value=drafts.get(current.id)??(saved.review||'');area.placeholder='Что вы думаете об этом видео? До 1000 символов.';area.setAttribute('aria-label','Текст рецензии');
    const counter=node('small','', 'yp-counter');const video=current.id;const count=()=>{const n=[...area.value.trim()].length;counter.textContent=`${n}/1000`;counter.classList.toggle('yp-over',n>1000);};area.oninput=()=>{if(area.value===(saved.review||''))drafts.delete(video);else drafts.set(video,area.value);count();};count();
    const keep=node('button','Сохранить рецензию','yp-primary');keep.type='button';keep.onclick=async()=>{const text=area.value;if(!text.trim()){notify('Рецензия не может быть пустой');return;}if(await update({review:text}))document.getElementById('yp-review-popover')?.hidePopover();};
    const drop=node('button','Удалить рецензию');drop.type='button';drop.disabled=!saved.review;drop.onclick=async()=>{if(await update({review:null}))document.getElementById('yp-review-popover')?.hidePopover();};
    const actions=node('div','', 'yp-actions');actions.append(keep,drop);
    editor.append(node('strong','YouPoisk'),node('p','Ваша рецензия на видео'),area,counter,actions,node('small','Оценка или рецензия попадут в «Рекомендации» ваших друзей и подписчиков после подключения аккаунта. Сейчас сохраняется на этом устройстве.'));
    const openEditor=focus=>{
      const rect=write.getBoundingClientRect();
      editor.style.left=Math.max(8,Math.min(rect.left,innerWidth-350))+'px';
      editor.showPopover();
      const height=editor.getBoundingClientRect().height;editor.style.top=Math.max(8,Math.min(rect.bottom+8,innerHeight-height-8))+'px';if(focus)area.focus();
    };
    write.onclick=()=>{if(editor.matches(':popover-open'))editor.hidePopover();else openEditor(true);};
    editor.addEventListener('toggle',()=>{write.setAttribute('aria-expanded',String(editor.matches(':popover-open')));});
    const later=node('button',saved.later?'✓ Посмотрю позже':'＋ Посмотрю позже','yp-save');later.type='button';later.setAttribute('aria-pressed',String(!!saved.later));later.onclick=()=>update({later:!saved.later});
    const status=node('div','', 'yp-status');status.setAttribute('role','status');
    panel.append(rate,later,write,popover,editor,status);
    const old=document.getElementById('yp-panel');const reopen=!!old?.querySelector('#yp-review-popover:popover-open');const typing=old?.querySelector('#yp-review-popover textarea')===document.activeElement;if(old)old.replaceWith(panel);else {const likes=[...host.children].find(el=>el.matches('segmented-like-dislike-button-view-model, ytd-segmented-like-dislike-button-renderer')||el.querySelector('segmented-like-dislike-button-view-model, ytd-segmented-like-dislike-button-renderer'));if(likes)likes.after(panel);else host.prepend(panel);}matchNativeRatingButton(rate,host);
    if(reopen)openEditor(typing);
  }
  async function refresh(){
    timer=null;const version=++generation;
    const video=context();if(!video){current=null;document.getElementById('yp-panel')?.remove();return;}
    try{const next=await YP.request('GET');if(version!==generation || context()?.id!==video.id)return;state=next;current=video;render();}
    catch(e){notify(e.message);}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(refresh,200);}
  document.addEventListener('yt-navigate-start',()=>{navigating=true;generation++;current=null;nativeSizeObserver?.disconnect();document.getElementById('yp-panel')?.remove();});
  document.addEventListener('yt-navigate-finish',()=>{navigating=false;schedule();});
  const observer=new MutationObserver(records=>{if(records.every(r=>r.target.closest?.('#yp-panel')))return;if(!document.getElementById('yp-panel') || document.getElementById('yp-panel')?.parentElement!==menuHost() || context()?.id!==current?.id)schedule();});
  observer.observe(document.body,{childList:true,subtree:true});
  if(YP.installed)YPAPI.runtime.onMessage.addListener((message,_sender,respond)=>{
    if(message.type==='YP_CONTEXT'){respond({video:context()});return;}
    if(message.type==='YP_CHANGED')schedule();
  });else YP.subscribe(schedule);
  schedule();
})();
