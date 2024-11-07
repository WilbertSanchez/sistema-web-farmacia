const { Op } = require('sequelize'); 
const Caja = require('../models/Caja');
const Usuario = require('../models/Usuario');
const Ingreso = require('../models/Ingreso');
const Gasto = require('../models/Gasto');

// Abrir una nueva caja
exports.abrirCaja = async (req, res) => {
  const { usuarioId, montoInicial } = req.body;

  try {
    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (cajaAbierta) {
      return res.status(400).json({ error: 'Ya existe una caja abierta' });
    }

    const nuevaCaja = await Caja.create({
      usuarioId,
      montoInicial: parseFloat(montoInicial),
      montoIngresos: 0,
      montoGastos: 0,
      estado: 'Abierto'
    });

    res.status(201).json({ message: 'Caja abierta exitosamente', caja: nuevaCaja });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al abrir la caja' });
  }
};

// Cerrar la caja actual
exports.cerrarCaja = async (req, res) => {
  const { usuarioId } = req.body;

  try {
    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (!cajaAbierta) {
      return res.status(400).json({ error: 'No hay una caja abierta para cerrar' });
    }

    // Calcular ingresos y gastos totales asociados a esta caja abierta
    const totalIngresos = await Ingreso.sum('monto', {
      where: {
        createdAt: {
          [Op.gte]: cajaAbierta.createdAt, // Ingresos desde la apertura de la caja
          [Op.lte]: new Date() // Hasta el momento actual
        }
      }
    });

    const totalGastos = await Gasto.sum('monto', {
      where: {
        createdAt: {
          [Op.gte]: cajaAbierta.createdAt,
          [Op.lte]: new Date()
        }
      }
    });

    // Asignar ingresos y gastos calculados a la caja
    cajaAbierta.montoIngresos = parseFloat(totalIngresos || 0).toFixed(2);
    cajaAbierta.montoGastos = parseFloat(totalGastos || 0).toFixed(2);

    // Calcular el monto final de la caja y redondearlo a dos decimales
    cajaAbierta.montoFinal = parseFloat(
      parseFloat(cajaAbierta.montoInicial) + parseFloat(cajaAbierta.montoIngresos) - parseFloat(cajaAbierta.montoGastos)
    ).toFixed(2);

    cajaAbierta.fechaCierre = new Date();
    cajaAbierta.estado = 'Cerrado';
    cajaAbierta.usuarioId = usuarioId;
    
    // Guardar cambios en la caja
    await cajaAbierta.save();

    res.status(200).json({
      message: 'Caja cerrada exitosamente',
      caja: cajaAbierta,
      resumen: {
        totalIngresos: cajaAbierta.montoIngresos,
        totalGastos: cajaAbierta.montoGastos,
        montoFinal: cajaAbierta.montoFinal
      }
    });
  } catch (error) {
    console.error('Error al cerrar la caja:', error);
    res.status(400).json({ error: error.message || 'Error al cerrar la caja' });
  }
};


// Obtener el balance de la caja
exports.obtenerBalance = async (req, res) => {
  try {
    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (!cajaAbierta) {
      return res.status(404).json({ error: 'No hay una caja abierta' });
    }

    const balance = cajaAbierta.montoIngresos - cajaAbierta.montoGastos;
    res.json({
      ingresos: cajaAbierta.montoIngresos,
      gastos: cajaAbierta.montoGastos,
      balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener balance de caja' });
  }
};

// Obtener detalles de las aperturas y cierres de caja
exports.detallesCaja = async (req, res) => {
  try {
    const detalles = await Caja.findAll({
      where: { estado: 'Cerrado' },
      include: [
        {
          model: Usuario,
          attributes: ['nombre'] // Trae solo el nombre del usuario
        }
      ],
      order: [['fechaCierre', 'DESC']]
    });
    res.json(detalles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles de caja' });
  }
};