const express = require('express');
const { crearProducto, editarProducto, eliminarProducto, listarProductos,obtenerProductoPorId, buscarProductos, obtenerProductosDisponiblesParaMedicamento, buscarProductosExistencia, obtenerProductosAgotados, obtenerProductosEnExistencia,obtenerProductosOrdenados, productosMasVendidos, productosMenosVendidos } = require('../controllers/productoController');
const router = express.Router();


router.get('/productos/mas-vendidos', productosMasVendidos);
router.get('/productos/menos-vendidos', productosMenosVendidos);
router.get('/productos/existencia', obtenerProductosEnExistencia);
router.get('/productos/agotados', obtenerProductosAgotados);
router.get('/productos/ordenados', obtenerProductosOrdenados);
router.post('/productos', crearProducto);
router.get('/productos/buscar', buscarProductos);
router.get('/productos/buscarExistencia', buscarProductosExistencia);
router.put('/productos/:id', editarProducto);
router.delete('/productos/:id', eliminarProducto);
router.get('/productos/disponibles-medicamentos', obtenerProductosDisponiblesParaMedicamento);
router.get('/productos', listarProductos);
router.get('/productos/:id', obtenerProductoPorId );



module.exports = router;
