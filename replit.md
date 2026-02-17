# Force Up Website

## Overview
Force Up is a React-based single-page website for the "Force Up" brand/movement. It features a hero section, messaging, about page, shop, and more. Built with React 19, Vite 8, and Tailwind CSS 4.

## Project Architecture
- **Framework**: React 19 with Vite 8 (beta)
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` plugin
- **Routing**: React Router DOM v7
- **Payment**: Stripe integration via `@stripe/stripe-js`
- **Icons**: Lucide React, React Icons

## Project Structure
```
/
├── index.html            # Entry HTML
├── vite.config.js        # Vite config (port 5000, all hosts allowed)
├── package.json          # Dependencies and scripts
├── public/               # Static assets (images, favicon)
├── src/
│   ├── main.jsx          # App entry point
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   ├── assets/           # Logo SVGs
│   ├── components/       # React components
│   │   ├── About.jsx
│   │   ├── Footer.jsx
│   │   ├── ForceUpCode.jsx
│   │   ├── Hero.jsx
│   │   ├── Message.jsx
│   │   ├── Navbar.jsx
│   │   ├── Shop.jsx
│   │   └── WhyWear.jsx
│   └── config/
│       └── stripe.js     # Stripe configuration
└── eslint.config.js      # ESLint config
```

## Development
- **Dev server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build` (outputs to `dist/`)
- **Deployment**: Static site deployment from `dist/` directory

## Recent Changes
- 2026-02-17: Initial Replit setup - configured Vite for port 5000 with all hosts allowed, set up static deployment
