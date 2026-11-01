# Evolución visual y reglas de progreso

## Tramos exactos

| Etapa | Progreso mostrado | Regla técnica (porcentaje real p) | Intención |
| --- | --- | --- | --- |
| 1. Descubro | 0–24 % | 0 ≤ p < 25 | Curiosidad; cuerpo pequeño, cabeza grande, alas cortas y postura exploratoria. |
| 2. Experimento | 25–49 % | 25 ≤ p < 50 | Primera autonomía; crece, amplía alas y observa/manipula objetos. |
| 3. Conecto | 50–74 % | 50 ≤ p < 75 | Organiza relaciones; proporciones intermedias, escritura y representación. |
| 4. Razono | 75–99 % | 75 ≤ p < 100 | Mayor soltura; mirada reflexiva, postura firme y explicación de ideas. |
| 5. Compartimos | 100 % | p = 100 | Celebra la conclusión del recorrido, sigue como compañero, no como profesor. |

El progreso puede tener decimales: 24,9 % sigue en etapa 1, 99,9 % en etapa 4. Primero se debe normalizar p al intervalo [0,100]; no redondearlo antes de evaluar el umbral. La UI puede mostrar porcentajes redondeados por separado. Si el valor es inválido, no inventar un nuevo avance: usar el estado reportado por el motor o un estado sin sincronización.

## Qué debe cambiar entre etapas

- **Silueta:** desde un polluelo compacto hasta un chucao plenamente desarrollado.
- **Postura:** de curiosidad inicial a seguridad tranquila y celebración.
- **Coordinación:** de observar a manipular y luego explicar o conectar ideas.
- **Plumaje:** progresión sutil en la definición de las plumas, cola y alas.
- **Vínculo:** cada etapa conserva contacto visual; nunca parece una mascota distinta.

Los accesorios (lupa, cuaderno, pizarra) refuerzan la narrativa, pero no deben ser el único indicador del cambio.

## Observación crítica sobre este set

La progresión **sí se entiende** gracias a las poses y actividades, pero las etapas 2, 3 y 4 conservan proporciones corporales bastante similares. Conviene evaluar un rediseño de siluetas en una futura versión antes de llamar «definitivo» al set. Esta es una propuesta usable para presentación/piloto visual, no un personaje articulado final.

## Qué avance usar

- **Propuesta inicial:** porcentaje persistido de la unidad SCORM que el estudiante está cursando.
- **No asumir un porcentaje global** entre los tres SCORM si no existe una fuente de progreso compartida confiable.
- **Repetición de nuevas preguntas:** si el diseño actual conserva el avance máximo logrado, el chucao no debe retroceder por reemplazo del banco.
- **Persistencia:** tras recargar, recuperar la etapa desde el valor guardado. No guardar un contador independiente del personaje.
- **Animación de hito:** celebrar una única vez la transición real de umbral, sin volver a celebrarla cada vez que se abre la página.

## Casos de prueba recomendados

0; 24,99; 25; 49,99; 50; 74,99; 75; 99,99; 100; guardar y recargar; cambiar de pestaña; comenzar nueva ronda de ejercicios; unidad vacía; almacenamiento deshabilitado; SCORM reingresado desde SIVEDUCMD.
