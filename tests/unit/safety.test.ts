import { describe, expect, it } from "vitest";
import { FALLBACK_IMAGE, resolveImage } from "@/lib/images/hosts";
import { HONEYPOT_FIELD, STARTED_AT_FIELD, isLikelySpam, isValidEmail } from "@/lib/spam";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("isLikelySpam", () => {
  const now = 1_000_000;
  it("passes a human who took a few seconds", () => {
    expect(isLikelySpam(form({ [STARTED_AT_FIELD]: String(now - 10_000) }), now)).toBe(false);
  });
  it("flags a filled honeypot", () => {
    expect(isLikelySpam(form({ [STARTED_AT_FIELD]: String(now - 10_000), [HONEYPOT_FIELD]: "x" }), now)).toBe(true);
  });
  it("flags an instant submit", () => {
    expect(isLikelySpam(form({ [STARTED_AT_FIELD]: String(now - 300) }), now)).toBe(true);
  });
  it("flags a missing or junk timestamp", () => {
    expect(isLikelySpam(form({}), now)).toBe(true);
    expect(isLikelySpam(form({ [STARTED_AT_FIELD]: "abc" }), now)).toBe(true);
  });
});

describe("isValidEmail", () => {
  it.each(["a@b.co", "first.last+tag@mail.example.com"])("accepts %s", (e) => expect(isValidEmail(e)).toBe(true));
  it.each(["", "a@b", "@b.com", "a b@c.com", "a@b.c"])("rejects %s", (e) => expect(isValidEmail(e)).toBe(false));
});

describe("resolveImage", () => {
  it("optimises local and allow-listed images", () => {
    expect(resolveImage("/Hero.jpg")).toEqual({ src: "/Hero.jpg", unoptimized: false });
    expect(resolveImage("https://images.unsplash.com/x.jpg").unoptimized).toBe(false);
  });
  it("renders other https hosts unoptimised instead of crashing", () => {
    expect(resolveImage("https://example.com/a.jpg")).toEqual({ src: "https://example.com/a.jpg", unoptimized: true });
  });
  it.each([null, "", "http://example.com/a.jpg", "javascript:alert(1)", "//evil.com/a.jpg", "not a url"])(
    "falls back for %s",
    (u) => expect(resolveImage(u).src).toBe(FALLBACK_IMAGE),
  );
});
