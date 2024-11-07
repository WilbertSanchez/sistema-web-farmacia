const Rol = require('../models/Rol');

// Listar todos los roles
exports.listarRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar roles' });
  }
};

// Agregar un nuevo rol
exports.crearRol = async (req, res) => {
  const { nombre } = req.body;
  try {
    const rol = await Rol.create({ nombre });
    res.status(201).json(rol);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el rol' });
  }
};

// Editar un rol existente
exports.editarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const rol = await Rol.findByPk(id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    rol.nombre = nombre;
    await rol.save();
    res.json(rol);
  } catch (error) {
    res.status(400).json({ error: 'Error al editar el rol' });
  }
};

// Eliminar un rol
exports.eliminarRol = async (req, res) => {
  const { id } = req.params;
  try {
    const rol = await Rol.findByPk(id);
    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    await rol.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el rol' });
  }
};
