const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  codigoBarras: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  precioCompra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  enExistencia: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  esMedicamento: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Producto;
