import { getSupabaseClient } from "./supabaseClient";

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  bio: string | null;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
};

export type EventRsvp = {
  id: string;
  status: string;
  profile: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  capacity: number;
  is_public: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  owner: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  rsvp_counts?: {
    attending: number;
    interested: number;
    total: number;
  };
};

function normalizeEvent(event: any): Event {
  const ownerData = event.owner;
  const owner = Array.isArray(ownerData) ? ownerData[0] ?? null : ownerData;
  const rsvps = Array.isArray(event.rsvps) ? event.rsvps : [];
  const counts = {
    attending: rsvps.filter((item: any) => item.status === "attending").length,
    interested: rsvps.filter((item: any) => item.status === "interested").length,
    total: rsvps.length,
  };

  return {
    ...event,
    owner,
    rsvp_counts: counts,
  } as Event;
}

export async function getEvents() {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select(`id,title,description,starts_at,ends_at,location,capacity,is_public,metadata,created_at,owner:profiles(id,username,full_name,avatar_url),rsvps(status)`)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("getEvents error:", error.message);
    return [] as Event[];
  }

  return (data ?? []).map(normalizeEvent) as Event[];
}

export async function getEventById(id: string) {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select(`id,title,description,starts_at,ends_at,location,capacity,is_public,metadata,created_at,owner:profiles(id,username,full_name,avatar_url),rsvps(status)`)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getEventById error:", error?.message);
    return null;
  }

  return normalizeEvent(data) as Event;
}

export async function getEventCategories(eventId: string) {
  const { data, error } = await getSupabaseClient()
    .from("event_categories")
    .select("category:categories(id,name)")
    .eq("event_id", eventId);

  if (error) {
    console.error("getEventCategories error:", error.message);
    return [] as Category[];
  }

  return (data ?? []).map((row: any) => row.category) as Category[];
}

export async function getProfiles() {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("id,username,full_name,avatar_url,role,bio")
    .order("username", { ascending: true });

  if (error) {
    console.error("getProfiles error:", error.message);
    return [] as Profile[];
  }

  return (data ?? []) as Profile[];
}

export async function getCategories() {
  const { data, error } = await getSupabaseClient()
    .from("categories")
    .select("id,name,description")
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    return [] as Category[];
  }

  return (data ?? []) as Category[];
}

export async function getEventRsvps(eventId: string) {
  const { data, error } = await getSupabaseClient()
    .from("rsvps")
    .select("id,status,profile:profiles(username,full_name,avatar_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getEventRsvps error:", error.message);
    return [] as EventRsvp[];
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    status: item.status,
    profile: Array.isArray(item.profile) ? item.profile[0] ?? null : item.profile ?? null,
  })) as EventRsvp[];
}
