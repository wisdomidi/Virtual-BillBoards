<div align="center">

# 🌐 Virtual BillBoard (LiveBillboards.lol)
### *World's First Infinite 24/7 Virtual Billboard, WebMCP Autonomous AI Screen Network & Solana USDC Micro-Payment Highway*

[![OpenAI WebMCP Compliant](https://img.shields.io/badge/OpenAI-WebMCP_Standard-blue?style=for-the-badge&logo=openai)](https://openai.com/webmcp-challenge/)
[![Solana USDC](https://img.shields.io/badge/Solana-USDC_Micro--Highway-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Live Network](https://img.shields.io/badge/Live_Feeds-200+_Global_Cities-06b6d4?style=for-the-badge)](https://www.livebillboards.lol)
[![RTB Latency](https://img.shields.io/badge/RTB_Engine-<20ms_Sub--Second-10b981?style=for-the-badge)](https://www.livebillboards.lol)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

**[🌐 Live App](https://www.livebillboards.lol)** • **[🤖 WebMCP Suite](https://www.livebillboards.lol/webmcp)** • **[💎 Proof-of-Attention Hub](https://www.livebillboards.lol/watcher)** • **[🎪 Venue & Streamer Studio](https://www.livebillboards.lol/streamer)** • **[📜 WebMCP Manifest](https://www.livebillboards.lol/.well-known/mcp.json)**

</div>

---

## 🎯 60-Second Judge Quick-Test Guide

Judges can test the full end-to-end autonomous WebMCP agent flow in 60 seconds:

1. **Open the WebMCP Suite**: Navigate to **[livebillboards.lol/webmcp](https://www.livebillboards.lol/webmcp)**.
2. **Click "▶️ Run Autonomous Agent Flow"**: Located in the hero section.
3. **Watch the Live Agent Flow**:
   - 📡 **Discovery**: Inspects the active Tokyo Shibuya screen slot via `fetchActiveBillboard("TYO")`.
   - 🧠 **Predictive Intelligence**: Evaluates audience dwell curves and historical ROI via `predictStreamRetention()` and `fetchHistoricalROI()`.
   - ⚡ **Execution**: Executes `placeSolanaUsdcBid()` with sub-400ms on-chain settlement and live screen takeover!
4. **Test Proof-of-Attention & Watcher Cashout**: Open **[livebillboards.lol/watcher](https://www.livebillboards.lol/watcher)**, click the floating radar target on the video to mine +25 points, and click **"⚡ Claim USDC to Phantom"** for a real on-chain Solscan transfer receipt.

---

## 💡 What is Virtual BillBoard?

Traditional physical billboards cost **$10,000 to $50,000/month** and take weeks for manual agency review.

**Virtual BillBoard (`LiveBillboards.lol`)** democratizes global out-of-home advertising into an **infinite 24/7 virtual screen network** operating across **200+ metropolitan city feeds** (Tokyo Shibuya, Times Square NYC, London, Paris, Kuala Lumpur), **in-venue physical displays** (Smart TVs, hackathon stages, arena LED walls), and **creator live streams** (Kick, Twitch, YouTube).

Anyone—whether a human founder, marketing agency, or **autonomous AI agent**—can broadcast 15-second visual takeovers in real-time for as low as **$1.00 USDC** via Real-Time Bidding (RTB).

---

## ⚡ Solana USDC Micro-Payment Highway Architecture

To enable high-throughput machine-to-machine (M2M) autonomous commerce, LiveBillboards implements an on-chain **Solana USDC Micro-Payment Highway** with sub-400ms finality and <$0.0003 network transaction fees.

```
                       ┌───────────────────────────────────────────────────────────┐
                       │                     ADVERTISER LAYER                      │
                       │  • Human Advertisers (Stripe / Apple Pay / Card)          │
                       │  • Autonomous AI Agents (WebMCP / Solana USDC Micro-Bid)  │
                       └─────────────────────────────┬─────────────────────────────┘
                                                     │
                                                     ▼
                                      ┌──────────────────────────────┐
                                      │   24/7 RTB BROADCAST QUEUE   │
                                      │   (Sub-20ms WebSocket Engine) │
                                      └──────────────┬───────────────┘
                                                     │
        ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
        │                                            │                                            │
        ▼ (70% Instant Split)                        ▼ (15% Watcher Pool)                         ▼ (15% Protocol Treasury)
┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌───────────────────────────────┐
│   STREAMER / VENUE WALLET     │   │   HUMAN ATTENTION POOL FLOAT  │   │   PLATFORM COLD TREASURY      │
│  • Payouts in <400ms          │   │  • Reserved for PoA Solvers   │   │  • Network Operations         │
│  • Zero bank transfer fees    │   │  • Instant Phantom Claim      │   │  • Immutable Vault            │
└───────────────────────────────┘   └───────────────────────────────┘   └───────────────────────────────┘
```

---

## 🤖 Registered WebMCP Tools

LiveBillboards exposes 10 native tools across `window.webMCP` (client DOM runtime) and `/.well-known/mcp.json` (server JSON-RPC):

| Tool Name | Type | Description |
| :--- | :---: | :--- |
| `placeSolanaUsdcBid` | Action | Programmatically bids and settles a 15-second ad slot via Solana USDC with sub-400ms finality. |
| `fetchActiveBillboard` | Query | Inspects current live ad, countdown timer, and reserve floor price for any city or creator screen. |
| `fetchHistoricalROI` | Telemetry | Programmatically queries historical CPM, CTR, attention solve rates, and estimated ROAS. |
| `predictStreamRetention` | Intelligence | Predicts audience dwell curves and optimal bidding windows for algorithmic bots. |
| `getAudienceAttentionSpikes` | Telemetry | Returns live verified human spectator counts and traffic spike event history. |
| `placeAdBid` | Action | Submits a 15-second ad creative via standard token balance. |
| `bidTier1StaringEyeballs` | Action | 5x multiplier bid with 100% human Proof-of-Attention solve guarantee. |
| `sponsorStreamerGameStateEvent` | Action | Triggers celebratory live takeovers (Keynote, Victory Royale, 5x Killstreak) with 70% rev-share. |
| `claimCreatorHandle` | Utility | Registers a custom vanity creator channel (`/@handle`). |
| `getWalletBalance` | Utility | Fetches active ad tokens and remaining 15-second plays. |

---

## 🛠️ Tech Stack & Protocols

- **AI Agent Standard**: Model Context Protocol (WebMCP 1.0) — DOM & JSON-RPC
- **Blockchain Highway**: Solana Mainnet-Beta (USDC SPL Token, Helius RPC, `@solana/web3.js`)
- **Backend & RTB Engine**: Node.js, Express, WebSocket (`ws`), Cloud Firestore, Redis Cache Layer
- **Frontend & UI**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Safety & Verification**: Gemini Vision AI (Brand Safety Filter), HMAC-SHA256 Cryptographic PoA Tokens

---

## 📜 License
MIT License. Open for human creators and autonomous AI agents globally.