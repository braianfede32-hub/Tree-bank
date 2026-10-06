// ============================================================
// controllers/adminController.js — PANEL DE ADMINISTRADOR
// Solo lo pueden usar personas con el rol ADMIN (ver middleware verificarAdmin).
// Permite ver todas las cuentas del banco y cambiar su estado
// (bloquear, reactivar o cerrar una cuenta).
// ============================================================

const Persona = require('../models/personaModel');
const Prestamo = require('../models/prestamoModel');
const Tarjeta = require('../models/tarjetaModel');
const Seguro = require('../models/seguroModel');
const { reportarMora } = require('../services/moraService');
const { validarMonto, aMonto, validarDni } = require('../utils/validaciones');

const ESTADOS_VALIDOS = ['ACTIVO', 'BLOQUEADO', 'CERRADO'];

// GET /api/admin/cuentas - Lista todas las cuentas del banco con su dueno
exports.listarCuentas = async (req, res) => {
    try {
        const cuentas = await Persona.getAllCuentasAdmin();
        res.json(cuentas);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las cuentas', detalle: error.message });
    }
};

// PUT /api/admin/cuentas/:idProducto/estado - Bloquea, reactiva o cierra una cuenta
exports.cambiarEstadoCuenta = async (req, res) => {
    const { idProducto } = req.params;
    const { estado } = req.body;

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    try {
        const actualizado = await Persona.cambiarEstadoCuenta(idProducto, estado);
        if (!actualizado) {
            return res.status(404).json({ error: 'No se encontro la cuenta indicada' });
        }
        res.json({ mensaje: `Cuenta actualizada a estado ${estado}`, id_producto: actualizado.id_producto, estado });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar el estado de la cuenta', detalle: error.message });
    }
};

// DELETE /api/admin/cuentas/:idProducto - Elimina una cuenta para siempre (cuenta + movimientos)
// Solo se permite si no tiene saldo pendiente ni tarjetas de credito activas (prestamos pendientes)
exports.eliminarCuenta = async (req, res) => {
    const { idProducto } = req.params;

    try {
        const info = await Persona.getCuentaParaCierre(idProducto);
        if (!info) {
            return res.status(404).json({ error: 'No se encontro la cuenta indicada' });
        }

        if (Number(info.saldo) !== 0) {
            return res.status(409).json({
                error: `La cuenta todavia tiene saldo ($ ${info.saldo}). Hay que vaciarla (transferencia o retiro) antes de eliminarla definitivamente.`
            });
        }

        if (info.tiene_prestamo_pendiente) {
            return res.status(409).json({
                error: 'La persona tiene una tarjeta de credito activa (prestamo pendiente). No se puede eliminar la cuenta hasta que se cierre o salde esa deuda.'
            });
        }

        const eliminado = await Persona.eliminarCuentaDefinitivo(idProducto);
        if (!eliminado) {
            return res.status(404).json({ error: 'No se encontro la cuenta indicada' });
        }

        res.json({ mensaje: 'Cuenta eliminada definitivamente', id_producto: Number(idProducto) });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la cuenta', detalle: error.message });
    }
};

// GET /api/admin/prestamos - Lista todos los prestamos del banco
exports.listarPrestamos = async (req, res) => {
    try {
        const prestamos = await Prestamo.getAllPrestamosAdmin();
        res.json(prestamos);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los prestamos', detalle: error.message });
    }
};

// PUT /api/admin/prestamos/:idPrestamo/mora - Marca un prestamo como en mora
// y lo informa a la Central de Deudores (situacion 4: riesgo alto de insolvencia).
// A partir de ahi, CUALQUIER banco del sistema va a ver esta deuda si consulta
// la situacion crediticia de esta persona (por ejemplo, al evaluar otro prestamo).
exports.marcarPrestamoEnMora = async (req, res) => {
    const { idPrestamo } = req.params;

    try {
        const prestamo = await Prestamo.getPrestamoDetalle(idPrestamo);
        if (!prestamo) {
            return res.status(404).json({ error: 'No se encontro el prestamo indicado' });
        }

        try {
            await reportarMora(prestamo);
        } catch (error) {
            if (error.codigo === 'ESTADO_INVALIDO') {
                return res.status(409).json({ error: error.message });
            }
            throw error;
        }

        res.json({
            mensaje: `Prestamo marcado en mora e informado a la Central de Deudores (situacion 4)`,
            id_prestamo: Number(idPrestamo),
            dni: prestamo.dni,
            saldo_pendiente: prestamo.saldo_pendiente
        });
    } catch (error) {
        const detalle = error.response ? error.response.data : error.message;
        res.status(500).json({ error: 'No se pudo marcar el prestamo en mora', detalle });
    }
};

// GET /api/admin/tarjetas - Lista todas las tarjetas de credito del banco
exports.listarTarjetas = async (req, res) => {
    try {
        const tarjetas = await Tarjeta.getAllTarjetasAdmin();
        res.json(tarjetas);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las tarjetas', detalle: error.message });
    }
};

// PUT /api/admin/tarjetas/:idTarjeta/limite - Fija el limite de compra de una tarjeta.
// Funciona sin importar el estado de la cuenta o de la tarjeta (incluso bloqueadas).
exports.cambiarLimiteTarjeta = async (req, res) => {
    const { idTarjeta } = req.params;
    if (!validarMonto(req.body.limite_compra)) {
        return res.status(400).json({ error: 'El limite debe ser un numero mayor a 0' });
    }
    const limite = aMonto(req.body.limite_compra);

    try {
        const tarjeta = await Tarjeta.getTarjetaDetalle(idTarjeta);
        if (!tarjeta) {
            return res.status(404).json({ error: 'No se encontro la tarjeta indicada' });
        }
        const actualizada = await Tarjeta.setLimiteCompra(idTarjeta, limite);
        if (!actualizada) {
            return res.status(409).json({
                error: `El limite no puede ser menor a lo ya consumido ($ ${Number(tarjeta.saldo_consumido).toFixed(2)})`
            });
        }
        res.json({ mensaje: 'Limite actualizado', id_tarjeta: actualizada.id_tarjeta, limite_compra: actualizada.limite_compra });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar el limite de la tarjeta', detalle: error.message });
    }
};

// DELETE /api/admin/tarjetas/:idTarjeta - Quita una tarjeta (queda CERRADA, con su historial).
// A diferencia del cierre del cliente, el admin puede cerrarla aunque tenga saldo en el resumen.
exports.quitarTarjeta = async (req, res) => {
    const { idTarjeta } = req.params;
    try {
        const tarjeta = await Tarjeta.getTarjetaDetalle(idTarjeta);
        if (!tarjeta) {
            return res.status(404).json({ error: 'No se encontro la tarjeta indicada' });
        }
        if (tarjeta.estado === 'CERRADO') {
            return res.status(409).json({ error: 'Esta tarjeta ya esta cerrada' });
        }
        await Tarjeta.cerrarTarjeta(tarjeta.id_producto);
        res.json({ mensaje: 'Tarjeta quitada', id_tarjeta: tarjeta.id_tarjeta, estado: 'CERRADO' });
    } catch (error) {
        res.status(500).json({ error: 'Error al quitar la tarjeta', detalle: error.message });
    }
};

// POST /api/admin/tarjetas - Entrega una tarjeta a una persona por DNI, sin pasar por la
// Central de Deudores ni exigir que la cuenta este activa. El limite es opcional.
exports.darTarjeta = async (req, res) => {
    const { dni, limite_compra } = req.body;
    const marca = String(req.body.marca || 'VISA').toUpperCase();

    if (!validarDni(dni)) {
        return res.status(400).json({ error: 'El DNI debe tener 7 u 8 digitos' });
    }
    if (!Tarjeta.MARCAS_VALIDAS.includes(marca)) {
        return res.status(400).json({ error: `La marca debe ser una de: ${Tarjeta.MARCAS_VALIDAS.join(', ')}` });
    }
    if (limite_compra !== undefined && limite_compra !== '' && !validarMonto(limite_compra)) {
        return res.status(400).json({ error: 'El limite debe ser un numero mayor a 0' });
    }
    const limite_forzado = (limite_compra === undefined || limite_compra === '') ? undefined : aMonto(limite_compra);

    try {
        const persona = await Persona.getPersonaByDni(String(dni).trim());
        if (!persona) {
            return res.status(404).json({ error: 'No existe una persona con ese DNI' });
        }
        const tarjeta = await Tarjeta.crearTarjeta({
            id_persona: persona.id, marca, situacion_al_otorgar: 1, limite_forzado
        });
        res.status(201).json({ mensaje: 'Tarjeta entregada', tarjeta });
    } catch (error) {
        if (error.codigo === 'TARJETA_DUPLICADA') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al entregar la tarjeta', detalle: error.message });
    }
};

// GET /api/admin/seguros - Lista todas las polizas del banco
exports.listarSeguros = async (req, res) => {
    try {
        const polizas = await Seguro.getAllPolizasAdmin();
        res.json(polizas);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las polizas', detalle: error.message });
    }
};
