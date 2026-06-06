-- Migration: create RSVPs table with Supabase row-level security

create extension if not exists "pgcrypto";

create table if not exists rsvps (
  id uuid not null primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'interested',
  created_at timestamptz not null default now(),
  unique(event_id, profile_id)
);

alter table rsvps enable row level security;

create policy "Insert own RSVP" on rsvps
  for insert
  with check (auth.uid() = profile_id);

create policy "Select RSVP for public events or self" on rsvps
  for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from events e where e.id = event_id and (e.is_public or e.owner_id = auth.uid())
    )
  );

create policy "Update own RSVP" on rsvps
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Delete own RSVP" on rsvps
  for delete
  using (auth.uid() = profile_id);
