import React, { useState } from 'react';
import { GlobalCityLeaders } from './GlobalCityLeaders';
import { AdLibrary } from './AdLibrary';
import { Trophy, Library, Flame, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface LeaderboardAndCatalogProps {
  selectedCity: string;
  selectedCountry: string;
  onCityChange: (city: string, country: string) => void;
  userRole?: UserRole;
  onOpenWalletModal?: () => void;
  walletBalanceDollars?: string;
  onPlaceBidQuick?: (
    title: string,
    imageUrl: string,
    amountDollars: number,
    cityCode: string,
    countryCode: string,
    landingPageUrl?: string,
    whatsappLink?: string,
    qrCodeUrl?: string,
    mediaType?: 'image' | 'video',
    ctaType?: 'website' | 'whatsapp' | 'none',
    ctaUrl?: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const LeaderboardAndCatalog: React.FC<LeaderboardAndCatalogProps> = ({
  selectedCity,
  selectedCountry,
  onCityChange,
  userRole,
  onOpenWalletModal,
  walletBalanceDollars,
  onPlaceBidQuick
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'leaderboard' | 'catalog'>('leaderboard');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Unified Hero Header & Toggle Switch */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
            {activeSubTab === 'leaderboard' ? (
              <>
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Global Screen Valuations & Leaderboard</span>
              </>
            ) : (
              <>
                <Library className="w-5 h-5 text-cyan-400" />
                <span>Live Winning Ad Archive & Catalog</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            {activeSubTab === 'leaderboard'
              ? 'Real-time slot valuations, top advertisers, and volume across Earth & Space feeds.'
              : 'Browse active campaigns, creative advertisements, and broadcast metrics across all screen networks.'}
          </p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Valuation Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Active Ad Catalog</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'leaderboard' ? (
        <GlobalCityLeaders
          currentSelectedCity={selectedCity}
          onSelectCity={(city, country) => onCityChange(city, country)}
        />
      ) : (
        <AdLibrary
          selectedCity={selectedCity}
          selectedCountry={selectedCountry}
          onCityChange={onCityChange}
          userRole={userRole}
          onOpenWalletModal={onOpenWalletModal}
          walletBalanceDollars={walletBalanceDollars}
          onPlaceBidQuick={onPlaceBidQuick}
        />
      )}
    </div>
  );
};
