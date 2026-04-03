"use client";

import { FinanceProvider } from "@/components/finance/finance-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <FinanceProvider>{children}</FinanceProvider>;
}
