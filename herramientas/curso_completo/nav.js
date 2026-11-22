/* Navegación (20-11-2026, revisada 22-11-2026): un solo botón de volver por pantalla, que sube un nivel y dice adónde lleva.
   · Estación (y «Antes de empezar») → «Volver a la Unidad X» (en celular, «Unidad X»): vuelve a la pantalla de bloques de la unidad.
   · Pantalla de la unidad → «Todas las unidades» (en celular, «Unidades»):
       - curso completo (SCORM y HTML completo): abre la pantalla con las tres unidades;
       - páginas de cada unidad en GitHub (PACE_BUILD.portal): va a la portada del sitio, a la sección del curso;
       - exportación individual de una unidad (sin otras unidades): no hay botón, porque no hay nada más arriba.
   · Fuera del curso completo, la portada propia de cada unidad (con una sola tarjeta) se omite: la página abre directo
     en los bloques de la unidad. En GitHub, cualquier «ir al inicio» lleva a la portada del sitio (#curso). (22-11-2026) */
const NV_BACK='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NV_UNITS='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const NV_HOME='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 7.5 8 2.5l6 5M3.8 6.2V13.5h8.4V6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function nvUnitBtnHTML(r){return NV_BACK+'<span><span class="nv-long">Volver a la </span>Unidad '+esc(r)+'</span>';}
function nvMode(){let b={};try{b=(typeof PACE_BUILD!=='undefined'&&PACE_BUILD)||{};}catch(e){}
 if(b.scope==='curso_completo'||UNITS.filter(Boolean).length>1)return 'curso';return b.portal?'portal':'sola';}
(function(){
function paint(){try{
 const u=UNITS[selectedUnit],r=u?u.roman:'';
 const bm=$('backMap');if(bm){bm.className='nv-back';bm.innerHTML=nvUnitBtnHTML(r);bm.setAttribute('aria-label','Volver a la Unidad '+r);bm.title='Volver a la Unidad '+r+' (todos sus bloques)';}
 const bb=$('bottomHome');if(bb&&nvMode()!=='sola')bb.textContent='← Todas las unidades';
 let bh=$('backHome');if(bh){
  const m=nvMode();
  bh.className='nv-back';
  if(m==='sola'){bh.style.display='none';}
  else{bh.innerHTML=NV_UNITS+'<span><span class="nv-long">Todas las </span><span class="nv-cap">u</span>nidades</span>';bh.setAttribute('aria-label','Ver todas las unidades');bh.title='Ver todas las unidades';}
 }
}catch(e){}}
const NVM=nvMode();
if(NVM!=='curso'){
 let booted=false;const ui=Math.max(0,UNITS.findIndex(Boolean));
 openHome=function(){
  if(NVM==='portal'&&booted){try{location.href=PACE_BUILD.portal;return;}catch(e){}}
  booted=true;return openMap(ui);
 };
 ['backHome','bottomHome'].forEach(id=>{const o=$(id);if(!o)return;const c=o.cloneNode(true);o.replaceWith(c);
  if(NVM==='portal')c.addEventListener('click',()=>openHome());else c.style.display='none';});
 const ch=$('courseHome');if(ch)ch.style.display='none';
}
const _sh=showOnly;showOnly=function(v){const r=_sh.apply(this,arguments);try{document.body.dataset.view=v;}catch(e){}paint();return r;};
paint();
})();
