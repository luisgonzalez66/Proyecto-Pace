(()=>{'use strict';
const $=id=>document.getElementById(id), $$=(selector,context=document)=>Array.from(context.querySelectorAll(selector));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const multiline=value=>PACEText.html(value);
let unit=null,unitFile='',resources={},selected=-1,activeTab='learn',dirty=false,objectURLs={};let mapMode='example';
const qNew=()=>({q:'Escribe aquí una pregunta',options:['Alternativa A','Alternativa B','Alternativa C'],correct:0,why:'Explica por qué es correcta la respuesta.'});
function station(){return unit?.stations[selected]||null;}
function alertMessage(t,bad=false){const box=$('warning');box.textContent=t;box.classList.remove('hidden');box.classList.toggle('warn',bad);}
function status(t){$('unitStatus').textContent=t;}
function touch(){dirty=true;status('Cambios sin exportar · descarga el ZIP cuando termines');updateTime();schedulePreview();scheduleMapPreview();}
function safelyCloseOldObjects(){Object.values(objectURLs).forEach(url=>URL.revokeObjectURL(url));objectURLs={};}
function fileURL(path){if(!resources[path])return '';if(!objectURLs[path]){
 const ext=path.split('.').pop().toLowerCase();const mime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',mp4:'video/mp4',webm:'video/webm',pdf:'application/pdf'}[ext]||'application/octet-stream';
 objectURLs[path]=URL.createObjectURL(new Blob([resources[path]],{type:mime}));
 }return objectURLs[path];}
function updateTime(){if(!unit)return;const mins=unit.stations.reduce((sum,s)=>sum+(Number(s.minutes)||0),0);const h=Math.floor(mins/60),m=mins%60;$('totalTime').textContent=`Tiempo planificado: ${h} h ${String(m).padStart(2,'0')} min / 8 h`;}
function changeUnitFields(){if(!unit)return;for(const [id,key] of [['uTitle','title'],['uSubtitle','subtitle'],['uIcon','icon']])$(id).value=unit[key]||'';$('uWeek').value=unit.week||'';$('unitName').textContent='Unidad '+unit.roman;}
function renderGroups(){if(!unit)return;
 $('groupList').innerHTML=unit.groups.map((g,i)=>`<div class="fieldset"><label class="field">Bloque ${i+1}<input data-groupindex="${i}" data-groupfield="title" value="${esc(g.title)}"></label><label class="field">Breve descripción<input data-groupindex="${i}" data-groupfield="subtitle" value="${esc(g.subtitle||'')}"></label><button class="btn small-btn danger" data-removegroup="${i}" ${unit.groups.length===1?'disabled':''} type="button">Quitar bloque</button></div>`).join('')||'<p class="hint">Agrega el primer bloque temático.</p>';
}
function renderStationList(){if(!unit)return;$('stationList').innerHTML=unit.stations.map((s,i)=>`<button type="button" data-index="${i}" class="${selected===i?'active':''}">${String(i+1).padStart(2,'0')} · ${esc(s.title)}</button>`).join('')||'<p class="hint">Esta unidad no tiene estaciones. Pulsa «+ Estación».</p>';}
function renderStationEditor(){const s=station();$('editorEmpty').classList.toggle('hidden',!!s);$('stationEditor').classList.toggle('hidden',!s);
 if(!s){schedulePreview();return;}
 $('stationID').textContent='ID · '+s.id;
 for(const el of $$('[data-s]'))el.value=s[el.dataset.s]??'';
 $('sGroup').innerHTML=unit.groups.map((g,i)=>`<option value="${i}">${esc(g.title)}</option>`).join('');$('sGroup').value=s.group;
 renderMediaList();renderQuestions();schedulePreview();
}
function renderQuestions(){const s=station();if(!s)return;
 $('practiceList').innerHTML=s.practice.map((q,i)=>quizMarkup(q,'practice',i)).join('');
 $('checkEditor').innerHTML=quizMarkup(s.check,'check',0);
 $('checkList').innerHTML=(s.checks||[]).map((q,i)=>quizMarkup(q,'checks',i)).join('');
}
const typeSel=q=>`<label class="field" style="margin-bottom:9px">Tipo de pregunta<select data-qtype="1"><option value="mc" ${q.type==='input'?'':'selected'}>Alternativas</option><option value="input" ${q.type==='input'?'selected':''}>Respuesta escrita (número o conjunto)</option></select></label><label class="field" style="margin-bottom:9px">Nivel de dificultad (opcional)<select data-qfield="level"><option value="" ${q.level?'':'selected'}>Sin nivel</option><option value="1" ${q.level===1?'selected':''}>1 · Básico: números enteros, sin simplificar</option><option value="2" ${q.level===2?'selected':''}>2 · Intermedio: simplificar, resultados racionales</option><option value="3" ${q.level===3?'selected':''}>3 · Avanzado: números grandes o más pasos</option></select></label>`;
const typedNote=q=>{if(!String(q.answer||'').trim())return '⚠ Escribe la respuesta correcta.';try{const r=PACETyped.read(q.kind,q.answer);return q.kind==='set'?'✓ Se leerá como conjunto de '+r.values.length+' valor(es): '+r.values.map(x=>+x.toFixed(6)).join(' ; '):'✓ Se leerá como el valor '+(+r.values[0].toFixed(6));}catch(err){return '⚠ No se puede interpretar: '+err.message;}};
function typedMarkup(q,lane,i){return `<div class="question" data-lane="${lane}" data-qi="${i}"><div class="question-title"><span>${lane==='check'?'Problema contextual de Aplica':lane==='checks'?'Aplica · banco '+(i+2):'Ejercicio '+(i+1)}</span>${lane==='checks'?`<button class="btn danger small-btn" type="button" data-removec="${i}">Eliminar pregunta</button>`:''}${lane==='practice'?`<button class="btn danger small-btn" type="button" data-removeq="${i}" ${station().practice.length<=1?'disabled':''}>Eliminar pregunta</button>`:''}</div>${typeSel(q)}<label class="field full">Enunciado<textarea data-qfield="q" rows="2">${esc(q.q)}</textarea></label><div class="fields" style="margin:9px 0"><label class="field">Qué escribe el estudiante<select data-qfield="kind"><option value="number" ${q.kind==='set'?'':'selected'}>Un número (entero, decimal o fracción)</option><option value="set" ${q.kind==='set'?'selected':''}>Un conjunto de números (ej.: x = 2 y x = 3)</option></select></label><label class="field">Respuesta correcta<input data-qfield="answer" value="${esc(q.answer||'')}" placeholder="Número: 3/2 · Conjunto: 2; 3 · Vacío: ∅"></label></div><label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" data-qcheck="reduced" ${q.reduced?'checked':''}> Exigir fracción simplificada (solo respuestas numéricas)</label><p class="hint" data-tnote>${esc(typedNote(q))}</p><label class="field" style="margin-top:9px">Retroalimentación<textarea data-qfield="why" rows="2">${esc(q.why||'')}</textarea></label></div>`;}
function quizMarkup(q,lane,i){return q.type==='input'?typedMarkup(q,lane,i):mcMarkup(q,lane,i);}
function mcMarkup(q,lane,i){return `<div class="question" data-lane="${lane}" data-qi="${i}"><div class="question-title"><span>${lane==='check'?'Problema contextual de Aplica':lane==='checks'?'Aplica · banco '+(i+2):'Ejercicio '+(i+1)}</span>${lane==='checks'?`<button class="btn danger small-btn" type="button" data-removec="${i}">Eliminar pregunta</button>`:''}${lane==='practice'?`<button class="btn danger small-btn" type="button" data-removeq="${i}" ${station().practice.length<=1?'disabled':''}>Eliminar pregunta</button>`:''}</div>${typeSel(q)}<label class="field full">Enunciado<textarea data-qfield="q" rows="2">${esc(q.q)}</textarea></label><div class="fields" style="margin:9px 0">${q.options.map((o,k)=>`<label class="field">Alternativa ${k+1}<input data-option="${k}" value="${esc(o)}"></label>`).join('')}</div><div class="hstack"><button type="button" class="btn small-btn" data-addoption="${i}" ${q.options.length>=8?'disabled':''}>+ Alternativa</button><button type="button" class="btn small-btn danger" data-removeoption="${i}" ${q.options.length<=2?'disabled':''}>− Última alternativa</button></div><label class="field" style="margin-top:9px">Respuesta correcta<select data-qfield="correct">${q.options.map((o,k)=>`<option value="${k}" ${q.correct===k?'selected':''}>Alternativa ${k+1}</option>`).join('')}</select></label><label class="field" style="margin-top:9px">Retroalimentación<textarea data-qfield="why" rows="2">${esc(q.why||'')}</textarea></label></div>`;}
function renderMediaList(){const s=station();if(!s)return;$('resourceList').innerHTML=(s.media||[]).map((m,i)=>`<div class="resource" data-mediaindex="${i}"><div class="hstack"><strong>${m.type==='image'?'🖼️ Imagen':m.type==='pdf'?'📄 Documento PDF':m.type==='video_file'?'🎬 Archivo de video':'▶ Video externo'} · ${esc(m.src)}</strong><button class="btn small-btn danger" data-removemedia="${i}" type="button">Quitar</button></div><label class="field">Título o pie<input data-mediafield="caption" value="${esc(m.caption||'')}"></label></div>`).join('')||'<p class="hint">Aún no has agregado recursos. Las imágenes y videos locales se guardan dentro del ZIP.</p>';
}
async function openUnit(file){if(dirty&&!confirm('Hay cambios sin exportar. ¿Descartarlos para abrir otro paquete?'))return;
 try{
  const zip=await JSZip.loadAsync(file);const names=Object.keys(zip.files).filter(n=>/^unidad_0[1-3]\.json$/.test(n));if(names.length!==1)throw Error('Debe existir exactamente un archivo unidad_01.json, unidad_02.json o unidad_03.json en la raíz.');
  const raw=await zip.file(names[0]).async('string'),d=JSON.parse(raw.replace(/^\uFEFF/,''));
  if(d.schema!=='pace-unit-v2'||!Array.isArray(d.stations)||!Array.isArray(d.groups)||!/^u[1-3]$/.test(d.id)||names[0]!==`unidad_0${d.id[1]}.json`)throw Error('Paquete no compatible con este editor.');
  const files={};for(const n of Object.keys(zip.files))if(n.startsWith('recursos/')&&!zip.files[n].dir){if(!/^recursos\/[\w.-]+$/.test(n))throw Error('Nombre de recurso inválido: '+n);files[n]=await zip.file(n).async('uint8array');}
  PACEValidation.validate(d,files);
  safelyCloseOldObjects();resources=files;unit=d;unitFile=names[0];selected=unit.stations.length?0:-1;dirty=false;
  $('exportPackage').disabled=false;$('addGroup').disabled=false;$('addStation').disabled=false;$('unitFields').classList.remove('hidden');
  changeUnitFields();renderGroups();renderStationList();renderStationEditor();updateTime();scheduleMapPreview();status(`Abierto: ${file.name}`);$('warning').classList.add('hidden');
 }catch(e){alertMessage('No se pudo abrir el paquete: '+e.message,true);}
}
function nextStationID(){const pref=unit.id+'-s';const ids=new Set(unit.stations.map(s=>s.id));let n=1;while(ids.has(pref+String(n).padStart(3,'0')))n++;return pref+String(n).padStart(3,'0');}
function newStation(){if(unit.stations.length>=PACEContract.maxStations){alertMessage('Máximo 40 estaciones por unidad',true);return;}if(!unit.groups.length){unit.groups.push({title:'Bloque inicial',subtitle:''});renderGroups();}
 const current=unit.stations.length?unit.stations.at(-1).group:0;
 const s={id:nextStationID(),title:'Nueva estación',subtitle:'Escribe un resumen breve',group:current,symbol:'✧',minutes:60,concept:'Explica aquí el concepto. Puedes escribir $\\frac{1}{2}$.',example:'Agrega un ejemplo resuelto.',media:[],practice:[qNew(),qNew()],check:qNew()};unit.stations.push(s);selected=unit.stations.length-1;touch();renderStationList();renderStationEditor();}
function selectedQuestion(box){const s=station(),lane=box.dataset.lane,i=Number(box.dataset.qi);return lane==='check'?s.check:lane==='checks'?s.checks[i]:s.practice[i];}
function validatePackage(){return PACEValidation.validate(unit,resources);}
async function exportUnit(){if(!unit)return;try{validatePackage();let zip=new JSZip();zip.file(unitFile,JSON.stringify(unit,null,2)+'\n');let used=new Set(unit.stations.flatMap(s=>(s.media||[]).filter(m=>m.type!=='video_url').map(m=>m.src)));for(let path of used)zip.file(path,resources[path]);zip.file('LEEME_ENTREGA.txt',`PACE UACh · entrega individual ${unitFile}\nEl JSON y la carpeta recursos/ de la raíz se utilizan para seguir editando y compilar el curso conjunto.\nVISTA_PREVIA_HTML/index.html: abre localmente una vez extraído el ZIP.\nSCORM_INDIVIDUAL/: paquete de tu unidad para probar directamente en SiveducMD.\nMAPAS/ y BANCO_PREGUNTAS/: materiales docentes complementarios (con respuestas).\nEnvía el ZIP completo a coordinación, sin modificar su estructura.\n`);
 status('Generando mapas, banco LaTeX y PDF…');
 zip.file('MAPAS/MAPA_ESTRUCTURA.svg',PACEArtifacts.svgMap(unit,'structure'));
 zip.file('MAPAS/MAPA_PROGRESO_EJEMPLO.svg',PACEArtifacts.svgMap(unit,'example'));
 zip.file('MAPAS/MAPA_ESTRUCTURA.png',await PACEArtifacts.pngFromSVG(PACEArtifacts.svgMap(unit,'structure')));
 zip.file('MAPAS/MAPA_PROGRESO_EJEMPLO.png',await PACEArtifacts.pngFromSVG(PACEArtifacts.svgMap(unit,'example')));
 zip.file('BANCO_PREGUNTAS/BANCO_UNIDAD_'+unit.id[1]+'.tex',PACEArtifacts.bankTex(unit));
 zip.file('BANCO_PREGUNTAS/BANCO_UNIDAD_'+unit.id[1]+'.pdf',await PACEArtifacts.bankPDF(unit));
 zip.file('BANCO_PREGUNTAS/NOTA.txt','Banco docente: contiene preguntas, respuestas y retroalimentaciones. El PDF presenta las fórmulas mediante renderizado matemático cuando MathJax está disponible. Los adjuntos se listan por nombre; las imágenes y videos originales están en recursos/.\n');
 status('Preparando HTML navegable y SCORM individual…');
 await PACEPublisher.publish(unit,resources,zip);
 await PACEValidation.archive(zip);
 const content=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});const url=URL.createObjectURL(content);const a=document.createElement('a');a.href=url;a.download=`ENTREGA_UNIDAD_0${unit.id[1]}.zip`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);dirty=false;status('Exportado: '+a.download+' · HTML local y SCORM individual incluidos.');
 }catch(e){alertMessage('Antes de exportar: '+e.message,true);}}
let pendingPreview=null;
function schedulePreview(){clearTimeout(pendingPreview);pendingPreview=setTimeout(renderPreview,330);}
function renderPreview(){let s=station();if(!s){$('studentPreview').innerHTML='<div class="empty">Selecciona una estación.</div>';return;}
 if(window.MathJax?.typesetClear)try{MathJax.typesetClear([$('studentPreview')]);}catch(e){}
 let piece=`<span class="badge">UNIDAD ${esc(unit.roman)} · ESTACIÓN ${selected+1}</span><h2>${esc(s.title)}</h2><p style="margin:0;color:#647785">${esc(s.subtitle)}</p>`;
 if(activeTab==='learn'){
  piece+=`<h3>La idea esencial</h3><p class="math-fragment">${multiline(s.concept)}</p><div class="example"><strong>Ejemplo</strong><p class="math-fragment">${multiline(s.example)}</p></div>`;
  for(const m of s.media||[]){let cap=esc(m.caption||'');if(m.type==='image'){const src=fileURL(m.src);piece+=`<div class="media-sample">${src?`<img src="${src}" alt="${cap||'Imagen'}">`:'Archivo faltante'}<p>${cap}</p></div>`;}else if(m.type==='pdf'){const src=fileURL(m.src);piece+=`<div class="media-sample">📄 <a target="_blank" rel="noopener" href="${src}">Abrir PDF adjunto</a><p>${cap}</p></div>`;}else if(m.type==='video_file'){const src=fileURL(m.src);piece+=`<div class="media-sample"><video controls src="${src}"></video><p>${cap}</p></div>`;}else if(m.type==='video_url'){piece+=`<div class="media-sample">▶ <a rel="noopener noreferrer" target="_blank" href="${esc(m.src)}">Abrir video externo</a><p>${cap}</p></div>`;}}
  piece+='<p class="hint">[ Marcar como revisado ]</p>';
 }else{
  const qs=activeTab==='check'?[s.check].concat(s.checks||[]):s.practice;window.__pq=qs;
  for(const [i,q] of qs.entries()){piece+=`<h3>${activeTab==='check'?'Aplica'+(qs.length>1?' '+(i+1):''):'Ejercicio '+(i+1)}</h3><p class="math-fragment">${multiline(q.q)}</p>`;
   piece+=q.type==='input'?`<div style="display:flex;gap:8px;margin:6px 0"><input data-tp="${i}" placeholder="Escribe tu respuesta" style="flex:1;padding:8px;border:1px solid #cbd9df;border-radius:8px"><button type="button" class="preview-choice" data-tpb="${i}" data-correct="false">Comprobar</button></div><p class="hint">${esc(PACETyped.hint(q))}</p>`:q.options.map((o,j)=>`<button class="preview-choice math-fragment" type="button" data-correct="${j===q.correct}" data-why="${esc(q.why)}">${multiline(o)}</button>`).join('');}
  piece+='<p class="status" id="previewFeedback" role="status">Prueba las alternativas; aquí no se guarda avance.</p>';
 }
 $('studentPreview').innerHTML=piece;
 $$('button.preview-choice',$('studentPreview')).forEach(b=>b.onclick=()=>{$('previewFeedback').textContent=b.dataset.correct==='true'?'Correcta · '+b.dataset.why:'Vuelve a intentarlo. (Solo vista previa)';});
 $$('button[data-tpb]',$('studentPreview')).forEach(b=>b.onclick=()=>{const i=+b.dataset.tpb,q=window.__pq[i],inp=$('studentPreview').querySelector('input[data-tp="'+i+'"]'),r=PACETyped.check(q,inp.value);$('previewFeedback').textContent=r.state==='ok'?'Correcta · '+(q.why||''):r.msg+' (Solo vista previa)';});
 if(window.MathJax?.typesetPromise)window.MathJax.typesetPromise([$('studentPreview')]).catch(()=>{});
}
let mapRenderTimer=null;
function scheduleMapPreview(){clearTimeout(mapRenderTimer);mapRenderTimer=setTimeout(renderMapPreview,280);}
function renderMapPreview(){if(!unit){$('mapPreviewBox').textContent='Abre una unidad para visualizar el mapa';return;}$('mapPreviewBox').innerHTML=PACEArtifacts.svgMap(unit,mapMode);}
$('modeProgress').addEventListener('click',()=>{mapMode='example';$('modeProgress').classList.add('active');$('modeStructure').classList.remove('active');renderMapPreview();});
$('modeStructure').addEventListener('click',()=>{mapMode='structure';$('modeStructure').classList.add('active');$('modeProgress').classList.remove('active');renderMapPreview();});
$('openPackage').addEventListener('change',e=>{const file=e.target.files[0];if(file)openUnit(file);e.target.value='';});
$('exportPackage').onclick=exportUnit;
$('addStation').onclick=()=>{if(unit)newStation();};
$('addGroup').onclick=()=>{if(!unit)return;if(unit.groups.length>=PACEContract.maxGroups){alertMessage('Máximo 15 bloques por unidad',true);return;}unit.groups.push({title:'Nuevo bloque',subtitle:''});touch();renderGroups();renderStationEditor();};
$('stationList').addEventListener('click',e=>{const b=e.target.closest('button[data-index]');if(!b)return;selected=Number(b.dataset.index);renderStationList();renderStationEditor();});
$('unitFields').addEventListener('input',e=>{const el=e.target;if(el.dataset.u){unit[el.dataset.u]=el.value;if(el.dataset.u==='title')$('unitName').textContent='Unidad '+unit.roman;touch();}else if(el.dataset.groupindex!==undefined){unit.groups[Number(el.dataset.groupindex)][el.dataset.groupfield]=el.value;touch();}});
$('groupList').addEventListener('click',e=>{const b=e.target.closest('button[data-removegroup]');if(!b)return;const i=+b.dataset.removegroup;if(!confirm('Eliminar este bloque? Sus estaciones pasarán al primer bloque disponible.'))return;unit.groups.splice(i,1);unit.stations.forEach(s=>{if(s.group===i)s.group=0;else if(s.group>i)s.group--;});touch();renderGroups();renderStationEditor();});
$('stationEditor').addEventListener('input',e=>{const el=e.target,s=station();if(!s)return;
 if(el.dataset.s){const k=el.dataset.s;if(k==='draw'||k==='drawCheck'){if(el.value==='')delete s[k];else s[k]=Number(el.value);}else s[k]=k==='group'||k==='minutes'?Number(el.value):el.value;touch();if(k==='title'){renderStationList();}return;}
 const box=el.closest('.question');if(box){const q=selectedQuestion(box);if(el.dataset.qfield==='level'){if(el.value)q.level=Number(el.value);else delete q.level;touch();return;}if(el.dataset.qcheck){if(el.checked)q.reduced=true;else delete q.reduced;touch();return;}if(el.dataset.qfield)q[el.dataset.qfield]=el.dataset.qfield==='correct'?Number(el.value):el.value;if(q.type==='input'){const n=box.querySelector('[data-tnote]');if(n)n.textContent=typedNote(q);}
 else if(el.dataset.option!==undefined)q.options[Number(el.dataset.option)]=el.value;touch();return;}
 const mb=el.closest('[data-mediaindex]');if(mb&&el.dataset.mediafield){s.media[Number(mb.dataset.mediaindex)][el.dataset.mediafield]=el.value;touch();}
});
$('stationEditor').addEventListener('change',e=>{const el=e.target;if(el.dataset.s==='group')touch();
 if(el.dataset.qtype){const box=el.closest('.question'),q=selectedQuestion(box);
  if(el.value==='input'&&q.type!=='input'){if(!confirm('Al pasar a respuesta escrita se pierden las alternativas de esta pregunta. ¿Continuar?')){renderQuestions();return;}delete q.options;delete q.correct;q.type='input';q.kind='number';q.answer='';}
  else if(el.value!=='input'&&q.type==='input'){delete q.type;delete q.kind;delete q.answer;delete q.reduced;q.options=['Alternativa A','Alternativa B','Alternativa C'];q.correct=0;}
  touch();renderQuestions();}});
$('stationEditor').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=station();if(!s)return;
 if(b.dataset.removeq!==undefined){const n=Number(b.dataset.removeq);if(s.practice.length<=1)return;if(!confirm('Quitar esta pregunta? Si la unidad ya está publicada, puede afectar los porcentajes.'))return;s.practice.splice(n,1);touch();renderQuestions();return;}
 if(b.dataset.removec!==undefined){const n=Number(b.dataset.removec);if(!confirm('Quitar esta pregunta de Aplica? Si la unidad ya está publicada, puede afectar los porcentajes.'))return;s.checks.splice(n,1);if(!s.checks.length)delete s.checks;touch();renderQuestions();return;}
 if(b.dataset.addoption!==undefined||b.dataset.removeoption!==undefined){const box=b.closest('.question'),q=selectedQuestion(box);if(b.dataset.addoption!==undefined&&q.options.length<8)q.options.push('Nueva alternativa');else if(b.dataset.removeoption!==undefined&&q.options.length>2){q.options.pop();if(q.correct>=q.options.length)q.correct=q.options.length-1;}touch();renderQuestions();return;}
 if(b.dataset.removemedia!==undefined){s.media.splice(Number(b.dataset.removemedia),1);touch();renderMediaList();return;}
});
$('addQuestion').onclick=()=>{const s=station();if(!s)return;if(s.practice.length>=60){alertMessage('Máximo 60 preguntas prácticas por estación',true);return;}s.practice.push(qNew());touch();renderQuestions();};
$('addCheck').onclick=()=>{const s=station();if(!s)return;s.checks=s.checks||[];if(1+s.checks.length>=20){alertMessage('Máximo 20 preguntas en el banco de Aplica',true);return;}s.checks.push(qNew());touch();renderQuestions();};
$('removeStation').onclick=()=>{if(!station()||!confirm('Eliminar estación? Esta operación puede afectar el avance de estudiantes si ya se publicó.'))return;unit.stations.splice(selected,1);selected=Math.min(selected,unit.stations.length-1);touch();renderStationList();renderStationEditor();};
$('addVideoURL').onclick=()=>{const s=station();if(!s)return;if((s.media||[]).length>=PACEContract.maxMedia){alertMessage('Máximo 25 recursos por estación',true);return;}const url=prompt('Pega una URL https:// del video, por ejemplo de YouTube:');if(url===null)return;if(!/^https:\/\/[^\s<>"']{5,1500}$/.test(url)){alertMessage('Usa un enlace https:// válido.',true);return;}s.media??=[];s.media.push({type:'video_url',src:url,caption:'Video complementario'});touch();renderMediaList();};
$('addMedia').addEventListener('change',async e=>{const f=e.target.files[0],s=station();e.target.value='';if(!f||!s)return;if((s.media||[]).length>=PACEContract.maxMedia){alertMessage('Máximo 25 recursos por estación',true);return;}
 const ext=(f.name.split('.').pop()||'').toLowerCase();if(!['png','jpg','jpeg','webp','gif','mp4','webm','pdf'].includes(ext)){alertMessage('Usa JPG, PNG, WEBP, GIF, PDF, MP4 o WEBM.',true);return;}
 if(f.size>35*1024*1024){alertMessage('Archivo superior a 35 MB. Conviene enlazar videos grandes.',true);return;}
 let num=1,path;do{path='recursos/'+('archivo_'+String(num++).padStart(3,'0'))+'.'+ext;}while(resources[path]);
 resources[path]=new Uint8Array(await f.arrayBuffer());s.media??=[];s.media.push({type:ext==='pdf'?'pdf':['mp4','webm'].includes(ext)?'video_file':'image',src:path,caption:f.name});touch();renderMediaList();});
$$('button[data-preview-tab]').forEach(b=>b.onclick=()=>{activeTab=b.dataset.previewTab;$$('button[data-preview-tab]').forEach(x=>x.classList.toggle('active',x===b));renderPreview();});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
})();
