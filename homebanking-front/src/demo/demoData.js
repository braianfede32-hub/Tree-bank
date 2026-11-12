// ============================================================
// demo/demoData.js — DATOS SEMILLA DE LA CUENTA DE PRUEBA (/test)
//
// Todo lo de acá es ficticio. Los CBU empiezan con 999 a propósito: no existen
// en el Banco Central ni en la base real, así que aunque algo se filtrara no
// podría coincidir con una cuenta de verdad.
// ============================================================

// CBU ficticio de 22 dígitos: "999" + número de cuenta rellenado con ceros
export const cbuDemo = (n) => `999${String(n).padStart(19, '0')}`;

export const ID_PERSONA = 900001;
export const ID_CUENTA = 900001;
export const ID_PRODUCTO = 900001;
export const DNI_DEMO = '00000000';
export const CBU_PROPIO = cbuDemo(1);

// Secciones que la cuenta de prueba sí incluye. Las demás (préstamos, tarjetas,
// inversiones…) necesitan servicios reales del banco y se muestran como
// "disponible para clientes". /reportar-problema no está acá porque no
// pasa por RutaPrivada.
export const RUTAS_DEMO = ['/dashboard', '/transferencias', '/historial', '/depositos', '/perfil'];

// Gente a la que se le puede transferir (buscable por CBU o por alias)
export const DIRECTORIO = [
  { nombre: 'Lucía',     apellido: 'Fernández', cbu: cbuDemo(101), alias: 'lucia.fernandez',  banco: 'Tree Bank' },
  { nombre: 'Martín',    apellido: 'Rodríguez', cbu: cbuDemo(102), alias: 'martin.rodriguez', banco: 'Tree Bank' },
  { nombre: 'Valentina', apellido: 'Suárez',    cbu: cbuDemo(103), alias: 'vale.suarez',      banco: 'Tree Bank' },
  { nombre: 'Panadería La Espiga', apellido: null, cbu: cbuDemo(104), alias: 'panaderia.espiga', banco: 'Tree Bank' },
  { nombre: 'Estudio Contable Demo', apellido: null, cbu: cbuDemo(105), alias: 'estudio.demo', banco: 'Banco Ejemplo' },
  { nombre: 'Comercio Demo', apellido: null,    cbu: cbuDemo(106), alias: 'comercio.demo',    banco: 'Banco Ejemplo' },
];

const dir = (alias) => DIRECTORIO.find((d) => d.alias === alias);
const nombreCompleto = (d) => [d.nombre, d.apellido].filter(Boolean).join(' ');

// [días atrás, hora, minuto, tipo_movimiento, monto, descripción, alias de la contraparte (si hay)]
const MOVIMIENTOS_SEMILLA = [
  [86, 10, 15, 'TRANSFERENCIA_INGRESO', 480000, 'Sueldo',               'estudio.demo'],
  [84, 12, 30, 'SERVICIO_PAGO',          18450, 'Pago de luz'],
  [83,  9, 10, 'SERVICIO_PAGO',           9800, 'Pago de agua'],
  [80, 18,  5, 'TRANSFERENCIA_EGRESO',   45000, 'Alquiler compartido',  'martin.rodriguez'],
  [78, 14, 20, 'RECARGA_CELULAR',         3000, 'Recarga Movistar · 1100000000'],
  [75, 11,  0, 'TARJETA_PAGO',           85000, 'Pago de resumen VISA'],
  [72, 19, 40, 'TRANSFERENCIA_EGRESO',   12500, 'Cena',                 'lucia.fernandez'],
  [70, 10, 30, 'DEPOSITO',              150000, 'Depósito en efectivo'],
  [66, 16, 15, 'TRANSFERENCIA_INGRESO',  22000, 'Cena',                 'lucia.fernandez'],
  [62, 13,  0, 'SERVICIO_PAGO',          12300, 'Pago de gas'],
  [60, 17, 45, 'SEGURO_PRIMA',            7800, 'Prima seguro de hogar'],
  [56, 10, 20, 'TRANSFERENCIA_INGRESO', 480000, 'Sueldo',               'estudio.demo'],
  [55, 12, 10, 'TRANSFERENCIA_EGRESO',   45000, 'Alquiler compartido',  'martin.rodriguez'],
  [53, 20,  0, 'TRANSFERENCIA_EGRESO',    6800, 'Panadería',            'panaderia.espiga'],
  [50,  9, 50, 'RECARGA_CELULAR',         3000, 'Recarga Movistar · 1100000000'],
  [47, 15, 30, 'TARJETA_PAGO',           92000, 'Pago de resumen VISA'],
  [45, 11, 25, 'TRANSFERENCIA_INGRESO',  35000, 'Regalo de cumpleaños', 'vale.suarez'],
  [41, 18, 10, 'SERVICIO_PAGO',          19200, 'Pago de luz'],
  [38, 10,  5, 'DEPOSITO',               80000, 'Depósito en efectivo'],
  [35, 14, 45, 'TRANSFERENCIA_EGRESO',   15000, 'Salida',               'vale.suarez'],
  [31, 12,  0, 'SERVICIO_PAGO',          10100, 'Pago de agua'],
  [27, 16, 30, 'SEGURO_PRIMA',            7800, 'Prima seguro de hogar'],
  [26, 10, 15, 'TRANSFERENCIA_INGRESO', 510000, 'Sueldo',               'estudio.demo'],
  [25, 12, 30, 'TRANSFERENCIA_EGRESO',   45000, 'Alquiler compartido',  'martin.rodriguez'],
  [21, 19, 15, 'TRANSFERENCIA_EGRESO',    9200, 'Panadería',            'panaderia.espiga'],
  [18,  9, 40, 'RECARGA_CELULAR',         3000, 'Recarga Movistar · 1100000000'],
  [15, 17, 20, 'TARJETA_PAGO',           97500, 'Pago de resumen VISA'],
  [12, 13, 35, 'TRANSFERENCIA_INGRESO',  18000, 'Entradas',             'martin.rodriguez'],
  [ 9, 11, 50, 'SERVICIO_PAGO',          13400, 'Pago de gas'],
  [ 6, 20,  5, 'TRANSFERENCIA_EGRESO',   24000, 'Cena',                 'lucia.fernandez'],
  [ 3, 10, 45, 'DEPOSITO',               60000, 'Depósito en efectivo'],
  [ 1, 15, 10, 'TRANSFERENCIA_INGRESO',  12000, 'Devolución',           'lucia.fernandez'],
];

const INGRESOS = new Set(['TRANSFERENCIA_INGRESO', 'DEPOSITO']);
export const esIngreso = (tipo) => INGRESOS.has(tipo);

// Estado de arranque de una sesión de prueba. Siempre se arma de cero: nada de
// lo que se hizo en una sesión anterior sobrevive a la siguiente.
export function crearEstadoInicial(ahora = new Date()) {
  const movimientos = MOVIMIENTOS_SEMILLA
    .map(([dias, hora, minuto, tipo, monto, descripcion, alias]) => {
      const fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() - dias);
      fecha.setHours(hora, minuto, 0, 0);
      const contraparte = alias ? dir(alias) : null;
      return {
        id_cuenta: ID_CUENTA,
        tipo_movimiento: tipo,
        monto: Number(monto).toFixed(2),
        descripcion,
        fecha: fecha.toISOString(),
        cbu_contraparte: contraparte ? contraparte.cbu : null,
        nombre_contraparte: contraparte ? nombreCompleto(contraparte) : null,
      };
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((m, i) => ({ id_movimiento: ID_CUENTA * 1000 + i + 1, ...m }));

  // El saldo es exactamente la suma de los movimientos (igual que en la base real)
  const centavos = movimientos.reduce(
    (suma, m) => suma + (esIngreso(m.tipo_movimiento) ? 1 : -1) * Math.round(Number(m.monto) * 100),
    0
  );

  return {
    usuario: {
      id: ID_PERSONA,
      nombre: 'Usuario',
      apellido: 'de Prueba',
      dni: DNI_DEMO,
      roles: ['Cliente Regular'],
      esAdmin: false,
      esEmpleado: false,
      demo: true, // marca la sesión: el front la reconoce y nunca pide nada al servidor
    },
    persona: {
      id: ID_PERSONA,
      nombre: 'Usuario',
      apellido: 'de Prueba',
      dni: DNI_DEMO,
      email: 'prueba@treebank.demo',
      telefono: '1100000000',
      direccion: 'Calle Falsa 123',
      sexo: 'Otro',
      fecha_nac: '1995-01-01',
    },
    cuenta: {
      id_producto: ID_PRODUCTO,
      tipo: 'CAJA_AHORRO',
      estado: 'ACTIVO',
      id_cuenta: ID_CUENTA,
      cbu: CBU_PROPIO,
      alias: 'prueba.treebank',
      moneda: 'ARS',
      saldo: centavos / 100,
      reservado: '0',
    },
    movimientos,
    reportes: [],
    siguienteId: movimientos.length + 1,
  };
}
