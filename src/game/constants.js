export const SAVE_VERSION = 6;

export const TICK_MS = 100;
export const AUTOSAVE_MS = 3000;
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
export const OFFLINE_NOTIFY_MIN_MS = 30 * 1000;

export const SLOT_COUNT = 4;
export const META_KEY = 'illuminati_meta';
export const slotKey = (i) => `illuminati_save_${i}`;

// --- Scaling constants ---
//
// Tuned for tight, dopamine-rich pacing borrowed from later-generation
// incremental designs (Antimatter Dimensions, NGU, Trimps): low cost growth
// so the player buys constantly, paired with strong per-level effect boosts
// so each purchase visibly accelerates the numbers. Cookie Clicker's 1.15
// growth is too lean for keeping the always-something-to-buy loop alive.
export const COST_GROWTH = 1.08;
export const MEMBER_COST_GROWTH = 1.13;

// Tutorial step ids. 99 == finished/skipped.
export const TUTORIAL = {
  WELCOME: 0,
  SACRIFICE: 1,
  GO_SOCIETY: 2,
  START_MISSION: 3,
  GO_SHOP: 4,
  BUY_UPGRADE: 5,
  CLOSING: 6,
  DONE: 99,
};

// One-time knowledge cost to inaugurate the Order tab.
// Sized as a real milestone — the player should have spent meaningful time
// running rumor missions and probably bought a couple of speech upgrades by
// the time they can afford it.
export const ORDER_UNLOCK_KNOWLEDGE_COST = 100;

export const BASE_MAX_HP = 100;
// Faster regen + cheaper sacrifice ⇒ tighter blood-loop. The old 25 HP at
// 1 HP/s meant 25 s between sacrifices for someone without upgrades; the new
// 20 HP at 1.5 HP/s gives ~13 s and fuels the streak system below.
export const BASE_HP_REGEN = 1.5;
export const SACRIFICE_HP_COST = 20;

// Prestige thresholds — first ascension within ~15 minutes for a focused
// player, with subsequent runs scaling on a gentler curve so the layer is
// reached often. SK_DIVISOR drops so each prestige is felt: ~1–4 SK on the
// first run, growing meaningfully thereafter.
export const PRESTIGE_MONEY_BASE = 8000;
export const PRESTIGE_FAITH_BASE = 400;
export const PRESTIGE_KNOWLEDGE_BASE = 80;
export const PRESTIGE_MONEY_GROWTH = 4;
export const PRESTIGE_FAITH_GROWTH = 3;
export const PRESTIGE_KNOWLEDGE_GROWTH = 2.5;
export const SK_DIVISOR = 5000;

export const REVEAL_BOON_BASE_COST = 2;
export const REVEAL_BOON_GROWTH = 2;

export const AUTOMATION_TICK_MS = 500;

// --- Streak (sacrifice chain) ---
// Sacrifices within STREAK_WINDOW_MS extend a stack up to STREAK_MAX. Each
// stack adds STREAK_PER_STACK to faith-per-sacrifice multiplier. Stack drops
// to 0 if no sacrifice within STREAK_DECAY_MS — fear-of-loss is the engine.
export const STREAK_WINDOW_MS = 3500;
export const STREAK_DECAY_MS = 5500;
export const STREAK_MAX = 20;
export const STREAK_PER_STACK = 0.05;

// --- Sigil events (Golden-Cookie analogue) ---
// Periodically a sigil appears in the corner. Clicking it grants a burst of
// resources sized as a fraction of recent income so it scales endlessly with
// the player's progression. Spawn cadence is randomised within bounds.
export const SIGIL_SPAWN_MIN_MS = 90 * 1000;
export const SIGIL_SPAWN_MAX_MS = 240 * 1000;
export const SIGIL_LIFETIME_MS = 18 * 1000;
// "Income burst" = N seconds of current passive + last-mission rewards.
export const SIGIL_PASSIVE_SECONDS = 90;
export const SIGIL_MIN_FAITH = 25;
export const SIGIL_MIN_MONEY = 60;
export const SIGIL_MIN_KNOWLEDGE = 5;

// "Watch the Order's Message" — in-game propaganda gate that pays out a
// multiplied sigil reward in exchange for waiting through a fake ad. Pure
// flavor; there is no real ad network. The pattern is borrowed from mobile
// rewarded-video designs because the commit→wait→payoff loop is sticky.
export const SIGIL_AD_DURATION_MS = 10_000;
export const SIGIL_AD_MULTIPLIER = 3;
