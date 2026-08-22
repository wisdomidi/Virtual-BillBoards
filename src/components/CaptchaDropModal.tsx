import React from 'react';
import { CaptchaChallenge } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Bot,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface CaptchaDropModalProps {
  captcha: CaptchaChallenge;
  countdownSeconds: number;
  isSubmitting: boolean;
  resultMessage: { success: boolean; text: string } | null;
  onSelectOption: (optionId: number) => void;
}

export const CaptchaDropModal: React.FC<CaptchaDropModalProps> = ({
  captcha,
  countdownSeconds,
  isSubmitting,
  resultMessage,
  onSelectOption
}) => {
  const countdownPercent = (countdownSeconds / (captcha.timeLimitSeconds || 15)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.3)] font-mono overflow-hidden">
        {/* Top Glowing Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 animate-pulse" />

        {/* Modal Title & Live Countdown Timer */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-widest uppercase">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>RANDOM ATTENTION CHECK (PROOF-OF-HUMAN)</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Human Presence Verification Required
            </h3>
            <p className="text-xs text-slate-400">
              Interactive bot check drop. Pass within 15 seconds to claim ticket rewards and keep your account status verified.
            </p>
          </div>

          {/* Glowing 15s Countdown Badge */}
          <div className="flex flex-col items-center justify-center bg-amber-950 border-2 border-amber-500 px-3 py-2 rounded-2xl min-w-[70px] text-amber-300">
            <Clock className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-2xl font-black">{countdownSeconds}s</span>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-400 to-rose-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            style={{ width: `${countdownPercent}%` }}
          />
        </div>

        {/* Result Message (Success / Error) */}
        {resultMessage ? (
          <div
            className={`p-4 rounded-2xl border font-bold text-xs flex items-center gap-3 animate-bounce ${
              resultMessage.success
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500 text-rose-300'
            }`}
          >
            {resultMessage.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        ) : (
          /* Prompt & Options Grid */
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-cyan-300 text-xs font-bold flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>{captcha.prompt}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {captcha.options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isSubmitting}
                  onClick={() => onSelectOption(opt.id)}
                  className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 rounded-2xl text-left transition-all group flex flex-col items-center justify-center gap-2 hover:scale-[1.03] disabled:opacity-50"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">{opt.icon}</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 text-center">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Security Nonce Verified
          </span>
          <span className="flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            Anti-Headless Bot Engine Active
          </span>
        </div>
      </div>
    </div>
  );
};
