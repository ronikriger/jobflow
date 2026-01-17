import Stripe from "stripe";

// Stripe client - only initialize if API key exists (handles build time)
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-12-15.clover",
    })
    : null as unknown as Stripe;
