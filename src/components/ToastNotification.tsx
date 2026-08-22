import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastMessage } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-notification-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isOutbid = toast.type === 'outbid';
  const isWarning = toast.type === 'warning';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.88, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.8, x: 80, filter: 'blur(8px)', transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl font-mono text-xs ${
        isSuccess
          ? 'bg-slate-900/95 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] text-emerald-100'
          : isOutbid
          ? 'bg-slate-900/95 border-rose-500/90 shadow-[0_0_35px_rgba(244,63,94,0.3)] text-rose-100'
          : isWarning
          ? 'bg-slate-900/95 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] text-amber-100'
          : 'bg-slate-900/95 border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-cyan-100'
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
          isSuccess
            ? 'from-emerald-400 via-teal-400 to-cyan-400'
            : isOutbid
            ? 'from-rose-500 via-amber-500 to-rose-600 animate-pulse'
            : isWarning
            ? 'from-amber-400 to-rose-400'
            : 'from-cyan-400 to-blue-500'
        }`}
      />

      <div className="flex items-start gap-3">
        {/* Toast Icon */}
        <div
          className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${
            isSuccess
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
              : isOutbid
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-400 animate-bounce'
              : isWarning
              ? 'bg-amber-950/80 border border-amber-500/50 text-amber-400'
              : 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-400'
          }`}
        >
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isOutbid && <TrendingUp className="w-5 h-5 text-rose-400" />}
          {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {!isSuccess && !isOutbid && !isWarning && <Zap className="w-5 h-5 text-cyan-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1 pr-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>{toast.title}</span>
              {toast.cityCode && (
                <span className="text-[10px] bg-slate-800 text-cyan-300 border border-slate-700 px-1.5 py-0.5 rounded">
                  [{toast.cityCode}]
                </span>
              )}
            </h4>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">{toast.message}</p>

          {/* Badges / Extras */}
          {(toast.bidAmountCents || toast.safetyScore) && (
            <div className="flex items-center gap-2 pt-1">
              {toast.bidAmountCents && (
                <span className="bg-slate-950 border border-slate-800 text-cyan-400 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  {(toast.bidAmountCents / 100).toFixed(2)}
                </span>
              )}
              {toast.safetyScore !== undefined && (
                <span className="bg-slate-950 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {toast.safetyScore}/100 Safe
                </span>
              )}
            </div>
          )}

          {/* Optional Action Button */}
          {toast.actionLabel && toast.onAction && (
            <div className="pt-2">
              <button
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black rounded-lg text-[11px] transition-all flex items-center gap-1 shadow-md"
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-500 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 6, ease: 'linear' }}
        className={`absolute bottom-0 inset-x-0 h-0.5 ${
          isSuccess
            ? 'bg-emerald-500/80'
            : isOutbid
            ? 'bg-rose-500/80'
            : isWarning
            ? 'bg-amber-500/80'
            : 'bg-cyan-500/80'
        }`}
      />
    </motion.div>
  );
};
