import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft, Globe, DollarSign, Scale } from 'lucide-react';

interface TermsOfServiceViewProps {
  onBackToHome?: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBackToHome }) => {
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
            <Scale className="w-4 h-4" />
            <span>Terms & Conditions</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: August 29, 2026 • LiveBillboards.lol
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>1. Agreement to Terms</span>
            </h2>
            <p>
              By accessing or using <strong>LiveBillboards.lol</strong> (the "Platform"), connecting a Solana wallet, authenticating via Google Sign-In, or participating in the 24/7 Real-Time Bidding (RTB) screen network, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>2. Platform Description & Service Nature</span>
            </h2>
            <p>
              LiveBillboards provides real-time digital advertising broadcast infrastructure across physical Smart TVs in venues (cafes, gyms, hotels), creator live streams, and metropolitan city screen feeds. 
            </p>
            <p>
              Ad takeovers run in 15-second intervals determined by an automated highest-bid auction engine. Solana USDC settlements occur on-chain with sub-second finality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>3. Content Moderation & Prohibited Material</span>
            </h2>
            <p>
              All advertising creatives submitted to the network (via web UI or WebMCP AI Agent API) must adhere to strict brand-safety standards. We strictly prohibit:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
              <li>Sexually explicit, pornographic, or adult-themed content.</li>
              <li>Hate speech, harassment, defamation, or violent incitement.</li>
              <li>Malware, phishing links, deceptive financial scams, or unlicensed gambling.</li>
              <li>Intellectual property infringement or unauthorized brand impersonation.</li>
            </ul>
            <p className="text-amber-300 text-xs font-semibold">
              ⚠️ Creatives violating these rules are automatically quarantined by our AI safety filter and discarded without refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>4. Payouts, Bidding & Revenue Share</span>
            </h2>
            <p>
              - <strong>Creators & Venue Screens</strong>: Receive a 70% direct revenue share for bids broadcast on their respective overlays or paired Smart TV screens.
            </p>
            <p>
              - <strong>Human Spectators</strong>: Proof-of-Attention mining rewards are distributed from the 15% attention pool at a rate of 100 points = $1.00 USDC.
            </p>
            <p>
              - <strong>Blockchain Transactions</strong>: All on-chain Solana transactions are irreversible once confirmed on the blockchain.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white">5. Governing Law & Inquiries</h2>
            <p>
              For questions, legal notices, or support regarding these terms, please contact <strong>legal@livebillboards.lol</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
