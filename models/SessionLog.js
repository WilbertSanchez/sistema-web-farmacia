const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const SessionLog = sequelize.define('SessionLog', {
  usuarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    },
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  horaInicioSesion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = SessionLog;
