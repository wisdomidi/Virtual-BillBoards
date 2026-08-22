import React, { useState } from 'react';
import { PayoutLedgerEntry } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Clock,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface PayoutLedgerProps {
  viewerPoints: number;
  riskScore?: number;
  userStatus?: string;
  activeWatchSeconds?: number;
  lastHeartbeatStatus?: string;
  onPointsEarned: (pts: number) => void;
  onTriggerHeartbeat?: () => void;
}

export const PayoutLedger: React.FC<PayoutLedgerProps> = ({
  viewerPoints,
  riskScore = 0,
  userStatus = 'verified_human',
  activeWatchSeconds = 0,
  lastHeartbeatStatus = 'idle',
  onPointsEarned,
  onTriggerHeartbeat
}) => {
  const [tabVisible, setTabVisible] = useState(true);
  const [requestVelocity, setRequestVelocity] = useState('1.0');
  const [loadingHeartbeat, setLoadingHeartbeat] = useState(false);

  const [ledgerEntries, setLedgerEntries] = useState<PayoutLedgerEntry[]>([
    {
      id: 'ledger_01',
      viewerId: 'usr_viewer_01',
      slotId: 'SLOT-984321',
      watchSeconds: 15,
      pointsEarned: 10,
      heartbeatHash: 'hb_8a92f02c11',
      tabVisible: true,
      ipVelocityScore: 1.0,
      fraudStatus: 'verified',
      timestamp: '13:35:00'
    },
    {
      id: 'ledger_02',
      viewerId: 'usr_viewer_01',
      slotId: 'SLOT-984320',
      watchSeconds: 15,
      pointsEarned: 0,
      heartbeatHash: 'hb_1f33a92b88',
      tabVisible: false,
      ipVelocityScore: 1.0,
      fraudStatus: 'flagged_hidden_tab',
      timestamp: '13:34:45'
    }
  ]);

  const handleTriggerHeartbeat = async () => {
    setLoadingHeartbeat(true);
    try {
      const res = await fetch('/api/viewer/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerId: 'usr_viewer_01',
          watchSeconds: 15,
          tabVisible,
          requestVelocity: parseFloat(requestVelocity)
        })
      });

      const data = await res.json();

      if (data.success && data.ledgerEntry) {
        setLedgerEntries((prev) => [data.ledgerEntry, ...prev]);
        if (data.ledgerEntry.pointsEarned > 0) {
          onPointsEarned(data.ledgerEntry.pointsEarned);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHeartbeat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Proof-of-Attention & Fraud Prevention Ledger
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Validates 15-second viewer engagement, tab focus visibility, IP velocity rate limits, and secure heartbeat hashes
          </p>
        </div>

        <div className="bg-amber-950/80 border border-amber-800 text-amber-400 font-mono text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
          <Award className="w-4 h-4 animate-pulse" />
          <span>Total Accumulated Points: <strong>{viewerPoints} pts</strong></span>
        </div>
      </div>

      {/* Live Bot Risk Score & Watch Timer Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-slate-400 font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Active Verified Watch Time:</span>
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {activeWatchSeconds}s / 60s
          </div>
          <p className="text-[11px] text-slate-500">
            Page Visibility API tracking active tab focus
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-slate-400 font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Bot Risk Assessment Score:</span>
          </div>
          <div className={`text-2xl font-black ${riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {riskScore}% Risk
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                riskScore > 50 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-slate-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Account Security Status:</span>
          </div>
          <div className="text-sm font-extrabold uppercase tracking-wide text-emerald-300">
            {userStatus}
          </div>
          <p className="text-[11px] text-slate-500">
            Heartbeat Status: {lastHeartbeatStatus}
          </p>
        </div>
      </div>

      {/* Heartbeat Simulator Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Zap className="w-4 h-4 text-cyan-400" />
          Proof-of-Attention Heartbeat Simulator:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 mb-1">Tab Focus Visibility State:</label>
            <button
              type="button"
              onClick={() => setTabVisible(!tabVisible)}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                tabVisible
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}
            >
              {tabVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{tabVisible ? 'Tab Visible (Active Viewer)' : 'Tab Hidden (Background)'}</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">IP Request Velocity Multiplier:</label>
            <select
              value={requestVelocity}
              onChange={(e) => setRequestVelocity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-400 font-bold focus:outline-none"
            >
              <option value="1.0">1.0x Normal Human Pace</option>
              <option value="2.5">2.5x Fast Refresh</option>
              <option value="5.0">5.0x Bot Suspect (Flagged)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTriggerHeartbeat}
              disabled={loadingHeartbeat}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Send 15s Heartbeat Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payout Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-cyan-400" />
          Immutable Payout Ledger (<code className="text-cyan-300">payout_ledger</code> Table):
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[11px]">
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">SLOT ID</th>
                <th className="p-3">WATCH SECONDS</th>
                <th className="p-3">TAB STATE</th>
                <th className="p-3">IP VELOCITY</th>
                <th className="p-3">POINTS EARNED</th>
                <th className="p-3">FRAUD STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-950/50">
                  <td className="p-3 text-slate-400">{entry.timestamp}</td>
                  <td className="p-3 font-bold text-cyan-300">{entry.slotId}</td>
                  <td className="p-3 text-slate-300">{entry.watchSeconds}s</td>
                  <td className="p-3">
                    {entry.tabVisible ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Visible
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold">{entry.ipVelocityScore}x</td>
                  <td className="p-3 font-extrabold text-amber-400">+{entry.pointsEarned} pts</td>
                  <td className="p-3">
                    {entry.fraudStatus === 'verified' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                        VERIFIED
                      </span>
                    )}
                    {entry.fraudStatus === 'flagged_hidden_tab' && (
                      <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">
                        FLAGGED (HIDDEN TAB)
                      </span>
                    )}
                    {entry.fraudStatus === 'flagged_velocity' && (
                      <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                        FLAGGED (BOT VELOCITY)
                      </span>
                    )}
                    {entry.fraudStatus === 'flagged_replay_attack' && (
                      <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                        FLAGGED (REPLAY ATTACK)
                      </span>
                    )}
                    {entry.fraudStatus === 'flagged_bot_247' && (
                      <span className="bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded font-bold">
                        FLAGGED (24/7 IDLE BOT)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
