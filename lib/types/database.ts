export type ProfileRole = "user" | "admin";
export type StoryStatus = "pending" | "approved" | "rejected";
export type MessageStatus = "new" | "read" | "archived";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  tagline: string | null;
  description: string | null;
  cover_image: string | null;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Stay {
  id: string;
  destination_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  price_per_night: number | null;
  rating: number;
  review_count: number;
  cover_image: string | null;
  images: string[];
  amenities: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  /** Joined from destinations table — present when fetched with `*, destinations(...)`. */
  destinations?: { name: string | null; state: string | null } | null;
}

export interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  cover_image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoutePoint {
  name: string;
  lat?: number;
  lng?: number;
}

export interface RoadTripChapter {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  step_number: number;
  cover_image: string | null;
  distance_km: number | null;
  duration_days: number | null;
  route: RoutePoint[];
  created_at: string;
  updated_at: string;
}

export interface TravelStory {
  id: string;
  submitted_by: string | null;
  author_name: string;
  author_email: string | null;
  title: string;
  slug: string | null;
  content: string;
  cover_image: string | null;
  images: string[];
  destination_id: string | null;
  status: StoryStatus;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export interface MapRoute {
  id: string;
  name: string;
  description: string | null;
  points: RoutePoint[];
  sort_order: number;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      destinations: {
        Row: Destination;
        Insert: Partial<Destination> & { name: string; slug: string };
        Update: Partial<Destination>;
        Relationships: [];
      };
      stays: {
        Row: Stay;
        Insert: Partial<Stay> & { name: string; slug: string };
        Update: Partial<Stay>;
        Relationships: [];
      };
      experiences: {
        Row: Experience;
        Insert: Partial<Experience> & { title: string; slug: string };
        Update: Partial<Experience>;
        Relationships: [];
      };
      road_trip_chapters: {
        Row: RoadTripChapter;
        Insert: Partial<RoadTripChapter> & { title: string; slug: string };
        Update: Partial<RoadTripChapter>;
        Relationships: [];
      };
      travel_stories: {
        Row: TravelStory;
        Insert: Partial<TravelStory> & {
          author_name: string;
          title: string;
          content: string;
        };
        Update: Partial<TravelStory>;
        Relationships: [];
      };
      gallery_images: {
        Row: GalleryImage;
        Insert: Partial<GalleryImage> & { image_url: string };
        Update: Partial<GalleryImage>;
        Relationships: [];
      };
      map_routes: {
        Row: MapRoute;
        Insert: Partial<MapRoute> & { name: string };
        Update: Partial<MapRoute>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Partial<NewsletterSubscriber> & { email: string };
        Update: Partial<NewsletterSubscriber>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Partial<ContactMessage> & {
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<ContactMessage>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
