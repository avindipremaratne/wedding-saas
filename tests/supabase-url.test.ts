import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { supabaseOrigin } = await import("@/lib/supabase/server");

describe("supabaseOrigin", () => {
  it.each([
    ["https://abc.supabase.co", "https://abc.supabase.co"],
    ["https://abc.supabase.co/", "https://abc.supabase.co"],
    ["https://abc.supabase.co/rest/v1/", "https://abc.supabase.co"],
    ["  https://abc.supabase.co/rest/v1  ", "https://abc.supabase.co"],
    ["http://127.0.0.1:54321", "http://127.0.0.1:54321"],
  ])("normalises %s", (input, expected) => {
    expect(supabaseOrigin(input)).toBe(expected);
  });

  it("returns undefined for missing or invalid values", () => {
    expect(supabaseOrigin(undefined)).toBeUndefined();
    expect(supabaseOrigin("")).toBeUndefined();
    expect(supabaseOrigin("abc.supabase.co")).toBeUndefined();
  });
});
