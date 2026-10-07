import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-silk px-6 py-24 text-center text-ink">
      <h1 className="mb-4 font-script text-6xl">Page not found</h1>
      <p className="mb-10 max-w-md font-sans font-light text-charcoal">
        We couldn&apos;t find that wedding site. Check the link you were sent.
      </p>
      <Link href="/" className="font-sans text-xs uppercase tracking-[0.2em] text-navy underline underline-offset-4 hover:text-gold">
        Back to home
      </Link>
    </main>
  );
}
