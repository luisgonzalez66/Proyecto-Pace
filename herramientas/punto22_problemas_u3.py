"""Punto 22 (23-11-2026): problemas con respuesta completa, interpretación y paso de x a lo pedido (U3 s006 y s011)."""
import json,random,sys
from fractions import Fraction as F
import sympy as sp
x=sp.symbols('x')
P='unidades/u3/unidad_03.json'
u=json.load(open(P));S={s['id']:s for s in u['stations']}
def fmt(v):
    v=F(v)
    if v.denominator==1:return str(v.numerator)
    return ('%.1f'%float(v)).replace('.','{,}')
def mc(q,correct,wrongs,why,level,seed):
    opts=[correct]+wrongs
    assert len(set(opts))==len(opts)==4,(q,opts)
    r=random.Random(seed);r.shuffle(opts)
    return {"q":q,"options":opts,"correct":opts.index(correct),"why":why,"level":level}
def inp(q,ans,why,level):
    return {"type":"input","kind":"number","q":q,"answer":str(ans),"why":why,"level":level}
def chk(eq,expect):
    sol=sp.solve(eq,x);assert sorted(sol)==sorted(expect),(eq,sol,expect)

# ---------------- u3-s006 · Resolver problemas lineales ----------------
L=[]
# A · edades padre/hijo
def A_T1(s,d,lv,seed):
    T=2*s+d;chk(x+(x+d)-T,[s])
    return mc(f"Un padre tiene {d} años más que su hijo y entre ambos suman {T} años. ¿Qué edad tiene cada uno?",
      f"El hijo tiene ${s}$ años y el padre, ${s+d}$.",
      [f"El hijo tiene ${s+d}$ años y el padre, ${s}$.",f"El hijo tiene ${T-d}$ años y el padre, ${T-d+d}$.",f"El hijo tiene ${T//2}$ años y el padre, ${T//2+d}$."],
      f"Con $x$ la edad del hijo: $x+(x+{d})={T}$, luego $2x={T-d}$ y $x={s}$. El padre tiene ${s}+{d}={s+d}$ años. Errores comunes: intercambiar las edades, olvidar dividir por 2 (${T-d}$) o repartir {T} en partes iguales (${T//2}$).",lv,seed)
def A_T3(s,d,lv):
    T=2*s+d;chk(x+(x+d)-T,[s])
    return inp(f"Un padre tiene {d} años más que su hijo y entre ambos suman {T} años. Con $x$ la edad del hijo, la ecuación $x+(x+{d})={T}$ da $x={s}$. ¿Cuántos años tiene el padre?",s+d,
      f"$x={s}$ es la edad del hijo; la pregunta es por el padre: ${s}+{d}={s+d}$ años. Si escribiste ${s}$, respondiste la edad del hijo.",lv)
# B · reparto Ana/Bruno: Ana = k·Bruno + c
def B_T1(b,k,c,lv,seed,obj='láminas'):
    T=b+k*b+c;chk(x+(k*x+c)-T,[b]);a=k*b+c
    kk={2:'el doble',3:'el triple',4:'el cuádruple'}[k]
    return mc(f"Ana tiene {kk} de {obj} que Bruno más {c}, y entre ambos tienen {T}. ¿Cuántas {obj} tiene Ana?",
      f"Ana tiene ${a}$ {obj}.",[f"Ana tiene ${b}$ {obj}.",f"Ana tiene ${k*b}$ {obj}.",f"Ana tiene ${T-b-c}$ {obj}." if T-b-c not in (a,b,k*b) else f"Ana tiene ${a+c}$ {obj}."],
      f"Con $x$ las {obj} de Bruno: $x+({k}x+{c})={T}$, luego ${k+1}x={T-c}$ y $x={b}$. La pregunta es por Ana: ${k}\\cdot{b}+{c}={a}$. ${b}$ es lo que tiene Bruno, y ${k*b}$ olvida sumar {c}.",lv,seed)
def B_T3(b,k,c,lv,obj='láminas'):
    T=b+k*b+c;chk(x+(k*x+c)-T,[b]);a=k*b+c
    kk={2:'el doble',3:'el triple',4:'el cuádruple'}[k]
    return inp(f"Ana tiene {kk} de {obj} que Bruno más {c}, y entre ambos tienen {T}. Con $x$ las {obj} de Bruno, se obtiene $x={b}$. ¿Cuántas {obj} tiene Ana?",a,
      f"$x={b}$ es lo que tiene Bruno. Ana tiene ${k}\\cdot{b}+{c}={a}$ {obj}.",lv)
# C · rectángulo perímetro, largo = ancho + d
def C_T1(a,d,lv,seed):
    Pm=2*(2*a+d);chk(2*(x+x+d)-Pm,[a]);w=F(Pm-d,2)
    return mc(f"Un rectángulo tiene perímetro {Pm} cm y su largo mide {d} cm más que su ancho. ¿Cuáles son sus dimensiones?",
      f"Ancho ${a}$ cm y largo ${a+d}$ cm.",[f"Ancho ${a+d}$ cm y largo ${a}$ cm.",f"Ancho ${a}$ cm y largo ${d}$ cm.",f"Ancho ${fmt(w)}$ cm y largo ${fmt(w+d)}$ cm."],
      f"Con $x$ el ancho: $2\\bigl(x+(x+{d})\\bigr)={Pm}$, luego $2x+{d}={Pm//2}$ y $x={a}$. El largo es ${a}+{d}={a+d}$ cm. Si sale un ancho de {fmt(w)} cm, se usó {Pm} como si fuera la suma de un ancho y un largo, olvidando que el perímetro cuenta cada lado dos veces.",lv,seed)
def C_T3(a,d,lv):
    Pm=2*(2*a+d)
    return inp(f"Un rectángulo tiene perímetro {Pm} cm y su largo mide {d} cm más que su ancho. Con $x$ el ancho, se obtiene $x={a}$. ¿Cuánto mide el largo, en cm?",a+d,
      f"$x={a}$ es el ancho; el largo mide ${a}+{d}={a+d}$ cm. Comprobación: $2({a}+{a+d})={Pm}$.",lv)
# D · tres consecutivos
def D_T1(n,lv,seed):
    T=3*n+3;chk(x+(x+1)+(x+2)-T,[n])
    return mc(f"La suma de tres números enteros consecutivos es {T}. ¿Cuáles son los números?",
      f"${n}$, ${n+1}$ y ${n+2}$.",[f"${n+1}$, ${n+2}$ y ${n+3}$.",f"${n-1}$, ${n}$ y ${n+1}$.",f"${n}$, ${n+2}$ y ${n+4}$."],
      f"Con $x$ el menor: $x+(x+1)+(x+2)={T}$, luego $3x={T-3}$ y $x={n}$. Los números son {n}, {n+1} y {n+2}. Tomar ${T}\\div3={n+1}$ como el menor es un error común: ese es el del medio.",lv,seed)
def D_T3(n,lv):
    T=3*n+3
    return inp(f"La suma de tres números enteros consecutivos es {T}. Con $x$ el menor, se obtiene $x={n}$. ¿Cuál es el mayor de los tres?",n+2,f"Los números son ${n}$, ${n+1}$ y ${n+2}$; el mayor es ${n+2}$.",lv)
# E1 · solución no entera en un conteo
def E_int(N,pa,pn,xa,lv,seed):
    M=int(pa*xa+pn*(N-xa));assert F(xa).denominator==2
    chk(pa*x+pn*(N-x)-M,[sp.Rational(F(xa).numerator,F(xa).denominator)])
    lo,hi=int(F(xa)-F(1,2)),int(F(xa)+F(1,2))
    return mc(f"Un cine vende entradas de adulto a CLP {pa} y de niño a CLP {pn}. Se informa que se vendieron {N} entradas y se recaudaron CLP {M}. Con $x$ el número de entradas de adulto, la ecuación da $x={fmt(xa)}$. ¿Qué se concluye?",
      "Los datos no son consistentes: el número de entradas tiene que ser un número entero.",[f"Se vendieron ${lo}$ entradas de adulto (se redondea hacia abajo).",f"Se vendieron ${hi}$ entradas de adulto (se redondea hacia arriba).",f"Se vendieron ${fmt(xa)}$ entradas de adulto."],
      f"$x$ cuenta entradas, así que solo puede ser un número natural. Como la ecuación da ${fmt(xa)}$, no existe una venta que cumpla los dos datos a la vez: alguno de los datos está mal. Redondear no sirve: con {lo} o con {hi} entradas de adulto la recaudación no es CLP {M}.",lv,seed)
# E2 · tiempo negativo = en el pasado
def E_time(F0,s,lv,seed):
    t=F0-2*s;assert t<0;chk((F0+x)-2*(s+x),[t])
    return mc(f"Hoy un padre tiene {F0} años y su hijo {s}. Con $t$ los años que deben pasar para que la edad del padre sea el doble de la del hijo, la ecuación ${F0}+t=2({s}+t)$ da $t={t}$. ¿Qué responde el problema?",
      f"Eso ocurrió hace ${-t}$ años: el padre tenía ${F0+t}$ y el hijo ${s+t}$.",[f"Ocurrirá dentro de ${-t}$ años.","El problema no tiene solución, porque el tiempo no puede ser negativo.",f"El hijo tendrá ${t}$ años."],
      f"Un $t$ negativo indica que el momento ya pasó: hace ${-t}$ años el padre tenía ${F0}-{-t}={F0+t}$ y el hijo ${s}-{-t}={s+t}$, y efectivamente ${F0+t}=2\\cdot{s+t}$. Dentro de {-t} años el padre tendría {F0-t} y el hijo {s-t}, que no cumple.",lv,seed)

s6=S['u3-s006']['practice']
L2=[A_T1(16,28,2,1),A_T1(13,24,2,2),A_T3(11,30,2),A_T3(17,24,2),B_T3(9,3,4,2),B_T3(12,2,7,2,'figuritas'),D_T3(23,2),C_T3(7,5,2),D_T1(14,2,3),D_T1(32,2,4)]
L3=[B_T1(11,3,6,3,5),B_T1(15,4,5,3,6,'figuritas'),C_T1(9,4,3,7),C_T1(14,6,3,8),E_int(80,4000,2500,F(85,2),3,9),E_int(120,5000,3000,F(121,2),3,10),E_int(96,4500,2000,F(77,2),3,11),E_time(44,26,3,12),E_time(50,29,3,13),E_time(38,21,3,14)]
R6_2=[28,29,32,33,34,35,36,37,38,39];R6_3=[42,46,47,48,50,52,54,55,56,58]
for i,q in zip(R6_2,L2):assert s6[i]['level']==2 and s6[i].get('type')=='input';s6[i]=q
for i,q in zip(R6_3,L3):assert s6[i]['level']==3 and s6[i].get('type')=='input';s6[i]=q

# ---------------- u3-s011 · Problemas cuadráticos ----------------
def F_T1(a,d,lv,seed):
    A=a*(a+d);chk(x*(x+d)-A,[a,-(a+d)])
    return mc(f"Un rectángulo tiene un área de ${A}\\,\\mathrm{{cm}}^2$ y su largo mide {d} cm más que su ancho. ¿Cuáles son sus dimensiones?",
      f"Ancho ${a}$ cm y largo ${a+d}$ cm.",[f"Ancho ${a+d}$ cm y largo ${a}$ cm.",f"Ancho ${a}$ cm y largo ${d}$ cm.",f"Ancho ${a}$ cm y largo $-{a+d}$ cm."],
      f"Con $x$ el ancho: $x(x+{d})={A}$, luego $x^2+{d}x-{A}=0$, con soluciones $x={a}$ y $x=-{a+d}$. Una longitud no puede ser negativa, así que el ancho es {a} cm y el largo {a+d} cm.",lv,seed)
def F_T3(a,d,lv):
    A=a*(a+d);chk(x*(x+d)-A,[a,-(a+d)])
    return inp(f"Un rectángulo tiene un área de ${A}\\,\\mathrm{{cm}}^2$ y su largo mide {d} cm más que su ancho. Con $x$ el ancho, la ecuación $x(x+{d})={A}$ da $x={a}$ y $x=-{a+d}$. ¿Cuánto mide el largo, en cm?",a+d,
      f"Se descarta $x=-{a+d}$ (una longitud no es negativa), así que el ancho es {a} cm. La pregunta es por el largo: ${a}+{d}={a+d}$ cm.",lv)
def F_T2(a,d,lv,seed,obj='terreno',un='m'):
    A=a*(a+d);chk(x*(x+d)-A,[a,-(a+d)])
    return mc(f"Un {obj} rectangular mide {d} {un} más de largo que de ancho y su área es ${A}\\,\\mathrm{{{un}}}^2$. Con $x$ el ancho, la ecuación $x(x+{d})={A}$ tiene soluciones $x={a}$ y $x=-{a+d}$. ¿Qué responde el problema?",
      f"El ancho mide ${a}$ {un}; $-{a+d}$ se descarta porque una longitud no puede ser negativa.",[f"Hay dos respuestas: ${a}$ {un} y $-{a+d}$ {un}.",f"El ancho mide ${a+d}$ {un}.",f"El ancho mide ${a}$ {un} o ${a+d}$ {un}."],
      f"Las dos soluciones cumplen la ecuación, pero $x$ es una longitud, así que $x=-{a+d}$ no tiene sentido en el problema. El ancho es {a} {un} (y el largo, {a+d} {un}). Tomar {a+d} confunde la solución descartada con una medida.",lv,seed)
def G_T2(n,lv,seed):
    Pp=n*(n+1);chk(x*(x+1)-Pp,[n,-(n+1)])
    return mc(f"El producto de dos números enteros consecutivos es {Pp}. Con $n$ el menor, la ecuación $n(n+1)={Pp}$ tiene soluciones $n={n}$ y $n=-{n+1}$. ¿Qué pares de números cumplen?",
      f"Dos pares: ${n}$ y ${n+1}$, y también $-{n+1}$ y $-{n}$.",[f"Solo ${n}$ y ${n+1}$, porque $-{n+1}$ es negativo.",f"Solo $-{n+1}$ y $-{n}$.","Ningún par, porque una de las soluciones es negativa."],
      f"El enunciado no exige que los números sean positivos, y $(-{n+1})(-{n})={Pp}$. Las dos soluciones sirven. Una solución negativa se descarta solo cuando el contexto lo exige (una longitud, una cantidad de objetos, un tiempo).",lv,seed)
def G_T1(n,lv,seed):
    Pp=n*(n+1);chk(x*(x+1)-Pp,[n,-(n+1)])
    return mc(f"El producto de dos números positivos consecutivos es {Pp}. ¿Cuáles son los números?",
      f"${n}$ y ${n+1}$.",[f"${n-1}$ y ${n}$.",f"$-{n+1}$ y $-{n}$.",f"${n}$ y ${n+2}$."],
      f"Con $x$ el menor: $x(x+1)={Pp}$, luego $x^2+x-{Pp}=0$, con soluciones $x={n}$ y $x=-{n+1}$. Como los números deben ser positivos, son {n} y {n+1}.",lv,seed)
def G_T3(n,lv):
    Pp=n*(n+1)
    return inp(f"El producto de dos números positivos consecutivos es {Pp}. Con $x$ el menor, se obtiene $x={n}$. ¿Cuánto suman los dos números?",2*n+1,f"Los números son ${n}$ y ${n+1}$; su suma es ${2*n+1}$.",lv)
def H_T3(n,lv):
    Pp=n*(n+2);chk(x*(x+2)-Pp,[n,-(n+2)])
    return inp(f"El producto de dos números pares positivos consecutivos es {Pp}. Con $x$ el menor, la ecuación $x(x+2)={Pp}$ da $x={n}$ y $x=-{n+2}$. ¿Cuál es el mayor de los dos números?",n+2,
      f"Se descarta $x=-{n+2}$ (los números son positivos), así que el menor es {n} y el mayor ${n}+2={n+2}$.",lv)
def I_suelo(a,b,lv,seed):
    v=5*(a-b);h0=5*a*b;t=sp.symbols('t');assert sorted(sp.solve(-5*t**2+v*t+h0,t))==[-b,a]
    return mc(f"Se lanza una piedra hacia arriba desde lo alto de un edificio. Su altura (en metros) es $h(t)=-5t^2+{v}t+{h0}$, con $t$ en segundos desde el lanzamiento. La ecuación $h(t)=0$ tiene soluciones $t={a}$ y $t=-{b}$. ¿Qué responde el problema?",
      f"La piedra llega al suelo a los ${a}$ s; $t=-{b}$ se descarta porque es anterior al lanzamiento.",[f"Llega al suelo a los ${b}$ s.",f"Llega al suelo dos veces: a los ${a}$ s y a los $-{b}$ s.",f"Llega al suelo a los ${a+b}$ s."],
      f"El tiempo se cuenta desde el lanzamiento, así que solo sirven valores $t\\ge 0$. La piedra llega al suelo en $t={a}$ s. Comprobación: $-5\\cdot{a*a}+{v}\\cdot{a}+{h0}=0$.",lv,seed)
def I_dos(r1,r2,lv,seed):
    v=5*(r1+r2);H=5*r1*r2;t=sp.symbols('t');assert sorted(sp.solve(-5*t**2+v*t-H,t))==[r1,r2]
    return mc(f"La altura (en metros) de una pelota lanzada hacia arriba es $h(t)=-5t^2+{v}t$, con $t$ en segundos. La ecuación $h(t)={H}$ tiene soluciones $t={r1}$ y $t={r2}$. ¿Qué significan?",
      f"La pelota pasa por los ${H}$ m dos veces: subiendo, a los ${r1}$ s, y bajando, a los ${r2}$ s.",[f"Solo sirve $t={r1}$: una ecuación tiene una única respuesta.",f"La pelota está a ${H}$ m durante todo el intervalo entre ${r1}$ y ${r2}$ s.",f"La pelota alcanza su altura máxima, ${H}$ m, a los ${r1+r2}$ s."],
      f"Las dos soluciones son positivas y tienen sentido: la pelota sube, pasa por {H} m en $t={r1}$, llega más alto y vuelve a pasar por {H} m al bajar, en $t={r2}$. Entre esos instantes está sobre los {H} m.",lv,seed)
def J_T2(p,q,lv,seed):
    b=q-p;c=p*q;assert b>=2;chk(x**2-b*x-c,[-p,q])
    return mc(f"Si al cuadrado de un número se le resta {b} veces el número, se obtiene {c}. La ecuación $x^2-{b}x={c}$ tiene soluciones $x={q}$ y $x=-{p}$. ¿Qué números cumplen?",
      f"Los dos: ${q}$ y $-{p}$.",[f"Solo ${q}$, porque las soluciones negativas se descartan.",f"Solo $-{p}$.",f"${q}$ y ${p}$."],
      f"El enunciado habla de «un número», sin exigir que sea positivo, y las dos soluciones cumplen: ${q}^2-{b}\\cdot{q}={q*q-b*q}$ y $(-{p})^2-{b}\\cdot(-{p})={p*p+b*p}$.",lv,seed)
def K_T1(a,b,h,lv,seed):
    d=b-a;chk(x**2+(x+d)**2-h**2,[a,-b])
    return mc(f"En un triángulo rectángulo, un cateto mide {d} cm más que el otro y la hipotenusa mide {h} cm. ¿Cuánto miden los catetos?",
      f"${a}$ cm y ${b}$ cm.",[f"${a}$ cm y ${d}$ cm.",f"${b}$ cm y ${b+d}$ cm.",f"${a}$ cm y $-{b}$ cm."],
      f"Con $x$ el cateto menor: $x^2+(x+{d})^2={h}^2$, luego $2x^2+{2*d}x-{h*h-d*d}=0$, con soluciones $x={a}$ y $x=-{b}$. Se descarta la negativa: los catetos miden {a} y {b} cm. Comprobación: ${a*a}+{b*b}={h*h}$.",lv,seed)

s11=S['u3-s011']['practice']
M2=[F_T1(9,7,2,21),F_T1(12,5,2,22),F_T1(8,9,2,23),F_T3(13,4,2),F_T3(11,9,2),G_T3(15,2),H_T3(12,2),G_T1(19,2,24),K_T1(5,12,13,2,25),K_T1(8,15,17,2,26)]
M3=[F_T2(14,6,3,31),F_T2(9,8,3,32,'patio'),G_T2(12,3,33),G_T2(21,3,34),I_suelo(4,1,3,35),I_suelo(5,2,3,36),I_dos(1,3,3,37),I_dos(2,5,3,38),J_T2(4,7,3,39),J_T2(3,8,3,40)]
R11_2=[28,30,31,32,33,34,35,36,37,38];R11_3=[41,50,51,52,53,55,56,57,58,59]
for i,q in zip(R11_2,M2):assert s11[i]['level']==2 and s11[i].get('type')=='input';s11[i]=q
for i,q in zip(R11_3,M3):assert s11[i]['level']==3 and s11[i].get('type')=='input';s11[i]=q
json.dump(u,open(P,'w'),ensure_ascii=False,indent=1)
print('ok')
