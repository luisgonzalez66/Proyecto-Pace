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
