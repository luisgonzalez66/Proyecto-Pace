/* «Tu respuesta» en la revisión de la META FINAL (sugerencia de Henry, 26-11-2026).
 *  - Durante la evaluación el motor tiene las respuestas solo en memoria (metaVals). Aquí se copian, por unidad,
 *    las del ÚLTIMO INTENTO OFICIAL a state.mv[u] = {n: intento, v: [respuesta por pregunta]}; así se ven al reabrir.
 *  - SCORM 1.2 permite 4096 bytes de avance: se guardan en líneas «V<u>|<intento>|r1,r2,…» (alternativa «c<k>», escrita
 *    «t<texto>», en blanco vacío; texto hasta 40 caracteres). Si alguna vez no cupieran, se descartan estas líneas
 *    (primero las más largas) y NUNCA el avance.
 *  - El simulacro no se guarda (solo se muestra mientras está abierto). */
(function(){
 const MAXT=40;
 const MV=()=>{if(!state.mv||typeof state.mv!=='object')state.mv={};return state.mv;};
 const enc=v=>v==null||v===''?'':(typeof v==='number'?'c'+v:'t'+encodeURIComponent(String(v).replace(/\s+/g,' ').trim().slice(0,MAXT)));
 const dec=s=>!s?'':s[0]==='c'?parseInt(s.slice(1),10):s[0]==='t'?(()=>{try{return decodeURIComponent(s.slice(1));}catch(e){return '';}})():'';
 /* copia las respuestas del intento oficial en curso (solo mientras se responde o al entregar) */
 function capturar(){
  try{if(typeof metaMode==='undefined'||metaMode!=='off'||metaPhase!=='run')return;const m=MT();if(!m)return;
   const N=(m.a||[]).length,v=[];let alguna=false;
   for(let i=0;i<N;i++){const x=metaVals['off'+m.n+':'+i];v.push(x==null?'':x);if(x!=null&&x!=='')alguna=true;}
   const prev=MV()[mu];if(!alguna&&prev&&prev.n===m.n)return;
   MV()[mu]={n:m.n,v};
  }catch(e){}
 }
 const _mf=metaFinish;metaFinish=function(){capturar();return _mf.apply(this,arguments);};
 const _sv=save;save=function(){capturar();return _sv.apply(this,arguments);};
 /* guardado compacto con tope de bytes */
 const bytes=t=>new TextEncoder().encode(t).length;
 const _ser=serializeState;
 serializeState=function(){
  const base=_ser.apply(this,arguments),mv=state.mv||{};
  let L=Object.keys(mv).filter(u=>mv[u]&&Array.isArray(mv[u].v)&&mv[u].v.some(x=>x!==''&&x!=null)).sort().map(u=>'\nV'+u+'|'+(mv[u].n|0).toString(36)+'|'+mv[u].v.map(enc).join(','));
  const max=((typeof PACEContract!=='undefined'&&PACEContract.maxSuspendBytes)||4096)-64;
  while(L.length&&bytes(base+L.join(''))>max){let k=0;L.forEach((l,i)=>{if(l.length>L[k].length)k=i;});L.splice(k,1);}
  return base+L.join('');
 };
 const _rc=restoreCompact;
 restoreCompact=function(raw){
  const lines=String(raw).split('\n'),mv={};
  for(let i=lines.length-1;i>0;i--){const m=/^V(\d)\|([0-9a-z]{1,3})\|(.*)$/.exec(lines[i]);if(m){mv[m[1]]={n:parseInt(m[2],36),v:m[3].split(',').map(dec)};lines.splice(i,1);}}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.mv=mv;return r;
 };
 /* lo que se muestra en «Revisa cada pregunta» */
 window.mjTuResp=function(S,i,q,st){
  try{
   let v=metaVals[S.mode+S.n+':'+i];
   if((v==null||v==='')&&S.mode==='off'){const g=(state.mv||{})[mu];if(g&&g.n===S.n)v=g.v[i];}
   const cls=st==='1'?'ok':st==='0'?'bad':'no';
   if(v==null||v===''||(typeof v==='number'&&!(q.options&&q.options[v]!=null)))return '<p class="mt-tu no"><b>Tu respuesta:</b> Sin responder</p>';
   let h;
   if(typeof v==='number')h='<span class="math-content">'+rich(q.options[v])+'</span>';
   else{let t=null;try{t=PACETyped.previewTex(q.kind,String(v));}catch(e){}h=t?'<span class="math-content">'+rich('\\('+t+'\\)')+'</span>':'<code>'+esc(String(v))+'</code>';}
   return '<p class="mt-tu '+cls+'"><b>Tu respuesta:</b> '+h+'</p>';
  }catch(e){return '';}
 };
})();
