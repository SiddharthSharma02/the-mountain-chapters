"use client";

import { useState } from "react";
import { SortableList } from "@/components/admin/stays/sortable-list";
import { Panel, SaveBar, TextField, newId, useSave } from "@/components/admin/stays/builder-ui";
import { saveStayLocation, saveStayPolicies } from "@/lib/actions/admin-stay-builder";
import { googleMapsPlaceUrl } from "@/lib/stays/format";
import { parseCoordinates } from "@/lib/stays/validation";
import type { StayProfile } from "@/lib/stays/types";

// ---------- Location ----------

export function LocationTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [lat, setLat] = useState(stay.latitude?.toString() ?? "");
  const [lng, setLng] = useState(stay.longitude?.toString() ?? "");
  const [googlePlaceId, setGooglePlaceId] = useState(stay.google_place_id ?? "");
  const [pasted, setPasted] = useState("");
  const [places, setPlaces] = useState(() =>
    stay.nearby.map((n) => ({ id: n.id, name: n.name, distance_km: n.distance_km?.toString() ?? "" }))
  );
  const coords = parseCoordinates(lat, lng);
  const valid = coords.ok && coords.value.latitude !== null ? coords.value : null;
  const d = 0.03;
  const googleMapsUrl = googlePlaceId.trim()
    ? googleMapsPlaceUrl({ name: stay.name, address: stay.address, googlePlaceId })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Map & coordinates" description="In Google Maps, right-click the property and click the coordinates to copy them, then paste below. The address is edited in Basics.">
        <TextField
          label="Paste coordinates"
          value={pasted}
          placeholder="31.1048, 77.1734"
          hint="Fills latitude and longitude below."
          onChange={(v) => {
            setPasted(v);
            const m = v.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
            if (m) {
              setLat(m[1]);
              setLng(m[2]);
            }
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Latitude" type="number" step="any" value={lat} onChange={setLat} />
          <TextField label="Longitude" type="number" step="any" value={lng} onChange={setLng} />
        </div>
        {!coords.ok && <p role="alert" className="text-sm text-red-600">{coords.error}</p>}
        {valid && (
          <iframe
            title="Map preview"
            className="aspect-[16/9] w-full rounded-2xl border border-navy/10"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${valid.longitude! - d},${valid.latitude! - d},${valid.longitude! + d},${valid.latitude! + d}&layer=mapnik&marker=${valid.latitude},${valid.longitude}`}
          />
        )}
        <TextField
          label="Google Place ID"
          value={googlePlaceId}
          onChange={setGooglePlaceId}
          placeholder="ChIJ…"
          hint="Optional. Adds a direct Google Maps link without using a Google API."
        />
        {googleMapsUrl && (
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="self-start text-sm font-semibold text-gold-dark hover:text-gold">
            Test Google Maps link ↗
          </a>
        )}
      </Panel>

      <Panel title="Nearby places" description="Real distances to landmarks, stations and airports.">
        {places.length > 0 && (
          <SortableList items={places} onReorder={setPlaces} getKey={(p) => p.id} label={(p, i) => p.name || `place ${i + 1}`}>
            {(p) => (
              <div className="grid grid-cols-[1fr_6rem_auto] items-end gap-3">
                <TextField label="Place" value={p.name} onChange={(name) => setPlaces((all) => all.map((x) => (x.id === p.id ? { ...x, name } : x)))} placeholder="Shimla Mall Road" />
                <TextField label="km" type="number" min={0} step={0.1} value={p.distance_km} onChange={(distance_km) => setPlaces((all) => all.map((x) => (x.id === p.id ? { ...x, distance_km } : x)))} />
                <button type="button" aria-label={`Remove ${p.name || "place"}`} onClick={() => setPlaces((all) => all.filter((x) => x.id !== p.id))} className="mb-2 h-9 w-9 rounded-full text-red-600 hover:bg-red-50">
                  ✕
                </button>
              </div>
            )}
          </SortableList>
        )}
        <button
          type="button"
          onClick={() => setPlaces((all) => [...all, { id: newId(), name: "", distance_km: "" }])}
          className="self-start rounded-full px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy"
        >
          + Add place
        </button>
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStayLocation(stay.id, { latitude: lat, longitude: lng, google_place_id: googlePlaceId, places }))} label="Save location" />
    </div>
  );
}

// ---------- Policies + FAQ ----------

export function PoliciesTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const p = stay.policies;
  const [f, setF] = useState({
    check_in_time: stay.check_in_time ?? "",
    check_out_time: stay.check_out_time ?? "",
    pets: p?.pets ?? "",
    smoking: p?.smoking ?? "",
    children: p?.children ?? "",
    cancellation_policy: p?.cancellation_policy ?? "",
    extra_rules: p?.extra_rules ?? "",
  });
  const [faqs, setFaqs] = useState(() => stay.faqs.map(({ id, question, answer }) => ({ id, question, answer })));
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Property rules" description="Leave any field blank to hide it.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Check-in" type="time" value={f.check_in_time} onChange={(check_in_time) => set({ check_in_time })} />
          <TextField label="Check-out" type="time" value={f.check_out_time} onChange={(check_out_time) => set({ check_out_time })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Pets" value={f.pets} onChange={(pets) => set({ pets })} list="opt-pets" placeholder="Allowed" />
          <TextField label="Smoking" value={f.smoking} onChange={(smoking) => set({ smoking })} list="opt-smoking" placeholder="Not permitted" />
          <TextField label="Children" value={f.children} onChange={(children) => set({ children })} list="opt-children" placeholder="Welcome" />
        </div>
        <datalist id="opt-pets"><option value="Allowed" /><option value="Not allowed" /><option value="On request" /></datalist>
        <datalist id="opt-smoking"><option value="Not permitted" /><option value="Outdoors only" /><option value="Allowed" /></datalist>
        <datalist id="opt-children"><option value="Welcome" /><option value="Ages 12+" /><option value="Not suitable" /></datalist>
        <TextField label="Cancellation policy" value={f.cancellation_policy} onChange={(cancellation_policy) => set({ cancellation_policy })} multiline rows={3} />
        <TextField label="Other house rules" value={f.extra_rules} onChange={(extra_rules) => set({ extra_rules })} multiline rows={3} />
      </Panel>

      <Panel title="FAQ">
        {faqs.length > 0 && (
          <SortableList items={faqs} onReorder={setFaqs} getKey={(q) => q.id} label={(q, i) => q.question || `question ${i + 1}`}>
            {(q) => (
              <div className="flex flex-col gap-3">
                <TextField label="Question" value={q.question} onChange={(question) => setFaqs((all) => all.map((x) => (x.id === q.id ? { ...x, question } : x)))} />
                <TextField label="Answer" value={q.answer} multiline rows={2} onChange={(answer) => setFaqs((all) => all.map((x) => (x.id === q.id ? { ...x, answer } : x)))} />
                <button type="button" onClick={() => setFaqs((all) => all.filter((x) => x.id !== q.id))} className="self-end text-sm font-medium text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
            )}
          </SortableList>
        )}
        <button
          type="button"
          onClick={() => setFaqs((all) => [...all, { id: newId(), question: "", answer: "" }])}
          className="self-start rounded-full px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy"
        >
          + Add question
        </button>
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStayPolicies(stay.id, { ...f, faqs }))} label="Save rules & FAQ" />
    </div>
  );
}
