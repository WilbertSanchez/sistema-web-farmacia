const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Producto = require('./Producto');

const Medicamento = sequelize.define('Medicamento', {
  productoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Producto,
      key: 'id'
    },
    allowNull: false
  },
  dosis: {
    type: DataTypes.STRING,
    allowNull: true
  },
  indicaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  formaAdministracion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  compuesto: { // Nuevo campo
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relación entre Producto y Medicamento
Producto.hasOne(Medicamento, { foreignKey: 'productoId' });
Medicamento.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = Medicamento;
