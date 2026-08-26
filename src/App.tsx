import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType, UserRole, ActiveBillboardSlot, TelemetryLog, ToastMessage } from './types';
import { Navbar } from './components/Navbar';
import { LiveBillboard } from './components/LiveBillboard';
import { StreamerBillboardView } from './components/StreamerBillboardView';
import { BiddingConsole } from './components/BiddingConsole';
import { AdLibrary } from './components/AdLibrary';
import { RegionalAnalyticsCharts } from './components/RegionalAnalyticsCharts';
import { AdminDashboard } from './components/AdminDashboard';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { PostgresSchemaViewer } from './components/PostgresSchemaViewer';
import { RedisCacheInspector } from './components/RedisCacheInspector';
import { CascadeSandbox } from './components/CascadeSandbox';
import { PayoutLedger } from './components/PayoutLedger';
import { WatcherDashboard } from './components/WatcherDashboard';
import { AiAgentsHub } from './components/AiAgentsHub';
import { ApiDocsView } from './components/ApiDocsView';
import { SystemTelemetry } from './components/SystemTelemetry';
import { GlobalCityLeaders } from './components/GlobalCityLeaders';
import { LeaderboardAndCatalog } from './components/LeaderboardAndCatalog';
import { CaptchaDropModal } from './components/CaptchaDropModal';
import { WalletModal } from './components/WalletModal';
import { UserCampaignsModal } from './components/UserCampaignsModal';
import { ToastContainer } from './components/ToastNotification';
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { StreamerObsOverlay } from './components/StreamerObsOverlay';
import { CreatorBillboardPage } from './components/CreatorBillboardPage';
import { ClaimUsernameModal } from './components/ClaimUsernameModal';
import { BlogEngine } from './components/BlogEngine';
import { BrandLogo } from './components/BrandLogo';
import { WebMcpPlayground } from './components/WebMcpPlayground';
import { Sparkles, Globe, Radio } from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  syncUserProfile,
  UserProfile
} from './lib/firebase';
import { useProofOfAttention } from './hooks/useProofOfAttention';
import { LocalProvider } from './context/LocalContext';

const CITY_NAMES: Record<string, string> = {
  GLOBAL: 'Global Network Feed',
  TYO: 'Tokyo Shibuya',
  NYC: 'Times Square NYC',
  LON: 'London City',
  PAR: 'Paris Champs-Élysées',
  KUL: 'Kuala Lumpur',
  SIN: 'Singapore Marina',
  DXB: 'Dubai Downtown',
  SEL: 'Seoul Gangnam',
  SYD: 'Sydney Harbour',
  YTO: 'Toronto Downtown',
  HKG: 'Hong Kong Central',
  LAX: 'Los Angeles Sunset',
  SHA: 'Shanghai The Bund',
  BER: 'Berlin Alexanderplatz',
  SAO: 'São Paulo Paulista',
  BKK: 'Bangkok Sukhumvit',
  AMS: 'Amsterdam Canal',
  MEX: 'Mexico City Zócalo',
  TPE: 'Taipei Ximending',
  MUM: 'Mumbai Marine Drive'
};

const TIMEZONE_TO_CITY: Record<string, { city: string; country: string }> = {
  'Asia/Kuala_Lumpur': { city: 'KUL', country: 'MY' },
  'Asia/Singapore': { city: 'SIN', country: 'SG' },
  'Asia/Tokyo': { city: 'TYO', country: 'JP' },
  'Asia/Seoul': { city: 'SEL', country: 'KR' },
  'Asia/Hong_Kong': { city: 'HKG', country: 'HK' },
  'Asia/Taipei': { city: 'TPE', country: 'TW' },
  'Asia/Bangkok': { city: 'BKK', country: 'TH' },
  'Asia/Shanghai': { city: 'SHA', country: 'CN' },
  'Asia/Kolkata': { city: 'MUM', country: 'IN' },
  'Asia/Calcutta': { city: 'MUM', country: 'IN' },
  'Asia/Dubai': { city: 'DXB', country: 'AE' },
  'Australia/Sydney': { city: 'SYD', country: 'AU' },
  'Australia/Melbourne': { city: 'SYD', country: 'AU' },
  'America/New_York': { city: 'NYC', country: 'US' },
  'America/Detroit': { city: 'NYC', country: 'US' },
  'America/Chicago': { city: 'NYC', country: 'US' },
  'America/Los_Angeles': { city: 'LAX', country: 'US' },
  'America/Toronto': { city: 'YTO', country: 'CA' },
  'America/Sao_Paulo': { city: 'SAO', country: 'BR' },
  'America/Mexico_City': { city: 'MEX', country: 'MX' },
  'Europe/London': { city: 'LON', country: 'UK' },
  'Europe/Paris': { city: 'PAR', country: 'FR' },
  'Europe/Berlin': { city: 'BER', country: 'DE' },
  'Europe/Amsterdam': { city: 'AMS', country: 'NL' }
};

function detectInitialUserCity(): { city: string; country: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_CITY[tz]) {
      return TIMEZONE_TO_CITY[tz];
    }
    if (tz?.startsWith('America/')) return { city: 'NYC', country: 'US' };
    if (tz?.startsWith('Europe/')) return { city: 'LON', country: 'UK' };
    if (tz?.startsWith('Asia/')) return { city: 'TYO', country: 'JP' };
    if (tz?.startsWith('Australia/')) return { city: 'SYD', country: 'AU' };
  } catch {
    // Default fallback
  }
  return { city: 'NYC', country: 'US' };
}

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_default';
  let id = localStorage.getItem('vb_guest_uid');
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('vb_guest_uid', id);
  }
  return id;
}

function detectCreatorHandleFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const creatorParam = search.get('creator');
  if (creatorParam) return creatorParam.replace(/^@/, '');

  const reservedPaths = [
    '',
    '/',
    '/overlay',
    '/screen',
    '/live-preview',
    '/blog',
    '/leaderboard',
    '/webmcp',
    '/api_docs',
    '/ai_agents',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
    '/favicon.svg',
    '/favicon.ico'
  ];

  if (path && !reservedPaths.includes(path.toLowerCase())) {
    const raw = path.replace(/^\/@?/, '').split('/')[0].toLowerCase();
    if (raw && !reservedPaths.includes(`/${raw}`)) {
      return raw;
    }
  }
  return null;
}

function detectInitialTabFromUrl(): TabType {
  if (typeof window === 'undefined') return 'live';
  const path = window.location.pathname.toLowerCase().replace(/^\//, '');
  if (path === 'webmcp') return 'webmcp';
  if (path === 'leaderboard') return 'leaderboard';
  if (path === 'streamer') return 'streamer';
  if (path === 'watcher') return 'watcher';
  if (path === 'ad_library') return 'ad_library';
  if (path === 'ai_agents') return 'ai_agents';
  if (path === 'api_docs') return 'api_docs';
  if (path === 'blog') return 'blog';
  if (path === 'analytics') return 'analytics';
  if (path === 'admin') return 'admin';
  return 'live';
}

export default function App() {
  // Check if current view is a dedicated Full Screen Live Billboard Preview (for Events, Projectors, Live Stream Displays)
  const isScreenOnlyMode =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/overlay') ||
      window.location.pathname.startsWith('/screen') ||
      window.location.pathname.startsWith('/live-preview') ||
      new URLSearchParams(window.location.search).get('mode') === 'screen_only' ||
      new URLSearchParams(window.location.search).get('mode') === 'event' ||
      new URLSearchParams(window.location.search).get('mode') === 'preview' ||
      new URLSearchParams(window.location.search).get('mode') === 'overlay');

  if (isScreenOnlyMode) {
    return <StreamerObsOverlay />;
  }

  const initialGeo = detectInitialUserCity();
  const [userRole, setUserRole] = useState<UserRole>('advertiser');
  const [activeTab, setActiveTab] = useState<TabType>(() => detectInitialTabFromUrl());

  // Creator Vanity Billboard Routing State (e.g. livebillboards.lol/@elonmusk)
  const [selectedCreatorHandle, setSelectedCreatorHandle] = useState<string | null>(() => detectCreatorHandleFromUrl());
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Sync tab with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const creator = detectCreatorHandleFromUrl();
      if (creator) {
        setSelectedCreatorHandle(creator);
      } else {
        setSelectedCreatorHandle(null);
        setActiveTab(detectInitialTabFromUrl());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Real Firebase User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const effectiveUid = currentUser?.uid || getOrCreateGuestId();

  const [selectedCity, setSelectedCity] = useState(initialGeo.city);
  const [selectedCountry, setSelectedCountry] = useState(initialGeo.country);

  const [isConnected, setIsConnected] = useState(false);
  const [slotData, setSlotData] = useState<ActiveBillboardSlot | null>(null);
  const [viewerPoints, setViewerPoints] = useState(120);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);

  // Auto-detect server IP geolocation fallback
  useEffect(() => {
    const fetchServerGeo = async () => {
      try {
        const res = await fetch('/api/geo');
        if (res.ok) {
          const data = await res.json();
          if (data.resolvedGeo?.cityCode && data.resolvedGeo?.countryCode && data.resolvedGeo.cityCode !== 'KUL') {
            setSelectedCity(data.resolvedGeo.cityCode);
            setSelectedCountry(data.resolvedGeo.countryCode);
          }
        }
      } catch (e) {
        console.warn('Geo detection error:', e);
      }
    };
    fetchServerGeo();
  }, []);

  // Secure Wallet State (1,000 Starter Tokens = $1.00 USD / 1 Free 15s Slot Credit)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMyAdsModalOpen, setIsMyAdsModalOpen] = useState(false);
  const [walletBalanceCents, setWalletBalanceCents] = useState<number>(0);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const tokensBalance = Math.round(walletBalanceCents * 10);

  // Firebase Auth State Listener (Honors Explicit Sign Out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        const profile = await syncUserProfile(user, 'advertiser');
        setCurrentUser(profile);
        setUserRole(profile.role);
        if (typeof profile.walletBalanceCents === 'number') {
          setWalletBalanceCents(profile.walletBalanceCents);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vb_cached_balance_cents', String(profile.walletBalanceCents));
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole('guest');
      }
    });
    return () => unsubscribe();
  }, []);

  // Verify and fulfill completed Stripe checkout sessions on return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = urlParams.get('payment_success') === 'true';
    const sessionId = urlParams.get('session_id');

    if (isPaymentSuccess && sessionId) {
      fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId: effectiveUid })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.paid) {
            if (typeof data.newWalletBalanceCents === 'number') {
              setWalletBalanceCents(data.newWalletBalanceCents);
            } else if (typeof data.newTokensBalance === 'number') {
              setWalletBalanceCents(Math.round(data.newTokensBalance / 10));
            }
            addToast(
              'success',
              '💳 Payment Successful!',
              `+$${data.amountDollars} (${(data.tokensAdded || 0).toLocaleString()} Tokens) credited to your Ad Wallet.`
            );
            fetchWallet(effectiveUid);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch((e) => console.warn('Stripe verify session error:', e));
    }
  }, [effectiveUid]);

  // Open-by-default Access Guard: Public tabs are freely accessible to everyone
  const adminOnlyTabs: TabType[] = ['admin', 'analytics', 'architecture', 'postgres', 'redis', 'cascade', 'ai_agents'];
  useEffect(() => {
    if (adminOnlyTabs.includes(activeTab) && userRole !== 'admin') {
      setActiveTab('live');
    }
  }, [userRole, activeTab]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole('guest');
      addToast('info', 'Signed Out', 'You have been signed out of your account.');
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleCityChange = (city: string, country: string) => {
    setSelectedCity(city);
    setSelectedCountry(country);
  };

  const fetchWallet = async (userId?: string) => {
    const uid = userId || effectiveUid;
    try {
      const res = await fetch(`/api/wallet/balance?userId=${uid}`);
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          const newCents = typeof data.walletBalanceCents === 'number'
            ? data.walletBalanceCents
            : (typeof data.tokensBalance === 'number' ? Math.round(data.tokensBalance / 10) : 0);
          if (typeof newCents === 'number' && !isNaN(newCents)) {
            setWalletBalanceCents(newCents);
            if (typeof window !== 'undefined') {
              localStorage.setItem('vb_cached_balance_cents', String(newCents));
            }
          }
          setWalletTransactions(data.transactions || []);
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  tokensBalance: Math.round(newCents * 10),
                  walletBalanceCents: newCents
                }
              : prev
          );
        } catch {
          // Safe fallback
        }
      }
    } catch (e) {
      console.warn('Wallet balance fetch warning:', e);
    }
  };

  useEffect(() => {
    fetchWallet(effectiveUid);
  }, [effectiveUid]);

  const handleTopUpWallet = async (amountDollars: number): Promise<boolean> => {
    const uid = effectiveUid;
    try {
      const cents = Math.round(amountDollars * 100);
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountDollars,
          amountCents: cents,
          userId: uid,
          paymentMethod: 'stripe_mock'
        })
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false }; }
      if (data.success) {
        setWalletBalanceCents(data.newWalletBalanceCents);
        await fetchWallet(uid);
        addToast('success', 'Wallet Topped Up!', `+$${amountDollars.toFixed(2)} added to your Ad Wallet.`);
        return true;
      } else {
        addToast('warning', 'Top Up Error', data.error || 'Failed to top up wallet.');
        return false;
      }
    } catch (err: any) {
      addToast('warning', 'Top Up Failed', err.message || 'Connection error.');
      return false;
    }
  };

  const handleClaimStarterCredit = async (): Promise<void> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to claim your $1.00 Free Slot!');
      return;
    }
    try {
      const res = await fetch('/api/wallet/claim-starter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': currentUser.uid
        },
        body: JSON.stringify({ userId: currentUser.uid })
      });
      const data = await res.json();
      if (data.success) {
        setWalletBalanceCents(100);
        await fetchWallet(currentUser.uid);
        addToast('success', 'Starter Credit Claimed!', '🎉 $1.00 (1,000 Tokens) added to your Ad Wallet! Place your ad now.');
      } else {
        addToast('warning', 'Claim Notice', data.error || 'Failed to claim starter credit.');
      }
    } catch (e: any) {
      addToast('error', 'Claim Error', e.message || 'Network error claiming credit.');
    }
  };

  const handlePlaceBidQuick = async (
    title: string,
    imageUrl: string,
    amountDollars: number | string,
    cityCode: string,
    countryCode: string,
    landingPageUrl?: string,
    whatsappLink?: string,
    qrCodeUrl?: string,
    mediaType: 'image' | 'video' = 'image',
    ctaType: 'website' | 'whatsapp' | 'none' = 'website',
    ctaUrl?: string
  ): Promise<{ success: boolean; message: string }> => {
    const uid = effectiveUid;
    const advertiserName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Fast Bidding Console';
    const parsedDollars = typeof amountDollars === 'string' ? parseFloat(amountDollars) || 1 : amountDollars;
    const cents = Math.max(1, Math.round(parsedDollars * 100));
    const tokens = Math.max(1, Math.round(cents * 10)); // 1 token = 0.1¢ = $0.001 USD
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch('/api/bids/submit', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': uid
        },
        body: JSON.stringify({
          title,
          imageUrl,
          landingPageUrl: landingPageUrl || (ctaType === 'website' ? ctaUrl : undefined),
          whatsappLink: whatsappLink || (ctaType === 'whatsapp' ? ctaUrl : undefined),
          qrCodeUrl,
          mediaType,
          ctaType,
          ctaUrl: ctaUrl || landingPageUrl || whatsappLink,
          bidAmountDollars: parsedDollars.toFixed(2),
          bidAmountCents: cents,
          bidAmountTokens: tokens,
          targetCityCode: cityCode,
          targetCountryCode: countryCode,
          advertiserName,
          userId: uid
        })
      });
      clearTimeout(timeoutId);
      
      const resText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch {
        data = { success: false, error: resText || `HTTP ${res.status} Error` };
      }

      await fetchWallet(uid);
      await fetchActiveSlot(cityCode, countryCode);

      if (data.success) {
        if (typeof data.newWalletBalanceCents === 'number') {
          setWalletBalanceCents(data.newWalletBalanceCents);
        }
        await fetchWallet(uid);
        await fetchActiveSlot(cityCode, countryCode);
        addToast('success', 'Bid Placed in Seconds!', `Your bid of $${parsedDollars.toFixed(2)} is active for [${cityCode}]!`);
        return { success: true, message: `Your bid of $${parsedDollars.toFixed(2)} is now live in [${cityCode}]!` };
      } else {
        if (res.status === 402 || (data.error && data.error.includes('Insufficient'))) {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            addToast('info', 'Claim $1.00 Free Credit', 'Sign in with Google or Email to claim your 1 Free 15s Slot (1,000 Tokens)!');
          } else {
            setIsWalletModalOpen(true);
          }
        }
        await fetchWallet(uid);
        return { success: false, message: data.error || 'Bid submission failed.' };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return { success: false, message: 'Upload took longer than expected. Please try again or use a smaller image/video.' };
      }
      return { success: false, message: err.message || 'Network error submitting bid.' };
    }
  };

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }].slice(-3));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const wsRef = useRef<WebSocket | null>(null);

  // Proof-of-Human Watch Timer & Fraud Prevention Hook
  const {
    activeWatchSeconds,
    riskScore,
    userStatus,
    lastHeartbeatStatus,
    activeCaptcha,
    captchaCountdown,
    captchaSubmitting,
    captchaResultMsg,
    submitCaptchaResponse,
    sendHeartbeat
  } = useProofOfAttention({
    viewerId: 'usr_viewer_01',
    heartbeatIntervalSeconds: 60,
    enabled: userRole === 'paid_watcher' && (activeTab === 'watcher' || activeTab === 'ledger'),
    onPointsEarned: (pts) => setViewerPoints((prev) => prev + pts)
  });

  // Fetch active billboard slot data from API
  const fetchActiveSlot = async (city: string, country: string) => {
    try {
      const res = await fetch(`/api/billboard/active?city=${city}&country=${country}`);
      if (res.ok) {
        const data = await res.json();
        setSlotData(data);
      }
    } catch (err) {
      console.error('Failed to fetch active slot:', err);
    }
  };

  // Bulletproof Client-Side Ticker: Guarantees 15-second rotation even if WebSocket drops or CDN proxy disconnects
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

    // Periodic HTTP sync every 15s as a fail-safe secondary guarantee
    const syncInterval = setInterval(() => {
      fetchActiveSlot(selectedCity, selectedCountry);
    }, 15000);

    return () => {
      clearInterval(ticker);
      clearInterval(syncInterval);
    };
  }, [selectedCity, selectedCountry]);

  // Setup WebSocket Connection with Auto-Reconnect
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}?city=${selectedCity}&country=${selectedCountry}`;

    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          ws?.send(JSON.stringify({
            type: 'JOIN_ROOM',
            city: selectedCity,
            country: selectedCountry
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'SLOT_TICK') {
              setSlotData((prev) => prev ? { ...prev, remainingSeconds: msg.payload.remainingSeconds } : prev);
            } else if (msg.type === 'SLOT_TRANSITION' || msg.type === 'BID_ADDED' || msg.type === 'NEW_BID_PLACED') {
              fetchActiveSlot(selectedCity, selectedCountry);

              if (msg.type === 'NEW_BID_PLACED' && msg.payload && msg.payload.bid) {
                const bid = msg.payload.bid;
                const targetCityCode = msg.payload.targetCityCode || selectedCity;
                const bidDollars = (bid.bidAmountCents / 100).toFixed(2);
                const isMyBid = currentUser?.uid && bid.userId === currentUser.uid;

                if (isMyBid) {
                  addToast(
                    'success',
                    `🎯 Your Bid is Active [${targetCityCode}]!`,
                    `Your ad "${bid.title}" ($${bidDollars}) is entered into the RTB auction for the upcoming slot.`
                  );
                }
              }
            } else if (msg.type === 'SLOT_LIVE_START' || msg.type === 'SLOT_BURN_EVENT') {
              fetchActiveSlot(selectedCity, selectedCountry);
              const isMyAd = (currentUser?.uid && msg.payload?.userId === currentUser.uid) || (msg.payload?.userId === effectiveUid);
              if (isMyAd) {
                addToast(
                  'success',
                  `🔴 Your Ad is Live on Screen Now [${msg.payload.cityCode}]!`,
                  `"${msg.payload.adTitle}" is now broadcasting live worldwide! Look at the billboard now (15s broadcast).`
                );
                fetchWallet(effectiveUid);
              }
            } else if (msg.type === 'TELEMETRY_LOG') {
              setTelemetryLogs((prev) => [msg.payload, ...prev].slice(0, 50));
            } else if (msg.type === 'INIT_STATE') {
              if (msg.payload.telemetryLogs) {
                setTelemetryLogs(msg.payload.telemetryLogs);
              }
            } else if (msg.type === 'SETTINGS_UPDATED') {
              fetchActiveSlot(selectedCity, selectedCountry);
            }
          } catch (e) {
            console.error('WS message parse error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // If WS is unavailable on cloud load balancer, backoff to avoid spam
          reconnectTimer = setTimeout(() => {
            connectWs();
          }, 30000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (_) {
        // Graceful fallback to HTTP polling
      }
    };

    connectWs();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [selectedCity, selectedCountry, currentUser?.uid]);

  // Initial fetch and city change effect
  useEffect(() => {
    fetchActiveSlot(selectedCity, selectedCountry);
  }, [selectedCity, selectedCountry]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedCreatorHandle(null);
          setActiveTab(tab);
          if (typeof window !== 'undefined') {
            const targetPath = tab === 'live' ? '/' : `/${tab}`;
            window.history.pushState({}, '', targetPath);
          }
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        isConnected={isConnected}
        selectedCity={selectedCity}
        selectedCountry={selectedCountry}
        onCityChange={handleCityChange}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenMyAdsModal={() => setIsMyAdsModalOpen(true)}
        onOpenClaimModal={() => setIsClaimModalOpen(true)}
        walletBalanceDollars={(walletBalanceCents / 100).toFixed(2)}
        tokensBalance={tokensBalance}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <LocalProvider cityCode={selectedCity} cityName={CITY_NAMES[selectedCity] || selectedCity}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6 space-y-8">
        {/* DEDICATED CREATOR & CELEBRITY LIVE BILLBOARD VIEW (e.g. /@elonmusk) */}
        {selectedCreatorHandle ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <button
                onClick={() => {
                  setSelectedCreatorHandle(null);
                  window.history.pushState({}, '', '/');
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>← Back to Global City Billboards</span>
              </button>
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claim Your @Handle</span>
              </button>
            </div>

            <CreatorBillboardPage
              creatorHandle={selectedCreatorHandle}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              addToast={(toast) => addToast(toast.type, toast.title, toast.message)}
              currentUser={currentUser}
              userRole={userRole}
              tokensBalance={tokensBalance}
              userId={effectiveUid}
            />
          </div>
        ) : (
          <>
            {/* VIEW 1: ADMIN COMMAND CENTER (100% Platform Controls) */}
            {activeTab === 'admin' && (
              <AdminDashboard
                telemetryLogs={telemetryLogs}
                addToast={addToast}
                selectedCity={selectedCity}
                selectedCountry={selectedCountry}
              />
            )}

        {/* VIEW: AUTONOMOUS AI AGENTS & DYNAMIC YIELD HUB (ADVERTISER & ADMIN ONLY) */}
        {activeTab === 'ai_agents' && (
          <AiAgentsHub
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            currentUser={currentUser}
          />
        )}

        {/* VIEW: DEVELOPER API DOCUMENTATION & SDK GUIDES (PUBLIC ACCESS FOR GUESTS & DEVELOPERS) */}
        {activeTab === 'api_docs' && (
          <ApiDocsView
            selectedCity={selectedCity}
            userRole={userRole}
            onNavigateToAgentsHub={() => setActiveTab('ai_agents')}
          />
        )}

        {/* VIEW: OFFICIAL INSIGHTS & BLOG KNOWLEDGE ENGINE */}
        {activeTab === 'blog' && (
          <BlogEngine
            onOpenClaimModal={() => setIsClaimModalOpen(true)}
            onNavigateToLiveBillboard={() => setActiveTab('live')}
            addToast={(toast) => addToast(toast.type, toast.title, toast.message)}
          />
        )}

        {/* VIEW 2: WATCHER DEDICATED EARN DASHBOARD */}
        {activeTab === 'watcher' && (
          <WatcherDashboard
            viewerPoints={viewerPoints}
            riskScore={riskScore}
            userStatus={userStatus}
            activeWatchSeconds={activeWatchSeconds}
            lastHeartbeatStatus={lastHeartbeatStatus}
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            onCityChange={handleCityChange}
            slotData={slotData}
            onTriggerHeartbeat={sendHeartbeat}
            onPointsEarned={(pts) => setViewerPoints((p) => p + pts)}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            walletBalanceDollars={(walletBalanceCents / 100).toFixed(2)}
          />
        )}

        {/* VIEW 2: UNIFIED LEADERBOARD & ACTIVE AD CATALOG */}
        {(activeTab === 'leaderboard' || activeTab === 'ad_library') && (
          <LeaderboardAndCatalog
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            onCityChange={handleCityChange}
            userRole={userRole}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            walletBalanceDollars={(walletBalanceCents / 100).toFixed(2)}
            onPlaceBidQuick={handlePlaceBidQuick}
          />
        )}

        {/* VIEW 2.5: OFFICIAL OPENAI WEBMCP AGENT PLAYGROUND */}
        {activeTab === 'webmcp' && <WebMcpPlayground />}

        {/* VIEW 3: CLEAN HOMEPAGE LIVE BILLBOARD */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Live Global Network Pulse Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4 text-xs font-mono shadow-lg flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Live Network Pulse:
                </span>
                <span className="text-cyan-300 font-bold">200+ Global City Feeds Active</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400 text-[11px] flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-amber-400">⚡</span> 15s Guaranteed Rotations
                </span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-cyan-400">🛡️</span> Autonomous AI Safety Filter
                </span>
                <span className="hidden md:inline text-slate-700">•</span>
                <span className="text-emerald-400 font-bold">99.99% Network Uptime</span>
              </div>
            </div>

            <LiveBillboard
              slotData={slotData}
              selectedCity={selectedCity}
              selectedCountry={selectedCountry}
              onCityChange={handleCityChange}
              viewerPoints={viewerPoints}
              userRole={userRole}
              isPureViewerMode={userRole === 'viewer'}
              walletBalanceDollars={(walletBalanceCents / 100).toFixed(2)}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              onOpenMyAdsModal={() => setIsMyAdsModalOpen(true)}
              onOpenClaimModal={() => setIsClaimModalOpen(true)}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onPlaceBidQuick={handlePlaceBidQuick}
            />
          </div>
        )}

        {/* VIEW 4: STREAMER HUB & 2ND MONITOR OVERLAY */}
        {activeTab === 'streamer' && (
          <StreamerBillboardView
            slotData={slotData}
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            onCityChange={handleCityChange}
            viewerPoints={viewerPoints}
            onBidSubmitted={() => fetchActiveSlot(selectedCity, selectedCountry)}
          />
        )}

        {/* VIEW 5: REGIONAL TELEMETRY & RECHARTS */}
        {activeTab === 'analytics' && (
          <RegionalAnalyticsCharts
            selectedCity={selectedCity}
            telemetryLogs={telemetryLogs}
          />
        )}

        {/* TECH DASHBOARDS */}
        {activeTab === 'architecture' && <ArchitectureDiagram />}
        {activeTab === 'postgres' && <PostgresSchemaViewer />}
        {activeTab === 'redis' && <RedisCacheInspector selectedCity={selectedCity} selectedCountry={selectedCountry} />}
        {activeTab === 'cascade' && <CascadeSandbox selectedCity={selectedCity} selectedCountry={selectedCountry} />}

        {activeTab === 'ledger' && (
          <PayoutLedger
            viewerPoints={viewerPoints}
            riskScore={riskScore}
            userStatus={userStatus}
            activeWatchSeconds={activeWatchSeconds}
            lastHeartbeatStatus={lastHeartbeatStatus}
            onPointsEarned={(pts) => setViewerPoints((p) => p + pts)}
            onTriggerHeartbeat={sendHeartbeat}
          />
        )}

        {/* Global Interactive Captcha Drop Modal (Random Attention Check - ONLY for Watchers) */}
        {activeCaptcha && userRole === 'paid_watcher' && (activeTab === 'watcher' || activeTab === 'ledger') && (
          <CaptchaDropModal
            captcha={activeCaptcha}
            countdownSeconds={captchaCountdown}
            isSubmitting={captchaSubmitting}
            resultMessage={captchaResultMsg}
            onSelectOption={submitCaptchaResponse}
          />
        )}

        {/* Secure Wallet System Modal */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          tokensBalance={tokensBalance}
          balanceDollars={(walletBalanceCents / 100).toFixed(2)}
          transactions={walletTransactions}
          userId={effectiveUid}
          onTopUp={handleTopUpWallet}
          onClaimStarter={handleClaimStarterCredit}
        />

        {/* My Placed Ads & Broadcast History Modal */}
        <UserCampaignsModal
          isOpen={isMyAdsModalOpen}
          onClose={() => setIsMyAdsModalOpen(false)}
          userId={effectiveUid}
          userRole={userRole}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSelectCity={(city) => {
            handleCityChange(city, 'ALL');
            setActiveTab('live');
          }}
        />

        {/* Real Firebase Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(profile) => {
            setCurrentUser(profile);
            setUserRole(profile.role);
            if (typeof profile.walletBalanceCents === 'number') {
              setWalletBalanceCents(profile.walletBalanceCents);
            }
            addToast('success', 'Authenticated Successfully', `Welcome back, ${profile.displayName || profile.email}! Role: ${profile.role}`);
          }}
        />

        {/* Dedicated My Account Hub Modal */}
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          currentUser={currentUser}
          walletBalanceDollars={(walletBalanceCents / 100).toFixed(2)}
          tokensBalance={tokensBalance}
          transactions={walletTransactions}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onOpenMyAdsModal={() => setIsMyAdsModalOpen(true)}
          onOpenClaimModal={() => setIsClaimModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Trending Creator Billboards Carousel & Social Discovery (Desktop/Tablet only) */}
        <div className="hidden sm:block bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-base font-black text-white">
                  Trending Creator & Event Billboards
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Now anyone can have a billboard. Bid live on top creator handles, streams & event screens.
              </p>
            </div>

            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Claim Your @Handle</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { handle: 'elonmusk', name: 'Elon Musk', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200', tag: '$14.8K Bids' },
              { handle: 'mrbeast', name: 'MrBeast', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', tag: '$42.3K Bids' },
              { handle: 'kaicenat', name: 'Kai Cenat', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', tag: '$28.4K Bids' },
              { handle: 'raveparty', name: 'Rave DJ Stage', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200', tag: 'Live Event' },
              { handle: 'ethdenver', name: 'ETHDenver Stage', avatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200', tag: 'Web3 Screen' },
              { handle: 'naval', name: 'Naval', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', tag: '$9.2K Bids' }
            ].map((c) => (
              <button
                key={c.handle}
                onClick={() => {
                  setSelectedCreatorHandle(c.handle);
                  window.history.pushState({}, '', `/@${c.handle}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3 bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-left transition-all group cursor-pointer shadow-md flex flex-col items-center text-center space-y-2"
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="font-black text-white text-xs truncate max-w-[100px]">{c.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">@{c.handle}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-900 border border-slate-700 text-amber-300 text-[9px] font-mono font-bold rounded-full">
                    {c.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Log Footer Bar */}
        {(activeTab === 'admin' || activeTab === 'architecture') && (
          <SystemTelemetry logs={telemetryLogs} />
        )}
          </>
        )}
      </main>
      </LocalProvider>

      {/* Claim Your Live Billboard Username Modal */}
      <ClaimUsernameModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSelectCreator={(handle) => {
          setSelectedCreatorHandle(handle);
          window.history.pushState({}, '', `/@${handle}`);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        addToast={(toast) => addToast(toast.type, toast.title, toast.message)}
      />

      {/* Toast Notification Overlay */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <footer className="hidden sm:block border-t border-slate-900 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 font-sans mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Infinite Mission */}
          <div className="space-y-3 md:col-span-1">
            <BrandLogo
              size="md"
              showText={true}
              showSubtitle={false}
              onClick={() => { setSelectedCreatorHandle(null); setActiveTab('live'); }}
            />
            <p className="text-slate-400 text-xs leading-relaxed">
              World's First Infinite 24/7 Virtual Billboard Network. Broadcasting across 200+ countries, creator live streams, and space feeds with sub-second RTB auctions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Network Active • 200+ Countries • Sub-20ms RTB</span>
            </div>
          </div>

          {/* Col 2: Fast Navigation & Views */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">Screen Network</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('live'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>📺 Live Billboard Stream</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('leaderboard'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>🏆 Leaderboard & Ad Catalog</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('streamer'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>🎥 Streamer Overlay Hub</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('watcher'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>✨ Watcher Earn Hub</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Creators & Developers */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">Creators & AI Agents</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>✨ Claim @Handle (80% Payout)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('blog'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  📰 Insights & Guides Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('api_docs'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  📖 Programmatic REST API
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedCreatorHandle(null); setActiveTab('ai_agents'); }}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  🤖 Autonomous AI Agents Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Security */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">Support & Help</h4>
            <p className="text-slate-400 text-xs">
              Need custom billboard campaigns or enterprise multi-screen takeover?
            </p>
            <p>
              <a
                href="mailto:support@livebillboards.lol"
                className="text-cyan-400 hover:text-cyan-300 underline font-mono text-xs"
              >
                support@livebillboards.lol
              </a>
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              © {new Date().getFullYear()} Virtual BillBoard. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
