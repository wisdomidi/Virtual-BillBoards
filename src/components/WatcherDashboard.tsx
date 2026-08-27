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

        {/* Instant Action Prompt Bar */}
        <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Proof-of-Attention Verification</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">15s Live Cycle</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click the glowing radar target on the video or press the button to mine +25 Attention Points into your wallet.
              </p>
            </div>
          </div>

          <button
            onClick={handlePoATargetClick}
            disabled={poaMinedForSlot || !slotData?.winningAd}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              poaMinedForSlot
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{poaMinedForSlot ? 'Mined for this Ad ✅' : '⚡ Mine Attention Now (+25 Pts)'}</span>
          </button>
        </div>
      </div>

      {/* 3 CLEAR ACTION CARDS FOR WATCHERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: DIRECT CASH CONVERSION */}
        <div className="bg-slate-900/90 border-2 border-cyan-500/40 p-5 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">1. Cash Out</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">100 Points = $1.00 USD</span>
                </div>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
                REAL CASH
              </span>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-black text-cyan-300 font-mono">
                ${(viewerPoints * 0.01).toFixed(2)} <span className="text-xs text-slate-400 font-normal font-sans">USD</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your accumulated earnings from watching ads & solving attention prompts.
              </p>
            </div>
          </div>

          <button
            onClick={handleCashoutToWallet}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4 fill-slate-950" />
            <span>Withdraw Cash to Wallet</span>
          </button>
        </div>

        {/* CARD 2: 2X AD TOKEN POWER-UP */}
        <div className="bg-slate-900/90 border-2 border-indigo-500/40 p-5 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">2. 2x Ad Tokens</h3>
                  <span className="text-[10px] text-indigo-400 font-mono">+100% Value Bonus</span>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono font-bold">
                2X VALUE
              </span>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-black text-indigo-300 font-mono">
                ${(viewerPoints * 0.02).toFixed(2)} <span className="text-xs text-emerald-400 font-bold font-sans">Ad Credit</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Double your points to launch and broadcast your own billboard ads on screen.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (viewerPoints <= 0) {
                setCashoutMsg('⚠️ No Attention Points available to convert.');
                return;
              }
              const bonusTokens = viewerPoints * 20;
              onPointsEarned(-viewerPoints);
              setCashoutMsg(`🚀 Converted ${viewerPoints} Points to +${bonusTokens.toLocaleString()} Ad Tokens (2x value)!`);
              setTimeout(() => setCashoutMsg(null), 4000);
            }}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>Convert with 2x Power-Up</span>
          </button>
        </div>

        {/* CARD 3: DAILY PROGRESSIVE JACKPOT */}
        <div className="bg-slate-900/90 border-2 border-amber-500/40 p-5 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">3. Daily Jackpot</h3>
                  <span className="text-[10px] text-amber-400 font-mono">Draw: Midnight UTC</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                $100+ POT
              </span>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-black text-amber-400 font-mono">
                ${(100.00 + (viewerPoints * 0.05)).toFixed(2)} <span className="text-xs text-slate-400 font-normal font-sans">Live Pot</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your Tickets: <strong className="text-amber-300 font-mono">🎟️ {userGoldTickets} Tickets</strong> (5% of all live bids added to pot).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setUserGoldTickets((prev) => prev + 1);
              onPointsEarned(25);
              soundEffects.playKaChing();
              setCashoutMsg('🎟️ Claimed +1 Free Jackpot Ticket (+25 Points)!');
              setTimeout(() => setCashoutMsg(null), 3000);
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4 fill-slate-950" />
            <span>Claim +1 Daily Ticket (+25 Pts)</span>
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
