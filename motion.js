/* All motion is additive. Navigation and scrolling remain native and interruptible. */
let motionPageCleanup=()=>{},routeMotionCleanup=()=>{},introMotionPlayed=false;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const motionEase='cubic-bezier(.22,1,.36,1)';
function setupPageMotion(){
 motionPageCleanup();
 if(motionPreference.matches)return;
 const animations=new Set(),observers=[],removers=[];let frame=0,disposed=false;
 function animate(el,frames,options){if(!el)return;const animation=el.animate(frames,{easing:motionEase,fill:'both',...options});animations.add(animation);animation.finished.then(()=>{animations.delete(animation);if(!disposed)animation.cancel()}).catch(()=>{});return animation;}
 const hero=main.querySelector('.entrance-shell');
 if(hero&&!introMotionPlayed&&scrollY<innerHeight*.25){
  introMotionPlayed=true;
  animate(hero.querySelector('.entrance-eyebrow'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:50});
  hero.querySelectorAll('.entrance-title>span').forEach((line,i)=>animate(line,[{opacity:0,transform:'translateY(28px)',filter:'blur(5px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:1000,delay:100+i*100}));
  animate(hero.querySelector('.entrance-caption'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,delay:340});
  hero.querySelectorAll('.key-arrival').forEach((key,i)=>animate(key,[{opacity:0,transform:`translate3d(0,55px,-25px) rotateZ(${i%2?9:-9}deg)`,offset:0},{opacity:1,transform:'translate3d(0,-6px,0) rotateZ(0deg)',offset:.72},{opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg)',offset:1}],{duration:1100,delay:260+i*105}));
 }
 const clamp=value=>Math.max(0,Math.min(1,value));
 const heroTitle=hero?.querySelector('.entrance-title'),stage=hero?.querySelector('.keyboard-stage'),feature=main.querySelector('.hero-project-link');
 function paintScroll(){frame=0;if(disposed)return;const small=innerWidth<=700;
  if(hero){const rect=hero.getBoundingClientRect(),progress=clamp(-rect.top/Math.max(1,rect.height));heroTitle.style.setProperty('--title-drift',`${-progress*(small?18:66)}px`);heroTitle.style.setProperty('--title-opacity',String(1-progress*.58));stage.style.setProperty('--keys-drift',`${-progress*(small?28:110)}px`);hero.style.setProperty('--detail-opacity',String(1-progress*.65));}
  if(feature){const rect=feature.parentElement.getBoundingClientRect(),progress=clamp((innerHeight-rect.top)/(innerHeight*.9));feature.style.setProperty('--project-scale',String((small ? 0.98 : 0.94)+(small ? 0.02 : 0.06)*progress));feature.style.setProperty('--project-lift',`${(1-progress)*(small?10:28)}px`);feature.style.setProperty('--project-opacity',String(.78+.22*progress));}
 }
 const onScroll=()=>{if(!frame)frame=requestAnimationFrame(paintScroll)};
 if(hero||feature){paintScroll();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});removers.push(()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll)})}
 const revealNodes=[...main.querySelectorAll('.profile-identity,.profile-story,.profile-capabilities,.project-card,.section-heading,.statement>div,.note-block,.gallery-figure,.gallery-heading,.about-content,.capability-grid article,.contact-band')];
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;observer.unobserve(el);const delay=el.matches('.project-card')&&innerWidth>600?(revealNodes.indexOf(el)%2)*75:0;el.classList.remove('motion-ready');animate(el,[{opacity:0,transform:'translate3d(0,24px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:800,delay});}},{threshold:.04,rootMargin:'0px 0px -24px 0px'});
 observers.push(observer);
 revealNodes.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight*.95){el.classList.add('motion-ready');observer.observe(el)}});
 const projectIntro=main.querySelector('.project-intro');if(projectIntro)projectIntro.querySelectorAll('.eyebrow,h1,p:not(.eyebrow),.project-meta').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:60+i*55}));
 const onPreference=()=>{if(motionPreference.matches)motionPageCleanup()};motionPreference.addEventListener('change',onPreference);
 motionPageCleanup=()=>{disposed=true;cancelAnimationFrame(frame);animations.forEach(a=>a.cancel());observers.forEach(o=>o.disconnect());removers.forEach(fn=>fn());motionPreference.removeEventListener('change',onPreference);revealNodes.forEach(el=>el.classList.remove('motion-ready'));heroTitle?.style.removeProperty('--title-drift');heroTitle?.style.removeProperty('--title-opacity');stage?.style.removeProperty('--keys-drift');hero?.style.removeProperty('--detail-opacity');if(feature)for(const name of ['--project-scale','--project-lift','--project-opacity'])feature.style.removeProperty(name)};
}
function routeParts(hash){try{const [name,arg]=decodeURIComponent((hash||'#home').slice(1)).split('/');return {name:!name||name==='intro'?'home':name,arg}}catch{return {name:'invalid'}}}
function findCoverLink(id){const sceneCandidate=main.querySelector(`.feature-showcase[data-project="${id}"]`);const scene=sceneCandidate?.dataset.coverKind==='concept'?null:sceneCandidate;const zoom=scene?.querySelector('.feature-zoom');if(zoom)return zoom;const covers=[...main.querySelectorAll(`a[href="#project/${id}"] .card-media,a[href="#project/${id}"] .capability-example-image,a.hero-project-link[href="#project/${id}"]`),...(scene?[scene.querySelector('.feature-backdrop')]:[])].filter(Boolean);return covers.find(el=>{const rect=el.getBoundingClientRect();return rect.width>0&&rect.bottom>0&&rect.top<innerHeight})||covers[0]||null}
function navigateWithMotion(){
 routeMotionCleanup();
 const before=routeParts(currentRoute),after=routeParts(location.hash);if(before.name==='home'&&after.name==='home'){currentRoute=location.hash||'#home';window.scrollTo({top:homeScreenTop(after.arg),behavior:motionPreference.matches?'instant':'smooth'});return}let source=null,id;
 if(after.name==='project'&&before.name!=='project'){id=Number(after.arg);source=findCoverLink(id)}
 else if(before.name==='project'&&(after.name==='home'||after.name==='works')){id=Number(before.arg);const visible=after.name==='home'?FEATURED.includes(id):!after.arg||after.arg==='全部'||!CATEGORIES.includes(after.arg)||PROJECTS[id]?.category===after.arg;if(visible)source=main.querySelector('.project-cover')}
 const sourceImage=source?.querySelector('img'),start=source?.getBoundingClientRect();
 const useShared=!motionPreference.matches&&sourceImage?.complete&&sourceImage.naturalWidth&&start?.width>0&&start.bottom>0&&start.top<innerHeight;
 let proxy;
 if(useShared){proxy=document.createElement('div');proxy.className='motion-cover-proxy';proxy.setAttribute('aria-hidden','true');proxy.style.cssText=`left:${start.left}px;top:${start.top}px;width:${start.width}px;height:${start.height}px;border-radius:${getComputedStyle(source).borderRadius}`;const image=sourceImage.cloneNode();image.loading='eager';image.removeAttribute('width');image.removeAttribute('height');proxy.append(image);document.body.append(proxy)}
 render();
 if(motionPreference.matches){proxy?.remove();return}
 if(proxy){const target=after.name==='project'?main.querySelector('.project-cover'):findCoverLink(id);if(target){const end=target.getBoundingClientRect();if(end.width&&end.bottom>0&&end.top<innerHeight){target.classList.add('motion-shared-target');const animation=proxy.animate([{left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`,borderRadius:proxy.style.borderRadius},{left:`${end.left}px`,top:`${end.top}px`,width:`${end.width}px`,height:`${end.height}px`,borderRadius:getComputedStyle(target).borderRadius}],{duration:innerWidth<=700?480:740,easing:motionEase,fill:'forwards'});let finished=false;const finish=()=>{if(finished)return;finished=true;animation.cancel();target.classList.remove('motion-shared-target');proxy.remove();window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt);window.removeEventListener('keydown',interrupt);motionPreference.removeEventListener('change',finish)};const interrupt=()=>finish();routeMotionCleanup=finish;animation.finished.then(finish).catch(finish);window.addEventListener('wheel',interrupt,{passive:true});window.addEventListener('touchstart',interrupt,{passive:true});window.addEventListener('keydown',interrupt);motionPreference.addEventListener('change',finish);return}}proxy.remove()}
 if(before.name===after.name)return;
 const fade=main.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:motionEase});routeMotionCleanup=()=>fade.cancel();fade.finished.catch(()=>{});
}
