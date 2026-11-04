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
function changeUnitFields(){if(!unit)return;for(const [id,key] of [['uTitle','title'],['uSubtitle','subtitle'],['uIcon','icon']])$(id).value=unit[key]||'';$('uWeek').value=unit.week||'';$('uMetaOn').checked=!!unit.meta;$('uMetaMin').value=unit.meta?.minutes||120;$('uMetaMin').disabled=!unit.meta;$('unitName').textContent='Unidad '+unit.roman;}
function renderGroups(){if(!unit)return;
 $('groupList').innerHTML=unit.groups.map((g,i)=>`<div class="fieldset"><label class="field">Bloque ${i+1}<input data-groupindex="${i}" data-groupfield="title" value="${esc(g.title)}"></label><label class="field">Breve descripción<input data-groupindex="${i}" data-groupfield="subtitle" value="${esc(g.subtitle||'')}"></label><button class="btn small-btn danger" data-removegroup="${i}" ${unit.groups.length===1?'disabled':''} type="button">Quitar bloque</button></div>`).join('')||'<p class="hint">Agrega el primer bloque temático.</p>';
}
function renderStationList(){if(!unit)return;$('stationList').innerHTML=unit.stations.map((s,i)=>`<button type="button" data-index="${i}" class="${selected===i?'active':''}">${String(i+1).padStart(2,'0')} · ${esc(s.title)}</button>`).join('')||'<p class="hint">Esta unidad no tiene estaciones. Pulsa «+ Estación».</p>';}
function renderStationEditor(){const s=station();$('editorEmpty').classList.toggle('hidden',!!s);$('stationEditor').classList.toggle('hidden',!s);
 if(!s){schedulePreview();return;}
 $('stationID').textContent='ID · '+s.id;
 for(const el of $$('[data-s]'))el.value=s[el.dataset.s]??'';
 $('sGroup').innerHTML=unit.groups.map((g,i)=>`<option value="${i}">${esc(g.title)}</option>`).join('');$('sGroup').value=s.group;
 renderMediaList();renderQuestions();renderLearnEditor();renderExploreEditor();schedulePreview();
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
 const s={id:nextStationID(),title:'Nueva estación',subtitle:'Escribe un resumen breve',group:current,symbol:'✧',minutes:60,concept:'Explica aquí el concepto. Puedes escribir $\\frac{1}{2}$.',example:'Agrega un ejemplo resuelto.',media:[],learn:{goal:'',idea:'',steps:{title:'',items:[{why:'',math:''}]},warn:''},practice:[qNew(),qNew()],check:qNew()};unit.stations.push(s);selected=unit.stations.length-1;touch();renderStationList();renderStationEditor();}
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

/* ---- Aprende visual (campo opcional "learn") ---- */
const bold=t=>multiline(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
const exList=L=>[L.steps,...(Array.isArray(L.more)?L.more:[])];
const exAt=(L,n)=>n?L.more[n-1]:L.steps;
const lpEx=(St,tag)=>{const it=St&&St.items||[];return it.length?`<div class="learn-prev"><span class="lp-t">${tag}</span>${St.title?`<p class="math-fragment">${bold(St.title)}</p>`:''}<ol>${it.map(x=>`<li class="lp-row"><div class="lp-main">${x.math?`<div class="math-fragment">$$${esc(x.math)}$$</div>`:''}<span class="math-fragment lp-why">${bold(x.why||'')}</span></div>${x.side&&(x.side.math||x.side.text)?`<div class="lp-side"><b>${esc(x.side.title||'Cálculo auxiliar')}</b>${x.side.math?`<div class="math-fragment">$$${esc(x.side.math)}$$</div>`:''}${x.side.text?`<span class="math-fragment">${bold(x.side.text)}</span>`:''}</div>`:''}</li>`).join('')}</ol></div>`:'';};
function stepMarkup(it,i,n,items){return `<div class="learn-step" data-step="${i}" data-ex="${n}"><div class="inline-head"><strong>Paso ${i+1}</strong><button type="button" class="btn small-btn danger" data-lact="del" data-ex="${n}" data-i="${i}" ${items.length<=1?'disabled':''}>Quitar</button></div><div class="fields"><label class="field full">Línea del desarrollo (LaTeX, sin $)<input data-ls="math" data-ex="${n}" data-i="${i}" value="${esc(it.math||'')}"></label><label class="field full">Comentario breve: qué hacemos y por qué<textarea data-ls="why" data-ex="${n}" data-i="${i}" rows="2">${esc(it.why||'')}</textarea></label><label class="field full">Cálculo auxiliar a la derecha · título (opcional)<input data-ls="stitle" data-ex="${n}" data-i="${i}" value="${esc(it.side?.title||'')}" placeholder="mcm de 3, 2 y 6"></label><label class="field full">Cálculo auxiliar · LaTeX (opcional; usa \\begin{aligned} para varias líneas)<input data-ls="smath" data-ex="${n}" data-i="${i}" value="${esc(it.side?.math||'')}"></label><label class="field full">Cálculo auxiliar · texto (opcional)<input data-ls="stext" data-ex="${n}" data-i="${i}" value="${esc(it.side?.text||'')}"></label></div><div class="hstack"><button type="button" class="btn small-btn" data-lact="up" data-ex="${n}" data-i="${i}" ${i===0?'disabled':''}>↑</button><button type="button" class="btn small-btn" data-lact="down" data-ex="${n}" data-i="${i}" ${i===items.length-1?'disabled':''}>↓</button></div></div>`;}
function renderLearnEditor(){const s=station();if(!s)return;const L=s.learn;$('learnOn').checked=!!L;$('learnBody').classList.toggle('hidden',!L);
 const cl=$('classicEd');if(cl){cl.open=!L;$('classicHint').textContent=L?'Con Aprende visual activo, el estudiante ve la «idea» y los ejemplos guiados de arriba. La explicación breve y el ejemplo de texto solo sirven de respaldo si dejas vacía la idea o los pasos; no se borran.':'Mientras Aprende visual esté desactivado, el estudiante ve estos textos.';}
 if(!L)return;
 for(const el of $$('[data-l]')){const k=el.dataset.l;el.value=L[k]||'';}
 L.steps=L.steps||{title:'',items:[{why:'',math:''}]};const exs=exList(L);
 $('learnSteps').innerHTML=exs.map((St,n)=>{const items=St.items||[];return `<div class="ex-group" data-exg="${n}"><div class="inline-head"><h4>${n?'Ejemplo guiado '+(n+1):'Ejemplo guiado principal'}</h4>${n?`<button type="button" class="btn small-btn danger" data-lact="delex" data-ex="${n}">Quitar ejemplo</button>`:''}</div><label class="field full">Enunciado<input data-ls="etitle" data-ex="${n}" value="${esc(St.title||'')}" placeholder="Resolvemos $2x+3=5$."></label>${items.map((it,i)=>stepMarkup(it,i,n,items)).join('')}<div class="hstack"><button type="button" class="btn small-btn" data-lact="addstep" data-ex="${n}" ${items.length>=20?'disabled':''}>+ Paso</button></div></div>`;}).join('');
 $('addLearnEx').disabled=exs.length>=4;$('learnExCount').textContent=exs.length+' de 4 ejemplos guiados';
}
$('learnOn').addEventListener('change',e=>{const s=station();if(!s)return;
 if(e.target.checked){s.learn={goal:'',idea:'',steps:{title:'',items:[{why:'',math:''}]},warn:''};}
 else{if(!confirm('Se quitará el Aprende visual de esta estación (se conservan la explicación y el ejemplo en texto). ¿Continuar?')){e.target.checked=true;return;}delete s.learn;}
 touch();renderLearnEditor();});
$('learnEd').addEventListener('input',e=>{const el=e.target,s=station();if(!s||!s.learn)return;const L=s.learn;
 if(el.dataset.l){L[el.dataset.l]=el.value;touch();}
 else if(el.dataset.ls){const n=Number(el.dataset.ex||0),St=exAt(L,n),k=el.dataset.ls;if(!St)return;
  if(k==='etitle'){St.title=el.value;touch();return;}
  const it=St.items[Number(el.dataset.i)],k2=k;
  if(k2==='why'||k2==='math'){it[k2]=el.value;}
  else{const f={stitle:'title',smath:'math',stext:'text'}[k2];it.side=it.side||{};if(el.value==='')delete it.side[f];else it.side[f]=el.value;if(!Object.keys(it.side).length)delete it.side;}
  touch();}});
$('learnEd').addEventListener('click',e=>{const b=e.target.closest('button[data-lact]'),s=station();if(!b||!s||!s.learn)return;const L=s.learn,n=Number(b.dataset.ex||0),i=Number(b.dataset.i),act=b.dataset.lact;
 if(act==='delex'){if(!n||!confirm('¿Quitar este ejemplo guiado?'))return;L.more.splice(n-1,1);if(!L.more.length)delete L.more;touch();renderLearnEditor();return;}
 const St=exAt(L,n);if(!St)return;const it=St.items;
 if(act==='addstep'){if(it.length>=20)return;it.push({why:'',math:''});}
 else if(act==='del'&&it.length>1)it.splice(i,1);else if(act==='up'&&i>0)[it[i-1],it[i]]=[it[i],it[i-1]];else if(act==='down'&&i<it.length-1)[it[i+1],it[i]]=[it[i],it[i+1]];else return;
 touch();renderLearnEditor();});
$('addLearnEx').onclick=()=>{const s=station();if(!s||!s.learn)return;const L=s.learn;if(exList(L).length>=4)return;L.more=L.more||[];L.more.push({title:'',items:[{why:'',math:''}]});touch();renderLearnEditor();};
/* ---- META FINAL de la unidad (campo opcional "meta") ---- */
$('uMetaOn').addEventListener('change',e=>{if(!unit)return;if(e.target.checked)unit.meta={minutes:Number($('uMetaMin').value)||120,mix:[2,3,'a']};else delete unit.meta;$('uMetaMin').disabled=!e.target.checked;touch();});
$('uMetaMin').addEventListener('input',e=>{if(!unit||!unit.meta)return;const n=Math.round(Number(e.target.value));if(n>=15&&n<=300){unit.meta.minutes=n;touch();}});

/* ---- Explora (campo opcional "explore"; no suma avance) ---- */
function renderExploreEditor(){const s=station();if(!s)return;const E=s.explore;$('exploreOn').checked=!!E;$('exploreBody').classList.toggle('hidden',!E);$('pvExplore').classList.toggle('hidden',!E);
 if(!E){if(activeTab==='explore'){activeTab='learn';$$('button[data-preview-tab]').forEach(x=>x.classList.toggle('active',x.dataset.previewTab==='learn'));}return;}
 for(const el of $$('[data-x]')){const k=el.dataset.x;el.value=E[k]??'';}
 const kind=typeof E.url==='string'&&!E.html?'url':'html';$('exKind').value=kind;$('exHtmlBox').classList.toggle('hidden',kind!=='html');$('exUrlBox').classList.toggle('hidden',kind!=='url');
 $('exFileInfo').textContent=E.html?'Archivo cargado · '+Math.round(E.html.length/1024)+' KB':'Sin archivo cargado';}
$('exploreOn').addEventListener('change',e=>{const s=station();if(!s)return;
 if(e.target.checked)s.explore={title:'Nuevo recurso Explora',html:''};
 else{if(!confirm('Se quitará Explora de esta estación. ¿Continuar?')){e.target.checked=true;return;}delete s.explore;}
 touch();renderExploreEditor();});
$('exploreEd').addEventListener('input',e=>{const el=e.target,s=station();if(!s||!s.explore||!el.dataset.x)return;const k=el.dataset.x;
 if(k==='height'){if(el.value==='')delete s.explore.height;else s.explore.height=Number(el.value);}else if((k==='desc'||k==='instr'||k==='alt'||k==='url')&&el.value==='')delete s.explore[k];else s.explore[k]=el.value;touch();});
$('exKind').addEventListener('change',e=>{const s=station();if(!s||!s.explore)return;if(e.target.value==='url'){delete s.explore.html;s.explore.url=s.explore.url||'';}else{delete s.explore.url;s.explore.html=s.explore.html||'';}touch();renderExploreEditor();});
$('exFile').addEventListener('change',async e=>{const f=e.target.files[0],s=station();e.target.value='';if(!f||!s||!s.explore)return;
 if(f.size>400000){alertMessage('El archivo HTML supera 400 KB. Conviene un recurso más liviano.',true);return;}
 s.explore.html=await f.text();delete s.explore.url;touch();renderExploreEditor();});
let pendingPreview=null;
function schedulePreview(){clearTimeout(pendingPreview);pendingPreview=setTimeout(renderPreview,330);}
function renderPreview(){let s=station();if(!s){$('studentPreview').innerHTML='<div class="empty">Selecciona una estación.</div>';return;}
 if(window.MathJax?.typesetClear)try{MathJax.typesetClear([$('studentPreview')]);}catch(e){}
 let piece=`<span class="badge">UNIDAD ${esc(unit.roman)} · ESTACIÓN ${selected+1}</span><h2>${esc(s.title)}</h2><p style="margin:0;color:#647785">${esc(s.subtitle)}</p>`;
 if(activeTab==='learn'){
  if(s.learn){const L=s.learn;piece+=(L.goal?`<div class="learn-prev"><span class="lp-t">QUÉ APRENDERÁS</span><p class="math-fragment">${bold(L.goal)}</p></div>`:'')+`<div class="learn-prev"><span class="lp-t">COMPRENDE LA IDEA</span><p class="math-fragment">${bold(L.idea||s.concept)}</p></div>`+exList(L).map((St,n)=>lpEx(St,n?'EJEMPLO '+(n+1)+' · PASO A PASO':'EJEMPLO GUIADO · PASO A PASO')).join('')+(L.warn?`<div class="learn-prev"><span class="lp-t">PRESTA ATENCIÓN</span><p class="math-fragment">${bold(L.warn)}</p></div>`:'');}
  else piece+=`<h3>La idea esencial</h3><p class="math-fragment">${multiline(s.concept)}</p><div class="example"><strong>Ejemplo</strong><p class="math-fragment">${multiline(s.example)}</p></div>`;
  piece+=['example2','example3','example4'].filter(k=>!(s.learn&&s.learn.more&&s.learn.more.length)&&s[k]&&s[k].trim()).map((k,i)=>`<div class="example"><strong>Ejemplo ${i+2}</strong><p class="math-fragment">${multiline(s[k])}</p></div>`).join('');
  for(const m of s.media||[]){let cap=esc(m.caption||'');if(m.type==='image'){const src=fileURL(m.src);piece+=`<div class="media-sample">${src?`<img src="${src}" alt="${cap||'Imagen'}">`:'Archivo faltante'}<p>${cap}</p></div>`;}else if(m.type==='pdf'){const src=fileURL(m.src);piece+=`<div class="media-sample">📄 <a target="_blank" rel="noopener" href="${src}">Abrir PDF adjunto</a><p>${cap}</p></div>`;}else if(m.type==='video_file'){const src=fileURL(m.src);piece+=`<div class="media-sample"><video controls src="${src}"></video><p>${cap}</p></div>`;}else if(m.type==='video_url'){piece+=`<div class="media-sample">▶ <a rel="noopener noreferrer" target="_blank" href="${esc(m.src)}">Abrir video externo</a><p>${cap}</p></div>`;}}
  piece+='<p class="hint">[ Marcar como revisado ]</p>';
 }else{
  if(activeTab==='explore'&&s.explore){const E=s.explore;piece+=`<h3>✦ ${esc(E.title||'Explora')} <small>(opcional · no suma avance)</small></h3>${E.desc?`<p>${esc(E.desc)}</p>`:''}${E.instr?`<p class="math-fragment">${bold(E.instr)}</p>`:''}`+(E.html?'<iframe id="pvFrame" sandbox="allow-scripts" style="width:100%;height:'+Math.min(900,Math.max(240,Number(E.height)||520))+'px;border:2px solid #2b2a6b;border-radius:10px" title="Explora"></iframe>':E.url?`<p><a target="_blank" rel="noopener noreferrer" href="${esc(E.url)}">Abrir recurso externo ↗</a></p>`:'<p class="hint">Carga un archivo HTML o escribe un enlace.</p>');}
  else{
  const qs=activeTab==='check'?[s.check].concat(s.checks||[]):s.practice;window.__pq=qs;
  for(const [i,q] of qs.entries()){piece+=`<h3>${activeTab==='check'?'Aplica'+(qs.length>1?' '+(i+1):''):'Ejercicio '+(i+1)}</h3><p class="math-fragment">${multiline(q.q)}</p>`;
   piece+=q.type==='input'?`<div style="display:flex;gap:8px;margin:6px 0"><input data-tp="${i}" placeholder="Escribe tu respuesta" style="flex:1;padding:8px;border:1px solid #cbd9df;border-radius:8px"><button type="button" class="preview-choice" data-tpb="${i}" data-correct="false">Comprobar</button></div><p class="hint">${esc(PACETyped.hint(q))}</p>`:q.options.map((o,j)=>`<button class="preview-choice math-fragment" type="button" data-correct="${j===q.correct}" data-why="${esc(q.why)}">${multiline(o)}</button>`).join('');}
  piece+='<p class="status" id="previewFeedback" role="status">Prueba las alternativas; aquí no se guarda avance.</p>';
  }
 }
 $('studentPreview').innerHTML=piece;{const pf=$('pvFrame');if(pf&&s.explore&&s.explore.html)pf.srcdoc=s.explore.html;}
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
 if(el.dataset.s){const k=el.dataset.s;if(k==='draw'||k==='drawCheck'){if(el.value==='')delete s[k];else s[k]=Number(el.value);}else if(/^example[234]$/.test(k)&&el.value.trim()==='')delete s[k];else s[k]=k==='group'||k==='minutes'?Number(el.value):el.value;touch();if(k==='title'){renderStationList();}return;}
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
/* Pestañas de edición A·P·A·E, búsqueda, filtro por nivel y preguntas plegables */
let edTab='learn';const qFold=new Set();
function setEdTab(t,fromPreview){edTab=t;$$('[data-edtab]').forEach(b=>{const on=b.dataset.edtab===t;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});$$('.ed-pane').forEach(p=>p.classList.toggle('hidden',p.dataset.pane!==t));if(!fromPreview){const pb=document.querySelector('button[data-preview-tab="'+t+'"]');if(pb&&!pb.classList.contains('hidden'))pb.click();}}
function syncEdTabs(){const s=station();const on=!!(s&&s.explore);$('edExDot').hidden=!on;if(edTab==='explore'&&false)setEdTab('learn');}
function applyQView(){['practice','check'].forEach(k=>{const box=document.querySelector('.q-tools[data-qt="'+k+'"]');if(!box)return;const list=$(k==='practice'?'practiceList':'checkList');const term=box.querySelector('.q-search').value.trim().toLowerCase(),lv=box.querySelector('.q-level').value;let shown=0,tot=0;
 const qs=[...(k==='check'?$('checkEditor').querySelectorAll('.question'):[]),...list.querySelectorAll('.question')];
 qs.forEach(q=>{tot++;const key=q.dataset.lane+':'+q.dataset.qi;const ta=q.querySelector('[data-qfield="q"]'),txt=(ta?ta.value:'');const lsel=q.querySelector('[data-qfield="level"]');const lev=lsel?lsel.value:'';
  let ok=(!term||txt.toLowerCase().includes(term))&&(lv===''||(lv==='0'?lev==='':lev===lv));q.classList.toggle('q-hide',!ok);if(ok)shown++;
  q.classList.toggle('collapsed',qFold.has(key));const t=q.querySelector('.question-title');if(t){let sm=t.querySelector('.q-sum');if(!sm){sm=document.createElement('span');sm.className='q-sum';t.insertBefore(sm,t.children[1]||null);}sm.textContent=qFold.has(key)?txt.replace(/\s+/g,' ').slice(0,70):'';t.setAttribute('title','Clic para plegar o desplegar');}});
 box.querySelector('.q-count').textContent=(term||lv!=='')?shown+' de '+tot+' preguntas':tot+' pregunta'+(tot===1?'':'s');});}
(function(){const _rq=renderQuestions;renderQuestions=function(){_rq();applyQView();};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-edtab]');if(b){setEdTab(b.dataset.edtab);return;}
  const t=e.target.closest('.question-title');if(t&&!e.target.closest('button,a,input,select')){const q=t.closest('.question');const key=q.dataset.lane+':'+q.dataset.qi;qFold.has(key)?qFold.delete(key):qFold.add(key);applyQView();return;}
  const f=e.target.closest('.q-fold,.q-unfold');if(f){const k=f.closest('.q-tools').dataset.qt;const lane=k==='practice'?['practice']:['check','checks'];document.querySelectorAll('.question').forEach(q=>{if(lane.includes(q.dataset.lane)){const key=q.dataset.lane+':'+q.dataset.qi;f.classList.contains('q-fold')?qFold.add(key):qFold.delete(key);}});applyQView();}});
 document.addEventListener('input',e=>{if(e.target.closest('.q-tools'))applyQView();});document.addEventListener('change',e=>{if(e.target.closest('.q-tools')||e.target.matches('[data-qfield="level"]'))applyQView();});
 const _rse=renderStationEditor;renderStationEditor=function(){_rse();syncEdTabs();};
 $$('button[data-preview-tab]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.previewTab!==edTab)setEdTab(b.dataset.previewTab,true);}));})();
})();
