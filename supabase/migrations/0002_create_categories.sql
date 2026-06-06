-- Migration: create categories and event_categories tables with RLS

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid not null primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists event_categories (
  event_id uuid not null references events(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, category_id)
);

alter table categories enable row level security;
alter table event_categories enable row level security;

create policy "Public category select" on categories
  for select
  using (true);

create policy "Admin insert categories" on categories
  for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admin update categories" on categories
  for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admin delete categories" on categories
  for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Select event categories if public or owner" on event_categories
  for select
  using (
    exists (
      select 1 from events e where e.id = event_categories.event_id and (e.is_public or e.owner_id = auth.uid())
    )
  );

create policy "Insert event categories if owner" on event_categories
  for insert
  with check (
    exists (
      select 1 from events e where e.id = event_categories.event_id and e.owner_id = auth.uid()
    )
  );

create policy "Delete event categories if owner" on event_categories
  for delete
  using (
    exists (
      select 1 from events e where e.id = event_categories.event_id and e.owner_id = auth.uid()
    )
  );
