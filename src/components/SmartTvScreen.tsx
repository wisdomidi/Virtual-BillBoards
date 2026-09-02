import React, { useState, useEffect, useRef } from 'react';
import { ActiveBillboardSlot, BillboardAd } from '../types';
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
  Award,
  Radio
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { generate20AdsForCity } from '../data/seedAds';

interface SmartTvScreenProps {
  slotData?: ActiveBillboardSlot | null;
  selectedCity?: string;
}

// Built-in high-definition fallback house & seeded ads so TV displays rotate all 20+ ads
const SEEDED_TV_ADS: BillboardAd[] = generate20AdsForCity('GLOBAL', 'US', 'Global Network Feed').map(ad => ({
  id: ad.id,
  title: ad.title,
  advertiserName: ad.advertiserName,
  bidAmountCents: ad.bidAmountCents || 100,
  imageUrl: ad.imageUrl,
  ctaUrl: ad.ctaUrl || ad.landingPageUrl || 'https://www.livebillboards.lol',
  cityCode: ad.targetCityCode || 'GLOBAL',
  countryCode: ad.targetCountryCode || 'GLOBAL',
  mediaType: ad.mediaType || 'image',
  category: ad.industry || 'tech',
  isApproved: true,
  viewCount: 14200,
  scanCount: 310,
  createdAt: ad.createdAt
}));

const DEFAULT_HOUSE_ADS: BillboardAd[] = [
  ...SEEDED_TV_ADS,
  {
    id: 'house_brand_global_1',
    title: 'World-First 24/7 Virtual Billboard Network',
    advertiserName: 'LiveBillboards Foundation',
    bidAmountCents: 100,
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=85',
    ctaUrl: 'https://www.livebillboards.lol',
    cityCode: 'GLOBAL',
    countryCode: 'US',
    mediaType: 'image',
    category: 'tech',
    isApproved: true,
    viewCount: 15420,
    scanCount: 382,
    createdAt: new Date().toISOString()
  },
  {
    id: 'house_brand_global_2',
    title: 'Monetize Idle Screen Real Estate with Solana USDC',
    advertiserName: 'LiveBillboards TV Partner Program',
    bidAmountCents: 150,
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=85',
    ctaUrl: 'https://www.livebillboards.lol/pair',
    cityCode: 'GLOBAL',
    countryCode: 'US',
    mediaType: 'image',
    category: 'crypto',
    isApproved: true,
    viewCount: 12100,
    scanCount: 294,
    createdAt: new Date().toISOString()
  },
  {
    id: 'house_brand_global_3',
    title: 'Autonomous AI Agent Real-Time Bidding Protocol',
    advertiserName: 'WebMCP Agentic Ad Mesh',
    bidAmountCents: 200,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=85',
    ctaUrl: 'https://www.livebillboards.lol/ai_agents',
    cityCode: 'GLOBAL',
    countryCode: 'US',
    mediaType: 'image',
    category: 'tech',
    isApproved: true,
    viewCount: 9840,
    scanCount: 215,
    createdAt: new Date().toISOString()
  }
];

export const SmartTvScreen: React.FC<SmartTvScreenProps> = ({
  slotData: initialSlotData = null,
  selectedCity = 'GLOBAL'
}) => {
  const [isPaired, setIsPaired] = useState<boolean>(() => {
    return localStorage.getItem('vb_tv_paired') === 'true';
  });

  const [pin, setPin] = useState<string>(() => {
    return localStorage.getItem('vb_tv_saved_pin') || '';
  });
  const [formattedPin, setFormattedPin] = useState<string>('--- ---');
  const [pairingUrl, setPairingUrl] = useState<string>('https://www.livebillboards.lol/pair');
  const [loadingPin, setLoadingPin] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [venueInfo, setVenueInfo] = useState<{ name: string; city: string; wallet?: string }>({
    name: localStorage.getItem('vb_tv_venue_name') || 'Lobby TV Screen',
    city: localStorage.getItem('vb_tv_venue_city') || selectedCity || 'GLOBAL',
    wallet: localStorage.getItem('vb_tv_venue_wallet') || ''
  });

  // Active slot and live ad playback state
  const [currentSlot, setCurrentSlot] = useState<ActiveBillboardSlot | null>(initialSlotData);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15);
  const [houseAdsCatalog, setHouseAdsCatalog] = useState<BillboardAd[]>(DEFAULT_HOUSE_ADS);
  const [houseAdIndex, setHouseAdIndex] = useState<number>(0);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<any>(null);

  // 1. Request new 6-digit TV PIN on mount if not paired
  const fetchPin = async () => {
    setLoadingPin(true);
    try {
      const res = await fetch('/api/tv/create-pin', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPin(data.pin);
        setFormattedPin(data.formattedPin);
        setPairingUrl(data.pairingUrl);
        localStorage.setItem('vb_tv_saved_pin', data.pin);

        // Direct Firestore registration for instant admin visibility
        if (db && data.pin) {
          try {
            const screenRef = doc(db, 'screens', data.pin);
            setDoc(screenRef, {
              pin: data.pin,
              formattedPin: data.formattedPin,
              venueName: 'Pending Smart TV Display',
              city: (venueInfo.city || selectedCity || 'GLOBAL').toUpperCase(),
              status: 'pending_pairing',
              deviceType: 'Smart TV (WebOS/Tizen/FireTV)',
              resolution: '4K Ultra-HD (3840x2160)',
              createdAt: Date.now(),
              lastHeartbeat: Date.now()
            }, { merge: true }).catch(() => {});
          } catch {}
        }
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

  // 2. Fetch Active Slot for City / Global Broadcast
  const fetchActiveSlot = async () => {
    try {
      const city = venueInfo.city || selectedCity || 'GLOBAL';
      const res = await fetch(`/api/slots/active?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.winningAd || data.ad)) {
          setCurrentSlot(data);
          if (typeof data.remainingSeconds === 'number') {
            setRemainingSeconds(data.remainingSeconds);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Active slot fetch note:', err);
    }

    // If no active winning slot ad, rotate to next house ad
    setHouseAdIndex((prev) => (prev + 1) % (houseAdsCatalog.length || 1));
  };

  // Fetch house ads catalog
  useEffect(() => {
    const fetchHouseAds = async () => {
      try {
        const res = await fetch('/api/admin/house-ads');
        if (res.ok) {
          const data = await res.json();
          if (data.houseAds && Array.isArray(data.houseAds) && data.houseAds.length > 0) {
            const mapped: BillboardAd[] = data.houseAds.map((ha: any) => ({
              id: ha.id,
              title: ha.title,
              advertiserName: 'LiveBillboards Verified House Sponsor',
              bidAmountCents: 100,
              imageUrl: ha.imageUrl,
              ctaUrl: ha.ctaUrl || 'https://www.livebillboards.lol',
              cityCode: ha.targetCityCode || 'GLOBAL',
              countryCode: 'GLOBAL',
              mediaType: ha.mediaType || 'image',
              category: ha.category || 'tech',
              isApproved: true,
              viewCount: ha.impressions || 1000,
              scanCount: ha.clicks || 50,
              createdAt: ha.createdAt || new Date().toISOString()
            }));
            setHouseAdsCatalog([...mapped, ...SEEDED_TV_ADS]);
          }
        }
      } catch {}
    };
    fetchHouseAds();
    fetchActiveSlot();
  }, [venueInfo.city, selectedCity]);

  // 3. WebSocket Connection for Real-Time Slot Rotations & TV Commands
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsLiveConnected(true);
          const cityCode = venueInfo.city || selectedCity || 'GLOBAL';
          ws.send(JSON.stringify({
            type: 'SUBSCRIBE',
            channel: `billboard:${cityCode.toUpperCase()}`,
            clientType: 'smart_tv',
            pin: pin || localStorage.getItem('vb_tv_saved_pin') || ''
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'SLOT_TRANSITION' || msg.type === 'SLOT_LIVE_START' || msg.type === 'SLOT_CHANGED' || msg.type === 'SLOT_DATA' || msg.type === 'INIT' || msg.type === 'INIT_STATE') {
              if (msg.payload) {
                // If payload has winningAd directly or adTitle
                const payloadAd = msg.payload.winningAd || (msg.payload.adTitle ? {
                  id: msg.payload.slotId,
                  title: msg.payload.adTitle,
                  imageUrl: msg.payload.imageUrl,
                  advertiserName: msg.payload.advertiser || 'Verified Advertiser',
                  bidAmountDollars: msg.payload.bidAmountDollars,
                  qrCodeUrl: msg.payload.dynamicQrUrl
                } : null);

                setCurrentSlot({
                  ...msg.payload,
                  winningAd: payloadAd || msg.payload.winningAd
                });
                setRemainingSeconds(msg.payload.remainingSeconds ?? 15);
                soundEffects.playSlideClick();
              }
            } else if (msg.type === 'SLOT_TICK' || msg.type === 'TICK') {
              if (typeof msg.payload?.remainingSeconds === 'number') {
                setRemainingSeconds(msg.payload.remainingSeconds);
              }
            } else if (msg.type === 'TV_SCREEN_PAIRED') {
              const pairedPin = msg.payload?.pin;
              const currentPin = pin || localStorage.getItem('vb_tv_saved_pin');
              if (pairedPin === currentPin) {
                soundEffects.playKaChing();
                setIsPaired(true);
                setVenueInfo({
                  name: msg.payload.venueName || 'Verified Venue Screen',
                  city: msg.payload.city || 'GLOBAL',
                  wallet: msg.payload.solanaWallet
                });
                localStorage.setItem('vb_tv_paired', 'true');
                localStorage.setItem('vb_tv_venue_name', msg.payload.venueName || '');
                localStorage.setItem('vb_tv_venue_city', msg.payload.city || 'GLOBAL');
                if (msg.payload.solanaWallet) {
                  localStorage.setItem('vb_tv_venue_wallet', msg.payload.solanaWallet);
                }
              }
            } else if (msg.type === 'TV_SCREEN_EJECTED') {
              const ejectedPin = msg.payload?.pin;
              const currentPin = pin || localStorage.getItem('vb_tv_saved_pin');
              if (ejectedPin === currentPin) {
                setIsPaired(false);
                localStorage.removeItem('vb_tv_paired');
                localStorage.removeItem('vb_tv_venue_name');
                localStorage.removeItem('vb_tv_venue_wallet');
                localStorage.removeItem('vb_tv_saved_pin');
                fetchPin();
              }
            }
          } catch {}
        };

        ws.onclose = () => {
          setIsLiveConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [pin, venueInfo.city, selectedCity]);

  // 4. Fallback Countdown Interval & Slot Re-fetcher
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          fetchActiveSlot();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [houseAdsCatalog, venueInfo.city]);

  // 5. Poll pairing status every 3 seconds while waiting for venue owner to pair on phone
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

  // 6. Smart TV Heartbeat: Send ping every 25s while paired to keep Admin Dashboard "Online"
  useEffect(() => {
    if (!isPaired) return;

    const sendHeartbeat = () => {
      let activePin = pin || localStorage.getItem('vb_tv_saved_pin');
      if (!activePin) {
        activePin = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('vb_tv_saved_pin', activePin);
        setPin(activePin);
      }
      fetch('/api/tv/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: activePin,
          venueName: venueInfo.name,
          city: venueInfo.city,
          solanaWallet: venueInfo.wallet
        })
      }).catch(() => {});

      // Direct Firestore heartbeat write
      if (db && activePin) {
        try {
          const screenRef = doc(db, 'screens', activePin);
          setDoc(screenRef, {
            pin: activePin,
            formattedPin: `${activePin.substring(0, 3)}-${activePin.substring(3)}`,
            venueName: venueInfo.name || 'Verified Smart TV Screen',
            city: (venueInfo.city || selectedCity || 'GLOBAL').toUpperCase(),
            solanaWallet: venueInfo.wallet || null,
            status: 'paired',
            deviceType: 'Smart TV (WebOS/Tizen/FireTV)',
            resolution: '4K Ultra-HD (3840x2160)',
            pairedAt: localStorage.getItem('vb_tv_paired_at') || new Date().toISOString(),
            lastHeartbeat: Date.now()
          }, { merge: true }).catch(() => {});
        } catch {}
      }
    };

    sendHeartbeat();
    heartbeatTimerRef.current = setInterval(sendHeartbeat, 25000);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [isPaired, pin, venueInfo]);

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
            <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-2xl shadow-lg shadow-cyan-500/10">
              <Tv className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>LiveBillboards TV Setup</span>
                <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full font-mono">
                  Smart TV DOOH Mode
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Connect this screen to your venue's Solana payout wallet to start earning 70% rev-share 24/7.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Fullscreen Display"
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
          <div className="lg:col-span-7 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border-2 border-cyan-500/50 p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold font-mono uppercase">
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
                <div className="text-6xl sm:text-8xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 drop-shadow-2xl select-all">
                  {formattedPin || '834-192'}
                </div>
                <p className="text-xs font-mono text-slate-400">PIN expires in 15 minutes • Auto-refreshes on pair</p>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl">
                <span className="text-xs font-black text-cyan-400 font-mono block">STEP 1</span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Open <strong>livebillboards.lol/pair</strong> on your phone or laptop.
                </p>
              </div>
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl">
                <span className="text-xs font-black text-amber-400 font-mono block">STEP 2</span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Enter PIN <strong>{formattedPin || '834-192'}</strong>.
                </p>
              </div>
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl">
                <span className="text-xs font-black text-purple-400 font-mono block">STEP 3</span>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Add Venue Name & Solana wallet. Screen turns on live!
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
            onClick={() => {
              setIsPaired(true);
              localStorage.setItem('vb_tv_paired', 'true');
            }}
            className="text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
          >
            Launch Live Broadcast Demo Screen ➔
          </button>
        </div>
      </div>
    );
  }

  // PAIRED MODE: Active live advertiser ad or dynamic fallback house ad
  const winningAd = currentSlot?.winningAd;
  const currentHouseAd = houseAdsCatalog[houseAdIndex % (houseAdsCatalog.length || 1)] || DEFAULT_HOUSE_ADS[0];
  const activeAd: BillboardAd = winningAd || currentHouseAd;
  const isVideo = activeAd?.mediaType === 'video' || activeAd?.imageUrl?.startsWith('data:video/') || activeAd?.imageUrl?.includes('.mp4');

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col justify-between font-sans select-none overflow-hidden animate-fade-in">
      {/* Top HUD: Venue Name, Live DOOH Status, 15s Countdown */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md rounded-2xl flex items-center gap-3 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <span>{venueInfo.name}</span>
                <span className="text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono px-1.5 py-0.2 rounded">
                  PIN: {pin ? `${pin.substring(0, 3)}-${pin.substring(3)}` : 'ACTIVE'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{venueInfo.city} Display Feed</span>
                {venueInfo.wallet && (
                  <span className="text-emerald-400 font-bold">• 70% Solana Payouts Active</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-slate-950/90 border border-slate-700 text-slate-300 hover:text-white rounded-xl backdrop-blur-md cursor-pointer transition-colors shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-950/90 border border-slate-700 text-slate-300 hover:text-white rounded-xl backdrop-blur-md cursor-pointer transition-colors shadow-lg"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 bg-rose-950/90 border border-rose-500/60 backdrop-blur-md text-rose-300 font-mono font-black text-sm rounded-2xl shadow-2xl flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-rose-400" style={{ animationDuration: '8s' }} />
            <span>⏱️ {remainingSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Main Fullscreen Video/Image Display */}
      <div className="w-full h-full relative flex items-center justify-center bg-black">
        {isVideo ? (
          <video
            key={activeAd.imageUrl}
            src={activeAd.imageUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover transition-opacity duration-700"
          />
        ) : (
          <img
            key={activeAd.imageUrl}
            src={activeAd.imageUrl}
            alt={activeAd.title}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
        )}

        {/* Ambient Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/50 pointer-events-none" />
      </div>

      {/* Bottom HUD: Live Ad Sponsor Badge & Dynamic Customer QR Code */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Ad Title & Sponsor Info */}
        <div className="bg-slate-950/95 border border-slate-800/90 backdrop-blur-md px-5 py-3 rounded-2xl max-w-xl shadow-2xl">
          <div className="text-sm font-black text-white truncate flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{activeAd.title || 'Live Virtual Billboard'}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>Sponsor: <strong className="text-cyan-300">{activeAd.advertiserName || 'Live Sponsor'}</strong></span>
            <span>•</span>
            <span className="text-amber-400 font-mono font-bold">${((activeAd.bidAmountCents || 100) / 100).toFixed(2)} Live Slot</span>
            {isLiveConnected && (
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                ● LIVE SYNC
              </span>
            )}
          </div>
        </div>

        {/* Right: Dynamic Interactive Customer Scan QR Code (Proof-of-Physical-Presence) */}
        <div className="bg-slate-950/95 border-2 border-amber-400/70 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto">
          <div className="p-1 bg-white rounded-xl shadow-md">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(activeAd.ctaUrl || 'https://www.livebillboards.lol/watcher')}`}
              alt="Scan Offer QR"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Scan On Phone</span>
            </div>
            <p className="text-[10px] text-slate-300 font-semibold max-w-[140px] leading-tight mt-0.5">
              Claim sponsor offer or mine rewards in this venue!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
