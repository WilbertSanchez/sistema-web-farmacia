const { Op } = require('sequelize');
const Venta = require('../models/Venta');
const DetalleVenta = require('../models/DetalleVenta');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Caja = require('../models/Caja');
const Ingreso = require('../models/Ingreso');


// Controlador registrarVenta
exports.registrarVenta = async (req, res) => {
  const { usuarioId, productos } = req.body;

  try {
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'No hay productos en la venta' });
    }

    let montoTotal = 0;

    const detalles = await Promise.all(
      productos.map(async (producto) => {
        const productoDb = await Producto.findByPk(producto.productoId);
        if (!productoDb) {
          throw new Error(`Producto con ID ${producto.productoId} no encontrado`);
        }
        if (productoDb.cantidad < producto.cantidad) {
          throw new Error(`Inventario insuficiente para el producto con ID ${producto.productoId}`);
        }

        const precioVenta = productoDb.precioVenta;
        const subtotal = precioVenta * producto.cantidad;
        montoTotal += subtotal;

        productoDb.cantidad -= producto.cantidad;
        productoDb.enExistencia = productoDb.cantidad > 0;
        await productoDb.save();

        return {
          ventaId: null,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioVenta,
        };
      })
    );

    const venta = await Venta.create({
      usuarioId,
      montoTotal,
      fechaHora: new Date(),
    });

    detalles.forEach(detalle => detalle.ventaId = venta.id);
    await DetalleVenta.bulkCreate(detalles);

    await Ingreso.create({
      usuarioId,
      ventaId: venta.id, // Asociar el ingreso a la venta
      monto: montoTotal,
      descripcion: `Ingreso por venta #${venta.id}`,
      fechaHora: new Date(),
    });
    

    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (cajaAbierta) {
      cajaAbierta.montoIngresos += montoTotal;
      await cajaAbierta.save();
    }

    res.status(201).json({ message: 'Venta registrada exitosamente', venta, detalles });
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    res.status(400).json({ error: error.message || 'Error al registrar la venta' });
  }
};


exports.editarVenta = async (req, res) => {
  const { ventaId } = req.params;
  const { usuarioId, productos } = req.body;

  try {
    // Verificar si la venta existe
    const venta = await Venta.findByPk(ventaId);
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Verificar si la caja está abierta
    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (!cajaAbierta) {
      return res.status(400).json({ error: 'No hay una caja abierta para actualizar los ingresos' });
    }

    // Restar el monto de la venta anterior de la caja
    cajaAbierta.montoIngresos -= venta.montoTotal;
    await cajaAbierta.save();

    // Restaurar el inventario de los productos de la venta anterior
    const detallesPrevios = await DetalleVenta.findAll({ where: { ventaId } });
    await Promise.all(
      detallesPrevios.map(async (detalle) => {
        const producto = await Producto.findByPk(detalle.productoId);
        if (producto) {
          producto.cantidad += detalle.cantidad;
          producto.enExistencia = producto.cantidad > 0;
          await producto.save();
        }
      })
    );

    // Eliminar los detalles previos de la venta
    await DetalleVenta.destroy({ where: { ventaId } });

    // Calcular el nuevo monto total y actualizar el inventario
    let montoTotal = 0;
    const nuevosDetalles = await Promise.all(
      productos.map(async (producto) => {
        const productoDb = await Producto.findByPk(producto.productoId);
        if (!productoDb) {
          throw new Error(`Producto con ID ${producto.productoId} no encontrado`);
        }
        if (productoDb.cantidad < producto.cantidad) {
          throw new Error(`Inventario insuficiente para el producto con ID ${producto.productoId}`);
        }

        const precioVenta = productoDb.precioVenta;
        const subtotal = precioVenta * producto.cantidad;
        montoTotal += subtotal;

        productoDb.cantidad -= producto.cantidad;
        productoDb.enExistencia = productoDb.cantidad > 0;
        await productoDb.save();

        return {
          ventaId,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioVenta,
        };
      })
    );

    // Actualizar la venta con el nuevo monto total y el usuario
    venta.usuarioId = usuarioId;
    venta.montoTotal = montoTotal;
    await venta.save();

    // Actualizar los ingresos en la caja
    cajaAbierta.montoIngresos += montoTotal;
    await cajaAbierta.save();

    // Actualizar o crear el ingreso relacionado
    let ingresoRelacionado = await Ingreso.findOne({ where: { ventaId } });
    if (ingresoRelacionado) {
      ingresoRelacionado.monto = montoTotal;
      ingresoRelacionado.descripcion = `Ingreso actualizado por venta #${venta.id}`;
      await ingresoRelacionado.save();
    } else {
      ingresoRelacionado = await Ingreso.create({
        usuarioId,
        ventaId: venta.id,
        monto: montoTotal,
        descripcion: `Ingreso por venta #${venta.id}`,
        fechaHora: new Date(),
      });
    }

    // Guardar los nuevos detalles de la venta
    await DetalleVenta.bulkCreate(nuevosDetalles);

    // Consultar la venta actualizada con sus detalles para devolver la estructura esperada
    const ventaActualizada = await Venta.findByPk(ventaId, {
      include: [
        {
          model: Usuario,
          attributes: ['nombre', 'email'],
        },
        {
          model: DetalleVenta,
          include: [
            {
              model: Producto,
              attributes: ['nombre', 'precioVenta'],
            },
          ],
        },
      ],
    });

    // Enviar la respuesta con la estructura correcta
    res.status(200).json({
      message: 'Venta e ingreso asociados actualizados exitosamente',
      venta: ventaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    res.status(400).json({ error: error.message || 'Error al actualizar la venta' });
  }
};


exports.eliminarVenta = async (req, res) => {
  const { ventaId } = req.params;

  try {
    const venta = await Venta.findByPk(ventaId);
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const cajaAbierta = await Caja.findOne({ where: { estado: 'Abierto' } });
    if (!cajaAbierta) {
      return res.status(400).json({ error: 'No hay una caja abierta para actualizar los ingresos' });
    }

    cajaAbierta.montoIngresos -= venta.montoTotal;
    await cajaAbierta.save();

    const detalles = await DetalleVenta.findAll({ where: { ventaId } });
    await Promise.all(
      detalles.map(async (detalle) => {
        const producto = await Producto.findByPk(detalle.productoId);
        producto.cantidad += detalle.cantidad;
        producto.enExistencia = true;
        await producto.save();
      })
    );

    await DetalleVenta.destroy({ where: { ventaId } });

    // Eliminar el ingreso asociado a esta venta usando ventaId
    await Ingreso.destroy({
      where: {
        ventaId: venta.id
      }
    });

    await venta.destroy();

    res.status(200).json({ message: 'Venta e ingreso asociados eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la venta:', error);
    res.status(400).json({ error: error.message || 'Error al eliminar la venta' });
  }
};

exports.listarVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const whereClause = {};

    // Agrega el filtro de fechas si están presentes en la solicitud
    if (fechaInicio && fechaFin) {
      whereClause.fechaHora = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }

    const ventas = await Venta.findAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          attributes: ['nombre', 'email'],
        },
        {
          model: DetalleVenta,
          include: [
            {
              model: Producto,
              attributes: ['nombre', 'precioVenta'],
            },
          ],
        },
      ],
      order: [['fechaHora', 'DESC']],
    });

    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};


exports.obtenerVentaPorId = async (req, res) => {
    const { ventaId } = req.params;
  
    try {
      const venta = await Venta.findByPk(ventaId, {
        include: [
          {
            model: Usuario,
            attributes: ['nombre', 'email'], // Información del usuario
          },
          {
            model: DetalleVenta,
            include: [
              {
                model: Producto,
                attributes: ['nombre', 'precioVenta'], // Información del producto
              },
            ],
          },
        ],
      });
  
      if (!venta) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }
  
      res.status(200).json(venta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los detalles de la venta' });
    }
  };
  