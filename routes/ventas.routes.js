const express = require('express');
const { registrarVenta, editarVenta, eliminarVenta, listarVentas, obtenerVentaPorId } = require('../controllers/ventaController');
const router = express.Router();

router.get('/ventas/verVenta/:ventaId', obtenerVentaPorId);
router.get('/ventas/listarVentas', listarVentas);
router.post('/ventas', registrarVenta);
router.put('/ventas/:ventaId', editarVenta); // Ruta para editar una venta
router.delete('/ventas/:ventaId', eliminarVenta); // Ruta para eliminar una venta

module.exports = router;
