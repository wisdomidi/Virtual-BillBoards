import React, { useState, useEffect } from 'react';
import {
  Code,
  Terminal,
  Copy,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
  Zap,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Send,
  Layers,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AgentSlotPricingInfo } from '../types.js';

interface ApiDocsViewProps {
  selectedCity?: string;
  onNavigateToAgentsHub?: () => void;
  userRole?: string;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({
  selectedCity = 'TYO',
  onNavigateToAgentsHub,
  userRole = 'guest'
}) => {
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'node' | 'autonomous_agent'>('curl');
  const [activeDocSection, setActiveDocSection] = useState<'overview' | 'auth' | 'pricing' | 'buy_slot' | 'status' | 'topup' | 'webhooks' | 'errors'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Pricing Query Sandbox state
  const [targetCityForQuery, setTargetCityForQuery] = useState(selectedCity || 'TYO');
  const [livePricingData, setLivePricingData] = useState<AgentSlotPricingInfo | null>(null);
  const [isQueryingPricing, setIsQueryingPricing] = useState(false);

  const fetchLivePricing = async (cityCode: string) => {
    setIsQueryingPricing(true);
    try {
      const res = await fetch(`/api/v1/agents/slots/pricing?cityCode=${cityCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) {
          setLivePricingData(data.pricing);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch pricing:', err);
    } finally {
      setIsQueryingPricing(false);
    }
  };

  useEffect(() => {
    fetchLivePricing(targetCityForQuery);
  }, [targetCityForQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlExample = `curl -X POST https://ais-pre-iazlo24tw3ughic4ltpk5r-624987754422.asia-southeast1.run.app/api/v1/agents/bids/buy-slot \\
  -H "Authorization: Bearer m2m_live_YOUR_AGENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetCityCode": "TYO",
    "bidAmountDollars": 3.50,
    "paymentMethod": "wallet_balance",
    "ad": {
      "title": "Quantum Neural AI Cloud Engine",
      "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
      "ctaType": "website",
      "ctaUrl": "https://neural-compute.ai",
      "tagline": "Autonomous Neural Inference Cloud"
    }
  }'`;

  const pythonExample = `import requests
import json

AGENT_API_KEY = "m2m_live_YOUR_AGENT_API_KEY"
BASE_URL = "https://ais-pre-iazlo24tw3ughic4ltpk5r-624987754422.asia-southeast1.run.app/api/v1"

headers = {
    "Authorization": f"Bearer {AGENT_API_KEY}",
    "Content-Type": "application/json"
}

# 1. Query Dynamic Pricing & Reserve Floors
pricing_res = requests.get(f"{BASE_URL}/agents/slots/pricing?cityCode=TYO", headers=headers)
pricing = pricing_res.json().get("pricing", {})
print(f"[Floor] Tokyo: \${pricing.get('currentFloorDollars')} | Watchers: {pricing.get('activeWatchers')}")

# 2. Place Programmatic 15s Slot Bid
bid_payload = {
    "targetCityCode": "TYO",
    "bidAmountDollars": float(pricing.get("currentFloorDollars", 1.50)) + 0.50,
    "paymentMethod": "wallet_balance",
    "ad": {
        "title": "Autonomous AI Agent Ingress",
        "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
        "ctaType": "website",
        "ctaUrl": "https://cyberbillboard.io"
    }
}

res = requests.post(f"{BASE_URL}/agents/bids/buy-slot", headers=headers, json=bid_payload)
result = res.json()
print("Bid Result:", json.dumps(result, indent=2))`;

  const nodeExample = `import fetch from 'node-fetch';

const AGENT_API_KEY = 'm2m_live_YOUR_AGENT_API_KEY';
const BASE_URL = 'https://ais-pre-iazlo24tw3ughic4ltpk5r-624987754422.asia-southeast1.run.app/api/v1';

async function buyBillboardSlot() {
  const headers = {
    'Authorization': \`Bearer \${AGENT_API_KEY}\`,
    'Content-Type': 'application/json'
  };

  // 1. Fetch Dynamic Price Floor
  const priceRes = await fetch(\`\${BASE_URL}/agents/slots/pricing?cityCode=NYC\`, { headers });
  const { pricing } = await priceRes.json();
  console.log(\`Current Times Square floor: \$\${pricing.currentFloorDollars}\`);

  // 2. Buy Programmatic 15s Slot
  const bidRes = await fetch(\`\${BASE_URL}/agents/bids/buy-slot\`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      targetCityCode: 'NYC',
      bidAmountDollars: parseFloat(pricing.currentFloorDollars) + 0.25,
      paymentMethod: 'wallet_balance',
      ad: {
        title: 'Zero Latency M2M Ingress',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
        ctaType: 'website',
        ctaUrl: 'https://cyberbillboard.io'
      }
    })
  });

  const receipt = await bidRes.json();
  console.log('Bid placed successfully:', receipt);
}

buyBillboardSlot();`;

  const autonomousBotExample = `"""
Autonomous 24/7 Bidding Bot with Real-Time Dynamic Yield Tracking
Continuously monitors viewer density and bids when expected ROI is optimal.
"""
import time
import requests

API_KEY = "m2m_live_YOUR_AGENT_API_KEY"
BASE_URL = "https://ais-pre-iazlo24tw3ughic4ltpk5r-624987754422.asia-southeast1.run.app/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

TARGET_CITIES = ["TYO", "NYC", "LON", "PAR"]
MAX_BID_DOLLARS = 5.00

def run_agent_cycle():
    for city in TARGET_CITIES:
        try:
            # Query live slot liquidity
            res = requests.get(f"{BASE_URL}/agents/slots/pricing?cityCode={city}", headers=HEADERS)
            data = res.json().get("pricing", {})
            floor = float(data.get("currentFloorDollars", 1.00))
            watchers = int(data.get("activeWatchers", 0))
            top_bid = float(data.get("currentTopBidDollars", 0.00))

            # Strategy: Bid if watchers > 25 and floor within budget
            if watchers >= 25 and floor <= MAX_BID_DOLLARS:
                target_bid = max(floor, top_bid + 0.10)
                if target_bid <= MAX_BID_DOLLARS:
                    print(f"[*] Placing winning bid on [{city}]: \${target_bid:.2f} ({watchers} viewers)")
                    bid_res = requests.post(f"{BASE_URL}/agents/bids/buy-slot", headers=HEADERS, json={
                        "targetCityCode": city,
                        "bidAmountDollars": target_bid,
                        "paymentMethod": "wallet_balance",
                        "ad": {
                            "title": f"Autonomous Broadcast - {city}",
                            "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
                            "ctaType": "website",
                            "ctaUrl": "https://cyberbillboard.io"
                        }
                    })
                    print("--> Result:", bid_res.status_code, bid_res.json().get("isTopBid"))
        except Exception as e:
            print(f"[!] Error on {city}:", e)

if __name__ == "__main__":
    print("Starting Autonomous RTB Bidding Loop...")
    while True:
        run_agent_cycle()
        time.sleep(15)  # Align with 15-second billboard slot rotations`;

  return (
    <div id="developer-api-docs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Code className="w-3.5 h-3.5" />
                REST / JSON API v1.0
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sub-50ms RTB Settlement
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="w-3.5 h-3.5" />
                Bearer Token Auth
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>📖 Machine-to-Machine (M2M) API Documentation</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Integrate external AI agents, programmatic bidders, and automated marketing workflows to buy 15-second digital billboard slots globally with sub-50ms real-time auction insertion and dynamic reserve floor pricing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {onNavigateToAgentsHub && (userRole === 'admin' || userRole === 'advertiser') && (
              <button
                onClick={onNavigateToAgentsHub}
                className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                Open M2M Key & Yield Hub
              </button>
            )}
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Base API URL</div>
            <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5 truncate">/api/v1/agents</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Authentication</div>
            <div className="text-xs font-mono font-bold text-white mt-0.5 truncate">Authorization: Bearer &lt;key&gt;</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Slot Rotation</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">15 Seconds / Slot</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Settlement Rails</div>
            <div className="text-xs font-mono font-bold text-purple-400 mt-0.5">Wallet Balance & Stripe M2M</div>
          </div>
        </div>
      </div>

      {/* Live Interactive Pricing Inspector (No Auth Required for Public Reads) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold">GET</span>
              <h3 className="text-base font-bold text-white">Live Slot Pricing & Liquidity Query</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Public endpoint to query dynamic reserve floors, viewer density, and top active bids in any city feed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">City:</span>
            <select
              value={targetCityForQuery}
              onChange={(e) => setTargetCityForQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="TYO">TYO - Tokyo Shibuya</option>
              <option value="NYC">NYC - Times Square</option>
              <option value="LON">LON - London City</option>
              <option value="PAR">PAR - Paris Champs-Élysées</option>
              <option value="SIN">SIN - Singapore Marina</option>
              <option value="DXB">DXB - Dubai Downtown</option>
              <option value="SEL">SEL - Seoul Gangnam</option>
              <option value="KUL">KUL - Kuala Lumpur</option>
            </select>

            <button
              onClick={() => fetchLivePricing(targetCityForQuery)}
              disabled={isQueryingPricing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Query Live
            </button>
          </div>
        </div>

        {/* Live Returned JSON / Metric Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 space-y-2">
            {livePricingData ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Reserve Floor</div>
                  <div className="text-lg font-black text-white mt-0.5">
                    ${livePricingData.currentFloorDollars}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Connected Viewers</div>
                  <div className="text-lg font-black text-cyan-400 mt-0.5">
                    {livePricingData.activeWatchers}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Top Bid</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">
                    ${livePricingData.currentTopBidDollars}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Surge Multiplier</div>
                  <div className="text-lg font-black text-purple-400 mt-0.5">
                    {livePricingData.surgeMultiplier}x
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-slate-950 border border-slate-800/80 rounded-xl p-6 text-center text-xs text-slate-500 flex items-center justify-center">
                Loading live pricing...
              </div>
            )}
          </div>

          <div className="md:col-span-8 bg-slate-950 border border-slate-800/80 rounded-2xl p-3 font-mono text-xs text-slate-300 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-500">
              <span>GET /api/v1/agents/slots/pricing?cityCode={targetCityForQuery}</span>
              <button
                onClick={() => handleCopy(JSON.stringify(livePricingData || {}, null, 2), 'live_pricing')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
              >
                <Copy className="w-3 h-3" />
                {copiedKey === 'live_pricing' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-slate-300 max-h-[140px] leading-relaxed">
              {JSON.stringify(livePricingData || { loading: true }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Main Endpoints & Code Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              API Endpoints Guide
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveDocSection('overview')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'overview'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>1. Getting Started & Architecture</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('auth')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'auth'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>2. Authentication & Keys</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('pricing')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'pricing'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[9px]">GET</span>
                  <span>/slots/pricing</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('buy_slot')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'buy_slot'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">POST</span>
                  <span>/bids/buy-slot</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('status')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'status'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[9px]">GET</span>
                  <span>/bids/:id/status</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('topup')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'topup'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">POST</span>
                  <span>/wallet/topup</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('webhooks')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'webhooks'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>3. Webhooks & Events</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveDocSection('errors')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeDocSection === 'errors'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>4. HTTP Status Codes & Errors</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </div>
        </div>

        {/* Documentation Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Overview */}
          {activeDocSection === 'overview' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">Getting Started with Programmatic Billboard Bidding</h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">
                  The World First Virtual Billboard M2M Gateway enables external software agents, trading bots, and autonomous AI systems to purchase 15-second digital ad broadcasts in real-time.
                </p>
              </div>

              {/* Token Economics & Pricing Callout */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  Token Economics & Base Pricing Model
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All bids operate on our native <strong className="text-white">Billboard Token Economy</strong>. Base pricing is <strong className="text-cyan-400 font-mono">0.1 cents ($0.001 USD) per token</strong> (1,000 tokens = $1.00 USD). Each 15-second broadcast slot has a standard base reserve floor of <strong className="text-emerald-400 font-mono">1,000 Tokens ($1.00 USD)</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Token Valuation</div>
                    <div className="text-sm font-black text-cyan-400 mt-0.5">1 Token = $0.001 USD</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">15s Slot Base Floor</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">1,000 Tokens ($1.00)</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">API Payload Parameter</div>
                    <div className="text-sm font-black text-purple-400 mt-0.5">bidAmountTokens</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3">How Bidding Works:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs mb-2">1</div>
                    <div className="text-xs font-bold text-white">Query Reserve Floor</div>
                    <div className="text-[11px] text-slate-400 mt-1">Get dynamic reserve pricing based on live viewer density.</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2">2</div>
                    <div className="text-xs font-bold text-white">Submit Ad & Bid</div>
                    <div className="text-[11px] text-slate-400 mt-1">Submit creative & bid in tokens. Top bid takes next 15s broadcast slot.</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs mb-2">3</div>
                    <div className="text-xs font-bold text-white">Burn & Broadcast</div>
                    <div className="text-[11px] text-slate-400 mt-1">Instant M2M token burn and live proof-of-play.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Auth */}
          {activeDocSection === 'auth' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Authentication
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                All write operations and authenticated requests require an Agent API Key passed via the standard HTTP <code className="text-cyan-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">Authorization</code> header.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200">
                <div className="text-slate-500">// Header format:</div>
                <div className="text-cyan-300 font-bold mt-1">Authorization: Bearer m2m_live_6df8a9e2c4014f3b890a5d6e</div>
              </div>

              <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-xs text-cyan-200">
                <strong>Obtaining Keys:</strong> Advertisers and Administrators can generate and top up API keys with custom balances in the <strong>AI Agents & M2M Gateway</strong> tab.
              </div>
            </div>
          )}

          {/* Section: POST Buy Slot */}
          {activeDocSection === 'buy_slot' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">POST</span>
                <code className="text-sm font-mono text-white font-bold">/api/v1/agents/bids/buy-slot</code>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Submits a programmatic bid into the real-time billboard priority queue. If the bid is highest, it will broadcast on the next 15-second slot rotation.
              </p>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-4">Request Body (JSON):</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200">
                <pre className="overflow-x-auto leading-relaxed">{`{
  "targetCityCode": "TYO",            // "TYO" | "NYC" | "LON" | "PAR" | "SIN" | "DXB" | "SEL" | "KUL"
  "bidAmountDollars": 3.50,           // Bid amount in USD (must meet dynamic floor)
  "paymentMethod": "wallet_balance",  // "wallet_balance" | "stripe_m2m"
  "ad": {
    "title": "Quantum Neural AI Cloud",
    "imageUrl": "https://example.com/ad-banner.jpg",
    "ctaType": "website",             // "website" | "whatsapp" | "none"
    "ctaUrl": "https://neural-compute.ai",
    "tagline": "Zero Latency Inference Cloud"
  },
  "webhookUrl": "https://my-agent.io/webhooks/billboard" // Optional callback
}`}</pre>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-4">Response (200 OK):</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200">
                <pre className="overflow-x-auto leading-relaxed">{`{
  "success": true,
  "bidId": "bid_agent_7a8b9c",
  "queuePosition": 1,
  "isTopBid": true,
  "cityCode": "TYO",
  "bidAmountDollars": "3.50",
  "estimatedBroadcastTime": "Next 15s Slot (12s remaining)",
  "receipt": {
    "m2mTransactionId": "m2m_tx_1724330000",
    "paymentMethod": "wallet_balance",
    "status": "succeeded",
    "timestamp": "2026-08-22T08:50:00.000Z"
  }
}`}</pre>
              </div>
            </div>
          )}

          {/* Section: Webhooks */}
          {activeDocSection === 'webhooks' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                Webhooks & Real-Time Event Callbacks
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Configure a webhook URL to receive asynchronous HTTP POST callbacks when your ad broadcast starts, completes, or is outbid by another agent.
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs font-mono font-bold text-cyan-400">ad.slot_broadcast_started</div>
                  <div className="text-xs text-slate-400 mt-1">Fires the exact millisecond your ad begins broadcasting on the digital billboard screen.</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs font-mono font-bold text-emerald-400">ad.slot_completed</div>
                  <div className="text-xs text-slate-400 mt-1">Includes total verified viewers, impressions, and proof-of-play Cloudflare Ray receipt.</div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Error Codes */}
          {activeDocSection === 'errors' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-black text-white">HTTP Status Codes & Error Responses</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <span className="text-emerald-400 font-bold">200 OK</span>
                  <span className="text-slate-400">Bid placed or pricing returned successfully</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <span className="text-amber-400 font-bold">401 Unauthorized</span>
                  <span className="text-slate-400">Missing or invalid Agent Bearer Token</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <span className="text-rose-400 font-bold">402 Payment Required</span>
                  <span className="text-slate-400">Insufficient agent wallet balance</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                  <span className="text-purple-400 font-bold">422 Unprocessable</span>
                  <span className="text-slate-400">Bid below dynamic reserve floor for city</span>
                </div>
              </div>
            </div>
          )}

          {/* Code SDK Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Integration Code Examples & SDKs
              </h4>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveCodeLang('curl')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeCodeLang === 'curl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeLang('python')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeCodeLang === 'python' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeLang('node')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeCodeLang === 'node' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  Node.js
                </button>
                <button
                  onClick={() => setActiveCodeLang('autonomous_agent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeCodeLang === 'autonomous_agent' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  🤖 Full Agent Bot (Python)
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed">
                {activeCodeLang === 'curl' && curlExample}
                {activeCodeLang === 'python' && pythonExample}
                {activeCodeLang === 'node' && nodeExample}
                {activeCodeLang === 'autonomous_agent' && autonomousBotExample}
              </pre>

              <button
                onClick={() => {
                  const code =
                    activeCodeLang === 'curl'
                      ? curlExample
                      : activeCodeLang === 'python'
                      ? pythonExample
                      : activeCodeLang === 'node'
                      ? nodeExample
                      : autonomousBotExample;
                  handleCopy(code, 'sdk_code');
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 border border-slate-700 shadow-md"
              >
                {copiedKey === 'sdk_code' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
