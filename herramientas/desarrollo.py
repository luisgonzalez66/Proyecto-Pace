#!/usr/bin/env python3
"""Genera el «desarrollo» (pasos) de las preguntas «Resuelve la ecuación» de una unidad.
Solo escribe un desarrollo si el resultado calculado coincide EXACTAMENTE con la respuesta oficial."""
import re, json, sys
from fractions import Fraction as F
from math import gcd, isqrt

# ---------- polinomios ----------
def padd(a, b):
    r = dict(a)
    for k, v in b.items():
        r[k] = r.get(k, 0) + v
    return {k: v for k, v in r.items() if v != 0}
def pneg(a): return {k: -v for k, v in a.items()}
def pmul(a, b):
    r = {}
    for i, u in a.items():
        for j, v in b.items():
            r[i + j] = r.get(i + j, 0) + u * v
    return {k: v for k, v in r.items() if v != 0}
def pconst(a): return a.get(0, F(0)) if set(a) <= {0} else None
def pdiv(a, b):
    c = pconst(b)
    if c is None or c == 0: raise ValueError('div')
    return {k: v / c for k, v in a.items()}
def ppow(a, n):
    r = {0: F(1)}
    for _ in range(n): r = pmul(r, a)
    return r

class P:
    def __init__(s, t): s.t = t; s.i = 0; s.dens = set(); s.paren = False
    def peek(s): return s.t[s.i] if s.i < len(s.t) else ''
    def eat(s, c=None):
        if c and s.peek() != c: raise ValueError('esperaba ' + c)
        s.i += 1
    def expr(s):
        a = s.term()
        while s.peek() and s.peek() in '+-':
            o = s.peek(); s.i += 1
            b = s.term(); a = padd(a, b if o == '+' else pneg(b))
        return a
    def term(s):
        neg = False
        while s.peek() and s.peek() in '+-':
            if s.peek() == '-': neg = not neg
            s.i += 1
        a = s.pw()
        while True:
            c = s.peek()
            if c == '*': s.i += 1; a = pmul(a, s.pw())
            elif c == '/': s.i += 1; b = s.pw(); a = pdiv(a, b)
            elif c and (c.isdigit() or c in 'x(\\.'): a = pmul(a, s.pw())  # multiplicación implícita
            else: break
        return pneg(a) if neg else a
    def pw(s):
        a = s.atom()
        if s.peek() == '^':
            s.i += 1
            if s.peek() == '{':
                s.i += 1; n = s.num_int(); s.eat('}')
            else: n = s.num_int()
            a = ppow(a, n)
        return a
    def num_int(s):
        m = re.match(r'\d+', s.t[s.i:])
        if not m: raise ValueError('exp')
        s.i += len(m.group(0)); return int(m.group(0))
    def atom(s):
        c = s.peek()
        if c == '(':
            s.i += 1; e = s.expr(); s.eat(')'); s.paren = True; return e
        if c == 'x': s.i += 1; return {1: F(1)}
        if c.isdigit() or c == '.':
            m = re.match(r'\d*\.?\d+', s.t[s.i:]); s.i += len(m.group(0)); return {0: F(m.group(0))} if float(m.group(0)) != 0 else {}
        if s.t.startswith('\\frac', s.i):
            s.i += 5; s.eat('{'); a = s.expr(); s.eat('}'); s.eat('{'); b = s.expr(); s.eat('}')
            c0 = pconst(b)
            if c0 is None or c0 == 0: raise ValueError('den')
            if c0.denominator == 1: s.dens.add(int(c0))
            return pdiv(a, b)
        raise ValueError('atom ' + c)

def clean(tex):
    t = tex.replace('\\dfrac', '\\frac').replace('{,}', '.').replace('\\cdot', '*').replace('\\left', '').replace('\\right', '')
    t = re.sub(r'\s+', '', t)
    return t

def parse_side(tex):
    p = P(clean(tex)); r = p.expr()
    if p.i != len(p.t): raise ValueError('sobra')
    return r, p

# ---------- salida LaTeX ----------
def fnum(v, signed=False):
    v = F(v)
    s = '-' if v < 0 else ('+' if signed else '')
    v = abs(v)
    if v.denominator == 1: return s + str(v.numerator)
    return s + '\\dfrac{%d}{%d}' % (v.numerator, v.denominator)
def ptex(a):
    if not a: return '0'
    out = ''
    for d in sorted(a, reverse=True):
        c = a[d]; first = out == ''
        sign = '-' if c < 0 else ('' if first else '+')
        mag = abs(c)
        if d == 0: body = fnum(mag)
        else:
            co = '' if mag == 1 else fnum(mag)
            body = co + ('x' if d == 1 else 'x^{%d}' % d)
        out += (sign + body) if first else (' ' + sign + ' ' + body)
    return out
def eqtex(l, r): return ptex(l) + ' = ' + ptex(r)
def lcm(a, b): return a * b // gcd(a, b)

def answer_vals(q):
    parts = [x.strip() for x in str(q['answer']).split(';') if x.strip()]
    vs = []
    for x in parts:
        m = re.fullmatch(r'(-?\d+)(?:/(\d+))?', x.replace(',', '.')) if '.' not in x and ',' not in x else None
        if m: vs.append(F(int(m.group(1)), int(m.group(2) or 1)))
        else:
            try: vs.append(F(x.replace(',', '.')))
            except Exception: return None
    return sorted(set(vs))

def fmt_root(v): return fnum(v)

def ev(p, x): return sum(c * x ** k for k, c in p.items())
def chk(l, r, ans):
    if any(ev(l, x) != ev(r, x) for x in ans): raise AssertionError('paso inconsistente')

# ---------- generación ----------
def solve(q):
    m = re.search(r'\$\$(.*?)\$\$', q['q'], re.S)
    if not m: return None
    eq = m.group(1).strip()
    if eq.count('=') != 1: return None
    L, R = eq.split('=')
    lp, pl = parse_side(L); rp, pr = parse_side(R)
    ans = answer_vals(q)
    if ans is None: return None
    deg = max([max(lp, default=0), max(rp, default=0)])
    paren = pl.paren or pr.paren
    dens = pl.dens | pr.dens
    steps = []
    orig = eq.replace('\\dfrac', '\\dfrac')
    steps.append('Partimos de la ecuación: $%s$.' % orig)
    # forma original raw (para no repetir pasos idénticos)
    cur_l, cur_r = lp, rp
    if deg <= 1:
        if paren:
            steps.append('Eliminamos los paréntesis con la propiedad distributiva y reducimos términos semejantes: $%s$.' % eqtex(cur_l, cur_r))
        elif L.count('x') > 1 or R.count('x') > 1:
            steps.append('Reducimos los términos semejantes de cada lado: $%s$.' % eqtex(cur_l, cur_r))
        # fracciones / decimales
        mult = 1
        for c in list(cur_l.values()) + list(cur_r.values()):
            mult = lcm(mult, F(c).denominator)
        if mult > 1:
            why = 'el mcm de los denominadores' if dens else 'una potencia de 10'
            cur_l = {k: v * mult for k, v in cur_l.items()}; cur_r = {k: v * mult for k, v in cur_r.items()}
            steps.append('Multiplicamos ambos lados por %d para eliminar %s: $%s$.' % (mult, 'los denominadores' if dens else 'los decimales', eqtex(cur_l, cur_r)))
        chk(cur_l, cur_r, ans)
        a = cur_l.get(1, F(0)) - cur_r.get(1, F(0))
        b = cur_r.get(0, F(0)) - cur_l.get(0, F(0))
        if a == 0: return None
        # agrupar
        need_group = cur_r.get(1, 0) != 0 or cur_l.get(0, 0) != 0
        if need_group:
            steps.append('Agrupamos los términos con $x$ en un lado y los números en el otro: $%sx = %s$.' % ('' if a == 1 else ('-' if a == -1 else fnum(a)), fnum(b)))
        x = b / a
        if a != 1:
            steps.append('Dividimos ambos lados entre %s: $x = %s$.' % (fnum(a), fnum(x)))
        elif not need_group:
            pass
        res = [x]
        if res != ans: return None
        if a == 1 and mult <= 1 or True:
            if not (steps[-1].rstrip('.').endswith('$x = %s$' % fnum(x))):
                steps.append('La solución es $x = %s$.' % fnum(x))
        return steps
    if deg == 2:
        # detectar producto de factores igual a cero (forma factorizada original)
        L_s, R_s = clean(L), clean(R)
        tot = padd(lp, pneg(rp))
        a2, b1, c0 = tot.get(2, F(0)), tot.get(1, F(0)), tot.get(0, F(0))
        if a2 == 0: return None
        factored0 = (R_s == '0' and paren and re.fullmatch(r'\(.*\)\(.*\)', L_s) is not None)
        perfect = (paren and re.fullmatch(r'\(.*\)\^\{?2\}?', L_s) is not None and R_s.lstrip('-').replace('.', '').isdigit())
        if factored0:
            f1, f2 = re.match(r'\((.*?)\)\((.*)\)$', L_s).groups()
            try:
                p1, _ = parse_side(f1); p2, _ = parse_side(f2)
                r1 = -p1.get(0, F(0)) / p1[1]; r2 = -p2.get(0, F(0)) / p2[1]
            except Exception: return None
            roots = sorted({r1, r2})
            if roots != ans: return None
            steps.append('Un producto es cero cuando alguno de sus factores es cero: $%s = 0$ o $%s = 0$.' % (ptex(p1), ptex(p2)))
            steps.append('Despejamos $x$ en cada caso: $x = %s$ o $x = %s$.' % (fnum(r1), fnum(r2)))
            return steps
        if perfect:
            base = re.match(r'\((.*)\)\^', L_s).group(1)
            pb, _ = parse_side(base)
            rr = F(R_s)
            sq = F(isqrt(int(rr * rr.denominator * rr.denominator)), rr.denominator) if rr.denominator != 1 else F(isqrt(int(rr)))
            if sq * sq != rr: return None
            k = pb.get(1, F(0)); c = pb.get(0, F(0))
            sols = sorted({(sq - c) / k, (-sq - c) / k})
            if sols != ans: return None
            steps.append('Sacamos raíz cuadrada en ambos lados: $%s = %s$ o $%s = -%s$.' % (ptex(pb), fnum(sq), ptex(pb), fnum(sq)))
            steps.append('Despejamos $x$ en cada caso: $x = %s$ o $x = %s$.' % (fnum(sols[-1]) if False else fnum((sq - c) / k), fnum((-sq - c) / k)))
            return steps
        std = padd(lp, pneg(rp))
        chk(std, {}, ans)
        if paren or R_s != '0':
            steps.append('Llevamos todo a un lado y reducimos: $%s = 0$.' % ptex(std))
        # incompleta b=0
        if b1 == 0:
            rhs = -c0 / a2
            if rhs < 0: return None
            rt = F(isqrt(int(rhs))) if rhs.denominator == 1 else F(isqrt(rhs.numerator), isqrt(rhs.denominator))
            if rt * rt != rhs: return None
            sols = sorted({rt, -rt})
            if sols != ans and not (rt == 0 and ans == [F(0)]): return None
            if a2 != 1 or c0 != 0:
                steps.append('Despejamos $x^{2}$: $x^{2} = %s$.' % fnum(rhs))
            steps.append('Sacamos raíz cuadrada: $x = \\pm\\sqrt{%s} = \\pm %s$.' % (fnum(rhs), fnum(rt)))
            if rt != 0: steps.append('Las soluciones son $x = %s$ y $x = %s$.' % (fnum(-rt), fnum(rt)))
            return steps
        if c0 == 0:
            r2 = -b1 / a2
            sols = sorted({F(0), r2})
            if sols != ans: return None
            fac = ('x' if a2 == 1 else ('-x' if a2 == -1 else fnum(a2) + 'x'))
            steps.append('Factorizamos sacando factor común $x$: $x\\,(%s) = 0$.' % ptex({1: a2, 0: b1}))
            steps.append('Un producto es cero cuando alguno de sus factores es cero: $x = 0$ o $%s = 0$.' % ptex({1: a2, 0: b1}))
            steps.append('Despejamos: $x = 0$ o $x = %s$.' % fnum(r2))
            return steps
        D = b1 * b1 - 4 * a2 * c0
        if D < 0: return None
        if D.denominator != 1 and False: return None
        sd = F(isqrt(D.numerator), isqrt(D.denominator)) if D >= 0 else None
        if sd is None or sd * sd != D: return None
        x1 = (-b1 + sd) / (2 * a2); x2 = (-b1 - sd) / (2 * a2)
        sols = sorted({x1, x2})
        if sols != ans: return None
        steps.append('Identificamos los coeficientes: $a = %s$, $b = %s$, $c = %s$.' % (fnum(a2), fnum(b1), fnum(c0)))
        steps.append('Calculamos el discriminante: $\\Delta = b^{2} - 4ac = (%s)^{2} - 4\\cdot(%s)\\cdot(%s) = %s$.' % (fnum(b1), fnum(a2), fnum(c0), fnum(D)))
        steps.append('Aplicamos la fórmula general: $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{%s \\pm %s}{%s}$.' % (fnum(-b1), fnum(sd), fnum(2 * a2)))
        if len(sols) == 1: steps.append('Solo hay una solución: $x = %s$.' % fnum(x1))
        else: steps.append('Las soluciones son $x = %s$ y $x = %s$.' % (fnum(sols[0]), fnum(sols[1])))
        return steps
    return None

def walk(o, fn):
    if isinstance(o, dict):
        if 'q' in o and 'answer' in o and o.get('type') == 'input': fn(o)
        for v in o.values(): walk(v, fn)
    elif isinstance(o, list):
        for v in o: walk(v, fn)

if __name__ == '__main__':
    d = json.load(open(sys.argv[1], encoding='utf-8'))
    tot = ok = 0; fails = []; cache = {}
    def f(q):
        global tot, ok
        if not q['q'].startswith('Resuelve la ecuación'): return
        tot += 1
        try: st = solve(q)
        except Exception as e: st = None
        if st: ok += 1
        else: fails.append(q['q'][:90].replace('\n', ' ') + ' | ' + str(q['answer']))
    walk(d, f)
    print('ecuaciones', tot, 'con desarrollo verificado', ok)
    for x in fails[:15]: print('  sin desarrollo:', x)
