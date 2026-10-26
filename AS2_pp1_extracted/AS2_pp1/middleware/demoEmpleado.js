// ============================================================
// TEMPORAL — BORRAR este archivo y su linea en app.js.
// Modo demo sin base de datos para ver el rol EMPLEADO mientras Supabase no
// responde. Login: DNI 28999888, contrasena "empleado". Las rutas de lectura
// del panel devuelven datos de ejemplo solo si el token es del empleado demo.
// ============================================================
const jwt = require('jsonwebtoken');

const DNI = '28999888';
const hoy = new Date().toISOString();

const DATOS = {
    cuentas: [
        { id_cuenta: 1, id_producto: 1, nombre: 'Juan', apellido: 'Pérez', dni: '35123456', tipo: 'Caja de ahorro', cbu: '0000003100012345678901', alias: 'juan.perez.tb', saldo: '152340.50', estado: 'ACTIVO' },
        { id_cuenta: 2, id_producto: 2, nombre: 'Ricardo', apellido: 'Fort', dni: '20111222', tipo: 'Caja de ahorro', cbu: '0000003100098765432109', alias: 'comandante.tb', saldo: '8900.00', estado: 'BLOQUEADO' },
        { id_cuenta: 3, id_producto: 3, nombre: 'Lucía', apellido: 'Gómez', dni: '40222333', tipo: 'Caja de ahorro', cbu: '0000003100055566677788', alias: 'lucia.gomez.tb', saldo: '0.00', estado: 'CERRADO' },
    ],
    prestamos: [
        { id_prestamo: 1, nombre: 'Juan', apellido: 'Pérez', dni: '35123456', monto: '100000.00', cuotas_totales: 12, cuotas_pagadas: 3, saldo_pendiente: '84000.00', estado: 'ACTIVO', fecha_proximo_vencimiento: '2030-01-10' },
        { id_prestamo: 2, nombre: 'Ricardo', apellido: 'Fort', dni: '20111222', monto: '50000.00', cuotas_totales: 6, cuotas_pagadas: 1, saldo_pendiente: '45000.00', estado: 'BLOQUEADO', fecha_proximo_vencimiento: null },
    ],
    tarjetas: [
        { id_tarjeta: 1, nombre: 'Juan', apellido: 'Pérez', dni: '35123456', marca: 'VISA', numero_tarjeta: '4111111111111111', saldo_consumido: '23500.00', limite_compra: '200000.00', estado: 'ACTIVO' },
        { id_tarjeta: 2, nombre: 'Ricardo', apellido: 'Fort', dni: '20111222', marca: 'MASTERCARD', numero_tarjeta: '5500000000000004', saldo_consumido: '0.00', limite_compra: '80000.00', estado: 'BLOQUEADO' },
    ],
    seguros: [
        { id_poliza: 1, nombre: 'Juan', apellido: 'Pérez', dni: '35123456', tipo_seguro: 'Hogar', cobertura: '5000000.00', prima_mensual: '4200.00', estado: 'ACTIVO' },
    ],
    reportes: [
        { id: 1, descripcion: 'La pantalla de transferencias no carga en el celular', pagina: '/transferencias', nombre: 'Juan', apellido: 'Pérez', dni: '35123456', contacto: 'juan.perez@email.com', fecha: hoy, estado: 'ABIERTO' },
        { id: 2, descripcion: 'No me llegó el código de seguridad', pagina: '/login', nombre: null, apellido: null, dni: null, contacto: null, fecha: hoy, estado: 'RESUELTO' },
    ],
};

const esDemo = (req) => {
    try {
        const t = (req.headers.authorization || '').split(' ')[1];
        return jwt.verify(t, process.env.JWT_SECRET).demo === true;
    } catch { return false; }
};

module.exports = (req, res, next) => {
    if (req.method === 'POST' && req.path === '/api/auth/login' && req.body?.dni === DNI) {
        if (req.body.password !== 'empleado') return res.status(401).json({ error: 'DNI o password incorrectos' });
        const roles = ['EMPLEADO'];
        const token = jwt.sign({ id: 9999, dni: DNI, nombre: 'María', roles, demo: true }, process.env.JWT_SECRET, { expiresIn: '8h' });
        return res.json({
            mensaje: 'Bienvenida, María García (demo)', token,
            usuario: { id: 9999, nombre: 'María', apellido: 'García', dni: DNI, roles, esAdmin: false, esEmpleado: true },
        });
    }
    const m = req.method === 'GET' && req.path.match(/^\/api\/admin\/(cuentas|prestamos|tarjetas|seguros|reportes)$/);
    if (m && esDemo(req)) return res.json(DATOS[m[1]]);
    if (req.method === 'PUT' && /^\/api\/admin\/reportes\/\d+\/estado$/.test(req.path) && esDemo(req)) return res.json({ ok: true });
    next();
};
