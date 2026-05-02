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
  orderUnlocked: carryOver.orderUnlocked,
  tutorialStep: carryOver.tutorialStep,
});
