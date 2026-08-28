import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogArticles';
import {
  BookOpen,
  Search,
  Clock,
  User,
  Tag,
  ArrowRight,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  Tv,
  Globe,
  ExternalLink,
  Flame,
  Zap,
  Coins,
  Bot,
  TrendingUp,
  Award,
  ShieldCheck,
  Radio,
  Building2,
  Gift
} from 'lucide-react';
import { ToastMessage } from '../types';

interface BlogEngineProps {
  onOpenClaimModal?: () => void;
  onNavigateToLiveBillboard?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenTvPairModal?: () => void;
  onOpenPitchDeck?: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const BlogEngine: React.FC<BlogEngineProps> = ({
  onOpenClaimModal,
  onNavigateToLiveBillboard,
  onNavigateTab,
  onOpenTvPairModal,
  onOpenPitchDeck,
  addToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = [
    'All',
    'Creators & Streamers',
    'Smart TVs & Venues',
    'AI & WebMCP',
    'Solana & Web3',
    'Earn & Watchers',
    'Growth & Brands'
  ];

  const filteredArticles = BLOG_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = BLOG_ARTICLES[0];

  const handleShareArticle = (article: BlogArticle) => {
    const url = `${window.location.origin}/blog?article=${article.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      addToast({
        title: 'Article Link Copied!',
        message: 'Shareable article link copied to clipboard.',
        type: 'success'
      });
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCtaAction = (ctaType: string) => {
    if (ctaType === 'streamer' && onNavigateTab) {
      onNavigateTab('streamer');
    } else if (ctaType === 'tv') {
      if (onOpenTvPairModal) onOpenTvPairModal();
      else if (onNavigateTab) onNavigateTab('streamer');
    } else if (ctaType === 'webmcp' && onNavigateTab) {
      onNavigateTab('webmcp');
    } else if (ctaType === 'watcher' && onNavigateTab) {
      onNavigateTab('watcher');
    } else if (ctaType === 'bid') {
      if (onNavigateToLiveBillboard) onNavigateToLiveBillboard();
      else if (onNavigateTab) onNavigateTab('live');
    } else if (onOpenClaimModal) {
      onOpenClaimModal();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* If viewing a single full article */}
      {activeArticle ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveArticle(null)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to All 15 Articles</span>
            </button>

            <button
              onClick={() => handleShareArticle(activeArticle)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>

          {/* Article Header & Hero */}
          <article className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6">
            <div className="relative aspect-[21/9] max-h-[380px] w-full overflow-hidden">
              <img
                src={activeArticle.coverImage}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 space-y-2">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-md">
                  {activeArticle.category}
                </span>
                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                  {activeArticle.title}
                </h1>
              </div>
            </div>

            <div className="px-6 md:px-10 pb-10 space-y-8">
              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <img
                    src={activeArticle.author.avatar}
                    alt={activeArticle.author.name}
                    className="w-10 h-10 rounded-full border border-cyan-500/30 object-cover"
                  />
                  <div>
                    <div className="font-bold text-white text-sm">{activeArticle.author.name}</div>
                    <div className="text-slate-400">{activeArticle.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeArticle.readTime}</span>
                  </span>
                  <span>•</span>
                  <span>{activeArticle.publishedDate}</span>
                </div>
              </div>

              {/* Subtitle Callout */}
              <div className="p-4 bg-slate-950/80 border-l-4 border-cyan-400 rounded-r-2xl text-sm font-medium text-slate-300 leading-relaxed">
                {activeArticle.subtitle}
              </div>

              {/* Markdown Content Formatter */}
              <div className="text-slate-200 text-sm md:text-base leading-relaxed space-y-5">
                {activeArticle.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-xl md:text-2xl font-black text-white pt-4 pb-1 border-b border-slate-800/80 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span>{paragraph.replace('## ', '')}</span>
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-lg font-bold text-cyan-300 pt-2">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('```')) {
                    const code = paragraph.replace(/```(json|bash|javascript)?/g, '').trim();
                    return (
                      <pre key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-mono text-cyan-300">
                        <code>{code}</code>
                      </pre>
                    );
                  }
                  if (paragraph.startsWith('|')) {
                    // Render simple table
                    const lines = paragraph.trim().split('\n');
                    const headers = lines[0].split('|').filter(c => c.trim().length > 0).map(c => c.trim());
                    const rows = lines.slice(2).map(r => r.split('|').filter(c => c.trim().length > 0).map(c => c.trim()));
                    return (
                      <div key={idx} className="overflow-x-auto my-4">
                        <table className="w-full text-xs font-mono border border-slate-800 rounded-xl overflow-hidden">
                          <thead className="bg-slate-950 text-cyan-300">
                            <tr>
                              {headers.map((h, i) => <th key={i} className="p-2.5 text-left border-b border-slate-800">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                            {rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-800/50">
                                {row.map((cell, cIdx) => <td key={cIdx} className="p-2.5 text-slate-300">{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={idx} className="border-slate-800 my-6" />;
                  }
                  if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n');
                    return (
                      <ul key={idx} className="space-y-2 pl-2">
                        {items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-slate-300 text-sm">
                            <span className="text-cyan-400 font-bold shrink-0">✦</span>
                            <span>{item.replace(/^[0-9]+\.\s+|^-\s+/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={idx} className="text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-800">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Tags:
                </span>
                {activeArticle.tags.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg font-mono">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Interactive In-Article Action & Discovery Box */}
              <div className="bg-gradient-to-r from-cyan-950/60 via-slate-950 to-purple-950/60 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-300 font-black text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Take Action & Try It Live</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    {activeArticle.ctaText}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Get started immediately with 0 credit card required & instant Solana settlement.
                  </p>
                </div>

                <button
                  onClick={() => handleCtaAction(activeArticle.ctaType)}
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/20 text-xs uppercase tracking-wider transition-all transform hover:scale-105 cursor-pointer shrink-0"
                >
                  {activeArticle.ctaButton}
                </button>
              </div>
            </div>
          </article>
        </motion.div>
      ) : (
        /* Blog Catalog & Discovery Hub */
        <div className="space-y-8">
          {/* Header & First 100 Users Acquisition Banner */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1 font-mono">
                  <BookOpen className="w-4 h-4" />
                  <span>Official Knowledge & Growth Hub</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Virtual Billboards & WebMCP Guides
                </h1>
                <p className="text-xs text-slate-400">
                  15 actionable blueprints on stream monetization, physical Smart TV DOOH, autonomous AI agent bidding, and Proof-of-Attention.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 15 articles, WebMCP, TV PIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>
            </div>

            {/* 🎁 First 100 Users Acquisition Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border-2 border-amber-400/40 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-amber-300" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-md font-mono">
                      Early Adopter Wave
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Claim for First 100 Users</span>
                  </div>
                  <h3 className="text-sm font-black text-white">
                    Get 1 Free 15s Billboard Slot (1,000 Attention Tokens)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Broadcast your product, channel, or token live on Times Square & Shibuya screens with zero payment.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onOpenClaimModal) onOpenClaimModal();
                  else if (onNavigateTab) onNavigateTab('live');
                }}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all transform hover:scale-105 cursor-pointer shrink-0 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claim Free Slot ➔</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Hero Article Card (If showing 'All' and no search query) */}
          {selectedCategory === 'All' && !searchQuery && featuredArticle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all grid grid-cols-1 lg:grid-cols-12 group cursor-pointer"
              onClick={() => setActiveArticle(featuredArticle)}
            >
              <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Featured Blueprint</span>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{featuredArticle.category}</span>
                    <span>•</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-500/30"
                    />
                    <span className="text-slate-300 font-bold">{featuredArticle.author.name}</span>
                  </div>

                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid of 15 Blog Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, idx) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-cyan-500/5 transition-all flex flex-col justify-between group"
              >
                {/* Article Top Image & Category */}
                <div
                  className="cursor-pointer"
                  onClick={() => setActiveArticle(article)}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 bg-slate-950/85 backdrop-blur-md border border-slate-700 text-cyan-300 text-[10px] font-black uppercase tracking-wider rounded-lg">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Text Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{article.readTime}</span>
                      <span>{article.publishedDate}</span>
                    </div>
                    <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Author + Direct Conversion Action Button */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-cyan-500/20"
                      />
                      <span className="text-[11px] text-slate-300 font-bold truncate max-w-[90px]">
                        {article.author.name}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCtaAction(article.ctaType);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{article.ctaButton.replace(' ➔', '')}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Discovery / Newsletter / Community Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
            <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">
              Ready to Join the World's First 24/7 Virtual Billboard Network?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Whether you are a creator monetizing your live stream, a cafe owner with an idle TV, an autonomous AI agent, or a brand testing global billboard campaigns, get started in under 60 seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleCtaAction('bid')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Place Live Billboard Ad ($1.00)
              </button>
              <button
                onClick={() => handleCtaAction('streamer')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-slate-700"
              >
                Set Up Streamer / TV Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
