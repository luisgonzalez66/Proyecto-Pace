/* «Recuerda» (prototipo 22-11-2026, sugerencia #12 de la revisión didáctica).
   Una estación puede declarar en su JSON:  "recuerda":[{"titulo","texto","ejemplo"(TeX, opcional),"origen":"u2-s012"}]
   · Nivel 1: el botón «Recuerda» (en Aprende y en Practica/Aplica) abre un recuadro encima de la pantalla,
     con lo esencial y un ejemplo. No se sale de la estación.
   · Nivel 2: «Ver la idea completa» abre una ventana con la idea de la estación de origen
     (copia hecha al construir el curso: r.ver). Se cierra con «Seguir con la estación».
   Mirar un «Recuerda» no registra avance, no responde preguntas y no activa «Antes de empezar» en la otra estación. */
(function(){
const R=t=>(typeof rb==='function'?rb:rich)(t||'');
function rcData(s){return (s&&Array.isArray(s.recuerda))?s.recuerda.filter(r=>r&&r.titulo):[];}
function rcVer(r){
 if(r.ver)return r.ver;
 try{const o=STATIONS.find(x=>x.id===r.origen);if(o){const u=UNITS[o.unit]||{},L=o.learn||{};return {roman:u.roman||'',title:o.title,goal:L.goal||'',idea:L.idea||o.concept||'',figure:L.figure||null};}}catch(e){}
 return null;
}
function rcClose(){document.querySelectorAll('.rc-pop,.rc-modal').forEach(e=>e.remove());const b=document.querySelector('.rc-btn');if(b)b.setAttribute('aria-expanded','false');}
function rcSet(el){try{typesetMath(el);}catch(e){try{MathJax.typesetPromise([el]);}catch(_){}}}
function rcPop(btn){
 const open=document.querySelector('.rc-pop');rcClose();if(open)return;
 const s=STATIONS[stationIndex],rs=rcData(s),stage=document.querySelector('#stationContent .zs-stage');if(!stage||!rs.length)return;
 const p=document.createElement('section');p.className='rc-pop';p.setAttribute('role','dialog');p.setAttribute('aria-label','Recuerda');
 p.innerHTML=rs.map((r,i)=>{const v=rcVer(r);return `<div class="rc-item">
   <div class="rc-from"><span class="rc-tag">RECUERDA</span>${v?`<span>Lo viste en <b>Unidad ${esc(v.roman)} · ${esc(v.title)}</b></span>`:''}</div>
   <h4 class="math-content">${R(r.titulo)}</h4>
   <div class="math-content rc-txt">${R(r.texto)}</div>
   ${r.ejemplo?`<div class="rc-ej math-content">$$${r.ejemplo}$$</div>`:''}
   <div class="rc-acts">${v?`<button type="button" class="rc-more" data-i="${i}">Ver la idea completa ↗</button>`:''}<button type="button" class="rc-ok">Entendido</button></div></div>`;}).join('');
 stage.appendChild(p);btn.setAttribute('aria-expanded','true');rcSet(p);
 p.querySelectorAll('.rc-ok').forEach(b=>b.onclick=()=>{rcClose();btn.focus();});
 p.querySelectorAll('.rc-more').forEach(b=>b.onclick=()=>rcModal(rs[+b.dataset.i],btn));
 const f=p.querySelector('button');if(f)f.focus();
}
function rcModal(r,btn){
 const v=rcVer(r);if(!v)return;rcClose();
 const s=STATIONS[stationIndex];
 const m=document.createElement('div');m.className='rc-modal';
 m.innerHTML=`<div class="rc-card" role="dialog" aria-modal="true" aria-label="Idea de la estación ${esc(v.title)}">
  <div class="rc-mhead"><div><span class="rc-tag">REPASO · UNIDAD ${esc(v.roman)}</span><h3>${esc(v.title)}</h3></div>
  <button type="button" class="rc-x" aria-label="Cerrar y seguir con la estación">✕</button></div>
  <div class="rc-mbody">${v.goal?`<p class="rc-goal math-content">${R(v.goal)}</p>`:''}
   <div class="${v.figure&&v.figure.svg?'rc-figwrap':''}"><div class="math-content rc-idea">${R(v.idea)}</div>${v.figure&&v.figure.svg?`<figure class="rc-fig">${v.figure.svg}</figure>`:''}</div></div>
  <div class="rc-mfoot"><span>Esto es solo un repaso: no cambia tu avance.</span><button type="button" class="rc-back">← Seguir con «${esc(s.title)}»</button></div></div>`;
 document.body.appendChild(m);rcSet(m);
 const close=()=>{rcClose();if(btn&&btn.isConnected)btn.focus();};
 m.querySelector('.rc-x').onclick=close;m.querySelector('.rc-back').onclick=close;
 m.addEventListener('click',e=>{if(e.target===m)close();});
 m.querySelector('.rc-back').focus();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.rc-pop,.rc-modal')){e.stopPropagation();rcClose();}},true);
function rcMount(){
 rcClose();
 try{
  const s=STATIONS[stationIndex];if(!rcData(s).length)return;
  const host=document.querySelector('#stationContent .zs-jump')||document.querySelector('#stationContent .zs-quiz .zs-top');
  if(!host||host.querySelector('.rc-btn'))return;
  const b=document.createElement('button');b.type='button';b.className='rc-btn';b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','dialog');
  b.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8a4.6 4.6 0 0 0-2.7 8.3c.5.4.8 1 .8 1.6v.5h3.8v-.5c0-.6.3-1.2.8-1.6A4.6 4.6 0 0 0 8 1.8ZM6.2 14h3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>Recuerda</span>';
  b.title='Recordar lo que necesitas de estaciones anteriores';
  b.onclick=()=>rcPop(b);host.appendChild(b);
 }catch(e){}
}
try{const _l=zsRenderLearn;zsRenderLearn=function(){const r=_l.apply(this,arguments);rcMount();return r;};const _q=zsRenderQuiz;zsRenderQuiz=function(){const r=_q.apply(this,arguments);rcMount();return r;};}catch(e){}
const _sh2=showOnly;showOnly=function(v){if(v!=='station')rcClose();return _sh2.apply(this,arguments);};
})();
