import React, { useState, useEffect } from 'react';
import {
  Coins,
  X,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Flame,
  Crown,
  Sparkles,
  CreditCard,
  ExternalLink,
  Layers,
  Info,
  Clock,
  AlertCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { TokenPackage, TokenTransaction } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokensBalance: number;
  balanceDollars: string;
  transactions: TokenTransaction[];
  onTopUp: (amountDollars: number) => Promise<boolean>;
  onPurchaseTokenPackage?: (packageId: string) => Promise<boolean>;
}

const DEFAULT_PACKAGES: TokenPackage[] = [
  {
    id: 'pack_starter',
    name: 'Arcade Starter Pack',
    tagline: 'Frictionless 0.1¢ entry — test creative files, jokes & triggers',
    priceDollars: 1.00,
    baseTokens: 1000,
    bonusTokens: 0,
    totalTokens: 1000,
    playsCount: 1000,
    badge: 'STARTER (0.1¢/PLAY)',
    iconName: 'Sparkles',
    colorTheme: 'cyan'
  },
  {
    id: 'pack_creator_pro',
    name: 'Creator Pro Pack',
    tagline: 'Run continuous city campaigns & test high-impact creatives',
    priceDollars: 5.00,
    baseTokens: 5000,
    bonusTokens: 500,
    totalTokens: 5500,
    playsCount: 5500,
    badge: 'POPULAR (+10% BONUS)',
    isPopular: true,
    iconName: 'Zap',
    colorTheme: 'emerald'
  },
  {
    id: 'pack_growth_brand',
    name: 'Growth Brand Pack',
    tagline: 'Dominate prime launch windows & outbid competitors with scale',
    priceDollars: 20.00,
    baseTokens: 20000,
    bonusTokens: 5000,
    totalTokens: 25000,
    playsCount: 25000,
    badge: '25% BONUS TOKENS',
    iconName: 'Flame',
    colorTheme: 'purple'
  },
  {
    id: 'pack_megacity_takeover',
    name: 'Megacity Takeover Pack',
    tagline: 'High-frequency AI agent bidding & non-stop billboard takeover',
    priceDollars: 50.00,
    baseTokens: 50000,
    bonusTokens: 20000,
    totalTokens: 70000,
    playsCount: 70000,
    badge: 'MAX VALUE (+40% BONUS)',
    iconName: 'Crown',
    colorTheme: 'amber'
  }
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  tokensBalance,
  balanceDollars,
  transactions,
  onTopUp,
  onPurchaseTokenPackage
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'custom' | 'convert' | 'checkout'>('packages');
  const [packages, setPackages] = useState<TokenPackage[]>(DEFAULT_PACKAGES);
  const [customAmount, setCustomAmount] = useState<string>('10');
  const [convertAmount, setConvertAmount] = useState<string>('10');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Stripe status state
  const [stripeStatus, setStripeStatus] = useState<{ isLiveConfigured: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch packages from server if available
      fetch('/api/tokens/packages')
        .then(res => res.json())
        .then(data => {
          if (data.packages && Array.isArray(data.packages)) {
            setPackages(data.packages);
          }
        })
        .catch(() => {});

      fetch('/api/stripe/status')
        .then(res => res.json())
        .then(data => setStripeStatus(data))
        .catch(() => setStripeStatus({ isLiveConfigured: false, message: 'Offline mode' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConvertCash = async (convertAll: boolean = false) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/tokens/convert-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountDollars: convertAll ? undefined : parseFloat(convertAmount) || 0,
          convertAll
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`⚡ ${data.message}`);
        setTimeout(() => setSuccessMessage(''), 5000);
        await onTopUp(0);
      } else {
        setErrorMessage(data.error || 'Failed to convert cash to tokens');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Conversion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyPackage = async (pkg: TokenPackage) => {
    setIsSubmitting(true);
    setPurchasingPackId(pkg.id);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (onPurchaseTokenPackage) {
        const ok = await onPurchaseTokenPackage(pkg.id);
        if (ok) {
          setSuccessMessage(`🎉 Unlocked ${pkg.name}! +${pkg.totalTokens.toLocaleString()} Ad Tokens added to your wallet.`);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        const res = await fetch('/api/tokens/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id })
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMessage(`🎉 ${data.message}`);
          setTimeout(() => setSuccessMessage(''), 5000);
          await onTopUp(0); // Trigger refresh
        } else {
          setErrorMessage(data.error || 'Failed to purchase token pack');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
      setPurchasingPackId(null);
    }
  };

  const handleCustomReload = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/tokens/custom-reload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountDollars: parsed })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`⚡ Custom Reload Applied! +${data.totalTokens.toLocaleString()} Ad Tokens added ($${parsed.toFixed(2)} USD).`);
        setTimeout(() => setSuccessMessage(''), 5000);
        await onTopUp(0);
      } else {
        setErrorMessage(data.error || 'Failed to reload tokens');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Reload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripeCheckout = async () => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const parsed = parseFloat(customAmount) || 20;

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountDollars: parsed,
          description: `Live Billboard Arcade Ad Tokens ($${parsed.toFixed(2)})`,
          campaignTitle: 'Arcade Token Pack Deposit'
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.fallbackMode) {
        // Fallback auto-credit if Stripe Secret Key is not configured in sandbox
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

  // Dynamic calculations for custom amount
  const parsedCustom = parseFloat(customAmount) || 0;
  const customBaseTokens = Math.round(parsedCustom * 1000);
  let customBonusPercent = 0;
  if (parsedCustom >= 50) customBonusPercent = 40;
  else if (parsedCustom >= 20) customBonusPercent = 25;
  else if (parsedCustom >= 5) customBonusPercent = 10;
  const customBonusTokens = Math.round(customBaseTokens * (customBonusPercent / 100));
  const customTotalTokens = customBaseTokens + customBonusTokens;

  return (
    <div id="arcade-token-wallet-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl relative overflow-hidden my-8">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shadow-inner">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Arcade Token Store & Ad Wallet
                </h2>
                <span className="text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded-full font-mono font-bold">
                  0.1¢ LIVE AUCTION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                $1.00 USD = 1,000 Billboard Tokens • 1 Token = 1 x 15s display play at floor
              </p>
            </div>
          </div>
          <button
            id="close-token-wallet-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Your Ad Token Balance
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Decoupled RTB Vault
            </span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono">
                {tokensBalance.toLocaleString()}
              </span>
              <span className="text-sm font-black text-slate-300">TOKENS</span>
              <span className="text-xs text-slate-400 font-mono ml-2">
                (≈ ${(tokensBalance * 0.001).toFixed(2)} USD)
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                ⚡ {tokensBalance.toLocaleString()} plays remaining
              </div>
            </div>
          </div>

          {/* Psychological & Architectural Win Explanation Pill */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center gap-2 text-[11px] text-slate-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Zero Payment Gateway Friction:</strong> By purchasing bundled packs once, you bypass flat 30¢ credit card swipe fees and can test creative files freely for 1 token (0.1¢) per slot!
            </span>
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-4 gap-2">
          <button
            id="tab-token-packages"
            onClick={() => setActiveTab('packages')}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'packages'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bundled Token Packs</span>
          </button>

          <button
            id="tab-custom-reload"
            onClick={() => setActiveTab('custom')}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'custom'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Custom Token Reload (+Bonus Tiers)</span>
          </button>

          <button
            id="tab-convert-cash"
            onClick={() => setActiveTab('convert')}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'convert'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Convert Cash to Tokens</span>
          </button>

          <button
            id="tab-stripe-checkout"
            onClick={() => setActiveTab('checkout')}
            className={`pb-2 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'checkout'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Stripe Live Checkout</span>
          </button>
        </div>

        {/* TAB CONVERT CASH TO TOKENS */}
        {activeTab === 'convert' && (
          <div className="space-y-4 mb-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Convert Cash Balance to Billboard Tokens
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                  $1.00 = 1,000 Tokens (1¢ = 10 Tokens)
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Exchange your available cash wallet balance into ad tokens instantly with zero transaction fees. Each token powers a 15-second billboard slot broadcast.
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Available Cash Balance:</span>
                  <span className="font-mono font-black text-white text-base">${balanceDollars} USD</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Current Token Balance:</span>
                  <span className="font-mono font-black text-amber-400 text-base">{tokensBalance.toLocaleString()} Tokens</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Amount in USD to Convert ($)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                      placeholder="10.00"
                    />
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-3 py-2 rounded-xl">
                    ➡️ {((parseFloat(convertAmount) || 0) * 1000).toLocaleString()} Tokens
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleConvertCash(false)}
                  className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Convert ${convertAmount || '10'} USD</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleConvertCash(true)}
                  className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Convert ALL Cash</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: BUNDLED TOKEN PACKAGES (PRIMARY ARCADE VIEW) */}
        {activeTab === 'packages' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const isBuyingThis = purchasingPackId === pkg.id;
                const isPopular = pkg.isPopular || pkg.id === 'pack_creator_pro';
                const isMax = pkg.id === 'pack_megacity_takeover';

                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isPopular
                        ? 'bg-gradient-to-b from-slate-900 to-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                        : isMax
                        ? 'bg-gradient-to-b from-slate-900 to-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 shadow">
                        {pkg.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {pkg.id === 'pack_starter' && <Sparkles className="w-4 h-4 text-cyan-400" />}
                        {pkg.id === 'pack_creator_pro' && <Zap className="w-4 h-4 text-emerald-400" />}
                        {pkg.id === 'pack_growth_brand' && <Flame className="w-4 h-4 text-purple-400" />}
                        {pkg.id === 'pack_megacity_takeover' && <Crown className="w-4 h-4 text-amber-400" />}
                        <h3 className="font-extrabold text-sm text-white">{pkg.name}</h3>
                      </div>

                      <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                        {pkg.tagline}
                      </p>

                      <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 mb-3 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Total Tokens:</span>
                          <span className="font-mono font-black text-base text-amber-400">
                            {pkg.totalTokens.toLocaleString()}
                          </span>
                        </div>

                        {pkg.bonusTokens > 0 && (
                          <div className="flex items-center justify-between text-[10px] text-emerald-400">
                            <span>Bonus Tokens:</span>
                            <span className="font-mono font-bold">+{pkg.bonusTokens.toLocaleString()} FREE</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>Plays @ 0.1¢ floor:</span>
                          <span className="font-mono font-bold text-slate-200">{pkg.playsCount.toLocaleString()} x 15s plays</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`buy-pack-btn-${pkg.id}`}
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={isSubmitting}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 ${
                        isPopular
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black'
                          : isMax
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{isBuyingThis ? 'Processing...' : `Buy ${pkg.totalTokens.toLocaleString()} Tokens for $${pkg.priceDollars.toFixed(2)}`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM RELOAD WITH BONUS TIERS */}
        {activeTab === 'custom' && (
          <div className="space-y-4 mb-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Custom Dollar Amount
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3" /> Higher Packs Unlock Up to +40% Bonus
                </span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(amt.toString())}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      customAmount === amt.toString()
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                        : 'bg-slate-900 text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Input field */}
              <form onSubmit={handleCustomReload} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    placeholder="Deposit USD ($)"
                  />
                </div>

                {/* Calculation breakdown */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Tokens ($1 = 1,000 Tokens):</span>
                    <span className="font-mono text-white">{customBaseTokens.toLocaleString()}</span>
                  </div>
                  {customBonusPercent > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Tier Bonus (+{customBonusPercent}%):</span>
                      <span className="font-mono">+{customBonusTokens.toLocaleString()} Tokens</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-extrabold pt-1.5 border-t border-slate-800">
                    <span className="text-amber-400">You Receive:</span>
                    <span className="font-mono text-amber-400 text-sm">{customTotalTokens.toLocaleString()} Ad Tokens</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || parsedCustom <= 0}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-4 h-4 text-slate-950" />
                  <span>Instant Reload +{customTotalTokens.toLocaleString()} Tokens for ${parsedCustom.toFixed(2)}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: STRIPE LIVE CHECKOUT */}
        {activeTab === 'checkout' && (
          <div className="space-y-4 mb-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Stripe PCI-DSS Card Checkout
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Live Encrypted Gateway
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Custom Deposit ($ USD)"
                />
              </div>

              <button
                onClick={handleStripeCheckout}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>Pay ${customAmount || '20'} via Stripe Live Session</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
              </button>

              {stripeStatus && !stripeStatus.isLiveConfigured && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-300 leading-relaxed space-y-1">
                  <strong className="text-white block font-bold">Live Stripe Notice</strong>
                  <p>{stripeStatus.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Token Ledger & Deductions */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Recent Token & Ad Activity Ledger
          </h3>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {transactions.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2 text-center">No token transactions recorded yet</div>
            ) : (
              transactions.slice(0, 6).map((tx) => {
                const isPlus = tx.type === 'topup' || tx.type === 'pack_purchase' || tx.type === 'bonus_grant' || tx.type === 'outbid_refund';
                const tokenCount = tx.tokens || (tx.amountCents ? tx.amountCents * 10 : 0);

                return (
                  <div
                    key={tx.id}
                    className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${isPlus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isPlus ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate max-w-xs">
                        <div className="font-bold text-slate-200 truncate">{tx.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`font-black ${isPlus ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isPlus ? '+' : '-'}{tokenCount.toLocaleString()} <span className="text-[10px]">TKN</span>
                      </div>
                      {tx.amountDollars && (
                        <div className="text-[9px] text-slate-500 font-normal">(${tx.amountDollars})</div>
                      )}
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
