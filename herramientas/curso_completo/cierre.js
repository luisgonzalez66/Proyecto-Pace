/* Cierre de bloque (19-11-2026) · práctica mixta.
   Al final de cada bloque con 2 o más estaciones, el mapa ofrece un «Cierre del bloque»: ejercicios de las estaciones
   del bloque, mezclados y sin decir de qué estación vienen. Un intento por ejercicio; al final, un resumen por estación.
   Si el bloque trae groups[g].cierre = {title, idea, figure:{svg,caption}, practice:[...], take}, se muestra primero
   esa pantalla-guía y se suman `take` preguntas de su `practice`. Las respuestas no se registran en el SCORM: es un repaso.
   Solo se guarda que el Cierre se terminó (línea B| de arbol/arbol.js), porque hace florecer la rama del bloque en el árbol. */
const CI_N=8;
const CI_NEUTRO=[
 [/Resuelve (?:la ecuación )?(?:aplicando|con|usando) la fórmula general/g,'Resuelve la ecuación'],
 [/Factoriza (?:por agrupación|como suma por diferencia)/g,'Factoriza'],
 [/Escribe como cuadrado de un binomio/g,'Factoriza'],
 [/Extrae el máximo factor común de/g,'Factoriza'],
 [/ usando el MCM/g,''],
 [/Resuelve la ecuación \(primero ordena la ecuación\)/g,'Resuelve la ecuación (primero ordénala)']];
const CI_FUERA=/fórmula general/i;
let CI=null;const CI_LAST={};
const ciRich=v=>rich(v).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
function ciCfg(u,g){const G=(UNITS[u].groups||[])[g];return (G&&G.cierre)||null;}
function ciItems(u,g){return ownStations(u).filter(x=>x.s.group===g);}
function ciNeutro(q){let t=String(q.q||'');for(const [re,to] of CI_NEUTRO)t=t.replace(re,to);return t===q.q?q:Object.assign({},q,{q:t});}
function ciShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function ciPick(u,g){
 const items=ciItems(u,g),cfg=ciCfg(u,g),n=(cfg&&cfg.n)||CI_N,out=[];
 const extra=cfg&&Array.isArray(cfg.practice)?ciShuffle(cfg.practice.slice()).slice(0,Math.max(0,cfg.take||0)):[];
 const pools=ciShuffle(items.map(({s,i})=>{
  let L=s.practice.filter(q=>lvlOf(q)>=2);if(!L.length)L=s.practice.slice();
  L=L.map(ciNeutro).filter(q=>!CI_FUERA.test(q.q));return {s,i,L:ciShuffle(L)};}).filter(p=>p.L.length));
 for(let k=0;out.length<n-extra.length&&pools.some(p=>p.L.length);k++){const p=pools[k%pools.length];if(p.L.length)out.push({q:p.L.pop(),st:p.s.title,i:p.i});}
 extra.forEach(q=>out.push({q,st:(cfg.title||'¿Qué método conviene?'),i:-1}));
 ciShuffle(out);
 for(let t=1;t<out.length;t++){if(out[t].st===out[t-1].st){const j=out.findIndex((x,k)=>k>t&&x.st!==out[t-1].st&&(k+1>=out.length||out[k+1].st!==out[t].st));if(j>0)[out[t],out[j]]=[out[j],out[t]];}}
 return out;}
function cierreCard(g,items){
 if(!items||items.length<2)return '';
 const u=selectedUnit,cfg=ciCfg(u,g),done=items.filter(x=>stationDone(x.i)===milestoneCount(x.s)).length,last=CI_LAST[u+':'+g],n=(cfg&&cfg.n)||CI_N;
 const st=last?'Último: '+last.c+'/'+last.n:done===items.length?'Recomendado ahora':'Al terminar el bloque';
 return `<button type="button" class="ci-card${done===items.length?' ready':''}" data-cierre="${g}" aria-label="Cierre del bloque: práctica mixta. ${esc(st)}"><span class="ci-ico" aria-hidden="true">⇄</span><span class="ci-copy"><strong>Cierre del bloque${cfg&&cfg.title?' · '+esc(cfg.title):''}</strong><small>Práctica mixta: ${n} ejercicios de las ${items.length} estaciones, sin decirte de cuál viene cada uno.</small></span><span class="ci-st">${esc(st)}</span></button>`;}
function openCierre(g){const u=selectedUnit;CI={u,g,phase:ciCfg(u,g)?'guia':'intro',qs:[],idx:0,a:[]};showOnly('cierre');renderCierre();breadcrumbs();}
function ciStart(){CI.qs=ciPick(CI.u,CI.g);CI.a=CI.qs.map(()=>'-');CI.pk=CI.qs.map(()=>null);CI.tv=CI.qs.map(()=>'');CI.idx=0;CI.conf=false;CI.phase='run';renderCierre();}
/* Navegación libre (24-11-2026): Anterior, Siguiente y los puntos; lo respondido se muestra con su retroalimentación. */
function ciGo(i){CI.idx=Math.max(0,Math.min(CI.qs.length-1,i));CI.conf=false;renderCierre();window.scrollTo({top:0,behavior:'instant'});}
function ciFinish(){const left=CI.a.filter(x=>x==='-').length;if(left&&!CI.conf){CI.conf=true;const w=$('ciWarn');if(w){w.textContent='Te '+(left===1?'queda 1 ejercicio':'quedan '+left+' ejercicios')+' sin responder. Puedes volver a ellos con los números de arriba, o pulsar otra vez «Ver resultado» para terminar igual.';w.classList.remove('hidden');}return;}
 CI.phase='res';const c=CI.a.filter(x=>x==='1').length;CI_LAST[CI.u+':'+CI.g]={c,n:CI.a.length};
 try{if(typeof mjRepMark==='function'){const bad=[...new Set(CI.qs.map((x,k)=>CI.a[k]==='0'&&x.i>=0?x.i:-1).filter(i=>i>=0))];if(bad.length)mjRepMark(bad);}}catch(e){}
 renderCierre();window.scrollTo({top:0,behavior:'instant'});}
function ciHead(){const G=UNITS[CI.u].groups[CI.g],num=String(CI.g+1).padStart(2,'0');return `<span class="eyebrow">UNIDAD ${UNITS[CI.u].roman} · BLOQUE ${num} · CIERRE</span><h1>${esc(G.title)}</h1>`;}
function ciIntroHTML(){
 const items=ciItems(CI.u,CI.g),cfg=ciCfg(CI.u,CI.g),n=(cfg&&cfg.n)||CI_N;
 const lista=`<ul class="ci-list">${items.map(x=>`<li>${esc(x.s.title)}</li>`).join('')}</ul>`;
 const como=`<div class="ci-how"><b>Cómo funciona</b><p>Son <b>${n} ejercicios</b> mezclados de estas estaciones:</p>${lista}<p>No te diremos de qué estación viene cada uno: lo primero es <b>reconocer qué hacer</b>. Tienes un intento por ejercicio y al final verás qué estación conviene repasar. No cuenta para tu avance.</p></div>`;
 if(CI.phase==='guia'){const f=cfg.figure&&cfg.figure.svg?`<figure class="ci-fig">${cfg.figure.svg}${cfg.figure.caption?`<figcaption>${esc(cfg.figure.caption)}</figcaption>`:''}</figure>`:'';
  return `<div class="ci-guide"><span class="eyebrow">ANTES DE PRACTICAR</span><h2>${esc(cfg.title||'¿Qué método conviene?')}</h2><div class="ci-guide-body"><div class="math-content">${cfg.idea?`<p>${ciRich(cfg.idea)}</p>`:''}${Array.isArray(cfg.pasos)&&cfg.pasos.length?`<ol class="ci-pasos">${cfg.pasos.map(x=>`<li>${ciRich(x)}</li>`).join('')}</ol>`:''}</div>${f}</div></div>${como}<div class="ci-row"><button type="button" class="primary-btn" id="ciGo">Empezar la práctica mixta</button><button type="button" class="ls-btn ghost" id="ciBack">Volver al mapa</button></div>`;}
 return `${como}<div class="ci-row"><button type="button" class="primary-btn" id="ciGo">Empezar</button><button type="button" class="ls-btn ghost" id="ciBack">Volver al mapa</button></div>`;}
function ciDots(){return `<div class="ci-dots" role="group" aria-label="Ejercicios">${CI.a.map((x,i)=>`<button type="button" data-cgo="${i}" class="${x==='1'?'ok':x==='0'?'bad':''}${i===CI.idx?' cur':''}" aria-label="Ejercicio ${i+1}${x==='1'?', correcto':x==='0'?', incorrecto':', sin responder'}"${i===CI.idx?' aria-current="step"':''}>${i+1}</button>`).join('')}</div>`;}
function ciQHTML(){
 const it=CI.qs[CI.idx],q=it.q,lab='EJERCICIO '+(CI.idx+1)+' DE '+CI.qs.length;
 let h;if(q.type==='input')h=renderTyped(q,0,lab,false);
 else h=`<article class="quiz" data-step="0"><div class="quiz-head"><span>${lab}</span><span>Por resolver</span></div><h3 class="math-content">${rich(q.q)}</h3><div class="choices">${q.options.map((o,k)=>`<button type="button" data-ck="${k}">${rich(o)}</button>`).join('')}</div><p class="feedback" role="status" aria-live="polite"></p></article>`;
 const last=CI.idx===CI.qs.length-1;
 return `${ciDots()}<div class="ci-q">${h}<div class="ci-after hidden" id="ciAfter"><p class="ci-from" id="ciFrom"></p><button type="button" class="primary-btn" id="ciNext">${last?'Ver resultado':'Siguiente ejercicio →'}</button></div><p class="ci-warn hidden" id="ciWarn" role="status" aria-live="polite"></p><div class="ci-nav"><button type="button" class="ls-btn ghost" id="ciPrev" ${CI.idx===0?'disabled':''}>← Anterior</button><button type="button" class="ls-btn ghost" id="ciSkip">${last?'Ver resultado':'Siguiente →'}</button></div></div>`;}
function ciSolved(ok,box,pick,replay){
 const it=CI.qs[CI.idx],q=it.q;CI.a[CI.idx]=ok?'1':'0';if(!replay){CI.pk[CI.idx]=pick==null?null:pick;window.chuReact&&chuReact(ok);}
 let corr='';if(q.type==='input'){let t='';try{t=PACETyped.answerTex(q);}catch(e){}corr='\\('+t+'\\)';}else corr=q.options[q.correct];
 const fb=box.querySelector('.feedback');fb.className='feedback '+(ok?'correct':'incorrect');
 fb.innerHTML=ok?'✓ '+rich(q.why||'Correcto.'):'✗ '+((pick!=null&&Array.isArray(q.fb)&&q.fb[pick])?'<b>'+rich(q.fb[pick])+'</b> ':'')+'La respuesta correcta es <span class="math-content">'+rich(corr)+'</span>. '+rich(q.why||'');
 box.querySelectorAll('button,input').forEach(b=>{b.disabled=true;});box.classList.add(ok?'ci-ok':'ci-bad');box.querySelectorAll('.keypad,.typed-hint,small').forEach(x=>{x.style.display='none';});
 const hd=box.querySelector('.quiz-head span:last-child');if(hd)hd.textContent=ok?'✓ Correcto':'✗ Incorrecto';
 $('ciFrom').innerHTML=it.i>=0?'Este ejercicio es de la estación <b>«'+esc(it.st)+'»</b>.':'Pregunta de <b>'+esc(it.st)+'</b>.';
 $('ciAfter').classList.remove('hidden');const dots=$('cierreView').querySelector('.ci-dots');if(dots){dots.outerHTML=ciDots();$('cierreView').querySelectorAll('[data-cgo]').forEach(b=>b.addEventListener('click',()=>ciGo(+b.dataset.cgo)));}
 typesetMath(box);if(!replay)$('ciNext').focus({preventScroll:true});}
function ciBindQ(){
 const root=$('cierreView'),box=root.querySelector('.quiz'),q=CI.qs[CI.idx].q;
 const fwd=()=>{if(CI.idx<CI.qs.length-1)ciGo(CI.idx+1);else ciFinish();};
 $('ciNext').addEventListener('click',fwd);$('ciSkip').addEventListener('click',fwd);$('ciPrev').addEventListener('click',()=>ciGo(CI.idx-1));
 root.querySelectorAll('[data-cgo]').forEach(b=>b.addEventListener('click',()=>ciGo(+b.dataset.cgo)));
 const done=CI.a[CI.idx]!=='-';
 if(q.type!=='input'){const pickB=(k,rep)=>{const b=box.querySelector('button[data-ck="'+k+'"]'),ok=k===q.correct;if(b)b.classList.add(ok?'correct':'wrong');if(!ok){const c=box.querySelector('button[data-ck="'+q.correct+'"]');if(c)c.classList.add('correct');}ciSolved(ok,box,k,rep);};
  if(done&&CI.pk[CI.idx]!=null){pickB(CI.pk[CI.idx],true);return;}
  box.querySelectorAll('button[data-ck]').forEach(b=>b.addEventListener('click',()=>{if(CI.a[CI.idx]!=='-')return;pickB(+b.dataset.ck,false);}));return;}
 const tb=box.querySelector('.typed'),inp=tb.querySelector('.typed-input'),prev=tb.querySelector('.typed-preview'),pad=tb.querySelector('.keypad'),kind=tb.dataset.kind;let tm=null;
 const upd=()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=PACETyped.previewTex(kind,inp.value);if(window.MathJax&&MathJax.typesetClear)MathJax.typesetClear([prev]);if(t===''||t===null){prev.textContent=t===null?inp.value:'';prev.classList.toggle('bad',t===null);}else{prev.classList.remove('bad');prev.innerHTML='\\('+t+'\\)';typesetMath(prev);}},120);};
 inp.addEventListener('input',upd);pad.addEventListener('mousedown',e=>e.preventDefault());
 pad.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;typedInsert(inp,b.dataset.key);inp.focus();upd();});
 if(done){inp.value=CI.tv[CI.idx]||'';upd();ciSolved(CI.a[CI.idx]==='1',box,null,true);return;}
 const go=()=>{if(CI.a[CI.idx]!=='-')return;const r=PACETyped.check(q,inp.value);CI.tv[CI.idx]=inp.value;
  if(r.state==='empty'||r.state==='invalid'||r.state==='reduce'){const fb=box.querySelector('.feedback');fb.textContent=r.state==='empty'?'Escribe tu respuesta antes de comprobar.':r.msg;fb.className='feedback incorrect';inp.focus();return;}
  ciSolved(r.state==='ok',box);};
 tb.querySelector('.typed-check').addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});}
function ciResHTML(){
 const c=CI.a.filter(x=>x==='1').length,N=CI.a.length,by={};
 CI.qs.forEach((x,k)=>{const key=x.st;(by[key]=by[key]||{t:x.st,i:x.i,c:0,n:0,d:[]});by[key].n++;if(CI.a[k]==='1')by[key].c++;by[key].d.push(CI.a[k]);});
 const rows=Object.values(by).map(r=>`<tr><td>${esc(r.t)}</td><td class="mt-dots">${r.d.map(d=>`<i class="d${d}"></i>`).join('')}</td><td><b>${r.c}/${r.n}</b></td><td>${r.c<r.n&&r.i>=0?`<button type="button" class="ls-btn ci-rep" data-rep="${r.i}">Repasar</button>`:r.c===r.n?'<span class="ci-okk">✓</span>':''}</td></tr>`).join('');
 const msg=c===N?'¡Muy bien! Reconociste qué hacer en todos los ejercicios.':c>=Math.ceil(N*0.75)?'Buen trabajo. Revisa las estaciones donde te equivocaste.':'Conviene repasar las estaciones marcadas antes de seguir.';
 return `<div class="ci-score"><b>${c}</b><span>de ${N} correctos</span></div><p class="ci-msg">${msg}</p><table class="ci-tab"><thead><tr><th>Estación</th><th>Ejercicios</th><th>Correctos</th><th></th></tr></thead><tbody>${rows}</tbody></table><div class="ci-row"><button type="button" class="primary-btn" id="ciGo">Otra ronda</button><button type="button" class="ls-btn ghost" id="ciBack">Volver al mapa</button></div>`;}
function renderCierre(){
 const root=$('cierreView');if(!CI){root.innerHTML='';return;}
 const body=CI.phase==='run'?ciQHTML():CI.phase==='res'?ciResHTML():ciIntroHTML();
 root.innerHTML=`<div class="ci-wrap">${ciHead()}${body}</div>`;
 const go=$('ciGo');if(go)go.addEventListener('click',ciStart);
 const bk=$('ciBack');if(bk)bk.addEventListener('click',()=>openMap(CI.u,CI.g));
 root.querySelectorAll('[data-rep]').forEach(b=>b.addEventListener('click',()=>openStation(+b.dataset.rep)));
 if(CI.phase==='run')ciBindQ();
 typesetMath(root);}
(function(){const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);try{$('route').querySelectorAll('[data-cierre]').forEach(b=>b.addEventListener('click',()=>openCierre(+b.dataset.cierre)));}catch(e){}return r;};})();
