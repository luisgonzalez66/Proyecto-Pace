/* Navegación (20-11-2026): un solo botón de volver por pantalla, que sube un nivel y dice adónde lleva.
   Estación → «Mapa de la Unidad X»; mapa → «Todas las unidades». Discreto y con versión corta en celular. */
(function(){
const ICO_MAP='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3.2 5.5 1.8l5 1.6 4-1.4v10.8l-4 1.4-5-1.6-4 1.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.5 1.8v10.8M10.5 3.4v10.8" stroke="currentColor" stroke-width="1.5"/></svg>';
const ICO_UNITS='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
function paint(){try{
 const u=UNITS[selectedUnit],r=u?u.roman:'';
 const bm=$('backMap');if(bm){bm.className='nv-back';bm.innerHTML=ICO_MAP+'<span>Mapa<span class="nv-long"> de la Unidad '+esc(r)+'</span></span>';bm.setAttribute('aria-label','Volver al mapa de la Unidad '+r);bm.title='Volver al mapa de la Unidad '+r;}
 const bh=$('backHome');if(bh){bh.className='nv-back';bh.innerHTML=ICO_UNITS+'<span><span class="nv-long">Todas las </span><span class="nv-cap">u</span>nidades</span>';bh.setAttribute('aria-label','Ver todas las unidades');bh.title='Ver todas las unidades';}
}catch(e){}}
const _sh=showOnly;showOnly=function(v){const r=_sh.apply(this,arguments);try{document.body.dataset.view=v;}catch(e){}paint();return r;};
paint();
})();
