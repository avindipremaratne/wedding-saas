import { describe, expect, it } from "vitest";
import { parseSiteForm, toFormValues, type SiteRowForAdmin } from "@/lib/admin/site-form";
import type { ThemeColors } from "@/lib/types";

const colors: ThemeColors = {
  gold: "#C8A96A", navy: "#1F2A44", ivory: "#F5ECD7", linen: "#FAF6F0",
  silk: "#F7F3EE", ink: "#1C1C1C", charcoal: "#3A3A3A", porcelain: "#FCFAF7",
};

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  const base: Record<string, string> = {
    slug: "amali-ashen",
    themeId: "heirloom",
    coupleName1: "Amali",
    coupleName2: "Ashen",
    weddingDate: "2026-08-27T15:00",
    timeZone: "America/Halifax",
    ceremonyTime: "3:00 PM AST",
    venueName: "St. Thomas Aquinas Church",
  };
  for (const [key, value] of Object.entries({ ...base, ...values })) data.set(key, value);
  return data;
}

describe("parseSiteForm", () => {
  it("builds the site and content columns from a minimal form", () => {
    const result = parseSiteForm(form({}), { colors });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.site).toEqual({ slug: "amali-ashen", published: false, theme_id: "heirloom" });
    expect(result.content).toMatchObject({
      couple_names: ["Amali", "Ashen"],
      wedding_date: "2026-08-27T18:00:00.000Z",
      wedding_end: null,
      time_zone: "America/Halifax",
      rsvp_deadline: null,
      hero_photo_url: "",
      gallery_photo_urls: [],
      palette_override: null,
      music_track_url: null,
      schedule: [],
    });
    expect(result.content.theme_data).not.toHaveProperty("attire");
    expect(result.content.theme_data).not.toHaveProperty("verse");
  });

  it("reads lists, attire, schedule, photos and only the changed colours", () => {
    const result = parseSiteForm(
      form({
        published: "on",
        weddingEnd: "2026-08-27T20:00",
        venueAddress: "1725 Oxford St,\n\n Halifax, NS ",
        invitationHosts: "Mr. & Mrs. Fernando\nMr. & Mrs. Perera",
        heroPhoto: "sites/amali-ashen/hero.jpeg",
        gallery: JSON.stringify(["sites/amali-ashen/a.jpg", "../etc/passwd", 4]),
        attireEnabled: "on",
        attireTitle: "Modern Heirloom",
        attirePalette: JSON.stringify([{ name: "Sage", color: "#B9C3AE" }, { name: "", color: "" }]),
        schedule: JSON.stringify([{ name: "Ceremony", startTime: "3:00 PM", location: "" }]),
        musicTrackUrl: "https://youtu.be/7maJOI3QMu0",
        color_gold: "#c8a96a",
        color_navy: "#334455",
        verseText: "Love is patient",
        verseReference: "1 Cor 13",
      }),
      { colors },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.site.published).toBe(true);
    expect(result.content.wedding_end).toBe("2026-08-27T23:00:00.000Z");
    expect(result.content.venue.addressLines).toEqual(["1725 Oxford St,", "Halifax, NS"]);
    expect(result.content.theme_data.invitation.hosts).toEqual(["Mr. & Mrs. Fernando", "Mr. & Mrs. Perera"]);
    expect(result.content.gallery_photo_urls).toEqual(["sites/amali-ashen/a.jpg"]);
    expect(result.content.theme_data.attire?.palette).toEqual([{ name: "Sage", color: "#B9C3AE" }]);
    expect(result.content.schedule).toEqual([{ name: "Ceremony", startTime: "3:00 PM" }]);
    expect(result.content.palette_override).toEqual({ navy: "#334455" });
    expect(result.content.theme_data.verse).toEqual({ text: "Love is patient", reference: "1 Cor 13" });
  });

  it("reports every problem at once", () => {
    const result = parseSiteForm(
      form({
        slug: "Amali Ashen",
        coupleName2: "",
        weddingEnd: "2026-08-27T14:00",
        venueMapsUrl: "maps.google.com/x",
        musicTrackUrl: "not a song",
        creditEmail: "nope",
        schedule: JSON.stringify([{ name: "Dinner" }]),
        color_ink: "black",
      }),
      { colors },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["colors", "coupleName2", "creditEmail", "musicTrackUrl", "schedule", "slug", "venueMapsUrl", "weddingEnd"].sort(),
    );
  });

  it("rejects an unknown time zone", () => {
    const result = parseSiteForm(form({ timeZone: "Halifax" }), { colors });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.timeZone).toBeDefined();
  });
});

describe("toFormValues", () => {
  it("round-trips through parseSiteForm", () => {
    const first = parseSiteForm(
      form({ weddingEnd: "2026-08-27T20:00", rsvpDeadline: "2026-08-20", invitationHosts: "A\nB" }),
      { colors },
    );
    if (!first.ok) throw new Error("expected a valid form");
    const row: SiteRowForAdmin = { ...first.site, site_content: first.content };
    const values = toFormValues(row);
    expect(values.weddingDate).toBe("2026-08-27T15:00");
    expect(values.weddingEnd).toBe("2026-08-27T20:00");
    expect(values.invitationHosts).toBe("A\nB");
    expect(values.rsvpDeadline).toBe("2026-08-20");
  });
});
