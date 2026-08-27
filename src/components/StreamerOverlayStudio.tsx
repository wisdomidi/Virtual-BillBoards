import React, { useState, useEffect } from 'react';
import { GameStateEventType, OverlayLayoutType, StreamerGameStateEvent } from '../types';
import {
  Tv,
  Radio,
  Zap,
  Copy,
  Check,
  Play,
  Flame,
  Trophy,
  Crown,
  Sparkles,
  ExternalLink,
  Code,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Settings,
  HelpCircle,
  Monitor,
  Volume2,
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

interface StreamerOverlayStudioProps {
  initialHandle?: string;
  selectedCity?: string;
}

export const StreamerOverlayStudio: React.FC<StreamerOverlayStudioProps> = ({
  initialHandle = 'creator',
  selectedCity = 'GLOBAL'
}) => {
  const [handle, setHandle] = useState<string>(() => {
    return localStorage.getItem('vb_streamer_handle') || initialHandle;
  });

  const [layout, setLayout] = useState<OverlayLayoutType>('corner_pip');
  const [theme, setTheme] = useState<'cyberpunk' | 'neon' | 'gold' | 'minimal' | 'glass'>('cyberpunk');
  const [transparent, setTransparent] = useState<boolean>(true);
  const [audio, setAudio] = useState<boolean>(true);
  const [eventsEnabled, setEventsEnabled] = useState<boolean>(true);
  const [showQr, setShowQr] = useState<boolean>(true);
  const [showTicker, setShowTicker] = useState<boolean>(true);
  const [cityCode, setCityCode] = useState<string>(selectedCity);

  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedSdk, setCopiedSdk] = useState<boolean>(false);
  const [simulatingEvent, setSimulatingEvent] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const [streamerStats, setStreamerStats] = useState({
    totalImpressions: 14820,
    totalEventsTriggered: 64,
    totalEarnedDollars: '148.50',
    unclaimedEarningsDollars: '42.80',
    revShareRate: '70%'
  });

  const [recentEvents, setRecentEvents] = useState<StreamerGameStateEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'url_builder' | 'simulator' | 'sdk_guide' | 'earnings'>('url_builder');

  const cleanHandle = (handle || 'creator').replace(/^@/, '').toLowerCase().trim();

  // Construct URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.livebillboards.lol';
  const overlayUrl = `${origin}/overlay?creator=${cleanHandle}&layout=${layout}&theme=${theme}&transparent=${transparent}&audio=${audio}&events=${eventsEnabled}&qr=${showQr}&ticker=${showTicker}&city=${cityCode}`;

  const recommendedDimensions = {
    corner_pip: { width: 480, height: 270, label: '480 × 270 (16:9 Corner Box)' },
    bottom_ticker: { width: 1920, height: 60, label: '1920 × 60 (Esports Bottom Ticker)' },
    side_dock: { width: 360, height: 640, label: '360 × 640 (9:16 Vertical Dock)' },
    event_alert_only: { width: 1920, height: 1080, label: '1920 × 1080 (Transparent Full Alert Canvas)' },
    full_takeover: { width: 1920, height: 1080, label: '1920 × 1080 (1080p Full Intermission Screen)' }
  }[layout];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleSaveHandle = (val: string) => {
    const clean = val.replace(/^@/, '').toLowerCase().trim();
    setHandle(clean);
    localStorage.setItem('vb_streamer_handle', clean);
  };

  // Fetch streamer stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/streamer/stats/${cleanHandle}`);
      if (res.ok) {
        const data = await res.json();
        if (data.streamer) {
          setStreamerStats(prev => ({
            ...prev,
            totalImpressions: data.streamer.totalImpressions || prev.totalImpressions,
            totalEarnedDollars: data.streamer.totalEarnedDollars || prev.totalEarnedDollars
          }));
        }
      }

      const eventsRes = await fetch(`/api/overlay/events?streamerId=${cleanHandle}&limit=5`);
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        if (data.events) {
          setRecentEvents(data.events);
        }
      }
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    fetchStats();
  }, [cleanHandle]);

  // Game-State Simulation Trigger
  const handleTriggerSimulation = async (eventType: GameStateEventType) => {
    setSimulatingEvent(true);
    setSimulationResult(null);

    const eventPayloads: Record<GameStateEventType, any> = {
      victory_royale: {
        eventType: 'victory_royale',
        gameTitle: 'Fortnite / Warzone',
        headline: `👑 VICTORY ROYALE SPONSORED BY APEX GPU!`,
        subheadline: `Use code "${cleanHandle.toUpperCase()}" for 20% off cloud GPU compute`,
        sponsorName: 'Apex Cloud & AI',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 10.00,
        customVfx: 'victory_gold',
        particlesEmoji: '👑'
      },
      kill_streak: {
        eventType: 'kill_streak',
        gameTitle: 'Valorant / CS2',
        headline: `🔥 5X RAMPAGE KILL STREAK TAKEOVER!`,
        subheadline: `High-performance zero-lag mechanical keyboards`,
        sponsorName: 'CyberSwitch Pro',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🔥'
      },
      ace_clutch: {
        eventType: 'ace_clutch',
        gameTitle: 'Counter-Strike 2',
        headline: `🎯 1v5 CLUTCH ACE SPONSORED BY RED BULL ENERGY!`,
        subheadline: `Gives You Wings • Power up your competitive clutch`,
        sponsorName: 'Red Bull Energy',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 15.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⚡'
      },
      sub_hype_bomb: {
        eventType: 'sub_hype_bomb',
        gameTitle: 'Twitch / Kick Stream',
        headline: `💥 50 GIFTED SUBS HYPE BOMB!`,
        subheadline: `Massive community raid powered by LiveBillboards.lol`,
        sponsorName: 'HyperChat AI',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 8.00,
        customVfx: 'neon_burst',
        particlesEmoji: '💎'
      },
      boss_defeated: {
        eventType: 'boss_defeated',
        gameTitle: 'Elden Ring / MMORPG',
        headline: `🏆 MYTHIC BOSS DEFEATED TAKEOVER!`,
        subheadline: `Sponsor: Mythic Guild Gaming`,
        sponsorName: 'Mythic Guild',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'victory_gold',
        particlesEmoji: '⚔️'
      },
      tournament_champion: {
        eventType: 'tournament_champion',
        gameTitle: 'Esports Championship',
        headline: `🥇 TOURNAMENT CHAMPION SPONSORED BY INTEL!`,
        subheadline: `Grand Finals Champion Victory Celebration`,
        sponsorName: 'Intel Gaming',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 25.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🏆'
      },
      level_up: {
        eventType: 'level_up',
        gameTitle: 'RPG Gaming',
        headline: `⭐ LEVEL UP SPONSORED TAKEOVER!`,
        subheadline: `Sponsor: LevelUp Snacks`,
        sponsorName: 'LevelUp Snacks',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 3.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⭐'
      },
      game_over: {
        eventType: 'game_over',
        gameTitle: 'GG / Match Over',
        headline: `🎮 GG WP MATCH SPONSORED TAKEOVER!`,
        subheadline: `Next round starts soon`,
        sponsorName: 'GamerFuel',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 4.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🎮'
      },
      custom_event: {
        eventType: 'custom_event',
        gameTitle: 'Live Gaming',
        headline: `⚡ CUSTOM SPONSORED EVENT TAKEOVER!`,
        subheadline: `70% Rev-Share Paid Instantly`,
        sponsorName: 'WebMCP Agent',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'neon_burst',
        particlesEmoji: '🚀'
      }
    };

    const payload = {
      streamerId: cleanHandle,
      ...eventPayloads[eventType]
    };

    try {
      const res = await fetch('/api/overlay/trigger-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        soundEffects.playKaChing();
        setSimulationResult(`🎉 Broadcasted "${payload.headline}"! Earned +$${data.streamerRevShareDollars} (70% rev-share).`);
        fetchStats();
      } else {
        setSimulationResult(`⚠️ ${data.error || 'Simulation failed'}`);
      }
    } catch (err: any) {
      setSimulationResult(`⚠️ Error: ${err.message}`);
    } finally {
      setSimulatingEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-cyan-500/40 p-6 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Tv className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Streamer & Event Overlay Studio
                </h1>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  ⚡ 70% Creator Rev-Share Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Monetize your Twitch, YouTube, Kick, and tournament live streams with context-aware game-state ad takeovers and whitelabel OBS overlays.
              </p>
            </div>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/90 border border-emerald-500/40 px-4 py-2 rounded-2xl font-mono text-xs flex items-center gap-2.5 shadow-xl">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Your Creator Earnings</span>
                <span className="text-sm font-black text-emerald-400 font-mono">${streamerStats.totalEarnedDollars} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 gap-1 text-xs font-bold flex-wrap">
          <button
            onClick={() => setActiveTab('url_builder')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url_builder'
                ? 'bg-cyan-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. OBS / Streamlabs URL Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>2. Game-State Trigger Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('sdk_guide')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sdk_guide'
                ? 'bg-indigo-500 text-white font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>3. Game Engine & Webhook SDK</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 1: OBS / STREAMLABS URL BUILDER & CUSTOMIZER */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'url_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Overlay Customization & Presets</span>
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                Drag-and-Drop in OBS (30s Setup)
              </span>
            </div>

            {/* Creator Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                <span>Creator Username / Channel ID:</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => handleSaveHandle(e.target.value)}
                  placeholder="your_channel_name"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Layout Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono">
                Select OBS Layout Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono font-bold">
                {[
                  { id: 'corner_pip', label: '16:9 Corner PIP', desc: '480 × 270 Box' },
                  { id: 'bottom_ticker', label: 'Esports Ticker', desc: '1920 × 60 Strip' },
                  { id: 'side_dock', label: 'Side Dock', desc: '360 × 640 Vertical' },
                  { id: 'event_alert_only', label: 'Alert Only', desc: 'Invisible until event' },
                  { id: 'full_takeover', label: 'Full Takeover', desc: '1920 × 1080 Intermission' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLayout(item.id as OverlayLayoutType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      layout === item.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono">
                Visual Aesthetic Theme:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono font-bold">
                {[
                  { id: 'cyberpunk', label: 'Cyber Neon', border: 'border-cyan-500' },
                  { id: 'neon', label: 'Synthwave', border: 'border-fuchsia-500' },
                  { id: 'gold', label: 'Gold Champ', border: 'border-amber-400' },
                  { id: 'minimal', label: 'Minimalist', border: 'border-slate-400' },
                  { id: 'glass', label: 'Hyper Glass', border: 'border-cyan-300' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === item.id
                        ? `bg-slate-800 ${item.border} text-white shadow ring-1 ${item.border}`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <label className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono font-bold text-slate-300">Alpha Transparency</span>
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono font-bold text-slate-300">Audio Fanfare Alerts</span>
                <input
                  type="checkbox"
                  checked={audio}
                  onChange={(e) => setAudio(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono font-bold text-slate-300">Game Events Trigger</span>
                <input
                  type="checkbox"
                  checked={eventsEnabled}
                  onChange={(e) => setEventsEnabled(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>
            </div>

            {/* Ready Browser Source URL Output */}
            <div className="bg-slate-950 border-2 border-cyan-500/50 p-4 rounded-2xl space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" />
                  <span>Your OBS / Streamlabs Browser Source URL:</span>
                </span>
                <span className="text-slate-400 text-[10px]">{recommendedDimensions.label}</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={overlayUrl}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono truncate select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>

              {/* 30-second OBS Quick Steps */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-white flex items-center gap-1">
                  <span>⚡ 30-Second OBS Studio Setup:</span>
                </div>
                <p>1. In OBS, click <strong>Sources (+)</strong> → Add <strong>Browser</strong>.</p>
                <p>2. Paste URL above, set Width: <strong className="text-cyan-300 font-mono">{recommendedDimensions.width}</strong>, Height: <strong className="text-cyan-300 font-mono">{recommendedDimensions.height}</strong>.</p>
                <p>3. Check <strong>"Control audio via OBS"</strong> & <strong>"Shutdown source when not visible"</strong>. Done!</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview Frame (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Live Overlay Preview</h3>
                </div>
                <a
                  href={overlayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Preview Canvas Window */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
                <iframe
                  src={overlayUrl}
                  title="OBS Overlay Preview"
                  className="w-full h-full border-0 pointer-events-auto"
                />
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Active Creator:</span>
                  <span className="text-white font-bold">@{cleanHandle}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>WebSocket Feed:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Rev-Share Split:</span>
                  <span className="text-amber-300 font-bold">70% Streamer / 30% Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 2: GAME-STATE TRIGGER SIMULATOR (TEST VICTORY / KILL STREAKS) */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Game-State Event Takeover Simulator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any game event button below to test how sponsor takeovers trigger in real-time on your live OBS overlay.
              </p>
            </div>
          </div>

          {simulationResult && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/60 rounded-2xl text-xs font-mono font-bold text-amber-200 animate-in fade-in flex items-center justify-between">
              <span>{simulationResult}</span>
              <button onClick={() => setSimulationResult(null)} className="text-slate-400 hover:text-white cursor-pointer">×</button>
            </div>
          )}

          {/* Trigger Event Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                type: 'victory_royale' as GameStateEventType,
                icon: Trophy,
                title: '🏆 Victory Royale Takeover',
                sponsor: 'Apex Cloud & AI ($10.00)',
                color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/50 text-amber-300'
              },
              {
                type: 'kill_streak' as GameStateEventType,
                icon: Flame,
                title: '🔥 5x Rampage Kill Streak',
                sponsor: 'CyberSwitch Pro ($5.00)',
                color: 'from-red-500/20 to-rose-600/20 border-rose-500/50 text-rose-300'
              },
              {
                type: 'ace_clutch' as GameStateEventType,
                icon: Crown,
                title: '🎯 1v5 ACE Clutch Takeover',
                sponsor: 'Red Bull Energy ($15.00)',
                color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/50 text-purple-300'
              },
              {
                type: 'sub_hype_bomb' as GameStateEventType,
                icon: Sparkles,
                title: '💥 50 Sub Hype Train Bomb',
                sponsor: 'HyperChat AI ($8.00)',
                color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-cyan-300'
              },
              {
                type: 'boss_defeated' as GameStateEventType,
                icon: Swords,
                title: '⚔️ Mythic Boss Defeated',
                sponsor: 'Mythic Guild ($5.00)',
                color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/50 text-emerald-300'
              },
              {
                type: 'tournament_champion' as GameStateEventType,
                icon: Trophy,
                title: '🥇 Tournament Grand Champion',
                sponsor: 'Intel Gaming ($25.00)',
                color: 'from-amber-500/30 to-yellow-500/30 border-yellow-400 text-yellow-300'
              }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.type}
                  className={`p-4 rounded-2xl border bg-gradient-to-br ${card.color} flex flex-col justify-between gap-3 shadow-lg`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 animate-bounce" />
                      <h3 className="text-sm font-black text-white">{card.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">{card.sponsor}</p>
                  </div>

                  <button
                    type="button"
                    disabled={simulatingEvent}
                    onClick={() => handleTriggerSimulation(card.type)}
                    className="w-full py-2 bg-slate-950/80 hover:bg-slate-950 border border-white/20 hover:border-white/40 text-white font-black text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Fire Event Takeover</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 3: GAME ENGINE & WEBHOOK SDK GUIDE */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'sdk_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                <Code className="w-5 h-5 text-indigo-400" />
                <span>Game Engine Webhooks & WebMCP Autonomous Bidding</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Connect live telemetry from CS2, Valorant, Fortnite, Discord bots, or autonomous AI agents directly to your overlay.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REST API & Webhook Format */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <span>1. REST Webhook Endpoint (POST /api/overlay/trigger-event)</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px] overflow-x-auto">
{`curl -X POST https://www.livebillboards.lol/api/overlay/trigger-event \\
  -H "Content-Type: application/json" \\
  -d '{
    "streamerId": "${cleanHandle}",
    "eventType": "victory_royale",
    "headline": "⚡ VICTORY ROYALE SPONSORED BY APEX GPU!",
    "sponsorName": "Apex Cloud & AI",
    "sponsorImageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    "bidAmountDollars": 10.00
  }'`}
              </pre>
            </div>

            {/* WebMCP Tool for Autonomous AI Agents */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>2. WebMCP Tool for AI Programmatic Bidding</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px] overflow-x-auto">
{`// Autonomous AI Agents can call window.webMCP directly:
await window.webMCP.callTool("sponsorStreamerGameStateEvent", {
  streamerId: "${cleanHandle}",
  eventType: "victory_royale",
  headline: "👑 VICTORY ROYALE SPONSORED BY APEX AI",
  sponsorName: "Apex Cloud",
  bidAmountDollars: 10.00
});`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
