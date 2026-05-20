module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('payment_info', 'otp_code', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('payment_info', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('payment_info', 'otp_code');
    await queryInterface.removeColumn('payment_info', 'otp_expires_at');
  }
};
