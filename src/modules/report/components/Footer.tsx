// ─────────────────────────────────────────────────────────────────────────────
// Footer — Application footer with privacy policy and disclaimer
// ─────────────────────────────────────────────────────────────────────────────
import { styles } from "../../../styles/theme";

interface FooterProps {
  onPrivacyClick?: () => void;
}

export function Footer({ onPrivacyClick }: FooterProps) {
  return (
    <>
      <style>{styles}</style>
      <footer className="ds-footer">
        <div className="ds-footer-content">
          <div className="ds-footer-section">
            <div className="ds-footer-logo">Data<span>sutram</span></div>
            <p className="ds-footer-tagline">Bank Statement Analyser</p>
          </div>
          <div className="ds-footer-section">
            <button className="ds-footer-link" onClick={onPrivacyClick}>Privacy Policy</button>
          </div>
        
        </div>
        <div className="ds-footer-bottom">
          <p className="ds-footer-disclaimer">
            ⚠️ Disclaimer: This tool processes your financial data locally in your browser. 
            No data is sent to external servers except for AI chat features which require your API key. 
            Always verify your financial statements independently.
          </p>
          <p className="ds-footer-copyright">
            © 2026 Datasutram. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
