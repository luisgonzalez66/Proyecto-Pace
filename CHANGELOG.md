# Versiones del curso (SCORM único)

## 25-11-2026 (h) · Portada del sitio: avance de cada unidad

- En la página de acceso a las unidades, cada tarjeta indica «x de n estaciones completadas» y si la META FINAL está pendiente, en curso o realizada (con su mejor resultado). Sin árbol.
- Cada página de unidad deja ese resumen en el navegador (`pace_resumen_uN`) al guardar el avance; la portada lo lee. El total de estaciones lo actualiza la compilación, así que se ve «0 de n» aunque no se haya entrado a la unidad.
- «Reiniciar mi avance» también borra estos resúmenes. El SCORM no cambia.

## 25-11-2026 (g) · META FINAL como último paso de la unidad

- **Mapa:** la tarjeta de la META FINAL usa el color de la unidad y lleva la etiqueta «ÚLTIMO PASO DE LA UNIDAD», unida a los bloques con una línea punteada. Muestra la cuenta «Estaciones x/n + META FINAL = Unidad completa» y un mensaje según el estado: sin terminar, solo falta la META, evaluación en curso, META entregada con estaciones pendientes, o unidad completa (con el mejor resultado).
- **Todas las unidades:** cada tarjeta indica cuántas estaciones están completadas y si la META FINAL está pendiente, en curso o realizada (con su mejor resultado).
- Archivos: `herramientas/curso_completo/meta-unidad.css` y `meta-unidad.js`. Solo presentación: no cambia el avance ni lo que se envía a SiveducMD.

## 25-11-2026 (f) · Mapa de la unidad más compacto

- El título de la unidad, el chucao y el árbol quedan en una sola tarjeta. En escritorio el chucao va bajo el título y el árbol en un panel a la derecha; en el teléfono, chucao y árbol van lado a lado.
- Se quitó el recuadro con el porcentaje de avance de la unidad (el árbol ya muestra el avance). Se mantienen los porcentajes de cada estación y el «x/4 completas» de cada bloque.
- En el teléfono, los bloques se muestran con su nombre en una cuadrícula de 2 × 2 (antes, un riel con solo el número). Las estaciones del bloque elegido ocupan todo el ancho, así que la página no queda más larga.
- Archivos: `herramientas/curso_completo/mapa-compacto.css` y `mapa-compacto.js`.

## 25-11-2026 (e) · Unidad III: mensajes por alternativa (estaciones 6 a 11)

- Mensajes en Resolver problemas lineales, Cuadráticas incompletas, Cuadráticas por factorización, Fórmula general, Discriminante y Problemas cuadráticos. Con esto, las **481 preguntas de alternativas** de la Unidad III tienen mensaje para cada alternativa incorrecta.
- Unidades corregidas en dos preguntas de Aplica: Cuadráticas por factorización, A2 (cm, decía m) y Problemas cuadráticos, A10 (km, decía m).
- Se revisó a mano que la respuesta marcada como correcta en cada pregunta lo sea; en estas estaciones no hubo otros errores.

## 25-11-2026 (d) · Unidad III: mensajes por alternativa (estaciones 1 a 5) y correcciones

- Mensaje para cada alternativa incorrecta (`fb`) en Igualdad e incógnita, Ecuaciones lineales, Paréntesis y fracciones, Despeje de fórmulas y Del enunciado a la ecuación. Son 258 preguntas de Practica, Aplica y la pregunta de cierre.
- **Respuestas correctas mal marcadas.** Varias venían de la entrega del 25-11, en la que se reescribieron las alternativas, pero el índice de la correcta quedó como antes. Se corrigieron según la explicación de cada pregunta:
  - Igualdad e incógnita: A0 (temperatura 40 °C), A3 (esferas de 35 g), P49 ($x=2$), P55 (separar la fracción) y P59 (multiplicar por 4).
  - Paréntesis y fracciones, P25: la respuesta es $x=-\frac{19}{5}$; las alternativas y la explicación decían $\frac{19}{5}$.
- **Otros arreglos:**
  - Paréntesis y fracciones, A18: unidades en mg (decía g).
  - Ecuaciones lineales, P18: dos alternativas eran correctas; ahora solo «Sumar $x$ a ambos lados» simplifica la ecuación.
  - Del enunciado a la ecuación, P23: dos pares consecutivos no pueden sumar 41; ahora suman 42.
  - Del enunciado a la ecuación, P51: $2x-16$ y $2(x-8)$ eran dos alternativas equivalentes; se reemplazó una.

## 25-11-2026 (c) · Unidad III: «Ahora tú» en las 11 estaciones

- Cada estación tiene ahora su ejercicio «Ahora tú» en Aprende: unos pasos resueltos y el último en blanco, con mensajes para los errores típicos. Son ejemplos distintos de los de Aprende.
  - En Despeje de fórmulas, el último paso es calcular $h$ con datos concretos, porque el recuadro acepta números y no fórmulas.
  - En las cuadráticas se piden las dos soluciones, separadas por punto y coma.
  - En los problemas, el último paso vuelve a la pregunta («¿cuál es el número mayor?»).

## 25-11-2026 (b) · Unidad III: ediciones a mano incorporadas (UNIDAD_03_2511.zip)

- Se incorporaron las ediciones de la entrega `UNIDAD_03_2511.zip`, hechas sobre la versión del 19-11 (commit 812c3e4). La fusión fue en tres direcciones: entraron todas las ediciones de la entrega y se conservó todo lo agregado en GitHub después del 19-11.
  - **Lo conservado de GitHub:** «Recuerda», «Antes de empezar», META de 60 min, los 40 problemas con respuesta completa y los mensajes por alternativa.
  - **Lo que trae la entrega:**
    - Aprende reescrito en varias estaciones: la verificación es opcional («Podemos verificar…») y la resolución termina en «las soluciones».
    - Igualdad e incógnita: Aplica en contexto con alternativas interpretadas y Practica renovada (52 ítems).
    - Cambios en Practica y Aplica de Ecuaciones lineales, Paréntesis y fracciones, y Del enunciado a la ecuación.
- **Conflictos:** 9 ítems de Practica de Igualdad e incógnita (0–2, 20–23, 53 y 54) se habían cambiado en los dos lados. Quedó la versión de la entrega, más nueva y hecha a mano. Reemplaza el formato «Prueba los valores…» del 24-11.
- Corrección menor en el ítem 23: «¿Es $x = 5$ es solución…» pasó a «¿Es $x = 5$ solución…».
- El recurso `explora_balanza.html` de la entrega es idéntico al del repositorio.

## 25-11-2026 · Pie de página

- Se quitó «PACE» del pie de página del curso (SCORM y páginas de cada unidad), que ahora dice: «Instituto de Ciencias Físicas y Matemáticas · Facultad de Ciencias · Universidad Austral de Chile».
- Créditos en el Inicio: «Desarrollado por: Henry Hughes, Luis González V., Bastián Viscarra». Aparecen al pie de la pestaña Inicio de la portada y de la pantalla de inicio del curso; no en los mapas ni en las estaciones.

## 24-11-2026 (g) · Árbol de progreso (propuesta de Henry)

- **Árbol por unidad** (`herramientas/curso_completo/arbol/`): el componente de Henry (`arbol-progreso.js`, misma API y reglas) se conecta al avance real del motor (`arbol.js`). No lleva un registro propio.
  - Estación completada = Aprende, Practica y Aplica; en progreso = alguna de ellas; pendiente = ninguna.
  - **Flor** de un bloque (decisión de Luis): sus estaciones completas **y** su Cierre de bloque terminado. Los bloques de una sola estación no tienen Cierre y florecen con la estación.
  - **Frutos** en las cuatro ramas: unidad finalizada, es decir, estaciones completas y META FINAL entregada.
- **Dónde aparece:** en el mapa de cada unidad, junto al chucao (debajo de él en el celular), con lo que falta («2 en progreso · 3 pendientes»). En «Todas las unidades», una miniatura en cada tarjeta.
- **Ilustración v2:** el árbol crece hacia arriba (bloques 1 y 2 abajo, 3 y 4 arriba), con ramas que se afinan, una ramita por estación, copa del color de la unidad y suelo con pasto. Usa los colores de unidad de la paleta del curso y mantiene las tres siluetas.
- **Avisos:** al florecer una rama o al dar frutos, un mensaje en la ventana de «Estación completada» o en un aviso breve. No se repiten al recargar.
- **Guardado:** el Cierre de bloque ahora deja registro de que se terminó (línea `B|` del avance, unos pocos bytes). Sus respuestas siguen sin registrarse.

## 24-11-2026 (f) · Unidad II: «Ahora tú» y retroalimentación por alternativa

- **«Ahora tú» (fila 14 de la revisión):** nueva pantalla de Aprende, antes del Cierre, con un ejemplo cuyos primeros pasos están resueltos y el último queda en blanco. El estudiante escribe un número y recibe un mensaje según su error. Tras dos intentos puede ver la respuesta. No cuenta para el avance.
  - El motor la muestra en cualquier estación que tenga `learn.fade` (`zs.js`, `zs.css`; formato en `docs/ESPECIFICACION_PARA_LA_IA.md`). Es el prototipo del 19-11 (rama `prototipo-ahora-tu`), adaptado a la paleta nueva y al celular.
  - Las 12 estaciones de la Unidad II tienen su ejercicio.
- **Retroalimentación por alternativa (fila 13):** las 466 preguntas de alternativas de la Unidad II (360 de Practica y 106 de Aplica) tienen ahora un mensaje para cada alternativa incorrecta (`fb`). Antes lo tenían 129.
  - En Practica, los mensajes vienen de las plantillas de `herramientas/punto_u2_variedad.py`. Las preguntas generadas son idénticas a las anteriores, porque los mensajes no usan el sorteo.
  - En Aplica se escribieron por familia de problema, según el error que produce cada distractor.
- No se modificó ningún enunciado, alternativa ni respuesta.

## 24-11-2026 (e) · Accesibilidad, celular y datos (revisión del 24-11)

- **Fórmulas accesibles (fila 38):** cada fórmula tiene un nombre en texto para el lector de pantalla (por ejemplo «8x + 32») y ya no es una parada del tabulador. Las alternativas que son solo una fórmula ahora se leen.
- **Contraste (fila 47):** el texto en color de unidad usa el tono oscuro (el ocre puro no alcanzaba 4,5:1), y «Empieza tu racha» se oscurece. El revisor axe no encuentra fallas WCAG AA en la estación probada.
- **Celular (fila 46):** en pantallas táctiles, las teclas del teclado en pantalla miden 44 px y los números de ejercicio 40 × 40 px, en su propia fila sobre Anterior / Siguiente.
- **Inicio del curso (fila 49):** si el estudiante aún no empieza, dice «Empieza aquí · Comenzar» en lugar de «Retoma tu ruta · Continuar».
- **Nombre de la Unidad I (fila 40):** el título del JSON pasa a «Números», igual que la portada (pedido de Henry, 23-11). No se tocó ningún ejercicio de la Unidad I.
- **META con número de intento (fila 43):** las respuestas de la META FINAL se registran como `estación.M1.código`, `estación.M2.código`… `analizar_errores.py` reconoce el formato y usa el 1.er intento oficial para comparar con el diagnóstico (también lee el formato antiguo `.M.`).
- **Límite de 2000 respuestas (fila 50):** si se alcanza, el curso avisa una vez que el avance se sigue guardando.
- **Nota en SiveducMD (fila 45):** nueva guía para docentes, `docs/NOTA_EN_SIVEDUCMD.md`.

## 24-11-2026 (d) · Sistema de colores

- Un color, un significado (`herramientas/curso_completo/paleta.css`): azul marino y grises = estructura; amarillo = botón principal; verde = correcto/completado (✓); rojo = incorrecto (✗); ámbar = aviso (!); «en curso» = marino con borde punteado y anillo a medio llenar.
- Colores de unidad iguales en la portada y en el curso: I azul #2F6DB0, II ciruela #9C3D7A, III ocre #A8741F (validados para daltonismo y contraste). Antes las unidades I y III cambiaban de color, y la II compartía el verde de «correcto».
- Estados de las estaciones en el mapa con fondo y borde: gris pendiente, marino punteado en curso, verde lleno completada.
- «Qué aprenderás» pasa de verde al tono de la unidad; «Presta atención» pasa de rosado a ámbar.

## 24-11-2026 (c) · Sugerencias de Henry y Diego (navegación, evaluaciones, rondas, repaso)

- Pantallas bajas (notebook con zoom 100 %): botón «← Unidad» siempre visible en la barra superior de la estación.
- META y simulacro: la respuesta escrita se guarda sola (sin «Guardar respuesta»); el panel marca «respondida» en azul marino, sin anticipar si es correcta; al entregar con preguntas pendientes se listan para volver a ellas.
- Cierre de bloque: navegación libre (Anterior, Siguiente y números); lo respondido se ve con su retroalimentación; aviso si quedan ejercicios sin responder.
- Navegación entre secciones: «← Aprende» en el primer ejercicio de Practica, «← Practica» en el primero de Aplica, «← Aplica» en Explora; también con las flechas del teclado.
- Otra ronda de Practica o de Aplica por separado, sin perder avance (línea «R|» del progreso).
- Repaso sugerido: lo que recomienda el Cierre de bloque queda marcado en el mapa hasta completar una ronda nueva de Practica.
- Al completar una estación: ventana breve con el chucao y el paso siguiente (siguiente estación o Cierre del bloque); se cierra con ✕, Esc o clic fuera.
- Chucao: «Te faltan N estaciones para que tu chucao evolucione», contando sobre todo el curso.
- META: nuevo texto sobre aprobación y finalización (unidad vs. curso).
- Explora: ancho completo en escritorio, la ayuda «¿Qué puedes hacer aquí?» ya no se corta y se cierra con Esc o clic fuera; el botón para salir de la vista ampliada queda visible.
- Cuatro alternativas en 2 × 2 (una columna en celular o si son largas); «Todas las unidades» con el mismo estilo arriba y abajo; el mapa ya no se sale de la pantalla en celular; se ocultó el texto técnico «Moodle: …» del pie.

## 24-11-2026 (b) · Unidad II: Practica renovada

- Las 720 preguntas de Practica de la Unidad II se regeneraron con `herramientas/punto_u2_variedad.py` (Aprende y Aplica no cambian).
  · Niveles por estructura: 1 = caso básico; 2 = coeficientes distintos de 1 o signos mezclados; 3 = dos letras, factor común previo, identidades al revés, detectar errores. Ninguna pregunta se repite entre niveles.
  · En cada nivel, 10 de alternativas y 10 escritas. Nuevos tipos: detectar el error, operación inversa, evaluar sin desarrollar, cálculo mental, contexto. Las factorizaciones escritas se responden con un conjunto de números (p. ej. «4; 5»).
  · Estación 1: lenguaje algebraico (traducir enunciados a expresiones), también en el Aprende.
  · Respuestas verificadas con cálculo simbólico y con el corrector del curso.
- Unidad III, «Igualdad e incógnita»: las 9 preguntas «Reemplaza $x=…$, ¿qué número se obtiene?» (repetían el valor numérico de la Unidad II) pasan a «prueba estos valores: ¿cuál es solución?».

## 24-11-2026 · META FINAL más corta y botones «Ir a Aplica» / «Ir a Explora»

- META FINAL oficial: 60 minutos (70 en la Unidad I) y 2 preguntas por estación (28, 24 y 22 preguntas). En cada estación: una de dificultad media (la misma de «Antes de empezar» si se falló u omitió) y otra que alterna entre estaciones: nivel 3 / problema tipo Aplica. Alternativas y respuesta escrita también se alternan. En el JSON: `"meta": {"minutes": 60, "mix": [2, "x"]}`.
- Simulacro: opciones de 20, 30, 40 o 60 minutos (se quitó 120).
- Practica y Aplica: en el último ejercicio, el botón «Siguiente» pasa a «Ir a Aplica →» / «Ir a Explora →» (si la estación tiene Explora).
- Informe de análisis: comparación «prueba de entrada vs prueba de salida» y presentación más clara.

## 23-11-2026 (k) · «Omitir» queda registrado como neutral en SiveducMD

- Al omitir la pregunta de «Antes de empezar», la interacción se registraba como `wrong`, y en las preguntas de alternativas quedaba sin respuesta. Ahora se registra con respuesta `?` y resultado `neutral`, en los dos tipos de pregunta. `herramientas/analizar_errores.py` ya lo cuenta como «no sabe».

## 23-11-2026 (j) · El editor en la página «Última versión»

- **«Última versión»:** la página de descargas incluye ahora `EDITOR_PACE.zip`, con la carpeta `editor/` completa.
- **Motor del editor:** si una publicación trae cambios en el motor del curso (`herramientas/curso_completo/`), el flujo también regenera `editor/motor_bundle.js`. Así el editor descargado exporta con el motor vigente.

## 23-11-2026 (i) · Página de descargas «Última versión»

- **Nueva página de descargas:** después de cada publicación automática, el flujo actualiza la página «Última versión» de GitHub (Releases, etiqueta `ultima-version`). Sus enlaces fijos siempre descargan lo vigente:
  - `SCORM_CURSO_COMPLETO.zip`;
  - `PACE_CURSO_COMPLETO.html`;
  - `PAQUETE_UNIDAD_01/02/03.zip`;
  - `CATALOGO_PREGUNTAS_PACE.xlsx`.

  La página indica la fecha y el cambio a partir del cual se generaron los archivos.
- **Nuevo script:** `herramientas/curso_completo/html_unico.py` arma el curso en un solo HTML a partir del SCORM.

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
