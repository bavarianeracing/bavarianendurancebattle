/* BEB Inspiration page renderer. Normally you never need to edit this file. */
(() => {
  'use strict';
  const CATEGORIES = [
    ['all','ALL VIDEOS'],['dtm','DTM'],['btcc','BTCC'],['gt3','GT3'],
    ['lemans','LE MANS'],['endurance','ENDURANCE'],['m1','M1 PROCARS'],
    ['csl','E9 CSL'],['group5','GROUP 5'],['history','HISTORY'],
    ['compilations','COMPILATIONS'],['engineering','ENGINEERING'],['privateers','PRIVATEERS']
  ];
  const videos = Array.isArray(window.BEB_INSPIRATION_VIDEOS) ? window.BEB_INSPIRATION_VIDEOS : [];
  const $ = id => document.getElementById(id);
  const grid = $('video-grid'), featured = $('featured'), filters = $('filters'), search = $('search');
  const dialog = $('video-dialog'), player = $('player');
  let activeCategory = 'all';

  function youtubeId(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase().replace(/^www\./,'').replace(/^m\./,'');
      let id = null;
      if (host === 'youtu.be') id = parsed.pathname.slice(1).split('/')[0];
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (parsed.pathname === '/watch') id = parsed.searchParams.get('v');
        else if (/^\/(shorts|embed|live)\//.test(parsed.pathname)) id = parsed.pathname.split('/')[2];
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    } catch { return null; }
  }
  const items = videos.map((v, index) => ({...v, id:youtubeId(v.url), index}))
    .filter(v => v.id && typeof v.title === 'string' && Array.isArray(v.categories));

  function makeCard(v) {
    const card = document.createElement('article');card.className='video-card';
    const thumb = document.createElement('button');thumb.type='button';thumb.className='thumb';
    thumb.setAttribute('aria-label',`Play ${v.title}`);
    const img = document.createElement('img');img.src=`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    img.alt=`Thumbnail: ${v.title}`;img.loading='lazy';
    const play = document.createElement('span');play.className='play';play.textContent='▶';play.setAttribute('aria-hidden','true');
    thumb.append(img,play);thumb.addEventListener('click',()=>openPlayer(v));
    const body=document.createElement('div');body.className='video-body';
    const meta=document.createElement('div');meta.className='meta';
    meta.textContent=(v.categories||[]).map(c => CATEGORIES.find(x=>x[0]===c)?.[1]||c.toUpperCase()).join(' · ');
    const title=document.createElement('h3');title.textContent=v.title;
    const description=document.createElement('p');description.textContent=v.description||'';
    const watch=document.createElement('a');watch.className='watch';watch.href=`https://www.youtube.com/watch?v=${v.id}`;
    watch.target='_blank';watch.rel='noopener noreferrer';watch.textContent='WATCH ON YOUTUBE ↗';
    body.append(meta,title,description,watch);card.append(thumb,body);return card;
  }
  function render() {
    const query=search.value.trim().toLowerCase();
    const matches=items.filter(v => (activeCategory==='all'||v.categories.includes(activeCategory)) &&
      [v.title,v.description,v.source,...v.categories].join(' ').toLowerCase().includes(query));
    grid.replaceChildren(...matches.map(makeCard));
    $('count').textContent=`${matches.length} film${matches.length===1?'':'s'}`;
    $('empty').classList.toggle('hidden',matches.length!==0);
    filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===activeCategory)));
  }
  function openPlayer(v) {
    $('dialog-title').textContent=v.title;
    $('youtube-fallback').href=`https://www.youtube.com/watch?v=${v.id}`;
    const iframe=document.createElement('iframe');
    iframe.src=`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
    iframe.title=v.title;iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;
    player.replaceChildren(iframe);
    if (typeof dialog.showModal==='function') dialog.showModal(); else window.open($('youtube-fallback').href,'_blank','noopener');
  }
  function closePlayer(){dialog.close();player.replaceChildren();}
  CATEGORIES.forEach(([key,label])=>{
    const b=document.createElement('button');b.className='filter';b.type='button';b.textContent=label;
    b.dataset.category=key;b.setAttribute('aria-pressed',String(key==='all'));
    b.addEventListener('click',()=>{activeCategory=key;render();});filters.append(b);
  });
  featured.replaceChildren(...items.filter(v=>v.featured).slice(0,2).map(makeCard));
  if (!featured.children.length) {featured.textContent='Featured films coming soon.';featured.className='empty';}
  search.addEventListener('input',render);
  $('close-player').addEventListener('click',closePlayer);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closePlayer();});
  dialog.addEventListener('close',()=>player.replaceChildren());
  render();
})();
