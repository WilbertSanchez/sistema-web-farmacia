const Ingreso = require('../models/Ingreso');
const Gasto = require('../models/Gasto');
const { Op } = require('sequelize');

exports.obtenerTotalesDashboard = async (req, res) => {
  try {
    // Filtrar por fecha si se incluyen fechas en la solicitud
    const { fechaInicio, fechaFin } = req.query;
    const whereClause = {};

    if (fechaInicio && fechaFin) {
      whereClause.fechaHora = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }

    // Obtener la suma total de ingresos y gastos
    const totalIngresos = await Ingreso.sum('monto', { where: whereClause }) || 0.00;
    const totalGastos = await Gasto.sum('monto', { where: whereClause }) || 0.00;

    // Responder con ambos totales en un solo objeto JSON
    res.status(200).json({ totalIngresos: totalIngresos.toFixed(2), totalGastos: totalGastos.toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los totales del dashboard' });
  }
};
