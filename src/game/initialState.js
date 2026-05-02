import { BASE_MAX_HP, SAVE_VERSION } from './constants';

export const makeNewGame = (now = Date.now()) => ({
  saveVersion: SAVE_VERSION,
  createdAt: now,
  lastSavedAt: now,
  playtimeMs: 0,

  hp: BASE_MAX_HP,
  faith: 0,
  money: 0,
  knowledge: 0,

  totalMoneyEarned: 0,
  totalFaithEarned: 0,
  totalKnowledgeEarned: 0,
  totalSacrifices: 0,
  totalMissions: 0,

  upgrades: {},
  members: {},
  runningMissions: {},
  autoTimers: {},

  prestigeLevel: 0,
  secretKnowledge: 0,
  totalSkEarned: 0,
  boons: {},
  unlockedLore: {},

  // Order tab is paid for once with knowledge; persists across prestige.
  orderUnlocked: false,
  // Tutorial step (0 = just started, advances as the player completes each
  // guided action). 99 = finished/skipped. Persists across prestige.
  tutorialStep: 0,
  // One-shot tutorial flags for tabs that unlock long after the main tutorial.
  orderTutorialDone: false,
  rivalryTutorialDone: false,

  // Rivalry: in-flight missions and recent resolutions. Lifetime stats.
  runningRivalry: {},
  rivalryLog: [],
  totalRivalryWins: 0,
  totalRivalryLosses: 0,
  totalSoldiersLost: 0,
  totalSpiesLost: 0,
  totalEnginesLost: 0,

  // Sacrifice streak (compulsion-loop multiplier).
  streak: 0,
  lastSacrificeAt: 0,

  // Sigil random event. nextSpawnAt is wall-clock ms.
  sigil: null,             // { spawnedAt, expiresAt, kind } | null
  nextSigilAt: now + 60_000, // first sigil ~1 min in (lazily updated by tick)

  lastOfflineSummary: null,
});

export const makeNewGameWithBoons = (carryOver, now = Date.now()) => ({
  ...makeNewGame(now),
  prestigeLevel: carryOver.prestigeLevel,
  secretKnowledge: carryOver.secretKnowledge,
  totalSkEarned: carryOver.totalSkEarned,
  boons: carryOver.boons,
  unlockedLore: carryOver.unlockedLore,
  createdAt: carryOver.createdAt,
  playtimeMs: carryOver.playtimeMs,
  // Intentionally NOT carrying orderUnlocked — each prestige requires re-paying
  // the knowledge cost to inaugurate the Order again, which keeps the Order
  // and Rivals tabs as a meaningful mid-run milestone every cycle.
  orderUnlocked: false,
  tutorialStep: carryOver.tutorialStep,
  orderTutorialDone: carryOver.orderTutorialDone,
  rivalryTutorialDone: carryOver.rivalryTutorialDone,
});
