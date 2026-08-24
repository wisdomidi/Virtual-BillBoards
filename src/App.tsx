import React, { useState, useEffect, useRef } from 'react';
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
import { CaptchaDropModal } from './components/CaptchaDropModal';
import { WalletModal } from './components/WalletModal';
import { ToastContainer } from './components/ToastNotification';
import { AuthModal } from './components/AuthModal';
import {
  auth,
  onAuthStateChanged,
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

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('advertiser');
  const [activeTab, setActiveTab] = useState<TabType>('live');

  // Real Firebase User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState('TYO');
  const [selectedCountry, setSelectedCountry] = useState('JP');

  const [isConnected, setIsConnected] = useState(false);
  const [slotData, setSlotData] = useState<ActiveBillboardSlot | null>(null);
  const [viewerPoints, setViewerPoints] = useState(120);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);

  // Secure Wallet State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalanceCents, setWalletBalanceCents] = useState(25000); // $250.00 initial
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const tokensBalance = currentUser?.tokensBalance ?? Math.round(walletBalanceCents * 10);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await syncUserProfile(user, 'advertiser');
        setCurrentUser(profile);
        setUserRole(profile.role);
        setWalletBalanceCents(profile.walletBalanceCents || 25000);
      } else {
        setCurrentUser(null);
        setUserRole('guest');
      }
    });
    return () => unsubscribe();
  }, []);

  // Role-based Tab Access Guard
  useEffect(() => {
    const rolePermissions: Record<UserRole, TabType[]> = {
      guest: ['live', 'api_docs'],
      viewer: ['live', 'api_docs'],
      paid_watcher: ['live', 'watcher', 'ledger', 'api_docs'],
      advertiser: ['live', 'ad_library', 'ai_agents', 'api_docs'],
      streamer: ['live', 'streamer', 'ledger', 'api_docs'],
      admin: ['admin', 'ai_agents', 'api_docs', 'watcher', 'live', 'ad_library', 'analytics', 'streamer', 'ledger', 'architecture', 'postgres', 'redis', 'cascade']
    };

    const allowed = rolePermissions[userRole] || ['live', 'api_docs'];
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0] || 'live');
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

  const fetchWallet = async (uid?: string) => {
    const targetUid = uid || currentUser?.uid || 'default_user';
    try {
      const res = await fetch('/api/wallet', {
        headers: {
          'x-user-uid': targetUid
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalanceCents(data.balanceCents);
        setWalletTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      fetchWallet(currentUser.uid);
    } else {
      fetchWallet('default_user');
    }
  }, [currentUser]);

  useEffect(() => {
    fetchWallet();

    // Auto-detect user's default city and country based on IP
    const detectUserIpGeo = async () => {
      try {
        const res = await fetch('/api/geo');
        if (res.ok) {
          const data = await res.json();
          if (data.resolvedGeo?.cityCode && data.resolvedGeo?.countryCode) {
            setSelectedCity(data.resolvedGeo.cityCode);
            setSelectedCountry(data.resolvedGeo.countryCode);
          }
        }
      } catch (err) {
        console.warn('IP Geolocation auto-detection failed:', err);
      }
    };
    detectUserIpGeo();
  }, []);

  const handleTopUpWallet = async (amountDollars: number): Promise<boolean> => {
    const uid = currentUser?.uid || 'default_user';
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': uid
        },
        body: JSON.stringify({ amountDollars, userId: uid })
      });
      const data = await res.json();
      if (data.success) {
        setWalletBalanceCents(data.balanceCents);
        setWalletTransactions(data.transactions || []);
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

  const handlePlaceBidQuick = async (
    title: string,
    imageUrl: string,
    amountDollars: number,
    cityCode: string,
    countryCode: string,
    landingPageUrl?: string,
    whatsappLink?: string,
    qrCodeUrl?: string
  ): Promise<{ success: boolean; message: string }> => {
    const uid = currentUser?.uid || 'default_user';
    const advertiserName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Fast Bidding Console';
    try {
      const cents = Math.round(amountDollars * 100);
      const res = await fetch('/api/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': uid
        },
        body: JSON.stringify({
          title,
          imageUrl,
          landingPageUrl,
          whatsappLink,
          qrCodeUrl,
          bidAmountCents: cents,
          targetCityCode: cityCode,
          targetCountryCode: countryCode,
          advertiserName,
          userId: uid
        })
      });
      const data = await res.json();
      await fetchWallet(uid);
      await fetchActiveSlot(cityCode, countryCode);

      if (data.success) {
        addToast('success', 'Bid Placed in Seconds!', `Your bid of $${amountDollars.toFixed(2)} is active for [${cityCode}]!`);
        return { success: true, message: `Your bid of $${amountDollars.toFixed(2)} is now live in [${cityCode}]!` };
      } else {
        if (res.status === 402) {
          setIsWalletModalOpen(true);
        }
        return { success: false, message: data.error || 'Bid submission failed.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error submitting bid.' };
    }
  };

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }].slice(-5));
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  // Setup WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}?city=${selectedCity}&country=${selectedCountry}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Join geographic room corresponding to selected city/country
      ws.send(JSON.stringify({
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
            } else {
              addToast(
                'outbid',
                `⚡ Real-Time Bid in [${targetCityCode}]`,
                `"${bid.advertiserName || 'Advertiser'}" placed a bid of $${bidDollars} for '${bid.title}'.`
              );
            }
          }
        } else if (msg.type === 'SLOT_BURN_EVENT') {
          fetchActiveSlot(selectedCity, selectedCountry);
          if (currentUser?.uid && msg.payload?.userId === currentUser.uid) {
            setWalletBalanceCents(msg.payload.newWalletBalanceCents);
            addToast(
              'success',
              `🔥 Ad Live on Billboard [${msg.payload.cityCode}]!`,
              `"${msg.payload.adTitle}" played for 15s on the digital screen. $${msg.payload.burnedDollars} burned. Remaining balance: $${msg.payload.newWalletBalanceDollars}.`
            );
            fetchWallet(currentUser.uid);
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
        console.error(e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [selectedCity, selectedCountry]);

  // Initial fetch and city change effect
  useEffect(() => {
    fetchActiveSlot(selectedCity, selectedCountry);
  }, [selectedCity, selectedCountry]);

  // Fallback poll timer every 2 seconds if WS isn't active
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveSlot(selectedCity, selectedCountry);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedCity, selectedCountry]);

  const handleCityChange = (city: string, country: string) => {
    setSelectedCity(city);
    setSelectedCountry(country);
    fetchActiveSlot(city, country);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        isConnected={isConnected}
        selectedCity={selectedCity}
        selectedCountry={selectedCountry}
        onCityChange={handleCityChange}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        walletBalanceDollars={(walletBalanceCents / 100).toFixed(2)}
        tokensBalance={tokensBalance}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <LocalProvider cityCode={selectedCity} cityName={CITY_NAMES[selectedCity] || selectedCity}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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

        {/* VIEW 3: LIVE BILLBOARD (Role-Aware UI) */}
        {activeTab === 'live' && (
          <div className="space-y-8">
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
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onPlaceBidQuick={handlePlaceBidQuick}
            />

            {/* Show Bidding Console ONLY for Advertisers or Admin */}
            {(userRole === 'advertiser' || userRole === 'admin') && (
              <div className="space-y-8">
                <BiddingConsole
                  selectedCity={selectedCity}
                  selectedCountry={selectedCountry}
                  currentUser={currentUser}
                  onBidSubmitted={() => {
                    fetchActiveSlot(selectedCity, selectedCountry);
                    fetchWallet(currentUser?.uid);
                  }}
                  addToast={(toast) => addToast(toast.type, toast.title, toast.message)}
                />

                {/* Global City Leaders Board */}
                <div className="max-w-3xl mx-auto">
                  <GlobalCityLeaders
                    currentSelectedCity={selectedCity}
                    onSelectCity={handleCityChange}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: STREAMER 2ND MONITOR */}
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

        {/* VIEW 4: ADVERTISER WINNING AD LIBRARY */}
        {activeTab === 'ad_library' && (
          <AdLibrary
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            onBidSubmitted={() => fetchActiveSlot(selectedCity, selectedCountry)}
            addToast={(toast) => addToast(toast.type, toast.title, toast.message)}
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
          balanceDollars={(walletBalanceCents / 100).toFixed(2)}
          transactions={walletTransactions}
          onTopUp={handleTopUpWallet}
        />

        {/* Real Firebase Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(profile) => {
            setCurrentUser(profile);
            setUserRole(profile.role);
            setWalletBalanceCents(profile.walletBalanceCents || 25000);
            addToast('success', 'Authenticated Successfully', `Welcome back, ${profile.displayName || profile.email}! Role: ${profile.role}`);
          }}
        />

        {/* Telemetry Log Footer Bar (REMOVED from public pages, ONLY shown in admin/architecture) */}
        {(activeTab === 'admin' || activeTab === 'architecture') && (
          <SystemTelemetry logs={telemetryLogs} />
        )}
      </main>
      </LocalProvider>

      {/* Toast Notification Overlay */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-sans">
        <p>Virtual BillBoard • World First 24/7 Virtual Billboard</p>
      </footer>
    </div>
  );
}
