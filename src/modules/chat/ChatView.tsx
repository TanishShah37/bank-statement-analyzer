// ─────────────────────────────────────────────────────────────────────────────
// ChatPanel — AI Analyst sidebar (OpenRouter / gemini-flash-1.5)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { esc } from "../report/format";
import { styles, T } from "../../styles/theme";
import type { Transaction, SummaryAnalytics } from "../report/analytics";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
  timestamp?: number;
  canRetry?: boolean;
  retryAfter?: number;
}

interface ChatPanelProps {
  txns: Transaction[];
  summary: SummaryAnalytics;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: string, params: any) => void;
}

function ApiKeyModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) {
      setError("Please enter an API key");
      return;
    }
    if (key.length < 10 || !/^[a-zA-Z0-9_-]+$/.test(key)) {
      setError("Invalid API key format. Please enter a valid OpenRouter API key.");
      return;
    }
    onSubmit(key);
    setKey("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="api-key-overlay" role="dialog" aria-modal="true" aria-labelledby="api-key-title">
        <div className="api-key-modal">
          <div className="api-key-header">
            <h2 id="api-key-title" className="api-key-title">Enter API Key</h2>
            <button onClick={onClose} className="api-key-close" aria-label="Close">×</button>
          </div>
          <div className="api-key-content">
            <p className="api-key-description">
              Enter your OpenRouter API key to enable AI chat features.
            </p>
            <p className="api-key-info">
              Get one free at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="api-key-link">openrouter.ai</a>
            </p>
            <p className="api-key-warning">
              ⚠️ Your key is stored in browser session only.
            </p>
            <form onSubmit={handleSubmit} className="api-key-form">
              <div className="api-key-input-group">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your OpenRouter API key"
                  className="api-key-input"
                  autoFocus
                />
                {error && <p className="api-key-error">{error}</p>}
              </div>
              <div className="api-key-actions">
                <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent btn-sm">
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function buildSystemPrompt(txns: Transaction[], summary: SummaryAnalytics): string {
  const totalTxns = txns.length;
  const dateRange = totalTxns > 0 
    ? `${txns[0].date} to ${txns[totalTxns - 1].date}` 
    : "no data";

  return `You are a financial data analyst assistant for the Bank Statement Analyser application. 
Your role is to help users understand their transaction data and perform specific actions within the app.

**STRICT GUARDRAILS - You MUST follow these rules:**

1. **Scope Limitation**: ONLY discuss the bank statement data provided. Do NOT:
   - Provide financial advice or investment recommendations
   - Discuss external financial products or services
   - Make predictions about future financial performance
   - Discuss topics unrelated to the provided transaction data

2. **App Features Only**: You can ONLY perform these specific actions:
   - Sort transactions by date, amount, category, or mode
   - Filter transactions by category, mode (debit/credit), or date range
   - Toggle balance view (show all vs filtered)
   - Export data (CSV, JSON, PDF)
   - Open the glossary for term definitions

3. **Action Format**: When you need to perform an action, use this EXACT format:
   ACTION:action_name{"param": "value"}
   
   Available actions:
   - sort_transactions{"column": "date|amount|category|mode", "order": "asc|desc"}
   - filter_transactions{"category": "category_name", "mode": "debit|credit", "dateRange": "start_date,end_date"}
   - sort_cashflow{"sortBy": "amount|count", "sortOrder": "asc|desc"}
   - sort_category{"sortBy": "amount|count", "sortOrder": "asc|desc"}
   - toggle_balance_view{"showAll": true|false}
   - export_data{"format": "csv|json|pdf"}
   - open_glossary{}

4. **No External Commands**: Do NOT suggest or execute any commands outside the defined actions.

5. **Data Context**: 
   - Total transactions: ${totalTxns}
   - Date range: ${dateRange}
   - Total credits: ${summary.totalIn}
   - Total debits: ${summary.totalOut}
   - Net savings: ${summary.savings}
   - Top spending category: ${Object.entries(summary.catTotals).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || "N/A"}

6. **Response Guidelines**:
   - Be concise and helpful
   - Focus on the provided data only
   - If asked about something outside scope, politely decline
   - Use the ACTION format to trigger UI changes

**Example responses:**
- User: "Show me the largest expenses"
- Assistant: I'll sort the transactions by amount in descending order to show the largest expenses first. ACTION:sort_transactions{"column": "amount", "order": "desc"}

- User: "How much did I spend on food?"
- Assistant: Based on the data, you spent ${Object.entries(summary.catTotals).find(([cat]) => cat.toLowerCase().includes("food"))?.[1].total || 0} on food transactions. Would you like me to filter to show only food transactions? ACTION:filter_transactions{"category": "Food"}

- User: "Give me investment advice"
- Assistant: I'm not able to provide investment advice. I can help you analyze your transaction data and identify spending patterns. Would you like me to show your spending by category instead?

Now, help the user with their bank statement analysis.`;
}

const SUGGESTIONS = [
  "What's my top expense category?",
  "Which month had highest spending?",
  "Summarise my income sources",
  "How much did I pay in EMI?",
  "List my recurring transactions",
  "Sort transactions by amount",
  "Filter to show only debits",
  "Export my data as PDF",
];

export function ChatPanel({ txns, summary, isOpen, onClose, onAction }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I've analysed your bank statement. Ask me anything about your transactions, spending patterns, or financial health."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Rate limiting state
  const [rateLimitRemaining, setRateLimitRemaining] = useState(10);
  const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const REQUESTS_PER_MINUTE = 10;
  const REQUEST_COOLDOWN_MS = 60000; // 1 minute

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Check rate limit
  function checkRateLimit(): { allowed: boolean; resetAfter?: number } {
    const now = Date.now();
    
    // Reset if cooldown period has passed
    if (rateLimitReset && now > rateLimitReset) {
      setRateLimitRemaining(REQUESTS_PER_MINUTE);
      setRateLimitReset(null);
      return { allowed: true };
    }

    // Check if we have requests remaining
    if (rateLimitRemaining > 0) {
      setRateLimitRemaining(prev => prev - 1);
      if (rateLimitRemaining === 1) {
        // This was the last request, set reset time
        setRateLimitReset(now + REQUEST_COOLDOWN_MS);
      }
      return { allowed: true };
    }

    // Rate limit exceeded
    if (rateLimitReset) {
      return { allowed: false, resetAfter: rateLimitReset };
    }

    // Shouldn't reach here, but handle gracefully
    setRateLimitReset(now + REQUEST_COOLDOWN_MS);
    return { allowed: false, resetAfter: now + REQUEST_COOLDOWN_MS };
  }

  // Throttle requests (minimum 1 second between requests)
  function checkThrottle(): boolean {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 1000) {
      return false;
    }
    setLastRequestTime(now);
    return true;
  }

  async function send(text?: string): Promise<void> {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    if (msg.length > 800) return;

    // Check throttle (minimum 1 second between requests)
    if (!checkThrottle()) {
      setMessages(h => [...h, { 
        role: "error", 
        content: "Please wait at least 1 second between requests.",
        timestamp: Date.now(),
        canRetry: true,
        retryAfter: Date.now() + 1000
      }]);
      return;
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetAfter || Date.now() + REQUEST_COOLDOWN_MS;
      const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
      const errorMessage = `⚠️ Rate Limit Reached

You've reached the maximum of ${REQUESTS_PER_MINUTE} requests per minute.

⏱️ Please wait ${waitSeconds} seconds before trying again.

💡 Tips to avoid rate limits:
• Ask multiple questions in a single message
• Be specific and detailed in your requests
• Use the suggested prompts below for quick answers`;
      setMessages(h => [...h, { 
        role: "error", 
        content: errorMessage,
        timestamp: Date.now(),
        canRetry: true,
        retryAfter: resetTime
      }]);
      return;
    }

    let key = sessionStorage.getItem("_ds_or_key") || "";
    if (!key) {
      setPendingMessage(msg);
      setShowApiKeyModal(true);
      return;
    }

    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    const history = [...messages, userMsg].slice(-40);
    setMessages(history);
    setLoading(true);

    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": location.origin,
          "X-Title": "Datasutram Bank Analyser"
        },
        body: JSON.stringify({
          model: "google/gemini-flash-1.5",
          max_tokens: 600,
          messages: [
            { role: "system", content: buildSystemPrompt(txns, summary) },
            ...history.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      });
      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, no response.";
      
      // Sanitize the response to prevent XSS using DOMPurify
      const sanitizedReply = DOMPurify.sanitize(reply, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
      });
      
      // Check for ACTION: commands in the response
      const actionMatch = sanitizedReply.match(/ACTION:\s*(\w+)\s*(\{.*\})?/);
      if (actionMatch) {
        const action = actionMatch[1];
        const params = actionMatch[2] ? JSON.parse(actionMatch[2]) : {};
        onAction?.(action, params);
        const cleanReply = sanitizedReply.replace(/ACTION:\s*(\w+)\s*(\{.*\})?/, "").trim();
        setMessages(h => [...h, { role: "assistant", content: cleanReply || `Action executed: ${action}` }]);
      } else {
        setMessages(h => [...h, { role: "assistant", content: sanitizedReply }]);
      }
    } catch (e: any) {
      setMessages(h => [...h, { 
        role: "error", 
        content: `Error: ${e.message}`,
        timestamp: Date.now(),
        canRetry: true
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleRetry(message: Message): void {
    // Remove the error message
    setMessages(h => h.filter(m => m !== message));
    // Retry the last user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    if (lastUserMessage) {
      send(lastUserMessage.content);
    }
  }

  const handleApiKeySubmit = (key: string) => {
    sessionStorage.setItem("_ds_or_key", key);
    setShowApiKeyModal(false);
    if (pendingMessage) {
      send(pendingMessage);
      setPendingMessage(null);
    }
  };

  const handleApiKeyCancel = () => {
    setShowApiKeyModal(false);
    setPendingMessage(null);
  };

  function renderMessage(m: Message, idx: number): React.ReactElement {
    const isUser = m.role === "user";
    const isError = m.role === "error";
    
    const canRetryNow = m.canRetry && m.retryAfter && Date.now() > m.retryAfter;

    return (
      <div key={idx} className={`chat-msg ${isUser ? "user" : isError ? "error" : "assistant"}`}>
        <div className="chat-bubble">
          <div className="text-sm whitespace-pre-wrap">{m.content}</div>
          {isError && m.canRetry && (
            <button
              onClick={() => handleRetry(m)}
              disabled={!canRetryNow}
              className={`mt-2 px-3 py-1 text-xs rounded ${
                canRetryNow ? "bg-[#E8C547] text-[#0A0A0B] hover:bg-[#F2D060]"
                  : "bg-[#3A3A40] text-[#8A8A95] cursor-not-allowed"
              }`}
            >
              {canRetryNow ? "Retry Now" : `Retry available in ${Math.ceil(((m.retryAfter || Date.now()) - Date.now()) / 1000)}s`}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`chat-panel${isOpen ? " open" : ""}`}>
        <div className="chat-header">
          <div>
            <div className="chat-title">AI Analyst</div>
            <div className="chat-model">gemini-flash-1.5 via OpenRouter</div>
          </div>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => renderMessage(m, i))}
          {loading && (
            <div className="chat-msg assistant">
              <div className="chat-bubble">
                <div className="chat-typing">
                  <div className="chat-dot" /><div className="chat-dot" /><div className="chat-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-footer">
          <div className="text-xs mb-2" style={{ color: T.muted }}>
            {rateLimitRemaining === 0 ? (
              <span>⏱️ Rate limit reached - wait {rateLimitReset ? Math.ceil((rateLimitReset - Date.now()) / 1000) : 60}s</span>
            ) : rateLimitRemaining < 3 ? (
              <span>⚠️ {rateLimitRemaining} request{rateLimitRemaining !== 1 ? 's' : ''} remaining this minute</span>
            ) : (
              <span>✓ {rateLimitRemaining} requests available this minute</span>
            )}
          </div>
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="chat-sugg" onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input" rows={1}
              placeholder="Ask about your finances…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
              maxLength={800}
            />
            <button className="chat-send" onClick={() => send()} disabled={loading || !input.trim()}>↑</button>
          </div>
        </div>
      </div>
      <ApiKeyModal isOpen={showApiKeyModal} onClose={handleApiKeyCancel} onSubmit={handleApiKeySubmit} />
    </>
  );
}
