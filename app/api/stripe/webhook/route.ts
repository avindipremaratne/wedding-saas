import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Stripe calls this after checkout. The signature check proves the request
// came from Stripe; only then is the order written, with the admin client
// because guests and couples have no write access to `orders`.
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // The raw body is required: any re-serialised JSON breaks the signature.
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error("[stripe] Signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const admin = getSupabaseAdmin();
    if (!admin) {
      console.error("[stripe] SUPABASE_SERVICE_ROLE_KEY missing; order not recorded:", session.id);
      // A 5xx makes Stripe retry later, once the key is configured.
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Upsert on the session id, so Stripe's retries never create duplicates.
    const { error } = await admin.from("orders").upsert(
      {
        stripe_session_id: session.id,
        email: session.customer_details?.email ?? session.customer_email,
        couple_names: session.metadata?.couple_names ?? null,
        wedding_date: session.metadata?.wedding_date || null,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
      },
      { onConflict: "stripe_session_id" },
    );
    if (error) {
      console.error("[stripe] Could not record order:", error.message);
      return NextResponse.json({ error: "Could not record order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
