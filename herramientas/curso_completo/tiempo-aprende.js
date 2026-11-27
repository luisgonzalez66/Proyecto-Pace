/* Tiempo en «Aprende» (26-11-2026) para el informe estadístico.
 *  - Cuenta solo el tiempo ACTIVO con Aprende a la vista: se pausa si la pestaña del navegador queda oculta
 *    o si pasan 2 minutos sin actividad (clic, tecla, desplazamiento o toque).
 *  - Cada visita a Aprende de una estación (de al menos 5 s) se envía a SiveducMD como una interacción más:
 *      id «<estación>.TA», tipo numeric, respuesta = segundos, resultado neutral.
 *    Así aparece en el mismo informe de Interacciones que exporta SiveducMD (columna «Respuesta»).
 *  - Solo en SCORM (en el sitio y en la vista de prueba no se envía nada). Respeta el tope de 2000 interacciones. */
(function(){
 const PASO=5,INACTIVO=120,MINIMO=5;
 let vis=null,ultimo=Date.now();
 ['pointerdown','keydown','wheel','touchstart','scroll','input'].forEach(e=>document.addEventListener(e,()=>{ultimo=Date.now();},{passive:true,capture:true}));
 function enAprende(){
  try{const v=document.getElementById('stationView');
   return !!(v&&!v.classList.contains('hidden')&&typeof activeTab!=='undefined'&&activeTab==='learn'&&STATIONS[stationIndex]&&document.visibilityState==='visible');}catch(e){return false;}
 }
 function enviar(v){
  try{
   if(!v||v.t<MINIMO||mode!=='scorm'||!connected||writeBlocked)return;
   if(intN<0){const c=parseInt(get('cmi.interactions._count'),10);intN=Number.isFinite(c)&&c>=0?c:0;}
   if(intN>=2000)return;
   const n=intN++,p='cmi.interactions.'+n+'.',t=Math.round(v.t);
   const hh=String(Math.floor(t/3600)).padStart(4,'0'),mm=String(Math.floor(t%3600/60)).padStart(2,'0'),ss=String(t%60).padStart(2,'0');
   set(p+'id',v.sid+'.TA');set(p+'time',new Date().toTimeString().slice(0,8));set(p+'type','numeric');
   set(p+'weighting','0');set(p+'student_response',String(t));set(p+'result','neutral');set(p+'latency',hh+':'+mm+':'+ss);
   clearTimeout(intTimer);intTimer=setTimeout(commit,1500);
  }catch(e){}
 }
 function cerrar(){if(vis){const v=vis;vis=null;enviar(v);}}
 setInterval(()=>{
  if(!enAprende()){cerrar();return;}
  const s=STATIONS[stationIndex];
  if(vis&&vis.sid!==s.id)cerrar();
  if(!vis)vis={sid:s.id,t:0};
  if(Date.now()-ultimo<INACTIVO*1000)vis.t+=PASO;
 },PASO*1000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){cerrar();try{commit();}catch(e){}}});
 window.addEventListener('pagehide',()=>{cerrar();try{commit();}catch(e){}});
 window.tiempoAprende={actual:()=>vis&&{...vis}};
})();
