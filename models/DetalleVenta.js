const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Venta = require('./Venta');
const Producto = require('./Producto');

const DetalleVenta = sequelize.define('DetalleVenta', {
  ventaId: {
    type: DataTypes.INTEGER,
    references: {
      model: Venta,
      key: 'id'
    },
    allowNull: false
  },
  productoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Producto,
      key: 'id'
    },
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precioVenta: { // Asegúrate de que este campo exista en lugar de precioUnitario
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

Venta.hasMany(DetalleVenta, { foreignKey: 'ventaId' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'ventaId' });
Producto.hasMany(DetalleVenta, { foreignKey: 'productoId' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = DetalleVenta;
