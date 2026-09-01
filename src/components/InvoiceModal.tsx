import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Download,
  Building,
  ShieldCheck,
  CreditCard,
  Zap,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { TokenTransaction } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: TokenTransaction | null;
  userEmail?: string;
  defaultCompanyName?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
  userEmail,
  defaultCompanyName
}) => {
  const [companyName, setCompanyName] = useState(defaultCompanyName || 'Acme Digital Media Inc.');
  const [taxId, setTaxId] = useState('US-TAX-89234710');
  const [billingAddress, setBillingAddress] = useState('100 Broadway, New York, NY 10005, United States');
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  if (!isOpen) return null;

  const invoiceId = transaction?.id ? `INV-${transaction.id.replace('tx_', '').toUpperCase()}` : `INV-${Date.now().toString(36).toUpperCase()}`;
  const invoiceDate = transaction?.timestamp ? new Date(transaction.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const tokens = transaction?.tokens || 5000;
  const amountDollars = transaction?.amountDollars ? parseFloat(transaction.amountDollars) : (transaction?.amountCents ? transaction.amountCents / 100 : tokens * 0.001);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Official Corporate B2B Tax Invoice & Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-950 text-slate-200 font-sans printable-invoice" id="invoice-printable">
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-sm">
                  VB
                </div>
                <span className="font-black text-lg text-white tracking-tight">LIVEBILLBOARDS.LOL</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                World First Virtual Billboard Network Ltd.
              </p>
              <p className="text-[11px] text-slate-500">
                VAT / Tax Entity ID: VB-GLOBAL-2026-991A<br />
                hello@livebillboards.lol • https://www.livebillboards.lol
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-black uppercase font-mono">
                PAID & SETTLED
              </span>
              <div className="text-xs font-mono font-bold text-white mt-2">{invoiceId}</div>
              <div className="text-[11px] text-slate-400 font-mono">Date: {invoiceDate}</div>
            </div>
          </div>

          {/* Billed To / Company Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Billed To (Customer):
              </span>
              {isEditingCompany ? (
                <div className="space-y-2 mt-1">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                    placeholder="Company Name"
                  />
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    placeholder="Tax / VAT ID"
                  />
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                    placeholder="Billing Address"
                  />
                  <button
                    onClick={() => setIsEditingCompany(false)}
                    className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-[10px]"
                  >
                    Save Details
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-sm flex items-center justify-between">
                    <span>{companyName}</span>
                    <button
                      onClick={() => setIsEditingCompany(true)}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer no-print font-normal"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">Tax ID: {taxId}</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">{billingAddress}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{userEmail || 'advertiser@account.com'}</div>
                </div>
              )}
            </div>

            <div className="border-l border-slate-800 pl-4 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Payment Channel:
              </span>
              <div className="font-bold text-white text-xs">
                {transaction?.type === 'stripe_topup' ? 'Stripe 256-Bit SSL Credit Card' : 'Programmatic Real-Time Ad Deposit'}
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Status: Completed & Reconciled
              </div>
              <div className="text-slate-500 font-mono text-[10px] break-all select-all">
                Ref ID: {transaction?.id || `txn_${Date.now()}`}
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 px-2">Description / Ad Placement Service</th>
                <th className="pb-3 px-2 text-center">Tokens</th>
                <th className="pb-3 px-2 text-right">Unit Price</th>
                <th className="pb-3 px-2 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-4 px-2 font-sans">
                  <div className="font-bold text-white">
                    {transaction?.description || 'RTB Virtual Billboard Ad Broadcast Credit'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    24/7 Global Live Virtual Billboard Network Real-Time Bidding Inventory
                  </div>
                </td>
                <td className="py-4 px-2 text-center text-amber-400 font-bold">
                  {tokens.toLocaleString()}
                </td>
                <td className="py-4 px-2 text-right text-slate-400">
                  $0.0010 / tok
                </td>
                <td className="py-4 px-2 text-right font-bold text-white">
                  ${amountDollars.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total Calculation Summary */}
          <div className="border-t border-slate-800 pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>${amountDollars.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sales Tax / VAT (0% B2B):</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-2">
                <span>Total Paid (USD):</span>
                <span className="text-emerald-400 font-black">${amountDollars.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Legal / Security Footer */}
          <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-500 leading-relaxed flex items-center justify-between">
            <div>
              <p>Certified cryptographically by LiveBillboards Automated Financial Highway.</p>
              <p>Questions? Contact support@livebillboards.lol with Ref #{invoiceId}.</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Tax Receipt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
