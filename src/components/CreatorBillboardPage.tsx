import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ActiveBillboardSlot, ToastMessage, UserRole } from '../types';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Coins,
  DollarSign,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  Globe,
  Radio,
  Share2,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface CreatorProfile {
  handle: string;
  displayName: string;
  avatarUrl: string;
  category: string;
  bio: string;
  followerCount: string;
  verified: boolean;
  minBidDollars: number;
  totalEarnedDollars: number;
  payoutSplitPercent: number; // e.g. 80
}

const DEFAULT_CREATORS: Record<string, CreatorProfile> = {
  elonmusk: {
    handle: 'elonmusk',
    displayName: 'Elon Musk',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300',
    category: 'Tech & Aerospace',
    bio: 'Occupy Mars. Building AI, rockets & sustainable energy.',
    followerCount: '190M+ Followers',
    verified: true,
    minBidDollars: 25.00,
    totalEarnedDollars: 14850.00,
    payoutSplitPercent: 80
  },
  mrbeast: {
    handle: 'mrbeast',
    displayName: 'MrBeast',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    category: 'Creator & Entertainment',
    bio: 'I want to make the world a better place before I die.',
    followerCount: '310M+ Subscribers',
    verified: true,
    minBidDollars: 50.00,
    totalEarnedDollars: 42300.00,
    payoutSplitPercent: 80
  },
  kaicenat: {
    handle: 'kaicenat',
    displayName: 'Kai Cenat',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    category: 'Live Broadcast & Comedy',
    bio: 'Streamer of the Year. Live every day.',
    followerCount: '15M+ Followers',
    verified: true,
    minBidDollars: 15.00,
    totalEarnedDollars: 28400.00,
    payoutSplitPercent: 80
  },
  ishowspeed: {
    handle: 'ishowspeed',
    displayName: 'IShowSpeed',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    category: 'Gaming & IRL Broadcasts',
    bio: 'Suiiii! Traveling the globe live on stream.',
    followerCount: '28M+ Subscribers',
    verified: true,
    minBidDollars: 20.00,
    totalEarnedDollars: 31200.00,
    payoutSplitPercent: 80
  },
  marquesbrownlee: {
    handle: 'marquesbrownlee',
    displayName: 'Marques Brownlee (MKBHD)',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
    category: 'Consumer Tech',
    bio: 'Quality tech videos. Crisp reviews & insights.',
    followerCount: '19M+ Subscribers',
    verified: true,
    minBidDollars: 30.00,
    totalEarnedDollars: 18900.00,
    payoutSplitPercent: 80
  },
  naval: {
    handle: 'naval',
    displayName: 'Naval Ravikant',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    category: 'Startups & Philosophy',
    bio: 'How to get rich without getting lucky.',
    followerCount: '2.5M+ Followers',
    verified: true,
    minBidDollars: 10.00,
    totalEarnedDollars: 9200.00,
    payoutSplitPercent: 80
  }
};

interface CreatorBillboardPageProps {
  creatorHandle: string;
  onOpenWalletModal: () => void;
  onOpenAuthModal: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  currentUser: any;
  userRole: UserRole;
  tokensBalance: number;
}

export const CreatorBillboardPage: React.FC<CreatorBillboardPageProps> = ({
  creatorHandle,
  onOpenWalletModal,
  onOpenAuthModal,
  addToast,
  currentUser,
  userRole,
  tokensBalance
}) => {
  const cleanHandle = creatorHandle.replace(/^@/, '').toLowerCase();
  const creator = DEFAULT_CREATORS[cleanHandle] || {
    handle: cleanHandle,
    displayName: `@${cleanHandle}`,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
    category: 'Creator & Streamer',
    bio: `Official 24/7 Virtual Billboard for @${cleanHandle}. Fans and sponsors can bid to display live ads and messages.`,
    followerCount: 'Verified Channel',
    verified: false,
    minBidDollars: 5.00,
    totalEarnedDollars: 0.00,
    payoutSplitPercent: 80
  };

  const [activeSlot, setActiveSlot] = useState<ActiveBillboardSlot | null>(null);
  const [bidTitle, setBidTitle] = useState('');
  const [bidImageUrl, setBidImageUrl] = useState('');
  const [bidMediaType, setBidMediaType] = useState<'image' | 'video'>('image');
  const [bidCtaUrl, setBidCtaUrl] = useState('');
  const [bidDollars, setBidDollars] = useState(creator.minBidDollars.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'bid' | 'stream_embed' | 'earnings'>('bid');

  // Embed Widget URL for stream software (YouTube, Twitch, TikTok, Kick, Zoom, etc.)
  const streamWidgetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/overlay?creator=${creator.handle}&theme=cyberpunk`
    : `https://livebillboards.lol/overlay?creator=${creator.handle}`;

  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${creator.handle}`
    : `https://livebillboards.lol/@${creator.handle}`;

  // Fetch or mock active slot for this creator
  useEffect(() => {
    fetch(`/api/billboard/active?city=GLOBAL&creator=${creator.handle}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setActiveSlot(data);
      })
      .catch(() => {});
  }, [creator.handle]);

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(streamWidgetUrl).then(() => {
      setCopiedEmbed(true);
      addToast({
        title: 'Stream Widget Link Copied!',
        message: 'Add as a Browser Source in your streaming software (Twitch, YouTube, TikTok, Kick).',
        type: 'success'
      });
      setTimeout(() => setCopiedEmbed(false), 3000);
    });
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopiedShare(true);
      addToast({
        title: 'Billboard Link Copied!',
        message: `Share ${shareableUrl} with your audience & sponsors!`,
        type: 'success'
      });
      setTimeout(() => setCopiedShare(false), 3000);
    });
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
    setBidMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBidImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidImageUrl) {
      addToast({
        title: 'Upload Required',
        message: 'Please upload an image or MP4 video for the billboard display.',
        type: 'error'
      });
      return;
    }
    if (!bidTitle) {
      addToast({
        title: 'Headline Required',
        message: 'Please provide a campaign headline or message.',
        type: 'error'
      });
      return;
    }

    const dollars = parseFloat(bidDollars);
    if (isNaN(dollars) || dollars < creator.minBidDollars) {
      addToast({
        title: 'Minimum Bid Notice',
        message: `Minimum bid for @${creator.handle}'s billboard is $${creator.minBidDollars.toFixed(2)}.`,
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser?.uid || 'guest_user' },
        body: JSON.stringify({
          title: bidTitle,
          imageUrl: bidImageUrl,
          mediaType: bidMediaType,
          bidAmountDollars: dollars,
          cityCode: 'GLOBAL',
          countryCode: 'GLOBAL',
          creatorHandle: creator.handle,
          ctaType: bidCtaUrl ? 'website' : 'none',
          ctaUrl: bidCtaUrl || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        addToast({
          title: 'Ad Placed Live on Billboard!',
          message: `Your ad is now queued for @${creator.handle}'s live billboard and live stream!`,
          type: 'success'
        });
        setBidTitle('');
        setBidImageUrl('');
        setBidCtaUrl('');
      } else {
        addToast({
          title: 'Bid Notice',
          message: data.error || 'Failed to submit bid. Please check your token balance.',
          type: 'error'
        });
      }
    } catch {
      addToast({
        title: 'Connection Notice',
        message: 'Unable to connect to bid server.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCreatorClaimed = creator.verified;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Creator Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={creator.avatarUrl}
                alt={creator.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-cyan-400/80 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-cyan-500 text-slate-950 rounded-xl shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {creator.displayName}
                </h1>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold rounded-full">
                  @{creator.handle}
                </span>
                {isCreatorClaimed && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    VERIFIED CREATOR
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-2">
                {creator.bio}
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                <span>{creator.followerCount}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">Min Bid: ${creator.minBidDollars.toFixed(2)}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">80% Creator Payout</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            <button
              onClick={handleCopyShare}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {copiedShare ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{copiedShare ? 'Link Copied!' : 'Share Billboard'}</span>
            </button>

            <button
              onClick={handleCopyEmbed}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              title="Copy universal stream browser overlay source"
            >
              {copiedEmbed ? <CheckCircle2 className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              <span>{copiedEmbed ? 'Embed Copied!' : 'Stream Embed URL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Screen Preview & Action Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: The Creator's Live 24/7 Virtual Billboard Screen */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  @{creator.handle}'s Live Screen Feed
                </h3>
              </div>

              <span className="text-[10px] bg-slate-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                24/7 BROADCAST
              </span>
            </div>

            {/* Simulated Live Video/Image Canvas */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group">
              {activeSlot?.winningAd?.imageUrl ? (
                activeSlot.winningAd.mediaType === 'video' || activeSlot.winningAd.imageUrl.endsWith('.mp4') ? (
                  <video
                    src={activeSlot.winningAd.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeSlot.winningAd.imageUrl}
                    alt={activeSlot.winningAd.title}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Tv className="w-12 h-12 text-cyan-400/60 mx-auto animate-pulse" />
                  <div className="text-sm font-bold text-slate-300">
                    Be the First to Take Over @{creator.handle}'s Billboard!
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your ad or meme will display live on this screen and during @{creator.handle}'s live streams.
                  </p>
                </div>
              )}

              {/* Live Overlay HUD */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/50 pointer-events-none" />

              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs z-10">
                <span className="px-3 py-1 bg-slate-950/90 border border-cyan-500/50 text-cyan-300 font-black rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{activeSlot?.winningAd?.title || `@${creator.handle} Live Feed`}</span>
                </span>
                <span className="px-3 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-300 font-mono font-black rounded-xl backdrop-blur-md shadow-lg">
                  ⏱️ {activeSlot?.remainingSeconds ?? 15}s
                </span>
              </div>

              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs z-10">
                <div className="bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-slate-300 backdrop-blur-md font-mono text-[11px]">
                  <span className="text-slate-400">Winning Bid: </span>
                  <span className="font-bold text-amber-400">
                    ${((activeSlot?.winningAd?.bidAmountCents || creator.minBidDollars * 100) / 100).toFixed(2)}
                  </span>
                </div>

                <div className="bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-emerald-300 font-mono font-bold backdrop-blur-md text-[11px] flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>80% Payout to Creator</span>
                </div>
              </div>
            </div>

            {/* Stream Software Compatibility Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-slate-300 font-medium">
                  Compatible with YouTube Live, Twitch, TikTok Live, Kick, Zoom & Stage TVs.
                </span>
              </div>
              <button
                onClick={handleCopyEmbed}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] rounded-lg border border-slate-700 transition-all shrink-0 cursor-pointer"
              >
                Copy Overlay
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Bidding & Creator Tools Tabs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            {/* Tab Selector */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('bid')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'bid'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bid on Screen
              </button>
              <button
                onClick={() => setActiveTab('stream_embed')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'stream_embed'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Stream Embed
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'earnings'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Payouts (80%)
              </button>
            </div>

            {/* TAB 1: BID ON CREATOR BILLBOARD */}
            {activeTab === 'bid' && (
              <form onSubmit={handlePlaceBid} className="space-y-3.5">
                <div className="text-xs text-slate-300 font-sans">
                  Place an ad or message to broadcast live on @{creator.handle}'s billboard and stream.
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                    1. Campaign Headline / Message
                  </label>
                  <input
                    type="text"
                    required
                    value={bidTitle}
                    onChange={(e) => setBidTitle(e.target.value)}
                    placeholder="e.g. Check out my new game / Sponsoring the stream!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                    2. Creative File (Image or MP4 Video)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={handleFileSelected}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                    3. Optional Link / Website (Generates Live QR)
                  </label>
                  <input
                    type="url"
                    value={bidCtaUrl}
                    onChange={(e) => setBidCtaUrl(e.target.value)}
                    placeholder="https://mybrand.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="font-bold text-slate-400 uppercase">4. Bid Amount</span>
                    <span className="text-amber-400 font-bold">Min: ${creator.minBidDollars.toFixed(2)}</span>
                  </div>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.50"
                      min={creator.minBidDollars}
                      value={bidDollars}
                      onChange={(e) => setBidDollars(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{isSubmitting ? 'Submitting to Screen...' : `Place Bid ($${bidDollars})`}</span>
                </button>
              </form>
            )}

            {/* TAB 2: UNIVERSAL STREAM EMBED GUIDE */}
            {activeTab === 'stream_embed' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span>Universal Stream Overlay Source</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Copy this URL and add it as a <strong>Browser Source</strong> in your streaming software (YouTube, Twitch, TikTok, Kick, Zoom, etc.).
                  </p>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                    <input
                      type="text"
                      readOnly
                      value={streamWidgetUrl}
                      className="w-full bg-transparent font-mono text-[11px] text-cyan-300 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyEmbed}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400 font-sans">
                  <div className="font-bold text-slate-200">How It Works During Your Stream:</div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">1</span>
                    <span>Whenever a fan or brand bids, the overlay automatically takes over with animation & chime.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">2</span>
                    <span>You receive <strong>80% of every dollar spent</strong> instantly in your account.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EARNINGS & CREATOR CLAIM */}
            {activeTab === 'earnings' && (
              <div className="space-y-3.5 text-xs">
                <div className="p-4 bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Creator Revenue Split</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded-full">
                      80% PAYOUT RATE
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    ${creator.totalEarnedDollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Total lifetime revenue generated from ads and fan messages placed on @{creator.handle}'s billboard.
                  </p>
                </div>

                {!isCreatorClaimed && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Are you @{creator.handle}?</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Claim this live billboard handle to connect your payout wallet and customize minimum bid rates.
                    </p>
                    <button
                      onClick={onOpenAuthModal}
                      className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Claim @{creator.handle} Billboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
