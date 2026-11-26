/* Chucao en cinco etapas (propuesta de Henry Hughes, 25-11-2026).
 *  - Etapas: 1 Despertar (0 %), 2 Eclosión (≥ 2 % del curso y al menos 1 estación), 3 Descubrimiento (≥ 15 %),
 *    4 Crecimiento (≥ 50 %), 5 Plenitud (curso finalizado oficialmente: estaciones y META FINAL de todas las unidades).
 *  - El porcentaje es el real del motor (sin redondear), del curso completo; en las páginas sueltas de una unidad, de esa unidad.
 *  - Al alcanzar un umbral la evolución queda DISPONIBLE; el estudiante la ACTIVA con «Evolucionar» (gratis, cuando quiera).
 *    La etapa activada nunca retrocede. Se guarda con el avance: línea «K|activada,máxima,ofrecida,avisada».
 *  - En las estaciones el chucao lleva el objeto de la sección: Aprende (libro), Practica (cuaderno), Aplica (portapapeles), Explora (lupa).
 *  - Nunca abre ventanas por sí solo: avisa con un mensaje breve y ofrece «Evolucionar» en «Todas las unidades» y junto al árbol. */
(function(){
 if(typeof CHU5_IMG==='undefined'||typeof CHUCAO==='undefined')return;
 const NAMES=['Despertar','Eclosión','Descubrimiento','Crecimiento','Plenitud'];
 const FRASES=['Aquí empieza todo. Completa tu primera estación y me verás nacer.',
  '¡Ya asomé del cascarón! Cada estación me da fuerzas.',
  'Ya salí del cascarón. Sigamos descubriendo juntos.',
  'Estoy creciendo contigo: ya vamos en la segunda mitad.',
  '¡Completamos el recorrido! Gracias por llegar hasta aquí.'];
 const TH=[0,2,15,50,100];
 CHUCAO.img=CHU5_IMG.n.slice();
 CHUCAO.txt=NAMES.map((n,i)=>[(i+1)+' · '+n,FRASES[i]]);
 const C=()=>{if(!state.chu||typeof state.chu!=='object')state.chu={a:1,m:1,o:1,t:1};return state.chu;};
 const real=()=>completed()?100:Math.min(99.9,COUNT>0?100*doneCount()/COUNT:0);
 const nDone=()=>STATIONS.reduce((n,s,i)=>n+(stationDone(i)>=milestoneCount(s)?1:0),0);
 function porAvance(){if(completed())return 5;const p=real();if(p>=50)return 4;if(p>=15)return 3;if(p>=2&&nDone()>=1)return 2;return 1;}
 const activa=()=>Math.max(1,Math.min(5,C().a|0||1));
 function disponible(){const c=C(),d=porAvance();if(d>(c.m|0))c.m=d;return Math.max(activa(),Math.min(5,c.m|0||1));}
 const pendiente=()=>disponible()>activa();
 window.chu5={activa,disponible,pendiente,porAvance,evolucionar:()=>abrir()};
 /* el motor y chucao.js preguntan la etapa con chucaoStage(p): ahora es la ACTIVADA */
 chucaoStage=function(){return activa();};
 /* ---------- guardado (SCORM: línea K|; en el navegador va dentro del estado) ---------- */
 const _ser=serializeState;
 serializeState=function(){const b=_ser.apply(this,arguments),c=C();return (c.a>1||c.m>1)?b+'\nK|'+[c.a|0,c.m|0,c.o|0,c.t|0].join(','):b;};
 const _rc=restoreCompact;
 restoreCompact=function(raw){const L=String(raw).split('\n'),j=L.findIndex(l=>l.startsWith('K|'));let chu={a:1,m:1,o:1,t:1};
  if(j>0){const v=L.splice(j,1)[0].slice(2).split(',').map(x=>Math.max(1,Math.min(5,parseInt(x,10)||1)));chu={a:v[0],m:Math.max(v[0],v[1]||1),o:v[2]||1,t:v[3]||1};}
  const r=_rc(L.join('\n'));if(r&&r.val)r.val.chu=chu;return r;};
 /* ---------- textos de la tarjeta del mapa ---------- */
 function textoSiguiente(){
  const a=activa(),d=disponible();
  if(d>a)return '¡Tu chucao puede evolucionar a «'+NAMES[a]+'»!';
  if(a>=5)return '¡Completaste el curso! Tu chucao llegó a su última etapa.';
  if(a===4)return 'Termina el curso (todas las estaciones y las META FINAL) para llegar a «Plenitud».';
  if(a===1)return 'Completa tu primera estación para que nazca.';
  const falta=Math.max(1,Math.ceil(TH[a]*COUNT/100)-doneCount()),k=Math.max(1,Math.round(falta/(COUNT/STATIONS.length)));
  return (k===1?'Te falta más o menos 1 estación':'Te faltan unas '+k+' estaciones')+' para llegar a «'+NAMES[a]+'».';
 }
 /* ---------- variante por sección dentro de la estación ---------- */
 function varianteEstacion(){
  try{const img=document.querySelector('#stationView .st-mascot img');if(!img)return;
   const k=CHU5_IMG.v[activeTab]?activeTab:'learn',a=activa(),key=k+a;
   if(img.dataset.v!==key){img.src=CHU5_IMG.v[k][a-1];img.dataset.v=key;}
   img.dataset.st=String(a);
  }catch(e){}
 }
 /* ---------- botón «Evolucionar» y tarjeta en «Todas las unidades» ---------- */
 function botonMapa(){
  const card=document.getElementById('chuMap');if(!card)return;
  let b=document.getElementById('chu5MapBtn');
  if(pendiente()){
   if(!b){b=document.createElement('button');b.type='button';b.id='chu5MapBtn';b.className='chu5-btn sm';b.innerHTML='<span aria-hidden="true">✨</span> Evolucionar';b.addEventListener('click',()=>abrir());
    const box=card.querySelector('#chuMapNext');(box&&box.parentNode||card).appendChild(b);}
  }else if(b)b.remove();
 }
 function tarjetaInicio(){
  const hp=document.querySelector('#homeView .hero-pingu');if(!hp)return;
  const host=hp.closest('.welcome')||hp.parentNode;let el=document.getElementById('chu5Home');
  if(!pendiente()){if(el)el.remove();host.classList.remove('chu5-con');return;}
  const c=C(),d=disponible(),nueva=(c.o|0)<d;
  if(!el){el=document.createElement('div');el.id='chu5Home';el.setAttribute('role','region');el.setAttribute('aria-label','Tu chucao');host.appendChild(el);}
  host.classList.add('chu5-con');
  el.className='chu5-home'+(nueva?' nueva':'');
  el.innerHTML=(nueva?'<b>¡Tu chucao puede evolucionar!</b><span>Ya alcanzó la etapa «'+NAMES[activa()]+'».</span>':'')+
   '<div class="chu5-acts"><button type="button" class="chu5-btn" id="chu5Go"><span aria-hidden="true">✨</span> Evolucionar</button>'+
   (nueva?'<button type="button" class="chu5-later" id="chu5Later">Más tarde</button>':'')+'</div>';
  el.querySelector('#chu5Go').addEventListener('click',()=>abrir());
  const l=el.querySelector('#chu5Later');if(l)l.addEventListener('click',()=>{C().o=disponible();save();tarjetaInicio();});
 }
 /* ---------- aviso breve cuando se desbloquea una etapa ---------- */
 const enMeta=()=>{const m=document.getElementById('metaView');return !!(m&&!m.classList.contains('hidden'));};
 function avisar(){
  try{const c=C(),d=disponible();if(d<=activa()||d<=(c.t|0))return;
   if(enMeta())return;                      /* durante la META FINAL no se avisa; se avisará después */
   c.t=d;save();
   if(document.getElementById('chu5Home')&&document.getElementById('chu5Home').offsetParent)return; /* la tarjeta ya está a la vista */
   let t=document.getElementById('chuToast');
   if(!t){t=document.createElement('div');t.id='chuToast';t.setAttribute('role','status');document.body.appendChild(t);}
   t.innerHTML='<img alt="" src="'+CHU5_IMG.n[activa()-1]+'"><span><b>¡Tu chucao puede evolucionar!</b> Hazlo cuando quieras desde «Todas las unidades» o junto a tu árbol.</span>';
   t.classList.remove('on');void t.offsetWidth;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),5200);
  }catch(e){}
 }
 /* ---------- ventana de evolución con animación breve ---------- */
 let ov=null,foco=null;
 const sinMov=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function cerrar(){if(!ov)return;ov.remove();ov=null;document.removeEventListener('keydown',tecla,true);try{foco&&foco.focus();}catch(e){}renderTodo();}
 function tecla(e){if(!ov)return;if(e.key==='Escape'){e.preventDefault();cerrar();}
  if(e.key==='Tab'){const f=[...ov.querySelectorAll('button:not([hidden])')];if(!f.length)return;const i=f.indexOf(document.activeElement);
   if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}}}
 function abrir(){
  if(!pendiente()||enMeta())return;
  foco=document.activeElement;
  const ts=document.getElementById('chuToast');if(ts)ts.classList.remove('on');
  const de=activa(),a=de+1,c=C();c.a=a;if((c.o|0)<a)c.o=a;if((c.t|0)<a)c.t=a;
  try{chucaoPrev=a;}catch(e){}
  save();
  if(!ov){ov=document.createElement('div');ov.className='chu5-ov';document.body.appendChild(ov);document.addEventListener('keydown',tecla,true);}
  const mas=disponible()>a;
  ov.innerHTML='<div class="chu5-dlg" role="dialog" aria-modal="true" aria-labelledby="chu5T">'+
   '<div class="chu5-stage'+(de===1?' huevo':'')+(sinMov()?' fin':'')+'"><span class="chu5-flash" aria-hidden="true"></span>'+
    '<img class="chu5-old" alt="" src="'+CHU5_IMG.n[de-1]+'"><img class="chu5-new" alt="Tu chucao en la etapa '+a+', '+NAMES[a-1]+'" src="'+CHU5_IMG.n[a-1]+'"></div>'+
   '<p class="chu5-eb">ETAPA '+a+' DE 5</p><h2 id="chu5T">¡Tu chucao ha evolucionado!</h2><p class="chu5-name">'+NAMES[a-1]+'</p><p class="chu5-frase">'+FRASES[a-1]+'</p>'+
   '<div class="chu5-acts"><button type="button" class="chu5-skip" id="chu5Skip"'+(sinMov()?' hidden':'')+'>Omitir animación</button>'+
   (mas?'<button type="button" class="chu5-btn" id="chu5Next"><span aria-hidden="true">✨</span> Evolucionar a «'+NAMES[a]+'»</button>':'')+
   '<button type="button" class="'+(mas?'chu5-later':'chu5-btn')+'" id="chu5Ok">'+(mas?'Más tarde':'¡Genial!')+'</button></div></div>';
  const st=ov.querySelector('.chu5-stage'),fin=()=>{st.classList.add('fin');const s=ov&&ov.querySelector('#chu5Skip');if(s){const f=document.activeElement===s;s.hidden=true;if(f){const n=ov.querySelector('#chu5Next')||ov.querySelector('#chu5Ok');n&&n.focus();}}};
  if(!sinMov()){requestAnimationFrame(()=>st.classList.add('go'));st._h=setTimeout(fin,1900);}
  ov.querySelector('#chu5Skip').addEventListener('click',()=>{clearTimeout(st._h);fin();ov.querySelector('#chu5Ok').focus();});
  ov.querySelector('#chu5Ok').addEventListener('click',()=>{if(mas){C().o=disponible();save();}cerrar();});
  const nx=ov.querySelector('#chu5Next');if(nx)nx.addEventListener('click',()=>abrir());
  (ov.querySelector('#chu5Skip:not([hidden])')||ov.querySelector('#chu5Ok')).focus();
  renderTodo();
 }
 /* ---------- enganches ---------- */
 function renderTodo(){try{paintMascot();}catch(e){}}
 const _pm=paintMascot;
 paintMascot=function(){
  disponible();
  const r=_pm.apply(this,arguments);
  try{
   const a=activa(),s=document.getElementById('chuMapStage'),n=document.getElementById('chuMapNext'),f=document.getElementById('chuMapFill'),p=real();
   if(s)s.textContent='Etapa '+a+' · '+NAMES[a-1];
   if(n)n.textContent=textoSiguiente();
   if(f){const d=disponible();f.style.width=(d>=5?100:Math.max(0,Math.min(100,100*(p-TH[d-1])/(TH[d]-TH[d-1]))))+'%';}
   document.querySelectorAll('img[data-mascot]').forEach(i=>{if(!i.closest('.st-mascot'))i.alt='';});
   varianteEstacion();botonMapa();tarjetaInicio();
  }catch(e){}
  return r;
 };
 const _rs=renderStation;renderStation=function(){const r=_rs.apply(this,arguments);varianteEstacion();return r;};
 const _sv=save;save=function(){const r=_sv.apply(this,arguments);setTimeout(avisar,900);return r;};
 setTimeout(()=>{renderTodo();},700);
})();
