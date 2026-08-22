import React, { useState, useEffect } from 'react';
import { useLocalContext } from '../context/LocalContext';
import { getCityHeadlines } from '../utils/newsFetcher';
import { CloudSun, Car, Newspaper, ChevronDown, ChevronUp, Sparkles, MapPin, RefreshCw, Activity } from 'lucide-react';

interface SmartOverlayProps {
  cityCode: string;
  cityName: string;
  className?: string;
}

export const SmartOverlay: React.FC<SmartOverlayProps> = ({
  cityCode,
  cityName,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { update, lastUpdatedTime, isRefreshing, refreshLocalContext } = useLocalContext();
  const [activeRoadIdx, setActiveRoadIdx] = useState(0);
  const [tempOffset, setTempOffset] = useState(0);

  const code = cityCode.toUpperCase();
  const cityHeadlines = getCityHeadlines(code);
  const roadsList = update.traffic.roads || [];

  // Cycle through different roads every 3.5 seconds
  useEffect(() => {
    if (!roadsList.length) return;
    const roadTimer = setInterval(() => {
      setActiveRoadIdx((prev) => (prev + 1) % roadsList.length);
    }, 3500);
    return () => clearInterval(roadTimer);
  }, [roadsList.length, cityCode]);

  // Micro-fluctuate temperature every 4 seconds
  useEffect(() => {
    const tempTimer = setInterval(() => {
      setTempOffset((Math.random() * 0.8 - 0.4));
    }, 4000);
    return () => clearInterval(tempTimer);
  }, [cityCode]);

  const activeRoad = roadsList[activeRoadIdx] || {
    roadName: update.traffic.mainCorridor,
    status: update.traffic.status,
    congestionPercent: update.traffic.status === 'Heavy' ? 85 : update.traffic.status === 'Moderate' ? 50 : 20,
    avgSpeedKmH: update.traffic.avgSpeedKmH,
    color: update.traffic.color
  };

  const dynamicTemp = (update.weather.tempC + tempOffset).toFixed(1);

  return (
    <div className={`z-30 transition-all duration-300 ${className}`}>
      {/* Dynamic Keyframes for Marquee Animation */}
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-continuous {
          display: flex;
          width: max-content;
          animation: marqueeScroll 25s linear infinite;
        }
        .animate-marquee-continuous:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-white overflow-hidden">
        {/* Top Control Strip */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] font-black tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              SMART CITY OVERLAY
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{cityName}</span>
              <span className="text-[10px] text-slate-400 font-mono">[{code}]</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshLocalContext}
              disabled={isRefreshing}
              className="p-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px] font-mono"
              title="Refresh local weather, news & traffic context"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-slate-400">Sync Context</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px] font-mono"
              title={isExpanded ? 'Minimize overlay' : 'Expand overlay'}
            >
              <span className="hidden sm:inline text-[10px] uppercase font-bold text-slate-400">
                {isExpanded ? 'Compact' : 'Expand'}
              </span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Real-Time City Local Insights Content */}
        {isExpanded ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800/60 pb-1">
              <span>📍 REAL-TIME LOCAL INSIGHTS FOR {cityName.toUpperCase()}</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE UPDATES ({lastUpdatedTime})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              {/* Weather Temperature Card with Dynamic Fluctuation */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm relative overflow-hidden">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-lg shrink-0">
                  {update.weather.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400 tracking-wide">
                    <span className="flex items-center gap-1">
                      <CloudSun className="w-3 h-3 text-amber-300 animate-bounce" /> Dynamic Weather
                    </span>
                    <span className="bg-amber-950 text-amber-300 border border-amber-800/80 px-1.5 rounded text-[8px] font-mono animate-pulse">
                      LIVE
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs font-mono flex items-center gap-1 mt-0.5">
                    <span className="text-amber-300 font-extrabold text-sm">{dynamicTemp}°C</span>
                    <span className="text-slate-300 font-sans text-[11px]">({update.weather.condition})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>Humidity: {update.weather.humidity}</span>
                    <span className="text-amber-400 text-[9px] font-mono">Micro-Synced</span>
                  </div>
                </div>
              </div>

              {/* Traffic Congestion Level Card with Rotating Roads */}
              <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm relative overflow-hidden">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Car className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-cyan-400 tracking-wide">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-300 animate-pulse" /> Road Traffic Updates
                    </span>
                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-1.5 rounded text-[8px] font-mono">
                      ROAD {activeRoadIdx + 1}/{roadsList.length || 1}
                    </span>
                  </div>

                  <div className="font-bold text-xs font-mono flex items-center justify-between mt-0.5" style={{ color: activeRoad.color }}>
                    <span className="truncate max-w-[130px]">{activeRoad.roadName}</span>
                    <span className="font-mono text-[10px] bg-slate-950 px-1 rounded border border-slate-800">
                      {activeRoad.status} ({activeRoad.avgSpeedKmH} km/h)
                    </span>
                  </div>

                  {/* Congestion Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700 ease-out rounded-full"
                      style={{
                        width: `${activeRoad.congestionPercent}%`,
                        backgroundColor: activeRoad.color
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Animated Continuous News Marquee Ticker Card */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2 shadow-sm md:col-span-1 overflow-hidden relative">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 z-10 bg-slate-900">
                  <Newspaper className="w-4 h-4 animate-bounce" />
                </div>
                <div className="overflow-hidden flex-1 relative">
                  <div className="text-[9px] font-black uppercase text-emerald-400 tracking-wider mb-0.5 flex items-center gap-1">
                    <span>LIVE CITY NEWS TICKER</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1 rounded text-[8px]">
                      ANIMATED
                    </span>
                  </div>
                  {/* Marquee Container */}
                  <div className="overflow-hidden w-full">
                    <div className="animate-marquee-continuous flex items-center gap-6 text-[11px] font-semibold text-slate-100">
                      {[...cityHeadlines, ...cityHeadlines].map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2 whitespace-nowrap shrink-0">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {h.category}
                          </span>
                          <span>{h.headline}</span>
                          <span className="text-emerald-500 text-xs font-black">★</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Minimized Compact Bar with Dynamic Road & Weather */
          <div className="flex items-center justify-between gap-3 text-xs overflow-hidden py-0.5">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-amber-300 text-sm">{update.weather.icon}</span>
              <span className="font-bold font-mono">{dynamicTemp}°C</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold font-mono text-[11px]" style={{ color: activeRoad.color }}>
                [{activeRoad.roadName}] {activeRoad.status} ({activeRoad.avgSpeedKmH} km/h)
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-hidden flex-1 relative">
              <span className="bg-emerald-950 text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 z-10 bg-slate-900">
                LIVE NEWS
              </span>
              <div className="overflow-hidden w-full">
                <div className="animate-marquee-continuous flex items-center gap-6 text-[11px] text-slate-300">
                  {[...cityHeadlines, ...cityHeadlines].map((h, idx) => (
                    <span key={idx} className="whitespace-nowrap shrink-0 font-medium">
                      [{h.category}] {h.headline} •
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

