import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { normalizeStay } from "@/lib/stays/normalize";
import { ImageCarousel } from "@/components/stays/image-carousel";
import { BottomSheet } from "@/components/stays/bottom-sheet";
import { RoomCard } from "@/components/stays/room-card";
import { StayProfile } from "@/components/stays/stay-profile";
import { stateA, stateB, stateC } from "../fixtures/stays";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ preload: _p, fill: _f, placeholder: _ph, ...props }: Record<string, unknown>) => <img {...(props as object)} />,
}));

const gsapSpy = vi.hoisted(() => ({ registerPlugin: vi.fn(), context: vi.fn(() => ({ revert: vi.fn() })) }));
vi.mock("gsap", () => ({ default: gsapSpy, gsap: gsapSpy }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

describe("ImageCarousel", () => {
  const images = [
    { url: "https://images.unsplash.com/1", alt: "Room" },
    { url: "https://images.unsplash.com/2", alt: "Bathroom" },
    { url: "https://images.unsplash.com/3", alt: "Balcony" },
  ];

  it("shows a 1 / N counter and advances with the next button", () => {
    render(<ImageCarousel images={images} label="Deluxe room photos" />);
    expect(screen.getByText("1 / 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /next photo/i }));
    expect(screen.getByText("2 / 3")).toBeTruthy();
  });

  it("does not go past the last image", () => {
    render(<ImageCarousel images={images} label="x" />);
    const next = screen.getByRole("button", { name: /next photo/i });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText("3 / 3")).toBeTruthy();
  });

  it("lazy-loads every image by default (carousels sit below the fold)", () => {
    render(<ImageCarousel images={images} label="x" />);
    expect(screen.getAllByRole("img").every((i) => i.getAttribute("loading") === "lazy")).toBe(true);
  });

  it("with priority, eager-loads only the first image", () => {
    render(<ImageCarousel images={images} label="x" priority />);
    const imgs = screen.getAllByRole("img");
    expect(imgs[0].getAttribute("loading")).toBe("eager");
    expect(imgs.slice(1).every((i) => i.getAttribute("loading") === "lazy")).toBe(true);
  });

  it("hides the counter and controls for a single image", () => {
    render(<ImageCarousel images={images.slice(0, 1)} label="x" />);
    expect(screen.queryByText("1 / 1")).toBeNull();
    expect(screen.queryByRole("button", { name: /next photo/i })).toBeNull();
  });

  it("renders the branded placeholder when there are no images", () => {
    render(<ImageCarousel images={[]} label="x" />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("/placeholder-mountain.svg");
  });

  it("is a labelled, swipeable region", () => {
    render(<ImageCarousel images={images} label="Deluxe room photos" />);
    expect(screen.getByRole("region", { name: "Deluxe room photos" })).toBeTruthy();
  });
});

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    render(<BottomSheet open={false} onClose={() => {}} title="Room">content</BottomSheet>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is a modal dialog labelled by its title", () => {
    render(<BottomSheet open onClose={() => {}} title="Deluxe Mountain Room">content</BottomSheet>);
    const dialog = screen.getByRole("dialog", { name: "Deluxe Mountain Room" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("closes on Escape, on the close button and on the backdrop", () => {
    const onClose = vi.fn();
    render(<BottomSheet open onClose={onClose} title="T">content</BottomSheet>);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    fireEvent.click(screen.getByTestId("sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("locks body scroll while open and restores it on close", () => {
    const { rerender } = render(<BottomSheet open onClose={() => {}} title="T">c</BottomSheet>);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<BottomSheet open={false} onClose={() => {}} title="T">c</BottomSheet>);
    expect(document.body.style.overflow).toBe("");
  });
});

describe("RoomCard", () => {
  const stay = normalizeStay(stateB);
  const deluxe = stay.rooms.find((r) => r.slug === "deluxe-mountain-room")!;

  it("shows the name, facts, view, amenities and price", () => {
    render(<RoomCard room={deluxe} staySlug={stay.slug} />);
    expect(screen.getByRole("heading", { name: "Deluxe Mountain Room" })).toBeTruthy();
    expect(screen.getByText("King Bed · 350 sq ft · 2 guests")).toBeTruthy();
    expect(screen.getByText("Mountain View")).toBeTruthy();
    expect(screen.getByText("Private balcony")).toBeTruthy();
    expect(screen.getByText("₹5,999")).toBeTruthy();
  });

  it("shows the original price only as a genuine strike-through", () => {
    render(<RoomCard room={deluxe} staySlug={stay.slug} />);
    expect(screen.getByText("₹6,999").tagName).toBe("S");
  });

  it("opens a bottom sheet with details, cancellation and a select link", () => {
    render(<RoomCard room={deluxe} staySlug={stay.slug} />);
    fireEvent.click(screen.getByRole("button", { name: /view room/i }));
    const sheet = screen.getByRole("dialog", { name: "Deluxe Mountain Room" });
    expect(within(sheet).getByText("Sleeps 2")).toBeTruthy();
    expect(within(sheet).getByText(/Free cancellation until 7 days/)).toBeTruthy();
    expect(within(sheet).queryByText("Hidden plan")).toBeNull();
    const select = within(sheet).getByRole("link", { name: /select this room/i });
    expect(select.getAttribute("href")).toBe("/contact?stay=the-mountain-chapters&room=deluxe-mountain-room");
  });

  it("never claims availability", () => {
    const { container } = render(<RoomCard room={deluxe} staySlug={stay.slug} />);
    fireEvent.click(screen.getByRole("button", { name: /view room/i }));
    expect(container.ownerDocument.body.textContent).not.toMatch(/\bavailable\b|only \d+ left|sold out/i);
  });

  it("shows 'Price on request' for rooms without a price", () => {
    render(<RoomCard room={{ ...deluxe, price_per_night: null, original_price: null }} staySlug="x" />);
    expect(screen.getByText(/price on request/i)).toBeTruthy();
  });
});

describe("StayProfile page", () => {
  it("State A: renders a legacy stay without crashing", () => {
    render(<StayProfile stay={normalizeStay(stateA)} />);
    expect(screen.getByRole("heading", { level: 1, name: "The Morel House" })).toBeTruthy();
    expect(screen.getByText(/Room details coming soon/i)).toBeTruthy();
    expect(screen.getAllByText("₹4,500").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WiFi").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/126 reviews/).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("review-card")).toBeNull();
  });

  it("State A: shows no rating at all when there is none", () => {
    render(<StayProfile stay={normalizeStay({ ...stateA, rating: 0, review_count: 0 })} />);
    expect(screen.queryByText(/★/)).toBeNull();
  });

  it("State B: renders rooms in admin order, hides inactive rooms", () => {
    render(<StayProfile stay={normalizeStay(stateB)} />);
    const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names.indexOf("Forest View Suite")).toBeLessThan(names.indexOf("Deluxe Mountain Room"));
    expect(screen.queryByText("Closed Cottage")).toBeNull();
  });

  it("State B: interleaves a highlighted guest review and lists reviews", () => {
    render(<StayProfile stay={normalizeStay(stateB)} />);
    expect(screen.getAllByText(/Review text 2/).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("review-card").length).toBe(2);
    expect(screen.queryByText(/Review text 3/)).toBeNull();
  });

  it("State B: headline price is the cheapest active room", () => {
    render(<StayProfile stay={normalizeStay(stateB)} />);
    expect(screen.getByTestId("booking-bar").textContent).toContain("₹5,999");
  });

  it("State C: renders rules, FAQ, location and nearby places", () => {
    render(<StayProfile stay={normalizeStay(stateC)} />);
    expect(screen.getByText("3:00 PM")).toBeTruthy();
    expect(screen.getByText("11:00 AM")).toBeTruthy();
    expect(screen.getByText("Not permitted")).toBeTruthy();
    expect(screen.getByText("Do you allow pets?")).toBeTruthy();
    expect(screen.getByText("Shimla Mall Road")).toBeTruthy();
    expect(screen.getByText("8.2 km")).toBeTruthy();
    const map = screen.getByTitle(/map/i);
    expect(map.getAttribute("src")).toContain("31.1048");
    expect(map.getAttribute("loading")).toBe("lazy");
    const googleMapsLink = screen.getByRole("link", { name: "Open in Google Maps" });
    expect(googleMapsLink.getAttribute("href")).toContain("query_place_id=ChIJ-test-place");
  });

  it("State C: hides inactive story sections", () => {
    render(<StayProfile stay={normalizeStay(stateC)} />);
    expect(screen.queryByText("Not ready")).toBeNull();
  });

  it("does not render a map without coordinates", () => {
    render(<StayProfile stay={normalizeStay(stateB)} />);
    expect(screen.queryByTitle(/map/i)).toBeNull();
  });

  it("sticky booking bar starts hidden (it appears after the hero)", () => {
    render(<StayProfile stay={normalizeStay(stateB)} />);
    expect(screen.getByTestId("booking-bar").getAttribute("data-visible")).toBe("false");
  });

  it("marks preview renders clearly", () => {
    render(<StayProfile stay={normalizeStay({ ...stateB, is_published: false })} preview />);
    expect(screen.getByText(/preview/i)).toBeTruthy();
  });

  it("emits JSON-LD", () => {
    const { container } = render(<StayProfile stay={normalizeStay(stateC)} />);
    const ld = container.querySelector('script[type="application/ld+json"]');
    expect(ld?.textContent).toContain("LodgingBusiness");
  });
});

describe("motion respects prefers-reduced-motion", () => {
  beforeEach(() => {
    gsapSpy.registerPlugin.mockClear();
  });

  it("does not load GSAP when the user prefers reduced motion", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
    const { StayMotion } = await import("@/components/stays/stay-motion");
    render(<StayMotion />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(gsapSpy.registerPlugin).not.toHaveBeenCalled();
    window.matchMedia = original;
  });

  it("loads GSAP ScrollTrigger otherwise", async () => {
    const { StayMotion } = await import("@/components/stays/stay-motion");
    render(<StayMotion />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(gsapSpy.registerPlugin).toHaveBeenCalled();
  });
});

describe("Stars", () => {
  it("fills proportionally instead of rounding a 4.5 up to five stars", async () => {
    const { Stars } = await import("@/components/stays/icons");
    const { container } = render(<Stars rating={4.5} />);
    const widths = [...container.querySelectorAll<HTMLElement>("span[style]")].map((s) => s.style.width);
    expect(widths).toEqual(["100%", "100%", "100%", "100%", "50%"]);
    expect(screen.getByRole("img", { name: "4.5 out of 5 stars" })).toBeTruthy();
  });
});
