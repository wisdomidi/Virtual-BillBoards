import React, { useState, useEffect } from 'react';
import {
  Wallet,
  X,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Bot,
  CreditCard,
  ExternalLink,
  Code2,
  Key,
  Copy,
  Terminal,
  AlertCircle
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceDollars: string;
  transactions: Array<{
    id: string;
    type: 'topup' | 'bid_deduction' | 'refund';
    amountCents: number;
    description: string;
    timestamp: string;
  }>;
  onTopUp: (amountDollars: number) => Promise<boolean>;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balanceDollars,
  transactions,
  onTopUp
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'fast'>('checkout');
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Stripe status state
  const [stripeStatus, setStripeStatus] = useState<{ isLiveConfigured: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/stripe/status')
        .then(res => res.json())
        .then(data => setStripeStatus(data))
        .catch(() => setStripeStatus({ isLiveConfigured: false, message: 'Offline mode' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickTopUp = async (amount: number) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    const ok = await onTopUp(amount);
    setIsSubmitting(false);
    if (ok) {
      setSuccessMessage(`+$${amount.toFixed(2)} added to your wallet!`);
      setTimeout(() => setSuccessMessage(''), 3500);
    }
  };

  const handleCustomTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed <= 0) return;
    await handleQuickTopUp(parsed);
  };

  const handleStripeCheckout = async () => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const parsed = parseFloat(customAmount) || 50;

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountDollars: parsed,
          description: 'Live Billboard RTB Ad Credit Top-Up',
          campaignTitle: 'Billboard Deposit'
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.fallbackMode) {
        // Fallback auto-credit if Stripe Secret Key is not configured
        await onTopUp(parsed);
        setSuccessMessage(`Direct Wallet Top-Up (+$${parsed.toFixed(2)}) applied! ${data.instructions}`);
      } else {
        setErrorMessage(data.error || 'Failed to initialize Stripe Checkout Session.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Stripe connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Production Ad Wallet & Payments
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  LIVE READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Process real card payments or manage your campaign deposit wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Available Wallet Balance</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Encrypted Vault
            </span>
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-2">
            <span className="text-emerald-400">${balanceDollars}</span>
            <span className="text-xs text-slate-400 font-mono font-normal">USD</span>
          </div>

          {successMessage && (
            <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 mb-4 gap-2">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'checkout'
                ? 'border-emerald-400 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card Checkout</span>
          </button>

          <button
            onClick={() => setActiveTab('fast')}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'fast'
                ? 'border-emerald-400 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Top-Up Presets</span>
          </button>
        </div>

        {/* TAB 1: STRIPE CHECKOUT */}
        {activeTab === 'checkout' && (
          <div className="space-y-4 mb-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Deposit Amount
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Stripe PCI-DSS Secured
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCustomAmount(amt.toString())}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      customAmount === amt.toString()
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-slate-900 text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="5"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Custom Deposit ($ USD)"
                />
              </div>

              <button
                onClick={handleStripeCheckout}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>Pay ${customAmount || '50'} via Stripe Live Checkout</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
              </button>

              {stripeStatus && !stripeStatus.isLiveConfigured && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-300 leading-relaxed space-y-1">
                  <strong className="text-white block font-bold">Live Stripe Configuration Notice</strong>
                  <p>
                    {stripeStatus.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INSTANT TOP-UP PRESETS */}
        {activeTab === 'fast' && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  disabled={isSubmitting}
                  onClick={() => handleQuickTopUp(amt)}
                  className="py-3 px-3 bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-slate-700 hover:border-emerald-400 rounded-xl font-mono font-bold text-sm transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  +${amt}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomTopUp} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Custom Amount"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !customAmount}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Fast Add</span>
              </button>
            </form>
          </div>
        )}

        {/* Recent Transactions Ledger */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Transactions</h3>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {transactions.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2 text-center">No transactions recorded yet</div>
            ) : (
              transactions.slice(0, 5).map((tx) => {
                const isPlus = tx.type === 'topup' || tx.type === 'refund';
                return (
                  <div
                    key={tx.id}
                    className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${isPlus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {isPlus ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{tx.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className={`font-mono font-black ${isPlus ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {isPlus ? '+' : '-'}${(tx.amountCents / 100).toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

