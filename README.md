#  · Bank Statement Analyser


A premium, privacy-first Indian bank statement analyser. Upload any PDF or CSV — it works with any column naming convention.

## Features

- **Universal Parser** — 3-tier detection: alias map → heuristic sniff → LLM column mapper
- **Auto-Categorisation** — Rule engine (12 categories) with deterministic keyword/regex rules
- **Charts** — Monthly cash flow bar, spend-by-category donut, balance trajectory line, top merchants with sparklines, daily spending heatmap, stacked area chart
- **AI Chat** — Grounded Q&A via OpenRouter / gemini-flash-1.5
- **Export** — Download normalised CSV (with formula injection protection), PDF, and Excel
- **Responsive Design** — Mobile-optimized layout with responsive chat panel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploying to Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Framework preset: **Vite**
4. Deploy — done

## Project Structure

```
src/
  main.tsx                   # React entry point
  app.tsx                    # App shell / router
  modules/
    upload/
      UploadView.tsx        # Drag-drop PDF upload UI
      validator.ts         # File type, size, page-count guards
      kaggleDataset.ts     # Demo dataset
    parser/
      PdfExtractor.ts      # pdf.js text extraction
      StatementParser.ts   # Heuristic row detection + normalisation
      normalise.ts         # Date/amount/DrCr normalisers
    categoriser/
      RuleEngine.ts        # Deterministic keyword/regex rules
    report/
      ReportView.tsx       # KPIs + charts + transaction table
      analytics.ts         # computeSummary
      format.ts            # fmt, fmtShort, esc, exportCSV/PDF/XLS
      charts/
        Charts.tsx         # All chart components
      TransactionTable.tsx # Sortable, filterable table
      CatPill.tsx          # Category badge
      components/
        PrivacyPolicy.tsx
        ConsentBanner.tsx
        Footer.tsx
        ErrorBoundary.tsx
    chat/
      ChatView.tsx         # Chat panel UI
      Glossary.tsx         # Bank statement terms
  styles/
    theme.css              # Design tokens + global CSS
    base.css               # Reset + base element styles
    components.css         # Buttons, cards, table, chat bubble styles
```

## Security

- XSS: all user strings pass through `esc()` before `innerHTML`
- Prompt injection: system prompt built from structured summary, not raw CSV
- CSV formula injection: values starting with `=`, `+`, `-`, or `@` are sanitized with tab prefix to prevent Excel injection
- API key in `sessionStorage` only (cleared on tab close)
- 5 MB file cap enforced before reading
- Chat history capped at 40 messages

## Performance

- Async computation for large datasets (10K+ rows) using setTimeout to yield UI thread control
- Optimized CSV export with sanitization to prevent formula injection
- Responsive chat panel adapts to mobile screens (≤400px width)
