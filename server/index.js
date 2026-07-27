import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Stripe initialization (set STRIPE_SECRET_KEY env variable)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Email transporter (set EMAIL_USER, EMAIL_PASS, and optionally EMAIL_SERVICE, EMAIL_FROM, ADMIN_EMAIL)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendOrderEmails(order) {
  if (!transporter) return;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const orderTotal = Number(order.total).toFixed(2);
  const siteUrl = (process.env.SITE_URL || 'https://forceupnation.com').replace(/\/$/, '');

  if (order.customer_email) {
    try {
      await transporter.sendMail({
        from: `"Force Up" <${fromEmail}>`,
        to: order.customer_email,
        subject: `Order Confirmed – Force Up™ Signature Tee #${order.id}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;">
            <h1 style="font-size:26px;font-weight:900;margin-bottom:8px;">Order Confirmed!</h1>
            <p style="color:#aaa;margin-bottom:24px;">Thank you for supporting the movement, ${order.customer_name}!</p>
            <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
              <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;color:#aaa;">Order #${order.id}</h2>
              <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr><td style="color:#aaa;padding:6px 0;">Product</td><td style="text-align:right;">Force Up™ Signature Tee</td></tr>
                <tr><td style="color:#aaa;padding:6px 0;">Color</td><td style="text-align:right;">${order.color}</td></tr>
                <tr><td style="color:#aaa;padding:6px 0;">Size</td><td style="text-align:right;">${order.size} (${order.size_category})</td></tr>
                <tr><td style="color:#aaa;padding:6px 0;">Quantity</td><td style="text-align:right;">${order.quantity}</td></tr>
                <tr style="border-top:1px solid #333;"><td style="color:#fff;font-weight:700;padding:10px 0 6px;">Total</td><td style="text-align:right;font-weight:700;color:#fff;">$${orderTotal}</td></tr>
              </table>
            </div>
            <p style="color:#aaa;font-size:14px;line-height:1.6;">We'll be in touch within 24 hours to arrange delivery. Keep rising – we don't stay stuck, we Force Up.</p>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #333;color:#555;font-size:12px;">
              <p>Force Up™ | <a href="${siteUrl}" style="color:#777;">${siteUrl.replace('https://', '')}</a></p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error('Customer confirmation email error:', err.message);
    }
  }

  if (adminEmail) {
    try {
      await transporter.sendMail({
        from: `"Force Up Orders" <${fromEmail}>`,
        to: adminEmail,
        subject: `New Order #${order.id} – ${order.customer_name} ($${orderTotal})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;">
            <h1 style="font-size:22px;font-weight:900;margin-bottom:4px;">New Order Received</h1>
            <p style="color:#aaa;margin-bottom:24px;">Order #${order.id} · $${orderTotal} · Status: ${order.status}</p>
            <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
              <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr><td style="color:#aaa;padding:6px 0;">Customer</td><td style="text-align:right;">${order.customer_name}</td></tr>
                ${order.customer_email ? `<tr><td style="color:#aaa;padding:6px 0;">Email</td><td style="text-align:right;">${order.customer_email}</td></tr>` : ''}
                ${order.customer_phone ? `<tr><td style="color:#aaa;padding:6px 0;">Phone</td><td style="text-align:right;">${order.customer_phone}</td></tr>` : ''}
                <tr><td style="color:#aaa;padding:6px 0;">Product</td><td style="text-align:right;">Force Up™ Signature Tee</td></tr>
                <tr><td style="color:#aaa;padding:6px 0;">Color</td><td style="text-align:right;">${order.color}</td></tr>
                <tr><td style="color:#aaa;padding:6px 0;">Size</td><td style="text-align:right;">${order.size} (${order.size_category})</td></tr>
                <tr><td style="color:#aaa;padding:6px 0;">Qty</td><td style="text-align:right;">${order.quantity}</td></tr>
                <tr style="border-top:1px solid #333;"><td style="color:#fff;font-weight:700;padding:10px 0 6px;">Total</td><td style="text-align:right;font-weight:700;color:#fff;">$${orderTotal}</td></tr>
              </table>
            </div>
            <a href="${siteUrl}/admin" style="display:inline-block;background:#fff;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">View in Admin Dashboard</a>
          </div>
        `,
      });
    } catch (err) {
      console.error('Admin notification email error:', err.message);
    }
  }
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      src VARCHAR(500) NOT NULL,
      alt VARCHAR(500) DEFAULT '',
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      image_data BYTEA,
      mime_type VARCHAR(50)
    )
  `);

  await pool.query(`
    ALTER TABLE gallery_images
    ADD COLUMN IF NOT EXISTS image_data BYTEA,
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50)
  `);

  // Remove stale uploaded records — old file-based uploads that were wiped on deploy
  // These have 16-char hex filenames (e.g. /images/gallery-abc123def456789a.jpg or .jpeg)
  await pool.query(`
    DELETE FROM gallery_images
    WHERE image_data IS NULL
    AND src ~ '^/images/gallery-[a-f0-9]{16}\\.'
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

async function autoRotateGalleryImages() {
  const imagesDir = path.join(__dirname, '../public/images');
  let files;
  try {
    files = fs.readdirSync(imagesDir).filter(f =>
      f.startsWith('gallery') && /\.(jpe?g|png|webp)$/i.test(f)
    );
  } catch {
    return;
  }
  let fixed = 0;
  for (const file of files) {
    const fp = path.join(imagesDir, file);
    try {
      const meta = await sharp(fp).metadata();
      // orientation 1 = already upright, undefined = no EXIF tag (already baked in correctly)
      if (meta.orientation && meta.orientation !== 1) {
        const buf = await sharp(fp)
          .rotate()
          .jpeg({ quality: 88, progressive: true })
          .toBuffer();
        fs.writeFileSync(fp, buf);
        fixed++;
      }
    } catch {
      // skip unreadable files
    }
  }
  if (fixed > 0) console.log(`Auto-rotated ${fixed} gallery image(s)`);
}

async function initProductsAndInventory() {
  // Orders table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      product_id INT,
      customer_name VARCHAR(500) NOT NULL,
      customer_email VARCHAR(500),
      customer_phone VARCHAR(100),
      color VARCHAR(100),
      size_category VARCHAR(50),
      size VARCHAR(20),
      quantity INT NOT NULL DEFAULT 1,
      total DECIMAL(10,2),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      stripe_session_id VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(500)`);

  // Products table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 16.00,
      colors JSONB DEFAULT '[]',
      adult_sizes JSONB DEFAULT '[]',
      youth_sizes JSONB DEFAULT '[]',
      image_url VARCHAR(500),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Inventory table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      product_id INT REFERENCES products(id) ON DELETE CASCADE,
      color VARCHAR(100) NOT NULL,
      size VARCHAR(20) NOT NULL,
      size_category VARCHAR(20) NOT NULL DEFAULT 'Adult',
      stock INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(product_id, color, size)
    )
  `);

  // Seed default product if empty
  const productCount = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(productCount.rows[0].count) === 0) {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, colors, adult_sizes, youth_sizes, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        'FORCE UP\u2122 Signature Tee',
        'Next Gen\u2026 Next Level.',
        16.00,
        JSON.stringify(['Black', 'Navy', 'White']),
        JSON.stringify(['S', 'M', 'L', 'XL']),
        JSON.stringify(['YS', 'YM', 'YL', 'YXL']),
        '/images/shirt-black.png',
      ]
    );
    const productId = result.rows[0].id;
    const colors = ['Black', 'Navy', 'White'];
    const sizes = [
      ['S', 'Adult'], ['M', 'Adult'], ['L', 'Adult'], ['XL', 'Adult'],
      ['YS', 'Youth'], ['YM', 'Youth'], ['YL', 'Youth'], ['YXL', 'Youth'],
    ];
    for (const color of colors) {
      for (const [size, cat] of sizes) {
        await pool.query(
          'INSERT INTO inventory (product_id, color, size, size_category, stock) VALUES ($1, $2, $3, $4, 0)',
          [productId, color, size, cat]
        );
      }
    }
    console.log('Seeded default product and inventory');
  }
}

initDatabase().catch(err => console.error('Database init error:', err));
initProductsAndInventory().catch(err => console.error('Products/inventory init error:', err));
autoRotateGalleryImages().catch(err => console.error('Auto-rotate error:', err));

const app = express();

// Stripe webhook must receive raw body BEFORE express.json() parses requests
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    if (stripe && webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else if (stripe) {
      event = JSON.parse(req.body.toString());
    } else {
      return res.status(503).json({ error: 'Stripe not configured' });
    }
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      try {
        const result = await pool.query(
          "UPDATE orders SET status='paid' WHERE id=$1 AND status='pending_payment' RETURNING *",
          [parseInt(orderId)]
        );
        if (result.rows.length) {
          sendOrderEmails(result.rows[0]).catch(err => console.error('Webhook email error:', err.message));
        }
      } catch (err) {
        console.error('Webhook order update error:', err.message);
      }
    }
  }

  res.json({ received: true });
});

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
    sendOrderEmails(result.rows[0]).catch(err => console.error('Email error:', err.message));
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

// ── Stripe Checkout ──────────────────────────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment processing is not configured. Please contact us directly.' });
  }
  try {
    const { product_id, customer_name, customer_email, customer_phone, color, size_category, size, quantity, notes } = req.body;
    if (!customer_name?.trim() || !quantity || !color || !size) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    const pid = parseInt(product_id) || 1;
    const qty = Math.max(1, parseInt(quantity));

    const productResult = await pool.query('SELECT * FROM products WHERE id=$1 AND active=true', [pid]);
    if (!productResult.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productResult.rows[0];
    const unitAmount = Math.round(Number(product.price) * 100); // cents
    const total = (unitAmount * qty) / 100;

    // Create order record first (status: pending_payment)
    const orderResult = await pool.query(
      `INSERT INTO orders (product_id, customer_name, customer_email, customer_phone, color, size_category, size, quantity, total, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_payment') RETURNING *`,
      [pid, customer_name.trim(), customer_email?.trim() || null, customer_phone?.trim() || null, color, size_category, size, qty, total, notes?.trim() || null]
    );
    const order = orderResult.rows[0];

    const origin = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `Color: ${color} · Size: ${size_category} ${size}`,
          },
          unit_amount: unitAmount,
        },
        quantity: qty,
      }],
      mode: 'payment',
      customer_email: customer_email?.trim() || undefined,
      metadata: {
        order_id: String(order.id),
        customer_name: customer_name.trim(),
        color,
        size,
        size_category,
      },
      success_url: `${origin}/?payment=success&order_id=${order.id}`,
      cancel_url: `${origin}/#shop`,
    });

    await pool.query('UPDATE orders SET stripe_session_id=$1 WHERE id=$2', [session.id, order.id]);
    res.json({ url: session.url, orderId: order.id });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ── Inventory ─────────────────────────────────────────────────────────────────
app.get('/api/inventory', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, p.name as product_name, p.price as product_price
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      ORDER BY p.id, i.color, i.size_category DESC, i.size
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/batch', requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates must be an array' });
    for (const u of updates) {
      const stock = Math.max(0, parseInt(u.stock) || 0);
      await pool.query(`
        INSERT INTO inventory (product_id, color, size, size_category, stock, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (product_id, color, size)
        DO UPDATE SET stock = EXCLUDED.stock, updated_at = NOW()
      `, [u.product_id, u.color, u.size, u.size_category || 'Adult', stock]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, src, alt, display_order, created_at, mime_type FROM gallery_images ORDER BY display_order ASC, id ASC'
    );
    const images = result.rows.map(row => ({
      ...row,
      src: row.mime_type ? `/api/gallery/image/${row.id}` : row.src
    }));
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gallery/image/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT image_data, mime_type FROM gallery_images WHERE id=$1', [id]);
    if (!result.rows.length || !result.rows[0].image_data) {
      return res.status(404).send('Image not found');
    }
    const { image_data, mime_type } = result.rows[0];
    res.set('Content-Type', mime_type || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(image_data);
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
    const compressedBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
    const alt = req.body.alt || 'Force Up community photo';
    const orderResult = await pool.query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM gallery_images');
    const displayOrder = orderResult.rows[0].next_order;
    const result = await pool.query(
      'INSERT INTO gallery_images (src, alt, display_order, image_data, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, src, alt, display_order, created_at, mime_type',
      ['db-stored', alt, displayOrder, compressedBuffer, 'image/jpeg']
    );
    const row = result.rows[0];
    res.json({ ...row, src: `/api/gallery/image/${row.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gallery/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery_images WHERE id=$1', [id]);
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
