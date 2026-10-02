"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AmenityPicker } from "@/components/admin/stays/amenity-picker";
import { ImageManager, type ManagedImage } from "@/components/admin/stays/image-manager";
import { inputClass, Panel, SaveBar, SingleImageField, TextField, Toggle, newId, useSave } from "@/components/admin/stays/builder-ui";
import { saveStayAmenities, saveStayBasics, saveStayMedia, saveStaySeo } from "@/lib/actions/admin-stay-builder";
import { PROPERTY_TYPES, STAY_AMENITY_CATALOG } from "@/lib/stays/amenity-catalog";
import { buildStayMetadata } from "@/lib/stays/seo";
import { STAY_IMAGE_TYPES, type StayProfile } from "@/lib/stays/types";
import { isUuid, slugify } from "@/lib/stays/validation";

export type Destination = { id: string; name: string };

// ---------- Basics ----------

export function BasicsTab({ stay, destinations }: { stay: StayProfile | null; destinations: Destination[] }) {
  const router = useRouter();
  const { state, run } = useSave();
  const [slugTouched, setSlugTouched] = useState(Boolean(stay));
  const [f, setF] = useState({
    name: stay?.name ?? "",
    slug: stay?.slug ?? "",
    destination_id: stay?.destination_id ?? "",
    property_type: stay?.property_type ?? "",
    short_description: stay?.short_description ?? "",
    description: stay?.description ?? "",
    address: stay?.address ?? "",
    is_featured: stay?.is_featured ?? false,
    price_per_night: stay?.price_per_night?.toString() ?? "",
  });
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    const result = await run(() => saveStayBasics(stay?.id ?? null, f));
    if (result && !stay) router.push(`/admin/stays/${result.id}?tab=media`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Basics" description="Who the stay is. The name and short description appear directly under the hero photo.">
        <TextField
          label="Stay name"
          value={f.name}
          required
          onChange={(name) => set({ name, ...(slugTouched ? {} : { slug: slugify(name) }) })}
        />
        <TextField
          label="Slug"
          value={f.slug}
          onChange={(slug) => {
            setSlugTouched(true);
            set({ slug });
          }}
          hint={<>Public URL: /stays/{slugify(f.slug) || "…"}</>}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="destination" className="text-sm font-medium text-navy">Destination</label>
            <select id="destination" value={f.destination_id} onChange={(e) => set({ destination_id: e.target.value })} className={`${inputClass} mt-1`}>
              <option value="">— None —</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <TextField label="Property type" value={f.property_type} onChange={(property_type) => set({ property_type })} list="property-types" placeholder="e.g. Boutique stay" />
          <datalist id="property-types">
            {PROPERTY_TYPES.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
        <TextField
          label="Short description"
          value={f.short_description}
          onChange={(short_description) => set({ short_description })}
          maxLength={140}
          hint={`${f.short_description.length}/140 · one line, e.g. "Mountain retreat above the clouds"`}
        />
        <TextField label="Full description" value={f.description} onChange={(description) => set({ description })} multiline rows={6} />
        <TextField label="Address" value={f.address} onChange={(address) => set({ address })} placeholder="e.g. Mashobra, Shimla" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Starting price / night (₹)"
            type="number"
            min={0}
            value={f.price_per_night}
            onChange={(price_per_night) => set({ price_per_night })}
            hint="Shown only until rooms with prices are added."
          />
        </div>
        <Toggle label="Show in Featured Stays" checked={f.is_featured} onChange={(is_featured) => set({ is_featured })} />
      </Panel>
      <SaveBar state={state} onSave={save} label={stay ? "Save basics" : "Create stay"} />
    </div>
  );
}

// ---------- Media ----------

export function MediaTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [cover, setCover] = useState<string | null>(stay.cover_image);
  const [images, setImages] = useState<ManagedImage[]>(() =>
    stay.gallery.map((g) => ({ id: isUuid(g.id) ? g.id : newId(), image_url: g.url, image_type: g.type, caption: g.caption }))
  );
  return (
    <div className="flex flex-col gap-6">
      <Panel title="Cover image" description="The hero photo guests see first. Use your most striking landscape or exterior shot.">
        <SingleImageField label="Cover image" value={cover} onChange={setCover} folder={`${stay.id}/cover`} hint="Max 3MB. Wide (landscape) photos work best." />
      </Panel>
      <Panel
        title="Gallery"
        description="Drag to reorder. Without story sections, the page alternates these photos with guest reviews; the first is used as the hero if there's no cover."
      >
        <ImageManager
          images={images}
          onChange={setImages}
          folder={`${stay.id}/gallery`}
          types={STAY_IMAGE_TYPES}
          primaryLabel="First image"
          withCaptions
        />
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStayMedia(stay.id, { cover_image: cover, images }))} label="Save media" />
    </div>
  );
}

// ---------- Amenities ----------

export function AmenitiesTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [amenities, setAmenities] = useState(() =>
    stay.amenities.map((a) => ({ ...a, id: isUuid(a.id) ? a.id : newId() }))
  );
  return (
    <div className="flex flex-col gap-6">
      <Panel title="Stay amenities" description="Property-wide facilities. Room-specific features (balcony, kettle…) belong on each room.">
        <AmenityPicker catalog={STAY_AMENITY_CATALOG} value={amenities} onChange={setAmenities} />
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStayAmenities(stay.id, { amenities }))} label={`Save ${amenities.length} amenities`} />
    </div>
  );
}

// ---------- SEO ----------

export function SeoTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [f, setF] = useState({ seo_title: stay.seo_title ?? "", seo_description: stay.seo_description ?? "", og_image: stay.og_image });
  const fallback = buildStayMetadata({ ...stay, seo_title: null, seo_description: null, og_image: null });
  const title = f.seo_title || `${fallback.title} | The Mountain Chapters`;
  const description = f.seo_description || fallback.description;
  return (
    <div className="flex flex-col gap-6">
      <Panel title="Search & sharing" description="Leave blank to use the stay name, short description and cover image.">
        <TextField
          label="SEO title"
          value={f.seo_title}
          onChange={(seo_title) => setF({ ...f, seo_title })}
          placeholder={fallback.title}
          hint={`${f.seo_title.length}/60 recommended`}
        />
        <TextField
          label="Meta description"
          value={f.seo_description}
          onChange={(seo_description) => setF({ ...f, seo_description })}
          placeholder={fallback.description}
          hint={`${f.seo_description.length}/160 recommended`}
        />
        <SingleImageField
          label="Social sharing image (OpenGraph)"
          value={f.og_image}
          onChange={(og_image) => setF({ ...f, og_image })}
          folder={`${stay.id}/seo`}
          hint="1200×630 works best. Falls back to the cover image."
        />
        <div className="rounded-2xl bg-cream-dark/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy/40">Search preview</p>
          <p className="mt-2 truncate text-lg text-[#1a0dab]">{title}</p>
          <p className="text-xs text-emerald-700">themountainchapters.com/stays/{stay.slug}</p>
          <p className="mt-1 line-clamp-2 text-sm text-navy/70">{description}</p>
        </div>
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStaySeo(stay.id, f))} label="Save SEO" />
    </div>
  );
}
