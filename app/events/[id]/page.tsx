import { Suspense } from "react";
import Link from "next/link";
import EventRsvpActions from "@/components/EventRsvpActions";
import RsvpList from "@/components/RsvpList";
import LiveRsvpCounts from "@/components/LiveRsvpCounts";
import { getEventById, getEventCategories, getEventRsvps } from "@/lib/supabaseQueries";

type EventPageProps = {
  params: {
    id: string;
  };
};

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventById(params.id);
  const categories = await getEventCategories(params.id);
  const rsvps = await getEventRsvps(params.id);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-semibold">Event not found</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Check the event link or return to the homepage.</p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/" className="text-sm font-medium text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
          ← Back to homepage
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Event details</p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">{event.title}</h1>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{event.description}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-right dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Hosted by</p>
              <p className="mt-2 font-semibold text-slate-900 dark:text-white">{event.owner ? event.owner.full_name ?? event.owner.username : "Unknown host"}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">When</p>
              <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{new Date(event.starts_at).toLocaleString()}</p>
              {event.ends_at ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Ends {new Date(event.ends_at).toLocaleString()}</p> : null}
            </div>
            <div className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Where</p>
              <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{event.location ?? "Online"}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Capacity: {event.capacity}</p>
              {/* Live-updating RSVP counts */}
              <LiveRsvpCounts
                eventId={event.id}
                initialAttending={event.rsvp_counts?.attending ?? 0}
                initialInterested={event.rsvp_counts?.interested ?? 0}
                initialTotal={event.rsvp_counts?.total ?? 0}
                capacity={event.capacity}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {categories.map((category) => (
              <span key={category.id} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                {category.name}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr]">
            <EventRsvpActions eventId={event.id} />
            <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950"><p className="text-sm text-slate-500 dark:text-slate-400">Loading RSVPs…</p></div>}>
              <RsvpList eventId={event.id} rsvps={rsvps} />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}