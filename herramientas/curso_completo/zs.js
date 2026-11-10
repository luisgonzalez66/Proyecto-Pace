/* ===== Navegación por pantallas · «cero scroll» (propuesta de Henry, V4) =====
 * Capa de presentación sobre el motor: no cambia el estado, el progreso, las interacciones SCORM ni la META FINAL.
 *  - Aprende: Idea → Ejemplos (pasos progresivos) → Cierre, con accesos directos y un solo par Anterior/Siguiente.
 *  - Practica / Aplica: una pregunta a la vez (las mismas preguntas y la misma lógica de respuesta).
 *  - Explora: la simulación ocupa el espacio disponible.
 *  El desplazamiento solo aparece como respaldo cuando el contenido no cabe ni reduciendo la letra al mínimo legible. */
const zsPos={},zsQ={};
let zsRO=null,zsTimer=null,zsToastT=null;
const zsOn=()=>document.body.classList.contains('zs');
function zsFit(box,inner,min){
 if(!box||!inner)return;const m=min||.7,WMIN=.6;
 const wide=()=>{const q=box.querySelectorAll('mjx-container,.zs-aux');for(let i=0;i<q.length;i++){if(q[i].scrollWidth>q[i].clientWidth+1)return true;}return false;};
 let fh=null,fhw=null;
 for(let z=1;z>=m-.001;z-=.04){box.style.setProperty('--z',z.toFixed(2));
  const h=box.scrollHeight<=box.clientHeight+1&&box.scrollWidth<=box.clientWidth+1;
  if(h&&fh===null)fh=z;
  if(h&&!wide()){fhw=z;break;}
 }
 /* La letra baja hasta que cabe a lo alto y a lo ancho; a lo ancho no baja de 0,7 (una línea muy larga se desplaza sola). */
 let r=m;if(fh!==null)r=Math.min(fh,Math.max(fhw||0,Math.max(WMIN,m)));
 box.style.setProperty('--z',r.toFixed(2));
}
const zsNorm=t=>String(t||'').toLowerCase().replace(/[*_`$\\.:;,!¡¿?\s]+/g,' ').trim();
function zsFitQ(b){for(let z=1;z>=.77;z-=.04){b.style.setProperty('--z',z.toFixed(2));if(b.scrollHeight<=b.clientHeight+1)return;}}
function zsFitAll(){document.querySelectorAll('#stationContent .zs-fit').forEach(b=>{
  const inner=b.firstElementChild,mn=Number(b.dataset.min)||.7,zv=()=>parseFloat(b.style.getPropertyValue('--z'))||1;
  if(inner&&inner.classList.contains('zs-cols')){
   /* Idea: una sola columna; si obliga a letra chica y hay ancho, se reparte en dos columnas. */
   inner.classList.remove('zs-two');zsFit(b,inner,mn);const z1=zv();
   if(z1<.9&&b.clientWidth>=640){inner.classList.add('zs-two');zsFit(b,inner,mn);if(zv()<=z1+.001){inner.classList.remove('zs-two');zsFit(b,inner,mn);}}
  }else zsFit(b,inner,mn);});document.querySelectorAll('#stationContent .zs-qbody').forEach(zsFitQ);}
function zsTypeset(el,cb){
 const done=()=>{try{cb&&cb();}catch(e){}};
 if(window.MathJax&&MathJax.typesetPromise){MathJax.typesetPromise([el]).then(done,done);}
 else{let n=0;const t=setInterval(()=>{if(window.MathJax&&MathJax.typesetPromise){clearInterval(t);MathJax.typesetPromise([el]).then(done,done);}else if(++n>60){clearInterval(t);done();}},150);}
}
function zsRefit(){clearTimeout(zsTimer);zsTimer=setTimeout(zsFitAll,60);}
window.addEventListener('resize',zsRefit);
window.addEventListener('orientationchange',zsRefit);

/* ---------- APRENDE ---------- */
function zsScreens(s){
 const L=s.learn||{},ex=[];
 if(L.steps&&(L.steps.items||[]).length)ex.push(L.steps);
 (Array.isArray(L.more)?L.more:[]).slice(0,3).forEach(m=>{if(m&&(m.items||[]).length)ex.push(m);});
 const scr=[{k:'idea',lab:'Idea'}];
 ex.forEach((e,i)=>scr.push({k:'ex',e:e,n:i+1,lab:'Ej. '+(i+1)}));
 if(!ex.length&&(s.example||'').trim())scr.push({k:'txt',lab:'Ejemplo',t:s.example});
 if(L.warn||(s.media&&s.media.length))scr.push({k:'end',lab:'Cierre'});
 return {scr:scr,total:ex.length};
}
function zsHead(sc,pg,tot){
 if(sc.k==='idea')return 'Conceptos esenciales';
 if(sc.k==='end')return 'Presta atención';
 return 'Ejemplo guiado'+(tot>1?' '+sc.n+' de '+tot:'');
}
function zsCap(sc,k){
 const it=sc.e.items,vi=(()=>{const v=it.findIndex(x=>/^\*\*Verificaci/.test(x.why||''));return v<0?it.length:v;})();
 if(vi>=it.length)return `Ejemplo ${sc.n} · Paso ${k+1} de ${it.length}`;
 return k<vi?`Ejemplo ${sc.n} · Resolución ${k+1} de ${vi}`:`Ejemplo ${sc.n} · Verificación`;
}
function zsSceneHTML(s,sc,pos,tot){
 const L=s.learn||{};
 if(sc.k==='idea'){
  return `<div class="zs-idea">${L.goal?`<section class="zs-card zs-goal"><span class="zs-tag">QUÉ APRENDERÁS</span><p class="math-content">${rb(L.goal)}</p></section>`:''}<section class="zs-card zs-ideac"><span class="zs-tag">COMPRENDE LA IDEA</span><div class="zs-fit zs-body" data-min=".6"><div class="math-content zs-cols">${rb(L.idea||s.concept||'')}</div></div></section></div>`;
 }
 if(sc.k==='txt'){
  return `<div class="zs-idea"><section class="zs-card zs-ideac"><span class="zs-tag">EJEMPLO</span><div class="zs-fit zs-body" data-min=".72"><div class="math-content">${rich(sc.t)}</div></div></section></div>`;
 }
 if(sc.k==='end'){
  return `<div class="zs-idea"><section class="zs-card zs-warn"><span class="zs-tag">PRESTA ATENCIÓN</span><div class="zs-fit zs-body" data-min=".72"><div class="math-content">${L.warn?rb(L.warn):''}${renderMedia(s.media||[])}</div></div></section></div>`;
 }
 const items=sc.e.items,k=Math.min(pos.step,items.length-1),cur=items[k],sd=cur.side||{},hasSd=!!(sd.title||sd.math||sd.text);
 const isV=it=>/^\*\*Verificaci/.test(it.why||'');
 let vi=items.findIndex(isV);if(vi<0)vi=items.length;
 const inV=k>=vi,nRes=vi,nVer=items.length-vi;
 const mk=(it,i)=>`<div class="zs-line ${i===k?'cur':i<k?'past':'fut'}" ${i===k?'aria-current="step"':''}>${it.math?`<div class="math-content">$$${it.math}$$</div>`:''}</div>`;
 const resL=items.slice(0,vi).map((it,i)=>mk(it,i)).join('');
 const verL=(nVer&&inV)?`<div class="zs-verif"><span class="zs-vlab">VERIFICACIÓN · fuera de la resolución</span>${items.slice(vi).map((it,i)=>mk(it,i+vi)).join('')}</div>`:'';
 const lines=resL+verL;
 const pillTxt=inV?(nVer>1?`Verificación ${k-vi+1} de ${nVer}`:'Verificación'):(nVer?`Resolución ${k+1} de ${nRes}`:`Paso ${k+1} de ${items.length}`);
 const why=(cur.why||'').trim();
 return `<div class="zs-ex"><div class="zs-ex-title"><div class="zs-ex-t"><span class="zs-tag coral">EJEMPLO ${sc.n}${tot>1?' DE '+tot:''}</span>${sc.e.title?`<h2 class="math-content">${rb(sc.e.title)}</h2>`:''}</div><span class="zs-pill${inV?' ver':''}">${pillTxt}</span></div>
  <div class="zs-worked${inV?' isver':''}"><div class="zs-lines zs-fit" data-min=".5"><div class="zs-lines-in">${lines}</div></div>
  <aside class="zs-side" aria-label="Explicación del paso actual"><span class="zs-tag ${inV?'ver':'teal'}">${inV?'VERIFICACIÓN · SOLO UNA COMPROBACIÓN':'¿POR QUÉ ESTE PASO?'}</span><div class="zs-fit zs-side-b" data-min=".6"><div>${hasSd&&sd.title?`<h4 class="math-content">${rb(sd.title)}</h4>`:''}${why&&!(hasSd&&sd.title&&zsNorm(why)===zsNorm(sd.title))?`<p class="zs-why math-content">${rb(why)}</p>`:''}${hasSd&&sd.math?`<div class="zs-aux math-content">$$${sd.math}$$</div>`:''}${hasSd&&sd.text?`<p class="zs-st math-content">${rb(sd.text)}</p>`:''}${!why&&!hasSd?'<p class="zs-st">Observa la operación realizada en este paso.</p>':''}</div></div></aside></div></div>`;
}
function zsRenderLearn(){
 const s=STATIONS[stationIndex],host=$('stationContent'),done=stepDone(stationIndex,0);
 const {scr,total}=zsScreens(s);
 const pos=zsPos[s.id]||(zsPos[s.id]={page:0,step:0});
 pos.page=Math.max(0,Math.min(scr.length-1,pos.page));
 const sc=scr[pos.page],nSteps=sc.k==='ex'?sc.e.items.length:0;
 if(sc.k==='ex')pos.step=Math.max(0,Math.min(nSteps-1,pos.step));else pos.step=0;
 const last=pos.page===scr.length-1;
 let nextTxt;
 if(sc.k==='ex'&&pos.step<nSteps-1)nextTxt='Siguiente paso →';
 else if(last)nextTxt='Ir a Practica →';
 else{const nx=scr[pos.page+1];nextTxt=nx.k==='ex'?'Ejemplo '+nx.n+' →':nx.k==='end'?'Cierre →':'Siguiente →';}
 const cap=sc.k==='ex'?zsCap(sc,pos.step):(sc.k==='idea'?'Idea clave de la estación':sc.k==='end'?'Antes de practicar':'Ejemplo');
 host.innerHTML=`<div class="zs-stage zs-learn"><div class="zs-top"><div class="zs-kick">APRENDE <i>·</i> <b>${zsHead(sc,pos.page,total)}</b></div><span class="zs-pg">Pantalla ${pos.page+1} de ${scr.length}</span></div>
  <nav class="zs-jump" aria-label="Ir directamente a una pantalla de Aprende">${scr.map((c,i)=>`<button type="button" class="zs-chip${i===pos.page?' on':''}" data-pg="${i}" ${i===pos.page?'aria-current="step"':''}>${c.lab}</button>`).join('')}</nav>
  <div class="zs-scene" id="zsScene" aria-live="polite">${zsSceneHTML(s,sc,pos,total)}</div>
  <div class="zs-bottom"><button type="button" class="zs-btn" id="zsPrev" ${pos.page===0&&pos.step===0?'disabled':''}>← Anterior</button><div class="zs-mid"><span class="zs-cap">${cap}</span><div class="zs-pips" aria-hidden="true">${scr.map((c,i)=>`<span class="${i===pos.page?'on':i<pos.page?'done':''}"></span>`).join('')}</div></div><button type="button" class="zs-btn next" id="zsNext">${nextTxt}</button></div></div>`;
 const go=(page,step)=>{pos.page=page;pos.step=step;zsRenderLearn();};
 const nxt=()=>{
  if(sc.k==='ex'&&pos.step<nSteps-1){go(pos.page,pos.step+1);return;}
  if(!last){go(pos.page+1,0);return;}
  activeTab='practice';state.tab='practice';
  if(!stepDone(stationIndex,0)){mark(0);}   /* mark() guarda, vuelve a dibujar la estación (ya en Practica) y avisa «Avance actualizado» */
  else{save();renderStation();}
 };
 const prv=()=>{
  if(sc.k==='ex'&&pos.step>0){go(pos.page,pos.step-1);return;}
  if(pos.page>0){const p=scr[pos.page-1];go(pos.page-1,p.k==='ex'?p.e.items.length-1:0);}
 };
 $('zsNext').onclick=nxt;$('zsPrev').onclick=prv;
 host.querySelectorAll('.zs-chip').forEach(b=>b.onclick=()=>go(Number(b.dataset.pg),0));
 zsBindKeys(nxt,prv);
 const scene=$('zsScene');
 let tx=null;
 scene.addEventListener('touchstart',e=>{if(e.touches.length===1)tx={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 scene.addEventListener('touchend',e=>{if(!tx||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-tx.x,dy=e.changedTouches[0].clientY-tx.y;tx=null;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*1.6){if(dx<0)nxt();else prv();}},{passive:true});
 zsFitAll();zsTypeset(scene,zsFitAll);
}
function zsBindKeys(nxt,prv){
 if(window.__zsKey)document.removeEventListener('keydown',window.__zsKey);
 window.__zsKey=function(ev){
  if(!document.getElementById('zsScene')){document.removeEventListener('keydown',window.__zsKey);window.__zsKey=null;return;}
  if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
  if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
  const t=ev.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  ev.preventDefault();if(ev.key==='ArrowRight')nxt();else prv();
 };
 document.addEventListener('keydown',window.__zsKey);
}

/* ---------- PRACTICA / APLICA: una pregunta a la vez ---------- */
function zsRenderQuiz(){
 const host=$('stationContent'),s=STATIONS[stationIndex],qs=[...host.querySelectorAll(':scope > .quiz')];
 if(!qs.length)return;
 const key=s.id+'|'+activeTab,n=qs.length;
 let cur=zsQ[key];
 if(cur==null||cur<0||cur>=n){cur=qs.findIndex(q=>!q.classList.contains('done'));if(cur<0)cur=0;}
 zsQ[key]=cur;
 const nDone=qs.filter(q=>q.classList.contains('done')).length;
 const title=activeTab==='practice'?'PRACTICA':'APLICA';
 const wrap=document.createElement('div');wrap.className='zs-stage zs-quiz';
 const body=document.createElement('div');body.className='zs-qbody';
 qs.forEach((q,i)=>{q.classList.toggle('zs-cur',i===cur);body.appendChild(q);});
 const redo=host.querySelector(':scope > .learn-finish');
 const pips=qs.map((q,i)=>`<button type="button" class="zs-qpip${q.classList.contains('done')?' ok':''}${i===cur?' on':''}" data-q="${i}" aria-label="Ir al ejercicio ${i+1}${q.classList.contains('done')?' (resuelto)':''}"><span>${i+1}</span></button>`).join('');
 const stats=`<div class="zs-qstats" aria-label="Resumen de avance"><span>Resueltas <b>${nDone}/${n}</b></span><span>Pendientes <b>${n-nDone}</b></span></div>`;
 const top=document.createElement('div');top.className='zs-top';
 top.innerHTML=`<div class="zs-kick">${title} <i>·</i> <b>Ejercicio ${cur+1} de ${n}</b></div>${stats}`;
 const bar=document.createElement('div');bar.className='zs-bottom';
 bar.innerHTML=`<button type="button" class="zs-btn" id="zsQPrev" ${cur===0?'disabled':''}>← Anterior</button><div class="zs-mid"><div class="zs-qpips" title="Con las flechas ← → del teclado cambias de ejercicio">${pips}</div></div><button type="button" class="zs-btn next" id="zsQNext" ${cur===n-1?'disabled':''}>Siguiente →</button>`;
 host.innerHTML='';wrap.append(top,body,bar);host.appendChild(wrap);
 if(redo){redo.classList.add('zs-redo');if(cur===n-1&&nDone===n)body.appendChild(redo);}
 const go=i=>{zsQ[key]=Math.max(0,Math.min(n-1,i));renderStation();};
 bar.querySelector('#zsQPrev').onclick=()=>go(cur-1);
 bar.querySelector('#zsQNext').onclick=()=>go(cur+1);
 bar.querySelectorAll('.zs-qpip').forEach(b=>b.onclick=()=>go(Number(b.dataset.q)));
 new MutationObserver(zsRefit).observe(body,{childList:true,subtree:true,characterData:true});
 /* Teclado matemático: 5 columnas ordenadas (dígitos y paréntesis · operaciones · potencias y raíz). */
 const ORD=['7','8','9','(',')','4','5','6','+','-','1','2','3','/','^','0',',','²','√','π','; ',' y ','x','=','∅','@del'];
 body.querySelectorAll('.keypad').forEach(pad=>{const ks=[...pad.children];ks.sort((a,b)=>{const ia=ORD.indexOf(a.dataset.key),ib=ORD.indexOf(b.dataset.key);return(ia<0?99:ia)-(ib<0?99:ib);});ks.forEach(k=>pad.appendChild(k));});
 /* Flechas del teclado: ← → cambian de ejercicio (no mientras se escribe una respuesta). */
 if(window.__zsQKey)document.removeEventListener('keydown',window.__zsQKey);
 window.__zsQKey=function(ev){
  if(!document.querySelector('.zs-quiz')){document.removeEventListener('keydown',window.__zsQKey);window.__zsQKey=null;return;}
  if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
  if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
  const t=ev.target,cq=document.querySelector('.zs-qbody>.zs-cur');
  if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)&&!t.disabled&&String(t.value||'').trim()!==''&&!(cq&&cq.classList.contains('done')))return;   /* con texto escrito, las flechas mueven el cursor */
  if(t&&t.isContentEditable)return;
  const to=ev.key==='ArrowRight'?cur+1:cur-1;if(to<0||to>=n)return;
  ev.preventDefault();go(to);
 };
 document.addEventListener('keydown',window.__zsQKey);
 /* Los manejadores de respuesta se ligaron a los mismos nodos en renderStation0; al moverlos se conservan. */
 const first=body.querySelector('.zs-cur .typed-input');if(first&&!body.querySelector('.zs-cur.done')&&matchMedia('(hover:hover)').matches)first.focus({preventScroll:true});
}

/* ---------- EXPLORA ---------- */
function zsRenderExplore(){
 const host=$('stationContent');if(!host.querySelector('.ex-frame')&&!host.querySelector('.ex-link'))return;
 host.classList.add('zs-explore');
 const h2=host.querySelector(':scope > h2'),desc=host.querySelector(':scope > p.math-content'),note=host.querySelector(':scope > .ex-note'),instr=host.querySelector(':scope > .lc'),
  fr=host.querySelector('.ex-frame'),ctl=host.querySelector(':scope > .ls-ctl'),alt=host.querySelector(':scope > .ex-alt'),link=host.querySelector(':scope > p .ex-link');
 const info=document.createElement('details');info.className='zs-exinfo';
 info.innerHTML='<summary>¿Qué puedes hacer aquí?</summary>';
 const box=document.createElement('div');box.className='zs-exinfo-b';
 if(desc)box.appendChild(desc);if(instr)box.appendChild(instr);if(alt)box.appendChild(alt);
 info.appendChild(box);
 const top=document.createElement('div');top.className='zs-top';
 top.innerHTML=`<div class="zs-kick">✦ EXPLORA <i>·</i> <b></b></div><span class="zs-pill soft">No cuenta para tu avance</span>`;
 top.querySelector('b').textContent=h2?h2.textContent:'Explora';
 const stage=document.createElement('div');stage.className='zs-stage zs-expl';
 const area=document.createElement('div');area.className='zs-exarea';
 if(fr)area.appendChild(fr);else{const p=host.querySelector(':scope > p');if(p)area.appendChild(p);}
 const bar=document.createElement('div');bar.className='zs-exbar';
 bar.appendChild(info);if(ctl)bar.appendChild(ctl);
 const keep=[...host.children].filter(e=>e.id==='exClose');
 host.innerHTML='';stage.append(top,area,bar);host.appendChild(stage);
 /* Los botones «Reiniciar» y «Vista ampliada» conservan sus manejadores porque se mueven los mismos nodos. */
}

/* ---------- envoltorio de renderStation ---------- */
function zsAfter(){
 if(!zsOn()){document.body.classList.remove('zs-ex');return;}
 try{
  if(activeTab==='learn'){zsRenderLearn();}
  else if(activeTab==='explore'){zsRenderExplore();}
  else{zsRenderQuiz();}
  document.body.classList.toggle('zs-ex',activeTab==='explore');
  const sc=document.querySelector('#stationContent');if(sc)sc.scrollTop=0;
  zsRefit();
 }catch(e){try{console.error('zs',e);}catch(_){}}
}
function zsToast(){
 const el=$('stationFeedback');if(!el)return;
 new MutationObserver(()=>{
  const p=el.parentElement;if(!p)return;
  if(!el.textContent.trim()){p.classList.remove('zs-toast');return;}
  p.classList.remove('zs-toast');void p.offsetWidth;p.classList.add('zs-toast');
  clearTimeout(zsToastT);zsToastT=setTimeout(()=>p.classList.remove('zs-toast'),4500);
 }).observe(el,{childList:true,characterData:true,subtree:true});
}

/* Teclado matemático: mismo orden en estaciones y en META FINAL (5 columnas: dígitos y paréntesis · operaciones · potencias y raíz) */
function zsKeys(list){
 const ORD=['7','8','9','(',')','4','5','6','+','-','1','2','3','/','^','0',',','²','√','π','; ',' y ','x','=','∅','@del'];
 const pos=k=>{const i=ORD.indexOf(k[1]||k[0]);return i<0?99:i;};
 return list.slice().sort((a,b)=>pos(a)-pos(b));
}
