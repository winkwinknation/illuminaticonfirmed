import { BOONS_BY_ID } from '../data/boons';
import {
  APPLY_OFFLINE,
  AUTO_FIRE,
  BUY_BOON,
  BUY_UPGRADE,
  CLEAR_RIVALRY_LOG,
  COMPLETE_ORDER_TUTORIAL,
  COMPLETE_RIVALRY_TUTORIAL,
  COMPLETE_TUTORIAL,
  DISMISS_RIVALRY_RESULT,
  LOAD_GAME,
  PRESTIGE,
  RECRUIT_MEMBER,
  RESET,
  RESOLVE_MISSIONS,
  RESOLVE_RIVALRY_MISSIONS,
  REVEAL_BOON,
  SACRIFICE,
  SACRIFICE_MEMBER,
  SET_TUTORIAL_STEP,
  STAMP_SAVED,
  START_MISSION,
  START_RIVALRY_MISSION,
  TICK,
  UNLOCK_LORE,
  UNLOCK_ORDER,
} from './actions';
import { ORDER_UNLOCK_KNOWLEDGE_COST, TUTORIAL } from './constants';
import { RIVALRY_MISSIONS_BY_ID } from '../data/rivalryMissions';
import { clamp, revealBoonCost } from './formulas';
import { makeNewGame, makeNewGameWithBoons } from './initialState';
import {
  applyActiveMemberWork,
  computeActiveMemberWork,
  simulateOfflineUpgradeBuying,
} from './offline';
import {
  boonCost,
  canAffordBoon,
  canAffordMember,
  canAffordMission,
  canAffordRivalry,
  canAffordUpgrade,
  canPrestige,
  getBoon,
  getMember,
  getMission,
  getUpgrade,
  isMissionRunning,
  maxHp,
  memberCost,
  memberSacrificeFaith,
  missionDurationMs,
  missionRewardFaith,
  missionRewardKnowledge,
  missionRewardMoney,
  passiveFaithPerSec,
  passiveKnowledgePerSec,
  passiveMoneyPerSec,
  hpRegenPerSec,
  revealedBoonCount,
  sacrificeFaithGain,
  sacrificeHpCost,
  skGainOnPrestige,
  startFaithBonus,
  startMoneyBonus,
  unrevealedBoonIds,
  upgradeCost,
} from './selectors';

const countUpgrades = (obj) => {
  let n = 0;
  for (const v of Object.values(obj || {})) n += v || 0;
  return n;
};

const applyTimeDelta = (state, dtMs) => {
  const dt = dtMs / 1000;
  const cap = maxHp(state);
  const regen = hpRegenPerSec(state) * dt;
  const newHp = clamp(state.hp + regen, 0, cap);

  const dFaith = passiveFaithPerSec(state) * dt;
  const dMoney = passiveMoneyPerSec(state) * dt;
  const dKnow = passiveKnowledgePerSec(state) * dt;

  return {
    ...state,
    hp: newHp,
    faith: state.faith + dFaith,
    money: state.money + dMoney,
    knowledge: state.knowledge + dKnow,
    totalFaithEarned: state.totalFaithEarned + dFaith,
    totalMoneyEarned: state.totalMoneyEarned + dMoney,
    totalKnowledgeEarned: (state.totalKnowledgeEarned || 0) + dKnow,
    playtimeMs: state.playtimeMs + dtMs,
  };
};

const subtractCost = (state, cost) => ({
  ...state,
  money: cost.money ? state.money - cost.money : state.money,
  faith: cost.faith ? state.faith - cost.faith : state.faith,
  knowledge: cost.knowledge ? state.knowledge - cost.knowledge : state.knowledge,
});

const resolveDueMissions = (state, now = Date.now()) => {
  const running = state.runningMissions || {};
  const ids = Object.keys(running);
  if (ids.length === 0) return state;
  let next = state;
  let changed = false;
  let nextRunning = running;
  let totalMissions = state.totalMissions;
  for (const id of ids) {
    const run = running[id];
    if (!run || run.endsAt > now) continue;
    const m = getMission(id);
    if (!m) {
      if (!changed) { nextRunning = { ...running }; changed = true; }
      delete nextRunning[id];
      continue;
    }
    const moneyGain = missionRewardMoney(next, m);
    const knowGain = missionRewardKnowledge(next, m);
    const faithGain = missionRewardFaith(next, m);
    next = {
      ...next,
      money: next.money + moneyGain,
      faith: next.faith + faithGain,
      knowledge: next.knowledge + knowGain,
      totalMoneyEarned: next.totalMoneyEarned + moneyGain,
      totalFaithEarned: next.totalFaithEarned + faithGain,
      totalKnowledgeEarned: (next.totalKnowledgeEarned || 0) + knowGain,
    };
    totalMissions += 1;
    if (!changed) { nextRunning = { ...running }; changed = true; }
    delete nextRunning[id];
  }
  if (!changed) return state;
  return { ...next, runningMissions: nextRunning, totalMissions };
};

const randInt = (min, max) => {
  if (min === max) return min;
  return Math.floor(min + Math.random() * (max - min + 1));
};

const decrementMember = (members, id, n) => {
  const cur = members[id] || 0;
  const next = Math.max(0, cur - n);
  const out = { ...members };
  if (next <= 0) delete out[id];
  else out[id] = next;
  return out;
};

const incrementMember = (members, id, n) => {
  if (!n) return members;
  const cur = members[id] || 0;
  return { ...members, [id]: cur + n };
};

const RIVALRY_LOG_MAX = 20;

const startRivalryMission = (state, mission) => {
  if ((state.runningRivalry || {})[mission.id]) return state;
  if (!canAffordRivalry(state, mission)) return state;
  const need = (mission.cost && mission.cost.units) || {};
  // Reserve units up-front by removing them from the member pool. Survivors
  // are added back when the mission resolves; lost units stay deducted.
  let members = state.members || {};
  const committed = {};
  for (const id of Object.keys(need)) {
    const n = need[id];
    members = decrementMember(members, id, n);
    committed[id] = n;
  }
  return {
    ...state,
    members,
    runningRivalry: {
      ...(state.runningRivalry || {}),
      [mission.id]: {
        startedAt: Date.now(),
        endsAt: Date.now() + mission.durationMs,
        units: committed,
      },
    },
  };
};

const resolveRivalryMission = (state, mission, run, now) => {
  const success = Math.random() < (mission.successChance ?? 0.5);
  const committed = run.units || {};
  let members = state.members || {};

  let moneyGain = 0;
  let faithGain = 0;
  let knowledgeGain = 0;
  let hpDrain = 0;
  const lossesApplied = { soldier: 0, spy: 0, war_engine: 0 };

  if (success) {
    // Return all committed units to the pool, then layer rewards.
    for (const id of Object.keys(committed)) {
      members = incrementMember(members, id, committed[id]);
    }
    const r = mission.rewardOnSuccess || {};
    if (r.money) moneyGain = randInt(r.money[0], r.money[1]);
    if (r.faith) faithGain = randInt(r.faith[0], r.faith[1]);
    if (r.knowledge) knowledgeGain = randInt(r.knowledge[0], r.knowledge[1]);
  } else {
    // Compute losses (clamped to what was actually committed); survivors return.
    const lossSpec = mission.losses || {};
    for (const id of Object.keys(committed)) {
      const sent = committed[id];
      const range = lossSpec[id];
      const lost = range ? Math.min(sent, randInt(range[0], range[1])) : 0;
      const survivors = sent - lost;
      lossesApplied[id] = lost;
      if (survivors > 0) members = incrementMember(members, id, survivors);
    }
    if (mission.kind === 'espionage' && mission.hpDrainOnFail) {
      hpDrain = randInt(mission.hpDrainOnFail[0], mission.hpDrainOnFail[1]);
    }
  }

  const cap = maxHp({ ...state, members });
  const nextHp = Math.max(0, Math.min(cap, state.hp - hpDrain));

  const entry = {
    id: `${mission.id}_${now}`,
    missionId: mission.id,
    missionName: mission.name,
    rivalId: mission.rivalId,
    kind: mission.kind,
    success,
    rewards: { money: moneyGain, faith: faithGain, knowledge: knowledgeGain },
    losses: lossesApplied,
    hpDrain,
    at: now,
  };

  const log = [entry, ...(state.rivalryLog || [])].slice(0, RIVALRY_LOG_MAX);
  const nextRunning = { ...(state.runningRivalry || {}) };
  delete nextRunning[mission.id];

  return {
    ...state,
    members,
    hp: nextHp,
    money: state.money + moneyGain,
    faith: state.faith + faithGain,
    knowledge: state.knowledge + knowledgeGain,
    totalMoneyEarned: state.totalMoneyEarned + moneyGain,
    totalFaithEarned: state.totalFaithEarned + faithGain,
    totalKnowledgeEarned: (state.totalKnowledgeEarned || 0) + knowledgeGain,
    totalRivalryWins: (state.totalRivalryWins || 0) + (success ? 1 : 0),
    totalRivalryLosses: (state.totalRivalryLosses || 0) + (success ? 0 : 1),
    totalSoldiersLost: (state.totalSoldiersLost || 0) + lossesApplied.soldier,
    totalSpiesLost: (state.totalSpiesLost || 0) + lossesApplied.spy,
    totalEnginesLost: (state.totalEnginesLost || 0) + lossesApplied.war_engine,
    runningRivalry: nextRunning,
    rivalryLog: log,
  };
};

const resolveDueRivalryMissions = (state, now = Date.now()) => {
  const running = state.runningRivalry || {};
  const ids = Object.keys(running);
  if (ids.length === 0) return state;
  let next = state;
  for (const id of ids) {
    const run = (next.runningRivalry || {})[id];
    if (!run || run.endsAt > now) continue;
    const mission = RIVALRY_MISSIONS_BY_ID[id];
    if (!mission) {
      const nextRunning = { ...(next.runningRivalry || {}) };
      delete nextRunning[id];
      next = { ...next, runningRivalry: nextRunning };
      continue;
    }
    next = resolveRivalryMission(next, mission, run, now);
  }
  return next;
};

const startMission = (state, mission) => {
  if (isMissionRunning(state, mission)) return state;
  if (!canAffordMission(state, mission)) return state;
  const hpCost = mission.cost.hpFraction ? Math.ceil(state.hp * mission.cost.hpFraction) : 0;
  if (hpCost && state.hp <= hpCost) return state;
  const duration = missionDurationMs(state, mission);
  const nextStep = state.tutorialStep === TUTORIAL.START_MISSION ? TUTORIAL.GO_SHOP : state.tutorialStep;
  return {
    ...state,
    hp: Math.max(0, state.hp - hpCost),
    faith: state.faith - (mission.cost.faith || 0),
    runningMissions: {
      ...(state.runningMissions || {}),
      [mission.id]: { startedAt: Date.now(), endsAt: Date.now() + duration },
    },
    tutorialStep: nextStep,
  };
};

export const reducer = (state, action) => {
  switch (action.type) {
    case TICK: {
      const ticked = applyTimeDelta(state, action.dtMs);
      return resolveDueRivalryMissions(resolveDueMissions(ticked));
    }

    case APPLY_OFFLINE: {
      const dtSec = action.dtMs / 1000;
      // Capture passive rates at offline-start so multipliers don't drift.
      const passiveFaithGain = passiveFaithPerSec(state) * dtSec;
      const passiveMoneyGain = passiveMoneyPerSec(state) * dtSec;
      const passiveKnowGain = passiveKnowledgePerSec(state) * dtSec;
      // Active member work, also frozen to start-of-offline multipliers.
      const work = computeActiveMemberWork(state, action.dtMs);
      // Apply passive regen + passive income.
      let next = applyTimeDelta(state, action.dtMs);
      // Layer in active member work (resources gained, HP drained from costs).
      next = applyActiveMemberWork(next, work, maxHp(next));
      // Stewards iterate purchases on the resulting balance.
      const upgradesBefore = countUpgrades(next.upgrades);
      next = simulateOfflineUpgradeBuying(next, action.dtMs);
      const upgradesAfter = countUpgrades(next.upgrades);
      // Resolve any explicit player-started missions whose timers expired.
      next = resolveDueMissions(next);
      next = resolveDueRivalryMissions(next);
      const summary = {
        dtMs: action.dtMs,
        sacrifices: work.sacrifices,
        missions: work.missionRuns,
        upgradesBought: upgradesAfter - upgradesBefore,
        sacFaith: work.faithFromSacs,
        missionMoney: work.missionMoney,
        missionKnowledge: work.missionKnowledge,
        missionFaithNet: work.missionFaithReward - work.missionFaithCost,
        passiveFaith: passiveFaithGain,
        passiveMoney: passiveMoneyGain,
        passiveKnowledge: passiveKnowGain,
      };
      return { ...next, lastSavedAt: Date.now(), lastOfflineSummary: summary };
    }

    case RESOLVE_MISSIONS: {
      return resolveDueMissions(state, action.now);
    }

    case RESOLVE_RIVALRY_MISSIONS: {
      return resolveDueRivalryMissions(state, action.now);
    }

    case START_RIVALRY_MISSION: {
      const mission = RIVALRY_MISSIONS_BY_ID[action.id];
      if (!mission) return state;
      return startRivalryMission(state, mission);
    }

    case DISMISS_RIVALRY_RESULT: {
      const log = (state.rivalryLog || []).filter((e) => e.id !== action.entryId);
      return { ...state, rivalryLog: log };
    }

    case CLEAR_RIVALRY_LOG: {
      return { ...state, rivalryLog: [] };
    }

    case STAMP_SAVED: {
      return { ...state, lastSavedAt: action.now };
    }

    case SACRIFICE: {
      const hpCost = sacrificeHpCost(state);
      if (state.hp < hpCost) return state;
      const gain = sacrificeFaithGain(state);
      const nextStep = state.tutorialStep === TUTORIAL.SACRIFICE ? TUTORIAL.GO_SOCIETY : state.tutorialStep;
      return {
        ...state,
        hp: Math.max(0, state.hp - hpCost),
        faith: state.faith + gain,
        totalFaithEarned: state.totalFaithEarned + gain,
        totalSacrifices: state.totalSacrifices + 1,
        tutorialStep: nextStep,
      };
    }

    case SACRIFICE_MEMBER: {
      const member = getMember(action.id);
      if (!member) return state;
      const owned = (state.members || {})[member.id] || 0;
      if (owned <= 0) return state;
      const gain = memberSacrificeFaith(state, member);
      const nextMembers = { ...(state.members || {}) };
      if (owned - 1 <= 0) delete nextMembers[member.id];
      else nextMembers[member.id] = owned - 1;
      return {
        ...state,
        members: nextMembers,
        faith: state.faith + gain,
        totalFaithEarned: state.totalFaithEarned + gain,
      };
    }

    case BUY_UPGRADE: {
      const upgrade = getUpgrade(action.id);
      if (!upgrade) return state;
      if (!canAffordUpgrade(state, upgrade)) return state;
      const cost = upgradeCost(state, upgrade);
      const owned = state.upgrades[upgrade.id] || 0;
      const next = subtractCost(state, cost);
      const cappedHp = Math.min(next.hp, maxHp({ ...next, upgrades: { ...next.upgrades, [upgrade.id]: owned + 1 } }));
      const nextStep = state.tutorialStep === TUTORIAL.BUY_UPGRADE ? TUTORIAL.CLOSING : state.tutorialStep;
      return {
        ...next,
        hp: cappedHp,
        upgrades: { ...next.upgrades, [upgrade.id]: owned + 1 },
        tutorialStep: nextStep,
      };
    }

    case RECRUIT_MEMBER: {
      const member = getMember(action.id);
      if (!member) return state;
      if (!canAffordMember(state, member)) return state;
      const cost = memberCost(state, member);
      const owned = (state.members || {})[member.id] || 0;
      const next = subtractCost(state, cost);
      return {
        ...next,
        members: { ...(next.members || {}), [member.id]: owned + 1 },
      };
    }

    case START_MISSION: {
      const m = getMission(action.id);
      if (!m) return state;
      return startMission(state, m);
    }

    case AUTO_FIRE: {
      // Best-effort dispatcher used by automation hook for behaviors that aren't
      // simple enough to call existing actions directly.
      return state;
    }

    case PRESTIGE: {
      if (!canPrestige(state)) return state;
      const skGained = skGainOnPrestige(state);
      const carryOver = {
        prestigeLevel: state.prestigeLevel + 1,
        secretKnowledge: state.secretKnowledge + skGained,
        totalSkEarned: state.totalSkEarned + skGained,
        boons: state.boons,
        unlockedLore: state.unlockedLore,
        createdAt: state.createdAt,
        playtimeMs: state.playtimeMs,
        orderUnlocked: state.orderUnlocked,
        tutorialStep: state.tutorialStep,
        orderTutorialDone: state.orderTutorialDone,
        rivalryTutorialDone: state.rivalryTutorialDone,
      };
      const fresh = makeNewGameWithBoons(carryOver);
      return {
        ...fresh,
        money: fresh.money + startMoneyBonus(fresh),
        faith: fresh.faith + startFaithBonus(fresh),
      };
    }

    case REVEAL_BOON: {
      const pool = unrevealedBoonIds(state);
      if (pool.length === 0) return state;
      const cost = revealBoonCost(revealedBoonCount(state));
      if (state.secretKnowledge < cost) return state;
      const id = action.forcedId && pool.includes(action.forcedId)
        ? action.forcedId
        : pool[Math.floor(Math.random() * pool.length)];
      const boon = BOONS_BY_ID[id];
      return {
        ...state,
        secretKnowledge: state.secretKnowledge - cost,
        boons: { ...state.boons, [id]: 1 },
        unlockedLore: { ...state.unlockedLore, [boon.loreId]: true },
      };
    }

    case BUY_BOON: {
      const boon = getBoon(action.id);
      if (!boon) return state;
      if (!canAffordBoon(state, boon)) return state;
      const cost = boonCost(state, boon);
      const owned = state.boons[boon.id] || 0;
      return {
        ...state,
        secretKnowledge: state.secretKnowledge - cost,
        boons: { ...state.boons, [boon.id]: owned + 1 },
      };
    }

    case UNLOCK_LORE: {
      return { ...state, unlockedLore: { ...state.unlockedLore, [action.id]: true } };
    }

    case UNLOCK_ORDER: {
      if (state.orderUnlocked) return state;
      if ((state.knowledge || 0) < ORDER_UNLOCK_KNOWLEDGE_COST) return state;
      return {
        ...state,
        knowledge: state.knowledge - ORDER_UNLOCK_KNOWLEDGE_COST,
        orderUnlocked: true,
      };
    }

    case SET_TUTORIAL_STEP: {
      // Don't downgrade — tutorial only ever moves forward.
      const cur = state.tutorialStep ?? 0;
      const target = action.step;
      if (cur === TUTORIAL.DONE) return state;
      if (typeof target !== 'number' || target <= cur) return state;
      return { ...state, tutorialStep: target };
    }

    case COMPLETE_TUTORIAL: {
      if (state.tutorialStep === TUTORIAL.DONE) return state;
      return { ...state, tutorialStep: TUTORIAL.DONE };
    }

    case COMPLETE_ORDER_TUTORIAL: {
      if (state.orderTutorialDone) return state;
      return { ...state, orderTutorialDone: true };
    }

    case COMPLETE_RIVALRY_TUTORIAL: {
      if (state.rivalryTutorialDone) return state;
      return { ...state, rivalryTutorialDone: true };
    }

    case LOAD_GAME: {
      return action.state;
    }

    case RESET: {
      return makeNewGame();
    }

    default:
      return state;
  }
};

// Helpers exported for tests / automation
export { resolveDueMissions };
