(() => {
  let current=null, state=null, timer=null, generation=0, navigating=false, busy=false;
  const demo=document.body.dataset.demo==='true';
  function context(){
    if(navigating)return null;
    const id=demo?'aqz-KE-bpKQ':YPCore.videoId(location.href);
    if(!id)return null;
    const page=document.querySelector('ytd-watch-flexy');
    if(page?.getAttribute('video-id') && page.getAttribute('video-id')!==id)return null;
    const title=demo?'Мир, который мы почти не замечаем':document.querySelector('ytd-watch-metadata h1 yt-formatted-string, #above-the-fold h1 yt-formatted-string, #title h1')?.textContent?.trim();
    const owner=document.querySelector('#owner ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a');
    if(!title)return null;
    return YPCore.metadata({id,title,channel:demo?'Наука рядом':owner?.textContent?.trim(),channelUrl:demo?'https://www.youtube.com/@YouTube':owner?.getAttribute('href')});
  }
  function node(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
  function notify(text){const s=document.querySelector('#yp-panel .yp-status');if(s)s.textContent=text;}
  async function update(patch){
    if(busy)return;
    const video=context();if(!video || video.id!==current?.id){schedule();return;}
    busy=true;document.querySelectorAll('#yp-panel button').forEach(b=>b.disabled=true);
    try{state=await YP.request('UPDATE',{video,patch});if(context()?.id===video.id){render();notify('Сохранено на этом устройстве');}}
    catch(e){notify(e.message);}finally{busy=false;document.querySelectorAll('#yp-panel button').forEach(b=>b.disabled=false);}
  }
  function scores(panel,key,value){
    const row=node('div','', 'yp-scores');
    for(let i=1;i<=10;i++){const b=node('button',String(i),value===i?'yp-active':'');b.type='button';b.setAttribute('aria-label',`${key==='rating'?'Видео':'Канал'}: оценка ${i}`);b.setAttribute('aria-pressed',String(value===i));b.onclick=()=>update({[key]:i});row.append(b);}
    const clear=node('button','Сбросить');clear.type='button';clear.disabled=value==null;clear.onclick=()=>update({[key]:null});row.append(clear);panel.append(row);
  }
  function render(){
    const host=document.querySelector('#above-the-fold #title, #below #title')||document.querySelector('ytd-watch-metadata h1')||document.getElementById('demo-inject');
    if(!host||!current||!state)return;
    if(state.options.enabled===false){document.getElementById('yp-panel')?.remove();return;}
    const panel=node('section');panel.id='yp-panel';panel.setAttribute('aria-label','Панель YouPoisk');
    const top=node('div','', 'yp-top');top.append(node('strong','YouPoisk'),node('small','НА ЭТОМ УСТРОЙСТВЕ'));panel.append(top);
    const saved=state.videos[current.id]||{};
    panel.append(node('p','Ваша оценка видео'));scores(panel,'rating',saved.rating);
    const actions=node('div','', 'yp-actions');
    const later=node('button',saved.later?'✓ В «Посмотрю позже»':'＋ Посмотрю позже','yp-save');later.type='button';later.setAttribute('aria-pressed',String(!!saved.later));later.onclick=()=>update({later:!saved.later});
    const add=node('button',saved.added?'✓ В библиотеке':'Добавить в библиотеку');add.type='button';add.disabled=!!saved.added;add.onclick=()=>update({added:true});actions.append(later,add);panel.append(actions);
    if(state.options.channel && current.channelUrl){const details=node('details');details.append(node('summary',`Оценить канал · ${current.channel||'YouTube'}`));scores(details,'channelRating',state.channels[current.channelUrl]?.rating);panel.append(details);}
    const status=node('div','Локальный режим. Синхронизация с сайтом появится после подключения API.','yp-status');status.setAttribute('role','status');panel.append(status);
    const old=document.getElementById('yp-panel');if(old)old.replaceWith(panel);else host.insertAdjacentElement('afterend',panel);
  }
  async function refresh(){
    timer=null;const version=++generation;
    const video=context();if(!video){current=null;document.getElementById('yp-panel')?.remove();return;}
    try{const next=await YP.request('GET');if(version!==generation || context()?.id!==video.id)return;state=next;current=video;render();}
    catch(e){notify(e.message);}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(refresh,200);}
  document.addEventListener('yt-navigate-start',()=>{navigating=true;generation++;current=null;document.getElementById('yp-panel')?.remove();});
  document.addEventListener('yt-navigate-finish',()=>{navigating=false;schedule();});
  const observer=new MutationObserver(records=>{if(records.every(r=>r.target.closest?.('#yp-panel')))return;if(!document.getElementById('yp-panel') || context()?.id!==current?.id)schedule();});
  observer.observe(document.body,{childList:true,subtree:true});
  if(YP.installed)chrome.runtime.onMessage.addListener((message,_sender,respond)=>{
    if(message.type==='YP_CONTEXT'){respond({video:context()});return;}
    if(message.type==='YP_CHANGED')schedule();
  });else YP.subscribe(schedule);
  schedule();
})();
