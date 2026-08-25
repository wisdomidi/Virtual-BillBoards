import React, { useState } from 'react';
import { TabType, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Monitor,
  Tv,
  Zap,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  Megaphone,
  Coins,
  Plus,
  Wifi,
  Crown,
  ExternalLink
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
  onOpenMyAdsModal?: () => void;
  onOpenClaimModal?: () => void;
  walletBalanceDollars?: string;
  tokensBalance?: number;
  currentUser?: { uid: string; email: string; displayName: string; role: UserRole } | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

const TOP_CITIES_LIST = [
  { code: 'GLOBAL', name: 'Global Earth Network', flag: '🌍', country: 'ALL' },
  { code: 'ISS', name: 'ISS Space Station Orbit', flag: '🛰️', country: 'SPACE' },
  { code: 'MARS', name: 'Mars Colony Alpha', flag: '🚀', country: 'SPACE' },
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
  { code: 'LOS', name: 'Lagos Victoria Island', flag: '🇳🇬', country: 'NG' },
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
  isConnected,
  selectedCity,
  onCityChange,
  onOpenWalletModal,
  onOpenMyAdsModal,
  onOpenClaimModal,
  walletBalanceDollars = '0.00',
  tokensBalance = 0,
  currentUser,
  onOpenAuthModal,
  onSignOut
}) => {
  const [showCityMenu, setShowCityMenu] = useState(false);

  const currentCityObj = TOP_CITIES_LIST.find((c) => c.code === selectedCity.toUpperCase()) || TOP_CITIES_LIST[0];

  // Core Live Real-Time Interactive Tabs ONLY (Secondary pages live cleanly in the footer)
  const coreTabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'live', label: 'Live Billboard', icon: Monitor },
    { id: 'streamer', label: 'Streamer Hub', icon: Tv },
    { id: 'watcher', label: 'Watcher Earn Hub', icon: Sparkles }
  ];

  if (userRole === 'admin' || currentUser?.role === 'admin') {
    coreTabs.unshift({ id: 'admin', label: 'Admin Panel', icon: Crown });
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 text-white shadow-xl">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Brand Title */}
          <BrandLogo
            size="md"
            showText={true}
            showSubtitle={true}
            onClick={() => {
              setActiveTab('live');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
              }
            }}
          />

          {/* Right Action Controls: Ad Wallet, My Ads, Claim @Handle, Sign In */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Ad Wallet Top-Up Button */}
            <button
              id="navbar-arcade-token-wallet-btn"
              onClick={onOpenWalletModal}
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 hover:from-amber-500/25 hover:to-emerald-500/25 border border-amber-500/40 rounded-xl text-xs font-mono font-bold text-amber-300 transition-all flex items-center gap-1.5 shadow-sm group cursor-pointer"
              title="Arcade Tokens & Ad Wallet ($1 = 1,000 Tokens)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-left hidden xs:block">
                <div className="text-[9px] text-amber-400 uppercase font-sans tracking-wider leading-none flex items-center gap-1 font-extrabold">
                  <span>Wallet</span>
                </div>
                <div className="text-xs font-black text-white flex items-baseline gap-1">
                  <span className="text-amber-400 font-mono">{(tokensBalance ?? 0).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-normal">(${(walletBalanceDollars || '0.00')})</span>
                </div>
              </div>
              <span className="bg-amber-400 text-slate-950 p-1 rounded-lg group-hover:bg-amber-300 transition-colors">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            </button>

            {/* My Placed Ads */}
            {onOpenMyAdsModal && (
              <button
                id="navbar-my-ads-btn"
                onClick={onOpenMyAdsModal}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="View My Placed Ads & Live Status"
              >
                <Megaphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">My Ads</span>
              </button>
            )}

            {/* Claim Personal Handle */}
            {onOpenClaimModal && (
              <button
                id="navbar-claim-username-btn"
                onClick={onOpenClaimModal}
                className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-300 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer group shrink-0"
                title="Claim Your Live Billboard Handle (80% Payout)"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform shrink-0" />
                <span className="font-extrabold text-[11px] sm:text-xs">Claim @Handle</span>
              </button>
            )}

            {/* Auth / Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-[10px] shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-[11px] text-slate-200 font-bold hidden md:inline truncate max-w-[90px]">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1.5 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean, Streamlined Navigation Bar */}
        <nav className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/60 pt-2">
          {coreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Dedicated Live Preview Button Next to Core Tabs */}
          <button
            onClick={() => {
              const previewUrl = `/?mode=screen_only&city=${selectedCity}`;
              window.open(previewUrl, '_blank');
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 shadow-sm group ml-auto sm:ml-2"
            title="Open Pure Standalone Live Billboard Screen in New Tab for Events, TVs & Stages"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Preview</span>
            <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </nav>
      </div>
    </header>
  );
};
