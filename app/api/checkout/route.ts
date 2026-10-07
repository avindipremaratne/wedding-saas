import { NextResponse } from "next/server";
import { checkoutConfig, getStripe } from "@/lib/stripe";

// Starts a Stripe Checkout session for a new couple. Called by the form on
// the landing page as a plain HTML POST, so it answers with a redirect.
// During the service phase a paid order is onboarded by hand: the webhook
// records it in the `orders` table and the site is generated from it.
export async function POST(request: Request) {
  const stripe = getStripe();
  const config = checkoutConfig();
  const origin = new URL(request.url).origin;

  if (!stripe || !config) {
    return NextResponse.redirect(`${origin}/?checkout=unavailable`, 303);
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const coupleNames = String(form.get("coupleNames") ?? "").trim().slice(0, 120);
  const weddingDate = String(form.get("weddingDate") ?? "").trim().slice(0, 10);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !coupleNames) {
    return NextResponse.redirect(`${origin}/?checkout=invalid#start`, 303);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      line_items: [{ price: config.priceId, quantity: 1 }],
      customer_email: email,
      metadata: { couple_names: coupleNames, wedding_date: weddingDate },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled#start`,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("[checkout] Could not create session:", error);
    return NextResponse.redirect(`${origin}/?checkout=error#start`, 303);
  }
}
