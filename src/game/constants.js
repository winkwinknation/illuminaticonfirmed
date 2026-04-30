export const SAVE_VERSION = 2;

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
