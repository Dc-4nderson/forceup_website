import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const adminTokens = new Map();
const TOKEN_TTL = 24 * 60 * 60 * 1000;
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  const attempts = loginAttempts.get(ip);
  if (attempts && attempts.count >= MAX_ATTEMPTS && Date.now() - attempts.last < LOCKOUT_MS) {
    const remaining = Math.ceil((LOCKOUT_MS - (Date.now() - attempts.last)) / 60000);
    return res.status(429).json({ success: false, error: `Too many attempts. Try again in ${remaining} minutes.` });
  }

  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    loginAttempts.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    adminTokens.set(token, Date.now() + TOKEN_TTL);
    res.json({ success: true, token });
  } else {
    const current = loginAttempts.get(ip) || { count: 0, last: 0 };
    loginAttempts.set(ip, { count: current.count + 1, last: Date.now() });
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) adminTokens.delete(token);
  res.json({ success: true });
});

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const expiry = adminTokens.get(token);
  if (Date.now() > expiry) {
    adminTokens.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  next();
}

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE active = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/all', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, colors, adult_sizes, youth_sizes, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, description, price, colors, adult_sizes, youth_sizes, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, colors, adult_sizes, youth_sizes, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, colors, adult_sizes, youth_sizes, image_url, active } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, colors=$4, adult_sizes=$5, youth_sizes=$6, image_url=$7, active=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name, description, price, colors, adult_sizes, youth_sizes, image_url, active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, p.name as product_name FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { product_id, customer_name, customer_email, customer_phone, color, size_category, size, quantity, total, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (product_id, customer_name, customer_email, customer_phone, color, size_category, size, quantity, total, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [product_id, customer_name, customer_email, customer_phone, color, size_category, size, quantity, total, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM orders WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? 5000 : 3000;
const HOST = isProduction ? '0.0.0.0' : '127.0.0.1';

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT} (${isProduction ? 'production' : 'development'})`);
});
