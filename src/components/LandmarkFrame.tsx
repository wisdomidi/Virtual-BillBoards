import React from 'react';
import { CITY_LANDMARKS } from '../data/seedAds';
import { Globe, Building2, Sparkles } from 'lucide-react';

interface LandmarkFrameProps {
  cityCode: string;
  cityName: string;
  children: React.ReactNode;
}

export const LandmarkFrame: React.FC<LandmarkFrameProps> = ({ cityCode, cityName, children }) => {
  const code = cityCode.toUpperCase();
  const landmarkInfo = CITY_LANDMARKS[code] || {
    landmarkName: `${cityName} Landmark Frame`,
    description: `Official digital billboard frame for ${cityName}`,
    svgKey: 'default',
    primaryColor: '#06b6d4'
  };

  const isGlobal = code === 'GLOBAL';

  return (
    <div className="relative group rounded-3xl p-1 sm:p-2 transition-all duration-500 bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Outer Landmark Neon Aura Glow */}
      <div 
        className="absolute -inset-1 rounded-3xl opacity-30 blur-xl transition-all duration-700 pointer-events-none group-hover:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${landmarkInfo.primaryColor}, #3b82f6, #000)`
        }}
      />

      {/* Top Landmark Title Bar Header */}
      <div className="relative z-20 bg-slate-950/90 border-b border-slate-800/80 px-4 py-2.5 rounded-t-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div 
            className="p-1.5 rounded-xl border flex items-center justify-center font-black shrink-0"
            style={{
              backgroundColor: `${landmarkInfo.primaryColor}15`,
              borderColor: `${landmarkInfo.primaryColor}50`,
              color: landmarkInfo.primaryColor
            }}
          >
            {isGlobal ? <Globe className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-black text-white tracking-wide uppercase flex items-center gap-2 flex-wrap">
              <span>{landmarkInfo.landmarkName}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {code}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans hidden sm:block">
              {landmarkInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
          <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 animate-pulse text-amber-300" />
            24/7 LIVE
          </span>
        </div>
      </div>

      {/* Main Billboard Container with Clean Modern Digital Frame */}
      <div className="relative z-10 bg-slate-950 rounded-b-2xl overflow-hidden border border-slate-800">
        {/* Clean Subtle Corner Accent Indicators */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none z-20" />

        {/* City Location Tag Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-20 opacity-90 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded-full font-black flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{cityName.toUpperCase()} DIGITAL SCREEN</span>
        </div>

        {/* Main Wrapped Screen Content */}
        {children}
      </div>
    </div>
  );
};
