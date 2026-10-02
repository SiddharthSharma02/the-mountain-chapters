-- =========================================================
-- The Mountain Chapters — Initial Schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New Query)
-- =========================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Profiles (role-based access) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Destinations ----------
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  state text,
  tagline text,
  description text,
  cover_image text,
  is_popular boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Stays ----------
create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  address text,
  price_per_night numeric(10,2),
  rating numeric(2,1) default 0,
  review_count int default 0,
  cover_image text,
  images text[] default '{}',
  amenities text[] default '{}',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Experiences ----------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  icon text,
  cover_image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Road Trip Chapters ----------
create table if not exists public.road_trip_chapters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  step_number int not null default 0,
  cover_image text,
  distance_km numeric(6,1),
  duration_days int,
  route jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Travel Stories (customer-submitted) ----------
create table if not exists public.travel_stories (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_email text,
  title text not null,
  slug text unique,
  content text not null,
  cover_image text,
  images text[] default '{}',
  destination_id uuid references public.destinations(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Gallery ----------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Map Routes ("Map Your Chapter") ----------
create table if not exists public.map_routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  points jsonb default '[]',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Newsletter Subscribers ----------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- ---------- Contact Messages ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.stays enable row level security;
alter table public.experiences enable row level security;
alter table public.road_trip_chapters enable row level security;
alter table public.travel_stories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.map_routes enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles: users read/update own row; admins manage all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

-- Public read-only content: destinations, stays, experiences, road_trip_chapters, gallery_images, map_routes
create policy "destinations_public_read" on public.destinations for select using (true);
create policy "destinations_admin_write" on public.destinations for insert with check (public.is_admin());
create policy "destinations_admin_update" on public.destinations for update using (public.is_admin());
create policy "destinations_admin_delete" on public.destinations for delete using (public.is_admin());

create policy "stays_public_read" on public.stays for select using (true);
create policy "stays_admin_write" on public.stays for insert with check (public.is_admin());
create policy "stays_admin_update" on public.stays for update using (public.is_admin());
create policy "stays_admin_delete" on public.stays for delete using (public.is_admin());

create policy "experiences_public_read" on public.experiences for select using (true);
create policy "experiences_admin_write" on public.experiences for insert with check (public.is_admin());
create policy "experiences_admin_update" on public.experiences for update using (public.is_admin());
create policy "experiences_admin_delete" on public.experiences for delete using (public.is_admin());

create policy "road_trip_chapters_public_read" on public.road_trip_chapters for select using (true);
create policy "road_trip_chapters_admin_write" on public.road_trip_chapters for insert with check (public.is_admin());
create policy "road_trip_chapters_admin_update" on public.road_trip_chapters for update using (public.is_admin());
create policy "road_trip_chapters_admin_delete" on public.road_trip_chapters for delete using (public.is_admin());

create policy "gallery_images_public_read" on public.gallery_images for select using (true);
create policy "gallery_images_admin_write" on public.gallery_images for insert with check (public.is_admin());
create policy "gallery_images_admin_update" on public.gallery_images for update using (public.is_admin());
create policy "gallery_images_admin_delete" on public.gallery_images for delete using (public.is_admin());

create policy "map_routes_public_read" on public.map_routes for select using (true);
create policy "map_routes_admin_write" on public.map_routes for insert with check (public.is_admin());
create policy "map_routes_admin_update" on public.map_routes for update using (public.is_admin());
create policy "map_routes_admin_delete" on public.map_routes for delete using (public.is_admin());

-- Travel stories: public can read approved; authenticated users can submit their own (pending); admins manage all
create policy "travel_stories_public_read_approved" on public.travel_stories
  for select using (status = 'approved' or submitted_by = auth.uid() or public.is_admin());
create policy "travel_stories_authenticated_insert" on public.travel_stories
  for insert with check (auth.uid() is not null and (submitted_by = auth.uid() or public.is_admin()));
create policy "travel_stories_owner_or_admin_update" on public.travel_stories
  for update using (submitted_by = auth.uid() or public.is_admin());
create policy "travel_stories_admin_delete" on public.travel_stories
  for delete using (public.is_admin());

-- Newsletter subscribers: anyone can subscribe (insert); only admins can read/manage
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select using (public.is_admin());
create policy "newsletter_admin_delete" on public.newsletter_subscribers
  for delete using (public.is_admin());

-- Contact messages: anyone can send (insert); only admins can read/manage
create policy "contact_public_insert" on public.contact_messages
  for insert with check (true);
create policy "contact_admin_read" on public.contact_messages
  for select using (public.is_admin());
create policy "contact_admin_update" on public.contact_messages
  for update using (public.is_admin());
create policy "contact_admin_delete" on public.contact_messages
  for delete using (public.is_admin());

-- =========================================================
-- Storage buckets for images
-- =========================================================
insert into storage.buckets (id, name, public)
values
  ('destinations', 'destinations', true),
  ('stays', 'stays', true),
  ('experiences', 'experiences', true),
  ('road-trips', 'road-trips', true),
  ('stories', 'stories', true),
  ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "public_read_travel_buckets" on storage.objects
  for select using (bucket_id in ('destinations', 'stays', 'experiences', 'road-trips', 'stories', 'gallery'));

create policy "authenticated_upload_stories_bucket" on storage.objects
  for insert with check (bucket_id = 'stories' and auth.uid() is not null);

create policy "admin_manage_travel_buckets" on storage.objects
  for all using (
    bucket_id in ('destinations', 'stays', 'experiences', 'road-trips', 'gallery')
    and public.is_admin()
  ) with check (
    bucket_id in ('destinations', 'stays', 'experiences', 'road-trips', 'gallery')
    and public.is_admin()
  );

-- =========================================================
-- Done. To make yourself an admin after signing up, run:
--   update public.profiles set role = 'admin' where id = '<your-auth-user-id>';
-- =========================================================
