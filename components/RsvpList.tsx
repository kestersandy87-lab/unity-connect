"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { EventRsvp } from "@/lib/supabaseQueries";

type RsvpListProps = {
  eventId: string;
  rsvps: EventRsvp[];
};

const filterOptions = [
  { key: "all", label: "All RSVPs" },
  { key: "attending", label: "Attending" },
  { key: "interested", label: "Interested" },
];

export default function RsvpList({ eventId, rsvps: initialRsvps }: RsvpListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedFilter = searchParams.get("rsvp_filter") ?? "all";

  const [rsvps, setRsvps] = useState<EventRsvp[]>(initialRsvps);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* ---- Keep state in sync with server props ---- */
  useEffect(() => {
    setRsvps(initialRsvps);
  }, [initialRsvps]);

  /* ---- Real-time subscription to rsvps table ---- */
  useEffect(() => {
    const channel = supabase
      .channel(`rsvps-list-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Flash the live indicator
          setLiveIndicator(true);
          setTimeout(() => setLiveIndicator(false), 1500);

          if (payload.eventType === "INSERT") {
            // Fetch the full RSVP with profile data
            const { data } = await supabase
              .from("rsvps")
              .select("id,status,profile:profiles(username,full_name,avatar_url)")
              .eq("id", payload.new.id)
              .single();

            if (data) {
              const newRsvp: EventRsvp = {
                id: data.id,
                status: data.status,
                profile: Array.isArray(data.profile)
                  ? data.profile[0] ?? null
                  : data.profile ?? null,
              };
              setRsvps((prev) => {
                // Avoid duplicates
                if (prev.some((r) => r.id === newRsvp.id)) return prev;
                return [...prev, newRsvp];
              });
            }
          } else if (payload.eventType === "DELETE") {
            setRsvps((prev) => prev.filter((r) => r.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setRsvps((prev) =>
              prev.map((r) =>
                r.id === payload.new.id ? { ...r, status: payload.new.status } : r
              )
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  const filteredRsvps = useMemo(() => {
    if (selectedFilter === "attending") {
      return rsvps.filter((rsvp) => rsvp.status === "attending");
    }

    if (selectedFilter === "interested") {
      return rsvps.filter((rsvp) => rsvp.status === "interested");
    }

    return rsvps;
  }, [rsvps, selectedFilter]);

  const updateFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "all") {
      params.delete("rsvp_filter");
    } else {
      params.set("rsvp_filter", filter);
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const shareableUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedFilter === "all") {
      params.delete("rsvp_filter");
    } else {
      params.set("rsvp_filter", selectedFilter);
    }
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams, selectedFilter]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess("Link copied!");
      window.setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      setCopySuccess("Copy failed");
      window.setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">RSVPs</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {rsvps.length} {rsvps.length === 1 ? "response" : "responses"}
            </p>
          </div>
          {/* Live indicator dot */}
          {liveIndicator && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => updateFilter(option.key)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                selectedFilter === option.key
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all">
            Share this view: <a href={shareableUrl} className="font-medium text-slate-900 underline dark:text-slate-100">{shareableUrl}</a>
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800 sm:mt-0"
          >
            Copy link
          </button>
        </div>
        {copySuccess ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{copySuccess}</p> : null}
      </div>

      {filteredRsvps.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No RSVPs match this filter.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filteredRsvps.map((rsvp) => (
            <li key={rsvp.id} className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {rsvp.profile ? rsvp.profile.full_name ?? rsvp.profile.username : "Guest"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{rsvp.profile?.username ?? "No profile"}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  {rsvp.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}