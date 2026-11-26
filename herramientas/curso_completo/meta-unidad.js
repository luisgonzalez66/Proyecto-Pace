/* META FINAL como último paso de la unidad (25-11-2026).
 *  - Mapa: tarjeta con el color de la unidad, la cuenta «estaciones + META FINAL = unidad completa» y un mensaje
 *    según el estado (pendiente, en curso, realizada; unidad completa o lo que falta).
 *  - «Todas las unidades»: cada tarjeta indica estaciones completadas y si la META FINAL está realizada.
 *  Solo presentación: usa el estado del motor (ownStations, stationDone, metaDoneU, state.mts) y abre openMeta como antes. */
(function(){
 const hayMeta=u=>!!(UNITS[u]&&UNITS[u].meta&&UNITS[u].meta.minutes);
 function cuenta(u){const a=ownStations(u);return {n:a.length,d:a.filter(x=>stationDone(x.i)===milestoneCount(x.s)).length};}
 const enCurso=u=>{const m=state.mts&&state.mts[u];return !!(m&&m.s&&!m.e);};
 const mejor=u=>{const m=state.mts&&state.mts[u];return m&&m.b>=0?m.b:null;};
 function tarjetaMapa(){
  try{
   const u=selectedUnit,fin=document.getElementById('mapFinish');if(!fin)return;
   if(!hayMeta(u)){fin.classList.remove('mu-card');return;}
   const U=UNITS[u],c=cuenta(u),run=enCurso(u),hecha=metaDoneU(u),est=c.d===c.n,b=mejor(u),falta=c.n-c.d;
   const completa=est&&hecha;
   let nota;
   if(completa)nota='<b>¡Unidad '+U.roman+' completa!</b> Terminaste sus '+c.n+' estaciones y entregaste la META FINAL. Puedes volver a intentarla para mejorar tu resultado.';
   else if(hecha)nota='Ya entregaste la META FINAL. Para completar la unidad '+(falta===1?'te falta 1 estación.':'te faltan '+falta+' estaciones.');
   else if(run)nota='Tu evaluación está en curso y el reloj sigue corriendo. La unidad queda completa cuando la entregues'+(est?'.':' y termines sus estaciones.');
   else nota='La Unidad '+U.roman+' queda completa cuando terminas sus '+c.n+' estaciones <b>y</b> entregas la META FINAL.'+(est?' Ya terminaste las estaciones: solo te falta la META FINAL.':'');
   const chip=(ok,txt,cls)=>'<span class="mu-chip '+(cls||(ok?'ok':'pend'))+'">'+(ok?'<i aria-hidden="true">✓</i>':'')+txt+'</span>';
   fin.classList.add('mu-card');fin.classList.toggle('mu-done',completa);
   fin.setAttribute('aria-label','META FINAL de la Unidad '+U.roman);
   fin.innerHTML=
    '<div class="mu-rib"><span aria-hidden="true">🏁</span> ÚLTIMO PASO DE LA UNIDAD '+U.roman+'</div>'+
    '<div class="mu-main"><div class="mu-ico" aria-hidden="true"><img data-mascot alt=""></div>'+
     '<div class="mu-copy"><span class="mu-eb">META FINAL</span><h2>'+(run?'Evaluación en curso':hecha?'META FINAL realizada':'Evaluación de la unidad')+'</h2>'+
     '<p>'+(run?'Continúa cuando quieras.':hecha?'Mejor resultado: <b>'+b+' %</b>.':U.meta.minutes+' minutos · con simulacro de práctica · el reloj parte cuando tú decides.')+'</p></div>'+
     '<button type="button" class="mu-btn" id="metaOpen">'+(run?'Continuar':hecha?'Ver META FINAL':'Conocer la META FINAL')+'</button></div>'+
    '<div class="mu-sum" aria-label="Para completar la unidad">'+
     chip(est,'Estaciones '+c.d+'/'+c.n)+'<span class="mu-op" aria-hidden="true">+</span>'+
     chip(hecha,hecha?'META FINAL':run?'META FINAL en curso':'META FINAL pendiente')+'<span class="mu-op" aria-hidden="true">=</span>'+
     chip(completa,completa?'Unidad completa':'Unidad '+U.roman+' completa',completa?'ok big':'goal')+'</div>'+
    '<p class="mu-note">'+nota+'</p>';
   document.getElementById('metaOpen').addEventListener('click',openMeta);
   paintMascot();
  }catch(e){}
 }
 function tarjetasUnidades(){
  try{document.querySelectorAll('#unitsGrid .unit-card[data-unit]').forEach(card=>{
   const u=Number(card.dataset.unit);if(!hayMeta(u)||!ownStations(u).length)return;
   const c=cuenta(u),hecha=metaDoneU(u),run=enCurso(u),b=mejor(u),st=card.querySelector('.unit-status');if(!st)return;
   const completa=hecha&&c.d===c.n;
   st.classList.add('mu-ustat');
   st.innerHTML='<span class="'+(c.d===c.n?'ok':'')+'">'+(c.d===c.n?'✓ ':'')+c.d+' de '+c.n+' estaciones completadas</span>'+
    '<span class="'+(hecha?'ok':run?'run':'pend')+'">'+(hecha?'✓ META FINAL realizada ('+b+' %)':run?'META FINAL en curso':'META FINAL pendiente')+'</span>';
   card.classList.toggle('mu-complete',completa);
   card.setAttribute('aria-label','Unidad '+UNITS[u].roman+', '+UNITS[u].title+'. '+c.d+' de '+c.n+' estaciones completadas. META FINAL '+(hecha?'realizada':run?'en curso':'pendiente')+'. Abrir mapa');
  });}catch(e){}
 }
 /* Resumen para la portada del sitio (páginas de una sola unidad): estaciones completadas, total y estado de la META FINAL.
    Se guarda en este navegador como «pace_resumen_uN»; la portada (index.html del repositorio) lo lee. */
 function resumen(){
  try{if(!(typeof BUILD!=='undefined'&&/^individual/.test(String(BUILD.scope||''))))return;
   UNITS.forEach((U,u)=>{if(!U||!/^u\d$/.test(String(U.id||'')))return;const c=cuenta(u);
    const r={d:c.d,n:c.n,m:hayMeta(u)?(metaDoneU(u)?'done':enCurso(u)?'run':'pend'):'',b:mejor(u),md:doneCount(),mt:COUNT,c:completed()?1:0};
    localStorage.setItem('pace_resumen_'+U.id,JSON.stringify(r));});
  }catch(e){}
 }
 const _sv=save;save=function(){const r=_sv.apply(this,arguments);resumen();return r;};
 setTimeout(resumen,1200);
 const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);tarjetaMapa();return r;};
 const _rh=renderHome;renderHome=function(){const r=_rh.apply(this,arguments);tarjetasUnidades();return r;};
})();
