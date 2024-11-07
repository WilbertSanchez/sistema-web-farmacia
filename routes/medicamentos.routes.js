const express = require('express');
const { crearMedicamento, editarMedicamento, eliminarMedicamento, obtenerMedicamentoPorId, obtenerMedicamentos, buscarMedicamentos } = require('../controllers/medicamentoController');
const router = express.Router();

router.get('/medicamentos/buscar', buscarMedicamentos);
router.get('/medicamentos', obtenerMedicamentos);
router.get('/medicamentos/:id', obtenerMedicamentoPorId);
router.post('/medicamentos', crearMedicamento);
router.put('/medicamentos/:id', editarMedicamento);
router.delete('/medicamentos/:id', eliminarMedicamento);

module.exports = router;
