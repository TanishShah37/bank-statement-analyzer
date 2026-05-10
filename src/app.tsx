// ─────────────────────────────────────────────────────────────────────────────
// Datasutram Bank Statement Analyser
// Candidate: Tanish Shah · Interviewer: Aishik Pyne · May 2026
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { styles, T } from "./styles/theme";
import { parseUniversal, parseUniversalCSV, type ColumnMap } from "./modules/parser/StatementParser";
import { computeSummaryAsync, computeSummary, type Transaction, type SummaryAnalytics } from "./modules/report/analytics";
import { exportNormalisedCSV, exportNormalisedJSON, clearAllData } from "./modules/report/format";
import { validateFile } from "./modules/upload/validator";
import { DEMO_CSV } from "./modules/upload/kaggleDataset";
import { UploadScreen, ProgressScreen, ErrorScreen } from "./modules/upload/UploadView";
import { Dashboard } from "./modules/report/ReportView";
import { PrivacyPolicy } from "./modules/report/components/PrivacyPolicy";
import { ConsentBanner } from "./modules/report/components/ConsentBanner";
import { Footer } from "./modules/report/components/Footer";
import { ErrorBoundary } from "./modules/report/components/ErrorBoundary";

// ─── Load CDN dependencies ────────────────────────────────────────────────────
function loadExternalResources(): void {
  if (!document.getElementById("ds-fonts")) {
    const link = document.createElement("link");
    link.id = "ds-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
    // SRI would be added here for production: link.integrity = "sha256-..."
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
  if (!(window as any).Papa) {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
    s.crossOrigin = "anonymous";
    // SRI would be added here for production: s.integrity = "sha256-..."
    document.head.appendChild(s);
  }
  if (!(window as any).pdfjsLib) {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.crossOrigin = "anonymous";
    // SRI would be added here for production: s.integrity = "sha256-..."
    s.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    };
    document.head.appendChild(s);
  }
}

// ─── App Root ─────────────────────────────────────────────────────────────────
type Phase = "upload" | "progress" | "report" | "error";
interface ProgressState {
  pct: number;
  label: string;
}
interface ErrorState {
  message: string;
  retryable: boolean;
  retryCount: number;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [progress, setProgress] = useState<ProgressState>({ pct: 0, label: "" });
  const [fileName, setFileName] = useState("");
  const [errorState, setErrorState] = useState<ErrorState>({ message: "", retryable: false, retryCount: 0 });
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryAnalytics | null>(null);
  const [parseMap, setParseMap] = useState<ColumnMap | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const MAX_RETRIES = 3;

  useEffect(() => { 
    loadExternalResources(); 
    
    // Listen for privacy policy open event
    const handleOpenPrivacy = () => setShowPrivacy(true);
    window.addEventListener('open-privacy-policy', handleOpenPrivacy);
    
    return () => {
      window.removeEventListener('open-privacy-policy', handleOpenPrivacy);
    };
  }, []);

  const tick = () => new Promise(r => setTimeout(r, 40));

  // Error message mapper for user-friendly messages
  function getErrorMessage(error: any, retryCount: number): { message: string; retryable: boolean } {
    const msg = error?.message || String(error);
    
    if (msg.includes("429") || msg.includes("rate limit")) {
      return { 
        message: "AI service is busy (rate limited). Please wait a moment and retry.", 
        retryable: true 
      };
    }
    if (msg.includes("401") || msg.includes("403")) {
      return { 
        message: "Invalid API key. Please check your OpenRouter API key in settings.", 
        retryable: false 
      };
    }
    if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
      return { 
        message: "AI service is temporarily unavailable. Retrying...", 
        retryable: true 
      };
    }
    if (msg.includes("Network") || msg.includes("fetch")) {
      return { 
        message: "Connection failed. Please check your internet connection and retry.", 
        retryable: true 
      };
    }
    if (msg.includes("PapaParse") || msg.includes("CSV")) {
      return { 
        message: "Could not read CSV file. Please check the file format and try again.", 
        retryable: false 
      };
    }
    if (msg.includes("pdf.js") || msg.includes("PDF")) {
      return { 
        message: "Could not read PDF. Try exporting as text PDF or CSV from your bank portal.", 
        retryable: false 
      };
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return { 
        message: "Operation timed out. Please try again.", 
        retryable: true 
      };
    }
    if (msg.includes("validation")) {
      return { 
        message: "File validation failed. Please check the file and try again.", 
        retryable: false 
      };
    }
    
    // Default error
    return { 
      message: msg || "An unexpected error occurred.", 
      retryable: true 
    };
  }

  // Exponential backoff for retries
  function getBackoffDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 8000); // 1s, 2s, 4s, max 8s
  }

  async function handleFile(file: File, retryCount: number = 0): Promise<void> {
    // Create new AbortController for this operation
    const controller = new AbortController();
    setAbortController(controller);
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      const { message, retryable } = getErrorMessage({ message: validation.errors.join("; ") }, retryCount);
      setErrorState({ message, retryable, retryCount });
      setPhase("error");
      setAbortController(null);
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn("File validation warnings:", validation.warnings);
    }

    const fname = file.name.toLowerCase();
    if (!fname.endsWith(".pdf") && !fname.endsWith(".csv") && !fname.endsWith(".txt") && !fname.endsWith(".tsv")) {
      setErrorState({ message: "Please upload a .pdf, .csv, .tsv, or .txt bank statement.", retryable: false, retryCount });
      setPhase("error");
      setAbortController(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorState({ message: "File exceeds 10 MB limit. Please use a smaller file.", retryable: false, retryCount });
      setPhase("error");
      setAbortController(null);
      return;
    }
    setFileName(file.name);
    setPhase("progress");

    try {
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      setProgress({ pct: 15, label: fname.endsWith(".pdf") ? "Extracting PDF text…" : "Reading file…" });
      await tick();
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      setProgress({ pct: 40, label: "Auto-detecting column schema (3-tier)…" });
      await tick();
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      const { txns: rawTxns, map, warnings } = await parseUniversal(file);
      setParseMap(map);
      setParseWarnings(warnings);
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      setProgress({ pct: 90, label: "Computing analytics…" });
      await tick();
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      setTxns(rawTxns);
      const summary = await computeSummaryAsync(rawTxns);
      setSummary(summary);
      setPhase("report");
      setErrorState({ message: "", retryable: false, retryCount: 0 });
      setAbortController(null);
    } catch (e: any) {
      setAbortController(null);
      if (e.message === "Operation cancelled by user" || e.name === "AbortError") {
        setErrorState({ message: "Operation cancelled.", retryable: true, retryCount });
        setPhase("error");
        return;
      }

      const { message, retryable } = getErrorMessage(e, retryCount);
      
      // Only retry if the error is retryable and we haven't exceeded max retries
      if (retryable && retryCount < MAX_RETRIES) {
        setIsRetrying(true);
        setErrorState({ message: `${message} (Retry ${retryCount + 1}/${MAX_RETRIES})`, retryable, retryCount });
        setProgress({ pct: progress.pct, label: `Retrying in ${getBackoffDelay(retryCount) / 1000}s...` });
        
        await new Promise(resolve => setTimeout(resolve, getBackoffDelay(retryCount)));
        setIsRetrying(false);
        
        return handleFile(file, retryCount + 1);
      } else {
        const finalMessage = retryCount >= MAX_RETRIES 
          ? `${message} (Max retries exceeded)` 
          : message;
        setErrorState({ message: finalMessage, retryable: retryable && retryCount < MAX_RETRIES, retryCount });
        setPhase("error");
      }
    }
  }

  async function loadDemo(retryCount: number = 0): Promise<void> {
    // Create new AbortController for this operation
    const controller = new AbortController();
    setAbortController(controller);
    
    setFileName("demo-kaggle-dataset.csv");
    setPhase("progress");

    try {
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      setProgress({ pct: 30, label: "Loading demo transactions…" });
      await tick();
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      setProgress({ pct: 60, label: "Categorising…" });
      const { txns: rawTxns, map, warnings } = await parseUniversalCSV(DEMO_CSV);
      setParseMap(map);
      setParseWarnings(warnings);
      if (controller.signal.aborted) throw new Error("Operation cancelled by user");

      await tick();
      setProgress({ pct: 85, label: "Building report…" });

      setTxns(rawTxns);
      const summary = await computeSummaryAsync(rawTxns);
      setSummary(summary);
      setPhase("report");
      setErrorState({ message: "", retryable: false, retryCount: 0 });
      setAbortController(null);
    } catch (e: any) {
      setAbortController(null);
      if (e.message === "Operation cancelled by user" || e.name === "AbortError") {
        setErrorState({ message: "Operation cancelled.", retryable: true, retryCount });
        setPhase("error");
        return;
      }

      const { message, retryable } = getErrorMessage(e, retryCount);
      
      if (retryable && retryCount < MAX_RETRIES) {
        setIsRetrying(true);
        setErrorState({ message: `${message} (Retry ${retryCount + 1}/${MAX_RETRIES})`, retryable, retryCount });
        setProgress({ pct: progress.pct, label: `Retrying in ${getBackoffDelay(retryCount) / 1000}s...` });
        
        await new Promise(resolve => setTimeout(resolve, getBackoffDelay(retryCount)));
        setIsRetrying(false);
        
        return loadDemo(retryCount + 1);
      } else {
        const finalMessage = retryCount >= MAX_RETRIES 
          ? `${message} (Max retries exceeded)` 
          : message;
        setErrorState({ message: finalMessage, retryable: retryable && retryCount < MAX_RETRIES, retryCount });
        setPhase("error");
      }
    }
  }

  function reset(): void {
    // Abort any ongoing operation
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setPhase("upload");
    setTxns([]);
    setSummary(null);
    setParseMap(null);
    setParseWarnings([]);
    setFileName("");
    setErrorState({ message: "", retryable: false, retryCount: 0 });
    setIsRetrying(false);
  }

  function handleExportJSON(): void {
    exportNormalisedJSON(txns, summary, fileName);
  }

  function handleDeleteData(): void {
    if (confirm("Are you sure you want to delete all data? This will clear all transactions, API keys, and settings from your browser. This action cannot be undone.")) {
      clearAllData();
      reset();
    }
  }

  function goBack(): void {
    setPhase("upload");
  }

  function handleRetry(): void {
    if (fileName === "demo-kaggle-dataset.csv") {
      loadDemo();
    } else {
      // For file uploads, we need to re-trigger the file input
      // This is handled by the user clicking the file input again
      reset();
    }
  }

  function handleCancel(): void {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setPhase("upload");
      setErrorState({ message: "", retryable: false, retryCount: 0 });
      setProgress({ pct: 0, label: "" });
    }
  }

  return (
    <ErrorBoundary>
      <div className="ds-app">
        <style>{styles}</style>
        <header className="ds-header">
          <button className="ds-logo" onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Data<span>sutram</span></button>
          <div className="ds-header-actions">
            {phase === "report" && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => exportNormalisedCSV(txns)}>⬇ Export</button>
                <button className="btn btn-ghost btn-sm" onClick={reset}>↩ New File</button>
              </>
            )}
          </div>
        </header>

        {phase === "upload" && <UploadScreen onFile={(f) => handleFile(f, 0)} onDemo={() => loadDemo(0)} />}
        {phase === "progress" && (
          <ProgressScreen 
            fileName={fileName} 
            label={progress.label} 
            pct={progress.pct} 
            onCancel={handleCancel}
            isRetrying={isRetrying}
          />
        )}
        {phase === "error" && (
          <ErrorScreen 
            message={errorState.message} 
            onReset={reset}
            onRetry={errorState.retryable ? handleRetry : undefined}
            retryCount={errorState.retryCount}
          />
        )}
        {phase === "report" && summary && (
          <Dashboard
            txns={txns}
            summary={summary}
            fileName={fileName}
            parseMap={parseMap}
            parseWarnings={parseWarnings}
            onReset={reset}
            onBack={goBack}
          />
        )}
        
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
        <ConsentBanner />
        <Footer onPrivacyClick={() => setShowPrivacy(true)} />
      </div>
    </ErrorBoundary>
  );
}
