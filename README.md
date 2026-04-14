# 🐍 Slither Wallet Tracker + Telegram Alerts

**Brought to you by Hells, SlitherPepe Dev** — [@SlitherPepeCoin](https://t.me/SlitherPepeCoin)

Real-time pump.fun wallet tracker that monitors every buy and sell from any Solana wallet and posts formatted alerts to your Telegram channel instantly.

Built with the [PumpPortal](https://pumpportal.fun/) WebSocket Data API — free to track, no API key needed.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![License](https://img.shields.io/badge/license-MIT-blue) ![PumpPortal](https://img.shields.io/badge/API-PumpPortal-purple) ![Solana](https://img.shields.io/badge/chain-Solana-9945FF)

---

## 🏆 Proof It Works — $FU Call (15x)

This isn't theory. Here's a real call made live using this program with receipts to prove it:

> **$FU** — [`Aigo2DTKEe8tiy85NGVakUBpg8yTCHBjpG4GJpE6pump`](https://pump.fun/Aigo2DTKEe8tiy85NGVakUBpg8yTCHBjpG4GJpE6pump)
>
> 🟢 **Entry: $4.3K market cap**
> 🚀 **ATH: $67K market cap** — **15x from entry**
> 📊 **$37K market cap** at time of writing
>
> Called live on **[@SlitherSignals](https://t.me/SlitherSignals)** with proof to back it up.

**Don't take our word for it — check the receipts:** [**t.me/SlitherSignals**](https://t.me/SlitherSignals)

---

## 📡 What It Does

- Connects to PumpPortal's real-time WebSocket (`wss://pumpportal.fun/api/data`)
- Subscribes to **all trades** from a target wallet via `subscribeAccountTrade`
- Detects every **BUY** 🟢 and **SELL** 🔴 on pump.fun the moment it happens
- Posts a formatted alert to your **Telegram channel** with:
  - Token name and contract address (tap to copy)
  - SOL amount and USD estimate
  - Market cap
  - Token count and price
  - Direct links to Pump.fun, Solscan TX, and wallet profile
- Saves all trades to `wallet-trades.json` with per-token stats
- Auto-reconnects on disconnect
- Console summary every 5 minutes

---

## 📨 Telegram Alert Example

> 🟢 **BUY** — **CHIKENWIF**
>
> 💰 **0.5000 SOL** (~$75.00)
> 📊 MCap: **$10.2K**
> 🪙 Tokens: 12,345,678
> 💲 Price: 4.050e-8
>
> `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
>
> 🔗 [Pump.fun](https://pump.fun/) · 🔍 [Solscan TX](https://solscan.io/)
> 👤 [Wallet Profile](https://pump.fun/)
>
> ⏰ 4/14/2026, 4:30:00 PM
>
> ⚡ *Signal bot requested by Hells @SlitherPepeCoin*

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Telegram bot token (free from [@BotFather](https://t.me/BotFather))
- A Telegram channel with your bot added as admin

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/slither-wallet-tracker.git
cd slither-wallet-tracker
npm install ws
```

### Configuration

Open `wallet-tracker.js` and fill in the 3 values at the top:

```js
const WALLET = "AoGefnxF5CbZvbd2cvxv4Ex1E5j86dqEjehazRuMcMFe";  // wallet to track
const TELEGRAM_BOT_TOKEN = "your-bot-token-here";                  // from @BotFather
const TELEGRAM_CHANNEL_ID = "@YourChannel";                        // or -100xxxxxxxxxx
```

### Run

```bash
node wallet-tracker.js
```

That's it. The tracker sends a test message to your channel on startup, then posts every trade in real-time.

---

## 🤖 Setting Up Telegram

### 1. Create a Bot

1. Open Telegram and message **[@BotFather](https://t.me/BotFather)**
2. Send `/newbot`
3. Choose a name and username
4. Copy the token — that's your `TELEGRAM_BOT_TOKEN`

### 2. Add Bot to Your Channel

1. Open your Telegram channel → Settings → Administrators
2. Add your bot as an admin
3. Give it permission to **Post Messages**

### 3. Get Your Channel ID

- **Public channel:** Use `@yourchannelusername` directly
- **Private channel:** Forward any channel message to **[@userinfobot](https://t.me/userinfobot)** to get the numeric ID (starts with `-100...`)
- **Alternative:** Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser after posting in the channel

---

## 📁 Output Files

### `wallet-trades.json`

Automatically saved with every trade:

```json
{
  "wallet": "AoGefnx...",
  "totalTrades": 42,
  "tokenStats": [
    {
      "mint": "7xKXtg...",
      "name": "CHIKENWIF",
      "buys": 3,
      "sells": 2,
      "totalBuySol": 1.5,
      "totalSellSol": 2.1,
      "netSol": 0.6
    }
  ],
  "trades": [ ... ]
}
```

---

## ⚙️ Customization

| Variable | Description | Default |
|----------|-------------|---------|
| `WALLET` | Solana wallet address to track | — |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | — |
| `TELEGRAM_CHANNEL_ID` | Channel username or numeric ID | — |
| `SOL_PRICE` | Approximate SOL/USD for display | `150` |
| `WS_URL` | PumpPortal WebSocket endpoint | `wss://pumpportal.fun/api/data` |

### Track Multiple Wallets

```js
ws.send(JSON.stringify({
  method: "subscribeAccountTrade",
  keys: [
    "AoGefnxF5CbZvbd2cvxv4Ex1E5j86dqEjehazRuMcMFe",
    "ANOTHER_WALLET_ADDRESS_HERE",
    "AND_ANOTHER_ONE_HERE"
  ],
}));
```

PumpPortal supports up to 100 wallets per connection.

---

## 🛠️ Tech Stack

- **Node.js** — Runtime
- **ws** — WebSocket client (only dependency)
- **PumpPortal Data API** — Free real-time pump.fun trade stream
- **Telegram Bot API** — Channel posting via HTTPS (no library needed)

---

## 📋 Features Roadmap

- [ ] Multi-wallet tracking with per-wallet labels
- [ ] Filter by minimum SOL amount
- [ ] Discord webhook support
- [ ] Copy-trade mode (auto-mirror buys)
- [ ] Web dashboard for trade history

---

## 📢 Telegram

| Channel | Link | What |
|---------|------|------|
| **Slither Signals** | [t.me/SlitherSignals](https://t.me/SlitherSignals) | Live wallet alerts, calls with proof — powered by this bot |
| **SlitherPepe** | [t.me/SlitherPepe1](https://t.me/SlitherPepe1) | SlitherPepe slitherio game community and Dev's coin |
| **Dev (Hells)** | [@SlitherPepeCoin](https://t.me/SlitherPepeCoin) | DM the dev directly - Freelance available |

---

## 🐍 SlitherPepe

This tool is part of the [SlitherPepe](https://play.slithercoin.us) ecosystem — a live multiplayer play-to-earn snake game on Solana combining Pepe meme culture with DeFi mechanics. Built from scratch by Hells — solo dev doing game code, smart contracts, marketing, and community tools like this one.

**$SLPE** — [`2JGdRdY9TcMis8ssovxPEDfKHGSNMXDn7mTrgSm4pump`](https://pump.fun/2JGdRdY9TcMis8ssovxPEDfKHGSNMXDn7mTrgSm4pump)

- 🎮 [Play the Game](https://play.slithercoin.us)
- 🐸 [Pump.fun](https://pump.fun/2JGdRdY9TcMis8ssovxPEDfKHGSNMXDn7mTrgSm4pump)
- 📢 [Telegram](https://t.me/SlitherPepe1)
- 💬 [Dev — @SlitherPepeCoin](https://t.me/SlitherPepeCoin)

**Support the Dev by holding $SLPE** — every holder helps keep the builds coming. 🐍

---

## 💚 Donations

If this tool helps you catch plays, show some love to the SlitherPepe fam:

**Send SOL to:**

```
oFxA9RHcc8CTpJo2FLsyxR2Z47TdFvmFEjm1KMf5a3f
```

— SlitherPepe Fam 🐍💚

---

## 📄 License

MIT — use it, fork it, build on it. Just keep the vibes going.

---

*⚡ Signal bot requested by Hells [@SlitherPepeCoin](https://t.me/SlitherPepeCoin)*