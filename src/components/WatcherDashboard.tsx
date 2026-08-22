import React, { useState } from 'react';
import { ActiveBillboardSlot } from '../types';
import { LiveBillboard } from './LiveBillboard';
import { PayoutLedger } from './PayoutLedger';
import { SmartOverlay } from './SmartOverlay';
import { WatcherOnboardingTour } from './WatcherOnboardingTour';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

interface WatcherDashboardProps {
  viewerPoints: number;
  riskScore: number;
  userStatus: string;
  activeWatchSeconds: number;
  lastHeartbeatStatus: string;
  selectedCity: string;
  selectedCountry: string;
  onCityChange: (city: string, country: string) => void;
  slotData: ActiveBillboardSlot | null;
  onTriggerHeartbeat: () => void;
  onPointsEarned: (pts: number) => void;
  onOpenWalletModal: () => void;
  walletBalanceDollars: string;
}

export const WatcherDashboard: React.FC<WatcherDashboardProps> = ({
  viewerPoints,
  riskScore,
  userStatus,
  activeWatchSeconds,
  lastHeartbeatStatus,
  selectedCity,
  selectedCountry,
  onCityChange,
  slotData,
  onTriggerHeartbeat,
  onPointsEarned,
  onOpenWalletModal,
  walletBalanceDollars
}) => {
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(true);
  const [cashoutMsg, setCashoutMsg] = useState<string | null>(null);

  const earningsInDollars = (viewerPoints * 0.01).toFixed(2); // 100 points = $1.00
  const watchMins = Math.floor(activeWatchSeconds / 60);
  const watchSecs = activeWatchSeconds % 60;

  const handleCashoutToWallet = () => {
    if (viewerPoints <= 0) {
      setCashoutMsg('⚠️ No Watch Points available to convert.');
      return;
    }
    const bonusCents = viewerPoints; // 1 point = 1 cent
    onPointsEarned(-viewerPoints); // reset watch points
    setCashoutMsg(`🎉 Converted ${viewerPoints} Watch Points to +$${(bonusCents / 100).toFixed(2)} Ad Wallet credit!`);
    setTimeout(() => setCashoutMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Landing Header & Workflow Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-500/30 p-6 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Watcher Control Panel & Earn Hub
                </h1>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  Earn While You Watch
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Watch 24/7 global virtual billboard ads, complete human attention checks, and earn cash rewards in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{showWorkflowGuide ? 'Hide Workflow Guide' : 'How Watching Works'}</span>
            </button>
          </div>
        </div>

        {/* Watcher Onboarding Tour Component */}
        {showWorkflowGuide && (
          <div className="pt-2">
            <WatcherOnboardingTour
              onCompleteTour={() => setShowWorkflowGuide(false)}
              onDismiss={() => setShowWorkflowGuide(false)}
            />
          </div>
        )}
      </div>

      {/* Top Status Cards: Pending Payout Summary + Watcher Earnings & Human Verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Pending Payout Visual Summary Card */}
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-300">
                <Wallet className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Pending Session Payout
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              EST. EARNINGS
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-2">
              <span>${(viewerPoints * 0.01 + activeWatchSeconds * 0.0005).toFixed(2)}</span>
              <span className="text-xs text-slate-300 font-sans font-normal">USD</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Estimated rewards for active session watching ({watchMins}m {watchSecs}s)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold">Earn Rate</span>
              <div className="font-extrabold text-cyan-300">$3.00 / hr</div>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold">Streak Bonus</span>
              <div className="font-extrabold text-amber-300">1.25x Active</div>
            </div>
          </div>

          {/* Cashout Milestone Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>Next Auto-Payout Threshold</span>
              <span className="text-emerald-400">
                ${(viewerPoints * 0.01).toFixed(2)} / $1.00
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (viewerPoints / 100) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleCashoutToWallet}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Cash Out Pending Earnings to Wallet</span>
          </button>
        </div>

        {/* Card 2: Watcher Earnings Balance */}
        <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Watcher Earnings Balance
              </h3>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
              10 Pts = $0.10 USD
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-2">
                <span>{viewerPoints}</span>
                <span className="text-xs text-slate-400 font-normal">Watch Points</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <span>Est. Value:</span>
                <span>${earningsInDollars} USD</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400 font-mono">Current Session</div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{watchMins}m {watchSecs}s verified</span>
              </div>
            </div>
          </div>

          {cashoutMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-xl text-xs font-bold text-emerald-300 animate-fade-in">
              {cashoutMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleCashoutToWallet}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Convert to Ad Wallet</span>
            </button>

            <button
              onClick={onOpenWalletModal}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>View Ad Wallet (${walletBalanceDollars})</span>
            </button>
          </div>
        </div>

        {/* Card 2: Human Verification Status */}
        <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Human Verification Status
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {userStatus === 'verified_human' ? 'Verified Human' : userStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Verification Level</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                <span>Genuine Watcher</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Bot Risk Score</div>
              <div className="text-sm font-black text-white mt-0.5 font-mono">
                <span className={riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}>{riskScore}% Risk</span>
                <span className="text-[10px] text-slate-500 font-sans ml-1">(0% = ideal)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Heartbeat Status</div>
              <div className="text-xs font-mono text-cyan-300 mt-0.5 truncate max-w-[180px]">
                {lastHeartbeatStatus}
              </div>
            </div>

            <button
              onClick={onTriggerHeartbeat}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 shrink-0"
              title="Trigger client HMAC heartbeat check"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trigger Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Watch Stream with Smart City Overlay */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Live 24/7 Virtual Billboard Watch Stream
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Active Feed: <strong className="text-cyan-400">{selectedCity}</strong>
          </span>
        </div>

        {/* Live Billboard Stream with Watcher Role Settings */}
        <LiveBillboard
          slotData={slotData}
          selectedCity={selectedCity}
          selectedCountry={selectedCountry}
          onCityChange={onCityChange}
          viewerPoints={viewerPoints}
          isPureViewerMode={true}
          walletBalanceDollars={walletBalanceDollars}
          onOpenWalletModal={onOpenWalletModal}
        />
      </div>

      {/* Payout & Fraud Verification Ledger */}
      <div className="space-y-4">
        <PayoutLedger
          viewerPoints={viewerPoints}
          riskScore={riskScore}
          userStatus={userStatus}
          activeWatchSeconds={activeWatchSeconds}
          lastHeartbeatStatus={lastHeartbeatStatus}
          onPointsEarned={onPointsEarned}
          onTriggerHeartbeat={onTriggerHeartbeat}
        />
      </div>
    </div>
  );
};
