import { useState } from "react";
import { styles, T } from "../../../styles/theme";

export function PrivacyPolicy({ onClose }: { onClose?: () => void }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div 
        className="privacy-policy-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onKeyDown={handleKeyDown}
      >
        <div className="privacy-policy-modal">
          <div className="privacy-policy-header">
            <h2 id="privacy-title" className="privacy-policy-title">Privacy Policy</h2>
            {onClose && (
              <button 
                onClick={onClose}
                className="privacy-policy-close"
                aria-label="Close privacy policy"
              >
                ×
              </button>
            )}
          </div>

          <div className="privacy-policy-content">
            <section>
              <h3 className="privacy-policy-heading">Last Updated: May 2026</h3>
              <p>
                This Privacy Policy describes how Bank Statement Analyser ("we", "our", or "the Application") 
                collects, uses, and protects your personal information when you use our client-side application.
              </p>
            </section>

            <section>
              <h3 className="privacy-policy-heading">1. Information We Collect</h3>
              <p className="mb-2">We only collect information that you voluntarily provide:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Bank Statement Data:</strong> Financial transaction data you upload via CSV files</li>
                <li><strong>API Keys:</strong> OpenRouter API keys stored in your browser session only</li>
                <li><strong>Usage Data:</strong> No behavioral tracking or analytics are collected</li>
              </ul>
            </section>

            <section>
              <h3 className="privacy-policy-heading">2. How We Use Your Information</h3>
              <p>We use your information solely for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Analyzing your bank statement data to provide financial insights</li>
                <li>Generating charts, reports, and visualizations</li>
                <li>Providing AI-powered insights via OpenRouter API (if you choose to use chat features)</li>
              </ul>
              <p className="mt-2">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </section>

            <section>
              <h3 className="privacy-policy-heading">3. Data Storage & Retention</h3>
              <p className="mb-2">
                <strong>Client-Side Processing:</strong> All data processing occurs in your browser. 
                Your bank statement data is never sent to our servers.
              </p>
              <p className="mb-2">
                <strong>Session Storage:</strong> API keys and temporary data are stored in your browser's 
                session storage and are automatically cleared when you close your browser.
              </p>
              <p>
                <strong>No Server Storage:</strong> We do not store your data on our servers. You have complete 
                control over your data at all times.
              </p>
            </section>

            <section>
              <h3 className="privacy-policy-heading">4. Third-Party Services</h3>
              <p className="mb-2">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>OpenRouter API:</strong> For AI chat features. Your API key is stored locally and sent directly to OpenRouter.</li>
                <li><strong>Google Fonts:</strong> For typography. Loaded securely via HTTPS.</li>
                <li><strong>Vercel:</strong> For hosting our static application. Vercel does not access your data.</li>
              </ul>
            </section>

            <section>
              <h3 className="privacy-policy-heading">5. Your Rights Under GDPR</h3>
              <p className="mb-2">Under the General Data Protection Regulation (GDPR), you have the right to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Access:</strong> View all data stored in your browser</li>
                <li><strong>Rectification:</strong> Correct inaccurate data by re-uploading corrected files</li>
                <li><strong>Erasure:</strong> Delete all data from your browser at any time</li>
                <li><strong>Portability:</strong> Export your data in CSV, PDF, or JSON format</li>
                <li><strong>Object:</strong> Disable AI chat features at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="privacy-policy-heading">6. Your Rights Under CCPA</h3>
              <p className="mb-2">Under the California Consumer Privacy Act (CCPA), you have the right to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Know:</strong> Request information about data collection and usage</li>
                <li><strong>Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> We do not sell your personal information</li>
                <li><strong>Non-Discrimination:</strong> We do not discriminate based on privacy choices</li>
              </ul>
            </section>

            <section>
              <h3 className="privacy-policy-heading">7. Data Security</h3>
              <p className="mb-2">
                We implement reasonable security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Content Security Policy (CSP) to prevent script injection</li>
                <li>Security headers (X-Frame-Options, X-XSS-Protection, etc.)</li>
                <li>HTTPS encryption for all data in transit</li>
                <li>Input validation and sanitization</li>
                <li>No server-side data storage</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect 
                your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3 className="privacy-policy-heading">8. Children's Privacy</h3>
              <p>
                Our application is not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children. If you are a parent or guardian and believe your child has 
                provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h3 className="privacy-policy-heading">9. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h3 className="privacy-policy-heading">10. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy or your data rights, please contact us at:
              </p>
              <p className="mt-2 text-accent">
                Email: privacy@datasutram.com
              </p>
            </section>
          </div>

          {onClose && (
            <div className="mt-8 flex justify-end">
              <button 
                onClick={onClose}
                className="btn btn-accent btn-sm"
              >
                I Understand
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
