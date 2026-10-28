#!/usr/bin/env python3
"""Crea el paquete .zip que se abre en el editor a partir de una unidad del repositorio.
Uso:  python3 herramientas/empaquetar.py u3
Resultado: paquetes_locales/PAQUETE_UNIDAD_03.zip  (esa carpeta no se sube a GitHub)."""
import sys, os, zipfile
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) != 2 or sys.argv[1] not in ('u1', 'u2', 'u3'):
    sys.exit('Uso: python3 herramientas/empaquetar.py u1|u2|u3')
u = sys.argv[1]; n = u[1]
carpeta = os.path.join(RAIZ, 'unidades', u)
js = os.path.join(carpeta, 'unidad_0%s.json' % n)
if not os.path.isfile(js): sys.exit('No existe ' + js)
os.makedirs(os.path.join(RAIZ, 'paquetes_locales'), exist_ok=True)
destino = os.path.join(RAIZ, 'paquetes_locales', 'PAQUETE_UNIDAD_0%s.zip' % n)
with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(js, 'unidad_0%s.json' % n)
    rec = os.path.join(carpeta, 'recursos')
    if os.path.isdir(rec):
        for f in sorted(os.listdir(rec)):
            if f.startswith('.'): continue
            z.write(os.path.join(rec, f), 'recursos/' + f)
print('Listo:', destino)
print('Ábrelo en el editor con «Abrir paquete ZIP».')
