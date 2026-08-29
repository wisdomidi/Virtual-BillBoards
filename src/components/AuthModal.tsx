import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ShieldCheck,
  Megaphone,
  Tv,
  Sparkles,
  Eye,
  AlertCircle,
  ArrowRight,
  UserCheck,
  LogIn
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  syncUserProfile
} from '../lib/firebase';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userProfile: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('advertiser');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const mapAuthError = (err: any): string => {
    const msg = err?.message || err?.code || '';
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your current domain';
    if (msg.includes('auth/unauthorized-domain')) {
      return `⚠️ Google Sign-In: The domain "${currentHost}" is not authorized yet. Please add "${currentHost}" to Firebase Console -> Authentication -> Settings -> Authorized Domains. In the meantime, you can sign in with Email & Password below!`;
    }
    if (msg.includes('auth/email-already-in-use')) {
      return "An account with this email already exists. Please switch to 'Sign In' or use a different email.";
    }
    if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
      return "Invalid email or password. Please verify your credentials or switch to Sign Up.";
    }
    if (msg.includes('auth/weak-password')) {
      return "Password is too short. Please use at least 6 characters.";
    }
    if (msg.includes('auth/invalid-email')) {
      return "Please enter a valid email address.";
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return "Google Sign-In was cancelled.";
    }
    return msg || 'Authentication failed. Please try again.';
  };

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
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address to receive the password reset link.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setError(mapAuthError(err));
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
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {mode === 'signin' ? 'Sign In to Account' : mode === 'signup' ? 'Create Verified Account' : 'Reset Password'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {mode === 'forgot' ? 'Enter your email to receive a secure reset link' : '24/7 Virtual Billboard Cloud Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setResetSent(false); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setResetSent(false); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {mode === 'forgot' ? (
          <div className="space-y-4">
            {resetSent ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Reset Link Sent!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We sent a password reset email to <strong className="text-cyan-400">{email}</strong>. Please check your inbox and follow the link.
                </p>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setResetSent(false); }}
                  className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Account Email</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Google Quick Login Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 mb-3.5 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">OR EMAIL & PASSWORD</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Signup Role Selector */}
            {mode === 'signup' && (
              <div className="mb-3.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Primary Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'advertiser' as UserRole, label: 'Advertiser', icon: Megaphone, desc: 'Buy & bid on billboards' },
                    { id: 'streamer' as UserRole, label: 'Streamer', icon: Tv, desc: 'Earn 80% rev share on Overlay' },
                    { id: 'paid_watcher' as UserRole, label: 'Paid Watcher', icon: Sparkles, desc: 'Watch streams for tokens' },
                    { id: 'guest' as UserRole, label: 'Spectator', icon: Eye, desc: 'View global live screens' }
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSel = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                          <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{r.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">{r.desc}</div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setResetSent(false); }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
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
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In Now' : 'Create Verified Account'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up here"
                  : 'Already have an account? Sign in here'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
