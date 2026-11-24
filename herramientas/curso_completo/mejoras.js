/* Mejoras del 24-11-2026 (sugerencias de Henry y Diego, y revisión del 24-11).
   · H1  En pantallas bajas (zoom 100 % en notebooks) la barra de la estación se oculta: se agrega un botón compacto
         «← Unidad» en la barra superior, que siempre está visible.
   · H6  META y simulacro: la respuesta escrita se guarda sola mientras se escribe (sin botón «Guardar respuesta»);
         al entregar con preguntas sin responder se listan para volver a ellas.
   · H7  Otra ronda de Practica o de Aplica por separado, sin perder el avance (líneas «R|» del suspend_data).
   · H8  Repaso sugerido: lo que recomienda el Cierre de bloque queda marcado en el mapa hasta hacer una ronda nueva de Practica.
   · H9  Al completar una estación por primera vez: ventana breve con el chucao y el paso siguiente.
   · H16 Mensaje del chucao: «Te faltan N estaciones para que tu chucao evolucione», con el avance de todo el curso. */

/* ---------- utilidades ---------- */
function mjRx(s){if(!state.rx||typeof state.rx!=='object')state.rx={};return state.rx[s.id]||{};}
function mjRxSet(s,o){if(!state.rx||typeof state.rx!=='object')state.rx={};state.rx[s.id]=Object.assign({},state.rx[s.id]||{},o);}
function mjSecDone(i,tab){const s=STATIONS[i],b=stationBits(i),dp=drawCount(s);const part=tab==='practice'?b.slice(1,1+dp):b.slice(1+dp);return part.length>0&&!part.includes('0');}
function mjFull(i){return stationDone(i)===milestoneCount(STATIONS[i]);}

/* ---------- persistencia: línea R| (rondas por sección, créditos y repaso sugerido) ---------- */
(function(){
 const _ser=serializeState;
 serializeState=function(){
  const base=_ser.apply(this,arguments),R=state.rx||{};
  const parts=Object.keys(R).filter(id=>STATIONS.some(s=>s.id===id)).map(id=>{const x=R[id]||{};
   return id+':'+(x.p|0).toString(36)+'.'+(x.c|0).toString(36)+'.'+(x.P?'P':'')+(x.C?'C':'')+(x.v!=null?'V'+(x.v|0).toString(36)+(x.w?'w':''):'')+(x.k?'K':'');})
   .filter(p=>!/:0\.0\.$/.test(p));
  return parts.length?base+'\nR|'+parts.join(','):base;
 };
 const _rc=restoreCompact;
 restoreCompact=function(raw){
  let rx={};const lines=String(raw).split('\n');const j=lines.findIndex(l=>l.startsWith('R|'));
  if(j>0){const L=lines.splice(j,1)[0].slice(2);
   for(const p of L.split(',')){const m=/^([A-Za-z0-9_-]{2,44}):([0-9a-z]{1,3})\.([0-9a-z]{1,3})\.(P?)(C?)(?:V([0-9a-z]{1,3})(w?))?(K?)$/.exec(p);
    if(m)rx[m[1]]={p:parseInt(m[2],36),c:parseInt(m[3],36),P:m[4]?1:0,C:m[5]?1:0,v:m[6]!=null?parseInt(m[6],36):null,w:m[7]?1:0,k:m[8]?1:0};}}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.rx=rx;return r;
 };
})();

/* ---------- H1: botón compacto para volver a la unidad ---------- */
function mjBackSync(){
 const top=document.querySelector('.app-top');if(!top)return;
 let b=document.getElementById('mjBack');
 if(!b){b=document.createElement('button');b.type='button';b.id='mjBack';b.className='nv-back';
  b.addEventListener('click',()=>{const o=document.getElementById('backMap');if(o)o.click();});
  const brand=top.querySelector('.brand');if(brand&&brand.nextSibling)top.insertBefore(b,brand.nextSibling);else top.appendChild(b);}
 const s=STATIONS[stationIndex],u=s&&UNITS[s.unit];
 if(u){b.innerHTML='<span aria-hidden="true">←</span> Unidad '+esc(u.roman);b.setAttribute('aria-label','Volver a la Unidad '+u.roman);}
}

/* ---------- H7: otra ronda por sección ---------- */
function mjRedo(tab){
 const i=stationIndex,s=STATIONS[i];if(!s)return;
 if(!canChange()){$('stationFeedback').textContent='La conexión SCORM no está disponible. No se puede iniciar otra ronda.';return;}
 const dp=drawCount(s),b=stationBits(i).split(''),x=mjRx(s);
 if(tab==='practice'){for(let k=1;k<=dp;k++)b[k]='0';mjRxSet(s,{P:1,p:(x.p|0)+1});}
 else{for(let k=dp+1;k<b.length;k++)b[k]='0';mjRxSet(s,{C:1,c:(x.c|0)+1});}
 state.p[s.id]=b.join('');activeTab=tab;state.tab=tab;
 const ok=save();renderStation();
 $('stationFeedback').textContent=ok?'↻ Nueva ronda de '+(tab==='practice'?'Practica':'Aplica')+'. Tu avance se mantiene.':'⚠ No se confirmó el guardado del progreso.';
}
function mjCanRedo(i,tab){const s=STATIONS[i];if(!s||!mjSecDone(i,tab))return false;return tab==='practice'?drawCount(s)<(s.practice||[]).length:checkCount(s)<checkBank(s).length;}
function mjRedoBox(){
 const host=document.querySelector('.zs-quiz .zs-qbody');if(!host||(activeTab!=='practice'&&activeTab!=='check'))return;
 const cur=host.querySelector('.zs-cur');const all=[...host.querySelectorAll(':scope > .quiz')];
 if(!cur||all.indexOf(cur)!==all.length-1||!mjCanRedo(stationIndex,activeTab))return;
 const nm=activeTab==='practice'?'Practica':'Aplica';
 const d=document.createElement('div');d.className='learn-finish mj-redo';
 d.innerHTML=`<button class="primary-btn" type="button">↻ Otra ronda de ${nm}</button><small>Son ejercicios nuevos del banco. Tu avance se mantiene: esta ronda no lo reduce.</small>`;
 d.querySelector('button').onclick=()=>mjRedo(activeTab);host.appendChild(d);
}

/* ---------- H8: repaso sugerido ---------- */
function mjRepNeeded(i){const s=STATIONS[i],x=mjRx(s);return x.v!=null&&!x.k;}
function mjRepCheck(i){   /* se quita sola al completar Practica en una ronda posterior a la recomendación */
 const s=STATIONS[i],x=mjRx(s);if(x.v==null||x.k)return false;
 const rp=(typeof roundP==='function')?roundP(s):roundOf(s);
 if(mjSecDone(i,'practice')&&(rp>x.v||!x.w)){mjRxSet(s,{k:1});return true;}return false;}
function mjRepMark(list){   /* list: índices de estaciones con errores en el Cierre */
 list.forEach(i=>{const s=STATIONS[i];if(!s)return;const rp=(typeof roundP==='function')?roundP(s):roundOf(s);mjRxSet(s,{v:rp,w:mjSecDone(i,'practice')?1:0,k:0});});
 try{save();}catch(e){}
}
function mjMapBadges(){
 const r=$('route');if(!r)return;
 r.querySelectorAll('.route-card[data-index]').forEach(c=>{const i=+c.dataset.index;if(!mjRepNeeded(i)||c.querySelector('.mj-rep'))return;
  const cp=c.querySelector('.route-copy');if(cp)cp.insertAdjacentHTML('beforeend','<span class="mj-rep" title="El Cierre del bloque recomienda repasar esta estación. La marca se quita al completar una ronda nueva de Practica."><b aria-hidden="true">!</b> Repaso sugerido</span>');
  c.setAttribute('aria-label',(c.getAttribute('aria-label')||'')+' Repaso sugerido.');});
}

/* ---------- H9: estación completada ---------- */
let mjWas=null;
function mjNextStation(i){const s=STATIONS[i],u=s.unit;const own=ownStations(u);const k=own.findIndex(x=>x.i===i);return k>=0&&k+1<own.length?own[k+1]:null;}
function mjCelebrate(i){
 const s=STATIONS[i],u=UNITS[s.unit],own=ownStations(s.unit),grp=own.filter(x=>x.s.group===s.group),lastOfGrp=grp.length&&grp[grp.length-1].i===i;
 const grpDone=grp.every(x=>mjFull(x.i));const nx=mjNextStation(i);
 let primary;
 if(lastOfGrp&&grp.length>=2&&grpDone&&typeof openCierre==='function')primary={t:'Ir al Cierre del bloque →',f:()=>{openMap(s.unit,s.group);openCierre(s.group);}};
 else if(nx)primary={t:'Siguiente estación: '+nx.s.title+' →',f:()=>openStation(nx.i)};
 else primary={t:'Volver a la Unidad '+u.roman,f:()=>openMap(s.unit)};
 const sec=[];
 if(!(primary.t.startsWith('Volver')))sec.push({t:'Volver a la Unidad '+u.roman,f:()=>openMap(s.unit)});
 if(mjCanRedo(i,'practice'))sec.push({t:'Otra ronda de Practica',f:()=>{openStation(i);mjRedo('practice');}});
 if(mjCanRedo(i,'check'))sec.push({t:'Otra ronda de Aplica',f:()=>{openStation(i);mjRedo('check');}});
 if(typeof hasExplore==='function'&&hasExplore(s))sec.push({t:'✦ Explora (opcional)',f:()=>{openStation(i);selectTab('explore');}});
 const img=(window.CHUCAO&&CHUCAO.img)?CHUCAO.img[Math.max(0,chucaoStage(completed()?100:Math.min(99.9,100*doneCount()/COUNT))-1)]:'';
 const ov=document.createElement('div');ov.className='mj-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','mjCelT');
 ov.innerHTML=`<div class="mj-dlg"><button type="button" class="mj-x" aria-label="Cerrar">✕</button>${img?`<img class="mj-chu" alt="" src="${img}">`:''}<span class="eyebrow">ESTACIÓN ${esc(stLabel(i))} COMPLETADA</span><h2 id="mjCelT">¡Bien hecho!</h2><p>Terminaste <b>${esc(s.title)}</b>. Tu avance quedó guardado.</p><div class="mj-acts"><button type="button" class="primary-btn" data-a="0">${esc(primary.t)}</button>${sec.map((x,k)=>`<button type="button" class="ls-btn ghost" data-a="${k+1}">${esc(x.t)}</button>`).join('')}</div></div>`;
 const acts=[primary,...sec];
 const close=()=>{ov.remove();document.removeEventListener('keydown',esck);if(prevFocus&&prevFocus.focus)try{prevFocus.focus({preventScroll:true});}catch(e){}};
 const esck=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
 const prevFocus=document.activeElement;
 ov.addEventListener('click',e=>{if(e.target===ov)close();});
 ov.querySelector('.mj-x').onclick=close;
 ov.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{close();acts[+b.dataset.a].f();});
 document.addEventListener('keydown',esck);document.body.appendChild(ov);
 ov.querySelector('[data-a="0"]').focus({preventScroll:true});
}
(function(){
 const _mark=mark;
 mark=function(step){
  const i=stationIndex,before=(i>=0&&STATIONS[i])?mjFull(i):true;
  const r=_mark.apply(this,arguments);
  try{const rep=mjRepCheck(i);if(rep)save();
   if(!before&&mjFull(i))setTimeout(()=>mjCelebrate(i),450);}catch(e){}
  return r;};
})();

/* ---------- H6: META y simulacro, respuestas escritas guardadas solas ---------- */
(function(){
 if(typeof metaBindQ!=='function')return;
 const _b=metaBindQ;
 metaBindQ=function(S){
  _b.apply(this,arguments);
  try{
   const idx=metaIdx,it=S.qs[idx],q=it.q;if(q.type!=='input')return;
   const root=$('metaBody'),box=root.querySelector('.typed'),inp=box.querySelector('.typed-input'),pad=box.querySelector('.keypad'),key=S.mode+S.n+':'+idx;
   const chk=box.querySelector('.typed-check');if(chk)chk.remove();
   const hint=document.createElement('p');hint.className='mj-auto';hint.textContent='Tu respuesta se guarda sola mientras escribes. Puedes cambiarla hasta entregar.';
   box.appendChild(hint);
   let pt=null;
   const auto=()=>{
    const v=inp.value;metaVals[key]=v;const r=PACETyped.check(q,v);const ch=r.state==='empty'?'-':(r.state==='ok'?'1':'0');
    S.a[idx]=ch;const sv=$('mtSaved');if(sv){sv.textContent=ch==='-'?'Sin responder':'✓ Respuesta guardada';sv.classList.toggle('on',ch!=='-');}
    const fb=$('mtFb');if(fb){
     if(r.state==='invalid'){fb.textContent='Revisa cómo está escrita: '+(r.msg||'no se entiende la respuesta.')+' Si la entregas así, se contará incorrecta.';fb.className='feedback incorrect';}
     else if(r.state==='reduce'){fb.textContent='Aún no está simplificada: así se contará incorrecta. Puedes corregirla antes de entregar.';fb.className='feedback incorrect';}
     else{fb.textContent='';fb.className='feedback';}}
    metaPalette(S);clearTimeout(pt);pt=setTimeout(()=>{try{metaPersist();}catch(e){}},700);
   };
   inp.addEventListener('input',auto);
   pad.addEventListener('click',e=>{if(e.target.closest('button[data-key]'))setTimeout(auto,0);});
   inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();auto();}},true);
  }catch(e){}
 };
 const _r=renderMeta;
 renderMeta=function(){
  const r=_r.apply(this,arguments);
  try{mjChoices($('metaView'));}catch(e){}
  try{const S=metaSess&&metaSess();if(S&&metaConfirm&&metaPhase!=='hub'&&!S.e){const w=document.querySelector('.mt-warn');const miss=S.a.map((c,i)=>c==='-'?i:-1).filter(i=>i>=0);
   if(w&&miss.length&&!w.querySelector('.mj-miss')){w.insertAdjacentHTML('beforeend',`<span class="mj-miss">Sin responder: ${miss.map(i=>`<button type="button" class="linklike" data-mjgo="${i}">${i+1}</button>`).join(' ')}</span>`);
    w.querySelectorAll('[data-mjgo]').forEach(b=>b.onclick=()=>{metaIdx=+b.dataset.mjgo;metaConfirm=false;renderMeta();});}}}catch(e){}
  return r;};
})();

/* ---------- H16: mensaje del chucao ---------- */
function mjStationsToStage(){   /* estaciones completas mínimas para alcanzar la siguiente etapa (0, 25, 50, 75 %) */
 const TH=[0,25,50,75,100],p=completed()?100:Math.min(99.9,COUNT>0?100*doneCount()/COUNT:0),st=chucaoStage(p);
 if(st>=4)return null;
 const need=Math.ceil(TH[st]*COUNT/100)-doneCount();if(need<=0)return 1;
 const rest=STATIONS.map((s,i)=>milestoneCount(s)-stationDone(i)).filter(x=>x>0).sort((a,b)=>a-b);
 let acc=0,k=0;for(const r of rest){acc+=r;k++;if(acc>=need)break;}return Math.max(1,k);}
(function(){
 const _pm=paintMascot;
 paintMascot=function(){const r=_pm.apply(this,arguments);
  try{const n=document.getElementById('chuMapNext');if(n){const k=mjStationsToStage();
    if(k!=null)n.textContent=(k===1?'Te falta 1 estación':'Te faltan '+k+' estaciones')+' para que tu chucao evolucione.';
    else if(!completed())n.textContent='Completa las estaciones y la META FINAL de las tres unidades para que tu chucao llegue a su última etapa.';}}catch(e){}
  return r;};
})();

/* ---------- H15: alternativas largas en una columna ---------- */
function mjChoices(root){(root||document).querySelectorAll('.choices').forEach(c=>{const bs=[...c.children];const long=bs.some(b=>(b.textContent||'').replace(/\s+/g,' ').length>56);c.classList.toggle('mj-long',long);});}

/* ---------- ganchos en el dibujo de estación y mapa ---------- */
(function(){
 const _rs=renderStation;
 renderStation=function(){const r=_rs.apply(this,arguments);try{mjBackSync();mjRedoBox();mjChoices($('stationContent'));}catch(e){}return r;};
 if(typeof renderCierre==='function'){const _rc=renderCierre;renderCierre=function(){const r=_rc.apply(this,arguments);try{mjChoices($('cierreView'));}catch(e){}return r;};}
 if(typeof renderDiag==='function'){const _rd=renderDiag;renderDiag=function(){const r=_rd.apply(this,arguments);try{mjChoices($('diagView'));}catch(e){}return r;};}
 const _rm=renderMap;
 renderMap=function(){const r=_rm.apply(this,arguments);try{mjMapBadges();}catch(e){}return r;};
})();

/* H9 (ventanas informativas): «¿Qué puedes hacer aquí?» de Explora se cierra con Esc o con un clic fuera */
document.addEventListener('click',e=>{document.querySelectorAll('details.zs-exinfo[open]').forEach(d=>{if(!d.contains(e.target))d.removeAttribute('open');});});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const d=document.querySelector('details.zs-exinfo[open]');if(d){d.removeAttribute('open');const s=d.querySelector('summary');if(s)s.focus();}});
