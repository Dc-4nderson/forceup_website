// Stripe is configured server-side via environment variables.
// Set the following in your deployment environment (e.g. Render, Railway, Replit Secrets):
//
//   STRIPE_SECRET_KEY     — Your Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET — Webhook signing secret from the Stripe Dashboard
//                           (optional but recommended for production)
//
// Pricing is dynamic: the server reads the price directly from the products table
// in the database, so you never need to hardcode amounts here. Update a product's
// price in the Admin → Inventory tab and checkout will immediately reflect the change.
//
// To set up webhooks (recommended):
//   1. In the Stripe Dashboard go to Developers → Webhooks.
//   2. Add endpoint: https://your-domain.com/api/stripe/webhook
//   3. Select event: checkout.session.completed
//   4. Copy the signing secret into STRIPE_WEBHOOK_SECRET.
//
// Email notifications are sent via nodemailer. Set these env variables:
//   EMAIL_USER     — Your sending email address (e.g. Gmail address)
//   EMAIL_PASS     — App password (for Gmail: myaccount.google.com/apppasswords)
//   EMAIL_SERVICE  — Mail service name (default: "gmail")
//   EMAIL_FROM     — Display name + address, e.g. "Force Up <orders@forceup.co>"
//   ADMIN_EMAIL    — Where to send admin order notifications
//   SITE_URL       — Your full site URL, e.g. https://forceup.co
