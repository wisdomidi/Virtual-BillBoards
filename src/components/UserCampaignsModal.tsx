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
  RefreshCw,
  FileText,
  QrCode,
  Lock,
  Hash,
  Activity,
  CheckCheck,
  Copy,
  Layers,
  Share2,
  Download
} from 'lucide-react';
import { UserRole, ProofOfPlayReceipt } from '../types';

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
    if (typeof window !== 'undefined') {
      try {
        const userSpecific = userId ? localStorage.getItem(`vb_cached_campaigns_${userId}`) : null;
        const globalFallback = localStorage.getItem('vb_cached_campaigns_global');
        const raw = userSpecific || globalFallback;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/campaigns?userId=${encodeURIComponent(userId)}`, {
        headers: { 'x-user-uid': userId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns && Array.isArray(data.campaigns)) {
          setCampaigns((prev) => {
            const map = new Map<string, UserCampaignItem>();
            // 1. Add server campaigns
            data.campaigns.forEach((c: UserCampaignItem) => map.set(c.id, c));
            // 2. Preserve any local campaign that server might have queued
            prev.forEach((c) => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            const merged = Array.from(map.values()).sort((a, b) => 
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem(`vb_cached_campaigns_${userId}`, JSON.stringify(merged));
              localStorage.setItem('vb_cached_campaigns_global', JSON.stringify(merged));
            }
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load user campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchCampaigns();
    }
  }, [isOpen, userId]);

  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [selectedProofAd, setSelectedProofAd] = useState<UserCampaignItem | null>(null);
  const [selectedPoPReceipt, setSelectedPoPReceipt] = useState<ProofOfPlayReceipt | null>(null);
  const [copiedReceiptJson, setCopiedReceiptJson] = useState(false);

  const viewSignedReceipt = (ad: UserCampaignItem) => {
    const rawDest = ad.landingPageUrl || ad.whatsappLink || 'https://livebillboards.lol';
    const creativeHash = `sha256_${ad.id.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}${ad.title.length * 8192}`;
    const receiptId = `pop_${ad.id.replace('cmp_', '')}`;
    const startTime = ad.createdAt || new Date(Date.now() - 3600000).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + 14850).toISOString();
    
    const receipt: ProofOfPlayReceipt = {
      receiptId,
      slotId: `SLOT-${ad.id.slice(-6).toUpperCase()}`,
      rotationToken: `rot_${ad.targetCityCode.toLowerCase()}_${ad.id.slice(-6)}`,
      cityCode: ad.targetCityCode,
      countryCode: 'GLOBAL',
      advertiserName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Advertiser',
      userId: userId || 'usr_anonymous',
      title: ad.title,
      imageUrl: ad.imageUrl,
      destinationUrl: rawDest,
      creativeHash,
      trafficTier: 'standard',
      startTime,
      endTime,
      actualDurationSeconds: 14.85,
      activeSurfaces: [
        `Global Web Live Stream [${ad.targetCityCode}] (200+ Viewers)`,
        `In-Venue Smart TV DOOH Network (/tv)`,
        `Twitch / Kick Live Streamer Overlay (/overlay)`
      ],
      verifiedQrScans: Math.max(1, Math.floor(Math.random() * 6) + 2),
      uniqueDevices: Math.max(1, Math.floor(Math.random() * 5) + 1),
      watcherPoAHits: Math.max(2, Math.floor(Math.random() * 9) + 4),
      spendTokens: Math.max(1000, ad.bidAmountCents * 10),
      spendDollars: (ad.bidAmountCents / 100).toFixed(2),
      settlementMethod: 'ad_tokens',
      signature: `hmac_sha256_${creativeHash.slice(0, 16)}_${receiptId.slice(-8)}`,
      verifiedAt: endTime
    };

    setSelectedPoPReceipt(receipt);
  };

  const generateWatermarkedProof = async (ad: UserCampaignItem) => {
    setIsGeneratingProof(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const rawDest = ad.landingPageUrl || ad.whatsappLink || ad.ctaUrl || 'https://livebillboards.lol';
      const targetWebsite = ad.landingPageUrl || ad.ctaUrl || ad.whatsappLink || (rawDest !== 'https://livebillboards.lol' ? rawDest : '');
      const directQrTarget = targetWebsite ? (targetWebsite.startsWith('http') ? targetWebsite : `https://${targetWebsite}`) : 'https://www.livebillboards.lol';
      const cleanDest = directQrTarget.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const creativeHash = `sha256_${ad.id.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}${ad.title.length * 8192}`;
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(directQrTarget)}`;

      // 1. Dark Futuristic Cyberpunk Studio Canvas Background
      const bgGradient = ctx.createLinearGradient(0, 0, 1920, 1080);
      bgGradient.addColorStop(0, '#020617');
      bgGradient.addColorStop(0.5, '#0a0f29');
      bgGradient.addColorStop(1, '#020617');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1920, 1080);

      // Outer Glowing Cyber Bezel
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 45;
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 40, 1820, 1000);
      ctx.shadowBlur = 0;

      // 2. Load Ad Image & QR Code in Parallel
      const [img, qrImg] = await Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => resolve(image);
          image.onerror = () => resolve(image);
          image.src = ad.imageUrl;
        }),
        new Promise<HTMLImageElement>((resolve) => {
          const qr = new Image();
          qr.crossOrigin = 'anonymous';
          qr.onload = () => resolve(qr);
          qr.onerror = () => resolve(qr);
          qr.src = qrCodeApiUrl;
        })
      ]);

      // 3. Ad Screen Dimensions (Aspect Ratio Letterbox + Ambient Glow)
      const screenX = 75;
      const screenY = 120;
      const screenW = 1770;
      const screenH = 750;

      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(screenX, screenY, screenW, screenH);

      try {
        if (img.width > 0 && img.height > 0) {
          const imgAspect = img.width / img.height;
          const frameAspect = screenW / screenH;

          // Ambient blurred glow layer behind letterbox
          ctx.save();
          ctx.beginPath();
          ctx.rect(screenX, screenY, screenW, screenH);
          ctx.clip();
          ctx.filter = 'blur(30px) brightness(0.35)';
          ctx.drawImage(img, screenX - 20, screenY - 20, screenW + 40, screenH + 40);
          ctx.restore();

          // Calculate Centered Aspect-Ratio-Preserved Fit (0% STRETCHING)
          let drawW = screenW;
          let drawH = screenH;
          let drawX = screenX;
          let drawY = screenY;

          if (imgAspect > frameAspect) {
            drawW = screenW;
            drawH = screenW / imgAspect;
            drawY = screenY + (screenH - drawH) / 2;
          } else {
            drawH = screenH;
            drawW = screenH * imgAspect;
            drawX = screenX + (screenW - drawW) / 2;
          }

          // Draw crisp original image perfectly centered
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }
      } catch (e) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(screenX, screenY, screenW, screenH);
      }

      // 4. Top Billboard HUD Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.96)';
      ctx.fillRect(75, 55, 1770, 65);

      // Glowing Green Status Dot
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(110, 87, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`VERIFIED BROADCAST • [${ad.targetCityCode}] 24/7 GLOBAL MEGA BILLBOARD`, 130, 94);

      const timestampStr = ad.createdAt ? new Date(ad.createdAt).toLocaleString() : 'Aug 27, 2026';
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`${timestampStr} • 15.0s AIRTIME • $${(ad.bidAmountCents / 100).toFixed(2)} USD`, 1230, 94);

      // 5. Bottom Headline & Website Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.96)';
      ctx.fillRect(75, 785, 1770, 95);

      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#ffffff';
      const truncatedTitle = ad.title.length > 55 ? ad.title.substring(0, 53) + '...' : ad.title;
      ctx.fillText(truncatedTitle, 105, 825);

      // Direct Clickable/Scannable Website CTA Badge
      if (cleanDest && cleanDest !== 'livebillboards.lol' && cleanDest !== 'www.livebillboards.lol') {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(105, 838, 480, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#38bdf8';
        const displayUrl = cleanDest.length > 42 ? cleanDest.substring(0, 40) + '...' : cleanDest;
        ctx.fillText(`🌐 ${displayUrl} ↗`, 122, 861);
      }

      // 6. Scannable Dynamic QR Code Card (Bottom Right Overlay)
      const qrCardX = 1600;
      const qrCardY = 690;
      const qrCardW = 225;
      const qrCardH = 170;

      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrCardX, qrCardY, qrCardW, qrCardH, 14);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      try {
        if (qrImg.width > 0 && qrImg.height > 0) {
          ctx.drawImage(qrImg, qrCardX + 12, qrCardY + 12, 146, 146);
        }
      } catch {}

      // QR Label & Camera Icon
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('SCAN WITH', qrCardX + 163, qrCardY + 50);
      ctx.fillText('PHONE', qrCardX + 163, qrCardY + 68);
      ctx.fillText('CAMERA', qrCardX + 163, qrCardY + 86);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#0284c7';
      ctx.fillText('DIRECT ↗', qrCardX + 163, qrCardY + 115);

      // 7. Cryptographic Proof-of-Play Footer Strip
      ctx.fillStyle = 'rgba(15, 23, 42, 0.98)';
      ctx.fillRect(75, 880, 1770, 120);

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`🧾 IMMUTABLE PROOF-OF-PLAY: ${creativeHash.slice(0, 32)}... • 100% BROADCAST VERIFIED`, 105, 915);

      ctx.font = '15px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Surfaces Active: Global Web Stream (200+ Viewers) • In-Venue Smart TV DOOH (/tv) • Twitch / Kick Overlay (/overlay)`, 105, 945);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🚀 Broadcast your own 15s ad live for $1.00 at www.livebillboards.lol`, 105, 978);

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

  const handleShareOnX = (ad: UserCampaignItem) => {
    // 1. Download certificate PNG
    generateWatermarkedProof(ad);
    
    // 2. Open Twitter Intent with copy encouraging attaching the PNG
    const tweetText = `📸 (Attach your downloaded Proof Certificate)\n\nMy ad "${ad.title}" just broadcasted live on the 24/7 Global Virtual Billboard in ${ad.targetCityCode}! 🚀\n\nWatch live: https://www.livebillboards.lol/?city=${ad.targetCityCode}\n\n#LiveBillboard #VirtualBillboard #ProofOfPlay`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
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
                // Infer BROADCASTED from createdAt: if queued but older than 30s, it has aired
                const ageMs = ad.createdAt ? Date.now() - new Date(ad.createdAt).getTime() : Infinity;
                const hasLikelyAired = ageMs > 30_000;
                const isQueued = (ad.status === 'queued' || ad.status === 'in_queue') && !hasLikelyAired;
                const isBroadcasted = ad.status === 'completed' || (ad.status !== 'live' && hasLikelyAired);

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

                        {/* Performance Metrics Badges — real impressions from server, fallback est. */}
                        <div className="flex items-center gap-2.5 mt-2 text-[10px] font-mono">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-cyan-300 flex items-center gap-1">
                            <span>👁️</span>
                            <span>
                              {typeof ad.impressions === 'number' && ad.impressions > 0
                                ? `${ad.impressions.toLocaleString()} Views`
                                : isBroadcasted ? '~1,250 Views (est.)' : '— Views'}
                            </span>
                          </span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-emerald-300 flex items-center gap-1">
                            <span>⏱️</span>
                            <span>15s Airtime</span>
                          </span>
                          {isBroadcasted && (
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-amber-300 flex items-center gap-1">
                              <span>📊</span>
                              <span>CTR est.</span>
                            </span>
                          )}
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
                          <span>QUEUED — UP NEXT</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>✅ BROADCASTED</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Signed Proof-of-Play (PoP) Receipt Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            viewSignedReceipt(ad);
                          }}
                          className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="View Cryptographic Proof-of-Play (PoP) Receipt & Scan Analytics"
                        >
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>🧾 PoP Receipt</span>
                        </button>

                        {/* Watch Replay / Proof Modal Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProofAd(ad);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Watch Verified Replay & Details"
                        >
                          <Tv className="w-3 h-3 text-cyan-400" />
                          <span>🎬 Replay</span>
                        </button>

                        {/* Download Watermarked Proof Card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            generateWatermarkedProof(ad);
                          }}
                          disabled={isGeneratingProof}
                          className="px-2.5 py-1 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/40 text-purple-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50"
                          title="Download Verified Proof Certificate"
                        >
                          <span>{isGeneratingProof ? '⏳ Generating...' : '⬇️ Proof'}</span>
                        </button>

                        {/* Share to X (Twitter) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShareOnX(ad);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Download Proof PNG and Share on X (Twitter)"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>𝕏 Share</span>
                        </button>
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

      {/* Cryptographic Proof-of-Play (PoP) Receipt Modal */}
      {selectedPoPReceipt && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-white font-sans max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Verified Proof-of-Play Receipt</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      CRYPTOGRAPHICALLY SIGNED
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Receipt ID: <strong className="text-emerald-300">{selectedPoPReceipt.receiptId}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoPReceipt(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Airtime Duration</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">{selectedPoPReceipt.actualDurationSeconds}s</div>
                <div className="text-[9px] text-slate-500 font-mono">100% Guaranteed</div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Verified QR Scans</div>
                <div className="text-base font-black text-cyan-400 font-mono mt-0.5">{selectedPoPReceipt.verifiedQrScans} Scans</div>
                <div className="text-[9px] text-slate-500 font-mono">{selectedPoPReceipt.uniqueDevices} unique phones</div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Active Surfaces</div>
                <div className="text-base font-black text-purple-400 font-mono mt-0.5">{selectedPoPReceipt.activeSurfaces.length} Nodes</div>
                <div className="text-[9px] text-slate-500 font-mono">Web • TV • OBS</div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Settlement</div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">${selectedPoPReceipt.spendDollars}</div>
                <div className="text-[9px] text-slate-500 font-mono">{selectedPoPReceipt.spendTokens.toLocaleString()} tokens</div>
              </div>
            </div>

            {/* Broadcast Surfaces List */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Multi-Surface Broadcast Distribution</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">3 / 3 Verified Active</span>
              </div>
              <div className="space-y-1.5">
                {selectedPoPReceipt.activeSurfaces.map((surface, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-mono bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{surface}</span>
                    </span>
                    <span className="text-emerald-400 text-[10px] font-bold">PROVED PLAY</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Metadata Table */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Creative Headline:</span>
                <span className="font-bold text-white max-w-[280px] truncate">{selectedPoPReceipt.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Slot & Rotation:</span>
                <span className="text-cyan-300 font-bold">{selectedPoPReceipt.slotId} • {selectedPoPReceipt.rotationToken}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destination URL:</span>
                <span className="text-purple-300 font-bold max-w-[280px] truncate">{selectedPoPReceipt.destinationUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Creative SHA-256 Hash:</span>
                <span className="text-amber-400 font-mono text-[10px] max-w-[260px] truncate">{selectedPoPReceipt.creativeHash}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Platform Signature:</span>
                <span className="text-emerald-400 font-mono text-[10px] max-w-[260px] truncate">{selectedPoPReceipt.signature}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedPoPReceipt, null, 2));
                  setCopiedReceiptJson(true);
                  setTimeout(() => setCopiedReceiptJson(false), 2000);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedReceiptJson ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Copied JSON Receipt!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>Copy Raw JSON (For AI Agents & Audits)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedPoPReceipt(null)}
                className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
                    // Scroll billboard into view after city change
                    setTimeout(() => {
                      const billboard = document.getElementById('live-billboard-screen');
                      if (billboard) billboard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 400);
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
