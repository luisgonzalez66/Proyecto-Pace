# Revisión didáctica del curso Preparación matemática

18 de noviembre de 2026 · Luis González (revisión preparada con Claude)

Copia del documento de trabajo de Luis, donde se lleva el estado de cada sugerencia.

## Resumen

El curso tiene una base sólida: la estructura Aprende – Practica – Aplica es igual en las 37 estaciones, los bancos son grandes, hay retroalimentación en cada ejercicio y la META FINAL no castiga. Los problemas principales están en la **desigualdad entre unidades**, en **contenidos que faltan** para primer año de Ciencias y en el **poco uso de representaciones visuales**.

Revisé los JSON de las tres unidades (Aprende, ejemplos guiados, Practica, Aplica y Explora), el SCORM completo en escritorio y en móvil, y la portada nueva. No revisé cada uno de los 2.600 ejercicios uno por uno: hice chequeos automáticos (duplicados, explicaciones, opciones, contexto) y leí muestras.

Las diez prioridades:

1. **Reescribir los ejemplos guiados de la Unidad II.** Los ejemplos 2 a 4 de cada estación son ejercicios generados automáticamente, con números poco didácticos y solo 2 pasos.
2. **Agregar contenidos clave que faltan:** porcentajes y proporcionalidad, notación científica, fracciones algebraicas, trinomios con coeficiente principal distinto de 1, sistemas de ecuaciones 2×2 e inecuaciones lineales.
3. **Usar representaciones visuales en Aprende:** recta numérica, modelo de área para productos notables y barras para fracciones. Hoy casi todo es texto.
4. **Bajar la proporción de alternativas en la Unidad II:** 11 de 12 estaciones tienen el 100 % de Practica con alternativas, y se pueden resolver trabajando hacia atrás.
5. **Ampliar el banco de la Unidad I** (24 de Practica y 3 de Aplica por estación), sobre todo ahora que tiene META FINAL.
6. **Agregar práctica mixta al cerrar cada bloque,** para entrenar la elección del método y no solo su aplicación.
7. **Reemplazar los contextos «de ciencias» de plantilla** de la Unidad II por fórmulas y situaciones reales.
8. **Unificar el formato entre unidades:** objetivos «Al terminar podrás…», avisos de error específicos y nombres de las unidades.
9. **Numerar las estaciones por unidad** (II·4 en vez de 18) y abrir por defecto el bloque en curso en el mapa.
10. **Revisar contraste y textos pequeños,** y simplificar la paleta de colores en las estaciones.

## Estructura y secuencia del curso

La secuencia general (números → álgebra → ecuaciones) es correcta. Hoy son 37 estaciones y unas 25 horas previstas (9,1 h, 8 h y 8 h).

- **Agregar un diagnóstico breve al inicio de cada unidad.** Un curso de preparación recibe estudiantes muy distintos. Con 8 a 10 preguntas, el curso puede sugerir por qué estaciones partir y cuáles repasar. Eso evita que quien ya domina un tema se aburra y abandone.
- **Hacer visibles los prerrequisitos.** La Unidad III usa factorización (Unidad II) y fracciones (Unidad I), pero las estaciones no lo dicen. Basta un recuadro «Recuerda» con enlace a la estación de origen, por ejemplo en «Cuadráticas por factorización» y en «Paréntesis y fracciones».
- **Unificar el nombre de la Unidad I.** Las tarjetas y el mapa dicen «Números y operaciones», mientras que la portada y los objetivos dicen «Números reales».
- **Revisar el lugar de «Conjuntos numéricos».** Hoy es la penúltima estación de la Unidad I. Al inicio daría el marco (ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ) y una recta numérica que acompañe toda la unidad. Si se deja al final, conviene renombrar el bloque como «Síntesis: los números reales».
- **Numerar las estaciones dentro de cada unidad.** La cabecera muestra un número global («Cuadrado de una suma» es la 18 y «Paréntesis y fracciones» la 29). Para el estudiante es más claro «II·4» o «Estación 4 de 12».
- **Validar los tiempos con un piloto.** En la Unidad II todas las estaciones dicen 40 minutos, lo que parece un valor por defecto. Las tarjetas muestran «9.1 h» con punto; en español corresponde «9,1 h» o «unas 9 horas».
- **Agregar un cierre por bloque.** Cada bloque termina sin síntesis. Una pantalla breve con lo esencial y una práctica mixta de 5 ejercicios de las estaciones del bloque ayudaría a consolidar (ver la sección de ejercicios).
- **Actualizar el texto del bloque 1 de la Unidad III.** Dice «Aquí aprenderás a despejarla paso a paso», pero la primera estación ahora trata de soluciones y ecuaciones equivalentes.

## Unidad I · Números y operaciones

Las ideas de Aprende son claras y los avisos apuntan a errores reales, como (−2)⁴ frente a −2⁴, o √(9+16) ≠ √9 + √16. Lo más débil es el tamaño del banco y la ausencia de temas muy usados en Ciencias.

**Agregar**

- **Porcentajes, razones y proporcionalidad** (directa e inversa). Es probablemente lo que más usarán en química, biología y física: diluciones, concentraciones, escalas.
- **Notación científica y potencias de 10,** con orden de magnitud. Es imprescindible en Ciencias y encaja natural en el bloque de potencias.
- **Orden en la recta numérica y valor absoluto.** Prepara las inecuaciones y la noción de distancia.
- **Redondeo y aproximación,** con cuándo usar el valor exacto y cuándo el aproximado (ya aparece en el aviso de «Fracciones y decimales», pero sin práctica).
- **Racionalización de denominadores sencilla** (1/√2), como cierre de «Operaciones con radicales».

**Mejorar**

- **Ampliar el banco.** Hoy cada estación tiene 24 ejercicios de Practica (solo 5 de nivel 3) y 3 de Aplica. Con el sorteo de 5 por ronda, al segundo intento ya se repiten. Ya se le avisó a Henry en el issue #11.
- **Usar representaciones:** recta numérica en enteros y en conjuntos numéricos, y modelo de barras o de área para fracciones equivalentes y para la suma con distinto denominador. Hoy la idea de «partes del mismo tamaño» solo se dice en texto.
- **Escribir los objetivos como en la Unidad III:** «Al terminar podrás…». Hoy son frases cortas sin sujeto, como «Resolver operaciones con enteros respetando prioridad».
- **Unificar la notación MCD/MCM con la Unidad III,** que escribe «mcm» en minúscula.
- **Equilibrar la estación «Divisibilidad».** Memorizar los criterios por 4 y por 8 aporta poco en la universidad. Rinde más ponerle peso a la descomposición en primos, que es la que se usa después para simplificar y para el MCM.

**Quitar**

- El subtítulo interno de la unidad en el JSON («APAE · 14 estaciones · … borrador docente»). Los estudiantes no lo ven hoy, pero el editor sí lo muestra y podría filtrarse en otra vista.

## Unidad II · Factorizaciones

Es la unidad que más trabajo necesita. La secuencia es buena: expresiones, productos notables, factor común y luego factorización con identidades, que lee los productos al revés. Pero el contenido de Aprende parece generado en serie.

**Mejorar**

- **Ejemplos guiados.** El ejemplo 1 de cada estación está bien. Los ejemplos 2 a 4 son ejercicios con números elegidos al azar y solo 2 pasos: (x+27)² obliga a calcular 27² = 729, aparecen (9x/2 + 8y)² y 9x² + 18x − 891, y algunos títulos dicen «Escribe solo el número». Conviene reescribirlos con una progresión pensada: caso básico, coeficiente distinto de 1, dos variables, y un error típico corregido.
- **«Qué aprenderás».** Repite el subtítulo («El doble producto es esencial», «Términos, coeficientes y sustitución»). Debe decir qué podrá hacer el estudiante.
- **Avisos de error.** Las 12 estaciones tienen el mismo aviso: «Revisa los signos, los exponentes y las operaciones…». Cada estación tiene un error propio que vale la pena nombrar: (a+b)² ≠ a²+b², −(x−3) = −x+3, a²+b² no se factoriza en los reales, olvidar el factor común antes de la identidad.
- **Formato de respuesta.** En 11 de 12 estaciones, el 100 % de Practica es de alternativas. En «Desarrolla (x+27)²» se puede elegir sin desarrollar, y en factorización basta multiplicar las cuatro opciones. Sugiero llevar al menos un tercio a respuesta escrita. Para eso el motor debe aceptar expresiones algebraicas, no solo números; si no es posible aún, se pueden usar preguntas de completar («(x+5)² = x² + □x + 25»).
- **Tamaño de los números.** En niveles 1 y 2 conviene usar números pequeños, para que el esfuerzo esté en la estructura y no en la aritmética.
- **Contextos de Aplica.** Muchos son la misma plantilla con una disciplina pegada: «En geología, se usa una región cuadrada…», «En física, una lámina…». Son problemas de área, y la etiqueta no agrega ciencia. Sirven mejor fórmulas reales: energía cinética, área de la superficie de un cilindro, la diferencia de cuadrados en un anillo (πR² − πr²), o simplificar una expresión de un modelo.

**Agregar**

- **Trinomios ax²+bx+c con a ≠ 1.** La Unidad III ya los usa: en «Cuadráticas por factorización» aparecen 3x² − 11x + 10 y 2x² + 3x − 9.
- **Fracciones algebraicas:** simplificar, multiplicar y sumar. Es lo que más usarán en Cálculo y en las ecuaciones con x en el denominador.
- **Completar el cuadrado.** Une productos notables con la fórmula general y permite mostrar de dónde sale.
- **Explora.** Es la única unidad sin ninguno. Un modelo de área (cuadrado de lado a+b, fichas algebraicas) es el recurso clásico para productos notables y factorización.
- **Una estación de cierre «¿Qué método uso?»** con práctica mezclada. «Trinomios y elección del método» lo promete, pero sus 60 ejercicios de Practica se resuelven todos con suma y producto.

## Unidad III · Ecuaciones

Es la unidad más cuidada. Los ejemplos explicitan la meta, la verificación va aparte y hay Explora en 9 de 11 estaciones. Además, el orden nuevo de las cuadráticas (primero si hay soluciones y después cómo encontrarlas) tiene buen sentido didáctico.

**Agregar**

- **Sistemas de ecuaciones lineales 2×2** (sustitución e igualación, con interpretación gráfica como rectas que se cortan; ya existe un Explora con ese nombre). Aparecen en mezclas, balances y circuitos.
- **Inecuaciones lineales e intervalos,** con el cambio de sentido al multiplicar por un negativo.
- **Ecuaciones con la incógnita en el denominador,** sencillas, con verificación de soluciones que no sirven (x = 0). Une las fracciones algebraicas de la Unidad II con esta unidad.
- **Una estación o pantalla «¿Qué método conviene?»** al cerrar el bloque de cuadráticas: si falta un término, la vía directa; si Δ es un cuadrado perfecto, factorizar; si no, la fórmula. Con práctica mezclada, porque el riesgo que se quiso evitar con el nuevo orden es justamente aplicar un método por costumbre.

**Mejorar**

- **Despeje de fórmulas** tiene el 100 % de Practica con alternativas. Elegir la fórmula despejada se puede hacer por descarte. Conviene que una parte pida el despeje paso a paso o un valor numérico después de despejar.
- **Problemas.** Pedir siempre las unidades y la interpretación de la solución («¿tiene sentido un tiempo negativo?») como parte de la respuesta, no solo en la explicación. Incluir algún problema donde ninguna solución sirva en el contexto.
- **Igualdad e incógnita.** El bloque 1 todavía anuncia «despejar paso a paso»; ajustar ese texto al nuevo foco.
- **Unificar «mcm» con «MCM»** de la Unidad I.

## Ejercicios: Practica, Aplica, Explora y META FINAL

Los chequeos automáticos salieron limpios: no hay preguntas duplicadas, todas tienen explicación, ninguna repite opciones y la respuesta correcta está bien repartida entre las posiciones. Las sugerencias son de diseño didáctico.

| Unidad | Practica por estación | Aplica por estación | Practica con alternativas | Estaciones con Explora |
| --- | --- | --- | --- | --- |
| I | 24 | 3 | 83 % | 4 de 14 |
| II | 60 | 20 | 92 % | 0 de 12 |
| III | 60 | 20 | 46 % | 9 de 11 |

- **Práctica mixta al cerrar cada bloque.** Hoy cada ronda sortea solo dentro de la estación, así que el estudiante sabe qué método usar antes de leer el enunciado. Mezclar ejercicios de las estaciones del bloque entrena lo que de verdad cuesta: reconocer qué hacer.
- **Repaso espaciado.** El curso ya tiene racha diaria. Se le puede sumar un «calentamiento» de 3 preguntas de estaciones ya completadas al entrar.
- **Retroalimentación según el error.** Las explicaciones dicen cómo se resuelve, pero no responden al error cometido. En alternativas, cada distractor corresponde a un error conocido (en «Desarrolla (x+27)²», la opción x²+729 es olvidar el doble producto). Ese mensaje puede ir asociado a cada opción.
- **Ejemplos que se retiran de a poco.** Entre el ejemplo guiado completo y el ejercicio solo falta un paso intermedio: un ejemplo con el último paso en blanco. Es de las prácticas con mejor evidencia para novatos.
- **Aplica.** En las Unidades I y III los contextos son razonables. En la II son de plantilla (ver su sección). Para todas, conviene que algunos problemas pidan plantear y no solo calcular, y que usen datos con unidades reales.
- **Explora.** Agregar al menos dos en la Unidad II. En las que ya existen, añadir una pregunta final breve que obligue a sacar una conclusión («¿qué pasa con Δ cuando c crece?»), para que no quede como juego suelto.
- **META FINAL.** Usa el mismo banco de Practica y Aplica, lo que está bien en las Unidades II y III. En la Unidad I se repetirán mucho las preguntas de nivel 3 y de Aplica hasta que crezca el banco. A futuro conviene que la revisión muestre el desarrollo del ejercicio (ya lo habían pedido) y un resumen por estación («repasa Discriminante»).

## Diseño visual y presentación

La portada nueva tiene personalidad y conecta con Valdivia. Dentro de las unidades el diseño es ordenado, pero tiene demasiados colores, mucho espacio vacío en Aprende y algunos textos difíciles de leer.

**Colores y tipografía**

- **Reducir la paleta en las estaciones.** Conviven azul marino, morado, coral, verde, amarillo, turquesa y beige, además de la franja de cinco colores y las manchas moradas decorativas a los lados. Sugiero un color de acento por unidad, usado de forma constante en su tarjeta, su mapa y sus estaciones, y quitar las manchas decorativas de las estaciones.
- **Contraste.** Textos como «0 de 11 actividades completadas» (unos 10 px, gris) y el «0%» gris claro de la cabecera quedan bajo el contraste mínimo recomendado. Subir el tamaño a 13 px como mínimo y oscurecer el gris.
- **Tipografías.** Fraunces para títulos y Nunito para el texto funcionan bien juntas. La letra tipo tiza (Kalam) conviene dejarla solo en la pizarra de la portada.

**Presentación en pantalla**

- **Espacio vacío en Aprende.** Con la navegación sin desplazamiento, la pantalla «Idea» muestra dos o tres líneas y más de la mitad del recuadro en blanco. Es el lugar natural para una representación visual (recta numérica, modelo de área, balanza) o una pregunta rápida de activación.
- **Mapa de la unidad.** En escritorio, el panel derecho queda vacío con «Elige un bloque para ver sus estaciones». Mejor abrir por defecto el bloque en curso.
- **Tarjetas de unidades.** «Lista para explorar» no dice nada útil al estudiante. Puede reemplazarse por su avance («3 de 14 estaciones») o por «No iniciada».
- **Chucao en el mapa.** «Te faltan 92 actividades» puede desanimar al comienzo. Es mejor expresarlo en estaciones («Te faltan 9 estaciones») o solo con la barra.

**Móvil y accesibilidad**

- **Pendientes ya anotados:** botones Anterior/Siguiente que se pierden en móvil, flechas del teclado en Practica y Aplica, distribución del teclado matemático y porcentaje junto al chucao.
- **Navegación con teclado y lector de pantalla:** revisar que cada botón tenga foco visible y que las fórmulas tengan texto alternativo.

**Pendientes de la portada**

- Regrabar el video del tour: todavía habla de pestañas.
- Quitar «PACE» del pie de página y de la transcripción, si se decide eliminarlo del todo.

## Lista completa

Son 45 sugerencias, ordenadas por prioridad.

| # | Sugerencia | Tipo | Área | Prioridad |
| --- | --- | --- | --- | --- |
| 1 | Reescribir los ejemplos guiados 2 a 4 de la Unidad II con una progresión pensada | Mejorar | Unidad II | Alta |
| 2 | Reescribir «Qué aprenderás» y los avisos de error de la Unidad II, uno propio por estación | Mejorar | Unidad II | Alta |
| 3 | Llevar al menos un tercio de Practica de la Unidad II a respuesta escrita o de completar | Mejorar | Ejercicios | Alta |
| 4 | Agregar trinomios ax²+bx+c con a ≠ 1 | Agregar | Unidad II | Alta |
| 5 | Agregar fracciones algebraicas (simplificar y operar) | Agregar | Unidad II | Alta |
| 6 | Agregar porcentajes, razones y proporcionalidad | Agregar | Unidad I | Alta |
| 7 | Agregar notación científica y potencias de 10 | Agregar | Unidad I | Alta |
| 8 | Ampliar el banco de la Unidad I (nivel 3 y Aplica) | Mejorar | Unidad I | Alta |
| 9 | Agregar sistemas de ecuaciones lineales 2×2 | Agregar | Unidad III | Alta |
| 10 | Agregar práctica mixta al cerrar cada bloque | Agregar | Ejercicios | Alta |
| 11 | Usar representaciones visuales en Aprende (recta numérica, área, barras) | Mejorar | Aprende | Alta |
| 12 | Agregar inecuaciones lineales e intervalos | Agregar | Unidad III | Media |
| 13 | Agregar ecuaciones con la incógnita en el denominador | Agregar | Unidad III | Media |
| 14 | Agregar «¿Qué método conviene?» al cerrar las cuadráticas | Agregar | Unidad III | Media |
| 15 | Reemplazar los contextos de plantilla de Aplica en la Unidad II por fórmulas reales | Mejorar | Unidad II | Media |
| 16 | Agregar Explora en la Unidad II (modelo de área) | Agregar | Unidad II | Media |
| 17 | Agregar completar el cuadrado | Agregar | Unidad II | Media |
| 18 | Agregar orden en la recta numérica y valor absoluto | Agregar | Unidad I | Media |
| 19 | Diagnóstico breve al inicio de cada unidad | Agregar | Estructura | Media |
| 20 | Recuadros «Recuerda» con enlace a estaciones previas | Agregar | Estructura | Media |
| 21 | Retroalimentación asociada a cada alternativa incorrecta | Mejorar | Ejercicios | Media |
| 22 | Ejemplo con el último paso en blanco entre el guiado y la práctica | Agregar | Aprende | Media |
| 23 | Numerar estaciones dentro de la unidad (II·4) | Mejorar | Diseño | Media |
| 24 | Reducir la paleta de colores en las estaciones y quitar manchas decorativas | Mejorar | Diseño | Media |
| 25 | Subir tamaño y contraste de textos pequeños y grises | Mejorar | Diseño | Media |
| 26 | Abrir por defecto el bloque en curso en el mapa | Mejorar | Diseño | Media |
| 27 | Corregir los pendientes de móvil y teclado ya anotados | Mejorar | Diseño | Media |
| 28 | Unificar el nombre de la Unidad I (Números y operaciones / Números reales) | Mejorar | Estructura | Media |
| 29 | Despeje de fórmulas: parte de Practica con respuesta escrita | Mejorar | Unidad III | Baja |
| 30 | Pedir unidades e interpretación en los problemas | Mejorar | Unidad III | Baja |
| 31 | Objetivos de la Unidad I con el formato «Al terminar podrás…» | Mejorar | Unidad I | Baja |
| 32 | Unificar MCD/MCM y mcm entre unidades | Mejorar | Estructura | Baja |
| 33 | Reordenar o renombrar «Conjuntos numéricos» | Mejorar | Unidad I | Baja |
| 34 | Dar menos peso a memorizar criterios de divisibilidad | Quitar | Unidad I | Baja |
| 35 | Agregar racionalización de denominadores sencilla | Agregar | Unidad I | Baja |
| 36 | Agregar redondeo y aproximación | Agregar | Unidad I | Baja |
| 37 | Repaso espaciado al entrar (3 preguntas de estaciones previas) | Agregar | Ejercicios | Baja |
| 38 | Pregunta de conclusión al final de cada Explora | Mejorar | Ejercicios | Baja |
| 39 | Validar los tiempos previstos con un piloto y escribir «9,1 h» | Mejorar | Estructura | Baja |
| 40 | Actualizar el texto del bloque 1 de la Unidad III | Mejorar | Unidad III | Baja |
| 41 | Cambiar «Lista para explorar» por el avance en las tarjetas | Mejorar | Diseño | Baja |
| 42 | Expresar en estaciones lo que falta para la siguiente etapa del chucao | Mejorar | Diseño | Baja |
| 43 | Quitar el subtítulo interno «APAE … borrador docente» de la Unidad I | Quitar | Unidad I | Baja |
| 44 | Regrabar el video del tour | Mejorar | Portada | Baja |
| 45 | Quitar «PACE» del pie de página y de la transcripción | Quitar | Portada | Baja |
