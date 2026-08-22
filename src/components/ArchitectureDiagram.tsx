import React, { useState } from 'react';
import { ARCHITECTURE_ASCII, MERMAID_DIAGRAM } from '../data/blueprintData';
import { CloudflareWorkerCodeView } from './CloudflareWorkerCodeView';
import {
  GitBranch,
  Copy,
  Check,
  Zap,
  Server,
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [format, setFormat] = useState<'ascii' | 'mermaid'>('ascii');
  const [copied, setCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('redis');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nodes = [
    {
      id: 'gateway',
      title: '1. API Gateway & Auth',
      latency: '< 5 ms',
      tech: 'Express / Fastify + JWT Token',
      desc: 'Authenticates advertiser API requests, verifies HMAC signature, checks wallet balance locks.',
      code: `app.post('/api/bids/submit', authenticate, checkBalance);`
    },
    {
      id: 'ai_safety',
      title: '2. Gemini Vision AI Safety Check',
      latency: '150 - 300 ms',
      tech: 'Gemini 3.7 Flash Vision API',
      desc: 'Multimodal content review scanning ad images and text for NSFW, hate speech, or trademark violations before queueing.',
      code: `const result = await ai.models.generateContent({ model: 'gemini-3.7-flash', contents: prompt });`
    },
    {
      id: 'redis',
      title: '3. Redis Sub-ms Bidding Cache',
      latency: '< 0.5 ms',
      tech: 'Redis Cluster (ZSET + HSET + Pub/Sub)',
      desc: 'In-memory Sorted Sets maintain live bid order per region key. Enables sub-millisecond top-bid retrieval.',
      code: `await redis.zadd('billboard:queue:KUL', bidAmountCents, campaignId);`
    },
    {
      id: 'auction',
      title: '4. RTB Fallback Cascade Engine',
      latency: '< 0.8 ms',
      tech: 'Server-Side Node.js / Rust Loop',
      desc: 'Evaluates 15-second slot winners. If City queue is empty, cascades seamlessly to Country -> Global -> House Ad.',
      code: `const winner = await evaluateCascade('KUL', 'MY');`
    },
    {
      id: 'websocket',
      title: '5. WebSocket Real-Time Push',
      latency: '< 10 ms',
      tech: 'Socket.io / ws Server Cluster',
      desc: 'Subscribes to Redis Pub/Sub events and broadcasts 15s slot change payloads to localized client browsers.',
      code: `wss.broadcast({ type: 'SLOT_CHANGE', slotId, winningAd });`
    },
    {
      id: 'postgres',
      title: '6. PostgreSQL Settlement Store',
      latency: 'Async Write-Behind',
      tech: 'PostgreSQL 15+ (Relational)',
      desc: 'Performs asynchronous ledger recording, user point payout updates, and advertiser balance deductions.',
      code: `SELECT process_winning_bid_settlement(advertiser_id, bid_amount_cents);`
    }
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[2];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            System Architecture & Data Journey Blueprint
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            End-to-End Bid Lifecycle: Advertiser -&gt; API Gateway -&gt; Gemini AI -&gt; Redis ZSET -&gt; Cascade -&gt; WebSocket -&gt; Browser
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center text-xs font-mono">
            <button
              onClick={() => setFormat('ascii')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                format === 'ascii' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              ASCII Flowchart
            </button>
            <button
              onClick={() => setFormat('mermaid')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                format === 'mermaid' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mermaid.js Code
            </button>
          </div>

          <button
            onClick={() => copyToClipboard(format === 'ascii' ? ARCHITECTURE_ASCII : MERMAID_DIAGRAM)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition-all border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied Diagram!' : 'Copy Diagram'}</span>
          </button>
        </div>
      </div>

      {/* Diagram Viewer Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-x-auto shadow-2xl relative font-mono text-xs">
        <div className="absolute top-3 right-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          {format === 'ascii' ? 'ASCII Architectural Topology' : 'Mermaid.js Graph Script'}
        </div>
        <pre className="text-cyan-300 leading-relaxed overflow-x-auto">
          {format === 'ascii' ? ARCHITECTURE_ASCII : MERMAID_DIAGRAM}
        </pre>
      </div>

      {/* Interactive Node Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Interactive System Node Inspector (Click Node to Inspect):
        </h3>

        {/* Node Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold truncate">{node.title}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">{node.latency}</div>
              </button>
            );
          })}
        </div>

        {/* Active Node Detail Card */}
        <div className="bg-slate-950 border border-cyan-800/40 rounded-xl p-5 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-sm text-cyan-300">{activeNode.title}</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px] font-bold">
              Latency Target: {activeNode.latency}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div>
              <span className="text-slate-500 block mb-1">Technology Stack:</span>
              <p className="font-bold text-white bg-slate-900 p-2 rounded border border-slate-800">{activeNode.tech}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Node Responsibility:</span>
              <p className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">{activeNode.desc}</p>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Key Code Signature:</span>
            <pre className="bg-slate-900 p-3 rounded border border-slate-800 text-emerald-400 overflow-x-auto">
              {activeNode.code}
            </pre>
          </div>
        </div>

        {/* Cloudflare Worker Edge Middleware Section */}
        <div className="pt-4">
          <CloudflareWorkerCodeView />
        </div>
      </div>
    </div>
  );
};
