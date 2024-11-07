const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const SessionLog = require('../models/SessionLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



// Listar todos los usuarios
exports.listarUsuarios = async (req, res) => {
    try {
      const usuarios = await Usuario.findAll({
        include: [{ model: Rol, as: 'Rol', attributes: ['nombre'] }]
      });
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
  };

  // Obtener los detalles de un usuario específico por su ID
  exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};


//Agregar un nuevo usuario
exports.crearUsuario = async (req, res) => {
    const { nombre, rol_id, email, contraseña } = req.body;
  
    try {
      const rol = await Rol.findByPk(rol_id);
      if (!rol) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }
  
      // Hash de la contraseña
      const contraseñaHash = await bcrypt.hash(contraseña, 10);
  
      const usuario = await Usuario.create({
        nombre,
        rol_id,
        email,
        contraseña: contraseñaHash
      });
  
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: 'Error al crear usuario' });
    }
  };
  

// Editar un usuario existente
exports.editarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, rol_id, email, contraseña } = req.body;
  
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Verifica si el rol existe antes de actualizar
      const rol = await Rol.findByPk(rol_id);
      if (!rol) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }
  
      // Actualizar los campos
      usuario.nombre = nombre;
      usuario.rol_id = rol_id;
      usuario.email = email;
  
      // Solo hashear la contraseña si ha sido cambiada
      if (contraseña) {
        usuario.contraseña = await bcrypt.hash(contraseña, 10);
      }
  
      await usuario.save();
      res.json(usuario);
    } catch (error) {
      res.status(400).json({ error: 'Error al editar el usuario' });
    }
  };

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    await usuario.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }


  
};

// Ejemplo en iniciarSesion:
exports.iniciarSesion = async (req, res) => {
    const { email, contraseña } = req.body;
  
    try {
      const usuario = await Usuario.findOne({
        where: { email },
        include: [{ model: Rol, as: 'Rol', attributes: ['nombre'] }]
      });
  
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
      if (!contraseñaValida) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
  
      const token = jwt.sign(
        {
          id: usuario.id,
          rol: usuario.Rol.nombre
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };


  // Controlador para cerrar sesión
exports.cerrarSesion = async (req, res) => {
  try {
    // Aquí podrías realizar alguna acción de cierre de sesión, como registrar el evento en la base de datos.
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};
