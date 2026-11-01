(function () {
"use strict";
const DEFAULT_MARKET = "KRW-BTC";
const FUTURES_ONLY_MODE = true;
const SHARED_ACCOUNT_KEY = "paperTrading.sharedAccount.v1";
const SHARED_TRADES_KEY = "paperTrading.allTrades.v1";
const SHARED_DAILY_SUMMARIES_KEY = "paperTrading.allDailySummaries.v1";
const SHARED_TRADING_MIGRATION_KEY = "paperTrading.sharedTradingHistoryMigrated.v1";
const SHARED_TRADES_BACKUP_KEY = "paperTrading.allTrades.backup.v1";
const LAST_TRADE_BACKUP_KEY = "paperTrading.lastTradeBackup.v1";
const RECOVERY_SNAPSHOT_KEY = "paperTrading.recoverySnapshot.v1";
const RECOVERY_SNAPSHOTS_KEY = "paperTrading.recoverySnapshots.v1";
const INTENTIONAL_CLEAR_KEY = "paperTrading.intentionalClear.v1";
const SHARED_FUTURES_STORAGE_KEY = "paperTrading.futures.shared.v2";
const SHARED_FUTURES_BACKUP_STORAGE_KEY = "paperTrading.futures.shared.backup.v2";
const CORRUPT_FUTURES_STORAGE_KEY = "paperTrading.futures.corruptBackup.v1";
const FUTURES_STORAGE_LOCK_KEY = "paperTrading.futures.writeLock.v1";
const FUTURES_LIMIT_ORDER_JOURNAL_KEY = "paperTrading.futures.limitOrders.journal.v1";
const FUTURES_LIMIT_ORDER_JOURNAL_VERSION = 1;
const FUTURES_LIMIT_ORDER_SETTLED_ID_LIMIT = 2000;
const FUTURES_EXIT_ORDER_JOURNAL_KEY = "paperTrading.futures.exitOrders.journal.v1";
const FUTURES_EXIT_ORDER_JOURNAL_VERSION = 1;
const FUTURES_EXIT_ORDER_SETTLED_ID_LIMIT = 2000;
const FUTURES_BINANCE_USDT_RESET_KEY = "paperTrading.futures.binanceUsdtReset.20260801.v2";
const FUTURES_FEE_RATE_MIGRATION_KEY = "paperTrading.futures.feeRate.roundTrip0.1.20261027.v1";
const FUTURES_ACTIVE_LEDGER_RESET_KEY = "paperTrading.futures.activeLedgerOnly.20260802.v1";
const LEGACY_BTC_FUTURES_STORAGE_KEY = "paperTrading.futures.btcusdt.v1";
const FUTURES_STORAGE_SCHEMA = "paperTrading.futures.state";
const FUTURES_STORAGE_SCHEMA_VERSION = 1;
const FUTURES_POSITION_JOURNAL_VERSION = 3;
const FUTURES_BACKUP_FILE_FORMAT = "paper-trading-futures-full-backup";
const FUTURES_BACKUP_FILE_VERSION = 1;
const FUTURES_LIVE_BACKUP_FILE_FORMAT = "paper-trading-futures-live-backup";
const FUTURES_LIVE_BACKUP_FILE_VERSION = 1;
const FUTURES_LIVE_BACKUP_FILE_NAME = "futures-trading-backup.json";
const FUTURES_LIVE_BACKUP_DB_NAME = "paperTrading.futures.liveBackup.v1";
const FUTURES_LIVE_BACKUP_DB_STORE = "backup";
const FUTURES_LIVE_BACKUP_HANDLE_KEY = "fileHandle";
const FUTURES_LIVE_BACKUP_SNAPSHOT_KEY = "latestSnapshot";
const FUTURES_LIVE_BACKUP_PRE_RESTORE_KEY = "preRestoreSnapshot";
const FUTURES_LIVE_BACKUP_CORRUPT_SNAPSHOT_KEY = "corruptSnapshot";
const FUTURES_LIVE_BACKUP_CONFLICT_ARCHIVE_KEY = "conflictSnapshots";
const FUTURES_LIVE_BACKUP_CONFLICT_ARCHIVE_LIMIT = 10;
const FUTURES_LIVE_BACKUP_COMMIT_LOCK = "paperTrading.futures.liveBackup.commit.v1";
const FUTURES_LIVE_BACKUP_MAX_RETRIES = 3;
const RECOVERY_SNAPSHOT_LIMIT = 20;
const MARKETS = {
 "KRW-BTC": {
   code: "KRW-BTC",
   label: "비트코인",
   symbol: "BTC",
   storagePrefix: "btcPaper"
 },
 "KRW-ETH": {
   code: "KRW-ETH",
   label: "이더리움",
   symbol: "ETH",
   storagePrefix: "ethPaper"
 },
 "KRW-XRP": {
   code: "KRW-XRP",
   label: "리플",
   symbol: "XRP",
   storagePrefix: "xrpPaper"
 },
 "KRW-DOGE": {
   code: "KRW-DOGE",
   label: "도지코인",
   symbol: "DOGE",
   storagePrefix: "dogePaper"
 },
 "KRW-SOL": {
   code: "KRW-SOL",
   label: "솔라나",
   symbol: "SOL",
   storagePrefix: "solPaper"
 }
};
const EMERGENCY_RECOVERY_KEY = "paperTrading.manualRecovery.20260702.v1";
const EMERGENCY_RECOVERY_PORTFOLIO_APPLIED_KEY = `${EMERGENCY_RECOVERY_KEY}.portfolioApplied`;
const EMERGENCY_RECOVERY_TRADES = [
 {
   id: "sqlite-recovered-trade-1",
   market: "KRW-BTC",
   side: "BUY",
   price: 151848038,
   btcAmount: 0.1316447697532977,
   krwAmount: 20000000,
   fee: 10000,
   realizedPnl: 0,
   realizedPnlRate: 0,
   krwBalanceAfter: 0,
   btcBalanceAfter: 0.1316447697532977,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-06-29 복구 매수",
   createdAt: "2026-06-29T00:15:00.000Z"
 },
 {
   id: "manual-recovery-20260702-2",
   market: "KRW-BTC",
   side: "SELL",
   price: 152038000,
   btcAmount: 0.1316447697532977,
   krwAmount: 20015007.503751874,
   fee: 10007.503751875936,
   realizedPnl: 4999.999999996275,
   realizedPnlRate: 0.024999999999981374,
   krwBalanceAfter: 20005000,
   btcBalanceAfter: 0,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-06-29 복구 매도",
   createdAt: "2026-06-29T01:05:00.000Z"
 },
 {
   id: "manual-recovery-20260702-3",
   market: "KRW-BTC",
   side: "BUY",
   price: 151848038,
   btcAmount: 0.1316447697532977,
   krwAmount: 20000000,
   fee: 10000,
   realizedPnl: 0,
   realizedPnlRate: 0,
   krwBalanceAfter: 4999.999999996275,
   btcBalanceAfter: 0.1316447697532977,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-06-30 복구 매수",
   createdAt: "2026-06-30T00:20:00.000Z"
 },
 {
   id: "manual-recovery-20260702-4",
   market: "KRW-BTC",
   side: "SELL",
   price: 152456000,
   btcAmount: 0.1316447697532977,
   krwAmount: 20070035.017508753,
   fee: 10035.017508754376,
   realizedPnl: 60000,
   realizedPnlRate: 0.3,
   krwBalanceAfter: 20065000,
   btcBalanceAfter: 0,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-06-30 복구 매도",
   createdAt: "2026-06-30T02:00:00.000Z"
 },
 {
   id: "manual-recovery-20260702-5",
   market: "KRW-BTC",
   side: "BUY",
   price: 151848038,
   btcAmount: 0.1316447697532977,
   krwAmount: 20000000,
   fee: 10000,
   realizedPnl: 0,
   realizedPnlRate: 0,
   krwBalanceAfter: 64999.999999996275,
   btcBalanceAfter: 0.1316447697532977,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-07-01 복구 매수",
   createdAt: "2026-07-01T00:10:00.000Z"
 },
 {
   id: "manual-recovery-20260702-6",
   market: "KRW-BTC",
   side: "SELL",
   price: 152000000,
   btcAmount: 0.1316447697532977,
   krwAmount: 20010005.00250125,
   fee: 10005.002501250625,
   realizedPnl: 0,
   realizedPnlRate: 0,
   krwBalanceAfter: 20065000,
   btcBalanceAfter: 0,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-07-01 복구 매도",
   createdAt: "2026-07-01T01:30:00.000Z"
 },
 {
   id: "manual-recovery-20260702-7",
   market: "KRW-BTC",
   side: "BUY",
   price: 151848038,
   btcAmount: 0.1316447697532977,
   krwAmount: 20000000,
   fee: 10000,
   realizedPnl: 0,
   realizedPnlRate: 0,
   krwBalanceAfter: 64999.999999996275,
   btcBalanceAfter: 0.1316447697532977,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-07-02 복구 매수",
   createdAt: "2026-07-02T00:30:00.000Z"
 },
 {
   id: "manual-recovery-20260702-8",
   market: "KRW-BTC",
   side: "SELL",
   price: 154280000,
   btcAmount: 0.1316447697532977,
   krwAmount: 20310155.07753877,
   fee: 10155.077538769385,
   realizedPnl: 300000,
   realizedPnlRate: 1.5,
   krwBalanceAfter: 20365000,
   btcBalanceAfter: 0,
   avgEntryPrice: 151924000,
   avgBuyPriceAfter: 151924000,
   memo: "2026-07-02 복구 매도",
   createdAt: "2026-07-02T05:20:00.000Z"
 }
];
const EMERGENCY_RECOVERY_PORTFOLIO = {
 initialSeedKrw: 20000000,
 krwBalance: 20365000,
 btcBalance: 0,
 avgBuyPrice: 0,
 realizedPnl: 365000,
 feeRateBuy: 0.0004,
 feeRateSell: 0.0004,
 updatedAt: "2026-07-02T05:20:00.000Z"
};
const FUTURES_STORAGE_KEYS = {
 "KRW-BTC": LEGACY_BTC_FUTURES_STORAGE_KEY,
 "KRW-ETH": "paperTrading.futures.ethkrw.bithumb.v1"
};
const FUTURES_MARKETS = {
 "KRW-BTC": {
   ...MARKETS["KRW-BTC"],
   label: "비트코인 무기한 선물",
   chartSource: "BINANCE",
   binanceSymbol: "BTCUSDT",
   priceCurrency: "USDT",
   priceDecimals: 2
 },
 "KRW-ETH": {
   ...MARKETS["KRW-ETH"],
   label: "이더리움 무기한 선물",
   chartSource: "BINANCE",
   binanceSymbol: "ETHUSDT",
   priceCurrency: "USDT",
   priceDecimals: 2
 },
 "KRW-XRP": {
   ...MARKETS["KRW-XRP"],
   label: "리플 무기한 선물",
   chartSource: "BINANCE",
   binanceSymbol: "XRPUSDT",
   priceCurrency: "USDT",
   priceDecimals: 4
 },
 "KRW-DOGE": {
   ...MARKETS["KRW-DOGE"],
   label: "도지코인 무기한 선물",
   chartSource: "BINANCE",
   binanceSymbol: "DOGEUSDT",
   priceCurrency: "USDT",
   priceDecimals: 5
 },
 "KRW-SOL": {
   ...MARKETS["KRW-SOL"],
   label: "솔라나 무기한 선물",
   chartSource: "BINANCE",
   binanceSymbol: "SOLUSDT",
   priceCurrency: "USDT",
   priceDecimals: 3
 }
};
const RETIRED_FUTURES_MARKETS = {};
const FUTURES_HISTORY_MARKETS = { ...FUTURES_MARKETS, ...RETIRED_FUTURES_MARKETS };
const API_BASE = "https://api.upbit.com/v1";
const BITHUMB_API_BASE = "https://api.bithumb.com/v1";
const BITHUMB_WS_URL = "wss://ws-api.bithumb.com/websocket/v1";
const BINANCE_FUTURES_API_BASES = ["https://fapi.binance.com", "https://fapi1.binance.com", "https://fapi2.binance.com"];
const BINANCE_FUTURES_WS_BASE = "wss://fstream.binance.com/stream";
const WS_URL = "wss://api.upbit.com/websocket/v1";
const USD_KRW_RATE_URL = "https://open.er-api.com/v6/latest/USD";
const DEFAULT_SEED = 20000000;
const DEFAULT_USD_KRW_RATE = 1500;
const DEFAULT_FUTURES_USDT = 200;
const DEFAULT_FUTURES_MARGIN = 100;
const FIBONACCI_LEVELS = [
 { ratio: 0, label: "0%" },
 { ratio: 0.236, label: "23.6%" },
 { ratio: 0.382, label: "38.2%" },
 { ratio: 0.5, label: "50%" },
 { ratio: 0.618, label: "61.8%" },
 { ratio: 0.786, label: "78.6%" },
 { ratio: 1, label: "100%" }
];
const FIBONACCI_COLOR = "#FF9800";
const FUTURES_BTC_DECIMALS = 8;
const FUTURES_BTC_EPSILON = 1e-8;
const FUTURES_CANDLE_LIMIT = 1000;
const FUTURES_MIN_VISIBLE_CANDLES = 60;
const FUTURES_MAX_VISIBLE_CANDLES = 1000;
const DAILY_SMA_HISTORY_LIMIT = 420;
const DAILY_SMA_REFRESH_MS = 15 * 60 * 1000;
const FUTURES_CHART_ZOOM_ANIMATION_MS = 320;
const FUTURES_PRICE_SCALE_ANIMATION_MS = 320;
const FUTURES_EXCHANGE_RATE_TIMEOUT_MS = 5000;
const FUTURES_LEVERAGES = [10, 15, 20, 30, 50];
const DEFAULT_FUTURES_LEVERAGE = FUTURES_LEVERAGES[0];
const FUTURES_PRICE_SOURCE = "BITHUMB_KRW";
const BINANCE_FUTURES_PRICE_SOURCE = "BINANCE_USDT_PERPETUAL";
const FUTURES_FEE_RATE = 0.0005;
const FUTURES_MARGIN_MODE = "ISOLATED";
const FUTURES_MAX_POSITIONS_PER_MARKET = 1;
const FUTURES_ENTRY_RULE_CANCELLED = "FUTURES_ENTRY_RULE_CANCELLED";
const FUTURES_TICK_STORAGE_PREFIX = "paperTrading.futures.tradeTicks.v1";
const FUTURES_MAX_STORED_TICKS = 20000;
const FUTURES_WS_STALE_MS = 15000;
const FUTURES_WS_WATCHDOG_MS = 5000;
const FUTURES_WS_RECONNECT_MS = 1500;
const FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS = 60;
const FUTURES_OFFLINE_REPLAY_PAGE_LIMIT = 1000;
const FUTURES_OFFLINE_REPLAY_MAX_PAGES = 100;
const FUTURES_OFFLINE_REPLAY_REAUDIT_MS = 6 * 60 * 60 * 1000;
const FUTURES_MISSED_FILL_REPAIR_20260730 = {
 entry20Id: "flo-1785334478709-f51ff6e4b09b28",
 entry30Id: "flo-1785343152351-c00db502883758",
 position20Id: "fp-1785159751838-30a9048cffc598",
 position30Id: "fp-1785334112135-d1c951be534318",
 position30BlockId: "fpb-fp-1785334112135-d1c951be534318",
 closeTradeIds: [
   "ft-1785348013294-0f395f051348f",
   "ft-1785348140312-7dbbc25a8aa988"
 ],
 entry20At: "2026-07-29T16:43:35.050Z",
 entry30At: "2026-07-29T16:43:35.000Z"
};
const FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_20260731 = {
 positions: [
   {
     positionId: "fp-1785501314661-1e9fa6065c03e",
     blockId: "fpb-fp-1785501314661-1e9fa6065c03e",
     tradeId: "ft-1785501325988-ade93f4823eda8"
   },
   {
     positionId: "fp-1785501340442-8bf7aa3e3b47a8",
     blockId: "fpb-fp-1785501340442-8bf7aa3e3b47a8",
     tradeId: "ft-1785501348450-81fc1d32a5f648"
   }
 ]
};
const FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_KEY = "paperTrading.futures.repair.accidentalPartialClose20260731.v1";
const CANDLE_LOAD_LIMIT = 600;
const CANDLE_PAGE_SIZE = 200;
const RANGE_ASSISTANT_CANDLE_COUNT = 1000;
const RANGE_ASSISTANT_ATR_PERIOD = 14;
const RANGE_ASSISTANT_VISIBLE_LEVELS_PER_SIDE = 5;
const RANGE_ASSISTANT_REACTION_TOUCH_ATR_MULTIPLIER = 0.35;
const RANGE_ASSISTANT_REACTION_TOUCH_PRICE_RATIO = 0.0008;
const RANGE_ASSISTANT_REACTION_MAX_ATR_MULTIPLIER = 0.70;
const RANGE_ASSISTANT_REACTION_MAX_PRICE_RATIO = 0.002;
const RANGE_ASSISTANT_REACTION_MOVE_ATR_MULTIPLIER = 0.60;
const RANGE_ASSISTANT_REACTION_BREAK_ATR_MULTIPLIER = 0.25;
const RANGE_ASSISTANT_REACTION_BREAK_PRICE_RATIO = 0.0004;
const RANGE_ASSISTANT_REACTION_LOOKAHEAD_BARS = 3;
const RANGE_ASSISTANT_REACTION_MIN_BAR_GAP = 4;
const RANGE_ASSISTANT_MIN_INDEPENDENT_REACTIONS = 3;
const RANGE_ASSISTANT_REACTION_DUPLICATE_OVERLAP_RATIO = 0.5;
const RANGE_ASSISTANT_REACTION_DUPLICATE_EVENT_BAR_TOLERANCE = 1;
const RANGE_ASSISTANT_DISPLAY_SPACING_FIVE_ATR_MULTIPLIER = 1.5;
const RANGE_ASSISTANT_DISPLAY_SPACING_PRICE_RATIO = 0.0015;
const RANGE_ASSISTANT_STORAGE_KEY = "paperTrading.rangeAssistant.enabled.v1";
const FUTURES_USER_CHART_OVERLAYS_VISIBLE_KEY = "paperTrading.futures.userChartOverlays.visible.v1";
const RANGE_ASSISTANT_REFRESH_GRACE_MS = 3500;
const RANGE_ASSISTANT_MAX_CACHE_ENTRIES = 12;
const MARKET_TICKER_REFRESH_MS = 1000;
const FUTURES_BACKGROUND_TICKER_REFRESH_MS = 5000;
const DEFAULT_VISIBLE_CANDLES = 60;
const MIN_VISIBLE_CANDLES = 60;
const VISIBLE_CANDLE_STEP = 20;
const CHART_PRICE_PAN_STEP_RATIO = 0.12;
const CHART_MAX_PRICE_PAN_RATIO = 5;
const PRICE_SCALE_PADDING_RATIO = 0.08;
const PRICE_SCALE_ZOOMED_PADDING_RATIO = 0.06;
const MIN_PRICE_SCALE_PADDING_RATIO = 0.0006;
const MIN_PRICE_SCALE_ZOOMED_PADDING_RATIO = 0.00035;
const PRICE_SCALE_OVERLAY_MARGIN_RATIO = 0.35;
const PRICE_SCALE_MIN_OVERLAY_MARGIN_RATIO = 0.0012;
const CHART_ZOOM_ANIMATION_MS = 190;
const PRICE_SCALE_ANIMATION_MS = 220;
const KST_TIME_ZONE = "Asia/Seoul";
const DEFAULT_REWARD_RATIO = 0.1;
const DEFAULT_RISK_RATIO = 0.1;
const DEFAULT_RISK_PERCENT = 1;
const DEFAULT_RISK_BLOCK_WIDTH = 32;
const MIN_RISK_BLOCK_WIDTH = 4;
const DEFAULT_FUTURE_CANDLES = 36;
const DEFAULT_CHART_RIGHT_MARGIN_CANDLES = 32;
const ONE_MINUTE_RISK_BLOCK_WIDTH = 15;
const ONE_MINUTE_CHART_RIGHT_MARGIN_CANDLES = 8;
const ONE_MINUTE_MAX_FUTURE_AREA_RATIO = 0.4;
const RISK_HANDLE_SIZE = 8;
const TIMEFRAME_MINUTES = { "1": 1, "3": 3, "5": 5, "15": 15, "60": 60, "240": 240 };
const SPOT_TIMEFRAMES = new Set(["1", "3", "5", "15", "60", "240"]);
const EMA_CONFIGS = [
 {
   key: "ema20m",
   label: "20분 EMA",
   targetMinutes: 20,
   color: "#FFD400",
   defaultVisible: true
 },
 {
   key: "ema50m",
   label: "50분 EMA",
   targetMinutes: 50,
   color: "#FF9800",
   defaultVisible: true
 },
 {
   key: "ema90m",
   label: "1시간30분 EMA",
   targetMinutes: 90,
   color: "#9C27B0",
   defaultVisible: true
 }
];
const DAILY_SMA_CONFIGS = [
 {
   key: "sma10d",
   label: "10일선",
   periodDays: 10,
   color: "#22C55E",
   defaultVisible: false,
   type: "daily-sma"
 },
 {
   key: "sma30d",
   label: "30일선",
   periodDays: 30,
   color: "#3B82F6",
   defaultVisible: false,
   type: "daily-sma"
 },
 {
   key: "sma50d",
   label: "50일선",
   periodDays: 50,
   color: "#00E5FF",
   defaultVisible: false,
   type: "daily-sma"
 },
 {
   key: "sma100d",
   label: "100일선",
   periodDays: 100,
   color: "#E879F9",
   defaultVisible: false,
   type: "daily-sma"
 },
 {
   key: "sma200d",
   label: "200일선",
   periodDays: 200,
   color: "#F43F5E",
   defaultVisible: false,
   type: "daily-sma"
 }
];
const MOVING_AVERAGE_CONFIGS = [...EMA_CONFIGS, ...DAILY_SMA_CONFIGS];
const BOLLINGER_CONFIG = {
 key: "bollinger20",
 label: "볼린저밴드",
 period: 20,
 multiplier: 2,
 color: "#38bdf8",
 middleColor: "rgba(125, 211, 252, 0.58)",
 fillColor: "rgba(56, 189, 248, 0.045)",
 defaultVisible: false
};
function createEmptyChartDataStats(context = "") {
 return {
   context,
   duplicateTimestampCount: 0,
   missingTimestampCount: 0,
   invalidOhlcCount: 0,
   openContinuityFixCount: 0,
   inputCount: 0,
   outputCount: 0
 };
}
function readRangeAssistantPreference() {
 try {
   return localStorage.getItem(RANGE_ASSISTANT_STORAGE_KEY) === "true";
 } catch (error) {
   return false;
 }
}
function readUserChartOverlaysVisibility() {
 try {
   return localStorage.getItem(FUTURES_USER_CHART_OVERLAYS_VISIBLE_KEY) !== "false";
 } catch (error) {
   return true;
 }
}
function createDefaultRangeAssistantState() {
 return {
   enabled: readRangeAssistantPreference(),
   loading: false,
   error: "",
   statusMessage: "",
   contextKey: "",
   analysisKey: "",
   zones: [],
   visibleLevels: [],
   currentFiveMinuteAtr: 0,
   supportCandidateCount: 0,
   resistanceCandidateCount: 0,
   candleCounts: { five: 0, fifteen: 0 },
   lastFiveMinuteTimestamp: 0,
   lastFifteenMinuteTimestamp: 0,
   lastCalculatedAt: 0,
   cache: new Map(),
   requestId: 0,
   refreshTimer: null
 };
}
const state = {
 marketMode: "futures",
 market: DEFAULT_MARKET,
 timeframe: "1",
 ticker: null,
 marketTickers: {},
 sharedAccount: createDefaultSharedAccount(DEFAULT_SEED),
 candles: [],
 portfolio: createDefaultPortfolio(DEFAULT_SEED),
 trades: [],
 dailySummaries: [],
 expandedDailySummaryDate: null,
 futuresHistoryView: "position",
 expandedFuturesHistoryWeek: null,
 expandedFuturesHistoryDate: null,
 futuresSeedGraphWidth: 1,
 futuresSeedGraphLastWheelAt: 0,
 dashboardMemos: ["", ""],
 trendlines: createEmptyTrendlines(),
 riskBlocks: createEmptyRiskBlocks(),
 futures: createDefaultFuturesState(),
 riskSettings: {
   rewardRatio: DEFAULT_REWARD_RATIO,
   riskRatio: DEFAULT_RISK_RATIO
 },
 rangeAssistant: createDefaultRangeAssistantState(),
 ws: null,
 reconnectTimer: null,
 fallbackTimer: null,
 marketTickerTimer: null,
 candleRefreshTimer: null,
 dailyArchiveTimer: null,
 socketClosing: false,
 loadingCandles: false,
 confirm: null,
 toastTimer: null,
 chart: {
   ctx: null,
   metrics: null,
   visibleCandles: [],
   hover: null,
   pendingPoint: null,
   selectedTrendlineId: null,
   selectedRiskBlockId: null,
   draggingRiskBlock: null,
   draggingFibonacci: null,
   draggingChartPan: null,
   suppressNextClick: false,
   trendMode: false,
   horizontalMode: false,
   fibonacciMode: false,
   riskMode: false,
   percentMeasureMode: false,
   percentMeasureStart: null,
   percentMeasurement: null,
    limitOrderMode: null,
     exitOrderPositionId: "",
     exitOrderAmountUnits: 0,
     exitOrderQuantity: 0,
     exitOrderInputMode: "MARGIN",
     positionFilterId: "",
    trendColor: "#38bdf8",
   userOverlaysVisible: readUserChartOverlaysVisibility(),
   emaVisible: createDefaultEmaVisibility(),
   dailyMaCandles: [],
   dailyMaContextKey: "",
   dailyMaLoading: false,
   dailyMaError: "",
   dailyMaLoadedAt: 0,
   dailyMaRequestId: 0,
   bollingerVisible: BOLLINGER_CONFIG.defaultVisible,
   includeLiveCandleInAnalysis: false,
   lastDataStats: createEmptyChartDataStats("initial"),
   lastDataWarningSignature: "",
   lastDebugStats: null,
   visibleCount: DEFAULT_VISIBLE_CANDLES,
   renderedVisibleCount: DEFAULT_VISIBLE_CANDLES,
   panOffset: 0,
   pricePanRatio: 0,
   zoomAnimation: {
     frame: null,
     fromCount: DEFAULT_VISIBLE_CANDLES,
     targetCount: DEFAULT_VISIBLE_CANDLES,
     startedAt: 0,
     duration: CHART_ZOOM_ANIMATION_MS
   },
   priceScaleAnimation: {
     frame: null,
     minPrice: null,
     maxPrice: null,
     fromMinPrice: null,
     fromMaxPrice: null,
     targetMinPrice: null,
     targetMaxPrice: null,
     startedAt: 0,
     duration: PRICE_SCALE_ANIMATION_MS,
     animateNext: false
   },
   size: { width: 0, height: 0, dpr: 1 }
 }
};
const el = {};
let futuresLiveFrame = null;
let futuresBackgroundTickerRefreshAt = 0;
let futuresBackgroundTickerRefreshRunning = false;
let futuresStorageRevision = 0;
let futuresStorageLastSavedAt = "";
let futuresStorageConflict = false;
let futuresStorageWarningShown = false;
let futuresEntryInputMode = "MARGIN";
let futuresLimitOrderSettledIds = new Set();
let futuresLimitOrderJournalLoaded = false;
let futuresLimitOrderJournalRecoveryPending = false;
let futuresExitOrderSettledIds = new Set();
let futuresExitOrderJournalLoaded = false;
let futuresExitOrderJournalRecoveryPending = false;
let futuresOfflineReplayRunning = false;
let futuresOfflineReplaySummary = null;
let futuresLiveBackupHandle = null;
let futuresLiveBackupHandlePersisted = false;
let futuresLiveBackupState = "disconnected";
let futuresLiveBackupMessage = "";
let futuresLiveBackupLastWrittenAt = "";
let futuresLiveBackupLastQueuedChecksum = "";
let futuresLiveBackupLastFileChecksum = "";
let futuresLiveBackupFileWaiters = [];
let futuresLiveBackupPending = null;
let futuresLiveBackupWriteRunning = false;
let futuresLiveBackupDbPromise = null;
let futuresLiveBackupInitialized = false;
let futuresLiveBackupRecoveryPending = false;
let futuresLiveBackupRetryTimer = null;
let futuresLiveBackupRetryCount = 0;
const triggeringFuturesLimitOrderIds = new Set();
const futuresLimitOrderRetryAt = new Map();
const triggeringFuturesExitOrderIds = new Set();
const futuresExitOrderRetryAt = new Map();
const pendingFuturesTriggeredOrders = new Map();
let futuresTriggeredOrderDrainRunning = false;
let futuresTriggeredOrderDrainTimer = null;
let futuresPendingOrderRecoveryTimer = null;
let futuresPendingOrderRecoveryRetryCount = 0;
let futuresLastPeriodicOrderRecoveryAt = 0;
const heldFuturesTriggerFailures = new Map();
const futuresOneMinuteOrderCandles = new Map();
const futuresOneMinuteKlineTriggerTimers = new Map();
let futuresOrderBaselineSaveTimer = null;
let futuresOrderBaselineSaveRetryCount = 0;
const FUTURES_TAB_ID = `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
document.addEventListener("DOMContentLoaded", init);
function init() {
 cacheElements();
 state.marketMode = "futures";
 if (!FUTURES_MARKETS[state.market]) state.market = DEFAULT_MARKET;
 loadFuturesState();
 const binanceUsdtResetApplied = applyBinanceUsdtResetOnce();
 const activeLedgerResetApplied = applyActiveFuturesLedgerResetOnce();
 const migratedFeePositionCount = applyFuturesFeeRateMigrationOnce();
 const historyWasReset = binanceUsdtResetApplied || activeLedgerResetApplied;
 const missedFillRepairApplied = historyWasReset ? false : repairMissedFuturesFills20260730();
 const accidentalPartialCloseRepairApplied = historyWasReset ? false : repairAccidentalPartialCloses20260731();
 loadChartIndicatorPreferences();
 restorePersistedFuturesTriggeredOrders();
 archivePastFuturesTradesIfNeeded();
 bindEvents();
 initChart();
 hydrateSettingsInputs();
 renderMarketLabels();
 renderAll();
 if (binanceUsdtResetApplied) {
   showToast("모든 매매를 초기화하고 초기 시드를 200 USDT로 설정했습니다.");
 }
 if (!binanceUsdtResetApplied && activeLedgerResetApplied) {
   showToast("초기화 이전 매매기록을 삭제하고 진행 중 포지션 기록만 새 장부에 보관합니다.");
 }
 if (!binanceUsdtResetApplied && migratedFeePositionCount > 0) {
   showToast(`보유 포지션 ${migratedFeePositionCount.toLocaleString("ko-KR")}개의 진입 수수료를 편도 0.05%, 왕복 0.1% 기준으로 변경했습니다.`);
 }
 if (missedFillRepairApplied) {
   showToast("누락된 예약 롱 2건과 이후 예약 청산 손익을 시간순으로 보정했습니다.");
   setTimeout(() => verifyFuturesTradeFileBackup("missed-limit-fill-history-repair"), 1500);
 }
 if (accidentalPartialCloseRepairApplied) {
   showToast("잘못 전량 청산된 최근 2개 포지션을 복구하고 해당 청산 거래를 삭제했습니다.");
   setTimeout(() => verifyFuturesTradeFileBackup("accidental-partial-close-rollback"), 1500);
 }
 initializeFuturesLiveBackup();
 loadFuturesCandles(state.timeframe);
 connectFuturesWebSocket();
 startCandleAutoRefresh();
 startMarketTickerRefresh();
 if (state.rangeAssistant.enabled) refreshRangeAssistantData();
 reconcilePendingFuturesOrdersFromOneMinuteHistory();
 window.addEventListener("online", () => schedulePendingFuturesOrderHistoryRecovery(0));
 window.addEventListener("pageshow", () => schedulePendingFuturesOrderHistoryRecovery(0));
 document.addEventListener("visibilitychange", () => {
   if (!document.hidden) schedulePendingFuturesOrderHistoryRecovery(0);
 });
}
function ensureUsdtSettingsMarkup() {
 const settingsModal = document.getElementById("settingsModal");
 const settingsGrid = settingsModal && settingsModal.querySelector(".settings-grid");
 if (settingsGrid) {
   settingsGrid.innerHTML = `
     <label>
       <span>초기 시드머니 (USDT)</span>
       <input id="seedInput" type="number" min="0.01" step="0.01" value="200" />
     </label>
      <section class="settings-policy-card" aria-label="고정 거래 설정">
        <strong>고정 거래 설정</strong>
        <div><span>증거금 방식</span><b>격리</b></div>
        <div><span>종목당 포지션</span><b>최대 1개</b></div>
        <p>같은 방향 추가 진입은 합산되며, 반대 방향은 기존 포지션을 전량 청산하기 전까지 차단됩니다.</p>
      </section>
     <p class="settings-help">새 시드를 적용하면 USDT 잔고가 해당 금액으로 바뀌고 모든 포지션·예약 주문·매매기록이 초기화됩니다.</p>
   `;
 }
 const actions = settingsModal && settingsModal.querySelector(".modal-actions");
 if (actions && !document.getElementById("applySeedBtn")) {
   const applyButton = document.createElement("button");
   applyButton.id = "applySeedBtn";
   applyButton.className = "primary-button danger-button";
   applyButton.type = "button";
   applyButton.textContent = "초기 시드 적용";
   actions.prepend(applyButton);
 }
}
function cacheElements() {
 ensureUsdtSettingsMarkup();
 [
   "connectionStatus",
   "marketDataSourceLabel",
   "spotCoinSwitcher",
   "spotModeBtn",
   "futuresModeBtn",
   "marketTitle",
   "priceLabel",
   "totalAssetLabel",
   "totalAssetDetail",
   "cashBalanceLabel",
   "allocationLabel",
   "unrealizedLabel",
   "realizedLabel",
   "winRateLabel",
   "statPrice",
   "statChange",
   "statTotalAsset",
   "statKrw",
   "statUnrealized",
   "statUnrealizedRate",
   "statRealized",
   "statTradeCount",
   "statWinRate",
   "statAvgRate",
   "holdingsAllocationSummary",
   "holdingsAllocationBar",
   "holdingsAllocationList",
   "dashboardMemoTwo",
   "tickerChangePrice",
   "tickerChangeRate",
   "tickerHigh",
   "tickerLow",
   "tickerAccTrade",
   "chartStatus",
   "chartPanel",
   "trendModeBtn",
   "horizontalModeBtn",
   "fibonacciModeBtn",
   "riskModeBtn",
    "percentMeasureBtn",
    "chartOverlaysToggleBtn",
    "chartPositionFilter",
    "chartPositionFilterButtons",
    "chartPositionFilterStatus",
    "rangeAssistantBtn",
   "rangeAssistantStatus",
   "riskRewardInput",
   "riskRiskInput",
   "riskRatioLabel",
   "trendColorInput",
   "deleteTrendBtn",
   "clearTrendBtn",
    "trendHint",
    "chartPanLeftBtn",
    "chartPanUpBtn",
    "chartZoomInBtn",
    "chartZoomOutBtn",
    "chartFitBtn",
    "chartPanDownBtn",
    "chartPanRightBtn",
   "chartVisibleRangeInput",
   "chartRangeLabel",
   "bollingerBandInput",
   "ohlcInfo",
   "chartDebugInfo",
   "chartCanvas",
   "chartTooltip",
   "chartEmpty",
   "buyAmountInput",
   "buyMemoInput",
   "buySubmitBtn",
   "sellAmountInput",
   "sellAmountLabel",
   "sellMemoInput",
   "sellSubmitBtn",
   "spotTradeControls",
   "futuresTradeControls",
   "futuresMarginInput",
   "futuresMarginLabel",
   "futuresOrderConversionHint",
   "futuresSelectedLeverage",
   "futuresLongBtn",
   "futuresShortBtn",
   "futuresLimitLongBtn",
   "futuresLimitShortBtn",
   "futuresLimitOrderHint",
   "futuresLimitOrdersList",
   "futuresPositionDetails",
   "futuresOpenPositionsBlock",
   "futuresOpenPositionsList",
   "tradeTableBody",
   "historyStatus",
   "historyViewSwitcher",
   "historyTableWrap",
   "historyTableHead",
   "historyPositionViewBtn",
   "historyDailyViewBtn",
   "historyGraphViewBtn",
   "historyGraphPanel",
   "historyGraphSummary",
   "historyGraphChart",
   "historyGraphNote",
   "historyGraphYAxis",
   "historyGraphXAxisLabel",
   "historyGraphWidthDecreaseBtn",
   "historyGraphWidthIncreaseBtn",
   "historyGraphWidthResetBtn",
   "historyGraphWidthLabel",
   "historyTimeHeader",
   "historyCoinHeader",
   "historySideHeader",
   "historyPriceHeader",
   "historyAmountHeader",
   "historyValueHeader",
   "historyFeeHeader",
   "historyPnlHeader",
   "historyRateHeader",
   "historyAvgHeader",
   "historyHoldingRateHeader",
   "historyBalanceHeader",
   "historyMemoHeader",
   "csvDownloadBtn",
   "futuresFullBackupBtn",
   "futuresLiveBackupBar",
   "futuresLiveBackupStatus",
   "futuresLiveBackupBtn",
   "futuresRestoreBtn",
   "futuresRestoreFileInput",
   "clearTradesBtn",
   "helpOpenBtn",
   "helpCloseBtn",
   "helpDoneBtn",
   "helpModal",
   "settingsOpenBtn",
   "settingsCloseBtn",
   "settingsModal",
   "seedInput",
   "settingsSaveBtn",
   "applySeedBtn",
   "resetOpenBtn",
   "resetCloseBtn",
   "resetModal",
   "resetTradesOnlyBtn",
   "resetTrendlinesOnlyBtn",
   "resetAllBtn",
   "confirmModal",
   "confirmTitle",
   "confirmMessage",
   "confirmPhraseWrap",
   "confirmPhraseLabel",
   "confirmPhraseInput",
   "confirmCancelBtn",
   "confirmCloseBtn",
   "confirmOkBtn",
   "toast"
 ].forEach((id) => {
   el[id] = document.getElementById(id);
 });
 el.timeframeButtons = Array.from(document.querySelectorAll(".timeframe-btn"));
 el.marketModeButtons = Array.from(document.querySelectorAll("[data-market-mode]"));
 el.marketButtons = Array.from(document.querySelectorAll("[data-market]"));
 el.emaInputs = Array.from(document.querySelectorAll("[data-ema-key]"));
 el.buyPercentButtons = Array.from(document.querySelectorAll("[data-buy-percent]"));
 el.sellPercentButtons = Array.from(document.querySelectorAll("[data-sell-percent]"));
 el.futuresLeverageButtons = Array.from(document.querySelectorAll("[data-futures-leverage]"));
 el.historyViewButtons = Array.from(document.querySelectorAll("[data-history-view]"));
}
function bindEvents() {
 window.addEventListener("storage", handleFuturesStorageEvent);
 el.marketModeButtons.forEach((button) => {
   button.addEventListener("click", () => switchMarketMode(button.dataset.marketMode));
 });
 el.marketButtons.forEach((button) => {
   button.addEventListener("click", () => {
     switchMarket(button.dataset.market);
   });
 });
 el.timeframeButtons.forEach((button) => {
   button.addEventListener("click", () => {
     const next = button.dataset.timeframe;
     if (button.dataset.futuresOnlyTimeframe === "true" && !isFuturesMode()) return;
     if (!next || next === state.timeframe) return;
     state.timeframe = next;
     state.chart.pendingPoint = null;
      state.chart.selectedTrendlineId = null;
      state.chart.selectedRiskBlockId = null;
      state.chart.draggingRiskBlock = null;
      state.chart.draggingFibonacci = null;
      state.chart.draggingChartPan = null;
      state.chart.panOffset = 0;
      state.chart.pricePanRatio = 0;
     state.chart.percentMeasureMode = false;
     state.chart.percentMeasureStart = null;
     state.chart.percentMeasurement = null;
     state.chart.limitOrderMode = null;
     state.chart.exitOrderPositionId = "";
     resetChartAnimations();
     renderTimeframeButtons();
     updateTrendControls();
     renderRiskControls();
     if (isFuturesMode()) {
       loadFuturesCandles(next);
       connectFuturesWebSocket();
     } else {
       loadCandles(next);
     }
     startCandleAutoRefresh();
   });
 });
 el.historyViewButtons.forEach((button) => {
   button.addEventListener("click", () => setFuturesHistoryView(button.dataset.historyView));
 });
 if (el.historyGraphWidthDecreaseBtn) {
   el.historyGraphWidthDecreaseBtn.addEventListener("click", () => changeFuturesSeedGraphWidth(-0.5));
 }
 if (el.historyGraphWidthIncreaseBtn) {
   el.historyGraphWidthIncreaseBtn.addEventListener("click", () => changeFuturesSeedGraphWidth(0.5));
 }
 if (el.historyGraphWidthResetBtn) {
   el.historyGraphWidthResetBtn.addEventListener("click", resetFuturesSeedGraphWidth);
 }
 if (el.historyGraphChart) {
   el.historyGraphChart.addEventListener("wheel", handleFuturesSeedGraphWheel, { passive: false });
 }
 el.trendModeBtn.addEventListener("click", toggleTrendMode);
 el.horizontalModeBtn.addEventListener("click", toggleHorizontalMode);
 if (el.fibonacciModeBtn) el.fibonacciModeBtn.addEventListener("click", toggleFibonacciMode);
 el.riskModeBtn.addEventListener("click", toggleRiskMode);
  if (el.percentMeasureBtn) el.percentMeasureBtn.addEventListener("click", togglePercentMeasureMode);
  if (el.chartOverlaysToggleBtn) el.chartOverlaysToggleBtn.addEventListener("click", toggleUserChartOverlays);
  if (el.chartPositionFilterButtons) {
    el.chartPositionFilterButtons.addEventListener("click", (event) => {
      const button = event.target.closest("[data-chart-position-filter]");
      if (button) setChartPositionFilter(button.dataset.chartPositionFilter);
    });
  }
  if (el.rangeAssistantBtn) el.rangeAssistantBtn.addEventListener("click", toggleRangeAssistant);
 el.riskRewardInput.addEventListener("input", handleRiskRatioInput);
 el.riskRiskInput.addEventListener("input", handleRiskRatioInput);
 el.trendColorInput.addEventListener("input", () => {
   state.chart.trendColor = el.trendColorInput.value || "#38bdf8";
 });
  el.deleteTrendBtn.addEventListener("click", deleteSelectedDrawing);
  el.clearTrendBtn.addEventListener("click", confirmClearChartDrawings);
  el.chartPanLeftBtn.addEventListener("click", () => changeChartPanOffset(chartPanPageStep()));
  el.chartPanUpBtn.addEventListener("click", () => changeChartPricePan(-CHART_PRICE_PAN_STEP_RATIO));
  el.chartZoomInBtn.addEventListener("click", () => changeChartVisibleCount(-VISIBLE_CANDLE_STEP));
  el.chartZoomOutBtn.addEventListener("click", () => changeChartVisibleCount(VISIBLE_CANDLE_STEP));
  el.chartFitBtn.addEventListener("click", fitChartToLoadedData);
  el.chartPanDownBtn.addEventListener("click", () => changeChartPricePan(CHART_PRICE_PAN_STEP_RATIO));
  el.chartPanRightBtn.addEventListener("click", () => changeChartPanOffset(-chartPanPageStep()));
 el.chartVisibleRangeInput.addEventListener("input", () => {
   setChartVisibleCount(Number(el.chartVisibleRangeInput.value));
 });
 el.emaInputs.forEach((input) => {
   input.addEventListener("change", () => {
     const key = input.dataset.emaKey;
     if (!key) return;
     state.chart.emaVisible[key] = input.checked;
     saveEmaVisibility();
     drawChart();
   });
 });
 if (el.bollingerBandInput) {
   el.bollingerBandInput.addEventListener("change", () => {
     state.chart.bollingerVisible = el.bollingerBandInput.checked;
     saveBollingerVisibility();
     drawChart();
   });
 }
 if (el.dashboardMemoTwo) {
   el.dashboardMemoTwo.addEventListener("input", () => updateDashboardMemo(1, el.dashboardMemoTwo.value));
 }
 el.buyPercentButtons.forEach((button) => {
   button.addEventListener("click", () => fillBuyPercent(Number(button.dataset.buyPercent)));
 });
 el.sellPercentButtons.forEach((button) => {
   button.addEventListener("click", () => fillSellPercent(Number(button.dataset.sellPercent)));
 });
 el.futuresLeverageButtons.forEach((button) => {
   button.addEventListener("click", () => setFuturesLeverage(Number(button.dataset.futuresLeverage)));
 });
 if (el.futuresMarginInput) {
   el.futuresMarginInput.addEventListener("input", handleFuturesMarginInput);
   el.futuresMarginInput.addEventListener("change", handleFuturesMarginInput);
 }
 el.buySubmitBtn.addEventListener("click", placeBuyOrder);
 el.sellSubmitBtn.addEventListener("click", placeSellOrder);
 el.futuresLongBtn.addEventListener("click", () => openFuturesPosition("LONG"));
 el.futuresShortBtn.addEventListener("click", () => openFuturesPosition("SHORT"));
 if (el.futuresLimitLongBtn) el.futuresLimitLongBtn.addEventListener("click", () => toggleFuturesLimitOrderMode("LONG"));
 if (el.futuresLimitShortBtn) el.futuresLimitShortBtn.addEventListener("click", () => toggleFuturesLimitOrderMode("SHORT"));
 if (el.futuresLimitOrdersList) {
   el.futuresLimitOrdersList.addEventListener("click", (event) => {
     const confirmButton = event.target.closest("[data-confirm-futures-completed-order]");
     if (confirmButton) {
       acknowledgeFuturesCompletedOrder(confirmButton.dataset.confirmFuturesCompletedOrder);
       return;
     }
     const button = event.target.closest("[data-cancel-futures-limit-order]");
     if (button) cancelFuturesLimitOrder(button.dataset.cancelFuturesLimitOrder);
   });
 }
  if (el.futuresOpenPositionsList) {
   el.futuresOpenPositionsList.addEventListener("input", (event) => {
     const exitOrderAmountInput = event.target.closest("[data-futures-exit-order-amount]");
     if (exitOrderAmountInput) {
       handleFuturesExitOrderAmountInput(exitOrderAmountInput);
       return;
     }
     const partialAmountInput = event.target.closest("[data-partial-close-amount]");
     if (partialAmountInput) {
       handleFuturesPartialCloseAmountInput(partialAmountInput);
       return;
     }
     const input = event.target.closest("[data-futures-position-memo-id]");
     if (!input) return;
     updateFuturesPositionMemo(input.dataset.futuresPositionMemoId, input.value);
    });
    el.futuresOpenPositionsList.addEventListener("click", (event) => {
      const chartFilterButton = event.target.closest("[data-position-chart-filter]");
      if (chartFilterButton) {
        const positionId = chartFilterButton.dataset.positionChartFilter;
        setChartPositionFilter(
          state.chart.positionFilterId === positionId ? "" : positionId
        );
        return;
      }
      const confirmCompletedOrderButton = event.target.closest("[data-confirm-futures-completed-order]");
     if (confirmCompletedOrderButton) {
       acknowledgeFuturesCompletedOrder(confirmCompletedOrderButton.dataset.confirmFuturesCompletedOrder);
       return;
     }
     const cancelExitOrderButton = event.target.closest("[data-cancel-futures-exit-order]");
     if (cancelExitOrderButton) {
       cancelFuturesExitOrder(cancelExitOrderButton.dataset.cancelFuturesExitOrder);
       return;
     }
     const exitOrderButton = event.target.closest("[data-futures-exit-order-position]");
     if (exitOrderButton) {
       const card = exitOrderButton.closest(".futures-open-position-card");
       const amountInput = card ? card.querySelector("[data-futures-exit-order-amount]") : null;
       const positionId = exitOrderButton.dataset.futuresExitOrderPosition;
       toggleFuturesExitOrderMode(
         positionId,
         {
           inputMode: "MARGIN",
           amountUnits: amountInput ? amountInput.value : ""
         }
       );
       return;
     }
     const partialButton = event.target.closest("[data-partial-close-futures-position]");
     if (partialButton) {
       const id = partialButton.dataset.partialCloseFuturesPosition;
       const card = partialButton.closest(".futures-open-position-card");
       const amountInput = card ? card.querySelector("[data-partial-close-amount]") : null;
       closeFuturesPosition(id, amountInput ? amountInput.value : "", {
         inputMode: "MARGIN",
         partialCloseOnly: true
       });
       return;
     }
     const button = event.target.closest("[data-close-futures-position]");
     if (button) closeFuturesPosition(button.dataset.closeFuturesPosition);
    });
  }
  if (el.futuresPositionDetails) {
    el.futuresPositionDetails.addEventListener("click", (event) => {
      const confirmCompletedOrderButton = event.target.closest("[data-confirm-futures-completed-order]");
      if (confirmCompletedOrderButton) {
        acknowledgeFuturesCompletedOrder(confirmCompletedOrderButton.dataset.confirmFuturesCompletedOrder);
        return;
      }
      const cancelExitOrderButton = event.target.closest("[data-cancel-futures-exit-order]");
      if (cancelExitOrderButton) {
        cancelFuturesExitOrder(cancelExitOrderButton.dataset.cancelFuturesExitOrder);
        return;
      }
      const chartFilterButton = event.target.closest("[data-position-chart-filter]");
      if (!chartFilterButton) return;
      const positionId = chartFilterButton.dataset.positionChartFilter;
      setChartPositionFilter(
        state.chart.positionFilterId === positionId ? "" : positionId
      );
    });
  }
 el.csvDownloadBtn.addEventListener("click", downloadTradesCsv);
 if (el.futuresFullBackupBtn) el.futuresFullBackupBtn.addEventListener("click", downloadFuturesFullBackup);
 if (el.futuresLiveBackupBtn) el.futuresLiveBackupBtn.addEventListener("click", connectFuturesLiveBackupFile);
 if (el.futuresRestoreBtn && el.futuresRestoreFileInput) {
   el.futuresRestoreBtn.addEventListener("click", () => el.futuresRestoreFileInput.click());
   el.futuresRestoreFileInput.addEventListener("change", handleFuturesRestoreFile);
 }
 el.clearTradesBtn.addEventListener("click", confirmClearTrades);
 el.tradeTableBody.addEventListener("input", (event) => {
   const input = event.target.closest("[data-memo-id], [data-futures-memo-id], [data-futures-position-block-memo-id]");
   if (!input) return;
   if (input.dataset.futuresPositionBlockMemoId) {
     updateFuturesPositionBlockMemoDraft(input.dataset.futuresPositionBlockMemoId, input.value);
     return;
   }
   if (input.dataset.futuresMemoId) {
     updateFuturesTradeMemoDraft(input.dataset.futuresMemoId, input.value);
     return;
   }
   updateTradeMemoDraft(input.dataset.memoId, input.value);
 });
 el.tradeTableBody.addEventListener("change", (event) => {
   const input = event.target.closest("[data-memo-id], [data-futures-memo-id], [data-futures-position-block-memo-id]");
   if (!input) return;
   if (input.dataset.futuresPositionBlockMemoId) {
     updateFuturesPositionBlockMemo(input.dataset.futuresPositionBlockMemoId, input.value);
     return;
   }
   if (input.dataset.futuresMemoId) {
     updateFuturesTradeMemo(input.dataset.futuresMemoId, input.value);
     return;
   }
   updateTradeMemo(input.dataset.memoId, input.value);
 });
 el.tradeTableBody.addEventListener("click", (event) => {
   const futuresHistoryWeekButton = event.target.closest("[data-futures-history-week]");
   if (futuresHistoryWeekButton && el.tradeTableBody.contains(futuresHistoryWeekButton)) {
     toggleFuturesHistoryWeekDetails(futuresHistoryWeekButton.dataset.futuresHistoryWeek);
     return;
   }
   const positionBlockButton = event.target.closest("[data-futures-position-block-id]");
   if (positionBlockButton && el.tradeTableBody.contains(positionBlockButton)) {
     toggleFuturesPositionBlockDetails(positionBlockButton.dataset.futuresPositionBlockId);
     return;
   }
   const futuresHistoryDateButton = event.target.closest("[data-futures-history-date]");
   if (futuresHistoryDateButton && el.tradeTableBody.contains(futuresHistoryDateButton)) {
     toggleFuturesHistoryDateDetails(futuresHistoryDateButton.dataset.futuresHistoryDate);
     return;
   }
   const button = event.target.closest("[data-daily-summary-date]");
   if (!button || !el.tradeTableBody.contains(button)) return;
   toggleDailySummaryDetails(button.dataset.dailySummaryDate);
 });
 if (el.helpOpenBtn) el.helpOpenBtn.addEventListener("click", () => openModal(el.helpModal));
 if (el.helpCloseBtn) el.helpCloseBtn.addEventListener("click", () => closeModal(el.helpModal));
 if (el.helpDoneBtn) el.helpDoneBtn.addEventListener("click", () => closeModal(el.helpModal));
 el.settingsOpenBtn.addEventListener("click", () => {
   hydrateSettingsInputs();
   openModal(el.settingsModal);
 });
 el.settingsCloseBtn.addEventListener("click", () => closeModal(el.settingsModal));
 el.settingsSaveBtn.addEventListener("click", saveSettings);
 el.applySeedBtn.addEventListener("click", confirmApplySeed);
 el.resetOpenBtn.addEventListener("click", () => openModal(el.resetModal));
 el.resetCloseBtn.addEventListener("click", () => closeModal(el.resetModal));
 el.resetTradesOnlyBtn.addEventListener("click", confirmClearTrades);
 el.resetTrendlinesOnlyBtn.addEventListener("click", confirmClearTrendlines);
 el.resetAllBtn.addEventListener("click", confirmResetAll);
 el.confirmCancelBtn.addEventListener("click", runConfirmCancelAction);
 el.confirmCloseBtn.addEventListener("click", closeConfirm);
 el.confirmOkBtn.addEventListener("click", runConfirmAction);
 el.confirmPhraseInput.addEventListener("input", updateConfirmOkState);
 el.chartCanvas.addEventListener("mousedown", handleChartMouseDown);
 el.chartCanvas.addEventListener("mousemove", handleChartMouseMove);
 window.addEventListener("mouseup", handleChartMouseUp);
 el.chartCanvas.addEventListener("mouseleave", handleChartMouseLeave);
 el.chartCanvas.addEventListener("click", handleChartClick);
 el.chartCanvas.addEventListener("wheel", handleChartWheel, { passive: false });
 document.addEventListener("keydown", (event) => {
   if (event.key === "Escape") {
     state.chart.riskMode = false;
     state.chart.trendMode = false;
     state.chart.horizontalMode = false;
     state.chart.fibonacciMode = false;
     state.chart.draggingFibonacci = null;
     state.chart.percentMeasureMode = false;
     state.chart.percentMeasureStart = null;
     state.chart.limitOrderMode = null;
     state.chart.exitOrderPositionId = "";
     state.chart.pendingPoint = null;
      closeModal(el.helpModal);
     closeModal(el.settingsModal);
     closeModal(el.resetModal);
     closeConfirm();
     updateTrendControls();
     renderRiskControls();
     drawChart();
     return;
   }
   if ((event.key === "Delete" || event.key === "Backspace") && !isEditableTarget(event.target)) {
     if (state.chart.selectedRiskBlockId || state.chart.selectedTrendlineId) {
       event.preventDefault();
       deleteSelectedDrawing();
     }
   }
 });
}
function currentMarket() {
 return MARKETS[state.market] || MARKETS[DEFAULT_MARKET];
}
function futuresStorageKey(marketCode = state.market) {
 return SHARED_FUTURES_STORAGE_KEY;
}
function currentFuturesMarket() {
 return FUTURES_MARKETS[state.market] || FUTURES_MARKETS[DEFAULT_MARKET];
}
function futuresMarketByCode(marketCode) {
 return FUTURES_HISTORY_MARKETS[marketCode] || FUTURES_MARKETS[DEFAULT_MARKET];
}
function futuresMarketForSymbol(symbol) {
 const normalized = String(symbol || "").toUpperCase();
 return Object.values(FUTURES_HISTORY_MARKETS).find((market) => market.symbol === normalized) || currentFuturesMarket();
}
function isKnownFuturesRecord(record) {
 if (!record || typeof record !== "object") return false;
 const marketCode = String(record.market || "").toUpperCase();
 const rawSymbol = String(record.symbol || "").toUpperCase();
 const symbol = rawSymbol.includes("-") ? rawSymbol.split("-").pop() : rawSymbol.replace(/USDT$|KRW$/g, "");
 if (marketCode && !FUTURES_HISTORY_MARKETS[marketCode]) return false;
 if (symbol && !Object.values(FUTURES_HISTORY_MARKETS).some((market) => market.symbol === symbol)) return false;
 return true;
}
function currentFuturesSymbol() {
 return currentFuturesMarket().symbol;
}
function normalizeFuturesSymbol(value, fallback = currentFuturesSymbol()) {
 const raw = String(value || "").toUpperCase();
 const withoutQuote = raw.includes("-") ? raw.split("-").pop() : raw.replace(/USDT$|KRW$/g, "");
 const symbol = Object.values(FUTURES_HISTORY_MARKETS).some((market) => market.symbol === withoutQuote)
   ? withoutQuote
   : String(fallback || FUTURES_MARKETS[DEFAULT_MARKET].symbol).toUpperCase();
 return symbol;
}
function normalizeFuturesMarketCode(value, symbol) {
 const code = String(value || "").toUpperCase();
 if (FUTURES_HISTORY_MARKETS[code]) return code;
 const market = futuresMarketForSymbol(symbol);
 return market.code;
}
function futuresPositionSymbol(position) {
 return normalizeFuturesSymbol(position && position.symbol);
}
function futuresTradeSymbol(trade) {
 return normalizeFuturesSymbol(trade && trade.symbol);
}
function futuresPositionMarketCode(position) {
 return normalizeFuturesMarketCode(position && position.market, position && position.symbol);
}
function futuresTradeMarketCode(trade) {
 return normalizeFuturesMarketCode(trade && trade.market, trade && trade.symbol);
}
function futuresProductLabel(marketCode, symbol) {
 const market = futuresMarketByCode(marketCode || normalizeFuturesMarketCode(null, symbol));
 return market && market.label ? market.label : normalizeFuturesSymbol(symbol);
}
function futuresPositionProductLabel(position) {
 return futuresProductLabel(futuresPositionMarketCode(position), position && position.symbol);
}
function futuresTradeProductLabel(trade) {
 return futuresProductLabel(futuresTradeMarketCode(trade), trade && trade.symbol);
}
function futuresSummaryProductLabel(summary) {
 const labels = [...new Set(futuresDailySummaryTrades(summary).map(futuresTradeProductLabel))];
 if (!labels.length) return futuresProductLabel(summary && summary.market, summary && summary.symbol);
 return labels.length > 3 ? `${labels.slice(0, 3).join(", ")} 외 ${labels.length - 3}` : labels.join(", ");
}
function futuresSymbolLabel(symbol = currentFuturesSymbol()) {
 return normalizeFuturesSymbol(symbol);
}
function formatFuturesQuantity(value, symbol = currentFuturesSymbol()) {
 return `${formatBtc(value)} ${futuresSymbolLabel(symbol)}`;
}
function futuresPriceSourceForMarket(marketCode = currentFuturesMarket().code) {
 return futuresMarketByCode(marketCode).chartSource === "BINANCE"
   ? BINANCE_FUTURES_PRICE_SOURCE
   : FUTURES_PRICE_SOURCE;
}
function normalizeFuturesPrice(value, symbol, priceSource, exchangeRate, marketCode) {
 const price = positiveNumber(finiteNumber(value, 0), 0);
 if (!price) return 0;
 const market = futuresMarketByCode(marketCode || normalizeFuturesMarketCode(null, symbol));
 const rate = positiveNumber(finiteNumber(exchangeRate, DEFAULT_USD_KRW_RATE), DEFAULT_USD_KRW_RATE);
 if (market.priceCurrency === "USD" || market.priceCurrency === "USDT") {
   // Convert positions saved while the BTC tab still used Bithumb KRW spot.
   return priceSource === FUTURES_PRICE_SOURCE || (!priceSource && price >= 1000000) ? price / rate : price;
 }
 const legacyUsdPrice = priceSource !== FUTURES_PRICE_SOURCE
   && normalizeFuturesSymbol(symbol) === "BTC"
   && price < 10000000;
 return legacyUsdPrice ? price * rate : price;
}
function isFuturesMode() {
 return FUTURES_ONLY_MODE || state.marketMode === "futures";
}
function activeCandles() {
 return isFuturesMode() ? state.futures.candles : state.candles;
}
function getActiveCandles() {
 return activeCandles();
}
function isCandleClosed(candle, nowSeconds = Date.now() / 1000) {
 const unitSeconds = timeframeSeconds(state.timeframe);
 return candle && Number.isFinite(candle.time) && candle.time + unitSeconds <= nowSeconds;
}
function activeClosedCandles() {
 const nowSeconds = Date.now() / 1000;
 return activeCandles().filter((candle) => isCandleClosed(candle, nowSeconds));
}
function activeLastClosedCandle() {
 const closed = activeClosedCandles();
 return closed[closed.length - 1] || null;
}
function activeRealtimeCandle() {
 const candles = activeCandles();
 return candles[candles.length - 1] || null;
}
function activeAnalysisCandles() {
 const candles = activeCandles();
 if (isFuturesMode() || state.chart.includeLiveCandleInAnalysis) return candles;
 const closed = activeClosedCandles();
 return closed.length ? closed : candles;
}
function activeTicker() {
 return isFuturesMode() ? state.futures.ticker : state.ticker;
}
function activeChartLabel() {
 if (!isFuturesMode()) return currentMarket().code;
 const market = currentFuturesMarket();
 const source = market.chartSource === "BINANCE" ? "Binance" : "Bithumb";
 return `${source} ${market.binanceSymbol || market.code}`;
}
function activeTrendlineStore() {
 return isFuturesMode() ? futuresDrawingStore("trendlinesByMarket", createEmptyTrendlines) : state.trendlines;
}
function activeRiskBlockStore() {
 return isFuturesMode() ? futuresDrawingStore("riskBlocksByMarket", createEmptyRiskBlocks) : state.riskBlocks;
}
function futuresDrawingStore(key, emptyFactory) {
 if (!state.futures[key] || typeof state.futures[key] !== "object") state.futures[key] = {};
 const marketCode = currentFuturesMarket().code;
 if (!state.futures[key][marketCode]) state.futures[key][marketCode] = emptyFactory();
 return state.futures[key][marketCode];
}
function activeCandleLimit() {
 return isFuturesMode() ? FUTURES_MAX_VISIBLE_CANDLES : CANDLE_LOAD_LIMIT;
}
function formatActivePrice(value, maxDigits) {
 return isFuturesMode() ? formatFuturesDisplayPrice(value) : formatKrw(value, maxDigits);
}
function futuresExchangeRate() {
 return positiveNumber(
   finiteNumber(state.futures && state.futures.exchangeRate, DEFAULT_USD_KRW_RATE),
   DEFAULT_USD_KRW_RATE
 );
}
function futuresDisplayCurrency() {
 return "USDT";
}
function isFuturesKrwDisplay() {
 return false;
}
function futuresUsdtToKrw(value) {
 // Keep the KRW paper-trading ledger independent from live FX movements.
 // Otherwise an untouched account appears to gain or lose seed money.
 return finiteNumber(value, 0) * DEFAULT_USD_KRW_RATE;
}
function futuresKrwToUsdt(value) {
 return finiteNumber(value, 0) / DEFAULT_USD_KRW_RATE;
}
async function fetchUsdKrwRate() {
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), FUTURES_EXCHANGE_RATE_TIMEOUT_MS);
 try {
   const response = await fetch(USD_KRW_RATE_URL, {
     cache: "no-store",
     signal: controller.signal
   });
   if (!response.ok) throw new Error(`USD/KRW request failed: ${response.status}`);
   const data = await response.json();
   const rate = positiveNumber(finiteNumber(data && data.rates && data.rates.KRW, 0), 0);
   if (!rate) throw new Error("USD/KRW rate is empty");
   return rate;
 } finally {
   clearTimeout(timer);
 }
}
async function refreshFuturesExchangeRate(options = {}) {
 return futuresExchangeRate();
}
function formatFuturesDisplayAmount(value) {
 return formatUsdt(value, 2);
}
function formatSignedFuturesDisplayAmount(value) {
 return formatSignedUsdt(value);
}
function futuresPriceCurrency(marketCode = currentFuturesMarket().code) {
 return futuresMarketByCode(marketCode).priceCurrency || "USDT";
}
function futuresPriceDecimals(marketCode = currentFuturesMarket().code) {
 const decimals = Math.round(finiteNumber(futuresMarketByCode(marketCode).priceDecimals, 2));
 return clamp(decimals, 0, 8);
}
function chartMinimumAbsolutePriceRange(marketCode = currentFuturesMarket().code) {
 return isFuturesMode() ? 10 ** -futuresPriceDecimals(marketCode) : 1;
}
function formatFuturesDisplayPrice(value, marketCode = currentFuturesMarket().code) {
 const decimals = futuresPriceDecimals(marketCode);
 if (futuresPriceCurrency(marketCode) === "USD" || futuresPriceCurrency(marketCode) === "USDT") return formatUsdt(value, decimals);
 return formatUsdt(futuresKrwToUsdt(value), decimals);
}
function formatSignedFuturesDisplayPrice(value, marketCode = currentFuturesMarket().code) {
 const number = finiteNumber(value, 0);
 const prefix = number > 0 ? "+" : "";
 const decimals = futuresPriceDecimals(marketCode);
 if (futuresPriceCurrency(marketCode) === "USD" || futuresPriceCurrency(marketCode) === "USDT") return `${prefix}${formatUsdt(number, decimals)}`;
 return `${prefix}${formatUsdt(futuresKrwToUsdt(number), decimals)}`;
}
function formatFuturesMarketValue(value) {
 return formatUsdt(value, 2);
}
function formatFuturesDisplayInputAmount(usdtValue) {
 return trimNumber(usdtValue, 2);
}
function normalizeFuturesBtcQuantity(value) {
 const number = finiteNumber(Number(value), 0);
 if (Math.abs(number) < FUTURES_BTC_EPSILON) return 0;
 return Math.max(0, Number(number.toFixed(FUTURES_BTC_DECIMALS)));
}
function futuresPositionQuantity(position) {
 return normalizeFuturesBtcQuantity(position && position.quantity);
}
function futuresQuantityFromMargin(margin, price, leverage) {
 const safeMargin = positiveNumber(finiteNumber(margin, 0), 0);
 const safePrice = positiveNumber(finiteNumber(price, 0), 0);
 const safeLeverage = positiveNumber(finiteNumber(leverage, 0), 0);
 if (!safeMargin || !safePrice || !safeLeverage) return 0;
 return normalizeFuturesBtcQuantity((safeMargin * safeLeverage) / safePrice);
}
function futuresMarginFromQuantity(quantity, price, leverage) {
 const safeQuantity = normalizeFuturesBtcQuantity(quantity);
 const safePrice = positiveNumber(finiteNumber(price, 0), 0);
 const safeLeverage = positiveNumber(finiteNumber(leverage, 0), 0);
 if (!safeQuantity || !safePrice || !safeLeverage) return 0;
 return (safeQuantity * safePrice) / safeLeverage;
}
function futuresPartialCloseAmountUnits(position) {
 return Math.max(0, finiteNumber(position && position.margin, 0));
}
function futuresExitOrderAmountUnits(order) {
 const units = finiteNumber(order && order.closeAmountUnits, 0);
 return units > 0 ? units : null;
}
function futuresReservedExitOrderAmountUnits(positionId) {
 const id = String(positionId || "");
 const position = getFuturesPositions().find((item) => String(item.id) === id);
 const maxUnits = futuresPartialCloseAmountUnits(position);
 const orders = normalizeFuturesExitOrders(state.futures && state.futures.exitOrders)
   .filter((order) => order.positionId === id);
 if (orders.some((order) => futuresExitOrderAmountUnits(order) === null)) return maxUnits;
 return orders.reduce((sum, order) => sum + futuresExitOrderAmountUnits(order), 0);
}
function futuresAvailableExitOrderAmountUnits(position) {
 return Math.max(
   0,
   futuresPartialCloseAmountUnits(position) - futuresReservedExitOrderAmountUnits(position && position.id)
 );
}
function futuresAvailableExitOrderQuantity(position) {
 const totalUnits = futuresPartialCloseAmountUnits(position);
 if (totalUnits <= 0) return 0;
 return normalizeFuturesBtcQuantity(
   futuresPositionQuantity(position) * (futuresAvailableExitOrderAmountUnits(position) / totalUnits)
 );
}
function futuresQuantityFromPositionAmountUnits(position, amountUnits) {
 const totalUnits = futuresPartialCloseAmountUnits(position);
 if (totalUnits <= 0) return 0;
 return normalizeFuturesBtcQuantity(
   futuresPositionQuantity(position) * (Math.max(0, finiteNumber(amountUnits, 0)) / totalUnits)
 );
}
function futuresPositionAmountUnitsFromQuantity(position, quantity) {
 const totalQuantity = futuresPositionQuantity(position);
 if (totalQuantity <= 0) return 0;
 return futuresPartialCloseAmountUnits(position) * (normalizeFuturesBtcQuantity(quantity) / totalQuantity);
}
function normalizeFuturesExitOrderAmountInput(input) {
 if (!input || input.value === "") return 0;
 const positionId = String(input.dataset.futuresExitOrderAmount || "");
 const position = getFuturesPositions().find((item) => String(item.id) === positionId);
 const maxUnits = futuresAvailableExitOrderAmountUnits(position);
 const rawUnits = Math.max(0, finiteNumber(Number(input.value), 0));
 const normalizedUnits = Math.min(rawUnits, maxUnits);
 const normalizedText = normalizedUnits > 0 ? trimNumber(normalizedUnits, 8) : "";
 if (input.value !== normalizedText) input.value = normalizedText;
 return normalizedUnits;
}
function handleFuturesPartialCloseAmountInput(input) {
 return normalizeFuturesPartialCloseAmountInput(input);
}
function handleFuturesExitOrderAmountInput(input) {
 return normalizeFuturesExitOrderAmountInput(input);
}
function normalizeFuturesPartialCloseAmountInput(input) {
 if (!input || input.value === "") return 0;
 const positionId = String(input.dataset.partialCloseAmount || "");
 const position = getFuturesPositions().find((item) => String(item.id) === positionId);
 const maxUnits = Math.max(0, futuresPartialCloseAmountUnits(position) - 0.01);
 const rawUnits = Math.max(0, finiteNumber(Number(input.value), 0));
 const normalizedUnits = Math.min(rawUnits, maxUnits);
 const normalizedText = normalizedUnits > 0 ? trimNumber(normalizedUnits, 8) : "";
 if (input.value !== normalizedText) input.value = normalizedText;
 return normalizedUnits;
}
function futuresLimitOrderCommitment(order) {
 const normalized = normalizeFuturesLimitOrder(order);
 if (!normalized) return 0;
 return normalized.margin + (normalized.margin * normalized.leverage * FUTURES_FEE_RATE);
}
function futuresReservedLimitOrderBalance(excludedOrderId = "") {
 const excludedId = String(excludedOrderId || "");
 return normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders)
   .filter((order) => !excludedId || order.id !== excludedId)
   .reduce((sum, order) => sum + futuresLimitOrderCommitment(order), 0);
}
function futuresAvailableUsdtBalance(excludedOrderId = "") {
 const balance = Math.max(0, finiteNumber(state.futures && state.futures.account && state.futures.account.usdtBalance, 0));
 return Math.max(0, balance - futuresReservedLimitOrderBalance(excludedOrderId));
}
function maxFuturesMarginUsdt() {
 const leverage = positiveNumber(state.futures && state.futures.leverage, DEFAULT_FUTURES_LEVERAGE);
 return Math.max(0, futuresAvailableUsdtBalance() / (1 + leverage * FUTURES_FEE_RATE));
}
function maxFuturesMarginInputUnits() {
 return Math.max(0, Math.floor(maxFuturesMarginUsdt() * 100) / 100);
}
function normalizeFuturesMarginInputUnits() {
 if (!el.futuresMarginInput) return 0;
 if (el.futuresMarginInput.value === "") return 0;
 const rawUnits = Math.floor(Math.max(0, finiteNumber(Number(el.futuresMarginInput.value), 0)) * 100) / 100;
 const maxUnits = maxFuturesMarginInputUnits();
 const normalizedUnits = Math.min(rawUnits, maxUnits);
 if (String(el.futuresMarginInput.value) !== String(normalizedUnits)) {
   el.futuresMarginInput.value = normalizedUnits > 0 ? String(normalizedUnits) : "";
 }
 return normalizedUnits;
}
function readFuturesMarginInputUsdt() {
 return normalizeFuturesMarginInputUnits();
}
function updateFuturesOrderConversionHint(quantity, margin) {
 if (!el.futuresOrderConversionHint) return;
 const symbol = currentFuturesSymbol();
 if (!quantity || !margin) {
   setText(el.futuresOrderConversionHint, `입력한 증거금이 현재가와 레버리지에 맞는 ${symbol} 수량으로 자동 계산됩니다.`);
   return;
 }
 const notional = quantity * currentFuturesPrice();
 setText(
   el.futuresOrderConversionHint,
   `${formatFuturesQuantity(quantity, symbol)} · 필요 증거금 ${formatFuturesDisplayAmount(margin)} · 포지션 가치 ${formatFuturesDisplayAmount(notional)}`
 );
}
function syncFuturesEntryQuantityFromMargin() {
 const units = normalizeFuturesMarginInputUnits();
 const margin = units;
 const quantity = futuresQuantityFromMargin(margin, currentFuturesPrice(), state.futures.leverage);
 updateFuturesOrderConversionHint(quantity, margin);
 return { inputMode: "MARGIN", margin, quantity };
}
function handleFuturesMarginInput() {
 futuresEntryInputMode = "MARGIN";
 return syncFuturesEntryQuantityFromMargin();
}
function readFuturesEntryOrderInput(price, leverage = state.futures.leverage) {
 const safePrice = positiveNumber(finiteNumber(price, 0), 0);
 const safeLeverage = positiveNumber(finiteNumber(leverage, 0), 0);
 if (!safePrice || !safeLeverage) return { inputMode: "MARGIN", margin: 0, notional: 0, quantity: 0 };
 const margin = readFuturesMarginInputUsdt();
 const notional = margin * safeLeverage;
 return { inputMode: "MARGIN", margin, notional, quantity: normalizeFuturesBtcQuantity(notional / safePrice) };
}
function clearFuturesEntryInputs() {
 if (el.futuresMarginInput) el.futuresMarginInput.value = "";
 updateFuturesOrderConversionHint(0, 0);
}
function currentFuturesPrice(marketCode = currentFuturesMarket().code) {
 const ticker = state.futures.tickers && state.futures.tickers[marketCode]
   ? state.futures.tickers[marketCode]
   : marketCode === currentFuturesMarket().code
     ? state.futures.ticker
     : null;
 if (ticker && ticker.price > 0) return ticker.price;
 if (marketCode !== currentFuturesMarket().code) {
   const position = getFuturesPositions().find((item) => futuresPositionMarketCode(item) === marketCode);
   return position && position.entryPrice > 0 ? position.entryPrice : 0;
 }
 const candles = state.futures.candles;
 const last = candles[candles.length - 1];
 return last && last.close > 0 ? last.close : 0;
}
function currentFuturesPriceForPosition(position) {
 return currentFuturesPrice(futuresPositionMarketCode(position));
}
function storageKey(type) {
 return marketStorageKey(state.market, type);
}
function marketStorageKey(marketCode, type) {
 const market = MARKETS[marketCode] || MARKETS[DEFAULT_MARKET];
 return `${market.storagePrefix}.${type}.v1`;
}
function resetActiveChartInteraction() {
 state.chart.hover = null;
 state.chart.pendingPoint = null;
 state.chart.selectedTrendlineId = null;
 state.chart.selectedRiskBlockId = null;
 state.chart.draggingRiskBlock = null;
 state.chart.draggingFibonacci = null;
 state.chart.draggingChartPan = null;
 state.chart.panOffset = 0;
 state.chart.pricePanRatio = 0;
 state.chart.trendMode = false;
 state.chart.horizontalMode = false;
 state.chart.fibonacciMode = false;
 state.chart.riskMode = false;
 state.chart.percentMeasureMode = false;
 state.chart.percentMeasureStart = null;
  state.chart.percentMeasurement = null;
  state.chart.limitOrderMode = null;
  state.chart.exitOrderPositionId = "";
  state.chart.positionFilterId = "";
}
function switchMarketMode(nextMode) {
 if (FUTURES_ONLY_MODE && nextMode !== "futures") return;
 const mode = nextMode === "futures" ? "futures" : "spot";
 if (mode === state.marketMode) return;
 state.marketMode = mode;
 resetDailyMovingAverageData();
 resetActiveChartInteraction();
 resetChartAnimations();
 hideTooltip();
 if (isFuturesMode()) {
   closeTickerSocket();
   if (!FUTURES_MARKETS[state.market]) state.market = DEFAULT_MARKET;
   resetRangeAssistantForContext();
   loadFuturesState();
   loadChartIndicatorPreferences();
   archivePastFuturesTradesIfNeeded();
   hydrateSettingsInputs();
   refreshFuturesExchangeRate().then(() => renderAll());
   loadFuturesCandles(state.timeframe);
   if (state.rangeAssistant.enabled) refreshRangeAssistantData();
   connectFuturesWebSocket();
   startCandleAutoRefresh();
   showToast(`${currentFuturesMarket().label} 선물 모드로 전환했습니다.`);
 } else {
   disconnectFuturesWebSocket();
   if (!MARKETS[state.market]) state.market = DEFAULT_MARKET;
   if (!SPOT_TIMEFRAMES.has(state.timeframe)) state.timeframe = "1";
   resetRangeAssistantForContext();
   state.ticker = null;
   state.candles = [];
   state.loadingCandles = false;
   loadLocalState();
   archivePastTradesIfNeeded();
   hydrateSettingsInputs();
   connectTickerSocket();
   loadCandles(state.timeframe);
   if (state.rangeAssistant.enabled) refreshRangeAssistantData();
   fetchMarketTickers();
   startCandleAutoRefresh();
   showToast(`${currentMarket().label} 현물 모드로 전환했습니다.`);
 }
 renderAll();
}
function switchMarket(nextMarket) {
 if (futuresOfflineReplayRunning || state.futures.orderBusy || futuresTriggeredOrderDrainRunning || pendingFuturesTriggeredOrders.size) {
   showToast("예약 주문 처리가 끝난 뒤 코인을 변경하세요.");
   return;
 }
 if (isFuturesMode()) {
   if (!FUTURES_MARKETS[nextMarket] || nextMarket === state.market) return;
   disconnectFuturesWebSocket();
   saveFuturesState();
   state.market = nextMarket;
   resetDailyMovingAverageData();
   loadChartIndicatorPreferences();
   resetRangeAssistantForContext();
   state.futures.ticker = state.futures.tickers && state.futures.tickers[nextMarket]
     ? state.futures.tickers[nextMarket]
     : null;
   state.futures.candles = [];
   archivePastFuturesTradesIfNeeded();
   resetActiveChartInteraction();
   resetChartAnimations();
   hideTooltip();
   state.futures.loadingCandles = false;
   restorePersistedFuturesTriggeredOrders();
   hydrateSettingsInputs();
   renderMarketLabels();
   renderAll();
   refreshFuturesExchangeRate().then(() => renderAll());
   reconcilePendingFuturesOrdersFromOneMinuteHistory();
   loadFuturesCandles(state.timeframe);
   if (state.rangeAssistant.enabled) refreshRangeAssistantData();
   connectFuturesWebSocket();
   startCandleAutoRefresh();
   showToast(`${currentFuturesMarket().label} 선물 화면으로 전환했습니다.`);
   return;
 }
 if (!MARKETS[nextMarket] || nextMarket === state.market) return;
 closeTickerSocket();
 state.market = nextMarket;
 resetDailyMovingAverageData();
 resetRangeAssistantForContext();
 state.ticker = null;
 state.candles = [];
 state.portfolio = createDefaultPortfolio(DEFAULT_SEED);
 state.trades = [];
 state.dailySummaries = [];
 state.trendlines = createEmptyTrendlines();
 state.riskBlocks = createEmptyRiskBlocks();
 state.chart.emaVisible = createDefaultEmaVisibility();
 state.chart.bollingerVisible = BOLLINGER_CONFIG.defaultVisible;
 state.chart.hover = null;
 state.chart.pendingPoint = null;
 state.chart.selectedTrendlineId = null;
 state.chart.selectedRiskBlockId = null;
 state.chart.draggingRiskBlock = null;
 state.chart.draggingFibonacci = null;
 state.chart.trendMode = false;
 state.chart.horizontalMode = false;
 state.chart.fibonacciMode = false;
 state.chart.riskMode = false;
 state.chart.limitOrderMode = null;
 state.chart.exitOrderPositionId = "";
 resetChartAnimations();
 state.loadingCandles = false;
 loadLocalState();
 archivePastTradesIfNeeded();
 hydrateSettingsInputs();
 renderMarketLabels();
 renderAll();
 connectTickerSocket();
 loadCandles(state.timeframe);
 if (state.rangeAssistant.enabled) refreshRangeAssistantData();
 fetchMarketTickers();
 scheduleDailyArchive();
 showToast(`${currentMarket().label} 화면으로 전환했습니다.`);
}
function renderMarketLabels() {
 renderMarketModeControls();
 renderHistoryHeaders();
 el.marketButtons.forEach((button) => {
   const active = button.dataset.market === state.market;
   button.classList.toggle("active", active);
   button.setAttribute("aria-selected", String(active));
 });
 if (isFuturesMode()) {
   const market = currentFuturesMarket();
   const symbol = market.symbol;
   const sourceName = market.chartSource === "BINANCE" ? "Binance" : "Bithumb";
   const productCode = market.binanceSymbol || market.code;
   document.title = `${productCode} 선물 모의매매`;
   setText(el.marketDataSourceLabel, `${sourceName.toUpperCase()} ${productCode} PERPETUAL CHART`);
   setText(el.marketTitle, `${productCode} 무기한 선물 모의매매 연습`);
   setText(el.priceLabel, `현재 ${symbol} 가격`);
   setText(el.totalAssetLabel, "총 자산");
   setText(el.totalAssetDetail, "USDT 잔고 + 포지션 평가손익");
   setText(el.cashBalanceLabel, "선물 USDT 잔고");
   setText(el.allocationLabel, "현재 포지션");
   setText(el.unrealizedLabel, "미실현 손익");
   setText(el.realizedLabel, "누적 실현손익");
   setText(el.winRateLabel, "선물 승률");
   const futuresTitle = document.querySelector(".futures-box-head h3");
   const futuresSubtitle = document.querySelector(".futures-box-head p");
   if (futuresTitle) setText(futuresTitle, `${symbol} 선물`);
   if (futuresSubtitle) setText(futuresSubtitle, `${sourceName} ${productCode} 무기한 차트`);
   if (el.chartCanvas) {
     el.chartCanvas.setAttribute("aria-label", `${symbol} 선물 캔들 차트`);
   }
   if (el.chartPanel) {
     el.chartPanel.setAttribute("aria-label", `${symbol} 선물 캔들 차트`);
   }
   return;
 }
 const market = currentMarket();
 const symbol = market.symbol;
 setText(el.marketDataSourceLabel, "UPBIT PUBLIC MARKET DATA");
 document.title = `${market.code} 모의매매 연습`;
 setText(el.marketTitle, `${market.code} 모의매매 연습`);
 setText(el.priceLabel, `현재 ${symbol} 가격`);
 setText(el.totalAssetLabel, "총 평가자산");
 setText(el.totalAssetDetail, "공통 KRW + 전체 코인 평가액");
 setText(el.cashBalanceLabel, "공통 KRW 잔고");
 setText(el.allocationLabel, "보유 코인 비율");
 setText(el.unrealizedLabel, "평가손익");
 setText(el.realizedLabel, "누적 실현손익");
 setText(el.winRateLabel, "승률");
 setText(el.sellAmountLabel, `매도 수량 ${symbol}`);
 if (el.chartCanvas) {
   el.chartCanvas.setAttribute("aria-label", `${market.code} 캔들 차트`);
 }
 if (el.chartPanel) {
   el.chartPanel.setAttribute("aria-label", `${market.label} 캔들 차트`);
 }
}
function renderMarketModeControls() {
 el.marketModeButtons.forEach((button) => {
   const active = button.dataset.marketMode === state.marketMode;
   button.classList.toggle("active", active);
   button.setAttribute("aria-selected", String(active));
 });
 if (FUTURES_ONLY_MODE) {
   if (el.spotModeBtn) el.spotModeBtn.hidden = true;
   if (el.futuresModeBtn) el.futuresModeBtn.hidden = true;
 }
  document.body.classList.toggle("is-futures-mode", isFuturesMode());
  document.body.classList.toggle("is-spot-mode", !isFuturesMode());
  if (el.spotCoinSwitcher) el.spotCoinSwitcher.hidden = false;
  el.marketButtons.forEach((button) => {
    const marketCode = button.dataset.market;
    button.hidden = isFuturesMode()
      ? !FUTURES_MARKETS[marketCode]
      : button.dataset.futuresOnly === "true";
  });
  el.timeframeButtons.forEach((button) => {
    button.hidden = button.dataset.futuresOnlyTimeframe === "true" && !isFuturesMode();
  });
 if (el.spotTradeControls) {
   el.spotTradeControls.hidden = isFuturesMode();
   el.spotTradeControls.style.display = isFuturesMode() ? "none" : "";
   el.spotTradeControls.setAttribute("aria-hidden", String(isFuturesMode()));
 }
 if (el.futuresTradeControls) el.futuresTradeControls.hidden = !isFuturesMode();
 renderFuturesAccountControls();
}
function renderFuturesAccountControls() {
 if (el.futuresMarginLabel) {
   setText(el.futuresMarginLabel, "사용 증거금 (USDT)");
 }
 if (el.futuresMarginInput) {
   el.futuresMarginInput.min = "0.01";
   el.futuresMarginInput.step = "0.01";
   el.futuresMarginInput.placeholder = "예: 10";
   el.futuresMarginInput.max = String(maxFuturesMarginInputUnits());
 }
 futuresEntryInputMode = "MARGIN";
 syncFuturesEntryQuantityFromMargin();
}
function closeTickerSocket() {
 clearTimeout(state.reconnectTimer);
 stopFallbackTicker();
 if (state.ws) {
   state.socketClosing = true;
   state.ws.close();
   state.ws = null;
 }
}
function createDefaultPortfolio(seed) {
 const safeSeed = positiveNumber(seed, DEFAULT_SEED);
 return {
   initialSeedKrw: safeSeed,
   krwBalance: safeSeed,
   btcBalance: 0,
   avgBuyPrice: 0,
   realizedPnl: 0,
   feeRateBuy: 0.0004,
   feeRateSell: 0.0004,
   updatedAt: new Date().toISOString()
 };
}
function createDefaultSharedAccount(seed) {
 const safeSeed = positiveNumber(seed, DEFAULT_SEED);
 return {
   initialSeedKrw: safeSeed,
   krwBalance: safeSeed,
   feeRateBuy: 0.0004,
   feeRateSell: 0.0004,
   updatedAt: new Date().toISOString()
 };
}
function createEmptyTrendlines() {
 return { "1": [], "3": [], "5": [], "15": [], "60": [], "240": [] };
}
function createEmptyRiskBlocks() {
 return { "1": [], "3": [], "5": [], "15": [], "60": [], "240": [] };
}
function createDefaultFuturesAccount(initialUsdt = DEFAULT_FUTURES_USDT) {
 const seed = positiveNumber(finiteNumber(initialUsdt, DEFAULT_FUTURES_USDT), DEFAULT_FUTURES_USDT);
 return {
   initialUsdt: seed,
   usdtBalance: seed,
   updatedAt: new Date().toISOString()
 };
}
function createDefaultFuturesState(initialUsdt = DEFAULT_FUTURES_USDT) {
 return {
   account: createDefaultFuturesAccount(initialUsdt),
   position: null,
   positions: [],
   limitOrders: [],
   exitOrders: [],
   completedOrderNotices: [],
   trades: [],
   positionBlocks: [],
   dailySummaries: [],
   positionJournalVersion: FUTURES_POSITION_JOURNAL_VERSION,
   intentionalClearAt: "",
   trendlines: createEmptyTrendlines(),
   riskBlocks: createEmptyRiskBlocks(),
   tradeMarkers: [],
   exchangeRate: DEFAULT_USD_KRW_RATE,
   exchangeRateUpdatedAt: "",
   displayCurrency: "USDT",
   ticker: null,
   tickers: {},
   candles: [],
   leverage: DEFAULT_FUTURES_LEVERAGE,
   lastRealizedPnl: 0,
   orderBusy: false,
   ws: null,
   wsStream: "",
   wsHeartbeatTimer: null,
   wsWatchdogTimer: null,
   wsLastMessageAt: 0,
   wsLastTradeAt: 0,
   bybitTickerSnapshots: {},
   reconnectTimer: null,
   socketClosing: false,
   loadingCandles: false,
   error: null,
   trendlinesByMarket: {},
   riskBlocksByMarket: {}
 };
}
function normalizeFuturesAccount(value) {
 const source = value && typeof value === "object" ? value : {};
 const seed = positiveNumber(finiteNumber(source.initialUsdt, DEFAULT_FUTURES_USDT), DEFAULT_FUTURES_USDT);
 return {
   initialUsdt: seed,
   usdtBalance: Math.max(0, finiteNumber(source.usdtBalance, seed)),
   updatedAt: source.updatedAt || new Date().toISOString()
 };
}
function normalizeFuturesOrderHistoryCheckedThrough(value, createdAt) {
 const createdAtMs = timestampMs(createdAt);
 const checkedThroughMs = timestampMs(value && value.historyCheckedThrough);
 const safeMs = Math.max(createdAtMs, checkedThroughMs);
 return safeMs ? new Date(safeMs).toISOString() : createdAt;
}
function normalizeFuturesOrderTriggerBaseline(value) {
 const candleTime = Math.max(0, Math.floor(finiteNumber(value && value.triggerBaselineCandleTime, 0)));
 const high = positiveNumber(finiteNumber(value && value.triggerBaselineHigh, 0), 0);
 const low = positiveNumber(finiteNumber(value && value.triggerBaselineLow, 0), 0);
 return {
   triggerBaselineCandleTime: candleTime,
   triggerBaselineHigh: high,
   triggerBaselineLow: low,
   triggerBaselineReady: value && value.triggerBaselineReady === true
 };
}
function currentFuturesOrderTriggerBaseline(createdAt = Date.now()) {
 const createdAtMs = timestampMs(createdAt) || Date.now();
 const candleTime = Math.floor(createdAtMs / 1000 / FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS)
   * FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS;
 const marketCode = currentFuturesMarket().code;
 const captured = futuresOneMinuteOrderCandles.get(marketCode);
 const candle = captured && captured.time === candleTime ? captured : null;
 const fallbackPrice = currentFuturesPrice();
 return {
   triggerBaselineCandleTime: candleTime,
   triggerBaselineHigh: positiveNumber(finiteNumber(candle && candle.high, fallbackPrice), fallbackPrice),
   triggerBaselineLow: positiveNumber(finiteNumber(candle && candle.low, fallbackPrice), fallbackPrice),
   triggerBaselineReady: Boolean(candle && candle.authoritative !== false)
 };
}
function futuresOrderTriggerBaselineOrToast(createdAt = Date.now()) {
 const baseline = currentFuturesOrderTriggerBaseline(createdAt);
 if (baseline.triggerBaselineReady) return baseline;
 showToast("현재 1분봉 기준값을 확인 중입니다. 잠시 후 예약 주문을 다시 눌러주세요.");
 return null;
}
async function ensureFuturesOrderTriggerBaseline(createdAt = Date.now()) {
 const cached = currentFuturesOrderTriggerBaseline(createdAt);
 if (cached.triggerBaselineReady) return cached;
 const market = currentFuturesMarket();
 if (market.chartSource === "BINANCE" && market.binanceSymbol) {
   try {
     const rows = await requestBinanceFuturesJson("/fapi/v1/klines", {
       symbol: market.binanceSymbol,
       interval: "1m",
       limit: 2
     });
     const candle = (Array.isArray(rows) ? rows : [])
       .map(normalizeBinanceKlineRow)
       .filter(Boolean)
       .find((item) => item.time === cached.triggerBaselineCandleTime);
     if (candle) {
       futuresOneMinuteOrderCandles.set(market.code, {
         ...candle,
         authoritative: true,
         updatedAt: Date.now()
       });
       return currentFuturesOrderTriggerBaseline(createdAt);
     }
   } catch (error) {
     console.warn("Binance order baseline refresh failed", error);
   }
 }
 showToast("현재 Binance 1분봉 기준값을 확인하지 못했습니다. 잠시 후 다시 시도하세요.");
 return null;
}
function normalizeFuturesLimitOrder(value) {
 if (!value || typeof value !== "object") return null;
 const direction = String(value.direction || "").toUpperCase() === "SHORT" ? "SHORT" : "LONG";
 const market = normalizeFuturesMarketCode(value.market, value.symbol);
 if (!FUTURES_MARKETS[market]) return null;
 const price = positiveNumber(finiteNumber(value.price, 0), 0);
 const margin = positiveNumber(finiteNumber(value.margin, 0), 0);
 const leverage = FUTURES_LEVERAGES.includes(Number(value.leverage)) ? Number(value.leverage) : DEFAULT_FUTURES_LEVERAGE;
 if (price <= 0 || margin <= 0) return null;
 const inputMode = String(value.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN";
 const quantity = normalizeFuturesBtcQuantity(
   positiveNumber(finiteNumber(value.quantity, 0), 0) || (margin * leverage) / price
 );
 const createdAt = value.createdAt || new Date().toISOString();
 const triggeredAtMs = timestampMs(value.triggeredAt);
 return {
   id: String(value.id || `flo-${Date.now()}-${Math.random().toString(16).slice(2)}`),
   market,
   symbol: normalizeFuturesSymbol(value.symbol || futuresMarketByCode(market).symbol),
   direction,
   price,
   margin,
   leverage,
   inputMode,
   quantity,
   referencePrice: positiveNumber(finiteNumber(value.referencePrice, price), price),
   createdAt,
   triggeredAt: triggeredAtMs ? new Date(triggeredAtMs).toISOString() : "",
   triggerEvidenceSource: String(value.triggerEvidenceSource || ""),
   historyCheckedThrough: normalizeFuturesOrderHistoryCheckedThrough(value, createdAt),
   ...normalizeFuturesOrderTriggerBaseline(value)
 };
}
function normalizeFuturesLimitOrders(value) {
 const seen = new Set();
 return (Array.isArray(value) ? value : [])
   .map(normalizeFuturesLimitOrder)
   .filter((order) => {
     if (!order || seen.has(order.id)) return false;
     seen.add(order.id);
     return true;
   });
}
function normalizeFuturesLimitOrderSettledIds(value) {
 const seen = new Set();
 const ids = [];
 (Array.isArray(value) ? value : []).forEach((item) => {
   const id = String(item || "").trim();
   if (!id || seen.has(id)) return;
   seen.add(id);
   ids.push(id);
 });
 return ids.slice(-FUTURES_LIMIT_ORDER_SETTLED_ID_LIMIT);
}
function futuresLimitOrderJournalContent(value = {}) {
 const settledIds = normalizeFuturesLimitOrderSettledIds(value.settledIds);
 const settled = new Set(settledIds);
 return {
   orders: normalizeFuturesLimitOrders(value.orders).filter((order) => !settled.has(order.id)),
   settledIds
 };
}
function futuresLimitOrderJournalFingerprint(value) {
 return JSON.stringify(futuresLimitOrderJournalContent(value));
}
function readFuturesLimitOrderJournal() {
 let raw = null;
 try {
   raw = localStorage.getItem(FUTURES_LIMIT_ORDER_JOURNAL_KEY);
   if (!raw) return { raw: null, document: null, error: null };
   const parsed = JSON.parse(raw);
   if (!parsed || Number(parsed.version) !== FUTURES_LIMIT_ORDER_JOURNAL_VERSION) {
     throw new Error("Unsupported futures limit-order journal");
   }
   return { raw, document: { ...parsed, ...futuresLimitOrderJournalContent(parsed) }, error: null };
 } catch (error) {
   console.warn("Futures limit-order journal read failed", error);
   return { raw, document: null, error };
 }
}
function currentFuturesLimitOrderJournalContent() {
 const settledIds = normalizeFuturesLimitOrderSettledIds([...futuresLimitOrderSettledIds]);
 const settled = new Set(settledIds);
 return {
   orders: normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders)
     .filter((order) => !settled.has(order.id)),
   settledIds
 };
}
function reconcileFuturesLimitOrderJournal() {
 const stored = readFuturesLimitOrderJournal();
 const before = normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders);
 if (stored.document) {
   futuresLimitOrderSettledIds = new Set(stored.document.settledIds);
 } else if (!futuresLimitOrderJournalLoaded) {
   futuresLimitOrderSettledIds = new Set();
 }
 const settled = futuresLimitOrderSettledIds;
 const byId = new Map();
 [...before, ...(stored.document ? stored.document.orders : [])].forEach((order) => {
   const normalized = normalizeFuturesLimitOrder(order);
   if (normalized && !settled.has(normalized.id) && !byId.has(normalized.id)) byId.set(normalized.id, normalized);
 });
 const reconciled = [...byId.values()];
 state.futures.limitOrders = reconciled;
 futuresLimitOrderJournalLoaded = true;
 const beforeFingerprint = JSON.stringify(before);
 const afterFingerprint = JSON.stringify(reconciled);
 const desiredContent = currentFuturesLimitOrderJournalContent();
 return {
   stateChanged: beforeFingerprint !== afterFingerprint,
   needsPersistence: !stored.document
     || beforeFingerprint !== afterFingerprint
     || futuresLimitOrderJournalFingerprint(stored.document) !== futuresLimitOrderJournalFingerprint(desiredContent)
 };
}
function stageFuturesLimitOrderJournalWrite() {
 try {
   const previousRaw = localStorage.getItem(FUTURES_LIMIT_ORDER_JOURNAL_KEY);
   let previousDocument = null;
   try {
     const parsed = previousRaw ? JSON.parse(previousRaw) : null;
     if (parsed && Number(parsed.version) === FUTURES_LIMIT_ORDER_JOURNAL_VERSION) previousDocument = parsed;
   } catch (error) {
     console.warn("Previous futures limit-order journal is unreadable", error);
   }
   const content = currentFuturesLimitOrderJournalContent();
   if (previousDocument && futuresLimitOrderJournalFingerprint(previousDocument) === futuresLimitOrderJournalFingerprint(content)) {
     return { ok: true, changed: false, previousRaw };
   }
   const document = {
     version: FUTURES_LIMIT_ORDER_JOURNAL_VERSION,
     updatedAt: new Date().toISOString(),
     ...content
   };
   const serialized = JSON.stringify(document);
   try {
     safeSetItem(FUTURES_LIMIT_ORDER_JOURNAL_KEY, serialized);
   } catch (firstError) {
     removeMigratedLegacyFuturesStorage();
     removeNonEssentialFuturesCacheStorage();
     safeSetItem(FUTURES_LIMIT_ORDER_JOURNAL_KEY, serialized);
   }
   const verified = readFuturesLimitOrderJournal();
   if (!verified.document || futuresLimitOrderJournalFingerprint(verified.document) !== futuresLimitOrderJournalFingerprint(content)) {
     throw new Error("Futures limit-order journal verification failed");
   }
   return { ok: true, changed: true, previousRaw };
 } catch (error) {
   return { ok: false, error };
 }
}
function rollbackFuturesLimitOrderJournalWrite(transaction) {
 if (!transaction || !transaction.changed) return;
 try {
   if (transaction.previousRaw === null) safeRemoveItem(FUTURES_LIMIT_ORDER_JOURNAL_KEY);
   else safeSetItem(FUTURES_LIMIT_ORDER_JOURNAL_KEY, transaction.previousRaw);
 } catch (error) {
   console.error("Futures limit-order journal rollback failed", error);
 }
}
function settleFuturesLimitOrder(orderId) {
 const id = String(orderId || "").trim();
 if (!id) return;
 const ids = normalizeFuturesLimitOrderSettledIds([...futuresLimitOrderSettledIds, id]);
 futuresLimitOrderSettledIds = new Set(ids);
}
function settleCurrentFuturesLimitOrders() {
 normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders).forEach((order) => settleFuturesLimitOrder(order.id));
}
function normalizeFuturesExitOrder(value) {
 if (!value || typeof value !== "object") return null;
 const positionId = String(value.positionId || "").trim();
 const market = normalizeFuturesMarketCode(value.market, value.symbol);
 const price = positiveNumber(finiteNumber(value.price, 0), 0);
 const closeAmountUnits = futuresExitOrderAmountUnits(value);
 if (!positionId || !FUTURES_MARKETS[market] || price <= 0) return null;
 const createdAt = value.createdAt || new Date().toISOString();
 const triggeredAtMs = timestampMs(value.triggeredAt);
 const inputMode = String(value.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN";
 const closeQuantity = normalizeFuturesBtcQuantity(value.closeQuantity);
 return {
   id: String(value.id || `feo-${Date.now()}-${Math.random().toString(16).slice(2)}`),
   positionId,
   market,
   symbol: normalizeFuturesSymbol(value.symbol || futuresMarketByCode(market).symbol),
   direction: String(value.direction || "").toUpperCase() === "SHORT" ? "SHORT" : "LONG",
   price,
   triggerSide: String(value.triggerSide || "").toUpperCase() === "BELOW" ? "BELOW" : "ABOVE",
   referencePrice: positiveNumber(finiteNumber(value.referencePrice, price), price),
   closeAmountUnits,
   inputMode,
   closeQuantity: closeQuantity > 0 ? closeQuantity : null,
   createdAt,
   updatedAt: value.updatedAt || createdAt,
   triggeredAt: triggeredAtMs ? new Date(triggeredAtMs).toISOString() : "",
   triggerEvidenceSource: String(value.triggerEvidenceSource || ""),
   historyCheckedThrough: normalizeFuturesOrderHistoryCheckedThrough(value, createdAt),
   ...normalizeFuturesOrderTriggerBaseline(value)
 };
}
function normalizeFuturesExitOrders(value) {
 const seenIds = new Set();
 return (Array.isArray(value) ? value : [])
   .map(normalizeFuturesExitOrder)
   .filter((order) => {
     if (!order || seenIds.has(order.id)) return false;
     seenIds.add(order.id);
     return true;
   });
}
function normalizeFuturesCompletedOrderNotice(value) {
 if (!value || typeof value !== "object") return null;
 const orderKind = String(value.orderKind || value.kind || "").toUpperCase() === "EXIT" ? "EXIT" : "ENTRY";
 const sourceOrderId = String(value.sourceOrderId || value.orderId || "").trim();
 const positionId = String(value.positionId || "").trim();
 const market = normalizeFuturesMarketCode(value.market, value.symbol);
 const price = positiveNumber(finiteNumber(value.price, 0), 0);
 if (!sourceOrderId || !FUTURES_MARKETS[market] || price <= 0) return null;
 const completedAtMs = timestampMs(value.completedAt || value.executedAt);
 const completedAt = completedAtMs ? new Date(completedAtMs).toISOString() : new Date().toISOString();
 const closeAmountUnits = positiveNumber(finiteNumber(value.closeAmountUnits, 0), 0);
 const closeQuantity = normalizeFuturesBtcQuantity(value.closeQuantity);
 return {
   id: String(value.id || `fcon-${orderKind.toLowerCase()}-${sourceOrderId}`),
   sourceOrderId,
   orderKind,
   positionId,
   market,
   symbol: normalizeFuturesSymbol(value.symbol || futuresMarketByCode(market).symbol),
   direction: String(value.direction || "").toUpperCase() === "SHORT" ? "SHORT" : "LONG",
   price,
   margin: Math.max(0, finiteNumber(value.margin, 0)),
   leverage: FUTURES_LEVERAGES.includes(Number(value.leverage)) ? Number(value.leverage) : DEFAULT_FUTURES_LEVERAGE,
   closeAmountUnits: closeAmountUnits > 0 ? closeAmountUnits : null,
   closeQuantity: closeQuantity > 0 ? closeQuantity : null,
   inputMode: String(value.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN",
   triggerSide: String(value.triggerSide || "").toUpperCase() === "BELOW" ? "BELOW" : "ABOVE",
   orderCreatedAt: value.orderCreatedAt || value.createdAt || completedAt,
   completedAt
 };
}
function normalizeFuturesCompletedOrderNotices(value) {
 const seenIds = new Set();
 const seenOrders = new Set();
 return (Array.isArray(value) ? value : [])
   .map(normalizeFuturesCompletedOrderNotice)
   .filter((notice) => {
     if (!notice) return false;
     const sourceKey = `${notice.orderKind}:${notice.sourceOrderId}`;
     if (seenIds.has(notice.id) || seenOrders.has(sourceKey)) return false;
     seenIds.add(notice.id);
     seenOrders.add(sourceKey);
     return true;
   });
}
function addFuturesCompletedOrderNotice(order, orderKind, options = {}) {
 if (!order || typeof order !== "object") return null;
 const normalizedKind = String(orderKind || "").toUpperCase() === "EXIT" ? "EXIT" : "ENTRY";
 const sourceOrderId = String(order.id || "").trim();
 if (!sourceOrderId) return null;
 const notice = normalizeFuturesCompletedOrderNotice({
   id: `fcon-${normalizedKind.toLowerCase()}-${sourceOrderId}`,
   sourceOrderId,
   orderKind: normalizedKind,
   positionId: options.positionId || order.positionId || "",
   market: order.market,
   symbol: order.symbol,
   direction: order.direction,
   price: positiveNumber(finiteNumber(options.price, 0), 0) || order.price,
   margin: order.margin,
   leverage: order.leverage,
   inputMode: order.inputMode,
   quantity: order.quantity,
   closeAmountUnits: positiveNumber(finiteNumber(options.closeAmountUnits, 0), 0) || order.closeAmountUnits,
   closeQuantity: normalizeFuturesBtcQuantity(options.closeQuantity) || order.closeQuantity,
   triggerSide: order.triggerSide,
   orderCreatedAt: order.createdAt,
   completedAt: options.completedAt || new Date().toISOString()
 });
 if (!notice) return null;
 state.futures.completedOrderNotices = normalizeFuturesCompletedOrderNotices([
   ...(state.futures.completedOrderNotices || []).filter((item) => item
     && item.id !== notice.id
     && (
       String(item.orderKind || "").toUpperCase() !== normalizedKind
       || String(item.sourceOrderId || "") !== sourceOrderId
     )),
   notice
 ]);
 return notice;
}
function removeFuturesCompletedOrderNotice(noticeId) {
 const id = String(noticeId || "").trim();
 if (!id) return null;
 const notices = normalizeFuturesCompletedOrderNotices(state.futures.completedOrderNotices);
 const target = notices.find((notice) => notice.id === id) || null;
 if (!target) return null;
 state.futures.completedOrderNotices = notices.filter((notice) => notice.id !== id);
 return target;
}
function normalizeFuturesExitOrderSettledIds(value) {
 const seen = new Set();
 const ids = [];
 (Array.isArray(value) ? value : []).forEach((item) => {
   const id = String(item || "").trim();
   if (!id || seen.has(id)) return;
   seen.add(id);
   ids.push(id);
 });
 return ids.slice(-FUTURES_EXIT_ORDER_SETTLED_ID_LIMIT);
}
function futuresExitOrderJournalContent(value = {}) {
 const settledIds = normalizeFuturesExitOrderSettledIds(value.settledIds);
 const settled = new Set(settledIds);
 return {
   orders: normalizeFuturesExitOrders(value.orders).filter((order) => !settled.has(order.id)),
   settledIds
 };
}
function futuresExitOrderJournalFingerprint(value) {
 return JSON.stringify(futuresExitOrderJournalContent(value));
}
function readFuturesExitOrderJournal() {
 let raw = null;
 try {
   raw = localStorage.getItem(FUTURES_EXIT_ORDER_JOURNAL_KEY);
   if (!raw) return { raw: null, document: null, error: null };
   const parsed = JSON.parse(raw);
   if (!parsed || Number(parsed.version) !== FUTURES_EXIT_ORDER_JOURNAL_VERSION) {
     throw new Error("Unsupported futures exit-order journal");
   }
   return { raw, document: { ...parsed, ...futuresExitOrderJournalContent(parsed) }, error: null };
 } catch (error) {
   console.warn("Futures exit-order journal read failed", error);
   return { raw, document: null, error };
 }
}
function currentFuturesExitOrderJournalContent() {
 const settledIds = normalizeFuturesExitOrderSettledIds([...futuresExitOrderSettledIds]);
 const settled = new Set(settledIds);
 return {
   orders: normalizeFuturesExitOrders(state.futures && state.futures.exitOrders)
     .filter((order) => !settled.has(order.id)),
   settledIds
 };
}
function reconcileFuturesExitOrderJournal() {
 const stored = readFuturesExitOrderJournal();
 const before = normalizeFuturesExitOrders(state.futures && state.futures.exitOrders);
 if (stored.document) {
   futuresExitOrderSettledIds = new Set(stored.document.settledIds);
 } else if (!futuresExitOrderJournalLoaded) {
   futuresExitOrderSettledIds = new Set();
 }
 const openPositionIds = new Set(getFuturesPositions().map((position) => String(position.id)));
 const byOrderId = new Map();
 [...before, ...(stored.document ? stored.document.orders : [])].forEach((order) => {
   const normalized = normalizeFuturesExitOrder(order);
   if (!normalized || futuresExitOrderSettledIds.has(normalized.id)) return;
   if (!openPositionIds.has(normalized.positionId)) {
     settleFuturesExitOrder(normalized.id);
     return;
   }
   if (!byOrderId.has(normalized.id)) byOrderId.set(normalized.id, normalized);
 });
 const reconciled = [...byOrderId.values()];
 state.futures.exitOrders = reconciled;
 futuresExitOrderJournalLoaded = true;
 const beforeFingerprint = JSON.stringify(before);
 const afterFingerprint = JSON.stringify(reconciled);
 const desiredContent = currentFuturesExitOrderJournalContent();
 return {
   stateChanged: beforeFingerprint !== afterFingerprint,
   needsPersistence: !stored.document
     || beforeFingerprint !== afterFingerprint
     || futuresExitOrderJournalFingerprint(stored.document) !== futuresExitOrderJournalFingerprint(desiredContent)
 };
}
function stageFuturesExitOrderJournalWrite() {
 try {
   const previousRaw = localStorage.getItem(FUTURES_EXIT_ORDER_JOURNAL_KEY);
   let previousDocument = null;
   try {
     const parsed = previousRaw ? JSON.parse(previousRaw) : null;
     if (parsed && Number(parsed.version) === FUTURES_EXIT_ORDER_JOURNAL_VERSION) previousDocument = parsed;
   } catch (error) {
     console.warn("Previous futures exit-order journal is unreadable", error);
   }
   const content = currentFuturesExitOrderJournalContent();
   if (previousDocument && futuresExitOrderJournalFingerprint(previousDocument) === futuresExitOrderJournalFingerprint(content)) {
     return { ok: true, changed: false, previousRaw };
   }
   const document = {
     version: FUTURES_EXIT_ORDER_JOURNAL_VERSION,
     updatedAt: new Date().toISOString(),
     ...content
   };
   const serialized = JSON.stringify(document);
   try {
     safeSetItem(FUTURES_EXIT_ORDER_JOURNAL_KEY, serialized);
   } catch (firstError) {
     removeMigratedLegacyFuturesStorage();
     removeNonEssentialFuturesCacheStorage();
     safeSetItem(FUTURES_EXIT_ORDER_JOURNAL_KEY, serialized);
   }
   const verified = readFuturesExitOrderJournal();
   if (!verified.document || futuresExitOrderJournalFingerprint(verified.document) !== futuresExitOrderJournalFingerprint(content)) {
     throw new Error("Futures exit-order journal verification failed");
   }
   return { ok: true, changed: true, previousRaw };
 } catch (error) {
   return { ok: false, error };
 }
}
function rollbackFuturesExitOrderJournalWrite(transaction) {
 if (!transaction || !transaction.changed) return;
 try {
   if (transaction.previousRaw === null) safeRemoveItem(FUTURES_EXIT_ORDER_JOURNAL_KEY);
   else safeSetItem(FUTURES_EXIT_ORDER_JOURNAL_KEY, transaction.previousRaw);
 } catch (error) {
   console.error("Futures exit-order journal rollback failed", error);
 }
}
function settleFuturesExitOrder(orderId) {
 const id = String(orderId || "").trim();
 if (!id) return;
 const ids = normalizeFuturesExitOrderSettledIds([...futuresExitOrderSettledIds, id]);
 futuresExitOrderSettledIds = new Set(ids);
}
function settleCurrentFuturesExitOrders() {
 normalizeFuturesExitOrders(state.futures && state.futures.exitOrders).forEach((order) => settleFuturesExitOrder(order.id));
}
function futuresEntryTimestampFromId(id) {
 const match = String(id || "").match(/^fpe?-(\d{12,14})-/i);
 if (!match) return 0;
 const timestamp = Number(match[1]);
 const earliestReasonableTime = new Date("2020-01-01T00:00:00.000Z").getTime();
 const latestReasonableTime = Date.now() + 86400000;
 return Number.isFinite(timestamp) && timestamp >= earliestReasonableTime && timestamp <= latestReasonableTime ? timestamp : 0;
}
function futuresEntryOpenedAt(entry, fallback = {}) {
 const entryTime = entry && (entry.entryTime || entry.openedAt || entry.createdAt) || "";
 const fallbackTime = fallback && (fallback.entryTime || fallback.openedAt || fallback.createdAt) || "";
 const idTimestamp = futuresEntryTimestampFromId(entry && entry.id);
 const entryTimestamp = new Date(entryTime || 0).getTime() || 0;
 const fallbackTimestamp = new Date(fallbackTime || 0).getTime() || 0;
 const looksOverwrittenByPositionStart = idTimestamp
   && entryTimestamp
   && fallbackTimestamp
   && entryTimestamp === fallbackTimestamp
   && Math.abs(idTimestamp - entryTimestamp) > 1000;
 if (looksOverwrittenByPositionStart || (!entryTimestamp && idTimestamp)) return new Date(idTimestamp).toISOString();
 return entryTime || fallbackTime || new Date().toISOString();
}
function normalizeFuturesEntryLeg(entry, fallback = {}) {
 if (!entry || typeof entry !== "object") return null;
 const source = { ...fallback, ...entry };
 if (!isKnownFuturesRecord(source)) return null;
 const symbol = normalizeFuturesSymbol(source.symbol);
 const market = normalizeFuturesMarketCode(source.market, symbol);
 const exchangeRate = positiveNumber(finiteNumber(source.exchangeRate, futuresExchangeRate()), futuresExchangeRate());
 const priceSource = source.priceSource || futuresPriceSourceForMarket(market);
 const directionText = String(source.direction || source.side || "").toUpperCase();
 const direction = directionText === "SHORT" ? "SHORT" : "LONG";
 const leverage = positiveNumber(finiteNumber(source.leverage, DEFAULT_FUTURES_LEVERAGE), DEFAULT_FUTURES_LEVERAGE);
 const entryPrice = normalizeFuturesPrice(source.entryPrice, symbol, priceSource, exchangeRate, market);
 const margin = positiveNumber(finiteNumber(source.margin, 0), 0);
 if (!entryPrice || !margin) return null;
 const notional = positiveNumber(finiteNumber(source.notional, margin * leverage), margin * leverage);
 const quantity = normalizeFuturesBtcQuantity(
   positiveNumber(finiteNumber(source.quantity, notional / entryPrice), notional / entryPrice)
 );
 const remainingQuantity = Math.min(
   quantity,
   normalizeFuturesBtcQuantity(source.remainingQuantity === undefined ? quantity : source.remainingQuantity)
 );
 const entryFee = Math.max(0, finiteNumber(source.entryFee, notional * FUTURES_FEE_RATE));
 const openedAt = futuresEntryOpenedAt(entry, fallback);
 const orderTypeText = String(source.orderType || "").toUpperCase();
 return {
   id: String(source.id || `fpe-${Date.now()}-${Math.random().toString(16).slice(2)}`),
   market,
   symbol,
   priceSource: futuresPriceSourceForMarket(market),
   direction,
   leverage,
   entryPrice,
   marginMode: FUTURES_MARGIN_MODE,
   margin,
   notional,
   quantity,
   requestedQuantity: normalizeFuturesBtcQuantity(source.requestedQuantity === undefined ? quantity : source.requestedQuantity),
   executedQuantity: normalizeFuturesBtcQuantity(source.executedQuantity === undefined ? quantity : source.executedQuantity),
   remainingQuantity,
   inputMode: String(source.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN",
   status: remainingQuantity > FUTURES_BTC_EPSILON ? "OPEN" : "CLOSED",
   entryFee,
   exchangeRate,
   sourceLimitOrderId: String(source.sourceLimitOrderId || ""),
   orderType: orderTypeText === "LIMIT" ? "LIMIT" : "MARKET",
   openedAt
 };
}
function futuresEntryLegs(record) {
 if (!record || typeof record !== "object") return [];
 const entries = Array.isArray(record.entries) && record.entries.length ? record.entries : [record];
 return entries
   .map((entry, index) => normalizeFuturesEntryLeg(entry, {
     ...record,
     id: entry && entry.id ? entry.id : `${String(record.id || "position")}-entry-${index + 1}`
   }))
   .filter(Boolean);
}
function consumeFuturesEntryQuantities(entries, closeQuantity, preferredEntryId = "") {
 const normalizedEntries = futuresEntryLegs({ entries });
 let remainingToClose = normalizeFuturesBtcQuantity(closeQuantity);
 const preferredId = String(preferredEntryId || "");
 const orderedEntries = [...normalizedEntries].sort((a, b) => {
   if (preferredId) {
     if (a.id === preferredId && b.id !== preferredId) return -1;
     if (b.id === preferredId && a.id !== preferredId) return 1;
   }
   return new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime();
 });
 for (const entry of orderedEntries) {
   if (remainingToClose <= FUTURES_BTC_EPSILON) break;
   if (preferredId && entry.id !== preferredId) continue;
   const available = normalizeFuturesBtcQuantity(entry.remainingQuantity);
   if (available <= 0) continue;
   const consumed = Math.min(available, remainingToClose);
   entry.remainingQuantity = normalizeFuturesBtcQuantity(available - consumed);
   entry.status = entry.remainingQuantity > FUTURES_BTC_EPSILON ? "OPEN" : "CLOSED";
   remainingToClose = normalizeFuturesBtcQuantity(remainingToClose - consumed);
 }
 return { entries: normalizedEntries, remainingToClose };
}
function reconcileFuturesEntryQuantities(entries, positionQuantity) {
 const normalizedEntries = futuresEntryLegs({ entries });
 const targetQuantity = normalizeFuturesBtcQuantity(positionQuantity);
 const openQuantity = normalizeFuturesBtcQuantity(
   normalizedEntries.reduce((sum, entry) => sum + normalizeFuturesBtcQuantity(entry.remainingQuantity), 0)
 );
 if (openQuantity > targetQuantity + FUTURES_BTC_EPSILON) {
   return consumeFuturesEntryQuantities(normalizedEntries, openQuantity - targetQuantity).entries;
 }
 if (targetQuantity > openQuantity + FUTURES_BTC_EPSILON && normalizedEntries.length) {
   const lastEntry = normalizedEntries[normalizedEntries.length - 1];
   lastEntry.remainingQuantity = normalizeFuturesBtcQuantity(lastEntry.remainingQuantity + (targetQuantity - openQuantity));
   lastEntry.status = "OPEN";
 }
 return normalizedEntries;
}
function normalizeFuturesPosition(position) {
 if (!position || typeof position !== "object") return null;
 if (!isKnownFuturesRecord(position)) return null;
 const symbol = normalizeFuturesSymbol(position.symbol);
 const market = normalizeFuturesMarketCode(position.market, symbol);
 const exchangeRate = positiveNumber(finiteNumber(position.exchangeRate, futuresExchangeRate()), futuresExchangeRate());
 const priceSource = position.priceSource || "";
 const directionText = String(position.direction || position.side || "").toUpperCase();
 const direction = directionText === "SHORT" ? "SHORT" : "LONG";
 const entryPrice = normalizeFuturesPrice(position.entryPrice, symbol, priceSource, exchangeRate, market);
 const margin = positiveNumber(finiteNumber(position.margin, 0), 0);
 const requestedLeverage = positiveNumber(finiteNumber(position.leverage, DEFAULT_FUTURES_LEVERAGE), DEFAULT_FUTURES_LEVERAGE);
 if (!entryPrice || !margin) return null;
 const notional = positiveNumber(finiteNumber(position.notional, margin * requestedLeverage), margin * requestedLeverage);
 const leverage = positiveNumber(notional / margin, requestedLeverage);
 const quantity = normalizeFuturesBtcQuantity(
   positiveNumber(finiteNumber(position.quantity, notional / entryPrice), notional / entryPrice)
 );
 const entryFee = Math.max(0, finiteNumber(position.entryFee, notional * FUTURES_FEE_RATE));
 const basisAdjustmentUsdt = finiteNumber(position.basisAdjustmentUsdt, 0);
 const entries = reconcileFuturesEntryQuantities(futuresEntryLegs({
   ...position,
   market,
   symbol,
   priceSource,
   direction,
   leverage,
   entryPrice,
   margin,
   notional,
   quantity,
   entryFee,
   exchangeRate
 }), quantity);
 const remainingPercent = clamp(finiteNumber(position.remainingPercent, 100), 0.01, 100);
 const rawLiquidationPrice = normalizeFuturesPrice(position.liquidationPrice, symbol, priceSource, exchangeRate, market);
 const liquidationPrice = positiveNumber(
   rawLiquidationPrice,
   calculateSimpleFuturesLiquidationPrice({ direction, entryPrice, leverage })
 );
 return {
   id: String(position.id || `fp-${Date.now()}-${Math.random().toString(16).slice(2)}`),
   market,
   symbol,
   priceSource: futuresPriceSourceForMarket(market),
   direction,
   entryPrice,
   marginMode: FUTURES_MARGIN_MODE,
   margin,
   leverage,
   notional,
   quantity,
   inputMode: String(position.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN",
   entryFee,
   basisAdjustmentUsdt,
   entries,
   remainingPercent,
   seedBeforeEntry: Math.max(0, finiteNumber(position.seedBeforeEntry, 0)),
   memo: String(position.memo || "").slice(0, 160),
   liquidationPrice,
   exchangeRate,
   exchangeRateUpdatedAt: position.exchangeRateUpdatedAt || "",
   openedAt: position.openedAt || new Date().toISOString()
 };
}
function mergeFuturesPositionsById(...positionLists) {
 const byId = new Map();
 positionLists.flat().forEach((position) => {
   const normalized = normalizeFuturesPosition(position);
   if (normalized && !byId.has(normalized.id)) {
     byId.set(normalized.id, normalized);
   }
 });
 return [...byId.values()].sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());
}
function mergeCompatibleFuturesPositions(positions) {
 const grouped = new Map();
 positions.forEach((position) => {
   const key = [
     futuresPositionMarketCode(position),
     position.direction
   ].join("|");
   const existing = grouped.get(key);
   if (!existing) {
     grouped.set(key, position);
     return;
   }
   const mergedMargin = existing.margin + position.margin;
   const mergedNotional = existing.notional + position.notional;
   const mergedQuantity = existing.quantity + position.quantity;
   const averageEntryPrice = mergedQuantity > 0 ? mergedNotional / mergedQuantity : existing.entryPrice;
   const mergedLeverage = mergedMargin > 0 ? mergedNotional / mergedMargin : existing.leverage;
   const earliest = new Date(existing.openedAt).getTime() <= new Date(position.openedAt).getTime() ? existing : position;
   const merged = normalizeFuturesPosition({
     ...earliest,
     entryPrice: averageEntryPrice,
     margin: mergedMargin,
     notional: mergedNotional,
     quantity: mergedQuantity,
     entryFee: existing.entryFee + position.entryFee,
     basisAdjustmentUsdt: finiteNumber(existing.basisAdjustmentUsdt, 0) + finiteNumber(position.basisAdjustmentUsdt, 0),
     entries: [...futuresEntryLegs(existing), ...futuresEntryLegs(position)],
     remainingPercent: 100,
     seedBeforeEntry: positiveNumber(earliest.seedBeforeEntry, Math.max(existing.seedBeforeEntry, position.seedBeforeEntry)),
     memo: existing.memo || position.memo || "",
     liquidationPrice: calculateSimpleFuturesLiquidationPrice({
       direction: existing.direction,
       entryPrice: averageEntryPrice,
       leverage: mergedLeverage
     }),
     openedAt: earliest.openedAt
   });
   if (merged) grouped.set(key, merged);
 });
 return [...grouped.values()].sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());
}
function normalizeFuturesPositions(value) {
 return Array.isArray(value) ? mergeCompatibleFuturesPositions(mergeFuturesPositionsById(value)) : [];
}
function getFuturesPositions() {
 if (!state.futures) return [];
 const positions = normalizeFuturesPositions(state.futures.positions);
 const legacyPosition = normalizeFuturesPosition(state.futures.position);
 return normalizeFuturesPositions([...positions, ...(legacyPosition ? [legacyPosition] : [])]);
}
function activeFuturesPositions() {
 const marketCode = currentFuturesMarket().code;
 return getFuturesPositions().filter((position) => futuresPositionMarketCode(position) === marketCode);
}
function setFuturesPositions(positions) {
 const normalized = normalizeFuturesPositions(positions);
 state.futures.positions = normalized;
 state.futures.position = normalized[0] || null;
 state.futures.tradeMarkers = mergeFuturesTradeMarkers(normalized.flatMap(createFuturesEntryMarkers));
}
function normalizeFuturesTrade(trade) {
 if (!trade || typeof trade !== "object") return null;
 if (!isKnownFuturesRecord(trade)) return null;
 const symbol = normalizeFuturesSymbol(trade.symbol);
 const market = normalizeFuturesMarketCode(trade.market, symbol);
 const exchangeRate = positiveNumber(finiteNumber(trade.entryExchangeRate, futuresExchangeRate()), futuresExchangeRate());
 const priceSource = trade.priceSource || "";
 const rawDirection = String(trade.side || trade.direction || "").toUpperCase();
 const direction = rawDirection === "SHORT" ? "Short" : "Long";
 const side = direction === "Short" ? "short" : "long";
 const entryPrice = normalizeFuturesPrice(trade.entryPrice, symbol, priceSource, exchangeRate, market);
 const closePrice = normalizeFuturesPrice(finiteNumber(trade.exitPrice, finiteNumber(trade.closePrice, 0)), symbol, priceSource, exchangeRate, market);
 const margin = positiveNumber(finiteNumber(trade.margin, 0), 0);
 if (!entryPrice || !closePrice || !margin) return null;
 const leverage = positiveNumber(finiteNumber(trade.leverage, DEFAULT_FUTURES_LEVERAGE), DEFAULT_FUTURES_LEVERAGE);
 const notional = Math.max(0, finiteNumber(trade.notional, margin * leverage));
 const quantity = normalizeFuturesBtcQuantity(finiteNumber(trade.quantity, entryPrice > 0 ? notional / entryPrice : 0));
 const grossPnl = finiteNumber(trade.grossPnl, finiteNumber(trade.realizedPnl, 0));
 const fee = Math.max(0, finiteNumber(trade.fee, 0));
 const entryFee = Math.max(0, finiteNumber(trade.entryFee, notional * FUTURES_FEE_RATE));
 const exitFee = Math.max(0, finiteNumber(trade.exitFee, Math.max(0, fee - entryFee)));
 const netPnl = finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, grossPnl - fee));
 const roe = finiteNumber(trade.roe, finiteNumber(trade.roePercent, margin > 0 ? (netPnl / margin) * 100 : 0));
 const liquidationPrice = positiveNumber(
   normalizeFuturesPrice(trade.liquidationPrice, symbol, priceSource, exchangeRate, market),
   calculateSimpleFuturesLiquidationPrice({
     direction: direction === "Short" ? "SHORT" : "LONG",
     entryPrice,
     leverage
   })
 );
 const entryTime = trade.entryTime || trade.openedAt || trade.createdAt || new Date().toISOString();
 const exitTime = trade.exitTime || trade.closedAt || trade.createdAt || new Date().toISOString();
 const balanceAfter = Math.max(0, finiteNumber(trade.balanceAfter, 0));
 const seedBeforeTrade = Math.max(0, finiteNumber(trade.seedBeforeTrade, finiteNumber(trade.seedBeforeEntry, 0)));
 const seedAfterTrade = Math.max(0, finiteNumber(trade.seedAfterTrade, balanceAfter));
 const entries = futuresEntryLegs({
   ...trade,
   market,
   symbol,
   priceSource,
   direction: direction === "Short" ? "SHORT" : "LONG",
   leverage,
   entryPrice,
   margin,
   notional,
    quantity,
    inputMode: String(trade.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN",
    requestedQuantity: normalizeFuturesBtcQuantity(trade.requestedQuantity === undefined ? quantity : trade.requestedQuantity),
    executedQuantity: normalizeFuturesBtcQuantity(trade.executedQuantity === undefined ? quantity : trade.executedQuantity),
   entryFee: Math.max(0, finiteNumber(trade.entryFee, notional * FUTURES_FEE_RATE)),
   exchangeRate
 });
  return {
    id: String(trade.id || `ft-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    positionId: trade.positionId ? String(trade.positionId) : "",
    marketType: "futures",
   market,
   symbol,
   priceSource: futuresPriceSourceForMarket(market),
   side,
   direction,
   leverage,
   entryPrice,
   exitPrice: closePrice,
   closePrice,
   margin,
   notional,
   quantity,
   entries,
   grossPnl,
   fee,
   entryFee,
   exitFee,
   netPnl,
   realizedPnl: netPnl,
   roe,
   roePercent: roe,
   liquidationPrice,
   closeReason: trade.closeReason || "수동 청산",
   memo: String(trade.memo || "").slice(0, 160),
   balanceAfter,
   seedBeforeTrade,
   seedAfterTrade,
   entryExchangeRate: positiveNumber(finiteNumber(trade.entryExchangeRate, DEFAULT_USD_KRW_RATE), DEFAULT_USD_KRW_RATE),
   exitExchangeRate: positiveNumber(finiteNumber(trade.exitExchangeRate, DEFAULT_USD_KRW_RATE), DEFAULT_USD_KRW_RATE),
   entryTime,
   exitTime,
   openedAt: entryTime,
   closedAt: exitTime,
   updatedAt: trade.updatedAt || trade.closedAt || exitTime
 };
}
function futuresTradeEntryTimestamp(trade) {
 return new Date(trade && (trade.entryTime || trade.openedAt || trade.createdAt) || 0).getTime() || 0;
}
function futuresTradeExitTimestamp(trade) {
 return new Date(trade && (trade.exitTime || trade.closedAt || trade.createdAt) || 0).getTime() || 0;
}
function futuresPositionTimeIdentity(value) {
 const timestamp = new Date(value || 0).getTime();
 return Number.isFinite(timestamp) && timestamp > 0 ? String(timestamp) : String(value || "");
}
function futuresTradePositionSignature(trade) {
 if (!trade) return "";
 const direction = String(trade.direction || trade.side || "").toUpperCase() === "SHORT" ? "SHORT" : "LONG";
 return [
   futuresTradeMarketCode(trade),
   direction,
   trimNumber(positiveNumber(finiteNumber(trade.leverage, DEFAULT_FUTURES_LEVERAGE), DEFAULT_FUTURES_LEVERAGE), 8),
   futuresPositionTimeIdentity(trade.entryTime || trade.openedAt || trade.createdAt)
 ].join("|");
}
function futuresOpenPositionSignature(position) {
 if (!position) return "";
 return [
   futuresPositionMarketCode(position),
   position.direction === "SHORT" ? "SHORT" : "LONG",
   trimNumber(positiveNumber(finiteNumber(position.leverage, DEFAULT_FUTURES_LEVERAGE), DEFAULT_FUTURES_LEVERAGE), 8),
   futuresPositionTimeIdentity(position.openedAt || position.entryTime)
 ].join("|");
}
function matchingOpenFuturesPosition(trade, positions = getFuturesPositions()) {
 const explicitPositionId = trade && trade.positionId ? String(trade.positionId) : "";
 const signature = futuresTradePositionSignature(trade);
 return (Array.isArray(positions) ? positions : []).find((position) => (
   (explicitPositionId && String(position.id) === explicitPositionId)
   || (signature && futuresOpenPositionSignature(position) === signature)
 )) || null;
}
function futuresPositionBlockPeriodLabel(block) {
 if (!block) return "-";
 const startDate = dateKeyFromValue(block.entryTime || block.openedAt);
 const endDate = dateKeyFromValue(block.exitTime || block.closedAt);
 return startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
}
function mergeFuturesEntryLegsForJournal(trades) {
 const byKey = new Map();
 (Array.isArray(trades) ? trades : []).forEach((trade) => {
   futuresEntryLegs(trade).forEach((entry) => {
     const stableEntryId = /^fpe?-\d{12,14}-/i.test(String(entry.id || "")) ? String(entry.id) : "";
     const key = stableEntryId ? `id:${stableEntryId}` : [
       futuresPositionTimeIdentity(entry.openedAt),
       trimNumber(entry.entryPrice, 12),
       entry.direction,
       trimNumber(entry.leverage, 8),
       entry.market
     ].join("|");
     if (!byKey.has(key)) byKey.set(key, entry);
   });
 });
 return [...byKey.values()].sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());
}
function futuresJournalPositionId(positionId, trades) {
 const closedTrades = Array.isArray(trades) ? trades : [];
 const explicitPositionId = String(
   positionId
   || closedTrades.find((trade) => trade && trade.positionId)?.positionId
   || ""
 );
 const isTradeSelfId = explicitPositionId
   && closedTrades.some((trade) => String(trade && trade.id || "") === explicitPositionId);
 if (explicitPositionId && !isTradeSelfId && !/^ft-/i.test(explicitPositionId)) return explicitPositionId;
 const signature = futuresTradePositionSignature(closedTrades[0]);
 return signature
   ? `legacy-fp-${checksumStorageText(signature)}`
   : explicitPositionId || `legacy-fp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function createFuturesPositionBlock(positionId, trades, source = {}) {
 const closedTrades = mergeFuturesTradesById(trades || []);
 if (!closedTrades.length) return null;
 const firstTrade = [...closedTrades].sort((a, b) => futuresTradeEntryTimestamp(a) - futuresTradeEntryTimestamp(b))[0];
 const lastTrade = [...closedTrades].sort((a, b) => futuresTradeExitTimestamp(b) - futuresTradeExitTimestamp(a))[0];
 const resolvedPositionId = futuresJournalPositionId(
   positionId || source.positionId || closedTrades.find((trade) => trade.positionId)?.positionId,
   closedTrades
 );
 const normalizedTrades = closedTrades.map((trade) => normalizeFuturesTrade({ ...trade, positionId: resolvedPositionId })).filter(Boolean);
 const totalQuantity = normalizedTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.quantity, 0)), 0);
 const totalMargin = normalizedTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.margin, 0)), 0);
 const grossPnl = normalizedTrades.reduce((sum, trade) => sum + finiteNumber(trade.grossPnl, 0), 0);
 const fee = normalizedTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.fee, 0)), 0);
 const netPnl = normalizedTrades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0);
 const entryPrice = totalQuantity > 0
   ? normalizedTrades.reduce((sum, trade) => sum + finiteNumber(trade.entryPrice, 0) * finiteNumber(trade.quantity, 0), 0) / totalQuantity
   : finiteNumber(firstTrade.entryPrice, 0);
 const exitPrice = totalQuantity > 0
   ? normalizedTrades.reduce((sum, trade) => sum + finiteNumber(trade.exitPrice, finiteNumber(trade.closePrice, 0)) * finiteNumber(trade.quantity, 0), 0) / totalQuantity
   : finiteNumber(lastTrade.exitPrice, finiteNumber(lastTrade.closePrice, 0));
 const entryTime = firstTrade.entryTime || firstTrade.openedAt || source.entryTime || source.openedAt;
 const exitTime = lastTrade.exitTime || lastTrade.closedAt || source.exitTime || source.closedAt;
 const storedEntries = Array.isArray(source.entries) && source.entries.length
   ? futuresEntryLegs({ ...source, entries: source.entries })
   : [];
 const entries = storedEntries.length ? storedEntries : mergeFuturesEntryLegsForJournal(normalizedTrades);
 const latestMemo = [...normalizedTrades].reverse().find((trade) => String(trade.memo || "").trim());
 const memo = String(source.memo || (latestMemo && latestMemo.memo) || "").slice(0, 160);
 const roe = totalMargin > 0 ? (netPnl / totalMargin) * 100 : 0;
 return {
   id: String(source.id || `fpb-${resolvedPositionId}`),
   positionId: resolvedPositionId,
   marketType: "futures",
   market: futuresTradeMarketCode(firstTrade),
   symbol: futuresTradeSymbol(firstTrade),
   side: firstTrade.side,
   direction: firstTrade.direction,
   leverage: firstTrade.leverage,
   entryPrice,
   exitPrice,
   closePrice: exitPrice,
   margin: totalMargin,
   quantity: totalQuantity,
   entries,
   entryCount: entries.length || 1,
   closeCount: normalizedTrades.length,
   tradeCount: normalizedTrades.length,
   grossPnl,
   fee,
   netPnl,
   realizedPnl: netPnl,
   roe,
   roePercent: roe,
   winCount: netPnl > 0 ? 1 : 0,
   liquidationPrice: finiteNumber(lastTrade.liquidationPrice, 0),
   memo,
   seedBeforeTrade: Math.max(0, finiteNumber(firstTrade.seedBeforeTrade, 0)),
   seedAfterTrade: Math.max(0, finiteNumber(lastTrade.seedAfterTrade, finiteNumber(lastTrade.balanceAfter, 0))),
   entryTime,
   exitTime,
   openedAt: entryTime,
   closedAt: exitTime,
   periodStart: dateKeyFromValue(entryTime),
   periodEnd: dateKeyFromValue(exitTime),
   trades: normalizedTrades,
   createdAt: source.createdAt || new Date().toISOString(),
   updatedAt: source.updatedAt || source.createdAt || new Date().toISOString()
 };
}
function normalizeFuturesPositionBlock(block) {
 if (!block || typeof block !== "object") return null;
 return createFuturesPositionBlock(block.positionId, block.trades || [], block);
}
function normalizeFuturesPositionBlocks(value) {
 const byPositionId = new Map();
 const normalizedBlocks = (Array.isArray(value) ? value : [])
   .map(normalizeFuturesPositionBlock)
   .filter(Boolean);
 const preferredPositionIdBySignature = new Map();
 normalizedBlocks.forEach((block) => {
   if (!/^fp-/i.test(String(block.positionId || ""))) return;
   const signature = futuresTradePositionSignature(block.trades && block.trades[0]);
   if (signature && !preferredPositionIdBySignature.has(signature)) {
     preferredPositionIdBySignature.set(signature, block.positionId);
   }
 });
 normalizedBlocks.forEach((normalizedBlock) => {
   const signature = futuresTradePositionSignature(normalizedBlock.trades && normalizedBlock.trades[0]);
   const key = preferredPositionIdBySignature.get(signature)
     || normalizedBlock.positionId
     || normalizedBlock.id;
   const normalized = key === normalizedBlock.positionId
     ? normalizedBlock
     : createFuturesPositionBlock(key, normalizedBlock.trades, { ...normalizedBlock, positionId: key });
   if (!normalized) return;
   const existing = byPositionId.get(key);
   if (!existing) {
     byPositionId.set(key, normalized);
     return;
   }
   const merged = createFuturesPositionBlock(key, [...existing.trades, ...normalized.trades], {
     ...existing,
     entries: mergeFuturesEntryLegsForJournal([...existing.trades, ...normalized.trades]),
     memo: normalized.memo || existing.memo,
     createdAt: existing.createdAt,
     updatedAt: normalized.updatedAt
   });
   if (merged) byPositionId.set(key, merged);
 });
 return [...byPositionId.values()].sort((a, b) => futuresTradeExitTimestamp(b) - futuresTradeExitTimestamp(a));
}
function futuresHasRestoredAccidentalPartialCloseEntries(positions) {
 const entryIds = new Set(normalizeFuturesPositions(positions).flatMap((position) => (
   futuresEntryLegs(position).map((entry) => String(entry.id || ""))
 )));
 return FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_20260731.positions.every((target) => (
   entryIds.has(target.positionId)
 ));
}
function normalizeFuturesPositionJournal(source, positions) {
 const suppressAccidentalCloseRecords = futuresHasRestoredAccidentalPartialCloseEntries(positions);
 const deletedBlockIds = new Set(FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_20260731.positions.map((target) => target.blockId));
 const deletedPositionIds = new Set(FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_20260731.positions.map((target) => target.positionId));
 const deletedTradeIds = new Set(FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_20260731.positions.map((target) => target.tradeId));
 const sourceDailySummaries = Array.isArray(source && source.dailySummaries) ? source.dailySummaries : [];
 const filteredDailySummaries = suppressAccidentalCloseRecords
   ? sourceDailySummaries.map((summary) => ({
     ...summary,
     trades: Array.isArray(summary && summary.trades)
       ? summary.trades.filter((trade) => !deletedTradeIds.has(String(trade && trade.id || "")))
       : summary && summary.trades
   }))
   : sourceDailySummaries;
 const dailySummaries = normalizeFuturesDailySummaries(filteredDailySummaries);
 const unresolvedDailySummaries = dailySummaries.filter((summary) => !(summary.trades || []).length);
 const existingBlocks = normalizeFuturesPositionBlocks(source && source.positionBlocks || [])
   .filter((block) => !suppressAccidentalCloseRecords || (
     !deletedBlockIds.has(block.id) && !deletedPositionIds.has(block.positionId)
   ));
 const existingTradeIds = new Set(existingBlocks.flatMap((block) => block.trades.map((trade) => trade.id)));
 const legacyArchivedTrades = dailySummaries.flatMap((summary) => summary.trades || []);
 const candidates = mergeFuturesTradesById(source && source.trades || [], legacyArchivedTrades)
   .filter((trade) => !suppressAccidentalCloseRecords || !deletedTradeIds.has(trade.id))
   .filter((trade) => !existingTradeIds.has(trade.id));
 const pendingTrades = [];
 const completedGroups = new Map();
 candidates.forEach((trade) => {
   const openPosition = matchingOpenFuturesPosition(trade, positions);
   if (openPosition) {
     const normalized = normalizeFuturesTrade({ ...trade, positionId: openPosition.id });
     if (normalized) pendingTrades.push(normalized);
     return;
   }
   const positionId = futuresJournalPositionId(trade.positionId, [trade]);
   if (!completedGroups.has(positionId)) completedGroups.set(positionId, []);
   completedGroups.get(positionId).push({ ...trade, positionId });
 });
 const migratedBlocks = [...completedGroups.entries()]
   .map(([positionId, trades]) => createFuturesPositionBlock(positionId, trades))
   .filter(Boolean);
 return {
   pendingTrades: mergeFuturesTradesById(pendingTrades),
   positionBlocks: normalizeFuturesPositionBlocks([...existingBlocks, ...migratedBlocks]),
   dailySummaries: unresolvedDailySummaries
 };
}
function calculateFuturesDailySeedPerformance(trades, fallback = {}) {
 const closedTrades = (Array.isArray(trades) ? trades : []).map(normalizeFuturesTrade).filter(Boolean);
 const firstTrade = [...closedTrades].sort((a, b) => futuresTradeEntryTimestamp(a) - futuresTradeEntryTimestamp(b))[0] || null;
 const fallbackStartSeed = Math.max(0, finiteNumber(fallback.startSeed, 0));
 const fallbackEndSeed = Math.max(0, finiteNumber(fallback.endSeed, 0));
 const firstBalanceAfter = Math.max(0, finiteNumber(firstTrade && firstTrade.balanceAfter, 0));
 const firstNetPnl = finiteNumber(firstTrade && firstTrade.netPnl, 0);
 const startSeed = firstTrade
   ? positiveNumber(firstTrade.seedBeforeTrade, Math.max(0, firstBalanceAfter - firstNetPnl))
   : fallbackStartSeed;
 const realizedPnl = closedTrades.length
   ? closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0)
   : finiteNumber(fallback.realizedPnl, 0);
 const endSeed = startSeed > 0 ? Math.max(0, startSeed + realizedPnl) : fallbackEndSeed;
 const returnRate = startSeed > 0
   ? (realizedPnl / startSeed) * 100
   : finiteNumber(fallback.returnRate, 0);
 return { startSeed, endSeed, returnRate };
}
function calculateFuturesDailyReturnRate(realizedPnl) {
 const initialUsdt = positiveNumber(
   state.futures && state.futures.account && state.futures.account.initialUsdt,
   DEFAULT_FUTURES_USDT
 );
 if (!(initialUsdt > 0)) return 0;
 return (finiteNumber(realizedPnl, 0) / initialUsdt) * 100;
}
function normalizeFuturesTradeMarker(marker) {
 if (!marker || typeof marker !== "object") return null;
 if (!isKnownFuturesRecord(marker)) return null;
 const time = finiteNumber(marker.time, 0);
 const price = finiteNumber(marker.price, 0);
 if (!time || !price) return null;
 const symbol = normalizeFuturesSymbol(marker.symbol);
 return {
   id: String(marker.id || `fm-${Date.now()}-${Math.random().toString(16).slice(2)}`),
   market: normalizeFuturesMarketCode(marker.market, symbol),
   symbol,
   kind: marker.kind || "MARKER",
   time,
   price,
   label: String(marker.label || "").slice(0, 24),
   direction: marker.direction === "SHORT" ? "SHORT" : marker.direction === "LONG" ? "LONG" : "",
   createdAt: marker.createdAt || new Date().toISOString()
 };
}
function createFuturesEntryMarker(record) {
 if (!record || typeof record !== "object") return null;
 const openedAt = record.entryTime || record.openedAt || record.createdAt;
 const openedAtMs = timestampMs(openedAt);
 const price = finiteNumber(record.entryPrice, 0);
 if (!openedAtMs || !price) return null;
 const directionText = String(record.direction || record.side || "").toUpperCase();
 const direction = directionText === "SHORT" ? "SHORT" : "LONG";
 const market = futuresTradeMarketCode(record);
 const symbol = normalizeFuturesSymbol(record.symbol || futuresMarketByCode(market).symbol);
 return normalizeFuturesTradeMarker({
   id: `entry-${String(record.id || openedAtMs)}`,
   market,
   symbol,
   kind: "ENTRY",
   time: Math.floor(openedAtMs / 1000),
   price,
   direction,
   label: direction === "LONG" ? "롱 진입" : "숏 진입",
   createdAt: new Date(openedAtMs).toISOString()
 });
}
function createFuturesEntryMarkers(record) {
 return futuresEntryLegs(record)
   .map((entry) => createFuturesEntryMarker({
     ...record,
     ...entry,
     id: entry.id,
     entryTime: entry.openedAt,
     openedAt: entry.openedAt
   }))
   .filter(Boolean);
}
function mergeFuturesTradeMarkers(...markerLists) {
 const byKey = new Map();
 markerLists.flat().forEach((item) => {
   const marker = normalizeFuturesTradeMarker(item);
   if (!marker) return;
   const key = marker.kind === "ENTRY"
     ? [marker.kind, marker.market, marker.direction, timestampMs(marker.createdAt), marker.price].join("|")
     : marker.id;
   if (!byKey.has(key)) byKey.set(key, marker);
 });
 return [...byKey.values()].sort((a, b) => a.time - b.time).slice(-440);
}
function normalizeFuturesDailySummaries(value) {
 const list = Array.isArray(value) ? value : [];
 return list
   .map((summary) => normalizeFuturesDailySummary(summary))
   .filter(Boolean)
   .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
function normalizeFuturesDailySummary(summary) {
 if (!summary || !summary.dateKey) return null;
 const dateKey = String(summary.dateKey);
 const sourceTrades = Array.isArray(summary.trades) ? summary.trades : [];
 const hasDetailedTrades = sourceTrades.length > 0;
 const archivedTrades = sourceTrades.map(normalizeFuturesTrade).filter(Boolean);
 if ((hasDetailedTrades && !archivedTrades.length) || (!hasDetailedTrades && !isKnownFuturesRecord(summary))) return null;
 const closedTrades = archivedTrades.length ? archivedTrades : [];
 const tradeCount = hasDetailedTrades
   ? closedTrades.length
   : Math.max(0, Math.round(finiteNumber(summary.tradeCount, 0)));
 const longCount = hasDetailedTrades
   ? closedTrades.filter((trade) => trade.side === "long").length
   : Math.max(0, Math.round(finiteNumber(summary.longCount, 0)));
 const shortCount = hasDetailedTrades
   ? closedTrades.filter((trade) => trade.side === "short").length
   : Math.max(0, Math.round(finiteNumber(summary.shortCount, 0)));
 const realizedPnl = hasDetailedTrades
   ? closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0)
   : finiteNumber(summary.realizedPnl, 0);
 const fee = hasDetailedTrades
   ? closedTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.fee, 0)), 0)
   : Math.max(0, finiteNumber(summary.fee, 0));
 const margin = hasDetailedTrades
   ? closedTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.margin, 0)), 0)
   : Math.max(0, finiteNumber(summary.margin, 0));
 const winCount = Math.max(0, Math.round(finiteNumber(
   hasDetailedTrades ? closedTrades.filter((trade) => finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)) > 0).length : summary.winCount,
   closedTrades.filter((trade) => finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)) > 0).length
 )));
 const avgRoe = hasDetailedTrades
   ? (closedTrades.length
     ? closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.roe, finiteNumber(trade.roePercent, 0)), 0) / closedTrades.length
      : 0)
   : finiteNumber(summary.avgRoe, 0);
 const seedPerformance = calculateFuturesDailySeedPerformance(closedTrades, summary);
 return {
   id: summary.id || `futures-daily-${dateKey}`,
   marketType: "futures",
   symbol: closedTrades[0] ? closedTrades[0].symbol : normalizeFuturesSymbol(summary.symbol),
   dateKey,
   tradeCount,
   longCount,
   shortCount,
   winCount,
   realizedPnl,
   fee,
   margin,
   avgRoe,
   startSeed: seedPerformance.startSeed,
   endSeed: seedPerformance.endSeed,
   returnRate: seedPerformance.returnRate,
   winRate: tradeCount > 0 ? (winCount / tradeCount) * 100 : null,
   trades: archivedTrades,
   createdAt: summary.createdAt || new Date().toISOString(),
   updatedAt: summary.updatedAt || summary.createdAt || new Date().toISOString()
 };
}
function normalizeFuturesTickerMap(value) {
 const source = value && typeof value === "object" ? value : {};
 return Object.keys(FUTURES_MARKETS).reduce((map, marketCode) => {
   const ticker = normalizeTicker(source[marketCode]);
   if (ticker) map[marketCode] = ticker;
   return map;
 }, {});
}
function normalizeFuturesDrawingMap(value, legacyStore, normalizer, emptyFactory) {
 const source = value && typeof value === "object" ? value : {};
 const map = {};
 Object.keys(FUTURES_MARKETS).forEach((marketCode) => {
   map[marketCode] = normalizer(source[marketCode] || (marketCode === DEFAULT_MARKET ? legacyStore : null) || emptyFactory());
 });
 return map;
}
function normalizeFuturesState(value) {
 const source = value && typeof value === "object" ? value : {};
 const fresh = createDefaultFuturesState();
 const legacyPosition = normalizeFuturesPosition(source.position);
 const sourcePositions = Array.isArray(source.positions) ? source.positions : [];
 const unsupportedSourcePositions = sourcePositions.length ? sourcePositions : source.position ? [source.position] : [];
 const unsupportedPositionKeys = new Set();
 const releasedUnsupportedMargin = unsupportedSourcePositions.reduce((sum, position, index) => {
   if (!position || typeof position !== "object" || isKnownFuturesRecord(position)) return sum;
   const key = [
     position.id || `legacy-${index}`,
     position.market || "",
     position.symbol || "",
     position.openedAt || position.entryTime || "",
     finiteNumber(position.entryPrice, 0),
     finiteNumber(position.margin, 0)
   ].join("|");
   if (unsupportedPositionKeys.has(key)) return sum;
   unsupportedPositionKeys.add(key);
   return sum + Math.max(0, finiteNumber(position.margin, 0));
 }, 0);
 const account = normalizeFuturesAccount(source.account);
 if (releasedUnsupportedMargin > 0) {
   account.usdtBalance += releasedUnsupportedMargin;
   account.updatedAt = new Date().toISOString();
 }
 // Deduplicate the legacy pointer before grouping, so it cannot be counted twice in the weighted average.
 const positions = normalizeFuturesPositions([...sourcePositions, ...(legacyPosition ? [legacyPosition] : [])]);
 const journal = normalizeFuturesPositionJournal(source, positions);
 // 차트 진입 표시는 현재 열려 있는 포지션에서만 복원합니다.
 // 청산 거래와 이전 버전에 저장된 마커는 매매 기록에는 남지만 차트에는 다시 표시하지 않습니다.
 const entryMarkers = positions.flatMap(createFuturesEntryMarkers);
 return {
   ...fresh,
   account,
   position: positions[0] || null,
   positions,
   limitOrders: normalizeFuturesLimitOrders(source.limitOrders),
   exitOrders: normalizeFuturesExitOrders(source.exitOrders),
   completedOrderNotices: normalizeFuturesCompletedOrderNotices(source.completedOrderNotices),
   trades: journal.pendingTrades,
   positionBlocks: journal.positionBlocks,
   dailySummaries: journal.dailySummaries,
   positionJournalVersion: FUTURES_POSITION_JOURNAL_VERSION,
   intentionalClearAt: source.intentionalClearAt || "",
    trendlines: normalizeTrendlines(source.trendlines || createEmptyTrendlines()),
    riskBlocks: normalizeRiskBlocks(source.riskBlocks || createEmptyRiskBlocks()),
    trendlinesByMarket: normalizeFuturesDrawingMap(source.trendlinesByMarket, source.trendlines, normalizeTrendlines, createEmptyTrendlines),
    riskBlocksByMarket: normalizeFuturesDrawingMap(source.riskBlocksByMarket, source.riskBlocks, normalizeRiskBlocks, createEmptyRiskBlocks),
    tradeMarkers: mergeFuturesTradeMarkers(entryMarkers),
    tickers: normalizeFuturesTickerMap(source.tickers || {}),
    exchangeRate: positiveNumber(finiteNumber(source.exchangeRate, DEFAULT_USD_KRW_RATE), DEFAULT_USD_KRW_RATE),
   exchangeRateUpdatedAt: source.exchangeRateUpdatedAt || "",
   displayCurrency: "USDT",
   leverage: FUTURES_LEVERAGES.includes(Number(source.leverage)) ? Number(source.leverage) : DEFAULT_FUTURES_LEVERAGE,
   lastRealizedPnl: finiteNumber(source.lastRealizedPnl, 0)
 };
}
function checksumStorageText(text) {
 let hash = 2166136261;
 for (let index = 0; index < text.length; index += 1) {
   hash ^= text.charCodeAt(index);
   hash = Math.imul(hash, 16777619);
 }
 return (hash >>> 0).toString(16).padStart(8, "0");
}
function isPlausibleFuturesStorageData(value) {
 return Boolean(value && typeof value === "object" && !Array.isArray(value) && (
   value.account
    || value.position
    || Array.isArray(value.positions)
    || Array.isArray(value.trades)
    || Array.isArray(value.positionBlocks)
    || Array.isArray(value.dailySummaries)
 ));
}
function parseFuturesStorageCandidate(raw, key) {
 const parsed = JSON.parse(raw);
 if (parsed && parsed.schema === FUTURES_STORAGE_SCHEMA) {
   if (Number(parsed.version) !== FUTURES_STORAGE_SCHEMA_VERSION || !isPlausibleFuturesStorageData(parsed.data)) {
     throw new Error("Unsupported futures storage envelope");
   }
   const dataText = JSON.stringify(parsed.data);
   if (parsed.checksum !== checksumStorageText(dataText)) throw new Error("Futures storage checksum mismatch");
   return {
     key,
     raw,
     data: parsed.data,
     revision: Math.max(0, Math.round(finiteNumber(parsed.revision, 0))),
     savedAt: parsed.savedAt || "",
     legacy: false
   };
 }
 if (!isPlausibleFuturesStorageData(parsed)) throw new Error("Invalid futures storage data");
 return {
   key,
   raw,
   data: parsed,
   revision: 0,
   savedAt: parsed.savedAt || (parsed.account && parsed.account.updatedAt) || "",
   legacy: true
 };
}
function readFuturesStorageSlots() {
 const keys = [SHARED_FUTURES_STORAGE_KEY, SHARED_FUTURES_BACKUP_STORAGE_KEY];
 const candidates = [];
 const invalid = [];
 const rawByKey = {};
 let accessError = null;
 keys.forEach((key) => {
   let raw = null;
   try {
     raw = localStorage.getItem(key);
   } catch (error) {
     accessError = accessError || error;
     return;
   }
   rawByKey[key] = raw;
   if (!raw) return;
   try {
     candidates.push(parseFuturesStorageCandidate(raw, key));
   } catch (error) {
     invalid.push({ key, raw, error: error && error.message ? error.message : String(error) });
   }
 });
 candidates.sort((a, b) => {
   if (a.revision !== b.revision) return b.revision - a.revision;
   const timeDiff = timestampMs(b.savedAt) - timestampMs(a.savedAt);
   if (timeDiff) return timeDiff;
   return a.key === SHARED_FUTURES_STORAGE_KEY ? -1 : 1;
 });
 return { candidates, invalid, rawByKey, accessError, newest: candidates[0] || null };
}
function futuresStorageTradingStats(data) {
 const source = data && typeof data === "object" ? data : {};
 const positions = Array.isArray(source.positions) ? source.positions : [];
 const positionIds = new Set(positions.map((position) => position && position.id).filter(Boolean));
 if (source.position && source.position.id) positionIds.add(source.position.id);
 const activePositionCount = Math.max(positionIds.size, positions.length || (source.position ? 1 : 0));
 const activeCloseCount = Array.isArray(source.trades) ? source.trades.length : 0;
 const positionBlocks = Array.isArray(source.positionBlocks) ? source.positionBlocks : [];
 const blockCloseCount = positionBlocks.reduce((sum, block) => sum + (Array.isArray(block && block.trades) ? block.trades.length : 0), 0);
 const dailySummaries = Array.isArray(source.dailySummaries) ? source.dailySummaries : [];
 const dailyCloseCount = dailySummaries.reduce((sum, summary) => sum + (Array.isArray(summary && summary.trades) ? summary.trades.length : 0), 0);
 const summaryOnlyCount = dailySummaries.filter((summary) => !Array.isArray(summary && summary.trades) || !summary.trades.length).length;
 const recordCount = activeCloseCount + blockCloseCount + dailyCloseCount + positionBlocks.length + summaryOnlyCount;
 return {
   activePositionCount,
   recordCount,
   total: activePositionCount + recordCount,
   score: activePositionCount * 1000000 + recordCount * 1000 + positionBlocks.length
 };
}
function chooseFuturesStorageCandidate(slots) {
 const newest = slots && slots.newest;
 if (!newest) return { candidate: null, recoveredOlderSlot: false, newestStats: futuresStorageTradingStats(null), selectedStats: futuresStorageTradingStats(null) };
 const newestStats = futuresStorageTradingStats(newest.data);
 if (newest.data.intentionalClearAt) {
   return { candidate: newest, recoveredOlderSlot: false, newestStats, selectedStats: newestStats };
 }
 const fallback = (slots.candidates || [])
   .slice(1)
   .map((candidate) => ({ candidate, stats: futuresStorageTradingStats(candidate.data) }))
   .filter((item) => item.stats.total > newestStats.total)
   .sort((a, b) => b.stats.total - a.stats.total || b.stats.recordCount - a.stats.recordCount || b.candidate.revision - a.candidate.revision)[0];
 if (!fallback) return { candidate: newest, recoveredOlderSlot: false, newestStats, selectedStats: newestStats };
 return { candidate: fallback.candidate, recoveredOlderSlot: true, newestStats, selectedStats: fallback.stats };
}
function parseSalvageableFuturesStorageCandidate(raw, key) {
 try {
   const parsed = JSON.parse(raw);
   if (parsed && parsed.schema === FUTURES_STORAGE_SCHEMA && isPlausibleFuturesStorageData(parsed.data)) {
     return {
       key,
       raw,
       data: parsed.data,
       revision: Math.max(0, finiteNumber(parsed.revision, 0)),
       savedAt: parsed.savedAt || "",
       salvaged: true
     };
   }
   if (!isPlausibleFuturesStorageData(parsed)) return null;
   return {
     key,
     raw,
     data: parsed,
     revision: 0,
     savedAt: parsed.savedAt || (parsed.account && parsed.account.updatedAt) || "",
     legacy: true,
     salvaged: true
   };
 } catch (error) {
   return null;
 }
}
function readSalvageableFuturesStorageCandidates(invalid = []) {
 const entries = [...(invalid || [])];
 try {
   const quarantined = readJson(CORRUPT_FUTURES_STORAGE_KEY, null);
   if (quarantined && Array.isArray(quarantined.entries)) entries.push(...quarantined.entries);
 } catch (error) {
   console.warn("Futures quarantine read failed", error);
 }
 const seen = new Set();
 return entries
   .filter((entry) => entry && entry.raw && !seen.has(entry.raw) && seen.add(entry.raw))
   .map((entry, index) => parseSalvageableFuturesStorageCandidate(entry.raw, entry.key || `quarantine-${index}`))
   .filter(Boolean);
}
function chooseSalvageableFuturesStorageCandidate(candidates) {
 return (candidates || [])
   .map((candidate) => ({ candidate, stats: futuresStorageTradingStats(candidate.data) }))
   .filter((item) => item.stats.total > 0)
   .sort((a, b) => b.stats.total - a.stats.total || b.stats.recordCount - a.stats.recordCount || b.candidate.revision - a.candidate.revision)[0] || null;
}
function chooseRecoverableFuturesStorageCandidate(slots) {
 let choice = chooseFuturesStorageCandidate(slots);
 const primaryWasIntentionallyCleared = Boolean(choice.candidate && choice.candidate.data.intentionalClearAt);
 const salvageable = chooseSalvageableFuturesStorageCandidate(readSalvageableFuturesStorageCandidates(slots && slots.invalid));
 if (!primaryWasIntentionallyCleared && salvageable && salvageable.stats.total > choice.selectedStats.total) {
   choice = {
     candidate: salvageable.candidate,
     recoveredOlderSlot: true,
     recoveredQuarantine: true,
     newestStats: choice.newestStats,
     selectedStats: salvageable.stats
   };
 }
 return choice;
}
function quarantineInvalidFuturesStorage(invalid) {
 if (!invalid || !invalid.length) return;
 try {
   safeSetJson(CORRUPT_FUTURES_STORAGE_KEY, {
     capturedAt: new Date().toISOString(),
     entries: invalid.map((entry) => ({ key: entry.key, raw: entry.raw, error: entry.error }))
   });
 } catch (error) {
   console.warn("Futures corrupt storage quarantine failed", error);
 }
}
function removeMigratedLegacyFuturesStorage() {
 const protectedKeys = new Set([SHARED_FUTURES_STORAGE_KEY, SHARED_FUTURES_BACKUP_STORAGE_KEY]);
 [...new Set(Object.values(FUTURES_STORAGE_KEYS))].forEach((key) => {
   if (!key || protectedKeys.has(key)) return;
   try {
     safeRemoveItem(key);
   } catch (error) {
     console.warn("Legacy futures storage cleanup failed", key, error);
   }
 });
}
function removeNonEssentialFuturesCacheStorage() {
 const keys = [];
 try {
   for (let index = 0; index < localStorage.length; index += 1) {
     const key = localStorage.key(index);
     if (!key) continue;
     if (key.startsWith(`${FUTURES_TICK_STORAGE_PREFIX}.`)) {
       keys.push(key);
       continue;
     }
     // All local files share the same file:// localStorage quota in Chromium.
     // A stale prediction snapshot can grow past 10 MB and otherwise block an
     // unrelated futures close from being committed. Only evict it after a
     // futures write has already failed, and only when it is clearly oversized.
     if (key === "btcPredictionSnapshots.v1") {
       const cached = localStorage.getItem(key);
       if (cached && cached.length > 1000000) keys.push(key);
     }
   }
 } catch (error) {
   console.warn("Futures cache storage scan failed", error);
   return;
 }
 keys.forEach((key) => {
   try {
     safeRemoveItem(key);
   } catch (error) {
     console.warn("Futures cache storage cleanup failed", key, error);
   }
 });
}
function compactFuturesTradeForStorage(trade) {
 const normalized = normalizeFuturesTrade(trade);
 if (!normalized) return null;
 const { entries, ...compactTrade } = normalized;
 return compactTrade;
}
function compactFuturesPositionBlockForStorage(block) {
 const normalized = normalizeFuturesPositionBlock(block);
 if (!normalized) return null;
 return {
   ...normalized,
   entries: futuresEntryLegs({ ...normalized, entries: normalized.entries }),
   trades: normalized.trades.map(compactFuturesTradeForStorage).filter(Boolean)
 };
}
function buildFuturesStoragePayload() {
 const futures = state.futures;
 const positions = getFuturesPositions();
 return {
   market: state.market,
   symbol: currentFuturesSymbol(),
   priceSource: futuresPriceSourceForMarket(state.market),
   account: futures.account,
   // positions already contains the legacy `position` pointer, so do not store it twice.
   position: null,
   positions,
   limitOrders: normalizeFuturesLimitOrders(futures.limitOrders),
   exitOrders: normalizeFuturesExitOrders(futures.exitOrders),
   completedOrderNotices: normalizeFuturesCompletedOrderNotices(futures.completedOrderNotices),
   // Entry legs live once on the open position or completed block. Repeating them
   // inside every close leg can multiply storage size by the number of partial closes.
   trades: (futures.trades || []).map(compactFuturesTradeForStorage).filter(Boolean),
   positionBlocks: (futures.positionBlocks || []).map(compactFuturesPositionBlockForStorage).filter(Boolean),
   dailySummaries: futures.dailySummaries,
   positionJournalVersion: FUTURES_POSITION_JOURNAL_VERSION,
   intentionalClearAt: futures.intentionalClearAt || "",
   trendlines: futures.trendlines,
   riskBlocks: futures.riskBlocks,
   trendlinesByMarket: futures.trendlinesByMarket,
   riskBlocksByMarket: futures.riskBlocksByMarket,
   // Entry markers are rebuilt from open positions while loading.
   tradeMarkers: [],
   tickers: futures.tickers,
   exchangeRate: futures.exchangeRate,
   exchangeRateUpdatedAt: futures.exchangeRateUpdatedAt,
   displayCurrency: futures.displayCurrency,
   leverage: futures.leverage,
   lastRealizedPnl: futures.lastRealizedPnl
 };
}
function buildFuturesTradingBackupPayload(source = buildFuturesStoragePayload()) {
 const payload = source && typeof source === "object" ? source : {};
 const positions = normalizeFuturesPositions([
   ...(Array.isArray(payload.positions) ? payload.positions : []),
   ...(payload.position ? [payload.position] : [])
 ]).filter((position) => futuresPositionMarketCode(position) === DEFAULT_MARKET);
 const journal = normalizeFuturesPositionJournal(payload, positions);
 const trades = mergeFuturesTradesById(journal.pendingTrades || [])
   .filter((trade) => futuresTradeMarketCode(trade) === DEFAULT_MARKET)
   .map(compactFuturesTradeForStorage)
   .filter(Boolean);
 const positionBlocks = normalizeFuturesPositionBlocks(journal.positionBlocks || [])
   .filter((block) => normalizeFuturesMarketCode(block.market, block.symbol) === DEFAULT_MARKET)
   .map(compactFuturesPositionBlockForStorage)
   .filter(Boolean);
 const dailySummaries = normalizeFuturesDailySummaries(journal.dailySummaries || [])
   .map((summary) => {
     const originalTrades = Array.isArray(summary.trades) ? summary.trades : [];
     const filteredTrades = originalTrades.filter((trade) => futuresTradeMarketCode(trade) === DEFAULT_MARKET);
     if (originalTrades.length && !filteredTrades.length) return null;
     return { ...summary, trades: filteredTrades.map(compactFuturesTradeForStorage).filter(Boolean) };
   })
   .filter(Boolean);
 const account = normalizeFuturesAccount(payload.account);
 return {
   market: DEFAULT_MARKET,
   symbol: FUTURES_MARKETS[DEFAULT_MARKET].symbol,
   priceSource: futuresPriceSourceForMarket(DEFAULT_MARKET),
   account,
    position: null,
    positions,
    limitOrders: normalizeFuturesLimitOrders(payload.limitOrders)
      .filter((order) => order.market === DEFAULT_MARKET),
   settledLimitOrderIds: normalizeFuturesLimitOrderSettledIds([
     ...(Array.isArray(payload.settledLimitOrderIds) ? payload.settledLimitOrderIds : []),
     ...futuresLimitOrderSettledIds
   ]),
   exitOrders: normalizeFuturesExitOrders(payload.exitOrders)
     .filter((order) => order.market === DEFAULT_MARKET),
   completedOrderNotices: normalizeFuturesCompletedOrderNotices(payload.completedOrderNotices)
     .filter((notice) => notice.market === DEFAULT_MARKET),
   settledExitOrderIds: normalizeFuturesExitOrderSettledIds([
     ...(Array.isArray(payload.settledExitOrderIds) ? payload.settledExitOrderIds : []),
     ...futuresExitOrderSettledIds
   ]),
    trades,
   positionBlocks,
   dailySummaries,
   positionJournalVersion: FUTURES_POSITION_JOURNAL_VERSION,
   intentionalClearAt: payload.intentionalClearAt || "",
   exchangeRate: positiveNumber(finiteNumber(payload.exchangeRate, futuresExchangeRate()), futuresExchangeRate()),
   exchangeRateUpdatedAt: payload.exchangeRateUpdatedAt || "",
   displayCurrency: "USDT",
   leverage: FUTURES_LEVERAGES.includes(Number(payload.leverage)) ? Number(payload.leverage) : DEFAULT_FUTURES_LEVERAGE,
   lastRealizedPnl: finiteNumber(payload.lastRealizedPnl, 0)
 };
}
function futuresTradingBackupContentChecksum(data) {
 const comparable = cloneJsonValue(data || {});
 if (comparable.account) delete comparable.account.updatedAt;
 delete comparable.exchangeRateUpdatedAt;
 return checksumStorageText(JSON.stringify(comparable));
}
function futuresTradingRecordMap(data) {
 const source = data && typeof data === "object" ? data : {};
 const records = new Map();
 const sourceAccount = source.account && typeof source.account === "object" ? source.account : null;
 const sourceUpdatedAt = sourceAccount && sourceAccount.updatedAt || "";
 if (sourceAccount) {
   records.set("account", {
     type: "account",
     value: { ...normalizeFuturesAccount(sourceAccount), updatedAt: sourceUpdatedAt }
   });
 }
 const addEntry = (entry, fallback = {}) => {
   const normalized = normalizeFuturesEntryLeg(entry, fallback);
   if (normalized && normalized.id) records.set("entry:" + normalized.id, { type: "entry", value: normalized });
 };
 const addPosition = (position) => {
   const normalized = normalizeFuturesPosition(position);
   if (!normalized) return;
   records.set("position:" + normalized.id, {
     type: "position",
     value: { ...normalized, stateUpdatedAt: sourceUpdatedAt }
   });
   futuresEntryLegs(normalized).forEach((entry) => addEntry(entry, normalized));
 };
 const addTrade = (trade) => {
   const normalized = normalizeFuturesTrade(trade);
   if (!normalized) return;
   futuresEntryLegs(trade).forEach((entry) => addEntry(entry, normalized));
   const compact = compactFuturesTradeForStorage(normalized);
   if (compact && compact.id) records.set("trade:" + compact.id, { type: "trade", value: compact });
   if (normalized.positionId && !records.has("position:" + normalized.positionId)) {
     records.set("position:" + normalized.positionId, { type: "position", value: { id: normalized.positionId } });
   }
 };
 (Array.isArray(source.positions) ? source.positions : []).forEach(addPosition);
 if (source.position) addPosition(source.position);
 normalizeFuturesLimitOrders(source.limitOrders).forEach((order) => {
   records.set("limitOrder:" + order.id, { type: "limitOrder", value: order });
 });
 normalizeFuturesExitOrders(source.exitOrders).forEach((order) => {
   records.set("exitOrder:" + order.id, { type: "exitOrder", value: order });
 });
 (Array.isArray(source.trades) ? source.trades : []).forEach(addTrade);
 (Array.isArray(source.positionBlocks) ? source.positionBlocks : []).forEach((block) => {
   const normalizedBlock = normalizeFuturesPositionBlock(block);
   if (normalizedBlock) {
     const blockPositionId = String(normalizedBlock.positionId || normalizedBlock.id);
     records.set("block:" + blockPositionId, {
       type: "block",
       value: compactFuturesPositionBlockForStorage(normalizedBlock)
     });
     futuresEntryLegs(normalizedBlock).forEach((entry) => addEntry(entry, normalizedBlock));
     normalizedBlock.trades.forEach(addTrade);
     const positionKey = "position:" + blockPositionId;
     const positionRecord = records.get(positionKey);
     if (!positionRecord || !positionRecord.value || !positionRecord.value.market) {
       records.set(positionKey, {
         type: "position",
         value: {
           id: blockPositionId,
           closedAt: normalizedBlock.exitTime || normalizedBlock.closedAt,
           stateUpdatedAt: normalizedBlock.updatedAt || normalizedBlock.exitTime || normalizedBlock.closedAt
         }
       });
     }
   }
 });
 (Array.isArray(source.dailySummaries) ? source.dailySummaries : []).forEach((summary) => {
   const summaryTrades = Array.isArray(summary && summary.trades) ? summary.trades : [];
   summaryTrades.forEach(addTrade);
   if (!summaryTrades.length && summary && (summary.id || summary.dateKey)) {
     records.set("summary:" + String(summary.id || summary.dateKey), { type: "summary", value: cloneJsonValue(summary) });
   }
 });
 return records;
}
function futuresTradingRecordIds(data) {
 return new Set(futuresTradingRecordMap(data).keys());
}
function futuresBackupRecordHasExtraInformation(backupRecord, currentRecord) {
 if (!backupRecord || !currentRecord || backupRecord.type !== currentRecord.type) return true;
 if (backupRecord.type === "position") {
   const backupClosedAt = timestampMs(backupRecord.value && backupRecord.value.closedAt);
   const currentClosedAt = timestampMs(currentRecord.value && currentRecord.value.closedAt);
   const backupStateAt = timestampMs(backupRecord.value && backupRecord.value.stateUpdatedAt);
   const currentStateAt = timestampMs(currentRecord.value && currentRecord.value.stateUpdatedAt);
   if (!backupClosedAt && currentClosedAt && Math.max(currentClosedAt, currentStateAt) >= backupStateAt) {
     return false;
   }
 }
 const fields = backupRecord.type === "account"
   ? ["initialUsdt", "usdtBalance"]
   : backupRecord.type === "position"
     ? ["market", "symbol", "direction", "marginMode", "leverage", "entryPrice", "margin", "notional", "quantity", "entryFee", "basisAdjustmentUsdt", "remainingPercent", "seedBeforeEntry", "memo", "openedAt", "closedAt"]
   : backupRecord.type === "block"
     ? ["market", "symbol", "direction", "leverage", "entryPrice", "exitPrice", "margin", "quantity", "entryCount", "closeCount", "fee", "netPnl", "roe", "memo", "entryTime", "exitTime"]
   : backupRecord.type === "entry"
   ? ["market", "symbol", "direction", "leverage", "entryPrice", "margin", "notional", "quantity", "entryFee", "exchangeRate", "sourceLimitOrderId", "orderType", "openedAt"]
   : backupRecord.type === "trade"
     ? ["positionId", "market", "symbol", "side", "direction", "leverage", "entryPrice", "exitPrice", "margin", "notional", "quantity", "grossPnl", "fee", "entryFee", "exitFee", "netPnl", "roe", "entryTime", "exitTime", "memo"]
     : backupRecord.type === "limitOrder"
       ? ["market", "symbol", "direction", "price", "margin", "leverage", "referencePrice", "createdAt"]
     : backupRecord.type === "exitOrder"
       ? ["positionId", "market", "symbol", "direction", "price", "triggerSide", "referencePrice", "createdAt", "updatedAt"]
       : ["dateKey", "tradeCount", "realizedPnl", "returnRate", "winRate"];
 let clearlyMissingInformation = false;
 const differingFields = [];
 fields.forEach((field) => {
   const backupValue = backupRecord.value && backupRecord.value[field];
   const currentValue = currentRecord.value && currentRecord.value[field];
   if (typeof backupValue === "number") {
     if (!Number.isFinite(backupValue)) return;
     if (!Number.isFinite(currentValue)) {
       clearlyMissingInformation = true;
       differingFields.push(field);
       return;
     }
     const tolerance = Math.max(1e-10, Math.abs(backupValue) * 1e-10);
     if (Math.abs(backupValue - currentValue) > tolerance) differingFields.push(field);
     return;
   }
   const backupText = String(backupValue || "");
   const currentText = String(currentValue || "");
   const editableMemo = field === "memo" && ["position", "block", "trade"].includes(backupRecord.type);
   if (editableMemo) {
     if (backupText !== currentText) differingFields.push(field);
     return;
   }
   if (!backupText) return;
   if (!currentText) clearlyMissingInformation = true;
   if (backupText !== currentText) differingFields.push(field);
 });
 if (!differingFields.length) return false;
 const memoOnlyDifference = differingFields.every((field) => field === "memo");
 if (["block", "trade"].includes(backupRecord.type) && !memoOnlyDifference) return true;
 if (clearlyMissingInformation && !memoOnlyDifference) return true;
 if (["account", "position"].includes(backupRecord.type) || memoOnlyDifference) {
   const backupUpdatedAt = backupRecord.type === "position"
     ? backupRecord.value.stateUpdatedAt
     : backupRecord.value.updatedAt;
   const currentUpdatedAt = currentRecord.type === "position"
     ? currentRecord.value.stateUpdatedAt
     : currentRecord.value.updatedAt;
   const backupTimestamp = timestampMs(backupUpdatedAt);
   const currentTimestamp = timestampMs(currentUpdatedAt);
   if (backupTimestamp && currentTimestamp && backupTimestamp < currentTimestamp) return false;
 }
 return true;
}
function futuresBackupUnrepresentedRecordDetails(backupData, currentData, options = {}) {
 const backupRecords = futuresTradingRecordMap(backupData);
 const currentRecords = futuresTradingRecordMap(currentData);
 const settledLimitOrderIds = new Set(normalizeFuturesLimitOrderSettledIds(currentData && currentData.settledLimitOrderIds));
 const settledExitOrderIds = new Set(normalizeFuturesExitOrderSettledIds(currentData && currentData.settledExitOrderIds));
 const durableOnly = Boolean(options.durableOnly);
 currentRecords.forEach((record) => {
   const sourceLimitOrderId = record && record.type === "entry" && record.value && record.value.sourceLimitOrderId;
   if (sourceLimitOrderId) settledLimitOrderIds.add(String(sourceLimitOrderId));
 });
 const details = [];
 backupRecords.forEach((backupRecord, id) => {
   const currentRecord = currentRecords.get(id);
   if (!currentRecord && backupRecord.type === "limitOrder" && settledLimitOrderIds.has(String(backupRecord.value && backupRecord.value.id || ""))) {
     return;
   }
   if (!currentRecord && backupRecord.type === "exitOrder" && settledExitOrderIds.has(String(backupRecord.value && backupRecord.value.id || ""))) {
     return;
   }
   if (durableOnly && ["account", "position"].includes(backupRecord.type) && currentRecord) return;
   if (!currentRecord) {
     details.push({ id, type: backupRecord.type, kind: "missing", value: backupRecord.value });
     return;
   }
   if (futuresBackupRecordHasExtraInformation(backupRecord, currentRecord)) {
     details.push({ id, type: backupRecord.type, kind: "changed", value: backupRecord.value });
   }
 });
 return details;
}
function futuresBackupHasUnrepresentedRecords(backupData, currentData) {
 return futuresBackupUnrepresentedRecordDetails(backupData, currentData).length > 0;
}
function futuresBackupHasUnrepresentedDurableRecords(backupData, currentData) {
 return futuresBackupUnrepresentedRecordDetails(backupData, currentData, { durableOnly: true }).length > 0;
}
function futuresLedgerResetTimestamp(data) {
 return timestampMs(data && data.intentionalClearAt);
}
function futuresBackupDocumentNeedsRecovery(backupDocument, backupData, currentData, currentRevision = futuresStorageRevision) {
 if (!backupDocument) return false;
 const backupLedgerResetAt = futuresLedgerResetTimestamp(backupData);
 const currentLedgerResetAt = futuresLedgerResetTimestamp(currentData);
 // 이전 장부의 백업은 현재 장부에 절대로 복원하거나 병합하지 않습니다.
 if (backupLedgerResetAt < currentLedgerResetAt) return false;
 // 더 최근에 초기화된 백업은 기록이 비어 있어도 현재 장부보다 우선합니다.
 if (backupLedgerResetAt > currentLedgerResetAt) return true;
 if (!futuresBackupHasUnrepresentedRecords(backupData, currentData)) return false;
 const backupRevision = Math.max(0, finiteNumber(backupDocument.sourceRevision, 0));
 const normalizedCurrentRevision = Math.max(0, finiteNumber(currentRevision, futuresStorageRevision));
 if (futuresBackupHasUnrepresentedDurableRecords(backupData, currentData)) return true;
 // Mutable snapshots (account balance, an existing open position, exchange rate, etc.)
 // are ordered by the verified storage revision. Equal or older mirrors must not reopen
 // a recovery dialog merely because their timestamps or live values differ.
 return backupRevision > normalizedCurrentRevision;
}
async function sha256ChecksumText(text) {
 if (!window.crypto || !window.crypto.subtle || typeof TextEncoder !== "function") return "";
 const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
 return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
async function createFuturesLiveBackupDocument(data, storageVerified = true, reason = "", sourceRevision = futuresStorageRevision) {
 const stateData = cloneJsonValue(data);
 const dataText = JSON.stringify(stateData);
 return {
   format: FUTURES_LIVE_BACKUP_FILE_FORMAT,
   version: FUTURES_LIVE_BACKUP_FILE_VERSION,
   updatedAt: new Date().toISOString(),
   sourceRevision: Math.max(0, finiteNumber(sourceRevision, futuresStorageRevision)),
   storageVerified: Boolean(storageVerified),
   reason: String(reason || ""),
   checksumAlgorithm: "FNV-1a-32 + SHA-256",
   checksum: checksumStorageText(dataText),
   sha256: await sha256ChecksumText(dataText),
   data: stateData
 };
}
function openFuturesLiveBackupDb() {
 if (futuresLiveBackupDbPromise) return futuresLiveBackupDbPromise;
 if (!window.indexedDB) return Promise.reject(new Error("IndexedDB is unavailable"));
 futuresLiveBackupDbPromise = new Promise((resolve, reject) => {
   const request = window.indexedDB.open(FUTURES_LIVE_BACKUP_DB_NAME, 1);
   request.onupgradeneeded = () => {
     const db = request.result;
     if (!db.objectStoreNames.contains(FUTURES_LIVE_BACKUP_DB_STORE)) {
       db.createObjectStore(FUTURES_LIVE_BACKUP_DB_STORE);
     }
   };
   request.onsuccess = () => {
     const db = request.result;
     db.onversionchange = () => {
       db.close();
       futuresLiveBackupDbPromise = null;
     };
     resolve(db);
   };
   request.onerror = () => {
     futuresLiveBackupDbPromise = null;
     reject(request.error || new Error("백업 저장소를 열지 못했습니다."));
   };
   request.onblocked = () => {
     futuresLiveBackupDbPromise = null;
     reject(new Error("다른 탭이 백업 저장소를 사용 중입니다."));
   };
 });
 futuresLiveBackupDbPromise = futuresLiveBackupDbPromise.catch((error) => {
   futuresLiveBackupDbPromise = null;
   throw error;
 });
 return futuresLiveBackupDbPromise;
}
async function readFuturesLiveBackupDbValue(key) {
 const db = await openFuturesLiveBackupDb();
 return new Promise((resolve, reject) => {
   const transaction = db.transaction(FUTURES_LIVE_BACKUP_DB_STORE, "readonly");
   const request = transaction.objectStore(FUTURES_LIVE_BACKUP_DB_STORE).get(key);
   request.onsuccess = () => resolve(request.result || null);
   request.onerror = () => reject(request.error || new Error("백업 정보를 읽지 못했습니다."));
 });
}
async function writeFuturesLiveBackupDbValue(key, value) {
 const db = await openFuturesLiveBackupDb();
 return new Promise((resolve, reject) => {
   const transaction = db.transaction(FUTURES_LIVE_BACKUP_DB_STORE, "readwrite");
   transaction.objectStore(FUTURES_LIVE_BACKUP_DB_STORE).put(value, key);
   transaction.oncomplete = () => resolve(true);
   transaction.onerror = () => reject(transaction.error || new Error("백업 정보를 저장하지 못했습니다."));
   transaction.onabort = () => reject(transaction.error || new Error("백업 정보 저장이 취소되었습니다."));
 });
}
function setFuturesLiveBackupState(nextState, message = "") {
 futuresLiveBackupState = nextState;
 futuresLiveBackupMessage = message;
 renderFuturesLiveBackupStatus();
}
function renderFuturesLiveBackupStatus() {
 if (!el.futuresLiveBackupBar || !el.futuresLiveBackupStatus) return;
 const defaults = {
   checking: "기존 실시간 백업 연결과 복구본을 확인하는 중입니다.",
   disconnected: "브라우저 이중 저장 작동 중 · 독립 파일을 한 번 연결하세요.",
   reconnect: "백업 파일 권한을 다시 연결해야 합니다. 브라우저 내부 저장은 정상입니다.",
   saving: "단일 백업 파일에 최신 매매 데이터를 저장하는 중입니다.",
   connected: futuresLiveBackupLastWrittenAt
     ? "연결됨 · 마지막 파일 저장 " + formatDateTime(futuresLiveBackupLastWrittenAt)
     : "단일 백업 파일이 연결되었습니다.",
   recoverable: "백업 파일에 현재 화면보다 더 많은 기록이 있어 덮어쓰지 않고 보호했습니다.",
   unsupported: "이 브라우저는 단일 파일 자동 갱신을 지원하지 않습니다. 응급 백업 다운로드를 사용하세요.",
   error: "독립 파일 저장에 실패했습니다. 브라우저 내부 이중 저장은 계속 작동합니다."
 };
 el.futuresLiveBackupBar.dataset.state = futuresLiveBackupState;
 setText(el.futuresLiveBackupStatus, futuresLiveBackupMessage || defaults[futuresLiveBackupState] || defaults.disconnected);
 if (el.futuresLiveBackupBtn) {
   el.futuresLiveBackupBtn.disabled = futuresLiveBackupState === "checking" || futuresLiveBackupState === "saving";
   setText(
     el.futuresLiveBackupBtn,
     futuresLiveBackupState === "connected" ? "백업 파일 변경" : futuresLiveBackupState === "reconnect" ? "파일 다시 연결" : "백업 파일 연결"
   );
 }
}
async function futuresLiveBackupPermission(handle, requestPermission = false) {
 if (!handle) return "denied";
 const options = { mode: "readwrite" };
 let permission = typeof handle.queryPermission === "function" ? await handle.queryPermission(options) : "prompt";
 if (permission !== "granted" && requestPermission && typeof handle.requestPermission === "function") {
   permission = await handle.requestPermission(options);
 }
 return permission;
}
async function persistFuturesLiveBackupHandle(handle) {
 if (!handle) throw new Error("백업 파일 핸들이 없습니다.");
 await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_HANDLE_KEY, handle);
 const storedHandle = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_HANDLE_KEY);
 if (!storedHandle) throw new Error("백업 파일 연결 정보를 브라우저에 저장하지 못했습니다.");
 if (typeof handle.isSameEntry === "function") {
   const sameEntry = await handle.isSameEntry(storedHandle);
   if (!sameEntry) throw new Error("저장된 백업 파일 연결 정보가 선택한 파일과 다릅니다.");
 }
 return true;
}
async function readFuturesBackupFromHandle(handle) {
 const file = await handle.getFile();
 if (!file.size) return null;
 const text = await file.text();
 if (!text.trim()) return null;
 return {
   document: JSON.parse(text),
   data: await parseFuturesBackupDocument(text)
 };
}
async function withFuturesLiveBackupCommitLock(callback) {
 const lockManager = window.navigator && window.navigator.locks;
 if (lockManager && typeof lockManager.request === "function") {
   return lockManager.request(FUTURES_LIVE_BACKUP_COMMIT_LOCK, { mode: "exclusive" }, callback);
 }
 return callback();
}
async function futuresBackupReplacementDecision(existingDocument, candidateDocument) {
 if (!existingDocument) return { write: true, reason: "empty", existingData: null };
 const existingData = await parseFuturesBackupDocument(JSON.stringify(existingDocument));
 const existingContentChecksum = futuresTradingBackupContentChecksum(existingData);
 const candidateContentChecksum = futuresTradingBackupContentChecksum(candidateDocument.data);
 if (existingContentChecksum === candidateContentChecksum) {
   return { write: false, reason: "same", existingData };
 }
 const existingRevision = Math.max(0, finiteNumber(existingDocument.sourceRevision, 0));
 const candidateRevision = Math.max(0, finiteNumber(candidateDocument.sourceRevision, 0));
 const candidateClearAt = futuresLedgerResetTimestamp(candidateDocument.data);
 const existingClearAt = futuresLedgerResetTimestamp(existingData);
 // 장부 초기화 세대를 먼저 비교합니다. 이전 세대의 리비전이나 파일 수정시각이
 // 더 커도 새 장부에 과거 매매기록을 다시 합치지 않습니다.
 if (candidateClearAt > existingClearAt) {
   return { write: true, reason: "newer-ledger-reset", existingData };
 }
 if (candidateClearAt < existingClearAt) {
   return { write: false, reason: "older-ledger-reset", existingData };
 }
 const existingHasExtraRecords = futuresBackupHasUnrepresentedRecords(existingData, candidateDocument.data);
 const candidateHasExtraRecords = futuresBackupHasUnrepresentedRecords(candidateDocument.data, existingData);
 const existingHasDurableExtraRecords = futuresBackupHasUnrepresentedDurableRecords(existingData, candidateDocument.data);
 const candidateHasDurableExtraRecords = futuresBackupHasUnrepresentedDurableRecords(candidateDocument.data, existingData);
 if (
   candidateRevision > existingRevision
   && !existingHasDurableExtraRecords
 ) {
   return { write: true, reason: "candidate-newer", existingData };
 }
 if (
   existingRevision > candidateRevision
   && !candidateHasDurableExtraRecords
 ) {
   return { write: false, reason: "newer", existingData };
 }
 if (existingHasDurableExtraRecords) {
   return { write: false, reason: "conflict", existingData };
 }
 if (candidateHasDurableExtraRecords) return { write: true, reason: "candidate-superset", existingData };
 // At an equal revision, mutable values can still differ after an interrupted or
 // delayed mirror write. The verified current candidate is authoritative here;
 // treating an older account timestamp as a missing trade creates a dialog loop.
 if (existingHasExtraRecords || candidateHasExtraRecords) {
   return { write: true, reason: "candidate-equal-revision", existingData };
 }
 if (existingRevision > candidateRevision) {
   return { write: false, reason: "newer", existingData };
 }
 return { write: true, reason: "candidate-newer", existingData };
}
async function writeFuturesLiveBackupMirrorSafely(backupDocument) {
 let existingDocument = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY);
 let decision;
 try {
   decision = await futuresBackupReplacementDecision(existingDocument, backupDocument);
 } catch (error) {
   if (existingDocument) {
     try {
       await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_CORRUPT_SNAPSHOT_KEY, {
         preservedAt: new Date().toISOString(),
         value: existingDocument
       });
     } catch (preserveError) {
       console.warn("Invalid IndexedDB backup could not be preserved", preserveError);
     }
   }
   decision = { write: true, reason: "replace-invalid", existingData: null };
 }
 if (!decision.write) return { ...decision, written: false, document: existingDocument };
 await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY, backupDocument);
 existingDocument = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY);
 if (!existingDocument) throw new Error("브라우저 복구 미러의 저장 확인에 실패했습니다.");
 await parseFuturesBackupDocument(JSON.stringify(existingDocument));
 if (
   String(existingDocument.checksum || "") !== String(backupDocument.checksum || "")
   || finiteNumber(existingDocument.sourceRevision, -1) !== finiteNumber(backupDocument.sourceRevision, -2)
 ) {
   throw new Error("브라우저 복구 미러의 저장 후 검증에 실패했습니다.");
 }
 return { ...decision, written: true, document: existingDocument };
}
async function writeFuturesLiveBackupFile(handle, backupDocument) {
 const writable = await handle.createWritable();
 try {
   await writable.write(JSON.stringify(backupDocument, null, 2));
   await writable.close();
 } catch (error) {
   try { await writable.abort(); } catch (abortError) { console.warn("Live backup abort failed", abortError); }
   throw error;
 }
 const verified = await readFuturesBackupFromHandle(handle);
 if (!verified || futuresTradingBackupContentChecksum(verified.data) !== futuresTradingBackupContentChecksum(backupDocument.data)) {
   throw new Error("실시간 백업 파일의 저장 후 검증에 실패했습니다.");
 }
 return verified;
}
async function writeFuturesLiveBackupFileSafely(handle, backupDocument) {
 let existingBackup = null;
 try {
   existingBackup = await readFuturesBackupFromHandle(handle);
 } catch (error) {
   const invalidError = new Error("기존 백업 파일이 손상되었거나 올바른 형식이 아니어서 덮어쓰지 않았습니다. 파일을 다시 연결하세요.");
   invalidError.code = "FUTURES_BACKUP_INVALID";
   throw invalidError;
 }
 const decision = await futuresBackupReplacementDecision(
   existingBackup && existingBackup.document,
   backupDocument
 );
 if (!decision.write) {
   return { ...decision, written: false, document: existingBackup && existingBackup.document };
 }
 const verified = await writeFuturesLiveBackupFile(handle, backupDocument);
 return { ...decision, written: true, document: verified.document, existingData: verified.data };
}
async function preserveFuturesLiveBackupConflictDocument(document, sourceLabel = "") {
 if (!document) return false;
 const storedArchive = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_CONFLICT_ARCHIVE_KEY);
 const entries = Array.isArray(storedArchive && storedArchive.entries) ? storedArchive.entries : [];
 const checksum = String(document.checksum || "");
 const sourceRevision = Math.max(0, finiteNumber(document.sourceRevision, 0));
 const duplicateKey = [checksum, sourceRevision, String(sourceLabel || "")].join("|");
 const nextEntries = [
   {
     preservedAt: new Date().toISOString(),
     source: String(sourceLabel || ""),
     document: cloneJsonValue(document)
   },
   ...entries.filter((entry) => {
     const archived = entry && entry.document;
     if (!archived) return false;
     const archivedKey = [
       String(archived.checksum || ""),
       Math.max(0, finiteNumber(archived.sourceRevision, 0)),
       String(entry.source || "")
     ].join("|");
     return archivedKey !== duplicateKey;
   })
 ].slice(0, FUTURES_LIVE_BACKUP_CONFLICT_ARCHIVE_LIMIT);
 await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_CONFLICT_ARCHIVE_KEY, {
   updatedAt: new Date().toISOString(),
   entries: nextEntries
 });
 const verifiedArchive = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_CONFLICT_ARCHIVE_KEY);
 return Boolean(
   verifiedArchive
   && Array.isArray(verifiedArchive.entries)
   && verifiedArchive.entries.some((entry) => {
     const archived = entry && entry.document;
     return archived
       && String(archived.checksum || "") === checksum
       && Math.max(0, finiteNumber(archived.sourceRevision, 0)) === sourceRevision;
   })
 );
}
function futuresBackupOpenPositionEntryIds(data) {
 const source = data && typeof data === "object" ? data : {};
 const ids = new Set();
 normalizeFuturesPositions([
   ...(Array.isArray(source.positions) ? source.positions : []),
   ...(source.position ? [source.position] : [])
 ]).forEach((position) => {
   futuresEntryLegs(position).forEach((entry) => {
     if (entry && entry.id) ids.add(String(entry.id));
   });
 });
 return ids;
}
function futuresBackupHistoryCanBeMergedSafely(importedData, currentData, importedDocument = null) {
 if (futuresLedgerResetTimestamp(importedData) !== futuresLedgerResetTimestamp(currentData)) return false;
 const importedRevision = Math.max(0, finiteNumber(importedDocument && importedDocument.sourceRevision, 0));
 if (futuresStorageRevision < importedRevision) return false;
 const importedDifferences = futuresBackupUnrepresentedRecordDetails(importedData, currentData, { durableOnly: true });
 const currentDifferences = futuresBackupUnrepresentedRecordDetails(currentData, importedData, { durableOnly: true });
 const differences = [...importedDifferences, ...currentDifferences];
 if (!differences.length) return false;
 const mergeableTypes = new Set(["entry", "trade", "block", "summary"]);
 const missingHistoricalPositionIds = new Set(
   differences
     .filter((detail) => detail.kind === "missing" && detail.type === "block")
     .map((detail) => String(detail.id).replace(/^block:/, ""))
 );
 const hasUnmergeableDifference = differences.some((detail) => {
   if (detail.kind !== "missing") return true;
   if (mergeableTypes.has(detail.type)) return false;
   if (detail.type !== "position") return true;
   const positionId = String(detail.id).replace(/^position:/, "");
   return !missingHistoricalPositionIds.has(positionId) || !timestampMs(detail.value && detail.value.closedAt);
 });
 if (hasUnmergeableDifference) return false;
 const openEntryIds = new Set([
   ...futuresBackupOpenPositionEntryIds(importedData),
   ...futuresBackupOpenPositionEntryIds(currentData)
 ]);
 return !differences.some((detail) => detail.type === "entry" && openEntryIds.has(String(detail.id).replace(/^entry:/, "")));
}
function mergeFuturesDailySummaryRecordsPreferCurrent(currentSummaries, importedSummaries) {
 const seen = new Set();
 const merged = [];
 [...normalizeFuturesDailySummaries(currentSummaries), ...normalizeFuturesDailySummaries(importedSummaries)]
   .forEach((summary) => {
     const key = String(summary && (summary.id || summary.dateKey) || "");
     if (!key || seen.has(key)) return;
     seen.add(key);
     merged.push(summary);
   });
 return merged;
}
function mergeFuturesBackupHistoryPreservingCurrentState(currentData, importedData) {
 const current = buildFuturesTradingBackupPayload(currentData);
 const imported = buildFuturesTradingBackupPayload(importedData);
 const positions = normalizeFuturesPositions(current.positions || []);
 const mergedSource = {
   ...current,
   positions,
   position: null,
   trades: mergeFuturesTradesById(current.trades || [], imported.trades || []),
   positionBlocks: normalizeFuturesPositionBlocks([
     ...(current.positionBlocks || []),
     ...(imported.positionBlocks || [])
   ]),
   dailySummaries: mergeFuturesDailySummaryRecordsPreferCurrent(
     current.dailySummaries || [],
     imported.dailySummaries || []
   ),
   // Pending/settled order state is mutable and must remain exactly as the
   // verified current screen sees it; only immutable history is merged.
   settledLimitOrderIds: normalizeFuturesLimitOrderSettledIds(current.settledLimitOrderIds || []),
   settledExitOrderIds: normalizeFuturesExitOrderSettledIds(current.settledExitOrderIds || [])
 };
 const journal = normalizeFuturesPositionJournal(mergedSource, positions);
 return {
   ...current,
   trades: journal.pendingTrades,
   positionBlocks: journal.positionBlocks,
   dailySummaries: journal.dailySummaries,
   positionJournalVersion: FUTURES_POSITION_JOURNAL_VERSION,
   settledLimitOrderIds: mergedSource.settledLimitOrderIds,
   settledExitOrderIds: mergedSource.settledExitOrderIds
 };
}
async function mergeCurrentFuturesStateWithBackupHistory(importedData, sourceLabel, importedDocument = null) {
 setFuturesLiveBackupState("checking", "현재 상태를 유지하면서 양쪽의 과거 매매기록을 안전하게 합치는 중입니다.");
 const checkpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresLimitOrderSettledIds);
 const settledExitIdsCheckpoint = new Set(futuresExitOrderSettledIds);
 const limitJournalLoadedCheckpoint = futuresLimitOrderJournalLoaded;
 const exitJournalLoadedCheckpoint = futuresExitOrderJournalLoaded;
 try {
   const currentData = buildFuturesTradingBackupPayload(checkpoint);
   if (!futuresBackupHistoryCanBeMergedSafely(importedData, currentData, importedDocument)) {
     throw new Error("자동 병합할 수 없는 포지션 또는 주문 상태 차이가 있습니다.");
   }
   const currentDocument = await createFuturesLiveBackupDocument(
     currentData,
     true,
     "pre-history-merge-current",
     futuresStorageRevision
   );
   const candidateDocument = importedDocument || await createFuturesLiveBackupDocument(
     importedData,
     true,
     "pre-history-merge-candidate",
     Math.max(0, finiteNumber(importedDocument && importedDocument.sourceRevision, futuresStorageRevision))
   );
   await withFuturesLiveBackupCommitLock(async () => {
     if (!await preserveFuturesLiveBackupConflictDocument(currentDocument, "병합 전 현재 화면")) {
       throw new Error("현재 화면의 병합 전 안전본을 확인하지 못했습니다.");
     }
     if (!await preserveFuturesLiveBackupConflictDocument(candidateDocument, sourceLabel)) {
       throw new Error("복구 후보의 병합 전 안전본을 확인하지 못했습니다.");
     }
   });
   const mergedBackupData = mergeFuturesBackupHistoryPreservingCurrentState(currentData, importedData);
   const mergedCheckpoint = { ...checkpoint, ...mergedBackupData };
   restoreFuturesPersistenceCheckpoint(mergedCheckpoint);
   futuresLimitOrderSettledIds = new Set(normalizeFuturesLimitOrderSettledIds(mergedBackupData.settledLimitOrderIds));
   futuresLimitOrderJournalLoaded = true;
   futuresExitOrderSettledIds = new Set(normalizeFuturesExitOrderSettledIds(mergedBackupData.settledExitOrderIds));
   futuresExitOrderJournalLoaded = true;
   state.futures.orderBusy = false;
   futuresLiveBackupRecoveryPending = false;
   if (!saveFuturesState({ force: true, reason: "safe-history-merge" })) {
     throw new Error("병합한 매매기록을 브라우저 이중 저장에 확정하지 못했습니다.");
   }
   try {
     hydrateSettingsInputs();
     renderAll();
     drawChart();
   } catch (renderError) {
     console.warn("Merged futures history UI refresh failed", renderError);
   }
   showToast("현재 포지션과 잔고는 유지하고 양쪽의 과거 매매기록을 안전하게 합쳤습니다.");
   return true;
 } catch (error) {
   futuresLimitOrderSettledIds = settledIdsCheckpoint;
   futuresExitOrderSettledIds = settledExitIdsCheckpoint;
   futuresLimitOrderJournalLoaded = limitJournalLoadedCheckpoint;
   futuresExitOrderJournalLoaded = exitJournalLoadedCheckpoint;
   restoreFuturesPersistenceCheckpoint(checkpoint);
   futuresLiveBackupRecoveryPending = true;
   try {
     renderAll();
     drawChart();
   } catch (renderError) {
     console.warn("Futures history merge rollback UI refresh failed", renderError);
   }
   console.error("Safe futures history merge failed", error);
   setFuturesLiveBackupState("recoverable", "자동 병합을 중단하고 두 원본을 유지했습니다. 어느 저장본을 사용할지 선택하세요.");
   showToast(error && error.message ? error.message : "과거 매매기록을 안전하게 합치지 못했습니다.");
   return false;
 }
}
async function keepCurrentFuturesStateAfterBackupConflict(importedData, sourceLabel) {
 setFuturesLiveBackupState("checking", "현재 화면을 유지하고 기존 복구본을 안전 보관하는 중입니다.");
 try {
   // The screen can change while the asynchronous recovery scan is reading
   // IndexedDB. Commit that exact current state to the checksummed dual slots
   // first, then mirror the newly verified revision. This prevents a resolved
   // conflict from being rediscovered on the next launch.
   if (!saveFuturesState({ force: true, silent: true, reason: "resolve-conflict-keep-current" })) {
     throw new Error("현재 화면을 브라우저 이중 저장에 확정하지 못했습니다.");
   }
   const outcome = await withFuturesLiveBackupCommitLock(async () => {
     const currentData = buildFuturesTradingBackupPayload();
     const currentDocument = await createFuturesLiveBackupDocument(
       currentData,
       true,
       "resolve-conflict-keep-current",
       futuresStorageRevision
     );
     const candidateDocument = await createFuturesLiveBackupDocument(
       importedData,
       true,
       "preserved-conflict-candidate",
       futuresStorageRevision
     );
     if (!await preserveFuturesLiveBackupConflictDocument(candidateDocument, sourceLabel)) {
       throw new Error("복구 후보의 안전 보관을 확인하지 못했습니다.");
     }
     const existingMirror = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY);
     if (existingMirror && !await preserveFuturesLiveBackupConflictDocument(existingMirror, "브라우저 복구 미러")) {
       throw new Error("기존 브라우저 복구 미러의 안전 보관을 확인하지 못했습니다.");
     }
     let filePermission = "denied";
     if (futuresLiveBackupHandle) {
       filePermission = await futuresLiveBackupPermission(futuresLiveBackupHandle, false);
       if (filePermission === "granted") {
         let existingFile = null;
         try {
           existingFile = await readFuturesBackupFromHandle(futuresLiveBackupHandle);
         } catch (error) {
           console.warn("Existing linked backup could not be archived before conflict resolution", error);
           filePermission = "invalid";
         }
         if (
           existingFile
           && existingFile.document
           && !await preserveFuturesLiveBackupConflictDocument(existingFile.document, "연결된 백업 파일")
         ) {
           throw new Error("기존 연결 백업 파일의 안전 보관을 확인하지 못했습니다.");
         }
       }
     }
     await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY, currentDocument);
     const verifiedMirror = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY);
     const verifiedMirrorData = verifiedMirror
       ? await parseFuturesBackupDocument(JSON.stringify(verifiedMirror))
       : null;
     if (
       !verifiedMirrorData
       || futuresTradingBackupContentChecksum(verifiedMirrorData) !== futuresTradingBackupContentChecksum(currentData)
     ) {
       throw new Error("현재 화면의 복구 미러 저장을 확인하지 못했습니다.");
     }
     if (futuresLiveBackupHandle && filePermission === "granted") {
       await writeFuturesLiveBackupFile(futuresLiveBackupHandle, currentDocument);
     }
     return { currentData, currentDocument, filePermission };
   });
   futuresLiveBackupRecoveryPending = false;
   futuresLiveBackupPending = null;
   futuresLiveBackupRetryCount = 0;
   const currentContentChecksum = futuresTradingBackupContentChecksum(outcome.currentData);
   futuresLiveBackupLastQueuedChecksum = currentContentChecksum;
   if (outcome.filePermission === "granted") {
     futuresLiveBackupLastFileChecksum = currentContentChecksum;
     settleFuturesLiveBackupFileWaiters(currentContentChecksum, {
       ok: true,
       reason: "verified",
       writtenData: outcome.currentData
     });
   }
   futuresLiveBackupLastWrittenAt = outcome.currentDocument.updatedAt;
   if (!futuresLiveBackupHandle) {
     setFuturesLiveBackupState(typeof window.showSaveFilePicker === "function" ? "disconnected" : "unsupported");
   } else {
     setFuturesLiveBackupState(outcome.filePermission === "granted" ? "connected" : "reconnect");
   }
   showToast("현재 화면을 유지했습니다. 기존 복구본도 브라우저 안전 보관함에 보존했습니다.");
 } catch (error) {
   console.error("Keeping current futures state after backup conflict failed", error);
   futuresLiveBackupRecoveryPending = true;
   setFuturesLiveBackupState("error", "기존 복구본을 안전하게 보관하지 못해 선택을 적용하지 않았습니다.");
   showToast(error && error.message ? error.message : "복구 충돌을 해결하지 못했습니다.");
 }
}
function promptFuturesLiveBackupRecovery(importedData, sourceLabel, importedDocument = null) {
 const currentData = buildFuturesTradingBackupPayload();
 const currentStats = futuresStorageTradingStats(currentData);
 const currentAlsoHasUniqueRecords = futuresBackupHasUnrepresentedRecords(currentData, importedData);
 const importedRevision = Math.max(0, finiteNumber(importedDocument && importedDocument.sourceRevision, 0));
 const canSafelyMergeHistory = currentStats.total > 0
   && futuresBackupHistoryCanBeMergedSafely(importedData, currentData, importedDocument);
 futuresLiveBackupRecoveryPending = true;
 if (canSafelyMergeHistory) {
   // Both originals are archived by the merge routine. Immutable history can
   // therefore be reconciled without stopping startup for a repeated choice.
   void mergeCurrentFuturesStateWithBackupHistory(importedData, sourceLabel, importedDocument);
   return;
 }
 if (currentAlsoHasUniqueRecords && currentStats.total > 0) {
   if (importedRevision > futuresStorageRevision) {
     // A strictly newer verified mirror wins. restoreFuturesFullBackup writes
     // and verifies a pre-restore safety snapshot of the current screen first.
     futuresLiveBackupRecoveryPending = false;
     void restoreFuturesFullBackup(importedData);
     return;
   }
   // A same-or-older recovery mirror must not override the newer checksummed
   // localStorage revision. Archive it and refresh the mirror automatically.
   void keepCurrentFuturesStateAfterBackupConflict(importedData, sourceLabel);
   return;
 }
 // Only the recovery copy has durable records, so restore it immediately. The
 // restore routine preserves and verifies the current screen before replacing it.
 futuresLiveBackupRecoveryPending = false;
 void restoreFuturesFullBackup(importedData);
}
function settleFuturesLiveBackupFileWaiters(contentChecksum, result) {
 if (!futuresLiveBackupFileWaiters.length) return;
 const writtenData = result && result.writtenData;
 const publicResult = {
   ok: Boolean(result && result.ok),
   reason: result && result.reason || "error"
 };
 const remaining = [];
 futuresLiveBackupFileWaiters.forEach((waiter) => {
   const representedByWrittenData = Boolean(
     publicResult.ok
     && writtenData
     && waiter.expectedData
     && !futuresBackupHasUnrepresentedRecords(waiter.expectedData, writtenData)
   );
   if (waiter.contentChecksum !== contentChecksum && !representedByWrittenData) {
     remaining.push(waiter);
     return;
   }
   clearTimeout(waiter.timer);
   waiter.resolve(publicResult);
 });
 futuresLiveBackupFileWaiters = remaining;
}
function waitForFuturesLiveBackupFile(contentChecksum, expectedData, timeoutMs = 15000) {
 if (!contentChecksum) return Promise.resolve({ ok: false, reason: "not-queued" });
 if (contentChecksum === futuresLiveBackupLastFileChecksum) {
   return Promise.resolve({ ok: true, reason: "verified" });
 }
 if (!futuresLiveBackupInitialized) return Promise.resolve({ ok: false, reason: "initializing" });
 if (futuresLiveBackupRecoveryPending) return Promise.resolve({ ok: false, reason: "conflict" });
 if (!futuresLiveBackupHandle) {
   return Promise.resolve({
     ok: false,
     reason: typeof window.showSaveFilePicker === "function" ? "disconnected" : "unsupported"
   });
 }
 return new Promise((resolve) => {
   const waiter = {
     contentChecksum,
     expectedData: cloneJsonValue(expectedData),
     resolve,
     timer: null
   };
   waiter.timer = setTimeout(() => {
     futuresLiveBackupFileWaiters = futuresLiveBackupFileWaiters.filter((item) => item !== waiter);
     resolve({ ok: false, reason: "timeout" });
   }, timeoutMs);
   futuresLiveBackupFileWaiters.push(waiter);
 });
}
async function verifyFuturesTradeFileBackup(reason) {
 const data = buildFuturesTradingBackupPayload();
 const contentChecksum = futuresTradingBackupContentChecksum(data);
 if (contentChecksum === futuresLiveBackupLastFileChecksum) {
   return { ok: true, reason: "verified" };
 }
 if (!futuresLiveBackupInitialized) return { ok: false, reason: "initializing" };
 if (futuresLiveBackupRecoveryPending) return { ok: false, reason: "conflict" };
 if (!futuresLiveBackupHandle) {
   return {
     ok: false,
     reason: typeof window.showSaveFilePicker === "function" ? "disconnected" : "unsupported"
   };
 }
 if (
   contentChecksum !== futuresLiveBackupLastQueuedChecksum
   || (!futuresLiveBackupWriteRunning && !futuresLiveBackupPending && !futuresLiveBackupRetryTimer)
 ) {
   queueFuturesLiveBackupWrite(reason || "trade-file-verify", { force: true });
 }
 return waitForFuturesLiveBackupFile(contentChecksum, data);
}
async function ensureFuturesTradeFileBackupReady(options = {}) {
 const silent = Boolean(options.silent);
 const fail = (stateName, message, reason) => {
   setFuturesLiveBackupState(stateName, message);
   if (!silent) showToast(message);
   return { ok: false, reason };
 };
 if (typeof window.showSaveFilePicker !== "function") {
   return fail(
     "unsupported",
     "모든 매매의 JSON 백업을 보장할 수 없는 브라우저입니다. Microsoft Edge에서 실행하세요.",
     "unsupported"
   );
 }
 if (!futuresLiveBackupInitialized) {
   return fail("checking", "JSON 백업 초기화가 끝난 뒤 다시 매매하세요.", "initializing");
 }
 if (futuresLiveBackupRecoveryPending) {
   return fail("recoverable", "백업 기록 선택을 완료한 뒤 다시 매매하세요.", "conflict");
 }
 if (!futuresLiveBackupHandle) {
   return fail("disconnected", "매매 전에 상단의 백업 파일 연결을 완료하세요.", "disconnected");
 }
 if (!futuresLiveBackupHandlePersisted) {
   return fail("error", "백업 파일 연결 정보를 브라우저에 저장하지 못했습니다. 파일을 다시 연결하세요.", "handle-not-persisted");
 }
 let permission = "denied";
 try {
   permission = await futuresLiveBackupPermission(futuresLiveBackupHandle, !silent);
 } catch (error) {
   console.warn("Trade backup permission check failed", error);
 }
 if (permission !== "granted") {
   return fail("reconnect", "매매 전에 상단의 파일 다시 연결을 눌러 JSON 쓰기 권한을 허용하세요.", "reconnect");
 }
 const currentData = buildFuturesTradingBackupPayload();
 const contentChecksum = futuresTradingBackupContentChecksum(currentData);
 if (contentChecksum === futuresLiveBackupLastFileChecksum) {
   return { ok: true, reason: "verified" };
 }
 if (
   contentChecksum !== futuresLiveBackupLastQueuedChecksum
   || (!futuresLiveBackupWriteRunning && !futuresLiveBackupPending && !futuresLiveBackupRetryTimer)
 ) {
   queueFuturesLiveBackupWrite("pre-trade-file-sync", { force: true });
 }
 const result = await waitForFuturesLiveBackupFile(contentChecksum, currentData);
 if (result.ok) return result;
 return fail(
   result.reason === "conflict" ? "recoverable" : "error",
   result.reason === "conflict"
     ? "백업 기록 선택을 완료한 뒤 다시 매매하세요."
     : "현재 데이터의 JSON 백업을 확인하지 못해 매매를 중단했습니다. 파일을 다시 연결하세요.",
   result.reason
 );
}
function futuresTradeFileBackupStatusText(result) {
 if (result && result.ok) return " · JSON 백업 완료";
 const reason = result && result.reason || "error";
 if (reason === "disconnected") return " · 브라우저 저장 완료 (JSON 파일 연결 필요)";
 if (reason === "unsupported") return " · 브라우저 저장 완료 (JSON 자동 백업 미지원)";
 if (reason === "conflict") return " · 브라우저 저장 완료 (백업 기록 선택 필요)";
 if (reason === "initializing") return " · 브라우저 저장 완료 (JSON 백업 초기화 중)";
 return " · 브라우저 저장 완료 (JSON 파일 다시 연결 필요)";
}
function queueFuturesLiveBackupWrite(reason = "state-save", options = {}) {
 if (!futuresLiveBackupInitialized || futuresLiveBackupRecoveryPending) return;
 const data = buildFuturesTradingBackupPayload();
 const contentChecksum = futuresTradingBackupContentChecksum(data);
 if (!options.force && contentChecksum === futuresLiveBackupLastQueuedChecksum) return;
 if (futuresLiveBackupRetryTimer) {
   clearTimeout(futuresLiveBackupRetryTimer);
   futuresLiveBackupRetryTimer = null;
 }
 futuresLiveBackupRetryCount = 0;
 futuresLiveBackupLastQueuedChecksum = contentChecksum;
 futuresLiveBackupPending = {
   data,
   contentChecksum,
   reason,
   storageVerified: options.storageVerified !== false,
   sourceRevision: futuresStorageRevision
 };
 if (!futuresLiveBackupWriteRunning) drainFuturesLiveBackupWrites();
}
function scheduleFuturesLiveBackupRetry(pending, error) {
 const latestPending = futuresLiveBackupPending || pending;
 futuresLiveBackupPending = null;
 const mirrorVerified = Boolean(error && error.futuresMirrorVerified);
 const safetyMessage = mirrorVerified
   ? "브라우저 이중 저장과 복구 미러에는 최신 상태가 보관되어 있습니다."
   : "브라우저 이중 저장에는 보관됐지만 복구 미러의 최신 상태는 확인하지 못했습니다.";
 if (!latestPending || futuresLiveBackupRetryCount >= FUTURES_LIVE_BACKUP_MAX_RETRIES) {
   futuresLiveBackupLastQueuedChecksum = "";
   setFuturesLiveBackupState(
     "error",
     "독립 파일의 최신 저장에 실패했습니다. " + safetyMessage + " 파일을 다시 연결하세요."
   );
   return false;
 }
 futuresLiveBackupRetryCount += 1;
 futuresLiveBackupPending = latestPending;
 const delay = futuresLiveBackupRetryCount * 1500;
 setFuturesLiveBackupState(
   "error",
   `독립 파일 저장 실패 · ${formatNumber(delay / 1000, 1)}초 후 ${futuresLiveBackupRetryCount}/${FUTURES_LIVE_BACKUP_MAX_RETRIES}회 재시도합니다. ${safetyMessage}`
 );
 futuresLiveBackupRetryTimer = setTimeout(() => {
   futuresLiveBackupRetryTimer = null;
   drainFuturesLiveBackupWrites();
 }, delay);
 console.warn("Live futures backup retry scheduled", error);
 return true;
}
async function drainFuturesLiveBackupWrites() {
 if (futuresLiveBackupWriteRunning) return;
 futuresLiveBackupWriteRunning = true;
 let activePending = null;
 try {
   while (futuresLiveBackupPending) {
     const pending = futuresLiveBackupPending;
     activePending = pending;
     futuresLiveBackupPending = null;
     const backupDocument = await createFuturesLiveBackupDocument(
       pending.data,
       pending.storageVerified,
       pending.reason,
       pending.sourceRevision
     );
     try {
       const outcome = await withFuturesLiveBackupCommitLock(async () => {
         let mirrorResult = null;
         let mirrorError = null;
         try {
           mirrorResult = await writeFuturesLiveBackupMirrorSafely(backupDocument);
         } catch (error) {
           console.warn("IndexedDB recovery mirror failed", error);
           mirrorError = error;
         }
         if (mirrorResult && !mirrorResult.written && ["newer", "conflict"].includes(mirrorResult.reason)) {
           return {
             kind: "protected",
             source: "브라우저 복구 미러",
             reason: mirrorResult.reason,
             data: mirrorResult.existingData,
             document: mirrorResult.document
           };
         }
         try {
           if (!futuresLiveBackupHandle) {
             return mirrorError ? { kind: "mirror-failed", error: mirrorError } : { kind: "mirror-only" };
           }
           const permission = await futuresLiveBackupPermission(futuresLiveBackupHandle, false);
           if (permission !== "granted") {
             return mirrorError ? { kind: "reconnect-mirror-failed", error: mirrorError } : { kind: "reconnect" };
           }
           setFuturesLiveBackupState("saving");
           const fileResult = await writeFuturesLiveBackupFileSafely(futuresLiveBackupHandle, backupDocument);
           if (!fileResult.written && ["newer", "conflict"].includes(fileResult.reason)) {
             return {
               kind: "protected",
               source: "연결된 백업 파일",
               reason: fileResult.reason,
               data: fileResult.existingData,
               document: fileResult.document
             };
           }
           return { kind: "file", fileResult, mirrorError };
         } catch (error) {
           const commitError = new Error(error && error.message ? error.message : String(error));
           commitError.code = error && error.code || "";
           commitError.futuresMirrorVerified = Boolean(mirrorResult);
           throw commitError;
         }
       });
       if (outcome.kind === "protected") {
         settleFuturesLiveBackupFileWaiters(pending.contentChecksum, {
           ok: false,
           reason: outcome.reason === "conflict" ? "conflict" : "newer"
         });
         if (outcome.reason === "conflict" && outcome.data) {
           futuresLiveBackupRecoveryPending = true;
           promptFuturesLiveBackupRecovery(outcome.data, outcome.source, outcome.document);
         } else {
           futuresLiveBackupLastWrittenAt = outcome.document && outcome.document.updatedAt || futuresLiveBackupLastWrittenAt;
           setFuturesLiveBackupState("connected", "다른 탭이 저장한 더 최신 백업을 보호했습니다. 이 탭을 새로고침하세요.");
         }
         break;
       }
       if (["mirror-failed", "reconnect-mirror-failed"].includes(outcome.kind)) {
         settleFuturesLiveBackupFileWaiters(pending.contentChecksum, { ok: false, reason: "mirror-failed" });
         setFuturesLiveBackupState(
           "error",
           "브라우저 이중 저장은 완료됐지만 복구 미러를 갱신하지 못했습니다. 백업 파일을 연결하거나 페이지를 다시 열어 재시도하세요."
         );
       } else if (outcome.kind === "mirror-only") {
         settleFuturesLiveBackupFileWaiters(pending.contentChecksum, { ok: false, reason: "disconnected" });
         if (typeof window.showSaveFilePicker === "function") setFuturesLiveBackupState("disconnected");
         else setFuturesLiveBackupState("unsupported");
       } else if (outcome.kind === "reconnect") {
         settleFuturesLiveBackupFileWaiters(pending.contentChecksum, { ok: false, reason: "reconnect" });
         setFuturesLiveBackupState("reconnect");
       } else {
         futuresLiveBackupLastFileChecksum = pending.contentChecksum;
         settleFuturesLiveBackupFileWaiters(pending.contentChecksum, {
           ok: true,
           reason: "verified",
           writtenData: backupDocument.data
         });
         futuresLiveBackupLastWrittenAt = outcome.fileResult.document && outcome.fileResult.document.updatedAt
           || backupDocument.updatedAt;
         setFuturesLiveBackupState(
           "connected",
           outcome.mirrorError
             ? "독립 백업 파일은 최신입니다. 다만 브라우저 복구 미러 저장에 실패해 페이지를 다시 열 때 재시도합니다."
             : ""
         );
       }
       futuresLiveBackupRetryCount = 0;
       activePending = null;
     } catch (error) {
       console.error("Live futures backup failed", error);
       futuresLiveBackupLastQueuedChecksum = "";
       if (error && error.code === "FUTURES_BACKUP_INVALID") {
         futuresLiveBackupRecoveryPending = true;
         futuresLiveBackupPending = null;
         settleFuturesLiveBackupFileWaiters(pending.contentChecksum, { ok: false, reason: "invalid" });
         setFuturesLiveBackupState("error", error.message);
       } else {
         const retryScheduled = scheduleFuturesLiveBackupRetry(pending, error);
         if (!retryScheduled) {
           settleFuturesLiveBackupFileWaiters(pending.contentChecksum, { ok: false, reason: "error" });
         }
       }
       break;
     }
   }
 } catch (error) {
   console.error("Live backup queue failed", error);
   futuresLiveBackupLastQueuedChecksum = "";
   const failedPending = activePending || futuresLiveBackupPending;
   const retryScheduled = scheduleFuturesLiveBackupRetry(failedPending, error);
   if (!retryScheduled && failedPending) {
     settleFuturesLiveBackupFileWaiters(failedPending.contentChecksum, { ok: false, reason: "error" });
   }
 } finally {
   futuresLiveBackupWriteRunning = false;
   if (futuresLiveBackupPending && !futuresLiveBackupRetryTimer) drainFuturesLiveBackupWrites();
 }
}
async function initializeFuturesLiveBackup() {
 setFuturesLiveBackupState("checking");
 let storedHandle = null;
 let storedSnapshot = null;
 let storedPreRestoreSnapshot = null;
 try {
   [storedHandle, storedSnapshot, storedPreRestoreSnapshot] = await Promise.all([
     readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_HANDLE_KEY),
     readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_SNAPSHOT_KEY),
     readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_PRE_RESTORE_KEY)
   ]);
 } catch (error) {
   console.warn("Live backup metadata could not be loaded", error);
 }
 futuresLiveBackupHandle = storedHandle || null;
 futuresLiveBackupHandlePersisted = Boolean(storedHandle);
 const currentData = buildFuturesTradingBackupPayload();
 let recoveryCandidate = null;
 let recoveryCandidateDocument = null;
 let recoverySource = "";
 let linkedFileInvalid = false;
 const storedRecoveryCandidates = [
   { document: storedSnapshot, label: "브라우저 복구 미러", emptyOnly: false },
   { document: storedPreRestoreSnapshot, label: "복원 직전 안전본", emptyOnly: true }
 ];
 const currentTradingStats = futuresStorageTradingStats(currentData);
 for (const candidate of storedRecoveryCandidates) {
   if (!candidate.document) continue;
   if (candidate.emptyOnly && currentTradingStats.total > 0) continue;
   try {
     const candidateData = await parseFuturesBackupDocument(JSON.stringify(candidate.document));
     if (futuresBackupDocumentNeedsRecovery(candidate.document, candidateData, currentData)) {
       const candidateStats = futuresStorageTradingStats(candidateData);
       const selectedStats = futuresStorageTradingStats(recoveryCandidate);
       if (!recoveryCandidate || candidateStats.score >= selectedStats.score) {
         recoveryCandidate = candidateData;
         recoveryCandidateDocument = candidate.document;
         recoverySource = candidate.label;
       }
     }
   } catch (error) {
     console.warn("Stored live backup snapshot is invalid", error);
   }
 }
 if (futuresLiveBackupHandle) {
   try {
     const permission = await futuresLiveBackupPermission(futuresLiveBackupHandle, false);
     if (permission === "granted") {
       const fileBackup = await readFuturesBackupFromHandle(futuresLiveBackupHandle);
       if (fileBackup && futuresBackupDocumentNeedsRecovery(fileBackup.document, fileBackup.data, currentData)) {
         const fileStats = futuresStorageTradingStats(fileBackup.data);
         const candidateStats = futuresStorageTradingStats(recoveryCandidate);
         if (!recoveryCandidate || fileStats.score >= candidateStats.score) {
           recoveryCandidate = fileBackup.data;
           recoveryCandidateDocument = fileBackup.document;
           recoverySource = "연결된 백업 파일";
         }
       }
     }
   } catch (error) {
     console.warn("Linked live backup could not be checked", error);
     linkedFileInvalid = true;
     setFuturesLiveBackupState("error", "연결된 백업 파일을 확인하지 못했습니다. 파일을 다시 연결하세요.");
   }
 }
 futuresLiveBackupInitialized = true;
 if (linkedFileInvalid) {
   futuresLiveBackupRecoveryPending = true;
   return;
 }
 if (recoveryCandidate) {
   promptFuturesLiveBackupRecovery(recoveryCandidate, recoverySource, recoveryCandidateDocument);
   return;
 }
 if (!futuresLiveBackupHandle) {
   setFuturesLiveBackupState(typeof window.showSaveFilePicker === "function" ? "disconnected" : "unsupported");
   queueFuturesLiveBackupWrite("startup-mirror", { force: true });
   return;
 }
 try {
   const permission = await futuresLiveBackupPermission(futuresLiveBackupHandle, false);
   setFuturesLiveBackupState(permission === "granted" ? "connected" : "reconnect");
 } catch (error) {
   setFuturesLiveBackupState("reconnect");
 }
 queueFuturesLiveBackupWrite("startup-sync", { force: true });
}
async function activateFuturesLiveBackupHandle(handle, options = {}) {
 const permission = await futuresLiveBackupPermission(handle, options.requestPermission !== false);
 if (permission !== "granted") {
   const permissionError = new Error("파일 읽기·쓰기 권한이 허용되지 않았습니다.");
   permissionError.code = "FUTURES_BACKUP_PERMISSION";
   throw permissionError;
 }
 let existingBackup = null;
 try {
   existingBackup = await readFuturesBackupFromHandle(handle);
 } catch (error) {
   const invalidError = new Error("선택한 파일이 비어 있지 않고 올바른 선물 백업도 아닙니다. 다른 파일을 선택하세요.");
   invalidError.code = "FUTURES_BACKUP_INVALID";
   throw invalidError;
 }
 await persistFuturesLiveBackupHandle(handle);
 futuresLiveBackupHandle = handle;
 futuresLiveBackupHandlePersisted = true;
 const currentData = buildFuturesTradingBackupPayload();
 if (existingBackup && futuresBackupDocumentNeedsRecovery(existingBackup.document, existingBackup.data, currentData)) {
   promptFuturesLiveBackupRecovery(existingBackup.data, options.sourceLabel || "선택한 백업 파일", existingBackup.document);
   return { ok: false, reason: "conflict" };
 }
 futuresLiveBackupRecoveryPending = false;
 setFuturesLiveBackupState("checking", "백업 파일 연결을 저장하고 최신 매매 데이터 쓰기를 검증하는 중입니다.");
 const contentChecksum = futuresTradingBackupContentChecksum(currentData);
 queueFuturesLiveBackupWrite(options.reason || "file-connected", { force: true });
 const result = await waitForFuturesLiveBackupFile(contentChecksum, currentData);
 if (!result.ok) {
   if (result.reason === "conflict") return result;
   setFuturesLiveBackupState(
     result.reason === "reconnect" ? "reconnect" : "error",
     "백업 파일 연결은 저장했지만 최신 데이터 쓰기를 확인하지 못했습니다. 파일 다시 연결을 눌러 재시도하세요."
   );
   showToast("JSON 백업 파일의 실제 쓰기 검증에 실패했습니다.");
   return result;
 }
 const fileName = String(handle && handle.name || FUTURES_LIVE_BACKUP_FILE_NAME);
 setFuturesLiveBackupState("connected", `${fileName} 연결·쓰기 검증 완료 · 매매마다 자동 갱신합니다.`);
 showToast("백업 파일 연결과 최신 데이터 저장을 확인했습니다.");
 restorePersistedFuturesTriggeredOrders({ resumeHeld: true });
 scheduleFuturesTriggeredOrderDrain(0);
 schedulePendingFuturesOrderHistoryRecovery(0);
 return result;
}
async function connectFuturesLiveBackupFile() {
 if (typeof window.showSaveFilePicker !== "function") {
   setFuturesLiveBackupState("unsupported");
   showToast("이 브라우저에서는 자동 파일 갱신을 지원하지 않아 응급 백업을 내려받습니다.");
   downloadFuturesFullBackup();
   return;
 }
 if (futuresLiveBackupHandle && futuresLiveBackupState === "reconnect") {
   try {
     setFuturesLiveBackupState("checking", "기존 백업 파일의 읽기·쓰기 권한을 다시 확인하는 중입니다.");
     await activateFuturesLiveBackupHandle(futuresLiveBackupHandle, {
       requestPermission: true,
       sourceLabel: "기존 연결 백업 파일",
       reason: "file-reconnected"
     });
     return;
   } catch (error) {
     console.warn("Stored live backup handle could not be reauthorized", error);
     futuresLiveBackupHandle = null;
     futuresLiveBackupHandlePersisted = false;
     try {
       await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_HANDLE_KEY, null);
     } catch (forgetError) {
       console.warn("Invalid live backup handle could not be cleared", forgetError);
     }
     setFuturesLiveBackupState("disconnected", "기존 파일 권한을 복구하지 못했습니다. 백업 파일 연결을 다시 눌러 같은 JSON 파일을 선택하세요.");
     showToast("기존 파일 권한을 복구하지 못했습니다. 같은 백업 파일을 다시 선택하세요.");
     return;
   }
 }
 const previousState = futuresLiveBackupState;
 const previousMessage = futuresLiveBackupMessage;
 try {
   setFuturesLiveBackupState("checking", "연결할 단일 백업 파일을 선택하는 중입니다.");
   const handle = await window.showSaveFilePicker({
     id: "futures-live-backup-v1",
     startIn: "desktop",
     suggestedName: FUTURES_LIVE_BACKUP_FILE_NAME,
     types: [{
       description: "선물 매매 백업 JSON",
       accept: { "application/json": [".json"] }
     }]
   });
   await activateFuturesLiveBackupHandle(handle, {
     requestPermission: true,
     sourceLabel: "선택한 백업 파일",
     reason: "file-connected"
   });
 } catch (error) {
   if (error && error.name === "AbortError") {
     setFuturesLiveBackupState(
       futuresLiveBackupHandle ? previousState : "disconnected",
       futuresLiveBackupHandle ? previousMessage : "브라우저 이중 저장 작동 중 · 독립 파일을 연결하세요."
     );
     return;
   }
   console.error("Live backup file connection failed", error);
   setFuturesLiveBackupState("error", error && error.message ? error.message : "백업 파일 연결에 실패했습니다.");
   showToast(error && error.message ? error.message : "백업 파일 연결에 실패했습니다.");
 }
}
function cloneJsonValue(value) {
 return JSON.parse(JSON.stringify(value));
}
function createFuturesPersistenceCheckpoint() {
 return cloneJsonValue(buildFuturesStoragePayload());
}
function restoreFuturesPersistenceCheckpoint(checkpoint) {
 if (!checkpoint) return;
 const current = state.futures;
 const runtime = {
   ticker: current.ticker,
   candles: current.candles,
   orderBusy: current.orderBusy,
   ws: current.ws,
   wsStream: current.wsStream,
   wsHeartbeatTimer: current.wsHeartbeatTimer,
   wsWatchdogTimer: current.wsWatchdogTimer,
   wsLastMessageAt: current.wsLastMessageAt,
   wsLastTradeAt: current.wsLastTradeAt,
   bybitTickerSnapshots: current.bybitTickerSnapshots,
   reconnectTimer: current.reconnectTimer,
   socketClosing: current.socketClosing,
   loadingCandles: current.loadingCandles,
   error: current.error
 };
 state.market = FUTURES_MARKETS[checkpoint.market] ? checkpoint.market : DEFAULT_MARKET;
 state.futures = { ...normalizeFuturesState(checkpoint), ...runtime };
}
function createFuturesStorageEnvelope(payload, revision) {
 const data = cloneJsonValue(payload);
 const dataText = JSON.stringify(data);
 return {
   schema: FUTURES_STORAGE_SCHEMA,
   version: FUTURES_STORAGE_SCHEMA_VERSION,
   revision,
   savedAt: new Date().toISOString(),
   checksum: checksumStorageText(dataText),
   data
 };
}
function notifyFuturesStorageFailure(error, options = {}) {
 console.error("Futures storage save failed", error);
 if (options.silent || futuresStorageWarningShown || !el.toast) return;
 futuresStorageWarningShown = true;
 const conflict = error && error.code === "FUTURES_STORAGE_CONFLICT";
 showToast(conflict
   ? "다른 탭에서 데이터가 변경되어 저장을 중단했습니다. 이 탭을 새로고침하세요."
   : "저장에 실패했습니다. 거래를 중단하고 전체 백업 또는 저장 공간을 확인하세요.");
}
function adoptFuturesStorageCandidate(candidate, revision, options = {}) {
 if (!candidate) return false;
 const currentMarket = state.market;
 const current = state.futures || createDefaultFuturesState();
 const runtime = {
   ticker: current.ticker,
   candles: current.candles,
   orderBusy: current.orderBusy,
   ws: current.ws,
   wsStream: current.wsStream,
   wsHeartbeatTimer: current.wsHeartbeatTimer,
   wsWatchdogTimer: current.wsWatchdogTimer,
   wsLastMessageAt: current.wsLastMessageAt,
   wsLastTradeAt: current.wsLastTradeAt,
   bybitTickerSnapshots: current.bybitTickerSnapshots,
   reconnectTimer: current.reconnectTimer,
   socketClosing: current.socketClosing,
   loadingCandles: current.loadingCandles,
   error: current.error
 };
 state.futures = { ...normalizeFuturesState(candidate.data), ...runtime };
 const limitOrderSync = reconcileFuturesLimitOrderJournal();
 const exitOrderSync = reconcileFuturesExitOrderJournal();
 futuresLimitOrderJournalRecoveryPending = futuresLimitOrderJournalRecoveryPending || limitOrderSync.needsPersistence;
 futuresExitOrderJournalRecoveryPending = futuresExitOrderJournalRecoveryPending || exitOrderSync.needsPersistence;
 state.market = options.preserveMarket === false
   ? (FUTURES_MARKETS[candidate.data.market] ? candidate.data.market : DEFAULT_MARKET)
   : currentMarket;
 futuresStorageRevision = Math.max(0, finiteNumber(revision, candidate.revision));
 futuresStorageLastSavedAt = candidate.savedAt || "";
 futuresStorageConflict = false;
 futuresStorageWarningShown = false;
 return true;
}
function ensureFuturesStorageCurrent(options = {}) {
 const slots = readFuturesStorageSlots();
 if (slots.accessError) {
   notifyFuturesStorageFailure(slots.accessError, options);
   return false;
 }
 if (slots.newest && slots.newest.revision > futuresStorageRevision) {
   if (state.futures.orderBusy) {
     const error = new Error("A newer futures state exists while an order is running");
     error.code = "FUTURES_STORAGE_CONFLICT";
     futuresStorageConflict = true;
     notifyFuturesStorageFailure(error, options);
     return false;
   }
   const storageChoice = chooseRecoverableFuturesStorageCandidate(slots);
   if (!adoptFuturesStorageCandidate(storageChoice.candidate, slots.newest.revision)) {
     const error = new Error("A newer futures state could not be synchronized");
     error.code = "FUTURES_STORAGE_CONFLICT";
     futuresStorageConflict = true;
     notifyFuturesStorageFailure(error, options);
     return false;
   }
   const needsStorageRepair = storageChoice.recoveredOlderSlot
     || futuresLimitOrderJournalRecoveryPending
     || futuresExitOrderJournalRecoveryPending;
   if (needsStorageRepair && !saveFuturesState({ force: true, silent: true, reason: "auto-sync-recovery" })) {
     const error = new Error("Recovered futures state could not be persisted");
     notifyFuturesStorageFailure(error, options);
     return false;
   }
   if (needsStorageRepair) {
     futuresLimitOrderJournalRecoveryPending = false;
     futuresExitOrderJournalRecoveryPending = false;
   }
   if (!options.silent && el.toast) showToast("다른 탭의 최신 저장본을 자동 동기화했습니다. 주문을 계속합니다.");
 }
 return true;
}
function handleFuturesStorageEvent(event) {
 if (!event || ![SHARED_FUTURES_STORAGE_KEY, SHARED_FUTURES_BACKUP_STORAGE_KEY].includes(event.key)) return;
 const slots = readFuturesStorageSlots();
 if (!slots.newest || slots.newest.revision <= futuresStorageRevision) return;
 if (!state.futures.orderBusy && ensureFuturesStorageCurrent({ silent: true })) {
   renderAll();
   drawChart();
   if (el.toast) showToast("다른 탭의 선물 저장본을 자동 동기화했습니다.");
   return;
 }
 futuresStorageConflict = true;
 const error = new Error("A newer futures state exists in another tab");
 error.code = "FUTURES_STORAGE_CONFLICT";
 notifyFuturesStorageFailure(error);
 if (el.connectionStatus) setConnectionStatus("wait", "다른 탭에서 저장됨 · 새로고침 필요");
}
function acquireFuturesStorageLock() {
 try {
   const now = Date.now();
   const existing = readJson(FUTURES_STORAGE_LOCK_KEY, null);
   if (existing && existing.owner !== FUTURES_TAB_ID && finiteNumber(existing.expiresAt, 0) > now) {
     const error = new Error("Another tab is writing futures storage");
     error.code = "FUTURES_STORAGE_CONFLICT";
     return { ok: false, error };
   }
   safeSetJson(FUTURES_STORAGE_LOCK_KEY, { owner: FUTURES_TAB_ID, expiresAt: now + 5000 });
   const verified = readJson(FUTURES_STORAGE_LOCK_KEY, null);
   if (!verified || verified.owner !== FUTURES_TAB_ID) {
     const error = new Error("Futures storage lock verification failed");
     error.code = "FUTURES_STORAGE_CONFLICT";
     return { ok: false, error };
   }
   return { ok: true };
 } catch (error) {
   return { ok: false, error };
 }
}
function releaseFuturesStorageLock() {
 try {
   const existing = readJson(FUTURES_STORAGE_LOCK_KEY, null);
   if (existing && existing.owner === FUTURES_TAB_ID) safeRemoveItem(FUTURES_STORAGE_LOCK_KEY);
 } catch (error) {
   console.warn("Futures storage lock release failed", error);
 }
}
function persistFuturesStoragePayload(payload, options = {}) {
 const lock = acquireFuturesStorageLock();
 if (!lock.ok) return lock;
 try {
   const slots = readFuturesStorageSlots();
   if (slots.accessError) return { ok: false, error: slots.accessError };
   const newest = slots.newest;
   if (!options.force && newest && newest.revision > futuresStorageRevision) {
     const error = new Error("A newer futures state exists in another tab");
     error.code = "FUTURES_STORAGE_CONFLICT";
     return { ok: false, error };
   }
   const nextRevision = Math.max(futuresStorageRevision, newest ? newest.revision : 0) + 1;
   const envelope = createFuturesStorageEnvelope(payload, nextRevision);
   const serialized = JSON.stringify(envelope);
   let targetKey;
   if (newest) {
     targetKey = newest.key === SHARED_FUTURES_STORAGE_KEY
       ? SHARED_FUTURES_BACKUP_STORAGE_KEY
       : SHARED_FUTURES_STORAGE_KEY;
   } else {
     targetKey = slots.rawByKey[SHARED_FUTURES_STORAGE_KEY]
       ? SHARED_FUTURES_BACKUP_STORAGE_KEY
       : SHARED_FUTURES_STORAGE_KEY;
   }
   try {
     let savedKey = targetKey;
     try {
       safeSetItem(targetKey, serialized);
     } catch (firstError) {
       // localStorage replacement is atomic: never delete the previous valid slot before
       // the compact replacement has been written and verified.
       removeMigratedLegacyFuturesStorage();
       removeNonEssentialFuturesCacheStorage();
       try {
         safeSetItem(targetKey, serialized);
       } catch (retryError) {
         if (!newest) throw retryError;
         // localStorage.setItem replaces one key atomically. This single-slot fallback
         // keeps trading available when the browser cannot hold two full snapshots.
         safeSetItem(newest.key, serialized);
         savedKey = newest.key;
       }
     }
     const verifiedRaw = localStorage.getItem(savedKey);
     const verified = verifiedRaw ? parseFuturesStorageCandidate(verifiedRaw, savedKey) : null;
     if (!verified || verified.revision !== nextRevision) throw new Error("Futures storage verification failed");
     return { ok: true, revision: nextRevision, savedAt: envelope.savedAt, key: savedKey };
   } catch (error) {
     return { ok: false, error };
   }
 } finally {
   releaseFuturesStorageLock();
 }
}
function loadFuturesState() {
 const slots = readFuturesStorageSlots();
 let storageChoice = chooseRecoverableFuturesStorageCandidate(slots);
 const legacyRecoveryData = migrateLegacyFuturesStates();
 const legacyRecoveryStats = futuresStorageTradingStats(legacyRecoveryData);
 const primaryWasIntentionallyCleared = Boolean(storageChoice.candidate && storageChoice.candidate.data.intentionalClearAt);
 if (!primaryWasIntentionallyCleared && legacyRecoveryStats.total > storageChoice.selectedStats.total) {
   storageChoice = {
     candidate: { key: "legacy-per-market", data: legacyRecoveryData, revision: 0, savedAt: "", legacy: true },
     recoveredOlderSlot: true,
     recoveredLegacySlots: true,
     newestStats: storageChoice.newestStats,
     selectedStats: legacyRecoveryStats
   };
 }
 quarantineInvalidFuturesStorage(slots.invalid);
 const selectedStorage = storageChoice.candidate;
 if (selectedStorage) {
   const needsPositionJournalMigration = Number(selectedStorage.data.positionJournalVersion) < FUTURES_POSITION_JOURNAL_VERSION
     || (Array.isArray(selectedStorage.data.dailySummaries) && selectedStorage.data.dailySummaries.some((summary) => Array.isArray(summary && summary.trades) && summary.trades.length));
   state.market = FUTURES_MARKETS[selectedStorage.data.market] ? selectedStorage.data.market : DEFAULT_MARKET;
   state.futures = normalizeFuturesState(selectedStorage.data);
   const limitOrderSync = reconcileFuturesLimitOrderJournal();
   const exitOrderSync = reconcileFuturesExitOrderJournal();
   futuresStorageRevision = slots.newest ? slots.newest.revision : selectedStorage.revision;
   futuresStorageLastSavedAt = selectedStorage.savedAt;
   let recoverySaved = true;
   if (selectedStorage.legacy || selectedStorage.salvaged || needsPositionJournalMigration || storageChoice.recoveredOlderSlot || limitOrderSync.needsPersistence || exitOrderSync.needsPersistence) {
     recoverySaved = saveFuturesState({
       force: true,
       silent: true,
       reason: storageChoice.recoveredQuarantine
         ? "recover-quarantined-storage"
         : storageChoice.recoveredLegacySlots
           ? "recover-legacy-storage"
         : storageChoice.recoveredOlderSlot
           ? "recover-nonempty-backup-slot"
         : needsPositionJournalMigration ? "position-journal-migration" : "legacy-migration"
     });
     if (storageChoice.recoveredOlderSlot && el.toast) {
       showToast(recoverySaved
         ? `안전 백업 저장본에서 포지션 ${storageChoice.selectedStats.activePositionCount.toLocaleString("ko-KR")}개와 기록 ${storageChoice.selectedStats.recordCount.toLocaleString("ko-KR")}건을 복구했습니다.`
         : "백업 저장본의 데이터를 화면에 복구했지만 다시 저장하지 못했습니다. 즉시 전체 백업을 내려받으세요.");
     }
     if (recoverySaved && storageChoice.recoveredQuarantine) {
       try {
         safeRemoveItem(CORRUPT_FUTURES_STORAGE_KEY);
       } catch (error) {
         console.warn("Recovered futures quarantine cleanup failed", error);
       }
     }
   }
   futuresLimitOrderJournalRecoveryPending = !recoverySaved && limitOrderSync.needsPersistence;
   futuresExitOrderJournalRecoveryPending = !recoverySaved && exitOrderSync.needsPersistence;
   if (recoverySaved) removeMigratedLegacyFuturesStorage();
   if (slots.invalid.length && el.toast) showToast("손상된 저장본 대신 정상 백업본을 복구했습니다.");
   return;
 }
 state.futures = normalizeFuturesState(migrateLegacyFuturesStates());
 reconcileFuturesLimitOrderJournal();
 reconcileFuturesExitOrderJournal();
 futuresStorageRevision = 0;
 futuresStorageLastSavedAt = "";
 const saved = saveFuturesState({ force: true, silent: true, reason: "initial-state" });
 if (!saved) notifyFuturesStorageFailure(slots.accessError || new Error("Initial futures storage failed"));
 else {
   removeMigratedLegacyFuturesStorage();
   if (slots.invalid.length && el.toast) showToast("손상된 저장본을 격리하고 안전한 새 저장본을 만들었습니다.");
 }
}
function migrateLegacyFuturesStates() {
 const fresh = createDefaultFuturesState();
 const merged = {
   ...fresh,
   positions: [],
   limitOrders: [],
   exitOrders: [],
   completedOrderNotices: [],
   trades: [],
   dailySummaries: [],
   tradeMarkers: [],
   trendlinesByMarket: {},
   riskBlocksByMarket: {}
 };
 Object.keys(FUTURES_STORAGE_KEYS).forEach((marketCode) => {
   const legacy = readJson(FUTURES_STORAGE_KEYS[marketCode], null);
   if (!legacy) return;
   const normalized = normalizeFuturesState(legacy);
   merged.positions.push(...normalizeFuturesPositions(normalized.positions).map((position) => ({ ...position, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol })));
   merged.limitOrders.push(...normalizeFuturesLimitOrders(normalized.limitOrders).map((order) => ({ ...order, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol })));
   merged.exitOrders.push(...normalizeFuturesExitOrders(normalized.exitOrders).map((order) => ({ ...order, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol })));
   merged.completedOrderNotices.push(...normalizeFuturesCompletedOrderNotices(normalized.completedOrderNotices).map((notice) => ({ ...notice, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol })));
   merged.trades.push(...(normalized.trades || []).map((trade) => ({ ...trade, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol })));
   merged.positionBlocks.push(...(normalized.positionBlocks || []).map((block) => ({
     ...block,
     market: marketCode,
     symbol: futuresMarketByCode(marketCode).symbol,
     trades: (block.trades || []).map((trade) => ({ ...trade, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol }))
   })));
   merged.dailySummaries.push(...(normalized.dailySummaries || []));
   merged.tradeMarkers.push(...(normalized.tradeMarkers || []).map((marker) => ({ ...marker, market: marketCode, symbol: futuresMarketByCode(marketCode).symbol })));
   merged.trendlinesByMarket[marketCode] = normalized.trendlinesByMarket && normalized.trendlinesByMarket[marketCode]
     ? normalized.trendlinesByMarket[marketCode]
     : normalized.trendlines;
   merged.riskBlocksByMarket[marketCode] = normalized.riskBlocksByMarket && normalized.riskBlocksByMarket[marketCode]
     ? normalized.riskBlocksByMarket[marketCode]
     : normalized.riskBlocks;
 });
 return merged;
}
function saveFuturesState(options = {}) {
 const futures = state.futures;
 futures.account.updatedAt = new Date().toISOString();
 const journal = normalizeFuturesPositionJournal(futures, getFuturesPositions());
 futures.trades = journal.pendingTrades;
 futures.positionBlocks = journal.positionBlocks;
 futures.dailySummaries = journal.dailySummaries;
 futures.positionJournalVersion = FUTURES_POSITION_JOURNAL_VERSION;
 const saveLock = acquireFuturesStorageLock();
 if (!saveLock.ok) {
   notifyFuturesStorageFailure(saveLock.error, options);
   return false;
 }
 let limitOrderJournalTransaction;
 let exitOrderJournalTransaction;
 let result;
 try {
   limitOrderJournalTransaction = stageFuturesLimitOrderJournalWrite();
   if (!limitOrderJournalTransaction.ok) {
     notifyFuturesStorageFailure(limitOrderJournalTransaction.error, options);
     return false;
   }
   exitOrderJournalTransaction = stageFuturesExitOrderJournalWrite();
   if (!exitOrderJournalTransaction.ok) {
     rollbackFuturesLimitOrderJournalWrite(limitOrderJournalTransaction);
     notifyFuturesStorageFailure(exitOrderJournalTransaction.error, options);
     return false;
   }
   result = persistFuturesStoragePayload(buildFuturesStoragePayload(), options);
 } finally {
   releaseFuturesStorageLock();
 }
 if (!result.ok) {
   rollbackFuturesLimitOrderJournalWrite(limitOrderJournalTransaction);
   rollbackFuturesExitOrderJournalWrite(exitOrderJournalTransaction);
   futuresStorageConflict = Boolean(result.error && result.error.code === "FUTURES_STORAGE_CONFLICT");
   notifyFuturesStorageFailure(result.error, options);
   return false;
 }
 futuresStorageRevision = result.revision;
 futuresStorageLastSavedAt = result.savedAt;
 futuresStorageConflict = false;
 futuresStorageWarningShown = false;
 futuresLimitOrderJournalRecoveryPending = false;
 futuresExitOrderJournalRecoveryPending = false;
 queueFuturesLiveBackupWrite(options.reason || "verified-state-save", { storageVerified: true });
 return true;
}
function saveFuturesLedgerResetState(reason = "ledger-reset") {
 const primarySaved = saveFuturesState({ force: true, reason });
 if (!primarySaved) return false;
 // 두 교대 저장 슬롯을 모두 새 장부로 덮어 이전 기록이 보조 슬롯에 남지 않게 합니다.
 saveFuturesState({ force: true, silent: true, reason: `${reason}-mirror` });
 try {
   safeRemoveItem(CORRUPT_FUTURES_STORAGE_KEY);
 } catch (error) {
   console.warn("Obsolete futures quarantine cleanup failed", error);
 }
 return true;
}
function keepOnlyOngoingFuturesRecords(resetAt = new Date().toISOString()) {
 const positions = getFuturesPositions();
 const activePositionIds = new Set(positions.map((position) => String(position.id || "")).filter(Boolean));
 const ongoingTrades = mergeFuturesTradesById(state.futures.trades || []).filter((trade) => {
   const positionId = String(trade && trade.positionId || "");
   return (positionId && activePositionIds.has(positionId)) || Boolean(matchingOpenFuturesPosition(trade, positions));
 });
 state.futures.trades = ongoingTrades;
 state.futures.positionBlocks = [];
 state.futures.dailySummaries = [];
 state.futures.completedOrderNotices = normalizeFuturesCompletedOrderNotices(state.futures.completedOrderNotices)
   .filter((notice) => activePositionIds.has(String(notice && notice.positionId || "")));
 state.futures.tradeMarkers = mergeFuturesTradeMarkers(positions.flatMap(createFuturesEntryMarkers));
 const latestOngoingTrade = [...ongoingTrades]
   .sort((a, b) => futuresTradeExitTimestamp(b) - futuresTradeExitTimestamp(a))[0];
 state.futures.lastRealizedPnl = latestOngoingTrade ? finiteNumber(latestOngoingTrade.netPnl, 0) : 0;
 // 이 값은 일회성 플래그가 아니라 현재 장부 세대의 시작 시각입니다.
 // 새 주문 뒤에도 유지되어 초기화 이전 백업이 다시 병합되지 않게 합니다.
 state.futures.intentionalClearAt = resetAt;
}
function resetFuturesPaperState(initialUsdt = DEFAULT_FUTURES_USDT) {
 const keepCandles = state.futures.candles;
 const keepTicker = state.futures.ticker;
 const keepWs = state.futures.ws;
 const keepWsStream = state.futures.wsStream;
 const keepWsHeartbeatTimer = state.futures.wsHeartbeatTimer;
 const keepWsWatchdogTimer = state.futures.wsWatchdogTimer;
 const keepWsLastMessageAt = state.futures.wsLastMessageAt;
 const keepWsLastTradeAt = state.futures.wsLastTradeAt;
 const keepBybitTickerSnapshots = state.futures.bybitTickerSnapshots;
 const keepReconnectTimer = state.futures.reconnectTimer;
 settleCurrentFuturesLimitOrders();
 settleCurrentFuturesExitOrders();
 state.futures = createDefaultFuturesState(initialUsdt);
 state.futures.intentionalClearAt = new Date().toISOString();
 state.futures.candles = keepCandles;
 state.futures.ticker = keepTicker;
 state.futures.ws = keepWs;
 state.futures.wsStream = keepWsStream;
 state.futures.wsHeartbeatTimer = keepWsHeartbeatTimer;
 state.futures.wsWatchdogTimer = keepWsWatchdogTimer;
 state.futures.wsLastMessageAt = keepWsLastMessageAt;
 state.futures.wsLastTradeAt = keepWsLastTradeAt;
 state.futures.bybitTickerSnapshots = keepBybitTickerSnapshots;
 state.futures.reconnectTimer = keepReconnectTimer;
 return saveFuturesLedgerResetState("paper-state-reset");
}
function applyBinanceUsdtResetOnce() {
 try {
   if (localStorage.getItem(FUTURES_BINANCE_USDT_RESET_KEY) === "true") return false;
 } catch (error) {
   console.warn("Binance USDT reset marker read failed", error);
 }
 resetFuturesPaperState(DEFAULT_FUTURES_USDT);
 try {
   safeSetItem(FUTURES_BINANCE_USDT_RESET_KEY, "true");
 } catch (error) {
   console.warn("Binance USDT reset marker save failed", error);
 }
 return true;
}
function applyActiveFuturesLedgerResetOnce() {
 try {
   if (localStorage.getItem(FUTURES_ACTIVE_LEDGER_RESET_KEY) === "true") return false;
 } catch (error) {
   console.warn("Active futures ledger reset marker read failed", error);
 }
 keepOnlyOngoingFuturesRecords();
 if (!saveFuturesLedgerResetState("active-ledger-only-reset")) return false;
 try {
   safeSetItem(FUTURES_ACTIVE_LEDGER_RESET_KEY, "true");
 } catch (error) {
   console.warn("Active futures ledger reset marker save failed", error);
 }
 return true;
}
function applyFuturesFeeRateMigrationOnce() {
 try {
   if (localStorage.getItem(FUTURES_FEE_RATE_MIGRATION_KEY) === "true") return 0;
 } catch (error) {
   console.warn("Futures fee migration marker read failed", error);
 }
 const positions = getFuturesPositions();
 if (positions.length) {
   const checkpoint = createFuturesPersistenceCheckpoint();
   let balanceAdjustment = 0;
   const migratedPositions = positions.map((position) => {
     const targetEntryFee = Math.max(0, finiteNumber(position.notional, 0) * FUTURES_FEE_RATE);
     balanceAdjustment += Math.max(0, finiteNumber(position.entryFee, 0)) - targetEntryFee;
     const entries = futuresEntryLegs(position).map((entry) => ({
       ...entry,
       entryFee: Math.max(0, finiteNumber(entry.notional, 0) * FUTURES_FEE_RATE)
     }));
     return normalizeFuturesPosition({ ...position, entryFee: targetEntryFee, entries });
   }).filter(Boolean);
   if (migratedPositions.length !== positions.length) {
     restoreFuturesPersistenceCheckpoint(checkpoint);
     return 0;
   }
   state.futures.account.usdtBalance = Math.max(
     0,
     finiteNumber(state.futures.account.usdtBalance, 0) + balanceAdjustment
   );
   setFuturesPositions(migratedPositions);
   if (!saveFuturesState({ force: true, silent: true, reason: "fee-rate-round-trip-0.1-migration" })) {
     restoreFuturesPersistenceCheckpoint(checkpoint);
     return 0;
   }
 }
 try {
   safeSetItem(FUTURES_FEE_RATE_MIGRATION_KEY, "true");
 } catch (error) {
   console.warn("Futures fee migration marker save failed", error);
 }
 return positions.length;
}
function resetAllFuturesPaperStates() {
 const runtime = {
   ticker: state.futures.ticker,
   candles: state.futures.candles,
   ws: state.futures.ws,
   wsStream: state.futures.wsStream,
   wsHeartbeatTimer: state.futures.wsHeartbeatTimer,
   wsWatchdogTimer: state.futures.wsWatchdogTimer,
   wsLastMessageAt: state.futures.wsLastMessageAt,
   wsLastTradeAt: state.futures.wsLastTradeAt,
   bybitTickerSnapshots: state.futures.bybitTickerSnapshots,
   reconnectTimer: state.futures.reconnectTimer,
   socketClosing: state.futures.socketClosing
 };
 settleCurrentFuturesLimitOrders();
 settleCurrentFuturesExitOrders();
 state.futures = { ...createDefaultFuturesState(), ...runtime };
 state.futures.intentionalClearAt = new Date().toISOString();
 return saveFuturesLedgerResetState("all-paper-states-reset");
}
function normalizeTimeframe(value, fallback = state.timeframe) {
 const timeframe = String(value || fallback || "1");
 return TIMEFRAME_MINUTES[timeframe] ? timeframe : "1";
}
function normalizeSpotTimeframe(value, fallback = "1") {
 const timeframe = normalizeTimeframe(value, fallback);
 return SPOT_TIMEFRAMES.has(timeframe) ? timeframe : "1";
}
function timeframeSeconds(value) {
 return TIMEFRAME_MINUTES[normalizeTimeframe(value)] * 60;
}
function timeframeLabel(value) {
 const timeframe = normalizeTimeframe(value);
 if (timeframe.endsWith("s")) return `${timeframe.slice(0, -1)}초`;
 const minutes = TIMEFRAME_MINUTES[timeframe];
 return minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60}시간` : `${minutes}분`;
}
function createDefaultEmaVisibility() {
 return MOVING_AVERAGE_CONFIGS.reduce((visibility, config) => {
   visibility[config.key] = config.defaultVisible;
   return visibility;
 }, {});
}
function defaultBollingerVisibility() {
 return BOLLINGER_CONFIG.defaultVisible;
}
function loadChartIndicatorPreferences() {
 state.chart.emaVisible = normalizeEmaVisibility(readJson(storageKey("emaVisibility"), createDefaultEmaVisibility()));
 state.chart.bollingerVisible = normalizeBollingerVisibility(readJson(storageKey("bollingerVisibility"), defaultBollingerVisibility()));
}
function loadLocalState() {
 state.portfolio = normalizePortfolio(readJson(storageKey("portfolio"), state.portfolio));
 state.sharedAccount = normalizeSharedAccount(readJson(SHARED_ACCOUNT_KEY, null), state.portfolio);
 syncPortfolioWithSharedAccount();
 const tradingHistory = loadSharedTradingHistory();
 state.trades = tradingHistory.trades;
 state.dailySummaries = tradingHistory.dailySummaries;
 applyEmergencyRecoveredPortfolio();
 state.dashboardMemos = normalizeDashboardMemos(readJson(storageKey("dashboardMemos"), ["", ""]));
 state.trendlines = normalizeTrendlines(readJson(storageKey("trendlines"), createEmptyTrendlines()));
 state.riskBlocks = normalizeRiskBlocks(readJson(storageKey("riskBlocks"), createEmptyRiskBlocks()));
 loadChartIndicatorPreferences();
}
function readJson(key, fallback) {
 try {
   const raw = localStorage.getItem(key);
   return raw ? JSON.parse(raw) : fallback;
 } catch (error) {
   console.warn("localStorage parse failed", key, error);
   return fallback;
 }
}
function safeSetItem(key, value) {
 localStorage.setItem(key, value);
 if (localStorage.getItem(key) !== value) {
   throw new Error(`Storage verification failed: ${key}`);
 }
}
function safeSetJson(key, value) {
 safeSetItem(key, JSON.stringify(value));
}
function reclaimTradingStorage(exceptKey = "") {
 [RECOVERY_SNAPSHOTS_KEY, RECOVERY_SNAPSHOT_KEY].forEach((key) => {
   if (key === exceptKey) return;
   try {
     localStorage.removeItem(key);
   } catch (error) {
     console.warn("localStorage cleanup failed", key, error);
   }
 });
}
function saveJsonWithStorageCleanup(key, value) {
 const serialized = JSON.stringify(value);
 try {
   safeSetItem(key, serialized);
   return;
 } catch (error) {
   console.warn("localStorage write failed, retrying after cleanup", key, error);
   reclaimTradingStorage(key);
   safeSetItem(key, serialized);
 }
}
function trySaveJson(key, value) {
 try {
   saveJsonWithStorageCleanup(key, value);
   return true;
 } catch (error) {
   console.error("localStorage write failed", key, error);
   return false;
 }
}
function safeRemoveItem(key) {
 localStorage.removeItem(key);
 if (localStorage.getItem(key) !== null) {
   throw new Error(`Storage remove verification failed: ${key}`);
 }
}
function timestampMs(value) {
 const time = new Date(value || 0).getTime();
 return Number.isFinite(time) ? time : 0;
}
function latestTradeTimestamp(trades) {
 return normalizeTrades(trades || [], DEFAULT_MARKET).reduce((latest, trade) => {
   return Math.max(latest, timestampMs(trade.createdAt));
 }, 0);
}
function readRecoverySnapshot() {
 const snapshot = readJson(RECOVERY_SNAPSHOT_KEY, null);
 if (!snapshot || typeof snapshot !== "object") return null;
 const trades = normalizeTrades(snapshot.trades || [], DEFAULT_MARKET);
 const dailySummaries = normalizeDailySummaries(snapshot.dailySummaries || []);
 if (!trades.length && !dailySummaries.length) return null;
 return {
   ...snapshot,
   trades,
   dailySummaries,
   createdAt: snapshot.createdAt || snapshot.updatedAt || new Date(0).toISOString()
 };
}
function isIntentionalClearNewerThan(snapshot) {
 const marker = readJson(INTENTIONAL_CLEAR_KEY, null);
 if (!marker || !marker.createdAt) return false;
 return timestampMs(marker.createdAt) >= timestampMs(snapshot.createdAt);
}
function shouldUseRecoverySnapshot(snapshot, trades, dailySummaries) {
 if (!snapshot || isIntentionalClearNewerThan(snapshot)) return false;
 if (!trades.length && !dailySummaries.length) return true;
 if (snapshot.trades.length > trades.length) return true;
 if (snapshot.dailySummaries.length > dailySummaries.length) return true;
 return latestTradeTimestamp(snapshot.trades) > latestTradeTimestamp(trades);
}
function recoverTradingHistoryIfNeeded(trades, dailySummaries) {
 const snapshot = readRecoverySnapshot();
 if (!shouldUseRecoverySnapshot(snapshot, trades, dailySummaries)) {
   return { trades, dailySummaries };
 }
 safeSetJson(SHARED_TRADES_KEY, snapshot.trades);
 safeSetJson(SHARED_DAILY_SUMMARIES_KEY, snapshot.dailySummaries);
 safeSetItem(SHARED_TRADING_MIGRATION_KEY, "true");
 return {
   trades: snapshot.trades,
   dailySummaries: snapshot.dailySummaries
 };
}
function writeRecoverySnapshot(reason) {
 try {
   const trades = normalizeTrades(state.trades || [], DEFAULT_MARKET);
   const dailySummaries = normalizeDailySummaries(state.dailySummaries || []);
   if (!trades.length && !dailySummaries.length) return;
   const snapshot = {
     reason,
     createdAt: new Date().toISOString(),
     market: state.market,
     trades,
     dailySummaries,
     sharedAccount: state.sharedAccount,
     portfolio: state.portfolio
   };
   trySaveJson(RECOVERY_SNAPSHOT_KEY, snapshot);
   const snapshots = Array.isArray(readJson(RECOVERY_SNAPSHOTS_KEY, []))
     ? readJson(RECOVERY_SNAPSHOTS_KEY, [])
     : [];
   trySaveJson(RECOVERY_SNAPSHOTS_KEY, [snapshot, ...snapshots].slice(0, RECOVERY_SNAPSHOT_LIMIT));
 } catch (error) {
   console.warn("Recovery snapshot write skipped", error);
 }
}
function markIntentionalClear(reason) {
 safeSetJson(INTENTIONAL_CLEAR_KEY, {
   reason,
   createdAt: new Date().toISOString()
 });
}
function normalizePortfolio(value) {
 const base = createDefaultPortfolio(DEFAULT_SEED);
 const source = value && typeof value === "object" ? value : {};
 const seed = positiveNumber(source.initialSeedKrw, DEFAULT_SEED);
 return {
   ...base,
   initialSeedKrw: seed,
   krwBalance: Math.max(0, finiteNumber(source.krwBalance, seed)),
   btcBalance: Math.max(0, finiteNumber(source.btcBalance, 0)),
   avgBuyPrice: Math.max(0, finiteNumber(source.avgBuyPrice, 0)),
   realizedPnl: finiteNumber(source.realizedPnl, 0),
   feeRateBuy: clamp(finiteNumber(source.feeRateBuy, 0.0004), 0, 0.05),
   feeRateSell: clamp(finiteNumber(source.feeRateSell, 0.0004), 0, 0.05),
   updatedAt: source.updatedAt || new Date().toISOString()
 };
}
function normalizeSharedAccount(value, fallbackPortfolio) {
 const source = value && typeof value === "object" ? value : {};
 const fallback = fallbackPortfolio || createDefaultPortfolio(DEFAULT_SEED);
 const seed = positiveNumber(source.initialSeedKrw, positiveNumber(fallback.initialSeedKrw, DEFAULT_SEED));
 return {
   initialSeedKrw: seed,
   krwBalance: Math.max(0, finiteNumber(source.krwBalance, finiteNumber(fallback.krwBalance, seed))),
   feeRateBuy: clamp(finiteNumber(source.feeRateBuy, finiteNumber(fallback.feeRateBuy, 0.0004)), 0, 0.05),
   feeRateSell: clamp(finiteNumber(source.feeRateSell, finiteNumber(fallback.feeRateSell, 0.0004)), 0, 0.05),
   updatedAt: source.updatedAt || fallback.updatedAt || new Date().toISOString()
 };
}
function syncPortfolioWithSharedAccount() {
 state.portfolio.initialSeedKrw = state.sharedAccount.initialSeedKrw;
 state.portfolio.krwBalance = state.sharedAccount.krwBalance;
 state.portfolio.feeRateBuy = state.sharedAccount.feeRateBuy;
 state.portfolio.feeRateSell = state.sharedAccount.feeRateSell;
}
function normalizeTrendlines(value) {
 const next = createEmptyTrendlines();
 Object.keys(next).forEach((timeframe) => {
   next[timeframe] = Array.isArray(value && value[timeframe])
     ? value[timeframe].filter((line) => line && line.id).map((line) => ({
       ...line,
       timeframe: line.timeframe || timeframe
     }))
     : [];
 });
 return next;
}
function normalizeRiskBlocks(value) {
 const next = createEmptyRiskBlocks();
 Object.keys(next).forEach((timeframe) => {
   const source = Array.isArray(value && value[timeframe]) ? value[timeframe] : [];
   next[timeframe] = source
     .map((block) => normalizeRiskBlock(block, timeframe))
     .filter(Boolean);
 });
 return next;
}
function normalizeRiskBlock(block, fallbackTimeframe = state.timeframe) {
 if (!block || !block.id) return null;
 const entryPrice = positiveNumber(finiteNumber(block.entryPrice, 0), 0);
 if (!entryPrice) return null;
 const timeframe = normalizeTimeframe(block.timeframe, fallbackTimeframe);
 const rewardRatio = positiveNumber(finiteNumber(block.rewardRatio, DEFAULT_REWARD_RATIO), DEFAULT_REWARD_RATIO);
 const riskRatio = positiveNumber(finiteNumber(block.riskRatio, DEFAULT_RISK_RATIO), DEFAULT_RISK_RATIO);
 const riskHeight = positiveNumber(
   finiteNumber(block.riskHeight, entryPrice - finiteNumber(block.stopLossPrice, entryPrice * 0.99)),
   defaultRiskHeight(entryPrice)
 );
 return refreshRiskBlockPrices({
   id: String(block.id),
   timeframe,
   entryX: finiteNumber(block.entryX, finiteNumber(block.entryTime, 0)),
   entryTime: finiteNumber(block.entryTime, finiteNumber(block.entryX, 0)),
   entryPrice,
   direction: block.direction === "SHORT" ? "SHORT" : "LONG",
   width: clamp(finiteNumber(block.width, DEFAULT_RISK_BLOCK_WIDTH), MIN_RISK_BLOCK_WIDTH, CANDLE_LOAD_LIMIT),
   riskHeight,
   rewardHeight: positiveNumber(finiteNumber(block.rewardHeight, 0), riskHeight * (rewardRatio / riskRatio)),
   stopLossPrice: finiteNumber(block.stopLossPrice, entryPrice - riskHeight),
   takeProfitPrice: finiteNumber(block.takeProfitPrice, entryPrice + riskHeight * (rewardRatio / riskRatio)),
   rewardRatio,
   riskRatio,
   rewardRiskRatio: rewardRatio / riskRatio,
   isSelected: false,
   createdAt: block.createdAt || new Date().toISOString()
 });
}
function normalizeDashboardMemos(value) {
 const list = Array.isArray(value) ? value : [];
 return [
   String(list[0] || "").slice(0, 240),
   String(list[1] || "").slice(0, 240)
 ];
}
function loadSharedTradingHistory() {
 let trades = normalizeTrades(readJson(SHARED_TRADES_KEY, []));
 const backupTrades = normalizeTrades(readJson(SHARED_TRADES_BACKUP_KEY, []));
 const lastTradeBackup = normalizeTrade(readJson(LAST_TRADE_BACKUP_KEY, null), DEFAULT_MARKET);
 trades = mergeTradesById(trades, backupTrades, lastTradeBackup ? [lastTradeBackup] : []);
 let dailySummaries = normalizeDailySummaries(readJson(SHARED_DAILY_SUMMARIES_KEY, []));
 const legacyTrades = [];
 const legacySummaries = [];
 Object.keys(MARKETS).forEach((marketCode) => {
   const marketTrades = readJson(marketStorageKey(marketCode, "trades"), []);
   if (Array.isArray(marketTrades)) {
     legacyTrades.push(...marketTrades.map((trade) => ({
       ...trade,
       market: tradeMarketCode(trade, marketCode)
     })));
   }
   const marketSummaries = readJson(marketStorageKey(marketCode, "dailySummaries"), []);
   if (Array.isArray(marketSummaries)) {
     legacySummaries.push(...marketSummaries);
   }
 });
 if (localStorage.getItem(SHARED_TRADING_MIGRATION_KEY) !== "true" || legacyTrades.length || legacySummaries.length) {
   trades = mergeTradesById(trades, normalizeTrades(legacyTrades));
   dailySummaries = combineDailySummaries([...dailySummaries, ...legacySummaries]);
   safeSetJson(SHARED_TRADES_KEY, trades);
   safeSetJson(SHARED_DAILY_SUMMARIES_KEY, dailySummaries);
   safeSetItem(SHARED_TRADING_MIGRATION_KEY, "true");
 }
 const recoveredHistory = applyEmergencyRecoveredTrades(trades, dailySummaries);
 trades = recoveredHistory.trades;
 dailySummaries = recoveredHistory.dailySummaries;
 trySaveJson(SHARED_TRADES_KEY, trades);
 return recoverTradingHistoryIfNeeded(trades, dailySummaries);
}
function shouldApplyEmergencyRecoveredTrades(trades, recoveredTrades) {
 const recoverySnapshot = { createdAt: EMERGENCY_RECOVERY_PORTFOLIO.updatedAt };
 if (!recoveredTrades.length || isIntentionalClearNewerThan(recoverySnapshot)) return false;
 if (!trades.length) return true;
 if (trades.length < recoveredTrades.length) return true;
 return latestTradeTimestamp(recoveredTrades) > latestTradeTimestamp(trades);
}
function applyEmergencyRecoveredTrades(trades, dailySummaries) {
 const recoveredTrades = normalizeTrades(EMERGENCY_RECOVERY_TRADES, DEFAULT_MARKET);
 if (!shouldApplyEmergencyRecoveredTrades(trades, recoveredTrades)) return { trades, dailySummaries };
 const restoredTrades = mergeTradesById(recoveredTrades, trades);
 const recoveredDailySummaries = normalizeDailySummaries(dailySummaries || []);
 const recoveredPortfolio = normalizePortfolio(EMERGENCY_RECOVERY_PORTFOLIO);
 const recoveredSharedAccount = {
   initialSeedKrw: recoveredPortfolio.initialSeedKrw,
   krwBalance: recoveredPortfolio.krwBalance,
   feeRateBuy: recoveredPortfolio.feeRateBuy,
   feeRateSell: recoveredPortfolio.feeRateSell,
   updatedAt: recoveredPortfolio.updatedAt
 };
 const snapshot = {
   reason: "manual-recovery-20260702",
   createdAt: recoveredPortfolio.updatedAt,
   market: DEFAULT_MARKET,
   trades: restoredTrades,
   dailySummaries: recoveredDailySummaries,
   sharedAccount: recoveredSharedAccount,
   portfolio: recoveredPortfolio
 };
 safeSetJson(SHARED_TRADES_KEY, restoredTrades);
 safeSetJson(SHARED_TRADES_BACKUP_KEY, restoredTrades);
 safeSetJson(LAST_TRADE_BACKUP_KEY, restoredTrades[restoredTrades.length - 1]);
 safeSetJson(SHARED_DAILY_SUMMARIES_KEY, recoveredDailySummaries);
 safeSetItem(SHARED_TRADING_MIGRATION_KEY, "true");
 safeSetJson(RECOVERY_SNAPSHOT_KEY, snapshot);
 safeSetJson(RECOVERY_SNAPSHOTS_KEY, [snapshot]);
 safeRemoveItem(INTENTIONAL_CLEAR_KEY);
 safeRemoveItem(EMERGENCY_RECOVERY_PORTFOLIO_APPLIED_KEY);
 safeSetItem(EMERGENCY_RECOVERY_KEY, "true");
 return { trades: restoredTrades, dailySummaries: recoveredDailySummaries };
}
function applyEmergencyRecoveredPortfolio() {
 if (localStorage.getItem(EMERGENCY_RECOVERY_KEY) !== "true") return;
 if (localStorage.getItem(EMERGENCY_RECOVERY_PORTFOLIO_APPLIED_KEY) === "true") return;
 const recoveredPortfolio = normalizePortfolio(EMERGENCY_RECOVERY_PORTFOLIO);
 state.portfolio = recoveredPortfolio;
 state.sharedAccount = normalizeSharedAccount({
   initialSeedKrw: recoveredPortfolio.initialSeedKrw,
   krwBalance: recoveredPortfolio.krwBalance,
   feeRateBuy: recoveredPortfolio.feeRateBuy,
   feeRateSell: recoveredPortfolio.feeRateSell,
   updatedAt: recoveredPortfolio.updatedAt
 }, recoveredPortfolio);
 safeSetJson(SHARED_ACCOUNT_KEY, state.sharedAccount);
 Object.keys(MARKETS).forEach((marketCode) => {
   const portfolio = createDefaultPortfolio(recoveredPortfolio.initialSeedKrw);
   portfolio.krwBalance = recoveredPortfolio.krwBalance;
   portfolio.feeRateBuy = recoveredPortfolio.feeRateBuy;
   portfolio.feeRateSell = recoveredPortfolio.feeRateSell;
   portfolio.updatedAt = recoveredPortfolio.updatedAt;
   safeSetJson(marketStorageKey(marketCode, "portfolio"), portfolio);
 });
 safeSetJson(storageKey("portfolio"), state.portfolio);
 safeSetItem(EMERGENCY_RECOVERY_PORTFOLIO_APPLIED_KEY, "true");
}
function normalizeTrades(value, fallbackMarket = state.market) {
 const list = Array.isArray(value) ? value : [];
 return list
   .map((trade) => normalizeTrade(trade, fallbackMarket))
   .filter(Boolean)
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
function normalizeTrade(trade, fallbackMarket = state.market) {
 if (!trade || !trade.id) return null;
 const side = trade.side === "SELL" ? "SELL" : "BUY";
 const createdAt = trade.createdAt || new Date().toISOString();
 return {
   ...trade,
   id: String(trade.id),
   market: tradeMarketCode(trade, fallbackMarket),
   side,
   price: finiteNumber(trade.price, 0),
   btcAmount: Math.max(0, finiteNumber(trade.btcAmount, 0)),
   krwAmount: Math.max(0, finiteNumber(trade.krwAmount, 0)),
   fee: Math.max(0, finiteNumber(trade.fee, 0)),
   realizedPnl: finiteNumber(trade.realizedPnl, 0),
   realizedPnlRate: finiteNumber(trade.realizedPnlRate, 0),
   krwBalanceAfter: finiteNumber(trade.krwBalanceAfter, 0),
   btcBalanceAfter: Math.max(0, finiteNumber(trade.btcBalanceAfter, 0)),
   avgEntryPrice: Math.max(0, finiteNumber(trade.avgEntryPrice, finiteNumber(trade.avgBuyPriceAfter, 0))),
   avgBuyPriceAfter: Math.max(0, finiteNumber(trade.avgBuyPriceAfter, 0)),
   memo: String(trade.memo || "").slice(0, 80),
   createdAt
 };
}
function mergeTradesById(...tradeLists) {
 const byId = new Map();
 tradeLists.flat().forEach((trade) => {
   const normalized = normalizeTrade(trade);
   if (normalized && !byId.has(normalized.id)) {
     byId.set(normalized.id, normalized);
   }
 });
 return [...byId.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
function mergeFuturesTradesById(...tradeLists) {
 const byId = new Map();
 tradeLists.flat().forEach((trade) => {
   const normalized = normalizeFuturesTrade(trade);
   if (normalized && !byId.has(normalized.id)) {
     byId.set(normalized.id, normalized);
   }
 });
 return [...byId.values()].sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime());
}
function tradeMarketCode(trade, fallbackMarket = state.market) {
 const marketCode = trade && typeof trade.market === "string" ? trade.market : fallbackMarket;
 return MARKETS[marketCode] ? marketCode : DEFAULT_MARKET;
}
function tradeMarket(trade) {
 return MARKETS[tradeMarketCode(trade)] || MARKETS[DEFAULT_MARKET];
}
function tradesForMarket(marketCode = state.market) {
 return state.trades.filter((trade) => tradeMarketCode(trade) === marketCode);
}
function portfolioForMarket(marketCode = state.market) {
 if (marketCode === state.market) return state.portfolio;
 return normalizePortfolio(readJson(marketStorageKey(marketCode, "portfolio"), createDefaultPortfolio(DEFAULT_SEED)));
}
function tickerForMarket(marketCode = state.market) {
 return state.marketTickers[marketCode] || (marketCode === state.market ? state.ticker : null);
}
function combineDailySummaries(summaries) {
 const byDate = new Map();
 summaries
   .map((summary) => normalizeDailySummary(summary))
   .filter(Boolean)
   .forEach((summary) => {
     const existing = byDate.get(summary.dateKey);
     if (!existing) {
       byDate.set(summary.dateKey, { ...summary });
       return;
     }
     existing.tradeCount += summary.tradeCount;
     existing.buyCount += summary.buyCount;
     existing.sellCount += summary.sellCount;
     existing.winCount += summary.winCount;
     existing.realizedPnl += summary.realizedPnl;
     existing.trades = mergeTradesById(existing.trades || [], summary.trades || []);
     existing.seedKrw = positiveNumber(existing.seedKrw, summary.seedKrw);
     existing.returnRate = existing.seedKrw > 0 ? (existing.realizedPnl / existing.seedKrw) * 100 : 0;
     existing.winRate = existing.sellCount > 0 ? (existing.winCount / existing.sellCount) * 100 : null;
     existing.updatedAt = new Date().toISOString();
   });
 return normalizeDailySummaries([...byDate.values()]);
}
function normalizeDailySummaries(value) {
 const list = Array.isArray(value) ? value : [];
 return list
   .map((summary) => normalizeDailySummary(summary))
   .filter(Boolean)
   .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
function normalizeDailySummary(summary) {
 if (!summary || !summary.dateKey) return null;
 const dateKey = String(summary.dateKey);
 const seedKrw = positiveNumber(finiteNumber(summary.seedKrw, state.portfolio.initialSeedKrw), state.portfolio.initialSeedKrw || DEFAULT_SEED);
 const realizedPnl = finiteNumber(summary.realizedPnl, 0);
 const sellCount = Math.max(0, Math.round(finiteNumber(summary.sellCount, 0)));
 const winCount = Math.max(0, Math.round(finiteNumber(summary.winCount, 0)));
 const archivedTrades = normalizeTrades(summary.trades || []);
 return {
   id: summary.id || `daily-${dateKey}`,
   dateKey,
   tradeCount: Math.max(0, Math.round(finiteNumber(summary.tradeCount, archivedTrades.length))),
   buyCount: Math.max(0, Math.round(finiteNumber(summary.buyCount, 0))),
   sellCount,
   winCount,
   realizedPnl,
   seedKrw,
   returnRate: seedKrw > 0 ? (realizedPnl / seedKrw) * 100 : 0,
   winRate: sellCount > 0 ? (winCount / sellCount) * 100 : null,
   trades: archivedTrades,
   createdAt: summary.createdAt || new Date().toISOString(),
   updatedAt: summary.updatedAt || summary.createdAt || new Date().toISOString()
 };
}
function normalizeEmaVisibility(value) {
 const next = createDefaultEmaVisibility();
 MOVING_AVERAGE_CONFIGS.forEach((config) => {
   if (value && Object.prototype.hasOwnProperty.call(value, config.key)) {
     next[config.key] = Boolean(value[config.key]);
   }
 });
 return next;
}
function normalizeBollingerVisibility(value) {
 return typeof value === "boolean" ? value : BOLLINGER_CONFIG.defaultVisible;
}
function savePortfolio() {
 state.portfolio.updatedAt = new Date().toISOString();
 state.sharedAccount = {
   initialSeedKrw: state.portfolio.initialSeedKrw,
   krwBalance: state.portfolio.krwBalance,
   feeRateBuy: state.portfolio.feeRateBuy,
   feeRateSell: state.portfolio.feeRateSell,
   updatedAt: state.portfolio.updatedAt
 };
 safeSetJson(SHARED_ACCOUNT_KEY, state.sharedAccount);
 safeSetJson(storageKey("portfolio"), state.portfolio);
}
function saveTrades() {
 const trades = normalizeTrades(state.trades || [], DEFAULT_MARKET);
 state.trades = trades;
 const latestTrade = trades[trades.length - 1] || null;
 saveJsonWithStorageCleanup(SHARED_TRADES_KEY, trades);
 if (latestTrade) {
   trySaveJson(LAST_TRADE_BACKUP_KEY, latestTrade);
   trySaveJson(SHARED_TRADES_BACKUP_KEY, trades);
   writeRecoverySnapshot("save-trades");
 }
}
function saveDailySummaries() {
 state.dailySummaries = normalizeDailySummaries(state.dailySummaries || []);
 saveJsonWithStorageCleanup(SHARED_DAILY_SUMMARIES_KEY, state.dailySummaries);
 writeRecoverySnapshot("save-daily-summaries");
}
function saveDashboardMemos() {
 safeSetJson(storageKey("dashboardMemos"), state.dashboardMemos);
}
function saveTrendlines() {
 safeSetJson(storageKey("trendlines"), state.trendlines);
}
function saveRiskBlocks() {
 safeSetJson(storageKey("riskBlocks"), state.riskBlocks);
}
function saveActiveTrendlines() {
 if (isFuturesMode()) saveFuturesState();
 else saveTrendlines();
}
function saveActiveRiskBlocks() {
 if (isFuturesMode()) saveFuturesState();
 else saveRiskBlocks();
}
function saveEmaVisibility() {
 safeSetJson(storageKey("emaVisibility"), state.chart.emaVisible);
}
function saveBollingerVisibility() {
 safeSetJson(storageKey("bollingerVisibility"), state.chart.bollingerVisible);
}
function resetAllMarketAccounts(seed, buyFee, sellFee) {
 const updatedAt = new Date().toISOString();
 state.sharedAccount = createDefaultSharedAccount(seed);
 state.sharedAccount.feeRateBuy = buyFee;
 state.sharedAccount.feeRateSell = sellFee;
 state.sharedAccount.updatedAt = updatedAt;
 safeSetJson(SHARED_ACCOUNT_KEY, state.sharedAccount);
 Object.keys(MARKETS).forEach((marketCode) => {
   const portfolio = createDefaultPortfolio(seed);
   portfolio.feeRateBuy = buyFee;
   portfolio.feeRateSell = sellFee;
   portfolio.updatedAt = updatedAt;
   safeSetJson(marketStorageKey(marketCode, "portfolio"), portfolio);
 });
 state.portfolio = createDefaultPortfolio(seed);
 state.portfolio.feeRateBuy = buyFee;
 state.portfolio.feeRateSell = sellFee;
 state.portfolio.updatedAt = updatedAt;
 syncPortfolioWithSharedAccount();
}
function clearAllMarketTrades() {
 writeRecoverySnapshot("before-clear-trades");
 markIntentionalClear("clear-trades");
 Object.keys(MARKETS).forEach((marketCode) => {
   safeSetJson(marketStorageKey(marketCode, "trades"), []);
   safeSetJson(marketStorageKey(marketCode, "dailySummaries"), []);
 });
 state.trades = [];
 state.dailySummaries = [];
 saveTrades();
 saveDailySummaries();
 safeSetItem(SHARED_TRADING_MIGRATION_KEY, "true");
}
function clearAllMarketDrawings() {
 Object.keys(MARKETS).forEach((marketCode) => {
   safeSetJson(marketStorageKey(marketCode, "trendlines"), createEmptyTrendlines());
   safeSetJson(marketStorageKey(marketCode, "riskBlocks"), createEmptyRiskBlocks());
 });
 state.trendlines = createEmptyTrendlines();
 state.riskBlocks = createEmptyRiskBlocks();
 state.futures.trendlinesByMarket = {};
 state.futures.riskBlocksByMarket = {};
 Object.keys(FUTURES_MARKETS).forEach((marketCode) => {
   state.futures.trendlinesByMarket[marketCode] = createEmptyTrendlines();
   state.futures.riskBlocksByMarket[marketCode] = createEmptyRiskBlocks();
 });
 saveFuturesState();
}
function renderAll() {
 renderMarketLabels();
 renderTicker();
 renderChartPositionFilter();
 renderDashboard();
 renderDashboardMemos();
 renderTradeButtons();
 renderTradeHistory();
 renderTimeframeButtons();
 renderEmaControls();
 renderBollingerControl();
 renderRangeAssistantControls();
 renderChartRangeControls();
 renderUserChartOverlayToggle();
 updateTrendControls();
 renderRiskControls();
 drawChart();
}
function isMemoInputActive() {
 return Boolean(document.activeElement && document.activeElement.closest && document.activeElement.closest(".memo-input"));
}
function renderTicker() {
 const ticker = activeTicker();
 if (!ticker) {
   setText(el.statPrice, "-");
   setText(el.statChange, "-");
   setText(el.tickerChangePrice, "-");
   setText(el.tickerChangeRate, "-");
   setText(el.tickerHigh, "-");
   setText(el.tickerLow, "-");
   setText(el.tickerAccTrade, "-");
   return;
 }
 setText(el.statPrice, formatActivePrice(ticker.price));
 setSignedText(
  el.statChange,
  ticker.changeRate,
  `${formatSignedPercent(ticker.changeRate)} / ${isFuturesMode() ? formatSignedFuturesDisplayPrice(ticker.changePrice) : formatSignedKrw(ticker.changePrice)}`
 );
 setSignedText(el.tickerChangePrice, ticker.changePrice, isFuturesMode() ? formatSignedFuturesDisplayPrice(ticker.changePrice) : formatSignedKrw(ticker.changePrice));
 setSignedText(el.tickerChangeRate, ticker.changeRate, formatSignedPercent(ticker.changeRate));
 setText(el.tickerHigh, formatActivePrice(ticker.highPrice));
 setText(el.tickerLow, formatActivePrice(ticker.lowPrice));
 setText(el.tickerAccTrade, isFuturesMode() ? formatFuturesMarketValue(ticker.accTradePrice24h) : formatKrw(ticker.accTradePrice24h, 0));
}
function renderDashboard() {
 if (isFuturesMode()) {
   renderFuturesDashboard();
   return;
 }
 const portfolio = state.portfolio;
 const price = state.ticker ? state.ticker.price : 0;
 const evaluatedBtc = portfolio.btcBalance * price;
 const liquidationValue = evaluatedBtc * (1 - portfolio.feeRateSell);
 const costBasis = portfolio.avgBuyPrice * portfolio.btcBalance;
 const totalAsset = getTotalEvaluatedAsset();
 const unrealized = portfolio.btcBalance > 0 ? liquidationValue - costBasis : 0;
 const unrealizedRate = costBasis > 0 ? (unrealized / costBasis) * 100 : 0;
 const sellTrades = state.trades.filter((trade) => trade.side === "SELL");
 const activeWinCount = sellTrades.filter((trade) => trade.realizedPnl > 0).length;
 const archivedTradeCount = state.dailySummaries.reduce((sum, summary) => sum + finiteNumber(summary.tradeCount, 0), 0);
 const archivedSellCount = state.dailySummaries.reduce((sum, summary) => sum + finiteNumber(summary.sellCount, 0), 0);
 const archivedWinCount = state.dailySummaries.reduce((sum, summary) => sum + finiteNumber(summary.winCount, 0), 0);
 const totalTradeCount = state.trades.length + archivedTradeCount;
 const totalSellCount = sellTrades.length + archivedSellCount;
 const totalWinCount = activeWinCount + archivedWinCount;
 const winRate = totalSellCount ? (totalWinCount / totalSellCount) * 100 : 0;
 const avgRate = sellTrades.length
   ? sellTrades.reduce((sum, trade) => sum + finiteNumber(trade.realizedPnlRate, 0), 0) / sellTrades.length
   : 0;
 const totalRealizedPnl = state.dailySummaries.reduce((sum, summary) => sum + finiteNumber(summary.realizedPnl, 0), 0)
   + sellTrades.reduce((sum, trade) => sum + finiteNumber(trade.realizedPnl, 0), 0);
 setText(el.statTotalAsset, formatKrw(totalAsset));
 setText(el.statKrw, formatKrw(sharedKrwBalance()));
 setSignedText(el.statUnrealized, unrealized, formatSignedKrw(unrealized));
 setSignedText(el.statUnrealizedRate, unrealizedRate, formatSignedPercent(unrealizedRate));
 setSignedText(el.statRealized, totalRealizedPnl, formatSignedKrw(totalRealizedPnl));
 setText(el.statTradeCount, `총 매매 ${totalTradeCount.toLocaleString("ko-KR")}회`);
 setText(el.statWinRate, totalSellCount ? `${formatNumber(winRate, 1)}%` : "-");
 setSignedText(el.statAvgRate, avgRate, `평균 수익률 ${formatSignedPercent(avgRate)}`);
 renderHoldingsAllocation();
}
function futuresArchivedTrades() {
 const summaries = state.futures && Array.isArray(state.futures.dailySummaries) ? state.futures.dailySummaries : [];
 const blocks = state.futures && Array.isArray(state.futures.positionBlocks) ? state.futures.positionBlocks : [];
 return [
   ...blocks.flatMap((block) => Array.isArray(block.trades) ? block.trades : []),
   ...summaries.flatMap((summary) => Array.isArray(summary.trades) ? summary.trades : [])
 ];
}
function allFuturesClosedTrades() {
 return mergeFuturesTradesById(futuresArchivedTrades(), state.futures && state.futures.trades ? state.futures.trades : []);
}
function completedFuturesPositionBlocks() {
 return normalizeFuturesPositionBlocks(state.futures && state.futures.positionBlocks || []);
}
function ongoingFuturesPositionBlocks() {
 const positions = getFuturesPositions();
 const pendingTrades = mergeFuturesTradesById(state.futures && state.futures.trades || []);
 return positions.map((position) => {
   const trades = pendingTrades.filter((trade) => {
     if (trade.positionId) return String(trade.positionId) === String(position.id);
     const matched = matchingOpenFuturesPosition(trade, [position]);
     return Boolean(matched && matched.id === position.id);
   });
   const entries = futuresEntryLegs(position);
   const currentPrice = currentFuturesPriceForPosition(position);
   const live = calculateFuturesPosition(position, currentPrice);
   const realizedPnl = trades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0);
   const closedMargin = trades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.margin, 0)), 0);
   const usedMargin = position.margin + closedMargin;
   const fees = Math.max(0, finiteNumber(position.entryFee, 0))
     + trades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.fee, 0)), 0);
   return {
     id: `ongoing-${position.id}`,
     positionId: position.id,
     marketType: "futures",
     market: futuresPositionMarketCode(position),
     symbol: futuresPositionSymbol(position),
     side: position.direction === "SHORT" ? "short" : "long",
     direction: position.direction === "SHORT" ? "Short" : "Long",
     leverage: position.leverage,
     entryPrice: futuresEffectiveEntryPrice(position),
     margin: usedMargin,
     currentMargin: position.margin,
     quantity: position.quantity + trades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.quantity, 0)), 0),
     entries,
     entryCount: entries.length || 1,
     closeCount: trades.length,
     tradeCount: trades.length,
     fee: fees,
     netPnl: realizedPnl,
     realizedPnl,
     roe: closedMargin > 0 ? (realizedPnl / closedMargin) * 100 : 0,
     unrealizedPnl: live.netPnl,
     unrealizedRoe: live.roePercent,
     currentPrice,
     liquidationPrice: live.liquidationPrice,
     remainingPercent: finiteNumber(position.remainingPercent, 100),
     memo: position.memo || "",
     entryTime: position.openedAt,
     openedAt: position.openedAt,
     trades,
     isOngoing: true
   };
 });
}
function renderFuturesDashboard() {
 const futures = state.futures;
 const positions = getFuturesPositions();
 const positionRows = positions.map((position) => ({
   position,
   calc: calculateFuturesPosition(position, currentFuturesPriceForPosition(position))
 }));
 const unrealized = positionRows.reduce((sum, row) => sum + row.calc.netPnl, 0);
 const totalMargin = positions.reduce((sum, position) => sum + finiteNumber(position.margin, 0), 0);
 const totalAsset = futures.account.usdtBalance + positionRows.reduce((sum, row) => {
   return sum + row.position.margin + row.calc.grossPnl - row.calc.exitFee;
 }, 0);
 const closedTrades = allFuturesClosedTrades();
 const completedBlocks = completedFuturesPositionBlocks();
 const realized = closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0);
 const wins = completedBlocks.filter((block) => finiteNumber(block.netPnl, 0) > 0).length;
 const avgRoe = completedBlocks.length
   ? completedBlocks.reduce((sum, block) => sum + finiteNumber(block.roe, finiteNumber(block.roePercent, 0)), 0) / completedBlocks.length
   : 0;
 setText(el.statTotalAsset, formatFuturesDisplayAmount(totalAsset));
 setText(el.statKrw, formatFuturesDisplayAmount(futuresAvailableUsdtBalance()));
 setSignedText(el.statUnrealized, unrealized, formatSignedFuturesDisplayAmount(unrealized));
 setSignedText(el.statUnrealizedRate, totalMargin ? (unrealized / totalMargin) * 100 : 0, totalMargin ? formatSignedPercent((unrealized / totalMargin) * 100) : "-");
 setSignedText(el.statRealized, realized, formatSignedFuturesDisplayAmount(realized));
 setText(el.statTradeCount, `완료 포지션 ${completedBlocks.length.toLocaleString("ko-KR")}회`);
 setText(el.statWinRate, completedBlocks.length ? `${formatNumber((wins / completedBlocks.length) * 100, 1)}%` : "-");
 setSignedText(el.statAvgRate, avgRoe, `평균 ROE ${closedTrades.length ? formatSignedPercent(avgRoe) : "-"}`);
 renderFuturesAllocation(positionRows);
 renderFuturesPositionPanel();
 renderFuturesOpenPositionsBlock();
}
function renderFuturesAllocation(positionRows = []) {
 const rows = Array.isArray(positionRows) && positionRows.length
   ? positionRows
    : getFuturesPositions().map((position) => ({
      position,
      calc: calculateFuturesPosition(position, currentFuturesPriceForPosition(position))
    }));
 if (rows.length) {
   const totalNotional = rows.reduce((sum, row) => sum + finiteNumber(row.position.notional, 0), 0);
   const totalPnl = rows.reduce((sum, row) => sum + finiteNumber(row.calc.netPnl, 0), 0);
   setText(el.holdingsAllocationSummary, `${rows.length.toLocaleString("ko-KR")}개 포지션 · ${formatSignedFuturesDisplayAmount(totalPnl)}`);
   el.holdingsAllocationBar.innerHTML = rows.map((row) => {
     const color = row.position.direction === "LONG" ? "var(--green)" : "var(--red)";
     const width = totalNotional > 0 ? (row.position.notional / totalNotional) * 100 : 100 / rows.length;
     return `<span class="allocation-segment" style="width: ${formatAllocationWidth(width)}%; background: ${color};"></span>`;
   }).join("");
   el.holdingsAllocationList.innerHTML = rows.map((row, index) => {
     const position = row.position;
     const directionLabel = position.direction === "LONG" ? "Long" : "Short";
     const color = position.direction === "LONG" ? "var(--green)" : "var(--red)";
     return `
       <span class="allocation-item">
         <i style="background: ${color};"></i>
         <b>${escapeHtml(futuresPositionSymbol(position))} #${index + 1}</b>
         <em>${escapeHtml(directionLabel)} ${formatNumber(position.leverage, 2)}x</em>
          <small data-futures-live-allocation="${escapeHtml(position.id)}">${formatFuturesDisplayAmount(position.margin)} · ${formatSignedPercent(row.calc.roePercent)}</small>
       </span>
     `;
   }).join("");
   return;
 }
 const position = state.futures.position;
 const calc = position ? calculateFuturesPosition(position, currentFuturesPrice()) : null;
 if (!position) {
   setText(el.holdingsAllocationSummary, "포지션 없음");
   el.holdingsAllocationBar.innerHTML = '<span class="allocation-empty">포지션 없음</span>';
   el.holdingsAllocationList.innerHTML = `<span class="allocation-muted">${escapeHtml(currentFuturesSymbol())} 선물 포지션이 없습니다.</span>`;
   return;
 }
 const directionLabel = position.direction === "LONG" ? "Long" : "Short";
 const color = position.direction === "LONG" ? "var(--green)" : "var(--red)";
 setText(el.holdingsAllocationSummary, `${directionLabel} ${formatNumber(position.leverage, 2)}x`);
 el.holdingsAllocationBar.innerHTML = `<span class="allocation-segment" style="width: 100%; background: ${color};"></span>`;
 el.holdingsAllocationList.innerHTML = `
   <span class="allocation-item">
     <i style="background: ${color};"></i>
     <b>${escapeHtml(futuresPositionSymbol(position))}</b>
     <em>${escapeHtml(directionLabel)}</em>
     <small>${formatFuturesDisplayAmount(position.notional)} · ${calc ? formatSignedPercent(calc.roePercent) : "-"}</small>
   </span>
 `;
}
function renderHoldingsAllocation() {
 const rows = getHoldingAllocationRows();
 if (!el.holdingsAllocationSummary || !el.holdingsAllocationBar || !el.holdingsAllocationList) {
   return;
 }
 if (!rows.length) {
   setText(el.holdingsAllocationSummary, "보유 없음");
   el.holdingsAllocationBar.innerHTML = '<span class="allocation-empty">보유 코인 없음</span>';
   el.holdingsAllocationList.innerHTML = '<span class="allocation-muted">매수한 코인이 없습니다.</span>';
   return;
 }
 const topRows = rows.slice(0, 2).map((row) => `${row.symbol} ${formatNumber(row.ratio, 1)}%`);
 setText(el.holdingsAllocationSummary, topRows.join(" · "));
 el.holdingsAllocationBar.innerHTML = rows.map((row) => `
   <span
     class="allocation-segment"
     style="width: ${formatAllocationWidth(row.ratio)}%; background: ${row.color};"
     title="${escapeHtml(row.symbol)} ${formatNumber(row.ratio, 1)}%"
   ></span>
 `).join("");
 el.holdingsAllocationList.innerHTML = rows.map((row) => `
   <span class="allocation-item">
     <i style="background: ${row.color};"></i>
     <b>${escapeHtml(row.symbol)}</b>
     <em>${formatNumber(row.ratio, 1)}%</em>
     <small>${formatKrw(row.value, 0)}</small>
   </span>
 `).join("");
}
function sharedKrwBalance() {
 return Math.max(
   0,
   finiteNumber(
     state.sharedAccount && state.sharedAccount.krwBalance,
     finiteNumber(state.portfolio && state.portfolio.krwBalance, 0)
   )
 );
}
function getTotalEvaluatedAsset() {
 const coinValue = getHoldingAllocationRows().reduce((sum, row) => sum + finiteNumber(row.value, 0), 0);
 return sharedKrwBalance() + coinValue;
}
function getHoldingAllocationRows() {
 const colors = ["#38bdf8", "#24d47b", "#f6c453", "#ff5c72"];
 const rows = Object.keys(MARKETS).map((marketCode, index) => {
   const market = MARKETS[marketCode];
   const portfolio = portfolioForMarket(marketCode);
   const openTrades = currentOpenBuyTrades(marketCode);
   const portfolioAmount = Math.max(0, finiteNumber(portfolio.btcBalance, 0));
   const tradeAmount = openTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.btcAmount, 0)), 0);
   const amount = portfolioAmount > 0 ? portfolioAmount : tradeAmount;
   if (amount <= 0) return null;
   const ticker = tickerForMarket(marketCode);
   const tradeCost = openTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.krwAmount, 0)), 0);
   const tradeBtc = openTrades.reduce((sum, trade) => sum + Math.max(0, finiteNumber(trade.btcAmount, 0)), 0);
   const tradeAvgPrice = tradeBtc > 0 ? tradeCost / tradeBtc : 0;
   const price = positiveNumber(ticker && ticker.price, positiveNumber(portfolio.avgBuyPrice, tradeAvgPrice));
   const value = amount * price;
   if (value <= 0) return null;
   return {
     marketCode,
     symbol: market.symbol,
     amount,
     price,
     value,
     color: colors[index % colors.length],
     ratio: 0
   };
 }).filter(Boolean);
 const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
 if (totalValue <= 0) {
   return [];
 }
 return rows
   .map((row) => ({ ...row, ratio: (row.value / totalValue) * 100 }))
   .sort((a, b) => b.value - a.value);
}
function formatAllocationWidth(ratio) {
 return Math.max(0, Math.min(100, ratio)).toFixed(4);
}
function renderDashboardMemos() {
 if (el.dashboardMemoTwo && el.dashboardMemoTwo.value !== state.dashboardMemos[1]) {
   el.dashboardMemoTwo.value = state.dashboardMemos[1];
 }
}
function currentFuturesLimitOrders() {
 const marketCode = currentFuturesMarket().code;
 return normalizeFuturesLimitOrders(state.futures.limitOrders)
   .filter((order) => order.market === marketCode)
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
function futuresEntryRuleState(direction, marketCode = currentFuturesMarket().code) {
 const requestedDirection = direction === "SHORT" ? "SHORT" : "LONG";
 const positions = getFuturesPositions().filter((position) => futuresPositionMarketCode(position) === marketCode);
 const pendingOrders = normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders)
   .filter((order) => order.market === marketCode);
 const positionDirections = new Set(positions.map((position) => position.direction));
 const pendingDirections = new Set(pendingOrders.map((order) => order.direction));
 const reservedDirections = new Set([...positionDirections, ...pendingDirections]);
 const productLabel = futuresProductLabel(marketCode);
 const directionLabel = (value) => value === "SHORT" ? "숏" : "롱";
 if (positions.length > FUTURES_MAX_POSITIONS_PER_MARKET || positionDirections.size > 1) {
   return {
     blocked: true,
     reason: `${productLabel}에 기존 롱·숏 포지션이 함께 있습니다. 한쪽 포지션을 전량 청산한 뒤 진입하세요.`
   };
 }
 if (reservedDirections.size > 1) {
   return {
     blocked: true,
     reason: `${productLabel}에 반대 방향 포지션 또는 예약 주문이 함께 있습니다. 반대 예약을 취소하거나 포지션을 청산하세요.`
   };
 }
 const lockedDirection = [...reservedDirections][0] || "";
 if (lockedDirection && lockedDirection !== requestedDirection) {
   const hasPosition = positionDirections.has(lockedDirection);
   return {
     blocked: true,
     reason: hasPosition
       ? `${productLabel} ${directionLabel(lockedDirection)} 격리 포지션을 보유 중입니다. 반대 방향은 전량 청산 후 진입하세요.`
       : `${productLabel} ${directionLabel(lockedDirection)} 예약 진입이 있습니다. 반대 방향 예약을 취소한 뒤 진입하세요.`
   };
 }
 return { blocked: false, lockedDirection };
}
function setFuturesEntryButtonAvailability(button, direction, busy, hasPrice) {
 if (!button) return;
 const rule = futuresEntryRuleState(direction);
 button.disabled = Boolean(busy || !hasPrice || rule.blocked);
 button.title = rule.blocked ? rule.reason : "";
}
function currentChartPositionFilterId() {
 const requestedId = String(state.chart.positionFilterId || "");
 if (!requestedId || !isFuturesMode()) return "";
 const positionExists = activeFuturesPositions()
   .some((position) => String(position.id) === requestedId);
 if (positionExists) return requestedId;
 state.chart.positionFilterId = "";
 return "";
}
function chartVisibleFuturesPositions() {
 const positions = activeFuturesPositions();
 const positionId = currentChartPositionFilterId();
 return positionId
   ? positions.filter((position) => String(position.id) === positionId)
   : positions;
}
function renderChartPositionFilter() {
 if (!el.chartPositionFilter || !el.chartPositionFilterButtons) return;
 const positions = isFuturesMode() ? activeFuturesPositions() : [];
 const selectedId = currentChartPositionFilterId();
 el.chartPositionFilter.hidden = !positions.length;
 if (!positions.length) {
   el.chartPositionFilterButtons.innerHTML = "";
   setText(el.chartPositionFilterStatus, "");
   return;
 }
 const allButton = `
   <button
     class="chart-position-filter-button${selectedId ? "" : " active"}"
     type="button"
     data-chart-position-filter=""
     aria-pressed="${selectedId ? "false" : "true"}"
   >전체</button>
 `;
 const exitOrders = currentFuturesExitOrders();
 const positionButtons = positions.map((position, index) => {
   const positionId = String(position.id);
   const active = selectedId === positionId;
   const sideClass = position.direction === "SHORT" ? "short" : "long";
   const directionLabel = position.direction === "SHORT" ? "숏" : "롱";
   const reservationCount = exitOrders
     .filter((order) => order.positionId === positionId).length;
   const reservationLabel = reservationCount
     ? `<span class="chart-position-filter-count">예약 ${reservationCount}</span>`
     : "";
   return `
     <button
       class="chart-position-filter-button ${sideClass}${active ? " active" : ""}"
       type="button"
       data-chart-position-filter="${escapeHtml(positionId)}"
       aria-pressed="${active ? "true" : "false"}"
       title="${index + 1}번 포지션의 진입과 예약 주문만 차트에 표시"
     >${index + 1} ${directionLabel} ${formatNumber(position.leverage, 2)}x${reservationLabel}</button>
   `;
 }).join("");
 el.chartPositionFilterButtons.innerHTML = `${allButton}${positionButtons}`;
 if (!el.chartPositionFilterStatus) return;
 if (!selectedId) {
   setText(el.chartPositionFilterStatus, "모든 포지션의 진입·예약 표시 중");
   return;
 }
 const selectedIndex = positions.findIndex((position) => String(position.id) === selectedId);
 const selectedPosition = positions[selectedIndex];
 const directionLabel = selectedPosition.direction === "SHORT" ? "숏" : "롱";
 setText(
   el.chartPositionFilterStatus,
   `${selectedIndex + 1}번 ${directionLabel} ${formatNumber(selectedPosition.leverage, 2)}x의 진입·예약만 표시 중`
 );
}
function setChartPositionFilter(positionId) {
 const requestedId = String(positionId || "");
 const positions = activeFuturesPositions();
 const selectedPosition = requestedId
   ? positions.find((position) => String(position.id) === requestedId)
   : null;
 const nextId = selectedPosition ? requestedId : "";
 if (state.chart.positionFilterId === nextId) return;
 state.chart.positionFilterId = nextId;
 renderChartPositionFilter();
 renderFuturesPositionPanel();
 renderFuturesOpenPositionsBlock();
 drawChart();
 showToast(
   selectedPosition
     ? "선택한 포지션의 진입과 예약 주문만 차트에 표시합니다."
     : "모든 포지션의 진입과 예약 주문을 차트에 표시합니다."
 );
}
function currentFuturesExitOrders() {
 const marketCode = currentFuturesMarket().code;
 const openPositionIds = new Set(getFuturesPositions().map((position) => String(position.id)));
 return normalizeFuturesExitOrders(state.futures.exitOrders)
   .filter((order) => order.market === marketCode && openPositionIds.has(order.positionId))
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
function currentFuturesCompletedOrderNotices() {
 const marketCode = currentFuturesMarket().code;
 return normalizeFuturesCompletedOrderNotices(state.futures.completedOrderNotices)
   .filter((notice) => notice.market === marketCode)
   .sort((a, b) => timestampMs(b.completedAt) - timestampMs(a.completedAt));
}
function futuresCompletedOrderNoticeTitle(notice) {
 if (notice.orderKind === "EXIT") return "예약 청산 완료";
 return notice.direction === "SHORT" ? "예약 숏 완료" : "예약 롱 완료";
}
function renderFuturesLimitOrders() {
 if (!el.futuresLimitOrdersList) return;
 let mode = state.chart.limitOrderMode;
 if (mode && futuresEntryRuleState(mode).blocked) {
   state.chart.limitOrderMode = null;
   mode = null;
 }
 const hasPrice = currentFuturesPrice() > 0;
 const busy = Boolean(state.futures.orderBusy || futuresOfflineReplayRunning);
 if (el.futuresLimitLongBtn) {
   el.futuresLimitLongBtn.classList.toggle("active", mode === "LONG");
   setFuturesEntryButtonAvailability(el.futuresLimitLongBtn, "LONG", busy, hasPrice);
 }
 if (el.futuresLimitShortBtn) {
   el.futuresLimitShortBtn.classList.toggle("active", mode === "SHORT");
   setFuturesEntryButtonAvailability(el.futuresLimitShortBtn, "SHORT", busy, hasPrice);
 }
 const orders = currentFuturesLimitOrders();
 const allCompletedNotices = currentFuturesCompletedOrderNotices();
 const openPositionIds = new Set(getFuturesPositions().map((position) => String(position.id)));
 const completedNotices = allCompletedNotices.filter((notice) => (
   notice.orderKind === "ENTRY" || !openPositionIds.has(String(notice.positionId))
 ));
 if (el.futuresLimitOrderHint) {
   const longRule = futuresEntryRuleState("LONG");
   const shortRule = futuresEntryRuleState("SHORT");
   const positionRuleHint = longRule.blocked && shortRule.blocked
     ? longRule.reason
     : shortRule.blocked
       ? "격리 롱 포지션 또는 예약 주문 유지 중 · 롱 추가 진입만 가능합니다."
       : longRule.blocked
         ? "격리 숏 포지션 또는 예약 주문 유지 중 · 숏 추가 진입만 가능합니다."
         : "";
   const hint = futuresOfflineReplayRunning
     ? "프로그램 종료 중 1분봉을 분석해 예약 주문을 계산하는 중입니다."
     : mode === "LONG"
     ? "차트에서 현재가보다 낮은 예약 매수 가격을 클릭하세요."
     : mode === "SHORT"
       ? "차트에서 현재가보다 높은 예약 매도 가격을 클릭하세요."
       : positionRuleHint
         ? positionRuleHint
       : orders.length
         ? `지정가 예약 ${orders.length.toLocaleString("ko-KR")}건 · 완료 알림 ${allCompletedNotices.length.toLocaleString("ko-KR")}건 · 예약금 ${formatFuturesDisplayAmount(futuresReservedLimitOrderBalance())} 보호 중`
         : allCompletedNotices.length
           ? `예약 체결 완료 ${allCompletedNotices.length.toLocaleString("ko-KR")}건 · 확인 전까지 차트에 표시됩니다.`
           : "버튼을 누른 뒤 차트에서 지정가를 클릭하세요.";
   setText(el.futuresLimitOrderHint, hint);
 }
 const activeRows = orders.map((order) => {
   const isLong = order.direction === "LONG";
   return `
     <div class="futures-limit-order-row ${isLong ? "long" : "short"}">
       <div>
         <strong>${isLong ? "예약 매수(롱)" : "예약 매도(숏)"} · ${formatFuturesDisplayPrice(order.price, order.market)}</strong>
        <small>${formatNumber(order.leverage, 2)}x · ${order.inputMode === "BTC" ? `${formatFuturesQuantity(order.quantity, order.symbol)} · ` : ""}증거금 ${formatFuturesDisplayAmount(order.margin)}</small>
       </div>
       <button class="futures-limit-order-cancel" type="button" data-cancel-futures-limit-order="${escapeHtml(order.id)}"${busy ? " disabled" : ""}>취소</button>
     </div>
   `;
 }).join("");
 const completedRows = completedNotices.map((notice) => {
   const isExit = notice.orderKind === "EXIT";
   const sideClass = isExit ? "exit" : notice.direction === "SHORT" ? "short" : "long";
   const amountLabel = notice.closeAmountUnits === null ? "전액" : `${trimNumber(notice.closeAmountUnits, 2)} USDT`;
     const quantityLabel = notice.inputMode === "BTC" && notice.closeQuantity ? formatFuturesQuantity(notice.closeQuantity, notice.symbol) : amountLabel;
     const detail = isExit
      ? `${notice.direction === "SHORT" ? "숏" : "롱"} 포지션 · ${quantityLabel} · 완료 ${formatDateTime(notice.completedAt)}`
      : `${formatNumber(notice.leverage, 2)}x · 증거금 ${formatFuturesDisplayAmount(notice.margin)} · 완료 ${formatDateTime(notice.completedAt)}`;
   return `
     <div class="futures-limit-order-row completed ${sideClass}">
       <div>
         <strong>${escapeHtml(futuresCompletedOrderNoticeTitle(notice))} · ${formatFuturesDisplayPrice(notice.price, notice.market)}</strong>
         <small>${escapeHtml(detail)}</small>
       </div>
       <button class="futures-completed-order-confirm" type="button" data-confirm-futures-completed-order="${escapeHtml(notice.id)}"${busy ? " disabled" : ""}>확인</button>
     </div>
   `;
 }).join("");
 el.futuresLimitOrdersList.innerHTML = `${activeRows}${completedRows}`;
}
function updateDashboardMemo(index, value) {
 state.dashboardMemos[index] = String(value || "").slice(0, 240);
 saveDashboardMemos();
}
function renderTradeButtons() {
 if (isFuturesMode()) {
   const hasPrice = currentFuturesPrice() > 0;
   const busy = Boolean(state.futures.orderBusy || futuresOfflineReplayRunning);
   setFuturesEntryButtonAvailability(el.futuresLongBtn, "LONG", busy, hasPrice);
   setFuturesEntryButtonAvailability(el.futuresShortBtn, "SHORT", busy, hasPrice);
   el.futuresLeverageButtons.forEach((button) => {
     const active = Number(button.dataset.futuresLeverage) === state.futures.leverage;
     button.classList.toggle("active", active);
   });
  setText(el.futuresSelectedLeverage, `${formatNumber(state.futures.leverage, 2)}x`);
   renderFuturesLimitOrders();
   renderFuturesPositionPanel();
   return;
 }
 const hasPrice = Boolean(state.ticker && state.ticker.price > 0);
 el.buySubmitBtn.disabled = !hasPrice;
 el.sellSubmitBtn.disabled = !hasPrice || state.portfolio.btcBalance <= 0;
}
function renderTradeHistory() {
 renderHistoryViewControls();
 renderHistoryHeaders();
 renderFuturesOpenPositionsBlock();
 if (isFuturesMode()) {
   renderFuturesTradeHistory();
   return;
 }
 setText(
   el.historyStatus,
   `통합 기록 ${state.trades.length.toLocaleString("ko-KR")}건 · 일별 요약 ${state.dailySummaries.length.toLocaleString("ko-KR")}개`
 );
 if (!state.trades.length && !state.dailySummaries.length) {
   el.tradeTableBody.innerHTML = '<tr><td colspan="13" class="empty-row">매매기록이 없습니다.</td></tr>';
   return;
 }
 const openBuyTradeIdsMap = currentHoldingRateTradeIdsByMarket();
 const tradeRows = [...state.trades]
   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .map((trade) => renderTradeRow(trade, { editableMemo: true, openBuyTradeIdsMap }))
   .join("");
 const summaryRows = [...state.dailySummaries]
   .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
   .map((summary) => {
     const details = state.expandedDailySummaryDate === summary.dateKey ? renderDailySummaryDetailsRow(summary) : "";
     return `${renderDailySummaryRow(summary)}${details}`;
   })
   .join("");
 el.tradeTableBody.innerHTML = `${tradeRows}${summaryRows}`;
}
function renderHistoryViewControls() {
 const visible = isFuturesMode();
 const dailyView = visible && state.futuresHistoryView === "daily";
 const graphView = visible && state.futuresHistoryView === "graph";
 if (el.historyViewSwitcher) el.historyViewSwitcher.hidden = !visible;
 if (el.historyTableWrap) el.historyTableWrap.classList.toggle("history-view-daily", dailyView);
 if (el.historyTableWrap) el.historyTableWrap.hidden = graphView;
 if (el.historyGraphPanel) el.historyGraphPanel.hidden = !graphView;
 if (el.historyTableHead) el.historyTableHead.hidden = dailyView || graphView;
 (el.historyViewButtons || []).forEach((button) => {
   const active = visible && button.dataset.historyView === state.futuresHistoryView;
   button.classList.toggle("active", active);
   button.setAttribute("aria-pressed", active ? "true" : "false");
 });
}
function setFuturesHistoryView(view) {
 const nextView = view === "daily" || view === "graph" ? view : "position";
 if (state.futuresHistoryView === nextView) return;
 state.futuresHistoryView = nextView;
 state.expandedDailySummaryDate = null;
 state.expandedFuturesHistoryWeek = null;
 state.expandedFuturesHistoryDate = null;
 renderTradeHistory();
}
function renderHistoryHeaders() {
 const headers = isFuturesMode()
    ? {
      time: "보유 기간",
     coin: "상품",
     side: "방향",
     price: "평균 진입가",
     amount: "종료가",
     value: "레버리지",
     fee: "수수료",
     pnl: "순손익",
     rate: "ROE",
     avg: "사용 금액",
     holding: "청산가",
     balance: "매매 메모",
     memo: ""
   }
   : {
     time: "시간",
     coin: "코인",
     side: "구분",
     price: "가격",
     amount: "수량",
     value: "거래금액",
     fee: "수수료",
     pnl: "실현손익",
     rate: "수익률",
     avg: "평균단가",
     holding: "보유 변동률",
     balance: "거래 후 잔고",
     memo: "메모"
   };
 setText(el.historyTimeHeader, headers.time);
 setText(el.historyCoinHeader, headers.coin);
 setText(el.historySideHeader, headers.side);
 setText(el.historyPriceHeader, headers.price);
 setText(el.historyAmountHeader, headers.amount);
 setText(el.historyValueHeader, headers.value);
 setText(el.historyFeeHeader, headers.fee);
 setText(el.historyPnlHeader, headers.pnl);
 setText(el.historyRateHeader, headers.rate);
 setText(el.historyAvgHeader, headers.avg);
 setText(el.historyHoldingRateHeader, headers.holding);
 setText(el.historyBalanceHeader, headers.balance);
 setText(el.historyMemoHeader, headers.memo);
 if (el.historyMemoHeader) el.historyMemoHeader.hidden = isFuturesMode();
}
function renderFuturesOpenPositionCard(position, index, options = {}) {
 const currentPrice = currentFuturesPriceForPosition(position);
 const calc = calculateFuturesPosition(position, currentPrice);
 const effectiveEntryPrice = futuresEffectiveEntryPrice(position);
 const directionLabel = position.direction === "LONG" ? "Long" : "Short";
 const sideClass = position.direction === "LONG" ? "long" : "short";
 const showCloseButton = options.closeButton !== false;
 const productLabel = futuresPositionProductLabel(position);
 const symbol = futuresPositionSymbol(position);
 const maxPartialCloseUnits = Math.max(0, futuresPartialCloseAmountUnits(position) - 0.01);
 const maxPartialCloseValue = trimNumber(maxPartialCloseUnits, 8);
 const maxPartialCloseLabel = formatNumber(maxPartialCloseUnits, 2);
 const entryLegs = futuresEntryLegs(position);
 const entryCount = Math.max(1, entryLegs.length);
 const exitOrders = currentFuturesExitOrders().filter((order) => order.positionId === String(position.id));
 const chartFilterActive = currentChartPositionFilterId() === String(position.id);
 const exitOrderModeActive = state.chart.exitOrderPositionId === String(position.id);
 const exitOrderBusy = Boolean(state.futures.orderBusy || futuresOfflineReplayRunning);
 const availableExitOrderUnits = futuresAvailableExitOrderAmountUnits(position);
 const availableExitOrderValue = trimNumber(availableExitOrderUnits, 8);
 const availableExitOrderLabel = formatNumber(availableExitOrderUnits, 2);
  const exitOrderDraftValue = exitOrderModeActive
    ? trimNumber(state.chart.exitOrderAmountUnits, 8)
    : "";
  const positionQuantity = futuresPositionQuantity(position);
  const positionAmountUnits = futuresPartialCloseAmountUnits(position);
  const exitOrderEstimate = exitOrders.reduce((summary, order) => {
    const amountUnits = futuresExitOrderAmountUnits(order);
    const closeRatio = clamp(
      order.inputMode === "BTC" && order.closeQuantity && positionQuantity > 0
        ? order.closeQuantity / positionQuantity
        : positionAmountUnits > 0
          ? (amountUnits === null ? positionAmountUnits : amountUnits) / positionAmountUnits
          : 0,
      0,
      1
    );
    const orderCalc = calculateFuturesPosition(position, order.price);
    summary.margin += position.margin * closeRatio;
    summary.netPnl += orderCalc.netPnl * closeRatio;
    return summary;
  }, { margin: 0, netPnl: 0 });
  const exitOrderEstimateRoe = exitOrderEstimate.margin > 0
    ? (exitOrderEstimate.netPnl / exitOrderEstimate.margin) * 100
    : 0;
  const exitOrderStatuses = exitOrders.map((order) => {
    const amountUnits = futuresExitOrderAmountUnits(order);
    const amountLabel = order.inputMode === "BTC" && order.closeQuantity ? formatFuturesQuantity(order.closeQuantity, order.symbol) : amountUnits === null ? "전액" : `${trimNumber(amountUnits, 2)} USDT`;
    return `
      <div class="futures-exit-order-status">
        <span>예약 청산 <b>${formatFuturesDisplayPrice(order.price, order.market)}</b> · ${amountLabel} · ${order.triggerSide === "ABOVE" ? "상승 도달" : "하락 도달"}</span>
        <button type="button" data-cancel-futures-exit-order="${escapeHtml(order.id)}"${exitOrderBusy ? " disabled" : ""}>예약 취소</button>
      </div>
    `;
  }).join("");
  const exitOrderEstimateStatus = exitOrders.length
    ? `
      <div class="futures-exit-order-summary">
        <span>모든 예약 청산 완료 시 · 예상 수익률 <b class="${signClass(exitOrderEstimateRoe)}">${formatSignedPercent(exitOrderEstimateRoe)}</b> · 예상 수익 <b class="${signClass(exitOrderEstimate.netPnl)}">${formatSignedFuturesDisplayAmount(exitOrderEstimate.netPnl)}</b></span>
      </div>
    `
    : "";
 const completedExitStatuses = currentFuturesCompletedOrderNotices()
   .filter((notice) => notice.orderKind === "EXIT" && notice.positionId === String(position.id))
   .map((notice) => {
     const amountLabel = notice.inputMode === "BTC" && notice.closeQuantity ? formatFuturesQuantity(notice.closeQuantity, notice.symbol) : notice.closeAmountUnits === null ? "전액" : `${trimNumber(notice.closeAmountUnits, 2)} USDT`;
     return `
       <div class="futures-exit-order-status completed">
         <span>예약 청산 완료 <b>${formatFuturesDisplayPrice(notice.price, notice.market)}</b> · ${amountLabel} · 완료 ${escapeHtml(formatDateTime(notice.completedAt))}</span>
         <button type="button" data-confirm-futures-completed-order="${escapeHtml(notice.id)}"${exitOrderBusy ? " disabled" : ""}>확인</button>
       </div>
   `;
 }).join("");
 return `
     <article class="futures-open-position-card ${sideClass}${chartFilterActive ? " chart-filter-active" : ""}" data-futures-position-card="${escapeHtml(position.id)}">
      <div class="futures-open-position-title">
        <strong>${escapeHtml(productLabel)} #${index + 1} ${directionLabel} ${formatNumber(position.leverage, 2)}x${entryCount > 1 ? ` · ${entryCount}회 진입` : ""}</strong>
        <div class="futures-open-position-title-actions">
          <button
            class="futures-position-chart-filter${chartFilterActive ? " active" : ""}"
            type="button"
            data-position-chart-filter="${escapeHtml(position.id)}"
            aria-pressed="${chartFilterActive ? "true" : "false"}"
          >${chartFilterActive ? "전체 차트 보기" : "차트만 보기"}</button>
          <span>${escapeHtml(formatDateTime(position.openedAt))}</span>
        </div>
      </div>
     <div class="futures-open-position-grid">
       <span>평균 진입가 <b>${formatFuturesDisplayPrice(effectiveEntryPrice, futuresPositionMarketCode(position))}</b></span>
        <span>현재가 <b data-futures-live-current-price>${currentPrice ? formatFuturesDisplayPrice(currentPrice, futuresPositionMarketCode(position)) : "-"}</b></span>
        <span>사용 금액 <b>${formatFuturesDisplayAmount(position.margin)}</b></span>
        <span>명목가 <b>${formatFuturesDisplayAmount(position.notional)}</b></span>
        <span>보유 수량 <b>${formatFuturesQuantity(position.quantity, symbol)}</b></span>
        <span>청산가 <b>${formatFuturesDisplayPrice(calc.liquidationPrice, futuresPositionMarketCode(position))}</b></span>
        <span>ROE <b class="${signClass(calc.roePercent)}" data-futures-live-roe>${formatSignedPercent(calc.roePercent)}</b></span>
        <span>미실현 <b class="${signClass(calc.netPnl)}" data-futures-live-pnl>${formatSignedFuturesDisplayAmount(calc.netPnl)}</b></span>
      </div>
      ${exitOrderStatuses}${completedExitStatuses}${exitOrderEstimateStatus}
     ${showCloseButton ? `
       <label class="futures-position-memo-control">
         <span>매매 이유 메모</span>
        <textarea class="memo-input" data-futures-position-memo-id="${escapeHtml(position.id)}" maxlength="160" rows="2" placeholder="이 포지션의 매매 이유를 입력하세요">${escapeHtml(position.memo || "")}</textarea>
       </label>
       <div class="futures-position-actions">
         <div class="futures-close-inputs" aria-label="부분 청산 금액 입력">
           <label class="partial-close-control">
             <span>부분 청산 금액</span>
             <input type="number" min="0.01" max="${maxPartialCloseValue}" step="0.01" placeholder="예: 10" data-partial-close-amount="${escapeHtml(position.id)}" aria-label="${escapeHtml(symbol)} 부분 청산 금액(USDT)" />
             <b>USDT / 부분 최대 ${maxPartialCloseLabel}</b>
           </label>
         </div>
         <button class="ghost-button partial-close-btn" type="button" data-partial-close-futures-position="${escapeHtml(position.id)}">부분 청산</button>
         <div class="futures-close-inputs" aria-label="예약 청산 금액 입력">
           <label class="partial-close-control futures-exit-order-amount-control">
             <span>예약 청산 금액</span>
             <input type="number" min="0.01" max="${availableExitOrderValue}" step="0.01" value="${exitOrderDraftValue}" placeholder="예: 10" data-futures-exit-order-amount="${escapeHtml(position.id)}" aria-label="${escapeHtml(symbol)} 예약 청산 금액(USDT)"${exitOrderBusy || exitOrderModeActive || availableExitOrderUnits <= 0 ? " disabled" : ""} />
             <b>USDT / 추가 ${availableExitOrderLabel}</b>
           </label>
         </div>
        <button class="ghost-button futures-exit-order-btn${exitOrderModeActive ? " active" : ""}" type="button" data-futures-exit-order-position="${escapeHtml(position.id)}"${exitOrderBusy || (!exitOrderModeActive && availableExitOrderUnits <= 0) ? " disabled" : ""}>${exitOrderModeActive ? "가격 선택 취소" : "예약 청산 추가"}</button>
        <button class="ghost-button futures-position-close-btn" type="button" data-close-futures-position="${escapeHtml(position.id)}">전체 청산</button>
       </div>
     ` : ""}
   </article>
 `;
}
function renderFuturesOpenPositionsBlock() {
 if (!el.futuresOpenPositionsBlock || !el.futuresOpenPositionsList) return;
 if (!isFuturesMode()) {
   el.futuresOpenPositionsBlock.hidden = true;
   el.futuresOpenPositionsList.innerHTML = "";
   return;
 }
 const positions = getFuturesPositions();
 const rows = positions.map((position) => ({
   position,
   calc: calculateFuturesPosition(position, currentFuturesPriceForPosition(position))
 }));
 const totalPnl = rows.reduce((sum, row) => sum + row.calc.netPnl, 0);
 const totalMargin = rows.reduce((sum, row) => sum + finiteNumber(row.position.margin, 0), 0);
 el.futuresOpenPositionsBlock.hidden = false;
 const summary = el.futuresOpenPositionsBlock.querySelector("[data-open-position-summary]");
 if (summary) {
   setText(
     summary,
     positions.length
       ? `${positions.length.toLocaleString("ko-KR")}개 보유 · 미실현 ${formatSignedFuturesDisplayAmount(totalPnl)} · ROE ${totalMargin ? formatSignedPercent((totalPnl / totalMargin) * 100) : "-"}`
       : "현재 보유 중인 선물 포지션이 없습니다."
   );
 }
 el.futuresOpenPositionsList.innerHTML = positions.length
   ? positions.map((position, index) => renderFuturesOpenPositionCard(position, index)).join("")
   : '<p class="muted-line">현재 보유 중인 선물 포지션이 없습니다.</p>';
}
function updateFuturesLivePositionDisplays() {
 if (!isFuturesMode()) return;
 const positions = getFuturesPositions();
 const rows = positions.map((position) => {
   const currentPrice = currentFuturesPriceForPosition(position);
   return {
     position,
     currentPrice,
     calc: calculateFuturesPosition(position, currentPrice)
   };
 });
 const rowsById = new Map(rows.map((row) => [row.position.id, row]));
 document.querySelectorAll("[data-futures-position-card]").forEach((card) => {
   const row = rowsById.get(card.dataset.futuresPositionCard);
   if (!row) return;
   const marketCode = futuresPositionMarketCode(row.position);
   setText(
     card.querySelector("[data-futures-live-current-price]"),
     row.currentPrice ? formatFuturesDisplayPrice(row.currentPrice, marketCode) : "-"
   );
   setSignedText(
     card.querySelector("[data-futures-live-roe]"),
     row.calc.roePercent,
     formatSignedPercent(row.calc.roePercent)
   );
   setSignedText(
     card.querySelector("[data-futures-live-pnl]"),
     row.calc.netPnl,
     formatSignedFuturesDisplayAmount(row.calc.netPnl)
   );
 });
 document.querySelectorAll("[data-futures-live-allocation]").forEach((node) => {
   const row = rowsById.get(node.dataset.futuresLiveAllocation);
   if (!row) return;
   setText(node, `${formatFuturesDisplayAmount(row.position.margin)} · ${formatSignedPercent(row.calc.roePercent)}`);
 });
 document.querySelectorAll("[data-futures-ongoing-pnl]").forEach((node) => {
   const row = rowsById.get(node.dataset.futuresOngoingPnl);
   if (!row) return;
   setSignedText(node, row.calc.netPnl, formatSignedFuturesDisplayAmount(row.calc.netPnl));
 });
 const totalPnl = rows.reduce((sum, row) => sum + row.calc.netPnl, 0);
 const totalMargin = rows.reduce((sum, row) => sum + finiteNumber(row.position.margin, 0), 0);
 const totalAsset = state.futures.account.usdtBalance + rows.reduce((sum, row) => {
   return sum + row.position.margin + row.calc.grossPnl - row.calc.exitFee;
 }, 0);
 const totalRoe = totalMargin ? (totalPnl / totalMargin) * 100 : 0;
 document.querySelectorAll("[data-futures-live-total-pnl]").forEach((node) => {
   setSignedText(node, totalPnl, formatSignedFuturesDisplayAmount(totalPnl));
 });
 document.querySelectorAll("[data-futures-live-total-roe]").forEach((node) => {
   setSignedText(node, totalRoe, totalMargin ? formatSignedPercent(totalRoe) : "-");
 });
 document.querySelectorAll("[data-futures-live-total-asset]").forEach((node) => {
   setText(node, formatFuturesDisplayAmount(totalAsset));
 });
 const summary = el.futuresOpenPositionsBlock
   ? el.futuresOpenPositionsBlock.querySelector("[data-open-position-summary]")
   : null;
 if (summary) {
   setText(
     summary,
     positions.length
       ? `${positions.length.toLocaleString("ko-KR")}개 보유 · 미실현 ${formatSignedFuturesDisplayAmount(totalPnl)} · ROE ${totalMargin ? formatSignedPercent(totalRoe) : "-"}`
       : "현재 보유 중인 선물 포지션이 없습니다."
   );
 }
 if (positions.length) {
   setText(el.holdingsAllocationSummary, `${positions.length.toLocaleString("ko-KR")}개 포지션 · ${formatSignedFuturesDisplayAmount(totalPnl)}`);
 }
 setText(el.statTotalAsset, formatFuturesDisplayAmount(totalAsset));
 setSignedText(el.statUnrealized, totalPnl, formatSignedFuturesDisplayAmount(totalPnl));
 setSignedText(el.statUnrealizedRate, totalRoe, totalMargin ? formatSignedPercent(totalRoe) : "-");
 const hasPrice = currentFuturesPrice() > 0;
 const busy = Boolean(state.futures.orderBusy);
 setFuturesEntryButtonAvailability(el.futuresLongBtn, "LONG", busy, hasPrice);
 setFuturesEntryButtonAvailability(el.futuresShortBtn, "SHORT", busy, hasPrice);
}
function flushFuturesLiveUiUpdate() {
 futuresLiveFrame = null;
 if (!isFuturesMode()) return;
 renderTicker();
 syncFuturesEntryQuantityFromMargin();
 updateFuturesLivePositionDisplays();
 drawChart();
}
function scheduleFuturesLiveUiUpdate() {
 if (futuresLiveFrame !== null) return;
 if (typeof requestAnimationFrame !== "function") {
   flushFuturesLiveUiUpdate();
   return;
 }
 futuresLiveFrame = requestAnimationFrame(flushFuturesLiveUiUpdate);
}
function futuresSeedGraphWidth() {
 return clamp(finiteNumber(state.futuresSeedGraphWidth, 1), 1, 4);
}
function renderFuturesSeedGraphWidthControls() {
 const width = futuresSeedGraphWidth();
 setText(el.historyGraphWidthLabel, `${Math.round(width * 100)}%`);
 if (el.historyGraphWidthDecreaseBtn) el.historyGraphWidthDecreaseBtn.disabled = width <= 1;
 if (el.historyGraphWidthIncreaseBtn) el.historyGraphWidthIncreaseBtn.disabled = width >= 4;
 if (el.historyGraphWidthResetBtn) el.historyGraphWidthResetBtn.disabled = width === 1;
}
function changeFuturesSeedGraphWidth(delta, options = {}) {
 const graphChart = el.historyGraphChart;
 const currentWidth = futuresSeedGraphWidth();
 const nextWidth = clamp(currentWidth + finiteNumber(delta, 0), 1, 4);
 if (nextWidth === currentWidth) return false;
 const previousMaxScroll = graphChart ? Math.max(0, graphChart.scrollWidth - graphChart.clientWidth) : 0;
 const previousScrollRatio = previousMaxScroll > 0 ? graphChart.scrollLeft / previousMaxScroll : 0;
 const chartRect = graphChart ? graphChart.getBoundingClientRect() : null;
 const hasPointerAnchor = chartRect && Number.isFinite(options.anchorClientX);
 const anchorViewportX = hasPointerAnchor
   ? clamp(options.anchorClientX - chartRect.left, 0, graphChart.clientWidth)
   : 0;
 const anchorContentRatio = hasPointerAnchor && graphChart.scrollWidth > 0
   ? (graphChart.scrollLeft + anchorViewportX) / graphChart.scrollWidth
   : 0;
 state.futuresSeedGraphWidth = nextWidth;
 renderTradeHistory();
 const restoreScroll = () => {
   if (!el.historyGraphChart) return;
   const nextMaxScroll = Math.max(0, el.historyGraphChart.scrollWidth - el.historyGraphChart.clientWidth);
   el.historyGraphChart.scrollLeft = hasPointerAnchor
     ? clamp((anchorContentRatio * el.historyGraphChart.scrollWidth) - anchorViewportX, 0, nextMaxScroll)
     : nextMaxScroll * previousScrollRatio;
 };
 if (typeof requestAnimationFrame === "function") requestAnimationFrame(restoreScroll);
 else restoreScroll();
 return true;
}
function handleFuturesSeedGraphWheel(event) {
 if (state.futuresHistoryView !== "graph" || !event || !Number.isFinite(event.deltaY) || event.deltaY === 0) return;
 const zoomDelta = event.deltaY < 0 ? 0.25 : -0.25;
 const nextWidth = clamp(futuresSeedGraphWidth() + zoomDelta, 1, 4);
 if (nextWidth === futuresSeedGraphWidth()) return;
 event.preventDefault();
 const now = Date.now();
 if (now - finiteNumber(state.futuresSeedGraphLastWheelAt, 0) < 70) return;
 state.futuresSeedGraphLastWheelAt = now;
 changeFuturesSeedGraphWidth(zoomDelta, { anchorClientX: event.clientX });
}
function resetFuturesSeedGraphWidth() {
 if (futuresSeedGraphWidth() === 1) return;
 state.futuresSeedGraphWidth = 1;
 renderTradeHistory();
 if (el.historyGraphChart) el.historyGraphChart.scrollLeft = 0;
}
function formatFuturesSeedGraphTick(value) {
 const number = finiteNumber(value, 0);
 if (!isFuturesKrwDisplay()) return formatNumber(Math.round(number), 0);
 const absolute = Math.abs(number);
 if (absolute >= 10000) return formatNumber(number, 0);
 return formatKrw(Math.round(number), 0);
}
function formatFuturesSeedGraphTime(timestamp) {
 const parts = getKstDateParts(new Date(timestamp));
 return `${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
function renderFuturesSeedHistoryGraph(positionBlocks) {
 if (!el.historyGraphSummary || !el.historyGraphChart) return;
 renderFuturesSeedGraphWidthControls();
 const blocks = (Array.isArray(positionBlocks) ? positionBlocks : [])
   .filter((block) => futuresTradeExitTimestamp(block) > 0)
   .sort((a, b) => futuresTradeExitTimestamp(a) - futuresTradeExitTimestamp(b));
 const startingSeed = positiveNumber(
   state.futures && state.futures.account && state.futures.account.initialUsdt,
   positiveNumber(blocks[0] && blocks[0].seedBeforeTrade, DEFAULT_FUTURES_USDT)
 );
 if (!blocks.length) {
   setText(el.historyStatus, "그래프 · 완료 포지션 0개");
   el.historyGraphSummary.innerHTML = "";
   if (el.historyGraphYAxis) el.historyGraphYAxis.innerHTML = "";
   if (el.historyGraphXAxisLabel) el.historyGraphXAxisLabel.hidden = true;
   el.historyGraphChart.innerHTML = `
     <div class="history-graph-empty">
       전량 청산까지 완료된 포지션이 생기면<br />
       시간 순서에 따른 시드 변동 그래프가 표시됩니다.
     </div>
   `;
   return;
 }
 let runningSeed = startingSeed;
 const firstEntryTimestamp = blocks.reduce((earliest, block) => {
   const timestamp = futuresTradeEntryTimestamp(block);
   return timestamp > 0 ? Math.min(earliest, timestamp) : earliest;
 }, Number.POSITIVE_INFINITY);
 const firstExitTimestamp = futuresTradeExitTimestamp(blocks[0]);
 const points = [{
   timestamp: Number.isFinite(firstEntryTimestamp) ? firstEntryTimestamp : Math.max(0, firstExitTimestamp - 60000),
   seed: startingSeed,
   delta: 0,
   block: null
 }];
 blocks.forEach((block) => {
   const delta = finiteNumber(block.netPnl, finiteNumber(block.realizedPnl, 0));
   runningSeed = Math.max(0, runningSeed + delta);
   points.push({
     timestamp: futuresTradeExitTimestamp(block),
     seed: runningSeed,
     delta,
     block
   });
 });
 let peak = startingSeed;
 let maxDrawdownRate = 0;
 points.forEach((point) => {
   peak = Math.max(peak, point.seed);
   if (peak > 0) maxDrawdownRate = Math.min(maxDrawdownRate, ((point.seed - peak) / peak) * 100);
 });
 const totalPnl = runningSeed - startingSeed;
 const totalReturnRate = startingSeed > 0 ? (totalPnl / startingSeed) * 100 : 0;
 const isWinningBlock = (block) => finiteNumber(block.netPnl, finiteNumber(block.realizedPnl, 0)) > 0;
 const longBlocks = blocks.filter((block) => String(block.direction || block.side || "").toUpperCase().includes("LONG"));
 const shortBlocks = blocks.filter((block) => String(block.direction || block.side || "").toUpperCase().includes("SHORT"));
 const winCount = blocks.filter(isWinningBlock).length;
 const longWinCount = longBlocks.filter(isWinningBlock).length;
 const shortWinCount = shortBlocks.filter(isWinningBlock).length;
 const overallWinRate = blocks.length ? (winCount / blocks.length) * 100 : 0;
 const longWinRate = longBlocks.length ? (longWinCount / longBlocks.length) * 100 : null;
 const shortWinRate = shortBlocks.length ? (shortWinCount / shortBlocks.length) * 100 : null;
 const returnClass = totalPnl > 0 ? "is-up" : totalPnl < 0 ? "is-down" : "";
 const currencyLabel = isFuturesKrwDisplay() ? "KRW" : "USDT";
 setText(
   el.historyStatus,
   `그래프 · 완료 포지션 ${blocks.length.toLocaleString("ko-KR")}개`
    + ` · 시작 ${formatFuturesDisplayAmount(startingSeed)}`
    + ` · 현재 ${formatFuturesDisplayAmount(runningSeed)}`
    + ` · 누적 ${formatSignedFuturesDisplayAmount(totalPnl)}`
 );
 el.historyGraphSummary.innerHTML = `
   <div class="history-graph-stat">
     <span>현재 시드</span>
     <strong>${escapeHtml(formatFuturesDisplayAmount(runningSeed))}</strong>
     <small>시작 ${escapeHtml(formatFuturesDisplayAmount(startingSeed))}</small>
   </div>
   <div class="history-graph-stat ${returnClass}">
     <span>현재 시드 수익률</span>
     <strong>${escapeHtml(formatSignedPercent(totalReturnRate))}</strong>
     <small>누적 손익 ${escapeHtml(formatSignedFuturesDisplayAmount(totalPnl))}</small>
   </div>
   <div class="history-graph-stat">
     <span>롱 매매</span>
     <strong>${longBlocks.length.toLocaleString("ko-KR")}회</strong>
     <small>${longWinCount.toLocaleString("ko-KR")}승 · 승률 ${longWinRate === null ? "-" : `${formatNumber(longWinRate, 1)}%`}</small>
   </div>
   <div class="history-graph-stat">
     <span>숏 매매</span>
     <strong>${shortBlocks.length.toLocaleString("ko-KR")}회</strong>
     <small>${shortWinCount.toLocaleString("ko-KR")}승 · 승률 ${shortWinRate === null ? "-" : `${formatNumber(shortWinRate, 1)}%`}</small>
   </div>
   <div class="history-graph-stat${winCount ? " is-up" : ""}">
     <span>전체 승률</span>
     <strong>${formatNumber(overallWinRate, 1)}%</strong>
     <small>${winCount.toLocaleString("ko-KR")}승 / 완료 ${blocks.length.toLocaleString("ko-KR")}회</small>
   </div>
   <div class="history-graph-stat${maxDrawdownRate < 0 ? " is-down" : ""}">
     <span>최대 낙폭</span>
     <strong>${escapeHtml(formatSignedPercent(maxDrawdownRate))}</strong>
     <small>완료 포지션 고점 대비</small>
   </div>
 `;
 const graphWidthScale = futuresSeedGraphWidth();
 const width = 1000 * graphWidthScale;
 const height = 440;
 const margin = { top: 34, right: 42, bottom: 76, left: 116 };
 const plotWidth = width - margin.left - margin.right;
 const plotHeight = height - margin.top - margin.bottom;
 const displayValues = points.map((point) => (
   isFuturesKrwDisplay() ? futuresUsdtToKrw(point.seed) : point.seed
 ));
 const rawMinValue = Math.min(...displayValues);
 const rawMaxValue = Math.max(...displayValues);
 const rawRange = rawMaxValue - rawMinValue;
 const valuePadding = rawRange > 0
   ? rawRange * 0.14
   : Math.max(Math.abs(rawMaxValue) * 0.015, isFuturesKrwDisplay() ? 10000 : 1);
 const minValue = Math.max(0, rawMinValue - valuePadding);
 const maxValue = rawMaxValue + valuePadding;
 const valueRange = Math.max(1e-9, maxValue - minValue);
 let minTime = Math.min(...points.map((point) => point.timestamp));
 let maxTime = Math.max(...points.map((point) => point.timestamp));
 if (minTime === maxTime) {
   minTime -= 30 * 60 * 1000;
   maxTime += 30 * 60 * 1000;
 }
 const timeRange = Math.max(1, maxTime - minTime);
 const xForTimestamp = (timestamp) => margin.left + ((timestamp - minTime) / timeRange) * plotWidth;
 const yForDisplayValue = (value) => margin.top + ((maxValue - value) / valueRange) * plotHeight;
 const graphPoints = points.map((point, index) => ({
   ...point,
   x: xForTimestamp(point.timestamp),
   y: yForDisplayValue(displayValues[index]),
   displayValue: displayValues[index]
 }));
 const linePath = graphPoints.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
 const areaPath = `${linePath} L ${graphPoints[graphPoints.length - 1].x.toFixed(2)} ${(margin.top + plotHeight).toFixed(2)}`
   + ` L ${graphPoints[0].x.toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} Z`;
 const yTickCount = 5;
 const yTicks = Array.from({ length: yTickCount }, (_, index) => {
   const ratio = index / (yTickCount - 1);
   const value = maxValue - valueRange * ratio;
   const y = margin.top + plotHeight * ratio;
   return { value, y };
 });
 const yGrid = yTicks.map(({ y }) => {
   return `
     <line class="history-equity-grid" x1="${margin.left}" y1="${y.toFixed(2)}" x2="${margin.left + plotWidth}" y2="${y.toFixed(2)}"></line>
   `;
 }).join("");
 if (el.historyGraphYAxis) {
   el.historyGraphYAxis.innerHTML = `
     <span class="history-graph-y-title">시드 금액 (${currencyLabel})</span>
     ${yTicks.map(({ value, y }) => `
       <span class="history-graph-y-tick" style="top: ${(y / height * 100).toFixed(3)}%;">${escapeHtml(formatFuturesSeedGraphTick(value))}</span>
     `).join("")}
   `;
 }
 if (el.historyGraphXAxisLabel) el.historyGraphXAxisLabel.hidden = false;
 const xTickCount = Math.max(2, Math.round(5 * graphWidthScale));
 const xGrid = Array.from({ length: xTickCount }, (_, index) => {
   const ratio = index / (xTickCount - 1);
   const timestamp = minTime + timeRange * ratio;
   const x = margin.left + plotWidth * ratio;
   return `
     <line class="history-equity-grid" x1="${x.toFixed(2)}" y1="${margin.top}" x2="${x.toFixed(2)}" y2="${margin.top + plotHeight}"></line>
     <text class="history-equity-tick" x="${x.toFixed(2)}" y="${margin.top + plotHeight + 28}" text-anchor="middle">${escapeHtml(formatFuturesSeedGraphTime(timestamp))}</text>
   `;
 }).join("");
 const baselineDisplayValue = isFuturesKrwDisplay() ? futuresUsdtToKrw(startingSeed) : startingSeed;
 const baselineY = yForDisplayValue(baselineDisplayValue);
 const pointNodes = graphPoints.map((point, index) => {
   const isStart = index === 0;
   const block = point.block;
   const direction = block ? String(block.direction || block.side || "-") : "시작";
   const pointClass = isStart ? "is-start" : point.delta > 0 ? "is-win" : point.delta < 0 ? "is-loss" : "is-flat";
   const ariaLabel = isStart
     ? `시작 ${formatDateTime(point.timestamp)}, 시드 ${formatFuturesDisplayAmount(point.seed)}`
     : `${index}번째 완료 포지션, ${formatDateTime(point.timestamp)}, ${direction}, 손익 ${formatSignedFuturesDisplayAmount(point.delta)}, 시드 ${formatFuturesDisplayAmount(point.seed)}`;
   return `
     <circle
       class="history-equity-point ${pointClass}"
       cx="${point.x.toFixed(2)}"
       cy="${point.y.toFixed(2)}"
       r="${isStart ? 5.5 : 6.5}"
       tabindex="0"
       aria-label="${escapeHtml(ariaLabel)}"
     ><title>${escapeHtml(ariaLabel)}</title></circle>
   `;
 }).join("");
 const lastPoint = graphPoints[graphPoints.length - 1];
 const graphWidthPercent = Math.round(graphWidthScale * 100);
 el.historyGraphChart.innerHTML = `
   <svg
     viewBox="0 0 ${width} ${height}"
     role="img"
     aria-labelledby="historyEquityGraphTitle historyEquityGraphDescription"
     style="width: ${graphWidthPercent}%; min-width: ${graphWidthPercent}%;"
   >
     <title id="historyEquityGraphTitle">완료 포지션별 시드 변동 그래프</title>
     <desc id="historyEquityGraphDescription">가로축은 청산 시간, 세로축은 ${currencyLabel} 시드 금액이며 완료 포지션 한 개마다 점 한 개가 표시됩니다.</desc>
     <defs>
       <linearGradient id="historyEquityArea" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.28"></stop>
         <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.015"></stop>
       </linearGradient>
     </defs>
     ${yGrid}
     ${xGrid}
     <line class="history-equity-baseline" x1="${margin.left}" y1="${baselineY.toFixed(2)}" x2="${margin.left + plotWidth}" y2="${baselineY.toFixed(2)}"></line>
     <path class="history-equity-area" d="${areaPath}"></path>
     <path class="history-equity-line" d="${linePath}"></path>
     ${pointNodes}
     <text class="history-equity-end-label" x="${(lastPoint.x - 10).toFixed(2)}" y="${Math.max(margin.top + 14, lastPoint.y - 13).toFixed(2)}" text-anchor="end">${escapeHtml(formatFuturesSeedGraphTick(lastPoint.displayValue))}</text>
   </svg>
 `;
}
function renderFuturesTradeHistory() {
 const ongoingBlocks = ongoingFuturesPositionBlocks();
 const positionBlocks = completedFuturesPositionBlocks();
 if (state.futuresHistoryView === "graph") {
   renderFuturesSeedHistoryGraph(positionBlocks);
   return;
 }
 if (state.futuresHistoryView === "daily") {
   renderFuturesDailyEventHistory(ongoingBlocks, positionBlocks);
   return;
 }
 const unresolvedDailySummaries = normalizeFuturesDailySummaries(state.futures.dailySummaries || []);
 const entryCount = positionBlocks.reduce((sum, block) => sum + finiteNumber(block.entryCount, Array.isArray(block.entries) ? block.entries.length : 0), 0);
 const closeCount = positionBlocks.reduce((sum, block) => sum + finiteNumber(block.closeCount, Array.isArray(block.trades) ? block.trades.length : 0), 0);
 const ongoingEntryCount = ongoingBlocks.reduce((sum, block) => sum + block.entryCount, 0);
 const ongoingCloseCount = ongoingBlocks.reduce((sum, block) => sum + block.closeCount, 0);
 const unresolvedLabel = unresolvedDailySummaries.length ? ` · 이전 요약 ${unresolvedDailySummaries.length.toLocaleString("ko-KR")}개` : "";
 setText(
   el.historyStatus,
   `진행 중 포지션 ${ongoingBlocks.length.toLocaleString("ko-KR")}개 · 진행 중 이벤트 ${(ongoingEntryCount + ongoingCloseCount).toLocaleString("ko-KR")}건`
    + ` · 완료 포지션 ${positionBlocks.length.toLocaleString("ko-KR")}개 · 완료 이벤트 ${(entryCount + closeCount).toLocaleString("ko-KR")}건${unresolvedLabel}`
 );
 if (!ongoingBlocks.length && !positionBlocks.length && !unresolvedDailySummaries.length) {
   el.tradeTableBody.innerHTML = '<tr><td colspan="12" class="empty-row">전량 청산까지 완료된 포지션 기록이 없습니다.</td></tr>';
   return;
 }
 const ongoingRows = ongoingBlocks
   .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
   .map((block) => `${renderFuturesPositionBlockRow(block, { ongoing: true })}${renderFuturesPositionBlockDetailsRow(block, { ongoing: true })}`)
   .join("");
 const positionRows = positionBlocks
   .sort((a, b) => futuresTradeExitTimestamp(b) - futuresTradeExitTimestamp(a))
   .map((block) => {
     const details = state.expandedDailySummaryDate === block.id ? renderFuturesPositionBlockDetailsRow(block) : "";
     return `${renderFuturesPositionBlockRow(block)}${details}`;
   })
   .join("");
 const unresolvedRows = unresolvedDailySummaries
   .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
   .map(renderFuturesLegacySummaryRow)
   .join("");
 el.tradeTableBody.innerHTML = `${ongoingRows}${positionRows}${unresolvedRows}`;
}
function groupFuturesHistoryEventsByDate(ongoingBlocks, positionBlocks) {
 const groups = new Map();
 const sources = [
   ...(Array.isArray(ongoingBlocks) ? ongoingBlocks : []).map((block) => ({ block, ongoing: true })),
   ...(Array.isArray(positionBlocks) ? positionBlocks : []).map((block) => ({ block, ongoing: false }))
 ];
 sources.forEach(({ block, ongoing }) => {
   futuresPositionTimelineEvents(block, { ongoing }).forEach((event) => {
     const eventTimestamp = timestampMs(event.time) || finiteNumber(event.timestamp, 0);
     if (!(eventTimestamp > 0)) return;
     const dateKey = dateKeyFromValue(eventTimestamp);
     if (!groups.has(dateKey)) {
       groups.set(dateKey, {
         dateKey,
         events: [],
         positionIds: new Set(),
         products: new Set(),
         directions: new Set(),
         entryCount: 0,
         closeCount: 0,
         fee: 0,
         realizedPnl: 0,
         hasOngoing: false
       });
     }
     const group = groups.get(dateKey);
     group.events.push(event);
     const positionId = String(block.positionId || block.id || "");
     if (positionId) group.positionIds.add(positionId);
     group.products.add(futuresProductLabel(event.market, event.symbol));
     group.directions.add(event.direction);
     group.fee += Math.max(0, finiteNumber(event.fee, 0));
     group.hasOngoing = group.hasOngoing || ongoing;
     if (event.type === "ENTRY") {
       group.entryCount += 1;
     } else {
       group.closeCount += 1;
       group.realizedPnl += finiteNumber(event.pnl, 0);
     }
   });
 });
 return [...groups.values()]
   .map((group) => ({
     ...group,
     events: group.events.sort((a, b) => finiteNumber(a.timestamp, 0) - finiteNumber(b.timestamp, 0)),
     positionCount: group.positionIds.size,
     productLabel: [...group.products].filter(Boolean).join(" · ") || "-",
     directionLabel: [...group.directions].filter(Boolean).join(" · ") || "-"
   }))
   .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
function combineFuturesLegacyDailySummariesByDate(value) {
 const byDate = new Map();
 normalizeFuturesDailySummaries(value).forEach((summary) => {
   const productLabel = futuresSummaryProductLabel(summary);
   const existing = byDate.get(summary.dateKey);
   if (!existing) {
     byDate.set(summary.dateKey, {
       ...summary,
       productLabels: new Set(productLabel ? [productLabel] : [])
     });
     return;
   }
   const previousTradeCount = Math.max(0, finiteNumber(existing.tradeCount, 0));
   const nextTradeCount = Math.max(0, finiteNumber(summary.tradeCount, 0));
   const combinedTradeCount = previousTradeCount + nextTradeCount;
   existing.tradeCount = combinedTradeCount;
   existing.longCount += Math.max(0, finiteNumber(summary.longCount, 0));
   existing.shortCount += Math.max(0, finiteNumber(summary.shortCount, 0));
   existing.winCount += Math.max(0, finiteNumber(summary.winCount, 0));
   existing.realizedPnl += finiteNumber(summary.realizedPnl, 0);
   existing.fee += Math.max(0, finiteNumber(summary.fee, 0));
   existing.margin += Math.max(0, finiteNumber(summary.margin, 0));
   existing.avgRoe = combinedTradeCount > 0
     ? ((finiteNumber(existing.avgRoe, 0) * previousTradeCount) + (finiteNumber(summary.avgRoe, 0) * nextTradeCount)) / combinedTradeCount
     : 0;
   existing.winRate = combinedTradeCount > 0 ? (existing.winCount / combinedTradeCount) * 100 : null;
   existing.updatedAt = summary.updatedAt || existing.updatedAt;
   if (productLabel) existing.productLabels.add(productLabel);
 });
 return [...byDate.values()]
   .map(({ productLabels, ...summary }) => ({
     ...summary,
     productLabel: [...productLabels].join(" · ")
   }))
   .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
function futuresDailyHistoryItemStats(item) {
 const group = item && item.group ? item.group : null;
 const legacySummary = item && item.legacySummary ? item.legacySummary : null;
 const entryCount = Math.max(0, finiteNumber(group && group.entryCount, 0));
 const closeCount = Math.max(0, finiteNumber(group && group.closeCount, 0))
   + Math.max(0, finiteNumber(legacySummary && legacySummary.tradeCount, 0));
 const realizedPnl = finiteNumber(group && group.realizedPnl, 0)
   + finiteNumber(legacySummary && legacySummary.realizedPnl, 0);
 return { entryCount, closeCount, realizedPnl };
}
function formatFuturesHistoryWeekRange(startDateKey, endDateKey) {
 const startParts = String(startDateKey || "").split("-").map(Number);
 const endParts = String(endDateKey || "").split("-").map(Number);
 if (startParts.length !== 3 || endParts.length !== 3 || startParts.some((value) => !Number.isFinite(value)) || endParts.some((value) => !Number.isFinite(value))) {
   return `${startDateKey || "-"} ~ ${endDateKey || "-"}`;
 }
 if (startParts[0] !== endParts[0]) {
   return `${startParts[0]}년 ${startParts[1]}월 ${startParts[2]}일 ~ ${endParts[0]}년 ${endParts[1]}월 ${endParts[2]}일`;
 }
 return `${startParts[1]}월 ${startParts[2]}일 ~ ${endParts[1]}월 ${endParts[2]}일`;
}
function buildFuturesWeeklyHistoryItems(dailyItems) {
 const items = Array.isArray(dailyItems) ? dailyItems : [];
 const todayDateKey = dateKeyFromValue(Date.now());
 const completedItems = items
   .filter((item) => item.dateKey < todayDateKey && !(item.group && item.group.hasOngoing))
   .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
 const completeDayCount = Math.floor(completedItems.length / 7) * 7;
 const groupedDateKeys = new Set();
 const weeks = [];
 for (let index = 0; index < completeDayCount; index += 7) {
   const weekItems = completedItems.slice(index, index + 7);
   const startDateKey = weekItems[0].dateKey;
   const endDateKey = weekItems[weekItems.length - 1].dateKey;
   const totals = weekItems.reduce((sum, item) => {
     const stats = futuresDailyHistoryItemStats(item);
     sum.entryCount += stats.entryCount;
     sum.closeCount += stats.closeCount;
     sum.realizedPnl += stats.realizedPnl;
     return sum;
   }, { entryCount: 0, closeCount: 0, realizedPnl: 0 });
   weekItems.forEach((item) => groupedDateKeys.add(item.dateKey));
   weeks.push({
     id: `futures-week-${startDateKey}-${endDateKey}`,
     startDateKey,
     endDateKey,
     label: formatFuturesHistoryWeekRange(startDateKey, endDateKey),
     items: [...weekItems].sort((a, b) => b.dateKey.localeCompare(a.dateKey)),
     ...totals,
     returnRate: calculateFuturesDailyReturnRate(totals.realizedPnl)
   });
 }
 const displayItems = [
   ...weeks.map((week) => ({ type: "week", sortDateKey: week.endDateKey, week })),
   ...items
     .filter((item) => !groupedDateKeys.has(item.dateKey))
     .map((item) => ({ type: "day", sortDateKey: item.dateKey, item }))
 ].sort((a, b) => b.sortDateKey.localeCompare(a.sortDateKey));
 return { displayItems, weeks };
}
function renderFuturesDailyHistoryItem(item) {
 if (!item.group) {
   const details = state.expandedFuturesHistoryDate === item.dateKey
     ? renderFuturesLegacySummaryDetailsRow(item.legacySummary)
     : "";
   return `${renderFuturesLegacySummaryRow(item.legacySummary)}${details}`;
 }
 const details = state.expandedFuturesHistoryDate === item.dateKey
   ? renderFuturesDailyEventHistoryDetailsRow(item.group, { legacySummary: item.legacySummary })
   : "";
 return `${renderFuturesDailyEventHistoryRow(item.group, { legacySummary: item.legacySummary })}${details}`;
}
function renderFuturesWeeklyHistoryRow(week) {
 const isExpanded = state.expandedFuturesHistoryWeek === week.id;
 return `
   <tr class="daily-summary-row futures-weekly-history-row${isExpanded ? " is-expanded" : ""}">
     <td colspan="12">
       <button class="daily-summary-card futures-weekly-history-card" type="button" data-futures-history-week="${escapeHtml(week.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
         <strong>${escapeHtml(week.label)}</strong>
         <span class="futures-weekly-history-badge">7일 묶음</span>
         <span>수익금 <b class="${signClass(week.realizedPnl)}">${formatSignedFuturesDisplayAmount(week.realizedPnl)}</b></span>
         <span>수익률 <b class="${signClass(week.returnRate)}">${formatSignedPercent(week.returnRate)}</b></span>
         <span>매매 ${week.entryCount.toLocaleString("ko-KR")}회 · 청산 ${week.closeCount.toLocaleString("ko-KR")}회</span>
         <span class="daily-summary-toggle">${isExpanded ? "7일 접기" : "7일 보기"}</span>
       </button>
     </td>
   </tr>
 `;
}
function renderFuturesWeeklyHistoryDetailsRow(week) {
 const rows = week.items.map(renderFuturesDailyHistoryItem).join("");
 return `
   <tr class="daily-detail-row futures-weekly-history-detail-row">
     <td colspan="12">
       <div class="daily-detail-panel futures-weekly-history-panel">
         <div class="daily-detail-head">
           <strong>${escapeHtml(week.label)} 날짜별 기록</strong>
           <span>날짜 7일 · 매매 ${week.entryCount.toLocaleString("ko-KR")}회 · 청산 ${week.closeCount.toLocaleString("ko-KR")}회 · 수익금 ${formatSignedFuturesDisplayAmount(week.realizedPnl)} · 수익률 ${formatSignedPercent(week.returnRate)}</span>
         </div>
         <table class="futures-weekly-history-days-table" aria-label="${escapeHtml(week.label)} 7일 매매기록">
           <tbody>${rows}</tbody>
         </table>
       </div>
     </td>
   </tr>
 `;
}
function renderFuturesDailyEventHistory(ongoingBlocks, positionBlocks) {
 const groups = groupFuturesHistoryEventsByDate(ongoingBlocks, positionBlocks);
 const unresolvedDailySummaries = combineFuturesLegacyDailySummariesByDate(state.futures.dailySummaries || []);
 const legacySummaryByDate = new Map(unresolvedDailySummaries.map((summary) => [summary.dateKey, summary]));
 const detailedDateKeys = new Set(groups.map((group) => group.dateKey));
 const dateCount = new Set([
   ...groups.map((group) => group.dateKey),
   ...unresolvedDailySummaries.map((summary) => summary.dateKey)
 ]).size;
 const eventCount = groups.reduce((sum, group) => sum + group.events.length, 0);
 const entryCount = groups.reduce((sum, group) => sum + group.entryCount, 0);
 const detailedCloseCount = groups.reduce((sum, group) => sum + group.closeCount, 0);
 const legacyCloseCount = unresolvedDailySummaries.reduce((sum, summary) => sum + finiteNumber(summary.tradeCount, 0), 0);
 const closeCount = detailedCloseCount + legacyCloseCount;
 const realizedPnl = groups.reduce((sum, group) => sum + group.realizedPnl, 0)
   + unresolvedDailySummaries.reduce((sum, summary) => sum + finiteNumber(summary.realizedPnl, 0), 0);
 const unresolvedLabel = unresolvedDailySummaries.length
   ? ` · 이전 요약 ${unresolvedDailySummaries.length.toLocaleString("ko-KR")}개`
   : "";
 if (!groups.length && !unresolvedDailySummaries.length) {
   setText(el.historyStatus, "날짜별 매매기록이 없습니다.");
   el.tradeTableBody.innerHTML = '<tr><td colspan="12" class="empty-row">날짜별 매매기록이 없습니다.</td></tr>';
   return;
 }
 const dailyItems = [
   ...groups.map((group) => ({
     dateKey: group.dateKey,
     group,
     legacySummary: legacySummaryByDate.get(group.dateKey) || null
   })),
   ...unresolvedDailySummaries
     .filter((summary) => !detailedDateKeys.has(summary.dateKey))
     .map((legacySummary) => ({ dateKey: legacySummary.dateKey, group: null, legacySummary }))
 ].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
 const weeklyHistory = buildFuturesWeeklyHistoryItems(dailyItems);
 const weeklyLabel = weeklyHistory.weeks.length
   ? ` · 7일 묶음 ${weeklyHistory.weeks.length.toLocaleString("ko-KR")}개`
   : "";
 setText(
   el.historyStatus,
   `날짜 ${dateCount.toLocaleString("ko-KR")}일 · 상세 이벤트 ${eventCount.toLocaleString("ko-KR")}건`
    + ` · 진입 ${entryCount.toLocaleString("ko-KR")}회 · 청산 ${closeCount.toLocaleString("ko-KR")}회`
    + ` · 실현손익 ${formatSignedFuturesDisplayAmount(realizedPnl)}${weeklyLabel}${unresolvedLabel}`
 );
 const dailyRows = weeklyHistory.displayItems
   .map((historyItem) => {
     if (historyItem.type === "day") return renderFuturesDailyHistoryItem(historyItem.item);
     const details = state.expandedFuturesHistoryWeek === historyItem.week.id
       ? renderFuturesWeeklyHistoryDetailsRow(historyItem.week)
       : "";
     return `${renderFuturesWeeklyHistoryRow(historyItem.week)}${details}`;
   })
   .join("");
 el.tradeTableBody.innerHTML = dailyRows;
}
function renderFuturesDailyEventHistoryRow(group, options = {}) {
 const legacySummary = options.legacySummary || null;
 const isExpanded = state.expandedFuturesHistoryDate === group.dateKey;
 const totalCloseCount = group.closeCount + finiteNumber(legacySummary && legacySummary.tradeCount, 0);
 const totalRealizedPnl = group.realizedPnl + finiteNumber(legacySummary && legacySummary.realizedPnl, 0);
 const totalFee = group.fee + Math.max(0, finiteNumber(legacySummary && legacySummary.fee, 0));
 const dailyReturnRate = calculateFuturesDailyReturnRate(totalRealizedPnl);
 return `
   <tr class="daily-summary-row futures-daily-history-row${isExpanded ? " is-expanded" : ""}">
     <td colspan="12">
       <button class="daily-summary-card futures-daily-history-card" type="button" data-futures-history-date="${escapeHtml(group.dateKey)}" aria-expanded="${isExpanded ? "true" : "false"}">
         <strong>${escapeHtml(group.dateKey)}</strong>
         ${group.hasOngoing ? '<span class="ongoing-position-badge">진행 중 포함</span>' : ""}
         <span>${escapeHtml(group.productLabel)}</span>
         <span>${escapeHtml(group.directionLabel)}</span>
         <span>관련 포지션 <b>${group.positionCount.toLocaleString("ko-KR")}개</b></span>
         <span>실현손익 <b class="${signClass(totalRealizedPnl)}">${formatSignedFuturesDisplayAmount(totalRealizedPnl)}</b></span>
         <span>하루 수익률 <b class="${signClass(dailyReturnRate)}">${formatSignedPercent(dailyReturnRate)}</b></span>
         <span>수수료 <b>${formatFuturesDisplayAmount(totalFee)}</b></span>
         <span>진입 ${group.entryCount.toLocaleString("ko-KR")}회 · 청산 ${totalCloseCount.toLocaleString("ko-KR")}회</span>
         ${legacySummary
           ? `<span class="daily-summary-detail-state">이전 요약 청산 ${legacySummary.tradeCount.toLocaleString("ko-KR")}건 포함 · 상세 없음</span>`
           : ""}
         <span class="daily-summary-toggle">${isExpanded ? "접기" : "보기"}</span>
       </button>
     </td>
   </tr>
 `;
}
function renderFuturesDailyEventHistoryDetailsRow(group, options = {}) {
 const legacySummary = options.legacySummary || null;
 const totalRealizedPnl = group.realizedPnl + finiteNumber(legacySummary && legacySummary.realizedPnl, 0);
 const dailyReturnRate = calculateFuturesDailyReturnRate(totalRealizedPnl);
 const rows = group.events.map(renderFuturesPositionTimelineRow).join("");
 return `
   <tr class="daily-detail-row futures-daily-history-detail-row">
     <td colspan="12">
       <div class="daily-detail-panel">
         <div class="daily-detail-head">
           <strong>${escapeHtml(group.dateKey)} 매매 이벤트</strong>
           <span>전체 ${group.events.length.toLocaleString("ko-KR")}건 · 관련 포지션 ${group.positionCount.toLocaleString("ko-KR")}개 · 실현손익 ${formatSignedFuturesDisplayAmount(totalRealizedPnl)} · 하루 수익률 ${formatSignedPercent(dailyReturnRate)}</span>
         </div>
         ${legacySummary
           ? `<div class="daily-detail-empty futures-legacy-inline-note">이전 버전 요약 청산 ${legacySummary.tradeCount.toLocaleString("ko-KR")}건 · 실현손익 ${formatSignedFuturesDisplayAmount(legacySummary.realizedPnl)} · 수수료 ${formatFuturesDisplayAmount(legacySummary.fee)} · 상세 원본 없음</div>`
           : ""}
         <div class="daily-detail-scroll">
           <table class="daily-detail-table" aria-label="${escapeHtml(group.dateKey)} 날짜별 선물 매매 내역">
             <thead>
               <tr>
                 <th>이벤트 시간</th>
                 <th>구분</th>
                 <th>상품</th>
                 <th>방향</th>
                 <th>실제 체결가</th>
                 <th>레버리지</th>
                 <th>수수료</th>
                 <th>순손익</th>
                 <th>ROE</th>
                 <th>사용 금액</th>
                 <th>수량</th>
                 <th>메모</th>
               </tr>
             </thead>
             <tbody>${rows}</tbody>
           </table>
         </div>
       </div>
     </td>
   </tr>
 `;
}
function renderFuturesPositionBlockRow(block, options = {}) {
 const ongoing = Boolean(options.ongoing || block.isOngoing);
 const isExpanded = ongoing || state.expandedDailySummaryDate === block.id;
 const sideClass = block.direction === "Long" ? "side-buy" : "side-sell";
 if (ongoing) {
   return `
     <tr class="daily-summary-row position-block-row ongoing-position-block-row is-expanded">
       <td colspan="12">
         <div class="daily-summary-card position-block-card ongoing-position-card">
           <strong>${escapeHtml(dateKeyFromValue(block.openedAt))} ~ 진행 중</strong>
           <span class="ongoing-position-badge">진행 중</span>
           <span>${escapeHtml(futuresProductLabel(block.market, block.symbol))}</span>
           <span class="${sideClass}">${escapeHtml(block.direction)} ${formatNumber(block.leverage, 2)}x</span>
           <span>미실현 <b data-futures-ongoing-pnl="${escapeHtml(block.positionId)}" class="${signClass(block.unrealizedPnl)}">${formatSignedFuturesDisplayAmount(block.unrealizedPnl)}</b></span>
           <span>부분 실현 <b class="${signClass(block.netPnl)}">${formatSignedFuturesDisplayAmount(block.netPnl)}</b></span>
           <span>현재 사용 금액 <b>${formatFuturesDisplayAmount(block.currentMargin)}</b></span>
           <span>진입 ${block.entryCount.toLocaleString("ko-KR")}회 · 부분청산 ${block.closeCount.toLocaleString("ko-KR")}회</span>
         </div>
       </td>
     </tr>
   `;
 }
 return `
   <tr class="daily-summary-row position-block-row${isExpanded ? " is-expanded" : ""}">
     <td colspan="12">
       <button class="daily-summary-card position-block-card" type="button" data-futures-position-block-id="${escapeHtml(block.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
         <strong>${escapeHtml(futuresPositionBlockPeriodLabel(block))}</strong>
         <span>${escapeHtml(futuresProductLabel(block.market, block.symbol))}</span>
         <span class="${sideClass}">${escapeHtml(block.direction)} ${formatNumber(block.leverage, 2)}x</span>
         <span>포지션 ROE <b class="${signClass(block.roe)}">${formatSignedPercent(block.roe)}</b></span>
         <span>실현손익 <b class="${signClass(block.netPnl)}">${formatSignedFuturesDisplayAmount(block.netPnl)}</b></span>
         <span>사용 금액 <b>${formatFuturesDisplayAmount(block.margin)}</b></span>
         <span>진입 ${block.entryCount.toLocaleString("ko-KR")}회 · 청산 ${block.closeCount.toLocaleString("ko-KR")}회</span>
         <span class="daily-summary-toggle">${isExpanded ? "접기" : "복기"}</span>
       </button>
     </td>
   </tr>
 `;
}
function futuresPositionTimelineEvents(block, options = {}) {
 const ongoing = Boolean(options.ongoing || block && block.isOngoing);
 const sourceEntries = Array.isArray(block && block.entries) && block.entries.length
   ? block.entries
   : mergeFuturesEntryLegsForJournal(block && block.trades || []);
 const entries = sourceEntries
   .map((entry) => normalizeFuturesEntryLeg(entry, block || {}))
   .filter(Boolean)
   .sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());
 const closes = mergeFuturesTradesById(block && block.trades || [])
   .sort((a, b) => futuresTradeExitTimestamp(a) - futuresTradeExitTimestamp(b));
 const entryEvents = entries.map((entry, index) => ({
   id: `entry-${entry.id}`,
   type: "ENTRY",
   sequence: index + 1,
   total: entries.length,
   timestamp: new Date(entry.openedAt).getTime() || 0,
   time: entry.openedAt,
   market: entry.market,
   symbol: entry.symbol,
   direction: entry.direction === "SHORT" ? "Short" : "Long",
   leverage: entry.leverage,
   price: entry.entryPrice,
   fee: entry.entryFee,
   margin: entry.margin,
   quantity: entry.quantity,
   record: entry
 }));
 const closeEvents = closes.map((trade, index) => ({
   id: `close-${trade.id}`,
   type: "CLOSE",
   sequence: index + 1,
   total: closes.length,
   ongoing,
   final: !ongoing && index === closes.length - 1,
   timestamp: futuresTradeExitTimestamp(trade),
   time: trade.exitTime || trade.closedAt,
   market: futuresTradeMarketCode(trade),
   symbol: futuresTradeSymbol(trade),
   direction: trade.direction,
   leverage: trade.leverage,
   price: trade.exitPrice || trade.closePrice,
   fee: Math.max(0, finiteNumber(trade.exitFee, Math.max(0, finiteNumber(trade.fee, 0) - finiteNumber(trade.entryFee, 0)))),
   margin: trade.margin,
   quantity: trade.quantity,
   pnl: finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)),
   roe: finiteNumber(trade.roe, finiteNumber(trade.roePercent, 0)),
   closeReason: trade.closeReason || "",
   memo: trade.memo || "",
   record: trade
 }));
 return [...entryEvents, ...closeEvents].sort((a, b) => {
   if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
   if (a.type !== b.type) return a.type === "ENTRY" ? -1 : 1;
   return a.sequence - b.sequence;
 });
}
function futuresPositionTimelineEventLabel(event) {
 if (!event) return "";
 if (event.type === "ENTRY") {
   const entryLabel = event.record && event.record.orderType === "LIMIT" ? "예약 진입" : "진입";
   return `${entryLabel} ${event.sequence}/${event.total}`;
 }
 if (event.ongoing) return `부분 청산 ${event.sequence}/${event.total}`;
 return event.final
   ? `최종 청산 ${event.sequence}/${event.total}`
   : `청산 ${event.sequence}/${event.total}`;
}
function renderFuturesPositionTimelineRow(event) {
 const isEntry = event.type === "ENTRY";
 const sideClass = event.direction === "Long" ? "side-buy" : "side-sell";
 const eventClass = isEntry ? "position-event-entry" : "position-event-close";
 const eventLabel = futuresPositionTimelineEventLabel(event);
 const fee = Math.max(0, finiteNumber(event.fee, 0));
 const pnl = finiteNumber(event.pnl, 0);
 const roe = finiteNumber(event.roe, 0);
 return `
   <tr class="position-event-row ${eventClass}">
     <td>${escapeHtml(formatDateTime(event.time))}</td>
     <td>
       <span class="position-event-kind ${isEntry ? "is-entry" : "is-close"}">${escapeHtml(eventLabel)}</span>
       ${!isEntry && event.closeReason ? `<small>${escapeHtml(event.closeReason)}</small>` : ""}
     </td>
     <td><span class="market-pill">${escapeHtml(futuresProductLabel(event.market, event.symbol))}</span></td>
     <td class="${sideClass}">${escapeHtml(event.direction)}</td>
     <td>${formatFuturesDisplayPrice(event.price, event.market)}</td>
     <td>${formatNumber(event.leverage, 2)}x</td>
     <td>${formatFuturesDisplayAmount(fee)}</td>
     <td class="${isEntry ? "" : signClass(pnl)}">${isEntry ? "-" : formatSignedFuturesDisplayAmount(pnl)}</td>
     <td class="${isEntry ? "" : signClass(roe)}">${isEntry ? "-" : formatSignedPercent(roe)}</td>
     <td>${formatFuturesDisplayAmount(event.margin)}</td>
     <td>${escapeHtml(`${formatNumber(event.quantity, 8)} ${event.symbol}`)}</td>
     <td>${isEntry
       ? `<span class="position-event-note">${escapeHtml(`${event.sequence}차 진입`)}</span>`
       : `<textarea class="memo-input" data-futures-memo-id="${escapeHtml(event.record.id)}" maxlength="160" rows="2" placeholder="청산 이유 메모">${escapeHtml(event.memo)}</textarea>`}
     </td>
   </tr>
 `;
}
function renderFuturesPositionBlockDetailsRow(block, options = {}) {
 const ongoing = Boolean(options.ongoing || block.isOngoing);
 const events = futuresPositionTimelineEvents(block, { ongoing });
 const rows = events
   .map(renderFuturesPositionTimelineRow)
   .join("");
 const periodLabel = ongoing
   ? dateKeyFromValue(block.openedAt) + " ~ 진행 중"
   : futuresPositionBlockPeriodLabel(block);
 return `
   <tr class="daily-detail-row position-block-detail-row${ongoing ? " ongoing-position-detail-row" : ""}">
     <td colspan="12">
       <div class="daily-detail-panel">
         <div class="daily-detail-head position-block-detail-head">
           <div>
             <strong>${escapeHtml(periodLabel)} · ${escapeHtml(futuresProductLabel(block.market, block.symbol))} ${escapeHtml(block.direction)} 포지션</strong>
             <span>전체 이벤트 ${events.length.toLocaleString("ko-KR")}건 · 진입 ${block.entryCount.toLocaleString("ko-KR")}회 · ${ongoing ? "부분청산" : "청산"} ${block.closeCount.toLocaleString("ko-KR")}회 · 수수료 ${formatFuturesDisplayAmount(block.fee)}</span>
           </div>
           ${ongoing
             ? '<div class="ongoing-position-save-note"><strong>실시간 저장 중</strong><span>최종 청산하면 이 블록이 완료 포지션 기록으로 자동 이동합니다.</span></div>'
             : `<label class="position-block-memo-control">
                 <span>포지션 복기 메모</span>
                 <textarea class="memo-input" data-futures-position-block-memo-id="${escapeHtml(block.id)}" maxlength="160" rows="2" placeholder="진입 이유, 분할매수·익절 과정, 개선점을 기록하세요">${escapeHtml(block.memo || "")}</textarea>
               </label>`}
         </div>
         <div class="daily-detail-scroll">
           <table class="daily-detail-table" aria-label="${escapeHtml(periodLabel)} 포지션 매매 내역">
             <thead>
               <tr>
                 <th>이벤트 시간</th>
                 <th>구분</th>
                 <th>상품</th>
                 <th>방향</th>
                 <th>실제 체결가</th>
                 <th>레버리지</th>
                 <th>수수료</th>
                 <th>순손익</th>
                 <th>ROE</th>
                 <th>사용 금액</th>
                 <th>수량</th>
                 <th>메모</th>
               </tr>
             </thead>
             <tbody>${rows}</tbody>
           </table>
         </div>
       </div>
     </td>
   </tr>
 `;
}
function renderFuturesTradeRow(trade) {
 const pnl = finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0));
 const roe = finiteNumber(trade.roe, finiteNumber(trade.roePercent, 0));
 const sideClass = trade.direction === "Long" ? "side-buy" : "side-sell";
 const entryTime = trade.entryTime || trade.openedAt || trade.closedAt;
 const exitTime = trade.exitTime || trade.closedAt;
 const marketCode = futuresTradeMarketCode(trade);
 return `
   <tr>
     <td>${escapeHtml(`진입 ${formatDateTime(entryTime)}`)}<br>${escapeHtml(`청산 ${formatDateTime(exitTime)}`)}</td>
      <td><span class="market-pill">${escapeHtml(futuresTradeProductLabel(trade))}</span></td>
     <td class="${sideClass}">${escapeHtml(trade.direction)}</td>
     <td>${formatFuturesDisplayPrice(trade.entryPrice, marketCode)}</td>
     <td>${formatFuturesDisplayPrice(trade.closePrice, marketCode)}</td>
     <td>${formatNumber(trade.leverage, 2)}x</td>
     <td>${formatFuturesDisplayAmount(trade.fee)}</td>
     <td class="${signClass(pnl)}">${formatSignedFuturesDisplayAmount(pnl)}</td>
     <td class="${signClass(roe)}">${formatSignedPercent(roe)}</td>
     <td>${formatFuturesDisplayAmount(trade.margin)}</td>
     <td>${formatFuturesDisplayPrice(trade.liquidationPrice, marketCode)}</td>
     <td><textarea class="memo-input" data-futures-memo-id="${escapeHtml(trade.id)}" maxlength="160" rows="2" placeholder="매매 이유 메모">${escapeHtml(trade.memo || "")}</textarea></td>
   </tr>
 `;
}
function renderFuturesLegacySummaryRow(summary) {
 const dailyReturnRate = calculateFuturesDailyReturnRate(summary.realizedPnl);
 const isExpanded = state.expandedFuturesHistoryDate === summary.dateKey;
 return `
   <tr class="daily-summary-row legacy-summary-row${isExpanded ? " is-expanded" : ""}">
     <td colspan="12">
       <button class="daily-summary-card" type="button" data-futures-history-date="${escapeHtml(summary.dateKey)}" aria-expanded="${isExpanded ? "true" : "false"}">
         <strong>${escapeHtml(summary.dateKey)}</strong>
         <span>${escapeHtml(summary.productLabel || futuresSummaryProductLabel(summary))}</span>
         <span>실현손익 <b class="${signClass(summary.realizedPnl)}">${formatSignedFuturesDisplayAmount(summary.realizedPnl)}</b></span>
         <span>하루 수익률 <b class="${signClass(dailyReturnRate)}">${formatSignedPercent(dailyReturnRate)}</b></span>
         <span>청산 ${summary.tradeCount.toLocaleString("ko-KR")}건</span>
         <span class="daily-summary-detail-state">이전 버전에 상세 원본이 없어 포지션 단위 재구성 불가</span>
         <span class="daily-summary-toggle">${isExpanded ? "접기" : "보기"}</span>
       </button>
     </td>
   </tr>
 `;
}
function renderFuturesLegacySummaryDetailsRow(summary) {
 return `
   <tr class="daily-detail-row futures-daily-history-detail-row">
     <td colspan="12">
       <div class="daily-detail-empty">${escapeHtml(summary.dateKey)} 기록은 이전 버전의 날짜 요약만 남아 있어 세부 매매 원본이 없습니다.</div>
     </td>
   </tr>
 `;
}
function renderFuturesDailySummaryRow(summary) {
 const winRate = Number.isFinite(summary.winRate) ? `${summary.winRate.toFixed(1)}%` : "-";
 const totalReturnRateValue = calculateFuturesDailyReturnRate(summary.realizedPnl);
 const totalReturnRate = formatSignedPercent(totalReturnRateValue);
 const isExpanded = state.expandedDailySummaryDate === summary.dateKey;
 const archivedTrades = futuresDailySummaryTrades(summary);
 const productLabel = futuresSummaryProductLabel(summary);
 return `
   <tr class="daily-summary-row${isExpanded ? " is-expanded" : ""}">
     <td colspan="12">
       <button class="daily-summary-card" type="button" data-daily-summary-date="${escapeHtml(summary.dateKey)}" aria-expanded="${isExpanded ? "true" : "false"}">
         <strong>${escapeHtml(summary.dateKey)}</strong>
         <span>${escapeHtml(productLabel)}</span>
        <span>하루 수익률 <b class="${signClass(totalReturnRateValue)}">${totalReturnRate}</b></span>
         <span>승률 <b>${winRate}</b></span>
         <span>실현손익 <b class="${signClass(summary.realizedPnl)}">${formatSignedFuturesDisplayAmount(summary.realizedPnl)}</b></span>
         <span>사용 금액 합계 <b>${formatFuturesDisplayAmount(summary.margin)}</b></span>
         <span>청산 ${summary.tradeCount.toLocaleString("ko-KR")}건</span>
         <span class="daily-summary-detail-state">${archivedTrades.length ? "내역 저장됨" : "요약만 저장됨"}</span>
         <span class="daily-summary-toggle">${isExpanded ? "접기" : "보기"}</span>
       </button>
     </td>
   </tr>
 `;
}
function renderFuturesDailySummaryDetailsRow(summary) {
 const trades = futuresDailySummaryTrades(summary);
 if (!trades.length) {
   return `
     <tr class="daily-detail-row">
       <td colspan="12">
         <div class="daily-detail-empty">이 날짜의 선물 상세 거래 내역이 없습니다.</div>
       </td>
     </tr>
   `;
 }
 const rows = trades
   .sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime())
   .map(renderFuturesTradeRow)
   .join("");
 const productLabel = futuresSummaryProductLabel(summary);
 return `
   <tr class="daily-detail-row">
     <td colspan="12">
       <div class="daily-detail-panel">
         <div class="daily-detail-head">
          <strong>${escapeHtml(summary.dateKey)} ${escapeHtml(productLabel)} 선물 매매 내역</strong>
           <span>${trades.length.toLocaleString("ko-KR")}건</span>
         </div>
         <div class="daily-detail-scroll">
          <table class="daily-detail-table" aria-label="${escapeHtml(summary.dateKey)} ${escapeHtml(productLabel)} 선물 매매 내역">
             <thead>
               <tr>
                 <th>진입/청산 시간</th>
                 <th>상품</th>
                 <th>방향</th>
                 <th>평균 진입가</th>
                 <th>종료가</th>
                 <th>레버리지</th>
                 <th>수수료</th>
                 <th>순손익</th>
                 <th>ROE</th>
                 <th>사용 금액</th>
                 <th>청산가</th>
                 <th>매매 메모</th>
               </tr>
             </thead>
             <tbody>${rows}</tbody>
           </table>
         </div>
       </div>
     </td>
   </tr>
 `;
}
function futuresDailySummaryTrades(summary) {
 if (!summary) return [];
 const dateKey = summary.dateKey;
 return (Array.isArray(summary.trades) ? summary.trades : [])
   .map(normalizeFuturesTrade)
   .filter(Boolean)
   .filter((trade) => futuresTradeDateKey(trade) === dateKey);
}
function renderFuturesPositionPanel() {
 if (!el.futuresPositionDetails) return;
 const positions = getFuturesPositions();
 if (positions.length) {
   const rows = positions.map((position) => ({
     position,
     calc: calculateFuturesPosition(position, currentFuturesPriceForPosition(position))
   }));
   const totalMargin = rows.reduce((sum, row) => sum + finiteNumber(row.position.margin, 0), 0);
   const totalNotional = rows.reduce((sum, row) => sum + finiteNumber(row.position.notional, 0), 0);
   const totalPnl = rows.reduce((sum, row) => sum + finiteNumber(row.calc.netPnl, 0), 0);
   const totalAsset = state.futures.account.usdtBalance + rows.reduce((sum, row) => {
     return sum + row.position.margin + row.calc.grossPnl - row.calc.exitFee;
   }, 0);
   el.futuresPositionDetails.innerHTML = `
     <div class="futures-position-row"><span>보유 포지션</span><strong>${positions.length.toLocaleString("ko-KR")}개</strong></div>
     <div class="futures-position-row"><span>총 사용 금액</span><strong>${formatFuturesDisplayAmount(totalMargin)}</strong></div>
     <div class="futures-position-row"><span>총 명목가치</span><strong>${formatFuturesDisplayAmount(totalNotional)}</strong></div>
      <div class="futures-position-row"><span>미실현 손익</span><strong class="${signClass(totalPnl)}" data-futures-live-total-pnl>${formatSignedFuturesDisplayAmount(totalPnl)}</strong></div>
      <div class="futures-position-row"><span>합산 ROE</span><strong class="${signClass(totalPnl)}" data-futures-live-total-roe>${totalMargin ? formatSignedPercent((totalPnl / totalMargin) * 100) : "-"}</strong></div>
     <div class="futures-position-row"><span>사용 가능 잔고</span><strong>${formatFuturesDisplayAmount(futuresAvailableUsdtBalance())}</strong></div>
      <div class="futures-position-row"><span>전체 자산</span><strong data-futures-live-total-asset>${formatFuturesDisplayAmount(totalAsset)}</strong></div>
     <div class="futures-position-mini-list">
       ${rows.map((row, index) => renderFuturesOpenPositionCard(row.position, index, { closeButton: false })).join("")}
     </div>
   `;
   return;
 }
 const position = state.futures.position;
 if (!position) {
   const last = state.futures.lastRealizedPnl;
   el.futuresPositionDetails.innerHTML = `
     <p class="muted-line">보유 중인 포지션이 없습니다.</p>
     <div class="futures-position-row"><span>최근 실현 손익</span><strong class="${signClass(last)}">${formatSignedFuturesDisplayAmount(last)}</strong></div>
   `;
   return;
 }
 const currentPrice = currentFuturesPriceForPosition(position);
 const calc = calculateFuturesPosition(position, currentPrice);
 const directionLabel = position.direction === "LONG" ? "Long" : "Short";
 const totalAsset = state.futures.account.usdtBalance + position.margin + calc.grossPnl - calc.exitFee;
 el.futuresPositionDetails.innerHTML = `
   <div class="futures-position-row"><span>포지션 방향</span><strong>${directionLabel}</strong></div>
   <div class="futures-position-row"><span>평균 진입가격</span><strong>${formatFuturesDisplayPrice(futuresEffectiveEntryPrice(position), futuresPositionMarketCode(position))}</strong></div>
   <div class="futures-position-row"><span>현재가격</span><strong>${currentPrice ? formatFuturesDisplayPrice(currentPrice, futuresPositionMarketCode(position)) : "-"}</strong></div>
   <div class="futures-position-row"><span>유효 레버리지</span><strong>${formatNumber(position.leverage, 2)}x</strong></div>
   <div class="futures-position-row"><span>사용 증거금</span><strong>${formatFuturesDisplayAmount(position.margin)}</strong></div>
   <div class="futures-position-row"><span>포지션 명목가치</span><strong>${formatFuturesDisplayAmount(position.notional)}</strong></div>
   <div class="futures-position-row"><span>청산가</span><strong>${formatFuturesDisplayPrice(calc.liquidationPrice, futuresPositionMarketCode(position))}</strong></div>
   <div class="futures-position-row"><span>예상 수수료</span><strong>${formatFuturesDisplayAmount(calc.fee)}</strong></div>
   <div class="futures-position-row"><span>미실현 손익</span><strong class="${signClass(calc.netPnl)}">${formatSignedFuturesDisplayAmount(calc.netPnl)}</strong></div>
   <div class="futures-position-row"><span>ROE 수익률</span><strong class="${signClass(calc.roePercent)}">${formatSignedPercent(calc.roePercent)}</strong></div>
   <div class="futures-position-row"><span>사용 가능 잔고</span><strong>${formatFuturesDisplayAmount(futuresAvailableUsdtBalance())}</strong></div>
   <div class="futures-position-row"><span>전체 자산</span><strong>${formatFuturesDisplayAmount(totalAsset)}</strong></div>
   <div class="futures-position-row"><span>청산 후 실현 손익</span><strong class="${signClass(calc.netPnl)}">${formatSignedFuturesDisplayAmount(calc.netPnl)}</strong></div>
 `;
}
function renderTradeRow(trade, options = {}) {
 const market = tradeMarket(trade);
 const sideClass = trade.side === "BUY" ? "side-buy" : "side-sell";
 const pnl = finiteNumber(trade.realizedPnl, 0);
 const rate = finiteNumber(trade.realizedPnlRate, 0);
 const avgEntryPrice = averageEntryPriceForTrade(trade);
 const openBuyTradeIds = options.openBuyTradeIdsMap
   ? options.openBuyTradeIdsMap.get(tradeMarketCode(trade)) || new Set()
   : new Set();
 const holdingRate = options.editableMemo ? currentHoldingRateForTrade(trade, openBuyTradeIds) : null;
 const memoCell = options.editableMemo
   ? `<input class="memo-input" data-memo-id="${escapeHtml(trade.id)}" value="${escapeHtml(trade.memo || "")}" maxlength="80" />`
   : escapeHtml(trade.memo || "-");
 const rowClass = options.detail ? ' class="daily-detail-trade-row"' : "";
 return `
   <tr${rowClass}>
     <td>${escapeHtml(formatDateTime(trade.createdAt))}</td>
     <td><span class="market-pill">${escapeHtml(market.symbol)}</span></td>
     <td class="${sideClass}">${trade.side}</td>
     <td>${formatKrw(trade.price)}</td>
     <td>${formatCoin(trade.btcAmount)} ${escapeHtml(market.symbol)}</td>
     <td>${formatKrw(trade.krwAmount)}</td>
     <td>${formatKrw(trade.fee, 2)}</td>
     <td class="${signClass(pnl)}">${trade.side === "SELL" ? formatSignedKrw(pnl) : "-"}</td>
     <td class="${signClass(rate)}">${trade.side === "SELL" ? formatSignedPercent(rate) : "-"}</td>
     <td>${avgEntryPrice > 0 ? formatKrw(avgEntryPrice) : "-"}</td>
     <td class="${signClass(holdingRate)}">${formatOptionalSignedPercent(holdingRate)}</td>
     <td>${formatKrw(trade.krwBalanceAfter)} / ${formatCoin(trade.btcBalanceAfter)} ${escapeHtml(market.symbol)}</td>
     <td>${memoCell}</td>
   </tr>
 `;
}
function renderDailySummaryRow(summary) {
 const winRate = Number.isFinite(summary.winRate) ? `${summary.winRate.toFixed(1)}%` : "-";
 const isExpanded = state.expandedDailySummaryDate === summary.dateKey;
 const archivedTrades = dailySummaryTrades(summary);
 return `
   <tr class="daily-summary-row${isExpanded ? " is-expanded" : ""}">
     <td colspan="13">
       <button class="daily-summary-card" type="button" data-daily-summary-date="${escapeHtml(summary.dateKey)}" aria-expanded="${isExpanded ? "true" : "false"}">
         <strong>${escapeHtml(summary.dateKey)}</strong>
         <span>전체 코인</span>
         <span>수익률 <b class="${signClass(summary.returnRate)}">${formatSignedPercent(summary.returnRate)}</b></span>
         <span>승률 <b>${winRate}</b></span>
         <span>실현손익 <b class="${signClass(summary.realizedPnl)}">${formatSignedKrw(summary.realizedPnl)}</b></span>
         <span>매매 ${summary.tradeCount.toLocaleString("ko-KR")}건</span>
         <span class="daily-summary-detail-state">${archivedTrades.length ? "내역 저장됨" : "요약만 저장됨"}</span>
         <span class="daily-summary-toggle">${isExpanded ? "접기" : "보기"}</span>
       </button>
     </td>
   </tr>
 `;
}
function renderDailySummaryDetailsRow(summary) {
 const trades = dailySummaryTrades(summary);
 if (!trades.length) {
   return `
     <tr class="daily-detail-row">
       <td colspan="13">
         <div class="daily-detail-empty">
           이 요약은 이전 방식으로 저장되어 원본 매매 내역이 없습니다. 새로 저장되는 하루치부터 상세 매매가 함께 보관됩니다.
         </div>
       </td>
     </tr>
   `;
 }
 const rows = trades
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
   .map((trade) => renderTradeRow(trade, { detail: true }))
   .join("");
 return `
   <tr class="daily-detail-row">
     <td colspan="13">
       <div class="daily-detail-panel">
         <div class="daily-detail-head">
           <strong>${escapeHtml(summary.dateKey)} 매매 내역</strong>
           <span>${trades.length.toLocaleString("ko-KR")}건</span>
         </div>
         <div class="daily-detail-scroll">
           <table class="daily-detail-table" aria-label="${escapeHtml(summary.dateKey)} 매매 내역">
             <thead>
               <tr>
                 <th>시간</th>
                 <th>코인</th>
                 <th>구분</th>
                 <th>가격</th>
                 <th>수량</th>
                 <th>거래금액</th>
                 <th>수수료</th>
                 <th>실현손익</th>
                 <th>수익률</th>
                 <th>평균단가</th>
                 <th>보유 변동률</th>
                 <th>거래 후 잔고</th>
                 <th>메모</th>
               </tr>
             </thead>
             <tbody>${rows}</tbody>
           </table>
         </div>
       </div>
     </td>
   </tr>
 `;
}
function dailySummaryTrades(summary) {
 if (!summary) return [];
 return normalizeTrades(summary.trades || [])
   .filter((trade) => dateKeyFromValue(trade.createdAt) === summary.dateKey);
}
function toggleDailySummaryDetails(dateKey) {
 if (!dateKey) return;
 state.expandedDailySummaryDate = state.expandedDailySummaryDate === dateKey ? null : dateKey;
 renderTradeHistory();
}
function toggleFuturesHistoryDateDetails(dateKey) {
 if (!dateKey) return;
 state.expandedFuturesHistoryDate = state.expandedFuturesHistoryDate === dateKey ? null : dateKey;
 renderTradeHistory();
}
function toggleFuturesHistoryWeekDetails(weekId) {
 if (!weekId) return;
 state.expandedFuturesHistoryWeek = state.expandedFuturesHistoryWeek === weekId ? null : weekId;
 state.expandedFuturesHistoryDate = null;
 renderTradeHistory();
}
function toggleFuturesPositionBlockDetails(blockId) {
 if (!blockId) return;
 state.expandedDailySummaryDate = state.expandedDailySummaryDate === blockId ? null : blockId;
 renderTradeHistory();
}
function currentHoldingRateForTrade(trade, openBuyTradeIds = currentOpenBuyTradeIdsForHoldingRates(tradeMarketCode(trade))) {
 if (!trade || trade.side !== "BUY") return null;
 const marketCode = tradeMarketCode(trade);
 const ticker = tickerForMarket(marketCode);
 const portfolio = portfolioForMarket(marketCode);
 if (!ticker || !ticker.price || !portfolio || portfolio.btcBalance <= 0) return null;
 if (!openBuyTradeIds.has(trade.id)) return null;
 const entryPrice = buyEntryPriceForTrade(trade) || averageEntryPriceForTrade(trade);
 if (entryPrice <= 0) return null;
 return ((ticker.price - entryPrice) / entryPrice) * 100;
}
function currentHoldingRateTradeIdsByMarket() {
 return Object.keys(MARKETS).reduce((map, marketCode) => {
   map.set(marketCode, currentOpenBuyTradeIdsForHoldingRates(marketCode));
   return map;
 }, new Map());
}
function currentOpenBuyTradeIdsForHoldingRates(marketCode = state.market) {
 const openBuyIds = new Set();
 const portfolio = portfolioForMarket(marketCode);
 if (!portfolio || portfolio.btcBalance <= 0) return openBuyIds;
 const openLots = [];
 const zeroTolerance = 1e-10;
 allTradesForHoldingRates(marketCode).forEach((trade) => {
   const amount = Math.max(0, finiteNumber(trade.btcAmount, 0));
   if (amount <= 0) return;
   if (trade.side === "BUY") {
     openLots.push({ id: trade.id, remaining: amount });
     return;
   }
   if (trade.side !== "SELL") return;
   let sellRemaining = amount;
   for (let index = 0; index < openLots.length && sellRemaining > zeroTolerance; index += 1) {
     const lot = openLots[index];
     const used = Math.min(lot.remaining, sellRemaining);
     lot.remaining = Math.max(0, lot.remaining - used);
     sellRemaining = Math.max(0, sellRemaining - used);
   }
 });
 const portfolioBalance = Math.max(0, finiteNumber(portfolio.btcBalance, 0));
 let excess = Math.max(0, openLots.reduce((sum, lot) => sum + lot.remaining, 0) - portfolioBalance);
 for (let index = 0; index < openLots.length && excess > zeroTolerance; index += 1) {
   const lot = openLots[index];
   const used = Math.min(lot.remaining, excess);
   lot.remaining = Math.max(0, lot.remaining - used);
   excess = Math.max(0, excess - used);
 }
 openLots.forEach((lot) => {
   if (lot.remaining > zeroTolerance) openBuyIds.add(lot.id);
 });
 return openBuyIds;
}
function allTradesForHoldingRates(marketCode) {
 const archivedTrades = state.dailySummaries.flatMap((summary) => Array.isArray(summary.trades) ? summary.trades : []);
 return mergeTradesById(archivedTrades, state.trades)
   .filter((trade) => tradeMarketCode(trade) === marketCode)
   .sort((a, b) => timestampMs(a.createdAt) - timestampMs(b.createdAt));
}
function buyEntryPriceForTrade(trade) {
 if (!trade || trade.side !== "BUY") return 0;
 const amount = finiteNumber(trade.btcAmount, 0);
 if (amount <= 0) return 0;
 const krwAmount = finiteNumber(trade.krwAmount, 0);
 if (krwAmount > 0) return krwAmount / amount;
 const price = finiteNumber(trade.price, 0);
 return price > 0 ? price : 0;
}
function averageEntryPriceForTrade(trade) {
 if (!trade) return 0;
 const stored = finiteNumber(trade.avgEntryPrice, 0);
 if (stored > 0) return stored;
 const after = finiteNumber(trade.avgBuyPriceAfter, 0);
 if (after > 0) return after;
 if (trade.side !== "SELL") return 0;
 const amount = finiteNumber(trade.btcAmount, 0);
 if (amount <= 0) return 0;
 const netKrw = finiteNumber(trade.krwAmount, 0) - finiteNumber(trade.fee, 0);
 const costBasis = netKrw - finiteNumber(trade.realizedPnl, 0);
 return costBasis > 0 ? costBasis / amount : 0;
}
function currentOpenBuyTradeIdsByMarket() {
 return Object.keys(MARKETS).reduce((map, marketCode) => {
   map.set(marketCode, currentOpenBuyTradeIds(marketCode));
   return map;
 }, new Map());
}
function currentOpenBuyTradeIds(marketCode = state.market) {
 const openBuyIds = new Set();
 const portfolio = portfolioForMarket(marketCode);
 if (!portfolio || portfolio.btcBalance <= 0) return openBuyIds;
 let runningBtc = 0;
 const zeroTolerance = 1e-10;
 tradesForMarket(marketCode)
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
   .forEach((trade) => {
     const amount = Math.max(0, finiteNumber(trade.btcAmount, 0));
     if (trade.side === "BUY") {
       runningBtc += amount;
       openBuyIds.add(trade.id);
       return;
     }
     if (trade.side === "SELL") {
       runningBtc = Math.max(0, runningBtc - amount);
       const balanceAfter = Math.max(0, finiteNumber(trade.btcBalanceAfter, runningBtc));
       if (runningBtc <= zeroTolerance || balanceAfter <= zeroTolerance) {
         runningBtc = 0;
         openBuyIds.clear();
       }
     }
   });
 return openBuyIds;
}
function currentOpenBuyTrades(marketCode = state.market) {
 const openIds = currentOpenBuyTradeIds(marketCode);
 if (!openIds.size) return [];
 return tradesForMarket(marketCode)
   .filter((trade) => trade.side === "BUY" && openIds.has(trade.id))
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
function archivePastTradesIfNeeded(now = new Date()) {
 if (!state.trades.length) return false;
 const todayKey = dateKeyFromDate(now);
 const openBuyTradeIdsByMarket = currentOpenBuyTradeIdsByMarket();
 const pastTrades = [];
 const activeTrades = [];
 state.trades.forEach((trade) => {
   const tradeDateKey = dateKeyFromValue(trade.createdAt);
   const openBuyTradeIds = openBuyTradeIdsByMarket.get(tradeMarketCode(trade)) || new Set();
   if (tradeDateKey < todayKey && !openBuyTradeIds.has(trade.id)) {
     pastTrades.push(trade);
   } else {
     activeTrades.push(trade);
   }
 });
 if (!pastTrades.length) return false;
 const grouped = pastTrades.reduce((map, trade) => {
   const dateKey = dateKeyFromValue(trade.createdAt);
   if (!map.has(dateKey)) map.set(dateKey, []);
   map.get(dateKey).push(trade);
   return map;
 }, new Map());
 grouped.forEach((trades, dateKey) => {
   upsertDailySummary(createDailySummary(dateKey, trades));
 });
 state.trades = activeTrades;
 saveTrades();
 saveDailySummaries();
 return true;
}
function futuresTradeDateKey(trade) {
 return dateKeyFromValue(trade && (trade.exitTime || trade.closedAt || trade.entryTime || trade.openedAt));
}
function archivePastFuturesTradesIfNeeded(now = new Date()) {
 if (!state.futures) return false;
 const before = checksumStorageText(JSON.stringify({
   trades: state.futures.trades || [],
   positionBlocks: state.futures.positionBlocks || [],
   dailySummaries: state.futures.dailySummaries || []
 }));
 const journal = normalizeFuturesPositionJournal(state.futures, getFuturesPositions());
 state.futures.trades = journal.pendingTrades;
 state.futures.positionBlocks = journal.positionBlocks;
 state.futures.dailySummaries = journal.dailySummaries;
 const after = checksumStorageText(JSON.stringify({
   trades: state.futures.trades,
   positionBlocks: state.futures.positionBlocks,
   dailySummaries: state.futures.dailySummaries
 }));
 if (before === after) return false;
 saveFuturesState({ reason: "position-journal-finalize" });
 return true;
}
function createDailySummary(dateKey, trades) {
 const sellTrades = trades.filter((trade) => trade.side === "SELL");
 const realizedPnl = sellTrades.reduce((sum, trade) => sum + finiteNumber(trade.realizedPnl, 0), 0);
 const winCount = sellTrades.filter((trade) => finiteNumber(trade.realizedPnl, 0) > 0).length;
 const seedKrw = positiveNumber(state.sharedAccount.initialSeedKrw, DEFAULT_SEED);
 return {
   id: `daily-${dateKey}`,
   dateKey,
   tradeCount: trades.length,
   buyCount: trades.filter((trade) => trade.side === "BUY").length,
   sellCount: sellTrades.length,
   winCount,
   realizedPnl,
   seedKrw,
   returnRate: seedKrw > 0 ? (realizedPnl / seedKrw) * 100 : 0,
   winRate: sellTrades.length ? (winCount / sellTrades.length) * 100 : null,
   trades: normalizeTrades(trades),
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString()
 };
}
function createFuturesDailySummary(dateKey, trades) {
 const closedTrades = trades.map(normalizeFuturesTrade).filter(Boolean);
 const realizedPnl = closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0);
 const fee = closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.fee, 0), 0);
 const margin = closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.margin, 0), 0);
 const winCount = closedTrades.filter((trade) => finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)) > 0).length;
 const avgRoe = closedTrades.length
   ? closedTrades.reduce((sum, trade) => sum + finiteNumber(trade.roe, finiteNumber(trade.roePercent, 0)), 0) / closedTrades.length
   : 0;
 const seedPerformance = calculateFuturesDailySeedPerformance(closedTrades);
  return {
    id: `futures-daily-${dateKey}`,
    marketType: "futures",
    symbol: currentFuturesSymbol(),
    dateKey,
   tradeCount: closedTrades.length,
   longCount: closedTrades.filter((trade) => trade.side === "long").length,
   shortCount: closedTrades.filter((trade) => trade.side === "short").length,
   winCount,
   realizedPnl,
   fee,
   margin,
   avgRoe,
   startSeed: seedPerformance.startSeed,
   endSeed: seedPerformance.endSeed,
   returnRate: seedPerformance.returnRate,
   winRate: closedTrades.length ? (winCount / closedTrades.length) * 100 : null,
   trades: closedTrades,
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString()
 };
}
function upsertDailySummary(summary) {
 const normalized = normalizeDailySummary(summary);
 if (!normalized) return;
 const existing = state.dailySummaries.find((item) => item.dateKey === normalized.dateKey);
 if (!existing) {
   state.dailySummaries.push(normalized);
   state.dailySummaries = normalizeDailySummaries(state.dailySummaries);
   return;
 }
 existing.tradeCount += normalized.tradeCount;
 existing.buyCount += normalized.buyCount;
 existing.sellCount += normalized.sellCount;
 existing.winCount += normalized.winCount;
 existing.realizedPnl += normalized.realizedPnl;
 existing.trades = mergeTradesById(existing.trades || [], normalized.trades || []);
 existing.seedKrw = positiveNumber(existing.seedKrw, normalized.seedKrw);
 existing.returnRate = existing.seedKrw > 0 ? (existing.realizedPnl / existing.seedKrw) * 100 : 0;
 existing.winRate = existing.sellCount > 0 ? (existing.winCount / existing.sellCount) * 100 : null;
 existing.updatedAt = new Date().toISOString();
 state.dailySummaries = normalizeDailySummaries(state.dailySummaries);
}
function upsertFuturesDailySummary(summary) {
 const normalized = normalizeFuturesDailySummary(summary);
 if (!normalized) return;
 if (!Array.isArray(state.futures.dailySummaries)) state.futures.dailySummaries = [];
 const existing = state.futures.dailySummaries.find((item) => item.dateKey === normalized.dateKey);
 if (!existing) {
   state.futures.dailySummaries.push(normalized);
   state.futures.dailySummaries = normalizeFuturesDailySummaries(state.futures.dailySummaries);
   return;
 }
 existing.trades = mergeFuturesTradesById(existing.trades || [], normalized.trades || []);
 const seedPerformance = calculateFuturesDailySeedPerformance(existing.trades, existing);
 const refreshed = normalizeFuturesDailySummary({
   ...existing,
   tradeCount: existing.trades.length,
   longCount: existing.trades.filter((trade) => trade.side === "long").length,
   shortCount: existing.trades.filter((trade) => trade.side === "short").length,
   winCount: existing.trades.filter((trade) => finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)) > 0).length,
   realizedPnl: existing.trades.reduce((sum, trade) => sum + finiteNumber(trade.netPnl, finiteNumber(trade.realizedPnl, 0)), 0),
   fee: existing.trades.reduce((sum, trade) => sum + finiteNumber(trade.fee, 0), 0),
   margin: existing.trades.reduce((sum, trade) => sum + finiteNumber(trade.margin, 0), 0),
   avgRoe: existing.trades.length
     ? existing.trades.reduce((sum, trade) => sum + finiteNumber(trade.roe, finiteNumber(trade.roePercent, 0)), 0) / existing.trades.length
     : 0,
   startSeed: seedPerformance.startSeed,
   endSeed: seedPerformance.endSeed,
   returnRate: seedPerformance.returnRate,
   updatedAt: new Date().toISOString()
 });
 Object.assign(existing, refreshed);
 state.futures.dailySummaries = normalizeFuturesDailySummaries(state.futures.dailySummaries);
}
function scheduleDailyArchive() {
 clearTimeout(state.dailyArchiveTimer);
 const now = new Date();
 const nextMidnight = new Date(now);
 nextMidnight.setHours(24, 0, 1, 0);
 const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());
 state.dailyArchiveTimer = setTimeout(() => {
   const archivedSpot = archivePastTradesIfNeeded();
   const archivedFutures = archivePastFuturesTradesIfNeeded();
   if (archivedSpot || archivedFutures) {
     renderTradeHistory();
     renderDashboard();
     drawChart();
   }
   scheduleDailyArchive();
 }, delay);
}
function dateKeyFromValue(value) {
 const date = new Date(value);
 return dateKeyFromDate(Number.isNaN(date.getTime()) ? new Date() : date);
}
function dateKeyFromDate(date) {
 const parts = getKstDateParts(date);
 return `${parts.year}-${parts.month}-${parts.day}`;
}
function renderTimeframeButtons() {
 el.timeframeButtons.forEach((button) => {
   button.hidden = button.dataset.futuresOnlyTimeframe === "true" && !isFuturesMode();
   button.classList.toggle("active", button.dataset.timeframe === state.timeframe);
 });
}
function renderEmaControls() {
 el.emaInputs.forEach((input) => {
   const key = input.dataset.emaKey;
   if (!key) return;
   input.checked = state.chart.emaVisible[key] !== false;
 });
}
function renderBollingerControl() {
 if (!el.bollingerBandInput) return;
 el.bollingerBandInput.checked = state.chart.bollingerVisible === true;
}
function chartVisibleMaxCount(candles = activeAnalysisCandles()) {
 if (isFuturesMode()) return FUTURES_MAX_VISIBLE_CANDLES;
 const loadedCount = Array.isArray(candles) ? candles.length : 0;
 if (loadedCount > 0) return Math.max(1, Math.min(activeCandleLimit(), loadedCount));
 return activeCandleLimit();
}
function chartVisibleMinCount(maxCount = chartVisibleMaxCount()) {
 const minVisible = isFuturesMode() ? FUTURES_MIN_VISIBLE_CANDLES : MIN_VISIBLE_CANDLES;
 return Math.min(minVisible, Math.max(1, maxCount));
}
function clampChartVisibleCount(value, candles = activeAnalysisCandles()) {
  const maxCount = chartVisibleMaxCount(candles);
  const minCount = chartVisibleMinCount(maxCount);
  return clamp(Math.round(finiteNumber(value, DEFAULT_VISIBLE_CANDLES)), minCount, maxCount);
}
function chartMaxPanOffset(candles = activeAnalysisCandles(), visibleCount = state.chart.visibleCount) {
  const loadedCount = Array.isArray(candles) ? candles.length : 0;
  const actualVisibleCount = Math.min(
    loadedCount,
    Math.max(1, Math.round(finiteNumber(visibleCount, DEFAULT_VISIBLE_CANDLES)))
  );
  return Math.max(0, loadedCount - actualVisibleCount);
}
function clampChartPanOffset(value, candles = activeAnalysisCandles(), visibleCount = state.chart.visibleCount) {
  return clamp(
    Math.round(finiteNumber(value, 0)),
    0,
    chartMaxPanOffset(candles, visibleCount)
  );
}
function clampChartPricePanRatio(value) {
  return clamp(finiteNumber(value, 0), -CHART_MAX_PRICE_PAN_RATIO, CHART_MAX_PRICE_PAN_RATIO);
}
function applyChartPricePan(minPrice, maxPrice, ratio = state.chart.pricePanRatio) {
  const safeMinPrice = Math.max(0, finiteNumber(minPrice, 0));
  const minimumRange = chartMinimumAbsolutePriceRange();
  const safeMaxPrice = Math.max(
    safeMinPrice + minimumRange,
    finiteNumber(maxPrice, safeMinPrice + minimumRange)
  );
  const priceRange = safeMaxPrice - safeMinPrice;
  const requestedShift = priceRange * clampChartPricePanRatio(ratio);
  const appliedShift = Math.max(requestedShift, -safeMinPrice);
  return {
    minPrice: safeMinPrice + appliedShift,
    maxPrice: safeMaxPrice + appliedShift,
    shift: appliedShift
  };
}
function chartPanPageStep() {
  const candles = activeAnalysisCandles();
  const actualVisibleCount = Math.min(state.chart.visibleCount, candles.length || state.chart.visibleCount);
  return Math.max(1, Math.round(actualVisibleCount * 0.8));
}
function renderChartRangeControls() {
  const candles = activeAnalysisCandles();
 const maxCount = chartVisibleMaxCount(candles);
 const minCount = chartVisibleMinCount(maxCount);
 const nextVisibleCount = clampChartVisibleCount(state.chart.visibleCount, candles);
 if (nextVisibleCount !== state.chart.visibleCount) {
   state.chart.visibleCount = nextVisibleCount;
   state.chart.renderedVisibleCount = nextVisibleCount;
   if (state.chart.zoomAnimation) {
     state.chart.zoomAnimation.startedAt = 0;
     state.chart.zoomAnimation.fromCount = nextVisibleCount;
     state.chart.zoomAnimation.targetCount = nextVisibleCount;
    }
  }
  state.chart.panOffset = clampChartPanOffset(state.chart.panOffset, candles, state.chart.visibleCount);
  if (el.chartVisibleRangeInput) {
   el.chartVisibleRangeInput.min = String(minCount);
   el.chartVisibleRangeInput.max = String(maxCount);
   el.chartVisibleRangeInput.step = String(maxCount - minCount < VISIBLE_CANDLE_STEP ? 1 : 20);
   el.chartVisibleRangeInput.value = String(state.chart.visibleCount);
 }
  if (el.chartRangeLabel) {
    const actual = Math.min(state.chart.visibleCount, candles.length || state.chart.visibleCount);
    const panLabel = state.chart.panOffset > 0
      ? ` · 최신에서 ${state.chart.panOffset.toLocaleString("ko-KR")}개 전`
      : " · 최신";
    const pricePanRatio = clampChartPricePanRatio(state.chart.pricePanRatio);
    const pricePanLabel = Math.abs(pricePanRatio) >= 0.005
      ? ` · ${pricePanRatio < 0 ? "위" : "아래"} ${Math.round(Math.abs(pricePanRatio) * 100)}%`
      : "";
    setText(el.chartRangeLabel, `${actual.toLocaleString("ko-KR")}개 표시${panLabel}${pricePanLabel}`);
  }
  if (el.chartPanLeftBtn) {
    el.chartPanLeftBtn.disabled = !candles.length
      || state.chart.panOffset >= chartMaxPanOffset(candles, state.chart.visibleCount);
  }
  if (el.chartPanRightBtn) el.chartPanRightBtn.disabled = !candles.length || state.chart.panOffset <= 0;
  if (el.chartPanUpBtn) el.chartPanUpBtn.disabled = !candles.length;
  if (el.chartPanDownBtn) el.chartPanDownBtn.disabled = !candles.length;
  if (el.chartZoomInBtn) el.chartZoomInBtn.disabled = state.chart.visibleCount <= minCount;
  if (el.chartZoomOutBtn) el.chartZoomOutBtn.disabled = state.chart.visibleCount >= maxCount;
  if (el.chartFitBtn) {
    const alreadyFitted = state.chart.visibleCount >= maxCount
      && state.chart.panOffset <= 0
      && Math.abs(clampChartPricePanRatio(state.chart.pricePanRatio)) < 0.005;
    el.chartFitBtn.disabled = !candles.length || alreadyFitted;
  }
}
function renderRiskControls() {
 const selected = selectedRiskBlock();
 const source = state.riskSettings;
 const rewardRatio = positiveNumber(finiteNumber(source.rewardRatio, DEFAULT_REWARD_RATIO), DEFAULT_REWARD_RATIO);
 const riskRatio = positiveNumber(finiteNumber(source.riskRatio, DEFAULT_RISK_RATIO), DEFAULT_RISK_RATIO);
 el.riskModeBtn.classList.toggle("active", state.chart.riskMode);
 if (document.activeElement !== el.riskRewardInput) {
   el.riskRewardInput.value = trimNumber(rewardRatio, 2);
 }
 if (document.activeElement !== el.riskRiskInput) {
   el.riskRiskInput.value = trimNumber(riskRatio, 2);
 }
 setText(el.riskRatioLabel, `${selected ? "블럭 선택됨 · " : ""}익절 ${trimNumber(rewardRatio, 2)}% / 손절 ${trimNumber(riskRatio, 2)}%`);
}
function handleRiskRatioInput() {
 const ratios = readRiskRatioInputs();
 state.riskSettings = ratios;
 renderRiskControls();
}
function readRiskRatioInputs() {
 return {
   rewardRatio: positiveNumber(Number(el.riskRewardInput.value), DEFAULT_REWARD_RATIO),
   riskRatio: positiveNumber(Number(el.riskRiskInput.value), DEFAULT_RISK_RATIO)
 };
}
function setChartVisibleCount(value) {
  const nextVisibleCount = clampChartVisibleCount(value);
 if (nextVisibleCount !== state.chart.visibleCount) {
   startChartZoomAnimation(nextVisibleCount);
  }
  state.chart.visibleCount = nextVisibleCount;
  state.chart.panOffset = clampChartPanOffset(state.chart.panOffset, activeAnalysisCandles(), nextVisibleCount);
  renderChartRangeControls();
  drawChart();
}
function changeChartVisibleCount(delta) {
 setChartVisibleCount(state.chart.visibleCount + delta);
}
function fitChartToLoadedData() {
  state.chart.panOffset = 0;
  state.chart.pricePanRatio = 0;
  setChartVisibleCount(chartVisibleMaxCount());
}
function setChartPanOffset(value) {
  const nextOffset = clampChartPanOffset(value);
  if (nextOffset === state.chart.panOffset) {
    renderChartRangeControls();
    return;
  }
  state.chart.panOffset = nextOffset;
  if (state.chart.priceScaleAnimation) state.chart.priceScaleAnimation.animateNext = true;
  renderChartRangeControls();
  hideTooltip();
  drawChart();
}
function changeChartPanOffset(delta) {
  setChartPanOffset(state.chart.panOffset + delta);
}
function setChartPricePanRatio(value, animate = true) {
  const nextRatio = clampChartPricePanRatio(value);
  if (Math.abs(nextRatio - state.chart.pricePanRatio) < 1e-6) {
    renderChartRangeControls();
    return;
  }
  state.chart.pricePanRatio = nextRatio;
  const animation = state.chart.priceScaleAnimation;
  if (animation) {
    animation.animateNext = animate;
    if (!animate) animation.startedAt = 0;
  }
  renderChartRangeControls();
  hideTooltip();
  drawChart();
}
function changeChartPricePan(delta) {
  setChartPricePanRatio(state.chart.pricePanRatio + delta);
}
function userChartOverlaysVisible() {
 return state.chart.userOverlaysVisible !== false;
}
function persistUserChartOverlaysVisibility() {
 try {
   safeSetItem(FUTURES_USER_CHART_OVERLAYS_VISIBLE_KEY, String(userChartOverlaysVisible()));
 } catch (error) {
   console.warn("User chart overlay visibility save failed", error);
 }
}
function renderUserChartOverlayToggle() {
 const visible = userChartOverlaysVisible();
 if (el.chartOverlaysToggleBtn) {
   setText(el.chartOverlaysToggleBtn, visible ? "내 표시 숨기기" : "내 표시 보기");
   el.chartOverlaysToggleBtn.classList.toggle("hidden-state", !visible);
   el.chartOverlaysToggleBtn.setAttribute("aria-pressed", String(visible));
   el.chartOverlaysToggleBtn.title = visible
     ? "추세선·수평선·피보나치·손익비·등락률·진입 표시를 차트에서 숨깁니다."
     : "숨긴 추세선·수평선·피보나치·손익비·등락률·진입 표시를 다시 보여줍니다.";
 }
 if (el.trendModeBtn) el.trendModeBtn.disabled = !visible;
 if (el.horizontalModeBtn) el.horizontalModeBtn.disabled = !visible;
 if (el.fibonacciModeBtn) el.fibonacciModeBtn.disabled = !visible;
 if (el.riskModeBtn) el.riskModeBtn.disabled = !visible;
 if (el.percentMeasureBtn) el.percentMeasureBtn.disabled = !visible;
 if (el.clearTrendBtn) el.clearTrendBtn.disabled = !visible;
}
function toggleUserChartOverlays() {
 const nextVisible = !userChartOverlaysVisible();
 state.chart.userOverlaysVisible = nextVisible;
 if (!nextVisible) {
   state.chart.trendMode = false;
   state.chart.horizontalMode = false;
   state.chart.fibonacciMode = false;
   state.chart.riskMode = false;
   state.chart.percentMeasureMode = false;
   state.chart.percentMeasureStart = null;
   state.chart.pendingPoint = null;
   state.chart.selectedTrendlineId = null;
   state.chart.selectedRiskBlockId = null;
   state.chart.draggingRiskBlock = null;
   state.chart.draggingFibonacci = null;
   state.chart.suppressNextClick = false;
   syncRiskSelectionFlags();
 }
 persistUserChartOverlaysVisibility();
 renderUserChartOverlayToggle();
 updateTrendControls();
 renderRiskControls();
 updateChartCursor(null);
 drawChart();
 showToast(nextVisible
   ? "차트에 내 추세선·손익비·진입 표시를 다시 표시합니다."
   : "차트의 내 추세선·손익비·진입 표시를 숨겼습니다.");
}
function updateTrendControls() {
 renderUserChartOverlayToggle();
 el.trendModeBtn.classList.toggle("active", state.chart.trendMode);
 el.horizontalModeBtn.classList.toggle("active", state.chart.horizontalMode);
 if (el.fibonacciModeBtn) el.fibonacciModeBtn.classList.toggle("active", state.chart.fibonacciMode);
 if (el.percentMeasureBtn) el.percentMeasureBtn.classList.toggle("active", state.chart.percentMeasureMode);
 setText(
   el.trendHint,
   state.chart.exitOrderPositionId
     ? `차트에서 ${trimNumber(state.chart.exitOrderAmountUnits, 2)} USDT 예약 청산 가격을 클릭`
   : state.chart.limitOrderMode === "LONG"
     ? "차트에서 현재가 아래의 예약 매수 가격을 클릭"
     : state.chart.limitOrderMode === "SHORT"
       ? "차트에서 현재가 위의 예약 매도 가격을 클릭"
   : !userChartOverlaysVisible()
     ? "내 표시 숨김 · ‘내 표시 보기’로 복원"
   : state.chart.percentMeasureMode
     ? state.chart.percentMeasureStart
       ? "등락률 측정: 두 번째 점을 클릭"
       : "등락률 측정: 첫 번째 점을 클릭"
   : state.chart.riskMode
     ? "손익비 생성 준비"
   : state.chart.fibonacciMode
     ? state.chart.draggingFibonacci
       ? "피보나치: 끝점까지 드래그"
       : "피보나치: 시작점에서 끝점까지 드래그"
     : state.chart.horizontalMode
     ? "수평선을 그릴 가격을 클릭"
     : state.chart.trendMode
     ? state.chart.pendingPoint
       ? "두 번째 지점을 클릭"
       : "첫 번째 지점을 클릭"
     : state.chart.selectedRiskBlockId
       ? "손익비 블럭: 내부 드래그로 이동 · 오른쪽 손잡이로 기간 조절"
     : state.chart.selectedTrendlineId
       ? selectedTrendDrawing() && selectedTrendDrawing().kind === "fibonacci"
         ? "피보나치 선택됨 · Delete 또는 선택 삭제"
         : "선 선택됨"
       : "손익비는 버튼으로 자동 생성"
 );
 el.deleteTrendBtn.disabled = !userChartOverlaysVisible() || (!state.chart.selectedTrendlineId && !state.chart.selectedRiskBlockId);
 if (isFuturesMode()) renderFuturesLimitOrders();
}
function setConnectionStatus(mode, label) {
 el.connectionStatus.classList.remove("status-live", "status-rest", "status-wait");
 if (mode === "live") el.connectionStatus.classList.add("status-live");
 else if (mode === "rest") el.connectionStatus.classList.add("status-rest");
 else el.connectionStatus.classList.add("status-wait");
 setText(el.connectionStatus, label);
}
function futuresWebSocketIsOpen(socket = state.futures && state.futures.ws) {
 const openState = typeof WebSocket !== "undefined" && Number.isFinite(WebSocket.OPEN) ? WebSocket.OPEN : 1;
 return Boolean(socket && socket === state.futures.ws && socket.readyState === openState);
}
function futuresWebSocketIsHealthy() {
 if (!futuresWebSocketIsOpen()) return false;
 const lastMessageAt = finiteNumber(state.futures.wsLastMessageAt, 0);
 return lastMessageAt > 0 && Date.now() - lastMessageAt <= FUTURES_WS_STALE_MS;
}
function markFuturesWebSocketMessage(socket, market, isTrade = false) {
 if (!futuresWebSocketIsOpen(socket)) return false;
 const now = Date.now();
 state.futures.wsLastMessageAt = now;
 if (isTrade) state.futures.wsLastTradeAt = now;
 if (!el.connectionStatus.classList.contains("status-live")) {
   const source = market.chartSource === "BINANCE" ? "Binance" : "Bybit";
   const symbol = market.binanceSymbol || market.bybitSymbol || market.code;
   setConnectionStatus("live", `${source} ${symbol} 실시간 체결 연결됨`);
 }
 return true;
}
function scheduleFuturesWebSocketReconnect(label = "Binance 실시간 재연결 중 · REST 임시 사용") {
 clearTimeout(state.futures.reconnectTimer);
 state.futures.reconnectTimer = null;
 if (!isFuturesMode()) return;
 setConnectionStatus("wait", label);
 state.futures.reconnectTimer = setTimeout(() => {
   state.futures.reconnectTimer = null;
   connectFuturesWebSocket();
 }, FUTURES_WS_RECONNECT_MS);
}
function startFuturesWebSocketHealthMonitor(socket, market) {
 clearInterval(state.futures.wsHeartbeatTimer);
 clearInterval(state.futures.wsWatchdogTimer);
 state.futures.wsHeartbeatTimer = setInterval(() => {
   if (market.chartSource === "BYBIT" && futuresWebSocketIsOpen(socket)) socket.send(JSON.stringify({ op: "ping" }));
 }, 20000);
 state.futures.wsWatchdogTimer = setInterval(() => {
   if (socket !== state.futures.ws) return;
   if (!futuresWebSocketIsOpen(socket)) return;
   if (Date.now() - finiteNumber(state.futures.wsLastMessageAt, 0) <= FUTURES_WS_STALE_MS) return;
   setConnectionStatus("wait", `${market.chartSource === "BINANCE" ? "Binance" : "Bybit"} 체결 수신 지연 · 재연결 중`);
   try {
     socket.close();
   } catch (error) {
     console.warn("Futures stale websocket close failed", error);
     scheduleFuturesWebSocketReconnect();
   }
 }, FUTURES_WS_WATCHDOG_MS);
}
function connectTickerSocket() {
 const marketCode = state.market;
 clearTimeout(state.reconnectTimer);
 setConnectionStatus("wait", "재연결 중");
 try {
   const socket = new WebSocket(WS_URL);
   state.ws = socket;
   socket.binaryType = "arraybuffer";
   socket.addEventListener("open", () => {
     setConnectionStatus("live", "실시간 연결됨");
     stopFallbackTicker();
     socket.send(
       JSON.stringify([
         { ticket: `paper-${Date.now()}` },
         { type: "ticker", codes: [marketCode], isOnlyRealtime: true },
         { format: "DEFAULT" }
       ])
     );
   });
   socket.addEventListener("message", async (event) => {
     try {
       const raw = await decodeSocketMessage(event.data);
       const ticker = normalizeTicker(raw);
       if (ticker && ticker.market !== state.market) return;
       if (ticker) applyTicker(ticker);
     } catch (error) {
       console.warn("ticker message parse failed", error);
     }
   });
   socket.addEventListener("error", () => {
     setConnectionStatus("rest", "REST 대체 모드");
     startFallbackTicker();
   });
   socket.addEventListener("close", () => {
     if (state.socketClosing) {
       state.socketClosing = false;
       return;
     }
     setConnectionStatus("rest", "REST 대체 모드");
     startFallbackTicker();
     state.reconnectTimer = setTimeout(connectTickerSocket, 3500);
   });
 } catch (error) {
   console.warn("websocket failed", error);
   setConnectionStatus("rest", "REST 대체 모드");
   startFallbackTicker();
 }
}
async function decodeSocketMessage(data) {
 if (data instanceof Blob) return JSON.parse(await data.text());
 if (data instanceof ArrayBuffer) return JSON.parse(new TextDecoder("utf-8").decode(data));
 return JSON.parse(String(data));
}
function startFallbackTicker() {
 if (state.fallbackTimer) return;
 fetchTicker();
 state.fallbackTimer = setInterval(fetchTicker, 3000);
}
function stopFallbackTicker() {
 if (!state.fallbackTimer) return;
 clearInterval(state.fallbackTimer);
 state.fallbackTimer = null;
}
function startMarketTickerRefresh() {
 if (state.marketTickerTimer) return;
 const refreshActiveTicker = () => {
   if (isFuturesMode()) {
     if (!futuresWebSocketIsHealthy()) fetchFuturesTicker({ silent: true });
     refreshBackgroundFuturesPositionTickers();
   }
   else fetchMarketTickers();
 };
 refreshActiveTicker();
 state.marketTickerTimer = setInterval(() => {
   refreshActiveTicker();
 }, MARKET_TICKER_REFRESH_MS);
}
async function fetchTicker() {
 const requestedMarket = state.market;
 try {
   const data = await requestJson(`${API_BASE}/ticker?markets=${requestedMarket}`);
   if (requestedMarket !== state.market) return;
   const ticker = normalizeTicker(Array.isArray(data) ? data[0] : data);
   if (ticker && ticker.market !== state.market) return;
   if (ticker) applyTicker(ticker);
   if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
     setConnectionStatus("rest", "REST 대체 모드");
   }
 } catch (error) {
   console.warn("ticker fetch failed", error);
   setConnectionStatus("wait", "시세 수신 오류");
   showToast("업비트 현재가를 가져오지 못했습니다.");
 }
}
async function fetchMarketTickers() {
 try {
   const url = new URL(`${API_BASE}/ticker`);
   url.searchParams.set("markets", Object.keys(MARKETS).join(","));
   const data = await requestJson(url.toString());
   const tickers = (Array.isArray(data) ? data : [data])
     .map(normalizeTicker)
     .filter((ticker) => ticker && MARKETS[ticker.market]);
   let updatedCurrentTicker = false;
   tickers.forEach((ticker) => {
     state.marketTickers[ticker.market] = ticker;
     if (ticker.market === state.market && (!state.ticker || !state.ws || state.ws.readyState !== WebSocket.OPEN)) {
       state.ticker = ticker;
       updatedCurrentTicker = true;
     }
   });
   if (updatedCurrentTicker) {
     updateCurrentCandleFromTicker();
     renderTicker();
     renderDashboard();
   renderTradeButtons();
   renderChartRangeControls();
   drawChart();
 } else {
   renderDashboard();
 }
   if (!isMemoInputActive()) {
     renderTradeHistory();
   }
 } catch (error) {
   console.warn("market ticker fetch failed", error);
 }
}
async function loadCandles(unit, silent) {
 const requestedMarket = state.market;
 const requestedTimeframe = normalizeSpotTimeframe(unit);
 const requestedLabel = timeframeLabel(requestedTimeframe);
 if (state.loadingCandles && silent) return;
 state.loadingCandles = true;
 if (!silent) {
   setText(el.chartStatus, `${requestedMarket} ${requestedLabel}봉 캔들 로딩 중`);
   el.chartEmpty.classList.remove("hidden");
 }
 try {
   const data = await fetchSpotCandles(requestedTimeframe, requestedMarket, CANDLE_LOAD_LIMIT);
   if (requestedMarket !== state.market || requestedTimeframe !== state.timeframe || isFuturesMode()) return;
   state.candles = sanitizeChartCandles(
     Array.isArray(data) ? data : [],
     `Upbit ${requestedMarket} ${requestedTimeframe}${requestedTimeframe === "15s" ? "" : "m"}`,
     timeframeSeconds(requestedTimeframe),
     CANDLE_LOAD_LIMIT
   );
   if (!silent) resetChartAnimations();
   updateCurrentCandleFromTicker();
   setText(el.chartStatus, `${requestedMarket} ${requestedLabel}봉 최근 ${state.candles.length.toLocaleString("ko-KR")}개`);
   el.chartEmpty.classList.toggle("hidden", state.candles.length > 0);
   renderChartRangeControls();
   drawChart();
 } catch (error) {
   console.warn("candle fetch failed", error);
   setText(el.chartStatus, `${requestedMarket} 캔들 데이터 오류`);
   el.chartEmpty.classList.remove("hidden");
   setText(el.chartEmpty, "캔들 데이터를 가져오지 못했습니다.");
   showToast("업비트 캔들 API 요청에 실패했습니다.");
 } finally {
   state.loadingCandles = false;
 }
}
function startCandleAutoRefresh() {
 clearInterval(state.candleRefreshTimer);
 const timeframe = normalizeTimeframe(state.timeframe);
 const intervalMs = isFuturesMode() && timeframe.endsWith("s") ? timeframeSeconds(timeframe) * 1000 : 60000;
 state.candleRefreshTimer = setInterval(() => {
   if (isFuturesMode()) {
     loadFuturesCandles(state.timeframe, true);
     maybeSchedulePeriodicPendingFuturesOrderRecovery();
   }
   else loadCandles(state.timeframe, true);
 }, intervalMs);
}
async function requestJson(url, options = {}) {
 const timeoutMs = Number.isFinite(options.timeoutMs) ? Math.max(1000, options.timeoutMs) : 0;
 const controller = timeoutMs > 0 && typeof AbortController !== "undefined" ? new AbortController() : null;
 const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
 try {
   const response = await fetch(url, {
     headers: { Accept: "application/json" },
     cache: "no-store",
     signal: controller ? controller.signal : undefined
   });
   if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
   return response.json();
 } finally {
   if (timeoutId) clearTimeout(timeoutId);
 }
}
async function fetchSpotCandles(unit, market, targetCount) {
 return fetchCandlePages(unit, market, targetCount);
}
async function fetchCandlePages(unit, market, targetCount) {
 const rows = [];
 let to = "";
 while (rows.length < targetCount) {
   const pageSize = Math.min(CANDLE_PAGE_SIZE, targetCount - rows.length);
   const url = new URL(`${API_BASE}/candles/minutes/${unit}`);
   url.searchParams.set("market", market);
   url.searchParams.set("count", String(pageSize));
   if (to) url.searchParams.set("to", to);
   const page = await requestJson(url.toString());
   if (!Array.isArray(page) || !page.length) break;
   rows.push(...page);
   const oldest = page[page.length - 1];
   const oldestUtc = oldest && oldest.candle_date_time_utc;
   if (!oldestUtc || page.length < pageSize) break;
   const oldestMs = parseExchangeDateTimeMs(oldestUtc, null, 0);
   if (!Number.isFinite(oldestMs)) break;
   to = new Date(oldestMs - 1000).toISOString().slice(0, 19);
 }
 return rows;
}
async function fetchFuturesCandles(interval = "1", limit = FUTURES_CANDLE_LIMIT) {
 const market = currentFuturesMarket();
 const timeframe = normalizeTimeframe(interval);
 if (timeframe.endsWith("s")) return fetchSyntheticSubminuteFuturesCandles(market, timeframeSeconds(timeframe), limit);
 if (market.chartSource === "BINANCE") return fetchBinanceFuturesCandles(market, timeframe, limit);
 if (market.chartSource === "BYBIT") return fetchBybitFuturesCandles(market, timeframe, limit);
 return fetchBithumbFuturesCandles(timeframe, market.code, limit);
}
function binanceInterval(value) {
 const timeframe = String(value || "1");
 const intervals = { "1": "1m", "3": "3m", "5": "5m", "15": "15m", "60": "1h", "240": "4h", D: "1d", "1d": "1d" };
 return intervals[timeframe] || "1m";
}
async function requestBinanceFuturesJson(path, searchParams) {
 let lastError = null;
 for (const base of BINANCE_FUTURES_API_BASES) {
   try {
     const url = new URL(`${base}${path}`);
     Object.entries(searchParams || {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
     return await requestJson(url.toString(), { timeoutMs: 8000 });
   } catch (error) {
     lastError = error;
     console.warn("Binance Futures API request failed", base, error);
   }
 }
 throw lastError || new Error("Binance Futures API request failed");
}
function normalizeBinanceKlineRow(row) {
 if (!Array.isArray(row)) return null;
 const candle = {
   time: Math.floor(parseChartNumber(row[0], 0) / 1000),
   open: parseChartNumber(row[1], NaN),
   high: parseChartNumber(row[2], NaN),
   low: parseChartNumber(row[3], NaN),
   close: parseChartNumber(row[4], NaN),
   volume: Math.max(0, parseChartNumber(row[5], 0)),
   value: Math.max(0, parseChartNumber(row[7], 0))
 };
 return isValidChartCandle(candle) ? candle : null;
}
async function fetchBinanceFuturesCandles(market, unit, limit = FUTURES_CANDLE_LIMIT) {
 const requestedCandles = Math.min(1500, Math.max(1, Math.round(limit)));
 const rows = await requestBinanceFuturesJson("/fapi/v1/klines", {
   symbol: market.binanceSymbol,
   interval: binanceInterval(unit),
   limit: requestedCandles
 });
 return sanitizeChartCandles(
   (Array.isArray(rows) ? rows : []).map(normalizeBinanceKlineRow).filter(Boolean),
   `Binance ${market.binanceSymbol} ${binanceInterval(unit)}`,
   timeframeSeconds(unit),
   requestedCandles
 );
}
async function requestBybitJson(path, searchParams) {
 let lastError = null;
 for (const base of BYBIT_API_BASES) {
   try {
     const url = new URL(`${base}${path}`);
     Object.entries(searchParams || {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
     const data = await requestJson(url.toString());
     if (String(data && data.retCode) !== "0") throw new Error(data && data.retMsg ? data.retMsg : "Bybit API error");
     return data;
   } catch (error) {
     lastError = error;
     console.warn("Bybit API request failed", base, error);
   }
 }
 throw lastError || new Error("Bybit API request failed");
}
async function fetchBybitFuturesCandles(market, unit, limit = FUTURES_CANDLE_LIMIT) {
 const requestedCandles = Math.min(FUTURES_MAX_VISIBLE_CANDLES, Math.max(1, Math.round(limit)));
 const data = await requestBybitJson("/market/kline", {
   category: "linear",
   symbol: market.bybitSymbol,
   interval: normalizeTimeframe(unit),
   limit: requestedCandles
 });
 const rows = data && data.result && Array.isArray(data.result.list) ? data.result.list : [];
 const candles = rows.map((row) => ({
   time: Math.floor(parseChartNumber(row && row[0], 0) / 1000),
   open: parseChartNumber(row && row[1], NaN),
   high: parseChartNumber(row && row[2], NaN),
   low: parseChartNumber(row && row[3], NaN),
   close: parseChartNumber(row && row[4], NaN),
   volume: Math.max(0, parseChartNumber(row && row[5], 0)),
   value: Math.max(0, parseChartNumber(row && row[6], 0))
 }));
 return sanitizeChartCandles(
   candles,
   `Bybit ${market.bybitSymbol} ${unit}m`,
   timeframeSeconds(unit),
   requestedCandles
 );
}
function normalizeDailyMovingAverageCandles(candles, limit = DAILY_SMA_HISTORY_LIMIT) {
 const byDay = new Map();
 (Array.isArray(candles) ? candles : []).forEach((raw) => {
   const candle = normalizeCandle(raw);
   if (!isValidChartCandle(candle)) return;
   const dayStart = Math.floor(candle.time / 86400) * 86400;
   byDay.set(dayStart, { ...candle, time: dayStart });
 });
 return [...byDay.values()]
   .sort((a, b) => a.time - b.time)
   .slice(-Math.max(1, Math.round(limit)));
}
async function fetchBybitDailyMovingAverageCandles(market, limit = DAILY_SMA_HISTORY_LIMIT) {
 const requestedCandles = Math.min(1000, Math.max(200, Math.round(limit)));
 const data = await requestBybitJson("/market/kline", {
   category: "linear",
   symbol: market.bybitSymbol,
   interval: "D",
   limit: requestedCandles
 });
 const rows = data && data.result && Array.isArray(data.result.list) ? data.result.list : [];
 return normalizeDailyMovingAverageCandles(rows.map((row) => ({
   time: Math.floor(parseChartNumber(row && row[0], 0) / 1000),
   open: parseChartNumber(row && row[1], NaN),
   high: parseChartNumber(row && row[2], NaN),
   low: parseChartNumber(row && row[3], NaN),
   close: parseChartNumber(row && row[4], NaN),
   volume: Math.max(0, parseChartNumber(row && row[5], 0)),
   value: Math.max(0, parseChartNumber(row && row[6], 0))
 })), requestedCandles);
}
async function fetchBinanceDailyMovingAverageCandles(market, limit = DAILY_SMA_HISTORY_LIMIT) {
 const requestedCandles = Math.min(1000, Math.max(200, Math.round(limit)));
 const rows = await requestBinanceFuturesJson("/fapi/v1/klines", {
   symbol: market.binanceSymbol,
   interval: "1d",
   limit: requestedCandles
 });
 return normalizeDailyMovingAverageCandles(
   (Array.isArray(rows) ? rows : []).map(normalizeBinanceKlineRow).filter(Boolean),
   requestedCandles
 );
}
function dailyMovingAverageContextKey() {
 if (!isFuturesMode()) return "";
 const market = currentFuturesMarket();
 if (market.chartSource === "BINANCE" && market.binanceSymbol) return `BINANCE:${market.binanceSymbol}`;
 if (market.chartSource !== "BYBIT" || !market.bybitSymbol) return "";
 return `BYBIT:${market.bybitSymbol}`;
}
function resetDailyMovingAverageData() {
 state.chart.dailyMaRequestId += 1;
 state.chart.dailyMaCandles = [];
 state.chart.dailyMaContextKey = "";
 state.chart.dailyMaLoading = false;
 state.chart.dailyMaError = "";
 state.chart.dailyMaLoadedAt = 0;
}
async function loadDailyMovingAverageCandles(options = {}) {
 const contextKey = dailyMovingAverageContextKey();
 if (!contextKey) {
   if (state.chart.dailyMaContextKey || state.chart.dailyMaCandles.length) resetDailyMovingAverageData();
   return;
 }
 const now = Date.now();
 const sameContext = state.chart.dailyMaContextKey === contextKey;
 const hasRequiredHistory = state.chart.dailyMaCandles.length >= Math.max(...DAILY_SMA_CONFIGS.map((config) => config.periodDays));
 if (
   !options.force &&
   sameContext &&
   hasRequiredHistory &&
   now - state.chart.dailyMaLoadedAt < DAILY_SMA_REFRESH_MS
 ) {
   return;
 }
 if (state.chart.dailyMaLoading && sameContext) return;
 const market = currentFuturesMarket();
 const requestId = state.chart.dailyMaRequestId + 1;
 state.chart.dailyMaRequestId = requestId;
 if (!sameContext) {
   state.chart.dailyMaCandles = [];
   state.chart.dailyMaLoadedAt = 0;
 }
 state.chart.dailyMaContextKey = contextKey;
 state.chart.dailyMaLoading = true;
 state.chart.dailyMaError = "";
 try {
   const candles = market.chartSource === "BINANCE"
     ? await fetchBinanceDailyMovingAverageCandles(market)
     : await fetchBybitDailyMovingAverageCandles(market);
   if (
     requestId !== state.chart.dailyMaRequestId ||
     contextKey !== state.chart.dailyMaContextKey ||
     contextKey !== dailyMovingAverageContextKey()
   ) {
     return;
   }
   state.chart.dailyMaCandles = candles;
   state.chart.dailyMaLoadedAt = Date.now();
   state.chart.dailyMaError = candles.length >= 200
     ? ""
     : `200일선 계산에 필요한 일봉이 부족합니다 (${candles.length}/200).`;
   drawChart();
 } catch (error) {
   if (requestId !== state.chart.dailyMaRequestId || contextKey !== state.chart.dailyMaContextKey) return;
   console.warn("daily moving average candle fetch failed", error);
   state.chart.dailyMaError = error && error.message ? error.message : "daily moving average candle error";
 } finally {
   if (requestId === state.chart.dailyMaRequestId) state.chart.dailyMaLoading = false;
 }
}
async function fetchSyntheticSubminuteFuturesCandles(market, seconds, limit = FUTURES_CANDLE_LIMIT) {
 const requestedCandles = Math.min(FUTURES_MAX_VISIBLE_CANDLES, limit);
 if (market.chartSource !== "BITHUMB") return [];
 const ticks = await collectAndStoreFuturesTradeTicks(market.code);
 const exactCandles = buildCandlesFromTradeTicks(ticks, seconds);
 const piecesPerMinute = Math.max(1, Math.round(60 / seconds));
 const minuteLimit = Math.ceil(requestedCandles / piecesPerMinute) + 2;
 const minuteCandles = await fetchBithumbFuturesCandles("1", market.code, minuteLimit);
 const backfillCandles = expandCandlesToSubminute(minuteCandles, seconds);
 return mergeCandlesByTime(backfillCandles, exactCandles).slice(-requestedCandles);
}
async function fetchBithumbFuturesCandles(unit, market, limit = FUTURES_CANDLE_LIMIT) {
 const requestedCandles = Math.min(FUTURES_MAX_VISIBLE_CANDLES, Math.max(limit, 1));
 const rows = await fetchBithumbFuturesCandleRows(unit, market, requestedCandles);
 return sanitizeChartCandles(
   rows,
   `Bithumb ${market} ${unit}m`,
   timeframeSeconds(unit),
   requestedCandles
 );
}
function formatBithumbCandleToParam(timestampMs) {
 const kst = new Date(timestampMs + 9 * 60 * 60 * 1000);
 return kst.toISOString().slice(0, 19).replace("T", " ");
}
async function fetchBithumbFuturesCandleRows(unit, market, targetCount) {
 const rows = [];
 let to = "";
 while (rows.length < targetCount) {
   const pageSize = Math.min(CANDLE_PAGE_SIZE, targetCount - rows.length);
   const url = new URL(`${BITHUMB_API_BASE}/candles/minutes/${unit}`);
   url.searchParams.set("market", market);
   url.searchParams.set("count", String(pageSize));
   if (to) url.searchParams.set("to", to);
   const page = await requestJson(url.toString());
   if (!Array.isArray(page) || !page.length) break;
   rows.push(...page);
   const oldest = page[page.length - 1];
   const oldestKst = oldest && oldest.candle_date_time_kst;
   const oldestUtc = oldest && oldest.candle_date_time_utc;
   const oldestMs = oldestKst
     ? parseExchangeDateTimeMs(oldestKst, null, 9 * 60)
     : oldestUtc
       ? parseExchangeDateTimeMs(oldestUtc, null, 0)
       : NaN;
   if (!Number.isFinite(oldestMs) || page.length < pageSize) break;
   to = formatBithumbCandleToParam(oldestMs - 1000);
 }
 return rows;
}
function currentRangeAssistantContext() {
 if (isFuturesMode()) {
   const market = currentFuturesMarket();
   const source = market.chartSource || "UNKNOWN";
   const symbol = market.binanceSymbol || market.bybitSymbol || market.code;
   return {
     marketMode: "futures",
     marketCode: market.code,
     source,
     symbol,
     market,
     key: `futures:${source}:${symbol}`
   };
 }
 const market = currentMarket();
 return {
   marketMode: "spot",
   marketCode: market.code,
   source: "UPBIT",
   symbol: market.code,
   market,
   key: `spot:UPBIT:${market.code}`
 };
}
function rangeAssistantCurrentPrice() {
 const ticker = activeTicker();
 const tickerPrice = finiteNumber(ticker && ticker.price, 0);
 if (tickerPrice > 0) return tickerPrice;
 const candles = activeCandles();
 const last = candles[candles.length - 1];
 return finiteNumber(last && last.close, 0);
}
function validateAndNormalizeCandles(candles, timeframeMinutes, limit = RANGE_ASSISTANT_CANDLE_COUNT) {
 const intervalSeconds = Math.max(60, Math.round(timeframeMinutes) * 60);
 const nowSeconds = Math.floor(Date.now() / 1000);
 const deduped = new Map();
 (Array.isArray(candles) ? candles : []).forEach((raw) => {
   const candle = normalizeCandle(raw);
   if (!isValidChartCandle(candle)) return;
   if (candle.time % intervalSeconds !== 0) return;
   if (candle.time + intervalSeconds > nowSeconds) return;
   deduped.set(candle.time, candle);
 });
 return [...deduped.values()]
   .sort((a, b) => a.time - b.time)
   .slice(-Math.max(1, Math.round(limit)));
}
async function fetchBybitRangeAssistantCandles(context, timeframeMinutes, targetCount) {
 const collected = [];
 let end = null;
 let previousOldest = Infinity;
 for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
   const confirmedCount = validateAndNormalizeCandles(collected, timeframeMinutes, targetCount).length;
   if (confirmedCount >= targetCount) break;
   const params = {
     category: "linear",
     symbol: context.symbol,
     interval: String(timeframeMinutes),
     limit: Math.min(1000, Math.max(2, targetCount - confirmedCount + 2))
   };
   if (Number.isFinite(end)) params.end = end;
   const data = await requestBybitJson("/market/kline", params);
   const rows = data && data.result && Array.isArray(data.result.list) ? data.result.list : [];
   if (!rows.length) break;
   rows.forEach((row) => {
     collected.push({
       time: Math.floor(parseChartNumber(row && row[0], 0) / 1000),
       open: parseChartNumber(row && row[1], NaN),
       high: parseChartNumber(row && row[2], NaN),
       low: parseChartNumber(row && row[3], NaN),
       close: parseChartNumber(row && row[4], NaN),
       volume: Math.max(0, parseChartNumber(row && row[5], 0)),
       value: Math.max(0, parseChartNumber(row && row[6], 0))
     });
   });
   const oldest = Math.min(...rows.map((row) => parseChartNumber(row && row[0], Infinity)));
   if (!Number.isFinite(oldest) || oldest >= previousOldest) break;
   previousOldest = oldest;
   end = oldest - 1;
 }
 return validateAndNormalizeCandles(collected, timeframeMinutes, targetCount);
}
async function fetchBinanceRangeAssistantCandles(context, timeframeMinutes, targetCount) {
 const collected = [];
 let endTime = null;
 let previousOldest = Infinity;
 for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
   const confirmedCount = validateAndNormalizeCandles(collected, timeframeMinutes, targetCount).length;
   if (confirmedCount >= targetCount) break;
   const params = {
     symbol: context.symbol,
     interval: binanceInterval(String(timeframeMinutes)),
     limit: Math.min(1500, Math.max(2, targetCount - confirmedCount + 2))
   };
   if (Number.isFinite(endTime)) params.endTime = endTime;
   const rows = await requestBinanceFuturesJson("/fapi/v1/klines", params);
   if (!Array.isArray(rows) || !rows.length) break;
   rows.map(normalizeBinanceKlineRow).filter(Boolean).forEach((candle) => collected.push(candle));
   const oldest = Math.min(...rows.map((row) => parseChartNumber(row && row[0], Infinity)));
   if (!Number.isFinite(oldest) || oldest >= previousOldest) break;
   previousOldest = oldest;
   endTime = oldest - 1;
 }
 return validateAndNormalizeCandles(collected, timeframeMinutes, targetCount);
}
async function fetchRangeAssistantCandles(context, timeframeMinutes) {
 const targetCount = RANGE_ASSISTANT_CANDLE_COUNT;
 if (context.marketMode === "spot") {
   const rows = await fetchCandlePages(String(timeframeMinutes), context.marketCode, targetCount + 8);
   return validateAndNormalizeCandles(rows, timeframeMinutes, targetCount);
 }
 if (context.source === "BINANCE") {
   return fetchBinanceRangeAssistantCandles(context, timeframeMinutes, targetCount);
 }
 if (context.source === "BYBIT") {
   return fetchBybitRangeAssistantCandles(context, timeframeMinutes, targetCount);
 }
 if (context.source === "BITHUMB") {
   const rows = await fetchBithumbFuturesCandleRows(String(timeframeMinutes), context.marketCode, targetCount + 8);
   return validateAndNormalizeCandles(rows, timeframeMinutes, targetCount);
 }
 throw new Error(`지원하지 않는 선물 데이터 소스: ${context.source}`);
}
function calculateATR(candles, period = RANGE_ASSISTANT_ATR_PERIOD) {
 const source = Array.isArray(candles) ? candles : [];
 const safePeriod = Math.max(1, Math.round(period));
 const atr = Array(source.length).fill(null);
 if (source.length < safePeriod) return atr;
 const trueRanges = source.map((candle, index) => {
   if (!candle) return NaN;
   if (index === 0) return candle.high - candle.low;
   const previousClose = source[index - 1].close;
   return Math.max(
     candle.high - candle.low,
     Math.abs(candle.high - previousClose),
     Math.abs(candle.low - previousClose)
   );
 });
 const seed = trueRanges.slice(0, safePeriod);
 if (!seed.every(Number.isFinite)) return atr;
 let previousAtr = seed.reduce((sum, value) => sum + value, 0) / safePeriod;
 atr[safePeriod - 1] = previousAtr;
 for (let index = safePeriod; index < source.length; index += 1) {
   if (!Number.isFinite(trueRanges[index])) continue;
   previousAtr = ((previousAtr * (safePeriod - 1)) + trueRanges[index]) / safePeriod;
   atr[index] = previousAtr;
 }
 return atr;
}
function calculatePivotWeight(pivot, candleCount) {
 const timeframeWeight = pivot.timeframe === "15m" ? 1.45 : 1;
 const ageBars = Math.max(0, candleCount - 1 - pivot.index);
 const recencyWeight = 0.35 + 0.65 * Math.exp(-ageBars / 220);
 const latestPivotBoost = pivot.latestPivotRank === 0 ? 1.25 : pivot.latestPivotRank === 1 ? 1.10 : 1;
 return timeframeWeight * recencyWeight * latestPivotBoost;
}
function nearlyEqualPivotPrice(a, b) {
 return Math.abs(a - b) <= Math.max(1e-10, Math.max(Math.abs(a), Math.abs(b)) * 1e-12);
}
function appendConfirmedPivot(pivots, pivot) {
 const previous = pivots[pivots.length - 1];
 if (
   previous &&
   previous.kind === pivot.kind &&
   pivot.index === previous.index + 1 &&
   nearlyEqualPivotPrice(previous.price, pivot.price)
 ) {
   pivots[pivots.length - 1] = pivot;
   return;
 }
 pivots.push(pivot);
}
function detectConfirmedPivots(candles, atrValues, timeframe, leftBars, rightBars) {
 const source = Array.isArray(candles) ? candles : [];
 const highs = [];
 const lows = [];
 for (let index = leftBars; index < source.length - rightBars; index += 1) {
   const candle = source[index];
   const atr = atrValues[index];
   if (!candle || !Number.isFinite(atr) || atr <= 0) continue;
   let pivotHigh = true;
   let pivotLow = true;
   for (let offset = -leftBars; offset <= rightBars; offset += 1) {
     if (offset === 0) continue;
     const neighbor = source[index + offset];
     if (!neighbor) {
       pivotHigh = false;
       pivotLow = false;
       break;
     }
     if (candle.high < neighbor.high) pivotHigh = false;
     if (candle.low > neighbor.low) pivotLow = false;
   }
   if (pivotHigh) {
     appendConfirmedPivot(highs, { kind: "high", price: candle.high, index, timestamp: candle.time, atr, timeframe });
   }
   if (pivotLow) {
     appendConfirmedPivot(lows, { kind: "low", price: candle.low, index, timestamp: candle.time, atr, timeframe });
   }
 }
 [highs, lows].forEach((pivots) => {
   [...pivots]
     .sort((a, b) => b.index - a.index)
     .forEach((pivot, rank) => {
       pivot.latestPivotRank = rank;
       pivot.weight = calculatePivotWeight(pivot, source.length);
     });
 });
 return highs.concat(lows).sort((a, b) => a.price - b.price || a.timestamp - b.timestamp || a.kind.localeCompare(b.kind));
}
function createPivotCluster(pivots) {
 const items = (Array.isArray(pivots) ? pivots : []).slice().sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
 const totalWeight = items.reduce((sum, pivot) => sum + positiveNumber(pivot.weight, 1), 0);
 const centerPrice = totalWeight > 0
   ? items.reduce((sum, pivot) => sum + pivot.price * positiveNumber(pivot.weight, 1), 0) / totalWeight
   : items.reduce((sum, pivot) => sum + pivot.price, 0) / Math.max(1, items.length);
 const fiveMinutePivotCount = items.filter((pivot) => pivot.timeframe === "5m").length;
 const fifteenMinutePivotCount = items.filter((pivot) => pivot.timeframe === "15m").length;
 return {
   centerPrice,
   pivots: items,
   pivotCount: items.length,
   fiveMinutePivotCount,
   fifteenMinutePivotCount,
   latestPivotTimestamp: items.reduce((latest, pivot) => Math.max(latest, pivot.timestamp), 0),
   timeframeLabel: fiveMinutePivotCount && fifteenMinutePivotCount ? "5m+15m" : fifteenMinutePivotCount ? "15m" : "5m"
 };
}
function clusterPivotPrices(pivots) {
 const sorted = (Array.isArray(pivots) ? pivots : []).slice().sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
 const clusters = [];
 sorted.forEach((pivot) => {
   const tolerance = Math.max(pivot.atr * 0.45, pivot.price * 0.0008);
   let bestIndex = -1;
   let bestDistance = Infinity;
   clusters.forEach((cluster, index) => {
     const distance = Math.abs(pivot.price - cluster.centerPrice);
     if (distance <= tolerance && distance < bestDistance) {
       bestIndex = index;
       bestDistance = distance;
     }
   });
   if (bestIndex < 0) {
     clusters.push(createPivotCluster([pivot]));
   } else {
     clusters[bestIndex] = createPivotCluster(clusters[bestIndex].pivots.concat(pivot));
   }
 });
 return clusters.sort((a, b) => a.centerPrice - b.centerPrice);
}
function mergeMultiTimeframeZones(fiveMinuteClusters, fifteenMinuteClusters, currentFiveAtr, currentFifteenAtr, currentPrice) {
 const clusters = fiveMinuteClusters.concat(fifteenMinuteClusters).sort((a, b) => a.centerPrice - b.centerPrice);
 const parent = clusters.map((_, index) => index);
 const find = (index) => {
   let root = index;
   while (parent[root] !== root) root = parent[root];
   while (parent[index] !== index) {
     const next = parent[index];
     parent[index] = root;
     index = next;
   }
   return root;
 };
 const union = (left, right) => {
   const leftRoot = find(left);
   const rightRoot = find(right);
   if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
 };
 const mergeTolerance = Math.max(currentFiveAtr * 0.55, currentFifteenAtr * 0.30, currentPrice * 0.001);
 for (let left = 0; left < clusters.length; left += 1) {
   for (let right = left + 1; right < clusters.length; right += 1) {
     if (clusters[right].centerPrice - clusters[left].centerPrice > mergeTolerance) break;
     const crossesTimeframes =
       (clusters[left].fiveMinutePivotCount > 0 && clusters[right].fifteenMinutePivotCount > 0) ||
       (clusters[left].fifteenMinutePivotCount > 0 && clusters[right].fiveMinutePivotCount > 0);
     if (crossesTimeframes) union(left, right);
   }
 }
 const groups = new Map();
 clusters.forEach((cluster, index) => {
   const root = find(index);
   if (!groups.has(root)) groups.set(root, []);
   groups.get(root).push(...cluster.pivots);
 });
 return [...groups.values()].map(createPivotCluster).sort((a, b) => a.centerPrice - b.centerPrice);
}
function calculateZoneBounds(cluster, currentFiveAtr, currentFifteenAtr, currentPrice) {
 const baseHalfWidth = Math.max(currentFiveAtr * 0.18, currentFifteenAtr * 0.10, currentPrice * 0.00035);
 const maxHalfWidth = Math.max(currentFiveAtr * 0.60, currentFifteenAtr * 0.35, currentPrice * 0.002);
 const totalWeight = cluster.pivots.reduce((sum, pivot) => sum + positiveNumber(pivot.weight, 1), 0);
 const variance = totalWeight > 0
   ? cluster.pivots.reduce((sum, pivot) => {
     const distance = pivot.price - cluster.centerPrice;
     return sum + distance * distance * positiveNumber(pivot.weight, 1);
   }, 0) / totalWeight
   : 0;
 const weightedDeviation = Math.sqrt(Math.max(0, variance));
 const halfRange = cluster.pivots.reduce((largest, pivot) => Math.max(largest, Math.abs(pivot.price - cluster.centerPrice)), 0);
 const halfWidth = clamp(Math.max(baseHalfWidth, weightedDeviation * 1.25, halfRange), baseHalfWidth, maxHalfWidth);
 return {
   ...cluster,
   lowerPrice: cluster.centerPrice - halfWidth,
   upperPrice: cluster.centerPrice + halfWidth,
   halfWidth,
   baseHalfWidth,
   maxHalfWidth
 };
}
function reactionTouchBounds(zone, atr) {
 const centerPrice = positiveNumber(zone && zone.centerPrice, 0);
 const safeAtr = positiveNumber(atr, 0);
 if (!centerPrice || !safeAtr) return null;
 const baseHalfWidth = Math.max(
   safeAtr * RANGE_ASSISTANT_REACTION_TOUCH_ATR_MULTIPLIER,
   centerPrice * RANGE_ASSISTANT_REACTION_TOUCH_PRICE_RATIO
 );
 const maxHalfWidth = Math.max(
   baseHalfWidth,
   Math.min(
     safeAtr * RANGE_ASSISTANT_REACTION_MAX_ATR_MULTIPLIER,
     centerPrice * RANGE_ASSISTANT_REACTION_MAX_PRICE_RATIO
   )
 );
 const requestedLower = Math.min(
   finiteNumber(zone && zone.lowerPrice, centerPrice),
   centerPrice - baseHalfWidth
 );
 const requestedUpper = Math.max(
   finiteNumber(zone && zone.upperPrice, centerPrice),
   centerPrice + baseHalfWidth
 );
 return {
   centerPrice,
   lowerPrice: Math.max(centerPrice - maxHalfWidth, requestedLower),
   upperPrice: Math.min(centerPrice + maxHalfWidth, requestedUpper),
   baseHalfWidth,
   maxHalfWidth
 };
}
function evaluateZoneReaction(candles, atrValues, zone, type, touchIndex) {
 const source = Array.isArray(candles) ? candles : [];
 const candle = source[touchIndex];
 const atr = atrValues[touchIndex];
 const bounds = reactionTouchBounds(zone, atr);
 if (!candle || !bounds) return null;
 const touchesZone = candle.high >= bounds.lowerPrice && candle.low <= bounds.upperPrice;
 const closesOnValidSide = type === "support"
   ? candle.close >= bounds.lowerPrice
   : candle.close <= bounds.upperPrice;
 if (!touchesZone || !closesOnValidSide) return null;
 const reactionDistance = atr * RANGE_ASSISTANT_REACTION_MOVE_ATR_MULTIPLIER;
 const targetPrice = type === "support"
   ? bounds.centerPrice + reactionDistance
   : bounds.centerPrice - reactionDistance;
 let bestExcursion = 0;
 const lastIndex = Math.min(source.length - 1, touchIndex + RANGE_ASSISTANT_REACTION_LOOKAHEAD_BARS);
 for (let index = touchIndex + 1; index <= lastIndex; index += 1) {
   const future = source[index];
   const futureAtr = positiveNumber(atrValues[index], atr);
   if (!future) continue;
   const breakBuffer = Math.max(
     futureAtr * RANGE_ASSISTANT_REACTION_BREAK_ATR_MULTIPLIER,
     bounds.centerPrice * RANGE_ASSISTANT_REACTION_BREAK_PRICE_RATIO
   );
   const stronglyBroken = type === "support"
     ? future.close < bounds.lowerPrice - breakBuffer
     : future.close > bounds.upperPrice + breakBuffer;
   if (stronglyBroken) return null;
   const excursion = type === "support"
     ? future.high - bounds.centerPrice
     : bounds.centerPrice - future.low;
   bestExcursion = Math.max(bestExcursion, excursion);
   const reacted = type === "support" ? future.high >= targetPrice : future.low <= targetPrice;
   if (reacted) {
     return {
       type,
       touchIndex,
       reactionIndex: index,
       timestamp: candle.time,
       reactionTimestamp: future.time,
       barsToReact: index - touchIndex,
       atr,
       excursionAtr: bestExcursion / atr
     };
   }
 }
 return null;
}
function mergeIndependentReactionEvents(events) {
 const merged = [];
 (Array.isArray(events) ? events : [])
   .filter((event) => event && Number.isFinite(event.touchIndex))
   .slice()
   .sort((a, b) => a.touchIndex - b.touchIndex || b.excursionAtr - a.excursionAtr)
   .forEach((event) => {
     const previous = merged[merged.length - 1];
     if (!previous || event.touchIndex - previous.touchIndex >= RANGE_ASSISTANT_REACTION_MIN_BAR_GAP) {
       merged.push(event);
       return;
     }
     if (positiveNumber(event.excursionAtr, 0) > positiveNumber(previous.excursionAtr, 0)) {
       merged[merged.length - 1] = event;
     }
   });
 return merged;
}
function calculateReactionEvidenceScore(events) {
 return (Array.isArray(events) ? events : []).reduce(
   (sum, event) => sum + positiveNumber(event.evidenceScore, 0),
   0
 );
}
function detectFifteenMinuteZoneReactions(candles, atrValues, zone, type) {
 const source = Array.isArray(candles) ? candles : [];
 const detected = [];
 for (let index = 1; index < source.length - 1; index += 1) {
   const atr = atrValues[index];
   const previousAtr = positiveNumber(atrValues[index - 1], atr);
   const bounds = reactionTouchBounds(zone, atr);
   const previousBounds = reactionTouchBounds(zone, previousAtr);
   const candle = source[index];
   const previous = source[index - 1];
   if (!candle || !previous || !bounds || !previousBounds) continue;
   const approachedFromValidSide = type === "support"
     ? previous.low > previousBounds.upperPrice
     : previous.high < previousBounds.lowerPrice;
   if (!approachedFromValidSide) continue;
   const event = evaluateZoneReaction(source, atrValues, zone, type, index);
   if (event) detected.push(event);
 }
 return mergeIndependentReactionEvents(detected).map((event) => {
   const ageBars = Math.max(0, source.length - 1 - event.touchIndex);
   const recencyWeight = 0.35 + 0.65 * Math.exp(-ageBars / 220);
   const strengthWeight = clamp(event.excursionAtr / RANGE_ASSISTANT_REACTION_MOVE_ATR_MULTIPLIER, 1, 2);
   return { ...event, evidenceScore: recencyWeight * strengthWeight };
 });
}
function attachFifteenMinuteZoneReactions(zones, fifteenMinuteCandles, fifteenAtr) {
 return (Array.isArray(zones) ? zones : []).map((zone) => {
   const supportReactionEvents = detectFifteenMinuteZoneReactions(
     fifteenMinuteCandles,
     fifteenAtr,
     zone,
     "support"
   );
   const resistanceReactionEvents = detectFifteenMinuteZoneReactions(
     fifteenMinuteCandles,
     fifteenAtr,
     zone,
     "resistance"
   );
   return {
     ...zone,
     supportReactionEvents,
     resistanceReactionEvents,
     supportReactionCount: supportReactionEvents.length,
     resistanceReactionCount: resistanceReactionEvents.length,
     supportReactionScore: calculateReactionEvidenceScore(supportReactionEvents),
     resistanceReactionScore: calculateReactionEvidenceScore(resistanceReactionEvents)
   };
 });
}
function calculateZoneScores(zones) {
 const scored = (Array.isArray(zones) ? zones : []).map((zone) => {
   const pivotWeightSum = zone.pivots.reduce((sum, pivot) => sum + positiveNumber(pivot.weight, 0), 0);
   const touchBonus = Math.sqrt(zone.pivotCount) * 0.8;
   const multiTimeframeBoost = zone.fiveMinutePivotCount > 0 && zone.fifteenMinutePivotCount > 0 ? 1.30 : 1;
   const rawScore = (pivotWeightSum + touchBonus) * multiTimeframeBoost;
   return { ...zone, rawScore };
 });
 const maxRawScore = scored.reduce((highest, zone) => Math.max(highest, zone.rawScore), 0);
 return scored.map((zone, index) => ({
   id: `range-zone-${index}-${Math.round(zone.centerPrice * 10000)}-${zone.latestPivotTimestamp}`,
   centerPrice: zone.centerPrice,
   lowerPrice: zone.lowerPrice,
   upperPrice: zone.upperPrice,
   type: "neutral",
   score: maxRawScore > 0 ? Math.round(clamp((zone.rawScore / maxRawScore) * 100, 0, 100)) : 0,
   displayScore: 0,
   pivotCount: zone.pivotCount,
   fiveMinutePivotCount: zone.fiveMinutePivotCount,
   fifteenMinutePivotCount: zone.fifteenMinutePivotCount,
   latestPivotTimestamp: zone.latestPivotTimestamp,
   timeframeLabel: zone.timeframeLabel,
   supportReactionEvents: zone.supportReactionEvents || [],
   resistanceReactionEvents: zone.resistanceReactionEvents || [],
   supportReactionCount: positiveNumber(zone.supportReactionCount, 0),
   resistanceReactionCount: positiveNumber(zone.resistanceReactionCount, 0),
   supportReactionScore: positiveNumber(zone.supportReactionScore, 0),
   resistanceReactionScore: positiveNumber(zone.resistanceReactionScore, 0),
   distancePercent: 0
 }));
}
function classifyZonesByCurrentPrice(zones, currentPrice) {
 if (!Number.isFinite(currentPrice) || currentPrice <= 0) return [];
 return (Array.isArray(zones) ? zones : []).map((zone) => {
   const type = zone.upperPrice < currentPrice
     ? "support"
     : zone.lowerPrice > currentPrice
       ? "resistance"
       : "neutral";
   const distancePercent = Math.abs(zone.centerPrice - currentPrice) / currentPrice;
   const distanceWeight = 1 / (1 + distancePercent * 35);
   const reactionEvents = type === "support"
     ? zone.supportReactionEvents || []
     : type === "resistance" ? zone.resistanceReactionEvents || [] : [];
   const reactionCount = reactionEvents.length;
   const reactionScore = type === "support"
     ? positiveNumber(zone.supportReactionScore, 0)
     : type === "resistance" ? positiveNumber(zone.resistanceReactionScore, 0) : 0;
   const reactionBoost = 1 + Math.min(0.9, reactionScore * 0.05 + Math.max(0, reactionCount - 3) * 0.12);
   return {
     ...zone,
     type,
     distancePercent,
     reactionEvents,
     reactionCount,
     reactionScore,
     reactionQualified: reactionCount >= RANGE_ASSISTANT_MIN_INDEPENDENT_REACTIONS,
     displayScore: zone.score * distanceWeight * reactionBoost
   };
 });
}
function reactionEventOverlapRatio(leftEvents, rightEvents) {
 const left = (Array.isArray(leftEvents) ? leftEvents : [])
   .filter((event) => event && Number.isFinite(event.touchIndex))
   .slice()
   .sort((a, b) => a.touchIndex - b.touchIndex);
 const right = (Array.isArray(rightEvents) ? rightEvents : [])
   .filter((event) => event && Number.isFinite(event.touchIndex))
   .slice()
   .sort((a, b) => a.touchIndex - b.touchIndex);
 if (!left.length || !right.length) return 0;
 const usedRightIndexes = new Set();
 let matched = 0;
 left.forEach((leftEvent) => {
   let bestIndex = -1;
   let bestDistance = Infinity;
   right.forEach((rightEvent, rightIndex) => {
     if (usedRightIndexes.has(rightIndex)) return;
     const distance = Math.abs(leftEvent.touchIndex - rightEvent.touchIndex);
     if (
       distance <= RANGE_ASSISTANT_REACTION_DUPLICATE_EVENT_BAR_TOLERANCE &&
       distance < bestDistance
     ) {
       bestIndex = rightIndex;
       bestDistance = distance;
     }
   });
   if (bestIndex < 0) return;
   usedRightIndexes.add(bestIndex);
   matched += 1;
 });
 return matched / Math.min(left.length, right.length);
}
function compareReactionValidatedZones(left, right) {
 return (
   positiveNumber(right.reactionCount, 0) - positiveNumber(left.reactionCount, 0) ||
   positiveNumber(right.reactionScore, 0) - positiveNumber(left.reactionScore, 0) ||
   positiveNumber(right.displayScore, 0) - positiveNumber(left.displayScore, 0) ||
   positiveNumber(right.score, 0) - positiveNumber(left.score, 0) ||
   positiveNumber(left.distancePercent, Infinity) - positiveNumber(right.distancePercent, Infinity)
 );
}
function mergeNearbySupportResistanceLevels(zones, currentPrice, currentFiveMinuteAtr) {
 const mergeTolerance = Math.max(
   positiveNumber(currentFiveMinuteAtr, 0) * 0.5,
   positiveNumber(currentPrice, 0) * 0.0008
 );
 const groups = [];
 (Array.isArray(zones) ? zones : [])
   .filter((zone) => zone && zone.reactionQualified)
   .slice()
   .sort(compareReactionValidatedZones)
   .forEach((zone) => {
     let bestGroupIndex = -1;
     let bestOverlapRatio = -1;
     let bestCenterDistance = Infinity;
     groups.forEach((group, groupIndex) => {
       const centerDistance = Math.abs(zone.centerPrice - group.anchor.centerPrice);
       if (centerDistance > mergeTolerance) return;
       const overlapRatio = reactionEventOverlapRatio(zone.reactionEvents, group.anchor.reactionEvents);
       if (overlapRatio < RANGE_ASSISTANT_REACTION_DUPLICATE_OVERLAP_RATIO) return;
       if (
         overlapRatio > bestOverlapRatio ||
         (overlapRatio === bestOverlapRatio && centerDistance < bestCenterDistance)
       ) {
         bestGroupIndex = groupIndex;
         bestOverlapRatio = overlapRatio;
         bestCenterDistance = centerDistance;
       }
     });
     if (bestGroupIndex >= 0) {
       groups[bestGroupIndex].items.push(zone);
     } else {
       groups.push({ anchor: zone, items: [zone] });
     }
   });
 return groups.map((group, index) => {
   const totalWeight = group.items.reduce(
     (sum, zone) => sum + Math.max(1, positiveNumber(zone.score, 0)),
     0
   );
   const weightedPrice = group.items.reduce(
     (sum, zone) => sum + zone.centerPrice * Math.max(1, positiveNumber(zone.score, 0)),
     0
   );
   const centerPrice = weightedPrice / Math.max(1, totalWeight);
   const dominant = group.anchor;
   const score = group.items.reduce((highest, zone) => Math.max(highest, zone.score), 0);
   const reactionEvents = mergeIndependentReactionEvents(
     group.items.flatMap((zone) => zone.reactionEvents || [])
   );
   const reactionCount = reactionEvents.length;
   const reactionScore = calculateReactionEvidenceScore(reactionEvents);
   const fiveMinutePivotCount = group.items.reduce((sum, zone) => sum + zone.fiveMinutePivotCount, 0);
   const fifteenMinutePivotCount = group.items.reduce((sum, zone) => sum + zone.fifteenMinutePivotCount, 0);
   const distancePercent = Math.abs(centerPrice - currentPrice) / currentPrice;
   const distanceWeight = 1 / (1 + distancePercent * 35);
   const reactionBoost = 1 + Math.min(0.9, reactionScore * 0.05 + Math.max(0, reactionCount - 3) * 0.12);
   return {
     ...dominant,
     id: `range-level-${dominant.type}-${index}-${Math.round(centerPrice * 10000)}`,
     centerPrice,
     lowerPrice: Math.min(...group.items.map((zone) => zone.lowerPrice)),
     upperPrice: Math.max(...group.items.map((zone) => zone.upperPrice)),
     score,
     displayScore: score * distanceWeight * reactionBoost,
     reactionEvents,
     reactionCount,
     reactionScore,
     reactionQualified: reactionCount >= RANGE_ASSISTANT_MIN_INDEPENDENT_REACTIONS,
     pivotCount: group.items.reduce((sum, zone) => sum + zone.pivotCount, 0),
     fiveMinutePivotCount,
     fifteenMinutePivotCount,
     latestPivotTimestamp: Math.max(...group.items.map((zone) => zone.latestPivotTimestamp)),
     timeframeLabel: fiveMinutePivotCount > 0 && fifteenMinutePivotCount > 0
       ? "5m+15m"
       : fifteenMinutePivotCount > 0 ? "15m" : "5m",
     distancePercent
   };
 });
}
function selectDiversifiedRangeLevels(candidates, currentPrice, currentFiveMinuteAtr) {
 const ranked = (Array.isArray(candidates) ? candidates : []).slice().sort(compareReactionValidatedZones);
 if (ranked.length <= RANGE_ASSISTANT_VISIBLE_LEVELS_PER_SIDE) return ranked;
 const minimumSpacing = Math.max(
   positiveNumber(currentFiveMinuteAtr, 0) * RANGE_ASSISTANT_DISPLAY_SPACING_FIVE_ATR_MULTIPLIER,
   positiveNumber(currentPrice, 0) * RANGE_ASSISTANT_DISPLAY_SPACING_PRICE_RATIO
 );
 const selected = [ranked[0]];
 const remaining = ranked.slice(1);
 while (selected.length < RANGE_ASSISTANT_VISIBLE_LEVELS_PER_SIDE && remaining.length) {
   const distances = remaining.map((candidate) => Math.min(
     ...selected.map((existing) => Math.abs(candidate.centerPrice - existing.centerPrice))
   ));
   const hasSeparatedCandidate = distances.some((distance) => distance >= minimumSpacing);
   let bestIndex = -1;
   let bestPriority = -Infinity;
   remaining.forEach((candidate, index) => {
     const distance = distances[index];
     if (hasSeparatedCandidate && distance < minimumSpacing) return;
     const quality =
       positiveNumber(candidate.reactionCount, 0) +
       positiveNumber(candidate.reactionScore, 0) * 0.25 +
       positiveNumber(candidate.score, 0) * 0.05;
     const distanceUnits = distance / Math.max(1, minimumSpacing);
     const priority = quality * distanceUnits * distanceUnits;
     if (
       priority > bestPriority ||
       (priority === bestPriority && bestIndex >= 0 && compareReactionValidatedZones(candidate, remaining[bestIndex]) < 0)
     ) {
       bestIndex = index;
       bestPriority = priority;
     }
   });
   if (bestIndex < 0) bestIndex = 0;
   selected.push(remaining.splice(bestIndex, 1)[0]);
 }
 return selected;
}
function selectVisibleSupportResistanceLevels(zones, currentPrice, currentFiveMinuteAtr) {
 const classified = classifyZonesByCurrentPrice(zones, currentPrice);
 const supportCandidates = mergeNearbySupportResistanceLevels(
   classified.filter((zone) => zone.type === "support" && zone.reactionQualified),
   currentPrice,
   currentFiveMinuteAtr
 ).sort(compareReactionValidatedZones);
 const resistanceCandidates = mergeNearbySupportResistanceLevels(
   classified.filter((zone) => zone.type === "resistance" && zone.reactionQualified),
   currentPrice,
   currentFiveMinuteAtr
 ).sort(compareReactionValidatedZones);
 const addLabels = (candidates, prefix) => selectDiversifiedRangeLevels(
   candidates,
   currentPrice,
   currentFiveMinuteAtr
 )
   .sort((a, b) => a.distancePercent - b.distancePercent)
   .map((zone, index) => ({ ...zone, label: `${prefix}${index + 1}` }));
 return {
   support: addLabels(supportCandidates, "S"),
   resistance: addLabels(resistanceCandidates, "R"),
   supportCandidateCount: supportCandidates.length,
   resistanceCandidateCount: resistanceCandidates.length
 };
}
function analyzeRangeAssistantCandles(fiveMinuteCandles, fifteenMinuteCandles, currentPrice) {
 const fiveAtr = calculateATR(fiveMinuteCandles, RANGE_ASSISTANT_ATR_PERIOD);
 const fifteenAtr = calculateATR(fifteenMinuteCandles, RANGE_ASSISTANT_ATR_PERIOD);
 const currentFiveAtr = [...fiveAtr].reverse().find(Number.isFinite);
 const currentFifteenAtr = [...fifteenAtr].reverse().find(Number.isFinite);
 if (!Number.isFinite(currentFiveAtr) || !Number.isFinite(currentFifteenAtr)) {
   return { zones: [], currentFiveMinuteAtr: 0 };
 }
 const fivePivots = detectConfirmedPivots(fiveMinuteCandles, fiveAtr, "5m", 4, 4);
 const fifteenPivots = detectConfirmedPivots(fifteenMinuteCandles, fifteenAtr, "15m", 3, 3);
 const mergedClusters = mergeMultiTimeframeZones(
   clusterPivotPrices(fivePivots),
   clusterPivotPrices(fifteenPivots),
   currentFiveAtr,
   currentFifteenAtr,
   currentPrice
 );
 const bounded = mergedClusters.map((cluster) => calculateZoneBounds(
   cluster,
   currentFiveAtr,
   currentFifteenAtr,
   currentPrice
 ));
 const reactionVerified = attachFifteenMinuteZoneReactions(bounded, fifteenMinuteCandles, fifteenAtr);
 return {
   zones: calculateZoneScores(reactionVerified),
   currentFiveMinuteAtr: currentFiveAtr
 };
}
function saveRangeAssistantPreference() {
 try {
   localStorage.setItem(RANGE_ASSISTANT_STORAGE_KEY, String(state.rangeAssistant.enabled));
 } catch (error) {
   console.warn("range assistant preference save failed", error);
 }
}
function formatRangeAssistantCalculationTime(timestamp) {
 if (!timestamp) return "-";
 try {
   return new Intl.DateTimeFormat("ko-KR", {
     timeZone: KST_TIME_ZONE,
     hour: "2-digit",
     minute: "2-digit",
     hour12: false
   }).format(new Date(timestamp));
 } catch (error) {
   return new Date(timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
 }
}
function renderRangeAssistantControls() {
 const assistant = state.rangeAssistant;
 if (!el.rangeAssistantBtn || !el.rangeAssistantStatus) return;
 el.rangeAssistantBtn.classList.toggle("active", assistant.enabled);
 el.rangeAssistantBtn.classList.toggle("loading", assistant.loading);
 el.rangeAssistantBtn.setAttribute("aria-pressed", String(assistant.enabled));
 setText(el.rangeAssistantBtn, assistant.enabled ? "박스권 ON" : "박스권 OFF");
 el.rangeAssistantStatus.hidden = !assistant.enabled;
 if (!assistant.enabled) return;
 let statusState = "ready";
 let message = "자동 지지·저항선 대기 중";
 if (assistant.error) {
   statusState = "error";
   message = assistant.error;
 } else if (assistant.loading) {
   statusState = "loading";
   message = assistant.zones.length ? "새 확정봉 분석 중… · 이전 선 유지" : "자동선 분석 중…";
 } else if (assistant.statusMessage) {
   statusState = assistant.zones.length ? "ready" : "error";
   message = assistant.statusMessage;
 } else if (assistant.lastCalculatedAt) {
   const shortages = [];
   if (assistant.supportCandidateCount < 2) shortages.push("지지선 후보 부족");
   if (assistant.resistanceCandidateCount < 2) shortages.push("저항선 후보 부족");
   message = `5분 ${assistant.candleCounts.five.toLocaleString("ko-KR")} · 15분 ${assistant.candleCounts.fifteen.toLocaleString("ko-KR")} · ${formatRangeAssistantCalculationTime(assistant.lastCalculatedAt)} 계산`;
   if (shortages.length) message += ` · ${shortages.join(" · ")}`;
 }
 el.rangeAssistantStatus.dataset.state = statusState;
 setText(el.rangeAssistantStatus, message);
}
function clearSupportResistanceOverlay() {
 state.rangeAssistant.visibleLevels = [];
}
function clearRangeAssistantTimer() {
 if (!state.rangeAssistant.refreshTimer) return;
 clearTimeout(state.rangeAssistant.refreshTimer);
 state.rangeAssistant.refreshTimer = null;
}
function resetRangeAssistantForContext() {
 const assistant = state.rangeAssistant;
 clearRangeAssistantTimer();
 assistant.requestId += 1;
 assistant.loading = false;
 assistant.error = "";
 assistant.statusMessage = "";
 assistant.contextKey = currentRangeAssistantContext().key;
 assistant.analysisKey = "";
 assistant.zones = [];
 assistant.visibleLevels = [];
 assistant.currentFiveMinuteAtr = 0;
 assistant.supportCandidateCount = 0;
 assistant.resistanceCandidateCount = 0;
 assistant.candleCounts = { five: 0, fifteen: 0 };
 assistant.lastFiveMinuteTimestamp = 0;
 assistant.lastFifteenMinuteTimestamp = 0;
 assistant.lastCalculatedAt = 0;
 renderRangeAssistantControls();
}
function scheduleRangeAssistantRefresh(delayMs) {
 clearRangeAssistantTimer();
 if (!state.rangeAssistant.enabled) return;
 let delay = finiteNumber(delayMs, 0);
 if (delay <= 0) {
   const now = Date.now();
   const fiveMinutesMs = 5 * 60 * 1000;
   const nextClose = (Math.floor(now / fiveMinutesMs) + 1) * fiveMinutesMs + RANGE_ASSISTANT_REFRESH_GRACE_MS;
   delay = Math.max(1000, nextClose - now);
 }
 state.rangeAssistant.refreshTimer = setTimeout(() => {
   state.rangeAssistant.refreshTimer = null;
   refreshRangeAssistantData({ silent: true });
 }, delay);
}
function trimRangeAssistantCache() {
 const cache = state.rangeAssistant.cache;
 while (cache.size > RANGE_ASSISTANT_MAX_CACHE_ENTRIES) {
   const oldestKey = cache.keys().next().value;
   cache.delete(oldestKey);
 }
}
function toggleRangeAssistant() {
 const assistant = state.rangeAssistant;
 assistant.enabled = !assistant.enabled;
 saveRangeAssistantPreference();
 if (!assistant.enabled) {
   assistant.requestId += 1;
   assistant.loading = false;
   clearRangeAssistantTimer();
   clearSupportResistanceOverlay();
   renderRangeAssistantControls();
   drawChart();
   return;
 }
 const context = currentRangeAssistantContext();
 if (assistant.contextKey !== context.key) resetRangeAssistantForContext();
 renderRangeAssistantControls();
 drawChart();
 refreshRangeAssistantData({ silent: assistant.zones.length > 0 });
}
async function refreshRangeAssistantData(options = {}) {
 const assistant = state.rangeAssistant;
 if (!assistant.enabled && !options.force) return;
 const context = currentRangeAssistantContext();
 if (assistant.contextKey !== context.key) resetRangeAssistantForContext();
 const requestId = ++assistant.requestId;
 assistant.contextKey = context.key;
 assistant.loading = true;
 assistant.error = "";
 assistant.statusMessage = "";
 renderRangeAssistantControls();
 if (!assistant.zones.length) {
   clearSupportResistanceOverlay();
   drawChart();
 }
 try {
   const [fiveResult, fifteenResult] = await Promise.allSettled([
     fetchRangeAssistantCandles(context, 5),
     fetchRangeAssistantCandles(context, 15)
   ]);
   if (requestId !== assistant.requestId || !assistant.enabled || currentRangeAssistantContext().key !== context.key) return;
   const errors = [];
   if (fiveResult.status === "rejected") errors.push("5분봉 데이터 불러오기 실패");
   if (fifteenResult.status === "rejected") errors.push("15분봉 데이터 불러오기 실패");
   if (errors.length) throw new Error(errors.join(" · "));
   const fiveMinuteCandles = fiveResult.value;
   const fifteenMinuteCandles = fifteenResult.value;
   assistant.candleCounts = { five: fiveMinuteCandles.length, fifteen: fifteenMinuteCandles.length };
   if (fiveMinuteCandles.length < RANGE_ASSISTANT_CANDLE_COUNT || fifteenMinuteCandles.length < RANGE_ASSISTANT_CANDLE_COUNT) {
     assistant.zones = [];
     assistant.currentFiveMinuteAtr = 0;
     clearSupportResistanceOverlay();
     assistant.statusMessage = `데이터 부족 · 5분봉 ${fiveMinuteCandles.length.toLocaleString("ko-KR")}개 / 15분봉 ${fifteenMinuteCandles.length.toLocaleString("ko-KR")}개`;
     assistant.loading = false;
     renderRangeAssistantControls();
     drawChart();
     scheduleRangeAssistantRefresh(60000);
     return;
   }
   const lastFive = fiveMinuteCandles[fiveMinuteCandles.length - 1].time;
   const lastFifteen = fifteenMinuteCandles[fifteenMinuteCandles.length - 1].time;
   const analysisKey = `${context.key}:${lastFive}:${lastFifteen}`;
   const fallbackPrice = finiteNumber(fiveMinuteCandles[fiveMinuteCandles.length - 1].close, 0);
   const currentPrice = positiveNumber(rangeAssistantCurrentPrice(), fallbackPrice);
   if (!Number.isFinite(currentPrice) || currentPrice <= 0) throw new Error("현재가를 확인할 수 없어 박스권 표시를 중단했습니다.");
   let cached = assistant.cache.get(analysisKey);
   if (!cached || options.force) {
     const analysis = analyzeRangeAssistantCandles(fiveMinuteCandles, fifteenMinuteCandles, currentPrice);
     cached = {
       zones: analysis.zones,
       currentFiveMinuteAtr: analysis.currentFiveMinuteAtr,
       calculatedAt: Date.now()
     };
     assistant.cache.set(analysisKey, cached);
     trimRangeAssistantCache();
   }
   assistant.analysisKey = analysisKey;
   assistant.zones = cached.zones;
   assistant.currentFiveMinuteAtr = positiveNumber(cached.currentFiveMinuteAtr, 0);
   assistant.lastCalculatedAt = cached.calculatedAt;
   assistant.lastFiveMinuteTimestamp = lastFive;
   assistant.lastFifteenMinuteTimestamp = lastFifteen;
   assistant.loading = false;
   assistant.error = "";
   assistant.statusMessage = "";
   renderRangeAssistantControls();
   drawChart();
   scheduleRangeAssistantRefresh();
 } catch (error) {
   if (requestId !== assistant.requestId || !assistant.enabled || currentRangeAssistantContext().key !== context.key) return;
   console.warn("range assistant refresh failed", error);
   assistant.loading = false;
   assistant.error = error && error.message ? error.message : "박스권 데이터 분석 실패";
   renderRangeAssistantControls();
   drawChart();
   scheduleRangeAssistantRefresh(60000);
 }
}
async function fetchBithumbTradeTicks(market, count = 120) {
 const url = new URL(`${BITHUMB_API_BASE}/trades/ticks`);
 url.searchParams.set("market", market);
 url.searchParams.set("count", String(Math.min(120, Math.max(1, Math.round(count)))));
 const data = await requestJson(url.toString());
 if (Array.isArray(data)) return data;
 if (data && Array.isArray(data.data)) return data.data;
 if (data && Array.isArray(data.value)) return data.value;
 return [];
}
function futuresTickStorageKey(market) {
 return `${FUTURES_TICK_STORAGE_PREFIX}.${normalizeFuturesMarketCode(market)}`;
}
function normalizeStoredFuturesTick(tick) {
 const time = finiteNumber(tick && tick.time, parseBithumbTradeTickTime(tick));
 const price = finiteNumber(tick && tick.price, finiteNumber(tick && tick.trade_price, NaN));
 const volume = Math.max(0, finiteNumber(tick && tick.volume, finiteNumber(tick && tick.trade_volume, 0)));
 if (!Number.isFinite(time) || !Number.isFinite(price) || price <= 0) return null;
 const exchangeId = tick && (tick.id || tick.sequential_id);
 return {
   id: String(exchangeId || `${time}:${price}:${volume}`),
   time: Math.floor(time),
   price,
   volume
 };
}
function readStoredFuturesTicks(market) {
 return (Array.isArray(readJson(futuresTickStorageKey(market), [])) ? readJson(futuresTickStorageKey(market), []) : [])
   .map(normalizeStoredFuturesTick)
   .filter(Boolean)
   .sort((a, b) => a.time - b.time);
}
function storeFuturesTradeTicks(marketCode, incomingTicks) {
 const merged = new Map();
 [...readStoredFuturesTicks(marketCode), ...(Array.isArray(incomingTicks) ? incomingTicks : [])]
   .map(normalizeStoredFuturesTick)
   .filter(Boolean)
   .forEach((tick) => merged.set(tick.id, tick));
 const ticks = [...merged.values()].sort((a, b) => a.time - b.time).slice(-FUTURES_MAX_STORED_TICKS);
 trySaveJson(futuresTickStorageKey(marketCode), ticks);
 return ticks;
}
async function collectAndStoreFuturesTradeTicks(marketCode = currentFuturesMarket().code) {
 const market = futuresMarketByCode(marketCode);
 if (!market || market.chartSource !== "BITHUMB") return [];
 if (state.futures.collectingTradeTicks) return readStoredFuturesTicks(marketCode);
 state.futures.collectingTradeTicks = true;
 try {
   const ticks = storeFuturesTradeTicks(marketCode, await fetchBithumbTradeTicks(marketCode, 120));
   if (isFuturesMode() && currentFuturesMarket().code === marketCode && normalizeTimeframe(state.timeframe).endsWith("s")) {
     state.futures.candles = mergeCandlesByTime(
       state.futures.candles,
       buildCandlesFromTradeTicks(ticks, timeframeSeconds(state.timeframe))
     ).slice(-FUTURES_CANDLE_LIMIT);
     renderChartRangeControls();
     drawChart();
   }
   return ticks;
 } catch (error) {
   console.warn("Bithumb tick collection failed", error);
   return readStoredFuturesTicks(marketCode);
 } finally {
   state.futures.collectingTradeTicks = false;
 }
}
function parseBithumbTradeTickTime(tick) {
 const timestamp = finiteNumber(tick && tick.timestamp, NaN);
 if (Number.isFinite(timestamp)) return timestamp > 100000000000 ? Math.floor(timestamp / 1000) : Math.floor(timestamp);
 const date = tick && tick.trade_date_utc;
 const time = tick && tick.trade_time_utc;
 const parsed = date && time ? parseExchangeDateTimeMs(date, time, 0) : NaN;
 return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : NaN;
}
function buildCandlesFromTradeTicks(ticks, seconds) {
 const sliceSeconds = Math.max(1, Math.round(seconds));
 const buckets = new Map();
 ticks
   .map((tick) => {
     const time = parseBithumbTradeTickTime(tick);
     const price = finiteNumber(tick && tick.trade_price, NaN);
     const volume = Math.max(0, finiteNumber(tick && tick.trade_volume, 0));
     return Number.isFinite(time) && Number.isFinite(price) && price > 0 ? { time, price, volume } : null;
   })
   .filter(Boolean)
   .sort((a, b) => a.time - b.time)
   .forEach((tick) => {
     const bucketTime = Math.floor(tick.time / sliceSeconds) * sliceSeconds;
     const existing = buckets.get(bucketTime);
     if (!existing) {
       buckets.set(bucketTime, {
         time: bucketTime,
         open: tick.price,
         high: tick.price,
         low: tick.price,
         close: tick.price,
         volume: tick.volume,
         value: tick.volume * tick.price
       });
       return;
     }
     existing.high = Math.max(existing.high, tick.price);
     existing.low = Math.min(existing.low, tick.price);
     existing.close = tick.price;
     existing.volume += tick.volume;
     existing.value += tick.volume * tick.price;
   });
 return [...buckets.values()].sort((a, b) => a.time - b.time);
}
function mergeCandlesByTime(baseCandles, overlayCandles) {
 const candles = new Map();
 baseCandles.forEach((candle) => {
   if (candle && candle.time > 0) candles.set(candle.time, candle);
 });
 overlayCandles.forEach((candle) => {
   if (candle && candle.time > 0) candles.set(candle.time, candle);
 });
 return [...candles.values()].sort((a, b) => a.time - b.time);
}
function aggregateCandles(candles, minutes) {
 const bucketSeconds = Math.max(1, Math.round(minutes)) * 60;
 const buckets = new Map();
 candles
   .filter((candle) => candle && candle.time > 0)
   .sort((a, b) => a.time - b.time)
   .forEach((candle) => {
     const bucketTime = Math.floor(candle.time / bucketSeconds) * bucketSeconds;
     const existing = buckets.get(bucketTime);
     if (!existing) {
       buckets.set(bucketTime, { ...candle, time: bucketTime });
       return;
     }
     existing.high = Math.max(existing.high, candle.high);
     existing.low = Math.min(existing.low, candle.low);
     existing.close = candle.close;
     existing.volume += finiteNumber(candle.volume, 0);
     existing.value += finiteNumber(candle.value, 0);
   });
 return [...buckets.values()].sort((a, b) => a.time - b.time);
}
function interpolateSyntheticPath(anchors, pieces) {
 const safePieces = Math.max(1, Math.round(pieces));
 if (safePieces === anchors.length - 1) return anchors.slice();
 return Array.from({ length: safePieces + 1 }, (_, index) => {
   const position = (index / safePieces) * (anchors.length - 1);
   const leftIndex = Math.floor(position);
   const rightIndex = Math.min(anchors.length - 1, leftIndex + 1);
   const amount = position - leftIndex;
   return interpolateChartValue(anchors[leftIndex], anchors[rightIndex], amount);
 });
}
function syntheticIntraminutePath(candle, openPrice, pieces) {
 const close = parseChartNumber(candle.close, openPrice);
 const high = Math.max(openPrice, close, parseChartNumber(candle.high, close));
 const low = Math.min(openPrice, close, parseChartNumber(candle.low, close));
 const midpoint = (openPrice + close) / 2;
 const anchors = close >= openPrice
   ? [openPrice, low, midpoint, high, close]
   : [openPrice, high, midpoint, low, close];
 return interpolateSyntheticPath(anchors, pieces);
}
function expandCandlesToSubminute(candles, seconds) {
 const sliceSeconds = Math.max(1, Math.round(seconds));
 const pieces = Math.max(1, Math.round(60 / sliceSeconds));
 let previousClose = NaN;
 const expanded = candles
   .filter((candle) => candle && candle.time > 0)
   .sort((a, b) => a.time - b.time)
   .flatMap((candle) => {
     const minuteStart = Math.floor(candle.time / 60) * 60;
     const candleOpen = finiteNumber(candle.open, finiteNumber(candle.close, NaN));
     const openPrice = Number.isFinite(previousClose) && previousClose > 0 ? previousClose : candleOpen;
     const closePrice = finiteNumber(candle.close, openPrice);
     if (!Number.isFinite(openPrice) || openPrice <= 0 || !Number.isFinite(closePrice) || closePrice <= 0) return [];
     const volume = Math.max(0, finiteNumber(candle.volume, 0)) / pieces;
     const value = Math.max(0, finiteNumber(candle.value, 0)) / pieces;
     const path = syntheticIntraminutePath(candle, openPrice, pieces);
     previousClose = closePrice;
     return Array.from({ length: pieces }, (_, index) => {
       const open = path[index];
       const close = index === pieces - 1 ? closePrice : path[index + 1];
       return {
         time: minuteStart + index * sliceSeconds,
         open,
         high: Math.max(open, close),
         low: Math.min(open, close),
         close,
         volume,
         value
       };
     });
   });
 return enforceCandleOpenContinuity(expanded);
}
async function loadFuturesCandles(unit = state.timeframe, silent) {
 const requestedMarket = currentFuturesMarket().code;
 const requestedTimeframe = normalizeTimeframe(unit);
 const requestedLabel = timeframeLabel(requestedTimeframe);
 loadDailyMovingAverageCandles();
 if (state.futures.loadingCandles && silent) return;
 state.futures.loadingCandles = true;
 state.futures.error = null;
 if (!silent && isFuturesMode()) {
   setText(el.chartStatus, `${activeChartLabel()} ${requestedLabel}봉 캔들 로딩 중`);
   el.chartEmpty.classList.remove("hidden");
   setText(el.chartEmpty, "선물 차트 로딩 중");
 }
 try {
   const candles = await fetchFuturesCandles(requestedTimeframe, FUTURES_CANDLE_LIMIT);
   if (requestedMarket !== currentFuturesMarket().code || requestedTimeframe !== state.timeframe || !isFuturesMode()) return;
   if (!candles.length) {
     if (isFuturesMode()) {
       setText(el.chartStatus, `${activeChartLabel()} 캔들 데이터 없음`);
       el.chartEmpty.classList.remove("hidden");
       setText(el.chartEmpty, `${activeChartLabel()} 캔들 데이터가 비어 있습니다.`);
     }
     return;
   }
   state.futures.candles = dedupeFuturesCandles(candles);
   const last = state.futures.candles[state.futures.candles.length - 1];
   if (last) {
     applyFuturesTickerFromCandle(last);
     if (timeframeSeconds(requestedTimeframe) === FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS) {
       futuresOneMinuteOrderCandles.set(requestedMarket, { ...last, authoritative: true });
       queuePendingFuturesOrdersForCandle(last, requestedMarket, {
         timestamp: Math.min(
           Date.now(),
           (last.time + FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS) * 1000 - 1
         ),
         source: "rest-kline-1m",
         intervalSeconds: FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS
       });
     }
   }
   fetchFuturesTicker({ silent: true });
   if (isFuturesMode()) {
     setText(el.chartStatus, `${activeChartLabel()} ${requestedLabel}봉 최근 ${state.futures.candles.length.toLocaleString("ko-KR")}개`);
     el.chartEmpty.classList.toggle("hidden", state.futures.candles.length > 0);
     renderChartRangeControls();
     if (silent) {
       scheduleFuturesLiveUiUpdate();
     } else {
       resetChartAnimations();
       renderTicker();
       renderDashboard();
       renderTradeButtons();
       drawChart();
     }
   }
 } catch (error) {
   console.warn("futures candle fetch failed", error);
   state.futures.error = error && error.message ? error.message : "futures candle error";
   if (isFuturesMode()) {
     setText(el.chartStatus, `${activeChartLabel()} 캔들 데이터 오류`);
     el.chartEmpty.classList.remove("hidden");
     setText(el.chartEmpty, `${activeChartLabel()} 차트 데이터를 가져오지 못했습니다.`);
     showToast("선물 차트 API 요청에 실패했습니다.");
   }
 } finally {
   state.futures.loadingCandles = false;
 }
}
function dedupeFuturesCandles(candles) {
 return sanitizeChartCandles(
   candles,
   `${currentFuturesMarket().code} futures ${state.timeframe}`,
   timeframeSeconds(state.timeframe),
   FUTURES_CANDLE_LIMIT
 );
}
function updateFuturesLastCandle(candle) {
 if (!candle || candle.close <= 0) return;
 const candles = state.futures.candles;
 const last = candles[candles.length - 1];
 if (!last || last.time < candle.time) {
   candles.push(candle);
 } else if (last.time === candle.time) {
   candles[candles.length - 1] = candle;
 } else {
   const index = candles.findIndex((item) => item.time === candle.time);
   if (index >= 0) candles[index] = candle;
 }
 state.futures.candles = dedupeFuturesCandles(candles);
 applyFuturesTickerFromCandle(candle);
}
function applyFuturesTickerFromCandle(candle) {
 if (!candle) return;
 const marketCode = currentFuturesMarket().code;
 const timestamp = candle.time * 1000;
 const existing = state.futures.tickers && state.futures.tickers[marketCode]
   ? state.futures.tickers[marketCode]
   : state.futures.ticker;
 if (existing && existing.price > 0 && finiteNumber(existing.timestamp, 0) > timestamp) return;
 const changePrice = candle.close - candle.open;
 state.futures.ticker = {
   market: marketCode,
   price: candle.close,
   changePrice,
   changeRate: candle.open > 0 ? (changePrice / candle.open) * 100 : 0,
   highPrice: candle.high,
   lowPrice: candle.low,
   accTradePrice24h: candle.value,
   timestamp
 };
 if (!state.futures.tickers || typeof state.futures.tickers !== "object") state.futures.tickers = {};
 state.futures.tickers[marketCode] = state.futures.ticker;
}
async function fetchFuturesTicker(options = {}) {
 const requestedMarket = currentFuturesMarket();
 try {
   const ticker = requestedMarket.chartSource === "BINANCE"
     ? await fetchBinanceFuturesTicker(requestedMarket)
     : requestedMarket.chartSource === "BYBIT"
     ? await fetchBybitFuturesTicker(requestedMarket)
     : await fetchBithumbFuturesTicker(requestedMarket.code);
   if (requestedMarket.code !== currentFuturesMarket().code || !isFuturesMode()) return;
   if (!ticker || ticker.market !== requestedMarket.code) return;
   applyFuturesTicker(ticker);
   const source = requestedMarket.chartSource === "BINANCE" ? "Binance" : requestedMarket.chartSource === "BYBIT" ? "Bybit" : "빗썸";
   if (!futuresWebSocketIsHealthy()) {
     setConnectionStatus("rest", `${source} REST 임시 연결 · 실시간 재연결 대기`);
   }
 } catch (error) {
   console.warn("futures ticker fetch failed", error);
   if (isFuturesMode() && !futuresWebSocketIsHealthy()) setConnectionStatus("wait", "선물 시세 수신 오류");
   if (options.notifyFailure) showToast("선물 현재가를 가져오지 못했습니다.");
 }
}
function normalizeBinanceTickerData(raw, market) {
 if (!raw || !market) return null;
 const price = parseChartNumber(raw.lastPrice ?? raw.c, 0);
 if (price <= 0) return null;
 const open = parseChartNumber(raw.openPrice ?? raw.o, price);
 return {
   market: market.code,
   price,
   changePrice: parseChartNumber(raw.priceChange ?? raw.p, price - open),
   changeRate: parseChartNumber(raw.priceChangePercent ?? raw.P, open > 0 ? ((price - open) / open) * 100 : 0),
   highPrice: parseChartNumber(raw.highPrice ?? raw.h, price),
   lowPrice: parseChartNumber(raw.lowPrice ?? raw.l, price),
   accTradePrice24h: Math.max(0, parseChartNumber(raw.quoteVolume ?? raw.q, 0)),
   timestamp: parseChartNumber(raw.closeTime ?? raw.E, Date.now())
 };
}
function normalizeBinanceTradeData(raw, market) {
 if (!raw || !market) return null;
 const price = parseChartNumber(raw.p, 0);
 if (price <= 0) return null;
 const previous = state.futures.tickers && state.futures.tickers[market.code]
   ? state.futures.tickers[market.code]
   : state.futures.ticker || {};
 return {
   market: market.code,
   price,
   changePrice: finiteNumber(previous.changePrice, 0),
   changeRate: finiteNumber(previous.changeRate, 0),
   highPrice: positiveNumber(previous.highPrice, price),
   lowPrice: positiveNumber(previous.lowPrice, price),
   accTradePrice24h: Math.max(0, finiteNumber(previous.accTradePrice24h, 0)),
   timestamp: parseChartNumber(raw.T ?? raw.E, Date.now()),
   tradeVolume: Math.max(0, parseChartNumber(raw.q, 0)),
   isRealtimeTrade: true,
   tradeId: String(raw.a ?? raw.t ?? "")
 };
}
async function fetchBinanceFuturesTicker(market) {
 const data = await requestBinanceFuturesJson("/fapi/v1/ticker/24hr", { symbol: market.binanceSymbol });
 return normalizeBinanceTickerData(data, market);
}
function normalizeBybitTickerData(raw, market, timestamp = Date.now()) {
 if (!raw || !market) return null;
 const price = parseChartNumber(raw.lastPrice, 0);
 if (price <= 0) return null;
 const previous = parseChartNumber(raw.prevPrice24h, price);
 return {
   market: market.code,
   price,
   changePrice: price - previous,
   changeRate: parseChartNumber(raw.price24hPcnt, previous > 0 ? (price - previous) / previous : 0) * 100,
   highPrice: parseChartNumber(raw.highPrice24h, price),
   lowPrice: parseChartNumber(raw.lowPrice24h, price),
   accTradePrice24h: parseChartNumber(raw.turnover24h, 0),
   timestamp: parseChartNumber(timestamp, Date.now())
 };
}
function normalizeBybitTradeData(raw, market) {
 if (!raw || !market) return null;
 const price = parseChartNumber(raw.p ?? raw.price, 0);
 if (price <= 0) return null;
 const previous = state.futures.tickers && state.futures.tickers[market.code]
   ? state.futures.tickers[market.code]
   : state.futures.ticker || {};
 return {
   market: market.code,
   price,
   changePrice: finiteNumber(previous.changePrice, 0),
   changeRate: finiteNumber(previous.changeRate, 0),
   highPrice: positiveNumber(previous.highPrice, price),
   lowPrice: positiveNumber(previous.lowPrice, price),
   accTradePrice24h: Math.max(0, finiteNumber(previous.accTradePrice24h, 0)),
   timestamp: parseChartNumber(raw.T ?? raw.time, Date.now()),
   tradeVolume: Math.max(0, parseChartNumber(raw.v ?? raw.size, 0)),
   // Accumulate each public trade immediately. The next authoritative kline
   // snapshot replaces the aggregate, so volume cannot drift permanently.
   isRealtimeTrade: true,
   tradeId: String(raw.i ?? raw.tradeId ?? "")
 };
}
async function fetchBybitFuturesTicker(market) {
 const data = await requestBybitJson("/market/tickers", { category: "linear", symbol: market.bybitSymbol });
 const rows = data && data.result && Array.isArray(data.result.list) ? data.result.list : [];
 return normalizeBybitTickerData(rows[0], market, data.time);
}
async function fetchBithumbFuturesTicker(marketCode) {
 const url = new URL(`${BITHUMB_API_BASE}/ticker`);
 url.searchParams.set("markets", marketCode);
 const data = await requestJson(url.toString());
 return normalizeTicker(Array.isArray(data) ? data[0] : data);
}
async function fetchFuturesTickerForMarketCode(marketCode) {
 const market = futuresMarketByCode(marketCode);
 const ticker = market.chartSource === "BINANCE"
   ? await fetchBinanceFuturesTicker(market)
   : market.chartSource === "BYBIT"
   ? await fetchBybitFuturesTicker(market)
   : await fetchBithumbFuturesTicker(market.code);
 if (ticker) {
   if (!state.futures.tickers || typeof state.futures.tickers !== "object") state.futures.tickers = {};
   const previous = state.futures.tickers[market.code];
   const previousTimestamp = finiteNumber(previous && previous.timestamp, 0);
   const nextTimestamp = finiteNumber(ticker.timestamp, 0);
   if (!previous || !previousTimestamp || !nextTimestamp || nextTimestamp >= previousTimestamp) {
     state.futures.tickers[market.code] = ticker;
     if (market.code === currentFuturesMarket().code) state.futures.ticker = ticker;
   }
 }
 return ticker;
}
async function refreshBackgroundFuturesPositionTickers() {
 if (!isFuturesMode() || futuresBackgroundTickerRefreshRunning) return;
 const now = Date.now();
 if (now - futuresBackgroundTickerRefreshAt < FUTURES_BACKGROUND_TICKER_REFRESH_MS) return;
 const activeMarketCode = currentFuturesMarket().code;
 const marketCodes = [...new Set(
   getFuturesPositions()
     .map(futuresPositionMarketCode)
     .filter((marketCode) => marketCode !== activeMarketCode && FUTURES_MARKETS[marketCode])
 )];
 if (!marketCodes.length) return;
 futuresBackgroundTickerRefreshAt = now;
 futuresBackgroundTickerRefreshRunning = true;
 try {
   await Promise.all(marketCodes.map(async (marketCode) => {
     try {
       await fetchFuturesTickerForMarketCode(marketCode);
     } catch (error) {
       console.warn(`background ticker refresh failed: ${marketCode}`, error);
     }
   }));
   scheduleFuturesLiveUiUpdate();
 } finally {
   futuresBackgroundTickerRefreshRunning = false;
 }
}
async function ensureFuturesPriceForPosition(position) {
 const marketCode = futuresPositionMarketCode(position);
 const cached = state.futures.tickers && state.futures.tickers[marketCode];
 if (cached && cached.price > 0) return cached.price;
 if (marketCode === currentFuturesMarket().code && currentFuturesPrice(marketCode) > 0) return currentFuturesPrice(marketCode);
 try {
   const ticker = await fetchFuturesTickerForMarketCode(marketCode);
   if (ticker && ticker.price > 0) return ticker.price;
 } catch (error) {
   console.warn("position price refresh failed", error);
 }
 return currentFuturesPriceForPosition(position);
}
function captureFuturesOneMinuteOrderTrade(ticker) {
 if (!ticker || !ticker.isRealtimeTrade || !FUTURES_MARKETS[ticker.market]) return;
 const price = positiveNumber(finiteNumber(ticker.price, 0), 0);
 const timestamp = positiveNumber(finiteNumber(ticker.timestamp, 0), 0);
 if (!price || !timestamp) return;
 const minuteSeconds = FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS;
 const candleTime = Math.floor(timestamp / 1000 / minuteSeconds) * minuteSeconds;
 const existing = futuresOneMinuteOrderCandles.get(ticker.market);
 if (existing && existing.time > candleTime) return;
 if (!existing || existing.time < candleTime) {
   futuresOneMinuteOrderCandles.set(ticker.market, {
     time: candleTime,
     open: price,
     high: price,
     low: price,
     close: price,
     updatedAt: timestamp,
     // Only a cumulative exchange kline/REST snapshot proves that the full
     // minute before an order was observed. A first trade can arrive late.
     authoritative: false
   });
   return;
 }
 futuresOneMinuteOrderCandles.set(ticker.market, {
   ...existing,
   high: Math.max(existing.high, price),
   low: Math.min(existing.low, price),
   close: price,
   updatedAt: Math.max(finiteNumber(existing.updatedAt, 0), timestamp)
 });
}
function applyFuturesTicker(ticker) {
 if (!ticker || !FUTURES_MARKETS[ticker.market]) return;
 captureFuturesOneMinuteOrderTrade(ticker);
 if (!state.futures.tickers || typeof state.futures.tickers !== "object") state.futures.tickers = {};
 const previous = state.futures.tickers[ticker.market];
 const previousTimestamp = finiteNumber(previous && previous.timestamp, 0);
 const nextTimestamp = finiteNumber(ticker.timestamp, 0);
 if (previous && previousTimestamp && nextTimestamp && nextTimestamp < previousTimestamp) {
   // A delayed public trade is stale for the screen, but still proves that a
   // pending order price was touched. Keep display ordering and order evidence separate.
   if (ticker.isRealtimeTrade && ticker.market === currentFuturesMarket().code && isFuturesMode()) {
     queuePendingFuturesOrdersForTicker(ticker);
   }
   return;
 }
 state.futures.tickers[ticker.market] = ticker;
 if (ticker.market !== currentFuturesMarket().code) return;
 state.futures.ticker = ticker;
 // Keep the visible candle on the same real-time price used by ROE/PnL.
 // Exchange kline updates still supply authoritative volume and OHLC snapshots.
 updateCurrentFuturesCandleFromTicker();
 if (!isFuturesMode()) return;
 scheduleFuturesLiveUiUpdate();
 queuePendingFuturesOrdersForTicker(ticker);
}
function updateCurrentFuturesCandleFromTicker() {
 if (!state.futures.ticker || !state.futures.ticker.price) return;
 const unitSeconds = timeframeSeconds(state.timeframe);
 const timestampSeconds = Math.floor((state.futures.ticker.timestamp || Date.now()) / 1000);
 const bucket = Math.floor(timestampSeconds / unitSeconds) * unitSeconds;
 const price = state.futures.ticker.price;
 const last = state.futures.candles[state.futures.candles.length - 1];
 if (!last) {
   const volume = state.futures.ticker.isRealtimeTrade ? state.futures.ticker.tradeVolume : 0;
   state.futures.candles = [{ time: bucket, open: price, high: price, low: price, close: price, volume, value: volume * price }];
   return;
 }
 if (last.time === bucket) {
   last.high = Math.max(last.high, price);
   last.low = Math.min(last.low, price);
   last.close = price;
   if (state.futures.ticker.isRealtimeTrade) {
     const tradeId = state.futures.ticker.tradeId;
     if (!tradeId || last.lastTradeId !== tradeId) {
       const tradeVolume = Math.max(0, finiteNumber(state.futures.ticker.tradeVolume, 0));
       last.volume += tradeVolume;
       last.value += tradeVolume * price;
       last.lastTradeId = tradeId;
     }
   }
 } else if (last.time < bucket) {
   const volume = state.futures.ticker.isRealtimeTrade ? state.futures.ticker.tradeVolume : 0;
   state.futures.candles.push({
     time: bucket,
     open: price,
     high: price,
     low: price,
     close: price,
     volume,
     value: volume * price,
     lastTradeId: state.futures.ticker.tradeId || ""
   });
   state.futures.candles = dedupeFuturesCandles(state.futures.candles);
 }
}
function connectFuturesWebSocket() {
 disconnectFuturesWebSocket();
 if (!isFuturesMode()) return;
 const market = currentFuturesMarket();
 const source = market.chartSource === "BINANCE" ? "Binance" : market.chartSource === "BYBIT" ? "Bybit" : "빗썸";
 setConnectionStatus("wait", `${source} 실시간 체결 연결 중`);
 fetchFuturesTicker({ silent: true });
 if (typeof WebSocket === "undefined") return;
 if (market.chartSource === "BINANCE") {
   connectBinanceFuturesWebSocket(market);
   return;
 }
 if (market.chartSource === "BYBIT") {
   connectBybitFuturesWebSocket(market);
   return;
 }
 if (market.chartSource !== "BITHUMB") return;
 try {
   const socket = new WebSocket(BITHUMB_WS_URL);
   socket.binaryType = "arraybuffer";
   state.futures.ws = socket;
   state.futures.wsStream = market.code;
   socket.addEventListener("open", () => {
     socket.send(JSON.stringify([
       { ticket: `paper-futures-${Date.now()}` },
       { type: "trade", codes: [market.code], isOnlyRealtime: true },
       { format: "DEFAULT" }
     ]));
     setConnectionStatus("live", "빗썸 실시간 체결 연결됨");
   });
   socket.addEventListener("message", async (event) => {
     try {
       const raw = await decodeSocketMessage(event.data);
       const rawMarket = raw && (raw.market || raw.code);
       if (rawMarket && rawMarket !== market.code) return;
       const ticker = normalizeTicker(raw);
       if (ticker && isFuturesMode() && currentFuturesMarket().code === market.code) applyFuturesTicker(ticker);
     } catch (error) {
       console.warn("Bithumb trade stream parse failed", error);
     }
   });
   socket.addEventListener("error", () => setConnectionStatus("rest", "빗썸 REST 대체 모드"));
   socket.addEventListener("close", () => {
     if (state.futures.socketClosing) {
       state.futures.socketClosing = false;
       return;
     }
     state.futures.ws = null;
     state.futures.reconnectTimer = setTimeout(connectFuturesWebSocket, 3500);
   });
 } catch (error) {
   console.warn("Bithumb futures websocket failed", error);
 }
}
function normalizeBinanceStreamKline(raw) {
 const source = raw && raw.k ? raw.k : raw;
 if (!source) return null;
 const candle = {
   time: Math.floor(parseChartNumber(source.t, 0) / 1000),
   open: parseChartNumber(source.o, NaN),
   high: parseChartNumber(source.h, NaN),
   low: parseChartNumber(source.l, NaN),
   close: parseChartNumber(source.c, NaN),
   volume: Math.max(0, parseChartNumber(source.v, 0)),
   value: Math.max(0, parseChartNumber(source.q, 0))
 };
 return isValidChartCandle(candle) ? candle : null;
}
function captureBinanceOneMinuteOrderKline(raw, market, observedAt = Date.now()) {
 if (!market || currentFuturesMarket().code !== market.code) return;
 const candle = normalizeBinanceStreamKline(raw);
 if (!candle) return;
 const timestamp = parseChartNumber(raw && raw.E, observedAt);
 const existing = futuresOneMinuteOrderCandles.get(market.code);
 if (existing && existing.time > candle.time) return;
 const captured = existing && existing.time === candle.time
   ? {
     ...candle,
     high: Math.max(existing.high, candle.high),
     low: Math.min(existing.low, candle.low),
     close: timestamp >= finiteNumber(existing.updatedAt, 0) ? candle.close : existing.close,
     authoritative: true,
     updatedAt: Math.max(finiteNumber(existing.updatedAt, 0), timestamp)
   }
   : { ...candle, authoritative: true, updatedAt: timestamp };
 futuresOneMinuteOrderCandles.set(market.code, captured);
 clearTimeout(futuresOneMinuteKlineTriggerTimers.get(market.code));
 futuresOneMinuteKlineTriggerTimers.set(market.code, setTimeout(() => {
   futuresOneMinuteKlineTriggerTimers.delete(market.code);
   if (!isFuturesMode() || currentFuturesMarket().code !== market.code) return;
   queuePendingFuturesOrdersForCandle(candle, market.code, {
     timestamp,
     source: "binance-kline-1m",
     intervalSeconds: FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS
   });
 }, 250));
}
function applyBinanceKlineUpdate(raw, market) {
 if (!raw || !market || currentFuturesMarket().code !== market.code) return;
 const candle = normalizeBinanceStreamKline(raw);
 if (!candle) return;
 const candles = state.futures.candles.slice();
 const index = candles.findIndex((item) => item.time === candle.time);
 if (index >= 0) candles[index] = candle;
 else candles.push(candle);
 state.futures.candles = dedupeFuturesCandles(candles).slice(-FUTURES_CANDLE_LIMIT);
 if (isFuturesMode()) scheduleFuturesLiveUiUpdate();
}
function connectBinanceFuturesWebSocket(market) {
 try {
   const symbol = String(market.binanceSymbol || "BTCUSDT").toLowerCase();
   const activeInterval = binanceInterval(normalizeTimeframe(state.timeframe));
   const streams = [...new Set([
     `${symbol}@ticker`,
     `${symbol}@aggTrade`,
     `${symbol}@kline_1m`,
     `${symbol}@kline_${activeInterval}`
   ])];
   const socket = new WebSocket(`${BINANCE_FUTURES_WS_BASE}?streams=${streams.join("/")}`);
   state.futures.ws = socket;
   state.futures.wsStream = market.binanceSymbol;
   socket.addEventListener("open", () => {
     if (socket !== state.futures.ws) return;
     state.futures.socketClosing = false;
     state.futures.wsLastMessageAt = Date.now();
     state.futures.wsLastTradeAt = 0;
     startFuturesWebSocketHealthMonitor(socket, market);
     schedulePendingFuturesOrderHistoryRecovery(0);
     setConnectionStatus("live", `Binance ${market.binanceSymbol} 실시간 체결 연결됨`);
   });
   socket.addEventListener("message", (event) => {
     try {
       if (socket !== state.futures.ws) return;
       const message = JSON.parse(event.data);
       const data = message && message.data ? message.data : message;
       const eventType = String(data && data.e || "");
       markFuturesWebSocketMessage(socket, market, eventType === "aggTrade");
       if (eventType === "24hrTicker") {
         const ticker = normalizeBinanceTickerData(data, market);
         if (ticker && isFuturesMode() && currentFuturesMarket().code === market.code) applyFuturesTicker(ticker);
         return;
       }
       if (eventType === "aggTrade") {
         const ticker = normalizeBinanceTradeData(data, market);
         if (ticker && isFuturesMode() && currentFuturesMarket().code === market.code) applyFuturesTicker(ticker);
         return;
       }
       if (eventType === "kline") {
         const interval = String(data.k && data.k.i || "");
         if (interval === "1m") captureBinanceOneMinuteOrderKline(data, market, data.E);
         if (interval === activeInterval) applyBinanceKlineUpdate(data, market);
       }
     } catch (error) {
       console.warn("Binance Futures stream parse failed", error);
     }
   });
   socket.addEventListener("error", () => {
     if (socket !== state.futures.ws) return;
     setConnectionStatus("wait", "Binance 실시간 연결 오류 · 재연결 중");
     try {
       socket.close();
     } catch (error) {
       console.warn("Binance websocket error close failed", error);
       scheduleFuturesWebSocketReconnect();
     }
   });
   socket.addEventListener("close", () => {
     if (socket !== state.futures.ws) return;
     clearInterval(state.futures.wsHeartbeatTimer);
     clearInterval(state.futures.wsWatchdogTimer);
     state.futures.wsHeartbeatTimer = null;
     state.futures.wsWatchdogTimer = null;
     if (socket.__paperIntentionalClose || state.futures.socketClosing) {
       state.futures.socketClosing = false;
       return;
     }
     state.futures.ws = null;
     state.futures.wsLastMessageAt = 0;
     state.futures.wsLastTradeAt = 0;
     scheduleFuturesWebSocketReconnect();
   });
 } catch (error) {
   console.warn("Binance Futures websocket failed", error);
   state.futures.ws = null;
   state.futures.wsLastMessageAt = 0;
   state.futures.wsLastTradeAt = 0;
   scheduleFuturesWebSocketReconnect();
 }
}
function normalizeBybitKlineCandle(raw) {
 if (!raw) return null;
 const candle = {
   time: Math.floor(parseChartNumber(raw.start, 0) / 1000),
   open: parseChartNumber(raw.open, NaN),
   high: parseChartNumber(raw.high, NaN),
   low: parseChartNumber(raw.low, NaN),
   close: parseChartNumber(raw.close, NaN),
   volume: Math.max(0, parseChartNumber(raw.volume, 0)),
   value: Math.max(0, parseChartNumber(raw.turnover, 0))
 };
 return candle.time && [candle.open, candle.high, candle.low, candle.close].every(Number.isFinite)
   ? candle
   : null;
}
function captureBybitOneMinuteOrderKline(raw, market, observedAt = Date.now()) {
 if (!market || currentFuturesMarket().code !== market.code) return;
 const candle = normalizeBybitKlineCandle(raw);
 if (!candle) return;
 const timestamp = parseChartNumber(raw.timestamp, observedAt);
 const existing = futuresOneMinuteOrderCandles.get(market.code);
 if (existing && existing.time > candle.time) return;
 const captured = existing && existing.time === candle.time
   ? {
     ...candle,
     high: Math.max(existing.high, candle.high),
     low: Math.min(existing.low, candle.low),
     close: timestamp >= finiteNumber(existing.updatedAt, 0) ? candle.close : existing.close,
     authoritative: true,
     updatedAt: Math.max(finiteNumber(existing.updatedAt, 0), timestamp)
   }
   : { ...candle, authoritative: true, updatedAt: timestamp };
 futuresOneMinuteOrderCandles.set(market.code, captured);
 if (isFuturesMode()) {
   clearTimeout(futuresOneMinuteKlineTriggerTimers.get(market.code));
   futuresOneMinuteKlineTriggerTimers.set(market.code, setTimeout(() => {
     futuresOneMinuteKlineTriggerTimers.delete(market.code);
     if (!isFuturesMode() || currentFuturesMarket().code !== market.code) return;
     queuePendingFuturesOrdersForCandle(candle, market.code, {
       timestamp,
       source: "bybit-kline-1m",
       intervalSeconds: FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS
     });
   }, 250));
 }
}
function applyBybitKlineUpdate(raw, market) {
 if (!raw || !market || currentFuturesMarket().code !== market.code) return;
 const candle = normalizeBybitKlineCandle(raw);
 if (!candle) return;
 const candles = state.futures.candles.slice();
 const index = candles.findIndex((item) => item.time === candle.time);
 if (index >= 0) candles[index] = candle;
 else candles.push(candle);
 state.futures.candles = dedupeFuturesCandles(candles).slice(-FUTURES_CANDLE_LIMIT);
 if (isFuturesMode()) {
   scheduleFuturesLiveUiUpdate();
 }
}
function connectBybitFuturesWebSocket(market) {
 try {
   const socket = new WebSocket(BYBIT_WS_URL);
   state.futures.ws = socket;
   state.futures.wsStream = market.bybitSymbol;
   socket.addEventListener("open", () => {
     if (socket !== state.futures.ws) return;
     state.futures.socketClosing = false;
     state.futures.wsLastMessageAt = Date.now();
     state.futures.wsLastTradeAt = 0;
     const klineTopics = [...new Set(["1", normalizeTimeframe(state.timeframe)])]
       .map((interval) => `kline.${interval}.${market.bybitSymbol}`);
     socket.send(JSON.stringify({
       op: "subscribe",
       args: [
         `tickers.${market.bybitSymbol}`,
         `publicTrade.${market.bybitSymbol}`,
         ...klineTopics
       ]
     }));
     startFuturesWebSocketHealthMonitor(socket, market);
     schedulePendingFuturesOrderHistoryRecovery(0);
     setConnectionStatus("live", `Bybit ${market.bybitSymbol} 실시간 체결 연결됨`);
   });
   socket.addEventListener("message", (event) => {
     try {
       if (socket !== state.futures.ws) return;
       const message = JSON.parse(event.data);
       const topic = String(message.topic || "");
       markFuturesWebSocketMessage(socket, market, topic.startsWith("publicTrade."));
       if (topic.startsWith("tickers.")) {
         const incoming = Array.isArray(message.data) ? message.data[0] : message.data;
         const previous = state.futures.bybitTickerSnapshots[market.bybitSymbol] || {};
         const snapshot = { ...previous, ...(incoming || {}) };
         state.futures.bybitTickerSnapshots[market.bybitSymbol] = snapshot;
         const ticker = normalizeBybitTickerData(snapshot, market, message.ts);
         if (ticker && isFuturesMode() && currentFuturesMarket().code === market.code) applyFuturesTicker(ticker);
         return;
       }
       if (topic.startsWith("publicTrade.")) {
         const trades = (Array.isArray(message.data) ? message.data : [message.data])
           .map((trade) => normalizeBybitTradeData(trade, market))
           .filter(Boolean)
           .sort((a, b) => a.timestamp - b.timestamp);
         trades.forEach((ticker) => {
           if (isFuturesMode() && currentFuturesMarket().code === market.code) applyFuturesTicker(ticker);
         });
         return;
       }
       if (topic.startsWith("kline.")) {
         const kline = Array.isArray(message.data) ? message.data[0] : message.data;
         const interval = topic.split(".")[1] || "";
         if (interval === "1") captureBybitOneMinuteOrderKline(kline, market, message.ts);
         if (interval === normalizeTimeframe(state.timeframe)) applyBybitKlineUpdate(kline, market);
       }
     } catch (error) {
       console.warn("Bybit stream parse failed", error);
     }
   });
   socket.addEventListener("error", () => {
     if (socket !== state.futures.ws) return;
     setConnectionStatus("wait", "Bybit 실시간 연결 오류 · 재연결 중");
     try {
       socket.close();
     } catch (error) {
       console.warn("Bybit websocket error close failed", error);
       scheduleFuturesWebSocketReconnect();
     }
   });
   socket.addEventListener("close", () => {
     if (socket !== state.futures.ws) return;
     clearInterval(state.futures.wsHeartbeatTimer);
     clearInterval(state.futures.wsWatchdogTimer);
     state.futures.wsHeartbeatTimer = null;
     state.futures.wsWatchdogTimer = null;
     if (socket.__paperIntentionalClose || state.futures.socketClosing) {
       state.futures.socketClosing = false;
       return;
     }
     state.futures.ws = null;
     state.futures.wsLastMessageAt = 0;
     state.futures.wsLastTradeAt = 0;
     scheduleFuturesWebSocketReconnect();
   });
 } catch (error) {
   console.warn("Bybit futures websocket failed", error);
   state.futures.ws = null;
   state.futures.wsLastMessageAt = 0;
   state.futures.wsLastTradeAt = 0;
   scheduleFuturesWebSocketReconnect();
 }
}
function disconnectFuturesWebSocket() {
 for (const timer of futuresOneMinuteKlineTriggerTimers.values()) clearTimeout(timer);
 futuresOneMinuteKlineTriggerTimers.clear();
 clearTimeout(state.futures.reconnectTimer);
 state.futures.reconnectTimer = null;
 clearInterval(state.futures.wsHeartbeatTimer);
 state.futures.wsHeartbeatTimer = null;
 clearInterval(state.futures.wsWatchdogTimer);
 state.futures.wsWatchdogTimer = null;
 if (state.futures.ws) {
   state.futures.ws.__paperIntentionalClose = true;
   state.futures.socketClosing = true;
   state.futures.ws.close();
   state.futures.ws = null;
 }
 state.futures.wsStream = "";
 state.futures.wsLastMessageAt = 0;
 state.futures.wsLastTradeAt = 0;
}
function parseChartNumber(value, fallback = NaN) {
 if (Number.isFinite(value)) return value;
 if (typeof value === "string") {
   const normalized = value.replace(/,/g, "").replace(/[^\d.+\-eE]/g, "").trim();
   if (normalized) {
     const number = Number(normalized);
     if (Number.isFinite(number)) return number;
   }
 }
 const number = Number(value);
 return Number.isFinite(number) ? number : fallback;
}
function normalizeEpochMilliseconds(value) {
 const timestamp = parseChartNumber(value, NaN);
 if (!Number.isFinite(timestamp)) return NaN;
 return timestamp > 10000000000 ? Math.floor(timestamp) : Math.floor(timestamp * 1000);
}
function parseExchangeDateTimeMs(dateValue, timeValue, offsetMinutes = 0) {
 if (!dateValue) return NaN;
 let datePart = String(dateValue).trim();
 let timePart = timeValue == null ? "" : String(timeValue).trim();
 const combined = datePart.match(/^(\d{4}-?\d{2}-?\d{2})[T\s](\d{2}:?\d{2}:?\d{2}(?:\.\d+)?)$/);
 if (combined) {
   datePart = combined[1];
   timePart = combined[2];
 }
 const dateMatch = datePart.match(/^(\d{4})-?(\d{2})-?(\d{2})$/);
 const timeMatch = (timePart || "00:00:00").match(/^(\d{2}):?(\d{2}):?(\d{2})(?:\.(\d{1,3}))?$/);
 if (!dateMatch || !timeMatch) return NaN;
 const year = Number(dateMatch[1]);
 const month = Number(dateMatch[2]);
 const day = Number(dateMatch[3]);
 const hour = Number(timeMatch[1]);
 const minute = Number(timeMatch[2]);
 const second = Number(timeMatch[3]);
 const millisecond = Number((timeMatch[4] || "0").padEnd(3, "0"));
 const utcMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - offsetMinutes * 60 * 1000;
 return Number.isFinite(utcMs) ? utcMs : NaN;
}
function tickerTimestampMs(raw) {
 if (!raw) return Date.now();
 const exchangeTimestamp = normalizeEpochMilliseconds(raw.trade_timestamp ?? raw.timestamp);
 if (Number.isFinite(exchangeTimestamp)) return exchangeTimestamp;
 const utcMs = parseExchangeDateTimeMs(raw.trade_date, raw.trade_time, 0);
 if (Number.isFinite(utcMs)) return utcMs;
 const kstMs = parseExchangeDateTimeMs(raw.trade_date_kst, raw.trade_time_kst, 9 * 60);
 if (Number.isFinite(kstMs)) return kstMs;
 return Date.now();
}
function candleTimestampSeconds(raw) {
 if (!raw) return NaN;
 const directTime = parseChartNumber(raw.time, NaN);
 if (Number.isFinite(directTime)) return directTime > 10000000000 ? Math.floor(directTime / 1000) : Math.floor(directTime);
 const utcMs = parseExchangeDateTimeMs(raw.candle_date_time_utc, null, 0);
 if (Number.isFinite(utcMs)) return Math.floor(utcMs / 1000);
 const kstMs = parseExchangeDateTimeMs(raw.candle_date_time_kst, null, 9 * 60);
 if (Number.isFinite(kstMs)) return Math.floor(kstMs / 1000);
 const timestamp = normalizeEpochMilliseconds(raw.timestamp);
 return Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : NaN;
}
function isValidChartCandle(candle) {
 if (!candle || !Number.isFinite(candle.time) || candle.time <= 0) return false;
 const values = [candle.open, candle.high, candle.low, candle.close];
 if (!values.every((value) => Number.isFinite(value) && value > 0)) return false;
 if (!Number.isFinite(candle.volume) || candle.volume < 0) return false;
 if (candle.high < Math.max(candle.open, candle.close, candle.low)) return false;
 if (candle.low > Math.min(candle.open, candle.close, candle.high)) return false;
 return true;
}
function sanitizeChartCandles(candles, context, expectedSeconds, limit) {
 const stats = createEmptyChartDataStats(context);
 const map = new Map();
 stats.inputCount = Array.isArray(candles) ? candles.length : 0;
 (Array.isArray(candles) ? candles : []).forEach((raw) => {
   const candle = normalizeCandle(raw);
   if (!isValidChartCandle(candle)) {
     stats.invalidOhlcCount += 1;
     return;
   }
   if (map.has(candle.time)) stats.duplicateTimestampCount += 1;
   map.set(candle.time, candle);
 });
 const sorted = [...map.values()].sort((a, b) => a.time - b.time);
 const gapSeconds = Math.max(1, Math.round(expectedSeconds || timeframeSeconds(state.timeframe)));
 for (let i = 1; i < sorted.length; i += 1) {
   const gap = sorted[i].time - sorted[i - 1].time;
   if (gap > gapSeconds) {
     stats.missingTimestampCount += Math.max(1, Math.round(gap / gapSeconds) - 1);
   }
 }
 // Keep Bithumb OHLC values unchanged; forcing opens to the prior close
 // creates artificial candle bodies and wicks.
 const result = sorted.slice(-Math.max(1, finiteNumber(limit, sorted.length || 1)));
 stats.outputCount = result.length;
 state.chart.lastDataStats = stats;
 const warningSignature = `${stats.context}:${stats.duplicateTimestampCount}:${stats.missingTimestampCount}:${stats.invalidOhlcCount}:${stats.outputCount}`;
 if (
   (stats.duplicateTimestampCount || stats.missingTimestampCount || stats.invalidOhlcCount) &&
   state.chart.lastDataWarningSignature !== warningSignature
 ) {
   state.chart.lastDataWarningSignature = warningSignature;
   console.warn("[chart-data]", stats);
 }
 return result;
}
function normalizeTicker(raw) {
 if (!raw) return null;
 const price = parseChartNumber(raw.trade_price, 0);
 if (price <= 0) return null;
 return {
   market: raw.market || raw.code || state.market,
   price,
   changePrice: parseChartNumber(raw.signed_change_price, 0),
   changeRate: parseChartNumber(raw.signed_change_rate, 0) * 100,
   highPrice: parseChartNumber(raw.high_price, 0),
   lowPrice: parseChartNumber(raw.low_price, 0),
   accTradePrice24h: parseChartNumber(raw.acc_trade_price_24h, 0),
   timestamp: tickerTimestampMs(raw),
   tradeVolume: Math.max(0, parseChartNumber(raw.trade_volume, 0)),
   isRealtimeTrade: raw.type === "trade" && raw.stream_type === "REALTIME",
   tradeId: String(raw.sequential_id || "")
 };
}
function normalizeCandle(raw) {
 if (!raw) return null;
 const time = candleTimestampSeconds(raw);
 if (!Number.isFinite(time)) return null;
 return {
   time,
   open: parseChartNumber(raw.opening_price ?? raw.open, NaN),
   high: parseChartNumber(raw.high_price ?? raw.high, NaN),
   low: parseChartNumber(raw.low_price ?? raw.low, NaN),
   close: parseChartNumber(raw.trade_price ?? raw.close, NaN),
   volume: Math.max(0, parseChartNumber(raw.candle_acc_trade_volume ?? raw.volume, 0)),
   value: Math.max(0, parseChartNumber(raw.candle_acc_trade_price ?? raw.value, 0))
 };
}
function candleWithContinuousOpen(candle, openPrice) {
 if (!candle || !Number.isFinite(openPrice) || openPrice <= 0) return candle;
 const close = parseChartNumber(candle.close, openPrice);
 const high = Math.max(openPrice, close, parseChartNumber(candle.high, close));
 const low = Math.min(openPrice, close, parseChartNumber(candle.low, close));
 return {
   ...candle,
   open: openPrice,
   high,
   low
 };
}
function enforceCandleOpenContinuity(candles, stats) {
 let previousClose = NaN;
 return (Array.isArray(candles) ? candles : []).map((candle) => {
   if (!candle || !Number.isFinite(candle.close) || candle.close <= 0) return candle;
   if (!Number.isFinite(previousClose) || previousClose <= 0) {
     previousClose = candle.close;
     return candleWithContinuousOpen(candle, candle.open);
   }
   const fixed = candleWithContinuousOpen(candle, previousClose);
   if (stats && Number.isFinite(candle.open) && Math.abs(candle.open - previousClose) > Math.max(1e-8, previousClose * 1e-10)) {
     stats.openContinuityFixCount += 1;
   }
   previousClose = fixed.close;
   return fixed;
 });
}
function dedupeCandles(candles) {
 return sanitizeChartCandles(candles, `${state.market} ${state.timeframe}m`, timeframeSeconds(state.timeframe), CANDLE_LOAD_LIMIT);
}
function applyTicker(ticker) {
 if (!ticker || !ticker.market) return;
 state.marketTickers[ticker.market] = ticker;
 if (ticker.market && ticker.market !== state.market) return;
 state.ticker = ticker;
 updateCurrentCandleFromTicker();
 renderTicker();
 renderDashboard();
 renderTradeButtons();
 if (!isMemoInputActive()) {
   renderTradeHistory();
 }
 renderChartRangeControls();
 drawChart();
}
function updateCurrentCandleFromTicker() {
 if (!state.ticker || !state.ticker.price) return;
 const unitSeconds = timeframeSeconds(state.timeframe);
 const timestampSeconds = Math.floor((state.ticker.timestamp || Date.now()) / 1000);
 const bucket = Math.floor(timestampSeconds / unitSeconds) * unitSeconds;
 const price = state.ticker.price;
 const last = state.candles[state.candles.length - 1];
 if (!last) {
   state.candles = [{ time: bucket, open: price, high: price, low: price, close: price, volume: 0, value: 0 }];
   return;
 }
 if (last.time === bucket) {
   last.high = Math.max(last.high, price);
   last.low = Math.min(last.low, price);
   last.close = price;
 } else if (last.time < bucket) {
   state.candles.push({
     time: bucket,
     open: last.close,
     high: Math.max(last.close, price),
     low: Math.min(last.close, price),
     close: price,
     volume: 0,
     value: 0
   });
   state.candles = dedupeCandles(state.candles);
 }
}
function initChart() {
 state.chart.ctx = el.chartCanvas.getContext("2d");
 resizeChart();
 if ("ResizeObserver" in window) {
   new ResizeObserver(resizeChart).observe(el.chartCanvas.parentElement);
 } else {
   window.addEventListener("resize", resizeChart);
 }
}
function resizeChart() {
 const rect = el.chartCanvas.parentElement.getBoundingClientRect();
 if (rect.width <= 0 || rect.height <= 0) return;
 const dpr = Math.max(1, window.devicePixelRatio || 1);
 const width = Math.floor(rect.width);
 const height = Math.floor(rect.height);
 el.chartCanvas.width = Math.floor(width * dpr);
 el.chartCanvas.height = Math.floor(height * dpr);
 el.chartCanvas.style.width = "100%";
 el.chartCanvas.style.height = "100%";
 state.chart.size = { width, height, dpr };
 state.chart.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
 drawChart();
}
function drawChart() {
 const ctx = state.chart.ctx;
 if (!ctx) return;
 const candles = activeAnalysisCandles();
 const width = state.chart.size.width || el.chartCanvas.clientWidth;
 const height = state.chart.size.height || el.chartCanvas.clientHeight;
 ctx.clearRect(0, 0, width, height);
 ctx.fillStyle = "#080d14";
 ctx.fillRect(0, 0, width, height);
 if (!candles.length) {
   state.chart.metrics = null;
   state.chart.visibleCandles = [];
   updateChartDebugInfo(null);
   return;
 }
 const metrics = buildChartMetrics(width, height);
 state.chart.metrics = metrics;
 state.chart.visibleCandles = metrics.candles;
 drawGrid(ctx, metrics);
 drawVolume(ctx, metrics);
 drawCandles(ctx, metrics);
 drawBollingerBand(ctx, metrics);
 drawEmaLines(ctx, metrics);
 renderSupportResistanceLines(ctx, metrics);
 if (userChartOverlaysVisible()) {
   drawRiskBlocks(ctx, metrics);
   drawTrendlines(ctx, metrics);
   drawPercentMeasurement(ctx, metrics);
 }
 drawFuturesLimitOrders(ctx, metrics);
 drawFuturesExitOrders(ctx, metrics);
 drawFuturesCompletedOrders(ctx, metrics);
 if (userChartOverlaysVisible()) drawBuyMarkers(ctx, metrics);
 drawCurrentPrice(ctx, metrics);
 drawCrosshair(ctx, metrics);
 updateOhlcInfo();
 updateChartDebugInfo(metrics);
}
function defaultRiskBlockWidth(timeframe = state.timeframe) {
 return String(timeframe) === "1" ? ONE_MINUTE_RISK_BLOCK_WIDTH : DEFAULT_RISK_BLOCK_WIDTH;
}
function chartRightMarginCandleCount(timeframe = state.timeframe) {
 return String(timeframe) === "1" ? ONE_MINUTE_CHART_RIGHT_MARGIN_CANDLES : DEFAULT_CHART_RIGHT_MARGIN_CANDLES;
}
function limitChartFutureSlots(requestedSlots, visibleCandleCount, timeframe = state.timeframe) {
 const requested = Math.max(0, Math.ceil(finiteNumber(requestedSlots, 0)));
 if (String(timeframe) !== "1") return requested;
 const compactLimit = Math.max(
   ONE_MINUTE_RISK_BLOCK_WIDTH + ONE_MINUTE_CHART_RIGHT_MARGIN_CANDLES + 1,
   Math.ceil(Math.max(1, finiteNumber(visibleCandleCount, DEFAULT_VISIBLE_CANDLES)) * ONE_MINUTE_MAX_FUTURE_AREA_RATIO)
 );
 return Math.min(requested, compactLimit);
}
function buildChartMetrics(width, height) {
  const sourceCandles = activeAnalysisCandles();
  const visibleCount = currentAnimatedChartVisibleCount();
  const visibleTotal = Math.min(visibleCount, sourceCandles.length);
  const panOffset = clampChartPanOffset(state.chart.panOffset, sourceCandles, visibleTotal);
  const visibleEndIndex = Math.max(visibleTotal, sourceCandles.length - panOffset);
  const visibleStartIndex = Math.max(0, visibleEndIndex - visibleTotal);
  const candles = sourceCandles.slice(visibleStartIndex, visibleEndIndex);
 const right = width < 520 ? 104 : 132;
 const bottom = width < 520 ? 34 : 38;
 const volumeHeight = clamp(height * 0.18, 72, 104);
 const plot = {
   x: 10,
   y: 24,
   w: Math.max(10, width - 10 - right),
   h: Math.max(120, height - 24 - bottom - volumeHeight - 20)
 };
 const volume = {
   x: plot.x,
   y: plot.y + plot.h + 20,
   w: plot.w,
   h: volumeHeight
 };
 const firstTime = candles[0] ? candles[0].time : 0;
 const lastTime = candles[candles.length - 1] ? candles[candles.length - 1].time : 0;
 const unitSeconds = timeframeSeconds(state.timeframe);
 const showUserOverlays = userChartOverlaysVisible();
 const furthestRiskEnd = (showUserOverlays ? currentRiskBlocks() : []).reduce((furthest, block) => {
   const blockStart = finiteNumber(block.entryX, finiteNumber(block.entryTime, lastTime));
   const blockWidth = finiteNumber(block.width, DEFAULT_RISK_BLOCK_WIDTH);
   return Math.max(furthest, blockStart + blockWidth * timeframeSeconds(block.timeframe));
 }, lastTime);
 const riskFutureSlots = lastTime ? Math.ceil(Math.max(0, furthestRiskEnd - lastTime) / unitSeconds) : 0;
 const trendFutureSlots = lastTime && showUserOverlays
   ? currentTrendlines().reduce((furthest, line) => {
     if (line.kind === "horizontal") return furthest;
     const lineFutureTime = Math.max(
       finiteNumber(line.startTime, lastTime),
       finiteNumber(line.endTime, lastTime)
     );
     return Math.max(
       furthest,
       Math.ceil(Math.max(0, lineFutureTime - lastTime) / unitSeconds)
     );
   }, 0)
   : 0;
 const rightMarginCandleCount = chartRightMarginCandleCount();
  const requestedFutureSlots = panOffset > 0 ? 0 : Math.max(
      rightMarginCandleCount,
      riskFutureSlots > 0 ? riskFutureSlots + rightMarginCandleCount : 0,
      trendFutureSlots > 0 ? trendFutureSlots + rightMarginCandleCount : 0
    );
 const futureSlots = limitChartFutureSlots(requestedFutureSlots, visibleTotal);
 const futureEndTime = lastTime + futureSlots * unitSeconds;
 const visibleRiskBlocks = (showUserOverlays ? currentRiskBlocks() : [])
   .filter((block) => {
     const blockStart = finiteNumber(block.entryX, 0);
     const blockEnd = blockStart + finiteNumber(block.width, DEFAULT_RISK_BLOCK_WIDTH) * timeframeSeconds(block.timeframe);
     return blockEnd >= firstTime && blockStart <= futureEndTime;
   });
 const visibleRiskPrices = visibleRiskBlocks.flatMap((block) => {
     refreshRiskBlockPrices(block);
     return [block.entryPrice, block.takeProfitPrice, block.stopLossPrice];
   });
 const selectedRiskPrices = visibleRiskBlocks
   .filter((block) => block.id === state.chart.selectedRiskBlockId)
   .flatMap((block) => [block.entryPrice, block.takeProfitPrice, block.stopLossPrice])
   .filter(Number.isFinite);
 const emaLines = buildVisibleEmaLines(visibleStartIndex, candles.length);
 const visibleEmaPrices = emaLines
   .filter((line) => line.type !== "daily-sma")
   .flatMap((line) => line.values.filter(Number.isFinite));
 const visibleDailySmaPrices = emaLines
   .filter((line) => line.type === "daily-sma")
   .flatMap((line) => line.values.filter(Number.isFinite));
 const bollingerBand = buildVisibleBollingerBand(visibleStartIndex, candles.length);
 const visibleBollingerPrices = bollingerBand
   ? bollingerBand.upper.concat(bollingerBand.middle, bollingerBand.lower).filter(Number.isFinite)
   : [];
 const trendPrices = (showUserOverlays ? currentTrendlines() : [])
   .filter((line) => {
     if (line.kind === "horizontal") return true;
     const startTime = finiteNumber(line.startTime, 0);
     const endTime = finiteNumber(line.endTime, 0);
     return Math.max(startTime, endTime) >= firstTime && Math.min(startTime, endTime) <= futureEndTime;
   })
   .flatMap((line) => [line.startPrice, line.endPrice]);
 const limitOrderPrices = isFuturesMode()
   ? currentFuturesLimitOrders().map((order) => order.price)
   : [];
 const exitOrderPrices = isFuturesMode()
   ? currentFuturesExitOrders().map((order) => order.price)
   : [];
 const completedOrderPrices = isFuturesMode()
   ? currentFuturesCompletedOrderNotices().map((notice) => notice.price)
   : [];
 const openBuyPrices = isFuturesMode()
   ? state.futures.tradeMarkers
     .filter((marker) => futuresTradeMarketCode(marker) === currentFuturesMarket().code)
     .map((marker) => finiteNumber(marker.price, 0))
   : currentOpenBuyTrades(state.market)
     .filter((trade) => buyMarkerTimeForCandles(trade, candles) !== null)
     .map((trade) => finiteNumber(trade.price, 0));
 const positionPrices = isFuturesMode()
   ? activeFuturesPositions()
     .flatMap((position) => [position.entryPrice, futuresEffectiveEntryPrice(position), calculateSimpleFuturesLiquidationPrice(position)])
     .filter((price) => price > 0)
   : [
     state.portfolio && state.portfolio.btcBalance > 0
       ? finiteNumber(state.portfolio.avgBuyPrice, 0)
       : 0
   ].filter((price) => price > 0);
 const primaryPriceValues = candles.flatMap((candle) => [candle.high, candle.low]);
 let primaryMinPrice = Math.min(...primaryPriceValues.filter(Number.isFinite));
 let primaryMaxPrice = Math.max(...primaryPriceValues.filter(Number.isFinite));
 if (!Number.isFinite(primaryMinPrice) || !Number.isFinite(primaryMaxPrice) || primaryMinPrice === primaryMaxPrice) {
   const fallbackPrice = Math.max(
     1,
     finiteNumber(candles[candles.length - 1] && candles[candles.length - 1].close, 1)
   );
   primaryMinPrice = fallbackPrice * 0.999;
   primaryMaxPrice = fallbackPrice * 1.001;
 }
 const primaryMidpoint = (primaryMaxPrice + primaryMinPrice) / 2;
 const minimumAbsolutePriceRange = chartMinimumAbsolutePriceRange();
 const primaryRange = Math.max(
   primaryMaxPrice - primaryMinPrice,
   Math.abs(primaryMidpoint) * MIN_PRICE_SCALE_ZOOMED_PADDING_RATIO,
   minimumAbsolutePriceRange
 );
 const overlayMargin = Math.max(
   primaryRange * PRICE_SCALE_OVERLAY_MARGIN_RATIO,
   Math.abs(primaryMidpoint) * PRICE_SCALE_MIN_OVERLAY_MARGIN_RATIO
 );
 const informationalOverlayPrices = !showUserOverlays || isFuturesMode() ? [] : openBuyPrices.concat(positionPrices);
 const nearbyOverlayPrices = trendPrices
   .concat(limitOrderPrices, exitOrderPrices, completedOrderPrices, visibleRiskPrices, visibleEmaPrices, visibleBollingerPrices, informationalOverlayPrices)
   .filter((price) => Number.isFinite(price) && price >= primaryMinPrice - overlayMargin && price <= primaryMaxPrice + overlayMargin);
 // 선택한 손익비 블럭은 평단이 현재 시세에서 멀어도 차트 밖으로 사라지지 않게 합니다.
 const priceValues = primaryPriceValues.concat(nearbyOverlayPrices, selectedRiskPrices, visibleDailySmaPrices);
 let minPrice = Math.min(...priceValues.filter(Number.isFinite));
 let maxPrice = Math.max(...priceValues.filter(Number.isFinite));
 if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || minPrice === maxPrice) {
   minPrice = primaryMinPrice;
   maxPrice = primaryMaxPrice;
 }
 const zoomTightness = chartZoomTightness(visibleTotal);
 const priceMidpoint = (maxPrice + minPrice) / 2;
 const priceRange = Math.max(
   maxPrice - minPrice,
   Math.abs(priceMidpoint) * 0.0004,
   minimumAbsolutePriceRange
 );
 const paddingRatio = interpolateChartValue(PRICE_SCALE_PADDING_RATIO, PRICE_SCALE_ZOOMED_PADDING_RATIO, zoomTightness);
 const minPaddingRatio = interpolateChartValue(MIN_PRICE_SCALE_PADDING_RATIO, MIN_PRICE_SCALE_ZOOMED_PADDING_RATIO, zoomTightness);
 const padding = Math.max(
   priceRange * paddingRatio,
   Math.abs(priceMidpoint) * minPaddingRatio
  );
  minPrice = Math.max(0, minPrice - padding);
  maxPrice += padding;
  const pannedPriceScale = applyChartPricePan(minPrice, maxPrice);
  minPrice = pannedPriceScale.minPrice;
  maxPrice = pannedPriceScale.maxPrice;
  const smoothedPriceScale = currentAnimatedPriceScale(minPrice, maxPrice);
 minPrice = smoothedPriceScale.minPrice;
 maxPrice = smoothedPriceScale.maxPrice;
 const priceGridSegments = chartPriceGridSegments(plot.h);
 const maxVolume = chartVolumeScaleMax(candles);
 const totalSlots = Math.max(1, candles.length + futureSlots);
 const barSpace = plot.w / totalSlots;
 const candleWidth = clamp(barSpace * 0.62, 2, 12);
 const debugStats = buildChartDebugStats({
    visibleStartIndex,
    visibleEndIndex,
    panOffset,
   visibleLength: candles.length,
   visibleHigh: primaryMaxPrice,
   visibleLow: primaryMinPrice,
   scaleMinPrice: minPrice,
   scaleMaxPrice: maxPrice,
   bollingerBand
 });
 return {
   width,
   height,
   plot,
   volume,
   candles,
   emaLines,
   bollingerBand,
   minPrice,
   maxPrice,
   priceGridSegments,
   maxVolume,
   barSpace,
   candleWidth,
   firstTime,
   lastTime,
   unitSeconds,
   futureSlots,
   totalSlots,
   futureEndTime,
   debugStats
};
}
function currentAnimatedChartVisibleCount() {
 const animation = state.chart.zoomAnimation;
 const targetCount = clampChartVisibleCount(state.chart.visibleCount);
 if (!animation || !animation.startedAt) {
   state.chart.renderedVisibleCount = targetCount;
   return targetCount;
 }
 const now = chartAnimationNow();
 const progress = clamp((now - animation.startedAt) / Math.max(1, animation.duration), 0, 1);
 const eased = easeChartAnimation(progress);
 const rendered = interpolateChartValue(animation.fromCount, animation.targetCount, eased);
 state.chart.renderedVisibleCount = rendered;
 if (progress >= 1) {
   animation.startedAt = 0;
   state.chart.renderedVisibleCount = animation.targetCount;
   return clampChartVisibleCount(animation.targetCount);
 }
 requestChartAnimationFrame();
 return clampChartVisibleCount(rendered);
}
function startChartZoomAnimation(targetCount) {
 const animation = state.chart.zoomAnimation;
 if (!animation) return;
 const currentCount = finiteNumber(state.chart.renderedVisibleCount, state.chart.visibleCount);
 animation.fromCount = clampChartVisibleCount(currentCount);
 animation.targetCount = clampChartVisibleCount(targetCount);
 animation.startedAt = chartAnimationNow();
 animation.duration = isFuturesMode() ? FUTURES_CHART_ZOOM_ANIMATION_MS : CHART_ZOOM_ANIMATION_MS;
 state.chart.priceScaleAnimation.animateNext = true;
 requestChartAnimationFrame();
}
function currentAnimatedPriceScale(targetMinPrice, targetMaxPrice) {
 const animation = state.chart.priceScaleAnimation;
 if (
   !animation ||
   !Number.isFinite(targetMinPrice) ||
   !Number.isFinite(targetMaxPrice) ||
   targetMaxPrice <= targetMinPrice
 ) {
   return { minPrice: targetMinPrice, maxPrice: targetMaxPrice };
 }
 const hasCurrentScale =
   Number.isFinite(animation.minPrice) &&
   Number.isFinite(animation.maxPrice) &&
   animation.maxPrice > animation.minPrice;
 if (!hasCurrentScale) {
   animation.minPrice = targetMinPrice;
   animation.maxPrice = targetMaxPrice;
   animation.targetMinPrice = targetMinPrice;
   animation.targetMaxPrice = targetMaxPrice;
   animation.animateNext = false;
   return { minPrice: targetMinPrice, maxPrice: targetMaxPrice };
 }
 const currentTargetChanged =
   !nearlySameChartPrice(animation.targetMinPrice, targetMinPrice) ||
   !nearlySameChartPrice(animation.targetMaxPrice, targetMaxPrice);
 if (animation.animateNext) {
   animation.fromMinPrice = animation.minPrice;
   animation.fromMaxPrice = animation.maxPrice;
   animation.targetMinPrice = targetMinPrice;
   animation.targetMaxPrice = targetMaxPrice;
   animation.startedAt = chartAnimationNow();
   animation.duration = isFuturesMode() ? FUTURES_PRICE_SCALE_ANIMATION_MS : PRICE_SCALE_ANIMATION_MS;
   animation.animateNext = false;
   requestChartAnimationFrame();
 } else if (animation.startedAt && currentTargetChanged) {
   animation.targetMinPrice = targetMinPrice;
   animation.targetMaxPrice = targetMaxPrice;
   requestChartAnimationFrame();
 }
 if (!animation.startedAt) {
   animation.minPrice = targetMinPrice;
   animation.maxPrice = targetMaxPrice;
   animation.targetMinPrice = targetMinPrice;
   animation.targetMaxPrice = targetMaxPrice;
   return { minPrice: targetMinPrice, maxPrice: targetMaxPrice };
 }
 const now = chartAnimationNow();
 const progress = clamp((now - animation.startedAt) / Math.max(1, animation.duration), 0, 1);
 const eased = easeChartAnimation(progress);
 animation.minPrice = interpolateChartValue(animation.fromMinPrice, animation.targetMinPrice, eased);
 animation.maxPrice = interpolateChartValue(animation.fromMaxPrice, animation.targetMaxPrice, eased);
 if (progress >= 1) {
   animation.startedAt = 0;
   animation.minPrice = targetMinPrice;
   animation.maxPrice = targetMaxPrice;
   animation.targetMinPrice = targetMinPrice;
   animation.targetMaxPrice = targetMaxPrice;
 } else {
   requestChartAnimationFrame();
 }
 return { minPrice: animation.minPrice, maxPrice: animation.maxPrice };
}
function chartZoomTightness(visibleTotal) {
 const loadedCount = chartVisibleMaxCount();
 const minCount = chartVisibleMinCount(loadedCount);
 if (loadedCount <= minCount) return 1;
 return clamp((loadedCount - visibleTotal) / (loadedCount - minCount), 0, 1);
}
function interpolateChartValue(start, end, amount) {
 return start + (end - start) * amount;
}
function chartPriceGridSegments(plotHeight) {
 return plotHeight >= 300 ? 7 : plotHeight >= 220 ? 6 : 5;
}
function chartVolumeScaleMax(candles) {
 const volumes = candles
   .map((candle) => parseChartNumber(candle.volume, 0))
   .filter((volume) => Number.isFinite(volume) && volume >= 0)
   .sort((a, b) => a - b);
 if (!volumes.length) return 1;
 const max = volumes[volumes.length - 1];
 return Math.max(1, max * 1.08);
}
function requestChartAnimationFrame() {
 const zoomAnimation = state.chart.zoomAnimation;
 const priceAnimation = state.chart.priceScaleAnimation;
 if ((zoomAnimation && zoomAnimation.frame) || (priceAnimation && priceAnimation.frame)) return;
 const frame = requestAnimationFrame(() => {
   if (state.chart.zoomAnimation) state.chart.zoomAnimation.frame = null;
   if (state.chart.priceScaleAnimation) state.chart.priceScaleAnimation.frame = null;
   drawChart();
 });
 if (zoomAnimation) zoomAnimation.frame = frame;
 if (priceAnimation) priceAnimation.frame = frame;
}
function resetChartAnimations() {
 const zoomAnimation = state.chart.zoomAnimation;
 const priceAnimation = state.chart.priceScaleAnimation;
 if (zoomAnimation && zoomAnimation.frame) cancelAnimationFrame(zoomAnimation.frame);
 if (priceAnimation && priceAnimation.frame && (!zoomAnimation || priceAnimation.frame !== zoomAnimation.frame)) {
   cancelAnimationFrame(priceAnimation.frame);
 }
 if (zoomAnimation) {
   zoomAnimation.frame = null;
   zoomAnimation.startedAt = 0;
   zoomAnimation.fromCount = state.chart.visibleCount;
   zoomAnimation.targetCount = state.chart.visibleCount;
 }
 state.chart.renderedVisibleCount = state.chart.visibleCount;
 if (priceAnimation) {
   priceAnimation.frame = null;
   priceAnimation.startedAt = 0;
   priceAnimation.minPrice = null;
   priceAnimation.maxPrice = null;
   priceAnimation.fromMinPrice = null;
   priceAnimation.fromMaxPrice = null;
   priceAnimation.targetMinPrice = null;
   priceAnimation.targetMaxPrice = null;
   priceAnimation.animateNext = false;
 }
}
function chartAnimationNow() {
 return window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now();
}
function easeChartAnimation(progress) {
 const t = clamp(progress, 0, 1);
 return 1 - Math.pow(1 - t, 3);
}
function nearlySameChartPrice(a, b) {
 if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
 const tickTolerance = chartMinimumAbsolutePriceRange() * 0.25;
 return Math.abs(a - b) <= Math.max(tickTolerance, Math.abs(b) * 0.000001);
}
function drawGrid(ctx, metrics) {
 const { plot, volume } = metrics;
 ctx.save();
 ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
 ctx.lineWidth = 1;
 ctx.fillStyle = "#8d9bad";
 ctx.font = "12px Segoe UI, sans-serif";
 const priceGridSegments = metrics.priceGridSegments || 5;
 for (let i = 0; i <= priceGridSegments; i += 1) {
   const y = plot.y + (plot.h / priceGridSegments) * i;
   ctx.beginPath();
   ctx.moveTo(plot.x, y);
   ctx.lineTo(plot.x + plot.w, y);
   ctx.stroke();
   const price = metrics.maxPrice - ((metrics.maxPrice - metrics.minPrice) / priceGridSegments) * i;
   ctx.fillText(formatActivePrice(price), plot.x + plot.w + 8, y + 4);
 }
 const labelCount = clamp(Math.round(plot.w / 160), 5, 8);
 for (let i = 0; i < labelCount; i += 1) {
   const x = plot.x + (plot.w / Math.max(1, labelCount - 1)) * i;
   ctx.beginPath();
   ctx.moveTo(x, plot.y);
   ctx.lineTo(x, volume.y + volume.h);
   ctx.stroke();
   if (metrics.candles.length) {
     const index = Math.min(
       metrics.candles.length - 1,
       Math.round((metrics.candles.length - 1) * (i / Math.max(1, labelCount - 1)))
     );
     const label = formatCandleTime(metrics.candles[index].time);
     const labelWidth = ctx.measureText(label).width;
     ctx.fillText(label, clamp(x + 4, plot.x, plot.x + plot.w - labelWidth), volume.y + volume.h + 24);
   }
 }
 ctx.strokeStyle = "rgba(148, 163, 184, 0.26)";
 ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);
 ctx.strokeRect(volume.x, volume.y, volume.w, volume.h);
 ctx.restore();
}
function prepareVisibleSupportResistanceLevels() {
 const assistant = state.rangeAssistant;
 if (!assistant.enabled || !assistant.zones.length) {
   clearSupportResistanceOverlay();
   return [];
 }
 const currentPrice = rangeAssistantCurrentPrice();
 if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
   clearSupportResistanceOverlay();
   return [];
 }
 const selected = selectVisibleSupportResistanceLevels(
   assistant.zones,
   currentPrice,
   assistant.currentFiveMinuteAtr
 );
 const countsChanged =
   assistant.supportCandidateCount !== selected.supportCandidateCount ||
   assistant.resistanceCandidateCount !== selected.resistanceCandidateCount;
 assistant.supportCandidateCount = selected.supportCandidateCount;
 assistant.resistanceCandidateCount = selected.resistanceCandidateCount;
 assistant.visibleLevels = selected.support.concat(selected.resistance);
 if (countsChanged) renderRangeAssistantControls();
 return assistant.visibleLevels;
}
function renderSupportResistanceLines(ctx, metrics) {
 if (!state.rangeAssistant.enabled) return;
 const levels = prepareVisibleSupportResistanceLevels();
 if (!levels.length) return;
 const drawable = levels
   .filter((level) => level.centerPrice >= metrics.minPrice && level.centerPrice <= metrics.maxPrice)
   .map((level) => ({ level, y: priceToY(metrics, level.centerPrice) }));
 if (!drawable.length) return;
 ctx.save();
 ctx.font = "700 11px Segoe UI, sans-serif";
 ctx.textBaseline = "middle";
 drawable
   .sort((a, b) => a.y - b.y)
   .forEach(({ level, y }) => {
     const rgb = level.type === "support" ? "56, 189, 248" : "244, 114, 182";
     const opacity = clamp(0.44 + level.score * 0.0032, 0.44, 0.76);
     ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
     ctx.lineWidth = level.score >= 80 ? 1.4 : level.score >= 55 ? 1.2 : 1;
     ctx.setLineDash([]);
     ctx.beginPath();
     ctx.moveTo(metrics.plot.x, y);
     ctx.lineTo(metrics.plot.x + metrics.plot.w, y);
     ctx.stroke();
     const labelWidth = ctx.measureText(level.label).width;
     const labelX = metrics.plot.x + metrics.plot.w - labelWidth - 6;
     const labelY = clamp(y, metrics.plot.y + 8, metrics.plot.y + metrics.plot.h - 8);
     ctx.lineWidth = 3.5;
     ctx.strokeStyle = "rgba(8, 13, 20, 0.92)";
     ctx.strokeText(level.label, labelX, labelY);
     ctx.fillStyle = `rgba(${rgb}, 0.96)`;
     ctx.fillText(level.label, labelX, labelY);
   });
 ctx.restore();
}
function drawCandles(ctx, metrics) {
 ctx.save();
 metrics.candles.forEach((candle, index) => {
   const x = xForIndex(metrics, index);
   const yOpen = priceToY(metrics, candle.open);
   const yClose = priceToY(metrics, candle.close);
   const yHigh = priceToY(metrics, candle.high);
   const yLow = priceToY(metrics, candle.low);
   const rising = candle.close >= candle.open;
   const color = rising ? "#24d47b" : "#ff5c72";
   ctx.strokeStyle = color;
   ctx.fillStyle = color;
   ctx.lineWidth = 1.2;
   ctx.beginPath();
   ctx.moveTo(x, yHigh);
   ctx.lineTo(x, yLow);
   ctx.stroke();
   const bodyTop = Math.min(yOpen, yClose);
   const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
   ctx.fillRect(x - metrics.candleWidth / 2, bodyTop, metrics.candleWidth, bodyHeight);
 });
 ctx.restore();
}
function drawEmaLines(ctx, metrics) {
 if (!metrics.emaLines || !metrics.emaLines.length) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 ctx.lineWidth = 2;
 ctx.lineJoin = "round";
 ctx.lineCap = "round";
 metrics.emaLines.forEach((line) => {
   let drawing = false;
   ctx.beginPath();
   ctx.strokeStyle = line.color;
   line.values.forEach((value, index) => {
     if (!Number.isFinite(value)) {
       if (drawing) {
         ctx.stroke();
         ctx.beginPath();
         drawing = false;
       }
       return;
     }
     const x = xForIndex(metrics, index);
     const y = priceToY(metrics, value);
     if (!drawing) {
       ctx.moveTo(x, y);
       drawing = true;
     } else {
       ctx.lineTo(x, y);
     }
   });
   if (drawing) ctx.stroke();
 });
 ctx.restore();
}
function drawBollingerBand(ctx, metrics) {
 const band = metrics.bollingerBand;
 if (!band) return;
 const hasBand = band.upper.some(Number.isFinite) && band.lower.some(Number.isFinite);
 if (!hasBand) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 const drawBandFillSegment = (upperPoints, lowerPoints) => {
   if (upperPoints.length <= 1) return;
   ctx.beginPath();
   ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
   for (let i = 1; i < upperPoints.length; i += 1) {
     ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
   }
   for (let i = lowerPoints.length - 1; i >= 0; i -= 1) {
     ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
   }
   ctx.closePath();
   ctx.fillStyle = band.fillColor;
   ctx.fill();
 };
 let upperPoints = [];
 let lowerPoints = [];
 band.upper.forEach((upper, index) => {
   const lower = band.lower[index];
   if (!Number.isFinite(upper) || !Number.isFinite(lower)) {
     drawBandFillSegment(upperPoints, lowerPoints);
     upperPoints = [];
     lowerPoints = [];
     return;
   }
   upperPoints.push({ x: xForIndex(metrics, index), y: priceToY(metrics, upper) });
   lowerPoints.push({ x: xForIndex(metrics, index), y: priceToY(metrics, lower) });
 });
 drawBandFillSegment(upperPoints, lowerPoints);
 drawBollingerLine(ctx, metrics, band.upper, band.color, 1.45, []);
 drawBollingerLine(ctx, metrics, band.middle, band.middleColor, 1.1, [4, 4]);
 drawBollingerLine(ctx, metrics, band.lower, band.color, 1.45, []);
 ctx.restore();
}
function drawBollingerLine(ctx, metrics, values, color, width, dash) {
 let drawing = false;
 ctx.beginPath();
 ctx.strokeStyle = color;
 ctx.lineWidth = width;
 ctx.lineJoin = "round";
 ctx.lineCap = "round";
 ctx.setLineDash(dash);
 values.forEach((value, index) => {
   if (!Number.isFinite(value)) {
     if (drawing) {
       ctx.stroke();
       ctx.beginPath();
       drawing = false;
     }
     return;
   }
   const x = xForIndex(metrics, index);
   const y = priceToY(metrics, value);
   if (!drawing) {
     ctx.moveTo(x, y);
     drawing = true;
   } else {
     ctx.lineTo(x, y);
   }
 });
 if (drawing) ctx.stroke();
}
function lastVisibleValue(values, visibleStartIndex, visibleLength) {
 const index = visibleStartIndex + visibleLength - 1;
 const value = values[index];
 return Number.isFinite(value) ? value : null;
}
function countInvalidIndicatorValues(values) {
 return values.reduce((count, value) => count + (Number.isFinite(value) ? 0 : 1), 0);
}
function countMissingCandleIntervals(candles, expectedSeconds) {
 const gapSeconds = Math.max(1, Math.round(expectedSeconds || timeframeSeconds(state.timeframe)));
 let missingCount = 0;
 for (let i = 1; i < candles.length; i += 1) {
   const prevTime = finiteNumber(candles[i - 1] && candles[i - 1].time, NaN);
   const nextTime = finiteNumber(candles[i] && candles[i].time, NaN);
   const gap = nextTime - prevTime;
   if (!Number.isFinite(gap) || gap <= gapSeconds) continue;
   missingCount += Math.max(1, Math.round(gap / gapSeconds) - 1);
 }
 return missingCount;
}
function timeframeMissingDebugKey(timeframe = state.timeframe) {
 const normalized = normalizeTimeframe(timeframe);
 if (normalized.endsWith("s")) return `missing${normalized}`;
 const minutes = TIMEFRAME_MINUTES[normalized] || timeframeSeconds(normalized) / 60;
 return `missing${String(minutes).replace(".", "_")}m`;
}
function buildChartDebugStats(options) {
 const candles = activeAnalysisCandles();
 const visibleStartIndex = options.visibleStartIndex;
 const visibleLength = options.visibleLength;
 const visibleCandles = candles.slice(visibleStartIndex, visibleStartIndex + visibleLength);
 const lastCandle = visibleCandles[visibleCandles.length - 1] || null;
 const realtimeCandle = activeRealtimeCandle();
 const lastClosedCandle = activeLastClosedCandle();
 const expectedSeconds = timeframeSeconds(state.timeframe);
 const nowMs = Date.now();
 const ema = {};
 let invalidIndicatorCount = 0;
 MOVING_AVERAGE_CONFIGS.forEach((config) => {
   const values = calculateConfiguredMovingAverage(candles, config);
   const visibleValues = values.slice(visibleStartIndex, visibleStartIndex + visibleLength);
   ema[config.key] = lastVisibleValue(values, visibleStartIndex, visibleLength);
   invalidIndicatorCount += countInvalidIndicatorValues(visibleValues);
 });
 const bollinger = { upper: null, middle: null, lower: null };
 if (options.bollingerBand) {
   const lastIndex = Math.max(0, visibleLength - 1);
   bollinger.upper = Number.isFinite(options.bollingerBand.upper[lastIndex]) ? options.bollingerBand.upper[lastIndex] : null;
   bollinger.middle = Number.isFinite(options.bollingerBand.middle[lastIndex]) ? options.bollingerBand.middle[lastIndex] : null;
   bollinger.lower = Number.isFinite(options.bollingerBand.lower[lastIndex]) ? options.bollingerBand.lower[lastIndex] : null;
   invalidIndicatorCount += countInvalidIndicatorValues(options.bollingerBand.upper);
   invalidIndicatorCount += countInvalidIndicatorValues(options.bollingerBand.middle);
   invalidIndicatorCount += countInvalidIndicatorValues(options.bollingerBand.lower);
   invalidIndicatorCount += finiteNumber(options.bollingerBand.invalidCount, 0);
 }
 const dataStats = state.chart.lastDataStats || createEmptyChartDataStats("unknown");
 return {
   visibleCount: visibleCandles.length,
   firstTime: visibleCandles[0] ? visibleCandles[0].time : 0,
   lastTime: lastCandle ? lastCandle.time : 0,
   visibleHigh: options.visibleHigh,
   visibleLow: options.visibleLow,
   scaleMinPrice: options.scaleMinPrice,
   scaleMaxPrice: options.scaleMaxPrice,
   lastCandle,
   ema20: ema.ema20m,
   ema50: ema.ema50m,
   ema90: ema.ema90m,
   sma10d: ema.sma10d,
   sma30d: ema.sma30d,
   sma50d: ema.sma50d,
   sma100d: ema.sma100d,
   sma200d: ema.sma200d,
   dailyMaCandleCount: state.chart.dailyMaCandles.length,
   dailyMaError: state.chart.dailyMaError,
   bollinger,
   invalidIndicatorCount,
   duplicateTimestampCount: dataStats.duplicateTimestampCount || 0,
   missingTimestampCount: countMissingCandleIntervals(visibleCandles, expectedSeconds),
   missingTimestampLabel: timeframeMissingDebugKey(state.timeframe),
   invalidOhlcCount: dataStats.invalidOhlcCount || 0,
   openContinuityFixCount: dataStats.openContinuityFixCount || 0,
   lastClosedCandleTime: lastClosedCandle ? lastClosedCandle.time : 0,
   realtimeCandleTime: realtimeCandle ? realtimeCandle.time : 0,
   isLastCandleClosed: lastCandle ? isCandleClosed(lastCandle, nowMs / 1000) : false,
   lastRawTimestamp: lastCandle ? lastCandle.time * 1000 : NaN,
   nowTimestamp: nowMs
 };
}
function buildVisibleEmaLines(visibleStartIndex, visibleLength) {
 const candles = activeAnalysisCandles();
 if (!candles.length || visibleLength <= 0) return [];
 return MOVING_AVERAGE_CONFIGS
   .filter((config) => state.chart.emaVisible[config.key] !== false)
   .map((config) => {
     const period = config.type === "daily-sma"
       ? config.periodDays
       : getEmaPeriodByTimeframe(state.timeframe, config.targetMinutes);
     const values = calculateConfiguredMovingAverage(candles, config)
       .slice(visibleStartIndex, visibleStartIndex + visibleLength);
     return { ...config, period, values };
   })
   .filter((line) => line.values.some(Number.isFinite));
}
function buildVisibleBollingerBand(visibleStartIndex, visibleLength) {
 const candles = activeAnalysisCandles();
 if (!state.chart.bollingerVisible || !candles.length || visibleLength <= 0) return null;
 const band = calculateBollingerBands(candles, BOLLINGER_CONFIG.period, BOLLINGER_CONFIG.multiplier);
 const visibleCandles = candles.slice(visibleStartIndex, visibleStartIndex + visibleLength);
 const visibleBand = {
   ...BOLLINGER_CONFIG,
   upper: band.upper.slice(visibleStartIndex, visibleStartIndex + visibleLength),
   middle: band.middle.slice(visibleStartIndex, visibleStartIndex + visibleLength),
   lower: band.lower.slice(visibleStartIndex, visibleStartIndex + visibleLength),
   invalidCount: 0
 };
 validateVisibleBollingerBand(visibleBand, visibleCandles);
 const values = visibleBand.upper.concat(visibleBand.middle, visibleBand.lower);
 return values.some(Number.isFinite) ? visibleBand : null;
}
function validateVisibleBollingerBand(band, candles) {
 const highs = candles.map((candle) => candle.high).filter(Number.isFinite);
 const lows = candles.map((candle) => candle.low).filter(Number.isFinite);
 const visibleHigh = highs.length ? Math.max(...highs) : 0;
 const visibleLow = lows.length ? Math.min(...lows) : 0;
 const visibleRange = Math.max(
  visibleHigh - visibleLow,
  Math.abs((visibleHigh + visibleLow) / 2) * 0.0004,
  chartMinimumAbsolutePriceRange()
 );
 let invalidCount = 0;
 for (let i = 0; i < band.upper.length; i += 1) {
   const upper = band.upper[i];
   const middle = band.middle[i];
   const lower = band.lower[i];
   const hasAny = upper !== null || middle !== null || lower !== null;
   if (!hasAny) continue;
   const valid =
     Number.isFinite(upper) &&
     Number.isFinite(middle) &&
     Number.isFinite(lower) &&
     upper >= middle &&
     middle >= lower &&
     upper >= lower &&
     upper - lower <= visibleRange * 8;
   if (!valid) {
     band.upper[i] = null;
     band.middle[i] = null;
     band.lower[i] = null;
     invalidCount += 1;
   }
 }
 band.invalidCount = invalidCount;
 if (invalidCount) console.warn("[chart-indicator] invalid Bollinger points skipped", { invalidCount });
}
function getEmaPeriodByTimeframe(timeframe, targetMinutes) {
 const candleMinutes = TIMEFRAME_MINUTES[String(timeframe)];
 if (!candleMinutes) {
   throw new Error("Unsupported timeframe: " + timeframe);
 }
 return Math.max(1, Math.round(targetMinutes / candleMinutes));
}
function calculateConfiguredMovingAverage(candles, config) {
 if (config && config.type === "daily-sma") {
   return calculateDailySMA(candles, state.chart.dailyMaCandles, config.periodDays);
 }
 const period = getEmaPeriodByTimeframe(state.timeframe, config.targetMinutes);
 return calculateEMA(candles, period);
}
function dailyCandleLowerBound(dailyCandles, dayStart) {
 let low = 0;
 let high = dailyCandles.length;
 while (low < high) {
   const middle = Math.floor((low + high) / 2);
   if (dailyCandles[middle].time < dayStart) low = middle + 1;
   else high = middle;
 }
 return low;
}
function calculateDailySMA(candles, dailyCandles, periodDays) {
 const chartCandles = Array.isArray(candles) ? candles : [];
 const history = Array.isArray(dailyCandles) ? dailyCandles : [];
 const period = Math.max(1, Math.round(periodDays));
 const values = new Array(chartCandles.length).fill(null);
 if (!chartCandles.length || history.length < period - 1) return values;
 const prefixSums = new Array(history.length + 1).fill(0);
 for (let index = 0; index < history.length; index += 1) {
   const close = parseChartNumber(history[index] && history[index].close, NaN);
   if (!Number.isFinite(close)) return values;
   prefixSums[index + 1] = prefixSums[index] + close;
 }
 chartCandles.forEach((candle, index) => {
   const time = finiteNumber(candle && candle.time, NaN);
   const close = parseChartNumber(candle && candle.close, NaN);
   if (!Number.isFinite(time) || !Number.isFinite(close)) return;
   const dayStart = Math.floor(time / 86400) * 86400;
   const previousDayEnd = dailyCandleLowerBound(history, dayStart);
   const previousDayStart = previousDayEnd - (period - 1);
   if (previousDayStart < 0) return;
   const previousCloseSum = prefixSums[previousDayEnd] - prefixSums[previousDayStart];
   values[index] = (previousCloseSum + close) / period;
 });
 return values;
}
function calculateEMA(candles, period) {
 if (!candles) return [];
 const emaValues = new Array(candles.length).fill(null);
 if (candles.length < period) return emaValues;
 const multiplier = 2 / (period + 1);
 let sma = 0;
 for (let i = 0; i < period; i += 1) {
   const close = parseChartNumber(candles[i].close, NaN);
   if (!Number.isFinite(close)) return emaValues;
   sma += close;
 }
 sma /= period;
 emaValues[period - 1] = sma;
 for (let i = period; i < candles.length; i += 1) {
   const close = parseChartNumber(candles[i].close, NaN);
   const previous = emaValues[i - 1];
   emaValues[i] = Number.isFinite(close) && Number.isFinite(previous)
     ? close * multiplier + previous * (1 - multiplier)
     : null;
 }
 return emaValues;
}
function calculateBollingerBands(candles, period, multiplier) {
 const length = Array.isArray(candles) ? candles.length : 0;
 const upper = new Array(length).fill(null);
 const middle = new Array(length).fill(null);
 const lower = new Array(length).fill(null);
 if (length < period) return { upper, middle, lower };
 let sum = 0;
 let sumSquares = 0;
 for (let i = 0; i < length; i += 1) {
   const close = parseChartNumber(candles[i].close, NaN);
   if (!Number.isFinite(close)) continue;
   sum += close;
   sumSquares += close * close;
   if (i >= period) {
     const oldClose = parseChartNumber(candles[i - period].close, NaN);
     if (!Number.isFinite(oldClose)) continue;
     sum -= oldClose;
     sumSquares -= oldClose * oldClose;
   }
   if (i < period - 1) continue;
   const mean = sum / period;
   const variance = Math.max(0, sumSquares / period - mean * mean);
   const deviation = Math.sqrt(variance) * multiplier;
   middle[i] = mean;
   upper[i] = mean + deviation;
   lower[i] = mean - deviation;
 }
 return { upper, middle, lower };
}
function drawVolume(ctx, metrics) {
 ctx.save();
 metrics.candles.forEach((candle, index) => {
   const x = xForIndex(metrics, index);
   const rising = candle.close >= candle.open;
   const color = rising ? "rgba(36, 212, 123, 0.42)" : "rgba(255, 92, 114, 0.42)";
   const h = clamp((candle.volume / metrics.maxVolume) * metrics.volume.h, 0, metrics.volume.h);
   ctx.fillStyle = color;
   ctx.fillRect(x - metrics.candleWidth / 2, metrics.volume.y + metrics.volume.h - h, metrics.candleWidth, Math.max(1, h));
 });
 ctx.restore();
}
function drawCurrentPrice(ctx, metrics) {
  const last = metrics.candles[metrics.candles.length - 1];
  const fallbackPrice = last && Number.isFinite(last.close) ? last.close : NaN;
  const livePrice = isFuturesMode()
    ? currentFuturesPrice()
    : finiteNumber(state.ticker && state.ticker.price, 0);
  // The position PnL overlay uses the live ticker. Use that same price for the
  // yellow current-price line even when the chart is panned to older candles.
  const price = livePrice > 0 ? livePrice : fallbackPrice;
  if (!Number.isFinite(price)) return;
 const y = priceToY(metrics, price);
 if (y < metrics.plot.y || y > metrics.plot.y + metrics.plot.h) return;
 ctx.save();
 ctx.setLineDash([6, 5]);
 ctx.strokeStyle = "rgba(246, 196, 83, 0.82)";
 ctx.beginPath();
 ctx.moveTo(metrics.plot.x, y);
 ctx.lineTo(metrics.plot.x + metrics.plot.w, y);
 ctx.stroke();
 ctx.setLineDash([]);
 const label = formatActivePrice(price);
 const labelWidth = Math.min(118, Math.ceil(ctx.measureText(label).width + 12));
 ctx.fillStyle = "#f6c453";
 ctx.fillRect(metrics.plot.x + metrics.plot.w + 4, y - 10, labelWidth, 20);
 ctx.fillStyle = "#101010";
 ctx.font = "700 11px Segoe UI, sans-serif";
 ctx.fillText(label, metrics.plot.x + metrics.plot.w + 8, y + 4);
 ctx.restore();
}
function drawRiskBlocks(ctx, metrics) {
 const blocks = currentRiskBlocks();
 if (!blocks.length) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 blocks.forEach((block) => {
   const geom = riskBlockGeometry(block, metrics);
   if (!geom || geom.x2 < metrics.plot.x || geom.x1 > metrics.plot.x + metrics.plot.w) return;
   const selected = block.id === state.chart.selectedRiskBlockId;
   const left = Math.max(metrics.plot.x, geom.x1);
   const right = Math.min(metrics.plot.x + metrics.plot.w, geom.x2);
   const width = Math.max(1, right - left);
   const top = Math.max(metrics.plot.y, geom.yTop);
   const entry = clamp(geom.yEntry, metrics.plot.y, metrics.plot.y + metrics.plot.h);
   const bottom = Math.min(metrics.plot.y + metrics.plot.h, geom.yBottom);
   const isShort = block.direction === "SHORT";
   ctx.fillStyle = isShort ? "rgba(255, 92, 114, 0.16)" : "rgba(36, 212, 123, 0.16)";
   ctx.fillRect(left, top, width, Math.max(0, entry - top));
   ctx.fillStyle = isShort ? "rgba(36, 212, 123, 0.16)" : "rgba(255, 92, 114, 0.16)";
   ctx.fillRect(left, entry, width, Math.max(0, bottom - entry));
   ctx.strokeStyle = selected ? "rgba(246, 196, 83, 0.9)" : "rgba(232, 238, 247, 0.26)";
   ctx.lineWidth = selected ? 1.8 : 1.1;
   ctx.strokeRect(left, top, width, Math.max(1, bottom - top));
   ctx.strokeStyle = selected ? "rgba(246, 196, 83, 0.92)" : "rgba(232, 238, 247, 0.46)";
   ctx.setLineDash([6, 4]);
   ctx.beginPath();
   ctx.moveTo(left, entry);
   ctx.lineTo(right, entry);
   ctx.stroke();
   ctx.setLineDash([]);
   drawRiskBlockLabel(ctx, block, geom, metrics);
   if (selected) drawRiskBlockHandles(ctx, geom, metrics);
 });
 ctx.restore();
}
function drawRiskBlockLabel(ctx, block, geom, metrics) {
 const rewardPercent = block.entryPrice > 0 ? (block.rewardHeight / block.entryPrice) * 100 : 0;
 const riskPercent = block.entryPrice > 0 ? -(block.riskHeight / block.entryPrice) * 100 : 0;
 const lineOne = `TP ${formatSignedPercent(rewardPercent)} | SL ${formatSignedPercent(riskPercent)} | ${formatRatioPair(block.rewardRatio, block.riskRatio)}`;
 const lineTwo = `진입 ${formatActivePrice(block.entryPrice)} | 익절 ${formatActivePrice(block.takeProfitPrice)} | 손절 ${formatActivePrice(block.stopLossPrice)}`;
 const x = clamp(geom.x1 + 8, metrics.plot.x + 4, metrics.plot.x + metrics.plot.w - 120);
 const y = clamp(geom.yTop + 16, metrics.plot.y + 16, metrics.plot.y + metrics.plot.h - 22);
 ctx.save();
 ctx.font = "700 11px Segoe UI, sans-serif";
 const labelWidth = Math.min(
   metrics.plot.w - 8,
   Math.max(ctx.measureText(lineOne).width, ctx.measureText(lineTwo).width) + 12
 );
 ctx.fillStyle = "rgba(8, 13, 20, 0.78)";
 ctx.fillRect(x - 6, y - 13, labelWidth, 32);
 ctx.fillStyle = "#d8e4f2";
 ctx.fillText(lineOne, x, y);
 ctx.fillStyle = "#9aa7b7";
 ctx.fillText(lineTwo, x, y + 14);
 ctx.restore();
}
function drawRiskBlockHandles(ctx, geom, metrics) {
 const handles = riskBlockHandles(geom);
 ctx.save();
 ctx.fillStyle = "#f6c453";
 ctx.strokeStyle = "rgba(8, 13, 20, 0.9)";
 ctx.lineWidth = 1;
 Object.values(handles).forEach((handle) => {
   const x = clamp(handle.x, metrics.plot.x + 2, metrics.plot.x + metrics.plot.w - 2);
   const y = clamp(handle.y, metrics.plot.y + 2, metrics.plot.y + metrics.plot.h - 2);
   const handleHeight = clamp(Math.abs(geom.yBottom - geom.yTop), 28, 74);
   ctx.beginPath();
   roundedRect(ctx, x - RISK_HANDLE_SIZE / 2, y - handleHeight / 2, RISK_HANDLE_SIZE, handleHeight, 4);
   ctx.fill();
   ctx.stroke();
 });
 ctx.restore();
}
function drawPercentMeasurement(ctx, metrics) {
 const completed = state.chart.percentMeasurement;
 const pendingStart = state.chart.percentMeasureStart;
 const timeframe = String(state.timeframe);
 const start = pendingStart && String(pendingStart.timeframe) === timeframe
   ? pendingStart
   : completed && String(completed.timeframe) === timeframe
     ? completed.start
     : null;
 if (!start) return;
 const end = pendingStart
   ? (state.chart.percentMeasureMode && state.chart.hover ? state.chart.hover : null)
   : completed.end;
 const x1 = xForTime(metrics, start.time);
 const y1 = priceToY(metrics, start.price);
 if (![x1, y1].every(Number.isFinite)) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 const drawDot = (x, y, color) => {
   ctx.fillStyle = "rgba(8, 13, 20, 0.96)";
   ctx.strokeStyle = color;
   ctx.lineWidth = 2.4;
   ctx.beginPath();
   ctx.arc(x, y, 5, 0, Math.PI * 2);
   ctx.fill();
   ctx.stroke();
 };
 if (!end) {
   drawDot(x1, y1, "#f6c453");
   ctx.restore();
   return;
 }
 const x2 = xForTime(metrics, end.time);
 const y2 = priceToY(metrics, end.price);
 if (![x2, y2].every(Number.isFinite)) {
   ctx.restore();
   return;
 }
 const percent = start.price > 0 ? ((end.price - start.price) / start.price) * 100 : 0;
 const color = percent >= 0 ? "#24d47b" : "#ff5c72";
 ctx.strokeStyle = color;
 ctx.lineWidth = 2;
 ctx.setLineDash([7, 5]);
 ctx.beginPath();
 ctx.moveTo(x1, y1);
 ctx.lineTo(x2, y2);
 ctx.stroke();
 ctx.setLineDash([]);
 drawDot(x1, y1, color);
 drawDot(x2, y2, color);
 const label = formatSignedPercent(percent);
 ctx.font = "800 13px Segoe UI, sans-serif";
 const labelWidth = Math.ceil(ctx.measureText(label).width + 16);
 const labelX = clamp((x1 + x2) / 2 - labelWidth / 2, metrics.plot.x + 4, metrics.plot.x + metrics.plot.w - labelWidth - 4);
 const labelY = clamp((y1 + y2) / 2 - 13, metrics.plot.y + 4, metrics.plot.y + metrics.plot.h - 30);
 ctx.fillStyle = "rgba(8, 13, 20, 0.92)";
 ctx.strokeStyle = color;
 ctx.lineWidth = 1.4;
 ctx.beginPath();
 roundedRect(ctx, labelX, labelY, labelWidth, 26, 6);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = color;
 ctx.fillText(label, labelX + 8, labelY + 18);
 ctx.restore();
}
function fibonacciGeometry(line, metrics) {
 if (!line || !metrics) return null;
 const x1 = xForTime(metrics, line.startTime);
 const x2 = xForTime(metrics, line.endTime);
 const y1 = priceToY(metrics, line.startPrice);
 const y2 = priceToY(metrics, line.endPrice);
 if (![x1, x2, y1, y2].every(Number.isFinite)) return null;
 return {
   x1,
   x2,
   y1,
   y2,
   xLeft: Math.min(x1, x2),
   xRight: Math.max(x1, x2),
   yTop: Math.min(y1, y2),
   yBottom: Math.max(y1, y2)
 };
}
function drawFibonacciLevels(ctx, metrics, line, options = {}) {
 const geometry = fibonacciGeometry(line, metrics);
 if (!geometry) return;
 const selected = options.selected === true;
 const preview = options.preview === true;
 const color = FIBONACCI_COLOR;
 ctx.save();
 ctx.strokeStyle = color;
 ctx.lineWidth = preview || selected ? 2.2 : 1.4;
 ctx.setLineDash(preview ? [6, 4] : []);
 ctx.font = "800 11px Segoe UI, sans-serif";
 FIBONACCI_LEVELS.forEach((level) => {
   const price = finiteNumber(line.startPrice, 0)
     + (finiteNumber(line.endPrice, 0) - finiteNumber(line.startPrice, 0)) * level.ratio;
   const y = priceToY(metrics, price);
   if (!Number.isFinite(y)) return;
   ctx.globalAlpha = preview || selected || level.ratio === 0 || level.ratio === 1 ? 1 : 0.78;
   ctx.beginPath();
   ctx.moveTo(geometry.xLeft, y);
   ctx.lineTo(geometry.xRight, y);
   ctx.stroke();
   const label = `${level.label}  ${formatActivePrice(price)}`;
   const labelWidth = Math.ceil(ctx.measureText(label).width + 10);
   const labelX = geometry.xRight + labelWidth + 8 <= metrics.plot.x + metrics.plot.w
     ? geometry.xRight + 5
     : Math.max(metrics.plot.x + 4, geometry.xRight - labelWidth - 5);
   const labelY = clamp(y - 4, metrics.plot.y + 12, metrics.plot.y + metrics.plot.h - 4);
   ctx.globalAlpha = 1;
   ctx.setLineDash([]);
   ctx.strokeStyle = "rgba(8, 13, 20, 0.92)";
   ctx.lineWidth = 3;
   ctx.strokeText(label, labelX + 5, labelY);
   ctx.fillStyle = color;
   ctx.fillText(label, labelX + 5, labelY);
   ctx.strokeStyle = color;
   ctx.lineWidth = preview || selected ? 2.2 : 1.4;
   ctx.setLineDash(preview ? [6, 4] : []);
 });
 ctx.setLineDash([]);
 ctx.restore();
}
function drawTrendlines(ctx, metrics) {
 const lines = currentTrendlines();
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
lines.forEach((line) => {
   const selected = line.id === state.chart.selectedTrendlineId;
   if (line.kind === "fibonacci") {
     drawFibonacciLevels(ctx, metrics, line, { selected });
     return;
   }
   const isHorizontal = line.kind === "horizontal";
   const x1 = isHorizontal ? metrics.plot.x : xForTime(metrics, line.startTime);
   const x2 = isHorizontal ? metrics.plot.x + metrics.plot.w : xForTime(metrics, line.endTime);
   const y1 = priceToY(metrics, line.startPrice);
   const y2 = isHorizontal ? y1 : priceToY(metrics, line.endPrice);
   ctx.strokeStyle = selected ? "#f6c453" : line.color || "#38bdf8";
   ctx.lineWidth = selected ? 3 : 2;
   ctx.beginPath();
   ctx.moveTo(x1, y1);
   ctx.lineTo(x2, y2);
   ctx.stroke();
   if (isHorizontal) return;
   ctx.fillStyle = ctx.strokeStyle;
   ctx.beginPath();
   ctx.arc(x1, y1, selected ? 4 : 3, 0, Math.PI * 2);
   ctx.arc(x2, y2, selected ? 4 : 3, 0, Math.PI * 2);
   ctx.fill();
 });
 if (state.chart.trendMode && state.chart.pendingPoint && state.chart.hover) {
   ctx.setLineDash([5, 5]);
   ctx.strokeStyle = state.chart.trendColor;
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(xForTime(metrics, state.chart.pendingPoint.time), priceToY(metrics, state.chart.pendingPoint.price));
   ctx.lineTo(state.chart.hover.x, state.chart.hover.y);
   ctx.stroke();
   ctx.setLineDash([]);
 }
 ctx.restore();
}
function drawFuturesLimitOrders(ctx, metrics) {
 if (!isFuturesMode()) return;
 const orders = currentChartPositionFilterId() ? [] : currentFuturesLimitOrders();
 const previewDirection = state.chart.limitOrderMode;
 if (!orders.length && !previewDirection) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 ctx.font = "800 11px Segoe UI, sans-serif";
 orders.forEach((order) => {
   const y = priceToY(metrics, order.price);
   if (y < metrics.plot.y || y > metrics.plot.y + metrics.plot.h) return;
   const isLong = order.direction === "LONG";
   const color = isLong ? "#2dd4bf" : "#fb7185";
   const label = `${isLong ? "예약 매수" : "예약 매도"} ${formatFuturesDisplayPrice(order.price, order.market)}`;
   ctx.setLineDash([8, 5]);
   ctx.strokeStyle = color;
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(metrics.plot.x, y);
   ctx.lineTo(metrics.plot.x + metrics.plot.w, y);
   ctx.stroke();
   ctx.setLineDash([]);
   const labelWidth = ctx.measureText(label).width + 14;
   const labelX = metrics.plot.x + 6;
   const labelY = clamp(y - 20, metrics.plot.y + 3, metrics.plot.y + metrics.plot.h - 21);
   ctx.fillStyle = "rgba(8, 13, 20, 0.9)";
   roundedRect(ctx, labelX, labelY, labelWidth, 18, 5);
   ctx.fill();
   ctx.strokeStyle = color;
   ctx.lineWidth = 1;
   ctx.stroke();
   ctx.fillStyle = color;
   ctx.fillText(label, labelX + 7, labelY + 13);
 });
 if (previewDirection && state.chart.hover && isInsidePlot(metrics, state.chart.hover.x, state.chart.hover.y)) {
   const isLong = previewDirection === "LONG";
   const color = isLong ? "rgba(45, 212, 191, 0.8)" : "rgba(251, 113, 133, 0.8)";
   ctx.setLineDash([4, 4]);
   ctx.strokeStyle = color;
   ctx.lineWidth = 1.5;
   ctx.beginPath();
   ctx.moveTo(metrics.plot.x, state.chart.hover.y);
   ctx.lineTo(metrics.plot.x + metrics.plot.w, state.chart.hover.y);
   ctx.stroke();
   ctx.setLineDash([]);
 }
 if (state.chart.draggingFibonacci) {
   drawFibonacciLevels(ctx, metrics, {
     startTime: state.chart.draggingFibonacci.startTime,
     startPrice: state.chart.draggingFibonacci.startPrice,
     endTime: state.chart.draggingFibonacci.endTime,
     endPrice: state.chart.draggingFibonacci.endPrice,
     color: FIBONACCI_COLOR
   }, { preview: true });
 }
 ctx.restore();
}
function drawFuturesExitOrders(ctx, metrics) {
 if (!isFuturesMode()) return;
 const positionFilterId = currentChartPositionFilterId();
 const orders = currentFuturesExitOrders()
   .filter((order) => !positionFilterId || order.positionId === positionFilterId);
 const previewPositionId = state.chart.exitOrderPositionId;
 if (!orders.length && !previewPositionId) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 ctx.font = "800 11px Segoe UI, sans-serif";
 orders.forEach((order) => {
   const y = priceToY(metrics, order.price);
   if (y < metrics.plot.y || y > metrics.plot.y + metrics.plot.h) return;
   const color = "#f6c453";
   const lineColor = "rgba(246, 196, 83, 0.42)";
   const amountUnits = futuresExitOrderAmountUnits(order);
   const amountLabel = amountUnits === null ? "전액" : `${trimNumber(amountUnits, 2)} USDT`;
   const label = `예약 청산 ${amountLabel} · ${formatFuturesDisplayPrice(order.price, order.market)}`;
   ctx.setLineDash([10, 5]);
   ctx.strokeStyle = lineColor;
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(metrics.plot.x, y);
   ctx.lineTo(metrics.plot.x + metrics.plot.w, y);
   ctx.stroke();
   ctx.setLineDash([]);
   const labelWidth = ctx.measureText(label).width + 14;
   const labelX = metrics.plot.x + 6;
   const labelY = clamp(y - 20, metrics.plot.y + 3, metrics.plot.y + metrics.plot.h - 21);
   ctx.fillStyle = "rgba(8, 13, 20, 0.55)";
   roundedRect(ctx, labelX, labelY, labelWidth, 18, 5);
   ctx.fill();
   ctx.strokeStyle = lineColor;
   ctx.lineWidth = 1;
   ctx.stroke();
   ctx.fillStyle = lineColor;
   ctx.fillText(label, labelX + 7, labelY + 13);
 });
 if (previewPositionId && state.chart.hover && isInsidePlot(metrics, state.chart.hover.x, state.chart.hover.y)) {
   ctx.setLineDash([4, 4]);
   ctx.strokeStyle = "rgba(246, 196, 83, 0.42)";
   ctx.lineWidth = 1.5;
   ctx.beginPath();
   ctx.moveTo(metrics.plot.x, state.chart.hover.y);
   ctx.lineTo(metrics.plot.x + metrics.plot.w, state.chart.hover.y);
   ctx.stroke();
   ctx.setLineDash([]);
 }
 ctx.restore();
}
function drawFuturesCompletedOrders(ctx, metrics) {
 if (!isFuturesMode()) return;
 const positionFilterId = currentChartPositionFilterId();
 const notices = currentFuturesCompletedOrderNotices()
   .filter((notice) => !positionFilterId || notice.positionId === positionFilterId);
 if (!notices.length) return;
 ctx.save();
 ctx.beginPath();
 ctx.rect(metrics.plot.x, metrics.plot.y, metrics.plot.w, metrics.plot.h);
 ctx.clip();
 ctx.font = "800 11px Segoe UI, sans-serif";
 notices.forEach((notice) => {
   const y = priceToY(metrics, notice.price);
   if (y < metrics.plot.y || y > metrics.plot.y + metrics.plot.h) return;
   const isExit = notice.orderKind === "EXIT";
   const color = isExit ? "#f6c453" : notice.direction === "SHORT" ? "#fb7185" : "#2dd4bf";
   const label = `${futuresCompletedOrderNoticeTitle(notice)} ${formatFuturesDisplayPrice(notice.price, notice.market)}`;
   ctx.setLineDash([]);
   ctx.strokeStyle = color;
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(metrics.plot.x, y);
   ctx.lineTo(metrics.plot.x + metrics.plot.w, y);
   ctx.stroke();
   const completedTime = Math.floor(timestampMs(notice.completedAt) / 1000);
   const pointX = completedTime ? xForTime(metrics, completedTime) : NaN;
   if (Number.isFinite(pointX) && pointX >= metrics.plot.x && pointX <= metrics.plot.x + metrics.plot.w) {
     ctx.fillStyle = color;
     ctx.beginPath();
     ctx.moveTo(pointX, y - 6);
     ctx.lineTo(pointX + 6, y);
     ctx.lineTo(pointX, y + 6);
     ctx.lineTo(pointX - 6, y);
     ctx.closePath();
     ctx.fill();
     ctx.strokeStyle = "rgba(8, 13, 20, 0.95)";
     ctx.lineWidth = 1.5;
     ctx.stroke();
   }
   const labelWidth = Math.min(metrics.plot.w - 12, ctx.measureText(label).width + 14);
   const labelX = metrics.plot.x + metrics.plot.w - labelWidth - 6;
   const labelY = clamp(y - 20, metrics.plot.y + 3, metrics.plot.y + metrics.plot.h - 21);
   ctx.fillStyle = "rgba(8, 13, 20, 0.94)";
   ctx.beginPath();
   roundedRect(ctx, labelX, labelY, labelWidth, 18, 5);
   ctx.fill();
   ctx.strokeStyle = color;
   ctx.lineWidth = 1;
   ctx.stroke();
   ctx.fillStyle = color;
   ctx.fillText(label, labelX + 7, labelY + 13);
 });
 ctx.restore();
}
function drawBuyMarkers(ctx, metrics) {
 if (isFuturesMode()) {
   drawFuturesMarkers(ctx, metrics);
   return;
 }
 const openBuyTradeIds = currentOpenBuyTradeIdsForHoldingRates(state.market);
 const trades = tradesForMarket(state.market)
   .filter((trade) => trade.side === "BUY" && openBuyTradeIds.has(trade.id))
   .sort((a, b) => timestampMs(a.createdAt) - timestampMs(b.createdAt));
 if (!trades.length || !metrics.candles.length) return;
 const firstTime = metrics.candles[0].time;
 const unitSeconds = timeframeSeconds(state.timeframe);
 const currentPrice = state.ticker && state.ticker.price
   ? state.ticker.price
   : metrics.candles[metrics.candles.length - 1].close;
 const averagePrice = state.portfolio && state.portfolio.btcBalance > 0 ? finiteNumber(state.portfolio.avgBuyPrice, 0) : 0;
 ctx.save();
 ctx.font = "700 11px Segoe UI, sans-serif";
 if (averagePrice > 0) {
   const averageY = priceToY(metrics, averagePrice);
   if (averageY >= metrics.plot.y - 24 && averageY <= metrics.plot.y + metrics.plot.h + 24) {
     const averageRate = ((currentPrice - averagePrice) / averagePrice) * 100;
     const averageColor = averageRate >= 0 ? "#24d47b" : "#ff5c72";
     const averageLabel = "평단 " + formatSignedPercent(averageRate);
     const averageLabelWidth = Math.ceil(ctx.measureText(averageLabel).width + 12);
     const averageLabelX = metrics.plot.x + metrics.plot.w - averageLabelWidth - 4;
     const averageLabelY = clamp(averageY - 8, metrics.plot.y + 16, metrics.plot.y + metrics.plot.h - 8);
     ctx.strokeStyle = averageColor;
     ctx.lineWidth = 2;
     ctx.setLineDash([]);
     ctx.beginPath();
     ctx.moveTo(metrics.plot.x, averageY);
     ctx.lineTo(metrics.plot.x + metrics.plot.w, averageY);
     ctx.stroke();
     ctx.fillStyle = "rgba(8, 13, 20, 0.92)";
     ctx.fillRect(averageLabelX, averageLabelY - 13, averageLabelWidth, 18);
     ctx.strokeStyle = averageColor;
     ctx.strokeRect(averageLabelX, averageLabelY - 13, averageLabelWidth, 18);
     ctx.fillStyle = averageColor;
     ctx.fillText(averageLabel, averageLabelX + 6, averageLabelY);
   }
 }
 trades.forEach((trade, index) => {
   const price = finiteNumber(trade.price, 0);
   if (price <= 0) return;
   const tradeTime = buyMarkerTimeForCandles(trade, metrics.candles);
   if (tradeTime === null) return;
   const x = xForTime(metrics, tradeTime);
   const y = priceToY(metrics, price);
   if (x < metrics.plot.x || x > metrics.plot.x + metrics.plot.w) return;
   if (y < metrics.plot.y - 24 || y > metrics.plot.y + metrics.plot.h + 24) return;
   const holdingRate = currentHoldingRateForTrade(trade, openBuyTradeIds);
   const entryPrice = buyEntryPriceForTrade(trade) || price;
   const fallbackRate = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
   const markerRate = Number.isFinite(holdingRate) ? holdingRate : fallbackRate;
   const color = markerRate >= 0 ? "#24d47b" : "#ff5c72";
   const label = "매수 " + (index + 1);
   const labelWidth = Math.ceil(ctx.measureText(label).width + 12);
   const labelX = clamp(x + 8, metrics.plot.x + 2, metrics.plot.x + metrics.plot.w - labelWidth - 2);
   const labelY = clamp(y - 18 - (index % 4) * 18, metrics.plot.y + 16, metrics.plot.y + metrics.plot.h - 8);
   ctx.strokeStyle = color;
   ctx.globalAlpha = 0.5;
   ctx.lineWidth = 1;
   ctx.setLineDash([5, 4]);
   ctx.beginPath();
   ctx.moveTo(x, y);
   ctx.lineTo(metrics.plot.x + metrics.plot.w, y);
   ctx.stroke();
   ctx.setLineDash([]);
   ctx.globalAlpha = 1;
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.moveTo(x, y - 8);
   ctx.lineTo(x - 6, y + 5);
   ctx.lineTo(x + 6, y + 5);
   ctx.closePath();
   ctx.fill();
   ctx.fillStyle = "rgba(8, 13, 20, 0.88)";
   ctx.fillRect(labelX, labelY - 13, labelWidth, 18);
   ctx.strokeStyle = color;
   ctx.strokeRect(labelX, labelY - 13, labelWidth, 18);
   ctx.fillStyle = color;
   ctx.fillText(label, labelX + 6, labelY);
 });
 ctx.restore();
}
function futuresPositionChartStartX(position, metrics) {
 const entryTimes = futuresEntryLegs(position)
   .map((entry) => timestampMs(entry.openedAt || entry.entryTime || entry.createdAt))
   .filter((time) => time > 0);
 const fallbackTime = timestampMs(position && (position.openedAt || position.entryTime || position.createdAt));
 if (fallbackTime > 0) entryTimes.push(fallbackTime);
 if (!entryTimes.length) return metrics.plot.x;
 const startTime = alignToTimeframe(Math.floor(Math.min(...entryTimes) / 1000));
 const visibleEndTime = finiteNumber(
   metrics.futureEndTime,
   finiteNumber(metrics.lastTime, 0) + finiteNumber(metrics.unitSeconds, timeframeSeconds(state.timeframe))
 );
 if (visibleEndTime && startTime > visibleEndTime) return null;
 return clamp(xForTime(metrics, startTime), metrics.plot.x, metrics.plot.x + metrics.plot.w);
}
function claimFuturesPositionLabelY(lineY, metrics, occupiedLabelYs, preferredSide = "above") {
 const labelOffsets = preferredSide === "below"
   ? [18, 36, -8, 54, -26, 72, -44]
   : [-8, -26, 18, -44, 36, -62, 54];
 const minY = metrics.plot.y + 16;
 const maxY = metrics.plot.y + metrics.plot.h - 8;
 const candidates = labelOffsets.map((offset) => clamp(lineY + offset, minY, maxY));
 const clearsOwnLine = (candidate) => candidate + 5 <= lineY - 2 || candidate - 13 >= lineY + 2;
 const availableY = candidates.find((candidate) => (
   clearsOwnLine(candidate)
   && !occupiedLabelYs.some((usedY) => Math.abs(usedY - candidate) < 18)
 ));
 const fallbackY = candidates.find(clearsOwnLine) || clamp(lineY - 8, minY, maxY);
 const labelY = Number.isFinite(availableY) ? availableY : fallbackY;
 occupiedLabelYs.push(labelY);
 return labelY;
}
function drawFuturesMarkers(ctx, metrics) {
 const positions = chartVisibleFuturesPositions();
 const currentPrice = currentFuturesPrice();
 const occupiedPositionLabelYs = [];
 const plotRight = metrics.plot.x + metrics.plot.w;
 ctx.save();
 ctx.font = "700 11px Segoe UI, sans-serif";
 positions.forEach((position) => {
   const lineStartX = futuresPositionChartStartX(position, metrics);
   if (lineStartX === null) return;
   const averageLinePrice = positiveNumber(finiteNumber(position.entryPrice, 0), 0);
   const breakEvenPrice = calculateFuturesBreakEvenPrice(position);
   if (!averageLinePrice) return;
   const entryY = priceToY(metrics, averageLinePrice);
   const breakEvenY = breakEvenPrice > 0 ? priceToY(metrics, breakEvenPrice) : null;
   const calc = calculateFuturesPosition(position, currentPrice);
   const currentY = currentPrice ? priceToY(metrics, currentPrice) : null;
   const entryIsVisible = entryY >= metrics.plot.y && entryY <= metrics.plot.y + metrics.plot.h;
   const breakEvenIsVisible = Number.isFinite(breakEvenY)
     && breakEvenY >= metrics.plot.y
     && breakEvenY <= metrics.plot.y + metrics.plot.h;
   if (Number.isFinite(currentY) && entryIsVisible && plotRight > lineStartX) {
     const zoneTop = clamp(Math.min(entryY, currentY), metrics.plot.y, metrics.plot.y + metrics.plot.h);
     const zoneBottom = clamp(Math.max(entryY, currentY), metrics.plot.y, metrics.plot.y + metrics.plot.h);
     if (zoneBottom > zoneTop) {
       ctx.fillStyle = calc.netPnl >= 0 ? "rgba(36, 212, 123, 0.10)" : "rgba(255, 92, 114, 0.10)";
       ctx.fillRect(lineStartX, zoneTop, plotRight - lineStartX, zoneBottom - zoneTop);
     }
   }
   if (breakEvenIsVisible && plotRight > metrics.plot.x) {
     ctx.strokeStyle = "rgba(148, 163, 184, 0.86)";
     ctx.lineWidth = 1.4;
     ctx.setLineDash([2, 4]);
     ctx.beginPath();
     ctx.moveTo(metrics.plot.x, breakEvenY);
     ctx.lineTo(plotRight, breakEvenY);
     ctx.stroke();
     ctx.setLineDash([]);
   }
   const color = calc.pnl >= 0 ? "#24d47b" : "#ff5c72";
   const directionLabel = position.direction === "LONG" ? "Long" : "Short";
   const label = `평단 ${directionLabel} ${formatNumber(position.leverage, 2)}x (${formatNumber(calc.roePercent, 2)}%)`;
   if (entryIsVisible) {
     const labelWidth = Math.ceil(ctx.measureText(label).width + 12);
     const labelX = plotRight - labelWidth - 4;
     const averageLabelSide = position.direction === "LONG" ? "below" : "above";
     const labelY = claimFuturesPositionLabelY(entryY, metrics, occupiedPositionLabelYs, averageLabelSide);
     ctx.strokeStyle = color;
     ctx.lineWidth = 2;
     ctx.setLineDash([]);
     ctx.beginPath();
     ctx.moveTo(metrics.plot.x, entryY);
     ctx.lineTo(plotRight, entryY);
     ctx.stroke();
     ctx.fillStyle = "rgba(8, 13, 20, 0.92)";
     ctx.fillRect(labelX, labelY - 13, labelWidth, 18);
     ctx.strokeStyle = color;
     ctx.strokeRect(labelX, labelY - 13, labelWidth, 18);
     ctx.fillStyle = color;
     ctx.fillText(label, labelX + 6, labelY);
   } else {
     const isAbove = entryY < metrics.plot.y;
     const boundaryLabel = `${isAbove ? "↑" : "↓"} ${label} @ ${formatFuturesDisplayPrice(averageLinePrice)}`;
     const labelWidth = Math.ceil(ctx.measureText(boundaryLabel).width + 12);
     const labelX = plotRight - labelWidth - 4;
     const labelY = isAbove ? metrics.plot.y + 16 : metrics.plot.y + metrics.plot.h - 8;
     ctx.fillStyle = "rgba(8, 13, 20, 0.92)";
     ctx.fillRect(labelX, labelY - 13, labelWidth, 18);
     ctx.strokeStyle = color;
     ctx.strokeRect(labelX, labelY - 13, labelWidth, 18);
     ctx.fillStyle = color;
     ctx.fillText(boundaryLabel, labelX + 6, labelY);
   }
   if (breakEvenIsVisible) {
     const breakEvenLabel = `손익분기 ${formatFuturesDisplayPrice(breakEvenPrice)}`;
     const labelWidth = Math.ceil(ctx.measureText(breakEvenLabel).width + 12);
     const labelX = plotRight - labelWidth - 4;
     const breakEvenLabelSide = position.direction === "LONG" ? "above" : "below";
     const labelY = claimFuturesPositionLabelY(breakEvenY, metrics, occupiedPositionLabelYs, breakEvenLabelSide);
     ctx.fillStyle = "rgba(8, 13, 20, 0.92)";
     ctx.fillRect(labelX, labelY - 13, labelWidth, 18);
     ctx.strokeStyle = "rgba(148, 163, 184, 0.86)";
     ctx.lineWidth = 1;
     ctx.strokeRect(labelX, labelY - 13, labelWidth, 18);
     ctx.fillStyle = "#a8b3c4";
     ctx.fillText(breakEvenLabel, labelX + 6, labelY);
   }
   const liquidationY = priceToY(metrics, calc.liquidationPrice);
   if (liquidationY >= metrics.plot.y - 24 && liquidationY <= metrics.plot.y + metrics.plot.h + 24) {
     const liquidationLabel = `청산가 ${formatFuturesDisplayPrice(calc.liquidationPrice)}`;
     const labelWidth = Math.ceil(ctx.measureText(liquidationLabel).width + 12);
     const labelX = plotRight - labelWidth - 4;
     const labelY = clamp(liquidationY - 8, metrics.plot.y + 16, metrics.plot.y + metrics.plot.h - 8);
     ctx.strokeStyle = "rgba(255, 92, 114, 0.86)";
     ctx.lineWidth = 1.8;
     ctx.setLineDash([7, 5]);
     ctx.beginPath();
     ctx.moveTo(lineStartX, liquidationY);
     ctx.lineTo(plotRight, liquidationY);
     ctx.stroke();
     ctx.setLineDash([]);
     ctx.fillStyle = "rgba(8, 13, 20, 0.92)";
     ctx.fillRect(labelX, labelY - 13, labelWidth, 18);
     ctx.strokeStyle = "rgba(255, 92, 114, 0.86)";
     ctx.strokeRect(labelX, labelY - 13, labelWidth, 18);
     ctx.fillStyle = "#ff5c72";
     ctx.fillText(liquidationLabel, labelX + 6, labelY);
   }
 });
 drawFuturesEntryMarkers(ctx, metrics);
 ctx.restore();
}
function futuresEntryMarkerPlacement(marker, metrics) {
 const candles = metrics && Array.isArray(metrics.candles) ? metrics.candles : [];
 if (!marker || !candles.length) return null;
 const rawTime = finiteNumber(marker.time, 0);
 const rawPrice = positiveNumber(finiteNumber(marker.price, 0), 0);
 if (!rawTime || !rawPrice) return null;
 const markerTime = alignToTimeframe(rawTime);
 const firstTime = finiteNumber(candles[0] && candles[0].time, 0);
 const lastIndex = candles.length - 1;
 const lastTime = finiteNumber(candles[lastIndex] && candles[lastIndex].time, 0);
 const unitSeconds = metrics.unitSeconds || timeframeSeconds(state.timeframe);
 if (!firstTime || !lastTime || markerTime < firstTime || markerTime > lastTime + unitSeconds) return null;
 let candleIndex = lastIndex;
 let nearestDistance = Infinity;
 candles.forEach((candle, index) => {
   const candleTime = finiteNumber(candle && candle.time, 0);
   const distance = Math.abs(candleTime - markerTime);
   if (distance < nearestDistance) {
     nearestDistance = distance;
     candleIndex = index;
   }
 });
 const candle = candles[candleIndex];
 const candleLow = finiteNumber(candle && candle.low, rawPrice);
 const candleHigh = finiteNumber(candle && candle.high, rawPrice);
 const low = Math.min(candleLow, candleHigh);
 const high = Math.max(candleLow, candleHigh);
 const displayPrice = Number.isFinite(low) && Number.isFinite(high) ? clamp(rawPrice, low, high) : rawPrice;
 return {
   candle,
   candleIndex,
   time: candle.time,
   price: displayPrice,
   x: xForIndex(metrics, candleIndex),
   y: priceToY(metrics, displayPrice)
 };
}
function drawFuturesEntryMarkers(ctx, metrics) {
 const laneCounts = new Map();
 const markers = chartVisibleFuturesPositions()
   .flatMap(createFuturesEntryMarkers)
   .sort((a, b) => a.time - b.time);
 markers.forEach((marker) => {
   const placement = futuresEntryMarkerPlacement(marker, metrics);
   if (!placement) return;
   const markerTime = placement.time;
   const baseX = placement.x;
   const y = placement.y;
   if (baseX < metrics.plot.x || baseX > metrics.plot.x + metrics.plot.w) return;
   if (y < metrics.plot.y - 24 || y > metrics.plot.y + metrics.plot.h + 24) return;
   const laneKey = `${markerTime}:${marker.direction}`;
   const lane = laneCounts.get(laneKey) || 0;
   laneCounts.set(laneKey, lane + 1);
   const laneDirection = lane % 2 === 0 ? 1 : -1;
   const badgeSize = 22;
   const laneDistance = Math.ceil(lane / 2) * (badgeSize - 3);
   const halfBadge = badgeSize / 2;
   const x = clamp(
     baseX + laneDirection * laneDistance,
     metrics.plot.x + halfBadge + 1,
     metrics.plot.x + metrics.plot.w - halfBadge - 1
   );
   const isLong = marker.direction === "LONG";
   const color = isLong ? "#24d47b" : "#ff5c72";
   const preferredBadgeTop = isLong ? y + 7 : y - badgeSize - 7;
   const badgeTop = clamp(
     preferredBadgeTop,
     metrics.plot.y + 1,
     metrics.plot.y + metrics.plot.h - badgeSize - 1
   );
   const badgeLeft = x - halfBadge;
   const pointerTipY = clamp(y, metrics.plot.y, metrics.plot.y + metrics.plot.h);
   ctx.save();
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.moveTo(x - 4, isLong ? badgeTop : badgeTop + badgeSize);
   ctx.lineTo(x + 4, isLong ? badgeTop : badgeTop + badgeSize);
   ctx.lineTo(x, pointerTipY);
   ctx.closePath();
   ctx.fill();
   ctx.beginPath();
   roundedRect(ctx, badgeLeft, badgeTop, badgeSize, badgeSize, 3);
   ctx.fill();
   ctx.strokeStyle = "rgba(6, 12, 18, 0.9)";
   ctx.lineWidth = 1.25;
   ctx.stroke();
   ctx.fillStyle = "#071018";
   ctx.font = "800 13px Segoe UI, sans-serif";
   ctx.textAlign = "center";
   ctx.textBaseline = "middle";
   ctx.fillText(isLong ? "B" : "S", x, badgeTop + badgeSize / 2 + 0.5);
   ctx.restore();
 });
}
function drawCrosshair(ctx, metrics) {
 if (!state.chart.hover) return;
 const hover = state.chart.hover;
 if (!isInsidePlot(metrics, hover.x, hover.y)) return;
 ctx.save();
 ctx.strokeStyle = "rgba(232, 238, 247, 0.34)";
 ctx.setLineDash([4, 5]);
 ctx.beginPath();
 ctx.moveTo(hover.x, metrics.plot.y);
 ctx.lineTo(hover.x, metrics.volume.y + metrics.volume.h);
 ctx.moveTo(metrics.plot.x, hover.y);
 ctx.lineTo(metrics.plot.x + metrics.plot.w, hover.y);
 ctx.stroke();
 ctx.restore();
}
function updateOhlcInfo() {
 const metrics = state.chart.metrics;
 const candles = state.chart.visibleCandles;
 if (!metrics || !candles.length) {
   setText(el.ohlcInfo, "OHLC -");
   return;
 }
 const candle = state.chart.hover && !state.chart.hover.isFuture
   ? candles[state.chart.hover.index]
   : candles[candles.length - 1];
 if (!candle) return;
 const change = candle.close - candle.open;
 const sourceLabel = activeChartLabel();
 setText(
  el.ohlcInfo,
   `${sourceLabel} ${timeframeLabel(state.timeframe)}봉 · ${formatCandleTime(candle.time)}  O ${formatActivePrice(candle.open)}  H ${formatActivePrice(candle.high)}  L ${formatActivePrice(candle.low)}  C ${formatActivePrice(candle.close)}  V ${formatNumber(candle.volume, 4)}`
 );
 el.ohlcInfo.className = `chart-meta ${signClass(change)}`;
}
function formatDebugValue(value, formatter = (item) => String(item)) {
 return Number.isFinite(value) ? formatter(value) : "-";
}
function formatDebugLocalDateTime(value) {
 if (!Number.isFinite(value)) return "-";
 return formatDateTime(value);
}
function formatDebugUtcDateTime(value) {
 if (!Number.isFinite(value)) return "-";
 return new Date(value).toISOString().slice(0, 16).replace("T", " ");
}
function updateChartDebugInfo(metrics) {
 if (!el.chartDebugInfo) return;
 if (!metrics || !metrics.debugStats) {
   el.chartDebugInfo.textContent = "chart debug: no data";
   return;
 }
 const debug = metrics.debugStats;
 const last = debug.lastCandle;
 state.chart.lastDebugStats = debug;
 el.chartDebugInfo.textContent = [
   `visible=${debug.visibleCount}`,
   `first=${debug.firstTime ? formatCandleTime(debug.firstTime) : "-"}`,
   `last=${debug.lastTime ? formatCandleTime(debug.lastTime) : "-"}`,
   `high=${formatDebugValue(debug.visibleHigh, formatActivePrice)}`,
   `low=${formatDebugValue(debug.visibleLow, formatActivePrice)}`,
   `scale=${formatDebugValue(debug.scaleMinPrice, formatActivePrice)}~${formatDebugValue(debug.scaleMaxPrice, formatActivePrice)}`,
   `lastOHLCV=${last ? `O ${formatActivePrice(last.open)} H ${formatActivePrice(last.high)} L ${formatActivePrice(last.low)} C ${formatActivePrice(last.close)} V ${formatNumber(last.volume, 4)}` : "-"}`,
   `EMA20=${formatDebugValue(debug.ema20, formatActivePrice)}`,
   `EMA50=${formatDebugValue(debug.ema50, formatActivePrice)}`,
   `EMA90=${formatDebugValue(debug.ema90, formatActivePrice)}`,
   `SMA10D=${formatDebugValue(debug.sma10d, formatActivePrice)}`,
   `SMA30D=${formatDebugValue(debug.sma30d, formatActivePrice)}`,
   `SMA50D=${formatDebugValue(debug.sma50d, formatActivePrice)}`,
   `SMA100D=${formatDebugValue(debug.sma100d, formatActivePrice)}`,
   `SMA200D=${formatDebugValue(debug.sma200d, formatActivePrice)}`,
   `dailyMA=${debug.dailyMaCandleCount}${debug.dailyMaError ? ` (${debug.dailyMaError})` : ""}`,
   `BB=${debug.bollinger.upper ? `${formatActivePrice(debug.bollinger.upper)} / ${formatActivePrice(debug.bollinger.middle)} / ${formatActivePrice(debug.bollinger.lower)}` : "-"}`,
   `invalidIndicator=${debug.invalidIndicatorCount}`,
   `dupTs=${debug.duplicateTimestampCount}`,
   `${debug.missingTimestampLabel || "missing"}=${debug.missingTimestampCount}`,
   `badOHLC=${debug.invalidOhlcCount}`,
   `openFix=${debug.openContinuityFixCount}`,
   `lastClosedCandleTime=${debug.lastClosedCandleTime ? formatCandleTime(debug.lastClosedCandleTime) : "-"}`,
   `realtimeCandleTime=${debug.realtimeCandleTime ? formatCandleTime(debug.realtimeCandleTime) : "-"}`,
   `isLastCandleClosed=${debug.isLastCandleClosed ? "true" : "false"}`,
   `lastRawTimestamp=${formatDebugValue(debug.lastRawTimestamp, (value) => String(Math.floor(value)))}`,
   `lastDateLocal=${formatDebugLocalDateTime(debug.lastRawTimestamp)}`,
   `lastDateUTC=${formatDebugUtcDateTime(debug.lastRawTimestamp)}`,
   `nowLocal=${formatDebugLocalDateTime(debug.nowTimestamp)}`,
   `nowUTC=${formatDebugUtcDateTime(debug.nowTimestamp)}`
 ].join(" | ");
}
function beginFibonacciDrag(event) {
 if (!state.chart.fibonacciMode || event.button !== 0) return false;
 const point = chartPointFromEvent(event);
 if (!point) return false;
 event.preventDefault();
 hideTooltip();
 state.chart.draggingFibonacci = {
   startTime: point.time,
   startPrice: point.price,
   endTime: point.time,
   endPrice: point.price,
   startX: point.x,
   startY: point.y,
   endX: point.x,
   endY: point.y,
   moved: false
 };
 state.chart.suppressNextClick = true;
 state.chart.hover = point;
 updateTrendControls();
 updateChartCursor(null);
 drawChart();
 return true;
}
function updateFibonacciDrag(event) {
 const drag = state.chart.draggingFibonacci;
 if (!drag) return;
 const point = chartPointFromEvent(event);
 if (!point) return;
 drag.endTime = point.time;
 drag.endPrice = point.price;
 drag.endX = point.x;
 drag.endY = point.y;
 drag.moved = drag.moved || Math.hypot(point.x - drag.startX, point.y - drag.startY) >= 4;
 state.chart.hover = point;
 hideTooltip();
 drawChart();
}
function finishFibonacciDrag() {
 const drag = state.chart.draggingFibonacci;
 if (!drag) return;
 state.chart.draggingFibonacci = null;
 const priceThreshold = Math.max(1e-9, Math.abs(drag.startPrice) * 0.000001);
 const valid = drag.moved
   && drag.endTime !== drag.startTime
   && Math.abs(drag.endPrice - drag.startPrice) > priceThreshold;
 if (!valid) {
   updateTrendControls();
   updateChartCursor(null);
   drawChart();
   showToast("피보나치는 시작점에서 다른 시간·가격 지점까지 드래그하세요.");
   return;
 }
 const fibonacci = {
   id: `fib-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   timeframe: state.timeframe,
   kind: "fibonacci",
   startTime: drag.startTime,
   startPrice: drag.startPrice,
   endTime: drag.endTime,
   endPrice: drag.endPrice,
   color: FIBONACCI_COLOR,
   createdAt: new Date().toISOString()
 };
 activeTrendlineStore()[state.timeframe].push(fibonacci);
 state.chart.selectedTrendlineId = fibonacci.id;
 state.chart.selectedRiskBlockId = null;
 syncRiskSelectionFlags();
 saveActiveTrendlines();
 updateTrendControls();
 renderRiskControls();
 updateChartCursor(null);
 drawChart();
 showToast("피보나치 되돌림을 저장했습니다.");
}
function handleChartMouseDown(event) {
  if (state.chart.fibonacciMode) {
    beginFibonacciDrag(event);
    return;
  }
  if (state.chart.percentMeasureMode || state.chart.trendMode || state.chart.horizontalMode || state.chart.limitOrderMode || state.chart.exitOrderPositionId) return;
  if (event.button !== 0) return;
  const coords = chartCoordinatesFromEvent(event);
  const metrics = state.chart.metrics;
  if (!coords || !metrics || !isInsidePlot(metrics, coords.x, coords.y)) return;
  const hit = findRiskBlockAtPoint(coords.x, coords.y);
  event.preventDefault();
  hideTooltip();
  if (!hit) {
    state.chart.draggingChartPan = {
      startX: coords.x,
      startY: coords.y,
      startOffset: clampChartPanOffset(state.chart.panOffset),
      startPricePanRatio: clampChartPricePanRatio(state.chart.pricePanRatio),
      barSpace: Math.max(1, finiteNumber(metrics.barSpace, 1)),
      plotHeight: Math.max(1, finiteNumber(metrics.plot.h, 1)),
      axis: null,
      moved: false
    };
    updateChartCursor(null);
    return;
  }
  selectRiskBlock(hit.block.id);
 const dragHandle = hit.handle === "select" ? "move" : hit.handle;
 state.chart.draggingRiskBlock = {
   id: hit.block.id,
   handle: dragHandle,
   startX: coords.x,
   startY: coords.y,
   startTime: xToTime(metrics, coords.x),
   startPrice: yToPrice(metrics, clamp(coords.y, metrics.plot.y, metrics.plot.y + metrics.plot.h)),
   startBarSpace: metrics.barSpace,
   startUnitSeconds: metrics.unitSeconds,
   startFirstTime: metrics.firstTime,
   startFutureEndTime: metrics.futureEndTime,
   startMinPrice: metrics.minPrice,
   startMaxPrice: metrics.maxPrice,
   startPlotHeight: metrics.plot.h,
   startBlock: { ...hit.block }
 };
 state.chart.suppressNextClick = true;
 drawChart();
}
function handleChartMouseMove(event) {
  if (state.chart.draggingFibonacci) {
    updateFibonacciDrag(event);
    return;
  }
  if (state.chart.draggingRiskBlock) {
    updateRiskBlockDrag(event);
    return;
  }
  if (state.chart.draggingChartPan) {
    updateChartPanDrag(event);
    return;
  }
 const point = chartPointFromEvent(event);
 if (!point) {
   state.chart.hover = null;
   updateChartCursor(null);
   hideTooltip();
   drawChart();
   return;
  }
  state.chart.hover = point;
  updateChartCursor(findRiskBlockAtPoint(point.x, point.y), true);
 showChartTooltip(point);
 drawChart();
}
function handleChartMouseLeave() {
  if (state.chart.draggingRiskBlock) {
    finishRiskBlockDrag();
  }
  finishChartPanDrag();
 state.chart.hover = null;
 updateChartCursor(null);
 hideTooltip();
 drawChart();
}
function handleChartMouseUp() {
  finishFibonacciDrag();
  finishRiskBlockDrag();
  finishChartPanDrag();
}
function chartOrderPriceFromEvent(event) {
 const metrics = state.chart.metrics;
 if (!metrics || !state.chart.visibleCandles.length) return 0;
 const coords = chartCoordinatesFromEvent(event);
 if (!coords) return 0;
 const plotTop = metrics.plot.y;
 const plotBottom = metrics.plot.y + metrics.plot.h;
 if (coords.y < plotTop || coords.y > plotBottom) return 0;
 return yToPrice(metrics, clamp(coords.y, plotTop, plotBottom));
}
function handleChartClick(event) {
 const exitOrderPositionId = state.chart.exitOrderPositionId;
 const limitOrderMode = state.chart.limitOrderMode;
 const selectingOrderPrice = Boolean(exitOrderPositionId || limitOrderMode);
 if (state.chart.suppressNextClick) {
   state.chart.suppressNextClick = false;
   if (!selectingOrderPrice) return;
 }
 if (selectingOrderPrice) {
   const orderPrice = chartOrderPriceFromEvent(event);
   if (!orderPrice) {
     showToast("예약 가격은 차트의 가격 높이 안에서 선택하세요.");
     return;
   }
   if (exitOrderPositionId) {
     placeFuturesExitOrderFromChart(exitOrderPositionId, orderPrice);
     return;
   }
   placeFuturesLimitOrderFromChart(limitOrderMode, orderPrice);
   return;
 }
 const point = chartPointFromEvent(event);
 if (!point) return;
 if (state.chart.percentMeasureMode) {
   handlePercentMeasurementPoint(point);
   return;
 }
 if (state.chart.riskMode) {
   createRiskBlockFromLatestBuy();
   return;
 }
 if (state.chart.horizontalMode) {
   const line = createHorizontalLine(point);
   if (!line) return;
   activeTrendlineStore()[state.timeframe].push(line);
   state.chart.pendingPoint = null;
   state.chart.selectedTrendlineId = line.id;
   state.chart.selectedRiskBlockId = null;
   saveActiveTrendlines();
   updateTrendControls();
   renderRiskControls();
   drawChart();
   showToast("수평선을 저장했습니다.");
   return;
 }
 if (state.chart.trendMode) {
   if (!state.chart.pendingPoint) {
     state.chart.pendingPoint = {
       time: point.time,
       price: point.price
     };
     updateTrendControls();
     drawChart();
     return;
   }
   const line = {
     id: `tl-${Date.now()}-${Math.random().toString(16).slice(2)}`,
     timeframe: state.timeframe,
     startTime: state.chart.pendingPoint.time,
     startPrice: state.chart.pendingPoint.price,
     endTime: point.time,
     endPrice: point.price,
     color: state.chart.trendColor,
     createdAt: new Date().toISOString()
   };
   activeTrendlineStore()[state.timeframe].push(line);
   state.chart.pendingPoint = null;
   state.chart.selectedTrendlineId = line.id;
   state.chart.selectedRiskBlockId = null;
   saveActiveTrendlines();
   updateTrendControls();
   renderRiskControls();
   drawChart();
   showToast("추세선을 저장했습니다.");
   return;
 }
 const riskHit = findRiskBlockAtPoint(point.x, point.y);
 if (riskHit) {
   selectRiskBlock(riskHit.block.id);
   drawChart();
   return;
 }
 const selected = findTrendlineNearPoint(point.x, point.y);
 state.chart.selectedTrendlineId = selected ? selected.id : null;
 if (selected) state.chart.selectedRiskBlockId = null;
 else state.chart.selectedRiskBlockId = null;
 syncRiskSelectionFlags();
 updateTrendControls();
 renderRiskControls();
 drawChart();
}
function handleChartWheel(event) {
  if (!activeCandles().length) return;
  if (state.chart.draggingRiskBlock || state.chart.draggingFibonacci || state.chart.draggingChartPan) {
   event.preventDefault();
   return;
 }
 event.preventDefault();
 const step = event.deltaY > 0 ? VISIBLE_CANDLE_STEP : -VISIBLE_CANDLE_STEP;
 changeChartVisibleCount(step);
}
function chartPointFromEvent(event) {
 const metrics = state.chart.metrics;
 if (!metrics || !state.chart.visibleCandles.length) return null;
 const coords = chartCoordinatesFromEvent(event);
 if (!coords) return null;
 const { x, y } = coords;
 if (!isInsidePlot(metrics, x, y)) return null;
 const slot = clamp(Math.round((x - metrics.plot.x) / metrics.barSpace - 0.5), 0, metrics.totalSlots - 1);
 const index = clamp(slot, 0, metrics.candles.length - 1);
 const time = slot >= metrics.candles.length
   ? metrics.lastTime + (slot - metrics.candles.length + 1) * metrics.unitSeconds
   : metrics.candles[index].time;
 return {
   x,
   y,
   index,
   slot,
   isFuture: slot >= metrics.candles.length,
   time,
   price: yToPrice(metrics, y)
 };
}
function chartCoordinatesFromEvent(event) {
 const rect = el.chartCanvas.getBoundingClientRect();
 return {
   x: event.clientX - rect.left,
   y: event.clientY - rect.top
 };
}
function showChartTooltip(point) {
 const candle = state.chart.visibleCandles[point.index];
 if (!candle && !point.isFuture) return;
 el.chartTooltip.hidden = false;
 el.chartTooltip.innerHTML = point.isFuture
   ? `
     <strong>${formatCandleTime(point.time)}</strong><br>
     미래 빈 공간<br>
     선택가 ${formatActivePrice(point.price)}
   `
   : `
     <strong>${formatCandleTime(candle.time)}</strong><br>
     시가 ${formatActivePrice(candle.open)}<br>
     고가 ${formatActivePrice(candle.high)}<br>
     저가 ${formatActivePrice(candle.low)}<br>
     종가 ${formatActivePrice(candle.close)}<br>
     선택가 ${formatActivePrice(point.price)}
   `;
 const stage = el.chartCanvas.parentElement.getBoundingClientRect();
 const tooltipRect = el.chartTooltip.getBoundingClientRect();
 const left = clamp(point.x + 14, 8, stage.width - tooltipRect.width - 8);
 const top = clamp(point.y + 14, 8, stage.height - tooltipRect.height - 8);
 el.chartTooltip.style.left = `${left}px`;
 el.chartTooltip.style.top = `${top}px`;
}
function hideTooltip() {
 el.chartTooltip.hidden = true;
}
function currentTrendlines() {
 const store = activeTrendlineStore();
 return Object.keys(createEmptyTrendlines()).flatMap((timeframe) => store[timeframe] || []);
}
function selectedTrendDrawing() {
 return currentTrendlines().find((line) => line.id === state.chart.selectedTrendlineId) || null;
}
function currentRiskBlocks() {
 const store = activeRiskBlockStore();
 return Object.keys(createEmptyRiskBlocks()).flatMap((timeframe) => store[timeframe] || []);
}
function createHorizontalLine(point) {
 const metrics = state.chart.metrics;
 if (!metrics || !metrics.candles.length) return null;
 const startTime = metrics.firstTime;
 const fallbackEndTime = startTime + timeframeSeconds(state.timeframe);
 const endTime = Math.max(metrics.futureEndTime, fallbackEndTime);
 return {
   id: `hl-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   timeframe: state.timeframe,
   startTime,
   startPrice: point.price,
   endTime,
   endPrice: point.price,
   color: state.chart.trendColor,
   kind: "horizontal",
   createdAt: new Date().toISOString()
 };
}
function toggleTrendMode() {
 state.chart.trendMode = !state.chart.trendMode;
 if (state.chart.trendMode) {
   state.chart.percentMeasureMode = false;
   state.chart.percentMeasureStart = null;
   state.chart.riskMode = false;
   state.chart.horizontalMode = false;
   state.chart.fibonacciMode = false;
   state.chart.draggingFibonacci = null;
   state.chart.limitOrderMode = null;
   state.chart.exitOrderPositionId = "";
   state.chart.selectedRiskBlockId = null;
   syncRiskSelectionFlags();
   renderRiskControls();
 }
 state.chart.pendingPoint = null;
 updateTrendControls();
 drawChart();
}
function toggleHorizontalMode() {
 state.chart.horizontalMode = !state.chart.horizontalMode;
 if (state.chart.horizontalMode) {
   state.chart.percentMeasureMode = false;
   state.chart.percentMeasureStart = null;
   state.chart.trendMode = false;
   state.chart.fibonacciMode = false;
   state.chart.draggingFibonacci = null;
   state.chart.riskMode = false;
   state.chart.limitOrderMode = null;
   state.chart.exitOrderPositionId = "";
   state.chart.pendingPoint = null;
   state.chart.selectedRiskBlockId = null;
   syncRiskSelectionFlags();
   renderRiskControls();
 }
 state.chart.pendingPoint = null;
 updateTrendControls();
 drawChart();
}
function toggleFibonacciMode() {
 if (!activeCandles().length) {
   showToast("캔들 데이터가 들어온 뒤 피보나치를 그릴 수 있습니다.");
   return false;
 }
 const nextMode = !state.chart.fibonacciMode;
 state.chart.fibonacciMode = nextMode;
 state.chart.draggingFibonacci = null;
 state.chart.suppressNextClick = false;
 if (nextMode) {
   state.chart.percentMeasureMode = false;
   state.chart.percentMeasureStart = null;
   state.chart.trendMode = false;
   state.chart.horizontalMode = false;
   state.chart.riskMode = false;
   state.chart.limitOrderMode = null;
   state.chart.exitOrderPositionId = "";
   state.chart.pendingPoint = null;
   state.chart.selectedTrendlineId = null;
   state.chart.selectedRiskBlockId = null;
   syncRiskSelectionFlags();
 }
 updateTrendControls();
 renderRiskControls();
 updateChartCursor(null);
 drawChart();
 return true;
}
function toggleRiskMode() {
 state.chart.percentMeasureMode = false;
 state.chart.percentMeasureStart = null;
 state.chart.fibonacciMode = false;
 state.chart.draggingFibonacci = null;
 createRiskBlockFromLatestBuy();
}
function togglePercentMeasureMode() {
 if (!activeCandles().length) {
   showToast("캔들 데이터가 들어온 뒤 등락률을 측정할 수 있습니다.");
   return false;
 }
 const nextMode = !state.chart.percentMeasureMode;
 state.chart.percentMeasureMode = nextMode;
 state.chart.percentMeasureStart = null;
 state.chart.suppressNextClick = false;
 if (nextMode) {
   state.chart.percentMeasurement = null;
   state.chart.trendMode = false;
   state.chart.horizontalMode = false;
   state.chart.fibonacciMode = false;
   state.chart.draggingFibonacci = null;
   state.chart.riskMode = false;
   state.chart.limitOrderMode = null;
   state.chart.exitOrderPositionId = "";
   state.chart.pendingPoint = null;
   state.chart.selectedTrendlineId = null;
   state.chart.selectedRiskBlockId = null;
   syncRiskSelectionFlags();
 }
 updateTrendControls();
 renderRiskControls();
 updateChartCursor(null);
 drawChart();
 return true;
}
function handlePercentMeasurementPoint(point) {
 if (!state.chart.percentMeasureStart) {
   state.chart.percentMeasureStart = {
     timeframe: String(state.timeframe),
     time: point.time,
     price: point.price
   };
   state.chart.percentMeasurement = null;
   updateTrendControls();
   drawChart();
   return;
 }
 const start = state.chart.percentMeasureStart;
 const end = {
   timeframe: String(state.timeframe),
   time: point.time,
   price: point.price
 };
 const percent = start.price > 0 ? ((end.price - start.price) / start.price) * 100 : 0;
 state.chart.percentMeasurement = {
   timeframe: String(state.timeframe),
   start,
   end,
   percent
 };
 state.chart.percentMeasureStart = null;
 state.chart.percentMeasureMode = false;
 updateTrendControls();
 updateChartCursor(null);
 drawChart();
 showToast(`등락률 ${formatSignedPercent(percent)}`);
}
function createRiskBlock(point) {
 const ratios = readRiskRatioInputs();
 state.riskSettings = ratios;
 const riskHeight = percentHeight(point.price, ratios.riskRatio);
 const rewardHeight = percentHeight(point.price, ratios.rewardRatio);
 const block = refreshRiskBlockPrices({
   id: `rr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   timeframe: state.timeframe,
   entryX: point.time,
   entryTime: point.time,
   entryPrice: point.price,
   width: clamp(Math.round(state.chart.visibleCount / 7), 18, DEFAULT_RISK_BLOCK_WIDTH),
   riskHeight,
   rewardHeight,
   rewardRatio: ratios.rewardRatio,
   riskRatio: ratios.riskRatio,
   rewardRiskRatio: ratios.rewardRatio / ratios.riskRatio,
   isSelected: true,
   createdAt: new Date().toISOString()
 });
 activeRiskBlockStore()[state.timeframe].push(block);
 selectRiskBlock(block.id);
 saveActiveRiskBlocks();
 showToast(`손익비 블럭 ${formatRatioPair(block.rewardRatio, block.riskRatio)} 생성`);
 drawChart();
}
function createRiskBlockFromLatestBuy() {
 if (isFuturesMode()) {
   createRiskBlockFromFuturesPosition();
   return;
 }
 if (!state.candles.length) {
   showToast("캔들 데이터가 들어온 뒤 손익비 블럭을 만들 수 있습니다.");
   return;
 }
 const hasPosition = Boolean(state.portfolio && state.portfolio.btcBalance > 0 && state.portfolio.avgBuyPrice > 0);
 const ratios = readRiskRatioInputs();
 state.riskSettings = ratios;
 const latestBuy = hasPosition ? latestBuyTrade() : null;
 const unitSeconds = timeframeSeconds(state.timeframe);
 const latestCandleTime = state.candles[state.candles.length - 1].time;
 // 손익비 블록은 최신 캔들 바로 오른쪽의 미래 구간에서 시작합니다.
 const entryTime = latestCandleTime + unitSeconds;
 const width = clamp(defaultRiskBlockWidth(), MIN_RISK_BLOCK_WIDTH, activeCandleLimit());
 const fallbackEntryPrice = latestBuy ? finiteNumber(latestBuy.price, 0) : 0;
 const livePrice = positiveNumber(
   state.ticker && state.ticker.price,
   positiveNumber(state.candles[state.candles.length - 1].close, 0)
 );
 const entryPrice = hasPosition
   ? positiveNumber(state.portfolio.avgBuyPrice, fallbackEntryPrice)
   : livePrice;
 if (!entryPrice) {
   showToast("현재가가 들어온 뒤 손익비 블럭을 만들 수 있습니다.");
   return;
 }
 const riskHeight = percentHeight(entryPrice, ratios.riskRatio);
 const rewardHeight = percentHeight(entryPrice, ratios.rewardRatio);
 state.chart.riskMode = false;
 state.chart.trendMode = false;
 state.chart.horizontalMode = false;
 state.chart.pendingPoint = null;
 state.chart.selectedTrendlineId = null;
 const block = refreshRiskBlockPrices({
   id: `rr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   timeframe: state.timeframe,
   entryX: entryTime,
   entryTime,
   entryPrice,
   width,
   riskHeight,
   rewardHeight,
   rewardRatio: ratios.rewardRatio,
   riskRatio: ratios.riskRatio,
   rewardRiskRatio: ratios.rewardRatio / ratios.riskRatio,
   isSelected: true,
   createdAt: new Date().toISOString()
 });
 activeRiskBlockStore()[state.timeframe].push(block);
 selectRiskBlock(block.id);
 saveActiveRiskBlocks();
 renderChartRangeControls();
 drawChart();
 showToast(hasPosition
   ? "최근 매수 기준 손익비 블럭을 생성했습니다. 내부를 드래그해 옮기고 오른쪽 손잡이로 기간을 조절할 수 있습니다."
   : "현재가 기준 손익비 블럭을 생성했습니다.");
}
function createRiskBlockFromFuturesPosition() {
 const positions = activeFuturesPositions();
 const position = positions[positions.length - 1];
 const candles = activeCandles();
 if (!candles.length) {
   showToast("선물 캔들 데이터가 들어온 뒤 손익비 블럭을 만들 수 있습니다.");
   return;
 }
 const hasPosition = Boolean(position && position.entryPrice > 0);
 const ratios = readRiskRatioInputs();
 state.riskSettings = ratios;
 const unitSeconds = timeframeSeconds(state.timeframe);
 const latestCandleTime = candles[candles.length - 1].time;
 // 포지션 보유 여부와 관계없이 최신 캔들 다음 슬롯부터 손익비 블록을 배치합니다.
 const entryTime = latestCandleTime + unitSeconds;
 const width = clamp(defaultRiskBlockWidth(), MIN_RISK_BLOCK_WIDTH, activeCandleLimit());
 const entryPrice = hasPosition
   ? positiveNumber(calculateFuturesBreakEvenPrice(position), position.entryPrice)
   : positiveNumber(currentFuturesPrice(), positiveNumber(candles[candles.length - 1].close, 0));
 if (!entryPrice) {
   showToast("선물 현재가가 들어온 뒤 손익비 블럭을 만들 수 있습니다.");
   return;
 }
 const riskHeight = percentHeight(entryPrice, ratios.riskRatio);
 const rewardHeight = percentHeight(entryPrice, ratios.rewardRatio);
 state.chart.riskMode = false;
 state.chart.trendMode = false;
 state.chart.horizontalMode = false;
 state.chart.fibonacciMode = false;
 state.chart.draggingFibonacci = null;
 state.chart.limitOrderMode = null;
 state.chart.exitOrderPositionId = "";
 state.chart.pendingPoint = null;
 state.chart.selectedTrendlineId = null;
 const block = refreshRiskBlockPrices({
   id: `rr-futures-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   timeframe: state.timeframe,
   entryX: entryTime,
   entryTime,
   entryPrice,
   direction: hasPosition ? position.direction : "LONG",
   width,
   riskHeight,
   rewardHeight,
   rewardRatio: ratios.rewardRatio,
   riskRatio: ratios.riskRatio,
   rewardRiskRatio: ratios.rewardRatio / ratios.riskRatio,
   isSelected: true,
   createdAt: new Date().toISOString()
 });
 activeRiskBlockStore()[state.timeframe].push(block);
 selectRiskBlock(block.id);
 saveActiveRiskBlocks();
 renderChartRangeControls();
 drawChart();
 showToast(hasPosition ? "선물 포지션 기준 손익비 블럭을 생성했습니다." : "선물 현재가 기준 손익비 블럭을 생성했습니다.");
}
function latestBuyTrade() {
 return tradesForMarket(state.market)
   .filter((trade) => trade.side === "BUY")
   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
}
function selectedRiskBlock() {
 return currentRiskBlocks().find((block) => block.id === state.chart.selectedRiskBlockId) || null;
}
function selectRiskBlock(id) {
 state.chart.selectedRiskBlockId = id || null;
 if (id) state.chart.selectedTrendlineId = null;
 syncRiskSelectionFlags();
 updateTrendControls();
 renderRiskControls();
}
function syncRiskSelectionFlags() {
 currentRiskBlocks().forEach((block) => {
   block.isSelected = block.id === state.chart.selectedRiskBlockId;
 });
}
function deleteSelectedDrawing() {
 if (state.chart.selectedRiskBlockId) {
   deleteSelectedRiskBlock();
   return;
 }
 deleteSelectedTrendline();
}
function deleteSelectedRiskBlock() {
 const selectedId = state.chart.selectedRiskBlockId;
 if (!selectedId) return;
 const store = activeRiskBlockStore();
 Object.keys(store).forEach((timeframe) => {
   store[timeframe] = (store[timeframe] || []).filter((block) => block.id !== selectedId);
 });
 state.chart.selectedRiskBlockId = null;
 state.chart.draggingRiskBlock = null;
 saveActiveRiskBlocks();
 updateTrendControls();
 renderRiskControls();
 drawChart();
 showToast("선택한 손익비 블럭을 삭제했습니다.");
}
function deleteSelectedTrendline() {
 const selectedId = state.chart.selectedTrendlineId;
 if (!selectedId) return;
 const selectedDrawing = currentTrendlines().find((line) => line.id === selectedId);
 const store = activeTrendlineStore();
 Object.keys(store).forEach((timeframe) => {
   store[timeframe] = (store[timeframe] || []).filter((line) => line.id !== selectedId);
 });
 state.chart.selectedTrendlineId = null;
 saveActiveTrendlines();
 updateTrendControls();
 drawChart();
 showToast(selectedDrawing && selectedDrawing.kind === "fibonacci"
   ? "선택한 피보나치를 삭제했습니다."
   : "선택한 추세선을 삭제했습니다.");
}
function confirmClearChartDrawings() {
 closeModal(el.resetModal);
 openConfirm({
   title: "차트 드로잉 삭제",
   message: isFuturesMode()
     ? `${currentFuturesSymbol()} 선물 차트의 모든 시간봉에서 추세선·피보나치·손익비 블럭을 삭제합니다.`
     : "현재 코인의 모든 시간봉에서 추세선·피보나치·손익비 블럭을 삭제합니다.",
   okText: "삭제",
   onConfirm: () => {
     if (isFuturesMode()) {
       state.futures.trendlinesByMarket[currentFuturesMarket().code] = createEmptyTrendlines();
       state.futures.riskBlocksByMarket[currentFuturesMarket().code] = createEmptyRiskBlocks();
     } else {
       state.trendlines = createEmptyTrendlines();
       state.riskBlocks = createEmptyRiskBlocks();
     }
     state.chart.selectedTrendlineId = null;
     state.chart.selectedRiskBlockId = null;
     state.chart.pendingPoint = null;
     state.chart.horizontalMode = false;
     state.chart.fibonacciMode = false;
     state.chart.draggingRiskBlock = null;
     state.chart.draggingFibonacci = null;
     saveActiveTrendlines();
     saveActiveRiskBlocks();
     updateTrendControls();
     renderRiskControls();
     drawChart();
     showToast("차트 드로잉을 모두 삭제했습니다.");
   }
 });
}
function confirmClearTrendlines() {
 closeModal(el.resetModal);
 openConfirm({
   title: "추세선·피보나치 삭제",
   message: isFuturesMode() ? `${currentFuturesSymbol()} 선물 차트의 모든 시간봉 추세선과 피보나치를 삭제합니다.` : "저장된 모든 시간봉의 추세선과 피보나치를 삭제합니다.",
   okText: "삭제",
   onConfirm: () => {
     if (isFuturesMode()) {
       state.futures.trendlinesByMarket[currentFuturesMarket().code] = createEmptyTrendlines();
     } else {
       state.trendlines = createEmptyTrendlines();
     }
     state.chart.selectedTrendlineId = null;
     state.chart.pendingPoint = null;
     state.chart.horizontalMode = false;
     state.chart.fibonacciMode = false;
     state.chart.draggingFibonacci = null;
     saveActiveTrendlines();
     updateTrendControls();
     drawChart();
     showToast("추세선과 피보나치를 모두 삭제했습니다.");
   }
 });
}
function findTrendlineNearPoint(x, y) {
 if (!userChartOverlaysVisible()) return null;
 const metrics = state.chart.metrics;
 if (!metrics) return null;
 let best = null;
 let bestDistance = Infinity;
currentTrendlines().forEach((line) => {
   if (line.kind === "fibonacci") {
     const geometry = fibonacciGeometry(line, metrics);
     if (!geometry || x < geometry.xLeft - 10 || x > geometry.xRight + 10) return;
     const levelDistance = FIBONACCI_LEVELS.reduce((minimum, level) => {
       const price = finiteNumber(line.startPrice, 0)
         + (finiteNumber(line.endPrice, 0) - finiteNumber(line.startPrice, 0)) * level.ratio;
       return Math.min(minimum, Math.abs(y - priceToY(metrics, price)));
     }, Infinity);
     const endpointDistance = Math.min(
       Math.hypot(x - geometry.x1, y - geometry.y1),
       Math.hypot(x - geometry.x2, y - geometry.y2)
     );
     const distance = Math.min(levelDistance, endpointDistance);
     if (distance < bestDistance) {
       bestDistance = distance;
       best = line;
     }
     return;
   }
   const isHorizontal = line.kind === "horizontal";
   const x1 = isHorizontal ? metrics.plot.x : xForTime(metrics, line.startTime);
   const y1 = priceToY(metrics, line.startPrice);
   const x2 = isHorizontal ? metrics.plot.x + metrics.plot.w : xForTime(metrics, line.endTime);
   const y2 = isHorizontal ? y1 : priceToY(metrics, line.endPrice);
   const distance = distanceToSegment(x, y, x1, y1, x2, y2);
   if (distance < bestDistance) {
     bestDistance = distance;
     best = line;
   }
 });
 return bestDistance <= 10 ? best : null;
}
function findRiskBlockAtPoint(x, y) {
 if (!userChartOverlaysVisible()) return null;
 const metrics = state.chart.metrics;
 if (!metrics) return null;
 const blocks = currentRiskBlocks();
 for (let i = blocks.length - 1; i >= 0; i -= 1) {
   const block = blocks[i];
   const geom = riskBlockGeometry(block, metrics);
   if (!geom) continue;
   const handles = riskBlockHandles(geom);
   const handleName = Object.keys(handles).find((name) => Math.hypot(x - handles[name].x, y - handles[name].y) <= RISK_HANDLE_SIZE + 3);
   if (handleName) return { block, handle: handleName };
   if (x >= geom.x1 && x <= geom.x2 && y >= geom.yTop && y <= geom.yBottom) {
     return { block, handle: "select" };
   }
 }
 return null;
}
function riskBlockGeometry(block, metrics) {
 refreshRiskBlockPrices(block);
 const unitSeconds = timeframeSeconds(block.timeframe);
 const x1 = xForTime(metrics, block.entryX);
 const x2 = xForTime(metrics, block.entryX + block.width * unitSeconds);
 const yEntry = priceToY(metrics, block.entryPrice);
 const yTop = priceToY(metrics, block.takeProfitPrice);
 const yBottom = priceToY(metrics, block.stopLossPrice);
 if (![x1, x2, yEntry, yTop, yBottom].every(Number.isFinite)) return null;
 return {
   block,
   x1: Math.min(x1, x2),
   x2: Math.max(x1, x2),
   yTop: Math.min(yTop, yBottom),
   yBottom: Math.max(yTop, yBottom),
   yEntry,
   rawX1: x1,
   rawX2: x2
 };
}
function riskBlockHandles(geom) {
 return {
   right: { x: geom.x2, y: geom.yEntry }
 };
}
function updateRiskBlockDrag(event) {
 const drag = state.chart.draggingRiskBlock;
 const metrics = state.chart.metrics;
 if (!drag || !metrics) return;
 const block = currentRiskBlocks().find((item) => item.id === drag.id);
 const coords = chartCoordinatesFromEvent(event);
 if (!block || !coords) return;
 const x = clamp(coords.x, metrics.plot.x, metrics.plot.x + metrics.plot.w);
 const y = clamp(coords.y, metrics.plot.y, metrics.plot.y + metrics.plot.h);
 const start = drag.startBlock;
 const unitSeconds = timeframeSeconds(start.timeframe || block.timeframe);
 if (drag.handle === "right") {
   block.entryX = start.entryX;
   block.entryTime = start.entryX;
   block.width = Math.max(start.width, MIN_RISK_BLOCK_WIDTH, (xToTime(metrics, x) - start.entryX) / unitSeconds);
   block.entryPrice = start.entryPrice;
 } else if (drag.handle === "move") {
   moveRiskBlockFromDrag(block, drag, x, y);
 }
 block.rewardRatio = start.rewardRatio;
 block.riskRatio = start.riskRatio;
 refreshRiskBlockPrices(block);
 syncRiskSelectionFlags();
 renderRiskControls();
 hideTooltip();
 drawChart();
}
function clampRiskBlockMoveEntryPrice(entryPrice, block, minPrice, maxPrice) {
 const rewardFraction = positiveNumber(finiteNumber(block.rewardRatio, DEFAULT_REWARD_RATIO), DEFAULT_REWARD_RATIO) / 100;
 const riskFraction = positiveNumber(finiteNumber(block.riskRatio, DEFAULT_RISK_RATIO), DEFAULT_RISK_RATIO) / 100;
 const isShort = block.direction === "SHORT";
 const lowerMultiplier = 1 - (isShort ? rewardFraction : riskFraction);
 const upperMultiplier = 1 + (isShort ? riskFraction : rewardFraction);
 const minimumEntry = lowerMultiplier > 0 ? minPrice / lowerMultiplier : minPrice;
 const maximumEntry = upperMultiplier > 0 ? maxPrice / upperMultiplier : maxPrice;
 if (Number.isFinite(minimumEntry) && Number.isFinite(maximumEntry) && minimumEntry <= maximumEntry) {
   return clamp(entryPrice, minimumEntry, maximumEntry);
 }
 return clamp(entryPrice, minPrice, maxPrice);
}
function moveRiskBlockFromDrag(block, drag, x, y) {
 const start = drag.startBlock;
 const blockUnitSeconds = timeframeSeconds(start.timeframe || block.timeframe);
 const chartUnitSeconds = positiveNumber(finiteNumber(drag.startUnitSeconds, blockUnitSeconds), blockUnitSeconds);
 const barSpace = positiveNumber(finiteNumber(drag.startBarSpace, 1), 1);
 const deltaSeconds = ((x - drag.startX) / barSpace) * chartUnitSeconds;
 const deltaSlots = Math.round(deltaSeconds / blockUnitSeconds);
 const requestedEntryTime = start.entryX + deltaSlots * blockUnitSeconds;
 const minimumEntryTime = finiteNumber(drag.startFirstTime, requestedEntryTime);
 const maximumEntryTime = Math.max(
   minimumEntryTime,
   finiteNumber(drag.startFutureEndTime, requestedEntryTime + start.width * blockUnitSeconds) - start.width * blockUnitSeconds
 );
 const priceRange = Math.max(0, finiteNumber(drag.startMaxPrice, 0) - finiteNumber(drag.startMinPrice, 0));
 const plotHeight = positiveNumber(finiteNumber(drag.startPlotHeight, 1), 1);
 const deltaPrice = -((y - drag.startY) / plotHeight) * priceRange;
 const requestedEntryPrice = start.entryPrice + deltaPrice;
 block.entryX = clamp(requestedEntryTime, minimumEntryTime, maximumEntryTime);
 block.entryTime = block.entryX;
 block.width = start.width;
 block.entryPrice = clampRiskBlockMoveEntryPrice(
   requestedEntryPrice,
   start,
   finiteNumber(drag.startMinPrice, requestedEntryPrice),
   finiteNumber(drag.startMaxPrice, requestedEntryPrice)
 );
}
function finishRiskBlockDrag() {
 if (!state.chart.draggingRiskBlock) return;
 state.chart.draggingRiskBlock = null;
 saveActiveRiskBlocks();
 updateChartCursor(null);
 drawChart();
}
function updateChartPanDrag(event) {
  const drag = state.chart.draggingChartPan;
  const coords = chartCoordinatesFromEvent(event);
  if (!drag || !coords) return;
  const deltaX = coords.x - drag.startX;
  const deltaY = coords.y - drag.startY;
  if (!drag.axis) {
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 3) return;
    drag.axis = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
  }
  drag.moved = true;
  state.chart.suppressNextClick = true;
  if (drag.axis === "horizontal") {
    const requestedOffset = drag.startOffset + Math.round(deltaX / drag.barSpace);
    state.chart.panOffset = clampChartPanOffset(requestedOffset);
  } else {
    const requestedRatio = drag.startPricePanRatio + deltaY / drag.plotHeight;
    state.chart.pricePanRatio = clampChartPricePanRatio(requestedRatio);
    if (state.chart.priceScaleAnimation) {
      state.chart.priceScaleAnimation.startedAt = 0;
      state.chart.priceScaleAnimation.animateNext = false;
    }
  }
  renderChartRangeControls();
  state.chart.hover = null;
  hideTooltip();
  updateChartCursor(null);
  drawChart();
}
function finishChartPanDrag() {
  if (!state.chart.draggingChartPan) return;
  state.chart.draggingChartPan = null;
  updateChartCursor(null);
  drawChart();
}
function updateChartCursor(hit, canPan = false) {
  if (!el.chartCanvas) return;
  if (state.chart.draggingFibonacci) {
    el.chartCanvas.style.cursor = "crosshair";
    return;
  }
  if (state.chart.draggingRiskBlock) {
    el.chartCanvas.style.cursor = state.chart.draggingRiskBlock.handle === "right" ? "e-resize" : "grabbing";
    return;
  }
  if (state.chart.draggingChartPan) {
    el.chartCanvas.style.cursor = "grabbing";
    return;
  }
 if (state.chart.percentMeasureMode) {
   el.chartCanvas.style.cursor = "crosshair";
   return;
 }
 if (hit) {
   const cursors = {
     select: "grab",
     right: "e-resize"
   };
   el.chartCanvas.style.cursor = cursors[hit.handle] || "pointer";
   return;
 }
  el.chartCanvas.style.cursor = state.chart.trendMode || state.chart.horizontalMode || state.chart.fibonacciMode || state.chart.limitOrderMode || state.chart.exitOrderPositionId
    ? "crosshair"
    : canPan ? "grab" : "default";
}
function setFuturesLeverage(leverage) {
 if (!FUTURES_LEVERAGES.includes(leverage)) return;
 state.futures.leverage = leverage;
 saveFuturesState();
 renderFuturesAccountControls();
 renderTradeButtons();
}
async function toggleFuturesLimitOrderMode(direction) {
 if (!isFuturesMode()) return;
 if (futuresOfflineReplayRunning) return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 const nextDirection = direction === "SHORT" ? "SHORT" : "LONG";
 if (state.chart.limitOrderMode === nextDirection) {
   state.chart.limitOrderMode = null;
   updateTrendControls();
   renderFuturesLimitOrders();
   drawChart();
   return;
 }
  const entryRule = futuresEntryRuleState(nextDirection);
  if (entryRule.blocked) return showToast(entryRule.reason);
 const price = currentFuturesPriceOrToast();
 if (!price) return;
 if (!await ensureFuturesOrderTriggerBaseline()) return;
 const orderInput = readFuturesEntryOrderInput(price, state.futures.leverage);
 const margin = positiveNumber(orderInput.margin, 0);
 if (margin <= 0) return showToast("지정가 예약에 사용할 증거금을 먼저 입력하세요.");
 const entryFee = margin * state.futures.leverage * FUTURES_FEE_RATE;
 if (margin + entryFee > futuresAvailableUsdtBalance()) {
   return showToast("지정가 예약에 필요한 증거금과 진입 수수료가 사용 가능 잔고보다 큽니다.");
  }
  state.chart.limitOrderMode = nextDirection;
  state.chart.exitOrderPositionId = "";
  state.chart.positionFilterId = "";
  state.chart.percentMeasureMode = false;
 state.chart.percentMeasureStart = null;
 state.chart.trendMode = false;
 state.chart.horizontalMode = false;
 state.chart.fibonacciMode = false;
 state.chart.draggingFibonacci = null;
 state.chart.riskMode = false;
 state.chart.pendingPoint = null;
 state.chart.selectedTrendlineId = null;
 state.chart.selectedRiskBlockId = null;
  updateTrendControls();
  renderRiskControls();
  renderChartPositionFilter();
  renderFuturesPositionPanel();
  renderFuturesOpenPositionsBlock();
  renderFuturesLimitOrders();
 drawChart();
}
function normalizedFuturesLimitPrice(price, marketCode = currentFuturesMarket().code) {
 const value = positiveNumber(finiteNumber(price, 0), 0);
 if (!value) return 0;
 if (futuresPriceCurrency(marketCode) !== "USD" && futuresPriceCurrency(marketCode) !== "USDT") return Math.round(value);
 const factor = 10 ** futuresPriceDecimals(marketCode);
 return Math.round(value * factor) / factor;
}
async function placeFuturesLimitOrderFromChart(direction, chartPrice) {
 if (!isFuturesMode() || !ensureFuturesStorageCurrent()) return false;
 if (futuresOfflineReplayRunning) return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 const market = currentFuturesMarket();
 const currentPrice = currentFuturesPriceOrToast();
 const price = normalizedFuturesLimitPrice(chartPrice, market.code);
 const positionDirection = direction === "SHORT" ? "SHORT" : "LONG";
  const entryRule = futuresEntryRuleState(positionDirection, market.code);
  if (entryRule.blocked) {
    showToast(entryRule.reason);
    return false;
  }
 if (!currentPrice || !price) return false;
 if (positionDirection === "LONG" && price >= currentPrice) {
   showToast("예약 매수(롱) 지정가는 현재가보다 낮게 놓으세요.");
   return false;
 }
 if (positionDirection === "SHORT" && price <= currentPrice) {
   showToast("예약 매도(숏) 지정가는 현재가보다 높게 놓으세요.");
   return false;
 }
 const leverage = state.futures.leverage;
 const orderInput = readFuturesEntryOrderInput(price, leverage);
 const margin = positiveNumber(orderInput.margin, 0);
 if (margin <= 0) {
   showToast(futuresEntryInputMode === "BTC" ? `지정가 예약에 사용할 ${market.symbol} 수량을 입력하세요.` : "지정가 예약에 사용할 증거금을 입력하세요.");
   return false;
 }
 const entryFee = margin * leverage * FUTURES_FEE_RATE;
 if (margin + entryFee > futuresAvailableUsdtBalance()) {
   showToast("지정가 예약에 필요한 증거금과 진입 수수료가 사용 가능 잔고보다 큽니다.");
   return false;
 }
 const createdAt = new Date().toISOString();
 const triggerBaseline = await ensureFuturesOrderTriggerBaseline(createdAt);
 if (!triggerBaseline) return false;
 const order = normalizeFuturesLimitOrder({
   id: `flo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   market: market.code,
   symbol: market.symbol,
   direction: positionDirection,
   price,
   margin,
   leverage,
   inputMode: orderInput.inputMode,
   quantity: orderInput.quantity,
   referencePrice: currentPrice,
   createdAt,
   ...triggerBaseline
 });
 if (!order) return false;
 const checkpoint = createFuturesPersistenceCheckpoint();
 state.futures.limitOrders = [...normalizeFuturesLimitOrders(state.futures.limitOrders), order];
 if (!saveFuturesState({ reason: "limit-order-create" })) {
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   showToast("저장 실패로 지정가 예약을 취소했습니다. 기존 데이터는 유지됩니다.");
   return false;
 }
 state.chart.limitOrderMode = null;
 clearFuturesEntryInputs();
 renderAll();
 drawChart();
 const fileBackupResult = await verifyFuturesTradeFileBackup("limit-order-create");
 showToast(`${positionDirection === "LONG" ? "예약 매수(롱)" : "예약 매도(숏)"} ${formatFuturesDisplayPrice(price, market.code)}에 등록했습니다.${futuresTradeFileBackupStatusText(fileBackupResult)}`);
 return true;
}
function cancelFuturesLimitOrder(orderId) {
 if (!orderId || !ensureFuturesStorageCurrent()) return;
 if (futuresOfflineReplayRunning) return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 if (state.futures.orderBusy) return false;
 const orders = normalizeFuturesLimitOrders(state.futures.limitOrders);
 const target = orders.find((order) => order.id === orderId);
 if (!target) return showToast("취소할 지정가 예약을 찾지 못했습니다.");
 const checkpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresLimitOrderSettledIds);
 settleFuturesLimitOrder(orderId);
 state.futures.limitOrders = orders.filter((order) => order.id !== orderId);
 if (!saveFuturesState({ reason: "limit-order-cancel" })) {
   futuresLimitOrderSettledIds = settledIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   return showToast("저장 실패로 지정가 예약 취소를 중단했습니다.");
 }
 triggeringFuturesLimitOrderIds.delete(orderId);
 futuresLimitOrderRetryAt.delete(orderId);
 pendingFuturesTriggeredOrders.delete(`entry:${orderId}`);
 heldFuturesTriggerFailures.delete(`entry:${orderId}`);
 renderAll();
 drawChart();
 showToast("지정가 예약을 취소했습니다.");
}
function acknowledgeFuturesCompletedOrder(noticeId) {
 if (!noticeId || !ensureFuturesStorageCurrent()) return false;
 if (futuresOfflineReplayRunning) {
   showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 확인하세요.");
   return false;
 }
 if (state.futures.orderBusy) return false;
 const notices = normalizeFuturesCompletedOrderNotices(state.futures.completedOrderNotices);
 const target = notices.find((notice) => notice.id === noticeId);
 if (!target) {
   showToast("확인할 예약 체결 완료 알림을 찾지 못했습니다.");
   return false;
 }
 const checkpoint = createFuturesPersistenceCheckpoint();
 removeFuturesCompletedOrderNotice(noticeId);
 if (!saveFuturesState({ reason: "completed-order-notice-acknowledge" })) {
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   showToast("저장 실패로 완료 알림을 유지했습니다.");
   return false;
 }
 renderAll();
 drawChart();
 showToast("예약 체결 완료를 확인했습니다. 차트 표시도 삭제했습니다.");
 return true;
}
function createRecoveredFuturesEntry(order, executionTime, exchangeRate, suffix) {
 if (!order) return null;
 const margin = positiveNumber(finiteNumber(order.margin, 0), 0);
 const leverage = positiveNumber(finiteNumber(order.leverage, 0), 0);
 const price = positiveNumber(finiteNumber(order.price, 0), 0);
 if (!margin || !leverage || !price) return null;
 const notional = margin * leverage;
 const quantity = String(order.inputMode || "").toUpperCase() === "BTC"
   ? normalizeFuturesBtcQuantity(order.quantity)
   : normalizeFuturesBtcQuantity(notional / price);
 const openedAtMs = timestampMs(executionTime);
 return normalizeFuturesPosition({
   id: `fpe-${openedAtMs || Date.now()}-${suffix || String(order.id || "recovered")}`,
   market: order.market,
   symbol: order.symbol,
   priceSource: futuresPriceSourceForMarket(order.market),
   direction: order.direction,
   entryPrice: price,
   margin,
   leverage,
   notional,
   quantity,
   inputMode: order.inputMode,
   requestedQuantity: quantity,
   executedQuantity: quantity,
   remainingQuantity: quantity,
   entryFee: notional * FUTURES_FEE_RATE,
   sourceLimitOrderId: order.id,
   orderType: "LIMIT",
   exchangeRate,
   exchangeRateUpdatedAt: state.futures.exchangeRateUpdatedAt,
   openedAt: executionTime
 });
}
function mergeRecoveredFuturesEntry(position, entryPosition) {
 const existing = normalizeFuturesPosition(position);
 const entry = normalizeFuturesPosition(entryPosition);
 if (!existing || !entry) return null;
 const margin = existing.margin + entry.margin;
 const notional = existing.notional + entry.notional;
 const quantity = normalizeFuturesBtcQuantity(existing.quantity + entry.quantity);
 const entryPrice = quantity > 0 ? notional / quantity : existing.entryPrice;
 return normalizeFuturesPosition({
   ...existing,
   entryPrice,
   margin,
   notional,
   quantity,
   entryFee: existing.entryFee + entry.entryFee,
   entries: [...futuresEntryLegs(existing), ...futuresEntryLegs(entry)],
   remainingPercent: 100,
   liquidationPrice: calculateSimpleFuturesLiquidationPrice({
     direction: existing.direction,
     entryPrice,
     leverage: existing.leverage
   }),
   openedAt: existing.openedAt
 });
}
function restoreCompletedFuturesPositionForRepair(block) {
 if (!block) return null;
 const restoredEntries = futuresEntryLegs({ ...block, entries: block.entries }).map((entry) => ({
   ...entry,
   remainingQuantity: entry.quantity,
   status: "OPEN"
 }));
 const entryFee = restoredEntries.reduce((sum, entry) => sum + finiteNumber(entry.entryFee, 0), 0);
 return normalizeFuturesPosition({
   ...block,
   id: block.positionId,
   direction: String(block.direction || "").toUpperCase() === "SHORT" ? "SHORT" : "LONG",
   margin: block.margin,
   notional: positiveNumber(finiteNumber(block.notional, 0), block.margin * block.leverage),
   quantity: block.quantity,
   entryFee,
   entries: restoredEntries,
   remainingPercent: 100,
   seedBeforeEntry: block.seedBeforeTrade,
   openedAt: block.entryTime || block.openedAt
 });
}
function replayCorrectedFuturesClose(position, sourceTrade, balanceBefore) {
 const normalizedPosition = normalizeFuturesPosition(position);
 const normalizedTrade = normalizeFuturesTrade(sourceTrade);
 if (!normalizedPosition || !normalizedTrade) return null;
 const closeRatio = clamp(normalizedTrade.margin / normalizedPosition.margin, 0, 1);
 if (closeRatio <= 0 || closeRatio >= 1) return null;
 const closeQuantity = normalizeFuturesBtcQuantity(normalizedPosition.quantity * closeRatio);
 const consumedEntries = consumeFuturesEntryQuantities(
   futuresEntryLegs(normalizedPosition),
   closeQuantity
 );
 if (consumedEntries.remainingToClose > FUTURES_BTC_EPSILON) return null;
 const closedPosition = normalizeFuturesPosition({
   ...normalizedPosition,
   margin: normalizedPosition.margin * closeRatio,
   notional: normalizedPosition.notional * closeRatio,
   quantity: closeQuantity,
   entries: undefined,
   entryFee: normalizedPosition.entryFee * closeRatio,
   basisAdjustmentUsdt: futuresBasisAdjustment(normalizedPosition) * closeRatio,
   remainingPercent: normalizedPosition.remainingPercent * closeRatio
 });
 if (!closedPosition) return null;
 const calc = calculateFuturesPosition(closedPosition, normalizedTrade.exitPrice);
 const balanceAfter = Math.max(
   0,
   balanceBefore + closedPosition.margin + calc.grossPnl - calc.exitFee
 );
 const remainingRatio = 1 - closeRatio;
 const remainingPosition = normalizeFuturesPosition({
   ...normalizedPosition,
   margin: normalizedPosition.margin * remainingRatio,
   notional: normalizedPosition.notional * remainingRatio,
   quantity: normalizeFuturesBtcQuantity(normalizedPosition.quantity - closeQuantity),
   entries: consumedEntries.entries,
   entryFee: normalizedPosition.entryFee * remainingRatio,
   basisAdjustmentUsdt: futuresBasisAdjustment(normalizedPosition) * remainingRatio,
   remainingPercent: normalizedPosition.remainingPercent * remainingRatio
 });
 const correctedTrade = normalizeFuturesTrade({
   ...normalizedTrade,
   entryPrice: calc.effectiveEntryPrice || futuresEffectiveEntryPrice(closedPosition),
   margin: closedPosition.margin,
   notional: closedPosition.notional,
   quantity: closedPosition.quantity,
   entries: futuresEntryLegs(normalizedPosition),
   grossPnl: calc.grossPnl,
   entryFee: calc.entryFee,
   exitFee: calc.exitFee,
   fee: calc.fee,
   netPnl: calc.netPnl,
   realizedPnl: calc.netPnl,
   roe: calc.roePercent,
   roePercent: calc.roePercent,
   liquidationPrice: calc.liquidationPrice,
   balanceAfter
 });
 if (!remainingPosition || !correctedTrade) return null;
 return { remainingPosition, correctedTrade, balanceAfter };
}
function calculateHistoricalFuturesEquity(balance, positions, price) {
 return Math.max(0, finiteNumber(balance, 0)) + normalizeFuturesPositions(positions).reduce((sum, position) => {
   const calc = calculateFuturesPosition(position, price);
   return sum + position.margin + calc.grossPnl - calc.exitFee;
 }, 0);
}
function repairAccidentalPartialCloses20260731() {
 const repairTargets = FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_20260731.positions;
 const positions = getFuturesPositions();
 if (futuresHasRestoredAccidentalPartialCloseEntries(positions)) {
   let repairAlreadyPersisted = false;
   try {
     repairAlreadyPersisted = localStorage.getItem(FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_KEY) === "true";
   } catch (error) {
     repairAlreadyPersisted = false;
   }
   if (repairAlreadyPersisted) return false;
   const persistenceCheckpoint = createFuturesPersistenceCheckpoint();
   if (!saveFuturesState({ reason: "accidental-partial-close-record-cleanup" })) {
     restoreFuturesPersistenceCheckpoint(persistenceCheckpoint);
     console.error("Accidental partial-close record cleanup rolled back because persistence failed");
     return false;
   }
   try {
     safeSetItem(FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_KEY, "true");
   } catch (error) {
     console.warn("Accidental partial-close repair marker could not be saved", error);
   }
   return true;
 }
 const completedBlocks = normalizeFuturesPositionBlocks(state.futures.positionBlocks);
 const targetBlocks = repairTargets.map((target) => completedBlocks.find((block) => (
   block.id === target.blockId
   && block.positionId === target.positionId
   && Array.isArray(block.trades)
   && block.trades.some((trade) => trade.id === target.tradeId)
 )));
 if (targetBlocks.every((block) => !block)) return false;
 if (
   targetBlocks.some((block) => !block)
   || positions.some((position) => repairTargets.some((target) => target.positionId === position.id))
 ) {
   console.error("Accidental partial-close repair stopped because the target history is incomplete or already restored");
   return false;
 }
 const targetTrades = repairTargets.map((target, index) => normalizeFuturesTrade(
   targetBlocks[index].trades.find((trade) => trade.id === target.tradeId)
 ));
 const restoredPositions = targetBlocks.map(restoreCompletedFuturesPositionForRepair);
 if (targetTrades.some((trade) => !trade) || restoredPositions.some((position) => !position)) {
   console.error("Accidental partial-close repair stopped because a target position could not be reconstructed");
   return false;
 }
 const returnedCash = targetTrades.reduce((sum, trade) => (
   sum + trade.margin + trade.grossPnl - trade.exitFee
 ), 0);
 const correctedBalance = finiteNumber(state.futures.account.usdtBalance, 0) - returnedCash;
 if (!Number.isFinite(correctedBalance) || correctedBalance < 0) {
   console.error("Accidental partial-close repair stopped because the corrected cash balance is invalid");
   return false;
 }
 const persistenceCheckpoint = createFuturesPersistenceCheckpoint();
 const targetBlockIds = new Set(repairTargets.map((target) => target.blockId));
 const targetPositionIds = new Set(repairTargets.map((target) => target.positionId));
 const targetTradeIds = new Set(repairTargets.map((target) => target.tradeId));
 setFuturesPositions([...positions, ...restoredPositions]);
 state.futures.trades = (Array.isArray(state.futures.trades) ? state.futures.trades : [])
   .map(normalizeFuturesTrade)
   .filter((trade) => trade && !targetTradeIds.has(trade.id));
 state.futures.positionBlocks = completedBlocks.filter((block) => (
   !targetBlockIds.has(block.id) && !targetPositionIds.has(block.positionId)
 ));
 state.futures.account.usdtBalance = correctedBalance;
 state.futures.account.updatedAt = new Date().toISOString();
 const latestRemainingTrade = [
   ...state.futures.trades,
   ...state.futures.positionBlocks.flatMap((block) => Array.isArray(block.trades) ? block.trades : [])
 ]
   .map(normalizeFuturesTrade)
   .filter(Boolean)
   .sort((a, b) => timestampMs(b.closedAt || b.exitTime) - timestampMs(a.closedAt || a.exitTime))[0];
 state.futures.lastRealizedPnl = latestRemainingTrade ? latestRemainingTrade.netPnl : 0;
 if (!saveFuturesState({ reason: "accidental-partial-close-rollback" })) {
   restoreFuturesPersistenceCheckpoint(persistenceCheckpoint);
   console.error("Accidental partial-close repair rolled back because persistence failed");
   return false;
 }
 try {
   safeSetItem(FUTURES_ACCIDENTAL_PARTIAL_CLOSE_REPAIR_KEY, "true");
 } catch (error) {
   console.warn("Accidental partial-close repair marker could not be saved", error);
 }
 return true;
}
function repairMissedFuturesFills20260730() {
 const repair = FUTURES_MISSED_FILL_REPAIR_20260730;
 const limitOrders = normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders);
 const order20 = limitOrders.find((order) => order.id === repair.entry20Id);
 const order30 = limitOrders.find((order) => order.id === repair.entry30Id);
 if (!order20 && !order30) return false;
 if (!order20 || !order30) {
   console.error("Missed futures fill repair stopped because only one target order remains");
   return false;
 }
 const positions = getFuturesPositions();
 const position20 = positions.find((position) => position.id === repair.position20Id);
 const completedBlocks = normalizeFuturesPositionBlocks(state.futures.positionBlocks);
 const position30Block = completedBlocks.find((block) => (
   block.id === repair.position30BlockId
   && block.positionId === repair.position30Id
 ));
 if (!position20 || !position30Block) {
   console.error("Missed futures fill repair stopped because the downstream position history changed");
   return false;
 }
 const sourceCloseTrades = repair.closeTradeIds
   .map((tradeId) => normalizeFuturesTrade(
     (position30Block.trades || []).find((trade) => trade.id === tradeId)
   ))
   .filter(Boolean)
   .sort((a, b) => timestampMs(a.exitTime) - timestampMs(b.exitTime));
 if (sourceCloseTrades.length !== repair.closeTradeIds.length) {
   console.error("Missed futures fill repair stopped because the downstream close trades are incomplete");
   return false;
 }
 const entry20 = createRecoveredFuturesEntry(
   order20,
   repair.entry20At,
   position20.exchangeRate,
   "missed-long-20x"
 );
 const restoredPosition30 = restoreCompletedFuturesPositionForRepair(position30Block);
 const entry30 = createRecoveredFuturesEntry(
   order30,
   repair.entry30At,
   restoredPosition30 && restoredPosition30.exchangeRate,
   "missed-long-30x"
 );
 const correctedPosition20 = mergeRecoveredFuturesEntry(position20, entry20);
 const correctedPosition30BeforeCloses = mergeRecoveredFuturesEntry(restoredPosition30, entry30);
 if (!entry20 || !entry30 || !correctedPosition20 || !correctedPosition30BeforeCloses) {
   console.error("Missed futures fill repair stopped because a corrected position could not be built");
   return false;
 }
 const fillCost = entry20.margin + entry20.entryFee + entry30.margin + entry30.entryFee;
 const oldCloseReturns = sourceCloseTrades.reduce((sum, trade) => (
   sum + trade.margin + trade.grossPnl - trade.exitFee
 ), 0);
 let correctedBalance = finiteNumber(state.futures.account.usdtBalance, 0) - fillCost - oldCloseReturns;
 if (!Number.isFinite(correctedBalance) || correctedBalance < 0) {
   console.error("Missed futures fill repair stopped because the corrected cash balance is invalid");
   return false;
 }
 let correctedPosition30 = correctedPosition30BeforeCloses;
 const correctedTrades = [];
 for (const sourceTrade of sourceCloseTrades) {
   const replayed = replayCorrectedFuturesClose(correctedPosition30, sourceTrade, correctedBalance);
   if (!replayed) {
     console.error("Missed futures fill repair stopped because a downstream close could not be replayed");
     return false;
   }
   correctedPosition30 = replayed.remainingPosition;
   correctedBalance = replayed.balanceAfter;
   replayed.correctedTrade.seedAfterTrade = calculateHistoricalFuturesEquity(
     correctedBalance,
     [correctedPosition20, correctedPosition30],
     replayed.correctedTrade.exitPrice
   );
   correctedTrades.push(replayed.correctedTrade);
 }
 const persistenceCheckpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresLimitOrderSettledIds);
 settleFuturesLimitOrder(order20.id);
 settleFuturesLimitOrder(order30.id);
 state.futures.limitOrders = limitOrders.filter((order) => (
   order.id !== order20.id && order.id !== order30.id
 ));
 const remainingPositions = positions.filter((position) => (
   position.id !== position20.id && position.id !== repair.position30Id
 ));
 setFuturesPositions([
   ...remainingPositions,
   correctedPosition20,
   correctedPosition30
 ]);
 const correctedTradeIds = new Set(correctedTrades.map((trade) => trade.id));
 state.futures.trades = mergeFuturesTradesById([
   ...(Array.isArray(state.futures.trades) ? state.futures.trades : [])
     .map(normalizeFuturesTrade)
     .filter((trade) => trade && !correctedTradeIds.has(trade.id)),
   ...correctedTrades
 ]);
 state.futures.positionBlocks = completedBlocks.filter((block) => (
   block.id !== repair.position30BlockId && block.positionId !== repair.position30Id
 ));
 state.futures.account.usdtBalance = correctedBalance;
 state.futures.account.updatedAt = new Date().toISOString();
 state.futures.lastRealizedPnl = correctedTrades[correctedTrades.length - 1].netPnl;
 addFuturesCompletedOrderNotice(order30, "ENTRY", {
   positionId: repair.position30Id,
   price: order30.price,
   completedAt: repair.entry30At
 });
 addFuturesCompletedOrderNotice(order20, "ENTRY", {
   positionId: repair.position20Id,
   price: order20.price,
   completedAt: repair.entry20At
 });
 if (!saveFuturesState({ reason: "missed-limit-fill-history-repair" })) {
   futuresLimitOrderSettledIds = settledIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(persistenceCheckpoint);
   console.error("Missed futures fill repair rolled back because persistence failed");
   return false;
 }
 return true;
}
function futuresOfflineReplayStartMs(order) {
 const baseMs = futuresOfflineReplayResumeMs(order);
 if (!baseMs) return 0;
 const minuteMs = FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS * 1000;
 // Include the order's creation minute. Exact createdAt filtering below keeps
 // the synthetic path from using the part of that minute before the order existed.
 return Math.floor(baseMs / minuteMs) * minuteMs;
}
function futuresOfflineReplayResumeMs(order) {
 const createdAtMs = timestampMs(order && order.createdAt);
 const checkedThroughMs = timestampMs(order && order.historyCheckedThrough);
 // Recheck a rolling overlap instead of trusting the forward-only cursor.
 // A live websocket/kline race or an interrupted fill must never make a crossed
 // price range permanently invisible after historyCheckedThrough advances.
 const auditedOverlapStartMs = checkedThroughMs > 0
   ? Math.max(0, checkedThroughMs - FUTURES_OFFLINE_REPLAY_REAUDIT_MS)
   : 0;
 const baseMs = Math.max(createdAtMs, auditedOverlapStartMs);
 return baseMs > 0 ? baseMs : 0;
}
function pendingFuturesOfflineReplayOrders(marketCode = currentFuturesMarket().code) {
 const normalizedMarketCode = normalizeFuturesMarketCode(marketCode);
 const limitOrders = normalizeFuturesLimitOrders(state.futures && state.futures.limitOrders)
   .filter((order) => order.market === normalizedMarketCode && !order.triggeredAt);
 const openPositionIds = new Set(getFuturesPositions().map((position) => String(position.id)));
 const exitOrders = normalizeFuturesExitOrders(state.futures && state.futures.exitOrders)
   .filter((order) => order.market === normalizedMarketCode && openPositionIds.has(order.positionId) && !order.triggeredAt);
 return { limitOrders, exitOrders, all: [...limitOrders, ...exitOrders] };
}
function advancePendingFuturesOrderHistory(checkedThroughMs, marketCode = currentFuturesMarket().code) {
 const safeMs = Math.max(0, finiteNumber(checkedThroughMs, 0));
 if (!safeMs) return false;
 const normalizedMarketCode = normalizeFuturesMarketCode(marketCode);
 const checkedThrough = new Date(safeMs).toISOString();
 let changed = false;
 state.futures.limitOrders = normalizeFuturesLimitOrders(state.futures.limitOrders).map((order) => {
   if (order.market !== normalizedMarketCode) return order;
   if (timestampMs(order.historyCheckedThrough) >= safeMs) return order;
   changed = true;
   return { ...order, historyCheckedThrough: checkedThrough };
 });
 state.futures.exitOrders = normalizeFuturesExitOrders(state.futures.exitOrders).map((order) => {
   if (order.market !== normalizedMarketCode) return order;
   if (timestampMs(order.historyCheckedThrough) >= safeMs) return order;
   changed = true;
   return { ...order, historyCheckedThrough: checkedThrough };
 });
 return changed;
}
async function fetchFuturesOfflineReplayCandles(market, startMs) {
 if (!market || market.chartSource !== "BINANCE" || !market.binanceSymbol) {
   throw new Error("종료 중 예약 계산은 Binance 1분봉에서만 지원됩니다.");
 }
 const minuteMs = FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS * 1000;
 const firstMinuteMs = Math.max(0, Math.floor(finiteNumber(startMs, 0) / minuteMs) * minuteMs);
 const fetchedAtMs = Date.now();
 const currentMinuteMs = Math.floor(fetchedAtMs / minuteMs) * minuteMs;
 if (!firstMinuteMs || firstMinuteMs > currentMinuteMs) {
   return { candles: [], complete: true, checkedThroughMs: currentMinuteMs, pages: 0 };
 }
 const collected = new Map();
 let cursorEndMs = fetchedAtMs;
 let complete = false;
 let pages = 0;
 let previousOldestMs = Infinity;
 for (let pageIndex = 0; pageIndex < FUTURES_OFFLINE_REPLAY_MAX_PAGES; pageIndex += 1) {
   const rows = await requestBinanceFuturesJson("/fapi/v1/klines", {
     symbol: market.binanceSymbol,
     interval: "1m",
     limit: FUTURES_OFFLINE_REPLAY_PAGE_LIMIT,
     endTime: cursorEndMs
   });
   pages += 1;
   if (!Array.isArray(rows) || !rows.length) break;
   let pageOldestMs = Infinity;
   rows.forEach((row) => {
     const candleStartMs = Math.floor(parseChartNumber(row && row[0], 0) / minuteMs) * minuteMs;
     pageOldestMs = Math.min(pageOldestMs, candleStartMs);
     // The current one-minute candle is still forming. Live ticker/kline evidence
     // handles it; replay only completed candles so a pre-order wick cannot fill a new order.
     if (candleStartMs < firstMinuteMs || candleStartMs >= currentMinuteMs) return;
     const candle = normalizeCandle({
       time: Math.floor(candleStartMs / 1000),
       open: parseChartNumber(row && row[1], NaN),
       high: parseChartNumber(row && row[2], NaN),
       low: parseChartNumber(row && row[3], NaN),
       close: parseChartNumber(row && row[4], NaN),
       volume: Math.max(0, parseChartNumber(row && row[5], 0)),
       value: Math.max(0, parseChartNumber(row && row[7], 0))
     });
     if (isValidChartCandle(candle)) collected.set(candle.time, candle);
   });
   if (!Number.isFinite(pageOldestMs) || pageOldestMs >= previousOldestMs) break;
   if (pageOldestMs <= firstMinuteMs) {
     complete = true;
     break;
   }
   previousOldestMs = pageOldestMs;
   cursorEndMs = pageOldestMs - 1;
 }
 const candles = [...collected.values()].sort((a, b) => a.time - b.time);
 if (complete && firstMinuteMs < currentMinuteMs) {
   const expectedCount = Math.floor((currentMinuteMs - firstMinuteMs) / minuteMs);
   const isContiguous = candles.length === expectedCount && candles.every((candle, index) => (
     candle.time * 1000 === firstMinuteMs + index * minuteMs
   ));
   if (!isContiguous) complete = false;
 }
 return {
   candles,
   complete,
   checkedThroughMs: candles.length
     ? Math.min(
       (candles[candles.length - 1].time + FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS) * 1000,
       currentMinuteMs
     )
     : firstMinuteMs,
   pages
 };
}
function futuresOfflineReplayEvents(candleStartMs, attemptedOrderIds = new Set(), availableAtMs = Infinity, marketCode = currentFuturesMarket().code) {
 const pending = pendingFuturesOfflineReplayOrders(marketCode);
 const events = [];
 pending.limitOrders.forEach((order) => {
   const resumeAtMs = futuresOfflineReplayResumeMs(order);
   if (attemptedOrderIds.has(order.id) || futuresOfflineReplayStartMs(order) > candleStartMs || resumeAtMs > availableAtMs) return;
   events.push({
     id: order.id,
     kind: "entry",
     price: order.price,
     triggerSide: order.direction === "SHORT" ? "ABOVE" : "BELOW",
     referencePrice: order.referencePrice,
     ...normalizeFuturesOrderTriggerBaseline(order),
     resumeAtMs,
     createdAt: order.createdAt
   });
 });
 pending.exitOrders.forEach((order) => {
   const resumeAtMs = futuresOfflineReplayResumeMs(order);
   if (attemptedOrderIds.has(order.id) || futuresOfflineReplayStartMs(order) > candleStartMs || resumeAtMs > availableAtMs) return;
   events.push({
     id: order.id,
     kind: "exit",
     price: order.price,
     triggerSide: order.triggerSide,
     referencePrice: order.referencePrice,
     ...normalizeFuturesOrderTriggerBaseline(order),
     resumeAtMs,
     createdAt: order.createdAt
   });
 });
 return events;
}
function sortFuturesOfflineReplayEvents(events, direction = "OPEN") {
 return [...events].sort((a, b) => {
   if (direction === "UP" && a.price !== b.price) return a.price - b.price;
   if (direction === "DOWN" && a.price !== b.price) return b.price - a.price;
   if (a.kind !== b.kind) return a.kind === "exit" ? -1 : 1;
   const timeDiff = timestampMs(a.createdAt) - timestampMs(b.createdAt);
   return timeDiff || String(a.id).localeCompare(String(b.id));
 });
}
function futuresOfflineReplayExecutionTime(candle, phaseIndex, eventIndex = 0) {
 return new Date(futuresOfflineReplayExecutionTimeMs(candle, phaseIndex, eventIndex)).toISOString();
}
function futuresOfflineReplayExecutionTimeMs(candle, phaseIndex, eventIndex = 0) {
 const offsets = [1000, 15000, 35000, 55000];
 const baseMs = finiteNumber(candle && candle.time, 0) * 1000;
 const offsetMs = offsets[clamp(Math.round(phaseIndex), 0, offsets.length - 1)] + Math.min(900, eventIndex * 50);
 return baseMs + offsetMs;
}
function futuresOfflineReplayEventCrossedInPhase(event, fromPrice, toPrice, phaseStartMs) {
 if (!event) return false;
 const eventFromPrice = event.resumeAtMs > phaseStartMs
   ? positiveNumber(finiteNumber(event.referencePrice, fromPrice), fromPrice)
   : fromPrice;
 return event.triggerSide === "ABOVE"
   ? eventFromPrice < event.price && toPrice >= event.price
   : eventFromPrice > event.price && toPrice <= event.price;
}
function futuresOfflineReplayCreationMinuteEventReached(event, candle) {
 if (!event || !candle) return false;
 const closeReached = event.triggerSide === "ABOVE"
   ? candle.close >= event.price
   : candle.close <= event.price;
 if (closeReached) return true;
 if (!event.triggerBaselineReady || event.triggerBaselineCandleTime !== candle.time) return false;
 return event.triggerSide === "ABOVE"
   ? event.triggerBaselineHigh > 0 && candle.high > event.triggerBaselineHigh && candle.high >= event.price
   : event.triggerBaselineLow > 0 && candle.low < event.triggerBaselineLow && candle.low <= event.price;
}
function futuresOfflineReplayCreationMinuteExecutionTime(candle, event, eventIndex = 0) {
 const candleStartMs = finiteNumber(candle && candle.time, 0) * 1000;
 const candleEndMs = candleStartMs + FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS * 1000 - 1;
 const estimatedMs = Math.max(timestampMs(event && event.createdAt), candleStartMs + 59000 + eventIndex * 25);
 return new Date(Math.min(candleEndMs, estimatedMs)).toISOString();
}
function deferFuturesOfflineReplayEvent(event, executionTime, summary) {
 if (!event) return false;
 const order = event.kind === "entry"
   ? normalizeFuturesLimitOrders(state.futures.limitOrders).find((item) => item.id === event.id)
   : normalizeFuturesExitOrders(state.futures.exitOrders).find((item) => item.id === event.id);
 if (!order) return false;
 const key = `${event.kind}:${order.id}`;
 const triggerTimestamp = timestampMs(executionTime) || Date.now();
 const record = {
   key,
   id: order.id,
   kind: event.kind,
   market: order.market,
   price: order.price,
   triggerSide: futuresOrderTriggerSide(order, event.kind),
   createdAt: order.createdAt,
   executionTime: new Date(triggerTimestamp).toISOString(),
   timestamp: triggerTimestamp,
   source: "offline-one-minute-replay",
   attempts: 0
 };
 pendingFuturesTriggeredOrders.set(key, record);
 persistNewFuturesTriggeredOrders([record]);
 summary.deferredFills = Math.max(0, finiteNumber(summary.deferredFills, 0)) + 1;
 return true;
}
async function executeFuturesOfflineReplayEvent(event, executionTime, summary) {
 if (!event) return false;
 if (event.kind === "entry") {
   const order = normalizeFuturesLimitOrders(state.futures.limitOrders).find((item) => item.id === event.id);
   if (!order) return false;
   const filled = await openFuturesPosition(order.direction, {
     marketCode: order.market,
     price: order.price,
     margin: order.margin,
     leverage: order.leverage,
     inputMode: order.inputMode,
     quantity: order.quantity,
     limitOrderId: order.id,
     executionTime,
     offlineReplay: true,
     skipExchangeRateRefresh: true
   });
   if (filled === FUTURES_ENTRY_RULE_CANCELLED) return true;
   if (!filled) return deferFuturesOfflineReplayEvent(event, executionTime, summary);
   summary.entryFills += 1;
   return true;
 }
 const order = normalizeFuturesExitOrders(state.futures.exitOrders).find((item) => item.id === event.id);
 if (!order) return false;
 const closed = await closeFuturesPosition(order.positionId, order.closeAmountUnits, {
   price: order.price,
   exitOrderId: order.id,
   inputMode: order.inputMode,
   quantity: order.closeQuantity,
   executionTime,
   offlineReplay: true,
   skipExchangeRateRefresh: true
 });
 if (!closed) return deferFuturesOfflineReplayEvent(event, executionTime, summary);
 summary.exitFills += 1;
 return true;
}
async function replayPendingFuturesOrdersAcrossCandles(candles, marketCode = currentFuturesMarket().code) {
 const summary = { entryFills: 0, exitFills: 0, deferredFills: 0, processedCandles: 0 };
 const attemptedOrderIds = new Set();
 for (const rawCandle of Array.isArray(candles) ? candles : []) {
   if (currentFuturesMarket().code !== marketCode) throw new Error("Futures market changed during offline order replay");
   const candle = normalizeCandle(rawCandle);
   if (!isValidChartCandle(candle)) continue;
   const candleStartMs = candle.time * 1000;
   const path = candle.close >= candle.open
     ? [candle.open, candle.low, candle.high, candle.close]
     : [candle.open, candle.high, candle.low, candle.close];
   const openEvents = futuresOfflineReplayEvents(candleStartMs, attemptedOrderIds, candleStartMs, marketCode)
     .filter((event) => event.triggerSide === "ABOVE" ? path[0] >= event.price : path[0] <= event.price);
   const sortedOpenEvents = sortFuturesOfflineReplayEvents(openEvents, "OPEN");
   for (let eventIndex = 0; eventIndex < sortedOpenEvents.length; eventIndex += 1) {
     const event = sortedOpenEvents[eventIndex];
     attemptedOrderIds.add(event.id);
     await executeFuturesOfflineReplayEvent(event, futuresOfflineReplayExecutionTime(candle, 0, eventIndex), summary);
   }
   for (let phaseIndex = 1; phaseIndex < path.length; phaseIndex += 1) {
     const fromPrice = path[phaseIndex - 1];
     const toPrice = path[phaseIndex];
     const phaseStartMs = phaseIndex === 1
       ? candleStartMs
       : futuresOfflineReplayExecutionTimeMs(candle, phaseIndex - 1);
     const phaseEndMs = futuresOfflineReplayExecutionTimeMs(candle, phaseIndex);
     const direction = toPrice >= fromPrice ? "UP" : "DOWN";
     const crossed = futuresOfflineReplayEvents(candleStartMs, attemptedOrderIds, phaseEndMs, marketCode)
       .filter((event) => event.resumeAtMs <= candleStartMs)
       .filter((event) => futuresOfflineReplayEventCrossedInPhase(event, fromPrice, toPrice, phaseStartMs));
     const sortedCrossed = sortFuturesOfflineReplayEvents(crossed, direction);
     for (let eventIndex = 0; eventIndex < sortedCrossed.length; eventIndex += 1) {
       const event = sortedCrossed[eventIndex];
       attemptedOrderIds.add(event.id);
       await executeFuturesOfflineReplayEvent(event, futuresOfflineReplayExecutionTime(candle, phaseIndex, eventIndex), summary);
     }
   }
   // Orders created inside this minute are not placed onto an invented OHLC
   // timeline. Only the closing price or a new post-creation extreme beyond the
   // persisted baseline is accepted as evidence, including orders made at 55-60s.
   const candleEndMs = candleStartMs + FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS * 1000 - 1;
   const creationMinuteEvents = futuresOfflineReplayEvents(candleStartMs, attemptedOrderIds, candleEndMs, marketCode)
     .filter((event) => event.resumeAtMs > candleStartMs)
     .filter((event) => futuresOfflineReplayCreationMinuteEventReached(event, candle));
   const sortedCreationMinuteEvents = sortFuturesOfflineReplayEvents(creationMinuteEvents, "OPEN");
   for (let eventIndex = 0; eventIndex < sortedCreationMinuteEvents.length; eventIndex += 1) {
     const event = sortedCreationMinuteEvents[eventIndex];
     attemptedOrderIds.add(event.id);
     await executeFuturesOfflineReplayEvent(
       event,
       futuresOfflineReplayCreationMinuteExecutionTime(candle, event, eventIndex),
       summary
     );
   }
   summary.processedCandles += 1;
 }
 return summary;
}
async function reconcilePendingFuturesOrdersFromOneMinuteHistory() {
 const replayMarket = currentFuturesMarket();
 const replayMarketCode = replayMarket.code;
 const pending = pendingFuturesOfflineReplayOrders(replayMarketCode);
 if (!pending.all.length || futuresOfflineReplayRunning) return null;
 const startCandidates = pending.all.map(futuresOfflineReplayStartMs).filter((value) => value > 0);
 if (!startCandidates.length) return null;
 futuresOfflineReplayRunning = true;
 futuresOfflineReplaySummary = null;
 renderTradeButtons();
 renderFuturesOpenPositionsBlock();
 try {
   await refreshFuturesExchangeRate({ silent: true, deferPersistence: true });
   if (currentFuturesMarket().code !== replayMarketCode) throw new Error("Futures market changed before offline order replay");
   const history = await fetchFuturesOfflineReplayCandles(replayMarket, Math.min(...startCandidates));
   if (!history.complete) {
     throw new Error(`1분봉 ${FUTURES_OFFLINE_REPLAY_MAX_PAGES.toLocaleString("ko-KR")}페이지 안에 예약 생성 시각까지 도달하지 못했습니다.`);
   }
   const summary = await replayPendingFuturesOrdersAcrossCandles(history.candles, replayMarketCode);
   const progressCheckpoint = createFuturesPersistenceCheckpoint();
   const progressChanged = advancePendingFuturesOrderHistory(history.checkedThroughMs, replayMarketCode);
   if (progressChanged && !saveFuturesState({ reason: "offline-one-minute-replay" })) {
     restoreFuturesPersistenceCheckpoint(progressCheckpoint);
     throw new Error("종료 중 1분봉 확인 시각을 저장하지 못했습니다.");
   }
   futuresOfflineReplaySummary = { ...summary, pages: history.pages };
   if (summary.entryFills || summary.exitFills) {
     showToast(`종료 중 1분봉 계산 완료 · 예약 진입 ${summary.entryFills.toLocaleString("ko-KR")}건 · 예약 청산 ${summary.exitFills.toLocaleString("ko-KR")}건`);
   } else {
     showToast(`종료 중 1분봉 ${summary.processedCandles.toLocaleString("ko-KR")}개 확인 · 체결 조건 없음`);
   }
   return futuresOfflineReplaySummary;
 } catch (error) {
   console.error("Offline futures order replay failed", error);
   showToast(`종료 중 예약 주문 계산 실패 · 처리하지 못한 주문은 그대로 유지했습니다. ${error && error.message ? error.message : ""}`.trim());
   return null;
 } finally {
   futuresOfflineReplayRunning = false;
   persistDeferredFuturesTriggeredOrdersAfterReplay();
   renderAll();
   drawChart();
   const ticker = state.futures && state.futures.ticker;
   if (ticker) {
     queuePendingFuturesOrdersForTicker(ticker);
   }
   scheduleFuturesTriggeredOrderDrain(0);
 }
}
function normalizeFuturesOrderTriggerEvidence(value) {
 const market = normalizeFuturesMarketCode(value && value.market);
 if (!FUTURES_MARKETS[market]) return null;
 const close = positiveNumber(finiteNumber(value && (value.close ?? value.price), 0), 0);
 const rawLow = positiveNumber(finiteNumber(value && value.low, close), close);
 const rawHigh = positiveNumber(finiteNumber(value && value.high, close), close);
 const low = Math.min(rawLow, rawHigh, close || rawLow || rawHigh);
 const high = Math.max(rawLow, rawHigh, close || rawLow || rawHigh);
 if (!low || !high) return null;
 return {
   market,
   low,
   high,
   close: close || high,
   timestamp: positiveNumber(finiteNumber(value && value.timestamp, Date.now()), Date.now()),
   source: String(value && value.source || "ticker"),
   isPoint: Boolean(value && value.isPoint),
   candleTime: Math.max(0, Math.floor(finiteNumber(value && value.candleTime, 0))),
   intervalSeconds: Math.max(1, Math.floor(finiteNumber(value && value.intervalSeconds, timeframeSeconds(state.timeframe))))
 };
}
function futuresOrderTriggerSide(order, kind) {
 if (kind === "entry") return order && order.direction === "SHORT" ? "ABOVE" : "BELOW";
 return order && order.triggerSide === "BELOW" ? "BELOW" : "ABOVE";
}
function futuresOrderReachedByEvidence(order, kind, evidence) {
 if (!order || !evidence || order.market !== evidence.market) return false;
 const createdAtMs = timestampMs(order.createdAt);
 if (createdAtMs && createdAtMs > evidence.timestamp) return false;
 const triggerSide = futuresOrderTriggerSide(order, kind);
 const pointReached = triggerSide === "BELOW"
   ? evidence.close <= order.price
   : evidence.close >= order.price;
 if (evidence.isPoint || !evidence.candleTime) {
   return triggerSide === "BELOW" ? evidence.low <= order.price : evidence.high >= order.price;
 }
 const candleStartMs = evidence.candleTime * 1000;
 const candleEndMs = candleStartMs + evidence.intervalSeconds * 1000;
 if (createdAtMs >= candleEndMs) return false;
 if (!createdAtMs || createdAtMs <= candleStartMs) {
   return triggerSide === "BELOW" ? evidence.low <= order.price : evidence.high >= order.price;
 }
 const baseline = normalizeFuturesOrderTriggerBaseline(order);
 if (baseline.triggerBaselineCandleTime !== evidence.candleTime) return pointReached;
 if (triggerSide === "BELOW") {
   const extendedAfterCreation = baseline.triggerBaselineReady
     && baseline.triggerBaselineLow > 0
     && evidence.low < baseline.triggerBaselineLow
     && evidence.low <= order.price;
   return pointReached || extendedAfterCreation;
 }
 const extendedAfterCreation = baseline.triggerBaselineReady
   && baseline.triggerBaselineHigh > 0
   && evidence.high > baseline.triggerBaselineHigh
   && evidence.high >= order.price;
 return pointReached || extendedAfterCreation;
}
function updatePendingFuturesOrderTriggerBaselines(evidence) {
 if (!evidence || !evidence.candleTime) return { changed: false, becameReady: false };
 let changed = false;
 let becameReady = false;
 const updateOrder = (kind) => (order) => {
   const triggerKey = `${kind}:${order.id}`;
   // Do not persist an extreme that already triggered this order before the
   // fill itself is durably saved. Otherwise a crash could erase the trigger.
   if (pendingFuturesTriggeredOrders.has(triggerKey) || heldFuturesTriggerFailures.has(triggerKey)) return order;
   if (order.market !== evidence.market) return order;
   const baseline = normalizeFuturesOrderTriggerBaseline(order);
   const createdAfterEvidence = timestampMs(order.createdAt) > evidence.timestamp;
   if (createdAfterEvidence && baseline.triggerBaselineCandleTime !== evidence.candleTime) return order;
   if (baseline.triggerBaselineCandleTime > evidence.candleTime) return order;
   const nextHigh = baseline.triggerBaselineCandleTime === evidence.candleTime && baseline.triggerBaselineHigh > 0
     ? Math.max(baseline.triggerBaselineHigh, evidence.high)
     : evidence.high;
   const nextLow = baseline.triggerBaselineCandleTime === evidence.candleTime && baseline.triggerBaselineLow > 0
     ? Math.min(baseline.triggerBaselineLow, evidence.low)
     : evidence.low;
   const nextReady = baseline.triggerBaselineReady || !evidence.isPoint;
   if (
     baseline.triggerBaselineCandleTime === evidence.candleTime
     && baseline.triggerBaselineHigh === nextHigh
     && baseline.triggerBaselineLow === nextLow
     && baseline.triggerBaselineReady === nextReady
   ) return order;
   changed = true;
   if (!baseline.triggerBaselineReady && nextReady) becameReady = true;
   return {
     ...order,
     triggerBaselineCandleTime: evidence.candleTime,
     triggerBaselineHigh: nextHigh,
     triggerBaselineLow: nextLow,
     triggerBaselineReady: nextReady
   };
 };
 state.futures.limitOrders = normalizeFuturesLimitOrders(state.futures.limitOrders).map(updateOrder("entry"));
 state.futures.exitOrders = normalizeFuturesExitOrders(state.futures.exitOrders).map(updateOrder("exit"));
 return { changed, becameReady };
}
function persistNewFuturesTriggeredOrders(records) {
 const items = Array.isArray(records) ? records : [];
 if (!items.length) return true;
 const entryById = new Map(items.filter((item) => item.kind === "entry").map((item) => [item.id, item]));
 const exitById = new Map(items.filter((item) => item.kind === "exit").map((item) => [item.id, item]));
 state.futures.limitOrders = normalizeFuturesLimitOrders(state.futures.limitOrders).map((order) => {
   const record = entryById.get(order.id);
   if (!record || order.triggeredAt) return order;
   return { ...order, triggeredAt: record.executionTime, triggerEvidenceSource: record.source };
 });
 state.futures.exitOrders = normalizeFuturesExitOrders(state.futures.exitOrders).map((order) => {
   const record = exitById.get(order.id);
   if (!record || order.triggeredAt) return order;
   return { ...order, triggeredAt: record.executionTime, triggerEvidenceSource: record.source };
 });
 const saved = saveFuturesState({ reason: "pending-order-trigger-latch" });
 if (!saved) scheduleFuturesOrderBaselinePersistence(true);
 return saved;
}
function persistDeferredFuturesTriggeredOrdersAfterReplay() {
 const deferred = [...pendingFuturesTriggeredOrders.values()].filter((record) => {
   const order = futuresTriggeredOrderRecordOrder(record);
   return order && !order.triggeredAt;
 });
 if (!deferred.length) return true;
 return persistNewFuturesTriggeredOrders(deferred);
}
function restorePersistedFuturesTriggeredOrders(options = {}) {
 const marketCode = currentFuturesMarket().code;
 const records = [];
 currentFuturesExitOrders().forEach((order) => {
   if (!order.triggeredAt) return;
   records.push({ kind: "exit", order });
 });
 currentFuturesLimitOrders().forEach((order) => {
   if (!order.triggeredAt) return;
   records.push({ kind: "entry", order });
 });
 let restored = 0;
 records.forEach(({ kind, order }) => {
   if (order.market !== marketCode) return;
   const key = `${kind}:${order.id}`;
   if (pendingFuturesTriggeredOrders.has(key)) return;
   const heldFailure = heldFuturesTriggerFailures.get(key);
   if (heldFailure && !options.resumeHeld) return;
   if (options.resumeHeld) heldFuturesTriggerFailures.delete(key);
   const triggerTimestamp = timestampMs(order.triggeredAt) || Date.now();
   pendingFuturesTriggeredOrders.set(key, {
     key,
     id: order.id,
     kind,
     market: order.market,
     price: order.price,
     triggerSide: futuresOrderTriggerSide(order, kind),
     createdAt: order.createdAt,
     executionTime: new Date(triggerTimestamp).toISOString(),
     timestamp: triggerTimestamp,
     source: order.triggerEvidenceSource || "persisted-trigger",
     attempts: 0,
     recoveryCycles: Math.max(0, finiteNumber(heldFailure && heldFailure.recoveryCycles, 0))
   });
   restored += 1;
 });
 if (restored) scheduleFuturesTriggeredOrderDrain(0);
 return restored;
}
function scheduleFuturesOrderBaselinePersistence(immediate = false) {
 clearTimeout(futuresOrderBaselineSaveTimer);
 futuresOrderBaselineSaveTimer = setTimeout(() => {
   futuresOrderBaselineSaveTimer = null;
   if (state.futures.orderBusy || futuresOfflineReplayRunning) {
     scheduleFuturesOrderBaselinePersistence(false);
     return;
   }
   if (!saveFuturesState({ reason: "pending-order-trigger-baseline" })) {
     futuresOrderBaselineSaveRetryCount += 1;
     if (futuresOrderBaselineSaveRetryCount <= 3) {
       futuresOrderBaselineSaveTimer = setTimeout(() => {
         futuresOrderBaselineSaveTimer = null;
         scheduleFuturesOrderBaselinePersistence(false);
       }, 2000 * futuresOrderBaselineSaveRetryCount);
     }
   } else {
     futuresOrderBaselineSaveRetryCount = 0;
   }
 }, immediate ? 0 : 350);
}
function queuePendingFuturesOrdersForEvidence(value, kinds = ["exit", "entry"], options = {}) {
 const evidence = normalizeFuturesOrderTriggerEvidence(value);
 if (!evidence || evidence.market !== currentFuturesMarket().code) return 0;
 const allowedKinds = new Set(kinds);
 const candidates = [];
 if (allowedKinds.has("exit")) {
   currentFuturesExitOrders().forEach((order) => candidates.push({ kind: "exit", order }));
 }
 if (allowedKinds.has("entry")) {
   currentFuturesLimitOrders().forEach((order) => candidates.push({ kind: "entry", order }));
 }
 let queued = 0;
 const newTriggerRecords = [];
 candidates.forEach(({ kind, order }) => {
   const key = `${kind}:${order.id}`;
   const triggerSide = futuresOrderTriggerSide(order, kind);
   const pointReached = triggerSide === "BELOW"
     ? evidence.close <= order.price
     : evidence.close >= order.price;
   const heldFailure = heldFuturesTriggerFailures.get(key);
   if (heldFailure) {
     if (!pointReached) {
       heldFuturesTriggerFailures.set(key, { ...heldFailure, armed: true });
       return;
     }
     if (!heldFailure.armed) return;
     heldFuturesTriggerFailures.delete(key);
   }
   if (!futuresOrderReachedByEvidence(order, kind, evidence)) return;
   if (pendingFuturesTriggeredOrders.has(key)) return;
   pendingFuturesTriggeredOrders.set(key, {
     key,
     id: order.id,
     kind,
     market: order.market,
     price: order.price,
     triggerSide,
     createdAt: order.createdAt,
     executionTime: order.triggeredAt || new Date(evidence.timestamp).toISOString(),
     timestamp: timestampMs(order.triggeredAt) || evidence.timestamp,
     source: order.triggerEvidenceSource || evidence.source,
     attempts: 0
   });
   if (!order.triggeredAt) newTriggerRecords.push(pendingFuturesTriggeredOrders.get(key));
   queued += 1;
 });
 // While the restart history replay is running, keep live ticker/kline triggers
 // in memory without latching them onto the order yet. The completed one-minute
 // candles must get the first chance to establish the real historical fill
 // time. The replay finally block persists any still-unfilled live trigger.
 if (newTriggerRecords.length && !futuresOfflineReplayRunning) {
   persistNewFuturesTriggeredOrders(newTriggerRecords);
 }
 const baselineUpdate = updatePendingFuturesOrderTriggerBaselines(evidence);
 if (baselineUpdate.changed) {
   futuresOrderBaselineSaveRetryCount = 0;
   scheduleFuturesOrderBaselinePersistence(baselineUpdate.becameReady);
 }
 if (queued && options.scheduleDrain !== false) {
   scheduleFuturesTriggeredOrderDrain(0);
 }
 return queued;
}
function queuePendingFuturesOrdersForTicker(ticker, kinds) {
 if (!ticker) return 0;
 const price = positiveNumber(finiteNumber(ticker.price, 0), 0);
 if (!price) return 0;
 return queuePendingFuturesOrdersForEvidence({
   market: ticker.market,
   low: price,
   high: price,
   close: price,
   timestamp: ticker.timestamp,
   source: ticker.isRealtimeTrade ? "public-trade" : "ticker",
   isPoint: true,
   candleTime: Math.floor(finiteNumber(ticker.timestamp, Date.now()) / 1000 / FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS)
     * FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS,
   intervalSeconds: FUTURES_OFFLINE_REPLAY_CANDLE_SECONDS
 }, kinds);
}
function queuePendingFuturesOrdersForCandle(candle, marketCode, options = {}) {
 if (!candle) return 0;
 return queuePendingFuturesOrdersForEvidence({
   market: marketCode,
   low: candle.low,
   high: candle.high,
   close: candle.close,
   timestamp: options.timestamp,
   source: options.source || "kline",
   candleTime: candle.time,
   intervalSeconds: options.intervalSeconds || timeframeSeconds(state.timeframe)
 });
}
function futuresTriggeredOrderRecordOrder(record) {
 if (!record) return null;
 return record.kind === "entry"
   ? normalizeFuturesLimitOrders(state.futures.limitOrders).find((order) => order.id === record.id) || null
   : currentFuturesExitOrders().find((order) => order.id === record.id) || null;
}
function sortPendingFuturesTriggeredOrders(records) {
 return [...records].sort((a, b) => {
   if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
   if (a.triggerSide === b.triggerSide && a.price !== b.price) {
     return a.triggerSide === "BELOW" ? b.price - a.price : a.price - b.price;
   }
   if (a.kind !== b.kind) return a.kind === "exit" ? -1 : 1;
   const createdDiff = timestampMs(a.createdAt) - timestampMs(b.createdAt);
   return createdDiff || String(a.id).localeCompare(String(b.id));
 });
}
function scheduleFuturesTriggeredOrderDrain(delayMs = 0) {
 const safeDelay = Math.max(0, finiteNumber(delayMs, 0));
 clearTimeout(futuresTriggeredOrderDrainTimer);
 futuresTriggeredOrderDrainTimer = setTimeout(() => {
   futuresTriggeredOrderDrainTimer = null;
   drainPendingFuturesTriggeredOrders();
 }, safeDelay);
}
async function drainPendingFuturesTriggeredOrders() {
 if (futuresTriggeredOrderDrainRunning || !pendingFuturesTriggeredOrders.size) return;
 if (!isFuturesMode() || futuresOfflineReplayRunning || state.futures.orderBusy) {
   scheduleFuturesTriggeredOrderDrain(100);
   return;
 }
 futuresTriggeredOrderDrainRunning = true;
 try {
   while (pendingFuturesTriggeredOrders.size) {
     if (!isFuturesMode() || futuresOfflineReplayRunning || state.futures.orderBusy) break;
     for (const [key, record] of pendingFuturesTriggeredOrders) {
       if (!futuresTriggeredOrderRecordOrder(record)) pendingFuturesTriggeredOrders.delete(key);
     }
     if (!pendingFuturesTriggeredOrders.size) break;
     const now = Date.now();
     const orderedRecords = sortPendingFuturesTriggeredOrders(pendingFuturesTriggeredOrders.values());
     const record = orderedRecords.find((item) => {
       const retryAt = item.kind === "entry"
         ? finiteNumber(futuresLimitOrderRetryAt.get(item.id), 0)
         : finiteNumber(futuresExitOrderRetryAt.get(item.id), 0);
       return now >= retryAt;
     });
     if (!record) break;
     const order = futuresTriggeredOrderRecordOrder(record);
     if (!order) {
       pendingFuturesTriggeredOrders.delete(record.key);
       continue;
     }
     const triggeringIds = record.kind === "entry" ? triggeringFuturesLimitOrderIds : triggeringFuturesExitOrderIds;
     const retryAtMap = record.kind === "entry" ? futuresLimitOrderRetryAt : futuresExitOrderRetryAt;
     triggeringIds.add(order.id);
     let completed = false;
     try {
       completed = record.kind === "entry"
         ? await openFuturesPosition(order.direction, {
           marketCode: order.market,
           price: order.price,
           margin: order.margin,
           leverage: order.leverage,
           inputMode: order.inputMode,
           quantity: order.quantity,
           limitOrderId: order.id,
           executionTime: record.executionTime
         })
         : await closeFuturesPosition(order.positionId, order.closeAmountUnits, {
           price: order.price,
           exitOrderId: order.id,
           inputMode: order.inputMode,
           quantity: order.closeQuantity,
           executionTime: record.executionTime
         });
     } catch (error) {
       console.error("Pending futures order trigger failed", error);
     } finally {
       triggeringIds.delete(order.id);
     }
     if (completed || !futuresTriggeredOrderRecordOrder(record)) {
       pendingFuturesTriggeredOrders.delete(record.key);
       retryAtMap.delete(order.id);
       heldFuturesTriggerFailures.delete(record.key);
     } else {
       record.attempts = Math.max(0, finiteNumber(record.attempts, 0)) + 1;
       if (record.attempts >= 3) {
         pendingFuturesTriggeredOrders.delete(record.key);
         retryAtMap.delete(order.id);
         const recoveryCycles = Math.max(0, finiteNumber(record.recoveryCycles, 0)) + 1;
         heldFuturesTriggerFailures.set(record.key, { armed: false, failedAt: Date.now(), recoveryCycles });
         if (recoveryCycles <= 3) {
           setTimeout(() => {
             if (!heldFuturesTriggerFailures.has(record.key)) return;
             restorePersistedFuturesTriggeredOrders({ resumeHeld: true });
           }, 60000 * (2 ** (recoveryCycles - 1)));
         }
       } else {
         retryAtMap.set(order.id, Date.now() + 5000 * (2 ** (record.attempts - 1)));
       }
     }
   }
 } finally {
   futuresTriggeredOrderDrainRunning = false;
   if (pendingFuturesTriggeredOrders.size) {
     const now = Date.now();
     const nextRetryAt = Math.min(...[...pendingFuturesTriggeredOrders.values()].map((record) => (
       record.kind === "entry"
         ? finiteNumber(futuresLimitOrderRetryAt.get(record.id), now)
         : finiteNumber(futuresExitOrderRetryAt.get(record.id), now)
     )));
     scheduleFuturesTriggeredOrderDrain(Math.max(100, nextRetryAt - now));
   }
 }
}
function schedulePendingFuturesOrderHistoryRecovery(delayMs = 0, resetRetries = true) {
 if (resetRetries) futuresPendingOrderRecoveryRetryCount = 0;
 clearTimeout(futuresPendingOrderRecoveryTimer);
 futuresPendingOrderRecoveryTimer = setTimeout(async () => {
   futuresPendingOrderRecoveryTimer = null;
   if (!isFuturesMode() || !pendingFuturesOfflineReplayOrders().all.length) return;
   const result = await reconcilePendingFuturesOrdersFromOneMinuteHistory();
   scheduleFuturesTriggeredOrderDrain(0);
   if (result === null && pendingFuturesOfflineReplayOrders().all.length) {
     if (futuresOfflineReplayRunning) {
       schedulePendingFuturesOrderHistoryRecovery(1000, false);
     } else if (futuresPendingOrderRecoveryRetryCount < 3) {
       futuresPendingOrderRecoveryRetryCount += 1;
       schedulePendingFuturesOrderHistoryRecovery(15000 * (2 ** (futuresPendingOrderRecoveryRetryCount - 1)), false);
     }
   } else if (result !== null) {
     futuresPendingOrderRecoveryRetryCount = 0;
   }
 }, Math.max(0, finiteNumber(delayMs, 0)));
}
function maybeSchedulePeriodicPendingFuturesOrderRecovery() {
 if (!isFuturesMode() || !pendingFuturesOfflineReplayOrders().all.length) return false;
 const now = Date.now();
 if (now - futuresLastPeriodicOrderRecoveryAt < 55000) return false;
 futuresLastPeriodicOrderRecoveryAt = now;
 schedulePendingFuturesOrderHistoryRecovery(0);
 return true;
}
function futuresLimitOrderReached(order, tickerPrice) {
 if (!order || !Number.isFinite(tickerPrice) || tickerPrice <= 0) return false;
 return order.direction === "SHORT" ? tickerPrice >= order.price : tickerPrice <= order.price;
}
async function checkPendingFuturesLimitOrders(ticker) {
 return queuePendingFuturesOrdersForTicker(ticker, ["entry"]);
}
async function toggleFuturesExitOrderMode(positionId, closeInput = {}) {
 if (!isFuturesMode() || !ensureFuturesStorageCurrent()) return false;
 if (futuresOfflineReplayRunning) return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 if (state.futures.orderBusy) return false;
 const id = String(positionId || "");
 const position = getFuturesPositions().find((item) => String(item.id) === id);
 if (!position) {
   showToast("예약 청산할 보유 포지션을 찾지 못했습니다.");
   return false;
 }
 if (!currentFuturesPriceForPosition(position)) {
   showToast("현재가가 들어온 뒤 예약 청산가를 설정할 수 있습니다.");
   return false;
 }
  if (state.chart.exitOrderPositionId === id) {
    state.chart.exitOrderPositionId = "";
    state.chart.exitOrderAmountUnits = 0;
    state.chart.exitOrderQuantity = 0;
    state.chart.exitOrderInputMode = "MARGIN";
  } else {
    if (!await ensureFuturesOrderTriggerBaseline()) return false;
    const source = closeInput && typeof closeInput === "object" ? closeInput : { amountUnits: closeInput };
    const inputMode = String(source.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN";
    const amountText = String(source.amountUnits ?? "").trim();
    const parsedAmountUnits = Number(amountText);
    const quantityText = String(source.quantity ?? "").trim();
    const parsedQuantity = normalizeFuturesBtcQuantity(quantityText);
    const maxAmountUnits = futuresAvailableExitOrderAmountUnits(position);
    const maxQuantity = futuresAvailableExitOrderQuantity(position);
    const symbol = futuresPositionSymbol(position);
    let closeAmountUnits;
    let closeQuantity;
    if (inputMode === "BTC") {
      if (quantityText === "" || parsedQuantity <= 0) {
        showToast(`예약 청산할 ${symbol} 수량을 입력하세요.`);
        return false;
      }
      if (parsedQuantity > maxQuantity + FUTURES_BTC_EPSILON) {
        showToast(`추가 예약 청산 수량은 최대 ${formatFuturesQuantity(maxQuantity, symbol)}입니다.`);
        return false;
      }
      closeQuantity = parsedQuantity;
      closeAmountUnits = futuresPositionAmountUnitsFromQuantity(position, closeQuantity);
    } else {
      if (amountText === "" || !Number.isFinite(parsedAmountUnits) || parsedAmountUnits <= 0) {
        showToast("예약 청산할 금액을 USDT 단위로 입력하세요.");
        return false;
      }
      if (parsedAmountUnits > maxAmountUnits + Math.max(1e-8, maxAmountUnits * 1e-8)) {
        showToast(`추가 예약 청산 금액은 최대 ${formatNumber(maxAmountUnits, 2)} USDT입니다.`);
        return false;
      }
      closeAmountUnits = parsedAmountUnits;
      closeQuantity = futuresQuantityFromPositionAmountUnits(position, closeAmountUnits);
    }
    state.chart.exitOrderPositionId = id;
     state.chart.exitOrderAmountUnits = closeAmountUnits;
     state.chart.exitOrderQuantity = closeQuantity;
     state.chart.exitOrderInputMode = inputMode;
     state.chart.positionFilterId = id;
    state.chart.limitOrderMode = null;
   state.chart.percentMeasureMode = false;
   state.chart.percentMeasureStart = null;
   state.chart.trendMode = false;
   state.chart.horizontalMode = false;
   state.chart.fibonacciMode = false;
   state.chart.draggingFibonacci = null;
   state.chart.riskMode = false;
   state.chart.pendingPoint = null;
   state.chart.selectedTrendlineId = null;
   state.chart.selectedRiskBlockId = null;
   state.chart.draggingRiskBlock = null;
   state.chart.suppressNextClick = false;
  }
  updateTrendControls();
  renderChartPositionFilter();
  renderFuturesPositionPanel();
  renderFuturesOpenPositionsBlock();
 renderRiskControls();
 drawChart();
 return true;
}
async function placeFuturesExitOrderFromChart(positionId, chartPrice) {
 if (!isFuturesMode() || !ensureFuturesStorageCurrent()) return false;
 if (futuresOfflineReplayRunning) return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 if (state.futures.orderBusy) return false;
 const id = String(positionId || "");
 const position = getFuturesPositions().find((item) => String(item.id) === id);
 if (!position) {
    state.chart.exitOrderPositionId = "";
    state.chart.exitOrderAmountUnits = 0;
    state.chart.exitOrderQuantity = 0;
   showToast("예약 청산할 보유 포지션을 찾지 못했습니다.");
   renderAll();
   drawChart();
   return false;
 }
 const marketCode = futuresPositionMarketCode(position);
 const currentPrice = currentFuturesPriceForPosition(position);
 const price = normalizedFuturesLimitPrice(chartPrice, marketCode);
 const currentNormalizedPrice = normalizedFuturesLimitPrice(currentPrice, marketCode);
  const closeAmountUnits = positiveNumber(finiteNumber(state.chart.exitOrderAmountUnits, 0), 0);
  const closeQuantity = normalizeFuturesBtcQuantity(state.chart.exitOrderQuantity);
  const inputMode = state.chart.exitOrderInputMode === "BTC" ? "BTC" : "MARGIN";
  const maxAmountUnits = futuresAvailableExitOrderAmountUnits(position);
  const maxQuantity = futuresAvailableExitOrderQuantity(position);
 if (!currentPrice || !price) return false;
 if (!closeAmountUnits) {
    state.chart.exitOrderPositionId = "";
    state.chart.exitOrderAmountUnits = 0;
    state.chart.exitOrderQuantity = 0;
   showToast("예약 청산 금액이 없어 주문을 등록하지 못했습니다. 다시 입력하세요.");
   renderAll();
   drawChart();
   return false;
 }
  if (closeAmountUnits > maxAmountUnits + Math.max(1e-8, maxAmountUnits * 1e-8)) {
    state.chart.exitOrderPositionId = "";
    state.chart.exitOrderAmountUnits = 0;
    state.chart.exitOrderQuantity = 0;
   showToast(`포지션 금액이 변경되었습니다. 추가 예약은 최대 ${formatNumber(maxAmountUnits, 2)} USDT입니다.`);
   renderAll();
   drawChart();
    return false;
  }
  if (inputMode === "BTC" && closeQuantity > maxQuantity + FUTURES_BTC_EPSILON) {
    state.chart.exitOrderPositionId = "";
    state.chart.exitOrderAmountUnits = 0;
    state.chart.exitOrderQuantity = 0;
    showToast(`포지션 수량이 변경되었습니다. 추가 예약은 최대 ${formatFuturesQuantity(maxQuantity, futuresPositionSymbol(position))}입니다.`);
    renderAll();
    drawChart();
    return false;
  }
 if (price === currentNormalizedPrice) {
   showToast("현재가와 다른 가격을 선택하세요.");
   return false;
 }
 const existingOrders = normalizeFuturesExitOrders(state.futures.exitOrders);
 const now = new Date().toISOString();
 const triggerBaseline = await ensureFuturesOrderTriggerBaseline(now);
 if (!triggerBaseline) return false;
 const order = normalizeFuturesExitOrder({
   id: `feo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   positionId: id,
   market: marketCode,
   symbol: futuresPositionSymbol(position),
   direction: position.direction,
   price,
   triggerSide: price > currentPrice ? "ABOVE" : "BELOW",
    referencePrice: currentPrice,
    closeAmountUnits,
    closeQuantity: inputMode === "BTC" ? closeQuantity : null,
    inputMode,
   createdAt: now,
   updatedAt: now,
   ...triggerBaseline
 });
 if (!order) return false;
 const checkpoint = createFuturesPersistenceCheckpoint();
 state.futures.exitOrders = [
   ...existingOrders,
   order
 ];
 if (!saveFuturesState({ reason: "exit-order-create" })) {
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   showToast("저장 실패로 예약 청산 설정을 중단했습니다. 기존 데이터는 유지됩니다.");
   return false;
 }
  state.chart.exitOrderPositionId = "";
  state.chart.exitOrderAmountUnits = 0;
  state.chart.exitOrderQuantity = 0;
  state.chart.exitOrderInputMode = "MARGIN";
  renderAll();
  drawChart();
  const fileBackupResult = await verifyFuturesTradeFileBackup("exit-order-create");
  showToast(`예약 청산 ${inputMode === "BTC" ? formatFuturesQuantity(closeQuantity, futuresPositionSymbol(position)) : `${trimNumber(closeAmountUnits, 2)} USDT`}을 ${formatFuturesDisplayPrice(price, marketCode)}에 등록했습니다.${futuresTradeFileBackupStatusText(fileBackupResult)}`);
 return true;
}
function cancelFuturesExitOrder(orderId) {
 if (!orderId || !ensureFuturesStorageCurrent()) return false;
 if (futuresOfflineReplayRunning) return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 if (state.futures.orderBusy) return false;
 const orders = normalizeFuturesExitOrders(state.futures.exitOrders);
 const target = orders.find((order) => order.id === orderId);
 if (!target) {
   showToast("취소할 예약 청산을 찾지 못했습니다.");
   return false;
 }
 const checkpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresExitOrderSettledIds);
 settleFuturesExitOrder(orderId);
 state.futures.exitOrders = orders.filter((order) => order.id !== orderId);
 if (!saveFuturesState({ reason: "exit-order-cancel" })) {
   futuresExitOrderSettledIds = settledIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   showToast("저장 실패로 예약 청산 취소를 중단했습니다.");
   return false;
 }
 triggeringFuturesExitOrderIds.delete(orderId);
 futuresExitOrderRetryAt.delete(orderId);
 pendingFuturesTriggeredOrders.delete(`exit:${orderId}`);
 heldFuturesTriggerFailures.delete(`exit:${orderId}`);
 if (state.chart.exitOrderPositionId === target.positionId) {
   state.chart.exitOrderPositionId = "";
   state.chart.exitOrderAmountUnits = 0;
   state.chart.exitOrderQuantity = 0;
   state.chart.exitOrderInputMode = "MARGIN";
 }
 renderAll();
 drawChart();
 showToast("예약 청산을 취소했습니다.");
 return true;
}
function futuresExitOrderReached(order, tickerPrice) {
 if (!order || !Number.isFinite(tickerPrice) || tickerPrice <= 0) return false;
 return order.triggerSide === "BELOW" ? tickerPrice <= order.price : tickerPrice >= order.price;
}
async function checkPendingFuturesExitOrders(ticker) {
 return queuePendingFuturesOrdersForTicker(ticker, ["exit"]);
}
function currentFuturesPriceOrToast() {
 const price = currentFuturesPrice();
 if (!price) {
   showToast("선물 현재가가 들어온 뒤 주문할 수 있습니다.");
   return 0;
 }
 return price;
}
function futuresBasisAdjustment(position) {
 return finiteNumber(position && position.basisAdjustmentUsdt, 0);
}
function futuresEffectiveEntryPrice(position) {
 if (!position) return 0;
 const entryPrice = positiveNumber(finiteNumber(position.entryPrice, 0), 0);
 const notional = positiveNumber(finiteNumber(position.notional, 0), 0);
 if (!entryPrice || !notional) return entryPrice;
 const directionSign = position.direction === "SHORT" ? -1 : 1;
 return Math.max(0, entryPrice * (1 - directionSign * futuresBasisAdjustment(position) / notional));
}
// 실제 선물 청산가는 유지증거금, 수수료, 위험한도에 따라 달라지므로 단순 모델임.
function calculateSimpleFuturesLiquidationPrice(position) {
 if (!position) return 0;
 const entryPrice = positiveNumber(finiteNumber(position.entryPrice, 0), 0);
 const leverage = positiveNumber(finiteNumber(position.leverage, 0), 0);
 if (!entryPrice || !leverage) return 0;
 return position.direction === "SHORT"
   ? entryPrice * (1 + 1 / leverage)
   : entryPrice * (1 - 1 / leverage);
}
function calculateFuturesBreakEvenPrice(position) {
 if (!position) return 0;
 const entryPrice = positiveNumber(finiteNumber(position.entryPrice, 0), 0);
 if (!entryPrice) return 0;
 const notional = positiveNumber(
   finiteNumber(position.notional, finiteNumber(position.margin, 0) * finiteNumber(position.leverage, 1)),
   entryPrice
 );
 const quantity = positiveNumber(finiteNumber(position.quantity, notional / entryPrice), notional / entryPrice);
 if (!quantity) return entryPrice;
 const entryFee = Math.max(0, finiteNumber(position.entryFee, notional * FUTURES_FEE_RATE));
 const basisAdjustmentUsdt = futuresBasisAdjustment(position);
 const grossPnlQuantity = notional / entryPrice;
 if (position.direction === "SHORT") {
   return Math.max(0, (notional + basisAdjustmentUsdt - entryFee) / (grossPnlQuantity + quantity * FUTURES_FEE_RATE));
 }
 return Math.max(0, (notional + entryFee - basisAdjustmentUsdt) / (grossPnlQuantity - quantity * FUTURES_FEE_RATE));
}
function calculateFuturesPosition(position, currentPrice) {
 if (!position || !currentPrice) {
   return {
     pnl: 0,
     grossPnl: 0,
     netPnl: 0,
     roePercent: 0,
     entryFee: 0,
     exitFee: 0,
     fee: 0,
     closeNotional: 0,
     liquidationPrice: calculateSimpleFuturesLiquidationPrice(position)
   };
 }
 const entryPrice = finiteNumber(position.entryPrice, 0);
 const margin = positiveNumber(finiteNumber(position.margin, 0), 1);
 const notional = positiveNumber(finiteNumber(position.notional, margin * finiteNumber(position.leverage, 1)), margin);
 const quantity = positiveNumber(finiteNumber(position.quantity, notional / entryPrice), notional / entryPrice);
 const closeNotional = Math.max(0, quantity * currentPrice);
 const rawGrossPnl = position.direction === "SHORT"
   ? ((entryPrice - currentPrice) / entryPrice) * notional
   : ((currentPrice - entryPrice) / entryPrice) * notional;
 const basisAdjustmentUsdt = futuresBasisAdjustment(position);
 const grossPnl = rawGrossPnl + basisAdjustmentUsdt;
 const entryFee = Math.max(0, finiteNumber(position.entryFee, notional * FUTURES_FEE_RATE));
 const exitFee = closeNotional * FUTURES_FEE_RATE;
 const fee = entryFee + exitFee;
 const netPnl = grossPnl - fee;
 return {
   pnl: netPnl,
   grossPnl,
   rawGrossPnl,
   basisAdjustmentUsdt,
   effectiveEntryPrice: futuresEffectiveEntryPrice(position),
   netPnl,
   roePercent: (netPnl / margin) * 100,
   entryFee,
   exitFee,
   fee,
   closeNotional,
   liquidationPrice: calculateSimpleFuturesLiquidationPrice(position)
 };
}
function calculateFuturesAccountEquity(positions = getFuturesPositions()) {
 const accountBalance = Math.max(0, finiteNumber(state.futures && state.futures.account && state.futures.account.usdtBalance, 0));
 return accountBalance + normalizeFuturesPositions(positions).reduce((sum, position) => {
   const currentPrice = currentFuturesPriceForPosition(position) || position.entryPrice;
   const calc = calculateFuturesPosition(position, currentPrice);
   return sum + position.margin + calc.grossPnl - calc.exitFee;
 }, 0);
}
function futuresMarkerTime() {
 const candles = activeCandles();
 const now = alignToTimeframe(Math.floor(Date.now() / 1000));
 if (!candles.length) return now;
 const first = candles[0].time;
 const last = candles[candles.length - 1].time;
 return clamp(now, first, last);
}
function addFuturesTradeMarker(kind, price, direction, options = {}) {
 const marketCode = normalizeFuturesMarketCode(options.market, options.symbol || currentFuturesSymbol());
 const symbol = normalizeFuturesSymbol(options.symbol || futuresMarketByCode(marketCode).symbol);
 const marker = normalizeFuturesTradeMarker({
   id: `fm-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   market: marketCode,
   symbol,
   kind,
   time: finiteNumber(options.time, futuresMarkerTime()),
   price,
   direction,
   label: options.label || "",
   createdAt: options.createdAt || new Date().toISOString()
 });
 if (!marker) return;
 state.futures.tradeMarkers.push(marker);
 state.futures.tradeMarkers = state.futures.tradeMarkers.slice(-440);
}
function ensureFuturesEntryMarker(record) {
 const entryMarkers = createFuturesEntryMarkers(record);
 if (!entryMarkers.length) return null;
 state.futures.tradeMarkers = mergeFuturesTradeMarkers(state.futures.tradeMarkers, entryMarkers);
 return entryMarkers[0];
}
async function cancelFuturesLimitOrderForEntryRule(order) {
 if (!order) return false;
 const orderId = String(order.id || "");
 if (!orderId) return false;
 const checkpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresLimitOrderSettledIds);
 settleFuturesLimitOrder(orderId);
 state.futures.limitOrders = normalizeFuturesLimitOrders(state.futures.limitOrders)
   .filter((item) => item.id !== orderId);
 if (!saveFuturesState({ reason: "single-position-entry-order-cancel" })) {
   futuresLimitOrderSettledIds = settledIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   return false;
 }
 triggeringFuturesLimitOrderIds.delete(orderId);
 futuresLimitOrderRetryAt.delete(orderId);
 pendingFuturesTriggeredOrders.delete(`entry:${orderId}`);
 heldFuturesTriggerFailures.delete(`entry:${orderId}`);
 renderAll();
 drawChart();
 const fileBackupResult = await verifyFuturesTradeFileBackup("single-position-entry-order-cancel");
 showToast(`격리·종목당 1포지션 규칙으로 반대 방향 예약 주문을 취소했습니다.${futuresTradeFileBackupStatusText(fileBackupResult)}`);
 return true;
}
async function openFuturesPosition(direction, options = {}) {
 if (!isFuturesMode()) return;
 if (futuresOfflineReplayRunning && !options.offlineReplay) {
   return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 }
 if (!ensureFuturesStorageCurrent()) return;
 const existingFuturesPositions = getFuturesPositions();
 const requestedMarketCode = FUTURES_MARKETS[options.marketCode] ? options.marketCode : currentFuturesMarket().code;
 const orderMarketCode = requestedMarketCode;
 const positionDirection = direction === "SHORT" ? "SHORT" : "LONG";
 const limitOrderId = String(options.limitOrderId || "");
 const sourceLimitOrder = limitOrderId
   ? normalizeFuturesLimitOrders(state.futures.limitOrders).find((order) => order.id === limitOrderId)
   : null;
 if (!limitOrderId) {
   state.chart.limitOrderMode = null;
   state.chart.exitOrderPositionId = "";
 }
 if (limitOrderId && !sourceLimitOrder) return false;
 const entryRule = futuresEntryRuleState(positionDirection, orderMarketCode);
 if (entryRule.blocked) {
   if (limitOrderId && sourceLimitOrder) {
     const cancelled = await cancelFuturesLimitOrderForEntryRule(sourceLimitOrder);
     return cancelled ? FUTURES_ENTRY_RULE_CANCELLED : false;
   }
   showToast(entryRule.reason);
   renderTradeButtons();
   return false;
 }
 if (state.futures.orderBusy) return;
 state.futures.orderBusy = true;
 renderTradeButtons();
 try {
 if (!options.skipExchangeRateRefresh) {
   await refreshFuturesExchangeRate({ notifyFailure: true, deferPersistence: true });
 }
 let price = positiveNumber(finiteNumber(options.price, 0), 0);
 let freshTicker = null;
 if (!price) {
   try {
     freshTicker = await fetchFuturesTickerForMarketCode(orderMarketCode);
   } catch (error) {
     console.warn("entry price refresh failed", error);
   }
 }
 if (!isFuturesMode() || currentFuturesMarket().code !== orderMarketCode) {
   return showToast("코인이 변경되어 주문을 취소했습니다. 다시 진입하세요.");
 }
 if (!price && (!freshTicker || freshTicker.market !== orderMarketCode || freshTicker.price <= 0)) {
   const sourceName = currentFuturesMarket().chartSource === "BINANCE" ? "Binance" : "빗썸";
   return showToast(`최신 ${sourceName} 현재가를 확인하지 못해 주문을 취소했습니다.`);
 }
 if (!price) price = freshTicker.price;
 const leverage = FUTURES_LEVERAGES.includes(Number(options.leverage)) ? Number(options.leverage) : state.futures.leverage;
 const hasSavedOrderInput = positiveNumber(finiteNumber(options.margin, 0), 0) > 0;
 const inputMode = String(options.inputMode || (hasSavedOrderInput ? "MARGIN" : futuresEntryInputMode)).toUpperCase() === "BTC" ? "BTC" : "MARGIN";
 let orderInput;
 if (hasSavedOrderInput) {
   const savedMargin = positiveNumber(finiteNumber(options.margin, 0), 0);
   const savedQuantity = normalizeFuturesBtcQuantity(options.quantity);
   orderInput = inputMode === "BTC" && savedQuantity > 0
     ? { inputMode, quantity: savedQuantity, notional: savedQuantity * price, margin: (savedQuantity * price) / leverage }
     : { inputMode: "MARGIN", margin: savedMargin, notional: savedMargin * leverage, quantity: normalizeFuturesBtcQuantity((savedMargin * leverage) / price) };
 } else {
   orderInput = readFuturesEntryOrderInput(price, leverage);
 }
 const margin = positiveNumber(orderInput.margin, 0);
 if (margin <= 0) return showToast(inputMode === "BTC" ? `매수할 ${currentFuturesSymbol()} 수량을 입력하세요.` : "사용 증거금을 입력하세요.");
 const notional = positiveNumber(orderInput.notional, margin * leverage);
 const quantity = normalizeFuturesBtcQuantity(orderInput.quantity || (notional / price));
 if (!Number.isFinite(quantity) || quantity <= 0) return showToast("선물 수량을 계산할 수 없습니다.");
 const entryFee = notional * FUTURES_FEE_RATE;
 const spendableBalance = limitOrderId ? state.futures.account.usdtBalance : futuresAvailableUsdtBalance();
 if (margin + entryFee > spendableBalance) {
   return showToast(isFuturesKrwDisplay() ? "증거금과 진입 수수료를 합친 금액이 보유 현금보다 큽니다." : "증거금과 진입 수수료를 합친 금액이 선물 USDT 잔고보다 큽니다.");
 }
 const finalEntryRule = futuresEntryRuleState(positionDirection, orderMarketCode);
 if (finalEntryRule.blocked) {
   if (limitOrderId && sourceLimitOrder) {
     const cancelled = await cancelFuturesLimitOrderForEntryRule(sourceLimitOrder);
     return cancelled ? FUTURES_ENTRY_RULE_CANCELLED : false;
   }
   showToast(finalEntryRule.reason);
   return false;
 }
 const seedBeforeEntry = calculateFuturesAccountEquity(existingFuturesPositions);
 const liquidationPrice = calculateSimpleFuturesLiquidationPrice({
   direction: positionDirection,
   entryPrice: price,
   leverage
 });
 const openedAt = timestampMs(options.executionTime)
   ? new Date(timestampMs(options.executionTime)).toISOString()
   : new Date().toISOString();
 const entryPosition = normalizeFuturesPosition({
   id: `fp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   market: orderMarketCode,
   symbol: currentFuturesSymbol(),
   priceSource: futuresPriceSourceForMarket(orderMarketCode),
   direction: positionDirection,
   entryPrice: price,
   margin,
   leverage,
   notional,
   quantity,
   inputMode,
   requestedQuantity: quantity,
   executedQuantity: quantity,
   remainingQuantity: quantity,
   entryFee,
   sourceLimitOrderId: limitOrderId,
   orderType: limitOrderId ? "LIMIT" : "MARKET",
   seedBeforeEntry,
   liquidationPrice,
   exchangeRate: futuresExchangeRate(),
   exchangeRateUpdatedAt: state.futures.exchangeRateUpdatedAt,
   openedAt
 });
 if (!entryPosition) return showToast("선물 포지션을 만들 수 없습니다.");
 const matchingPositionIndex = existingFuturesPositions.findIndex((item) => (
   futuresPositionMarketCode(item) === orderMarketCode
   && item.direction === positionDirection
 ));
 let activePosition = entryPosition;
 let mergedEntry = false;
 let nextPositions = [...existingFuturesPositions, entryPosition];
 if (matchingPositionIndex >= 0) {
   const existingPosition = existingFuturesPositions[matchingPositionIndex];
   const mergedMargin = existingPosition.margin + entryPosition.margin;
   const mergedNotional = existingPosition.notional + entryPosition.notional;
   const mergedQuantity = existingPosition.quantity + entryPosition.quantity;
   const averageEntryPrice = mergedQuantity > 0 ? mergedNotional / mergedQuantity : entryPosition.entryPrice;
   const mergedLeverage = mergedMargin > 0 ? mergedNotional / mergedMargin : leverage;
   const mergedEntryFee = existingPosition.entryFee + entryPosition.entryFee;
   const mergedPosition = normalizeFuturesPosition({
     ...existingPosition,
     entryPrice: averageEntryPrice,
     margin: mergedMargin,
     notional: mergedNotional,
     quantity: mergedQuantity,
     entryFee: mergedEntryFee,
     entries: [...futuresEntryLegs(existingPosition), ...futuresEntryLegs(entryPosition)],
     remainingPercent: 100,
     seedBeforeEntry: positiveNumber(existingPosition.seedBeforeEntry, seedBeforeEntry),
     liquidationPrice: calculateSimpleFuturesLiquidationPrice({
       direction: positionDirection,
       entryPrice: averageEntryPrice,
       leverage: mergedLeverage
     }),
     exchangeRate: entryPosition.exchangeRate,
     exchangeRateUpdatedAt: entryPosition.exchangeRateUpdatedAt,
     openedAt: existingPosition.openedAt
   });
   if (!mergedPosition) return showToast("선물 포지션의 평균단가를 계산할 수 없습니다.");
   activePosition = mergedPosition;
   mergedEntry = true;
   nextPositions = existingFuturesPositions.map((item, index) => index === matchingPositionIndex ? mergedPosition : item);
 }
 const persistenceCheckpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresLimitOrderSettledIds);
 state.futures.account.usdtBalance = Math.max(0, state.futures.account.usdtBalance - margin - entryFee);
 setFuturesPositions(nextPositions);
 state.futures.position = activePosition;
 if (limitOrderId) {
   settleFuturesLimitOrder(limitOrderId);
   state.futures.limitOrders = normalizeFuturesLimitOrders(state.futures.limitOrders)
     .filter((order) => order.id !== limitOrderId);
   addFuturesCompletedOrderNotice(sourceLimitOrder, "ENTRY", {
     positionId: activePosition.id,
     price,
     completedAt: openedAt
   });
 }
 ensureFuturesEntryMarker(entryPosition);
 const persistenceReason = limitOrderId ? "limit-order-fill" : "position-open";
 if (!saveFuturesState({ reason: persistenceReason })) {
   futuresLimitOrderSettledIds = settledIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(persistenceCheckpoint);
   renderAll();
   drawChart();
   return showToast("저장 실패로 포지션 진입을 취소했습니다. 기존 데이터는 유지됩니다.");
 }
 if (!limitOrderId) clearFuturesEntryInputs();
 renderAll();
 drawChart();
 const fileBackupResult = await verifyFuturesTradeFileBackup(persistenceReason);
 const successMessage = limitOrderId
   ? `${positionDirection === "LONG" ? "예약 매수(롱)" : "예약 매도(숏)"}가 ${formatFuturesDisplayPrice(price, orderMarketCode)}에 체결${mergedEntry ? "되어 기존 포지션에 합산" : ""}되었습니다.`
   : mergedEntry
     ? `${currentFuturesSymbol()} ${activePosition.direction === "LONG" ? "롱" : "숏"} 포지션에 합쳤습니다. 유효 레버리지 ${formatNumber(activePosition.leverage, 2)}x · 평균단가 ${formatFuturesDisplayPrice(activePosition.entryPrice, orderMarketCode)}`
     : `${currentFuturesSymbol()} ${activePosition.direction === "LONG" ? "롱" : "숏"} 포지션을 진입했습니다.`;
 showToast(successMessage + futuresTradeFileBackupStatusText(fileBackupResult));
 return true;
 } finally {
   state.futures.orderBusy = false;
   renderTradeButtons();
   renderFuturesOpenPositionsBlock();
 }
}
async function closeAllFuturesPositions() {
 const positions = getFuturesPositions();
 return closeFuturesPosition(positions.map((position) => position.id));
}
async function closeFuturesPosition(positionIds, closeAmountUnits = null, options = {}) {
 if (!isFuturesMode()) return;
 if (futuresOfflineReplayRunning && !options.offlineReplay) {
   return showToast("종료 중 1분봉 예약 주문을 계산한 뒤 다시 시도하세요.");
 }
 if (!ensureFuturesStorageCurrent()) return;
 const positions = getFuturesPositions();
 const ids = Array.isArray(positionIds) ? positionIds : [positionIds];
 const targetIds = new Set(ids.filter(Boolean).map(String));
 const targets = positions.filter((position) => targetIds.has(position.id));
 if (!targets.length) return showToast("청산할 선물 포지션이 없습니다.");
 const targetSymbols = [...new Set(targets.map(futuresPositionSymbol))];
 const targetQuantityLabel = targetSymbols.length === 1 ? targetSymbols[0] : "코인";
 const sourceExitOrderId = String(options.exitOrderId || "").trim();
 const sourceExitOrder = sourceExitOrderId
   ? normalizeFuturesExitOrders(state.futures.exitOrders).find((order) => (
     order.id === sourceExitOrderId && targetIds.has(order.positionId)
   ))
   : null;
 if (sourceExitOrderId && !sourceExitOrder) return false;
 const forcedExitPrice = positiveNumber(finiteNumber(options.price, 0), 0);
 if (state.futures.orderBusy) return;
 state.futures.orderBusy = true;
 renderTradeButtons();
 try {
 if (!options.skipExchangeRateRefresh) {
   await refreshFuturesExchangeRate({ notifyFailure: true, deferPersistence: true });
 }
 const inputMode = String(options.inputMode || "").toUpperCase() === "BTC" ? "BTC" : "MARGIN";
 const quantityText = String(options.quantity ?? "").trim();
 const parsedQuantity = normalizeFuturesBtcQuantity(quantityText);
 const quantityCloseRequested = inputMode === "BTC" && quantityText !== "";
 const fullCloseRequested = !quantityCloseRequested && (closeAmountUnits === null || closeAmountUnits === undefined);
 const amountText = String(closeAmountUnits ?? "").trim();
 const parsedAmountUnits = Number(amountText);
 if (quantityCloseRequested && parsedQuantity <= 0) {
   return showToast(`청산할 ${targetQuantityLabel} 수량을 입력하세요.`);
 }
 const requestedEntryId = String(options.entryId || "");
 if (requestedEntryId) {
   const entry = targets.flatMap(futuresEntryLegs).find((item) => item.id === requestedEntryId);
   if (!entry || normalizeFuturesBtcQuantity(entry.remainingQuantity) <= 0) {
     return showToast("이미 청산되었거나 찾을 수 없는 진입 기록입니다.");
   }
   if (parsedQuantity > normalizeFuturesBtcQuantity(entry.remainingQuantity) + FUTURES_BTC_EPSILON) {
     return showToast("해당 진입 기록의 잔여 수량보다 많이 청산할 수 없습니다.");
   }
 }
 if (!fullCloseRequested && !quantityCloseRequested && (amountText === "" || !Number.isFinite(parsedAmountUnits) || parsedAmountUnits <= 0)) {
   return showToast("청산할 금액을 USDT 단위로 입력하세요.");
 }
 if (options.partialCloseOnly) {
   const wouldCloseEntirePosition = targets.some((position) => {
     const positionQuantity = futuresPositionQuantity(position);
     const requestedQuantity = quantityCloseRequested
       ? parsedQuantity
       : futuresQuantityFromPositionAmountUnits(position, parsedAmountUnits);
     return requestedQuantity >= positionQuantity - FUTURES_BTC_EPSILON;
   });
   if (wouldCloseEntirePosition) {
     return showToast("부분 청산 금액은 전체 보유 금액보다 작게 입력하세요. 전량은 전체 청산 버튼을 사용하세요.");
   }
 }
 const requestedMargin = fullCloseRequested ? 0 : parsedAmountUnits;
 if (!fullCloseRequested && !sourceExitOrder) {
   if (quantityCloseRequested) {
     const tooLarge = targets.some((position) => parsedQuantity > futuresPositionQuantity(position) + FUTURES_BTC_EPSILON);
     if (tooLarge) return showToast("청산 수량은 현재 보유 수량보다 클 수 없습니다.");
   } else {
     const tooLarge = targets.some((position) => requestedMargin > finiteNumber(position.margin, 0) + Math.max(1e-8, finiteNumber(position.margin, 0) * 1e-8));
     if (tooLarge) return showToast("청산 금액은 현재 보유 포지션의 사용 금액보다 클 수 없습니다.");
   }
 }
 const partialClose = !fullCloseRequested && targets.some((position) => quantityCloseRequested
   ? parsedQuantity < futuresPositionQuantity(position) - FUTURES_BTC_EPSILON
   : requestedMargin < finiteNumber(position.margin, 0) - Math.max(1e-8, finiteNumber(position.margin, 0) * 1e-8));
 const persistenceCheckpoint = createFuturesPersistenceCheckpoint();
 const settledExitIdsCheckpoint = new Set(futuresExitOrderSettledIds);
 const exitTime = timestampMs(options.executionTime)
   ? new Date(timestampMs(options.executionTime)).toISOString()
   : new Date().toISOString();
 const remainingPositions = [];
 const closedTradeIds = [];
 const completedPositionSnapshots = [];
 const fullyClosedPositionIds = new Set();
 let closedCount = 0;
 let totalNetPnl = 0;
 let totalClosedAmountUnits = 0;
 let totalClosedQuantity = 0;
 for (const position of positions) {
   if (!targetIds.has(position.id)) {
     remainingPositions.push(position);
     continue;
   }
   const price = forcedExitPrice > 0 && sourceExitOrder && sourceExitOrder.positionId === position.id
     ? forcedExitPrice
     : await ensureFuturesPriceForPosition(position);
   if (!price) {
     remainingPositions.push(position);
     continue;
   }
   const currentRemainingPercent = clamp(finiteNumber(position.remainingPercent, 100), 0.01, 100);
   const positionQuantity = futuresPositionQuantity(position);
   const requestedCloseQuantity = fullCloseRequested
     ? positionQuantity
     : quantityCloseRequested
       ? Math.min(parsedQuantity, positionQuantity)
       : futuresQuantityFromPositionAmountUnits(position, parsedAmountUnits);
   const closeRatio = fullCloseRequested
     ? 1
     : quantityCloseRequested
       ? clamp(requestedCloseQuantity / positionQuantity, 0, 1)
       : clamp(Math.min(requestedMargin, position.margin) / position.margin, 0, 1);
   const requestedPercent = currentRemainingPercent * closeRatio;
   const closeQuantity = normalizeFuturesBtcQuantity(positionQuantity * closeRatio);
   const positionPartialClose = closeQuantity < positionQuantity - FUTURES_BTC_EPSILON;
   const positionBasisAdjustment = futuresBasisAdjustment(position);
   const closedBasisAdjustment = positionBasisAdjustment * closeRatio;
   const consumedEntries = consumeFuturesEntryQuantities(
     futuresEntryLegs(position),
     closeQuantity,
     requestedEntryId
   );
   if (consumedEntries.remainingToClose > FUTURES_BTC_EPSILON) {
     remainingPositions.push(position);
     continue;
   }
   const closedPosition = normalizeFuturesPosition({
     ...position,
     margin: position.margin * closeRatio,
     notional: position.notional * closeRatio,
     quantity: closeQuantity,
     entries: undefined,
     entryFee: position.entryFee * closeRatio,
     basisAdjustmentUsdt: closedBasisAdjustment,
     remainingPercent: requestedPercent
   });
   if (!closedPosition) {
     remainingPositions.push(position);
     continue;
   }
   const calc = calculateFuturesPosition(closedPosition, price);
   const returnedMargin = closedPosition.margin + calc.grossPnl - calc.exitFee;
   state.futures.account.usdtBalance = Math.max(0, state.futures.account.usdtBalance + returnedMargin);
   totalNetPnl += calc.netPnl;
   closedCount += 1;
   const closedAmountUnits = futuresPartialCloseAmountUnits(closedPosition);
   totalClosedAmountUnits += closedAmountUnits;
   totalClosedQuantity = normalizeFuturesBtcQuantity(totalClosedQuantity + closedPosition.quantity);
   const closeSizeLabel = inputMode === "BTC" || requestedEntryId
     ? formatFuturesQuantity(closedPosition.quantity, futuresPositionSymbol(position))
     : `${trimNumber(closedAmountUnits, 2)} USDT`;
   const closeReason = sourceExitOrderId
     ? `예약 청산 ${formatFuturesDisplayPrice(price, futuresPositionMarketCode(position))} · ${closeSizeLabel}`
     : fullCloseRequested
     ? "수동 청산"
     : `${requestedEntryId ? "진입 수량 청산" : positionPartialClose ? "부분 청산" : "수량 청산"} ${closeSizeLabel}`;
   const trade = normalizeFuturesTrade({
     id: `ft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
     positionId: position.id,
     market: futuresPositionMarketCode(position),
     symbol: futuresPositionSymbol(position),
     priceSource: position.priceSource || futuresPriceSourceForMarket(futuresPositionMarketCode(position)),
     marketType: "futures",
     side: position.direction === "LONG" ? "long" : "short",
     direction: position.direction === "LONG" ? "Long" : "Short",
     leverage: position.leverage,
     entryPrice: calc.effectiveEntryPrice || futuresEffectiveEntryPrice(closedPosition) || position.entryPrice,
     exitPrice: price,
     closePrice: price,
     margin: closedPosition.margin,
     notional: closedPosition.notional,
     quantity: closedPosition.quantity,
     inputMode: inputMode === "BTC" || requestedEntryId ? "BTC" : "MARGIN",
     requestedQuantity: requestedCloseQuantity,
     executedQuantity: closedPosition.quantity,
     reduceOnly: true,
     orderIntent: "CLOSE",
     entries: futuresEntryLegs(position),
     grossPnl: calc.grossPnl,
     fee: calc.fee,
     entryFee: calc.entryFee,
     exitFee: calc.exitFee,
     netPnl: calc.netPnl,
     realizedPnl: calc.netPnl,
     roe: calc.roePercent,
     roePercent: calc.roePercent,
     liquidationPrice: calc.liquidationPrice,
     closeReason,
     memo: position.memo || "",
     balanceAfter: state.futures.account.usdtBalance,
     seedBeforeTrade: position.seedBeforeEntry,
     entryExchangeRate: positiveNumber(position.exchangeRate, futuresExchangeRate()),
     exitExchangeRate: futuresExchangeRate(),
     entryTime: position.openedAt,
     exitTime,
     openedAt: position.openedAt,
     closedAt: exitTime
   });
   if (trade) {
     state.futures.trades.push(trade);
     closedTradeIds.push(trade.id);
     if (!positionPartialClose) {
       completedPositionSnapshots.push(position);
       fullyClosedPositionIds.add(String(position.id));
     }
   }
   if (positionPartialClose) {
     const remainingRatio = 1 - closeRatio;
     const nextRemainingPercent = currentRemainingPercent - requestedPercent;
     const remaining = normalizeFuturesPosition({
       ...position,
       margin: position.margin * remainingRatio,
       notional: position.notional * remainingRatio,
       quantity: normalizeFuturesBtcQuantity(positionQuantity - closeQuantity),
       entries: consumedEntries.entries,
       entryFee: position.entryFee * remainingRatio,
       basisAdjustmentUsdt: positionBasisAdjustment - closedBasisAdjustment,
       remainingPercent: nextRemainingPercent
     });
     if (remaining) remainingPositions.push(remaining);
   }
 }
 if (!closedCount) return showToast("선물 현재가를 가져오지 못해 청산하지 못했습니다.");
 state.futures.lastRealizedPnl = totalNetPnl;
 setFuturesPositions(remainingPositions);
 if (fullyClosedPositionIds.has(state.chart.exitOrderPositionId)) {
   state.chart.exitOrderPositionId = "";
   state.chart.exitOrderAmountUnits = 0;
   state.chart.exitOrderQuantity = 0;
   state.chart.exitOrderInputMode = "MARGIN";
 }
 const filledExitOrderIds = new Set(sourceExitOrderId ? [sourceExitOrderId] : []);
 const settledExitOrders = normalizeFuturesExitOrders(state.futures.exitOrders)
   .filter((order) => fullyClosedPositionIds.has(order.positionId) || filledExitOrderIds.has(order.id));
 settledExitOrders.forEach((order) => settleFuturesExitOrder(order.id));
 state.futures.exitOrders = normalizeFuturesExitOrders(state.futures.exitOrders)
   .filter((order) => !fullyClosedPositionIds.has(order.positionId) && !filledExitOrderIds.has(order.id));
 if (sourceExitOrder) {
   addFuturesCompletedOrderNotice(sourceExitOrder, "EXIT", {
     positionId: sourceExitOrder.positionId,
     price: forcedExitPrice || sourceExitOrder.price,
     closeAmountUnits: totalClosedAmountUnits,
     closeQuantity: totalClosedQuantity,
     completedAt: exitTime
   });
 }
 const seedAfterTrade = calculateFuturesAccountEquity(remainingPositions);
 const closedTradeIdSet = new Set(closedTradeIds);
 state.futures.trades.forEach((trade) => {
   if (closedTradeIdSet.has(trade.id)) trade.seedAfterTrade = seedAfterTrade;
 });
 completedPositionSnapshots.forEach((position) => {
   const positionTrades = state.futures.trades.filter((trade) => (
     String(trade.positionId || "") === String(position.id)
     || futuresTradePositionSignature(trade) === futuresOpenPositionSignature(position)
   ));
   const completedBlock = createFuturesPositionBlock(position.id, positionTrades, {
     entries: futuresEntryLegs(position),
     memo: position.memo || "",
     entryTime: position.openedAt,
     openedAt: position.openedAt,
     createdAt: position.openedAt,
     updatedAt: exitTime
   });
   if (completedBlock) {
     state.futures.positionBlocks = normalizeFuturesPositionBlocks([
       ...(state.futures.positionBlocks || []),
       completedBlock
     ]);
   }
 });
 const persistenceReason = sourceExitOrderId ? "exit-order-fill" : "position-close";
 if (!saveFuturesState({ reason: persistenceReason })) {
   futuresExitOrderSettledIds = settledExitIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(persistenceCheckpoint);
   renderAll();
   drawChart();
   return showToast("저장 실패로 포지션 청산을 취소했습니다. 기존 데이터는 유지됩니다.");
 }
 renderAll();
 drawChart();
 const completedSizeLabel = inputMode === "BTC" || requestedEntryId || (sourceExitOrder && sourceExitOrder.inputMode === "BTC")
   ? targetSymbols.length === 1
     ? formatFuturesQuantity(totalClosedQuantity, targetSymbols[0])
     : `${closedCount.toLocaleString("ko-KR")}개 포지션 수량`
   : `${trimNumber(totalClosedAmountUnits, 2)} USDT`;
 const fileBackupResult = await verifyFuturesTradeFileBackup(persistenceReason);
 const successMessage = sourceExitOrderId
   ? `예약가 ${formatFuturesDisplayPrice(forcedExitPrice, sourceExitOrder.market)}에서 ${completedSizeLabel}을 청산했습니다. 손익 ${formatSignedFuturesDisplayAmount(totalNetPnl)}`
   : `${closedCount.toLocaleString("ko-KR")}개 선물 포지션에서 ${completedSizeLabel}을 ${partialClose ? "부분 청산" : "청산"}했습니다. 손익 ${formatSignedFuturesDisplayAmount(totalNetPnl)}`;
 showToast(successMessage + futuresTradeFileBackupStatusText(fileBackupResult));
 return true;
 } finally {
   state.futures.orderBusy = false;
   renderTradeButtons();
   renderFuturesOpenPositionsBlock();
 }
}
function fillBuyPercent(percent) {
 const amount = state.portfolio.krwBalance * (percent / 100);
 el.buyAmountInput.value = Math.floor(amount).toString();
}
function fillSellPercent(percent) {
 if (percent >= 100) {
   el.sellAmountInput.value = state.portfolio.btcBalance.toString();
   return;
 }
 const amount = state.portfolio.btcBalance * (percent / 100);
 el.sellAmountInput.value = trimNumber(amount, 8);
}
// 매수는 입력 금액에서 수수료를 먼저 빼고 남은 금액으로 BTC 수량을 계산한다.
function placeBuyOrder() {
 const price = currentPriceOrToast();
 if (!price) return;
 const krwAmount = Math.floor(finiteNumber(Number(el.buyAmountInput.value), 0));
 const memo = el.buyMemoInput.value.trim();
 if (krwAmount <= 0) return showToast("매수 금액을 입력하세요.");
 if (krwAmount > state.portfolio.krwBalance) return showToast("공통 KRW 잔고보다 큰 금액은 매수할 수 없습니다.");
 const fee = krwAmount * state.portfolio.feeRateBuy;
 const netKrw = krwAmount - fee;
 const btcAmount = netKrw / price;
 if (!Number.isFinite(btcAmount) || btcAmount <= 0) return showToast("매수 수량을 계산할 수 없습니다.");
 const beforeBtc = state.portfolio.btcBalance;
 const beforeCost = state.portfolio.avgBuyPrice * beforeBtc;
 const afterBtc = beforeBtc + btcAmount;
 const checkpoint = createTradingStateCheckpoint();
 state.portfolio.krwBalance -= krwAmount;
 state.portfolio.btcBalance = afterBtc;
 state.portfolio.avgBuyPrice = afterBtc > 0 ? (beforeCost + krwAmount) / afterBtc : 0;
 addTrade({
   side: "BUY",
   price,
   btcAmount,
   krwAmount,
   fee,
   realizedPnl: 0,
   realizedPnlRate: 0,
   memo
 });
 el.buyAmountInput.value = "";
 el.buyMemoInput.value = "";
 if (!persistAndRenderAfterTrade("매수 주문을 모의 체결했습니다.", checkpoint)) {
   el.buyAmountInput.value = krwAmount.toString();
   el.buyMemoInput.value = memo;
 }
}
// 매도는 평균 매수가와 매도 후 순수령액을 비교해 실현손익과 수익률을 기록한다.
function placeSellOrder() {
 const price = currentPriceOrToast();
 if (!price) return;
 const btcAmount = finiteNumber(Number(el.sellAmountInput.value), 0);
 const memo = el.sellMemoInput.value.trim();
 const symbol = currentMarket().symbol;
 if (btcAmount <= 0) return showToast("매도 수량을 입력하세요.");
 const sellTolerance = Math.max(1e-12, state.portfolio.btcBalance * 1e-8);
 if (btcAmount > state.portfolio.btcBalance + sellTolerance) return showToast(`보유 ${symbol}보다 큰 수량은 매도할 수 없습니다.`);
 if (btcAmount >= state.portfolio.btcBalance * 0.999 && state.portfolio.btcBalance > 0) {
   const runSell = () => executeSell(price, state.portfolio.btcBalance, memo);
   openConfirm({
     title: "전량 매도 확인",
     message: `보유 ${symbol} 대부분을 매도합니다.`,
     okText: "전량 매도",
     onConfirm: runSell
   });
 } else {
   const runSell = () => executeSell(price, Math.min(btcAmount, state.portfolio.btcBalance), memo);
   runSell();
 }
}
function executeSell(price, btcAmount, memo) {
 const grossKrw = btcAmount * price;
 const fee = grossKrw * state.portfolio.feeRateSell;
 const netKrw = grossKrw - fee;
 const avgEntryPrice = state.portfolio.avgBuyPrice;
 const costBasis = avgEntryPrice * btcAmount;
 const realizedPnl = netKrw - costBasis;
 const realizedPnlRate = costBasis > 0 ? (realizedPnl / costBasis) * 100 : 0;
 const checkpoint = createTradingStateCheckpoint();
 state.portfolio.krwBalance += netKrw;
 state.portfolio.btcBalance -= btcAmount;
 if (state.portfolio.btcBalance < 1e-10) {
   state.portfolio.btcBalance = 0;
   state.portfolio.avgBuyPrice = 0;
 }
 state.portfolio.realizedPnl += realizedPnl;
 addTrade({
   side: "SELL",
   price,
   btcAmount,
   krwAmount: grossKrw,
   fee,
   realizedPnl,
   realizedPnlRate,
   avgEntryPrice,
   memo
 });
 el.sellAmountInput.value = "";
 el.sellMemoInput.value = "";
 if (!persistAndRenderAfterTrade("매도 주문을 모의 체결했습니다.", checkpoint)) {
   el.sellAmountInput.value = btcAmount.toString();
   el.sellMemoInput.value = memo;
 }
}
function addTrade(partial) {
 const trade = {
   id: `tr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   market: state.market,
   ...partial,
   krwBalanceAfter: state.portfolio.krwBalance,
   btcBalanceAfter: state.portfolio.btcBalance,
   avgEntryPrice: positiveNumber(partial.avgEntryPrice, state.portfolio.avgBuyPrice),
   avgBuyPriceAfter: state.portfolio.avgBuyPrice,
   createdAt: new Date().toISOString()
 };
 state.trades.push(trade);
}
function createTradingStateCheckpoint() {
 return {
   portfolio: { ...state.portfolio },
   sharedAccount: { ...state.sharedAccount },
   trades: [...state.trades],
   dailySummaries: [...state.dailySummaries]
 };
}
function restoreTradingStateCheckpoint(checkpoint) {
 if (!checkpoint) return;
 state.portfolio = { ...checkpoint.portfolio };
 state.sharedAccount = { ...checkpoint.sharedAccount };
 state.trades = [...checkpoint.trades];
 state.dailySummaries = [...checkpoint.dailySummaries];
}
function verifyTradingStorage() {
 const expectedTrades = normalizeTrades(state.trades || [], DEFAULT_MARKET);
 const savedTrades = normalizeTrades(readJson(SHARED_TRADES_KEY, []), DEFAULT_MARKET);
 const expectedDailySummaries = normalizeDailySummaries(state.dailySummaries || []);
 const savedDailySummaries = normalizeDailySummaries(readJson(SHARED_DAILY_SUMMARIES_KEY, []));
 const savedPortfolio = normalizePortfolio(readJson(storageKey("portfolio"), null));
 const latestTrade = expectedTrades.length ? expectedTrades[expectedTrades.length - 1] : null;

 if (savedTrades.length !== expectedTrades.length) {
   throw new Error("Stored trade count mismatch");
 }
 if (latestTrade && !savedTrades.some((trade) => trade.id === latestTrade.id)) {
   throw new Error("Latest trade was not stored");
 }
 if (savedDailySummaries.length !== expectedDailySummaries.length) {
   throw new Error("Stored daily summary count mismatch");
 }
 if (Math.abs(savedPortfolio.krwBalance - state.portfolio.krwBalance) > 0.01) {
   throw new Error("Stored KRW balance mismatch");
 }
 if (Math.abs(savedPortfolio.btcBalance - state.portfolio.btcBalance) > 1e-12) {
   throw new Error("Stored coin balance mismatch");
 }
}
function persistAndRenderAfterTrade(message, checkpoint) {
 try {
   archivePastTradesIfNeeded();
   savePortfolio();
   saveTrades();
   saveDailySummaries();
   verifyTradingStorage();
 } catch (error) {
   console.error("Trade persistence failed", error);
   try {
     savePortfolio();
     saveTrades();
     saveDailySummaries();
   } catch (retryError) {
     console.error("Trade persistence retry failed", retryError);
   }
   renderDashboard();
   renderTradeButtons();
   renderTradeHistory();
   drawChart();
   showToast(`${message} 저장 확인은 실패했지만 매매는 먼저 반영했습니다.`);
   return true;
 }

 renderDashboard();
 renderTradeButtons();
 renderTradeHistory();
 drawChart();
 showToast(message);
 return true;
}
function currentPriceOrToast() {
 if (!state.ticker || !state.ticker.price) {
   showToast("현재가가 들어온 뒤 주문할 수 있습니다.");
   return 0;
 }
 return state.ticker.price;
}
function updateFuturesPositionMemo(id, memo) {
 const nextMemo = String(memo || "").slice(0, 160);
 const positions = getFuturesPositions();
 const position = positions.find((item) => item.id === id);
 if (!position) return;
 position.memo = nextMemo;
 setFuturesPositions(positions);
 saveFuturesState();
}
function updateTradeMemo(id, memo, options = {}) {
 const trade = state.trades.find((item) => item.id === id);
 if (!trade) return;
 trade.memo = String(memo || "").slice(0, 80);
 saveTrades();
 showToast("메모를 저장했습니다.");
}
function updateFuturesTradeMemo(id, memo, options = {}) {
 const nextMemo = String(memo || "").slice(0, 160);
 const updatedAt = new Date().toISOString();
 let updated = false;
 const activeTrades = Array.isArray(state.futures.trades) ? state.futures.trades : [];
 const activeTrade = activeTrades.find((item) => item.id === id);
 if (activeTrade) {
   activeTrade.memo = nextMemo;
   activeTrade.updatedAt = updatedAt;
   updated = true;
 }
 (state.futures.dailySummaries || []).forEach((summary) => {
   (summary.trades || []).forEach((trade) => {
     if (trade.id !== id) return;
     trade.memo = nextMemo;
     trade.updatedAt = updatedAt;
     updated = true;
   });
 });
 (state.futures.positionBlocks || []).forEach((block) => {
   (block.trades || []).forEach((trade) => {
     if (trade.id !== id) return;
     trade.memo = nextMemo;
     trade.updatedAt = updatedAt;
     updated = true;
   });
 });
 if (!updated) return;
 saveFuturesState();
 showToast("선물 메모를 저장했습니다.");
}
function updateTradeMemoDraft(id, memo) {
 const trade = state.trades.find((item) => item.id === id);
 if (!trade) return;
 trade.memo = String(memo || "").slice(0, 80);
 saveTrades();
}
function updateFuturesTradeMemoDraft(id, memo) {
 const nextMemo = String(memo || "").slice(0, 160);
 const updatedAt = new Date().toISOString();
 let updated = false;
 const activeTrades = Array.isArray(state.futures.trades) ? state.futures.trades : [];
 const activeTrade = activeTrades.find((item) => item.id === id);
 if (activeTrade) {
   activeTrade.memo = nextMemo;
   activeTrade.updatedAt = updatedAt;
   updated = true;
 }
 (state.futures.dailySummaries || []).forEach((summary) => {
   (summary.trades || []).forEach((trade) => {
     if (trade.id !== id) return;
     trade.memo = nextMemo;
     trade.updatedAt = updatedAt;
     updated = true;
   });
 });
 (state.futures.positionBlocks || []).forEach((block) => {
   (block.trades || []).forEach((trade) => {
     if (trade.id !== id) return;
     trade.memo = nextMemo;
     trade.updatedAt = updatedAt;
     updated = true;
   });
 });
 if (updated) saveFuturesState();
}
function updateFuturesPositionBlockMemo(id, memo) {
 const nextMemo = String(memo || "").slice(0, 160);
 const block = (state.futures.positionBlocks || []).find((item) => item.id === id);
 if (!block) return;
 block.memo = nextMemo;
 block.updatedAt = new Date().toISOString();
 saveFuturesState();
 showToast("포지션 복기 메모를 저장했습니다.");
}
function updateFuturesPositionBlockMemoDraft(id, memo) {
 const block = (state.futures.positionBlocks || []).find((item) => item.id === id);
 if (!block) return;
 block.memo = String(memo || "").slice(0, 160);
 block.updatedAt = new Date().toISOString();
 saveFuturesState();
}
function confirmClearTrades() {
 closeModal(el.resetModal);
  if (isFuturesMode()) {
   openConfirm({
     title: "선물 거래기록 삭제",
     message: "초기화 이전의 완료 매매기록을 삭제합니다. 현재 진행 중인 선물 포지션의 진입·부분청산 기록과 예약 주문은 그대로 보관합니다.",
     okText: "삭제",
     onConfirm: () => {
       keepOnlyOngoingFuturesRecords();
       const saved = saveFuturesLedgerResetState("completed-history-clear");
       renderDashboard();
       renderTradeHistory();
       drawChart();
       showToast(saved
         ? "완료된 매매기록을 삭제하고 진행 중 포지션 기록만 새 장부에 보관했습니다."
         : "화면에서는 기록을 정리했지만 저장 검증에 실패했습니다. 주문 전에 저장 공간을 확인하세요.");
     }
   });
   return;
 }
 openConfirm({
   title: "매매기록 삭제",
   message: "모든 코인의 매매기록만 삭제합니다. 현재 공통 KRW 잔고와 각 코인 보유량은 그대로 둡니다.",
   okText: "삭제",
   onConfirm: () => {
     clearAllMarketTrades();
     renderDashboard();
     renderTradeHistory();
     drawChart();
     showToast("모든 코인의 매매기록을 삭제했습니다.");
   }
 });
}
function downloadTradesCsv() {
 if (isFuturesMode()) {
   downloadFuturesTradesCsv();
   return;
 }
 if (!state.trades.length && !state.dailySummaries.length) return showToast("다운로드할 매매기록이 없습니다.");
 const headers = [
   "시간",
   "코인",
   "구분",
   "가격",
   "수량",
   "거래금액 KRW",
   "수수료",
   "실현손익",
   "수익률",
   "보유 변동률",
   "거래 후 공통 KRW 잔고",
   "거래 후 코인 보유량",
   "평균 매수가",
   "메모"
 ];
 const openBuyTradeIdsMap = currentHoldingRateTradeIdsByMarket();
 const tradeRows = [...state.trades]
   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
   .map((trade) => {
     const market = tradeMarket(trade);
     const holdingRate = currentHoldingRateForTrade(trade, openBuyTradeIdsMap.get(tradeMarketCode(trade)) || new Set());
     return [
       formatDateTime(trade.createdAt),
       market.code,
       trade.side,
       trade.price,
       `${trade.btcAmount} ${market.symbol}`,
       trade.krwAmount,
       trade.fee,
       trade.realizedPnl,
       trade.realizedPnlRate,
       Number.isFinite(holdingRate) ? holdingRate : "",
       trade.krwBalanceAfter,
       `${trade.btcBalanceAfter} ${market.symbol}`,
       averageEntryPriceForTrade(trade) || "",
       trade.memo || ""
     ];
   });
 const summaryRows = [...state.dailySummaries]
   .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
   .map((summary) => [
     summary.dateKey,
     "ALL",
     "일별요약",
     "",
     "",
     "",
     "",
     summary.realizedPnl,
     summary.returnRate,
     "",
     "",
     "",
     "",
     `승률 ${Number.isFinite(summary.winRate) ? `${summary.winRate.toFixed(1)}%` : "-"} / 매매 ${summary.tradeCount}건`
   ]);
 const rows = [...tradeRows, ...summaryRows];
 const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
 const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const anchor = document.createElement("a");
 anchor.href = url;
 anchor.download = `all-paper-trades-${new Date().toISOString().slice(0, 10)}.csv`;
 anchor.click();
 URL.revokeObjectURL(url);
}
function downloadFuturesTradesCsv() {
 const positionBlocks = completedFuturesPositionBlocks();
 if (!positionBlocks.length) return showToast("다운로드할 완료 포지션 기록이 없습니다.");
 const headers = [
   "포지션 ID",
   "보유 기간",
   "이벤트 시간",
   "구분",
   "상품",
   "방향",
   "실제 체결가",
   "레버리지",
   "이벤트 수수료",
   "이벤트 순손익",
   "이벤트 ROE %",
   "사용 금액",
   "수량",
   "이벤트 메모",
   "포지션 총수수료",
   "포지션 순손익",
   "포지션 ROE %",
   "포지션 복기 메모"
 ];
 const positionRows = positionBlocks
   .sort((a, b) => futuresTradeEntryTimestamp(a) - futuresTradeEntryTimestamp(b))
   .flatMap((block) => futuresPositionTimelineEvents(block).map((event) => {
     const isEntry = event.type === "ENTRY";
     return [
       block.positionId,
       futuresPositionBlockPeriodLabel(block),
       formatDateTime(event.time),
       futuresPositionTimelineEventLabel(event),
       futuresProductLabel(event.market, event.symbol),
       event.direction,
       event.price,
      `${formatNumber(event.leverage, 2)}x`,
       event.fee,
       isEntry ? "" : event.pnl,
       isEntry ? "" : event.roe,
       event.margin,
       event.quantity,
       isEntry ? "" : event.memo,
       block.fee,
       block.netPnl,
       block.roe,
       block.memo || ""
     ];
   }));
 const rows = positionRows;
 const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
 const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const anchor = document.createElement("a");
 anchor.href = url;
 anchor.download = `${currentFuturesSymbol().toLowerCase()}-futures-position-journal-${new Date().toISOString().slice(0, 10)}.csv`;
 anchor.click();
 URL.revokeObjectURL(url);
}
function futuresBackupFileTimestamp(date = new Date()) {
 return date.toISOString().replace(/[:.]/g, "-");
}
function createFuturesBackupDocument(data, storageVerified) {
 const stateData = cloneJsonValue(data);
 return {
   format: FUTURES_BACKUP_FILE_FORMAT,
   version: FUTURES_BACKUP_FILE_VERSION,
   exportedAt: new Date().toISOString(),
   sourceRevision: futuresStorageRevision,
   storageVerified: Boolean(storageVerified),
   checksum: checksumStorageText(JSON.stringify(stateData)),
   data: stateData
 };
}
async function downloadFuturesFullBackup() {
 const storageVerified = saveFuturesState({ reason: "manual-full-backup" });
 const backup = await createFuturesLiveBackupDocument(
   buildFuturesTradingBackupPayload(),
   storageVerified,
   "emergency-download"
 );
 const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const anchor = document.createElement("a");
 anchor.href = url;
 anchor.download = FUTURES_LIVE_BACKUP_FILE_NAME;
 anchor.click();
 URL.revokeObjectURL(url);
 showToast(storageVerified
   ? "매매 데이터만 담은 응급 백업을 검증하여 내려받았습니다."
   : "브라우저 저장 검증은 실패했지만 현재 화면의 매매 데이터를 응급 백업으로 만들었습니다.");
}
async function parseFuturesBackupDocument(text) {
 const backup = JSON.parse(text);
 const supportedFullBackup = backup
   && backup.format === FUTURES_BACKUP_FILE_FORMAT
   && Number(backup.version) === FUTURES_BACKUP_FILE_VERSION;
 const supportedLiveBackup = backup
   && backup.format === FUTURES_LIVE_BACKUP_FILE_FORMAT
   && Number(backup.version) === FUTURES_LIVE_BACKUP_FILE_VERSION;
 if (!supportedFullBackup && !supportedLiveBackup) {
   throw new Error("지원하지 않는 백업 파일입니다.");
 }
 if (!isPlausibleFuturesStorageData(backup.data)) throw new Error("백업 데이터 구조가 올바르지 않습니다.");
 const dataText = JSON.stringify(backup.data);
 const checksum = checksumStorageText(dataText);
 if (backup.checksum !== checksum) throw new Error("백업 파일 무결성 검증에 실패했습니다.");
 if (backup.sha256) {
   const strongChecksum = await sha256ChecksumText(dataText);
   if (strongChecksum && strongChecksum !== backup.sha256) throw new Error("백업 파일 SHA-256 검증에 실패했습니다.");
 }
 return cloneJsonValue(backup.data);
}
async function handleFuturesRestoreFile(event) {
 const input = event && event.target;
 const file = input && input.files ? input.files[0] : null;
 if (input) input.value = "";
 if (!file) return;
 try {
   const importedData = await parseFuturesBackupDocument(await file.text());
   const importedState = normalizeFuturesState(importedData);
   const positionCount = normalizeFuturesPositions(importedState.positions).length;
   const completedPositionCount = normalizeFuturesPositionBlocks(importedState.positionBlocks || []).length;
   const closeTradeCount = mergeFuturesTradesById(
     importedState.trades || [],
     (importedState.positionBlocks || []).flatMap((block) => block.trades || [])
   ).length;
   openConfirm({
     title: "전체 선물 백업 복원",
     message: `백업의 보유 포지션 ${positionCount.toLocaleString("ko-KR")}개, 완료 포지션 기록 ${completedPositionCount.toLocaleString("ko-KR")}개, 청산 내역 ${closeTradeCount.toLocaleString("ko-KR")}건으로 현재 선물 데이터를 교체합니다.`,
     okText: "복원",
     requiredPhrase: "복원",
     onConfirm: () => restoreFuturesFullBackup(importedData)
   });
 } catch (error) {
   console.error("Futures backup import failed", error);
   showToast(error && error.message ? error.message : "백업 파일을 읽지 못했습니다.");
 }
}
async function restoreFuturesFullBackup(importedData) {
 const checkpoint = createFuturesPersistenceCheckpoint();
 const settledIdsCheckpoint = new Set(futuresLimitOrderSettledIds);
 const settledExitIdsCheckpoint = new Set(futuresExitOrderSettledIds);
 if (futuresLiveBackupInitialized) {
   try {
     const safetyDocument = await createFuturesLiveBackupDocument(
       buildFuturesTradingBackupPayload(checkpoint),
       true,
       "pre-restore-safety"
     );
     await writeFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_PRE_RESTORE_KEY, safetyDocument);
     const verifiedSafetyDocument = await readFuturesLiveBackupDbValue(FUTURES_LIVE_BACKUP_PRE_RESTORE_KEY);
     const verifiedSafetyData = verifiedSafetyDocument
       ? await parseFuturesBackupDocument(JSON.stringify(verifiedSafetyDocument))
       : null;
     if (!verifiedSafetyData
       || futuresTradingBackupContentChecksum(verifiedSafetyData) !== futuresTradingBackupContentChecksum(safetyDocument.data)) {
       throw new Error("복원 직전 안전본 검증에 실패했습니다.");
     }
   } catch (error) {
     console.error("Pre-restore safety snapshot failed", error);
     showToast("현재 매매기록의 복원 직전 안전본을 만들지 못해 복원을 중단했습니다.");
     return;
   }
 }
 restoreFuturesPersistenceCheckpoint(importedData);
 futuresLimitOrderSettledIds = new Set(normalizeFuturesLimitOrderSettledIds(importedData && importedData.settledLimitOrderIds));
 futuresLimitOrderJournalLoaded = true;
 futuresExitOrderSettledIds = new Set(normalizeFuturesExitOrderSettledIds(importedData && importedData.settledExitOrderIds));
 futuresExitOrderJournalLoaded = true;
 state.futures.orderBusy = false;
 futuresLiveBackupRecoveryPending = false;
 if (!saveFuturesState({ force: true, reason: "manual-full-restore" })) {
   futuresLimitOrderSettledIds = settledIdsCheckpoint;
   futuresExitOrderSettledIds = settledExitIdsCheckpoint;
   restoreFuturesPersistenceCheckpoint(checkpoint);
   renderAll();
   drawChart();
   return showToast("백업 복원 저장에 실패했습니다. 기존 데이터는 유지됩니다.");
 }
 hydrateSettingsInputs();
 renderAll();
 drawChart();
 showToast("전체 선물 백업을 복원하고 저장을 검증했습니다.");
}
function hydrateSettingsInputs() {
 el.seedInput.value = trimNumber(state.futures.account.initialUsdt, 2);
 renderFuturesAccountControls();
}
function saveSettings() {
 hydrateSettingsInputs();
 closeModal(el.settingsModal);
}
function confirmApplySeed() {
 const seed = Number(el.seedInput.value);
 if (!Number.isFinite(seed) || seed < 0.01) {
   showToast("초기 시드는 0.01 USDT 이상으로 입력하세요.");
   el.seedInput.focus();
   return;
 }
 const normalizedSeed = Math.round(seed * 100) / 100;
 openConfirm({
   title: "시드머니 적용",
   message: `${formatUsdt(normalizedSeed, 2)} 기준으로 USDT 잔고, 모든 선물 포지션, 예약 주문과 매매기록을 초기화합니다. 실행하려면 확인 문구를 입력하세요.`,
   okText: "적용",
   requiredPhrase: "초기화",
   onConfirm: () => {
     resetFuturesPaperState(normalizedSeed);
     closeModal(el.settingsModal);
     hydrateSettingsInputs();
     renderAll();
     showToast(`시드머니를 ${formatUsdt(normalizedSeed, 2)}로 적용했습니다.`);
   }
 });
}
function confirmResetAll() {
 closeModal(el.resetModal);
 openConfirm({
   title: "전체 초기화",
   message: "USDT 잔고, 모든 선물 포지션, 예약 주문, 매매기록, 추세선, 피보나치, 손익비 블럭을 모두 초기화합니다. 실행하려면 확인 문구를 입력하세요.",
   okText: "전체 초기화",
   requiredPhrase: "초기화",
   onConfirm: () => {
     const seed = positiveNumber(Number(el.seedInput.value), state.futures.account.initialUsdt || DEFAULT_FUTURES_USDT);
     resetFuturesPaperState(seed);
     state.chart.selectedTrendlineId = null;
     state.chart.selectedRiskBlockId = null;
     state.chart.pendingPoint = null;
     state.chart.horizontalMode = false;
     state.chart.fibonacciMode = false;
     state.chart.draggingRiskBlock = null;
     state.chart.draggingFibonacci = null;
     hydrateSettingsInputs();
     renderAll();
     showToast("전체 초기화를 완료했습니다.");
   }
 });
}
function openConfirm(options) {
 state.confirm = options;
 setText(el.confirmTitle, options.title || "확인");
 setText(el.confirmMessage, options.message || "");
 setText(el.confirmCancelBtn, options.cancelText || "취소");
 setText(el.confirmOkBtn, options.okText || "확인");
 el.confirmPhraseInput.value = "";
 if (options.requiredPhrase) {
   el.confirmPhraseWrap.hidden = false;
   setText(el.confirmPhraseLabel, `"${options.requiredPhrase}" 입력`);
 } else {
   el.confirmPhraseWrap.hidden = true;
 }
 updateConfirmOkState();
 openModal(el.confirmModal);
 if (options.requiredPhrase) el.confirmPhraseInput.focus();
}
function updateConfirmOkState() {
 if (!state.confirm || !state.confirm.requiredPhrase) {
   el.confirmOkBtn.disabled = false;
   return;
 }
 el.confirmOkBtn.disabled = el.confirmPhraseInput.value.trim() !== state.confirm.requiredPhrase;
}
function runConfirmAction() {
 if (!state.confirm) return;
 if (state.confirm.requiredPhrase && el.confirmPhraseInput.value.trim() !== state.confirm.requiredPhrase) {
   showToast("확인 문구가 일치하지 않습니다.");
   return;
 }
 const action = state.confirm.onConfirm;
 closeConfirm();
 if (typeof action === "function") action();
}
function runConfirmCancelAction() {
 if (!state.confirm) return;
 const action = state.confirm.onCancel;
 closeConfirm();
 if (typeof action === "function") action();
}
function closeConfirm() {
 state.confirm = null;
 closeModal(el.confirmModal);
}
function openModal(modal) {
 modal.classList.add("open");
 modal.setAttribute("aria-hidden", "false");
}
function closeModal(modal) {
 modal.classList.remove("open");
 modal.setAttribute("aria-hidden", "true");
}
function showToast(message) {
 setText(el.toast, message);
 el.toast.classList.add("show");
 clearTimeout(state.toastTimer);
 state.toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
}
function setText(node, value) {
 if (node) node.textContent = value;
}
function setSignedText(node, value, label) {
 if (!node) return;
 setText(node, label);
 node.classList.remove("positive", "negative", "neutral");
 node.classList.add(signClass(value));
}
function signClass(value) {
 const number = finiteNumber(value, 0);
 if (number > 0) return "positive";
 if (number < 0) return "negative";
 return "neutral";
}
function finiteNumber(value, fallback) {
 return Number.isFinite(value) ? value : fallback;
}
function positiveNumber(value, fallback) {
 return Number.isFinite(value) && value > 0 ? value : fallback;
}
function clamp(value, min, max) {
 return Math.min(max, Math.max(min, value));
}
function trimNumber(value, digits) {
 const number = finiteNumber(value, 0);
 return Number(number.toFixed(digits)).toString();
}
function roundedRect(ctx, x, y, width, height, radius) {
 const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
 ctx.moveTo(x + r, y);
 ctx.lineTo(x + width - r, y);
 ctx.quadraticCurveTo(x + width, y, x + width, y + r);
 ctx.lineTo(x + width, y + height - r);
 ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
 ctx.lineTo(x + r, y + height);
 ctx.quadraticCurveTo(x, y + height, x, y + height - r);
 ctx.lineTo(x, y + r);
 ctx.quadraticCurveTo(x, y, x + r, y);
}
function defaultRiskHeight(entryPrice) {
 const price = positiveNumber(finiteNumber(entryPrice, 0), 1);
 return Math.max(1, price * (DEFAULT_RISK_PERCENT / 100));
}
function percentHeight(entryPrice, percent) {
 const price = positiveNumber(finiteNumber(entryPrice, 0), 1);
 const safePercent = positiveNumber(finiteNumber(percent, DEFAULT_RISK_PERCENT), DEFAULT_RISK_PERCENT);
 return Math.max(1, price * (safePercent / 100));
}
function refreshRiskBlockPrices(block) {
 const rewardRatio = positiveNumber(finiteNumber(block.rewardRatio, DEFAULT_REWARD_RATIO), DEFAULT_REWARD_RATIO);
 const riskRatio = positiveNumber(finiteNumber(block.riskRatio, DEFAULT_RISK_RATIO), DEFAULT_RISK_RATIO);
 const entryPrice = positiveNumber(finiteNumber(block.entryPrice, 0), 1);
 const direction = block.direction === "SHORT" ? "SHORT" : "LONG";
 const riskHeight = percentHeight(entryPrice, riskRatio);
 const rewardHeight = percentHeight(entryPrice, rewardRatio);
 const rewardRiskRatio = rewardRatio / riskRatio;
 block.entryPrice = entryPrice;
 block.direction = direction;
 block.entryX = finiteNumber(block.entryX, finiteNumber(block.entryTime, 0));
 block.entryTime = block.entryX;
 block.width = clamp(finiteNumber(block.width, DEFAULT_RISK_BLOCK_WIDTH), MIN_RISK_BLOCK_WIDTH, CANDLE_LOAD_LIMIT);
 block.riskHeight = riskHeight;
 block.rewardHeight = rewardHeight;
 block.rewardRatio = rewardRatio;
 block.riskRatio = riskRatio;
 block.rewardRiskRatio = rewardRiskRatio;
 block.stopLossPrice = Math.max(0, direction === "SHORT" ? entryPrice + block.riskHeight : entryPrice - block.riskHeight);
 block.takeProfitPrice = Math.max(0, direction === "SHORT" ? entryPrice - block.rewardHeight : entryPrice + block.rewardHeight);
 return block;
}
function formatRatioPair(rewardRatio, riskRatio) {
 return `${formatRatioValue(rewardRatio)}:${formatRatioValue(riskRatio)}`;
}
function formatRatioValue(value) {
 const number = positiveNumber(finiteNumber(value, 0), 0);
 return Number(number.toFixed(2)).toString();
}
function formatNumber(value, maxDigits) {
 return finiteNumber(value, 0).toLocaleString("ko-KR", {
   maximumFractionDigits: maxDigits,
   minimumFractionDigits: 0
 });
}
function formatKrw(value, maxDigits) {
 return `${formatNumber(value, maxDigits || 0)}원`;
}
function formatUsdt(value, maxDigits = 2) {
 return `${formatNumber(value, maxDigits)} USDT`;
}
function formatUsd(value, maxDigits = 2) {
 return `$${formatNumber(value, maxDigits)}`;
}
function formatCoin(value) {
 return finiteNumber(value, 0).toLocaleString("ko-KR", {
   maximumFractionDigits: 8,
   minimumFractionDigits: 0
 });
}
function formatBtc(value) {
 return formatCoin(value);
}
function formatSignedKrw(value) {
 const number = finiteNumber(value, 0);
 const prefix = number > 0 ? "+" : "";
 return `${prefix}${formatKrw(number, 0)}`;
}
function formatSignedUsdt(value) {
 const number = finiteNumber(value, 0);
 const prefix = number > 0 ? "+" : "";
 return `${prefix}${formatUsdt(number, 2)}`;
}
function formatSignedPercent(value) {
 const number = finiteNumber(value, 0);
 const prefix = number > 0 ? "+" : "";
 return `${prefix}${number.toFixed(2)}%`;
}
function formatOptionalSignedPercent(value) {
 return Number.isFinite(value) ? formatSignedPercent(value) : "-";
}
function formatDateTime(value) {
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "-";
 const parts = getKstDateParts(date);
 return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
function formatCandleTime(seconds) {
 const date = new Date(seconds * 1000);
 const parts = getKstDateParts(date);
 return `${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
function getKstDateParts(date) {
 const formatter = new Intl.DateTimeFormat("en-US", {
   timeZone: KST_TIME_ZONE,
   year: "numeric",
   month: "2-digit",
   day: "2-digit",
   hour: "2-digit",
   minute: "2-digit",
   hourCycle: "h23"
 });
 const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
 return {
   year: parts.year,
   month: parts.month,
   day: parts.day,
   hour: parts.hour,
   minute: parts.minute
 };
}
function csvCell(value) {
 return `"${String(value ?? "").replace(/"/g, '""')}"`;
}
function escapeHtml(value) {
 return String(value ?? "")
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
}
function priceToY(metrics, price) {
 const ratio = (metrics.maxPrice - price) / (metrics.maxPrice - metrics.minPrice);
 return metrics.plot.y + ratio * metrics.plot.h;
}
function yToPrice(metrics, y) {
 const ratio = clamp((y - metrics.plot.y) / metrics.plot.h, 0, 1);
 return metrics.maxPrice - ratio * (metrics.maxPrice - metrics.minPrice);
}
function xForIndex(metrics, index) {
 return metrics.plot.x + (index + 0.5) * metrics.barSpace;
}
function xForTime(metrics, time) {
 const index = indexForTime(metrics, time);
 return xForIndex(metrics, index);
}
function indexForTime(metrics, time) {
 const candles = metrics.candles || [];
 if (!candles.length) return 0;
 const unitSeconds = metrics.unitSeconds || timeframeSeconds(state.timeframe);
 if (time <= candles[0].time) return (time - candles[0].time) / unitSeconds;
 const lastIndex = candles.length - 1;
 const last = candles[lastIndex];
 if (time >= last.time) return lastIndex + (time - last.time) / unitSeconds;
 for (let i = 1; i < candles.length; i += 1) {
   const previous = candles[i - 1];
   const next = candles[i];
   if (time === next.time) return i;
   if (time < next.time) {
     const span = Math.max(1, next.time - previous.time);
     return (i - 1) + clamp((time - previous.time) / span, 0, 1);
   }
 }
 return lastIndex;
}
function xToTime(metrics, x) {
 const first = metrics.firstTime || (metrics.candles[0] ? metrics.candles[0].time : 0);
 const index = (x - metrics.plot.x) / metrics.barSpace - 0.5;
 return first + index * (metrics.unitSeconds || timeframeSeconds(state.timeframe));
}
function alignToTimeframe(timestampSeconds) {
 const unitSeconds = timeframeSeconds(state.timeframe);
 return Math.floor(timestampSeconds / unitSeconds) * unitSeconds;
}
function buyMarkerTimeForCandles(trade, candles) {
 if (!Array.isArray(candles) || !candles.length) return null;
 const rawTime = Math.floor(new Date(trade && trade.createdAt).getTime() / 1000);
 if (!Number.isFinite(rawTime)) return null;
 const alignedTime = alignToTimeframe(rawTime);
 const firstTime = candles[0].time;
 const lastTime = candles[candles.length - 1].time;
 if (!Number.isFinite(firstTime) || !Number.isFinite(lastTime) || alignedTime < firstTime) return null;
 return Math.min(alignedTime, lastTime);
}
function isInsidePlot(metrics, x, y) {
 return x >= metrics.plot.x && x <= metrics.plot.x + metrics.plot.w && y >= metrics.plot.y && y <= metrics.plot.y + metrics.plot.h;
}
function isEditableTarget(target) {
 return Boolean(target && target.closest && target.closest("input, textarea, select, [contenteditable='true']"));
}
function distanceToSegment(px, py, x1, y1, x2, y2) {
 const dx = x2 - x1;
 const dy = y2 - y1;
 if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
 const t = clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy), 0, 1);
 const x = x1 + t * dx;
 const y = y1 + t * dy;
 return Math.hypot(px - x, py - y);
}
})();
