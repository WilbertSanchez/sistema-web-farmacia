const express = require('express');
const { registrarGasto, listarGastos, editarGasto, eliminarGasto } = require('../controllers/gastoController');

const router = express.Router();

// Rutas para gastos sin autenticación ni roles
router.post('/gastos/NuevoGasto', registrarGasto);
router.get('/gastos/VerGastos', listarGastos);
router.put('/gastos/:id', editarGasto);
router.delete('/gastos/:id', eliminarGasto);

module.exports = router;
