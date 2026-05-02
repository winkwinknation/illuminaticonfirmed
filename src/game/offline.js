// Offline simulation of active member behaviors.
// Called from APPLY_OFFLINE — turns elapsed wall-clock time into
// batched resource changes equivalent to the work members would have done.
//
// Multipliers (faith/money/knowledge bonuses, mission rewards, etc.) are
// frozen at the start of the offline period. We don't simulate the player
// recursively buying upgrades and re-buffing themselves mid-period — that
// would require fine-grained ticking and isn't worth the cost.

import { MEMBERS } from '../data/members';
import { MISSIONS_BY_ID } from '../data/missions';
import { UPGRADES, UPGRADES_BY_ID } from '../data/upgrades';
import { SACRIFICE_HP_COST } from './constants';
import {
  canAffordUpgrade,
  hpRegenPerSec,
  maxHp,
  missionDurationMs,
  missionRewardFaith,
  missionRewardKnowledge,
  missionRewardMoney,
  sacrificeFaithGain,
  upgradeCost,
} from './selectors';

const memberOwned = (state, id) => (state.members || {})[id] || 0;

/**
 * Pre-computes how much active members would have produced over `dtMs`.
 * Returns aggregate deltas, not a new state — caller applies them.
 */
export const computeActiveMemberWork = (state, dtMs) => {
  const dtSec = dtMs / 1000;
  const cap = maxHp(state);
  const regen = hpRegenPerSec(state);
  let hpBudget = Math.min(cap, state.hp) + regen * dtSec;
  let faithRunning = state.faith;

  let sacrifices = 0;
  let faithFromSacs = 0;
  let hpFromSacs = 0;

  for (const m of MEMBERS) {
    if (m.behavior?.kind !== 'autoSacrifice') continue;
    const owned = memberOwned(state, m.id);
    if (!owned) continue;
    const minHp = m.behavior.minHpFraction != null ? cap * m.behavior.minHpFraction : 0;
    if (state.hp < minHp) continue;
    const intervalSec = (m.behavior.intervalMs / 1000) / owned;
    if (intervalSec <= 0) continue;
    const maxByTime = Math.floor(dtSec / intervalSec);
    const maxByHp = Math.floor(hpBudget / SACRIFICE_HP_COST);
    const num = Math.min(maxByTime, Math.max(0, maxByHp));
    if (num <= 0) continue;
    const faithPer = sacrificeFaithGain(state);
    sacrifices += num;
    faithFromSacs += num * faithPer;
    hpFromSacs += SACRIFICE_HP_COST * num;
    hpBudget -= SACRIFICE_HP_COST * num;
  }
  faithRunning += faithFromSacs;

  let missionMoney = 0;
  let missionKnowledge = 0;
  let missionFaithReward = 0;
  let missionFaithCost = 0;
  let missionHpDrain = 0;
  let missionRuns = 0;

  for (const m of MEMBERS) {
    if (m.behavior?.kind !== 'autoMission') continue;
    const owned = memberOwned(state, m.id);
    if (!owned) continue;
    const mission = MISSIONS_BY_ID[m.behavior.missionId];
    if (!mission) continue;
    const minHp = m.behavior.minHpFraction != null ? cap * m.behavior.minHpFraction : 0;
    if (state.hp < minHp) continue;
    const durationSec = missionDurationMs(state, mission) / 1000;
    if (durationSec <= 0) continue;

    const maxByTime = Math.floor((dtSec * owned) / durationSec);
    const faithCostPerRun = mission.cost.faith || 0;
    const hpCostPerRun = mission.cost.hpFraction
      ? Math.ceil(Math.min(cap, state.hp) * mission.cost.hpFraction)
      : 0;

    const maxByFaith = faithCostPerRun > 0
      ? Math.floor(faithRunning / faithCostPerRun)
      : maxByTime;
    const maxByHp = hpCostPerRun > 0
      ? Math.floor(hpBudget / hpCostPerRun)
      : maxByTime;

    const num = Math.min(maxByTime, Math.max(0, maxByFaith), Math.max(0, maxByHp));
    if (num <= 0) continue;

    const moneyPer = missionRewardMoney(state, mission);
    const knowPer = missionRewardKnowledge(state, mission);
    const faithRewPer = missionRewardFaith(state, mission);

    missionMoney += moneyPer * num;
    missionKnowledge += knowPer * num;
    missionFaithReward += faithRewPer * num;
    missionFaithCost += faithCostPerRun * num;
    missionHpDrain += hpCostPerRun * num;
    missionRuns += num;

    hpBudget -= hpCostPerRun * num;
    faithRunning = faithRunning + (faithRewPer - faithCostPerRun) * num;
  }

  return {
    sacrifices,
    faithFromSacs,
    hpFromSacs,
    missionMoney,
    missionKnowledge,
    missionFaithReward,
    missionFaithCost,
    missionHpDrain,
    missionRuns,
  };
};

/**
 * Apply pre-computed active-member work deltas to a state that has already
 * had its passive time delta applied. Subtracts HP drain (after regen),
 * clamps faith / money / knowledge appropriately.
 */
export const applyActiveMemberWork = (state, work, capHp) => {
  const totalHpDrain = work.hpFromSacs + work.missionHpDrain;
  const newHp = Math.max(0, Math.min(capHp, state.hp - totalHpDrain));
  const totalFaith = state.faith + work.faithFromSacs + work.missionFaithReward - work.missionFaithCost;
  return {
    ...state,
    hp: newHp,
    faith: Math.max(0, totalFaith),
    money: state.money + work.missionMoney,
    knowledge: state.knowledge + work.missionKnowledge,
    totalFaithEarned: state.totalFaithEarned + work.faithFromSacs + Math.max(0, work.missionFaithReward),
    totalMoneyEarned: state.totalMoneyEarned + work.missionMoney,
    totalKnowledgeEarned: (state.totalKnowledgeEarned || 0) + work.missionKnowledge,
    totalSacrifices: state.totalSacrifices + work.sacrifices,
    totalMissions: state.totalMissions + work.missionRuns,
  };
};

/**
 * Iteratively buys the cheapest affordable upgrade for each Steward-equivalent
 * member. Bounded by elapsed time / member interval.
 */
export const simulateOfflineUpgradeBuying = (state, dtMs) => {
  let s = state;
  const dtSec = dtMs / 1000;

  for (const m of MEMBERS) {
    if (m.behavior?.kind !== 'autoBuyUpgrade') continue;
    const owned = memberOwned(s, m.id);
    if (!owned) continue;
    const intervalSec = (m.behavior.intervalMs / 1000) / owned;
    if (intervalSec <= 0) continue;
    const maxAttempts = Math.floor(dtSec / intervalSec);

    for (let i = 0; i < maxAttempts; i++) {
      let bestId = null;
      let bestScore = Infinity;
      for (const u of UPGRADES) {
        if (!canAffordUpgrade(s, u)) continue;
        const c = upgradeCost(s, u);
        const score = (c.money || 0) + (c.faith || 0) * 10 + (c.knowledge || 0) * 25;
        if (score < bestScore) {
          bestScore = score;
          bestId = u.id;
        }
      }
      if (!bestId) break;
      const upgrade = UPGRADES_BY_ID[bestId];
      const cost = upgradeCost(s, upgrade);
      const ownedUp = s.upgrades[bestId] || 0;
      s = {
        ...s,
        money: cost.money ? s.money - cost.money : s.money,
        faith: cost.faith ? s.faith - cost.faith : s.faith,
        knowledge: cost.knowledge ? s.knowledge - cost.knowledge : s.knowledge,
        upgrades: { ...s.upgrades, [bestId]: ownedUp + 1 },
      };
    }
  }
  return s;
};

/**
 * Returns a summary string the offline modal can show, e.g.
 * "+15 sacrifices, +24 missions, 3 upgrades acquired."
 */
export const summarizeWork = (work, upgradesBoughtCount) => {
  const parts = [];
  if (work.sacrifices > 0) parts.push(`${work.sacrifices} sacrifice${work.sacrifices === 1 ? '' : 's'}`);
  if (work.missionRuns > 0) parts.push(`${work.missionRuns} mission${work.missionRuns === 1 ? '' : 's'}`);
  if (upgradesBoughtCount > 0) parts.push(`${upgradesBoughtCount} upgrade${upgradesBoughtCount === 1 ? '' : 's'} acquired`);
  return parts.join(' · ');
};
