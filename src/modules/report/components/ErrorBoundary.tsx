// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary — Catches React rendering errors and provides fallback UI
// ─────────────────────────────────────────────────────────────────────────────
import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any): void {
    this.setState({ errorInfo });
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback">
          <style>{`
            .error-boundary-fallback {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
              text-align: center;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .error-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            .error-title {
              font-size: 24px;
              font-weight: 600;
              color: #e74c3c;
              margin-bottom: 10px;
            }
            .error-message {
              font-size: 16px;
              color: #555;
              margin-bottom: 20px;
              max-width: 500px;
            }
            .error-details {
              font-size: 12px;
              color: #888;
              background: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 20px;
              max-width: 500px;
              overflow-x: auto;
              text-align: left;
            }
            .retry-button {
              padding: 12px 24px;
              background: #E8C547;
              color: #0A0A0B;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            }
            .retry-button:hover {
              background: #F2D060;
            }
          `}</style>
          <div className="error-icon">⚠️</div>
          <div className="error-title">Something went wrong</div>
          <div className="error-message">
            The application encountered an unexpected error. Please try refreshing the page.
          </div>
          <button className="retry-button" onClick={this.handleReset}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
