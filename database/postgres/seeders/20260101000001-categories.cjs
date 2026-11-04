const names = ['Food & Dining', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Health', 'Other'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'categories',
      names.map((name) => ({ name, created_at: now, updated_at: now })),
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', { name: { [Sequelize.Op.in]: names } });
  },
};
