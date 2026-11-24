# Qué significa la nota del curso en SiveducMD

Guía breve para docentes. El curso «Preparación matemática» envía a SiveducMD una sola calificación de 0 a 100, que cambia de significado según la etapa del estudiante.

## 1. Mientras el estudiante avanza: la nota es su avance

Mientras no haya entregado la META FINAL de las tres unidades, la calificación es el **porcentaje de avance** en las estaciones (Aprende, Practica y Aplica). Explora no cuenta.

- La calificación no supera **99** mientras falte alguna META FINAL, aunque haya terminado todas las estaciones.
- En esta etapa, la nota mide **cuánto ha recorrido** el estudiante, no cuánto sabe.

## 2. Al terminar: la nota es el promedio de las METAs

Cuando el estudiante entrega su primer intento oficial de la META FINAL en las tres unidades, la calificación pasa a ser el **promedio de su mejor resultado en la META FINAL de cada unidad**.

- Desde ese momento la nota mide **desempeño**, no avance. Por eso puede bajar: un estudiante con 99 de avance puede quedar, por ejemplo, con 72.
- Si vuelve a rendir una META, solo cuenta si mejora su mejor resultado.
- El estado del curso es «completado» cuando terminó las estaciones y la META FINAL de las tres unidades.

## 3. Cómo leer el libro de calificaciones

| Nota | Estado en SiveducMD | Lectura |
|---|---|---|
| 0–98 | incompleto | Avance en las estaciones |
| 99 | incompleto | Terminó las estaciones y le falta alguna META FINAL |
| Cualquier valor | completado | Promedio de sus mejores METAs FINALES |

Para saber en qué etapa está un estudiante, hay que mirar el **estado** junto con la nota.

La META FINAL **no determina aprobación ni reprobación**: la calificación sirve para seguir el avance y el desempeño, no para calificar.

## 4. Respuestas detalladas (informe de Interacciones)

- Las respuestas de la META FINAL se registran con el número de intento oficial: `estación.M1.código` para el primero, `estación.M2.código` para el segundo, y así. Las preguntas «Antes de empezar» usan `estación.D.código`, Practica usa `.P.` y Aplica usa `.A.`.
- SiveducMD guarda como máximo **2000 respuestas por intento SCORM**. Si un estudiante llega a ese límite, el curso le avisa una vez y sigue guardando su avance y sus evaluaciones; solo dejan de registrarse en detalle sus nuevas respuestas de práctica.
- El programa `herramientas/analizar_errores.py` arma el informe a partir de esa descarga (ver el instructivo del informe).
