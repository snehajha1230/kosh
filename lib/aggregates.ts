import type { Transaction } from "./types";

export function sumIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
}

export function sumExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
}

export function netBalance(transactions: Transaction[]): number {
  return sumIncome(transactions) - sumExpenses(transactions);
}

/** Month key YYYY-MM */
function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export type MonthlyBalancePoint = { label: string; balance: number };

/** One row per calendar day: cumulative income/expense and running balance (for dense stacked charts). */
export type DailyStackPoint = {
  day: string;
  cumIncome: number;
  cumExpense: number;
  balance: number;
};

function addCalendarDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

const DAILY_STACK_MAX_POINTS = 240;

/**
 * Daily cumulative income & expense from first to last transaction date.
 * Downsamples by day stride if the range exceeds DAILY_STACK_MAX_POINTS.
 */
export function dailyStackedBalanceSeries(transactions: Transaction[]): DailyStackPoint[] {
  if (transactions.length === 0) return [];
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const firstDay = sorted[0].date.slice(0, 10);
  const lastDay = sorted[sorted.length - 1].date.slice(0, 10);

  const byDay = new Map<string, { inc: number; exp: number }>();
  for (const t of sorted) {
    const d = t.date.slice(0, 10);
    const cur = byDay.get(d) ?? { inc: 0, exp: 0 };
    if (t.type === "income") cur.inc += t.amount;
    else cur.exp += t.amount;
    byDay.set(d, cur);
  }

  const dense: DailyStackPoint[] = [];
  let cumI = 0;
  let cumE = 0;
  for (let d = firstDay; d <= lastDay; d = addCalendarDay(d)) {
    const delta = byDay.get(d);
    if (delta) {
      cumI += delta.inc;
      cumE += delta.exp;
    }
    dense.push({ day: d, cumIncome: cumI, cumExpense: cumE, balance: cumI - cumE });
  }

  if (dense.length <= DAILY_STACK_MAX_POINTS) return dense;

  const stride = Math.ceil(dense.length / DAILY_STACK_MAX_POINTS);
  const out: DailyStackPoint[] = [];
  for (let i = 0; i < dense.length; i += stride) {
    out.push(dense[i]);
  }
  const last = dense[dense.length - 1];
  if (out[out.length - 1]?.day !== last.day) out.push(last);
  return out;
}

/** Running balance at end of each calendar month (sorted chronologically). */
export function monthlyBalanceTrend(transactions: Transaction[]): MonthlyBalancePoint[] {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const byMonth = new Map<string, number>();

  for (const t of sorted) {
    const key = monthKey(t.date);
    running += t.type === "income" ? t.amount : -t.amount;
    byMonth.set(key, running);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, balance]) => ({ label: ym, balance }));
}

export type CategorySpend = { category: string; total: number };

export function spendingByCategory(transactions: Transaction[]): CategorySpend[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function incomeByCategory(transactions: Transaction[]): CategorySpend[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "income") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export type MonthTotals = { month: string; income: number; expense: number };

export function monthlyTotalsComparison(transactions: Transaction[]): MonthTotals[] {
  const map = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const key = monthKey(t.date);
    const cur = map.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "income") cur.income += t.amount;
    else cur.expense += t.amount;
    map.set(key, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));
}
