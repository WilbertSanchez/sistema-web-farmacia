const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('../models/Usuario');

const Caja = sequelize.define('Caja', {
  usuarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    },
    allowNull: false
  },
  montoInicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  montoIngresos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  montoGastos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  montoFinal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  fechaCierre: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Abierto'
  }
});

Caja.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(Caja, { foreignKey: 'usuarioId' });

module.exports = Caja;
