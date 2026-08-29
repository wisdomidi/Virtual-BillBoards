# 🏆 OpenAI WebMCP Challenge Submission: LiveBillboards.lol

### Project Name
**Virtual BillBoard (`LiveBillboards.lol`)** — *World's First 24/7 Infinite Virtual Billboard, WebMCP Autonomous Screen Network & Solana USDC Micro-Payment Highway*

---

## 📌 Elevator Pitch
LiveBillboards turns any screen on Earth—from Tokyo Shibuya and Times Square to Smart TVs, physical hackathon stages, and creator live streams—into a 24/7 autonomous advertising layer. Using the **OpenAI Model Context Protocol (WebMCP)** standard, autonomous AI agents can discover available ad slots, predict audience attention dwell curves, bid programmatically, and settle payments in under 400ms using **Solana USDC**, while human spectators mine cryptographic **Proof-of-Attention** rewards.

---

## 🎯 Key Challenge Themes & Solutions

### 1. Dual-Engine WebMCP Standard Compliance
- **Client-Side DOM Runtime**: Implements `window.webMCP` and `navigator.modelContext` with custom event dispatching (`webmcp:ready`, `webmcp:tools-updated`) for ChatGPT in-app browser and Chrome agent panels.
- **Server-Side JSON-RPC 2.0 Engine**: Compliant manifest at `/.well-known/mcp.json` and JSON-RPC dispatch at `/api/mcp/call`.
- **10 Native Programmatic Tools**: Covers the complete discovery, bidding, telemetry, and settlement lifecycle without fragile DOM scraping.

### 2. "Better Together": Human-AI Symbiosis
- **Autonomous Outbid Guardian**: AI agents protect human founders and advertisers by automatically defending against outbids in real-time.
- **Proof-of-Attention Attention Economy**: AI agents buy ad space with sub-cent micro-bids; human viewers physically verify engagement by mining dynamic attention targets on screen and cash out real USDC directly to their Phantom wallets.

### 3. Dual-Payment Highway: Stripe Card Rails & Solana USDC Micro-Highway
- **For Human Advertisers**: Frictionless onboarding via traditional **Credit Cards, Apple Pay, and Google Pay (Stripe 256-bit SSL)** with instant token credits.
- **For Autonomous AI Agents**: High-throughput **Solana Mainnet USDC** (<$0.0003 network fee, ~400ms finality) enables sub-cent machine-to-machine micro-bids with **atomic 3-way SPL Token splits**:
  - **70%** directly to the Streamer, Event Organizer, or Physical Venue.
  - **15%** to the Human Spectator Attention Reward Pool.
  - **15%** to the Platform Protocol Treasury.

### 4. 60-Second Interactive Judge Experience
- Built a 1-click **Interactive Simulation Runner** directly inside the WebMCP Suite (`https://www.livebillboards.lol/webmcp`) that demonstrates the complete end-to-end agent discovery, pricing calculation, safety check, and live screen takeover in seconds.

---

## 🛠️ How to Test & Verify (For Judges)

1. **Live Application**: [https://www.livebillboards.lol](https://www.livebillboards.lol)
2. **WebMCP Playground**: [https://www.livebillboards.lol/webmcp](https://www.livebillboards.lol/webmcp)
3. **WebMCP Manifest**: [https://www.livebillboards.lol/.well-known/mcp.json](https://www.livebillboards.lol/.well-known/mcp.json)
4. **Interact & Earn (Proof-of-Attention)**: [https://www.livebillboards.lol/watcher](https://www.livebillboards.lol/watcher)
5. **Venue & Streamer Studio**: [https://www.livebillboards.lol/streamer](https://www.livebillboards.lol/streamer)
6. **GitHub Codebase**: [https://github.com/wisdomidi/Virtual-BillBoards](https://github.com/wisdomidi/Virtual-BillBoards)

---

## 📦 WebMCP Tool Definitions Overview

```json
[
  { "name": "placeSolanaUsdcBid", "description": "Programmatic sub-second Solana USDC ad slot settlement" },
  { "name": "fetchActiveBillboard", "description": "Inspect active ad, remaining time, and reserve floor" },
  { "name": "fetchHistoricalROI", "description": "Programmatic query for CPM, CTR, and estimated ROAS" },
  { "name": "predictStreamRetention", "description": "Predicts audience dwell curves and optimal bidding windows" },
  { "name": "getAudienceAttentionSpikes", "description": "Live human spectator telemetry and solve rates" },
  { "name": "placeAdBid", "description": "Submits 15-second ad creative to RTB queue" },
  { "name": "bidTier1StaringEyeballs", "description": "5x multiplier bid with 100% human solve guarantee" },
  { "name": "sponsorStreamerGameStateEvent", "description": "Triggers live in-game celebratory takeover with 70% rev-share" },
  { "name": "claimCreatorHandle", "description": "Registers vanity creator channel" },
  { "name": "getWalletBalance", "description": "Fetches ad tokens and remaining 15s plays" }
]
```
