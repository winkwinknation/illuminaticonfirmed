export const SAVE_VERSION = 4;

export const TICK_MS = 100;
export const AUTOSAVE_MS = 3000;
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
export const OFFLINE_NOTIFY_MIN_MS = 30 * 1000;

export const SLOT_COUNT = 4;
export const META_KEY = 'illuminati_meta';
export const slotKey = (i) => `illuminati_save_${i}`;

export const COST_GROWTH = 1.15;
export const MEMBER_COST_GROWTH = 1.22;

export const BASE_MAX_HP = 100;
export const BASE_HP_REGEN = 1;
export const SACRIFICE_HP_COST = 25;

// Tuned so a hands-on first prestige takes ~60+ minutes.
export const PRESTIGE_MONEY_BASE = 50000;
export const PRESTIGE_FAITH_BASE = 2000;
export const PRESTIGE_KNOWLEDGE_BASE = 250;
export const PRESTIGE_MONEY_GROWTH = 9;
export const PRESTIGE_FAITH_GROWTH = 5;
export const PRESTIGE_KNOWLEDGE_GROWTH = 4;
export const SK_DIVISOR = 25000;

export const REVEAL_BOON_BASE_COST = 2;
export const REVEAL_BOON_GROWTH = 2;

export const AUTOMATION_TICK_MS = 500;

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
