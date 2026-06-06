-- Migration: enable Supabase Realtime on the rsvps table
-- This is required for postgres_changes subscriptions (INSERT / UPDATE / DELETE)
-- to push live updates to the frontend.

-- Add the rsvps table to the supabase_realtime publication
alter publication supabase_realtim
e add table rsvps;