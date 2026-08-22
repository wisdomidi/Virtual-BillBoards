import { AgentApiKey, DynamicYieldPricingStatus, M2MTransactionItem } from '../types.js';

export const INITIAL_AGENT_API_KEYS: AgentApiKey[] = [
  {
    id: 'key_prod_master_01',
    keyName: 'Primary Autonomous AI Trading Bot',
    apiKey: 'm2m_live_prod_99a8b7c6d5e4f3a2',
    ownerUserId: 'default_user',
    ownerUserEmail: 'dev-agent@autonomous-rtb.io',
    walletBalanceCents: 25000, // $250.00
    walletBalanceDollars: '250.00',
    status: 'active',
    allowedCities: ['*'],
    webhookUrl: 'https://api.autonomous-rtb.io/webhooks/billboard-play',
    stripeCustomerId: 'cus_m2m_rtb_agent_99182',
    autoFundThresholdCents: 5000,
    autoFundAmountCents: 20000,
    totalSpentCents: 3840,
    totalSlotsWon: 12,
    totalBidsPlaced: 18,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastUsedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'key_prod_growth_02',
    keyName: 'APAC Autonomous Media Buyer Agent',
    apiKey: 'm2m_live_apac_44b3c2d1e0f9a8b7',
    ownerUserId: 'default_user',
    ownerUserEmail: 'apac-buyer@media-agent.ai',
    walletBalanceCents: 15000, // $150.00
    walletBalanceDollars: '150.00',
    status: 'active',
    allowedCities: ['TYO', 'SIN', 'KUL', 'SEL', 'BKK'],
    webhookUrl: 'https://apac-buyer.media-agent.ai/events',
    stripeCustomerId: 'cus_m2m_apac_33819',
    autoFundThresholdCents: 3000,
    autoFundAmountCents: 10000,
    totalSpentCents: 1950,
    totalSlotsWon: 6,
    totalBidsPlaced: 9,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastUsedAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export const INITIAL_DYNAMIC_YIELD_STATUS: DynamicYieldPricingStatus = {
  autopilotActive: true,
  evaluationIntervalSeconds: 10,
  lastOptimizationTimestamp: new Date().toISOString(),
  globalSurgeMultiplier: 1.0,
  cityPricingMatrix: {
    TYO: {
      cityCode: 'TYO',
      cityName: 'Tokyo Shibuya Crossing',
      baseFloorCents: 100,
      currentFloorCents: 150,
      currentFloorDollars: '1.50',
      surgeMultiplier: 1.5,
      activeWatchers: 48,
      bidVelocity: 4.2,
      demandLevel: 'SURGE'
    },
    NYC: {
      cityCode: 'NYC',
      cityName: 'New York Times Square',
      baseFloorCents: 100,
      currentFloorCents: 180,
      currentFloorDollars: '1.80',
      surgeMultiplier: 1.8,
      activeWatchers: 62,
      bidVelocity: 5.8,
      demandLevel: 'SURGE'
    },
    LON: {
      cityCode: 'LON',
      cityName: 'London Piccadilly Lights',
      baseFloorCents: 100,
      currentFloorCents: 125,
      currentFloorDollars: '1.25',
      surgeMultiplier: 1.25,
      activeWatchers: 34,
      bidVelocity: 2.9,
      demandLevel: 'HIGH'
    },
    PAR: {
      cityCode: 'PAR',
      cityName: 'Paris Champs-Élysées',
      baseFloorCents: 100,
      currentFloorCents: 110,
      currentFloorDollars: '1.10',
      surgeMultiplier: 1.1,
      activeWatchers: 28,
      bidVelocity: 1.8,
      demandLevel: 'OPTIMAL'
    },
    SIN: {
      cityCode: 'SIN',
      cityName: 'Singapore Marina Bay',
      baseFloorCents: 100,
      currentFloorCents: 130,
      currentFloorDollars: '1.30',
      surgeMultiplier: 1.3,
      activeWatchers: 38,
      bidVelocity: 3.1,
      demandLevel: 'HIGH'
    },
    DXB: {
      cityCode: 'DXB',
      cityName: 'Dubai Downtown Boulevard',
      baseFloorCents: 100,
      currentFloorCents: 140,
      currentFloorDollars: '1.40',
      surgeMultiplier: 1.4,
      activeWatchers: 42,
      bidVelocity: 3.6,
      demandLevel: 'HIGH'
    },
    SEL: {
      cityCode: 'SEL',
      cityName: 'Seoul Gangnam K-Pop Live',
      baseFloorCents: 100,
      currentFloorCents: 135,
      currentFloorDollars: '1.35',
      surgeMultiplier: 1.35,
      activeWatchers: 39,
      bidVelocity: 3.4,
      demandLevel: 'HIGH'
    },
    KUL: {
      cityCode: 'KUL',
      cityName: 'Kuala Lumpur Pavilion',
      baseFloorCents: 100,
      currentFloorCents: 85,
      currentFloorDollars: '0.85',
      surgeMultiplier: 0.85,
      activeWatchers: 12,
      bidVelocity: 0.8,
      demandLevel: 'LOW'
    }
  },
  recentDecisionLogs: [
    {
      id: 'yd_init_1',
      cityCode: 'NYC',
      cityName: 'New York Times Square',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      previousFloorCents: 100,
      newFloorCents: 180,
      previousFloorDollars: '1.00',
      newFloorDollars: '1.80',
      multiplier: 1.8,
      reason: 'Surge multiplier engaged: Concurrency peak (62 live watchers) and bid velocity (5.8/min).',
      triggerType: 'high_velocity',
      viewerDensity: 62,
      bidVelocityPerMin: 5.8
    },
    {
      id: 'yd_init_2',
      cityCode: 'TYO',
      cityName: 'Tokyo Shibuya Crossing',
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
      previousFloorCents: 100,
      newFloorCents: 150,
      previousFloorDollars: '1.00',
      newFloorDollars: '1.50',
      multiplier: 1.5,
      reason: 'Elevated demand detected (48 watchers). Reserve floor adjusted to capture higher yield.',
      triggerType: 'viewer_surge',
      viewerDensity: 48,
      bidVelocityPerMin: 4.2
    },
    {
      id: 'yd_init_3',
      cityCode: 'KUL',
      cityName: 'Kuala Lumpur Pavilion',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      previousFloorCents: 100,
      newFloorCents: 85,
      previousFloorDollars: '1.00',
      newFloorDollars: '0.85',
      multiplier: 0.85,
      reason: 'Zero queued bids detected. Off-peak 15% discount applied ($0.85 floor) to stimulate slot fill rate.',
      triggerType: 'low_fill_discount',
      viewerDensity: 12,
      bidVelocityPerMin: 0.8
    }
  ],
  tuningParams: {
    minFloorCents: 50,
    maxFloorCents: 5000,
    surgeElasticity: 0.5,
    discountEnabled: true
  }
};

export const INITIAL_M2M_TRANSACTIONS: M2MTransactionItem[] = [
  {
    id: 'm2m_tx_101',
    agentId: 'key_prod_master_01',
    agentName: 'Primary Autonomous AI Trading Bot',
    type: 'm2m_slot_burn',
    amountCents: 240,
    amountDollars: '2.40',
    m2mApiKey: 'm2m_live_prod_99a8b7c6d5e4f3a2',
    stripePaymentIntentId: 'pi_3PjX82KlM90xZ1',
    cloudflareRayId: '8c91a0b3f81e7d02-NRT',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    cityCode: 'TYO',
    slotId: 'slot_tyo_88912',
    status: 'succeeded'
  },
  {
    id: 'm2m_tx_102',
    agentId: 'key_prod_master_01',
    agentName: 'Primary Autonomous AI Trading Bot',
    type: 'm2m_auto_topup',
    amountCents: 20000,
    amountDollars: '200.00',
    m2mApiKey: 'm2m_live_prod_99a8b7c6d5e4f3a2',
    stripePaymentIntentId: 'pi_3PjX71NqR81yA9',
    cloudflareRayId: '8c919fa2c10b4e88-IAD',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    status: 'succeeded'
  },
  {
    id: 'm2m_tx_103',
    agentId: 'key_prod_growth_02',
    agentName: 'APAC Autonomous Media Buyer Agent',
    type: 'm2m_slot_burn',
    amountCents: 175,
    amountDollars: '1.75',
    m2mApiKey: 'm2m_live_apac_44b3c2d1e0f9a8b7',
    stripePaymentIntentId: 'pi_3PjX50ZxB44uC2',
    cloudflareRayId: '8c918ee91c3d2a11-SIN',
    timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
    cityCode: 'SIN',
    slotId: 'slot_sin_77201',
    status: 'succeeded'
  }
];
