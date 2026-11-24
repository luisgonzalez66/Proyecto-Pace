"""Informe visual (HTML de un solo archivo, sin conexión a internet) del análisis de errores del curso PACE.
Lo llama analizar_errores.py; se puede abrir con doble clic en cualquier navegador."""
import collections, html, re, datetime

SUP = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', 'n': 'ⁿ'}

def plano(t):
    """TeX sencillo -> texto legible."""
    t = str(t or '').replace('\\left', '').replace('\\right', '').replace('^\\circ', '°').replace('^{\\circ}', '°')
    for _ in range(3):
        t = re.sub(r'\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'(\1)/(\2)', t)
        t = re.sub(r'\\sqrt\{([^{}]*)\}', r'√(\1)', t)
        t = re.sub(r'\\(?:text|mathrm|mathbf|operatorname)\{([^{}]*)\}', r'\1', t)
    t = re.sub(r'\^\{([-0-9n]+)\}', lambda m: ''.join(SUP.get(c, c) for c in m.group(1)), t)
    t = re.sub(r'\^([0-9n])', lambda m: SUP[m.group(1)], t)
    for a, b in [(r'\cdot', '·'), (r'\times', '×'), (r'\div', '÷'), (r'\le', '≤'), (r'\ge', '≥'), (r'\neq', '≠'), (r'\pm', '±'),
                 (r'\left', ''), (r'\right', ''), (r'\Rightarrow', '⇒'), (r'\,', ' '), (r'\;', ' '), (r'\quad', ' '), (r'\qquad', ' '),
                 (r'\%', '%'), (r'\{', '{'), (r'\}', '}'), (r'\Delta', 'Δ'), (r'\pi', 'π'), ('\\\\', ' ')]:
        t = t.replace(a, b)
    t = t.replace('$', '').replace('{', '').replace('}', '').replace('**', '')
    return re.sub(r'\s+', ' ', t).strip()

E = lambda t: html.escape(str(t), quote=True)

CSS = """
.viz-root{--surface-1:#fcfcfb;--text-primary:#0b0b0b;--text-secondary:#52514e;--text-muted:#77766f;--grid:#e6e5e0;--axis:#c9c8c1;
 --seq-1:#86b6ef;--seq-2:#3987e5;--seq-3:#1c5cab;--seq-4:#104281;--card:#ffffff;--border:#e6e5e0;--up:#1c5cab;--down:#c4561d;--same:#a3a29a;color-scheme:light}
@media (prefers-color-scheme: dark){:root:where(:not([data-theme="light"])) .viz-root{--surface-1:#1a1a19;--text-primary:#f0efec;--text-secondary:#c3c2b7;
 --text-muted:#9a998f;--grid:#33332f;--axis:#4a4a45;--seq-1:#256abf;--seq-2:#3987e5;--seq-3:#6da7ec;--seq-4:#9ec5f4;--card:#222220;--border:#33332f;--up:#6da7ec;--down:#e8834f;--same:#6b6a63;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0}
.viz-root{background:var(--surface-1);color:var(--text-primary);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:28px 20px 60px}
.wrap{max-width:1080px;margin:0 auto}
h1{font-size:26px;margin:0 0 4px}h2{font-size:19px;margin:0 0 4px}.sub{color:var(--text-secondary);margin:0 0 18px}
.lead{color:var(--text-secondary);margin:2px 0 14px;max-width:780px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:18px 0 26px}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
.kpi b{display:block;font-size:28px;line-height:1.1;font-variant-numeric:tabular-nums}.kpi span{color:var(--text-secondary);font-size:13px}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 18px 12px;margin:0 0 22px}
.legend{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;color:var(--text-secondary);margin:4px 0 8px}
.sw{display:inline-block;width:12px;height:12px;border-radius:50%;vertical-align:-1px;margin-right:6px}
svg text{font-family:inherit}.t-lbl{fill:var(--text-primary);font-size:12.5px}.t-mut{fill:var(--text-muted);font-size:11.5px}
.t-val{fill:var(--text-secondary);font-size:11.5px;font-variant-numeric:tabular-nums}.t-unit{fill:var(--text-primary);font-size:13px;font-weight:700}
.grid{stroke:var(--grid);stroke-width:1}.axis{stroke:var(--axis);stroke-width:1}
.hit{fill:transparent;cursor:default}.hit:hover{fill:var(--grid);fill-opacity:.45}
details{margin:6px 0 4px}summary{cursor:pointer;color:var(--text-secondary);font-size:13px}
table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}th,td{border-bottom:1px solid var(--border);padding:6px 8px;text-align:left;vertical-align:top}
th{color:var(--text-secondary);font-weight:600}td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.heat td.c{text-align:center;font-variant-numeric:tabular-nums;border-radius:4px;border:2px solid var(--card)}
.tip{position:fixed;pointer-events:none;background:var(--card);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;
 padding:7px 10px;font-size:12.5px;box-shadow:0 6px 18px rgba(0,0,0,.15);max-width:360px;display:none;z-index:9}
.note{font-size:12.5px;color:var(--text-muted);margin-top:6px}
.take{background:color-mix(in srgb,var(--seq-2) 10%,transparent);border-left:4px solid var(--seq-3);border-radius:6px;padding:8px 12px;margin:6px 0 14px;font-size:14.5px}
.how{font-size:13px;color:var(--text-secondary);margin:10px 0 2px}.how b{color:var(--text-primary)}
.guide{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin:14px 0 4px;font-size:14px}
.guide ul{margin:6px 0 0;padding-left:20px}.guide li{margin:2px 0}
.kpi.big b{font-size:34px}.arrow{color:var(--text-muted);font-weight:400}
.badge{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid var(--border);color:var(--text-secondary);margin-right:4px}
"""

JS = """document.querySelectorAll('[data-tip]').forEach(el=>{const t=document.getElementById('tip');
el.addEventListener('mousemove',e=>{t.innerHTML=el.dataset.tip;t.style.display='block';const x=Math.min(e.clientX+14,innerWidth-t.offsetWidth-8);t.style.left=x+'px';t.style.top=(e.clientY+14)+'px';});
el.addEventListener('mouseleave',()=>{t.style.display='none';});});"""

def pctf(v): return '—' if v is None else f'{v:.0f} %'
def pts(v): return '—' if v is None else ('%+.0f' % v)

def seccion(titulo, resumen, grafico, como, tabla=''):
    return (f'<div class="card"><h2>{titulo}</h2><p class="take"><b>En resumen:</b> {resumen}</p>{grafico}'
            f'<p class="how"><b>Cómo leerlo:</b> {como}</p>{tabla}</div>')

def tabla(enc, filas, num=()):
    return ('<details><summary>Ver los números en una tabla</summary><table><tr>' + ''.join(f'<th>{E(h)}</th>' for h in enc) + '</tr>' +
            ''.join('<tr>' + ''.join(f'<td class="{"n" if j in num else ""}">{E(c)}</td>' for j, c in enumerate(f)) + '</tr>' for f in filas) + '</table></details>')

def pares(filas):
    """Barras pareadas: entrada (clara) y salida (oscura) por fila, con el cambio a la derecha."""
    W, L, R = 1000, 190, 110; x = lambda v: L + (W - L - R) * v / 100
    y = 28; p = []
    for v in (0, 25, 50, 75, 100):
        p.append(f'<line class="grid" x1="{x(v):.1f}" x2="{x(v):.1f}" y1="16" y2="__H__"/><text class="t-mut" x="{x(v):.1f}" y="10" text-anchor="middle">{v} %</text>')
    for f in filas:
        tot = f['etq'] == 'Todo el curso'
        if tot: p.append(f'<line class="axis" x1="0" x2="{W}" y1="{y - 6}" y2="{y - 6}"/>'); y += 8
        tip = f"<b>{E(f['etq'])}</b><br>{f['n']} estudiantes con ambas pruebas<br>Entrada: {pctf(f['e'])} · Salida (META): {pctf(f['s'])}"
        p.append(f'<g data-tip="{E(tip)}"><rect class="hit" x="0" y="{y - 4}" width="{W}" height="46" rx="4"/>'
                 f'<text class="{"t-unit" if tot else "t-lbl"}" x="0" y="{y + 18}" style="font-size:14px;font-weight:{700 if tot else 600}">{E(f["etq"])}</text>'
                 f'<text class="t-mut" x="0" y="{y + 34}">{f["n"]} estudiantes</text>'
                 f'<rect x="{L}" y="{y}" width="{max(2, x(f["e"]) - L):.1f}" height="16" rx="4" fill="var(--seq-1)"/>'
                 f'<text class="t-val" x="{x(f["e"]) + 6:.1f}" y="{y + 12}">Entrada {pctf(f["e"])}</text>'
                 f'<rect x="{L}" y="{y + 20}" width="{max(2, x(f["s"]) - L):.1f}" height="16" rx="4" fill="var(--seq-4)"/>'
                 f'<text class="t-val" x="{x(f["s"]) + 6:.1f}" y="{y + 32}">Salida {pctf(f["s"])}</text>'
                 f'<text x="{W - 4}" y="{y + 25}" text-anchor="end" style="font-size:20px;font-weight:700;fill:{"var(--up)" if f["s"] >= f["e"] else "var(--down)"}">{pts(f["s"] - f["e"])}</text></g>')
        y += 58
    return f'<svg viewBox="0 0 {W} {y}" width="100%" role="img">' + ''.join(p).replace('__H__', str(y - 12)) + '</svg>'

def distribucion(es):
    """Cuántos estudiantes caen en cada tramo de % de acierto, entrada vs salida (barras agrupadas)."""
    tramos = ['0–19 %', '20–39 %', '40–59 %', '60–79 %', '80–100 %']
    t = lambda v: min(4, int(v // 20))
    ce = collections.Counter(t(d['pe']) for d in es); cs = collections.Counter(t(d['ps']) for d in es)
    n = len(es); mx = max(list(ce.values()) + list(cs.values()) + [1]) / n * 100
    W, H, B, T = 1000, 230, 180, 24; colw = W / 5; bw = 56
    yv = lambda v: B - (B - T) * v / mx
    p = [f'<line class="axis" x1="0" x2="{W}" y1="{B}" y2="{B}"/>']
    for i, et in enumerate(tramos):
        cx = colw * i + colw / 2
        for j, (c, col, nom) in enumerate([(ce, 'var(--seq-1)', 'Entrada'), (cs, 'var(--seq-4)', 'Salida')]):
            v = 100 * c[i] / n; x0 = cx - bw - 3 + j * (bw + 6)
            tip = f'<b>{nom}</b>, acierto {et}: {c[i]} de {n} ({v:.0f} %)'
            p.append(f'<g data-tip="{E(tip)}"><rect x="{x0:.1f}" y="{yv(v):.1f}" width="{bw}" height="{max(0, B - yv(v)):.1f}" rx="4" fill="{col}"/>'
                     f'<text class="t-val" x="{x0 + bw / 2:.1f}" y="{yv(v) - 6:.1f}" text-anchor="middle">{v:.0f} %</text></g>')
        p.append(f'<text class="t-lbl" x="{cx:.1f}" y="{B + 22}" text-anchor="middle">{et}</text>')
    p.append(f'<text class="t-mut" x="{W / 2}" y="{B + 44}" text-anchor="middle">% de acierto en la prueba</text>')
    return f'<svg viewBox="0 0 {W} {H}" width="100%" role="img">' + ''.join(p) + '</svg>', ce, cs

def balance(es):
    up = sum(d['cambio'] >= 10 for d in es); dn = sum(d['cambio'] <= -10 for d in es); eq = len(es) - up - dn; n = len(es)
    W = 1000; p = []; x0 = 0
    for k, col, nom in [(up, 'var(--up)', 'Mejoran (10 puntos o más)'), (eq, 'var(--same)', 'Quedan parecido (menos de 10 puntos de diferencia)'), (dn, 'var(--down)', 'Bajan (10 puntos o más)')]:
        w = W * k / n if n else 0
        if w > 0:
            p.append(f'<g data-tip="{E(nom)}: {k} de {n}"><rect x="{x0 + 1:.1f}" y="0" width="{max(0, w - 2):.1f}" height="34" rx="4" fill="{col}"/>' +
                     (f'<text x="{x0 + w / 2:.1f}" y="22" text-anchor="middle" style="font-size:13px;font-weight:700;fill:#fff">{100 * k / n:.0f} %</text>' if w > 50 else '') + '</g>')
        x0 += w
    leg = ''.join(f'<span><i class="sw" style="background:{c}"></i>{t}: <b>{k}</b></span>' for k, c, t in
                  [(up, 'var(--up)', 'Mejoran 10 puntos o más'), (eq, 'var(--same)', 'Quedan parecido'), (dn, 'var(--down)', 'Bajan 10 puntos o más')])
    return f'<svg viewBox="0 0 {W} 34" width="100%" role="img">' + ''.join(p) + f'</svg><div class="legend" style="margin-top:8px">{leg}</div>', up, eq, dn

def avance_estaciones(rows):
    """Por estación: entrada → META en números, y una barra del cambio centrada en 0."""
    lim = max(20, -(-max(abs(d['avance']) for d in rows) // 10) * 10)
    W, L = 1000, 560; C = L + (W - L) / 2; esc = (W - L - 40) / 2 / lim
    y = 30; p = [f'<text class="t-mut" x="{L - 175}" y="12" text-anchor="middle">Al entrar</text><text class="t-mut" x="{L - 70}" y="12" text-anchor="middle">En la META</text>'
                 f'<text class="t-mut" x="{C}" y="12" text-anchor="middle">Cambio (puntos)</text><text class="t-mut" x="{C - lim * esc:.1f}" y="12" text-anchor="middle">−{lim:.0f}</text><text class="t-mut" x="{C + lim * esc:.1f}" y="12" text-anchor="middle">+{lim:.0f}</text>'
                 f'<line class="axis" x1="{C}" x2="{C}" y1="18" y2="__H__"/>']
    u = None
    for d in rows:
        if d['unidad'] != u:
            u = d['unidad']; y += 8; p.append(f'<text class="t-unit" x="0" y="{y + 4}">{E(u)}</text>'); y += 22
        a, b, c = d['entrada'], d['meta2'], d['avance']
        tip = f"<b>{E(d['estacion'])}</b><br>{d['n']} estudiantes<br>Al entrar acierta el {pctf(a)}; en la META, con una pregunta de igual dificultad, el {pctf(b)}"
        p.append(f'<g data-tip="{E(tip)}"><rect class="hit" x="0" y="{y - 12}" width="{W}" height="24" rx="4"/><text class="t-lbl" x="12" y="{y + 4}">{E(d["estacion"][:40])}</text>'
                 f'<text class="t-val" x="{L - 175}" y="{y + 4}" text-anchor="middle">{pctf(a)}</text><text class="t-mut" x="{L - 122}" y="{y + 4}" text-anchor="middle">→</text>'
                 f'<text class="t-val" x="{L - 70}" y="{y + 4}" text-anchor="middle" style="font-weight:700;fill:var(--text-primary)">{pctf(b)}</text>')
        if c is not None:
            w = abs(c) * esc; x0 = C if c >= 0 else C - w
            p.append(f'<rect x="{x0:.1f}" y="{y - 7}" width="{max(2, w):.1f}" height="14" rx="3" fill="{"var(--up)" if c >= 0 else "var(--down)"}"/>'
                     f'<text class="t-val" x="{(C + w + 6) if c >= 0 else (C - w - 6):.1f}" y="{y + 4}" text-anchor="{"start" if c >= 0 else "end"}">{pts(c)}</text>')
        p.append('</g>'); y += 26
    return f'<svg viewBox="0 0 {W} {y}" width="100%" role="img">' + ''.join(p).replace('__H__', str(y - 10)) + '</svg>'

def barras(items, etiqueta, valor, tip, maxv=100, fmt=lambda v: f'{v:.0f} %', ancho_lbl=420):
    W, L, R = 1000, ancho_lbl, 60; x = lambda v: L + (W - L - R) * v / maxv
    y = 26; parts = []
    for v in (0, maxv / 2, maxv):
        parts.append(f'<line class="grid" x1="{x(v):.1f}" x2="{x(v):.1f}" y1="16" y2="__H__"/><text class="t-mut" x="{x(v):.1f}" y="11" text-anchor="middle">{fmt(v)}</text>')
    for it in items:
        v = valor(it)
        parts.append(f'<g data-tip="{E(tip(it))}"><rect class="hit" x="0" y="{y - 11}" width="{W}" height="22" rx="4"/>'
                     f'<text class="t-lbl" x="0" y="{y + 4}">{E(etiqueta(it))}</text>'
                     f'<rect x="{L}" y="{y - 7}" width="{max(2, x(v) - L):.1f}" height="14" rx="4" fill="var(--seq-3)"/>'
                     f'<text class="t-val" x="{x(v) + 6:.1f}" y="{y + 4}">{fmt(v)}</text></g>')
        y += 24
    return f'<svg viewBox="0 0 {W} {y}" width="100%" role="img">' + ''.join(parts).replace('__H__', str(y - 8)) + '</svg>'

def color_seq(v):
    steps = ['#eef4fd', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']
    i = min(len(steps) - 1, int(v / 100 * len(steps)))
    return steps[i], ('#ffffff' if i >= 4 else '#0b0b0b')

def lista(xs): return ', '.join(xs[:-1]) + ' y ' + xs[-1] if len(xs) > 1 else (xs[0] if xs else '')

def generar(ruta, fuente, reg, diag, dvm, alt_rows, pq_filas, orden=None, es=None):
    orden = orden or {}; es = es or []
    prim = [r for r in reg if r.get('primero')]
    out = [f'<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>Informe de respuestas · curso PACE</title><style>{CSS}</style></head><body><div class="viz-root"><div class="wrap">',
           f'<h1>Informe de respuestas · curso PACE</h1><p class="sub">Fuente: {E(fuente.split("/")[-1])} · generado el {datetime.datetime.now():%d-%m-%Y %H:%M}</p>']
    if 'SIMULACION' in fuente.upper():
        out.append('<p style="border:1px dashed var(--axis);border-radius:10px;padding:8px 12px;color:var(--text-secondary);font-size:13px">'
                   '<b>Datos simulados.</b> Estudiantes ficticios generados para probar el informe; los números no describen el curso real.</p>')
    out.append('<div class="guide"><b>Dos palabras antes de leer</b><ul>'
               '<li><b>Entrada</b>: las preguntas «Antes de empezar» que aparecen al abrir cada estación. Juntas, las de una unidad forman la prueba de entrada de esa unidad.</li>'
               '<li><b>Salida</b>: la META FINAL de la unidad. Funciona como prueba de salida.</li>'
               '<li>Los porcentajes son <b>% de respuestas correctas</b>. «Omitir» cuenta como no acertada.</li></ul></div>')
    # ---------- 1. Entrada vs salida ----------
    if es:
        def agg(g):
            return dict(n=len({d['correo'] for d in g}), e=100 * sum(d['ae'] for d in g) / sum(d['ne'] for d in g),
                        s=100 * sum(d['as_'] for d in g) / sum(d['ns'] for d in g))
        unis = sorted({d['unidad'] for d in es})
        filas = [dict(etq=u, **agg([d for d in es if d['unidad'] == u])) for u in unis] + [dict(etq='Todo el curso', **agg(es))]
        T = filas[-1]
        svgb, up, eq, dn = balance(es)
        out += ['<div class="kpis">',
                f'<div class="kpi"><b>{T["n"]}</b><span>estudiantes terminaron al menos una unidad (tienen entrada y salida)</span></div>',
                f'<div class="kpi big"><b>{pctf(T["e"])}</b><span>de acierto en la prueba de entrada</span></div>',
                f'<div class="kpi big"><b>{pctf(T["s"])}</b><span>de acierto en la prueba de salida (META)</span></div>',
                f'<div class="kpi big"><b style="color:var(--up)">{pts(T["s"] - T["e"])}</b><span>puntos de diferencia entre salida y entrada</span></div>',
                '</div>']
        mej = max(filas[:-1], key=lambda f: f['s'] - f['e']); peor = min(filas[:-1], key=lambda f: f['s'] - f['e'])
        res = (f'en todo el curso se pasa de {pctf(T["e"])} de acierto al entrar a {pctf(T["s"])} en la META ({pts(T["s"] - T["e"])} puntos). '
               + (f'Donde más se avanza es en la {mej["etq"]} ({pts(mej["s"] - mej["e"])}); donde menos, en la {peor["etq"]} ({pts(peor["s"] - peor["e"])}).' if len(filas) > 2 else ''))
        out.append(seccion('1. Prueba de entrada y prueba de salida, por unidad', res, pares(filas),
                           'cada unidad tiene dos barras. La clara es el % de acierto en la entrada; la oscura, en la salida. '
                           'El número grande de la derecha es la diferencia en puntos. Cada estudiante se compara consigo mismo: solo cuentan quienes tienen las dos pruebas.',
                           tabla(['Unidad', 'Estudiantes', 'Entrada', 'Salida (META)', 'Diferencia'],
                                 [[f['etq'], f['n'], pctf(f['e']), pctf(f['s']), pts(f['s'] - f['e'])] for f in filas], num=(1, 2, 3, 4))))
        svgd, ce, cs = distribucion(es); n = len(es)
        bajo_e = round(100 * (ce[0] + ce[1]) / n); bajo_s = round(100 * (cs[0] + cs[1]) / n); alto_e = round(100 * ce[4] / n); alto_s = round(100 * cs[4] / n)
        out.append(seccion('2. ¿Cuántos estudiantes mejoran?',
                           f'de {n} pruebas comparadas (un estudiante por unidad terminada), <b>{up}</b> mejoran 10 puntos o más, {eq} quedan parecido y {dn} bajan. '
                           f'Con menos de 40 % de acierto hay un {bajo_e} % al entrar y un {bajo_s} % a la salida; con 80 % o más, un {alto_e} % al entrar y un {alto_s} % a la salida.',
                           svgb + '<div style="height:22px"></div><div class="legend"><span><i class="sw" style="background:var(--seq-1)"></i>Entrada</span>'
                           '<span><i class="sw" style="background:var(--seq-4)"></i>Salida (META)</span></div>' + svgd,
                           'la franja de arriba reparte las comparaciones en tres grupos según cuánto cambió el puntaje. '
                           'Las barras de abajo muestran qué parte de los estudiantes queda en cada tramo de acierto: si el curso funciona, las barras oscuras se cargan hacia la derecha.',
                           tabla(['Estudiante', 'Unidad', 'Entrada', 'Salida', 'Cambio'],
                                 [[d['nombre'], d['unidad'], f"{d['ae']}/{d['ne']} ({pctf(d['pe'])})", f"{d['as_']}/{d['ns']} ({pctf(d['ps'])})", pts(d['cambio'])] for d in es], num=(4,))))
    # ---------- 3. Por estación ----------
    if dvm:
        f3 = [d for d in dvm if d['n'] >= 3 and d['avance'] is not None]
        if f3:
            s3 = sorted(f3, key=lambda d: d['avance'])
            res = (f'donde más se avanza: {lista([E(d["estacion"]) + " (" + pts(d["avance"]) + ")" for d in s3[::-1][:3]])}. '
                   f'Donde menos: {lista([E(d["estacion"]) + " (" + pts(d["avance"]) + ")" for d in s3[:3]])}.')
            out.append(seccion('3. ¿En qué estaciones se avanza más y menos?', res, avance_estaciones(f3),
                               'para cada estación se compara la pregunta «Antes de empezar» con una pregunta de la META de la misma dificultad. '
                               'Los dos números son el % de acierto; la barra es la diferencia: hacia la derecha (azul) mejoran, hacia la izquierda (naranja) empeoran.',
                               tabla(['Unidad', 'Estación', 'Estudiantes', 'Al entrar', 'En la META', 'Cambio'],
                                     [[d['unidad'], d['estacion'], d['n'], pctf(d['entrada']), pctf(d['meta2']), pts(d['avance'])] for d in dvm], num=(2, 3, 4, 5))))
        m = sorted([d for d in dvm if d['nmisma'] >= 3], key=lambda d: d['misma'])
        if m:
            tot = sum(d['nmisma'] for d in m); ok = round(sum(d['misma'] * d['nmisma'] for d in m) / tot)
            out.append(seccion('4. Segunda oportunidad: la misma pregunta en la META',
                               f'de los estudiantes que fallaron u omitieron la pregunta de entrada, el {ok} % la acierta cuando le vuelve a salir en la META. '
                               f'Las estaciones donde menos se recupera son {lista([E(d["estacion"]) + " (" + pctf(d["misma"]) + ")" for d in m[:3]])}.',
                               barras(m, lambda d: f'{d["unidad"].replace("Unidad ", "")} · {d["estacion"][:44]}', lambda d: d['misma'],
                                      lambda d: f'<b>{E(d["estacion"])}</b><br>{d["nmisma"]} estudiantes fallaron u omitieron al entrar<br>Ahora la aciertan: {pctf(d["misma"])}'),
                               'cada barra es el % que ahora acierta exactamente la misma pregunta que falló u omitió al entrar. Arriba están las estaciones donde menos se recupera.',
                               tabla(['Unidad', 'Estación', 'Fallaron u omitieron', 'Ahora la aciertan'],
                                     [[d['unidad'], d['estacion'], d['nmisma'], pctf(d['misma'])] for d in m], num=(2, 3))))
    # ---------- 5. Preguntas difíciles ----------
    top = sorted([f for f in pq_filas if (f[9] or 0) >= 8 and f[11] is not None], key=lambda f: -f[11])[:12]
    if top:
        out.append(seccion('5. Las preguntas que más cuestan',
                           f'hay {sum(f[11] >= 80 for f in pq_filas if (f[9] or 0) >= 8)} preguntas en que 8 de cada 10 estudiantes o más se equivocan en el primer intento. '
                           'Conviene revisar si son difíciles a propósito o si el enunciado confunde.',
                           barras(top, lambda f: f'{f[1].replace("Unidad ", "")} · {f[3]} · {plano(f[12])[:52]}', lambda f: f[11],
                                  lambda f: f'<b>{E(f[2])}</b> · {E(f[3])} · {E(f[4])}<br>{E(plano(f[12]))}<br>{f[10]} errores en {f[9]} primeros intentos · {E(f[0])}', ancho_lbl=470),
                           '% de estudiantes que se equivoca la primera vez que responde la pregunta. Solo preguntas respondidas por al menos 8 estudiantes. Pasa el cursor para ver el enunciado completo.'))
    # ---------- 6. Mapa de calor ----------
    g = collections.OrderedDict()
    for r in sorted(prim, key=lambda r: orden.get(r['id'].split('.')[0], 999)):
        d = g.setdefault((r['unidad'], r['estacion']), collections.defaultdict(lambda: [0, 0]))
        d[r['seccion']][0] += 1; d[r['seccion']][1] += (not r['ok'])
    if g:
        secs = ['Practica', 'Aplica', 'META FINAL']
        tot = {s: [sum(d.get(s, [0, 0])[0] for d in g.values()), sum(d.get(s, [0, 0])[1] for d in g.values())] for s in secs}
        esc = ''.join(f'<span style="display:inline-block;width:34px;height:14px;background:{color_seq(v)[0]};border-radius:3px"></span>' for v in (5, 20, 35, 50, 65, 80, 95))
        t = ['<table class="heat"><tr><th>Unidad</th><th>Estación</th>' + ''.join(f'<th style="text-align:center">{s}</th>' for s in secs) + '</tr>']
        for (u, e), d in g.items():
            celdas = []
            for s in secs:
                n, k = d.get(s, [0, 0])
                if n:
                    v = 100 * k / n; bg, fg = color_seq(v)
                    celdas.append(f'<td class="c" style="background:{bg};color:{fg}" data-tip="{E(e)} · {s}: {v:.0f} % de error ({k} de {n})">{v:.0f} %</td>')
                else: celdas.append('<td class="c">—</td>')
            t.append(f'<tr><td>{E(u.replace("Unidad ", ""))}</td><td>{E(e)}</td>{"".join(celdas)}</tr>')
        t.append('</table>')
        pc = {s: (100 * tot[s][1] / tot[s][0] if tot[s][0] else 0) for s in secs}
        out.append(seccion('6. Dónde se equivocan más: Practica, Aplica y META',
                           f'en el primer intento se equivoca el {pctf(pc["Practica"])} en Practica, el {pctf(pc["Aplica"])} en Aplica y el {pctf(pc["META FINAL"])} en la META.',
                           f'<div class="legend">Menos error {esc} Más error</div>' + ''.join(t),
                           'cada celda es el % de error en el primer intento. Más oscuro = más error. Pasa el cursor para ver cuántas respuestas hay detrás.'))
    if alt_rows:
        out.append(seccion('7. Alternativas incorrectas más elegidas',
                           'estas son las preguntas de alternativas donde muchos eligen la misma respuesta equivocada: ahí conviene escribir primero el aviso por alternativa.',
                           '<table><tr><th>Estación</th><th>Pregunta</th><th>Eligen</th><th>Veces</th><th>% de los errores</th></tr>' +
                           ''.join(f'<tr><td>{E(d["unidad"].replace("Unidad ", ""))} · {E(d["estacion"])}</td><td>{E(plano(d["enun"])[:110])}</td>'
                                   f'<td>{E(d["letra"])}) {E(plano(d["texto"])[:40])}</td><td class="n">{d["veces"]}</td><td class="n">{d["pct"]:.0f} %</td></tr>' for d in alt_rows[:15]) + '</table>',
                           '«% de los errores» indica qué parte de quienes se equivocaron eligió esa alternativa. Un número alto sugiere un error de concepto común.'))
    out += ['<p class="note">Cada estudiante ve un sorteo distinto de preguntas: los porcentajes por pregunta son fiables solo con varias respuestas. '
            'El detalle completo está en el Excel que acompaña a este informe.</p>',
            f'</div><div class="tip" id="tip"></div></div><script>{JS}</script></body></html>']
    open(ruta, 'w', encoding='utf8').write('\n'.join(out))
