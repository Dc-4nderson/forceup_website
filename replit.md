# Force Up Website

## Overview
Force Up is a full-stack React website for the "Force Up" brand/movement. It features a hero section, messaging, about page, shop with QR code payments, community gallery, and an admin dashboard. Built with React 19, Vite 8, Tailwind CSS 4, Express backend, and PostgreSQL.

## Project Architecture
- **Frontend**: React 19 with Vite 8 (beta)
- **Backend**: Express.js API server
- **Database**: PostgreSQL (orders, products)
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` plugin
- **Routing**: React Router DOM v7
- **Icons**: Lucide React, React Icons

## Project Structure
```
/
├── index.html            # Entry HTML
├── vite.config.js        # Vite config (port 5000, proxy /api to 3000)
├── package.json          # Dependencies and scripts
├── server/
│   ├── index.js          # Express API server (port 3000)
│   └── db.js             # PostgreSQL connection pool
├── public/
│   └── images/           # Static assets (shirts, gallery, logo, QR code)
├── src/
│   ├── main.jsx          # App entry with routing
│   ├── App.jsx           # Main landing page component
│   ├── index.css         # Global styles
│   ├── assets/           # Logo SVGs
│   ├── components/       # React components
│   │   ├── About.jsx     # Founder section
│   │   ├── Footer.jsx
│   │   ├── ForceUpCode.jsx
│   │   ├── Gallery.jsx   # Community photo gallery
│   │   ├── Hero.jsx
│   │   ├── Message.jsx
│   │   ├── Navbar.jsx
│   │   ├── Shop.jsx      # Shop with QR code payment + order form
│   │   └── WhyWear.jsx
│   ├── pages/
│   │   └── Admin.jsx     # Admin dashboard (orders + products CRUD)
│   └── config/
│       └── stripe.js     # Stripe configuration (legacy)
└── eslint.config.js
```

## Database Schema
- **products**: id, name, description, price, colors[], adult_sizes[], youth_sizes[], image_url, active, timestamps
- **orders**: id, product_id, customer_name, customer_email, customer_phone, color, size_category, size, quantity, total, status, notes, created_at

## Development
- **Dev server**: `npm run dev` (runs Express on 3000 + Vite on 5000 concurrently)
- **Build**: `npm run build` (outputs frontend to `dist/`)
- **Admin**: Navigate to `/admin` for order management and product listings
- **Deployment**: Autoscale deployment with Express serving both API and static frontend

## Key Features
- QR code payment via GreenLight (gl.me)
- Order form captures customer name, email, phone, color, size, quantity
- Admin dashboard at /admin for managing orders and products
- Community gallery with masonry layout
- Adult and Youth sizing options

## Recent Changes
- 2026-03-01: Added full-stack backend with Express + PostgreSQL, admin dashboard, order tracking, product CRUD
- 2026-02-21: Added QR code payment, gallery images, updated sizing
- 2026-02-17: Initial Replit setup
