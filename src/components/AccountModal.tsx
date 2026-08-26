import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Coins,
  Megaphone,
  Sparkles,
  Tv,
  LogOut,
  Copy,
  Check,
  CreditCard,
  History,
  Key,
  ExternalLink,
  Plus
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  walletBalanceDollars: string;
  tokensBalance: number;
  transactions?: any[];
  onOpenWalletModal: () => void;
  onOpenMyAdsModal: () => void;
  onOpenClaimModal: () => void;
  onSignOut: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  walletBalanceDollars,
  tokensBalance,
  transactions = [],
  onOpenWalletModal,
  onOpenMyAdsModal,
  onOpenClaimModal,
  onSignOut
}) => {
  const [copiedUid, setCopiedUid] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'api'>('overview');

  if (!isOpen || !currentUser) return null;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Member';
  const roleName = currentUser.role ? currentUser.role.toUpperCase() : 'ADVERTISER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{displayName}</h2>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  {roleName}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{currentUser.email || 'Anonymous Guest'}</span>
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

        {/* Account Nav Tabs */}
        <div className="px-6 pt-3 flex gap-2 border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Account Overview
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>WebMCP & API</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                      Ad Wallet & Token Balance
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-2">
                      <span>${walletBalanceDollars} USD</span>
                      <span className="text-xs text-amber-400 font-mono font-normal">
                        ({(tokensBalance || 0).toLocaleString()} Tokens)
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); onOpenWalletModal(); }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Top Up Ad Tokens</span>
                </button>
              </div>

              {/* Quick Hub Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => { onClose(); onOpenMyAdsModal(); }}
                  className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-left transition-all group cursor-pointer shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-xl">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">My Placed Campaigns</div>
                      <div className="text-[10px] text-slate-400">View live status & impressions</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </button>

                <button
                  onClick={() => { onClose(); onOpenClaimModal(); }}
                  className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left transition-all group cursor-pointer shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/15 text-purple-400 rounded-xl">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Claim Creator @Handle</div>
                      <div className="text-[10px] text-purple-300">80% Rev-Share Stream Overlay</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
                </button>
              </div>

              {/* UID & Security Details */}
              <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-[11px] uppercase flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Unique Account UID</span>
                  </span>
                  <button
                    onClick={handleCopyUid}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUid ? 'Copied' : 'Copy UID'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 truncate select-all">
                  {currentUser.uid}
                </div>
              </div>
            </>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase">Recent Ad Wallet Transactions</div>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {transactions.map((tx: any, idx: number) => (
                    <div key={tx.id || idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white text-[11px]">{tx.description || tx.type || 'Transaction'}</div>
                        <div className="text-[9px] text-slate-500 font-mono">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recent'}</div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${tx.type === 'pack_purchase' || tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {tx.type === 'pack_purchase' || tx.type === 'deposit' ? '+' : '-'}${tx.amountDollars || (tx.amountCents ? (tx.amountCents / 100).toFixed(2) : '0.00')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center text-slate-400 text-xs">
                  No previous transactions recorded for this wallet yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Key className="w-4 h-4" />
                  <span>WebMCP Programmatic Access</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Autonomous AI agents and DSP bidding bots can query inventory and place sub-second bids using your account credentials via WebMCP.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Your M2M Client Header:</span>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[11px] text-cyan-300 mt-1 select-all">
                    x-user-uid: {currentUser.uid}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Sign Out */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Status: <span className="text-emerald-400 font-bold">Authenticated</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
