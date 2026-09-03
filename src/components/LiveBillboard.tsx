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
  Camera,
  Loader2
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
  tokensBalance?: number;
  hasClaimedStarter?: boolean;
  onClaimStarter?: () => Promise<void>;
  onOpenWalletModal?: () => void;
  currentUser?: { uid: string; email: string; displayName: string; role: UserRole; starterGrantClaimed?: boolean; hasClaimedFreeSlot?: boolean } | null;
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
    ctaUrl?: string,
    trafficTier?: 'standard' | 'tier1_staring_eyeballs'
  ) => Promise<{ success: boolean; message: string }>;
  onMinePoA?: (params: {
    slotId: string;
    adId: string;
    adTitle: string;
    targetCityCode: string;
    trafficTier?: 'standard' | 'tier1_staring_eyeballs';
    interactionType: 'floating_pixel' | 'micro_target' | 'rapid_catch' | 'visual_prompt';
    clickVector: { x: number; y: number };
    latencyMs: number;
  }) => Promise<{ success: boolean; pointsEarned: number; ticket?: any; error?: string }>;
}

const AD_TEMPLATES = [
  {
    id: 'tech_ai',
    label: '🔥 AI Tech Launch',
    title: '🚀 NeuralCode AI V2 is Live — Try 14-Day Free Trial',
    ctaType: 'website' as const,
    ctaUrl: 'https://neuralcode.ai',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80',
    mediaType: 'image' as const
  },
  {
    id: 'web3_crypto',
    label: '⚡ Web3 / Crypto',
    title: '💎 $SOLARIS Token Stealth Launch — 100x Alpha on Base',
    ctaType: 'whatsapp' as const,
    ctaUrl: 'https://t.me/solaris_alpha',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1280&q=80',
    mediaType: 'image' as const
  },
  {
    id: 'ecommerce_sale',
    label: '🛍️ 50% Off Flash Sale',
    title: '⚡ Midnight Flash Sale: 50% Off Storewide with code FLASH50',
    ctaType: 'website' as const,
    ctaUrl: 'https://store.livebillboards.lol/sale',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1280&q=80',
    mediaType: 'image' as const
  },
  {
    id: 'meme_shoutout',
    label: '👑 Birthday / Shoutout',
    title: '👑 Happy Birthday Sarah! NYC Times Square Celebrates You 🎉',
    ctaType: 'website' as const,
    ctaUrl: 'https://tiktok.com/@sarah',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1280&q=80',
    mediaType: 'image' as const
  }
];

export const LiveBillboard: React.FC<LiveBillboardProps> = ({
  slotData,
  selectedCity,
  selectedCountry,
  onCityChange,
  viewerPoints,
  userRole = 'guest',
  isPureViewerMode = false,
  walletBalanceDollars = '0.00',
  tokensBalance = 0,
  hasClaimedStarter = false,
  onClaimStarter,
  onOpenWalletModal,
  onOpenMyAdsModal,
  onOpenClaimModal,
  currentUser,
  onOpenAuthModal,
  onPlaceBidQuick,
  onMinePoA
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [glassGlare, setGlassGlare] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showPaidWatcherWorkflow, setShowPaidWatcherWorkflow] = useState(false);
  const [showCityPickerDropdown, setShowCityPickerDropdown] = useState(false);

  // Live City Telemetry & Emergency Weather Alerts Feed
  const [cityTelemetry, setCityTelemetry] = useState<{
    tempC?: number;
    condition?: string;
    humidity?: number;
    aqi?: number;
    activeAlert?: { severity: string; headline: string; description: string; badge: string };
    platformEmergencyOverride?: string;
    localTime?: string;
    viewerTraffic?: number;
  } | null>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`/api/city-live-data?city=${selectedCity}`);
        if (res.ok) {
          const data = await res.json();
          setCityTelemetry(data);
        }
      } catch (e) {
        console.warn('City telemetry fetch notice:', e);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 25000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Dynamic City Search State
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Fast Bid Form State (Clean defaults, mandatory upload)
  const [bidTitle, setBidTitle] = useState('');
  const [bidImageUrl, setBidImageUrl] = useState('');
  const [bidMediaType, setBidMediaType] = useState<'image' | 'video'>('image');
  const [creativeInputMode, setCreativeInputMode] = useState<'url' | 'upload'>('url');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [isResolvingSocialMedia, setIsResolvingSocialMedia] = useState(false);
  const [socialResolveError, setSocialResolveError] = useState<string | null>(null);
  const [bidCtaType, setBidCtaType] = useState<'website' | 'whatsapp' | 'none'>('website');
  const [bidCtaUrl, setBidCtaUrl] = useState('');
  const [bidAmountDollars, setBidAmountDollars] = useState<number>(1.00);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidFeedback, setBidFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeQrModalData, setActiveQrModalData] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    advertiser: string;
  } | null>(null);
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  const [biddingTab, setBiddingTab] = useState<'instant' | 'future'>('instant');
  const [selectedTrafficTier, setSelectedTrafficTier] = useState<'standard' | 'tier1_staring_eyeballs'>('standard');
  const [selectedFutureDate, setSelectedFutureDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedFutureHour, setSelectedFutureHour] = useState<string>('20:00');
  const billboardScreenRef = useRef<HTMLDivElement>(null);

  // Proof-of-Attention (PoA) Mining Interactive Floating State
  const [poaTargetCoords, setPoaTargetCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [poaSpawnTime, setPoaSpawnTime] = useState<number>(Date.now());
  const [poaMinedForSlot, setPoaMinedForSlot] = useState<boolean>(false);
  const [poaMiningNotice, setPoaMiningNotice] = useState<string | null>(null);

  // Reset PoA target coordinates and mine state on every new slot rotation
  useEffect(() => {
    setPoaMinedForSlot(false);
    setPoaSpawnTime(Date.now());
    const randX = Math.floor(25 + Math.random() * 50);
    const randY = Math.floor(25 + Math.random() * 45);
    setPoaTargetCoords({ x: randX, y: randY });
  }, [slotData?.slotId, slotData?.winningAd?.id]);

  const handlePoATargetClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (poaMinedForSlot || !slotData?.winningAd) return;

    const clickLatencyMs = Math.max(120, Date.now() - poaSpawnTime);
    const isTier1 = (slotData as any)?.trafficTier === 'tier1_staring_eyeballs' || (slotData.winningAd as any)?.trafficTier === 'tier1_staring_eyeballs';
    
    soundEffects.playKaChing();
    triggerConfettiExplosion();
    setPoaMinedForSlot(true);
    
    const earned = isTier1 ? 50 : 25;
    setPoaMiningNotice(isTier1 ? '🔥 +50 TIER 1 POA POINTS MINED!' : '💎 +25 POA POINTS MINED!');
    setTimeout(() => setPoaMiningNotice(null), 3000);

    if (onMinePoA) {
      try {
        await onMinePoA({
          slotId: slotData.slotId,
          adId: slotData.winningAd.id,
          adTitle: slotData.winningAd.title,
          targetCityCode: selectedCity,
          trafficTier: isTier1 ? 'tier1_staring_eyeballs' : 'standard',
          interactionType: 'floating_pixel',
          clickVector: { x: poaTargetCoords.x, y: poaTargetCoords.y },
          latencyMs: clickLatencyMs
        });
      } catch (err) {
        console.warn('PoA mine notice:', err);
      }
    }
  };

  // Up Next Preparation & Live Spotlight State
  const [userBroadcast, setUserBroadcast] = useState<{
    title: string;
    prepSeconds: number;
    isLive: boolean;
    liveSecondsLeft: number;
    advertiserName?: string;
  } | null>(null);

  // Multi-slot bid counter (1–10 slots)
  const [bidSlotsCount, setBidSlotsCount] = useState(1);

  useEffect(() => {
    if (!userBroadcast) return;
    // Only run the local countdown for prep phase; live phase is driven by slotData
    if (userBroadcast.isLive) return;

    const timer = setInterval(() => {
      setUserBroadcast((prev) => {
        if (!prev || prev.isLive) return prev;
        if (prev.prepSeconds <= 1) {
          return { ...prev, prepSeconds: 0 }; // stop here; slotData sync triggers isLive
        }
        return { ...prev, prepSeconds: prev.prepSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userBroadcast?.isLive]);

  // Live phase: count down remaining seconds using server remainingSeconds
  useEffect(() => {
    if (!userBroadcast?.isLive) return;
    if (slotData?.remainingSeconds !== undefined) {
      setUserBroadcast(prev => prev ? { ...prev, liveSecondsLeft: slotData.remainingSeconds } : null);
    }
  }, [slotData?.remainingSeconds, userBroadcast?.isLive]);

  // Sync userBroadcast with slotData: detect when user's ad is actually on screen
  // This is the authoritative check — replaces flaky local timer
  useEffect(() => {
    if (!userBroadcast || !slotData?.winningAd) return;
    const winning = slotData.winningAd as any;
    const matchByName = userBroadcast.advertiserName && winning.advertiserName === userBroadcast.advertiserName;
    const matchByTitle = winning.title === userBroadcast.title;
    if ((matchByName || matchByTitle) && !userBroadcast.isLive) {
      // Ad is NOW live on the actual server slot — sync immediately
      soundEffects.playKaChing();
      triggerConfettiExplosion();
      setUserBroadcast(prev => prev ? { ...prev, isLive: true, prepSeconds: 0, liveSecondsLeft: slotData.remainingSeconds || 15 } : null);
    }
    // When slot rotates away, conclude the live state
    if (userBroadcast.isLive && !matchByName && !matchByTitle) {
      setUserBroadcast(null);
    }
  }, [slotData?.winningAd?.id, slotData?.slotId]);

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
    { cityCode: 'GLOBAL', countryCode: 'GLOBAL', cityName: 'Global Distributed Feed (All Screens Everywhere)', countryName: 'Worldwide', flagEmoji: '🌐', active: true, reserveFloorCents: 100 },
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

  // Handle Media URL Input (Image, Animated GIF, MP4/WebM Video link, or X / Twitter Post)
  const handleMediaUrlChange = (url: string) => {
    setMediaUrlInput(url);
    setSocialResolveError(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setBidImageUrl('');
      setUploadedFileName(null);
      setBidMediaType('image');
      setIsResolvingSocialMedia(false);
      return;
    }

    // Check if it's an X post, Giphy page, or Tenor page
    const isXPost = /(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/i.test(trimmed);
    const isGiphyPage = /giphy\.com\/(gifs\/(?:.*-)?|media\/)?([a-zA-Z0-9]+)/i.test(trimmed) && !trimmed.endsWith('.gif');
    const isTenorPage = /tenor\.com\/(view\/)?[a-zA-Z0-9_-]+/i.test(trimmed) && !trimmed.endsWith('.gif') && !trimmed.endsWith('.mp4');

    if (isXPost || isGiphyPage || isTenorPage) {
      setIsResolvingSocialMedia(true);
      setUploadedFileName(isXPost ? '⚡ Resolving X Video...' : isGiphyPage ? '👾 Resolving GIPHY...' : '⚡ Resolving Tenor GIF...');
      fetch(`/api/media/resolve-social?url=${encodeURIComponent(trimmed)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.mediaUrl) {
            // For Twitter videos, use streamUrl proxy to prevent 403 Forbidden Referer blocking
            const finalMediaUrl = data.streamUrl || data.mediaUrl;
            setBidImageUrl(finalMediaUrl);
            setBidMediaType(data.mediaType || (data.platform === 'giphy' ? 'image' : 'video'));
            setUploadedFileName(
              data.mediaType === 'video'
                ? (data.platform === 'x' ? '🎬 X Video (MP4)' : '🎬 Video Stream')
                : (data.platform === 'giphy' || data.mediaUrl.includes('.gif') ? '👾 Animated GIF' : '🖼️ Online Image')
            );
            if (data.title && (!bidTitle || bidTitle === 'Live Virtual Billboard')) {
              setBidTitle(data.title);
            }
          } else {
            setSocialResolveError(data.error || 'Could not extract media from this link.');
            setUploadedFileName(null);
          }
        })
        .catch(err => {
          console.error('Failed to resolve social URL:', err);
          setSocialResolveError('Could not reach media resolver service.');
          setUploadedFileName(null);
        })
        .finally(() => {
          setIsResolvingSocialMedia(false);
        });
      return;
    }

    setBidImageUrl(trimmed);
    const lower = trimmed.toLowerCase();
    const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('video/mp4') || lower.includes('video/webm');
    setBidMediaType(isVideo ? 'video' : 'image');
    const isGif = lower.endsWith('.gif') || lower.includes('giphy.com') || lower.includes('tenor.com');
    setUploadedFileName(isGif ? '👾 Animated GIF' : isVideo ? '🎬 Video (MP4/WebM)' : '🖼️ Online Image');
    if (!bidTitle) {
      try {
        const u = new URL(trimmed);
        const pathPart = u.pathname.split('/').pop()?.split('.')[0]?.replace(/[-_]/g, ' ');
        if (pathPart && pathPart.length > 3 && !pathPart.startsWith('giphy') && !pathPart.startsWith('tenor')) {
          setBidTitle(pathPart.charAt(0).toUpperCase() + pathPart.slice(1));
        }
      } catch {}
    }
  };

  // Handle File Upload for 15s Ad Creative (Image, Animated GIF, or MP4 Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
    const isImage = file.type.startsWith('image/');
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

    if (!isImage && !isVideo) {
      alert('Please select an image (PNG, JPG, WebP, GIF) or video file (.mp4, .webm).');
      return;
    }

    if (isVideo && file.size > 25 * 1024 * 1024) {
      alert('Video file is too large! Please upload a video under 25MB.');
      return;
    }

    setBidMediaType(isVideo ? 'video' : 'image');
    setUploadedFileName(isGif ? `👾 ${file.name}` : file.name);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) return;

        // If file is an animated GIF, bypass canvas flattening so animation loops natively
        if (isGif) {
          setBidImageUrl(rawUrl);
          setMediaUrlInput(rawUrl.substring(0, 40) + '...');
          return;
        }

        // Auto-scale to 1280px max for ultra-fast instant sub-200ms uploads
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1280;
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
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.82);
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

      // Submit the first slot (authoritative — drives UI feedback)
      const finalBidDollars = selectedTrafficTier === 'tier1_staring_eyeballs' ? Math.max(5.00, bidAmountDollars) : bidAmountDollars;
      const result = await onPlaceBidQuick(
        bidTitle,
        bidImageUrl,
        finalBidDollars,
        selectedCity,
        selectedCountry,
        landingPageUrl,
        whatsappLink,
        undefined,
        bidMediaType,
        bidCtaType,
        bidCtaUrl,
        selectedTrafficTier
      );
      setBidFeedback(result);

      if (result.success) {
        soundEffects.playKaChing();
        triggerConfettiExplosion();
        window.dispatchEvent(new CustomEvent('user-bid-placed', { detail: { city: selectedCity } }));
        
        const initialPrep = (result as any).prepTimeSeconds || slotData.remainingSeconds || 15;
        const advertiserNameForSync = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Fast Bidding Console';
        setUserBroadcast({
          title: bidTitle,
          prepSeconds: initialPrep,
          isLive: false,
          liveSecondsLeft: 15,
          advertiserName: advertiserNameForSync
        });

        // Queue additional slots in background (non-blocking fire-and-forget)
        if (bidSlotsCount > 1) {
          for (let i = 1; i < bidSlotsCount; i++) {
            setTimeout(() => {
              onPlaceBidQuick(
                bidTitle,
                bidImageUrl,
                finalBidDollars,
                selectedCity,
                selectedCountry,
                landingPageUrl,
                whatsappLink,
                undefined,
                bidMediaType,
                bidCtaType,
                bidCtaUrl,
                selectedTrafficTier
              ).catch(err => console.warn(`Slot ${i + 1} submission warning:`, err));
            }, i * 200); // stagger by 200ms to avoid race conditions
          }
          setBidFeedback({
            success: true,
            message: `✅ ${bidSlotsCount} rotation slots queued for [${selectedCity}] [${selectedTrafficTier === 'tier1_staring_eyeballs' ? 'TIER 1 STARING EYEBALLS' : 'STANDARD'}]! Your ad will rotate ${bidSlotsCount}× in the next available windows.`
          });
        }

        setBidSlotsCount(1); // Reset slots counter after successful placement
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
    <div className={`space-y-3.5 w-full max-w-full overflow-x-hidden ${fullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 overflow-y-auto' : ''}`}>
      {/* Consolidated High-Tech Global Billboard Command Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-3.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-cyan-300 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-lg">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse fill-amber-400" />
              World's First 24/7 Virtual Billboard
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 hidden md:inline">
              • 200+ Global Feeds • 15s Guaranteed RTB • 99.99% Uptime
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!hasClaimedStarter ? (
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase shadow-md flex items-center gap-1">
                <span>🎁 $1.00 Free Starter Slot</span>
              </span>
            ) : (
              <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>✨ 24/7 Live Advertiser</span>
              </span>
            )}
            {onOpenClaimModal && (
              <button
                onClick={onOpenClaimModal}
                className="text-[10px] sm:text-xs font-bold text-purple-300 hover:text-white bg-purple-950/70 border border-purple-500/40 px-2.5 py-0.5 rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Claim Handle (80% Payout)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Scrolling City Telemetry & News Marquee Strip */}
        <div className="bg-slate-950/90 flex items-center gap-0 overflow-hidden text-[11px] font-mono h-[26px]">
          <span className="bg-cyan-950 text-cyan-400 border-r border-cyan-500/30 text-[9px] font-black px-2 h-full flex items-center gap-1 shrink-0 uppercase tracking-wider">
            📡 LIVE [{selectedCity}]
          </span>
          <div className="flex-1 overflow-hidden relative">
            <div
              className="flex items-center gap-0 whitespace-nowrap text-slate-300 text-[11px]"
              style={{
                animation: 'marquee-scroll 32s linear infinite',
                willChange: 'transform'
              }}
            >
              {(() => {
                const cityData = CITY_LIVE_UPDATES[selectedCity];
                const news = cityData?.newsHeadline || `Live 24/7 Billboard Feed active in ${currentCityConfig.cityName} • Verified RTB Rotations`;
                const traffic = cityData?.traffic;
                const trafficText = traffic
                  ? `🚗 ${traffic.status} — ${traffic.mainCorridor} (${traffic.avgSpeedKmH}km/h avg)`
                  : null;
                return (
                  <>
                    <span className="px-4 text-slate-200">📰 {news}</span>
                    {trafficText && <span className="px-4 text-amber-300">{trafficText}</span>}
                    <span className="px-4 text-emerald-400 font-bold">⚡ RTB Live Takeovers (15s Slots) — Place Your Ad Now</span>
                    {/* repeat for seamless loop */}
                    <span className="px-4 text-slate-200">📰 {news}</span>
                    {trafficText && <span className="px-4 text-amber-300">{trafficText}</span>}
                    <span className="px-4 text-emerald-400 font-bold">⚡ RTB Live Takeovers (15s Slots) — Place Your Ad Now</span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      {/* CSS keyframe for marquee — injected once */}
      <style>{`@keyframes marquee-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>

      {/* Broadcast Anticipation & Live Spotlight Banner */}
      <div ref={billboardScreenRef} id="live-billboard-screen">
        {userBroadcast && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {!userBroadcast.isLive ? (
              <div className="bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 border-2 border-amber-400 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_35px_rgba(251,191,36,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-mono font-black text-base shadow-lg animate-pulse shrink-0">
                    {userBroadcast.prepSeconds}s
                  </div>
                  <div>
                    <div className="text-amber-300 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>🎬 UP NEXT IN ROTATION QUEUE (SLOT #2)</span>
                    </div>
                    <div className="text-white font-black text-xs sm:text-sm line-clamp-1">
                      "{userBroadcast.title}" broadcasts on {currentCityConfig.cityName} screen in {userBroadcast.prepSeconds}s
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm hover:bg-amber-900 transition cursor-pointer"
                  >
                    <span>📸 Open Proof & Share</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-2 border-emerald-300 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-[0_0_45px_rgba(16,185,129,0.55)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-emerald-950 flex items-center justify-center font-mono font-black text-base shadow-lg shrink-0">
                    {userBroadcast.liveSecondsLeft}s
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-100 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>🔴 YOUR AD IS BROADCASTING LIVE NOW (SLOT #1)</span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white line-clamp-1">
                      "{userBroadcast.title}" is Live on Billboard!
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs rounded-xl shadow-xl flex items-center gap-1.5 transition-all transform hover:scale-105 shrink-0 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    <span>📸 Share Live Proof</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MASTER COCKPIT SPLIT GRID: Live Screen & Queue (Left) + Fast Bidding & Live Mockup (Right) */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT COLUMN: Physical Billboard Display + Telemetry + 3-Slot Queue (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Real-Life Physical Billboard Display Wrapped in Landmark Frame */}
          <LandmarkFrame cityCode={selectedCity} cityName={currentCityConfig.cityName}>
            {/* Physical Billboard Metal Bezel Frame */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-sans gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Interactive Dynamic City Switcher & Search Bar */}
                <div className="relative">
                  <button
                    onClick={() => setShowCityPickerDropdown(!showCityPickerDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-sm group"
                    title="Click to Switch City Feed or Search Any City in 200+ Countries"
                  >
                    <span className="text-base">{currentCityConfig.flagEmoji}</span>
                    <span className="text-cyan-300 font-extrabold">{currentCityConfig.cityName}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800 hidden xs:inline">
                      [{selectedCity}]
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${showCityPickerDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCityPickerDropdown && (
                    <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
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

                      <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">
                        <div className="text-[9px] uppercase font-mono font-bold text-slate-400 px-2 py-0.5">
                          Featured Global Hubs
                        </div>
                        {cities
                          .filter((c) => {
                            if (!citySearchTerm.trim()) return true;
                            const term = citySearchTerm.toLowerCase();
                            return (
                              c.cityName.toLowerCase().includes(term) ||
                              c.cityCode.toLowerCase().includes(term) ||
                              c.countryName.toLowerCase().includes(term)
                            );
                          })
                          .slice(0, 20)
                          .map((city) => (
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

                {/* Live City Telemetry HUD */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                  {cityTelemetry && (
                    <span className="bg-slate-950/90 text-cyan-300 border border-slate-800 px-2 py-0.5 rounded-lg hidden sm:inline-flex items-center gap-1.5">
                      <span>{cityTelemetry.condition} {cityTelemetry.tempC}°C</span>
                      {cityTelemetry.activeAlert && (
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                          cityTelemetry.activeAlert.severity === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500/30 text-amber-300'
                        }`}>
                          {cityTelemetry.activeAlert.badge}
                        </span>
                      )}
                    </span>
                  )}
                  <span className="text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800 hidden md:inline">
                    🕒 {cityLocalTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-2 sm:px-2.5 py-1 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/40 hover:to-indigo-500/40 border border-purple-500/40 text-purple-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Share Live Ad Takeover Proof"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">📸 Proof</span>
                </button>

                <button
                  onClick={handleCopyLiveLink}
                  className="px-2 sm:px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Copy shareable live billboard link"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-cyan-400" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Link'}</span>
                </button>

                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer"
                  title="Full Screen View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
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
            <div className="relative aspect-video max-h-[260px] sm:max-h-[440px] w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
              {glassGlare && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />
              )}

              {winningAd.imageUrl && !imageError ? (
                (winningAd as any).mediaType === 'video' || winningAd.imageUrl.startsWith('data:video/') || winningAd.imageUrl.toLowerCase().includes('.mp4') || winningAd.imageUrl.toLowerCase().includes('/video-cdn/') ? (
                  <video
                    key={winningAd.imageUrl}
                    src={winningAd.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <img
                    key={winningAd.imageUrl}
                    src={winningAd.imageUrl}
                    alt={winningAd.title}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                )
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 space-y-2 max-w-lg">
                    <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-3 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-lg">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {winningAd.advertiserName || 'Virtual Billboard Broadcast'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md">
                      {winningAd.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-mono tracking-wide">
                      🔴 Live 24/7 Global Screen Takeover
                    </p>
                  </div>
                </div>
              )}

              {/* Top Floating Badges: Countdown Timer & Live/Tier 1 Status */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
                <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-mono shadow-xl pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-black text-white text-xs">{remainingSeconds}s Left</span>
                </div>

                {((slotData as any)?.trafficTier === 'tier1_staring_eyeballs' || (winningAd as any)?.trafficTier === 'tier1_staring_eyeballs') ? (
                  <div className="bg-gradient-to-r from-amber-500/95 via-red-600/95 to-amber-600/95 backdrop-blur-md border border-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-mono shadow-xl pointer-events-auto text-white font-black animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="tracking-wide uppercase">🔥 TIER 1: STARING EYEBALLS [100% VERIFIED]</span>
                  </div>
                ) : (
                  <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 px-2 py-1 rounded-xl flex items-center gap-1 text-[10px] font-mono shadow-xl pointer-events-auto text-cyan-300">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span className="font-bold text-[9px] tracking-wider uppercase">LIVE SCREEN</span>
                  </div>
                )}
              </div>



              {/* Bottom Floating Banner - Advertiser Title & CTA */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-2.5 sm:p-4 flex items-end justify-between gap-2 z-20">
                <div className="max-w-xl space-y-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="bg-slate-900/95 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-mono font-bold shadow-md">
                      {winningAd.advertiserName}
                    </span>
                  </div>

                  <h2 className="text-xs sm:text-sm font-black text-white tracking-tight drop-shadow-md leading-snug line-clamp-1">
                    {winningAd.title}
                  </h2>

                  {/* Single CTA Button Overlay & Live Scannable Dynamic QR Code */}
                  {winningAd && (
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      {/* WhatsApp CTA */}
                      {((winningAd as any).ctaType === 'whatsapp' || (!(winningAd as any).ctaType && !(winningAd as any).landingPageUrl && (winningAd as any).whatsappLink)) && (
                        <a
                          href={(winningAd as any).ctaUrl || ((winningAd as any).whatsappLink?.startsWith('http') ? (winningAd as any).whatsappLink : `https://wa.me/${((winningAd as any).whatsappLink || '').replace(/[^0-9]/g, '')}`)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[9px] sm:text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md transition-transform active:scale-95"
                        >
                          <MessageSquare className="w-3 h-3 fill-current" />
                          <span>WhatsApp</span>
                          <span className="text-[8px]">↗</span>
                        </a>
                      )}

                      {/* Website Landing Page CTA */}
                      {((winningAd as any).ctaType === 'url' || (!['whatsapp', 'none'].includes((winningAd as any).ctaType) && ((winningAd as any).ctaUrl || (winningAd as any).landingPageUrl))) && (
                        <a
                          href={(winningAd as any).ctaUrl || (winningAd as any).landingPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[9px] sm:text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md font-mono transition-transform active:scale-95"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="max-w-[120px] truncate">{((winningAd as any).ctaUrl || (winningAd as any).landingPageUrl || '').replace(/^https?:\/\//, '')}</span>
                          <span className="text-[8px]">↗</span>
                        </a>
                      )}

                      {/* Universal Interactive Scannable Dynamic QR Code Button */}
                      {(() => {
                        const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://www.livebillboards.lol';
                        const trackableQrUrl = winningAd?.id
                          ? `${origin}/api/qr-scan/${winningAd.id}?screen=web`
                          : ((winningAd as any).ctaUrl || (winningAd as any).landingPageUrl || `https://livebillboards.lol/?city=${selectedCity}`);
                        const directUrl = (winningAd as any).ctaUrl || (winningAd as any).landingPageUrl || trackableQrUrl;
                        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=6&data=${encodeURIComponent(trackableQrUrl)}`;

                        return (
                          <button
                            type="button"
                            onClick={() => setActiveQrModalData({
                              isOpen: true,
                              url: trackableQrUrl,
                              targetUrl: directUrl,
                              title: winningAd.title,
                              advertiser: winningAd.advertiserName || 'Live Billboard Sponsor'
                            })}
                            className="flex items-center gap-1.5 bg-white text-slate-950 px-2 py-1 rounded-lg border border-cyan-400 shadow-md shadow-black/40 hover:bg-cyan-50 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-cyan-400/50 animate-pulse"
                            title="Click to Enlarge Scannable QR Code"
                          >
                            <img
                              src={qrImageUrl}
                              alt="Scan QR"
                              className="w-4 h-4 object-contain rounded-xs"
                              onError={(e: any) => {
                                e.currentTarget.src = `https://quickchart.io/qr?size=150&text=${encodeURIComponent(trackableQrUrl)}`;
                              }}
                            />
                            <span className="text-[9px] font-black tracking-wider font-mono uppercase">SCAN QR</span>
                            <Maximize2 className="w-2.5 h-2.5 text-slate-600" />
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl text-right shadow-xl shrink-0">
                    <div className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">Active Bid</div>
                    <div className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                      ${(winningAd.bidAmountCents / 100).toFixed(2)}
                      <span className="text-[9px] font-normal text-slate-400">/15s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Life Physical Frame Base */}
            <div className="bg-slate-900 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-sans text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  Feed: <strong className="text-white">{currentCityConfig.cityName}</strong>
                </span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>RTB Active</span>
                </span>
              </div>

              <div className="text-slate-500 text-[10px] font-mono">
                Slot: <strong className="text-slate-300">{slotData.slotId}</strong>
              </div>
            </div>
          </LandmarkFrame>

          {/* Visual Real-Time Broadcast Queue (Next 3 Slots) */}
          <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-3 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Live Broadcast Queue (15s Turns)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Auto-Rotating</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Slot 1: Active Now */}
              <div className="bg-cyan-950/40 border border-cyan-500/50 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 font-bold mb-1">
                  <span>🔴 SLOT #1 (NOW LIVE)</span>
                  <span className="font-black">{remainingSeconds}s</span>
                </div>
                <p className="text-[11px] font-bold text-white truncate">{winningAd.title}</p>
                <p className="text-[9px] text-slate-400 font-mono">${(winningAd.bidAmountCents / 100).toFixed(2)} USD</p>
              </div>

              {/* Slot 2: Up Next */}
              <div className="bg-amber-950/30 border border-amber-500/40 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-[9px] font-mono text-amber-400 font-bold mb-1">
                  <span>⏳ SLOT #2 (UP NEXT)</span>
                  <span>in {remainingSeconds}s</span>
                </div>
                <p className="text-[11px] font-bold text-white truncate">
                  {userBroadcast ? userBroadcast.title : 'Open Slot • Place Bid Now'}
                </p>
                <p className="text-[9px] text-amber-300/80 font-mono">
                  {userBroadcast ? '🎬 Scheduled Next' : '⚡ Outbid to Claim'}
                </p>
              </div>

              {/* Slot 3: In Queue */}
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl hidden sm:block">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold mb-1">
                  <span>🕒 SLOT #3 (IN QUEUE)</span>
                  <span>in {remainingSeconds + 15}s</span>
                </div>
                <p className="text-[11px] font-bold text-slate-300 truncate">Global Ad Rotation</p>
                <p className="text-[9px] text-slate-500 font-mono">Reserve with $1.00</p>
              </div>
            </div>
          </div>


          {/* Live Slot Token Burn Ticker */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 animate-pulse shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-amber-400 font-mono uppercase">
                    🔥 Live Slot Ticker [{currentCityConfig.cityCode}]
                  </span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono">
                    15s Turns
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  Slot <strong className="text-white font-mono">{slotData?.slotId}</strong> • <strong className="text-amber-400 font-mono">{(winningAd as any).bidAmountTokens || Math.max(1, Math.round(winningAd.bidAmountCents * 10))} Tokens Burned</strong>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                ⚡ 100% Slot Velocity
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fast Bidding Console with Live 16:9 Mockup Card (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 p-3.5 sm:p-4 rounded-3xl space-y-2.5 shadow-xl">
            {/* Header & Wallet */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    Fast Bidding Console
                    <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-mono font-bold">
                      Instant RTB
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Broadcast in <strong className="text-cyan-400">{currentCityConfig.cityName}</strong>
                  </p>
                </div>
              </div>

              {/* Ad Wallet Pill */}
              <div className="flex items-center gap-1.5">
                <div className="bg-slate-950 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-mono">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-black text-emerald-400 text-xs">
                    {(tokensBalance || Math.round((Number(walletBalanceDollars) || 0) * 1000)).toLocaleString()} Tokens (${Math.max(0, Number(walletBalanceDollars) || 0).toFixed(2)})
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!hasClaimedStarter && (Number(walletBalanceDollars) || 0) <= 0 && onClaimStarter) {
                      onClaimStarter();
                    } else if (onOpenWalletModal) {
                      onOpenWalletModal();
                    }
                  }}
                  className={`px-2.5 py-1 border font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    !hasClaimedStarter && (Number(walletBalanceDollars) || 0) <= 0
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 animate-pulse'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  {!hasClaimedStarter && (Number(walletBalanceDollars) || 0) <= 0 ? <span>Claim $1.00</span> : <span>+ Top Up</span>}
                </button>
              </div>
            </div>

            {/* Mode Switcher: Instant RTB vs Future Date Reservation */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setBiddingTab('instant')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  biddingTab === 'instant'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>⚡ Instant RTB (Next 15s)</span>
              </button>
              <button
                type="button"
                onClick={() => setBiddingTab('future')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  biddingTab === 'future'
                    ? 'bg-purple-950 border border-purple-500 text-purple-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>📅 Future Date Lock</span>
              </button>
            </div>

            {/* Traffic Tier Selector: Standard vs Tier 1 Staring Eyeballs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-slate-300 uppercase tracking-wider">🎯 Select Attention Traffic Tier:</span>
                <span className="text-amber-400 font-bold">PoA Cryptographic Proof</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrafficTier('standard');
                    if (bidAmountDollars === 5.00) setBidAmountDollars(1.00);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
                    selectedTrafficTier === 'standard'
                      ? 'bg-slate-900 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-extrabold text-white text-xs">Standard Broadcast</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono font-bold">1,000 Tokens ($1.00 / 15s)</span>
                  <span className="text-[9px] text-slate-400 font-mono">Global 24/7 Virtual Screen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrafficTier('tier1_staring_eyeballs');
                    setBidAmountDollars(5.00);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-start gap-1 transition-all text-left cursor-pointer relative overflow-hidden ${
                    selectedTrafficTier === 'tier1_staring_eyeballs'
                      ? 'bg-gradient-to-br from-amber-950/90 via-red-950/70 to-slate-950 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/60 ring-1 ring-amber-400/60'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="font-extrabold text-amber-300 text-xs">🔥 Tier 1: Staring Eyeballs</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">5,000 Tokens ($5.00 / 15s)</span>
                  <span className="text-[9px] text-amber-400/90 font-mono">100% Active Human Verification</span>
                </button>
              </div>
            </div>

            {biddingTab === 'future' && (
              <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <span>📅 Select Guaranteed Broadcast Date & Time:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Date:</label>
                    <input
                      type="date"
                      value={selectedFutureDate}
                      onChange={(e) => setSelectedFutureDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Time Slot:</label>
                    <input
                      type="time"
                      value={selectedFutureHour}
                      onChange={(e) => setSelectedFutureHour(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 1-Click Creative Templates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ⚡ Instant Creative Presets:
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {AD_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setBidTitle(tpl.title);
                      setBidImageUrl(tpl.imageUrl);
                      setMediaUrlInput(tpl.imageUrl);
                      setBidMediaType(tpl.mediaType);
                      setBidCtaType(tpl.ctaType);
                      setBidCtaUrl(tpl.ctaUrl);
                      setUploadedFileName(tpl.label);
                    }}
                    className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left text-[11px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="truncate">{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {bidFeedback && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                bidFeedback.success
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}>
                {bidFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span className="truncate">{bidFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleQuickBidSubmit} className="space-y-3">
              {/* Ad Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Ad Headline <span className="text-cyan-400 font-mono text-[9px]">*Required</span>
                </label>
                <input
                  type="text"
                  value={bidTitle}
                  onChange={(e) => setBidTitle(e.target.value)}
                  placeholder="e.g. AI Smart Specs 2026 — 50% Off Today"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* CTA Picker */}
              <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase">CTA Button</span>
                  <span className="text-[9px] text-slate-400">Website or WhatsApp</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBidCtaType('website')}
                    className={`py-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      bidCtaType === 'website'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>Website</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBidCtaType('whatsapp')}
                    className={`py-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      bidCtaType === 'whatsapp'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBidCtaType('none');
                      setBidCtaUrl('');
                    }}
                    className={`py-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      bidCtaType === 'none'
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>No CTA</span>
                  </button>
                </div>

                {bidCtaType !== 'none' && (
                  <input
                    type="text"
                    value={bidCtaUrl}
                    onChange={(e) => setBidCtaUrl(e.target.value)}
                    placeholder={bidCtaType === 'website' ? 'https://yourbrand.com' : 'https://wa.me/1234567890'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono mt-1"
                    required
                  />
                )}
              </div>

              {/* LIVE INTERACTIVE BILLBOARD MOCKUP PREVIEW CARD */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Live Screen Mockup Preview</span>
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                    16:9 Billboard
                  </span>
                </div>

                {/* Compact Mockup Billboard Bezel */}
                <div className="relative h-24 sm:h-28 rounded-xl bg-slate-950 border border-cyan-500/40 overflow-hidden shadow-inner flex items-center justify-center group">
                  {bidImageUrl ? (
                    bidMediaType === 'video' || bidImageUrl.startsWith('data:video/') || bidImageUrl.toLowerCase().includes('.mp4') || bidImageUrl.toLowerCase().includes('/video-cdn/') ? (
                      <video
                        key={bidImageUrl}
                        src={bidImageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        key={bidImageUrl}
                        src={bidImageUrl}
                        alt="Creative Preview"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setSocialResolveError('Image failed to load. Please verify the URL or try uploading directly.');
                        }}
                      />
                    )
                  ) : (
                    <div className="text-center p-2 flex items-center justify-center gap-2">
                      <FileImage className="w-4 h-4 text-cyan-500/70 shrink-0" />
                      <p className="text-[10px] text-slate-300 font-medium">1-Click template or upload image/video below</p>
                    </div>
                  )}

                  {/* Overlaid Headline & CTA (matching real billboard display) */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-2 flex items-end justify-between gap-2 pointer-events-none">
                    <div className="min-w-0">
                      <div className="text-[8px] font-mono font-bold text-cyan-300 uppercase truncate">
                        {currentUser?.displayName || 'Your Brand'} • [{selectedCity}]
                      </div>
                      <div className="text-xs font-black text-white truncate max-w-[200px]">
                        {bidTitle || 'Your Ad Headline Appears Here'}
                      </div>
                    </div>
                    {bidCtaType !== 'none' && (
                      <span className="px-1.5 py-0.5 bg-cyan-500 text-slate-950 font-bold text-[8px] rounded font-mono shrink-0">
                        {bidCtaType === 'whatsapp' ? 'WhatsApp' : 'Website'} ↗
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Creative Input Mode: Paste URL (Image/GIF/Video) vs Upload Local File */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <span>Creative Media</span>
                    <span className="text-cyan-400 font-mono text-[9px]">*Required</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCreativeInputMode('url')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        creativeInputMode === 'url'
                          ? 'bg-cyan-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Paste URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreativeInputMode('upload')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        creativeInputMode === 'upload'
                          ? 'bg-cyan-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>

                {creativeInputMode === 'url' ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="url"
                        value={mediaUrlInput}
                        onChange={(e) => handleMediaUrlChange(e.target.value)}
                        placeholder="Paste X/Twitter video or post link, GIF, or MP4 URL"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-8 pr-16 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <Link2 className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
                      {mediaUrlInput && (
                        <button
                          type="button"
                          onClick={() => handleMediaUrlChange('')}
                          className="absolute right-2 top-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Detected Type Pill & Quick One-Click Presets */}
                    <div className="flex items-center justify-between gap-1 flex-wrap text-[10px]">
                      {isResolvingSocialMedia ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse text-[10px]">
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                          <span>Extracting X Video Stream...</span>
                        </span>
                      ) : socialResolveError ? (
                        <span className="text-amber-400 text-[10px] font-medium flex items-center gap-1">
                          ⚠️ {socialResolveError}
                        </span>
                      ) : bidImageUrl ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          {uploadedFileName || (bidMediaType === 'video'
                            ? '🎬 MP4/WebM Video'
                            : bidImageUrl.toLowerCase().includes('.gif') || bidImageUrl.toLowerCase().includes('giphy') || bidImageUrl.toLowerCase().includes('tenor')
                            ? '👾 Animated GIF'
                            : '🖼️ Online Image')}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Supports X (Twitter) video links, GIF, MP4, WebM, PNG, JPG</span>
                      )}

                      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                        <span className="text-slate-500 text-[9px]">Try GIF:</span>
                        <button
                          type="button"
                          onClick={() => handleMediaUrlChange('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')}
                          className="px-1.5 py-0.5 bg-purple-950/70 hover:bg-purple-900 border border-purple-800/80 text-purple-300 rounded text-[9px] font-mono cursor-pointer"
                        >
                          👾 Cyberpunk
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMediaUrlChange('https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif')}
                          className="px-1.5 py-0.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 rounded text-[9px] font-mono cursor-pointer"
                        >
                          🚀 Rocket
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone / Change File */
                  !bidImageUrl ? (
                    <label className="flex items-center justify-center gap-2.5 p-2 border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-950/80 rounded-xl cursor-pointer hover:bg-slate-900/60 transition group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                        <UploadCloud className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] font-bold text-white flex items-center gap-1">
                        <span>Upload Custom Media (Image, GIF, or MP4)</span>
                      </p>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 px-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-300 truncate">
                        Asset: <strong className="text-cyan-400">{uploadedFileName || 'Billboard Asset'}</strong>
                      </div>
                      <label className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer underline px-2 py-0.5 bg-cyan-950 rounded-lg border border-cyan-500/30 shrink-0">
                        Change File
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )
                )}
              </div>

              {/* Bid Amount & Submit */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase">Bid:</span>
                    <div className="relative w-24">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                      <input
                        type="number"
                        min="1.00"
                        step="0.50"
                        value={bidAmountDollars}
                        onChange={(e) => setBidAmountDollars(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 pl-6 pr-1 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/30">
                      {Math.round(bidAmountDollars * 1000).toLocaleString()} tokens
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[
                      Number(currentTopDollars) + 1,
                      Number(currentTopDollars) + 2
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBidAmountDollars(preset)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          bidAmountDollars === preset
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        +${preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1-Click Strategic Bidding Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBidAmountDollars(5.00)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      bidAmountDollars === 5.00
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-white">⚡ $5.00</span>
                    <span className="text-[8px] text-slate-400">Quick Blast</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBidAmountDollars(10.00)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      bidAmountDollars === 10.00
                        ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-md shadow-purple-950'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-white">🚀 $10.00</span>
                    <span className="text-[8px] text-slate-400">Front-Runner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBidAmountDollars(25.00)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      bidAmountDollars === 25.00
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-md shadow-amber-950'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-white">👑 $25.00</span>
                    <span className="text-[8px] text-slate-400">Takeover</span>
                  </button>
                </div>

                {/* Multi-Slot Counter — bid for 1-10 rotation slots */}
                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Rotation Slots</span>
                    <span className="text-[10px] text-amber-300 font-mono">
                      Total: <strong className="text-white">${(bidAmountDollars * bidSlotsCount).toFixed(2)}</strong>
                      {bidSlotsCount > 1 && <span className="text-slate-500"> ({bidSlotsCount}× loops)</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBidSlotsCount(s => Math.max(1, s - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-white font-black text-sm flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
                    >−</button>
                    <span className="text-white font-mono font-black text-sm w-6 text-center">{bidSlotsCount}</span>
                    <button
                      type="button"
                      onClick={() => setBidSlotsCount(s => Math.min(10, s + 1))}
                      className="w-7 h-7 rounded-lg bg-cyan-600 border border-cyan-500 text-slate-950 font-black text-sm flex items-center justify-center hover:bg-cyan-500 transition cursor-pointer"
                    >+</button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBid}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current shrink-0" />
                  <span>
                    {isSubmittingBid
                      ? 'Submitting Creative...'
                      : bidSlotsCount > 1
                        ? `⚡ Place ${bidSlotsCount} Slots (${Math.round(bidAmountDollars * bidSlotsCount * 1000).toLocaleString()} Tokens / $${(bidAmountDollars * bidSlotsCount).toFixed(2)})`
                        : `⚡ Place Bid (${Math.round(bidAmountDollars * 1000).toLocaleString()} Tokens / $${bidAmountDollars.toFixed(2)})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Live Ad Takeover Share Card Modal */}
      <ShareProofModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slotData={slotData}
        selectedCity={selectedCity}
        selectedCityName={currentCityConfig.cityName}
      />

      {/* Dynamic High-Res Scannable QR Code Modal */}
      {activeQrModalData?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <button
              onClick={() => setActiveQrModalData(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <QrCode className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-base font-black text-white">{activeQrModalData.title}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Sponsor: {activeQrModalData.advertiser}</p>

            {/* High Contrast Scannable Container */}
            <div className="bg-white p-4 rounded-2xl my-4 mx-auto w-fit shadow-xl border-4 border-cyan-400/30">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(activeQrModalData.url)}`}
                alt="Campaign QR Code"
                className="w-52 h-52 object-contain"
                onError={(e: any) => {
                  e.currentTarget.src = `https://quickchart.io/qr?size=300&text=${encodeURIComponent(activeQrModalData.url)}`;
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold mb-4 font-mono">
              <Camera className="w-4 h-4 animate-pulse" />
              <span>Point your phone camera to scan & open</span>
            </div>

            <div className="space-y-2">
              <a
                href={activeQrModalData.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Open Destination Link Directly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeQrModalData.url);
                  setCopiedQrLink(true);
                  setTimeout(() => setCopiedQrLink(false), 2000);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedQrLink ? 'Destination URL Copied!' : 'Copy Destination Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
