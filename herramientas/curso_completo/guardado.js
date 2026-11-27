/* Guardado tolerante (27-11-2026).
 * Antes, si cmi.suspend_data traía un avance de una versión anterior que esta versión no sabía leer
 * («Datos no reconocidos») o un intento con nota pero sin detalle («Faltan datos detallados»), el curso
 * bloqueaba el guardado para no sobrescribirlo, y mostraba «La conexión SCORM no está disponible».
 * Como el curso no se aprueba ni se reprueba, ahora recupera lo que pueda leer y sigue guardando.
 * salvage(raw): conserva solo las líneas que esta versión entiende (estaciones que existen y líneas
 * de extensión M/D/R/B/V/K válidas por sí solas); el resto se descarta. */
let restoredNote='';
function salvage(raw){try{
 if(typeof raw!=='string'||!raw.startsWith('P8|'))return null;
 const ids=new Set(STATIONS.map(s=>s.id)),lines=raw.split('\n'),head=lines.shift(),keep=[],seen=new Set();
 const ok1=l=>{try{return !!restoreCompact('P8||0\n'+l);}catch(e){return false;}};
 for(const l of lines){
  if(!l)continue;
  if(/^[A-Z]\d*\|/.test(l)){const t=l.split('|')[0];if(!seen.has(t)&&ok1(l)){seen.add(t);keep.push(l);}continue;}
  const id=l.split(':')[0];if(ids.has(id)&&!seen.has(id)&&ok1(l)){seen.add(id);keep.push(l);}
 }
 let r=null;try{r=restoreCompact([head].concat(keep).join('\n'));}catch(e){}
 if(!r){try{r=restoreCompact(['P8||0'].concat(keep).join('\n'));}catch(e){}}
 if(!r)return null;r.salvaged=true;r.migrated=true;return r;
}catch(e){return null;}}
function noSaveMsg(){
 if(mode==='error')return 'SiveducMD no aceptó la conexión SCORM. Cierra esta ventana y vuelve a entrar al curso.';
 if(writeBlocked)return 'El avance guardado no se pudo leer, así que no se registra avance.';
 return 'No hay conexión con SiveducMD. No se registra avance.';
}
