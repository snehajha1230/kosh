"use client";

import { useId, useMemo, useState } from "react";
import { useFinance } from "@/components/finance/finance-context";
import { formatCurrency } from "@/lib/format";

const SLICE_COLORS = [
  "#059669",
  "#0284c7",
  "#7c3aed",
  "#d97706",
  "#e11d48",
  "#0d9488",
  "#ea580c",
  "#4f46e5",
  "#db2777",
  "#65a30d",
];

const TAU = Math.PI * 2;

function describeSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

type ExpensePieChartProps = {
  /** Inside summary tabs — no outer card, tighter layout */
  variant?: "standalone" | "embedded";
};

export function ExpensePieChart({ variant = "standalone" }: ExpensePieChartProps) {
  const { categorySpending, transactions } = useFinance();
  const gradId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const embedded = variant === "embedded";
  const highlight = embedded ? (hovered ?? activeSlice) : hovered;

  const expenses = transactions.filter((t) => t.type === "expense");

  const slices = useMemo(() => {
    const total = categorySpending.reduce((s, c) => s + c.total, 0);
    if (total <= 0) return [];
    let angle = -Math.PI / 2;
    return categorySpending.map((row, i) => {
      const fraction = row.total / total;
      const start = angle;
      angle += fraction * TAU;
      return {
        ...row,
        startAngle: start,
        endAngle: angle,
        fraction,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
      };
    });
  }, [categorySpending]);

  const cx = 100;
  const cy = 100;
  const r = 88;

  if (expenses.length === 0) {
    if (embedded) {
      return (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No expenses recorded.</p>
      );
    }
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Expenses by category
        </h2>
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No expenses recorded. Your expense pie chart will appear once you add expense
          transactions.
        </p>
      </section>
    );
  }

  const labelParts = slices.map(
    (s) => `${s.category} ${Math.round(s.fraction * 100)} percent`,
  );

  const chartBlock = (
    <>
      {!embedded && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Expenses by category
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Share of total spending — hover slices for detail
            </p>
          </div>
          <span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Pie chart
          </span>
        </div>
      )}

      <div
        className={
          embedded
            ? "mt-2 flex w-full flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:gap-8"
            : "mt-8 flex min-h-[min(52vh,420px)] flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:justify-evenly lg:gap-12"
        }
      >
        <div
          className={
            embedded
              ? "flex w-full shrink-0 flex-col items-center sm:w-auto sm:items-start sm:pl-3 md:pl-6"
              : "relative shrink-0"
          }
        >
          <svg
            viewBox="0 0 200 200"
            className={
              embedded
                ? "h-[min(56vw,220px)] w-[min(56vw,220px)] max-w-[240px] drop-shadow-md sm:h-[220px] sm:w-[220px]"
                : "h-[min(52vw,280px)] w-[min(52vw,280px)] max-w-[320px] drop-shadow-sm sm:h-[min(48vw,300px)] sm:w-[min(48vw,300px)]"
            }
            role="img"
            aria-label={`Expense breakdown by category: ${labelParts.join(", ")}`}
          >
            <defs>
              <radialGradient id={`${gradId}-hole`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="white" stopOpacity="0.12" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g
              style={{
                transform: highlight !== null ? "scale(1.02)" : "scale(1)",
                transformOrigin: "100px 100px",
                transition: "transform 0.2s ease-out",
              }}
            >
              {slices.map((s, i) => (
                <path
                  key={s.category}
                  d={describeSlice(cx, cy, r, s.startAngle, s.endAngle)}
                  fill={s.color}
                  stroke="var(--pie-stroke, rgb(24 24 27 / 0.12))"
                  strokeWidth={highlight === i ? 2.5 : 1.25}
                  className="cursor-pointer transition-[opacity,stroke-width] duration-200 dark:[--pie-stroke:rgb(39_39_42/0.5)]"
                  style={{
                    opacity: highlight === null || highlight === i ? 1 : 0.45,
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={
                    embedded
                      ? () => setActiveSlice((a) => (a === i ? null : i))
                      : undefined
                  }
                />
              ))}
            </g>
            <circle cx={cx} cy={cy} r={42} fill={`url(#${gradId}-hole)`} className="pointer-events-none" />
            <circle
              cx={cx}
              cy={cy}
              r={40}
              className="pointer-events-none fill-white dark:fill-zinc-950"
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              className="fill-zinc-400 text-[8px] font-medium uppercase tracking-wider"
            >
              Total
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="fill-zinc-900 text-[11px] font-semibold dark:fill-zinc-100"
            >
              {formatCurrency(categorySpending.reduce((s, c) => s + c.total, 0))}
            </text>
          </svg>
          {embedded && (
            <p className="mt-3 min-h-[2.75rem] w-full max-w-[240px] text-center text-xs text-zinc-600 sm:text-left dark:text-zinc-400">
              {highlight !== null && slices[highlight] ? (
                <>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {slices[highlight].category}
                  </span>
                  <br />
                  <span className="tabular-nums">{formatCurrency(slices[highlight].total)}</span>
                  <span className="text-zinc-500 dark:text-zinc-500">
                    {" "}
                    ({Math.round(slices[highlight].fraction * 100)}% of expenses)
                  </span>
                </>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-500">
                  Tap or hover a slice to see category, amount, and share.
                </span>
              )}
            </p>
          )}
        </div>

        {embedded ? (
          <ul className="grid min-w-0 flex-1 grid-cols-1 gap-3 content-start sm:grid-cols-3 sm:gap-3">
            {slices.map((s, i) => (
              <li
                key={s.category}
                className={`min-h-0 cursor-pointer rounded-xl border px-3 py-3 text-left transition-colors duration-200 ${
                  highlight === i
                    ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/35"
                    : "border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30"
                }`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setActiveSlice((a) => (a === i ? null : i))}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 size-3 shrink-0 rounded-sm ring-1 ring-black/10 dark:ring-white/10"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-200">
                      {s.category}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(s.total)}
                    </p>
                    <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
                      {Math.round(s.fraction * 100)}% of expenses
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {!embedded && (
          <ul className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-lg lg:gap-4">
            {slices.map((s, i) => (
              <li
                key={s.category}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 ${
                  hovered === i
                    ? "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/80"
                    : "border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30"
                }`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="size-3 shrink-0 rounded-sm ring-1 ring-black/10 dark:ring-white/10"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {s.category}
                  </p>
                  <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatCurrency(s.total)}{" "}
                    <span className="text-zinc-400 dark:text-zinc-500">
                      ({Math.round(s.fraction * 100)}%)
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="expense-pie-embedded">{chartBlock}</div>;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
      {chartBlock}
    </section>
  );
}
