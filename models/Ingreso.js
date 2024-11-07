const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Venta = require('./Venta'); 

const Ingreso = sequelize.define('Ingreso', {
  usuarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    },
    allowNull: true
  },
  ventaId: {
    type: DataTypes.INTEGER,
    references: {
      model: Venta, // Relaciona el ingreso con la venta
      key: 'id'
    },
    allowNull: true
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

// Definir la relación con Usuario
Ingreso.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(Ingreso, { foreignKey: 'usuarioId' });

// Definir la relación con Venta
Ingreso.belongsTo(Venta, { foreignKey: 'ventaId' });
Venta.hasMany(Ingreso, { foreignKey: 'ventaId' });

module.exports = Ingreso;
