const { Op, Sequelize } = require('sequelize');
const DetalleVenta = require('../models/DetalleVenta');
const Producto = require('../models/Producto');
const Venta = require('../models/Venta');
const Medicamento = require('../models/Medicamento');

// controllers/productosController.js

exports.listarProductos = async (req, res) => {
  try {
    const { page = 1, limit = 10, nombre, categoria, orden, enExistencia } = req.query;

    // Opciones de búsqueda
    const where = {};
    if (nombre) where.nombre = { [Op.iLike]: `%${nombre}%` };
    if (categoria) where.categoria = categoria;
    if (enExistencia !== undefined) where.enExistencia = enExistencia === 'true'; // Filtrar por existencia

    // Opciones de ordenamiento
    const order = [];
    if (orden === 'nombre_asc') order.push(['nombre', 'ASC']);
    if (orden === 'nombre_desc') order.push(['nombre', 'DESC']);
    if (orden === 'precio') order.push(['precioVenta', 'ASC']);
    if (orden === 'cantidad') order.push(['cantidad', 'DESC']);

    // Paginación y consulta
    const productos = await Producto.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({
      totalItems: productos.count,
      totalPages: Math.ceil(productos.count / limit),
      currentPage: parseInt(page),
      productos: productos.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// Agregar un nuevo producto
exports.crearProducto = async (req, res) => {
  const { codigoBarras, nombre, descripcion, precioCompra, precioVenta, cantidad, enExistencia, esMedicamento } = req.body;

  try {
    const producto = await Producto.create({
      codigoBarras,
      nombre,
      descripcion,
      precioCompra,
      precioVenta,
      cantidad,
      enExistencia,
      esMedicamento
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el producto' });
  }
};

// Editar un producto existente
exports.editarProducto = async (req, res) => {
  const { id } = req.params;
  const { codigoBarras, nombre, descripcion, precioCompra, precioVenta, cantidad, enExistencia, esMedicamento } = req.body;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    producto.codigoBarras = codigoBarras;
    producto.nombre = nombre;
    producto.descripcion = descripcion;
    producto.precioCompra = precioCompra;
    producto.precioVenta = precioVenta;
    producto.cantidad = cantidad;
    producto.enExistencia = enExistencia;
    producto.esMedicamento = esMedicamento;

    await producto.save();
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: 'Error al editar el producto' });
  }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await producto.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// Controlador para buscar productos
exports.buscarProductos = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "El parámetro de búsqueda no puede estar vacío" });
    }

    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${query}%` } },
          { codigoBarras: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });

    res.json({ productos });
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// Controlador para buscar productos
exports.buscarProductosExistencia = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "El parámetro de búsqueda no puede estar vacío" });
    }

    const productos = await Producto.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { nombre: { [Op.iLike]: `%${query}%` } },
              { codigoBarras: { [Op.iLike]: `%${query}%` } }
            ]
          },
          sequelize.where(sequelize.col('cantidad'), '>', 0) // Condición estricta para cantidad > 0
        ]
      }
    });

    res.json({ productos });
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

exports.obtenerProductosDisponiblesParaMedicamento = async (req, res) => {
  try {
    // Obtener IDs de productos ya registrados en Medicamentos
    const medicamentos = await Medicamento.findAll({ attributes: ['productoId'] });
    const idsRegistrados = medicamentos.map(m => m.productoId);

    // Encontrar productos que son medicamentos y que no están registrados
    const productosDisponibles = await Producto.findAll({
      where: {
        esMedicamento: true,
        id: { [Op.notIn]: idsRegistrados }
      },
      attributes: ['id', 'nombre'] // Solo trae el ID y el nombre
    });

    res.json({ productos: productosDisponibles });
  } catch (error) {
    console.error('Error al obtener los productos disponibles para medicamentos:', error);
    res.status(500).json({ error: 'Error al obtener los productos disponibles' });
  }
};

// Nueva ruta para obtener productos en existencia con paginación
exports.obtenerProductosEnExistencia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: productos } = await Producto.findAndCountAll({
      where: { enExistencia: true },
      limit: limit,
      offset: offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      productos,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error al obtener productos en existencia:", error);
    res.status(500).json({ error: 'Error al obtener los productos en existencia' });
  }
};

// Nueva ruta para obtener productos agotados con paginación
exports.obtenerProductosAgotados = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: productos } = await Producto.findAndCountAll({
      where: { enExistencia: false },
      limit: limit,
      offset: offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      productos,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error al obtener productos agotados:", error);
    res.status(500).json({ error: 'Error al obtener los productos agotados' });
  }
};


// Nueva ruta para ordenar productos de A-Z y Z-A
exports.obtenerProductosOrdenados = async (req, res) => {
  try {
    const { orden } = req.query; // Espera "asc" o "desc"
    const productos = await Producto.findAll({
      order: [['nombre', orden === 'desc' ? 'DESC' : 'ASC']]
    });
    res.json({ productos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ordenar los productos' });
  }
};

// Función para los productos más vendidos
exports.productosMasVendidos = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  // Condición de fecha para aplicar el filtro
  const whereClause = fechaInicio && fechaFin ? {
    fechaHora: {
      [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
    }
  } : {};

  try {
    const productos = await DetalleVenta.findAll({
      include: [
        { model: Producto, attributes: ['nombre'] },
        { model: Venta, where: whereClause, attributes: [] }  // Filtro por fecha en las ventas
      ],
      attributes: [
        'productoId',
        [Sequelize.fn('SUM', Sequelize.col('DetalleVenta.cantidad')), 'totalCantidadVendida']
      ],
      group: ['productoId', 'Producto.id'],
      order: [[Sequelize.literal('"totalCantidadVendida"'), 'DESC']],
      limit: 10,
    });
    res.json(productos);
  } catch (error) {
    console.error('Error en productosMasVendidos:', error);
    res.status(500).json({ error: 'Error al obtener los productos más vendidos' });
  }
};

// Función para los productos menos vendidos
exports.productosMenosVendidos = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  // Condición de fecha para aplicar el filtro
  const whereClause = fechaInicio && fechaFin ? {
    fechaHora: {
      [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
    }
  } : {};

  try {
    const productos = await DetalleVenta.findAll({
      include: [
        { model: Producto, attributes: ['nombre'] },
        { model: Venta, where: whereClause, attributes: [] }  // Filtro por fecha en las ventas
      ],
      attributes: [
        'productoId',
        [Sequelize.fn('SUM', Sequelize.col('DetalleVenta.cantidad')), 'totalCantidadVendida']
      ],
      group: ['productoId', 'Producto.id'],
      order: [[Sequelize.literal('"totalCantidadVendida"'), 'ASC']],
      limit: 10,
    });
    res.json(productos);
  } catch (error) {
    console.error('Error en productosMenosVendidos:', error);
    res.status(500).json({ error: 'Error al obtener los productos menos vendidos' });
  }
};