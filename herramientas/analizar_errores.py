#!/usr/bin/env python3
"""Analiza el informe de Interacciones de SiveducMD (curso PACE).

Uso:
  python3 analizar_errores.py INFORME.xlsx CATALOGO_PREGUNTAS_PACE.xlsx [SALIDA.xlsx] [--excluir correo1,correo2]

Genera un Excel con: resumen general, errores por pregunta, por estación, por sección y formato,
y el detalle de cada respuesta. Requiere: pip install openpyxl
"""
import sys, os, re, collections, openpyxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from openpyxl.styles import Font, PatternFill, Alignment

def leer_informe(ruta, excluir):
    ws = openpyxl.load_workbook(ruta, data_only=True).active
    filas = list(ws.iter_rows(values_only=True))
    enc = [str(c) if c is not None else '' for c in filas[0]]
    grupos = {}
    for j, h in enumerate(enc):
        m = re.fullmatch(r'(Pregunta|Respuesta correcta|Respuesta|Resultado) (\d+)', h)
        if m: grupos.setdefault(int(m.group(2)), {})[m.group(1)] = j
    ix = {h: j for j, h in enumerate(enc)}
    reg = []
    for f in filas[1:]:
        correo = (f[ix['Dirección de correo']] or '').strip().lower()
        if correo in excluir: continue
        for n in sorted(grupos):
            g = grupos[n]
            qid = f[g['Pregunta']]
            if not qid: continue
            reg.append(dict(nombre=f[ix['Nombre']], correo=correo, intento=f[ix['Intento']], n=n, id=str(qid),
                            resp=f[g.get('Respuesta')] if 'Respuesta' in g else None,
                            corr=f[g['Respuesta correcta']] if 'Respuesta correcta' in g else None,
                            ok=str(f[g['Resultado']]).strip().lower() == 'correct',
                            nosabe=str(f[g['Resultado']]).strip().lower() == 'neutral' or str(f[g.get('Respuesta')] if 'Respuesta' in g else '').strip() == '?'))
    return reg

def leer_catalogo(ruta):
    wb = openpyxl.load_workbook(ruta, data_only=True)
    cat = {}
    hojas = [('Catalogo', '')] + ([('Versiones anteriores', '(versión anterior) ')] if 'Versiones anteriores' in wb.sheetnames else [])
    for hoja, marca in hojas:
        for r in list(wb[hoja].iter_rows(values_only=True))[1:]:
            if not r[0] or r[0] in cat: continue
            info = dict(unidad=r[2], estacion=r[3], seccion=r[4], formato=r[5], nivel=r[6], enunciado=marca + str(r[7] or ''), correcta=r[8],
                        alts=(r[9] if hoja == 'Catalogo' and len(r) > 9 else '') or '')
            cat[r[0]] = info
            if r[1]: cat[r[1]] = dict(info, seccion='META FINAL')
    return cat

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    excluir = set()
    if '--excluir' in sys.argv:
        excluir = {c.strip().lower() for c in sys.argv[sys.argv.index('--excluir') + 1].split(',')}
        a = [x for x in a if x != sys.argv[sys.argv.index('--excluir') + 1]]
    if len(a) < 2: sys.exit(__doc__)
    reg = leer_informe(a[0], excluir); cat = leer_catalogo(a[1])
    salida = a[2] if len(a) > 2 else 'ANALISIS_ERRORES.xlsx'
    sin = sorted({r['id'] for r in reg if r['id'] not in cat})
    for r in reg:
        c = cat.get(r['id'], {})
        r.update(unidad=c.get('unidad', '?'), estacion=c.get('estacion', '?'), seccion=c.get('seccion', '?'),
                 formato=c.get('formato', '?'), enun=c.get('enunciado', ''), nivel=c.get('nivel'), alts=c.get('alts', ''))
    diag = [r for r in reg if '.D.' in r['id']]
    for r in diag: r['seccion'] = 'Diagnóstico'
    reg = [r for r in reg if '.D.' not in r['id']]
    # primer intento de cada estudiante en cada pregunta
    visto = set()
    for r in sorted(reg, key=lambda r: (r['correo'], str(r['intento']), r['n'])):
        k = (r['correo'], r['intento'], r['id']); r['primero'] = k not in visto; visto.add(k)

    def agrupar(clave):
        g = collections.OrderedDict()
        for r in reg:
            d = g.setdefault(clave(r), dict(resp=0, err=0, est=set(), p=0, perr=0))
            d['resp'] += 1; d['err'] += (not r['ok']); d['est'].add(r['correo'])
            if r['primero']: d['p'] += 1; d['perr'] += (not r['ok'])
        return g
    def fila(k, d):
        pct = lambda e, t: round(100 * e / t, 1) if t else None
        return [*k, d['resp'], d['err'], pct(d['err'], d['resp']), len(d['est']), d['p'], d['perr'], pct(d['perr'], d['p'])]

    wb = openpyxl.Workbook()
    def hoja(nombre, enc, filas, anchos):
        ws = wb.create_sheet(nombre); ws.append(enc)
        for f in filas: ws.append(f)
        for c in ws[1]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='2B2A6B'); c.alignment = Alignment(wrap_text=True, vertical='center')
        for i, w in enumerate(anchos): ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w
        ws.freeze_panes = 'A2'; ws.auto_filter.ref = ws.dimensions
        return ws
    cab = ['Respuestas', 'Errores', '% error', 'Estudiantes', 'Primeros intentos', 'Errores en 1.er intento', '% error 1.er intento']
    n_est = len({r['correo'] for r in reg})
    res = wb.active; res.title = 'Resumen'
    for l in [['Análisis de errores · curso PACE'], [], ['Estudiantes con respuestas', n_est], ['Respuestas registradas', len(reg)],
              ['Errores', sum(not r['ok'] for r in reg)],
              ['% de error', round(100 * sum(not r['ok'] for r in reg) / len(reg), 1) if reg else None],
              ['Preguntas distintas', len({r['id'] for r in reg})],
              ['Preguntas sin coincidencia en el catálogo', len(sin)], [],
              ['Notas'], ['· Cada estudiante ve un sorteo distinto de preguntas: los % por pregunta solo son fiables con varias respuestas (ver columna Respuestas).'],
              ['· «1.er intento» cuenta solo la primera respuesta de cada estudiante a cada pregunta; es la mejor medida de dificultad.'],
              ['· Las respuestas escritas correctas pero sin simplificar cuentan como error.']]:
        res.append(l)
    res['A1'].font = Font(bold=True, size=14); res.column_dimensions['A'].width = 60; res.column_dimensions['B'].width = 14
    pq = agrupar(lambda r: (r['id'], r['unidad'], r['estacion'], r['seccion'], r['formato']))
    filas = []
    for k, d in pq.items():
        enun = next((r['enun'] for r in reg if r['id'] == k[0]), '')
        filas.append(fila(k, d) + [enun])
    filas.sort(key=lambda f: (-(f[10] if f[10] is not None else -1), -f[8]))
    hoja('Por pregunta', ['ID', 'Unidad', 'Estación', 'Sección', 'Formato'] + cab + ['Enunciado'], filas, [22, 11, 32, 12, 15, 11, 9, 9, 11, 11, 11, 11, 70])
    hoja('Por estación', ['Unidad', 'Estación'] + cab, [fila(k, d) for k, d in agrupar(lambda r: (r['unidad'], r['estacion'])).items()], [11, 34] + [12] * 7)
    hoja('Por sección y formato', ['Sección', 'Formato'] + cab, [fila(k, d) for k, d in agrupar(lambda r: (r['seccion'], r['formato'])).items()], [14, 18] + [12] * 7)
    hoja('Detalle', ['Estudiante', 'Correo', 'Intento', 'N.º', 'ID', 'Unidad', 'Estación', 'Sección', 'Formato', 'Respuesta', 'Correcta', 'Correcto', '1.er intento'],
         [[r['nombre'], r['correo'], r['intento'], r['n'], r['id'], r['unidad'], r['estacion'], r['seccion'], r['formato'], r['resp'], r['corr'], 'sí' if r['ok'] else 'no', 'sí' if r['primero'] else 'no'] for r in reg],
         [30, 30, 8, 6, 22, 11, 30, 12, 15, 18, 18, 10, 11])
    if diag:
        g = collections.OrderedDict()
        for r in diag:
            d = g.setdefault((r['unidad'], r['estacion']), dict(n=0, ok=0, mal=0, ns=0, enun=r['enun']))
            d['n'] += 1; d['ok'] += r['ok']; d['ns'] += r['nosabe']; d['mal'] += (not r['ok'] and not r['nosabe'])
        pe = agrupar(lambda r: (r['unidad'], r['estacion']))
        pct = lambda a, b: round(100 * a / b, 1) if b else None
        filas_d = []
        for k, d in g.items():
            pr = pe.get(k)
            filas_d.append([*k, d['n'], d['ok'], d['mal'], d['ns'], pct(d['ok'], d['n']), pct(d['ns'], d['n']),
                            pct(pr['p'] - pr['perr'], pr['p']) if pr else None, d['enun']])
        hoja('Diagnóstico', ['Unidad', 'Estación', 'Estudiantes', 'Aciertan', 'Se equivocan', 'Omitieron', '% acierto al entrar', '% omitieron',
                             '% acierto en Practica (1.er intento)', 'Pregunta de diagnóstico'], filas_d, [11, 32, 11, 10, 12, 13, 12, 11, 16, 70])
        res.append([]); res.append(['Diagnóstico «Antes de empezar»', len(diag)])
        res.append(['· Ver la hoja «Diagnóstico»: compara cómo llegan a cada estación con cómo les va en su Practica. No se incluye en los totales de arriba.'])
    # ---------- Diagnóstico vs META FINAL ----------
    sid = lambda r: r['id'].split('.')[0]
    hsh = lambda r: r['id'].split('.')[-1]
    orden = {}
    for k in cat:
        orden.setdefault(k.split('.')[0], len(orden))
    meta = [r for r in reg if r['seccion'] == 'META FINAL']
    dvm = []
    if diag and meta:
        ent = {}
        for r in diag: ent[(r['correo'], sid(r))] = ('acierta' if r['ok'] else 'omite' if r['nosabe'] else 'falla', hsh(r), r)
        mt = collections.defaultdict(list)
        for r in meta: mt[(r['correo'], sid(r))].append(r)
        por_est = collections.defaultdict(list)
        for k in ent:
            if k in mt: por_est[k[1]].append(k)
        pct = lambda a, b: round(100 * a / b, 1) if b else None
        for st in sorted(por_est, key=lambda x: orden.get(x, 999)):
            ks = por_est[st]; e0 = ent[ks[0]][2]
            n2 = [next((m for m in mt[k] if m['nivel'] == 2), None) for k in ks]
            todas = [m for k in ks for m in mt[k]]
            tr = collections.Counter()
            for k, m in zip(ks, n2):
                if m: tr[(ent[k][0], 'acierta' if m['ok'] else 'falla')] += 1
            mis = [(k, next((m for m in mt[k] if hsh(m) == ent[k][1]), None)) for k in ks if ent[k][0] != 'acierta']
            mis = [m for k, m in mis if m]
            e_ok = sum(ent[k][0] == 'acierta' for k in ks)
            n2v = [m for m in n2 if m]
            fila_d = dict(unidad=e0['unidad'], estacion=e0['estacion'], sid=st, n=len(ks), entrada=pct(e_ok, len(ks)),
                          meta2=pct(sum(m['ok'] for m in n2v), len(n2v)), meta=pct(sum(m['ok'] for m in todas), len(todas)),
                          nfo=sum(ent[k][0] != 'acierta' for k in ks), nmisma=len(mis), misma=pct(sum(m['ok'] for m in mis), len(mis)), tr=tr)
            fila_d['avance'] = round(fila_d['meta2'] - fila_d['entrada'], 1) if fila_d['meta2'] is not None and fila_d['entrada'] is not None else None
            dvm.append(fila_d)
        T = ['acierta', 'falla', 'omite']
        hoja('Diagnóstico vs META', ['Unidad', 'Estación', 'Estudiantes con diagnóstico y META', '% acierto al entrar', '% acierto META (nivel 2)',
                                     'Avance (puntos)', '% acierto META (3 preguntas)', 'Fallaron u omitieron al entrar',
                                     'De ellos, con la misma pregunta en la META', '% que ahora la acierta'] +
             [f'{a.capitalize()} al entrar → {b} en META' for a in T for b in ('acierta', 'falla')],
             [[d['unidad'], d['estacion'], d['n'], d['entrada'], d['meta2'], d['avance'], d['meta'], d['nfo'], d['nmisma'], d['misma']] +
              [d['tr'][(a, b)] for a in T for b in ('acierta', 'falla')] for d in dvm],
             [11, 32, 13, 11, 12, 10, 12, 12, 14, 12] + [12] * 6)
        res.append([]); res.append(['Diagnóstico vs META FINAL: ver la hoja «Diagnóstico vs META».'])
        res.append(['· Compara, por estación, el acierto al entrar con el acierto en la pregunta de nivel 2 de la META (misma dificultad).'])
        res.append(['· Quien falló u omitió al entrar recibe en la META la MISMA pregunta: «% que ahora la acierta» es la comparación exacta.'])
    # ---------- Alternativas incorrectas más elegidas ----------
    malas = collections.defaultdict(collections.Counter); info_q = {}
    for r in reg + diag:
        if r['formato'] == 'Alternativas' and not r['ok'] and not r['nosabe'] and r['resp']:
            k = (sid(r), hsh(r)); malas[k][str(r['resp']).strip().lower()] += 1; info_q.setdefault(k, r)
    alt_rows = []
    for k, c in malas.items():
        letra, veces = c.most_common(1)[0]; r = info_q[k]; tot = sum(c.values())
        txt = next((a.split(') ', 1)[1] for a in str(r['alts']).split(' | ') if a.startswith(letra + ')')), '')
        alt_rows.append(dict(unidad=r['unidad'], estacion=r['estacion'], enun=r['enun'], letra=letra, texto=txt, veces=veces, tot=tot,
                             pct=round(100 * veces / tot, 1), id=r['id'].replace('.M.', '.P.')))
    alt_rows.sort(key=lambda d: (-d['veces'], -d['pct']))
    if alt_rows:
        hoja('Alternativas incorrectas', ['Unidad', 'Estación', 'Enunciado', 'Alternativa más elegida', 'Texto', 'Veces elegida', '% de los errores', 'Errores totales', 'ID'],
             [[d['unidad'], d['estacion'], d['enun'], d['letra'], d['texto'], d['veces'], d['pct'], d['tot'], d['id']] for d in alt_rows],
             [11, 30, 60, 10, 30, 10, 10, 10, 22])
    if sin: hoja('Sin catálogo', ['ID sin coincidencia'], [[s] for s in sin], [40])
    wb.save(salida); print('Listo:', salida, '|', len(reg), 'respuestas |', n_est, 'estudiantes |', len(sin), 'ID sin catálogo')
    try:
        import informe_visual
        html = re.sub(r'\.xlsx$', '', salida) + '.html'
        informe_visual.generar(html, a[0], reg, diag, dvm, alt_rows, pq_filas=filas, orden=orden)
        print('Informe visual:', html)
    except Exception as e:
        print('Aviso: no se pudo generar el informe visual:', e)
main()
