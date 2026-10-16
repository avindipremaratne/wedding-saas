import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { sendRsvpNotification } = await import("@/lib/email");

const rsvp = { guestName: "Jo <b>", email: "jo@example.com", attending: true, message: "See you!\nLove, Jo" };
const send = () => sendRsvpNotification({ to: "couple@example.com", coupleNames: ["Amali", "Ashen"], rsvp });

describe("sendRsvpNotification", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("does nothing (and says why) without Resend settings", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    await send();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY"));
  });

  it("posts the RSVP to Resend with escaped HTML and a text part", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RSVP_FROM_EMAIL", "RSVPs <rsvp@example.com>");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await send();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      from: "RSVPs <rsvp@example.com>",
      to: ["couple@example.com"],
      reply_to: "jo@example.com",
      subject: "RSVP: Jo <b> — Joyfully accepts",
    });
    expect(body.html).toContain("Jo &lt;b&gt;");
    expect(body.html).not.toContain("<b>");
    expect(body.html).toContain("See you!<br>Love, Jo");
    expect(body.text).toContain("Attending: Joyfully accepts");
  });

  it("logs, but never throws, when Resend fails", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RSVP_FROM_EMAIL", "rsvp@example.com");
    fetchMock.mockResolvedValue(new Response("domain not verified", { status: 403 }));
    await expect(send()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("rejected"), 403, "domain not verified");

    fetchMock.mockRejectedValue(new Error("offline"));
    await expect(send()).resolves.toBeUndefined();
  });
});
