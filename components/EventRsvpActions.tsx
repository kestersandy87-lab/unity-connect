"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type EventRsvpActionsProps = {
  eventId: string;
};

type RsvpRecord = {
  id: string;
  status: string;
  profile_id: string;
};

export default function EventRsvpActions({ eventId }: EventRsvpActionsProps) {
  const [session, setSession] = useState<any>(null);
  const [rsvp, setRsvp] = useState<RsvpRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ---- Auth listener ------------------------------------------------ */

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ---- Load current user's RSVP ------------------------------------- */

  useEffect(() => {
    const loadRsvp = async () => {
      if (!session?.user) {
        setRsvp(null);
        return;
      }

      const { data, error } = await supabase
        .from("rsvps")
        .select("id,status,profile_id")
        .eq("event_id", eventId)
        .eq("profile_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("loadRsvp error", error.message);
      }

      setRsvp(data ?? null);
    };

    loadRsvp();
  }, [eventId, session]);

  /* ---- Real-time subscription for this user's RSVP ------------------ */
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel(`rsvp-user-${eventId}-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          // Only react to changes for this user
          const profileId =
            payload.eventType === "DELETE" ? payload.old.profile_id : payload.new.profile_id;

          if (profileId !== session.user.id) return;

          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setRsvp({
              id: payload.new.id,
              status: payload.new.status,
              profile_id: payload.new.profile_id,
            });
          } else if (payload.eventType === "DELETE") {
            setRsvp(null);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, session]);

  /* ---- RSVP mutations ----------------------------------------------- */

  const handleRsvpStatus = useCallback(
    async (status: "attending" | "interested") => {
      if (!session?.user) {
        setMessage("Sign in first to RSVP.");
        return;
      }

      setLoading(true);
      setMessage(null);

      const { error } = await supabase
        .from("rsvps")
        .upsert(
          {
            event_id: eventId,
            profile_id: session.user.id,
            status,
          },
          { onConflict: "event_id,profile_id" }
        );

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      // Optimistic update — the real-time listener will also fire,
      // but this gives instant feedback.
      setRsvp({ id: `${eventId}:${session.user.id}`, status, profile_id: session.user.id });
      setMessage(
        status === "attending"
          ? "You are attending this event. ✓"
          : "You are interested in this event. ✓"
      );
    },
    [eventId, session]
  );

  const handleCancel = useCallback(async () => {
    if (!session?.user) {
      setMessage("Sign in first to cancel your RSVP.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from("rsvps")
      .delete()
      .eq("event_id", eventId)
      .eq("profile_id", session.user.id);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRsvp(null);
    setMessage("Your RSVP has been canceled.");
  }, [eventId, session]);

  /* ---- Not signed in ------------------------------------------------ */

  if (!session?.user) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-600 dark:text-slate-400">Sign in to RSVP for this event.</p>
        <Link href="/signin" className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
          Sign in
        </Link>
      </div>
    );
  }

  /* ---- Render ------------------------------------------------------- */

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Your RSVP</p>
          <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
            {rsvp
              ? rsvp.status === "attending"
                ? "You are attending this event. ✓"
                : "You are interested in this event."
              : "Let the host know you plan to attend."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {rsvp ? (
            <>
              {rsvp.status !== "attending" ? (
                <button
                  type="button"
                  onClick={() => handleRsvpStatus("attending")}
                  disabled={loading}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark attending
                </button>
              ) : null}
              {rsvp.status !== "interested" ? (
                <button
                  type="button"
                  onClick={() => handleRsvpStatus("interested")}
                  disabled={loading}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Mark interested
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Cancel RSVP
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleRsvpStatus("attending")}
                disabled={loading}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending…" : "Attending"}
              </button>
              <button
                type="button"
                onClick={() => handleRsvpStatus("interested")}
                disabled={loading}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {loading ? "Sending…" : "Interested"}
              </button>
            </>
          )}
        </div>
      </div>
      {message ? (
        <p
          className={`mt-4 text-sm ${
            message.includes("✓")
              ? "text-green-600 dark:text-green-400"
              : message.includes("canceled")
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}