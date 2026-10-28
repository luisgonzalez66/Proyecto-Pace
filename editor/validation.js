/* Reglas V3.1: contract.json genera contract.js; paridad comprobada con Python. */
window.PACEValidation=(()=>{
 const C=window.PACEContract;
 // Unión de blancos Unicode de ECMAScript y Python (incluye NEL y U+001C–1F).
 const whitespace=/[\s\u001C-\u001F\u0085]/,blank=/^[\s\u001C-\u001F\u0085]*$/;
 const require=(condition,message)=>{if(!condition)throw Error(message);};
 const text=(v,where,required=true)=>require(typeof v==='string'&&(!required||!blank.test(v))&&Array.from(v).length<=C.maxTextLength&&Array.from(v).every(c=>c.codePointAt(0)<0xD800||c.codePointAt(0)>0xDFFF),where+': texto inválido (máximo '+C.maxTextLength+' caracteres Unicode válidos)');
 function quiz(q,where){require(q&&typeof q==='object'&&!Array.isArray(q),where+': falta la pregunta');text(q.q,where+': enunciado');
  if(q.type==='input'){
   require(q.kind==='number'||q.kind==='set',where+': tipo de respuesta escrita no válido (number o set)');text(q.answer,where+': respuesta correcta');
   require(window.PACETyped,'Falta content_text.js para validar respuestas escritas');
   let r=null;try{r=PACETyped.read(q.kind,q.answer);}catch(e){require(false,where+': la respuesta correcta no se puede interpretar ('+e.message+')');}
   require(q.kind==='set'||r.values.length===1,where+': la respuesta numérica debe ser un solo valor');
   require(q.reduced===undefined||typeof q.reduced==='boolean',where+': "reduced" debe ser verdadero o falso');
   text(q.why,where+': retroalimentación',false);return;}
  require(q.type===undefined||q.type==='mc',where+': tipo de pregunta no reconocido');require(Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=C.maxOptions,where+': entre 2 y '+C.maxOptions+' alternativas');q.options.forEach(o=>text(o,where+': alternativa'));require(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length,where+': respuesta correcta fuera de rango');text(q.why,where+': retroalimentación',false);}
 function validate(u,resources){
  require(u&&u.schema==='pace-unit-v2'&&['u1','u2','u3'].includes(u.id),'Unidad o esquema no compatible');
  for(const k of ['title','subtitle','roman','icon'])text(u[k],k,k!=='subtitle');
  require(Array.isArray(u.groups)&&u.groups.length<=C.maxGroups,'Máximo '+C.maxGroups+' bloques por unidad');
  require(Array.isArray(u.stations)&&u.stations.length<=C.maxStations,'Máximo '+C.maxStations+' estaciones por unidad');
  require(!u.stations.length||u.groups.length>0,'Crea al menos un bloque');u.groups.forEach(g=>{require(g&&typeof g==='object','Bloque inválido');text(g.title,'Título de bloque');});
  const ids=new Set(),used=new Set();
  u.stations.forEach((s,i)=>{
   const loc='Estación '+(i+1);require(s&&typeof s==='object',loc+': estructura inválida');require(typeof s.id==='string'&&/^[A-Za-z0-9_-]{2,44}$/.test(s.id)&&! /\s/.test(s.id),loc+': identificador inválido (2–44 letras, números, _ o -)');require(!ids.has(s.id),loc+': identificador repetido');ids.add(s.id);
   for(const k of ['title','subtitle','concept','example'])text(s[k],loc+': '+k,k==='title');
   require(Number.isInteger(s.group)&&s.group>=0&&s.group<u.groups.length,loc+': bloque inexistente');
   if(s.minutes===undefined)s.minutes=40;require(Number.isInteger(s.minutes)&&s.minutes>=5&&s.minutes<=480,loc+': duración inválida (5–480 min)');
   require(Array.isArray(s.practice)&&s.practice.length>=1&&s.practice.length<=C.maxPractice,loc+': entre 1 y '+C.maxPractice+' prácticas');s.practice.forEach(q=>quiz(q,loc+': práctica'));if(s.draw!==undefined&&s.draw!==null&&s.draw!==''){require(Number.isInteger(s.draw)&&s.draw>=1&&s.draw<=s.practice.length,loc+': el sorteo debe ser un número entre 1 y '+s.practice.length+' (tamaño del banco)');}else delete s.draw;quiz(s.check,loc+': Aplica');
   if(s.checks===undefined)s.checks=[];require(Array.isArray(s.checks)&&s.checks.length<=19,loc+': el banco de Aplica admite hasta 20 preguntas en total');s.checks.forEach(q=>quiz(q,loc+': Aplica (banco)'));if(!s.checks.length)delete s.checks;
   const cb=1+(s.checks||[]).length;if(s.drawCheck!==undefined&&s.drawCheck!==null&&s.drawCheck!==''){require(Number.isInteger(s.drawCheck)&&s.drawCheck>=1&&s.drawCheck<=cb,loc+': el sorteo de Aplica debe ser un número entre 1 y '+cb);}else delete s.drawCheck;
   {const pd=(Number.isInteger(s.draw)&&s.draw<s.practice.length)?s.draw:s.practice.length,cd=(Number.isInteger(s.drawCheck)&&s.drawCheck<cb)?s.drawCheck:cb;require(1+pd+cd<=24,loc+': demasiadas actividades por estudiante ('+(1+pd+cd)+'); usa el sorteo para que Practica + Aplica sumen como máximo 23');}
   if(s.media===undefined)s.media=[];require(Array.isArray(s.media)&&s.media.length<=C.maxMedia,loc+': máximo '+C.maxMedia+' recursos');
   s.media.forEach(m=>{
    require(m&&['image','video_file','video_url','pdf'].includes(m.type),loc+': recurso inválido');text(m.caption===undefined?'':m.caption,loc+': pie',false);text(m.src,loc+': origen');
    if(m.type==='video_url'){require(/^https:\/\/[^\s<>"']{5,1500}$/.test(m.src)&&!whitespace.test(m.src),loc+': enlace HTTPS inválido');return;}
    require(/^recursos\/[A-Za-z0-9][A-Za-z0-9._-]{0,115}$/.test(m.src)&&! /\s/.test(m.src),loc+': nombre de recurso inválido');
    const ext=m.src.split('.').pop().toLowerCase(),allowed=m.type==='image'?['jpg','jpeg','png','webp','gif']:m.type==='pdf'?['pdf']:['mp4','webm'];require(allowed.includes(ext),loc+': extensión no admitida');
    require(resources[m.src]!==undefined,loc+': falta '+m.src);const size=resources[m.src].byteLength??resources[m.src].size;require(Number.isFinite(size)&&size<=C.maxResourceBytes,loc+': recurso superior a 35 MB');used.add(m.src);
   });
  });
  const bytes=[...used].reduce((n,k)=>n+(resources[k].byteLength??resources[k].size),0);require(bytes<=C.maxArchiveBytes,'Recursos de la unidad superiores a 300 MB');return true;
 }
 async function archive(zip){let total=0;const names=Object.keys(zip.files);require(names.length<=C.maxArchiveEntries,'Entrega con demasiados archivos');for(const name of names){if(zip.files[name].dir)continue;total+=(await zip.file(name).async('uint8array')).byteLength;}require(total<=C.maxArchiveBytes,'La entrega completa supera 300 MB descomprimidos; reduce recursos antes de exportar');}
 return {validate,archive};
})();
