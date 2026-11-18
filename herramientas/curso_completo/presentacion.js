/* Presentación (18-11-2026): color de la unidad en el body, mapa con el bloque en curso abierto, tarjetas con su avance. */
(function(){
 function setU(u){try{var x=UNITS[u];document.body.dataset.u=x&&x.id?x.id:String(u);}catch(e){}}
 var _os=openStation;openStation=function(i){setU(STATIONS[i]&&STATIONS[i].unit);return _os.apply(this,arguments);};
 var _om=openMap;openMap=function(u){setU(u);return _om.apply(this,arguments);};
 var _oh=openHome;openHome=function(){try{delete document.body.dataset.u;}catch(e){}return _oh.apply(this,arguments);};
})();
