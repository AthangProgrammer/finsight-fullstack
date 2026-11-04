const fs = require('node:fs');
const path = require('node:path');

const rlsSql = fs.readFileSync(path.resolve(__dirname, '..', 'sql', 'rls.sql'), 'utf8');

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(rlsSql);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      DECLARE
        t record;
      BEGIN
        FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
          EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.tablename);
        END LOOP;
      END
      $$;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
    `);
  },
};
