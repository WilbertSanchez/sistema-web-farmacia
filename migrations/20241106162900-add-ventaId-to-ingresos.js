'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Ingresos', 'ventaId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Venta', // Nombre de la tabla referenciada
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // O usa 'CASCADE' si quieres borrar ingresos relacionados al eliminar una venta
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Ingresos', 'ventaId');
  }
};
