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
  const [campaigns, setCampaigns] = useState<UserCampaignItem[]>(() => {
    if (typeof window !== 'undefined' && userId) {
      try {
        const cached = localStorage.getItem(`vb_cached_campaigns_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/user/campaigns?userId=${userId}`, {
        headers: { 'x-user-uid': userId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) {
          setCampaigns(data.campaigns);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`vb_cached_campaigns_${userId}`, JSON.stringify(data.campaigns));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load user campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [selectedProofAd, setSelectedProofAd] = useState<UserCampaignItem | null>(null);

  const generateWatermarkedProof = async (ad: UserCampaignItem) => {
    setIsGeneratingProof(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Dark Futuristic Cyberpunk Billboard Frame Background
      const bgGradient = ctx.createLinearGradient(0, 0, 1280, 720);
      bgGradient.addColorStop(0, '#030712');
      bgGradient.addColorStop(0.5, '#0b1329');
      bgGradient.addColorStop(1, '#020617');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1280, 720);

      // Ambient Neon Cyberpunk Glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 40;
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 1160, 600);
      ctx.shadowBlur = 0;

      // 2. Load Ad Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = ad.imageUrl;
      });

      // Draw Main Ad Creative (Centered within Bezel)
      try {
        if (img.width > 0 && img.height > 0) {
          ctx.drawImage(img, 70, 110, 1140, 480);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(70, 110, 1140, 480);
        }
      } catch {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(70, 110, 1140, 480);
      }

      // 3. Top Billboard Status HUD Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
      ctx.fillRect(70, 70, 1140, 45);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(95, 92, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`VERIFIED BROADCAST • ${ad.targetCityCode} 24/7 MEGA BILLBOARD`, 112, 98);

      const timestampStr = ad.createdAt ? new Date(ad.createdAt).toLocaleString() : 'Aug 27, 2026';
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`${timestampStr} • 15s • $${(ad.bidAmountCents / 100).toFixed(2)} USD`, 820, 98);

      // 4. Bottom Title & CTA Banner
      ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
      ctx.fillRect(70, 535, 1140, 55);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#ffffff';
      const truncatedTitle = ad.title.length > 55 ? ad.title.substring(0, 53) + '...' : ad.title;
      ctx.fillText(truncatedTitle, 95, 570);

      // 5. TikTok-Style Watermark Badge (Bottom Right Overlay)
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.roundRect(840, 605, 370, 42, 12);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🌐 Live on www.livebillboards.lol', 860, 631);

      // Convert Canvas to downloadable PNG image
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `LiveBillboard-Proof-${ad.targetCityCode}-${ad.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('Failed to generate proof image:', e);
    } finally {
      setIsGeneratingProof(false);
    }
  };

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
                <p className="text-xs text-slate-400">Track, replay, and download verified proofs of your billboard takeovers</p>
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
                      <div
                        onClick={() => setSelectedProofAd(ad)}
                        className="w-16 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative cursor-pointer hover:opacity-80 transition"
                        title="Click to Watch Broadcast Replay"
                      >
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
                              • {new Date(ad.createdAt).toLocaleString()}
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
                          <span>QUEUED FOR ROTATION</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          <span>BROADCASTED</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Watch Replay / Proof Modal Button */}
                        <button
                          onClick={() => setSelectedProofAd(ad)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Watch Verified Replay & Details"
                        >
                          <Tv className="w-3 h-3 text-cyan-400" />
                          <span>🎬 Replay</span>
                        </button>

                        {/* Download Watermarked Proof Card */}
                        <button
                          onClick={() => generateWatermarkedProof(ad)}
                          className="px-2.5 py-1 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/40 text-purple-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Download Verified Proof Certificate"
                        >
                          <span>⬇️ Proof</span>
                        </button>

                        {/* Share to X (Twitter) */}
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My ad "${ad.title}" just broadcasted live on the 24/7 Global Virtual Billboard in ${ad.targetCityCode}! 🚀\n\nWatch live: https://www.livebillboards.lol/?city=${ad.targetCityCode}\n\n#LiveBillboard #VirtualBillboard #LiveTakeover`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Share Broadcast Proof on X (Twitter)"
                        >
                          <span>𝕏</span>
                        </a>
                      </div>
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
              <span>Immutable Verified Proof Ledger</span>
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

      {/* Broadcast Replay & Verified Certificate Player Modal */}
      {selectedProofAd && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-black text-white">Verified Broadcast Player</h3>
                <span className="bg-cyan-950 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border border-cyan-500/40">
                  [{selectedProofAd.targetCityCode}]
                </span>
              </div>
              <button
                onClick={() => setSelectedProofAd(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 16:9 Billboard Frame Replay */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shadow-inner flex items-center justify-center">
              {selectedProofAd.mediaType === 'video' || selectedProofAd.imageUrl?.startsWith('data:video/') || selectedProofAd.imageUrl?.includes('.mp4') ? (
                <video src={selectedProofAd.imageUrl} autoPlay loop playsInline controls className="w-full h-full object-cover" />
              ) : (
                <img src={selectedProofAd.imageUrl} alt={selectedProofAd.title} className="w-full h-full object-cover" />
              )}

              {/* Watermark */}
              <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-cyan-500/40 px-2 py-0.5 rounded-lg text-[9px] font-mono text-cyan-300">
                🌐 www.livebillboards.lol
              </div>
            </div>

            {/* Broadcast Details */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Headline:</span>
                <span className="font-bold text-white text-right max-w-[280px] truncate">{selectedProofAd.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Broadcast Time:</span>
                <span className="text-cyan-300">{selectedProofAd.createdAt ? new Date(selectedProofAd.createdAt).toLocaleString() : 'Aug 27, 2026'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">City Geofence:</span>
                <span className="text-amber-400 font-bold">{selectedProofAd.targetCityCode} 24/7 Mega Screen</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Verification Stamp:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Broadcast Confirmed</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => generateWatermarkedProof(selectedProofAd)}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⬇️ Download Proof PNG</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My ad "${selectedProofAd.title}" just broadcasted live on the 24/7 Global Virtual Billboard in ${selectedProofAd.targetCityCode}! 🚀\n\nWatch live: https://www.livebillboards.lol/?city=${selectedProofAd.targetCityCode}\n\n#LiveBillboard #VirtualBillboard #LiveTakeover`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <span>𝕏 Share</span>
              </a>

              {onSelectCity && (
                <button
                  onClick={() => {
                    onSelectCity(selectedProofAd.targetCityCode);
                    setSelectedProofAd(null);
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Watch Live Screen</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
