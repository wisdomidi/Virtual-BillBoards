import React, { useState, useEffect } from 'react';
import { PlatformSettings, CityConfig, TelemetryLog, ToastMessage } from '../types';
import { db, isUserAdmin } from '../lib/firebase';
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  query,
  limit
} from 'firebase/firestore';
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
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tv,
  Image,
  Monitor,
  Upload,
  Plus,
  Coins,
  TrendingUp,
  Award,
  PartyPopper
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

const getInitialAdminSubTab = (): 'settings' | 'moderation' | 'users' | 'vouchers' | 'streamers' | 'attention' | 'solana' | 'affiliates' | 'screens' | 'house_ads' | 'creators' | 'overrides' | 'cities' | 'tech_tools' => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const subtabParam = params.get('subtab') || params.get('tab') || window.location.hash.replace(/^#/, '');
    const valid = ['settings', 'moderation', 'users', 'vouchers', 'streamers', 'attention', 'solana', 'affiliates', 'screens', 'house_ads', 'creators', 'overrides', 'cities', 'tech_tools'];
    if (subtabParam && valid.includes(subtabParam)) {
      return subtabParam as any;
    }
    const saved = localStorage.getItem('vb_admin_subtab');
    if (saved && valid.includes(saved)) {
      return saved as any;
    }
  }
  return 'settings';
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  telemetryLogs,
  addToast,
  selectedCity,
  selectedCountry
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'settings' | 'moderation' | 'users' | 'vouchers' | 'streamers' | 'attention' | 'solana' | 'affiliates' | 'screens' | 'house_ads' | 'creators' | 'overrides' | 'cities' | 'tech_tools'>(() => getInitialAdminSubTab());
  const [techTool, setTechTool] = useState<'architecture' | 'postgres' | 'redis' | 'cascade' | 'ledger'>('architecture');
  const [creatorFilter, setCreatorFilter] = useState('');

  const handleSelectAdminSubTab = (tabId: any) => {
    setActiveAdminSubTab(tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vb_admin_subtab', tabId);
      const url = new URL(window.location.href);
      url.searchParams.set('subtab', tabId);
      window.history.replaceState({ subtab: tabId }, '', url.toString());
    }
  };

  // Live Streamers & OBS Overlays Fleet State
  const [streamersData, setStreamersData] = useState<any>(null);
  const [loadingStreamers, setLoadingStreamers] = useState(false);
  const [firingCelebration, setFiringCelebration] = useState<string | null>(null);

  // Proof of Attention (PoA) Telemetry State
  const [attentionData, setAttentionData] = useState<any>(null);
  const [loadingAttention, setLoadingAttention] = useState(false);

  // Solana On-Chain Settlement Ledger State
  const [solanaData, setSolanaData] = useState<any>(null);
  const [loadingSolana, setLoadingSolana] = useState(false);

  // Affiliate & Ambassador Network State
  const [affiliatesData, setAffiliatesData] = useState<any>(null);
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);

  // Smart TVs & Hardware Screens State
  const [screensList, setScreensList] = useState<any[]>([]);
  const [loadingScreens, setLoadingScreens] = useState(false);

  // House Ads & Fallback Assets State
  const [houseAdsList, setHouseAdsList] = useState<any[]>([]);
  const [loadingHouseAds, setLoadingHouseAds] = useState(false);
  const [newHouseAdTitle, setNewHouseAdTitle] = useState('');
  const [newHouseAdUrl, setNewHouseAdUrl] = useState('');
  const [newHouseAdCity, setNewHouseAdCity] = useState('GLOBAL');
  const [newHouseAdCategory, setNewHouseAdCategory] = useState('brand');
  const [creatingHouseAd, setCreatingHouseAd] = useState(false);

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
  const [adSourceFilter, setAdSourceFilter] = useState<'all' | 'user' | 'house'>('user');
  const [adCityFilter, setAdCityFilter] = useState<string>('ALL');
  const [adSearchQuery, setAdSearchQuery] = useState<string>('');
  const [adPage, setAdPage] = useState<number>(1);
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'verified' | 'admin' | 'streamer' | 'guest'>('all');
  const [flaggedAds, setFlaggedAds] = useState<any[]>([]);
  const [loadingFlaggedAds, setLoadingFlaggedAds] = useState(false);

  // Pure Production Mode (Real Data Only vs Benchmark & Demo Data)
  const [productionDataOnly, setProductionDataOnly] = useState<boolean>(true);

  // Transactional Email Testing State
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Platform Settings State
  const [settings, setSettings] = useState<PlatformSettings>({
    slotDurationSeconds: 15,
    cityReserveFloorCents: 100,
    countryReserveFloorCents: 250,
    globalReserveFloorCents: 500,
    geminiSafetyThreshold: 70,
    starterGrantTokens: 1000,
    minPayoutThresholdUsd: 5.00,
    streamerRevSharePercent: 70,
    creatorRevSharePercent: 80,
    venueRevSharePercent: 70,
    maintenanceMode: false,
    emergencyAlertBanner: '',
    houseAdTitle: 'Public Service: Plant 10,000 Trees Worldwide',
    houseAdImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    activeEnvironment: 'night_city',
    surgeMultiplier: 1.0,
    autoSurgeEnabled: true,
    peakConcurrencyThreshold: 500,
    emailNotificationsEnabled: true
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Interactive Confirmation Modal System for Destructive/Modifying Admin Actions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => Promise<void> | void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: () => {}
  });

  const askConfirmation = (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel || 'Confirm Action',
      confirmVariant: opts.confirmVariant || 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await opts.onConfirm();
        } finally {
          setConfirmDialog({
            isOpen: false,
            title: '',
            message: '',
            confirmLabel: 'Confirm',
            confirmVariant: 'danger',
            onConfirm: () => {},
            isLoading: false
          });
        }
      }
    });
  };

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
    askConfirmation({
      title: 'Populate 10 High-Res Ads Per City?',
      message: 'This will seed 10 rich industry sample campaigns across all geofenced city billboards. Existing live user bids will remain untouched.',
      confirmLabel: 'Populate Campaigns',
      confirmVariant: 'primary',
      onConfirm: async () => {
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
      }
    });
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
        if (data.ads && Array.isArray(data.ads) && data.ads.length > 0) {
          const realAds = data.ads.filter((a: any) => !a.id?.startsWith('hist_'));
          if (realAds.length > 0) {
            setAllAdminAds(realAds.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch all admin ads:', err);
    } finally {
      setLoadingAllAds(false);
    }
  };

  const handleRejectLiveAd = async (adId: string) => {
    askConfirmation({
      title: 'Reject Ad From Live Rotation?',
      message: `Are you sure you want to reject ad #${adId.slice(0, 8)}? It will be removed immediately from active broadcasts and queues.`,
      confirmLabel: 'Reject Ad',
      confirmVariant: 'danger',
      onConfirm: async () => {
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
      }
    });
  };

  const handleOverrideFlaggedAd = async (id: string) => {
    askConfirmation({
      title: 'Override AI Flag & Approve Ad?',
      message: 'Manually override the AI moderation flag and immediately inject this ad creative into the live broadcast rotation?',
      confirmLabel: 'Approve & Inject',
      confirmVariant: 'success',
      onConfirm: async () => {
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
      }
    });
  };

  const handleDismissFlaggedAd = async (id: string) => {
    askConfirmation({
      title: 'Dismiss Flagged Creative?',
      message: 'Permanently dismiss this flagged ad from the moderation queue?',
      confirmLabel: 'Dismiss',
      confirmVariant: 'danger',
      onConfirm: async () => {
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
      }
    });
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const mergedUsersMap = new Map<string, any>();

      // 1. Direct Firestore Browser Query (100% live from Firestore)
      if (db) {
        try {
          const usersCol = collection(db, 'users');
          const snap = await getDocs(query(usersCol, limit(500)));
          snap.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const uid = docSnap.id;
            const isGuestUser = uid.startsWith('guest_') || data.isAnonymous === true;
            const hasEmail = Boolean(data.email && typeof data.email === 'string' && data.email.trim() !== '');
            const resolvedEmail = hasEmail ? data.email : (isGuestUser ? `Guest Visitor (${uid.slice(0, 8)})` : `Registered User (${uid.slice(0, 8)})`);
            const resolvedName = data.displayName || (hasEmail ? data.email.split('@')[0] : (isGuestUser ? 'Guest Session' : 'User'));
            const isAdmin = isUserAdmin(data.email, data.role);

            mergedUsersMap.set(uid, {
              uid,
              email: resolvedEmail,
              displayName: resolvedName,
              photoURL: data.photoURL || null,
              role: data.role || (isAdmin ? 'admin' : 'advertiser'),
              isGuest: isGuestUser,
              isVerified: !isGuestUser && (hasEmail || data.starterGrantClaimed || Boolean(data.email)),
              tokensBalance: typeof data.tokensBalance === 'number' ? data.tokensBalance : 1000,
              walletBalanceCents: typeof data.walletBalanceCents === 'number' ? data.walletBalanceCents : 100,
              bidsPlacedCount: data.bidsPlacedCount || 0,
              createdAt: data.createdAt || new Date().toISOString()
            });
          });
        } catch (fsErr) {
          console.warn('Client direct Firestore users fetch notice:', fsErr);
        }
      }

      // 2. Fetch from backend /api/admin/users to merge in-memory balances
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          if (data.users && Array.isArray(data.users)) {
            data.users.forEach((u: any) => {
              const existing = mergedUsersMap.get(u.uid);
              if (existing) {
                mergedUsersMap.set(u.uid, {
                  ...existing,
                  tokensBalance: Math.max(existing.tokensBalance || 0, u.tokensBalance || 0),
                  walletBalanceCents: Math.max(existing.walletBalanceCents || 0, u.walletBalanceCents || 0),
                  bidsPlacedCount: Math.max(u.bidsPlacedCount || 0, existing.bidsPlacedCount || 0),
                  role: u.role || existing.role
                });
              } else {
                mergedUsersMap.set(u.uid, u);
              }
            });
          }
        }
      } catch (beErr) {
        console.warn('Backend /api/admin/users notice:', beErr);
      }

      const finalUsers = Array.from(mergedUsersMap.values()).sort((a, b) => {
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        return (b.tokensBalance || 0) - (a.tokensBalance || 0);
      });

      setUsersList(finalUsers);
    } catch (e) {
      console.warn('Failed to load admin users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAdjustBalance = async (targetUserId: string, addTokens: number, newRole?: string) => {
    const userObj = usersList.find(u => u.uid === targetUserId);
    const name = userObj?.displayName || userObj?.email || targetUserId.slice(-6);
    const actionText = addTokens !== 0 
      ? `${addTokens > 0 ? 'Grant' : 'Deduct'} ${Math.abs(addTokens).toLocaleString()} tokens (${addTokens > 0 ? '+' : '-'}$${Math.abs(addTokens / 1000).toFixed(2)})`
      : `Change role to ${newRole}`;

    askConfirmation({
      title: 'Confirm User Adjustment',
      message: `Are you sure you want to ${actionText} for user "${name}" (${targetUserId.slice(0, 8)}...)?`,
      confirmLabel: 'Apply Adjustment',
      confirmVariant: addTokens < 0 ? 'danger' : 'primary',
      onConfirm: async () => {
        try {
          // 1. Direct Firestore write
          if (db) {
            try {
              const userDocRef = doc(db, 'users', targetUserId);
              const updates: Record<string, any> = {};
              if (newRole) updates.role = newRole;
              if (addTokens !== 0) {
                const current = usersList.find(u => u.uid === targetUserId);
                const currentTokens = current?.tokensBalance || 0;
                const newTokens = Math.max(0, currentTokens + addTokens);
                updates.tokensBalance = newTokens;
                updates.walletBalanceCents = Math.round(newTokens / 10);
              }
              if (Object.keys(updates).length > 0) {
                await updateDoc(userDocRef, updates);
              }
            } catch (fsErr) {
              console.warn('Firestore updateDoc warning:', fsErr);
            }
          }

          // 2. Server API adjust
          const res = await fetch('/api/admin/user/adjust-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId, addTokens, newRole, reason: 'Admin manual adjustment' })
          });
          const data = await res.json();
          if (data.success) {
            addToast('success', 'Balance Updated', `User ${targetUserId.slice(-6)} updated successfully.`);
            fetchUsers();
            setAdjustingUser(null);
          }
        } catch (e: any) {
          addToast('error', 'Update Failed', e.message);
        }
      }
    });
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

    askConfirmation({
      title: 'Issue New Promo Voucher?',
      message: `Generate promo code "${newVoucherCode.trim().toUpperCase()}" with ${Number(newVoucherTokens).toLocaleString()} free tokens ($${(Number(newVoucherTokens)/100).toFixed(2)}) across ${newVoucherMaxClaims} maximum claims?`,
      confirmLabel: 'Issue Voucher',
      confirmVariant: 'success',
      onConfirm: async () => {
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
      }
    });
  };

  const handleToggleVoucher = async (code: string) => {
    askConfirmation({
      title: 'Toggle Voucher Status?',
      message: `Are you sure you want to change the active redemption status for promo code "${code}"?`,
      confirmLabel: 'Toggle Status',
      confirmVariant: 'warning',
      onConfirm: async () => {
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
      }
    });
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
    askConfirmation({
      title: `${status === 'approved' ? 'Approve & Release' : 'Reject'} Payout Request?`,
      message: `Are you sure you want to mark payout request #${payoutId.slice(0, 8)} as ${status.toUpperCase()}?`,
      confirmLabel: status === 'approved' ? 'Approve Payout' : 'Reject Payout',
      confirmVariant: status === 'approved' ? 'success' : 'danger',
      onConfirm: async () => {
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
      }
    });
  };

  const handleCopyShareablePromoLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.livebillboards.lol';
    const link = `${origin}/?promo=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedVoucherCode(code);
    addToast('success', 'Promo Link Copied!', `Copied ${link} to clipboard ready to tweet / share!`);
    setTimeout(() => setCopiedVoucherCode(null), 2500);
  };

  const fetchScreens = async () => {
    setLoadingScreens(true);
    try {
      const res = await fetch('/api/admin/screens');
      if (res.ok) {
        const data = await res.json();
        if (data.screens && Array.isArray(data.screens) && data.screens.length > 0) {
          setScreensList(data.screens);
          setLoadingScreens(false);
          return;
        }
      }
      // Direct Firestore fallback if backend API was temporarily unreachable
      if (db) {
        const screensCol = collection(db, 'screens');
        const snap = await getDocs(query(screensCol, limit(100)));
        const list: any[] = [];
        snap.docs.forEach((d) => {
          const dt = d.data();
          list.push({
            id: `tv_${d.id}`,
            pin: dt.pin || d.id,
            formattedPin: dt.formattedPin || d.id,
            venueName: dt.venueName || 'Verified Smart TV',
            deviceType: dt.deviceType || 'Smart TV (WebOS/Tizen/FireTV)',
            cityCode: dt.city || 'GLOBAL',
            status: 'online',
            solanaWallet: dt.solanaWallet || null,
            totalScans: dt.totalScans || dt.scanCount || dt.verifiedVisits || 0,
            verifiedVisits: dt.verifiedVisits || dt.totalScans || 0,
            connectedAt: dt.pairedAt || dt.createdAt || new Date().toISOString(),
            resolution: dt.resolution || '4K Ultra-HD (3840x2160)',
            activeAd: 'Live Billboard Feed'
          });
        });
        if (list.length > 0) setScreensList(list);
      }
    } catch (err) {
      console.error('Failed to fetch screens:', err);
    } finally {
      setLoadingScreens(false);
    }
  };

  const handleEjectScreen = async (pin: string) => {
    askConfirmation({
      title: 'Disconnect TV Display Hardware?',
      message: `Force disconnect screen with pairing PIN "${pin}"? The screen will be reset and required to re-pair.`,
      confirmLabel: 'Disconnect Screen',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/screens/${pin}/eject`, { method: 'POST' });
          if (res.ok) {
            addToast('info', 'Screen Unpaired', `Screen ${pin} has been disconnected and reset.`);
            fetchScreens();
          }
        } catch (err: any) {
          addToast('error', 'Screen Eject Error', err.message);
        }
      }
    });
  };

  const fetchHouseAds = async () => {
    setLoadingHouseAds(true);
    try {
      const res = await fetch('/api/admin/house-ads');
      if (res.ok) {
        const data = await res.json();
        if (data.houseAds) setHouseAdsList(data.houseAds);
      }
    } catch (err) {
      console.error('Failed to fetch house ads:', err);
    } finally {
      setLoadingHouseAds(false);
    }
  };

  const handleCreateHouseAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseAdTitle.trim() || !newHouseAdUrl.trim()) {
      addToast('warning', 'Missing Fields', 'Please enter a title and image/video URL.');
      return;
    }
    setCreatingHouseAd(true);
    try {
      const res = await fetch('/api/admin/house-ads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newHouseAdTitle.trim(),
          imageUrl: newHouseAdUrl.trim(),
          targetCityCode: newHouseAdCity,
          category: newHouseAdCategory
        })
      });
      if (res.ok) {
        addToast('success', 'House Ad Added & Set Active', `"${newHouseAdTitle}" is now live as fallback ad.`);
        setNewHouseAdTitle('');
        setNewHouseAdUrl('');
        fetchHouseAds();
        fetchSettings();
      }
    } catch (err: any) {
      addToast('error', 'Failed to create house ad', err.message);
    } finally {
      setCreatingHouseAd(false);
    }
  };

  const handleDeleteHouseAd = async (id: string) => {
    askConfirmation({
      title: 'Delete Fallback House Ad?',
      message: 'Remove this fallback house ad asset permanently from the system?',
      confirmLabel: 'Delete House Ad',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/house-ads/${id}`, { method: 'DELETE' });
          if (res.ok) {
            addToast('info', 'House Ad Deleted', 'Asset removed from library.');
            fetchHouseAds();
          }
        } catch (err: any) {
          addToast('error', 'Delete Error', err.message);
        }
      }
    });
  };

  const handleSetLiveHouseAd = async (ad: any) => {
    askConfirmation({
      title: 'Set as Active Fallback Billboard?',
      message: `Make "${ad.title}" the default global fallback ad when no user auction bids are active?`,
      confirmLabel: 'Set as Fallback',
      confirmVariant: 'primary',
      onConfirm: async () => {
        const updatedSettings = {
          ...settings,
          houseAdTitle: ad.title,
          houseAdImageUrl: ad.imageUrl
        };
        setSettings(updatedSettings);
        try {
          await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings)
          });
          addToast('success', 'Active House Ad Set', `"${ad.title}" set as global fallback billboard.`);
        } catch (err: any) {
          addToast('error', 'Setting Update Error', err.message);
        }
      }
    });
  };

  const fetchLiveStreamers = async () => {
    setLoadingStreamers(true);
    try {
      const res = await fetch(`/api/admin/streamers/live?pureProduction=${productionDataOnly}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStreamersData(data);
      }
    } catch (err) {
      console.error('Failed to fetch live streamers:', err);
    } finally {
      setLoadingStreamers(false);
    }
  };

  const handleFireCelebration = async (handle: string, eventType: string = 'victory_royale') => {
    askConfirmation({
      title: 'Fire Game-State Celebration VFX?',
      message: `Trigger dynamic takeover overlay (${eventType.replace('_', ' ').toUpperCase()}) on @${handle}'s live stream?`,
      confirmLabel: 'Fire Celebration',
      confirmVariant: 'success',
      onConfirm: async () => {
        setFiringCelebration(handle);
        try {
          const res = await fetch('/api/admin/streamers/fire-celebration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ handle, eventType, sponsorName: 'AEGIS AUTONOMOUS SPONSOR' })
          });
          if (res.ok) {
            addToast('success', 'Celebration Fired!', `Broadcasted ${eventType.toUpperCase()} to @${handle}'s OBS overlay.`);
            fetchLiveStreamers();
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFiringCelebration(null);
        }
      }
    });
  };

  const fetchAttentionTelemetry = async () => {
    setLoadingAttention(true);
    try {
      const res = await fetch(`/api/admin/attention-telemetry?pureProduction=${productionDataOnly}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAttentionData(data);
      }
    } catch (err) {
      console.error('Failed to fetch attention telemetry:', err);
    } finally {
      setLoadingAttention(false);
    }
  };

  const fetchSolanaLedger = async () => {
    setLoadingSolana(true);
    try {
      const res = await fetch(`/api/admin/solana/ledger?pureProduction=${productionDataOnly}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSolanaData(data);
      }
    } catch (err) {
      console.error('Failed to fetch Solana ledger:', err);
    } finally {
      setLoadingSolana(false);
    }
  };

  const fetchAffiliates = async () => {
    setLoadingAffiliates(true);
    try {
      const res = await fetch(`/api/admin/affiliates?pureProduction=${productionDataOnly}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAffiliatesData(data);
      }
    } catch (err) {
      console.error('Failed to fetch affiliates:', err);
    } finally {
      setLoadingAffiliates(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCities();
    fetchFlaggedAds();
    fetchAllAdminAds();
    fetchUsers();
    fetchVouchers();
    fetchPayouts();
    fetchScreens();
    fetchHouseAds();
    fetchLiveStreamers();
    fetchAttentionTelemetry();
    fetchSolanaLedger();
    fetchAffiliates();
  }, [productionDataOnly]);

  // Real-time Firestore users listener
  useEffect(() => {
    if (activeAdminSubTab !== 'users' || !db) return;
    try {
      const usersCol = collection(db, 'users');
      const unsubscribe = onSnapshot(query(usersCol, limit(500)), (snap) => {
        setUsersList((prevList) => {
          const map = new Map(prevList.map(u => [u.uid, u]));
          snap.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const uid = docSnap.id;
            const isGuestUser = uid.startsWith('guest_') || data.isAnonymous === true;
            const hasEmail = Boolean(data.email && typeof data.email === 'string' && data.email.trim() !== '');
            const resolvedEmail = hasEmail ? data.email : (isGuestUser ? `Guest Visitor (${uid.slice(0, 8)})` : `Registered User (${uid.slice(0, 8)})`);
            const resolvedName = data.displayName || (hasEmail ? data.email.split('@')[0] : (isGuestUser ? 'Guest Session' : 'User'));
            const isAdmin = isUserAdmin(data.email, data.role);

            const existing = map.get(uid);
            map.set(uid, {
              uid,
              email: resolvedEmail,
              displayName: resolvedName,
              photoURL: data.photoURL || existing?.photoURL || null,
              role: data.role || (isAdmin ? 'admin' : existing?.role || 'advertiser'),
              isGuest: isGuestUser,
              isVerified: !isGuestUser && (hasEmail || data.starterGrantClaimed || Boolean(data.email)),
              tokensBalance: typeof data.tokensBalance === 'number' ? data.tokensBalance : (existing?.tokensBalance ?? 1000),
              walletBalanceCents: typeof data.walletBalanceCents === 'number' ? data.walletBalanceCents : (existing?.walletBalanceCents ?? 100),
              bidsPlacedCount: data.bidsPlacedCount || existing?.bidsPlacedCount || 0,
              createdAt: data.createdAt || existing?.createdAt || new Date().toISOString()
            });
          });
          return Array.from(map.values()).sort((a, b) => {
            if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
            return (b.tokensBalance || 0) - (a.tokensBalance || 0);
          });
        });
      }, (err) => {
        console.warn('Real-time users onSnapshot notice:', err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Real-time users listener setup notice:', err);
    }
  }, [activeAdminSubTab]);

  // Real-time Firestore screens listener
  useEffect(() => {
    if (!db) return;
    try {
      const screensCol = collection(db, 'screens');
      const unsubscribe = onSnapshot(query(screensCol, limit(200)), (snap) => {
        setScreensList((prevList) => {
          const map = new Map(prevList.map(s => [s.id, s]));
          snap.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const pin = data.pin || docSnap.id;
            const id = `tv_${pin}`;
            map.set(id, {
              id,
              pin,
              formattedPin: data.formattedPin || (pin ? `${pin.substring(0, 3)}-${pin.substring(3)}` : 'LIVE'),
              venueName: data.venueName || 'Verified Smart TV',
              deviceType: data.deviceType || 'Smart TV (WebOS/Tizen/FireTV)',
              cityCode: (data.city || 'GLOBAL').toUpperCase(),
              status: data.status === 'paired' || data.status === 'online' ? 'online' : (data.status || 'online'),
              solanaWallet: data.solanaWallet || null,
              totalScans: data.totalScans || data.scanCount || data.verifiedVisits || 0,
              verifiedVisits: data.verifiedVisits || data.totalScans || 0,
              connectedAt: data.pairedAt || data.createdAt || new Date().toISOString(),
              resolution: data.resolution || '4K Ultra-HD (3840x2160)',
              activeAd: data.activeAd || settings.houseAdTitle || 'Live Billboard Feed'
            });
          });
          return Array.from(map.values());
        });
      }, (err) => {
        console.warn('Real-time screens onSnapshot notice:', err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Real-time screens listener setup notice:', err);
    }
  }, []);

  // Real-time Firestore campaigns listener (instant real-time user ads in Admin Dashboard)
  useEffect(() => {
    if (!db) return;
    try {
      const campaignsCol = collection(db, 'campaigns');
      const unsubscribe = onSnapshot(query(campaignsCol, limit(200)), (snap) => {
        const list: any[] = [];
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const id = docSnap.id;
          const cents = data.bidAmountCents || (data.bidAmountTokens ? Math.round(data.bidAmountTokens / 10) : 100);
          list.push({
            id,
            title: data.title || 'User Campaign',
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
            advertiserName: data.advertiserName || data.displayName || 'Verified Advertiser',
            targetCityCode: (data.targetCityCode || 'GLOBAL').toUpperCase(),
            bidAmountDollars: (cents / 100).toFixed(2),
            bidAmountCents: cents,
            status: data.status || 'approved',
            isHouseAd: Boolean(data.isHouseAd),
            impressions: data.impressions || 15200,
            scansCount: data.scansCount || data.scanCount || 0,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });
        setAllAdminAds(list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      }, (err) => {
        console.warn('Real-time campaigns onSnapshot notice:', err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Real-time campaigns listener setup notice:', err);
    }
  }, []);

  // Automatically fetch freshest live data whenever switching between any Admin subtab
  useEffect(() => {
    switch (activeAdminSubTab) {
      case 'moderation':
        fetchAllAdminAds();
        fetchFlaggedAds();
        break;
      case 'screens':
        fetchScreens();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'vouchers':
        fetchVouchers();
        fetchPayouts();
        break;
      case 'streamers':
        fetchLiveStreamers();
        break;
      case 'house_ads':
        fetchHouseAds();
        break;
      case 'affiliates':
        fetchAffiliates();
        break;
      case 'treasury':
        fetchSolanaLedger();
        break;
      case 'telemetry':
        fetchAttentionTelemetry();
        break;
      case 'cities':
        fetchCities();
        break;
      case 'settings':
        fetchSettings();
        break;
      default:
        break;
    }
  }, [activeAdminSubTab]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    askConfirmation({
      title: 'Apply & Broadcast Platform Configuration?',
      message: 'This will persist new slot duration, rev-share splits, and reserve prices across Cloud Firestore, sync to .env, and push updates live via WebSockets.',
      confirmLabel: 'Save & Broadcast',
      confirmVariant: 'primary',
      onConfirm: async () => {
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
      }
    });
  };

  const handleForceEjectSlot = async () => {
    askConfirmation({
      title: 'Force Eject Active Rotation?',
      message: 'This will immediately reset the current live rotation ticker on all billboards and streamer feeds, advancing to the next highest queued bid.',
      confirmLabel: '⚡ Force Eject',
      confirmVariant: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/override-slot', { method: 'POST' });
          if (res.ok) {
            addToast('info', 'Active Slot Force Ejected', 'Auction loop ticker reset. Next slot rotation initiated immediately.');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      addToast('warning', 'Missing Email', 'Please enter an email address to send test.');
      return;
    }
    setSendingTestEmail(true);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: testEmailAddress })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Test Email Dispatched', `Transactional notification sent to ${testEmailAddress}`);
      } else {
        addToast('info', 'Delivery Notice', 'Email simulated in server logs (Configure RESEND_API_KEY in .env for live SMTP delivery).');
      }
    } catch (e: any) {
      addToast('error', 'Email Test Failed', e.message);
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleClearQueue = async (cityCode: string) => {
    askConfirmation({
      title: `Purge Auction Queue (${cityCode})?`,
      message: `Are you sure you want to permanently delete all queued and pending bids for ${cityCode}? This action cannot be undone.`,
      confirmLabel: `Purge ${cityCode} Queue`,
      confirmVariant: 'danger',
      onConfirm: async () => {
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
      }
    });
  };

  const handleToggleCity = async (cityCode: string) => {
    askConfirmation({
      title: `Toggle Geofence Status (${cityCode})?`,
      message: `Change the operational status for ${cityCode}? When disabled, this city billboard will not receive external advertiser bids.`,
      confirmLabel: 'Toggle Status',
      confirmVariant: 'warning',
      onConfirm: async () => {
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
      }
    });
  };

  const handleInjectAd = async (e: React.FormEvent) => {
    e.preventDefault();
    askConfirmation({
      title: 'Inject High-Priority Emergency Ad?',
      message: `Inject "${injectTitle}" immediately at the top of the queue for ${injectCity}?`,
      confirmLabel: 'Inject Ad',
      confirmVariant: 'warning',
      onConfirm: async () => {
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
      }
    });
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
            {/* Pure Production vs Benchmark Mode Switcher */}
            <button
              onClick={() => {
                const nextMode = !productionDataOnly;
                setProductionDataOnly(nextMode);
                if (nextMode) setAdSourceFilter('user');
                addToast(
                  'info',
                  nextMode ? '🟢 Pure Production Mode' : '🧪 Benchmark & Seed Mode',
                  nextMode
                    ? 'Filtering out demo test feeds. Displaying 100% verified real user campaigns & live streams only.'
                    : 'Showing seeded benchmark creators and fallback ads alongside real data.'
                );
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                productionDataOnly
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50 shadow-lg'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-950/50 shadow-lg'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${productionDataOnly ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{productionDataOnly ? 'Live Real Data Only' : 'Benchmark Feeds Included'}</span>
            </button>

            <button
              onClick={handleForceEjectSlot}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5 cursor-pointer"
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
            { id: 'streamers', label: `🎙️ Live Streamers (${streamersData?.totalConnected ?? 0})`, icon: Radio },
            { id: 'attention', label: `👁️ Proof of Attention & Scans`, icon: Eye },
            { id: 'solana', label: `⛓️ Solana Settlement & Treasury`, icon: Coins },
            { id: 'affiliates', label: `🤝 Affiliate Network (${affiliatesData?.totalAmbassadors ?? 0})`, icon: Award },
            { id: 'moderation', label: `🛡️ Moderation & Flagged Ads (${flaggedAds.length})`, icon: ShieldCheck },
            { id: 'screens', label: `📺 Smart TVs & Displays (${screensList.length})`, icon: Tv },
            { id: 'house_ads', label: `🖼️ Fallback House Ads (${houseAdsList.length})`, icon: Image },
            { id: 'creators', label: '👑 Creator Handles Directory', icon: Crown },
            { id: 'overrides', label: '⚡ Emergency Injector', icon: Zap },
            { id: 'cities', label: '🌍 Geofenced Cities', icon: Globe },
            { id: 'tech_tools', label: '🛠️ Developer Tools', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectAdminSubTab(tab.id as any)}
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

          {/* Controls Bar: Source Filter, City Drill-down, Search, Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            {/* Ad Source Type Filter */}
            <div className="flex flex-wrap gap-1.5 font-mono text-xs font-bold">
              {[
                { id: 'user', label: `👤 Real User Ads (${allAdminAds.filter(a => !a.isHouseAd).length})` },
                { id: 'house', label: `🏢 Demo House Ads (${allAdminAds.filter(a => a.isHouseAd).length})` },
                { id: 'all', label: `🌐 All (${allAdminAds.length})` }
              ].map((src) => (
                <button
                  key={src.id}
                  onClick={() => { setAdSourceFilter(src.id as any); setAdPage(1); }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    adSourceFilter === src.id
                      ? 'bg-blue-600 text-white font-black shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>

            {/* City Dropdown & Search Input */}
            <div className="flex items-center gap-2">
              <select
                value={adCityFilter}
                onChange={(e) => { setAdCityFilter(e.target.value); setAdPage(1); }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">🌍 All Cities ({allAdminAds.length})</option>
                {Array.from(new Set(allAdminAds.map(a => a.targetCityCode).filter(Boolean))).sort().map(c => (
                  <option key={c} value={c}>📍 {c}</option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search ad title or sponsor..."
                  value={adSearchQuery}
                  onChange={(e) => { setAdSearchQuery(e.target.value); setAdPage(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Sub-Filter Tabs: Live & Approved vs Queued vs Flagged vs All — Dynamically Context-Filtered */}
          {(() => {
            const sourceBaseAds = allAdminAds.filter(ad => {
              if (adSourceFilter === 'user' && ad.isHouseAd) return false;
              if (adSourceFilter === 'house' && !ad.isHouseAd) return false;
              if (adCityFilter !== 'ALL' && ad.targetCityCode?.toUpperCase() !== adCityFilter.toUpperCase()) return false;
              return true;
            });

            const sourceApprovedAds = sourceBaseAds.filter(a => a.status === 'live' || a.status === 'approved' || a.status === 'active' || a.status === 'completed' || a.status === 'playing');
            const sourceQueuedAds = sourceBaseAds.filter(a => a.status === 'queued' || a.status === 'scheduled');
            const sourceFlaggedAds = flaggedAds.filter(a => {
              if (adCityFilter !== 'ALL' && a.targetCityCode?.toUpperCase() !== adCityFilter.toUpperCase()) return false;
              return true;
            });

            const rawAds = moderationSubTab === 'flagged'
              ? sourceFlaggedAds
              : moderationSubTab === 'approved'
              ? sourceApprovedAds
              : moderationSubTab === 'queued'
              ? sourceQueuedAds
              : sourceBaseAds;

            const filteredAds = rawAds.filter(ad => {
              if (adSearchQuery.trim()) {
                const q = adSearchQuery.toLowerCase();
                const matchTitle = ad.title?.toLowerCase().includes(q);
                const matchAdv = ad.advertiserName?.toLowerCase().includes(q);
                if (!matchTitle && !matchAdv) return false;
              }
              return true;
            });

            const pageSize = 18;
            const totalPages = Math.max(1, Math.ceil(filteredAds.length / pageSize));
            const currentPage = Math.min(adPage, totalPages);
            const paginatedAds = filteredAds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            return (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold font-mono">
                  {[
                    { id: 'approved', label: `🟢 Live & Approved (${sourceApprovedAds.length})` },
                    { id: 'queued', label: `⏳ In-Queue & Scheduled (${sourceQueuedAds.length})` },
                    { id: 'flagged', label: `🔴 Flagged / Rejected (${sourceFlaggedAds.length})` },
                    { id: 'all', label: `📋 All Creatives (${sourceBaseAds.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setModerationSubTab(tab.id as any); setAdPage(1); }}
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

                {filteredAds.length === 0 ? (
                  <div className="py-12 text-center space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400/80 mx-auto" />
                    <div className="text-sm font-bold text-white uppercase">
                      {moderationSubTab === 'flagged' ? 'Flagged Queue is Clean!' : 'No Campaigns Match Filters'}
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {moderationSubTab === 'flagged'
                        ? 'All incoming creative has passed Gemini Vision AI brand safety filters.'
                        : 'Try selecting "All Cities" or switching between Real User vs Demo House Ads.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Results count & Pagination Top Header */}
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Showing <strong>{paginatedAds.length}</strong> of <strong>{filteredAds.length}</strong> matching creatives</span>
                      
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAdPage(p => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-30 hover:border-cyan-500 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-white">Page {currentPage} of {totalPages}</span>
                          <button
                            onClick={() => setAdPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-30 hover:border-cyan-500 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedAds.map((ad) => {
                        const isFlagged = ad.status === 'flagged' || Boolean(ad.reason);
                        const isLive = ad.status === 'live';
                        const isHouse = Boolean(ad.isHouseAd);

                        return (
                          <div
                            key={ad.id}
                            className={`bg-slate-950 border rounded-2xl p-4 space-y-3 shadow-lg flex flex-col justify-between transition-all ${
                              isFlagged
                                ? 'border-rose-500/40 hover:border-rose-500'
                                : isLive
                                ? 'border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                                : isHouse
                                ? 'border-slate-800/80 hover:border-slate-700 opacity-90'
                                : 'border-cyan-500/30 hover:border-cyan-400 ring-1 ring-cyan-500/10'
                            }`}
                          >
                        <div className="space-y-2.5">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                              <span className="px-2 py-0.5 bg-slate-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold rounded-md uppercase">
                                📍 {ad.targetCityCode || 'GLOBAL'}
                              </span>
                              {isLive && (
                                <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 text-[10px] font-mono font-bold rounded-md flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  LIVE
                                </span>
                              )}
                              {isHouse ? (
                                <span className="px-2 py-0.5 bg-slate-900/90 text-slate-400 border border-slate-700 text-[10px] font-mono font-bold rounded-md">
                                  🏢 Demo House Ad
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-blue-950/90 text-blue-300 border border-blue-500/60 text-[10px] font-mono font-bold rounded-md flex items-center gap-0.5">
                                  <span>💎 User Ad</span>
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

                {/* Bottom Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => setAdPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-xl text-xs font-mono font-bold text-slate-200 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                    <span className="text-xs font-mono text-slate-400">
                      Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                    </span>
                    <button
                      onClick={() => setAdPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-xl text-xs font-mono font-bold text-slate-200 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
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

              {/* Dynamic Surge Multiplier & Yield Optimization */}
              <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">Dynamic Surge Pricing & Yield Multiplier</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSurgeEnabled || false}
                      onChange={(e) => setSettings({ ...settings, autoSurgeEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <div>
                  <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                    <span>Current Surge Multiplier</span>
                    <span className="text-amber-400 font-bold font-mono">{(settings.surgeMultiplier || 1.0).toFixed(1)}x Reserve Floor</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={settings.surgeMultiplier || 1.0}
                    onChange={(e) => setSettings({ ...settings, surgeMultiplier: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Scales city & global reserve bid minimums automatically during high traffic peak tournaments.</p>
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

              {/* Dynamic Starter Grant & Minimum Payout Floor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px] font-semibold">🎁 Starter Grant (Tokens)</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={settings.starterGrantTokens ?? 1000}
                    onChange={(e) => setSettings({ ...settings, starterGrantTokens: parseInt(e.target.value || '0') })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{((settings.starterGrantTokens ?? 1000) / 1000).toFixed(2)} USD value</span>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px] font-semibold">💸 Min Payout Floor ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={settings.minPayoutThresholdUsd ?? 5.00}
                    onChange={(e) => setSettings({ ...settings, minPayoutThresholdUsd: parseFloat(e.target.value || '5.00') })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Solana / Bank withdrawal floor</span>
                </div>
              </div>

              {/* Transactional Email Dispatcher Module */}
              <div className="p-3.5 bg-slate-950 border border-blue-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-xs">Transactional Email Delivery Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                    {settings.emailProvider || 'Resend API'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter email to test dispatch..."
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingTestEmail ? 'animate-pulse' : ''}`} />
                    <span>{sendingTestEmail ? 'Sending...' : 'Test'}</span>
                  </button>
                </div>
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
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{savingSettings ? 'Updating System...' : 'Apply & Save Settings to Firestore'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: LIVE STREAMERS & OBS OVERLAYS FLEET */}
      {activeAdminSubTab === 'streamers' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/40">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Live Streamers & OBS Overlay Fleet</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitor all connected Twitch, Kick, and YouTube creators running the live billboard overlay with automated 80% revenue share.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchLiveStreamers}
                  disabled={loadingStreamers}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${loadingStreamers ? 'animate-spin' : ''}`} />
                  <span>{loadingStreamers ? 'Syncing Fleet...' : 'Refresh Live Streamers'}</span>
                </button>
              </div>
            </div>

            {/* Quick Streamer Fleet Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">CONNECTED STREAMERS</div>
                <div className="text-2xl font-black text-white">{streamersData?.totalConnected ?? 0} Live</div>
                <div className="text-[10px] text-purple-400 mt-1">Twitch, Kick & YouTube OBS</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">CONCURRENT AUDIENCE</div>
                <div className="text-2xl font-black text-emerald-400">
                  {(streamersData?.totalConcurrentViewers ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-500/80 mt-1">Active broadcast viewers</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">ACCRUED 80% REV-SHARE</div>
                <div className="text-2xl font-black text-cyan-400">
                  ${(streamersData?.totalRevShareDollars ?? 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-cyan-500/80 mt-1">Direct to streamer wallets</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">CELEBRATIONS FIRED</div>
                <div className="text-2xl font-black text-amber-400">
                  {streamersData?.totalCelebrations ?? 0}
                </div>
                <div className="text-[10px] text-amber-500/80 mt-1">Game-state vfx takeovers</div>
              </div>
            </div>

            {/* Live Streamers Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4 font-bold">STREAMER / CHANNEL</th>
                    <th className="py-3 px-4 font-bold">PLATFORM</th>
                    <th className="py-3 px-4 font-bold">VIEWERS & UPTIME</th>
                    <th className="py-3 px-4 font-bold">STATUS & TAKEOVER</th>
                    <th className="py-3 px-4 font-bold">REV-SHARE ACCRUED</th>
                    <th className="py-3 px-4 font-bold">SOLANA PAYOUT</th>
                    <th className="py-3 px-4 font-bold text-right">ADMIN TAKEOVER TRIGGER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {(() => {
                    const rawStreamers = streamersData?.streamers || [];
                    const filteredStreamers = rawStreamers.filter((s: any) => !productionDataOnly || s.id?.startsWith('conn_') || s.isLiveConnected);

                    if (filteredStreamers.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                            <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <div className="font-bold text-white uppercase">No Active Streamer OBS Overlays Connected</div>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                              Streamers add the billboard overlay browser source into OBS via <code className="text-cyan-400 font-mono">/overlay?creator=handle</code> to broadcast live.
                            </p>
                          </td>
                        </tr>
                      );
                    }

                    return filteredStreamers.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold">
                          <div>
                            <div className="text-white font-sans text-sm font-bold flex items-center gap-1.5">
                              <span>@{s.handle}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-800 rounded font-mono">
                                {s.cityCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">{s.displayName}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            s.platform === 'twitch' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                            s.platform === 'kick' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            s.platform === 'youtube' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {s.platform}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-emerald-400 font-bold">{s.viewersCount.toLocaleString()} viewers</div>
                          <div className="text-[10px] text-slate-400">{s.uptimeMinutes} mins live</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {s.activeTakeover ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                              <PartyPopper className="w-3 h-3" />
                              {s.activeTakeover}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              STREAMING BILLBOARDS
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-cyan-400 font-black">
                          ${s.accruedRevShareDollars.toFixed(2)} USD
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono select-all">
                          {s.solanaWallet ? `${s.solanaWallet.slice(0, 4)}...${s.solanaWallet.slice(-4)}` : 'Auto-Solana'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleFireCelebration(s.handle, 'victory_royale')}
                              disabled={firingCelebration === s.handle}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Fire Victory Royale Takeover"
                            >
                              <PartyPopper className="w-3 h-3" />
                              <span>Victory</span>
                            </button>
                            <button
                              onClick={() => handleFireCelebration(s.handle, 'kill_streak')}
                              disabled={firingCelebration === s.handle}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Fire 5x Killstreak Takeover"
                            >
                              <Flame className="w-3 h-3" />
                              <span>5x Streak</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PROOF OF ATTENTION (PoA) & EYEBALL TELEMETRY */}
      {activeAdminSubTab === 'attention' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Proof of Attention (PoA) & QR Conversion Telemetry</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cryptographic biometric dwell-time verification, device sybil protection, and real-time watcher token mining logs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAttentionTelemetry}
                  disabled={loadingAttention}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingAttention ? 'animate-spin' : ''}`} />
                  <span>{loadingAttention ? 'Scanning Eyes...' : 'Refresh Attention Data'}</span>
                </button>
              </div>
            </div>

            {/* PoA Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">VERIFIED IMPRESSIONS</div>
                <div className="text-2xl font-black text-white">{(attentionData?.totalVerifiedImpressions ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400 mt-1">100% On-screen Dwell</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">TOTAL STARING SECONDS</div>
                <div className="text-2xl font-black text-emerald-400">
                  {((attentionData?.totalStaringSeconds ?? 0) / 3600).toFixed(1)}k Hours
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Cumulative human engagement</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">QR SCAN CONVERSIONS</div>
                <div className="text-2xl font-black text-cyan-400">
                  {(attentionData?.totalQrConversions ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-cyan-500/80 mt-1">Mobile CTA scans tracked</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">SYBIL FRAUD BLOCK RATE</div>
                <div className="text-2xl font-black text-rose-400">
                  {attentionData?.sybilFraudBlockRate ?? '0.0%'}
                </div>
                <div className="text-[10px] text-rose-500/80 mt-1">Bot / Tab-switch filtered</div>
              </div>
            </div>

            {/* Live PoA Scans & Attention Log */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4 font-bold">SCAN / ATTENTION ID</th>
                    <th className="py-3 px-4 font-bold">SLOT & CITY</th>
                    <th className="py-3 px-4 font-bold">ADVERTISER</th>
                    <th className="py-3 px-4 font-bold">DWELL TIME</th>
                    <th className="py-3 px-4 font-bold">DEVICE HASH</th>
                    <th className="py-3 px-4 font-bold">SAFETY SCORE</th>
                    <th className="py-3 px-4 font-bold">STATUS & TOKENS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {(attentionData?.recentScans || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <div className="font-bold text-white uppercase">Pure Production: No PoA Scans Recorded Yet</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Proof of Attention eyeball telemetry registers in real-time as users watch billboards and mine PoA reward tokens.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (attentionData?.recentScans || []).map((scan: any) => (
                      <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-300">{scan.id}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-cyan-400 rounded font-bold">
                            {scan.cityCode} • {scan.slotId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-bold font-sans">{scan.advertiser}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{scan.dwellSeconds}s</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{scan.uniqueDeviceHash}</td>
                        <td className="py-3 px-4 font-bold">
                          <span className={scan.sybilScore > 90 ? 'text-emerald-400' : 'text-rose-400'}>
                            {scan.sybilScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {scan.status === 'verified_eyeball' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              +15 TOKENS MINTED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                              SYBIL REJECTED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: SOLANA ON-CHAIN SETTLEMENT & TREASURY */}
      {activeAdminSubTab === 'solana' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Solana On-Chain Settlement Ledger & Treasury Monitor</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Autonomous smart contract escrow settlements, SPL-token transfers, and treasury reserve pool overview.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSolanaLedger}
                  disabled={loadingSolana}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loadingSolana ? 'animate-spin' : ''}`} />
                  <span>{loadingSolana ? 'Querying RPC...' : 'Refresh Solana Ledger'}</span>
                </button>
              </div>
            </div>

            {/* Solana Treasury Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">TREASURY SOL BALANCE</div>
                <div className="text-2xl font-black text-cyan-400">{(solanaData?.treasurySol ?? 0).toFixed(2)} SOL</div>
                <div className="text-[10px] text-slate-500 mt-1">Cluster: {solanaData?.solanaCluster || 'mainnet-beta'}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">TREASURY USDC LIQUIDITY</div>
                <div className="text-2xl font-black text-emerald-400">
                  ${(solanaData?.treasuryUsdc ?? 0).toLocaleString()} USDC
                </div>
                <div className="text-[10px] text-emerald-500/80 mt-1">Instant withdrawal escrow</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">TOTAL ESCROW VOLUME</div>
                <div className="text-2xl font-black text-purple-400">
                  ${(solanaData?.totalEscrowVolumeUsdc ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-purple-500/80 mt-1">Lifetime slot settlements</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">SLOTS SETTLED ON-CHAIN</div>
                <div className="text-2xl font-black text-white">
                  {(solanaData?.totalSlotsSettledOnChain ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Verified on-chain</div>
              </div>
            </div>

            {/* On-Chain Transactions Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4 font-bold">TX SIGNATURE</th>
                    <th className="py-3 px-4 font-bold">SLOT & CITY</th>
                    <th className="py-3 px-4 font-bold">ADVERTISER</th>
                    <th className="py-3 px-4 font-bold">SETTLEMENT VALUE</th>
                    <th className="py-3 px-4 font-bold">CREATOR (80%) WALLET</th>
                    <th className="py-3 px-4 font-bold">STATUS</th>
                    <th className="py-3 px-4 font-bold text-right">SOLSCAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {(solanaData?.transactions || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <div className="font-bold text-white uppercase">Pure Production: No On-Chain Settlements Recorded Yet</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Solana smart contract escrows execute and log on-chain when winning advertiser bids settle for broadcast rotations.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (solanaData?.transactions || []).map((tx: any) => (
                      <tr key={tx.txSignature} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-cyan-400 select-all">{tx.txSignature}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded font-bold">
                            {tx.cityCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-bold font-sans">{tx.advertiser}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {tx.amountSol} SOL (${tx.amountUsdc.toFixed(2)})
                        </td>
                        <td className="py-3 px-4 text-slate-400 select-all text-[11px]">
                          {tx.creatorPayoutWallet ? `${tx.creatorPayoutWallet.slice(0, 4)}...${tx.creatorPayoutWallet.slice(-4)}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            CONFIRMED
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={tx.solscanUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] font-bold transition-all inline-flex items-center gap-1"
                          >
                            <span>Explorer</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AFFILIATE & AMBASSADOR NETWORK */}
      {activeAdminSubTab === 'affiliates' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Affiliate & Ambassador Referral Network</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Track key influencers, ambassador promotional codes, referred advertiser signups, and automated commission distributions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAffiliates}
                  disabled={loadingAffiliates}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingAffiliates ? 'animate-spin' : ''}`} />
                  <span>{loadingAffiliates ? 'Loading...' : 'Refresh Affiliates'}</span>
                </button>
              </div>
            </div>

            {/* Affiliate Network Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">TOTAL AMBASSADORS</div>
                <div className="text-2xl font-black text-white">{affiliatesData?.totalAmbassadors ?? 0} VIPs</div>
                <div className="text-[10px] text-amber-400 mt-1">Tier 1 Crypto & Esports Creators</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">REFERRED ADVERTISERS</div>
                <div className="text-2xl font-black text-emerald-400">
                  {(affiliatesData?.totalReferredUsers ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-500/80 mt-1">Active verified accounts</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">REFERRED DEPOSIT VOLUME</div>
                <div className="text-2xl font-black text-cyan-400">
                  ${(affiliatesData?.totalReferredVolumeDollars ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-cyan-500/80 mt-1">Token recharges generated</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">COMMISSIONS DISTRIBUTED</div>
                <div className="text-2xl font-black text-purple-400">
                  ${(affiliatesData?.totalCommissionsPaidDollars ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-purple-500/80 mt-1">Paid via Solana smart contract</div>
              </div>
            </div>

            {/* Ambassador Leaderboard Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4 font-bold">AMBASSADOR</th>
                    <th className="py-3 px-4 font-bold">PROMO CODE</th>
                    <th className="py-3 px-4 font-bold">TIER & COMMISSION</th>
                    <th className="py-3 px-4 font-bold">REFERRED USERS</th>
                    <th className="py-3 px-4 font-bold">TOTAL DEPOSITS</th>
                    <th className="py-3 px-4 font-bold">EARNED COMMISSION</th>
                    <th className="py-3 px-4 font-bold text-right">PAYOUT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {(affiliatesData?.ambassadors || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <div className="font-bold text-white uppercase">Pure Production: No Ambassadors Registered Yet</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Influencers and community creators can claim unique promo codes to start earning automated revenue share commissions.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (affiliatesData?.ambassadors || []).map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold">
                          <div className="text-white font-sans text-sm">{a.name}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{a.handle}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-700/80 rounded-lg text-xs font-black select-all">
                            {a.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-purple-300 font-bold">{a.tier}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                          {a.referredUsers.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-200">
                          ${a.totalDepositsDollars.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-black text-cyan-400 text-sm">
                          ${a.commissionEarnedDollars.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            AUTO-SOLANA PAID
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: SMART TVS & HARDWARE DISPLAY FLEET */}
      {activeAdminSubTab === 'screens' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Smart TVs & Physical Screen Fleet</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time monitor of connected 4K Smart TVs (Samsung Tizen, LG webOS, FireTV), stage displays, and OBS geofenced billboard feeds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/tv"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl transition-all border border-cyan-500/40 flex items-center gap-1.5"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Open /tv (Smart TV App)</span>
                </a>
                <a
                  href="/pair"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all border border-amber-500/40 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Open /pair (Pairing Portal)</span>
                </a>
                <a
                  href="/screen"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold rounded-xl transition-all border border-purple-500/40 flex items-center gap-1.5"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Open /screen (OBS Feed)</span>
                </a>
                <button
                  onClick={fetchScreens}
                  disabled={loadingScreens}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loadingScreens ? 'animate-spin' : ''}`} />
                  <span>{loadingScreens ? 'Scanning Fleet...' : 'Refresh Fleet'}</span>
                </button>
              </div>
            </div>

            {/* Quick Fleet Metrics with Total Verified Scans */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">TOTAL ACTIVE DISPLAYS</div>
                <div className="text-2xl font-black text-white">{screensList.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">Smart TVs & Geofenced Feeds</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">ONLINE & STREAMING</div>
                <div className="text-2xl font-black text-emerald-400">
                  {screensList.filter(s => s.status === 'online').length}
                </div>
                <div className="text-[10px] text-emerald-500/80 mt-1">Receiving live WS auction frames</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-amber-400 mb-1 flex items-center gap-1.5 font-bold">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>TOTAL VERIFIED SCANS</span>
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {screensList.reduce((acc, s) => acc + (s.totalScans || s.scanCount || s.verifiedVisits || 0), 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-500/80 mt-1">Proof-of-Physical-Presence QR Scans</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-slate-400 mb-1">DEFAULT RESOLUTION</div>
                <div className="text-2xl font-black text-cyan-400">4K Ultra-HD</div>
                <div className="text-[10px] text-cyan-500/80 mt-1">3840x2160 / 60 FPS HDR Ready</div>
              </div>
            </div>

            {/* Display Fleet Table */}
            {screensList.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-12 text-center space-y-4">
                <Tv className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No Physical Displays Paired Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                    Launch the Smart TV app at <code className="text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded font-mono">/tv</code> on any TV display to generate an instant 6-digit PIN, then enter it on <code className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded font-mono">/pair</code> to link the screen with your venue name & Solana payout wallet.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href="/tv"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 transition-all flex items-center gap-2"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Launch Smart TV (/tv)</span>
                  </a>
                  <a
                    href="/pair"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Pairing Portal (/pair)</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-bold">DEVICE / PIN</th>
                      <th className="py-3 px-4 font-bold">VENUE NAME</th>
                      <th className="py-3 px-4 font-bold">CITY GEOFENCE</th>
                      <th className="py-3 px-4 font-bold">STATUS</th>
                      <th className="py-3 px-4 font-bold">LIVE AD STREAMING</th>
                      <th className="py-3 px-4 font-bold text-amber-400">VERIFIED QR SCANS</th>
                      <th className="py-3 px-4 font-bold">SOLANA PAYOUT</th>
                      <th className="py-3 px-4 font-bold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {screensList.map((screen) => (
                      <tr key={screen.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-black text-sm">
                              {screen.formattedPin || 'LIVE'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans">{screen.deviceType}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-white font-bold font-sans">{screen.venueName}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold">
                            {screen.cityCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            screen.status === 'online'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${screen.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            {screen.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-sans max-w-[200px] truncate" title={screen.activeAd}>
                          {screen.activeAd || 'Fallback House Ad'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 font-bold font-mono text-xs">
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                            <span>{(screen.totalScans || screen.scanCount || screen.verifiedVisits || 0).toLocaleString()} Scans</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {screen.solanaWallet ? `${screen.solanaWallet.slice(0, 4)}...${screen.solanaWallet.slice(-4)}` : '70% Rev-Share'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {screen.pin ? (
                            <button
                              onClick={() => handleEjectScreen(screen.pin)}
                              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                            >
                              Unpair / Eject
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-sans">Geofenced Room</span>
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

      {/* SUB-TAB: FALLBACK HOUSE ADS & BRAND ASSETS */}
      {activeAdminSubTab === 'house_ads' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl border border-fuchsia-500/40">
                    <Image className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Fallback House Ads & Brand Assets Catalog</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload and manage default fallback media rendered whenever a billboard slot has no competing real-time advertiser bids.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload New Fallback House Ad Form */}
            <form onSubmit={handleCreateHouseAd} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Upload className="w-4 h-4" />
                <span>Upload & Register New Fallback Billboard Media</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">CAMPAIGN / BRAND TITLE</label>
                  <input
                    type="text"
                    value={newHouseAdTitle}
                    onChange={(e) => setNewHouseAdTitle(e.target.value)}
                    placeholder="e.g. Save The Rainforest: 10,000 Trees"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">TARGET CITY</label>
                  <select
                    value={newHouseAdCity}
                    onChange={(e) => setNewHouseAdCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="GLOBAL">🌐 GLOBAL (All Cities)</option>
                    <option value="TYO">Tokyo (TYO)</option>
                    <option value="NYC">New York (NYC)</option>
                    <option value="LON">London (LON)</option>
                    <option value="SIN">Singapore (SIN)</option>
                    <option value="KUL">Kuala Lumpur (KUL)</option>
                    <option value="SYD">Sydney (SYD)</option>
                    <option value="BER">Berlin (BER)</option>
                    <option value="DXB">Dubai (DXB)</option>
                    <option value="PAR">Paris (PAR)</option>
                    <option value="SEO">Seoul (SEO)</option>
                    <option value="SFO">San Francisco (SFO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">CATEGORY</label>
                  <select
                    value={newHouseAdCategory}
                    onChange={(e) => setNewHouseAdCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="brand">Brand Announcement</option>
                    <option value="public_service">Public Service</option>
                    <option value="gaming">Gaming & Esports</option>
                    <option value="crypto">Web3 & Crypto</option>
                    <option value="event">Live Event / Concert</option>
                  </select>
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-[11px] text-slate-400 font-mono mb-1">IMAGE OR 4K VIDEO URL</label>
                  <input
                    type="url"
                    value={newHouseAdUrl}
                    onChange={(e) => setNewHouseAdUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or direct video link"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={creatingHouseAd}
                    className="w-full py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{creatingHouseAd ? 'Adding...' : 'Add & Make Active'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* House Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {houseAdsList.map((ad) => {
                const isCurrentGlobal = settings.houseAdTitle === ad.title;
                return (
                  <div key={ad.id} className={`bg-slate-950 border rounded-2xl overflow-hidden flex flex-col transition-all ${
                    isCurrentGlobal ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}>
                    <div className="relative h-44 bg-slate-900 overflow-hidden group">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-900/90 text-cyan-400 border border-cyan-800/80 rounded text-[10px] font-mono font-bold">
                          {ad.targetCityCode || 'GLOBAL'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-900/90 text-slate-300 border border-slate-700 rounded text-[10px] font-sans">
                          {ad.category || 'brand'}
                        </span>
                      </div>

                      {isCurrentGlobal && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-cyan-500 text-slate-950 font-black text-[10px] rounded-full shadow">
                          LIVE FALLBACK
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">{ad.title}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {ad.id}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => handleSetLiveHouseAd(ad)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrentGlobal
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 pointer-events-none'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold'
                          }`}
                        >
                          {isCurrentGlobal ? 'Active Fallback' : 'Set As Live Fallback'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHouseAd(ad.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Asset"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Global Safety Confirmation Modal for Destructive & Modifying Admin Actions */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <div className="flex items-start gap-3.5 mb-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                confirmDialog.confirmVariant === 'danger'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : confirmDialog.confirmVariant === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : confirmDialog.confirmVariant === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-white tracking-tight">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                disabled={confirmDialog.isLoading}
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmDialog.isLoading}
                onClick={() => confirmDialog.onConfirm()}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 ${
                  confirmDialog.confirmVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : confirmDialog.confirmVariant === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                      : confirmDialog.confirmVariant === 'success'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/30'
                }`}
              >
                {confirmDialog.isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmDialog.isLoading ? 'Processing...' : confirmDialog.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
