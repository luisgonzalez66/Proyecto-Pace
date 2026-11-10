#!/usr/bin/env python3
"""Analiza el informe de Interacciones de SiveducMD (curso PACE).

Uso:
  python3 analizar_errores.py INFORME.xlsx CATALOGO_PREGUNTAS_PACE.xlsx [SALIDA.xlsx] [--excluir correo1,correo2]

Genera un Excel con: resumen general, errores por pregunta, por estación, por sección y formato,
y el detalle de cada respuesta. Requiere: pip install openpyxl
"""
import sys, re, collections, openpyxl
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
                            ok=str(f[g['Resultado']]).strip().lower() == 'correct'))
    return reg

def leer_catalogo(ruta):
    ws = openpyxl.load_workbook(ruta, data_only=True)['Catalogo']
    cat = {}
    for r in list(ws.iter_rows(values_only=True))[1:]:
        if not r[0]: continue
        info = dict(unidad=r[2], estacion=r[3], seccion=r[4], formato=r[5], nivel=r[6], enunciado=r[7], correcta=r[8])
        cat[r[0]] = info
        cat[r[1]] = dict(info, seccion='META FINAL')
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
                 formato=c.get('formato', '?'), enun=c.get('enunciado', ''))
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
    if sin: hoja('Sin catálogo', ['ID sin coincidencia'], [[s] for s in sin], [40])
    wb.save(salida); print('Listo:', salida, '|', len(reg), 'respuestas |', n_est, 'estudiantes |', len(sin), 'ID sin catálogo')
main()
