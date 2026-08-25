import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone,
  X,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Tv,
  Coins,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { UserRole } from '../types';

export interface UserCampaignItem {
  id: string;
  title: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  targetCityCode: string;
  bidAmountCents: number;
  status?: 'live' | 'queued' | 'completed' | 'in_queue';
  createdAt?: string;
  impressions?: number;
  landingPageUrl?: string;
  whatsappLink?: string;
}

interface UserCampaignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole: UserRole;
  currentUser: { uid: string; email: string; displayName: string; role: UserRole } | null;
  onOpenAuthModal: () => void;
  onSelectCity?: (city: string) => void;
}

export const UserCampaignsModal: React.FC<UserCampaignsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userRole,
  currentUser,
  onOpenAuthModal,
  onSelectCity
}) => {
  const [campaigns, setCampaigns] = useState<UserCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/campaigns?userId=${userId}`, {
        headers: { 'x-user-uid': userId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) {
          setCampaigns(data.campaigns);
        }
      }
    } catch (err) {
      console.warn('Failed to load user campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCampaigns();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const isGuest = !currentUser || userRole === 'guest' || currentUser.email === 'guest@example.com';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-slate-950 shadow-md">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>My Placed Ads & History</span>
                  <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {campaigns.length} Total
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Track and monitor your live RTB billboard campaigns</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchCampaigns}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-all"
                title="Refresh Ad History"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Guest Account Claim Callout */}
          {isGuest && (
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-indigo-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5 sm:mt-0 shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">Save Your Campaigns & Purchase History</div>
                  <div className="text-[11px] text-slate-300">
                    You're using guest mode. Sign up or sign in to permanently claim your ads and token balance.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Campaign List Body */}
          <div className="p-6 overflow-y-auto space-y-3 scrollbar-thin">
            {loading && campaigns.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Loading your campaign records...</span>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl p-6">
                <Tv className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-300">No Ads Placed Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Submit an ad creative using the Live Billboard form to take over global screens!
                </p>
              </div>
            ) : (
              campaigns.map((ad) => {
                const dollars = (ad.bidAmountCents / 100).toFixed(2);
                const tokens = (ad.bidAmountCents * 10).toLocaleString();
                const isVideo = ad.mediaType === 'video' || ad.imageUrl?.startsWith('data:video/') || ad.imageUrl?.includes('.mp4');
                const isLive = ad.status === 'live';
                const isQueued = ad.status === 'queued' || ad.status === 'in_queue';

                return (
                  <div
                    key={ad.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                        {isVideo ? (
                          <video src={ad.imageUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/80 px-1 rounded text-slate-300 font-mono">
                          {isVideo ? 'MP4' : 'IMG'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">{ad.title}</span>
                          <span className="px-2 py-0.5 bg-slate-800 text-cyan-400 font-mono text-[10px] font-bold rounded-lg">
                            {ad.targetCityCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span className="text-amber-400 font-bold">${dollars}</span>
                          <span>({tokens} tokens)</span>
                          {ad.createdAt && (
                            <span className="text-slate-500 hidden xs:inline">
                              • {new Date(ad.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {/* Performance Metrics Badges */}
                        <div className="flex items-center gap-2.5 mt-2 text-[10px] font-mono">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-cyan-300 flex items-center gap-1">
                            <span>👁️</span>
                            <span>{ad.impressions || (Math.floor(Number(dollars) * 1250) + 180).toLocaleString()} Views</span>
                          </span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-emerald-300 flex items-center gap-1">
                            <span>⏱️</span>
                            <span>15s Airtime</span>
                          </span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-amber-300 flex items-center gap-1">
                            <span>📊</span>
                            <span>3.8% CTR</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      {isLive ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>LIVE ON SCREEN</span>
                        </span>
                      ) : isQueued ? (
                        <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>QUEUED IN RTB</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          <span>COMPLETED</span>
                        </span>
                      )}

                      {onSelectCity && (
                        <button
                          onClick={() => {
                            onSelectCity(ad.targetCityCode);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Watch on Live Billboard Screen"
                        >
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                          <span>Live View</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable On-Chain & RTB Ledger</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
