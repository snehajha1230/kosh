"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  monthlyBalanceTrend,
  monthlyTotalsComparison,
  netBalance,
  spendingByCategory,
  sumExpenses,
  sumIncome,
} from "@/lib/aggregates";
import { filterAndSortTransactions, uniqueCategories } from "@/lib/selectors";
import {
  defaultTransactions,
  loadPersistedState,
  savePersistedState,
  type PersistedFinanceState,
} from "@/lib/storage";
import type { FinanceFilters, Transaction, TransactionType, UserRole } from "@/lib/types";

type ThemeMode = "light" | "dark";

type State = {
  transactions: Transaction[];
  filters: FinanceFilters;
  role: UserRole;
  theme: ThemeMode;
  hydrated: boolean;
};

type Action =
  | { type: "HYDRATE"; payload: Partial<PersistedFinanceState> }
  | { type: "SET_FILTERS"; payload: Partial<FinanceFilters> }
  | { type: "SET_ROLE"; payload: UserRole }
  | { type: "SET_THEME"; payload: ThemeMode }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "RESET_DEMO" };

const defaultFilters: FinanceFilters = {
  search: "",
  category: "all",
  type: "all",
  sortBy: "date",
  sortDir: "desc",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        transactions: action.payload.transactions ?? state.transactions,
        role: action.payload.role ?? state.role,
        theme: action.payload.theme ?? state.theme,
        hydrated: true,
      };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "RESET_DEMO":
      return {
        ...state,
        transactions: defaultTransactions(),
        filters: defaultFilters,
      };
    default:
      return state;
  }
}

const initialState: State = {
  transactions: defaultTransactions(),
  filters: defaultFilters,
  role: "viewer",
  theme: "light",
  hydrated: false,
};

type FinanceContextValue = {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: FinanceFilters;
  setFilters: (patch: Partial<FinanceFilters>) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isAdmin: boolean;
  hydrated: boolean;
  summary: {
    balance: number;
    income: number;
    expenses: number;
  };
  balanceTrend: ReturnType<typeof monthlyBalanceTrend>;
  categorySpending: ReturnType<typeof spendingByCategory>;
  monthComparison: ReturnType<typeof monthlyTotalsComparison>;
  categoriesInData: string[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  resetDemo: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      dispatch({ type: "HYDRATE", payload: saved });
    } else {
      dispatch({ type: "HYDRATE", payload: {} });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [state.theme]);

  useEffect(() => {
    if (!state.hydrated) return;
    savePersistedState({
      transactions: state.transactions,
      role: state.role,
      theme: state.theme,
    });
  }, [state.transactions, state.role, state.theme, state.hydrated]);

  const setFilters = useCallback((patch: Partial<FinanceFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: patch });
  }, []);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: "SET_ROLE", payload: role });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    dispatch({ type: "SET_THEME", payload: theme });
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    const full: Transaction = { ...t, id: newId() };
    dispatch({ type: "ADD_TRANSACTION", payload: full });
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: t });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: "RESET_DEMO" });
  }, []);

  const filteredTransactions = useMemo(
    () => filterAndSortTransactions(state.transactions, state.filters),
    [state.transactions, state.filters],
  );

  const summary = useMemo(
    () => ({
      balance: netBalance(state.transactions),
      income: sumIncome(state.transactions),
      expenses: sumExpenses(state.transactions),
    }),
    [state.transactions],
  );

  const balanceTrend = useMemo(
    () => monthlyBalanceTrend(state.transactions),
    [state.transactions],
  );

  const categorySpending = useMemo(
    () => spendingByCategory(state.transactions),
    [state.transactions],
  );

  const monthComparison = useMemo(
    () => monthlyTotalsComparison(state.transactions),
    [state.transactions],
  );

  const categoriesInData = useMemo(
    () => uniqueCategories(state.transactions),
    [state.transactions],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions: state.transactions,
      filteredTransactions,
      filters: state.filters,
      setFilters,
      role: state.role,
      setRole,
      theme: state.theme,
      setTheme,
      isAdmin: state.role === "admin",
      hydrated: state.hydrated,
      summary,
      balanceTrend,
      categorySpending,
      monthComparison,
      categoriesInData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      resetDemo,
    }),
    [
      state.transactions,
      state.filters,
      state.role,
      state.theme,
      state.hydrated,
      filteredTransactions,
      setFilters,
      setRole,
      setTheme,
      summary,
      balanceTrend,
      categorySpending,
      monthComparison,
      categoriesInData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      resetDemo,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return ctx;
}

export type { TransactionType, UserRole, Transaction };
