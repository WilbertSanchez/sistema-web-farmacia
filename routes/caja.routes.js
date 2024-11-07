const express = require('express');
const { abrirCaja, cerrarCaja, obtenerBalance, detallesCaja } = require('../controllers/cajaController');

const router = express.Router();

// Rutas para caja sin autenticación ni roles
router.post('/caja/abrir', abrirCaja);
router.post('/caja/cerrar', cerrarCaja);
router.get('/caja/balance', obtenerBalance);
router.get('/caja/detalles', detallesCaja);

module.exports = router;
