const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'storehub',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255)    NOT NULL,
        category    VARCHAR(100)    NOT NULL,
        price       DECIMAL(10,2)   NOT NULL,
        stock       INTEGER         NOT NULL DEFAULT 0,
        description TEXT,
        image_url   VARCHAR(500),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows } = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, category, price, stock, description) VALUES
        ('MacBook Pro 16"',      'Electronics', 2499.99, 15,  'Apple MacBook Pro with M3 chip'),
        ('Samsung 4K Monitor',   'Electronics',  399.99, 32,  '27-inch 4K UHD display'),
        ('Mechanical Keyboard',  'Peripherals',  149.99,  5,  'RGB Mechanical Gaming Keyboard'),
        ('Wireless Mouse',       'Peripherals',   59.99, 48,  'Ergonomic wireless mouse'),
        ('USB-C Hub 7-in-1',     'Accessories',   39.99, 120, '7-in-1 USB-C multiport hub'),
        ('Aluminum Laptop Stand','Accessories',   49.99,  3,  'Adjustable aluminum stand'),
        ('Webcam HD 1080p',      'Electronics',   89.99, 22,  '1080p webcam with built-in mic'),
        ('LED Desk Lamp',        'Office',         34.99, 67,  'LED lamp with USB charging port');
      `);
      console.log('[DB] Seeded sample products');
    }
    console.log('[DB] Initialized successfully');
  } catch (err) {
    console.error('[DB] Init error:', err.message);
  } finally {
    client.release();
  }
};

initDB();

module.exports = pool;
