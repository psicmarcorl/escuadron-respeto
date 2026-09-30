/**
 * ESCUADRÓN RESPETO · Registro de resultados en Google Sheets
 * ------------------------------------------------------------
 * 1. Crea una hoja de cálculo nueva en Google Drive.
 * 2. Menú Extensiones → Apps Script. Borra lo que aparezca y pega TODO este código.
 * 3. Guarda. Elige la función "configurar" y da clic en Ejecutar (autoriza los permisos).
 * 4. Implementar → Nueva implementación → tipo "Aplicación web".
 *      Ejecutar como: Yo    ·    Quién tiene acceso: Cualquier usuario
 * 5. Copia la URL que termina en /exec y pégala en js/datos.js (CONFIG.urlRegistro).
 */

const CLAVE = 'respeto112'; // Debe ser igual a CONFIG.claveRegistro en js/datos.js

const ENCABEZADOS = ['Fecha', 'Nombre', 'Grupo', 'Puntos', 'Resultado', 'Nivel alcanzado',
  'Frases transformadas', 'Correctas', 'Respondidas', '% aciertos', 'Minutos jugados',
  'Preguntas falladas', 'ID'];

function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let reg = libro.getSheetByName('Registros') || libro.insertSheet('Registros', 0);
  reg.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS])
    .setFontWeight('bold').setBackground('#1F3864').setFontColor('#FFFFFF');
  reg.setFrozenRows(1);
  reg.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  reg.getRange('J:J').setNumberFormat('0%');
  reg.setColumnWidth(2, 200); reg.setColumnWidth(12, 420);

  let rk = libro.getSheetByName('Ranking') || libro.insertSheet('Ranking', 1);
  rk.clear();
  rk.getRange('A1').setValue('Ranking por estudiante (mejor puntaje). Se actualiza solo; puedes filtrar por grupo.')
    .setFontStyle('italic');
  rk.getRange('A2').setFormula(
    '=IFERROR(QUERY(Registros!B2:K, "select B, C, max(D), count(D), max(F), sum(H), sum(I), sum(G), sum(K) ' +
    'where B is not null group by B, C order by max(D) desc ' +
    'label B \'Nombre\', C \'Grupo\', max(D) \'Mejor puntaje\', count(D) \'Partidas\', max(F) \'Nivel máximo\', ' +
    'sum(H) \'Correctas (total)\', sum(I) \'Respondidas (total)\', sum(G) \'Frases transformadas\', sum(K) \'Minutos totales\'", 0), ' +
    '"Aún no hay registros")');
  rk.getRange('A2:I2').setFontWeight('bold').setBackground('#1F3864').setFontColor('#FFFFFF');
  rk.setFrozenRows(2);
  rk.setColumnWidth(1, 220);

  const hoja1 = libro.getSheetByName('Hoja 1') || libro.getSheetByName('Sheet1');
  if (hoja1 && hoja1.getLastRow() === 0 && libro.getSheets().length > 2) libro.deleteSheet(hoja1);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.clave !== CLAVE) return salida({ ok: false, error: 'clave' });

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registros');
    const id = texto(d.id, 30);
    // Evita duplicados si el mismo resultado se reenvía
    if (id && hoja.getLastRow() > 1) {
      const ids = hoja.getRange(2, 13, hoja.getLastRow() - 1, 1).getValues().flat();
      if (ids.indexOf(id) !== -1) return salida({ ok: true, duplicado: true });
    }
    const correctas = numero(d.correctas), respondidas = numero(d.respondidas);
    hoja.appendRow([
      new Date(), texto(d.nombre, 60), texto(d.grupo, 30), numero(d.puntos), texto(d.resultado, 40),
      numero(d.nivel), numero(d.frases), correctas, respondidas,
      respondidas ? correctas / respondidas : '', numero(d.minutos), texto(d.falladas, 1500), id
    ]);
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return salida({ ok: true, mensaje: 'Registro de Escuadrón Respeto activo' });
}

// Limpia el texto para evitar fórmulas inyectadas en la hoja
function texto(v, max) {
  let s = String(v == null ? '' : v).slice(0, max).trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function numero(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
