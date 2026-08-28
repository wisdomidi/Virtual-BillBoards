import React, { useState, useEffect } from 'react';
import { ActiveBillboardSlot } from '../types';
import {
  Tv,
  QrCode,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Award
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';

interface SmartTvScreenProps {
  slotData: ActiveBillboardSlot | null;
  selectedCity: string;
}

export const SmartTvScreen: React.FC<SmartTvScreenProps> = ({
  slotData,
  selectedCity
}) => {
  const [isPaired, setIsPaired] = useState<boolean>(() => {
    return localStorage.getItem('vb_tv_paired') === 'true';
  });

  const [pin, setPin] = useState<string>('');
  const [formattedPin, setFormattedPin] = useState<string>('--- ---');
  const [pairingUrl, setPairingUrl] = useState<string>('https://www.livebillboards.lol/pair');
  const [loadingPin, setLoadingPin] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [venueInfo, setVenueInfo] = useState<{ name: string; city: string; wallet?: string }>({
    name: localStorage.getItem('vb_tv_venue_name') || 'Lobby TV Screen',
    city: localStorage.getItem('vb_tv_venue_city') || selectedCity || 'GLOBAL',
    wallet: localStorage.getItem('vb_tv_venue_wallet') || ''
  });

  // Request new 6-digit TV PIN on mount if not paired
  const fetchPin = async () => {
    setLoadingPin(true);
    try {
      const res = await fetch('/api/tv/create-pin', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPin(data.pin);
        setFormattedPin(data.formattedPin);
        setPairingUrl(data.pairingUrl);
      }
    } catch (e) {
      console.warn('TV PIN generation note:', e);
    } finally {
      setLoadingPin(false);
    }
  };

  useEffect(() => {
    if (!isPaired) {
      fetchPin();
    }
  }, [isPaired]);

  // Poll pairing status every 3 seconds while waiting for venue owner to pair on phone
  useEffect(() => {
    if (isPaired || !pin) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tv/poll-status/${pin}`);
        const data = await res.json();
        if (data.success && data.paired && data.session) {
          soundEffects.playKaChing();
          setIsPaired(true);
          setVenueInfo({
            name: data.session.venueName || 'Verified Venue Screen',
            city: data.session.city || 'GLOBAL',
            wallet: data.session.solanaWallet
          });
          localStorage.setItem('vb_tv_paired', 'true');
          localStorage.setItem('vb_tv_venue_name', data.session.venueName || '');
          localStorage.setItem('vb_tv_venue_city', data.session.city || 'GLOBAL');
          if (data.session.solanaWallet) {
            localStorage.setItem('vb_tv_venue_wallet', data.session.solanaWallet);
          }
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaired, pin]);

  // Listen to WebSocket pairing broadcasts
  useEffect(() => {
    const handleWsPair = (e: any) => {
      if (e.detail?.pin === pin) {
        soundEffects.playKaChing();
        setIsPaired(true);
        setVenueInfo({
          name: e.detail.venueName || 'Verified Venue Screen',
          city: e.detail.city || 'GLOBAL',
          wallet: e.detail.solanaWallet
        });
      }
    };
    window.addEventListener('tv:paired' as any, handleWsPair);
    return () => window.removeEventListener('tv:paired' as any, handleWsPair);
  }, [pin]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // UNPAIRED MODE: Bold 6-Digit PIN Screen for Cafe / Gym / Co-Working Screen Setup
  if (!isPaired) {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between p-8 sm:p-12 font-sans select-none overflow-hidden animate-fade-in">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-2xl">
              <Tv className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>LiveBillboards TV Setup</span>
                <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full font-mono">
                  Smart TV Mode
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Connect this display to your venue's Solana payout wallet to start earning 70% rev-share 24/7.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:text-white cursor-pointer"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Waiting for Pair...</span>
            </div>
          </div>
        </div>

        {/* Center: 6-Digit PIN & Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto w-full my-auto">
          {/* Left: 6-Digit Big Code Box */}
          <div className="lg:col-span-7 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border-2 border-cyan-500/50 p-8 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold font-mono uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your Screen Pairing PIN</span>
            </div>

            {loadingPin ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Generating secure 6-digit TV PIN...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-6xl sm:text-8xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 drop-shadow-2xl">
                  {formattedPin}
                </div>
                <p className="text-xs font-mono text-slate-400">PIN expires in 15 minutes • Auto-refreshes on pair</p>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <span className="text-xs font-black text-cyan-400 font-mono block">STEP 1</span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Open <strong>livebillboards.lol/pair</strong> on your phone or laptop.
                </p>
              </div>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <span className="text-xs font-black text-amber-400 font-mono block">STEP 2</span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Enter the 6-digit PIN <strong>{formattedPin}</strong>.
                </p>
              </div>
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <span className="text-xs font-black text-purple-400 font-mono block">STEP 3</span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Add your Venue Name & Solana wallet. Screen turns on instantly!
                </p>
              </div>
            </div>
          </div>

          {/* Right: Scan with Phone QR Code */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-5 shadow-2xl">
            <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl inline-block border border-purple-500/30">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-white">Scan with Camera to Pair</h3>
              <p className="text-xs text-slate-400 mt-1">
                Point your iPhone or Android camera at the QR code below to pair instantly without typing.
              </p>
            </div>

            {/* Generated QR Code Image */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pairingUrl)}`}
                alt="Pair TV Screen QR"
                className="w-44 h-44 object-contain"
              />
            </div>

            <div className="text-xs font-mono text-cyan-400 font-bold break-all">
              {pairingUrl}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-4">
          <span>LiveBillboards Smart TV OS v2.4 • Compatible with Android TV, Fire TV, LG webOS & Samsung Tizen</span>
          <button
            onClick={() => setIsPaired(true)}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Skip to Demo Screen ➔
          </button>
        </div>
      </div>
    );
  }

  // PAIRED MODE: Fullscreen 24/7 Live Billboard Player with Venue Header & Customer QR Scanner
  const ad = slotData?.winningAd;
  const isVideo = ad?.mediaType === 'video' || ad?.imageUrl?.startsWith('data:video/') || ad?.imageUrl?.includes('.mp4');

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col justify-between font-sans select-none overflow-hidden">
      {/* Top HUD: Venue Name, Live Status, 15s Timer */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md rounded-2xl flex items-center gap-2.5 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-black uppercase text-white tracking-wider">{venueInfo.name}</div>
              <span className="text-[10px] font-mono text-cyan-300">Live DOOH Screen • {venueInfo.city}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-slate-950/90 border border-slate-700 text-slate-300 hover:text-white rounded-xl backdrop-blur-md cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-950/90 border border-slate-700 text-slate-300 hover:text-white rounded-xl backdrop-blur-md cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 bg-rose-950/90 border border-rose-500/60 backdrop-blur-md text-rose-300 font-mono font-black text-sm rounded-2xl shadow-2xl flex items-center gap-1.5">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span>⏱️ {slotData?.remainingSeconds ?? 15}s</span>
          </div>
        </div>
      </div>

      {/* Main Fullscreen Video/Image Display */}
      <div className="w-full h-full relative flex items-center justify-center bg-black">
        {ad ? (
          isVideo ? (
            <video
              src={ad.imageUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="text-center space-y-3">
            <Tv className="w-16 h-16 text-cyan-400/40 animate-pulse mx-auto" />
            <div className="text-lg font-black text-slate-300">LiveBillboards 24/7 Screen Active</div>
            <p className="text-xs text-slate-500">Waiting for next incoming advertiser / AI agent micro-bid...</p>
          </div>
        )}

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
      </div>

      {/* Bottom Bar: Customer Proof-of-Scan QR & Live Ad Title */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Ad Title & Sponsor */}
        <div className="bg-slate-950/90 border border-slate-800/90 backdrop-blur-md px-5 py-3 rounded-2xl max-w-xl shadow-2xl">
          <div className="text-sm font-black text-white truncate">{ad?.title || 'World-First 24/7 Virtual Billboard'}</div>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>Sponsor: <strong className="text-cyan-300">{ad?.advertiserName || 'Live Sponsor'}</strong></span>
            <span>•</span>
            <span className="text-amber-400 font-mono font-bold">${((ad?.bidAmountCents || 100) / 100).toFixed(2)} Bid</span>
          </div>
        </div>

        {/* Right: Dynamic Interactive Customer Scan QR Code (Proof-of-Physical-Presence) */}
        <div className="bg-slate-950/95 border-2 border-amber-400/60 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="p-1 bg-white rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ad?.ctaUrl || 'https://www.livebillboards.lol/watcher')}`}
              alt="Scan Offer QR"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-current" />
              <span>Scan On Phone</span>
            </div>
            <p className="text-[10px] text-slate-300 font-semibold max-w-[130px] leading-tight mt-0.5">
              Claim sponsor offer or mine rewards in this venue!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
