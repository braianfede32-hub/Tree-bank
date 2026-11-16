// ============================================================
// demo/demoApi.js — "BACKEND" FALSO DE LA CUENTA DE PRUEBA
//
// Es un adapter de axios: cuando hay una sesión demo activa, api.js le pasa
// TODOS los pedidos a esta función en vez de mandarlos por la red. Ningún
// pedido sale del navegador, así que es imposible que una operación de prueba
// toque el banco real: ni el Banco Central, ni Supabase, ni otros clientes.
//
// Replica las reglas del backend real (saldos, límites, tasas, mensajes de
// error) para TODAS las secciones: transferencias, depósitos, préstamos,
// tarjetas, seguros, reservas, servicios, recargas, cambio de dólares,
// acciones y cauciones. Lo que se hace queda solo en esta pestaña.
//
// Lo que no esté contemplado acá se rechaza con un 403 (nunca se deja pasar
// al servidor "por las dudas").
// ============================================================
import { AxiosError } from 'axios';
import { guardarEstado, leerEstado } from './demoStore';
import { DIRECTORIO, ID_CUENTA, soloFecha, masMeses } from './demoData';
import {
  COTIZACION_USD, MONEDA_POR_MERCADO, PLAZOS_CAUCION, buscarCotizacion, historico,
  mercadoValido, panelCotizaciones, tasaCaucion,
} from './demoMercado';

const LATENCIA_MS = 250; // para que se sienta como un banco y no como un mock instantáneo
const MONTO_MAX_TRANSFERENCIA = 100_000_000;
const MONTO_MAX_DEPOSITO = 10_000_000;
const MONTO_MAX_GENERAL = 100_000_000;
const MAX_MOVIMIENTOS = 1000;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Error con la misma forma que devuelve el backend ({ error }), para que las
// pantallas lo muestren con su código de siempre (err.response.data.error)
class ErrorDemo extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

const dosDecimales = (n) => Math.round(n * 100) / 100;
const dec = (n) => dosDecimales(Number(n)).toFixed(2); // como devuelve Postgres un DECIMAL
const fmtMonto = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

function leerMonto(valor, maximo = MONTO_MAX_GENERAL) {
  const monto = typeof valor === 'string' ? Number(valor) : valor;
  if (typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0 || dosDecimales(monto) !== monto) {
    throw new ErrorDemo(400, 'El monto debe ser un número positivo, con hasta 2 decimales');
  }
  if (monto > maximo) throw new ErrorDemo(400, `El monto máximo es $ ${fmtMonto(maximo)}`);
  return monto;
}

const nombreCompleto = (d) => [d.nombre, d.apellido].filter(Boolean).join(' ');
const ahoraISO = () => new Date().toISOString();

// ── Cuentas y saldos ────────────────────────────────────────

const cuentaPorCbu = (estado, cbu) => estado.cuentas.find((c) => c.cbu === cbu) || null;
const cuentaPorId = (estado, id) => estado.cuentas.find((c) => c.id_cuenta === id) || null;
const cuentaEnMoneda = (estado, moneda) => estado.cuentas.find((c) => c.moneda === moneda) || null;

// Lo reservado se trabaja en centavos, igual que el saldo
const reservadoCent = (estado, cuenta) =>
  estado.reservas
    .filter((r) => r.id_cuenta === cuenta.id_cuenta)
    .reduce((suma, r) => suma + Math.round(Number(r.monto) * 100), 0);

const disponible = (estado, cuenta) => (Math.round(cuenta.saldo * 100) - reservadoCent(estado, cuenta)) / 100;

const productoDe = (estado, cuenta) => ({
  ...cuenta,
  saldo: dec(cuenta.saldo),
  reservado: (reservadoCent(estado, cuenta) / 100).toFixed(2),
});

// Aplica un ingreso (+) o egreso (-) al saldo trabajando en centavos, para que
// las sumas no acumulen errores de punto flotante
function mover(cuenta, monto, signo) {
  const centavos = Math.round(cuenta.saldo * 100) + signo * Math.round(monto * 100);
  cuenta.saldo = centavos / 100;
}

// Se verifica ANTES de tocar nada que haya lugar para los movimientos de la
// operación: así una operación nunca queda a medias
function asegurarCupo(estado, cuantos = 1) {
  if (estado.movimientos.length + cuantos > MAX_MOVIMIENTOS) {
    throw new ErrorDemo(400, 'Alcanzaste el máximo de operaciones de la cuenta de prueba. Cerrá sesión para empezar de cero.');
  }
}

function registrarMovimiento(estado, cuenta, datos) {
  asegurarCupo(estado);
  const movimiento = {
    id_movimiento: ID_CUENTA * 1000 + estado.siguiente.movimiento,
    id_cuenta: cuenta.id_cuenta,
    fecha: ahoraISO(),
    cbu_contraparte: null,
    nombre_contraparte: null,
    ...datos,
    monto: Number(datos.monto).toFixed(2),
  };
  estado.siguiente.movimiento += 1;
  estado.movimientos.push(movimiento);
  return movimiento;
}

const exigirCuentaArs = (estado) => {
  const ars = cuentaEnMoneda(estado, 'ARS');
  if (!ars) throw new ErrorDemo(404, 'No se encontró tu cuenta en ARS');
  return ars;
};

const exigirDisponible = (estado, cuenta, monto, mensaje) => {
  const libre = disponible(estado, cuenta);
  if (Math.round(monto * 100) > Math.round(libre * 100)) {
    throw new ErrorDemo(400, mensaje(libre));
  }
};

const buscarPorId = (lista, campo, id) => lista.find((x) => x[campo] === Number(id)) || null;

// ── Cuentas, contactos y alias ──────────────────────────────

const productos = ({ estado }) => [200, estado.cuentas.map((c) => productoDe(estado, c))];

const abrirCuenta = ({ estado, body }) => {
  if (!body.moneda) throw new ErrorDemo(400, 'El campo moneda es requerido');
  if (!['ARS', 'USD'].includes(body.moneda)) throw new ErrorDemo(400, 'La moneda debe ser una de: ARS, USD');
  // La cuenta de prueba ya viene con su caja en pesos y su caja en dólares
  const cuenta = cuentaEnMoneda(estado, body.moneda);
  return [200, {
    mensaje: body.moneda === 'ARS' ? 'La cuenta en ARS ya existe' : 'La cuenta ya existia. Datos sincronizados.',
    cbu: cuenta.cbu, alias: cuenta.alias, moneda: cuenta.moneda, datos: cuenta,
  }];
};

const contactos = ({ estado }) => {
  // Igual que el backend: la última contraparte de cada transferencia, sin repetir
  const vistos = new Map();
  for (const m of [...estado.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))) {
    if (!['TRANSFERENCIA_EGRESO', 'TRANSFERENCIA_INGRESO'].includes(m.tipo_movimiento)) continue;
    if (!m.cbu_contraparte || vistos.has(m.cbu_contraparte)) continue;
    vistos.set(m.cbu_contraparte, { cbu: m.cbu_contraparte, nombre: m.nombre_contraparte, fecha: m.fecha });
  }
  return [200, [...vistos.values()]];
};

const deDirectorio = (d) => ({ nombre: d.nombre, apellido: d.apellido, cbu: d.cbu, alias: d.alias, banco: d.banco });

const buscarPorCbu = ({ params }) => {
  const [cbu] = params;
  const conocido = DIRECTORIO.find((d) => d.cbu === cbu);
  if (conocido) return [200, deDirectorio(conocido)];
  // Cualquier otro CBU de 22 dígitos se acepta como un destinatario de prueba,
  // para que quien lo prueba pueda tipear lo que quiera y ver el flujo completo
  return [200, { nombre: 'Destinatario de prueba', apellido: null, cbu, alias: null, banco: 'Banco Ejemplo' }];
};

const buscarPorAlias = ({ params }) => {
  const alias = decodeURIComponent(params[0]).trim().toLowerCase();
  const conocido = DIRECTORIO.find((d) => d.alias === alias);
  if (!conocido) {
    throw new ErrorDemo(404, 'No se encontró ese alias. En la cuenta de prueba probá con lucia.fernandez, comercio.demo o cualquier CBU de 22 dígitos.');
  }
  return [200, deDirectorio(conocido)];
};

const cambiarAlias = ({ estado, params, body }) => {
  const [cbu] = params;
  const alias = typeof body.alias === 'string' ? body.alias.trim() : '';
  if (alias.length < 3) throw new ErrorDemo(400, 'El alias debe tener al menos 3 caracteres');
  if (alias.length > 40) throw new ErrorDemo(400, 'El alias puede tener hasta 40 caracteres');
  const cuenta = cuentaPorCbu(estado, cbu);
  if (!cuenta) throw new ErrorDemo(404, 'No se encontró una cuenta con ese CBU');
  cuenta.alias = alias;
  return [200, { mensaje: 'Alias actualizado correctamente', cbu, alias }];
};

const movimientos = ({ estado, params }) => {
  const cuenta = cuentaPorId(estado, Number(params[0]));
  if (!cuenta) throw new ErrorDemo(403, 'No tenés permiso para ver estos movimientos');
  const lista = estado.movimientos
    .filter((m) => m.id_cuenta === cuenta.id_cuenta)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return [200, lista];
};

// ── Transferencias y depósitos ──────────────────────────────

const transferir = ({ estado, body }) => {
  const { cbu_origen: cbuOrigen, cbu_destino: cbuDestino, descripcion } = body;
  if (!cbuOrigen || !cbuDestino || body.monto === undefined) {
    throw new ErrorDemo(400, 'Los campos cbu_origen, cbu_destino y monto son requeridos');
  }
  const origen = cuentaPorCbu(estado, cbuOrigen);
  if (!origen) throw new ErrorDemo(403, 'No tenés permiso para transferir desde esa cuenta');
  if (!/^\d{22}$/.test(String(cbuDestino))) throw new ErrorDemo(400, 'El CBU de destino debe tener 22 dígitos');
  if (cbuDestino === origen.cbu) throw new ErrorDemo(400, 'No podés transferirte a tu propia cuenta');

  const monto = leerMonto(body.monto, MONTO_MAX_TRANSFERENCIA);
  exigirDisponible(estado, origen, monto, () => 'Saldo insuficiente');

  const destino = DIRECTORIO.find((d) => d.cbu === cbuDestino);
  const texto = typeof descripcion === 'string' ? descripcion.trim().slice(0, 255) : '';

  // Primero se registra el movimiento (es lo único que puede fallar, por el tope
  // de operaciones) y recién después se toca el saldo: nunca queda a medias
  const mov = registrarMovimiento(estado, origen, {
    tipo_movimiento: 'TRANSFERENCIA_EGRESO',
    monto,
    descripcion: texto || 'Transferencia',
    cbu_contraparte: cbuDestino,
    nombre_contraparte: destino ? nombreCompleto(destino) : 'Destinatario de prueba',
  });
  mover(origen, monto, -1);

  return [201, {
    mensaje: 'Transferencia simulada con éxito',
    ticket: { transaccionId: `DEMO-${mov.id_movimiento}`, estado: 'COMPLETADA', simulada: true },
  }];
};

const depositar = ({ estado, body }) => {
  const cuenta = cuentaPorCbu(estado, body.cbu);
  if (!cuenta) throw new ErrorDemo(403, 'No tenés permiso para depositar en esa cuenta');
  const monto = leerMonto(body.monto, MONTO_MAX_DEPOSITO);
  const texto = typeof body.descripcion === 'string' ? body.descripcion.trim().slice(0, 255) : '';

  registrarMovimiento(estado, cuenta, {
    tipo_movimiento: 'DEPOSITO',
    monto,
    descripcion: texto || 'Depósito en efectivo',
  });
  mover(cuenta, monto, 1);

  return [201, {
    mensaje: 'Depósito simulado con éxito',
    cbu: cuenta.cbu,
    monto,
    saldo_actualizado: dosDecimales(cuenta.saldo),
  }];
};

// ── Perfil ──────────────────────────────────────────────────

const perfil = ({ estado }) => [200, estado.persona];

const CAMPOS_PERFIL = ['nombre', 'apellido', 'email', 'telefono', 'direccion', 'sexo'];

const actualizarPerfil = ({ estado, body }) => {
  const cambios = {};
  for (const campo of CAMPOS_PERFIL) {
    if (body[campo] === undefined) continue;
    const valor = typeof body[campo] === 'string' ? body[campo].trim() : '';
    if (valor.length > 120) throw new ErrorDemo(400, `El campo ${campo} es demasiado largo`);
    cambios[campo] = valor;
  }
  if (cambios.nombre === '' || cambios.apellido === '') throw new ErrorDemo(400, 'El nombre y el apellido son obligatorios');
  if (cambios.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cambios.email)) throw new ErrorDemo(400, 'El formato del email no es válido');
  Object.assign(estado.persona, cambios);
  return [200, { mensaje: 'Perfil actualizado', perfil: estado.persona }];
};

const cambiarPassword = ({ body }) => {
  if (!body.password_actual) throw new ErrorDemo(400, 'Ingresá tu contraseña actual');
  if (typeof body.password_nueva !== 'string' || body.password_nueva.length < 6) {
    throw new ErrorDemo(400, 'La nueva contraseña debe tener al menos 6 caracteres');
  }
  // La cuenta de prueba no tiene contraseña: no se guarda nada
  return [200, { mensaje: 'Contraseña cambiada (simulado)' }];
};

const misReportes = ({ estado }) => [200, [...estado.reportes].reverse()];

const crearReporte = ({ estado, body }) => {
  const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : '';
  if (descripcion.length < 10) throw new ErrorDemo(400, 'Contanos el problema con al menos 10 caracteres');
  // Se guarda solo acá, en la sesión: no le llega a nadie del equipo
  estado.reportes.push({
    id: estado.reportes.length + 1,
    descripcion: descripcion.slice(0, 1000),
    pagina: typeof body.pagina === 'string' ? body.pagina.slice(0, 100) : null,
    estado: 'ABIERTO',
    fecha: ahoraISO(),
  });
  return [201, { mensaje: 'Reporte recibido (simulado)' }];
};

// ── Préstamos ───────────────────────────────────────────────

const TASAS_PRESTAMO = { 3: 8, 6: 15, 12: 28, 24: 45 }; // interés total (%) según las cuotas
const PISO_PRESTAMO = 5000;
const MULTIPLO_CAPACIDAD = 3;

// Cuánto se le puede prestar: un piso más el triple de lo que depositó o
// recibió de afuera (lo mismo que calcula el backend real)
function calcularLimite(estado) {
  const ars = exigirCuentaArs(estado);
  const capacidad = estado.movimientos
    .filter((m) => m.id_cuenta === ars.id_cuenta && ['DEPOSITO', 'TRANSFERENCIA_INGRESO'].includes(m.tipo_movimiento))
    .reduce((suma, m) => suma + Number(m.monto), 0);
  const deudaActiva = estado.prestamos
    .filter((p) => p.estado === 'ACTIVO')
    .reduce((suma, p) => suma + Number(p.saldo_pendiente), 0);
  const limitePrestable = PISO_PRESTAMO + capacidad * MULTIPLO_CAPACIDAD;
  return { limitePrestable, deudaActiva, disponibleParaPedir: Math.max(0, limitePrestable - deudaActiva) };
}

const limitePrestamo = ({ estado }) => {
  const { limitePrestable, deudaActiva, disponibleParaPedir } = calcularLimite(estado);
  return [200, {
    limite_prestable: limitePrestable,
    deuda_activa: deudaActiva,
    disponible_para_pedir: disponibleParaPedir,
  }];
};

const misPrestamos = ({ estado }) => [200, [...estado.prestamos].reverse()];

const solicitarPrestamo = ({ estado, body }) => {
  const monto = leerMonto(body.monto);
  const cuotas = Number(body.cuotas);
  if (!TASAS_PRESTAMO[cuotas]) {
    throw new ErrorDemo(400, `El plazo debe ser uno de: ${Object.keys(TASAS_PRESTAMO).join(', ')} cuotas`);
  }
  const ars = exigirCuentaArs(estado);

  const tasa = TASAS_PRESTAMO[cuotas];
  const saldoPendiente = dosDecimales(monto * (1 + tasa / 100));
  const montoCuota = dosDecimales(saldoPendiente / cuotas);

  const { limitePrestable, deudaActiva, disponibleParaPedir } = calcularLimite(estado);
  if (deudaActiva + saldoPendiente > limitePrestable) {
    throw new ErrorDemo(400,
      `Este prestamo (con intereses, $ ${saldoPendiente.toFixed(2)}) supera lo que se te puede prestar según tu movimiento real en el banco. ` +
      `Podés pedir hasta $ ${disponibleParaPedir.toFixed(2)} más (límite total: $ ${limitePrestable.toFixed(2)}, calculado sobre lo que depositaste o recibiste).`);
  }

  asegurarCupo(estado);
  const hoy = new Date();
  const prestamo = {
    id_prestamo: estado.siguiente.prestamo,
    id_producto: estado.siguiente.producto,
    monto: dec(monto),
    tasa_interes: dec(tasa),
    cuotas_totales: cuotas,
    cuotas_pagadas: 0,
    monto_cuota: dec(montoCuota),
    saldo_pendiente: dec(saldoPendiente),
    situacion_al_otorgar: 1,
    fecha_alta: hoy.toISOString(),
    fecha_proximo_vencimiento: soloFecha(masMeses(hoy, 1)),
    estado: 'ACTIVO',
  };
  estado.siguiente.prestamo += 1;
  estado.siguiente.producto += 1;
  estado.prestamos.push(prestamo);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'PRESTAMO_OTORGADO',
    monto,
    descripcion: `Prestamo otorgado en ${cuotas} cuotas`,
  });
  mover(ars, monto, 1);

  return [201, { mensaje: 'Prestamo aprobado y acreditado en tu cuenta', situacion_al_otorgar: 1, prestamo }];
};

const pagarCuota = ({ estado, params }) => {
  const prestamo = buscarPorId(estado.prestamos, 'id_prestamo', params[0]);
  if (!prestamo) throw new ErrorDemo(404, 'No se encontro el prestamo');
  if (prestamo.estado !== 'ACTIVO') {
    throw new ErrorDemo(409, `Este prestamo esta ${prestamo.estado.toLowerCase()}, no se le pueden pagar cuotas`);
  }
  if (prestamo.cuotas_pagadas >= prestamo.cuotas_totales) throw new ErrorDemo(409, 'Ya se pagaron todas las cuotas de este prestamo');

  const ars = exigirCuentaArs(estado);
  const cuota = Number(prestamo.monto_cuota);
  exigirDisponible(estado, ars, cuota, (libre) => `Saldo disponible insuficiente para pagar la cuota (disponible: $ ${libre.toFixed(2)})`);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'PRESTAMO_CUOTA',
    monto: cuota,
    descripcion: `Cuota ${prestamo.cuotas_pagadas + 1}/${prestamo.cuotas_totales} del prestamo`,
  });
  mover(ars, cuota, -1);

  prestamo.cuotas_pagadas += 1;
  const ultima = prestamo.cuotas_pagadas >= prestamo.cuotas_totales;
  prestamo.saldo_pendiente = ultima ? '0.00' : dec(Math.max(0, Number(prestamo.saldo_pendiente) - cuota));
  if (ultima) prestamo.estado = 'CERRADO';
  else prestamo.fecha_proximo_vencimiento = soloFecha(masMeses(new Date(prestamo.fecha_proximo_vencimiento), 1));

  return [200, { mensaje: 'Cuota pagada correctamente', prestamo }];
};

// ── Compra y venta de dólares ───────────────────────────────

const cotizacionDolar = () => [200, { ...COTIZACION_USD }];

const realizarCambio = ({ estado, body }) => {
  const { operacion } = body;
  if (!['COMPRA', 'VENTA'].includes(operacion)) throw new ErrorDemo(400, 'La operacion debe ser COMPRA o VENTA');
  const montoUsd = Number(body.monto);
  if (!Number.isFinite(montoUsd) || montoUsd <= 0 || dosDecimales(montoUsd) !== montoUsd) {
    throw new ErrorDemo(400, 'El monto en USD debe ser un numero mayor a 0');
  }
  const ars = exigirCuentaArs(estado);
  const usd = cuentaEnMoneda(estado, 'USD');
  if (!usd) throw new ErrorDemo(404, 'Todavia no tenes una caja en USD. Abrila primero desde el inicio.');
  asegurarCupo(estado, 2);
  const { compra, venta } = COTIZACION_USD;

  if (operacion === 'COMPRA') {
    const costoArs = dosDecimales(montoUsd * venta);
    exigirDisponible(estado, ars, costoArs, (libre) =>
      `Saldo disponible insuficiente en ARS. Necesitas $ ${costoArs.toFixed(2)} (disponible: $ ${libre.toFixed(2)})`);
    registrarMovimiento(estado, ars, { tipo_movimiento: 'CAMBIO_EGRESO', monto: costoArs, descripcion: `Compra de USD ${montoUsd} a $${venta}` });
    registrarMovimiento(estado, usd, { tipo_movimiento: 'CAMBIO_INGRESO', monto: montoUsd, descripcion: `Compra de USD a $${venta}` });
    mover(ars, costoArs, -1);
    mover(usd, montoUsd, 1);
    return [201, { mensaje: `Compraste USD ${montoUsd} por $ ${costoArs.toFixed(2)}`, cotizacion: venta, montoArs: costoArs, montoUsd }];
  }

  exigirDisponible(estado, usd, montoUsd, (libre) => `Saldo disponible insuficiente en USD (disponible: U$S ${libre.toFixed(2)})`);
  const recibeArs = dosDecimales(montoUsd * compra);
  registrarMovimiento(estado, usd, { tipo_movimiento: 'CAMBIO_EGRESO', monto: montoUsd, descripcion: `Venta de USD a $${compra}` });
  registrarMovimiento(estado, ars, { tipo_movimiento: 'CAMBIO_INGRESO', monto: recibeArs, descripcion: `Venta de USD ${montoUsd} a $${compra}` });
  mover(usd, montoUsd, -1);
  mover(ars, recibeArs, 1);
  return [201, { mensaje: `Vendiste USD ${montoUsd} por $ ${recibeArs.toFixed(2)}`, cotizacion: compra, montoArs: recibeArs, montoUsd }];
};

// ── Tarjetas de crédito ─────────────────────────────────────

const MARCAS = ['VISA', 'MASTERCARD'];
const LIMITE_TARJETA = 300000;

const digitos = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

const misTarjetas = ({ estado }) => [200, [...estado.tarjetas].reverse()];

const emitirTarjeta = ({ estado, body }) => {
  const marca = String(body.marca || 'VISA').toUpperCase();
  if (!MARCAS.includes(marca)) throw new ErrorDemo(400, `La marca debe ser una de: ${MARCAS.join(', ')}`);
  if (estado.tarjetas.some((t) => t.marca === marca && t.estado === 'ACTIVO')) {
    throw new ErrorDemo(409, `Ya tenes una tarjeta ${marca} activa. No podes tener mas de una del mismo tipo.`);
  }
  const tarjeta = {
    id_tarjeta: estado.siguiente.tarjeta,
    id_producto: estado.siguiente.producto,
    numero_tarjeta: `4556${digitos(12)}`,
    marca,
    fecha_vencimiento: soloFecha(masMeses(new Date(), 60)),
    limite_compra: dec(LIMITE_TARJETA),
    dia_cierre: 10,
    saldo_consumido: '0.00',
    codigo_seguridad: digitos(3),
    estado: 'ACTIVO',
  };
  estado.siguiente.tarjeta += 1;
  estado.siguiente.producto += 1;
  estado.tarjetas.push(tarjeta);
  return [201, { mensaje: 'Tarjeta emitida correctamente', situacion_al_otorgar: 1, tarjeta }];
};

const tarjetaPropia = (estado, id) => {
  const tarjeta = buscarPorId(estado.tarjetas, 'id_tarjeta', id);
  if (!tarjeta) throw new ErrorDemo(404, 'No se encontro la tarjeta');
  return tarjeta;
};

const comprarConTarjeta = ({ estado, params, body }) => {
  const tarjeta = tarjetaPropia(estado, params[0]);
  const monto = leerMonto(body.monto);
  if (tarjeta.estado !== 'ACTIVO') {
    throw new ErrorDemo(409, `Esta tarjeta esta ${tarjeta.estado.toLowerCase()}, no se pueden registrar compras`);
  }
  const libre = Number(tarjeta.limite_compra) - Number(tarjeta.saldo_consumido);
  if (monto > libre) throw new ErrorDemo(400, `Limite disponible insuficiente (disponible: $ ${libre.toFixed(2)})`);
  // Igual que el backend: una compra no mueve saldo, se acumula en el resumen
  tarjeta.saldo_consumido = dec(Number(tarjeta.saldo_consumido) + monto);
  return [201, { mensaje: 'Compra registrada correctamente', tarjeta }];
};

const pagarResumen = ({ estado, params, body }) => {
  const tarjeta = tarjetaPropia(estado, params[0]);
  const monto = leerMonto(body.monto);
  const consumido = Number(tarjeta.saldo_consumido);
  if (consumido <= 0) throw new ErrorDemo(409, 'Esta tarjeta no tiene saldo pendiente para pagar');
  if (monto > consumido) throw new ErrorDemo(400, `El monto no puede superar el saldo del resumen ($ ${consumido.toFixed(2)})`);

  const ars = exigirCuentaArs(estado);
  exigirDisponible(estado, ars, monto, (libre) =>
    `Saldo disponible insuficiente en tu caja en ARS para pagar el resumen (disponible: $ ${libre.toFixed(2)})`);

  registrarMovimiento(estado, ars, { tipo_movimiento: 'TARJETA_PAGO', monto, descripcion: 'Pago de resumen de tarjeta' });
  mover(ars, monto, -1);
  tarjeta.saldo_consumido = dec(consumido - monto);
  return [200, { mensaje: 'Pago registrado correctamente', tarjeta }];
};

const cerrarTarjeta = ({ estado, params }) => {
  const tarjeta = tarjetaPropia(estado, params[0]);
  if (tarjeta.estado === 'CERRADO') throw new ErrorDemo(409, 'Esta tarjeta ya esta cerrada');
  if (Number(tarjeta.saldo_consumido) > 0) throw new ErrorDemo(409, 'No se puede cerrar una tarjeta con saldo pendiente en el resumen');
  tarjeta.estado = 'CERRADO';
  return [200, { mensaje: 'Tarjeta cerrada correctamente' }];
};

// ── Seguros ─────────────────────────────────────────────────

const TIPOS_SEGURO = {
  VIDA:               { cobertura: 5000000, prima_mensual: 2500 },
  HOGAR:              { cobertura: 3000000, prima_mensual: 1800 },
  PROTECCION_COMPRAS: { cobertura: 500000,  prima_mensual: 900 },
};

const misPolizas = ({ estado }) => [200, [...estado.polizas].reverse()];

const contratarPoliza = ({ estado, body }) => {
  const tipo = String(body.tipo_seguro || '').toUpperCase();
  if (!TIPOS_SEGURO[tipo]) throw new ErrorDemo(400, `El tipo de seguro debe ser uno de: ${Object.keys(TIPOS_SEGURO).join(', ')}`);
  const ars = exigirCuentaArs(estado);
  const { cobertura, prima_mensual: prima } = TIPOS_SEGURO[tipo];
  exigirDisponible(estado, ars, prima, (libre) =>
    `Disponible insuficiente para la primera prima ($ ${prima.toFixed(2)}). Disponible: $ ${libre.toFixed(2)}`);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'SEGURO_PRIMA',
    monto: prima,
    descripcion: `Alta de poliza ${tipo.toLowerCase().replace('_', ' ')}: primera prima`,
  });
  mover(ars, prima, -1);

  const hoy = new Date();
  const poliza = {
    id_poliza: estado.siguiente.poliza,
    id_producto: estado.siguiente.producto,
    tipo_seguro: tipo,
    cobertura: dec(cobertura),
    prima_mensual: dec(prima),
    fecha_alta: hoy.toISOString(),
    fecha_proximo_pago: soloFecha(masMeses(hoy, 1)),
    estado: 'ACTIVO',
  };
  estado.siguiente.poliza += 1;
  estado.siguiente.producto += 1;
  estado.polizas.push(poliza);
  return [201, { mensaje: 'Poliza contratada correctamente', poliza }];
};

const polizaPropia = (estado, id) => {
  const poliza = buscarPorId(estado.polizas, 'id_poliza', id);
  if (!poliza) throw new ErrorDemo(404, 'No se encontro la poliza');
  return poliza;
};

const pagarPrima = ({ estado, params }) => {
  const poliza = polizaPropia(estado, params[0]);
  if (poliza.estado !== 'ACTIVO') {
    throw new ErrorDemo(409, `Esta poliza esta ${poliza.estado.toLowerCase()}, no se le pueden pagar primas`);
  }
  const ars = exigirCuentaArs(estado);
  const prima = Number(poliza.prima_mensual);
  exigirDisponible(estado, ars, prima, (libre) => `Disponible insuficiente para pagar la prima (disponible: $ ${libre.toFixed(2)})`);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'SEGURO_PRIMA',
    monto: prima,
    descripcion: `Pago de prima: poliza ${poliza.tipo_seguro.toLowerCase().replace('_', ' ')}`,
  });
  mover(ars, prima, -1);
  poliza.fecha_proximo_pago = soloFecha(masMeses(new Date(poliza.fecha_proximo_pago), 1));
  return [200, { mensaje: 'Prima pagada correctamente', poliza }];
};

const cancelarPoliza = ({ estado, params }) => {
  const poliza = polizaPropia(estado, params[0]);
  if (poliza.estado === 'CERRADO') throw new ErrorDemo(409, 'Esta poliza ya esta cancelada');
  poliza.estado = 'CERRADO';
  return [200, { mensaje: 'Poliza cancelada correctamente' }];
};

// ── Reservas ────────────────────────────────────────────────

const cuentaDeReservas = (estado, cbu) => {
  const cuenta = cuentaPorCbu(estado, cbu);
  if (!cuenta) throw new ErrorDemo(404, 'No se encontro una cuenta con ese CBU');
  return cuenta;
};

const reservaPropia = (estado, id) => {
  const reserva = buscarPorId(estado.reservas, 'id_reserva', id);
  if (!reserva) throw new ErrorDemo(404, 'No se encontro la reserva');
  return reserva;
};

const listarReservas = ({ estado, params }) => {
  const cuenta = cuentaDeReservas(estado, params[0]);
  const reservas = estado.reservas
    .filter((r) => r.id_cuenta === cuenta.id_cuenta)
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion) || b.id_reserva - a.id_reserva);
  return [200, {
    saldo: dec(cuenta.saldo),
    reservado: (reservadoCent(estado, cuenta) / 100).toFixed(2),
    disponible: disponible(estado, cuenta),
    reservas,
  }];
};

const crearReserva = ({ estado, params, body }) => {
  const cuenta = cuentaDeReservas(estado, params[0]);
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  if (nombre.length < 2) throw new ErrorDemo(400, 'El nombre de la reserva debe tener al menos 2 caracteres');
  const monto = leerMonto(body.monto);
  exigirDisponible(estado, cuenta, monto, (libre) => `No tenes suficiente disponible para reservar (disponible: $ ${libre.toFixed(2)})`);

  const reserva = {
    id_reserva: estado.siguiente.reserva,
    id_cuenta: cuenta.id_cuenta,
    nombre: nombre.slice(0, 100),
    monto: dec(monto),
    fecha_creacion: ahoraISO(),
  };
  estado.siguiente.reserva += 1;
  estado.reservas.push(reserva);
  return [201, { mensaje: 'Reserva creada correctamente', reserva }];
};

const agregarAReserva = ({ estado, params, body }) => {
  const reserva = reservaPropia(estado, params[0]);
  const monto = leerMonto(body.monto);
  const cuenta = cuentaPorId(estado, reserva.id_cuenta);
  exigirDisponible(estado, cuenta, monto, (libre) => `No tenes suficiente disponible (disponible: $ ${libre.toFixed(2)})`);
  reserva.monto = dec(Number(reserva.monto) + monto);
  return [200, { mensaje: 'Monto agregado correctamente', reserva }];
};

const liberarDeReserva = ({ estado, params, body }) => {
  const reserva = reservaPropia(estado, params[0]);
  const monto = leerMonto(body.monto);
  if (monto > Number(reserva.monto)) {
    throw new ErrorDemo(400, `No podes liberar mas de lo que tiene la reserva ($ ${Number(reserva.monto).toFixed(2)})`);
  }
  reserva.monto = dec(Number(reserva.monto) - monto);
  return [200, { mensaje: 'Monto liberado correctamente', reserva }];
};

const eliminarReserva = ({ estado, params }) => {
  const reserva = reservaPropia(estado, params[0]);
  estado.reservas = estado.reservas.filter((r) => r !== reserva);
  return [200, { mensaje: 'Reserva eliminada correctamente' }];
};

// ── Servicios y recargas ────────────────────────────────────

const TIPOS_SERVICIO = {
  AGUA: { empresa: 'Aguas del Plata', label: 'Agua', montoMin: 2500, montoMax: 6000 },
  LUZ:  { empresa: 'Edenor',          label: 'Luz',  montoMin: 5000, montoMax: 14000 },
  GAS:  { empresa: 'Metrogas',        label: 'Gas',  montoMin: 3500, montoMax: 9000 },
};

// La factura de un mismo número de cliente siempre da lo mismo (hash del texto)
function montoFactura(tipo, numeroCliente) {
  const { montoMin, montoMax } = TIPOS_SERVICIO[tipo];
  let h = 0;
  for (const ch of `${tipo}${numeroCliente}`) h = (h * 31 + ch.charCodeAt(0)) % 1_000_003;
  const centavos = montoMin * 100 + (h % ((montoMax - montoMin) * 100 + 1));
  return centavos / 100;
}

const leerServicio = (body) => {
  const tipo = String(body.tipo_servicio || '').toUpperCase();
  const numeroCliente = typeof body.numero_cliente === 'string' ? body.numero_cliente.trim() : '';
  if (!TIPOS_SERVICIO[tipo]) throw new ErrorDemo(400, `El servicio debe ser uno de: ${Object.keys(TIPOS_SERVICIO).join(', ')}`);
  return { tipo, numeroCliente };
};

const consultarFactura = ({ body }) => {
  const { tipo, numeroCliente } = leerServicio(body);
  if (numeroCliente.length < 3) throw new ErrorDemo(400, 'Ingresá tu número de cliente (mínimo 3 caracteres)');
  const vencimiento = new Date();
  vencimiento.setDate(vencimiento.getDate() + 10);
  return [200, {
    tipo_servicio: tipo,
    empresa: TIPOS_SERVICIO[tipo].empresa,
    numero_cliente: numeroCliente,
    monto: montoFactura(tipo, numeroCliente),
    vencimiento: vencimiento.toISOString(),
  }];
};

const pagarServicio = ({ estado, body }) => {
  const { tipo, numeroCliente } = leerServicio(body);
  if (numeroCliente.length < 3) throw new ErrorDemo(400, 'Falta el número de cliente');
  const { empresa, label, montoMin, montoMax } = TIPOS_SERVICIO[tipo];
  const monto = Number(body.monto);
  if (!Number.isFinite(monto) || monto < montoMin || monto > montoMax || dosDecimales(monto) !== monto) {
    throw new ErrorDemo(400, 'El monto de la factura no es válido. Volvé a consultarla e intentá de nuevo.');
  }
  const ars = exigirCuentaArs(estado);
  exigirDisponible(estado, ars, monto, (libre) => `Disponible insuficiente para pagar la factura (disponible: $ ${libre.toFixed(2)})`);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'SERVICIO_PAGO',
    monto,
    descripcion: `Pago de ${label.toLowerCase()}: ${empresa} · Cliente ${numeroCliente}`,
  });
  mover(ars, monto, -1);
  return [201, { mensaje: `Pago de ${label.toLowerCase()} realizado correctamente` }];
};

const OPERADORES = { MOVISTAR: 'Movistar', PERSONAL: 'Personal', CLARO: 'Claro' };
const MONTOS_RECARGA = [500, 1000, 1500, 2000, 3000, 5000];

const operadores = () => [200, {
  operadores: Object.entries(OPERADORES).map(([key, empresa]) => ({ key, empresa })),
  montos: MONTOS_RECARGA,
}];

const recargar = ({ estado, body }) => {
  const operador = String(body.operador || '').toUpperCase();
  const numero = String(body.numero_celular || '').trim();
  const monto = Number(body.monto);
  if (!OPERADORES[operador]) throw new ErrorDemo(400, `El operador debe ser uno de: ${Object.keys(OPERADORES).join(', ')}`);
  if (!/^\d{10}$/.test(numero)) throw new ErrorDemo(400, 'El número de celular debe tener 10 dígitos, sin 0 ni 15 (ej: 1123456789)');
  if (!MONTOS_RECARGA.includes(monto)) {
    throw new ErrorDemo(400, `El monto debe ser uno de: ${MONTOS_RECARGA.map((m) => `$${m}`).join(', ')}`);
  }
  const ars = exigirCuentaArs(estado);
  exigirDisponible(estado, ars, monto, (libre) => `Disponible insuficiente para la recarga (disponible: $ ${libre.toFixed(2)})`);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'RECARGA_CELULAR',
    monto,
    descripcion: `Recarga ${OPERADORES[operador]} · ${numero}`,
  });
  mover(ars, monto, -1);
  return [201, { mensaje: `Recarga de $ ${monto} a ${OPERADORES[operador]} realizada correctamente` }];
};

// ── Inversiones: acciones y cauciones ───────────────────────

const leerMercado = (valor) => {
  const mercado = String(valor || '').toUpperCase();
  if (!mercadoValido(mercado)) throw new ErrorDemo(400, 'El mercado debe ser uno de: ACCION_AR, ACCION_EX');
  return mercado;
};

const cotizacionesPanel = ({ params }) => [200, panelCotizaciones(leerMercado(params[0]))];

const historicoSimbolo = ({ params, query }) => {
  const mercado = leerMercado(params[0]);
  const simbolo = decodeURIComponent(params[1]).trim().toUpperCase();
  const rango = String(query.rango || '1A').toUpperCase();
  return [200, { simbolo, mercado, rango, puntos: historico(mercado, simbolo, rango) }];
};

const tenencias = ({ estado }) => [200,
  estado.tenencias
    .filter((t) => Number(t.cantidad) > 0)
    .map((t) => ({ ...t, precio_actual: buscarCotizacion(t.mercado, t.simbolo)?.precio ?? null })),
];

const leerOrden = (body) => {
  const mercado = leerMercado(body.mercado);
  const simbolo = String(body.simbolo || '').trim().toUpperCase();
  const cantidad = Number(body.cantidad);
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 1_000_000) {
    throw new ErrorDemo(400, 'La cantidad debe ser un numero entero mayor a 0');
  }
  if (!simbolo) throw new ErrorDemo(400, 'Falta el simbolo');
  return { mercado, simbolo, cantidad };
};

const comprarAccion = ({ estado, body }) => {
  const { mercado, simbolo, cantidad } = leerOrden(body);
  const cotizacion = buscarCotizacion(mercado, simbolo);
  if (!cotizacion) throw new ErrorDemo(404, `No se encontro cotizacion para ${simbolo}. Puede que no cotice hoy.`);

  const moneda = MONEDA_POR_MERCADO[mercado];
  const cuenta = cuentaEnMoneda(estado, moneda);
  if (!cuenta) throw new ErrorDemo(404, `No se encontro tu cuenta en ${moneda}`);

  const costoTotal = dosDecimales(cotizacion.precio * cantidad);
  exigirDisponible(estado, cuenta, costoTotal, (libre) =>
    `Disponible insuficiente en ${moneda}. Necesitas ${moneda} ${costoTotal.toFixed(2)} (disponible: ${moneda} ${libre.toFixed(2)})`);

  registrarMovimiento(estado, cuenta, {
    tipo_movimiento: 'COMPRA_ACCION',
    monto: costoTotal,
    descripcion: `Compra de ${cantidad} ${simbolo} a ${moneda} ${cotizacion.precio}`,
  });
  mover(cuenta, costoTotal, -1);

  const existente = estado.tenencias.find((t) => t.mercado === mercado && t.simbolo === simbolo);
  if (existente) {
    const cantidadVieja = Number(existente.cantidad);
    const nuevaCantidad = cantidadVieja + cantidad;
    const promedio = (cantidadVieja * Number(existente.precio_promedio) + cantidad * cotizacion.precio) / nuevaCantidad;
    existente.cantidad = nuevaCantidad.toFixed(6);
    existente.precio_promedio = promedio.toFixed(4);
    existente.fecha_actualizacion = ahoraISO();
  } else {
    estado.tenencias.push({
      id_tenencia: estado.siguiente.tenencia,
      id_persona: estado.usuario.id,
      mercado,
      simbolo,
      cantidad: cantidad.toFixed(6),
      precio_promedio: cotizacion.precio.toFixed(4),
      moneda,
      fecha_actualizacion: ahoraISO(),
    });
    estado.siguiente.tenencia += 1;
  }

  return [201, {
    mensaje: `Compraste ${cantidad} ${simbolo} por ${moneda} ${costoTotal.toFixed(2)}`,
    simbolo, cantidad, precio: cotizacion.precio, costoTotal, moneda,
  }];
};

const venderAccion = ({ estado, body }) => {
  const { mercado, simbolo, cantidad } = leerOrden(body);
  const tenencia = estado.tenencias.find((t) => t.mercado === mercado && t.simbolo === simbolo);
  if (!tenencia || Number(tenencia.cantidad) < cantidad) {
    throw new ErrorDemo(400, `No tenes suficientes ${simbolo} para vender (tenes ${tenencia ? tenencia.cantidad : 0})`);
  }
  const cotizacion = buscarCotizacion(mercado, simbolo);
  if (!cotizacion) throw new ErrorDemo(404, `No se encontro cotizacion para ${simbolo}. Puede que no cotice hoy.`);

  const moneda = MONEDA_POR_MERCADO[mercado];
  const cuenta = cuentaEnMoneda(estado, moneda);
  if (!cuenta) throw new ErrorDemo(404, `No se encontro tu cuenta en ${moneda}`);

  const totalRecibido = dosDecimales(cotizacion.precio * cantidad);
  registrarMovimiento(estado, cuenta, {
    tipo_movimiento: 'VENTA_ACCION',
    monto: totalRecibido,
    descripcion: `Venta de ${cantidad} ${simbolo} a ${moneda} ${cotizacion.precio}`,
  });
  mover(cuenta, totalRecibido, 1);

  tenencia.cantidad = (Number(tenencia.cantidad) - cantidad).toFixed(6);
  tenencia.fecha_actualizacion = ahoraISO();
  if (Number(tenencia.cantidad) <= 0) estado.tenencias = estado.tenencias.filter((t) => t !== tenencia);

  return [201, {
    mensaje: `Vendiste ${cantidad} ${simbolo} por ${moneda} ${totalRecibido.toFixed(2)}`,
    simbolo, cantidad, precio: cotizacion.precio, totalRecibido, moneda,
  }];
};

// En la cuenta de prueba el mercado de cauciones está siempre abierto, así que
// se puede probar a cualquier hora (el real solo opera de 11 a 17 en días hábiles)
const plazosCaucion = () => [200, {
  mercado_abierto: true,
  horario: '11:00 a 17:00, dias habiles (hora Argentina)',
  plazos: PLAZOS_CAUCION.map((dias) => ({ plazo_dias: dias, tasa_anual: tasaCaucion(dias) })),
}];

const misCauciones = ({ estado }) => [200, [...estado.cauciones].reverse()];

const colocarCaucion = ({ estado, body }) => {
  const plazo = Number(body.plazo_dias);
  if (!PLAZOS_CAUCION.includes(plazo)) throw new ErrorDemo(400, `El plazo debe ser uno de: ${PLAZOS_CAUCION.join(', ')} dias`);
  const monto = leerMonto(body.monto);
  const ars = exigirCuentaArs(estado);
  exigirDisponible(estado, ars, monto, (libre) => `Disponible insuficiente para colocar la caucion (disponible: $ ${libre.toFixed(2)})`);

  const tasa = tasaCaucion(plazo);
  const interes = dosDecimales(monto * (tasa / 100) * (plazo / 365));
  const montoACobrar = dosDecimales(monto + interes);

  registrarMovimiento(estado, ars, {
    tipo_movimiento: 'CAUCION_COLOCADA',
    monto,
    descripcion: `Caucion a ${plazo} dia(s), TNA ${tasa}%`,
  });
  mover(ars, monto, -1);

  const hoy = new Date();
  const vence = new Date(hoy);
  vence.setDate(vence.getDate() + plazo);
  const caucion = {
    id_caucion: estado.siguiente.caucion,
    id_persona: estado.usuario.id,
    id_cuenta: ars.id_cuenta,
    monto: dec(monto),
    plazo_dias: plazo,
    tasa_anual: dec(tasa),
    monto_a_cobrar: dec(montoACobrar),
    estado: 'ACTIVA',
    fecha_alta: hoy.toISOString(),
    fecha_vencimiento: soloFecha(vence),
  };
  estado.siguiente.caucion += 1;
  estado.cauciones.push(caucion);

  return [201, {
    mensaje: `Colocaste $ ${monto.toFixed(2)} a ${plazo} dia(s). Vas a cobrar $ ${montoACobrar.toFixed(2)} al vencimiento.`,
    caucion,
  }];
};

const sesionReal = () => {
  throw new ErrorDemo(403, 'Estás en una cuenta de prueba. Cerrá la sesión de prueba para ingresar o registrarte con una cuenta real.');
};

// ── Tabla de rutas ──────────────────────────────────────────
// [método, patrón, handler]. Los grupos del patrón llegan en `params`.
const RUTAS = [
  ['GET',  /^\/personas\/[^/]+\/productos$/,                productos],
  ['GET',  /^\/personas\/[^/]+\/contactos$/,                contactos],
  ['GET',  /^\/personas\/(\d{22})\/buscar$/,                buscarPorCbu],
  ['GET',  /^\/personas\/alias\/(.+)$/,                     buscarPorAlias],
  ['PUT',  /^\/personas\/(\d{22})\/alias$/,                 cambiarAlias],
  ['PUT',  /^\/cuentas\/(\d{22})\/alias$/,                  cambiarAlias],
  ['POST', /^\/cuentas$/,                                   abrirCuenta],
  ['GET',  /^\/movimientos\/(\d+)$/,                        movimientos],
  ['POST', /^\/transferencias$/,                            transferir],
  ['POST', /^\/depositos$/,                                 depositar],
  ['GET',  /^\/auth\/perfil$/,                              perfil],
  ['PUT',  /^\/auth\/perfil$/,                              actualizarPerfil],
  ['PUT',  /^\/auth\/cambiar-password$/,                    cambiarPassword],
  ['GET',  /^\/reportes\/mios$/,                            misReportes],
  ['POST', /^\/reportes$/,                                  crearReporte],
  // Préstamos
  ['GET',  /^\/prestamos$/,                                 misPrestamos],
  ['GET',  /^\/prestamos\/limite$/,                         limitePrestamo],
  ['POST', /^\/prestamos$/,                                 solicitarPrestamo],
  ['POST', /^\/prestamos\/(\d+)\/pagar-cuota$/,             pagarCuota],
  // Compra y venta de dólares
  ['GET',  /^\/cambio\/cotizacion$/,                        cotizacionDolar],
  ['POST', /^\/cambio$/,                                    realizarCambio],
  // Tarjetas
  ['GET',  /^\/tarjetas$/,                                  misTarjetas],
  ['POST', /^\/tarjetas$/,                                  emitirTarjeta],
  ['POST', /^\/tarjetas\/(\d+)\/compras$/,                  comprarConTarjeta],
  ['POST', /^\/tarjetas\/(\d+)\/pagar-resumen$/,            pagarResumen],
  ['POST', /^\/tarjetas\/(\d+)\/cerrar$/,                   cerrarTarjeta],
  // Seguros
  ['GET',  /^\/seguros$/,                                   misPolizas],
  ['POST', /^\/seguros$/,                                   contratarPoliza],
  ['POST', /^\/seguros\/(\d+)\/pagar-prima$/,               pagarPrima],
  ['POST', /^\/seguros\/(\d+)\/cancelar$/,                  cancelarPoliza],
  // Reservas
  ['GET',  /^\/cuentas\/(\d{22})\/reservas$/,               listarReservas],
  ['POST', /^\/cuentas\/(\d{22})\/reservas$/,               crearReserva],
  ['POST', /^\/reservas\/(\d+)\/agregar$/,                  agregarAReserva],
  ['POST', /^\/reservas\/(\d+)\/liberar$/,                  liberarDeReserva],
  ['DELETE', /^\/reservas\/(\d+)$/,                         eliminarReserva],
  // Servicios y recargas
  ['POST', /^\/servicios\/consultar-factura$/,              consultarFactura],
  ['POST', /^\/servicios\/pagar$/,                          pagarServicio],
  ['GET',  /^\/recargas\/operadores$/,                      operadores],
  ['POST', /^\/recargas$/,                                  recargar],
  // Inversiones
  ['GET',  /^\/inversiones\/cotizaciones\/([^/]+)$/,        cotizacionesPanel],
  ['GET',  /^\/inversiones\/historico\/([^/]+)\/([^/]+)$/,  historicoSimbolo],
  ['GET',  /^\/inversiones\/tenencias$/,                    tenencias],
  ['POST', /^\/inversiones\/comprar$/,                      comprarAccion],
  ['POST', /^\/inversiones\/vender$/,                       venderAccion],
  ['GET',  /^\/cauciones\/plazos$/,                         plazosCaucion],
  ['GET',  /^\/cauciones$/,                                 misCauciones],
  ['POST', /^\/cauciones$/,                                 colocarCaucion],
  // Credenciales reales: no tienen sentido (ni se deben mezclar) con la demo
  ['POST', /^\/auth\/(login|register|olvide-password)$/,    sesionReal],
  ['POST', /^\/personas$/,                                  sesionReal],
];

const parsearBody = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data) || {}; } catch { return {}; }
};

function resolver(config) {
  const estado = leerEstado();
  if (!estado) throw new ErrorDemo(401, 'La sesión de prueba terminó. Escaneá el QR de nuevo para empezar otra.');

  const metodo = (config.method || 'get').toUpperCase();
  const ruta = (config.url || '').split('?')[0];

  for (const [m, patron, handler] of RUTAS) {
    if (m !== metodo) continue;
    const coincide = ruta.match(patron);
    if (!coincide) continue;
    const [status, data] = handler({
      estado,
      params: coincide.slice(1),
      body: parsearBody(config.data),
      query: config.params || {},
    });
    if (metodo !== 'GET') guardarEstado(estado); // lo que se hizo queda solo en esta sesión
    return [status, data];
  }
  throw new ErrorDemo(403, 'Esta función no está incluida en la cuenta de prueba.');
}

// El adapter que registra api.js. Siempre responde local: éxito o error.
export async function demoAdapter(config) {
  await esperar(LATENCIA_MS);
  try {
    const [status, data] = resolver(config);
    // structuredClone: las pantallas reciben una copia y no pueden mutar el estado por error
    return { data: structuredClone(data), status, statusText: 'OK', headers: {}, config, request: {} };
  } catch (err) {
    const status = err instanceof ErrorDemo ? err.status : 500;
    const mensaje = err instanceof ErrorDemo ? err.message : 'Error en la cuenta de prueba';
    if (!(err instanceof ErrorDemo)) console.error('Error inesperado en la cuenta de prueba:', err);
    const response = { data: { error: mensaje }, status, statusText: '', headers: {}, config, request: {} };
    throw new AxiosError(
      mensaje,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response
    );
  }
}
