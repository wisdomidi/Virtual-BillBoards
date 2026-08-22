import React, { useState } from 'react';
import { ToastMessage } from '../types';
import {
  DollarSign,
  Upload,
  Clock,
  Sparkles,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Globe,
  Zap,
  QrCode,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

import { UserProfile } from '../lib/firebase';

interface BiddingConsoleProps {
  selectedCity: string;
  selectedCountry: string;
  onBidSubmitted: () => void;
  addToast?: (toast: Omit<ToastMessage, 'id'>) => void;
  currentUser?: UserProfile | null;
}

export const BiddingConsole: React.FC<BiddingConsoleProps> = ({
  selectedCity,
  selectedCountry,
  onBidSubmitted,
  addToast,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [ctaType, setCtaType] = useState<'website' | 'whatsapp' | 'none'>('website');
  const [ctaUrl, setCtaUrl] = useState('https://yourbrand.com/promo');
  const [bidAmountDollars, setBidAmountDollars] = useState('1.00');
  const [durationSeconds, setDurationSeconds] = useState<number>(15);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Please select a valid image (PNG, JPG, WebP) or video file (.mp4, .webm).');
      return;
    }

    setMediaType(isVideo ? 'video' : 'image');
    setUploadedFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOneClickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !uploadedFileName) {
      setFeedback({ type: 'error', message: 'Please provide a campaign title or upload an ad creative.' });
      return;
    }

    if (!imageUrl) {
      setFeedback({ type: 'error', message: 'Please upload an image or video file.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    // Calculate total budget based on duration multiplier
    const slots = Math.max(1, Math.round(durationSeconds / 15));
    const baseBudget = parseFloat(bidAmountDollars) || 1.00;
    const totalCents = Math.round(baseBudget * slots * 100);

    const landingPageUrl = ctaType === 'website' ? ctaUrl : undefined;
    const whatsappLink = ctaType === 'whatsapp' ? ctaUrl : undefined;

    const uid = currentUser?.uid || 'default_user';
    const advertiserDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Direct Advertiser';

    try {
      const res = await fetch('/api/bids/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': uid
        },
        body: JSON.stringify({
          title: title || uploadedFileName || 'Advertiser Campaign',
          imageUrl,
          mediaType,
          ctaType,
          ctaUrl,
          landingPageUrl,
          whatsappLink,
          targetCityCode: selectedCity,
          targetCountryCode: selectedCountry,
          bidAmountCents: totalCents,
          advertiserName: advertiserDisplayName,
          userId: uid
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          message: data.error || 'Bid submission rejected. Please check your creative.'
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Campaign approved & active in ${selectedCity}! Your ad with interactive CTA link is now live.`
        });

        if (addToast) {
          addToast({
            type: 'success',
            title: 'Campaign Live!',
            message: `Successfully placed $${(totalCents / 100).toFixed(2)} campaign for '${title || 'Ad Creative'}' in ${selectedCity}.`
          });
        }

        onBidSubmitted();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit campaign.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl text-white space-y-6">
      {/* Primary Value Pitch Headline */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border border-cyan-500/30 p-5 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-black uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Instant Digital Billboard Placement</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
          Target local city audiences in real-time.
        </h1>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Select your target city geofence (🇲🇾 Kuala Lumpur), upload your ad creative, and broadcast immediately across high-impact digital billboard displays.
        </p>
      </div>

      {/* Geotargeting Premium Feature Callout */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-extrabold text-emerald-300 flex items-center gap-1.5 text-sm">
            <span>🎯 Hyper-Local Geotargeting</span>
            <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-700/80 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              PREMIUM FEATURE
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Your campaign broadcasts strictly to verified viewers within your selected zip code and city geofence (<strong className="text-white">{selectedCity}, {selectedCountry}</strong>). Zero wasted global reach — 100% budget efficiency designed specifically for local and regional businesses.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Launch Live Billboard Campaign
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Location: <span className="text-cyan-300 font-bold">{selectedCity} ({selectedCountry})</span>
          </p>
        </div>
        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          One-Click Instant Launch
        </span>
      </div>

      <form onSubmit={handleOneClickSubmit} className="space-y-6">
        {/* FIELD 1: CREATIVE UPLOAD */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>1. Creative Upload (Image or MP4 Video)</span>
            <span className="text-[11px] text-slate-400 font-normal">PNG, JPG, MP4, WebM</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upload Box */}
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950 p-4 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center group transition-all min-h-[120px]">
              <Upload className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                {uploadedFileName || 'Click to Upload Ad Creative (Image / MP4 Video)'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Select local image or video file from device</span>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Creative Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
              {imageUrl ? (
                <div className="flex items-center gap-3 w-full">
                  {mediaType === 'video' || imageUrl.startsWith('data:video/') || imageUrl.toLowerCase().includes('.mp4') ? (
                    <video
                      src={imageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-24 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Creative Preview"
                      className="w-24 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {mediaType === 'video' ? '🎬 MP4 Video Loaded' : '🖼️ Image Loaded'}
                    </span>
                    <p className="text-xs font-bold text-white truncate">
                      {uploadedFileName || title || 'Local Ad Creative'}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setImageUrl(''); setUploadedFileName(null); setMediaType('image'); }}
                      className="text-[10px] text-rose-400 hover:underline mt-1 block"
                    >
                      Remove & Replace File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-1">
                  <ImageIcon className="w-6 h-6 text-slate-600 mx-auto" />
                  <span className="text-xs font-semibold block">No file selected</span>
                  <span className="text-[10px] text-slate-600">Image or MP4 video preview will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FIELD 2: BUDGET ($ USD) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>2. Campaign Budget ($ USD)</span>
            <span className="text-[11px] text-cyan-400 font-normal">Starts at $1.00 / 15s Slot</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-1/2">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                step="0.50"
                min="1.00"
                value={bidAmountDollars}
                onChange={(e) => setBidAmountDollars(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-lg font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Quick Budget Adjust Pills */}
            <div className="flex items-center gap-2 w-full sm:w-1/2 flex-wrap">
              {['1.00', '2.00', '5.00', '10.00', '25.00'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBidAmountDollars(amt)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    bidAmountDollars === amt
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FIELD 3: DURATION */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>3. Campaign Duration</span>
            <span className="text-[11px] text-slate-400 font-normal">Broadcast Length</span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[
              { seconds: 15, slots: 1, label: '15 Seconds', badge: 'Standard' },
              { seconds: 30, slots: 2, label: '30 Seconds', badge: 'High Impact' },
              { seconds: 60, slots: 4, label: '60 Seconds', badge: 'Maximum Reach' }
            ].map((option) => (
              <button
                key={option.seconds}
                type="button"
                onClick={() => setDurationSeconds(option.seconds)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  durationSeconds === option.seconds
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-sm text-white">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{option.label}</span>
                </div>
                <span className="text-[10px] text-slate-400">{option.slots} Slot ({option.badge})</span>
              </button>
            ))}
          </div>
        </div>

        {/* CAMPAIGN TITLE INPUT */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-400">
            Campaign Name (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Summer Launch Promo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* FIELD 4: SINGLE CTA SELECTION (WEBSITE OR WHATSAPP ONLY) */}
        <div className="space-y-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              4. Select 1 Call-To-Action (CTA)
            </span>
            <span className="text-[10px] text-slate-400">Choose 1 action type for viewers</span>
          </div>

          {/* CTA Choice Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setCtaType('website');
                if (!ctaUrl || ctaUrl.includes('wa.me')) setCtaUrl('https://yourbrand.com/promo');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                ctaType === 'website'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Website Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCtaType('whatsapp');
                if (!ctaUrl || !ctaUrl.includes('wa.me')) setCtaUrl('https://wa.me/60123456789?text=Hi%20Brand');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                ctaType === 'whatsapp'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCtaType('none');
                setCtaUrl('');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                ctaType === 'none'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>No CTA</span>
            </button>
          </div>

          {/* CTA Link Input */}
          {ctaType !== 'none' && (
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                {ctaType === 'website' ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Website Landing Page URL</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Direct Link or Phone</span>
                  </>
                )}
              </label>
              <input
                type="text"
                placeholder={ctaType === 'website' ? 'https://yourbrand.com/promo' : 'https://wa.me/60123456789'}
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                  ctaType === 'website' ? 'border-slate-800 focus:border-cyan-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
                required
              />
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ONE-CLICK LAUNCH SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer"
        >
          {submitting ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin text-slate-950" />
              <span>Launching Campaign...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-slate-950" />
              <span>Launch Campaign in One Click</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
