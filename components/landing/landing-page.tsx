import type { ReactNode } from "react";
import Link from "next/link";

function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-white/[0.02] ${box}`}
      aria-hidden
    >
      <span className="h-2.5 w-2.5 rounded-full bg-white/90 shadow-[0_0_12px_rgb(147_197_253/0.6)]" />
    </span>
  );
}

/**
 * Decorative sparkle “wave” — vertical glow lines, four-point stars, dotted grid (reference artwork).
 */
function HeroAbstractArt({ className }: { className?: string }) {
  /* % from bottom: wider spread so the wave reads clearly in a tall area */
  const heightsFromBottom = [
    36, 37, 40, 44, 50, 58, 66, 72, 76, 78, 76, 70, 60, 46, 34, 26, 22, 26, 34, 46, 58, 70, 80, 86, 82, 72,
  ] as const;

  /* Four-point star with concave edges (single path, 24×24) */
  const starD =
    "M12 3.2C13.8 7.6 16.4 10.2 20.8 12C16.4 13.8 13.8 16.4 12 20.8C10.2 16.4 7.6 13.8 3.2 12C7.6 10.2 10.2 7.6 12 3.2Z";

  return (
    <div
      className={`relative w-full min-w-0 max-w-none ${className ?? ""}`}
      aria-hidden
    >
      {/* Faint vertical dotted grid — sits on hero background, no panel */}
      <div
        className="pointer-events-none absolute inset-0 flex justify-between px-1 opacity-[0.35] sm:px-2 sm:opacity-40"
        aria-hidden
      >
        {Array.from({ length: 42 }, (_, i) => (
          <div
            key={i}
            className="h-full w-px shrink-0 border-l border-dotted border-white/[0.12]"
          />
        ))}
      </div>

      <div className="relative flex h-[min(76vw,380px)] min-h-[280px] items-stretch px-1 py-8 sm:h-[440px] sm:min-h-[400px] sm:px-2 sm:py-10 lg:h-[500px] lg:min-h-[500px] lg:py-12">
        {heightsFromBottom.map((pctBottom, i) => {
          const yFromTop = 100 - pctBottom;
          const a = Math.max(0, yFromTop - 12);
          const b = Math.min(100, yFromTop + 12);
          return (
            <div key={i} className="relative h-full min-w-0 flex-1">
              <div
                className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, transparent ${a}%, rgb(255 255 255) ${yFromTop}%, transparent ${b}%, transparent 100%)`,
                  boxShadow: "0 0 10px rgb(255 255 255 / 0.28), 0 0 22px rgb(255 255 255 / 0.08)",
                }}
              />
              <div
                className="pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 [filter:drop-shadow(0_0_4px_rgb(255_255_255/0.85))_drop-shadow(0_0_12px_rgb(255_255_255/0.28))]"
                style={{ top: `${yFromTop}%` }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 sm:h-[0.875rem] sm:w-[0.875rem] lg:h-4 lg:w-4"
                  role="presentation"
                >
                  <path fill="#ffffff" d={starD} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrustStat({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-400">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-200">
        {icon}
      </span>
      <span className="font-medium leading-snug text-zinc-300">{text}</span>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition duration-300 hover:border-white/15 hover:bg-white/[0.04]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition group-hover:border-sky-400/30 group-hover:text-sky-200">
        {icon}
      </div>
      <h3 className="font-sans text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-zinc-400">{description}</p>
    </article>
  );
}

export function LandingPage() {
  return (
    <div className="dark min-h-screen bg-[#050510] text-zinc-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#050510]"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050510]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-full outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/80"
          >
            <LogoMark />
            <span className="font-sans text-lg font-semibold tracking-tight text-white">KOSH</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="#features"
              className="hidden text-sm font-medium text-zinc-400 transition hover:text-white sm:inline"
            >
              See Demo
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 min-h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#050510] transition hover:bg-zinc-100 sm:px-5"
            >
              Start Managing Money
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section
          className="relative overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgb(99_102_241/0.18),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_10%_0%,rgb(59_130_246/0.12),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_90%_100%,rgb(139_92_246/0.1),transparent_50%)]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-10 lg:px-10 lg:pb-24 lg:pt-16 xl:gap-x-16 xl:px-12">
            <div className="max-w-xl min-w-0 lg:max-w-none lg:pr-4 xl:pr-6">
              <h1
                id="hero-heading"
                className="font-sans text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.15rem] xl:text-[3.35rem]"
              >
                See your money clearly.{" "}
                <span className="font-semibold text-white">
                  {"{"}
                  <span className="bg-gradient-to-r from-sky-200 via-white to-violet-200 bg-clip-text text-transparent">
                    Act with confidence
                  </span>
                  {"}"}.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
                Track balances, categorize spending, and spot patterns—all in one calm workspace. No
                clutter, just the numbers that matter.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[#050510] transition hover:bg-zinc-100 sm:px-8"
                >
                  Start Managing Money
                </Link>
                <a
                  href="#features"
                  className="group inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-white transition hover:text-zinc-200"
                >
                  See Demo
                  <span className="transition group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </a>
              </div>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-10">
                <TrustStat
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  text="$0 cost to start"
                />
                <TrustStat
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 3.375A7.125 7.125 0 0119.875 9.75H13.5V3.375z"
                      />
                    </svg>
                  }
                  text="3 workspace tools in one place"
                />
                <TrustStat
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  text="100% in your browser — works offline"
                />
              </div>
            </div>

            <div className="flex w-full min-w-0 justify-center lg:justify-end">
              <HeroAbstractArt />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative border-t border-white/[0.06] bg-[#07071a] py-20"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="features-heading"
                className="font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Everything you need to stay on track
              </h2>
              <p className="mt-4 text-pretty text-zinc-400">
                Built for clarity—so you spend less time in spreadsheets and more time making
                decisions.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Unified overview"
                description="Income, expenses, and net flow in one glance. Switch tabs to drill into categories without losing context."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                }
              />
              <FeatureCard
                title="Smart categorization"
                description="Group transactions by purpose so you can see where money goes—and where to adjust next month."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                }
              />
              <FeatureCard
                title="Insights that speak plainly"
                description="Highlights and suggestions based on your activity—no jargon, just actionable nudges."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06] bg-[#050510] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <LogoMark size="sm" />
            <span>© {new Date().getFullYear()} KOSH</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
          >
            Dashboard →
          </Link>
        </div>
      </footer>
    </div>
  );
}
