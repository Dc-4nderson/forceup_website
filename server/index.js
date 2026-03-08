import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      src VARCHAR(500) NOT NULL,
      alt VARCHAR(500) DEFAULT '',
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const existing = await pool.query('SELECT COUNT(*) FROM gallery_images');
  const count = parseInt(existing.rows[0].count);
  if (count === 0 || count === 1) {
    if (count === 1) await pool.query('DELETE FROM gallery_images');
    const seedImages = [
      ['/images/gallery1.jpg', 'Force Up community member'],
      ['/images/gallery-crew.jpg', 'Force Up crew repping the movement'],
      ['/images/gallery-trio.jpg', 'Force Up community members'],
      ['/images/gallery-camera.jpg', 'Force Up supporters with camera'],
      ['/images/gallery-brick.jpg', 'Force Up member filming content'],
      ['/images/gallery-school.jpg', 'Force Up supporter at school'],
      ['/images/gallery-style.jpg', 'Force Up member styling the tee'],
      ['/images/gallery-navy.jpg', 'Force Up supporter in navy tee'],
      ['/images/gallery-mirror.jpg', 'Force Up member mirror selfie'],
      ['/images/gallery-jacket.jpg', 'Force Up supporter in jacket'],
      ['/images/gallery-selfie.jpg', 'Force Up duo selfie'],
      ['/images/gallery-pointing.jpg', 'Force Up supporter pointing to the logo'],
      ['/images/gallery-bowtie.jpg', 'Young Force Up member in navy tee with bowtie'],
      ['/images/gallery-smile.jpg', 'Force Up supporter smiling in navy tee'],
      ['/images/gallery-three-navy.jpg', 'Three Force Up supporters in matching navy tees'],
      ['/images/gallery-booth.jpg', 'Force Up merch booth with banner'],
      ['/images/gallery-banner.jpg', 'Supporter standing next to Force Up banner'],
      ['/images/gallery-friends.jpg', 'Force Up friends repping the movement outdoors'],
      ['/images/gallery-duo-mural.jpg', 'Force Up duo posing by a mural'],
      ['/images/gallery-table.jpg', 'Force Up crew at the table'],
      ['/images/gallery-field.jpg', 'Force Up member showing off the white tee on the field'],
      ['/images/gallery-bleachers.jpg', 'Force Up group photo on the bleachers'],
      ['/images/gallery-redhead.jpg', 'Force Up supporters hanging out on the field'],
      ['/images/gallery-church.jpg', 'Force Up supporter at an event'],
      ['/images/gallery-duo-event.jpg', 'Force Up supporters repping at an event'],
      ['/images/gallery-wall-chat.jpg', 'Force Up members hanging out by the wall'],
      ['/images/gallery-brothers.jpg', 'Force Up brothers showing off their tees'],
    ];
    for (let i = 0; i < seedImages.length; i++) {
      await pool.query('INSERT INTO gallery_images (src, alt, display_order) VALUES ($1, $2, $3)', [seedImages[i][0], seedImages[i][1], i]);
    }
    console.log(`Seeded ${seedImages.length} gallery images`);
  }
}

initDatabase().catch(err => console.error('Database init error:', err));

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

const isProductionEnv = process.env.NODE_ENV === 'production';
const uploadsDir = isProductionEnv
  ? path.join(__dirname, '..', 'dist', 'images')
  : path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = 'gallery-' + crypto.randomBytes(8).toString('hex') + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery_images ORDER BY display_order ASC, id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gallery/upload', requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const src = '/images/' + req.file.filename;
    const alt = req.body.alt || 'Force Up community photo';
    const orderResult = await pool.query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM gallery_images');
    const displayOrder = orderResult.rows[0].next_order;
    const result = await pool.query(
      'INSERT INTO gallery_images (src, alt, display_order) VALUES ($1, $2, $3) RETURNING *',
      [src, alt, displayOrder]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gallery/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const image = await pool.query('SELECT * FROM gallery_images WHERE id=$1', [id]);
    if (image.rows.length > 0) {
      const filename = path.basename(image.rows[0].src);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await pool.query('DELETE FROM gallery_images WHERE id=$1', [id]);
    }
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
  app.get('{*path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT} (${isProduction ? 'production' : 'development'})`);
});
