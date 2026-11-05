'use strict';
/* PACE UACh · SCORM 1.2 modular (v7)
 * Navegación: Inicio > Unidad > Estación.
 * Datos generados desde archivos independientes unidad_XX.json.
 * Porcentaje = hitos COMPLETADOS, no dominio matemático.
 * Estado por identificador estable de estación, compatible con avances v4/v5.
 */
// Contenido generado desde unidades/unidad_XX.json. Evitar modificar este motor.
const BUILD=(typeof PACE_BUILD!=='undefined'&&PACE_BUILD)?PACE_BUILD:{scope:'curso_completo',showWeek4:true};
const KEY=BUILD.scope==='curso_completo'?'pace_uach_modular_v7':'pace_uach_modular_v7_'+String(BUILD.scope||'preview').replace(/[^a-zA-Z0-9_-]/g,'_');
const PREVIOUS_KEY='pace_uach_modular_v6';
const LEGACY_KEY='pace_uach_scorm_v4_demo';
// SORTEO (draw): practice = banco; el estudiante ve solo `draw` preguntas, elegidas con su semilla personal.
const drawCount=s=>{const n=(s.practice||[]).length,d=s.draw;return Number.isInteger(d)&&d>=1&&d<n?d:n;};
const checkBank=s=>[s.check].concat(Array.isArray(s.checks)?s.checks:[]);
const checkCount=s=>{const n=checkBank(s).length,d=s.drawCheck;return Number.isInteger(d)&&d>=1&&d<n?d:n;};
const milestoneCount=s=>1+drawCount(s)+checkCount(s);
const hasDraw=s=>drawCount(s)<(s.practice||[]).length||checkCount(s)<checkBank(s).length;
function hashStr(t){let h=2166136261;for(const c of String(t)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const roundOf=s=>Object.hasOwn(state.rd,s.id)?state.rd[s.id]:0;
function windowIdx(s,n,d,salt,round){
 const idx=[...Array(n).keys()];
 if(d>=n)return idx;
 if(Number.isInteger(state.seed)){const r=rng((state.seed^hashStr(s.id+salt))>>>0);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]];}}
 const start=(round*d)%n,out=[];for(let k=0;k<d;k++)out.push(idx[(start+k)%n]);
 return out.sort((x,y)=>x-y);}
const lvlOf=q=>(q&&[1,2,3].includes(q.level))?q.level:2;
const hasLevels=s=>(s.practice||[]).some(q=>q&&[1,2,3].includes(q.level));
function levelQuota(d,avail){ // reparte d ejercicios entre niveles 1-2-3 (p. ej. 5 → 2·2·1) respetando lo disponible
 const q=[Math.floor(d/3),Math.floor(d/3),Math.floor(d/3)];for(let i=0,r=d-q[0]*3;r>0;r--,i++)q[i%3]++;
 let spare=0;for(let l=0;l<3;l++){if(q[l]>avail[l]){spare+=q[l]-avail[l];q[l]=avail[l];}}
 for(let l=0;l<3&&spare>0;l++){const add=Math.min(spare,avail[l]-q[l]);q[l]+=add;spare-=add;}
 for(let l=2;l>=0&&spare>0;l--){const add=Math.min(spare,avail[l]-q[l]);q[l]+=add;spare-=add;}
 return q;}
function drawnIndices(s){
 const n=s.practice.length,d=drawCount(s);
 if(!hasLevels(s))return windowIdx(s,n,d,'',roundOf(s));
 const by=[[],[],[]];s.practice.forEach((q,i)=>by[lvlOf(q)-1].push(i));
 if(d>=n)return by[0].concat(by[1],by[2]);
 const quota=levelQuota(d,by.map(x=>x.length)),round=roundOf(s),out=[];
 for(let l=0;l<3;l++){const list=by[l].slice(),m=list.length,k=quota[l];if(!k)continue;
  if(Number.isInteger(state.seed)){const r=rng((state.seed^hashStr(s.id+'L'+l))>>>0);for(let i=m-1;i>0;i--){const j=Math.floor(r()*(i+1));[list[i],list[j]]=[list[j],list[i]];}}
  const start=(round*k)%m;for(let t=0;t<k;t++)out.push(list[(start+t)%m]);}
 return out;}
const drawnChecks=s=>windowIdx(s,checkBank(s).length,checkCount(s),'#c',roundOf(s));
function ensureSeed(){if(!Number.isInteger(state.seed)&&STATIONS.some(hasDraw))state.seed=Math.floor(Math.random()*1073741824);}
const COUNT=STATIONS.reduce((v,s)=>v+milestoneCount(s),0);
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=v=>PACEText.html(v);
function typesetMath(el){if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([el]).catch(()=>{});}
function renderMedia(items){return items.map(m=>{const cap=m.caption?'<figcaption>'+esc(m.caption)+'</figcaption>':'';if(m.type==='image')return '<figure class="media-box"><img loading="lazy" src="'+esc(m.src)+'" alt="'+esc(m.caption||'Imagen del contenido')+'">'+cap+'</figure>';if(m.type==='video_file')return '<figure class="media-box"><video controls preload="metadata" src="'+esc(m.src)+'"></video>'+cap+'</figure>';if(m.type==='pdf')return '<div class="media-link">📄 <a href="'+esc(m.src)+'" target="_blank" rel="noopener noreferrer">Abrir PDF</a> '+esc(m.caption||'')+'</div>';if(m.type==='video_url')return '<div class="media-link">▶ <a href="'+esc(m.src)+'" target="_blank" rel="noopener noreferrer">Ver video</a> '+esc(m.caption||'')+'</div>';return '';}).join('');}
const emptyState=()=>({v:7,p:Object.create(null),last:null,tab:'learn',seed:null,rd:Object.create(null),dn:Object.create(null),sk:null,mt:null});
let state=emptyState();
let api=null,connected=false,mode='local',writeBlocked=false,restored=false,closed=false;
let view='home',selectedUnit=0,stationIndex=0,activeTab='learn',activeGroup=-1;
const ownStations=u=>STATIONS.map((s,i)=>({s,i})).filter(({s})=>s.unit===u);
const stationBits=i=>{const size=milestoneCount(STATIONS[i]),id=STATIONS[i]?.id;return (Object.hasOwn(state.p,id)?state.p[id]:'').padEnd(size,'0').slice(0,size);};
const rawDone=i=>[...stationBits(i)].filter(c=>c==='1').length;
const stationDone=i=>Object.hasOwn(state.dn,STATIONS[i].id)?milestoneCount(STATIONS[i]):rawDone(i);
const percent=(done,total)=>!total?0:done===total?100:Math.min(99,Math.round(100*done/total));
const stationPercent=i=>percent(stationDone(i),milestoneCount(STATIONS[i]));
const stepDone=(i,j)=>stationBits(i)[j]==='1';
const doneCount=()=>STATIONS.reduce((n,s,i)=>n+stationDone(i),0);
const overall=()=>{const p=percent(doneCount(),COUNT);return p===100&&metaCfg()&&!metaDone()?99:p;};
const unitPct=u=>{const a=ownStations(u);const p=percent(a.reduce((n,x)=>n+stationDone(x.i),0),a.reduce((n,x)=>n+milestoneCount(x.s),0));return p===100&&UNITS[u]&&UNITS[u].meta&&!metaDone()?99:p;};
const unitDone=u=>ownStations(u).filter(x=>stationDone(x.i)===milestoneCount(x.s)).length;
const completedStations=()=>STATIONS.filter((s,i)=>stationDone(i)===milestoneCount(s)).length;
const completed=()=>COUNT>0&&doneCount()===COUNT&&(!metaCfg()||metaDone());
const progressClass=p=>p===100?'completed':p>0?'progress':'pending';
function updateStep(i,j){const id=STATIONS[i].id;let bits=stationBits(i);state.p[id]=bits.slice(0,j)+'1'+bits.slice(j+1);}
function checkState(d){return !!(d&&[6,7].includes(d.v)&&d.p&&typeof d.p==='object'&&!Array.isArray(d.p)&&Object.entries(d.p).every(([k,v])=>typeof k==='string'&&/^[01]{2,80}$/.test(v))&&(d.last===null||typeof d.last==='string')&&['learn','practice','check'].includes(d.tab)&&(d.seed===undefined||d.seed===null||(Number.isInteger(d.seed)&&d.seed>=0&&d.seed<1073741824))&&(d.rd===undefined||(d.rd&&typeof d.rd==='object'&&Object.values(d.rd).every(x=>Number.isInteger(x)&&x>=0&&x<1000)))&&(d.dn===undefined||(d.dn&&typeof d.dn==='object'&&Object.values(d.dn).every(x=>x===1)))&&(d.sk===undefined||d.sk===null||(Array.isArray(d.sk)&&d.sk.length===3&&d.sk.every(x=>Number.isInteger(x)&&x>=0&&x<10000000))));}
function oldMarksValid(m){return Array.isArray(m)&&m.length===12&&m.every(r=>Array.isArray(r)&&r.length===4&&r.every(x=>typeof x==='boolean'));}
function migrateBits(m,last,tab){
 const n=emptyState();for(let i=0;i<Math.min(12,LEGACY_STATION_IDS.length);i++){
  if(m.slice(i*4,i*4+4).length!==4)continue;
  if(STATIONS.some(s=>s.id===LEGACY_STATION_IDS[i]))n.p[LEGACY_STATION_IDS[i]]=m.slice(i*4,i*4+4);
 }
 if(Number.isInteger(last)&&last>=0&&last<LEGACY_STATION_IDS.length&&STATIONS.some(s=>s.id===LEGACY_STATION_IDS[last]))n.last=LEGACY_STATION_IDS[last];
 n.tab=['learn','practice','check'].includes(tab)?tab:'learn';return n;
}
// P8 conserva IDs completos. 80 filas de 44+1+4 caracteres y separadores,
// más cabecera de 50: como máximo 4049 bytes ASCII (<4096 SCORM 1.2).
const BITS64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function serializeState(){
 const rows=STATIONS.filter(s=>Object.hasOwn(state.p,s.id)||Object.hasOwn(state.dn,s.id)).map(s=>{
  const bits=(Object.hasOwn(state.p,s.id)?state.p[s.id]:'').padEnd(milestoneCount(s),'0').slice(0,milestoneCount(s));let packed='';
  for(let i=0;i<bits.length;i+=6)packed+=BITS64[parseInt(bits.slice(i,i+6).padEnd(6,'0'),2)];
  return s.id+':'+packed+(roundOf(s)?':r'+roundOf(s):'')+(Object.hasOwn(state.dn,s.id)?':d':'');
 });
 const last=STATIONS.some(s=>s.id===state.last)?state.last:'';
 return 'P8|'+last+'|'+['learn','practice','check'].indexOf(state.tab)+(Number.isInteger(state.seed)?'|'+state.seed.toString(36):'')+(state.sk?'|k'+state.sk.map(x=>x.toString(36)).join('.'):'')+'\n'+rows.join('\n')+(state.mt&&state.mt.s?'\nM|'+state.mt.n.toString(36)+'|'+state.mt.s.toString(36)+'|'+(state.mt.e||0).toString(36)+'|'+(state.mt.a.join('')||'-')+'|'+(state.mt.b>=0?state.mt.b.toString(36):'-'):'');
}
function restoreCompact(raw){
 const lines=raw.split('\n');let mtv=null;{const mi=lines.findIndex((l,i)=>i>0&&l.startsWith('M|'));if(mi>0){const m=/^M\|([0-9a-z]{1,3})\|([0-9a-z]{1,8})\|([0-9a-z]{1,8})\|([-01]{1,80})\|([0-9a-z]{1,3}|-)$/.exec(lines[mi]);if(!m)return null;mtv={n:parseInt(m[1],36),s:parseInt(m[2],36),e:parseInt(m[3],36),a:m[4].split(''),b:m[5]==='-'?-1:parseInt(m[5],36)};lines.splice(mi,1);}}const head=/^P8\|([A-Za-z0-9_-]{2,44}|)\|([012])(?:\|([0-9a-z]{1,7}))?(?:\|k([0-9a-z]{1,6})\.([0-9a-z]{1,4})\.([0-9a-z]{1,4}))?$/.exec(lines.shift());
 if(!head||lines.length>PACEContract.maxCourseStations)return null;
 const n=emptyState();n.last=head[1]||null;n.tab=['learn','practice','check'][+head[2]];if(head[3]){const sd=parseInt(head[3],36);if(sd>=0&&sd<1073741824)n.seed=sd;}if(head[4])n.sk=[parseInt(head[4],36),parseInt(head[5],36),parseInt(head[6],36)];
 for(const line of lines){if(!line)continue;const row=/^([A-Za-z0-9_-]{2,44}):([A-Za-z0-9_-]{1,4})(?::r([0-9]{1,3}))?(:d)?$/.exec(line);if(!row||Object.hasOwn(n.p,row[1]))return null;
  n.p[row[1]]=[...row[2]].map(c=>BITS64.indexOf(c).toString(2).padStart(6,'0')).join('');if(row[3])n.rd[row[1]]=+row[3];if(row[4])n.dn[row[1]]=1;
 }n.mt=mtv;return {val:n,migrated:false};
}
function restore(raw){
 if(typeof raw==='string'&&raw.startsWith('P8|'))return restoreCompact(raw);
 try{
 const d=JSON.parse(raw);
 if(checkState(d))return {val:{...d,p:Object.assign(Object.create(null),d.p),rd:Object.assign(Object.create(null),d.rd||{}),dn:Object.assign(Object.create(null),d.dn||{}),seed:Number.isInteger(d.seed)?d.seed:null,sk:Array.isArray(d.sk)?d.sk:null,v:7},migrated:d.v!==7};
 if(d.v===4&&typeof d.m==='string'&&/^[01]{48}$/.test(d.m))return {val:migrateBits(d.m,d.last,d.tab),migrated:true};
 if(d.version===3&&oldMarksValid(d.marks))return {val:migrateBits(d.marks.flat().map(x=>x?'1':'0').join(''),-1,'learn'),migrated:true};
 if([1,2].includes(d.version)&&Array.isArray(d.answers)&&d.answers.length===3){
  const n=emptyState();for(let i=0;i<3;i++)for(let j=0;j<2;j++)if(d.answers[i]?.[j]){
   let id=LEGACY_STATION_IDS[i],bits=n.p[id]||'0000',idx=j+1;n.p[id]=bits.slice(0,idx)+'1'+bits.slice(idx+1);
  }return {val:n,migrated:true};
 }
 }catch(e){}
 return null;
}
function findApi(w){let p=w;for(let n=0;n<15;n++){try{if(p.API&&typeof p.API.LMSInitialize==='function')return p.API;}catch(e){}try{if(p.parent===p)break;p=p.parent;}catch(e){break;}}return null;}
function locateApi(){let a=findApi(window);if(a)return a;try{if(window.opener)a=findApi(window.opener);}catch(e){}return a||null;}
function get(k){try{return String(api.LMSGetValue(k)||'');}catch(e){return '';}}
function set(k,v){try{return String(api.LMSSetValue(k,String(v))).toLowerCase()==='true';}catch(e){return false;}}
function commit(){try{return String(api.LMSCommit('')).toLowerCase()==='true';}catch(e){return false;}}
function lastError(){try{return String(api.LMSGetLastError());}catch(e){return 'desconocido';}}
function sync(msg,kind){$('syncIndicator').textContent=msg;$('syncIndicator').className='sync-chip '+kind;}
function tracking(msg){$('trackingDetails').textContent=msg;}
function init(){
 api=locateApi();
 if(api){
  try{connected=String(api.LMSInitialize('')).toLowerCase()==='true';}catch(e){connected=false;}
  if(!connected){mode='error';sync('⚠ SCORM no pudo iniciar','error');tracking('Sin conexión válida: avance deshabilitado');return;}
  mode='scorm';let raw=get('cmi.suspend_data'),previousScore=get('cmi.core.score.raw');
  if(raw){let result=restore(raw);if(!result){writeBlocked=true;sync('⚠ Datos no reconocidos','error');tracking('Datos previos conservados; no se sobrescriben');return;}state=result.val;restored=true;if(state.mt&&!(Number.isInteger(state.mt.s)&&Array.isArray(state.mt.a)))state.mt=null;}
  else if(previousScore!==''&&Number.isFinite(Number(previousScore))&&Number(previousScore)>0){writeBlocked=true;sync('⚠ Faltan datos detallados','error');tracking('Hay calificación previa sin detalle; escritura bloqueada');return;}
  ensureSeed();save();return;
 }
 mode='local';
 try{
  const probe='pace_storage_test';localStorage.setItem(probe,'1');localStorage.removeItem(probe);
  const raw=localStorage.getItem(KEY)||(BUILD.scope==='curso_completo'?(localStorage.getItem(PREVIOUS_KEY)||localStorage.getItem(LEGACY_KEY)):null);
  if(raw){const res=restore(raw);if(res){state=res.val;restored=true;}}
 }catch(e){mode='preview';}
ensureSeed();
 if(mode==='preview'){
  sync('Vista previa · sin guardado permanente','local');
  tracking('Vista previa: el progreso es temporal');
 }else{
  sync('Vista local · sin SiveducMD','local');
  tracking(restored?'Progreso de demostración recuperado del navegador':'Vista local: avance guardado solo en este navegador');
 }
}
function save(){try{paintMascot()}catch(e){}
 if(mode==='error'||writeBlocked)return false;
 if(mode==='scorm'&&connected){
  let score=metaDone()?state.mt.b:overall();
  const encoded=serializeState();
  if(new TextEncoder().encode(encoded).length>PACEContract.maxSuspendBytes){sync('⚠ Límite de progreso SCORM','error');tracking('El progreso supera los 4096 bytes de cmi.suspend_data');return false;}
  const a=[set('cmi.suspend_data',encoded),set('cmi.core.score.min','0'),set('cmi.core.score.max','100'),set('cmi.core.score.raw',score),set('cmi.core.lesson_status',completed()?'completed':'incomplete'),set('cmi.core.exit','suspend')];
  let ok=commit();if(a.some(x=>!x)||!ok){sync('⚠ Guardado no confirmado','error');tracking('SCORM: error '+lastError());return false;}
  sync('✓ Progreso guardado en SiveducMD','online');tracking('Moodle: '+get('cmi.core.score.raw')+'/100 · '+get('cmi.core.lesson_status')+(restored?' · sesión recuperada':''));return true;
 }
 if(mode==='preview')return true;
 try{localStorage.setItem(KEY,JSON.stringify(state));return true;}
 catch(e){mode='preview';sync('Vista previa · avance temporal','local');tracking('El navegador no permite guardar en esta vista previa');return true;}
}
function canChange(){return mode==='local'||mode==='preview'||(mode==='scorm'&&connected&&!writeBlocked);}
function shutdown(){if(closed||!connected)return;save();try{api.LMSFinish('');}catch(e){}closed=true;connected=false;}
function showOnly(next){if(next!=='meta'){clearInterval(metaTimer);metaTimer=null;}for(let id of ['homeView','mapView','stationView','metaView'])$(id).classList.toggle('hidden',id!==next+'View');view=next;window.scrollTo({top:0,behavior:'instant'});}
function breadcrumbs(){
 let segments=[{label:'Inicio',action:()=>openHome()}];
 if(view!=='home')segments.push({label:'Unidad '+UNITS[selectedUnit].roman,action:()=>openMap(selectedUnit)});
 if(view==='station')segments.push({label:STATIONS[stationIndex].title});
 if(view==='meta')segments.push({label:'META FINAL'});
 $('breadcrumbs').innerHTML=segments.map((s,i)=>i===segments.length-1?`<span class="current">${esc(s.label)}</span>`:`<button type="button" data-bread="${i}">${esc(s.label)}</button><span aria-hidden="true">›</span>`).join('');
 $('breadcrumbs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>segments[Number(b.dataset.bread)].action()));
}
function openHome(){showOnly('home');renderHome();breadcrumbs();}
function unitStatus(){let p=overall();return p===100?'completed':p>0?'progress':'available';}
function renderHome(){paintMascot();
 const p=overall();$('homePct').textContent=p+'%';$('homeFill').style.width=p+'%';
 $('homeCount').textContent=completedStations()+' / '+STATIONS.length+' estaciones completadas';
 $('homeDisc').style.setProperty('--pct',p+'%');
 const last=state.last?STATIONS.findIndex(s=>s.id===state.last):-1;
 const first=STATIONS.findIndex((s,i)=>stationDone(i)<milestoneCount(s));
 const chosen=last>=0?last:Math.max(0,first);
 $('resumeTitle').textContent=STATIONS[chosen]?.title||'Por definir';
 $('resumeDescription').textContent=STATIONS[chosen]?'Unidad '+UNITS[STATIONS[chosen].unit].roman+' · '+stationPercent(chosen)+'% de avance':'';
 $('resumeBtn').disabled=!STATIONS.length;
 $('resumeBtn').onclick=()=>{if(STATIONS.length)openStation(chosen,state.last===STATIONS[chosen].id?state.tab:'learn');};
 $('unitsGrid').innerHTML=UNITS.map((u,i)=>{
  const avail=ownStations(i).length>0;
  const pct=unitPct(i);const status=!avail?'upcoming':pct===100?'completed':pct>0?'progress':'available';
  const note=avail?(pct===100?'Completada':pct>0?pct+'% de avance':'Lista para explorar'):'En preparación';
  const signs=UNITS.map(u=>u.icon||'◇');
  return `<button class="unit-card theme-${i} ${status}" type="button" data-unit="${i}" aria-label="Unidad ${u.roman}, ${u.title}. ${note}. Abrir mapa">
   <div class="unit-top"><span class="unit-number">UNIDAD ${u.roman}</span><span class="unit-bubble" aria-hidden="true">${signs[i]}</span></div>
   <div class="unit-main"><h3>${esc(u.title)}</h3><p>${avail?ownStations(i).length+' estaciones · '+Math.round(ownStations(i).reduce((n,x)=>n+(x.s.minutes||0),0)/60*10)/10+' h previstas':'Contenido por definir'}</p></div>
   <div class="unit-bottom"><span class="unit-status">${esc(note)}</span><strong>Ver mapa <span aria-hidden="true">↗</span></strong></div>
  </button>`;
 }).join('')+(BUILD.showWeek4?'<div class="unit-card theme-3 upcoming week4" aria-label="Semana 4 pendiente de definición"><div class="unit-top"><span class="unit-number">SEMANA 4</span><span class="unit-bubble">✦</span></div><div class="unit-main"><h3>Etapa final</h3><p>Por definir · cierre o refuerzo</p></div><div class="unit-bottom"><span class="unit-status">Sin actividades aún</span></div></div>':'');
 $('unitsGrid').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openMap(Number(b.dataset.unit))));
}
function openMap(unit,group){
 if(selectedUnit!==unit)activeGroup=-1;
 selectedUnit=unit;
 if(Number.isInteger(group)&&group>=0&&group<UNITS[unit].groups.length)activeGroup=group;
 showOnly('map');renderMap();breadcrumbs();
}
let FIN0=null;
const PHONE=window.matchMedia?matchMedia('(max-width:899px)'):{matches:false};
if(PHONE.addEventListener)PHONE.addEventListener('change',()=>{if(view==='map')renderMap();});
function renderMap(){if(FIN0===null&&$('mapFinish'))FIN0=$('mapFinish').innerHTML;
 const u=UNITS[selectedUnit];const groups=u.groups||[];const unitItems=ownStations(selectedUnit);$('mapUnitLabel').textContent='UNIDAD '+u.roman;
 $('mapTitle').innerHTML=esc(u.title)+(u.ready?'<span>.</span>':'');
 $('mapEyebrow').textContent=u.ready?'UNIDAD '+u.roman+' · MAPA DE APRENDIZAJE':'UNIDAD '+u.roman+' · EN PREPARACIÓN';
 $('mapSubtitle').textContent=u.ready?'Elige una estación.':'Contenidos pendientes de planificación.';
 $('mapSummary').classList.toggle('hidden',!u.ready);
 $('mapLegend').classList.toggle('hidden',!u.ready);
 $('mapFinish').classList.toggle('hidden',!u.ready);
 document.querySelector('.map-section-label').classList.toggle('hidden',!u.ready);
 $('mapGroupTabs').classList.add('hidden');
 if(!u.ready){
  $('route').className='route placeholder-route';
  $('route').innerHTML='<div class="soon-panel"><span class="soon-symbol" aria-hidden="true">✳</span><h2>Próximamente</h2><p>La unidad se incorporará cuando su temario esté definido.</p><span>Vuelve a las unidades para continuar.</span></div>';
  return;
 }
 const p=unitPct(selectedUnit);$('mapPercent').textContent=p+'%';$('mapCount').textContent=unitDone(selectedUnit)+' de '+unitItems.length+' completadas';$('mapFill').style.width=p+'%';
 document.querySelector('.map-section-count').textContent=groups.length+' bloques · '+unitItems.length+' estaciones';
 $('mapGroupTabs').innerHTML='';
 const cards=items=>items.map(({s,i})=>{
  const pct=stationPercent(i),cls=progressClass(pct),circ=2*Math.PI*20;
  return `<button type="button" class="route-card ${cls}" data-index="${i}" aria-label="${esc(s.title)}. ${pct} por ciento. Entrar a la estación">
    <span class="route-marker" aria-hidden="true"><b>${String(i+1).padStart(2,'0')}</b></span>
    <span class="route-copy"><strong>${esc(s.title)}</strong><small>${esc(s.subtitle)}</small></span>
    <span class="route-status"><span class="mini-ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="20" fill="none" stroke="#dce5ea" stroke-width="5"/><circle class="arc" cx="26" cy="26" r="20" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}"/></svg><b>${pct===100?'✓':pct+'%'}</b></span></span>
    <span class="route-arrow" aria-hidden="true">↗</span>
  </button>`;}).join('');
 const hints=u.hints||[];let html='';
 if(PHONE.matches&&groups.length&&(activeGroup<0||activeGroup>=groups.length)){const ls=STATIONS.findIndex(x=>x.id===state.last);activeGroup=ls>=0&&STATIONS[ls].unit===selectedUnit?STATIONS[ls].group:0;}
 groups.forEach((group,g)=>{
  const items=unitItems.filter(x=>x.s.group===g),open=activeGroup===g,num=String(g+1).padStart(2,'0');
  const done=items.filter(x=>stationDone(x.i)===milestoneCount(x.s)).length;
  html+=`<div class="current-group acc group-theme-${g%4}${open?' open':''}${items.length&&done===items.length?' all-done':''}"><button type="button" class="group-heading acc-head" data-acc="${g}" aria-expanded="${open}" aria-controls="acc-${g}" aria-label="Bloque ${num}: ${esc(group.title)}. ${done} de ${items.length} completas"><span class="group-square">${num}</span><div><span class="eyebrow">BLOQUE ${num}</span><h2>${esc(group.title)}</h2><span class="group-ratio acc-ratio">${done}/${items.length} completas</span></div><span class="acc-chev" aria-hidden="true">▾</span></button>`;
  if(open){html+=`<div class="acc-body" id="acc-${g}"><div class="acc-body-head"><span class="eyebrow">BLOQUE ${num}</span><h2>${esc(group.title)}</h2><span class="group-ratio">${done}/${items.length} completas</span></div><div class="station-list">${cards(items)}</div>`+(hints[g]?`<div class="concept-bridge"><span aria-hidden="true">↗</span>${esc(hints[g])}</div>`:'')+'</div>';}
  html+='</div>';
 });
 $('route').className='route acc-list';$('route').style.setProperty('--n',groups.length||1);if(activeGroup<0&&html)html+='<div class="acc-empty">Elige un bloque para ver sus estaciones.</div>';$('route').innerHTML=html||'<p class="hint">Esta unidad todavía no contiene estaciones.</p>';
 $('route').querySelectorAll('button[data-index]').forEach(b=>b.addEventListener('click',()=>openStation(Number(b.dataset.index))));
 $('route').querySelectorAll('.acc-head').forEach(b=>b.addEventListener('click',()=>{
  const g=Number(b.dataset.acc);activeGroup=(activeGroup===g&&!PHONE.matches)?-1:g;renderMap();
  const h=$('route').querySelector('.acc-head[data-acc="'+g+'"]');if(h){h.focus({preventScroll:true});h.scrollIntoView({block:'nearest'});}
 }));
 const MC=UNITS[selectedUnit].meta,fin=$('mapFinish');
 if(MC&&MC.minutes){const run=metaRunning(),done=metaDone();fin.classList.add('meta-on');
  fin.innerHTML=`<div class="finish-icon" aria-hidden="true"><img data-mascot alt=""></div><div><span class="eyebrow">META FINAL</span><h2>${run?'Evaluación en curso':done?'Meta final registrada':'Evaluación de la unidad'}</h2><p>${run?'Tu reloj sigue corriendo. Continúa cuando quieras.':done?'Mejor resultado: '+state.mt.b+' %. Puedes intentarlo de nuevo.':MC.minutes+' minutos · con simulacro de práctica · el reloj parte cuando tú decides.'}</p></div><button type="button" class="primary-btn" id="metaOpen">${run?'Continuar':done?'Ver META FINAL':'Conocer la META FINAL'}</button>`;
  $('metaOpen').addEventListener('click',openMeta);paintMascot();
 }else{fin.classList.remove('meta-on');if(FIN0!==null)fin.innerHTML=FIN0;
 $('finishCounter').textContent=unitDone(selectedUnit)+'/'+unitItems.length;
 $('finishTitle').textContent=p===100?'¡Unidad completada!':'Desafío integrador';
 $('finishDescription').textContent='Se incorporará con los contenidos definitivos.';}
}
function openStation(i,tab='learn'){
 selectedUnit=STATIONS[i].unit;stationIndex=i;activeTab=['learn','practice','check'].includes(tab)?tab:'learn';
 state.last=STATIONS[i].id;state.tab=activeTab;save();
 showOnly('station');renderStation();breadcrumbs();
}
function selectTab(tab){activeTab=tab;if(tab!=='explore'){state.tab=tab;save();}renderStation();}
const exShown={};
function extraList(s){return ['example2','example3','example4'].map(k=>s[k]).filter(x=>typeof x==='string'&&x.trim());}
const ownHead=t=>/^\s*[^\p{L}\p{N}$\\(\[]/u.test(String(t||''));
function exHTML(s){const L=extraList(s),n=Math.min(exShown[s.id]||0,L.length);let h=L.slice(0,n).map((t,i)=>`<div class="example ex-more">${ownHead(t)?'':`<span>EJEMPLO ${i+2}</span>`}<p class="math-content">${rich(t)}</p></div>`).join('');if(n<L.length)h+=`<button type="button" class="ex-more-btn" id="exMore">＋ Ver otro ejemplo <small>(${n+1} de ${L.length+1})</small></button>`;return h;}
function bindExMore(s){const b=$('exMore');if(!b)return;b.addEventListener('click',()=>{exShown[s.id]=(exShown[s.id]||0)+1;const w=$('exWrap');w.innerHTML=exHTML(s);typesetMath(w);const n=w.querySelectorAll('.ex-more').length;const last=w.querySelectorAll('.ex-more')[n-1];if(last&&last.scrollIntoView)last.scrollIntoView({block:'nearest',behavior:'smooth'});bindExMore(s);});}

/* Aprende visual (prototipo): tarjetas breves y ejemplo paso a paso. Se activa solo si la estación trae `learn`. */
const rb=v=>rich(v).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const lcCard=(cls,tag,body)=>`<section class="lc ${cls}"><span class="lc-tag">${tag}</span>${body}</section>`;
function lsItems(st){return (st.items||[]).map((it,i)=>{const sd=it.side&&(it.side.math||it.side.text)?`<aside class="ls-side" aria-label="Cálculo auxiliar"><span class="ls-side-t">${rb(it.side.title||'Cálculo auxiliar')}</span>${it.side.math?`<div class="ls-side-m math-content">$$${it.side.math}$$</div>`:''}${it.side.text?`<p class="ls-side-p">${rb(it.side.text)}</p>`:''}</aside>`:'';return `<li class="ls-item${sd?' has-side':''}${/^\*\*Verificaci/.test(it.why||'')?' ls-check':''}" data-i="${i}"><div class="ls-main">${it.math?`<div class="ls-math math-content">$$${it.math}$$</div>`:''}<p class="ls-why">${rb(it.why||'')}</p></div>${sd}</li>`;}).join('');}
function lsBlock(st,e,tag){const items=lsItems(st);if(!items)return '';return lcCard('lc-steps',tag,`${st.title?`<p class="ls-title math-content">${rb(st.title)}</p>`:''}<ol class="ls-list" id="lsList${e}" aria-live="polite">${items}</ol><div class="ls-nav" role="group" aria-label="Navegación del ejemplo ${e+1}"><button type="button" class="ls-btn" id="lsPrev${e}" aria-keyshortcuts="ArrowLeft">← Anterior</button><span class="ls-count" id="lsCount${e}"></span><button type="button" class="ls-btn ls-next" id="lsNext${e}" aria-keyshortcuts="ArrowRight">Siguiente paso →</button></div><div class="ls-ctl" role="group" aria-label="Más opciones del ejemplo ${e+1}"><button type="button" class="ls-btn ghost" id="lsReset${e}">↺ Reiniciar</button><button type="button" class="ls-btn ghost" id="lsAll${e}" aria-pressed="false">Mostrar todos los pasos</button><button type="button" class="ls-btn ghost" id="lsFocus${e}" aria-pressed="false">◐ Modo enfoque</button><span class="ls-keys">Teclado: ← → cambian de paso · Esc sale del enfoque</span></div>`);}
function learnHTML(s,done){const L=s.learn,st=L.steps||{items:[]},more=(Array.isArray(L.more)?L.more:[]).slice(0,3);
 const main=lsBlock(st,0,'EJEMPLO GUIADO · PASO A PASO');
 const extra=more.map((m,i)=>lsBlock(m,i+1,'EJEMPLO '+(i+2)+' · PASO A PASO')).join('');
 return (L.goal?lcCard('lc-goal','QUÉ APRENDERÁS',`<p class="math-content">${rb(L.goal)}</p>`):'')
 +lcCard('lc-idea','COMPRENDE LA IDEA',`<p class="math-content">${rb(L.idea||s.concept)}</p>`)
 +(main||`<div class="example"><p class="math-content">${rb(s.example)}</p></div>`)+extra
 +(L.warn?lcCard('lc-warn','PRESTA ATENCIÓN',`<p class="math-content">${rb(L.warn)}</p>`):'')
 +(!more.length&&extraList(s).length?`<p class="lc-more-title">PARA PROFUNDIZAR</p><div id="exWrap">${exHTML(s)}</div>`:'')
 +renderMedia(s.media||[])+`<div class="learn-finish"><button class="primary-btn" type="button" id="learnDone" ${done?'disabled':''}>${done?'✓ Explicación revisada':'Marcar como revisado'}</button><small>Actividad de muestra</small></div>`;}
function bindLearnOne(e){const list=document.getElementById('lsList'+e);if(!list)return;const its=[...list.children],n=its.length;let k=1;
 let all=false;const prev=document.getElementById('lsPrev'+e),next=document.getElementById('lsNext'+e),fb=document.getElementById('lsFocus'+e),host=document.getElementById('stationContent'),card=list.closest('.lc-steps');
 const calm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 function setFocus(on){document.querySelectorAll('.lc-steps.lc-active').forEach(c=>c.classList.remove('lc-active'));if(on)card.classList.add('lc-active');host.classList.toggle('lfocus',on);fb.setAttribute('aria-pressed',String(on));fb.textContent=on?'◐ Salir del enfoque':'◐ Modo enfoque';if(on)keepCur();}
 function keepCur(){const li=its[k-1];if(li&&li.scrollIntoView)li.scrollIntoView({block:'center',behavior:calm?'auto':'smooth'});}
 function show(){its.forEach((li,i)=>{li.classList.toggle('on',i<k);li.classList.toggle('fut',!all&&i>=k);li.classList.toggle('cur',!all&&i===k-1);});list.classList.toggle('showall',all);{const b=document.getElementById('lsAll'+e);b.textContent=all?'Volver al paso a paso':'Mostrar todos los pasos';b.setAttribute('aria-pressed',String(all));}prev.disabled=k<=1;next.disabled=k>=n;{const ct=document.getElementById('lsCount'+e);ct.innerHTML='<span class="ls-bar" aria-hidden="true"><i style="width:'+Math.round(100*k/n)+'%"></i></span><span class="ls-pn" aria-hidden="true"><span class="pn-l">Paso '+k+' de '+n+'</span><span class="pn-s">'+k+'/'+n+'</span></span>';ct.setAttribute('aria-label','Paso '+k+' de '+n);ct.setAttribute('role','status');}if(k>=n)next.textContent='Ejemplo completo ✓';else next.textContent='Siguiente paso →';}
 function go(d){const m=k+d;if(m<1||m>n)return;k=m;show();setFocus(true);}
 prev.onclick=()=>go(-1);next.onclick=()=>go(1);
 fb.onclick=()=>setFocus(!(host.classList.contains('lfocus')&&card.classList.contains('lc-active')));
 document.getElementById('lsReset'+e).onclick=()=>{k=1;all=false;show();setFocus(false);};
 document.getElementById('lsAll'+e).onclick=()=>{all=!all;if(all)setFocus(false);show();};
 host.addEventListener('click',ev=>{if(host.classList.contains('lfocus')&&card.classList.contains('lc-active')&&!ev.target.closest('.lc-active'))setFocus(false);});
 document.addEventListener('keydown',function esc(ev){if(!document.getElementById('lsList'+e)){document.removeEventListener('keydown',esc);return;}if(ev.key==='Escape'&&card.classList.contains('lc-active'))setFocus(false);});
 show();}
let lsKeyAct=0;
function lsPickEx(){const cs=[...document.querySelectorAll('.lc-steps')];if(!cs.length)return null;const y=innerHeight/2;let best=null,bd=1e9;cs.forEach(c=>{const r=c.getBoundingClientRect(),d=y<r.top?r.top-y:y>r.bottom?y-r.bottom:0;if(d<bd){bd=d;best=c;}});return best;}
function bindLearn(){for(let e=0;e<4;e++)bindLearnOne(e);
 if(window.__lsKey)document.removeEventListener('keydown',window.__lsKey);
 window.__lsKey=function(ev){if(!document.getElementById('lsList0')){document.removeEventListener('keydown',window.__lsKey);window.__lsKey=null;return;}
  if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
  const t=ev.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  const c=lsPickEx();if(!c)return;const btn=c.querySelector(ev.key==='ArrowRight'?'.ls-next':'.ls-nav .ls-btn:not(.ls-next)');if(btn&&!btn.disabled){ev.preventDefault();btn.click();}};
 document.addEventListener('keydown',window.__lsKey);}
function renderStation(){paintMascot();$('stationContent').classList.remove('lfocus');document.body.classList.remove('ex-big-on');{const x=document.getElementById('exClose');if(x)x.remove();}
 let s=STATIONS[stationIndex],p=stationPercent(stationIndex);
 $('stationNo').textContent=String(stationIndex+1).padStart(2,'0');$('stationTitle').textContent=s.title;$('stationSub').textContent=s.subtitle;
 $('stationView').dataset.pose=String(s.group%4);$('stationBlock').textContent='BLOQUE '+String(s.group+1).padStart(2,'0')+' · '+(UNITS[s.unit].groups[s.group]?.title||'');
 $('stationPct').textContent=p+'%';$('stationPct').className='station-pct '+progressClass(p);
 $('stationCount').textContent=Object.hasOwn(state.dn,s.id)?'Repaso · ronda '+(roundOf(s)+1)+': '+rawDone(stationIndex)+' de '+milestoneCount(s)+' actividades (tu avance ya está completo)':stationDone(stationIndex)+' de '+milestoneCount(s)+' actividades completadas';$('stationFill').style.width=p+'%';
 $('learnTick').textContent=stepDone(stationIndex,0)?'✓':'';
 $('practiceTick').textContent=Array.from({length:drawCount(s)}).every((q,j)=>stepDone(stationIndex,1+j))?'✓':'';
 $('checkTick').textContent=Array.from({length:checkCount(s)}).every((q,j)=>stepDone(stationIndex,1+drawCount(s)+j))?'✓':'';
 if(activeTab==='explore'&&!hasExplore(s))activeTab='learn';$('tab-explore').hidden=!hasExplore(s);$('stationTabs').classList.toggle('has-explore',hasExplore(s));
 $('stationTabs').querySelectorAll('button').forEach(b=>{let active=b.dataset.tab===activeTab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
 $('stationFeedback').textContent='';
 if(activeTab==='learn'){
  const done=stepDone(stationIndex,0);
  if(s.learn){$('stationContent').innerHTML=`<span class="eyebrow">01 / APRENDE</span><h2>${esc(s.title)}</h2>${learnHTML(s,done)}`;if(!done)$('learnDone').addEventListener('click',()=>mark(0));bindExMore(s);bindLearn();}else{
  $('stationContent').innerHTML=`<span class="eyebrow">01 / APRENDE · LECTURA BREVE</span><h2>La idea esencial</h2><p class="math-content">${rich(s.concept)}</p><div class="example">${ownHead(s.example)?'':`<span>EJEMPLO${extraList(s).length?' 1':''}</span>`}<p class="math-content">${rich(s.example)}</p></div><div id="exWrap">${exHTML(s)}</div>${renderMedia(s.media||[])}<div class="learn-finish"><button class="primary-btn" type="button" id="learnDone" ${done?'disabled':''}>${done?'✓ Explicación revisada':'Marcar como revisado'}</button><small>Actividad de muestra</small></div>`;
  if(!done)$('learnDone').addEventListener('click',()=>mark(0));
  bindExMore(s);}
 }else if(activeTab==='explore'){
  renderExplore(s);
 }else if(activeTab==='practice'){
  $('stationContent').innerHTML=`<span class="eyebrow">02 / PRACTICA</span><h2>Resuelve los ejercicios</h2><p>Elige una respuesta. Puedes volver a intentarlo.</p>${drawnIndices(s).map((bi,j)=>renderQuiz(s.practice[bi],j+1,'EJERCICIO '+(j+1))).join('')}`;
 }else{
  $('stationContent').innerHTML=`<span class="eyebrow">03 / APLICA · CIENCIAS</span><h2>Aplica lo aprendido</h2><p>Resuelve una situación en contexto.</p>${drawnChecks(s).map((bi,j)=>renderQuiz(checkBank(s)[bi],1+drawCount(s)+j,checkCount(s)>1?'DESAFÍO '+(j+1):'DESAFÍO')).join('')}`;
 }
 if(activeTab!=='learn'&&activeTab!=='explore'&&canRedo(stationIndex)){$('stationContent').insertAdjacentHTML('beforeend','<div class="learn-finish"><button class="primary-btn" type="button" id="redoBtn">↻ Practicar otra ronda</button><small>Es otra ronda del banco de ejercicios: puede que veas alguno que ya resolviste. Tu avance acumulado se mantiene y el resultado de esta ronda no lo reduce.</small></div>');$('redoBtn').addEventListener('click',redo);}
 $('stationContent').querySelectorAll('button[data-answer]').forEach(b=>b.addEventListener('click',()=>answer(b)));$('stationContent').querySelectorAll('.typed').forEach(bindTyped);typesetMath($('stationContent'));
}
/* EXPLORA (opcional por estación, no suma avance): s.explore={title,desc,instr,alt,height,html|url}. Nunca se guarda en el estado ni en SCORM. */
function hasExplore(s){const e=s&&s.explore;return !!(e&&typeof e==='object'&&((typeof e.html==='string'&&e.html.trim())||(typeof e.url==='string'&&/^https:\/\//.test(e.url))));}
function renderExplore(s){const e=s.explore,host=$('stationContent');
 const body=(typeof e.html==='string'&&e.html.trim())?`<iframe class="ex-frame" id="exFrame" title="${esc(e.title||'Explora')}" sandbox="allow-scripts" loading="lazy" style="height:${Math.min(900,Math.max(240,Number(e.height)||520))}px"></iframe><div class="ls-ctl"><button type="button" class="ls-btn ghost" id="exReset">↺ Reiniciar recurso</button><button type="button" class="ls-btn ghost" id="exBig" aria-pressed="false">⤢ Vista ampliada</button></div>`
  :`<p><a class="primary-btn ex-link" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">Abrir el recurso en otra pestaña ↗</a></p><p class="ex-note">Necesita conexión a internet.</p>`;
 host.innerHTML=`<span class="eyebrow">✦ EXPLORA · OPCIONAL</span><h2>${esc(e.title||'Explora')}</h2>${e.desc?`<p class="math-content">${rb(e.desc)}</p>`:''}<div class="ex-note" role="note"><b>Esto no cuenta para tu avance.</b> Juega libremente: no hay notas ni respuestas correctas o incorrectas.</div>${e.instr?`${lcCard('lc-idea','QUÉ PUEDES HACER',`<p class="math-content">${rb(e.instr)}</p>`)}`:''}${body}${e.alt?`<details class="ex-alt"><summary>Descripción para quien no pueda usar el recurso</summary><p class="math-content">${rb(e.alt)}</p></details>`:''}`;
 const fr=$('exFrame');if(fr){window.onmessage=ev=>{const f=$('exFrame');if(f&&ev.source===f.contentWindow&&ev.data&&ev.data.pace==='explora-h'){const h=Number(ev.data.h);if(h>=200&&h<=1600)f.style.height=Math.ceil(h)+6+'px';}};fr.srcdoc=e.html;$('exReset').onclick=()=>{fr.srcdoc='';setTimeout(()=>{fr.srcdoc=e.html;},30);};
 const big=on=>{fr.classList.toggle('ex-big',on);document.body.classList.toggle('ex-big-on',on);$('exBig').setAttribute('aria-pressed',String(on));$('exBig').textContent=on?'✕ Cerrar vista ampliada':'⤢ Vista ampliada';let x=document.getElementById('exClose');if(on&&!x){x=document.createElement('button');x.id='exClose';x.type='button';x.className='ex-close';x.textContent='✕ Cerrar vista ampliada';x.onclick=()=>big(false);document.body.appendChild(x);x.focus();}if(!on&&x)x.remove();};
 $('exBig').onclick=()=>big(!fr.classList.contains('ex-big'));
 document.addEventListener('keydown',function escx(ev){if(!document.getElementById('exFrame')){document.body.classList.remove('ex-big-on');const x=document.getElementById('exClose');if(x)x.remove();document.removeEventListener('keydown',escx);return;}if(ev.key==='Escape'&&fr.classList.contains('ex-big'))big(false);});}
 typesetMath(host);}
function renderQuiz(q,step,label){let done=stepDone(stationIndex,step);if(q&&q.type==='input')return renderTyped(q,step,label,done);return `<article class="quiz ${done?'done':''}" data-step="${step}"><div class="quiz-head"><span>${esc(label)}</span><span>${done?'✓ Resuelto':'Por resolver'}</span></div><h3 class="math-content">${rich(q.q)}</h3><div class="choices">${q.options.map((o,k)=>`<button type="button" data-answer="${k}" class="${done&&k===q.correct?'correct':''}" ${done?'disabled':''}>${rich(o)}</button>`).join('')}</div><p class="feedback ${done?'correct':''}" role="status" aria-live="polite">${done?'✓ '+rich(q.why):''}</p></article>`;}
function questionAt(step){const st=STATIONS[stationIndex],dp=drawCount(st);return step>dp?checkBank(st)[drawnChecks(st)[step-dp-1]]:st.practice[drawnIndices(st)[step-1]];}
function renderTyped(q,step,label,done){
 const T=PACETyped;let body;
 if(done){let t='';try{t=T.answerTex(q);}catch(e){}body=`<div class="typed-done"><span>Respuesta:</span> <b class="math-content">${rich('\\('+t+'\\)')}</b></div>`;}
 else body=`<div class="typed" data-kind="${esc(q.kind)}"><div class="typed-row"><input class="typed-input" type="text" inputmode="none" enterkeyhint="done" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Escribe tu respuesta" placeholder="Escribe tu respuesta"><button type="button" class="primary-btn typed-check">Comprobar</button></div><div class="typed-preview math-content" aria-hidden="true"></div><div class="keypad" role="group" aria-label="Teclado matemático">${T.keys(q.kind).map(k=>`<button type="button" class="key${k[1]==='@del'?' key-del':''}" data-key="${esc(k[1]||k[0])}"${k[1]==='@del'?' aria-label="Borrar"':''}>${esc(k[0])}</button>`).join('')}</div><small class="typed-hint">${esc(T.hint(q))}</small></div>`;
 return `<article class="quiz typed-quiz ${done?'done':''}" data-step="${step}"><div class="quiz-head"><span>${esc(label)}</span><span>${done?'✓ Resuelto':'Por resolver'}</span></div><h3 class="math-content">${rich(q.q)}</h3>${body}<p class="feedback ${done?'correct':''}" role="status" aria-live="polite">${done?'✓ '+rich(q.why):''}</p></article>`;}
function typedInsert(inp,k){const a=inp.selectionStart==null?inp.value.length:inp.selectionStart,b=inp.selectionEnd==null?a:inp.selectionEnd;
 if(k==='@del'){if(a!==b)inp.setRangeText('',a,b,'end');else if(a>0)inp.setRangeText('',a-1,a,'end');}else inp.setRangeText(k,a,b,'end');}
function bindTyped(box){
 const art=box.closest('.quiz'),inp=box.querySelector('.typed-input'),prev=box.querySelector('.typed-preview'),pad=box.querySelector('.keypad'),kind=box.dataset.kind;let tm=null;
 const upd=()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=PACETyped.previewTex(kind,inp.value);
  if(window.MathJax&&MathJax.typesetClear)MathJax.typesetClear([prev]);
  if(t===''||t===null){prev.textContent=t===null?inp.value:'';prev.classList.toggle('bad',t===null);}
  else{prev.classList.remove('bad');prev.innerHTML='\\('+t+'\\)';typesetMath(prev);}},120);};
 inp.addEventListener('input',upd);
 pad.addEventListener('mousedown',e=>e.preventDefault());
 pad.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;typedInsert(inp,b.dataset.key);inp.focus();upd();});
 box.querySelector('.typed-check').addEventListener('click',()=>checkTyped(art,inp));
 inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkTyped(art,inp);}});}
function checkTyped(art,inp){const step=Number(art.dataset.step);if(stepDone(stationIndex,step))return;
 const q=questionAt(step),r=PACETyped.check(q,inp.value);
 if(r.state==='ok'){mark(step);return;}
 const el=art.querySelector('.feedback');el.textContent=r.msg;el.className='feedback incorrect';inp.focus();}
function answer(b){const box=b.closest('.quiz');let step=Number(box.dataset.step);if(stepDone(stationIndex,step))return;
 const q=questionAt(step);
 if(Number(b.dataset.answer)===q.correct)mark(step);
 else{let el=box.querySelector('.feedback');el.textContent='Todavía no. Revisa el procedimiento e inténtalo nuevamente.';el.className='feedback incorrect';}
}
const canRedo=i=>hasDraw(STATIONS[i])&&rawDone(i)===milestoneCount(STATIONS[i]);
function redo(){const s=STATIONS[stationIndex];if(!canRedo(stationIndex))return;
 if(!canChange()){$('stationFeedback').textContent='La conexión SCORM no está disponible. No se puede iniciar otra ronda.';return;}
 const bits=stationBits(stationIndex);state.dn[s.id]=1;state.rd[s.id]=roundOf(s)+1;state.p[s.id]=bits[0]+'0'.repeat(milestoneCount(s)-1);
 activeTab='practice';state.tab='practice';const ok=save();renderStation();$('stationFeedback').textContent=ok?'↻ Nueva ronda del banco. Tu avance acumulado se mantiene.':'⚠ No se confirmó el guardado del progreso.';window.scrollTo({top:0,behavior:'instant'});}
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/864e5);
function streakNow(){const sk=state.sk,t=dayNum();if(!sk)return {n:0,best:0,today:false,alive:false};if(sk[0]===t)return {n:sk[1],best:sk[2],today:true,alive:true};if(sk[0]===t-1)return {n:sk[1],best:sk[2],today:false,alive:true};return {n:0,best:sk[2],today:false,alive:false};}
function bumpStreak(){const t=dayNum(),sk=state.sk;if(sk&&sk[0]===t)return false;const n=sk&&sk[0]===t-1?sk[1]+1:1;state.sk=[t,n,Math.max(n,sk?sk[2]:0)];return true;}
function renderStreak(){const el=$('streakChip');if(!el)return;const s=streakNow(),d=n=>n+(n===1?' día':' días');
 el.className='streak-chip'+(s.today?' on':s.alive?' risk':'');
 if(s.n>0){el.innerHTML='<b aria-hidden="true">🔥</b> <strong>'+d(s.n)+'</strong><span class="streak-extra">'+(s.today?(s.n>1?' seguidos':''):' · ¡suma hoy!')+'</span>';}
 else el.innerHTML='<b aria-hidden="true">🔥</b> <span class="streak-extra">Empieza tu racha</span>';
 const tip=s.n>0?('Racha: '+d(s.n)+' seguidos. '+(s.today?'Hoy ya sumaste.':'Completa una actividad hoy para mantenerla.')):'Completa una actividad hoy para iniciar tu racha.';
 el.title=tip+(s.best>0?' Mejor racha: '+d(s.best)+'.':'');el.setAttribute('aria-label',el.title);}
function mark(step){
 if(stepDone(stationIndex,step))return;
 if(!canChange()){$('stationFeedback').textContent='La conexión SCORM no está disponible. No se registra avance.';return;}
 updateStep(stationIndex,step);const up=bumpStreak();let ok=save();renderStation();renderStreak();$('stationFeedback').textContent=ok?'✓ Avance actualizado.'+(up?' 🔥 Racha: '+streakNow().n+(streakNow().n===1?' día.':' días seguidos.'):''):'⚠ No se confirmó el guardado del progreso.';
}
/* ===== META FINAL · evaluación cronometrada (prototipo) =====
 * Dos modalidades: «Simulacro» (reloj que no cierra, no se guarda) y «Oficial» (120 min, se cierra, se registra el mejor intento).
 * Estado oficial en suspend_data: línea  M|n|inicio|fin|respuestas|mejor  (n = intento, respuestas: '-' sin responder, '1' bien, '0' mal). */
const metaCfg=()=>{const u=UNITS.find(x=>x&&x.meta&&x.meta.minutes);return u?u.meta:null;};
const metaSecs=()=>((metaCfg()&&metaCfg().minutes)||120)*60;
const nowSec=()=>Math.floor(Date.now()/1000);
const metaDone=()=>!!(state.mt&&state.mt.b>=0);
const metaRunning=()=>!!(state.mt&&state.mt.s&&!state.mt.e);
const metaCount=a=>a.filter(c=>c==='1').length;
const metaPct=a=>a.length?Math.round(100*metaCount(a)/a.length):0;
const mmss=t=>{t=Math.max(0,Math.floor(t));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return (h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(s).padStart(2,'0');};
const metaQCache={};
function metaQs(salt,min){
 const M0=metaCfg();if(min&&M0&&min<M0.minutes){const key=salt+'|'+state.seed+'|'+min;if(metaQCache[key])return metaQCache[key];return metaQCache[key]=metaSub(metaQs(salt),min,M0.minutes,salt);}
 const key=salt+'|'+state.seed;if(metaQCache[key])return metaQCache[key];
 const M=metaCfg(),mix=(M&&M.mix)||[2,3,'a'],out=[];
 STATIONS.forEach(s=>{
  const r=rng(((state.seed||0)^hashStr(s.id+'M'+salt))>>>0);
  const by=[[],[],[]];s.practice.forEach(q=>by[lvlOf(q)-1].push(q));
  const used=new Set(),all=s.practice.slice();
  const take=L=>{const c=L.filter(q=>!used.has(q));if(!c.length)return null;const q=c[Math.floor(r()*c.length)];used.add(q);return q;};
  mix.forEach(m=>{let q=null;if(m==='a'){const ap=checkBank(s).filter(x=>x);q=ap[Math.floor(r()*ap.length)]||null;}else q=take(by[m-1])||take(all);if(q)out.push({sid:s.id,st:s.title,q});});
 });
 return metaQCache[key]=out;}
/* Simulacro más corto: n = preguntas proporcionales al tiempo; se reparten entre todas las estaciones (una por estación en cada vuelta) */
function metaSub(full,min,total,salt){
 const n=Math.max(4,Math.min(full.length,Math.round(full.length*min/total)));
 const ids=[...new Set(full.map(x=>x.sid))],r=rng(((state.seed||0)^hashStr('SUB'+salt+min))>>>0);
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 const by={};full.forEach(x=>(by[x.sid]=by[x.sid]||[]).push(x));
 const pick=new Set();
 for(const round of [0,2,1]){for(const id of ids){if(pick.size>=n)break;const q=by[id][round];if(q)pick.add(q);}}
 for(const id of ids){for(const q of by[id]){if(pick.size<n)pick.add(q);}}
 return full.filter(x=>pick.has(x));}
const META_OPTS=[20,30,40,60,120];let metaPracMin=60;
const metaOptN=m=>metaQs('PV',m).length;
let metaMode='off',metaPhase='hub',metaIdx=0,metaTimer=null,metaPrac=null,metaConfirm=false;const metaVals={};
function metaSess(){
 if(metaMode==='prac'&&metaPrac)return {mode:'prac',qs:metaQs(metaPrac.salt,metaPrac.min),a:metaPrac.a,s:metaPrac.s,e:metaPrac.e,n:0,secs:metaPrac.min*60};
 if(state.mt)return {mode:'off',qs:metaQs('O'+state.mt.n),a:state.mt.a,s:state.mt.s,e:state.mt.e,n:state.mt.n};
 return null;}
function metaPersist(){if(metaMode==='off'){const ok=save();if(!ok)$('mtMsg')&&($('mtMsg').textContent='⚠ No se confirmó el guardado de tu respuesta.');}}
function metaRemaining(S){return (S.secs||metaSecs())-(nowSec()-S.s);}
function metaFinish(auto){
 const S=metaSess();if(!S||S.e)return;
 if(S.mode==='off'){const total=metaSecs(),end=Math.min(nowSec(),S.s+total);state.mt.e=end;const sc=metaPct(state.mt.a);if(sc>state.mt.b)state.mt.b=sc;save();}
 else{metaPrac.e=nowSec();}
 metaPhase='res';metaConfirm=false;metaNote=auto?'El tiempo terminó: la evaluación se cerró y se entregó con tus respuestas guardadas.':'';
 if(view==='meta')renderMeta();}
let metaNote='';const metaWarned={};
function metaExpiryCheck(){if(metaRunning()&&metaRemaining({s:state.mt.s})<=0)metaFinish(true);}
function openMeta(){selectedUnit=Math.max(0,UNITS.findIndex(u=>u&&u.meta));metaExpiryCheck();metaPhase='hub';metaConfirm=false;showOnly('meta');renderMeta();breadcrumbs();}
function metaStartOff(){
 if(!canChange()){$('mtMsg').textContent='La conexión SCORM no está disponible. No se puede iniciar.';return;}
 const prev=state.mt,n=prev?(prev.e?prev.n+1:prev.n):0,b=prev?prev.b:-1,N=metaQs('O'+n).length;
 state.mt={n,s:nowSec(),e:0,a:Array(N).fill('-'),b};
 if(!save()){state.mt=prev;$('mtMsg').textContent='⚠ No se pudo guardar el inicio. Revisa la conexión e inténtalo de nuevo.';return;}
 metaMode='off';metaPhase='run';metaIdx=0;metaNote='';for(const k in metaVals)delete metaVals[k];renderMeta();}
function metaStartPrac(){
 const salt='P'+Math.floor(Math.random()*1e9),min=metaPracMin,N=metaQs(salt,min).length;
 metaPrac={salt,min,s:nowSec(),e:0,a:Array(N).fill('-')};metaMode='prac';metaPhase='run';metaIdx=0;metaNote='';for(const k in metaVals)delete metaVals[k];renderMeta();}
function metaResume(){metaMode='off';metaPhase='run';metaIdx=0;renderMeta();}
function metaClock(){
 const S=metaSess();if(!S||S.e||metaPhase!=='run'||view!=='meta'){clearInterval(metaTimer);metaTimer=null;return;}
 const rem=metaRemaining(S),el=$('mtClock'),bar=$('mtBar');if(!el)return;
 if(S.mode==='off'&&rem<=0){metaFinish(true);return;}
 el.textContent=rem>=0?mmss(rem):'+'+mmss(-rem);
 bar.classList.toggle('warn',rem<=600&&rem>0);bar.classList.toggle('over',rem<=0);
 $('mtLbl').textContent=rem>=0?'Tiempo restante':'Tiempo extra (el simulacro no se cierra)';
 for(const mk of [1800,600,300,60]){const k=S.mode+S.s+':'+mk;if(rem<=mk&&rem>mk-6&&!metaWarned[k]){metaWarned[k]=1;$('mtAlert').textContent=mk>60?'Quedan '+(mk/60)+' minutos.':'Queda 1 minuto.';$('mtAlert').classList.add('on');setTimeout(()=>{const x=$('mtAlert');if(x)x.classList.remove('on');},7000);}}
}
function metaTimerStart(){clearInterval(metaTimer);metaClock();metaTimer=setInterval(metaClock,1000);}
function metaQHTML(S){
 const it=S.qs[metaIdx],q=it.q,ans=S.a[metaIdx],saved=ans!=='-';
 const head=`<div class="quiz-head"><span>PREGUNTA ${metaIdx+1} DE ${S.qs.length}</span><span class="mt-saved ${saved?'on':''}" id="mtSaved">${saved?'✓ Respuesta guardada':'Sin responder'}</span></div>`;
 if(q.type==='input'){
  let h=renderTyped(q,0,'PREGUNTA '+(metaIdx+1)+' DE '+S.qs.length,false);
  h=h.replace('Comprobar','Guardar respuesta').replace('Por resolver',saved?'✓ Respuesta guardada':'Sin responder').replace('<span>'+(saved?'✓ Respuesta guardada':'Sin responder')+'</span>','<span class="mt-saved'+(saved?' on':'')+'" id="mtSaved">'+(saved?'✓ Respuesta guardada':'Sin responder')+'</span>');
  return h.replace(/<p class="feedback[^>]*><\/p>/,'<p class="feedback" id="mtFb" role="status" aria-live="polite"></p>');}
 const sel=metaVals[S.mode+S.n+':'+metaIdx];
 return `<article class="quiz" data-meta="1">${head}<h3 class="math-content">${rich(q.q)}</h3><div class="choices">${q.options.map((o,k)=>`<button type="button" data-mk="${k}" class="${sel===k?'sel':''}">${rich(o)}</button>`).join('')}</div><p class="feedback" id="mtFb" role="status" aria-live="polite"></p></article>`;}
function metaSetAns(S,ch){S.a[metaIdx]=ch;const sv=$('mtSaved');if(sv){sv.textContent='✓ Respuesta guardada';sv.classList.add('on');}metaPalette(S);metaPersist();}
function metaPalette(S){const p=$('mtPal');if(!p)return;p.innerHTML=S.qs.map((x,i)=>`<button type="button" class="mt-dot ${S.a[i]!=='-'?'ans':''} ${i===metaIdx?'cur':''}" data-go="${i}" aria-label="Pregunta ${i+1}${S.a[i]!=='-'?', respondida':', sin responder'}">${i+1}</button>`).join('');p.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{metaIdx=+b.dataset.go;metaConfirm=false;renderMeta();window.scrollTo({top:0,behavior:'instant'});}));
 const left=S.a.filter(c=>c==='-').length;const cnt=$('mtCount');if(cnt)cnt.textContent=(S.a.length-left)+' de '+S.a.length+' respondidas';}
function metaBindQ(S){
 const root=$('metaBody'),it=S.qs[metaIdx],q=it.q;
 if(q.type==='input'){
  const box=root.querySelector('.typed'),inp=box.querySelector('.typed-input'),prev=box.querySelector('.typed-preview'),pad=box.querySelector('.keypad'),kind=box.dataset.kind;let tm=null;
  const key=S.mode+S.n+':'+metaIdx;if(metaVals[key])inp.value=metaVals[key];
  const upd=()=>{metaVals[key]=inp.value;clearTimeout(tm);tm=setTimeout(()=>{const t=PACETyped.previewTex(kind,inp.value);if(window.MathJax&&MathJax.typesetClear)MathJax.typesetClear([prev]);if(t===''||t===null){prev.textContent=t===null?inp.value:'';prev.classList.toggle('bad',t===null);}else{prev.classList.remove('bad');prev.innerHTML='\\('+t+'\\)';typesetMath(prev);}},120);};
  inp.addEventListener('input',upd);pad.addEventListener('mousedown',e=>e.preventDefault());
  pad.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;typedInsert(inp,b.dataset.key);inp.focus();upd();});
  const save1=()=>{const r=PACETyped.check(q,inp.value);if(r.state==='empty'||r.state==='invalid'){$('mtFb').textContent=r.state==='empty'?'Escribe tu respuesta antes de guardarla.':r.msg;$('mtFb').className='feedback incorrect';return;}$('mtFb').textContent='';metaVals[key]=inp.value;metaSetAns(S,r.state==='ok'?'1':'0');if(r.state==='reduce'){$('mtFb').textContent='Respuesta guardada, pero aún no está simplificada: así se contará incorrecta. Puedes corregirla antes de terminar.';$('mtFb').className='feedback incorrect';}};
  box.querySelector('.typed-check').addEventListener('click',save1);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save1();}});
  if(metaVals[key])upd();
 }else{
  root.querySelectorAll('button[data-mk]').forEach(b=>b.addEventListener('click',()=>{const k=Number(b.dataset.mk);metaVals[S.mode+S.n+':'+metaIdx]=k;root.querySelectorAll('button[data-mk]').forEach(x=>x.classList.toggle('sel',x===b));metaSetAns(S,k===q.correct?'1':'0');}));}}
function metaRunHTML(S){
 const last=metaIdx===S.qs.length-1,left=S.a.filter(c=>c==='-').length;
 return `<div class="mt-bar" id="mtBar"><div><span class="mt-lbl" id="mtLbl">Tiempo restante</span><b class="mt-clock" id="mtClock">--:--</b></div><div class="mt-mode">${S.mode==='off'?'EVALUACIÓN OFICIAL':'SIMULACRO · no se registra'}</div></div><div class="mt-alert" id="mtAlert" role="status" aria-live="polite"></div>
 <div class="mt-layout"><div id="metaBody" class="mt-q"><span class="eyebrow">${esc(S.qs[metaIdx].st)}</span>${metaQHTML(S)}
 <div class="mt-nav"><button type="button" class="ls-btn" id="mtPrev" ${metaIdx===0?'disabled':''}>← Anterior</button><button type="button" class="ls-btn ls-next" id="mtNext" ${last?'disabled':''}>Siguiente →</button></div></div>
 <aside class="mt-side" aria-label="Preguntas"><div class="mt-sidehead"><b>Tus preguntas</b><span id="mtCount"></span></div><div class="mt-pal" id="mtPal"></div>
 <div class="mt-submit">${metaConfirm?`<p class="mt-warn">${left?`Te faltan <b>${left}</b> pregunta${left===1?'':'s'} por responder. `:''}¿Entregar ahora? No podrás cambiar tus respuestas.</p><div class="mt-row"><button type="button" class="primary-btn" id="mtYes">Sí, entregar</button><button type="button" class="ls-btn ghost" id="mtNo">Seguir revisando</button></div>`:`<button type="button" class="primary-btn" id="mtDeliver">Entregar evaluación</button>`}<p id="mtMsg" class="mt-msg" role="status" aria-live="polite"></p></div></aside></div>`;}
function metaHubHTML(){
 const M=metaCfg(),N=metaQs(state.mt?'O'+(state.mt.e?state.mt.n+1:state.mt.n):'O0').length,min=M.minutes,mt=state.mt;
 const att=mt?(mt.n+(mt.e?1:0)):0,run=metaRunning(),left=run?metaRemaining({s:mt.s}):0,all=STATIONS.every((s,i)=>stationDone(i)===milestoneCount(s));
 const ready=all?'':`<p class="mt-soft">Te recomendamos completar primero las ${STATIONS.length} estaciones. Aún no estás obligado a hacerlo para entrar.</p>`;
 return `<div class="mt-hero"><span class="eyebrow">META FINAL</span><h1>Evaluación de la unidad</h1><p>Mide lo que aprendiste en las ${STATIONS.length} estaciones: <b>${N} preguntas</b> pensadas para <b>${min} minutos</b>. Puedes intentarlo cuantas veces quieras.</p>${ready}</div>
 <div class="mt-cards"><section class="mt-card mt-prac"><span class="lc-tag">SIMULACRO</span><h2>Practica con reloj</h2><p class="mt-optlbl" id="mtOptLbl">Elige cuánto tiempo quieres practicar:</p><div class="mt-opts" role="radiogroup" aria-labelledby="mtOptLbl">${META_OPTS.map(m=>`<button type="button" role="radio" aria-checked="${m===metaPracMin}" class="mt-opt${m===metaPracMin?' on':''}" data-min="${m}"><b>${m} min</b><small>${metaOptN(m)} preguntas</small></button>`).join('')}</div><ul><li>Se arma una evaluación acorde al tiempo elegido, con preguntas de todas las estaciones.</li><li>El reloj corre, pero <b>no se cierra</b>: si pasas de los ${metaPracMin} minutos sigues y ves tu tiempo extra.</li><li>Las preguntas se sortean distintas cada vez.</li><li><b>El resultado no se guarda</b> ni se envía a SiveducMD.</li></ul><button type="button" class="ls-btn ls-next" id="mtPrac">Comenzar simulacro de ${metaPracMin} min</button></section>
 <section class="mt-card mt-off"><span class="lc-tag">OFICIAL</span><h2>META FINAL oficial</h2>${run?`<p class="mt-run">Tienes una evaluación <b>en curso</b>. Tiempo restante: <b id="mtHubLeft">${mmss(left)}</b>.</p><button type="button" class="primary-btn" id="mtResume">Continuar evaluación</button>`:`<ul><li><b>${min} minutos</b>. El reloj comienza <b>cuando tú aprietas «Comenzar»</b> y <b>no se detiene</b> aunque salgas o cierres la ventana.</li><li>Al terminar el tiempo la evaluación <b>se cierra sola</b> y se entrega con las respuestas que alcanzaste a guardar.</li><li>Puedes cambiar tus respuestas hasta entregar. No verás si son correctas hasta el final.</li><li>Cada intento trae preguntas distintas. Se registra en SiveducMD <b>tu mejor resultado</b>.</li><li>No aprueba ni reprueba: el curso se completa al entregar tu primer intento oficial.</li></ul><label class="mt-check"><input type="checkbox" id="mtOk"> Entendí cómo funciona y quiero comenzar ahora.</label><button type="button" class="primary-btn" id="mtGo" disabled>Comenzar evaluación oficial</button>`}
 ${mt&&mt.b>=0?`<p class="mt-hist">Intentos entregados: <b>${att}</b> · Mejor resultado: <b>${mt.b} %</b>${mt.e?` · <button type="button" class="linklike" id="mtLast">Ver último intento</button>`:''}</p>`:''}<p id="mtMsg" class="mt-msg" role="status"></p></section></div>`;}
function metaResHTML(S){
 const c=metaCount(S.a),N=S.a.length,pct=metaPct(S.a),used=Math.min(S.e-S.s,(S.secs||metaSecs())+(S.mode==='prac'?99999:0));
 const by={};S.qs.forEach((x,i)=>{(by[x.sid]=by[x.sid]||{t:x.st,c:0,n:0,d:[]});by[x.sid].n++;if(S.a[i]==='1')by[x.sid].c++;by[x.sid].d.push(S.a[i]);});
 const rows=Object.values(by).map(r=>`<tr><td>${esc(r.t)}</td><td class="mt-dots">${r.d.map(d=>`<i class="d${d}" title="${d==='1'?'Correcta':d==='0'?'Incorrecta':'Sin responder'}"></i>`).join('')}</td><td><b>${r.c}/${r.n}</b></td></tr>`).join('');
 const T=PACETyped;
 const rev=S.qs.map((x,i)=>{const q=x.q,st=S.a[i];let corr='';if(q.type==='input'){let t='';try{t=T.answerTex(q);}catch(e){}corr='\\('+t+'\\)';}else corr=q.options[q.correct];
  return `<details class="mt-rev ${st==='1'?'ok':st==='0'?'bad':'no'}"><summary><span class="mt-mark">${st==='1'?'✓':st==='0'?'✗':'–'}</span> Pregunta ${i+1} · ${esc(x.st)}</summary><div class="mt-revbody"><p class="math-content">${rich(q.q)}</p><p><b>Respuesta correcta:</b> <span class="math-content">${rich(corr)}</span></p>${st!=='1'&&q.solution?`<div class="mt-dev"><b>Desarrollo:</b><ol class="mt-devlist">${String(q.solution).split(/\n+/).filter(x=>x.trim()).map(x=>`<li class="math-content">${rich(x)}</li>`).join('')}</ol></div>`:`<p class="math-content">${st!=='1'?'<b>Retroalimentación:</b> ':''}${rich(q.why||'')}</p>`}</div></details>`;}).join('');
 const reg=S.mode==='off'?`<p class="mt-regok">✓ Resultado registrado${state.mt&&state.mt.b===pct?'. Es tu mejor resultado hasta ahora.':'. Tu mejor resultado registrado es '+state.mt.b+' %.'}</p><p class="mt-soft">No aprueba ni reprueba: ${completed()?'¡completaste el curso!':'completa también todas las estaciones para terminar el curso.'}</p>`:`<p class="mt-regno">Este fue un simulacro: el resultado <b>no se guarda</b>.</p>`;
 return `<div class="mt-hero"><span class="eyebrow">${S.mode==='off'?'META FINAL OFICIAL · RESULTADO':'SIMULACRO · RESULTADO'}</span>${metaNote?`<p class="mt-timeup">${esc(metaNote)}</p>`:''}<div class="mt-score"><strong>${pct}%</strong><span>${c} de ${N} correctas</span><span>Tiempo usado: ${mmss(used)}${S.mode==='prac'&&used>(S.secs||metaSecs())?' (pasaste el tiempo previsto)':''}</span></div>${reg}</div>
 <section class="lc lc-steps"><span class="lc-tag">POR ESTACIÓN</span><table class="mt-table"><tbody>${rows}</tbody></table><p class="mt-soft"><i class="d1"></i> correcta <i class="d0"></i> incorrecta <i class="d-"></i> sin responder</p></section>
 <section class="lc"><span class="lc-tag">REVISA TUS PREGUNTAS</span><div class="mt-revlist">${rev}</div></section>
 <div class="mt-row"><button type="button" class="primary-btn" id="mtAgain">Hacer otro intento</button><button type="button" class="ls-btn ghost" id="mtHub">Volver a la META FINAL</button></div>`;}
function renderMeta(){
 const root=$('metaView');if(!metaCfg()){root.innerHTML='';return;}
 const S=metaPhase==='hub'?null:metaSess();
 if(metaPhase!=='hub'&&!S)metaPhase='hub';
 if(metaPhase==='hub'){clearInterval(metaTimer);metaTimer=null;root.innerHTML='<div class="mt-wrap">'+metaHubHTML()+'</div>';
  const ok=$('mtOk');if(ok)ok.addEventListener('change',()=>{$('mtGo').disabled=!ok.checked;});
  if($('mtGo'))$('mtGo').addEventListener('click',metaStartOff);if($('mtPrac'))$('mtPrac').addEventListener('click',metaStartPrac);root.querySelectorAll('.mt-opt').forEach(b=>b.addEventListener('click',()=>{metaPracMin=Number(b.dataset.min);renderMeta();const nb=root.querySelector('.mt-opt.on');if(nb)nb.focus();}));if($('mtResume'))$('mtResume').addEventListener('click',metaResume);
  if($('mtLast'))$('mtLast').addEventListener('click',()=>{metaMode='off';metaPhase='res';renderMeta();});
  if(metaRunning()){clearInterval(metaTimer);metaTimer=setInterval(()=>{const el=$('mtHubLeft');if(!el||view!=='meta'||metaPhase!=='hub'){clearInterval(metaTimer);return;}const r=metaRemaining({s:state.mt.s});if(r<=0){metaFinish(true);return;}el.textContent=mmss(r);},1000);}
 }else if(metaPhase==='run'){
  root.innerHTML='<div class="mt-wrap">'+metaRunHTML(S)+'</div>';metaPalette(S);metaBindQ(S);
  $('mtPrev').addEventListener('click',()=>{if(metaIdx>0){metaIdx--;metaConfirm=false;renderMeta();window.scrollTo({top:0,behavior:'instant'});}});
  $('mtNext').addEventListener('click',()=>{if(metaIdx<S.qs.length-1){metaIdx++;metaConfirm=false;renderMeta();window.scrollTo({top:0,behavior:'instant'});}});
  if($('mtDeliver'))$('mtDeliver').addEventListener('click',()=>{metaConfirm=true;renderMeta();});
  if($('mtYes'))$('mtYes').addEventListener('click',()=>metaFinish(false));if($('mtNo'))$('mtNo').addEventListener('click',()=>{metaConfirm=false;renderMeta();});
  typesetMath(root);metaTimerStart();
 }else{
  clearInterval(metaTimer);metaTimer=null;root.innerHTML='<div class="mt-wrap">'+metaResHTML(S)+'</div>';
  $('mtAgain').addEventListener('click',()=>{metaMode==='prac'?metaStartPrac():(metaPhase='hub',renderMeta());});$('mtHub').addEventListener('click',()=>{metaPhase='hub';renderMeta();});
  typesetMath(root);window.scrollTo({top:0,behavior:'instant'});}
 paintMascot();}

$('backHome').addEventListener('click',openHome);
$('bottomHome').addEventListener('click',openHome);
$('backMap').addEventListener('click',()=>openMap(STATIONS[stationIndex].unit,STATIONS[stationIndex].group));
const backToMap=()=>{save();openMap(STATIONS[stationIndex].unit,STATIONS[stationIndex].group);};
$('returnToMap').addEventListener('click',backToMap);$('floatBack').addEventListener('click',backToMap);
$('stationTabs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.tab)));
window.addEventListener('pagehide',shutdown);window.addEventListener('beforeunload',shutdown);
(function(){var b=document.createElement('button');b.type='button';b.id='goUp';b.className='go-up';b.setAttribute('aria-label','Volver al inicio de la página');b.title='Volver arriba';b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';document.body.appendChild(b);
var t=0;function upd(){t=0;b.classList.toggle('on',window.scrollY>600);}
window.addEventListener('scroll',function(){if(!t)t=requestAnimationFrame(upd);},{passive:true});
b.addEventListener('click',function(){var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;window.scrollTo({top:0,behavior:rm?'auto':'smooth'});var h=document.querySelector('h1,h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}});upd();})();
init();metaExpiryCheck();renderStreak();openHome();
