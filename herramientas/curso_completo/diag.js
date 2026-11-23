/* Diagnóstico distribuido (22-11-2026): la primera vez que se entra a una estación, una pregunta «Antes de empezar».
   · Pregunta fija por estación: station.diag si existe; si no, la primera de nivel 2 de Practica (de preferencia escrita).
   · Botón «Omitir» bajo la respuesta (23-11-2026; antes «Todavía no lo sé»). Después solo se dice si acertó, sin explicación. Un intento.
   · No cuenta para el avance. Se registra en SiveducMD como interacción «estación.D.código» (respuesta «?» = no lo sabe).
   · Se guarda en el progreso (línea «D|…» del suspend_data) para no volver a preguntar. */
function dgQ(s){if(!s)return null;if(s.diag&&s.diag.q)return s.diag;const P=Array.isArray(s.practice)?s.practice:[];const L=P.filter(q=>lvlOf(q)===2);const T=L.filter(q=>q.type==='input');return T[0]||L[0]||P[0]||null;}
function dgMap(){if(!state.dg||typeof state.dg!=='object')state.dg={};return state.dg;}
function dgNeeded(i){const s=STATIONS[i];if(!s||!dgQ(s))return false;if(Object.hasOwn(dgMap(),s.id))return false;return stationDone(i)===0&&!Object.hasOwn(state.p,s.id);}
let DG=null;
(function(){
 const _os=openStation;
 openStation=function(i,tab){
  if(DG&&DG.pass){DG=null;return _os.apply(this,arguments);}
  if(!dgNeeded(i))return _os.apply(this,arguments);
  const s=STATIONS[i];selectedUnit=s.unit;stationIndex=i;
  try{document.body.dataset.u=UNITS[s.unit]&&UNITS[s.unit].id?UNITS[s.unit].id:String(s.unit);}catch(e){}
  DG={i,tab:tab||'learn',done:null,resp:null};showOnly('diag');renderDiag();breadcrumbs();
 };
 const _ser=serializeState;
 serializeState=function(){const base=_ser.apply(this,arguments);const m=dgMap();const k=Object.keys(m).filter(id=>STATIONS.some(s=>s.id===id)&&/^[10?]$/.test(m[id]));return k.length?base+'\nD|'+k.map(id=>id+':'+m[id]).join(','):base;};
 const _rc=restoreCompact;
 restoreCompact=function(raw){
  let dg={};const lines=String(raw).split('\n');const j=lines.findIndex(l=>l.startsWith('D|'));
  if(j>0){const L=lines.splice(j,1)[0].slice(2);for(const p of L.split(',')){const m=/^([A-Za-z0-9_-]{2,44}):([10?])$/.exec(p);if(m)dg[m[1]]=m[2];}}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.dg=dg;return r;
 };
})();
function dgGo(){const d=DG;if(!d)return;d.pass=true;openStation(d.i,d.tab);}
function renderDiag(){
 const root=$('diagView');if(!DG){root.innerHTML='';return;}
 const s=STATIONS[DG.i],q=dgQ(s),u=UNITS[s.unit],num=stLabel(DG.i);
 let body;
 if(q.type==='input')body=renderTyped(q,0,'PREGUNTA',false);
 else body=`<article class="quiz" data-step="0"><div class="quiz-head"><span>PREGUNTA</span><span></span></div><h3 class="math-content">${rich(q.q)}</h3><div class="choices">${q.options.map((o,k)=>`<button type="button" data-dk="${k}">${rich(o)}</button>`).join('')}</div><p class="feedback" role="status" aria-live="polite"></p></article>`;
 root.innerHTML=`<div class="dg-wrap"><div class="station-nav"><button type="button" class="nv-back" id="dgBack" aria-label="Volver a la Unidad ${esc(u.roman)}">${nvUnitBtnHTML(u.roman)}</button></div>
 <section class="dg-card"><span class="eyebrow">ANTES DE EMPEZAR · ESTACIÓN ${num}</span><h1>${esc(s.title)}</h1>
 <p class="dg-lead">Una sola pregunta para saber desde dónde partes. <b>No cuenta para tu avance</b>: respóndela con lo que sepas ahora. Si todavía no sabes cómo hacerla, pulsa <b>«Omitir»</b>, abajo de la respuesta.</p>
 <div class="dg-q">${body}<div class="dg-skip-row"><button type="button" class="dg-skip" id="dgIdk">Omitir esta pregunta</button></div></div>
 <div class="dg-after hidden" id="dgAfter" role="status" aria-live="polite"><p id="dgMsg"></p><button type="button" class="primary-btn" id="dgGo">Empezar la estación →</button></div></section></div>`;
 $('dgBack').onclick=()=>{DG=null;openMap(s.unit);};
 {const sk=root.querySelector('.dg-skip-row'),tb=root.querySelector('.typed');if(sk&&tb){const pv=tb.querySelector('.typed-preview');if(pv){pv.after(sk);sk.classList.add('in-typed');}}}
 $('dgIdk').onclick=()=>dgFinish('?',null);
 $('dgGo').onclick=dgGo;
 const box=root.querySelector('.quiz');
 if(q.type!=='input'){box.querySelectorAll('button[data-dk]').forEach(b=>b.addEventListener('click',()=>{if(DG.done)return;const k=+b.dataset.dk;b.classList.add('picked');dgFinish(k===q.correct?'1':'0',k);}));}
 else{
  const tb=box.querySelector('.typed'),inp=tb.querySelector('.typed-input'),prev=tb.querySelector('.typed-preview'),pad=tb.querySelector('.keypad'),kind=tb.dataset.kind;let tm=null;
  const upd=()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=PACETyped.previewTex(kind,inp.value);if(window.MathJax&&MathJax.typesetClear)MathJax.typesetClear([prev]);if(t===''||t===null){prev.textContent=t===null?inp.value:'';prev.classList.toggle('bad',t===null);}else{prev.classList.remove('bad');prev.innerHTML='\\('+t+'\\)';typesetMath(prev);}},120);};
  inp.addEventListener('input',upd);pad.addEventListener('mousedown',e=>e.preventDefault());
  pad.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;typedInsert(inp,b.dataset.key);inp.focus();upd();});
  const go=()=>{if(DG.done)return;const r=PACETyped.check(q,inp.value);
   if(r.state==='empty'||r.state==='invalid'||r.state==='reduce'){const fb=box.querySelector('.feedback');fb.textContent=r.state==='empty'?'Escribe tu respuesta, o pulsa «Omitir».':r.msg;fb.className='feedback incorrect';inp.focus();return;}
   dgFinish(r.state==='ok'?'1':'0',inp.value);};
  tb.querySelector('.typed-check').addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
 }
 typesetMath(root);
}
function dgFinish(code,resp){
 if(!DG||DG.done)return;DG.done=code;const s=STATIONS[DG.i],q=dgQ(s);
 dgMap()[s.id]=code;try{save();}catch(e){}
 try{reportInt('D',s,q,code==='?'?'?':resp,code==='1');}catch(e){}
 const root=$('diagView'),box=root.querySelector('.quiz');
 box.querySelectorAll('button,input').forEach(b=>{b.disabled=true;});box.querySelectorAll('.keypad,.typed-hint,small').forEach(x=>{x.style.display='none';});
 const fb=box.querySelector('.feedback');if(fb){fb.textContent='';fb.className='feedback';}
 const ik=root.querySelector('.dg-skip-row');if(ik)ik.style.display='none';
 if(code==='?'&&mode==='scorm'&&connected&&intN>0){try{set('cmi.interactions.'+(intN-1)+'.result','neutral');if(Array.isArray(q.options))set('cmi.interactions.'+(intN-1)+'.student_response','?');}catch(e){}}
 const msg={'1':'<b>¡Bien! Ya tienes una base</b> para esta estación. Aprende te ayudará a afirmarla.','0':'<b>No te preocupes:</b> esto es justamente lo que vas a aprender en esta estación.','?':'<b>Sin problema, para eso está esta estación.</b> Al terminarla, esta pregunta te resultará conocida.'}[code];
 $('dgMsg').innerHTML=msg;$('dgAfter').className='dg-after '+(code==='1'?'ok':'neutral');
 if(code==='1'&&window.chuReact)chuReact(true);
 $('dgGo').focus({preventScroll:true});
}
