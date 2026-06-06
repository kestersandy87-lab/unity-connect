"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Event, Category } from "@/lib/supabaseQueries";

type EventListProps = {
  events: Event[];
  categories?: Category[];
};

const rsvpFilterOptions = [
  { key: "all", label: "All events" },
  { key: "attending", label: "With attendees" },
  { key: "interested", label: "With interest" },
];

export default function EventList({ events, categories = [] }: EventListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedRsvpFilter, setSelectedRsvpFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    setSelectedRsvpFilter(searchParams.get("event_filter") ?? "all");
    setSearchQuery(searchParams.get("search") ?? "");
    setLocationQuery(searchParams.get("location") ?? "");
    const categories = searchParams.get("categories");
    if (categories) {
      setSelectedCategories(categories.split(","));
    }
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // RSVP filter
    if (selectedRsvpFilter === "attending") {
      result = result.filter((event) => (event.rsvp_counts?.attending ?? 0) > 0);
    } else if (selectedRsvpFilter === "interested") {
      result = result.filter((event) => (event.rsvp_counts?.interested ?? 0) > 0);
    }

    // Search query (title + description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          (event.description && event.description.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (locationQuery.trim()) {
      const query = locationQuery.toLowerCase();
      result = result.filter(
        (event) => event.location && event.location.toLowerCase().includes(query)
      );
    }

    return result;
  }, [events, selectedRsvpFilter, searchQuery, locationQuery, selectedCategories]);

  const updateRsvpFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "all") {
      params.delete("event_filter");
    } else {
      params.set("event_filter", filter);
    }

    setSelectedRsvpFilter(filter);
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("search", query);
    } else {
      params.delete("search");
    }

    const paramString = params.toString();
    router.replace(`${pathname}${paramString ? `?${paramString}` : ""}`);
  };

  const updateLocationQuery = (query: string) => {
    setLocationQuery(query);
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("location", query);
    } else {
      params.delete("location");
    }

    const paramString = params.toString();
    router.replace(`${pathname}${paramString ? `?${paramString}` : ""}`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSelectedRsvpFilter("all");
    router.replace(pathname);
  };

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const shareableUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const paramString = params.toString();
    return `${pathname}${paramString ? `?${paramString}` : ""}`;
  }, [pathname, searchParams]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess("Link copied!");
      window.setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      setCopySuccess("Copy failed");
      window.setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const isFiltered = searchQuery.trim() || locationQuery.trim() || selectedRsvpFilter !== "all";

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Upcoming events</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search and filter events to find gatherings that match your interests.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rsvpFilterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => updateRsvpFilter(option.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedRsvpFilter === option.key
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Search by title or description
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            placeholder="e.g., React workshop, Team lunch..."
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Search by location
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => updateLocationQuery(e.target.value)}
            placeholder="e.g., downtown, room 302, online..."
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      </div>

      {isFiltered ? (
        <div className="flex flex-col gap-2 rounded-3xl bg-slate-100 px-4 py-3 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Showing <span className="font-semibold">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            Reset filters
          </button>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
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

      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No events match your search. Try adjusting your filters.</p>
        ) : (
          filteredEvents.map((event) => (
            <article key={event.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{event.title}</h3>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                      {event.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>{event.rsvp_counts?.attending ?? 0} attending</span>
                  <span>{event.rsvp_counts?.interested ?? 0} interested</span>
                  <span>{event.rsvp_counts?.total ?? 0} RSVPs</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span>{new Date(event.starts_at).toLocaleString()}</span>
                <span>{event.location ?? "Online"}</span>
                <span>{event.capacity} seats</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Host: {event.owner ? event.owner.full_name ?? event.owner.username : "Unknown host"}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/events/${event.id}`} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                  View event
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
