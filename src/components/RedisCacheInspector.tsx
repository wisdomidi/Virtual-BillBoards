import React, { useState } from 'react';
import { REDIS_DESIGN_MARKDOWN } from '../data/blueprintData';
import {
  Zap,
  Terminal,
  Server,
  Layers,
  Database,
  Play,
  Cpu,
  Clock
} from 'lucide-react';

export const RedisCacheInspector: React.FC = () => {
  const [cliInput, setCliInput] = useState('ZREVRANGE billboard:queue:KUL 0 0 WITHSCORES');
  const [cliOutput, setCliOutput] = useState<string>(
    '1) "cmp_kul_01"\n2) "2500"  (Score = $25.00 eCPM)'
  );

  const presets = [
    {
      label: 'Fetch Top City Bid (KUL)',
      cmd: 'ZREVRANGE billboard:queue:KUL 0 0 WITHSCORES',
      out: '1) "cmp_kul_01"\n2) "2500"  (Score = $25.00 eCPM)\n[Latency: 0.12ms]'
    },
    {
      label: 'Get Ad Metadata Hash',
      cmd: 'HGETALL billboard:ad:cmp_kul_01',
      out: '1) "title"           2) "KL Tech Summit 2026"\n3) "image_url"       4) "https://..."\n5) "advertiser"      6) "Aegis Digital"\n7) "safety_verified" 8) "1"\n[Latency: 0.08ms]'
    },
    {
      label: 'Check Active Slot Winner',
      cmd: 'GET billboard:active:KUL',
      out: '{"slot_id": "SLOT-984321", "campaign_id": "cmp_kul_01", "bid_cents": 2500, "ttl": 15}\n[Latency: 0.05ms]'
    },
    {
      label: 'Publish WebSocket Event',
      cmd: 'PUBLISH billboard:events:KUL "{"event":"SLOT_CHANGE"}"',
      out: '(integer) 42  (Delivered to 42 active WebSocket cluster nodes in 0.35ms)'
    }
  ];

  const handleRunCli = (cmdStr?: string) => {
    const input = cmdStr || cliInput;
    const match = presets.find((p) => p.cmd.trim() === input.trim());
    if (match) {
      setCliOutput(match.out);
    } else {
      setCliOutput(`> Executing on Redis Cluster [0.18ms]:\nOK -> Result returned for: ${input}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Redis Sub-Millisecond Cache Architecture
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            ZSET Bidding Queues, HSET Ad Metadata, Active Slot Locks, and Pub/Sub Event Pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Target Latency: &lt; 0.5ms</span>
          </div>
        </div>
      </div>

      {/* Redis Key-Space Schema Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-2">
            <span>1. ZSET Bidding Queue</span>
            <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">O(log N)</span>
          </div>
          <p className="text-slate-400 text-[11px]">Key: <code className="text-white">billboard:queue:&#123;REGION&#125;</code></p>
          <p className="text-slate-300">Score = <span className="text-cyan-400 font-bold">bid_amount_cents</span></p>
          <p className="text-slate-300">Member = <span className="text-emerald-400">campaign_id</span></p>
          <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-500 border border-slate-800">
            ZREVRANGE billboard:queue:KUL 0 0 WITHSCORES
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-2">
            <span>2. HSET Ad Metadata</span>
            <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">O(1)</span>
          </div>
          <p className="text-slate-400 text-[11px]">Key: <code className="text-white">billboard:ad:&#123;CAMPAIGN_ID&#125;</code></p>
          <p className="text-slate-300">Fields = <span className="text-cyan-400">title, image_url, advertiser, safety</span></p>
          <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-500 border border-slate-800">
            HGETALL billboard:ad:cmp_kul_01
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span>3. STRING Slot Lock</span>
            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">TTL = 15s</span>
          </div>
          <p className="text-slate-400 text-[11px]">Key: <code className="text-white">billboard:active:&#123;REGION&#125;</code></p>
          <p className="text-slate-300">Value = <span className="text-cyan-400">JSON Winner Payload</span></p>
          <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-500 border border-slate-800">
            SET billboard:active:KUL "&#123;...&#125;" EX 15
          </div>
        </div>
      </div>

      {/* Interactive Redis CLI Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Redis CLI & Key Simulator
          </h3>
          <span className="text-xs text-slate-500 font-mono">Redis 7.2 Cluster</span>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCliInput(p.cmd);
                handleRunCli(p.cmd);
              }}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* CLI Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-emerald-400 font-bold font-mono text-xs">&gt;</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => handleRunCli()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>
        </div>

        {/* CLI Terminal Output */}
        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto min-h-[120px]">
          {cliOutput}
        </pre>
      </div>

      {/* Redis Spec Markdown Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Redis Cache Design Specification & Throughput Math
        </h3>
        <pre className="text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800/80 overflow-x-auto leading-relaxed">
          {REDIS_DESIGN_MARKDOWN}
        </pre>
      </div>
    </div>
  );
};
