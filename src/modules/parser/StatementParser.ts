// ─────────────────────────────────────────────────────────────────────────────
// Universal Parser — 3-tier CSV (alias → heuristic → LLM) + PDF via pdf.js
// ─────────────────────────────────────────────────────────────────────────────
import { normaliseDate, normaliseAmount, normaliseDrCr, inferMode } from "./normalise";
import { categorise } from "../categoriser/RuleEngine";

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

export interface ColumnMap {
  date?: string;
  amount?: string;
  debit?: string;
  credit?: string;
  drcr?: string;
  balance?: string;
  mode?: string;
  name?: string;
}

export interface ParseResult {
  txns: Transaction[];
  map: ColumnMap;
  warnings: string[];
}

// ─── Column Alias Map (Tier 1) ────────────────────────────────────────────────
const ALIAS: Record<string, string[]> = {
  date: ["date", "transaction date", "txn date", "trans date", "value date", "posting date", "tran date", "booking date", "entry date", "settlement date", "transaction_date", "txn_date", "dated", "on date", "as on"],
  amount: ["amount", "transaction amount", "txn amount", "tran amount", "amount (inr)", "amount (₹)", "amount (rs.)", "amt", "tran_amt", "txn_amt", "debit/credit amount"],
  debit: ["debit", "debit amount", "withdrawal", "withdrawal amount", "dr", "dr amount", "debit(dr)", "withdrawals", "paid out", "money out", "outflow", "debit_amount", "debits"],
  credit: ["credit", "credit amount", "deposit", "deposit amount", "cr", "cr amount", "credit(cr)", "deposits", "paid in", "money in", "inflow", "credit_amount", "credits"],
  drcr: ["drcr", "dr/cr", "dr_cr", "type", "transaction type", "txn type", "debit or credit", "credit/debit", "nature", "indicator", "direction", "tran type"],
  balance: ["balance", "closing balance", "available balance", "ledger balance", "running balance", "account balance", "bal", "balance amount", "closing_balance", "book balance"],
  mode: ["mode", "transaction mode", "txn mode", "payment mode", "transfer mode", "channel", "medium", "instrument", "payment type", "mode_of_payment"],
  name: ["name", "narration", "description", "particulars", "remarks", "details", "transaction details", "txn details", "payee", "beneficiary", "merchant", "counterparty", "memo", "note", "reference"],
};

const ALIAS_INDEX: Record<string, string> = {};
for (const [field, aliases] of Object.entries(ALIAS)) {
  for (const a of aliases) ALIAS_INDEX[a.toLowerCase().trim()] = field;
}

// ─── Heuristic Sniff (Tier 2) ─────────────────────────────────────────────────
const DATE_PATTERNS = [
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,
  /^\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4}$/i,
  /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$/i,
];

interface ColumnScores {
  dateScore: number;
  numScore: number;
  drcrScore: number;
  emptyRatio: number;
  nonZeroNum: number;
}

function heuristicSniff(headers: string[], rows: Record<string, string>[]): ColumnMap {
  const sample = rows.slice(0, Math.min(10, rows.length));
  const scores: Record<string, ColumnScores> = {};

  for (const h of headers) {
    const vals = sample.map(r => String(r[h] || "").trim());
    let dateHits = 0, numHits = 0, drcrHits = 0, emptyCount = 0, nonZeroNums = 0;
    for (const v of vals) {
      if (!v) { emptyCount++; continue; }
      if (DATE_PATTERNS.some(p => p.test(v))) dateHits++;
      const cleaned = v.replace(/[₹$,\s\(\)]/g, "");
      if (/^-?\d+(\.\d{1,4})?$/.test(cleaned)) { numHits++; if (parseFloat(cleaned) > 0) nonZeroNums++; }
      if (["DB", "CR", "DR", "DEBIT", "CREDIT", "D", "C"].includes(v.trim().toUpperCase())) drcrHits++;
    }
    const n = sample.length;
    scores[h] = { dateScore: dateHits / n, numScore: numHits / n, drcrScore: drcrHits / n, emptyRatio: emptyCount / n, nonZeroNum: nonZeroNums / n };
  }

  const map: ColumnMap = {};
  const used = new Set<string>();

  const bestDate = [...headers].filter(h => !used.has(h)).sort((a, b) => (scores[b]?.dateScore || 0) - (scores[a]?.dateScore || 0))[0];
  if (bestDate && (scores[bestDate]?.dateScore || 0) > 0.6) { map.date = bestDate; used.add(bestDate); }

  const bestDrCr = [...headers].filter(h => !used.has(h)).sort((a, b) => (scores[b]?.drcrScore || 0) - (scores[a]?.drcrScore || 0))[0];
  if (bestDrCr && (scores[bestDrCr]?.drcrScore || 0) > 0.5) { map.drcr = bestDrCr; used.add(bestDrCr); }

  const numCols = [...headers].filter(h => !used.has(h)).filter(h => (scores[h]?.numScore || 0) > 0.5).sort((a, b) => (scores[b]?.nonZeroNum || 0) - (scores[a]?.nonZeroNum || 0));
  if (numCols.length >= 3) {
    map.debit = numCols[0]; used.add(numCols[0]);
    map.credit = numCols[1]; used.add(numCols[1]);
    map.balance = numCols[numCols.length - 1]; used.add(numCols[numCols.length - 1]);
  } else if (numCols.length === 2) {
    map.amount = numCols[0]; used.add(numCols[0]);
    map.balance = numCols[1]; used.add(numCols[1]);
  } else if (numCols.length === 1) { map.amount = numCols[0]; used.add(numCols[0]); }

  const textCols = headers.filter(h => !used.has(h));
  if (textCols.length) {
    const byLen = [...textCols].sort((a, b) => {
      const avgA = sample.reduce((s, r) => s + String(r[a] || "").length, 0) / sample.length;
      const avgB = sample.reduce((s, r) => s + String(r[b] || "").length, 0) / sample.length;
      return avgB - avgA;
    });
    map.name = byLen[0];
  }
  return map;
}

// ─── LLM Column Mapper (Tier 3) ───────────────────────────────────────────────
async function llmColumnMap(headers: string[], sampleRows: Record<string, string>[]): Promise<ColumnMap> {
  const key = sessionStorage.getItem("_ds_or_key") || "";
  if (!key) return {};
  const sampleText = sampleRows.slice(0, 3).map((row, i) => `Row ${i + 1}: ` + headers.map(h => `${h}=${JSON.stringify(row[h] ?? "")}`).join(", ")).join("\n");
  const prompt = `You are a bank statement schema analyser.\nGiven these CSV column headers and 3 sample rows, map each relevant column to one of: date, amount, debit, credit, drcr, balance, mode, name\n\nHeaders: ${JSON.stringify(headers)}\n\nSample rows:\n${sampleText}\n\nReturn ONLY a JSON object like: {"date":"ColName","amount":"ColName","balance":"ColName","name":"ColName"}\nOnly include fields you are confident about. No explanation, no markdown.`;
  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}`, "HTTP-Referer": location.origin, "X-Title": "Datasutram Bank Analyser" },
      body: JSON.stringify({ model: "google/gemini-flash-1.5", max_tokens: 200, messages: [{ role: "user", content: prompt }] }),
    });
    if (!resp.ok) return {};
    const data = await resp.json();
    const raw = (data.choices?.[0]?.message?.content || "").trim().replace(/^```json|^```|```$/gm, "").trim();
    return JSON.parse(raw);
  } catch (_) { return {}; }
}

// ─── Loader Helpers ───────────────────────────────────────────────────────────
function waitForPapaParse(retries = 30): Promise<void> {
  return new Promise((res, rej) => {
    if ((window as any).Papa) return res();
    let i = 0;
    const t = setInterval(() => {
      if ((window as any).Papa) { clearInterval(t); res(); }
      else if (++i >= retries) { clearInterval(t); rej(new Error("PapaParse failed to load")); }
    }, 200);
  });
}

function waitForPDFJS(retries = 30): Promise<void> {
  return new Promise((res, rej) => {
    if ((window as any).pdfjsLib) return res();
    let i = 0;
    const t = setInterval(() => {
      if ((window as any).pdfjsLib) { clearInterval(t); res(); }
      else if (++i >= retries) { clearInterval(t); rej(new Error("pdf.js failed to load")); }
    }, 200);
  });
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────
export async function parseUniversalCSV(csvText: string, forcedMap: ColumnMap | null = null): Promise<ParseResult> {
  await waitForPapaParse();
  const result = (window as any).Papa.parse(csvText.trim(), { header: true, skipEmptyLines: true, dynamicTyping: false });
  if (!result.data?.length) throw new Error("CSV appears empty or could not be parsed.");

  const headers = Object.keys(result.data[0]).map(k => k.trim());
  const rows = result.data as Record<string, string>[];
  const warnings: string[] = [];

  let map = forcedMap || {};
  if (!forcedMap) {
    for (const h of headers) { const f = ALIAS_INDEX[h.toLowerCase().trim()]; if (f && !map[f as keyof ColumnMap]) (map as any)[f] = h; }
    if (!map.date || (!map.amount && !map.debit && !map.credit)) {
      const sniffed = heuristicSniff(headers, rows);
      for (const [f, col] of Object.entries(sniffed)) if (!map[f as keyof ColumnMap]) (map as any)[f] = col;
    }
    if (!map.date || (!map.amount && !map.debit && !map.credit)) {
      warnings.push("Column names unrecognised — used AI to detect schema");
      const llmMap = await llmColumnMap(headers, rows.slice(0, 3));
      for (const [f, col] of Object.entries(llmMap)) if (!map[f as keyof ColumnMap] && headers.includes(col)) (map as any)[f] = col;
    }
  }

  if (!map.date) throw new Error(`Could not identify a date column. Headers: ${headers.join(", ")}`);
  if (!map.amount && !map.debit && !map.credit) throw new Error(`Could not identify an amount column. Headers: ${headers.join(", ")}`);

  let id = 0;
  const txns: Transaction[] = [];
  for (const row of rows) {
    const rawDate = (row[map.date!] || "").trim();
    const date = normaliseDate(rawDate);
    if (!date) continue;

    let amount: number, drcr: string;
    if (map.amount) {
      amount = Math.abs(normaliseAmount(row[map.amount]));
      if (amount <= 0) continue;
      if (map.drcr) { drcr = normaliseDrCr(row[map.drcr]) || ""; if (!drcr) { const r = normaliseAmount(row[map.amount]); drcr = r < 0 ? "Db" : "Cr"; } }
      else { const r = normaliseAmount(row[map.amount]); drcr = r < 0 ? "Db" : "Cr"; if (!warnings.includes("Direction inferred from amount sign")) warnings.push("Direction inferred from amount sign"); }
    } else {
      const dv = map.debit ? Math.abs(normaliseAmount(row[map.debit])) : 0;
      const cv = map.credit ? Math.abs(normaliseAmount(row[map.credit])) : 0;
      if (dv > 0 && cv === 0) { amount = dv; drcr = "Db"; }
      else if (cv > 0 && dv === 0) { amount = cv; drcr = "Cr"; }
      else if (dv > 0 && cv > 0) { if (dv >= cv) { amount = dv; drcr = "Db"; } else { amount = cv; drcr = "Cr"; } }
      else continue;
    }

    const balance = map.balance ? Math.abs(normaliseAmount(row[map.balance])) : 0;
    const rawName = map.name ? String(row[map.name] || "").trim() : "";
    const mode = map.mode ? String(row[map.mode] || "").trim().toUpperCase() || inferMode(rawName) : inferMode(rawName);
    const name = rawName.toUpperCase().slice(0, 24).trim();
    const isDebit = drcr === "Db";
    const txn: Transaction = { id: ++id, date, drcr, amount, balance, mode, name, isDebit, cat: "", cls: "" };
    const { cat, cls } = categorise(txn);
    txn.cat = cat;
    txn.cls = cls;
    txns.push(txn);
  }

  if (!txns.length) throw new Error("No valid transactions could be extracted. Check date/amount columns.");
  return { txns, map, warnings };
}

// ─── PDF Parser ───────────────────────────────────────────────────────────────
async function extractPDFLines(buffer: ArrayBuffer): Promise<string[]> {
  await waitForPDFJS();
  const loadingTask = (window as any).pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const lines: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const byY: Record<number, { x: number; text: string }[]> = {};
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      if (!byY[y]) byY[y] = [];
      byY[y].push({ x: item.transform[4], text: item.str });
    }
    const ySorted = Object.keys(byY).map(Number).sort((a, b) => b - a);
    for (const y of ySorted) {
      const lineText = byY[y].sort((a, b) => a.x - b.x).map(i => i.text).join(" ").trim();
      if (lineText) lines.push(lineText);
    }
  }
  return lines;
}

function isScannedPDF(lines: string[]): boolean {
  return lines.filter(l => l.trim().length > 5).length < 5;
}

export async function parsePDFFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const lines = await extractPDFLines(buffer);
  if (isScannedPDF(lines)) throw new Error("This appears to be a scanned/image PDF. Only text-based PDFs are supported. Export your statement as a text PDF from your bank portal, or use CSV.");

  const DATE_RE = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4})/i;
  const txns: Transaction[] = [];
  let id = 0;

  for (const line of lines) {
    if (!DATE_RE.test(line)) continue;
    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;
    const date = normaliseDate(dateMatch[0].trim());
    if (!date) continue;
    const amounts = [...line.matchAll(/[\d,]+\.\d{2}/g)].map(m => parseFloat(m[0].replace(/,/g, "")));
    if (amounts.length < 2) continue;

    const balance = amounts[amounts.length - 1];
    let drcr = "Db", amount = amounts[amounts.length - 2];
    if (amounts.length >= 3) {
      const dv = amounts[amounts.length - 3], cv = amounts[amounts.length - 2];
      if (dv > 0 && cv === 0) { drcr = "Db"; amount = dv; }
      else if (cv > 0 && dv === 0) { drcr = "Cr"; amount = cv; }
    }
    if (amount <= 0) continue;

    const firstAmtIdx = line.search(/[\d,]+\.\d{2}/);
    const descRaw = line.slice(dateMatch[0].length, firstAmtIdx).trim();
    const name = descRaw.replace(/[^A-Z0-9\s]/gi, "").toUpperCase().trim().slice(0, 24);
    const mode = inferMode(descRaw);
    const isDebit = drcr === "Db";
    const txn: Transaction = { id: ++id, date, drcr, amount, balance, mode, name, isDebit, cat: "", cls: "" };
    const { cat, cls } = categorise(txn);
    txn.cat = cat;
    txn.cls = cls;
    txns.push(txn);
  }

  if (!txns.length) throw new Error("No transactions found in PDF. Layout may not match supported Indian bank formats. Try a CSV export.");
  const map: ColumnMap = { date: "(pdf)", amount: "(pdf)", balance: "(pdf)", mode: "(pdf)", name: "(pdf)" };
  return { txns, map, warnings: [] };
}

// ─── Universal Entry Point ────────────────────────────────────────────────────
export async function parseUniversal(file: File, forcedMap: ColumnMap | null = null): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parsePDFFile(file);
  if (name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".tsv")) {
    const text = await file.text();
    return parseUniversalCSV(text, forcedMap);
  }
  throw new Error(`Unsupported file type: ${file.name}. Upload .csv or .pdf`);
}
