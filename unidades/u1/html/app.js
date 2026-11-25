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
const rxOf=s=>(state&&state.rx&&state.rx[s.id])||{};const roundP=s=>roundOf(s)+(rxOf(s).p|0);const roundC=s=>roundOf(s)+(rxOf(s).c|0);
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
/* Sorteo estratificado por modalidad (23-11-2026, propuesta de Henry):
   · Practica: se mantienen las cuotas por nivel (p. ej. 2·2·1). Dentro de cada nivel, mitad alternativas (A) y mitad escritas (E).
     Si la cuota de un nivel es impar, la pregunta extra alterna de modalidad entre rondas: 3A+2E en la ronda 1, 2A+3E en la ronda 2, etc.
   · Aplica: 1 A + 1 E cuando se sortean 2.
   · Cada subbanco (nivel, modalidad) se baraja con la semilla del estudiante y se recorre sin repetir hasta agotarse,
     con desplazamientos acumulados por ronda. Si una modalidad ya dio una vuelta completa y la otra no, se usa la otra
     antes de repetir (así un subbanco pequeño no se repite antes de tiempo).
   · Si falta una modalidad, se completa con la otra del mismo nivel. Nunca bloquea. */
function stratDraw(s,items,gOf,quota,salt,round){
 const G=quota.length,sub={};
 items.forEach((q,i)=>{const g=gOf(q),m=q&&q.type==='input'?'E':'A';(sub[g+m]=sub[g+m]||[]).push(i);});
 if(Number.isInteger(state.seed))for(const k in sub){const L=sub[k],r=rng((state.seed^hashStr(s.id+salt+k))>>>0);for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]];}}
 const n={},u={};for(let g=0;g<G;g++){n[g+'A']=(sub[g+'A']||[]).length;n[g+'E']=(sub[g+'E']||[]).length;u[g+'A']=0;u[g+'E']=0;}
 let out=[];
 for(let rd=0;rd<=round;rd++){out=[];let odd=0;
  for(let g=0;g<G;g++){const k=quota[g]||0,h=Math.floor(k/2);let a=h,e=h;if(k%2){((rd+odd)%2===0)?a++:e++;odd++;}
   const want=[];const first=rd%2?'E':'A',second=first==='A'?'E':'A';const cnt={A:a,E:e};
   for(let t=0;t<k;t++){const m=(t%2===0?first:second);if(cnt[m]>0){want.push(m);cnt[m]--;}else{const o=m==='A'?'E':'A';want.push(o);cnt[o]--;}}
   const inRound={A:0,E:0};
   for(const m0 of want){const o0=m0==='A'?'E':'A';let m=m0;const K=x=>g+x,pass=x=>n[K(x)]?Math.floor(u[K(x)]/n[K(x)]):1e9;
    if(!n[K(m)]||inRound[m]>=n[K(m)]||(n[K(o0)]&&inRound[o0]<n[K(o0)]&&pass(m)>pass(o0)))m=o0;
    if(!n[K(m)]||inRound[m]>=n[K(m)])continue;
    out.push(sub[K(m)][u[K(m)]%n[K(m)]]);u[K(m)]++;inRound[m]++;}
  }}
 return out;}
function drawnIndices(s){
 const n=s.practice.length,d=drawCount(s);
 if(!hasLevels(s)){if(d>=n)return [...Array(n).keys()];return stratDraw(s,s.practice,()=>0,[d],'N',roundP(s));}
 const by=[[],[],[]];s.practice.forEach((q,i)=>by[lvlOf(q)-1].push(i));
 if(d>=n)return by[0].concat(by[1],by[2]);
 return stratDraw(s,s.practice,q=>lvlOf(q)-1,levelQuota(d,by.map(x=>x.length)),'L',roundP(s));}

const drawnChecks=s=>{const B=checkBank(s),n=B.length,d=checkCount(s);if(d>=n)return [...Array(n).keys()];return stratDraw(s,B,()=>0,[d],'#c',roundC(s)).sort((x,y)=>x-y);};
function ensureSeed(){if(!Number.isInteger(state.seed)&&STATIONS.some(hasDraw))state.seed=Math.floor(Math.random()*1073741824);}
const COUNT=STATIONS.reduce((v,s)=>v+milestoneCount(s),0);
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=v=>PACEText.html(v);
function typesetMath(el){if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([el]).catch(()=>{});}
function renderMedia(items){return items.map(m=>{const cap=m.caption?'<figcaption>'+esc(m.caption)+'</figcaption>':'';if(m.type==='image')return '<figure class="media-box"><img loading="lazy" src="'+esc(m.src)+'" alt="'+esc(m.caption||'Imagen del contenido')+'">'+cap+'</figure>';if(m.type==='video_file')return '<figure class="media-box"><video controls preload="metadata" src="'+esc(m.src)+'"></video>'+cap+'</figure>';if(m.type==='pdf')return '<div class="media-link">📄 <a href="'+esc(m.src)+'" target="_blank" rel="noopener noreferrer">Abrir PDF</a> '+esc(m.caption||'')+'</div>';if(m.type==='video_url')return '<div class="media-link">▶ <a href="'+esc(m.src)+'" target="_blank" rel="noopener noreferrer">Ver video</a> '+esc(m.caption||'')+'</div>';return '';}).join('');}
const emptyState=()=>({v:7,p:Object.create(null),last:null,tab:'learn',seed:null,rd:Object.create(null),dn:Object.create(null),sk:null,mts:{}});
let state=emptyState();
let api=null,connected=false,mode='local',writeBlocked=false,restored=false,closed=false;
let view='home',selectedUnit=0,stationIndex=0,activeTab='learn',activeGroup=-1;
const ownStations=u=>STATIONS.map((s,i)=>({s,i})).filter(({s})=>s.unit===u);
const stationBits=i=>{const size=milestoneCount(STATIONS[i]),id=STATIONS[i]?.id;return (Object.hasOwn(state.p,id)?state.p[id]:'').padEnd(size,'0').slice(0,size);};
const rawDone=i=>[...stationBits(i)].filter(c=>c==='1').length;
const stationDone=i=>{const s=STATIONS[i];if(Object.hasOwn(state.dn,s.id))return milestoneCount(s);const x=(state.rx&&state.rx[s.id])||{};if(!x.P&&!x.C)return rawDone(i);const b=stationBits(i),dp=drawCount(s),cnt=t=>[...t].filter(c=>c==='1').length;return (b[0]==='1'?1:0)+(x.P?dp:cnt(b.slice(1,1+dp)))+(x.C?checkCount(s):cnt(b.slice(1+dp)));};
const percent=(done,total)=>!total?0:done===total?100:Math.min(99,Math.round(100*done/total));
const stationPercent=i=>percent(stationDone(i),milestoneCount(STATIONS[i]));
const stepDone=(i,j)=>stationBits(i)[j]==='1';
const doneCount=()=>STATIONS.reduce((n,s,i)=>n+stationDone(i),0);
const overall=()=>{const p=percent(doneCount(),COUNT);return p===100&&metaUnits().some(u=>!metaDoneU(u))?99:p;};
const unitPct=u=>{const a=ownStations(u);const p=percent(a.reduce((n,x)=>n+stationDone(x.i),0),a.reduce((n,x)=>n+milestoneCount(x.s),0));return p===100&&UNITS[u]&&UNITS[u].meta&&!metaDoneU(u)?99:p;};
const unitDone=u=>ownStations(u).filter(x=>stationDone(x.i)===milestoneCount(x.s)).length;
const completedStations=()=>STATIONS.filter((s,i)=>stationDone(i)===milestoneCount(s)).length;
const completed=()=>COUNT>0&&doneCount()===COUNT&&metaUnits().every(metaDoneU);
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
 return 'P8|'+last+'|'+['learn','practice','check'].indexOf(state.tab)+(Number.isInteger(state.seed)?'|'+state.seed.toString(36):'')+(state.sk?'|k'+state.sk.map(x=>x.toString(36)).join('.'):'')+'\n'+rows.join('\n')+Object.keys(state.mts||{}).filter(u=>state.mts[u]&&state.mts[u].s).sort().map(u=>{const m=state.mts[u];return '\nM'+u+'|'+m.n.toString(36)+'|'+m.s.toString(36)+'|'+(m.e||0).toString(36)+'|'+(m.a.join('')||'-')+'|'+(m.b>=0?m.b.toString(36):'-');}).join('');
}
function restoreCompact(raw){
 const lines=raw.split('\n');let mtv={};for(let mi=1;mi<lines.length;){if(/^M\d*\|/.test(lines[mi])){const m=/^M(\d*)\|([0-9a-z]{1,3})\|([0-9a-z]{1,8})\|([0-9a-z]{1,8})\|([-01]{1,120})\|([0-9a-z]{1,3}|-)$/.exec(lines[mi]);if(!m)return null;mtv[m[1]===''?String(Math.max(0,UNITS.findIndex(x=>x&&x.meta&&x.meta.minutes))):m[1]]={n:parseInt(m[2],36),s:parseInt(m[3],36),e:parseInt(m[4],36),a:m[5].split(''),b:m[6]==='-'?-1:parseInt(m[6],36)};lines.splice(mi,1);}else mi++;}const head=/^P8\|([A-Za-z0-9_-]{2,44}|)\|([012])(?:\|([0-9a-z]{1,7}))?(?:\|k([0-9a-z]{1,6})\.([0-9a-z]{1,4})\.([0-9a-z]{1,4}))?$/.exec(lines.shift());
 if(!head||lines.length>PACEContract.maxCourseStations)return null;
 const n=emptyState();n.last=head[1]||null;n.tab=['learn','practice','check'][+head[2]];if(head[3]){const sd=parseInt(head[3],36);if(sd>=0&&sd<1073741824)n.seed=sd;}if(head[4])n.sk=[parseInt(head[4],36),parseInt(head[5],36),parseInt(head[6],36)];
 for(const line of lines){if(!line)continue;const row=/^([A-Za-z0-9_-]{2,44}):([A-Za-z0-9_-]{1,4})(?::r([0-9]{1,3}))?(:d)?$/.exec(line);if(!row||Object.hasOwn(n.p,row[1]))return null;
  n.p[row[1]]=[...row[2]].map(c=>BITS64.indexOf(c).toString(2).padStart(6,'0')).join('');if(row[3])n.rd[row[1]]=+row[3];if(row[4])n.dn[row[1]]=1;
 }n.mts=mtv;return {val:n,migrated:false};
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
  if(raw){let result=restore(raw);if(!result){writeBlocked=true;sync('⚠ Datos no reconocidos','error');tracking('Datos previos conservados; no se sobrescriben');return;}state=result.val;restored=true;if(!state.mts)state.mts={};for(const k of Object.keys(state.mts)){const t=state.mts[k];if(!(t&&Number.isInteger(t.s)&&Array.isArray(t.a)))delete state.mts[k];}}
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
  let score=(metaUnits().length&&metaUnits().every(metaDoneU))?Math.round(metaUnits().reduce((s,u)=>s+state.mts[u].b,0)/metaUnits().length):overall();
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
function showOnly0(next){if(next!=='meta'){clearInterval(metaTimer);metaTimer=null;}for(let id of ['homeView','mapView','stationView','metaView','cierreView','diagView'])$(id).classList.toggle('hidden',id!==next+'View');view=next;window.scrollTo({top:0,behavior:'instant'});}
function breadcrumbs(){
 let segments=[{label:'Unidades',action:()=>openHome()}];
 if(view!=='home')segments.push({label:'Unidad '+UNITS[selectedUnit].roman,action:()=>openMap(selectedUnit)});
 if(view==='station')segments.push({label:STATIONS[stationIndex].title});
 if(view==='meta')segments.push({label:'META FINAL'});
 if(view==='cierre')segments.push({label:'Cierre del bloque'});
 if(view==='diag')segments.push({label:'Antes de empezar'});
 $('breadcrumbs').innerHTML=segments.map((s,i)=>i===segments.length-1?`<span class="current">${esc(s.label)}</span>`:`<button type="button" data-bread="${i}">${esc(s.label)}</button><span aria-hidden="true">›</span>`).join('');
 $('breadcrumbs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>segments[Number(b.dataset.bread)].action()));
}
function openHome(){paceSub('curso');showOnly('home');renderHome();breadcrumbs();}
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
  const nT=ownStations(i).length,nD=ownStations(i).filter(x=>stationDone(x.i)===milestoneCount(x.s)).length;const note=avail?(pct===100?'Completada · '+nT+' de '+nT+' estaciones':pct>0?'En curso · '+nD+' de '+nT+' estaciones':'No iniciada · 0 de '+nT+' estaciones'):'En preparación';
  const signs=UNITS.map(u=>u.icon||'◇');
  return `<button class="unit-card theme-${i} ${status}" type="button" data-unit="${i}" aria-label="Unidad ${u.roman}, ${u.title}. ${note}. Abrir mapa">
   <div class="unit-top"><span class="unit-number">UNIDAD ${u.roman}</span><span class="unit-bubble" aria-hidden="true">${signs[i]}</span></div>
   <div class="unit-main"><h3>${esc(u.title)}</h3><p>${avail?ownStations(i).length+' estaciones · '+String(Math.round(ownStations(i).reduce((n,x)=>n+(x.s.minutes||0),0)/60*10)/10).replace('.',',')+' h previstas':'Contenido por definir'}</p></div>
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
    <span class="route-marker" aria-hidden="true"><b>${String(stLocal(i)).padStart(2,'0')}</b></span>
    <span class="route-copy"><strong>${esc(s.title)}</strong><small>${esc(s.subtitle)}</small></span>
    <span class="route-status"><span class="mini-ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="20" fill="none" stroke="#dce5ea" stroke-width="5"/><circle class="arc" cx="26" cy="26" r="20" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}"/></svg><b>${pct===100?'✓':pct+'%'}</b></span></span>
    <span class="route-arrow" aria-hidden="true">↗</span>
  </button>`;}).join('');
 const hints=u.hints||[];let html='';
 if(groups.length&&(activeGroup<0||activeGroup>=groups.length)){const ls=STATIONS.findIndex(x=>x.id===state.last);if(ls>=0&&STATIONS[ls].unit===selectedUnit)activeGroup=STATIONS[ls].group;else{const f=unitItems.find(x=>stationDone(x.i)<milestoneCount(x.s));activeGroup=f?f.s.group:0;}}
 groups.forEach((group,g)=>{
  const items=unitItems.filter(x=>x.s.group===g),open=activeGroup===g,num=String(g+1).padStart(2,'0');
  const done=items.filter(x=>stationDone(x.i)===milestoneCount(x.s)).length;
  html+=`<div class="current-group acc group-theme-${g%4}${open?' open':''}${items.length&&done===items.length?' all-done':''}"><button type="button" class="group-heading acc-head" data-acc="${g}" aria-expanded="${open}" aria-controls="acc-${g}" aria-label="Bloque ${num}: ${esc(group.title)}. ${done} de ${items.length} completas"><span class="group-square">${num}</span><div><span class="eyebrow">BLOQUE ${num}</span><h2>${esc(group.title)}</h2><span class="group-ratio acc-ratio">${done}/${items.length} completas</span></div><span class="acc-chev" aria-hidden="true">▾</span></button>`;
  if(open){html+=`<div class="acc-body" id="acc-${g}"><div class="acc-body-head"><span class="eyebrow">BLOQUE ${num}</span><h2>${esc(group.title)}</h2><span class="group-ratio">${done}/${items.length} completas</span></div><div class="station-list">${cards(items)}</div>${cierreCard(g,items)}`+(hints[g]?`<div class="concept-bridge"><span aria-hidden="true">↗</span>${esc(hints[g])}</div>`:'')+'</div>';}
  html+='</div>';
 });
 $('route').className='route acc-list';$('route').style.setProperty('--n',groups.length||1);if(activeGroup<0&&html)html+='<div class="acc-empty">Elige un bloque para ver sus estaciones.</div>';$('route').innerHTML=html||'<p class="hint">Esta unidad todavía no contiene estaciones.</p>';
 $('route').querySelectorAll('button[data-index]').forEach(b=>b.addEventListener('click',()=>openStation(Number(b.dataset.index))));
 $('route').querySelectorAll('.acc-head').forEach(b=>b.addEventListener('click',()=>{
  const g=Number(b.dataset.acc);activeGroup=g;renderMap();
  const h=$('route').querySelector('.acc-head[data-acc="'+g+'"]');if(h){h.focus({preventScroll:true});h.scrollIntoView({block:'nearest'});}
 }));
 mu=selectedUnit;const MC=UNITS[selectedUnit].meta,fin=$('mapFinish');
 if(MC&&MC.minutes){const run=metaRunning(),done=metaDone();fin.classList.add('meta-on');
  fin.innerHTML=`<div class="finish-icon" aria-hidden="true"><img data-mascot alt=""></div><div><span class="eyebrow">META FINAL</span><h2>${run?'Evaluación en curso':done?'Meta final registrada':'Evaluación de la unidad'}</h2><p>${run?'Tu reloj sigue corriendo. Continúa cuando quieras.':done?'Mejor resultado: '+MT().b+' %. Puedes intentarlo de nuevo.':MC.minutes+' minutos · con simulacro de práctica · el reloj parte cuando tú decides.'}</p></div><button type="button" class="primary-btn" id="metaOpen">${run?'Continuar':done?'Ver META FINAL':'Conocer la META FINAL'}</button>`;
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
function lsItems(st){return (st.items||[]).map((it,i)=>{const sd=it.side&&(it.side.title||it.side.math||it.side.text)?`<aside class="ls-side" aria-label="Cálculo auxiliar"><span class="ls-side-t">${rb(it.side.title||(it.side.math?'Cálculo auxiliar':''))}</span>${it.side.math?`<div class="ls-side-m math-content">$$${it.side.math}$$</div>`:''}${it.side.text?`<p class="ls-side-p">${rb(it.side.text)}</p>`:''}</aside>`:'';return `<li class="ls-item${sd?' has-side':''}${/^\*\*Verificaci/.test(it.why||'')?' ls-check':''}" data-i="${i}"><div class="ls-main">${it.math?`<div class="ls-math math-content">$$${it.math}$$</div>`:''}${(it.why||'').trim()?`<p class="ls-why">${rb(it.why)}</p>`:''}</div>${sd}</li>`;}).join('');}
function lsBlock(st,e,tag){const items=lsItems(st);if(!items)return '';let rotOff=false;try{rotOff=sessionStorage.getItem('pace_rot')==='1';}catch(_){}const hasSide=(st.items||[]).some(it=>it.side&&(it.side.title||it.side.math||it.side.text));return lcCard('lc-steps',tag,`${hasSide&&!rotOff?'<p class="ls-rot" role="note"><span>Consejo: gira el teléfono para ver el desarrollo y el cálculo auxiliar en paralelo.</span><button type="button" class="ls-rot-x" aria-label="Cerrar el consejo">×</button></p>':''}${st.title?`<p class="ls-title math-content">${rb(st.title)}</p>`:''}<ol class="ls-list" id="lsList${e}" aria-live="polite">${items}</ol><div class="ls-nav" role="group" aria-label="Navegación del ejemplo ${e+1}"><button type="button" class="ls-btn" id="lsPrev${e}" aria-keyshortcuts="ArrowLeft">← Anterior</button><span class="ls-count" id="lsCount${e}"></span><button type="button" class="ls-btn ls-next" id="lsNext${e}" aria-keyshortcuts="ArrowRight">Siguiente paso →</button></div><div class="ls-ctl" role="group" aria-label="Más opciones del ejemplo ${e+1}"><button type="button" class="ls-btn ghost" id="lsReset${e}">↺ Reiniciar</button><button type="button" class="ls-btn ghost" id="lsAll${e}" aria-pressed="false">Mostrar todos los pasos</button><button type="button" class="ls-btn ghost" id="lsFocus${e}" aria-pressed="false">◐ Modo enfoque</button><span class="ls-keys">Teclado: ← → cambian de paso · Esc sale del enfoque</span></div>`);}
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
function renderStation0(){paintMascot();$('stationContent').classList.remove('lfocus');document.body.classList.remove('ex-big-on');{const x=document.getElementById('exClose');if(x)x.remove();}
 let s=STATIONS[stationIndex],p=stationPercent(stationIndex);
 $('stationNo').textContent=stLabel(stationIndex);$('stationTitle').textContent=s.title;$('stationSub').textContent=s.subtitle;
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
 else body=`<div class="typed" data-kind="${esc(q.kind)}"><div class="typed-row"><input class="typed-input" type="text" inputmode="none" enterkeyhint="done" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Escribe tu respuesta" placeholder="Escribe tu respuesta"><button type="button" class="primary-btn typed-check">Comprobar</button></div><div class="typed-preview math-content" aria-hidden="true"></div><div class="keypad" role="group" aria-label="Teclado matemático">${zsKeys(T.keys(q.kind)).map(k=>`<button type="button" class="key${k[1]==='@del'?' key-del':''}" data-key="${esc(k[1]||k[0])}"${k[1]==='@del'?' aria-label="Borrar"':''}>${esc(k[0])}</button>`).join('')}</div><small class="typed-hint">${esc(T.hint(q))}</small></div>`;
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
 if(r.state!=='empty'&&r.state!=='invalid'){const st=STATIONS[stationIndex];reportInt(step>drawCount(st)?'A':'P',st,q,inp.value,r.state==='ok');window.chuReact&&chuReact(r.state==='ok');}
 if(r.state==='ok'){mark(step);return;}
 const el=art.querySelector('.feedback');el.textContent=r.msg;el.className='feedback incorrect';inp.focus();}
function answer(b){const box=b.closest('.quiz');let step=Number(box.dataset.step);if(stepDone(stationIndex,step))return;
 const q=questionAt(step);
 {const st=STATIONS[stationIndex];reportInt(step>drawCount(st)?'A':'P',st,q,b.dataset.answer,Number(b.dataset.answer)===q.correct);window.chuReact&&chuReact(Number(b.dataset.answer)===q.correct);}
 if(Number(b.dataset.answer)===q.correct)mark(step);
 else{let el=box.querySelector('.feedback'),k=Number(b.dataset.answer),f=Array.isArray(q.fb)?q.fb[k]:'';if(f){el.innerHTML='Todavía no. '+rich(f);typesetMath(el);}else el.textContent='Todavía no. Revisa el procedimiento e inténtalo nuevamente.';el.className='feedback incorrect';b.classList.add('tried');}
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
/* Interacciones SCORM 1.2: una fila por respuesta (id, tipo, respuesta, correcta, resultado) para el informe de Interacciones de Moodle. */
let intN=-1,intTimer=null;
function reportInt(kind,s,q,resp,ok){try{
 if(mode!=='scorm'||!connected||writeBlocked||!q||!s)return;
 if(intN<0){const c=parseInt(get('cmi.interactions._count'),10);intN=Number.isFinite(c)&&c>=0?c:0;}
 if(intN>=2000){if(typeof mjIntFull==='function')mjIntFull();return;}
 const n=intN++,p='cmi.interactions.'+n+'.',choice=Array.isArray(q.options),L=k=>String.fromCharCode(97+k);
 const id=s.id+'.'+kind+'.'+hashStr(String(q.q)).toString(36);
 let sr='';
 if(kind==='D'&&resp==='?'){sr='?';}else if(choice){const k=(resp===undefined||resp===null||resp==='')?NaN:Number(resp);sr=Number.isInteger(k)&&k>=0&&k<26?L(k):(ok&&Number.isInteger(q.correct)?L(q.correct):'');}
 else sr=String(resp==null?'':resp).replace(/[\r\n]+/g,' ').trim().slice(0,250);
 const cr=choice?(Number.isInteger(q.correct)?L(q.correct):''):String(q.answer==null?'':q.answer).replace(/[\r\n]+/g,' ').slice(0,250);
 set(p+'id',id);set(p+'time',new Date().toTimeString().slice(0,8));set(p+'type',choice?'choice':'fill-in');
 if(cr!=='')set(p+'correct_responses.0.pattern',cr);
 set(p+'weighting','1');if(sr!=='')set(p+'student_response',sr);set(p+'result',(kind==='D'&&resp==='?')?'neutral':(ok?'correct':'wrong'));
 clearTimeout(intTimer);intTimer=setTimeout(commit,1500);
}catch(e){}}
function mark(step){
 if(stepDone(stationIndex,step))return;
 if(!canChange()){$('stationFeedback').textContent='La conexión SCORM no está disponible. No se registra avance.';return;}
 updateStep(stationIndex,step);const up=bumpStreak();let ok=save();renderStation();renderStreak();$('stationFeedback').textContent=ok?'✓ Avance actualizado.'+(up?' 🔥 Racha: '+streakNow().n+(streakNow().n===1?' día.':' días seguidos.'):''):'⚠ No se confirmó el guardado del progreso.';
}
/* ===== META FINAL · evaluación cronometrada (prototipo) =====
 * Dos modalidades: «Simulacro» (reloj que no cierra, no se guarda) y «Oficial» (120 min, se cierra, se registra el mejor intento).
 * Estado oficial en suspend_data: línea  M|n|inicio|fin|respuestas|mejor  (n = intento, respuestas: '-' sin responder, '1' bien, '0' mal). */
let mu=Math.max(0,UNITS.findIndex(x=>x&&x.meta&&x.meta.minutes));
const metaUnits=()=>UNITS.map((u,i)=>u&&u.meta&&u.meta.minutes?i:-1).filter(i=>i>=0);
const MT=()=>(state.mts&&state.mts[mu])||null;
const setMT=v=>{if(!state.mts)state.mts={};if(v)state.mts[mu]=v;else delete state.mts[mu];};
const metaDoneU=u=>!!(state.mts&&state.mts[u]&&state.mts[u].b>=0);
const metaCfg=()=>{const x=UNITS[mu];return x&&x.meta&&x.meta.minutes?x.meta:null;};
const metaSecs=()=>((metaCfg()&&metaCfg().minutes)||120)*60;
const nowSec=()=>Math.floor(Date.now()/1000);
const metaDone=()=>metaDoneU(mu);
const metaRunning=()=>!!(MT()&&MT().s&&!MT().e);
const metaCount=a=>a.filter(c=>c==='1').length;
const metaPct=a=>a.length?Math.round(100*metaCount(a)/a.length):0;
const mmss=t=>{t=Math.max(0,Math.floor(t));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return (h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(s).padStart(2,'0');};
const metaQCache={};
function metaQs(salt,min){
 const M0=metaCfg();if(min&&M0&&min<M0.minutes){const key=salt+'|'+state.seed+'|U'+mu+'|'+min;if(metaQCache[key])return metaQCache[key];return metaQCache[key]=metaSub(metaQs(salt),min,M0.minutes,salt);}
 const key=salt+'|'+state.seed+'|U'+mu;if(metaQCache[key])return metaQCache[key];
 const M=metaCfg(),mix=(M&&M.mix)||[2,'x'],out=[];
 STATIONS.filter(s=>s.unit===mu).forEach((s,si)=>{
  const r=rng(((state.seed||0)^hashStr(s.id+'M'+salt))>>>0);
  const by=[[],[],[]];s.practice.forEach(q=>by[lvlOf(q)-1].push(q));
  const used=new Set(),all=s.practice.slice();
  const take=L=>{const c=L.filter(q=>!used.has(q));if(!c.length)return null;const q=c[Math.floor(r()*c.length)];used.add(q);return q;};
  mix.forEach((m0,k)=>{const m=m0==='x'?(si%2===0?3:'a'):m0,want=((k===0?si:(si>>1)+1)%2===0)?'A':'E',isW=x=>x&&(x.type==='input'?'E':'A')===want;let q=null;if(m==='a'){const ap=checkBank(s).filter(x=>x),pr=ap.filter(isW),src=pr.length?pr:ap;q=src[Math.floor(r()*src.length)]||null;}else if(m===2&&typeof dgQ==='function'&&['0','?'].includes((state.dg||{})[s.id])&&dgQ(s))q=dgQ(s);else q=take(by[m-1].filter(isW))||take(by[m-1])||take(all);if(q)out.push({sid:s.id,st:s.title,q});});
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
const META_OPTS=[20,30,40,60];let metaPracMin=60;
const metaOptN=m=>metaQs('PV',m).length;
let metaMode='off',metaPhase='hub',metaIdx=0,metaTimer=null,metaPrac=null,metaConfirm=false;const metaVals={};
function metaSess(){
 if(metaMode==='prac'&&metaPrac)return {mode:'prac',qs:metaQs(metaPrac.salt,metaPrac.min),a:metaPrac.a,s:metaPrac.s,e:metaPrac.e,n:0,secs:metaPrac.min*60};
 if(MT())return {mode:'off',qs:metaQs('O'+MT().n),a:MT().a,s:MT().s,e:MT().e,n:MT().n};
 return null;}
function metaPersist(){if(metaMode==='off'){const ok=save();if(!ok)$('mtMsg')&&($('mtMsg').textContent='⚠ No se confirmó el guardado de tu respuesta.');}}
function metaRemaining(S){return (S.secs||metaSecs())-(nowSec()-S.s);}
function metaFinish(auto){
 const S=metaSess();if(!S||S.e)return;
 if(S.mode==='off'){const total=metaSecs(),end=Math.min(nowSec(),S.s+total);MT().e=end;const sc=metaPct(MT().a);if(sc>MT().b)MT().b=sc;S.qs.forEach((x,i)=>{const r=S.a[i];if(r==='-')return;const st=STATIONS.find(z=>z.id===x.sid);reportInt('M'+(S.n+1),st,x.q,metaVals[S.mode+S.n+':'+i],r==='1');});save();}
 else{metaPrac.e=nowSec();}
 metaPhase='res';metaConfirm=false;metaNote=auto?'El tiempo terminó: la evaluación se cerró y se entregó con tus respuestas guardadas.':'';
 if(view==='meta')renderMeta();}
let metaNote='';const metaWarned={};
function metaExpiryCheck(){if(metaRunning()&&metaRemaining({s:MT().s})<=0)metaFinish(true);}
function openMeta(){mu=selectedUnit;metaMode='off';metaPrac=null;metaExpiryCheck();metaPhase='hub';metaConfirm=false;showOnly('meta');renderMeta();breadcrumbs();}
function metaStartOff(){
 if(!canChange()){$('mtMsg').textContent='La conexión SCORM no está disponible. No se puede iniciar.';return;}
 const prev=MT(),n=prev?(prev.e?prev.n+1:prev.n):0,b=prev?prev.b:-1,N=metaQs('O'+n).length;
 setMT({n,s:nowSec(),e:0,a:Array(N).fill('-'),b});
 if(!save()){setMT(prev);$('mtMsg').textContent='⚠ No se pudo guardar el inicio. Revisa la conexión e inténtalo de nuevo.';return;}
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
 const M=metaCfg(),N=metaQs(MT()?'O'+(MT().e?MT().n+1:MT().n):'O0').length,min=M.minutes,mt=MT();
 const att=mt?(mt.n+(mt.e?1:0)):0,run=metaRunning(),left=run?metaRemaining({s:mt.s}):0,all=STATIONS.every((s,i)=>s.unit!==mu||stationDone(i)===milestoneCount(s));
 const ready=all?'':`<p class="mt-soft">Te recomendamos completar primero las ${STATIONS.filter(s=>s.unit===mu).length} estaciones. Aún no estás obligado a hacerlo para entrar.</p>`;
 return `<div class="mt-hero"><span class="eyebrow">META FINAL</span><h1>Evaluación de la Unidad ${UNITS[mu].roman}</h1><p>Mide lo que aprendiste en las ${STATIONS.filter(s=>s.unit===mu).length} estaciones: <b>${N} preguntas</b> pensadas para <b>${min} minutos</b>. Puedes intentarlo cuantas veces quieras.</p>${ready}</div>
 <div class="mt-cards"><section class="mt-card mt-prac"><span class="lc-tag">SIMULACRO</span><h2>Practica con reloj</h2><p class="mt-optlbl" id="mtOptLbl">Elige cuánto tiempo quieres practicar:</p><div class="mt-opts" role="radiogroup" aria-labelledby="mtOptLbl">${META_OPTS.map(m=>`<button type="button" role="radio" aria-checked="${m===metaPracMin}" class="mt-opt${m===metaPracMin?' on':''}" data-min="${m}"><b>${m} min</b><small>${metaOptN(m)} preguntas</small></button>`).join('')}</div><ul><li>Se arma una evaluación acorde al tiempo elegido, con preguntas de todas las estaciones.</li><li>El reloj corre, pero <b>no se cierra</b>: si pasas de los ${metaPracMin} minutos sigues y ves tu tiempo extra.</li><li>Las preguntas se sortean distintas cada vez.</li><li><b>El resultado no se guarda</b> ni se envía a SiveducMD.</li></ul><button type="button" class="ls-btn ls-next" id="mtPrac">Comenzar simulacro de ${metaPracMin} min</button></section>
 <section class="mt-card mt-off"><span class="lc-tag">OFICIAL</span><h2>META FINAL oficial</h2>${run?`<p class="mt-run">Tienes una evaluación <b>en curso</b>. Tiempo restante: <b id="mtHubLeft">${mmss(left)}</b>.</p><button type="button" class="primary-btn" id="mtResume">Continuar evaluación</button>`:`<ul><li><b>${min} minutos</b>. El reloj comienza <b>cuando tú aprietas «Comenzar»</b> y <b>no se detiene</b> aunque salgas o cierres la ventana.</li><li>Al terminar el tiempo la evaluación <b>se cierra sola</b> y se entrega con las respuestas que alcanzaste a guardar.</li><li>Puedes cambiar tus respuestas hasta entregar. No verás si son correctas hasta el final.</li><li>Cada intento trae preguntas distintas. Se registra en SiveducMD <b>tu mejor resultado</b>.</li><li>Esta evaluación no determina tu aprobación o reprobación. Al entregar tu primer intento oficial, habrás completado la META FINAL de esta unidad. El curso se completa al terminar las estaciones y la META FINAL de las tres unidades.</li></ul><label class="mt-check"><input type="checkbox" id="mtOk"> Entendí cómo funciona y quiero comenzar ahora.</label><button type="button" class="primary-btn" id="mtGo" disabled>Comenzar evaluación oficial</button>`}
 ${mt&&mt.b>=0?`<p class="mt-hist">Intentos entregados: <b>${att}</b> · Mejor resultado: <b>${mt.b} %</b>${mt.e?` · <button type="button" class="linklike" id="mtLast">Ver último intento</button>`:''}</p>`:''}<p id="mtMsg" class="mt-msg" role="status"></p></section></div>`;}
function metaResHTML(S){
 const c=metaCount(S.a),N=S.a.length,pct=metaPct(S.a),used=Math.min(S.e-S.s,(S.secs||metaSecs())+(S.mode==='prac'?99999:0));
 const by={};S.qs.forEach((x,i)=>{(by[x.sid]=by[x.sid]||{t:x.st,c:0,n:0,d:[]});by[x.sid].n++;if(S.a[i]==='1')by[x.sid].c++;by[x.sid].d.push(S.a[i]);});
 const rows=Object.values(by).map(r=>`<tr><td>${esc(r.t)}</td><td class="mt-dots">${r.d.map(d=>`<i class="d${d}" title="${d==='1'?'Correcta':d==='0'?'Incorrecta':'Sin responder'}"></i>`).join('')}</td><td><b>${r.c}/${r.n}</b></td></tr>`).join('');
 const T=PACETyped;
 const rev=S.qs.map((x,i)=>{const q=x.q,st=S.a[i];let corr='';if(q.type==='input'){let t='';try{t=T.answerTex(q);}catch(e){}corr='\\('+t+'\\)';}else corr=q.options[q.correct];
  return `<details class="mt-rev ${st==='1'?'ok':st==='0'?'bad':'no'}"><summary><span class="mt-mark">${st==='1'?'✓':st==='0'?'✗':'–'}</span> Pregunta ${i+1} · ${esc(x.st)}</summary><div class="mt-revbody"><p class="math-content">${rich(q.q)}</p><p><b>Respuesta correcta:</b> <span class="math-content">${rich(corr)}</span></p>${st!=='1'&&q.solution?`<div class="mt-dev"><b>Desarrollo:</b><ol class="mt-devlist">${String(q.solution).split(/\n+/).filter(x=>x.trim()).map(x=>`<li class="math-content">${rich(x)}</li>`).join('')}</ol></div>`:`<p class="math-content">${st!=='1'?'<b>Retroalimentación:</b> ':''}${rich(q.why||'')}</p>`}</div></details>`;}).join('');
 const reg=S.mode==='off'?`<p class="mt-regok">✓ Resultado registrado${MT()&&MT().b===pct?'. Es tu mejor resultado hasta ahora.':'. Tu mejor resultado registrado es '+MT().b+' %.'}</p><p class="mt-soft">No aprueba ni reprueba: ${completed()?'¡completaste el curso!':'completa también todas las estaciones para terminar el curso.'}</p>`:`<p class="mt-regno">Este fue un simulacro: el resultado <b>no se guarda</b>.</p>`;
 return `<div class="mt-hero"><span class="eyebrow">${S.mode==='off'?'META FINAL OFICIAL · RESULTADO':'SIMULACRO · RESULTADO'}</span>${metaNote?`<p class="mt-timeup">${esc(metaNote)}</p>`:''}<div class="mt-score"><strong>${pct}%</strong><span>${c} de ${N} correctas</span><span>Tiempo usado: ${mmss(used)}${S.mode==='prac'&&used>(S.secs||metaSecs())?' (pasaste el tiempo previsto)':''}</span></div>${reg}</div>
 <section class="lc lc-steps"><span class="lc-tag">POR ESTACIÓN</span><table class="mt-table"><tbody>${rows}</tbody></table><p class="mt-soft"><i class="d1"></i> correcta <i class="d0"></i> incorrecta <i class="d-"></i> sin responder</p></section>
 <section class="lc"><span class="lc-tag">REVISA TUS PREGUNTAS</span><div class="mt-revlist">${rev}</div></section>
 <div class="mt-row"><button type="button" class="primary-btn" id="mtAgain">Hacer otro intento</button><button type="button" class="ls-btn ghost" id="mtHub">Volver a la META FINAL</button></div>`;}
function renderMeta(){
 const root=$('metaView');if(!metaCfg()){root.innerHTML='';return;}
 const S=metaPhase==='hub'?null:metaSess();
 if(metaPhase!=='hub'&&!S)metaPhase='hub';
 if(metaPhase==='hub'){clearInterval(metaTimer);metaTimer=null;root.innerHTML='<div class="mt-wrap">'+metaHubHTML()+'</div>';window.chuMeta&&chuMeta(root,false);
  const ok=$('mtOk');if(ok)ok.addEventListener('change',()=>{$('mtGo').disabled=!ok.checked;});
  if($('mtGo'))$('mtGo').addEventListener('click',metaStartOff);if($('mtPrac'))$('mtPrac').addEventListener('click',metaStartPrac);root.querySelectorAll('.mt-opt').forEach(b=>b.addEventListener('click',()=>{metaPracMin=Number(b.dataset.min);renderMeta();const nb=root.querySelector('.mt-opt.on');if(nb)nb.focus();}));if($('mtResume'))$('mtResume').addEventListener('click',metaResume);
  if($('mtLast'))$('mtLast').addEventListener('click',()=>{metaMode='off';metaPhase='res';renderMeta();});
  if(metaRunning()){clearInterval(metaTimer);metaTimer=setInterval(()=>{const el=$('mtHubLeft');if(!el||view!=='meta'||metaPhase!=='hub'){clearInterval(metaTimer);return;}const r=metaRemaining({s:MT().s});if(r<=0){metaFinish(true);return;}el.textContent=mmss(r);},1000);}
 }else if(metaPhase==='run'){
  root.innerHTML='<div class="mt-wrap">'+metaRunHTML(S)+'</div>';metaPalette(S);metaBindQ(S);
  $('mtPrev').addEventListener('click',()=>{if(metaIdx>0){metaIdx--;metaConfirm=false;renderMeta();window.scrollTo({top:0,behavior:'instant'});}});
  $('mtNext').addEventListener('click',()=>{if(metaIdx<S.qs.length-1){metaIdx++;metaConfirm=false;renderMeta();window.scrollTo({top:0,behavior:'instant'});}});
  if($('mtDeliver'))$('mtDeliver').addEventListener('click',()=>{metaConfirm=true;renderMeta();});
  if($('mtYes'))$('mtYes').addEventListener('click',()=>metaFinish(false));if($('mtNo'))$('mtNo').addEventListener('click',()=>{metaConfirm=false;renderMeta();});
  typesetMath(root);metaTimerStart();
 }else{
  clearInterval(metaTimer);metaTimer=null;root.innerHTML='<div class="mt-wrap">'+metaResHTML(S)+'</div>';window.chuMeta&&chuMeta(root,true);
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
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.ls-rot-x');if(!b)return;document.querySelectorAll('.ls-rot').forEach(function(x){x.remove();});try{sessionStorage.setItem('pace_rot','1');}catch(_){}});
(function(){var b=document.createElement('button');b.type='button';b.id='goUp';b.className='go-up';b.setAttribute('aria-label','Volver al inicio de la página');b.title='Volver arriba';b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';document.body.appendChild(b);
var t=0;function upd(){t=0;b.classList.toggle('on',window.scrollY>600);}
window.addEventListener('scroll',function(){if(!t)t=requestAnimationFrame(upd);},{passive:true});
b.addEventListener('click',function(){var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;window.scrollTo({top:0,behavior:rm?'auto':'smooth'});var h=document.querySelector('h1,h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}});upd();})();
function paceSub(k){var I=document.getElementById('ptInicio'),C=document.getElementById('ptCurso');if(!I||!C)return;I.hidden=k!=='inicio';C.hidden=k==='inicio';if(k!=='inicio'){var v=I.querySelector('video');if(v&&!v.paused)v.pause();}window.scrollTo(0,0);}
(function(){[].slice.call(document.querySelectorAll('[data-go-curso]')).forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();paceSub('curso');var h=document.querySelector('#ptCurso h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}});});
var b=document.getElementById('ptBack');if(b)b.addEventListener('click',function(){paceSub('inicio');});
[].slice.call(document.querySelectorAll('[data-open-unit]')).forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();openMap(Number(l.dataset.openUnit));});});
if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){[].forEach.call(document.querySelectorAll('.board animate'),function(x){var r=x.parentNode;r.setAttribute('width',x.getAttribute('to'));r.removeChild(x);});}})();
function stLocal(i){const u=STATIONS[i].unit;let n=0;for(let j=0;j<=i;j++)if(STATIONS[j].unit===u)n++;return n;}
function stLabel(i){const u=UNITS[STATIONS[i].unit];return (u?u.roman+'·':'')+stLocal(i);}
/* ===== Navegación por pantallas · «cero scroll» (propuesta de Henry, V4) =====
 * Capa de presentación sobre el motor: no cambia el estado, el progreso, las interacciones SCORM ni la META FINAL.
 *  - Aprende: Idea → Ejemplos (pasos progresivos) → Cierre, con accesos directos y un solo par Anterior/Siguiente.
 *  - Practica / Aplica: una pregunta a la vez (las mismas preguntas y la misma lógica de respuesta).
 *  - Explora: la simulación ocupa el espacio disponible.
 *  El desplazamiento solo aparece como respaldo cuando el contenido no cabe ni reduciendo la letra al mínimo legible. */
const zsPos={},zsQ={};
let zsRO=null,zsTimer=null,zsToastT=null;
const zsOn=()=>document.body.classList.contains('zs');
function zsFit(box,inner,min){
 if(!box||!inner)return;const m=min||.7,WMIN=.6;
 const wide=()=>{const q=box.querySelectorAll('mjx-container,.zs-aux');for(let i=0;i<q.length;i++){if(q[i].scrollWidth>q[i].clientWidth+1)return true;}return false;};
 let fh=null,fhw=null;
 for(let z=1;z>=m-.001;z-=.04){box.style.setProperty('--z',z.toFixed(2));
  const h=box.scrollHeight<=box.clientHeight+1&&box.scrollWidth<=box.clientWidth+1;
  if(h&&fh===null)fh=z;
  if(h&&!wide()){fhw=z;break;}
 }
 /* La letra baja hasta que cabe a lo alto y a lo ancho; a lo ancho no baja de 0,7 (una línea muy larga se desplaza sola). */
 let r=m;if(fh!==null)r=Math.min(fh,Math.max(fhw||0,Math.max(WMIN,m)));
 box.style.setProperty('--z',r.toFixed(2));
}
const zsNorm=t=>String(t||'').toLowerCase().replace(/[*_`$\\.:;,!¡¿?\s]+/g,' ').trim();
function zsFitQ(b){for(let z=1;z>=.77;z-=.04){b.style.setProperty('--z',z.toFixed(2));if(b.scrollHeight<=b.clientHeight+1)return;}}
function zsFitAll(){document.querySelectorAll('#stationContent .zs-fit').forEach(b=>{
  const inner=b.firstElementChild,mn=Number(b.dataset.min)||.7,zv=()=>parseFloat(b.style.getPropertyValue('--z'))||1;
  if(inner&&inner.classList.contains('zs-cols')){
   /* Idea: una sola columna; si obliga a letra chica y hay ancho, se reparte en dos columnas. */
   inner.classList.remove('zs-two');zsFit(b,inner,mn);const z1=zv();
   if(z1<.9&&b.clientWidth>=640){inner.classList.add('zs-two');zsFit(b,inner,mn);if(zv()<=z1+.001){inner.classList.remove('zs-two');zsFit(b,inner,mn);}}
  }else zsFit(b,inner,mn);});document.querySelectorAll('#stationContent .zs-qbody').forEach(zsFitQ);}
function zsTypeset(el,cb){
 const done=()=>{try{cb&&cb();}catch(e){}};
 if(window.MathJax&&MathJax.typesetPromise){MathJax.typesetPromise([el]).then(done,done);}
 else{let n=0;const t=setInterval(()=>{if(window.MathJax&&MathJax.typesetPromise){clearInterval(t);MathJax.typesetPromise([el]).then(done,done);}else if(++n>60){clearInterval(t);done();}},150);}
}
function zsRefit(){clearTimeout(zsTimer);zsTimer=setTimeout(zsFitAll,60);}
window.addEventListener('resize',zsRefit);
window.addEventListener('orientationchange',zsRefit);

/* ---------- APRENDE ---------- */
function zsScreens(s){
 const L=s.learn||{},ex=[];
 if(L.steps&&(L.steps.items||[]).length)ex.push(L.steps);
 (Array.isArray(L.more)?L.more:[]).slice(0,3).forEach(m=>{if(m&&(m.items||[]).length)ex.push(m);});
 const scr=[{k:'idea',lab:'Idea'}];
 ex.forEach((e,i)=>scr.push({k:'ex',e:e,n:i+1,lab:'Ej. '+(i+1)}));
 if(!ex.length&&(s.example||'').trim())scr.push({k:'txt',lab:'Ejemplo',t:s.example});
 if(L.fade&&(L.fade.items||[]).length&&L.fade.blank)scr.push({k:'fade',lab:'Ahora tú'});
 if(L.warn||(s.media&&s.media.length))scr.push({k:'end',lab:'Cierre'});
 return {scr:scr,total:ex.length};
}
function zsHead(sc,pg,tot){
 if(sc.k==='idea')return 'Conceptos esenciales';
 if(sc.k==='end')return 'Presta atención';
 if(sc.k==='fade')return 'Ahora tú';
 return 'Ejemplo guiado'+(tot>1?' '+sc.n+' de '+tot:'');
}
function zsCap(sc,k){
 const it=sc.e.items,vi=(()=>{const v=it.findIndex(x=>/^\*\*Verificaci/.test(x.why||''));return v<0?it.length:v;})();
 if(vi>=it.length)return `Ejemplo ${sc.n} · Paso ${k+1} de ${it.length}`;
 return k<vi?`Ejemplo ${sc.n} · Resolución ${k+1} de ${vi}`:`Ejemplo ${sc.n} · Verificación`;
}
function zsSceneHTML(s,sc,pos,tot){
 const L=s.learn||{};
 if(sc.k==='idea'){
  return `<div class="zs-idea">${L.goal?`<section class="zs-card zs-goal"><span class="zs-tag">QUÉ APRENDERÁS</span><p class="math-content">${rb(L.goal)}</p></section>`:''}<section class="zs-card zs-ideac"><span class="zs-tag">COMPRENDE LA IDEA</span><div class="zs-fit zs-body" data-min=".6">${L.figure&&L.figure.svg?`<div class="zs-figwrap"><div class="math-content zs-cols">${rb(L.idea||s.concept||'')}</div><figure class="zs-fig">${L.figure.svg}${L.figure.caption?`<figcaption>${rb(L.figure.caption)}</figcaption>`:''}</figure></div>`:`<div class="math-content zs-cols">${rb(L.idea||s.concept||'')}</div>`}</div></section></div>`;
 }
 if(sc.k==='txt'){
  return `<div class="zs-idea"><section class="zs-card zs-ideac"><span class="zs-tag">EJEMPLO</span><div class="zs-fit zs-body" data-min=".72"><div class="math-content">${rich(sc.t)}</div></div></section></div>`;
 }
 if(sc.k==='fade')return zsFadeHTML(s);
 if(sc.k==='end'){
  return `<div class="zs-idea"><section class="zs-card zs-warn"><span class="zs-tag">PRESTA ATENCIÓN</span><div class="zs-fit zs-body" data-min=".72"><div class="math-content">${L.warn?rb(L.warn):''}${renderMedia(s.media||[])}</div></div></section></div>`;
 }
 const items=sc.e.items,k=Math.min(pos.step,items.length-1),cur=items[k],sd=cur.side||{},hasSd=!!(sd.title||sd.math||sd.text);
 const isV=it=>/^\*\*Verificaci/.test(it.why||'');
 let vi=items.findIndex(isV);if(vi<0)vi=items.length;
 const inV=k>=vi,nRes=vi,nVer=items.length-vi;
 const mk=(it,i)=>`<div class="zs-line ${i===k?'cur':i<k?'past':'fut'}" ${i===k?'aria-current="step"':''}>${it.math?`<div class="math-content">$$${it.math}$$</div>`:''}</div>`;
 const resL=items.slice(0,vi).map((it,i)=>mk(it,i)).join('');
 const verL=(nVer&&inV)?`<div class="zs-verif"><span class="zs-vlab">VERIFICACIÓN · fuera de la resolución</span>${items.slice(vi).map((it,i)=>mk(it,i+vi)).join('')}</div>`:'';
 const lines=resL+verL;
 const pillTxt=inV?(nVer>1?`Verificación ${k-vi+1} de ${nVer}`:'Verificación'):(nVer?`Resolución ${k+1} de ${nRes}`:`Paso ${k+1} de ${items.length}`);
 const why=(cur.why||'').trim();
 return `<div class="zs-ex"><div class="zs-ex-title"><div class="zs-ex-t"><span class="zs-tag coral">EJEMPLO ${sc.n}${tot>1?' DE '+tot:''}</span>${sc.e.title?`<h2 class="math-content">${rb(sc.e.title)}</h2>`:''}</div><span class="zs-pill${inV?' ver':''}">${pillTxt}</span></div>
  <div class="zs-worked${inV?' isver':''}"><div class="zs-lines zs-fit" data-min=".5"><div class="zs-lines-in">${lines}</div></div>
  <aside class="zs-side" aria-label="Explicación del paso actual"><span class="zs-tag ${inV?'ver':'teal'}">${inV?'VERIFICACIÓN · SOLO UNA COMPROBACIÓN':'¿POR QUÉ ESTE PASO?'}</span><div class="zs-fit zs-side-b" data-min=".6"><div>${hasSd&&sd.title?`<h4 class="math-content">${rb(sd.title)}</h4>`:''}${why&&!(hasSd&&sd.title&&zsNorm(why)===zsNorm(sd.title))?`<p class="zs-why math-content">${rb(why)}</p>`:''}${hasSd&&sd.math?`<div class="zs-aux math-content">$$${sd.math}$$</div>`:''}${hasSd&&sd.text?`<p class="zs-st math-content">${rb(sd.text)}</p>`:''}${!why&&!hasSd?'<p class="zs-st">Observa la operación realizada en este paso.</p>':''}</div></div></aside></div></div>`;
}
function zsRenderLearn(){
 const s=STATIONS[stationIndex],host=$('stationContent'),done=stepDone(stationIndex,0);
 const {scr,total}=zsScreens(s);
 const pos=zsPos[s.id]||(zsPos[s.id]={page:0,step:0});
 pos.page=Math.max(0,Math.min(scr.length-1,pos.page));
 const sc=scr[pos.page],nSteps=sc.k==='ex'?sc.e.items.length:0;
 if(sc.k==='ex')pos.step=Math.max(0,Math.min(nSteps-1,pos.step));else pos.step=0;
 const last=pos.page===scr.length-1;
 let nextTxt;
 if(sc.k==='ex'&&pos.step<nSteps-1)nextTxt='Siguiente paso →';
 else if(last)nextTxt='Ir a Practica →';
 else{const nx=scr[pos.page+1];nextTxt=nx.k==='ex'?'Ejemplo '+nx.n+' →':nx.k==='fade'?'Ahora tú →':nx.k==='end'?'Cierre →':'Siguiente →';}
 const cap=sc.k==='ex'?zsCap(sc,pos.step):(sc.k==='idea'?'Idea clave de la estación':sc.k==='end'?'Antes de practicar':sc.k==='fade'?'Completa el último paso':'Ejemplo');
 host.innerHTML=`<div class="zs-stage zs-learn"><div class="zs-top"><div class="zs-kick">APRENDE <i>·</i> <b>${zsHead(sc,pos.page,total)}</b></div><span class="zs-pg">Pantalla ${pos.page+1} de ${scr.length}</span></div>
  <nav class="zs-jump" aria-label="Ir directamente a una pantalla de Aprende">${scr.map((c,i)=>`<button type="button" class="zs-chip${i===pos.page?' on':''}" data-pg="${i}" ${i===pos.page?'aria-current="step"':''}>${c.lab}</button>`).join('')}</nav>
  <div class="zs-scene" id="zsScene" aria-live="polite">${zsSceneHTML(s,sc,pos,total)}</div>
  <div class="zs-bottom"><button type="button" class="zs-btn" id="zsPrev" ${pos.page===0&&pos.step===0?'disabled':''}>← Anterior</button><div class="zs-mid"><span class="zs-cap">${cap}</span><div class="zs-pips" aria-hidden="true">${scr.map((c,i)=>`<span class="${i===pos.page?'on':i<pos.page?'done':''}"></span>`).join('')}</div></div><button type="button" class="zs-btn next" id="zsNext">${nextTxt}</button></div></div>`;
 const go=(page,step)=>{pos.page=page;pos.step=step;zsRenderLearn();};
 const nxt=()=>{
  if(sc.k==='ex'&&pos.step<nSteps-1){go(pos.page,pos.step+1);return;}
  if(!last){go(pos.page+1,0);return;}
  activeTab='practice';state.tab='practice';
  if(!stepDone(stationIndex,0)){mark(0);}   /* mark() guarda, vuelve a dibujar la estación (ya en Practica) y avisa «Avance actualizado» */
  else{save();renderStation();}
 };
 const prv=()=>{
  if(sc.k==='ex'&&pos.step>0){go(pos.page,pos.step-1);return;}
  if(pos.page>0){const p=scr[pos.page-1];go(pos.page-1,p.k==='ex'?p.e.items.length-1:0);}
 };
 $('zsNext').onclick=nxt;$('zsPrev').onclick=prv;
 host.querySelectorAll('.zs-chip').forEach(b=>b.onclick=()=>go(Number(b.dataset.pg),0));
 zsBindKeys(nxt,prv);
 if(sc.k==='fade')zsFadeBind(s,()=>go(pos.page,0));
 const scene=$('zsScene');
 let tx=null;
 scene.addEventListener('touchstart',e=>{if(e.touches.length===1)tx={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 scene.addEventListener('touchend',e=>{if(!tx||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-tx.x,dy=e.changedTouches[0].clientY-tx.y;tx=null;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*1.6){if(dx<0)nxt();else prv();}},{passive:true});
 zsFitAll();zsTypeset(scene,zsFitAll);
}
function zsBindKeys(nxt,prv){
 if(window.__zsKey)document.removeEventListener('keydown',window.__zsKey);
 window.__zsKey=function(ev){
  if(!document.getElementById('zsScene')){document.removeEventListener('keydown',window.__zsKey);window.__zsKey=null;return;}
  if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
  if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
  const t=ev.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  ev.preventDefault();if(ev.key==='ArrowRight')nxt();else prv();
 };
 document.addEventListener('keydown',window.__zsKey);
}

/* ---------- PRACTICA / APLICA: una pregunta a la vez ---------- */
function zsRenderQuiz(){
 const host=$('stationContent'),s=STATIONS[stationIndex],qs=[...host.querySelectorAll(':scope > .quiz')];
 if(!qs.length)return;
 const zsRd=t=>t==='check'?(typeof roundC==='function'?roundC(s):roundOf(s)):(typeof roundP==='function'?roundP(s):roundOf(s));
 const key=s.id+'|'+activeTab+'|'+zsRd(activeTab),n=qs.length;   /* la ronda va en la clave: una ronda nueva parte en su primer ejercicio */
 let cur=zsQ[key];
 if(cur==null||cur<0||cur>=n){cur=qs.findIndex(q=>!q.classList.contains('done'));if(cur<0)cur=0;}
 zsQ[key]=cur;
 const nDone=qs.filter(q=>q.classList.contains('done')).length;
 const title=activeTab==='practice'?'PRACTICA':'APLICA';
 const wrap=document.createElement('div');wrap.className='zs-stage zs-quiz';
 const body=document.createElement('div');body.className='zs-qbody';
 qs.forEach((q,i)=>{q.classList.toggle('zs-cur',i===cur);body.appendChild(q);});
 const redo=host.querySelector(':scope > .learn-finish');
 const pips=qs.map((q,i)=>`<button type="button" class="zs-qpip${q.classList.contains('done')?' ok':''}${i===cur?' on':''}" data-q="${i}" aria-label="Ir al ejercicio ${i+1}${q.classList.contains('done')?' (resuelto)':''}"><span>${i+1}</span></button>`).join('');
 const stats=`<div class="zs-qstats" aria-label="Resumen de avance"><span>Resueltas <b>${nDone}/${n}</b></span><span>Pendientes <b>${n-nDone}</b></span></div>`;
 const top=document.createElement('div');top.className='zs-top';
 top.innerHTML=`<div class="zs-kick">${title} <i>·</i> <b>Ejercicio ${cur+1} de ${n}</b></div>${stats}`;
 /* En el último ejercicio, «Siguiente» lleva a la sección que sigue: Practica → Aplica, Aplica → Explora (si la estación la tiene). */
 const toTab=cur===n-1?(activeTab==='practice'?'check':(activeTab==='check'&&typeof hasExplore==='function'&&hasExplore(s)?'explore':null)):null;
 const nextBtn=toTab?`<button type="button" class="zs-btn next" id="zsQNext">Ir a ${toTab==='check'?'Aplica':'Explora'} →</button>`
  :`<button type="button" class="zs-btn next" id="zsQNext" ${cur===n-1?'disabled':''}>Siguiente →</button>`;
 /* En el primer ejercicio, «Anterior» vuelve a la sección previa: Aplica → Practica, Practica → Aprende (24-11-2026). */
 const fromTab=cur===0?(activeTab==='check'?'practice':(activeTab==='practice'?'learn':null)):null;
 const prevSec=()=>{if(fromTab==='learn'){const sc=zsScreens(s).scr;zsPos[s.id]={page:Math.max(0,sc.length-1),step:0};}else{zsQ[s.id+'|practice|'+zsRd('practice')]=Math.max(0,drawCount(s)-1);}save();selectTab(fromTab);};
 const bar=document.createElement('div');bar.className='zs-bottom';
 bar.innerHTML=`<button type="button" class="zs-btn" id="zsQPrev" ${cur===0&&!fromTab?'disabled':''}>${fromTab?'← '+(fromTab==='learn'?'Aprende':'Practica'):'← Anterior'}</button><div class="zs-mid"><div class="zs-qpips" title="Con las flechas ← → del teclado cambias de ejercicio">${pips}</div></div>${nextBtn}`;
 host.innerHTML='';wrap.append(top,body,bar);host.appendChild(wrap);
 if(redo)redo.remove();   /* la otra ronda va por sección (mejoras.js) */
 const go=i=>{zsQ[key]=Math.max(0,Math.min(n-1,i));renderStation();};
 bar.querySelector('#zsQPrev').onclick=()=>{if(fromTab)prevSec();else go(cur-1);};
 bar.querySelector('#zsQNext').onclick=()=>{if(toTab){save();selectTab(toTab);}else go(cur+1);};
 bar.querySelectorAll('.zs-qpip').forEach(b=>b.onclick=()=>go(Number(b.dataset.q)));
 new MutationObserver(zsRefit).observe(body,{childList:true,subtree:true,characterData:true});
 /* Teclado matemático: 5 columnas ordenadas (dígitos y paréntesis · operaciones · potencias y raíz). */
 const ORD=['7','8','9','(',')','4','5','6','+','-','1','2','3','/','^','0',',','²','√','π','; ',' y ','x','=','∅','@del'];
 body.querySelectorAll('.keypad').forEach(pad=>{const ks=[...pad.children];ks.sort((a,b)=>{const ia=ORD.indexOf(a.dataset.key),ib=ORD.indexOf(b.dataset.key);return(ia<0?99:ia)-(ib<0?99:ib);});ks.forEach(k=>pad.appendChild(k));});
 /* Flechas del teclado: ← → cambian de ejercicio (no mientras se escribe una respuesta). */
 if(window.__zsQKey)document.removeEventListener('keydown',window.__zsQKey);
 window.__zsQKey=function(ev){
  if(!document.querySelector('.zs-quiz')){document.removeEventListener('keydown',window.__zsQKey);window.__zsQKey=null;return;}
  if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
  if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
  const t=ev.target,cq=document.querySelector('.zs-qbody>.zs-cur');
  if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)&&!t.disabled&&String(t.value||'').trim()!==''&&!(cq&&cq.classList.contains('done')))return;   /* con texto escrito, las flechas mueven el cursor */
  if(t&&t.isContentEditable)return;
  const to=ev.key==='ArrowRight'?cur+1:cur-1;
  if(to<0){if(fromTab){ev.preventDefault();prevSec();}return;}
  if(to>=n){if(toTab){ev.preventDefault();save();selectTab(toTab);}return;}
  ev.preventDefault();go(to);
 };
 document.addEventListener('keydown',window.__zsQKey);
 /* Los manejadores de respuesta se ligaron a los mismos nodos en renderStation0; al moverlos se conservan. */
 const first=body.querySelector('.zs-cur .typed-input');if(first&&!body.querySelector('.zs-cur.done')&&matchMedia('(hover:hover)').matches)first.focus({preventScroll:true});
}

/* ---------- EXPLORA ---------- */
function zsRenderExplore(){
 const host=$('stationContent'),s0=STATIONS[stationIndex];if(!host.querySelector('.ex-frame')&&!host.querySelector('.ex-link'))return;
 host.classList.add('zs-explore');
 const h2=host.querySelector(':scope > h2'),desc=host.querySelector(':scope > p.math-content'),note=host.querySelector(':scope > .ex-note'),instr=host.querySelector(':scope > .lc'),
  fr=host.querySelector('.ex-frame'),ctl=host.querySelector(':scope > .ls-ctl'),alt=host.querySelector(':scope > .ex-alt'),link=host.querySelector(':scope > p .ex-link');
 const info=document.createElement('details');info.className='zs-exinfo';
 info.innerHTML='<summary>¿Qué puedes hacer aquí?</summary>';
 const box=document.createElement('div');box.className='zs-exinfo-b';
 if(desc)box.appendChild(desc);if(instr)box.appendChild(instr);if(alt)box.appendChild(alt);
 info.appendChild(box);
 const top=document.createElement('div');top.className='zs-top';
 top.innerHTML=`<div class="zs-kick">✦ EXPLORA <i>·</i> <b></b></div><span class="zs-pill soft">No cuenta para tu avance</span>`;
 top.querySelector('b').textContent=h2?h2.textContent:'Explora';
 const stage=document.createElement('div');stage.className='zs-stage zs-expl';
 const area=document.createElement('div');area.className='zs-exarea';
 if(fr)area.appendChild(fr);else{const p=host.querySelector(':scope > p');if(p)area.appendChild(p);}
 const bar=document.createElement('div');bar.className='zs-exbar';
 const toA=document.createElement('button');toA.type='button';toA.className='ls-btn ghost zs-toapl';toA.textContent='← Aplica';toA.onclick=()=>{zsQ[s0.id+'|check|'+(typeof roundC==='function'?roundC(s0):roundOf(s0))]=Math.max(0,checkCount(s0)-1);selectTab('check');};
 bar.appendChild(toA);bar.appendChild(info);if(ctl)bar.appendChild(ctl);
 const keep=[...host.children].filter(e=>e.id==='exClose');
 host.innerHTML='';stage.append(top,area,bar);host.appendChild(stage);
 /* Los botones «Reiniciar» y «Vista ampliada» conservan sus manejadores porque se mueven los mismos nodos. */
}

/* ---------- envoltorio de renderStation ---------- */
function zsAfter(){
 if(!zsOn()){document.body.classList.remove('zs-ex');return;}
 try{
  if(activeTab==='learn'){zsRenderLearn();}
  else if(activeTab==='explore'){zsRenderExplore();}
  else{zsRenderQuiz();}
  document.body.classList.toggle('zs-ex',activeTab==='explore');
  const sc=document.querySelector('#stationContent');if(sc)sc.scrollTop=0;
  zsRefit();
 }catch(e){try{console.error('zs',e);}catch(_){}}
}
function zsToast(){
 const el=$('stationFeedback');if(!el)return;
 new MutationObserver(()=>{
  const p=el.parentElement;if(!p)return;
  if(!el.textContent.trim()){p.classList.remove('zs-toast');return;}
  p.classList.remove('zs-toast');void p.offsetWidth;p.classList.add('zs-toast');
  clearTimeout(zsToastT);zsToastT=setTimeout(()=>p.classList.remove('zs-toast'),4500);
 }).observe(el,{childList:true,characterData:true,subtree:true});
}

/* Teclado matemático: mismo orden en estaciones y en META FINAL (5 columnas: dígitos y paréntesis · operaciones · potencias y raíz) */
function zsKeys(list){
 const ORD=['7','8','9','(',')','4','5','6','+','-','1','2','3','/','^','0',',','²','√','π','; ',' y ','x','=','∅','@del'];
 const pos=k=>{const i=ORD.indexOf(k[1]||k[0]);return i<0?99:i;};
 return list.slice().sort((a,b)=>pos(a)-pos(b));
}

/* ---------- AHORA TÚ (14 · ejemplo con el último paso en blanco; prototipo del 19-11, incorporado el 24-11) ----------
   learn.fade = {title, items:[{math, why}], blank:{ask, prompt, after, kind, answer, math, why, okmsg, hint, errors:[{value, msg}]}}
   prompt = lo escrito antes del recuadro; after = lo escrito después (opcional).
   No cuenta para el avance: es una práctica guiada dentro de Aprende. */
const zsFadeSt={};
function zsFadeHTML(s){
 const F=s.learn.fade,B=F.blank,st=zsFadeSt[s.id]||{},ok=!!st.ok,shown=!!st.shown;
 const line=(it,cls)=>`<div class="zs-line ${cls}">${it.math?`<div class="math-content">$$${it.math}$$</div>`:''}${it.why?`<p class="zs-fwhy math-content">${rb(it.why)}</p>`:''}</div>`;
 const given=F.items.map(it=>line(it,'past')).join('');
 const last=(ok||shown)?line({math:B.math,why:''},'cur zs-fdone'+(ok?'':' shown')):`<div class="zs-line cur zs-blank"><div class="math-content">$$${B.prompt||''}\\boxed{\\;?\\;}${B.after||''}$$</div><p class="zs-fwhy">Este paso lo completas tú.</p></div>`;
 const side=ok?`<span class="zs-tag zs-tok">✓ ¡BIEN HECHO!</span><p class="zs-fok math-content">${rb(B.okmsg||B.why||'Correcto.')}</p><p class="zs-st">Ya puedes pasar a Practica.</p>`
  :shown?`<span class="zs-tag">LA RESPUESTA</span><p class="math-content">${rb(B.why||'')}</p><p class="zs-st">Revisa por qué antes de pasar a Practica.</p>`
  :`<span class="zs-tag">TU TURNO</span><p class="math-content zs-fask">${rb(B.ask||'Completa el último paso.')}</p><div class="zs-fin"><span class="math-content">\\(${B.prompt||''}\\)</span><input type="text" id="zsFadeIn" inputmode="${B.kind==='set'?'text':'decimal'}" autocomplete="off" spellcheck="false" aria-label="Tu respuesta" value="${esc(st.last||'')}">${B.after?`<span class="math-content">\\(${B.after}\\)</span>`:''}<button type="button" class="zs-btn next" id="zsFadeGo">Comprobar</button></div><p class="zs-ffb math-content${st.msg?' bad':''}" id="zsFadeFb" role="status" aria-live="polite">${st.msg?'✗ '+rb(st.msg):''}</p>${(st.tries||0)>=2?'<button type="button" class="zs-flink" id="zsFadeShow">Mostrar la respuesta</button>':''}`;
 return `<div class="zs-ex zs-fade"><div class="zs-ex-title"><div class="zs-ex-t"><span class="zs-tag coral">AHORA TÚ</span>${F.title?`<h2 class="math-content">${rb(F.title)}</h2>`:''}</div><span class="zs-pill">Completa el último paso</span></div>
  <div class="zs-worked"><div class="zs-lines zs-fit" data-min=".5"><div class="zs-lines-in">${given}${last}</div></div><aside class="zs-side" aria-label="Tu turno">${side}</aside></div></div>`;
}
function zsFadeBind(s,redraw){
 const B=s.learn.fade.blank,st=zsFadeSt[s.id]||(zsFadeSt[s.id]={tries:0});
 const show=$('zsFadeShow');if(show)show.onclick=()=>{st.shown=true;redraw();};
 const inp=$('zsFadeIn'),go=$('zsFadeGo');if(!inp||!go)return;
 const kind=B.kind||'number',q={type:'input',kind,answer:String(B.answer)};
 const same=(ans,v)=>{try{return PACETyped.check({type:'input',kind,answer:String(ans)},v).state==='ok';}catch(e){return false;}};
 const fb=m=>{const f=$('zsFadeFb');f.className='zs-ffb math-content bad';f.innerHTML='✗ '+rb(m);zsTypeset(f,zsFitAll);};
 const check=()=>{
  const v=inp.value;st.last=v;let r;try{r=PACETyped.check(q,v);}catch(e){r={state:'invalid',msg:'No pude leer tu respuesta.'};}
  if(r.state==='empty'){fb('Escribe tu respuesta antes de comprobar.');inp.focus();return;}
  if(r.state==='ok'){st.ok=true;st.msg='';window.chuReact&&chuReact(true);redraw();return;}
  if(r.state==='invalid'||r.state==='reduce'){fb(r.msg||'Revisa cómo escribiste tu respuesta.');inp.focus();return;}
  st.tries=(st.tries||0)+1;window.chuReact&&chuReact(false);
  const e=(B.errors||[]).find(x=>same(x.value,v));st.msg=(e&&e.msg)||B.hint||'Todavía no. Revisa el último paso.';
  if(st.tries===2){redraw();return;}fb(st.msg);inp.select();};
 go.onclick=check;inp.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();check();}});
}

function renderStation(){renderStation0();zsAfter();}
function showOnly(next){showOnly0(next);document.body.classList.toggle('zs',next==='station');document.documentElement.classList.toggle('zs',next==='station');if(next==='station')zsRefit();}
zsToast();
/* Presentación (18-11-2026): color de la unidad en el body, mapa con el bloque en curso abierto, tarjetas con su avance. */
(function(){
 function setU(u){try{var x=UNITS[u];document.body.dataset.u=x&&x.id?x.id:String(u);}catch(e){}}
 var _os=openStation;openStation=function(i){setU(STATIONS[i]&&STATIONS[i].unit);return _os.apply(this,arguments);};
 var _om=openMap;openMap=function(u){setU(u);return _om.apply(this,arguments);};
 var _oh=openHome;openHome=function(){try{delete document.body.dataset.u;}catch(e){}return _oh.apply(this,arguments);};
})();

/* Cierre de bloque (19-11-2026) · práctica mixta.
   Al final de cada bloque con 2 o más estaciones, el mapa ofrece un «Cierre del bloque»: ejercicios de las estaciones
   del bloque, mezclados y sin decir de qué estación vienen. Un intento por ejercicio; al final, un resumen por estación.
   Si el bloque trae groups[g].cierre = {title, idea, figure:{svg,caption}, practice:[...], take}, se muestra primero
   esa pantalla-guía y se suman `take` preguntas de su `practice`. Las respuestas no se registran en el SCORM: es un repaso.
   Solo se guarda que el Cierre se terminó (línea B| de arbol/arbol.js), porque hace florecer la rama del bloque en el árbol. */
const CI_N=8;
const CI_NEUTRO=[
 [/Resuelve (?:la ecuación )?(?:aplicando|con|usando) la fórmula general/g,'Resuelve la ecuación'],
 [/Factoriza (?:por agrupación|como suma por diferencia)/g,'Factoriza'],
 [/Escribe como cuadrado de un binomio/g,'Factoriza'],
 [/Extrae el máximo factor común de/g,'Factoriza'],
 [/ usando el MCM/g,''],
 [/Resuelve la ecuación \(primero ordena la ecuación\)/g,'Resuelve la ecuación (primero ordénala)']];
const CI_FUERA=/fórmula general/i;
let CI=null;const CI_LAST={};
const ciRich=v=>rich(v).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
function ciCfg(u,g){const G=(UNITS[u].groups||[])[g];return (G&&G.cierre)||null;}
function ciItems(u,g){return ownStations(u).filter(x=>x.s.group===g);}
function ciNeutro(q){let t=String(q.q||'');for(const [re,to] of CI_NEUTRO)t=t.replace(re,to);return t===q.q?q:Object.assign({},q,{q:t});}
function ciShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function ciPick(u,g){
 const items=ciItems(u,g),cfg=ciCfg(u,g),n=(cfg&&cfg.n)||CI_N,out=[];
 const extra=cfg&&Array.isArray(cfg.practice)?ciShuffle(cfg.practice.slice()).slice(0,Math.max(0,cfg.take||0)):[];
 const pools=ciShuffle(items.map(({s,i})=>{
  let L=s.practice.filter(q=>lvlOf(q)>=2);if(!L.length)L=s.practice.slice();
  L=L.map(ciNeutro).filter(q=>!CI_FUERA.test(q.q));return {s,i,L:ciShuffle(L)};}).filter(p=>p.L.length));
 for(let k=0;out.length<n-extra.length&&pools.some(p=>p.L.length);k++){const p=pools[k%pools.length];if(p.L.length)out.push({q:p.L.pop(),st:p.s.title,i:p.i});}
 extra.forEach(q=>out.push({q,st:(cfg.title||'¿Qué método conviene?'),i:-1}));
 ciShuffle(out);
 for(let t=1;t<out.length;t++){if(out[t].st===out[t-1].st){const j=out.findIndex((x,k)=>k>t&&x.st!==out[t-1].st&&(k+1>=out.length||out[k+1].st!==out[t].st));if(j>0)[out[t],out[j]]=[out[j],out[t]];}}
 return out;}
function cierreCard(g,items){
 if(!items||items.length<2)return '';
 const u=selectedUnit,cfg=ciCfg(u,g),done=items.filter(x=>stationDone(x.i)===milestoneCount(x.s)).length,last=CI_LAST[u+':'+g],n=(cfg&&cfg.n)||CI_N;
 const st=last?'Último: '+last.c+'/'+last.n:done===items.length?'Recomendado ahora':'Al terminar el bloque';
 return `<button type="button" class="ci-card${done===items.length?' ready':''}" data-cierre="${g}" aria-label="Cierre del bloque: práctica mixta. ${esc(st)}"><span class="ci-ico" aria-hidden="true">⇄</span><span class="ci-copy"><strong>Cierre del bloque${cfg&&cfg.title?' · '+esc(cfg.title):''}</strong><small>Práctica mixta: ${n} ejercicios de las ${items.length} estaciones, sin decirte de cuál viene cada uno.</small></span><span class="ci-st">${esc(st)}</span></button>`;}
function openCierre(g){const u=selectedUnit;CI={u,g,phase:ciCfg(u,g)?'guia':'intro',qs:[],idx:0,a:[]};showOnly('cierre');renderCierre();breadcrumbs();}
function ciStart(){CI.qs=ciPick(CI.u,CI.g);CI.a=CI.qs.map(()=>'-');CI.pk=CI.qs.map(()=>null);CI.tv=CI.qs.map(()=>'');CI.idx=0;CI.conf=false;CI.phase='run';renderCierre();}
/* Navegación libre (24-11-2026): Anterior, Siguiente y los puntos; lo respondido se muestra con su retroalimentación. */
function ciGo(i){CI.idx=Math.max(0,Math.min(CI.qs.length-1,i));CI.conf=false;renderCierre();window.scrollTo({top:0,behavior:'instant'});}
function ciFinish(){const left=CI.a.filter(x=>x==='-').length;if(left&&!CI.conf){CI.conf=true;const w=$('ciWarn');if(w){w.textContent='Te '+(left===1?'queda 1 ejercicio':'quedan '+left+' ejercicios')+' sin responder. Puedes volver a ellos con los números de arriba, o pulsar otra vez «Ver resultado» para terminar igual.';w.classList.remove('hidden');}return;}
 CI.phase='res';const c=CI.a.filter(x=>x==='1').length;CI_LAST[CI.u+':'+CI.g]={c,n:CI.a.length};
 try{if(typeof mjRepMark==='function'){const bad=[...new Set(CI.qs.map((x,k)=>CI.a[k]==='0'&&x.i>=0?x.i:-1).filter(i=>i>=0))];if(bad.length)mjRepMark(bad);}}catch(e){}
 renderCierre();window.scrollTo({top:0,behavior:'instant'});}
function ciHead(){const G=UNITS[CI.u].groups[CI.g],num=String(CI.g+1).padStart(2,'0');return `<span class="eyebrow">UNIDAD ${UNITS[CI.u].roman} · BLOQUE ${num} · CIERRE</span><h1>${esc(G.title)}</h1>`;}
function ciIntroHTML(){
 const items=ciItems(CI.u,CI.g),cfg=ciCfg(CI.u,CI.g),n=(cfg&&cfg.n)||CI_N;
 const lista=`<ul class="ci-list">${items.map(x=>`<li>${esc(x.s.title)}</li>`).join('')}</ul>`;
 const como=`<div class="ci-how"><b>Cómo funciona</b><p>Son <b>${n} ejercicios</b> mezclados de estas estaciones:</p>${lista}<p>No te diremos de qué estación viene cada uno: lo primero es <b>reconocer qué hacer</b>. Tienes un intento por ejercicio y al final verás qué estación conviene repasar. No cuenta para tu avance.</p></div>`;
 if(CI.phase==='guia'){const f=cfg.figure&&cfg.figure.svg?`<figure class="ci-fig">${cfg.figure.svg}${cfg.figure.caption?`<figcaption>${esc(cfg.figure.caption)}</figcaption>`:''}</figure>`:'';
  return `<div class="ci-guide"><span class="eyebrow">ANTES DE PRACTICAR</span><h2>${esc(cfg.title||'¿Qué método conviene?')}</h2><div class="ci-guide-body"><div class="math-content">${cfg.idea?`<p>${ciRich(cfg.idea)}</p>`:''}${Array.isArray(cfg.pasos)&&cfg.pasos.length?`<ol class="ci-pasos">${cfg.pasos.map(x=>`<li>${ciRich(x)}</li>`).join('')}</ol>`:''}</div>${f}</div></div>${como}<div class="ci-row"><button type="button" class="primary-btn" id="ciGo">Empezar la práctica mixta</button><button type="button" class="ls-btn ghost" id="ciBack">Volver al mapa</button></div>`;}
 return `${como}<div class="ci-row"><button type="button" class="primary-btn" id="ciGo">Empezar</button><button type="button" class="ls-btn ghost" id="ciBack">Volver al mapa</button></div>`;}
function ciDots(){return `<div class="ci-dots" role="group" aria-label="Ejercicios">${CI.a.map((x,i)=>`<button type="button" data-cgo="${i}" class="${x==='1'?'ok':x==='0'?'bad':''}${i===CI.idx?' cur':''}" aria-label="Ejercicio ${i+1}${x==='1'?', correcto':x==='0'?', incorrecto':', sin responder'}"${i===CI.idx?' aria-current="step"':''}>${i+1}</button>`).join('')}</div>`;}
function ciQHTML(){
 const it=CI.qs[CI.idx],q=it.q,lab='EJERCICIO '+(CI.idx+1)+' DE '+CI.qs.length;
 let h;if(q.type==='input')h=renderTyped(q,0,lab,false);
 else h=`<article class="quiz" data-step="0"><div class="quiz-head"><span>${lab}</span><span>Por resolver</span></div><h3 class="math-content">${rich(q.q)}</h3><div class="choices">${q.options.map((o,k)=>`<button type="button" data-ck="${k}">${rich(o)}</button>`).join('')}</div><p class="feedback" role="status" aria-live="polite"></p></article>`;
 const last=CI.idx===CI.qs.length-1;
 return `${ciDots()}<div class="ci-q">${h}<div class="ci-after hidden" id="ciAfter"><p class="ci-from" id="ciFrom"></p><button type="button" class="primary-btn" id="ciNext">${last?'Ver resultado':'Siguiente ejercicio →'}</button></div><p class="ci-warn hidden" id="ciWarn" role="status" aria-live="polite"></p><div class="ci-nav"><button type="button" class="ls-btn ghost" id="ciPrev" ${CI.idx===0?'disabled':''}>← Anterior</button><button type="button" class="ls-btn ghost" id="ciSkip">${last?'Ver resultado':'Siguiente →'}</button></div></div>`;}
function ciSolved(ok,box,pick,replay){
 const it=CI.qs[CI.idx],q=it.q;CI.a[CI.idx]=ok?'1':'0';if(!replay){CI.pk[CI.idx]=pick==null?null:pick;window.chuReact&&chuReact(ok);}
 let corr='';if(q.type==='input'){let t='';try{t=PACETyped.answerTex(q);}catch(e){}corr='\\('+t+'\\)';}else corr=q.options[q.correct];
 const fb=box.querySelector('.feedback');fb.className='feedback '+(ok?'correct':'incorrect');
 fb.innerHTML=ok?'✓ '+rich(q.why||'Correcto.'):'✗ '+((pick!=null&&Array.isArray(q.fb)&&q.fb[pick])?'<b>'+rich(q.fb[pick])+'</b> ':'')+'La respuesta correcta es <span class="math-content">'+rich(corr)+'</span>. '+rich(q.why||'');
 box.querySelectorAll('button,input').forEach(b=>{b.disabled=true;});box.classList.add(ok?'ci-ok':'ci-bad');box.querySelectorAll('.keypad,.typed-hint,small').forEach(x=>{x.style.display='none';});
 const hd=box.querySelector('.quiz-head span:last-child');if(hd)hd.textContent=ok?'✓ Correcto':'✗ Incorrecto';
 $('ciFrom').innerHTML=it.i>=0?'Este ejercicio es de la estación <b>«'+esc(it.st)+'»</b>.':'Pregunta de <b>'+esc(it.st)+'</b>.';
 $('ciAfter').classList.remove('hidden');const dots=$('cierreView').querySelector('.ci-dots');if(dots){dots.outerHTML=ciDots();$('cierreView').querySelectorAll('[data-cgo]').forEach(b=>b.addEventListener('click',()=>ciGo(+b.dataset.cgo)));}
 typesetMath(box);if(!replay)$('ciNext').focus({preventScroll:true});}
function ciBindQ(){
 const root=$('cierreView'),box=root.querySelector('.quiz'),q=CI.qs[CI.idx].q;
 const fwd=()=>{if(CI.idx<CI.qs.length-1)ciGo(CI.idx+1);else ciFinish();};
 $('ciNext').addEventListener('click',fwd);$('ciSkip').addEventListener('click',fwd);$('ciPrev').addEventListener('click',()=>ciGo(CI.idx-1));
 root.querySelectorAll('[data-cgo]').forEach(b=>b.addEventListener('click',()=>ciGo(+b.dataset.cgo)));
 const done=CI.a[CI.idx]!=='-';
 if(q.type!=='input'){const pickB=(k,rep)=>{const b=box.querySelector('button[data-ck="'+k+'"]'),ok=k===q.correct;if(b)b.classList.add(ok?'correct':'wrong');if(!ok){const c=box.querySelector('button[data-ck="'+q.correct+'"]');if(c)c.classList.add('correct');}ciSolved(ok,box,k,rep);};
  if(done&&CI.pk[CI.idx]!=null){pickB(CI.pk[CI.idx],true);return;}
  box.querySelectorAll('button[data-ck]').forEach(b=>b.addEventListener('click',()=>{if(CI.a[CI.idx]!=='-')return;pickB(+b.dataset.ck,false);}));return;}
 const tb=box.querySelector('.typed'),inp=tb.querySelector('.typed-input'),prev=tb.querySelector('.typed-preview'),pad=tb.querySelector('.keypad'),kind=tb.dataset.kind;let tm=null;
 const upd=()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=PACETyped.previewTex(kind,inp.value);if(window.MathJax&&MathJax.typesetClear)MathJax.typesetClear([prev]);if(t===''||t===null){prev.textContent=t===null?inp.value:'';prev.classList.toggle('bad',t===null);}else{prev.classList.remove('bad');prev.innerHTML='\\('+t+'\\)';typesetMath(prev);}},120);};
 inp.addEventListener('input',upd);pad.addEventListener('mousedown',e=>e.preventDefault());
 pad.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;typedInsert(inp,b.dataset.key);inp.focus();upd();});
 if(done){inp.value=CI.tv[CI.idx]||'';upd();ciSolved(CI.a[CI.idx]==='1',box,null,true);return;}
 const go=()=>{if(CI.a[CI.idx]!=='-')return;const r=PACETyped.check(q,inp.value);CI.tv[CI.idx]=inp.value;
  if(r.state==='empty'||r.state==='invalid'||r.state==='reduce'){const fb=box.querySelector('.feedback');fb.textContent=r.state==='empty'?'Escribe tu respuesta antes de comprobar.':r.msg;fb.className='feedback incorrect';inp.focus();return;}
  ciSolved(r.state==='ok',box);};
 tb.querySelector('.typed-check').addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});}
function ciResHTML(){
 const c=CI.a.filter(x=>x==='1').length,N=CI.a.length,by={};
 CI.qs.forEach((x,k)=>{const key=x.st;(by[key]=by[key]||{t:x.st,i:x.i,c:0,n:0,d:[]});by[key].n++;if(CI.a[k]==='1')by[key].c++;by[key].d.push(CI.a[k]);});
 const rows=Object.values(by).map(r=>`<tr><td>${esc(r.t)}</td><td class="mt-dots">${r.d.map(d=>`<i class="d${d}"></i>`).join('')}</td><td><b>${r.c}/${r.n}</b></td><td>${r.c<r.n&&r.i>=0?`<button type="button" class="ls-btn ci-rep" data-rep="${r.i}">Repasar</button>`:r.c===r.n?'<span class="ci-okk">✓</span>':''}</td></tr>`).join('');
 const msg=c===N?'¡Muy bien! Reconociste qué hacer en todos los ejercicios.':c>=Math.ceil(N*0.75)?'Buen trabajo. Revisa las estaciones donde te equivocaste.':'Conviene repasar las estaciones marcadas antes de seguir.';
 return `<div class="ci-score"><b>${c}</b><span>de ${N} correctos</span></div><p class="ci-msg">${msg}</p><table class="ci-tab"><thead><tr><th>Estación</th><th>Ejercicios</th><th>Correctos</th><th></th></tr></thead><tbody>${rows}</tbody></table><div class="ci-row"><button type="button" class="primary-btn" id="ciGo">Otra ronda</button><button type="button" class="ls-btn ghost" id="ciBack">Volver al mapa</button></div>`;}
function renderCierre(){
 const root=$('cierreView');if(!CI){root.innerHTML='';return;}
 const body=CI.phase==='run'?ciQHTML():CI.phase==='res'?ciResHTML():ciIntroHTML();
 root.innerHTML=`<div class="ci-wrap">${ciHead()}${body}</div>`;
 const go=$('ciGo');if(go)go.addEventListener('click',ciStart);
 const bk=$('ciBack');if(bk)bk.addEventListener('click',()=>openMap(CI.u,CI.g));
 root.querySelectorAll('[data-rep]').forEach(b=>b.addEventListener('click',()=>openStation(+b.dataset.rep)));
 if(CI.phase==='run')ciBindQ();
 typesetMath(root);}
(function(){const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);try{$('route').querySelectorAll('[data-cierre]').forEach(b=>b.addEventListener('click',()=>openCierre(+b.dataset.cierre)));}catch(e){}return r;};})();

/* Navegación (20-11-2026, revisada 22-11-2026): un solo botón de volver por pantalla, que sube un nivel y dice adónde lleva.
   · Estación (y «Antes de empezar») → «Volver a la Unidad X» (en celular, «Unidad X»): vuelve a la pantalla de bloques de la unidad.
   · Pantalla de la unidad → «Todas las unidades» (en celular, «Unidades»):
       - curso completo (SCORM y HTML completo): abre la pantalla con las tres unidades;
       - páginas de cada unidad en GitHub (PACE_BUILD.portal): va a la portada del sitio, a la sección del curso;
       - exportación individual de una unidad (sin otras unidades): no hay botón, porque no hay nada más arriba.
   · Fuera del curso completo, la portada propia de cada unidad (con una sola tarjeta) se omite: la página abre directo
     en los bloques de la unidad. En GitHub, cualquier «ir al inicio» lleva a la portada del sitio (#curso). (22-11-2026) */
const NV_BACK='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NV_UNITS='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const NV_HOME='<svg class="nv-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 7.5 8 2.5l6 5M3.8 6.2V13.5h8.4V6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function nvUnitBtnHTML(r){return NV_BACK+'<span><span class="nv-long">Volver a la </span>Unidad '+esc(r)+'</span>';}
function nvMode(){let b={};try{b=(typeof PACE_BUILD!=='undefined'&&PACE_BUILD)||{};}catch(e){}
 if(b.scope==='curso_completo'||UNITS.filter(Boolean).length>1)return 'curso';return b.portal?'portal':'sola';}
(function(){
function paint(){try{
 const u=UNITS[selectedUnit],r=u?u.roman:'';
 const bm=$('backMap');if(bm){bm.className='nv-back';bm.innerHTML=nvUnitBtnHTML(r);bm.setAttribute('aria-label','Volver a la Unidad '+r);bm.title='Volver a la Unidad '+r+' (todos sus bloques)';}
 const bb=$('bottomHome');if(bb&&nvMode()!=='sola')bb.textContent='← Todas las unidades';
 let bh=$('backHome');if(bh){
  const m=nvMode();
  bh.className='nv-back';
  if(m==='sola'){bh.style.display='none';}
  else{bh.innerHTML=NV_UNITS+'<span><span class="nv-long">Todas las </span><span class="nv-cap">u</span>nidades</span>';bh.setAttribute('aria-label','Ver todas las unidades');bh.title='Ver todas las unidades';}
 }
}catch(e){}}
const NVM=nvMode();
if(NVM!=='curso'){
 let booted=false;const ui=Math.max(0,UNITS.findIndex(Boolean));
 openHome=function(){
  if(NVM==='portal'&&booted){try{location.href=PACE_BUILD.portal;return;}catch(e){}}
  booted=true;return openMap(ui);
 };
 ['backHome','bottomHome'].forEach(id=>{const o=$(id);if(!o)return;const c=o.cloneNode(true);o.replaceWith(c);
  if(NVM==='portal')c.addEventListener('click',()=>openHome());else c.style.display='none';});
 const ch=$('courseHome');if(ch)ch.style.display='none';
}
const _sh=showOnly;showOnly=function(v){const r=_sh.apply(this,arguments);try{document.body.dataset.view=v;}catch(e){}paint();return r;};
paint();
})();

/* Diagnóstico distribuido (22-11-2026): la primera vez que se entra a una estación, una pregunta «Antes de empezar».
   · Pregunta fija por estación: station.diag si existe; si no, la primera de nivel 2 de Practica (de preferencia escrita).
   · Botón «Omitir» bajo la respuesta (23-11-2026; antes «Todavía no lo sé»). Después solo se dice si acertó, sin explicación. Un intento.
   · No cuenta para el avance. Se registra en SiveducMD como interacción «estación.D.código» (respuesta «?» = no lo sabe).
   · Se guarda en el progreso (línea «D|…» del suspend_data) para no volver a preguntar. */
function dgQ(s){if(!s)return null;if(s.diag&&s.diag.q)return s.diag;const P=Array.isArray(s.practice)?s.practice:[];const L=P.filter(q=>lvlOf(q)===2);const T=L.filter(q=>q.type==='input');return T[0]||L[0]||P[0]||null;}
function dgMap(){if(!state.dg||typeof state.dg!=='object')state.dg={};return state.dg;}
function dgNeeded(i){const s=STATIONS[i];if(!s||!dgQ(s))return false;if(Object.hasOwn(dgMap(),s.id))return false;return stationDone(i)===0&&!Object.hasOwn(state.p,s.id);}
let DG=null;
(function(){
 const _os=openStation;
 openStation=function(i,tab){
  if(DG&&DG.pass){DG=null;return _os.apply(this,arguments);}
  if(!dgNeeded(i))return _os.apply(this,arguments);
  const s=STATIONS[i];selectedUnit=s.unit;stationIndex=i;
  try{document.body.dataset.u=UNITS[s.unit]&&UNITS[s.unit].id?UNITS[s.unit].id:String(s.unit);}catch(e){}
  DG={i,tab:tab||'learn',done:null,resp:null};showOnly('diag');renderDiag();breadcrumbs();
 };
 const _ser=serializeState;
 serializeState=function(){const base=_ser.apply(this,arguments);const m=dgMap();const k=Object.keys(m).filter(id=>STATIONS.some(s=>s.id===id)&&/^[10?]$/.test(m[id]));return k.length?base+'\nD|'+k.map(id=>id+':'+m[id]).join(','):base;};
 const _rc=restoreCompact;
 restoreCompact=function(raw){
  let dg={};const lines=String(raw).split('\n');const j=lines.findIndex(l=>l.startsWith('D|'));
  if(j>0){const L=lines.splice(j,1)[0].slice(2);for(const p of L.split(',')){const m=/^([A-Za-z0-9_-]{2,44}):([10?])$/.exec(p);if(m)dg[m[1]]=m[2];}}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.dg=dg;return r;
 };
})();
function dgGo(){const d=DG;if(!d)return;d.pass=true;openStation(d.i,d.tab);}
function renderDiag(){
 const root=$('diagView');if(!DG){root.innerHTML='';return;}
 const s=STATIONS[DG.i],q=dgQ(s),u=UNITS[s.unit],num=stLabel(DG.i);
 let body;
 if(q.type==='input')body=renderTyped(q,0,'PREGUNTA',false);
 else body=`<article class="quiz" data-step="0"><div class="quiz-head"><span>PREGUNTA</span><span></span></div><h3 class="math-content">${rich(q.q)}</h3><div class="choices">${q.options.map((o,k)=>`<button type="button" data-dk="${k}">${rich(o)}</button>`).join('')}</div><p class="feedback" role="status" aria-live="polite"></p></article>`;
 root.innerHTML=`<div class="dg-wrap"><div class="station-nav"><button type="button" class="nv-back" id="dgBack" aria-label="Volver a la Unidad ${esc(u.roman)}">${nvUnitBtnHTML(u.roman)}</button></div>
 <section class="dg-card"><span class="eyebrow">ANTES DE EMPEZAR · ESTACIÓN ${num}</span><h1>${esc(s.title)}</h1>
 <p class="dg-lead">Una sola pregunta para saber desde dónde partes. <b>No cuenta para tu avance</b>: respóndela con lo que sepas ahora. Si todavía no sabes cómo hacerla, pulsa <b>«Omitir»</b>, abajo de la respuesta.</p>
 <div class="dg-q">${body}<div class="dg-skip-row"><button type="button" class="dg-skip" id="dgIdk">Omitir esta pregunta</button></div></div>
 <div class="dg-after hidden" id="dgAfter" role="status" aria-live="polite"><p id="dgMsg"></p><button type="button" class="primary-btn" id="dgGo">Empezar la estación →</button></div></section></div>`;
 $('dgBack').onclick=()=>{DG=null;openMap(s.unit);};
 {const sk=root.querySelector('.dg-skip-row'),tb=root.querySelector('.typed');if(sk&&tb){const pv=tb.querySelector('.typed-preview');if(pv){pv.after(sk);sk.classList.add('in-typed');}}}
 $('dgIdk').onclick=()=>dgFinish('?',null);
 $('dgGo').onclick=dgGo;
 const box=root.querySelector('.quiz');
 if(q.type!=='input'){box.querySelectorAll('button[data-dk]').forEach(b=>b.addEventListener('click',()=>{if(DG.done)return;const k=+b.dataset.dk;b.classList.add('picked');dgFinish(k===q.correct?'1':'0',k);}));}
 else{
  const tb=box.querySelector('.typed'),inp=tb.querySelector('.typed-input'),prev=tb.querySelector('.typed-preview'),pad=tb.querySelector('.keypad'),kind=tb.dataset.kind;let tm=null;
  const upd=()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=PACETyped.previewTex(kind,inp.value);if(window.MathJax&&MathJax.typesetClear)MathJax.typesetClear([prev]);if(t===''||t===null){prev.textContent=t===null?inp.value:'';prev.classList.toggle('bad',t===null);}else{prev.classList.remove('bad');prev.innerHTML='\\('+t+'\\)';typesetMath(prev);}},120);};
  inp.addEventListener('input',upd);pad.addEventListener('mousedown',e=>e.preventDefault());
  pad.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;typedInsert(inp,b.dataset.key);inp.focus();upd();});
  const go=()=>{if(DG.done)return;const r=PACETyped.check(q,inp.value);
   if(r.state==='empty'||r.state==='invalid'||r.state==='reduce'){const fb=box.querySelector('.feedback');fb.textContent=r.state==='empty'?'Escribe tu respuesta, o pulsa «Omitir».':r.msg;fb.className='feedback incorrect';inp.focus();return;}
   dgFinish(r.state==='ok'?'1':'0',inp.value);};
  tb.querySelector('.typed-check').addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
 }
 typesetMath(root);
}
function dgFinish(code,resp){
 if(!DG||DG.done)return;DG.done=code;const s=STATIONS[DG.i],q=dgQ(s);
 dgMap()[s.id]=code;try{save();}catch(e){}
 try{reportInt('D',s,q,code==='?'?'?':resp,code==='1');}catch(e){}
 const root=$('diagView'),box=root.querySelector('.quiz');
 box.querySelectorAll('button,input').forEach(b=>{b.disabled=true;});box.querySelectorAll('.keypad,.typed-hint,small').forEach(x=>{x.style.display='none';});
 const fb=box.querySelector('.feedback');if(fb){fb.textContent='';fb.className='feedback';}
 const ik=root.querySelector('.dg-skip-row');if(ik)ik.style.display='none';
 if(code==='?'&&mode==='scorm'&&connected&&intN>0){try{set('cmi.interactions.'+(intN-1)+'.result','neutral');if(Array.isArray(q.options))set('cmi.interactions.'+(intN-1)+'.student_response','?');}catch(e){}}
 const msg={'1':'<b>¡Bien! Ya tienes una base</b> para esta estación. Aprende te ayudará a afirmarla.','0':'<b>No te preocupes:</b> esto es justamente lo que vas a aprender en esta estación.','?':'<b>Sin problema, para eso está esta estación.</b> Al terminarla, esta pregunta te resultará conocida.'}[code];
 $('dgMsg').innerHTML=msg;$('dgAfter').className='dg-after '+(code==='1'?'ok':'neutral');
 if(code==='1'&&window.chuReact)chuReact(true);
 $('dgGo').focus({preventScroll:true});
}

/* «Recuerda» (prototipo 22-11-2026, sugerencia #12 de la revisión didáctica).
   Una estación puede declarar en su JSON:  "recuerda":[{"titulo","texto","ejemplo"(TeX, opcional),"origen":"u2-s012"}]
   · Se cierra con «Entendido», con Esc o haciendo clic fuera del recuadro.
   · Nivel 1: el botón «Recuerda» (en Aprende y en Practica/Aplica) abre un recuadro encima de la pantalla,
     con lo esencial y un ejemplo. No se sale de la estación.
   · Nivel 2: «Ver la idea completa» abre una ventana con la idea de la estación de origen
     (copia hecha al construir el curso: r.ver). Se cierra con «Seguir con la estación».
   Mirar un «Recuerda» no registra avance, no responde preguntas y no activa «Antes de empezar» en la otra estación. */
(function(){
const R=t=>(typeof rb==='function'?rb:rich)(t||'');
function rcData(s){return (s&&Array.isArray(s.recuerda))?s.recuerda.filter(r=>r&&r.titulo):[];}
function rcVer(r){
 if(r.ver)return r.ver;
 try{const o=STATIONS.find(x=>x.id===r.origen);if(o){const u=UNITS[o.unit]||{},L=o.learn||{};return {roman:u.roman||'',title:o.title,goal:L.goal||'',idea:L.idea||o.concept||'',figure:L.figure||null};}}catch(e){}
 return null;
}
function rcClose(){document.querySelectorAll('.rc-pop,.rc-modal').forEach(e=>e.remove());const b=document.querySelector('.rc-btn');if(b)b.setAttribute('aria-expanded','false');}
function rcSet(el){try{typesetMath(el);}catch(e){try{MathJax.typesetPromise([el]);}catch(_){}}}
function rcPop(btn){
 const open=document.querySelector('.rc-pop');rcClose();if(open)return;
 const s=STATIONS[stationIndex],rs=rcData(s),stage=document.querySelector('#stationContent .zs-stage');if(!stage||!rs.length)return;
 const p=document.createElement('section');p.className='rc-pop';p.setAttribute('role','dialog');p.setAttribute('aria-label','Recuerda');
 p.innerHTML=rs.map((r,i)=>{const v=rcVer(r);return `<div class="rc-item">
   <div class="rc-from"><span class="rc-tag">RECUERDA</span>${v?`<span>Lo viste en <b>Unidad ${esc(v.roman)} · ${esc(v.title)}</b></span>`:''}</div>
   <h4 class="math-content">${R(r.titulo)}</h4>
   <div class="math-content rc-txt">${R(r.texto)}</div>
   ${r.ejemplo?`<div class="rc-ej math-content">$$${r.ejemplo}$$</div>`:''}
   <div class="rc-acts">${v?`<button type="button" class="rc-more" data-i="${i}">Ver la idea completa ↗</button>`:''}<button type="button" class="rc-ok">Entendido</button></div></div>`;}).join('');
 stage.appendChild(p);btn.setAttribute('aria-expanded','true');rcSet(p);
 p.querySelectorAll('.rc-ok').forEach(b=>b.onclick=()=>{rcClose();btn.focus();});
 p.querySelectorAll('.rc-more').forEach(b=>b.onclick=()=>rcModal(rs[+b.dataset.i],btn));
 const f=p.querySelector('button');if(f)f.focus();
}
function rcModal(r,btn){
 const v=rcVer(r);if(!v)return;rcClose();
 const s=STATIONS[stationIndex];
 const m=document.createElement('div');m.className='rc-modal';
 m.innerHTML=`<div class="rc-card" role="dialog" aria-modal="true" aria-label="Idea de la estación ${esc(v.title)}">
  <div class="rc-mhead"><div><span class="rc-tag">REPASO · UNIDAD ${esc(v.roman)}</span><h3>${esc(v.title)}</h3></div>
  <button type="button" class="rc-x" aria-label="Cerrar y seguir con la estación">✕</button></div>
  <div class="rc-mbody">${v.goal?`<p class="rc-goal math-content">${R(v.goal)}</p>`:''}
   <div class="${v.figure&&v.figure.svg?'rc-figwrap':''}"><div class="math-content rc-idea">${R(v.idea)}</div>${v.figure&&v.figure.svg?`<figure class="rc-fig">${v.figure.svg}</figure>`:''}</div></div>
  <div class="rc-mfoot"><span>Esto es solo un repaso: no cambia tu avance.</span><button type="button" class="rc-back">← Seguir con «${esc(s.title)}»</button></div></div>`;
 document.body.appendChild(m);rcSet(m);
 const close=()=>{rcClose();if(btn&&btn.isConnected)btn.focus();};
 m.querySelector('.rc-x').onclick=close;m.querySelector('.rc-back').onclick=close;
 m.addEventListener('click',e=>{if(e.target===m)close();});
 m.querySelector('.rc-back').focus();
}
document.addEventListener('pointerdown',e=>{const p=document.querySelector('.rc-pop');if(!p)return;if(p.contains(e.target)||e.target.closest('.rc-btn'))return;rcClose();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.rc-pop,.rc-modal')){e.stopPropagation();rcClose();}},true);
function rcMount(){
 rcClose();
 try{
  const s=STATIONS[stationIndex];if(!rcData(s).length)return;
  const host=document.querySelector('#stationContent .zs-jump')||document.querySelector('#stationContent .zs-quiz .zs-top');
  if(!host||host.querySelector('.rc-btn'))return;
  const b=document.createElement('button');b.type='button';b.className='rc-btn';b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','dialog');
  b.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8a4.6 4.6 0 0 0-2.7 8.3c.5.4.8 1 .8 1.6v.5h3.8v-.5c0-.6.3-1.2.8-1.6A4.6 4.6 0 0 0 8 1.8ZM6.2 14h3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>Recuerda</span>';
  b.title='Recordar lo que necesitas de estaciones anteriores';
  b.onclick=()=>rcPop(b);host.appendChild(b);
 }catch(e){}
}
try{const _l=zsRenderLearn;zsRenderLearn=function(){const r=_l.apply(this,arguments);rcMount();return r;};const _q=zsRenderQuiz;zsRenderQuiz=function(){const r=_q.apply(this,arguments);rcMount();return r;};}catch(e){}
const _sh2=showOnly;showOnly=function(v){if(v!=='station')rcClose();return _sh2.apply(this,arguments);};
})();

/* Mejoras pequeñas (23-11-2026)
   1) «Reiniciar avance»: solo en las páginas de unidad de GitHub (PACE_BUILD.portal) y en modo local (sin SiveducMD).
      Borra el avance de ESA unidad en este navegador y recarga.
   2) «Escribe solo el resultado»: en preguntas de número, si la respuesta escrita contiene operaciones que la respuesta
      esperada no tiene (3+4, 14/2, √49…), no se corrige ni cuenta como intento: se pide escribir solo el resultado. */
(function(){
 let mounted=false;
 function rlMount(kind){try{
  if(mounted||kind!=='local'||typeof PACE_BUILD==='undefined'||!PACE_BUILD.portal||mode!=='local')return;
  const chip=$('syncIndicator');if(!chip)return;mounted=true;
  const b=document.createElement('button');b.type='button';b.id='resetLocal';b.className='rl-btn';
  b.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Reiniciar avance</span>';
  b.title='Borrar el avance de esta unidad en este navegador';
  b.addEventListener('click',()=>{const u=UNITS.filter(Boolean)[0];
   if(!window.confirm('¿Borrar todo tu avance en la Unidad '+(u?u.roman:'')+' en este navegador?\n\nVolverás a empezar desde cero. No se puede deshacer.'))return;
   try{save=function(){return true;};localStorage.removeItem(KEY);}catch(e){}
   location.reload();});
  chip.insertAdjacentElement('afterend',b);
 }catch(e){}}
 const _sync=sync;sync=function(msg,kind){_sync.apply(this,arguments);rlMount(kind);};
 const T=window.PACETyped;
 if(T&&!T.__soloRes){const c0=T.check;
  const ops=x=>{let t=String(x||'').replace(/\s+/g,'').replace(/^[-−]/,'');
   while(/^\(.*\)$/.test(t)&&!/\).*\(/.test(t.slice(1,-1)))t=t.slice(1,-1).replace(/^[-−]/,'');
   if(/^\d+([.,]\d+)?\/\d+$/.test(t))t=t.replace('/','');
   const o=new Set();for(const ch of t){if('+-−*×·^()√/'.includes(ch))o.add(ch==='−'?'-':ch==='×'||ch==='·'?'*':ch);}return o;};
  T.check=function(q,v){const r=c0.apply(this,arguments);
   try{if(q&&q.kind==='number'&&r&&['ok','wrong','reduce'].includes(r.state)){const oa=ops(q.answer);const extra=[...ops(v)].filter(x=>!oa.has(x));
    if(extra.length)return {state:'invalid',msg:'Escribe solo el resultado, sin operaciones: por ejemplo, 7 en lugar de 3+4.'};}}catch(e){}
   return r;};
  T.__soloRes=true;}
})();

/* Mejoras del 24-11-2026 (sugerencias de Henry y Diego, y revisión del 24-11).
   · H1  En pantallas bajas (zoom 100 % en notebooks) la barra de la estación se oculta: se agrega un botón compacto
         «← Unidad» en la barra superior, que siempre está visible.
   · H6  META y simulacro: la respuesta escrita se guarda sola mientras se escribe (sin botón «Guardar respuesta»);
         al entregar con preguntas sin responder se listan para volver a ellas.
   · H7  Otra ronda de Practica o de Aplica por separado, sin perder el avance (líneas «R|» del suspend_data).
   · H8  Repaso sugerido: lo que recomienda el Cierre de bloque queda marcado en el mapa hasta hacer una ronda nueva de Practica.
   · H9  Al completar una estación por primera vez: ventana breve con el chucao y el paso siguiente.
   · H16 Mensaje del chucao: «Te faltan N estaciones para que tu chucao evolucione», con el avance de todo el curso. */

/* ---------- utilidades ---------- */
function mjRx(s){if(!state.rx||typeof state.rx!=='object')state.rx={};return state.rx[s.id]||{};}
function mjRxSet(s,o){if(!state.rx||typeof state.rx!=='object')state.rx={};state.rx[s.id]=Object.assign({},state.rx[s.id]||{},o);}
function mjSecDone(i,tab){const s=STATIONS[i],b=stationBits(i),dp=drawCount(s);const part=tab==='practice'?b.slice(1,1+dp):b.slice(1+dp);return part.length>0&&!part.includes('0');}
function mjFull(i){return stationDone(i)===milestoneCount(STATIONS[i]);}

/* ---------- persistencia: línea R| (rondas por sección, créditos y repaso sugerido) ---------- */
(function(){
 const _ser=serializeState;
 serializeState=function(){
  const base=_ser.apply(this,arguments),R=state.rx||{};
  const parts=Object.keys(R).filter(id=>STATIONS.some(s=>s.id===id)).map(id=>{const x=R[id]||{};
   return id+':'+(x.p|0).toString(36)+'.'+(x.c|0).toString(36)+'.'+(x.P?'P':'')+(x.C?'C':'')+(x.v!=null?'V'+(x.v|0).toString(36)+(x.w?'w':''):'')+(x.k?'K':'');})
   .filter(p=>!/:0\.0\.$/.test(p));
  return parts.length?base+'\nR|'+parts.join(','):base;
 };
 const _rc=restoreCompact;
 restoreCompact=function(raw){
  let rx={};const lines=String(raw).split('\n');const j=lines.findIndex(l=>l.startsWith('R|'));
  if(j>0){const L=lines.splice(j,1)[0].slice(2);
   for(const p of L.split(',')){const m=/^([A-Za-z0-9_-]{2,44}):([0-9a-z]{1,3})\.([0-9a-z]{1,3})\.(P?)(C?)(?:V([0-9a-z]{1,3})(w?))?(K?)$/.exec(p);
    if(m)rx[m[1]]={p:parseInt(m[2],36),c:parseInt(m[3],36),P:m[4]?1:0,C:m[5]?1:0,v:m[6]!=null?parseInt(m[6],36):null,w:m[7]?1:0,k:m[8]?1:0};}}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.rx=rx;return r;
 };
})();

/* ---------- H1: botón compacto para volver a la unidad ---------- */
function mjBackSync(){
 const top=document.querySelector('.app-top');if(!top)return;
 let b=document.getElementById('mjBack');
 if(!b){b=document.createElement('button');b.type='button';b.id='mjBack';b.className='nv-back';
  b.addEventListener('click',()=>{const o=document.getElementById('backMap');if(o)o.click();});
  const brand=top.querySelector('.brand');if(brand&&brand.nextSibling)top.insertBefore(b,brand.nextSibling);else top.appendChild(b);}
 const s=STATIONS[stationIndex],u=s&&UNITS[s.unit];
 if(u){b.innerHTML='<span aria-hidden="true">←</span> Unidad '+esc(u.roman);b.setAttribute('aria-label','Volver a la Unidad '+u.roman);}
}

/* ---------- H7: otra ronda por sección ---------- */
function mjRedo(tab){
 const i=stationIndex,s=STATIONS[i];if(!s)return;
 if(!canChange()){$('stationFeedback').textContent='La conexión SCORM no está disponible. No se puede iniciar otra ronda.';return;}
 const dp=drawCount(s),b=stationBits(i).split(''),x=mjRx(s);
 if(tab==='practice'){for(let k=1;k<=dp;k++)b[k]='0';mjRxSet(s,{P:1,p:(x.p|0)+1});}
 else{for(let k=dp+1;k<b.length;k++)b[k]='0';mjRxSet(s,{C:1,c:(x.c|0)+1});}
 state.p[s.id]=b.join('');activeTab=tab;state.tab=tab;
 const ok=save();renderStation();
 $('stationFeedback').textContent=ok?'↻ Nueva ronda de '+(tab==='practice'?'Practica':'Aplica')+'. Tu avance se mantiene.':'⚠ No se confirmó el guardado del progreso.';
}
function mjCanRedo(i,tab){const s=STATIONS[i];if(!s||!mjSecDone(i,tab))return false;return tab==='practice'?drawCount(s)<(s.practice||[]).length:checkCount(s)<checkBank(s).length;}
function mjRedoBox(){
 const host=document.querySelector('.zs-quiz .zs-qbody');if(!host||(activeTab!=='practice'&&activeTab!=='check'))return;
 const cur=host.querySelector('.zs-cur');const all=[...host.querySelectorAll(':scope > .quiz')];
 if(!cur||all.indexOf(cur)!==all.length-1||!mjCanRedo(stationIndex,activeTab))return;
 const nm=activeTab==='practice'?'Practica':'Aplica';
 const d=document.createElement('div');d.className='learn-finish mj-redo';
 d.innerHTML=`<button class="primary-btn" type="button">↻ Otra ronda de ${nm}</button><small>Son ejercicios nuevos del banco. Tu avance se mantiene: esta ronda no lo reduce.</small>`;
 d.querySelector('button').onclick=()=>mjRedo(activeTab);host.appendChild(d);
}

/* ---------- H8: repaso sugerido ---------- */
function mjRepNeeded(i){const s=STATIONS[i],x=mjRx(s);return x.v!=null&&!x.k;}
function mjRepCheck(i){   /* se quita sola al completar Practica en una ronda posterior a la recomendación */
 const s=STATIONS[i],x=mjRx(s);if(x.v==null||x.k)return false;
 const rp=(typeof roundP==='function')?roundP(s):roundOf(s);
 if(mjSecDone(i,'practice')&&(rp>x.v||!x.w)){mjRxSet(s,{k:1});return true;}return false;}
function mjRepMark(list){   /* list: índices de estaciones con errores en el Cierre */
 list.forEach(i=>{const s=STATIONS[i];if(!s)return;const rp=(typeof roundP==='function')?roundP(s):roundOf(s);mjRxSet(s,{v:rp,w:mjSecDone(i,'practice')?1:0,k:0});});
 try{save();}catch(e){}
}
function mjMapBadges(){
 const r=$('route');if(!r)return;
 r.querySelectorAll('.route-card[data-index]').forEach(c=>{const i=+c.dataset.index;if(!mjRepNeeded(i)||c.querySelector('.mj-rep'))return;
  const cp=c.querySelector('.route-copy');if(cp)cp.insertAdjacentHTML('beforeend','<span class="mj-rep" title="El Cierre del bloque recomienda repasar esta estación. La marca se quita al completar una ronda nueva de Practica."><b aria-hidden="true">!</b> Repaso sugerido</span>');
  c.setAttribute('aria-label',(c.getAttribute('aria-label')||'')+' Repaso sugerido.');});
}

/* ---------- H9: estación completada ---------- */
let mjWas=null;
function mjNextStation(i){const s=STATIONS[i],u=s.unit;const own=ownStations(u);const k=own.findIndex(x=>x.i===i);return k>=0&&k+1<own.length?own[k+1]:null;}
function mjCelebrate(i){
 const s=STATIONS[i],u=UNITS[s.unit],own=ownStations(s.unit),grp=own.filter(x=>x.s.group===s.group),lastOfGrp=grp.length&&grp[grp.length-1].i===i;
 const grpDone=grp.every(x=>mjFull(x.i));const nx=mjNextStation(i);
 let primary;
 if(lastOfGrp&&grp.length>=2&&grpDone&&typeof openCierre==='function')primary={t:'Ir al Cierre del bloque →',f:()=>{openMap(s.unit,s.group);openCierre(s.group);}};
 else if(nx)primary={t:'Siguiente estación: '+nx.s.title+' →',f:()=>openStation(nx.i)};
 else primary={t:'Volver a la Unidad '+u.roman,f:()=>openMap(s.unit)};
 const sec=[];
 if(!(primary.t.startsWith('Volver')))sec.push({t:'Volver a la Unidad '+u.roman,f:()=>openMap(s.unit)});
 if(mjCanRedo(i,'practice'))sec.push({t:'Otra ronda de Practica',f:()=>{openStation(i);mjRedo('practice');}});
 if(mjCanRedo(i,'check'))sec.push({t:'Otra ronda de Aplica',f:()=>{openStation(i);mjRedo('check');}});
 if(typeof hasExplore==='function'&&hasExplore(s))sec.push({t:'✦ Explora (opcional)',f:()=>{openStation(i);selectTab('explore');}});
 const img=(window.CHUCAO&&CHUCAO.img)?CHUCAO.img[Math.max(0,chucaoStage(completed()?100:Math.min(99.9,100*doneCount()/COUNT))-1)]:'';
 const ov=document.createElement('div');ov.className='mj-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','mjCelT');
 ov.innerHTML=`<div class="mj-dlg"><button type="button" class="mj-x" aria-label="Cerrar">✕</button>${img?`<img class="mj-chu" alt="" src="${img}">`:''}<span class="eyebrow">ESTACIÓN ${esc(stLabel(i))} COMPLETADA</span><h2 id="mjCelT">¡Bien hecho!</h2><p>Terminaste <b>${esc(s.title)}</b>. Tu avance quedó guardado.</p><div class="mj-acts"><button type="button" class="primary-btn" data-a="0">${esc(primary.t)}</button>${sec.map((x,k)=>`<button type="button" class="ls-btn ghost" data-a="${k+1}">${esc(x.t)}</button>`).join('')}</div></div>`;
 const acts=[primary,...sec];
 const close=()=>{ov.remove();document.removeEventListener('keydown',esck);if(prevFocus&&prevFocus.focus)try{prevFocus.focus({preventScroll:true});}catch(e){}};
 const esck=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
 const prevFocus=document.activeElement;
 ov.addEventListener('click',e=>{if(e.target===ov)close();});
 ov.querySelector('.mj-x').onclick=close;
 ov.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{close();acts[+b.dataset.a].f();});
 document.addEventListener('keydown',esck);document.body.appendChild(ov);
 ov.querySelector('[data-a="0"]').focus({preventScroll:true});
}
(function(){
 const _mark=mark;
 mark=function(step){
  const i=stationIndex,before=(i>=0&&STATIONS[i])?mjFull(i):true;
  const r=_mark.apply(this,arguments);
  try{const rep=mjRepCheck(i);if(rep)save();
   if(!before&&mjFull(i))setTimeout(()=>mjCelebrate(i),450);}catch(e){}
  return r;};
})();

/* ---------- H6: META y simulacro, respuestas escritas guardadas solas ---------- */
(function(){
 if(typeof metaBindQ!=='function')return;
 const _b=metaBindQ;
 metaBindQ=function(S){
  _b.apply(this,arguments);
  try{
   const idx=metaIdx,it=S.qs[idx],q=it.q;if(q.type!=='input')return;
   const root=$('metaBody'),box=root.querySelector('.typed'),inp=box.querySelector('.typed-input'),pad=box.querySelector('.keypad'),key=S.mode+S.n+':'+idx;
   const chk=box.querySelector('.typed-check');if(chk)chk.remove();
   const hint=document.createElement('p');hint.className='mj-auto';hint.textContent='Tu respuesta se guarda sola mientras escribes. Puedes cambiarla hasta entregar.';
   box.appendChild(hint);
   let pt=null;
   const auto=()=>{
    const v=inp.value;metaVals[key]=v;const r=PACETyped.check(q,v);const ch=r.state==='empty'?'-':(r.state==='ok'?'1':'0');
    S.a[idx]=ch;const sv=$('mtSaved');if(sv){sv.textContent=ch==='-'?'Sin responder':'✓ Respuesta guardada';sv.classList.toggle('on',ch!=='-');}
    const fb=$('mtFb');if(fb){
     if(r.state==='invalid'){fb.textContent='Revisa cómo está escrita: '+(r.msg||'no se entiende la respuesta.')+' Si la entregas así, se contará incorrecta.';fb.className='feedback incorrect';}
     else if(r.state==='reduce'){fb.textContent='Aún no está simplificada: así se contará incorrecta. Puedes corregirla antes de entregar.';fb.className='feedback incorrect';}
     else{fb.textContent='';fb.className='feedback';}}
    metaPalette(S);clearTimeout(pt);pt=setTimeout(()=>{try{metaPersist();}catch(e){}},700);
   };
   inp.addEventListener('input',auto);
   pad.addEventListener('click',e=>{if(e.target.closest('button[data-key]'))setTimeout(auto,0);});
   inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();auto();}},true);
  }catch(e){}
 };
 const _r=renderMeta;
 renderMeta=function(){
  const r=_r.apply(this,arguments);
  try{mjChoices($('metaView'));}catch(e){}
  try{const S=metaSess&&metaSess();if(S&&metaConfirm&&metaPhase!=='hub'&&!S.e){const w=document.querySelector('.mt-warn');const miss=S.a.map((c,i)=>c==='-'?i:-1).filter(i=>i>=0);
   if(w&&miss.length&&!w.querySelector('.mj-miss')){w.insertAdjacentHTML('beforeend',`<span class="mj-miss">Sin responder: ${miss.map(i=>`<button type="button" class="linklike" data-mjgo="${i}">${i+1}</button>`).join(' ')}</span>`);
    w.querySelectorAll('[data-mjgo]').forEach(b=>b.onclick=()=>{metaIdx=+b.dataset.mjgo;metaConfirm=false;renderMeta();});}}}catch(e){}
  return r;};
})();

/* ---------- H16: mensaje del chucao ---------- */
function mjStationsToStage(){   /* estaciones completas mínimas para alcanzar la siguiente etapa (0, 25, 50, 75 %) */
 const TH=[0,25,50,75,100],p=completed()?100:Math.min(99.9,COUNT>0?100*doneCount()/COUNT:0),st=chucaoStage(p);
 if(st>=4)return null;
 const need=Math.ceil(TH[st]*COUNT/100)-doneCount();if(need<=0)return 1;
 const rest=STATIONS.map((s,i)=>milestoneCount(s)-stationDone(i)).filter(x=>x>0).sort((a,b)=>a-b);
 let acc=0,k=0;for(const r of rest){acc+=r;k++;if(acc>=need)break;}return Math.max(1,k);}
(function(){
 const _pm=paintMascot;
 paintMascot=function(){const r=_pm.apply(this,arguments);
  try{const n=document.getElementById('chuMapNext');if(n){const k=mjStationsToStage();
    if(k!=null)n.textContent=(k===1?'Te falta 1 estación':'Te faltan '+k+' estaciones')+' para que tu chucao evolucione.';
    else if(!completed())n.textContent='Completa las estaciones y la META FINAL de las tres unidades para que tu chucao llegue a su última etapa.';}}catch(e){}
  return r;};
})();

/* ---------- H15: alternativas largas en una columna ---------- */
function mjChoices(root){(root||document).querySelectorAll('.choices').forEach(c=>{const bs=[...c.children];const long=bs.some(b=>(b.textContent||'').replace(/\s+/g,' ').length>56);c.classList.toggle('mj-long',long);});}

/* ---------- ganchos en el dibujo de estación y mapa ---------- */
(function(){
 const _rs=renderStation;
 renderStation=function(){const r=_rs.apply(this,arguments);try{mjBackSync();mjRedoBox();mjChoices($('stationContent'));}catch(e){}return r;};
 if(typeof renderCierre==='function'){const _rc=renderCierre;renderCierre=function(){const r=_rc.apply(this,arguments);try{mjChoices($('cierreView'));}catch(e){}return r;};}
 if(typeof renderDiag==='function'){const _rd=renderDiag;renderDiag=function(){const r=_rd.apply(this,arguments);try{mjChoices($('diagView'));}catch(e){}return r;};}
 const _rm=renderMap;
 renderMap=function(){const r=_rm.apply(this,arguments);try{mjMapBadges();}catch(e){}return r;};
})();

/* H9 (ventanas informativas): «¿Qué puedes hacer aquí?» de Explora se cierra con Esc o con un clic fuera */
document.addEventListener('click',e=>{document.querySelectorAll('details.zs-exinfo[open]').forEach(d=>{if(!d.contains(e.target))d.removeAttribute('open');});});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const d=document.querySelector('details.zs-exinfo[open]');if(d){d.removeAttribute('open');const s=d.querySelector('summary');if(s)s.focus();}});

/* 38 · Accesibilidad de las fórmulas: cada fórmula se lee con un nombre en texto (rol img + aria-label a partir del TeX)
   y deja de ser una parada del tabulador. Así una alternativa que es solo una fórmula tiene nombre para el lector de pantalla. */
function mjTexPlain(t){let s=String(t||'');
 for(let k=0;k<4;k++)s=s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)').replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g,'raíz $1-ésima de ($2)').replace(/\\sqrt\{([^{}]*)\}/g,'raíz de ($1)');
 s=s.replace(/\\left|\\right|\\displaystyle|\\[,;:! ]|~/g,' ').replace(/\\cdot|\\times/g,' · ').replace(/\\div/g,' ÷ ').replace(/\\leq?\b/g,' ≤ ').replace(/\\geq?\b/g,' ≥ ')
  .replace(/\\neq?\b/g,' ≠ ').replace(/\\pm/g,' ± ').replace(/\\pi/g,'π').replace(/\\infty/g,'infinito').replace(/\\in\b/g,' pertenece a ').replace(/\\mathbb\{(\w)\}/g,'$1')
  .replace(/\\(text|mathrm|operatorname)\{([^{}]*)\}/g,'$2').replace(/\^\{([^{}]*)\}/g,'^($1)').replace(/_\{([^{}]*)\}/g,'_$1').replace(/\\[a-zA-Z]+/g,' ').replace(/[{}]/g,'').replace(/\s+/g,' ').trim();
 return s.replace(/\^\((\w)\)/g,'^$1');}
function mjA11y(root){try{
 if(!(window.MathJax&&MathJax.startup&&MathJax.startup.document))return;
 for(const m of MathJax.startup.document.getMathItemsWithin(root||document.body)){const c=m.typesetRoot;if(!c||c.dataset.mjA11y)continue;
  c.dataset.mjA11y='1';c.removeAttribute('tabindex');c.setAttribute('role','img');c.setAttribute('aria-label',mjTexPlain(m.math));
  c.querySelectorAll('mjx-assistive-mml').forEach(x=>x.setAttribute('aria-hidden','true'));}
}catch(e){}}
typesetMath=function(el){if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([el]).then(()=>mjA11y(el)).catch(()=>{});};
(function mjA11yBoot(n){if(window.MathJax&&MathJax.startup&&MathJax.startup.promise){MathJax.startup.promise.then(()=>mjA11y(document.body));}else if(n<60)setTimeout(()=>mjA11yBoot(n+1),250);})(0);

/* 49 · «Tu ruta de aprendizaje»: si aún no se ha empezado, no decir «Retoma tu ruta», sino «Empieza aquí» */
(function(){if(typeof renderHome!=='function')return;const _rh=renderHome;
 renderHome=function(){_rh.apply(this,arguments);try{
  const nuevo=!state.last&&overall()===0,sm=document.querySelector('.resume-inline .resume-small'),p=document.querySelector('#ptCurso .welcome-copy > p'),b=$('resumeBtn');
  if(sm)sm.textContent=nuevo?'EMPIEZA AQUÍ':'RETOMA TU RUTA';
  if(p)p.textContent=nuevo?'Comienza por la primera estación o elige una unidad.':'Retoma donde quedaste o elige una unidad.';
  if(b)b.innerHTML=(nuevo?'Comenzar':'Continuar')+' <span aria-hidden="true">'+(nuevo?'→':'↗')+'</span>';
  if(nuevo&&STATIONS[0])$('resumeDescription').textContent='Unidad '+UNITS[STATIONS[0].unit].roman+' · primera estación';
 }catch(e){}};})();

/* 50 · Límite de 2000 respuestas registradas por intento SCORM: avisar una vez (el avance se sigue guardando) */
let mjIntWarned=false;
function mjIntFull(){if(mjIntWarned)return;mjIntWarned=true;try{
 const el=document.createElement('div');el.className='mj-toast';el.setAttribute('role','status');
 el.textContent='Llegaste al máximo de respuestas que SiveducMD registra en detalle en este intento. Tu avance y tus evaluaciones se siguen guardando.';
 document.body.appendChild(el);setTimeout(()=>el.remove(),9000);}catch(e){}}

/* PACE UACh · Árbol de progreso · componente sin dependencias
 * v1.0 (Henry, 24-11-2026): reglas, estados, API (montar/actualizar/crearSVG) y animación.
 * v2.0 (24-11-2026): nueva ilustración con la misma API y las mismas reglas.
 *   - El árbol crece hacia arriba: los bloques 1 y 2 son las ramas bajas, y los bloques 3 y 4, las altas.
 *   - Ramas y tronco que se afinan, ramitas para cada estación, copa de fondo y suelo con pasto.
 *   - Colores de unidad de la paleta del curso (I azul, II ciruela, III ocre).
 *   - Flor en la punta de la rama cuando el bloque está terminado (bloque.florece); frutos en las cuatro ramas al finalizar la unidad. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PaceArbol = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  /* ramas: [x0,y0, c1x,c1y, c2x,c2y, x1,y1] (curva cúbica desde el tronco hasta la punta), en el orden de los bloques 1-4 */
  const UNIDADES = Object.freeze({
    U1: { nombre:'Números', cantidades:[4,4,4,2], color:'#2F6DB0', claro:'#e6eff8', oscuro:'#1f4f84', forma:'robusto', vaiven:0,
      ramas:[[204,216,172,206,112,204,44,182],[216,210,250,200,310,196,378,172],[206,158,182,134,130,116,70,86],[214,152,240,126,290,108,352,76]] },
    U2: { nombre:'Factorizaciones', cantidades:[3,4,2,3], color:'#9C3D7A', claro:'#f6e8f1', oscuro:'#742b5a', forma:'esbelto', vaiven:-10,
      ramas:[[204,222,160,224,98,214,48,176],[214,214,262,216,322,202,376,162],[202,160,170,150,120,126,82,78],[208,152,244,142,296,116,338,68]] },
    U3: { nombre:'Ecuaciones', cantidades:[4,2,4,1], color:'#A8741F', claro:'#f8efdf', oscuro:'#7c5414', forma:'asimétrico', vaiven:12,
      ramas:[[206,220,166,216,108,218,46,198],[218,198,260,182,320,172,382,140],[214,162,186,142,136,130,74,100],[222,138,244,106,286,82,336,54]] }
  });
  const HOJAS = Object.freeze({ pendiente:{color:'#C9CBC2',borde:'#8F948A'}, en_progreso:{color:'#B5CA80',borde:'#7E9550'}, completada:{color:'#4F9A4A',borde:'#2F6B33'} });
  const ESTADOS = Object.keys(HOJAS);
  const ETIQUETAS = {pendiente:'Pendiente',en_progreso:'En progreso',completada:'Completada'};
  const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const round = n => Number(n.toFixed(1));
  function punto(r,t){const a=1-t;return [a*a*a*r[0]+3*a*a*t*r[2]+3*a*t*t*r[4]+t*t*t*r[6],a*a*a*r[1]+3*a*a*t*r[3]+3*a*t*t*r[5]+t*t*t*r[7]];}
  function tangente(r,t){const a=1-t;const dx=3*a*a*(r[2]-r[0])+6*a*t*(r[4]-r[2])+3*t*t*(r[6]-r[4]),dy=3*a*a*(r[3]-r[1])+6*a*t*(r[5]-r[3])+3*t*t*(r[7]-r[5]);const n=Math.hypot(dx,dy)||1;return [dx/n,dy/n];}
  /* polígono de una curva que se afina de w0 a w1 (ancho total) */
  function afinada(r,w0,w1){const N=22,L=[],R=[];for(let i=0;i<=N;i++){const t=i/N,[x,y]=punto(r,t),[tx,ty]=tangente(r,t),w=(w0+(w1-w0)*t)/2;L.push([x-ty*w,y+tx*w]);R.push([x+ty*w,y-tx*w]);}
    const [ex,ey]=punto(r,1),[tx,ty]=tangente(r,1),w=w1/2;
    return 'M'+L.map(p=>round(p[0])+' '+round(p[1])).join('L')+`Q${round(ex+tx*w*1.6)} ${round(ey+ty*w*1.6)} `+R.reverse().map(p=>round(p[0])+' '+round(p[1])).join('L')+'Z';}
  function posiciones(n){return Array.from({length:n},(_,i)=>n===1?.62:.3+.5*i/(n-1));}
  function normalizar(data){
    if(!data || !Object.hasOwn(UNIDADES,data.unidad)) throw new Error('Unidad desconocida: use U1, U2 o U3.');
    const config=UNIDADES[data.unidad];
    if(!Array.isArray(data.bloques)||data.bloques.length!==4) throw new Error('El diseño actual requiere exactamente cuatro bloques.');
    const ids=new Set(); const blockIds=new Set();
    const bloques=data.bloques.map((b,i)=>{
      if(!b || typeof b.id!=='string'||!b.id||blockIds.has(b.id)) throw new Error('ID de bloque ausente o repetido.');blockIds.add(b.id);
      if(!Array.isArray(b.estaciones)||!b.estaciones.length) throw new Error('Cada bloque debe tener al menos una estación.');
      const estaciones=b.estaciones.map(s=>{
        if(!s||typeof s.id!=='string'||!s.id||ids.has(s.id))throw new Error('ID de estación ausente o repetido.');ids.add(s.id);
        if(!ESTADOS.includes(s.estado))throw new Error('Estado de estación inválido: '+s.estado);
        return {id:s.id,nombre:s.nombre||s.id,estado:s.estado};
      });
      const completo=estaciones.every(s=>s.estado==='completada');
      return {id:b.id,nombre:b.nombre||`Bloque ${i+1}`,estaciones,completo,florece:completo&&b.florece!==false};
    });
    const todas=bloques.flatMap(b=>b.estaciones),completadas=todas.filter(s=>s.estado==='completada').length;
    const todasCompletadas=completadas===todas.length;
    return {unidad:data.unidad,config,bloques,total:todas.length,completadas,enProgreso:todas.filter(s=>s.estado==='en_progreso').length,pendientes:todas.filter(s=>s.estado==='pendiente').length,todasCompletadas,finalizada:data.unidadFinalizada===true&&todasCompletadas,inconsistente:data.unidadFinalizada===true&&!todasCompletadas};
  }
  /* hojas dibujadas hacia arriba desde (0,0) */
  function hoja(estado,G){
    const h=HOJAS[estado];
    if(estado==='pendiente')return `<path d="M0 -2 C-6 -7 -6 -15 0 -20 C6 -15 6 -7 0 -2Z" fill="${h.color}" stroke="${h.borde}" stroke-width="1.5"/><path d="M-2 -8 Q-2 -14 0 -17" stroke="#fff" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round"/>`;
    if(estado==='en_progreso')return `<path d="M0 -2 C-11 -9 -13 -22 -3 -30 C5 -21 6 -10 0 -2Z" fill="${h.color}" stroke="${h.borde}" stroke-width="1.5"/><path d="M1 -3 C3 -12 9 -18 15 -19 C13 -10 8 -5 1 -3Z" fill="#D3E2A8" stroke="${h.borde}" stroke-width="1.3"/><path d="M-1 -5 Q-3 -15 -3 -25" stroke="${h.borde}" stroke-width="1" fill="none" opacity=".8"/>`;
    return `<path d="M0 -2 C-17 -10 -19 -30 -2 -44 C16 -32 15 -11 0 -2Z" fill="url(#${G}h)" stroke="${h.borde}" stroke-width="1.6"/><path d="M-1 -4 Q-1 -24 -2 -40" stroke="#D8EBB8" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M-1 -14 L-9 -21 M-1 -22 L7 -29 M-1 -29 L-8 -35" stroke="#D8EBB8" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".9"/>`;
  }
  function hito(c,fruto){
    if(fruto)return `<path d="M0 -14 Q1 -22 7 -25" stroke="#6E4A30" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M5 -22 C10 -28 18 -26 19 -21 C13 -19 9 -19 5 -22Z" fill="#4F9A4A" stroke="#2F6B33" stroke-width="1"/><circle cx="0" cy="-3" r="11.5" fill="${c.color}" stroke="${c.oscuro}" stroke-width="1.8"/><ellipse cx="-4" cy="-7" rx="3.2" ry="4.4" fill="#fff" opacity=".45"/>`;
    return Array.from({length:5},(_,i)=>`<ellipse cx="0" cy="-8.5" rx="6" ry="8.5" transform="rotate(${72*i})" fill="${c.color}" stroke="${c.oscuro}" stroke-width="1.1"/>`).join('')+`<circle r="4.6" fill="#F3C24A" stroke="${c.oscuro}" stroke-width="1"/>`;
  }
  let UID=0;
  function crearSVG(data,options={}){
    const k=++UID,G='ar'+k;
    const m=normalizar(data),c=m.config,animar=new Set(options.animarIds||[]),animarHitos=new Set(options.animarHitos||[]);
    const sw=c.vaiven,tronco=[210,298,206+sw*.2,250,214-sw*.4,190,210+sw,104];
    const parts=[`<svg class="pace-arbol__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" role="img" aria-label="${esc(`${c.nombre}: ${m.completadas} de ${m.total} estaciones completadas.${m.finalizada?' Unidad finalizada.':''}`)}"><title>${esc(c.nombre)} · árbol de progreso</title><desc>${esc(m.bloques.map((b,i)=>`Bloque ${i+1}: ${b.estaciones.map(s=>ETIQUETAS[s.estado]).join(', ')}${b.florece?' (florecido)':''}`).join('. '))}</desc>`,
      `<defs><linearGradient id="${G}m" x1="0" x2="1"><stop offset="0" stop-color="#A9764D"/><stop offset=".55" stop-color="#8C5D3C"/><stop offset="1" stop-color="#6E4A30"/></linearGradient><linearGradient id="${G}h" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3F8A3E"/><stop offset="1" stop-color="#6DB25E"/></linearGradient></defs>`,
      `<circle cx="210" cy="150" r="138" fill="${c.color}" fill-opacity=".1"/><circle cx="210" cy="150" r="138" fill="none" stroke="${c.color}" stroke-opacity=".18" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`,
      `<path d="M48 306 Q210 262 372 306 Z" fill="#CFE2B4"/><path d="M92 304 Q210 280 328 304" fill="none" stroke="#A9C98A" stroke-width="2"/>`,
      `<g stroke="#8DB46C" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M118 296 l-3 -8 M122 295 l1 -9 M126 296 l4 -7"/><path d="M292 296 l-3 -8 M296 295 l1 -9 M300 296 l4 -7"/><path d="M168 288 l-2 -6 M172 288 l2 -6"/></g>`];
    c.ramas.forEach((r,i)=>parts.push(`<path class="pace-arbol__rama" data-bloque="${esc(m.bloques[i].id)}" d="${afinada(r,i<2?18:14,3.4)}" fill="url(#${G}m)" stroke="#5E3F28" stroke-width="1.4" stroke-linejoin="round"/>`));
    parts.push(`<path d="${afinada(tronco,44,13)}" fill="url(#${G}m)" stroke="#5E3F28" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<path d="M197 268 q4 -6 2 -12 M222 236 q-4 -6 -1 -13 M200 206 q3 -5 1 -10" fill="none" stroke="#5E3F28" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`,
      `<path d="M203 290 Q208 250 205 214 Q203 186 207 160" fill="none" stroke="#C99A6B" stroke-width="3" stroke-linecap="round" opacity=".65"/>`,
      `<path d="M217 276 Q222 262 219 250" fill="none" stroke="${c.color}" stroke-width="3" stroke-linecap="round"/>`);
    m.bloques.forEach((b,j)=>{
      const r=c.ramas[j],n=b.estaciones.length,ts=posiciones(n),lp=punto(r,.17),lt=tangente(r,.17),lsg=-lt[0]>0?1:-1,label=[lp[0],lp[1]+13];
      b.estaciones.forEach((s,i)=>{
        const t=ts[i],[x,y]=punto(r,t),[tx,ty]=tangente(r,t);
        let nx=ty,ny=-tx;if(ny>0){nx=-nx;ny=-ny;}           /* normal hacia arriba */
        const lado=i%2===0?1:-1,ang=Math.atan2(ny,nx)+lado*0.42,L=9,bx=x+Math.cos(ang)*L,by=y+Math.sin(ang)*L;
        const rot=ang*180/Math.PI+90,esc2=(n>3?.92:1)*(s.estado==='completada'?(i%2?1.08:.96):1);
        parts.push(`<g class="pace-arbol__estacion" data-estacion="${esc(s.id)}" data-estado="${s.estado}"><title>${esc(s.nombre)} — ${ETIQUETAS[s.estado]}</title><path d="M${round(x)} ${round(y)} L${round(bx)} ${round(by)}" stroke="#6E4A30" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(${round(bx)} ${round(by)}) rotate(${round(rot)}) scale(${esc2})"><g class="pace-arbol__crecimiento${animar.has(s.id)?' pace-arbol__crecimiento--animar':''}">${hoja(s.estado,G)}</g></g></g>`);
      });
      parts.push(`<g class="pace-arbol__numero"><circle cx="${round(label[0])}" cy="${round(label[1])}" r="9.5" fill="#fff" stroke="${c.oscuro}" stroke-width="1.4"/><text x="${round(label[0])}" y="${round(label[1]+4)}" text-anchor="middle" font-size="11" font-weight="800" fill="${c.oscuro}">${j+1}</text></g>`);
      if(b.florece||m.finalizada){
        const type=m.finalizada?'fruto':'flor',[ex,ey]=punto(r,1),[tx,ty]=tangente(r,1),hx=ex+tx*7,hy=ey+ty*7+(type==='fruto'?16:0);
        parts.push(`<g class="pace-arbol__hito" data-hito="${type}" data-bloque="${esc(b.id)}" transform="translate(${round(hx)} ${round(hy)})"><title>${m.finalizada?'Unidad finalizada: fruto':'Bloque terminado: flor'}</title><g class="pace-arbol__crecimiento${animarHitos.has(b.id)?' pace-arbol__crecimiento--animar':''}">${hito(c,type==='fruto')}</g></g>`);
      }
    });
    return parts.join('')+'</svg>';
  }
  function montar(container,data,options={}){
    if(!container||typeof container.replaceChildren!=='function')throw new Error('Contenedor DOM requerido.');
    let prev=null,actual=null;
    function actualizar(next,{animar=true}={}){
      const m=normalizar(next),ids=[],hitos=[];
      if(animar&&prev&&prev.unidad===m.unidad){
        const old=new Map(prev.bloques.flatMap(b=>b.estaciones).map(s=>[s.id,s.estado]));
        m.bloques.forEach(b=>{b.estaciones.forEach(s=>{if(old.has(s.id)&&old.get(s.id)!==s.estado&&s.estado!=='pendiente')ids.push(s.id);});
          const before=prev.bloques.find(x=>x.id===b.id),antes=!!before&&(before.florece||prev.finalizada),ahora=b.florece||m.finalizada;
          if(ahora&&(!antes||prev.finalizada!==m.finalizada))hitos.push(b.id);});
      }
      const svg=crearSVG(next,{animarIds:ids,animarHitos:hitos});
      const doc=container.ownerDocument,template=doc.createElement('template');template.innerHTML=svg;
      const wrapper=doc.createElement('div');wrapper.className='pace-arbol';wrapper.style.setProperty('--pace-unidad',m.config.color);wrapper.append(template.content);
      if(options.resumen!==false){
        if(options.resumen!=='estado'){const p=doc.createElement('p');p.className='pace-arbol__resumen';p.textContent=`${m.completadas} de ${m.total} estaciones completadas`;wrapper.append(p);}
        const status=doc.createElement('p');status.className='pace-arbol__estado';
        status.textContent=m.finalizada?'Unidad finalizada: tu árbol dio frutos':m.todasCompletadas?'Todas las estaciones completadas · falta finalizar la unidad':[m.enProgreso?`${m.enProgreso} en progreso`:'',m.pendientes?`${m.pendientes} ${m.pendientes===1?'pendiente':'pendientes'}`:''].filter(Boolean).join(' · ');
        wrapper.append(status);}
      container.replaceChildren(wrapper);prev=m;actual=m;
      return m;
    }
    actualizar(data,{animar:false});
    return {actualizar,obtenerResumen:()=>({unidad:actual.unidad,total:actual.total,completadas:actual.completadas,enProgreso:actual.enProgreso,pendientes:actual.pendientes,todasCompletadas:actual.todasCompletadas,finalizada:actual.finalizada,inconsistente:actual.inconsistente}),destruir:()=>{container.replaceChildren();prev=null;actual=null;}};
  }
  function datosDemo(unidad){const c=UNIDADES[unidad];return {unidad,unidadFinalizada:false,bloques:c.cantidades.map((n,i)=>({id:`${unidad}-b${i+1}`,nombre:`Bloque ${i+1}`,estaciones:Array.from({length:n},(_,j)=>({id:`${unidad}-b${i+1}-e${j+1}`,nombre:`Bloque ${i+1}, estación ${j+1}`,estado:'pendiente'}))}))};}
  return {UNIDADES,HOJAS,ESTADOS,ETIQUETAS,normalizar,crearSVG,montar,datosDemo};
});

/* Árbol de progreso en el curso (24-11-2026). Componente: arbol-progreso.js (Henry v1 + ilustración v2).
 * Le entrega el avance REAL del motor; no guarda nada propio salvo qué Cierres de bloque se terminaron.
 *  - Estación: completada = todos sus hitos (Aprende, Practica, Aplica); en progreso = alguno; pendiente = ninguno.
 *  - Flor de un bloque = sus estaciones completas Y su Cierre de bloque terminado (bloques de 1 estación no tienen Cierre).
 *  - Frutos = unidad finalizada: todas sus estaciones completas y su META FINAL entregada (si la unidad tiene META).
 *  - Dónde: en el mapa de cada unidad, junto al chucao, y en miniatura en «Todas las unidades».
 *  - Avisos: al florecer una rama o al dar frutos, en la ventana de estación completada o en un aviso breve.
 * Persistencia: línea «B|u.g,u.g» en el avance guardado (Cierres terminados; unos pocos bytes). */
(function(){
 if(!window.PaceArbol)return;
 if(!state.cb)state.cb={};
 /* ---------- persistencia de Cierres terminados ---------- */
 const _ser=serializeState;
 serializeState=function(){const base=_ser.apply(this,arguments),k=Object.keys(state.cb||{}).filter(x=>/^\d\.\d{1,2}$/.test(x)&&state.cb[x]);return k.length?base+'\nB|'+k.join(','):base;};
 const _rc=restoreCompact;
 restoreCompact=function(raw){const lines=String(raw).split('\n'),j=lines.findIndex(l=>l.startsWith('B|'));let cb={};
  if(j>0){lines.splice(j,1)[0].slice(2).split(',').forEach(k=>{if(/^\d\.\d{1,2}$/.test(k))cb[k]=1;});}
  const r=_rc(lines.join('\n'));if(r&&r.val)r.val.cb=cb;return r;};
 const tieneCierre=(u,g)=>typeof ciItems==='function'&&ciItems(u,g).length>=2;
 if(typeof ciFinish==='function'){const _cf=ciFinish;ciFinish=function(){_cf.apply(this,arguments);
  try{if(CI&&CI.phase==='res'){const k=CI.u+'.'+CI.g;if(!state.cb)state.cb={};if(!state.cb[k]){state.cb[k]=1;save();}}}catch(e){}};}
 /* ---------- datos para el árbol ---------- */
 function arDatos(u){
  const U=UNITS[u];if(!U||!Array.isArray(U.groups)||U.groups.length!==4)return null;
  const k=/^u([123])$/.exec(String(U.id||''));if(!k)return null;   /* silueta y color según la unidad real (también en las páginas de una sola unidad) */
  const est=STATIONS.map((s,i)=>({s,i})).filter(x=>x.s.unit===u);
  const bloques=U.groups.map((g,gi)=>({id:U.id+'-b'+(gi+1),nombre:g.title,florece:!tieneCierre(u,gi)||!!(state.cb&&state.cb[u+'.'+gi]),
   estaciones:est.filter(x=>x.s.group===gi).map(x=>{const d=stationDone(x.i),m=milestoneCount(x.s);return {id:x.s.id,nombre:x.s.title,estado:d>=m?'completada':d>0?'en_progreso':'pendiente'};})}));
  if(bloques.some(b=>!b.estaciones.length))return null;
  const todas=bloques.every(b=>b.estaciones.every(e=>e.estado==='completada'));
  const meta=(typeof metaUnits==='function'&&metaUnits().includes(u))?metaDoneU(u):true;
  return {unidad:'U'+k[1],unidadFinalizada:todas&&meta,bloques};
 }
 window.arDatos=arDatos;
 /* ---------- dibujo ---------- */
 const inst={};
 function arMapa(){
  try{
   const card=document.getElementById('chuMap');if(!card||typeof selectedUnit==='undefined')return;
   const u=selectedUnit,d=arDatos(u);let box=document.getElementById('arMap');
   if(!d){if(box)box.remove();card.classList.remove('con-arbol');return;}
   if(!box){box=document.createElement('div');box.id='arMap';box.className='ar-map';box.innerHTML='<span class="ar-eb">TU ÁRBOL DE LA UNIDAD</span><div class="ar-svg"></div>';card.appendChild(box);card.classList.add('con-arbol');}
   const host=box.querySelector('.ar-svg');
   if(!inst.map||inst.host!==host){inst.map=PaceArbol.montar(host,d,{resumen:'estado'});inst.host=host;}
   else inst.map.actualizar(d,{animar:true});
  }catch(e){}
 }
 function arUnidades(){
  try{document.querySelectorAll('#unitsGrid .unit-card[data-unit]').forEach(c=>{
   const u=Number(c.dataset.unit),d=arDatos(u);const old=c.querySelector('.ar-mini');if(old)old.remove();if(!d)return;
   const m=document.createElement('div');m.className='ar-mini';m.setAttribute('aria-hidden','true');
   m.innerHTML=PaceArbol.crearSVG(d);const main=c.querySelector('.unit-main');(main||c).insertAdjacentElement('afterend',m);});
  }catch(e){}
 }
 const _pm=paintMascot;paintMascot=function(){_pm.apply(this,arguments);arMapa();};
 const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);arMapa();return r;};
 if(typeof renderHome==='function'){const _rh=renderHome;renderHome=function(){_rh.apply(this,arguments);arUnidades();};}
 /* ---------- avisos: rama florecida y frutos ---------- */
 let base=null;
 function foto(){return UNITS.map((_,u)=>{const d=arDatos(u);if(!d)return null;const m=PaceArbol.normalizar(d);return {f:m.bloques.map(b=>b.florece),fin:m.finalizada};});}
 function aviso(html){
  const dlg=document.querySelector('.mj-ov .mj-dlg');
  if(dlg){const p=document.createElement('p');p.className='ar-cel';p.innerHTML=html;const acts=dlg.querySelector('.mj-acts,.mj-actions');(acts||dlg.lastElementChild).insertAdjacentElement('beforebegin',p);return;}
  let box=document.getElementById('arToasts');if(!box){box=document.createElement('div');box.id='arToasts';box.setAttribute('role','status');document.body.appendChild(box);}
  const t=document.createElement('div');t.className='ar-toast';t.innerHTML=html;box.appendChild(t);setTimeout(()=>t.remove(),6500);
 }
 function revisar(){
  try{const ahora=foto();if(!base){base=ahora;return;}
   ahora.forEach((a,u)=>{const b=base[u];if(!a||!b)return;
    if(a.fin&&!b.fin){aviso('🍎 <b>¡Tu árbol de la Unidad '+UNITS[u].roman+' dio frutos!</b> Terminaste la unidad.');return;}
    a.f.forEach((x,g)=>{if(x&&!b.f[g])aviso('🌸 <b>¡Floreció la rama del bloque '+(g+1)+'</b> en tu árbol de la Unidad '+UNITS[u].roman+'!');});});
   base=ahora;}catch(e){}
 }
 const _sv=save;save=function(){const r=_sv.apply(this,arguments);setTimeout(revisar,700);return r;};
 setTimeout(()=>{if(!base)base=foto();},1500);
})();

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

/* META FINAL como último paso de la unidad (25-11-2026).
 *  - Mapa: tarjeta con el color de la unidad, la cuenta «estaciones + META FINAL = unidad completa» y un mensaje
 *    según el estado (pendiente, en curso, realizada; unidad completa o lo que falta).
 *  - «Todas las unidades»: cada tarjeta indica estaciones completadas y si la META FINAL está realizada.
 *  Solo presentación: usa el estado del motor (ownStations, stationDone, metaDoneU, state.mts) y abre openMeta como antes. */
(function(){
 const hayMeta=u=>!!(UNITS[u]&&UNITS[u].meta&&UNITS[u].meta.minutes);
 function cuenta(u){const a=ownStations(u);return {n:a.length,d:a.filter(x=>stationDone(x.i)===milestoneCount(x.s)).length};}
 const enCurso=u=>{const m=state.mts&&state.mts[u];return !!(m&&m.s&&!m.e);};
 const mejor=u=>{const m=state.mts&&state.mts[u];return m&&m.b>=0?m.b:null;};
 function tarjetaMapa(){
  try{
   const u=selectedUnit,fin=document.getElementById('mapFinish');if(!fin)return;
   if(!hayMeta(u)){fin.classList.remove('mu-card');return;}
   const U=UNITS[u],c=cuenta(u),run=enCurso(u),hecha=metaDoneU(u),est=c.d===c.n,b=mejor(u),falta=c.n-c.d;
   const completa=est&&hecha;
   let nota;
   if(completa)nota='<b>¡Unidad '+U.roman+' completa!</b> Terminaste sus '+c.n+' estaciones y entregaste la META FINAL. Puedes volver a intentarla para mejorar tu resultado.';
   else if(hecha)nota='Ya entregaste la META FINAL. Para completar la unidad '+(falta===1?'te falta 1 estación.':'te faltan '+falta+' estaciones.');
   else if(run)nota='Tu evaluación está en curso y el reloj sigue corriendo. La unidad queda completa cuando la entregues'+(est?'.':' y termines sus estaciones.');
   else nota='La Unidad '+U.roman+' queda completa cuando terminas sus '+c.n+' estaciones <b>y</b> entregas la META FINAL.'+(est?' Ya terminaste las estaciones: solo te falta la META FINAL.':'');
   const chip=(ok,txt,cls)=>'<span class="mu-chip '+(cls||(ok?'ok':'pend'))+'">'+(ok?'<i aria-hidden="true">✓</i>':'')+txt+'</span>';
   fin.classList.add('mu-card');fin.classList.toggle('mu-done',completa);
   fin.setAttribute('aria-label','META FINAL de la Unidad '+U.roman);
   fin.innerHTML=
    '<div class="mu-rib"><span aria-hidden="true">🏁</span> ÚLTIMO PASO DE LA UNIDAD '+U.roman+'</div>'+
    '<div class="mu-main"><div class="mu-ico" aria-hidden="true"><img data-mascot alt=""></div>'+
     '<div class="mu-copy"><span class="mu-eb">META FINAL</span><h2>'+(run?'Evaluación en curso':hecha?'META FINAL realizada':'Evaluación de la unidad')+'</h2>'+
     '<p>'+(run?'Continúa cuando quieras.':hecha?'Mejor resultado: <b>'+b+' %</b>.':U.meta.minutes+' minutos · con simulacro de práctica · el reloj parte cuando tú decides.')+'</p></div>'+
     '<button type="button" class="mu-btn" id="metaOpen">'+(run?'Continuar':hecha?'Ver META FINAL':'Conocer la META FINAL')+'</button></div>'+
    '<div class="mu-sum" aria-label="Para completar la unidad">'+
     chip(est,'Estaciones '+c.d+'/'+c.n)+'<span class="mu-op" aria-hidden="true">+</span>'+
     chip(hecha,hecha?'META FINAL':run?'META FINAL en curso':'META FINAL pendiente')+'<span class="mu-op" aria-hidden="true">=</span>'+
     chip(completa,completa?'Unidad completa':'Unidad '+U.roman+' completa',completa?'ok big':'goal')+'</div>'+
    '<p class="mu-note">'+nota+'</p>';
   document.getElementById('metaOpen').addEventListener('click',openMeta);
   paintMascot();
  }catch(e){}
 }
 function tarjetasUnidades(){
  try{document.querySelectorAll('#unitsGrid .unit-card[data-unit]').forEach(card=>{
   const u=Number(card.dataset.unit);if(!hayMeta(u)||!ownStations(u).length)return;
   const c=cuenta(u),hecha=metaDoneU(u),run=enCurso(u),b=mejor(u),st=card.querySelector('.unit-status');if(!st)return;
   const completa=hecha&&c.d===c.n;
   st.classList.add('mu-ustat');
   st.innerHTML='<span class="'+(c.d===c.n?'ok':'')+'">'+(c.d===c.n?'✓ ':'')+c.d+' de '+c.n+' estaciones</span>'+
    '<span class="'+(hecha?'ok':run?'run':'pend')+'">'+(hecha?'✓ META FINAL realizada ('+b+' %)':run?'META FINAL en curso':'META FINAL pendiente')+'</span>';
   card.classList.toggle('mu-complete',completa);
   card.setAttribute('aria-label','Unidad '+UNITS[u].roman+', '+UNITS[u].title+'. '+c.d+' de '+c.n+' estaciones completadas. META FINAL '+(hecha?'realizada':run?'en curso':'pendiente')+'. Abrir mapa');
  });}catch(e){}
 }
 const _rm=renderMap;renderMap=function(){const r=_rm.apply(this,arguments);tarjetaMapa();return r;};
 const _rh=renderHome;renderHome=function(){const r=_rh.apply(this,arguments);tarjetasUnidades();return r;};
})();

init();(()=>{const keep=mu;metaUnits().forEach(u=>{mu=u;metaExpiryCheck();});mu=keep;})();renderStreak();openHome();paceSub('inicio');
