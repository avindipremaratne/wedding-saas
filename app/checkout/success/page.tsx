import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Thank you" };

// Shown after Stripe redirects back. The order itself is recorded by the
// webhook, not here, because a guest can close the tab before this loads.
export default function CheckoutSuccess() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-silk px-6 py-24 text-center text-ink">
      <h1 className="mb-4 font-script text-6xl">Thank you!</h1>
      <p className="mb-10 max-w-md font-sans font-light leading-relaxed text-charcoal">
        Your payment went through. We&apos;ll email you to collect your details, photos and song, and send a
        preview of your site.
      </p>
      <Link href="/" className="font-sans text-xs uppercase tracking-[0.2em] text-navy underline underline-offset-4 hover:text-gold">
        Back to home
      </Link>
    </main>
  );
}
