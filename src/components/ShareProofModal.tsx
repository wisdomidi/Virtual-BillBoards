import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Send,
  Linkedin,
  Smartphone,
  ShieldCheck,
  Tv
} from 'lucide-react';
import { ActiveBillboardSlot } from '../types';

interface ShareProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotData: ActiveBillboardSlot | null;
  selectedCity: string;
  selectedCityName?: string;
  cityName?: string;
  addToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const ShareProofModal: React.FC<ShareProofModalProps> = ({
  isOpen,
  onClose,
  slotData,
  selectedCity,
  selectedCityName,
  cityName,
  addToast
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  if (!isOpen) return null;

  const currentCity = selectedCityName || cityName || selectedCity || 'Tokyo Shibuya';
  const winningAd = slotData?.winningAd;
  const adTitle = winningAd?.title || 'Virtual Billboard Campaign';
  const advertiserName = winningAd?.advertiserName || 'Advertiser';
  const imageUrl = winningAd?.imageUrl || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200';
  const bidDollars = winningAd?.bidAmountCents ? (winningAd.bidAmountCents / 100).toFixed(2) : '1.00';

  const liveUrl = `https://www.livebillboards.lol/?city=${selectedCity}`;
  const rawPostText = `🔥 My ad "${adTitle}" is broadcasting LIVE on the 24/7 Virtual Billboard in ${currentCity}! 🚀\n\nTop Bid: $${bidDollars} USD\nWatch the live screen stream 🔴👇\n${liveUrl}\n\n#VirtualBillboard #DOOH #DigitalAdvertising #LiveTakeover`;

  // Social Share URLs
  const tweetText = encodeURIComponent(rawPostText);
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`🔥 Just took over the 24/7 Virtual Billboard in ${currentCity}! 🚀\n\n"${adTitle}" is broadcasting live now:\n${liveUrl}`)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(liveUrl)}&text=${encodeURIComponent(`🔥 Just took over the 24/7 Virtual Billboard in ${currentCity} with "${adTitle}"!`)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(liveUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl).then(() => {
      setCopiedLink(true);
      if (addToast) addToast('success', 'Live Link Copied!', 'Share link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyTweetText = () => {
    navigator.clipboard.writeText(rawPostText).then(() => {
      setCopiedText(true);
      if (addToast) addToast('success', 'Viral Caption Copied!', 'Paste directly into Twitter/X, TikTok, LinkedIn, or Instagram.');
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  // Native Device Share (iOS / Android / macOS sheet for TikTok, Instagram Stories, Messages, etc.)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Virtual Billboard Live Takeover — ${currentCity}`,
          text: `🔥 "${adTitle}" is broadcasting LIVE on the 24/7 Virtual Billboard in ${currentCity}!`,
          url: liveUrl
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // High-Resolution 1280x720 Canvas-rendered Proof Certificate with Watermark
  const handleDownloadProofImage = async () => {
    setIsGeneratingProof(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Dark Neon Bezel Background
      const bgGradient = ctx.createLinearGradient(0, 0, 1280, 720);
      bgGradient.addColorStop(0, '#030712');
      bgGradient.addColorStop(0.5, '#0b1329');
      bgGradient.addColorStop(1, '#020617');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1280, 720);

      // Ambient Neon Cyberpunk Glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 35;
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 1180, 620);
      ctx.shadowBlur = 0;

      // 2. Load Ad Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = imageUrl;
      });

      // Draw Main Ad Creative
      try {
        if (img.width > 0 && img.height > 0) {
          ctx.drawImage(img, 60, 100, 1160, 500);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(60, 100, 1160, 500);
        }
      } catch {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(60, 100, 1160, 500);
      }

      // 3. Top HUD Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
      ctx.fillRect(60, 60, 1160, 42);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(85, 81, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`VERIFIED BROADCAST • [${selectedCity}] ${currentCity.toUpperCase()}`, 105, 87);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`15s AIRTIME • $${bidDollars} USD • LIVE NETWORK`, 800, 87);

      // 4. Bottom Title & Watermark
      ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
      ctx.fillRect(60, 550, 1160, 50);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#ffffff';
      const truncatedTitle = adTitle.length > 55 ? adTitle.substring(0, 53) + '...' : adTitle;
      ctx.fillText(truncatedTitle, 85, 582);

      // 5. Watermark Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.roundRect(830, 615, 380, 42, 10);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🌐 Live Stream: www.livebillboards.lol', 850, 641);

      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `LiveBillboard-Proof-${selectedCity}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      if (addToast) addToast('success', 'Proof Card Downloaded!', 'High-resolution verified certificate saved.');
    } catch (e) {
      console.error('Failed to generate proof image:', e);
    } finally {
      setIsGeneratingProof(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-md">
                <Share2 className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Live Ad Takeover Proof Card</h3>
                <p className="text-xs text-slate-400">Share your live broadcast across social media & messaging</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social Proof Card Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-3 space-y-2.5">
            {/* Top Billboard Bezel Badge */}
            <div className="flex items-center justify-between text-[11px] font-mono px-1">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>BROADCASTING LIVE</span>
              </span>
              <span className="text-cyan-400 font-bold">[{selectedCity}] {currentCity}</span>
            </div>

            {/* Simulated Live Billboard Screen */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
              <img
                src={imageUrl}
                alt={adTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40" />

              {/* Live Overlay Branding */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold">
                Virtual BillBoard • 24/7 Live
              </div>

              <div className="absolute bottom-2 inset-x-2 flex items-end justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-black text-white text-xs sm:text-sm line-clamp-1 drop-shadow-md">
                    {adTitle}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    By <strong className="text-cyan-300">{advertiserName}</strong> • ${bidDollars}
                  </div>
                </div>

                <div className="px-2 py-1 bg-amber-400 text-slate-950 font-black font-mono text-[10px] rounded shadow-lg">
                  15s ROTATION
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Social Media Sharing Grid */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              1-Click Viral Social Sharing
            </div>

            {/* Primary Sharing Channels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Twitter / X */}
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center"
              >
                <span className="text-sm font-black text-white">𝕏</span>
                <span className="text-[10px] font-bold text-slate-300">Twitter / X</span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center text-emerald-400"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300">WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/50 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center text-sky-400"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-bold text-sky-300">Telegram</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center text-blue-400"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-300">LinkedIn</span>
              </a>
            </div>

            {/* Quick Actions: Download PNG, Native Share, Copy Link, Copy Caption */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleDownloadProofImage}
                disabled={isGeneratingProof}
                className="py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingProof ? 'Generating...' : 'Download Proof PNG'}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator ? (
                <button
                  onClick={handleNativeShare}
                  className="py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Share (TikTok / IG)</span>
                </button>
              ) : (
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Live Link'}</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Stream Link'}</span>
              </button>

              <button
                onClick={handleCopyTweetText}
                className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedText ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3 text-purple-400" />}
                <span>{copiedText ? 'Caption Copied!' : 'Copy Viral Caption'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

