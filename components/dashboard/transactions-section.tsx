"use client";

import { useState } from "react";
import type { Transaction } from "@/components/finance/finance-context";
import { useFinance } from "@/components/finance/finance-context";
import { exportTransactionsCsv } from "@/lib/export-csv";
import { formatCurrencyDetailed, formatShortDate } from "@/lib/format";
import { TransactionModal } from "./transaction-modal";

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

  const categoryOptions = ["all", ...categoriesInData];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Transactions
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Search, filter, and sort. Admins can add or edit rows.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
            >
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
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="block min-w-[200px] flex-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Search</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Description, category, type…"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="block w-full text-sm sm:w-40">
          <span className="text-zinc-600 dark:text-zinc-400">Category</span>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-full text-sm sm:w-36">
          <span className="text-zinc-600 dark:text-zinc-400">Type</span>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ type: e.target.value as typeof filters.type })
            }
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label className="block w-full text-sm sm:w-44">
          <span className="text-zinc-600 dark:text-zinc-400">Sort</span>
          <div className="mt-1 flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ sortBy: e.target.value as typeof filters.sortBy })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <select
              value={filters.sortDir}
              onChange={(e) =>
                setFilters({ sortDir: e.target.value as typeof filters.sortDir })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No transactions yet.
                  {isAdmin ? " Use “Add transaction” to create your first entry." : " Switch to Admin to add data."}
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No rows match your filters. Try clearing search or widening category / type.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/80 dark:border-zinc-900 dark:hover:bg-zinc-900/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {formatShortDate(t.date)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {t.description}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{t.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        t.type === "income"
                          ? "inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-950/60 dark:text-sky-200"
                          : "inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                      }
                    >
                      {t.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium tabular-nums ${
                      t.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatCurrencyDetailed(t.amount)}
                  </td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="mr-2 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(t)}
                        className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
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
