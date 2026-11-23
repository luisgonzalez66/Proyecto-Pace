"""Sugerencia #7 (23-11-2026): trinomios ax^2+bx+c con a != 1 en la estación u2-s012 (método ac + agrupación)."""
import json,random
import sympy as sp
x=sp.symbols('x')
P='unidades/u2/unidad_02.json'
raw=open(P).read();u=json.loads(raw);s=[t for t in u['stations'] if t['id']=='u2-s012'][0]
def lin(p,q):return ('x' if p==1 else f'{p}x')+(f' + {q}' if q>0 else f' - {-q}')
def fac(p,q,r,t):return f'\\left({lin(p,q)}\\right)\\left({lin(r,t)}\\right)'
def poly(e):
    e=sp.expand(e);a,b,c=[int(e.coeff(x,k)) for k in (2,1,0)]
    out=(f'{a}x^{{2}}' if a!=1 else 'x^{2}')
    if b:out+=(' + ' if b>0 else ' - ')+(f'{abs(b)}x' if abs(b)!=1 else 'x')
    if c:out+=(' + ' if c>0 else ' - ')+str(abs(c))
    return out
def sx(k):return ('+' if k>0 else '-')+('x' if abs(k)==1 else f'{abs(k)}x')
def bx(b):return 'x' if b==1 else ('-x' if b==-1 else f'{b}x')
def acpair(a,b,c):
    for m in range(-abs(a*c)-1,abs(a*c)+2):
        if m and (a*c)%m==0 and m+(a*c)//m==b and m<=(a*c)//m:return m,(a*c)//m
def mcq(p,q,r,t,lv,seed):
    E=(p*x+q)*(r*x+t);a,b,c=[int(sp.expand(E).coeff(x,k)) for k in (2,1,0)];assert sp.gcd_list([a,b,c])==1
    m,n=acpair(a,b,c);corr=fac(p,q,r,t)
    W=[(fac(p,t,r,q),(p*x+t)*(r*x+q)),(fac(p,-q,r,-t),(p*x-q)*(r*x-t)),(f'\\left(x {"+" if m>0 else "-"} {abs(m)}\\right)\\left(x {"+" if n>0 else "-"} {abs(n)}\\right)',(x+m)*(x+n))]
    opts=[corr]+[w for w,_ in W];assert len(set(opts))==4
    for w,e in W:assert sp.expand(e)!=sp.expand(E)
    fbm={W[0][0]:f'Al expandir se obtiene ${poly(W[0][1])}$: el término central no es ${bx(b)}$. Revisa qué número va con cada término en $x$.',
         W[1][0]:f'Al expandir se obtiene ${poly(W[1][1])}$: revisa los signos.',
         W[2][0]:f'${m}$ y ${n}$ sirven para separar el término central ($a\\cdot c={a*c}$), pero no son los términos de los binomios: falta agrupar.'}
    o=[f'${v}$' for v in opts];r_=random.Random(seed);idx=list(range(4));r_.shuffle(idx);o=[o[k] for k in idx];fb=[fbm.get(opts[k],'') for k in idx]
    why=(f'Método $ac$: $a\\cdot c={a}\\cdot{c if c>0 else "("+str(c)+")"}={a*c}$. Dos números con producto ${a*c}$ y suma ${b}$: ${m}$ y ${n}$. '
         f'Se separa el término central y se agrupa: ${poly(E)}={a}x^{{2}}{sx(m)}{sx(n)}{c:+d}$, que se factoriza como ${corr}$.')
    return {"q":f"Factoriza completamente ${poly(E)}$.","options":o,"correct":idx.index(0),"why":why,"fb":fb,"level":lv}
def miss(p,q,r,t,hide,lv):
    E=(p*x+q)*(r*x+t);parts=[p,q,r,t];val=abs(parts[hide])
    def l(pp,qq,h):
        if h:return ('x' if pp==1 else f'{pp}x')+(' + \\square' if qq>0 else ' - \\square')
        return lin(pp,qq)
    tex=f'\\left({l(p,q,hide==1)}\\right)\\left({l(r,t,hide==3)}\\right)'
    return {"type":"input","kind":"number","q":f"Completa el número que falta. Escribe solo el número. ${poly(E)}={tex}$","answer":str(val),
            "why":f"Expande para comprobar: ${fac(p,q,r,t)}={poly(E)}$. El número que falta es ${val}$.","level":lv}
def acprod(p,q,r,t,lv):
    E=(p*x+q)*(r*x+t);a,b,c=[int(sp.expand(E).coeff(x,k)) for k in (2,1,0)];m,n=acpair(a,b,c)
    return {"type":"input","kind":"number","q":f"Para factorizar ${poly(E)}$ con el método $ac$, se buscan dos números cuya suma sea ${b}$. ¿Cuál debe ser su producto?","answer":str(a*c),
            "why":f"El producto debe ser $a\\cdot c={a}\\cdot{c}={a*c}$. Los números son ${m}$ y ${n}$: ${m}+{n}={b}$.","level":lv}
Pr=s['practice']
NEW={20:mcq(2,1,1,3,2,1),22:mcq(3,4,1,2,2,2),23:mcq(2,1,3,2,2,3),38:acprod(2,1,3,2,2),
     45:mcq(2,3,1,-2,3,4),50:mcq(5,-2,1,3,3,5),51:mcq(5,3,1,-2,3,6),
     55:miss(2,-5,1,-2,1,3),56:miss(2,1,3,-2,3,3),57:miss(3,-1,1,2,1,3)}
for i,q in NEW.items():
    assert Pr[i]['level']==q['level'];Pr[i]=q
# Aplica
C=s['checks']
C[14]={"type":"input","kind":"number","q":"Un tablero rectangular de área $2x^2+7x+3$ dm² tiene un lado de $(2x+1)$ dm. ¿Cuánto mide el otro lado si $x=4$? Escribe solo el número.","answer":"7",
       "why":"Método $ac$: $2\\cdot3=6$; dos números con producto $6$ y suma $7$: $1$ y $6$. $2x^2+7x+3=2x^2+x+6x+3=x(2x+1)+3(2x+1)=(2x+1)(x+3)$. El otro lado es $x+3=7$ dm."}
assert sp.expand((2*x+1)*(x+3))==2*x**2+7*x+3
o=["$\\left(3x + 4\\right)\\left(x + 2\\right)$","$\\left(3x + 2\\right)\\left(x + 4\\right)$","$\\left(x + 4\\right)\\left(x + 6\\right)$","$\\left(3x + 8\\right)\\left(x + 1\\right)$"]
assert sp.expand((3*x+4)*(x+2))==3*x**2+10*x+8
C[15]={"q":"Un invernadero rectangular tiene área $3x^2+10x+8$ m². ¿Qué dimensiones puede tener?","options":[o[2],o[0],o[3],o[1]],"correct":1,
       "why":"Método $ac$: $3\\cdot8=24$; dos números con producto $24$ y suma $10$: $4$ y $6$. $3x^2+4x+6x+8=x(3x+4)+2(3x+4)=(3x+4)(x+2)$.",
       "fb":["$4$ y $6$ sirven para separar el término central, pero no son los términos de los binomios: falta agrupar.","","Al expandir se obtiene $3x^{2}+11x+8$: el término central no es $10x$.","Al expandir se obtiene $3x^{2}+14x+8$: revisa qué número va con cada término en $x$."]}
# Aprende
L=s['learn']
L['goal']="Al terminar podrás factorizar trinomios $x^2+bx+c$ buscando dos números por **suma y producto**, factorizar trinomios $ax^2+bx+c$ con $a\\neq1$ con el **método $ac$**, y elegir el método para factorizar **completamente**."
add="\n\nSi el coeficiente de $x^2$ es $a\\neq1$ y no hay factor común, usa el **método $ac$**: busca dos números cuyo producto sea $a\\cdot c$ y cuya suma sea $b$, separa el término central con ellos y factoriza por **agrupación**."
if 'método $ac$' not in L['idea']:L['idea']+=add
if 'método $ac$' not in s['concept']:s['concept']+=add
ex={"title":"Factorizamos $3x^2-11x+10$ (con $a\\neq1$).","items":[
 {"math":"a\\cdot c=3\\cdot10=30,\\qquad m+n=-11","why":"Método $ac$: buscamos dos números cuyo **producto** sea $a\\cdot c=30$ y cuya **suma** sea $-11$.","side":{"title":"Pares con producto 30","math":"(-1)(-30),\\ (-2)(-15),\\ (-3)(-10),\\ (-5)(-6)"}},
 {"math":"3x^2-11x+10=3x^2-5x-6x+10","why":"Sirven $-5$ y $-6$: separamos el término central $-11x$ en $-5x-6x$."},
 {"math":"=x(3x-5)-2(3x-5)","why":"Factorizamos por **agrupación**: un factor común en cada par de términos."},
 {"math":"=(3x-5)(x-2)","why":"Sacamos el factor común $(3x-5)$. **La factorización termina aquí.**"},
 {"math":"x=0:\\quad 10,\\quad (-5)(-2)=10\\ \\checkmark","why":"**Verificación** (no forma parte de la factorización): con $x=0$, ambas expresiones valen $10$."}]}
assert sp.expand((3*x-5)*(x-2))==3*x**2-11*x+10
if not any('a\\neq1' in m.get('title','') for m in L['more']):
    assert 'completamente $2x^2-2x-24$' in L['more'][1]['title'];L['more'][1]=ex
for m in L['more']:
    for it in m['items']:
        sd=it.get('side')
        if sd and sd.get('title')=='¿Qué método uso?':sd['text']="1) Factor común. 2) Dos términos: diferencia de cuadrados. 3) Tres términos: cuadrado perfecto, suma y producto, o método $ac$ si $a\\neq1$. 4) Cuatro términos: agrupación."
open(P,'w').write(json.dumps(u,ensure_ascii=False,indent=2)+('\n' if raw.endswith('\n') else ''))
print('ok')
