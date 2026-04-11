import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 md:px-8 lg:px-10 animate-page-enter"
      style={{ color: 'var(--text)' }}
    >
      <div
        className="mx-auto max-w-6xl rounded-[2.5rem] border p-6 sm:p-8 shadow-panel backdrop-blur-xl"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-90)',
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="animate-slide-in-left">
            <p
              className="text-sm uppercase tracking-[0.4em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Nexora
            </p>
            <h1
              className="mt-4 text-4xl font-semibold sm:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              One app. Multiple pages. Smarter navigation.
            </h1>
            <p
              className="mt-4 max-w-2xl text-base sm:text-lg"
              style={{ color: 'var(--muted)' }}
            >
              We split the dashboard into sections so each area has its own page and the mobile menu stays clean.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard"
                className="rounded-full px-5 py-3 text-center text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-glow active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#111',
                }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/notes"
                className="rounded-full border px-5 py-3 text-center text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  backgroundColor: 'var(--surface-50)',
                }}
              >
                Notes & weather
              </Link>
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-6 animate-slide-in-right"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--panel-80)',
            }}
          >
            <p
              className="text-sm uppercase tracking-[0.35em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Quick links
            </p>
            <div className="mt-6 space-y-3">
              {[
                { href: '/music', label: 'Music & creativity' },
                { href: '/finance', label: 'Finance & headlines' },
                { href: '/calendar', label: 'Calendar & planning' },
              ].map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-3xl border px-4 py-4 text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-80)',
                    color: 'var(--text)',
                    animationDelay: `${(i + 1) * 0.08}s`,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
