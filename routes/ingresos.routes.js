const express = require('express');
const { registrarIngreso, listarIngresos, editarIngreso, eliminarIngreso } = require('../controllers/ingresoController');

const router = express.Router();

// Rutas para ingresos sin autenticación ni roles
router.post('/ingresos/NuevoIngreso', registrarIngreso);
router.get('/ingresos/VerIngresos', listarIngresos);
router.put('/ingresos/:id', editarIngreso);
router.delete('/ingresos/:id', eliminarIngreso);

module.exports = router;
