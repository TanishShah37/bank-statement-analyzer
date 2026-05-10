// ─────────────────────────────────────────────────────────────────────────────
// TransactionTable — sortable, filterable, paginated
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from "react";
import { T } from "../../styles/theme";
import { CatPill } from "./CatPill";
import type { Transaction } from "./analytics";

const PAGE_SIZE = 20;

interface TransactionTableProps {
  txns: Transaction[];
  transactionSortCol?: SortColumn;
  transactionSortDir?: number;
  transactionFilters?: {
    mode: string;
    drcr: string;
    category: string;
  };
  onStateChange?: (state: {
    sortCol: SortColumn;
    sortDir: number;
    filters: { mode: string; drcr: string; category: string };
  }) => void;
}

type SortColumn = "date" | "amount" | "balance" | "name" | "category" | "mode";

export function TransactionTable({ txns, transactionSortCol, transactionSortDir, transactionFilters, onStateChange }: TransactionTableProps) {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState(transactionFilters?.mode || "all");
  const [drcrFilter, setDrcrFilter] = useState(transactionFilters?.drcr || "all");
  const [categoryFilter, setCategoryFilter] = useState(transactionFilters?.category || "all");
  const [sortCol, setSortCol] = useState<SortColumn>(transactionSortCol || "date");
  const [sortDir, setSortDir] = useState(transactionSortDir || 1);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Sync props when they change from parent
  useEffect(() => {
    if (transactionFilters) {
      setModeFilter(transactionFilters.mode);
      setDrcrFilter(transactionFilters.drcr);
      setCategoryFilter(transactionFilters.category);
    }
    if (transactionSortCol) setSortCol(transactionSortCol);
    if (transactionSortDir) setSortDir(transactionSortDir);
  }, [transactionFilters, transactionSortCol, transactionSortDir]);

  const updateState = () => {
    onStateChange?.({
      sortCol,
      sortDir,
      filters: { mode: modeFilter, drcr: drcrFilter, category: categoryFilter }
    });
  };

  const modes = useMemo(() => ["all", ...Array.from(new Set(txns.map(t => t.mode))).sort()], [txns]);
  const categories = useMemo(() => ["all", ...Array.from(new Set(txns.map(t => t.cat))).sort()], [txns]);

  const filtered = useMemo(() => {
    return txns
      .filter(t => modeFilter === "all" || t.mode === modeFilter)
      .filter(t => drcrFilter === "all" || t.drcr === drcrFilter)
      .filter(t => categoryFilter === "all" || t.cat === categoryFilter)
      .filter(t => !search || t.name.includes(search.toUpperCase()) || t.mode.includes(search.toUpperCase()) || t.cat.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const va = sortCol === "amount" ? a.amount : sortCol === "balance" ? a.balance : sortCol === "name" ? a.name : sortCol === "category" ? a.cat : sortCol === "mode" ? a.mode : a.date;
        const vb = sortCol === "amount" ? b.amount : sortCol === "balance" ? b.balance : sortCol === "name" ? b.name : sortCol === "category" ? b.cat : sortCol === "mode" ? b.mode : b.date;
        return va < vb ? -sortDir : va > vb ? sortDir : 0;
      });
  }, [txns, search, modeFilter, drcrFilter, categoryFilter, sortCol, sortDir]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(col: SortColumn): void {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(1); }
    setPage(0);
    updateState();
  }

  const handleFilterChange = (setter: (v: any) => void) => (value: any) => {
    setter(value);
    setPage(0);
    updateState();
  };

  const SortArrow = ({ col }: { col: SortColumn }) => sortCol === col ? (sortDir === 1 ? "↑" : "↓") : " ";

  return (
    <div className="txn-section fade-up fade-up-5">
      <div className="section-title">All Transactions</div>
      <div className="txn-filters">
        <input
          className="txn-search" placeholder="Search name, mode, category…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
        <select className="filter-select" value={modeFilter} onChange={handleFilterChange(setModeFilter)}>
          {modes.map(c => <option key={c} value={c}>{c === "all" ? "All Modes" : c}</option>)}
        </select>
        <select className="filter-select" value={drcrFilter} onChange={handleFilterChange(setDrcrFilter)}>
          <option value="all">All Types</option>
          <option value="Cr">Credits</option>
          <option value="Db">Debits</option>
        </select>
        <select className="filter-select" value={categoryFilter} onChange={handleFilterChange(setCategoryFilter)}>
          {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            📋
          </button>
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            ⊞
          </button>
        </div>
        <span style={{ fontSize: 12, color: T.muted, marginLeft: "auto" }}>{filtered.length} txns</span>
      </div>
      <div className="txn-table-wrap">
        {viewMode === "table" ? (
          <>
            <table className="txn-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("date")}>Date <SortArrow col="date" /></th>
                  <th onClick={() => handleSort("name")}>Counterparty <SortArrow col="name" /></th>
                  <th onClick={() => handleSort("mode")}>Mode <SortArrow col="mode" /></th>
                  <th onClick={() => handleSort("category")}>Category <SortArrow col="category" /></th>
                  <th onClick={() => handleSort("amount")} style={{ textAlign: "right" }}>Amount <SortArrow col="amount" /></th>
                  <th onClick={() => handleSort("balance")} style={{ textAlign: "right" }}>Balance <SortArrow col="balance" /></th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(t => (
                  <tr key={t.id}>
                    <td><span className="txn-date">{t.date}</span></td>
                    <td><span className="txn-name">{t.name || "—"}</span></td>
                    <td><span className="txn-mode">{t.mode}</span></td>
                    <td><CatPill cat={t.cat} /></td>
                    <td><span className={`txn-amount ${t.isDebit ? "debit" : "credit"}`}>{t.isDebit ? "-" : "+"}₹{t.amount.toLocaleString("en-IN")}</span></td>
                    <td><span className="txn-balance">{t.balance ? `₹${Math.round(t.balance).toLocaleString("en-IN")}` : "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="txn-grid">
            {pageData.map(t => (
              <div key={t.id} className="txn-card">
                <div className="txn-card-header">
                  <span className="txn-date">{t.date}</span>
                  <CatPill cat={t.cat} />
                </div>
                <div className="txn-card-body">
                  <div className="txn-name">{t.name || "—"}</div>
                  <div className="txn-mode">{t.mode}</div>
                </div>
                <div className="txn-card-footer">
                  <span className={`txn-amount ${t.isDebit ? "debit" : "credit"}`}>{t.isDebit ? "-" : "+"}₹{t.amount.toLocaleString("en-IN")}</span>
                  <span className="txn-balance">{t.balance ? `₹${Math.round(t.balance).toLocaleString("en-IN")}` : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="pagination">
          <span>Page {page + 1} of {pages || 1}</span>
          <div className="page-btns">
            <button className="page-btn" onClick={() => setPage(0)} disabled={page === 0}>«</button>
            <button className="page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pg = page < 3 ? i : page > pages - 4 ? pages - 5 + i : page - 2 + i;
              if (pg < 0 || pg >= pages) return null;
              return <button key={pg} className={`page-btn${pg === page ? " active" : ""}`} onClick={() => setPage(pg)}>{pg + 1}</button>;
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}>›</button>
            <button className="page-btn" onClick={() => setPage(pages - 1)} disabled={page >= pages - 1}>»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
