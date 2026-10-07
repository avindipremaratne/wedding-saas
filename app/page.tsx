import Link from "next/link";
import { checkoutConfig } from "@/lib/stripe";

const MESSAGES: Record<string, string> = {
  cancelled: "Checkout was cancelled. Nothing was charged.",
  invalid: "Please enter your names and a valid email address.",
  error: "We couldn't start checkout. Please try again in a moment.",
  unavailable: "Online checkout isn't open yet. Email us and we'll set up your site.",
};

const FEATURES = [
  ["Envelope intro", "Guests open your invitation with a tap, then your song begins."],
  ["RSVPs in one place", "Replies are saved for you and arrive in your inbox as they come in."],
  ["Your story", "Venue, attire, schedule and a gallery of your photos, in your words."],
] as const;

// Product landing page. A couple's own site lives at /<slug>, or at the root
// of their own deployment or subdomain (see proxy.ts).
export default async function Home({ searchParams }: PageProps<"/">) {
  const { checkout } = await searchParams;
  const message = typeof checkout === "string" ? MESSAGES[checkout] : undefined;
  const canCheckout = checkoutConfig() !== null;

  return (
    <main className="flex-1 bg-silk text-ink">
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-24 text-center">
        <p className="mb-4 font-sans text-xs uppercase tracking-[0.3em] text-gold">Wedding websites</p>
        <h1 className="mb-6 font-script text-6xl leading-tight md:text-8xl">A site that feels like the invitation</h1>
        <p className="mb-10 max-w-xl font-sans text-base font-light leading-relaxed text-charcoal">
          We build your wedding website from an heirloom design: your names, your photos, your music, and RSVPs that
          come straight to you.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/amali-ashen"
            className="rounded-full bg-navy px-8 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-gold"
          >
            See an example
          </Link>
          <a
            href="#start"
            className="rounded-full border border-navy px-8 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-navy transition-colors hover:border-gold hover:text-gold"
          >
            Start your site
          </a>
        </div>
      </section>

      <section className="border-t border-gold/20 bg-porcelain px-6 py-20">
        <ul className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          {FEATURES.map(([title, text]) => (
            <li key={title} className="text-center">
              <h2 className="mb-3 font-serif text-lg font-semibold uppercase tracking-[0.2em]">{title}</h2>
              <p className="font-sans text-sm font-light leading-relaxed text-charcoal">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="start" className="scroll-mt-8 border-t border-gold/20 px-6 py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-gold/25 bg-white/70 p-8 shadow-[0_8px_48px_rgba(0,0,0,0.06)]">
          <h2 className="mb-2 text-center font-script text-5xl">Start your site</h2>
          <p className="mb-8 text-center font-sans text-sm font-light text-charcoal">
            Tell us who you are. After checkout we&apos;ll be in touch to gather your details and photos.
          </p>
          {message && (
            <p className="mb-6 rounded-lg bg-ivory px-4 py-3 text-center font-sans text-sm text-charcoal" role="status">
              {message}
            </p>
          )}
          <form action="/api/checkout" method="post" className="space-y-5">
            <Field label="Your names" name="coupleNames" placeholder="e.g. Amali & Ashen" required />
            <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
            <Field label="Wedding date" name="weddingDate" type="date" />
            <button
              type="submit"
              disabled={!canCheckout}
              className="w-full rounded-full bg-navy px-6 py-4 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canCheckout ? "Continue to payment" : "Checkout coming soon"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full border-0 border-b border-gold bg-transparent py-2 font-sans font-light text-charcoal outline-none focus:border-navy"
      />
    </label>
  );
}
