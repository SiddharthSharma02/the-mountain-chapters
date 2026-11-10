-- Stop signed-in users from making themselves admins.
--
-- The profiles policies let a user update (and insert) their own row, and nothing
-- stopped them setting role = 'admin' from the browser with the public anon key.
-- This trigger only lets an existing admin change a role. The service role and the
-- SQL Editor (postgres) are not affected, so promoting the first admin still works:
--   update public.profiles set role = 'admin' where id = '<auth-user-id>';

create schema if not exists private;

create or replace function private.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only requests from the website (anon / authenticated) are restricted.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role is distinct from 'user' and not public.is_admin() then
      raise exception 'Only admins can set a profile role.' using errcode = '42501';
    end if;
  elsif new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change a profile role.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_profile_role() from public;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before insert or update on public.profiles
  for each row execute function private.guard_profile_role();
