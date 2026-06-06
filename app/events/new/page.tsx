import Link from "next/link";
import EventCreateForm from "@/components/EventCreateForm";
import { getCategories } from "@/lib/supabaseQueries";

export default async function CreateEventPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Event dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">Create a community event</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Use this form to publish a new meetup, workshop, or gathering for your community. Logged-in members can create events that are visible to everyone.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <EventCreateForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
