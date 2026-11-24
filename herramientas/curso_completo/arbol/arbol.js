/* Árbol de progreso en el curso (24-11-2026). Componente: arbol-progreso.js (Henry v1 + ilustración v2).
 * Le entrega el avance REAL del motor; no guarda nada propio salvo qué Cierres de bloque se terminaron.
 *  - Estación: completada = todos sus hitos (Aprende, Practica, Aplica); en progreso = alguno; pendiente = ninguno.
 *  - Flor de un bloque = sus estaciones completas Y su Cierre de bloque terminado (bloques de 1 estación no tienen Cierre).
 *  - Frutos = unidad finalizada: todas sus estaciones completas y su META FINAL entregada (si la unidad tiene META).
 *  - Dónde: en el mapa de cada unidad, junto al chucao, y en miniatura en «Todas las unidades».
 *  - Avisos: al florecer una rama o al dar frutos, en la ventana de estación completada o en un aviso breve.
 * Persistencia: línea «B|u.g,u.g» en el avance guardado (Cierres terminados; unos pocos bytes). */
(function(){
 if(!window.PaceArbol)return;
 if(!state.cb)state.cb={};
 /* ---------- persistencia de Cierres terminados ---------- */
 const _ser=serializeState;
 serializeState=function(){const base=_ser.apply(this,arguments),k=Object.keys(state.cb||{}).filter(x=>/^\d\.\d{1,2}$/.test(x)&&state.cb[x]);return k.length?base+'\nB|'+k.join(','):base;};
 const _rc=restoreCompact;
 restoreCompact=function(raw){const lines=String(raw).split('\n'),j=lines.findIndex(l=>l.startsWith('B|'));let cb={};
  if(j>0){lines.splice(j,1)[0].slice(2).split(',').forEach(k=>{if(/^\d\.\d{1,2}$/.test(k))cb[k]=1;});}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.cb=cb;return r;};
 const tieneCierre=(u,g)=>typeof ciItems==='function'&&ciItems(u,g).length>=2;
 if(typeof ciFinish==='function'){const _cf=ciFinish;ciFinish=function(){_cf.apply(this,arguments);
  try{if(CI&&CI.phase==='res'){const k=CI.u+'.'+CI.g;if(!state.cb)state.cb={};if(!state.cb[k]){state.cb[k]=1;save();}}}catch(e){}};}
 /* ---------- datos para el árbol ---------- */
 function arDatos(u){
  const U=UNITS[u];if(!U||!Array.isArray(U.groups)||U.groups.length!==4)return null;
  const k=/^u([123])$/.exec(String(U.id||''));if(!k)return null;   /* silueta y color según la unidad real (también en las páginas de una sola unidad) */
  const est=STATIONS.map((s,i)=>({s,i})).filter(x=>x.s.unit===u);
  const bloques=U.groups.map((g,gi)=>({id:U.id+'-b'+(gi+1),nombre:g.title,florece:!tieneCierre(u,gi)||!!(state.cb&&state.cb[u+'.'+gi]),
   estaciones:est.filter(x=>x.s.group===gi).map(x=>{const d=stationDone(x.i),m=milestoneCount(x.s);return {id:x.s.id,nombre:x.s.title,estado:d>=m?'completada':d>0?'en_progreso':'pendiente'};})}));
  if(bloques.some(b=>!b.estaciones.length))return null;
  const todas=bloques.every(b=>b.estaciones.every(e=>e.estado==='completada'));
  const meta=(typeof metaUnits==='function'&&metaUnits().includes(u))?metaDoneU(u):true;
  return {unidad:'U'+k[1],unidadFinalizada:todas&&meta,bloques};
 }
 window.arDatos=arDatos;
 /* ---------- dibujo ---------- */
 const inst={};
 function arMapa(){
  try{
   const card=document.getElementById('chuMap');if(!card||typeof selectedUnit==='undefined')return;
   const u=selectedUnit,d=arDatos(u);let box=document.getElementById('arMap');
   if(!d){if(box)box.remove();card.classList.remove('con-arbol');return;}
   if(!box){box=document.createElement('div');box.id='arMap';box.className='ar-map';box.innerHTML='<span class="ar-eb">TU ÁRBOL DE LA UNIDAD</span><div class="ar-svg"></div>';card.appendChild(box);card.classList.add('con-arbol');}
   const host=box.querySelector('.ar-svg');
   if(!inst.map||inst.host!==host){inst.map=PaceArbol.montar(host,d,{resumen:'estado'});inst.host=host;}
   else inst.map.actualizar(d,{animar:true});
  }catch(e){}
 }
 function arUnidades(){
  try{document.querySelectorAll('#unitsGrid .unit-card[data-unit]').forEach(c=>{
   const u=Number(c.dataset.unit),d=arDatos(u);const old=c.querySelector('.ar-mini');if(old)old.remove();if(!d)return;
   const m=document.createElement('div');m.className='ar-mini';m.setAttribute('aria-hidden','true');
   m.innerHTML=PaceArbol.crearSVG(d);const main=c.querySelector('.unit-main');(main||c).insertAdjacentElement('afterend',m);});
  }catch(e){}
 }
 const _pm=paintMascot;paintMascot=function(){_pm.apply(this,arguments);arMapa();};
 const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);arMapa();return r;};
 if(typeof renderHome==='function'){const _rh=renderHome;renderHome=function(){_rh.apply(this,arguments);arUnidades();};}
 /* ---------- avisos: rama florecida y frutos ---------- */
 let base=null;
 function foto(){return UNITS.map((_,u)=>{const d=arDatos(u);if(!d)return null;const m=PaceArbol.normalizar(d);return {f:m.bloques.map(b=>b.florece),fin:m.finalizada};});}
 function aviso(html){
  const dlg=document.querySelector('.mj-ov .mj-dlg');
  if(dlg){const p=document.createElement('p');p.className='ar-cel';p.innerHTML=html;const acts=dlg.querySelector('.mj-acts,.mj-actions');(acts||dlg.lastElementChild).insertAdjacentElement('beforebegin',p);return;}
  let box=document.getElementById('arToasts');if(!box){box=document.createElement('div');box.id='arToasts';box.setAttribute('role','status');document.body.appendChild(box);}
  const t=document.createElement('div');t.className='ar-toast';t.innerHTML=html;box.appendChild(t);setTimeout(()=>t.remove(),6500);
 }
 function revisar(){
  try{const ahora=foto();if(!base){base=ahora;return;}
   ahora.forEach((a,u)=>{const b=base[u];if(!a||!b)return;
    if(a.fin&&!b.fin){aviso('🍎 <b>¡Tu árbol de la Unidad '+UNITS[u].roman+' dio frutos!</b> Terminaste la unidad.');return;}
    a.f.forEach((x,g)=>{if(x&&!b.f[g])aviso('🌸 <b>¡Floreció la rama del bloque '+(g+1)+'</b> en tu árbol de la Unidad '+UNITS[u].roman+'!');});});
   base=ahora;}catch(e){}
 }
 const _sv=save;save=function(){const r=_sv.apply(this,arguments);setTimeout(revisar,700);return r;};
 setTimeout(()=>{if(!base)base=foto();},1500);
})();
