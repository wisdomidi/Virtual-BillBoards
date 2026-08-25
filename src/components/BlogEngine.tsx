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
  Zap
} from 'lucide-react';
import { ToastMessage } from '../types';

interface BlogEngineProps {
  onOpenClaimModal?: () => void;
  onNavigateToLiveBillboard?: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const BlogEngine: React.FC<BlogEngineProps> = ({
  onOpenClaimModal,
  onNavigateToLiveBillboard,
  addToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = ['All', 'Monetization', 'Advertising', 'AI & Tech', 'Space & Vision'];

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
    const url = `${window.location.origin}/?tab=blog&article=${article.slug}`;
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
              <span>Back to All Articles</span>
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-4 inset-x-6 sm:inset-x-8">
                <span className="px-3 py-1 bg-cyan-500 text-slate-950 font-black text-xs uppercase font-mono rounded-lg shadow-lg">
                  {activeArticle.category}
                </span>
              </div>
            </div>

            <div className="px-6 sm:px-10 pb-10 space-y-6">
              {/* Title & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {activeArticle.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  {activeArticle.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeArticle.author.avatar}
                      alt={activeArticle.author.name}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-400"
                    />
                    <span className="text-slate-200 font-bold">{activeArticle.author.name}</span>
                    <span className="text-slate-500">({activeArticle.author.role})</span>
                  </div>
                  <span>•</span>
                  <span>{activeArticle.publishedDate}</span>
                  <span>•</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeArticle.readTime}</span>
                  </span>
                </div>
              </div>

              {/* Formatted Markdown-Style Content */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 font-sans border-t border-slate-800 pt-6">
                {activeArticle.content.split('\n\n').map((block, idx) => {
                  if (block.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-xl sm:text-2xl font-black text-white tracking-tight mt-6 mb-2">
                        {block.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (block.startsWith('---')) {
                    return <hr key={idx} className="border-slate-800 my-6" />;
                  }
                  if (block.startsWith('- ')) {
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                        {block.split('\n').map((item, itemIdx) => (
                          <li key={itemIdx}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.startsWith('1. ') || block.startsWith('2. ') || block.startsWith('3. ')) {
                    return (
                      <ol key={idx} className="list-decimal list-inside space-y-1.5 pl-2 text-slate-300">
                        {block.split('\n').map((item, itemIdx) => (
                          <li key={itemIdx}>{item.replace(/^[0-9]+\.\s*/, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  return (
                    <p key={idx} className="text-slate-300 leading-relaxed">
                      {block}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-800">
                <Tag className="w-4 h-4 text-cyan-400" />
                {activeArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* In-Article CTA Banner */}
              <div className="bg-gradient-to-r from-cyan-950/80 via-slate-950 to-indigo-950/80 border border-cyan-500/40 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="font-black text-white text-base">Ready to Launch on the Live Billboard?</div>
                  <p className="text-xs text-slate-400">Broadcast your ad or claim your vanity handle with 80% revenue split.</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {onOpenClaimModal && (
                    <button
                      onClick={onOpenClaimModal}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Claim @Handle
                    </button>
                  )}
                  {onNavigateToLiveBillboard && (
                    <button
                      onClick={onNavigateToLiveBillboard}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Launch Ad ($1.00)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        </motion.div>
      ) : (
        /* Blog Index & Directory View */
        <div className="space-y-8">
          {/* Header & Search */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl text-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 px-3 py-1 rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Official Insights & Knowledge Engine
              </span>
            </div>

            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Insights, Guides & Digital Screen Strategies
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Discover the latest research on Real-Time Bidding (RTB), creator stream monetization, autonomous AI agent bidding, and the infinite digital screen economy.
              </p>
            </div>

            {/* Search and Category Filters */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, strategies, keywords..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Article Card */}
          {!searchQuery && selectedCategory === 'All' && featuredArticle && (
            <div
              onClick={() => setActiveArticle(featuredArticle)}
              className="bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all hover:border-cyan-400 cursor-pointer group flex flex-col lg:flex-row items-center gap-6"
            >
              <div className="relative aspect-video w-full lg:w-1/2 rounded-2xl overflow-hidden shrink-0">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] font-mono rounded-lg shadow-md uppercase">
                  FEATURED GUIDE
                </span>
              </div>

              <div className="space-y-3 w-full lg:w-1/2">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span>{featuredArticle.category}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {featuredArticle.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      className="w-5 h-5 rounded-full object-cover border border-cyan-400"
                    />
                    <span className="font-bold text-slate-300">{featuredArticle.author.name}</span>
                  </div>

                  <span className="text-xs font-black text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.slug}
                onClick={() => setActiveArticle(article)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 shadow-xl transition-all hover:scale-[1.01] cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/40 font-mono font-bold text-[10px] rounded-lg">
                      {article.category}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                      <span>{article.publishedDate}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-[11px] truncate max-w-[120px]">{article.author.name}</span>
                  </div>

                  <span className="text-cyan-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
