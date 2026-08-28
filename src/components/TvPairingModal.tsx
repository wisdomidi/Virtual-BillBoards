import React, { useState, useEffect } from 'react';
import {
  Tv,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  RefreshCw,
  Building2,
  Wallet
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

interface TvPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPin?: string;
  onOpenPitchDeck?: () => void;
}

export const TvPairingModal: React.FC<TvPairingModalProps> = ({
  isOpen,
  onClose,
  initialPin = '',
  onOpenPitchDeck
}) => {
  const [pin, setPin] = useState<string>(initialPin);
  const [venueName, setVenueName] = useState<string>('');
  const [city, setCity] = useState<string>('GLOBAL');
  const [solanaWallet, setSolanaWallet] = useState<string>(() => {
    return localStorage.getItem('vb_streamer_solana_wallet') || '';
  });
  const [isPairing, setIsPairing] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  if (!isOpen) return null;

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setResultMsg('⚠️ Please enter a complete 6-digit PIN (e.g. 834-192).');
      return;
    }
    if (!venueName.trim()) {
      setResultMsg('⚠️ Please give your screen or venue a name (e.g. Blue Bottle Cafe Lounge).');
      return;
    }

    setIsPairing(true);
    setResultMsg(null);

    try {
      const res = await fetch('/api/tv/pair-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: cleanPin,
          venueName: venueName.trim(),
          solanaWallet: solanaWallet.trim() || undefined,
          city
        })
      });

      const data = await res.json();
      if (data.success) {
        soundEffects.playKaChing();
        setIsSuccess(true);
        setResultMsg(data.message || '🎉 Screen paired successfully! Your TV is now broadcasting live.');
        if (solanaWallet.trim()) {
          localStorage.setItem('vb_streamer_solana_wallet', solanaWallet.trim());
        }
      } else {
        setResultMsg(`⚠️ ${data.error || 'Failed to pair TV screen. Please check the PIN.'}`);
      }
    } catch (err: any) {
      setResultMsg(`⚠️ Error: ${err.message}`);
    } finally {
      setIsPairing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/50 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Tv className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>Pair Smart TV Screen</span>
              <span className="text-xs bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full font-mono">
                6-Digit PIN
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Enter the 6-digit code shown on your Smart TV to activate 24/7 revenue sharing.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-4 animate-scale-up">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-base font-black text-white uppercase">TV Screen Connected!</h3>
              <p className="text-xs text-emerald-200 mt-1 font-semibold">{resultMsg}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handlePair} className="space-y-4">
            {/* 6-Digit PIN Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
                <span>1. Enter 6-Digit TV PIN:</span>
                <span className="text-slate-500 text-[10px]">Shown on TV screen at livebillboards.lol/tv</span>
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setPin(val.length > 3 ? `${val.substring(0, 3)}-${val.substring(3)}` : val);
                }}
                placeholder="e.g. 834-192"
                className="w-full bg-slate-950 border-2 border-cyan-500/60 rounded-2xl px-4 py-3 text-2xl text-center font-mono font-black tracking-widest text-amber-300 focus:outline-none focus:border-cyan-400"
                maxLength={7}
                required
              />
            </div>

            {/* Venue / Location Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Venue / Screen Name:</span>
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Blue Bottle Cafe Lounge, Equinox Shibuya"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* City Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Location / City Feed:</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
              >
                <option value="GLOBAL">🌐 Global Distributed Stream</option>
                <option value="NYC">🇺🇸 New York City (Times Square)</option>
                <option value="TYO">🇯🇵 Tokyo (Shibuya Crossing)</option>
                <option value="LON">🇬🇧 London (Piccadilly)</option>
                <option value="PAR">🇫🇷 Paris (Champs-Élysées)</option>
                <option value="KUL">🇲🇾 Kuala Lumpur (Petronas)</option>
                <option value="DXB">🇦🇪 Dubai (Downtown)</option>
                <option value="SIN">🇸🇬 Singapore (Marina Bay)</option>
              </select>
            </div>

            {/* Solana Payout Wallet Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-purple-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>4. Solana Payout Wallet (70% Rev-Share):</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">Optional / Instant</span>
              </label>
              <input
                type="text"
                value={solanaWallet}
                onChange={(e) => setSolanaWallet(e.target.value)}
                placeholder="Paste Phantom address for instant USDC payouts (e.g. 3sYWf...)"
                className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-400 select-all"
              />
            </div>

            {resultMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs font-mono text-rose-300">
                {resultMsg}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isPairing}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPairing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-slate-950" />}
                <span>{isPairing ? 'Pairing TV Screen...' : '⚡ Pair TV Screen Now'}</span>
              </button>

              {onOpenPitchDeck && (
                <button
                  type="button"
                  onClick={onOpenPitchDeck}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  📄 View Turnkey Venue Pitch Deck & Revenue Calculator
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
