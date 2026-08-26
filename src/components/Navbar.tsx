import React, { useState } from 'react';
import { TabType, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Monitor,
  Tv,
  Sparkles,
  LogIn,
  LogOut,
  Megaphone,
  Coins,
  Plus,
  Crown,
  ExternalLink,
  Bot,
  Menu,
  X
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

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  isConnected,
  selectedCity,
  onOpenWalletModal,
  onOpenMyAdsModal,
  onOpenClaimModal,
  walletBalanceDollars = '0.00',
  tokensBalance = 0,
  currentUser,
  onOpenAuthModal,
  onSignOut
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const coreTabs: Array<{ id: TabType; label: string; mobileLabel: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'live', label: 'Live Billboard', mobileLabel: 'Live', icon: Monitor },
    { id: 'webmcp', label: '🤖 WebMCP', mobileLabel: 'WebMCP', icon: Bot },
    { id: 'streamer', label: 'Streamer Hub', mobileLabel: 'Stream', icon: Tv },
    { id: 'watcher', label: 'Watch & Earn', mobileLabel: 'Earn', icon: Sparkles }
  ];

  if (userRole === 'admin' || currentUser?.role === 'admin') {
    coreTabs.unshift({ id: 'admin', label: 'Admin', mobileLabel: 'Admin', icon: Crown });
  }

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 text-white shadow-xl">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">

          {/* Top Row: Logo + Actions */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo */}
            <BrandLogo
              size="md"
              showText={true}
              showSubtitle={false}
              onClick={() => {
                setActiveTab('live');
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/');
                }
              }}
            />

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Wallet — always visible */}
              <button
                id="navbar-arcade-token-wallet-btn"
                onClick={onOpenWalletModal}
                className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/15 to-cyan-500/15 hover:from-amber-500/25 hover:to-emerald-500/25 border border-amber-500/40 rounded-xl text-xs font-mono font-bold text-amber-300 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Ad Wallet"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="hidden xs:block text-left leading-tight">
                  <div className="text-[9px] text-amber-400 uppercase font-sans tracking-wider font-extrabold">Wallet</div>
                  <div className="text-[11px] font-black text-white">
                    <span className="text-amber-400 font-mono">{(tokensBalance ?? 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">(${walletBalanceDollars})</span>
                  </div>
                </div>
                <span className="bg-amber-400 text-slate-950 p-1 rounded-lg shrink-0">
                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </button>

              {/* My Ads — sm+ only */}
              {onOpenMyAdsModal && (
                <button
                  id="navbar-my-ads-btn"
                  onClick={onOpenMyAdsModal}
                  className="hidden sm:flex px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all items-center gap-1.5 cursor-pointer"
                  title="My Placed Ads"
                >
                  <Megaphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>My Ads</span>
                </button>
              )}

              {/* Claim Handle — md+ only */}
              {onOpenClaimModal && (
                <button
                  id="navbar-claim-username-btn"
                  onClick={onOpenClaimModal}
                  className="hidden md:flex px-2.5 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-300 transition-all items-center gap-1.5 cursor-pointer"
                  title="Claim @Handle"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Claim @Handle</span>
                </button>
              )}

              {/* Auth Profile / Sign In */}
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <div className="hidden sm:flex bg-slate-950 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-xl items-center gap-2 shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500 flex items-center justify-center font-black text-slate-950 text-[11px] shadow-sm shrink-0">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
                    </div>
                    <div className="text-left leading-none">
                      <div className="text-[11px] text-white font-bold truncate max-w-[85px]">
                        {currentUser.displayName || currentUser.email?.split('@')[0]}
                      </div>
                      <div className="text-[9px] text-cyan-400 font-mono font-extrabold uppercase mt-0.5">
                        {currentUser.role || 'Advertiser'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="px-2 sm:px-2.5 py-1.5 bg-slate-950 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-700/80 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Sign Out of Account"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden md:inline text-[11px]">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02]"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile hamburger — shows My Ads + Claim Handle + Sign Out */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-all cursor-pointer"
                aria-label="More options"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown for My Ads + Claim Handle + Mobile Auth */}
          {showMobileMenu && (
            <div className="sm:hidden border-t border-slate-800/60 py-2.5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-wrap gap-2">
                {onOpenMyAdsModal && (
                  <button
                    onClick={() => { onOpenMyAdsModal(); setShowMobileMenu(false); }}
                    className="flex-1 min-w-[120px] px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
                    My Placed Ads
                  </button>
                )}
                {onOpenClaimModal && (
                  <button
                    onClick={() => { onOpenClaimModal(); setShowMobileMenu(false); }}
                    className="flex-1 min-w-[120px] px-3 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Claim @Handle (80%)
                  </button>
                )}
              </div>
              {currentUser && (
                <button
                  onClick={() => { onSignOut?.(); setShowMobileMenu(false); }}
                  className="w-full py-2 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out ({currentUser.displayName || currentUser.email?.split('@')[0]})</span>
                </button>
              )}
            </div>
          )}

          {/* Desktop Tab Bar — hidden on mobile (use bottom bar instead) */}
          <nav className="hidden sm:flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/60 pt-2">
            {coreTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => window.open(`/?mode=screen_only&city=${selectedCity}`, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 ml-auto"
              title="Open standalone live billboard"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Preview</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar — fixed to bottom, only sm- */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/98 backdrop-blur-md border-t border-slate-800">
        <div className="flex items-stretch" style={{ height: '56px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {coreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                  isActive ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className={isActive ? 'text-cyan-300' : 'text-slate-500'}>{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
