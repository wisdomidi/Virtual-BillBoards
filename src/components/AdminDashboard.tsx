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
  Bell
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
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'settings' | 'creators' | 'overrides' | 'cities' | 'tech_tools'>('settings');
  const [techTool, setTechTool] = useState<'architecture' | 'postgres' | 'redis' | 'cascade' | 'ledger'>('architecture');
  const [creatorFilter, setCreatorFilter] = useState('');

  // Platform Settings State
  const [settings, setSettings] = useState<PlatformSettings>({
    slotDurationSeconds: 15,
    cityReserveFloorCents: 1000,
    countryReserveFloorCents: 500,
    globalReserveFloorCents: 100,
    geminiSafetyThreshold: 70,
    streamerRevSharePercent: 70,
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

  useEffect(() => {
    fetchSettings();
    fetchCities();
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

        {/* Admin Sub-Tabs */}
        <div className="flex space-x-2 border-t border-slate-800/80 pt-4 mt-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'settings', label: '⚙️ Platform Settings & Safety', icon: Settings },
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

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

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Streamer Revenue Share Split (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={settings.streamerRevSharePercent}
                    onChange={(e) => setSettings({ ...settings, streamerRevSharePercent: parseInt(e.target.value) })}
                    className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-emerald-400 font-bold w-12 text-center text-sm">
                    {settings.streamerRevSharePercent}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Percentage of winning CPM bid paid out to streamer broadcasters.</p>
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
                <h3 className="font-bold text-white text-sm">Gemini AI Safety & System Overrides</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">AI & NETWORK</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Gemini Vision AI Safety Threshold (%)
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
