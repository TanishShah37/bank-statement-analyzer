// ─────────────────────────────────────────────────────────────────────────────
// Summary Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  date: string;
  drcr: string;
  amount: number;
  balance: number;
  mode: string;
  name: string;
  isDebit: boolean;
  cat: string;
  cls: string;
}

export interface MonthlyData {
  income: number;
  expense: number;
  count: number;
}

export interface CategoryTotal {
  total: number;
  count: number;
  cls: string;
}

export interface ModeTotal {
  debit: number;
  credit: number;
  count: number;
}

export interface CounterpartyTotal {
  name: string;
  total: number;
  count: number;
  cat: string;
  cls: string;
}

export interface BalanceTrajectory {
  month: string;
  balance: number;
}

export interface SummaryAnalytics {
  totalIn: number;
  totalOut: number;
  savings: number;
  openBal: number;
  closeBal: number;
  monthly: Record<string, MonthlyData>;
  catTotals: Record<string, CategoryTotal>;
  modeTotals: Record<string, ModeTotal>;
  topCP: CounterpartyTotal[];
  txnCount: number;
  balanceTrajectory: BalanceTrajectory[];
}

export function computeSummary(txns: Transaction[]): SummaryAnalytics {
  const debits = txns.filter(t => t.isDebit);
  const credits = txns.filter(t => !t.isDebit);
  const totalIn = credits.reduce((s, t) => s + t.amount, 0);
  const totalOut = debits.reduce((s, t) => s + t.amount, 0);

  const monthly: Record<string, MonthlyData> = {};
  for (const t of txns) {
    const m = t.date.slice(0, 7);
    if (!monthly[m]) monthly[m] = { income: 0, expense: 0, count: 0 };
    if (t.isDebit) monthly[m].expense += t.amount;
    else monthly[m].income += t.amount;
    monthly[m].count++;
  }

  const catTotals: Record<string, CategoryTotal> = {};
  for (const t of debits) {
    if (!catTotals[t.cat]) catTotals[t.cat] = { total: 0, count: 0, cls: t.cls };
    catTotals[t.cat].total += t.amount;
    catTotals[t.cat].count++;
  }

  const modeTotals: Record<string, ModeTotal> = {};
  for (const t of txns) {
    if (!modeTotals[t.mode]) modeTotals[t.mode] = { debit: 0, credit: 0, count: 0 };
    if (t.isDebit) modeTotals[t.mode].debit += t.amount;
    else modeTotals[t.mode].credit += t.amount;
    modeTotals[t.mode].count++;
  }

  const cpMap: Record<string, CounterpartyTotal> = {};
  for (const t of debits.filter(t => t.name)) {
    if (!cpMap[t.name]) cpMap[t.name] = { name: t.name, total: 0, count: 0, cat: t.cat, cls: t.cls };
    cpMap[t.name].total += t.amount;
    cpMap[t.name].count++;
  }
  const topCP = Object.values(cpMap).sort((a, b) => b.total - a.total).slice(0, 10);

  const balanceTrajectory = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [m, d]) => {
      const prev = acc.length ? acc[acc.length - 1].balance : (txns[0]?.balance || 0);
      acc.push({ month: m, balance: prev + d.income - d.expense });
      return acc;
    }, [] as BalanceTrajectory[]);

  return {
    totalIn,
    totalOut,
    savings: totalIn - totalOut,
    openBal: txns[0]?.balance || 0,
    closeBal: txns[txns.length - 1]?.balance || 0,
    monthly,
    catTotals,
    modeTotals,
    topCP,
    txnCount: txns.length,
    balanceTrajectory
  };
}
