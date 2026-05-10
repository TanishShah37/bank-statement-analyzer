// ─────────────────────────────────────────────────────────────────────────────
// Dashboard — main report view
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { styles, T } from "../../styles/theme";
import { fmtShort, fmt, exportNormalisedCSV, exportNormalisedPDF, exportNormalisedXLS } from "./format";

interface ChartStates {
  cashFlowSortBy: string;
  cashFlowSortOrder: string;
  categorySortBy: string;
  categorySortOrder: string;
  balanceShowAll: boolean;
  transactionSortCol: string;
  transactionSortDir: number;
  transactionFilters: {
    mode: string;
    drcr: string;
    category: string;
  };
}
import { CashFlowChart, CategoryDonut, BalanceLine, TopMerchants, DailyHeatmap, StackedAreaChart } from "./charts/Charts";
import { CatPill } from "./CatPill";
import { TransactionTable } from "./TransactionTable";
import { ChatPanel } from "../chat/ChatView";
import { Glossary } from "../chat/Glossary";
import type { Transaction, SummaryAnalytics } from "./analytics";
import type { ColumnMap } from "../parser/StatementParser";

interface DashboardProps {
  txns: Transaction[];
  summary: SummaryAnalytics;
  fileName: string;
  parseMap: ColumnMap | null;
  parseWarnings: string[];
  onReset: () => void;
  onBack: () => void;
}

export function Dashboard({ txns, summary, fileName, parseMap, parseWarnings, onReset, onBack }: DashboardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [chartStates, setChartStates] = useState<ChartStates>({
    cashFlowSortBy: "month",
    cashFlowSortOrder: "asc",
    categorySortBy: "value",
    categorySortOrder: "desc",
    balanceShowAll: false,
    transactionSortCol: "date",
    transactionSortDir: 1,
    transactionFilters: {
      mode: "all",
      drcr: "all",
      category: "all"
    }
  });
  const sm = summary;

  const handleChatAction = (action: string, params: any) => {
    // Handle chat panel actions like sorting, filtering, etc.
    console.log("Chat action:", action, params);
    // Future: Implement specific actions based on action type
  };

  const dateRange = useMemo(() => {
    const dates = txns.map(t => t.date).sort();
    return `${dates[0]} → ${dates[dates.length - 1]}`;
  }, [txns]);

  const modeCells = Object.entries(sm.modeTotals)
    .sort(([, a], [, b]) => (b.debit + b.credit) - (a.debit + a.credit))
    .slice(0, 8);

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">
        {parseWarnings?.length > 0 && (
          <div className="warn-banner">
            ⚠ {parseWarnings.join("  ·  ")}
          </div>
        )}
        {parseMap && Object.values(parseMap).some(v => v !== "(pdf)") && (
          <div className="schema-badge">
            Schema auto-detected: {Object.entries(parseMap).filter(([, v]) => v && v !== "(pdf)").map(([k, v]) => `${k}→"${v}"`).join("  ·  ")}
          </div>
        )}

        <div className="dashboard-header fade-up">
          <div>
            <div className="dashboard-title">Statement Analysis</div>
            <div className="dashboard-meta">{fileName}  ·  {sm.txnCount} transactions  ·  {dateRange}</div>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => exportNormalisedCSV(txns)}>⬇ CSV</button>
            <button className="btn btn-ghost btn-sm" onClick={() => exportNormalisedPDF(txns, summary, chartStates)}>📄 PDF</button>
            <button className="btn btn-ghost btn-sm" onClick={() => exportNormalisedXLS(txns)}>📊 XLS</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setChatOpen(true)}>💬 AI Chat</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowGlossary(true)}>📖 Glossary</button>
            <button className="btn btn-accent btn-sm" onClick={onReset}>↩ New File</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-row fade-up fade-up-1">
          <div className="kpi-card positive">
            <div className="kpi-label">Total Credits</div>
            <div className="kpi-value green">{fmtShort(sm.totalIn)}</div>
            <div className="kpi-sub">Money in</div>
          </div>
          <div className="kpi-card negative">
            <div className="kpi-label">Total Debits</div>
            <div className="kpi-value red">{fmtShort(sm.totalOut)}</div>
            <div className="kpi-sub">Money out</div>
          </div>
          <div className={`kpi-card ${sm.savings >= 0 ? "positive" : "negative"}`}>
            <div className="kpi-label">Net Savings</div>
            <div className={`kpi-value ${sm.savings >= 0 ? "green" : "red"}`}>{sm.savings >= 0 ? "+" : ""}{fmtShort(Math.abs(sm.savings))}</div>
            <div className="kpi-sub">{sm.savings >= 0 ? "Surplus" : "Deficit"}</div>
          </div>
          <div className="kpi-card neutral">
            <div className="kpi-label">Closing Balance</div>
            <div className="kpi-value gold">{fmtShort(sm.closeBal)}</div>
            <div className="kpi-sub">Last recorded</div>
          </div>
          <div className="kpi-card neutral">
            <div className="kpi-label">Transactions</div>
            <div className="kpi-value" style={{ color: T.text }}>{sm.txnCount}</div>
            <div className="kpi-sub">{Object.keys(sm.monthly).length} months</div>
          </div>
          <div className="kpi-card neutral">
            <div className="kpi-label">Avg Monthly Out</div>
            <div className="kpi-value" style={{ color: T.text }}>
              {fmtShort(sm.totalOut / Math.max(1, Object.keys(sm.monthly).length))}
            </div>
            <div className="kpi-sub">Per month</div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-row three">
          <CashFlowChart 
            monthly={sm.monthly} 
            sortBy={chartStates.cashFlowSortBy}
            sortOrder={chartStates.cashFlowSortOrder}
            onStateChange={(state) => setChartStates(s => ({ ...s, cashFlowSortBy: state.sortBy, cashFlowSortOrder: state.sortOrder }))} 
          />
          <CategoryDonut 
            catTotals={sm.catTotals} 
            sortBy={chartStates.categorySortBy}
            sortOrder={chartStates.categorySortOrder}
            onStateChange={(state) => setChartStates(s => ({ ...s, categorySortBy: state.sortBy, categorySortOrder: state.sortOrder }))} 
          />
        </div>
        <div className="charts-row">
          <BalanceLine 
            trajectory={sm.balanceTrajectory} 
            showAll={chartStates.balanceShowAll}
            onStateChange={(state) => setChartStates(s => ({ ...s, balanceShowAll: state.showAll }))} 
          />
        </div>
        <div className="charts-row">
          <TopMerchants txns={txns} limit={10} />
        </div>
        <div className="charts-row">
          <DailyHeatmap txns={txns} />
        </div>
        <div className="charts-row">
          <StackedAreaChart monthly={sm.monthly} catTotals={sm.catTotals} />
        </div>

        {/* Mode Grid */}
        <div className="section-title fade-up">Payment Modes</div>
        <div className="mode-grid fade-up">
          {modeCells.map(([mode, d]) => (
            <button 
              key={mode} 
              className="mode-cell"
              onClick={() => setChartStates(s => ({ 
                ...s, 
                transactionFilters: { 
                  ...s.transactionFilters, 
                  mode: mode 
                } 
              }))}
              style={{ 
                background: chartStates.transactionFilters.mode === mode ? T.accent : T.card,
                border: `1px solid ${chartStates.transactionFilters.mode === mode ? T.accent : T.border}`,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div className="mode-name" style={{ color: chartStates.transactionFilters.mode === mode ? '#0A0A0B' : T.text }}>{mode}</div>
              <div className="mode-amount" style={{ color: chartStates.transactionFilters.mode === mode ? '#0A0A0B' : T.accent }}>{fmtShort(d.debit + d.credit)}</div>
              <div className="mode-count" style={{ color: chartStates.transactionFilters.mode === mode ? '#0A0A0B' : T.muted }}>{d.count} txns</div>
            </button>
          ))}
          {chartStates.transactionFilters.mode !== 'all' && (
            <button 
              className="mode-cell"
              onClick={() => setChartStates(s => ({ 
                ...s, 
                transactionFilters: { 
                  ...s.transactionFilters, 
                  mode: 'all' 
                } 
              }))}
              style={{ 
                background: T.card,
                border: `1px solid ${T.border}`,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div className="mode-name" style={{ color: T.text }}>Clear Filter</div>
              <div className="mode-amount" style={{ color: T.muted }}>Show All</div>
              <div className="mode-count" style={{ color: T.muted }}>Reset</div>
            </button>
          )}
        </div>

        {/* Top Counterparties */}
        <div className="section-title fade-up">Top Counterparties</div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }} className="fade-up">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Counterparty</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Total Debited</th>
                <th style={{ textAlign: "right" }}>Txns</th>
              </tr>
            </thead>
            <tbody>
              {sm.topCP.map((cp, i) => (
                <tr key={i}>
                  <td><span className="cp-name">{cp.name}</span></td>
                  <td><CatPill cat={cp.cat} /></td>
                  <td className="cp-amount">{fmt(cp.total)}</td>
                  <td style={{ textAlign: "right", color: T.muted, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{cp.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transaction Table */}
        <TransactionTable 
          txns={txns} 
          transactionSortCol={chartStates.transactionSortCol as any}
          transactionSortDir={chartStates.transactionSortDir}
          transactionFilters={chartStates.transactionFilters}
          onStateChange={(state) => setChartStates(s => ({ 
            ...s, 
            transactionSortCol: state.sortCol, 
            transactionSortDir: state.sortDir,
            transactionFilters: state.filters
          }))} 
        />
      </div>

      {/* Chat */}
      <ChatPanel txns={txns} summary={sm} isOpen={chatOpen} onClose={() => setChatOpen(false)} onAction={handleChatAction} />
      {!chatOpen && (
        <button className="chat-fab" onClick={() => setChatOpen(true)}>
          💬 Ask AI
        </button>
      )}

      {/* Glossary Modal */}
      {showGlossary && (
        <div className="modal-overlay" onClick={() => setShowGlossary(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowGlossary(false)}>✕</button>
            <Glossary />
          </div>
        </div>
      )}
    </>
  );
}
