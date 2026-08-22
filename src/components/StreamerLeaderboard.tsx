import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Flame, ShieldCheck, DollarSign, Award, Zap, TrendingUp } from 'lucide-react';

export interface LeaderboardBidder {
  id: string;
  title: string;
  advertiserName: string;
  imageUrl?: string;
  targetCityCode: string;
  targetCountryCode: string;
  bidAmountCents: number;
  safetyScore?: number;
}

interface StreamerLeaderboardProps {
  selectedCity: string;
  selectedCountry: string;
  onQuickOutbid?: (recommendedBidDollars: string) => void;
}

export const StreamerLeaderboard: React.FC<StreamerLeaderboardProps> = ({
  selectedCity,
  selectedCountry,
  onQuickOutbid
}) => {
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardBidder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`/api/bids/queue?region=${selectedCity}`);
      if (res.ok) {
        const data = await res.json();
        const items: LeaderboardBidder[] = data.items || [];
        setLeaderboardItems(items.slice(0, 3));
      }
    } catch (e) {
      console.error('Failed to fetch streamer leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 space-y-4 font-mono text-xs shadow-2xl relative overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500" />

      {/* Leaderboard Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>Top 3 Real-Time Bidders</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                [{selectedCity}]
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Live Redis ZSET queue order with Framer Motion layout transitions
            </p>
          </div>
        </div>

        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
          LIVE AUCTION
        </span>
      </div>

      {/* Leaderboard Items Container with Framer Motion Layout Reordering */}
      {loading ? (
        <div className="p-6 text-center text-slate-500 space-y-2">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          <p>Syncing Top 3 Bidders...</p>
        </div>
      ) : leaderboardItems.length === 0 ? (
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-2xl text-center space-y-2">
          <Award className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-bold">No Active Bids in Queue for [{selectedCity}]</p>
          <p className="text-[11px] text-slate-500">Be the first to place a bid and claim Rank #1!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {leaderboardItems.map((item, index) => {
              const rank = index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;

              const dollars = (item.bidAmountCents / 100).toFixed(2);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 28
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                    isGold
                      ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.2)] text-amber-100'
                      : isSilver
                      ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 border ${
                        isGold
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30'
                          : isSilver
                          ? 'bg-slate-300 text-slate-950 border-white shadow-md'
                          : 'bg-amber-800 text-amber-100 border-amber-600'
                      }`}
                    >
                      {isGold ? <Crown className="w-5 h-5 text-slate-950 stroke-[2.5]" /> : `#${rank}`}
                    </div>

                    {/* Title & Advertiser */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white truncate text-xs">
                          {item.title}
                        </span>
                        {item.safetyScore && (
                          <span className="hidden sm:inline-flex bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                            {item.safetyScore}%
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{item.advertiserName}</span>
                        <span>•</span>
                        <span className="text-slate-500">{item.targetCityCode} Zone</span>
                      </div>
                    </div>
                  </div>

                  {/* Bid Amount & Quick Outbid Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold">Current Bid</div>
                      <div
                        className={`text-sm font-black flex items-center justify-end ${
                          isGold ? 'text-amber-400' : 'text-cyan-400'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
                        {dollars}
                      </div>
                    </div>

                    {/* Outbid Quick Trigger */}
                    {onQuickOutbid && (
                      <button
                        onClick={() => onQuickOutbid((parseFloat(dollars) + 1.00).toFixed(2))}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold rounded-lg transition-all text-[10px] flex items-center gap-1"
                        title={`Outbid rank #${rank} with $${(parseFloat(dollars) + 1.00).toFixed(2)}`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>+$1.00</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
