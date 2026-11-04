module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      username: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(72), allowNull: false },
      token_version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      failed_login_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      locked_until: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE users ADD CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$')`,
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
