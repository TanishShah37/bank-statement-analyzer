// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeTokens {
  bg: string;
  surface: string;
  card: string;
  border: string;
  borderHover: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  green: string;
  red: string;
  blue: string;
  catColors: Record<string, string>;
}

export const T: ThemeTokens = {
  bg: "#0A0A0B",
  surface: "#111113",
  card: "#17171A",
  border: "#252529",
  borderHover: "#3A3A40",
  text: "#F0EDE8",
  muted: "#8A8A95",
  accent: "#E8C547",
  accentHover: "#F2D060",
  green: "#4ADE80",
  red: "#F87171",
  blue: "#60A5FA",

  catColors: {
    "Income": "#4ADE80",
    "Transfer": "#60A5FA",
    "Loan / Finance": "#F87171",
    "Shopping": "#A78BFA",
    "Cash (ATM)": "#FB923C",
    "Cheque": "#94A3B8",
    "Food & Dining": "#FCD34D",
    "Health": "#34D399",
    "Telecom / Apps": "#38BDF8",
    "Utilities": "#818CF8",
    "Bank Charges": "#F472B6",
    "Other": "#6B7280",
  }
};

export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    background: ${T.bg};
    color: ${T.text};
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
  }

  .ds-app {
    min-height: 100vh;
    background: ${T.bg};
    position: relative;
    overflow-x: hidden;
  }

  .ds-app::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.4;
  }

  /* HEADER */
  .ds-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 64px;
    background: ${T.card};
    border-bottom: 1px solid ${T.border};
  }
  .ds-logo {
    font-size: 22px; font-weight: 700;
    color: ${T.text};
  }
  .ds-logo span { color: ${T.accent}; }
  .ds-header-actions { display: flex; gap: 10px; align-items: center; }

  /* FOOTER */
  .ds-footer {
    background: ${T.card};
    border-top: 1px solid ${T.border};
    padding: 48px 24px 24px;
    margin-top: auto;
  }
  .ds-footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;
  }
  .ds-footer-section {
    display: flex; flex-direction: column;
    gap: 12px;
  }
  .ds-footer-logo {
    font-size: 20px; font-weight: 700;
    color: ${T.text};
  }
  .ds-footer-logo span { color: ${T.accent}; }
  .ds-footer-tagline {
    font-size: 14px;
    color: ${T.muted};
  }
  .ds-footer-heading {
    font-size: 14px; font-weight: 600;
    color: ${T.text};
  }
  .ds-footer-link {
    background: none; border: none;
    font-size: 13px;
    color: ${T.muted};
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .ds-footer-link:hover {
    color: ${T.accent};
  }
  .ds-footer-bottom {
    max-width: 1200px;
    margin: 32px auto 0;
    padding-top: 24px;
    border-top: 1px solid ${T.border};
    display: flex; flex-direction: column;
    gap: 12px;
  }
  .ds-footer-disclaimer {
    font-size: 12px;
    color: ${T.muted};
    line-height: 1.6;
  }
  .ds-footer-copyright {
    font-size: 12px;
    color: ${T.muted};
  }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; transition: all 0.15s ease;
    white-space: nowrap;
  }
  .btn-ghost {
    background: transparent; color: ${T.muted};
    border: 1px solid ${T.border};
  }
  .btn-ghost:hover { color: ${T.text}; border-color: ${T.borderHover}; background: rgba(255,255,255,0.04); }
  .btn-accent {
    background: ${T.accent}; color: #0A0A0B; font-weight: 600;
  }
  .btn-accent:hover { background: ${T.accentHover}; transform: translateY(-1px); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }

  /* UPLOAD SCREEN */
  .upload-screen {
    display: flex; align-items: center; justify-content: center;
    min-height: calc(100vh - 60px);
    padding: 40px 24px;
  }
  .upload-inner { max-width: 680px; width: 100%; }
  .upload-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 700; line-height: 1.1;
    letter-spacing: -2px;
    margin-bottom: 16px;
  }
  .upload-headline em { font-style: normal; color: ${T.accent}; }
  .upload-sub { color: ${T.muted}; font-size: 16px; margin-bottom: 48px; max-width: 460px; }

  .drop-zone {
    border: 1.5px dashed ${T.border};
    border-radius: 16px;
    padding: 48px 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${T.surface};
    position: relative;
    overflow: hidden;
  }
  .drop-zone::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(232,197,71,0.06) 0%, transparent 60%);
    pointer-events: none;
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color: ${T.accent};
    background: rgba(232,197,71,0.03);
  }
  .drop-icon {
    width: 56px; height: 56px; margin: 0 auto 16px;
    background: rgba(232,197,71,0.1);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
  }
  .drop-title { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
  .drop-sub { color: ${T.muted}; font-size: 13px; }
  .drop-sub strong { color: ${T.text}; }
  .drop-input { display: none; }

  .divider-row { display: flex; align-items: center; gap: 16px; margin: 24px 0; color: ${T.muted}; font-size: 12px; }
  .divider-row::before, .divider-row::after { content:''; flex:1; height:1px; background:${T.border}; }

  .demo-card {
    display: flex; align-items: center; gap: 16px;
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 18px 20px; cursor: pointer;
    transition: all 0.15s ease;
  }
  .demo-card:hover { border-color: ${T.borderHover}; background: #1D1D21; }
  .demo-card-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(96,165,250,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .demo-card-text { flex: 1; }
  .demo-card-label { font-size: 14px; font-weight: 500; }
  .demo-card-sub { font-size: 12px; color: ${T.muted}; margin-top: 2px; }

  .schema-hint {
    margin-top: 24px; padding: 14px 18px;
    background: rgba(255,255,255,0.02); border: 1px solid ${T.border};
    border-radius: 10px; font-size: 12px; color: ${T.muted};
  }
  .schema-hint strong { color: ${T.text}; }
  .schema-cols { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .schema-col {
    font-family: 'DM Mono', monospace; font-size: 11px;
    padding: 3px 8px; border-radius: 5px;
    background: rgba(255,255,255,0.04); border: 1px solid ${T.border};
    color: ${T.accent};
  }

  /* PROGRESS */
  .progress-screen {
    display: flex; align-items: center; justify-content: center;
    min-height: calc(100vh - 60px);
  }
  .progress-card {
    width: 420px; text-align: center;
    padding: 48px 40px;
  }
  .progress-file {
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: ${T.muted};
    margin-bottom: 32px; word-break: break-all;
  }
  .progress-label { font-size: 14px; color: ${T.muted}; margin-bottom: 12px; }
  .progress-bar-track {
    height: 3px; background: ${T.border}; border-radius: 2px; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; background: ${T.accent}; border-radius: 2px;
    transition: width 0.4s ease;
  }
  .progress-pct {
    font-family: 'DM Mono', monospace;
    font-size: 48px; font-weight: 500;
    color: ${T.text}; margin-bottom: 8px;
    letter-spacing: -2px;
  }

  /* ERROR */
  .error-screen {
    display: flex; align-items: center; justify-content: center;
    min-height: calc(100vh - 60px);
    position: relative;
  }
  .error-screen::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.4;
  }
  .error-card {
    max-width: 480px; text-align: center; padding: 48px 40px;
    background: ${T.card}; border: 1px solid rgba(248,113,113,0.2);
    border-radius: 20px;
    position: relative; z-index: 1;
  }
  .error-icon { font-size: 40px; margin-bottom: 16px; }
  .error-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  .error-msg { color: ${T.muted}; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }

  /* DASHBOARD */
  .dashboard { padding: 32px; max-width: 1400px; margin: 0 auto; }
  .dashboard-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; gap: 16px; flex-wrap: wrap;
  }
  .dashboard-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; }
  .dashboard-meta { color: ${T.muted}; font-size: 13px; margin-top: 4px; }
  .dashboard-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  /* KPI ROW */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px; margin-bottom: 24px;
  }
  .kpi-card {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 14px; padding: 20px;
    position: relative; overflow: hidden;
    transition: border-color 0.15s;
  }
  .kpi-card:hover { border-color: ${T.borderHover}; }
  .kpi-card::before {
    content: ''; position: absolute;
    top: 0; right: 0; width: 80px; height: 80px;
    border-radius: 50%; filter: blur(30px);
    pointer-events: none;
  }
  .kpi-card.positive::before { background: rgba(74,222,128,0.15); }
  .kpi-card.negative::before { background: rgba(248,113,113,0.15); }
  .kpi-card.neutral::before  { background: rgba(232,197,71,0.1); }
  .kpi-label { font-size: 11px; font-weight: 500; color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .kpi-value {
    font-family: 'DM Mono', monospace;
    font-size: 22px; font-weight: 500;
    letter-spacing: -0.5px; line-height: 1;
  }
  .kpi-value.green { color: ${T.green}; }
  .kpi-value.red   { color: ${T.red}; }
  .kpi-value.gold  { color: ${T.accent}; }
  .kpi-sub { font-size: 11px; color: ${T.muted}; margin-top: 4px; }

  /* CHARTS GRID */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 24px;
  }
  .charts-row.three { grid-template-columns: 2fr 1fr; }

  .chart-card {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 14px; padding: 24px;
  }
  .chart-filter {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 6px; padding: 6px 10px;
    color: ${T.text}; font-size: 11px; outline: none;
    cursor: pointer;
  }
  .chart-filter:focus { border-color: ${T.accent}; }
  .chart-sort-btn {
    width: 24px; height: 24px; border-radius: 4px;
    background: ${T.surface}; border: 1px solid ${T.border};
    color: ${T.muted}; font-size: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .chart-sort-btn:hover { border-color: ${T.borderHover}; color: ${T.text}; }
  .chart-info {
    font-size: 14px; cursor: help; opacity: 0.6;
    transition: opacity 0.15s;
  }
  .chart-info:hover { opacity: 1; }
  .chart-indicator {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 8px; border-radius: 12px;
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .chart-indicator.up { background: rgba(74,222,128,0.15); color: ${T.green}; }
  .chart-indicator.down { background: rgba(248,113,113,0.15); color: ${T.red}; }
  .chart-indicator.neutral { background: rgba(232,197,71,0.1); color: ${T.accent}; }
  .chart-title {
    font-size: 13px; font-weight: 600;
    color: ${T.muted}; text-transform: uppercase;
    letter-spacing: 0.7px; margin-bottom: 20px;
  }

  /* GLOSSARY */
  .glossary-section {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 14px; padding: 24px; margin-bottom: 24px;
  }
  .glossary-header { margin-bottom: 24px; }
  .glossary-title {
    font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700;
    color: ${T.text}; margin-bottom: 8px;
  }
  .glossary-subtitle { color: ${T.muted}; font-size: 14px; }
  .glossary-filters {
    display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .glossary-search {
    flex: 1; min-width: 200px;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 14px; outline: none;
  }
  .glossary-search:focus { border-color: ${T.accent}; }
  .glossary-category-filter {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 14px; outline: none; cursor: pointer;
  }
  .glossary-sort-filter {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 14px; outline: none; cursor: pointer;
  }
  .glossary-sort-toggle {
    width: 36px; height: 36px; border-radius: 8px;
    background: ${T.surface}; border: 1px solid ${T.border};
    color: ${T.muted}; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .glossary-sort-toggle:hover { border-color: ${T.borderHover}; color: ${T.text}; }
  .glossary-content {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }

  /* RESPONSIVE BREAKPOINTS */
  @media (max-width: 1024px) {
    /* Tablet */
    .dashboard { padding: 24px; }
    .kpi-row { grid-template-columns: repeat(3, 1fr); }
    .charts-row { grid-template-columns: 1fr; }
    .charts-row.three { grid-template-columns: 1fr; }
    .dashboard-actions { flex-wrap: wrap; }
  }

  @media (max-width: 768px) {
    .glossary-content { grid-template-columns: 1fr; }
    
    /* Dashboard */
    .dashboard { padding: 16px; }
    .dashboard-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .dashboard-title { font-size: 22px; }
    .dashboard-meta { font-size: 12px; }
    .dashboard-actions { width: 100%; flex-wrap: wrap; gap: 8px; }
    .dashboard-actions .btn { flex: 1; min-width: 120px; justify-content: center; }
    
    /* KPI Row */
    .kpi-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .kpi-card { padding: 16px; }
    .kpi-value { font-size: 18px; }
    .kpi-label { font-size: 10px; }
    
    /* Charts */
    .charts-row { grid-template-columns: 1fr !important; gap: 12px; }
    .charts-row.three { grid-template-columns: 1fr !important; }
    .chart-card { padding: 16px; }
    .chart-title { font-size: 12px; margin-bottom: 12px; }
    
    /* Mode Grid */
    .mode-grid { grid-template-columns: repeat(2, 1fr); }
    
    /* Transaction Table */
    .txn-filters { flex-direction: column; gap: 8px; }
    .txn-search { width: 100%; }
    .filter-select { width: 100%; }
    .view-toggle { display: none; }
    
    /* Header */
    .ds-header { padding: 0 16px; height: 56px; }
    .ds-logo { font-size: 18px; }
    .ds-header-actions { gap: 6px; }
    .ds-header-actions .btn { padding: 6px 10px; font-size: 12px; }
    
    /* Modal */
    .modal-content { padding: 16px; max-height: 90vh; margin: 16px; }
    .modal-close { width: 36px; height: 36px; }
    
    /* Chat Panel */
    .chat-panel { width: 100% !important; height: 100% !important; border-radius: 0 !important; }
    .chat-header { padding: 16px 20px; }
    .chat-messages { padding: 16px 20px; }
    .chat-input-row { padding: 12px 20px; }
    .chat-fab { width: 50px; height: 50px; bottom: 20px; right: 20px; }
    
    /* Upload Screen */
    .upload-screen { padding: 24px 16px; min-height: calc(100vh - 56px); }
    .upload-inner { max-width: 100%; }
    .upload-headline { font-size: 32px; letter-spacing: -1.5px; }
    .upload-sub { font-size: 14px; max-width: 100%; }
    .drop-zone { padding: 32px 20px; }
    .drop-icon { width: 48px; height: 48px; font-size: 20px; }
    .drop-title { font-size: 15px; }
    .drop-sub { font-size: 12px; }
    .demo-card { padding: 14px 16px; }
    .demo-card-icon { width: 36px; height: 36px; font-size: 16px; }
    .schema-hint { padding: 12px 14px; font-size: 11px; }
    .schema-col { font-size: 10px; padding: 2px 6px; }
    
    /* Progress Card */
    .progress-card { width: 100%; max-width: 100%; padding: 32px 24px; }
    .progress-pct { font-size: 36px; }
    .progress-file { font-size: 12px; }
    .progress-label { font-size: 13px; }
    
    /* Error Card */
    .error-card { width: 100%; max-width: 100%; padding: 32px 24px; }
    .error-icon { font-size: 36px; }
    .error-title { font-size: 18px; }
    .error-msg { font-size: 13px; }
    
    /* Category Pills Table */
    .cp-table { display: block; overflow-x: auto; white-space: nowrap; }
    .cp-table thead, .cp-table tbody, .cp-table tr, .cp-table td { display: block; }
    .cp-table thead { display: none; }
    .cp-table tr { margin-bottom: 12px; border: 1px solid ${T.border}; border-radius: 8px; padding: 12px; }
    .cp-table td { border: none; padding: 4px 0; text-align: left !important; }
    .cp-table td::before { content: attr(data-label); font-weight: 600; color: ${T.muted}; display: block; margin-bottom: 4px; }
    
    /* Glossary */
    .glossary-section { padding: 16px; }
    .glossary-title { font-size: 20px; }
    .glossary-filters { gap: 8px; }
    .glossary-search { font-size: 14px; padding: 8px 12px; }
    .glossary-detail { padding: 16px; }
    .glossary-detail-title { font-size: 18px; }
    
    /* Section Titles */
    .section-title { font-size: 12px; }
  }

  @media (max-width: 480px) {
    /* Small Mobile */
    body, #root { font-size: 13px; }
    
    /* KPI Row - single column on very small screens */
    .kpi-row { grid-template-columns: 1fr; gap: 8px; }
    .kpi-card { padding: 14px; }
    .kpi-value { font-size: 20px; }
    
    /* Mode Grid - single column */
    .mode-grid { grid-template-columns: 1fr; }
    .mode-cell { padding: 12px; }
    
    /* Dashboard Actions - stack vertically */
    .dashboard-actions { flex-direction: column; }
    .dashboard-actions .btn { width: 100%; justify-content: center; min-width: auto; }
    
    /* Chart filters - stack vertically */
    .chart-card > div:first-child { flex-direction: column; align-items: flex-start; gap: 8px; }
    
    /* Glossary filters - stack vertically */
    .glossary-filters { flex-direction: column; }
    .glossary-search { width: 100%; }
    .glossary-category-filter, .glossary-sort-filter { width: 100%; }
    
    /* Transaction table - minimal view */
    .txn-table { font-size: 11px; }
    .txn-table th, .txn-table td { padding: 8px 8px; }
    .txn-date { font-size: 10px; }
    .txn-name { font-size: 12px; }
    
    /* Upload Screen */
    .upload-screen { padding: 20px 12px; }
    .upload-headline { font-size: 28px; }
    .upload-sub { font-size: 13px; }
    .drop-zone { padding: 24px 16px; }
    .drop-icon { width: 44px; height: 44px; font-size: 18px; }
    .drop-title { font-size: 14px; }
    .drop-sub { font-size: 11px; }
    .demo-card { padding: 12px 14px; }
    .demo-card-label { font-size: 13px; }
    .demo-card-sub { font-size: 11px; }
    
    /* Buttons - ensure 44px touch targets */
    .btn { min-height: 44px; padding: 10px 16px; }
    .btn-sm { min-height: 36px; padding: 8px 12px; }
    
    /* Header */
    .ds-header { padding: 0 12px; height: 52px; }
    .ds-logo { font-size: 16px; }
    .ds-header-actions { gap: 4px; }
    .ds-header-actions .btn { padding: 6px 8px; font-size: 11px; }
    
    /* Progress */
    .progress-card { padding: 24px 16px; }
    .progress-pct { font-size: 32px; }
    
    /* Error */
    .error-card { padding: 24px 16px; }
    .error-actions { flex-direction: column; }
    .error-actions .btn { width: 100%; justify-content: center; }
    
    /* Chat */
    .chat-bubble { font-size: 12px; padding: 10px 14px; }
    .chat-sugg { font-size: 11px; padding: 6px 10px; }
  }

  @media (max-width: 360px) {
    /* Very small screens */
    .upload-headline { font-size: 24px; }
    .kpi-value { font-size: 18px; }
    .drop-zone { padding: 20px 12px; }
  }

  @media (min-width: 1200px) {
    /* Large screens - wider dashboard */
    .dashboard { max-width: 1600px; }
    .kpi-row { grid-template-columns: repeat(5, 1fr); }
    .charts-row { gap: 16px; }
  }

  @media (min-width: 1400px) {
    /* Extra large screens */
    .dashboard { max-width: 1800px; }
    .kpi-row { grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .kpi-card { padding: 24px; }
  }
  .glossary-terms-list {
    display: flex; flex-direction: column; gap: 8px;
    max-height: 500px; overflow-y: auto;
  }
  .glossary-terms-count {
    font-size: 12px; color: ${T.muted}; margin-bottom: 8px;
    padding: 4px 8px; background: ${T.surface};
    border-radius: 4px; display: inline-block;
  }
  .glossary-term {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 12px 16px;
    cursor: pointer; transition: all 0.15s;
  }
  .glossary-term:hover { border-color: ${T.borderHover}; }
  .glossary-term.active { border-color: ${T.accent}; background: rgba(232,197,71,0.05); }
  .glossary-term-name { font-weight: 600; font-size: 14px; color: ${T.text}; }
  .glossary-term-category { font-size: 11px; color: ${T.muted}; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .glossary-term-preview {
    font-size: 12px; color: ${T.muted}; margin-top: 6px;
    line-height: 1.4; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .glossary-detail {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 20px; position: sticky; top: 0;
    align-self: start;
  }
  .glossary-detail-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid ${T.border};
  }
  .glossary-detail-title { font-size: 20px; font-weight: 600; color: ${T.text}; }
  .glossary-detail-category {
    background: ${T.accent}; color: #0A0A0B;
    padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .glossary-detail-definition { line-height: 1.7; color: ${T.muted}; font-size: 14px; }
  .glossary-link {
    color: ${T.accent}; cursor: help; border-bottom: 1px dashed ${T.accent};
    transition: opacity 0.15s;
  }
  .glossary-link:hover { opacity: 0.7; }
  .glossary-sup {
    font-size: 10px; color: ${T.accent}; margin-left: 2px;
    cursor: help;
  }

  /* ADS */
  .ad-banner {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 16px; margin-bottom: 16px;
    text-align: center; position: relative; overflow: hidden;
  }
  .ad-banner::before {
    content: 'Feature'; position: absolute; top: 8px; right: 8px;
    font-size: 9px; color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .ad-banner-content {
    display: flex; align-items: center; justify-content: center;
    gap: 16px; min-height: 80px;
  }
  .ad-banner-text { color: ${T.muted}; font-size: 13px; }
  .ad-button {
    background: ${T.accent}; color: #0A0A0B; border: none;
    padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: opacity 0.15s;
  }
  .ad-button:hover { opacity: 0.9; }
  .ad-sidebar {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 20px; min-height: 250px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; position: relative;
  }
  .ad-sidebar::before {
    content: 'Feature'; position: absolute; top: 8px; right: 8px;
    font-size: 9px; color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
  }
  .modal-content {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 16px; padding: 24px;
    max-width: 900px; max-height: 85vh; overflow-y: auto;
    position: relative; width: 100%;
  }
  .modal-close {
    position: absolute; top: 16px; right: 16px;
    background: ${T.surface}; border: 1px solid ${T.border};
    color: ${T.muted}; width: 32px; height: 32px; border-radius: 8px;
    cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; z-index: 10;
  }
  .modal-close:hover { border-color: ${T.borderHover}; color: ${T.text}; }

  /* MODE GRID */
  .mode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px; margin-bottom: 24px;
  }
  .mode-cell {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 10px; padding: 14px;
    transition: border-color 0.15s;
  }
  .mode-cell:hover { border-color: ${T.borderHover}; }
  .mode-name { font-family: 'DM Mono', monospace; font-size: 12px; color: ${T.muted}; margin-bottom: 4px; }
  .mode-amount { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; }
  .mode-count { font-size: 11px; color: ${T.muted}; margin-top: 2px; }

  /* TOP COUNTERPARTIES */
  .section-title {
    font-size: 13px; font-weight: 600;
    color: ${T.muted}; text-transform: uppercase;
    letter-spacing: 0.7px; margin-bottom: 14px;
  }
  .cp-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .cp-table th {
    text-align: left; font-size: 11px; font-weight: 500;
    color: ${T.muted}; text-transform: uppercase;
    letter-spacing: 0.6px; padding: 6px 12px;
    border-bottom: 1px solid ${T.border};
  }
  .cp-table td {
    padding: 10px 12px; font-size: 13px;
    border-bottom: 1px solid rgba(37,37,41,0.6);
  }
  .cp-table tr:last-child td { border-bottom: none; }
  .cp-table tr:hover td { background: rgba(255,255,255,0.02); }
  .cp-name { font-family: 'DM Mono', monospace; font-size: 12px; }
  .cp-amount { font-family: 'DM Mono', monospace; text-align: right; }
  .cat-pill {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 99px;
    font-size: 11px; font-weight: 500;
  }

  /* TRANSACTION TABLE */
  .txn-section { margin-bottom: 24px; }
  .txn-filters {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 16px; align-items: center;
  }
  .txn-search {
    flex: 1; min-width: 200px;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 13px; outline: none;
  }
  .txn-search:focus { border-color: ${T.accent}; }
  .filter-select {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 13px; outline: none; cursor: pointer;
  }
  .view-toggle {
    display: flex; gap: 4px;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 2px;
  }
  .view-btn {
    width: 32px; height: 32px; border-radius: 6px;
    background: transparent; border: none; color: ${T.muted};
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .view-btn.active { background: ${T.card}; color: ${T.text}; }
  .view-btn:hover { color: ${T.text}; }
  .txn-table-wrap {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 14px; overflow: hidden;
  }
  .txn-table {
    width: 100%; border-collapse: collapse;
    font-size: 12px;
  }
  .txn-table th {
    background: ${T.surface}; border-bottom: 1px solid ${T.border};
    padding: 12px 16px; text-align: left;
    font-weight: 600; color: ${T.muted}; font-size: 11px;
    cursor: pointer; user-select: none;
  }
  .txn-table th:hover { color: ${T.text}; }
  .txn-table td {
    border-bottom: 1px solid ${T.border};
    padding: 12px 16px;
  }
  .txn-table tr:last-child td { border-bottom: none; }
  .txn-table tr:hover { background: rgba(255,255,255,0.02); }
  .txn-date {
    font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.muted};
  }
  .txn-name { font-weight: 500; }
  .txn-mode {
    font-family: 'DM Mono', monospace; font-size: 11px;
    background: ${T.surface}; padding: 4px 8px; border-radius: 4px;
    color: ${T.muted};
  }
  .txn-amount {
    font-family: 'DM Mono', monospace; font-weight: 500;
  }
  .txn-amount.credit { color: ${T.green}; }
  .txn-amount.debit { color: ${T.red}; }
  .txn-balance {
    font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.muted};
  }
  
  /* Transaction Grid View */
  .txn-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  .txn-card {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 16px;
    transition: border-color 0.15s;
  }
  .txn-card:hover { border-color: ${T.borderHover}; }
  .txn-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .txn-card-body {
    margin-bottom: 12px;
  }
  .txn-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid ${T.border};
  }
  
  /* Pagination */
  .pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-top: 1px solid ${T.border};
    background: ${T.surface};
  }
  .page-btns { display: flex; gap: 4px; }
  .page-btn {
    width: 28px; height: 28px; border-radius: 6px;
    background: ${T.card}; border: 1px solid ${T.border};
    color: ${T.muted}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; transition: all 0.15s;
  }
  .page-btn:hover:not(:disabled) { border-color: ${T.borderHover}; color: ${T.text}; }
  .page-btn.active { background: ${T.accent}; color: #0A0A0B; border-color: ${T.accent}; }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* CONSENT BANNER */
  .consent-banner-overlay {
    position: fixed; inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.8);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .consent-banner-modal {
    background: ${T.card};
    border: 1px solid ${T.border};
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    padding: 24px;
  }
  .consent-banner-content {
    display: flex; flex-direction: column;
  }

  /* PRIVACY POLICY */
  .privacy-policy-overlay {
    position: fixed; inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.8);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .privacy-policy-modal {
    background: ${T.card};
    border: 1px solid ${T.border};
    border-radius: 16px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 32px;
  }
  .privacy-policy-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .privacy-policy-title {
    font-size: 24px; font-weight: 700;
    color: ${T.text};
  }
  .privacy-policy-close {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    color: ${T.muted};
    font-size: 24px;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent; border: none;
  }
  .privacy-policy-close:hover {
    color: ${T.text};
    background: ${T.border};
  }
  .privacy-policy-content {
    display: flex; flex-direction: column;
    gap: 24px;
    color: ${T.muted};
    font-size: 14px;
    line-height: 1.6;
  }
  .privacy-policy-heading {
    font-weight: 600;
    color: ${T.text};
    margin-bottom: 8px;
  }

  .text-muted { color: ${T.muted}; }
  .text-text { color: ${T.text}; }
  .text-accent { color: ${T.accent}; }
  .focus-ring-accent { outline: 2px solid ${T.accent}; outline-offset: 2px; }

  /* API KEY MODAL */
  .api-key-overlay {
    position: fixed; inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.8);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .api-key-modal {
    background: ${T.card};
    border: 1px solid ${T.border};
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    padding: 32px;
  }
  .api-key-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .api-key-title {
    font-size: 20px; font-weight: 700;
    color: ${T.text};
  }
  .api-key-close {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    color: ${T.muted};
    font-size: 24px;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent; border: none;
  }
  .api-key-close:hover {
    color: ${T.text};
    background: ${T.border};
  }
  .api-key-content {
    display: flex; flex-direction: column;
    gap: 16px;
  }
  .api-key-description {
    color: ${T.muted};
    font-size: 14px;
    line-height: 1.6;
  }
  .api-key-info {
    color: ${T.muted};
    font-size: 13px;
  }
  .api-key-link {
    color: ${T.accent};
    text-decoration: none;
  }
  .api-key-link:hover {
    text-decoration: underline;
  }
  .api-key-warning {
    color: ${T.muted};
    font-size: 13px;
  }
  .api-key-form {
    display: flex; flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }
  .api-key-input-group {
    display: flex; flex-direction: column;
    gap: 8px;
  }
  .api-key-input {
    width: 100%;
    padding: 12px 16px;
    background: ${T.bg};
    border: 1px solid ${T.border};
    border-radius: 8px;
    color: ${T.text};
    font-size: 14px;
    font-family: 'DM Mono', monospace;
    transition: border-color 0.15s;
  }
  .api-key-input:focus {
    outline: none;
    border-color: ${T.accent};
  }
  .api-key-input::placeholder {
    color: ${T.muted};
  }
  .api-key-error {
    color: ${T.red};
    font-size: 12px;
  }
  .api-key-actions {
    display: flex; gap: 12px;
    justify-content: flex-end;
  }
  .chat-panel.open { transform: translateX(0); }
  .chat-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid ${T.border};
    background: ${T.card};
  }
  .chat-title { font-weight: 600; font-size: 16px; }
  .chat-model { font-size: 11px; color: ${T.muted}; margin-top: 4px; }
  .chat-close {
    width: 32px; height: 32px; border-radius: 8px;
    background: ${T.bg}; border: 1px solid ${T.border};
    color: ${T.muted}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; transition: all 0.15s;
  }
  .chat-close:hover { border-color: ${T.borderHover}; color: ${T.text}; }
  .chat-messages {
    flex: 1; overflow-y: auto;
    padding: 20px 24px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .chat-msg { display: flex; }
  .chat-msg.user { justify-content: flex-end; }
  .chat-msg.assistant { justify-content: flex-start; }
  .chat-bubble {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px; line-height: 1.5;
  }
  .chat-msg.user .chat-bubble {
    background: ${T.accent}; color: #0A0A0B;
    border-bottom-right-radius: 4px;
  }
  .chat-msg.assistant .chat-bubble {
    background: ${T.card}; border: 1px solid ${T.border};
    border-bottom-left-radius: 4px;
  }
  .chat-typing { display: flex; gap: 4px; }
  .chat-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: ${T.muted}; animation: chatBounce 1.4s ease-in-out infinite;
  }
  .chat-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes chatBounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-8px); }
  }
  .chat-suggestions {
    display: flex; flex-wrap: wrap; gap: 8px;
    padding: 12px 24px; border-top: 1px solid ${T.border};
    background: ${T.card};
  }
  .chat-sugg {
    padding: 8px 12px; border-radius: 20px;
    background: ${T.bg}; border: 1px solid ${T.border};
    color: ${T.muted}; font-size: 12px; cursor: pointer;
    transition: all 0.15s;
  }
  .chat-sugg:hover { border-color: ${T.borderHover}; color: ${T.text}; }
  .chat-input-row {
    display: flex; gap: 8px;
    padding: 16px 24px; border-top: 1px solid ${T.border};
    background: ${T.card};
  }
  .chat-input {
    flex: 1;
    background: ${T.bg}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 13px; outline: none;
    resize: none; font-family: 'DM Sans', sans-serif;
  }
  .chat-input:focus { border-color: ${T.accent}; }
  .chat-send {
    width: 36px; height: 36px; border-radius: 8px;
    background: ${T.accent}; border: none;
    color: #0A0A0B; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.15s;
  }
  .chat-send:hover:not(:disabled) { background: ${T.accentHover}; }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
  .chat-fab {
    position: fixed; bottom: 24px; right: 24px;
    width: 56px; height: 56px; border-radius: 16px;
    background: ${T.accent}; border: none;
    color: #0A0A0B; font-size: 20px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(232,197,71,0.3);
    transition: all 0.2s ease; z-index: 1000;
  }
  .chat-fab:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(232,197,71,0.4); }

  /* TRANSACTION TABLE */
  .txn-section { margin-bottom: 24px; }
  .txn-filters {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 16px; align-items: center;
  }
  .txn-search {
    flex: 1; min-width: 200px;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 13px; outline: none;
  }
  .txn-search:focus { border-color: ${T.accent}; }
  .filter-select {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 10px 14px;
    color: ${T.text}; font-size: 13px; outline: none; cursor: pointer;
  }
  .view-toggle {
    display: flex; gap: 4px;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 8px; padding: 2px;
  }
  .view-btn {
    width: 32px; height: 32px; border-radius: 6px;
    background: transparent; border: none; color: ${T.muted};
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .view-btn.active { background: ${T.card}; color: ${T.text}; }
  .view-btn:hover { color: ${T.text}; }
  .txn-table-wrap {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 14px; overflow: hidden;
  }
  .txn-table {
    width: 100%; border-collapse: collapse;
    font-size: 12px;
  }
  .txn-table th {
    background: ${T.surface}; border-bottom: 1px solid ${T.border};
    padding: 12px 16px; text-align: left;
    font-weight: 600; color: ${T.muted}; font-size: 11px;
    cursor: pointer; user-select: none;
  }
  .txn-table th:hover { color: ${T.text}; }
  .txn-table td {
    border-bottom: 1px solid ${T.border};
    padding: 12px 16px;
  }
  .txn-table tr:last-child td { border-bottom: none; }
  .txn-table tr:hover { background: rgba(255,255,255,0.02); }
  .txn-date {
    font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.muted};
  }
  .txn-name { font-weight: 500; }
  .txn-mode {
    font-family: 'DM Mono', monospace; font-size: 11px;
    background: ${T.surface}; padding: 4px 8px; border-radius: 4px;
    color: ${T.muted};
  }
  .txn-amount {
    font-family: 'DM Mono', monospace; font-weight: 500;
  }
  .txn-amount.credit { color: ${T.green}; }
  .txn-amount.debit { color: ${T.red}; }
  .txn-balance {
    font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.muted};
  }
  
  /* Transaction Grid View */
  .txn-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  .txn-card {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 16px;
    transition: border-color 0.15s;
  }
  .txn-card:hover { border-color: ${T.borderHover}; }
  .txn-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .txn-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid ${T.border};
  }
  
  /* Pagination */
  .pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-top: 1px solid ${T.border};
    background: ${T.surface};
  }
  .page-btns { display: flex; gap: 4px; }
  .page-btn {
    width: 28px; height: 28px; border-radius: 6px;
    background: ${T.card}; border: 1px solid ${T.border};
    color: ${T.muted}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; transition: all 0.15s;
  }
  .page-btn:hover:not(:disabled) { border-color: ${T.borderHover}; color: ${T.text}; }
  .page-btn.active { background: ${T.accent}; color: #0A0A0B; border-color: ${T.accent}; }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* CHAT PANEL */
  .chat-panel {
    position: fixed; right: 0; top: 60px; bottom: 0;
    width: 380px;
    background: ${T.surface};
    border-left: 1px solid ${T.border};
    display: flex; flex-direction: column;
    z-index: 50;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .chat-panel.open { transform: translateX(0); }
  
  /* Mobile responsive chat panel */
  @media (max-width: 400px) {
    .chat-panel {
      width: 100%;
      top: 0;
    }
  }
  .chat-header {
    padding: 16px 20px;
    border-bottom: 1px solid ${T.border};
    display: flex; align-items: center; justify-content: space-between;
  }
  .chat-title { font-size: 14px; font-weight: 600; }
  .chat-model { font-size: 11px; color: ${T.muted}; margin-top: 1px; }
  .chat-close { background: none; border: none; color: ${T.muted}; font-size: 20px; cursor: pointer; padding: 4px; }
  .chat-close:hover { color: ${T.text}; }
  .chat-messages {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
    scroll-behavior: smooth;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
  .chat-msg { max-width: 100%; }
  .chat-msg.user { align-self: flex-end; }
  .chat-msg.assistant { align-self: flex-start; }
  .chat-bubble {
    padding: 10px 14px; border-radius: 12px;
    font-size: 13px; line-height: 1.6;
    max-width: 300px;
  }
  .chat-msg.user .chat-bubble {
    background: ${T.accent}; color: #0A0A0B;
    border-radius: 12px 12px 2px 12px;
  }
  .chat-msg.assistant .chat-bubble {
    background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 12px 12px 12px 2px; color: ${T.text};
  }
  .chat-bubble strong { font-weight: 600; }
  .chat-bubble p { margin-bottom: 6px; }
  .chat-bubble p:last-child { margin-bottom: 0; }
  .chat-typing { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
  .chat-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.muted}; animation: blink 1.2s infinite; }
  .chat-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
  .chat-suggestions {
    padding: 8px 16px;
    display: flex; flex-wrap: wrap; gap: 6px;
    border-top: 1px solid ${T.border};
  }
  .chat-sugg {
    font-size: 12px; padding: 5px 10px;
    background: transparent; border: 1px solid ${T.border};
    border-radius: 20px; color: ${T.muted}; cursor: pointer;
    transition: all 0.15s; white-space: nowrap;
  }
  .chat-sugg:hover { border-color: ${T.accent}; color: ${T.accent}; }
  .chat-input-row {
    padding: 12px 16px; border-top: 1px solid ${T.border};
    display: flex; gap: 8px; align-items: flex-end;
  }
  .chat-input {
    flex: 1; background: ${T.card}; border: 1px solid ${T.border};
    border-radius: 10px; padding: 10px 12px;
    color: ${T.text}; font-family: 'DM Sans', sans-serif;
    font-size: 13px; outline: none; resize: none;
    max-height: 100px; overflow-y: auto;
    transition: border-color 0.15s;
  }
  .chat-input:focus { border-color: ${T.accent}; }
  .chat-send {
    width: 36px; height: 36px; border-radius: 9px;
    background: ${T.accent}; border: none; color: #0A0A0B;
    font-size: 16px; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .chat-send:hover { background: ${T.accentHover}; transform: scale(1.05); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* CHAT FAB */
  .chat-fab {
    position: fixed; bottom: 28px; right: 28px;
    background: ${T.accent}; color: #0A0A0B;
    border: none; border-radius: 14px;
    padding: 12px 20px; font-weight: 600; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 32px rgba(232,197,71,0.3);
    transition: all 0.2s ease; z-index: 49;
  }
  .chat-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(232,197,71,0.4); }

  /* WARNINGS / SCHEMA */
  .warn-banner {
    background: rgba(251,146,60,0.08); border: 1px solid rgba(251,146,60,0.2);
    border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
    font-size: 13px; color: #FB923C;
  }
  .schema-badge {
    background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.15);
    border-radius: 8px; padding: 8px 14px; margin-bottom: 16px;
    font-size: 12px; color: ${T.blue}; font-family: 'DM Mono', monospace;
  }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .dashboard { padding: 20px 16px; }
    .charts-row, .charts-row.three { grid-template-columns: 1fr; }
    .chat-panel { width: 100%; }
    .dashboard-actions { flex-wrap: wrap; }
  }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.5s ease forwards;
  }
  .fade-up-1 { animation-delay: 0.1s; }
  .fade-up-2 { animation-delay: 0.2s; }
  .fade-up-3 { animation-delay: 0.3s; }
  .fade-up-4 { animation-delay: 0.4s; }
  .fade-up-5 { animation-delay: 0.5s; }
`;
