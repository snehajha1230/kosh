"use client";

import { useMemo, useState } from "react";
import type { Transaction } from "@/components/finance/finance-context";
import { useFinance } from "@/components/finance/finance-context";
import { exportTransactionsCsv } from "@/lib/export-csv";
import { formatCurrencyDetailed, formatShortDate } from "@/lib/format";
import { TransactionModal } from "./transaction-modal";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M17.5 17.5l-4-4m1-5a6 6 0 11-12 0 6 6 0 0112 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M10 3.75a.75.75 0 01.75.75v5.75h5.75a.75.75 0 010 1.5h-5.75v5.75a.75.75 0 01-1.5 0v-5.75H3.75a.75.75 0 010-1.5h5.75V4.5a.75.75 0 01.75-.75z" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.69l-2.22-2.22a.75.75 0 10-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l3.5-3.5a.75.75 0 10-1.06-1.06l-2.22 2.22V2.75z" />
      <path d="M3.75 12.75a.75.75 0 00-.75.75v2A2.75 2.75 0 006.75 18.25h6.5A2.75 2.75 0 0016 15.5v-2a.75.75 0 00-1.5 0v2c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-2a.75.75 0 00-.75-.75z" />
    </svg>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM12.172 5l-7.97 7.97a2 2 0 00-.528.854l-.984 3.934a.5.5 0 00.607.607l3.934-.984a2 2 0 00.854-.528l7.97-7.97-2.828-2.828z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M1.5 8.67v8.58a1 1 0 001 1h15a1 1 0 001-1V8.67l-5.88-5.88a3 3 0 00-4.24 0l-5.88 5.88zm8.49 2.67a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-2.5v-2.5z" />
    </svg>
  );
}

function FilterSlashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M2.75 3.75a.75.75 0 000 1.5h1.258l3.818 7.636a.75.75 0 00.67.414h6.754a.75.75 0 000-1.5H8.742L4.924 4.164a.75.75 0 00-.67-.414H2.75zm12.5 0a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM7.5 14.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.75-1.5a.75.75 0 00-.53.22l-9.5 9.5a.75.75 0 101.06 1.06l9.5-9.5a.75.75 0 00-.53-1.28z" />
    </svg>
  );
}

function rowAccentClass(type: Transaction["type"]) {
  return type === "income"
    ? "border-l-emerald-500 dark:border-l-emerald-400"
    : "border-l-rose-500 dark:border-l-rose-400";
}

export function TransactionsSection() {
  const {
    filteredTransactions,
    transactions,
    filters,
    setFilters,
    isAdmin,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categoriesInData,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const filterTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filteredTransactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const filtersActive =
    filters.search.trim() !== "" || filters.category !== "all" || filters.type !== "all";

  const openNew = () => {
    setEditing(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  const handleSave = (payload: Omit<Transaction, "id"> & { id?: string }) => {
    if (payload.id) {
      updateTransaction({
        id: payload.id,
        date: payload.date,
        amount: payload.amount,
        category: payload.category,
        type: payload.type,
        description: payload.description,
      });
    } else {
      addTransaction({
        date: payload.date,
        amount: payload.amount,
        category: payload.category,
        type: payload.type,
        description: payload.description,
      });
    }
  };

  const onDelete = (t: Transaction) => {
    if (!window.confirm(`Remove “${t.description}”?`)) return;
    deleteTransaction(t.id);
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "all", type: "all" });
  };

  const categoryOptions = ["all", ...categoriesInData];

  const showingLabel =
    transactions.length === 0
      ? "No entries"
      : filteredTransactions.length === transactions.length
        ? `All ${transactions.length} shown`
        : `${filteredTransactions.length} of ${transactions.length} shown`;

  const emptyNoData = transactions.length === 0;
  const emptyFiltered = !emptyNoData && filteredTransactions.length === 0;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-950/[0.04] dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.06]"
      aria-labelledby="transactions-heading"
    >
      <div className="border-b border-zinc-100 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 px-5 py-5 dark:border-zinc-800 dark:from-zinc-900/80 dark:via-zinc-950 dark:to-emerald-950/20 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="transactions-heading"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Transactions
              </h2>
              <span className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white/80 px-2.5 py-0.5 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
                {showingLabel}
              </span>
            </div>
            <p className="max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              Find entries quickly, refine with filters, and export when you need a spreadsheet.
              {isAdmin ? " As admin you can add or edit any row." : " Switch to Admin to add data."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                <PlusIcon className="h-4 w-4 opacity-95" />
                Add transaction
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                exportTransactionsCsv(
                  filteredTransactions.map((t) => ({
                    date: t.date,
                    amount: t.type === "expense" ? -t.amount : t.amount,
                    category: t.category,
                    type: t.type,
                    description: t.description,
                  })),
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <DownloadIcon className="h-4 w-4 opacity-80" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200/70 bg-white/60 p-4 shadow-inner shadow-zinc-950/[0.02] dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="relative lg:col-span-6">
              <label htmlFor="tx-search" className="sr-only">
                Search transactions
              </label>
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="tx-search"
                type="search"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Search description, category, or type…"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm transition focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Category
                </span>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ category: e.target.value })}
                  className="w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All categories" : c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Type
                </span>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ type: e.target.value as typeof filters.type })
                  }
                  className="w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="all">Income &amp; expenses</option>
                  <option value="income">Income only</option>
                  <option value="expense">Expenses only</option>
                </select>
              </label>
            </div>
            <div className="flex w-full flex-col gap-2 sm:col-span-2 lg:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Sort
              </span>
              <select
                aria-label="Sort by"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ sortBy: e.target.value as typeof filters.sortBy })
                }
                className="w-full min-w-0 cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="date">Date (newest first)</option>
                <option value="amount">Amount (highest first)</option>
              </select>
            </div>
          </div>
          {filtersActive && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Filters are narrowing this list. Reset to see everything again.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
              >
                <FilterSlashIcon className="h-3.5 w-3.5" />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {!emptyNoData && !emptyFiltered && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">In view — income</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                +{formatCurrencyDetailed(filterTotals.income)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">In view — expenses</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                −{formatCurrencyDetailed(filterTotals.expense)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Net (visible rows)</p>
              <p
                className={`mt-1 text-lg font-semibold tabular-nums ${
                  filterTotals.net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {filterTotals.net >= 0 ? "+" : "−"}
                {formatCurrencyDetailed(Math.abs(filterTotals.net))}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-0 pb-0">
        {emptyNoData ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
              <InboxIcon className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No transactions yet
            </p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              {isAdmin
                ? "Create your first entry to populate the ledger and charts."
                : "Switch to Admin to add demo data and explore the dashboard."}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={openNew}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500"
              >
                <PlusIcon className="h-4 w-4" />
                Add your first transaction
              </button>
            )}
          </div>
        ) : emptyFiltered ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <FilterSlashIcon className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nothing matches
            </p>
            <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Try a different search term, pick another category, or reset filters to see all{" "}
              {transactions.length} entries.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 md:hidden">
              {filteredTransactions.map((t) => (
                <li key={t.id}>
                  <div
                    className={`border-l-[3px] px-4 py-4 ${rowAccentClass(t.type)} bg-white dark:bg-zinc-950`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{t.description}</p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatShortDate(t.date)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                            {t.category}
                          </span>
                          <span
                            className={
                              t.type === "income"
                                ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                                : "inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/70 dark:text-rose-200"
                            }
                          >
                            {t.type === "income" ? "Income" : "Expense"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-base font-semibold tabular-nums ${
                            t.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {t.type === "income" ? "+" : "−"}
                          {formatCurrencyDetailed(t.amount)}
                        </p>
                        {isAdmin && (
                          <div className="mt-2 flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(t)}
                              aria-label={`Edit ${t.description}`}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(t)}
                              aria-label={`Delete ${t.description}`}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <div className="max-h-[min(520px,calc(100vh-14rem))] overflow-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 text-xs font-semibold uppercase tracking-wider text-zinc-500 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-400">
                      <th scope="col" className="whitespace-nowrap px-5 py-3.5 pl-6">
                        Date
                      </th>
                      <th scope="col" className="px-5 py-3.5">
                        Description
                      </th>
                      <th scope="col" className="whitespace-nowrap px-5 py-3.5">
                        Category
                      </th>
                      <th scope="col" className="whitespace-nowrap px-5 py-3.5">
                        Type
                      </th>
                      <th scope="col" className="whitespace-nowrap px-5 py-3.5 text-right">
                        Amount
                      </th>
                      {isAdmin && (
                        <th scope="col" className="whitespace-nowrap px-5 py-3.5 pr-6 text-right">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {filteredTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className={`group border-l-[3px] transition-colors ${rowAccentClass(t.type)} hover:bg-zinc-50/90 dark:hover:bg-zinc-900/50`}
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 pl-6 text-zinc-600 dark:text-zinc-400">
                          {formatShortDate(t.date)}
                        </td>
                        <td className="max-w-[min(280px,28vw)] px-5 py-3.5">
                          <span
                            className="block truncate font-medium text-zinc-900 dark:text-zinc-100"
                            title={t.description}
                          >
                            {t.description}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
                            {t.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span
                            className={
                              t.type === "income"
                                ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                                : "inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-950/70 dark:text-rose-200"
                            }
                          >
                            {t.type === "income" ? "Income" : "Expense"}
                          </span>
                        </td>
                        <td
                          className={`whitespace-nowrap px-5 py-3.5 text-right text-base font-semibold tabular-nums ${
                            t.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {t.type === "income" ? "+" : "−"}
                          {formatCurrencyDetailed(t.amount)}
                        </td>
                        {isAdmin && (
                          <td className="whitespace-nowrap px-5 py-3 pr-6 text-right">
                            <div className="inline-flex items-center gap-0.5 opacity-80 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openEdit(t)}
                                aria-label={`Edit ${t.description}`}
                                className="rounded-lg p-2 text-zinc-500 transition hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(t)}
                                aria-label={`Delete ${t.description}`}
                                className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <TransactionModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </section>
  );
}
