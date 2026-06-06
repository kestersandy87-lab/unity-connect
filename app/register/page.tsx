"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Check your email for a confirmation link and then sign in.");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Create an account for the community app.</p>

        <form onSubmit={handleRegister} className="mt-6 space-y-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </label>

          {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}

          <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link href="/signin" className="font-semibold text-slate-900 dark:text-white">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
