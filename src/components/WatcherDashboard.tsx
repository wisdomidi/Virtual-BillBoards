import React, { useState, useEffect } from 'react';
import { ActiveBillboardSlot, ProofOfAttentionTicket } from '../types';
import { LiveBillboard } from './LiveBillboard';
import { PayoutLedger } from './PayoutLedger';
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
  KeyRound,
  Target
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

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

  // PoA Floating Attention Target States
  const [poaTargetCoords, setPoaTargetCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [poaSpawnTime, setPoaSpawnTime] = useState<number>(Date.now());
  const [poaMinedForSlot, setPoaMinedForSlot] = useState<boolean>(false);
  const [poaMiningNotice, setPoaMiningNotice] = useState<string | null>(null);
  const [userGoldTickets, setUserGoldTickets] = useState<number>(() => {
    return Math.max(1, Math.floor(viewerPoints / 25));
  });

  const watchMins = Math.floor(activeWatchSeconds / 60);
  const watchSecs = activeWatchSeconds % 60;

  // Respawn PoA target on every new 15-second ad slot rotation
  useEffect(() => {
    setPoaMinedForSlot(false);
    setPoaSpawnTime(Date.now());
    const randX = Math.floor(25 + Math.random() * 50);
    const randY = Math.floor(25 + Math.random() * 45);
    setPoaTargetCoords({ x: randX, y: randY });
  }, [slotData?.slotId, slotData?.winningAd?.id]);

  const isTier1 = (slotData as any)?.trafficTier === 'tier1_staring_eyeballs' || (slotData?.winningAd as any)?.trafficTier === 'tier1_staring_eyeballs';

  // Handle PoA Attention Target Click
  const handlePoATargetClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (poaMinedForSlot || !slotData?.winningAd) return;

    const clickLatencyMs = Math.max(120, Date.now() - poaSpawnTime);
    soundEffects.playKaChing();
    setPoaMinedForSlot(true);

    const earned = isTier1 ? 50 : 25;
    onPointsEarned(earned);
    setUserGoldTickets((prev) => prev + 1);

    setPoaMiningNotice(isTier1 ? '🔥 +50 TIER 1 POINTS MINED!' : '💎 +25 ATTENTION POINTS MINED!');
    setTimeout(() => setPoaMiningNotice(null), 3000);

    if (onMinePoA) {
      try {
        await onMinePoA({
          slotId: slotData.slotId || `slot_${Date.now()}`,
          adId: slotData.winningAd.id,
          adTitle: slotData.winningAd.title,
          targetCityCode: selectedCity,
          trafficTier: isTier1 ? 'tier1_staring_eyeballs' : 'standard',
          interactionType: 'floating_pixel',
          clickVector: { x: poaTargetCoords.x, y: poaTargetCoords.y },
          latencyMs: clickLatencyMs
        });
      } catch (err) {
        console.warn('PoA mine error:', err);
      }
    }
  };

  const handleCashoutToWallet = () => {
    if (viewerPoints <= 0) {
      setCashoutMsg('⚠️ No Attention Points available to convert.');
      return;
    }
    const bonusCents = viewerPoints; // 1 point = 1 cent ($0.01)
    onPointsEarned(-viewerPoints); // reset watch points
    setCashoutMsg(`🎉 Converted ${viewerPoints} Attention Points to +$${(bonusCents / 100).toFixed(2)} Ad Wallet balance!`);
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
                  Interact & Earn (Proof-of-Attention Mining Hub)
                </h1>
                <span className="text-xs bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  🔥 Proof-of-Attention Mining Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Click the glowing attention targets on the live screen every 15 seconds to mine cryptographically signed rewards and revenue share.
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

      {/* LIVE BILLBOARD STREAM & PROOF-OF-ATTENTION MINING CANVAS */}
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
              <p className="text-xs text-slate-400">
                {poaMinedForSlot ? '✅ Target mined for this slot! Next target in next 15s ad rotation.' : '🎯 Click the glowing radar button on screen to mine points!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-amber-400 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Time Watched: {watchMins}m {watchSecs}s</span>
            </div>
          </div>
        </div>

        {/* Live Billboard Player Frame with Interactive PoA Target Overlay */}
        <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl group">
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

              {/* Top Banner with Countdown & Tier 1 Badge */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs z-10">
                <span className="px-3 py-1 bg-slate-950/90 border border-cyan-500/50 text-cyan-300 font-black rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{slotData.winningAd.title}</span>
                </span>

                <div className="flex items-center gap-2">
                  {isTier1 && (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-600 border border-amber-300 text-white font-mono font-black text-[10px] rounded-xl shadow-lg animate-pulse flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>TIER 1 (5X PAYOUT)</span>
                    </span>
                  )}
                  <span className="px-3 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-300 font-mono font-black rounded-xl backdrop-blur-md shadow-lg">
                    ⏱️ {slotData.remainingSeconds ?? 15}s Left
                  </span>
                </div>
              </div>

              {/* Interactive Proof-of-Attention (PoA) Floating Target Button */}
              {!poaMinedForSlot && (
                <button
                  type="button"
                  onClick={handlePoATargetClick}
                  className="absolute z-30 cursor-pointer group/poa transition-transform duration-300 hover:scale-125 focus:outline-none"
                  style={{
                    left: `${poaTargetCoords.x}%`,
                    top: `${poaTargetCoords.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={isTier1 ? '🔥 Tier 1 Prompt: Click to Mine +50 Points!' : '💎 Click to Mine +25 Points!'}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Concentric Attention Radar Rings */}
                    <span className={`absolute w-14 h-14 rounded-full animate-ping opacity-75 ${
                      isTier1 ? 'bg-amber-400/70' : 'bg-cyan-400/70'
                    }`} />
                    <span className={`absolute w-9 h-9 rounded-full animate-pulse opacity-90 ${
                      isTier1 ? 'bg-amber-500/80' : 'bg-cyan-500/80'
                    }`} />

                    {/* PoA Target Core */}
                    <div className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all ${
                      isTier1
                        ? 'bg-amber-500 text-slate-950 border-white shadow-amber-500/80 animate-bounce'
                        : 'bg-cyan-400 text-slate-950 border-white shadow-cyan-400/80'
                    }`}>
                      <Sparkles className="w-4 h-4 fill-current animate-spin" style={{ animationDuration: '4s' }} />
                    </div>

                    {/* Floating Tooltip Pill */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 backdrop-blur-md border border-amber-400/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-2xl pointer-events-none flex items-center gap-1">
                      <span>{isTier1 ? '🔥 MINE +50 PTS' : '💎 MINE +25 PTS'}</span>
                    </div>
                  </div>
                </button>
              )}

              {/* Floating PoA Mining Celebratory Notice */}
              {poaMiningNotice && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce font-mono">
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>{poaMiningNotice}</span>
                </div>
              )}

              {/* Bottom Details Banner */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs z-10">
                <div className="bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-slate-300 backdrop-blur-md flex items-center gap-2">
                  <span className="text-slate-400">Bid: </span>
                  <span className="font-mono font-bold text-amber-400">${((slotData.winningAd.bidAmountCents || 100) / 100).toFixed(2)}</span>
                  <span className="text-slate-400"> by </span>
                  <span className="font-bold text-white">{slotData.winningAd.advertiserName || 'Verified Advertiser'}</span>
                </div>

                <div className="bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-emerald-300 font-mono font-bold backdrop-blur-md flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{viewerPoints} Points Mined</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3 p-6 text-center">
              <Tv className="w-12 h-12 text-cyan-400/60 animate-pulse" />
              <div className="font-bold text-slate-200">Waiting for Next Live Billboard Slot...</div>
              <p className="text-xs text-slate-500 max-w-sm">Connected to [{selectedCity}] RTB Broadcast Stream. Ad and mining target will display automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3-TIER REVENUE & TOKEN CONVERSION HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TIER 1: DYNAMIC 15% REVENUE-SHARE POOL */}
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
              <span>${(viewerPoints * 0.01).toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">Accumulated Cash</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Your direct 15% revenue share from active advertiser bids in [{selectedCity}].
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
              <span className="text-[10px] text-slate-400 font-bold">PoA Verified</span>
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
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4 fill-slate-950" />
            <span>Withdraw to Ad Wallet</span>
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
              Convert your {viewerPoints} Attention Points with an instant 2x Power-Up to launch billboard slots.
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
                setCashoutMsg('⚠️ No Attention Points available to convert.');
                return;
              }
              const bonusTokens = viewerPoints * 20;
              onPointsEarned(-viewerPoints);
              setCashoutMsg(`🚀 Converted ${viewerPoints} Attention Points with 2x Power-Up to +${bonusTokens.toLocaleString()} Ad Tokens!`);
              setTimeout(() => setCashoutMsg(null), 4000);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              <span>${(100.00 + (viewerPoints * 0.05)).toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">USD Live Pot</span>
            </div>
            <p className="text-[11px] text-slate-300">
              $100 Base Sponsor Pot + 5% dynamically added from all live global bids.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Current Top Bid:</span>
              <span className="text-emerald-400 font-bold">${((slotData?.winningAd?.bidAmountCents || 100) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Your Gold Tickets:</span>
              <span className="text-amber-400 font-bold">🎟️ {userGoldTickets} Tickets</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono border-t border-slate-800 pt-1.5">
              <span className="text-slate-400">Daily Draw Time:</span>
              <span className="text-white font-bold">Midnight UTC</span>
            </div>
          </div>

          <button
            onClick={() => {
              setUserGoldTickets((prev) => prev + 1);
              onPointsEarned(25);
              soundEffects.playKaChing();
              setCashoutMsg('🎟️ Claimed +1 Gold Ticket (+25 Attention Points)!');
              setTimeout(() => setCashoutMsg(null), 3000);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4 fill-slate-950" />
            <span>Claim +1 Gold Ticket (Attention Check)</span>
          </button>
        </div>
      </div>

      {/* Payout Micro-Settlement Ledger */}
      <PayoutLedger
        viewerPoints={viewerPoints}
        activeWatchSeconds={activeWatchSeconds}
        selectedCity={selectedCity}
        poaTickets={poaTickets}
      />
    </div>
  );
};
