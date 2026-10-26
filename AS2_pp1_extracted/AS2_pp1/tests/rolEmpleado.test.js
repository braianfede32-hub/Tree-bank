// El EMPLEADO (soporte) solo pasa por las rutas de consulta; todo lo que
// modifica o borra sigue siendo del ADMIN.
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

jest.mock('../controllers/adminController', () => {
    const ok = (req, res) => res.json({ ok: true });
    return {
        listarCuentas: ok, cambiarEstadoCuenta: ok, eliminarCuenta: ok,
        listarPrestamos: ok, marcarPrestamoEnMora: ok,
        listarTarjetas: ok, darTarjeta: ok, cambiarLimiteTarjeta: ok, quitarTarjeta: ok,
        listarSeguros: ok,
    };
});

const adminRoutes = require('../routes/adminRoutes');

const app = express();
app.use(express.json());
app.use('/api', adminRoutes);

const tokenCon = (roles) => jwt.sign({ id: 1, dni: '1', nombre: 'X', roles }, process.env.JWT_SECRET);

describe('rol EMPLEADO en /api/admin', () => {
    const empleado = `Bearer ${tokenCon(['EMPLEADO'])}`;
    const admin = `Bearer ${tokenCon(['ADMIN'])}`;
    const cliente = `Bearer ${tokenCon([])}`;

    test.each(['cuentas', 'prestamos', 'tarjetas', 'seguros'])('empleado y admin pueden ver %s', async (r) => {
        expect((await request(app).get(`/api/admin/${r}`).set('Authorization', empleado)).status).toBe(200);
        expect((await request(app).get(`/api/admin/${r}`).set('Authorization', admin)).status).toBe(200);
    });

    test('un cliente no puede ver el panel', async () => {
        expect((await request(app).get('/api/admin/cuentas').set('Authorization', cliente)).status).toBe(403);
    });

    test.each([
        ['put', '/api/admin/cuentas/1/estado'],
        ['delete', '/api/admin/cuentas/1'],
        ['put', '/api/admin/prestamos/1/mora'],
        ['post', '/api/admin/tarjetas'],
        ['put', '/api/admin/tarjetas/1/limite'],
        ['delete', '/api/admin/tarjetas/1'],
    ])('empleado NO puede %s %s', async (metodo, ruta) => {
        expect((await request(app)[metodo](ruta).set('Authorization', empleado)).status).toBe(403);
        expect((await request(app)[metodo](ruta).set('Authorization', admin)).status).toBe(200);
    });
});
