(() => {
 const sample=YPDemoCatalog[0];
 document.querySelector('.yt-title').textContent=sample.title;
 document.querySelector('.channel span').textContent=sample.channel+' · демонстрационная подборка';
 const player=document.querySelector('.player');
 player.style.backgroundImage='linear-gradient(#0005,#0009),url("'+sample.preview+'")';
 player.style.backgroundSize='cover';player.style.backgroundPosition='center';
 const watch=document.createElement('a');watch.href=sample.url;watch.target='_blank';watch.rel='noreferrer';watch.textContent='Смотреть на YouTube ↗';player.append(watch);
 const related=document.querySelector('#demo-related');
 for(const video of YPDemoCatalog.slice(1)){
  const link=document.createElement('a');link.href=video.url;link.target='_blank';link.rel='noreferrer';
  const image=document.createElement('img');image.src=video.preview;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';image.className='side-card';image.style.width='100%';image.style.objectFit='cover';
  const title=document.createElement('p');title.textContent=video.title;
  link.append(image,title);related.append(link);
 }
})();
