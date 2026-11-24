(()=>{'use strict';
const $=id=>document.getElementById(id), $$=(selector,context=document)=>Array.from(context.querySelectorAll(selector));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const multiline=value=>PACEText.html(value);
let unit=null,unitFile='',resources={},selected=-1,activeTab='learn',dirty=false,objectURLs={};
const qNew=()=>({q:'Escribe aquí una pregunta',options:['Alternativa A','Alternativa B','Alternativa C'],correct:0,why:'Explica por qué es correcta la respuesta.'});
function station(){return unit?.stations[selected]||null;}
function alertMessage(t,bad=false){const box=$('warning');box.textContent=t;box.classList.remove('hidden');box.classList.toggle('warn',bad);}
function status(t){$('unitStatus').textContent=t;}
function touch(){dirty=true;status('Cambios sin exportar · descarga el ZIP cuando termines');updateTime();schedulePreview();scheduleDraft();}
function safelyCloseOldObjects(){Object.values(objectURLs).forEach(url=>URL.revokeObjectURL(url));objectURLs={};}
function fileURL(path){if(!resources[path])return '';if(!objectURLs[path]){
 const ext=path.split('.').pop().toLowerCase();const mime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',mp4:'video/mp4',webm:'video/webm',pdf:'application/pdf'}[ext]||'application/octet-stream';
 objectURLs[path]=URL.createObjectURL(new Blob([resources[path]],{type:mime}));
 }return objectURLs[path];}
function updateTime(){if(!unit)return;const mins=unit.stations.reduce((sum,s)=>sum+(Number(s.minutes)||0),0);const h=Math.floor(mins/60),m=mins%60;$('totalTime').textContent=`Tiempo planificado: ${h} h ${String(m).padStart(2,'0')} min / 8 h`;}
function changeUnitFields(){if(!unit)return;for(const [id,key] of [['uTitle','title'],['uSubtitle','subtitle'],['uIcon','icon']])$(id).value=unit[key]||'';$('uWeek').value=unit.week||'';$('uMetaOn').checked=!!unit.meta;$('uMetaMin').value=unit.meta?.minutes||60;$('uMetaMin').disabled=!unit.meta;$('unitName').textContent='Unidad '+unit.roman;}
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
function typedMarkup(q,lane,i){return `<div class="question" data-lane="${lane}" data-qi="${i}"><div class="question-title"><span>${lane==='check'?'Problema contextual de Aplica':lane==='checks'?'Aplica · banco '+(i+2):'Ejercicio '+(i+1)}</span>${lane==='checks'?`<button class="btn danger small-btn" type="button" data-removec="${i}">Eliminar pregunta</button>`:''}${lane==='practice'?`<button class="btn danger small-btn" type="button" data-removeq="${i}" ${station().practice.length<=1?'disabled':''}>Eliminar pregunta</button>`:''}</div>${typeSel(q)}<label class="field full">Enunciado<textarea data-qfield="q" rows="2">${esc(q.q)}</textarea></label><div class="fields" style="margin:9px 0"><label class="field">Qué escribe el estudiante<select data-qfield="kind"><option value="number" ${q.kind==='set'?'':'selected'}>Un número (entero, decimal o fracción)</option><option value="set" ${q.kind==='set'?'selected':''}>Un conjunto de números (ej.: x = 2 y x = 3)</option></select></label><label class="field">Respuesta correcta<input data-qfield="answer" value="${esc(q.answer||'')}" placeholder="Número: 3/2 · Conjunto: 2; 3 · Vacío: ∅"></label></div><label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" data-qcheck="reduced" ${q.reduced===false?'checked':''}> Aceptar también el resultado sin simplificar (por defecto se exige número o fracción simplificada al máximo)</label><p class="hint" data-tnote>${esc(typedNote(q))}</p><label class="field" style="margin-top:9px">Retroalimentación<textarea data-qfield="why" rows="2">${esc(q.why||'')}</textarea></label><label class="field" style="margin-top:9px">Desarrollo para la revisión de la META FINAL (opcional; un paso por línea, usa $…$ para matemática)<textarea data-qfield="solution" rows="4">${esc(q.solution||'')}</textarea></label></div>`;}
function quizMarkup(q,lane,i){return q.type==='input'?typedMarkup(q,lane,i):mcMarkup(q,lane,i);}
function mcMarkup(q,lane,i){return `<div class="question" data-lane="${lane}" data-qi="${i}"><div class="question-title"><span>${lane==='check'?'Problema contextual de Aplica':lane==='checks'?'Aplica · banco '+(i+2):'Ejercicio '+(i+1)}</span>${lane==='checks'?`<button class="btn danger small-btn" type="button" data-removec="${i}">Eliminar pregunta</button>`:''}${lane==='practice'?`<button class="btn danger small-btn" type="button" data-removeq="${i}" ${station().practice.length<=1?'disabled':''}>Eliminar pregunta</button>`:''}</div>${typeSel(q)}<label class="field full">Enunciado<textarea data-qfield="q" rows="2">${esc(q.q)}</textarea></label><div class="fields" style="margin:9px 0">${q.options.map((o,k)=>`<label class="field">Alternativa ${k+1}<input data-option="${k}" value="${esc(o)}">${k===q.correct?`<input class="optfb" disabled placeholder="Respuesta correcta: sin aviso">`:`<input class="optfb" data-optfb="${k}" maxlength="260" placeholder="Aviso si eligen esta (opcional)" value="${esc((q.fb&&q.fb[k])||'')}">`}</label>`).join('')}</div><div class="hstack"><button type="button" class="btn small-btn" data-addoption="${i}" ${q.options.length>=8?'disabled':''}>+ Alternativa</button><button type="button" class="btn small-btn danger" data-removeoption="${i}" ${q.options.length<=2?'disabled':''}>− Última alternativa</button></div><label class="field" style="margin-top:9px">Respuesta correcta<select data-qfield="correct">${q.options.map((o,k)=>`<option value="${k}" ${q.correct===k?'selected':''}>Alternativa ${k+1}</option>`).join('')}</select></label><label class="field" style="margin-top:9px">Retroalimentación<textarea data-qfield="why" rows="2">${esc(q.why||'')}</textarea></label><label class="field" style="margin-top:9px">Desarrollo para la revisión de la META FINAL (opcional; un paso por línea, usa $…$ para matemática)<textarea data-qfield="solution" rows="4">${esc(q.solution||'')}</textarea></label></div>`;}
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
  changeUnitFields();renderGroups();renderStationList();renderStationEditor();updateTime();['exportMap','checkErrors','saveDraft'].forEach(i=>$(i).disabled=false);$('issuesBox').classList.add('hidden');status(`Abierto: ${file.name}`);$('warning').classList.add('hidden');offerDraft();
 }catch(e){alertMessage('No se pudo abrir el paquete: '+e.message,true);}
}
function nextStationID(){const pref=unit.id+'-s';const ids=new Set(unit.stations.map(s=>s.id));let n=1;while(ids.has(pref+String(n).padStart(3,'0')))n++;return pref+String(n).padStart(3,'0');}
function newStation(){if(unit.stations.length>=PACEContract.maxStations){alertMessage('Máximo 40 estaciones por unidad',true);return;}if(!unit.groups.length){unit.groups.push({title:'Bloque inicial',subtitle:''});renderGroups();}
 const current=unit.stations.length?unit.stations.at(-1).group:0;
 const s={id:nextStationID(),title:'Nueva estación',subtitle:'Escribe un resumen breve',group:current,symbol:'✧',minutes:60,concept:'Explica aquí el concepto. Puedes escribir $\\frac{1}{2}$.',example:'Agrega un ejemplo resuelto.',media:[],learn:{goal:'',idea:'',steps:{title:'',items:[{why:'',math:''}]},warn:''},practice:[qNew(),qNew()],check:qNew()};unit.stations.push(s);selected=unit.stations.length-1;touch();renderStationList();renderStationEditor();}
function selectedQuestion(box){const s=station(),lane=box.dataset.lane,i=Number(box.dataset.qi);return lane==='check'?s.check:lane==='checks'?s.checks[i]:s.practice[i];}
function validatePackage(){return PACEValidation.validate(unit,resources);}
/* La exportación está al final de este archivo (modalidades y avance, 19-11-2026). */

/* ---- Aprende visual (campo opcional "learn") ---- */
const bold=t=>multiline(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
const exList=L=>[L.steps,...(Array.isArray(L.more)?L.more:[])];
const exAt=(L,n)=>n?L.more[n-1]:L.steps;
const lpEx=(St,tag,n)=>{const it=St&&St.items||[];return it.length?`<div class="learn-prev" data-pex="${n}"><span class="lp-t">${tag}</span>${St.title?`<p class="math-fragment">${bold(St.title)}</p>`:''}<ol>${it.map(x=>`<li class="lp-row" data-pi="${it.indexOf(x)}"><div class="lp-main">${x.math?`<div class="math-fragment">$$${esc(x.math)}$$</div>`:''}${(x.why||'').trim()?`<span class="math-fragment lp-why">${bold(x.why)}</span>`:''}</div>${x.side&&(x.side.title||x.side.math||x.side.text)?`<div class="lp-side"><b>${esc(x.side.title||(x.side.math?'Cálculo auxiliar':''))}</b>${x.side.math?`<div class="math-fragment">$$${esc(x.side.math)}$$</div>`:''}${x.side.text?`<span class="math-fragment">${bold(x.side.text)}</span>`:''}</div>`:''}</li>`).join('')}</ol></div>`:'';};
const hasTxt=k=>typeof k==='string'&&k.trim()!=='';
const stepNeeds=it=>!(hasTxt(it.why)||(it.side&&(hasTxt(it.side.title)||hasTxt(it.side.text))));
function stepMarkup(it,i,n,items){return `<div class="learn-step${stepNeeds(it)?' need':''}" data-step="${i}" data-ex="${n}"><div class="inline-head"><strong>Paso ${i+1}</strong><button type="button" class="btn small-btn danger" data-lact="del" data-ex="${n}" data-i="${i}" ${items.length<=1?'disabled':''}>Quitar</button></div><div class="fields"><label class="field full">Línea del desarrollo (LaTeX, sin $)<input data-ls="math" data-ex="${n}" data-i="${i}" value="${esc(it.math||'')}"></label><label class="field full">Comentario breve: qué hacemos y por qué <span class="muted-note">(opcional si escribes título o texto del cálculo auxiliar)</span><textarea data-ls="why" data-ex="${n}" data-i="${i}" rows="2">${esc(it.why||'')}</textarea></label><label class="field full">Cálculo auxiliar a la derecha · título (opcional)<input data-ls="stitle" data-ex="${n}" data-i="${i}" value="${esc(it.side?.title||'')}" placeholder="mcm de 3, 2 y 6"></label><label class="field full">Cálculo auxiliar · LaTeX (opcional; usa \\begin{aligned} para varias líneas)<input data-ls="smath" data-ex="${n}" data-i="${i}" value="${esc(it.side?.math||'')}"></label><label class="field full">Cálculo auxiliar · texto (opcional)<input data-ls="stext" data-ex="${n}" data-i="${i}" value="${esc(it.side?.text||'')}"></label></div><p class="need-msg" role="alert">Falta una explicación: escribe el comentario breve o el título o el texto del cálculo auxiliar. Así el estudiante nunca ve un paso sin justificación.</p><div class="hstack"><button type="button" class="btn small-btn" data-lact="up" data-ex="${n}" data-i="${i}" ${i===0?'disabled':''}>↑</button><button type="button" class="btn small-btn" data-lact="down" data-ex="${n}" data-i="${i}" ${i===items.length-1?'disabled':''}>↓</button></div></div>`;}
const exOpenBy={};let exActive=0;
function exSummary(St){const x=(St.title||'').replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)').replace(/\\(cdot|times)/g,'·').replace(/\\[a-zA-Z]+/g,'').replace(/[$*{}]/g,'').replace(/\s+/g,' ').trim(),n=(St.items||[]).length;return (x?x.slice(0,64)+(x.length>64?'…':''):'(sin enunciado)')+' · '+n+(n===1?' paso':' pasos');}
function renderLearnEditor(){const s=station();if(!s)return;const L=s.learn;$('learnOn').checked=!!L;$('learnBody').classList.toggle('hidden',!L);
 const cl=$('classicEd');if(cl){cl.open=!L;$('classicHint').textContent=L?'Con Aprende visual activo, el estudiante ve la «idea» y los ejemplos guiados de arriba. La explicación breve y el ejemplo de texto solo sirven de respaldo si dejas vacía la idea o los pasos; no se borran.':'Mientras Aprende visual esté desactivado, el estudiante ve estos textos.';}
 if(!L)return;
 for(const el of $$('[data-l]')){const k=el.dataset.l;el.value=L[k]||'';}
 L.steps=L.steps||{title:'',items:[{why:'',math:''}]};const exs=exList(L);
 const open=Math.min(exOpenBy[s.id]??0,exs.length-1);
 $('learnSteps').innerHTML=exs.map((St,n)=>{const items=St.items||[],isOpen=n===open;return `<div class="ex-group${isOpen?'':' folded'}${n===exActive?' active':''}" data-exg="${n}"><div class="ex-head" data-exhead="${n}" role="button" tabindex="0" aria-expanded="${isOpen}" title="Clic para abrir o plegar este ejemplo"><span class="ex-chev" aria-hidden="true">${isOpen?'▾':'▸'}</span><span class="ex-num">Ejemplo guiado ${n+1}</span><span class="ex-sum">${esc(exSummary(St))}</span><span class="ex-acts"><button type="button" class="btn small-btn" data-lact="exup" data-ex="${n}" ${n===0?'disabled':''} aria-label="Subir el ejemplo ${n+1}">↑ Subir</button><button type="button" class="btn small-btn" data-lact="exdown" data-ex="${n}" ${n===exs.length-1?'disabled':''} aria-label="Bajar el ejemplo ${n+1}">↓ Bajar</button><button type="button" class="btn small-btn" data-lact="exdup" data-ex="${n}" ${exs.length>=4?'disabled':''} aria-label="Duplicar el ejemplo ${n+1}">⧉ Duplicar</button><button type="button" class="btn small-btn danger" data-lact="delex" data-ex="${n}" ${exs.length<=1?'disabled':''} aria-label="Quitar el ejemplo ${n+1}">Quitar</button></span></div><div class="ex-body"><label class="field full">Enunciado<input data-ls="etitle" data-ex="${n}" value="${esc(St.title||'')}" placeholder="Resolvemos $2x+3=5$."></label>${items.map((it,i)=>stepMarkup(it,i,n,items)).join('')}<div class="hstack"><button type="button" class="btn small-btn" data-lact="addstep" data-ex="${n}" ${items.length>=20?'disabled':''}>+ Paso</button></div></div></div>`;}).join('');
 $('addLearnEx').disabled=exs.length>=4;$('learnExCount').textContent=exs.length+' de 4 ejemplos guiados';
}
$('learnOn').addEventListener('change',e=>{const s=station();if(!s)return;
 if(e.target.checked){s.learn={goal:'',idea:'',steps:{title:'',items:[{why:'',math:''}]},warn:''};}
 else{if(!confirm('Se quitará el Aprende visual de esta estación (se conservan la explicación y el ejemplo en texto). ¿Continuar?')){e.target.checked=true;return;}delete s.learn;}
 touch();renderLearnEditor();});
$('learnEd').addEventListener('input',e=>{const el=e.target,s=station();if(!s||!s.learn)return;const L=s.learn;
 if(el.dataset.l){L[el.dataset.l]=el.value;touch();}
 else if(el.dataset.ls){const n=Number(el.dataset.ex||0),St=exAt(L,n),k=el.dataset.ls;if(!St)return;
  if(k==='etitle'){St.title=el.value;const sm=el.closest('.ex-group').querySelector('.ex-sum');if(sm)sm.textContent=exSummary(St);touch();return;}
  const it=St.items[Number(el.dataset.i)],k2=k;
  if(k2==='why'||k2==='math'){it[k2]=el.value;}
  else{const f={stitle:'title',smath:'math',stext:'text'}[k2];it.side=it.side||{};if(el.value==='')delete it.side[f];else it.side[f]=el.value;if(!Object.keys(it.side).length)delete it.side;}
  const stEl=el.closest('.learn-step');if(stEl)stEl.classList.toggle('need',stepNeeds(it));touch();}});
function exToggle(n){const s=station();if(!s)return;const cur=exOpenBy[s.id]??0;exOpenBy[s.id]=cur===n?-1:n;exActive=n;renderLearnEditor();}
$('learnEd').addEventListener('keydown',e=>{const h=e.target.closest&&e.target.closest('[data-exhead]');if(h&&e.target===h&&(e.key==='Enter'||e.key===' ')){e.preventDefault();exToggle(Number(h.dataset.exhead));}});
$('learnEd').addEventListener('click',e=>{const s=station();if(!s||!s.learn)return;const L=s.learn;
 const hd=e.target.closest('[data-exhead]');if(hd&&!e.target.closest('button')){exToggle(Number(hd.dataset.exhead));return;}
 const b=e.target.closest('button[data-lact]');if(!b)return;const n=Number(b.dataset.ex||0),i=Number(b.dataset.i),act=b.dataset.lact;
 if(act==='exup'||act==='exdown'||act==='exdup'||act==='delex'){const arr=exList(L);
  if(act==='exup'&&n>0){[arr[n-1],arr[n]]=[arr[n],arr[n-1]];exOpenBy[s.id]=n-1;exActive=n-1;}
  else if(act==='exdown'&&n<arr.length-1){[arr[n+1],arr[n]]=[arr[n],arr[n+1]];exOpenBy[s.id]=n+1;exActive=n+1;}
  else if(act==='exdup'&&arr.length<4){arr.splice(n+1,0,JSON.parse(JSON.stringify(arr[n])));exOpenBy[s.id]=n+1;exActive=n+1;}
  else if(act==='delex'&&arr.length>1){if(!confirm('¿Quitar el ejemplo guiado '+(n+1)+'?'))return;arr.splice(n,1);exOpenBy[s.id]=Math.min(n,arr.length-1);exActive=exOpenBy[s.id];}
  else return;
  L.steps=arr[0];if(arr.length>1)L.more=arr.slice(1);else delete L.more;touch();renderLearnEditor();return;}
 const St=exAt(L,n);if(!St)return;const it=St.items;
 if(act==='addstep'){if(it.length>=20)return;it.push({why:'',math:''});}
 else if(act==='del'&&it.length>1)it.splice(i,1);else if(act==='up'&&i>0)[it[i-1],it[i]]=[it[i],it[i-1]];else if(act==='down'&&i<it.length-1)[it[i+1],it[i]]=[it[i],it[i+1]];else return;
 touch();renderLearnEditor();});
$('addLearnEx').onclick=()=>{const s=station();if(!s||!s.learn)return;const L=s.learn;if(exList(L).length>=4)return;L.more=L.more||[];L.more.push({title:'',items:[{why:'',math:''}]});touch();renderLearnEditor();};
/* ---- META FINAL de la unidad (campo opcional "meta") ---- */
$('uMetaOn').addEventListener('change',e=>{if(!unit)return;if(e.target.checked)unit.meta={minutes:Number($('uMetaMin').value)||60,mix:[2,'x']};else delete unit.meta;$('uMetaMin').disabled=!e.target.checked;touch();});
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
  piece+=rcPreview(s);
  if(s.learn){const L=s.learn;piece+=(L.goal?`<div class="learn-prev"><span class="lp-t">QUÉ APRENDERÁS</span><p class="math-fragment">${bold(L.goal)}</p></div>`:'')+`<div class="learn-prev"><span class="lp-t">COMPRENDE LA IDEA</span><p class="math-fragment">${bold(L.idea||s.concept)}</p>${L.figure&&L.figure.svg?`<figure style="max-width:300px;margin:8px auto 0;text-align:center">${L.figure.svg}${L.figure.caption?`<figcaption style="font-size:13px;font-weight:700">${esc(L.figure.caption)}</figcaption>`:''}</figure>`:''}</div>`+exList(L).map((St,n)=>lpEx(St,n?'EJEMPLO '+(n+1)+' · PASO A PASO':'EJEMPLO 1 · PASO A PASO',n)).join('')+(L.warn?`<div class="learn-prev"><span class="lp-t">PRESTA ATENCIÓN</span><p class="math-fragment">${bold(L.warn)}</p></div>`:'');}
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
 if(window.MathJax?.typesetPromise)window.MathJax.typesetPromise([$('studentPreview')]).then(()=>applyPvFocus(false)).catch(()=>{});
 applyPvFocus(false);
}
$('openPackage').addEventListener('change',e=>{const file=e.target.files[0];if(file)openUnit(file);e.target.value='';});
$('addStation').onclick=()=>{if(unit)newStation();};
$('addGroup').onclick=()=>{if(!unit)return;if(unit.groups.length>=PACEContract.maxGroups){alertMessage('Máximo 15 bloques por unidad',true);return;}unit.groups.push({title:'Nuevo bloque',subtitle:''});touch();renderGroups();renderStationEditor();};
$('stationList').addEventListener('click',e=>{const b=e.target.closest('button[data-index]');if(!b)return;selected=Number(b.dataset.index);exActive=0;pvLast=null;renderStationList();renderStationEditor();});
$('unitFields').addEventListener('input',e=>{const el=e.target;if(el.dataset.u){unit[el.dataset.u]=el.value;if(el.dataset.u==='title')$('unitName').textContent='Unidad '+unit.roman;touch();}else if(el.dataset.groupindex!==undefined){unit.groups[Number(el.dataset.groupindex)][el.dataset.groupfield]=el.value;touch();}});
$('groupList').addEventListener('click',e=>{const b=e.target.closest('button[data-removegroup]');if(!b)return;const i=+b.dataset.removegroup;if(!confirm('Eliminar este bloque? Sus estaciones pasarán al primer bloque disponible.'))return;unit.groups.splice(i,1);unit.stations.forEach(s=>{if(s.group===i)s.group=0;else if(s.group>i)s.group--;});touch();renderGroups();renderStationEditor();});
$('stationEditor').addEventListener('input',e=>{const el=e.target,s=station();if(!s)return;
 if(el.dataset.s){const k=el.dataset.s;if(k==='draw'||k==='drawCheck'){if(el.value==='')delete s[k];else s[k]=Number(el.value);}else if(/^example[234]$/.test(k)&&el.value.trim()==='')delete s[k];else s[k]=k==='group'||k==='minutes'?Number(el.value):el.value;touch();if(k==='title'){renderStationList();}return;}
 const box=el.closest('.question');if(box){const q=selectedQuestion(box);if(el.dataset.qfield==='level'){if(el.value)q.level=Number(el.value);else delete q.level;touch();return;}if(el.dataset.qcheck){if(el.checked)q.reduced=false;else delete q.reduced;touch();return;}if(el.dataset.qfield==='solution'){if(el.value.trim())q.solution=el.value;else delete q.solution;touch();return;}if(el.dataset.qfield)q[el.dataset.qfield]=el.dataset.qfield==='correct'?Number(el.value):el.value;if(el.dataset.qfield==='correct'){if(Array.isArray(q.fb)){q.fb[q.correct]='';if(!q.fb.some(f=>String(f).trim()))delete q.fb;}touch();renderQuestions();return;}if(q.type==='input'){const n=box.querySelector('[data-tnote]');if(n)n.textContent=typedNote(q);}
 else if(el.dataset.option!==undefined)q.options[Number(el.dataset.option)]=el.value;else if(el.dataset.optfb!==undefined){const k=Number(el.dataset.optfb);if(!Array.isArray(q.fb))q.fb=q.options.map(()=>'');while(q.fb.length<q.options.length)q.fb.push('');q.fb[k]=el.value;if(!q.fb.some(f=>String(f).trim()))delete q.fb;}touch();return;}
 const mb=el.closest('[data-mediaindex]');if(mb&&el.dataset.mediafield){s.media[Number(mb.dataset.mediaindex)][el.dataset.mediafield]=el.value;touch();}
});
$('stationEditor').addEventListener('change',e=>{const el=e.target;if(el.dataset.s==='group')touch();
 if(el.dataset.qtype){const box=el.closest('.question'),q=selectedQuestion(box);
  if(el.value==='input'&&q.type!=='input'){if(!confirm('Al pasar a respuesta escrita se pierden las alternativas de esta pregunta. ¿Continuar?')){renderQuestions();return;}delete q.options;delete q.fb;delete q.correct;q.type='input';q.kind='number';q.answer='';}
  else if(el.value!=='input'&&q.type==='input'){delete q.type;delete q.kind;delete q.answer;delete q.reduced;q.options=['Alternativa A','Alternativa B','Alternativa C'];q.correct=0;}
  touch();renderQuestions();}});
$('stationEditor').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=station();if(!s)return;
 if(b.dataset.removeq!==undefined){const n=Number(b.dataset.removeq);if(s.practice.length<=1)return;if(!confirm('Quitar esta pregunta? Si la unidad ya está publicada, puede afectar los porcentajes.'))return;s.practice.splice(n,1);touch();renderQuestions();return;}
 if(b.dataset.removec!==undefined){const n=Number(b.dataset.removec);if(!confirm('Quitar esta pregunta de Aplica? Si la unidad ya está publicada, puede afectar los porcentajes.'))return;s.checks.splice(n,1);if(!s.checks.length)delete s.checks;touch();renderQuestions();return;}
 if(b.dataset.addoption!==undefined||b.dataset.removeoption!==undefined){const box=b.closest('.question'),q=selectedQuestion(box);if(b.dataset.addoption!==undefined&&q.options.length<8)q.options.push('Nueva alternativa');else if(b.dataset.removeoption!==undefined&&q.options.length>2){q.options.pop();if(q.correct>=q.options.length)q.correct=q.options.length-1;}if(Array.isArray(q.fb)){q.fb=q.options.map((_,k)=>k===q.correct?'':(q.fb[k]||''));if(!q.fb.some(f=>String(f).trim()))delete q.fb;}touch();renderQuestions();return;}
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
/* ---- La vista previa acompaña al ejemplo o paso que se edita ---- */
var pvLast=null;
function applyPvFocus(smooth){const box=$('studentPreview');if(!box)return;box.querySelectorAll('.pv-active').forEach(x=>x.classList.remove('pv-active'));if(!pvLast||activeTab!=='learn')return;
 const g=box.querySelector('[data-pex="'+pvLast.n+'"]');if(!g)return;const el=pvLast.i!=null?g.querySelector('[data-pi="'+pvLast.i+'"]'):null;(el||g).classList.add('pv-active');
 const pane=box.closest('.preview-pane');if(pane&&pane.scrollHeight>pane.clientHeight+4){const top=(el||g).getBoundingClientRect().top-pane.getBoundingClientRect().top+pane.scrollTop-110;pane.scrollTo({top:Math.max(0,top),behavior:smooth&&!matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'auto'});}}
$('learnEd').addEventListener('focusin',e=>{const g=e.target.closest('[data-exg]');if(!g)return;const n=Number(g.dataset.exg);exActive=n;$$('.ex-group',$('learnEd')).forEach(x=>x.classList.toggle('active',x===g));
 const st=e.target.closest('[data-step]');pvLast={n,i:st?Number(st.dataset.step):null};
 if(activeTab!=='learn'){const pb=document.querySelector('button[data-preview-tab="learn"]');if(pb)pb.click();}else applyPvFocus(true);});
/* ---- Disposición del editor y vista ampliada del estudiante ---- */
const LAYOUTS={edit:'lay-edit',half:'lay-half',prev:'lay-prev'};
function setLayout(k,save=true){const L=document.querySelector('.layout');Object.values(LAYOUTS).forEach(c=>L.classList.remove(c));L.classList.add(LAYOUTS[k]||LAYOUTS.half);$$('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===k)));if(save)try{localStorage.setItem('pace_layout',k);}catch(e){}}
$$('[data-layout]').forEach(b=>b.onclick=()=>setLayout(b.dataset.layout));
{let k='half';try{k=localStorage.getItem('pace_layout')||'half';}catch(e){}setLayout(LAYOUTS[k]?k:'half',false);}
function setBig(on){const pane=document.querySelector('.preview-pane');pane.classList.toggle('big',on);document.body.classList.toggle('pv-big',on);$('pvBig').setAttribute('aria-pressed',String(on));$('pvBig').textContent=on?'✕ Volver a editar':'⤢ Ampliar vista';if(window.MathJax?.typesetPromise)MathJax.typesetPromise([$('studentPreview')]).catch(()=>{});$('pvBig').focus();}
$('pvBig').onclick=()=>setBig(!document.querySelector('.preview-pane').classList.contains('big'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.preview-pane.big'))setBig(false);});
/* ---- Revisión de errores antes de exportar ---- */
function classify(msg){return /falta|obligatori|necesita|crea al menos|elige|repetido/i.test(msg)?'Obligatorio':/máximo|caracteres|demasiado grande|admite hasta|entre \d/i.test(msg)?'Límite':'Formato inválido';}
function tabOf(msg){return /Explora/.test(msg)?'explore':/Aplica/.test(msg)?'check':/práctica|pregunta/i.test(msg)?'practice':'learn';}
function collectIssues(){const out=[];if(!unit)return out;const seen=new Set();
 const add=(o)=>{const k=o.station+'|'+o.msg;if(seen.has(k))return;seen.add(k);out.push(o);};
 unit.stations.forEach((s,i)=>{const L=s.learn;if(L&&L.steps){exList(L).forEach((St,n)=>(St&&St.items||[]).forEach((it,k)=>{if(stepNeeds(it))add({station:i,tab:'learn',ex:n,step:k,kind:'Obligatorio',where:'Estación '+(i+1)+' · Ejemplo '+(n+1)+' · Paso '+(k+1),msg:'Falta una explicación: escribe el comentario breve o el título o el texto del cálculo auxiliar.'});}));}
  try{PACEValidation.validate({...unit,stations:[s]},resources);}catch(e){const msg=String(e.message).replace(/^Estación 1: /,'');if(/falta una explicación/.test(msg))return;add({station:i,tab:tabOf(msg),kind:classify(msg),where:'Estación '+(i+1)+(s.title?' · '+s.title:''),msg});}});
 try{PACEValidation.validate(unit,resources);}catch(e){const m=String(e.message);if(!out.some(o=>m.includes(o.msg.slice(0,30))||/falta una explicación/.test(m))){const mm=/^Estación (\d+)/.exec(m);add({station:mm?Number(mm[1])-1:-1,tab:tabOf(m),kind:classify(m),where:mm?'Estación '+mm[1]:'Unidad',msg:m.replace(/^Estación \d+: /,'')});}}
 return out;}
function showIssues(list){const box=$('issuesBox');if(!list.length){box.classList.add('hidden');return;}
 box.innerHTML=`<div class="issues-in" role="region" aria-label="Errores por corregir"><div class="inline-head"><strong>${list.length} punto${list.length===1?'':'s'} por corregir antes de exportar</strong><button type="button" class="btn small-btn" id="issuesClose">Cerrar</button></div><ol>${list.map((o,n)=>`<li><button type="button" class="issue-go" data-issue="${n}"><span class="issue-kind k-${o.kind[0]}">${o.kind}</span><b>${esc(o.where)}</b> — ${esc(o.msg)}</button></li>`).join('')}</ol></div>`;box.classList.remove('hidden');window.__issues=list;}
$('issuesBox').addEventListener('click',e=>{if(e.target.id==='issuesClose'){$('issuesBox').classList.add('hidden');return;}const b=e.target.closest('[data-issue]');if(!b)return;const o=window.__issues[Number(b.dataset.issue)];if(!o||o.station<0)return;
 selected=o.station;renderStationList();renderStationEditor();setEdTab(o.tab);
 if(o.ex!==undefined){const s=station();exOpenBy[s.id]=o.ex;exActive=o.ex;renderLearnEditor();const f=document.querySelector('.learn-step[data-ex="'+o.ex+'"][data-step="'+o.step+'"] [data-ls="why"]');if(f){f.scrollIntoView({block:'center'});f.focus();}}
 else{const pane=document.querySelector('.ed-pane[data-pane="'+o.tab+'"]');if(pane)pane.scrollIntoView({block:'start'});}});
$('checkErrors').onclick=()=>{if(!unit)return;const l=collectIssues();if(l.length)showIssues(l);else{$('issuesBox').classList.add('hidden');status('Revisión completa: no se encontraron errores. Puedes exportar.');}};
/* ---- Borrador local (solo el contenido de la unidad; los archivos adjuntos salen con la exportación) ---- */
var draftTimer=null;const draftKey=()=>unit?'pace_draft_'+unit.id:null;
function saveDraft(manual){const k=draftKey();if(!k)return;try{localStorage.setItem(k,JSON.stringify({savedAt:Date.now(),file:unitFile,unit}));if(manual)status('Borrador guardado en este navegador ('+new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})+'). La exportación sigue siendo la copia oficial.');}catch(e){if(manual)alertMessage('No se pudo guardar el borrador (almacenamiento lleno o bloqueado). Exporta el ZIP para conservar tu trabajo.',true);}}
function scheduleDraft(){clearTimeout(draftTimer);draftTimer=setTimeout(()=>saveDraft(false),4000);}
$('saveDraft').onclick=()=>saveDraft(true);
function offerDraft(){const k=draftKey();if(!k)return;let d=null;try{d=JSON.parse(localStorage.getItem(k)||'null');}catch(e){}if(!d||!d.unit)return;if(JSON.stringify(d.unit)===JSON.stringify(unit))return;
 if(confirm('Hay un borrador de esta unidad guardado en este navegador ('+new Date(d.savedAt).toLocaleString('es-CL')+'). ¿Quieres recuperarlo en lugar del paquete que acabas de abrir?')){unit=d.unit;selected=unit.stations.length?0:-1;dirty=true;changeUnitFields();renderGroups();renderStationList();renderStationEditor();updateTime();status('Borrador recuperado · exporta el ZIP cuando termines');}}
/* ---- Mapa jerárquico: solo como archivo exportado ---- */
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);}
$('exportMap').onclick=async()=>{if(!unit)return;try{const svg=PACEArtifacts.hierarchySVG(unit),n='MAPA_UNIDAD_0'+unit.id[1];download(new Blob([svg],{type:'image/svg+xml'}),n+'.svg');download(await PACEArtifacts.pngFromSVG(svg),n+'.png');status('Mapa exportado: '+n+'.svg y '+n+'.png');}catch(e){alertMessage('No se pudo generar el mapa: '+e.message,true);}};

/* ---- Divisor arrastrable entre edición y vista previa ---- */
(function(){const L=document.querySelector('.layout'),sp=$('splitter');if(!sp)return;
 const set=(a,b,save)=>{L.style.setProperty('--cols','250px minmax(340px,'+a.toFixed(3)+'fr) 10px minmax(300px,'+b.toFixed(3)+'fr)');L.dataset.a=a.toFixed(3);L.dataset.b=b.toFixed(3);$$('[data-layout]').forEach(x=>x.setAttribute('aria-pressed','false'));if(save)try{localStorage.setItem('pace_split',a.toFixed(3)+','+b.toFixed(3));}catch(e){}};
 const fromX=x=>{const ed=document.querySelectorAll('.layout>.pane')[1].getBoundingClientRect(),pv=document.querySelector('.preview-pane').getBoundingClientRect();const total=pv.right-ed.left;const edW=Math.min(Math.max(x-ed.left,340),total-300-10);const pvW=total-10-edW;return [edW/100,pvW/100];};
 sp.addEventListener('pointerdown',e=>{sp.setPointerCapture(e.pointerId);sp.classList.add('drag');});
 sp.addEventListener('pointermove',e=>{if(!sp.classList.contains('drag'))return;const [a,b]=fromX(e.clientX);set(a,b,false);});
 const end=e=>{if(!sp.classList.contains('drag'))return;sp.classList.remove('drag');const a=parseFloat(L.dataset.a),b=parseFloat(L.dataset.b);if(a&&b)set(a,b,true);};
 sp.addEventListener('pointerup',end);sp.addEventListener('pointercancel',end);
 sp.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const ed=document.querySelectorAll('.layout>.pane')[1].getBoundingClientRect(),pv=document.querySelector('.preview-pane').getBoundingClientRect();const step=(e.key==='ArrowLeft'?-40:40),[a,b]=fromX(ed.right+step);set(a,b,true);});
 sp.addEventListener('dblclick',()=>{L.style.removeProperty('--cols');try{localStorage.removeItem('pace_split');}catch(e){}setLayout('half');});
 try{const s=(localStorage.getItem('pace_split')||'').split(',').map(Number);if(s.length===2&&s[0]>0&&s[1]>0)set(s[0],s[1],false);}catch(e){}
 $$('[data-layout]').forEach(b=>b.addEventListener('click',()=>{L.style.removeProperty('--cols');try{localStorage.removeItem('pace_split');}catch(e){}}));
})();

/* PACE UACh · Exportación por modalidades con avance visible (19-11-2026).
 * Propuesta de Henry (Propuestas de mejoras/COMENTARIOS_LUIS_OPTIMIZACION_EXPORTACION.txt):
 * elegir qué exportar y hacer solo esas tareas; cronómetro, etapa en curso, avance y última actividad.
 * Usa las variables y funciones de editor.js (unit, resources, unitFile, dirty, validatePackage, …). */
(()=>{
'use strict';
const MODES={
 html:{t:'HTML navegable',d:'Para actualizar los HTML de la unidad en GitHub.',inc:'Carpeta VISTA_PREVIA_HTML (motor, data.js y recursos).',file:n=>`HTML_UNIDAD_0${n}.zip`},
 scorm:{t:'SCORM individual',d:'Para probar la unidad en SiveducMD.',inc:'Solo el ZIP SCORM, listo para subir (sin otro ZIP alrededor).',file:n=>`SCORM_UNIDAD_0${n}.zip`},
 mapas:{t:'Mapas',d:'Para revisar o imprimir los mapas de la unidad.',inc:'Mapa en árbol y mapa de progreso de ejemplo.',file:n=>`MAPAS_UNIDAD_0${n}.zip`},
 banco:{t:'Banco de preguntas',d:'Copia docente con respuestas y comentarios.',inc:'PDF y/o LaTeX. El PDF es la etapa más lenta.',file:n=>`BANCO_UNIDAD_0${n}`},
 respaldo:{t:'Respaldo editable',d:'Para guardar el trabajo y seguir editando después.',inc:'JSON de la unidad y carpeta recursos/. Se vuelve a abrir con «Abrir paquete».',file:n=>`RESPALDO_UNIDAD_0${n}.zip`},
 completo:{t:'Paquete completo',d:'Entrega integral a coordinación y respaldo.',inc:'Todo lo anterior: JSON, recursos, HTML, SCORM, mapas y banco PDF + LaTeX.',file:n=>`ENTREGA_UNIDAD_0${n}.zip`}};
const ORDER=['html','scorm','mapas','banco','respaldo','completo'];
const ST={validar:'Revisando la unidad',preparar:'Preparando archivos',archivos:'Incorporando JSON y recursos',mapas:'Generando mapas',tex:'Generando banco LaTeX',pdf:'Generando banco PDF',html:'Preparando HTML',scorm:'Construyendo SCORM',revision:'Validando archivos',comprimir:'Comprimiendo paquete',descarga:'Descarga iniciada'};
let R=null,timer=null;
const pad=n=>String(n).padStart(2,'0');
const hms=s=>pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(Math.floor(s)%60);
const mb=b=>(b/1048576).toFixed(b<1048576?2:1).replace('.',',')+' MB';
const pref=()=>{try{return JSON.parse(localStorage.getItem('pace-export')||'{}');}catch(e){return {};}};
const savePref=o=>{try{localStorage.setItem('pace-export',JSON.stringify(o));}catch(e){}};
const css=`#pxDlg{border:0;border-radius:16px;padding:0;width:min(760px,94vw);max-height:92vh;box-shadow:0 20px 60px rgba(10,40,60,.35);color:#173b50}
#pxDlg::backdrop{background:rgba(12,35,52,.45)}
.px-in{padding:20px 22px;overflow:auto;max-height:92vh;box-sizing:border-box}
.px-in h2{margin:0 0 4px;font-size:20px;color:#113756}.px-in>p{margin:0 0 14px;font-size:13px;color:#506a77}
.px-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.px-opt{display:flex;gap:10px;align-items:flex-start;border:1.5px solid #d3e3e8;border-radius:12px;padding:11px 12px;cursor:pointer;background:#fff}
.px-opt:hover{border-color:#0a9cb1}.px-opt.on{border-color:#0a7d89;background:#eef9f9;box-shadow:0 0 0 2px #0a7d8933}
.px-opt input[type=radio]{margin-top:3px;accent-color:#0a7d89}
.px-opt b{display:block;font-size:14px;color:#113756}.px-opt span{display:block;font-size:12px;color:#425c67;line-height:1.4;margin-top:2px}
.px-opt em{display:block;font-style:normal;font-size:11.5px;color:#5f7380;margin-top:4px}
.px-sub{display:flex;gap:12px;margin-top:6px;font-size:12px}.px-sub label{display:flex;gap:4px;align-items:center}
.px-file{margin:12px 0 0;font-size:12.5px;color:#425c67}.px-file code{background:#eef4f6;padding:2px 6px;border-radius:5px}
.px-row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}
.px-clock{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin:6px 0 12px}
.px-clock b{font:700 30px/1 ui-monospace,Menlo,Consolas,monospace;color:#113756;letter-spacing:.02em}
.px-clock span{font-size:12.5px;color:#506a77}.px-clock span.slow{color:#a05131;font-weight:700}
.px-steps{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.px-steps li{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center;font-size:13.5px;padding:7px 10px;border-radius:9px;background:#f6fafb;color:#7a8e98}
.px-steps li i{font-style:normal;text-align:center;font-weight:900}
.px-steps li.run{background:#e7f3f6;color:#113756;font-weight:700}.px-steps li.ok{color:#1c6d4f}.px-steps li.bad{background:#fff0e8;color:#8e4d24;font-weight:700}
.px-steps small{font-size:12px;color:#425c67;font-weight:600}
.px-bar{height:8px;border-radius:6px;background:#e1ebef;margin:10px 0 2px;overflow:hidden}.px-bar>div{height:100%;width:0;background:#0a7d89;transition:width .25s}
.px-bar.ind>div{width:30%;animation:pxind 1.2s ease-in-out infinite}@keyframes pxind{0%{transform:translateX(-100%)}100%{transform:translateX(340%)}}
.px-msg{margin:12px 0 0;padding:10px 12px;border-radius:9px;font-size:13.5px;line-height:1.5}.px-msg.ok{background:#e9f7ef;color:#1c6d4f}.px-msg.bad{background:#fff0e8;color:#8e4d24}
@media (max-width:640px){.px-grid{grid-template-columns:1fr}}`;
function ensure(){
 if($('pxDlg'))return;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const d=document.createElement('dialog');d.id='pxDlg';d.innerHTML='<div class="px-in" id="pxIn"></div>';document.body.appendChild(d);
 d.addEventListener('cancel',e=>{if(R&&R.running)e.preventDefault();});
}
function choose(){
 if(!unit)return;ensure();const p=pref(),mode=MODES[p.mode]?p.mode:'completo',n=unit.id[1];
 const sub=k=>k==='mapas'?`<div class="px-sub"><label><input type="checkbox" id="pxSvg" ${p.svg!==false?'checked':''}> SVG</label><label><input type="checkbox" id="pxPng" ${p.png!==false?'checked':''}> PNG</label></div>`:k==='banco'?`<div class="px-sub"><label><input type="checkbox" id="pxPdf" ${p.pdf!==false?'checked':''}> PDF</label><label><input type="checkbox" id="pxTex" ${p.tex!==false?'checked':''}> LaTeX</label></div>`:'';
 $('pxIn').innerHTML=`<h2>Exportar Unidad ${esc(unit.roman||n)}</h2><p>Elige qué necesitas: el editor hace solo esas tareas.</p><div class="px-grid" role="radiogroup">${ORDER.map(k=>`<label class="px-opt${k===mode?' on':''}"><input type="radio" name="pxMode" value="${k}" ${k===mode?'checked':''}><div><b>${MODES[k].t}</b><span>${MODES[k].d}</span><em>${MODES[k].inc}</em>${sub(k)}</div></label>`).join('')}</div><p class="px-file" id="pxFile"></p><div class="px-row"><button type="button" class="btn" id="pxCancel">Cancelar</button><button type="button" class="btn primary" id="pxGo">⬇ Exportar</button></div>`;
 const upd=()=>{const k=document.querySelector('input[name=pxMode]:checked').value;document.querySelectorAll('.px-opt').forEach(o=>o.classList.toggle('on',o.querySelector('input').value===k));$('pxFile').innerHTML='Se descargará: <code>'+esc(fileName(k))+'</code>';$('pxGo').disabled=(k==='mapas'&&!$('pxSvg').checked&&!$('pxPng').checked)||(k==='banco'&&!$('pxPdf').checked&&!$('pxTex').checked);};
 $('pxIn').addEventListener('change',upd);upd();
 $('pxCancel').onclick=()=>$('pxDlg').close();
 $('pxGo').onclick=()=>{const k=document.querySelector('input[name=pxMode]:checked').value,o={mode:k,svg:$('pxSvg').checked,png:$('pxPng').checked,pdf:$('pxPdf').checked,tex:$('pxTex').checked};savePref(o);run(o);};
 if(!$('pxDlg').open)$('pxDlg').showModal();
}
function fileName(k,o){o=o||{pdf:$('pxPdf')?.checked,tex:$('pxTex')?.checked};const n=unit.id[1],f=MODES[k].file(n);if(k!=='banco')return f;return o.pdf&&o.tex?f+'.zip':o.pdf?'BANCO_UNIDAD_'+n+'.pdf':'BANCO_UNIDAD_'+n+'.tex';}
function stagesFor(o){switch(o.mode){
 case 'html':return ['validar','preparar','html','comprimir','descarga'];
 case 'scorm':return ['validar','preparar','scorm','descarga'];
 case 'mapas':return ['mapas','comprimir','descarga'];
 case 'banco':return [o.tex&&'tex',o.pdf&&'pdf',o.tex&&o.pdf&&'comprimir','descarga'].filter(Boolean);
 case 'respaldo':return ['validar','archivos','comprimir','descarga'];
 default:return ['validar','archivos','mapas','tex','pdf','preparar','html','scorm','revision','comprimir','descarga'];}}
function paint(){
 if(!R)return;const now=Date.now(),el=(now-R.t0)/1000,idle=(now-R.last)/1000;
 const c=$('pxClock');if(!c)return;if(R.running)c.textContent=hms(el);
 const a=$('pxLast');if(a&&R.running){a.textContent=idle<2?'Última actividad: ahora':'Última actividad: hace '+Math.floor(idle)+' s';a.classList.toggle('slow',idle>=20);}
 R.stages.forEach((s,i)=>{const li=$('pxS'+i);if(!li)return;const st=R.state[i];li.className=st;li.querySelector('i').textContent=st==='ok'?'✓':st==='run'?'◐':st==='bad'?'✗':'○';li.querySelector('small').textContent=st==='run'?R.detail:st==='ok'&&R.took[i]!=null?R.took[i].toFixed(1).replace('.',',')+' s':'';});
 const bar=$('pxBar');if(bar){const known=R.pct!=null;bar.classList.toggle('ind',R.running&&!known);bar.firstChild.style.width=known?Math.max(0,Math.min(100,R.pct))+'%':'';bar.style.visibility=R.running?'visible':'hidden';}}
function report(detail,pct){if(R.cancel)throw Error('Exportación cancelada.');R.detail=detail||'';R.pct=(pct==null||Number.isNaN(pct))?null:pct;R.last=Date.now();}
async function stage(key,fn){
 const i=R.stages.indexOf(key);R.cur=i;R.state[i]='run';R.detail='';R.pct=null;R.last=Date.now();const t=Date.now();paint();
 await new Promise(ok=>setTimeout(ok,0));
 const v=await fn();R.state[i]='ok';R.took[i]=(Date.now()-t)/1000;R.last=Date.now();paint();return v;}
async function zipUp(zip){return stage('comprimir',()=>zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}},m=>{try{report((m.currentFile?m.currentFile.split('/').pop()+' · ':'')+Math.round(m.percent)+' %',m.percent);}catch(e){}}));}
function addSource(zip){zip.file(unitFile,JSON.stringify(unit,null,2)+'\n');for(const path of Object.keys(resources))if(/^recursos\//.test(path)&&resources[path])zip.file(path,resources[path]);}
async function addMaps(zip,o,pre){
 const list=[];if(o.svg!==false)list.push(['MAPA_UNIDAD_ARBOL.svg',()=>PACEArtifacts.hierarchySVG(unit)],['MAPA_PROGRESO_EJEMPLO.svg',()=>PACEArtifacts.svgMap(unit,'example')]);
 if(o.png!==false)list.push(['MAPA_UNIDAD_ARBOL.png',()=>PACEArtifacts.pngFromSVG(PACEArtifacts.hierarchySVG(unit))],['MAPA_PROGRESO_EJEMPLO.png',()=>PACEArtifacts.pngFromSVG(PACEArtifacts.svgMap(unit,'example'))]);
 for(const [k,[name,f]] of list.entries()){report(name+' ('+(k+1)+' de '+list.length+')',k/list.length*100);zip.file(pre+name,await f());}}
const pdfP=x=>report('Estación '+x.station+' de '+x.nst+' · pregunta '+x.done+' de '+x.total,x.done/x.total*100);
async function run(o){
 const n=unit.id[1],name=fileName(o.mode,o),stages=stagesFor(o);
 R={o,stages,state:stages.map(()=>''),took:stages.map(()=>null),t0:Date.now(),last:Date.now(),detail:'',pct:null,running:true,cancel:false,cur:-1};
 $('pxIn').innerHTML=`<h2>Exportando: ${MODES[o.mode].t}</h2><p>Unidad ${esc(unit.roman||n)} · archivo <code>${esc(name)}</code></p><div class="px-clock"><b id="pxClock">00:00:00</b><span>tiempo transcurrido</span><span id="pxLast">Última actividad: ahora</span></div><ol class="px-steps">${stages.map((s,i)=>`<li id="pxS${i}"><i>○</i><span>${ST[s]}</span><small></small></li>`).join('')}</ol><div class="px-bar" id="pxBar"><div></div></div><div id="pxEnd"></div><div class="px-row" id="pxBtns"><button type="button" class="btn" id="pxStop">Detener</button></div>`;
 $('pxStop').onclick=()=>{R.cancel=true;$('pxStop').disabled=true;$('pxStop').textContent='Deteniendo…';};
 clearInterval(timer);timer=setInterval(paint,250);paint();status('Exportando '+MODES[o.mode].t.toLowerCase()+'…');
 try{
  let blob,prep=null;const zip=new JSZip();
  if(stages.includes('validar'))await stage('validar',()=>{report('Comprobando estaciones, preguntas y recursos');validatePackage();});
  if(o.mode==='respaldo'||o.mode==='completo')await stage('archivos',()=>{addSource(zip);if(o.mode==='completo')zip.file('LEEME_ENTREGA.txt',`PACE UACh · entrega individual ${unitFile}\nEl JSON y la carpeta recursos/ de la raíz se utilizan para seguir editando y compilar el curso conjunto.\nVISTA_PREVIA_HTML/index.html: abre localmente una vez extraído el ZIP.\nSCORM_INDIVIDUAL/: paquete de tu unidad para probar directamente en SiveducMD.\nMAPAS/ y BANCO_PREGUNTAS/: materiales docentes complementarios (con respuestas).\nEnvía el ZIP completo a coordinación, sin modificar su estructura.\n`);});
  if(stages.includes('mapas'))await stage('mapas',()=>addMaps(zip,o.mode==='completo'?{}:o,o.mode==='completo'?'MAPAS/':''));
  const bp=o.mode==='completo'?'BANCO_PREGUNTAS/':'';
  let tex=null,pdf=null;
  if(stages.includes('tex'))await stage('tex',()=>{report('Escribiendo el archivo .tex');tex=PACEArtifacts.bankTex(unit);zip.file(bp+'BANCO_UNIDAD_'+n+'.tex',tex);});
  if(stages.includes('pdf'))await stage('pdf',async()=>{report('Cargando el renderizado matemático');pdf=await PACEArtifacts.bankPDF(unit,pdfP);zip.file(bp+'BANCO_UNIDAD_'+n+'.pdf',pdf);});
  if(o.mode==='completo')zip.file('BANCO_PREGUNTAS/NOTA.txt','Banco docente: contiene preguntas, respuestas y retroalimentaciones. El PDF presenta las fórmulas mediante renderizado matemático cuando MathJax está disponible. Los adjuntos se listan por nombre; las imágenes y videos originales están en recursos/.\n');
  if(stages.includes('preparar'))prep=await stage('preparar',()=>{report('Cargando el motor del curso');return PACEPublisher.prepare(unit,resources);});
  if(stages.includes('html'))await stage('html',()=>PACEPublisher.addHTML(prep,zip,'VISTA_PREVIA_HTML/',x=>report(x.file+' ('+x.done+' de '+x.total+')',x.done/x.total*100)));
  if(stages.includes('scorm')){const b=await stage('scorm',()=>PACEPublisher.scormBytes(prep,unit,x=>{try{report((x.file?x.file.split('/').pop()+' · ':'')+Math.round(x.pct)+' %',x.pct);}catch(e){}}));
   if(o.mode==='scorm')blob=new Blob([b],{type:'application/zip'});else zip.file('SCORM_INDIVIDUAL/SCORM_UNIDAD_0'+n+'.zip',b,{compression:'STORE'});}
  if(stages.includes('revision'))await stage('revision',()=>{report('Tamaño y cantidad de archivos');return PACEValidation.archive(zip);});
  if(o.mode==='banco'&&!(o.pdf&&o.tex))blob=o.pdf?new Blob([pdf],{type:'application/pdf'}):new Blob([tex],{type:'application/x-tex'});
  if(stages.includes('comprimir'))blob=await zipUp(zip);
  if(R.cancel)throw Error('Exportación cancelada.');
  await stage('descarga',()=>{download(blob,name);});
  R.running=false;clearInterval(timer);paint();
  if(o.mode==='respaldo'||o.mode==='completo'){dirty=false;try{localStorage.removeItem(draftKey());}catch(e){}}
  const el=hms((Date.now()-R.t0)/1000);
  $('pxEnd').innerHTML=`<p class="px-msg ok">✓ <b>Descarga iniciada:</b> ${esc(name)} (${mb(blob.size)}) · tiempo total ${el}.<br>El navegador indica cuándo termina de guardarse el archivo.${o.mode==='html'||o.mode==='scorm'||o.mode==='mapas'||o.mode==='banco'?'<br>Esta opción no guarda el JSON editable: para conservar tus cambios usa «Respaldo editable» o «Paquete completo».':''}</p>`;
  $('pxBtns').innerHTML='<button type="button" class="btn" id="pxAgain">Exportar otra cosa</button><button type="button" class="btn primary" id="pxClose">Cerrar</button>';
  status('Exportado: '+name+(o.mode==='respaldo'||o.mode==='completo'?'':' · el JSON editable no se guardó con esta opción'));
 }catch(e){
  R.running=false;clearInterval(timer);if(R.cur>=0&&R.state[R.cur]==='run')R.state[R.cur]='bad';paint();
  const where=R.cur>=0?ST[R.stages[R.cur]]:'Inicio',cancel=R.cancel;
  $('pxEnd').innerHTML=`<p class="px-msg bad">${cancel?'Exportación detenida':'✗ Falló la etapa <b>«'+esc(where)+'»</b>'}: ${esc(cancel?'no se descargó nada. Tu trabajo en el editor sigue intacto.':e.message)}</p>`;
  $('pxBtns').innerHTML='<button type="button" class="btn" id="pxAgain">Elegir otra opción</button><button type="button" class="btn primary" id="pxRetry">Reintentar</button><button type="button" class="btn" id="pxClose">Cerrar</button>';
  $('pxRetry').onclick=()=>run(o);status(cancel?'Exportación detenida.':'La exportación falló en «'+where+'».');
  if(!cancel&&R.stages[R.cur]==='validar'){try{const l=collectIssues();if(l.length)showIssues(l);}catch(_){}}
 }
 $('pxClose').onclick=()=>$('pxDlg').close();$('pxAgain').onclick=choose;
}
$('exportPackage').onclick=choose;
window.PACEExport={choose,run};
})();

/* ---------- «Recuerda» (23-11-2026): recuadro con un prerrequisito de una estación anterior ---------- */
const RC_MAX=2,RC_TIT=90,RC_TXT=320,RC_EJ_PX=260;
const rcCat=()=>Array.isArray(window.PACE_CATALOGO)?window.PACE_CATALOGO:[];
function rcPrev(){const s=station();if(!s)return [];const cu=Number(unit.id[1]),out=[];
 for(const c of rcCat()){const cn=Number(c.u[1]);if(cn<cu)out.push({id:c.id,u:c.u,r:c.r,n:c.n,t:c.t});}
 unit.stations.slice(0,selected).forEach((x,k)=>out.push({id:x.id,u:unit.id,r:unit.roman,n:k+1,t:x.title||'(sin título)'}));
 return out;}
function rcOrigin(id){if(!id)return null;const k=unit.stations.findIndex(x=>x.id===id);if(k>=0)return {id,u:unit.id,r:unit.roman,n:k+1,t:unit.stations[k].title,k};const c=rcCat().find(x=>x.id===id);return c?{...c,k:-1}:null;}
function rcOriginOk(id){const s=station();if(!id)return [false,'Elige la estación de la que viene'];const cu=Number(unit.id[1]),ou=Number(id[1]);
 if(ou>cu)return [false,'La estación de origen está en una unidad posterior'];
 if(ou===cu){const k=unit.stations.findIndex(x=>x.id===id);if(k<0)return [false,'La estación de origen no existe en esta unidad'];if(k>=selected)return [false,'La estación de origen debe estar antes que esta'];}
 else if(rcCat().length&&!rcCat().some(c=>c.id===id))return [false,'No se encontró la estación de origen'];
 return [true,'Estación anterior'];}
function rcRender(){const box=$('rcEd');if(!box)return;const s=station();if(!s||!unit){box.innerHTML='';return;}
 const R=Array.isArray(s.recuerda)?s.recuerda:[],prev=rcPrev(),units=[...new Set(prev.map(p=>p.u))];
 const opts=r=>{let h=`<option value="">Elige la estación…</option>`;for(const u of units){const L=prev.filter(p=>p.u===u);h+=`<optgroup label="Unidad ${esc(L[0].r)}">${L.map(p=>`<option value="${esc(p.id)}"${p.id===r.origen?' selected':''}>Unidad ${esc(p.r)} · ${p.n} · ${esc(p.t)}</option>`).join('')}</optgroup>`;}
  if(r.origen&&!prev.some(p=>p.id===r.origen)){const o=rcOrigin(r.origen);h+=`<option value="${esc(r.origen)}" selected>⚠ ${o?'Unidad '+esc(o.r)+' · '+o.n+' · '+esc(o.t):esc(r.origen)} (no es anterior)</option>`;}return h;};
 box.innerHTML=`<div class="inline-head"><h3>Recuerda (opcional)</h3><span class="pill">${R.length} de ${RC_MAX}</span></div>
 <p class="hint">Úsalo solo si esta estación necesita algo de una estación anterior que <b>no explica ella misma</b> (por ejemplo, calcular el mcm en una ecuación con fracciones). El estudiante lo abre con el botón «Recuerda», sin salir de la estación.</p>
 ${R.map((r,k)=>`<div class="rc-card" data-rc="${k}">
  <label class="field full">Viene de la estación<select data-rcf="origen">${opts(r)}</select></label>
  <label class="field full">Título <small class="rc-count" data-cnt="titulo"></small><input data-rcf="titulo" maxlength="${RC_TIT}" placeholder="Calcular el mcm de los denominadores" value="${esc(r.titulo||'')}"></label>
  <label class="field full">Texto · 2 o 3 líneas; admite $fórmulas$ y **negrita** <small class="rc-count" data-cnt="texto"></small><textarea data-rcf="texto" rows="3" maxlength="${RC_TXT}" placeholder="El mcm es el menor número que todos los denominadores dividen…">${esc(r.texto||'')}</textarea></label>
  <label class="field full">Ejemplo (opcional) · una fórmula en TeX, sin $; para dos líneas usa \\begin{gathered} … \\\\ … \\end{gathered}<textarea data-rcf="ejemplo" class="mono" rows="2" placeholder="\\mathrm{mcm}(4,6)=12">${esc(r.ejemplo||'')}</textarea></label>
  <div class="rc-checks" data-checks></div>
  <div class="rc-actions"><button type="button" class="btn small-btn" data-rcdel>Quitar este recuerda</button></div></div>`).join('')}
 ${R.length<RC_MAX?`<button type="button" class="btn small-btn" id="rcAdd">+ Agregar recuerda</button>`:''}
 ${rcCat().length?'':'<p class="hint">Falta el archivo catalogo_estaciones.js: por ahora solo se pueden elegir estaciones de esta unidad.</p>'}`;
 box.querySelectorAll('.rc-card').forEach(card=>rcChecks(card));
}
function rcItem(card){const s=station();return s&&s.recuerda?s.recuerda[Number(card.dataset.rc)]:null;}
function rcChecks(card){const r=rcItem(card);if(!r)return;const el=card.querySelector('[data-checks]');
 for(const [k,max] of [['titulo',RC_TIT],['texto',RC_TXT]]){const c=card.querySelector(`[data-cnt="${k}"]`);if(c){const n=Array.from(r[k]||'').length;c.textContent=n+' / '+max;c.classList.toggle('near',n>max*0.85);}}
 const chips=[];const [ok,msg]=rcOriginOk(r.origen);chips.push([ok,msg]);
 if(!String(r.titulo||'').trim())chips.push([false,'Falta el título']);if(!String(r.texto||'').trim())chips.push([false,'Falta el texto']);
 el.innerHTML=chips.map(([g,m])=>`<span class="rc-chip ${g?'ok':'bad'}">${g?'✓':'!'} ${esc(m)}</span>`).join('')+'<span class="rc-chip wait" data-ej></span>';
 rcMeasure(card,r);}
let rcTimer=null;
function rcMeasure(card,r){const slot=card.querySelector('[data-ej]');if(!slot)return;const tex=String(r.ejemplo||'').trim();
 if(!tex){slot.remove();return;}
 if(!window.MathJax||!MathJax.tex2svgPromise){slot.textContent='Revisa el ejemplo en la vista previa';return;}
 slot.textContent='Revisando el ejemplo…';
 MathJax.tex2svgPromise(tex,{display:true}).then(node=>{
  if(node.querySelector('[data-mjx-error],merror,mjx-merror')){slot.className='rc-chip bad';slot.textContent='! La fórmula del ejemplo tiene un error';return;}
  const m=document.createElement('div');m.style.cssText='position:absolute;left:-9999px;top:0;font-size:12.3px;font-family:Nunito,system-ui,sans-serif;white-space:nowrap';m.appendChild(node);document.body.appendChild(m);
  const svg=m.querySelector('svg');const w=svg?svg.getBoundingClientRect().width:0;m.remove();
  const fits=w<=RC_EJ_PX;slot.className='rc-chip '+(fits?'ok':'bad');slot.textContent=fits?'✓ El ejemplo cabe en celular':'! El ejemplo es muy ancho para celular: divídelo en dos líneas';
 }).catch(()=>{slot.className='rc-chip bad';slot.textContent='! La fórmula del ejemplo tiene un error';});}
$('rcEd')&&$('rcEd').addEventListener('input',e=>{const f=e.target.dataset.rcf;if(!f)return;const card=e.target.closest('.rc-card'),r=rcItem(card);if(!r)return;
 let v=e.target.value;if(f==='ejemplo'){v=v.trim()?v:'';if(!v){delete r.ejemplo;}else r.ejemplo=v;}else r[f]=v;
 touch();schedulePreview();clearTimeout(rcTimer);rcTimer=setTimeout(()=>rcChecks(card),f==='ejemplo'?350:0);});
$('rcEd')&&$('rcEd').addEventListener('change',e=>{if(e.target.dataset.rcf==='origen'){const card=e.target.closest('.rc-card'),r=rcItem(card);if(r){r.origen=e.target.value;touch();schedulePreview();rcChecks(card);}}});
$('rcEd')&&$('rcEd').addEventListener('click',e=>{const s=station();if(!s)return;
 if(e.target.closest('#rcAdd')){if(!Array.isArray(s.recuerda))s.recuerda=[];if(s.recuerda.length>=RC_MAX)return;s.recuerda.push({titulo:'',texto:'',origen:''});touch();rcRender();schedulePreview();const c=$('rcEd').querySelector('.rc-card:last-of-type select');if(c)c.focus();return;}
 const d=e.target.closest('[data-rcdel]');if(d){const k=Number(d.closest('.rc-card').dataset.rc);if(!confirm('¿Quitar este recuerda?'))return;s.recuerda.splice(k,1);if(!s.recuerda.length)delete s.recuerda;touch();rcRender();schedulePreview();}});
function rcPreview(s){const R=(Array.isArray(s.recuerda)?s.recuerda:[]).filter(r=>r&&(String(r.titulo||'').trim()||String(r.texto||'').trim()));if(!R.length)return '';
 return `<div class="rc-pv"><div class="rc-pv-top"><span class="rc-pv-btn">Recuerda</span><span class="rc-pv-note">El estudiante lo abre con este botón; aquí se muestra abierto.</span></div>${R.map(r=>{const o=rcOrigin(r.origen);return `<div class="rc-pv-box"><div class="rc-pv-from"><span class="rc-pv-tag">RECUERDA</span>${o?`Lo viste en <b>Unidad ${esc(o.r)} · ${esc(o.t)}</b>`:''}</div><h4 class="math-fragment">${bold(r.titulo||'')}</h4><p class="math-fragment">${bold(r.texto||'')}</p>${r.ejemplo?`<div class="rc-pv-ej math-fragment">$$${esc(r.ejemplo)}$$</div>`:''}</div>`;}).join('')}</div>`;}
{const _rse=renderStationEditor;renderStationEditor=function(){_rse.apply(this,arguments);try{rcRender();}catch(e){}};}
})();
