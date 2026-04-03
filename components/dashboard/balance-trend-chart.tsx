"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useFinance } from "@/components/finance/finance-context";
import { type DailyStackPoint, dailyStackedBalanceSeries } from "@/lib/aggregates";
import { formatCurrency, formatCurrencyDetailed, formatShortDate } from "@/lib/format";

type RangeKey = "1m" | "4m" | "1y";

const RANGE_OPTIONS: { id: RangeKey; label: string; days: number }[] = [
  { id: "1y", label: "1 year", days: 366 },
  { id: "4m", label: "4 month", days: 124 },
  { id: "1m", label: "1 month", days: 31 },
];

/** Cap points drawn as a path so long ranges stay a smooth curve, not a scribble. */
const MAX_PATH_STOPS = 40;

const Y_LABEL_COUNT = 7;
const X_LABEL_COUNT = 7;

function formatDayTick(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(ymd + "T12:00:00"),
  );
}

function formatAxisMoney(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

function filterPointsByRange(points: DailyStackPoint[], range: RangeKey): DailyStackPoint[] {
  if (points.length === 0) return points;
  const days = RANGE_OPTIONS.find((r) => r.id === range)!.days;
  const lastDay = points[points.length - 1]!.day;
  const end = new Date(lastDay + "T12:00:00");
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().slice(0, 10);
  return points.filter((p) => p.day >= startStr);
}

/** Indices (into full series) used only for the visible path — evenly spaced, always includes ends. */
function pathSampleIndices(n: number): number[] {
  if (n <= MAX_PATH_STOPS) return Array.from({ length: n }, (_, i) => i);
  const out: number[] = [];
  for (let j = 0; j < MAX_PATH_STOPS; j++) {
    out.push(Math.round((j / (MAX_PATH_STOPS - 1)) * (n - 1)));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

/** Smooth cubic path through points (Catmull-Rom–style control points). */
function smoothLinePath(xs: number[], ys: number[]): string {
  if (xs.length === 0) return "";
  if (xs.length === 1) return `M ${xs[0]} ${ys[0]}`;
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0 = i > 0 ? ([xs[i - 1], ys[i - 1]] as const) : ([xs[i], ys[i]] as const);
    const p1 = [xs[i], ys[i]] as const;
    const p2 = [xs[i + 1], ys[i + 1]] as const;
    const p3 =
      i < xs.length - 2 ? ([xs[i + 2], ys[i + 2]] as const) : ([xs[i + 1], ys[i + 1]] as const);
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function BalanceTrendChart() {
  const { transactions, summary } = useFinance();
  const fillGradId = useId().replace(/:/g, "");
  const [range, setRange] = useState<RangeKey>("4m");
  const [hover, setHover] = useState<{ index: number; clientX: number; clientY: number } | null>(
    null,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [plotInnerW, setPlotInnerW] = useState(720);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setPlotInnerW(Math.max(320, Math.floor(el.getBoundingClientRect().width)));
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const fullSeries = useMemo(() => dailyStackedBalanceSeries(transactions), [transactions]);
  const points = useMemo(() => filterPointsByRange(fullSeries, range), [fullSeries, range]);

  const chart = useMemo(() => {
    if (points.length === 0) return null;

    const leftGutter = 56;
    const rightGutter = 8;
    const chartW = Math.max(200, plotInnerW - leftGutter - rightGutter);
    const chartH = 176;
    const padT = 10;
    const padB = 36;
    const n = points.length;

    const balances = points.map((p) => p.balance);
    const minB = Math.min(...balances);
    const maxB = Math.max(...balances);
    const span = maxB - minB;
    const pad = span === 0 ? Math.max(800, Math.abs(maxB) * 0.12) : span * 0.22;
    const yMin = minB - pad;
    const yMax = maxB + pad;

    const mapY = (v: number) => chartH - ((v - yMin) / (yMax - yMin)) * chartH;

    const xs =
      n === 1 ? [chartW / 2, chartW / 2] : points.map((_, i) => (i / Math.max(1, n - 1)) * chartW);

    const yBal = n === 1 ? [mapY(balances[0]!), mapY(balances[0]!)] : balances.map((b) => mapY(b));

    const sampleIdx = pathSampleIndices(n);
    const xsPath = sampleIdx.map((i) => xs[i]!);
    const yPath = sampleIdx.map((i) => yBal[i]!);
    const pathLine = smoothLinePath(xsPath, yPath);
    const yBase = mapY(yMin);
    const pathArea =
      sampleIdx.length > 0
        ? `${pathLine} L ${xsPath[xsPath.length - 1]!} ${yBase} L ${xsPath[0]!} ${yBase} Z`
        : "";

    const yTicks: number[] = [];
    for (let k = 0; k < Y_LABEL_COUNT; k++) {
      yTicks.push(yMin + (k / (Y_LABEL_COUNT - 1)) * (yMax - yMin));
    }

    const tickIdxs = (() => {
      if (n <= 1) return [0];
      const idxs: number[] = [];
      for (let k = 0; k < X_LABEL_COUNT; k++) {
        idxs.push(Math.round((k / (X_LABEL_COUNT - 1)) * (n - 1)));
      }
      return [...new Set(idxs)].sort((a, b) => a - b);
    })();

    const firstBal = balances[0]!;
    const lastBal = balances[balances.length - 1]!;
    let trendPct: number | null = null;
    if (firstBal !== 0) {
      trendPct = ((lastBal - firstBal) / Math.abs(firstBal)) * 100;
    } else if (lastBal !== 0) {
      trendPct = lastBal > 0 ? 100 : -100;
    }

    const totalSvgW = leftGutter + chartW + rightGutter;

    return {
      leftGutter,
      rightGutter,
      chartW,
      chartH,
      padT,
      padB,
      totalSvgW,
      totalH: padT + chartH + padB,
      xs,
      yBal,
      pathLine,
      pathArea,
      mapY,
      yTicks,
      tickIdxs,
      trendPct,
      n,
    };
  }, [points, plotInnerW]);

  if (transactions.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total balance</h2>
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No timeline data yet. Record transactions to see balance over time.
        </p>
      </section>
    );
  }

  if (!chart) {
    return null;
  }

  const {
    leftGutter,
    chartW,
    chartH,
    padT,
    padB,
    totalSvgW,
    totalH,
    xs,
    yBal,
    pathLine,
    pathArea,
    mapY,
    yTicks,
    tickIdxs,
    trendPct,
    n,
  } = chart;

  const hoverPoint = hover && points[hover.index] ? points[hover.index] : null;
  const hoverYBal = hover ? yBal[hover.index] ?? 0 : 0;

  let tipLeft = hover ? hover.clientX + 14 : 0;
  let tipTop = hover ? hover.clientY - 56 : 0;
  if (typeof window !== "undefined" && hover) {
    const maxL = window.innerWidth - 220;
    if (tipLeft > maxL) tipLeft = Math.max(12, hover.clientX - 200);
    if (tipTop < 8) tipTop = hover.clientY + 20;
  }

  const emphasisIdx = hover?.index ?? n - 1;
  const tickEmphasis = tickIdxs.reduce((best, i) =>
    Math.abs(i - emphasisIdx) < Math.abs(best - emphasisIdx) ? i : best,
  tickIdxs[0]!);

  return (
    <section className="w-full min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total balance</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-sans text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50 sm:text-4xl">
              {formatCurrencyDetailed(summary.balance)}
            </span>
            {trendPct !== null && Number.isFinite(trendPct) ? (
              <span
                className={`text-sm font-semibold tabular-nums ${
                  trendPct >= 0
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {trendPct >= 0 ? "+" : ""}
                {trendPct.toFixed(1)}%
              </span>
            ) : (
              <span className="text-sm text-zinc-400 dark:text-zinc-500">—</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
          {RANGE_OPTIONS.map((opt) => {
            const active = range === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-cyan-500/40 bg-cyan-500/10 text-zinc-900 dark:border-cyan-400/35 dark:bg-cyan-400/10 dark:text-zinc-100"
                    : "border-transparent bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/90 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {active ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                ) : null}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={containerRef} className="relative mt-5 w-full min-w-0">
        <svg
          viewBox={`0 0 ${totalSvgW} ${totalH}`}
          className="h-[min(42vh,220px)] w-full min-h-[200px]"
          preserveAspectRatio="xMinYMid meet"
          role="img"
          aria-label={`Balance over time, ${points.length} days in view.`}
        >
          <defs>
            <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g transform={`translate(0 ${padT})`}>
            {yTicks.map((tv, i) => (
              <text
                key={`yt-${i}`}
                x={leftGutter - 12}
                y={mapY(tv)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-zinc-600 text-[10px] font-medium tabular-nums dark:fill-zinc-400"
              >
                {formatAxisMoney(tv)}
              </text>
            ))}

            <g transform={`translate(${leftGutter} 0)`}>
              {pathArea ? <path d={pathArea} fill={`url(#${fillGradId})`} /> : null}
              <path
                d={pathLine}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dark:stroke-[#c084fc]"
              />

              <rect
                x="0"
                y="0"
                width={chartW}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseMove={(e) => {
                  const svg = e.currentTarget.ownerSVGElement;
                  if (!svg) return;
                  const r = svg.getBoundingClientRect();
                  const scaleX = totalSvgW / r.width;
                  const xSvg = (e.clientX - r.left) * scaleX - leftGutter;
                  const idx =
                    n <= 1 ? 0 : Math.max(0, Math.min(n - 1, Math.round((xSvg / chartW) * (n - 1))));
                  setHover({ index: idx, clientX: e.clientX, clientY: e.clientY });
                }}
                onMouseLeave={() => setHover(null)}
              />

              {hover !== null && hoverPoint ? (
                <>
                  <line
                    x1={xs[hover.index] ?? 0}
                    x2={xs[hover.index] ?? 0}
                    y1="0"
                    y2={chartH}
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                    className="opacity-50 dark:stroke-[#c084fc]"
                    pointerEvents="none"
                  />
                  <circle
                    cx={xs[hover.index] ?? 0}
                    cy={hoverYBal}
                    r="5"
                    fill="#a855f7"
                    stroke="white"
                    strokeWidth="2"
                    className="dark:fill-[#c084fc] dark:stroke-zinc-950"
                    pointerEvents="none"
                  />
                </>
              ) : (
                <circle
                  cx={xs[n - 1] ?? 0}
                  cy={yBal[n - 1] ?? 0}
                  r="4.5"
                  fill="#a855f7"
                  stroke="white"
                  strokeWidth="2"
                  className="dark:fill-[#c084fc] dark:stroke-zinc-950"
                  pointerEvents="none"
                />
              )}
            </g>
          </g>

          <g transform={`translate(${leftGutter} ${padT + chartH + 8})`}>
            {tickIdxs.map((i, ti) => {
              const isHi = i === tickEmphasis;
              const isFirst = ti === 0;
              const isLast = ti === tickIdxs.length - 1;
              const xPos = xs[i] ?? 0;
              const anchor = isFirst ? "start" : isLast ? "end" : "middle";
              const xAdj = isFirst ? 2 : isLast ? chartW - 2 : xPos;
              return (
                <text
                  key={points[i]!.day}
                  x={xAdj}
                  y={14}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className={`text-[9px] sm:text-[10px] ${
                    isHi
                      ? "fill-zinc-700 font-semibold dark:fill-zinc-300"
                      : "fill-zinc-600 dark:fill-zinc-400"
                  }`}
                >
                  {formatDayTick(points[i]!.day)}
                </text>
              );
            })}
          </g>
        </svg>

        {hover && hoverPoint ? (
          <div
            className="pointer-events-none fixed z-50 rounded-xl border border-violet-200/80 bg-white/95 px-3 py-2 text-left shadow-lg backdrop-blur-sm dark:border-violet-500/25 dark:bg-zinc-900/95"
            style={{ left: tipLeft, top: tipTop }}
            role="status"
          >
            <p className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
              {formatShortDate(hoverPoint.day)}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatCurrency(hoverPoint.balance)}
            </p>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">Running balance · hover for date</p>
    </section>
  );
}
