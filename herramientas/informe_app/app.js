/* App de informe estadístico del curso PACE (26-11-2026).
 * Lee el informe «Interacciones» de SiveducMD (Excel/ODS/CSV), lo cruza con el catálogo de preguntas (PACE.cat)
 * y la estructura del curso (PACE.est), y arma las secciones elegidas. Todo ocurre en el navegador.
 * Tipos de ID que envía el curso:
 *   <estación>.P.<código>   Practica          <estación>.A.<código>   Aplica
 *   <estación>.D.<código>   «Antes de empezar» (diagnóstico; respuesta «?» = no sé)
 *   <estación>.M<n>.<código> META FINAL, intento oficial n (en el catálogo: <estación>.M.<código>)
 *   <estación>.TA           tiempo activo en Aprende (respuesta = segundos), desde el 26-11-2026 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const EST={};PACE.est.forEach(e=>{EST[e.id]=e;});
const CAT=PACE.cat;
const UN=[...new Map(PACE.est.map(e=>[e.u,{u:e.u,ur:e.ur,ut:e.ut}])).values()];
const MES={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11,
 january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11};
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=(x,d=1)=>x==null||!isFinite(x)?'—':Number(x).toLocaleString('es-CL',{maximumFractionDigits:d,minimumFractionDigits:0});
const pct=(a,b)=>b?Math.round(1000*a/b)/10:null;
const r1=x=>x==null||!isFinite(x)?null:Math.round(x*10)/10;
const mediana=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const cuantil=(a,q)=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),p=(s.length-1)*q,i=Math.floor(p);return s[i]+(s[Math.min(i+1,s.length-1)]-s[i])*(p-i);};
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','n':'ⁿ'};
function plano(t){ /* TeX sencillo -> texto legible (igual que informe_visual.py) */
 t=String(t||'').replace(/\\left|\\right/g,'').replace(/\^\\circ|\^\{\\circ\}/g,'°');
 for(let k=0;k<3;k++){t=t.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,'($1)/($2)').replace(/\\sqrt\{([^{}]*)\}/g,'√($1)').replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^{}]*)\}/g,'$1');}
 t=t.replace(/\^\{([-0-9n]+)\}/g,(m,g)=>[...g].map(c=>SUP[c]||c).join('')).replace(/\^([0-9n])/g,(m,g)=>SUP[g]);
 [['\\cdot','·'],['\\times','×'],['\\div','÷'],['\\le','≤'],['\\ge','≥'],['\\neq','≠'],['\\pm','±'],['\\Rightarrow','⇒'],['\\,',' '],['\\;',' '],['\\quad',' '],['\\qquad',' '],['\\%','%'],['\\{','{'],['\\}','}'],['\\Delta','Δ'],['\\pi','π'],['\\\\',' ']].forEach(([a,b])=>{t=t.split(a).join(b);});
 return t.replace(/\$/g,'').replace(/[{}]/g,'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
}
function fecha(v){
 if(v==null||v==='')return null;
 if(v instanceof Date)return isNaN(v)?null:v;
 if(typeof v==='number'&&v>20000&&v<80000)return new Date(Math.round((v-25569)*86400000));
 const s=String(v).toLowerCase();
 let m=/(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(\d{4})(?:[, ]+(\d{1,2}):(\d{2}))?/.exec(s);
 if(m&&MES[m[2]]!=null)return new Date(+m[3],MES[m[2]],+m[1],+(m[4]||0),+(m[5]||0));
 m=/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/.exec(s);if(m)return new Date(+m[3],+m[2]-1,+m[1]);
 m=/(\d{4})-(\d{2})-(\d{2})/.exec(s);if(m)return new Date(+m[1],+m[2]-1,+m[3]);
 return null;
}
const fstr=d=>d?d.toLocaleDateString('es-CL',{day:'numeric',month:'short',year:'numeric'}):'—';
const altsDe=s=>{const o={};String(s||'').split(' | ').forEach(a=>{const m=/^([a-z])\)\s?(.*)$/.exec(a.trim());if(m)o[m[1]]=m[2];});return o;};

/* ---------------- lectura ---------------- */
let REG=[],ARCH=[],SIN=new Set(),VISTOS=new Set();
function leerHoja(rows,nombre){
 let h=-1;
 for(let i=0;i<Math.min(15,rows.length);i++){if((rows[i]||[]).some(c=>/^(pregunta|question)\s*\d+$/i.test(String(c||'').trim()))){h=i;break;}}
 if(h<0)throw new Error('No encontré columnas «Pregunta 1», «Respuesta 1»… ¿Es el informe de Interacciones?');
 const enc=rows[h].map(c=>String(c==null?'':c).trim()),ix=re=>enc.findIndex(x=>re.test(x));
 const cNom=ix(/^(nombre|first name|nombre completo|full name|nombre\s*\/\s*apellido)/i),cApe=ix(/^(apellido|apellidos|apellido\(s\)|last name|surname)/i),
  cMail=ix(/(correo|e-?mail)/i),cInt=ix(/^(intento|attempt)$/i),cIni=ix(/^(comenzado|started)/i);
 const G={};
 enc.forEach((x,j)=>{const m=/^(pregunta|question|respuesta correcta|right answer|correct answer|respuesta|response|resultado|result)\s*(\d+)$/i.exec(x);if(!m)return;
  const k=/^(pregunta|question)$/i.test(m[1])?'q':/(correcta|right|correct)/i.test(m[1])?'c':/^(respuesta|response)$/i.test(m[1])?'r':'res';(G[m[2]]=G[m[2]]||{})[k]=j;});
 const nums=Object.keys(G).map(Number).sort((a,b)=>a-b);let n0=0,ests=new Set();
 for(const f of rows.slice(h+1)){
  if(!f||!f.length)continue;
  const nom=[cNom>=0?f[cNom]:'',cApe>=0?f[cApe]:''].filter(Boolean).join(' ').trim(),mail=String(cMail>=0&&f[cMail]||'').trim().toLowerCase();
  const est=mail||nom.toLowerCase();if(!est)continue;
  const intento=cInt>=0?Number(f[cInt])||1:1,inicio=cIni>=0?fecha(f[cIni]):null;
  for(const n of nums){
   const g=G[n];let id=g.q!=null?f[g.q]:null;if(id==null||id==='')continue;id=String(id).trim();
   const clave=est+'|'+intento+'|'+n+'|'+id;if(VISTOS.has(clave))continue;VISTOS.add(clave);
   const resp=g.r!=null&&f[g.r]!=null?String(f[g.r]).trim():'',rs=String(g.res!=null&&f[g.res]!=null?f[g.res]:'').trim().toLowerCase();
   const r={est,nombre:nom||mail,mail,intento,inicio,n,id,resp,ok:/^(correct|correcto|correcta|1|true)$/.test(rs),neutral:/^(neutral|neutro)$/.test(rs)};
   const sid=id.split('.')[0];r.sid=sid;r.e=EST[sid]||null;
   if(/\.TA$/.test(id)){r.tipo='TA';r.seg=parseFloat(String(resp).replace(',','.'))||0;}
   else{
    const m=/^(.+?)\.M(\d+)\.(\w+)$/.exec(id);let key=id;
    if(m){r.tipo='M';r.mn=+m[2];key=m[1]+'.M.'+m[3];}
    else if(/\.D\./.test(id))r.tipo='D';
    r.key=key;r.hash=id.split('.').pop();
    const c=CAT[key]||(m?CAT[m[1]+'.P.'+m[3]]:null);r.c=c;
    if(!r.tipo){r.tipo=c?(c[0]==='Aplica'?'A':c[0]==='Practica'?'P':/\.A\./.test(id)?'A':'P'):(/\.A\./.test(id)?'A':/\.P\./.test(id)?'P':'?');}
    if(!c)SIN.add(key);
    r.nosabe=r.tipo==='D'&&(r.neutral||resp==='?');
   }
   REG.push(r);n0++;ests.add(est);
  }
 }
 ARCH.push({nombre,resp:n0,est:ests.size});
}
async function cargar(files){
 const box=$('carga');box.innerHTML='Leyendo…';
 for(const f of files){
  try{const buf=await f.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];
   leerHoja(XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null}),f.name);}
  catch(e){ARCH.push({nombre:f.name,error:e.message||String(e)});}
 }
 resumenCarga();
}
function resumenCarga(){
 const box=$('carga'),ok=ARCH.filter(a=>!a.error);
 const ests=new Set(REG.map(r=>r.est)),fs=REG.map(r=>r.inicio).filter(Boolean),min=fs.length?new Date(Math.min(...fs)):null,max=fs.length?new Date(Math.max(...fs)):null;
 box.innerHTML=ARCH.map(a=>a.error?`<div class="warn">✗ ${esc(a.nombre)}: ${esc(a.error)}</div>`:`<div class="ok">✓ ${esc(a.nombre)}: ${nf(a.resp,0)} registros de ${nf(a.est,0)} estudiantes</div>`).join('')+
  (ok.length?`<div>En total: <b>${nf(ests.size,0)}</b> estudiantes y <b>${nf(REG.length,0)}</b> registros${min?`, que comenzaron entre el ${fstr(min)} y el ${fstr(max)}`:''}.`+
   (SIN.size?` <span class="warn">${nf(SIN.size,0)} preguntas no están en el catálogo</span> (quizás de una versión antigua del curso; se cuentan igual, sin enunciado).`:'')+`</div>`:'');
 $('paso2').hidden=!ok.length;
 if(ok.length&&!$('fDesde').value&&min){$('fDesde').value=iso(min);$('fHasta').value=iso(max);}
}
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

/* ---------------- opciones ---------------- */
const SECS=[
 ['resumen','Resumen general','Cifras principales del curso y de cada unidad.'],
 ['temas','Temas con más errores en el primer intento','Bloques y estaciones ordenados por % de error en la primera respuesta (Practica y Aplica) y en el primer intento de la META FINAL.'],
 ['preguntas','Preguntas con más errores','Las preguntas más difíciles (primera respuesta de cada estudiante), con el error más frecuente.'],
 ['seccion','Por sección y formato','Practica, Aplica y META FINAL; alternativas y respuesta escrita.'],
 ['diag','Diagnóstico «Antes de empezar»','Cómo llegan a cada estación y cómo les va después en su Practica.'],
 ['diagmeta','Diagnóstico vs META FINAL','Por estación: acierto al entrar y acierto en la META, y quién corrigió la misma pregunta.'],
 ['entsal','Prueba de entrada vs salida','Por unidad y por estudiante: todo el diagnóstico frente a toda la META FINAL.'],
 ['metaint','META FINAL: primer vs último intento','Cuántos repiten, cuánto mejoran y en qué temas.'],
 ['alts','Alternativas incorrectas más elegidas','Errores típicos en preguntas de alternativas.'],
 ['estud','Por estudiante','Actividad, errores, META FINAL y tiempo en Aprende de cada estudiante.'],
 ['tiempo','Tiempo en Aprende','Tiempo activo en la sección Aprende de cada estación (desde la versión del 26-11-2026).']];
function opciones(){
 $('secciones').innerHTML=SECS.map(([k,t,d])=>`<label class="sec"><input type="checkbox" value="${k}" checked><span><b>${esc(t)}</b><small>${esc(d)}</small></span></label>`).join('');
 $('fUnidades').innerHTML=UN.map(u=>`<label><input type="checkbox" value="${u.u}" checked> Unidad ${u.ur}</label>`).join('');
 document.querySelectorAll('[data-todas]').forEach(b=>b.onclick=()=>document.querySelectorAll('#secciones input').forEach(i=>{i.checked=b.dataset.todas==='1';}));
 $('verCat').textContent=PACE.generado+(PACE.version?' ('+PACE.version+')':'');
}
function filtros(){
 const us=new Set([...document.querySelectorAll('#fUnidades input:checked')].map(i=>i.value));
 const ex=new Set($('fExcluir').value.split(/[\s,;]+/).map(s=>s.trim().toLowerCase()).filter(Boolean));
 const d0=$('fDesde').value?new Date($('fDesde').value+'T00:00'):null,d1=$('fHasta').value?new Date($('fHasta').value+'T23:59:59'):null;
 return {us,ex,d0,d1,min:Math.max(1,parseInt($('fMin').value,10)||5),meta:(document.querySelector('input[name=fMeta]:checked')||{}).value||'primero',
  secs:new Set([...document.querySelectorAll('#secciones input:checked')].map(i=>i.value))};
}

/* ---------------- piezas de salida ---------------- */
let HOJAS=[];
function tabla(cols,rows,hoja,anchos){
 if(hoja)HOJAS.push({nombre:hoja,filas:[cols.map(c=>c.h),...rows.map(r=>r.map(v=>v==null?'':v))],anchos:anchos||cols.map(c=>c.w||14)});
 if(!rows.length)return '<p class="vacio">Sin datos con los filtros elegidos.</p>';
 return `<div class="tabla"><table><thead><tr>${cols.map(c=>`<th class="${c.num?'num':''}">${esc(c.h)}</th>`).join('')}</tr></thead><tbody>${
  rows.map(r=>`<tr>${r.map((v,j)=>{const c=cols[j];let t=v==null||v===''?'—':c.num?nf(v,c.d==null?1:c.d)+(c.suf||''):esc(v);
   if(c.signo&&v!=null&&v!=='')t=`<span class="${v>0?'pos':v<0?'neg':''}">${v>0?'+':''}${nf(v)}</span>`;return `<td class="${c.num?'num':''}${/^Unidad$/.test(c.h)?' nw':''}">${t}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function barras(items,o={}){
 if(!items.length)return '';const max=o.max||Math.max(1,...items.map(i=>Math.max(i.v||0,i.v2||0)));
 const ley=o.ley?`<div class="leyenda"><span><i></i>${esc(o.ley[0])}</span><span><i class="b"></i>${esc(o.ley[1])}</span></div>`:'';
 return ley+`<div class="bars${o.ley?' par':''}" role="img" aria-label="${esc(o.aria||'Gráfico de barras')}">${items.map(i=>`<div class="bar"><span class="lab" title="${esc(i.lab)}">${esc(i.lab)}</span><span>`+
  `<span class="trk"><span class="fil" style="width:${Math.max(0,Math.min(100,100*(i.v||0)/max))}%"></span></span>`+
  (o.ley?`<span class="trk"><span class="fil b" style="width:${Math.max(0,Math.min(100,100*(i.v2||0)/max))}%"></span></span>`:'')+
  `</span><span class="val">${nf(i.v)}${o.suf||''}${o.ley?' · '+nf(i.v2)+(o.suf||''):''}</span></div>`).join('')}</div>`;
}
const bloque=(k,t,desc,cuerpo,salto)=>`<section class="bloque${salto?' salto':''}" id="s-${k}"><h3>${esc(t)}</h3>${desc?`<p class="desc">${desc}</p>`:''}${cuerpo}</section>`;
const nomEst=sid=>EST[sid]?EST[sid].t:sid,uniEst=sid=>EST[sid]?'Unidad '+EST[sid].ur:'?';
const ordEst=sid=>EST[sid]?EST[sid].o:9999;

/* ---------------- análisis ---------------- */
function generar(){
 const F=filtros();HOJAS=[];
 const R=REG.filter(r=>!F.ex.has(r.est)&&!F.ex.has(r.mail)&&(!r.e||F.us.has(r.e.u))&&(!F.d0||!r.inicio||r.inicio>=F.d0)&&(!F.d1||!r.inicio||r.inicio<=F.d1));
 const Q=R.filter(r=>r.tipo==='P'||r.tipo==='A'),D=R.filter(r=>r.tipo==='D'),M=R.filter(r=>r.tipo==='M'),T=R.filter(r=>r.tipo==='TA');
 /* primera respuesta de cada estudiante a cada pregunta (Practica/Aplica) */
 const visto=new Set();[...Q].sort((a,b)=>a.est<b.est?-1:a.est>b.est?1:(a.intento-b.intento)||(a.n-b.n)).forEach(r=>{const k=r.est+'|'+r.key;r.pri=!visto.has(k);visto.add(k);});
 /* META: intentos oficiales por estudiante y unidad */
 const MI={};M.forEach(r=>{const u=r.e?r.e.u:'?',k=r.est+'|'+u;const o=MI[k]=MI[k]||{est:r.est,nombre:r.nombre,mail:r.mail,u,ints:{}};(o.ints[r.mn]=o.ints[r.mn]||[]).push(r);});
 Object.values(MI).forEach(o=>{const ns=Object.keys(o.ints).map(Number).sort((a,b)=>a-b);o.n1=ns[0];o.nU=ns[ns.length-1];o.nI=ns.length;
  const p=n=>pct(o.ints[n].filter(r=>r.ok).length,o.ints[n].length);o.p1=p(o.n1);o.pU=p(o.nU);});
 const metaSel=r=>{const o=MI[r.est+'|'+(r.e?r.e.u:'?')];return o&&r.mn===(F.meta==='ultimo'?o.nU:o.n1);};
 const M1=M.filter(r=>{const o=MI[r.est+'|'+(r.e?r.e.u:'?')];return o&&r.mn===o.n1;}),MU=M.filter(r=>{const o=MI[r.est+'|'+(r.e?r.e.u:'?')];return o&&r.mn===o.nU;}),MS=M.filter(metaSel);
 const ests=new Set(R.map(r=>r.est)),out=[];
 const unidadesSel=UN.filter(u=>F.us.has(u.u));

 if(F.secs.has('resumen')){
  const Qp=Q.filter(r=>r.pri),tEst={};T.forEach(r=>{tEst[r.est]=(tEst[r.est]||0)+r.seg;});
  const k=(v,t)=>`<div class="kpi"><b>${v}</b><span>${esc(t)}</span></div>`;
  const metaEst=new Set(M.map(r=>r.est)),inMed=mediana(Object.values(MI).map(o=>o.nI));
  let h=`<div class="kpis">${k(nf(ests.size,0),'estudiantes con registros')}${k(nf(Q.length,0),'respuestas en Practica y Aplica')}${k(nf(pct(Qp.filter(r=>!r.ok).length,Qp.length))+' %','de error en la primera respuesta')}${
   k(nf(pct(Q.filter(r=>!r.ok).length,Q.length))+' %','de error contando reintentos')}${k(nf(metaEst.size,0),'estudiantes rindieron alguna META FINAL')}${k(nf(pct(M1.filter(r=>r.ok).length,M1.length))+' %','de acierto en el 1.er intento de META')}${
   k(inMed==null?'—':nf(inMed),'intentos de META (mediana por unidad)')}${k(Object.keys(tEst).length?nf(mediana(Object.values(tEst))/60,0)+' min':'—','en Aprende por estudiante, todo el curso (mediana)')}</div>`;
  const filas=unidadesSel.map(u=>{const q=Q.filter(r=>r.e&&r.e.u===u.u),qp=q.filter(r=>r.pri),m1=M1.filter(r=>r.e&&r.e.u===u.u),mu=MU.filter(r=>r.e&&r.e.u===u.u),os=Object.values(MI).filter(o=>o.u===u.u);
   return ['Unidad '+u.ur+' · '+u.ut,new Set(q.concat(D.filter(r=>r.e&&r.e.u===u.u)).map(r=>r.est)).size,q.length,pct(qp.filter(r=>!r.ok).length,qp.length),os.length,pct(m1.filter(r=>r.ok).length,m1.length),pct(mu.filter(r=>r.ok).length,mu.length)];});
  h+=tabla([{h:'Unidad',w:34},{h:'Estudiantes',num:1,d:0},{h:'Respuestas',num:1,d:0},{h:'% error 1.ª respuesta',num:1,suf:' %'},{h:'Rindieron META',num:1,d:0},{h:'% acierto META 1.er intento',num:1,suf:' %'},{h:'% acierto META último intento',num:1,suf:' %'}],filas,'Resumen');
  h+=`<p class="nota">Cada estudiante recibe un sorteo distinto de preguntas: los porcentajes por pregunta solo son fiables con varias respuestas. La «primera respuesta» cuenta solo el primer intento de cada estudiante en cada pregunta y es la mejor medida de dificultad. Las respuestas escritas correctas pero sin simplificar cuentan como error.${SIN.size?` Hay ${nf(SIN.size,0)} preguntas sin coincidencia en el catálogo (ver hoja «Sin catálogo» del Excel).`:''}</p>`;
  if(SIN.size)HOJAS.push({nombre:'Sin catálogo',filas:[['ID sin coincidencia en el catálogo'],...[...SIN].sort().map(s=>[s])],anchos:[40]});
  out.push(bloque('resumen','Resumen general',`${nf(ests.size,0)} estudiantes · registros cargados: ${nf(R.length,0)}.`,h));
 }
 if(F.secs.has('temas')){
  const agr=(lista,clave)=>{const g=new Map();lista.forEach(r=>{if(!r.e)return;const k=clave(r);const o=g.get(k)||{n:0,e:0,est:new Set(),r:r};o.n++;o.e+=!r.ok;o.est.add(r.est);g.set(k,o);});return g;};
  const Qp=Q.filter(r=>r.pri);
  const bq=agr(Qp,r=>r.e.u+'|'+r.e.b),bm=agr(M1,r=>r.e.u+'|'+r.e.b);
  const fb=[...bq.entries()].map(([k,o])=>{const m=bm.get(k);return ['Unidad '+o.r.e.ur,'Bloque '+o.r.e.b+' · '+o.r.e.bt,o.est.size,o.n,pct(o.e,o.n),m?m.n:0,m?pct(m.e,m.n):null];}).sort((a,b)=>(b[4]||0)-(a[4]||0));
  const eq=agr(Qp,r=>r.sid),em=agr(M1,r=>r.sid);
  const fe=[...eq.entries()].filter(([k,o])=>o.n>=F.min).map(([k,o])=>{const m=em.get(k);return ['Unidad '+o.r.e.ur,'B'+o.r.e.b+' · '+o.r.e.bt,o.r.e.t,o.est.size,o.n,pct(o.e,o.n),m?m.n:0,m?pct(m.e,m.n):null];}).sort((a,b)=>(b[5]||0)-(a[5]||0));
  let h=`<h4>Estaciones con más error en la primera respuesta (Practica y Aplica)</h4>`+barras(fe.slice(0,12).map(f=>({lab:f[2],v:f[5],v2:f[7]})),{max:100,suf:' %',ley:['Practica y Aplica, 1.ª respuesta','META FINAL, 1.er intento'],aria:'Porcentaje de error por estación'});
  h+=`<h4>Por bloque</h4>`+tabla([{h:'Unidad',w:11},{h:'Bloque',w:38},{h:'Estudiantes',num:1,d:0},{h:'Primeras respuestas',num:1,d:0},{h:'% error 1.ª respuesta',num:1,suf:' %'},{h:'Respuestas META 1.er intento',num:1,d:0},{h:'% error META 1.er intento',num:1,suf:' %'}],fb,'Temas por bloque');
  h+=`<h4>Por estación</h4>`+tabla([{h:'Unidad',w:11},{h:'Bloque',w:30},{h:'Estación',w:34},{h:'Estudiantes',num:1,d:0},{h:'Primeras respuestas',num:1,d:0},{h:'% error 1.ª respuesta',num:1,suf:' %'},{h:'Respuestas META 1.er intento',num:1,d:0},{h:'% error META 1.er intento',num:1,suf:' %'}],fe,'Temas por estación');
  out.push(bloque('temas','Temas con más errores en el primer intento',`Ordenados de mayor a menor % de error en la primera respuesta de cada estudiante. Solo estaciones con al menos ${F.min} primeras respuestas.`,h,true));
 }
 if(F.secs.has('preguntas')){
  const g=new Map();Q.concat(M).forEach(r=>{const o=g.get(r.key)||{r,n:0,e:0,pn:0,pe:0,mal:new Map()};o.n++;if(!r.ok){o.e++;if(r.resp)o.mal.set(r.resp.toLowerCase(),(o.mal.get(r.resp.toLowerCase())||0)+1);}if(r.pri||r.tipo==='M'&&r.mn===((MI[r.est+'|'+(r.e?r.e.u:'?')]||{}).n1)){o.pn++;o.pe+=!r.ok;}g.set(r.key,o);});
  const fs=[...g.values()].filter(o=>o.pn>=F.min).map(o=>{const c=o.r.c||[],top=[...o.mal.entries()].sort((a,b)=>b[1]-a[1])[0];let malTxt='';
   if(top){const al=altsDe(c[5]);malTxt=al[top[0]]!=null?top[0]+') '+plano(al[top[0]]):top[0];malTxt+=` (${top[1]} ${top[1]===1?'vez':'veces'})`;}
   return [uniEst(o.r.sid),nomEst(o.r.sid),o.r.tipo==='M'?'META FINAL':c[0]||o.r.tipo,c[1]||'',c[2]||null,plano(c[3]||'(sin catálogo) '+o.r.key),plano(c[4]),o.pn,pct(o.pe,o.pn),o.n,pct(o.e,o.n),malTxt,o.r.key];})
   .sort((a,b)=>(b[8]||0)-(a[8]||0)||b[7]-a[7]);
  const h=tabla([{h:'Unidad',w:11},{h:'Estación',w:28},{h:'Sección',w:12},{h:'Formato',w:14},{h:'Nivel',num:1,d:0,w:7},{h:'Enunciado',w:60},{h:'Respuesta correcta',w:18},{h:'Primeras respuestas',num:1,d:0},{h:'% error 1.ª',num:1,suf:' %'},{h:'Respuestas',num:1,d:0},{h:'% error total',num:1,suf:' %'},{h:'Error más frecuente',w:26},{h:'ID',w:22}],fs.slice(0,40),null);
  HOJAS.push({nombre:'Preguntas',filas:[['Unidad','Estación','Sección','Formato','Nivel','Enunciado','Respuesta correcta','Primeras respuestas','% error 1.ª respuesta','Respuestas','% error total','Error más frecuente','ID'],...fs],anchos:[11,28,12,14,7,60,18,11,11,10,11,26,22]});
  out.push(bloque('preguntas','Preguntas con más errores',`Las 40 preguntas con mayor % de error en la primera respuesta (Practica y Aplica) o en el primer intento de la META, con al menos ${F.min} primeras respuestas. El Excel trae todas.`,h,true));
 }
 if(F.secs.has('seccion')){
  const g=new Map();Q.concat(M1).forEach(r=>{const s=r.tipo==='M'?'META FINAL (1.er intento)':r.tipo==='A'?'Aplica':'Practica',f=(r.c&&r.c[1])||'?',k=s+'|'+f;const o=g.get(k)||{s,f,n:0,e:0,pn:0,pe:0,est:new Set()};o.n++;o.e+=!r.ok;o.est.add(r.est);if(r.pri||r.tipo==='M'){o.pn++;o.pe+=!r.ok;}g.set(k,o);});
  const fs=[...g.values()].sort((a,b)=>a.s<b.s?-1:a.s>b.s?1:a.f<b.f?-1:1).map(o=>[o.s,o.f,o.est.size,o.n,pct(o.e,o.n),o.pn,pct(o.pe,o.pn)]);
  out.push(bloque('seccion','Por sección y formato','',tabla([{h:'Sección',w:24},{h:'Formato',w:18},{h:'Estudiantes',num:1,d:0},{h:'Respuestas',num:1,d:0},{h:'% error',num:1,suf:' %'},{h:'Primeras respuestas',num:1,d:0},{h:'% error 1.ª respuesta',num:1,suf:' %'}],fs,'Sección y formato')));
 }
 if(F.secs.has('diag')){
  const g=new Map();D.forEach(r=>{const o=g.get(r.sid)||{n:0,ok:0,ns:0};o.n++;o.ok+=r.ok;o.ns+=r.nosabe;g.set(r.sid,o);});
  const pq=new Map();Q.filter(r=>r.pri&&r.tipo==='P').forEach(r=>{const o=pq.get(r.sid)||{n:0,ok:0};o.n++;o.ok+=r.ok;pq.set(r.sid,o);});
  const fs=[...g.entries()].sort((a,b)=>ordEst(a[0])-ordEst(b[0])).map(([sid,o])=>{const p=pq.get(sid);return [uniEst(sid),nomEst(sid),o.n,pct(o.ok,o.n),pct(o.n-o.ok-o.ns,o.n),pct(o.ns,o.n),p?pct(p.ok,p.n):null];});
  const h=barras(fs.map(f=>({lab:f[1],v:f[3],v2:f[6]})),{max:100,suf:' %',ley:['Acierto al entrar','Acierto en Practica (1.ª respuesta)'],aria:'Acierto en el diagnóstico y en Practica por estación'})+
   tabla([{h:'Unidad',w:11},{h:'Estación',w:34},{h:'Estudiantes',num:1,d:0},{h:'% acierta al entrar',num:1,suf:' %'},{h:'% se equivoca',num:1,suf:' %'},{h:'% omite («no sé»)',num:1,suf:' %'},{h:'% acierto Practica (1.ª respuesta)',num:1,suf:' %'}],fs,'Diagnóstico');
  out.push(bloque('diag','Diagnóstico «Antes de empezar»','Una pregunta al entrar a cada estación. Compara cómo llegan con cómo les va en su Practica.',h,true));
 }
 if(F.secs.has('diagmeta')){
  const ent=new Map();D.forEach(r=>ent.set(r.est+'|'+r.sid,r));
  const g=new Map();
  MS.forEach(r=>{const d=ent.get(r.est+'|'+r.sid);if(!d)return;const o=g.get(r.sid)||{est:new Set(),de:new Map(),mn:0,mo:0,fo:new Set(),mis:0,misok:0};o.est.add(r.est);o.de.set(r.est,d.ok);o.mn++;o.mo+=r.ok;
   if(!d.ok){o.fo.add(r.est);if(r.hash===d.hash){o.mis++;o.misok+=r.ok;}}g.set(r.sid,o);});
  const fs=[...g.entries()].sort((a,b)=>ordEst(a[0])-ordEst(b[0])).map(([sid,o])=>{const pe=pct([...o.de.values()].filter(Boolean).length,o.de.size),pm=pct(o.mo,o.mn);
   return [uniEst(sid),nomEst(sid),o.est.size,pe,pm,pe!=null&&pm!=null?r1(pm-pe):null,o.fo.size,o.mis,pct(o.misok,o.mis)];});
  const h=barras(fs.map(f=>({lab:f[1],v:f[3],v2:f[4]})),{max:100,suf:' %',ley:['Acierto al entrar','Acierto en la META'],aria:'Acierto al entrar y en la META por estación'})+
   tabla([{h:'Unidad',w:11},{h:'Estación',w:34},{h:'Estudiantes con ambos',num:1,d:0},{h:'% acierto al entrar',num:1,suf:' %'},{h:'% acierto META',num:1,suf:' %'},{h:'Avance (puntos)',num:1,signo:1},{h:'Fallaron u omitieron al entrar',num:1,d:0},{h:'De ellos, misma pregunta en la META',num:1,d:0},{h:'% que ahora la acierta',num:1,suf:' %'}],fs,'Diagnóstico vs META');
  out.push(bloque('diagmeta','Diagnóstico vs META FINAL',`Se usa el <b>${F.meta==='ultimo'?'último':'primer'}</b> intento oficial de la META de cada estudiante. Quien falló u omitió al entrar recibe en la META la misma pregunta: «% que ahora la acierta» es la comparación exacta.`,h,true));
 }
 if(F.secs.has('entsal')){
  const dE=new Map(),dM=new Map();D.forEach(r=>{if(!r.e)return;const k=r.est+'|'+r.e.u;(dE.get(k)||dE.set(k,[]).get(k)).push(r);});MS.forEach(r=>{if(!r.e)return;const k=r.est+'|'+r.e.u;(dM.get(k)||dM.set(k,[]).get(k)).push(r);});
  const es=[...dM.keys()].filter(k=>dE.has(k)).map(k=>{const e=dE.get(k),m=dM.get(k),u=k.split('|').pop();return {nombre:m[0].nombre,mail:m[0].mail,u,ne:e.length,ae:e.filter(r=>r.ok).length,nm:m.length,am:m.filter(r=>r.ok).length};});
  es.forEach(d=>{d.pe=pct(d.ae,d.ne);d.ps=pct(d.am,d.nm);d.c=r1(d.ps-d.pe);});
  const fu=unidadesSel.map(u=>{const g=es.filter(d=>d.u===u.u);if(!g.length)return null;const pe=pct(g.reduce((a,d)=>a+d.ae,0),g.reduce((a,d)=>a+d.ne,0)),ps=pct(g.reduce((a,d)=>a+d.am,0),g.reduce((a,d)=>a+d.nm,0));return ['Unidad '+u.ur,g.length,pe,ps,r1(ps-pe),pct(g.filter(d=>d.c>0).length,g.length)];}).filter(Boolean);
  let h=barras(fu.map(f=>({lab:f[0],v:f[2],v2:f[3]})),{max:100,suf:' %',ley:['Entrada (diagnóstico)','Salida (META FINAL)'],aria:'Entrada y salida por unidad'})+
   tabla([{h:'Unidad',w:14},{h:'Estudiantes',num:1,d:0},{h:'% acierto entrada',num:1,suf:' %'},{h:'% acierto salida (META)',num:1,suf:' %'},{h:'Cambio (puntos)',num:1,signo:1},{h:'% de estudiantes que mejoran',num:1,suf:' %'}],fu,'Entrada vs salida (unidad)');
  h+=`<h4>Por estudiante</h4>`+tabla([{h:'Estudiante',w:28},{h:'Correo',w:28},{h:'Unidad',w:10},{h:'% entrada',num:1,suf:' %'},{h:'% salida',num:1,suf:' %'},{h:'Cambio',num:1,signo:1}],
   es.sort((a,b)=>a.u<b.u?-1:a.u>b.u?1:String(a.nombre).localeCompare(String(b.nombre),'es')).map(d=>[d.nombre,d.mail,'Unidad '+(UN.find(u=>u.u===d.u)||{}).ur,d.pe,d.ps,d.c]),'Entrada vs salida (estud.)');
  out.push(bloque('entsal','Prueba de entrada vs salida',`Entrada = todas las preguntas «Antes de empezar» de la unidad (omitir cuenta como no acierto). Salida = la META FINAL de la unidad (${F.meta==='ultimo'?'último':'primer'} intento oficial). Solo estudiantes con ambas.`,h,true));
 }
 if(F.secs.has('metaint')){
  const os=Object.values(MI).filter(o=>F.us.has(o.u));
  const fu=unidadesSel.map(u=>{const g=os.filter(o=>o.u===u.u);if(!g.length)return null;const rep=g.filter(o=>o.nI>1),m1=M1.filter(r=>r.e&&r.e.u===u.u),mu=MU.filter(r=>r.e&&r.e.u===u.u);
   const p1=pct(m1.filter(r=>r.ok).length,m1.length),pu=pct(mu.filter(r=>r.ok).length,mu.length);
   const rp1=pct(rep.reduce((a,o)=>a+o.ints[o.n1].filter(r=>r.ok).length,0),rep.reduce((a,o)=>a+o.ints[o.n1].length,0)),rpu=pct(rep.reduce((a,o)=>a+o.ints[o.nU].filter(r=>r.ok).length,0),rep.reduce((a,o)=>a+o.ints[o.nU].length,0));
   return ['Unidad '+u.ur,g.length,r1(g.reduce((a,o)=>a+o.nI,0)/g.length),pct(rep.length,g.length),p1,pu,r1(pu-p1),rep.length,rp1,rpu,rep.length?r1(rpu-rp1):null];}).filter(Boolean);
  let h=barras(fu.map(f=>({lab:f[0],v:f[4],v2:f[5]})),{max:100,suf:' %',ley:['1.er intento','Último intento'],aria:'Acierto en el primer y último intento de la META por unidad'})+
   tabla([{h:'Unidad',w:12},{h:'Rindieron',num:1,d:0},{h:'Intentos promedio',num:1},{h:'% que repitió',num:1,suf:' %'},{h:'% acierto 1.er intento',num:1,suf:' %'},{h:'% acierto último intento',num:1,suf:' %'},{h:'Cambio (puntos)',num:1,signo:1},{h:'Repitieron',num:1,d:0},{h:'Quienes repitieron: 1.er intento',num:1,suf:' %'},{h:'Quienes repitieron: último',num:1,suf:' %'},{h:'Cambio de quienes repitieron',num:1,signo:1}],fu,'META intentos (unidad)');
  /* por estación: solo quienes repitieron (misma persona, primer vs último) */
  const g=new Map();os.filter(o=>o.nI>1).forEach(o=>{[[o.n1,'a'],[o.nU,'b']].forEach(([n,t])=>o.ints[n].forEach(r=>{const x=g.get(r.sid)||{an:0,ao:0,bn:0,bo:0,est:new Set()};x[t+'n']++;x[t+'o']+=r.ok;x.est.add(r.est);g.set(r.sid,x);}));});
  const fe=[...g.entries()].sort((a,b)=>ordEst(a[0])-ordEst(b[0])).map(([sid,x])=>{const a=pct(x.ao,x.an),b=pct(x.bo,x.bn);return [uniEst(sid),nomEst(sid),x.est.size,a,b,r1(b-a)];});
  h+=`<h4>Por estación (solo estudiantes que repitieron)</h4>`+tabla([{h:'Unidad',w:11},{h:'Estación',w:34},{h:'Estudiantes',num:1,d:0},{h:'% acierto 1.er intento',num:1,suf:' %'},{h:'% acierto último intento',num:1,suf:' %'},{h:'Cambio (puntos)',num:1,signo:1}],fe,'META intentos (estación)');
  h+=`<h4>Por estudiante</h4>`+tabla([{h:'Estudiante',w:28},{h:'Correo',w:28},{h:'Unidad',w:10},{h:'Intentos',num:1,d:0},{h:'% 1.er intento',num:1,suf:' %'},{h:'% último intento',num:1,suf:' %'},{h:'Cambio',num:1,signo:1}],
   os.sort((a,b)=>a.u<b.u?-1:a.u>b.u?1:String(a.nombre).localeCompare(String(b.nombre),'es')).map(o=>[o.nombre,o.mail,'Unidad '+(UN.find(u=>u.u===o.u)||{}).ur,o.nI,o.p1,o.pU,o.nI>1?r1(o.pU-o.p1):null]),'META intentos (estud.)');
  out.push(bloque('metaint','META FINAL: primer vs último intento','Intentos oficiales (el simulacro no se registra). «Último» es el intento más reciente; para quien la rindió una vez, coincide con el primero. La comparación por estación usa solo a quienes repitieron.',h,true));
 }
 if(F.secs.has('alts')){
  const g=new Map();Q.concat(M,D).forEach(r=>{if(r.ok||r.nosabe||!r.resp||!r.c||r.c[1]!=='Alternativas')return;const k=r.sid+'|'+r.hash;const o=g.get(k)||{r,c:new Map()};const l=r.resp.toLowerCase();o.c.set(l,(o.c.get(l)||0)+1);g.set(k,o);});
  const fs=[...g.values()].map(o=>{const tot=[...o.c.values()].reduce((a,b)=>a+b,0),[l,v]=[...o.c.entries()].sort((a,b)=>b[1]-a[1])[0],al=altsDe(o.r.c[5]);
   return [uniEst(o.r.sid),nomEst(o.r.sid),plano(o.r.c[3]),l,plano(al[l]||''),plano(o.r.c[4]),v,pct(v,tot),tot];}).filter(f=>f[8]>=F.min).sort((a,b)=>b[6]-a[6]||(b[7]||0)-(a[7]||0));
  const h=tabla([{h:'Unidad',w:11},{h:'Estación',w:28},{h:'Enunciado',w:56},{h:'Alternativa',w:8},{h:'Texto',w:26},{h:'Correcta',w:18},{h:'Veces elegida',num:1,d:0},{h:'% de los errores',num:1,suf:' %'},{h:'Errores totales',num:1,d:0}],fs.slice(0,40),null);
  HOJAS.push({nombre:'Alternativas incorrectas',filas:[['Unidad','Estación','Enunciado','Alternativa','Texto','Correcta','Veces elegida','% de los errores','Errores totales'],...fs],anchos:[11,28,56,8,26,18,10,10,10]});
  out.push(bloque('alts','Alternativas incorrectas más elegidas',`Preguntas de alternativas con al menos ${F.min} errores: la alternativa incorrecta que más se elige suele mostrar un error de concepto. Se muestran las 40 primeras; el Excel trae todas.`,h,true));
 }
 if(F.secs.has('estud')){
  const by=new Map();R.forEach(r=>{const o=by.get(r.est)||{nombre:r.nombre,mail:r.mail,sids:new Set(),n:0,pn:0,pe:0,t:0};if(r.tipo==='P'||r.tipo==='A'||r.tipo==='D')o.sids.add(r.sid);if(r.tipo==='P'||r.tipo==='A'){o.n++;if(r.pri){o.pn++;o.pe+=!r.ok;}}if(r.tipo==='TA')o.t+=r.seg;by.set(r.est,o);});
  const fs=[...by.entries()].map(([k,o])=>{const mt=unidadesSel.map(u=>{const m=MI[k+'|'+u.u];return m?`${m.nI} int. · ${nf(m.p1,0)} %`+(m.nI>1?` → ${nf(m.pU,0)} %`:''):'—';});
   return [o.nombre,o.mail,o.sids.size,o.n,pct(o.pe,o.pn),...mt,o.t?r1(o.t/60):null];}).sort((a,b)=>String(a[0]).localeCompare(String(b[0]),'es'));
  const cols=[{h:'Estudiante',w:28},{h:'Correo',w:28},{h:'Estaciones con actividad',num:1,d:0},{h:'Respuestas',num:1,d:0},{h:'% error 1.ª respuesta',num:1,suf:' %'},...unidadesSel.map(u=>({h:'META Unidad '+u.ur,w:20})),{h:'Minutos en Aprende',num:1,d:0}];
  out.push(bloque('estud','Por estudiante','«META»: intentos oficiales · acierto del 1.er intento → acierto del último. «Estaciones con actividad» cuenta las estaciones con alguna respuesta (diagnóstico, Practica o Aplica).',tabla(cols,fs,'Por estudiante'),true));
 }
 if(F.secs.has('tiempo')){
  let h;
  if(!T.length)h='<p class="vacio">No hay registros de tiempo en Aprende. Se registran desde la versión del curso del 26-11-2026: los estudiantes que usaron una versión anterior no los tienen.</p>';
  else{
   const se=new Map();T.forEach(r=>{const k=r.sid;const o=se.get(k)||{por:new Map(),vis:0};o.vis++;o.por.set(r.est,(o.por.get(r.est)||0)+r.seg);se.set(k,o);});
   const pq=new Map();Q.filter(r=>r.pri&&r.tipo==='P').forEach(r=>{const o=pq.get(r.sid)||{n:0,e:0};o.n++;o.e+=!r.ok;pq.set(r.sid,o);});
   const fs=[...se.entries()].sort((a,b)=>ordEst(a[0])-ordEst(b[0])).map(([sid,o])=>{const v=[...o.por.values()].map(s=>s/60),p=pq.get(sid);
    return [uniEst(sid),nomEst(sid),o.por.size,o.vis,r1(mediana(v)),r1(cuantil(v,.25)),r1(cuantil(v,.75)),r1(v.reduce((a,b)=>a+b,0)/60),p?pct(p.e,p.n):null];});
   const tu=unidadesSel.map(u=>{const tt=new Map();T.filter(r=>r.e&&r.e.u===u.u).forEach(r=>tt.set(r.est,(tt.get(r.est)||0)+r.seg));const v=[...tt.values()].map(s=>s/60);return v.length?['Unidad '+u.ur,v.length,r1(mediana(v)),r1(cuantil(v,.25)),r1(cuantil(v,.75))]:null;}).filter(Boolean);
   h=tabla([{h:'Unidad',w:12},{h:'Estudiantes',num:1,d:0},{h:'Minutos en Aprende por estudiante (mediana)',num:1},{h:'Percentil 25',num:1},{h:'Percentil 75',num:1}],tu,'Tiempo Aprende (unidad)')+
    `<h4>Por estación: minutos por estudiante (mediana)</h4>`+barras(fs.map(f=>({lab:f[1],v:f[4]})),{suf:' min',aria:'Mediana de minutos en Aprende por estación'})+
    tabla([{h:'Unidad',w:11},{h:'Estación',w:34},{h:'Estudiantes',num:1,d:0},{h:'Visitas',num:1,d:0},{h:'Mediana (min)',num:1},{h:'P25 (min)',num:1},{h:'P75 (min)',num:1},{h:'Total (horas)',num:1},{h:'% error Practica (1.ª respuesta)',num:1,suf:' %'}],fs,'Tiempo Aprende (estación)');
  }
  out.push(bloque('tiempo','Tiempo en Aprende','Tiempo <b>activo</b> con Aprende a la vista: no cuenta si la pestaña queda oculta ni después de 2 minutos sin actividad. Se suma por estudiante y estación (puede tener varias visitas). La mediana es más representativa que el promedio.',h,true));
 }
 const filtTxt=[`unidades ${unidadesSel.map(u=>u.ur).join(', ')||'—'}`,F.d0||F.d1?`comenzaron entre ${fstr(F.d0)} y ${fstr(F.d1)}`:'',F.ex.size?`${F.ex.size} correos excluidos`:'',`META para comparar: ${F.meta==='ultimo'?'último':'primer'} intento`].filter(Boolean).join(' · ');
 $('informe').innerHTML=`<div class="rep-head"><h2>Informe estadístico · Preparación matemática</h2><p>Generado el ${new Date().toLocaleString('es-CL')} · ${esc(ARCH.filter(a=>!a.error).map(a=>a.nombre).join(', '))}<br>Filtros: ${esc(filtTxt)}</p></div>`+(out.join('')||'<p class="vacio">Elige al menos una sección.</p>');
 HOJAS.unshift({nombre:'Filtros',filas:[['Informe estadístico · Preparación matemática (UACh)'],['Generado',new Date().toLocaleString('es-CL')],['Archivos',ARCH.filter(a=>!a.error).map(a=>a.nombre).join(', ')],['Filtros',filtTxt],['Estudiantes',ests.size],['Catálogo',PACE.generado+(PACE.version?' ('+PACE.version+')':'')]],anchos:[22,90]});
 $('excel').disabled=$('pdf').disabled=!out.length;
 $('informe').scrollIntoView({behavior:'smooth',block:'start'});
}
function excel(){
 const wb=XLSX.utils.book_new(),usados=new Set();
 HOJAS.forEach(h=>{let n=h.nombre.replace(/[\\\/?*\[\]:]/g,'').slice(0,31),i=2;while(usados.has(n)){n=h.nombre.slice(0,28)+' '+i++;}usados.add(n);
  const ws=XLSX.utils.aoa_to_sheet(h.filas);ws['!cols']=(h.anchos||[]).map(w=>({wch:w}));if(h.filas.length>1&&n!=='Filtros')ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:h.filas.length-1,c:h.filas[0].length-1}})};
  XLSX.utils.book_append_sheet(wb,ws,n);});
 XLSX.writeFile(wb,'Informe_PACE_'+iso(new Date())+'.xlsx');
}

/* ---------------- arranque ---------------- */
opciones();
const inp=$('archivo'),drop=$('drop');
inp.addEventListener('change',()=>{if(inp.files.length)cargar([...inp.files]);inp.value='';});
['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('sobre');}));
['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('sobre');}));
drop.addEventListener('drop',ev=>{const f=[...(ev.dataTransfer&&ev.dataTransfer.files||[])];if(f.length)cargar(f);});
$('generar').onclick=()=>{try{generar();}catch(e){$('informe').innerHTML=`<p class="warn">No se pudo generar el informe: ${esc(e.message||e)}</p>`;console.error(e);}};
$('excel').onclick=excel;$('pdf').onclick=()=>window.print();
window.__informe={REG:()=>REG,generar};
})();
