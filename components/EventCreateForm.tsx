"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Category } from "@/lib/supabaseQueries";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EventCreateFormProps = {
  categories: Category[];
};

type FormState = {
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  location: string;
  latitude: string;
  longitude: string;
  capacity: string;
  is_public: boolean;
  selectedCategoryIds: string[];
};

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

const initialState: FormState = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  location: "",
  latitude: "",
  longitude: "",
  capacity: "50",
  is_public: true,
  selectedCategoryIds: [],
};

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  const title = state.title.trim();
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  } else if (title.length > 120) {
    errors.title = "Title must be 120 characters or fewer.";
  }

  if (state.description.trim().length > 2000) {
    errors.description = "Description must be 2000 characters or fewer.";
  }

  if (!state.starts_at) {
    errors.starts_at = "Start date & time is required.";
  }

  if (state.starts_at && state.ends_at) {
    const start = new Date(state.starts_at);
    const end = new Date(state.ends_at);
    if (end <= start) {
      errors.ends_at = "End time must be after the start time.";
    }
  }

  if (state.capacity !== "") {
    const cap = Number(state.capacity);
    if (Number.isNaN(cap) || cap < 0) {
      errors.capacity = "Capacity must be a non-negative number.";
    } else if (cap > 100_000) {
      errors.capacity = "Capacity seems unreasonably high.";
    }
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  Reverse geocoding helper (OpenStreetMap Nominatim – free & no key) */
/* ------------------------------------------------------------------ */

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventCreateForm({ categories }: EventCreateFormProps) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  /* ---- Auth listener ------------------------------------------------ */

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
    };

    loadSession();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  /* ---- Category toggle ---------------------------------------------- */

  const toggleCategory = (categoryId: string) => {
    setFormState((current) => {
      const selectedCategoryIds = current.selectedCategoryIds.includes(categoryId)
        ? current.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...current.selectedCategoryIds, categoryId];

      return { ...current, selectedCategoryIds };
    });
  };

  /* ---- "Use my location" -------------------------------------------- */

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, location: "Geolocation is not supported by your browser." }));
      return;
    }

    setGeoLoading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.location;
      return next;
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);

        setFormState((prev) => ({
          ...prev,
          latitude: String(latitude),
          longitude: String(longitude),
          location: address ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        }));
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please allow location access or enter the address manually."
            : "Unable to retrieve your location. Enter the address manually.";
        setErrors((prev) => ({ ...prev, location: msg }));
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  /* ---- Clear single field error on change --------------------------- */

  const clearError = (field: keyof FormState) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /* ---- Submit ------------------------------------------------------- */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!session?.user) {
      setMessage("Sign in before creating an event.");
      return;
    }

    // Run validation
    const validationErrors = validate(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstField = Object.keys(validationErrors)[0];
      document.querySelector(`[data-field="${firstField}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    setErrors({});

    // Build metadata with optional coordinates
    const metadata: Record<string, unknown> = { createdVia: "dashboard" };
    if (formState.latitude && formState.longitude) {
      metadata.latitude = parseFloat(formState.latitude);
      metadata.longitude = parseFloat(formState.longitude);
    }

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert([
        {
          owner_id: session.user.id,
          title: formState.title.trim(),
          description: formState.description.trim() || null,
          starts_at: new Date(formState.starts_at).toISOString(),
          ends_at: formState.ends_at ? new Date(formState.ends_at).toISOString() : null,
          location: formState.location.trim() || null,
          capacity: Number(formState.capacity) || 0,
          is_public: formState.is_public,
          metadata,
        },
      ])
      .select("id")
      .single();

    if (eventError || !eventData) {
      setLoading(false);
      setMessage(eventError?.message ?? "Unable to create event.");
      return;
    }

    const eventId = eventData.id;

    if (formState.selectedCategoryIds.length > 0) {
      const categoryRows = formState.selectedCategoryIds.map((categoryId) => ({
        event_id: eventId,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase.from("event_categories").insert(categoryRows);
      if (categoryError) {
        setLoading(false);
        setMessage(categoryError.message);
        return;
      }
    }

    setLoading(false);
    router.push(`/events/${eventId}`);
  };

  /* ---- Helper: input class ------------------------------------------ */

  const inputClass = (field: keyof FormState) =>
    `rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-2 dark:bg-slate-950 dark:text-slate-100 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900"
        : "border-slate-300 bg-slate-50 focus:border-slate-900 focus:ring-slate-200 dark:border-slate-700 dark:focus:border-slate-500 dark:focus:ring-slate-800"
    }`;

  /* ---- Not signed-in guard ------------------------------------------ */

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
          <h2 className="text-2xl font-semibold">Sign in to create an event</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Only authenticated members can publish new community gatherings.</p>
        </div>
        <Link href="/signin" className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          Sign in
        </Link>
      </div>
    );
  }

  /* ---- Render ------------------------------------------------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* ── Title ── */}
      <div data-field="title">
        <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Event title <span className="text-red-500">*</span>
          <input
            type="text"
            value={formState.title}
            onChange={(e) => {
              setFormState((prev) => ({ ...prev, title: e.target.value }));
              clearError("title");
            }}
            className={inputClass("title")}
            placeholder="e.g. Sunset Yoga in the Park"
            maxLength={120}
            required
          />
        </label>
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* ── Location + "Use my location" ── */}
      <div data-field="location">
        <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Location
          <input
            type="text"
            value={formState.location}
            onChange={(e) => {
              setFormState((prev) => ({
                ...prev,
                location: e.target.value,
                // Clear coordinates when the user manually edits
                latitude: "",
                longitude: "",
              }));
              clearError("location");
            }}
            className={inputClass("location")}
            placeholder="On-site address, venue name, or online link"
          />
        </label>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {/* Crosshair icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path strokeLinecap="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            </svg>
            {geoLoading ? "Locating…" : "Use my current location"}
          </button>

          {formState.latitude && formState.longitude && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              📍 {Number(formState.latitude).toFixed(4)}, {Number(formState.longitude).toFixed(4)}
            </span>
          )}
        </div>

        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* ── Description ── */}
      <div data-field="description">
        <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
          <textarea
            value={formState.description}
            onChange={(e) => {
              setFormState((prev) => ({ ...prev, description: e.target.value }));
              clearError("description");
            }}
            rows={5}
            className={`min-h-[140px] ${inputClass("description")}`}
            placeholder="Share the event details, audience, and agenda."
            maxLength={2000}
          />
        </label>
        <div className="mt-1 flex items-center justify-between">
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          <p className="ml-auto text-xs text-slate-400">{formState.description.length}/2000</p>
        </div>
      </div>

      {/* ── Date / Capacity row ── */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div data-field="starts_at">
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Starts at <span className="text-red-500">*</span>
            <input
              type="datetime-local"
              value={formState.starts_at}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, starts_at: e.target.value }));
                clearError("starts_at");
              }}
              className={inputClass("starts_at")}
              required
            />
          </label>
          {errors.starts_at && <p className="mt-1 text-xs text-red-500">{errors.starts_at}</p>}
        </div>

        <div data-field="ends_at">
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Ends at
            <input
              type="datetime-local"
              value={formState.ends_at}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, ends_at: e.target.value }));
                clearError("ends_at");
              }}
              className={inputClass("ends_at")}
            />
          </label>
          {errors.ends_at && <p className="mt-1 text-xs text-red-500">{errors.ends_at}</p>}
        </div>

        <div data-field="capacity">
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Capacity
            <input
              type="number"
              min={0}
              max={100000}
              value={formState.capacity}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, capacity: e.target.value }));
                clearError("capacity");
              }}
              className={inputClass("capacity")}
            />
          </label>
          {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
        </div>
      </div>

      {/* ── Public toggle ── */}
      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={formState.is_public}
            onChange={(event) => setFormState((prev) => ({ ...prev, is_public: event.target.checked }))}
            className="h-5 w-5 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-700 dark:border-slate-700 dark:bg-slate-950"
          />
          Make this event public
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">Public events are visible to all visitors. Private events are only visible to your account.</p>
      </div>

      {/* ── Categories ── */}
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Event categories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tag your event so it appears in the right category.</p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Optional
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No categories are available yet.</p>
          ) : (
            categories.map((category) => {
              const selected = formState.selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                      : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600"
                  }`}
                >
                  <p className="font-semibold">{category.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Global error / success message ── */}
      {message && (
        <p className={`rounded-2xl px-4 py-3 text-sm ${message.startsWith("Check") ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message}
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating event…" : "Create event"}
        </button>
      </div>
    </form>
  );
}