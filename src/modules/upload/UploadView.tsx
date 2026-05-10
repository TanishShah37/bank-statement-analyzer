// ─────────────────────────────────────────────────────────────────────────────
// Screen Components — UploadScreen, ProgressScreen, ErrorScreen
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from "react";
import { styles, T } from "../../styles/theme";

interface UploadScreenProps {
  onFile: (file: File) => void;
  onDemo: () => void;
}

export function UploadScreen({ onFile, onDemo }: UploadScreenProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <style>{styles}</style>
      <div className="upload-screen">
        <div className="upload-inner">
          <div className="upload-headline fade-up">
            Read your money.<br/><em>Actually.</em>
          </div>
          <div className="upload-sub fade-up fade-up-1">
            Upload any Indian bank statement — PDF or CSV, any bank, any format. Automatic categorisation and AI-powered Q&amp;A.
          </div>

          <div
            className={`drop-zone${dragOver ? " drag-over" : ""} fade-up fade-up-2`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <div className="drop-icon">📄</div>
            <div className="drop-title">Drop your bank statement here</div>
            <div className="drop-sub">or click to browse · <strong>.pdf</strong> or <strong>.csv</strong> · max 5 MB</div>
            <input
              ref={fileRef} className="drop-input" type="file"
              accept=".pdf,.csv,.txt,.tsv"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
            />
          </div>

          <div className="divider-row fade-up fade-up-3">or try the demo</div>

          <div className="demo-card fade-up fade-up-3" onClick={onDemo}>
            <div className="demo-card-icon">📊</div>
            <div className="demo-card-text">
              <div className="demo-card-label">Kaggle Demo Dataset</div>
              <div className="demo-card-sub">~95 transactions · Jan 2022 – Oct 2023 · SBI account</div>
            </div>
            <span style={{ color: T.muted, fontSize: 18 }}>→</span>
          </div>

          <div className="schema-hint fade-up fade-up-4">
            <strong>Universal parser</strong> — works with any CSV column names. Handles both schemas automatically:
            <div className="schema-cols">
              <span className="schema-col">date</span>
              <span className="schema-col">amount + DrCr</span>
              <span className="schema-col">debit / credit</span>
              <span className="schema-col">balance</span>
              <span className="schema-col">narration</span>
              <span className="schema-col">mode</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ProgressScreenProps {
  fileName: string;
  label: string;
  pct: number;
  onCancel?: () => void;
  isRetrying?: boolean;
}

export function ProgressScreen({ fileName, label, pct, onCancel, isRetrying }: ProgressScreenProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="progress-screen">
        <div className="progress-card">
          <div className="progress-pct">{pct}%</div>
          <div className="progress-file">{fileName}</div>
          <div className="progress-label">{label}</div>
          <div className="progress-bar-track">
            <div className={`progress-bar-fill${isRetrying ? ' retrying' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          {onCancel && (
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={onCancel}
              style={{ marginTop: '16px' }}
            >
              Cancel
            </button>
          )}
          {isRetrying && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
              Retrying with exponential backoff...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface ErrorScreenProps {
  message: string;
  onReset: () => void;
  onRetry?: () => void;
  retryCount?: number;
}

export function ErrorScreen({ message, onReset, onRetry, retryCount = 0 }: ErrorScreenProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="error-screen">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Could not process file</div>
          <div className="error-msg">{message}</div>
          <div className="error-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
            <button className="btn btn-accent" onClick={onReset}>Try another file</button>
            {onRetry && (
              <button className="btn btn-ghost" onClick={onRetry}>
                Retry {retryCount > 0 ? `(${retryCount}/3)` : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
