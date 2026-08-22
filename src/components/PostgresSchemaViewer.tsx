import React, { useState } from 'react';
import { POSTGRES_DDL_SQL } from '../data/blueprintData';
import {
  Database,
  Copy,
  Check,
  Table,
  Key,
  Lock,
  Layers,
  Code,
  FileCode
} from 'lucide-react';

export const PostgresSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTable, setActiveTable] = useState<'users' | 'ad_campaigns' | 'realtime_bids' | 'payout_ledger'>('users');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(POSTGRES_DDL_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tables = [
    {
      id: 'users' as const,
      name: 'users',
      desc: 'Users & Advertisers table storing balances, auth tokens, and watch points',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT uuid_generate_v4()' },
        { name: 'email', type: 'VARCHAR(255)', constraint: 'UNIQUE NOT NULL' },
        { name: 'company_name', type: 'VARCHAR(120)', constraint: 'NOT NULL' },
        { name: 'role', type: 'VARCHAR(20)', constraint: 'CHECK (role IN (advertiser, viewer, admin))' },
        { name: 'balance_cents', type: 'BIGINT', constraint: 'NOT NULL DEFAULT 0 CHECK (>= 0)' },
        { name: 'watch_points', type: 'BIGINT', constraint: 'NOT NULL DEFAULT 0 CHECK (>= 0)' },
        { name: 'auth_token', type: 'VARCHAR(255)', constraint: 'UNIQUE NOT NULL' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraint: 'DEFAULT CURRENT_TIMESTAMP' }
      ]
    },
    {
      id: 'ad_campaigns' as const,
      name: 'ad_campaigns',
      desc: 'Ad Visual Creatives, Target Country/City Geofences, and Gemini Safety Scores',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT uuid_generate_v4()' },
        { name: 'advertiser_id', type: 'UUID', constraint: 'REFERENCES users(id) ON DELETE CASCADE' },
        { name: 'title', type: 'VARCHAR(150)', constraint: 'NOT NULL' },
        { name: 'image_url', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'target_country_code', type: 'VARCHAR(5)', constraint: "DEFAULT 'ALL'" },
        { name: 'target_city_code', type: 'VARCHAR(10)', constraint: "DEFAULT 'ALL'" },
        { name: 'bid_amount_cents', type: 'BIGINT', constraint: 'NOT NULL CHECK (bid_amount_cents > 0)' },
        { name: 'status', type: 'VARCHAR(30)', constraint: "CHECK (status IN ('pending_review', 'approved', ...))" },
        { name: 'safety_score', type: 'INT', constraint: 'CHECK (safety_score BETWEEN 0 AND 100)' }
      ]
    },
    {
      id: 'realtime_bids' as const,
      name: 'realtime_bids',
      desc: 'Real-time 15-second slot bids, execution timestamps, and region keys',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT uuid_generate_v4()' },
        { name: 'campaign_id', type: 'UUID', constraint: 'REFERENCES ad_campaigns(id) ON DELETE CASCADE' },
        { name: 'advertiser_id', type: 'UUID', constraint: 'REFERENCES users(id) ON DELETE CASCADE' },
        { name: 'slot_id', type: 'VARCHAR(64)', constraint: 'NOT NULL' },
        { name: 'region_key', type: 'VARCHAR(20)', constraint: 'NOT NULL (e.g. KUL, MY, GLOBAL)' },
        { name: 'bid_amount_cents', type: 'BIGINT', constraint: 'NOT NULL' },
        { name: 'status', type: 'VARCHAR(20)', constraint: "CHECK (status IN ('queued', 'won', 'outbid'))" },
        { name: 'ip_address', type: 'INET', constraint: 'CLIENT IP' }
      ]
    },
    {
      id: 'payout_ledger' as const,
      name: 'payout_ledger',
      desc: 'Proof-of-Attention viewer watch-time points and fraud-prevention checks',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY DEFAULT uuid_generate_v4()' },
        { name: 'viewer_id', type: 'UUID', constraint: 'REFERENCES users(id) ON DELETE CASCADE' },
        { name: 'slot_id', type: 'VARCHAR(64)', constraint: 'NOT NULL' },
        { name: 'watch_seconds', type: 'INT', constraint: 'CHECK (watch_seconds > 0 AND <= 15)' },
        { name: 'points_earned', type: 'INT', constraint: 'NOT NULL CHECK (points_earned >= 0)' },
        { name: 'heartbeat_hash', type: 'VARCHAR(64)', constraint: 'NOT NULL' },
        { name: 'tab_visible', type: 'BOOLEAN', constraint: 'DEFAULT TRUE' },
        { name: 'fraud_status', type: 'VARCHAR(30)', constraint: "CHECK (fraud_status IN ('verified', 'flagged_hidden_tab'))" }
      ]
    }
  ];

  const currentTableObj = tables.find((t) => t.id === activeTable) || tables[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            PostgreSQL Relational DDL Schema
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Production-grade DDL SQL script including Users, Ad_Campaigns, Realtime_Bids, and Payout_Ledger
          </p>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-all shadow-lg shadow-cyan-500/20"
        >
          {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
          <span>{copied ? 'SQL Script Copied!' : 'Copy Complete DDL SQL'}</span>
        </button>
      </div>

      {/* Interactive Table Inspector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            Table Schema Structure Inspector:
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTable(t.id)}
              className={`p-3 rounded-xl border font-mono text-xs text-left transition-all ${
                activeTable === t.id
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-cyan-400" />
                <span>public.{t.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Table Fields Detail Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold flex items-center justify-between">
            <span>Table: <strong className="text-cyan-400">public.{currentTableObj.name}</strong></span>
            <span className="text-slate-500 text-[11px]">{currentTableObj.desc}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 bg-slate-900/50 text-[11px]">
                  <th className="p-3 font-semibold">COLUMN NAME</th>
                  <th className="p-3 font-semibold">DATA TYPE</th>
                  <th className="p-3 font-semibold">CONSTRAINTS / RULES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {currentTableObj.columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-cyan-300 flex items-center gap-2">
                      {col.constraint.includes('PRIMARY KEY') && <Key className="w-3.5 h-3.5 text-amber-400" />}
                      {col.constraint.includes('REFERENCES') && <Lock className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{col.name}</span>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">{col.type}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{col.constraint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DDL SQL Viewer Code Block */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            Complete PostgreSQL DDL Script
          </span>
          <span>PostgreSQL 15+ Target</span>
        </div>

        <pre className="text-emerald-400 bg-slate-900 p-4 rounded-xl border border-slate-800/80 overflow-x-auto leading-relaxed max-h-[500px]">
          {POSTGRES_DDL_SQL}
        </pre>
      </div>
    </div>
  );
};
