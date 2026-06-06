"use client";

import { useState } from "react";
import Link from "next/link";
import SupabaseAuthWidget from "@/components/SupabaseAuthWidget";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/profiles", label: "Members" },
  { href: "/categories", label: "Categories" },
  { href: "/account", label: "Account" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-semibold text-slate-950 transition hover:text-slate-800 dark:text-white dark:hover:text-slate-100">
            Community Hub
          </Link>
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">Events, profiles, categories, and RSVPs with Supabase.</span>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 sm:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "Close" : "Menu"}
          <span className="text-lg">{menuOpen ? "×" : "☰"}</span>
        </button>

        <nav className={`w-full ${menuOpen ? "block" : "hidden"} sm:flex sm:w-auto`}> 
          <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 sm:flex-row sm:items-center sm:border-none sm:bg-transparent sm:p-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 sm:px-3"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/events/new"
              className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 sm:px-3"
              onClick={() => setMenuOpen(false)}
            >
              Create event
            </Link>
          </div>
        </nav>

        <div className="hidden sm:block">
          <SupabaseAuthWidget />
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950 sm:hidden">
          <SupabaseAuthWidget />
        </div>
      ) : null}
    </header>
  );
}
