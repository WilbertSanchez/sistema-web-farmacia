const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rol = require('./Rol'); // Importa el modelo Rol

const Usuario = sequelize.define('Usuario', {
  nombre: DataTypes.STRING,
  email: DataTypes.STRING,
  contraseña: DataTypes.STRING,
  rol_id: DataTypes.INTEGER,
});

// Definición de la relación
Usuario.belongsTo(Rol, { as: 'Rol', foreignKey: 'rol_id' });
module.exports = Usuario;
