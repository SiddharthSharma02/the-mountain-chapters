-- Stay Builder database tests: RLS, constraints and legacy backfill.
-- Runs in a single transaction and ALWAYS rolls back — safe against production.
-- Any failed assertion raises an exception whose message starts with "FAIL".
-- Run: paste into the Supabase SQL editor (or execute via the Supabase MCP).

begin;

-- ---------------------------------------------------------------------------
-- 1. Backfill of existing (pre-migration) stays
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select s.id, s.slug, s.images, s.amenities, s.is_published from public.stays s
           where s.slug not like 'dbtest-%'
  loop
    if not r.is_published then
      raise exception 'FAIL backfill: existing stay % became unpublished', r.slug;
    end if;
    if (select count(*) from public.stay_images i where i.stay_id = r.id)
       < (select count(*) from unnest(r.images) u where coalesce(u, '') <> '') then
      raise exception 'FAIL backfill: stay % is missing gallery rows', r.slug;
    end if;
    if (select count(*) from public.stay_amenities a where a.stay_id = r.id)
       < (select count(*) from unnest(r.amenities) u where trim(coalesce(u, '')) <> '') then
      raise exception 'FAIL backfill: stay % is missing amenity rows', r.slug;
    end if;
  end loop;
end $$;

-- The stays bucket enforces the same limits as the upload helper.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'stays' and public
                 and file_size_limit = 3145728 and 'image/*' = any(allowed_mime_types)) then
    raise exception 'FAIL storage: stays bucket must be public, 3MB, image/* only';
  end if;
  -- RLS helpers must not be callable through /rest/v1/rpc.
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname in ('stay_is_visible', 'room_is_visible')) then
    raise exception 'FAIL security: RLS helpers are exposed in the public schema';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Fixtures (inserted as the table owner, bypassing RLS)
-- ---------------------------------------------------------------------------
insert into public.stays (id, name, slug, is_published) values
  ('d0000000-0000-4000-8000-000000000001', 'DB test published', 'dbtest-published', true),
  ('d0000000-0000-4000-8000-000000000002', 'DB test draft', 'dbtest-draft', false);

insert into public.rooms (id, stay_id, name, slug, price_per_night, is_active) values
  ('d0000000-0000-4000-8000-000000000011', 'd0000000-0000-4000-8000-000000000001', 'Active', 'active', 5000, true),
  ('d0000000-0000-4000-8000-000000000012', 'd0000000-0000-4000-8000-000000000001', 'Inactive', 'inactive', 4000, false),
  ('d0000000-0000-4000-8000-000000000013', 'd0000000-0000-4000-8000-000000000002', 'Draft room', 'draft-room', 3000, true);

insert into public.room_images (room_id, image_url, image_type) values
  ('d0000000-0000-4000-8000-000000000011', 'https://x/1.jpg', 'room'),
  ('d0000000-0000-4000-8000-000000000012', 'https://x/2.jpg', 'room'),
  ('d0000000-0000-4000-8000-000000000013', 'https://x/3.jpg', 'room');

insert into public.room_rate_plans (room_id, name, price_per_night) values
  ('d0000000-0000-4000-8000-000000000011', 'Room only', 5000);

insert into public.stay_reviews (stay_id, reviewer_name, rating, review_text, is_active) values
  ('d0000000-0000-4000-8000-000000000001', 'Visible', 5, 'ok', true),
  ('d0000000-0000-4000-8000-000000000001', 'Hidden', 4, 'ok', false),
  ('d0000000-0000-4000-8000-000000000002', 'Draft review', 5, 'ok', true);

insert into public.stay_sections (stay_id, type, title, is_active) values
  ('d0000000-0000-4000-8000-000000000001', 'story', 'Visible section', true),
  ('d0000000-0000-4000-8000-000000000002', 'story', 'Draft section', true);

insert into public.stay_images (stay_id, image_url) values
  ('d0000000-0000-4000-8000-000000000002', 'https://x/draft.jpg');
insert into public.stay_amenities (stay_id, name) values
  ('d0000000-0000-4000-8000-000000000002', 'Draft amenity');
insert into public.stay_policies (stay_id, pets) values
  ('d0000000-0000-4000-8000-000000000002', 'Allowed');
insert into public.stay_faqs (stay_id, question, answer) values
  ('d0000000-0000-4000-8000-000000000002', 'Q', 'A');
insert into public.stay_nearby_places (stay_id, name) values
  ('d0000000-0000-4000-8000-000000000002', 'Draft place');

-- ---------------------------------------------------------------------------
-- 3. Constraints
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.room_images (room_id, image_url, image_type)
      values ('d0000000-0000-4000-8000-000000000011', 'https://x', 'selfie');
    raise exception 'FAIL constraint: invalid room image_type accepted';
  exception when check_violation then null; end;

  begin
    insert into public.stay_sections (stay_id, type) values ('d0000000-0000-4000-8000-000000000001', 'script');
    raise exception 'FAIL constraint: invalid section type accepted';
  exception when check_violation then null; end;

  begin
    insert into public.stay_reviews (stay_id, reviewer_name, rating, review_text)
      values ('d0000000-0000-4000-8000-000000000001', 'x', 0, 'x');
    raise exception 'FAIL constraint: rating 0 accepted';
  exception when check_violation then null; end;

  begin
    insert into public.rooms (stay_id, name, slug) values ('d0000000-0000-4000-8000-000000000001', 'Dup', 'active');
    raise exception 'FAIL constraint: duplicate room slug within a stay accepted';
  exception when unique_violation then null; end;

  begin
    update public.stays set latitude = 95 where id = 'd0000000-0000-4000-8000-000000000001';
    raise exception 'FAIL constraint: latitude out of range accepted';
  exception when check_violation then null; end;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Anonymous visitor
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

do $$
declare n int;
begin
  if exists (select 1 from public.stays where slug = 'dbtest-draft') then
    raise exception 'FAIL anon: can read an unpublished stay';
  end if;
  if not exists (select 1 from public.stays where slug = 'dbtest-published') then
    raise exception 'FAIL anon: cannot read a published stay';
  end if;
  select count(*) into n from public.rooms where stay_id = 'd0000000-0000-4000-8000-000000000001';
  if n <> 1 then raise exception 'FAIL anon: expected 1 active room, saw %', n; end if;
  if exists (select 1 from public.rooms where stay_id = 'd0000000-0000-4000-8000-000000000002') then
    raise exception 'FAIL anon: can read rooms of an unpublished stay';
  end if;
  select count(*) into n from public.room_images;
  if exists (select 1 from public.room_images where room_id in
      ('d0000000-0000-4000-8000-000000000012', 'd0000000-0000-4000-8000-000000000013')) then
    raise exception 'FAIL anon: can read images of inactive/unpublished rooms';
  end if;
  if not exists (select 1 from public.room_images where room_id = 'd0000000-0000-4000-8000-000000000011') then
    raise exception 'FAIL anon: cannot read images of an active room';
  end if;
  if not exists (select 1 from public.room_rate_plans where room_id = 'd0000000-0000-4000-8000-000000000011') then
    raise exception 'FAIL anon: cannot read rate plans of an active room';
  end if;
  if exists (select 1 from public.stay_reviews where reviewer_name in ('Hidden', 'Draft review')) then
    raise exception 'FAIL anon: can read inactive or unpublished reviews';
  end if;
  if not exists (select 1 from public.stay_reviews where reviewer_name = 'Visible') then
    raise exception 'FAIL anon: cannot read an active review';
  end if;
  if exists (select 1 from public.stay_sections where title = 'Draft section')
     or exists (select 1 from public.stay_images where image_url = 'https://x/draft.jpg')
     or exists (select 1 from public.stay_amenities where name = 'Draft amenity')
     or exists (select 1 from public.stay_policies where stay_id = 'd0000000-0000-4000-8000-000000000002')
     or exists (select 1 from public.stay_faqs where stay_id = 'd0000000-0000-4000-8000-000000000002')
     or exists (select 1 from public.stay_nearby_places where name = 'Draft place') then
    raise exception 'FAIL anon: can read children of an unpublished stay';
  end if;
  if not exists (select 1 from public.stay_sections where title = 'Visible section') then
    raise exception 'FAIL anon: cannot read sections of a published stay';
  end if;

  begin
    insert into public.rooms (stay_id, name, slug) values ('d0000000-0000-4000-8000-000000000001', 'x', 'anon-x');
    raise exception 'FAIL anon: inserted a room';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.stay_reviews (stay_id, reviewer_name, rating, review_text)
      values ('d0000000-0000-4000-8000-000000000001', 'Fake', 5, 'fake');
    raise exception 'FAIL anon: inserted a review';
  exception when insufficient_privilege then null; end;

  update public.stays set name = 'hacked' where id = 'd0000000-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL anon: updated a stay'; end if;
  delete from public.rooms where id = 'd0000000-0000-4000-8000-000000000011';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL anon: deleted a room'; end if;
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- 5. Signed-in non-admin
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-0000000000ff","role":"authenticated"}', true);
set local role authenticated;

do $$
declare n int;
begin
  if public.is_admin() then raise exception 'FAIL user: random user is admin'; end if;
  if exists (select 1 from public.stays where slug = 'dbtest-draft') then
    raise exception 'FAIL user: can read an unpublished stay';
  end if;
  begin
    insert into public.stay_sections (stay_id, type, title)
      values ('d0000000-0000-4000-8000-000000000001', 'story', 'x');
    raise exception 'FAIL user: inserted a section';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.stays (name, slug) values ('x', 'dbtest-user-x');
    raise exception 'FAIL user: inserted a stay';
  exception when insufficient_privilege then null; end;
  update public.rooms set price_per_night = 1 where id = 'd0000000-0000-4000-8000-000000000011';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL user: updated a room price'; end if;
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- 6. Admin (an existing profiles.role = 'admin' user)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', (select id from public.profiles where role = 'admin' order by created_at limit 1),
                    'role', 'authenticated')::text, true);
set local role authenticated;

do $$
declare n int;
begin
  if not public.is_admin() then raise exception 'FAIL admin: is_admin() is false for an admin'; end if;
  if not exists (select 1 from public.stays where slug = 'dbtest-draft') then
    raise exception 'FAIL admin: cannot read an unpublished stay (preview needs this)';
  end if;
  select count(*) into n from public.rooms where stay_id = 'd0000000-0000-4000-8000-000000000001';
  if n <> 2 then raise exception 'FAIL admin: expected to see inactive rooms too, saw %', n; end if;
  if not exists (select 1 from public.stay_reviews where reviewer_name = 'Hidden') then
    raise exception 'FAIL admin: cannot read inactive reviews';
  end if;

  insert into public.rooms (id, stay_id, name, slug)
    values ('d0000000-0000-4000-8000-000000000014', 'd0000000-0000-4000-8000-000000000002', 'Admin room', 'admin-room');
  insert into public.room_images (room_id, image_url) values ('d0000000-0000-4000-8000-000000000014', 'https://x/a.jpg');
  insert into public.room_amenities (room_id, name) values ('d0000000-0000-4000-8000-000000000014', 'Heating');
  insert into public.room_rate_plans (room_id, name) values ('d0000000-0000-4000-8000-000000000014', 'Breakfast');
  insert into public.stay_sections (stay_id, type, title) values ('d0000000-0000-4000-8000-000000000002', 'quote', 'Hi');
  insert into public.stay_reviews (stay_id, reviewer_name, rating, review_text)
    values ('d0000000-0000-4000-8000-000000000002', 'Real guest', 5, 'Lovely');
  insert into public.stay_policies (stay_id, pets) values ('d0000000-0000-4000-8000-000000000001', 'No')
    on conflict (stay_id) do update set pets = excluded.pets;

  update public.rooms set sort_order = 5 where id = 'd0000000-0000-4000-8000-000000000011';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL admin: could not reorder a room'; end if;

  update public.stays set is_published = true where id = 'd0000000-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL admin: could not publish a stay'; end if;

  -- Deleting a room cascades to its images/amenities/plans and nulls review/section links.
  delete from public.rooms where id = 'd0000000-0000-4000-8000-000000000014';
  if exists (select 1 from public.room_images where room_id = 'd0000000-0000-4000-8000-000000000014')
     or exists (select 1 from public.room_amenities where room_id = 'd0000000-0000-4000-8000-000000000014')
     or exists (select 1 from public.room_rate_plans where room_id = 'd0000000-0000-4000-8000-000000000014') then
    raise exception 'FAIL admin: room delete did not cascade';
  end if;

  -- Deleting a stay cascades to every child table.
  delete from public.stays where id = 'd0000000-0000-4000-8000-000000000002';
  if exists (select 1 from public.rooms where stay_id = 'd0000000-0000-4000-8000-000000000002')
     or exists (select 1 from public.stay_sections where stay_id = 'd0000000-0000-4000-8000-000000000002')
     or exists (select 1 from public.stay_reviews where stay_id = 'd0000000-0000-4000-8000-000000000002') then
    raise exception 'FAIL admin: stay delete did not cascade';
  end if;
end $$;

reset role;
rollback;

select 'ALL STAY BUILDER DB TESTS PASSED' as result;
