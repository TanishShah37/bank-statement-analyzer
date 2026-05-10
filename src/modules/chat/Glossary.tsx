// ─────────────────────────────────────────────────────────────────────────────
// Glossary — Bank statement terms and definitions
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { T } from "../../styles/theme";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Debit",
    definition: "Money taken out of your account. This includes purchases, withdrawals, transfers, fees, and other outflows. Debits reduce your account balance.",
    category: "Transaction Types"
  },
  {
    term: "Credit",
    definition: "Money added to your account. This includes deposits, salary credits, interest, refunds, and other inflows. Credits increase your account balance.",
    category: "Transaction Types"
  },
  {
    term: "Balance",
    definition: "The amount of money remaining in your account after all transactions have been processed. Can be positive (funds available) or negative (overdrawn).",
    category: "Account Status"
  },
  {
    term: "Narration",
    definition: "A description of the transaction, typically showing the merchant name, transfer recipient, or purpose of the transaction. Helps identify what the transaction was for.",
    category: "Transaction Details"
  },
  {
    term: "Mode",
    definition: "The payment method used for the transaction, such as NEFT, RTGS, IMPS, UPI, ATM withdrawal, cheque, or card payment.",
    category: "Transaction Details"
  },
  {
    term: "Closing Balance",
    definition: "The account balance at the end of the statement period or after the last transaction. Used to calculate the opening balance for the next period.",
    category: "Account Status"
  },
  {
    term: "Opening Balance",
    definition: "The account balance at the beginning of the statement period. This is carried forward from the previous statement's closing balance.",
    category: "Account Status"
  },
  {
    term: "NEFT",
    definition: "National Electronic Funds Transfer - A nationwide electronic payment system for transferring funds between banks. Settlement time: 1-2 hours. No minimum limit.",
    category: "Payment Modes"
  },
  {
    term: "RTGS",
    definition: "Real Time Gross Settlement - High-value fund transfers that settle individually on a real-time basis. Minimum amount: ₹2 lakhs. Settlement: Real-time.",
    category: "Payment Modes"
  },
  {
    term: "IMPS",
    definition: "Immediate Payment Service - An instant real-time inter-bank electronic fund transfer service. Available 24/7. Maximum: ₹2 lakhs.",
    category: "Payment Modes"
  },
  {
    term: "UPI",
    definition: "Unified Payments Interface - A real-time payment system for instant money transfer between bank accounts using mobile devices. No transaction limits for most banks.",
    category: "Payment Modes"
  },
  {
    term: "ECS",
    definition: "Electronic Clearing Service - An automated system for processing bulk debit/credit transactions. Used for salary payments, EMIs, and dividends.",
    category: "Payment Modes"
  },
  {
    term: "Standing Instruction",
    definition: "An automated instruction to your bank to make regular payments or transfers at specified intervals. Useful for recurring bills and investments.",
    category: "Banking Terms"
  },
  {
    term: "Auto-debit",
    definition: "Automatic deduction of funds from your account for recurring payments like bills, EMIs, or subscriptions. Requires prior authorization.",
    category: "Banking Terms"
  },
  {
    term: "EMI",
    definition: "Equated Monthly Installment - A fixed payment amount made by a borrower to a lender at a specified date each calendar month. Includes both principal and interest.",
    category: "Banking Terms"
  },
  {
    term: "Interest Credit",
    definition: "Interest earned on your account balance, credited by the bank periodically. Savings accounts typically credit quarterly.",
    category: "Banking Terms"
  },
  {
    term: "Bank Charges",
    definition: "Fees charged by the bank for services like account maintenance, ATM usage beyond free limit, cheque book issuance, or penalty charges.",
    category: "Fees"
  },
  {
    term: "Minimum Balance",
    definition: "The minimum amount you must maintain in your account to avoid penalty charges. Varies by account type and bank.",
    category: "Account Status"
  },
  {
    term: "Clearing",
    definition: "The process by which a cheque or electronic transfer is validated and funds are transferred between accounts. Local cheques clear faster than outstation cheques.",
    category: "Banking Terms"
  },
  {
    term: "Hold",
    definition: "A temporary restriction on funds in your account, typically for pending transactions or security verification. Holds prevent you from spending that money temporarily.",
    category: "Account Status"
  },
  {
    term: "Overdraft",
    definition: "A credit facility that allows you to withdraw more than your account balance up to a pre-approved limit. Interest is charged on the overdrawn amount.",
    category: "Banking Terms"
  },
  {
    term: "Sweep-in Facility",
    definition: "An automatic transfer of excess funds from your savings account to a fixed deposit to earn higher interest. Transfers back when needed.",
    category: "Banking Terms"
  },
  {
    term: "Cheque Bounce",
    definition: "When a cheque is returned unpaid due to insufficient funds, signature mismatch, or other issues. Incurs penalty charges and can affect credit score.",
    category: "Banking Terms"
  },
  {
    term: "NACH",
    definition: "National Automated Clearing House - A centralized system for bulk payment transactions like salary, dividends, and pension. Replaces ECS in many cases.",
    category: "Payment Modes"
  },
  {
    term: "Bill Payment",
    definition: "Payment of utility bills, credit card bills, and other recurring payments through banking channels. Can be one-time or auto-debit.",
    category: "Banking Terms"
  },
  {
    term: "ATM Withdrawal",
    definition: "Cash withdrawal from an ATM. Most banks offer free withdrawals up to a limit per month, after which charges apply.",
    category: "Transaction Details"
  },
  {
    term: "Card Payment",
    definition: "Payment made using debit or credit card at merchant outlets or online. Processed through payment networks like Visa, Mastercard, RuPay.",
    category: "Transaction Details"
  },
  {
    term: "Net Banking",
    definition: "Online banking service that allows customers to conduct financial transactions via the internet. Includes fund transfers, bill payments, and account management.",
    category: "Banking Terms"
  },
  {
    term: "KYC",
    definition: "Know Your Customer - A regulatory requirement for banks to verify customer identity. Includes PAN, Aadhaar, address proof, and photographs.",
    category: "Banking Terms"
  },
  {
    term: "Nomination",
    definition: "The process of nominating a person to receive the account balance in case of the account holder's death. Important for all account types.",
    category: "Banking Terms"
  },
  {
    term: "Dormant Account",
    definition: "An account with no transactions for 2+ years. Requires reactivation with KYC documents before transactions can resume.",
    category: "Account Status"
  },
  {
    term: "Inoperative Account",
    definition: "An account with no transactions for 10+ years. Bank may transfer funds to RBI after due notice. Requires full KYC for reactivation.",
    category: "Account Status"
  },
  {
    term: "TDS",
    definition: "Tax Deducted at Source - Tax deducted by banks on interest income if it exceeds the threshold. Visible in your bank statement with TDS codes.",
    category: "Fees"
  },
  {
    term: "GST",
    definition: "Goods and Services Tax - Indirect tax on goods and services. Visible in bank statements for GST payments made by businesses.",
    category: "Fees"
  },
  {
    term: "POS",
    definition: "Point of Sale - The location where a card transaction occurs. POS transactions appear on statements with merchant details.",
    category: "Transaction Details"
  },
  {
    term: "Refund",
    definition: "Money returned to your account for a cancelled purchase, failed transaction, or service issue. Refunds may take 3-7 business days to process.",
    category: "Transaction Types"
  },
  {
    term: "Chargeback",
    definition: "The return of funds to a consumer, initiated by the issuing bank of the instrument used for a transaction. Typically due to disputed transaction.",
    category: "Transaction Types"
  },
  {
    term: "Fixed Deposit",
    definition: "A term deposit with a bank where money is locked for a fixed period at a fixed interest rate. Premature withdrawal may incur penalty.",
    category: "Banking Terms"
  },
  {
    term: "Recurring Deposit",
    definition: "A savings scheme where you deposit a fixed amount monthly for a fixed period. Earns higher interest than savings accounts.",
    category: "Banking Terms"
  },
  {
    term: "Lock-in Period",
    definition: "The period during which you cannot withdraw funds without penalty. Applies to fixed deposits and some investment products.",
    category: "Banking Terms"
  },
  {
    term: "Premature Withdrawal",
    definition: "Withdrawing funds from a fixed deposit before maturity. Usually attracts a penalty in the form of reduced interest rate.",
    category: "Banking Terms"
  },
  {
    term: "Maturity",
    definition: "The end date of a fixed deposit or investment term when the principal and interest become available for withdrawal.",
    category: "Banking Terms"
  },
  {
    term: "Aadhaar Seeding",
    definition: "Linking your Aadhaar number to your bank account. Required for certain government benefits and subsidies.",
    category: "Banking Terms"
  },
  {
    term: "Mobile Banking",
    definition: "Banking services accessed through mobile apps. Includes account balance check, fund transfers, bill payments, and more.",
    category: "Banking Terms"
  },
  {
    term: "SMS Banking",
    definition: "Banking services through SMS. Used for balance inquiries, mini-statements, and transaction alerts.",
    category: "Banking Terms"
  },
  {
    term: "Passbook",
    definition: "A physical book issued by banks to record all transactions in an account. Can be updated at bank branches or ATMs.",
    category: "Transaction Details"
  },
  {
    term: "Statement",
    definition: "A periodic record of all transactions in your account. Can be monthly, quarterly, or annual. Available online or by request.",
    category: "Transaction Details"
  },
  {
    term: "Minimum Average Balance",
    definition: "The minimum average balance required to be maintained in a savings account over a month or quarter to avoid charges.",
    category: "Account Status"
  },
  {
    term: "Service Charges",
    definition: "Fees for specific banking services like cheque book issuance, demand draft, stop payment, duplicate statement, etc.",
    category: "Fees"
  },
  {
    term: "Penalty Charges",
    definition: "Fees charged for rule violations like cheque bounce, minimum balance not maintained, late EMI payment, etc.",
    category: "Fees"
  },
  {
    term: "Link Account",
    definition: "Connecting multiple accounts (savings, current, loan) for easier fund transfers and consolidated view.",
    category: "Banking Terms"
  },
  {
    term: "Joint Account",
    definition: "An account held by two or more people. Can be joint (anyone can operate) or former or survivor (survivor gets access after death).",
    category: "Banking Terms"
  }
];

const CATEGORIES = Array.from(new Set(GLOSSARY_TERMS.map(t => t.category))).sort();

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(GLOSSARY_TERMS[0]);
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredTerms = GLOSSARY_TERMS.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc" ? a.term.localeCompare(b.term) : b.term.localeCompare(a.term);
    } else {
      return sortOrder === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
    }
  });

  return (
    <div className="glossary-section">
      <div className="glossary-header">
        <h2 className="glossary-title">Bank Statement Glossary</h2>
        <p className="glossary-subtitle">Understand your bank statement terminology</p>
      </div>

      <div className="glossary-filters">
        <input
          className="glossary-search"
          placeholder="Search terms or definitions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="glossary-category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          className="glossary-sort-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>
        <button
          className="glossary-sort-toggle"
          onClick={() => setSortOrder(s => s === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="glossary-content">
        <div className="glossary-terms-list">
          <div className="glossary-terms-count">
            {filteredTerms.length} term{filteredTerms.length !== 1 ? "s" : ""} found
          </div>
          {filteredTerms.map((term, index) => (
            <div
              key={index}
              className={`glossary-term ${selectedTerm === term ? "active" : ""}`}
              onClick={() => setSelectedTerm(term)}
            >
              <div className="glossary-term-name">{term.term}</div>
              <div className="glossary-term-category">{term.category}</div>
              <div className="glossary-term-preview">{term.definition.substring(0, 80)}...</div>
            </div>
          ))}
        </div>

        {selectedTerm && (
          <div className="glossary-detail">
            <div className="glossary-detail-header">
              <h3 className="glossary-detail-title">{selectedTerm.term}</h3>
              <span className="glossary-detail-category">{selectedTerm.category}</span>
            </div>
            <p className="glossary-detail-definition">{selectedTerm.definition}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function GlossaryTooltip({ term }: { term: string }) {
  const glossaryTerm = GLOSSARY_TERMS.find(t => t.term.toLowerCase() === term.toLowerCase());
  
  if (!glossaryTerm) return <span>{term}</span>;

  return (
    <span className="glossary-link" title={glossaryTerm.definition}>
      {term}
      <sup className="glossary-sup">?</sup>
    </span>
  );
}
