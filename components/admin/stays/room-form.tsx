"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AmenityPicker } from "@/components/admin/stays/amenity-picker";
import { ImageManager, type ManagedImage } from "@/components/admin/stays/image-manager";
import { SortableList } from "@/components/admin/stays/sortable-list";
import { Panel, SaveBar, TextField, Toggle, newId, useSave } from "@/components/admin/stays/builder-ui";
import { saveRoom } from "@/lib/actions/admin-stay-builder";
import { ROOM_AMENITY_CATALOG } from "@/lib/stays/amenity-catalog";
import { discountPercent } from "@/lib/stays/pricing";
import { ROOM_IMAGE_TYPES, type AmenityInput, type Room } from "@/lib/stays/types";
import { slugify } from "@/lib/stays/validation";

type Plan = {
  id: string; name: string; price_per_night: string; meal_plan: string;
  cancellation_policy: string; payment_policy: string; is_active: boolean;
};

export function RoomForm({ stayId, stayName, roomId, room }: { stayId: string; stayName: string; roomId: string; room: Room | null }) {
  const router = useRouter();
  const { state, run } = useSave();
  const [slugTouched, setSlugTouched] = useState(Boolean(room));
  const [f, setF] = useState({
    name: room?.name ?? "",
    slug: room?.slug ?? "",
    description: room?.description ?? "",
    max_guests: room?.max_guests?.toString() ?? "",
    bed_type: room?.bed_type ?? "",
    room_size: room?.room_size ?? "",
    view: room?.view ?? "",
    price_per_night: room?.price_per_night?.toString() ?? "",
    original_price: room?.original_price?.toString() ?? "",
    is_active: room?.is_active ?? true,
  });
  const [images, setImages] = useState<ManagedImage[]>(() =>
    (room?.room_images ?? []).map((i) => ({ id: i.id, image_url: i.image_url, image_type: i.image_type, caption: null }))
  );
  const [amenities, setAmenities] = useState<AmenityInput[]>(room?.room_amenities ?? []);
  const [plans, setPlans] = useState<Plan[]>(() =>
    (room?.room_rate_plans ?? []).map((p) => ({
      id: p.id, name: p.name, price_per_night: p.price_per_night?.toString() ?? "", meal_plan: p.meal_plan ?? "",
      cancellation_policy: p.cancellation_policy ?? "", payment_policy: p.payment_policy ?? "", is_active: p.is_active,
    }))
  );
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));
  const setPlan = (id: string, patch: Partial<Plan>) => setPlans((all) => all.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const discount = discountPercent(Number(f.price_per_night) || null, Number(f.original_price) || null);

  const save = async () => {
    const result = await run(() => saveRoom(stayId, roomId, { ...f, images, amenities, rate_plans: plans }));
    if (result) router.push(`/admin/stays/${stayId}?tab=rooms`);
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href={`/admin/stays/${stayId}?tab=rooms`} className="text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold">
          ← {stayName} · Rooms
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold text-navy">{room ? `Edit ${room.name}` : "Add room"}</h1>
      </div>

      <Panel title="Basic information">
        <TextField label="Room name" value={f.name} required onChange={(name) => set({ name, ...(slugTouched ? {} : { slug: slugify(name) }) })} placeholder="Deluxe Mountain Room" />
        <TextField label="Slug" value={f.slug} onChange={(slug) => { setSlugTouched(true); set({ slug }); }} hint="Unique within this stay." />
        <TextField label="Description" value={f.description} onChange={(description) => set({ description })} multiline />
      </Panel>

      <Panel title="Capacity">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Maximum guests" type="number" min={1} max={50} value={f.max_guests} onChange={(max_guests) => set({ max_guests })} />
          <TextField label="Bed type" value={f.bed_type} onChange={(bed_type) => set({ bed_type })} placeholder="King Bed" />
          <TextField label="Room size" value={f.room_size} onChange={(room_size) => set({ room_size })} placeholder="350 sq ft" />
          <TextField label="View" value={f.view} onChange={(view) => set({ view })} placeholder="Mountain View" />
        </div>
      </Panel>

      <Panel title="Pricing" description="The base price is what guests see. A higher “original price” shows as a strike-through — only use it for a genuine reduction.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Price per night (₹)" type="number" min={0} value={f.price_per_night} onChange={(price_per_night) => set({ price_per_night })} />
          <TextField
            label="Original price (₹, optional)"
            type="number"
            min={0}
            value={f.original_price}
            onChange={(original_price) => set({ original_price })}
            hint={discount ? `Shows as ${discount}% off` : f.original_price ? "Ignored unless higher than the price" : undefined}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-navy">Rate plans (optional)</p>
          <p className="text-xs text-navy/50">
            Stored for when online booking supports multiple rates. Today guests see the base price; the first plan&apos;s cancellation policy is shown in the room details.
          </p>
          {plans.length > 0 && (
            <div className="mt-3">
              <SortableList items={plans} onReorder={setPlans} getKey={(p) => p.id} label={(p, i) => p.name || `rate plan ${i + 1}`}>
                {(p) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Plan name" value={p.name} onChange={(name) => setPlan(p.id, { name })} placeholder="Breakfast included" />
                    <TextField label="Price per night (₹)" type="number" min={0} value={p.price_per_night} onChange={(price_per_night) => setPlan(p.id, { price_per_night })} />
                    <TextField label="Meal plan" value={p.meal_plan} onChange={(meal_plan) => setPlan(p.id, { meal_plan })} placeholder="Breakfast" />
                    <TextField label="Payment policy" value={p.payment_policy} onChange={(payment_policy) => setPlan(p.id, { payment_policy })} placeholder="Pay at property" />
                    <div className="sm:col-span-2">
                      <TextField label="Cancellation policy" value={p.cancellation_policy} onChange={(cancellation_policy) => setPlan(p.id, { cancellation_policy })} placeholder="Free cancellation until 7 days before arrival" />
                    </div>
                    <div className="flex items-center justify-between sm:col-span-2">
                      <Toggle label="Active" checked={p.is_active} onChange={(is_active) => setPlan(p.id, { is_active })} />
                      <button type="button" onClick={() => setPlans((all) => all.filter((x) => x.id !== p.id))} className="text-sm font-medium text-red-600">
                        Remove plan
                      </button>
                    </div>
                  </div>
                )}
              </SortableList>
            </div>
          )}
          <button
            type="button"
            onClick={() => setPlans((all) => [...all, { id: newId(), name: "", price_per_night: "", meal_plan: "", cancellation_policy: "", payment_policy: "", is_active: true }])}
            className="mt-3 rounded-full px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy"
          >
            + Add rate plan
          </button>
        </div>
      </Panel>

      <Panel title="Room images" description="Drag to reorder. The first image is the primary room photo; guests swipe through the rest.">
        <ImageManager images={images} onChange={setImages} folder={`${stayId}/rooms/${roomId}`} types={ROOM_IMAGE_TYPES} primaryLabel="Primary" />
      </Panel>

      <Panel title="Room amenities" description="Features of this room specifically.">
        <AmenityPicker catalog={ROOM_AMENITY_CATALOG} value={amenities} onChange={setAmenities} />
      </Panel>

      <Panel title="Status">
        <Toggle label="Active — show this room on the public page" checked={f.is_active} onChange={(is_active) => set({ is_active })} />
      </Panel>

      <SaveBar state={state} onSave={save} label={room ? "Save room" : "Create room"} />
    </div>
  );
}
