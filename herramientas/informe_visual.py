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
 --seq-1:#86b6ef;--seq-2:#3987e5;--seq-3:#1c5cab;--seq-4:#104281;--card:#ffffff;--border:#e6e5e0;color-scheme:light}
@media (prefers-color-scheme: dark){:root:where(:not([data-theme="light"])) .viz-root{--surface-1:#1a1a19;--text-primary:#f0efec;--text-secondary:#c3c2b7;
 --text-muted:#9a998f;--grid:#33332f;--axis:#4a4a45;--seq-1:#256abf;--seq-2:#3987e5;--seq-3:#6da7ec;--seq-4:#9ec5f4;--card:#222220;--border:#33332f;color-scheme:dark}}
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
.badge{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid var(--border);color:var(--text-secondary);margin-right:4px}
"""

JS = """document.querySelectorAll('[data-tip]').forEach(el=>{const t=document.getElementById('tip');
el.addEventListener('mousemove',e=>{t.innerHTML=el.dataset.tip;t.style.display='block';const x=Math.min(e.clientX+14,innerWidth-t.offsetWidth-8);t.style.left=x+'px';t.style.top=(e.clientY+14)+'px';});
el.addEventListener('mouseleave',()=>{t.style.display='none';});});"""

def pctf(v): return '—' if v is None else (f'{v:.0f} %')

def dumbbell(rows):
    """Antes de empezar (claro) -> META nivel 2 (oscuro), por estación, agrupado por unidad."""
    W, L, R = 1000, 300, 70; x = lambda v: L + (W - L - R) * v / 100
    y = 30; parts = []
    for v in (0, 25, 50, 75, 100):
        parts.append(f'<line class="grid" x1="{x(v):.1f}" x2="{x(v):.1f}" y1="18" y2="__H__"/><text class="t-mut" x="{x(v):.1f}" y="12" text-anchor="middle">{v} %</text>')
    unidad = None
    for d in rows:
        if d['unidad'] != unidad:
            unidad = d['unidad']; y += 10
            parts.append(f'<text class="t-unit" x="0" y="{y + 4}">{E(unidad)}</text>'); y += 22
        a, b = d['entrada'], d['meta2']
        tip = (f"<b>{E(d['estacion'])}</b><br>{d['n']} estudiantes con diagnóstico y META<br>Al entrar: {pctf(a)} · META (nivel 2): {pctf(b)}"
               f"<br>Avance: {'—' if d['avance'] is None else ('%+.0f puntos' % d['avance'])}")
        parts.append(f'<g data-tip="{E(tip)}"><rect class="hit" x="0" y="{y - 12}" width="{W}" height="24" rx="4"/>')
        parts.append(f'<text class="t-lbl" x="12" y="{y + 4}">{E(d["estacion"][:38])}</text><text class="t-mut" x="{L - 12}" y="{y + 4}" text-anchor="end">n={d["n"]}</text>')
        if a is not None and b is not None:
            parts.append(f'<line x1="{x(a):.1f}" x2="{x(b):.1f}" y1="{y}" y2="{y}" stroke="var(--seq-2)" stroke-width="2"/>')
        if a is not None: parts.append(f'<circle cx="{x(a):.1f}" cy="{y}" r="6" fill="var(--seq-1)" stroke="var(--card)" stroke-width="2"/>')
        if b is not None: parts.append(f'<circle cx="{x(b):.1f}" cy="{y}" r="6" fill="var(--seq-4)" stroke="var(--card)" stroke-width="2"/>')
        if d['avance'] is not None:
            parts.append(f'<text class="t-val" x="{W - R + 12}" y="{y + 4}">{d["avance"]:+.0f}</text>')
        parts.append('</g>'); y += 26
    H = y + 4
    return f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="Acierto al entrar y en la META por estación">' + ''.join(parts).replace('__H__', str(H - 10)) + '</svg>'

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
    H = y
    return f'<svg viewBox="0 0 {W} {H}" width="100%" role="img">' + ''.join(parts).replace('__H__', str(H - 8)) + '</svg>'

def color_seq(v):
    """% error -> fondo del mapa de calor (un solo tono, más oscuro = más error)."""
    steps = ['#eef4fd', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']
    i = min(len(steps) - 1, int(v / 100 * len(steps)))
    return steps[i], ('#ffffff' if i >= 4 else '#0b0b0b')

def generar(ruta, fuente, reg, diag, dvm, alt_rows, pq_filas, orden=None):
    orden = orden or {}
    est = {r['correo'] for r in reg} | {r['correo'] for r in diag}
    prim = [r for r in reg if r.get('primero')]
    err1 = round(100 * sum(not r['ok'] for r in prim) / len(prim), 1) if prim else 0
    meta_est = {r['correo'] for r in reg if r['seccion'] == 'META FINAL'}
    omit = round(100 * sum(r['nosabe'] for r in diag) / len(diag)) if diag else 0
    pares = [d for d in dvm if d['avance'] is not None]
    av = round(sum(d['avance'] * d['n'] for d in pares) / sum(d['n'] for d in pares)) if pares else None
    mis = [d for d in dvm if d['nmisma']]
    mis_pct = round(sum(d['misma'] * d['nmisma'] for d in mis) / sum(d['nmisma'] for d in mis)) if mis else None
    out = [f'<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>Informe de respuestas · curso PACE</title><style>{CSS}</style></head><body><div class="viz-root"><div class="wrap">',
           f'<h1>Informe de respuestas · curso PACE</h1><p class="sub">Fuente: {E(fuente.split("/")[-1])} · generado el {datetime.datetime.now():%d-%m-%Y %H:%M}</p>',
           ('<p style="border:1px dashed var(--axis);border-radius:10px;padding:8px 12px;color:var(--text-secondary);font-size:13px">'
            '<b>Datos simulados.</b> Estudiantes ficticios generados con herramientas/simular_siveduc.py para probar el informe; '
            'no corresponden a estudiantes reales.</p>' if 'SIMULACION' in fuente.upper() else ''),
           '<div class="kpis">',
           f'<div class="kpi"><b>{len(est)}</b><span>estudiantes con respuestas</span></div>',
           f'<div class="kpi"><b>{len(reg):,}</b>'.replace(',', '.') + '<span>respuestas en Practica, Aplica y META</span></div>',
           f'<div class="kpi"><b>{err1:.0f} %</b><span>de error en el primer intento</span></div>',
           f'<div class="kpi"><b>{len(meta_est)}</b><span>rindieron al menos una META FINAL</span></div>',
           f'<div class="kpi"><b>{"—" if av is None else "%+d" % av}</b><span>puntos de avance promedio, de «Antes de empezar» a la META</span></div>',
           f'<div class="kpi"><b>{"—" if mis_pct is None else str(mis_pct) + " %"}</b><span>de quienes fallaron u omitieron al entrar acierta la misma pregunta en la META</span></div>',
           '</div>']
    if dvm:
        filas = [d for d in dvm if d['n'] >= 3]
        out += ['<div class="card"><h2>¿Cuánto avanzan en cada estación?</h2>',
                '<p class="lead">Porcentaje que acierta la pregunta de «Antes de empezar» y porcentaje que acierta la pregunta de nivel 2 de esa estación en la META FINAL '
                '(misma dificultad). Solo estudiantes que tienen ambas. A la derecha, el avance en puntos.</p>',
                '<div class="legend"><span><i class="sw" style="background:var(--seq-1)"></i>Al entrar («Antes de empezar»)</span>'
                '<span><i class="sw" style="background:var(--seq-4)"></i>En la META FINAL (nivel 2)</span></div>',
                dumbbell(filas),
                f'<p class="note">Se muestran estaciones con al menos 3 estudiantes ({len(filas)} de {len(dvm)}). Con pocos estudiantes, los porcentajes cambian mucho.</p>',
                '<details><summary>Ver la tabla</summary><table><tr><th>Unidad</th><th>Estación</th><th>n</th><th>Al entrar</th><th>META nivel 2</th><th>Avance</th><th>META (3 preguntas)</th></tr>' +
                ''.join(f'<tr><td>{E(d["unidad"])}</td><td>{E(d["estacion"])}</td><td class="n">{d["n"]}</td><td class="n">{pctf(d["entrada"])}</td><td class="n">{pctf(d["meta2"])}</td>'
                        f'<td class="n">{"—" if d["avance"] is None else "%+.0f" % d["avance"]}</td><td class="n">{pctf(d["meta"])}</td></tr>' for d in dvm) +
                '</table></details></div>']
        m = sorted([d for d in dvm if d['nmisma'] >= 3], key=lambda d: d['misma'])
        if m:
            out += ['<div class="card"><h2>La misma pregunta, antes y después</h2>',
                    '<p class="lead">Quien falla u omite la pregunta de «Antes de empezar» la vuelve a encontrar en la META FINAL. '
                    'Porcentaje que ahora la acierta, por estación (de menor a mayor: arriba, donde menos se logra).</p>',
                    barras(m, lambda d: f'{d["unidad"].replace("Unidad ", "")} · {d["estacion"][:44]}', lambda d: d['misma'],
                           lambda d: f'<b>{E(d["estacion"])}</b><br>{d["nmisma"]} estudiantes fallaron u omitieron al entrar y la tuvieron en la META<br>Ahora la aciertan: {pctf(d["misma"])}'),
                    '</div>']
    top = [f for f in pq_filas if (f[9] or 0) >= 8 and f[11] is not None]
    top.sort(key=lambda f: -f[11]); top = top[:12]
    if top:
        out += ['<div class="card"><h2>Las preguntas que más cuestan</h2>',
                '<p class="lead">Porcentaje de error en el primer intento (preguntas con al menos 8 primeros intentos). Pasa el cursor para ver el enunciado completo.</p>',
                barras(top, lambda f: f'{f[1].replace("Unidad ", "")} · {f[3]} · {plano(f[12])[:52]}', lambda f: f[11],
                       lambda f: f'<b>{E(f[2])}</b> · {E(f[3])} · {E(f[4])}<br>{E(plano(f[12]))}<br>{f[10]} errores en {f[9]} primeros intentos · {E(f[0])}', ancho_lbl=470),
                '</div>']
    # mapa de calor estación x sección
    g = collections.OrderedDict()
    for r in sorted(prim, key=lambda r: orden.get(r['id'].split('.')[0], 999)):
        d = g.setdefault((r['unidad'], r['estacion']), collections.defaultdict(lambda: [0, 0]))
        d[r['seccion']][0] += 1; d[r['seccion']][1] += (not r['ok'])
    if g:
        secs = ['Practica', 'Aplica', 'META FINAL']
        out += ['<div class="card"><h2>Error en el primer intento, por estación y sección</h2>',
                '<p class="lead">Más oscuro = más error. Entre paréntesis, la cantidad de primeros intentos.</p>',
                '<table class="heat"><tr><th>Unidad</th><th>Estación</th>' + ''.join(f'<th style="text-align:center">{s}</th>' for s in secs) + '</tr>']
        for (u, e), d in g.items():
            celdas = []
            for s in secs:
                n, k = d.get(s, [0, 0])
                if n:
                    v = 100 * k / n; bg, fg = color_seq(v)
                    celdas.append(f'<td class="c" style="background:{bg};color:{fg}" data-tip="{E(e)} · {s}: {v:.0f} % de error ({k} de {n})">{v:.0f} % <small>({n})</small></td>')
                else: celdas.append('<td class="c">—</td>')
            out.append(f'<tr><td>{E(u)}</td><td>{E(e)}</td>{"".join(celdas)}</tr>')
        out.append('</table></div>')
    if alt_rows:
        out += ['<div class="card"><h2>Alternativas incorrectas más elegidas</h2>',
                '<p class="lead">Dónde conviene escribir primero el aviso por alternativa (sugerencia #13): la alternativa incorrecta que más se elige en cada pregunta.</p>',
                '<table><tr><th>Estación</th><th>Pregunta</th><th>Eligen</th><th>Veces</th><th>% de los errores</th></tr>' +
                ''.join(f'<tr><td>{E(d["unidad"].replace("Unidad ", ""))} · {E(d["estacion"])}</td><td>{E(plano(d["enun"])[:110])}</td>'
                        f'<td>{E(d["letra"])}) {E(plano(d["texto"])[:40])}</td><td class="n">{d["veces"]}</td><td class="n">{d["pct"]:.0f} %</td></tr>' for d in alt_rows[:15]) +
                '</table></div>']
    out += ['<p class="note">Notas: cada estudiante ve un sorteo distinto de preguntas, así que los porcentajes por pregunta son fiables solo con varias respuestas. '
            'El «primer intento» cuenta solo la primera respuesta de cada estudiante a cada pregunta. El detalle completo está en el Excel que acompaña a este informe.</p>',
            f'</div><div class="tip" id="tip"></div></div><script>{JS}</script></body></html>']
    open(ruta, 'w', encoding='utf8').write('\n'.join(out))
