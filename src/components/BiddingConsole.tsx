import React, { useState, useEffect, useRef } from 'react';
import { ToastMessage, ScheduledTimeSlot, HistoricalCityBid, UserBidActivity } from '../types';
import {
  DollarSign,
  Coins,
  Upload,
  Clock,
  Sparkles,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Globe,
  Zap,
  MessageSquare,
  ExternalLink,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  RefreshCw,
  History,
  BarChart2,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Bell,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { UserProfile } from '../lib/firebase';
import { BroadcastCelebrationModal } from './BroadcastCelebrationModal';

interface BiddingConsoleProps {
  selectedCity: string;
  selectedCountry: string;
  onBidSubmitted: () => void;
  addToast?: (toast: Omit<ToastMessage, 'id'>) => void;
  currentUser?: UserProfile | null;
  tokensBalance?: number;
  onOpenTokenStore?: () => void;
}

export const BiddingConsole: React.FC<BiddingConsoleProps> = ({
  selectedCity,
  selectedCountry,
  onBidSubmitted,
  addToast,
  currentUser,
  tokensBalance = 25000,
  onOpenTokenStore
}) => {
  const [biddingMode, setBiddingMode] = useState<'instant' | 'schedule'>('instant');
  const [currencyMode, setCurrencyMode] = useState<'tokens' | 'dollars'>('tokens');
  const [futureSlots, setFutureSlots] = useState<ScheduledTimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Form States
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [ctaType, setCtaType] = useState<'website' | 'whatsapp' | 'none'>('website');
  const [ctaUrl, setCtaUrl] = useState('https://yourbrand.com/promo');
  const [bidAmountTokens, setBidAmountTokens] = useState<string>('1');
  const [bidAmountDollars, setBidAmountDollars] = useState('0.001');
  const [durationSeconds, setDurationSeconds] = useState<number>(15);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // FEATURE 1: Top 5 Historical Bids Bar Chart (Recharts)
  const [topHistoricalBids, setTopHistoricalBids] = useState<HistoricalCityBid[]>([]);
  const [loadingTopHistory, setLoadingTopHistory] = useState<boolean>(false);

  // FEATURE 2: Auto-Renew (Auto-Outbid Protection)
  const [autoRenew, setAutoRenew] = useState<boolean>(false);
  const lastActiveCampaignRef = useRef<{
    title: string;
    imageUrl: string;
    mediaType: 'image' | 'video';
    ctaType: 'website' | 'whatsapp' | 'none';
    ctaUrl: string;
    landingPageUrl?: string;
    whatsappLink?: string;
    cityCode: string;
    countryCode: string;
    lastBidCents: number;
    userId: string;
  } | null>(null);

  // FEATURE 3: Recent Activity Dropdown (User's last 10 successful bids across all cities)
  const [showRecentActivity, setShowRecentActivity] = useState<boolean>(false);
  const [recentUserBids, setRecentUserBids] = useState<UserBidActivity[]>([]);
  const [loadingRecentBids, setLoadingRecentBids] = useState<boolean>(false);

  // FEATURE 4: Real-time 60-Second Slot Expiration Notification System
  const [activeSlotAlert, setActiveSlotAlert] = useState<{
    slotId: string;
    adTitle: string;
    cityCode: string;
    secondsRemaining: number;
    bidAmountDollars: string;
    userOwnsSlot: boolean;
  } | null>(null);
  const notifiedSlotIdsRef = useRef<Set<string>>(new Set());

  // Viral Broadcast Celebration Modal State
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationAdTitle, setCelebrationAdTitle] = useState('');
  const [celebrationCity, setCelebrationCity] = useState('');
  const [celebrationDollars, setCelebrationDollars] = useState('1.00');
  const [celebrationIsFree, setCelebrationIsFree] = useState(true);

  // Fetch Top 5 Historical Bids for Selected City
  const fetchTopHistoricalBids = async () => {
    setLoadingTopHistory(true);
    try {
      const res = await fetch(`/api/bids/top-history?cityCode=${encodeURIComponent(selectedCity)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topBids && Array.isArray(data.topBids)) {
          setTopHistoricalBids(data.topBids);
        }
      }
    } catch (e) {
      console.warn('Failed to load top historical bids:', e);
    } finally {
      setLoadingTopHistory(false);
    }
  };

  // Fetch User's Last 10 Bids across all cities
  const fetchRecentUserBids = async () => {
    const uid = currentUser?.uid || '';
    setLoadingRecentBids(true);
    try {
      const res = await fetch(`/api/bids/user-history?userId=${encodeURIComponent(uid)}`, {
        cache: 'no-store',
        headers: uid ? { 'x-user-uid': uid } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bids && Array.isArray(data.bids)) {
          setRecentUserBids(data.bids);
        }
      }
    } catch (e) {
      console.warn('Failed to load user recent bids:', e);
    } finally {
      setLoadingRecentBids(false);
    }
  };

  // Fetch future time slots whenever city changes or schedule mode is selected
  useEffect(() => {
    if (biddingMode === 'schedule') {
      fetchFutureSlots();
    }
  }, [selectedCity, biddingMode]);

  // Load Historical Top Bids & User Recent Bids on mount or city change
  useEffect(() => {
    fetchTopHistoricalBids();
    fetchRecentUserBids();
  }, [selectedCity, currentUser?.uid]);

  // FEATURE 4: Real-time Slot Expiry Notification System (Alerts users 60s before active slot expires)
  useEffect(() => {
    const checkSlotExpiration = async () => {
      try {
        const res = await fetch(`/api/billboard/active?city=${encodeURIComponent(selectedCity)}&country=${encodeURIComponent(selectedCountry)}`, {
          cache: 'no-store'
        });
        if (!res.ok) return;
        const data = await res.json();
        const remaining = data.remainingSeconds ?? 0;
        const slotId = data.slotId || `slot_${selectedCity}`;
        const winningAd = data.winningAd;
        const currentUserId = currentUser?.uid;
        const isUserSlot = !!(currentUserId && winningAd?.userId === currentUserId) || !!(lastActiveCampaignRef.current && lastActiveCampaignRef.current.cityCode === selectedCity);

        // If the slot is active and within 60 seconds of expiration (and > 0 seconds)
        if (remaining > 0 && remaining <= 60) {
          const adTitle = winningAd?.title || winningAd?.adTitle || (lastActiveCampaignRef.current ? lastActiveCampaignRef.current.title : 'Live Billboard Campaign');
          const bidAmount = winningAd?.bidAmountCents ? (winningAd.bidAmountCents / 100).toFixed(2) : '1.00';

          setActiveSlotAlert({
            slotId,
            adTitle,
            cityCode: selectedCity,
            secondsRemaining: remaining,
            bidAmountDollars: bidAmount,
            userOwnsSlot: isUserSlot
          });

          // Trigger high-priority Toast alert once per slotId
          if (!notifiedSlotIdsRef.current.has(slotId)) {
            notifiedSlotIdsRef.current.add(slotId);
            if (addToast) {
              addToast({
                type: 'warning',
                title: isUserSlot ? '⏳ Slot Expiring Soon (60s Alert)!' : `⏳ Active Slot Ending Soon [${selectedCity}]`,
                message: isUserSlot
                  ? `Your active campaign "${adTitle}" in ${selectedCity} will conclude in ${remaining}s. Re-bid or activate Auto-Renew to stay on screen!`
                  : `Current slot in ${selectedCity} concludes in ${remaining}s. Place your bid now to claim the upcoming broadcast window.`
              });
            }
          }
        } else if (remaining > 60 || remaining <= 0) {
          // Clear alert if outside 60s window or slot transitioned
          setActiveSlotAlert((prev) => (prev && prev.secondsRemaining <= 1 ? null : prev));
        }
      } catch (err) {
        console.warn('Slot expiration watcher error:', err);
      }
    };

    // Initial check and interval poll every 2 seconds
    checkSlotExpiration();
    const interval = setInterval(checkSlotExpiration, 2000);
    return () => clearInterval(interval);
  }, [selectedCity, selectedCountry, currentUser?.uid, addToast]);

  // Auto-Renew Polling Watcher: Checks if user was outbid in active city and auto-bids if enabled
  useEffect(() => {
    if (!autoRenew) return;

    const interval = setInterval(async () => {
      if (!lastActiveCampaignRef.current || !autoRenew) return;
      const activeCamp = lastActiveCampaignRef.current;
      if (activeCamp.cityCode !== selectedCity) return;

      try {
        const res = await fetch(`/api/bid/floor?city=${encodeURIComponent(selectedCity)}`);
        if (!res.ok) return;
        const data = await res.json();
        const topBidCents = data.currentTopBidCents || 0;

        // If another bidder surpassed our last bid amount
        if (topBidCents > activeCamp.lastBidCents) {
          const nextBidCents = topBidCents + 50; // outbid by +$0.50
          const nextBidDollars = (nextBidCents / 100).toFixed(2);

          // Place auto-renew bid leveraging user's wallet
          const bidRes = await fetch('/api/bids/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-uid': activeCamp.userId
            },
            body: JSON.stringify({
              title: activeCamp.title,
              imageUrl: activeCamp.imageUrl,
              mediaType: activeCamp.mediaType,
              ctaType: activeCamp.ctaType,
              ctaUrl: activeCamp.ctaUrl,
              landingPageUrl: activeCamp.landingPageUrl,
              whatsappLink: activeCamp.whatsappLink,
              targetCityCode: activeCamp.cityCode,
              targetCountryCode: activeCamp.countryCode,
              bidAmountCents: nextBidCents,
              advertiserName: currentUser?.displayName || 'Auto-Renew Protected',
              userId: activeCamp.userId
            })
          });

          const bidData = await bidRes.json();
          if (bidData.success) {
            activeCamp.lastBidCents = nextBidCents;
            if (addToast) {
              addToast({
                type: 'success',
                title: '⚡ Auto-Renew Triggered!',
                message: `Outbid detected in [${selectedCity}]. Automatically placed $${nextBidDollars} to reclaim #1 billboard spot!`
              });
            }
            // Trigger confetti celebration
            window.dispatchEvent(new CustomEvent('user-bid-placed', { detail: { city: selectedCity } }));
            onBidSubmitted();
            fetchRecentUserBids();
            fetchTopHistoricalBids();
          }
        }
      } catch (err) {
        console.warn('Auto-renew check error:', err);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [autoRenew, selectedCity, currentUser]);

  const fetchFutureSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/slots/future?cityCode=${encodeURIComponent(selectedCity)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.slots && Array.isArray(data.slots)) {
          setFutureSlots(data.slots);
          if (data.slots.length > 0 && !selectedSlotId) {
            setSelectedSlotId(data.slots[0].slotId);
            setBidAmountDollars(data.slots[0].reserveFloorDollars || '1.00');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load future slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: ScheduledTimeSlot) => {
    setSelectedSlotId(slot.slotId);
    const minBid = slot.currentTopBidDollars 
      ? (parseFloat(slot.currentTopBidDollars) + 0.50).toFixed(2)
      : slot.reserveFloorDollars;
    setBidAmountDollars(minBid);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Please select a valid image (PNG, JPG, WebP) or video file (.mp4, .webm).');
      return;
    }

    setMediaType(isVideo ? 'video' : 'image');
    setUploadedFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // One-Click Fast Load from Recent Activity Item
  const handleLoadRecentBid = (bid: UserBidActivity) => {
    setTitle(bid.title);
    setImageUrl(bid.imageUrl);
    setMediaType(bid.mediaType || 'image');
    setCtaType(bid.ctaType || 'website');
    if (bid.ctaUrl) setCtaUrl(bid.ctaUrl);
    setBidAmountDollars(bid.bidAmountDollars || '1.00');
    setUploadedFileName(bid.title);
    setShowRecentActivity(false);

    if (addToast) {
      addToast({
        type: 'info',
        title: 'Creative Loaded',
        message: `Loaded creative '${bid.title}' from your recent bid activity.`
      });
    }
  };

  const handleOneClickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !uploadedFileName) {
      setFeedback({ type: 'error', message: 'Please provide a campaign title or upload an ad creative.' });
      return;
    }

    if (!imageUrl) {
      setFeedback({ type: 'error', message: 'Please upload an image or video file.' });
      return;
    }

    if (biddingMode === 'schedule' && !selectedSlotId) {
      setFeedback({ type: 'error', message: 'Please select a future time slot to schedule your bid.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    // Validate tokens balance
    const parsedTokens = parseInt(bidAmountTokens) || 1;
    if ((tokensBalance ?? 0) < parsedTokens) {
      setFeedback({
        type: 'error',
        message: `Insufficient Ad Tokens! You have ${(tokensBalance ?? 0).toLocaleString()} tokens, but tried to bid ${parsedTokens.toLocaleString()} tokens. Please top up or convert cash in your Wallet.`
      });
      setSubmitting(false);
      return;
    }

    const slots = Math.max(1, Math.round(durationSeconds / 15));
    const totalTokens = parsedTokens * (biddingMode === 'schedule' ? 1 : slots);
    const totalCents = Math.max(1, Math.round(totalTokens / 10)); // 1 token = 0.1¢

    const landingPageUrl = ctaType === 'website' ? ctaUrl : undefined;
    const whatsappLink = ctaType === 'whatsapp' ? ctaUrl : undefined;

    const uid = currentUser?.uid || (typeof localStorage !== 'undefined' ? localStorage.getItem('vb_guest_uid') : null) || 'guest_default';
    const advertiserDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Direct Advertiser';

    try {
      if (biddingMode === 'schedule') {
        const chosenSlot = futureSlots.find(s => s.slotId === selectedSlotId);
        const res = await fetch('/api/bids/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-uid': uid
          },
          body: JSON.stringify({
            slotId: selectedSlotId,
            startTime: chosenSlot?.startTime,
            endTime: chosenSlot?.endTime,
            title: title || uploadedFileName || 'Scheduled Campaign',
            imageUrl,
            mediaType,
            ctaType,
            ctaUrl,
            landingPageUrl,
            whatsappLink,
            targetCityCode: selectedCity,
            targetCountryCode: selectedCountry,
            bidAmountTokens: totalTokens,
            bidAmountCents: totalCents,
            advertiserName: advertiserDisplayName,
            userId: uid
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setFeedback({
            type: 'error',
            message: data.error || 'Failed to schedule bid for selected time slot.'
          });
        } else {
          setFeedback({
            type: 'success',
            message: `Future bid successfully scheduled for ${chosenSlot?.timeLabel || 'selected slot'} in ${selectedCity}!`
          });

          // Dispatch confetti explosion event
          window.dispatchEvent(new CustomEvent('user-bid-placed', { detail: { city: selectedCity } }));

          if (addToast) {
            addToast({
              type: 'success',
              title: 'Bid Pre-Scheduled!',
              message: `Booked ${totalTokens.toLocaleString()} Tokens for '${title || 'Ad'}' (${chosenSlot?.timeLabel}) in ${selectedCity}.`
            });
          }

          fetchFutureSlots();
          fetchRecentUserBids();
          fetchTopHistoricalBids();
          onBidSubmitted();
        }
      } else {
        // Immediate active RTB slot submission
        const res = await fetch('/api/bids/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-uid': uid
          },
          body: JSON.stringify({
            title: title || uploadedFileName || 'Advertiser Campaign',
            imageUrl,
            mediaType,
            ctaType,
            ctaUrl,
            landingPageUrl,
            whatsappLink,
            targetCityCode: selectedCity,
            targetCountryCode: selectedCountry,
            bidAmountTokens: totalTokens,
            bidAmountCents: totalCents,
            advertiserName: advertiserDisplayName,
            userId: uid
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setFeedback({
            type: 'error',
            message: data.error || 'Bid submission rejected. Please check your creative.'
          });
        } else {
          setFeedback({
            type: 'success',
            message: `Campaign approved & active in ${selectedCity}! Your ad with interactive CTA link is now live.`
          });

          // Register for Auto-Renew monitoring if checked
          lastActiveCampaignRef.current = {
            title: title || uploadedFileName || 'Advertiser Campaign',
            imageUrl,
            mediaType,
            ctaType,
            ctaUrl,
            landingPageUrl,
            whatsappLink,
            cityCode: selectedCity,
            countryCode: selectedCountry,
            lastBidCents: totalCents,
            userId: uid
          };

          // Dispatch confetti explosion event
          window.dispatchEvent(new CustomEvent('user-bid-placed', { detail: { city: selectedCity } }));

          if (addToast) {
            addToast({
              type: 'success',
              title: 'Campaign Live!',
              message: `Successfully placed $${(totalCents / 100).toFixed(2)} campaign for '${title || 'Ad Creative'}' in ${selectedCity}.${autoRenew ? ' 🛡️ Auto-Renew protection active!' : ''}`
            });
          }

          // Open viral broadcast celebration modal
          setCelebrationAdTitle(title || uploadedFileName || 'My Campaign');
          setCelebrationCity(selectedCity);
          setCelebrationDollars((totalCents / 100).toFixed(2));
          setCelebrationIsFree(totalTokens <= 1000);
          setIsCelebrationOpen(true);

          fetchRecentUserBids();
          fetchTopHistoricalBids();
          onBidSubmitted();
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit campaign.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSlot = futureSlots.find(s => s.slotId === selectedSlotId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl text-white space-y-6">
      {/* Primary Value Pitch Headline */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border border-cyan-500/30 p-5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-black uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Digital Billboard Placement Console</span>
          </div>
          {autoRenew && (
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-700/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Auto-Renew Active
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
          Target local city audiences in real-time or pre-schedule slots.
        </h1>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Select your target city geofence ({selectedCountry === 'MY' ? '🇲🇾' : selectedCountry === 'JP' ? '🇯🇵' : selectedCountry === 'US' ? '🇺🇸' : '🇬🇧'} {selectedCity}), upload your ad creative, and broadcast immediately or lock in future time windows.
        </p>
      </div>

      {/* FEATURE 4: REAL-TIME 60-SECOND SLOT EXPIRATION ALERT BANNER */}
      <AnimatePresence>
        {activeSlotAlert && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-4 transition-all ${
              activeSlotAlert.userOwnsSlot
                ? 'bg-amber-950/80 border-amber-500/60 shadow-amber-500/10 text-amber-200 ring-1 ring-amber-500/40'
                : 'bg-indigo-950/80 border-indigo-500/60 shadow-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl border shrink-0 animate-bounce ${
                activeSlotAlert.userOwnsSlot
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
              }`}>
                <Bell className="w-5 h-5 animate-wiggle" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {activeSlotAlert.cityCode} SLOT EXPIRING
                  </span>
                  <span className="text-xs font-extrabold text-white truncate max-w-[200px] sm:max-w-[300px]">
                    "{activeSlotAlert.adTitle}"
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {activeSlotAlert.userOwnsSlot
                    ? `Your broadcast window is ending in ${activeSlotAlert.secondsRemaining}s! Submit a re-bid or toggle Auto-Renew to keep the slot.`
                    : `Active slot in ${activeSlotAlert.cityCode} ends in ${activeSlotAlert.secondsRemaining}s. Submit now to claim the next screen rotation.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-center px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 font-mono">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Expires In</div>
                <div className={`text-sm font-black animate-pulse ${
                  activeSlotAlert.secondsRemaining <= 15 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {activeSlotAlert.secondsRemaining}s
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBidAmountDollars((parseFloat(activeSlotAlert.bidAmountDollars) + 0.50).toFixed(2));
                  const formElement = document.querySelector('form');
                  if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer ${
                  activeSlotAlert.userOwnsSlot
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                    : 'bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-black'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{activeSlotAlert.userOwnsSlot ? 'Re-Bid (+$0.50)' : 'Bid Next Slot'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEATURE 1: RECHARTS TOP 5 HISTORICAL BIDS BAR CHART */}
      <div className="bg-slate-950/90 border border-slate-800/90 p-4 sm:p-5 rounded-2xl space-y-3 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                Top 5 Highest Historical Bids in <span className="text-cyan-400">{selectedCity}</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Competitive benchmark data to help guide your strategic bid pricing
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full font-mono">
            {topHistoricalBids.length > 0 ? `Max: $${Math.max(...topHistoricalBids.map(b => b.bidAmountDollars)).toFixed(2)}` : 'Live RTB'}
          </span>
        </div>

        {/* Small Recharts Bar Chart */}
        <div className="h-36 w-full pt-2">
          {loadingTopHistory ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 gap-2 font-mono">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading historical price points...</span>
            </div>
          ) : topHistoricalBids.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No historical bids recorded yet for {selectedCity}. Be the first!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topHistoricalBids}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="shortTitle"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as HistoricalCityBid;
                      return (
                        <div className="bg-slate-900 border border-cyan-500/40 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 z-50">
                          <div className="font-bold text-white flex items-center justify-between gap-3">
                            <span className="text-cyan-300">#{item.rank} {item.advertiserName}</span>
                            <span className="text-emerald-400 font-mono font-black">${item.bidAmountDollars.toFixed(2)}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] truncate max-w-[220px]">{item.title}</p>
                          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                            <span>{item.cityCode}</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="bidAmountDollars" radius={[4, 4, 0, 0]}>
                  {topHistoricalBids.map((_, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={
                        index === 0
                          ? '#06b6d4'
                          : index === 1
                          ? '#0ea5e9'
                          : index === 2
                          ? '#3b82f6'
                          : index === 3
                          ? '#6366f1'
                          : '#8b5cf6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* FEATURE 3: RECENT ACTIVITY DROPDOWN (LAST 10 USER BIDS ACROSS ALL CITIES) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => {
            const next = !showRecentActivity;
            setShowRecentActivity(next);
            if (next) fetchRecentUserBids();
          }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                Recent Activity
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {recentUserBids.length} Bids
                </span>
              </span>
              <p className="text-[10px] text-slate-400">
                View your last 10 successful bids across all cities with quick one-click re-bidding
              </p>
            </div>
          </div>
          <div className="p-1 text-slate-400 hover:text-white">
            {showRecentActivity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {showRecentActivity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-800/80 p-4 space-y-2.5 bg-slate-950/95"
            >
              {loadingRecentBids ? (
                <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Loading recent bid activity...</span>
                </div>
              ) : recentUserBids.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <History className="w-6 h-6 mx-auto mb-1 text-slate-700" />
                  <span>No bids placed yet. Place your first bid below to track your activity across global screens.</span>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/50">
                  {recentUserBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="pt-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-900/40 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {bid.imageUrl ? (
                          <img
                            src={bid.imageUrl}
                            alt={bid.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {bid.cityCode}
                            </span>
                            <span className="text-xs font-bold text-white truncate block">
                              {bid.title}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{bid.createdAt ? new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                            <span>•</span>
                            <span className="capitalize text-emerald-400 font-medium">{bid.status || 'Active'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-black text-cyan-400 font-mono">
                            ${bid.bidAmountDollars}
                          </div>
                          <div className="text-[9px] text-slate-500">15s Slot</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLoadRecentBid(bid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1"
                          title="Load this creative & bid into form"
                        >
                          <span>Re-bid</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FREE STARTER SLOT CLAIM BANNER */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-purple-950/80 border-2 border-cyan-500/50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 font-black shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white">1 Free 15s Billboard Broadcast Available</h4>
              <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                1,000 STARTER TOKENS
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Upload your brand or startup creative and broadcast live to thousands of viewers with 0 credit card needed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setBiddingMode('instant');
            setBidAmountTokens('1000');
            setBidAmountDollars('1.00');
            setDurationSeconds(15);
            if (addToast) {
              addToast({
                type: 'info',
                title: 'Free Slot Credit Applied',
                message: 'Preset form to 1,000 Starter Tokens (15s rotation). Just upload your creative and click Submit!'
              });
            }
          }}
          className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-xl font-black text-xs transition-all shadow-md shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Apply Free 15s Credit</span>
        </button>
      </div>

      {/* BIDDING MODE TOGGLE (Instant Active Slot vs. Schedule Future Slot) */}
      <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBiddingMode('instant')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            biddingMode === 'instant'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Instant Bid (Active Slot)</span>
        </button>

        <button
          type="button"
          onClick={() => setBiddingMode('schedule')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            biddingMode === 'schedule'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Bid (Future Slots)</span>
        </button>
      </div>

      {/* FUTURE TIME SLOTS SELECTOR (When in 'schedule' mode) */}
      {biddingMode === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950/90 border border-cyan-500/40 p-5 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Select Target Future Slot ({selectedCity})
              </span>
            </div>
            <button
              type="button"
              onClick={fetchFutureSlots}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Refresh Slots</span>
            </button>
          </div>

          {loadingSlots ? (
            <div className="py-6 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Scanning dynamic future inventory...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {futureSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.slotId;
                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {slot.timeLabel}
                      </span>
                      {slot.status === 'closing_soon' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/40 uppercase">
                          Next Up
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                      <span className="text-slate-400">
                        Floor: <strong className="text-cyan-300">${slot.reserveFloorDollars}</strong>
                      </span>
                      {slot.currentTopBidDollars ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Top: ${slot.currentTopBidDollars} ({slot.bidsCount} bids)
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No bids yet</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200 flex items-center justify-between">
              <span>Target Window: <strong>{selectedSlot.timeLabel}</strong></span>
              <span className="font-mono text-cyan-300">Min Bid: ${selectedSlot.currentTopBidDollars ? (parseFloat(selectedSlot.currentTopBidDollars) + 0.50).toFixed(2) : selectedSlot.reserveFloorDollars}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {biddingMode === 'schedule' ? 'Schedule Future Billboard Slot' : 'Launch Live Billboard Campaign'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Location: <span className="text-cyan-300 font-bold">{selectedCity} ({selectedCountry})</span>
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
          biddingMode === 'schedule'
            ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {biddingMode === 'schedule' ? 'Pre-Scheduled Slot' : 'One-Click Instant Launch'}
        </span>
      </div>

      <form onSubmit={handleOneClickSubmit} className="space-y-6">
        {/* FIELD 1: CREATIVE UPLOAD */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>1. Creative Upload (Image or MP4 Video)</span>
            <span className="text-[11px] text-slate-400 font-normal">PNG, JPG, MP4, WebM</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upload Box */}
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950 p-4 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center group transition-all min-h-[120px]">
              <Upload className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                {uploadedFileName || 'Click to Upload Ad Creative (Image / MP4 Video)'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Select local image or video file from device</span>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Creative Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
              {imageUrl ? (
                <div className="flex items-center gap-3 w-full">
                  {mediaType === 'video' || imageUrl.startsWith('data:video/') || imageUrl.toLowerCase().includes('.mp4') ? (
                    <video
                      src={imageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-24 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Creative Preview"
                      className="w-24 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {mediaType === 'video' ? '🎬 MP4 Video Loaded' : '🖼️ Image Loaded'}
                    </span>
                    <p className="text-xs font-bold text-white truncate">
                      {uploadedFileName || title || 'Local Ad Creative'}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setImageUrl(''); setUploadedFileName(null); setMediaType('image'); }}
                      className="text-[10px] text-rose-400 hover:underline mt-1 block"
                    >
                      Remove & Replace File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-1">
                  <ImageIcon className="w-6 h-6 text-slate-600 mx-auto" />
                  <span className="text-xs font-semibold block">No file selected</span>
                  <span className="text-[10px] text-slate-600">Image or MP4 video preview will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FIELD 2: BUDGET (BILLBOARD TOKENS) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>2. Campaign Bid (Billboard Tokens)</span>
              <span className="group relative cursor-pointer text-amber-400">
                <Info className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-950 text-slate-200 text-[10px] p-2 rounded-lg border border-slate-800 shadow-xl z-30 text-center font-normal">
                  ⚡ 1 token per 15s play (0.1¢ baseline floor)
                </span>
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                topHistoricalBids.length > 2
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {topHistoricalBids.length > 2 ? 'Rush Hour 🔥 High Demand' : 'Quiet Hour 🌙 1 Token Baseline'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-1/2">
              <span className="absolute left-4 top-3 text-amber-400 font-bold font-mono text-sm">🪙</span>
              <input
                type="number"
                min="1"
                step="1"
                value={bidAmountTokens}
                onChange={(e) => setBidAmountTokens(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-lg font-black text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Quick Token Preset Pills */}
            <div className="flex items-center gap-2 w-full sm:w-1/2 flex-wrap">
              {[1, 10, 50, 100, 500].map((tokens) => (
                <button
                  key={tokens}
                  type="button"
                  onClick={() => setBidAmountTokens(tokens.toString())}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    bidAmountTokens === tokens.toString()
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tokens} {tokens === 1 ? 'Token' : 'Tokens'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Your Wallet Balance: <strong className="text-amber-400 font-mono">{((tokensBalance ?? 0)).toLocaleString()} Tokens</strong> (≈ ${(((tokensBalance ?? 0)) * 0.001).toFixed(2)} USD). 1 Token = 15s broadcast play.
          </p>
        </div>

        {/* FEATURE 2: AUTO-RENEW CHECKBOX */}
        <div className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="auto-renew-checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-cyan-500 focus:ring-offset-slate-950 cursor-pointer"
            />
            <div className="space-y-0.5">
              <label htmlFor="auto-renew-checkbox" className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${autoRenew ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
                <span>Auto-Renew (Auto-Outbid Protection)</span>
              </label>
              <p className="text-[11px] text-slate-400 leading-normal">
                If checked, automatically places a subsequent bid (+$0.50 above competitor) using your existing wallet balance if you are outbid in <strong className="text-cyan-300">{selectedCity}</strong>.
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${
            autoRenew
              ? 'bg-cyan-950 text-cyan-400 border-cyan-800 shadow-sm'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {autoRenew ? 'ACTIVE' : 'OFF'}
          </span>
        </div>

        {/* FIELD 3: DURATION (Instant mode only) */}
        {biddingMode === 'instant' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>3. Campaign Duration</span>
              <span className="text-[11px] text-slate-400 font-normal">Broadcast Length</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[
                { seconds: 15, slots: 1, label: '15 Seconds', badge: 'Standard' },
                { seconds: 30, slots: 2, label: '30 Seconds', badge: 'High Impact' },
                { seconds: 60, slots: 4, label: '60 Seconds', badge: 'Maximum Reach' }
              ].map((option) => (
                <button
                  key={option.seconds}
                  type="button"
                  onClick={() => setDurationSeconds(option.seconds)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    durationSeconds === option.seconds
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-sm text-white">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{option.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{option.slots} Slot ({option.badge})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CAMPAIGN TITLE INPUT */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-400">
            Campaign Name (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Summer Launch Promo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* FIELD 4: SINGLE CTA SELECTION (WEBSITE OR WHATSAPP ONLY) */}
        <div className="space-y-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              {biddingMode === 'schedule' ? '3.' : '4.'} Select 1 Call-To-Action (CTA)
            </span>
            <span className="text-[10px] text-slate-400">Choose 1 action type for viewers</span>
          </div>

          {/* CTA Choice Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setCtaType('website');
                if (!ctaUrl || ctaUrl.includes('wa.me')) setCtaUrl('https://yourbrand.com/promo');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                ctaType === 'website'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Website Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCtaType('whatsapp');
                if (!ctaUrl || !ctaUrl.includes('wa.me')) setCtaUrl('https://wa.me/60123456789?text=Hi%20Brand');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                ctaType === 'whatsapp'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCtaType('none');
                setCtaUrl('');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                ctaType === 'none'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>No CTA</span>
            </button>
          </div>

          {/* CTA Link Input */}
          {ctaType !== 'none' && (
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                {ctaType === 'website' ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Website Landing Page URL</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Direct Link or Phone</span>
                  </>
                )}
              </label>
              <input
                type="text"
                placeholder={ctaType === 'website' ? 'https://yourbrand.com/promo' : 'https://wa.me/60123456789'}
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                  ctaType === 'website' ? 'border-slate-800 focus:border-cyan-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
                required
              />
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer ${
            biddingMode === 'schedule'
              ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/20'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {submitting ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin text-slate-950" />
              <span>{biddingMode === 'schedule' ? 'Scheduling Future Slot...' : 'Launching Campaign...'}</span>
            </>
          ) : (
            <>
              {biddingMode === 'schedule' ? (
                <>
                  <Calendar className="w-5 h-5 text-slate-950" />
                  <span>Lock & Schedule Future Slot</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-slate-950" />
                  <span>Launch Campaign in One Click</span>
                </>
              )}
            </>
          )}
        </button>
      </form>

      {/* VIRAL BROADCAST CELEBRATION MODAL */}
      <BroadcastCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        adTitle={celebrationAdTitle}
        targetCity={celebrationCity}
        bidAmountDollars={celebrationDollars}
        isFreeSlot={celebrationIsFree}
      />
    </div>
  );
};
