const express = require('express');
const { crearUsuario, editarUsuario, eliminarUsuario, iniciarSesion, cerrarSesion, listarUsuarios, obtenerUsuarioPorId } = require('../controllers/usuarioController');
const router = express.Router();

router.get('/usuarios/listarUsuario/:id', obtenerUsuarioPorId);
router.get('/usuarios/listarUsuarios', listarUsuarios);       
router.post('/usuarios', crearUsuario);
router.put('/usuarios/:id', editarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

// Ruta de inicio de sesión
router.post('/usuarios/login', iniciarSesion);

// Ruta para cerrar sesión
router.post('/usuarios/logout', cerrarSesion);

module.exports = router;
