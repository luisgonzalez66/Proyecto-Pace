# Cambios respecto al kit oficial V3.1

Este editor y su motor **no son los oficiales**: se les agregaron funciones. Antes de subir algo al LMS, confirmar con coordinación.

1. **Banco y sorteo.** En Practica y en Aplica cada estación puede tener hasta 20 preguntas (banco) y mostrar a cada estudiante solo algunas, sorteadas por estudiante («Sorteo · preguntas por estudiante»). Campo vacío = se muestran todas.
2. **Repetir.** Al completar una estación aparece «Repetir con ejercicios nuevos»: otra ronda con preguntas distintas del banco. El avance ya logrado y la nota se mantienen.
3. **Respuesta escrita (prototipo).** Nuevo tipo de pregunta: el estudiante escribe un **número** o un **conjunto de números** con un teclado en pantalla. Se elige en cada pregunta («Tipo de pregunta»). Sin expresiones algebraicas.
4. **Mapa por bloques.** El mapa muestra solo los bloques; al hacer clic se abren sus estaciones (a la derecha en pantallas anchas, hacia abajo en celular) y se cierra el que estaba abierto.
5. **Botón «Mapa».** Botón semitransparente siempre visible dentro de la estación para volver al mapa.
6. **Racha.** Contador de días consecutivos en que el estudiante completó al menos una actividad (se guarda en el SCORM y en el navegador).
7. Corrección de estilo del recuadro «Ejemplo».
8. **Niveles de dificultad.** Cada pregunta de Practica puede tener «Nivel de dificultad» (1, 2 o 3). El sorteo de 5 toma 2 de nivel 1, 2 de nivel 2 y 1 de nivel 3 y los muestra de fácil a difícil; «Repetir» avanza dentro de cada nivel sin repetir. Sin niveles todo funciona como antes (una pregunta sin nivel cuenta como 2). El banco en LaTeX/PDF muestra la etiqueta [Nivel n].
9. **Banco de hasta 60 ejercicios de Practica por estación** (antes 20). Cambio en `contract.js` (`maxPractice`), en el motor empaquetado y en `editor.js`. El límite de 24 actividades que ve cada estudiante no cambia.

Límite a respetar: Practica + Aplica que ve cada estudiante, sumando 1 de Aprende, debe ser como máximo 24 actividades por estación (el editor avisa).

Los archivos que contienen estos cambios: `motor_bundle.js` (motor del estudiante, en una sola línea enorme), `editor.js`, `validation.js`, `map_artifacts.js`, `content_text.js`, `EDITOR_PACE.html`.
Quien los modifique debe hacerlo **solo** (ver README). `motor_bundle.js` es un archivo en una sola línea: Git no puede unir cambios de dos personas.
