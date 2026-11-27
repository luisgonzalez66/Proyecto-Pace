#!/usr/bin/env python3
"""Genera la app de informe estadístico del curso PACE: informe/index.html (un solo archivo, funciona sin conexión).

Uso:  python3 herramientas/informe_app/generar_app.py [SALIDA.html]

La página lleva incluidos:
  · el catálogo de preguntas (herramientas/CATALOGO_PREGUNTAS_PACE.xlsx: ID -> estación, sección, formato, nivel, enunciado, respuesta),
  · la estructura del curso (unidades, bloques y estaciones, desde unidades/uN/unidad_0N.json),
  · SheetJS (vendor/xlsx.full.min.js, licencia Apache 2.0) para leer el Excel de SiveducMD y escribir el informe en Excel.
Los datos de los estudiantes se procesan en el navegador: no se envían a ningún servidor.
Hay que regenerarla cuando cambia el catálogo (lo hace el flujo de publicación automáticamente).
Requiere: pip install openpyxl
"""
import json, os, sys, datetime, subprocess
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
SALIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, 'informe', 'index.html')
ROM = {'u1': 'I', 'u2': 'II', 'u3': 'III'}

# ---------- estructura del curso ----------
est, orden = [], 0
for n in '123':
    u = json.load(open(f'{REPO}/unidades/u{n}/unidad_0{n}.json', encoding='utf8'))
    grupos = u.get('groups') or []
    for s in u['stations']:
        g = s.get('group', 0)
        gt = grupos[g]['title'] if g < len(grupos) and isinstance(grupos[g], dict) else f'Bloque {g + 1}'
        est.append(dict(id=s['id'], u='u' + n, ur=ROM['u' + n], ut=u.get('title', ''), b=g + 1, bt=gt, t=s.get('title', s['id']), o=orden))
        orden += 1

# ---------- catálogo ----------
wb = openpyxl.load_workbook(os.path.join(REPO, 'herramientas', 'CATALOGO_PREGUNTAS_PACE.xlsx'), read_only=True, data_only=True)
cat = {}
def agrega(hoja, antigua):
    if hoja not in wb.sheetnames: return
    for r in list(wb[hoja].iter_rows(values_only=True))[1:]:
        if not r or not r[0]: continue
        pid = str(r[0])
        if pid in cat: continue
        alts = (r[9] if hoja == 'Catalogo' and len(r) > 9 else '') or ''
        e = [r[4] or '', r[5] or '', int(r[6]) if str(r[6] or '').isdigit() else None, str(r[7] or ''), str(r[8] or ''), str(alts), 1 if antigua else 0]
        cat[pid] = e
        if r[1]: cat.setdefault(str(r[1]), ['META FINAL'] + e[1:])
agrega('Catalogo', False); agrega('Versiones anteriores', True)

try: ver = subprocess.run(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
except Exception: ver = ''
DATA = dict(generado=datetime.datetime.now().strftime('%d-%m-%Y %H:%M'), version=ver, est=est, cat=cat)

leer = lambda f: open(os.path.join(HERE, f), encoding='utf8').read()
html = leer('plantilla.html')
html = html.replace('/*ESTILOS*/', leer('estilos.css'))
html = html.replace('/*SHEETJS*/', leer('vendor/xlsx.full.min.js').replace('</script', '<\\/script'))
html = html.replace('/*DATOS*/', 'const PACE=' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';')
html = html.replace('/*APP*/', leer('app.js'))
os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
open(SALIDA, 'w', encoding='utf8').write(html)
print('Listo:', SALIDA, f'| {len(est)} estaciones | {len(cat)} ID en el catálogo | {round(len(html) / 1048576, 1)} MB')
