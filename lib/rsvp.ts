// RSVP validation, kept free of Next.js and Supabase imports so it can be
// unit tested and reused by both the Server Action and any future API.

export interface RsvpInput {
  guestName: string;
  email: string;
  attending: boolean;
  message: string;
}

export type RsvpFieldErrors = Partial<Record<keyof RsvpInput, string>>;

export type RsvpValidation =
  | { ok: true; data: RsvpInput }
  | { ok: false; errors: RsvpFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RSVP_LIMITS = { name: 120, email: 254, message: 2000 } as const;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseRsvp(formData: FormData): RsvpValidation {
  const guestName = text(formData, "guestName");
  const email = text(formData, "email").toLowerCase();
  const attendingRaw = text(formData, "attending");
  const message = text(formData, "message");

  const errors: RsvpFieldErrors = {};
  if (!guestName) errors.guestName = "Please enter your name.";
  else if (guestName.length > RSVP_LIMITS.name) errors.guestName = "That name is too long.";

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > RSVP_LIMITS.email || !EMAIL_PATTERN.test(email))
    errors.email = "Please enter a valid email address.";

  if (attendingRaw !== "yes" && attendingRaw !== "no")
    errors.attending = "Please let us know if you can attend.";

  if (message.length > RSVP_LIMITS.message) errors.message = "Please keep your message shorter.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { guestName, email, attending: attendingRaw === "yes", message } };
}
