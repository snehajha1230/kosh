"use client";

import { useMemo, useState } from "react";
import type { Transaction } from "@/components/finance/finance-context";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { CategorySpend } from "@/lib/aggregates";
import { layoutIncomeTreemap } from "@/lib/treemap-layout";

const TILE_COLORS = [
  "#0369a1",
  "#0d9488",
  "#4f46e5",
  "#b45309",
  "#be123c",
  "#15803d",
  "#a21caf",
  "#c2410c",
];

type IncomeTreemapProps = {
  incomeBreakdown: CategorySpend[];
  totalIncome: number;
  transactions: Transaction[];
};

export function IncomeTreemap({ incomeBreakdown, totalIncome, transactions }: IncomeTreemapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [drillCategory, setDrillCategory] = useState<string | null>(null);

  const rects = useMemo(() => layoutIncomeTreemap(incomeBreakdown), [incomeBreakdown]);

  const drillTransactions = useMemo(() => {
    if (!drillCategory) return [];
    return transactions
      .filter((t) => t.type === "income" && t.category === drillCategory)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, drillCategory]);

  const hoverMeta = useMemo(() => {
    if (!hovered || totalIncome <= 0) return null;
    const row = incomeBreakdown.find((r) => r.category === hovered);
    if (!row) return null;
    const pct = Math.round((row.total / totalIncome) * 100);
    return { category: row.category, amount: row.total, pct };
  }, [hovered, incomeBreakdown, totalIncome]);

  const toggleDrill = (category: string) => {
    setDrillCategory((c) => (c === category ? null : category));
  };

  if (incomeBreakdown.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No income recorded.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="min-h-[1.25rem] text-sm text-zinc-600 dark:text-zinc-400">
        {hoverMeta ? (
          <>
            <span className="font-semibold text-sky-700 dark:text-sky-300">{hoverMeta.category}</span>
            {" — "}
            <span className="tabular-nums">{formatCurrency(hoverMeta.amount)}</span>
            <span className="text-zinc-500 dark:text-zinc-500"> ({hoverMeta.pct}% of income)</span>
          </>
        ) : (
          <span className="text-zinc-500 dark:text-zinc-500">
            Hover a tile for amount and share. Click to drill into entries.
          </span>
        )}
      </p>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
        style={{ aspectRatio: "5 / 3", maxHeight: "min(42vh, 420px)" }}
        role="presentation"
      >
        {rects.map((r, i) => {
          const isDrilled = drillCategory === r.category;
          const color = TILE_COLORS[i % TILE_COLORS.length];
          const showLabel = r.h >= 0.12 && r.w >= 0.18;
          return (
            <button
              key={r.category}
              type="button"
              className={`absolute flex flex-col items-start justify-start overflow-hidden border border-white/25 p-2 text-left shadow-sm transition-[transform,box-shadow,filter] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-400 dark:border-zinc-950/40 ${
                isDrilled ? "z-10 ring-2 ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950" : ""
              } ${hovered === r.category ? "z-[5] brightness-110" : "hover:brightness-105"}`}
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                width: `${r.w * 100}%`,
                height: `${r.h * 100}%`,
                backgroundColor: color,
              }}
              onMouseEnter={() => setHovered(r.category)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => toggleDrill(r.category)}
              aria-pressed={isDrilled}
              aria-label={`${r.category}, ${formatCurrency(r.total)}. Click for transaction list.`}
            >
              {showLabel && (
                <>
                  <span className="line-clamp-2 text-left text-xs font-bold leading-tight text-white drop-shadow-sm sm:text-sm">
                    {r.category}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium tabular-nums text-white/90 drop-shadow sm:text-xs">
                    {formatCurrency(r.total)}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {drillCategory && (
        <div
          className="summary-panel-animate rounded-xl border border-sky-200/70 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20"
          role="region"
          aria-label={`Income entries for ${drillCategory}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                Drill-down
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {drillCategory}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {drillTransactions.length} entr
                {drillTransactions.length === 1 ? "y" : "ies"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrillCategory(null)}
              className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
          {drillTransactions.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No line items in this category.</p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1 text-sm">
              {drillTransactions.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-zinc-100 bg-white/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">
                    {t.description}
                  </span>
                  <span className="shrink-0 tabular-nums font-medium text-sky-700 dark:text-sky-300">
                    {formatCurrency(t.amount)}
                  </span>
                  <span className="w-full text-xs text-zinc-500 dark:text-zinc-400">
                    {formatShortDate(t.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
