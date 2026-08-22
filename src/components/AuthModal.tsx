import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Megaphone,
  Tv,
  Sparkles,
  Eye,
  Crown,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  syncUserProfile
} from '../lib/firebase';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userProfile: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('advertiser');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(res.user, selectedRole);
      onAuthSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const profile = await syncUserProfile(res.user, selectedRole);
        onAuthSuccess(profile);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const profile = await syncUserProfile(res.user, selectedRole);
        onAuthSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>{mode === 'signin' ? 'Sign In to Account' : 'Create Verified Account'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Secure Cloud Authentication Active
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Quick Login Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 mb-4 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google Account</span>
        </button>

        <div className="flex items-center gap-3 my-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">OR EMAIL SIGN IN</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Signup Role Selector */}
        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Account Primary Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'advertiser' as UserRole, label: 'Advertiser', icon: Megaphone, desc: 'Buy & bid on billboards' },
                { id: 'streamer' as UserRole, label: 'Streamer', icon: Tv, desc: 'Earn 70% rev share on Stream Overlay' },
                { id: 'paid_watcher' as UserRole, label: 'Paid Watcher', icon: Sparkles, desc: 'Watch streams for cash' },
                { id: 'guest' as UserRole, label: 'Spectator', icon: Eye, desc: 'View global billboards' }
              ].map((r) => {
                const Icon = r.icon;
                const isSel = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSel
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{r.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{mode === 'signin' ? 'Sign In Now' : 'Create Verified Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up here"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
