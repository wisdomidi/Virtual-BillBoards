import React, { useState, useEffect } from 'react';
import {
  Coins,
  X,
  CheckCircle2,
  Zap,
  Sparkles,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Flame,
  Crown
} from 'lucide-react';
import { TokenPackage, TokenTransaction } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokensBalance?: number;
  balanceDollars: string;
  transactions: TokenTransaction[];
  userId?: string;
  onTopUp: (amountDollars: number) => Promise<boolean>;
  onPurchaseTokenPackage?: (packageId: string) => Promise<boolean>;
  onClaimStarter?: () => Promise<void>;
}

const PRESET_TIERS = [
  {
    id: 'pack_1',
    amountDollars: 1.00,
    tokens: 1000,
    bonusTokens: 0,
    title: '1 Slot Starter',
    badge: '$1.00',
    icon: Sparkles,
    color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-400'
  },
  {
    id: 'pack_5',
    amountDollars: 5.00,
    tokens: 5000,
    bonusTokens: 500,
    title: '5 Slots (+10% Bonus)',
    badge: 'Popular',
    icon: Zap,
    color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400',
    isPopular: true
  },
  {
    id: 'pack_10',
    amountDollars: 10.00,
    tokens: 10000,
    bonusTokens: 1500,
    title: '10 Slots (+15% Bonus)',
    badge: '+1,500 Bonus',
    icon: Flame,
    color: 'border-purple-500/40 bg-purple-950/30 text-purple-400'
  },
  {
    id: 'pack_25',
    amountDollars: 25.00,
    tokens: 25000,
    bonusTokens: 5000,
    title: 'Mega Pack (+20% Bonus)',
    badge: 'Best Value',
    icon: Crown,
    color: 'border-amber-500/50 bg-amber-950/40 text-amber-400'
  }
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  tokensBalance,
  balanceDollars,
  userId,
  onTopUp,
  onClaimStarter
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5.00);
  const [customAmount, setCustomAmount] = useState<string>('5');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClaimingStarter, setIsClaimingStarter] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const safeTokensBalance = typeof tokensBalance === 'number'
    ? tokensBalance
    : Math.round((parseFloat(balanceDollars || '0') || 0) * 1000);

  const handleClaimClick = async () => {
    if (!onClaimStarter) return;
    setIsClaimingStarter(true);
    setErrorMessage('');
    try {
      await onClaimStarter();
      setSuccessMessage('🎉 $1.00 Free Starter Credit (1,000 Tokens) claimed successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to claim starter credit.');
    } finally {
      setIsClaimingStarter(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
    setErrorMessage('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(num);
    }
  };

  const calculateTotalTokens = (dollars: number) => {
    const base = Math.round(dollars * 1000);
    let bonusPct = 0;
    if (dollars >= 25) bonusPct = 0.20;
    else if (dollars >= 10) bonusPct = 0.15;
    else if (dollars >= 5) bonusPct = 0.10;
    const bonus = Math.round(base * bonusPct);
    return { base, bonus, total: base + bonus };
  };

  const tokenCalc = calculateTotalTokens(selectedAmount);

  const handleProceedToCheckout = async () => {
    if (selectedAmount <= 0 || isNaN(selectedAmount)) {
      setErrorMessage('Please choose or enter a valid amount ($1.00 minimum).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountDollars: selectedAmount,
          userId: userId || undefined,
          description: `Billboard Ad Wallet Reload: $${selectedAmount.toFixed(2)} USD (+${tokenCalc.total.toLocaleString()} Tokens)`,
          campaignTitle: 'Billboard Ad Tokens',
          returnUrl: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });

      const data = await res.json();

      if (data.url && typeof data.url === 'string' && (data.url.startsWith('https://checkout.stripe.com') || data.url.startsWith('http'))) {
        // Redirect directly to Stripe Hosted Checkout
        window.location.href = data.url;
        return;
      } else {
        setErrorMessage(data.error || 'Failed to initialize Stripe Checkout. Please verify payment credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment service unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="arcade-token-wallet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Top Up Ad Wallet
              </h2>
              <p className="text-xs text-slate-400">
                1 Token = 0.1¢ USD • 1,000 Tokens = 1 x 15s Billboard Slot ($1.00)
              </p>
            </div>
          </div>

          <button
            id="close-wallet-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Ad Wallet Balance */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Current Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-black text-amber-400">
                {safeTokensBalance.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-bold">Tokens</span>
              <span className="text-xs text-slate-500 font-mono">
                (≈ ${(safeTokensBalance * 0.001).toFixed(2)})
              </span>
            </div>
          </div>
          <span className="text-xs bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-bold px-3 py-1.5 rounded-xl">
            {Math.floor(safeTokensBalance / 1000)} Slots Ready
          </span>
        </div>

        {/* Free Starter Credit Claim Banner (if balance is 0) */}
        {safeTokensBalance <= 0 && onClaimStarter && (
          <div className="bg-gradient-to-r from-cyan-950/80 via-indigo-950/60 to-slate-950 border border-cyan-500/40 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-xs">
                <div className="font-black text-white flex items-center gap-1.5">
                  Claim $1.00 Free Starter Slot
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">1,000 Tokens</span>
                </div>
                <p className="text-[11px] text-slate-400">Free starter ad slot for verified accounts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClaimClick}
              disabled={isClaimingStarter}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isClaimingStarter ? 'Claiming...' : 'Claim $1.00'}
            </button>
          </div>
        )}

        {/* Amount Presets Grid */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase">
            Select Amount
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESET_TIERS.map((tier) => {
              const isSelected = selectedAmount === tier.amountDollars;
              const Icon = tier.icon;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleSelectPreset(tier.amountDollars)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/50 ring-2 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded-md">
                      {tier.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-base font-black text-white font-mono">
                      ${tier.amountDollars.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300">
                    +{(tier.tokens + tier.bonusTokens).toLocaleString()} Tokens
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-1.5 mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase">
            Or Custom USD Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input
              type="number"
              min="1.00"
              step="1.00"
              value={customAmount}
              onChange={handleCustomChange}
              placeholder="e.g. 15.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-28 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-mono font-bold">
              +{tokenCalc.total.toLocaleString()} TKN
            </span>
          </div>
        </div>

        {/* Feedback Notices */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Proceed to Stripe Checkout Button */}
        <button
          type="button"
          onClick={handleProceedToCheckout}
          disabled={isSubmitting || selectedAmount <= 0}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4 fill-current" />
          <span>
            {isSubmitting
              ? 'Opening Stripe Checkout...'
              : `Pay $${selectedAmount.toFixed(2)} with Card / Stripe`}
          </span>
        </button>

        {/* Security / Stripe Trust Badge */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured with Stripe 256-bit SSL encryption. Zero card data stored.</span>
        </div>
      </div>
    </div>
  );
};
