#!/usr/bin/env python3
"""Verificación automática de un Pull Request:
1) cada persona solo puede cambiar las rutas que le corresponden (.github/propietarios.json);
2) las unidades modificadas deben pasar la validación del editor.
Se ejecuta con el código de la rama principal; del PR solo se leen datos (nunca se ejecuta su código)."""
import json, os, re, subprocess, sys, tempfile
BASE = os.environ.get('BASE_REF', 'HEAD'); PR = os.environ.get('HEAD_REF', 'pr-head')
autor = os.environ.get('AUTOR', '').strip().lower()
def git(*a): return subprocess.check_output(['git', *a], text=True)
duenos = {k.lower(): v for k, v in json.load(open('.github/propietarios.json', encoding='utf-8')).items() if not k.startswith('_')}
cambiados = [l for l in git('diff', '--name-only', '--no-renames', BASE + '...' + PR).split('\n') if l]
print('Autor del PR:', autor or '(desconocido)'); print('Archivos modificados:', len(cambiados))
permitidas = duenos.get(autor)
errores = []
if permitidas is None:
    errores.append('«%s» no figura en .github/propietarios.json. Pide a la administración que te agregue.' % autor)
else:
    for f in cambiados:
        if f.startswith('.github/') and '*' not in permitidas: errores.append('%s: solo la administración puede cambiar .github/' % f); continue
        if not any(p == '*' or f.startswith(p) for p in permitidas): errores.append('%s: no está en tus rutas (%s)' % (f, ', '.join(permitidas)))
if errores:
    print('\n✗ PERMISOS: este PR toca archivos que no te corresponden:'); [print('  -', e) for e in errores]; sys.exit(1)
print('✓ Permisos correctos.')
fallos = 0
for f in cambiados:
    m = re.fullmatch(r'unidades/(u[1-3])/unidad_0([1-3])\.json', f)
    if not m: continue
    try: datos = git('show', PR + ':' + f)
    except subprocess.CalledProcessError: continue  # archivo borrado
    if m.group(1)[1] != m.group(2): print('✗', f, ': la carpeta y el número del archivo no coinciden'); fallos += 1; continue
    try: u = json.loads(datos)
    except Exception as e: print('✗', f, ': no es JSON válido:', e); fallos += 1; continue
    if u.get('id') != m.group(1): print('✗', f, ': el id interno (%s) no coincide con la carpeta' % u.get('id')); fallos += 1; continue
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as t: t.write(datos)
    r = subprocess.run(['node', 'herramientas/validar.js', t.name], capture_output=True, text=True); os.unlink(t.name)
    print(('✓ ' if r.returncode == 0 else '✗ ') + f + ' → ' + r.stdout.strip())
    if r.returncode: fallos += 1
if fallos: sys.exit(1)
print('✓ Todo en orden.')
