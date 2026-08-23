import React, { useState, useEffect } from 'react';
import { CityLeaderboardEntry } from '../types';
import {
  Flame,
  TrendingUp,
  Globe,
  Award,
  Zap,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronRight,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';

interface GlobalCityLeadersProps {
  currentSelectedCity: string;
  onSelectCity: (cityCode: string, countryCode: string) => void;
  className?: string;
}

export const GlobalCityLeaders: React.FC<GlobalCityLeadersProps> = ({
  currentSelectedCity,
  onSelectCity,
  className = ''
}) => {
  const [leaderboard, setLeaderboard] = useState<CityLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/cities/leaderboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Failed to load city leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 8000); // 8-second live sync
    return () => clearInterval(interval);
  }, []);

  const getHeatBadge = (heat: CityLeaderboardEntry['heatLevel']) => {
    switch (heat) {
      case 'volcanic':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-700/80 animate-pulse">
            <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>Volcanic High</span>
          </span>
        );
      case 'hot':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-700/80">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>High Volume</span>
          </span>
        );
      case 'warm':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>Trending</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
            <span>Active</span>
          </span>
        );
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                Global City Leaders
              </h2>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Live RTB Volume
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time leaderboard of metropolitan screens with the highest advertiser bidding liquidity
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchLeaderboard}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 text-xs font-mono"
          title="Refresh Live Leaderboard"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          {lastUpdated && <span className="text-[10px] text-slate-500 hidden sm:inline">Sync: {lastUpdated}</span>}
        </button>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading && leaderboard.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 animate-spin text-amber-400" />
          <span>Aggregating cross-city bidding liquidity...</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {leaderboard.map((city) => {
            const isCurrent = currentSelectedCity.toUpperCase() === city.cityCode.toUpperCase();
            return (
              <motion.div
                key={city.cityCode}
                whileHover={{ scale: 1.01 }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Rank + City Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 font-mono ${
                    city.rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : city.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : city.rank === 3
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    #{city.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{city.countryFlag}</span>
                        <span className="truncate">{city.cityName}</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60">
                          {city.cityCode}
                        </span>
                      </span>
                      {getHeatBadge(city.heatLevel)}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span>Top Ad: <strong className="text-slate-200">{city.topAdvertiserName}</strong> (${city.currentTopBidDollars.toFixed(2)})</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5 font-mono">
                        <TrendingUp className="w-3 h-3" />
                        +{city.volumeGrowthPercent}% 24h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Volume & One-Click Target Switch */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-black text-white font-mono flex items-center justify-end gap-1">
                      <span className="text-xs text-slate-400 font-normal">Vol:</span>
                      <span className="text-emerald-400">${city.totalVolumeDollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {city.totalBidsCount} total bids ({city.activeLiveAdsCount} live)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCity(city.cityCode, city.countryCode)}
                    disabled={isCurrent}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                    }`}
                    title={isCurrent ? 'Currently target city' : `Switch target to ${city.cityName}`}
                  >
                    <span>{isCurrent ? 'Selected' : 'Bid Here'}</span>
                    {!isCurrent && <ArrowUpRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Insight Banner */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Strategic Tip: High-volume cities yield greater footfall CPM reach, while rising cities offer lower floor prices.</span>
        </div>
      </div>
    </div>
  );
};
