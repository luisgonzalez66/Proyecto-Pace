# Versiones del curso (SCORM único)

## 22-11-2026 (b) · Las páginas de unidad abren directo en sus bloques

- En GitHub, cada unidad tenía su propia portada con una sola tarjeta («Unidades de aprendizaje» → Unidad III). Era un paso de más y su botón «Inicio» confundía.
- Ahora, al entrar a una unidad desde la portada del sitio, se abre directamente la pantalla de bloques y estaciones.
- Se quitó el botón flotante «Inicio». El único botón para subir es **«Todas las unidades»**, que lleva a la portada del sitio (`#curso`). Cualquier otro «volver al inicio» lleva al mismo lugar, incluido el botón inferior, que antes decía «Volver al inicio de la unidad».
- En la exportación individual del editor también se abre directo la unidad; allí no hay botón para subir.
- El curso completo (SCORM y HTML) no cambia: mantiene su portada con las tres unidades.

## 22-11-2026 · Botones de volver: cada uno dice adónde lleva

- **Problema:** en las páginas de cada unidad en GitHub, «Todas las unidades» abría la portada de esa misma unidad (con una sola tarjeta), no el listado de las tres unidades.
- **En una estación** (y en «Antes de empezar»): el botón ahora dice **«Volver a la Unidad X»** (en celular, «Unidad X») y lleva a la pantalla de bloques de la unidad.
- **En la pantalla de la unidad:** el botón dice **«Todas las unidades»** (en celular, «Unidades»).
  - En el curso completo (SCORM y HTML) abre la pantalla con las tres unidades, como antes.
  - En las páginas de unidad de GitHub va a la portada del sitio, en la sección del curso (`index.html#curso`). El destino se define en `PACE_BUILD.portal`, que solo se escribe en la compilación `sitio`.
  - En la exportación individual del editor, donde no hay otras unidades, dice **«Portada»**.
- Archivos: `herramientas/curso_completo/nav.js`, `diag.js`, `construir_curso.py`; se recompilaron las páginas de unidad y `editor/motor_bundle.js`.

## 22-11-2026 — Diagnóstico «Antes de empezar» en cada estación
- La primera vez que se entra a una estación aparece una sola pregunta de esa estación, antes de Aprende. Hay un botón «Todavía no lo sé»; después solo se dice si acertó (sin explicación) y se pasa a la estación. No cuenta para el avance y no se vuelve a preguntar.
- La pregunta es fija por estación: `station.diag` si la unidad la define; si no, la primera de nivel 2 de Practica (de preferencia de respuesta escrita). Unidad III, «Problemas cuadráticos», define una propia más breve.
- Se registra en SiveducMD como «estación.D.código» (resultado «neutral» y respuesta «?» cuando elige «Todavía no lo sé») y se guarda en el progreso (línea `D|` del suspend_data).
- `analizar_errores.py` agrega la hoja «Diagnóstico» (por estación: aciertan, se equivocan, «no lo sé», y el % de acierto en Practica para comparar) y deja el diagnóstico fuera de los totales. El catálogo incluye las 37 preguntas de diagnóstico.
- Archivos: `herramientas/curso_completo/diag.js` y `diag.css`. También aplica a la exportación individual del editor.

## 22-11-2026 — Botones de navegación más claros
- Un solo botón de volver por pantalla, que sube un nivel y dice adónde lleva: en la estación «Mapa de la Unidad X» (en celular, «Mapa»); en el mapa «Todas las unidades» (en celular, «Unidades»). Reemplaza a «← Volver al mapa» y a «← Inicio de la unidad», que llevaba a la pantalla de todas las unidades y se confundía con el comienzo de la unidad.
- Estilo discreto: cápsula pequeña con ícono y el color de la unidad; en celular, área de toque más alta y texto corto.
- Las migas ya no se muestran en el mapa ni en la estación (repetían el botón); en la META FINAL y el Cierre del bloque dicen «Unidades › Unidad X › …» en lugar de «Inicio».
- Archivos: `herramientas/curso_completo/nav.js` y `nav.css`. También aplica a la exportación individual del editor.

## 20-11-2026 — Catálogo con versiones anteriores de las preguntas
- `generar_catalogo.py` agrega la hoja «Versiones anteriores» con las preguntas de versiones antiguas de las unidades (desde el historial de git), y `analizar_errores.py` la usa: las respuestas registradas con un SCORM anterior ya no quedan «sin catálogo» (se marcan como «(versión anterior)»).

## 19-11-2026 — Unidad II: revisión completa (autorizada por Luis; responsable de la unidad: Bastián)
Los contenidos (temas y estaciones) no cambian; cambia cómo se enseñan y se ejercitan.
- **Aprende:** las 12 estaciones tienen un objetivo «Al terminar podrás…», 4 ejemplos guiados nuevos con el desarrollo línea a línea en el cuadro izquierdo (caso básico, coeficiente distinto de 1, dos variables o fracciones, y un error típico o la elección del método), verificación aparte y un aviso de error propio. Antes, 44 de 48 ejemplos tenían el cuadro izquierdo vacío y las 12 estaciones compartían el mismo aviso.
- **Figuras:** modelo de área en «Comprende la idea» de las 12 estaciones (distributiva, productos notables, factor común, agrupación, diferencia de cuadrados, trinomios).
- **Practica (720):** varias plantillas por estación (antes una), números pequeños en los niveles 1 y 2, alternativas incorrectas que corresponden a errores típicos, respuesta correcta repartida en las cuatro posiciones y 278 ejercicios de respuesta escrita (completar el número que falta). «Trinomios y elección del método» ahora mezcla suma y producto, factor común, diferencia de cuadrados, cuadrado perfecto y agrupación. Verificación algebraica automática (sympy): 0 errores.
- **Aplica (240):** situaciones y fórmulas reales en lugar de «En geología, se usa una región cuadrada…»: caída libre, energía cinética y mecánica, temperatura, crecimiento de un cultivo, terrenos y baldosas, anillo circular, altura de un proyectil, cálculo mental con identidades. 133 de respuesta escrita.
- **Explora:** «El cuadrado de una suma, pieza por pieza» (Cuadrado de una suma) y «Fichas: arma el rectángulo» (Trinomios y elección del método), cada uno con una pregunta final para pensar.
- Ajuste de diseño: en celular, las figuras de «Comprende la idea» ocupan menos alto.

## 19-11-2026 — Ñ y tildes dentro de fórmulas
- El texto dentro de fórmulas (`\text{…}`) se dibuja con la letra del curso. Antes, la ñ y las vocales con tilde salían de otra tipografía (la fuente matemática no las tiene) y parecían negritas. Aplica a las tres unidades, al editor y a los HTML/SCORM que exporta. En el banco PDF, ese texto sale en Helvetica/Arial completo.

## 19-11-2026 — Correcciones de Luis (Practica y ejemplos de la Unidad III)
- Practica y Aplica: al empezar una ronda nueva, el primer ejercicio que se muestra es el 1 (antes se conservaba la posición de la ronda anterior y partía, por ejemplo, en el 5).
- Unidad III, cuadráticas incompletas y por factorización: los ejemplos verifican **las dos soluciones** (una pantalla por solución, con «x = …:» al inicio).
- Unidad III, «Resolver problemas lineales» y «Problemas cuadráticos»: cada ejemplo incluye la pregunta del problema y termina con una línea «Respuesta: …» completa, con unidades, en el cuadro izquierdo; el cuadro derecho queda solo para explicaciones. Los pasos se nombran (definimos, planteamos, interpretamos, respondemos) y la verificación revisa todas las condiciones del enunciado.

## 19-11-2026 — Editor: exportar por modalidades con avance visible (propuesta de Henry)
- El botón «Exportar…» abre un cuadro para elegir: HTML navegable, SCORM individual (se descarga directo), Mapas (SVG/PNG), Banco de preguntas (PDF/LaTeX), Respaldo editable (JSON + recursos) o Paquete completo. Cada opción hace solo sus tareas y recuerda la última elección.
- Durante la exportación: cronómetro de tiempo transcurrido, lista de etapas con su duración, detalle de la etapa en curso (por ejemplo «Estación 3 de 14 · pregunta 180 de 1120»), barra de avance y «última actividad». Botón «Detener». Si una etapa falla, se indica cuál y se puede reintentar sin perder el trabajo.
- Al terminar: «Descarga iniciada», nombre y tamaño del archivo. Solo «Respaldo editable» y «Paquete completo» marcan el trabajo como guardado.
- Banco PDF: las fórmulas ya dibujadas se reutilizan (la segunda exportación de la Unidad I bajó de 96 s a 9 s). En el paquete completo, el SCORM se guarda sin volver a comprimirlo.

## 19-11-2026 — Cierre de bloque, «¿Qué método conviene?» y despeje con respuesta escrita
- Nuevo «Cierre del bloque» al final de cada bloque con 2 o más estaciones (las tres unidades): práctica mixta de 8 ejercicios de las estaciones del bloque, sin decir de cuál viene cada uno; un intento por ejercicio y resumen por estación con «Repasar». No cuenta para el avance ni se registra en el SCORM.
- Unidad III, bloque «Ecuaciones cuadráticas»: pantalla-guía «¿Qué método conviene?» (pasos y diagrama) y 12 preguntas de elección de método; cada ronda tiene 9 ejercicios (3 de elección de método).
- Unidad III, «Despeje de fórmulas»: 20 de los 60 ejercicios de Practica pasan a respuesta escrita (despejar y calcular el valor, con datos y unidades reales). Quedan 40 de alternativas.
- Catálogo de preguntas regenerado.

## 18-11-2026 — Presentación y contraste (revisión didáctica)
- Color de acento por unidad (I coral, II verde, III índigo) en panel, encabezado, pestaña activa y mapa; fondo sin manchas en las estaciones.
- Mayor contraste en textos pequeños y estados pendientes.
- Mapa: abre el bloque en curso y se mantiene abierto al hacer clic.
- Tarjetas de unidad: «No iniciada / En curso / Completada · n de N estaciones»; horas con coma (9,1 h).
- Chucao en el mapa: «Te faltan unas k estaciones para llegar a…».
- Unidad III: figura en «Comprende la idea» de las 11 estaciones; nueva pista inicial.
- El editor muestra la figura en la vista previa; motor_bundle.js regenerado.

* **Motor del editor actualizado (18-11-2026)** — `editor/motor_bundle.js` se regeneró con `construir_curso.py … motor`: la exportación individual (HTML y SCORM por unidad) sale con la misma interfaz que el curso completo (pantallas, nombre «Preparación matemática», chucao en todo el recorrido, META FINAL).
* **META FINAL en la Unidad I (17-11-2026)** — Se activa la evaluación final de la Unidad I (120 minutos, simulacro y oficial): por estación, una pregunta de Practica de nivel 2, una de nivel 3 y una de Aplica (42 preguntas). Para completar el curso ahora se requiere la META FINAL oficial de las tres unidades.
* **Nombre y chucao (17-11-2026)** — El curso pasa a llamarse «Preparación matemática» y el encabezado ya no dice «PACE». Los símbolos del banner cruzan en una franja horizontal. El chucao crece con el avance de todo el curso y aparece en todo el recorrido: grande en la portada (con la etapa real) y en la pantalla de unidades, mediano en el mapa de cada unidad (etapa y cuánto falta para la siguiente) y en la entrada y resultados de la META FINAL, pequeño en las estaciones (reacciona a cada respuesta); aviso al subir de etapa (`chucao.js`, `chucao.css`).
* **Portada nueva (17-11-2026)** — Sin pestañas: el encabezado tiene una pizarra con fórmulas escritas con tiza y el botón «Ir al curso»; debajo, en una sola página, Bienvenida (qué es el curso y qué lograrás por unidad), Cómo se estudia (Aprende, Practica, Aplica, Explora opcional y META FINAL) y el video del tour, con fondo cuadriculado. «Ir al curso» abre una pantalla aparte con «Retoma tu ruta», el avance y las unidades; al volver desde una unidad se llega a esa pantalla. `construir_curso.py` arma esta portada en el SCORM. Mismo identificador `…_V4`.
* **Unidad III, estación «Igualdad e incógnita» (15-11-2026)** — Aprende reescrito con un hilo único (qué es una solución, ecuaciones sin solución, ecuaciones equivalentes, errores comunes) y banco nuevo alineado: 60 ejercicios de Practica (20 por nivel) y 20 de Aplica sobre evaluar valores, reconocer ecuaciones equivalentes y detectar errores. Resolver queda para la estación siguiente.
* **Unidad III, estación «Igualdad e incógnita» (12-11-2026)** — Se replantea Aprende: qué es una solución (se evalúa cada lado en distintos valores), qué significa ecuación equivalente y operaciones inválidas con errores comunes. Resolver paso a paso queda para la estación siguiente. El banco de ejercicios no cambia.
* **Unidad III (11-11-2026)** — Ecuaciones cuadráticas reordenadas: Discriminante, Fórmula general, Cuadráticas incompletas y Cuadráticas por factorización. Textos de Aprende, ejemplos y una pregunta del Discriminante ajustados al nuevo orden (Δ se define primero y la fórmula general lo usa). Los identificadores de estación (`u3-s007` a `u3-s010`) no cambian.

* **v5 (10-11-2026)** — Navegación por pantallas (propuesta de Henry, V4): Aprende por pantallas, práctica de a una pregunta, cero scroll, Explora, tarjeta de aviso. Botones siguiente/anterior visibles en móvil y ligados a las flechas del teclado, porcentaje junto al chucao en móvil, negritas legibles, teclado matemático ordenado (también en META FINAL). Mismo identificador `…_V4`.
* **v4** — Interacciones SCORM (una fila por respuesta en el informe de Moodle), META FINAL por unidad, ventana emergente ajustada.
* **v3** — Paquetes individuales por unidad (obsoletos; usar el curso completo).
