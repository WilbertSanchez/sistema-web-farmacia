const express = require('express');
const { crearRol, editarRol, eliminarRol, listarRoles } = require('../controllers/rolController');
const router = express.Router();

router.get('/roles/listarRoles', listarRoles);
router.post('/roles', crearRol);
router.put('/roles/:id', editarRol);
router.delete('/roles/:id', eliminarRol);

module.exports = router;
