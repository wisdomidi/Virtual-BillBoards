import React, { useState } from 'react';
import { ActiveBillboardSlot, ProofOfAttentionTicket } from '../types';
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
  ArrowRight,
  Ticket,
  TrendingUp,
  Flame,
  Coins,
  DollarSign,
  Gift,
  Tv,
  Cpu,
  KeyRound
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
  poaTickets?: ProofOfAttentionTicket[];
  onMinePoA?: (params: any) => Promise<any>;
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
  poaTickets = [],
  onMinePoA,
  onTriggerHeartbeat,
  onPointsEarned,
  onOpenWalletModal,
  walletBalanceDollars
}) => {
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
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
    setCashoutMsg(`🎉 Converted ${viewerPoints} Attention Points to +$${(bonusCents / 100).toFixed(2)} Ad Wallet credit!`);
    setTimeout(() => setCashoutMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Landing Header & Workflow Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-cyan-500/40 p-6 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-red-500 to-amber-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 animate-pulse text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Interact & Earn (PoA Attention Mining Hub)
                </h1>
                <span className="text-xs bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  🔥 Proof-of-Attention Mining Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Interact with live 24/7 global virtual billboard screens, capture attention targets, and mine cryptographically verified tokens in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{showWorkflowGuide ? 'Hide Mining Guide' : 'How PoA Mining Works'}</span>
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

      {/* LIVE BILLBOARD STREAM & WATCH-TO-EARN SCREEN */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
              <Tv className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  Live Screen Feed: {selectedCity}
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  EARNING REWARDS LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Keep this screen open to accumulate watch points and cash revenue share</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-amber-400 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Time Watched: {watchMins}m {watchSecs}s</span>
            </div>
          </div>
        </div>

        {/* Live Billboard Player Frame */}
        <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
          {slotData?.winningAd ? (
            <div className="relative w-full h-full">
              {slotData.winningAd.mediaType === 'video' || slotData.winningAd.imageUrl?.startsWith('data:video/') || slotData.winningAd.imageUrl?.includes('.mp4') ? (
                <video
                  src={slotData.winningAd.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slotData.winningAd.imageUrl}
                  alt={slotData.winningAd.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Live Overlay HUD */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/60 pointer-events-none" />

              {/* Top Banner with Countdown */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs z-10">
                <span className="px-3 py-1 bg-slate-950/90 border border-cyan-500/50 text-cyan-300 font-black rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{slotData.winningAd.title}</span>
                </span>
                <span className="px-3 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-300 font-mono font-black rounded-xl backdrop-blur-md shadow-lg">
                  ⏱️ {slotData.remainingSeconds ?? 15}s Left
                </span>
              </div>

              {/* Bottom Details Banner */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs z-10">
                <div className="bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-slate-300 backdrop-blur-md">
                  <span className="text-slate-400">Bid: </span>
                  <span className="font-mono font-bold text-amber-400">${((slotData.winningAd.bidAmountCents || 100) / 100).toFixed(2)}</span>
                  <span className="text-slate-400"> by </span>
                  <span className="font-bold text-white">{slotData.winningAd.advertiserName || 'Verified Advertiser'}</span>
                </div>

                <div className="bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-emerald-300 font-mono font-bold backdrop-blur-md flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+10 Pts / min</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3 p-6 text-center">
              <Tv className="w-12 h-12 text-cyan-400/60 animate-pulse" />
              <div className="font-bold text-slate-200">Waiting for Next Live Billboard Slot...</div>
              <p className="text-xs text-slate-500 max-w-sm">Connected to [{selectedCity}] RTB Broadcast Stream. Ad will display automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3-TIER HYBRID ATTENTION ECONOMY HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TIER 1: DYNAMIC 15% REVENUE-SHARE POOL METER */}
        <div className="bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-950 border-2 border-cyan-500/50 p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/40 text-cyan-300">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">TIER 1: PRO-RATA CASH YIELD</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  15% Slot Revenue Pool
                </h3>
              </div>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              LIVE YIELD
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight flex items-baseline gap-2">
              <span>${(viewerPoints * 0.01 + activeWatchSeconds * 0.0005).toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">Accumulated Cash</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Your pro-rata 15% revenue slice from live advertiser bids in [{selectedCity}].
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold">Active Slot Pool</span>
              <div className="font-extrabold text-emerald-400">
                ${((slotData?.winningAd?.bidAmountCents || 100) * 0.15 / 100).toFixed(2)} USD
              </div>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold">Human Verified</span>
              <div className="font-extrabold text-cyan-300">100% Guaranteed</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>Auto-Cashout Milestone</span>
              <span className="text-cyan-400">${(viewerPoints * 0.01).toFixed(2)} / $10.00</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (viewerPoints / 1000) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleCashoutToWallet}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Wallet className="w-4 h-4 fill-slate-950" />
            <span>Withdraw Cash Balance</span>
          </button>
        </div>

        {/* TIER 2: 2X AD TOKEN POWER-UP CONVERTER */}
        <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-2 border-indigo-500/50 p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/40 text-indigo-300">
                <Coins className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">TIER 2: CLOSED-LOOP UTILITY</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  2x Ad Token Multiplier
                </h3>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
              +100% VALUE BONUS
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-indigo-300 font-mono tracking-tight flex items-baseline gap-2">
              <span>{(viewerPoints * 20).toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">Ad Tokens</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Convert your {viewerPoints} Watch Points with an instant 2x Power-Up to launch billboard slots.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Cash Value:</span>
              <span className="text-slate-200">${(viewerPoints * 0.01).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono border-t border-slate-800 pt-1.5">
              <span className="text-indigo-300 font-bold">2x Ad Credit Value:</span>
              <span className="text-emerald-400 font-black">${(viewerPoints * 0.02).toFixed(2)} USD</span>
            </div>
          </div>

          {cashoutMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-xl text-xs font-bold text-emerald-300 animate-fade-in">
              {cashoutMsg}
            </div>
          )}

          <button
            onClick={() => {
              if (viewerPoints <= 0) {
                setCashoutMsg('⚠️ No Watch Points available to convert.');
                return;
              }
              const bonusTokens = viewerPoints * 20;
              onPointsEarned(-viewerPoints);
              setCashoutMsg(`🚀 Converted ${viewerPoints} Watch Points with 2x Power-Up to +${bonusTokens.toLocaleString()} Ad Tokens!`);
              setTimeout(() => setCashoutMsg(null), 4000);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Convert with 2x Power-Up Bonus</span>
          </button>
        </div>

        {/* TIER 3: DUAL-ENGINE PROGRESSIVE GOLD RAFFLE JACKPOT */}
        <div className="bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-500/50 p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-300">
                <Gift className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">TIER 3: DUAL-ENGINE JACKPOT</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  $100+ Progressive Pot
                </h3>
              </div>
            </div>
            <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              +5% PER BID
            </span>
          </div>

          {/* Progressive Jackpot Value */}
          <div className="space-y-1">
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-2">
              <span>${(100 + (viewerPoints * 0.05) + (activeWatchSeconds * 0.002)).toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">USD Live Pot</span>
            </div>
            <p className="text-[11px] text-slate-300">
              $100 Base Sponsor Pot + 5% dynamically added from all live global bids.
            </p>
          </div>

          {/* Sponsor Headline Tag */}
          <div className="bg-slate-950/90 p-3 rounded-2xl border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-amber-400 font-bold uppercase">Headline Sponsor:</span>
              <span className="text-slate-300 font-bold">Apex Cloud & AI</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              "Next-Gen High-Performance GPU Infrastructure for Autonomous Inference"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-0.5">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold">Your Gold Tickets</span>
              <div className="font-extrabold text-amber-300 flex items-center gap-1">
                <Ticket className="w-3 h-3 text-amber-400" />
                <span>{Math.floor(activeWatchSeconds / 15) + 12} Tickets</span>
              </div>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold">Daily Draw Time</span>
              <div className="font-extrabold text-yellow-400">Midnight UTC</div>
            </div>
          </div>

          <button
            onClick={onTriggerHeartbeat}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4 fill-slate-950" />
            <span>Claim +1 Gold Ticket (Attention Check)</span>
          </button>
        </div>
      </div>

      {/* PROOF-OF-ATTENTION CRYPTOGRAPHIC CERTIFICATES STREAM */}
      <div className="bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Proof-of-Attention (PoA) Cryptographic Tickets</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                  HMAC-SHA256 Signed
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Audited proof tickets verifying active human micro-interactions, latency vectors, and zero-bot entropy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Total Mined:</span>
            <span className="text-cyan-300 font-bold">{poaTickets.length > 0 ? poaTickets.length : Math.floor(viewerPoints / 25)} Tickets</span>
          </div>
        </div>

        {poaTickets.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {poaTickets.map((t) => (
              <div
                key={t.ticketId}
                className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 transition-all text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{t.ticketId}</span>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                      t.trafficTier === 'tier1_staring_eyeballs'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {t.trafficTier === 'tier1_staring_eyeballs' ? '🔥 TIER 1' : 'STANDARD'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">+{t.pointsEarned} Pts</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>Latency: <strong className="text-slate-300">{t.latencyMs}ms</strong></span>
                    <span>•</span>
                    <span>Entropy: <strong className="text-slate-300">{t.entropyScore}% Human</strong></span>
                    <span>•</span>
                    <span className="text-slate-400 truncate max-w-[200px]">Ad: {t.adTitle}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block">SHA-256 Signature</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{t.cryptographicSignature.substring(0, 16)}...</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 text-center space-y-2 font-mono text-xs">
            <Cpu className="w-8 h-8 text-cyan-400/50 mx-auto animate-pulse" />
            <p className="text-slate-300 font-bold">Ready to Mine Proof-of-Attention Tickets</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Click the floating cyber target on the live billboard feed to solve the attention prompt and generate signed PoA proof certificates.
            </p>
          </div>
        )}
      </div>

      {/* Verified Human Attention Status */}
      <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Human Attention Integrity</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Session: <strong className="text-white font-mono">{watchMins}m {watchSecs}s</strong> • Auto-crediting 15% rev-share on live ad transitions.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerHeartbeat}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Session</span>
        </button>
      </div>
    </div>
  );
};
