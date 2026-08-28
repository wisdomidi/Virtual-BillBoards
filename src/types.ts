export type RegionKey = 'KUL' | 'TYO' | 'NYC' | 'LON' | 'MY' | 'JP' | 'US' | 'UK' | 'GLOBAL';

export interface User {
  id: string;
  email: string;
  companyName: string;
  balanceCents: number;
  watchPoints: number;
  role: 'advertiser' | 'viewer' | 'admin';
  authToken: string;
}

export interface AdCampaign {
  id: string;
  advertiserId: string;
  userId?: string;
  isHouseAd?: boolean;
  title: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  ctaType?: 'website' | 'whatsapp' | 'none';
  ctaUrl?: string;
  targetCountryCode: string; // e.g. "MY", "JP", "US", "UK", "ALL"
  targetCityCode: string;    // e.g. "KUL", "TYO", "NYC", "LON", "ALL"
  bidAmountCents: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'queued' | 'active' | 'completed';
  safetyScore: number;       // 0 - 100
  safetyRejectionReason?: string;
  createdAt: string;
  landingPageUrl?: string;
  whatsappLink?: string;
  qrCodeUrl?: string;
}

export interface RealtimeBid {
  id: string;
  campaignId: string;
  userId?: string;
  isHouseAd?: boolean;
  advertiserName: string;
  adTitle: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  ctaType?: 'website' | 'whatsapp' | 'none';
  ctaUrl?: string;
  regionKey: RegionKey;
  bidAmountCents: number;
  timestamp: number;
  status: 'queued' | 'won' | 'outbid' | 'expired';
  landingPageUrl?: string;
  whatsappLink?: string;
  qrCodeUrl?: string;
}

export interface QueueItem {
  id: string;
  advertiserId?: string;
  userId?: string;
  isHouseAd?: boolean;
  advertiserName: string;
  title: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  ctaType?: 'website' | 'whatsapp' | 'none';
  ctaUrl?: string;
  targetCountryCode: string;
  targetCityCode: string;
  bidAmountCents: number;
  bidAmountTokens?: number;
  trafficTier?: 'standard' | 'tier1_staring_eyeballs';
  safetyScore: number;
  createdAt?: string;
  industry?: string;
  creativeUrl?: string;
  isCustomUpload?: boolean;
  landingPageUrl?: string;
  whatsappLink?: string;
  qrCodeUrl?: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tagline: string;
  priceDollars: number;
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  playsCount: number; // calculated at 1 token/play floor
  badge?: string;
  isPopular?: boolean;
  iconName: string;
  colorTheme: string;
}

export interface TokenTransaction {
  id: string;
  type: 'pack_purchase' | 'slot_burn' | 'outbid_refund' | 'bonus_grant' | 'm2m_burn' | 'topup';
  tokens: number;
  tokenBalanceAfter?: number;
  amountDollars?: string;
  amountCents?: number;
  description: string;
  cityCode?: string;
  slotId?: string;
  timestamp: string;
}

export interface ActiveBillboardSlot {
  slotId: string;
  startTime: number;
  endTime: number;
  remainingSeconds: number;
  currentBid: RealtimeBid;
  trafficTier?: 'standard' | 'tier1_staring_eyeballs';
  fallbackLevel: 'city' | 'country' | 'global' | 'house_default';
  fallbackChain: {
    cityChecked: string;
    cityHit: boolean;
    countryChecked: string;
    countryHit: boolean;
    globalChecked: string;
    globalHit: boolean;
    houseAdFallbackUsed: boolean;
    latencyMs: number;
  };
}

export interface ProofOfAttentionTicket {
  ticketId: string;
  slotId: string;
  adId: string;
  adTitle: string;
  viewerId: string;
  targetCityCode: string;
  trafficTier: 'standard' | 'tier1_staring_eyeballs';
  interactionType: 'floating_pixel' | 'micro_target' | 'rapid_catch' | 'visual_prompt';
  latencyMs: number;
  clickVector: { x: number; y: number; deltaX?: number; deltaY?: number };
  entropyScore: number; // 0-100 human natural curve confidence
  pointsEarned: number;
  cryptographicSignature: string; // HMAC-SHA256
  verifiedTimestamp: string;
}

export interface CaptchaChallenge {
  challengeToken: string;
  prompt: string;
  options: Array<{ id: number; label: string; icon: string; isCorrect?: boolean }>;
  timeLimitSeconds: number;
  expiresAtMs: number;
}

export interface PayoutLedgerEntry {
  id: string;
  viewerId: string;
  slotId: string;
  watchSeconds: number;
  pointsEarned: number;
  heartbeatHash: string;
  tabVisible: boolean;
  ipVelocityScore: number; // requests/sec
  fraudStatus: 'verified' | 'flagged_hidden_tab' | 'flagged_velocity' | 'flagged_replay_attack' | 'flagged_bot_247' | 'failed_captcha_challenge' | 'rejected';
  timestamp: string;
  poaTicketId?: string;
  trafficTier?: 'standard' | 'tier1_staring_eyeballs';
  interactionLatencyMs?: number;
  interactionType?: string;
  cryptographicSignature?: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  type: 'BID_RECEIVED' | 'SAFETY_CHECK' | 'REDIS_UPDATE' | 'AUCTION_WINNER' | 'CASCADE_EVAL' | 'HEARTBEAT';
  message: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system' | 'bid_alert' | 'reaction';
  avatarColor?: string;
  reactionEmoji?: string;
}

export interface PastWinningAd {
  id: string;
  title: string;
  advertiserName: string;
  imageUrl: string;
  category: 'automotive' | 'esports' | 'luxury' | 'fintech' | 'gaming' | 'fashion';
  targetCityCode: string;
  targetCountryCode: string;
  bidAmountCents: number;
  winningDate: string;
  impressions: number;
  clicks: number;
  ctrPercent: number;
  roasMultiplier: number;
  safetyScore: number;
  totalWins: number;
  tags: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'outbid' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp?: string;
  cityCode?: string;
  countryCode?: string;
  bidAmountCents?: number;
  safetyScore?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface AutoBidRecommendation {
  cityCode: string;
  historicalAvgWinCents: number;
  historicalAvgWinDollars: string;
  currentTopBidCents: number;
  recommendedBidCents: number;
  recommendedBidDollars: string;
  winProbabilityEst: number;
  marketHeatIndex: string;
  strategyTip: string;
  reserveFloorDollars: string;
}

export interface HourlyTrendPoint {
  time: string;
  KUL: number;
  TYO: number;
  NYC: number;
  LON: number;
  avgClearing: number;
}

export interface FallbackWinRatePoint {
  name: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface CityDemandPoint {
  city: string;
  cityName: string;
  activeBidders: number;
  totalBids24h: number;
  avgCpm: number;
  winRate: number;
  totalVolumeUSD: number;
}

export interface RegionalAnalyticsData {
  hourlyTrends: HourlyTrendPoint[];
  winRateByFallback: FallbackWinRatePoint[];
  demandByCity: CityDemandPoint[];
  realtimeMetrics: {
    totalBids24h: number;
    totalClearingVolumeUSD: number;
    avgLatencyMs: number;
    geminiPassRatePercent: number;
  };
}

export type UserRole = 'guest' | 'paid_watcher' | 'advertiser' | 'streamer' | 'admin' | 'viewer';

export interface PlatformSettings {
  slotDurationSeconds: number;
  cityReserveFloorCents: number;
  countryReserveFloorCents: number;
  globalReserveFloorCents: number;
  geminiSafetyThreshold: number;
  streamerRevSharePercent: number;
  maintenanceMode: boolean;
  emergencyAlertBanner: string;
  houseAdTitle: string;
  houseAdImageUrl: string;
  activeEnvironment: 'night_city' | 'day_skyline' | 'cyberpunk_neon' | 'studio_stage';
}

export interface CityConfig {
  cityCode: string;
  countryCode: string;
  cityName: string;
  countryName: string;
  flagEmoji: string;
  active: boolean;
  reserveFloorCents: number;
}

export type TabType = 'live' | 'leaderboard' | 'watcher' | 'streamer' | 'ad_library' | 'blog' | 'analytics' | 'admin' | 'architecture' | 'postgres' | 'redis' | 'cascade' | 'ledger' | 'ai_agents' | 'api_docs' | 'webmcp' | 'privacy' | 'terms';

// ==============================================================================
// AUTONOMOUS AI AGENTS & DYNAMIC YIELD & M2M PAYMENT TYPES
// ==============================================================================

export type AiAgentStrategy = 'velocity_surge_sniper' | 'brand_dominance' | 'high_value_prime' | 'opportunistic_value' | 'frequency_fill_optimizer';

export interface AgentApiKey {
  id: string;
  keyName: string;
  apiKey: string;
  ownerUserId: string;
  ownerUserEmail?: string;
  walletBalanceCents: number;
  walletBalanceDollars: string;
  status: 'active' | 'revoked';
  allowedCities: string[];
  webhookUrl?: string;
  stripeCustomerId?: string;
  autoFundThresholdCents?: number;
  autoFundAmountCents?: number;
  totalSpentCents: number;
  totalSlotsWon: number;
  totalBidsPlaced: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AgentBidRequest {
  targetCityCode: string;
  bidAmountCents?: number;
  bidAmountDollars?: number;
  ad: {
    title: string;
    imageUrl: string;
    ctaType?: 'website' | 'whatsapp' | 'none';
    ctaUrl?: string;
    tagline?: string;
  };
  paymentMethod: 'wallet_balance' | 'stripe_m2m';
  webhookUrl?: string;
}

export interface AgentBidResponse {
  success: boolean;
  bidId: string;
  queuePosition: number;
  isTopBid: boolean;
  cityCode: string;
  bidAmountCents: number;
  bidAmountDollars: string;
  estimatedBroadcastTime: string;
  receipt: {
    m2mTransactionId: string;
    paymentMethod: 'wallet_balance' | 'stripe_m2m';
    stripePaymentIntentId?: string;
    cloudflareRayId?: string;
    status: 'succeeded' | 'authorized' | 'processing';
    timestamp: string;
  };
  error?: string;
}

export interface AgentSlotPricingInfo {
  cityCode: string;
  cityName: string;
  currentFloorCents: number;
  currentFloorDollars: string;
  activeWatchers: number;
  currentTopBidCents: number;
  currentTopBidDollars: string;
  surgeMultiplier: number;
  demandLevel: 'LOW' | 'OPTIMAL' | 'HIGH' | 'SURGE';
  timeRemainingInSlotSeconds: number;
  currentSlotId: string;
}

export interface YieldPricingDecisionLog {
  id: string;
  cityCode: string;
  cityName: string;
  timestamp: string;
  previousFloorCents: number;
  newFloorCents: number;
  previousFloorDollars: string;
  newFloorDollars: string;
  multiplier: number;
  reason: string;
  triggerType: 'high_velocity' | 'viewer_surge' | 'low_fill_discount' | 'off_peak_adjustment' | 'gemini_optimizer';
  viewerDensity: number;
  bidVelocityPerMin: number;
}

export interface CityYieldPricingItem {
  cityCode: string;
  cityName: string;
  baseFloorCents: number;
  currentFloorCents: number;
  currentFloorDollars: string;
  surgeMultiplier: number;
  activeWatchers: number;
  bidVelocity: number;
  demandLevel: 'LOW' | 'OPTIMAL' | 'HIGH' | 'SURGE';
}

export interface DynamicYieldPricingStatus {
  autopilotActive: boolean;
  evaluationIntervalSeconds: number;
  lastOptimizationTimestamp: string;
  globalSurgeMultiplier: number;
  cityPricingMatrix: Record<string, CityYieldPricingItem>;
  recentDecisionLogs: YieldPricingDecisionLog[];
  tuningParams: {
    minFloorCents: number;
    maxFloorCents: number;
    surgeElasticity: number; // 0.1 - 1.0
    discountEnabled: boolean;
  };
}

export interface M2MTransactionItem {
  id: string;
  agentId: string;
  agentName: string;
  type: 'm2m_auto_topup' | 'm2m_wallet_deposit' | 'm2m_slot_bid_placed' | 'm2m_slot_burn' | 'm2m_instant_bid_charge';
  amountCents: number;
  amountDollars: string;
  m2mApiKey: string;
  stripePaymentIntentId?: string;
  cloudflareRayId?: string;
  timestamp: string;
  cityCode?: string;
  slotId?: string;
  status: 'succeeded' | 'processing' | 'failed';
}

export interface ScheduledTimeSlot {
  slotId: string;
  targetCityCode: string;
  startTime: number; // Unix timestamp in ms
  endTime: number; // Unix timestamp in ms
  timeLabel: string; // e.g. "+15m (14:30 - 14:45)"
  slotIndex: number; // relative offset
  reserveFloorDollars: string;
  reserveFloorCents: number;
  currentTopBidDollars?: string;
  currentTopBidCents?: number;
  bidsCount: number;
  topBidderName?: string;
  status: 'open' | 'active' | 'closing_soon';
}

export interface ScheduledBidRecord {
  id: string;
  slotId: string;
  targetCityCode: string;
  targetCountryCode: string;
  userId?: string;
  advertiserName: string;
  title: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  ctaType?: 'website' | 'whatsapp' | 'none';
  ctaUrl?: string;
  bidAmountCents: number;
  bidAmountDollars: string;
  scheduledStartTime: number;
  scheduledEndTime: number;
  status: 'scheduled' | 'executed' | 'outbid' | 'refunded';
  createdAt: string;
}

export interface HistoricalCityBid {
  id: string;
  rank: number;
  title: string;
  shortTitle: string;
  advertiserName: string;
  bidAmountDollars: number;
  bidAmountCents: number;
  cityCode: string;
  date: string;
}

export interface UserBidActivity {
  id: string;
  title: string;
  imageUrl: string;
  cityCode: string;
  countryCode: string;
  bidAmountDollars: string;
  bidAmountCents: number;
  mediaType?: 'image' | 'video';
  ctaType?: 'website' | 'whatsapp' | 'none';
  ctaUrl?: string;
  createdAt: string;
  status: 'live' | 'scheduled' | 'outbid' | 'completed';
  isTopBid?: boolean;
}

export interface CityLeaderboardEntry {
  rank: number;
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryFlag: string;
  totalVolumeDollars: number;
  totalVolumeCents: number;
  totalBidsCount: number;
  activeLiveAdsCount: number;
  currentTopBidDollars: number;
  topAdvertiserName: string;
  heatLevel: 'volcanic' | 'hot' | 'warm' | 'steady';
  volumeGrowthPercent: number;
}

// -----------------------------------------------------------------------------
// GAME-STATE TRIGGER & WHITELABEL OVERLAY TYPES
// -----------------------------------------------------------------------------

export type GameStateEventType =
  | 'kill_streak'
  | 'victory_royale'
  | 'ace_clutch'
  | 'boss_defeated'
  | 'sub_hype_bomb'
  | 'tournament_champion'
  | 'level_up'
  | 'game_over'
  | 'keynote_live'
  | 'award_announcement'
  | 'sponsor_showcase'
  | 'networking_hour'
  | 'flash_takeover'
  | 'hackathon_winner'
  | 'crowd_hype'
  | 'custom_event';

export type OverlayLayoutType =
  | 'corner_pip'
  | 'bottom_ticker'
  | 'side_dock'
  | 'event_alert_only'
  | 'full_takeover';

export interface StreamerGameStateEvent {
  eventId: string;
  streamerId: string;
  eventType: GameStateEventType;
  gameTitle?: string;
  headline: string;
  subheadline?: string;
  sponsorName: string;
  sponsorImageUrl?: string;
  sponsorCtaUrl?: string;
  bidAmountDollars: number;
  durationSeconds: number;
  timestamp: string;
  particlesEmoji?: string;
  customVfx?: 'neon_burst' | 'victory_gold' | 'flame_rampage' | 'cyber_glitch';
}

export interface StreamerRevenueRecord {
  streamerId: string;
  handle: string;
  solanaWallet?: string;
  totalImpressions: number;
  totalEventsTriggered: number;
  totalEarningsDollars: string;
  unclaimedEarningsDollars: string;
  minReservePriceDollars: number;
  activeLayout: OverlayLayoutType;
  customTheme: string;
  webhookSecret: string;
}

// -----------------------------------------------------------------------------
// SOLANA USDC MICRO-PAYMENT HIGHWAY & WEBMCP ANALYTICS TYPES
// -----------------------------------------------------------------------------

export interface SolanaUsdcSettlement {
  signature: string;
  fromWallet: string;
  toWallet: string;
  amountUsdc: number;
  slotId: string;
  targetCityOrHandle: string;
  timestamp: number;
  network: 'mainnet-beta' | 'devnet';
  streamerSplitUsdc: number;
  viewerPoolUsdc: number;
  protocolTreasuryUsdc: number;
  memoHash: string;
  solscanUrl?: string;
  verifiedOnChain?: boolean;
}

export interface WatcherUsdcClaimRecord {
  claimId: string;
  viewerId: string;
  viewerSolanaWallet: string;
  pointsClaimed: number;
  usdcAmount: number;
  signature: string;
  solscanUrl: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface AtomicSplitResult {
  success: boolean;
  signature?: string;
  solscanUrl?: string;
  streamerWallet: string;
  streamerAmountUsdc: number;
  watcherPoolAmountUsdc: number;
  treasuryAmountUsdc: number;
  network: string;
  error?: string;
}

export interface HistoricalROIReport {
  target: string;
  timeframe: '1h' | '24h' | '7d';
  effectiveCpmDollars: number;
  clickThroughRatePercent: number;
  averageBidDollars: number;
  totalSlotsRotated: number;
  totalAudienceImpressions: number;
  proofOfAttentionRatePercent: number;
  estimatedRoasMultiplier: number;
  peakHourUtc: number;
}

export interface StreamRetentionPrediction {
  target: string;
  predictedAttentionScore: number; // 0 - 100
  viewerDwellCurve: { minute: number; predictedRetentionPercent: number }[];
  expectedViewerCount: number;
  recommendedBidDollars: number;
  surgeProbability: number;
  optimalBiddingWindow: string;
}

export interface AudienceAttentionSpikesReport {
  cityCode: string;
  currentActiveHumans: number;
  proofOfAttentionSolveRate: number; // 0 - 100%
  recentSpikeEvents: { timeUtc: string; multiplier: number; reason: string }[];
  topEngagedLanguage: string;
}


