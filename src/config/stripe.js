// Stripe Configuration
// Replace the placeholder values below with your actual Stripe credentials

// Your Stripe publishable key (starts with pk_)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE'

// Product configuration
export const PRODUCTS = {
  signatureTee: {
    name: 'FORCE UP™ Signature Tee',
    description: 'Next Gen… Next Level. More than a shirt — Force Up is about leveling up.',
    price: 3000, // Price in cents ($30.00)
    currency: 'usd',
    // Add your Stripe Price ID here once created in Stripe Dashboard
    stripePriceId: 'price_YOUR_PRICE_ID_HERE',
  }
}

// Stripe Checkout Session Configuration
// To fully enable Stripe checkout, you'll need:
// 1. A Stripe account (https://stripe.com)
// 2. Your publishable key (above)
// 3. A backend server or Stripe Payment Links to create checkout sessions
//
// Option A: Stripe Payment Links (easiest - no backend needed)
//   Create a Payment Link in your Stripe Dashboard and use it directly:
//   export const PAYMENT_LINK = 'https://buy.stripe.com/YOUR_LINK_HERE'
//
// Option B: Stripe Checkout with backend
//   Set up a server endpoint that creates Checkout Sessions
//   See: https://docs.stripe.com/checkout/quickstart

export const PAYMENT_LINK = '' // Add your Stripe Payment Link here
