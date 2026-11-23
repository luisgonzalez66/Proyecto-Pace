# Curso completo (SCORM único) — construcción

Genera `SCORM_CURSO_COMPLETO.zip` (portal + tour + Unidades I, II y III con su META FINAL) a partir de:

* `editor/motor_bundle.js` (motor oficial) y `unidades/uX/unidad_0X.json` (contenido),
* `index.html` y `tour/` (portal y video),
* `zs.js` + `zs.css` (capa de pantallas: Aprende por pantallas, práctica de a una pregunta, cero scroll, teclado ordenado, flechas del teclado).

```
python3 herramientas/curso_completo/construir_curso.py [carpeta_de_salida]
```
Sin argumento escribe en `paquetes_locales/` (ignorada por git).

**Qué hace el script:** parchea `app.js` del motor en tiempo de construcción (META FINAL por unidad, registro de interacciones SCORM, teclado ordenado, pantallas). **No modifica** `editor/` ni las unidades, así que los paquetes por unidad que genera el editor siguen igual.

Identificador del paquete: `PACE_CURSO_COMPLETO_U1_U2_U3_V4` (se mantiene para conservar el seguimiento en Moodle al "actualizar el paquete").

Análisis de errores con el informe de Interacciones: `python3 herramientas/analizar_errores.py INFORME.xlsx CATALOGO.xlsx [SALIDA.xlsx]`.

---

## Cierre de bloque (`cierre.js`, `cierre.css`)

Al final de cada bloque con 2 o más estaciones, el mapa muestra «Cierre del bloque»: práctica mixta con ejercicios de nivel 2 y 3 de las estaciones del bloque, mezclados y sin indicar de qué estación vienen. Un intento por ejercicio; al final, resumen por estación con botón «Repasar». No se registra en el SCORM.

- Los enunciados que nombran el método («Resuelve con la fórmula general», «Factoriza por agrupación», etc.) se neutralizan solo en el cierre (`CI_NEUTRO` en `cierre.js`); el JSON no cambia.
- Opcional en el JSON de la unidad: `groups[g].cierre = {title, idea, pasos:[...], figure:{svg, caption}, practice:[...], take, n}`. Muestra una pantalla-guía antes de la práctica y suma `take` preguntas propias (de `practice`) a una ronda de `n` ejercicios. Hoy lo usa el bloque «Ecuaciones cuadráticas» de la Unidad III («¿Qué método conviene?»). El editor conserva este campo, pero todavía no lo edita.

---

## Diagnóstico «Antes de empezar» (`diag.js`, `diag.css`)

La primera vez que un estudiante entra a una estación (sin avance en ella) ve una pregunta de diagnóstico con el botón «Todavía no lo sé». No cuenta para el avance. Se registra como interacción `estación.D.código` y se guarda en la línea `D|id:1,id:0,id:?` del suspend_data.

- Pregunta: `station.diag` (mismo formato que una pregunta de Practica) o, si no existe, la primera de nivel 2 de Practica, de preferencia escrita. Para cambiarla, agrega `diag` a la estación en el JSON (el editor conserva el campo, aunque todavía no lo edita).
- Al cambiar la pregunta de diagnóstico cambia su código: regenera el catálogo (`generar_catalogo.py`).

---

## Flujo cuando se cambian textos de una unidad (paso a paso)

1. **Editar la unidad** con el editor (`editor/EDITOR_PACE.html`) y guardar `unidad_0X.json` en `unidades/uX/` (ver README principal).
2. **Validar:** `node herramientas/validar.js unidades/u3/unidad_03.json` (debe decir «VALIDACIÓN OK»).
3. **Construir el SCORM del curso completo:** `python3 herramientas/curso_completo/construir_curso.py` → `paquetes_locales/SCORM_CURSO_COMPLETO.zip`. En Moodle (SiveducMD) se usa «actualizar el paquete»: el identificador interno no cambia, así que se conserva el seguimiento de los estudiantes.
4. **Regenerar el catálogo de preguntas** (obligatorio si se reescribió algún enunciado, porque el código de cada pregunta depende de su texto):
   `python3 herramientas/generar_catalogo.py herramientas/CATALOGO_PREGUNTAS_PACE.xlsx`
   (pasa el catálogo anterior como argumento: así se arma la hoja «IDs anteriores», que une los códigos viejos con los nuevos).
5. **Analizar errores** con el informe de Interacciones de Moodle: `python3 herramientas/analizar_errores.py INFORME.xlsx herramientas/CATALOGO_PREGUNTAS_PACE.xlsx`.
6. **Subir los cambios:** rama → commit → Pull Request → esperar la marca verde de *Verificar permisos* → Merge (README principal).

Requisitos: Python 3 con `openpyxl` (`pip install openpyxl`) y Node.js para validar.

## «Recuerda» (recuerda.js / recuerda.css)

Recuadro con un prerrequisito de una estación anterior. Va en el JSON de la estación:

```json
"recuerda": [{"titulo": "...", "texto": "... (admite $TeX$ y **negrita**)", "ejemplo": "TeX en modo display (opcional)", "origen": "u2-s012"}]
```

`construir_curso.py` copia en `ver` el objetivo, la idea y la figura de la estación `origen`. Úsalo solo cuando la estación necesita algo que no enseña ella misma.
