#!/usr/bin/env python3
"""Genera el catálogo de preguntas del curso PACE (ID de SiveducMD -> enunciado y respuesta correcta).

Uso:  python3 herramientas/generar_catalogo.py [CATALOGO_ANTERIOR.xlsx] [SALIDA.xlsx]
  - Sin argumentos escribe herramientas/CATALOGO_PREGUNTAS_PACE.xlsx.
  - Con un catálogo anterior agrega la hoja «IDs anteriores» (código antiguo -> nuevo).
Hay que regenerarlo cada vez que se reescribe un enunciado: el código de la pregunta depende de su texto.
Requiere: pip install openpyxl
"""
import json, os, re, sys
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
ROM = {'u1': 'Unidad I', 'u2': 'Unidad II', 'u3': 'Unidad III'}

def hash_str(t):  # igual que hashStr() del motor (FNV-1a sobre unidades UTF-16)
    h = 2166136261
    for ch in str(t):
        c = ord(ch)
        if c > 0xFFFF: c = 0xD800 + ((c - 0x10000) >> 10)
        h ^= c; h = (h * 16777619) & 0xFFFFFFFF
    return h

def b36(n):
    d = '0123456789abcdefghijklmnopqrstuvwxyz'; s = ''
    while n: s = d[n % 36] + s; n //= 36
    return s or '0'

def filas(unit):
    out = []
    for s in unit['stations']:
        items = [('Practica', q) for q in s['practice']] + [('Aplica', q) for q in ([s['check']] if s.get('check') else []) + s['checks']]
        for sec, q in items:
            h = b36(hash_str(q['q'])); k = 'P' if sec == 'Practica' else 'A'; alt = 'options' in q
            corr = '%s) %s' % (chr(97 + q['correct']), q['options'][q['correct']]) if alt else str(q['answer'])
            out.append([f"{s['id']}.{k}.{h}", f"{s['id']}.M.{h}", ROM[unit['id']], s['title'], sec,
                        'Alternativas' if alt else 'Respuesta escrita', q.get('level') if sec == 'Practica' else None,
                        re.sub(r'\s+', ' ', q['q']).strip(), corr])
        # Diagnóstico «Antes de empezar»: station.diag o, si no hay, la primera de nivel 2 de Practica (de preferencia escrita)
        d = s.get('diag') if isinstance(s.get('diag'), dict) and s['diag'].get('q') else None
        if d is None:
            L = [q for q in s['practice'] if q.get('level') == 2]
            T = [q for q in L if q.get('type') == 'input']
            d = (T or L or s['practice'] or [None])[0]
        if d:
            alt = 'options' in d
            corr = '%s) %s' % (chr(97 + d['correct']), d['options'][d['correct']]) if alt else str(d['answer'])
            out.append([f"{s['id']}.D.{b36(hash_str(d['q']))}", '', ROM[unit['id']], s['title'], 'Diagnóstico',
                        'Alternativas' if alt else 'Respuesta escrita', d.get('level'), re.sub(r'\s+', ' ', d['q']).strip(), corr])
    return out

def encabezado(ws, widths):
    for c in ws[1]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='2D2A6E')
    for col, w in zip('ABCDEFGHI', widths): ws.column_dimensions[col].width = w
    ws.freeze_panes = 'A2'

def main():
    anterior = sys.argv[1] if len(sys.argv) > 1 else None
    salida = sys.argv[2] if len(sys.argv) > 2 else os.path.join(REPO, 'herramientas', 'CATALOGO_PREGUNTAS_PACE.xlsx')
    rows = []
    for n in '123':
        rows += filas(json.load(open(f'{REPO}/unidades/u{n}/unidad_0{n}.json', encoding='utf8')))
    wb = Workbook(); ws = wb.active; ws.title = 'Catalogo'
    ws.append(['ID de la pregunta', 'ID en META FINAL', 'Unidad', 'Estación', 'Sección', 'Formato', 'Nivel', 'Enunciado', 'Respuesta correcta'])
    for r in rows: ws.append(r)
    encabezado(ws, (26, 26, 12, 28, 10, 18, 7, 90, 30))
    lm = wb.create_sheet('Léeme')
    for t in ['Catálogo de preguntas del curso PACE (Unidades I, II y III).',
              'Cada fila relaciona el ID que el curso envía a SiveducMD con la pregunta.',
              'En el informe de Interacciones el ID aparece como «estación.tipo.código»: tipo P = Practica, A = Aplica, M = META FINAL.',
              'El código es el mismo en P/A y en M: sirve para unir una pregunta con su versión en la META FINAL.',
              'Si se cambia el enunciado de una pregunta, su código cambia: hay que regenerar este catálogo (herramientas/generar_catalogo.py).']:
        lm.append([t])
    lm.column_dimensions['A'].width = 120
    if anterior:
        old = [r for r in list(load_workbook(anterior)['Catalogo'].iter_rows(values_only=True))[1:] if r[0]]
        if len(old) == len(rows):
            w2 = wb.create_sheet('IDs anteriores')
            w2.append(['ID anterior', 'ID nuevo', 'Unidad', 'Estación', 'Sección', 'Enunciado anterior', 'Enunciado nuevo'])
            for o, nw in zip(old, rows):
                if o[0] != nw[0]: w2.append([o[0], nw[0], nw[2], nw[3], nw[4], o[7], nw[7]])
            encabezado(w2, (34, 34, 12, 28, 10, 70, 70))
        else:
            print('Aviso: el catálogo anterior tiene otra cantidad de preguntas; no se arma la hoja «IDs anteriores».')
    # Preguntas de versiones anteriores (historial de git): así los informes viejos siguen teniendo enunciado.
    hist = historicas({r[0] for r in rows})
    if hist:
        w3 = wb.create_sheet('Versiones anteriores')
        w3.append(['ID de la pregunta', 'ID en META FINAL', 'Unidad', 'Estación', 'Sección', 'Formato', 'Nivel', 'Enunciado', 'Respuesta correcta', 'Versión (commit)'])
        for r in hist: w3.append(r)
        encabezado(w3, (26, 26, 12, 28, 10, 18, 7, 90, 30, 14))
    wb.save(salida); print('Listo:', salida, '·', len(rows), 'preguntas ·', len(hist), 'de versiones anteriores')


def historicas(actuales):
    import subprocess
    vistas, out = set(actuales), []
    for n in '123':
        ruta = f'unidades/u{n}/unidad_0{n}.json'
        try:
            revs = subprocess.run(['git', '-C', REPO, 'log', '--format=%h', '--', ruta], capture_output=True, text=True, check=True).stdout.split()
        except Exception:
            return out
        for rv in revs:
            try:
                unit = json.loads(subprocess.run(['git', '-C', REPO, 'show', f'{rv}:{ruta}'], capture_output=True, text=True, check=True).stdout)
                fs = filas(unit)
            except Exception:
                continue
            for r in fs:
                if r[0] not in vistas:
                    vistas.add(r[0]); out.append(list(r) + [rv])
    return out


if __name__ == '__main__':
    main()
