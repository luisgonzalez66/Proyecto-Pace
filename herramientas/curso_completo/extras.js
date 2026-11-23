/* Mejoras pequeñas (23-11-2026)
   1) «Reiniciar avance»: solo en las páginas de unidad de GitHub (PACE_BUILD.portal) y en modo local (sin SiveducMD).
      Borra el avance de ESA unidad en este navegador y recarga.
   2) «Escribe solo el resultado»: en preguntas de número, si la respuesta escrita contiene operaciones que la respuesta
      esperada no tiene (3+4, 14/2, √49…), no se corrige ni cuenta como intento: se pide escribir solo el resultado. */
(function(){
 let mounted=false;
 function rlMount(kind){try{
  if(mounted||kind!=='local'||typeof PACE_BUILD==='undefined'||!PACE_BUILD.portal||mode!=='local')return;
  const chip=$('syncIndicator');if(!chip)return;mounted=true;
  const b=document.createElement('button');b.type='button';b.id='resetLocal';b.className='rl-btn';
  b.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Reiniciar avance</span>';
  b.title='Borrar el avance de esta unidad en este navegador';
  b.addEventListener('click',()=>{const u=UNITS.filter(Boolean)[0];
   if(!window.confirm('¿Borrar todo tu avance en la Unidad '+(u?u.roman:'')+' en este navegador?\n\nVolverás a empezar desde cero. No se puede deshacer.'))return;
   try{save=function(){return true;};localStorage.removeItem(KEY);}catch(e){}
   location.reload();});
  chip.insertAdjacentElement('afterend',b);
 }catch(e){}}
 const _sync=sync;sync=function(msg,kind){_sync.apply(this,arguments);rlMount(kind);};
 const T=window.PACETyped;
 if(T&&!T.__soloRes){const c0=T.check;
  const ops=x=>{let t=String(x||'').replace(/\s+/g,'').replace(/^[-−]/,'');
   while(/^\(.*\)$/.test(t)&&!/\).*\(/.test(t.slice(1,-1)))t=t.slice(1,-1).replace(/^[-−]/,'');
   if(/^\d+([.,]\d+)?\/\d+$/.test(t))t=t.replace('/','');
   const o=new Set();for(const ch of t){if('+-−*×·^()√/'.includes(ch))o.add(ch==='−'?'-':ch==='×'||ch==='·'?'*':ch);}return o;};
  T.check=function(q,v){const r=c0.apply(this,arguments);
   try{if(q&&q.kind==='number'&&r&&['ok','wrong','reduce'].includes(r.state)){const oa=ops(q.answer);const extra=[...ops(v)].filter(x=>!oa.has(x));
    if(extra.length)return {state:'invalid',msg:'Escribe solo el resultado, sin operaciones: por ejemplo, 7 en lugar de 3+4.'};}}catch(e){}
   return r;};
  T.__soloRes=true;}
})();
