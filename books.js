/* Original physical book interaction, retained with its original page assets. */
window.BOOKS = PROJECTS[9].books;
function hdUrl(url){return url}
function bookShelf(){const groups=[...new Set(BOOKS.map(b=>b.series||'宣传册'))];return `<p class="book-instruction">选择一本宣传册，拿起、翻阅，再合上放回。</p><div class="brochure-library">${groups.map((group,g)=>`<section class="brochure-series"><header><span>0${g+1} / EDITORIAL DESIGN</span><h3>${esc(group)}</h3></header><div class="brochure-shelf">${BOOKS.map((b,i)=>b.series===group?`<button class="closed-volume" data-volume="${i}" style="--book-aspect:${b.pageAspect||1}" aria-label="拿起并阅读${esc(b.title)}"><span class="brochure-object"><img src="${b.pages[0]}" loading="lazy" alt="${esc(b.title)}封面"></span><span class="brochure-label"><strong>${esc(b.title)}</strong><span>翻开阅读 ↗</span></span></button>`:'').join('')}</div></section>`).join('')}</div><dialog class="reading-room" aria-labelledby="reading-title"><div class="reading-top"><h2 id="reading-title"></h2><button class="put-book-away">合上并放回 ×</button></div><div class="volume-space"><div class="open-volume"><div class="paper-base paper-left"></div><div class="paper-base paper-right"></div><div class="turning-leaf"><div class="leaf-front"></div><div class="leaf-back"></div></div><button class="page-hit hit-left" aria-label="点击左页，翻到上一页"></button><button class="page-hit hit-right" aria-label="点击右页，翻到下一页"></button></div></div><div class="reading-bottom"><span class="reading-status" aria-live="polite"></span><span>点击左右书页翻阅 · 支持方向键 ← →</span></div></dialog>`}
function setupBooks(){
 const room=main.querySelector('.reading-room');if(!room)return;
 const volume=room.querySelector('.open-volume'),left=room.querySelector('.paper-left'),right=room.querySelector('.paper-right'),leaf=room.querySelector('.turning-leaf'),front=room.querySelector('.leaf-front'),back=room.querySelector('.leaf-back'),prev=room.querySelector('.hit-left'),next=room.querySelector('.hit-right');
 room.addEventListener('close',()=>{document.body.classList.remove('modal-open');main.querySelectorAll('.is-picked').forEach(b=>b.classList.remove('is-picked'))});
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let book,index=0,busy=false,source,closing=false;
 function face(el,n,side){
  const cover=n===0||n===book.pages.length-1;
  const blank=cover&&((n===0&&side==='left')||(n>0&&side==='right'));
  el.style.backgroundImage=blank?'none':`url("${hdUrl(book.pages[n])}")`;
  el.style.backgroundSize=cover?'100% 100%':'200% 100%';
  el.style.backgroundPosition=side==='left'?'left center':'right center';
  el.style.visibility=blank?'hidden':'visible';
 }
 function update(){face(left,index,'left');face(right,index,'right');prev.disabled=index===0;next.disabled=index===book.pages.length-1;room.querySelector('.reading-status').textContent=index===0?'封面 · 点击打开':index===book.pages.length-1?'封底':`${book.title} · ${index} / ${book.pages.length-2}`;}
 async function turn(dir){
  if(busy||closing||index+dir<0||index+dir>=book.pages.length)return;
  busy=true;const dest=index+dir;book.pages.slice(Math.max(0,dest-1),dest+3).forEach(src=>{const im=new Image();im.src=hdUrl(src)});
  // The turning sheet carries actual artwork on both sides, hinged at the spine.
  leaf.classList.toggle('reverse',dir<0);
  face(front,index,dir>0?'right':'left');face(back,dest,dir>0?'left':'right');
  if(dir>0)face(right,dest,'right');else face(left,dest,'left');
  leaf.style.display='block';leaf.style.visibility='visible';
  const animation=leaf.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${dir>0?-180:180}deg)`}],{duration:reduce?0:950,easing:'cubic-bezier(.32,.05,.2,1)',fill:'forwards'});
  await animation.finished.catch(()=>{});
  index=dest;update();leaf.style.display='none';leaf.style.visibility='hidden';animation.cancel();busy=false;
 }
 async function putAway(){if(closing||busy)return;closing=true;
  if(index!==0){leaf.classList.add('reverse');face(front,index,'left');face(back,0,'right');leaf.style.display='block';leaf.style.visibility='visible';left.style.visibility='hidden';const fold=leaf.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:reduce?0:550,easing:'ease-in-out',fill:'forwards'});await fold.finished.catch(()=>{});index=0;update();leaf.style.display='none';leaf.style.visibility='hidden';fold.cancel();}
  const rect=source.getBoundingClientRect(),target=volume.getBoundingClientRect();
  const a=volume.animate([{transform:'none',opacity:1},{transform:`translate(${rect.left+rect.width/2-target.left-target.width/2}px,${rect.top+rect.height/2-target.top-target.height/2}px) scale(.25) rotate(-8deg)`,opacity:0}],{duration:reduce?0:450,easing:'ease-in',fill:'forwards'});await a.finished.catch(()=>{});room.close();document.body.classList.remove('modal-open');a.cancel();source.classList.remove('is-picked');source.focus();closing=false;}
 main.querySelectorAll('[data-volume]').forEach(button=>button.onclick=async()=>{
  if(room.open)return;source=button;book=BOOKS[+button.dataset.volume];const ratio=2*(book.pageAspect||1);volume.style.aspectRatio=ratio;volume.style.width=`min(92vw,1200px,calc((100dvh - 210px) * ${ratio}))`;index=0;busy=true;room.querySelector('#reading-title').textContent=book.title;update();
  const origin=button.getBoundingClientRect();room.showModal();document.body.classList.add('modal-open');button.classList.add('is-picked');
  const target=right.getBoundingClientRect();
  await volume.animate([{transform:`translate(${origin.left-target.left}px,${origin.top-target.top}px) scale(${origin.width/target.width}) rotate(-8deg)`,opacity:.5},{transform:'none',opacity:1}],{duration:reduce?0:650,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.catch(()=>{});
  book.pages.slice(0,4).forEach(src=>{const preload=new Image();preload.src=hdUrl(src)});busy=false;await turn(1);next.focus({preventScroll:true});
 });
 prev.onclick=()=>turn(-1);next.onclick=()=>turn(1);
 room.querySelector('.put-book-away').onclick=putAway;
 room.addEventListener('cancel',e=>{e.preventDefault();putAway()});
 room.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();turn(e.key==='ArrowRight'?1:-1)}});
}
