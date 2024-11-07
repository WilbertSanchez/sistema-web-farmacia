const { Op } = require('sequelize');
const Medicamento = require('../models/Medicamento');
const Producto = require('../models/Producto');

// Agregar un nuevo medicamento
exports.crearMedicamento = async (req, res) => {
    const { productoId, dosis, indicaciones, formaAdministracion, compuesto } = req.body;
  
    try {
      const medicamento = await Medicamento.create({
        productoId,
        dosis,
        indicaciones,
        formaAdministracion,
        compuesto // Incluir el nuevo campo
      });
      res.status(201).json(medicamento);
    } catch (error) {
      console.error('Error al crear el medicamento:', error);
      res.status(500).json({ error: 'Error al crear el medicamento' });
    }
  };
  
  exports.editarMedicamento = async (req, res) => {
    const { id } = req.params;
    const { productoId, dosis, indicaciones, formaAdministracion, compuesto } = req.body;
  
    try {
      const medicamento = await Medicamento.findByPk(id);
      if (!medicamento) {
        return res.status(404).json({ error: 'Medicamento no encontrado' });
      }
  
      medicamento.productoId = productoId;
      medicamento.dosis = dosis;
      medicamento.indicaciones = indicaciones;
      medicamento.formaAdministracion = formaAdministracion;
      medicamento.compuesto = compuesto; // Actualizar el campo compuesto
  
      await medicamento.save();
      res.json(medicamento);
    } catch (error) {
      console.error('Error al editar el medicamento:', error);
      res.status(500).json({ error: 'Error al editar el medicamento' });
    }
  };
  

// Eliminar un medicamento
exports.eliminarMedicamento = async (req, res) => {
  const { id } = req.params;

  try {
    const medicamento = await Medicamento.findByPk(id);
    if (!medicamento) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    await medicamento.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el medicamento' });
  }
};


// Obtener todos los medicamentos con paginación
exports.obtenerMedicamentos = async (req, res) => {
    const { page = 1, limit = 10, nombre = '', orden = '' } = req.query;
    const offset = (page - 1) * limit;
  
    try {
      const { count, rows } = await Medicamento.findAndCountAll({
        include: [{
          model: Producto,
          attributes: ['nombre'], // Incluye solo el nombre del producto
          where: { nombre: { [Op.like]: `%${nombre}%` } }
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: orden ? [[orden, 'ASC']] : [],
      });
  
      res.json({
        medicamentos: rows,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los medicamentos' });
    }
  };
  
  
  // Obtener un medicamento por ID
exports.obtenerMedicamentoPorId = async (req, res) => {
    const { id } = req.params;
  
    try {
      const medicamento = await Medicamento.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['nombre'], // Incluye solo el nombre del producto
        }],
      });
      if (!medicamento) {
        return res.status(404).json({ error: 'Medicamento no encontrado' });
      }
      res.json(medicamento);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el medicamento' });
    }
  };

  exports.buscarMedicamentos = async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'El parámetro de búsqueda no puede estar vacío' });
      }
  
      const medicamentos = await Medicamento.findAll({
        include: [{
          model: Producto,
          as: 'Producto',
          where: {
            [Op.or]: [
              { nombre: { [Op.iLike]: `%${query}%` } },
              { '$Medicamento.compuesto$': { [Op.iLike]: `%${query}%` } }
            ]
          }
        }]
      });
  
      res.json({ medicamentos });
    } catch (error) {
      console.error('Error en la búsqueda de medicamentos:', error);
      res.status(500).json({ error: 'Error al buscar medicamentos' });
    }
  };
  