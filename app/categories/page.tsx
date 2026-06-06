import Link from "next/link";
import { getCategories } from "@/lib/supabaseQueries";
import SiteHeader from "@/components/SiteHeader";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Event categories</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Browse the seeded category list for your community events.</p>
            </div>
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              Back to home
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{category.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{category.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
