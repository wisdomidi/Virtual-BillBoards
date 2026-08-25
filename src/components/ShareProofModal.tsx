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
  MapPin,
  Flame,
  Radio,
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

  if (!isOpen) return null;

  const currentCity = selectedCityName || cityName || selectedCity || 'Tokyo Shibuya';
  const winningAd = slotData?.winningAd;
  const adTitle = winningAd?.title || 'Virtual Billboard Campaign';
  const advertiserName = winningAd?.advertiserName || 'Advertiser';
  const imageUrl = winningAd?.imageUrl || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200';
  const bidDollars = winningAd?.bidAmountCents ? (winningAd.bidAmountCents / 100).toFixed(2) : '25.00';

  const liveUrl = `https://livebillboards.lol/?city=${selectedCity}`;
  const tweetText = encodeURIComponent(
    `🔥 Just took over the 24/7 Virtual Billboard in ${currentCity}! 🚀\n\nAd: "${adTitle}"\nTop Bid: $${bidDollars}\n\nWatch live now 🔴👇\n${liveUrl}\n\n#VirtualBillboard #DOOH #DigitalBillboard`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl).then(() => {
      setCopiedLink(true);
      if (addToast) addToast('success', 'Live Link Copied!', 'Share link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyTweetText = () => {
    const rawText = `🔥 Just took over the 24/7 Virtual Billboard in ${currentCity}! 🚀\n\nAd: "${adTitle}"\nTop Bid: $${bidDollars}\n\nWatch live now: ${liveUrl}`;
    navigator.clipboard.writeText(rawText).then(() => {
      setCopiedText(true);
      if (addToast) addToast('success', 'Viral Post Text Copied!', 'Paste directly into Twitter/X, TikTok, or LinkedIn.');
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-md">
                <Share2 className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Live Ad Takeover Proof Card</h3>
                <p className="text-xs text-slate-400">Share your live billboard broadcast on Twitter/X & TikTok</p>
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
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-3 space-y-3">
            {/* Top Billboard Bezel Badge */}
            <div className="flex items-center justify-between text-[11px] font-mono px-2">
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

          {/* 1-Click Viral Sharing Actions */}
          <div className="space-y-3">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 fill-slate-950" />
              <span>Post Live Proof on Twitter / X</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyLink}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Live Link'}</span>
              </button>

              <button
                onClick={handleCopyTweetText}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copiedText ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                <span>{copiedText ? 'Text Copied!' : 'Copy Viral Caption'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
