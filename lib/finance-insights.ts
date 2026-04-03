import type { CategorySpend, MonthTotals } from "@/lib/aggregates";
import { incomeByCategory, sumExpenses, sumIncome } from "@/lib/aggregates";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatMonthLabel } from "@/lib/format";

export type InsightBucket = "spending" | "trends" | "highlights" | "assistant";

export type InsightCard = {
  id: string;
  label: string;
  body: string;
};

export type InsightSection = {
  key: InsightBucket;
  title: string;
  subtitle: string;
  items: InsightCard[];
};

function monthFromTx(iso: string): string {
  return iso.slice(0, 7);
}

export function getInsightSections(
  categorySpending: CategorySpend[],
  monthComparison: MonthTotals[],
  transactions: Transaction[],
): InsightSection[] {
  const spending: InsightCard[] = [];
  const trends: InsightCard[] = [];
  const highlights: InsightCard[] = [];
  const assistant: InsightCard[] = [];

  const totalInc = sumIncome(transactions);
  const totalExp = sumExpenses(transactions);
  const incomeCats = incomeByCategory(transactions);

  if (categorySpending.length > 0) {
    const top = categorySpending[0];
    const totalCat = categorySpending.reduce((s, c) => s + c.total, 0);
    const share = totalCat > 0 ? Math.round((top.total / totalCat) * 100) : 0;
    spending.push({
      id: "spend-top",
      label: "Top spending category",
      body: `You spent the most on **${top.category}** — ${formatCurrency(top.total)}, about **${share}%** of all expenses.`,
    });

    if (categorySpending.length >= 2) {
      const second = categorySpending[1];
      const sShare = totalCat > 0 ? Math.round((second.total / totalCat) * 100) : 0;
      spending.push({
        id: "spend-runner",
        label: "Runner-up",
        body: `**${second.category}** is next at ${formatCurrency(second.total)} (${sShare}% of expenses). Together with ${top.category}, that’s **${share + sShare}%** in just two categories.`,
      });
    }

    if (categorySpending.length >= 3) {
      const top3 = categorySpending.slice(0, 3).reduce((s, c) => s + c.total, 0);
      const t3 = totalCat > 0 ? Math.round((top3 / totalCat) * 100) : 0;
      spending.push({
        id: "spend-concentration",
        label: "Concentration",
        body: `Your top **three** categories cover **${t3}%** of spending — useful to watch if you want more balance across budgets.`,
      });
    }
  }

  const expenses = transactions.filter((t) => t.type === "expense");
  const countByCat = new Map<string, number>();
  for (const t of expenses) {
    countByCat.set(t.category, (countByCat.get(t.category) ?? 0) + 1);
  }
  const freqSorted = [...countByCat.entries()].sort((a, b) => b[1] - a[1]);
  if (freqSorted.length > 0 && expenses.length >= 3) {
    const [cat, n] = freqSorted[0];
    spending.push({
      id: "spend-frequency",
      label: "Most frequent (by entries)",
      body: `**${cat}** shows up **${n}** times — not always the biggest dollars, but the category you transact in most often.`,
    });
  }

  if (monthComparison.length >= 2) {
    const prev = monthComparison[monthComparison.length - 2];
    const last = monthComparison[monthComparison.length - 1];
    const incDelta = last.income - prev.income;
    const expDelta = last.expense - prev.expense;
    const incWord = incDelta >= 0 ? "up" : "down";
    const expWord = expDelta >= 0 ? "up" : "down";
    trends.push({
      id: "trend-mom",
      label: "Month over month",
      body: `**${formatMonthLabel(last.month)}** vs **${formatMonthLabel(prev.month)}**: income ${incWord} **${formatCurrency(Math.abs(incDelta))}**, expenses ${expWord} **${formatCurrency(Math.abs(expDelta))}**.`,
    });

    const netLast = last.income - last.expense;
    const netPrev = prev.income - prev.expense;
    const netDelta = netLast - netPrev;
    const netWord = netDelta >= 0 ? "improved" : "tightened";
    trends.push({
      id: "trend-net",
      label: "Net cash flow",
      body: `Monthly net (income − expenses) **${netWord}** by ${formatCurrency(Math.abs(netDelta))}: **${formatCurrency(netLast)}** this month vs **${formatCurrency(netPrev)}** the prior month.`,
    });
  } else if (monthComparison.length === 1) {
    const m = monthComparison[0];
    trends.push({
      id: "trend-single",
      label: "Timeline",
      body: `Only **${formatMonthLabel(m.month)}** has activity so far — add another month of data to unlock month-over-month trends.`,
    });
  }

  const largestExpense = [...transactions]
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)[0];
  if (largestExpense) {
    highlights.push({
      id: "hi-max-exp",
      label: "Largest expense",
      body: `**${formatCurrency(largestExpense.amount)}** — ${largestExpense.description} (${largestExpense.category}).`,
    });
  }

  const largestIncome = [...transactions]
    .filter((t) => t.type === "income")
    .sort((a, b) => b.amount - a.amount)[0];
  if (largestIncome) {
    highlights.push({
      id: "hi-max-inc",
      label: "Largest income",
      body: `**${formatCurrency(largestIncome.amount)}** — ${largestIncome.description} (${largestIncome.category}).`,
    });
  }

  const months = [...new Set(transactions.map((t) => monthFromTx(t.date)))].sort();
  if (months.length > 0) {
    const latest = months[months.length - 1];
    const inMonth = transactions.filter((t) => monthFromTx(t.date) === latest);
    const nExp = inMonth.filter((t) => t.type === "expense").length;
    const nInc = inMonth.filter((t) => t.type === "income").length;
    if (nExp + nInc > 0) {
      highlights.push({
        id: "hi-recent-month",
        label: "Latest month activity",
        body: `In **${formatMonthLabel(latest)}** you logged **${nInc}** income and **${nExp}** expense entries.`,
      });
    }
  }

  if (incomeCats.length > 0 && totalInc > 0) {
    const topInc = incomeCats[0];
    const pct = Math.round((topInc.total / totalInc) * 100);
    highlights.push({
      id: "hi-income-mix",
      label: "Income mix",
      body: `**${topInc.category}** is your biggest income source at ${formatCurrency(topInc.total)} (**${pct}%** of total inflows).`,
    });
  }

  if (totalInc > 0) {
    const savingsRate = Math.round(((totalInc - totalExp) / totalInc) * 100);
    if (totalExp > totalInc) {
      assistant.push({
        id: "ai-deficit",
        label: "Cash-flow note",
        body: `Across this dataset, expenses are **higher** than income. Worth revisiting recurring costs or timing if that matches real life — I’m only reading what’s entered here.`,
      });
    } else if (savingsRate >= 20) {
      assistant.push({
        id: "ai-save-strong",
        label: "Encouraging pattern",
        body: `You’re retaining about **${savingsRate}%** of income after expenses in this view — that’s a strong savings signal if it stays consistent.`,
      });
    } else if (savingsRate >= 5) {
      assistant.push({
        id: "ai-save-mid",
        label: "Room to optimize",
        body: `Roughly **${savingsRate}%** of income remains after expenses here. Small trims in your top category could nudge that up without big lifestyle changes.`,
      });
    }
  }

  if (categorySpending.length > 0) {
    const totalCat = categorySpending.reduce((s, c) => s + c.total, 0);
    const top = categorySpending[0];
    const share = totalCat > 0 ? (top.total / totalCat) * 100 : 0;
    if (share >= 38) {
      assistant.push({
        id: "ai-heavy-cat",
        label: "Category weight",
        body: `**${top.category}** alone is a large share of spending. If that’s intentional, great; if not, it’s often the first place to spot quick wins.`,
      });
    }
  }

  if (transactions.length > 0) {
    assistant.push({
      id: "ai-meta",
      label: "How this works",
      body: `These lines are **pattern summaries** from your transactions — not a live bank feed and **not financial advice**. Use them as conversation starters for your own planning.`,
    });
  }

  if (
    transactions.length > 0 &&
    spending.length === 0 &&
    trends.length === 0 &&
    highlights.length === 0
  ) {
    spending.push({
      id: "spend-empty",
      label: "Spending picture",
      body: "Add **expense** entries with categories to see where your money goes.",
    });
  }

  const sections: InsightSection[] = [
    {
      key: "spending",
      title: "Where your money goes",
      subtitle: "Categories, amounts, and how concentrated spending is",
      items: spending,
    },
    {
      key: "trends",
      title: "Momentum",
      subtitle: "How income, expenses, and net change between months",
      items: trends,
    },
    {
      key: "highlights",
      title: "Notable activity",
      subtitle: "Standout transactions and recent rhythm",
      items: highlights,
    },
    {
      key: "assistant",
      title: "Smart suggestions",
      subtitle: "Plain-language takeaways from your data",
      items: assistant,
    },
  ];

  return sections.filter((s) => s.items.length > 0);
}

export type FinanceInsight = { title: string; body: string };

export function getFinanceInsights(
  categorySpending: CategorySpend[],
  monthComparison: MonthTotals[],
  transactions: Transaction[],
): FinanceInsight[] {
  const sections = getInsightSections(categorySpending, monthComparison, transactions);
  const out: FinanceInsight[] = [];
  for (const s of sections) {
    for (const it of s.items) {
      out.push({ title: it.label, body: it.body.replace(/\*\*/g, "") });
    }
  }
  if (out.length === 0 && transactions.length > 0) {
    out.push({
      title: "Keep going",
      body: "Add a mix of income and expenses to unlock richer comparisons.",
    });
  }
  return out;
}
