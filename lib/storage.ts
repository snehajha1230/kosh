import type { Transaction, UserRole } from "./types";
import { INITIAL_TRANSACTIONS } from "./mock-data";

const STORAGE_KEY = "zorvyn-finance-state-v2";

export type PersistedFinanceState = {
  transactions: Transaction[];
  role: UserRole;
  theme: "light" | "dark";
};

export function loadPersistedState(): Partial<PersistedFinanceState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedFinanceState;
    if (!parsed || !Array.isArray(parsed.transactions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedFinanceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

export function defaultTransactions(): Transaction[] {
  return INITIAL_TRANSACTIONS.map((t) => ({ ...t }));
}
