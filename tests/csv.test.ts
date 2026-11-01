import { describe, expect, it } from "vitest";
import { formatRepliedAt, rsvpCsv, rsvpTotals } from "@/lib/admin/rsvp-export";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("quotes commas, quotes and line breaks and starts with a BOM", () => {
    const csv = toCsv([["Name", "Message"], ['Jo "JJ" Smith', "Hi, see you\nsoon"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1)).toBe('Name,Message\r\n"Jo ""JJ"" Smith","Hi, see you\nsoon"\r\n');
  });

  it("stops cells from running as spreadsheet formulas", () => {
    const csv = toCsv([["=HYPERLINK(\"x\")", "+1", "-2", "@a", "plain"]]);
    expect(csv.slice(1)).toBe('"\'=HYPERLINK(""x"")",\'+1,\'-2,\'@a,plain\r\n');
  });

  it("writes empty cells for missing values", () => {
    expect(toCsv([[null, undefined, 0, true]]).slice(1)).toBe(",,0,true\r\n");
  });
});

describe("rsvp export", () => {
  const rsvps = [
    { guest_name: "Jo", email: "jo@example.com", attending: true, message: null, created_at: "2026-08-01T18:05:00Z" },
    { guest_name: "Sam", email: "sam@example.com", attending: false, message: "Sorry!", created_at: "2026-08-02T03:00:00Z" },
  ];

  it("writes one row per RSVP with the reply time in the wedding's zone", () => {
    expect(formatRepliedAt("2026-08-01T18:05:00Z", "America/Halifax")).toBe("2026-08-01 15:05");
    const csv = rsvpCsv(rsvps, "America/Halifax").slice(1);
    expect(csv).toBe(
      "Name,Email,Attending,Message,Replied\r\n" +
        "Jo,jo@example.com,Yes,,2026-08-01 15:05\r\n" +
        "Sam,sam@example.com,No,Sorry!,2026-08-02 00:00\r\n",
    );
  });

  it("counts replies", () => {
    expect(rsvpTotals(rsvps)).toEqual({ yes: 1, no: 1, total: 2 });
  });
});
