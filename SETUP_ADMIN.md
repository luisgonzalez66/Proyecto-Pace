# Puesta en marcha (solo administración)

Hazlo una vez. Dura unos 15 minutos.

## 1. Crear el repositorio
1. En github.com: **+ → New repository**. Nombre sugerido: `pace-curso`.
2. **Público o privado:** las reglas de protección de rama (paso 4) solo están disponibles en repositorios **privados** con plan de pago (Pro/Team). En plan gratuito, o es público, o no habrá protección real. Un repositorio **público** deja visibles a cualquiera las respuestas y el contenido del curso.
3. No marques «Add a README» (el proyecto ya trae uno).

## 2. Subir el contenido
Con GitHub Desktop: *File → Add local repository…*, elige la carpeta `pace-curso` (si pregunta, *create a repository*), pulsa **Commit to main** y **Publish repository** (elige el repositorio recién creado o publícalo con el mismo nombre).
(Subirlo por la web no sirve: la carpeta `.github` es oculta y no se arrastra bien.)

## 3. Escribir los usuarios
Edita `.github/propietarios.json` (puedes hacerlo en la web con el lápiz): reemplaza `USUARIO-UNIDAD-1` y `USUARIO-UNIDAD-2` por los usuarios reales de GitHub de las otras dos personas, **en minúsculas**. Si una de ellas también va a trabajar en la Unidad 3, o tú necesitas dar otra ruta, se agrega ahí.
Ejemplo:
```json
"maria-perez": ["unidades/u1/"]
```

## 4. Invitar y proteger
1. **Settings → Collaborators → Add people**: invita a cada integrante con rol **Write**.
2. **Settings → Rules → Rulesets → New ruleset → New branch ruleset**:
   * Nombre: `proteger main`; *Enforcement*: **Active**; *Target branches*: **Include default branch**.
   * **Bypass list:** agrega *Repository admin* (así tú puedes subir cambios del editor directo).
   * Marca **Restrict deletions** y **Block force pushes**.
   * Marca **Require a pull request before merging** con *Required approvals* en **0**.
   * Marca **Require status checks to pass** y agrega **Verificar permisos**. (Aparece en el buscador solo después de que corra una vez: abre antes un PR de prueba, por ejemplo cambiando una coma en la Unidad 3, y espera la marca verde.)
3. **Settings → Actions → General**: deja *Allow all actions* y, abajo, *Workflow permissions: Read repository contents*.

## 5. Probarlo
* Que una de las personas haga un cambio en su unidad por PR: debe quedar verde y poder unirse.
* Que intente tocar otra unidad o `editor/`: debe quedar **rojo** y bloquear el botón de unir.

## Qué hace y qué no hace esta protección
* Con rol Write, GitHub deja leer y descargar todo, y permite subir ramas. Lo que **impide** el ruleset es unir a `main` algo que toque archivos ajenos.
* Todo el que tenga acceso puede ver y descargar el repositorio completo, incluidas las otras unidades.
* La verificación se ejecuta con el flujo de la rama principal (no con el del PR), por lo que nadie puede saltársela editando `.github/` en su rama; esos cambios solo los puede unir la administración.
* Si más adelante quieres publicar páginas (GitHub Pages) o guardar las entregas en el repositorio, se agrega aparte.
