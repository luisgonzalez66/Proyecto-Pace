# PACE UACh · Curso de nivelación matemática (proyecto conjunto)

Tres unidades, una por persona, hechas con el editor PACE:

| Unidad | Tema | Carpeta |
|---|---|---|
| I | Números reales | `unidades/u1/` |
| II | Factorizaciones | `unidades/u2/` |
| III | Ecuaciones (lineales y cuadráticas) | `unidades/u3/` |

```
editor/        El editor y el motor (kit PACE con mejoras). Solo lo modifica la administración.
unidades/      Una carpeta por unidad: unidad_0X.json (el contenido) y recursos/ (imágenes, PDF, videos).
herramientas/  Scripts para pasar el trabajo entre el editor y el repositorio.
.github/       Reglas automáticas de permisos (solo administración).
```

## Quién puede qué
* **Todos** pueden leer y descargar todo el proyecto.
* **Cada integrante** solo puede cambiar **su** unidad (`unidades/uX/`).
* **La administración** (Luis) además puede cambiar el editor y el motor (`editor/`).

El control es automático: todo cambio entra por un *Pull Request* y una verificación revisa que solo toques lo tuyo y que tu unidad pase la validación del editor. Si no pasa, GitHub no deja unirlo.

## Cómo trabajar (con GitHub Desktop)
1. **Una sola vez:** instala [GitHub Desktop](https://desktop.github.com), inicia sesión y elige *File → Clone repository* para descargar este proyecto.
2. **Cada día, antes de empezar:** pulsa **Fetch origin** y luego **Pull** (trae lo último).
3. Crea una **rama** para tu trabajo: *Branch → New branch*, con un nombre como `u1-estacion-3`.
4. **Abre tu unidad en el editor:**
   * Con Python: `python3 herramientas/empaquetar.py u1` crea `paquetes_locales/PAQUETE_UNIDAD_01.zip`.
   * Sin Python: en la carpeta de tu unidad selecciona `unidad_0X.json` y la carpeta `recursos`, clic derecho → *Comprimir* (Mac) o *Enviar a → Carpeta comprimida* (Windows).
   * Abre `editor/EDITOR_PACE.html` en **Chrome o Edge**, desde su carpeta (no lo muevas de ahí) y elige *Abrir paquete ZIP*.
5. Edita y, al terminar, pulsa **Exportar unidad + HTML + SCORM**. Se descarga `ENTREGA_UNIDAD_0X.zip`. **Guárdalo:** es tu respaldo y lo que se entrega a coordinación.
6. **Devuelve el trabajo al repositorio:**
   * Con Python: `python3 herramientas/desempaquetar.py ~/Descargas/ENTREGA_UNIDAD_0X.zip`.
   * Sin Python: abre el ZIP y copia `unidad_0X.json` (y la carpeta `recursos`, si existe) a `unidades/uX/`, reemplazando lo anterior.
7. En GitHub Desktop verás los cambios. Escribe un mensaje breve (ej. «Estación 3: ejercicios de factorización»), pulsa **Commit** y luego **Push origin**.
8. Pulsa **Create Pull Request**. En la página que se abre, espera la marca verde de *Verificar permisos* (1–2 minutos) y pulsa **Merge pull request**.

Si la verificación sale roja, abre el detalle (*Details*): dice qué archivo no te corresponde o qué parte de tu unidad no pasa la validación.

## Reglas simples
* Una persona por unidad. Si necesitas algo de otra unidad, pídeselo a su responsable.
* **Nunca** edites a mano `unidad_0X.json`: usa siempre el editor.
* No cambies de lugar archivos de `editor/` ni abras el editor desde dentro de un ZIP.
* Montos en pesos: escribe «CLP 3000», no «$3000» (el signo $ se confunde con fórmulas).
* El banco de preguntas exportado contiene respuestas: no se carga como material del estudiante.
* Si dos personas editaran el mismo archivo, uno de los dos tendría que rehacer su trabajo: por eso cada unidad es de una sola persona.

## Qué tiene de especial este editor
Sorteo de ejercicios por estudiante, repetición con ejercicios nuevos, respuesta escrita con teclado, mapa por bloques, botón «Mapa» y racha de días. Detalle y advertencias en `editor/CAMBIOS_RESPECTO_AL_KIT_OFICIAL.md`.
