// ============================================================
// demo/demoMercado.js — MERCADO FICTICIO DE LA CUENTA DE PRUEBA
//
// Cotizaciones de acciones, histórico de precios, cotización del dólar y curva
// de cauciones, todo HARDCODEADO: no se consulta ningún servicio externo
// (data912, Yahoo, DolarAPI) y los precios no se mueven mientras se usa la
// demo, así que lo que se ve al comprar es exactamente lo que se paga.
// ============================================================

export const COTIZACION_USD = { compra: 1400, venta: 1450, fuente: 'Cotización de prueba (fija)' };

// [símbolo, precio, variación % del día]
const ACCIONES_AR = [
  ['GGAL', 7250.5, 1.42], ['YPFD', 52800, -0.65], ['PAMP', 4120, 0.88], ['BMA', 9980, 2.1],
  ['BBAR', 5640, 0.35], ['SUPV', 3890, -1.2], ['CEPU', 1985, 0.54], ['EDN', 2310, -0.31],
  ['TXAR', 745.5, 1.05], ['ALUA', 812, 0.12], ['TECO2', 3320, -0.9], ['TGSU2', 5780, 1.76],
  ['TGNO4', 3150, 0.4], ['LOMA', 2465, -0.22], ['CRES', 1630, 0.97], ['MIRG', 29400, 1.3],
  ['VALO', 408, -0.48], ['COME', 142.5, 0.7], ['BYMA', 2290, 0.18], ['CVH', 6120, -1.05],
  ['IRSA', 1745, 0.62], ['HARG', 1180, -0.15], ['METR', 1890, 0.93], ['MOLI', 6340, 0.28],
  ['SEMI', 301.5, -0.77], ['AGRO', 98.4, 0.51], ['DGCU2', 1275, 0.2], ['RICH', 5210, -0.34],
  ['TRAN', 1340, 1.18], ['CAPX', 7890, 0.66],
];

const ACCIONES_EX = [
  ['AAPL', 214.3, 0.82], ['MSFT', 432.1, 0.45], ['GOOGL', 176.8, -0.37], ['AMZN', 189.5, 1.12],
  ['TSLA', 248.7, -2.05], ['NVDA', 131.4, 1.9], ['META', 502.2, 0.64], ['NFLX', 640.9, -0.28],
  ['DIS', 98.6, 0.33], ['KO', 63.4, 0.15], ['AMD', 158.3, 1.47], ['INTC', 31.2, -0.9],
  ['BABA', 84.5, 0.72], ['PYPL', 66.8, -0.44], ['UBER', 71.9, 1.01], ['NKE', 78.3, -0.6],
  ['V', 275.6, 0.38], ['MA', 468.1, 0.29], ['JPM', 201.7, 0.56], ['WMT', 67.2, 0.21],
  ['XOM', 112.4, -0.83], ['PFE', 28.9, 0.1], ['MCD', 291.5, -0.12], ['PEP', 168.3, 0.09],
];

const MERCADOS = { ACCION_AR: ACCIONES_AR, ACCION_EX: ACCIONES_EX };

const redondear = (n, d = 2) => Number(n.toFixed(d));

const cotizacionesDe = (mercado) =>
  MERCADOS[mercado].map(([simbolo, precio, variacion]) => ({
    simbolo,
    precio,
    variacion_pct: variacion,
    punta_compra: redondear(precio * 0.999),
    punta_venta: redondear(precio * 1.001),
    volumen: Math.round(precio * 1000) % 90000 + 10000,
  }));

export const mercadoValido = (mercado) => Object.prototype.hasOwnProperty.call(MERCADOS, mercado);
export const MONEDA_POR_MERCADO = { ACCION_AR: 'ARS', ACCION_EX: 'USD' };

export const panelCotizaciones = (mercado) => ({
  datos: cotizacionesDe(mercado),
  actualizado: new Date().toISOString(),
  fuente: 'Datos de prueba (precios fijos)',
});

export const buscarCotizacion = (mercado, simbolo) =>
  cotizacionesDe(mercado).find((c) => c.simbolo === String(simbolo).toUpperCase()) || null;

// ── Histórico ───────────────────────────────────────────────
// Serie diaria de ~5 años generada con un PRNG sembrado con el símbolo: la
// misma acción siempre dibuja el mismo gráfico, y el último punto es el
// precio actual.
const DIAS_POR_RANGO = { '1M': 31, '3M': 93, '6M': 186, '1A': 366 };
const DIAS_MAX = 5 * 366;

function semilla(texto) {
  let h = 1779033703;
  for (let i = 0; i < texto.length; i += 1) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cacheSeries = new Map();

function serieCompleta(mercado, simbolo) {
  const clave = `${mercado}:${simbolo}`;
  if (cacheSeries.has(clave)) return cacheSeries.get(clave);

  const cot = buscarCotizacion(mercado, simbolo);
  if (!cot) return [];

  const azar = mulberry32(semilla(clave));
  const volatilidad = mercado === 'ACCION_AR' ? 0.022 : 0.015;
  const puntos = [];
  let precio = cot.precio;
  const dia = new Date();
  dia.setUTCHours(12, 0, 0, 0);

  // Se camina hacia atrás desde hoy: cada día hábil es el anterior movido un % al azar
  for (let n = 0; n <= DIAS_MAX; n += 1) {
    const dow = dia.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      puntos.push({ fecha: dia.toISOString().slice(0, 10), cierre: redondear(Math.max(precio, 0.01)) });
      const variacion = (azar() - 0.5) * 2 * volatilidad + 0.0004; // leve tendencia alcista
      precio /= 1 + variacion;
    }
    dia.setUTCDate(dia.getUTCDate() - 1);
  }
  puntos.reverse();
  cacheSeries.set(clave, puntos);
  return puntos;
}

export function historico(mercado, simbolo, rango) {
  const serie = serieCompleta(mercado, simbolo);
  if (rango === 'MAX') return serie.filter((_, i) => i % 5 === 0 || i === serie.length - 1);
  const dias = DIAS_POR_RANGO[rango] || DIAS_POR_RANGO['1A'];
  const limite = new Date();
  limite.setUTCDate(limite.getUTCDate() - dias);
  const limiteISO = limite.toISOString().slice(0, 10);
  return serie.filter((p) => p.fecha >= limiteISO);
}

// ── Cauciones ───────────────────────────────────────────────
// Misma curva que el backend: 32% a 1 día, ~35% a 30 días, sube más despacio después
export const PLAZOS_CAUCION = [
  ...Array.from({ length: 30 }, (_, i) => i + 1),
  40, 50, 60, 70, 80, 90, 100, 120, 150, 180, 200, 250, 300, 365,
];

export const tasaCaucion = (dias) => redondear(32 + (3 / Math.log(30)) * Math.log(dias));
