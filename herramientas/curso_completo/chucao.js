/* Chucao en todo el curso (17-11-2026). Solo presentación: usa el avance que ya calcula el motor.
 *  - Crece con el avance de TODO el curso (5 etapas: 0, 25, 50, 75 y 100 %).
 *  - Grande en la portada y en la pantalla de unidades; mediano en el mapa de la unidad y en la META FINAL;
 *    pequeño en las estaciones, donde reacciona a cada respuesta.
 *  - Aviso cuando sube de etapa. */
(function(){
 var TH=[0,25,50,75,100];
 var NAME=CHUCAO.txt.map(function(t){return t[0].split('·').pop().trim();});
 function pct(){return completed()?100:Math.min(99.9,COUNT>0?100*doneCount()/COUNT:0);}
 function ensureMap(){
  if(document.getElementById('chuMap'))return;
  var top=document.querySelector('#mapView .map-topline');if(!top)return;
  var el=document.createElement('aside');el.id='chuMap';el.className='chu-card';el.setAttribute('aria-label','Tu chucao');
  el.innerHTML='<img data-mascot alt=""><div><span class="chu-eb">TU CHUCAO</span><b id="chuMapStage"></b><span id="chuMapNext"></span><div class="chu-track" aria-hidden="true"><span id="chuMapFill"></span></div></div>';
  top.insertAdjacentElement('afterend',el);
 }
 function toast(msg){
  var t=document.getElementById('chuToast');
  if(!t){t=document.createElement('div');t.id='chuToast';t.setAttribute('role','status');document.body.appendChild(t);}
  t.innerHTML='<img alt="" src="'+CHUCAO.img[Math.max(0,chucaoStage(pct())-1)]+'"><span>'+msg+'</span>';
  t.classList.remove('on');void t.offsetWidth;t.classList.add('on');
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on');},4200);
 }
 var base=paintMascot;
 paintMascot=function(){
  var prev=chucaoPrev;ensureMap();base();
  try{
   var p=pct(),st=chucaoStage(p),s=document.getElementById('chuMapStage'),n=document.getElementById('chuMapNext'),f=document.getElementById('chuMapFill');
   if(s)s.textContent='Etapa '+st+' · '+NAME[st-1];
   if(n){
    if(st>=5)n.textContent='¡Completaste el curso! Tu chucao llegó a su última etapa.';
    else if(st===4)n.textContent='Termina el curso para que llegue a «'+NAME[4]+'».';
    else{var falta=Math.max(1,Math.ceil(TH[st]*COUNT/100)-doneCount());n.textContent='Te faltan '+falta+(falta===1?' actividad':' actividades')+' para llegar a «'+NAME[st]+'».';}
   }
   if(f)f.style.width=(st>=5?100:Math.max(0,Math.min(100,100*(p-TH[st-1])/(TH[st]-TH[st-1]))))+'%';
   if(prev&&st>prev)toast('¡Tu chucao pasó a la etapa '+st+': <b>'+NAME[st-1]+'</b>!');
  }catch(e){}
 };
 var SI=['¡Bien!','¡Eso es!','¡Excelente!','¡Vas muy bien!','¡Correcto!'],NO=['Casi. Revisa la explicación.','Equivocarse también enseña.','Mira el paso y vuelve a intentar.','¡Ánimo! Inténtalo de nuevo.'];
 window.chuReact=function(ok){try{
  var m=document.querySelector('#stationView .st-mascot');if(!m)return;
  var img=m.querySelector('img'),b=m.querySelector('.chu-say');
  if(!b){b=document.createElement('span');b.className='chu-say';m.appendChild(b);}
  var L=ok?SI:NO;b.textContent=L[Math.floor(Math.random()*L.length)];b.classList.toggle('no',!ok);
  m.classList.remove('say');void m.offsetWidth;m.classList.add('say');
  if(img){img.classList.remove('hop','sway');void img.offsetWidth;img.classList.add(ok?'hop':'sway');}
  clearTimeout(m._h);m._h=setTimeout(function(){m.classList.remove('say');},2600);
 }catch(e){}};
 window.chuMeta=function(root,res){try{
  var w=root.querySelector('.mt-wrap');if(!w||w.querySelector('.chu-meta'))return;
  var el=document.createElement('div');el.className='chu-meta';el.setAttribute('aria-hidden','true');
  el.innerHTML='<span>'+(res?'¡Terminaste! Revisa cada pregunta: también se aprende de los errores.':'Tómate tu tiempo. Si quieres, practica antes con un simulacro.')+'</span><img data-mascot alt="">';
  w.insertBefore(el,w.firstChild);paintMascot();
 }catch(e){}};
})();
