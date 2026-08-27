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
  Sliders,
  Maximize,
  QrCode,
  MapPin,
  Mic,
  Award,
  Users,
  Compass
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

interface StreamerOverlayStudioProps {
  initialHandle?: string;
  selectedCity?: string;
}

export const StreamerOverlayStudio: React.FC<StreamerOverlayStudioProps> = ({
  initialHandle = 'event_organizer',
  selectedCity = 'GLOBAL'
}) => {
  const [handle, setHandle] = useState<string>(() => {
    return localStorage.getItem('vb_streamer_handle') || initialHandle;
  });

  // Environment Mode: In-Venue Physical Screen vs Online Live Broadcast
  const [environmentMode, setEnvironmentMode] = useState<'venue_event' | 'online_stream'>('venue_event');

  const [layout, setLayout] = useState<OverlayLayoutType>('full_takeover');
  const [theme, setTheme] = useState<'cyberpunk' | 'neon' | 'gold' | 'minimal' | 'glass'>('cyberpunk');
  const [transparent, setTransparent] = useState<boolean>(false);
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

  const cleanHandle = (handle || 'venue_organizer').replace(/^@/, '').toLowerCase().trim();

  // Construct URL based on Environment Mode
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.livebillboards.lol';
  const overlayUrl =
    environmentMode === 'venue_event'
      ? `${origin}/venue?creator=${cleanHandle}&theme=${theme}&audio=${audio}&qr=${showQr}&ticker=${showTicker}&city=${cityCode}`
      : `${origin}/overlay?creator=${cleanHandle}&layout=${layout}&theme=${theme}&transparent=${transparent}&audio=${audio}&events=${eventsEnabled}&qr=${showQr}&ticker=${showTicker}&city=${cityCode}`;

  const recommendedDimensions = {
    corner_pip: { width: 480, height: 270, label: '480 × 270 (16:9 Corner Box)' },
    bottom_ticker: { width: 1920, height: 60, label: '1920 × 60 (Esports Bottom Ticker)' },
    side_dock: { width: 360, height: 640, label: '360 × 640 (9:16 Vertical Dock)' },
    event_alert_only: { width: 1920, height: 1080, label: '1920 × 1080 (Transparent Alert Canvas)' },
    full_takeover: { width: 1920, height: 1080, label: '1920 × 1080 (Full 1080p/4K Stage Display)' }
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

  // Milestone / Event Simulation Trigger
  const handleTriggerSimulation = async (eventType: GameStateEventType) => {
    setSimulatingEvent(true);
    setSimulationResult(null);

    const eventPayloads: Record<GameStateEventType, any> = {
      // In-Venue & Conference Milestones
      keynote_live: {
        eventType: 'keynote_live',
        gameTitle: 'Main Stage Keynote',
        headline: `🎙️ KEYNOTE SPEAKER LIVE ON STAGE!`,
        subheadline: `Sponsor: Global Venture Capital & AI Labs`,
        sponsorName: 'Global AI Ventures',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 50.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🎙️'
      },
      hackathon_winner: {
        eventType: 'hackathon_winner',
        gameTitle: 'Hackathon Grand Finals',
        headline: `🏆 HACKATHON GRAND CHAMPION ANNOUNCEMENT!`,
        subheadline: `Grand Prize Sponsor: Next-Gen Cloud Compute`,
        sponsorName: 'Next-Gen Cloud Compute',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 25.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🏆'
      },
      sponsor_showcase: {
        eventType: 'sponsor_showcase',
        gameTitle: 'Venue Spotlight',
        headline: `⚡ VIP SPONSOR TAKEOVER SHOWCASE!`,
        subheadline: `Scan the on-screen QR to visit our booth & claim your gift`,
        sponsorName: 'Lead Innovation Sponsor',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 15.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⚡'
      },
      networking_hour: {
        eventType: 'networking_hour',
        gameTitle: 'Evening Networking Reception',
        headline: `🥂 NETWORKING & HAPPY HOUR SPONSORED TAKEOVER!`,
        subheadline: `Open bar & networking powered by Developer Community Fund`,
        sponsorName: 'Developer Community Fund',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 20.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🥂'
      },
      flash_takeover: {
        eventType: 'flash_takeover',
        gameTitle: 'Audience Flash Shoutout',
        headline: `🚀 LIVE AUDIENCE SHOUTOUT TAKEOVER!`,
        subheadline: `Placed by attendee via phone in 15 seconds`,
        sponsorName: 'Attendee Pitch',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 10.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🚀'
      },
      crowd_hype: {
        eventType: 'crowd_hype',
        gameTitle: 'Arena Crowd Wave',
        headline: `🔥 MASSIVE CROWD HYPE MOMENT!`,
        subheadline: `70% Rev-share credited to venue organizer`,
        sponsorName: 'Stadium Partner',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 12.00,
        customVfx: 'neon_burst',
        particlesEmoji: '🔥'
      },

      // Broadcast & Gaming Milestones
      victory_royale: {
        eventType: 'victory_royale',
        gameTitle: 'Battle Royale Match',
        headline: `👑 VICTORY ROYALE SPONSORED TAKEOVER!`,
        subheadline: `Use creator code "${cleanHandle.toUpperCase()}" for exclusive perks`,
        sponsorName: 'High-Performance Cloud GPU',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 10.00,
        customVfx: 'victory_gold',
        particlesEmoji: '👑'
      },
      kill_streak: {
        eventType: 'kill_streak',
        gameTitle: 'Tactical FPS Tournament',
        headline: `🔥 5X RAMPAGE KILL STREAK TAKEOVER!`,
        subheadline: `Zero-Latency Gaming Gear & Pro Peripherals`,
        sponsorName: 'Pro Gaming Gear',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🔥'
      },
      ace_clutch: {
        eventType: 'ace_clutch',
        gameTitle: 'Competitive FPS Match',
        headline: `🎯 1v5 CLUTCH ACE SPONSORED TAKEOVER!`,
        subheadline: `Powering peak competitive clutch moments`,
        sponsorName: 'Apex Energy Labs',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 15.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⚡'
      },
      sub_hype_bomb: {
        eventType: 'sub_hype_bomb',
        gameTitle: 'Live Stream Channel',
        headline: `💥 50 GIFTED SUBS HYPE BOMB!`,
        subheadline: `Massive community celebration takeover`,
        sponsorName: 'Global Ad Network',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 8.00,
        customVfx: 'neon_burst',
        particlesEmoji: '💎'
      },
      boss_defeated: {
        eventType: 'boss_defeated',
        gameTitle: 'Action RPG Realm',
        headline: `🏆 MYTHIC BOSS DEFEATED TAKEOVER!`,
        subheadline: `Official Guild Quest Sponsor`,
        sponsorName: 'Mythic Guild Gaming',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'victory_gold',
        particlesEmoji: '⚔️'
      },
      tournament_champion: {
        eventType: 'tournament_champion',
        gameTitle: 'Championship Grand Finals',
        headline: `🥇 TOURNAMENT GRAND CHAMPION TAKEOVER!`,
        subheadline: `Grand Finals Champion Victory Celebration`,
        sponsorName: 'Next-Gen Silicon Sponsor',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 25.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🏆'
      },
      level_up: {
        eventType: 'level_up',
        gameTitle: 'Online RPG Adventure',
        headline: `⭐ LEVEL UP SPONSORED TAKEOVER!`,
        subheadline: `Powering your next progression tier`,
        sponsorName: 'Pro Gamer Nutrition',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 3.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⭐'
      },
      game_over: {
        eventType: 'game_over',
        gameTitle: 'Match Wrap-up',
        headline: `🎮 GG WP MATCH SPONSORED TAKEOVER!`,
        subheadline: `Next round starts soon`,
        sponsorName: 'GamerFuel',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 4.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🎮'
      },
      award_announcement: {
        eventType: 'award_announcement',
        gameTitle: 'Event Awards Stage',
        headline: `🥇 OFFICIAL AWARD CEREMONY TAKEOVER!`,
        subheadline: `Sponsor: Apex Tech Accelerator`,
        sponsorName: 'Apex Tech Accelerator',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 20.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🥇'
      },
      custom_event: {
        eventType: 'custom_event',
        gameTitle: 'Live Stage Event',
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
                  Event Organizers & Streamer Display Studio
                </h1>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  ⚡ 70% Direct Revenue Share
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Monetize your physical venue screens (Conferences, Festivals, Stadiums, Lounges) or online broadcast streams with 1-click live ad takeovers & QR code attendee bidding.
              </p>
            </div>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/90 border border-emerald-500/40 px-4 py-2 rounded-2xl font-mono text-xs flex items-center gap-2.5 shadow-xl">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Your Organizer / Streamer Earnings</span>
                <span className="text-sm font-black text-emerald-400 font-mono">${streamerStats.totalEarnedDollars} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Preset Switcher: In-Venue Screen vs Online Broadcast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setEnvironmentMode('venue_event');
              setLayout('full_takeover');
              setTransparent(false);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              environmentMode === 'venue_event'
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                <span>🎪 In-Venue Physical Screen & Stage Display</span>
                <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">Plug & Play</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                For Conferences, Festivals, Arena LED Walls, TV Screens, Digital Kiosks, Hackathons & Nightclubs.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setEnvironmentMode('online_stream');
              setLayout('corner_pip');
              setTransparent(true);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              environmentMode === 'online_stream'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                <span>🎮 Online Live Broadcast & Stream Overlay</span>
                <span className="text-[9px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">OBS Studio</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                For live gaming broadcasters, Twitch/Kick/YouTube creators, and esports casting overlays.
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
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
            <span>1. {environmentMode === 'venue_event' ? 'Venue TV Player & Screen Link' : 'OBS / Streamlabs URL Builder'}</span>
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
            <span>2. {environmentMode === 'venue_event' ? 'Keynote & Milestone Simulator' : 'Game-State Trigger Simulator'}</span>
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
            <span>3. Webhook & AI Bidding SDK</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 1: VENUE TV PLAYER / BROWSER SOURCE URL BUILDER */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'url_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>
                  {environmentMode === 'venue_event' ? 'Venue Screen Setup & Configuration' : 'Broadcast Overlay Settings'}
                </span>
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                {environmentMode === 'venue_event' ? 'Plug & Play on Any TV / Smart Screen' : 'Drag-and-Drop in OBS (30s Setup)'}
              </span>
            </div>

            {/* In-Venue Feature Highlights Banner */}
            {environmentMode === 'venue_event' && (
              <div className="p-4 bg-gradient-to-br from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/40 rounded-2xl space-y-2">
                <div className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>How Physical In-Venue Monetization Works:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-white block font-bold">1. Plug & Play on TV</strong>
                    Open this URL on any venue Smart TV, projector, or LED wall.
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-white block font-bold">2. Attendees Scan QR</strong>
                    Audience in seats scan the on-screen QR code to bid from their phones.
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 block font-bold">3. Earn 70% Rev-Share</strong>
                    You receive 70% of every dollar spent by attendees and sponsors.
                  </div>
                </div>
              </div>
            )}

            {/* Event / Venue / Streamer Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                <span>{environmentMode === 'venue_event' ? 'Event / Venue ID / Conference Handle:' : 'Creator Username / Channel ID:'}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => handleSaveHandle(e.target.value)}
                  placeholder={environmentMode === 'venue_event' ? 'tech_summit_2026' : 'your_channel_name'}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Target City Geofence */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Venue City Geofence Feed:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono font-bold">
                {[
                  { code: 'GLOBAL', name: '🌐 Global' },
                  { code: 'NYC', name: '🇺🇸 New York' },
                  { code: 'LON', name: '🇬🇧 London' },
                  { code: 'TYO', name: '🇯🇵 Tokyo' },
                  { code: 'PAR', name: '🇫🇷 Paris' },
                  { code: 'DXB', name: '🇦🇪 Dubai' },
                  { code: 'SIN', name: '🇸🇬 Singapore' },
                  { code: 'KUL', name: '🇲🇾 Kuala Lumpur' }
                ].map((city) => (
                  <button
                    key={city.code}
                    type="button"
                    onClick={() => setCityCode(city.code)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      cityCode === city.code
                        ? 'bg-cyan-500 text-slate-950 font-black shadow'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Selector (Broadcast mode only) */}
            {environmentMode === 'online_stream' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">
                  Select Broadcast Layout Preset:
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
            )}

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono">
                Visual Aesthetic Theme:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono font-bold">
                {[
                  { id: 'cyberpunk', label: 'Cyber Neon', border: 'border-cyan-500' },
                  { id: 'neon', label: 'Synthwave', border: 'border-fuchsia-500' },
                  { id: 'gold', label: 'Championship', border: 'border-amber-400' },
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
                <span className="text-xs font-mono font-bold text-slate-300">Audience QR Code</span>
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono font-bold text-slate-300">Audio Chimes</span>
                <input
                  type="checkbox"
                  checked={audio}
                  onChange={(e) => setAudio(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono font-bold text-slate-300">Live Ad Ticker</span>
                <input
                  type="checkbox"
                  checked={showTicker}
                  onChange={(e) => setShowTicker(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>
            </div>

            {/* Ready Link Output */}
            <div className="bg-slate-950 border-2 border-cyan-500/50 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" />
                  <span>
                    {environmentMode === 'venue_event'
                      ? 'In-Venue TV / LED Screen Player URL:'
                      : 'OBS / Streamlabs Browser Source URL:'}
                  </span>
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
                  <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* 1-Click Launch In-Venue TV Screen Player */}
              {environmentMode === 'venue_event' ? (
                <div className="pt-1">
                  <a
                    href={overlayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Maximize className="w-4 h-4" />
                    <span>🚀 Launch Fullscreen In-Venue TV Player (Anti-Sleep Active)</span>
                  </a>
                </div>
              ) : (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>⚡ 30-Second OBS Setup:</span>
                  </div>
                  <p>1. In OBS, click <strong>Sources (+)</strong> → Add <strong>Browser</strong>.</p>
                  <p>2. Paste URL, set Width: <strong className="text-cyan-300 font-mono">{recommendedDimensions.width}</strong>, Height: <strong className="text-cyan-300 font-mono">{recommendedDimensions.height}</strong>.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Interactive Preview Frame (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    {environmentMode === 'venue_event' ? 'Live Venue TV Preview' : 'Live Broadcast Overlay'}
                  </h3>
                </div>
                <a
                  href={overlayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Preview Canvas Window */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
                <iframe
                  src={overlayUrl}
                  title="Display Preview"
                  className="w-full h-full border-0 pointer-events-auto"
                />
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Active Channel / Venue:</span>
                  <span className="text-white font-bold">@{cleanHandle}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Audience Bidding:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    QR Scan Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Rev-Share Split:</span>
                  <span className="text-amber-300 font-bold">70% Organizer / 30% Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 2: MILESTONE & EVENT TAKEOVER SIMULATOR */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>
                  {environmentMode === 'venue_event'
                    ? 'In-Venue Milestone & Keynote Sponsor Simulator'
                    : 'Game-State Event Takeover Simulator'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {environmentMode === 'venue_event'
                  ? 'Test live event milestone takeovers (Keynotes, Award Announcements, Happy Hours) on your venue screen.'
                  : 'Click any button below to test how in-game victory and clutch moments trigger sponsor takeovers.'}
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
            {environmentMode === 'venue_event' ? (
              [
                {
                  type: 'keynote_live' as GameStateEventType,
                  icon: Mic,
                  title: '🎙️ Main Stage Keynote Live',
                  sponsor: 'Global AI Ventures ($50.00)',
                  color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/50 text-amber-300'
                },
                {
                  type: 'hackathon_winner' as GameStateEventType,
                  icon: Trophy,
                  title: '🏆 Hackathon Winner Reveal',
                  sponsor: 'Next-Gen Cloud Compute ($25.00)',
                  color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/50 text-purple-300'
                },
                {
                  type: 'sponsor_showcase' as GameStateEventType,
                  icon: Sparkles,
                  title: '⚡ VIP Sponsor Spotlight',
                  sponsor: 'Lead Innovation Sponsor ($15.00)',
                  color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-cyan-300'
                },
                {
                  type: 'networking_hour' as GameStateEventType,
                  icon: Award,
                  title: '🥂 Happy Hour & Reception',
                  sponsor: 'Developer Community Fund ($20.00)',
                  color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/50 text-emerald-300'
                },
                {
                  type: 'flash_takeover' as GameStateEventType,
                  icon: Flame,
                  title: '🚀 Attendee Phone Pitch',
                  sponsor: 'In-Person Attendee ($10.00)',
                  color: 'from-rose-500/20 to-pink-600/20 border-rose-500/50 text-rose-300'
                },
                {
                  type: 'crowd_hype' as GameStateEventType,
                  icon: Users,
                  title: '🔥 Stadium Crowd Hype Wave',
                  sponsor: 'Stadium Partner ($12.00)',
                  color: 'from-amber-500/30 to-orange-500/30 border-orange-400 text-orange-300'
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
                      <span>Fire Stage Takeover</span>
                    </button>
                  </div>
                );
              })
            ) : (
              [
                {
                  type: 'victory_royale' as GameStateEventType,
                  icon: Trophy,
                  title: '🏆 Victory Royale Takeover',
                  sponsor: 'Cloud Infrastructure Sponsor ($10.00)',
                  color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/50 text-amber-300'
                },
                {
                  type: 'kill_streak' as GameStateEventType,
                  icon: Flame,
                  title: '🔥 5x Rampage Kill Streak',
                  sponsor: 'Pro Gaming Gear ($5.00)',
                  color: 'from-red-500/20 to-rose-600/20 border-rose-500/50 text-rose-300'
                },
                {
                  type: 'ace_clutch' as GameStateEventType,
                  icon: Crown,
                  title: '🎯 1v5 ACE Clutch Takeover',
                  sponsor: 'Apex Energy Labs ($15.00)',
                  color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/50 text-purple-300'
                },
                {
                  type: 'sub_hype_bomb' as GameStateEventType,
                  icon: Sparkles,
                  title: '💥 50 Sub Hype Train Bomb',
                  sponsor: 'Global Ad Network ($8.00)',
                  color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-cyan-300'
                },
                {
                  type: 'boss_defeated' as GameStateEventType,
                  icon: Swords,
                  title: '⚔️ Mythic Boss Defeated',
                  sponsor: 'Mythic Guild Gaming ($5.00)',
                  color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/50 text-emerald-300'
                },
                {
                  type: 'tournament_champion' as GameStateEventType,
                  icon: Trophy,
                  title: '🥇 Tournament Grand Champion',
                  sponsor: 'Next-Gen Silicon Sponsor ($25.00)',
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
              })
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 3: WEBHOOK & AI BIDDING SDK GUIDE */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'sdk_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                <Code className="w-5 h-5 text-indigo-400" />
                <span>Event APIs, Stage Webhooks & WebMCP Autonomous Bidding</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Trigger live stage takeovers from conference production desks, hackathon leaderboards, game telemetry, or autonomous AI agents.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REST API & Webhook Format */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <span>1. Stage Webhook Endpoint (POST /api/overlay/trigger-event)</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px] overflow-x-auto">
{`curl -X POST https://www.livebillboards.lol/api/overlay/trigger-event \\
  -H "Content-Type: application/json" \\
  -d '{
    "streamerId": "${cleanHandle}",
    "eventType": "keynote_live",
    "headline": "🎙️ KEYNOTE SPEAKER LIVE ON STAGE!",
    "sponsorName": "Global AI Ventures",
    "bidAmountDollars": 50.00
  }'`}
              </pre>
            </div>

            {/* WebMCP Tool for Autonomous AI Agents */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>2. WebMCP Tool for Programmatic AI Sponsoring</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px] overflow-x-auto">
{`// Autonomous AI Agents can call window.webMCP directly:
await window.webMCP.callTool("sponsorStreamerGameStateEvent", {
  streamerId: "${cleanHandle}",
  eventType: "sponsor_showcase",
  headline: "⚡ VIP STAGE SPONSOR TAKEOVER",
  sponsorName: "Lead Innovation Partner",
  bidAmountDollars: 25.00
});`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
