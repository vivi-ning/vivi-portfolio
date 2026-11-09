let showcaseCleanup=()=>{},activeShowcaseIndex=0,showcaseAutoPreference=null;
function featuredScene(){return `<section class="selected-section cinematic-section" aria-labelledby="featured-title"><div class="feature-showcase" role="region" aria-roledescription="轮播" aria-label="精选项目展示" tabindex="0"><div class="feature-backdrop" aria-hidden="true"></div><div class="feature-shade" aria-hidden="true"></div><header class="feature-topline"><div class="feature-section-name"><p>03 / SELECTED WORK</p><h2 id="featured-title">精选作品</h2></div></header><div class="feature-top-actions"><a href="#works"><span>查看全部案例</span><span class="feature-all-count">${PROJECTS.filter(p=>!p.mergedInto).length}</span><span aria-hidden="true">↗</span></a></div><div class="feature-layout"><div class="feature-copy"></div><div class="feature-card-rail" role="group" aria-label="切换精选项目"></div></div><div class="feature-controls"><div class="feature-navigation"><button type="button" class="feature-prev" aria-label="上一个精选项目">←</button><button type="button" class="feature-next" aria-label="下一个精选项目">→</button><button type="button" class="feature-play" aria-label="暂停自动切换"></button></div><div class="feature-progress" aria-hidden="true"><span></span></div><p class="feature-counter"><span class="feature-current">01</span><span class="feature-total">/ ${String(FEATURED.length).padStart(2,'0')}</span></p></div><p class="profile-sr-only feature-status" role="status" aria-live="polite"></p></div></section>`}
function setupShowcase(){
 const root=main.querySelector('.feature-showcase');if(!root)return;
 const backdrop=root.querySelector('.feature-backdrop'),copy=root.querySelector('.feature-copy'),rail=root.querySelector('.feature-card-rail'),toggle=root.querySelector('.feature-play'),progress=root.querySelector('.feature-progress>span');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set();
 let index=activeShowcaseIndex%FEATURED.length,busy=false,pending=null,disposed=false,timer=null,clock=null,visible=false,hovered=false,focused=false,wantAuto=!reduce.matches&&(showcaseAutoPreference===null?innerWidth>700:showcaseAutoPreference),touch=null,suppressClickUntil=0;
 const projectAt=i=>PROJECTS[FEATURED[(i+FEATURED.length)%FEATURED.length]],duration=6500;
 const format=i=>String(i+1).padStart(2,'0');
 const titleLines={1:['Zicony','纯净美妆电商'],4:['志愿者','共享空间'],2:['WHITE CRANE','海外品牌设计'],0:['Magicfix','品牌 VI 设计'],14:['MOVIY OY','日化品牌视觉']};
 function animate(el,frames,options){const a=el.animate(frames,{easing:'cubic-bezier(.22,1,.36,1)',...options});animations.add(a);a.finished.then(()=>animations.delete(a)).catch(()=>animations.delete(a));return a;}
 function stopClock(){clearTimeout(timer);timer=null;clock?.cancel();clock=null;progress.style.transform='scaleX(0)'}
 function updateToggle(){toggle.textContent=wantAuto?'Ⅱ':'▷';toggle.disabled=reduce.matches;toggle.setAttribute('aria-label',reduce.matches?'已根据系统设置关闭自动切换':wantAuto?'暂停自动切换':'播放自动切换');}
 function schedule(){stopClock();updateToggle();if(disposed||busy||!wantAuto||reduce.matches||!visible||hovered||focused||document.hidden)return;clock=progress.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration,easing:'linear',fill:'forwards'});timer=setTimeout(()=>select(index+1,false),duration);}
 function paintContent(){const p=projectAt(index);root.dataset.project=String(p.id);root.dataset.coverKind=SHOWCASE_COVERS[p.id]?.kind||(SHOWCASE_COVERS[p.id]?'concept':'original');copy.innerHTML=`<p class="feature-category">${format(index)} / ${esc(p.category)}</p><h3 aria-label="${esc(p.title)}">${(titleLines[p.id]||[p.title]).map(line=>`<span>${esc(line)}</span>`).join('')}</h3><p class="feature-description">${esc(p.description.replace(/^策划方案｜/,''))}</p><a class="feature-open" href="#project/${p.id}" aria-label="查看精选项目：${esc(p.title)}"><span>查看项目</span><span aria-hidden="true">↗</span></a>`;rail.innerHTML=Array.from({length:FEATURED.length-1},(_,offset)=>{const i=(index+offset+1)%FEATURED.length,item=projectAt(i);return `<button type="button" class="feature-card" data-feature-index="${i}" aria-label="切换到：${esc(item.title)}"><img src="${esc(showcaseArt(item))}" style="object-position:${esc(showcaseArtFocus(item))}" alt="" loading="eager" decoding="async"><span class="feature-card-label"><span>${format(i)} / ${esc(item.category)}</span><strong>${esc(item.title)}</strong></span></button>`}).join('');root.querySelector('.feature-current').textContent=format(index);rail.querySelectorAll('[data-feature-index]').forEach(button=>button.addEventListener('click',()=>{const restoreFocus=document.activeElement===button;select(+button.dataset.featureIndex,true);if(restoreFocus)copy.querySelector('.feature-open').focus({preventScroll:true})}));}
 function paintBackground(){const p=projectAt(index);backdrop.innerHTML=`<img src="${esc(showcaseArt(p))}" style="object-position:${esc(showcaseArtFocus(p))}" alt="" loading="eager" decoding="async">`;}
 function select(next,manual=true){
  next=(next+FEATURED.length)%FEATURED.length;
  if(disposed)return;
  if(busy){pending={index:next,manual};return}
  if(next===index){schedule();return}
  stopClock();
  const oldIndex=index,direction=(next-oldIndex+FEATURED.length)%FEATURED.length===FEATURED.length-1?-1:1;
  const previousCards=new Map([...rail.querySelectorAll('[data-feature-index]')].map(el=>[+el.dataset.featureIndex,el.getBoundingClientRect()]));
  const card=rail.querySelector(`[data-feature-index="${next}"]`),start=card?.getBoundingClientRect(),frame=root.getBoundingClientRect();
  const oldCopyRect=copy.getBoundingClientRect(),startRadius=card?getComputedStyle(card).borderTopLeftRadius:'22px';
  let outgoingCopy,zoom,zoomImage,imageStart,imageEnd,clipStart;
  if(!reduce.matches){
   outgoingCopy=copy.cloneNode(true);outgoingCopy.className='feature-copy feature-copy-exit';outgoingCopy.setAttribute('aria-hidden','true');outgoingCopy.querySelectorAll('a,button').forEach(el=>el.tabIndex=-1);
   Object.assign(outgoingCopy.style,{position:'absolute',left:`${oldCopyRect.left-frame.left}px`,top:`${oldCopyRect.top-frame.top}px`,width:`${oldCopyRect.width}px`,zIndex:'3',pointerEvents:'none'});root.append(outgoingCopy);
  }
  index=next;activeShowcaseIndex=index;const p=projectAt(index);
  if(!reduce.matches&&start){
   const sourceImage=card.querySelector('img'),naturalWidth=sourceImage.naturalWidth||frame.width,naturalHeight=sourceImage.naturalHeight||frame.height;
   const position=showcaseArtFocus(p).trim().split(/\s+/);
   const positionValue=(value,axis)=>{if(!value||value==='center')return .5;if(value==='left'||value==='top')return 0;if(value==='right'||value==='bottom')return 1;return value.endsWith('%')?parseFloat(value)/100:.5};
   const fx=positionValue(position[0],'x'),fy=positionValue(position[1],'y');
   const imageBounds=(width,height,left=0,top=0)=>{const scale=Math.max(width/naturalWidth,height/naturalHeight),w=naturalWidth*scale,h=naturalHeight*scale;return {left:`${left+(width-w)*fx}px`,top:`${top+(height-h)*fy}px`,width:`${w}px`,height:`${h}px`}};
   imageStart=imageBounds(start.width,start.height,start.left-frame.left,start.top-frame.top);imageEnd=imageBounds(frame.width,frame.height);
   clipStart=`inset(${start.top-frame.top}px ${frame.right-start.right}px ${frame.bottom-start.bottom}px ${start.left-frame.left}px round ${startRadius})`;
   zoom=document.createElement('div');zoom.className='feature-zoom feature-expand';zoom.setAttribute('aria-hidden','true');zoom.innerHTML=`<img src="${esc(showcaseArt(p))}" alt=""><span class="feature-expand-tint"></span>`;
   Object.assign(zoom.style,{left:'0px',top:'0px',width:`${frame.width}px`,height:`${frame.height}px`,clipPath:clipStart,zIndex:'2',boxShadow:'none'});
   zoomImage=zoom.querySelector('img');Object.assign(zoomImage.style,{position:'absolute',maxWidth:'none',maxHeight:'none',...imageStart});
   const tint=zoom.querySelector('.feature-expand-tint');Object.assign(tint.style,{position:'absolute',inset:'0',background:getComputedStyle(root.querySelector('.feature-shade')).backgroundColor,opacity:'0'});root.append(zoom);
  }
  paintContent();
  if(manual)root.querySelector('.feature-status').textContent=`${format(index)} / ${FEATURED.length}，${p.title}`;
  if(reduce.matches){paintBackground();schedule();return}
  busy=true;
  const compact=innerWidth<=700,expandDuration=compact?720:1050;
  animate(outgoingCopy,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-22px)'}],{duration:200,fill:'forwards'}).finished.then(()=>outgoingCopy.remove()).catch(()=>outgoingCopy.remove());
  const textParts=[copy.querySelector('.feature-category'),...copy.querySelectorAll('h3>span'),copy.querySelector('.feature-description'),copy.querySelector('.feature-open')].filter(Boolean);
  textParts.forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:compact?440:620,delay:(compact?130:240)+i*(compact?45:65),fill:'backwards'}));
  [...rail.querySelectorAll('[data-feature-index]')].forEach((el,i)=>{
   const target=el.getBoundingClientRect(),previous=previousCards.get(+el.dataset.featureIndex);
   const dx=previous?previous.left-target.left:direction*(target.width+18),dy=previous?previous.top-target.top:0;
   animate(el,[{transform:`translate3d(${dx}px,${dy}px,0)`,opacity:previous?1:0},{transform:'translate3d(0,0,0)',opacity:1}],{duration:compact?580:820,delay:(compact?70:150)+i*30,fill:'backwards'});
  });
  animate(root.querySelector('.feature-current'),[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,delay:250,fill:'backwards'});
  const finish=()=>{
   if(disposed)return;
   paintBackground();zoom?.remove();outgoingCopy?.remove();busy=false;
   if(pending){const request=pending;pending=null;select(request.index,request.manual)}else schedule();
  };
  if(zoomImage){
   animate(zoomImage,[imageStart,imageEnd],{duration:expandDuration,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
   animate(zoom.querySelector('.feature-expand-tint'),[{opacity:0},{opacity:1}],{duration:expandDuration*.55,delay:expandDuration*.35,easing:'ease-in-out',fill:'forwards'});
  }
  const transition=zoom?animate(zoom,[{clipPath:clipStart},{clipPath:'inset(0px 0px 0px 0px round 0px)'}],{duration:expandDuration,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}):animate(backdrop,[{opacity:.25},{opacity:1}],{duration:expandDuration});
  transition.finished.then(finish).catch(()=>{if(!disposed)finish()});
 }

 let coversLoaded=false;const coverObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){coversLoaded=true;paintBackground();paintContent();updateToggle();coverObserver.disconnect()}},{rootMargin:'300px 0px'});coverObserver.observe(root);
 root.querySelector('.feature-prev').addEventListener('click',()=>select((pending?.index??index)-1));root.querySelector('.feature-next').addEventListener('click',()=>select((pending?.index??index)+1));
 toggle.addEventListener('click',()=>{wantAuto=!wantAuto;showcaseAutoPreference=wantAuto;if(wantAuto){hovered=false;focused=false}schedule()});
 root.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){hovered=true;schedule()}});root.addEventListener('pointerleave',()=>{hovered=false;schedule()});
 root.addEventListener('focusin',()=>{focused=true;schedule()});root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){focused=false;schedule()}});
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select((pending?.index??index)+(e.key==='ArrowRight'?1:-1));if(e.target.closest('.feature-card'))copy.querySelector('.feature-open').focus({preventScroll:true})}});
 root.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch={x:e.clientX,y:e.clientY}});root.addEventListener('pointercancel',()=>touch=null);root.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){suppressClickUntil=performance.now()+350;select((pending?.index??index)+(dx<0?1:-1))}});root.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.35;schedule()},{threshold:.35});observer.observe(root);
 const visibility=()=>schedule(),preference=()=>{if(reduce.matches){wantAuto=false;animations.forEach(a=>a.finish())}schedule()};document.addEventListener('visibilitychange',visibility);reduce.addEventListener('change',preference);
 showcaseCleanup=()=>{disposed=true;stopClock();observer.disconnect();coverObserver.disconnect();animations.forEach(a=>a.cancel());root.querySelectorAll('.feature-zoom,.feature-copy-exit').forEach(el=>el.remove());document.removeEventListener('visibilitychange',visibility);reduce.removeEventListener('change',preference)};
}
