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
  HelpCircle
} from 'lucide-react';

interface WatcherOnboardingTourProps {
  onCompleteTour?: () => void;
  onDismiss?: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Watch Live Global Ads',
    icon: Monitor,
    color: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    description: 'Tune into live 15-second virtual billboard ad streams across top world cities (Tokyo, NYC, London, Kuala Lumpur).',
    details: [
      'Continuous 24/7 high-definition broadcast streams',
      'Real-time city weather, local news & traffic overlays',
      'Switch between global city feeds seamlessly anytime'
    ]
  },
  {
    step: 2,
    title: '2. Maintain Active Tab Focus',
    icon: Eye,
    color: 'from-indigo-500 to-purple-600',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    description: 'Keep your browser tab active and visible to ensure securely verified attention score accumulation.',
    details: [
      'Client HMAC secure heartbeats transmitted every 60s',
      'Tab focus & visibility API tracking ensures genuine viewing',
      'Anti-bot zero-trust fraud engine continuously checks risk scores'
    ]
  },
  {
    step: 3,
    title: '3. Complete Visual Human Captchas',
    icon: ShieldCheck,
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    description: 'Respond to occasional 15-second visual puzzle checks to verify human presence and block automated bot traffic.',
    details: [
      'Unscheduled 15-second attention checks drop during sessions',
      'Quick visual pattern or shape verification puzzles',
      'Successfully passing captchas boosts your verified human trust tier'
    ]
  },
  {
    step: 4,
    title: '4. Earn Cash & Convert Rewards',
    icon: Award,
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    description: 'Earn 10 Watch Points ($0.10 USD) every verified minute and convert them directly to your Ad Wallet credit!',
    details: [
      '10 Watch Points = $0.10 USD real monetary value',
      'Instant conversion directly into your Ad Wallet balance',
      'Transparent micro-settlement payout ledger records every credit'
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

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden animate-fade-in">
      {/* Top Banner Header & Dismiss Button */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-slate-950 font-black shadow-lg">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Watcher Onboarding Tour
              </h2>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Master the earn-while-you-watch workflow in 4 simple steps.
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Dismiss Tour"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Visual Step Tracker Bar */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {TOUR_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-800 border-cyan-500 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-slate-950/80 border-emerald-500/50 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span>STEP 0{s.step}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold truncate mt-1">
                  {s.title.split('. ')[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Active Step Content Card */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${currentStep.color} text-slate-950 font-black shrink-0 shadow-lg`}>
            <currentStep.icon className="w-6 h-6" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white tracking-wide">
                {currentStep.title}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${currentStep.badgeColor}`}>
                Workflow Action #{currentStep.step}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-900 text-xs">
          {currentStep.details.map((detail, idx) => (
            <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-slate-300 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-snug">{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isFirst
              ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <div className="flex items-center gap-2">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3.5 py-2.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
            >
              Skip Onboarding
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <span>{isLast ? 'Complete & Start Earn Stream' : 'Next Step'}</span>
            {isLast ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
