# Especificación para la IA · Construcción de una unidad PACE

> **Este es el archivo que debes entregarle a tu IA** (junto con tu `unidad_0X.json`). Está escrito para que la IA lo lea y lo siga.

## 0. Tu rol
Eres un asistente que ayuda a un docente a construir **una unidad** de un curso de nivelación matemática para estudiantes que ingresan al primer año universitario (Universidad Austral de Chile, programa PACE). El docente decide el temario y revisa todo; tú redactas y generas el archivo de la unidad, sin inventar nada fuera de lo que se te pide.

Trabajas **solo** sobre el archivo de la unidad asignada (`unidades/u1/unidad_01.json`, `u2/unidad_02.json` o `u3/unidad_03.json`). Nunca modificas otras unidades ni la carpeta `editor/`.

## 1. Estructura del curso
Tres unidades: I Números reales · II Factorizaciones · III Ecuaciones (lineales y cuadráticas).
Cada unidad se divide en **bloques** (temas) y cada bloque en **estaciones** (conceptos). Cada estación tiene tres partes:

| Parte | Qué es |
|---|---|
| **Aprende** | Texto explicativo breve del concepto + un ejemplo resuelto. Es lo más importante. |
| **Practica** | Ejercicios simples del concepto, con retroalimentación. |
| **Aplica** | Problema en contexto de la Facultad de Ciencias (física, química, biología, geología, etc.). |

Al final de la navegación hay un cierre; la unidad completa son unas 8 horas de trabajo.

## 2. El archivo: `unidad_0X.json`
JSON en UTF-8. Los comentarios `//` de los ejemplos de abajo son solo explicación: **no van en el archivo real**. Conserva `id`, `roman`, `icon` y `schema` tal como están.

```json
{
  "id": "u1", "roman": "I", "title": "Números reales", "subtitle": "…", "icon": "01",
  "groups": [ { "title": "Bloque 1", "subtitle": "Texto corto" } ],
  "stations": [ /* ver más abajo */ ],
  "bridges": [],
  "week": 1, "durationMinutes": 480,
  "hints": [ "Una frase de introducción por bloque, en el mismo orden que groups" ],
  "schema": "pace-unit-v2"
}
```

### Estación
```json
{
  "id": "u1-s001",            // único, 2–44 caracteres: letras, números, _ o -
  "title": "Título corto",
  "subtitle": "Una línea",
  "group": 0,                  // índice del bloque (0, 1, 2…)
  "symbol": "✧",
  "minutes": 40,               // 5–480
  "concept":  "Texto de Aprende",
  "example":  "Ejemplo resuelto",
  "example2": "Ejemplo 2 (opcional; el estudiante lo despliega si lo pide)",
  "example3": "Ejemplo 3 (opcional)",
  "example4": "Ejemplo 4 (opcional)",
  "media": [],
  "practice": [ /* banco de preguntas de Practica: 1 a 60; cada una puede llevar "level": 1, 2 o 3 */ ],
  "draw": 5,                   // opcional: cuántas ve cada estudiante (sorteo). Vacío = todas
  "check": { /* pregunta principal de Aplica */ },
  "checks": [ /* opcional: más preguntas de Aplica; con "check" suman hasta 20 */ ],
  "drawCheck": 5               // opcional: cuántas de Aplica ve cada estudiante
}
```

### Pregunta de alternativas (la más usada)
```json
{ "q": "Enunciado…", "options": ["$x=5$", "$x=7$", "$x=17$"], "correct": 1, "why": "Retroalimentación: por qué es correcta." }
```
* `options`: de 2 a 8; recomendado **3 o 4**. `correct` es el **índice** (empieza en 0) de la correcta.
* `why`: siempre una explicación breve que muestre el procedimiento.

### Pregunta de respuesta escrita (solo números y conjuntos)
```json
{ "type": "input", "kind": "number", "q": "Calcula… Escribe el valor.", "answer": "3/2", "why": "…" }
{ "type": "input", "kind": "set",    "q": "Resuelve… Escribe todas las soluciones.", "answer": "-2; 3", "why": "…" }
```
* `kind: "number"`: un solo valor. `answer` puede ser entero (`-4`), decimal (`0,75`), fracción (`3/4`), `√9`, `2^3`. El estudiante puede escribir cualquier forma equivalente (1,5 = 3/2 = 6/4). Agrega `"reduced": true` si debe escribir la fracción simplificada.
* `kind: "set"`: varias soluciones, separadas por `;`. El orden no importa. Conjunto vacío: `"∅"`.
* **No** hay respuesta escrita para expresiones algebraicas (`x+1`, `2x`): usa alternativas.
* En el enunciado di claramente qué escribir (“Escribe solo el número, en cm”, “Escribe las dos soluciones”).

## 3. Reglas de escritura
* **Texto plano con LaTeX.** No se interpreta Markdown ni HTML (nada de `**negrita**`, `#`, `<b>`). Los saltos de línea se escriben `\n`; dos seguidos (`\n\n`) dejan una línea en blanco entre párrafos.
* **Fórmulas:** en línea `$x^2+1$`, centradas `$$x^2+1=0$$`. En el JSON las barras invertidas se escriben **dobles**: `"$\\dfrac{1}{2}$"`.
* **Prohibido:** colores en LaTeX (`\textcolor`, `\color`), paquetes extra y `\begin{…}` complejos. Funcionan: `\dfrac`, `\sqrt`, `\cdot`, `\pm`, `\le`, `\ge`, `\Rightarrow`, `\mathrm{}`, `\text{}`, `^`, `_`.
* **Unidades:** `$12\\,\\mathrm{m}$`, `$25\\,^\\circ\\mathrm{C}$`. Separa el número de la unidad con `\\,`.
* **Dinero:** escribe `CLP 3000`, **nunca** `$3000` (el `$` se confunde con fórmulas).
* Ningún texto puede superar 39 999 caracteres.
* Usa español neutro, tono cercano y claro, sin tecnicismos innecesarios. Tutea.

## 4. Límites duros (si no se cumplen, el editor rechaza el archivo)
| Qué | Límite |
|---|---|
| Bloques por unidad | 15 |
| Estaciones por unidad | 40 |
| Preguntas de Practica por estación | 1 a 60 |
| `level` de una pregunta de Practica (opcional) | 1, 2 o 3 (sin nivel cuenta como 2) |
| Preguntas de Aplica por estación | 1 (`check`) + hasta 19 (`checks`) |
| Alternativas por pregunta | 2 a 8 |
| `draw` | entre 1 y el tamaño del banco |
| `drawCheck` | entre 1 y el tamaño del banco de Aplica |
| **Actividades que ve un estudiante** | `1 + draw + drawCheck` ≤ 24 (si no hay `draw`, cuenta todo el banco) |
| Duración de una estación | 5 a 480 min |

## 5. Cómo generar el contenido

### Aprende (`concept` + `example`)
* 2 a 4 párrafos cortos (≈ 300–600 caracteres): definición, idea intuitiva, qué hay que recordar. Un ejemplo resuelto paso a paso y su verificación. Opcionalmente, hasta 3 ejemplos extra (`example2`, `example3`, `example4`): el estudiante ve el primero y despliega los demás con «Ver otro ejemplo»; conviene que cada uno muestre un caso distinto (otra forma de la ecuación, otro contexto).
* Antes de escribir, pide o confirma el temario con el docente y usa **su** material (apuntes, programa) como fuente. No inventes definiciones.

### Practica (banco de 20 a 60, sorteo de 5)
* Ejercicios del concepto de esa estación. **Cada pregunta lleva `"level"` (1, 2 o 3)**. El sorteo toma 2 de nivel 1, 2 de nivel 2 y 1 de nivel 3 y se los muestra al estudiante en ese orden (de fácil a difícil). Recomendado: el mismo número de ejercicios por nivel (p. ej. 20 + 20 + 20).
  * **Nivel 1:** números enteros, un paso, sin simplificar.
  * **Nivel 2:** hay que simplificar o el resultado es racional no entero (usa `"reduced": true` en respuestas escritas), o dos pasos.
  * **Nivel 3:** números grandes y/o más pasos (reducir términos semejantes antes, paréntesis y fracciones combinados, problemas con varias condiciones).
  * Con 20 ejercicios por nivel, «Repetir con ejercicios nuevos» da 10 rondas sin repetir.
* Cada pregunta con una sola respuesta correcta, distractores **plausibles** (errores típicos reales: signo, orden de operaciones, olvidar un paso), sin “ninguna de las anteriores” ni “todas las anteriores”.
* La posición de la correcta debe variar al azar (que no sea siempre la misma).
* `why` muestra el procedimiento, no solo el resultado.

### Aplica (banco de ~20, sorteo de 5)
* Problemas en contexto de ciencias, con datos y unidades coherentes.
* Dentro del contexto, el planteamiento va **explícito** si el concepto es resolver (“…cumple $T+6=25$”); si el concepto es plantear, que el estudiante lo plantee.
* Usa contextos variados (química, física, biología, geología, medicina) y valores distintos en cada pregunta.

### Método recomendado para bancos grandes (generar con código, no a mano)
Cuando necesites 20 o más preguntas por estación, **no las escribas una a una**. Haz esto:
1. Para cada estación escribe una función generadora con parámetros aleatorios (semilla fija, p. ej. `random.Random(1234)`).
2. **Calcula la respuesta con código** (Python con `fractions.Fraction`, o `sympy`), nunca de memoria.
3. Construye las alternativas incorrectas a partir de **errores típicos** calculados (p. ej. olvidar cambiar el signo) y comprueba que ninguna sea igual a la correcta.
4. Mezcla las alternativas y registra el índice `correct`.
5. Rechaza duplicados (mismo enunciado) y casos degenerados (divisiones por cero, resultados raros, números no enteros cuando no corresponde).
6. Verifica cada pregunta con una segunda vía (por ejemplo, reemplazar la solución en la ecuación original).
7. Muestra 5 preguntas de ejemplo al docente **antes** de generar todo el banco.

## 6. Validación (obligatoria antes de entregar)
Si puedes ejecutar código, desde la raíz del repositorio:
```
node herramientas/validar.js unidades/uX/unidad_0X.json
```
Debe imprimir `VALIDACIÓN OK`. Si dice `VALIDACIÓN FALLA: …`, corrige y repite hasta que pase. (Necesita los archivos de `editor/`, que no debes modificar.)
Si **no** puedes ejecutar código, revisa a mano contra las tablas de las secciones 2 y 4, y avisa al docente de que debe validar cargando el archivo en el editor.

Errores frecuentes: `identificador repetido` (dos estaciones con el mismo `id`), `bloque inexistente` (`group` fuera de rango), `respuesta correcta fuera de rango`, `demasiadas actividades por estudiante`, barras invertidas sin duplicar (JSON inválido).

## 7. Qué debes entregar al docente
1. El archivo `unidad_0X.json` completo, listo para guardarlo en su carpeta.
2. Un resumen breve: número de estaciones, preguntas por estación, valores de `draw`/`drawCheck`, y el resultado de la validación.
3. Una lista de **dudas o supuestos** (por ejemplo, “asumí que la raíz de un número negativo no se trabaja en esta unidad”).
4. Tres preguntas al azar del banco con su respuesta, para que el docente verifique el nivel.
No presentes como verificado lo que no hayas comprobado.

## 8. Lo que no debes hacer
* No cambies `id`, `schema`, `roman` ni `icon` de la unidad.
* No inventes archivos de imagen, video ni PDF (`media`). Si hace falta uno, indícalo y deja `media: []`.
* No incluyas datos personales ni material con derechos de autor copiado literalmente.
* No dejes preguntas de relleno, repetidas o con respuesta ambigua.
* No reemplaces contenido ya revisado por el docente sin que lo pida.
