module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('albums', 'price', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Gia album, 0 = mien phi'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('albums', 'price');
  }
};
