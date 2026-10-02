-- Move the Stay Builder RLS helpers out of the PostgREST-exposed `public` schema so they
-- cannot be called via /rest/v1/rpc. RLS policies still need EXECUTE for anon/authenticated.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.stay_is_visible(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stays where id = sid and is_published);
$$;

create or replace function private.room_is_visible(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rooms r join public.stays s on s.id = r.stay_id
    where r.id = rid and r.is_active and s.is_published);
$$;

revoke all on function private.stay_is_visible(uuid), private.room_is_visible(uuid) from public;
grant execute on function private.stay_is_visible(uuid), private.room_is_visible(uuid) to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['stay_images','stay_amenities','stay_faqs','stay_policies','stay_nearby_places','stay_sections']
  loop
    execute format('drop policy if exists "%1$s_read" on public.%1$s', t);
    execute format(
      'create policy "%1$s_read" on public.%1$s for select using ((select public.is_admin()) or private.stay_is_visible(stay_id))', t);
  end loop;

  drop policy if exists "stay_reviews_read" on public.stay_reviews;
  create policy "stay_reviews_read" on public.stay_reviews
    for select using ((select public.is_admin()) or (is_active and private.stay_is_visible(stay_id)));

  drop policy if exists "rooms_read" on public.rooms;
  create policy "rooms_read" on public.rooms
    for select using ((select public.is_admin()) or (is_active and private.stay_is_visible(stay_id)));

  foreach t in array array['room_images','room_amenities','room_rate_plans']
  loop
    execute format('drop policy if exists "%1$s_read" on public.%1$s', t);
    execute format(
      'create policy "%1$s_read" on public.%1$s for select using ((select public.is_admin()) or private.room_is_visible(room_id))', t);
  end loop;
end $$;

drop function if exists public.stay_is_visible(uuid);
drop function if exists public.room_is_visible(uuid);

-- Listing stays by destination (getStaysByDestination) filters on this FK.
create index if not exists stays_destination_idx on public.stays(destination_id);
