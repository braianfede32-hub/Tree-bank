// Acciones del admin sobre tarjetas: fijar limite, quitar y entregar,
// sin depender del estado de la cuenta o de la tarjeta.

const express = require('express');
const request = require('supertest');

jest.mock('../models/tarjetaModel');
jest.mock('../models/personaModel');
jest.mock('../models/prestamoModel');
jest.mock('../models/seguroModel');
jest.mock('../services/moraService', () => ({ reportarMora: jest.fn() }));

const Tarjeta = require('../models/tarjetaModel');
const Persona = require('../models/personaModel');
const adminController = require('../controllers/adminController');

Tarjeta.MARCAS_VALIDAS = ['VISA', 'MASTERCARD'];

const app = express();
app.use(express.json());
app.put('/admin/tarjetas/:idTarjeta/limite', adminController.cambiarLimiteTarjeta);
app.delete('/admin/tarjetas/:idTarjeta', adminController.quitarTarjeta);
app.post('/admin/tarjetas', adminController.darTarjeta);

beforeEach(() => jest.resetAllMocks());

describe('PUT limite', () => {
    test('rechaza un limite invalido', async () => {
        const res = await request(app).put('/admin/tarjetas/1/limite').send({ limite_compra: -5 });
        expect(res.status).toBe(400);
    });

    test('actualiza aunque la tarjeta este bloqueada', async () => {
        Tarjeta.getTarjetaDetalle.mockResolvedValue({ id_tarjeta: 1, estado: 'BLOQUEADO', saldo_consumido: 0 });
        Tarjeta.setLimiteCompra.mockResolvedValue({ id_tarjeta: 1, limite_compra: '80000.00' });
        const res = await request(app).put('/admin/tarjetas/1/limite').send({ limite_compra: 80000 });
        expect(res.status).toBe(200);
        expect(Tarjeta.setLimiteCompra).toHaveBeenCalledWith('1', 80000);
    });

    test('409 si el limite queda por debajo de lo consumido', async () => {
        Tarjeta.getTarjetaDetalle.mockResolvedValue({ id_tarjeta: 1, estado: 'ACTIVO', saldo_consumido: 5000 });
        Tarjeta.setLimiteCompra.mockResolvedValue(undefined);
        const res = await request(app).put('/admin/tarjetas/1/limite').send({ limite_compra: 1000 });
        expect(res.status).toBe(409);
    });

    test('404 si no existe la tarjeta', async () => {
        Tarjeta.getTarjetaDetalle.mockResolvedValue(undefined);
        const res = await request(app).put('/admin/tarjetas/9/limite').send({ limite_compra: 1000 });
        expect(res.status).toBe(404);
    });
});

describe('DELETE tarjeta', () => {
    test('cierra aunque tenga saldo pendiente', async () => {
        Tarjeta.getTarjetaDetalle.mockResolvedValue({ id_tarjeta: 1, id_producto: 7, estado: 'ACTIVO', saldo_consumido: 9999 });
        const res = await request(app).delete('/admin/tarjetas/1');
        expect(res.status).toBe(200);
        expect(Tarjeta.cerrarTarjeta).toHaveBeenCalledWith(7);
    });

    test('409 si ya estaba cerrada', async () => {
        Tarjeta.getTarjetaDetalle.mockResolvedValue({ id_tarjeta: 1, id_producto: 7, estado: 'CERRADO' });
        const res = await request(app).delete('/admin/tarjetas/1');
        expect(res.status).toBe(409);
    });
});

describe('POST dar tarjeta', () => {
    test('entrega sin consultar la Central de Deudores y con limite propio', async () => {
        Persona.getPersonaByDni.mockResolvedValue({ id: 12 });
        Tarjeta.crearTarjeta.mockResolvedValue({ id_tarjeta: 3 });
        const res = await request(app).post('/admin/tarjetas').send({ dni: '30111222', marca: 'mastercard', limite_compra: 200000 });
        expect(res.status).toBe(201);
        expect(Tarjeta.crearTarjeta).toHaveBeenCalledWith({
            id_persona: 12, marca: 'MASTERCARD', situacion_al_otorgar: 1, limite_forzado: 200000
        });
    });

    test('404 si el DNI no existe', async () => {
        Persona.getPersonaByDni.mockResolvedValue(undefined);
        const res = await request(app).post('/admin/tarjetas').send({ dni: '30111222' });
        expect(res.status).toBe(404);
    });

    test('400 con DNI invalido', async () => {
        const res = await request(app).post('/admin/tarjetas').send({ dni: 'abc' });
        expect(res.status).toBe(400);
    });

    test('409 si ya tiene una activa de esa marca', async () => {
        Persona.getPersonaByDni.mockResolvedValue({ id: 12 });
        const e = new Error('Ya tiene una tarjeta VISA activa'); e.codigo = 'TARJETA_DUPLICADA';
        Tarjeta.crearTarjeta.mockRejectedValue(e);
        const res = await request(app).post('/admin/tarjetas').send({ dni: '30111222', marca: 'VISA' });
        expect(res.status).toBe(409);
    });
});
