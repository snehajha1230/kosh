"use client";

import { useFinance } from "@/components/finance/finance-context";
import { BalanceTrendChart } from "./balance-trend-chart";
import { HeaderBar } from "./header-bar";
import { SummaryCards } from "./summary-cards";
import { TransactionsSection } from "./transactions-section";

export function Dashboard() {
  const { isAdmin, resetDemo } = useFinance();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <HeaderBar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <SummaryCards />

        <BalanceTrendChart />

        <TransactionsSection />

        {isAdmin && (
          <footer className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:text-left">
            <p>Data is stored in your browser (localStorage) for this demo.</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset all transactions to the original demo set?")) {
                  resetDemo();
                }
              }}
              className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Reset demo data
            </button>
          </footer>
        )}
      </main>
    </div>
  );
}
