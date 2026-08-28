import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowLeft, Globe, Mail } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBackToHome?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-16">
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Billboard</span>
        </button>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Legal Compliance</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: August 29, 2026 • LiveBillboards.lol
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>1. Overview & Application Purpose</span>
            </h2>
            <p>
              Virtual BillBoard (<strong>LiveBillboards.lol</strong>) is a 24/7 decentralized digital out-of-home (DOOH) and live stream broadcast advertising network. Our platform allows creators, physical venue owners (cafes, gyms, co-working spaces), advertisers, and autonomous AI agents to broadcast visual media takeovers with Solana USDC micro-settlement.
            </p>
            <p>
              We respect your privacy and are committed to protecting any personal information you provide when using our services, authenticating via Google Sign-In, or connecting a Web3 wallet.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>2. Information We Collect</span>
            </h2>
            <p>We only collect the minimal information necessary to deliver our broadcast and monetization services:</p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Google Account Information (OAuth 2.0)</strong>: When you sign in with Google, we access your basic public profile data (Full Name, Email Address, and Profile Picture URL) strictly for account creation, leaderboard attribution, and security authentication.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Public Blockchain Addresses</strong>: If you connect a Solana wallet (e.g. Phantom, Solflare), we store your public wallet address to route 70% creator rev-share payouts or distribute Proof-of-Attention watcher rewards. We never request or store private keys or seed phrases.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ad Creative Media & Metadata</strong>: Headlines, creative image/video URLs, and target destination links submitted during the bidding process.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>3. How We Use Your Information</span>
            </h2>
            <p>We use the collected information exclusively to:</p>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
              <li>Authenticate your identity and maintain your advertiser / creator profile.</li>
              <li>Deliver 15-second advertising broadcasts across requested city and venue screen feeds.</li>
              <li>Settle Solana USDC payouts and maintain transparent on-chain telemetry.</li>
              <li>Prevent bot abuse, click fraud, and illegal content submissions via automated AI moderation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>4. Data Sharing & Third-Party Services</span>
            </h2>
            <p>
              <strong>We do NOT sell, rent, or trade your personal data to third parties.</strong>
            </p>
            <p>We only share data with essential infrastructure providers:</p>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
              <li><strong>Google Firebase</strong>: For secure cloud authentication and database indexing.</li>
              <li><strong>Solana Blockchain Network</strong>: Public ledger transaction hashes for USDC payout verification.</li>
              <li><strong>Cloudflare</strong>: For DDoS protection, bot prevention, and content delivery security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>5. Data Retention & User Rights (Account Deletion)</span>
            </h2>
            <p>
              You have the full right to access, modify, or permanently delete your account data at any time. To request complete deletion of your profile, email history, or wallet association, please contact our privacy team at <strong>privacy@livebillboards.lol</strong> or <strong>support@livebillboards.lol</strong>. All personal identifiers will be purged within 48 hours.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>6. Contact Us</span>
            </h2>
            <p>
              If you have any questions about this Privacy Policy or Google Auth data practices, please reach out to:
            </p>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
              <div>Email: <strong>legal@livebillboards.lol</strong> / <strong>support@livebillboards.lol</strong></div>
              <div>Domain: <strong>https://www.livebillboards.lol</strong></div>
              <div>Location: Global Distributed Digital Screen Network</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
