import { describe, expect, it } from "vitest";
import { siteSlugForHost } from "@/proxy";

describe("siteSlugForHost", () => {
  const root = "weddings.example";

  it("reads the subdomain as the site slug", () => {
    expect(siteSlugForHost("amali-ashen.weddings.example", root)).toBe("amali-ashen");
    expect(siteSlugForHost("Amali-Ashen.weddings.example:3000", root)).toBe("amali-ashen");
  });

  it("ignores the bare domain, reserved and nested subdomains", () => {
    expect(siteSlugForHost("weddings.example", root)).toBeNull();
    expect(siteSlugForHost("www.weddings.example", root)).toBeNull();
    expect(siteSlugForHost("a.b.weddings.example", root)).toBeNull();
    expect(siteSlugForHost("evil-weddings.example", root)).toBeNull();
  });

  it("does nothing without a configured root domain", () => {
    expect(siteSlugForHost("amali-ashen.weddings.example", undefined)).toBeNull();
  });
});
