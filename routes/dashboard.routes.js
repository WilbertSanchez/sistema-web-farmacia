const express = require('express');
const { obtenerTotalesDashboard} = require('../controllers/dashboardController');
const router = express.Router();

// Ruta para registrar un gasto
router.get('/dashboard', obtenerTotalesDashboard);

module.exports = router;
