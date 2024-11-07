'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Productos', 'precio');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Productos', 'precio', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    });
  }
};
