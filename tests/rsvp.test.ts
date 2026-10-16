import { describe, expect, it } from "vitest";
import { parseRsvp, RSVP_LIMITS } from "@/lib/rsvp";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = { guestName: " John Doe ", email: "John@Example.com", attending: "yes", message: "Congrats!" };

describe("parseRsvp", () => {
  it("accepts and normalises a valid reply", () => {
    expect(parseRsvp(form(valid))).toEqual({
      ok: true,
      data: { guestName: "John Doe", email: "john@example.com", attending: true, message: "Congrats!" },
    });
  });

  it("reads a decline", () => {
    const result = parseRsvp(form({ ...valid, attending: "no" }));
    expect(result.ok && result.data.attending).toBe(false);
  });

  it("allows an empty message", () => {
    expect(parseRsvp(form({ ...valid, message: "" })).ok).toBe(true);
  });

  it("reports each invalid field", () => {
    const result = parseRsvp(form({ guestName: "", email: "not-an-email", attending: "maybe" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["attending", "email", "guestName"]);
    }
  });

  it("rejects over-long input", () => {
    const result = parseRsvp(
      form({ ...valid, guestName: "x".repeat(RSVP_LIMITS.name + 1), message: "y".repeat(RSVP_LIMITS.message + 1) }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["guestName", "message"]);
  });
});
