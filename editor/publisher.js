/* PACE UACh · publicación unificada V3.1 (sin conexión, compatible con file://).
 * motor_bundle.js contiene ZIP base64 generado desde motor/ oficial.
 * SCORM e HTML proceden exactamente del mismo motor y data.js.
 */
window.PACEPublisher = (()=>{
 'use strict';
 const te = x=>String(x??'');
 const jsData = (u) =>{
  const clean=JSON.parse(JSON.stringify(u));
  clean.stations.forEach(st=>{
   st.unit=0;
   (st.media||[]).filter(m=>m.type!=='video_url').forEach(m=>{
    const file=m.src.split('/').pop();m.src='recursos/'+clean.id+'/'+file;
   });
  });
  const meta=Object.fromEntries(['id','roman','title','subtitle','icon','groups','hints','meta'].map(k=>[k,clean[k]]));
  meta.ready=clean.stations.length>0;
  const lines=[['PACE_BUILD',{scope:'individual_'+clean.id,showWeek4:false}],['UNITS',[meta]],['STATIONS',clean.stations],['LEGACY_STATION_IDS',[]]];
  return '// PACE UACh V3.1 · generado desde '+clean.id+'\n'+lines.map(([k,v])=>'const '+k+'='+JSON.stringify(v)+';').join('\n')+'\n';
 };
 async function prepare(unit,resources){
  PACEValidation.validate(unit,resources);
  if(!window.PACE_MOTOR_ZIP_BASE64)throw Error('Falta motor_bundle.js. Extrae todos los archivos del kit docente.');
  const motor=await JSZip.loadAsync(window.PACE_MOTOR_ZIP_BASE64,{base64:true});
  const root=new JSZip();
  for(const name of ['index.html','styles.css','app.js','mathjax/tex-svg.js','contract.js','content_text.js']){
   const entry=motor.file(name);
   if(!entry)throw Error('El motor de publicación está incompleto: '+name);
   root.file(name,await entry.async('uint8array'));
  }
  root.file('data.js',jsData(unit));
  const used=new Set(unit.stations.flatMap(s=>(s.media||[]).filter(m=>m.type!=='video_url').map(m=>m.src)));
  for(const name of used){
   if(!/^recursos\/[A-Za-z0-9][A-Za-z0-9._-]{0,115}$/.test(name))throw Error('Nombre de recurso inválido: '+name);
   if(!resources[name])throw Error('No se encontró el recurso multimedia '+name);
   root.file('recursos/'+unit.id+'/'+name.split('/').pop(),resources[name]);
  }
  return {root,motor,used};
 }
 const INSTR='Abre index.html después de extraer el ZIP completo. No lo abras dentro del archivo comprimido. En esta versión el progreso se guarda solo localmente, cuando el navegador lo permite. SiveducMD necesita el ZIP del SCORM individual.\n';
 // HTML navegable: copia los archivos del motor + data.js + recursos dentro de `target` bajo `prefix`.
 async function addHTML(prep,target,prefix='VISTA_PREVIA_HTML/',onP){
  const list=Object.keys(prep.root.files).filter(name=>!prep.root.files[name].dir);
  for(const [k,name] of list.entries()){target.file(prefix+name,await prep.root.file(name).async('uint8array'));if(onP)onP({done:k+1,total:list.length,file:name});}
  target.file(prefix+'INSTRUCCIONES.txt',INSTR);
 }
 // SCORM individual: ZIP listo para SiveducMD (bytes).
 async function scormBytes(prep,unit,onP){
  let manifest=await prep.motor.file('imsmanifest.xml').async('string');
  const lines=[...prep.used].map(name=>'<file href="recursos/'+unit.id+'/'+name.split('/').pop()+'"/>').join('');
  manifest=manifest.replace('</resource></resources>',lines+'</resource></resources>');
  manifest=manifest.replace('PACE_MATEMATICA_MODULAR_V7','PACE_INDIVIDUAL_'+unit.id.toUpperCase()+'_V3');
  const scorm=prep.root.clone();scorm.file('imsmanifest.xml',manifest);
  const blob=await scorm.generateAsync({type:'uint8array',compression:'DEFLATE',compressionOptions:{level:6}},m=>{if(onP)onP({pct:m.percent,file:m.currentFile});});
  if(blob.byteLength>=PACEContract.maxScormBytes)throw Error('El SCORM supera 100 MB; reduce recursos antes de publicar');
  return blob;
 }
 // Compatibilidad: HTML + SCORM dentro de `target` (el SCORM se guarda sin volver a comprimirlo).
 async function publish(unit,resources,target,onP){
  const prep=await prepare(unit,resources);
  await addHTML(prep,target,'VISTA_PREVIA_HTML/',onP&&(x=>onP('html',x)));
  const blob=await scormBytes(prep,unit,onP&&(x=>onP('scorm',x)));
  target.file('SCORM_INDIVIDUAL/SCORM_UNIDAD_0'+unit.id[1]+'.zip',blob,{compression:'STORE'});
 }
 return {publish,prepare,addHTML,scormBytes};
})();
