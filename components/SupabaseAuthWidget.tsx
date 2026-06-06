"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SupabaseAuthWidget() {
  const [session, setSession] = useState<any>(null);

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

  const handleSignOut = async () => {
    await supabase!.auth.signOut();
    setSession(null);
  };

  if (!session?.user) {
    return (
      <Link href="/signin" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-700">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
      <span>{session.user.email}</span>
      <button type="button" onClick={handleSignOut} className="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700">
        Sign out
      </button>
    </div>
  );
}
