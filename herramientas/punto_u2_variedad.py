"""Unidad II · Practica regenerada (24-11-2026).

Objetivo (pedido de Luis, análisis U2 vs U3):
  · niveles calibrados por estructura (1: caso básico, 2: coeficientes ≠ 1 o signos mezclados, 3: dos letras, factor común previo,
    identidades usadas al revés, detectar errores);
  · más variedad de enunciados (detectar el error, operación inversa, evaluar sin desarrollar, cálculo mental, contexto);
  · mitad de respuesta escrita en cada nivel (10 A + 10 E), incluidas factorizaciones respondidas con un conjunto de números;
  · lenguaje algebraico en la estación 1.
Cada estación queda con 60 preguntas (20 por nivel). La primera pregunta escrita de nivel 2 es la de «Antes de empezar».
Uso: python3 herramientas/punto_u2_variedad.py   (reescribe unidades/u2/unidad_02.json; la Aplica y el Aprende no cambian)
"""
import json, random, os, sys
from fractions import Fraction as F
from math import gcd

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUTA = os.path.join(RAIZ, 'unidades', 'u2', 'unidad_02.json')

# ---------------- formato ----------------
def coef_txt(c, mon, first):
    c = F(c)
    s = '-' if c < 0 else ('' if first else '+')
    a = abs(c)
    if a.denominator != 1:
        body = r'\frac{%s%s}{%d}' % ('' if (a.numerator == 1 and mon) else a.numerator, mon, a.denominator)
    elif mon:
        body = ('' if a == 1 else str(a.numerator)) + mon
    else:
        body = str(a.numerator)
    if first: return s + body
    return f' {s} {body}'

def P(terms):
    """terms: lista de (coef, monomio) -> texto TeX sin $."""
    out = ''; first = True
    for c, m in terms:
        if c == 0: continue
        out += coef_txt(c, m, first); first = False
    return out or '0'

def pw(v, n): return v if n == 1 else (f'{v}^{{{n}}}' if n else '')
def poly(cs, v='x'):
    n = len(cs) - 1
    return P([(c, pw(v, n - i)) for i, c in enumerate(cs)])
def par(s): return r'\left(' + s + r'\right)'
def lin(a, b, v='x'): return P([(a, v), (b, '')])
def D(s): return '$' + s + '$'

def mc(q, ok, malas, why, lv, r, fb=None):
    ops = [ok]; fbs = ['']
    for i, m in enumerate(malas):
        if m not in ops: ops.append(m); fbs.append((fb or [''] * len(malas))[i] if fb else '')
        if len(ops) == 4: break
    if len(ops) < 4: raise ValueError('pocas alternativas')
    idx = list(range(4)); r.shuffle(idx)
    it = {'q': q, 'options': [ops[i] for i in idx], 'correct': idx.index(0), 'why': why, 'level': lv}
    if fb and any(fbs): it['fb'] = [fbs[i] for i in idx]
    return it

def inp(q, ans, why, lv, kind='number'):
    return {'type': 'input', 'kind': kind, 'q': q, 'answer': str(ans), 'why': why, 'level': lv}

def nz(r, a, b, ex=()):
    while True:
        v = r.randint(a, b)
        if v != 0 and v not in ex: return v
def sg(r): return r.choice([1, -1])
VAR = ['x', 'y', 'a', 'm', 't']
VISTOS = set()
def rep(f, lv, n):
    """Llama la plantilla n veces; reintenta si falla o si repite un enunciado ya generado en la estación."""
    out = []; ult = 'repite enunciados'
    for _ in range(n * 200):
        if len(out) == n: return out
        try: q = f(lv)
        except (ValueError, IndexError, ZeroDivisionError) as e: ult = repr(e); continue
        if q['q'] in VISTOS: continue
        VISTOS.add(q['q']); out.append(q)
    if len(out) == n: return out
    raise ValueError(f'plantilla agotada: {getattr(f, "__name__", f)} nivel {lv}: {ult}')

# =====================================================================
# s001 · Lenguaje y valor numérico
# =====================================================================
TRAD1 = [  # (frase, correcta(n), malas(n))
    ('el doble de un número, aumentado en {n}', lambda n: f'2x + {n}', lambda n: [f'2(x + {n})', f'x^{{2}} + {n}', f'2 + {n}x'],
     ['Así se suma antes de duplicar: primero se duplica el número y después se suma.', '«El doble» es multiplicar por $2$, no elevar al cuadrado.', 'El $2$ debe multiplicar al número.']),
    ('un número disminuido en {n}', lambda n: f'x - {n}', lambda n: [f'{n} - x', f'{n}x', f'x + {n}'],
     ['El orden importa: se parte del número y se le resta.', '«Disminuido» indica una resta, no una multiplicación.', '«Disminuido» indica restar, no sumar.']),
    ('el triple de un número', lambda n: '3x', lambda n: ['x^{3}', 'x + 3', '3 + x'],
     ['«El triple» es multiplicar por $3$, no elevar al cubo.', '«El triple» es multiplicar por $3$, no sumar $3$.', '«El triple» es multiplicar por $3$, no sumar $3$.']),
    ('el cuadrado de un número, aumentado en {n}', lambda n: f'x^{{2}} + {n}', lambda n: [f'(x + {n})^{{2}}', f'2x + {n}', f'x^{{{n}}}'],
     ['Así se eleva la suma completa; la frase eleva solo el número y después suma.', '«El cuadrado» es elevar a $2$, no multiplicar por $2$.', 'El número que se suma no es un exponente.']),
    ('la mitad de un número, disminuida en {n}', lambda n: r'\frac{x}{2} - ' + str(n), lambda n: [r'\frac{x - ' + str(n) + '}{2}', f'2x - {n}', r'\frac{2}{x} - ' + str(n)],
     ['Así se resta antes de dividir; la frase toma primero la mitad.', '«La mitad» es dividir por $2$, no multiplicar.', 'La mitad de $x$ es $x$ dividido por $2$, no $2$ dividido por $x$.']),
    ('{n} veces un número, menos {m}', lambda n, m=None: None, None),
]
def s001(r):
    T = {1: [], 2: [], 3: []}
    # ---- nivel 1
    def coef1(lv):
        v, w = r.sample(['x', 'y', 'a'], 2); a = nz(r, -9, 9); b = nz(r, -9, 9); c = nz(r, -9, 9)
        return inp(f'En la expresión ${P([(a, v), (b, w), (c, "")])}$, ¿cuál es el coeficiente del término con ${v}$? Escribe solo el número.',
                   a, f'El coeficiente es el número que multiplica a ${v}$, **con su signo**: ${a}$.', lv)
    def val1(lv):
        a = r.randint(2, 6); b = nz(r, -9, 9); x = r.randint(2, 6)
        return inp(f'Calcula el valor de ${lin(a, b)}$ para $x = {x}$. Escribe solo el número.', a * x + b,
                   f'Reemplazamos: ${a}\\cdot {x} {"+" if b > 0 else "-"} {abs(b)} = {a * x + b}$.', lv)
    def ind1(lv):
        a = nz(r, -9, 9); b = nz(r, -9, 9); c = nz(r, -9, 9)
        return inp(f'¿Cuál es el término independiente de ${P([(a, "x^{2}"), (b, "x"), (c, "")])}$? Escribe solo el número, con su signo.', c,
                   f'El término independiente es el que no tiene letra: ${c}$.', lv)
    def trad1(lv):
        f, ok, malas, fbs = r.choice(TRAD1[:5]); n = r.randint(2, 9)
        return mc(f'¿Qué expresión representa «{f.format(n=n)}»? Usa $x$ para el número.', D(ok(n)), [D(m) for m in malas(n)],
                  f'Se escribe en el orden en que se dice: «{f.format(n=n)}» es ${ok(n)}$.', lv, r, fb=fbs)
    def term1(lv):
        n = r.randint(2, 4); mons = r.sample(['x^{3}', 'x^{2}', 'x', 'y', ''], n)
        e = P([(nz(r, -9, 9), m) for m in mons])
        return mc(f'¿Cuántos términos tiene la expresión ${e}$?', f'${n}$', [f'${k}$' for k in (1, 2, 3, 4, 5) if k != n],
                  f'Los términos se separan por los signos $+$ y $-$ (que no estén dentro de un paréntesis): hay ${n}$.', lv, r,
                  fb=[('Te faltó contar algún término: cada $+$ o $-$ que no está dentro de un paréntesis separa dos términos.' if k < n else 'Contaste de más: un número con su parte literal, como $-7x^{2}$, es un solo término.') for k in (1, 2, 3, 4, 5) if k != n])
    T[1] += rep(coef1, 1, 4)
    T[1] += rep(val1, 1, 4)
    T[1] += rep(ind1, 1, 2)
    T[1] += rep(trad1, 1, 7)
    T[1] += rep(term1, 1, 3)
    # ---- nivel 2
    def val2(lv):  # valor numérico con potencias y negativos (pregunta de entrada)
        b = nz(r, -6, 6); c = nz(r, -9, 9); x = r.choice([-3, -2, -1, 2, 3])
        return inp(f'Calcula el valor de ${poly([1, b, c])}$ para $x = {x}$. Escribe solo el número.', x * x + b * x + c,
                   f'Reemplazamos con paréntesis: $({x})^2 {"+" if b > 0 else "-"} {abs(b)}\\cdot({x}) {"+" if c > 0 else "-"} {abs(c)} = {x * x} {"+" if b * x >= 0 else "-"} {abs(b * x)} {"+" if c > 0 else "-"} {abs(c)} = {x * x + b * x + c}$.', lv)
    def coef2(lv):
        v = r.choice(['x', 'y', 'a']); a = nz(r, -9, 9); b = nz(r, -9, 9); c = nz(r, -9, 9)
        return inp(f'En la expresión ${P([(b, v), (a, pw(v, 2)), (c, "")])}$, ¿cuál es el coeficiente de ${pw(v, 2)}$? Escribe solo el número.', a,
                   f'El término con ${pw(v, 2)}$ es ${P([(a, pw(v, 2))])}$: su coeficiente es ${a}$.', lv)
    def form2(lv):
        b = r.randint(3, 9); h = r.randint(2, 8)
        k = r.choice(['tri', 'tra'])
        if k == 'tri':
            return inp(f'El área de un triángulo es $A=\\dfrac{{b\\cdot h}}{{2}}$. Calcula $A$ para $b={2 * b}$ y $h={h}$. Escribe solo el número.', b * h,
                       f'$A=\\dfrac{{{2 * b}\\cdot {h}}}{{2}}={b * h}$.', lv)
        return inp(f'La temperatura en grados Fahrenheit es $F=\\dfrac{{9C}}{{5}}+32$. Calcula $F$ para $C={5 * h}$. Escribe solo el número.', 9 * h + 32,
                   f'$F=\\dfrac{{9\\cdot {5 * h}}}{{5}}+32={9 * h}+32={9 * h + 32}$.', lv)
    TRAD2 = [
        ('el doble de la suma de un número y {n}', lambda n: f'2(x + {n})', lambda n: [f'2x + {n}', f'(x + {n})^{{2}}', f'2 + x + {n}'],
         ['Así solo se duplica el número: «el doble de la suma» multiplica la suma completa, con paréntesis.', '«El doble» es multiplicar por $2$, no elevar al cuadrado.', '«El doble» es multiplicar por $2$, no sumar $2$.']),
        ('la suma del cuadrado de un número y {n}', lambda n: f'x^{{2}} + {n}', lambda n: [f'(x + {n})^{{2}}', f'2x + {n}', f'x^{{2}} + {n}^{{2}}'],
         ['Así se eleva la suma completa; la frase eleva solo el número.', '«El cuadrado» es elevar a $2$, no multiplicar por $2$.', 'Solo el número va al cuadrado; el otro sumando no.']),
        ('el cuadrado de la suma de un número y {n}', lambda n: f'(x + {n})^{{2}}', lambda n: [f'x^{{2}} + {n}', f'x^{{2}} + {n}^{{2}}', f'2(x + {n})'],
         ['«El cuadrado de la suma» eleva la suma completa: hace falta el paréntesis.', 'El cuadrado de una suma no es la suma de los cuadrados.', '«El cuadrado» es elevar a $2$, no multiplicar por $2$.']),
        ('el triple de la diferencia entre un número y {n}', lambda n: f'3(x - {n})', lambda n: [f'3x - {n}', f'3({n} - x)', f'(x - {n})^{{3}}'],
         ['Así solo se triplica el número: el triple de la diferencia lleva paréntesis.', 'El orden de la resta importa: es el número menos el otro.', '«El triple» es multiplicar por $3$, no elevar al cubo.']),
        ('la diferencia entre el triple de un número y {n}', lambda n: f'3x - {n}', lambda n: [f'3(x - {n})', f'{n} - 3x', f'x^{{3}} - {n}'],
         ['Así se triplica la diferencia completa; la frase triplica solo el número y después resta.', 'El orden de la resta importa: primero va el triple del número.', '«El triple» es multiplicar por $3$, no elevar al cubo.']),
    ]
    def trad2(lv):
        f, ok, malas, fbs = r.choice(TRAD2); n = r.randint(2, 9)
        return mc(f'¿Qué expresión representa «{f.format(n=n)}»? Usa $x$ para el número.', D(ok(n)), [D(m) for m in malas(n)],
                  'Fíjate en qué operación se hace **al final**: «el doble de la suma» multiplica la suma completa; «la suma del cuadrado» eleva solo el número.', lv, r, fb=fbs)
    def signo2(lv):
        x = r.randint(2, 6)
        return mc(f'¿Cuál es el valor de $-x^{{2}}$ para $x=-{x}$?', f'${-x * x}$', [f'${x * x}$', f'${-2 * x}$', f'${2 * x}$'],
                  f'Primero la potencia y después el signo: $-(-{x})^2=-({x * x})={-x * x}$.', lv, r,
                  fb=['El signo menos de adelante no se eleva al cuadrado: $-x^2$ es «el opuesto de $x^2$».', 'Elevar al cuadrado no es multiplicar por $2$.', 'Elevar al cuadrado no es multiplicar por $2$.'])
    T[2] += rep(val2, 2, 4)
    T[2] += rep(coef2, 2, 3)
    T[2] += rep(form2, 2, 3)
    T[2] += rep(trad2, 2, 7)
    T[2] += rep(signo2, 2, 3)
    # ---- nivel 3
    def val3(lv):
        a = nz(r, -5, 5); b = nz(r, -5, 5); x = r.choice([-2, -1, 2, 3]); y = r.choice([-3, -2, 2, 3])
        e = P([(a, 'x^{2}y'), (b, 'xy')]); v = a * x * x * y + b * x * y
        return inp(f'Calcula el valor de ${e}$ para $x={x}$ e $y={y}$. Escribe solo el número.', v,
                   f'Reemplazamos con paréntesis: ${a}\\cdot({x})^2\\cdot({y}) {"+" if b > 0 else "-"} {abs(b)}\\cdot({x})\\cdot({y}) = {a * x * x * y} {"+" if b * x * y >= 0 else "-"} {abs(b * x * y)} = {v}$.', lv)
    def frac3(lv):
        while True:
            x = nz(r, -6, 6); y = nz(r, -6, 6)
            if x != y and (x + y) % (x - y) == 0 and x + y != 0: break
        return inp(f'Calcula el valor de $\\dfrac{{x+y}}{{x-y}}$ para $x={x}$ e $y={y}$. Escribe solo el número.', (x + y) // (x - y),
                   f'$\\dfrac{{{x}+({y})}}{{{x}-({y})}}=\\dfrac{{{x + y}}}{{{x - y}}}={(x + y) // (x - y)}$.', lv)
    def coef3(lv):
        a = nz(r, -9, 9); b = nz(r, -9, 9); c = nz(r, -9, 9)
        m1, m2 = r.choice([('xy', 'x^{2}y'), ('ab', 'a^{2}b'), ('x^{2}y', 'xy^{2}')])
        return inp(f'En la expresión ${P([(b, m2), (a, m1), (c, "")])}$, ¿cuál es el coeficiente del término ${m1}$? Escribe solo el número.', a,
                   f'Hay que fijarse en la parte literal completa: el término con ${m1}$ es ${P([(a, m1)])}$, y su coeficiente es ${a}$.', lv)
    TRAD3 = [
        ('el producto de dos números consecutivos (el menor es $x$)', 'x(x + 1)', ['x + (x + 1)', 'x^{2} + 1', '2x + 1'],
         ['Eso es la suma de los consecutivos; se pide el producto.', 'El consecutivo de $x$ es $x+1$, y se multiplica por $x$ completo.', 'Eso es la suma de los dos consecutivos, no su producto.']),
        ('la diferencia de los cuadrados de $a$ y $b$', 'a^{2} - b^{2}', ['(a - b)^{2}', '2a - 2b', 'a^{2} - b'],
         ['Ese es el cuadrado de la diferencia; aquí se restan los cuadrados.', 'Elevar al cuadrado no es multiplicar por $2$.', 'También $b$ va al cuadrado.']),
        ('el cuadrado de la diferencia entre $a$ y $b$', '(a - b)^{2}', ['a^{2} - b^{2}', '2(a - b)', 'a - b^{2}'],
         ['Esa es la diferencia de los cuadrados; aquí se eleva la diferencia completa.', 'Elevar al cuadrado no es multiplicar por $2$.', 'Se eleva la diferencia completa, no solo $b$.']),
        ('la suma de tres números pares consecutivos (el menor es $2n$)', '2n + (2n + 2) + (2n + 4)', ['2n + (2n + 1) + (2n + 2)', '3 \\cdot 2n', '2n + 2 + 4'],
         ['Entre dos pares consecutivos hay una diferencia de $2$, no de $1$.', 'Los tres números no son iguales: cada uno es $2$ más que el anterior.', 'Faltan los $2n$ de los otros dos números.']),
        ('el promedio de $a$ y $b$, aumentado en {n}', '\\frac{a + b}{2} + {n}', ['\\frac{a + b + {n}}{2}', 'a + \\frac{b}{2} + {n}', '2(a + b) + {n}'],
         ['Así el número también se divide por $2$; se suma después de promediar.', 'El promedio divide la suma completa $a+b$ por $2$.', 'El promedio se divide por $2$, no se multiplica.']),
    ]
    def trad3(lv):
        f, ok, malas, fbs = r.choice(TRAD3); n = r.randint(2, 9)
        f2 = f.replace('{n}', str(n)); ok2 = ok.replace('{n}', str(n))
        return mc(f'¿Qué expresión representa «{f2}»?', D(ok2), [D(m.replace('{n}', str(n))) for m in malas],
                  f'Se traduce cada parte en orden: «{f2}» es ${ok2}$.', lv, r, fb=fbs)
    CTX3 = [
        ('Una entrada al cine cuesta $p$ pesos y una bebida $b$ pesos. ¿Cuánto pagan {n} personas que compran entrada y bebida cada una?', '{n}(p + b)', ['{n}p + b', 'p + {n}b', '{n} + p + b'],
         ['Cada persona compra también una bebida: las bebidas se multiplican por la cantidad de personas.', 'Cada persona compra también una entrada: las entradas se multiplican por la cantidad de personas.', 'La cantidad de personas multiplica el gasto de cada una; no se suma.']),
        ('Un rectángulo mide $x$ cm de ancho y su largo es {n} cm más que el doble del ancho. ¿Qué expresión da su perímetro?', '2x + 2(2x + {n})', ['x + (2x + {n})', 'x(2x + {n})', '2x + 2(x + {n})'],
         ['Eso es la mitad del perímetro: cada lado aparece dos veces.', 'Eso es el área, no el perímetro.', 'El largo es el **doble** del ancho más el número.']),
        ('Un plan de celular cobra {n} mil pesos fijos más $c$ mil pesos por cada GB extra. ¿Cuánto se paga con $g$ GB extra?', '{n} + cg', ['({n} + c)g', '{n}g + c', '{n}c + g'],
         ['El cargo fijo se paga una vez: no se multiplica por los GB.', 'Lo que se multiplica por los GB es el cobro por GB, no el cargo fijo.', 'Se multiplica el precio por GB por la cantidad de GB.']),
    ]
    def ctx3(lv):
        f, ok, malas, fbs = r.choice(CTX3); n = r.randint(2, 9)
        return mc(f.replace('{n}', str(n)), D(ok.replace('{n}', str(n))), [D(m.replace('{n}', str(n))) for m in malas],
                  f'La expresión correcta es ${ok.replace("{n}", str(n))}$: cada parte del enunciado corresponde a una operación.', lv, r, fb=fbs)
    T[3] += rep(val3, 3, 4)
    T[3] += rep(frac3, 3, 3)
    T[3] += rep(coef3, 3, 3)
    T[3] += rep(trad3, 3, 5)
    T[3] += rep(ctx3, 3, 5)
    return T

# =====================================================================
# s002 · Términos semejantes
# =====================================================================
def s002(r):
    T = {1: [], 2: [], 3: []}
    def red1(lv):
        v = r.choice(VAR); a, b = r.randint(2, 9), r.randint(2, 9); c = r.randint(1, 9)
        ok = a + b - c
        return mc(f'Reduce ${P([(a, v), (b, v), (-c, v)])}$.', D(P([(ok, v)])), [D(P([(a + b + c, v)])), D(P([(ok, pw(v, 3))])), D(P([(a - b - c, v)]))],
                  f'Son términos semejantes: se operan los coeficientes $({a}+{b}-{c})$ y se conserva ${v}$. Resultado ${P([(ok, v)])}$.', lv, r,
                  fb=['Revisa el signo: el último término se resta.', 'Al reducir, la parte literal no cambia: solo se operan los coeficientes.', 'Revisa los signos: solo el último término se resta.'])
    def sem1(lv):
        v = r.choice(['x', 'y', 'a']); a = r.randint(2, 9); b = nz(r, -9, 9, (a,))
        return mc(f'¿Cuál de estos términos es semejante a ${a}{pw(v, 2)}$?', D(P([(b, pw(v, 2))])),
                  [D(f'{a}{v}'), D(f'{a}{pw(v, 3)}'), D(f'{a}{pw(v, 2)}' + ('y' if v != 'y' else 'x'))],
                  'Dos términos son semejantes si tienen **la misma parte literal** (mismas letras con los mismos exponentes); el coeficiente puede ser distinto.', lv, r,
                  fb=['La letra debe tener el mismo exponente.', 'La letra debe tener el mismo exponente.', 'Tiene una letra más: la parte literal debe ser idéntica.'])
    def cof1(lv):
        v = r.choice(VAR); a, b, c = r.randint(2, 9), r.randint(2, 9), r.randint(1, 9)
        k = r.randint(1, 9)
        e = P([(a, v), (k, ''), (b, v), (-c, v)])
        return inp(f'Al reducir ${e}$, ¿cuál es el coeficiente de ${v}$? Escribe solo el número.', a + b - c,
                   f'Solo se suman los términos con ${v}$: ${a}+{b}-{c}={a + b - c}$. El ${k}$ no es semejante a ellos.', lv)
    def ev1(lv):
        a, b = r.randint(2, 7), r.randint(2, 7); c = r.randint(1, 5); x = r.randint(2, 5)
        return inp(f'Reduce ${P([(a, "x"), (c, ""), (b, "x")])}$ y calcula su valor para $x={x}$. Escribe solo el número.', (a + b) * x + c,
                   f'Reducido: ${P([(a + b, "x"), (c, "")])}$. Para $x={x}$: ${a + b}\\cdot{x}+{c}={(a + b) * x + c}$.', lv)
    for f, n in ((red1, 6), (sem1, 4), (cof1, 5), (ev1, 5)):
        T[1] += rep(f, 1, n)
    def red2(lv):
        a, c = nz(r, -7, 7), nz(r, -7, 7); b, d = nz(r, -9, 9), nz(r, -9, 9)
        if a + c == 0 or b + d == 0: raise ValueError
        ok = P([(a + c, 'x^{2}'), (b + d, 'x')])
        return mc(f'Reduce ${P([(a, "x^{2}"), (b, "x"), (c, "x^{2}"), (d, "x")])}$.', D(ok),
                  [D(P([(a + c + b + d, 'x^{3}')])), D(P([(a + b + c + d, 'x^{2}')])), D(P([(a + c, 'x^{2}'), (b - d, 'x')]))],
                  f'Se juntan por separado los términos con $x^2$ $({a}{c:+d}={a + c})$ y los con $x$ $({b}{d:+d}={b + d})$: ${ok}$. Los $x^2$ y los $x$ **no** se suman entre sí.', lv, r,
                  fb=['Los exponentes no se suman al reducir: $x^2$ y $x$ no son semejantes.', '$x^2$ y $x$ no son semejantes: no se pueden juntar en un solo término.', 'Revisa el signo de cada término con $x$.'])
    def err2(lv):
        a, b, c = r.randint(2, 6), r.randint(2, 6), r.randint(2, 6)
        ex = f'{a}x^{{2}} + {b}x + {c}x^{{2}}'
        return mc(f'Ana debe reducir ${ex}$. ¿Qué resultado es correcto?', D(f'{a + c}x^{{2}} + {b}x'),
                  [D(f'{a + b + c}x^{{2}}'), D(f'{a + b + c}x^{{5}}'), D(f'{a + c}x^{{4}} + {b}x')],
                  'Solo se suman términos semejantes ($x^2$ con $x^2$), y al sumarlos el exponente **no cambia**: se suman los coeficientes.', lv, r,
                  fb=['$x^2$ y $x$ no son semejantes: no se juntan.', 'Al reducir no se suman los exponentes.', 'Al sumar $x^2$ con $x^2$ el exponente sigue siendo $2$.'])

    def cof2(lv):
        a, c = nz(r, -7, 7), nz(r, -7, 7); b, d = nz(r, -9, 9), nz(r, -9, 9)
        if b + d == 0: raise ValueError
        e = P([(a, 'x^{2}'), (b, 'x'), (c, 'x^{2}'), (d, 'x')])
        return inp(f'Al reducir ${e}$, ¿cuál es el coeficiente de $x$? Escribe solo el número.', b + d,
                   f'Términos con $x$: ${P([(b, "x"), (d, "x")])}={P([(b + d, "x")])}$. El coeficiente es ${b + d}$.', lv)
    def ev2(lv):
        a, c = nz(r, -5, 5), nz(r, -5, 5); b, d = nz(r, -6, 6), nz(r, -6, 6); x = r.choice([-2, -1, 2, 3])
        A, B = a + c, b + d
        if A == 0: raise ValueError
        e = P([(a, 'x^{2}'), (b, 'x'), (c, 'x^{2}'), (d, 'x')])
        return inp(f'Reduce ${e}$ y calcula su valor para $x={x}$. Escribe solo el número.', A * x * x + B * x,
                   f'Reducido: ${P([(A, "x^{2}"), (B, "x")])}$. Para $x={x}$: ${A}\\cdot({x})^2{"+" if B >= 0 else "-"}{abs(B)}\\cdot({x})={A * x * x + B * x}$.', lv)
    # pregunta de entrada: primera escrita de nivel 2
    T[2] += rep(cof2, 2, 5)
    for f, n in ((red2, 6), (err2, 4), (ev2, 5)):
        T[2] += rep(f, 2, n)
    def red3(lv):
        a, b, c = nz(r, -6, 6), nz(r, -6, 6), nz(r, -6, 6); d, e = nz(r, -6, 6), nz(r, -6, 6)
        if a + d == 0 or b + e == 0: raise ValueError
        ex = P([(a, 'xy'), (b, 'x'), (c, 'y'), (d, 'xy'), (e, 'x')])
        ok = P([(a + d, 'xy'), (b + e, 'x'), (c, 'y')])
        return mc(f'Reduce ${ex}$.', D(ok), [D(P([(a + d + b + e + c, 'xy')])), D(P([(a + d, 'xy'), (b + e + c, 'x')])), D(P([(a + d, 'x^{2}y^{2}'), (b + e, 'x'), (c, 'y')]))],
                  f'Se agrupan las partes literales iguales: $xy$ con $xy$ y $x$ con $x$. El término con $y$ queda solo. Resultado: ${ok}$.', lv, r,
                  fb=['Solo se suman términos con la misma parte literal: $xy$, $x$ e $y$ son distintas.', 'El término con $y$ no es semejante a los términos con $x$.', 'Al sumar $xy$ con $xy$ la parte literal no cambia: sigue siendo $xy$.'])
    def fr3(lv):
        p, q = r.choice([(2, 4), (3, 6), (2, 3), (4, 2), (3, 2)]); a = r.randint(1, 3); b = r.randint(1, 3); c = r.randint(1, 2)
        val = F(a, p) + F(b, q) - c
        if val == 0: raise ValueError
        ex = P([(F(a, p), 'x'), (F(b, q), 'x'), (-c, 'x')])
        return inp(f'Al reducir ${ex}$, ¿cuál es el coeficiente de $x$? Escribe el número (puede ser una fracción, por ejemplo $3/4$).', f'{val.numerator}/{val.denominator}' if val.denominator != 1 else val.numerator,
                   f'Se suman las fracciones: $\\frac{{{a}}}{{{p}}}+\\frac{{{b}}}{{{q}}}-{c}={"\\frac{%d}{%d}" % (val.numerator, val.denominator) if val.denominator != 1 else val.numerator}$.', lv)
    def err3(lv):
        a, b = r.randint(2, 6), r.randint(2, 6)
        return mc(f'Una estudiante reduce ${a}x^{{2}}y + {b}xy^{{2}}$ y escribe ${a + b}x^{{2}}y^{{2}}$. ¿Qué es correcto?',
                  'No se puede reducir: $x^{2}y$ y $xy^{2}$ no son semejantes', [f'Está bien: el resultado es ${a + b}x^{{2}}y^{{2}}$', f'El resultado es ${a + b}x^{{3}}y^{{3}}$', f'El resultado es ${a + b}xy$'],
                  'En $x^2y$ el $x$ va al cuadrado; en $xy^2$, la $y$. Las partes literales son distintas, así que la expresión ya está reducida.', lv, r,
                  fb=['$x^{2}y$ y $xy^{2}$ tienen distinta parte literal: no son semejantes.', 'Al reducir no se suman exponentes; además, estos términos no son semejantes.', 'Los exponentes no desaparecen; además, estos términos no son semejantes.'])
    def per3(lv):
        a, b, c = r.randint(1, 5), r.randint(1, 5), r.randint(1, 5); k1, k2, k3 = nz(r, -4, 6), nz(r, -4, 6), nz(r, -4, 6)
        L = [P([(a, 'x'), (k1, '')]), P([(b, 'x'), (k2, '')]), P([(c, 'x'), (k3, '')])]
        return inp(f'Los lados de un triángulo miden ${L[0]}$, ${L[1]}$ y ${L[2]}$ cm. Reduce la expresión del perímetro. ¿Cuál es su término independiente? Escribe solo el número.', k1 + k2 + k3,
                   f'Perímetro: ${P([(a + b + c, "x"), (k1 + k2 + k3, "")])}$. El término independiente es ${k1 + k2 + k3}$.', lv)
    for f, n in ((red3, 6), (err3, 4), (fr3, 5), (per3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s003 · Distributiva y paréntesis
# =====================================================================
def s003(r):
    T = {1: [], 2: [], 3: []}
    def d1(lv):
        v = r.choice(VAR); k = r.randint(2, 9); a = r.randint(1, 6); b = nz(r, -9, 9)
        ok = P([(k * a, v), (k * b, '')])
        return mc(f'Desarrolla ${k}{par(lin(a, b, v))}$.', D(ok), [D(P([(k * a, v), (b, '')])), D(P([(a, v), (k * b, '')])), D(P([(k * a, v), (-k * b, '')]))],
                  f'El ${k}$ multiplica a **cada** término del paréntesis: ${k}\\cdot {P([(a, v)])}$ y ${k}\\cdot({b})$. Resultado ${ok}$.', lv, r,
                  fb=['El factor también multiplica al segundo término.', 'El factor también multiplica al primer término.', 'Revisa el signo: un factor positivo no cambia los signos.'])
    def t1(lv):
        k = r.randint(2, 9); a = r.randint(1, 6); b = nz(r, -9, 9)
        return inp(f'Al desarrollar ${k}{par(lin(a, b))}$, ¿cuál es el término independiente? Escribe solo el número, con su signo.', k * b,
                   f'${k}\\cdot({b})={k * b}$.', lv)
    def c1(lv):
        k = r.randint(2, 9); a = r.randint(1, 6); b = nz(r, -9, 9)
        return inp(f'Al desarrollar ${k}{par(lin(a, b))}$, ¿cuál es el coeficiente de $x$? Escribe solo el número.', k * a, f'${k}\\cdot {a}={k * a}$.', lv)
    for f, n in ((d1, 10), (t1, 5), (c1, 5)):
        T[1] += rep(f, 1, n)
    def r2(lv):  # entrada
        a, c = r.randint(2, 6), r.randint(2, 6); b, d = nz(r, -6, 6), nz(r, -6, 6)
        return inp(f'Desarrolla y reduce ${a}{par(lin(1, b))} - {c}{par(lin(1, d))}$. ¿Cuál es el término independiente? Escribe solo el número.', a * b - c * d,
                   f'${a}\\cdot({b})={a * b}$ y $-{c}\\cdot({d})={-c * d}$. Suman ${a * b - c * d}$.', lv)
    def d2(lv):
        v = r.choice(VAR); k = r.randint(2, 9); a = r.randint(1, 6); b = nz(r, -9, 9)
        ok = P([(-k * a, v), (-k * b, '')])
        return mc(f'Desarrolla $-{k}{par(lin(a, b, v))}$.', D(ok), [D(P([(-k * a, v), (k * b, '')])), D(P([(k * a, v), (k * b, '')])), D(P([(-k * a, v), (b, '')]))],
                  f'El $-{k}$ multiplica a cada término y **cambia los signos**: ${ok}$.', lv, r,
                  fb=['El signo menos también afecta al segundo término.', 'El factor es negativo: los signos cambian.', 'El factor también multiplica al segundo término.'])
    def m2(lv):
        a = r.randint(2, 9); b = r.randint(1, 9); c = nz(r, -9, 9)
        ok = P([(a - b, 'x'), (-c, '')])
        return mc(f'Elimina el paréntesis y reduce: ${a}x - {par(lin(b, c))}$.', D(ok), [D(P([(a - b, 'x'), (c, '')])), D(P([(a + b, 'x'), (-c, '')])), D(P([(a - b, 'x'), (-c, ''), (0, '')]) + ' + 0' if False else P([(a + b, 'x'), (c, '')]))],
                  f'El signo menos delante del paréntesis cambia **todos** los signos de adentro: ${P([(a, "x"), (-b, "x"), (-c, "")])} = {ok}$.', lv, r,
                  fb=['El signo menos también cambia el signo del término independiente.', 'El signo menos también cambia el signo del término con $x$.', 'El signo menos cambia **todos** los signos del paréntesis.'])
    def e2(lv):
        k = r.randint(2, 5); b = r.randint(2, 6); c = r.randint(1, 9)
        return mc(f'¿Cuál es el desarrollo correcto de ${c} - {k}{par(lin(1, -b))}$?', D(P([(-k, 'x'), (c + k * b, '')])),
                  [D(P([(-k, 'x'), (c - k * b, '')])), D(P([(c - k, 'x'), (-b, '')])), D(P([(k, 'x'), (c - k * b, '')]))],
                  f'$-{k}$ multiplica a $x$ y a $-{b}$: $-{k}x+{k * b}$. Luego $c$: ${c}-{k}x+{k * b}={P([(-k, "x"), (c + k * b, "")])}$.', lv, r,
                  fb=[f'$(-{k})\\cdot(-{b})$ es positivo.', f'No se puede restar ${c}-{k}$: el ${k}$ multiplica al paréntesis.', 'Revisa el signo del término con $x$.'])
    def cr2(lv):
        a, c = r.randint(2, 6), r.randint(2, 6); b, d = nz(r, -6, 6), nz(r, -6, 6)
        return inp(f'Desarrolla y reduce ${a}{par(lin(1, b))} + {c}{par(lin(2, d))}$. ¿Cuál es el coeficiente de $x$? Escribe solo el número.', a + 2 * c,
                   f'${a}x + {2 * c}x = {a + 2 * c}x$.', lv)
    T[2] += rep(r2, 2, 5)
    for f, n in ((d2, 4), (m2, 3), (e2, 3), (cr2, 5)):
        T[2] += rep(f, 2, n)
    def x3(lv):
        a = nz(r, -5, 5); b = r.randint(1, 5); c = nz(r, -9, 9)
        ok = P([(a * b, 'x^{2}'), (a * c, 'x')])
        return mc(f'Desarrolla ${P([(a, "x")])}{par(lin(b, c))}$.', D(ok), [D(P([(a * b, 'x'), (a * c, 'x')])), D(P([(a * b, 'x^{2}'), (c, '')])), D(P([(a * b, 'x^{2}'), (-a * c, 'x')]))],
                  f'${P([(a, "x")])}\\cdot {b}x={P([(a * b, "x^{2}")])}$ (se suman los exponentes) y ${P([(a, "x")])}\\cdot({c})={P([(a * c, "x")])}$.', lv, r,
                  fb=['$x\\cdot x=x^{2}$: al multiplicar potencias de igual base se suman los exponentes.', 'El factor de afuera también multiplica al segundo término.', 'Revisa el signo del segundo producto.'])
    def two3(lv):
        a, c = r.randint(2, 5), r.randint(2, 5); b, d = nz(r, -6, 6), nz(r, -6, 6)
        if a == c: raise ValueError
        ok = P([(a - c, 'x'), (a * b + c * d, '')])
        return mc(f'Desarrolla y reduce ${a}{par(lin(1, b))} - {c}{par(lin(1, -d))}$.', D(ok),
                  [D(P([(a - c, 'x'), (a * b - c * d, '')])), D(P([(a + c, 'x'), (a * b + c * d, '')])), D(P([(a - c, 'x'), (b + d, '')]))],
                  f'${P([(a, "x"), (a * b, ""), (-c, "x"), (c * d, "")])}$; se reducen: ${ok}$.', lv, r,
                  fb=[f'Revisa el signo de $-{c}$ multiplicado por el número del segundo paréntesis.', f'El $-{c}$ también cambia el signo del término con $x$.', 'Los números de los paréntesis también se multiplican por el factor de afuera.'])
    def err3(lv):
        k = r.randint(2, 6); b = r.randint(2, 6)
        return mc(f'Un estudiante escribe $x - {k}{par(lin(1, -b))} = x - {k}x - {k * b}$. ¿Dónde está el error?',
                  f'$-{k}\\cdot(-{b})$ es $+{k * b}$, no $-{k * b}$', [f'$x-{k}x$ debería ser ${P([(1 - k, "x^{2}")])}$', 'No hay error', f'Debió multiplicar solo la $x$ por $-{k}$'],
                  f'Menos por menos es más: $-{k}\\cdot(-{b})=+{k * b}$. Lo correcto es ${P([(1 - k, "x"), (k * b, "")])}$.', lv, r,
                  fb=[f'$x$ y $-{k}x$ se reducen sumando coeficientes: el exponente no cambia.', f'Revisa el signo de $-{k}\\cdot(-{b})$.', f'El $-{k}$ multiplica a **todos** los términos del paréntesis.'])
    def cx3(lv):
        a = r.randint(2, 5); b = nz(r, -6, 6); c = r.randint(1, 5); d = nz(r, -6, 6)
        return inp(f'Desarrolla y reduce $x{par(lin(a, b))} - {c}{par(poly([1, d]))}$. ¿Cuál es el coeficiente de $x^{{2}}$? Escribe solo el número.', a - c,
                   f'$x\\cdot {a}x={a}x^2$ y $-{c}\\cdot x^2=-{c}x^2$: el coeficiente es ${a - c}$.', lv)
    def pr3(lv):
        a = r.randint(2, 6); b = r.randint(1, 6); c = r.randint(1, 4); x = r.randint(3, 8)
        return inp(f'Un rectángulo mide ${lin(a, b)}$ cm de largo y ${lin(1, -c)}$ cm de ancho. Simplifica $2{par(lin(a, b))}+2{par(lin(1, -c))}$ y calcula el perímetro para $x={x}$. Escribe solo el número.', 2 * (a * x + b) + 2 * (x - c),
                   f'Perímetro: ${P([(2 * a + 2, "x"), (2 * b - 2 * c, "")])}$. Para $x={x}$: ${2 * (a * x + b) + 2 * (x - c)}$ cm.', lv)
    for f, n in ((x3, 4), (two3, 3), (err3, 3), (cx3, 5), (pr3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s004 / s005 · Cuadrado de un binomio (sg=+1 suma, sg=-1 diferencia)
# =====================================================================
def cuadrado(r, s):
    o = '+' if s > 0 else '-'
    nom = 'suma' if s > 0 else 'diferencia'
    T = {1: [], 2: [], 3: []}
    def sq(k, n, v='x'):
        return P([(k * k, pw(v, 2)), (2 * s * k * n, v), (n * n, '')])
    def a1(lv):
        v = r.choice(VAR); n = r.randint(1, 9); ok = sq(1, n, v)
        return mc(f'Desarrolla ${par(f"{v} {o} {n}")}^{{2}}$.', D(ok), [D(f'{v}^{{2}} {o} {n * n}'), D(P([(1, pw(v, 2)), (s * n, v), (n * n, '')])), D(P([(1, pw(v, 2)), (-2 * s * n, v), (n * n, '')]))],
                  f'Cuadrado del primero, {"más" if s > 0 else "menos"} el doble producto, más el cuadrado del segundo: ${ok}$.', lv, r,
                  fb=['Falta el doble producto: $(a\\pm b)^2$ no es $a^2\\pm b^2$.', 'El término del medio es el **doble** producto.', 'Revisa el signo del término del medio.'])
    def e1(lv):
        n = r.randint(2, 9)
        return mc(f'Un estudiante escribe ${par(f"x {o} {n}")}^{{2}} = x^{{2}} + {n * n}$. ¿Qué le falta?', f'El doble producto: ${o}{2 * n}x$',
                  [f'El término ${o}{n}x$', 'Nada: está correcto', f'Elevar también el signo: $x^{{2}} - {n * n}$'],
                  f'$(a{o}b)^2$ no es $a^2+b^2$: falta el doble producto $2\\cdot x\\cdot {n}={2 * n}x$. Lo correcto es ${sq(1, n)}$.', lv, r,
                  fb=[f'El término del medio es el **doble** producto: $2\\cdot x\\cdot {n}$.', 'Prueba con $x=1$: los dos lados no dan lo mismo.', 'El último término es un cuadrado y siempre es positivo; lo que falta es el término del medio.'])

    def m1(lv):
        n = r.randint(2, 9)
        return inp(f'Completa el número que falta. Escribe solo el número. ${par(f"x {o} {n}")}^{{2}}=x^{{2}} {o} \\square\\,x + {n * n}$', 2 * n,
                   f'El término del medio es el doble producto: $2\\cdot x\\cdot {n}={2 * n}x$.', lv)
    def l1(lv):
        n = r.randint(2, 12)
        return inp(f'Completa el número que falta. Escribe solo el número. ${par(f"x {o} {n}")}^{{2}}=x^{{2}} {o} {2 * n}x + \\square$', n * n,
                   f'El último término es el cuadrado del segundo: ${n}^2={n * n}$ (siempre positivo).', lv)
    for f, n in ((a1, 6), (e1, 4), (m1, 5), (l1, 5)):
        T[1] += rep(f, 1, n)
    def m2(lv):  # entrada
        k = r.randint(2, 5); n = r.randint(1, 7)
        if gcd(k, n) > 1 and r.random() < .5: raise ValueError
        return inp(f'Completa el número que falta. Escribe solo el número. ${par(f"{k}x {o} {n}")}^{{2}}={k * k}x^{{2}} {o} \\square\\,x + {n * n}$', 2 * k * n,
                   f'Doble producto: $2\\cdot {k}x\\cdot {n}={2 * k * n}x$.', lv)
    def a2(lv):
        v = r.choice(VAR); k = r.randint(2, 5); n = r.randint(1, 7); ok = sq(k, n, v)
        return mc(f'Desarrolla ${par(f"{k}{v} {o} {n}")}^{{2}}$.', D(ok), [D(P([(k * k, pw(v, 2)), (s * k * n, v), (n * n, '')])), D(P([(k, pw(v, 2)), (2 * s * k * n, v), (n * n, '')])), D(P([(k * k, pw(v, 2)), (n * n, '')]))],
                  f'El primer término es ${k}{v}$: su cuadrado es ${k * k}{pw(v, 2)}$ y el doble producto $2\\cdot {k}{v}\\cdot {n}={2 * k * n}{v}$. Resultado ${ok}$.', lv, r,
                  fb=['El término del medio es el **doble** producto.', f'El cuadrado de ${k}{v}$ es ${k * k}{pw(v, 2)}$: también se eleva el coeficiente.', 'Falta el doble producto.'])
    def e2(lv):
        k = r.randint(2, 5); n = r.randint(1, 6)
        return mc(f'Una estudiante desarrolla ${par(f"{k}x {o} {n}")}^{{2}}$ y obtiene ${P([(k, "x^{2}"), (2 * s * k * n, "x"), (n * n, "")])}$. ¿Cuál es el error?',
                  f'El cuadrado de ${k}x$ es ${k * k}x^{{2}}$, no ${k}x^{{2}}$', ['Falta el doble producto', 'El último término debería ser negativo', 'No hay error'],
                  f'$({k}x)^2={k}^2x^2={k * k}x^2$. Lo correcto es ${sq(k, n)}$.', lv, r,
                  fb=[f'El doble producto sí está: $2\\cdot {k}x\\cdot {n}$.', 'El último término es un cuadrado: siempre es positivo.', f'Revisa el primer término: el cuadrado de ${k}x$.'])
    def mn2(lv):
        b = r.choice([10, 20, 30, 40, 50, 60]); d = r.randint(1, 3); n = b + s * d
        return inp(f'Usa el cuadrado de una {nom} para calcular mentalmente ${n}^{{2}}=({b} {o} {d})^{{2}}$. Escribe solo el número.', n * n,
                   f'$({b}{o}{d})^2={b * b} {o} {2 * b * d} + {d * d}={n * n}$.', lv)
    T[2] += rep(m2, 2, 5)
    for f, n in ((a2, 6), (e2, 4), (mn2, 5)):
        T[2] += rep(f, 2, n)
    def a3(lv):
        k, m = r.randint(1, 5), r.randint(1, 5)
        if k == m == 1: raise ValueError
        v1, v2 = r.choice([('a', 'b'), ('x', 'y'), ('m', 'n')])
        ok = P([(k * k, pw(v1, 2)), (2 * s * k * m, v1 + v2), (m * m, pw(v2, 2))])
        return mc(f'Desarrolla ${par(P([(k, v1), (s * m, v2)]))}^{{2}}$.', D(ok),
                  [D(P([(k * k, pw(v1, 2)), (s * k * m, v1 + v2), (m * m, pw(v2, 2))])), D(P([(k * k, pw(v1, 2)), (2 * s * k * m, v1), (m * m, pw(v2, 2))])), D(P([(k * k, pw(v1, 2)), (m * m, pw(v2, 2))]))],
                  f'Con dos letras el doble producto lleva ambas: $2\\cdot {P([(k, v1)])}\\cdot {P([(m, v2)])}={2 * k * m}{v1}{v2}$. Resultado ${ok}$.', lv, r,
                  fb=['El término del medio es el **doble** producto.', 'El doble producto lleva las dos letras.', 'Falta el doble producto: el cuadrado de un binomio no es la suma de los cuadrados.'])
    def f3(lv):
        d = r.choice([2, 3]); n = r.randint(1, 4)
        ok = P([(F(1, d * d), 'x^{2}'), (F(2 * s * n, d), 'x'), (n * n, '')])
        return mc(f'Desarrolla ${par(f"\\frac{{x}}{{{d}}} {o} {n}")}^{{2}}$.', D(ok),
                  [D(P([(F(1, d), 'x^{2}'), (F(2 * s * n, d), 'x'), (n * n, '')])), D(P([(F(1, d * d), 'x^{2}'), (n * n, '')])), D(P([(F(1, d * d), 'x^{2}'), (F(s * n, d), 'x'), (n * n, '')]))],
                  f'$\\left(\\frac{{x}}{{{d}}}\\right)^2=\\frac{{x^2}}{{{d * d}}}$ y el doble producto es $2\\cdot\\frac{{x}}{{{d}}}\\cdot {n}$. Resultado ${ok}$.', lv, r,
                  fb=[f'También se eleva el denominador: el cuadrado de $\\frac{{x}}{{{d}}}$ es $\\frac{{x^{{2}}}}{{{d * d}}}$.', 'Falta el doble producto.', 'El término del medio es el **doble** producto.'])
    def x2_3(lv):
        n = r.randint(1, 6); ok = P([(1, 'x^{4}'), (2 * s * n, 'x^{2}'), (n * n, '')])
        return mc(f'Desarrolla ${par(f"x^{{2}} {o} {n}")}^{{2}}$.', D(ok), [D(P([(1, 'x^{4}'), (n * n, '')])), D(P([(1, 'x^{4}'), (2 * s * n, 'x'), (n * n, '')])), D(P([(1, 'x^{2}'), (2 * s * n, 'x'), (n * n, '')]))],
                  f'El primer término es $x^2$: $(x^2)^2=x^4$ y el doble producto $2\\cdot x^2\\cdot {n}={2 * n}x^2$.', lv, r,
                  fb=['Falta el doble producto.', f'El doble producto es $2\\cdot x^{{2}}\\cdot {n}$: lleva $x^{{2}}$.', '$(x^{2})^{2}=x^{4}$: al elevar una potencia se multiplican los exponentes.'])
    def mv3(lv):
        k, m = r.randint(2, 5), r.randint(2, 5)
        return inp(f'Completa el número que falta. Escribe solo el número. ${par(P([(k, "a"), (s * m, "b")]))}^{{2}}={k * k}a^{{2}} {o} \\square\\,ab + {m * m}b^{{2}}$', 2 * k * m,
                   f'Doble producto: $2\\cdot {k}a\\cdot {m}b={2 * k * m}ab$.', lv)
    def id3(lv):
        while True:
            p, q = r.randint(1, 9), r.randint(1, 9)
            if p != q: break
        if s > 0:
            return inp(f'Si $x+y={p + q}$ y $xy={p * q}$, ¿cuánto vale $x^{{2}}+y^{{2}}$? Usa $(x+y)^{{2}}=x^{{2}}+2xy+y^{{2}}$. Escribe solo el número.', p * p + q * q,
                       f'$x^2+y^2=(x+y)^2-2xy={(p + q) ** 2}-{2 * p * q}={p * p + q * q}$.', lv)
        a, b = max(p, q), min(p, q)
        return inp(f'Si $x-y={a - b}$ y $xy={a * b}$, ¿cuánto vale $x^{{2}}+y^{{2}}$? Usa $(x-y)^{{2}}=x^{{2}}-2xy+y^{{2}}$. Escribe solo el número.', a * a + b * b,
                   f'$x^2+y^2=(x-y)^2+2xy={(a - b) ** 2}+{2 * a * b}={a * a + b * b}$.', lv)
    for f, n in ((a3, 4), (f3, 3), (x2_3, 3), (mv3, 5), (id3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s006 · Suma por diferencia
# =====================================================================
def s006(r):
    T = {1: [], 2: [], 3: []}
    def a1(lv):
        v = r.choice(VAR); n = r.randint(1, 9); f = r.random() < .5
        e = par(f'{v} + {n}') + par(f'{v} - {n}') if f else par(f'{v} - {n}') + par(f'{v} + {n}')
        return mc(f'Desarrolla ${e}$.', D(f'{pw(v, 2)} - {n * n}'), [D(f'{pw(v, 2)} + {n * n}'), D(f'{pw(v, 2)} - {2 * n}'), D(P([(1, pw(v, 2)), (-2 * n, v), (-n * n, '')]))],
                  f'Los términos cruzados ${n}{v}$ y $-{n}{v}$ se cancelan: queda ${pw(v, 2)}-{n * n}$.', lv, r,
                  fb=['El producto del segundo término es negativo: $(+' + str(n) + ')\\cdot(-' + str(n) + ')$.', f'${n}^2$ es ${n * n}$, no ${2 * n}$.', 'Los términos con $' + v + '$ se cancelan.'])
    def e1(lv):
        n = r.randint(2, 9)
        return mc(f'Un estudiante escribe $(x + {n})(x - {n}) = x^{{2}} - {2 * n}x - {n * n}$. ¿Qué es correcto?', f'Los términos $-{n}x$ y $+{n}x$ se cancelan: queda $x^{{2}} - {n * n}$',
                  ['Está correcto', f'Debe ser $x^{{2}} + {n * n}$', f'Debe ser $x^{{2}} - {2 * n}x + {n * n}$'],
                  f'$(x+{n})(x-{n})=x^2-{n}x+{n}x-{n * n}=x^2-{n * n}$.', lv, r,
                  fb=[f'Los productos cruzados $-{n}x$ y $+{n}x$ se cancelan: no queda término con $x$.', f'El producto $(+{n})\\cdot(-{n})$ es negativo.', 'Ese es el cuadrado de una diferencia; aquí los binomios tienen signos distintos.'])

    def m1(lv):
        n = r.randint(2, 12)
        return inp(f'Completa el número que falta. Escribe solo el número. $(x + {n})(x - {n})=x^{{2}} - \\square$', n * n, f'El segundo cuadrado: ${n}^2={n * n}$.', lv)
    def mm1(lv):
        n = r.randint(2, 12); v = r.choice(['x', 'a', 'y'])
        return inp(f'Completa el número que falta. Escribe solo el número. $({v} + \\square)({v} - \\square)={pw(v, 2)} - {n * n}$ (el mismo número en ambos recuadros).', n,
                   f'Buscamos un número cuyo cuadrado sea ${n * n}$: es ${n}$.', lv)
    for f, n in ((a1, 6), (e1, 4), (m1, 5), (mm1, 5)):
        T[1] += rep(f, 1, n)
    def m2(lv):
        k = r.randint(2, 6); n = r.randint(1, 9)
        return inp(f'Completa el número que falta. Escribe solo el número. $({k}x + {n})({k}x - {n})=\\square\\,x^{{2}} - {n * n}$', k * k,
                   f'El primer cuadrado es $({k}x)^2={k * k}x^2$.', lv)
    def a2(lv):
        k = r.randint(2, 6); n = r.randint(1, 9); v = r.choice(VAR)
        return mc(f'Desarrolla $({k}{v} + {n})({k}{v} - {n})$.', D(f'{k * k}{pw(v, 2)} - {n * n}'), [D(f'{k}{pw(v, 2)} - {n * n}'), D(f'{k * k}{pw(v, 2)} + {n * n}'), D(f'{k * k}{pw(v, 2)} - {2 * n}')],
                  f'$({k}{v})^2-{n}^2={k * k}{pw(v, 2)}-{n * n}$.', lv, r, fb=[f'También se eleva el coeficiente: $({k}{v})^2={k * k}{pw(v, 2)}$.', 'El segundo término queda con signo menos.', f'${n}^2={n * n}$.'])
    def e2(lv):
        k = r.randint(2, 5); n = r.randint(2, 7)
        return mc(f'¿Qué producto da ${k * k}x^{{2}} - {n * n}$?', D(f'({k}x + {n})({k}x - {n})'), [D(f'({k}x - {n})^{{2}}'), D(f'({k * k}x + {n})({k * k}x - {n})'), D(f'({k}x + {n * n})({k}x - {n * n})')],
                  f'${k * k}x^2=({k}x)^2$ y ${n * n}={n}^2$: es una suma por diferencia $({k}x+{n})({k}x-{n})$.', lv, r,
                  fb=['El cuadrado de un binomio tiene término central; aquí no hay.', f'Se usa la raíz de ${k * k}x^{{2}}$, que es ${k}x$.', f'Se usa la raíz de ${n * n}$, que es ${n}$.'])
    def mn2(lv):
        b = r.choice([20, 30, 40, 50, 60, 70]); d = r.randint(1, 4)
        return inp(f'Usa la suma por diferencia para calcular mentalmente ${b + d}\\cdot {b - d}$. Escribe solo el número.', (b + d) * (b - d),
                   f'$({b}+{d})({b}-{d})={b}^2-{d}^2={b * b}-{d * d}={(b + d) * (b - d)}$.', lv)
    T[2] += rep(m2, 2, 5)
    for f, n in ((a2, 6), (e2, 4), (mn2, 5)):
        T[2] += rep(f, 2, n)
    def a3(lv):
        k, m = r.randint(1, 6), r.randint(1, 6); v1, v2 = r.choice([('a', 'b'), ('x', 'y')])
        if k == m == 1: raise ValueError
        A, B = P([(k, v1)]), P([(m, v2)])
        return mc(f'Desarrolla $({A} + {B})({A} - {B})$.', D(P([(k * k, pw(v1, 2)), (-m * m, pw(v2, 2))])),
                  [D(P([(k * k, pw(v1, 2)), (m * m, pw(v2, 2))])), D(P([(k, pw(v1, 2)), (-m, pw(v2, 2))])), D(P([(k * k, pw(v1, 2)), (-2 * k * m, v1 + v2), (-m * m, pw(v2, 2))]))],
                  f'$({A})^2-({B})^2={P([(k * k, pw(v1, 2)), (-m * m, pw(v2, 2))])}$.', lv, r,
                  fb=['El producto de los segundos términos es negativo.', 'También se elevan al cuadrado los coeficientes.', 'Los productos cruzados se cancelan: no queda término central.'])
    def x3(lv):
        n = r.randint(1, 9)
        return mc(f'Desarrolla $(x^{{2}} + {n})(x^{{2}} - {n})$.', D(f'x^{{4}} - {n * n}'), [D(f'x^{{2}} - {n * n}'), D(f'x^{{4}} + {n * n}'), D(f'x^{{4}} - {2 * n}')],
                  f'$(x^2)^2-{n}^2=x^4-{n * n}$.', lv, r,
                  fb=['$(x^{2})^{2}=x^{4}$: al elevar una potencia se multiplican los exponentes.', 'El segundo cuadrado queda restando.', f'${n}^{{2}}$ es ${n * n}$.'])
    def o3(lv):
        n = r.randint(2, 9)
        return mc(f'Desarrolla $({n} + x)({n} - x)$.', D(f'{n * n} - x^{{2}}'), [D(f'x^{{2}} - {n * n}'), D(f'{n * n} + x^{{2}}'), D(f'{n * n} - 2x - x^{{2}}')],
                  f'Primero al cuadrado menos segundo al cuadrado: ${n}^2-x^2={n * n}-x^2$. El orden importa.', lv, r,
                  fb=[f'El orden importa: el primer término es ${n}$, así que primero va ${n}^{{2}}$.', 'El cuadrado del segundo término queda restando.', 'Los productos cruzados se cancelan: no queda término con $x$.'])
    def mv3(lv):
        k, m = r.randint(2, 6), r.randint(2, 6)
        return inp(f'Completa el número que falta. Escribe solo el número. $({k}a + {m}b)({k}a - {m}b)={k * k}a^{{2}} - \\square\\,b^{{2}}$', m * m, f'$({m}b)^2={m * m}b^2$.', lv)
    def mn3(lv):
        b = r.choice([100, 200, 1000]); d = r.randint(1, 5)
        return inp(f'Calcula mentalmente ${b + d}\\cdot {b - d}$ usando la suma por diferencia. Escribe solo el número.', b * b - d * d,
                   f'${b}^2-{d}^2={b * b}-{d * d}={b * b - d * d}$.', lv)
    for f, n in ((a3, 4), (x3, 3), (o3, 3), (mv3, 5), (mn3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s007 · Binomios con término común
# =====================================================================
def s007(r):
    T = {1: [], 2: [], 3: []}
    def bt(a, b, v='x'): return P([(1, pw(v, 2)), (a + b, v), (a * b, '')])
    def A(lv, pos):
        v = r.choice(VAR)
        a = r.randint(1, 9) if pos else nz(r, -9, 9); b = r.randint(1, 9) if pos else nz(r, -9, 9, (a, -a))
        if not pos and a > 0 and b > 0: raise ValueError
        if a + b == 0: raise ValueError
        ok = bt(a, b, v)
        return mc(f'Desarrolla ${par(lin(1, a, v))}{par(lin(1, b, v))}$.', D(ok), [D(P([(1, pw(v, 2)), (a * b, '')])), D(P([(1, pw(v, 2)), (a * b, v), (a + b, '')])), D(P([(1, pw(v, 2)), (a + b, v), (-a * b, '')]) if a * b > 0 else P([(1, pw(v, 2)), (-(a + b), v), (a * b, '')]))],
                  f'Coeficiente de ${v}$: la **suma** $({a})+({b})={a + b}$. Término independiente: el **producto** $({a})({b})={a * b}$. Resultado ${ok}$.', lv, r,
                  fb=[f'Falta el término con ${v}$: la suma de las constantes.', 'Se intercambiaron: la suma va con $' + v + '$ y el producto es el término independiente.', 'Revisa los signos de la suma y del producto.'])
    def S(lv, pos):
        a = r.randint(1, 9) if pos else nz(r, -9, 9); b = r.randint(1, 9) if pos else nz(r, -9, 9)
        if not pos and a > 0 and b > 0: raise ValueError
        if a + b == 0: raise ValueError
        return inp(f'Al desarrollar ${par(lin(1, a))}{par(lin(1, b))}$, ¿cuál es el coeficiente de $x$? Escribe solo el número.', a + b, f'Es la suma de las constantes: $({a})+({b})={a + b}$.', lv)
    def Pr(lv, pos):
        a = r.randint(1, 9) if pos else nz(r, -9, 9); b = r.randint(1, 9) if pos else nz(r, -9, 9)
        if (not pos and a > 0 and b > 0) or a == b: raise ValueError
        return inp(f'Al desarrollar ${par(lin(1, a))}{par(lin(1, b))}$, ¿cuál es el término independiente? Escribe solo el número, con su signo.', a * b,
                   f'Es el producto de las constantes: $({a})\\cdot({b})={a * b}$.', lv)
    def E(lv, pos):
        a, b = r.randint(2, 9), r.randint(2, 9)
        return mc(f'Un estudiante escribe $(x + {a})(x + {b}) = x^{{2}} + {a * b}$. ¿Qué le falta?', f'El término ${a + b}x$',
                  [f'El término ${a * b}x$', 'Nada: está correcto', f'El término ${2 * a}x$' if 2 * a not in (a + b, a * b) else f'El término ${2 * b + 1}x$'],
                  f'$(x+{a})(x+{b})=x^2+{b}x+{a}x+{a * b}={bt(a, b)}$: falta el término con $x$, cuyo coeficiente es la suma ${a}+{b}$.', lv, r,
                  fb=['El coeficiente de $x$ es la **suma** de los números, no su producto.', 'Prueba con $x=1$: los dos lados no dan lo mismo.', 'El coeficiente de $x$ es la suma de los dos números.'])

    for f, n in ((lambda lv: A(lv, True), 6), (lambda lv: E(lv, True), 4), (lambda lv: S(lv, True), 5), (lambda lv: Pr(lv, True), 5)):
        T[1] += rep(f, 1, n)
    T[2] += rep(lambda lv: S(lv, False), 2, 5)  # entrada
    for f, n in ((lambda lv: A(lv, False), 10), (lambda lv: Pr(lv, False), 5)):
        T[2] += rep(f, 2, n)
    def inv3(lv):
        a = nz(r, -9, 9); b = nz(r, -9, 9)
        if a + b == 0: raise ValueError
        return inp(f'Completa el número que falta. Escribe solo el número, con su signo. ${par(lin(1, a))}{par("x + \\square")}={bt(a, b)}$', b,
                   f'El número buscado multiplicado por ${a}$ da ${a * b}$ y sumado con ${a}$ da ${a + b}$: es ${b}$.', lv)
    def x2_3(lv):
        a, b = nz(r, -7, 7), nz(r, -7, 7)
        if a + b == 0: raise ValueError
        ok = P([(1, 'x^{4}'), (a + b, 'x^{2}'), (a * b, '')])
        return mc(f'Desarrolla $(x^{{2}} {"+" if a > 0 else "-"} {abs(a)})(x^{{2}} {"+" if b > 0 else "-"} {abs(b)})$.', D(ok),
                  [D(P([(1, 'x^{4}'), (a + b, 'x'), (a * b, '')])), D(P([(1, 'x^{2}'), (a + b, 'x'), (a * b, '')])), D(P([(1, 'x^{4}'), (a * b, '')]))],
                  f'El término común es $x^2$: $(x^2)^2=x^4$, suma $({a})+({b})={a + b}$ y producto ${a * b}$.', lv, r,
                  fb=['El término del medio lleva $x^{2}$: cada número se multiplica por $x^{2}$.', '$(x^{2})^{2}=x^{4}$: al elevar una potencia se multiplican los exponentes.', 'Falta el término del medio: la suma de los números por $x^{2}$.'])
    def ar3(lv):
        a, b = r.randint(1, 8), nz(r, -6, 6)
        if a + b == 0: raise ValueError
        ok = bt(a, b)
        return mc(f'Un rectángulo mide ${lin(1, a)}$ cm por ${lin(1, b)}$ cm. ¿Qué expresión da su área?', D(ok),
                  [D(P([(2, 'x'), (a + b, '')])), D(P([(1, 'x^{2}'), (a * b, '')])), D(P([(4, 'x'), (2 * (a + b), '')]))],
                  f'Área = largo · ancho $=(x+{a})(x{b:+d})={ok}$. ($4x+{2 * (a + b)}$ sería el perímetro.)', lv, r,
                  fb=['Eso es la suma de los lados, no su producto.', 'Falta el término con $x$: al multiplicar aparecen los productos cruzados.', 'Eso es el perímetro, no el área.'])
    def ev3(lv):
        a, b = r.randint(1, 9), r.randint(1, 9); x = r.choice([10, 20, 100])
        return inp(f'Calcula $(x + {a})(x + {b})$ para $x={x}$ sin usar calculadora, desarrollando primero. Escribe solo el número.', (x + a) * (x + b),
                   f'$x^2+{a + b}x+{a * b}={x * x}+{(a + b) * x}+{a * b}={(x + a) * (x + b)}$.', lv)
    for f, n in ((inv3, 5), (x2_3, 5), (ar3, 5), (ev3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s008 · Factor común
# =====================================================================
def s008(r):
    T = {1: [], 2: [], 3: []}
    def f1(lv):
        while True:
            g = r.randint(2, 9); a = r.randint(1, 7); b = nz(r, -9, 9)
            if gcd(a, abs(b)) == 1: break
        e = lin(g * a, g * b); ok = f'{g}{par(lin(a, b))}'
        h = [d for d in range(2, g) if g % d == 0]
        mal = [f'{g}{par(lin(g * a, b))}', f'{g}{par(lin(a, -b))}', f'{h[-1]}{par(lin(g * a // h[-1], g * b // h[-1]))}' if h else f'{g}{par(lin(a, g * b))}']
        return mc(f'Factoriza ${e}$ extrayendo el **máximo** factor común.', D(ok), [D(m) for m in mal],
                  f'El máximo factor común de ${g * a}$ y ${g * b}$ es ${g}$: ${e}={ok}$. Comprueba multiplicando.', lv, r,
                  fb=[f'Dentro del paréntesis también se divide ${g * a}$ entre ${g}$.', 'Revisa el signo del segundo término.', 'Se puede extraer un factor mayor: busca el **máximo** factor común.'])
    def k1(lv):
        while True:
            g = r.randint(2, 9); a = r.randint(1, 7); b = nz(r, -9, 9)
            if gcd(a, abs(b)) == 1: break
        return inp(f'Completa el número que falta. Escribe solo el número. ${lin(g * a, g * b)}=\\square\\,{par(lin(a, b))}$', g, f'${g}\\cdot {P([(a, "x")])}={P([(g * a, "x")])}$ y ${g}\\cdot({b})={g * b}$: el factor es ${g}$.', lv)
    def mfc1(lv):
        a, b = r.randint(2, 9), r.randint(2, 9); g = r.randint(2, 7)
        while gcd(a, b) != 1: b = r.randint(2, 9)
        return inp(f'¿Cuál es el máximo factor común de ${g * a}$ y ${g * b}$? Escribe solo el número.', g, f'${g * a}={g}\\cdot{a}$ y ${g * b}={g}\\cdot{b}$; como ${a}$ y ${b}$ no tienen factores comunes, el máximo es ${g}$.', lv)
    for f, n in ((f1, 10), (k1, 5), (mfc1, 5)):
        T[1] += rep(f, 1, n)
    def k2(lv):  # entrada
        while True:
            g = r.randint(2, 6); a = r.randint(1, 5); b = nz(r, -9, 9)
            if gcd(a, abs(b)) == 1: break
        return inp(f'Completa el número que falta. Escribe solo el número, con su signo. ${P([(g * a, "x^{2}"), (g * b, "x")])}={g}x{par(f"{a}x + \\square" if a != 1 else "x + \\square")}$', b,
                   f'${g}x\\cdot\\square={g * b}x$, así que $\\square={b}$.', lv)
    def f2(lv):
        while True:
            g = r.randint(2, 6); a = r.randint(1, 5); b = nz(r, -9, 9)
            if gcd(a, abs(b)) == 1: break
        e = P([(g * a, 'x^{2}'), (g * b, 'x')]); ok = f'{g}x{par(lin(a, b))}'
        return mc(f'Factoriza completamente ${e}$.', D(ok), [D(f'{g}{par(P([(a, "x^{2}"), (b, "x")]))}'), D(f'x{par(lin(g * a, g * b))}'), D(f'{g}x{par(lin(a, b, "x^{2}"))}' if False else f'{g}x^{{2}}{par(lin(a, b, ""))}' if False else f'{g}x{par(lin(a, -b))}')],
                  f'Se extrae el número ${g}$ **y** la letra $x$ (con su menor exponente): ${ok}$.', lv, r,
                  fb=['Todavía queda $x$ como factor común dentro del paréntesis.', f'También se puede extraer ${g}$.', 'Revisa el signo dentro del paréntesis.'])
    def t2(lv):
        while True:
            g = r.randint(2, 6); a, b, c = r.randint(1, 5), nz(r, -7, 7), nz(r, -7, 7)
            if gcd(gcd(a, abs(b)), abs(c)) == 1: break
        e = poly([g * a, g * b, g * c]); ok = f'{g}{par(poly([a, b, c]))}'
        return mc(f'Factoriza ${e}$.', D(ok), [D(f'{g}{par(poly([a, b, g * c]))}'), D(f'{g}x{par(poly([a, b, c]))}'), D(f'{g}{par(poly([a, -b, c]))}')],
                  f'Los tres coeficientes son múltiplos de ${g}$; el término ${g * c}$ no tiene $x$, así que no se extrae $x$. Resultado ${ok}$.', lv, r,
                  fb=[f'El término independiente también se divide por ${g}$.', 'El término independiente no tiene $x$: no se puede extraer $x$.', 'Revisa el signo del término con $x$.'])
    T[2] += rep(k2, 2, 5)
    for f, n in ((f2, 6), (t2, 4)):
        T[2] += rep(f, 2, n)
    def m2(lv):
        while True:
            g = r.randint(2, 6); a = r.randint(1, 5); b = nz(r, -9, 9)
            if gcd(a, abs(b)) == 1: break
        return inp(f'Al factorizar completamente ${P([(g * a, "x^{2}"), (g * b, "x")])}$ como $k\\,x(\\ldots)$, ¿cuánto vale $k$? Escribe solo el número.', g, f'El máximo factor común de ${g * a}$ y ${g * b}$ es ${g}$.', lv)
    T[2] += rep(m2, 2, 5)
    def v3(lv):
        while True:
            g = r.randint(2, 6); a, b = r.randint(1, 5), r.randint(1, 5)
            if gcd(a, b) == 1: break
        e = P([(g * a, 'x^{2}y'), (-g * b, 'xy^{2}')]); ok = f'{g}xy{par(P([(a, "x"), (-b, "y")]))}'
        return mc(f'Factoriza completamente ${e}$.', D(ok), [D(f'{g}x{par(P([(a, "xy"), (-b, "y^{2}")]))}'), D(f'xy{par(P([(g * a, "x"), (-g * b, "y")]))}'), D(f'{g}xy{par(P([(a, "x"), (b, "y")]))}')],
                  f'Factor común: ${g}$, una $x$ y una $y$. Resultado ${ok}$.', lv, r,
                  fb=['Todavía queda $y$ como factor común.', f'También se puede extraer ${g}$.', 'Revisa el signo dentro del paréntesis.'])
    def b3(lv):
        k = r.randint(2, 9); v1, v2 = r.choice([('a', 'b'), ('m', 'n')])
        e = f'x{par(f"{v1} + {v2}")} + {k}{par(f"{v1} + {v2}")}'
        return mc(f'Factoriza ${e}$.', D(f'{par(f"{v1} + {v2}")}{par(f"x + {k}")}'), [D(f'{k}x{par(f"{v1} + {v2}")}'), D(f'{par(f"{v1} + {v2}")}^{{2}}{par(f"x + {k}")}'), D(f'x{par(f"{v1} + {v2} + {k}")}')],
                  f'El factor común es el binomio $({v1}+{v2})$: $({v1}+{v2})(x+{k})$.', lv, r,
                  fb=['Los dos términos se suman: el binomio común se extrae y queda $x$ más el número.', 'El binomio común se extrae una sola vez: no se eleva al cuadrado.', 'El factor común es el binomio completo, no $x$.'])
    def n3(lv):
        g = r.randint(2, 6); a, b = r.randint(1, 5), r.randint(1, 5)
        e = P([(-g * a, 'x^{2}'), (-g * b, 'x')])
        return mc(f'Factoriza ${e}$ extrayendo un factor negativo.', D(f'-{g}x{par(lin(a, b))}'), [D(f'-{g}x{par(lin(a, -b))}'), D(f'{g}x{par(lin(-a, b))}'), D(f'-{g}{par(P([(a, "x^{2}"), (b, "x")]))}')],
                  f'Al extraer $-{g}x$, cada término cambia de signo dentro del paréntesis: $-{g}x({lin(a, b)})$.', lv, r,
                  fb=['Al extraer un factor negativo, **todos** los signos cambian.', 'Así no se extrae un factor negativo: revisa el signo de cada término.', 'También se puede extraer $x$.'])
    def mn3(lv):
        k = r.randint(11, 39); a = r.randint(11, 89); b = 100 - a
        return inp(f'Usa el factor común para calcular mentalmente ${k}\\cdot {a}+{k}\\cdot {b}$. Escribe solo el número.', k * 100,
                   f'${k}\\cdot {a}+{k}\\cdot {b}={k}({a}+{b})={k}\\cdot 100={k * 100}$.', lv)
    def ev3(lv):
        a = r.randint(2, 6); x = r.choice([10, 20, 50, 100])
        return inp(f'Factoriza $x^{{2}} + {a}x$ y úsalo para calcular su valor en $x={x}$. Escribe solo el número.', x * (x + a), f'$x(x+{a})={x}\\cdot {x + a}={x * (x + a)}$.', lv)
    for f, n in ((v3, 4), (b3, 3), (n3, 3), (mn3, 5), (ev3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s009 · Agrupación de términos
# =====================================================================
def s009(r):
    T = {1: [], 2: [], 3: []}
    def base(pos):
        a = r.randint(1, 9) if pos else nz(r, -9, 9); b = r.randint(1, 9) if pos else nz(r, -9, 9, (a,))
        if not pos and a > 0 and b > 0: raise ValueError
        if a == b: raise ValueError
        e = P([(1, 'x^{2}'), (a, 'x'), (b, 'x'), (a * b, '')]); return a, b, e
    def A(lv, pos):
        a, b, e = base(pos); ok = f'{par(lin(1, a))}{par(lin(1, b))}'
        return mc(f'Factoriza por agrupación ${e}$.', D(ok), [D(f'{par(lin(1, a))}{par(lin(1, -b))}'), D(f'{par(lin(1, a + b))}{par(lin(1, a * b))}' if a * b not in (a, b) else f'x{par(lin(1, a))}'), D(f'{par(lin(1, -a))}{par(lin(1, -b))}')],
                  f'${P([(1, "x^{2}"), (a, "x")])}=x{par(lin(1, a))}$ y ${P([(b, "x"), (a * b, "")])}={b}{par(lin(1, a))}$. El binomio común es $({lin(1, a)})$: ${ok}$.', lv, r,
                  fb=['Revisa el signo del número que se extrae del segundo grupo.', 'Agrupa los dos primeros y los dos últimos términos, y extrae el factor común de cada grupo.', 'Revisa los signos: multiplica para comprobar.'])
    def Sset(lv, pos):
        a, b, e = base(pos)
        return inp(f'${e}=(x+p)(x+q)$. Escribe los números $p$ y $q$, separados por punto y coma.', f'{a}; {b}',
                   f'Agrupando: $x(x{a:+d}){b:+d}(x{a:+d})=(x{a:+d})(x{b:+d})$. Entonces $p={a}$ y $q={b}$.', lv, kind='set')
    def paso(lv, pos):
        a, b, e = base(pos)
        return mc(f'Para factorizar ${e}$ por agrupación, ¿cuál es un buen primer paso?', D(f'x{par(lin(1, a))} {"+" if b > 0 else "-"} {abs(b)}{par(lin(1, a))}'),
                  [D(f'x^{{2}}{par(lin(1, a))} + {par(lin(b, a * b))}'), D(f'{par(lin(1, a + b))}{par(lin(1, a * b))}'), D(f'x{par(lin(1, a + b))}' + P([(1, ''), (a * b, '')])[1:])],
                  'Se agrupan los dos primeros y los dos últimos, y en cada grupo se extrae el factor común. Debe quedar el mismo binomio en ambos.', lv, r,
                  fb=['$x^{2}(x+\\ldots)$ daría $x^{3}$: en el primer grupo se extrae solo $x$.', 'Eso no sale de agrupar: multiplica para comprobar que no da la expresión.', 'Se agrupan los dos primeros y los dos últimos términos, en ese orden.'])
    def miss(lv, pos):
        a, b, e = base(pos)
        return inp(f'Completa el número que falta. Escribe solo el número, con su signo. ${e}=(x {"+" if a > 0 else "-"} {abs(a)})(x + \\square)$', b,
                   f'Del segundo grupo: ${P([(b, "x"), (a * b, "")])}={b}(x{a:+d})$. El número es ${b}$.', lv)
    for f, n in ((lambda lv: A(lv, True), 6), (lambda lv: paso(lv, True), 4), (lambda lv: Sset(lv, True), 5), (lambda lv: miss(lv, True), 5)):
        T[1] += rep(f, 1, n)
    T[2] += rep(lambda lv: miss(lv, False), 2, 5)  # entrada
    for f, n in ((lambda lv: A(lv, False), 6), (lambda lv: paso(lv, False), 4), (lambda lv: Sset(lv, False), 5)):
        T[2] += rep(f, 2, n)
    def two3(lv):
        a, c = r.randint(1, 5), r.randint(1, 5); b, d = nz(r, -7, 7), nz(r, -7, 7)
        # (a x + d)(y + b) = a xy + ab x + d y + bd ... usamos (y + b)(a x + d)
        e = P([(a, 'xy'), (a * b, 'x'), (d, 'y'), (b * d, '')]); ok = f'{par(lin(1, b, "y"))}{par(lin(a, d))}'
        return mc(f'Factoriza por agrupación ${e}$.', D(ok), [D(f'{par(lin(1, b, "y"))}{par(lin(a, -d))}'), D(f'{par(lin(1, -b, "y"))}{par(lin(a, d))}'), D(f'{par(lin(1, d, "y"))}{par(lin(a, b))}')],
                  f'${P([(a, "xy"), (a * b, "x")])}={P([(a, "x")])}{par(lin(1, b, "y"))}$ y ${P([(d, "y"), (b * d, "")])}={d}{par(lin(1, b, "y"))}$. Resultado ${ok}$.', lv, r,
                  fb=['Revisa el signo del segundo factor.', 'Revisa el signo del primer factor.', 'Se intercambiaron los números: multiplica para comprobar.'])
    def neg3(lv):
        a = r.randint(2, 5); b = r.randint(2, 7)
        e = f'{a}x - {a * b} - xy + {b}y'
        return mc(f'Al factorizar ${e}$ por agrupación, ¿qué resultado es correcto?', D(f'{par(f"x - {b}")}{par(f"{a} - y")}'),
                  [D(f'{par(f"x - {b}")}{par(f"{a} + y")}'), D(f'{par(f"x + {b}")}{par(f"{a} - y")}'), D(f'{par(f"x - {b}")}{par(f"y - {a}")}')],
                  f'${a}x-{a * b}={a}(x-{b})$ y $-xy+{b}y=-y(x-{b})$: al sacar $-y$ cambia el signo de adentro. Resultado $(x-{b})({a}-y)$.', lv, r,
                  fb=[f'Al extraer $-y$ del segundo grupo, el signo cambia: queda $({a}-y)$.', f'Revisa el binomio común: ${a}x-{a * b}={a}(x-{b})$.', 'Multiplica para comprobar: ese producto tiene el signo contrario.'])
    def mv3(lv):
        a, c = r.randint(2, 5), r.randint(2, 5); b = nz(r, -7, 7)
        e = P([(a, 'xy'), (a * b, 'x'), (c, 'y'), (b * c, '')])
        return inp(f'Completa el número que falta. Escribe solo el número, con su signo. ${e}=(y {"+" if b > 0 else "-"} {abs(b)})({a}x + \\square)$', c,
                   f'${P([(c, "y"), (b * c, "")])}={c}(y{b:+d})$: el número es ${c}$.', lv)
    def ev3(lv):
        a, b = r.randint(1, 6), r.randint(1, 6); x = r.randint(3, 9)
        e = P([(1, 'x^{2}'), (a, 'x'), (b, 'x'), (a * b, '')])
        return inp(f'Factoriza ${e}$ por agrupación y calcula su valor para $x={x}$. Escribe solo el número.', (x + a) * (x + b),
                   f'$(x+{a})(x+{b})$; para $x={x}$: ${x + a}\\cdot {x + b}={(x + a) * (x + b)}$.', lv)
    for f, n in ((two3, 6), (neg3, 4), (mv3, 5), (ev3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s010 · Diferencia de cuadrados
# =====================================================================
def s010(r):
    T = {1: [], 2: [], 3: []}
    def a1(lv):
        v = r.choice(VAR); n = r.randint(1, 12); ok = f'{par(f"{v} - {n}")}{par(f"{v} + {n}")}'
        return mc(f'Factoriza ${pw(v, 2)} - {n * n}$.', D(ok), [D(f'{par(f"{v} - {n}")}^{{2}}'), D(f'{par(f"{v} - {n * n}")}{par(f"{v} + 1")}' if n > 1 else f'{par(f"{v} + 1")}^{{2}}'), D(f'{par(f"{v} + {n}")}^{{2}}')],
                  f'${pw(v, 2)}-{n * n}={pw(v, 2)}-{n}^2=({v}-{n})({v}+{n})$.', lv, r,
                  fb=[f'$({v}-{n})^2$ tiene término central: no es igual.', 'Busca la raíz cuadrada de cada término.', f'$({v}+{n})^2$ tiene término central y suma: no es igual.'])
    def q1(lv):
        n = r.randint(2, 9)
        return mc(f'¿Cuál de estas expresiones es igual a $(x - {n})(x + {n})$?', D(f'x^{{2}} - {n * n}'), [D(f'x^{{2}} + {n * n}'), D(f'x^{{2}} - {2 * n}x + {n * n}'), D(f'x^{{2}} - {2 * n}')],
                  f'Es una diferencia de cuadrados: $x^2-{n}^2=x^2-{n * n}$.', lv, r,
                  fb=[f'El producto de $-{n}$ por $+{n}$ es negativo.', 'Ese es el cuadrado de una diferencia; aquí los productos cruzados se cancelan.', f'${n}^{{2}}$ es ${n * n}$, no ${2 * n}$.'])

    def m1(lv):
        v = r.choice(VAR); n = r.randint(2, 12)
        return inp(f'Completa el número que falta. Escribe solo el número. ${pw(v, 2)} - {n * n}=({v} - \\square)({v} + \\square)$ (el mismo número en ambos recuadros).', n,
                   f'${n}^2={n * n}$: el número es ${n}$.', lv)
    for f, n in ((a1, 6), (q1, 4), (m1, 10)):
        T[1] += rep(f, 1, n)
    def m2(lv):  # entrada
        k = r.randint(2, 6); n = r.randint(1, 9)
        if gcd(k, n) > 1: raise ValueError
        return inp(f'Completa el número que falta. Escribe solo el número. ${k * k}x^{{2}} - {n * n}=(\\square\\,x - {n})(\\square\\,x + {n})$ (el mismo número en ambos recuadros).', k,
                   f'${k * k}x^2=({k}x)^2$: el número es ${k}$.', lv)
    def a2(lv):
        k = r.randint(2, 6); n = r.randint(1, 9); v = r.choice(VAR)
        if gcd(k, n) > 1: raise ValueError
        ok = f'{par(f"{k}{v} - {n}")}{par(f"{k}{v} + {n}")}'
        return mc(f'Factoriza ${k * k}{pw(v, 2)} - {n * n}$.', D(ok), [D(f'{par(f"{k * k}{v} - {n}")}{par(f"{k * k}{v} + {n}")}'), D(f'{par(f"{k}{v} - {n}")}^{{2}}'), D(f'{par(f"{k}{v} - {n * n}")}{par(f"{k}{v} + {n * n}")}')],
                  f'${k * k}{pw(v, 2)}=({k}{v})^2$ y ${n * n}={n}^2$: ${ok}$.', lv, r,
                  fb=[f'Se usa la raíz de ${k * k}{pw(v, 2)}$, que es ${k}{v}$.', 'El cuadrado de un binomio tiene término central; aquí no hay.', f'Se usa la raíz de ${n * n}$, que es ${n}$.'])
    def nf2(lv):
        k = r.randint(1, 4); n = r.randint(2, 9)
        ex = f'{k * k if k > 1 else ""}x^{{2}} + {n * n}'
        return mc(f'¿Cómo se factoriza ${ex}$?', 'No se puede factorizar como diferencia de cuadrados: es una suma', [D(f'{par(f"{k if k > 1 else ""}x + {n}")}{par(f"{k if k > 1 else ""}x - {n}")}'), D(f'{par(f"{k if k > 1 else ""}x + {n}")}^{{2}}'), D(f'{par(f"{k if k > 1 else ""}x - {n}")}^{{2}}')],
                  f'Al multiplicar $({k if k > 1 else ""}x+{n})({k if k > 1 else ""}x-{n})$ se obtiene una **resta**. Una suma de cuadrados no se factoriza en los reales.', lv, r,
                  fb=['Ese producto da una **resta** de cuadrados; aquí hay una suma.', 'Ese cuadrado tiene término central; aquí no hay.', 'Ese cuadrado tiene término central; aquí no hay.'])
    def mn2(lv):
        b = r.randint(20, 80); d = r.randint(1, 5)
        return inp(f'Calcula mentalmente ${b + d}^{{2}} - {b - d}^{{2}}$ usando la diferencia de cuadrados. Escribe solo el número.', (b + d) ** 2 - (b - d) ** 2,
                   f'$({b + d}-{b - d})({b + d}+{b - d})={2 * d}\\cdot {2 * b}={4 * b * d}$.', lv)
    T[2] += rep(m2, 2, 5)
    for f, n in ((a2, 6), (nf2, 4), (mn2, 5)):
        T[2] += rep(f, 2, n)
    def fc3(lv):
        g = r.randint(2, 7); n = r.randint(2, 9)
        ok = f'{g}{par(f"x - {n}")}{par(f"x + {n}")}'
        return mc(f'Factoriza completamente ${g}x^{{2}} - {g * n * n}$.', D(ok), [D(f'{g}{par(f"x^{{2}} - {n * n}")}'), D(f'{par(f"{g}x - {n}")}{par(f"{g}x + {n}")}'), D(f'{g}{par(f"x - {n}")}^{{2}}')],
                  f'Primero el factor común ${g}$: ${g}(x^2-{n * n})$. Luego la diferencia de cuadrados: ${ok}$.', lv, r,
                  fb=['Falta factorizar la diferencia de cuadrados del paréntesis.', 'Primero hay que extraer el factor común.', 'Es una diferencia de cuadrados, no un cuadrado de binomio.'])
    def x4(lv):
        n = r.randint(1, 4)
        ok = f'{par(f"x^{{2}} + {n * n}")}{par(f"x - {n}")}{par(f"x + {n}")}'
        return mc(f'Factoriza completamente $x^{{4}} - {n ** 4}$.', D(ok), [D(f'{par(f"x^{{2}} - {n * n}")}{par(f"x^{{2}} + {n * n}")}'), D(f'{par(f"x - {n}")}^{{2}}{par(f"x + {n}")}^{{2}}'), D(f'{par(f"x^{{2}} - {n * n}")}^{{2}}')],
                  f'$x^4-{n ** 4}=(x^2-{n * n})(x^2+{n * n})$ y $x^2-{n * n}$ se vuelve a factorizar. $x^2+{n * n}$ no se factoriza.', lv, r,
                  fb=[f'Falta factorizar $x^{{2}}-{n * n}$: también es una diferencia de cuadrados.', 'Ese producto tiene término central; multiplica para comprobar.', 'Eso es el cuadrado de un binomio, no una diferencia de cuadrados.'])
    def two3(lv):
        k, m = r.randint(1, 6), r.randint(2, 6)
        if gcd(k, m) > 1: raise ValueError
        A, B = P([(k, 'a')]), P([(m, 'b')])
        return mc(f'Factoriza ${P([(k * k, "a^{2}"), (-m * m, "b^{2}")])}$.', D(f'{par(f"{A} - {B}")}{par(f"{A} + {B}")}'), [D(f'{par(f"{A} - {B}")}^{{2}}'), D(f'{par(P([(k * k, "a"), (-m * m, "b")]))}{par("a + b")}'), D(f'{par(f"{A} - {B}")}{par(f"{A} - {B}")}')],
                  f'$({A})^2-({B})^2=({A}-{B})({A}+{B})$.', lv, r,
                  fb=['El cuadrado de un binomio tiene término central; aquí no hay.', 'Se usan las raíces de cada término.', 'Los dos factores deben tener signos distintos.'])
    def m3(lv):
        g = r.randint(2, 7); n = r.randint(2, 9)
        return inp(f'Completa el número que falta. Escribe solo el número. ${g}x^{{2}} - {g * n * n}={g}(x - \\square)(x + \\square)$ (el mismo número en ambos recuadros).', n,
                   f'${g}x^2-{g * n * n}={g}(x^2-{n * n})={g}(x-{n})(x+{n})$.', lv)
    def an3(lv):
        R = r.randint(8, 20); rr = r.randint(2, R - 2)
        return inp(f'El área de un anillo de radios $R$ y $r$ es $\\pi R^{{2}}-\\pi r^{{2}}=\\pi(R-r)(R+r)$. Para $R={R}$ cm y $r={rr}$ cm, el área es $k\\pi$ cm². ¿Cuánto vale $k$? Escribe solo el número.', (R - rr) * (R + rr),
                   f'$k=({R}-{rr})({R}+{rr})={R - rr}\\cdot {R + rr}={(R - rr) * (R + rr)}$.', lv)
    for f, n in ((fc3, 4), (x4, 3), (two3, 3), (m3, 5), (an3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s011 · Trinomio cuadrado perfecto
# =====================================================================
def s011(r):
    T = {1: [], 2: [], 3: []}
    def tcp(k, n, v='x'): return P([(k * k, pw(v, 2)), (2 * k * n, v), (n * n, '')])
    def a1(lv):
        v = r.choice(VAR); n = nz(r, -9, 9); ok = f'{par(lin(1, n, v))}^{{2}}'
        return mc(f'Factoriza ${tcp(1, n, v)}$.', D(ok), [D(f'{par(lin(1, -n, v))}^{{2}}'), D(f'{par(lin(1, n, v))}{par(lin(1, -n, v))}'), D(f'{par(lin(1, 2 * n, v))}^{{2}}')],
                  f'Raíces de los extremos: ${v}$ y ${abs(n)}$; doble producto $2\\cdot {v}\\cdot {abs(n)}={2 * abs(n)}{v}$ con el signo del término central. Resultado ${ok}$.', lv, r,
                  fb=['El signo del binomio es el signo del término central.', 'Eso da una diferencia de cuadrados, sin término central.', f'Dentro del binomio va la raíz de ${n * n}$, que es ${abs(n)}$.'])
    def yn1(lv):
        n = r.randint(2, 9); good = r.random() < .5; mid = 2 * n if good else r.choice([n, n + 1, 2 * n + 2])
        ok = 'Sí' if good else 'No'
        return mc(f'¿Es $x^{{2}} + {mid}x + {n * n}$ un trinomio cuadrado perfecto?', f'{ok}: el doble producto de $x$ y ${n}$ es ${2 * n}x$' + ('' if good else f', no ${mid}x$'),
                  [f'{"No" if good else "Sí"}: los extremos son cuadrados perfectos', f'{"No" if good else "Sí"}: el término central es ${mid}x$', 'No se puede saber sin factorizar'],
                  f'Los extremos son $x^2$ y ${n}^2$; para ser cuadrado perfecto el término central debe ser $2\\cdot x\\cdot {n}={2 * n}x$.', lv, r,
                  fb=['Que los extremos sean cuadrados no basta: el término central debe ser el doble producto.', f'Compara ${mid}x$ con el doble producto $2\\cdot x\\cdot {n}$.', 'Sí se puede: basta comparar el término central con el doble producto.'])
    def m1(lv):
        n = r.randint(2, 12)
        return inp(f'Completa el número que falta. Escribe solo el número. $x^{{2}} + {2 * n}x + {n * n}=(x + \\square)^{{2}}$', n, f'$\\sqrt{{{n * n}}}={n}$ y $2\\cdot x\\cdot {n}={2 * n}x$.', lv)
    def c1(lv):
        n = r.randint(2, 12)
        return inp(f'¿Qué número debe ir en el recuadro para que $x^{{2}} + \\square\\,x + {n * n}$ sea un trinomio cuadrado perfecto (con término central positivo)? Escribe solo el número.', 2 * n,
                   f'El término central es el doble producto: $2\\cdot {n}={2 * n}$.', lv)
    for f, n in ((a1, 6), (yn1, 4), (m1, 5), (c1, 5)):
        T[1] += rep(f, 1, n)
    def m2(lv):  # entrada
        k = r.randint(2, 5); n = r.randint(1, 7)
        if gcd(k, n) > 1: raise ValueError
        return inp(f'Completa el número que falta. Escribe solo el número. ${tcp(k, n)}=({k}x + \\square)^{{2}}$', n,
                   f'$\\sqrt{{{n * n}}}={n}$ y se comprueba el doble producto: $2\\cdot {k}x\\cdot {n}={2 * k * n}x$.', lv)
    def a2(lv):
        k = r.randint(2, 5); n = nz(r, -7, 7); v = r.choice(VAR)
        if gcd(k, abs(n)) > 1: raise ValueError
        ok = f'{par(lin(k, n, v))}^{{2}}'
        return mc(f'Factoriza ${tcp(k, n, v)}$.', D(ok), [D(f'{par(lin(k * k, n, v))}^{{2}}'), D(f'{par(lin(k, -n, v))}^{{2}}'), D(f'{par(lin(k, n, v))}{par(lin(k, -n, v))}')],
                  f'${k * k}{pw(v, 2)}=({k}{v})^2$, ${n * n}={abs(n)}^2$ y el término central es $2\\cdot {k}{v}\\cdot {abs(n)}={2 * k * abs(n)}{v}$. Resultado ${ok}$.', lv, r,
                  fb=[f'Se usa la raíz de ${k * k}{pw(v, 2)}$, que es ${k}{v}$.', 'El signo del binomio es el signo del término central.', 'Eso da una diferencia de cuadrados, sin término central.'])
    def yn2(lv):
        k = r.randint(2, 5); n = r.randint(1, 7); good = r.random() < .5; mid = 2 * k * n if good else k * n
        return mc(f'¿Es ${k * k}x^{{2}} + {mid}x + {n * n}$ un trinomio cuadrado perfecto?', ('Sí' if good else 'No') + f': el doble producto de ${k}x$ y ${n}$ es ${2 * k * n}x$',
                  [('No' if good else 'Sí') + ': los extremos son cuadrados perfectos', ('No' if good else 'Sí') + f': ${mid}$ es par', 'Solo si $x$ es positivo'],
                  f'Hay que comprobar el término central: $2\\cdot {k}x\\cdot {n}={2 * k * n}x$.', lv, r,
                  fb=['Que los extremos sean cuadrados no basta: hay que comprobar el término central.', 'Que el coeficiente sea par no basta: debe ser el doble producto.', 'La forma del trinomio no depende del valor de $x$.'])
    def c2(lv):
        k = r.randint(2, 5); n = r.randint(1, 7)
        return inp(f'¿Qué número debe ir en el recuadro para que ${k * k}x^{{2}} + \\square\\,x + {n * n}$ sea un trinomio cuadrado perfecto (con término central positivo)? Escribe solo el número.', 2 * k * n,
                   f'$2\\cdot {k}x\\cdot {n}={2 * k * n}x$.', lv)
    T[2] += rep(m2, 2, 5)
    for f, n in ((a2, 6), (yn2, 4), (c2, 5)):
        T[2] += rep(f, 2, n)
    def fc3(lv):
        g = r.randint(2, 5); n = nz(r, -6, 6); ok = f'{g}{par(lin(1, n))}^{{2}}'
        return mc(f'Factoriza completamente ${P([(g, "x^{2}"), (2 * g * n, "x"), (g * n * n, "")])}$.', D(ok), [D(f'{g}{par(P([(1, "x^{2}"), (2 * n, "x"), (n * n, "")]))}'), D(f'{par(lin(g, n))}^{{2}}'), D(f'{g}{par(lin(1, n))}{par(lin(1, -n))}')],
                  f'Primero el factor común ${g}$; lo que queda es un trinomio cuadrado perfecto: ${ok}$.', lv, r,
                  fb=['Falta factorizar el trinomio del paréntesis: es un cuadrado perfecto.', 'Primero hay que extraer el factor común; multiplica para comprobar.', 'Eso da una diferencia de cuadrados, sin término central.'])
    def two3(lv):
        k, m = r.randint(1, 5), r.randint(1, 5); s = sg(r)
        if gcd(k, m) > 1 or k == m == 1: raise ValueError
        ok = f'{par(P([(k, "a"), (s * m, "b")]))}^{{2}}'
        return mc(f'Factoriza ${P([(k * k, "a^{2}"), (2 * s * k * m, "ab"), (m * m, "b^{2}")])}$.', D(ok), [D(f'{par(P([(k, "a"), (-s * m, "b")]))}^{{2}}'), D(f'{par(P([(k * k, "a"), (s * m * m, "b")]))}^{{2}}'), D(f'{par(P([(k, "a"), (m, "b")]))}{par(P([(k, "a"), (-m, "b")]))}')],
                  f'Raíces: ${P([(k, "a")])}$ y ${P([(m, "b")])}$; el término central confirma el doble producto. Resultado ${ok}$.', lv, r,
                  fb=['El signo del binomio es el signo del término central.', 'Se usan las raíces de los extremos, no los coeficientes completos.', 'Eso da una diferencia de cuadrados, sin término central.'])
    def yn3(lv):
        n = r.randint(3, 9)
        return mc(f'Un estudiante factoriza $x^{{2}} + {n}x + {n * n}$ como $(x + {n})^{{2}}$. ¿Qué es correcto?', f'Está mal: $(x + {n})^{{2}}$ tiene término central ${2 * n}x$',
                  ['Está bien', f'Está mal: debería ser $(x - {n})^{{2}}$', f'Está mal: debería ser $(x + {n})(x - {n})$'],
                  f'$(x+{n})^2=x^2+{2 * n}x+{n * n}$. Como el término central es ${n}x$, no es un trinomio cuadrado perfecto.', lv, r,
                  fb=[f'Multiplica para comprobar: $(x+{n})^{{2}}$ tiene término central ${2 * n}x$.', 'El término central es positivo; además, no es el doble producto.', f'Ese producto da $x^{{2}}-{n * n}$, sin término central.'])
    def m3(lv):
        g = r.randint(2, 5); n = r.randint(1, 7)
        return inp(f'Completa el número que falta. Escribe solo el número. ${P([(g, "x^{2}"), (2 * g * n, "x"), (g * n * n, "")])}=\\square\\,(x + {n})^{{2}}$', g,
                   f'Factor común ${g}$: ${g}(x^2+{2 * n}x+{n * n})={g}(x+{n})^2$.', lv)
    def ev3(lv):
        n = r.randint(1, 9); x = r.choice([10, 20, 30, 50, 100]) - n
        return inp(f'Calcula $x^{{2}} + {2 * n}x + {n * n}$ para $x={x}$, factorizando primero. Escribe solo el número.', (x + n) ** 2,
                   f'$(x+{n})^2=({x}+{n})^2={x + n}^2={(x + n) ** 2}$.', lv)
    for f, n in ((fc3, 4), (two3, 3), (yn3, 3), (m3, 5), (ev3, 5)):
        T[3] += rep(f, 3, n)
    return T

# =====================================================================
# s012 · Trinomios y elección del método
# =====================================================================
def s012(r):
    T = {1: [], 2: [], 3: []}
    def pq(pos):
        while True:
            p = r.randint(1, 9) if pos else nz(r, -9, 9); q = r.randint(1, 9) if pos else nz(r, -9, 9)
            if p != q and p + q != 0 and (pos or p < 0 or q < 0): return p, q
    def tri(p, q, k=1): return P([(k, 'x^{2}'), (k * (p + q), 'x'), (k * p * q, '')])
    def A(lv, pos):
        p, q = pq(pos); ok = f'{par(lin(1, p))}{par(lin(1, q))}'
        return mc(f'Factoriza ${tri(p, q)}$.', D(ok), [D(f'{par(lin(1, -p))}{par(lin(1, -q))}'), D(f'{par(lin(1, p + q))}{par(lin(1, p * q))}' if p * q not in (p, q, p + q) else f'{par(lin(1, p))}^{{2}}'), D(f'{par(lin(1, p))}{par(lin(1, -q))}')],
                  f'Dos números con suma ${p + q}$ y producto ${p * q}$: ${p}$ y ${q}$. Resultado ${ok}$.', lv, r,
                  fb=['Con esos signos la suma cambia de signo.', 'Los números del binomio deben **sumar** el coeficiente de $x$ y **multiplicar** el término independiente.', 'Revisa los signos: el producto debe ser ' + str(p * q) + '.'])
    def SP(lv, pos):
        p, q = pq(pos)
        return mc(f'Para factorizar ${tri(p, q)}$ se buscan dos números. ¿Cuáles?', f'${p}$ y ${q}$', [f'${-p}$ y ${-q}$', f'${p + q}$ y ${p * q}$' if p * q != p + q else f'$1$ y ${p * q}$', f'${p}$ y ${-q}$'],
                  f'Deben sumar ${p + q}$ (coeficiente de $x$) y multiplicar ${p * q}$ (término independiente): ${p}$ y ${q}$.', lv, r,
                  fb=['Con esos signos la suma cambia de signo.', 'Los números buscados deben **sumar** el coeficiente de $x$ y **multiplicar** el término independiente.', f'Revisa los signos: el producto debe ser ${p * q}$.'])
    def Sset(lv, pos):
        p, q = pq(pos)
        return inp(f'${tri(p, q)}=(x+p)(x+q)$. Escribe los números $p$ y $q$, separados por punto y coma.', f'{p}; {q}',
                   f'Suma ${p + q}$ y producto ${p * q}$: $p={p}$, $q={q}$. Comprueba: $(x{p:+d})(x{q:+d})={tri(p, q)}$.', lv, kind='set')
    for f, n in ((lambda lv: A(lv, True), 6), (lambda lv: SP(lv, True), 4), (lambda lv: Sset(lv, True), 10)):
        T[1] += rep(f, 1, n)
    def ac(lv):
        while True:
            a = r.randint(2, 6); p = nz(r, -7, 7); q = nz(r, -7, 7)  # (a x + p)(x + q) = a x² + (aq + p) x + pq
            if gcd(a, abs(p)) == 1 and a * q + p != 0: break
        return a, p, q
    T[2] += rep(lambda lv: Sset(lv, False), 2, 5)  # entrada
    def acset(lv):
        a, p, q = ac(lv); b = a * q + p; c = p * q
        if a * q == p: raise ValueError
        return inp(f'Para factorizar ${P([(a, "x^{2}"), (b, "x"), (c, "")])}$ con el método $ac$ se buscan dos números con producto $a\\cdot c={a * c}$ y suma ${b}$. Escríbelos separados por punto y coma.', f'{a * q}; {p}',
                   f'${a * q}\\cdot({p})={a * c}$ y ${a * q}+({p})={b}$. Se separa ${b}x$ en ${a * q}x{p:+d}x$ y se agrupa.', lv, kind='set')
    def acA(lv):
        a, p, q = ac(lv); b = a * q + p; c = p * q; ok = f'{par(lin(a, p))}{par(lin(1, q))}'
        return mc(f'Factoriza ${P([(a, "x^{2}"), (b, "x"), (c, "")])}$.', D(ok), [D(f'{par(lin(a, q))}{par(lin(1, p))}'), D(f'{par(lin(a, -p))}{par(lin(1, -q))}'), D(f'{par(lin(1, p))}{par(lin(1, a * q))}')],
                  f'Método $ac$: producto ${a * c}$, suma ${b}$ → ${a * q}$ y ${p}$. ${P([(a, "x^{2}"), (a * q, "x"), (p, "x"), (c, "")])}={a}x(x{q:+d}){p:+d}(x{q:+d})$, es decir ${ok}$.', lv, r,
                  fb=['Se intercambiaron los números: multiplica para comprobar.', 'Revisa los signos: multiplica para comprobar.', f'Falta el coeficiente ${a}$ del primer término: multiplica para comprobar.'])
    def met(lv):
        cs = r.choice([('dc', 'Diferencia de cuadrados'), ('tcp', 'Trinomio cuadrado perfecto'), ('fc', 'Factor común'), ('sp', 'Suma y producto')])
        n = r.randint(2, 9); p, q = pq(True)
        ex = {'dc': f'x^{{2}} - {n * n}', 'tcp': f'x^{{2}} + {2 * n}x + {n * n}', 'fc': f'{n}x^{{2}} + {n * (n + 1)}x', 'sp': tri(p, q)}[cs[0]]
        others = [o for o in ['Diferencia de cuadrados', 'Trinomio cuadrado perfecto', 'Factor común', 'Suma y producto'] if o != cs[1]]
        return mc(f'¿Qué método conviene usar **primero** para factorizar ${ex}$?', cs[1], others,
                  {'dc': 'Son dos términos, ambos cuadrados, restados.', 'tcp': 'Los extremos son cuadrados y el término central es el doble producto.', 'fc': f'Ambos términos tienen el factor ${n}x$.', 'sp': 'Es un trinomio $x^2+bx+c$ que no es cuadrado perfecto.'}[cs[0]], lv, r,
                  fb=[MET_FB[cs[0]][o] for o in others])
    for f, n in ((acset, 5), (lambda lv: A(lv, False), 4), (acA, 3), (met, 3)):
        T[2] += rep(f, 2, n)
    def kset(lv):
        k = r.randint(2, 6); p, q = pq(False)
        return inp(f'${tri(p, q, k)}={k}(x+p)(x+q)$. Escribe los números $p$ y $q$, separados por punto y coma.', f'{p}; {q}',
                   f'Primero el factor común: ${k}({tri(p, q)})$. Luego suma ${p + q}$ y producto ${p * q}$: $p={p}$, $q={q}$.', lv, kind='set')
    def kA(lv):
        k = r.randint(2, 6); p, q = pq(False); ok = f'{k}{par(lin(1, p))}{par(lin(1, q))}'
        return mc(f'Factoriza completamente ${tri(p, q, k)}$.', D(ok), [D(f'{k}{par(tri(p, q))}'), D(f'{par(lin(k, p))}{par(lin(1, q))}'), D(f'{k}{par(lin(1, -p))}{par(lin(1, -q))}')],
                  f'Factor común ${k}$ y luego suma y producto: ${ok}$.', lv, r,
                  fb=['Falta factorizar el trinomio del paréntesis.', 'Multiplica para comprobar: no da el trinomio original.', 'Revisa los signos.'])
    def acm(lv):
        a, p, q = ac(lv); b = a * q + p; c = p * q
        return inp(f'Completa el número que falta. Escribe solo el número, con su signo. ${P([(a, "x^{2}"), (b, "x"), (c, "")])}=({a}x {"+" if p > 0 else "-"} {abs(p)})(x + \\square)$', q,
                   f'${p}\\cdot\\square={c}$, así que $\\square={q}$. Comprueba: ${a}x\\cdot({q})+({p})x={b}x$.', lv)
    def comp(lv):
        n = r.randint(1, 4)
        return mc(f'¿Cuál es la factorización **completa** de $x^{{3}} - {n * n}x$?', D(f'x{par(f"x - {n}")}{par(f"x + {n}")}'), [D(f'x{par(f"x^{{2}} - {n * n}")}'), D(f'{par(f"x - {n}")}{par(f"x + {n}")}'), D(f'x^{{2}}{par(f"x - {n * n}")}')],
                  f'Factor común $x$: $x(x^2-{n * n})$; luego diferencia de cuadrados: $x(x-{n})(x+{n})$.', lv, r,
                  fb=[f'Falta factorizar $x^{{2}}-{n * n}$: es una diferencia de cuadrados.', 'Falta el factor común $x$.', 'Multiplica para comprobar: no da la expresión original.'])
    for f, n in ((kset, 5), (acm, 5), (kA, 4), (comp, 3), (acA, 3)):
        T[3] += rep(f, 3, n)
    return T

MET_FB = {  # por qué no conviene cada método (retroalimentación de «¿Qué método conviene?»)
    'dc': {'Trinomio cuadrado perfecto': 'Tiene solo dos términos: no es un trinomio.', 'Factor común': 'Los dos términos no tienen un factor común.', 'Suma y producto': 'Suma y producto se usa con trinomios; aquí hay dos términos.'},
    'tcp': {'Diferencia de cuadrados': 'Tiene tres términos: no es una diferencia de dos cuadrados.', 'Factor común': 'Los términos no tienen un factor común.', 'Suma y producto': 'Funciona, pero el trinomio es cuadrado perfecto: hay un camino más directo.'},
    'fc': {'Diferencia de cuadrados': 'Los términos se suman y no son cuadrados.', 'Trinomio cuadrado perfecto': 'Tiene solo dos términos: no es un trinomio.', 'Suma y producto': 'Tiene solo dos términos: no es un trinomio.'},
    'sp': {'Diferencia de cuadrados': 'Tiene tres términos: no es una diferencia de dos cuadrados.', 'Trinomio cuadrado perfecto': 'El término central no es el doble producto de las raíces de los extremos.', 'Factor común': 'Los términos no tienen un factor común.'},
}

GEN = {'u2-s001': s001, 'u2-s002': s002, 'u2-s003': s003, 'u2-s004': lambda r: cuadrado(r, 1), 'u2-s005': lambda r: cuadrado(r, -1),
       'u2-s006': s006, 'u2-s007': s007, 'u2-s008': s008, 'u2-s009': s009, 'u2-s010': s010, 'u2-s011': s011, 'u2-s012': s012}

def construir(sid, semilla=0):
    """Genera 20 preguntas por nivel sin repetir enunciados (reintenta las plantillas que fallan o repiten)."""
    for intento in range(400):
        r = random.Random(f'{sid}-{semilla}-{intento}'); VISTOS.clear()
        try:
            T = GEN[sid](r)
        except (ValueError, IndexError):
            continue
        todos = [q for L in (1, 2, 3) for q in T[L]]
        if len({q['q'] for q in todos}) == len(todos) and all(len(T[L]) == 20 for L in (1, 2, 3)):
            return todos, intento
    raise SystemExit(f'{sid}: no se pudo generar sin repetir')

if __name__ == '__main__':
    d = json.load(open(RUTA, encoding='utf8'))
    for s in d['stations']:
        P0, it = construir(s['id'])
        s['practice'] = P0
        a = sum(q.get('type') != 'input' for q in P0)
        print(f"{s['id']}: {len(P0)} preguntas ({a} alternativas, {len(P0) - a} escritas) · intento {it}")
    if '--escribir' in sys.argv:
        json.dump(d, open(RUTA, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
        print('Escrito', RUTA)
