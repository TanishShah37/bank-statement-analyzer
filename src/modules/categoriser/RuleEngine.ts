// ─────────────────────────────────────────────────────────────────────────────
// Categoriser — rule engine
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

interface CategoryRule {
  cat: string;
  cls: string;
  fn: (t: Transaction) => boolean;
}

const CAT_RULES: CategoryRule[] = [
  { cat: "Income", cls: "income", fn: t => t.drcr === "Cr" && ["NEFT", "IMPS", "SBINT"].includes(t.mode) },
  { cat: "Income", cls: "income", fn: t => t.drcr === "Cr" && t.mode === "UPI" && !["PHONEPE", "FLIPKART", "AMAZONPA", "AMAZONPAY", "JIOINAPP", "DOMINOSP", "1MGHEALT", "ECOMEXPRE", "HESCOMBI", "MEESHO", "BAJAJFIN"].includes(t.name) },
  { cat: "Bank Charges", cls: "charges", fn: t => ["SMS CHARGES", "STOCK CHRG", "DEBIT CARD ANNUAL", "UNKNOWN"].includes(t.mode) || t.name === "BANKACCO" },
  { cat: "Cash (ATM)", cls: "cash", fn: t => t.mode === "ATM" },
  { cat: "Cheque", cls: "cheque", fn: t => t.mode === "CHEQUE" },
  { cat: "Loan / Finance", cls: "finance", fn: t => ["HDFCBANK", "BAJAJFIN", "STATEBAN"].includes(t.name) },
  { cat: "Health", cls: "health", fn: t => ["1MGHEALT", "MANAPPURA", "APOLLOPHA", "PHARMEASY"].includes(t.name) },
  { cat: "Shopping", cls: "shopping", fn: t => ["FLIPKART", "AMAZONPA", "AMAZONPAY", "MEESHO", "ECOMEXPRE", "KOTAKGEN", "HUCHCHAPP", "NANDISHM", "MYNTRA", "SWIGGY", "ZOMATO"].includes(t.name) },
  { cat: "Food & Dining", cls: "food", fn: t => ["DOMINOSP", "ZOMATO", "SWIGGYIND"].includes(t.name) || /FOOD|RESTAURANT|CAFE|ZOMATO|SWIGGY/i.test(t.name) },
  { cat: "Telecom / Apps", cls: "telecom", fn: t => t.name === "JIOINAPP" || (t.name || "").startsWith("JIO") || (t.name || "").includes("AIRTEL") },
  { cat: "Utilities", cls: "utilities", fn: t => ["HESCOMBI", "GOASELEC", "INDIANIN", "ELECTRICITY", "MSEDCL", "BESCOM"].includes(t.name) || /ELECTRIC|WATER|GAS|UTILITY/i.test(t.name) },
  { cat: "Transfer", cls: "transfer", fn: t => t.mode === "FUNDS TRANSFER DEBIT" || t.name === "PHONEPE" || ["UPI", "NEFT", "IMPS", "ECS"].includes(t.mode) },
  { cat: "Other", cls: "other", fn: () => true },
];

export function categorise(t: Transaction): { cat: string; cls: string } {
  for (const rule of CAT_RULES) if (rule.fn(t)) return { cat: rule.cat, cls: rule.cls };
  return { cat: "Other", cls: "other" };
}

const VALID_CATS = ["Income", "Cash (ATM)", "Transfer", "Shopping", "Loan / Finance", "Bank Charges", "Health", "Food & Dining", "Telecom / Apps", "Utilities", "Cheque", "Other"];
const CAT_CLS: Record<string, string> = { "Income": "income", "Cash (ATM)": "cash", "Transfer": "transfer", "Shopping": "shopping", "Loan / Finance": "finance", "Bank Charges": "charges", "Health": "health", "Food & Dining": "food", "Telecom / Apps": "telecom", "Utilities": "utilities", "Cheque": "cheque", "Other": "other" };
