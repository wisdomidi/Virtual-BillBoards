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
  Compass,
  Bot,
  Info,
  ArrowRight
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

interface StreamerOverlayStudioProps {
  initialHandle?: string;
  selectedCity?: string;
  onOpenWebMcp?: () => void;
}

export const StreamerOverlayStudio: React.FC<StreamerOverlayStudioProps> = ({
  initialHandle = 'venue_host',
  selectedCity = 'GLOBAL',
  onOpenWebMcp
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
  const [simulatingEvent, setSimulatingEvent] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const [streamerStats, setStreamerStats] = useState({
    totalImpressions: 0,
    totalEventsTriggered: 0,
    totalEarnedDollars: '0.00',
    revShareRate: '70%'
  });

  // Solana Payout Wallet State
  const [solanaWallet, setSolanaWallet] = useState<string>(() => {
    return localStorage.getItem('vb_streamer_solana_wallet') || '';
  });
  const [isSavingWallet, setIsSavingWallet] = useState<boolean>(false);
  const [walletSaveMsg, setWalletSaveMsg] = useState<string | null>(null);

  // Live Visual Preview Ad State
  const [previewAd, setPreviewAd] = useState<{ title: string; imageUrl: string; advertiser: string; bidDollars: string }>({
    title: 'Cyberpunk Esports Championship Series',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    advertiser: 'Omni Media Global',
    bidDollars: '4.50'
  });

  useEffect(() => {
    const fetchSlotForPreview = async () => {
      try {
        const res = await fetch(`/api/slot?cityCode=${cityCode}&countryCode=GLOBAL`);
        if (res.ok) {
          const data = await res.json();
          if (data.winningAd) {
            setPreviewAd({
              title: data.winningAd.title,
              imageUrl: data.winningAd.imageUrl,
              advertiser: data.winningAd.advertiserName || 'Sponsor Ad',
              bidDollars: ((data.winningAd.bidAmountCents || 100) / 100).toFixed(2)
            });
          }
        }
      } catch {}
    };
    fetchSlotForPreview();
  }, [cityCode]);

  const [activeTab, setActiveTab] = useState<'url_builder' | 'ai_agent_guide' | 'simulator'>('url_builder');

  const cleanHandle = (handle || 'venue_host').replace(/^@/, '').toLowerCase().trim();

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

  const handleSaveSolanaWallet = async () => {
    if (!solanaWallet.trim()) {
      setWalletSaveMsg('⚠️ Please enter a valid Solana wallet address.');
      return;
    }
    setIsSavingWallet(true);
    setWalletSaveMsg(null);
    try {
      const res = await fetch('/api/streamer/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamerId: cleanHandle, solanaWallet: solanaWallet.trim() })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('vb_streamer_solana_wallet', solanaWallet.trim());
        setWalletSaveMsg(data.message || '✅ Solana wallet saved successfully!');
        soundEffects.playKaChing();
      } else {
        setWalletSaveMsg(`⚠️ ${data.error || 'Failed to save wallet.'}`);
      }
    } catch (e: any) {
      setWalletSaveMsg(`⚠️ Error: ${e.message}`);
    } finally {
      setIsSavingWallet(false);
      setTimeout(() => setWalletSaveMsg(null), 5000);
    }
  };

  // Fetch real streamer stats and registered wallet
  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/streamer/stats/${cleanHandle}`);
      if (res.ok) {
        const data = await res.json();
        if (data.streamer) {
          setStreamerStats({
            totalImpressions: data.streamer.totalImpressions || 0,
            totalEventsTriggered: data.streamer.totalEventsTriggered || 0,
            totalEarnedDollars: data.streamer.totalEarnedDollars || '0.00',
            revShareRate: '70%'
          });
          if (data.streamer.solanaWallet && !solanaWallet) {
            setSolanaWallet(data.streamer.solanaWallet);
          }
        }
      }
    } catch {
      // Safe fallback
    }
  };

  useEffect(() => {
    fetchStats();
  }, [cleanHandle]);

  // Stage & Event Simulator Trigger
  const handleTriggerSimulation = async (eventType: GameStateEventType) => {
    setSimulatingEvent(true);
    setSimulationResult(null);

    const eventPayloads: Record<GameStateEventType, any> = {
      keynote_live: {
        eventType: 'keynote_live',
        gameTitle: 'Main Stage Keynote',
        headline: `🎙️ KEYNOTE SPEAKER LIVE ON STAGE!`,
        subheadline: `Sponsor: Global AI Compute Labs`,
        sponsorName: 'Global AI Compute',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 50.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🎙️'
      },
      hackathon_winner: {
        eventType: 'hackathon_winner',
        gameTitle: 'Hackathon Grand Finals',
        headline: `🏆 HACKATHON WINNER ANNOUNCEMENT!`,
        subheadline: `Grand Prize Sponsor: Autonomous Cloud AI`,
        sponsorName: 'Autonomous Cloud AI',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 25.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🏆'
      },
      sponsor_showcase: {
        eventType: 'sponsor_showcase',
        gameTitle: 'Venue Spotlight',
        headline: `⚡ VIP SPONSOR TAKEOVER SHOWCASE!`,
        subheadline: `Scan the on-screen QR code to visit our booth`,
        sponsorName: 'Lead Innovation Partner',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 15.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⚡'
      },
      networking_hour: {
        eventType: 'networking_hour',
        gameTitle: 'Networking Reception',
        headline: `🥂 NETWORKING & HAPPY HOUR TAKEOVER!`,
        subheadline: `Sponsored by Developer Community Fund`,
        sponsorName: 'Developer Community Fund',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 20.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🥂'
      },
      flash_takeover: {
        eventType: 'flash_takeover',
        gameTitle: 'Audience Pitch',
        headline: `🚀 LIVE AUDIENCE SHOUTOUT TAKEOVER!`,
        subheadline: `Placed by attendee via phone in 15 seconds`,
        sponsorName: 'Attendee Shoutout',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 10.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🚀'
      },
      crowd_hype: {
        eventType: 'crowd_hype',
        gameTitle: 'Crowd Celebration',
        headline: `🔥 MASSIVE CROWD HYPE MOMENT!`,
        subheadline: `70% Rev-share credited to venue organizer`,
        sponsorName: 'Arena Sponsor',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 12.00,
        customVfx: 'neon_burst',
        particlesEmoji: '🔥'
      },
      victory_royale: {
        eventType: 'victory_royale',
        gameTitle: 'Battle Royale Match',
        headline: `👑 VICTORY ROYALE SPONSORED TAKEOVER!`,
        subheadline: `Use creator code "${cleanHandle.toUpperCase()}"`,
        sponsorName: 'Cloud GPU Sponsor',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 10.00,
        customVfx: 'victory_gold',
        particlesEmoji: '👑'
      },
      kill_streak: {
        eventType: 'kill_streak',
        gameTitle: 'FPS Tournament',
        headline: `🔥 5X RAMPAGE KILL STREAK TAKEOVER!`,
        subheadline: `Zero-Latency Gaming Gear`,
        sponsorName: 'Pro Gaming Gear',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🔥'
      },
      ace_clutch: {
        eventType: 'ace_clutch',
        gameTitle: 'Competitive Match',
        headline: `🎯 1v5 CLUTCH ACE SPONSORED TAKEOVER!`,
        subheadline: `Apex Energy Labs`,
        sponsorName: 'Apex Energy Labs',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 15.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⚡'
      },
      sub_hype_bomb: {
        eventType: 'sub_hype_bomb',
        gameTitle: 'Community Stream',
        headline: `💥 50 GIFTED SUBS HYPE BOMB!`,
        subheadline: `Community celebration takeover`,
        sponsorName: 'Global Ad Network',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 8.00,
        customVfx: 'neon_burst',
        particlesEmoji: '💎'
      },
      boss_defeated: {
        eventType: 'boss_defeated',
        gameTitle: 'RPG Realm',
        headline: `🏆 MYTHIC BOSS DEFEATED TAKEOVER!`,
        subheadline: `Mythic Guild Sponsor`,
        sponsorName: 'Mythic Guild',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 5.00,
        customVfx: 'victory_gold',
        particlesEmoji: '⚔️'
      },
      tournament_champion: {
        eventType: 'tournament_champion',
        gameTitle: 'Grand Finals',
        headline: `🥇 TOURNAMENT GRAND CHAMPION TAKEOVER!`,
        subheadline: `Silicon Hardware Partner`,
        sponsorName: 'Silicon Hardware',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 25.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🏆'
      },
      level_up: {
        eventType: 'level_up',
        gameTitle: 'Online RPG',
        headline: `⭐ LEVEL UP SPONSORED TAKEOVER!`,
        subheadline: `Pro Nutrition`,
        sponsorName: 'Pro Nutrition',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 3.00,
        customVfx: 'neon_burst',
        particlesEmoji: '⭐'
      },
      game_over: {
        eventType: 'game_over',
        gameTitle: 'Match End',
        headline: `🎮 GG WP MATCH SPONSORED TAKEOVER!`,
        subheadline: `GamerFuel`,
        sponsorName: 'GamerFuel',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 4.00,
        customVfx: 'flame_rampage',
        particlesEmoji: '🎮'
      },
      award_announcement: {
        eventType: 'award_announcement',
        gameTitle: 'Award Ceremony',
        headline: `🥇 OFFICIAL AWARD CEREMONY TAKEOVER!`,
        subheadline: `Tech Accelerator`,
        sponsorName: 'Tech Accelerator',
        sponsorImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        bidAmountDollars: 20.00,
        customVfx: 'victory_gold',
        particlesEmoji: '🥇'
      },
      custom_event: {
        eventType: 'custom_event',
        gameTitle: 'Live Stage',
        headline: `⚡ CUSTOM SPONSORED TAKEOVER!`,
        subheadline: `70% Rev-Share Paid Instantly`,
        sponsorName: 'Autonomous AI Agent',
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
      {/* Studio Header Banner: Humans & AI Agents Connection */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-cyan-500/40 p-6 rounded-3xl shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Tv className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Venues, Events & Streamer Display Studio
                </h1>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  ⚡ 70% Direct Revenue Share
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Where Humans Gather, AI Agents Buy Screen Space.</strong> Turn your physical venue screens, stage projectors, or live stream overlays into autonomous income.
              </p>
            </div>
          </div>

          {/* Organizer Earnings Pill */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/90 border border-emerald-500/40 px-4 py-2 rounded-2xl font-mono text-xs flex items-center gap-2.5 shadow-xl">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Your Total Earnings</span>
                <span className="text-sm font-black text-emerald-400 font-mono">${streamerStats.totalEarnedDollars} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Switcher: Physical In-Venue vs Online Broadcast */}
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
                For Conferences, Festivals, Arena LED Walls, Smart TVs, Digital Kiosks & Lounges.
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
                <span className="text-[9px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">Live Broadcast</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                For live gaming broadcasters, video creators, and online tournament streams.
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
            <span>1. {environmentMode === 'venue_event' ? 'TV Screen Link & Quick Setup' : 'Broadcast Widget & Setup'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_agent_guide')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai_agent_guide'
                ? 'bg-indigo-500 text-white font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>2. How AI Agents & Humans Connect</span>
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
            <span>3. Test Stage Takeover Simulator</span>
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
                  {environmentMode === 'venue_event' ? 'Venue Screen Setup' : 'Broadcast Widget Settings'}
                </span>
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                {environmentMode === 'venue_event' ? 'Plug & Play (Zero Setup)' : 'Drag-and-Drop Browser Source'}
              </span>
            </div>

            {/* Quick 3-Step Human-AI Flow */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-cyan-950/40 border border-cyan-500/30 rounded-2xl space-y-2">
              <div className="text-xs font-black text-cyan-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How Monetization Works (3 Simple Steps):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <strong className="text-white block font-bold">1. Plug In Your Screen</strong>
                  Open player on any Smart TV, LED wall, or streaming app.
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <strong className="text-cyan-300 block font-bold">2. AI Agents Bid 24/7</strong>
                  AI agents and attendees buy 15s slots programmatically.
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <strong className="text-emerald-400 block font-bold">3. Earn 70% Payouts</strong>
                  Direct rev-share credited instantly to your account.
                </div>
              </div>
            </div>

            {/* Event / Venue / Streamer Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center justify-between">
                <span>{environmentMode === 'venue_event' ? 'Venue / Event Channel Handle:' : 'Creator / Streamer Handle:'}</span>
                <span className="text-slate-500 text-[10px] font-sans">Used to credit your 70% revenue</span>
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

            {/* Solana Payout Wallet for Instant 70% Micro-Splits */}
            <div className="p-4 bg-gradient-to-br from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-black text-white uppercase">Solana Payout Wallet (Instant 70% SPL Splits)</span>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  ⚡ &lt;400ms Auto-Route
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Connect your Phantom / Solflare wallet. <strong>70% of every sponsor micro-bid</strong> will automatically land directly in your wallet on Solana Mainnet with zero bank fees.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={solanaWallet}
                  onChange={(e) => setSolanaWallet(e.target.value)}
                  placeholder="Paste Phantom / Solflare public address (e.g. 3sYWf...)"
                  className="flex-1 bg-slate-950 border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-400 select-all"
                />
                <button
                  type="button"
                  onClick={handleSaveSolanaWallet}
                  disabled={isSavingWallet}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingWallet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSavingWallet ? 'Saving...' : 'Save Payout Wallet'}</span>
                </button>
              </div>

              {walletSaveMsg && (
                <div className="text-[11px] font-mono font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 p-2 rounded-xl animate-fade-in">
                  {walletSaveMsg}
                </div>
              )}
            </div>

            {/* Target City Geofence */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Screen Location (Target City Feed):</span>
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

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono">
                Visual Style:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono font-bold">
                {[
                  { id: 'cyberpunk', label: 'Cyber Neon', border: 'border-cyan-500' },
                  { id: 'neon', label: 'Synthwave', border: 'border-fuchsia-500' },
                  { id: 'gold', label: 'Gold Stage', border: 'border-amber-400' },
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

            {/* Toggles */}
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
                      : 'Live Broadcast Browser Source URL:'}
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
                <div className="space-y-2 pt-1">
                  <a
                    href={overlayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Maximize className="w-4 h-4" />
                    <span>🚀 Launch Fullscreen In-Venue TV Player (Anti-Sleep Active)</span>
                  </a>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Screen wake lock is automatically enabled to prevent display dimming or sleeping.</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>⚡ Quick Broadcasting Software Setup:</span>
                  </div>
                  <p>1. In your broadcasting app, add a <strong>Browser Source</strong>.</p>
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
                    {environmentMode === 'venue_event' ? 'Live Venue TV Preview' : 'Live Broadcast Preview'}
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

              {/* Live Interactive Preview Canvas (Never Blank / Instant 0ms Render) */}
              <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center select-none ${
                theme === 'cyberpunk' ? 'border-cyan-500/50 shadow-cyan-500/10' :
                theme === 'neon' ? 'border-purple-500/50 shadow-purple-500/10' :
                theme === 'gold' ? 'border-amber-500/50 shadow-amber-500/10' : ''
              }`}>
                {/* Background Image / Creative Display */}
                <img
                  src={previewAd.imageUrl}
                  alt={previewAd.title}
                  className="w-full h-full object-cover"
                />

                {/* Ambient Top HUD Badge */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                  <div className="px-2.5 py-1 bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md rounded-xl flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-black uppercase text-white tracking-wider">
                      {environmentMode === 'venue_event' ? 'VENUE DISPLAY' : `@${cleanHandle}`}
                    </span>
                  </div>

                  <div className="px-2 py-0.5 bg-rose-950/90 border border-rose-500/60 backdrop-blur-md text-rose-300 font-mono font-bold text-[10px] rounded-lg shadow-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>15s Slot</span>
                  </div>
                </div>

                {/* Dynamic On-Screen Customer QR Code (If Enabled) */}
                {showQr && (
                  <div className="absolute bottom-10 right-2.5 bg-slate-950/95 border border-amber-400/80 p-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent('https://www.livebillboards.lol/watcher')}`}
                      alt="QR Preview"
                      className="w-8 h-8 rounded bg-white p-0.5 object-contain"
                    />
                    <div className="text-[8px] font-bold text-amber-300 uppercase leading-tight font-mono">
                      Scan To<br />Claim
                    </div>
                  </div>
                )}

                {/* Bottom Ticker Bar (If Enabled) */}
                {showTicker && (
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] backdrop-blur-md font-mono pointer-events-none">
                    <div className="text-white font-bold truncate max-w-[200px]">
                      {previewAd.title}
                    </div>
                    <div className="text-cyan-300 shrink-0 flex items-center gap-1 font-bold">
                      <span>Sponsor: {previewAd.advertiser}</span>
                      <span className="text-amber-400 font-mono">(${previewAd.bidDollars})</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Active Channel / Venue:</span>
                  <span className="text-white font-bold">@{cleanHandle}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>AI Agent Programmatic Bidding:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    WebMCP Active (20ms RTB)
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
      {/* TAB 2: HOW AI AGENTS & HUMANS CONNECT (SIMPLE, CLEAN EXPLANATION) */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'ai_agent_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span>The Human & AI Agent Connection</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                How autonomous AI agents discover and buy advertising space on your physical screens and live broadcasts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">1. Humans Gather</h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Attendees gather at your physical conference, festival, stadium, or watch your online live stream. Your screen is in front of real eyeballs.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 w-fit">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">2. AI Agents Buy 24/7</h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Autonomous AI agents (media buyers, brand bots) detect your screen location via WebMCP and place programmatic RTB bids every 15 seconds.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">3. Instant Revenue</h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                You get 70% of every winning bid directly deposited into your payout wallet. Zero management, zero sales calls, zero manual work.
              </p>
            </div>
          </div>

          {/* Quick Technical Reference & Link to WebMCP Hub */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Looking for Developer APIs & WebMCP Playground?</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Detailed tool schemas, cURL examples, and automated AI bidding protocols are available in the dedicated WebMCP Hub.
              </p>
            </div>

            {onOpenWebMcp && (
              <button
                onClick={onOpenWebMcp}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open WebMCP Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 3: STAGE & EVENT TAKEOVER SIMULATOR */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>
                  {environmentMode === 'venue_event'
                    ? 'In-Venue Stage Takeover Test Console'
                    : 'Broadcast Event Takeover Test Console'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any button below to test how sponsor takeovers trigger in real-time on your live TV screen or stream overlay.
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
                  sponsor: 'Global AI Compute ($50.00)',
                  color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/50 text-amber-300'
                },
                {
                  type: 'hackathon_winner' as GameStateEventType,
                  icon: Trophy,
                  title: '🏆 Hackathon Winner Reveal',
                  sponsor: 'Autonomous Cloud AI ($25.00)',
                  color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/50 text-purple-300'
                },
                {
                  type: 'sponsor_showcase' as GameStateEventType,
                  icon: Sparkles,
                  title: '⚡ VIP Sponsor Spotlight',
                  sponsor: 'Lead Innovation Partner ($15.00)',
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
                  title: '🔥 Arena Crowd Hype Wave',
                  sponsor: 'Arena Sponsor ($12.00)',
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
                      <span>Test Stage Takeover</span>
                    </button>
                  </div>
                );
              })
            ) : (
              [
                {
                  type: 'victory_royale' as GameStateEventType,
                  icon: Trophy,
                  title: '👑 Victory Royale Takeover',
                  sponsor: 'Cloud GPU Sponsor ($10.00)',
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
                  sponsor: 'Mythic Guild ($5.00)',
                  color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/50 text-emerald-300'
                },
                {
                  type: 'tournament_champion' as GameStateEventType,
                  icon: Trophy,
                  title: '🥇 Tournament Grand Champion',
                  sponsor: 'Silicon Hardware ($25.00)',
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
                      <span>Test Event Takeover</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
