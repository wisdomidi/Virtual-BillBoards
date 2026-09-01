import React, { useState } from 'react';
import {
  Trophy,
  X,
  Sparkles,
  Heart,
  TrendingUp,
  Share2,
  ExternalLink,
  Zap,
  Globe,
  QrCode,
  Eye,
  Crown,
  Flame,
  Search,
  Filter
} from 'lucide-react';
import { HALL_OF_FAME_ITEMS, HallOfFameItem } from '../data/hallOfFameData';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLaunchSimilar?: (item: HallOfFameItem) => void;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  isOpen,
  onClose,
  onSelectLaunchSimilar
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('vb_hof_likes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  if (!isOpen) return null;

  const handleLike = (id: string, initialLikes: number) => {
    const current = likesMap[id] ?? initialLikes;
    const updated = { ...likesMap, [id]: current + 1 };
    setLikesMap(updated);
    try {
      localStorage.setItem('vb_hof_likes', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleShareToX = (item: HallOfFameItem) => {
    const text = `Check out this legendary billboard takeover on @livebillboards: "${item.title}" in ${item.cityName}! 🚀 Delivered ${item.impressionsDelivered.toLocaleString()} live impressions.\n\nTake over the billboard live: https://www.livebillboards.lol\n\n#LiveBillboard #ViralTakeover #AdTech`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredItems = HALL_OF_FAME_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.story.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl shadow-lg shadow-amber-500/10">
              <Trophy className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Virtual Billboard Hall of Fame
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Greatest Takeovers
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore the most viral community takeovers, startup launches, and record-breaking RTB billboard raids.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Takeovers', icon: Sparkles },
              { id: 'startup', label: '🚀 Startups & DevTools', icon: TrendingUp },
              { id: 'meme', label: '🔥 Memes & Raids', icon: Flame },
              { id: 'crypto', label: '⚡ Crypto & DeFi', icon: Zap },
              { id: 'charity', label: '🌱 Charity & Impact', icon: Heart }
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Content Showcase Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white uppercase">No Hall of Fame campaigns found</div>
              <p className="text-xs">Try selecting another category or clear your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const currentLikes = likesMap[item.id] ?? item.likesCount;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl hover:shadow-amber-500/5 group"
                  >
                    {/* Media Preview & Overlay Badges */}
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Top Left City Tag */}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          <span>{item.cityName}</span>
                        </div>

                        {/* Top Right Winning Badge */}
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-amber-500/90 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
                          {item.badge}
                        </div>

                        {/* Bottom Stats Banner inside image */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-white">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-amber-400 font-bold">
                              💰 ${item.winningBidDollars.toFixed(2)} USD
                            </span>
                            <span className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-cyan-300 font-bold flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.impressionsDelivered.toLocaleString()}
                            </span>
                          </div>
                          <span className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-emerald-400 font-bold flex items-center gap-1">
                            <QrCode className="w-3 h-3" />
                            {item.qrScans.toLocaleString()} Scans
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {item.broadcastDate}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          By <span className="text-cyan-400 font-bold">{item.advertiserName}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                          {item.story}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(item.id, item.likesCount)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                          <span>{currentLikes}</span>
                        </button>

                        {/* Share to X */}
                        <button
                          onClick={() => handleShareToX(item)}
                          className="p-1.5 bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 rounded-xl text-xs transition-all cursor-pointer"
                          title="Share to X (Twitter)"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {/* External Link */}
                        {item.ctaUrl && (
                          <a
                            href={item.ctaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-all"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Launch Similar Ad Trigger */}
                      <button
                        onClick={() => {
                          onSelectLaunchSimilar?.(item);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Similar Ad</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
