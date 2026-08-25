import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { RegionalAnalyticsData, TelemetryLog } from '../types';
import {
  TrendingUp,
  BarChart3,
  Globe,
  PieChart as PieChartIcon,
  Zap,
  Activity,
  DollarSign,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface RegionalAnalyticsChartsProps {
  selectedCity: string;
  telemetryLogs?: TelemetryLog[];
}

export const RegionalAnalyticsCharts: React.FC<RegionalAnalyticsChartsProps> = ({
  selectedCity,
  telemetryLogs = []
}) => {
  const [data, setData] = useState<RegionalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'winrate' | 'demand'>('trends');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/regional?region=${selectedCity}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error('Failed to load regional analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCity]);

  if (loading || !data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 font-mono">
        <div className="animate-spin w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-slate-400">Loading Recharts Telemetry & Regional Analytics...</p>
      </div>
    );
  }

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold uppercase tracking-widest text-[11px]">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>RECHARTS TELEMETRY & GEOGRAPHIC DEMAND ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Regional Bid Trends & Auction Analytics
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time telemetry breakdown of clearing price movements, geofence tier win rate distributions, and market heat index across global billboard zones.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Real-Time Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>24h Auction Bids</span>
            </div>
            <div className="text-xl font-black text-white">
              {data.realtimeMetrics.totalBids24h.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clearing Volume</span>
            </div>
            <div className="text-xl font-black text-emerald-400">
              ${data.realtimeMetrics.totalClearingVolumeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sub-ms Redis Latency</span>
            </div>
            <div className="text-xl font-black text-indigo-300">
              {data.realtimeMetrics.avgLatencyMs} ms
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Safety Pass Rate</span>
            </div>
            <div className="text-xl font-black text-amber-300">
              {data.realtimeMetrics.geminiPassRatePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart View Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'trends'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-950'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Historical Bid Price Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('winrate')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'winrate'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-950'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Cascade Win Rate Distribution</span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'demand'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-950'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Geographic Demand & Volume</span>
        </button>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Column (8/12) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Clearing Price Movements ($/15s Slot) Over 24h
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Average winning auction bids per slot across global regions
                  </p>
                </div>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-1 rounded-md text-[10px] font-bold">
                  AREA & LINE CHART
                </span>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.hourlyTrends}>
                    <defs>
                      <linearGradient id="colorKul" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTyo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNyc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="$" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontFamily: 'monospace'
                      }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Bid Price']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="KUL" name="Kuala Lumpur (KUL)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorKul)" strokeWidth={2} />
                    <Area type="monotone" dataKey="TYO" name="Tokyo (TYO)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTyo)" strokeWidth={2} />
                    <Area type="monotone" dataKey="NYC" name="New York (NYC)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorNyc)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'winrate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-cyan-400" />
                    Auction Win Distribution Across Geofence Fallback Tiers
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Ratio of bids cleared at City Direct, Country Pool, or Global Fallback levels
                  </p>
                </div>
                <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-1 rounded-md text-[10px] font-bold">
                  PIE & DONUT CHART
                </span>
              </div>

              <div className="h-80 w-full pt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.winRateByFallback}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.winRateByFallback.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontFamily: 'monospace'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value} wins (${props.payload.percentage}%)`,
                        props.payload.name
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'demand' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    24h Regional Bid Volume & Average CPM ($)
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Comparative market demand and clearing CPMs across key metropolitan hubs
                  </p>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-bold">
                  BAR CHART
                </span>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.demandByCity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="cityName" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 11 }} unit=" Bids" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} unit="$" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="totalBids24h" name="Total 24h Bids" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avgCpm" name="Avg Slot Cost ($)" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column: Live Telemetry Stream Feed (4/12) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Live System Telemetry</span>
              </div>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                WS ACTIVE
              </span>
            </div>

            <p className="text-slate-400 text-[11px]">
              Sub-millisecond event stream logging Redis ZADD operations, WebSocket events, and automated AI safety audits.
            </p>

            {/* Telemetry Log Stream */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {telemetryLogs.length === 0 ? (
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-slate-500 text-center space-y-1">
                  <Clock className="w-5 h-5 mx-auto text-slate-600 animate-spin" />
                  <p>Listening for real-time telemetry events...</p>
                </div>
              ) : (
                telemetryLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-cyan-400 text-[10px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                        [{log.type}]
                      </span>
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-slate-500 text-[10px] flex items-center justify-between">
            <span>Region Filter: [{selectedCity}]</span>
            <span className="text-emerald-400 font-bold">Telemetry OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
