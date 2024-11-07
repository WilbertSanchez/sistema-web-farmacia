const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Gasto = sequelize.define('Gasto', {
  usuarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
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
Gasto.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(Gasto, { foreignKey: 'usuarioId' });

module.exports = Gasto;
