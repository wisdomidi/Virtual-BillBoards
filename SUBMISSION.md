# 🏆 OpenAI WebMCP Challenge: LiveBillboards.lol

### Project Name
**Virtual BillBoard (`LiveBillboards.lol`)** — *World's First 24/7 Digital Billboard Network, Physical Smart TV DOOH, Live Stream Overlays & WebMCP Autonomous AI Bidding Highway*

---

## 📌 Elevator Pitch
LiveBillboards turns any screen on Earth—from Tokyo Shibuya and Times Square to cafe Smart TVs, physical hackathon stages, and creator live streams—into a 24/7 programmatic advertising layer. Using the **OpenAI Model Context Protocol (WebMCP)** standard, autonomous AI agents can discover live slots, predict audience dwell curves, bid programmatically in under 20ms, and settle payments in ~400ms using **Solana USDC** (or **Credit Cards via Stripe** for humans), while human spectators mine cryptographic **Proof-of-Attention** rewards.

---

## 💡 Inspiration
Traditional Out-Of-Home (DOOH) billboard advertising is broken:
- **Exorbitant Costs**: Renting a physical digital screen in Times Square or Tokyo Shibuya costs **$10,000 to $50,000 per month** with rigid 4-week commitments.
- **Slow Agency Gatekeepers**: Manual PDF pitch decks, agency contracts, and email negotiations take weeks for approval.
- **Zero Access for AI Agents**: As autonomous AI agents begin managing marketing budgets, buying goods, and building software, they possess **zero physical or visual outlets** to communicate with real humans.

We asked: *What if we democratized every digital screen on Earth into an open, sub-second Real-Time Bidding (RTB) layer? What if an autonomous AI agent or a solo indie hacker could broadcast a 15-second takeover to a cafe Smart TV or a 50,000-viewer live stream for as low as $0.001 (0.1¢) to $1.00—with instant Solana USDC settlement and direct creator revenue payouts?*

---

## ⚡ What it does

### 1. Dual-Engine WebMCP Standard Compliance
- **Client-Side DOM Runtime**: Injects `window.webMCP` and `navigator.modelContext` with custom event dispatchers (`webmcp:ready`, `webmcp:tools-updated`) for ChatGPT in-app browser and Chrome agent panels.
- **Server-Side JSON-RPC 2.0 Engine**: Fully compliant machine manifest at `/.well-known/mcp.json` and tool dispatcher at `/api/mcp/call`.
- **10 Native Programmatic Tools**: Enables AI agents to inspect live slot inventory, calculate audience dwell curves, check historical ROI, trigger in-game streamer takeovers, and execute on-chain bids without fragile DOM scraping.

### 2. Multi-Surface Screen Network
- **200+ Real-World Metropolitan Feeds**: Dedicated geofenced channels across Tokyo Shibuya (`TYO`), Times Square NYC (`NYC`), London Piccadilly (`LON`), Paris (`PAR`), Kuala Lumpur (`KUL`), Singapore (`SIN`), and Dubai (`DXB`).
- **Physical Smart TV DOOH Mode (`/tv` & `/pair`)**: Turnkey 24/7 billboard player for coffee shops, gyms, and hotel lobbies via 6-digit TV PIN pairing, earning venue owners **70% direct revenue share**.
- **Creator Live Stream Overlays (`/streamer`)**: Universal OBS Studio / Twitch / YouTube / Kick browser source overlays turning text donation alerts into rich visual sponsor takeovers.
- **Main Stage / Hackathon Display Mode (`/venue`)**: 4K/1080p full-screen stage mode for demo days, keynote takeovers, and esports arena LED walls.

### 3. Dual Financial Rails (Humans & AI Agents)
- **For Human Founders & Marketers**: Frictionless fiat onboarding via **Credit Cards, Apple Pay, Google Pay, and Stripe (256-bit SSL)** with instant token credits.
- **For Autonomous AI Agents**: High-throughput **Solana Mainnet USDC** (<$0.0003 fee, ~400ms finality) with **atomic 3-way SPL Token splits**:
  - **70%** directly to the Streamer, Event Stage, or Venue Smart TV wallet.
  - **15%** to the Human Spectator Attention Reward Pool.
  - **15%** to the Platform Protocol Treasury.

### 4. Cryptographic Proof-of-Attention (`/watcher`)
- Spectators watch the live billboard stream, solve dynamic anti-bot radar targets appearing on screen, and mine attention points (**100 Points = $1.00 USDC**).
- One-click instant cashout directly to Phantom or Solflare wallets with verifiable on-chain Solscan transaction receipts.

---

## 🛠️ How we built it

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           ADVERTISER LAYER                             │
  │  • Human Marketers (Credit Card / Apple Pay / Stripe 256-bit SSL)      │
  │  • Autonomous AI Agents (OpenAI WebMCP 1.0 / Solana USDC Micro-Highway)│
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │   24/7 RTB BROADCAST QUEUE   │
                       │   (Sub-20ms WebSocket Engine)│
                       └──────────────┬───────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  PHYSICAL SMART  │        │  CREATOR LIVE    │        │  HUMAN SPECTATOR │
│  TVs IN VENUES   │        │  STREAM OVERLAYS │        │  PROOF-OF-       │
│  (Cafes, Gyms)   │        │  (Twitch, OBS)   │        │  ATTENTION POOL  │
│  70% Rev-Share   │        │  70% Rev-Share   │        │  15% USDC Pool   │
└──────────────────┘        └──────────────────┘        └──────────────────┘
```

- **Frontend & Visual Studio**: Built with **React 19**, **TypeScript**, **TailwindCSS**, and **Recharts** for regional telemetry and live audience analytics.
- **Agentic Protocol**: Native implementation of the **OpenAI Model Context Protocol (WebMCP 1.0)** specifications with bidirectional tool registration.
- **AI Moderation Engine**: Integrated **Google Gemini 2.5 Multimodal AI (`@google/genai`)** to inspect all submitted images, headlines, and destination URLs for brand-safety and NSFW quarantine in real time.
- **Blockchain Infrastructure**: `@solana/web3.js` and `@solana/spl-token` powering sub-400ms atomic splits and automated treasury dispersals.
- **Backend & RTB Server**: **Node.js**, **Express**, **WebSocket (`ws`)**, and **Firebase Firestore** for real-time bid arbitration and telemetry.

---

## 🧗 Challenges we ran into

1. **Eliminating DOM Scraping Fragility for AI**:
   - Traditional AI agents struggle when trying to scrape complex dynamic DOM buttons. We solved this by developing the dual WebMCP client/server standard (`window.webMCP` and `/.well-known/mcp.json`), providing declarative, structured tool definitions with zero scraping required.
2. **Sub-Cent Micro-Payment Feasibility**:
   - Credit card rails charge a fixed $0.30 fee per transaction, making $0.001 to $0.10 micro-bids economically impossible. We engineered dual financial rails: Stripe for human bulk top-ups ($5–$50) and native Solana USDC for sub-cent streaming agent transactions.
3. **Smart TV Low-Power Hardware Compatibility**:
   - Physical TVs in coffee shops run low-spec processors on webOS or Tizen. We engineered an ultra-optimized Smart TV PWA (`/tv`) with WebSocket event streams and 6-digit PIN pairing that runs smoothly at 60 FPS without memory leaks.
4. **Anti-Bot Proof-of-Attention Verification**:
   - Bots can easily click static buttons. We engineered a dynamic radar target engine that changes visual screen coordinates, ensuring only verified human eyeballs mine the attention reward pool.

---

## 🏆 Accomplishments that we're proud of

- **Complete WebMCP 1.0 Tool Suite**: 10 fully operational tools registered and executable via JSON-RPC or 1-click interactive demo.
- **Sub-400ms Live Screen Takeover**: Demonstrated live end-to-end agent discovery, Gemini safety review, Solana USDC settlement, and broadcast takeover in under 400 milliseconds.
- **Live Physical Screen Pairing**: Verified 6-digit Smart TV pairing on real-world venue displays with 70% direct creator/venue rev-share.
- **100/100 Search & AI Visibility**: Deployed full Schema.org JSON-LD graphs, XML sitemaps, and `llms.txt` so AI engines (ChatGPT, Claude, Gemini) can query live billboard slots directly.

---

## 📚 What we learned

- **WebMCP is the Future of Human-AI Interaction**: Giving autonomous agents standard tools to manipulate real-world screens creates an entirely new category of physical and visual AI capabilities.
- **Attention Verification Creates Win-Win Flywheels**: When advertisers pay micro-bids directly to viewers for paying attention, engagement increases by 500% compared to unskippable banner ads.

---

## 🚀 What's next

- **Solana Mobile dApp & Seed Vault Integration**: 1-tap Smart TV pairing from the Solana Seeker phone.
- **AI Anamorphic 3D Creative Generator**: Real-time 3D billboard video rendering powered by Gemini Imagen.
- **Global Mesh Screen Network**: Partnering with co-working chains and fitness centers to deploy 10,000+ physical screens across North America, Europe, and Asia.

---

## 🧰 Built With
- `typescript`
- `react-19`
- `openai-webmcp`
- `solana-web3`
- `spl-token`
- `stripe`
- `google-gemini-ai`
- `node-express`
- `firebase`
- `tailwindcss`
- `recharts`
- `vite`

---

## 🔗 "Try It Out" Links

| Destination | URL |
| :--- | :--- |
| **Live Production Platform** | [https://livebillboards.lol](https://livebillboards.lol) |
| **WebMCP Agent Playground (1-Click Test)** | [https://livebillboards.lol/webmcp](https://livebillboards.lol/webmcp) |
| **Official WebMCP 1.0 Manifest** | [https://livebillboards.lol/.well-known/mcp.json](https://livebillboards.lol/.well-known/mcp.json) |
| **Proof-of-Attention Earn Hub** | [https://livebillboards.lol/watcher](https://livebillboards.lol/watcher) |
| **Streamer & Venue Overlay Studio** | [https://livebillboards.lol/streamer](https://livebillboards.lol/streamer) |
| **Smart TV Screen Player (PIN Mode)** | [https://livebillboards.lol/tv](https://livebillboards.lol/tv) |
| **Smart TV Mobile Pairing Linker** | [https://livebillboards.lol/pair](https://livebillboards.lol/pair) |
| **Main Stage / Hackathon Arena Display** | [https://livebillboards.lol/venue](https://livebillboards.lol/venue) |
| **Regional Analytics & Telemetry** | [https://livebillboards.lol/analytics](https://livebillboards.lol/analytics) |
| **Programmatic REST API Docs** | [https://livebillboards.lol/api_docs](https://livebillboards.lol/api_docs) |
| **Insights & Growth Guides Blog** | [https://livebillboards.lol/blog](https://livebillboards.lol/blog) |
| **GitHub Source Code** | [https://github.com/wisdomidi/Virtual-BillBoards](https://github.com/wisdomidi/Virtual-BillBoards) |

---

## 🖼️ Project Media Gallery Guide (3:2 Ratio)

1. **Hero Screen Takeover**: Full-screen 24/7 billboard stream featuring active Tokyo Shibuya and Times Square takeovers with live timer.
2. **WebMCP Agent Suite**: Interactive 1-click autonomous simulation showing tool discovery, retention prediction, and USDC settlement.
3. **Smart TV 6-Digit PIN Pairing**: Clean TV display with large pairing PIN (`834-192`) and mobile pairing companion.
4. **Streamer OBS Overlay Studio**: Creator control room with live countdown timer, sponsor badge, and dynamic QR barcode.
5. **Proof-of-Attention Radar**: Floating target mini-game on video stream with live point accumulator (+25 Pts) and Phantom cashout.
6. **Regional Analytics Dashboard**: Recharts telemetry showing hourly bid volume, CPM curves, and peak attention surge hours.
7. **Dual Payment Gateway**: Stripe Credit Card / Apple Pay checkout alongside Solana USDC instant micro-rail.

---

## 🎥 Video Demo Link
- **Demo Video**: [https://www.livebillboards.lol/demo.mp4](https://www.livebillboards.lol) *(or YouTube / Loom walkthrough link)*
