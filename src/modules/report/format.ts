// ─────────────────────────────────────────────────────────────────────────────
// Format Utilities
// ─────────────────────────────────────────────────────────────────────────────
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export function fmtShort(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) < 1000) return value.toFixed(0);
  if (Math.abs(value) < 100000) return (value / 1000).toFixed(1) + "K";
  if (Math.abs(value) < 10000000) return (value / 100000).toFixed(1) + "L";
  return (value / 10000000).toFixed(1) + "Cr";
}

export function fmt(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function exportNormalisedCSV(txns: any[]): void {
  const headers = ["date", "drcr", "amount", "balance", "mode", "name", "cat", "cls"];
  const csvContent = [
    headers.join(","),
    ...txns.map(t => headers.map(h => JSON.stringify(t[h] ?? "")).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `bank-statement-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

export function exportNormalisedJSON(txns: any[], summary?: any, fileName?: string): void {
  const data = {
    metadata: {
      exportedAt: new Date().toISOString(),
      fileName: fileName || "unknown",
      transactionCount: txns.length,
    },
    summary: summary || null,
    transactions: txns,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `bank-statement-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
}

export function clearAllData(): void {
  sessionStorage.clear();
  localStorage.removeItem("_ds_consent");
  localStorage.removeItem("_ds_consent_date");
  localStorage.removeItem("_ds_or_key");
  console.log("All data cleared from browser storage");
}

export function exportNormalisedPDF(
  txns: any[],
  summary?: any,
  chartStates?: {
    cashFlowSortBy?: string;
    cashFlowSortOrder?: string;
    categorySortBy?: string;
    categorySortOrder?: string;
    balanceShowAll?: boolean;
    transactionSortCol?: string;
    transactionSortDir?: number;
    transactionFilters?: {
      mode?: string;
      drcr?: string;
      category?: string;
    };
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Title section
  doc.setFillColor(232, 197, 71);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Statement Analysis", 14, 25);
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);
  doc.text(`Total Transactions: ${txns.length}`, 14, 54);
  
  // Calculate summary
  const totalCredits = txns.filter(t => !t.isDebit).reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = txns.filter(t => t.isDebit).reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalCredits - totalDebits;
  const avgMonthlyOut = totalDebits / Math.max(1, Object.keys(summary?.monthly || {}).length);
  
  doc.text(`Total Credits: ₹${totalCredits.toLocaleString("en-IN")}`, 14, 60);
  doc.text(`Total Debits: ₹${totalDebits.toLocaleString("en-IN")}`, 14, 66);
  doc.text(`Net Savings: ₹${netSavings.toLocaleString("en-IN")} ${netSavings >= 0 ? "(Surplus)" : "(Deficit)"}`, 14, 72);
  doc.text(`Closing Balance: ₹${summary?.closeBal?.toLocaleString("en-IN") || "—"}`, 14, 78);
  doc.text(`Avg Monthly Outflow: ₹${Math.round(avgMonthlyOut).toLocaleString("en-IN")}`, 14, 84);
  
  // Chart Settings Section
  doc.setFillColor(35, 35, 38);
  doc.rect(14, 88, pageWidth - 28, 8, "F");
  doc.setTextColor(240, 237, 232);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Chart & Filter Settings", 14, 94);
  
  doc.setTextColor(240, 237, 232);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  const settingsY = 100;
  const settingsX = 14;
  const col1X = 14;
  const col2X = 80;
  const col3X = 130;
  
  doc.text(`Cash Flow: Sort by ${chartStates?.cashFlowSortBy || "month"}, ${chartStates?.cashFlowSortOrder || "asc"}`, col1X, settingsY);
  doc.text(`Category: Sort by ${chartStates?.categorySortBy || "value"}, ${chartStates?.categorySortOrder || "desc"}`, col1X, settingsY + 6);
  doc.text(`Balance: View ${chartStates?.balanceShowAll ? "All" : "12m"}`, col1X, settingsY + 12);
  
  if (chartStates?.transactionFilters) {
    const activeFilters = [];
    if (chartStates.transactionFilters.mode && chartStates.transactionFilters.mode !== "all") activeFilters.push(`Mode: ${chartStates.transactionFilters.mode}`);
    if (chartStates.transactionFilters.drcr && chartStates.transactionFilters.drcr !== "all") activeFilters.push(`Type: ${chartStates.transactionFilters.drcr}`);
    if (chartStates.transactionFilters.category && chartStates.transactionFilters.category !== "all") activeFilters.push(`Cat: ${chartStates.transactionFilters.category}`);
    
    doc.text(`Table Filters: ${activeFilters.length > 0 ? activeFilters.join(", ") : "None"}`, col2X, settingsY);
    doc.text(`Table Sort: ${chartStates.transactionSortCol || "date"}, ${chartStates.transactionSortDir === 1 ? "asc" : "desc"}`, col2X, settingsY + 6);
  }
  
  // Glossary Reference
  doc.text("Key Terms: Debit (money out), Credit (money in), Balance (available funds)", col3X, settingsY);
  
  // Table header
  doc.setFillColor(23, 23, 27);
  doc.rect(14, 110, pageWidth - 28, 10, "F");
  doc.setTextColor(240, 237, 232);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  
  const headers = ["Date", "Type", "Amount", "Balance", "Mode", "Name", "Category"];
  const startX = 14;
  const startY = 117;
  const colWidths = [22, 12, 22, 22, 22, 30, 22];
  
  headers.forEach((header, i) => {
    doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
  });
  
  // Table data
  let y = startY + 8;
  const maxRowY = pageHeight - 20;
  const rowHeight = 7;
  
  // Sort transactions if sort column provided
  const sortedTxns = [...txns];
  if (chartStates?.transactionSortCol) {
    sortedTxns.sort((a, b) => {
      const va = chartStates.transactionSortCol === "amount" ? a.amount : 
                chartStates.transactionSortCol === "balance" ? a.balance : 
                chartStates.transactionSortCol === "name" ? a.name : 
                chartStates.transactionSortCol === "category" ? a.cat : 
                chartStates.transactionSortCol === "mode" ? a.mode : a.date;
      const vb = chartStates.transactionSortCol === "amount" ? b.amount : 
                chartStates.transactionSortCol === "balance" ? b.balance : 
                chartStates.transactionSortCol === "name" ? b.name : 
                chartStates.transactionSortCol === "category" ? b.cat : 
                chartStates.transactionSortCol === "mode" ? b.mode : b.date;
      const dir = chartStates.transactionSortDir || 1;
      return va < vb ? -dir : va > vb ? dir : 0;
    });
  }
  
  sortedTxns.forEach((t, index) => {
    if (y > maxRowY) {
      doc.addPage();
      // Repeat header on new page
      doc.setFillColor(23, 23, 27);
      doc.rect(14, 15, pageWidth - 28, 10, "F");
      doc.setTextColor(240, 237, 232);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      headers.forEach((header, i) => {
        doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), 22);
      });
      y = 32;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(35, 35, 38);
      doc.rect(14, y - 4, pageWidth - 28, rowHeight, "F");
    }
    
    // Color code debits/credits
    const debitColor = 248;
    const creditColor = 74;
    const green = 222;
    const red = 113;
    const blue = 128;
    doc.setTextColor(t.isDebit ? debitColor : creditColor, t.isDebit ? red : green, blue);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    const rowData = [
      t.date,
      t.drcr,
      `${t.isDebit ? "-" : "+"}₹${t.amount.toLocaleString("en-IN")}`,
      t.balance ? `₹${Math.round(t.balance).toLocaleString("en-IN")}` : "—",
      t.mode,
      (t.name || "—").substring(0, 20),
      t.cat
    ];
    
    rowData.forEach((data, i) => {
      doc.text(String(data), startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
    });
    
    y += rowHeight;
  });
  
  // Footer with page numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(138, 138, 149);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }
  
  doc.save(`bank-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportNormalisedXLS(txns: any[]): void {
  const headers = ["Date", "Type", "Amount", "Balance", "Mode", "Name", "Category"];
  const data = [
    headers,
    ...txns.map(t => [
      t.date,
      t.drcr,
      t.isDebit ? -t.amount : t.amount,
      t.balance || 0,
      t.mode,
      t.name || "",
      t.cat
    ])
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws["!cols"] = [
    { wch: 12 },
    { wch: 8 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 15 }
  ];
  
  // Style the header row
  const headerRange = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
    if (!ws[address]) continue;
    const cell = ws[address];
    if (cell) {
      cell.s = {
        fill: { fgColor: { rgb: "17171A" } },
        font: { bold: true, color: { rgb: "F0EDE8" } }
      };
    }
  }
  
  // Color code debit rows
  for (let R = 1; R <= headerRange.e.r; ++R) {
    const typeAddress = XLSX.utils.encode_cell({ r: R, c: 1 });
    const amountAddress = XLSX.utils.encode_cell({ r: R, c: 2 });
    if (ws[typeAddress] && ws[typeAddress].v === "Db") {
      for (let C = 0; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[address]) {
          ws[address].s = {
            font: { color: { rgb: "F87171" } }
          };
        }
      }
    } else if (ws[typeAddress] && ws[typeAddress].v === "Cr") {
      for (let C = 0; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[address]) {
          ws[address].s = {
            font: { color: { rgb: "4ADE80" } }
          };
        }
      }
    }
  }
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bank Statement");
  XLSX.writeFile(wb, `bank-statement-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function esc(str: string): string {
  return str.replace(/["\\]/g, "\\$&");
}
