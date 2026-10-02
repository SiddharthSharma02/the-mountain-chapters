import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { AmenityPicker } from "@/components/admin/stays/amenity-picker";
import { SortableList } from "@/components/admin/stays/sortable-list";
import { ImageManager, type ManagedImage } from "@/components/admin/stays/image-manager";
import { STAY_AMENITY_CATALOG } from "@/lib/stays/amenity-catalog";
import type { AmenityInput } from "@/lib/stays/types";

vi.mock("@/lib/actions/admin-stay-builder", () => ({ uploadStayImage: vi.fn() }));

function PickerHarness({ initial = [] as AmenityInput[] }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <AmenityPicker catalog={STAY_AMENITY_CATALOG} value={value} onChange={setValue} />
      <output data-testid="value">{JSON.stringify(value.map((v) => [v.name, v.category]))}</output>
    </>
  );
}
const valueOf = () => JSON.parse(screen.getByTestId("value").textContent || "[]");

describe("AmenityPicker", () => {
  it("shows every catalog category as a group of toggle chips", () => {
    render(<PickerHarness />);
    for (const cat of Object.keys(STAY_AMENITY_CATALOG)) {
      expect(screen.getByRole("group", { name: cat })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "Wi-Fi" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("selects and deselects a chip with its catalog category", () => {
    render(<PickerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Parking" }));
    expect(valueOf()).toEqual([["Parking", "Essentials"]]);
    expect(screen.getByRole("button", { name: "Parking" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Parking" }));
    expect(valueOf()).toEqual([]);
  });

  it("adds a custom amenity under Other without requiring an icon", () => {
    render(<PickerHarness />);
    fireEvent.change(screen.getByLabelText(/custom amenity/i), { target: { value: "Private chef" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(valueOf()).toEqual([["Private chef", "Other"]]);
    expect(within(screen.getByRole("group", { name: "Other" })).getByRole("button", { name: "Private chef" })).toBeTruthy();
  });

  it("does not add a duplicate (case-insensitive) or blank custom amenity", () => {
    render(<PickerHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Wi-Fi" }));
    const input = screen.getByLabelText(/custom amenity/i);
    fireEvent.change(input, { target: { value: "wi-fi" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(valueOf()).toEqual([["Wi-Fi", "Essentials"]]);
  });

  it("marks previously saved legacy names as selected (e.g. 'WiFi' ≙ 'Wi-Fi')", () => {
    render(<PickerHarness initial={[{ id: "00000000-0000-4000-8000-000000000001", name: "WiFi", category: "Essentials", icon: null }]} />);
    expect(screen.getByRole("button", { name: "Wi-Fi" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("SortableList", () => {
  function Harness() {
    const [items, setItems] = useState([{ id: "a" }, { id: "b" }, { id: "c" }]);
    return (
      <>
        <SortableList items={items} onReorder={setItems} getKey={(i) => i.id} label={(i) => `Item ${i.id}`}>
          {(item) => <span>{item.id.toUpperCase()}</span>}
        </SortableList>
        <output data-testid="order">{items.map((i) => i.id).join("")}</output>
      </>
    );
  }

  it("reorders with accessible move up/down buttons", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Move Item c up" }));
    expect(screen.getByTestId("order").textContent).toBe("acb");
    fireEvent.click(screen.getByRole("button", { name: "Move Item a down" }));
    expect(screen.getByTestId("order").textContent).toBe("cab");
  });

  it("disables moving past the ends", () => {
    render(<Harness />);
    expect((screen.getByRole("button", { name: "Move Item a up" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Move Item c down" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("reorders via drag and drop", () => {
    render(<Harness />);
    const rows = screen.getAllByRole("listitem");
    fireEvent.dragStart(rows[2]);
    fireEvent.dragOver(rows[0]);
    fireEvent.drop(rows[0]);
    expect(screen.getByTestId("order").textContent).toBe("cab");
  });
});

describe("ImageManager", () => {
  function Harness({ uploader }: { uploader: (f: FormData) => Promise<{ ok: true; url: string } | { ok: false; error: string }> }) {
    const [images, setImages] = useState<ManagedImage[]>([
      { id: "00000000-0000-4000-8000-000000000001", image_url: "https://a.b/1.jpg", image_type: "room", caption: null },
      { id: "00000000-0000-4000-8000-000000000002", image_url: "https://a.b/2.jpg", image_type: "view", caption: null },
    ]);
    return (
      <>
        <ImageManager images={images} onChange={setImages} folder="f" types={["room", "view", "bathroom"]} uploader={uploader} primaryLabel="Primary" />
        <output data-testid="imgs">{images.map((i) => i.image_url).join(",")}</output>
      </>
    );
  }

  it("marks the first image as primary", () => {
    render(<Harness uploader={vi.fn()} />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText("Primary")).toBeTruthy();
    expect(within(items[1]).queryByText("Primary")).toBeNull();
  });

  it("rejects non-images and files over 3MB before uploading", async () => {
    const uploader = vi.fn();
    render(<Harness uploader={uploader} />);
    const input = screen.getByLabelText(/upload images/i);
    const big = new File([new Uint8Array(3 * 1024 * 1024 + 1)], "big.jpg", { type: "image/jpeg" });
    const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [big, pdf] } });
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/3MB|image/i));
    expect(uploader).not.toHaveBeenCalled();
  });

  it("uploads valid files to the organised folder and appends them", async () => {
    const uploader = vi.fn(async (_fd: FormData) => ({ ok: true as const, url: "https://a.b/new.jpg" }));
    render(<Harness uploader={uploader} />);
    const file = new File(["x"], "view.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText(/upload images/i), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByTestId("imgs").textContent).toContain("new.jpg"));
    const fd = uploader.mock.calls[0][0];
    expect(fd.get("folder")).toBe("f");
  });

  it("deletes an image and lets the next one become primary", () => {
    render(<Harness uploader={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("button", { name: /remove image/i })[0]);
    expect(screen.getByTestId("imgs").textContent).toBe("https://a.b/2.jpg");
    expect(within(screen.getAllByRole("listitem")[0]).getByText("Primary")).toBeTruthy();
  });

  it("lets the admin set an image category", () => {
    render(<Harness uploader={vi.fn()} />);
    const select = screen.getAllByLabelText(/image type/i)[0] as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "bathroom" } });
    expect(select.value).toBe("bathroom");
  });
});
