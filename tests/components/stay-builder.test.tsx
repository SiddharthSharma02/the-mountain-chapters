import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StayBuilder } from "@/components/admin/stays/stay-builder";
import { normalizeStay } from "@/lib/stays/normalize";
import { stateA } from "@/tests/fixtures/stays";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("StayBuilder", () => {
  it("renders an unpublished stay without a destination or images", () => {
    const stay = normalizeStay({
      ...stateA,
      name: "The Snow Trail Narkanda",
      destination_id: null,
      destinations: null,
      cover_image: null,
      images: [],
      amenities: [],
      is_published: false,
      stay_images: [],
      stay_amenities: [],
    });

    render(<StayBuilder stay={stay} destinations={[]} />);

    expect(screen.getByRole("heading", { name: stay.name })).toBeTruthy();
    expect(screen.getByText("Draft — not visible to guests")).toBeTruthy();
  });
});
