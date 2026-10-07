import "server-only";
import Stripe from "stripe";

// Created lazily so builds and local runs work without Stripe keys.
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

/** The pricing model is still open, so price and mode come from env. */
export function checkoutConfig(): { priceId: string; mode: "payment" | "subscription" } | null {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return null;
  const mode = process.env.STRIPE_CHECKOUT_MODE === "subscription" ? "subscription" : "payment";
  return { priceId, mode };
}
