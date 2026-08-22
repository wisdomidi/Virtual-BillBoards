import React, { useState } from 'react';
import { CASCADE_EXPLANATION } from '../data/blueprintData';
import {
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const CascadeSandbox: React.FC = () => {
  const [cityCode, setCityCode] = useState('KUL');
  const [countryCode, setCountryCode] = useState('MY');

  const [hasCityBids, setHasCityBids] = useState(false); // Default empty city to trigger fallback!
  const [hasCountryBids, setHasCountryBids] = useState(true);
  const [hasGlobalBids, setHasGlobalBids] = useState(true);

  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/cascade/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityCode,
          countryCode,
          forceEmptyCity: !hasCityBids,
          forceEmptyCountry: !hasCountryBids
        })
      });
      const data = await res.json();
      setSimResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Auction Fallback Cascade Algorithm Sandbox
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-Blank Guarantee: City Level [Tier 1] -&gt; Country Level [Tier 2] -&gt; Global Level [Tier 3] -&gt; House Default [Tier 0]
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs font-mono transition-all shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Execute Cascade Simulation</span>
        </button>
      </div>

      {/* Interactive Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Configure Queue Availability States:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Viewer Geofence */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2">
              Viewer Location
            </label>
            <select
              value={`${cityCode}:${countryCode}`}
              onChange={(e) => {
                const [c, cntry] = e.target.value.split(':');
                setCityCode(c);
                setCountryCode(cntry);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-cyan-400 font-bold font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="KUL:MY">🇲🇾 Kuala Lumpur, Malaysia</option>
              <option value="TYO:JP">🇯🇵 Tokyo, Japan</option>
              <option value="NYC:US">🇺🇸 New York, United States</option>
              <option value="LON:UK">🇬🇧 London, United Kingdom</option>
            </select>
          </div>

          {/* City Queue State Toggle */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">Tier 1: City Queue ({cityCode})</span>
              <button
                type="button"
                onClick={() => setHasCityBids(!hasCityBids)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  hasCityBids
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {hasCityBids ? 'ACTIVE BIDS (Available)' : 'EMPTY (0 Bids)'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {hasCityBids ? 'Will match highest city bid' : 'Forces fallback to Country Queue'}
            </p>
          </div>

          {/* Country Queue State Toggle */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">Tier 2: Country Queue ({countryCode})</span>
              <button
                type="button"
                onClick={() => setHasCountryBids(!hasCountryBids)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  hasCountryBids
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {hasCountryBids ? 'ACTIVE BIDS (Available)' : 'EMPTY (0 Bids)'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {hasCountryBids ? 'Will match country fallback bid' : 'Forces fallback to Global Queue'}
            </p>
          </div>
        </div>
      </div>

      {/* Simulation Execution Output */}
      {simResult && (
        <div className="bg-slate-900 border border-cyan-800/60 rounded-2xl p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-sm text-cyan-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Simulation Execution Log
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded text-xs font-bold">
              Latency: {simResult.fallbackChain.latencyMs}ms
            </span>
          </div>

          {/* Step Evaluation Visualizer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1 */}
            <div className={`p-4 rounded-xl border ${
              simResult.fallbackChain.cityHit ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>1. City Tier [{cityCode}]</span>
                {simResult.fallbackChain.cityHit ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
              </div>
              <p className="text-[11px]">
                {simResult.fallbackChain.cityHit ? 'WINNER ELECTED' : 'MISS: 0 Bids Found'}
              </p>
            </div>

            {/* Step 2 */}
            <div className={`p-4 rounded-xl border ${
              simResult.fallbackChain.countryHit ? 'bg-amber-950/60 border-amber-700 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>2. Country Tier [{countryCode}]</span>
                {simResult.fallbackChain.countryHit ? <CheckCircle2 className="w-4 h-4 text-amber-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
              </div>
              <p className="text-[11px]">
                {simResult.fallbackChain.countryHit ? 'FALLBACK WINNER ELECTED' : 'MISS: Skipped or Empty'}
              </p>
            </div>

            {/* Step 3 */}
            <div className={`p-4 rounded-xl border ${
              simResult.fallbackChain.globalHit ? 'bg-blue-950/60 border-blue-700 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>3. Global Tier [GLOBAL]</span>
                {simResult.fallbackChain.globalHit ? <CheckCircle2 className="w-4 h-4 text-blue-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
              </div>
              <p className="text-[11px]">
                {simResult.fallbackChain.globalHit ? 'GLOBAL WINNER ELECTED' : 'MISS: Empty'}
              </p>
            </div>

            {/* Step 4 */}
            <div className={`p-4 rounded-xl border ${
              simResult.fallbackChain.houseAdFallbackUsed ? 'bg-purple-950/60 border-purple-700 text-purple-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>4. House Default Ad</span>
                {simResult.fallbackChain.houseAdFallbackUsed ? <CheckCircle2 className="w-4 h-4 text-purple-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
              </div>
              <p className="text-[11px]">
                {simResult.fallbackChain.houseAdFallbackUsed ? 'ZERO-BLANK GUARD ACTIVATED' : 'BYPASSED'}
              </p>
            </div>
          </div>

          {/* Winner Banner Result */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
            <img src={simResult.winningAd.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg border border-slate-700" />
            <div>
              <div className="text-xs text-slate-400">Winning Ad Output:</div>
              <div className="text-sm font-bold text-white">{simResult.winningAd.title}</div>
              <div className="text-xs text-cyan-400 font-bold">
                Level: {simResult.fallbackLevel.toUpperCase()} | Bid: ${(simResult.winningAd.bidAmountCents / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Markdown */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Auction Fallback Cascade Algorithm Specification
        </h3>
        <pre className="text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800/80 overflow-x-auto leading-relaxed">
          {CASCADE_EXPLANATION}
        </pre>
      </div>
    </div>
  );
};
