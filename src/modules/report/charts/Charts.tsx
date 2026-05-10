// ─────────────────────────────────────────────────────────────────────────────
// Chart Components — CashFlowChart, CategoryDonut, BalanceLine, TopMerchants, DailyHeatmap
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area
} from "recharts";
import { T } from "../../../styles/theme";
import { fmtShort } from "../format";
import type { MonthlyData, CategoryTotal, BalanceTrajectory, Transaction } from "../analytics";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: T.muted, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: p.color, marginBottom: 2 }}>
          {p.name}: {fmtShort(p.value)}
        </div>
      ))}
    </div>
  );
};

// ─── Cash Flow Bar Chart ──────────────────────────────────────────────────────
interface CashFlowChartProps {
  monthly: Record<string, MonthlyData>;
  onStateChange?: (state: { sortBy: string; sortOrder: string }) => void;
}

export function CashFlowChart({ monthly, onStateChange }: CashFlowChartProps) {
  const [sortBy, setSortBy] = useState<"month" | "credits" | "debits">("month");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSortByChange = (value: any) => {
    setSortBy(value);
    onStateChange?.({ sortBy: value, sortOrder });
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    onStateChange?.({ sortBy, sortOrder: newOrder });
  };

  const data = Object.entries(monthly)
    .sort(([a], [b]) => {
      if (sortBy === "month") return sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      const valA = sortBy === "credits" ? monthly[a].income : monthly[a].expense;
      const valB = sortBy === "credits" ? monthly[b].income : monthly[b].expense;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    })
    .map(([m, d]) => ({
      month: m.slice(5) + " '" + m.slice(2, 4),
      Credits: Math.round(d.income),
      Debits: Math.round(d.expense),
    }));

  return (
    <div className="chart-card fade-up fade-up-2">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="chart-title">Monthly Cash Flow</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="chart-filter"
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            title="Sort by"
          >
            <option value="month">Month</option>
            <option value="credits">Credits</option>
            <option value="debits">Debits</option>
          </select>
          <button
            className="chart-sort-btn"
            onClick={handleSortOrderChange}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <span className="chart-info" title="Shows monthly income vs expenses. Sort by month to see chronological order, or by amount to see highest/lowest months. Toggle ascending/descending to change sort direction.">ℹ️</span>
        </div>
      </div>
      <div style={{ width: "50%", maxHeight: 400, margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={8} barGap={2}>
            <CartesianGrid vertical={false} stroke={T.border} />
            <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: T.muted }} />
            <Bar dataKey="Credits" fill={T.green} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Debits" fill={T.red} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Category Donut Chart ─────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;

const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!midAngle || percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CategoryDonutProps {
  catTotals: Record<string, CategoryTotal>;
  sortBy?: string;
  sortOrder?: string;
  onStateChange?: (state: { sortBy: string; sortOrder: string }) => void;
}

export function CategoryDonut({ catTotals, sortBy: propSortBy, sortOrder: propSortOrder, onStateChange }: CategoryDonutProps) {
  const [sortBy, setSortBy] = useState<"value" | "count">(propSortBy as any || "value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(propSortOrder as any || "desc");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    if (propSortBy) setSortBy(propSortBy as any);
    if (propSortOrder) setSortOrder(propSortOrder as any);
  }, [propSortBy, propSortOrder]);

  const handleSortByChange = (value: any) => {
    setSortBy(value);
    onStateChange?.({ sortBy: value, sortOrder });
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    onStateChange?.({ sortBy, sortOrder: newOrder });
  };

  const data = Object.entries(catTotals)
    .filter(([, v]) => v.total > 0)
    .sort(([, a], [, b]) => {
      const valA = sortBy === "value" ? a.total : a.count;
      const valB = sortBy === "value" ? b.total : b.count;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    })
    .slice(0, 8)
    .map(([cat, v]) => ({ name: cat, value: Math.round(v.total), count: v.count, fill: T.catColors[cat] || "#6B7280" }));

  const topCategory = data[0];
  const trend = topCategory?.value > 0 ? "up" : "neutral";

  return (
    <div className="chart-card fade-up fade-up-3">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="chart-title">Spend by Category</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {topCategory && (
            <span className={`chart-indicator ${trend}`}>
              {trend === "up" ? "↑" : "→"} {topCategory.name}
            </span>
          )}
          <select
            className="chart-filter"
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            title="Sort by"
          >
            <option value="value">Amount</option>
            <option value="count">Count</option>
          </select>
          <button
            className="chart-sort-btn"
            onClick={handleSortOrderChange}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <span className="chart-info" title="Shows spending distribution by category. Hover for details.">ℹ️</span>
        </div>
      </div>
      <div style={{ width: "50%", maxHeight: 400, margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={55} outerRadius={90}
              paddingAngle={2} dataKey="value"
              labelLine={false} label={renderCustomLabel}
              onMouseEnter={(_, i) => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} opacity={activeIdx === null || activeIdx === i ? 1 : 0.5} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => fmtShort(v as number)}
              contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, fontFamily: "'DM Mono',monospace", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.fill, display: "inline-block" }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Balance Trajectory Line Chart ───────────────────────────────────────────
interface BalanceLineProps {
  trajectory: BalanceTrajectory[];
  showAll?: boolean;
  onStateChange?: (state: { showAll: boolean }) => void;
}

export function BalanceLine({ trajectory, showAll: propShowAll, onStateChange }: BalanceLineProps) {
  if (!trajectory?.length) return null;
  const [showAll, setShowAll] = useState(propShowAll || false);

  useEffect(() => {
    if (propShowAll !== undefined) setShowAll(propShowAll);
  }, [propShowAll]);

  const handleToggle = () => {
    const newValue = !showAll;
    setShowAll(newValue);
    onStateChange?.({ showAll: newValue });
  };

  const data = (showAll ? trajectory : trajectory.slice(-12)).map(p => ({
    month: p.month.slice(5) + "'" + p.month.slice(2, 4),
    balance: Math.round(p.balance)
  }));

  const startBalance = data[0]?.balance || 0;
  const endBalance = data[data.length - 1]?.balance || 0;
  const trend = endBalance > startBalance ? "up" : endBalance < startBalance ? "down" : "neutral";

  return (
    <div className="chart-card fade-up fade-up-4" style={{ gridColumn: "1/-1" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="chart-title">Balance Trajectory</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`chart-indicator ${trend}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trend === "up" ? "Growing" : trend === "down" ? "Declining" : "Stable"}
          </span>
          <button
            className="chart-filter"
            onClick={handleToggle}
            title={showAll ? "Show last 12 months" : "Show all months"}
          >
            {showAll ? "12m" : "All"}
          </button>
          <span className="chart-info" title="Shows account balance trend over time. Toggle '12m' to view recent months or 'All' for full history. The indicator shows if your balance is growing, declining, or stable.">ℹ️</span>
        </div>
      </div>
      <div style={{ width: "50%", maxHeight: 400, margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke={T.border} />
            <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="balance" name="Balance" stroke={T.accent} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Top Merchants Table with Sparklines ─────────────────────────────────────────
interface MerchantData {
  name: string;
  total: number;
  count: number;
  category: string;
  weeklyTrend: number[];
  avgWeekly: number;
  isRecurring: boolean;
}

interface TopMerchantsProps {
  txns: Transaction[];
  limit?: number;
}

export function TopMerchants({ txns, limit = 10 }: TopMerchantsProps) {
  const [sortBy, setSortBy] = useState<"total" | "count" | "avg">("total");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const merchantData = useMemo(() => {
    const merchantMap = new Map<string, { txns: Transaction[]; total: number; count: number; category: string }>();
    
    txns.forEach(txn => {
      if (!txn.name || !txn.isDebit) return;
      const name = txn.name.trim();
      if (!merchantMap.has(name)) {
        merchantMap.set(name, { txns: [], total: 0, count: 0, category: txn.cat });
      }
      const data = merchantMap.get(name)!;
      data.txns.push(txn);
      data.total += txn.amount;
      data.count += 1;
    });

    const merchants: MerchantData[] = [];
    merchantMap.forEach((data, name) => {
      const weekMap = new Map<string, number>();
      data.txns.forEach(txn => {
        const date = new Date(txn.date);
        const year = date.getFullYear();
        const week = Math.ceil(date.getDate() / 7);
        const weekKey = `${year}-W${week}`;
        weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + txn.amount);
      });

      const weeklyTrend = Array.from(weekMap.values());
      const avgWeekly = weeklyTrend.length > 0 ? weeklyTrend.reduce((a, b) => a + b, 0) / weeklyTrend.length : 0;
      const isRecurring = weekMap.size >= 3;

      merchants.push({
        name,
        total: data.total,
        count: data.count,
        category: data.category,
        weeklyTrend: weeklyTrend.slice(-8),
        avgWeekly,
        isRecurring
      });
    });

    return merchants.sort((a, b) => {
      const valA = sortBy === "total" ? a.total : sortBy === "count" ? a.count : a.avgWeekly;
      const valB = sortBy === "total" ? b.total : sortBy === "count" ? b.count : b.avgWeekly;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    }).slice(0, limit);
  }, [txns, sortBy, sortOrder, limit]);

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 30;
    const padding = 2;

    const points = data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="chart-card fade-up fade-up-5" style={{ gridColumn: "1/-1" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="chart-title">Top Merchants</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="chart-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            title="Sort by"
          >
            <option value="total">Total Spend</option>
            <option value="count">Transaction Count</option>
            <option value="avg">Avg Weekly</option>
          </select>
          <button
            className="chart-sort-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <span className="chart-info" title="Shows top spending merchants with weekly trends. Recurring merchants (appearing in 3+ weeks) are marked.">ℹ️</span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, color: T.muted }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Merchant</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Total</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Count</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Avg/Wk</th>
              <th style={{ padding: "8px 12px", textAlign: "center" }}>8-Week Trend</th>
              <th style={{ padding: "8px 12px", textAlign: "center" }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {merchantData.map((merchant, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}20` }}>
                <td style={{ padding: "8px 12px", color: T.text }}>{merchant.name}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", color: T.text }}>{fmtShort(merchant.total)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", color: T.text }}>{merchant.count}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", color: T.text }}>{fmtShort(merchant.avgWeekly)}</td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <Sparkline data={merchant.weeklyTrend} color={T.accent} />
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  {merchant.isRecurring ? (
                    <span style={{ background: `${T.green}20`, color: T.green, padding: "2px 8px", borderRadius: 10, fontSize: 10 }}>Recurring</span>
                  ) : (
                    <span style={{ background: `${T.muted}20`, color: T.muted, padding: "2px 8px", borderRadius: 10, fontSize: 10 }}>One-time</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Daily Heatmap Calendar ─────────────────────────────────────────────────────
interface DailyHeatmapProps {
  txns: Transaction[];
  year?: number;
}

export function DailyHeatmap({ txns, year }: DailyHeatmapProps) {
  const currentYear = year || new Date().getFullYear();
  
  const dailyData = useMemo(() => {
    const dayMap = new Map<string, number>();
    
    txns.forEach(txn => {
      if (!txn.isDebit) return;
      const date = new Date(txn.date);
      if (date.getFullYear() !== currentYear) return;
      const dateKey = txn.date;
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + txn.amount);
    });

    return dayMap;
  }, [txns, currentYear]);

  const getIntensity = (amount: number) => {
    if (amount === 0) return 0;
    const max = Math.max(...dailyData.values());
    const ratio = amount / max;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const getColor = (intensity: number) => {
    const colors = [T.border, `${T.accent}20`, `${T.accent}40`, `${T.accent}60`, T.accent];
    return colors[intensity];
  };

  const renderCalendar = () => {
    const cells = [];
    
    for (let month = 0; month < 12; month++) {
      const lastDay = new Date(currentYear, month + 1, 0);
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, month, day);
        const dateKey = date.toISOString().split('T')[0];
        const amount = dailyData.get(dateKey) || 0;
        const intensity = getIntensity(amount);
        
        cells.push(
          <div
            key={dateKey}
            style={{
              width: 12,
              height: 12,
              background: getColor(intensity),
              borderRadius: 2,
              margin: 1,
              cursor: "pointer",
              transition: "transform 0.1s"
            }}
            title={`${dateKey}: ${fmtShort(amount)}`}
          />
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="chart-card fade-up fade-up-6" style={{ gridColumn: "1/-1" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="chart-title">Daily Spending Heatmap - {currentYear}</div>
        <span className="chart-info" title="Daily spending intensity heatmap. Darker cells indicate higher spending.">ℹ️</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 800 }}>
          {renderCalendar()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: T.muted }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: 12, height: 12, background: getColor(i), borderRadius: 2 }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stacked Area Chart (Category Breakdown Over Time) ─────────────────────────
interface StackedAreaProps {
  monthly: Record<string, MonthlyData>;
  catTotals: Record<string, CategoryTotal>;
}

export function StackedAreaChart({ monthly, catTotals }: StackedAreaProps) {
  const [showAll, setShowAll] = useState(false);

  const data = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(showAll ? -24 : -12)
    .map(([m, d]) => ({
      month: m.slice(5) + "'" + m.slice(2, 4),
      Income: d.income,
      Expense: d.expense,
      Net: d.income - d.expense
    }));

  return (
    <div className="chart-card fade-up fade-up-7" style={{ gridColumn: "1/-1" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="chart-title">Cash Flow Stacked Area</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="chart-filter"
            onClick={() => setShowAll(!showAll)}
            title={showAll ? "Show last 12 months" : "Show last 24 months"}
          >
            {showAll ? "24m" : "12m"}
          </button>
          <span className="chart-info" title="Shows income and expense as stacked areas over time.">ℹ️</span>
        </div>
      </div>
      <div style={{ width: "50%", maxHeight: 400, margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} stroke={T.border} />
            <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: T.muted }} />
            <Area type="monotone" dataKey="Income" stackId="1" fill={T.green} stroke={T.green} opacity={0.6} />
            <Area type="monotone" dataKey="Expense" stackId="2" fill={T.red} stroke={T.red} opacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
