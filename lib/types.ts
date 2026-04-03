export type UserRole = "viewer" | "admin";

export type TransactionType = "income" | "expense";

export type SortKey = "date" | "amount";
export type SortDir = "asc" | "desc";

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
};

export type FinanceFilters = {
  search: string;
  category: string;
  type: "all" | TransactionType;
  sortBy: SortKey;
  sortDir: SortDir;
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Other"] as const;
