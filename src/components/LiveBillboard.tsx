import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ActiveBillboardSlot, CityConfig, UserRole } from '../types';
import { LandmarkFrame } from './LandmarkFrame';
import { SmartOverlay } from './SmartOverlay';
import { CITY_LIVE_UPDATES } from '../data/cityLiveUpdates';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Award,
  Zap,
  Tag,
  Eye,
  AlertTriangle,
  Maximize2,
  Sparkles,
  Volume2,
  VolumeX,
  Globe,
  Radio,
  Search,
  Wallet,
  Megaphone,
  CheckCircle2,
  Bot,
  Plus,
  Upload,
  Info,
  DollarSign,
  HelpCircle,
  FileImage,
  Car,
  ChevronDown,
  Sparkle,
  MessageSquare,
  LogIn,
  Flame,
  Coins,
  UploadCloud,
  Share2,
  Copy,
  ExternalLink,
  Link2,
  QrCode,
  Camera
} from 'lucide-react';
import { getCityLocalTime } from '../lib/timezones';
import { ShareProofModal } from './ShareProofModal';
import { soundEffects } from '../lib/soundEffects';

interface LiveBillboardProps {
  slotData: ActiveBillboardSlot | null;
  selectedCity: string;
  selectedCountry: string;
  onCityChange: (city: string, country: string) => void;
  viewerPoints: number;
  userRole?: UserRole;
  isPureViewerMode?: boolean;
  walletBalanceDollars?: string;
  onOpenWalletModal?: () => void;
  currentUser?: { uid: string; email: string; displayName: string; role: UserRole } | null;
  onOpenAuthModal?: () => void;
  onOpenMyAdsModal?: () => void;
  onOpenClaimModal?: () => void;
  onPlaceBidQuick?: (
    title: string,
    imageUrl: string,
    amountDollars: number,
    cityCode: string,
    countryCode: string,
    landingPageUrl?: string,
    whatsappLink?: string,
    qrCodeUrl?: string,
    mediaType?: 'image' | 'video',
    ctaType?: 'website' | 'whatsapp' | 'none',
    ctaUrl?: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const LiveBillboard: React.FC<LiveBillboardProps> = ({
  slotData,
  selectedCity,
  selectedCountry,
  onCityChange,
  viewerPoints,
  userRole = 'guest',
  isPureViewerMode = false,
  walletBalanceDollars = '0.00',
  onOpenWalletModal,
  onOpenMyAdsModal,
  onOpenClaimModal,
  currentUser,
  onOpenAuthModal,
  onPlaceBidQuick
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [glassGlare, setGlassGlare] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showPaidWatcherWorkflow, setShowPaidWatcherWorkflow] = useState(false);
  const [showCityPickerDropdown, setShowCityPickerDropdown] = useState(false);

  // Dynamic City Search State
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Fast Bid Form State (Clean defaults, mandatory upload)
  const [bidTitle, setBidTitle] = useState('');
  const [bidImageUrl, setBidImageUrl] = useState('');
  const [bidMediaType, setBidMediaType] = useState<'image' | 'video'>('image');
  const [bidCtaType, setBidCtaType] = useState<'website' | 'whatsapp' | 'none'>('website');
  const [bidCtaUrl, setBidCtaUrl] = useState('');
  const [bidAmountDollars, setBidAmountDollars] = useState<number>(1.00);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidFeedback, setBidFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const billboardScreenRef = useRef<HTMLDivElement>(null);

  // Up Next Preparation & Live Spotlight State
  const [userBroadcast, setUserBroadcast] = useState<{
    title: string;
    prepSeconds: number;
    isLive: boolean;
    liveSecondsLeft: number;
  } | null>(null);

  useEffect(() => {
    if (!userBroadcast) return;

    const timer = setInterval(() => {
      setUserBroadcast((prev) => {
        if (!prev) return null;
        if (!prev.isLive) {
          if (prev.prepSeconds <= 1) {
            // Live broadcast begins!
            soundEffects.playKaChing();
            triggerConfettiExplosion();
            return { ...prev, isLive: true, prepSeconds: 0, liveSecondsLeft: 15 };
          }
          return { ...prev, prepSeconds: prev.prepSeconds - 1 };
        } else {
          // Live broadcast in progress
          if (prev.liveSecondsLeft <= 1) {
            return null; // Concluded
          }
          return { ...prev, liveSecondsLeft: prev.liveSecondsLeft - 1 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userBroadcast]);

  // Reset image error state whenever active slot or winning ad rotates
  useEffect(() => {
    setImageError(false);
  }, [slotData?.winningAd?.id, slotData?.slotId]);

  const [cityLocalTime, setCityLocalTime] = useState<string>(() => getCityLocalTime(selectedCity));

  useEffect(() => {
    const update = () => setCityLocalTime(getCityLocalTime(selectedCity));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  const handleCopyLiveLink = () => {
    const liveUrl = `${window.location.origin}/?city=${selectedCity}`;
    navigator.clipboard.writeText(liveUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Dynamic Cities List loaded from API
  const [cities, setCities] = useState<CityConfig[]>([
    { cityCode: 'TYO', countryCode: 'JP', cityName: 'Tokyo Shibuya', countryName: 'Japan', flagEmoji: '🇯🇵', active: true, reserveFloorCents: 100 },
    { cityCode: 'NYC', countryCode: 'US', cityName: 'Times Square NYC', countryName: 'United States', flagEmoji: '🇺🇸', active: true, reserveFloorCents: 100 },
    { cityCode: 'LON', countryCode: 'UK', cityName: 'London City', countryName: 'United Kingdom', flagEmoji: '🇬🇧', active: true, reserveFloorCents: 100 },
    { cityCode: 'PAR', countryCode: 'FR', cityName: 'Paris Champs-Élysées', countryName: 'France', flagEmoji: '🇫🇷', active: true, reserveFloorCents: 100 },
    { cityCode: 'KUL', countryCode: 'MY', cityName: 'Kuala Lumpur', countryName: 'Malaysia', flagEmoji: '🇲🇾', active: true, reserveFloorCents: 100 },
    { cityCode: 'SIN', countryCode: 'SG', cityName: 'Singapore Marina', countryName: 'Singapore', flagEmoji: '🇸🇬', active: true, reserveFloorCents: 100 },
    { cityCode: 'DXB', countryCode: 'AE', cityName: 'Dubai Downtown', countryName: 'United Arab Emirates', flagEmoji: '🇦🇪', active: true, reserveFloorCents: 100 },
    { cityCode: 'SEL', countryCode: 'KR', cityName: 'Seoul Gangnam', countryName: 'South Korea', flagEmoji: '🇰🇷', active: true, reserveFloorCents: 100 },
    { cityCode: 'SYD', countryCode: 'AU', cityName: 'Sydney Harbour', countryName: 'Australia', flagEmoji: '🇦🇺', active: true, reserveFloorCents: 100 },
    { cityCode: 'YTO', countryCode: 'CA', cityName: 'Toronto Downtown', countryName: 'Canada', flagEmoji: '🇨🇦', active: true, reserveFloorCents: 100 },
    { cityCode: 'HKG', countryCode: 'HK', cityName: 'Hong Kong Central', countryName: 'Hong Kong', flagEmoji: '🇭🇰', active: true, reserveFloorCents: 100 },
    { cityCode: 'LAX', countryCode: 'US', cityName: 'Los Angeles Sunset', countryName: 'United States', flagEmoji: '🇺🇸', active: true, reserveFloorCents: 100 },
    { cityCode: 'SHA', countryCode: 'CN', cityName: 'Shanghai The Bund', countryName: 'China', flagEmoji: '🇨🇳', active: true, reserveFloorCents: 100 },
    { cityCode: 'BER', countryCode: 'DE', cityName: 'Berlin Alexanderplatz', countryName: 'Germany', flagEmoji: '🇩🇪', active: true, reserveFloorCents: 100 },
    { cityCode: 'SAO', countryCode: 'BR', cityName: 'São Paulo Paulista', countryName: 'Brazil', flagEmoji: '🇧🇷', active: true, reserveFloorCents: 100 }
  ]);

  const loadCities = () => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities && Array.isArray(data.cities)) {
          setCities(data.cities.filter((c: CityConfig) => c.active));
        }
      })
      .catch(err => console.error('Failed to load active cities:', err));
  };

  useEffect(() => {
    loadCities();
  }, []);

  // Handle File Upload for 15s Ad Creative (Image or MP4 Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Please select an image (PNG, JPG, WebP) or video file (.mp4, .webm).');
      return;
    }

    setBidMediaType(isVideo ? 'video' : 'image');
    setUploadedFileName(file.name);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) return;

        // Auto-scale to 1080p canvas for ultra-fast sub-100ms uploads
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            setBidImageUrl(optimizedBase64);
          } else {
            setBidImageUrl(rawUrl);
          }
        };
        img.onerror = () => setBidImageUrl(rawUrl);
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBidImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle searching/adding custom city dynamically
  const handleCustomCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchTerm.trim()) return;
    setIsSearchingCity(true);
    try {
      const res = await fetch('/api/cities/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: citySearchTerm.trim() })
      });
      const data = await res.json();
      if (data.success && data.city) {
        setCities(data.cities);
        onCityChange(data.city.cityCode, data.city.countryCode);
        setCitySearchTerm('');
      }
    } catch (err) {
      console.error('Error ensuring custom city:', err);
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Canvas-based Confetti Explosion Effect for Successful Bids
  const triggerConfettiExplosion = () => {
    try {
      // Primary burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ffffff']
      });

      // Side angle bursts for maximum visual impact
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.65 },
          colors: ['#06b6d4', '#38bdf8', '#34d399', '#fbbf24']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.65 },
          colors: ['#10b981', '#8b5cf6', '#ec4899', '#f43f5e']
        });
      }, 200);
    } catch (err) {
      console.warn('Canvas confetti execution error:', err);
    }
  };

  // Listen for global user bid placed events across all console components
  useEffect(() => {
    const handleGlobalBidSuccess = () => {
      triggerConfettiExplosion();
    };

    window.addEventListener('user-bid-placed', handleGlobalBidSuccess);
    return () => {
      window.removeEventListener('user-bid-placed', handleGlobalBidSuccess);
    };
  }, []);

  // Handle Fast Bidding (Supports Guests & Registered Advertisers)
  const handleQuickBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPlaceBidQuick) return;

    if (!bidImageUrl || bidImageUrl.trim().length < 5) {
      setBidFeedback({
        success: false,
        message: '⚠️ Creative File Required: Please click "Upload Ad Creative File" below to choose your image or video before placing a bid!'
      });
      return;
    }

    if (!bidTitle || bidTitle.trim().length < 2) {
      setBidFeedback({
        success: false,
        message: '⚠️ Campaign Headline Required: Please give your advertisement a headline.'
      });
      return;
    }

    setIsSubmittingBid(true);
    setBidFeedback(null);

    try {
      const landingPageUrl = bidCtaType === 'website' ? bidCtaUrl : undefined;
      const whatsappLink = bidCtaType === 'whatsapp' ? bidCtaUrl : undefined;

      const result = await onPlaceBidQuick(
        bidTitle,
        bidImageUrl,
        bidAmountDollars,
        selectedCity,
        selectedCountry,
        landingPageUrl,
        whatsappLink,
        undefined,
        bidMediaType,
        bidCtaType,
        bidCtaUrl
      );
      setBidFeedback(result);

      if (result.success) {
        soundEffects.playKaChing();
        triggerConfettiExplosion();
        window.dispatchEvent(new CustomEvent('user-bid-placed', { detail: { city: selectedCity } }));
        
        const initialPrep = (result as any).prepTimeSeconds || slotData.remainingSeconds || 15;
        setUserBroadcast({
          title: bidTitle,
          prepSeconds: initialPrep,
          isLive: false,
          liveSecondsLeft: 15
        });

        billboardScreenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        if (result.message && (result.message.includes('Insufficient') || result.message.includes('Top up') || result.message.includes('Wallet') || result.message.includes('402'))) {
          onOpenWalletModal?.();
        }
      }
    } catch (err: any) {
      console.error('Bid submit error:', err);
      setBidFeedback({
        success: false,
        message: err.message || 'Bid submission failed. Please try again.'
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  if (!slotData) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center text-slate-400 font-sans shadow-2xl">
        <div className="animate-spin w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-base font-bold text-white">Connecting to World First 24/7 Virtual Billboard Stream [{selectedCity}]...</p>
        <p className="text-xs text-slate-500 mt-1">Synchronizing real-time global screen network</p>
      </div>
    );
  }

  const { remainingSeconds, winningAd } = slotData;
  const progressPercent = ((15 - remainingSeconds) / 15) * 100;

  const currentCityConfig = cities.find(c => c.cityCode === selectedCity) || {
    cityName: selectedCity === 'GLOBAL' ? 'Global 24/7 Stream' : selectedCity,
    flagEmoji: selectedCity === 'GLOBAL' ? '🌐' : '🌍'
  };

  const currentTopCents = winningAd ? winningAd.bidAmountCents : 1000;
  const currentTopDollars = (currentTopCents / 100).toFixed(2);

  return (
    <div className={`space-y-6 ${fullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 overflow-y-auto' : ''}`}>
      {/* High-Impact Hero Value Pitch */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-500/40 p-6 sm:p-7 rounded-3xl shadow-2xl space-y-3.5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse fill-amber-400" />
              World's First 24/7 Virtual Billboard
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
              • Infinite Screen Network • 200+ Countries & Space
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
              <span>🎁 1 Free 15s Slot Credit</span>
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono">
              No Card Needed
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          Take Over the 24/7 Virtual Billboard in {currentCityConfig.flagEmoji} {currentCityConfig.cityName}. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Broadcast 15-Second Live Ad Takeovers Across 200+ Global City Feeds.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
          Broadcast your brand, project, or custom message to live global stream viewers in real-time. Outbid competitors in sub-second RTB auctions or watch 24/7 streams to earn cash rewards.
        </p>

        {/* Viral Celebrity & Streamer Live Billboard Banner */}
        {onOpenClaimModal && (
          <div className="pt-2">
            <div className="bg-slate-950/90 border border-purple-500/50 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-xl text-white shadow-md shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">Are you a Creator, Streamer or Celebrity?</span>
                    <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      80% PAYOUT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Claim your handle (e.g. <code>livebillboards.lol/@yourname</code>) to monetize your live stream broadcasts with zero setup.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenClaimModal}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
              >
                <span>Claim Your @Handle</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Smart City Overlay (Weather, Traffic Flow, News Headlines) */}
      <SmartOverlay cityCode={selectedCity} cityName={currentCityConfig.cityName} />

      {/* Broadcast Anticipation & Live Spotlight Banner */}
      <div ref={billboardScreenRef}>
        {userBroadcast && (
          <div className="mb-4 animate-in fade-in zoom-in-95 duration-200">
            {!userBroadcast.isLive ? (
              <div className="bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 border-2 border-amber-400/90 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_35px_rgba(251,191,36,0.35)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-mono font-black text-xl shadow-lg animate-pulse shrink-0">
                    {userBroadcast.prepSeconds}s
                  </div>
                  <div>
                    <div className="text-amber-300 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>🚀 GET READY! Your Ad is Up Next</span>
                    </div>
                    <div className="text-white font-black text-sm sm:text-base line-clamp-1">
                      "{userBroadcast.title}" broadcasts across {currentCityConfig.cityName} in {userBroadcast.prepSeconds}s
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <span className="text-xs font-mono bg-amber-950/90 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                    <span>📸 Camera Ready</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-2 border-emerald-300 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-[0_0_45px_rgba(16,185,129,0.55)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white text-emerald-950 flex items-center justify-center font-mono font-black text-xl shadow-lg shrink-0">
                    {userBroadcast.liveSecondsLeft}s
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-100 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>🔴 YOUR AD IS BROADCASTING LIVE NOW</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white line-clamp-1">
                      "{userBroadcast.title}" is Live on Billboard!
                    </div>
                  </div>
                </div>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just took over the 24/7 Global Virtual Billboard in ${selectedCity}! Check it out live: https://www.livebillboards.lol/?city=${selectedCity} 🔥 #VirtualBillboard #LiveTakeover`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs rounded-xl shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 shrink-0"
                >
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>Share Live Flex to 𝕏</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real-Life Physical Billboard Display Wrapped in Landmark Frame */}
      <LandmarkFrame cityCode={selectedCity} cityName={currentCityConfig.cityName}>
        {/* Physical Billboard Metal Bezel Frame */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-sans gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            {/* Interactive Dynamic City Switcher & Search Bar (200+ Countries) */}
            <div className="relative">
              <button
                onClick={() => setShowCityPickerDropdown(!showCityPickerDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-sm group"
                title="Click to Switch City Feed or Search Any City in 200+ Countries"
              >
                <span className="text-base">{currentCityConfig.flagEmoji}</span>
                <span className="text-cyan-300 font-extrabold">{currentCityConfig.cityName}</span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 hidden xs:inline">
                  [{selectedCity}]
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${showCityPickerDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCityPickerDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  {/* Instant Search Any City (200+ Countries) */}
                  <form onSubmit={handleCustomCitySearch} className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-cyan-400" />
                    <input
                      type="text"
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      placeholder="Search any city or country..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                      autoFocus
                    />
                  </form>

                  {/* Quick Pick Popular Global Hubs */}
                  <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">
                    <div className="text-[9px] uppercase font-mono font-bold text-slate-400 px-2 py-0.5">
                      Featured Global Hubs
                    </div>
                    {cities.slice(0, 12).map((city) => (
                      <button
                        key={city.cityCode}
                        onClick={() => {
                          onCityChange(city.cityCode, city.countryCode);
                          setShowCityPickerDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          selectedCity.toUpperCase() === city.cityCode.toUpperCase()
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{city.flagEmoji}</span>
                          <span>{city.cityName}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">[{city.cityCode}]</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-amber-300 font-mono text-[11px] font-bold hidden md:inline bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
              🕒 {cityLocalTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/40 hover:to-indigo-500/40 border border-purple-500/40 text-purple-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Share Live Ad Takeover Proof"
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">📸 Share Proof to X</span>
              <span className="sm:hidden">Share</span>
            </button>

            <button
              onClick={handleCopyLiveLink}
              className="px-2 sm:px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copy shareable live billboard link"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share Live Link'}</span>
              <span className="sm:hidden">{copiedLink ? '✓' : 'Link'}</span>
            </button>

            <button
              onClick={() => setAmbientGlow(!ambientGlow)}
              className={`hidden sm:flex px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                ambientGlow ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              Glow
            </button>
            <button
              onClick={() => setGlassGlare(!glassGlare)}
              className={`hidden sm:flex px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                glassGlare ? 'bg-indigo-950 text-indigo-400 border-indigo-800' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              Reflect
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
              title="Full Screen View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 15-Second Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5">
          <div
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-1.5 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Real Billboard High-Res Canvas */}
        <div className="relative aspect-video max-h-[280px] sm:max-h-[520px] w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
          {/* Glass Glare Overlay Shader */}
          {glassGlare && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />
          )}

          {winningAd.imageUrl && !imageError ? (
            (winningAd as any).mediaType === 'video' || winningAd.imageUrl.startsWith('data:video/') || winningAd.imageUrl.toLowerCase().includes('.mp4') ? (
              <video
                src={winningAd.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <img
                src={winningAd.imageUrl}
                alt={winningAd.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                alt="Cyber Billboard Backdrop"
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
              />
              <div className="relative z-10 space-y-3 max-w-xl">
                <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono px-3.5 py-1 rounded-full uppercase tracking-wider font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {winningAd.advertiserName || 'Virtual Billboard Broadcast'}
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                  {winningAd.title}
                </h3>
                <p className="text-xs text-slate-300 font-mono tracking-wide">
                  🔴 Live 24/7 Global Screen Takeover
                </p>
              </div>
            </div>
          )}

          {/* Top Floating Badge - Countdown Timer & Watcher Points */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-mono shadow-xl pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-black text-white text-sm">{remainingSeconds}s Slot Remaining</span>
            </div>

            {(userRole === 'paid_watcher' || userRole === 'admin') ? (
              <div className="bg-slate-950/85 backdrop-blur-md border border-amber-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-mono shadow-xl pointer-events-auto">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">Watcher Balance:</span>
                <span className="text-amber-400 font-black">{viewerPoints} pts</span>
              </div>
            ) : (
              <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-mono shadow-xl pointer-events-auto text-cyan-300">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-[11px] tracking-wider uppercase">SPECTATOR STREAM</span>
              </div>
            )}
          </div>

          {/* Bottom Floating Banner - Advertiser Title & Winning Price */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 sm:p-6 lg:p-8 flex flex-wrap items-end justify-between gap-2 sm:gap-4 z-20">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-slate-900/95 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-lg">
                  {winningAd.advertiserName}
                </span>
              </div>

              <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-lg leading-tight line-clamp-2">
                {winningAd.title}
              </h2>

              {/* Single CTA Button Overlay (Website or WhatsApp only) */}
              {((winningAd as any).ctaType !== 'none') && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {((winningAd as any).ctaType === 'whatsapp' || (!(winningAd as any).ctaType && !(winningAd as any).landingPageUrl && (winningAd as any).whatsappLink)) ? (
                    <a
                      href={(winningAd as any).ctaUrl || ((winningAd as any).whatsappLink?.startsWith('http') ? (winningAd as any).whatsappLink : `https://wa.me/${((winningAd as any).whatsappLink || '').replace(/[^0-9]/g, '')}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
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
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 font-mono"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{((winningAd as any).ctaUrl || (winningAd as any).landingPageUrl || '').replace(/^https?:\/\//, '')}</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Live QR Code (if ad has website, whatsapp, or CTA link) */}
              {(() => {
                let rawLink =
                  (winningAd as any).ctaUrl ||
                  (winningAd as any).landingPageUrl ||
                  ((winningAd as any).whatsappLink ? ((winningAd as any).whatsappLink.startsWith('http') ? (winningAd as any).whatsappLink : `https://wa.me/${((winningAd as any).whatsappLink || '').replace(/[^0-9]/g, '')}`) : null);
                
                if (!rawLink || (winningAd as any).ctaType === 'none') return null;

                const cleanLink = rawLink.startsWith('http://') || rawLink.startsWith('https://')
                  ? rawLink
                  : `https://${rawLink}`;

                return (
                  <div className="hidden sm:flex flex-col items-center bg-white p-1.5 rounded-xl shadow-2xl border border-slate-700 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(cleanLink)}`}
                      alt="Scan QR"
                      className="w-12 h-12 rounded"
                    />
                    <span className="text-[7px] font-black text-slate-950 font-mono tracking-tighter uppercase mt-0.5">
                      SCAN FOR LINK
                    </span>
                  </div>
                );
              })()}

              <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 px-5 py-3 rounded-2xl text-right shadow-2xl">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Active Winning Bid</div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  ${(winningAd.bidAmountCents / 100).toFixed(2)}
                  <span className="text-xs font-normal text-slate-400"> / 15s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Life Physical Frame Base */}
        <div className="bg-slate-900 border-t border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-sans text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Active Feed: <strong className="text-white">{currentCityConfig.cityName}</strong>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold hidden sm:inline flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time RTB Active</span>
            </span>
          </div>

          <div className="text-slate-500 text-[11px] font-mono">
            15s Slot ID: <strong className="text-slate-300">{slotData.slotId}</strong>
          </div>
        </div>
      </LandmarkFrame>

      {/* Real-Time Token Burn Ticker */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 animate-pulse shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 font-mono uppercase tracking-wide">
                🔥 Live Token Burn Ticker [{currentCityConfig.cityCode}]
              </span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono">
                1 Token = 15s Play
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Slot <strong className="text-white font-mono">{slotData?.slotId || 'SLOT-ACTIVE'}</strong> filled by <strong className="text-cyan-400">"{winningAd.title}"</strong> — <strong className="text-amber-400 font-mono">{(winningAd as any).bidAmountTokens || Math.max(1, Math.round(winningAd.bidAmountCents * 10))} Tokens Burned</strong> ($
              {winningAd.bidAmountDollars || (winningAd.bidAmountCents / 100).toFixed(2)})
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-3 py-1.5 rounded-xl shadow-inner">
            ⚡ 100% Slot Fill Velocity
          </div>
        </div>
      </div>

      {/* Fast Bidding Console with 15-Sec Creative File Upload */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Fast Billboard Bidding & Creative Upload
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  Bids in Seconds
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Upload your 15-second ad creative image and place your bid for <strong className="text-cyan-400">{currentCityConfig.cityName}</strong>
              </p>
            </div>
          </div>

          {/* Ad Wallet Balance & Instant Top Up Widget */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-slate-950 border border-emerald-500/30 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-mono shadow-sm">
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans font-bold leading-tight">Ad Wallet</div>
                <div className="font-black text-emerald-400 text-xs sm:text-sm leading-tight">
                  ${walletBalanceDollars}
                  <span className="text-[10px] text-amber-400 font-normal ml-1 hidden xs:inline">
                    ({(Math.round(Number(walletBalanceDollars || 0) * 1000)).toLocaleString()} tokens)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onOpenWalletModal}
              className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              title="Top Up Tokens or Claim Free Slot"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
              <span>Top Up</span>
            </button>
          </div>
        </div>

        {bidFeedback && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            bidFeedback.success
              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
          }`}>
            {bidFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{bidFeedback.message}</span>
          </div>
        )}

        <form
          onSubmit={handleQuickBidSubmit}
          className="space-y-4"
          data-webmcp-tool="placeAdBid"
          aria-label="Submit Billboard Ad Campaign"
        >
          {/* Ad Headline / Campaign Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Ad Headline / Campaign Title <span className="text-cyan-400 font-mono text-[10px]">*Required</span>
            </label>
            <input
              type="text"
              value={bidTitle}
              onChange={(e) => setBidTitle(e.target.value)}
              placeholder="e.g. Revolutionary AI Smart Specs Launch 2026 — 50% Off Today"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Interactive CTA Selector: Choose 1 CTA */}
          <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Call-To-Action (Pick 1 CTA)</span>
              </span>
              <span className="text-[10px] text-slate-400">Website or WhatsApp</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBidCtaType('website');
                }}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  bidCtaType === 'website'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Website</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBidCtaType('whatsapp');
                }}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  bidCtaType === 'whatsapp'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBidCtaType('none');
                  setBidCtaUrl('');
                }}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  bidCtaType === 'none'
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>No CTA</span>
              </button>
            </div>

            {bidCtaType !== 'none' && (
              <div className="pt-1">
                <input
                  type="text"
                  value={bidCtaUrl}
                  onChange={(e) => setBidCtaUrl(e.target.value)}
                  placeholder={bidCtaType === 'website' ? 'https://yourbrand.com' : 'https://wa.me/1234567890'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            )}
          </div>

          {/* Creative Media Upload Dropzone / Preview */}
          {!bidImageUrl ? (
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-950/80 rounded-2xl cursor-pointer hover:bg-slate-900/60 transition group">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, video/mp4, video/webm"
                onChange={handleFileUpload}
                className="hidden"
                required
              />
              <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mb-2 group-hover:scale-110 transition text-cyan-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Upload Ad Creative File</span>
                <span className="bg-red-950/80 text-red-400 border border-red-500/40 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">*REQUIRED</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP or MP4 Video (16:9 Billboard Format)</p>
            </label>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-cyan-500/40">
              <div className="flex items-center gap-3">
                {bidMediaType === 'video' || bidImageUrl.startsWith('data:video/') || bidImageUrl.toLowerCase().includes('.mp4') ? (
                  <video
                    src={bidImageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-20 h-12 object-cover rounded-lg border border-slate-700"
                  />
                ) : (
                  <img
                    src={bidImageUrl}
                    alt="Ad Creative Preview"
                    className="w-20 h-12 object-cover rounded-lg border border-slate-700"
                  />
                )}
                <div className="text-xs">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {bidMediaType === 'video' ? '🎬 MP4 Video Ready' : '🖼️ Image Creative Ready'}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{uploadedFileName || bidTitle || '1080p Billboard Asset'}</p>
                </div>
              </div>
              <label className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer underline px-2.5 py-1 bg-cyan-950/60 rounded-lg border border-cyan-500/30">
                Replace File
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, video/mp4, video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase">Bid Amount:</span>
              <div className="relative w-28 sm:w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="1.00"
                  step="0.50"
                  value={bidAmountDollars}
                  onChange={(e) => setBidAmountDollars(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-7 pr-2 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Exact Token Deduction Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/30">
                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{Math.round(bidAmountDollars * 1000).toLocaleString()} tokens</span>
              </div>

              {/* Quick Outbid Presets */}
              <div className="flex items-center gap-1.5">
                {[
                  Number(currentTopDollars) + 1,
                  Number(currentTopDollars) + 2,
                  Number(currentTopDollars) + 5
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBidAmountDollars(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      bidAmountDollars === preset
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
              {Number(walletBalanceDollars) < bidAmountDollars ? (
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1.5 bg-amber-950/50 border border-amber-500/40 px-3 py-2 rounded-xl transition hover:bg-amber-950/80 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ad Wallet: ${walletBalanceDollars} (Top-Up Needed)</span>
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isSubmittingBid}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>{isSubmittingBid ? 'Submitting Creative...' : 'Place Bid in 2 Secs'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live Ad Takeover Share Card Modal */}
      <ShareProofModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slotData={slotData}
        selectedCity={selectedCity}
        selectedCityName={currentCityConfig.cityName}
      />
    </div>
  );
};
