// ─────────────────────────────────────────────────────────────────────────────
// State Management - Central in-memory state for the application
// ─────────────────────────────────────────────────────────────────────────────
import { Transaction, ColumnMap } from '../parser/StatementParser';
import { SummaryAnalytics, computeSummary } from '../report/analytics';

export type Phase = "upload" | "progress" | "report" | "error";

export interface ProgressState {
  pct: number;
  label: string;
}

export interface ErrorState {
  message: string;
  retryable: boolean;
  retryCount: number;
}

export interface AppState {
  phase: Phase;
  progress: ProgressState;
  fileName: string;
  errorState: ErrorState;
  txns: Transaction[];
  summary: SummaryAnalytics | null;
  parseMap: ColumnMap | null;
  parseWarnings: string[];
  showPrivacy: boolean;
  showConsent: boolean;
  isRetrying: boolean;
  abortController: AbortController | null;
}

// Initial state
export const initialState: AppState = {
  phase: "upload",
  progress: { pct: 0, label: "" },
  fileName: "",
  errorState: { message: "", retryable: false, retryCount: 0 },
  txns: [],
  summary: null,
  parseMap: null,
  parseWarnings: [],
  showPrivacy: false,
  showConsent: false,
  isRetrying: false,
  abortController: null,
};

// Simple state store (can be enhanced with Redux/Zustand later)
class Store {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor() {
    this.state = initialState;
  }

  getState(): AppState {
    return this.state;
  }

  setState(partialState: Partial<AppState>): void {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Convenience methods
  setPhase(phase: Phase): void {
    this.setState({ phase });
  }

  setProgress(pct: number, label: string): void {
    this.setState({ progress: { pct, label } });
  }

  setError(message: string, retryable: boolean, retryCount: number): void {
    this.setState({ errorState: { message, retryable, retryCount } });
  }

  clearError(): void {
    this.setState({ errorState: initialState.errorState });
  }

  setTransactions(txns: Transaction[]): void {
    this.setState({ txns, summary: computeSummary(txns) });
  }

  reset(): void {
    this.state = initialState;
    this.notify();
  }
}

export const store = new Store();
