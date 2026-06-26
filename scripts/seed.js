require('dotenv').config();
const pool = require('../src/db');

const CATEGORIES = [
  'electronics', 'clothing', 'books', 'home-garden',
  'sports', 'toys', 'automotive', 'health', 'food', 'jewelry',
];
const ADJECTIVES = ['Premium', 'Deluxe', 'Classic', 'Ultra', 'Slim', 'Smart', 'Pro', 'Lite', 'Max', 'Mini'];
const NOUNS = ['Widget', 'Gadget', 'Device', 'Tool', 'Set', 'Kit', 'Pack', 'Bundle', 'Unit', 'Module'];

function randomProduct(i) {
  const category = CATEGORIES[i % CATEGORIES.length];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const name = `${adj} ${noun} ${i + 1}`;
  const price = (Math.random() * 1000 + 1).toFixed(2);
  const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
  const created_at = new Date(twoYearsAgo + Math.random() * 2 * 365 * 24 * 60 * 60 * 1000);
  return { name, category, price, created_at };
}

async function seed() {
  const TOTAL = 200_000;
  const BATCH = 1_000;
  const client = await pool.connect();

  try {
    console.time('seed');
    console.log(`Seeding ${TOTAL.toLocaleString()} products...`);
    await client.query('BEGIN');

    for (let start = 0; start < TOTAL; start += BATCH) {
      const rows = [];
      const values = [];
      const end = Math.min(start + BATCH, TOTAL);

      for (let i = start; i < end; i++) {
        const p = randomProduct(i);
        const base = rows.length * 4;
        rows.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
        values.push(p.name, p.category, p.price, p.created_at);
      }

      await client.query(
        `INSERT INTO products (name, category, price, created_at) VALUES ${rows.join(',')}`,
        values
      );

      if ((start / BATCH) % 20 === 0) {
        process.stdout.write(`  ${((start / TOTAL) * 100).toFixed(0)}%\r`);
      }
    }

    await client.query('COMMIT');
    console.timeEnd('seed');
    console.log('Done ✓');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();