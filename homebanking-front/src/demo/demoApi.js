// ============================================================
// demo/demoApi.js — "BACKEND" FALSO DE LA CUENTA DE PRUEBA
//
// Es un adapter de axios: cuando hay una sesión demo activa, api.js le pasa
// TODOS los pedidos a esta función en vez de mandarlos por la red. Ningún
// pedido sale del navegador, así que es imposible que una operación de prueba
// toque el banco real: ni el Banco Central, ni Supabase, ni otros clientes.
//
// Lo que no esté contemplado acá se rechaza con un 403 (nunca se deja pasar
// al servidor "por las dudas").
// ============================================================
import { AxiosError } from 'axios';
import { guardarEstado, leerEstado } from './demoStore';
import { DIRECTORIO, ID_CUENTA } from './demoData';

const LATENCIA_MS = 250; // para que se sienta como un banco y no como un mock instantáneo
const MONTO_MAX_TRANSFERENCIA = 100_000_000;
const MONTO_MAX_DEPOSITO = 10_000_000;
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
const fmtMonto = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

function leerMonto(valor) {
  const monto = typeof valor === 'string' ? Number(valor) : valor;
  if (typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0 || dosDecimales(monto) !== monto) {
    throw new ErrorDemo(400, 'El monto debe ser un número positivo, con hasta 2 decimales');
  }
  return monto;
}

const productoDe = (estado) => ({ ...estado.cuenta, saldo: dosDecimales(estado.cuenta.saldo).toFixed(2) });

const nombreCompleto = (d) => [d.nombre, d.apellido].filter(Boolean).join(' ');

function registrarMovimiento(estado, datos) {
  if (estado.movimientos.length >= MAX_MOVIMIENTOS) {
    throw new ErrorDemo(400, 'Alcanzaste el máximo de operaciones de la cuenta de prueba. Cerrá sesión para empezar de cero.');
  }
  const movimiento = {
    id_movimiento: ID_CUENTA * 1000 + estado.siguienteId,
    id_cuenta: ID_CUENTA,
    fecha: new Date().toISOString(),
    cbu_contraparte: null,
    nombre_contraparte: null,
    ...datos,
    monto: Number(datos.monto).toFixed(2),
  };
  estado.siguienteId += 1;
  estado.movimientos.push(movimiento);
  return movimiento;
}

// Aplica un ingreso (+) o egreso (-) al saldo trabajando en centavos, para que
// las sumas no acumulen errores de punto flotante
function mover(estado, monto, signo) {
  const centavos = Math.round(estado.cuenta.saldo * 100) + signo * Math.round(monto * 100);
  estado.cuenta.saldo = centavos / 100;
}

const cuentaPropia = (estado, cbu) => (estado.cuenta.cbu === cbu ? estado.cuenta : null);

// ── Handlers ────────────────────────────────────────────────

const productos = ({ estado }) => [200, [productoDe(estado)]];

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
  if (!cuentaPropia(estado, cbu)) throw new ErrorDemo(404, 'No se encontró una cuenta con ese CBU');
  estado.cuenta.alias = alias;
  return [200, { mensaje: 'Alias actualizado' }];
};

const movimientos = ({ estado, params }) => {
  if (Number(params[0]) !== ID_CUENTA) throw new ErrorDemo(403, 'No tenés permiso para ver estos movimientos');
  const lista = [...estado.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return [200, lista];
};

const transferir = ({ estado, body }) => {
  const { cbu_origen: cbuOrigen, cbu_destino: cbuDestino, descripcion } = body;
  if (!cbuOrigen || !cbuDestino || body.monto === undefined) {
    throw new ErrorDemo(400, 'Los campos cbu_origen, cbu_destino y monto son requeridos');
  }
  const origen = cuentaPropia(estado, cbuOrigen);
  if (!origen) throw new ErrorDemo(403, 'No tenés permiso para transferir desde esa cuenta');
  if (!/^\d{22}$/.test(String(cbuDestino))) throw new ErrorDemo(400, 'El CBU de destino debe tener 22 dígitos');
  if (cbuDestino === origen.cbu) throw new ErrorDemo(400, 'No podés transferirte a tu propia cuenta');

  const monto = leerMonto(body.monto);
  if (monto > MONTO_MAX_TRANSFERENCIA) {
    throw new ErrorDemo(400, `El monto máximo por transferencia es $ ${fmtMonto(MONTO_MAX_TRANSFERENCIA)}`);
  }
  if (Math.round(monto * 100) > Math.round(origen.saldo * 100)) throw new ErrorDemo(400, 'Saldo insuficiente');

  const destino = DIRECTORIO.find((d) => d.cbu === cbuDestino);
  const texto = typeof descripcion === 'string' ? descripcion.trim().slice(0, 255) : '';

  // Primero se registra el movimiento (es lo único que puede fallar, por el tope
  // de operaciones) y recién después se toca el saldo: nunca queda a medias
  const mov = registrarMovimiento(estado, {
    tipo_movimiento: 'TRANSFERENCIA_EGRESO',
    monto,
    descripcion: texto || 'Transferencia',
    cbu_contraparte: cbuDestino,
    nombre_contraparte: destino ? nombreCompleto(destino) : 'Destinatario de prueba',
  });
  mover(estado, monto, -1);

  return [201, {
    mensaje: 'Transferencia simulada con éxito',
    ticket: { transaccionId: `DEMO-${mov.id_movimiento}`, estado: 'COMPLETADA', simulada: true },
  }];
};

const depositar = ({ estado, body }) => {
  const origen = cuentaPropia(estado, body.cbu);
  if (!origen) throw new ErrorDemo(403, 'No tenés permiso para depositar en esa cuenta');
  const monto = leerMonto(body.monto);
  if (monto > MONTO_MAX_DEPOSITO) {
    throw new ErrorDemo(400, `El monto máximo por depósito es $ ${fmtMonto(MONTO_MAX_DEPOSITO)}`);
  }
  const texto = typeof body.descripcion === 'string' ? body.descripcion.trim().slice(0, 255) : '';

  registrarMovimiento(estado, {
    tipo_movimiento: 'DEPOSITO',
    monto,
    descripcion: texto || 'Depósito en efectivo',
  });
  mover(estado, monto, 1);

  return [201, {
    mensaje: 'Depósito simulado con éxito',
    cbu: origen.cbu,
    monto,
    saldo_actualizado: dosDecimales(origen.saldo),
  }];
};

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
    fecha: new Date().toISOString(),
  });
  return [201, { mensaje: 'Reporte recibido (simulado)' }];
};

const vacio = () => [200, []];

const sesionReal = () => {
  throw new ErrorDemo(403, 'Estás en una cuenta de prueba. Cerrá la sesión de prueba para ingresar o registrarte con una cuenta real.');
};

// ── Tabla de rutas ──────────────────────────────────────────
// [método, patrón, handler]. Los grupos del patrón llegan en `params`.
const RUTAS = [
  ['GET',  /^\/personas\/[^/]+\/productos$/,          productos],
  ['GET',  /^\/personas\/[^/]+\/contactos$/,          contactos],
  ['GET',  /^\/personas\/(\d{22})\/buscar$/,          buscarPorCbu],
  ['GET',  /^\/personas\/alias\/(.+)$/,               buscarPorAlias],
  ['PUT',  /^\/personas\/(\d{22})\/alias$/,           cambiarAlias],
  ['PUT',  /^\/cuentas\/(\d{22})\/alias$/,            cambiarAlias],
  ['GET',  /^\/movimientos\/(\d+)$/,                  movimientos],
  ['POST', /^\/transferencias$/,                      transferir],
  ['POST', /^\/depositos$/,                           depositar],
  ['GET',  /^\/auth\/perfil$/,                        perfil],
  ['PUT',  /^\/auth\/perfil$/,                        actualizarPerfil],
  ['PUT',  /^\/auth\/cambiar-password$/,              cambiarPassword],
  ['GET',  /^\/reportes\/mios$/,                      misReportes],
  ['POST', /^\/reportes$/,                            crearReporte],
  // Secciones que el Inicio consulta pero la cuenta de prueba no incluye:
  // se devuelven vacías para que el Inicio cargue sin errores
  ['GET',  /^\/tarjetas$/,                            vacio],
  ['GET',  /^\/inversiones\/tenencias$/,              vacio],
  ['GET',  /^\/inversiones\/cotizaciones\/[^/]+$/,    () => [200, { datos: [] }]],
  ['GET',  /^\/cauciones$/,                           vacio],
  // Credenciales reales: no tienen sentido (ni se deben mezclar) con la demo
  ['POST', /^\/auth\/(login|register|olvide-password)$/, sesionReal],
  ['POST', /^\/personas$/,                            sesionReal],
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
    const [status, data] = handler({ estado, params: coincide.slice(1), body: parsearBody(config.data) });
    if (metodo !== 'GET') guardarEstado(estado); // lo que se hizo queda solo en esta sesión
    return [status, data];
  }
  throw new ErrorDemo(403, 'Esta función no está incluida en la cuenta de prueba. Hacete cliente de Tree Bank para usarla.');
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
