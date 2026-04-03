"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/components/finance/finance-context";
import { incomeByCategory } from "@/lib/aggregates";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { getInsightSections } from "@/lib/finance-insights";
import { ExpensePieChart } from "./expense-pie-chart";
import { IncomeSemiGauges } from "./income-semi-gauges";
import { FinanceInsightsPanel, type InsightSummaryStats } from "./insights-content";

type SummaryTab = "overview" | "income" | "expenses" | "insights";

const TABS: { id: SummaryTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "income", label: "Income" },
  { id: "expenses", label: "Expenses" },
  { id: "insights", label: "Insights" },
];

export function SummaryCards() {
  const { summary, transactions, categorySpending, monthComparison } = useFinance();
  const [tab, setTab] = useState<SummaryTab>("overview");
  const hasData = transactions.length > 0;

  const incomeBreakdown = useMemo(() => incomeByCategory(transactions), [transactions]);

  const incomeCount = useMemo(
    () => transactions.filter((t) => t.type === "income").length,
    [transactions],
  );
  const expenseCount = useMemo(
    () => transactions.filter((t) => t.type === "expense").length,
    [transactions],
  );

  const latestMonth = monthComparison.length > 0 ? monthComparison[monthComparison.length - 1] : null;

  const savingsRate =
    summary.income > 0
      ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
      : null;

  const insightSections = useMemo(
    () => getInsightSections(categorySpending, monthComparison, transactions),
    [categorySpending, monthComparison, transactions],
  );

  const insightStats: InsightSummaryStats = useMemo(
    () => ({
      overspentBy:
        summary.expenses > summary.income ? summary.expenses - summary.income : null,
      surplus: summary.expenses <= summary.income ? summary.income - summary.expenses : null,
      savingsRatePct: savingsRate,
      totalIncome: summary.income,
      totalExpenses: summary.expenses,
      netBalance: summary.balance,
      latestMonthNet: latestMonth ? latestMonth.income - latestMonth.expense : null,
      latestMonthLabel: latestMonth ? formatMonthLabel(latestMonth.month) : null,
    }),
    [summary, savingsRate, latestMonth],
  );

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No activity yet</p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Add transactions as admin to see overview, income, expenses, and insights.
        </p>
      </div>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="Financial summary"
    >
      <div
        role="tablist"
        aria-label="Summary views"
        className="flex gap-0 border-b border-zinc-100 bg-zinc-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`summary-tab-${t.id}`}
              aria-controls={`summary-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`relative flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                selected
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`summary-panel-${tab}`}
        aria-labelledby={`summary-tab-${tab}`}
        className="p-5 sm:p-6"
      >
        <div key={tab} className="summary-panel-animate">
          {tab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Net balance
                </p>
                <p className="mt-1 font-sans text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                  {formatCurrency(summary.balance)}
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Income minus expenses across all activity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-sky-200/60 bg-gradient-to-br from-sky-500/10 to-transparent p-4 dark:border-sky-900/50">
                  <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Total income</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(summary.income)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{incomeCount} transactions</p>
                </div>
                <div className="rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-500/10 to-transparent p-4 dark:border-rose-900/50">
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    Total expenses
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(summary.expenses)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{expenseCount} transactions</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Snapshot
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex justify-between gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Savings rate</span>
                    <span className="font-medium tabular-nums">
                      {savingsRate !== null ? `${savingsRate}%` : "—"}
                    </span>
                  </li>
                  {latestMonth && (
                    <li className="flex justify-between gap-2">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Latest month ({formatMonthLabel(latestMonth.month)})
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(latestMonth.income - latestMonth.expense)} net
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {tab === "income" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Total income
                </p>
                <p className="mt-1 font-sans text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                  {formatCurrency(summary.income)}
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Breakdown by category ({incomeCount} entries).
                </p>
              </div>

              {incomeBreakdown.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No income recorded.</p>
              ) : (
                <div className="w-full min-w-0">
                  <IncomeSemiGauges breakdown={incomeBreakdown} totalIncome={summary.income} />
                </div>
              )}
            </div>
          )}

          {tab === "expenses" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Total expenses
                </p>
                <p className="mt-1 font-sans text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                  {formatCurrency(summary.expenses)}
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Spending share by category ({expenseCount} transactions).
                </p>
              </div>
              <ExpensePieChart variant="embedded" />
            </div>
          )}

          {tab === "insights" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Insights
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Snapshot first, then open a topic for the full breakdown.
                </p>
              </div>
              <FinanceInsightsPanel sections={insightSections} stats={insightStats} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
