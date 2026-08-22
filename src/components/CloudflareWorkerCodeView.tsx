import React, { useState } from 'react';
import {
  Server,
  Zap,
  Copy,
  Check,
  Code2,
  Lock,
  Play,
  CheckCircle2,
  Globe,
  Database,
  Cpu
} from 'lucide-react';

export const CloudflareWorkerCodeView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'test_m2m' | 'test_rtb'>('code');
  const [testCity, setTestCity] = useState('KUL');
  const [testAmountCents, setTestAmountCents] = useState(2500);
  const [testResult, setTestResult] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const workerCode = `/**
 * Cloudflare Worker: M2M Payment Middleware & Real-Time Bidding Cache
 * Edge Latency Target: < 5ms
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-M2M-Payment-Token, X-City-Code',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // 1. M2M Payment Middleware Endpoint
    if (path === '/api/m2m/settle' && request.method === 'POST') {
      const paymentToken = request.headers.get('X-M2M-Payment-Token');
      if (!paymentToken || !paymentToken.startsWith('m2m_tok_')) {
        return new Response(JSON.stringify({
          error: 'Payment Required',
          code: 402,
          message: 'Missing or invalid X-M2M-Payment-Token'
        }), { status: 402, headers: corsHeaders });
      }

      const body = await request.json();
      const walletKey = \`wallet:\${body.advertiserId || 'anon'}\`;
      const currentBalanceCents = parseInt(await env.BIDDING_KV.get(walletKey) || '50000');

      if (currentBalanceCents < body.amountCents) {
        return new Response(JSON.stringify({ error: 'Insufficient Funds', code: 402 }), { status: 402, headers: corsHeaders });
      }

      const newBalance = currentBalanceCents - body.amountCents;
      await env.BIDDING_KV.put(walletKey, newBalance.toString());

      return new Response(JSON.stringify({
        success: true,
        status: 'SETTLED',
        txId: \`tx_m2m_\${Date.now()}\`,
        remainingBalanceCents: newBalance
      }), { status: 200, headers: corsHeaders });
    }

    // 2. Real-Time Bidding (RTB) Edge Cache Lookup
    if (path === '/api/rtb/highest-bid' && request.method === 'GET') {
      const cityCode = (url.searchParams.get('city') || 'KUL').toUpperCase();
      const cacheKey = \`rtb:winner:\${cityCode}\`;

      const cachedWinner = await env.BIDDING_KV.get(cacheKey, { type: 'json' });
      if (cachedWinner && cachedWinner.expiresAt > Date.now()) {
        return new Response(JSON.stringify({
          source: 'CLOUDFLARE_EDGE_KV_CACHE',
          latencyMs: 2,
          winningAd: cachedWinner.ad
        }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({
        source: 'DATABASE_AUCTION_EVALUATION',
        latencyMs: 12,
        cityCode
      }), { headers: corsHeaders });
    }
  }
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRunM2MTest = async () => {
    setLoadingTest(true);
    setTestResult(null);
    try {
      // Simulate Cloudflare Worker execution
      await new Promise(r => setTimeout(r, 120));
      setTestResult({
        status: 200,
        statusText: 'OK (Settled via M2M Middleware)',
        headers: { 'cf-edge-location': 'SIN-1', 'x-m2m-latency-ms': '3ms' },
        data: {
          success: true,
          status: 'SETTLED',
          txId: `tx_m2m_${Date.now()}`,
          debitedCents: testAmountCents,
          remainingBalanceCents: 50000 - testAmountCents,
          cityCode: testCity,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setLoadingTest(false);
    }
  };

  const handleRunRTBTest = async () => {
    setLoadingTest(true);
    setTestResult(null);
    try {
      await new Promise(r => setTimeout(r, 45));
      setTestResult({
        status: 200,
        statusText: '200 OK (Edge KV Hit)',
        headers: { 'cf-cache-status': 'HIT', 'cf-edge-latency': '2.1ms' },
        data: {
          source: 'CLOUDFLARE_EDGE_KV_CACHE',
          latencyMs: 2.1,
          cityCode: testCity,
          winningAd: {
            id: `${testCity.toLowerCase()}_flagship_01`,
            title: `${testCity} Metro Cloud Platform`,
            advertiserName: `${testCity} Tech Ventures`,
            bidCents: 3500,
            cityCode: testCity,
            status: 'approved'
          }
        }
      });
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl text-slate-950 font-black shadow-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Cloudflare Worker Edge Runtime
              </h2>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                API Settlement & RTB Cache
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ultra-low latency (&lt;5ms) edge middleware for programmatic micro-settlements and real-time ad bidding KV resolution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Copied Code!' : 'Copy Worker Script'}</span>
          </button>
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'code'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white bg-slate-950'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Worker Source Code</span>
        </button>

        <button
          onClick={() => setActiveTab('test_m2m')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'test_m2m'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white bg-slate-950'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Test API Settlement (HTTP 402)</span>
        </button>

        <button
          onClick={() => setActiveTab('test_rtb')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'test_rtb'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white bg-slate-950'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Test RTB Edge Cache (&lt;5ms)</span>
        </button>
      </div>

      {/* Tab 1: Source Code Viewer */}
      {activeTab === 'code' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>/workers/m2m-bidding-worker.js</span>
            <span className="text-amber-400 font-bold">Cloudflare V8 Isolate Environment</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-96">
            <code>{workerCode}</code>
          </pre>
        </div>
      )}

      {/* Tab 2 & 3: Interactive Worker Execution Sandbox */}
      {(activeTab === 'test_m2m' || activeTab === 'test_rtb') && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Target City Code</label>
              <select
                value={testCity}
                onChange={(e) => setTestCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-xl font-mono text-xs"
              >
                <option value="KUL">Kuala Lumpur (KUL)</option>
                <option value="TYO">Tokyo (TYO)</option>
                <option value="NYC">New York (NYC)</option>
                <option value="LON">London (LON)</option>
                <option value="SIN">Singapore (SIN)</option>
              </select>
            </div>

            {activeTab === 'test_m2m' && (
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">API Micro-Settlement (Cents)</label>
                <input
                  type="number"
                  value={testAmountCents}
                  onChange={(e) => setTestAmountCents(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-xl font-mono text-xs"
                />
              </div>
            )}

            <div className="sm:col-span-1 flex items-end">
              <button
                onClick={activeTab === 'test_m2m' ? handleRunM2MTest : handleRunRTBTest}
                disabled={loadingTest}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loadingTest ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Execute Worker {activeTab === 'test_m2m' ? 'API Settle' : 'RTB Lookup'}</span>
              </button>
            </div>
          </div>

          {/* Execution Log Result */}
          {testResult && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Cloudflare Worker Edge Execution Output
                </span>
                <span className="text-[10px] font-mono text-slate-400">Response 200 OK</span>
              </div>
              <pre className="text-xs font-mono text-cyan-300 p-2 bg-slate-900 rounded-xl overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
