"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LiveRsvpCountsProps = {
  eventId: string;
  initialAttending: number;
  initialInterested: number;
  initialTotal: number;
  capacity: number;
};

export default function LiveRsvpCounts({
  eventId,
  initialAttending,
  initialInterested,
  initialTotal,
  capacity,
}: LiveRsvpCountsProps) {
  const [counts, setCounts] = useState({
    attending: initialAttending,
    interested: initialInterested,
    total: initialTotal,
  });

  /* ---- Sync with server props when they change ---- */
  useEffect(() => {
    setCounts({
      attending: initialAttending,
      interested: initialInterested,
      total: initialTotal,
    });
  }, [initialAttending, initialInterested, initialTotal]);

  /* ---- Real-time subscription ---- */
  useEffect(() => {
    const channel = supabase
      .channel(`rsvp-counts-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          // Re-fetch counts on any RSVP change for this event
          const { data } = await supabase
            .from("rsvps")
            .select("status")
            .eq("event_id", eventId);

          if (data) {
            setCounts({
              attending: data.filter((r) => r.status === "attending").length,
              interested: data.filter((r) => r.status === "interested").length,
              total: data.length,
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  const spotsLeft = capacity > 0 ? capacity - counts.attending : null;

  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <strong>{counts.attending}</strong> attending
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        <strong>{counts.interested}</strong> interested
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
        <strong>{counts.total}</strong> total
      </span>
      {spotsLeft !== null && (
        <span
          className={`inline-flex items-center gap-1.5 ${
            spotsLeft <= 0 ? "text-red-500 dark:text-red-400" : ""
          }`}
        >
          {spotsLeft > 0 ? (
            <>
              <strong>{spotsLeft}</strong> spots left
            </>
          ) : (
            <strong>Full</strong>
          )}
        </span>
      )}
    </div>
  );
}