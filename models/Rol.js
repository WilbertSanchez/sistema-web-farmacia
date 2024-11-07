// models/Rol.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Rol;

