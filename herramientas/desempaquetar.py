#!/usr/bin/env python3
"""Copia al repositorio el trabajo que descargaste del editor (ENTREGA_UNIDAD_0X.zip o un paquete).
Uso:  python3 herramientas/desempaquetar.py ~/Descargas/ENTREGA_UNIDAD_03.zip
Detecta la unidad por el nombre del archivo unidad_0X.json que trae dentro."""
import sys, os, re, zipfile, json
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) != 2: sys.exit('Uso: python3 herramientas/desempaquetar.py ruta/al/ENTREGA_UNIDAD_0X.zip')
with zipfile.ZipFile(sys.argv[1]) as z:
    nombres = z.namelist()
    js = [n for n in nombres if re.fullmatch(r'unidad_0[1-3]\.json', n)]
    if len(js) != 1: sys.exit('El ZIP debe tener exactamente un unidad_01/02/03.json en la raíz.')
    n = js[0][8]; destino = os.path.join(RAIZ, 'unidades', 'u' + n)
    datos = z.read(js[0])
    u = json.loads(datos)
    if u.get('id') != 'u' + n: sys.exit('El id dentro del archivo no coincide con su nombre.')
    os.makedirs(os.path.join(destino, 'recursos'), exist_ok=True)
    open(os.path.join(destino, js[0]), 'wb').write(datos)
    copiados = 0
    for nom in nombres:
        if re.fullmatch(r'recursos/[A-Za-z0-9][A-Za-z0-9._-]{0,115}', nom):
            open(os.path.join(destino, nom), 'wb').write(z.read(nom)); copiados += 1
print('Unidad', n, 'actualizada en', destino, '·', copiados, 'recurso(s) copiado(s).')
print('Ahora abre GitHub Desktop, revisa los cambios y haz Commit.')
