const { Op } = require('sequelize');
const Ingreso = require('../models/Ingreso');
const Caja = require('../models/Caja');
const Usuario = require('../models/Usuario');

// Registrar un nuevo ingreso
exports.registrarIngreso = async (req, res) => {
  const { usuarioId, monto, descripcion } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no válido' });
    }

    const ingreso = await Ingreso.create({ usuarioId, monto, descripcion });

    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (cajaAbierta) {
      cajaAbierta.montoIngresos += monto;
      await cajaAbierta.save();
    }

    res.status(201).json({ message: 'Ingreso registrado exitosamente', ingreso });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al registrar ingreso' });
  }
};


// Listar todos los ingresos
exports.listarIngresos = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  const whereClause = {};

  if (fechaInicio && fechaFin) {
    whereClause.createdAt = {
      [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
    };
  }

  try {
    const ingresos = await Ingreso.findAll({ where: whereClause });
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

// Editar un ingreso
exports.editarIngreso = async (req, res) => {
  const { id } = req.params;
  const { monto, descripcion } = req.body;

  try {
    const ingreso = await Ingreso.findByPk(id);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    ingreso.monto = monto;
    ingreso.descripcion = descripcion;
    await ingreso.save();

    res.json({ message: 'Ingreso actualizado exitosamente', ingreso });
  } catch (error) {
    res.status(500).json({ error: 'Error al editar ingreso' });
  }
};

// Eliminar un ingreso
exports.eliminarIngreso = async (req, res) => {
  const { id } = req.params;

  try {
    const ingreso = await Ingreso.findByPk(id);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    await ingreso.destroy();
    res.json({ message: 'Ingreso eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  }
};
