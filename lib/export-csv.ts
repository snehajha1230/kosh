export type CsvTransactionRow = {
  date: string;
  amount: number;
  category: string;
  type: string;
  description: string;
};

export function exportTransactionsCsv(rows: CsvTransactionRow[]) {
  const header = ["Date", "Amount", "Category", "Type", "Description"];
  const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.date, r.amount, r.category, r.type, r.description].map(esc).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
