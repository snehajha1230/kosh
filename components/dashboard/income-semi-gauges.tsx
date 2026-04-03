"use client";

import { useId } from "react";
import { formatCurrency } from "@/lib/format";
import type { CategorySpend } from "@/lib/aggregates";

type IncomeSemiGaugesProps = {
  breakdown: CategorySpend[];
  totalIncome: number;
};

function polar(cx: number, cy: number, r: number, θ: number) {
  return { x: cx + r * Math.cos(θ), y: cy - r * Math.sin(θ) };
}

/**
 * Top three income categories — full-width row of glass-style half-donut gauges (satisfaction-style UI).
 */
export function IncomeSemiGauges({ breakdown, totalIncome }: IncomeSemiGaugesProps) {
  const top = breakdown.slice(0, 3);
  const rootId = useId().replace(/:/g, "");

  if (top.length === 0 || totalIncome <= 0) {
    return null;
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3 lg:gap-4">
      {top.map((row, i) => (
        <SatisfactionStyleGauge
          key={row.category}
          label={row.category}
          amount={row.total}
          total={totalIncome}
          gradId={`${rootId}-arc-${i}`}
          glowId={`${rootId}-glow-${i}`}
        />
      ))}
    </div>
  );
}

function SatisfactionStyleGauge({
  label,
  amount,
  total,
  gradId,
  glowId,
}: {
  label: string;
  amount: number;
  total: number;
  gradId: string;
  glowId: string;
}) {
  const pct = total > 0 ? Math.min(100, (amount / total) * 100) : 0;
  const p = pct / 100;

  const cx = 100;
  const cy = 100;
  const R = 72;
  const strokeW = 14;
  const gap = 0.18;
  const θLeft = Math.PI - gap;
  const θRight = gap;
  const arcSpan = θLeft - θRight;
  const θEnd = θLeft - p * arcSpan;

  const pStart = polar(cx, cy, R, θLeft);
  const pFullEnd = polar(cx, cy, R, θRight);
  const pProgEnd = polar(cx, cy, R, θEnd);

  const trackD = `M ${pStart.x} ${pStart.y} A ${R} ${R} 0 0 1 ${pFullEnd.x} ${pFullEnd.y}`;
  const progD = `M ${pStart.x} ${pStart.y} A ${R} ${R} 0 0 1 ${pProgEnd.x} ${pProgEnd.y}`;

  const pctRounded = Math.round(pct);

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800 via-[#0f1419] to-[#080b10] p-4 shadow-[0_8px_32px_rgb(0_0_0/0.35)] ring-1 ring-white/[0.06] sm:p-5 dark:border-slate-600/40 dark:from-slate-900 dark:via-[#0a0e14] dark:to-[#05070a] dark:ring-white/[0.04]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.45]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgb(251 191 36 / 0.08) 0%, transparent 45%),
            radial-gradient(circle at 80% 20%, rgb(255 255 255 / 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 70%, rgb(56 189 248 / 0.05) 0%, transparent 50%)
          `,
        }}
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-[min(100%,260px)] flex-col items-center">
        <svg
          viewBox="0 0 200 112"
          className="h-auto w-full overflow-visible drop-shadow-[0_0_20px_rgb(251_191_36/0.15)]"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#78716c" />
              <stop offset="28%" stopColor="#b45309" />
              <stop offset="55%" stopColor="#fbbf24" />
              <stop offset="82%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={trackD}
            fill="none"
            stroke="rgb(30 41 59 / 0.85)"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          {pct > 0 && (
            <path
              d={progD}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeW}
              strokeLinecap="round"
              filter={`url(#${glowId})`}
            />
          )}
          {pct > 0 && (
            <>
              <circle
                cx={pProgEnd.x}
                cy={pProgEnd.y}
                r={5.5}
                fill="#fffef5"
                className="drop-shadow-[0_0_10px_rgb(255_255_255/0.95)]"
              />
              <circle cx={pProgEnd.x} cy={pProgEnd.y} r={2.8} fill="#fef08a" opacity={0.95} />
            </>
          )}
        </svg>

        <div className="-mt-11 flex w-full flex-col items-center px-1 text-center sm:-mt-12">
          <span className="mb-1 inline-flex max-w-[92%] items-center gap-0.5 truncate rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[0.6rem] font-semibold tabular-nums text-amber-100/95 backdrop-blur-sm dark:bg-black/40 sm:text-[0.65rem]">
            <span className="shrink-0 text-[0.55rem]" aria-hidden>
              ↑
            </span>
            <span className="truncate">{formatCurrency(amount)}</span>
          </span>
          <p className="max-w-full line-clamp-2 text-[0.7rem] font-medium leading-tight text-slate-300 dark:text-slate-400 sm:text-xs">
            {label}
          </p>
          <p
            className="mt-1 font-sans text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl"
            style={{ textShadow: "0 0 24px rgb(251 191 36 / 0.35), 0 0 48px rgb(251 191 36 / 0.12)" }}
          >
            {pctRounded}%
          </p>
          <p className="mt-0.5 text-[0.65rem] tabular-nums text-slate-400 dark:text-slate-500 sm:text-xs">
            Share of total income
          </p>
        </div>
      </div>
    </div>
  );
}
