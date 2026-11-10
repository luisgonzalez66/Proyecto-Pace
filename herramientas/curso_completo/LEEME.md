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
