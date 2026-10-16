"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/actions/rsvp";
import { RSVP_LIMITS } from "@/lib/rsvp";
import styles from "../heirloom.module.css";

const initialState: RsvpState = { status: "idle" };

const labelClass = "mb-2 block font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink";
const fieldClass = `${styles.field} w-full border-0 border-b border-gold bg-transparent py-2 font-sans text-base font-light text-charcoal outline-none placeholder:text-charcoal/50 focus:border-navy`;
const pillClass = "w-full cursor-pointer rounded-full px-6 py-3.5 font-sans text-[0.78rem] font-medium uppercase tracking-[0.2em] transition-all duration-300";

// Client Component: it tracks the attending choice and shows the result of
// the Server Action. The form still submits without JavaScript, because the
// action is a real form action and the choice is a radio input.
export default function RsvpForm({
  siteSlug,
  calendarUrl,
  flourishUrl,
}: {
  siteSlug: string;
  calendarUrl: string;
  flourishUrl: string;
}) {
  const action = useMemo(() => submitRsvp.bind(null, siteSlug), [siteSlug]);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [dismissed, setDismissed] = useState<RsvpState | null>(null);

  if (state.status === "success" && dismissed !== state) {
    return (
      <div className="text-center" role="status">
        <h3 className="mb-4 font-script text-5xl font-normal text-ink">Thank You!</h3>
        <p className="mb-8 font-sans text-[0.95rem] tracking-[0.04em] text-charcoal">
          {state.attending
            ? "Your RSVP has been received. We look forward to celebrating with you!"
            : "Thank you for letting us know. We'll miss you on our special day!"}
        </p>
        {state.attending && (
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-9 py-3.5 font-sans text-[0.78rem] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-gold"
          >
            <CalendarIcon />
            Add to Calendar
          </a>
        )}
        <p className="mt-8">
          <button
            type="button"
            onClick={() => {
              setDismissed(state);
              setAttending("yes");
            }}
            className="font-sans text-xs uppercase tracking-[0.18em] text-charcoal underline underline-offset-4 hover:text-gold"
          >
            Reply for another guest
          </button>
        </p>
        <Flourish src={flourishUrl} />
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="guestName" className={labelClass}>
          Full Name *
        </label>
        <input
          id="guestName"
          name="guestName"
          type="text"
          required
          maxLength={RSVP_LIMITS.name}
          autoComplete="name"
          defaultValue={values?.guestName}
          placeholder="e.g. John Doe"
          className={fieldClass}
          aria-invalid={Boolean(fieldErrors.guestName)}
          aria-describedby={fieldErrors.guestName ? "guestName-error" : undefined}
        />
        <FieldError id="guestName-error" message={fieldErrors.guestName} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={RSVP_LIMITS.email}
          autoComplete="email"
          defaultValue={values?.email}
          placeholder="e.g. johndoe@email.com"
          className={fieldClass}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" message={fieldErrors.email} />
      </div>

      <fieldset>
        <legend className={`${labelClass} mb-3`}>Will you be attending? *</legend>
        <div className="flex flex-col gap-3">
          {(
            [
              ["yes", "Joyfully Accepts"],
              ["no", "Regretfully Declines"],
            ] as const
          ).map(([value, text]) => {
            const selected = attending === value;
            return (
              <label
                key={value}
                className={`${pillClass} text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                  selected ? "border border-navy bg-navy text-white" : "border border-charcoal bg-transparent text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="attending"
                  value={value}
                  checked={selected}
                  onChange={() => setAttending(value)}
                  className="sr-only"
                />
                {text}
              </label>
            );
          })}
        </div>
        <FieldError id="attending-error" message={fieldErrors.attending} />
      </fieldset>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message for the Couple (optional)
        </label>
        <textarea
          id="message"
          name="message"
          maxLength={RSVP_LIMITS.message}
          placeholder="Write us a few words..."
          defaultValue={values?.message}
          className={`${fieldClass} min-h-20 resize-none`}
        />
        <FieldError id="message-error" message={fieldErrors.message} />
      </div>

      {state.status === "error" && (
        <p className="font-sans text-[0.85rem] text-[#c0392b]" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${pillClass} bg-navy py-4 text-white hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending ? "Submitting..." : "Submit RSVP"}
      </button>

      <Flourish src={flourishUrl} />
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 font-sans text-xs text-[#c0392b]">
      {message}
    </p>
  );
}

function Flourish({ src }: { src: string }) {
  return (
    <div className="mt-6 flex justify-center">
      <Image src={src} alt="" width={100} height={30} className="h-auto w-[100px]" />
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
