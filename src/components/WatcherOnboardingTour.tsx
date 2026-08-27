import React, { useState } from 'react';
import {
  Sparkles,
  Monitor,
  Eye,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Zap,
  HelpCircle,
  Target,
  Ticket,
  DollarSign
} from 'lucide-react';

interface WatcherOnboardingTourProps {
  onCompleteTour?: () => void;
  onDismiss?: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Watch Live Global Billboard Ads',
    icon: Monitor,
    color: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    description: 'Tune into real-time 15-second virtual billboard ad streams across top global cities (Tokyo, NYC, London, Kuala Lumpur).',
    details: [
      'Continuous 24/7 real-time RTB broadcast streams',
      'Real advertiser bids rotating automatically every 15 seconds',
      'Switch between global city feeds seamlessly anytime'
    ]
  },
  {
    step: 2,
    title: '2. Spot & Click the Floating Attention Target',
    icon: Target,
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    description: 'A glowing radar target spawns on the ad screen every 15 seconds. Click it to verify your active viewing attention.',
    details: [
      'Look for the pulsing radar ring: "💎 MINE +25 PTS" (or "🔥 MINE +50 PTS" on Tier 1 ads)',
      'Clicking proves genuine human presence with sub-pixel reaction entropy',
      'Spawns every 15-second ad rotation for continuous mining'
    ]
  },
  {
    step: 3,
    title: '3. Cryptographic Proof-of-Attention (PoA)',
    icon: ShieldCheck,
    color: 'from-indigo-500 to-purple-600',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    description: 'Every interaction signs an HMAC-SHA256 cryptographic Proof-of-Attention ticket that proves 100% human engagement to advertisers.',
    details: [
      'Eliminates bot fraud and idling tabs permanently',
      'Generates unique verifiable ticket hashes with reaction timestamps',
      'Advertisers pay 5x higher premiums for guaranteed human eyeballs'
    ]
  },
  {
    step: 4,
    title: '4. Cash Out & Convert Rewards',
    icon: Award,
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    description: 'Accumulate verified attention points and convert them directly to Ad Wallet cash balance or 2x Ad Tokens!',
    details: [
      '100 Attention Points = $1.00 USD real monetary value',
      'Instant conversion to Ad Wallet balance or 2x Ad Token power-up',
      'Live payout ledger tracks all verified micro-settlements transparently'
    ]
  }
];

export const WatcherOnboardingTour: React.FC<WatcherOnboardingTourProps> = ({
  onCompleteTour,
  onDismiss
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (onCompleteTour) onCompleteTour();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const IconComponent = currentStep.icon;

  return (
    <div className="bg-slate-950/95 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${currentStep.color} text-slate-950 shadow-lg font-black`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${currentStep.badgeColor}`}>
                STEP {currentStep.step} OF {TOUR_STEPS.length}
              </span>
              <span className="text-xs font-bold text-slate-400">Proof-of-Attention Mining Guide</span>
            </div>
            <h2 className="text-lg font-black text-white">{currentStep.title}</h2>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Dismiss Tour"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {currentStep.description}
        </p>

        {/* Feature Check List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            Verified Mechanism Details:
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            {currentStep.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Step Indicator & Controls */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-6 bg-cyan-400'
                  : idx < currentStepIndex
                  ? 'w-2 bg-cyan-800'
                  : 'w-2 bg-slate-800'
              }`}
              title={`Jump to step ${s.step}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={handlePrev}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isLast ? 'Start Mining Attention Points' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
