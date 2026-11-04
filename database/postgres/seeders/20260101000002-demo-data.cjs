const bcrypt = require('bcryptjs');

const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'FinSightDemo1';

const catalogue = {
  'Food & Dining': [['Weekly groceries', 1800, 3200], ['Swiggy dinner', 250, 700], ['Cafe coffee', 120, 400], ['Lunch with friends', 400, 1200]],
  Shopping: [['Clothes', 900, 3500], ['Headphones', 700, 2500], ['Books', 250, 900]],
  Transport: [['Uber ride', 150, 600], ['Metro recharge', 300, 800], ['Petrol', 500, 1500]],
  Entertainment: [['Movie tickets', 400, 1000], ['Netflix', 199, 649], ['Concert', 800, 2500]],
  Bills: [['Electricity bill', 900, 2200], ['Mobile recharge', 299, 599], ['Wi-Fi', 700, 1100]],
  Health: [['Pharmacy', 150, 900], ['Gym membership', 800, 1500], ['Doctor visit', 400, 1000]],
  Other: [['Gift', 300, 1500], ['Stationery', 100, 400]],
};

function lcg(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = {
  async up(queryInterface) {
    const sql = queryInterface.sequelize;
    const [existing] = await sql.query('SELECT id FROM users WHERE username = :username', {
      replacements: { username: DEMO_USERNAME },
    });
    if (existing.length > 0) return;

    const now = new Date();
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    await queryInterface.bulkInsert('users', [
      { username: DEMO_USERNAME, password_hash: passwordHash, created_at: now, updated_at: now },
    ]);
    const [[user]] = await sql.query('SELECT id FROM users WHERE username = :username', {
      replacements: { username: DEMO_USERNAME },
    });
    const [categories] = await sql.query('SELECT id, name FROM categories');
    const idByName = Object.fromEntries(categories.map((row) => [row.name, row.id]));

    const random = lcg(42);
    const names = Object.keys(catalogue);
    const rows = [];
    for (let monthOffset = 0; monthOffset < 6; monthOffset += 1) {
      const lastDay = monthOffset === 0 ? Math.max(now.getUTCDate(), 1) : 28;
      for (let i = 0; i < 10; i += 1) {
        const category = names[Math.floor(random() * names.length)];
        const options = catalogue[category];
        const [description, low, high] = options[Math.floor(random() * options.length)];
        const amount = Math.round(low + random() * (high - low));
        const day = 1 + Math.floor(random() * lastDay);
        const spentOn = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthOffset, day));
        rows.push({
          user_id: user.id,
          category_id: idByName[category],
          description,
          amount,
          spent_on: isoDate(spentOn),
          created_at: now,
          updated_at: now,
        });
      }
    }
    await queryInterface.bulkInsert('expenses', rows);
    await queryInterface.bulkInsert('budgets', [
      { user_id: user.id, monthly_amount: 40000, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: { [Sequelize.Op.eq]: DEMO_USERNAME } });
  },
};
