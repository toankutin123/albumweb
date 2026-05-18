module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'balance', {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'balance');
  }
};
