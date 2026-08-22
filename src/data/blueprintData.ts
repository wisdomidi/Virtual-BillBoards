export const ARCHITECTURE_ASCII = `
+-------------------------------------------------------------------------------------------------------+
|                                REAL-TIME GEOFENCED VIRTUAL BILLBOARD SYSTEM                           |
+-------------------------------------------------------------------------------------------------------+

   [Advertiser Console]                   [Viewer Client Browser]
          |                                        ^
          | (1) POST /api/bids/submit              | (6) WebSocket / SSE Push (Slot Update)
          v                                        |
+-------------------+                      +-------------------------+
|    API Gateway    |                      |  WebSocket Server Cluster|
| (Auth & Balance)  |                      |    (Socket.io / ws)     |
+-------------------+                      +-------------------------+
          |                                        ^
          | (2) Async Image Safety Review          |
          v                                        | (5) PUBLISH billboard:events:{region}
+-------------------+                      +-------------------------+
| Gemini Vision AI  |                      |   Redis Sub-ms Cache    |
| Content Moderator |                      |  (Cluster + Pub/Sub)    |
+-------------------+                      +-------------------------+
          |                                        ^
          | (3) Safety Score >= 80%                |
          v                                        | (4) ZADD billboard:queue:{region} {bid}
+--------------------------------------------------+
|               RTB Auction Engine                 |
|   - 15-Second Slot Scheduler                     |
|   - Geofenced Fallback Cascade Evaluator          |
+--------------------------------------------------+
          |
          | (Sync / Write-behind WAL)
          v
+--------------------------------------------------+
|            PostgreSQL Database (Relational)      |
|  (Users, Campaigns, Ledger, Audit Trails)       |
+--------------------------------------------------+
`;

export const MERMAID_DIAGRAM = `
graph TD
    subgraph Client Layer
        Adv[Advertiser Console]
        Viewer[Localized Viewer Browsers]
    end

    subgraph Edge & API Gateway
        GW[API Gateway / Load Balancer]
        Auth[Auth & Token Verification]
        Wallet[Wallet Balance Reservation]
    end

    subgraph AI Moderation Pipeline
        Gemini[Gemini Vision AI Safety Scanner]
    end

    subgraph Real-Time State & In-Memory Cache
        ZSetCity[Redis ZSET: billboard:queue:KUL]
        ZSetCountry[Redis ZSET: billboard:queue:MY]
        ZSetGlobal[Redis ZSET: billboard:queue:GLOBAL]
        HSetMeta[Redis HSET: billboard:ad:meta]
        PubSub[Redis Pub/Sub: billboard:events]
    end

    subgraph Auction Core Engine
        Engine[15s Auction Scheduler Engine]
        Cascade[Geofenced Fallback Cascade Module]
    end

    subgraph WebSocket Gateway
        WS[WebSocket Push Server Cluster]
    end

    subgraph Storage & Ledger
        PG[(PostgreSQL Database)]
        Ledger[Payout & Fraud Ledger Engine]
    end

    Adv -->|1. Submit Bid & Image| GW
    GW --> Auth
    Auth --> Wallet
    Wallet -->|2. Image Scan Request| Gemini
    Gemini -->|3. Score Approved >= 80%| Engine
    Engine -->|4. Push to ZSET Queue| ZSetCity
    Engine -->|5. Evaluate Highest Bid| Cascade
    Cascade -->|Fallback Query| ZSetCountry
    Cascade -->|Fallback Query| ZSetGlobal
    Cascade -->|6. Winner Elected| PubSub
    PubSub --> WS
    WS -->|7. 15s Slot Render Event| Viewer
    Viewer -->|8. Proof-of-Attention Heartbeat| Ledger
    Ledger -->|Async Batch Commit| PG
    Engine -->|Persist Settlement| PG
`;

export const POSTGRES_DDL_SQL = `-- ==============================================================================
-- REAL-TIME GEOFENCED VIRTUAL BILLBOARD PLATFORM - POSTGRESQL DDL SCHEMA
-- Target DB: PostgreSQL 15+
-- Features: Row-Level Security, Constraints, Indexing, Triggers
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS & ADVERTISERS TABLE
-- Stores credentials, role types, advertiser balances, and viewer point balances.
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'advertiser' CHECK (role IN ('advertiser', 'viewer', 'admin')),
    balance_cents BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    watch_points BIGINT NOT NULL DEFAULT 0 CHECK (watch_points >= 0),
    auth_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_token ON users(auth_token);

-- ------------------------------------------------------------------------------
-- 2. AD CAMPAIGNS TABLE
-- Stores visual creatives, targeting geofences (Country/City), and AI review scores.
-- ------------------------------------------------------------------------------
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    image_url TEXT NOT NULL,
    target_country_code VARCHAR(5) NOT NULL DEFAULT 'ALL', -- e.g., 'MY', 'JP', 'US', 'ALL'
    target_city_code VARCHAR(10) NOT NULL DEFAULT 'ALL',   -- e.g., 'KUL', 'TYO', 'NYC', 'ALL'
    bid_amount_cents BIGINT NOT NULL CHECK (bid_amount_cents > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending_review' 
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'active', 'completed')),
    safety_score INT DEFAULT 0 CHECK (safety_score BETWEEN 0 AND 100),
    safety_rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_geo_active ON ad_campaigns(target_country_code, target_city_code, status) 
    WHERE status = 'approved';
CREATE INDEX idx_campaigns_advertiser ON ad_campaigns(advertiser_id);

-- ------------------------------------------------------------------------------
-- 3. REALTIME BIDS TABLE
-- Tracks individual 15-second slot bids, execution timestamps, and won slots.
-- ------------------------------------------------------------------------------
CREATE TABLE realtime_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id VARCHAR(64) NOT NULL, -- Format: YYYYMMDD-HHMMSS-{REGION}
    region_key VARCHAR(20) NOT NULL, -- e.g., 'KUL', 'MY', 'GLOBAL'
    bid_amount_cents BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'won', 'outbid', 'expired')),
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bids_slot_region ON realtime_bids(slot_id, region_key, bid_amount_cents DESC);
CREATE INDEX idx_bids_created_at ON realtime_bids(created_at);

-- ------------------------------------------------------------------------------
-- 4. PAYOUT LEDGER TABLE (Proof-of-Attention & Fraud Prevention)
-- Records viewer watch-time heartbeats, fraud verification results, and points earned.
-- ------------------------------------------------------------------------------
CREATE TABLE payout_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id VARCHAR(64) NOT NULL,
    watch_seconds INT NOT NULL CHECK (watch_seconds > 0 AND watch_seconds <= 15),
    points_earned INT NOT NULL CHECK (points_earned >= 0),
    heartbeat_hash VARCHAR(64) NOT NULL,
    tab_visible BOOLEAN NOT NULL DEFAULT TRUE,
    ip_velocity_score NUMERIC(5,2) DEFAULT 1.00, -- Rate limit multiplier
    fraud_status VARCHAR(30) NOT NULL DEFAULT 'verified'
        CHECK (fraud_status IN ('verified', 'flagged_hidden_tab', 'flagged_velocity', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_viewer ON payout_ledger(viewer_id, created_at);
CREATE INDEX idx_ledger_fraud ON payout_ledger(fraud_status);

-- ------------------------------------------------------------------------------
-- 5. AUDIT & ANALYTICS HELPER VIEWS
-- ------------------------------------------------------------------------------
CREATE VIEW v_active_city_ecpm AS
SELECT 
    target_city_code,
    target_country_code,
    COUNT(id) AS total_active_campaigns,
    AVG(bid_amount_cents) AS avg_bid_cents,
    MAX(bid_amount_cents) AS top_bid_cents
FROM ad_campaigns
WHERE status = 'approved'
GROUP BY target_city_code, target_country_code;

-- Function: Automatically deduct balance when bid wins slot
CREATE OR REPLACE FUNCTION process_winning_bid_settlement(
    p_advertiser_id UUID,
    p_bid_amount_cents BIGINT
) RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET balance_cents = balance_cents - p_bid_amount_cents,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_advertiser_id AND balance_cents >= p_bid_amount_cents;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient balance for advertiser ID %', p_advertiser_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
`;

export const REDIS_DESIGN_MARKDOWN = `
### Redis Key Schema Architecture

To achieve **sub-millisecond (<0.5ms) RTB retrieval**, all 15-second active queues are mirrored in Redis in memory.

#### 1. Bidding Queue (Sorted Set - \`ZSET\`)
- **Key Pattern**: \`billboard:queue:{REGION_CODE}\`
  - Examples: \`billboard:queue:KUL\`, \`billboard:queue:MY\`, \`billboard:queue:GLOBAL\`
- **Score**: Bid Amount in Cents (\`bid_amount_cents\`).
- **Member**: \`campaign_id\`
- **Complexity**: $O(\\log N)$ insertion, $O(1)$ top-bid extraction via \`ZREVRANGE billboard:queue:KUL 0 0 WITHSCORES\`.

#### 2. Campaign Metadata Cache (Hash - \`HSET\`)
- **Key Pattern**: \`billboard:ad:{CAMPAIGN_ID}\`
- **Fields**:
  - \`title\`: Campaign title text
  - \`image_url\`: Asset CDN URL
  - \`advertiser_name\`: Display name
  - \`bid_cents\`: Integer cents
  - \`safety_verified\`: \`"1"\`
- **Complexity**: $O(1)$ lookup via \`HGETALL billboard:ad:{CAMPAIGN_ID}\`.

#### 3. Active Slot Lock & State (String Key - \`SET EX\`)
- **Key Pattern**: \`billboard:active:{REGION_CODE}\`
- **Value**: JSON payload of current 15s winning ad.
- **TTL**: 15 Seconds (\`EX 15\`).
- **Command**: \`SET billboard:active:KUL "{...}" EX 15 NX\`

#### 4. Real-time Event Pub/Sub Channel
- **Channel**: \`billboard:events:{REGION_CODE}\`
- **Payload**: \`{"event": "SLOT_CHANGE", "slot_id": "...", "ad": {...}}\`
- **Subscribers**: WebSocket Server Nodes for instant client push.

#### 5. Viewer Heartbeat Deduplication (Bloom / BitSet)
- **Key Pattern**: \`billboard:heartbeat:{SLOT_ID}:{VIEWER_ID}\`
- **TTL**: 30 Seconds.
- **Command**: \`SET billboard:heartbeat:20260821-120000:usr_123 "1" EX 30 NX\` -> If return null, duplicate heartbeat rejected!
`;

export const CASCADE_EXPLANATION = `
### The 3-Tier Geofenced Auction Fallback Cascade

When a client browser renders the virtual billboard from a specific location (e.g., viewer in **Kuala Lumpur, Malaysia**), the system must query active bids to display the highest-value ad for the next 15-second window.

#### Step-by-Step Cascade Logic:

1. **Tier 1: Local City Queue (\`billboard:queue:KUL\`)**
   - Execute: \`ZREVRANGE billboard:queue:KUL 0 0 WITHSCORES\`
   - **Condition**: If queue has at least 1 ad AND score >= City Reserve Price ($1.00):
     - **HIT**: Elect winner! Pop/read ad metadata from \`billboard:ad:{id}\`.
   - **MISS**: (0 bids in KUL) -> Transition to Tier 2 in **<0.1ms**.

2. **Tier 2: Country Fallback Queue (\`billboard:queue:MY\`)**
   - Execute: \`ZREVRANGE billboard:queue:MY 0 0 WITHSCORES\`
   - **Condition**: If queue has at least 1 ad AND score >= Country Reserve Price ($0.50):
     - **HIT**: Elect winner! Set fallback flag = \`country\`.
   - **MISS**: (0 bids in MY) -> Transition to Tier 3 in **<0.1ms**.

3. **Tier 3: Global Fallback Queue (\`billboard:queue:GLOBAL\`)**
   - Execute: \`ZREVRANGE billboard:queue:GLOBAL 0 0 WITHSCORES\`
   - **Condition**: If queue has at least 1 ad:
     - **HIT**: Elect winner! Set fallback flag = \`global\`.
   - **MISS**: (0 bids in Global) -> Transition to Tier 0.

4. **Tier 0: House Default Fallback (\`billboard:defaults\`)**
   - Fetch static pre-rendered system house ads (e.g. Public Service Announcement, Eco Awareness, Platform Promo).
   - Guarantees **Zero Blank Board Time (100% Fill Rate Guarantee)**.
`;

export const SAMPLE_CAMPAIGNS = [
  {
    id: 'cmp_kul_01',
    advertiserId: 'usr_adv_01',
    advertiserName: 'KL Cyber Mobility',
    title: 'KL Tech Summit 2026 - Petronas Twin Towers',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    ctaType: 'website' as const,
    ctaUrl: 'https://kltechsummit.com',
    landingPageUrl: 'https://kltechsummit.com',
    targetCountryCode: 'MY',
    targetCityCode: 'KUL',
    bidAmountCents: 250, // $2.50
    status: 'approved' as const,
    safetyScore: 98,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cmp_tyo_01',
    advertiserId: 'usr_adv_02',
    advertiserName: 'Shibuya Neon Media',
    title: 'Cyber Neon Ramen Bar - Shibuya Crossing',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    ctaType: 'whatsapp' as const,
    ctaUrl: 'https://wa.me/818012345678?text=Ramen%20Order',
    whatsappLink: 'https://wa.me/818012345678?text=Ramen%20Order',
    targetCountryCode: 'JP',
    targetCityCode: 'TYO',
    bidAmountCents: 200, // $2.00
    status: 'approved' as const,
    safetyScore: 96,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cmp_nyc_01',
    advertiserId: 'usr_adv_03',
    advertiserName: 'Manhattan Web3 Network',
    title: 'Times Square Web3 Festival 2026',
    imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    ctaType: 'website' as const,
    ctaUrl: 'https://timessquareweb3.io',
    landingPageUrl: 'https://timessquareweb3.io',
    targetCountryCode: 'US',
    targetCityCode: 'NYC',
    bidAmountCents: 180, // $1.80
    status: 'approved' as const,
    safetyScore: 99,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cmp_my_01',
    advertiserId: 'usr_adv_04',
    advertiserName: 'Tourism Malaysia',
    title: 'Malaysia Truly Asia - Eco Tourism Campaign',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    ctaType: 'whatsapp' as const,
    ctaUrl: 'https://wa.me/60198887766?text=Travel%20Inquiry',
    whatsappLink: 'https://wa.me/60198887766?text=Travel%20Inquiry',
    targetCountryCode: 'MY',
    targetCityCode: 'ALL',
    bidAmountCents: 150, // $1.50
    status: 'approved' as const,
    safetyScore: 100,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cmp_global_01',
    advertiserId: 'usr_adv_05',
    advertiserName: 'Global AI Foundation',
    title: 'Global AI Developer Conference 2026',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'image' as const,
    ctaType: 'website' as const,
    ctaUrl: 'https://globalaiconf.org',
    landingPageUrl: 'https://globalaiconf.org',
    targetCountryCode: 'ALL',
    targetCityCode: 'ALL',
    bidAmountCents: 800, // $8.00
    status: 'approved' as const,
    safetyScore: 95,
    createdAt: new Date().toISOString()
  }
];
