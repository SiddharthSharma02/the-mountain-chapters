/** "15:00" → "3:00 PM". Free text (e.g. "Flexible") is shown as entered. */
export function formatTime(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(v);
  if (!m) return v;
  const h = Number(m[1]);
  if (h > 23) return v;
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

export function roomFacts(room: {
  bed_type: string | null;
  room_size: string | null;
  max_guests: number | null;
}): string[] {
  const facts: string[] = [];
  if (room.bed_type) facts.push(room.bed_type);
  if (room.room_size) facts.push(room.room_size);
  if (room.max_guests) facts.push(`${room.max_guests} ${room.max_guests === 1 ? "guest" : "guests"}`);
  return facts;
}

export function stayedOn(date: string | null): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return null;
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return `Stayed in ${d.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}`;
}

export function formatDistance(km: number | null): string | null {
  if (km === null || km === undefined) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
}

export function googleMapsPlaceUrl({
  name,
  address,
  googlePlaceId,
  latitude,
  longitude,
}: {
  name: string;
  address?: string | null;
  googlePlaceId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  const query = address?.trim()
    ? `${name}, ${address.trim()}`
    : latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined
      ? `${latitude},${longitude}`
      : name;
  const params = new URLSearchParams({ api: "1", query });
  if (googlePlaceId?.trim()) params.set("query_place_id", googlePlaceId.trim());
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/** Word-boundary truncation for meta descriptions. */
export function truncate(text: string | null | undefined, max: number): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
