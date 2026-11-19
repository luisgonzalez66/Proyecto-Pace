import sys, json, zipfile, io, re, os, copy, base64
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
OUT=os.path.abspath(sys.argv[1]) if len(sys.argv)>1 else os.path.join(REPO,'paquetes_locales')
os.makedirs(OUT,exist_ok=True)
# El motor original (sin parches) vive en motor_base.js; editor/motor_bundle.js es el motor ya parcheado que usa el editor.
bundle=open(HERE+'/motor_base.js').read()
mm=re.search(r'["\']([A-Za-z0-9+/=]{1000,})["\']',bundle)
motor=zipfile.ZipFile(io.BytesIO(base64.b64decode(mm.group(1))))
app=motor.read('app.js').decode(); idx=motor.read('index.html').decode()
portal=open(REPO+'/index.html',encoding='utf8').read()
def sub1(s, old, new, count=1):
    assert s.count(old)==count, (s.count(old), old[:90])
    return s.replace(old,new)
def rsub1(s, pat, new, flags=re.S):
    r=re.compile(pat,flags); assert len(r.findall(s))==1,(len(r.findall(s)),pat[:80])
    return r.sub(lambda m:new,s)

# Nombre: «Preparación matemática» (sin «PACE» en el encabezado)
idx=sub1(idx,'<title>PACE UACh · Mi ruta de matemática</title>','<title>UACh · Preparación matemática</title>')
idx=sub1(idx,'<strong>PACE <span>· UACh</span></strong><small>NIVELACIÓN MATEMÁTICA</small>','<strong><span>UACh</span></strong><small>PREPARACIÓN MATEMÁTICA</small>')
idx=sub1(idx,'<small>Nivelación matemática PACE · Valdivia, Región de Los Ríos</small>','<small>Preparación matemática · Valdivia, Región de Los Ríos</small>')
idx=sub1(idx,'Curso de nivelación · aprende a tu ritmo.','Preparación matemática · aprende a tu ritmo.')
# Chucao en todo el curso (chucao.js / chucao.css)
CHUJS=open(HERE+'/chucao.js',encoding='utf8').read(); CHUCSS=open(HERE+'/chucao.css',encoding='utf8').read()
_k="window.addEventListener('load',function(){setTimeout(function(){try{paintMascot();}catch(e){}},400);});"
idx=sub1(idx,_k,_k+'\n'+CHUJS)
PRESCSS=open(HERE+'/presentacion.css',encoding='utf8').read()
CICSS=open(HERE+'/cierre.css',encoding='utf8').read()
idx=sub1(idx,'</head>','<style>\n'+CHUCSS+'\n'+PRESCSS+'\n'+CICSS+'\n</style></head>')
# Texto dentro de fórmulas (\\text{...}) con la letra del curso: así la ñ y las tildes no salen de otra fuente (19-11-2026)
idx=sub1(idx,"svg:{fontCache:'local'}","svg:{fontCache:'local',mtextInheritFont:true}")
idx=sub1(idx,'<section id="metaView" class="view hidden" aria-label="META FINAL"></section>','<section id="metaView" class="view hidden" aria-label="META FINAL"></section>\n<section id="cierreView" class="view hidden" aria-label="Cierre del bloque"></section>')


# ---------- app.js: META FINAL por unidad ----------
a=app
a=sub1(a,"sk:null,mt:null});","sk:null,mts:{}});")
a=sub1(a,"const metaCfg=()=>{const u=UNITS.find(x=>x&&x.meta&&x.meta.minutes);return u?u.meta:null;};",
"let mu=Math.max(0,UNITS.findIndex(x=>x&&x.meta&&x.meta.minutes));\nconst metaUnits=()=>UNITS.map((u,i)=>u&&u.meta&&u.meta.minutes?i:-1).filter(i=>i>=0);\nconst MT=()=>(state.mts&&state.mts[mu])||null;\nconst setMT=v=>{if(!state.mts)state.mts={};if(v)state.mts[mu]=v;else delete state.mts[mu];};\nconst metaDoneU=u=>!!(state.mts&&state.mts[u]&&state.mts[u].b>=0);\nconst metaCfg=()=>{const x=UNITS[mu];return x&&x.meta&&x.meta.minutes?x.meta:null;};")
a=sub1(a,"const metaDone=()=>!!(state.mt&&state.mt.b>=0);","const metaDone=()=>metaDoneU(mu);")
a=sub1(a,"state.mt={n,s:nowSec(),e:0,a:Array(N).fill('-'),b};","setMT({n,s:nowSec(),e:0,a:Array(N).fill('-'),b});")
a=sub1(a,"if(!save()){state.mt=prev;","if(!save()){setMT(prev);")
a=sub1(a,"if(state.mt&&!(Number.isInteger(state.mt.s)&&Array.isArray(state.mt.a)))state.mt=null;",
"if(!state.mts)state.mts={};for(const k of Object.keys(state.mts)){const t=state.mts[k];if(!(t&&Number.isInteger(t.s)&&Array.isArray(t.a)))delete state.mts[k];}")
a=sub1(a,"return p===100&&metaCfg()&&!metaDone()?99:p;};","return p===100&&metaUnits().some(u=>!metaDoneU(u))?99:p;};")
a=sub1(a,"UNITS[u].meta&&!metaDone()?99:p","UNITS[u].meta&&!metaDoneU(u)?99:p")
a=sub1(a,"(!metaCfg()||metaDone())","metaUnits().every(metaDoneU)")
a=sub1(a,"let score=metaDone()?state.mt.b:overall();","let score=(metaUnits().length&&metaUnits().every(metaDoneU))?Math.round(metaUnits().reduce((s,u)=>s+state.mts[u].b,0)/metaUnits().length):overall();")
a=sub1(a,"const MC=UNITS[selectedUnit].meta,fin=$('mapFinish');","mu=selectedUnit;const MC=UNITS[selectedUnit].meta,fin=$('mapFinish');")
a=sub1(a,"function openMeta(){selectedUnit=Math.max(0,UNITS.findIndex(u=>u&&u.meta));metaExpiryCheck();","function openMeta(){mu=selectedUnit;metaMode='off';metaPrac=null;metaExpiryCheck();")
a=sub1(a," STATIONS.forEach(s=>{\n  const r=rng("," STATIONS.filter(s=>s.unit===mu).forEach(s=>{\n  const r=rng(")
a=sub1(a,"salt+'|'+state.seed","salt+'|'+state.seed+'|U'+mu",2)
a=sub1(a,"all=STATIONS.every((s,i)=>stationDone(i)===milestoneCount(s))","all=STATIONS.every((s,i)=>s.unit!==mu||stationDone(i)===milestoneCount(s))")
a=sub1(a,"${STATIONS.length}","${STATIONS.filter(s=>s.unit===mu).length}",2)
a=sub1(a,"<h1>Evaluación de la unidad</h1>","<h1>Evaluación de la Unidad ${UNITS[mu].roman}</h1>")
# serialización por unidad
a=rsub1(a,r"\+\(state\.mt&&state\.mt\.s\?'\\nM\|'.*?:''\);",
 r"+Object.keys(state.mts||{}).filter(u=>state.mts[u]&&state.mts[u].s).sort().map(u=>{const m=state.mts[u];return '\nM'+u+'|'+m.n.toString(36)+'|'+m.s.toString(36)+'|'+(m.e||0).toString(36)+'|'+(m.a.join('')||'-')+'|'+(m.b>=0?m.b.toString(36):'-');}).join('');")
a=rsub1(a,r"let mtv=null;\{const mi=.*?lines\.splice\(mi,1\);\}\}",
 r"let mtv={};for(let mi=1;mi<lines.length;){if(/^M\d*\|/.test(lines[mi])){const m=/^M(\d*)\|([0-9a-z]{1,3})\|([0-9a-z]{1,8})\|([0-9a-z]{1,8})\|([-01]{1,120})\|([0-9a-z]{1,3}|-)$/.exec(lines[mi]);if(!m)return null;mtv[m[1]===''?String(Math.max(0,UNITS.findIndex(x=>x&&x.meta&&x.meta.minutes))):m[1]]={n:parseInt(m[2],36),s:parseInt(m[3],36),e:parseInt(m[4],36),a:m[5].split(''),b:m[6]==='-'?-1:parseInt(m[6],36)};lines.splice(mi,1);}else mi++;}")
a=sub1(a,"n.mt=mtv;","n.mts=mtv;")
a=re.sub(r"state\.mt\b","MT()",a)
assert 'state.mt.' not in a

# ---------- interacciones SCORM (estadística por pregunta) ----------
REP = r"""/* Interacciones SCORM 1.2: una fila por respuesta (id, tipo, respuesta, correcta, resultado) para el informe de Interacciones de Moodle. */
let intN=-1,intTimer=null;
function reportInt(kind,s,q,resp,ok){try{
 if(mode!=='scorm'||!connected||writeBlocked||!q||!s)return;
 if(intN<0){const c=parseInt(get('cmi.interactions._count'),10);intN=Number.isFinite(c)&&c>=0?c:0;}
 if(intN>=2000)return;
 const n=intN++,p='cmi.interactions.'+n+'.',choice=Array.isArray(q.options),L=k=>String.fromCharCode(97+k);
 const id=s.id+'.'+kind+'.'+hashStr(String(q.q)).toString(36);
 let sr='';
 if(choice){const k=(resp===undefined||resp===null||resp==='')?NaN:Number(resp);sr=Number.isInteger(k)&&k>=0&&k<26?L(k):(ok&&Number.isInteger(q.correct)?L(q.correct):'');}
 else sr=String(resp==null?'':resp).replace(/[\r\n]+/g,' ').trim().slice(0,250);
 const cr=choice?(Number.isInteger(q.correct)?L(q.correct):''):String(q.answer==null?'':q.answer).replace(/[\r\n]+/g,' ').slice(0,250);
 set(p+'id',id);set(p+'time',new Date().toTimeString().slice(0,8));set(p+'type',choice?'choice':'fill-in');
 if(cr!=='')set(p+'correct_responses.0.pattern',cr);
 set(p+'weighting','1');if(sr!=='')set(p+'student_response',sr);set(p+'result',ok?'correct':'wrong');
 clearTimeout(intTimer);intTimer=setTimeout(commit,1500);
}catch(e){}}
function mark(step){
"""
a=sub1(a,"function mark(step){\n",REP)
a=sub1(a," const q=questionAt(step);\n if(Number(b.dataset.answer)===q.correct)mark(step);",
 " const q=questionAt(step);\n {const st=STATIONS[stationIndex];reportInt(step>drawCount(st)?'A':'P',st,q,b.dataset.answer,Number(b.dataset.answer)===q.correct);window.chuReact&&chuReact(Number(b.dataset.answer)===q.correct);}\n if(Number(b.dataset.answer)===q.correct)mark(step);")
a=sub1(a," const q=questionAt(step),r=PACETyped.check(q,inp.value);\n if(r.state==='ok'){mark(step);return;}",
 " const q=questionAt(step),r=PACETyped.check(q,inp.value);\n if(r.state!=='empty'&&r.state!=='invalid'){const st=STATIONS[stationIndex];reportInt(step>drawCount(st)?'A':'P',st,q,inp.value,r.state==='ok');window.chuReact&&chuReact(r.state==='ok');}\n if(r.state==='ok'){mark(step);return;}")
a=sub1(a,"if(sc>MT().b)MT().b=sc;save();",
 "if(sc>MT().b)MT().b=sc;S.qs.forEach((x,i)=>{const r=S.a[i];if(r==='-')return;const st=STATIONS.find(z=>z.id===x.sid);reportInt('M',st,x.q,metaVals[S.mode+S.n+':'+i],r==='1');});save();")

a=sub1(a,"root.innerHTML='<div class=\"mt-wrap\">'+metaHubHTML()+'</div>';","root.innerHTML='<div class=\"mt-wrap\">'+metaHubHTML()+'</div>';window.chuMeta&&chuMeta(root,false);")
a=sub1(a,"root.innerHTML='<div class=\"mt-wrap\">'+metaResHTML(S)+'</div>';","root.innerHTML='<div class=\"mt-wrap\">'+metaResHTML(S)+'</div>';window.chuMeta&&chuMeta(root,true);")

# portada: dos pantallas (Inicio con la bienvenida · Curso con las unidades)
a=sub1(a,"function openHome(){showOnly('home');","function openHome(){paceSub('curso');showOnly('home');")
a=sub1(a,"init();metaExpiryCheck();renderStreak();openHome();",
r"""function paceSub(k){var I=document.getElementById('ptInicio'),C=document.getElementById('ptCurso');if(!I||!C)return;I.hidden=k!=='inicio';C.hidden=k==='inicio';if(k!=='inicio'){var v=I.querySelector('video');if(v&&!v.paused)v.pause();}window.scrollTo(0,0);}
(function(){[].slice.call(document.querySelectorAll('[data-go-curso]')).forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();paceSub('curso');var h=document.querySelector('#ptCurso h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}});});
var b=document.getElementById('ptBack');if(b)b.addEventListener('click',function(){paceSub('inicio');});
[].slice.call(document.querySelectorAll('[data-open-unit]')).forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();openMap(Number(l.dataset.openUnit));});});
if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){[].forEach.call(document.querySelectorAll('.board animate'),function(x){var r=x.parentNode;r.setAttribute('width',x.getAttribute('to'));r.removeChild(x);});}})();
init();(()=>{const keep=mu;metaUnits().forEach(u=>{mu=u;metaExpiryCheck();});mu=keep;})();renderStreak();openHome();paceSub('inicio');""")

# ---------- Estación por pantallas · cero scroll (propuesta de Henry V4) ----------
ZSJS=open(HERE+'/zs.js',encoding='utf8').read()
# ---------- Presentación (18-11-2026): mapa con el bloque en curso abierto, tarjetas con avance, horas con coma ----------
PRESJS=open(HERE+'/presentacion.js',encoding='utf8').read()
# ---------- Cierre de bloque con práctica mixta (19-11-2026) ----------
CIJS=open(HERE+'/cierre.js',encoding='utf8').read()
a=sub1(a,"for(let id of ['homeView','mapView','stationView','metaView'])","for(let id of ['homeView','mapView','stationView','metaView','cierreView'])")
a=sub1(a,"if(view==='meta')segments.push({label:'META FINAL'});","if(view==='meta')segments.push({label:'META FINAL'});\n if(view==='cierre')segments.push({label:'Cierre del bloque'});")
a=sub1(a,'<div class="station-list">${cards(items)}</div>','<div class="station-list">${cards(items)}</div>${cierreCard(g,items)}')
a=sub1(a,"if(PHONE.matches&&groups.length&&(activeGroup<0||activeGroup>=groups.length)){const ls=STATIONS.findIndex(x=>x.id===state.last);activeGroup=ls>=0&&STATIONS[ls].unit===selectedUnit?STATIONS[ls].group:0;}",
 "if(groups.length&&(activeGroup<0||activeGroup>=groups.length)){const ls=STATIONS.findIndex(x=>x.id===state.last);if(ls>=0&&STATIONS[ls].unit===selectedUnit)activeGroup=STATIONS[ls].group;else{const f=unitItems.find(x=>stationDone(x.i)<milestoneCount(x.s));activeGroup=f?f.s.group:0;}}")
a=sub1(a,"activeGroup=(activeGroup===g&&!PHONE.matches)?-1:g;","activeGroup=g;")
a=sub1(a,"const note=avail?(pct===100?'Completada':pct>0?pct+'% de avance':'Lista para explorar'):'En preparación';",
 "const nT=ownStations(i).length,nD=ownStations(i).filter(x=>stationDone(x.i)===milestoneCount(x.s)).length;const note=avail?(pct===100?'Completada · '+nT+' de '+nT+' estaciones':pct>0?'En curso · '+nD+' de '+nT+' estaciones':'No iniciada · 0 de '+nT+' estaciones'):'En preparación';")
a=sub1(a,"Math.round(ownStations(i).reduce((n,x)=>n+(x.s.minutes||0),0)/60*10)/10+' h previstas'",
 "String(Math.round(ownStations(i).reduce((n,x)=>n+(x.s.minutes||0),0)/60*10)/10).replace('.',',')+' h previstas'")
a=sub1(a,'T.keys(q.kind).map(','zsKeys(T.keys(q.kind)).map(')
a=sub1(a,'function renderStation(){','function renderStation0(){')
a=sub1(a,'function showOnly(next){','function showOnly0(next){')
a=sub1(a,'init();(()=>{const keep=mu;',ZSJS+"\nfunction renderStation(){renderStation0();zsAfter();}\nfunction showOnly(next){showOnly0(next);document.body.classList.toggle('zs',next==='station');document.documentElement.classList.toggle('zs',next==='station');if(next==='station')zsRefit();}\nzsToast();\n"+PRESJS+"\n"+CIJS+"\ninit();(()=>{const keep=mu;")

# ---------- index.html: portada en dos pantallas (Inicio y Curso) ----------
# Inicio = encabezado con pizarra + Bienvenida + Cómo se estudia + Tour (todo tomado de index.html del repositorio).
# Curso  = la bienvenida del motor (retoma tu ruta y avance) + las tarjetas de unidades.
vi0=portal.index('<div id="vInicio" class="view">')+len('<div id="vInicio" class="view">')
vi1=portal.index('<div id="vCurso"')
inicio=portal[vi0:vi1].rstrip()
assert inicio.endswith('</div>'); inicio=inicio[:-len('</div>')]
inicio=inicio.replace('href="#curso"','href="#" data-go-curso')
inicio=sub1(inicio,'<img class="chu" alt=""','<img class="chu" data-mascot alt=""')
for n in (1,2,3):
    inicio=re.sub(rf'href="unidades/u{n}/html/index.html[^"]*"',f'href="#" data-open-unit="{n-1}"',inicio)
assert 'unidades/u' not in inicio and 'href="#curso"' not in inicio
wel=re.search(r'      <section class="welcome".*?\n      </section>\n',idx,re.S).group(0)
wel2=sub1(wel,'<h1>Aprende a<br><em>tu ritmo.</em></h1>','<h1>Tu ruta de<br><em>aprendizaje.</em></h1>')
wel2=sub1(wel2,'<p>Elige una unidad y comienza.</p>','<p>Retoma donde quedaste o elige una unidad.</p>')
old=re.search(r'(      <div class="section-heading">.*?</div>\n      <div class="units-grid" id="unitsGrid"></div>)',idx,re.S); assert old
i2=sub1(idx,wel+old.group(1),
 '<div class="pt" id="ptInicio">'+inicio+'</div>\n'
 '<div id="ptCurso" hidden><div class="pt"><button type="button" class="back" id="ptBack"><span aria-hidden="true">←</span> Volver al inicio</button></div>\n'
 +wel2+old.group(1)+'\n</div>')
# CSS de la portada, acotado a .pt (se omiten reglas generales de la página y fuentes que el motor ya trae)
st=portal[portal.index('<style>')+7:portal.index('</style>')]
def blocks(t):
    out=[];i=0;n=len(t)
    while i<n:
        j=t.find('{',i)
        if j<0: break
        sel=t[i:j].strip();d=0;k=j
        while True:
            if t[k]=='{': d+=1
            elif t[k]=='}':
                d-=1
                if d==0: break
            k+=1
        out.append((sel,t[j+1:k]));i=k+1
    return out
SKIP=re.compile(r'^(\*|html|body|main|:root|footer|\.top\b|\.stripe|\.credits|a\.ucard|\.ucard|\.units\b|\.home-tabs|\.htab|\.hp\[|\.view\[|\.rt-|\.wel-route)')
def scope(sel): return ','.join('.pt '+x.strip() for x in sel.split(','))
def conv(bl):
    o=[]
    for sel,body in bl:
        if sel.startswith('@font-face'):
            if 'Kalam' in body: o.append(sel+'{'+body+'}')
        elif sel.startswith('@keyframes'): o.append(sel+'{'+body+'}')
        elif sel.startswith('@media'):
            inner=conv(blocks(body))
            if inner: o.append(sel+'{'+''.join(inner)+'}')
        else:
            keep=[x for x in sel.split(',') if not SKIP.match(x.strip())]
            if keep: o.append(scope(','.join(keep))+'{'+body+'}')
    return o
css=('.pt{--navy:#2b2a6b;--teal:#4b49a3;--coral:#c2406f;--green:#2f9a78;--sun:#f0b54a;--paper:#f6f1e7;--muted:#5b6070;margin-top:8px;color:var(--navy);font-family:Nunito,system-ui,sans-serif;font-weight:600;line-height:1.5}\n'
     '#ptInicio{padding-top:6px}.pt h1,.pt h2,.pt .cta-end b{font-family:Fraunces,Georgia,serif}.pt .wel-card{font-family:inherit}\n'
     'body:has(#homeView:not(.hidden)){background-image:linear-gradient(rgba(43,42,107,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(43,42,107,.055) 1px,transparent 1px);background-size:26px 26px}\n'
     '.pt .back{font:inherit;cursor:pointer}\n'
     +'\n'.join(conv(blocks(st))))
css+='\n'+open(HERE+'/zs.css',encoding='utf8').read()
i2=sub1(i2,'</head>','<style>\n'+css+'\n</style></head>')
FIT=r'''<script>/* Ventana emergente de SiveducMD (Moodle): el curso ocupa toda la ventana, sin marco ni barras dobles.
 Solo actua si corre dentro de un marco del mismo sitio abierto como ventana emergente. */
(function(){try{
 if(window.parent===window)return;
 var fe=window.frameElement; if(!fe)return;
 var P=window.parent, T=window.top, pop=false;
 try{pop=!!T.opener||/display=popup/.test(P.location.search);}catch(e){}
 if(!pop)return;
 try{T.moveTo(0,0);T.resizeTo(screen.availWidth,screen.availHeight);}catch(e){}
 function apply(){try{
  var d=P.document; fe.classList.add('pace-fill');
  /* Alto real visible (en el celular 100vh incluye la barra del navegador y tapa los botones de abajo) */
  var vv=T.visualViewport,h=Math.round((vv&&vv.height)||T.innerHeight||0),w=Math.round((vv&&vv.width)||T.innerWidth||0);
  if(h>0){fe.style.setProperty('height',h+'px','important');fe.style.setProperty('width',(w>0?w+'px':'100vw'),'important');}
  if(!d.getElementById('pace-fill-css')){
   var st=d.createElement('style'); st.id='pace-fill-css';
   st.textContent='html,body{overflow:hidden!important;height:100%!important;margin:0!important}'+
    'iframe.pace-fill{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;background:#fff!important;z-index:2147483000!important}';
   (d.head||d.documentElement).appendChild(st);
  }
 }catch(e){}}
 apply(); setInterval(apply,1000);
 try{T.addEventListener('resize',apply);T.addEventListener('orientationchange',function(){setTimeout(apply,200);});if(T.visualViewport){T.visualViewport.addEventListener('resize',apply);T.visualViewport.addEventListener('scroll',apply);}}catch(e){}
}catch(e){}})();</script>'''
i2=sub1(i2,'<style>\n'+css+'\n</style></head>','<style>\n'+css+'\n</style>'+FIT+'</head>')

# ---------- datos ----------
units=[json.load(open(f'{REPO}/unidades/u{n}/unidad_0{n}.json')) for n in '123']
META=['id','roman','title','subtitle','icon','groups','hints','meta']
def datajs(us,scope):
    sts=[];metas=[]
    for i,u in enumerate(us):
        u=copy.deepcopy(u)
        for s in u['stations']:
            s['unit']=i
            for md in s.get('media') or []: assert md.get('type')=='video_url'
            sts.append(s)
        m={k:u[k] for k in META if k in u}; m['ready']=True; metas.append(m)
    ids=[s['id'] for s in sts]; assert len(ids)==len(set(ids))
    L=[('PACE_BUILD',{'scope':scope,'showWeek4':False}),('UNITS',metas),('STATIONS',sts),('LEGACY_STATION_IDS',[])]
    return '// PACE UACh V3.1 · curso completo\n'+'\n'.join(f'const {k}={json.dumps(v,ensure_ascii=False,separators=(",",":"))};' for k,v in L)+'\n'

tour={n:open(f'{REPO}/tour/{n}','rb').read() for n in ('tour_curso.mp4','tour_curso.webm','tour_poster.jpg')}
man=motor.read('imsmanifest.xml').decode().replace('PACE_MATEMATICA_MODULAR_V7','PACE_CURSO_COMPLETO_U1_U2_U3_V4').replace('PACE UACh · Plataforma de nivelación · editable modular','PACE UACh · Curso de preparación matemática (Unidades I, II y III)')
man=sub1(man,'</resource></resources>',''.join(f'<file href="tour/{n}"/>' for n in tour)+'</resource></resources>')
path=OUT+'/SCORM_CURSO_COMPLETO.zip'
with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('imsmanifest.xml',man); z.writestr('index.html',i2); z.writestr('app.js',a)
    for f in ['styles.css','mathjax/tex-svg.js','contract.js','content_text.js']: z.writestr(f,motor.read(f))
    z.writestr('data.js',datajs(units,'curso_completo'))
    for n,b in tour.items(): z.writestr('tour/'+n,b)
print(path, os.path.getsize(path)//1024,'KB')

# ---------- páginas de cada unidad para el sitio (unidades/uN/html), con la misma capa de pantallas ----------
# Uso: python3 herramientas/curso_completo/construir_curso.py <salida> sitio   (escribe en <repo>/unidades/uN/html)
if 'sitio' in sys.argv[2:]:
    zscss=open(HERE+'/zs.css',encoding='utf8').read()
    idx_u=sub1(idx,'</head>','<style>\n'+zscss+'\n</style></head>')
    VER='v'+__import__('time').strftime('%m%d%H%M')  # cambia en cada regeneración: evita que el navegador use archivos viejos en caché
    idx_u=idx_u.replace('?v=sim2','?'+VER)
    open(REPO+'/index.html','w',encoding='utf8').write(re.sub(r'(html/index\.html)\?[A-Za-z0-9=]+',r'\1?'+VER,portal))
    for i,n in enumerate('123'):
        d=f'{REPO}/unidades/u{n}/html'
        os.makedirs(d+'/mathjax',exist_ok=True)
        open(d+'/index.html','w',encoding='utf8').write(idx_u)
        open(d+'/app.js','w',encoding='utf8').write(a)
        for f in ['styles.css','contract.js','content_text.js']: open(d+'/'+f,'wb').write(motor.read(f))
        open(d+'/mathjax/tex-svg.js','wb').write(motor.read('mathjax/tex-svg.js'))
        dj=datajs([units[i]],'individual_u'+n).replace('curso completo','generado desde u'+n,1)
        dj=re.sub(r'const PACE_BUILD=\{[^}]*\};',lambda m:'const PACE_BUILD={"scope":"individual_u'+n+'","showWeek4":false};',dj)
        open(d+'/data.js','w',encoding='utf8').write(dj)
        print('sitio',d)

# ---------- motor del editor: el HTML y el SCORM que genera el editor salen con la misma presentación ----------
# Uso: python3 herramientas/curso_completo/construir_curso.py <salida> motor   (reescribe editor/motor_bundle.js)
if 'motor' in sys.argv[2:]:
    zscss=open(HERE+'/zs.css',encoding='utf8').read()
    idx_m=sub1(idx,'</head>','<style>\n'+zscss+'\n</style></head>')
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
        for info in motor.infolist():
            data=motor.read(info.filename)
            if info.filename=='app.js': data=a.encode('utf8')
            elif info.filename=='index.html': data=idx_m.encode('utf8')
            z.writestr(info.filename,data)
    open(REPO+'/editor/motor_bundle.js','w').write('window.PACE_MOTOR_ZIP_BASE64="'+base64.b64encode(buf.getvalue()).decode()+'";')
    print('motor', REPO+'/editor/motor_bundle.js', len(buf.getvalue())//1024,'KB')
