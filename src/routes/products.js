const express = require('express');
const router = express.Router();
const pool = require('../db');

function encodeCursor({ created_at, id }) {
  return Buffer.from(JSON.stringify({ created_at, id })).toString('base64url');
}

function decodeCursor(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const category = req.query.category?.trim() || null;
  const cursor = decodeCursor(req.query.cursor);

  const fetchLimit = limit + 1;
  const params = [];
  const conditions = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (cursor) {
    params.push(cursor.created_at, cursor.id);
    conditions.push(
      `(created_at, id) < ($${params.length - 1}, $${params.length})`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(fetchLimit);
  const sql = `
    SELECT id, name, category, price, created_at
    FROM products
    ${where}
    ORDER BY created_at DESC, id DESC
    LIMIT $${params.length}
  `;

  try {
    const { rows } = await pool.query(sql, params);

    const hasNextPage = rows.length === fetchLimit;
    const data = hasNextPage ? rows.slice(0, limit) : rows;
    const lastRow = data[data.length - 1];
    const nextCursor = hasNextPage && lastRow
      ? encodeCursor({ created_at: lastRow.created_at, id: lastRow.id })
      : null;

    res.json({
      data,
      pagination: { limit, nextCursor, hasNextPage },
    });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;