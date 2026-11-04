const ca = (process.env.DATABASE_CA_CERT || '').replace(/\\n/g, '\n');

const shared = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: true, ca },
  },
  pool: { max: 5, min: 0, idle: 10000, acquire: 15000 },
  define: { underscored: true },
  logging: process.env.LOG_LEVEL === 'debug' ? console.debug : false,
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
