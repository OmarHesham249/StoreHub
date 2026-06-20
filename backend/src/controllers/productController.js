const pool = require('../db');

const getAll = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                   AS total_products,
        COALESCE(SUM(stock), 0)                    AS total_stock,
        COALESCE(SUM(price * stock), 0)            AS total_value,
        COUNT(CASE WHEN stock = 0  THEN 1 END)     AS out_of_stock,
        COUNT(CASE WHEN stock < 10 THEN 1 END)     AS low_stock_count,
        COUNT(DISTINCT category)                   AS total_categories
      FROM products
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  const { name, category, price, stock, description, image_url } = req.body;
  if (!name || !category || price == null || stock == null)
    return res.status(400).json({ error: 'name, category, price, stock are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, category, price, stock, description, image_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, category, price, stock, description || null, image_url || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  const { name, category, price, stock, description, image_url } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products
       SET name=$1, category=$2, price=$3, stock=$4, description=$5, image_url=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, category, price, stock, description || null, image_url || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getStats, getById, create, update, remove };
