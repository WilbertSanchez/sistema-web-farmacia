const { Op } = require('sequelize');
const Gasto = require('../models/Gasto');
const Caja = require('../models/Caja');

// Registrar un nuevo gasto
exports.registrarGasto = async (req, res) => {
  const { usuarioId, monto, descripcion } = req.body;

  try {
    const gasto = await Gasto.create({ usuarioId, monto, descripcion });

    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (cajaAbierta) {
      cajaAbierta.montoGastos += monto;
      await cajaAbierta.save();
    }

    res.status(201).json({ message: 'Gasto registrado exitosamente', gasto });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al registrar gasto' });
  }
};

// Obtener gastos filtrados por fecha
exports.listarGastos = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  const whereClause = {};

  if (fechaInicio && fechaFin) {
    whereClause.createdAt = {
      [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
    };
  }

  try {
    const gastos = await Gasto.findAll({ where: whereClause });
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

// Editar un gasto
exports.editarGasto = async (req, res) => {
  const { id } = req.params;
  const { monto, descripcion } = req.body;

  try {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    gasto.monto = monto;
    gasto.descripcion = descripcion;
    await gasto.save();

    res.json({ message: 'Gasto actualizado exitosamente', gasto });
  } catch (error) {
    res.status(500).json({ error: 'Error al editar gasto' });
  }
};

// Eliminar un gasto
exports.eliminarGasto = async (req, res) => {
  const { id } = req.params;

  try {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    await gasto.destroy();
    res.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};
