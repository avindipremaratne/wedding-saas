const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Accepts a bare video id or any common YouTube URL form
 * (watch?v=, youtu.be/, /embed/, /shorts/) and returns the 11-character id.
 */
export function youtubeVideoId(input: string | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.slice(1);
  } else if (host === "youtube.com" || host === "music.youtube.com") {
    candidate = url.searchParams.get("v");
    if (!candidate) {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      candidate = match?.[1] ?? null;
    }
  }
  return candidate && ID_PATTERN.test(candidate) ? candidate : null;
}
