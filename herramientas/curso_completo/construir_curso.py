import sys, json, zipfile, io, re, os, copy, base64
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
OUT=os.path.abspath(sys.argv[1]) if len(sys.argv)>1 else os.path.join(REPO,'paquetes_locales')
os.makedirs(OUT,exist_ok=True)
bundle=open(REPO+'/editor/motor_bundle.js').read()
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
 " const q=questionAt(step);\n {const st=STATIONS[stationIndex];reportInt(step>drawCount(st)?'A':'P',st,q,b.dataset.answer,Number(b.dataset.answer)===q.correct);}\n if(Number(b.dataset.answer)===q.correct)mark(step);")
a=sub1(a," const q=questionAt(step),r=PACETyped.check(q,inp.value);\n if(r.state==='ok'){mark(step);return;}",
 " const q=questionAt(step),r=PACETyped.check(q,inp.value);\n if(r.state!=='empty'&&r.state!=='invalid'){const st=STATIONS[stationIndex];reportInt(step>drawCount(st)?'A':'P',st,q,inp.value,r.state==='ok');}\n if(r.state==='ok'){mark(step);return;}")
a=sub1(a,"if(sc>MT().b)MT().b=sc;save();",
 "if(sc>MT().b)MT().b=sc;S.qs.forEach((x,i)=>{const r=S.a[i];if(r==='-')return;const st=STATIONS.find(z=>z.id===x.sid);reportInt('M',st,x.q,metaVals[S.mode+S.n+':'+i],r==='1');});save();")

# portada: pestañas, abrir unidad desde la ruta
a=sub1(a,"init();metaExpiryCheck();renderStreak();openHome();",
r"""(function(){var tabs=[].slice.call(document.querySelectorAll('.htab'));function show(k){tabs.forEach(function(b){var on=b.dataset.hp===k;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});[].slice.call(document.querySelectorAll('.pt .hp')).forEach(function(p){p.hidden=p.id!=='hp-'+k;});if(k!=='tour'){var v=document.querySelector('.pt video');if(v&&!v.paused)v.pause();}}
tabs.forEach(function(b,i){b.addEventListener('click',function(){show(b.dataset.hp);});b.addEventListener('keydown',function(e){var n=-1;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n>=0){e.preventDefault();tabs[n].focus();show(tabs[n].dataset.hp);}});});
[].slice.call(document.querySelectorAll('[data-open-unit]')).forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();openMap(Number(l.dataset.openUnit));});});})();
init();(()=>{const keep=mu;metaUnits().forEach(u=>{mu=u;metaExpiryCheck();});mu=keep;})();renderStreak();openHome();""")

# ---------- Estación por pantallas · cero scroll (propuesta de Henry V4) ----------
ZSJS=open(HERE+'/zs.js',encoding='utf8').read()
a=sub1(a,'T.keys(q.kind).map(','zsKeys(T.keys(q.kind)).map(')
a=sub1(a,'function renderStation(){','function renderStation0(){')
a=sub1(a,'function showOnly(next){','function showOnly0(next){')
a=sub1(a,'init();(()=>{const keep=mu;',ZSJS+"\nfunction renderStation(){renderStation0();zsAfter();}\nfunction showOnly(next){showOnly0(next);document.body.classList.toggle('zs',next==='station');document.documentElement.classList.toggle('zs',next==='station');if(next==='station')zsRefit();}\nzsToast();\ninit();(()=>{const keep=mu;")

# ---------- index.html: pestañas + paneles de la portada ----------
panels=portal[portal.index('<div id="hp-bien"'):portal.index('<aside class="credits"')]
for n in (1,2,3):
    panels=panels.replace(f'href="unidades/u{n}/html/index.html?v=sim2"',f'href="#" data-open-unit="{n-1}"')
assert 'unidades/u' not in panels
tabsbar='<div class="home-tabs" role="tablist" aria-label="Secciones de la portada" id="unidades"><button type="button" role="tab" class="htab active" id="ht-units" data-hp="units" aria-selected="true" aria-controls="hp-units">Unidades</button><button type="button" role="tab" class="htab" id="ht-bien" data-hp="bien" aria-selected="false" aria-controls="hp-bien">Bienvenida</button><button type="button" role="tab" class="htab" id="ht-tour" data-hp="tour" aria-selected="false" aria-controls="hp-tour">Tour por el curso</button><button type="button" role="tab" class="htab" id="ht-como" data-hp="como" aria-selected="false" aria-controls="hp-como">Cómo avanzar</button></div>'
old=re.search(r'(      <div class="section-heading">.*?</div>\n      <div class="units-grid" id="unitsGrid"></div>)',idx,re.S); assert old
new='<div class="pt">'+tabsbar+'<div id="hp-units" class="hp" role="tabpanel" aria-labelledby="ht-units">\n'+old.group(1)+'\n</div>\n'+panels+'</div>'
i2=idx.replace(old.group(1),new)
# CSS de la portada acotado a .pt
st=re.sub(r'data:[a-z/+0-9.-]+;base64,[A-Za-z0-9+/=]+','DATA',portal[portal.index('<style>')+7:portal.index('</style>')])
lines=st.split('\n')
s0=next(i for i,l in enumerate(lines) if l.startswith('.home-tabs{')); s1=next(i for i,l in enumerate(lines) if l.startswith('.credits{'))
rules=[l for l in lines[s0:s1] if not l.startswith(('a.ucard','.units{','.hp[hidden]','a.ucard:hover'))]
def pref(rule):
    m=re.match(r'^(.*?)\{(.*)\}$',rule); sel,body=m.group(1),m.group(2)
    return ','.join('.pt '+s.strip() for s in sel.split(','))+'{'+body+'}'
css='.pt{--navy:#2b2a6b;--teal:#4b49a3;--coral:#c2406f;--green:#2f9a78;--sun:#f0b54a;--paper:#f6f1e7;--muted:#5b6070;margin-top:8px}\n.pt .hp[hidden]{display:none!important}\n.pt .wel-card,.pt .htab{font-family:inherit}.pt h2,.pt .rt-n{font-family:Fraunces,Georgia,serif}\n'+'\n'.join(pref(r) for r in rules)
css+="\n.pt .htab.active:hover{background:var(--navy);color:#fff}"
css+='\n'+open(HERE+'/zs.css',encoding='utf8').read()
css+="\n@media(max-width:820px){.pt .wel-grid{grid-template-columns:minmax(0,1fr)}.pt .how-steps{grid-template-columns:1fr}.pt .rt-sep{display:none}}\n@media(max-width:560px){.pt .home-tabs{flex-wrap:nowrap;overflow-x:auto}.pt .htab{flex:none;font-size:14px;padding:9px 14px}.pt .chu-row{overflow-x:auto;grid-template-columns:repeat(5,minmax(70px,1fr))}}"
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
man=motor.read('imsmanifest.xml').decode().replace('PACE_MATEMATICA_MODULAR_V7','PACE_CURSO_COMPLETO_U1_U2_U3_V4').replace('PACE UACh · Plataforma de nivelación · editable modular','PACE UACh · Curso de nivelación matemática (Unidades I, II y III)')
man=sub1(man,'</resource></resources>',''.join(f'<file href="tour/{n}"/>' for n in tour)+'</resource></resources>')
path=OUT+'/SCORM_CURSO_COMPLETO.zip'
with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('imsmanifest.xml',man); z.writestr('index.html',i2); z.writestr('app.js',a)
    for f in ['styles.css','mathjax/tex-svg.js','contract.js','content_text.js']: z.writestr(f,motor.read(f))
    z.writestr('data.js',datajs(units,'curso_completo'))
    for n,b in tour.items(): z.writestr('tour/'+n,b)
print(path, os.path.getsize(path)//1024,'KB')
