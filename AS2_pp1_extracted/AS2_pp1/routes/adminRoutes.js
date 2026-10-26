// ============================================================
// routes/adminRoutes.js — RUTAS DEL PANEL DE ADMINISTRADOR
// Todas requieren estar logueado (verificarToken). Las de lectura (GET) las
// puede usar el personal de soporte (EMPLEADO, verificarStaff); las que
// modifican o borran algo requieren el rol ADMIN (verificarAdmin).
// Si falta el rol que corresponde, se rechaza el pedido.
// ============================================================

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { verificarToken, verificarAdmin, verificarStaff } = require('../middleware/authMiddleware');

// GET /api/admin/cuentas - Lista todas las cuentas del banco
router.get('/admin/cuentas', verificarToken, verificarStaff, adminController.listarCuentas);

// PUT /api/admin/cuentas/:idProducto/estado - Cambia el estado de una cuenta
router.put('/admin/cuentas/:idProducto/estado', verificarToken, verificarAdmin, adminController.cambiarEstadoCuenta);

// DELETE /api/admin/cuentas/:idProducto - Elimina la cuenta para siempre (sin saldo ni prestamos pendientes)
router.delete('/admin/cuentas/:idProducto', verificarToken, verificarAdmin, adminController.eliminarCuenta);

// GET /api/admin/prestamos - Lista todos los prestamos del banco
router.get('/admin/prestamos', verificarToken, verificarStaff, adminController.listarPrestamos);

// PUT /api/admin/prestamos/:idPrestamo/mora - Marca un prestamo en mora e informa a la Central de Deudores
router.put('/admin/prestamos/:idPrestamo/mora', verificarToken, verificarAdmin, adminController.marcarPrestamoEnMora);

// GET /api/admin/tarjetas - Lista todas las tarjetas de credito del banco
router.get('/admin/tarjetas', verificarToken, verificarStaff, adminController.listarTarjetas);

// POST /api/admin/tarjetas - Entrega una tarjeta a una persona (por DNI)
router.post('/admin/tarjetas', verificarToken, verificarAdmin, adminController.darTarjeta);

// PUT /api/admin/tarjetas/:idTarjeta/limite - Fija el limite de compra (aunque este bloqueada)
router.put('/admin/tarjetas/:idTarjeta/limite', verificarToken, verificarAdmin, adminController.cambiarLimiteTarjeta);

// DELETE /api/admin/tarjetas/:idTarjeta - Quita (cierra) una tarjeta
router.delete('/admin/tarjetas/:idTarjeta', verificarToken, verificarAdmin, adminController.quitarTarjeta);

// GET /api/admin/seguros - Lista todas las polizas del banco
router.get('/admin/seguros', verificarToken, verificarStaff, adminController.listarSeguros);

module.exports = router;
