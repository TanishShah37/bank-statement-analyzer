import { useState, useEffect } from "react";
import { styles, T } from "../../../styles/theme";

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("_ds_consent");
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("_ds_consent", "true");
    localStorage.setItem("_ds_consent_date", new Date().toISOString());
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("_ds_consent", "false");
    setIsVisible(false);
  };

  const handlePrivacyPolicy = () => {
    window.dispatchEvent(new CustomEvent('open-privacy-policy'));
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{styles}</style>
      <div 
        className="consent-banner-overlay"
        role="dialog"
        aria-labelledby="consent-title"
        aria-describedby="consent-description"
      >
        <div className="consent-banner-modal">
          <div className="consent-banner-content">
            <div className="text-sm text-muted">
              <p className="mb-2">
                <strong id="consent-title" className="text-text">We use cookies and local storage</strong> to enhance your experience 
                and process your bank statement data locally in your browser.
              </p>
              <p id="consent-description" className="text-xs">
                By continuing to use this application, you agree to our{' '}
                <button 
                  onClick={handlePrivacyPolicy}
                  className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded"
                  aria-label="Open Privacy Policy"
                >
                  Privacy Policy
                </button>
                {' '}and data processing terms.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0 mt-4">
              <button 
                onClick={handleDecline}
                className="btn btn-ghost btn-sm"
                aria-label="Decline cookies"
              >
                Decline
              </button>
              <button 
                onClick={handleAccept}
                className="btn btn-accent btn-sm"
                aria-label="Accept cookies"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
