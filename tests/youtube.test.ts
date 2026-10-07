import { describe, expect, it } from "vitest";
import { youtubeVideoId } from "@/lib/youtube";

describe("youtubeVideoId", () => {
  it.each([
    ["7maJOI3QMu0", "7maJOI3QMu0"],
    ["https://www.youtube.com/watch?v=7maJOI3QMu0", "7maJOI3QMu0"],
    ["https://youtube.com/watch?v=7maJOI3QMu0&t=30s", "7maJOI3QMu0"],
    ["https://youtu.be/7maJOI3QMu0?si=abc", "7maJOI3QMu0"],
    ["https://www.youtube.com/embed/7maJOI3QMu0", "7maJOI3QMu0"],
    ["https://music.youtube.com/watch?v=7maJOI3QMu0", "7maJOI3QMu0"],
  ])("reads %s", (input, expected) => {
    expect(youtubeVideoId(input)).toBe(expected);
  });

  it.each([[undefined], [""], ["not a url"], ["https://vimeo.com/123"], ["https://youtube.com/watch?v=short"]])(
    "returns null for %s",
    (input) => {
      expect(youtubeVideoId(input)).toBeNull();
    },
  );
});
