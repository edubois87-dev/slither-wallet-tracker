// ═══════════════════════════════════════════════════════════════════
// SLITHER WALLET TRACKER + TELEGRAM ALERTS
// Tracks buys/sells from a wallet on pump.fun
// Posts every trade to your Telegram channel
//
// SETUP:
//   1. Message @BotFather on Telegram → /newbot → get your BOT TOKEN
//   2. Add the bot as admin to your channel
//   3. Get your channel ID (see instructions below)
//   4. Fill in the 3 config values below
//   5. Run: npm install ws  &&  node wallet-tracker.js
//
// HOW TO GET CHANNEL ID:
//   - For public channels: use @channelusername (e.g. "@mychannel")
//   - For private channels: 
//     1. Forward a message from your channel to @userinfobot
//     2. Or open https://api.telegram.org/bot<TOKEN>/getUpdates
//        after posting in the channel — look for "chat":{"id":-100xxxxx}
// ═══════════════════════════════════════════════════════════════════

const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

// ╔═══════════════════════════════════════════════════════════════╗
// ║  FILL IN THESE 3 VALUES                                      ║
// ╚═══════════════════════════════════════════════════════════════╝
const WALLET = "AoGefnxF5CbZvbd2cvxv4Ex1E5j86dqEjehazRuMcMFe";
const TELEGRAM_BOT_TOKEN = "8621001669:AAH5l5K6_xDQy-cChT3bvcf1zN3eupE0DMw";   // from @BotFather
const TELEGRAM_CHANNEL_ID = "@SlitherSignals";  // @channelusername or -100xxxxxxxxxx
// ╔═══════════════════════════════════════════════════════════════╗

const WS_URL = "wss://pumpportal.fun/api/data";
const LOG_FILE = path.join(__dirname, "wallet-trades.json");
const SOL_PRICE = 150;

// ── State ─────────────────────────────────────────────────────────
const trades = [];
const tokenStats = {};
let tradeCount = 0;
let ws = null;
let telegramReady = false;

// ── Helpers ───────────────────────────────────────────────────────
const ts = () => new Date().toLocaleTimeString();
const shortAddr = (a) => a ? a.slice(0, 6) + "…" + a.slice(-4) : "?";

// ── Telegram ──────────────────────────────────────────────────────
async function sendTelegram(text, parseMode = "HTML") {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
    console.log(`[${ts()}] ⚠ Telegram not configured — skipping post`);
    return false;
  }
  if (!TELEGRAM_CHANNEL_ID || TELEGRAM_CHANNEL_ID === "YOUR_CHANNEL_ID_HERE") {
    console.log(`[${ts()}] ⚠ Channel ID not configured — skipping post`);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await resp.json();
    if (data.ok) {
      telegramReady = true;
      return true;
    } else {
      console.log(`[${ts()}] ⚠ Telegram error: ${data.description}`);
      return false;
    }
  } catch (e) {
    console.log(`[${ts()}] ⚠ Telegram failed: ${e.message}`);
    return false;
  }
}

function buildTradeMessage(data) {
  const action = data.txType || "unknown";
  const mint = data.mint || "?";
  const name = data.name || data.symbol || shortAddr(mint);
  const solAmount = data.solAmount || 0;
  const tokenAmount = data.tokenAmount || 0;
  const mcapSol = data.marketCapSol || 0;
  const mcapUsd = mcapSol * SOL_PRICE;
  const sig = data.signature || "";
  const price = solAmount && tokenAmount ? solAmount / tokenAmount : 0;

  const isBuy = action === "buy" || action === "create";
  const emoji = isBuy ? "🟢" : "🔴";
  const actionText = isBuy ? "BUY" : "SELL";
  const mcapStr = mcapUsd >= 1000 ? `$${(mcapUsd / 1000).toFixed(1)}K` : `$${Math.round(mcapUsd)}`;
  const usdAmount = (solAmount * SOL_PRICE).toFixed(2);

  // Build Telegram HTML message
  const msg = [
    `${emoji} <b>${actionText}</b> — <b>${name}</b>`,
    ``,
    `💰 <b>${solAmount.toFixed(4)} SOL</b> (~$${usdAmount})`,
    `📊 MCap: <b>${mcapStr}</b>`,
    tokenAmount ? `🪙 Tokens: ${Math.round(tokenAmount).toLocaleString()}` : null,
    price > 0 ? `💲 Price: ${price.toExponential(3)}` : null,
    ``,
    `📋 <code>${mint}</code>`,
    ``,
    `🔗 <a href="https://pump.fun/${mint}">Pump.fun</a>`,
    sig ? `🔍 <a href="https://solscan.io/tx/${sig}">Solscan TX</a>` : null,
    `👤 <a href="https://pump.fun/profile/${WALLET}">Wallet Profile</a>`,
    ``,
    `⏰ ${new Date().toLocaleString()}`,
    ``,
    `⚡ <i>Signal bot requested by Hells @SlitherPepeCoin</i>`,
  ].filter(Boolean).join("\n");

  return { msg, isBuy, name, mint, solAmount, tokenAmount, mcapUsd, sig, price };
}

// ── Trade Handler ─────────────────────────────────────────────────
async function handleTrade(data) {
  const { msg, isBuy, name, mint, solAmount, tokenAmount, mcapUsd, sig, price } = buildTradeMessage(data);

  tradeCount++;
  const icon = isBuy ? "🟢 BUY " : "🔴 SELL";

  // Console output
  console.log(`\n${icon}  #${tradeCount}`);
  console.log(`  Token:  ${name}`);
  console.log(`  CA:     ${mint}`);
  console.log(`  SOL:    ${solAmount.toFixed(4)} SOL (~$${(solAmount * SOL_PRICE).toFixed(2)})`);
  console.log(`  MCap:   $${mcapUsd >= 1000 ? (mcapUsd / 1000).toFixed(1) + "K" : Math.round(mcapUsd)}`);
  if (sig) console.log(`  TX:     https://solscan.io/tx/${sig}`);

  // Track stats
  if (!tokenStats[mint]) {
    tokenStats[mint] = { name, buys: 0, sells: 0, totalBuySol: 0, totalSellSol: 0 };
  }
  const s = tokenStats[mint];
  if (isBuy) { s.buys++; s.totalBuySol += solAmount; }
  else { s.sells++; s.totalSellSol += solAmount; }

  // Save to file
  trades.push({
    timestamp: new Date().toISOString(),
    action: isBuy ? "buy" : "sell",
    mint, name, solAmount, tokenAmount, price, mcapUsd,
    signature: sig,
  });
  saveTrades();

  // Post to Telegram
  const sent = await sendTelegram(msg);
  if (sent) {
    console.log(`  📨 Posted to Telegram ✓`);
  }
}

function saveTrades() {
  const output = {
    wallet: WALLET,
    lastUpdated: new Date().toISOString(),
    totalTrades: trades.length,
    tokenStats: Object.entries(tokenStats).map(([mint, s]) => ({
      mint, name: s.name, buys: s.buys, sells: s.sells,
      totalBuySol: +s.totalBuySol.toFixed(4),
      totalSellSol: +s.totalSellSol.toFixed(4),
      netSol: +(s.totalSellSol - s.totalBuySol).toFixed(4),
    })),
    trades: trades.slice(-500),
  };
  fs.writeFileSync(LOG_FILE, JSON.stringify(output, null, 2));
}

// ── WebSocket ─────────────────────────────────────────────────────
function connect() {
  console.log(`[${ts()}] Connecting to PumpPortal…`);
  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log(`[${ts()}] Connected — subscribing to wallet`);
    console.log(`[${ts()}] Watching: ${WALLET}\n`);

    ws.send(JSON.stringify({
      method: "subscribeAccountTrade",
      keys: [WALLET],
    }));
  });

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data.traderPublicKey === WALLET || (data.mint && !data.txType?.includes("subscribe"))) {
        handleTrade(data);
      }
    } catch (e) {}
  });

  ws.on("error", (err) => console.log(`[${ts()}] WS error: ${err.message}`));
  ws.on("close", () => {
    console.log(`[${ts()}] Disconnected — reconnecting in 3s…`);
    setTimeout(connect, 3000);
  });
}

// ── Startup ───────────────────────────────────────────────────────
async function start() {
  console.log("═".repeat(60));
  console.log("  PUMP.FUN WALLET TRACKER + TELEGRAM");
  console.log("═".repeat(60));
  console.log(`  Wallet:   ${WALLET}`);
  console.log(`  Channel:  ${TELEGRAM_CHANNEL_ID}`);
  console.log(`  Log:      ${LOG_FILE}`);
  console.log("═".repeat(60));

  // Test Telegram connection
  if (TELEGRAM_BOT_TOKEN !== "YOUR_BOT_TOKEN_HERE") {
    console.log(`\n[${ts()}] Testing Telegram connection…`);
    const ok = await sendTelegram(
      `🤖 <b>Wallet Tracker Started</b>\n\n` +
      `👤 Watching: <code>${WALLET}</code>\n` +
      `🔗 <a href="https://pump.fun/profile/${WALLET}">View Profile</a>\n\n` +
      `Tracking all buys and sells on pump.fun…\n\n` +
      `⚡ <i>Signal bot requested by Hells @SlitherPepeCoin</i>`
    );
    if (ok) {
      console.log(`[${ts()}] ✓ Telegram connected — messages will post to your channel`);
    } else {
      console.log(`[${ts()}] ✗ Telegram failed — check your BOT_TOKEN and CHANNEL_ID`);
      console.log(`[${ts()}]   Continuing without Telegram…`);
    }
  } else {
    console.log(`\n[${ts()}] ⚠ Telegram not configured — console only`);
    console.log(`[${ts()}]   Edit TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in this file`);
  }

  console.log(`\n[${ts()}] Starting WebSocket…\n`);
  connect();
}

// Summary every 5 min
setInterval(() => {
  const tokens = Object.entries(tokenStats);
  if (tokens.length === 0) return;
  let totalBuy = 0, totalSell = 0;
  tokens.forEach(([, s]) => { totalBuy += s.totalBuySol; totalSell += s.totalSellSol; });
  console.log(`\n[${ts()}] Summary: ${trades.length} trades, ${tokens.length} tokens, bought ${totalBuy.toFixed(2)} SOL, sold ${totalSell.toFixed(2)} SOL, net ${(totalSell - totalBuy).toFixed(2)} SOL`);
}, 300000);

process.on("SIGINT", () => {
  saveTrades();
  console.log(`\nSaved ${trades.length} trades to ${LOG_FILE}`);
  process.exit(0);
});

start();