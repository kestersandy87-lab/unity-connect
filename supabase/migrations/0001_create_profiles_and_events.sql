-- Migration: create profiles and events tables with Supabase RLS policies

create extension if not exists "pgcrypto";

-- User profiles table linked to Supabase auth.users
create table if not exists profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events table for community gatherings
create table if not exists events (
  id uuid not null primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  capacity int default 0,
  is_public boolean not null default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable row-level security on both tables
alter table profiles enable row level security;
alter table events enable row level security;

-- Profiles RLS policies
create policy "Public profile select" on profiles
  for select
  using (true);

create policy "Authenticated users insert own profile" on profiles
  for insert
  with check (auth.uid() = id);

create policy "Authenticated users update own profile" on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Authenticated users delete own profile" on profiles
  for delete
  using (auth.uid() = id);

-- Events RLS policies
create policy "Insert events" on events
  for insert
  with check (auth.uid() = owner_id);

create policy "Select events if public or owner" on events
  for select
  using (is_public or auth.uid() = owner_id);

create policy "Update own event" on events
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Delete own event" on events
  for delete
  using (auth.uid() = owner_id);
