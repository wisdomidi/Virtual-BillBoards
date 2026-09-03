import React, { useState, useEffect, useRef } from 'react';
import { ActiveBillboardSlot, OverlayLayoutType, StreamerGameStateEvent } from '../types';
import {
  Radio,
  Clock,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  QrCode,
  Flame,
  Crown,
  Trophy,
  Swords,
  Target,
  ExternalLink,
  Bot
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

interface StreamerObsOverlayProps {
  initialCity?: string;
  initialCountry?: string;
  streamerId?: string;
}

export const StreamerObsOverlay: React.FC<StreamerObsOverlayProps> = ({
  initialCity = 'GLOBAL',
  initialCountry = 'GLOBAL',
  streamerId = 'creator_obs'
}) => {
  // Parse query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const cityParam = (searchParams.get('city') || initialCity).toUpperCase();
  const countryParam = (searchParams.get('country') || initialCountry).toUpperCase();
  const themeParam = (searchParams.get('theme') || 'cyberpunk').toLowerCase(); // 'cyberpunk' | 'minimal' | 'glass' | 'neon' | 'gold'
  const layoutParam = (searchParams.get('layout') || 'corner_pip') as OverlayLayoutType; // 'corner_pip' | 'bottom_ticker' | 'side_dock' | 'event_alert_only' | 'full_takeover'
  const isTransparent = searchParams.get('transparent') === 'true' || searchParams.get('alpha') === 'true';
  const showTicker = searchParams.get('ticker') !== 'false';
  const showBadge = searchParams.get('badge') !== 'false';
  const showQr = searchParams.get('qr') !== 'false';
  const audioDefault = searchParams.get('audio') !== 'false'; // Default audio enabled for streamers
  const creatorId = (searchParams.get('creator') || searchParams.get('venue') || searchParams.get('streamerId') || streamerId).replace(/^@/, '').toLowerCase();

  const isVenueMode =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/venue') ||
      window.location.pathname.startsWith('/stage') ||
      window.location.pathname.startsWith('/event') ||
      window.location.pathname.startsWith('/kiosk') ||
      searchParams.get('mode') === 'venue' ||
      searchParams.get('mode') === 'stage' ||
      searchParams.get('mode') === 'event' ||
      searchParams.get('venue') === 'true');

  const [slotData, setSlotData] = useState<ActiveBillboardSlot | null>(null);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCountry, setSelectedCountry] = useState(countryParam);
  const [isConnected, setIsConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(audioDefault);
  const [flashEffect, setFlashEffect] = useState(false);
  const [recentBidAlert, setRecentBidAlert] = useState<string | null>(null);
  const [activeGameEvent, setActiveGameEvent] = useState<StreamerGameStateEvent | null>(null);
  const [eventCountdown, setEventCountdown] = useState<number>(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const eventTimeoutRef = useRef<any>(null);

  // Screen Wake Lock for In-Venue Screens, TV displays and LED walls
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Safe fallback
      }
    };
    if (isVenueMode) {
      requestWakeLock();
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') requestWakeLock();
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        if (wakeLock) wakeLock.release();
      };
    }
  }, [isVenueMode]);

  // Trigger celebratory particle blast
  const triggerParticleBlast = (emoji = '👑') => {
    const burst = Array.from({ length: 18 }).map((_, idx) => ({
      id: Date.now() + idx,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      emoji
    }));
    setParticles(burst);
    setTimeout(() => setParticles([]), 3500);
  };

  // Fetch initial active slot
  const fetchActiveSlot = async (city: string, country: string) => {
    try {
      const res = await fetch(`/api/billboard/active?city=${city}&country=${country}`);
      if (res.ok) {
        const data = await res.json();
        setSlotData(data);
      }
    } catch (err) {
      console.warn('OBS overlay slot fetch warning:', err);
    }
  };

  // Check latest game-state events fallback
  const checkLatestEvents = async () => {
    try {
      const res = await fetch(`/api/overlay/events?streamerId=${creatorId}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          const latest = data.events[0];
          const ageMs = Date.now() - new Date(latest.timestamp).getTime();
          if (ageMs < (latest.durationSeconds || 10) * 1000 && (!activeGameEvent || activeGameEvent.eventId !== latest.eventId)) {
            triggerGameEventTakeover(latest);
          }
        }
      }
    } catch (err) {
      // Safe fallback
    }
  };

  const triggerGameEventTakeover = (event: StreamerGameStateEvent) => {
    setActiveGameEvent(event);
    setEventCountdown(event.durationSeconds || 10);
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 2000);

    triggerParticleBlast(event.particlesEmoji || '🔥');

    if (audioEnabled) {
      soundEffects.playKaChing();
    }

    if (eventTimeoutRef.current) clearInterval(eventTimeoutRef.current);
    eventTimeoutRef.current = setInterval(() => {
      setEventCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(eventTimeoutRef.current);
          setActiveGameEvent(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 15s Standard Ticker & Periodic Polling
  useEffect(() => {
    const ticker = setInterval(() => {
      setSlotData((prev) => {
        if (!prev) return prev;
        const currentSec = typeof prev.remainingSeconds === 'number' ? prev.remainingSeconds : 15;
        const nextSec = currentSec - 1;
        if (nextSec <= 0) {
          fetchActiveSlot(selectedCity, selectedCountry);
          return { ...prev, remainingSeconds: 15 };
        }
        return { ...prev, remainingSeconds: nextSec };
      });
    }, 1000);

    const eventPoll = setInterval(() => {
      checkLatestEvents();
    }, 4000);

    // Send Streamer Live Node Heartbeat (Registers live streamer in Admin Fleet)
    const sendStreamerHeartbeat = async () => {
      if (!creatorId || creatorId === 'creator_obs' || creatorId === 'creator_anonymous') return;
      try {
        await fetch('/api/overlay/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId,
            cityCode: selectedCity,
            countryCode: selectedCountry,
            layout: layoutParam,
            theme: themeParam,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Streamlabs/OBS'
          })
        });
      } catch (err) {
        // Safe silent fail
      }
    };

    sendStreamerHeartbeat();
    const heartbeatInterval = setInterval(sendStreamerHeartbeat, 25000);

    return () => {
      clearInterval(ticker);
      clearInterval(eventPoll);
      clearInterval(heartbeatInterval);
    };
  }, [selectedCity, selectedCountry, creatorId, layoutParam, themeParam]);

  // WebSocket Connection
  useEffect(() => {
    fetchActiveSlot(selectedCity, selectedCountry);
    checkLatestEvents();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}?city=${selectedCity}&country=${selectedCountry}&streamerId=${creatorId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        city: selectedCity,
        country: selectedCountry,
        streamerId: creatorId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SLOT_TICK') {
          setSlotData((prev) => prev ? { ...prev, remainingSeconds: msg.payload.remainingSeconds } : prev);
        } else if (msg.type === 'GAME_STATE_EVENT_TRIGGER') {
          const gameEvent = msg.payload as StreamerGameStateEvent;
          if (
            gameEvent.streamerId === creatorId ||
            gameEvent.streamerId === 'creator' ||
            creatorId === 'all' ||
            creatorId === 'creator_obs'
          ) {
            triggerGameEventTakeover(gameEvent);
          }
        } else if (msg.type === 'SLOT_TRANSITION' || msg.type === 'BID_ADDED' || msg.type === 'NEW_BID_PLACED') {
          fetchActiveSlot(selectedCity, selectedCountry);
          setFlashEffect(true);
          setTimeout(() => setFlashEffect(false), 1200);

          if (msg.type === 'SLOT_TRANSITION' && audioEnabled) {
            soundEffects.playKaChing();
          }

          // Record verified impression for streamer rev-share
          if (creatorId && creatorId !== 'streamer_live') {
            fetch('/api/streamer/impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                streamerId: creatorId,
                cityCode: selectedCity,
                bidAmountCents: 100
              })
            }).catch(() => {});
          }

          if (msg.type === 'NEW_BID_PLACED' && msg.payload?.bid) {
            const bid = msg.payload.bid;
            const dollars = (bid.bidAmountCents / 100).toFixed(2);
            setRecentBidAlert(`🔥 NEW TOP BID: $${dollars} by ${bid.advertiserName || 'Advertiser'}`);
            if (audioEnabled) {
              soundEffects.playKaChing();
            }
            setTimeout(() => setRecentBidAlert(null), 5000);
          }
        }
      } catch (e) {
        // Safe JSON parsing
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
      if (eventTimeoutRef.current) clearInterval(eventTimeoutRef.current);
    };
  }, [selectedCity, selectedCountry, creatorId, audioEnabled]);

  const winningAdRaw = slotData?.winningAd || (slotData as any)?.currentAd;
  const isTier1 = (slotData as any)?.trafficTier === 'tier1_staring_eyeballs' || (winningAdRaw as any)?.trafficTier === 'tier1_staring_eyeballs';

  const ad = {
    id: winningAdRaw?.id || 'default_slot',
    title: winningAdRaw?.title || 'World First 24/7 Virtual Billboard Space',
    advertiser: winningAdRaw?.advertiserName || winningAdRaw?.advertiser || 'LiveBillboards.lol',
    img: winningAdRaw?.imageUrl || winningAdRaw?.img || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    bid: winningAdRaw?.bidAmountCents || winningAdRaw?.bid || 2500,
    mediaType: winningAdRaw?.mediaType || 'image',
    trafficTier: isTier1 ? 'tier1_staring_eyeballs' : 'standard'
  };

  const remainingSeconds = slotData?.remainingSeconds ?? 15;
  const progressPercent = Math.max(0, Math.min(100, ((15 - remainingSeconds) / 15) * 100));

  // Theme styling configurations
  const themeStyles = {
    cyberpunk: {
      container: isTransparent ? 'bg-slate-950/80 border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.35)]' : 'bg-slate-950 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)]',
      header: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/40 text-cyan-300',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
      accentText: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]'
    },
    neon: {
      container: isTransparent ? 'bg-purple-950/80 border-2 border-fuchsia-500/60 shadow-[0_0_35px_rgba(217,70,239,0.4)]' : 'bg-purple-950 border-2 border-fuchsia-500/60 shadow-[0_0_35px_rgba(217,70,239,0.4)]',
      header: 'bg-gradient-to-r from-purple-950 via-slate-900 to-fuchsia-950 border-b border-fuchsia-500/40 text-fuchsia-300',
      badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50',
      accentText: 'text-fuchsia-400',
      glow: 'shadow-[0_0_25px_rgba(217,70,239,0.5)]'
    },
    gold: {
      container: isTransparent ? 'bg-amber-950/80 border-2 border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.4)]' : 'bg-amber-950 border-2 border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.4)]',
      header: 'bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-b border-amber-500/40 text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
      accentText: 'text-amber-400',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]'
    },
    minimal: {
      container: isTransparent ? 'bg-black/80 border border-white/20 shadow-2xl backdrop-blur-md' : 'bg-black border border-white/20 shadow-2xl',
      header: 'bg-black/90 border-b border-white/10 text-white',
      badge: 'bg-white/10 text-white border-white/20',
      accentText: 'text-white',
      glow: ''
    },
    glass: {
      container: 'bg-slate-900/60 border border-cyan-400/30 backdrop-blur-xl shadow-2xl',
      header: 'bg-slate-900/40 border-b border-white/10 text-cyan-200',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      accentText: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]'
    }
  }[themeParam as 'cyberpunk' | 'minimal' | 'neon' | 'glass' | 'gold'] || {
    container: 'bg-slate-950/85 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)]',
    header: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/40 text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    accentText: 'text-cyan-400',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]'
  };

  // If in 'event_alert_only' mode and no event is active, render invisible alpha container
  if (layoutParam === 'event_alert_only' && !activeGameEvent) {
    return <div className="fixed inset-0 w-full h-full pointer-events-none bg-transparent" />;
  }

  return (
    <div
      className={`fixed inset-0 w-full h-full flex select-none pointer-events-auto overflow-hidden font-sans ${
        isTransparent ? 'bg-transparent' : 'bg-slate-950/95'
      } ${
        layoutParam === 'bottom_ticker'
          ? 'items-end justify-center p-0'
          : layoutParam === 'side_dock'
          ? 'items-center justify-end p-3'
          : layoutParam === 'full_takeover'
          ? 'items-center justify-center p-6'
          : 'items-end sm:items-center justify-end sm:justify-center p-3'
      }`}
    >
      {/* Dynamic Confetti / Emojis Particles Burst */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute z-50 text-3xl pointer-events-none animate-bounce"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transition: 'all 2s ease-out'
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* -------------------------------------------------------------------------- */}
      {/* 1. HIGH-IMPACT GAME-STATE EVENT TAKEOVER OVERLAY (VICTORY / KILL STREAK) */}
      {/* -------------------------------------------------------------------------- */}
      {activeGameEvent ? (
        <div
          className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative border-4 transition-all duration-300 animate-in zoom-in-95 ${
            activeGameEvent.customVfx === 'victory_gold'
              ? 'bg-gradient-to-br from-amber-950 via-yellow-950 to-slate-950 border-yellow-400 shadow-yellow-500/50'
              : activeGameEvent.customVfx === 'flame_rampage'
              ? 'bg-gradient-to-br from-red-950 via-rose-950 to-slate-950 border-rose-500 shadow-rose-500/50 animate-pulse'
              : 'bg-gradient-to-br from-cyan-950 via-blue-950 to-slate-950 border-cyan-400 shadow-cyan-500/50'
          }`}
        >
          {/* Top Event Banner */}
          <div className="px-5 py-3 flex items-center justify-between gap-3 bg-black/60 border-b border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/50">
                {activeGameEvent.eventType === 'victory_royale' ? (
                  <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                ) : activeGameEvent.eventType === 'kill_streak' ? (
                  <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
                ) : (
                  <Crown className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span>GAME-STATE SPONSOR TAKEOVER</span>
                  <span>•</span>
                  <span>{activeGameEvent.gameTitle || 'Live Esports'}</span>
                </span>
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {activeGameEvent.headline}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-rose-600/90 text-white font-mono text-xs font-black rounded-xl shadow-lg animate-pulse">
                ⏱️ {eventCountdown}s Left
              </div>
            </div>
          </div>

          {/* Event Creative Visual Canvas */}
          <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full bg-black overflow-hidden flex items-center justify-center">
            {activeGameEvent.sponsorImageUrl && (
              <img
                src={activeGameEvent.sponsorImageUrl}
                alt={activeGameEvent.sponsorName}
                className="w-full h-full object-cover opacity-85 scale-105 transition-transform duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* In-Game Callout Centerpiece */}
            <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-end justify-between gap-3 z-20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs font-mono">
                    OFFICIAL SPONSOR
                  </span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {activeGameEvent.sponsorName}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                    +$5.00 Streamer Rev-Share
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-bold line-clamp-1">
                  {activeGameEvent.subheadline}
                </p>
              </div>

              {showQr && (
                <div className="bg-white p-2 rounded-2xl shadow-2xl border-2 border-white ring-4 ring-amber-400/80 flex flex-col items-center gap-1 shrink-0 animate-pulse">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      activeGameEvent.qrCodeUrl
                        ? `${activeGameEvent.qrCodeUrl}${activeGameEvent.qrCodeUrl.includes('?') ? '&' : '?'}creator=${creatorId}&streamer=${creatorId}&city=${selectedCity}`
                        : `https://livebillboards.lol/r/stream_${creatorId || 'live'}?creator=${creatorId}&streamer=${creatorId}&city=${selectedCity}`
                    )}`}
                    alt="Scan Promo QR"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
                  />
                  <span className="text-[9px] sm:text-[10px] font-mono font-black text-slate-950 uppercase bg-gradient-to-r from-amber-400 to-yellow-300 px-2 py-0.5 rounded shadow">
                    CLAIM $5.00 PROMO
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : layoutParam === 'bottom_ticker' ? (
        /* -------------------------------------------------------------------------- */
        /* 2. ESPORTS / TOURNAMENT BOTTOM TICKER (SLIM 56px STRIP) */
        /* -------------------------------------------------------------------------- */
        <div className="w-full bg-slate-950/95 border-t-2 border-cyan-500/60 shadow-2xl backdrop-blur-md px-4 py-2 flex items-center justify-between gap-4 font-mono text-xs z-40">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xs uppercase tracking-wider">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>LIVE BILLBOARD</span>
              <span className="bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40 text-[10px]">
                [{selectedCity}]
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[10px]">
                {isTier1 ? '🔥 TIER 1' : 'SPONSORED'}
              </span>
              <span className="font-bold text-white truncate max-w-sm sm:max-w-md">{ad.title}</span>
              <span className="text-slate-400 text-[11px]">by <strong className="text-cyan-300">{ad.advertiser}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{remainingSeconds}s</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden md:inline">
              Instant Bids: <strong className="text-cyan-300">livebillboards.lol</strong>
            </span>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------------------- */
        /* 3. STANDARD CORNER PIP & DOCK OVERLAY */
        /* -------------------------------------------------------------------------- */
        <div
          className={`w-full ${
            layoutParam === 'side_dock' ? 'max-w-xs' : 'max-w-2xl sm:max-w-3xl'
          } rounded-2xl overflow-hidden transition-all duration-300 relative ${themeStyles.container} ${
            flashEffect ? 'scale-[1.01] ring-4 ring-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.8)]' : ''
          }`}
        >
          {/* Header Bar */}
          <div className={`px-3.5 py-2 flex items-center justify-between gap-2.5 ${themeStyles.header}`}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] font-black tracking-wider text-white flex items-center gap-1.5">
                  <span>{isVenueMode ? `🎪 LIVE VENUE DISPLAY: @${creatorId.toUpperCase()}` : 'VIRTUAL BILLBOARD'}</span>
                  <span className="text-[9px] text-cyan-400 bg-cyan-950/70 px-1 py-0.2 rounded border border-cyan-500/40 font-mono">
                    [{selectedCity}]
                  </span>
                </span>
              </div>
            </div>

            {/* Right Status / Audio Control */}
            <div className="flex items-center gap-2.5">
              {recentBidAlert ? (
                <div className="animate-bounce bg-amber-500/20 border border-amber-500/50 px-2 py-0.2 rounded-full text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="truncate max-w-[150px]">{recentBidAlert}</span>
                </div>
              ) : isTier1 ? (
                <div className="bg-amber-500/20 border border-amber-500/50 px-2 py-0.2 rounded-full text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>TIER 1 [100% ATTENTION]</span>
                </div>
              ) : showBadge ? (
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>24/7 LIVE STREAM</span>
                </div>
              ) : null}

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                title={audioEnabled ? 'Mute Alert Audio' : 'Enable Alert Audio'}
                className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {audioEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Billboard 16:9 Creative Screen */}
          <div className="relative aspect-[16/9] w-full bg-black overflow-hidden group">
            {ad.mediaType === 'video' ? (
              <video
                src={ad.img}
                autoPlay
                muted={!audioEnabled}
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={ad.img}
                alt={ad.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Countdown Badge */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
              <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="font-mono text-xs font-black text-white">{remainingSeconds}s</span>
              </div>
            </div>

            {/* Bottom Ad Meta */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex items-end justify-between gap-3">
              <div className="space-y-0.5 max-w-[75%]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                    SPONSORED
                  </span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {ad.advertiser || 'Top Bidder'}
                  </span>
                  {typeof ad.bid === 'number' && (
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] font-bold px-1 py-0.2 rounded">
                      ${(ad.bid / 100).toFixed(2)} BID
                    </span>
                  )}
                </div>
                <h2 className="text-xs sm:text-sm font-black text-white line-clamp-1 drop-shadow-md">
                  {ad.title}
                </h2>
              </div>

              {showQr && (
                <div className="bg-white p-1.5 rounded-xl shadow-2xl border-2 border-white ring-2 ring-cyan-400/60 flex flex-col items-center gap-0.5 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      ((ad as any).qrCodeUrl
                        ? `${(ad as any).qrCodeUrl}${(ad as any).qrCodeUrl.includes('?') ? '&' : '?'}creator=${creatorId}&streamer=${creatorId}&city=${selectedCity}`
                        : `https://livebillboards.lol/r/stream_${creatorId || 'live'}?creator=${creatorId}&streamer=${creatorId}&city=${selectedCity}`)
                    )}`}
                    alt="Scan Ad QR"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md"
                  />
                  <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-950 uppercase tracking-tight bg-cyan-300 px-1.5 py-0.2 rounded shadow">
                    SCAN TO VISIT
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Optional Footer Ticker */}
          {showTicker && (
            <div className="bg-slate-950 px-3 py-1 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">
                  Place instant bids at <strong className="text-cyan-300">livebillboards.lol</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-slate-500 text-[9px]">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>{selectedCity}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
