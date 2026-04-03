"use client";

import { useEffect, useRef, useState, type SVGProps } from "react";
import type { InsightBucket, InsightSection } from "@/lib/finance-insights";
import { formatCurrency } from "@/lib/format";

export type InsightSummaryStats = {
  overspentBy: number | null;
  surplus: number | null;
  savingsRatePct: number | null;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  latestMonthNet: number | null;
  latestMonthLabel: string | null;
};

function InsightBody({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-[13px] leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-50">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function SectionGlyph({ bucket, compact }: { bucket: InsightBucket; compact?: boolean }) {
  const box = compact
    ? "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset"
    : "flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset";
  switch (bucket) {
    case "spending":
      return (
        <div
          className={`${box} bg-rose-500/10 text-rose-600 ring-rose-500/15 dark:text-rose-400 dark:ring-rose-500/25`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414-.336.75-.75.75h-.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0-12h-.375m-.75 0h.375m-.75 0H8.25m0 0H7.875m.375 0H8.25m-.375 0v.75m0 0v-.375m0 .375h9.75M8.25 6h9.75m-9.75 0v9.75"
            />
          </svg>
        </div>
      );
    case "trends":
      return (
        <div
          className={`${box} bg-sky-500/10 text-sky-600 ring-sky-500/15 dark:text-sky-400 dark:ring-sky-500/25`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
        </div>
      );
    case "highlights":
      return (
        <div
          className={`${box} bg-amber-500/10 text-amber-600 ring-amber-500/15 dark:text-amber-400 dark:ring-amber-500/25`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </div>
      );
    case "assistant":
      return (
        <div
          className={`${box} bg-violet-500/15 text-violet-600 ring-violet-500/20 dark:text-violet-300 dark:ring-violet-500/30`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5 shrink-0 text-zinc-400" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function InsightDetailModal({
  section,
  onClose,
}: {
  section: InsightSection | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (section) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [section]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onDialogClose = () => onClose();
    el.addEventListener("close", onDialogClose);
    return () => el.removeEventListener("close", onDialogClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-[100] w-[min(calc(100vw-1.5rem),28rem)] max-h-[min(85vh,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/50 open:backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-950"
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      {section ? (
        <div className="flex max-h-[min(85vh,calc(100dvh-2rem))] flex-col">
          <header className="flex shrink-0 items-start gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <SectionGlyph bucket={section.key} />
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{section.title}</h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{section.subtitle}</p>
              {section.key === "assistant" ? (
                <p className="mt-2 text-[11px] leading-snug text-violet-800/90 dark:text-violet-200/85">
                  Not financial advice — summaries from your entries only.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-4">
              {section.items.map((item, index) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {String(index + 1).padStart(2, "0")} · {item.label}
                  </p>
                  <div className="mt-2">
                    <InsightBody text={item.body} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function NumericSummary({ stats }: { stats: InsightSummaryStats }) {
  const primaryOverspent = stats.overspentBy !== null && stats.overspentBy > 0;
  const primaryAmount: number = primaryOverspent
    ? (stats.overspentBy ?? 0)
    : (stats.surplus ?? 0);
  const primaryLabel = primaryOverspent
    ? "Overspent vs income"
    : stats.surplus !== null && stats.surplus > 0
      ? "Surplus after expenses"
      : "Net (income − expenses)";

  return (
    <div className="space-y-3">
      <div
        className={`rounded-xl border px-4 py-3 ${
          primaryOverspent
            ? "border-rose-200/90 bg-gradient-to-br from-rose-50 to-white dark:border-rose-900/50 dark:from-rose-950/30 dark:to-zinc-950"
            : "border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/50 dark:from-emerald-950/25 dark:to-zinc-950"
        }`}
      >
        <p
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            primaryOverspent ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {primaryLabel}
        </p>
        <p
          className={`mt-0.5 font-sans text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${
            primaryOverspent ? "text-rose-800 dark:text-rose-200" : "text-emerald-800 dark:text-emerald-200"
          }`}
        >
          {formatCurrency(primaryAmount)}
        </p>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {primaryOverspent
            ? "Expenses exceed total income in this dataset."
            : "Based on all income and expense entries you’ve logged."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/90 px-2 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Income</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatCurrency(stats.totalIncome)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/90 px-2 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Expenses</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatCurrency(stats.totalExpenses)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/90 px-2 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Savings rate</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {stats.savingsRatePct !== null ? `${stats.savingsRatePct}%` : "—"}
          </p>
        </div>
      </div>

      {stats.latestMonthNet !== null && stats.latestMonthLabel ? (
        <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/30">
          <span className="text-zinc-500 dark:text-zinc-400">Latest month net</span>
          <span
            className={`font-semibold tabular-nums ${
              stats.latestMonthNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(stats.latestMonthNet)}
            <span className="ml-1 font-normal text-zinc-400 dark:text-zinc-500">({stats.latestMonthLabel})</span>
          </span>
        </div>
      ) : null}

      <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Net balance: <span className="font-medium text-zinc-600 dark:text-zinc-300">{formatCurrency(stats.netBalance)}</span>
      </p>
    </div>
  );
}

export function FinanceInsightsPanel({
  sections,
  stats,
}: {
  sections: InsightSection[];
  stats: InsightSummaryStats;
}) {
  const [activeKey, setActiveKey] = useState<InsightBucket | null>(null);
  const activeSection = activeKey ? sections.find((s) => s.key === activeKey) ?? null : null;

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No insights to show yet</p>
        <p className="mt-1 text-xs text-zinc-500">Add transactions to see numbers and topic breakdowns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NumericSummary stats={stats} />

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Explore by topic
        </p>
        <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {sections.map((section) => (
            <li key={section.key} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveKey(section.key)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
              >
                <SectionGlyph bucket={section.key} compact />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{section.title}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{section.subtitle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {section.items.length}
                </span>
                <ChevronRight />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <InsightDetailModal section={activeSection} onClose={() => setActiveKey(null)} />
    </div>
  );
}
