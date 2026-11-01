# Nota técnica para Luis — propuesta de integración sin modificar el repositorio

**Objetivo:** evaluar en la Unidad III, donde la mascota experimental ya se puede observar, el reemplazo visual opcional por el chucao y luego una evolución de cinco etapas. Este paquete **no modifica GitHub ni los paquetes SCORM existentes**.

## Arquitectura sugerida

1. Conservar el componente de mascota que maneje el motor; no repetir assets manualmente en cada actividad de cada docente.
2. Incorporar las cinco imágenes base como recursos estáticos junto al motor, preferentemente WebP optimizado, con fallback PNG cuando se requiera.
3. Reutilizar **el porcentaje persistido que ya calcula y guarda el motor**. No introducir otra variable de progreso para la mascota.
4. Evaluar `etapa = (p >= 100 ? 5 : p >= 75 ? 4 : p >= 50 ? 3 : p >= 25 ? 2 : 1)` usando el porcentaje real antes de redondear.
5. Permitir configurar `mascota = pinguino | chucao` en modo desarrollo/piloto hasta tener aprobación del equipo y evaluación en móvil.
6. Cambiar la imagen cuando el avance se actualice, tras restaurar datos guardados y cuando se reingrese al SCORM.
7. Conservar las frases y los accesorios actuales **solo si siguen siendo pedagógicamente pertinentes**; no presupone que se haya replicado cada gesto del pingüino.
8. Al publicar, asegurar que exportador/compilador incluya cada imagen en el ZIP SCORM y que sus rutas figuren en el manifiesto cuando corresponda.
9. No forzar carga de imágenes externas ni dependencias de internet: los recursos deben quedar incluidos en el paquete para funcionamiento sin conexión.
10. Evitar cambios en las rutinas de avance, guardado, repetición, calificaciones y comunicación SCORM 1.2.

## Ejemplo de regla (seudocódigo JavaScript)

```js
function etapaChucao(p) {
  if (!Number.isFinite(p)) return null;
  const avance = Math.max(0, Math.min(100, p));
  if (avance >= 100) return 5;
  if (avance >= 75) return 4;
  if (avance >= 50) return 3;
  if (avance >= 25) return 2;
  return 1;
}
```

*Ejemplo orientativo, no un parche del motor existente.*

## Prueba piloto realista en Unidad III

- Comparar pingüino vs. chucao a 96, 128 y 180 px.
- Medir legibilidad, espacio disponible y posicionamiento del globo de texto en móvil.
- Simular avances 0/25/50/75/100 y comprobar hitos exactos.
- Verificar reentrada SCORM y conservación del 100 % al repetir prácticas si esa es la política del motor.
- Verificar descarga/exportación de una unidad y curso integrado, si este último flujo está en uso.
- Probar navegación con teclado, texto alternativo y movimiento reducido.

## Limitaciones explícitas

- Los PNG no son SVG vectoriales ni contienen huesos/capas articuladas listas para animar cabeza, alas u ojos por separado.
- La demo incluida **solo cambia de imagen por avance simulado**. No guarda datos ni se conecta al SCORM.
- Para gestos dinámicos complejos hará falta producir recursos nuevos y decidir si usar WebP por pose, sprites, animaciones 2D o rig vectorial.
- Las ilustraciones con cálculos no deben reemplazar contenido docente validado, porque son decorativas y podrían contener errores o elementos fuera del programa.
