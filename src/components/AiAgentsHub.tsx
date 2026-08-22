import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  TrendingUp,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  DollarSign,
  Globe,
  Radio,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Code,
  Copy,
  Terminal,
  Activity,
  Layers,
  Key,
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  Send,
  HelpCircle,
  Clock
} from 'lucide-react';
import {
  AgentApiKey,
  DynamicYieldPricingStatus,
  CityYieldPricingItem,
  M2MTransactionItem,
  YieldPricingDecisionLog,
  AgentBidResponse
} from '../types.js';
import { INITIAL_AGENT_API_KEYS, INITIAL_DYNAMIC_YIELD_STATUS, INITIAL_M2M_TRANSACTIONS } from '../data/aiAgentsData.js';

interface AiAgentsHubProps {
  selectedCity: string;
  onCityChange?: (city: string, country: string) => void;
  onOpenWalletModal?: () => void;
  currentUser?: any;
}

export const AiAgentsHub: React.FC<AiAgentsHubProps> = ({
  selectedCity,
  onCityChange,
  onOpenWalletModal,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'keys' | 'playground' | 'yield' | 'ledger' | 'docs'>('keys');
  const [agentKeys, setAgentKeys] = useState<AgentApiKey[]>(INITIAL_AGENT_API_KEYS);
  const [yieldStatus, setYieldStatus] = useState<DynamicYieldPricingStatus>(INITIAL_DYNAMIC_YIELD_STATUS);
  const [m2mTransactions, setM2mTransactions] = useState<M2MTransactionItem[]>(INITIAL_M2M_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Key creation modal state
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    keyName: 'Autonomous Ad-Buying Bot',
    ownerUserEmail: currentUser?.email || 'agent-developer@rtb.io',
    initialDepositDollars: 100,
    allowedCities: ['*'],
    webhookUrl: 'https://my-agent.io/webhooks/billboard-play',
    autoFundThresholdDollars: 25,
    autoFundAmountDollars: 100
  });

  // Wallet top-up modal state
  const [selectedKeyForTopup, setSelectedKeyForTopup] = useState<AgentApiKey | null>(null);
  const [topupAmountDollars, setTopupAmountDollars] = useState(100);

  // Dynamic yield tuning modal state
  const [isTuningModalOpen, setIsTuningModalOpen] = useState(false);
  const [tuningParams, setTuningParams] = useState({
    minFloorDollars: 0.50,
    maxFloorDollars: 50.00,
    surgeElasticity: 0.5,
    discountEnabled: true
  });

  const [geminiInsights, setGeminiInsights] = useState<string | null>(null);

  // Interactive Playground Console State
  const [selectedApiKey, setSelectedApiKey] = useState<string>(INITIAL_AGENT_API_KEYS[0]?.apiKey || '');
  const [playgroundAction, setPlaygroundAction] = useState<'buy_slot' | 'query_pricing' | 'check_bid' | 'topup_wallet'>('buy_slot');
  const [playgroundPayload, setPlaygroundPayload] = useState({
    targetCityCode: selectedCity || 'TYO',
    bidAmountDollars: 3.50,
    adTitle: 'Quantum Neural AI Cloud Engine',
    adImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    ctaType: 'website',
    ctaUrl: 'https://neural-compute.ai',
    tagline: 'Zero-latency neural inference for autonomous agents and robotics.',
    paymentMethod: 'wallet_balance' as 'wallet_balance' | 'stripe_m2m',
    bidIdToCheck: '',
    topupAmount: 50
  });
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch Agent Keys, Dynamic Yield, and Transactions on load & interval
  const fetchData = async () => {
    try {
      const [keysRes, yieldRes, txRes] = await Promise.all([
        fetch('/api/v1/agents/keys'),
        fetch('/api/agents/yield-pricing'),
        fetch('/api/v1/m2m/transactions')
      ]);

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        if (keysData.keys) setAgentKeys(keysData.keys);
      }
      if (yieldRes.ok) {
        const yieldData = await yieldRes.json();
        if (yieldData.yieldStatus) {
          setYieldStatus(yieldData.yieldStatus);
          setTuningParams({
            minFloorDollars: (yieldData.yieldStatus.tuningParams.minFloorCents || 50) / 100,
            maxFloorDollars: (yieldData.yieldStatus.tuningParams.maxFloorCents || 5000) / 100,
            surgeElasticity: yieldData.yieldStatus.tuningParams.surgeElasticity || 0.5,
            discountEnabled: yieldData.yieldStatus.tuningParams.discountEnabled ?? true
          });
        }
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.transactions) setM2mTransactions(txData.transactions);
      }
    } catch (err) {
      console.warn('Failed to fetch AI agent data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Create new Agent API Key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/agents/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeyForm)
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(`Created new M2M API Key [${data.key.keyName}]!`);
        setIsCreateKeyModalOpen(false);
        fetchData();
        if (data.key?.apiKey) {
          setSelectedApiKey(data.key.apiKey);
        }
      } else {
        alert(data.error || 'Failed to generate key');
      }
    } catch (err: any) {
      alert(err.message || 'Error generating key');
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Revoke an Agent API Key
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this Agent API Key? It will immediately stop accepting programmatic ad buys.')) return;
    try {
      const res = await fetch(`/api/v1/agents/keys/${keyId}/revoke`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionFeedback('Agent API Key revoked.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Top up agent wallet
  const handleTopupKeyWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyForTopup) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/agents/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedKeyForTopup.apiKey}`
        },
        body: JSON.stringify({
          amountDollars: topupAmountDollars,
          description: `Manual Dashboard Deposit to ${selectedKeyForTopup.keyName}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(`Credited +$${topupAmountDollars.toFixed(2)} to [${selectedKeyForTopup.keyName}]!`);
        setSelectedKeyForTopup(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to top up wallet');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing topup');
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Execute Live Interactive API Call from Playground
  const handleExecutePlayground = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    const targetKey = selectedApiKey || agentKeys[0]?.apiKey;
    if (!targetKey) {
      alert('Please create or select an Agent API Key first.');
      setPlaygroundLoading(false);
      return;
    }

    try {
      let endpoint = '';
      let method = 'GET';
      let bodyData: any = null;

      if (playgroundAction === 'buy_slot') {
        endpoint = '/api/v1/agents/bids/buy-slot';
        method = 'POST';
        bodyData = {
          targetCityCode: playgroundPayload.targetCityCode,
          bidAmountDollars: playgroundPayload.bidAmountDollars,
          ad: {
            title: playgroundPayload.adTitle,
            imageUrl: playgroundPayload.adImageUrl,
            ctaType: playgroundPayload.ctaType,
            ctaUrl: playgroundPayload.ctaUrl,
            tagline: playgroundPayload.tagline
          },
          paymentMethod: playgroundPayload.paymentMethod
        };
      } else if (playgroundAction === 'query_pricing') {
        endpoint = `/api/v1/agents/slots/pricing?cityCode=${playgroundPayload.targetCityCode}`;
        method = 'GET';
      } else if (playgroundAction === 'check_bid') {
        const id = playgroundPayload.bidIdToCheck || 'bid_agent_sample';
        endpoint = `/api/v1/agents/bids/${id}/status`;
        method = 'GET';
      } else if (playgroundAction === 'topup_wallet') {
        endpoint = '/api/v1/agents/wallet/topup';
        method = 'POST';
        bodyData = {
          amountDollars: playgroundPayload.topupAmount,
          description: 'Interactive Console Deposit'
        };
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${targetKey}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(endpoint, {
        method,
        headers,
        body: bodyData ? JSON.stringify(bodyData) : undefined
      });

      const responseJson = await res.json();
      setPlaygroundResponse({
        httpStatus: res.status,
        statusText: res.statusText,
        endpoint,
        method,
        timestamp: new Date().toISOString(),
        headers: {
          'content-type': 'application/json',
          'cf-ray': `${Math.random().toString(36).substring(2, 10)}-RTB`,
          'x-m2m-latency-ms': `${Math.floor(Math.random() * 25) + 18}ms`
        },
        data: responseJson
      });

      if (playgroundAction === 'buy_slot' && responseJson.bidId) {
        setPlaygroundPayload((prev) => ({ ...prev, bidIdToCheck: responseJson.bidId }));
      }

      fetchData();
    } catch (err: any) {
      setPlaygroundResponse({
        httpStatus: 500,
        error: err.message || 'Request execution error'
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Toggle Dynamic Yield Autopilot
  const handleToggleAutopilot = async () => {
    try {
      const res = await fetch('/api/agents/yield-pricing/toggle', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setYieldStatus((prev) => ({ ...prev, autopilotActive: data.autopilotActive }));
        setActionFeedback(`Dynamic Yield Autopilot: ${data.autopilotActive ? 'ACTIVE' : 'PAUSED'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Optimize dynamic yield with Gemini AI insights
  const handleRunYieldOptimizer = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agents/yield-pricing/optimize-now', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.geminiInsights) setGeminiInsights(data.geminiInsights);
        if (data.yieldStatus) setYieldStatus(data.yieldStatus);
        setActionFeedback('Dynamic Yield Matrix optimized across all global rooms.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Save tuned parameters
  const handleSaveTuning = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/agents/yield-pricing/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tuningParams)
      });
      const data = await res.json();
      if (data.success) {
        setIsTuningModalOpen(false);
        setActionFeedback('Dynamic yield parameters updated.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalProgrammaticVolumeDollars = (
    m2mTransactions.reduce((acc, t) => acc + t.amountCents, 0) / 100
  ).toFixed(2);

  const activeKeysCount = agentKeys.filter((k) => k.status === 'active').length;

  return (
    <div id="ai-agents-m2m-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-500/50 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium">{actionFeedback}</span>
        </div>
      )}

      {/* Main Header / Status Banner */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                M2M Programmatic Ad Ingress: ONLINE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sub-50ms RTB Settlement
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🤖 AI Agents M2M Programmatic Gateway</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              Equip autonomous AI agents to query real-time dynamic pricing, bid into global 15-second billboard slots, and settle programmatically via Machine-to-Machine (M2M) wallet balances and Stripe off-session payments.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Agent Keys</div>
              <div className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                {activeKeysCount}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[150px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">M2M Settle Volume</div>
              <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                {totalProgrammaticVolumeDollars}
              </div>
            </div>

            <button
              onClick={() => setIsCreateKeyModalOpen(true)}
              className="px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Agent Key
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('keys')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'keys'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            Agent API Keys & Wallets ({agentKeys.length})
          </button>

          <button
            onClick={() => setActiveSubTab('playground')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'playground'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            ⚡ Interactive Live API Console
          </button>

          <button
            onClick={() => setActiveSubTab('yield')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'yield'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Dynamic Yield & Surge Matrix
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'ledger'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            M2M Transaction Ledger
          </button>

          <button
            onClick={() => setActiveSubTab('docs')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'docs'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            Developer Docs & SDKs
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: AGENT API KEYS & WALLETS */}
      {/* ========================================================================= */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                Registered AI Agent API Keys
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Each key provides bearer token access for autonomous bots to place programmatic bids and auto-fund wallets.
              </p>
            </div>
            <button
              onClick={() => setIsCreateKeyModalOpen(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              New Agent Key
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agentKeys.map((key) => {
              const isActive = key.status === 'active';
              return (
                <div
                  key={key.id}
                  className={`bg-slate-900 border rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActive ? 'border-slate-800 hover:border-cyan-500/40 shadow-xl' : 'border-rose-900/40 opacity-70'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{key.keyName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {key.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">{key.ownerUserEmail || 'agent-system@rtb.io'}</div>
                      </div>

                      {/* Topup action */}
                      <button
                        onClick={() => {
                          setSelectedKeyForTopup(key);
                          setTopupAmountDollars(100);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Top Up Wallet
                      </button>
                    </div>

                    {/* API Key Box */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-xs font-mono text-slate-300 truncate">{key.apiKey}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(key.apiKey, key.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all shrink-0 text-xs flex items-center gap-1 font-medium"
                      >
                        {copiedText === key.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Wallet Balance & Metrics */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-4 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Wallet Balance</div>
                        <div className="text-base font-black text-emerald-400 mt-0.5">
                          ${(key.walletBalanceCents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Slots Won</div>
                        <div className="text-base font-black text-white mt-0.5">{key.totalSlotsWon || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Spent</div>
                        <div className="text-base font-black text-cyan-400 mt-0.5">
                          ${((key.totalSpentCents || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Target Geofences:</span>
                        <span className="text-slate-200 font-semibold">{key.allowedCities?.join(', ') || 'ALL (*)'}</span>
                      </div>
                      {key.webhookUrl && (
                        <div className="flex items-center justify-between">
                          <span>Webhook Callback:</span>
                          <span className="text-slate-300 font-mono truncate max-w-[200px]">{key.webhookUrl}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Created:</span>
                        <span className="text-slate-400">{new Date(key.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedApiKey(key.apiKey);
                        setActiveSubTab('playground');
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      Test in API Console
                    </button>

                    {isActive && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke Key
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INTERACTIVE LIVE API CONSOLE (PLAYGROUND) */}
      {/* ========================================================================= */}
      {activeSubTab === 'playground' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              ⚡ Real-Time M2M API Console & Request Executor
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Execute live programmatic calls using your active Agent Bearer Token. Successful bids are immediately inserted into the live Redis billboard priority queue.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Request Builder Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  1. Configure Request Parameters
                </h4>

                {/* API Key Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Agent API Key (Bearer Auth)</label>
                  <select
                    value={selectedApiKey}
                    onChange={(e) => setSelectedApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {agentKeys.map((k) => (
                      <option key={k.id} value={k.apiKey}>
                        {k.keyName} (${(k.walletBalanceCents / 100).toFixed(2)}) — {k.apiKey.slice(0, 16)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Endpoint Action Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Programmatic Action</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlaygroundAction('buy_slot')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        playgroundAction === 'buy_slot'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">POST</span>
                        <span>Buy 15s Ad Space</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">/api/v1/agents/bids/buy-slot</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlaygroundAction('query_pricing')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        playgroundAction === 'query_pricing'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">GET</span>
                        <span>Query Dynamic Pricing</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">/api/v1/agents/slots/pricing</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlaygroundAction('check_bid')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        playgroundAction === 'check_bid'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">GET</span>
                        <span>Check Bid Status</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">/api/v1/agents/bids/:id/status</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlaygroundAction('topup_wallet')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        playgroundAction === 'topup_wallet'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">POST</span>
                        <span>Top Up Agent Wallet</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">/api/v1/agents/wallet/topup</div>
                    </button>
                  </div>
                </div>

                {/* Form Fields for Buy Slot */}
                {playgroundAction === 'buy_slot' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Billboard Room</label>
                        <select
                          value={playgroundPayload.targetCityCode}
                          onChange={(e) => setPlaygroundPayload((p) => ({ ...p, targetCityCode: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value="TYO">TYO - Tokyo Shibuya ($1.50 floor)</option>
                          <option value="NYC">NYC - Times Square ($1.80 floor)</option>
                          <option value="LON">LON - London City ($1.25 floor)</option>
                          <option value="PAR">PAR - Paris Champs-Élysées ($1.10 floor)</option>
                          <option value="SIN">SIN - Singapore Marina ($1.30 floor)</option>
                          <option value="DXB">DXB - Dubai Downtown ($1.40 floor)</option>
                          <option value="SEL">SEL - Seoul Gangnam ($1.35 floor)</option>
                          <option value="KUL">KUL - Kuala Lumpur ($0.85 floor)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bid Amount (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.10"
                            min="0.50"
                            value={playgroundPayload.bidAmountDollars}
                            onChange={(e) =>
                              setPlaygroundPayload((p) => ({ ...p, bidAmountDollars: parseFloat(e.target.value) || 1.0 }))
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Ad Title / Headline</label>
                      <input
                        type="text"
                        value={playgroundPayload.adTitle}
                        onChange={(e) => setPlaygroundPayload((p) => ({ ...p, adTitle: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Creative Image URL</label>
                      <input
                        type="text"
                        value={playgroundPayload.adImageUrl}
                        onChange={(e) => setPlaygroundPayload((p) => ({ ...p, adImageUrl: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Payment Method</label>
                        <select
                          value={playgroundPayload.paymentMethod}
                          onChange={(e) =>
                            setPlaygroundPayload((p) => ({ ...p, paymentMethod: e.target.value as any }))
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="wallet_balance">Agent Wallet Balance</option>
                          <option value="stripe_m2m">Stripe M2M Off-Session</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">CTA Destination URL</label>
                        <input
                          type="text"
                          value={playgroundPayload.ctaUrl}
                          onChange={(e) => setPlaygroundPayload((p) => ({ ...p, ctaUrl: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Fields for Check Bid */}
                {playgroundAction === 'check_bid' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bid ID</label>
                    <input
                      type="text"
                      placeholder="e.g. bid_agent_7a8b9c"
                      value={playgroundPayload.bidIdToCheck}
                      onChange={(e) => setPlaygroundPayload((p) => ({ ...p, bidIdToCheck: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                )}

                {/* Form Fields for Top Up */}
                {playgroundAction === 'topup_wallet' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Top-Up Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        min="5"
                        value={playgroundPayload.topupAmount}
                        onChange={(e) =>
                          setPlaygroundPayload((p) => ({ ...p, topupAmount: parseFloat(e.target.value) || 50 }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleExecutePlayground}
                  disabled={playgroundLoading}
                  className="w-full mt-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {playgroundLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Executing Programmatic Ingress...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Execute Real M2M API Request
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Response Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      2. Live Server Response
                    </h4>

                    {playgroundResponse && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          playgroundResponse.httpStatus === 200
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        HTTP {playgroundResponse.httpStatus} {playgroundResponse.statusText}
                      </span>
                    )}
                  </div>

                  {playgroundResponse ? (
                    <div className="space-y-3">
                      {/* Meta info bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span>
                          {playgroundResponse.method} {playgroundResponse.endpoint}
                        </span>
                        <span className="text-cyan-400">{playgroundResponse.headers?.['x-m2m-latency-ms']}</span>
                      </div>

                      {/* Success Banner if Top Winner */}
                      {playgroundResponse.data?.isTopBid && (
                        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            <strong>Bid Placed at #1 in Queue!</strong> Ad will broadcast on the next 15-second slot cycle.
                          </span>
                        </div>
                      )}

                      {/* JSON Viewer */}
                      <pre className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed">
                        {JSON.stringify(playgroundResponse.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[300px]">
                      <Terminal className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                      <span>Ready to send real programmatic requests.</span>
                      <span className="text-[11px] text-slate-600 mt-1">
                        Click "Execute Real M2M API Request" to test live ad-buying ingress.
                      </span>
                    </div>
                  )}
                </div>

                {playgroundResponse && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Cloudflare Ray ID: {playgroundResponse.headers?.['cf-ray']}</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(playgroundResponse.data, null, 2), 'response')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedText === 'response' ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DYNAMIC YIELD & SURGE MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === 'yield' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Dynamic Yield & Reserve Floor Matrix
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    yieldStatus.autopilotActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  Autopilot: {yieldStatus.autopilotActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Calculates real-time viewer density and queue velocity every 10 seconds to scale reserve floors from $0.85 off-peak up to $3.50+ surge.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleToggleAutopilot}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  yieldStatus.autopilotActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {yieldStatus.autopilotActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {yieldStatus.autopilotActive ? 'Pause Autopilot' : 'Enable Autopilot'}
              </button>

              <button
                onClick={() => setIsTuningModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                Tune Parameters
              </button>

              <button
                onClick={handleRunYieldOptimizer}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gemini Liquidity Audit
              </button>
            </div>
          </div>

          {/* Gemini AI Briefing Box */}
          {geminiInsights && (
            <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-4 text-purple-200 text-xs flex items-start gap-3 shadow-lg">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-purple-300 font-semibold block mb-1">Gemini Dynamic Yield Market Verdict:</strong>
                <p className="leading-relaxed">{geminiInsights}</p>
              </div>
            </div>
          )}

          {/* Global City Matrix Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Active Regional Billboard Zones & Dynamic Pricing Floors
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(yieldStatus.cityPricingMatrix || {}).map((item: CityYieldPricingItem) => {
                const isSurge = item.demandLevel === 'SURGE';
                const isHigh = item.demandLevel === 'HIGH';
                const isDiscount = item.demandLevel === 'LOW';

                return (
                  <div
                    key={item.cityCode}
                    className={`bg-slate-900 border rounded-2xl p-5 relative overflow-hidden transition-all ${
                      isSurge
                        ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : isHigh
                        ? 'border-cyan-500/40'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-white">{item.cityName}</span>
                        <div className="text-[10px] text-slate-400 font-mono">ROOM: [{item.cityCode}]</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSurge
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : isHigh
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : isDiscount
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.demandLevel} ({item.surgeMultiplier}x)
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mb-3">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Reserve Floor (15s Slot)</div>
                      <div className="text-2xl font-black text-white mt-0.5 flex items-baseline gap-1">
                        <span className="text-cyan-400">${item.currentFloorDollars}</span>
                        <span className="text-xs text-slate-500 line-through">
                          ${(item.baseFloorCents / 100).toFixed(2)} base
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                        <div className="text-[10px] text-slate-400">Live Viewers</div>
                        <div className="font-bold text-slate-200 mt-0.5">{item.activeWatchers}</div>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                        <div className="text-[10px] text-slate-400">Bid Velocity</div>
                        <div className="font-bold text-slate-200 mt-0.5">{item.bidVelocity}/min</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Dynamic Yield Adjustment Audit Log
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">Timestamp</th>
                    <th className="pb-3">City Zone</th>
                    <th className="pb-3">Floor Shift</th>
                    <th className="pb-3">Multiplier</th>
                    <th className="pb-3">Trigger / Decision Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(yieldStatus.recentDecisionLogs || []).slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 pl-2 text-slate-400">{log.timestamp}</td>
                      <td className="py-2.5 font-bold text-white">{log.cityName}</td>
                      <td className="py-2.5">
                        <span className="text-slate-500">${log.previousFloorDollars}</span>
                        <span className="text-slate-400 mx-1">➔</span>
                        <span className="font-bold text-cyan-400">${log.newFloorDollars}</span>
                      </td>
                      <td className="py-2.5 text-amber-400 font-bold">{log.multiplier}x</td>
                      <td className="py-2.5 text-slate-300 font-sans text-xs">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: M2M TRANSACTION LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                M2M Programmatic Settlement Ledger
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Cryptographic transaction receipts of programmatic deposits, RTB bid locks, and 15s billboard slot burns.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Agent Name</th>
                  <th className="pb-3">Transaction Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Stripe PaymentIntent</th>
                  <th className="pb-3">Cloudflare Ray</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {m2mTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="py-3 pl-2 text-slate-400">{tx.timestamp}</td>
                    <td className="py-3 font-bold text-white font-sans">{tx.agentName}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'm2m_slot_burn'
                            ? 'bg-orange-500/20 text-orange-300'
                            : tx.type === 'm2m_slot_bid_placed'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {tx.type.toUpperCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">${tx.amountDollars}</td>
                    <td className="py-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                      {tx.stripePaymentIntentId || 'pi_internal_vault'}
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">{tx.cloudflareRayId || 'RAY-EDGE-NRT'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">
                        SETTLED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: DEVELOPER DOCS & SDKs */}
      {/* ========================================================================= */}
      {activeSubTab === 'docs' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" />
              Autonomous AI Agent M2M REST API Documentation
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Integrate any external Python, Node.js, or Go agent to autonomously buy 15-second billboard ad space in under 3 lines of code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* cURL Example */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400 font-mono">cURL (Buy 15s Slot)</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `curl -X POST "https://my-domain.run.app/api/v1/agents/bids/buy-slot" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${agentKeys[0]?.apiKey || 'm2m_live_...'}" \\\n  -d '{\n    "targetCityCode": "TYO",\n    "bidAmountDollars": 3.50,\n    "ad": {\n      "title": "Quantum Neural AI",\n      "imageUrl": "https://example.com/ad.jpg",\n      "ctaUrl": "https://quantum-neural.io"\n    },\n    "paymentMethod": "wallet_balance"\n  }'`,
                      'curl'
                    )
                  }
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText === 'curl' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST "https://my-domain.run.app/api/v1/agents/bids/buy-slot" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${agentKeys[0]?.apiKey || 'm2m_live_...'}" \\
  -d '{
    "targetCityCode": "TYO",
    "bidAmountDollars": 3.50,
    "ad": {
      "title": "Quantum Neural AI",
      "imageUrl": "https://example.com/ad.jpg",
      "ctaUrl": "https://quantum-neural.io"
    },
    "paymentMethod": "wallet_balance"
  }'`}
              </pre>
            </div>

            {/* Python Example */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 font-mono">Python (Agent Autonomous Snippet)</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `import requests\n\nAPI_KEY = "${agentKeys[0]?.apiKey || 'm2m_live_...'}"\nBASE_URL = "https://my-domain.run.app"\n\n# 1. Query dynamic floor\npricing = requests.get(f"{BASE_URL}/api/v1/agents/slots/pricing?cityCode=TYO", headers={"Authorization": f"Bearer {API_KEY}"}).json()\nfloor = pricing["pricing"]["currentFloorDollars"]\n\n# 2. Place programmatic bid\nres = requests.post(f"{BASE_URL}/api/v1/agents/bids/buy-slot", headers={"Authorization": f"Bearer {API_KEY}"}, json={\n    "targetCityCode": "TYO",\n    "bidAmountDollars": float(floor) + 0.50,\n    "ad": {\n        "title": "AI Trading Bot Live",\n        "imageUrl": "https://example.com/ad.jpg",\n        "ctaUrl": "https://trading-bot.ai"\n    },\n    "paymentMethod": "wallet_balance"\n})\nprint(res.json())`,
                      'python'
                    )
                  }
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText === 'python' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`import requests

API_KEY = "${agentKeys[0]?.apiKey || 'm2m_live_...'}"
BASE_URL = "https://my-domain.run.app"

# 1. Query dynamic reserve floor
pricing = requests.get(
    f"{BASE_URL}/api/v1/agents/slots/pricing?cityCode=TYO",
    headers={"Authorization": f"Bearer {API_KEY}"}
).json()

# 2. Place programmatic bid into 15s billboard slot
res = requests.post(
    f"{BASE_URL}/api/v1/agents/bids/buy-slot",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "targetCityCode": "TYO",
        "bidAmountDollars": 3.50,
        "ad": {
            "title": "AI Autonomous Ad",
            "imageUrl": "https://example.com/ad.jpg",
            "ctaUrl": "https://my-agent.io"
        },
        "paymentMethod": "wallet_balance"
    }
)
print("Slot Broadcast Receipt:", res.json())`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATE AGENT API KEY */}
      {/* ========================================================================= */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              Generate Production AI Agent M2M Key
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Create a cryptographic Bearer token for programmatic ad space buying.
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Name / Identifier</label>
                <input
                  type="text"
                  required
                  value={newKeyForm.keyName}
                  onChange={(e) => setNewKeyForm((f) => ({ ...f, keyName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  placeholder="e.g. Hyperion Autonomous Media Bot"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Developer Email</label>
                <input
                  type="email"
                  required
                  value={newKeyForm.ownerUserEmail}
                  onChange={(e) => setNewKeyForm((f) => ({ ...f, ownerUserEmail: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Deposit (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="10"
                      value={newKeyForm.initialDepositDollars}
                      onChange={(e) =>
                        setNewKeyForm((f) => ({ ...f, initialDepositDollars: parseFloat(e.target.value) || 50 }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Geofences</label>
                  <input
                    type="text"
                    value={newKeyForm.allowedCities.join(', ')}
                    onChange={(e) =>
                      setNewKeyForm((f) => ({
                        ...f,
                        allowedCities: e.target.value.split(',').map((c) => c.trim().toUpperCase())
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                    placeholder="* or TYO, NYC, LON"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Callback URL (Optional)</label>
                <input
                  type="url"
                  value={newKeyForm.webhookUrl}
                  onChange={(e) => setNewKeyForm((f) => ({ ...f, webhookUrl: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  placeholder="https://my-agent.io/webhooks/billboard-play"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  {isLoading ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOP UP AGENT WALLET */}
      {/* ========================================================================= */}
      {selectedKeyForTopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Top Up Agent Wallet
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Deposit funds directly into <strong>{selectedKeyForTopup.keyName}</strong> for programmatic ad execution.
            </p>

            <form onSubmit={handleTopupKeyWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={topupAmountDollars}
                    onChange={(e) => setTopupAmountDollars(parseFloat(e.target.value) || 50)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white font-bold"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                <div className="flex justify-between mb-1">
                  <span>Current Balance:</span>
                  <span className="font-bold text-slate-200">
                    ${(selectedKeyForTopup.walletBalanceCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>New Balance After Top-Up:</span>
                  <span>
                    ${((selectedKeyForTopup.walletBalanceCents + topupAmountDollars * 100) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedKeyForTopup(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? 'Processing...' : `Confirm Deposit $${topupAmountDollars.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DYNAMIC YIELD TUNING */}
      {/* ========================================================================= */}
      {isTuningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Tune Dynamic Yield Parameters
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Adjust algorithmic limits and surge elasticity for reserve floor calculation.
            </p>

            <form onSubmit={handleSaveTuning} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Floor ($)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0.10"
                    value={tuningParams.minFloorDollars}
                    onChange={(e) =>
                      setTuningParams((p) => ({ ...p, minFloorDollars: parseFloat(e.target.value) || 0.5 }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Surge Ceiling ($)</label>
                  <input
                    type="number"
                    step="1.00"
                    value={tuningParams.maxFloorDollars}
                    onChange={(e) =>
                      setTuningParams((p) => ({ ...p, maxFloorDollars: parseFloat(e.target.value) || 50 }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Surge Elasticity Factor: {tuningParams.surgeElasticity}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={tuningParams.surgeElasticity}
                  onChange={(e) =>
                    setTuningParams((p) => ({ ...p, surgeElasticity: parseFloat(e.target.value) || 0.5 }))
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="discountEnabled"
                  checked={tuningParams.discountEnabled}
                  onChange={(e) => setTuningParams((p) => ({ ...p, discountEnabled: e.target.checked }))}
                  className="rounded border-slate-800 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="discountEnabled" className="text-xs text-slate-300">
                  Allow 15% off-peak discount when rooms have zero queued bids
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTuningModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
