'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Productos', 'precioCompra', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    });
    await queryInterface.addColumn('Productos', 'precioVenta', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Productos', 'precioCompra');
    await queryInterface.removeColumn('Productos', 'precioVenta');
  }
};
