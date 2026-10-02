// Keep STAY_AMENITY_CATALOG in sync with the categorising backfill in
// supabase/migrations/20260930_stay_builder.sql.
export const STAY_AMENITY_CATALOG: Record<string, string[]> = {
  Essentials: ["Wi-Fi", "Parking", "Housekeeping", "Room service", "Reception"],
  "Food & Dining": ["Restaurant", "Breakfast", "Cafe", "Bar", "Room dining"],
  Outdoor: ["Garden", "Terrace", "Bonfire", "Mountain view", "Outdoor seating"],
  Wellness: ["Spa", "Gym", "Pool", "Sauna"],
  Family: ["Kids area", "Family rooms", "Children's activities"],
};

export const ROOM_AMENITY_CATALOG: Record<string, string[]> = {
  Comfort: ["King bed", "Twin beds", "Air conditioning", "Heating", "Fireplace", "Blackout curtains"],
  Views: ["Mountain view", "Valley view", "Forest view", "Private balcony", "Garden access"],
  Bathroom: ["Attached bathroom", "Hot water", "Bathtub", "Hair dryer", "Toiletries"],
  Tech: ["Smart TV", "Wi-Fi", "Work desk", "Charging points"],
  Extras: ["Electric kettle", "Mini fridge", "Breakfast included", "Wardrobe", "Safe"],
};

export const OTHER_CATEGORY = "Other";

/** Comparison key that treats "WiFi", "Wi-Fi" and "wi fi" as the same amenity. */
export function amenityKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function categoryFor(catalog: Record<string, string[]>, name: string): string {
  const key = amenityKey(name);
  for (const [cat, items] of Object.entries(catalog)) {
    if (items.some((i) => amenityKey(i) === key)) return cat;
  }
  return OTHER_CATEGORY;
}

export const PROPERTY_TYPES = [
  "Boutique stay", "Mountain retreat", "Homestay", "Cottage", "Resort", "Hotel", "Camp", "Villa",
];

export const TRAVELLER_TYPES = ["Couple", "Family", "Friends", "Solo", "Business"];
