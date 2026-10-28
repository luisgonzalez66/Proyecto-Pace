# Manual · Cómo construir tu unidad con ayuda de una IA

Para docentes del equipo del curso de nivelación PACE UACh. No necesitas saber programar.

## 1. La idea en 30 segundos
1. Tú decides **qué se enseña** y revisas todo.
2. Tu IA redacta el contenido y **genera el archivo de tu unidad** (`unidad_0X.json`), siguiendo una especificación que ya está escrita.
3. El editor PACE valida el archivo, te deja verlo como estudiante y exporta el HTML y el SCORM.
4. Lo subes al repositorio del equipo.

La IA es el ayudante que escribe y calcula. La responsabilidad pedagógica es tuya: **todo lo que la IA produzca debe ser revisado por ti antes de usarse.**

## 2. Qué archivos le das a la IA
Descarga el repositorio (GitHub Desktop → *Pull*) o bájalo como ZIP desde GitHub (*Code → Download ZIP*). Luego entrégale a tu IA estos archivos:

| # | Archivo | Para qué | ¿Obligatorio? |
|---|---|---|---|
| 1 | `docs/ESPECIFICACION_PARA_LA_IA.md` | Las reglas: formato, límites, estilo, cómo generar las preguntas | **Sí** |
| 2 | `unidades/uX/unidad_0X.json` (tu unidad) | El archivo que la IA va a completar y devolverte | **Sí** |
| 3 | Tus apuntes, programa o temario | Fuente del contenido | **Sí** (sin esto la IA inventa) |
| 4 | `unidades/u3/unidad_03.json` | Ejemplo completo y real de una unidad terminada (11 estaciones, bancos de 20) | Muy recomendado |
| 5 | `herramientas/validar.js` y la carpeta `editor/` | Permiten que la IA compruebe sola que el archivo es válido | Si tu IA puede ejecutar código |

**Qué IA usar:** conviene una que pueda **leer archivos adjuntos y ejecutar código** (por ejemplo, Claude con archivos y ejecución de código, o ChatGPT con análisis de datos). Con ella, la IA calcula las respuestas y valida el archivo. Una IA que solo conversa también sirve, pero hay que revisar más a mano.

## 3. Paso a paso

### Paso 1 · Preparar la conversación
Abre una conversación nueva, adjunta los archivos 1, 2, 3 (y 4 y 5 si puedes) y pega este mensaje:

> Vas a ayudarme a construir la **Unidad X: [título]** de un curso de nivelación matemática. Lee primero `ESPECIFICACION_PARA_LA_IA.md`: son las reglas que debes seguir. Mi archivo de trabajo es `unidad_0X.json`. El contenido debe basarse en mis apuntes adjuntos. Todavía no generes nada: dime con tus palabras qué entendiste del formato (estaciones, Aprende/Practica/Aplica, bancos con sorteo) y qué te falta saber.

Comprueba que lo que resume la IA es correcto. Si no lo es, corrígela aquí, no más adelante.

### Paso 2 · Definir el temario
> Propón la estructura de la unidad: 3 o 4 bloques y, dentro de cada uno, las estaciones (concepto + una línea). Total de unas 8 horas, entre 40 y 50 minutos por estación. Usa mi temario adjunto. Dame también una frase de introducción por bloque.

Conversa y ajusta hasta que quedes conforme. Es el esqueleto de toda la unidad; cámbialo aquí, es barato.

### Paso 3 · Redactar «Aprende» de cada estación
> Escribe el Aprende (`concept`) y el ejemplo (`example`) de las estaciones del bloque 1. Máximo 4 párrafos cortos por estación; ejemplo resuelto con verificación. Muéstramelos en texto, sin JSON todavía.

Es **lo más importante de la unidad**. Léelo todo, corrige el nivel, el lenguaje y los errores. Pide cambios hasta que te guste.

### Paso 4 · Generar los bancos de preguntas
> Genera para la estación [nombre] un banco de **20 preguntas de Practica** (alternativas, nivel simple) y **20 problemas de Aplica** en contexto de ciencias. Hazlo con código: una función generadora por tipo de ejercicio, con números aleatorios, respuestas calculadas por el programa y alternativas incorrectas basadas en errores típicos. Antes de generar los 20, muéstrame 5 ejemplos para aprobar el estilo.

**Cómo las genera la IA (y por qué así):**
* Escribir 400 preguntas a mano produce errores y repeticiones. En cambio la IA escribe un *programa* por tipo de ejercicio.
* Cada programa elige números al azar, **calcula la respuesta con código** (no “de memoria”) y arma las alternativas incorrectas con errores típicos: signo equivocado, olvidar un paso, confundir operaciones.
* Comprueba que no haya enunciados repetidos ni respuestas ambiguas, y mezcla la posición de la correcta.
* Cada pregunta trae su retroalimentación (`why`) con el procedimiento.
* En el editor, cada estudiante verá **solo 5 de las 20** (sorteo) y podrá repetir con otras 5.

### Paso 5 · Preguntas de respuesta escrita (opcional)
Para que el estudiante escriba la respuesta en vez de elegirla (números y conjuntos, no expresiones algebraicas):
> Convierte [estas preguntas / ocho preguntas por estación] a **respuesta escrita** (`type: "input"`) cuando la respuesta sea un número o un conjunto de números. Ajusta el enunciado para que diga qué escribir.

### Paso 6 · Armar y validar el archivo
> Integra todo en `unidad_0X.json`, respetando las reglas y los límites de la especificación. Valida con `node herramientas/validar.js` y no me lo entregues hasta que diga VALIDACIÓN OK. Entrégame: el archivo, el resumen de qué contiene, tus dudas o supuestos, y tres preguntas al azar con su respuesta.

Guarda el archivo que te entrega en `unidades/uX/unidad_0X.json` (reemplazando el anterior).

### Paso 7 · Revisarlo como estudiante
1. Abre `editor/EDITOR_PACE.html` en Chrome o Edge (desde su carpeta). *Abrir paquete ZIP* y selecciona un ZIP con tu `unidad_0X.json` (ver el README para empaquetarlo).
2. Recorre la **Vista estudiante** de cada estación: fórmulas bien dibujadas, enunciados claros.
3. Pulsa **Exportar unidad + HTML + SCORM** y prueba el HTML completo.

### Paso 8 · Subirlo al repositorio
Sigue el README: copiar el resultado a tu carpeta, *Commit*, *Push* y *Pull Request*. La verificación automática te avisa si algo no cumple.

## 4. Cómo revisar lo que hizo la IA (checklist)
- [ ] ¿El Aprende dice cosas correctas y está al nivel de un estudiante que recién ingresa?
- [ ] ¿Las 5 preguntas de muestra tienen **una sola** respuesta correcta? Resuélvelas tú.
- [ ] ¿Las alternativas incorrectas son errores que realmente se cometen, o son absurdas?
- [ ] ¿El enunciado dice qué escribir (en las de respuesta escrita)?
- [ ] ¿Las unidades y los números de los problemas de Aplica son realistas?
- [ ] ¿Hay preguntas repetidas o casi iguales dentro del banco?
- [ ] ¿La explicación (`why`) enseña el procedimiento?
- [ ] ¿Las fórmulas se ven bien en la vista estudiante (sin símbolos `$` o `\` sueltos)?
- [ ] Revisa **al azar al menos 10 preguntas por estación**, y todas las de Aprende.

## 5. Problemas frecuentes
| Síntoma | Qué hacer |
|---|---|
| El editor dice “Máximo 20 prácticas”, “bloque inexistente”, “respuesta fuera de rango”… | Pega el mensaje a la IA y pídele corregir; vuelve a validar. |
| “Demasiadas actividades por estudiante” | Reduce `draw` o `drawCheck` (Practica + Aplica ≤ 23 por estudiante). |
| Se ven `$x^2$` o `\frac` en vez de fórmulas | Barras invertidas sin duplicar en el JSON, o paquete con colores/comandos no soportados. Pídele a la IA que revise el LaTeX. |
| La IA “se olvida” de las reglas en una conversación larga | Vuelve a adjuntar la especificación y pide que la relea. Trabaja por estación o por bloque. |
| La IA inventa contenido que no está en tus apuntes | Pídele que cite de qué parte de tus apuntes sale, y descarta lo que no. |
| El archivo quedó enorme o la IA se corta | Pide el banco **por estación** y luego integra, o que lo escriba directo al archivo con código. |
| Dudas sobre una pregunta | Resuélvela tú: ante la duda, se descarta. |

## 6. Buenas prácticas
* Un chat por unidad; guarda las decisiones importantes (estructura, estilo) y repítelas al retomar.
* Haz **commits frecuentes**: cada estación terminada, un commit. Así siempre puedes volver atrás.
* No pegues datos personales de estudiantes en la IA.
* Pide a la IA que tutee y use español neutro; si no te gusta el tono, dilo temprano.
* Cualquier cambio al editor o al motor (funciones nuevas, tipos de pregunta) lo coordina Luis, no se hace en las unidades.
