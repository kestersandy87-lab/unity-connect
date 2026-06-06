import { getProfiles } from "@/lib/supabaseQueries";
import SiteHeader from "@/components/SiteHeader";

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-semibold">Community members</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Profiles seeded from Supabase with roles and member bios.</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <article key={profile.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-sm text-slate-500">No image</span>}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-950 dark:text-white">{profile.full_name ?? profile.username}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">@{profile.username} • {profile.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{profile.bio}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
