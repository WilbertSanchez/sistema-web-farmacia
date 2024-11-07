'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Ventas', 'usuarioId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Usuarios', // Nombre de la tabla de usuarios
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Ventas', 'usuarioId');
  }
};
