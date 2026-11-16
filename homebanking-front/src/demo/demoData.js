// ============================================================
// demo/demoData.js — DATOS SEMILLA DE LA CUENTA DE PRUEBA (/test)
//
// Todo lo de acá es ficticio. Los CBU empiezan con 999 a propósito: no existen
// en el Banco Central ni en la base real, así que aunque algo se filtrara no
// podría coincidir con una cuenta de verdad.
//
// La cuenta de prueba incluye TODAS las secciones del banco (transferencias,
// préstamos, tarjetas, seguros, inversiones, cambio de dólares…). Todo se
// resuelve en el navegador (ver demoApi.js) y arranca de cero en cada sesión.
// ============================================================
import { infoMovimiento } from '../data/categoriasMovimiento';

// Versión del formato del estado guardado: si cambia, una sesión vieja que
// haya quedado en el sessionStorage se descarta en vez de romper las pantallas.
export const VERSION_ESTADO = 2;

// CBU ficticio de 22 dígitos: "999" + número de cuenta rellenado con ceros
export const cbuDemo = (n) => `999${String(n).padStart(19, '0')}`;

export const ID_PERSONA = 900001;
export const ID_CUENTA = 900001;      // caja de ahorro en pesos
export const ID_CUENTA_USD = 900002;  // caja de ahorro en dólares
export const ID_PRODUCTO = 900001;
export const ID_PRODUCTO_USD = 900002;
export const DNI_DEMO = '00000000';
export const CBU_PROPIO = cbuDemo(1);
export const CBU_PROPIO_USD = cbuDemo(2);

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
const MOVIMIENTOS_ARS = [
  [88, 10,  0, 'DEPOSITO',              400000, 'Depósito en efectivo'],
  [86, 10, 15, 'TRANSFERENCIA_INGRESO', 480000, 'Sueldo',               'estudio.demo'],
  [84, 12, 30, 'SERVICIO_PAGO',          18450, 'Pago de luz: Edenor · Cliente 4821937'],
  [83,  9, 10, 'SERVICIO_PAGO',           9800, 'Pago de agua: Aguas del Plata · Cliente 7730215'],
  [80, 18,  5, 'TRANSFERENCIA_EGRESO',   45000, 'Alquiler compartido',  'martin.rodriguez'],
  [78, 14, 20, 'RECARGA_CELULAR',         3000, 'Recarga Movistar · 1100000000'],
  [75, 11,  0, 'TARJETA_PAGO',           85000, 'Pago de resumen de tarjeta'],
  [72, 19, 40, 'TRANSFERENCIA_EGRESO',   12500, 'Cena',                 'lucia.fernandez'],
  [70, 10, 30, 'DEPOSITO',              150000, 'Depósito en efectivo'],
  [66, 16, 15, 'TRANSFERENCIA_INGRESO',  22000, 'Cena',                 'lucia.fernandez'],
  [62, 13,  0, 'SERVICIO_PAGO',          12300, 'Pago de gas: Metrogas · Cliente 1560044'],
  [60, 17, 45, 'SEGURO_PRIMA',            1800, 'Alta de poliza hogar: primera prima'],
  [56, 10, 20, 'TRANSFERENCIA_INGRESO', 480000, 'Sueldo',               'estudio.demo'],
  [55, 12, 10, 'TRANSFERENCIA_EGRESO',   45000, 'Alquiler compartido',  'martin.rodriguez'],
  [53, 20,  0, 'TRANSFERENCIA_EGRESO',    6800, 'Panadería',            'panaderia.espiga'],
  [50,  9, 50, 'RECARGA_CELULAR',         3000, 'Recarga Movistar · 1100000000'],
  [47, 15, 30, 'TARJETA_PAGO',           92000, 'Pago de resumen de tarjeta'],
  [45, 11, 25, 'TRANSFERENCIA_INGRESO',  35000, 'Regalo de cumpleaños', 'vale.suarez'],
  [44, 11,  0, 'CAMBIO_EGRESO',         580000, 'Compra de USD 400 a $1450'],
  [41, 18, 10, 'SERVICIO_PAGO',          19200, 'Pago de luz: Edenor · Cliente 4821937'],
  [38, 10,  5, 'DEPOSITO',               80000, 'Depósito en efectivo'],
  [35, 14, 45, 'TRANSFERENCIA_EGRESO',   15000, 'Salida',               'vale.suarez'],
  [31, 12,  0, 'SERVICIO_PAGO',          10100, 'Pago de agua: Aguas del Plata · Cliente 7730215'],
  [30, 11, 30, 'COMPRA_ACCION',         414000, 'Compra de 60 GGAL a ARS 6900'],
  [27, 16, 30, 'SEGURO_PRIMA',            1800, 'Pago de prima: poliza hogar'],
  [26, 10, 15, 'TRANSFERENCIA_INGRESO', 510000, 'Sueldo',               'estudio.demo'],
  [25, 12, 30, 'TRANSFERENCIA_EGRESO',   45000, 'Alquiler compartido',  'martin.rodriguez'],
  [21, 19, 15, 'TRANSFERENCIA_EGRESO',    9200, 'Panadería',            'panaderia.espiga'],
  [18,  9, 40, 'RECARGA_CELULAR',         3000, 'Recarga Movistar · 1100000000'],
  [15, 17, 20, 'TARJETA_PAGO',           97500, 'Pago de resumen de tarjeta'],
  [12, 13, 35, 'TRANSFERENCIA_INGRESO',  18000, 'Entradas',             'martin.rodriguez'],
  [ 9, 11, 50, 'SERVICIO_PAGO',          13400, 'Pago de gas: Metrogas · Cliente 1560044'],
  [ 6, 20,  5, 'TRANSFERENCIA_EGRESO',   24000, 'Cena',                 'lucia.fernandez'],
  [ 3, 10, 45, 'DEPOSITO',               60000, 'Depósito en efectivo'],
  [ 1, 15, 10, 'TRANSFERENCIA_INGRESO',  12000, 'Devolución',           'lucia.fernandez'],
];

const MOVIMIENTOS_USD = [
  [88, 10, 30, 'DEPOSITO',        600, 'Depósito en efectivo'],
  [44, 11,  0, 'CAMBIO_INGRESO',  400, 'Compra de USD a $1450'],
  [20, 11, 45, 'COMPRA_ACCION',   615, 'Compra de 3 AAPL a USD 205'],
];

export const esIngreso = (tipo) => infoMovimiento(tipo).signo === 'in';

const fechaHace = (ahora, dias, hora, minuto) => {
  const fecha = new Date(ahora);
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha;
};

export const soloFecha = (fecha) => fecha.toISOString().slice(0, 10);

export const masMeses = (fecha, meses) => {
  const f = new Date(fecha);
  f.setMonth(f.getMonth() + meses);
  return f;
};

// Arma los movimientos de una caja a partir de la lista semilla
const armarMovimientos = (semilla, idCuenta, ahora) =>
  semilla.map(([dias, hora, minuto, tipo, monto, descripcion, alias]) => {
    const contraparte = alias ? dir(alias) : null;
    return {
      id_cuenta: idCuenta,
      tipo_movimiento: tipo,
      monto: Number(monto).toFixed(2),
      descripcion,
      fecha: fechaHace(ahora, dias, hora, minuto).toISOString(),
      cbu_contraparte: contraparte ? contraparte.cbu : null,
      nombre_contraparte: contraparte ? nombreCompleto(contraparte) : null,
    };
  });

// El saldo es exactamente la suma de los movimientos (igual que en la base real)
const saldoDe = (movimientos) =>
  movimientos.reduce(
    (suma, m) => suma + (esIngreso(m.tipo_movimiento) ? 1 : -1) * Math.round(Number(m.monto) * 100),
    0
  ) / 100;

// Estado de arranque de una sesión de prueba. Siempre se arma de cero: nada de
// lo que se hizo en una sesión anterior sobrevive a la siguiente.
export function crearEstadoInicial(ahora = new Date()) {
  const movimientos = [
    ...armarMovimientos(MOVIMIENTOS_ARS, ID_CUENTA, ahora),
    ...armarMovimientos(MOVIMIENTOS_USD, ID_CUENTA_USD, ahora),
  ]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((m, i) => ({ id_movimiento: ID_CUENTA * 1000 + i + 1, ...m }));

  const deCuenta = (id) => movimientos.filter((m) => m.id_cuenta === id);

  return {
    version: VERSION_ESTADO,
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
    cuentas: [
      {
        id_producto: ID_PRODUCTO,
        tipo: 'CAJA_AHORRO',
        estado: 'ACTIVO',
        id_cuenta: ID_CUENTA,
        cbu: CBU_PROPIO,
        alias: 'prueba.treebank',
        moneda: 'ARS',
        saldo: saldoDe(deCuenta(ID_CUENTA)),
      },
      {
        id_producto: ID_PRODUCTO_USD,
        tipo: 'CAJA_AHORRO',
        estado: 'ACTIVO',
        id_cuenta: ID_CUENTA_USD,
        cbu: CBU_PROPIO_USD,
        alias: 'prueba.treebank.usd',
        moneda: 'USD',
        saldo: saldoDe(deCuenta(ID_CUENTA_USD)),
      },
    ],
    movimientos,
    reservas: [
      {
        id_reserva: 1,
        id_cuenta: ID_CUENTA,
        nombre: 'Vacaciones',
        monto: '150000.00',
        fecha_creacion: fechaHace(ahora, 40, 12, 0).toISOString(),
      },
    ],
    tarjetas: [
      {
        id_tarjeta: 1,
        id_producto: 900101,
        numero_tarjeta: '4556000000000001',
        marca: 'VISA',
        fecha_vencimiento: soloFecha(masMeses(ahora, 54)),
        limite_compra: '300000.00',
        dia_cierre: 10,
        saldo_consumido: '48500.00',
        codigo_seguridad: '123',
        estado: 'ACTIVO',
      },
    ],
    polizas: [
      {
        id_poliza: 1,
        id_producto: 900201,
        tipo_seguro: 'HOGAR',
        cobertura: '3000000.00',
        prima_mensual: '1800.00',
        fecha_alta: fechaHace(ahora, 60, 17, 45).toISOString(),
        fecha_proximo_pago: soloFecha(fechaHace(ahora, -3, 12, 0)),
        estado: 'ACTIVO',
      },
    ],
    prestamos: [],
    cauciones: [],
    tenencias: [
      {
        id_tenencia: 1, id_persona: ID_PERSONA, mercado: 'ACCION_AR', simbolo: 'GGAL',
        cantidad: '60.000000', precio_promedio: '6900.0000', moneda: 'ARS',
        fecha_actualizacion: fechaHace(ahora, 30, 11, 30).toISOString(),
      },
      {
        id_tenencia: 2, id_persona: ID_PERSONA, mercado: 'ACCION_EX', simbolo: 'AAPL',
        cantidad: '3.000000', precio_promedio: '205.0000', moneda: 'USD',
        fecha_actualizacion: fechaHace(ahora, 20, 11, 45).toISOString(),
      },
    ],
    reportes: [],
    // Contadores para los ids de lo que se vaya creando durante la sesión
    siguiente: {
      movimiento: movimientos.length + 1,
      reserva: 2,
      tarjeta: 2,
      poliza: 2,
      prestamo: 1,
      caucion: 1,
      tenencia: 3,
      producto: 900300,
    },
  };
}
