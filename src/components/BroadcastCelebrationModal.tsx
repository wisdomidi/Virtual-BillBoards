import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Share2, Twitter, Linkedin, Copy, Check, X, Radio, ArrowRight, ExternalLink } from 'lucide-react';

interface BroadcastCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  adTitle: string;
  targetCity: string;
  bidAmountDollars?: string;
  isFreeSlot?: boolean;
}

export const BroadcastCelebrationModal: React.FC<BroadcastCelebrationModalProps> = ({
  isOpen,
  onClose,
  adTitle,
  targetCity,
  bidAmountDollars = '1.00',
  isFreeSlot = true
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const liveUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?city=${targetCity}`
    : `https://livebillboards.lol/?city=${targetCity}`;

  const tweetText = encodeURIComponent(
    `🚀 My ad "${adTitle}" is broadcasting LIVE on the 24/7 Virtual Billboard in [${targetCity}]! Watch the stream in real-time:`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(liveUrl)}&hashtags=VirtualBillboard,LiveAds,Marketing`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(liveUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 text-white space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isFreeSlot ? 'FREE 15S BROADCAST ACTIVATED!' : 'CAMPAIGN BROADCAST LIVE!'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Your Creative is Live in [{targetCity}]!
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Broadcasting 24/7 across our global network and streamer screens. Share your broadcast with the world!
          </p>
        </div>

        {/* Billboard Preview Snippet */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE NOW
            </span>
            <span className="text-cyan-400 font-bold">City: {targetCity}</span>
          </div>
          <p className="text-sm font-bold text-white line-clamp-1">"{adTitle}"</p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-500">
            <span>Duration: 15 Seconds</span>
            <span className="text-emerald-400 font-bold">{isFreeSlot ? 'Free Starter Credit' : `$${bidAmountDollars} Paid Bid`}</span>
          </div>
        </div>

        {/* Viral Share Actions */}
        <div className="space-y-3">
          <p className="text-[11px] font-mono uppercase font-bold text-slate-400 text-center">
            Share Your Live Billboard Broadcast
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-2.5 px-3 rounded-xl transition-all shadow-md shadow-sky-500/20 text-xs"
            >
              <Twitter className="w-4 h-4 fill-slate-950" />
              <span>Share on X</span>
            </a>

            <a
              href={linkedinShareUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-3 rounded-xl transition-all shadow-md shadow-blue-600/20 text-xs"
            >
              <Linkedin className="w-4 h-4 fill-white" />
              <span>Share on LinkedIn</span>
            </a>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
            <input
              type="text"
              readOnly
              value={liveUrl}
              className="bg-transparent text-cyan-300 font-mono text-xs w-full focus:outline-none px-2 select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold shrink-0 transition-all ${
                copied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Post-Bid Account Claiming & Video Proof Delivery */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-300 font-bold">📩 Receive Video Proof & Analytics</span>
            <span className="text-[10px] text-slate-500">Free</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Enter your email to receive broadcast timestamps, impression proof, and claim your permanent dashboard.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="founder@yourcompany.com"
              className="bg-slate-900 border border-slate-700 text-white font-mono text-xs px-3 py-2 rounded-xl w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
            <button
              onClick={() => {
                alert('🎉 Broadcast alert registered! We will email you live stream proof.');
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer"
            >
              Claim Proof
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Watch Live Stream Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
