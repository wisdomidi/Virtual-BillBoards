import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  CheckCircle2,
  Tv,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Search,
  ExternalLink
} from 'lucide-react';
import { ToastMessage } from '../types';

interface ClaimUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCreator: (handle: string) => void;
  onOpenAuthModal: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const TRENDING_CREATORS = [
  { handle: 'elonmusk', name: 'Elon Musk', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200', tag: 'Tech & AI', earned: '$14,850' },
  { handle: 'mrbeast', name: 'MrBeast', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', tag: 'Entertainment', earned: '$42,300' },
  { handle: 'kaicenat', name: 'Kai Cenat', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', tag: 'Live Stream', earned: '$28,400' },
  { handle: 'ishowspeed', name: 'IShowSpeed', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', tag: 'Gaming & IRL', earned: '$31,200' },
  { handle: 'marquesbrownlee', name: 'MKBHD', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200', tag: 'Tech Reviews', earned: '$18,900' },
  { handle: 'naval', name: 'Naval Ravikant', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', tag: 'Philosophy', earned: '$9,200' }
];

export const ClaimUsernameModal: React.FC<ClaimUsernameModalProps> = ({
  isOpen,
  onClose,
  onSelectCreator,
  onOpenAuthModal,
  addToast
}) => {
  const [handleInput, setHandleInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanHandle = handleInput.trim().replace(/^@/, '').toLowerCase();

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanHandle) return;

    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setClaimSuccess(cleanHandle);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addToast({
        title: 'Billboard Handle Reserved!',
        message: `Your live billboard at livebillboards.lol/@${cleanHandle} is now active!`,
        type: 'success'
      });
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl text-slate-950 shadow-md">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  Claim Your Live Billboard Username
                </h3>
                <p className="text-xs text-slate-400">
                  Every celebrity, streamer & creator gets their own 24/7 billboard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin">
            {/* Input Reservation Box */}
            <form onSubmit={handleClaim} className="space-y-3">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                Enter your social media username:
              </label>

              <div className="flex items-center gap-2 bg-slate-950 border-2 border-cyan-500/50 p-1.5 rounded-2xl shadow-inner focus-within:border-cyan-400">
                <span className="pl-3 text-cyan-400 font-mono font-black text-sm">
                  livebillboards.lol/@
                </span>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => {
                    setHandleInput(e.target.value);
                    setClaimSuccess(null);
                  }}
                  placeholder="yourname"
                  className="w-full bg-transparent text-white font-mono font-bold text-sm focus:outline-none placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={!cleanHandle || isChecking}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isChecking ? 'Checking...' : 'Claim Handle'}</span>
                </button>
              </div>

              {claimSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>@{claimSuccess} is active! 80% revenue split enabled.</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectCreator(claimSuccess);
                      onClose();
                    }}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Billboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </form>

            {/* 80% Payout Advantage Banner */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/60 via-slate-950 to-slate-950 border border-indigo-500/40 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>Industry-Leading 80% Creator Payout</span>
                </span>
                <span className="text-emerald-400 font-mono">Instant Payouts</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Fans and sponsors bid to broadcast their message or meme on your billboard. You keep 80% of every dollar with zero extra setup.
              </p>
            </div>

            {/* Trending Creator Billboards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                <span className="uppercase">🔥 Trending Creator Billboards</span>
                <span className="text-[10px] text-cyan-400">Click to Explore</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TRENDING_CREATORS.map((c) => (
                  <button
                    key={c.handle}
                    onClick={() => {
                      onSelectCreator(c.handle);
                      onClose();
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 group-hover:border-cyan-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300 flex items-center gap-1">
                          <span>{c.name}</span>
                          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">@{c.handle}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-emerald-400 font-mono font-bold">{c.earned}</div>
                      <div className="text-[9px] text-slate-500">{c.tag}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Universal Stream Embed Compatible</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
