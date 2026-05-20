module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('payment_info', 'otp_code', {
      type: Sequelize.STRING(6),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('payment_info', 'otp_code');
  }
};
