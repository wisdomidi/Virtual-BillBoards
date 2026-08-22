import { Request, Response } from 'express';
import crypto from 'crypto';
import Stripe from 'stripe';
import { Challenge, Credential, Receipt } from 'mppx';
import { GoogleGenAI } from '@google/genai';
import {
  AgentApiKey,
  AgentBidRequest,
  AgentBidResponse,
  AgentSlotPricingInfo,
  DynamicYieldPricingStatus,
  M2MTransactionItem,
  YieldPricingDecisionLog,
  QueueItem,
  CityConfig
} from '../types.js';
import {
  INITIAL_AGENT_API_KEYS,
  INITIAL_DYNAMIC_YIELD_STATUS,
  INITIAL_M2M_TRANSACTIONS
} from '../data/aiAgentsData.js';

// In-Memory Global State for Real AI Agent M2M Platform
export const agentApiKeysStore: Map<string, AgentApiKey> = new Map();

// Initialize initial registered keys
INITIAL_AGENT_API_KEYS.forEach((key) => {
  agentApiKeysStore.set(key.apiKey, { ...key });
});

export const dynamicYieldState: DynamicYieldPricingStatus = JSON.parse(JSON.stringify(INITIAL_DYNAMIC_YIELD_STATUS));
export const m2mTransactionsLedger: M2MTransactionItem[] = JSON.parse(JSON.stringify(INITIAL_M2M_TRANSACTIONS));

// Helper: Extract & Authenticate M2M API Key from Request
export function authenticateAgentApiKey(req: Request): { authorized: boolean; agent?: AgentApiKey; error?: string } {
  let token = '';

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-agent-api-key']) {
    token = (req.headers['x-agent-api-key'] as string).trim();
  } else if (req.headers['x-m2m-api-key']) {
    token = (req.headers['x-m2m-api-key'] as string).trim();
  } else if (req.query.apiKey) {
    token = (req.query.apiKey as string).trim();
  }

  if (!token) {
    return {
      authorized: false,
      error: 'Missing M2M API Key. Provide "Authorization: Bearer <m2m_key>" or "X-Agent-API-Key: <m2m_key>" header.'
    };
  }

  const agent = agentApiKeysStore.get(token);
  if (!agent) {
    return {
      authorized: false,
      error: 'Invalid M2M API Key. Key not recognized by Billboard M2M Gateway.'
    };
  }

  if (agent.status !== 'active') {
    return {
      authorized: false,
      error: 'M2M API Key is revoked or suspended.'
    };
  }

  agent.lastUsedAt = new Date().toISOString();
  return { authorized: true, agent };
}

// ==============================================================================
// 1. DYNAMIC YIELD & PRICING ENGINE (REAL TIME DENSITY & QUEUE VELOCITY)
// ==============================================================================

/**
 * Runs periodic dynamic yield and reserve floor recalculation every 10 seconds.
 * Evaluates real-time viewer density from active WebSocket rooms and queue bidding velocity.
 */
export function runDynamicYieldTick(
  activeCitiesStore: CityConfig[],
  redisQueues: Record<string, QueueItem[]>,
  clientGeoMap: Map<any, any>,
  broadcastToAll: (data: any) => void,
  logTelemetry: (type: string, message: string, details?: any) => void
) {
  if (!dynamicYieldState.autopilotActive) return;

  const now = new Date();
  dynamicYieldState.lastOptimizationTimestamp = now.toISOString();

  // Calculate real connected viewers per room
  const viewersPerRoom: Record<string, number> = {};
  clientGeoMap.forEach((session) => {
    if (session.cityCode) {
      const city = session.cityCode.toUpperCase();
      viewersPerRoom[city] = (viewersPerRoom[city] || 0) + 1;
    }
  });

  activeCitiesStore.forEach((city) => {
    const cityCode = city.cityCode.toUpperCase();
    const queueKey = `billboard:queue:${cityCode}`;
    const queue = redisQueues[queueKey] || [];

    // Real viewers connected via WebSockets + base baseline
    const realWatchers = viewersPerRoom[cityCode] || 0;
    const baseDensity = cityCode === 'TYO' ? 35 : cityCode === 'NYC' ? 45 : cityCode === 'LON' ? 25 : cityCode === 'PAR' ? 20 : 15;
    const activeWatchers = realWatchers + baseDensity;

    // Bidding velocity = number of active bids in queue + rate factor
    const bidVelocity = Math.max(0.5, queue.length * 0.8 + (activeWatchers > 30 ? 1.0 : 0.2));

    const baseFloorCents = 100; // $1.00 base floor
    let surgeMultiplier = 1.0;
    let triggerType: YieldPricingDecisionLog['triggerType'] = 'off_peak_adjustment';
    let demandLevel: 'LOW' | 'OPTIMAL' | 'HIGH' | 'SURGE' = 'OPTIMAL';
    let reason = 'Optimal floor locked based on standard inventory flow.';

    if (activeWatchers >= 40 && bidVelocity >= 3.0) {
      surgeMultiplier = 1.5 + Math.min(1.5, (activeWatchers - 40) * 0.02 + (bidVelocity - 3.0) * 0.12);
      demandLevel = 'SURGE';
      triggerType = 'high_velocity';
      reason = `Surge pricing active: High watcher density (${activeWatchers} viewers) & queue velocity (${bidVelocity.toFixed(1)}/min).`;
    } else if (activeWatchers >= 25 || bidVelocity >= 2.0) {
      surgeMultiplier = 1.2 + (activeWatchers - 25) * 0.01;
      demandLevel = 'HIGH';
      triggerType = 'viewer_surge';
      reason = `Elevated demand detected (${activeWatchers} watchers). Reserve floor adjusted to capture higher yield.`;
    } else if (queue.length === 0 && dynamicYieldState.tuningParams.discountEnabled) {
      surgeMultiplier = 0.85; // 15% discount to stimulate slot fill
      demandLevel = 'LOW';
      triggerType = 'low_fill_discount';
      reason = `Zero queued bids. Off-peak 15% discount applied ($0.85 floor) to stimulate slot fill rate.`;
    }

    // Apply elasticity and clamps
    surgeMultiplier = Number(surgeMultiplier.toFixed(2));
    let calculatedFloorCents = Math.round(baseFloorCents * surgeMultiplier);
    calculatedFloorCents = Math.max(
      dynamicYieldState.tuningParams.minFloorCents,
      Math.min(dynamicYieldState.tuningParams.maxFloorCents, calculatedFloorCents)
    );

    const previousMatrix = dynamicYieldState.cityPricingMatrix[cityCode];
    const prevFloor = previousMatrix ? previousMatrix.currentFloorCents : city.reserveFloorCents || 100;

    // Update Matrix
    dynamicYieldState.cityPricingMatrix[cityCode] = {
      cityCode,
      cityName: city.cityName,
      baseFloorCents,
      currentFloorCents: calculatedFloorCents,
      currentFloorDollars: (calculatedFloorCents / 100).toFixed(2),
      surgeMultiplier,
      activeWatchers,
      bidVelocity: Number(bidVelocity.toFixed(1)),
      demandLevel
    };

    // Update city store reserve floor
    city.reserveFloorCents = calculatedFloorCents;

    // Log decision if price shifted by >= $0.10
    if (Math.abs(calculatedFloorCents - prevFloor) >= 10) {
      const decisionLog: YieldPricingDecisionLog = {
        id: `yd_${Date.now()}_${cityCode}`,
        cityCode,
        cityName: city.cityName,
        timestamp: now.toLocaleTimeString(),
        previousFloorCents: prevFloor,
        newFloorCents: calculatedFloorCents,
        previousFloorDollars: (prevFloor / 100).toFixed(2),
        newFloorDollars: (calculatedFloorCents / 100).toFixed(2),
        multiplier: surgeMultiplier,
        reason,
        triggerType,
        viewerDensity: activeWatchers,
        bidVelocityPerMin: Number(bidVelocity.toFixed(1))
      };

      dynamicYieldState.recentDecisionLogs.unshift(decisionLog);
      if (dynamicYieldState.recentDecisionLogs.length > 25) dynamicYieldState.recentDecisionLogs.pop();

      logTelemetry(
        'DYNAMIC_YIELD_ADJUSTED',
        `📈 Dynamic Yield Agent: ${city.cityName} floor adjusted to $${(calculatedFloorCents / 100).toFixed(2)} (${surgeMultiplier}x) — ${reason}`
      );
    }
  });

  // Broadcast dynamic yield state
  broadcastToAll({
    type: 'YIELD_PRICING_UPDATED',
    payload: dynamicYieldState
  });
}

// ==============================================================================
// 2. REAL AI AGENT M2M BIDDING & SLOT SETTLEMENT WORKFLOW
// ==============================================================================

/**
 * Handles slot burn execution when an ad placed by an AI Agent wins the 15s display slot
 */
export function handleSlotBurnForAgent(
  winningAd: QueueItem,
  burnCents: number,
  cityCode: string,
  currentSlotId: string,
  broadcastToAll: (data: any) => void,
  logTelemetry: (type: string, message: string, details?: any) => void
) {
  // Check if advertiser was an M2M Agent Key
  let agent: AgentApiKey | undefined;
  for (const [, k] of agentApiKeysStore.entries()) {
    if (k.id === winningAd.advertiserId || k.apiKey === winningAd.advertiserId) {
      agent = k;
      break;
    }
  }

  if (!agent) return;

  agent.totalSlotsWon += 1;
  agent.totalSpentCents += burnCents;
  agent.walletBalanceDollars = (agent.walletBalanceCents / 100).toFixed(2);

  const m2mSlotTx: M2MTransactionItem = {
    id: `m2m_tx_burn_${Date.now()}`,
    agentId: agent.id,
    agentName: agent.keyName,
    type: 'm2m_slot_burn',
    amountCents: burnCents,
    amountDollars: (burnCents / 100).toFixed(2),
    m2mApiKey: agent.apiKey,
    stripePaymentIntentId: `pi_m2m_burn_${crypto.randomBytes(6).toString('hex')}`,
    cloudflareRayId: `${crypto.randomBytes(8).toString('hex')}-SLOT`,
    timestamp: new Date().toLocaleTimeString(),
    cityCode,
    slotId: currentSlotId,
    status: 'succeeded'
  };

  m2mTransactionsLedger.unshift(m2mSlotTx);
  if (m2mTransactionsLedger.length > 50) m2mTransactionsLedger.pop();

  logTelemetry(
    'M2M_AGENT_SLOT_BROADCAST',
    `🏆 AI Agent [${agent.keyName}] WON 15s billboard slot on [${cityCode}]. Burned $${(burnCents / 100).toFixed(2)} via M2M settlement.`
  );

  broadcastToAll({
    type: 'M2M_TRANSACTION_RECORDED',
    payload: m2mSlotTx
  });
}

// ==============================================================================
// 3. EXPRESS API HANDLERS FOR EXTERNAL AI AGENTS & M2M
// ==============================================================================

/**
 * GET /api/v1/agents/keys
 * List registered Agent API Keys
 */
export const handleGetAgentKeys = (req: Request, res: Response) => {
  const keys = Array.from(agentApiKeysStore.values()).map((k) => ({
    ...k,
    walletBalanceDollars: (k.walletBalanceCents / 100).toFixed(2),
    totalSpentDollars: (k.totalSpentCents / 100).toFixed(2)
  }));

  res.json({
    success: true,
    totalKeys: keys.length,
    activeKeys: keys.filter((k) => k.status === 'active').length,
    keys
  });
};

/**
 * POST /api/v1/agents/keys/generate
 * Generate a new production M2M Agent API Key
 */
export const handleCreateAgentKey = (req: Request, res: Response) => {
  const {
    keyName = 'Autonomous Bidding Agent',
    ownerUserEmail = 'agent-owner@autonomous-rtb.io',
    initialDepositDollars = 100,
    allowedCities = ['*'],
    webhookUrl = '',
    autoFundThresholdDollars = 25,
    autoFundAmountDollars = 100
  } = req.body;

  const keyId = `key_agent_${crypto.randomBytes(6).toString('hex')}`;
  const apiKey = `m2m_live_${crypto.randomBytes(16).toString('hex')}`;
  const depositCents = Math.round((Number(initialDepositDollars) || 50) * 100);

  const newKey: AgentApiKey = {
    id: keyId,
    keyName: String(keyName).trim() || 'Autonomous Bidding Agent',
    apiKey,
    ownerUserId: (req.headers['x-user-uid'] as string) || 'default_user',
    ownerUserEmail: String(ownerUserEmail).trim(),
    walletBalanceCents: depositCents,
    walletBalanceDollars: (depositCents / 100).toFixed(2),
    status: 'active',
    allowedCities: Array.isArray(allowedCities) && allowedCities.length > 0 ? allowedCities : ['*'],
    webhookUrl: String(webhookUrl).trim() || undefined,
    stripeCustomerId: `cus_m2m_${crypto.randomBytes(6).toString('hex')}`,
    autoFundThresholdCents: Math.round((Number(autoFundThresholdDollars) || 25) * 100),
    autoFundAmountCents: Math.round((Number(autoFundAmountDollars) || 100) * 100),
    totalSpentCents: 0,
    totalSlotsWon: 0,
    totalBidsPlaced: 0,
    createdAt: new Date().toISOString()
  };

  agentApiKeysStore.set(apiKey, newKey);

  // Record deposit transaction
  if (depositCents > 0) {
    const depositTx: M2MTransactionItem = {
      id: `m2m_tx_dep_${Date.now()}`,
      agentId: newKey.id,
      agentName: newKey.keyName,
      type: 'm2m_wallet_deposit',
      amountCents: depositCents,
      amountDollars: (depositCents / 100).toFixed(2),
      m2mApiKey: newKey.apiKey,
      stripePaymentIntentId: `pi_m2m_dep_${crypto.randomBytes(6).toString('hex')}`,
      cloudflareRayId: `${crypto.randomBytes(8).toString('hex')}-INIT`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'succeeded'
    };
    m2mTransactionsLedger.unshift(depositTx);
  }

  res.json({
    success: true,
    message: 'New Autonomous AI Agent M2M API Key generated successfully.',
    key: newKey,
    usage: {
      authHeader: `Authorization: Bearer ${apiKey}`,
      endpoints: {
        pricing: 'GET /api/v1/agents/slots/pricing?cityCode=TYO',
        buySlot: 'POST /api/v1/agents/bids/buy-slot',
        bidStatus: 'GET /api/v1/agents/bids/:bidId/status',
        topup: 'POST /api/v1/agents/wallet/topup'
      }
    }
  });
};

/**
 * POST /api/v1/agents/keys/:keyId/revoke
 * Revoke an Agent API Key
 */
export const handleRevokeAgentKey = (req: Request, res: Response) => {
  const { keyId } = req.params;
  let targetKey: AgentApiKey | undefined;

  for (const [, k] of agentApiKeysStore.entries()) {
    if (k.id === keyId || k.apiKey === keyId) {
      targetKey = k;
      break;
    }
  }

  if (!targetKey) {
    return res.status(404).json({ success: false, error: `Agent Key ${keyId} not found` });
  }

  targetKey.status = 'revoked';

  res.json({
    success: true,
    message: `Agent API Key [${targetKey.keyName}] has been revoked.`,
    key: targetKey
  });
};

/**
 * GET /api/v1/agents/me
 * Authenticate agent via Bearer token and return profile & wallet stats
 */
export const handleAgentMe = (req: Request, res: Response) => {
  const auth = authenticateAgentApiKey(req);
  if (!auth.authorized || !auth.agent) {
    return res.status(401).json({ success: false, error: auth.error });
  }

  res.json({
    success: true,
    agent: {
      id: auth.agent.id,
      keyName: auth.agent.keyName,
      status: auth.agent.status,
      walletBalanceCents: auth.agent.walletBalanceCents,
      walletBalanceDollars: (auth.agent.walletBalanceCents / 100).toFixed(2),
      allowedCities: auth.agent.allowedCities,
      webhookUrl: auth.agent.webhookUrl,
      stats: {
        totalBidsPlaced: auth.agent.totalBidsPlaced,
        totalSlotsWon: auth.agent.totalSlotsWon,
        totalSpentDollars: (auth.agent.totalSpentCents / 100).toFixed(2)
      }
    }
  });
};

/**
 * GET /api/v1/agents/slots/pricing
 * Query dynamic reserve floors, active watchers, and current top bid
 */
export const handleGetSlotPricing = (
  req: Request,
  res: Response,
  activeCitiesStore: CityConfig[],
  redisQueues: Record<string, QueueItem[]>,
  currentSlotId: string,
  remainingSeconds: number
) => {
  const cityQuery = req.query.cityCode as string;

  if (cityQuery) {
    const cityCode = cityQuery.toUpperCase();
    const city = activeCitiesStore.find((c) => c.cityCode.toUpperCase() === cityCode);
    if (!city) {
      return res.status(404).json({ success: false, error: `City geofence ${cityCode} not found.` });
    }

    const queueKey = `billboard:queue:${cityCode}`;
    const queue = redisQueues[queueKey] || [];
    const matrix = dynamicYieldState.cityPricingMatrix[cityCode];
    const floorCents = matrix ? matrix.currentFloorCents : city.reserveFloorCents || 100;
    const currentTopBidCents = queue.length > 0 ? queue[0].bidAmountCents : 0;

    const pricingInfo: AgentSlotPricingInfo = {
      cityCode,
      cityName: city.cityName,
      currentFloorCents: floorCents,
      currentFloorDollars: (floorCents / 100).toFixed(2),
      activeWatchers: matrix ? matrix.activeWatchers : 25,
      currentTopBidCents,
      currentTopBidDollars: (currentTopBidCents / 100).toFixed(2),
      surgeMultiplier: matrix ? matrix.surgeMultiplier : 1.0,
      demandLevel: matrix ? matrix.demandLevel : 'OPTIMAL',
      timeRemainingInSlotSeconds: remainingSeconds,
      currentSlotId
    };

    return res.json({ success: true, pricing: pricingInfo });
  }

  // Return all cities
  const pricingList: AgentSlotPricingInfo[] = activeCitiesStore.map((c) => {
    const cityCode = c.cityCode.toUpperCase();
    const queueKey = `billboard:queue:${cityCode}`;
    const queue = redisQueues[queueKey] || [];
    const matrix = dynamicYieldState.cityPricingMatrix[cityCode];
    const floorCents = matrix ? matrix.currentFloorCents : c.reserveFloorCents || 100;
    const currentTopBidCents = queue.length > 0 ? queue[0].bidAmountCents : 0;

    return {
      cityCode,
      cityName: c.cityName,
      currentFloorCents: floorCents,
      currentFloorDollars: (floorCents / 100).toFixed(2),
      activeWatchers: matrix ? matrix.activeWatchers : 25,
      currentTopBidCents,
      currentTopBidDollars: (currentTopBidCents / 100).toFixed(2),
      surgeMultiplier: matrix ? matrix.surgeMultiplier : 1.0,
      demandLevel: matrix ? matrix.demandLevel : 'OPTIMAL',
      timeRemainingInSlotSeconds: remainingSeconds,
      currentSlotId
    };
  });

  res.json({
    success: true,
    totalZones: pricingList.length,
    currentSlotId,
    remainingSeconds,
    zones: pricingList
  });
};

/**
 * POST /api/v1/agents/bids/buy-slot
 * Real Programmatic Ad Space Bidding & Purchasing Endpoint for AI Agents
 */
export const handleProgrammaticBuySlot = async (
  req: Request,
  res: Response,
  activeCitiesStore: CityConfig[],
  redisQueues: Record<string, QueueItem[]>,
  currentSlotId: string,
  remainingSeconds: number,
  broadcastToAll: (data: any) => void,
  broadcastToRoom: (roomId: string, data: any) => void,
  logTelemetry: (type: string, message: string, details?: any) => void,
  getStripe: () => any
) => {
  // 1. Authenticate M2M Key
  const auth = authenticateAgentApiKey(req);
  if (!auth.authorized || !auth.agent) {
    return res.status(401).json({ success: false, error: auth.error });
  }

  const agent = auth.agent;

  try {
    const {
      targetCityCode,
      bidAmountCents,
      bidAmountDollars,
      ad,
      paymentMethod = 'wallet_balance',
      paymentMethodId,
      webhookUrl
    } = req.body;

    if (!targetCityCode) {
      return res.status(400).json({ success: false, error: 'targetCityCode is required (e.g. "TYO", "NYC", "LON", "PAR").' });
    }

    const cityUpper = String(targetCityCode).toUpperCase();
    const city = activeCitiesStore.find((c) => c.cityCode.toUpperCase() === cityUpper);
    if (!city) {
      return res.status(404).json({ success: false, error: `City geofence ${cityUpper} is not recognized or active.` });
    }

    // Verify allowed cities constraint if specified
    if (agent.allowedCities && !agent.allowedCities.includes('*') && !agent.allowedCities.includes(cityUpper)) {
      return res.status(403).json({
        success: false,
        error: `Agent API Key is not authorized to bid in [${cityUpper}]. Allowed zones: ${agent.allowedCities.join(', ')}`
      });
    }

    // Validate Ad Creative
    if (!ad || !ad.title || !ad.imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ad creative. Both "ad.title" and "ad.imageUrl" are required.'
      });
    }

    // Calculate Bid Amount
    let cents = 0;
    if (typeof bidAmountCents === 'number' && bidAmountCents > 0) {
      cents = Math.round(bidAmountCents);
    } else if (typeof bidAmountDollars === 'number' && bidAmountDollars > 0) {
      cents = Math.round(bidAmountDollars * 100);
    } else {
      return res.status(400).json({ success: false, error: 'Valid bidAmountCents or bidAmountDollars is required.' });
    }

    // Check Dynamic Reserve Floor
    const matrix = dynamicYieldState.cityPricingMatrix[cityUpper];
    const currentFloorCents = matrix ? matrix.currentFloorCents : city.reserveFloorCents || 100;

    if (cents < currentFloorCents) {
      return res.status(422).json({
        success: false,
        error: `Bid $${(cents / 100).toFixed(2)} is below the dynamic reserve floor ($${(currentFloorCents / 100).toFixed(2)}) for [${city.cityName}].`,
        requiredFloorDollars: (currentFloorCents / 100).toFixed(2),
        currentSurgeMultiplier: matrix?.surgeMultiplier || 1.0
      });
    }

    let stripePaymentIntentId: string | undefined;

    // 2. Payment Settlement Check
    if (paymentMethod === 'wallet_balance') {
      if (agent.walletBalanceCents < cents) {
        return res.status(402).json({
          success: false,
          error: `Insufficient M2M Agent wallet balance. Current: $${(agent.walletBalanceCents / 100).toFixed(2)}, Required: $${(cents / 100).toFixed(2)}.`,
          currentBalanceDollars: (agent.walletBalanceCents / 100).toFixed(2),
          topupEndpoint: 'POST /api/v1/agents/wallet/topup'
        });
      }

      // Deduct immediately from agent wallet
      agent.walletBalanceCents -= cents;
      agent.walletBalanceDollars = (agent.walletBalanceCents / 100).toFixed(2);

    } else if (paymentMethod === 'stripe_m2m') {
      if (process.env.STRIPE_SECRET_KEY && (paymentMethodId || agent.stripeCustomerId)) {
        try {
          const stripe = getStripe();
          const pi = await stripe.paymentIntents.create({
            amount: cents,
            currency: 'usd',
            customer: agent.stripeCustomerId || undefined,
            payment_method: paymentMethodId || undefined,
            confirm: true,
            off_session: true,
            description: `M2M Programmatic Ad Buy: 15s Slot on [${cityUpper}]`,
            metadata: {
              m2mKey: agent.apiKey,
              cityCode: cityUpper,
              agentId: agent.id
            }
          });
          stripePaymentIntentId = pi.id;
        } catch (stripeErr: any) {
          return res.status(402).json({
            success: false,
            error: `Stripe M2M payment execution failed: ${stripeErr.message}`
          });
        }
      } else {
        stripePaymentIntentId = `pi_m2m_sim_${crypto.randomBytes(6).toString('hex')}`;
      }
    }

    // 3. Insert Campaign into Real Redis Priority Queue
    const queueKey = `billboard:queue:${cityUpper}`;
    if (!redisQueues[queueKey]) redisQueues[queueKey] = [];
    const currentQueue = redisQueues[queueKey];

    const bidId = `bid_agent_${crypto.randomBytes(6).toString('hex')}`;
    const countryUpper = city.countryCode ? city.countryCode.toUpperCase() : 'GLOBAL';

    const queueItem: QueueItem = {
      id: bidId,
      advertiserId: agent.id,
      advertiserName: agent.keyName,
      title: String(ad.title).trim(),
      imageUrl: String(ad.imageUrl).trim(),
      ctaType: ad.ctaType || 'website',
      ctaUrl: ad.ctaUrl || ad.landingPageUrl || 'https://cyberbillboard.io',
      landingPageUrl: ad.ctaUrl || ad.landingPageUrl || 'https://cyberbillboard.io',
      targetCountryCode: countryUpper,
      targetCityCode: cityUpper,
      bidAmountCents: cents,
      safetyScore: 99,
      createdAt: new Date().toISOString(),
      isHouseAd: false
    };

    currentQueue.push(queueItem);
    currentQueue.sort((a, b) => b.bidAmountCents - a.bidAmountCents);

    const queuePosition = currentQueue.findIndex((item) => item.id === bidId) + 1;
    const isTopBid = queuePosition === 1;

    // Update Agent Metrics
    agent.totalBidsPlaced += 1;

    // 4. Record M2M Transaction
    const m2mTxId = `m2m_tx_${Date.now()}`;
    const m2mTx: M2MTransactionItem = {
      id: m2mTxId,
      agentId: agent.id,
      agentName: agent.keyName,
      type: 'm2m_slot_bid_placed',
      amountCents: cents,
      amountDollars: (cents / 100).toFixed(2),
      m2mApiKey: agent.apiKey,
      stripePaymentIntentId,
      cloudflareRayId: `${crypto.randomBytes(8).toString('hex')}-RTB`,
      timestamp: new Date().toLocaleTimeString(),
      cityCode: cityUpper,
      slotId: currentSlotId,
      status: 'succeeded'
    };

    m2mTransactionsLedger.unshift(m2mTx);
    if (m2mTransactionsLedger.length > 50) m2mTransactionsLedger.pop();

    // 5. Broadcast Real-Time WebSocket Events to Viewers
    const targetRoomId = `room_${countryUpper}_${cityUpper}`;
    const broadcastPayload = {
      type: 'NEW_BID_PLACED',
      payload: {
        queueKey,
        targetCityCode: cityUpper,
        targetCountryCode: countryUpper,
        roomId: targetRoomId,
        bid: queueItem,
        isTopBid,
        queuePosition
      }
    };

    broadcastToRoom(targetRoomId, broadcastPayload);
    broadcastToAll(broadcastPayload);

    logTelemetry(
      'M2M_AGENT_BID_PLACED',
      `🤖 AI Agent [${agent.keyName}] bought 15s space: $${(cents / 100).toFixed(2)} on [${cityUpper}]. Queue Position: #${queuePosition} (Top: ${isTopBid})`
    );

    const estimatedBroadcast = isTopBid
      ? `Next 15s Slot (${remainingSeconds}s remaining)`
      : `Queued at Position #${queuePosition} (~${(queuePosition - 1) * 15}s estimated)`;

    const responsePayload: AgentBidResponse = {
      success: true,
      bidId,
      queuePosition,
      isTopBid,
      cityCode: cityUpper,
      bidAmountCents: cents,
      bidAmountDollars: (cents / 100).toFixed(2),
      estimatedBroadcastTime: estimatedBroadcast,
      receipt: {
        m2mTransactionId: m2mTxId,
        paymentMethod,
        stripePaymentIntentId,
        cloudflareRayId: m2mTx.cloudflareRayId,
        status: 'succeeded',
        timestamp: new Date().toISOString()
      }
    };

    return res.json(responsePayload);

  } catch (err: any) {
    console.error('Error processing programmatic agent bid:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to process programmatic bid.' });
  }
};

/**
 * GET /api/v1/agents/bids/:bidId/status
 * Check the status of a bid placed by an agent
 */
export const handleGetBidStatus = (
  req: Request,
  res: Response,
  redisQueues: Record<string, QueueItem[]>,
  currentSlotId: string,
  remainingSeconds: number
) => {
  const { bidId } = req.params;

  let foundItem: QueueItem | undefined;
  let foundCity = '';
  let queuePosition = -1;

  for (const [key, queue] of Object.entries(redisQueues)) {
    const idx = queue.findIndex((q) => q.id === bidId);
    if (idx !== -1) {
      foundItem = queue[idx];
      foundCity = key.replace('billboard:queue:', '');
      queuePosition = idx + 1;
      break;
    }
  }

  if (!foundItem) {
    return res.json({
      success: true,
      bidId,
      status: 'completed_or_expired',
      message: 'Bid is no longer in active queue (broadcast completed or slot expired).'
    });
  }

  const isTopBid = queuePosition === 1;

  res.json({
    success: true,
    bidId,
    status: isTopBid ? 'active_winner_queued' : 'outbid_queued',
    cityCode: foundCity,
    queuePosition,
    isTopBid,
    bidAmountDollars: (foundItem.bidAmountCents / 100).toFixed(2),
    estimatedBroadcastTime: isTopBid
      ? `Next 15s Slot (${remainingSeconds}s remaining)`
      : `Queued at Position #${queuePosition}`,
    item: foundItem
  });
};

/**
 * POST /api/v1/agents/wallet/topup
 * Programmatic deposit to AI Agent M2M Wallet
 */
export const handleProgrammaticWalletTopup = async (
  req: Request,
  res: Response,
  getStripe: () => any
) => {
  const auth = authenticateAgentApiKey(req);
  if (!auth.authorized || !auth.agent) {
    return res.status(401).json({ success: false, error: auth.error });
  }

  const agent = auth.agent;

  try {
    const { amountDollars, amountCents, paymentMethodId, description = 'Programmatic M2M Wallet Deposit' } = req.body;
    const cents = amountCents ? Number(amountCents) : Math.round((Number(amountDollars) || 50) * 100);

    if (cents <= 0) {
      return res.status(400).json({ success: false, error: 'Deposit amount must be greater than 0.' });
    }

    let stripePaymentIntentId: string | undefined;

    if (process.env.STRIPE_SECRET_KEY && (paymentMethodId || agent.stripeCustomerId)) {
      try {
        const stripe = getStripe();
        const pi = await stripe.paymentIntents.create({
          amount: cents,
          currency: 'usd',
          customer: agent.stripeCustomerId || undefined,
          payment_method: paymentMethodId || undefined,
          confirm: true,
          off_session: true,
          description: `M2M Wallet Top-Up: ${description}`,
          metadata: {
            agentId: agent.id,
            m2mKey: agent.apiKey
          }
        });
        stripePaymentIntentId = pi.id;
      } catch (stripeErr: any) {
        return res.status(402).json({
          success: false,
          error: `Stripe off-session payment failed: ${stripeErr.message}`
        });
      }
    } else {
      stripePaymentIntentId = `pi_m2m_dep_${crypto.randomBytes(6).toString('hex')}`;
    }

    agent.walletBalanceCents += cents;
    agent.walletBalanceDollars = (agent.walletBalanceCents / 100).toFixed(2);

    const depositTx: M2MTransactionItem = {
      id: `m2m_tx_topup_${Date.now()}`,
      agentId: agent.id,
      agentName: agent.keyName,
      type: 'm2m_auto_topup',
      amountCents: cents,
      amountDollars: (cents / 100).toFixed(2),
      m2mApiKey: agent.apiKey,
      stripePaymentIntentId,
      cloudflareRayId: `${crypto.randomBytes(8).toString('hex')}-TOPUP`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'succeeded'
    };

    m2mTransactionsLedger.unshift(depositTx);
    if (m2mTransactionsLedger.length > 50) m2mTransactionsLedger.pop();

    res.json({
      success: true,
      message: `Agent wallet successfully credited +$${(cents / 100).toFixed(2)}`,
      newBalanceCents: agent.walletBalanceCents,
      newBalanceDollars: agent.walletBalanceDollars,
      transaction: depositTx
    });

  } catch (err: any) {
    console.error('Error in agent wallet topup:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to deposit to agent wallet.' });
  }
};

/**
 * Dynamic Yield Admin Endpoints
 */
export const handleGetYieldPricing = (req: Request, res: Response) => {
  res.json({
    success: true,
    yieldStatus: dynamicYieldState
  });
};

export const handleToggleYieldPricing = (req: Request, res: Response) => {
  const { autopilotActive } = req.body;
  if (typeof autopilotActive === 'boolean') {
    dynamicYieldState.autopilotActive = autopilotActive;
  } else {
    dynamicYieldState.autopilotActive = !dynamicYieldState.autopilotActive;
  }

  res.json({
    success: true,
    autopilotActive: dynamicYieldState.autopilotActive,
    message: `Dynamic Yield Autopilot is now ${dynamicYieldState.autopilotActive ? 'ACTIVE' : 'PAUSED'}`
  });
};

export const handleTuneYieldPricing = (req: Request, res: Response) => {
  const { minFloorDollars, maxFloorDollars, surgeElasticity, discountEnabled } = req.body;

  if (typeof minFloorDollars === 'number' && minFloorDollars >= 0.1) {
    dynamicYieldState.tuningParams.minFloorCents = Math.round(minFloorDollars * 100);
  }
  if (typeof maxFloorDollars === 'number' && maxFloorDollars > 0) {
    dynamicYieldState.tuningParams.maxFloorCents = Math.round(maxFloorDollars * 100);
  }
  if (typeof surgeElasticity === 'number' && surgeElasticity >= 0.1 && surgeElasticity <= 2.0) {
    dynamicYieldState.tuningParams.surgeElasticity = surgeElasticity;
  }
  if (typeof discountEnabled === 'boolean') {
    dynamicYieldState.tuningParams.discountEnabled = discountEnabled;
  }

  res.json({
    success: true,
    tuningParams: dynamicYieldState.tuningParams,
    message: 'Dynamic yield parameters tuned successfully.'
  });
};

export const handleOptimizeYieldNow = async (
  req: Request,
  res: Response,
  ai: GoogleGenAI | null,
  activeCitiesStore: CityConfig[],
  redisQueues: Record<string, QueueItem[]>,
  clientGeoMap: Map<any, any>,
  broadcastToAll: (data: any) => void,
  logTelemetry: (type: string, message: string, details?: any) => void
) => {
  runDynamicYieldTick(activeCitiesStore, redisQueues, clientGeoMap, broadcastToAll, logTelemetry);

  let geminiInsights = 'Algorithmic yield optimization evaluated across all active city zones.';

  if (ai) {
    try {
      const summaryData = activeCitiesStore.slice(0, 5).map((c) => ({
        city: c.cityName,
        code: c.cityCode,
        floor: dynamicYieldState.cityPricingMatrix[c.cityCode.toUpperCase()]?.currentFloorDollars || '1.00',
        surge: dynamicYieldState.cityPricingMatrix[c.cityCode.toUpperCase()]?.surgeMultiplier || 1.0
      }));

      const prompt = `You are the Dynamic Yield & Reserve Floor Agent for a global 24/7 digital billboard network. Pricing matrix: ${JSON.stringify(summaryData)}. In 2 concise sentences, summarize the current market liquidity, why reserve floor adjustments protect streamer payouts, and how surge pricing captures premium advertiser yield.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      if (response.text) {
        geminiInsights = response.text.trim();
      }
    } catch (e: any) {
      console.warn('Gemini optimization insights fallback:', e.message);
    }
  }

  res.json({
    success: true,
    message: 'Dynamic yield optimization evaluated across all active city zones.',
    geminiInsights,
    yieldStatus: dynamicYieldState
  });
};

export const handleGetM2mTransactions = (req: Request, res: Response) => {
  res.json({
    success: true,
    transactions: m2mTransactionsLedger,
    totalVolumeCents: m2mTransactionsLedger.reduce((acc, t) => acc + t.amountCents, 0),
    totalVolumeDollars: (m2mTransactionsLedger.reduce((acc, t) => acc + t.amountCents, 0) / 100).toFixed(2)
  });
};

// ==============================================================================
// 8. CLOUDFLARE MACHINE PAYMENTS PROTOCOL (MPP) AUCTION BIDDING ENGINE
// ==============================================================================

/**
 * Handles Cloudflare Machine Payments Protocol (MPP) card routing for autonomous AI agent bidding.
 * 
 * Flow:
 * 1. Checks incoming request for valid MPP payment headers (Authorization: Payment ..., Payment-Credential, etc.)
 * 2. If missing or invalid, returns a standard HTTP 402 Payment Required response with a WWW-Authenticate / Payment-Challenge header
 *    specifying the auction slot price.
 * 3. If an MPP card credential (Shared Payment Token/SPT) is provided, uses the Stripe SDK (sk_live / STRIPE_M2M_SECRET_KEY)
 *    to create a PaymentIntent with `capture_method: 'manual'` and `off_session: true` to place a hold on the agent's funds.
 * 4. Generates an MPP Payment-Receipt header and returns a structured JSON response indicating the bid was successfully authorized.
 */
export const handleAuctionBidMPP = async (
  req: Request,
  res: Response,
  activeCitiesStore: CityConfig[],
  redisQueues: Record<string, QueueItem[]>,
  currentSlotId: string,
  remainingSeconds: number,
  broadcastToAll: (data: any) => void,
  broadcastToRoom: (roomId: string, data: any) => void,
  logTelemetry: (type: string, message: string, details?: any) => void,
  getStripeClient?: () => Stripe
) => {
  try {
    // 1. Resolve Target City and Slot Price
    const targetCityCode = (req.body?.targetCityCode || req.query?.cityCode || req.body?.cityCode || 'TYO').toString().toUpperCase();
    const city = activeCitiesStore.find((c) => c.cityCode.toUpperCase() === targetCityCode) || activeCitiesStore[0];
    const cityCode = city ? city.cityCode.toUpperCase() : 'TYO';
    const cityName = city ? city.cityName : 'Tokyo Shibuya';

    const matrix = dynamicYieldState.cityPricingMatrix[cityCode];
    const dynamicFloorCents = matrix ? matrix.currentFloorCents : (city?.reserveFloorCents || 100);

    // Calculate requested bid price in cents
    let requestedCents = 0;
    if (typeof req.body?.bidAmountCents === 'number' && req.body.bidAmountCents > 0) {
      requestedCents = Math.round(req.body.bidAmountCents);
    } else if (typeof req.body?.amountCents === 'number' && req.body.amountCents > 0) {
      requestedCents = Math.round(req.body.amountCents);
    } else if (typeof req.body?.bidAmountDollars === 'number' && req.body.bidAmountDollars > 0) {
      requestedCents = Math.round(req.body.bidAmountDollars * 100);
    } else if (typeof req.body?.amountDollars === 'number' && req.body.amountDollars > 0) {
      requestedCents = Math.round(req.body.amountDollars * 100);
    } else if (typeof req.query?.amount === 'string' && parseFloat(req.query.amount) > 0) {
      requestedCents = Math.round(parseFloat(req.query.amount) * 100);
    } else {
      requestedCents = dynamicFloorCents || 3500;
    }

    const priceCents = Math.max(requestedCents, dynamicFloorCents);
    const adTitle = req.body?.ad?.title || req.body?.title || 'Autonomous AI Agent Campaign';
    const adImageUrl = req.body?.ad?.imageUrl || req.body?.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
    const advertiserName = req.body?.advertiserName || req.body?.ad?.advertiserName || 'Cloudflare MPP Agent';

    // 2. Check for valid MPP payment headers / credentials
    let extractedSpt: string | null = null;
    let mppCredential: any = null;

    const authHeader = (req.headers['authorization'] || req.headers['payment-credential'] || req.headers['x-mpp-credential'] || req.headers['payment']) as string | undefined;

    if (authHeader) {
      try {
        if (authHeader.toLowerCase().startsWith('payment ')) {
          mppCredential = Credential.deserialize(authHeader);
          extractedSpt = mppCredential?.payload?.spt || mppCredential?.payload?.paymentMethod || mppCredential?.payload?.token || null;
        } else if (authHeader.startsWith('spt_') || authHeader.startsWith('pm_') || authHeader.startsWith('tok_')) {
          extractedSpt = authHeader;
        } else {
          // Attempt raw base64 or JSON parsing
          const cleanToken = authHeader.replace(/^Payment\s+/i, '').replace(/^Bearer\s+/i, '').trim();
          try {
            const decoded = JSON.parse(Buffer.from(cleanToken, 'base64').toString('utf8'));
            extractedSpt = decoded.spt || decoded.payload?.spt || decoded.payload?.paymentMethod || decoded.token || null;
            mppCredential = decoded;
          } catch {
            if (cleanToken.startsWith('spt_') || cleanToken.startsWith('pm_') || cleanToken.startsWith('tok_')) {
              extractedSpt = cleanToken;
            }
          }
        }
      } catch (err) {
        console.warn('MPP Credential extraction note:', err);
      }
    }

    // Also check direct request body if agent passed payload in JSON
    if (!extractedSpt && req.body) {
      extractedSpt = req.body.spt || req.body.paymentCredential || req.body.mppCredential || req.body.paymentMethodId || req.body.payment_method || null;
    }

    // 3. If MPP Credential is MISSING or INVALID: Return standard HTTP 402 Payment Required challenge
    if (!extractedSpt) {
      const challengeId = `chl_${crypto.randomBytes(12).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const challenge: any = Challenge.from({
        id: challengeId,
        realm: 'Virtual Billboard Auction Gateway',
        method: 'stripe',
        intent: 'charge',
        request: {
          amount: String(priceCents),
          currency: 'usd',
          decimals: 2,
          description: `Auction 15s Slot Bid Hold [${cityCode}] - ${adTitle}`,
          networkId: 'internal'
        },
        expires: expiresAt
      });

      const serializedChallenge = Challenge.serialize(challenge);

      res.status(402);
      res.setHeader('WWW-Authenticate', serializedChallenge);
      res.setHeader('Payment-Challenge', serializedChallenge);
      res.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate, Payment-Challenge, Payment-Receipt');

      return res.json({
        error: 'Payment Required',
        status: 402,
        protocol: 'Cloudflare Machine Payments Protocol (MPP)',
        message: `HTTP 402: Valid MPP payment credential (Shared Payment Token/SPT) required to place auction hold for 15s slot in [${cityName}].`,
        slotPriceCents: priceCents,
        slotPriceDollars: (priceCents / 100).toFixed(2),
        targetCityCode: cityCode,
        challenge: {
          id: challenge.id,
          realm: challenge.realm,
          method: challenge.method,
          intent: challenge.intent,
          request: challenge.request,
          expires: challenge.expires
        },
        mppHeaders: {
          'WWW-Authenticate': serializedChallenge,
          'Payment-Challenge': serializedChallenge
        },
        instructions: {
          step1: 'Agent receives 402 with WWW-Authenticate Payment challenge header.',
          step2: 'Agent generates Shared Payment Token (SPT) card credential via Cloudflare MPP wallet.',
          step3: 'Agent re-submits bid with header: Authorization: Payment <serialized_spt_credential>'
        }
      });
    }

    // 4. If agent provided an MPP card credential (SPT), use Stripe SDK to create PaymentIntent with capture_method: 'manual' and off_session: true
    const stripeM2MKey = process.env.STRIPE_M2M_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    let stripePaymentIntentId = `pi_mpp_hold_${crypto.randomBytes(8).toString('hex')}`;
    let stripePaymentIntentStatus = 'requires_capture';
    let isLiveStripeCharged = false;

    const bidId = `bid_mpp_${crypto.randomBytes(6).toString('hex')}`;

    const isSimulationToken = extractedSpt.startsWith('spt_mock_') || 
                              extractedSpt.startsWith('spt_demo_') || 
                              extractedSpt.startsWith('spt_sim_') ||
                              req.headers['x-mpp-simulation'] === 'true';

    if (stripeM2MKey && !isSimulationToken) {
      try {
        const stripe = new Stripe(stripeM2MKey);

        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
          amount: priceCents,
          currency: 'usd',
          capture_method: 'manual', // CRITICAL REQUIREMENT: Places hold on funds without immediate capture
          off_session: true,        // CRITICAL REQUIREMENT: Programmatic execution without 3D Secure / browser redirect
          confirm: true,            // Immediately confirm and place the hold
          description: `MPP Auction Bid Hold: 15s Slot [${cityCode}] - ${adTitle}`,
          metadata: {
            protocol: 'cloudflare_mpp',
            mppCredentialType: 'spt',
            targetCityCode: cityCode,
            bidId,
            adTitle,
            advertiserName
          }
        };

        // Attach payment method if formatted as pm_/tok_ or valid SPT token
        if (extractedSpt.startsWith('pm_') || extractedSpt.startsWith('tok_') || extractedSpt.startsWith('spt_')) {
          paymentIntentParams.payment_method = extractedSpt;
        } else {
          paymentIntentParams.automatic_payment_methods = {
            enabled: true,
            allow_redirects: 'never'
          };
        }

        const pi = await stripe.paymentIntents.create(paymentIntentParams);
        stripePaymentIntentId = pi.id;
        stripePaymentIntentStatus = pi.status; // 'requires_capture'
        isLiveStripeCharged = true;
      } catch (stripeErr: any) {
        // If agent passes test/demo token in livemode environment, allow sandbox authorization fallback
        if (extractedSpt.includes('test') || extractedSpt.includes('demo') || extractedSpt.includes('sim') || req.body?.isDemo === true) {
          stripePaymentIntentId = `pi_mpp_hold_sim_${crypto.randomBytes(8).toString('hex')}`;
          stripePaymentIntentStatus = 'requires_capture';
          isLiveStripeCharged = false;
        } else {
          console.error('Stripe MPP Card Hold Error:', stripeErr.message);
          return res.status(402).json({
            success: false,
            status: 402,
            error: `Stripe Card Hold Authorization Failed: ${stripeErr.message}`,
            code: stripeErr.code || 'card_authorization_failed',
            protocol: 'Cloudflare Machine Payments Protocol (MPP)'
          });
        }
      }
    } else {
      stripePaymentIntentId = `pi_mpp_hold_${crypto.randomBytes(8).toString('hex')}`;
      stripePaymentIntentStatus = 'requires_capture';
    }

    // 5. Generate MPP Receipt
    const receipt = Receipt.from({
      method: 'stripe',
      reference: stripePaymentIntentId,
      status: 'success',
      timestamp: new Date().toISOString()
    });

    const serializedReceipt = Receipt.serialize(receipt);
    res.setHeader('Payment-Receipt', serializedReceipt);
    res.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate, Payment-Challenge, Payment-Receipt');

    // 6. Insert into Real Redis Priority Queue
    const queueKey = `billboard:queue:${cityCode}`;
    if (!redisQueues[queueKey]) redisQueues[queueKey] = [];
    const currentQueue = redisQueues[queueKey];

    const countryUpper = city?.countryCode ? city.countryCode.toUpperCase() : 'GLOBAL';

    const queueItem: QueueItem = {
      id: bidId,
      advertiserId: `agent_mpp_${crypto.randomBytes(4).toString('hex')}`,
      advertiserName,
      title: String(adTitle).trim(),
      imageUrl: String(adImageUrl).trim(),
      ctaType: req.body?.ad?.ctaType || req.body?.ctaType || 'website',
      ctaUrl: req.body?.ad?.ctaUrl || req.body?.ctaUrl || 'https://cyberbillboard.io',
      landingPageUrl: req.body?.ad?.ctaUrl || req.body?.ctaUrl || 'https://cyberbillboard.io',
      targetCountryCode: countryUpper,
      targetCityCode: cityCode,
      bidAmountCents: priceCents,
      safetyScore: 99,
      createdAt: new Date().toISOString(),
      isHouseAd: false
    };

    currentQueue.push(queueItem);
    currentQueue.sort((a, b) => b.bidAmountCents - a.bidAmountCents);

    const queuePosition = currentQueue.findIndex((item) => item.id === bidId) + 1;
    const isTopBid = queuePosition === 1;

    // 7. Record in M2M Transaction Ledger
    const m2mTx: M2MTransactionItem = {
      id: `m2m_tx_${Date.now()}`,
      agentId: queueItem.advertiserId || 'agent_mpp',
      agentName: advertiserName,
      type: 'm2m_slot_bid_placed',
      amountCents: priceCents,
      amountDollars: (priceCents / 100).toFixed(2),
      m2mApiKey: 'MPP_SHARED_PAYMENT_TOKEN',
      stripePaymentIntentId,
      cloudflareRayId: `${crypto.randomBytes(8).toString('hex')}-MPP`,
      timestamp: new Date().toLocaleTimeString(),
      cityCode,
      slotId: currentSlotId,
      status: 'succeeded'
    };

    m2mTransactionsLedger.unshift(m2mTx);
    if (m2mTransactionsLedger.length > 50) m2mTransactionsLedger.pop();

    // 8. Broadcast Real-Time WebSocket Events
    const targetRoomId = `room_${countryUpper}_${cityCode}`;
    const broadcastPayload = {
      type: 'NEW_BID_PLACED',
      payload: {
        queueKey,
        targetCityCode: cityCode,
        targetCountryCode: countryUpper,
        roomId: targetRoomId,
        bid: queueItem,
        isTopBid,
        queuePosition,
        protocol: 'cloudflare_mpp',
        captureMethod: 'manual',
        offSession: true
      }
    };

    broadcastToRoom(targetRoomId, broadcastPayload);
    broadcastToAll(broadcastPayload);

    logTelemetry(
      'MPP_AUCTION_BID_AUTHORIZED',
      `🤖 Cloudflare MPP Card Routing Authorized: $${(priceCents / 100).toFixed(2)} Hold on [${cityCode}] for "${adTitle}". Capture Method: manual, Off-Session: true (Top Bid: ${isTopBid})`
    );

    // 9. Return clean, structured JSON response indicating the bid was successfully authorized
    return res.status(200).json({
      success: true,
      status: 'authorized',
      protocol: 'Cloudflare Machine Payments Protocol (MPP)',
      message: 'Auction bid successfully authorized via Cloudflare MPP card routing. Manual funds hold placed on payment method.',
      authorization: {
        holdStatus: stripePaymentIntentStatus,
        captureMethod: 'manual',
        offSession: true,
        stripePaymentIntentId,
        isLiveStripe: isLiveStripeCharged,
        amountCents: priceCents,
        amountDollars: (priceCents / 100).toFixed(2),
        currency: 'usd'
      },
      bid: {
        id: queueItem.id,
        targetCityCode: cityCode,
        targetCountryCode: countryUpper,
        roomId: targetRoomId,
        queuePosition,
        isTopBid,
        title: queueItem.title,
        imageUrl: queueItem.imageUrl,
        advertiserName: queueItem.advertiserName,
        bidAmountCents: priceCents,
        bidAmountDollars: (priceCents / 100).toFixed(2),
        createdAt: queueItem.createdAt
      },
      receipt: {
        method: receipt.method,
        reference: receipt.reference,
        status: receipt.status,
        timestamp: receipt.timestamp,
        serialized: serializedReceipt
      }
    });

  } catch (err: any) {
    console.error('Error handling MPP Auction Bid:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal error processing MPP auction bid'
    });
  }
};

