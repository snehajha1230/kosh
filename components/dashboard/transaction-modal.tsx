"use client";

import { useEffect, useState } from "react";
import type { Transaction, TransactionType } from "@/components/finance/finance-context";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Omit<Transaction, "id"> & { id?: string }) => void;
  initial?: Transaction | null;
};

function defaultsFrom(initial?: Transaction | null) {
  if (initial) {
    return {
      date: initial.date,
      amount: String(initial.amount),
      category: initial.category,
      type: initial.type,
      description: initial.description,
    };
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    category: "Food",
    type: "expense" as TransactionType,
    description: "",
  };
}

function TransactionModalInner({
  onClose,
  onSave,
  initial,
}: Omit<Props, "open">) {
  const [form, setForm] = useState(defaultsFrom(initial));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const categories =
    form.type === "expense" ? [...EXPENSE_CATEGORIES] : [...INCOME_CATEGORIES];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const payload = {
      id: initial?.id,
      date: form.date,
      amount,
      category: form.category,
      type: form.type,
      description: form.description.trim() || "Untitled",
    };
    onSave(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-modal-title"
      >
        <h2
          id="tx-modal-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {initial ? "Edit transaction" : "New transaction"}
        </h2>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Type</span>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value as TransactionType;
                  const nextCat =
                    type === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
                  setForm((f) => ({ ...f, type, category: nextCat }));
                }}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Date</span>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Amount (USD)</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="0.00"
            />
          </label>

          <label className="block text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Description</span>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="What was this for?"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
            >
              {initial ? "Save changes" : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TransactionModal({ open, onClose, onSave, initial }: Props) {
  if (!open) return null;
  return (
    <TransactionModalInner onClose={onClose} onSave={onSave} initial={initial} />
  );
}
