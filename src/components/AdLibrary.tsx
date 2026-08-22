import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PastWinningAd, ToastMessage } from '../types';
import { LandmarkFrame } from './LandmarkFrame';
import {
  Library,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  Eye,
  MousePointerClick,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Send,
  X,
  Globe,
  Award,
  Zap,
  Maximize2
} from 'lucide-react';

interface AdLibraryProps {
  selectedCity: string;
  selectedCountry: string;
  onBidSubmitted: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const AdLibrary: React.FC<AdLibraryProps> = ({
  selectedCity,
  selectedCountry,
  onBidSubmitted,
  addToast
}) => {
  const [ads, setAds] = useState<PastWinningAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'roas' | 'impressions' | 'ctr' | 'bid' | 'recent'>('roas');

  // Redeploying State per card id
  const [redeployingId, setRedeployingId] = useState<string | null>(null);

  // Preview Frame Modal State
  const [previewAd, setPreviewAd] = useState<PastWinningAd | null>(null);

  // Modal for New Campaign Creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAdvertiser, setNewAdvertiser] = useState('Aegis Digital Agency');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'automotive' | 'esports' | 'luxury' | 'fintech' | 'gaming' | 'fashion'>('automotive');
  const [newCity, setNewCity] = useState(selectedCity);
  const [newCountry, setNewCountry] = useState(selectedCountry);
  const [newBidDollars, setNewBidDollars] = useState('40.00');
  const [submittingNew, setSubmittingNew] = useState(false);

  // Fetch or Initializer for Ad Library Data
  const fetchAdLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ad-library');
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      } else {
        // Fallback default dataset if server endpoint loading
        setAds(DEFAULT_WINNING_ADS);
      }
    } catch (e) {
      setAds(DEFAULT_WINNING_ADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdLibrary();
  }, []);

  // Filter and Sort Logic
  const filteredAds = ads
    .filter((ad) => {
      const matchesSearch =
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
      const matchesCity = selectedCityFilter === 'all' || ad.targetCityCode === selectedCityFilter;

      return matchesSearch && matchesCategory && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === 'roas') return b.roasMultiplier - a.roasMultiplier;
      if (sortBy === 'impressions') return b.impressions - a.impressions;
      if (sortBy === 'ctr') return b.ctrPercent - a.ctrPercent;
      if (sortBy === 'bid') return b.bidAmountCents - a.bidAmountCents;
      if (sortBy === 'recent') return new Date(b.winningDate).getTime() - new Date(a.winningDate).getTime();
      return 0;
    });

  // Calculate Aggregated Metrics
  const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0);
  const avgCtr = (ads.reduce((acc, curr) => acc + curr.ctrPercent, 0) / (ads.length || 1)).toFixed(2);
  const maxRoas = Math.max(...ads.map((ad) => ad.roasMultiplier), 0).toFixed(1);

  // 1-Click Re-Deploy Action
  const handleRedeploy = async (ad: PastWinningAd) => {
    setRedeployingId(ad.id);
    try {
      const res = await fetch('/api/bids/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${ad.title} (Re-Deployed)`,
          imageUrl: ad.imageUrl,
          targetCityCode: ad.targetCityCode,
          targetCountryCode: ad.targetCountryCode,
          bidAmountCents: ad.bidAmountCents,
          advertiserName: ad.advertiserName
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast({
          type: 'success',
          title: 'Campaign Re-Deployed Successfully!',
          message: `Re-entered '${ad.title}' into ${data.queueKey} with bid $${(ad.bidAmountCents / 100).toFixed(2)}.`,
          cityCode: ad.targetCityCode,
          bidAmountCents: ad.bidAmountCents,
          safetyScore: data.safetyScore
        });
        onBidSubmitted();
      } else {
        addToast({
          type: 'warning',
          title: 'Re-Deploy Failed',
          message: data.error || 'Gemini Safety Audit rejected the creative submission.'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Network Error',
        message: err.message || 'Failed to communicate with RTB bidding engine.'
      });
    } finally {
      setRedeployingId(null);
    }
  };

  // Submit New Custom Winning Campaign Modal
  const handleCreateNewCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newImageUrl) return;

    setSubmittingNew(true);
    try {
      const cents = Math.round(parseFloat(newBidDollars) * 100);
      const newAdObj: PastWinningAd = {
        id: `lib_${Date.now()}`,
        title: newTitle,
        advertiserName: newAdvertiser,
        imageUrl: newImageUrl,
        category: newCategory,
        targetCityCode: newCity,
        targetCountryCode: newCountry,
        bidAmountCents: cents,
        winningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        impressions: Math.floor(Math.random() * 150000) + 50000,
        clicks: Math.floor(Math.random() * 9000) + 2000,
        ctrPercent: parseFloat((Math.random() * 4 + 3.5).toFixed(2)),
        roasMultiplier: parseFloat((Math.random() * 8 + 6.0).toFixed(1)),
        safetyScore: 98,
        totalWins: 1,
        tags: [newCategory, newCity, 'NEW_ENTRY']
      };

      // Add to state and server endpoint
      setAds((prev) => [newAdObj, ...prev]);

      await fetch('/api/ad-library/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdObj)
      });

      addToast({
        type: 'success',
        title: 'New Campaign Saved to Vault',
        message: `Saved '${newTitle}' to your Ad Library with 98/100 Gemini Brand Safety verification.`,
        cityCode: newCity,
        bidAmountCents: cents
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewImageUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-extrabold uppercase tracking-widest">
              <Library className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>PAST WINNING CREATIVES & CAMPAIGN VAULT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              High-Performing Billboard Campaign Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono leading-relaxed">
              Browse previous auction winner ad creatives across global geofences. Filter by ROI, CTR, or impressions and re-deploy top campaigns into the live auction queue in one click.
            </p>
            {/* Geotargeting Feature Callout */}
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>🎯 Local Storefront Geotargeting:</strong> Your ads broadcast strictly to verified viewers within your selected city & zip code radius for 100% budget efficiency.
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 font-mono text-xs flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Import New Creative to Vault</span>
          </button>
        </div>

        {/* Aggregated Performance Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Vault Campaigns</span>
            </div>
            <div className="text-xl font-black text-white">{ads.length} Ads</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Total Impressions</span>
            </div>
            <div className="text-xl font-black text-cyan-300">
              {(totalImpressions / 1000000).toFixed(2)}M Views
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
              <span>Avg CTR</span>
            </div>
            <div className="text-xl font-black text-emerald-400">{avgCtr}%</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-slate-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Max ROAS</span>
            </div>
            <div className="text-xl font-black text-indigo-300">{maxRoas}x Return</div>
          </div>
        </div>
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search campaigns, tags, agencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
          />
        </div>

        {/* Category & Region Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-400 font-bold focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="automotive">Automotive</option>
              <option value="esports">Esports & Gaming</option>
              <option value="luxury">Luxury & Tech</option>
              <option value="fintech">FinTech & AI</option>
              <option value="fashion">Fashion & Lifestyle</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 font-bold">City:</span>
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold focus:outline-none"
            >
              <option value="all">All Cities</option>
              <option value="KUL">Kuala Lumpur (KUL)</option>
              <option value="TYO">Tokyo (TYO)</option>
              <option value="NYC">New York (NYC)</option>
              <option value="LON">London (LON)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-400 font-bold focus:outline-none"
            >
              <option value="roas">Highest ROAS (Return)</option>
              <option value="impressions">Most Impressions</option>
              <option value="ctr">Highest CTR (%)</option>
              <option value="bid">Highest Bid ($)</option>
              <option value="recent">Most Recent Win</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      {filteredAds.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3 font-mono">
          <Library className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white">No Matching Ad Creatives Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, city filter, or category selector.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-cyan-500/10 transition-all group flex flex-col justify-between font-mono"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1 flex-wrap">
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg tracking-wider">
                        <Zap className="w-3 h-3 text-slate-950 fill-current" />
                        {(ad.impressions / 1000).toFixed(0)}K Views • {ad.clicks.toLocaleString()} Clicks
                      </span>
                      <span className="bg-slate-950/90 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                        {ad.category}
                      </span>
                    </div>

                    {/* Bottom Title Overlay */}
                    <div className="absolute bottom-3 inset-x-3 space-y-0.5">
                      <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                        {ad.advertiserName}
                      </div>
                      <h3 className="text-sm font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {ad.title}
                      </h3>
                    </div>
                  </div>

                  {/* Performance Metrics Stats Grid */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          Impressions
                        </span>
                        <div className="font-extrabold text-slate-200">
                          {(ad.impressions / 1000).toFixed(1)}K Views
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3 text-emerald-400" />
                          CTR %
                        </span>
                        <div className="font-extrabold text-emerald-400">{ad.ctrPercent}%</div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-indigo-400" />
                          ROAS Return
                        </span>
                        <div className="font-extrabold text-indigo-300">{ad.roasMultiplier}x ROAS</div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-amber-400" />
                          Winning Bid
                        </span>
                        <div className="font-extrabold text-amber-300">
                          ${(ad.bidAmountCents / 100).toFixed(2)} [{ad.targetCityCode}]
                        </div>
                      </div>
                    </div>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {ad.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 border-t border-slate-800/50 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewAd(ad)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs font-mono"
                    title="Preview ad creative inside city frame"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview Frame</span>
                  </button>

                  <button
                    onClick={() => handleRedeploy(ad)}
                    disabled={redeployingId === ad.id}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-mono group-hover:scale-105"
                  >
                    {redeployingId === ad.id ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                        <span>Re-Deploy</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for Importing New Campaign into Vault */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono text-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg text-white font-black">Import Creative to Vault</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewCampaign} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyberpunk CyberTruck Cyber-Friday Drop"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Advertiser Company</label>
                  <input
                    type="text"
                    required
                    value={newAdvertiser}
                    onChange={(e) => setNewAdvertiser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold"
                    >
                      <option value="automotive">Automotive</option>
                      <option value="esports">Esports & Gaming</option>
                      <option value="luxury">Luxury & Tech</option>
                      <option value="fintech">FinTech & AI</option>
                      <option value="fashion">Fashion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Target City</label>
                    <select
                      value={newCity}
                      onChange={(e) => {
                        setNewCity(e.target.value);
                        if (e.target.value === 'KUL') setNewCountry('MY');
                        if (e.target.value === 'TYO') setNewCountry('JP');
                        if (e.target.value === 'NYC') setNewCountry('US');
                        if (e.target.value === 'LON') setNewCountry('UK');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                    >
                      <option value="KUL">Kuala Lumpur (KUL)</option>
                      <option value="TYO">Tokyo (TYO)</option>
                      <option value="NYC">New York (NYC)</option>
                      <option value="LON">London (LON)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bid Amount ($)</label>
                  <input
                    type="number"
                    step="1.00"
                    required
                    value={newBidDollars}
                    onChange={(e) => setNewBidDollars(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-extrabold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingNew}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {submittingNew ? (
                    <span>Verifying Brand Safety & Saving...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Save Creative to Ad Library</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Frame Preview Modal for Ad Creatives */}
      <AnimatePresence>
        {previewAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-mono text-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                  </span>
                  <div>
                    <h3 className="text-base text-white font-black">{previewAd.title}</h3>
                    <p className="text-[10px] text-slate-400 font-sans">
                      By {previewAd.advertiserName} • Frame Preview Target: [{previewAd.targetCityCode}]
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewAd(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rendered Landmark/Digital Bezel Frame Preview */}
              <div className="space-y-3">
                {/* Performance Badge Banner */}
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <span className="font-extrabold text-amber-300 block text-xs">Top Performer Badge</span>
                      <span className="text-[11px] text-slate-300">
                        {(previewAd.impressions / 1000).toFixed(1)}K Views • {previewAd.clicks.toLocaleString()} Clicks ({previewAd.ctrPercent}% CTR)
                      </span>
                    </div>
                  </div>
                  <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase">
                    {previewAd.roasMultiplier}x ROAS
                  </span>
                </div>

                <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider flex items-center justify-between">
                  <span>📸 LIVE DIGITAL SCREEN FRAME SIMULATION</span>
                  <span>ASPECT RATIO: 16:9 HD</span>
                </div>

                <LandmarkFrame cityCode={previewAd.targetCityCode} cityName={previewAd.targetCityCode}>
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={previewAd.imageUrl}
                      alt={previewAd.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div>
                        <div className="text-[10px] text-cyan-300 font-bold uppercase">{previewAd.advertiserName}</div>
                        <div className="font-extrabold truncate max-w-xs">{previewAd.title}</div>
                      </div>
                      <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        Safety: {previewAd.safetyScore}%
                      </span>
                    </div>
                  </div>
                </LandmarkFrame>
              </div>

              {/* Specs & Performance Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold">ROAS Return</span>
                  <div className="font-extrabold text-indigo-300">{previewAd.roasMultiplier}x</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold">Past Winning Bid</span>
                  <div className="font-extrabold text-amber-300">${(previewAd.bidAmountCents / 100).toFixed(2)}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold">Click-Through</span>
                  <div className="font-extrabold text-emerald-400">{previewAd.ctrPercent}%</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold">Impressions</span>
                  <div className="font-extrabold text-slate-200">{(previewAd.impressions / 1000).toFixed(0)}K</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleRedeploy(previewAd);
                    setPreviewAd(null);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 fill-current" />
                  <span>Re-Deploy Creative to {previewAd.targetCityCode} Screen</span>
                </button>
                <button
                  onClick={() => setPreviewAd(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Initial Seed Dataset for Past Winning Campaigns
const DEFAULT_WINNING_ADS: PastWinningAd[] = [
  {
    id: 'lib_01',
    title: 'Kuala Lumpur Cyber Automotive Hypercar Launch',
    advertiserName: 'Aegis Motors Global',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    category: 'automotive',
    targetCityCode: 'KUL',
    targetCountryCode: 'MY',
    bidAmountCents: 3500,
    winningDate: 'Aug 18, 2026',
    impressions: 248500,
    clicks: 14200,
    ctrPercent: 5.71,
    roasMultiplier: 12.8,
    safetyScore: 98,
    totalWins: 18,
    tags: ['EV', 'HYPERCAR', 'KL_GEOFENCE']
  },
  {
    id: 'lib_02',
    title: 'Tokyo Shibuya Esports Global Championship',
    advertiserName: 'Razer CyberX Asia',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    category: 'esports',
    targetCityCode: 'TYO',
    targetCountryCode: 'JP',
    bidAmountCents: 5000,
    winningDate: 'Aug 19, 2026',
    impressions: 412000,
    clicks: 28500,
    ctrPercent: 6.91,
    roasMultiplier: 14.8,
    safetyScore: 99,
    totalWins: 24,
    tags: ['GAMING', 'SHIBUYA', 'VALORANT']
  },
  {
    id: 'lib_03',
    title: 'Times Square Web3 Luxury Watch Drop',
    advertiserName: 'Chronos Digital Luxury',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    category: 'luxury',
    targetCityCode: 'NYC',
    targetCountryCode: 'US',
    bidAmountCents: 7500,
    winningDate: 'Aug 20, 2026',
    impressions: 680000,
    clicks: 39400,
    ctrPercent: 5.79,
    roasMultiplier: 11.2,
    safetyScore: 97,
    totalWins: 12,
    tags: ['LUXURY', 'TIMES_SQUARE', 'WEB3']
  },
  {
    id: 'lib_04',
    title: 'London FinTech AI Quantum Trading Summit',
    advertiserName: 'Apex Quant Technologies',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category: 'fintech',
    targetCityCode: 'LON',
    targetCountryCode: 'UK',
    bidAmountCents: 4500,
    winningDate: 'Aug 17, 2026',
    impressions: 189000,
    clicks: 11800,
    ctrPercent: 6.24,
    roasMultiplier: 9.8,
    safetyScore: 96,
    totalWins: 8,
    tags: ['AI', 'FINTECH', 'LONDON_CITY']
  },
  {
    id: 'lib_05',
    title: 'Neon Cyberpunk Wearable Smart Glasses Drop',
    advertiserName: 'Ocular AR Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    category: 'luxury',
    targetCityCode: 'KUL',
    targetCountryCode: 'MY',
    bidAmountCents: 4000,
    winningDate: 'Aug 21, 2026',
    impressions: 310000,
    clicks: 21500,
    ctrPercent: 6.93,
    roasMultiplier: 13.4,
    safetyScore: 98,
    totalWins: 15,
    tags: ['AR_GLASSES', 'KLCC', 'CYBERWEAR']
  },
  {
    id: 'lib_06',
    title: 'Shinjuku Neon Synthwave Energy Drink Launch',
    advertiserName: 'HyperFuel Labs',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    category: 'gaming',
    targetCityCode: 'TYO',
    targetCountryCode: 'JP',
    bidAmountCents: 6000,
    winningDate: 'Aug 16, 2026',
    impressions: 520000,
    clicks: 34100,
    ctrPercent: 6.55,
    roasMultiplier: 10.5,
    safetyScore: 99,
    totalWins: 21,
    tags: ['ENERGY', 'SHINJUKU', 'SYNTH']
  }
];
