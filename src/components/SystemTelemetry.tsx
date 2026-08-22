import React from 'react';
import { TelemetryLog } from '../types';
import { Terminal, Radio, ShieldCheck, Zap } from 'lucide-react';

interface SystemTelemetryProps {
  logs: TelemetryLog[];
}

export const SystemTelemetry: React.FC<SystemTelemetryProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Live WebSocket Telemetry Log Feed
        </h3>
        <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Stream
        </span>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Listening for WebSocket telemetry logs...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-slate-900/80 pb-1.5 text-[11px]">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                log.type === 'BID_RECEIVED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                log.type === 'SAFETY_CHECK' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                log.type === 'REDIS_UPDATE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                log.type === 'AUCTION_WINNER' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                'bg-slate-800 text-slate-300'
              }`}>
                {log.type}
              </span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
