-- Migration: auto-create public.profiles from auth.users sign-ups

create extension if not exists "pgcrypto";

create or replace function public.create_profile_from_auth()
returns trigger
language plpgsql
security definer
as $$
declare
  user_metadata jsonb := coalesce(new.user_metadata, '{}'::jsonb);
  username text := null;
begin
  if exists (select 1 from public.profiles p where p.id = new.id) then
    return new;
  end if;

  username := user_metadata ->> 'username';
  if username is null or username = '' then
    username := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, username, full_name, created_at, updated_at)
  values (
    new.id,
    username,
    nullif(user_metadata ->> 'full_name', ''),
    now(),
    now()
  );

  return new;
end;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'trigger_create_profile_from_auth'
  ) THEN
    CREATE TRIGGER trigger_create_profile_from_auth
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_profile_from_auth();
  END IF;
END;
$$;
