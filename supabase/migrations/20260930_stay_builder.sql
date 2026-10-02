-- Stay Builder: relational stay profile (rooms, amenities, story, reviews, policies).
--
-- Additive and idempotent — safe to re-run. Existing stays keep working:
--   * stays.images / amenities / price_per_night / cover_image / rating / review_count are kept
--     and remain the fallbacks for stays that have not been rebuilt yet.
--   * Existing stays default to is_published = true, so nothing disappears.
--   * stays.images and stays.amenities are backfilled into stay_images / stay_amenities.
-- Tests: supabase/tests/stay_builder.test.sql

-- ---------- stays: new columns ----------
alter table public.stays
  add column if not exists short_description text,
  add column if not exists property_type text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists check_in_time text,
  add column if not exists check_out_time text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_image text,
  add column if not exists is_published boolean not null default true;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stays_latitude_range') then
    alter table public.stays add constraint stays_latitude_range check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'stays_longitude_range') then
    alter table public.stays add constraint stays_longitude_range check (longitude is null or longitude between -180 and 180);
  end if;
end $$;

-- ---------- child tables ----------
create table if not exists public.stay_images (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  image_url text not null,
  image_type text not null default 'other'
    check (image_type in ('exterior','interior','view','room','bathroom','balcony','dining','experience','other')),
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.stay_amenities (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  icon text,
  sort_order int not null default 0
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  price_per_night numeric(10,2) check (price_per_night is null or price_per_night >= 0),
  original_price numeric(10,2) check (original_price is null or original_price >= 0),
  max_guests int check (max_guests is null or max_guests between 1 and 50),
  bed_type text,
  room_size text,
  view text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stay_id, slug)
);

create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  image_url text not null,
  image_type text not null default 'room'
    check (image_type in ('room','bathroom','balcony','view','interior','exterior','other')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.room_amenities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  icon text,
  sort_order int not null default 0
);

-- Future-proofing: the public page only exposes the base room price until a
-- booking engine can honour multiple rates.
create table if not exists public.room_rate_plans (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  price_per_night numeric(10,2) check (price_per_night is null or price_per_night >= 0),
  meal_plan text,
  cancellation_policy text,
  payment_policy text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.stay_reviews (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  reviewer_name text not null,
  rating numeric(2,1) not null check (rating between 1 and 5),
  review_text text not null,
  traveller_type text,
  stayed_on date,
  reviewer_image text,
  guest_photo text,
  cleanliness_rating numeric(2,1) check (cleanliness_rating is null or cleanliness_rating between 1 and 5),
  location_rating numeric(2,1) check (location_rating is null or location_rating between 1 and 5),
  hospitality_rating numeric(2,1) check (hospitality_rating is null or hospitality_rating between 1 and 5),
  facilities_rating numeric(2,1) check (facilities_rating is null or facilities_rating between 1 and 5),
  value_rating numeric(2,1) check (value_rating is null or value_rating between 1 and 5),
  is_highlight boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.stay_sections (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  type text not null check (type in
    ('image','story','quote','review','room','gallery','experience','amenities','location')),
  title text,
  subtitle text,
  body text,
  image_url text,
  review_id uuid references public.stay_reviews(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.stay_faqs (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

create table if not exists public.stay_policies (
  stay_id uuid primary key references public.stays(id) on delete cascade,
  pets text,
  smoking text,
  children text,
  cancellation_policy text,
  extra_rules text
);

create table if not exists public.stay_nearby_places (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete cascade,
  name text not null,
  distance_km numeric(6,1) check (distance_km is null or distance_km >= 0),
  sort_order int not null default 0
);

create index if not exists stay_images_stay_idx on public.stay_images(stay_id, sort_order);
create index if not exists stay_amenities_stay_idx on public.stay_amenities(stay_id, sort_order);
create index if not exists rooms_stay_idx on public.rooms(stay_id, sort_order);
create index if not exists room_images_room_idx on public.room_images(room_id, sort_order);
create index if not exists room_amenities_room_idx on public.room_amenities(room_id, sort_order);
create index if not exists room_rate_plans_room_idx on public.room_rate_plans(room_id, sort_order);
create index if not exists stay_reviews_stay_idx on public.stay_reviews(stay_id, sort_order);
create index if not exists stay_reviews_room_idx on public.stay_reviews(room_id);
create index if not exists stay_sections_stay_idx on public.stay_sections(stay_id, sort_order);
create index if not exists stay_sections_review_idx on public.stay_sections(review_id);
create index if not exists stay_sections_room_idx on public.stay_sections(room_id);
create index if not exists stay_faqs_stay_idx on public.stay_faqs(stay_id, sort_order);
create index if not exists stay_nearby_stay_idx on public.stay_nearby_places(stay_id, sort_order);

-- ---------- visibility helpers ----------
-- SECURITY DEFINER so child-table policies can check the parent without recursive RLS.
create or replace function public.stay_is_visible(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stays where id = sid and is_published);
$$;

create or replace function public.room_is_visible(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rooms r join public.stays s on s.id = r.stay_id
    where r.id = rid and r.is_active and s.is_published);
$$;

-- ---------- grants (RLS below decides which rows) ----------
grant select on public.stay_images, public.stay_amenities, public.rooms, public.room_images,
  public.room_amenities, public.room_rate_plans, public.stay_reviews, public.stay_sections,
  public.stay_faqs, public.stay_policies, public.stay_nearby_places to anon, authenticated;
grant insert, update, delete on public.stay_images, public.stay_amenities, public.rooms, public.room_images,
  public.room_amenities, public.room_rate_plans, public.stay_reviews, public.stay_sections,
  public.stay_faqs, public.stay_policies, public.stay_nearby_places to authenticated;

-- ---------- RLS ----------
alter table public.stay_images enable row level security;
alter table public.stay_amenities enable row level security;
alter table public.rooms enable row level security;
alter table public.room_images enable row level security;
alter table public.room_amenities enable row level security;
alter table public.room_rate_plans enable row level security;
alter table public.stay_reviews enable row level security;
alter table public.stay_sections enable row level security;
alter table public.stay_faqs enable row level security;
alter table public.stay_policies enable row level security;
alter table public.stay_nearby_places enable row level security;

-- stays: public reads published only; admins read everything (for the builder and preview).
drop policy if exists "stays_public_read" on public.stays;
create policy "stays_public_read" on public.stays
  for select using (is_published or (select public.is_admin()));

do $$
declare t text;
begin
  foreach t in array array['stay_images','stay_amenities','stay_faqs','stay_policies','stay_nearby_places','stay_sections']
  loop
    execute format('drop policy if exists "%1$s_read" on public.%1$s', t);
    execute format(
      'create policy "%1$s_read" on public.%1$s for select using ((select public.is_admin()) or public.stay_is_visible(stay_id))', t);
  end loop;

  drop policy if exists "stay_reviews_read" on public.stay_reviews;
  create policy "stay_reviews_read" on public.stay_reviews
    for select using ((select public.is_admin()) or (is_active and public.stay_is_visible(stay_id)));

  drop policy if exists "rooms_read" on public.rooms;
  create policy "rooms_read" on public.rooms
    for select using ((select public.is_admin()) or (is_active and public.stay_is_visible(stay_id)));

  foreach t in array array['room_images','room_amenities','room_rate_plans']
  loop
    execute format('drop policy if exists "%1$s_read" on public.%1$s', t);
    execute format(
      'create policy "%1$s_read" on public.%1$s for select using ((select public.is_admin()) or public.room_is_visible(room_id))', t);
  end loop;

  foreach t in array array['stay_images','stay_amenities','rooms','room_images','room_amenities',
    'room_rate_plans','stay_reviews','stay_sections','stay_faqs','stay_policies','stay_nearby_places']
  loop
    execute format('drop policy if exists "%1$s_admin_insert" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_admin_update" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_admin_delete" on public.%1$s', t);
    execute format('create policy "%1$s_admin_insert" on public.%1$s for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy "%1$s_admin_update" on public.%1$s for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy "%1$s_admin_delete" on public.%1$s for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end $$;

-- ---------- storage: stays bucket enforces the upload helper's limits ----------
update storage.buckets
  set file_size_limit = 3145728, allowed_mime_types = array['image/*']
  where id = 'stays';

-- ---------- backfill existing stays (only where nothing exists yet) ----------
insert into public.stay_images (stay_id, image_url, image_type, sort_order)
select s.id, u.url, 'other', u.ord - 1
from public.stays s, unnest(s.images) with ordinality as u(url, ord)
where coalesce(u.url, '') <> ''
  and not exists (select 1 from public.stay_images i where i.stay_id = s.id);

-- Legacy amenities are de-duplicated case-insensitively and categorised against the
-- same catalog the admin picker uses (lib/stays/amenity-catalog.ts).
insert into public.stay_amenities (stay_id, name, category, sort_order)
select stay_id, name,
  case regexp_replace(lower(name), '[^a-z0-9]', '', 'g')
    when 'wifi' then 'Essentials' when 'parking' then 'Essentials' when 'housekeeping' then 'Essentials'
    when 'roomservice' then 'Essentials' when 'reception' then 'Essentials'
    when 'restaurant' then 'Food & Dining' when 'breakfast' then 'Food & Dining' when 'cafe' then 'Food & Dining'
    when 'bar' then 'Food & Dining' when 'roomdining' then 'Food & Dining'
    when 'garden' then 'Outdoor' when 'terrace' then 'Outdoor' when 'bonfire' then 'Outdoor'
    when 'mountainview' then 'Outdoor' when 'outdoorseating' then 'Outdoor'
    when 'spa' then 'Wellness' when 'gym' then 'Wellness' when 'pool' then 'Wellness' when 'sauna' then 'Wellness'
    when 'kidsarea' then 'Family' when 'familyrooms' then 'Family' when 'childrensactivities' then 'Family'
    else 'Other'
  end,
  row_number() over (partition by stay_id order by ord) - 1
from (
  select distinct on (s.id, lower(trim(u.name))) s.id as stay_id, trim(u.name) as name, u.ord
  from public.stays s, unnest(s.amenities) with ordinality as u(name, ord)
  where trim(coalesce(u.name, '')) <> ''
    and not exists (select 1 from public.stay_amenities a where a.stay_id = s.id)
  order by s.id, lower(trim(u.name)), u.ord
) d;
