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
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none px-3 sm:px-0"
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
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Auto-dismiss after 3.5 seconds reliably
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismissRef.current(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const isSuccess = toast.type === 'success';
  const isOutbid = toast.type === 'outbid';
  const isWarning = toast.type === 'warning';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, x: 60, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-2.5 shadow-xl backdrop-blur-xl font-mono text-[11px] ${
        isSuccess
          ? 'bg-slate-900/95 border-emerald-500/70 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : isOutbid
          ? 'bg-slate-900/95 border-rose-500/80 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
          : isWarning
          ? 'bg-slate-900/95 border-amber-500/70 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          : 'bg-slate-900/95 border-cyan-500/70 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${
          isSuccess
            ? 'from-emerald-400 via-teal-400 to-cyan-400'
            : isOutbid
            ? 'from-rose-500 via-amber-500 to-rose-600 animate-pulse'
            : isWarning
            ? 'from-amber-400 to-rose-400'
            : 'from-cyan-400 to-blue-500'
        }`}
      />

      <div className="flex items-center gap-2">
        {/* Toast Icon */}
        <div
          className={`p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center ${
            isSuccess
              ? 'bg-emerald-950/80 text-emerald-400'
              : isOutbid
              ? 'bg-rose-950/80 text-rose-400'
              : isWarning
              ? 'bg-amber-950/80 text-amber-400'
              : 'bg-cyan-950/80 text-cyan-400'
          }`}
        >
          {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          {isOutbid && <TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
          {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          {!isSuccess && !isOutbid && !isWarning && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="font-bold text-xs tracking-tight text-white truncate">
            {toast.title}
          </h4>
          <p className="text-slate-300 text-[10px] leading-tight line-clamp-1">{toast.message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-500 hover:text-slate-200 transition-colors p-0.5 hover:bg-slate-800 rounded"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 3, ease: 'linear' }}
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
