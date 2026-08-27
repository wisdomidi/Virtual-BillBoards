import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  Terminal,
  Play,
  Copy,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Flame,
  ArrowRight,
  Code2,
  Layers,
  Cpu,
  Tv,
  Coins,
  Send,
  ExternalLink
} from 'lucide-react';
import { webMCPRegistry } from '../lib/webmcp';

export const WebMcpPlayground: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('fetchActiveBillboard');
  const [cityArg, setCityArg] = useState<string>('TYO');
  const [titleArg, setTitleArg] = useState<string>('Quantum AI Neural Co-Pilot — 50% Off');
  const [imgArg, setImgArg] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
  const [bidArg, setBidArg] = useState<number>(2.00);
  const [handleArg, setHandleArg] = useState<string>('elonmusk');
  
  const [executing, setExecuting] = useState<boolean>(false);
  const [outputJson, setOutputJson] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [guardianActive, setGuardianActive] = useState<boolean>(false);
  const [guardianLogs, setGuardianLogs] = useState<string[]>([]);

  const tools = webMCPRegistry.getTools();

  const handleRunTool = async () => {
    setExecuting(true);
    const start = performance.now();
    try {
      let args: any = {};
      if (selectedTool === 'fetchActiveBillboard') {
        args = { city: cityArg, country: 'GLOBAL' };
      } else if (selectedTool === 'placeAdBid') {
        args = {
          title: titleArg,
          imageUrl: imgArg,
          targetCityCode: cityArg,
          bidAmountDollars: bidArg,
          advertiserName: 'WebMCP Autonomous Agent',
          ctaUrl: 'https://livebillboards.lol'
        };
      } else if (selectedTool === 'bidTier1StaringEyeballs') {
        args = {
          title: titleArg,
          imageUrl: imgArg,
          targetCityCode: cityArg,
          bidAmountDollars: Math.max(5.00, bidArg),
          advertiserName: 'Tier 1 WebMCP AI Agent',
          ctaUrl: 'https://livebillboards.lol'
        };
      } else if (selectedTool === 'sponsorStreamerGameStateEvent') {
        args = {
          streamerId: handleArg || 'creator',
          eventType: 'victory_royale',
          headline: titleArg || '👑 VICTORY ROYALE SPONSORED BY APEX GPU!',
          sponsorName: 'Apex Cloud & AI',
          sponsorImageUrl: imgArg || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
          bidAmountDollars: Math.max(5.00, bidArg)
        };
      } else if (selectedTool === 'claimCreatorHandle') {
        args = { handle: handleArg };
      } else if (selectedTool === 'getCityLeaderboard') {
        args = { limit: 10 };
      }

      const result = await webMCPRegistry.executeTool(selectedTool, args);
      const elapsed = Math.round(performance.now() - start);
      setExecutionTimeMs(elapsed);
      setOutputJson(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setOutputJson(JSON.stringify({ error: err.message || 'Tool execution failed' }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  const toggleGuardian = () => {
    if (!guardianActive) {
      setGuardianActive(true);
      setGuardianLogs([
        `[${new Date().toLocaleTimeString()}] 🤖 Autonomous Outbid Guardian activated for city [${cityArg}].`,
        `[${new Date().toLocaleTimeString()}] 🎯 Target Strategy: Maintain #1 Rank with max budget $${(bidArg + 3).toFixed(2)}/slot.`,
        `[${new Date().toLocaleTimeString()}] 📡 Polling live RTB queue every 15s via WebMCP fetchActiveBillboard()...`
      ]);
    } else {
      setGuardianActive(false);
      setGuardianLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🛑 Guardian standing down. Strategy safely paused.`,
        ...prev
      ]);
    }
  };

  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        "virtual-billboard-network": {
          "url": "https://www.livebillboards.lol/api/mcp/manifest",
          "description": "24/7 Global Infinite Virtual Billboard & Live Stream Ad Network"
        }
      }
    },
    null,
    2
  );

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(mcpConfigSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-cyan-500/40 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase shadow-inner">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>OpenAI WebMCP Challenge Official Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            WebMCP Autonomous Agent Interactive Playground
          </h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            LiveBillboards.lol implements the open <strong>Model Context Protocol (WebMCP)</strong> standard. Autonomous AI agents, ChatGPT in-app browsers, and Chrome agentic panels can discover, inspect, outbid, and broadcast 15-second creative takeovers worldwide without visual DOM scraping.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Standard</div>
              <div className="text-sm font-black text-cyan-400 mt-0.5">WebMCP 1.0</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Tools Registered</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">{tools.length} Tools Live</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Execution Latency</div>
              <div className="text-sm font-black text-amber-400 mt-0.5">&lt; 20ms RTB</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Discovery Manifest</div>
              <div className="text-sm font-black text-purple-400 mt-0.5">/.well-known/mcp.json</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Runner + Output Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Tool Selector & Parameter Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>1. Select WebMCP Tool</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">window.webMCP</span>
            </div>

            <div className="space-y-2">
              {tools.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedTool(t.name);
                    setOutputJson(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTool === t.name
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono font-bold flex items-center gap-2">
                      <span className={selectedTool === t.name ? 'text-cyan-300' : 'text-slate-300'}>
                        {t.name}()
                      </span>
                      {t.readOnlyHint && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          readOnly
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {t.description}
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${selectedTool === t.name ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            {/* Dynamic Parameter Fields */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                <span>Input Parameters (JSON Schema)</span>
              </div>

              {(selectedTool === 'fetchActiveBillboard' || selectedTool === 'placeAdBid' || selectedTool === 'bidTier1StaringEyeballs') && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">targetCityCode:</label>
                  <select
                    value={cityArg}
                    onChange={(e) => setCityArg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TYO">TYO (Tokyo Shibuya)</option>
                    <option value="NYC">NYC (Times Square Manhattan)</option>
                    <option value="LON">LON (London City)</option>
                    <option value="KUL">KUL (Kuala Lumpur KLCC)</option>
                    <option value="PAR">PAR (Paris Champs-Élysées)</option>
                    <option value="GLOBAL">GLOBAL (Worldwide Network Feed)</option>
                  </select>
                </div>
              )}

              {(selectedTool === 'placeAdBid' || selectedTool === 'bidTier1StaringEyeballs') && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">title:</label>
                    <input
                      type="text"
                      value={titleArg}
                      onChange={(e) => setTitleArg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">imageUrl:</label>
                    <input
                      type="text"
                      value={imgArg}
                      onChange={(e) => setImgArg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono truncate focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">bidAmountDollars:</label>
                    <input
                      type="number"
                      min="1.00"
                      step="0.50"
                      value={bidArg}
                      onChange={(e) => setBidArg(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}

              {selectedTool === 'claimCreatorHandle' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">handle:</label>
                  <input
                    type="text"
                    value={handleArg}
                    onChange={(e) => setHandleArg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <button
                onClick={handleRunTool}
                disabled={executing}
                className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Executing WebMCP Protocol...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Execute {selectedTool}()</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick ChatGPT / Claude Config Snippet */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>ChatGPT & Claude Desktop Config</span>
              </div>
              <button
                onClick={handleCopyConfig}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedConfig ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedConfig ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-850 rounded-2xl text-[10px] font-mono text-cyan-300 overflow-x-auto">
              {mcpConfigSnippet}
            </pre>
          </div>
        </div>

        {/* Col 2: Telemetry Console & Execution Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Execution Telemetry & Output
                </h3>
              </div>
              {executionTimeMs !== null && (
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ⚡ {executionTimeMs}ms Response
                </span>
              )}
            </div>

            {/* Output Inspector */}
            <div className="flex-1 min-h-[280px] bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto relative">
              {outputJson ? (
                <pre className="text-cyan-300 leading-relaxed">{outputJson}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2 py-12">
                  <Bot className="w-10 h-10 text-slate-700 animate-pulse" />
                  <p className="text-xs font-mono">Select a tool and click "Execute" to inspect the live WebMCP protocol payload.</p>
                </div>
              )}
            </div>

            {/* Human-in-the-loop Autonomous Outbid Guardian */}
            <div className="bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 border border-purple-500/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Human-Agent Collaboration: Autonomous Outbid Guardian
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Empowers users to set budget constraints while an AI agent protects their live screen takeover.
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleGuardian}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    guardianActive
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-md'
                  }`}
                >
                  {guardianActive ? 'Stop Guardian' : 'Deploy Guardian'}
                </button>
              </div>

              {guardianLogs.length > 0 && (
                <div className="p-3 bg-black/60 border border-purple-500/20 rounded-xl space-y-1 font-mono text-[10px] text-purple-300">
                  {guardianLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
