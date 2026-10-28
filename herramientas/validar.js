// Valida un archivo unidad_0X.json con las reglas del editor.  Uso: node herramientas/validar.js ruta/unidad_03.json
const fs = require('fs'), vm = require('vm'), path = require('path');
const kit = path.join(__dirname, '..', 'editor'), file = process.argv[2];
if (!file) { console.log('Uso: node herramientas/validar.js ruta/unidad_0X.json'); process.exit(2); }
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['contract.js', 'content_text.js', 'validation.js']) vm.runInContext(fs.readFileSync(path.join(kit, f), 'utf8'), ctx);
let unit;
try { unit = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.log('NO ES JSON VÁLIDO:', e.message); process.exit(1); }
try {
  ctx.PACEValidation.validate(unit, {});
  const n = (k) => unit.stations.reduce((t, s) => t + (s[k] ? s[k].length : 0), 0);
  console.log('VALIDACIÓN OK · unidad', unit.id, '· estaciones:', unit.stations.length, '· minutos:', unit.stations.reduce((t, s) => t + s.minutes, 0),
    '· preguntas Practica:', n('practice'), '· Aplica (banco):', unit.stations.length + n('checks'));
} catch (e) { console.log('VALIDACIÓN FALLA:', e.message); process.exit(1); }
