import React, { useState } from 'react';
import { TabType, UserRole } from '../types';
import {
  Monitor,
  Tv,
  Library,
  GitBranch,
  Database,
  Zap,
  Layers,
  ShieldCheck,
  Radio,
  Wifi,
  BarChart3,
  Crown,
  Eye,
  Megaphone,
  Wallet,
  Coins,
  Plus,
  Sparkles,
  Globe,
  MapPin,
  ChevronDown,
  LogIn,
  LogOut,
  User as UserIcon,
  Shield,
  Bot,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isConnected: boolean;
  selectedCity: string;
  selectedCountry: string;
  onCityChange: (city: string, country: string) => void;
  onOpenWalletModal?: () => void;
  walletBalanceDollars?: string;
  tokensBalance?: number;
  currentUser?: { uid: string; email: string; displayName: string; role: UserRole } | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

const TOP_CITIES_LIST = [
  { code: 'GLOBAL', name: 'Global Network Feed', flag: '🌍', country: 'ALL' },
  { code: 'TYO', name: 'Tokyo Shibuya', flag: '🇯🇵', country: 'JP' },
  { code: 'NYC', name: 'Times Square NYC', flag: '🇺🇸', country: 'US' },
  { code: 'LON', name: 'London City', flag: '🇬🇧', country: 'UK' },
  { code: 'PAR', name: 'Paris Champs-Élysées', flag: '🇫🇷', country: 'FR' },
  { code: 'KUL', name: 'Kuala Lumpur', flag: '🇲🇾', country: 'MY' },
  { code: 'SIN', name: 'Singapore Marina', flag: '🇸🇬', country: 'SG' },
  { code: 'DXB', name: 'Dubai Downtown', flag: '🇦🇪', country: 'AE' },
  { code: 'SEL', name: 'Seoul Gangnam', flag: '🇰🇷', country: 'KR' },
  { code: 'SYD', name: 'Sydney Harbour', flag: '🇦🇺', country: 'AU' },
  { code: 'YTO', name: 'Toronto Downtown', flag: '🇨🇦', country: 'CA' },
  { code: 'HKG', name: 'Hong Kong Central', flag: '🇭🇰', country: 'HK' },
  { code: 'LAX', name: 'Los Angeles Sunset', flag: '🇺🇸', country: 'US' },
  { code: 'SHA', name: 'Shanghai The Bund', flag: '🇨🇳', country: 'CN' },
  { code: 'BER', name: 'Berlin Alexanderplatz', flag: '🇩🇪', country: 'DE' },
  { code: 'SAO', name: 'São Paulo Paulista', flag: '🇧🇷', country: 'BR' },
  { code: 'BKK', name: 'Bangkok Sukhumvit', flag: '🇹🇭', country: 'TH' },
  { code: 'AMS', name: 'Amsterdam Canal', flag: '🇳🇱', country: 'NL' },
  { code: 'MEX', name: 'Mexico City Zócalo', flag: '🇲🇽', country: 'MX' },
  { code: 'TPE', name: 'Taipei Ximending', flag: '🇹🇼', country: 'TW' },
  { code: 'MUM', name: 'Mumbai Marine Drive', flag: '🇮🇳', country: 'IN' }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  isConnected,
  selectedCity,
  selectedCountry,
  onCityChange,
  onOpenWalletModal,
  walletBalanceDollars = '250.00',
  tokensBalance = 25000,
  currentUser,
  onOpenAuthModal,
  onSignOut
}) => {
  const [showCityMenu, setShowCityMenu] = useState(false);

  const currentCityObj = TOP_CITIES_LIST.find(c => c.code === selectedCity.toUpperCase()) || TOP_CITIES_LIST[0];

  const allTabs: Array<{ id: TabType; label: string; icon: any; roles: UserRole[] }> = [
    { id: 'admin', label: '👑 Admin Control Panel', icon: Crown, roles: ['admin'] },
    { id: 'ai_agents', label: '🤖 AI Agents & M2M Gateway', icon: Bot, roles: ['advertiser', 'admin'] },
    { id: 'api_docs', label: '📖 Developer API Docs', icon: BookOpen, roles: ['guest', 'paid_watcher', 'viewer', 'advertiser', 'streamer', 'admin'] },
    { id: 'watcher', label: '✨ Watcher Earn Hub', icon: Sparkles, roles: ['paid_watcher', 'admin'] },
    { id: 'live', label: '📺 Live Billboard Stream', icon: Monitor, roles: ['guest', 'paid_watcher', 'viewer', 'advertiser', 'admin'] },
    { id: 'ad_library', label: '🖼️ Active Ad Catalog', icon: Library, roles: ['advertiser', 'admin'] },
    { id: 'analytics', label: '📈 City Ad Stats', icon: BarChart3, roles: ['admin'] },
    { id: 'streamer', label: '🎥 Streamer Widget (70% Rev Share)', icon: Tv, roles: ['streamer', 'admin'] },
    { id: 'ledger', label: '💰 Earnings & Payouts', icon: ShieldCheck, roles: ['paid_watcher', 'streamer', 'admin'] },
    { id: 'architecture', label: '📐 How It Works', icon: GitBranch, roles: ['admin'] },
    { id: 'postgres', label: '🗄️ Database Tables', icon: Database, roles: ['admin'] },
    { id: 'redis', label: '⚡ Live Ad Queue', icon: Zap, roles: ['admin'] },
    { id: 'cascade', label: '⚙️ Fallback Rules', icon: Layers, roles: ['admin'] }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(userRole));

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-cyan-500/25">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  World First Virtual Billboard
                </span>
                {/* Global Network Status Badge */}
                <span className="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-inner">
                  <Globe className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
                  <span>GLOBAL CITY FEEDS</span>
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-sans hidden md:block">
                True virtual 24/7 billboard space with real-time global bidding & local city feeds
              </p>
            </div>
          </div>

          {/* City Selector, Wallet & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City Selection Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowCityMenu(!showCityMenu)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-2 shadow-sm"
                title="Select City Geofence Stream"
              >
                <span className="text-sm">{currentCityObj.flag}</span>
                <span className="font-mono text-cyan-400 font-extrabold">{currentCityObj.code}</span>
                <span className="hidden lg:inline text-slate-300">{currentCityObj.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showCityMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showCityMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-400 px-3 py-1 flex items-center justify-between border-b border-slate-800">
                    <span>SELECT CITY STREAM</span>
                    <span className="text-emerald-400 text-[9px]">LIVE FEEDS</span>
                  </div>
                  {TOP_CITIES_LIST.map((c) => {
                    const isSel = selectedCity.toUpperCase() === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          onCityChange(c.code, c.country);
                          setShowCityMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isSel
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <div>
                            <span className="font-bold block leading-tight">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">[{c.code}]</span>
                          </div>
                        </div>
                        {isSel && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Arcade Tokens & Ad Wallet Button */}
            {currentUser && userRole !== 'guest' && (
              <button
                id="navbar-arcade-token-wallet-btn"
                onClick={onOpenWalletModal}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 hover:from-amber-500/25 hover:to-emerald-500/25 border border-amber-500/40 rounded-xl text-xs font-mono font-bold text-amber-300 transition-all flex items-center gap-2 shadow-sm group cursor-pointer"
                title="Arcade Tokens & Ad Wallet (0.1¢ / Play Live RTB)"
              >
                <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="text-left hidden xs:block">
                  <div className="text-[9px] text-amber-400 uppercase font-sans tracking-wider leading-none flex items-center gap-1 font-extrabold">
                    <span>Ad Tokens</span>
                    <span className="text-[8px] bg-amber-950 text-amber-400 px-1 rounded">0.1¢</span>
                  </div>
                  <div className="text-xs font-black text-white flex items-baseline gap-1">
                    <span className="text-amber-400 font-mono">{(tokensBalance ?? 25000).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-normal">(${(walletBalanceDollars || '25.00')})</span>
                  </div>
                </div>
                <span className="bg-amber-400 text-slate-950 p-1 rounded-lg group-hover:bg-amber-300 transition-colors">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </span>
              </button>
            )}

            {/* Real Firebase Authentication & Role-Aware Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Account Profile Badge */}
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-[11px] shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left leading-tight">
                    <div className="font-bold text-slate-200 truncate max-w-[120px]">{currentUser.displayName || currentUser.email}</div>
                    <div className="text-[10px] text-cyan-400 font-mono uppercase font-black">{currentUser.role}</div>
                  </div>
                </div>

                {/* Role Switcher Menu (For role-aware switching) */}
                <select
                  value={userRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setUserRole(r);
                    if (r === 'paid_watcher') setActiveTab('watcher');
                    else if (r === 'guest' || r === 'advertiser') setActiveTab('live');
                    else if (r === 'streamer') setActiveTab('streamer');
                    else if (r === 'admin') setActiveTab('admin');
                  }}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-bold px-2 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  title="Switch Active View Perspective"
                >
                  <option value="advertiser">📢 Advertiser View</option>
                  <option value="streamer">🎥 Streamer View</option>
                  <option value="paid_watcher">✨ Watcher View</option>
                  <option value="guest">👁️ Spectator View</option>
                  <option value="admin">👑 Admin View</option>
                </select>

                <button
                  onClick={onSignOut}
                  className="p-2 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 rounded-xl transition-colors"
                  title="Sign Out of Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

            {/* Live Indicator */}
            <div className={`hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
              isConnected
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                : 'bg-amber-950/80 text-amber-400 border-amber-800/50'
            }`}>
              <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{isConnected ? 'LIVE FEED' : 'CONNECTING'}</span>
            </div>
          </div>
        </div>

        {/* Filtered Dynamic Navigation Bar */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/60 pt-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
