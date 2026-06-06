"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type ProfileFormState = {
  username: string;
  full_name: string;
  avatar_url: string;
  website: string;
  bio: string;
};

export default function AccountPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileFormState>({
    username: "",
    full_name: "",
    avatar_url: "",
    website: "",
    bio: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase!.auth.getSession();
      setSession(data?.session ?? null);
    };

    loadSession();

    const authListener = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase!
        .from("profiles")
        .select("username,full_name,avatar_url,website,bio")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("loadProfile error", error.message);
        return;
      }

      if (data) {
        setProfile({
          username: data.username ?? "",
          full_name: data.full_name ?? "",
          avatar_url: data.avatar_url ?? "",
          website: data.website ?? "",
          bio: data.bio ?? "",
        });
      }
    };

    loadProfile();
  }, [session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user) {
      setMessage("Sign in first to manage your profile.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase!
      .from("profiles")
      .upsert({
        id: session.user.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
        bio: profile.bio,
      })
      .select();

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile saved successfully.");
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-semibold">Manage your profile</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">You need to sign in before editing your profile.</p>
          <Link href="/signin" className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Your profile</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Create or update your community profile information.</p>
          </div>
          <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
            Return home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Username
            <input
              type="text"
              value={profile.username}
              onChange={(event) => setProfile((prev) => ({ ...prev, username: event.target.value }))}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
            <input
              type="text"
              value={profile.full_name}
              onChange={(event) => setProfile((prev) => ({ ...prev, full_name: event.target.value }))}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Avatar URL
            <input
              type="url"
              value={profile.avatar_url}
              onChange={(event) => setProfile((prev) => ({ ...prev, avatar_url: event.target.value }))}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Website
            <input
              type="url"
              value={profile.website}
              onChange={(event) => setProfile((prev) => ({ ...prev, website: event.target.value }))}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Bio
            <textarea
              value={profile.bio}
              onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
              className="min-h-[120px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
