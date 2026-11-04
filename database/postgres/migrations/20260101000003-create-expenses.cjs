module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'RESTRICT',
      },
      description: { type: Sequelize.STRING(120), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      spent_on: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE expenses ADD CONSTRAINT expenses_amount_range CHECK (amount > 0 AND amount <= 10000000)',
    );
    await queryInterface.addIndex('expenses', ['user_id', 'spent_on'], {
      name: 'expenses_user_id_spent_on',
    });
    await queryInterface.addIndex('expenses', ['category_id'], { name: 'expenses_category_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('expenses');
  },
};
