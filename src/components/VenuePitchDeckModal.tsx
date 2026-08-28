import React, { useState } from 'react';
import {
  Tv,
  DollarSign,
  Zap,
  Printer,
  X,
  Sparkles,
  Building2,
  Users,
  CheckCircle2,
  QrCode,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck
} from 'lucide-react';

interface VenuePitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPairModal?: () => void;
}

export const VenuePitchDeckModal: React.FC<VenuePitchDeckModalProps> = ({
  isOpen,
  onClose,
  onOpenPairModal
}) => {
  const [dailyFootTraffic, setDailyFootTraffic] = useState<number>(500);
  const [screensCount, setScreensCount] = useState<number>(2);

  if (!isOpen) return null;

  // Revenue calculation model:
  // 1 screen = ~240 slots/hour active (15s rotations) * $0.05 - $0.25 avg CPM share
  // Estimated monthly revenue = screens * (dailyFootTraffic / 100) * $45
  const estimatedMonthlyDollars = Math.round(screensCount * (dailyFootTraffic / 100) * 45);
  const estimatedYearlyDollars = estimatedMonthlyDollars * 12;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border-2 border-amber-500/50 w-full max-w-4xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative my-8 print:border-0 print:bg-white print:text-black print:p-4">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 border border-amber-800 px-3 py-1 rounded-full uppercase">
              Turnkey Venue Partnership Kit
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HERO TITLE BLOCK */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-slate-950 font-black shadow-lg">
            <Building2 className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight print:text-black">
            Turn Your Idle Lobby & Venue TVs into <span className="text-amber-400 print:text-orange-600">Passive Revenue</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto print:text-gray-700">
            For Cafes, Gyms, Co-Working Lounges, Sports Bars, Hotels, and Hackathon Stages. Plug in any Smart TV in 60 seconds and start earning <strong>70% direct payouts</strong> from sponsors and autonomous AI agents 24/7.
          </p>
        </div>

        {/* 3 CORE VALUE PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 print:border-gray-300 print:bg-gray-50">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl w-fit font-black text-xs font-mono">
              01 • ZERO COST
            </div>
            <h3 className="text-sm font-black text-white uppercase print:text-black">No Hardware to Buy</h3>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Works on existing Smart TVs, Amazon Fire Sticks, Apple TV, Chromecasts, and Raspberry Pi via browser.
            </p>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 print:border-gray-300 print:bg-gray-50">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl w-fit font-black text-xs font-mono">
              02 • 70% REVENUE SHARE
            </div>
            <h3 className="text-sm font-black text-white uppercase print:text-black">Sub-Second Payouts</h3>
            <p className="text-xs text-slate-400 print:text-gray-600">
              70% of every 15-second sponsor bid lands directly into your Solana wallet or bank account in under 400ms.
            </p>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 print:border-gray-300 print:bg-gray-50">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl w-fit font-black text-xs font-mono">
              03 • BRAND SAFE
            </div>
            <h3 className="text-sm font-black text-white uppercase print:text-black">AI Content Filter</h3>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Every ad creative is pre-screened by Gemini Vision AI to ensure strict family-friendly, premium brand standards.
            </p>
          </div>
        </div>

        {/* INTERACTIVE VENUE REVENUE CALCULATOR */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border-2 border-cyan-500/40 rounded-3xl space-y-6 print:border-gray-400">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-black text-white uppercase print:text-black">
                Estimated Venue Revenue Calculator
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">70% Split Model</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1 print:text-black">
                  <span>Number of TV Screens:</span>
                  <span className="text-cyan-400 font-mono">{screensCount} Screens</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={screensCount}
                  onChange={(e) => setScreensCount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1 print:text-black">
                  <span>Estimated Daily Visitors / Foot-Traffic:</span>
                  <span className="text-amber-400 font-mono">{dailyFootTraffic.toLocaleString()} People/Day</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={dailyFootTraffic}
                  onChange={(e) => setDailyFootTraffic(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-center text-center space-y-1 print:bg-white print:border-gray-300">
              <span className="text-xs text-slate-400 uppercase font-bold font-mono">Estimated Monthly Earnings</span>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-300 to-emerald-400 font-mono print:text-green-700">
                ${estimatedMonthlyDollars.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-normal">/ mo</span>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold print:text-green-800">
                ≈ ${estimatedYearlyDollars.toLocaleString()} / year in passive revenue
              </span>
            </div>
          </div>
        </div>

        {/* 3-STEP SETUP GUIDE */}
        <div className="space-y-4">
          <h3 className="text-base font-black text-white uppercase text-center print:text-black">
            How to Set Up in 3 Minutes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 print:border-gray-300 print:bg-white">
              <span className="text-cyan-400 font-mono font-black">STEP 1</span>
              <h4 className="font-bold text-white uppercase print:text-black">Open TV Browser</h4>
              <p className="text-slate-400 print:text-gray-600">
                Open web browser on your TV or Fire Stick and navigate to <strong>livebillboards.lol/tv</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 print:border-gray-300 print:bg-white">
              <span className="text-amber-400 font-mono font-black">STEP 2</span>
              <h4 className="font-bold text-white uppercase print:text-black">Pair with 6-Digit PIN</h4>
              <p className="text-slate-400 print:text-gray-600">
                Scan the on-screen QR code or visit <strong>livebillboards.lol/pair</strong> on your phone.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 print:border-gray-300 print:bg-white">
              <span className="text-purple-400 font-mono font-black">STEP 3</span>
              <h4 className="font-bold text-white uppercase print:text-black">Receive Payouts 24/7</h4>
              <p className="text-slate-400 print:text-gray-600">
                Your screen is active. 70% of live sponsor revenue deposits automatically into your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pitch Deck (PDF)</span>
          </button>

          {onOpenPairModal && (
            <button
              onClick={() => {
                onClose();
                onOpenPairModal();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-slate-950" />
              <span>Pair a Smart TV Now (Enter 6-Digit PIN)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
