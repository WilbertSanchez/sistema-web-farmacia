'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuarios', 'rol_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Rols', // Nombre de la tabla relacionada
        key: 'id', // Llave primaria en la tabla Rols
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Opcional, define el comportamiento en eliminación
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuarios', 'rol_id');
  },
};
