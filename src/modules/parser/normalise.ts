// ─────────────────────────────────────────────────────────────────────────────
// Date / Amount / DrCr Normalisers
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6, july: 7,
  august: 8, september: 9, october: 10, november: 11, december: 12,
};

export function normaliseDate(raw: string | number | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();

  const iso = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  const compact = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;

  const monYear = s.match(/^(\d{1,2})[\s\-\/]([A-Za-z]{3,9})[\s\-\/](\d{2,4})$/);
  if (monYear) {
    let [, d, m, y] = monYear;
    const mo = MONTH_MAP[m.toLowerCase()];
    if (!mo) return null;
    if (y.length === 2) y = "20" + y;
    return `${y}-${String(mo).padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const monDayYear = s.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monDayYear) {
    const [, m, d, y] = monDayYear;
    const mo = MONTH_MAP[m.toLowerCase()];
    if (!mo) return null;
    return `${y}-${String(mo).padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    let [, a, b, y] = dmy;
    if (y.length === 2) y = "20" + y;
    const aNum = parseInt(a), bNum = parseInt(b);
    let d: string, m: string;
    if (aNum > 12) { d = a; m = b; }
    else if (bNum > 12) { d = b; m = a; }
    else { d = a; m = b; }
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  if (/^\d{13}$/.test(s)) {
    const dt = new Date(parseInt(s));
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  }

  try {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  } catch (_) {}
  return null;
}

export function normaliseAmount(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined || raw === "") return 0;
  let s = String(raw).trim();
  const neg = s.startsWith("(") && s.endsWith(")");
  s = s.replace(/[₹$£€,\s\(\)]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : (neg ? -Math.abs(n) : n);
}

export function normaliseDrCr(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim().toUpperCase();
  if (["DB", "DR", "DEBIT", "D", "WITHDRAWAL", "OUT", "-"].includes(s)) return "Db";
  if (["CR", "CREDIT", "C", "DEPOSIT", "IN", "+"].includes(s)) return "Cr";
  return null;
}

export function inferMode(narration: string | null | undefined): string {
  const u = String(narration || "").toUpperCase();
  if (/\bUPI\b/.test(u)) return "UPI";
  if (/\bNEFT\b/.test(u)) return "NEFT";
  if (/\bIMPS\b/.test(u)) return "IMPS";
  if (/\bATM\b/.test(u)) return "ATM";
  if (/\bECS\b/.test(u)) return "ECS";
  if (/CHEQUE|CHQ/.test(u)) return "CHEQUE";
  if (/RTGS/.test(u)) return "NEFT";
  if (/INTEREST|INT CREDIT/.test(u)) return "SBINT";
  return "OTHER";
}
