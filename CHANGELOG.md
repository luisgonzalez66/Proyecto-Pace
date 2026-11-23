# Versiones del curso (SCORM único)

## 23-11-2026 (h) · Publicación automática en GitHub y nombre «Números» (pedidos de Henry)

- **Publicación automática:** el nuevo flujo de GitHub Actions `.github/workflows/publicar_unidades.yml` se ejecuta cada vez que llega a `main` un cambio en `unidades/*/unidad_*.json`, en `unidades/*/recursos/`, en `unidades/*/html/` o en el motor (`herramientas/curso_completo/`). Hace lo siguiente:
  - valida las tres unidades;
  - regenera `unidades/uN/html/`, `editor/catalogo_estaciones.js` y el catálogo de preguntas;
  - sube los archivos regenerados a `main`;
  - deja el SCORM del curso completo como archivo descargable de la ejecución.

  Cada docente sube solo su JSON y sus recursos. Si alguien sube a mano archivos de `html/`, el flujo los vuelve a generar bien. Si una unidad no pasa la validación, no se publica nada.
- **README:** el paso 6 ya no pide copiar `html/`, y hay una sección nueva, «Publicación automática».
- **Unidad I:** la portada del sitio, el README y la especificación dicen ahora «Números». El título dentro de la unidad lo cambiará Henry en su JSON.

## 23-11-2026 (g) · «Reiniciar avance» en GitHub y «Escribe solo el resultado»

- **«Reiniciar avance» (solo en GitHub):** cada página de unidad tiene un botón junto a «Vista local · sin SiveducMD». Pide confirmación, borra el avance de esa unidad en el navegador y recarga.
  - La portada del sitio tiene «Reiniciar mi avance» en el pie, que borra el de las tres unidades.
  - El botón no aparece en el SCORM ni en el HTML del curso completo.
- **«Escribe solo el resultado»:** en las preguntas de respuesta numérica, si se escribe una operación que la respuesta no tiene (por ejemplo $3+4$, $\sqrt{49}$ o $2^3-1$), el curso pide escribir solo el resultado.
  - No corrige la respuesta ni la cuenta como intento.
  - Se aceptan igual un número con signo, un decimal, una fracción simple (que se sigue revisando si está simplificada) y un número entre paréntesis.
  - Funciona en Practica, Aplica, «Antes de empezar», el cierre de bloque y la META FINAL.
- **Archivos:** `herramientas/curso_completo/extras.js` e `index.html` (portada).

## 23-11-2026 (f) · Sorteo por nivel y modalidad (propuesta de Henry)

- **Practica:** se mantienen las cuotas por nivel (2·2·1) y, dentro de cada nivel, se reparten alternativas (A) y escritas (E). Ronda 1: 3A+2E. Ronda 2: 2A+3E. Y así alternando: el nivel 1 y el nivel 2 llevan una de cada tipo, y la del nivel 3 alterna entre rondas.
- **Aplica:** cuando se sortean 2 preguntas, sale 1 de alternativas y 1 escrita.
- **META FINAL:** se mantiene una pregunta de Practica de nivel 2, una de nivel 3 y una de Aplica por estación, con las modalidades alternadas. Resultado: 21A+21E en la Unidad I, 17A+19E en la Unidad II y 18A+15E en la Unidad III.
- **Sorteo:**
  - cada grupo de nivel y modalidad se baraja con la semilla del estudiante y se recorre sin repetir;
  - si un tipo ya se usó completo y el otro no, se usa el otro antes de repetir, así que no se repite ninguna pregunta hasta usar todo el banco del nivel;
  - si una estación no tiene preguntas de un tipo, usa las que tiene, sin bloquear (Unidad II «Lenguaje y valor numérico», solo escritas; Unidad III «Del enunciado a la ecuación», solo alternativas).
- **Pruebas:** 444 rondas en las 37 estaciones, con 3 semillas distintas. No hubo preguntas repetidas antes de agotar el banco, y todas las rondas respetan la cuota por nivel. En las rondas 1 y 2, todas las estaciones que tienen ambos tipos dan 3A+2E o 2A+3E.
- **Avance:** el formato del avance guardado no cambia. Como aún no hay estudiantes, no afecta rondas en curso.
- **Archivos:** `herramientas/curso_completo/sorteo.js` y su conexión en `construir_curso.py`.

## 23-11-2026 (e) · Nombre de la Unidad I y mcd

- **#20:** la portada del sitio, el README y la especificación dicen ahora «Números y operaciones», igual que el JSON de la Unidad I.
- **#24:** en el último ejemplo de la Unidad II que lo escribía en mayúsculas, «MCD» pasó a «mcd», como en las Unidades I (v9.9) y III.

## 23-11-2026 (d) · Numeración por unidad, aviso por alternativa y trinomios con a ≠ 1 (sugerencias #15, #13 y #7)

- **#15 · Numeración dentro de cada unidad:** la cabecera de la estación y «Antes de empezar» muestran «II·4» en lugar del número global (34). En el mapa de la unidad, cada estación lleva su número dentro de la unidad.
- **#13 · Aviso según la alternativa elegida:** campo opcional `fb` en las preguntas de alternativas: una lista con un texto por alternativa, que va vacío en la correcta.
  - **En Practica y Aplica:** al elegir una alternativa incorrecta se muestra «Todavía no.» y su aviso, sin revelar la respuesta. La alternativa probada queda atenuada.
  - **En la práctica de cierre de bloque:** el aviso aparece antes de la respuesta correcta.
  - **Editor:** bajo cada alternativa incorrecta hay un campo «Aviso si eligen esta (opcional)».
  - **`validation.js`:** exige un aviso por alternativa, vacío en la correcta y de máximo 260 caracteres.
  - **Contenido:** ya tienen avisos 30 preguntas de la Unidad III (problemas del punto 22) y las 7 preguntas nuevas de trinomios de la Unidad II (6 de Practica y 1 de Aplica).
- **#7 · Trinomios $ax^2+bx+c$ con $a\neq1$ (Unidad II, «Trinomios y elección del método»):**
  - **Aprende:**
    - el objetivo y la idea incluyen el **método $ac$**: dos números con producto $a\cdot c$ y suma $b$, para separar el término central y agrupar;
    - el ejemplo guiado 3 es ahora $3x^2-11x+10=(3x-5)(x-2)$, en lugar de $2x^2-2x-24$, porque el factor común ya lo cubren el aviso y el «Recuerda»;
    - el cuadro «¿Qué método uso?» menciona el método $ac$.
  - **Practica:** 10 preguntas nuevas en los niveles 2 y 3, que reemplazan preguntas repetidas o demasiado fáciles para su nivel. Son 6 de alternativas con avisos y 4 escritas.
  - **Aplica:** 2 preguntas nuevas, el tablero de $2x^2+7x+3$ y el invernadero de $3x^2+10x+8$.
  - **Verificación:** todo se comprobó con sympy (`herramientas/punto7_trinomios_u2.py`).
- **Unidad III, «Cuadráticas por factorización»:** segundo «Recuerda», sobre el método $ac$, que viene de la Unidad II.

## 23-11-2026 (c) · Problemas con respuesta completa e interpretación (sugerencia #22)

- **Unidad III, «Resolver problemas lineales» y «Problemas cuadráticos»:** en cada estación, 20 de las 60 preguntas de Practica (10 de nivel 2 y 10 de nivel 3) cambiaron de formato. Los contenidos no cambian.
  - **Respuesta completa** (alternativas): se elige entre respuestas como «El hijo tiene 16 años y el padre, 44». Los distractores son errores típicos: intercambiar las cantidades, responder $x$ en lugar de lo pedido u olvidar un paso.
  - **Interpretar soluciones** (alternativas):
    - una solución no entera en un conteo indica que los datos no son consistentes;
    - un tiempo negativo indica que el momento ya ocurrió;
    - se descarta la longitud negativa;
    - en enteros consecutivos sirven los dos pares;
    - una pelota pasa dos veces por la misma altura.
  - **Pasar de $x$ a lo pedido** (respuesta escrita): se da el valor de $x$ y se pregunta por la cantidad que pide el problema.
- **Verificación:** las ecuaciones se comprobaron con sympy. Se generan con `herramientas/punto22_problemas_u3.py`.
- **Sin cambios:** se mantienen las preguntas usadas en «Antes de empezar».
- **Unidad I (entrega v9.9 de Henry):** se volvió a armar la página de la unidad, porque la que se subió no tenía el enlace a la portada ni el número de versión que obliga al navegador a cargar los archivos nuevos.

## 23-11-2026 (b) · Sección «Recuerda» en el editor

- **Editor, pestaña Aprende:** la nueva sección **«Recuerda (opcional)»**, hasta 2 por estación, tiene:
  - una lista para elegir la estación de origen, que solo muestra estaciones anteriores (de unidades anteriores y de la misma unidad);
  - título, texto y ejemplo, con contador de caracteres;
  - revisiones automáticas: que la estación de origen sea anterior, que no falten el título ni el texto, que la fórmula del ejemplo no tenga errores y que el ejemplo quepa en un celular de 360 px.
- **Vista del estudiante del editor:** muestra el recuadro abierto, tal como lo verá el estudiante.
- **`validation.js`:** valida el campo `recuerda`. Exige una estación de origen anterior, título y texto (máximo 90 y 320 caracteres) y admite como máximo 2 recuadros.
- **`editor/catalogo_estaciones.js`:** lo genera `construir_curso.py` con las estaciones de las tres unidades, para la lista de origen.
- **Ejemplos más angostos:** se acortaron los de cinco recuadros que no cabían en un celular de 360 px (U1 MCD y MCM, U1 Operaciones combinadas, U2 Trinomios, U3 Paréntesis y fracciones, U3 Cuadráticas por factorización).

## 23-11-2026 · «Omitir» en el diagnóstico, «Recuerda» en las Unidades I y II, raíces

- **Antes de empezar:** se quitó «Todavía no lo sé». Ahora hay un botón **«Omitir esta pregunta»** justo debajo de donde se escribe o elige la respuesta, y el texto de arriba explica que se puede omitir. En SiveducMD se sigue registrando igual (respuesta «?», resultado neutral).
- **«Recuerda»** se cierra también haciendo clic fuera del recuadro o con Esc.
- **«Recuerda» en la Unidad I** (solo donde la estación usa algo de una estación anterior que no explica):
  - MCD y MCM → descomponer en factores primos.
  - Fracciones equivalentes → simplificar con el MCD.
  - Suma y resta → calcular el MCM.
  - Operaciones con radicales → simplificar cada raíz antes de sumar.
  - Operaciones combinadas → exponente negativo y simplificar raíces.
- **«Recuerda» en la Unidad II:** Trinomios y elección del método → primero, el factor común.
- **Raíces:** en tres lugares se usaba el signo √ suelto, cuya barra no cubre el radicando. Ahora tienen barra completa:
  - el Explora «Constructor de cuadrados» (Unidad I);
  - el Explora de la fórmula general (Unidad III);
  - las figuras de «Fórmula general» y «Cuadráticas incompletas» (Unidad III).
  También el adorno √x de la portada.
- **Unidad I:** se quitó el coeficiente 1 delante de las raíces (por ejemplo, $1\sqrt{27}$ pasa a $\sqrt{27}$) en 14 enunciados y alternativas.

## 22-11-2026 (c) · «Recuerda» en la Unidad III (sugerencia #12)

- Algunas estaciones tienen ahora un botón **«Recuerda»**, en Aprende, Practica y Aplica. Al tocarlo se abre un recuadro encima de la pantalla con lo esencial de una estación anterior y un ejemplo.
- **«Ver la idea completa»** abre una ventana con la idea de la estación de origen. Se cierra con «Seguir con…» y el estudiante vuelve al mismo lugar de la estación. Mirar un «Recuerda» no cambia el avance ni activa «Antes de empezar».
- Solo se puso donde la estación usa algo que no enseña ella misma:
  - «Paréntesis y fracciones» → calcular el mcm (Unidad I · MCD y MCM).
  - «Cuadráticas por factorización» → los signos al buscar los dos números (Unidad II · Trinomios y elección del método).
  - «Fórmula general» → simplificar una raíz cuadrada, que el nivel 3 usa en respuestas como $3\pm\sqrt7$ (Unidad I · Simplificación de raíces).
- **Cómo se escribe** (JSON de la estación): `"recuerda":[{"titulo","texto","ejemplo"(TeX),"origen":"<id de la estación>"}]`. Al armar el curso se copia la idea de la estación de origen, así que funciona también en la página de una sola unidad.
- En la exportación individual del editor, donde no está la otra unidad, se muestra solo el recuadro, sin «Ver la idea completa».
- Archivos: `herramientas/curso_completo/recuerda.js`, `recuerda.css` y `construir_curso.py`.

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
