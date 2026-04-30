import {
  COST_GROWTH,
  PRESTIGE_FAITH_BASE,
  PRESTIGE_FAITH_GROWTH,
  PRESTIGE_KNOWLEDGE_BASE,
  PRESTIGE_KNOWLEDGE_GROWTH,
  PRESTIGE_MONEY_BASE,
  PRESTIGE_MONEY_GROWTH,
  REVEAL_BOON_BASE_COST,
  REVEAL_BOON_GROWTH,
  SK_DIVISOR,
} from './constants';

export const costAt = (base, owned) => Math.ceil(base * Math.pow(COST_GROWTH, owned));

export const memberCostAt = (base, owned, growth) =>
  Math.ceil(base * Math.pow(growth, owned));

export const prestigeMoneyThreshold = (level) =>
  PRESTIGE_MONEY_BASE * Math.pow(PRESTIGE_MONEY_GROWTH, level);

export const prestigeFaithThreshold = (level) =>
  PRESTIGE_FAITH_BASE * Math.pow(PRESTIGE_FAITH_GROWTH, level);

export const prestigeKnowledgeThreshold = (level) =>
  PRESTIGE_KNOWLEDGE_BASE * Math.pow(PRESTIGE_KNOWLEDGE_GROWTH, level);

export const skFromTotalMoney = (totalMoney) =>
  Math.max(0, Math.floor(Math.sqrt(totalMoney / SK_DIVISOR)));

export const revealBoonCost = (alreadyRevealed) =>
  Math.ceil(REVEAL_BOON_BASE_COST * Math.pow(REVEAL_BOON_GROWTH, alreadyRevealed));

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
