import React, { useState, useEffect, useRef } from 'react';
import { ActiveBillboardSlot, ChatMessage, TelemetryLog } from '../types';
import { StreamerLeaderboard } from './StreamerLeaderboard';
import {
  Monitor,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Send,
  Radio,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  Flame,
  MessageSquare,
  Users,
  Tag,
  Eye,
  TrendingUp,
  RotateCcw,
  HelpCircle,
  X,
  Tv,
  Info,
  Globe
} from 'lucide-react';

interface StreamerBillboardViewProps {
  slotData: ActiveBillboardSlot | null;
  selectedCity: string;
  selectedCountry: string;
  onCityChange: (city: string, country: string) => void;
  viewerPoints: number;
  onBidSubmitted?: () => void;
}

export const StreamerBillboardView: React.FC<StreamerBillboardViewProps> = ({
  slotData,
  selectedCity,
  selectedCountry,
  onCityChange,
  viewerPoints,
  onBidSubmitted
}) => {
  // Audio & Visual Effects State
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [activeParticles, setActiveParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  
  // Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_01',
      sender: 'CyberViewer_99',
      text: 'Watching live from Kuala Lumpur! The Petronas billboard looks insane 🇲🇾',
      timestamp: '13:42:01',
      type: 'user',
      avatarColor: 'bg-cyan-500'
    },
    {
      id: 'msg_02',
      sender: 'AUCTION_BOT',
      text: '⚡ [SYSTEM] Aegis Digital placed a top bid of $25.00 for SLOT-984321!',
      timestamp: '13:42:15',
      type: 'bid_alert',
      avatarColor: 'bg-amber-500'
    },
    {
      id: 'msg_03',
      sender: 'TokyoDrifter',
      text: 'Waiting for Shibuya zone bids to pop off 🔥',
      timestamp: '13:42:30',
      type: 'user',
      avatarColor: 'bg-purple-500'
    },
    {
      id: 'msg_04',
      sender: 'AdNerd_2026',
      text: 'Sub-millisecond Redis ZSET sorting latency is ridiculously crisp.',
      timestamp: '13:43:00',
      type: 'user',
      avatarColor: 'bg-emerald-500'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [senderHandle, setSenderHandle] = useState('Anon_Streamer');
  const [viewerCount, setViewerCount] = useState(1482);

  // Quick Bid Popover state inside Streamer View
  const [quickBidAmount, setQuickBidAmount] = useState('35.00');
  const [quickBidTitle, setQuickBidTitle] = useState('Cyber Neon Gaming Championship 2026');
  const [quickBidSubmitting, setQuickBidSubmitting] = useState(false);
  const [quickBidError, setQuickBidError] = useState<string | null>(null);
  const [quickBidSuccess, setQuickBidSuccess] = useState<string | null>(null);

  // Canvas Ref for Background Particle Stars / Synth Grid
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Image preloader ref to prevent layout shifts
  const [displayImage, setDisplayImage] = useState<string>('');
  const prevAdIdRef = useRef<string | null>(null);

  // Audio Context for Cyber Laser / Glitch SFX Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthesizedSfx = (type: 'bid' | 'transition' | 'reaction') => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'bid') {
        // High energy Cyber Arpeggio chime
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      } else if (type === 'transition') {
        // Sci-Fi Swoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      } else {
        // Pop reaction
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio synthesis disabled or blocked:', e);
    }
  };

  // Image preloading logic for zero layout shift
  useEffect(() => {
    if (slotData?.winningAd?.imageUrl) {
      const img = new Image();
      img.src = slotData.winningAd.imageUrl;
      img.onload = () => {
        setDisplayImage(slotData.winningAd.imageUrl);
      };

      // Detect ad change for transition trigger
      if (prevAdIdRef.current && prevAdIdRef.current !== slotData.winningAd.id) {
        playSynthesizedSfx('transition');
      }
      prevAdIdRef.current = slotData.winningAd.id;
    }
  }, [slotData?.winningAd?.id, slotData?.winningAd?.imageUrl]);

  // Handle WebSocket Event Triggers (e.g. Glitch Effect & Floating Particles)
  const triggerBidVisualMultiplier = (advertiser: string, amount: string) => {
    setGlitchActive(true);
    setFlashMessage(`🔥 NEW TOP BID $${amount} BY ${advertiser.toUpperCase()}!`);
    playSynthesizedSfx('bid');

    // Add chat alert
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: 'AUCTION_BOT',
      text: `⚡ [OUTBID ALERT] ${advertiser} placed a top bid of $${amount} for zone [${selectedCity}]!`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'bid_alert',
      avatarColor: 'bg-rose-500'
    };
    setChatMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      setGlitchActive(false);
    }, 1200);

    setTimeout(() => {
      setFlashMessage(null);
    }, 3500);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Background Canvas Ambient Cyber Matrix Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.5 ? '#06b6d4' : '#f59e0b'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid Lines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Moving Glowing Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fluctuating viewer count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Emoji Reaction Trigger
  const handleEmojiReaction = (emoji: string) => {
    playSynthesizedSfx('reaction');
    const newParticle = {
      id: Date.now() + Math.random(),
      x: Math.random() * 60 + 20, // percentage x
      y: 80, // percentage y start
      emoji
    };
    setActiveParticles((prev) => [...prev, newParticle]);

    setTimeout(() => {
      setActiveParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 2000);

    // Post to live chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: `react_${Date.now()}`,
        sender: senderHandle,
        text: `reacted with ${emoji}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'reaction',
        reactionEmoji: emoji,
        avatarColor: 'bg-indigo-500'
      }
    ]);
  };

  // Send Live Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: `usr_msg_${Date.now()}`,
      sender: senderHandle || 'AnonStreamer',
      text: inputMsg.trim(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'user',
      avatarColor: 'bg-cyan-500'
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  // Submit Quick Bid from Streamer View
  const handleQuickBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickBidSubmitting(true);
    setQuickBidError(null);
    setQuickBidSuccess(null);

    const cents = Math.round(parseFloat(quickBidAmount) * 100);

    try {
      const res = await fetch('/api/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickBidTitle,
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
          targetCityCode: selectedCity,
          targetCountryCode: selectedCountry,
          bidAmountCents: cents,
          advertiserName: senderHandle || 'Streamer Bidder'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setQuickBidError(data.error || 'Bid submission failed');
      } else {
        setQuickBidSuccess(`Bid placed! Safety Score: ${data.safetyScore}%`);
        triggerBidVisualMultiplier(senderHandle || 'Streamer Bidder', quickBidAmount);
        if (onBidSubmitted) onBidSubmitted();
      }
    } catch (err: any) {
      setQuickBidError(err.message || 'Network error');
    } finally {
      setQuickBidSubmitting(false);
    }
  };

  if (!slotData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="font-mono text-sm">Initializing High-Definition Streamer Feed...</p>
      </div>
    );
  }

  const { remainingSeconds, winningAd, fallbackLevel, fallbackChain } = slotData;
  const progressPercent = ((15 - remainingSeconds) / 15) * 100;

  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}
    >
      {/* Streamer Top Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-red-950/80 border border-red-800/80 text-red-400 rounded-lg flex items-center gap-2 font-bold animate-pulse">
            <Radio className="w-4 h-4" />
            <span>LIVE 4K STREAM</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span><strong className="text-white">{viewerCount.toLocaleString()}</strong> Streamers</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Geofence: <strong className="text-cyan-300">{selectedCity} / {selectedCountry}</strong></span>
          </div>
        </div>

        {/* Quick Location Switcher Buttons */}
        <div className="flex items-center gap-2">
          {[
            { city: 'KUL', country: 'MY', label: '🇲🇾 KL' },
            { city: 'TYO', country: 'JP', label: '🇯🇵 Tokyo' },
            { city: 'NYC', country: 'US', label: '🇺🇸 NYC' },
            { city: 'LON', country: 'UK', label: '🇬🇧 London' }
          ].map((loc) => (
            <button
              key={loc.city}
              onClick={() => onCityChange(loc.city, loc.country)}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-bold ${
                selectedCity === loc.city
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {loc.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg border transition-all ${
              audioEnabled
                ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={audioEnabled ? 'Cyber Sound SFX Active' : 'Sound Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-all"
            title="Toggle Theater / Second Monitor Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Streamer Role Purpose Help Modal Toggle */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg transition-all flex items-center gap-1.5 font-bold text-xs"
            title="What is Streamer Mode?"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Role Purpose</span>
          </button>
        </div>
      </div>

      {/* Streamer Role Purpose Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Streamer Role Purpose
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live Broadcast Display & Large Screen Streamer Mode
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  What is the Streamer Role?
                </h4>
                <p>
                  The <strong className="text-white">Streamer Role</strong> is specifically engineered for live streamers, influencers, venue operators, public lounge displays, and content creators to feature live 24/7 virtual billboard feeds on large screens or broadcast overlays (Twitch, YouTube, venue monitors).
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Key Benefits & Features:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> 70% Revenue Share
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Earn passive payout rewards for every viewer watching your venue display.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-bold text-cyan-400 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" /> 4K Zero-Latency Feed
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Synchronized WebSocket stream optimized for second monitors & TV screens.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-bold text-purple-400 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Live Audience Chat
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Interactive viewer reaction emojis & real-time chat overlays.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Instant Outbid Alerts
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Cyber glitch audio-visual SFX whenever advertiser RTB bids win slot auctions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-wider"
              >
                Got It — Return to Live Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Billboard Stream Canvas (Left 8/12) + Live Stream Chat (Right 4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Modern Virtual Billboard Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl group min-h-[460px] flex flex-col justify-between">
            {/* Ambient Animated Canvas Background */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />

            {/* Glowing Glitch & Lightning Border Effect on Bid Multiplier */}
            <div
              className={`absolute inset-0 z-10 pointer-events-none transition-all duration-300 ${
                glitchActive
                  ? 'ring-8 ring-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.6)] mix-blend-screen bg-cyan-500/10'
                  : ''
              }`}
            />

            {/* High Bid Alert Flash Floating Banner */}
            {flashMessage && (
              <div className="absolute top-16 inset-x-6 z-30 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 p-3 rounded-xl font-mono text-center font-black text-sm tracking-wider shadow-2xl animate-bounce border border-white/40 flex items-center justify-center gap-2">
                <Flame className="w-5 h-5 fill-current animate-spin" />
                <span>{flashMessage}</span>
                <Zap className="w-5 h-5 fill-current" />
              </div>
            )}

            {/* Floating Reaction Emojis Burst */}
            {activeParticles.map((p) => (
              <div
                key={p.id}
                className="absolute z-40 text-3xl pointer-events-none transition-all duration-1000 ease-out animate-ping"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                {p.emoji}
              </div>
            ))}

            {/* Billboard Header Status Bar */}
            <div className="relative z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="bg-cyan-950 border border-cyan-800 text-cyan-400 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  GEOLOCATION: {selectedCity} / {selectedCountry}
                </span>

                <span className="hidden sm:inline-block bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-slate-400">
                  Fallback Level: <strong className="text-cyan-300">{fallbackLevel.toUpperCase()}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-800/50">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="text-sm tracking-widest">{remainingSeconds}s</span>
                </div>
              </div>
            </div>

            {/* 15-Second Slot Smooth Countdown Progress Bar */}
            <div className="relative z-20 w-full bg-slate-900 h-1.5">
              <div
                className="bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 h-1.5 transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Billboard Center Active Display Area */}
            <div className="relative z-10 aspect-video w-full max-h-[460px] bg-slate-900 flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={winningAd.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    glitchActive ? 'scale-105 filter contrast-125 saturate-150 blur-[0.5px]' : ''
                  }`}
                />
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="font-mono text-xs">Streaming 4K Billboard Stream...</p>
                </div>
              )}

              {/* Holographic Overlay Footer Information Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-6 flex flex-wrap items-end justify-between gap-4 z-20">
                <div className="max-w-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900/90 backdrop-blur-md text-cyan-300 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-cyan-500/40 shadow-lg">
                      {winningAd.advertiserName}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {winningAd.title}
                  </h2>

                  {/* Single CTA Overlay (Website or WhatsApp) */}
                  {((winningAd as any).ctaType !== 'none') && (
                    <div className="pt-1">
                      {((winningAd as any).ctaType === 'whatsapp' || (!(winningAd as any).ctaType && !(winningAd as any).landingPageUrl && (winningAd as any).whatsappLink)) ? (
                        <a
                          href={(winningAd as any).ctaUrl || ((winningAd as any).whatsappLink?.startsWith('http') ? (winningAd as any).whatsappLink : `https://wa.me/${((winningAd as any).whatsappLink || '').replace(/[^0-9]/g, '')}`)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-lg shadow-md transition-transform hover:scale-105"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp Contact</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      ) : ((winningAd as any).ctaUrl || (winningAd as any).landingPageUrl) ? (
                        <a
                          href={(winningAd as any).ctaUrl || (winningAd as any).landingPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-lg shadow-md transition-transform hover:scale-105 font-mono"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{((winningAd as any).ctaUrl || (winningAd as any).landingPageUrl || '').replace(/^https?:\/\//, '')}</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 p-3.5 rounded-2xl text-right font-mono shadow-2xl">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">Active Slot Winner Bid</div>
                  <div className="text-2xl font-black text-cyan-400 flex items-baseline justify-end gap-1">
                    <span>${(winningAd.bidAmountCents / 100).toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-normal">/ 15s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billboard Bottom Status Bar */}
            <div className="relative z-20 bg-slate-900/90 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  Target: <strong className="text-white">{winningAd.targetCityCode} / {winningAd.targetCountryCode}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>RTB Latency: <strong>{fallbackChain.latencyMs}ms</strong></span>
              </div>
            </div>
          </div>

          {/* Real-Time Framer Motion Leaderboard Component for Top 3 Bidders */}
          <StreamerLeaderboard
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            onQuickOutbid={(recommendedDollars) => {
              setQuickBidAmount(recommendedDollars);
              setQuickBidTitle(`Competitive Outbid (${selectedCity})`);
            }}
          />

          {/* Direct Quick Bid Bar in Streamer View */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Quick Outbid Console ({selectedCity} Zone):
              </span>
              <span className="text-slate-500">Min Outbid: ${(winningAd.bidAmountCents / 100 + 1.00).toFixed(2)}</span>
            </div>

            <form onSubmit={handleQuickBid} className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <div className="flex-1 min-w-[180px]">
                <input
                  type="text"
                  value={quickBidTitle}
                  onChange={(e) => setQuickBidTitle(e.target.value)}
                  placeholder="Ad Title / Message"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="w-28 relative">
                <span className="absolute left-2.5 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  step="0.50"
                  value={quickBidAmount}
                  onChange={(e) => setQuickBidAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-6 pr-2 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={quickBidSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
              >
                {quickBidSubmitting ? 'Bidding...' : 'Outbid Now'}
              </button>
            </form>

            {quickBidError && <p className="text-rose-400 text-[11px] font-bold">{quickBidError}</p>}
            {quickBidSuccess && <p className="text-emerald-400 text-[11px] font-bold">{quickBidSuccess}</p>}
          </div>
        </div>

        {/* RIGHT COLUMN: Global Sidebar Live Stream Chat */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 font-mono text-xs flex flex-col justify-between h-[590px] shadow-2xl">
            {/* Live Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white">Live Stream Chat</h3>
              </div>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                {selectedCity} ROOM
              </span>
            </div>

            {/* Message Stream Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl text-xs space-y-1 transition-all ${
                    msg.type === 'bid_alert'
                      ? 'bg-amber-950/60 border border-amber-800/80 text-amber-200'
                      : msg.type === 'reaction'
                      ? 'bg-purple-950/40 border border-purple-800/40 text-purple-300'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${msg.avatarColor || 'bg-cyan-500'}`} />
                      {msg.sender}
                    </span>
                    <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">{msg.text}</p>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Emoji Reaction Buttons Bar */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="text-[10px] text-slate-400 font-semibold">Live Reactions (Triggers Floating FX):</div>
              <div className="flex items-center justify-between gap-1">
                {['🔥', '🚀', '💎', '⚡', '🤑', '👑'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiReaction(emoji)}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-lg hover:scale-125 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={senderHandle}
                  onChange={(e) => setSenderHandle(e.target.value)}
                  placeholder="Handle"
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-cyan-400 font-bold focus:outline-none text-[11px]"
                />
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Send message to live chat..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 text-[11px]"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
