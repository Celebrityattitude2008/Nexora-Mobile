import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-panel backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Nexora</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
              One app. Multiple pages. Smarter navigation.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
              We split the dashboard into sections so each area has its own page and the mobile menu stays clean.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="rounded-full bg-amber-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                Go to Dashboard
              </Link>
              <Link href="/notes" className="rounded-full border border-slate-700 px-5 py-3 text-center text-sm text-slate-100 transition hover:bg-slate-800">
                Notes & weather
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700 bg-slate-800/80 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Quick links</p>
            <div className="mt-6 space-y-3">
              <Link href="/music" className="block rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-sm text-slate-100 transition hover:border-amber-400/40">
                Music & creativity
              </Link>
              <Link href="/finance" className="block rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-sm text-slate-100 transition hover:border-amber-400/40">
                Finance & headlines
              </Link>
              <Link href="/calendar" className="block rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-sm text-slate-100 transition hover:border-amber-400/40">
                Calendar & planning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
