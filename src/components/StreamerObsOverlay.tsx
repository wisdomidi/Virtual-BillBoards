import React, { useState, useEffect, useRef } from 'react';
import { ActiveBillboardSlot, ToastMessage } from '../types';
import { Radio, Clock, Globe, Zap, Volume2, VolumeX, Sparkles, MessageSquare, QrCode } from 'lucide-react';
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
  const themeParam = searchParams.get('theme') || 'cyberpunk'; // 'cyberpunk' | 'minimal' | 'glass' | 'neon'
  const showTicker = searchParams.get('ticker') !== 'false';
  const showBadge = searchParams.get('badge') !== 'false';
  const showQr = searchParams.get('qr') !== 'false';
  const showChat = searchParams.get('chat') === 'true';
  const audioDefault = searchParams.get('audio') !== 'false'; // Default audio enabled for streamers
  const creatorId = searchParams.get('streamerId') || streamerId;

  const [slotData, setSlotData] = useState<ActiveBillboardSlot | null>(null);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCountry, setSelectedCountry] = useState(countryParam);
  const [isConnected, setIsConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(audioDefault);
  const [flashEffect, setFlashEffect] = useState(false);
  const [recentBidAlert, setRecentBidAlert] = useState<string | null>(null);
  const lastAdIdRef = useRef<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial active slot
  const fetchActiveSlot = async (city: string, country: string) => {
    try {
      const res = await fetch(`/api/billboard/active?city=${city}&country=${country}`);
      if (res.ok) {
        const data = await res.json();
        setSlotData(data);
        if (data?.winningAd?.id) lastAdIdRef.current = data.winningAd.id;
      }
    } catch (err) {
      console.warn('OBS overlay slot fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchActiveSlot(selectedCity, selectedCountry);

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
    };
  }, [selectedCity, selectedCountry, creatorId, audioEnabled]);

  const winningAdRaw = slotData?.winningAd || (slotData as any)?.currentAd;
  const ad = {
    id: winningAdRaw?.id || 'default_slot',
    title: winningAdRaw?.title || 'World First 24/7 Virtual Billboard Space',
    advertiser: winningAdRaw?.advertiserName || winningAdRaw?.advertiser || 'LiveBillboards.lol',
    img: winningAdRaw?.imageUrl || winningAdRaw?.img || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    bid: winningAdRaw?.bidAmountCents || winningAdRaw?.bid || 2500,
    mediaType: winningAdRaw?.mediaType || 'image'
  };

  const remainingSeconds = slotData?.remainingSeconds ?? 15;
  const progressPercent = Math.max(0, Math.min(100, ((15 - remainingSeconds) / 15) * 100));

  // Theme styling configurations
  const themeStyles = {
    cyberpunk: {
      container: 'bg-slate-950/85 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)]',
      header: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/40 text-cyan-300',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
      timerRing: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]'
    },
    minimal: {
      container: 'bg-black/90 border border-white/20 shadow-2xl backdrop-blur-md',
      header: 'bg-black/80 border-b border-white/10 text-white',
      badge: 'bg-white/10 text-white border-white/20',
      timerRing: 'text-white',
      glow: ''
    },
    neon: {
      container: 'bg-purple-950/90 border-2 border-fuchsia-500/60 shadow-[0_0_35px_rgba(217,70,239,0.4)]',
      header: 'bg-gradient-to-r from-purple-950 via-slate-900 to-fuchsia-950 border-b border-fuchsia-500/40 text-fuchsia-300',
      badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50',
      timerRing: 'text-fuchsia-400',
      glow: 'shadow-[0_0_25px_rgba(217,70,239,0.5)]'
    },
    glass: {
      container: 'bg-slate-900/60 border border-cyan-400/30 backdrop-blur-xl shadow-2xl',
      header: 'bg-slate-900/40 border-b border-white/10 text-cyan-200',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      timerRing: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]'
    }
  }[themeParam as 'cyberpunk' | 'minimal' | 'neon' | 'glass'] || {
    container: 'bg-slate-950/85 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.35)]',
    header: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/40 text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    timerRing: 'text-cyan-400',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]'
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-transparent flex items-center justify-center p-3 select-none pointer-events-auto overflow-hidden font-sans">
      <div
        className={`w-full max-w-4xl rounded-2xl overflow-hidden transition-all duration-300 relative ${themeStyles.container} ${
          flashEffect ? 'scale-[1.01] ring-4 ring-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.8)]' : ''
        }`}
      >
        {/* OBS Streamer Overlay Header */}
        <div className={`px-4 py-2.5 flex items-center justify-between gap-3 ${themeStyles.header}`}>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-white flex items-center gap-1.5">
                <span>VIRTUAL BILLBOARD</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40 font-mono">
                  [{selectedCity}]
                </span>
              </span>
            </div>
          </div>

          {/* Top Bid Alert Ticker or City Live Status */}
          <div className="flex items-center gap-3">
            {recentBidAlert ? (
              <div className="animate-bounce bg-amber-500/20 border border-amber-500/50 px-2.5 py-0.5 rounded-full text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{recentBidAlert}</span>
              </div>
            ) : showBadge ? (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE 24/7 STREAM</span>
              </div>
            ) : null}

            {/* Audio Indicator */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Mute Alert Audio' : 'Enable Alert Audio'}
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Billboard Creative Frame */}
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

          {/* Dark Gradient Overlay for Typography Clarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Dynamic 15s Countdown Ring & Slot Info */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="flex flex-col items-end">
                <span className="font-mono text-xs font-black text-white">{remainingSeconds}s</span>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-tight">ROTATION</span>
              </div>
            </div>
          </div>

          {/* Bottom Billboard Ad Details */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex items-end justify-between gap-4">
            <div className="space-y-1 max-w-[75%]">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded shadow">
                  SPONSORED
                </span>
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  {ad.advertiser || 'Top Bidder'}
                </span>
                {typeof ad.bid === 'number' && (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded">
                    ${(ad.bid / 100).toFixed(2)} BID
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-white line-clamp-1 drop-shadow-md">
                {ad.title}
              </h2>
            </div>

            {/* Optional QR Code Badge */}
            {showQr && (
              <div className="bg-white/95 p-1.5 rounded-lg shadow-xl border border-white flex flex-col items-center gap-0.5">
                <QrCode className="w-8 h-8 text-slate-950" />
                <span className="text-[8px] font-mono font-black text-slate-900 tracking-tighter uppercase">SCAN AD</span>
              </div>
            )}
          </div>

          {/* Smooth Slot Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Optional Live Streamer Ticker */}
        {showTicker && (
          <div className="bg-slate-950 px-3 py-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">
                Place instant bids at <span className="text-cyan-300 font-bold">livebillboards.lol</span> • 24/7 Global Slot Rotation
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-slate-500 text-[10px]">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{selectedCity} FEED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
