/* Cabecera compacta del mapa de la unidad (25-11-2026).
 *  - Una sola tarjeta: título de la unidad + chucao + árbol (sin el recuadro de porcentaje de la unidad).
 *  - Solo reubica elementos que ya crean chucao.js y arbol/arbol.js; no cambia datos ni avance. */
(function(){
 function fusionar(){
  try{
   const top=document.querySelector('#mapView .map-topline');if(!top)return;
   top.classList.add('mc-head');
   const chu=document.getElementById('chuMap');if(chu&&chu.parentNode!==top)top.appendChild(chu);
   const ar=document.getElementById('arMap');if(ar&&ar.parentNode!==top)top.appendChild(ar);
   top.classList.toggle('mc-con-arbol',!!ar);
  }catch(e){}
 }
 window.mcFusionar=fusionar;
 const _pm=paintMascot;paintMascot=function(){const r=_pm.apply(this,arguments);fusionar();return r;};
 const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);fusionar();return r;};
})();
