import { describe, expect, it } from "vitest";
import { slugError, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("makes a web address from names", () => {
    expect(slugify("Amali & Ashen")).toBe("amali-and-ashen");
    expect(slugify("  Zoë   Núñez + José ")).toBe("zoe-nunez-jose");
    expect(slugify("---")).toBe("");
  });
});

describe("slugError", () => {
  it("accepts good slugs and explains bad ones", () => {
    expect(slugError("amali-ashen")).toBeNull();
    expect(slugError("")).toMatch(/enter/);
    expect(slugError("Amali Ashen")).toMatch(/lowercase/);
    expect(slugError("-amali")).toMatch(/lowercase/);
    expect(slugError("admin")).toMatch(/reserved/);
    expect(slugError("rsvps")).toMatch(/reserved/);
  });
});
