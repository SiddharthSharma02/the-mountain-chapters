export interface BookingCtaState {
  visible: boolean;
  label: "View rooms" | "Check availability";
  action: "rooms" | "enquire";
}

/**
 * Sticky CTA: hidden on the hero, then guides the guest to rooms first and to an
 * availability enquiry once they have seen them. There is no booking engine yet,
 * so "Check availability" is an enquiry, never a claim that dates are free.
 */
export function bookingCta(s: { pastHero: boolean; reachedRooms: boolean; hasRooms: boolean }): BookingCtaState {
  if (s.hasRooms && !s.reachedRooms) {
    return { visible: s.pastHero, label: "View rooms", action: "rooms" };
  }
  return { visible: s.pastHero, label: "Check availability", action: "enquire" };
}

export function enquiryHref(staySlug: string, roomSlug?: string): string {
  const params = new URLSearchParams({ stay: staySlug });
  if (roomSlug) params.set("room", roomSlug);
  return `/contact?${params.toString()}`;
}
