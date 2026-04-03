import type { FinanceFilters, Transaction } from "./types";

export function filterAndSortTransactions(
  transactions: Transaction[],
  filters: FinanceFilters,
): Transaction[] {
  const q = filters.search.trim().toLowerCase();
  let list = transactions.filter((t) => {
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.category !== "all" && t.category !== filters.category) return false;
    if (q) {
      const hay = `${t.description} ${t.category} ${t.type}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  list = [...list].sort((a, b) => {
    if (filters.sortBy === "amount") {
      return b.amount - a.amount;
    }
    return b.date.localeCompare(a.date);
  });

  return list;
}

export function uniqueCategories(transactions: Transaction[]): string[] {
  return [...new Set(transactions.map((t) => t.category))].sort((a, b) =>
    a.localeCompare(b),
  );
}
