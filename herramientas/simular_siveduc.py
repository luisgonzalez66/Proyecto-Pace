#!/usr/bin/env python3
"""Genera un informe de Interacciones de SiveducMD SIMULADO (mismo formato que exporta Moodle), para probar
herramientas/analizar_errores.py antes de tener estudiantes reales.

Uso:  python3 herramientas/simular_siveduc.py [N_ESTUDIANTES] [SALIDA.xlsx] [SEMILLA]

Modelo (ficticio, solo para probar la herramienta):
  · cada estudiante tiene una habilidad θ ~ N(0, 1) y avanza una cantidad variable de estaciones por unidad;
  · cada estación tiene una dificultad y un «efecto de aprendizaje» distintos;
  · «Antes de empezar»: acierta con probabilidad σ(θ − dificultad); si no, omite (más probable si θ es bajo) o se equivoca;
  · Practica y Aplica siguen las cuotas del curso (2·2·1 por nivel; Aplica 2 en la Unidad I y 5 en las otras),
    con reintentos hasta acertar; en alternativas, los errores se concentran en una alternativa incorrecta «típica»;
  · META FINAL oficial para quien termina la unidad: por estación, una de nivel 2 (la del diagnóstico si la falló u omitió),
    y otra que alterna entre estaciones (nivel 3 / Aplica); la probabilidad de acierto incluye lo aprendido en la estación.
Los ID se calculan igual que el curso (estación.SECCIÓN.código del enunciado), así que el catálogo real los reconoce.
"""
import json, math, os, random, sys
import openpyxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generar_catalogo import hash_str, b36, REPO

N = int(sys.argv[1]) if len(sys.argv) > 1 else 60
SALIDA = sys.argv[2] if len(sys.argv) > 2 else 'SIMULACION_informe_interacciones.xlsx'
rnd = random.Random(int(sys.argv[3]) if len(sys.argv) > 3 else 2026)
sig = lambda z: 1 / (1 + math.exp(-z))
NOMBRES = ['Ana', 'Benjamín', 'Camila', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Héctor', 'Isidora', 'Javier', 'Karen', 'Lucas',
           'Martina', 'Nicolás', 'Olivia', 'Pablo', 'Renata', 'Sebastián', 'Trinidad', 'Vicente']
APELL = ['Rojas', 'Muñoz', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Torres', 'Fuentes', 'Araya', 'Castillo']

unidades = [json.load(open(f'{REPO}/unidades/u{n}/unidad_0{n}.json', encoding='utf8')) for n in '123']
EST = []
for u in unidades:
    for s in u['stations']:
        L = [q for q in s['practice'] if q.get('level') == 2]; T = [q for q in L if q.get('type') == 'input']
        d = s['diag'] if isinstance(s.get('diag'), dict) and s['diag'].get('q') else (T or L or s['practice'])[0]
        EST.append(dict(u=u['id'], s=s, diag=d, checks=([s['check']] if s.get('check') else []) + s['checks'],
                        drawCheck=s.get('drawCheck') or 5, dif=rnd.gauss(0.2, 0.7), gan=rnd.uniform(0.6, 2.2)))

def qid(e, k, q): return f"{e['s']['id']}.{k}.{b36(hash_str(q['q']))}"
def responder(q, p, typical):
    """Devuelve (respuesta, correcto). En alternativas, el error favorece una alternativa «típica»."""
    if rnd.random() < p:
        return (chr(97 + q['correct']) if 'options' in q else str(q['answer'])), True
    if 'options' in q:
        malas = [i for i in range(len(q['options'])) if i != q['correct']]
        k = typical.setdefault(q['q'], rnd.choice(malas))
        k = k if rnd.random() < 0.65 else rnd.choice(malas)
        return chr(97 + k), False
    return rnd.choice(['3', '-4', '15', '0', '1/2', '12', '-2', '7']), False

typical = {}
filas = []
for i in range(N):
    th = rnd.gauss(0, 1); nombre = f'{rnd.choice(NOMBRES)} {rnd.choice(APELL)} {rnd.choice(APELL)}'
    inter, dg = [], {}
    for u in unidades:
        est = [e for e in EST if e['u'] == u['id']]
        # cuántas estaciones avanza: los de mayor habilidad terminan más
        k = len(est) if rnd.random() < sig(0.3 + 0.9 * th) else rnd.randint(0, len(est) - 1)
        for e in est[:k]:
            s = e['s']
            # Antes de empezar
            p = sig(th - e['dif'])
            if rnd.random() < p: r = (chr(97 + e['diag']['correct']) if 'options' in e['diag'] else str(e['diag']['answer'])); code = '1'; res = 'correct'
            elif rnd.random() < sig(-0.4 - th): r = '?'; code = '?'; res = 'neutral'
            else: r, _ = responder(e['diag'], 0, typical); code = '0'; res = 'wrong'
            dg[s['id']] = code
            inter.append((qid(e, 'D', e['diag']), r, res))
            # Practica: una ronda (2·2·1), reintentos hasta acertar
            for lv, cuota in ((1, 2), (2, 2), (3, 1)):
                for q in rnd.sample([q for q in s['practice'] if q.get('level') == lv], cuota):
                    for intento in range(4):
                        r, ok = responder(q, sig(th + 0.5 + 0.6 * intento - e['dif'] - 0.6 * (lv - 2)), typical)
                        inter.append((qid(e, 'P', q), r, 'correct' if ok else 'wrong'))
                        if ok: break
            # Aplica
            for q in rnd.sample(e['checks'], min(e['drawCheck'], len(e['checks']))):
                for intento in range(4):
                    r, ok = responder(q, sig(th + 0.4 + 0.6 * intento - e['dif']), typical)
                    inter.append((qid(e, 'A', q), r, 'correct' if ok else 'wrong'))
                    if ok: break
        # META FINAL oficial (solo si terminó la unidad)
        if k == len(est):
            for si, e in enumerate(est):
                s = e['s']
                L2 = e['diag'] if dg.get(s['id']) in ('0', '?') else rnd.choice([q for q in s['practice'] if q.get('level') == 2])
                # 2.ª pregunta: alterna entre estaciones nivel 3 / problema tipo Aplica (META de 60 min, 24-11-2026)
                X = (rnd.choice([q for q in s['practice'] if q.get('level') == 3]), -0.6) if si % 2 == 0 else (rnd.choice(e['checks']), -0.2)
                for q, extra in ((L2, 0), X):
                    r, ok = responder(q, sig(th + e['gan'] + extra - e['dif']), typical)
                    inter.append((f"{s['id']}.M1.{b36(hash_str(q['q']))}", r, 'correct' if ok else 'wrong'))
    avance = round(100 * sum(1 for x in inter if '.D.' in x[0]) / len(EST))
    filas.append((nombre, f'estudiante{i + 1:03d}@ejemplo.cl', avance, inter))

wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Interacciones'
M = max(len(f[3]) for f in filas)
enc = ['Nombre', 'Dirección de correo', 'Intento', 'Comenzado en', 'Último acceso en', 'Puntuación', 'Mi ruta de aprendizaje · PACE']
for j in range(M): enc += [f'Pregunta {j}', f'Respuesta {j}', f'Respuesta correcta {j}', f'Resultado {j}']
ws.append(enc)
for nombre, correo, avance, inter in filas:
    row = [nombre, correo, 1, '24 de noviembre de 2026, 09:00', '5 de diciembre de 2026, 18:00', float(avance), float(avance)]
    for idq, r, res in inter: row += [idq, r, None, res]
    ws.append(row)
wb.save(SALIDA)
print('Listo:', SALIDA, '|', N, 'estudiantes |', sum(len(f[3]) for f in filas), 'respuestas')
