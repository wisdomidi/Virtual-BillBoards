import React, { useState, useEffect } from 'react';
import { PlatformSettings, CityConfig, TelemetryLog, ToastMessage } from '../types';
import {
  ShieldCheck,
  Settings,
  Sliders,
  Play,
  Trash2,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Crown,
  DollarSign,
  Globe,
  Building2,
  Users,
  Lock,
  Eye,
  Radio,
  Sparkles,
  Server,
  Layers,
  Database,
  GitBranch,
  Flame,
  Send,
  Bell,
  Gift,
  Ticket,
  Copy,
  Check,
  CreditCard,
  X,
  ExternalLink
} from 'lucide-react';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { PostgresSchemaViewer } from './PostgresSchemaViewer';
import { RedisCacheInspector } from './RedisCacheInspector';
import { CascadeSandbox } from './CascadeSandbox';
import { PayoutLedger } from './PayoutLedger';

interface AdminDashboardProps {
  telemetryLogs: TelemetryLog[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  selectedCity: string;
  selectedCountry: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  telemetryLogs,
  addToast,
  selectedCity,
  selectedCountry
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'settings' | 'moderation' | 'users' | 'vouchers' | 'creators' | 'overrides' | 'cities' | 'tech_tools'>('settings');
  const [techTool, setTechTool] = useState<'architecture' | 'postgres' | 'redis' | 'cascade' | 'ledger'>('architecture');
  const [creatorFilter, setCreatorFilter] = useState('');

  // User & Wallet Oversight State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<string | null>(null);
  const [adjustTokensAmount, setAdjustTokensAmount] = useState<number>(1000);

  // Social Vouchers & Promo Engine State
  const [vouchersList, setVouchersList] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherTokens, setNewVoucherTokens] = useState(3000);
  const [newVoucherMaxClaims, setNewVoucherMaxClaims] = useState(250);
  const [newVoucherDesc, setNewVoucherDesc] = useState('');
  const [creatingVoucher, setCreatingVoucher] = useState(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);

  // Creator & Venue Payout Requests State
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // All Ads & Moderation Queue State
  const [allAdminAds, setAllAdminAds] = useState<any[]>([]);
  const [loadingAllAds, setLoadingAllAds] = useState(false);
  const [moderationSubTab, setModerationSubTab] = useState<'approved' | 'queued' | 'flagged' | 'all'>('approved');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'verified' | 'admin' | 'streamer' | 'guest'>('all');
  const [flaggedAds, setFlaggedAds] = useState<any[]>([]);
  const [loadingFlaggedAds, setLoadingFlaggedAds] = useState(false);

  // Platform Settings State
  const [settings, setSettings] = useState<PlatformSettings>({
    slotDurationSeconds: 15,
    cityReserveFloorCents: 1000,
    countryReserveFloorCents: 500,
    globalReserveFloorCents: 100,
    geminiSafetyThreshold: 70,
    streamerRevSharePercent: 70,
    creatorRevSharePercent: 80,
    venueRevSharePercent: 70,
    maintenanceMode: false,
    emergencyAlertBanner: '',
    houseAdTitle: 'Public Service: Plant 10,000 Trees in Southeast Asia',
    houseAdImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    activeEnvironment: 'night_city'
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Emergency Ad Injector Form State
  const [injectTitle, setInjectTitle] = useState('SPECIAL ANNOUNCEMENT: Cyberpunk Esports World Cup');
  const [injectImg, setInjectImg] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
  const [injectAdvertiser, setInjectAdvertiser] = useState('AEGIS ADMIN GLOBAL');
  const [injectBidDollars, setInjectBidDollars] = useState('150.00');
  const [injectCity, setInjectCity] = useState(selectedCity || 'KUL');
  const [injecting, setInjecting] = useState(false);

  // Automated 10 Ad/City Seeding State
  const [populatingCampaigns, setPopulatingCampaigns] = useState(false);
  const [populateReport, setPopulateReport] = useState<any>(null);

  const handlePopulateCityCampaigns = async () => {
    setPopulatingCampaigns(true);
    setPopulateReport(null);
    try {
      const res = await fetch('/api/admin/populate-city-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityCode: 'ALL' })
      });
      if (res.ok) {
        const data = await res.json();
        setPopulateReport(data);
        addToast('success', '10 Campaigns Populated Per City!', `Populated 10 industry ads for ${data.totalCities} city billboards.`);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Seeding Failed', err.message);
    } finally {
      setPopulatingCampaigns(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchCities = async () => {
    setLoadingCities(true);
    try {
      const res = await fetch('/api/cities');
      if (res.ok) {
        const data = await res.json();
        if (data.cities) setCities(data.cities);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchFlaggedAds = async () => {
    setLoadingFlaggedAds(true);
    try {
      const res = await fetch('/api/admin/flagged-ads');
      if (res.ok) {
        const data = await res.json();
        if (data.flaggedAds) setFlaggedAds(data.flaggedAds);
      }
    } catch (err) {
      console.error('Failed to fetch flagged ads:', err);
    } finally {
      setLoadingFlaggedAds(false);
    }
  };

  const fetchAllAdminAds = async () => {
    setLoadingAllAds(true);
    try {
      const res = await fetch('/api/admin/ads/all');
      if (res.ok) {
        const data = await res.json();
        if (data.ads) setAllAdminAds(data.ads);
      }
    } catch (err) {
      console.warn('Failed to fetch all admin ads:', err);
    } finally {
      setLoadingAllAds(false);
    }
  };

  const handleRejectLiveAd = async (adId: string) => {
    try {
      const res = await fetch('/api/admin/ads/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, reason: 'Admin safety removal' })
      });
      const data = await res.json();
      if (data.success) {
        addToast('info', 'Ad Removed', data.message || 'Ad rejected from rotation.');
        fetchAllAdminAds();
        fetchFlaggedAds();
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    }
  };

  const handleOverrideFlaggedAd = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/flagged-ads/${id}/override`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Ad Overridden & Approved', data.message || 'Ad injected into live broadcast queue.');
        fetchFlaggedAds();
      } else {
        addToast('error', 'Override Failed', data.error || 'Could not override ad.');
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    }
  };

  const handleDismissFlaggedAd = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/flagged-ads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('info', 'Ad Dismissed', 'Flagged ad permanently dismissed.');
        fetchFlaggedAds();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsersList(data.users);
      }
    } catch (e) {
      console.warn('Failed to load admin users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAdjustBalance = async (targetUserId: string, addTokens: number, newRole?: string) => {
    try {
      const res = await fetch('/api/admin/user/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, addTokens, newRole, reason: 'Admin manual adjustment' })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Balance Updated', `User ${targetUserId.slice(-6)} updated: ${data.newTokensBalance.toLocaleString()} tokens`);
        fetchUsers();
        setAdjustingUser(null);
      }
    } catch (e: any) {
      addToast('error', 'Update Failed', e.message);
    }
  };

  const fetchVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const res = await fetch('/api/admin/vouchers');
      if (res.ok) {
        const data = await res.json();
        if (data.vouchers) setVouchersList(data.vouchers);
      }
    } catch (e) {
      console.warn('Failed to load vouchers:', e);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim()) return;

    setCreatingVoucher(true);
    try {
      const res = await fetch('/api/admin/vouchers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newVoucherCode.trim().toUpperCase(),
          tokens: Number(newVoucherTokens),
          maxClaims: Number(newVoucherMaxClaims),
          description: newVoucherDesc || `Promo Voucher ${newVoucherCode.toUpperCase()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Promo Voucher Created!', `Code [${data.voucher.code}] for ${data.voucher.tokens.toLocaleString()} tokens ($${data.voucher.dollars.toFixed(2)}) is live.`);
        setNewVoucherCode('');
        setNewVoucherDesc('');
        fetchVouchers();
      } else {
        addToast('error', 'Creation Failed', data.error || 'Could not create voucher.');
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setCreatingVoucher(false);
    }
  };

  const handleToggleVoucher = async (code: string) => {
    try {
      const res = await fetch('/api/admin/vouchers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        addToast('info', 'Voucher Status Changed', `Promo code ${code} is now ${data.active ? 'ACTIVE' : 'PAUSED'}.`);
        fetchVouchers();
      }
    } catch (err: any) {
      addToast('error', 'Toggle Error', err.message);
    }
  };

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const res = await fetch('/api/admin/payouts');
      if (res.ok) {
        const data = await res.json();
        if (data.payouts) setPayoutsList(data.payouts);
      }
    } catch (e) {
      console.warn('Failed to load payouts:', e);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleUpdatePayoutStatus = async (payoutId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Payout Status Updated', `Payout ${payoutId} marked as ${status.toUpperCase()}.`);
        fetchPayouts();
      }
    } catch (err: any) {
      addToast('error', 'Payout Update Error', err.message);
    }
  };

  const handleCopyShareablePromoLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.livebillboards.lol';
    const link = `${origin}/?promo=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedVoucherCode(code);
    addToast('success', 'Promo Link Copied!', `Copied ${link} to clipboard ready to tweet / share!`);
    setTimeout(() => setCopiedVoucherCode(null), 2500);
  };

  useEffect(() => {
    fetchSettings();
    fetchCities();
    fetchFlaggedAds();
    fetchAllAdminAds();
    fetchUsers();
    fetchVouchers();
    fetchPayouts();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        addToast('success', 'Admin Settings Saved', 'Platform configuration updated dynamically and broadcasted to connected clients.');
      } else {
        addToast('warning', 'Save Error', 'Failed to save settings.');
      }
    } catch (err) {
      addToast('warning', 'Network Error', 'Could not communicate with admin endpoint.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleForceEjectSlot = async () => {
    try {
      const res = await fetch('/api/admin/override-slot', { method: 'POST' });
      if (res.ok) {
        addToast('info', 'Active Slot Force Ejected', 'Auction loop ticker reset. Next slot rotation initiated immediately.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearQueue = async (cityCode: string) => {
    try {
      const res = await fetch('/api/admin/clear-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityCode })
      });
      if (res.ok) {
        addToast('warning', `Queue Cleared (${cityCode})`, `Redis ZSET auction queue for ${cityCode} has been purged.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCity = async (cityCode: string) => {
    try {
      const res = await fetch('/api/cities/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityCode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cities) setCities(data.cities);
        addToast('info', 'City Geofence Updated', `Active status toggled for ${cityCode}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setInjecting(true);
    try {
      const res = await fetch('/api/admin/inject-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: injectTitle,
          imageUrl: injectImg,
          advertiserName: injectAdvertiser,
          bidAmountDollars: injectBidDollars,
          targetCityCode: injectCity,
          targetCountryCode: 'MY'
        })
      });
      if (res.ok) {
        addToast('success', 'Emergency Ad Injected', `Ad "${injectTitle}" directly placed at top of ${injectCity} queue and activated.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Admin Command Center Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg shadow-cyan-500/30">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Platform Owner Command Center</h1>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Complete 100% management, dynamic settings overrides, geofence control & system inspection.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleForceEjectSlot}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Force Eject Active Slot</span>
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{savingSettings ? 'Saving...' : 'Save & Broadcast Config'}</span>
            </button>
          </div>
        </div>

        {/* Admin Sub-Tabs — Responsive Multi-Row Pill Grid with Zero Clipping */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4 mt-6">
          {[
            { id: 'settings', label: '⚙️ Platform Settings & Safety', icon: Settings },
            { id: 'users', label: `👥 Users & Wallets (${usersList.length})`, icon: Users },
            { id: 'vouchers', label: `🎟️ Social Vouchers (${vouchersList.length}) & Payouts (${payoutsList.length})`, icon: Gift },
            { id: 'moderation', label: `🛡️ Moderation & Flagged Ads (${flaggedAds.length})`, icon: ShieldCheck },
            { id: 'creators', label: '👑 Creator Handles & Verification', icon: Crown },
            { id: 'overrides', label: '⚡ Emergency Ad Injector & Ejector', icon: Zap },
            { id: 'cities', label: '🌍 Geofenced Billboard Cities', icon: Globe },
            { id: 'tech_tools', label: '🛠️ Developer & Architecture Tools', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/20 font-extrabold scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB: FLAGGED & APPROVED ADS MODERATION QUEUE */}
      {activeAdminSubTab === 'moderation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/40">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  Ad Creative Moderation & Live Inspection
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect live broadcast slots, queued submissions, and flagged campaigns. Admins have 100% force-reject and override authority.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchFlaggedAds(); fetchAllAdminAds(); }}
                disabled={loadingFlaggedAds || loadingAllAds}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${(loadingFlaggedAds || loadingAllAds) ? 'animate-spin' : ''}`} />
                <span>Refresh Ads</span>
              </button>
            </div>
          </div>

          {/* Sub-Filter Tabs: Approved vs Queued vs Flagged vs All */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold font-mono">
            {[
              { id: 'approved', label: `🟢 Approved Live Broadcasts (${allAdminAds.filter(a => a.status === 'live').length})` },
              { id: 'queued', label: `⏳ In-Queue Creatives (${allAdminAds.filter(a => a.status === 'queued').length})` },
              { id: 'flagged', label: `🔴 Flagged / Rejected Queue (${flaggedAds.length})` },
              { id: 'all', label: `📋 All Creatives (${allAdminAds.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setModerationSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  moderationSubTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {(() => {
            const displayedAds = moderationSubTab === 'flagged'
              ? flaggedAds
              : moderationSubTab === 'approved'
              ? allAdminAds.filter(a => a.status === 'live')
              : moderationSubTab === 'queued'
              ? allAdminAds.filter(a => a.status === 'queued')
              : allAdminAds;

            if (displayedAds.length === 0) {
              return (
                <div className="py-12 text-center space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400/80 mx-auto" />
                  <div className="text-sm font-bold text-white uppercase">
                    {moderationSubTab === 'flagged' ? 'Flagged Queue is Clean!' : 'No Ads in this Category'}
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {moderationSubTab === 'flagged'
                      ? 'All incoming creative has passed Gemini Vision AI brand safety filters.'
                      : 'No campaigns currently matching this filter status.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedAds.map((ad) => {
                  const isFlagged = ad.status === 'flagged' || Boolean(ad.reason);
                  const isLive = ad.status === 'live';

                  return (
                    <div
                      key={ad.id}
                      className={`bg-slate-950 border rounded-2xl p-4 space-y-3 shadow-lg flex flex-col justify-between transition-all ${
                        isFlagged
                          ? 'border-rose-500/40 hover:border-rose-500'
                          : isLive
                          ? 'border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                          : 'border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className="px-2 py-0.5 bg-slate-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold rounded-md uppercase">
                              📍 {ad.targetCityCode || 'GLOBAL'}
                            </span>
                            {isLive && (
                              <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 text-[10px] font-mono font-bold rounded-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE ON SCREEN
                              </span>
                            )}
                          </div>
                          {isFlagged && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-600 text-[10px] font-mono font-bold rounded-md">
                              Safety: {ad.safetyScore || 45}/100
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-white line-clamp-1">{ad.title}</h4>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                            <span>Advertiser: <strong className="text-slate-200">{ad.advertiserName || 'Anonymous'}</strong></span>
                            <span className="font-mono text-amber-400 font-bold">${ad.bidAmountDollars} USD</span>
                          </div>
                          {ad.impressions > 0 && (
                            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                              ⚡ {ad.impressions.toLocaleString()} Impressions Delivered
                            </div>
                          )}
                        </div>

                        {isFlagged && ad.reason && (
                          <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] font-mono text-rose-300">
                            <strong>Flag Reason: </strong>{ad.reason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        {isFlagged ? (
                          <>
                            <button
                              onClick={() => handleOverrideFlaggedAd(ad.id)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Reinstate</span>
                            </button>
                            <button
                              onClick={() => handleDismissFlaggedAd(ad.id)}
                              className="p-2 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 rounded-xl transition-all cursor-pointer"
                              title="Permanently Dismiss"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRejectLiveAd(ad.id)}
                              className="flex-1 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Force Reject & Ban</span>
                            </button>
                            <button
                              onClick={() => window.open(`/?city=${ad.targetCityCode || 'GLOBAL'}`, '_blank')}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl transition-all cursor-pointer"
                              title="Watch on Live Screen"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* SUB-TAB: REGISTERED USERS & WALLET OVERSIGHT */}
      {activeAdminSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/40">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  Registered Users & Wallet Oversight
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect real verified accounts, manage platform roles, audit token balances, and issue direct credit grants.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search email, UID or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
              />
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Top 4 User Directory Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Total Accounts</span>
              <span className="text-lg font-black text-white font-mono">{usersList.length}</span>
              <span className="text-[10px] text-slate-500 block">Directory Total</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-blue-500/30 space-y-1">
              <span className="text-[10px] font-mono text-blue-400 uppercase block font-bold">Verified Real Users</span>
              <span className="text-lg font-black text-blue-300 font-mono">
                {usersList.filter(u => u.isVerified).length}
              </span>
              <span className="text-[10px] text-blue-400/70 block">Google / Email Logins</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase block font-bold">Tokens in Circulation</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {usersList.reduce((sum, u) => sum + (u.tokensBalance || 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/70 block">Ad Tokens Loaded</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">Total USD Value</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ${(usersList.reduce((sum, u) => sum + (u.walletBalanceCents || 0), 0) / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400/70 block">Available Ad Balance</span>
            </div>
          </div>

          {/* Role Filter Buttons */}
          <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
            {[
              { id: 'all', label: `All Accounts (${usersList.length})` },
              { id: 'verified', label: `🛡️ Verified Users (${usersList.filter(u => u.isVerified).length})` },
              { id: 'admin', label: `👑 Admins (${usersList.filter(u => u.role === 'admin').length})` },
              { id: 'streamer', label: `🎮 Streamers (${usersList.filter(u => u.role === 'creator' || u.role === 'streamer').length})` },
              { id: 'guest', label: `🌐 Guests (${usersList.filter(u => u.isGuest).length})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setUserFilterRole(f.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  userFilterRole === f.id
                    ? 'bg-blue-600 text-white font-black shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
              Loading registered user directory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="pb-3 px-3">User & Email</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3">Ad Tokens</th>
                    <th className="pb-3 px-3">Balance ($)</th>
                    <th className="pb-3 px-3">Bids Placed</th>
                    <th className="pb-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {usersList
                    .filter((u) => {
                      // Apply role filter tab
                      if (userFilterRole === 'verified' && !u.isVerified) return false;
                      if (userFilterRole === 'admin' && u.role !== 'admin') return false;
                      if (userFilterRole === 'streamer' && u.role !== 'creator' && u.role !== 'streamer') return false;
                      if (userFilterRole === 'guest' && !u.isGuest) return false;

                      // Apply search input
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.email?.toLowerCase().includes(q) ||
                        u.uid?.toLowerCase().includes(q) ||
                        u.role?.toLowerCase().includes(q) ||
                        u.displayName?.toLowerCase().includes(q)
                      );
                    })
                    .map((u) => (
                      <tr key={u.uid} className={`hover:bg-slate-950/50 transition-colors ${u.isVerified ? 'bg-blue-950/10' : ''}`}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.displayName || u.email?.split('@')[0]}</span>
                              {u.isVerified && (
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] px-1.5 py-0.2 rounded font-sans font-bold flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>Verified</span>
                                </span>
                              )}
                              {u.isGuest && (
                                <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.2 rounded font-sans">
                                  Guest
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px] mt-0.5">{u.email}</div>
                          <div className="text-[9px] text-slate-600 font-mono">{u.uid}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : u.role === 'creator' || u.role === 'streamer'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                              : u.role === 'venue' || u.role === 'venue_host'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          }`}>
                            {u.role === 'admin' ? '👑 Admin' : u.role || 'advertiser'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-400">
                          {(u.tokensBalance || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          ${((u.walletBalanceCents || 0) / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {u.bidsPlacedCount || 0}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAdjustBalance(u.uid, 1000)}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              title="Add 1,000 Free Starter Tokens ($1.00)"
                            >
                              +1k ($1)
                            </button>
                            <button
                              onClick={() => handleAdjustBalance(u.uid, 5000)}
                              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              title="Add 5,000 Ad Tokens ($5.00)"
                            >
                              +5k ($5)
                            </button>
                            <select
                              value={u.role || 'advertiser'}
                              onChange={(e) => handleAdjustBalance(u.uid, 0, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-0.5 text-[10px] text-slate-300 font-bold focus:outline-none"
                            >
                              <option value="advertiser">Advertiser</option>
                              <option value="creator">Creator (80%)</option>
                              <option value="venue">Venue (70%)</option>
                              <option value="admin">Admin (100%)</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: SOCIAL PROMO VOUCHERS & CREATOR PAYOUTS */}
      {activeAdminSubTab === 'vouchers' && (
        <div className="space-y-6">
          {/* Section 1: Promo Vouchers Creator & Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-2xl border border-pink-500/40">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight">
                    Social Media Promo Vouchers & Ad Grants
                  </h2>
                  <p className="text-xs text-slate-400">
                    Create promo codes to share on Product Hunt, X (Twitter), and Discord for viral trial user acquisition.
                  </p>
                </div>
              </div>

              <button
                onClick={fetchVouchers}
                disabled={loadingVouchers}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingVouchers ? 'animate-spin' : ''}`} />
                <span>Refresh Vouchers</span>
              </button>
            </div>

            {/* Create New Voucher Form */}
            <form onSubmit={handleCreateVoucher} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-pink-400" />
                <span>Create New Social Media Promo Voucher</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">Voucher Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PRODUCTHUNT500"
                    value={newVoucherCode}
                    onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">Ad Tokens (1k = $1.00)</label>
                  <input
                    type="number"
                    step="500"
                    value={newVoucherTokens}
                    onChange={(e) => setNewVoucherTokens(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">Max Redemptions</label>
                  <input
                    type="number"
                    value={newVoucherMaxClaims}
                    onChange={(e) => setNewVoucherMaxClaims(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">Description / Source</label>
                  <input
                    type="text"
                    placeholder="e.g. X Launch Community"
                    value={newVoucherDesc}
                    onChange={(e) => setNewVoucherDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={creatingVoucher || !newVoucherCode.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{creatingVoucher ? 'Publishing...' : 'Publish Social Promo Code'}</span>
                </button>
              </div>
            </form>

            {/* Active Vouchers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="pb-3 px-3">Promo Code</th>
                    <th className="pb-3 px-3">Token Grant</th>
                    <th className="pb-3 px-3">USD Value</th>
                    <th className="pb-3 px-3">Claims / Limit</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Social Share Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {vouchersList.map((v) => (
                    <tr key={v.code} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-black text-white bg-slate-950 border border-pink-500/40 text-pink-300 px-2.5 py-1 rounded-lg">
                          {v.code}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-sans">{v.description}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-400">
                        {v.tokens.toLocaleString()} Tokens
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        ${v.dollars ? v.dollars.toFixed(2) : (v.tokens / 1000).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-white font-bold">{v.claimedCount}</span>
                        <span className="text-slate-500"> / {v.maxClaims}</span>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-pink-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, (v.claimedCount / v.maxClaims) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleVoucher(v.code)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            v.active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {v.active ? 'ACTIVE' : 'PAUSED'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleCopyShareablePromoLink(v.code)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedVoucherCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedVoucherCode === v.code ? 'Copied Link!' : 'Copy Social Link'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Creator & Venue Payout Requests Review Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight">
                    Creator (80%) & Venue (70%) Withdrawal Requests
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review and approve earnings payouts submitted by streamer overlay partners and physical smart TV hosts.
                  </p>
                </div>
              </div>

              <button
                onClick={fetchPayouts}
                disabled={loadingPayouts}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPayouts ? 'animate-spin' : ''}`} />
                <span>Refresh Payouts</span>
              </button>
            </div>

            {payoutsList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-mono bg-slate-950/60 rounded-2xl border border-slate-800/80">
                No withdrawal payout requests submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                      <th className="pb-3 px-3">Partner Email / Role</th>
                      <th className="pb-3 px-3">Amount</th>
                      <th className="pb-3 px-3">Payment Method & Recipient Address</th>
                      <th className="pb-3 px-3">Requested At</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Admin Settle Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {payoutsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{p.userEmail}</div>
                          <span className="text-[10px] text-purple-400 font-bold uppercase">{p.userRole}</span>
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400 text-sm">
                          ${p.amountDollars.toFixed(2)} USD
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200 uppercase">{p.paymentMethod}</div>
                          <div className="text-[10px] text-slate-400 font-mono select-all truncate max-w-[200px]">{p.recipientAddress}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {new Date(p.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            p.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : p.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdatePayoutStatus(p.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve & Settle</span>
                              </button>
                              <button
                                onClick={() => handleUpdatePayoutStatus(p.id, 'rejected')}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {/* SUB-TAB 1: DYNAMIC PLATFORM SETTINGS */}
      {activeAdminSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auction & Reserve Price Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Real-Time Auction & Reserve Floors</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">DYNAMIC CONFIG</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Active Slot Rotation Duration (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={settings.slotDurationSeconds}
                    onChange={(e) => setSettings({ ...settings, slotDurationSeconds: parseInt(e.target.value) })}
                    className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold w-12 text-center text-sm">
                    {settings.slotDurationSeconds}s
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Controls length of each billboard rotation cycle.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">City Floor ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={(settings.cityReserveFloorCents / 100).toFixed(2)}
                    onChange={(e) => setSettings({ ...settings, cityReserveFloorCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Country Floor ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={(settings.countryReserveFloorCents / 100).toFixed(2)}
                    onChange={(e) => setSettings({ ...settings, countryReserveFloorCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Global Floor ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={(settings.globalReserveFloorCents / 100).toFixed(2)}
                    onChange={(e) => setSettings({ ...settings, globalReserveFloorCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Dual Rev-Share Sliders */}
              <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                    <span>👑 Creator Vanity Billboards Rev-Share (/@handle)</span>
                    <span className="text-purple-400 font-bold font-mono">{settings.creatorRevSharePercent || 80}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={settings.creatorRevSharePercent || 80}
                    onChange={(e) => setSettings({ ...settings, creatorRevSharePercent: parseInt(e.target.value) })}
                    className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Applied when fans/brands bid on a creator's personal vanity URL (e.g. /@streamer).</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                    <span>📺 Physical Smart TVs (/tv) & Streamer Overlays (/overlay)</span>
                    <span className="text-emerald-400 font-bold font-mono">{settings.streamerRevSharePercent || 70}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={settings.streamerRevSharePercent || 70}
                    onChange={(e) => setSettings({ ...settings, streamerRevSharePercent: parseInt(e.target.value) })}
                    className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Applied to physical venues (cafes, lounges, co-working) and generic screen streamers.</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Billboard Environment Atmospheric Backdrop
                </label>
                <select
                  value={settings.activeEnvironment}
                  onChange={(e) => setSettings({ ...settings, activeEnvironment: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none"
                >
                  <option value="night_city">🌃 Cyberpunk Night City (Neon Reflections)</option>
                  <option value="day_skyline">🏙️ Sunny Metropolitan Day Skyline</option>
                  <option value="cyberpunk_neon">🌆 Tokyo Shibuya Neon Matrix</option>
                  <option value="studio_stage">📺 Clean Studio Stage (Minimalist)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gemini Safety & Maintenance Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Autonomous AI Content Safety & Overrides</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">AI & NETWORK</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Autonomous Vision AI Safety Threshold (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={settings.geminiSafetyThreshold}
                    onChange={(e) => setSettings({ ...settings, geminiSafetyThreshold: parseInt(e.target.value) })}
                    className="w-full accent-indigo-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-indigo-400 font-bold w-12 text-center text-sm">
                    {settings.geminiSafetyThreshold}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Minimum safety score required before auto-approving creative ads.</p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Default Fallback House Ad Title
                </label>
                <input
                  type="text"
                  value={settings.houseAdTitle}
                  onChange={(e) => setSettings({ ...settings, houseAdTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Default Fallback House Ad Image URL
                </label>
                <input
                  type="text"
                  value={settings.houseAdImageUrl}
                  onChange={(e) => setSettings({ ...settings, houseAdImageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Emergency Maintenance Banner Alert (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. System undergoing scheduled geofence index sync..."
                  value={settings.emergencyAlertBanner}
                  onChange={(e) => setSettings({ ...settings, emergencyAlertBanner: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-900/50 rounded-xl px-3 py-2 text-amber-300 focus:outline-none text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{savingSettings ? 'Updating System...' : 'Apply & Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CREATOR HANDLES & VERIFICATION MANAGEMENT */}
      {activeAdminSubTab === 'creators' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">Creator & Event Billboard Handles Directory</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage creator handles, verify profiles, configure minimum bid floors, and review accrued 80% payouts.
                </p>
              </div>

              <input
                type="text"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                placeholder="Search creator handle (e.g. elonmusk, mrbeast)..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500 w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-bold">CREATOR / EVENT</th>
                    <th className="pb-3 font-bold">CATEGORY</th>
                    <th className="pb-3 font-bold">VERIFIED STATUS</th>
                    <th className="pb-3 font-bold">MIN BID FLOOR</th>
                    <th className="pb-3 font-bold">ACCRUED BIDS</th>
                    <th className="pb-3 font-bold text-right">ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { handle: 'elonmusk', name: 'Elon Musk', cat: 'Tech & Space', verified: true, minBid: 25.00, earned: 14850.00 },
                    { handle: 'mrbeast', name: 'MrBeast', cat: 'Entertainment', verified: true, minBid: 50.00, earned: 42300.00 },
                    { handle: 'kaicenat', name: 'Kai Cenat', cat: 'Live Streamer', verified: true, minBid: 15.00, earned: 28400.00 },
                    { handle: 'ishowspeed', name: 'IShowSpeed', cat: 'Gaming & IRL', verified: true, minBid: 20.00, earned: 31200.00 },
                    { handle: 'marquesbrownlee', name: 'Marques Brownlee', cat: 'Consumer Tech', verified: true, minBid: 30.00, earned: 18900.00 },
                    { handle: 'naval', name: 'Naval Ravikant', cat: 'Startups & AI', verified: true, minBid: 10.00, earned: 9200.00 },
                    { handle: 'raveparty', name: 'Rave & DJ Stage', cat: 'Nightlife Events', verified: true, minBid: 5.00, earned: 6800.00 },
                    { handle: 'ethdenver', name: 'ETHDenver Stage', cat: 'Web3 Conferences', verified: true, minBid: 10.00, earned: 12400.00 }
                  ]
                    .filter((c) => !creatorFilter || c.handle.toLowerCase().includes(creatorFilter.toLowerCase()) || c.name.toLowerCase().includes(creatorFilter.toLowerCase()))
                    .map((c) => (
                      <tr key={c.handle} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-white">{c.name}</span>
                            <span className="text-cyan-400">@{c.handle}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400">{c.cat}</td>
                        <td className="py-3">
                          {c.verified ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                              ✓ VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-[10px] font-bold">
                              UNVERIFIED
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-amber-300 font-bold">${c.minBid.toFixed(2)}</td>
                        <td className="py-3 text-emerald-400 font-bold">${c.earned.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                window.open(`/@${c.handle}`, '_blank');
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[10px] font-bold transition-all"
                            >
                              View Live Screen ↗
                            </button>
                            <button
                              onClick={() => {
                                addToast('success', 'Profile Status Updated', `@${c.handle} verification status synchronized.`);
                              }}
                              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Verify Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EMERGENCY AD INJECTOR & OVERRIDES */}
      {activeAdminSubTab === 'overrides' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">Direct Emergency Ad Injector (Instant Override)</h3>
              </div>
              <span className="bg-amber-950 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded text-[10px] font-bold">
                PRIORITY QUEUE INJECT
              </span>
            </div>

            <form onSubmit={handleInjectAd} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Campaign Headline Title</label>
                  <input
                    type="text"
                    required
                    value={injectTitle}
                    onChange={(e) => setInjectTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Advertiser Entity Name</label>
                  <input
                    type="text"
                    required
                    value={injectAdvertiser}
                    onChange={(e) => setInjectAdvertiser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">High-Res Creative Image URL</label>
                  <input
                    type="url"
                    required
                    value={injectImg}
                    onChange={(e) => setInjectImg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Target City Geofence</label>
                  <select
                    value={injectCity}
                    onChange={(e) => setInjectCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none"
                  >
                    <option value="KUL">Kuala Lumpur [MY]</option>
                    <option value="TYO">Tokyo [JP]</option>
                    <option value="NYC">New York [US]</option>
                    <option value="LON">London [UK]</option>
                    <option value="GLOBAL">Global Default Queue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Override Bid Amount ($)</label>
                <input
                  type="number"
                  step="5"
                  value={injectBidDollars}
                  onChange={(e) => setInjectBidDollars(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={injecting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>{injecting ? 'Injecting Ad...' : `Direct Inject & Force Active in ${injectCity}`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Automated 10-Ad City Population Utility Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Automated City Ad Seeding Utility
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Populates 10 diverse, industry-specific ad campaigns for every city billboard so screens are never empty at launch.
              </p>
            </div>

            <button
              onClick={handlePopulateCityCampaigns}
              disabled={populatingCampaigns}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{populatingCampaigns ? 'Populating 10 Ads / City...' : '⚡ Seed 10 Industry Ads Per City'}</span>
            </button>

            {populateReport && (
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40 text-[11px] font-mono text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Seeding Complete!
                </div>
                <p>Total Cities: {populateReport.totalCities}</p>
                <p>Campaigns Created: {populateReport.totalCampaignsAdded}</p>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 space-y-3 font-mono text-xs">
              <h4 className="font-bold text-slate-300 text-[11px]">Emergency Queue Purge Controls</h4>
              {['KUL', 'TYO', 'NYC', 'LON', 'GLOBAL'].map((cCode) => (
                <div key={cCode} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <div className="font-bold text-white">Queue [{cCode}]</div>
                    <div className="text-[10px] text-slate-500">Purge pending ZSET bids</div>
                  </div>
                  <button
                    onClick={() => handleClearQueue(cCode)}
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GEOFENCED BILLBOARD CITIES */}
      {activeAdminSubTab === 'cities' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Active Geofenced Billboard Hubs</h3>
              <p className="text-xs text-slate-400 font-mono">Enable/disable regional billboard auction nodes across global markets.</p>
            </div>
            <button
              onClick={fetchCities}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCities ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {cities.map((city) => (
              <div
                key={city.cityCode}
                className={`p-4 rounded-2xl border transition-all ${
                  city.active
                    ? 'bg-slate-950 border-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{city.flagEmoji}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{city.cityName}</div>
                      <div className="text-[10px] text-slate-400">{city.countryName} [{city.cityCode}]</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    city.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {city.active ? 'ONLINE' : 'DISABLED'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Floor: ${(city.reserveFloorCents / 100).toFixed(2)}</span>
                  <button
                    onClick={() => handleToggleCity(city.cityCode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      city.active
                        ? 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-800'
                        : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {city.active ? 'Disable Geofence' : 'Enable Geofence'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DEVELOPER & ARCHITECTURE TOOLS */}
      {activeAdminSubTab === 'tech_tools' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl overflow-x-auto scrollbar-none font-mono text-xs">
            {[
              { id: 'architecture', label: '📐 System Architecture', icon: GitBranch },
              { id: 'postgres', label: '🗄️ PostgreSQL DDL Schema', icon: Database },
              { id: 'redis', label: '⚡ Redis Cache Inspector', icon: Zap },
              { id: 'cascade', label: '⚙️ Cascade Fallback Sandbox', icon: Layers },
              { id: 'ledger', label: '🛡️ Fraud & Payout Ledger', icon: ShieldCheck }
            ].map((t) => {
              const Icon = t.icon;
              const isAct = techTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTechTool(t.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                    isAct
                      ? 'bg-cyan-500 text-slate-950 shadow font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2">
            {techTool === 'architecture' && <ArchitectureDiagram />}
            {techTool === 'postgres' && <PostgresSchemaViewer />}
            {techTool === 'redis' && <RedisCacheInspector selectedCity={selectedCity} selectedCountry={selectedCountry} />}
            {techTool === 'cascade' && <CascadeSandbox selectedCity={selectedCity} selectedCountry={selectedCountry} />}
            {techTool === 'ledger' && <PayoutLedger viewerPoints={120} onPointsEarned={() => {}} />}
          </div>
        </div>
      )}
    </div>
  );
};
