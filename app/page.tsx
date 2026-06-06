import { Suspense } from "react";
import Link from "next/link";
import EventList from "@/components/EventList";
import { getCategories, getEvents } from "@/lib/supabaseQueries";
import SiteHeader from "@/components/SiteHeader";

export default async function Home() {
  const categories = await getCategories();
  const events = await getEvents();

  const now = new Date();
  const weekFromNow = new Date(now.valueOf() + 7 * 24 * 60 * 60 * 1000);

  const totalUpcoming = events.length;
  const publicEvents = events.filter((event) => event.is_public).length;
  const privateEvents = totalUpcoming - publicEvents;
  const recentlyAdded = events.filter((event) => {
    const createdAt = new Date(event.created_at);
    return createdAt >= new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Community Hub</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Discover the next meetup, members, and categories.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Use the seeded Supabase data to explore events, browse community profiles, and start building connections.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl bg-slate-100 p-4 dark:bg-slate-800">
              <Link className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" href="/events/new">
                Create a new event
              </Link>
              <Link className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-100" href="/profiles">
                Browse members
              </Link>
              <Link className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-100" href="/categories">
                View categories
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Upcoming events</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{totalUpcoming}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Public events</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{publicEvents}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Private events</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{privateEvents}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Added this week</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{recentlyAdded}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">new events created in the last 7 days</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500 dark:text-slate-400">Loading events…</p></div>}>
            <EventList events={events} categories={categories} />
          </Suspense>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-semibold">Categories</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse event types seeded in Supabase.</p>
            </div>
            <div className="grid gap-3">
              {categories.map((category) => (
                <Link key={category.id} href="/categories" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition hover:border-slate-300 dark:border-slate-800 dark:text-slate-100 dark:hover:border-slate-700">
                  <p className="font-semibold">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
