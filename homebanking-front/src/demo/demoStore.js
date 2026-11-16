// ============================================================
// demo/demoStore.js — ESTADO DE LA SESIÓN DE PRUEBA
//
// El estado de la cuenta demo (saldo, movimientos, perfil…) vive SOLO en el
// sessionStorage de esta pestaña. Nunca va al servidor ni al localStorage:
//   - al cerrar sesión se borra todo (cerrarDemo);
//   - si se cierra la pestaña o el navegador, también desaparece solo;
//   - la próxima vez que se entra por /test se arma de cero.
// Y como la sesión demo no usa el localStorage, tampoco pisa el token de un
// cliente real que tenga abierto el banco en el mismo navegador.
// ============================================================
import { crearEstadoInicial, DNI_DEMO, DIRECTORIO, CBU_PROPIO, CBU_PROPIO_USD, VERSION_ESTADO } from './demoData';

const CLAVE = 'tb_demo_sesion';

// Si el navegador no deja usar sessionStorage (modo privado estricto, por
// ejemplo), la sesión sigue funcionando en memoria hasta que se recargue.
let enMemoria = null;

function leer() {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (crudo) {
      const estado = JSON.parse(crudo);
      // Una sesión guardada con un formato viejo se descarta: se entra de nuevo por /test
      return estado?.version === VERSION_ESTADO ? estado : null;
    }
  } catch { /* storage bloqueado o JSON corrupto: se usa la copia en memoria */ }
  return enMemoria;
}

export function guardarEstado(estado) {
  enMemoria = estado;
  try { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* queda en memoria */ }
}

// ¿Esta pestaña está en una sesión de prueba? Es la fuente de verdad que
// consulta api.js para decidir si un pedido se responde localmente.
export const demoActivo = () => leer() !== null;

export const leerEstado = () => leer();

// Datos de usuario de la sesión demo en curso (o null si no hay)
export const usuarioDemo = () => leer()?.usuario ?? null;

// Borra lo que la demo pueda haber dejado FUERA de su estado: la foto de perfil
// (se guarda en sessionStorage, ver AuthContext) y los favoritos marcados sobre
// los contactos ficticios. tb_favoritos vive en localStorage y se comparte con
// los clientes reales del navegador, así que se sacan solo los CBU ficticios y
// se respetan los demás.
function limpiarRastros() {
  try { sessionStorage.removeItem(`tb_foto_${DNI_DEMO}`); } catch { /* nada que borrar */ }

  try {
    const cbusDemo = new Set([CBU_PROPIO, CBU_PROPIO_USD, ...DIRECTORIO.map((d) => d.cbu)]);
    const favoritos = JSON.parse(localStorage.getItem('tb_favoritos') || '[]');
    const restantes = favoritos.filter((cbu) => !cbusDemo.has(cbu));
    if (restantes.length === favoritos.length) return;
    if (restantes.length === 0) localStorage.removeItem('tb_favoritos');
    else localStorage.setItem('tb_favoritos', JSON.stringify(restantes));
  } catch { /* localStorage no disponible o con basura: no hay nada que limpiar */ }
}

// Arranca una sesión de prueba nueva, descartando cualquier estado anterior.
// También limpia lo que haya quedado de una sesión que se abandonó sin cerrar.
export function iniciarDemo() {
  limpiarRastros();
  const estado = crearEstadoInicial();
  guardarEstado(estado);
  return estado.usuario;
}

// Cierra la sesión de prueba y borra todo rastro.
export function cerrarDemo() {
  enMemoria = null;
  try { sessionStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
  limpiarRastros();
}
