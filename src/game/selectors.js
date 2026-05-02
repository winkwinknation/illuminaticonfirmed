import { BOONS_BY_ID, boonCostAt } from '../data/boons';
import { MEMBERS, MEMBERS_BY_ID } from '../data/members';
import { MISSIONS, MISSIONS_BY_ID } from '../data/missions';
import { UPGRADES, UPGRADES_BY_ID } from '../data/upgrades';
import {
  BASE_HP_REGEN,
  BASE_MAX_HP,
  MEMBER_COST_GROWTH,
  OFFLINE_CAP_MS,
  ORDER_UNLOCK_KNOWLEDGE_COST,
  SACRIFICE_HP_COST,
} from './constants';
import {
  costAt,
  memberCostAt,
  prestigeFaithThreshold,
  prestigeKnowledgeThreshold,
  prestigeMoneyThreshold,
  skFromTotalMoney,
} from './formulas';

const upgradeOwned = (state, id) => state.upgrades[id] || 0;
const memberOwned = (state, id) => (state.members || {})[id] || 0;
const boonOwned = (state, id) => state.boons[id] || 0;

const sumUpgradeEffect = (state, predicate, fn) => {
  let acc = 0;
  for (const u of Object.values(UPGRADES_BY_ID)) {
    const owned = upgradeOwned(state, u.id);
    if (!owned) continue;
    if (!predicate(u)) continue;
    acc += fn(u, owned);
  }
  return acc;
};

const productUpgradeEffect = (state, predicate, fn) => {
  let acc = 1;
  for (const u of Object.values(UPGRADES_BY_ID)) {
    const owned = upgradeOwned(state, u.id);
    if (!owned) continue;
    if (!predicate(u)) continue;
    acc *= fn(u, owned);
  }
  return acc;
};

const sumMemberEffect = (state, kind) => {
  let acc = 0;
  for (const m of MEMBERS) {
    if (!m.effect || m.effect.kind !== kind) continue;
    const owned = memberOwned(state, m.id);
    if (!owned) continue;
    acc += m.effect.perLevel * owned;
  }
  return acc;
};

// ---------- Boon multipliers ----------

const boonMult = (state, kinds) => {
  let mult = 1;
  for (const b of Object.values(BOONS_BY_ID)) {
    const owned = boonOwned(state, b.id);
    if (!owned) continue;
    if (b.effect.kind === 'multAll' && (kinds.faith || kinds.money || kinds.knowledge)) {
      mult *= 1 + b.effect.perLevel * owned;
    } else if (b.effect.kind === 'multMoneyAndFaith' && (kinds.faith || kinds.money)) {
      mult *= 1 + b.effect.perLevel * owned;
    } else if (b.effect.kind === 'multAllFaith' && kinds.faith) {
      mult *= 1 + b.effect.perLevel * owned;
    } else if (b.effect.kind === 'multAllMoney' && kinds.money) {
      mult *= 1 + b.effect.perLevel * owned;
    } else if (b.effect.kind === 'multAllKnowledge' && kinds.knowledge) {
      mult *= 1 + b.effect.perLevel * owned;
    } else if (b.effect.kind === 'multAllMul') {
      mult *= Math.pow(b.effect.perLevel, owned);
    }
  }
  return mult;
};

const memberKindMult = (state, kinds) => {
  let mult = 1;
  // The Patriarch (multAll) lifts all three resource kinds equally.
  const allBonus = sumMemberEffect(state, 'multAll');
  if (allBonus > 0 && (kinds.faith || kinds.money || kinds.knowledge)) {
    mult *= 1 + allBonus;
  }
  if (kinds.faith) mult *= 1 + sumMemberEffect(state, 'multAllFaith');
  if (kinds.money) mult *= 1 + sumMemberEffect(state, 'multAllMoney');
  if (kinds.knowledge) mult *= 1 + sumMemberEffect(state, 'multAllKnowledge');
  return mult;
};

// ---------- Vitals ----------

export const maxHp = (state) => {
  const flat = sumUpgradeEffect(state, (u) => u.effect.kind === 'addMaxHp', (u, n) => u.effect.perLevel * n);
  let pctMul = 1;
  for (const b of Object.values(BOONS_BY_ID)) {
    const owned = boonOwned(state, b.id);
    if (owned && b.effect.kind === 'addMaxHpPct') {
      pctMul *= 1 + b.effect.perLevel * owned;
    }
  }
  for (const u of Object.values(UPGRADES_BY_ID)) {
    const owned = upgradeOwned(state, u.id);
    if (owned && u.effect.kind === 'addMaxHpPct') {
      pctMul *= 1 + u.effect.perLevel * owned;
    }
  }
  return Math.floor((BASE_MAX_HP + flat) * pctMul);
};

export const hpRegenPerSec = (state) => {
  const fromUpgrades = sumUpgradeEffect(state, (u) => u.effect.kind === 'addHpRegen', (u, n) => u.effect.perLevel * n);
  const fromMembers = sumMemberEffect(state, 'addHpRegen');
  return BASE_HP_REGEN + fromUpgrades + fromMembers;
};

// ---------- Sacrifice ----------

export const sacrificeFaithGain = (state) => {
  const baseFaith = 1;
  const flatBonus = sumUpgradeEffect(
    state,
    (u) => u.effect.kind === 'multSacrifice',
    (u, n) => u.effect.addPerLevel * n
  );
  const mul = productUpgradeEffect(
    state,
    (u) => u.effect.kind === 'multSacrificeMul',
    (u, n) => Math.pow(u.effect.perLevel, n)
  );
  const boon = boonMult(state, { faith: true });
  const memberMult = memberKindMult(state, { faith: true });
  return Math.max(1, Math.floor((baseFaith + flatBonus) * mul * boon * memberMult));
};

export const sacrificeHpCost = () => SACRIFICE_HP_COST;

export const memberSacrificeFaith = (state, member) => {
  const c = member.cost || {};
  const raw =
    (c.money ? Math.sqrt(c.money) : 0) +
    (c.faith ? c.faith * 0.6 : 0) +
    (c.knowledge ? c.knowledge * 4 : 0);
  const base = Math.max(5, Math.ceil(raw * 1.2));
  const mul = boonMult(state, { faith: true }) * memberKindMult(state, { faith: true });
  return Math.max(1, Math.floor(base * mul));
};

// ---------- Missions ----------

export const missionDurationMs = (state, mission) => {
  const mul = productUpgradeEffect(
    state,
    (u) => u.effect.kind === 'reduceMissionCd',
    (u, n) => Math.pow(u.effect.perLevel, n)
  );
  return Math.max(500, Math.floor(mission.durationMs * mul));
};

const missionRewardMult = (state) => 1 + sumMemberEffect(state, 'multAllMissionRewards');

export const missionRewardMoney = (state, mission) => {
  const base = mission.reward.money || 0;
  if (!base) return 0;
  const cat = sumUpgradeEffect(
    state,
    (u) => u.effect.kind === 'multMission' && u.effect.category === mission.category,
    (u, n) => u.effect.perLevel * n
  );
  return Math.floor(
    base * (1 + cat) * boonMult(state, { money: true }) * memberKindMult(state, { money: true }) * missionRewardMult(state)
  );
};

export const missionRewardKnowledge = (state, mission) => {
  const base = mission.reward.knowledge || 0;
  if (!base) return 0;
  const cat = sumUpgradeEffect(
    state,
    (u) => u.effect.kind === 'multMission' && u.effect.category === mission.category,
    (u, n) => u.effect.perLevel * n
  );
  return Math.max(
    1,
    Math.floor(
      base *
        (1 + cat) *
        boonMult(state, { knowledge: true }) *
        memberKindMult(state, { knowledge: true }) *
        missionRewardMult(state)
    )
  );
};

export const missionRewardFaith = (state, mission) => {
  const base = mission.reward.faith || 0;
  if (!base) return 0;
  return Math.floor(
    base * boonMult(state, { faith: true }) * memberKindMult(state, { faith: true }) * missionRewardMult(state)
  );
};

export const missionRunInfo = (state, mission) => (state.runningMissions || {})[mission.id] || null;
export const isMissionRunning = (state, mission, now = Date.now()) => {
  const run = missionRunInfo(state, mission);
  return !!run && run.endsAt > now;
};
export const missionRemainingMs = (state, mission, now = Date.now()) => {
  const run = missionRunInfo(state, mission);
  return run ? Math.max(0, run.endsAt - now) : 0;
};

// ---------- Passive idle ----------

const passiveAll = (state) =>
  sumUpgradeEffect(state, (u) => u.effect.kind === 'addPassiveAll', (u, n) => u.effect.perLevel * n);

export const passiveFaithPerSec = (state) => {
  const base = sumUpgradeEffect(state, (u) => u.effect.kind === 'addPassiveFaith', (u, n) => u.effect.perLevel * n);
  return (base + passiveAll(state)) * boonMult(state, { faith: true }) * memberKindMult(state, { faith: true });
};

export const passiveMoneyPerSec = (state) => {
  const base = sumUpgradeEffect(state, (u) => u.effect.kind === 'addPassiveMoney', (u, n) => u.effect.perLevel * n);
  return (base + passiveAll(state)) * boonMult(state, { money: true }) * memberKindMult(state, { money: true });
};

export const passiveKnowledgePerSec = (state) => {
  const fromUpgrades = sumUpgradeEffect(state, (u) => u.effect.kind === 'addPassiveKnowledge', (u, n) => u.effect.perLevel * n);
  const fromMembers = sumMemberEffect(state, 'addPassiveKnowledge');
  return (fromUpgrades + fromMembers + passiveAll(state)) * boonMult(state, { knowledge: true }) * memberKindMult(state, { knowledge: true });
};

// ---------- Costs ----------

export const upgradeCost = (state, upgrade) => {
  const owned = upgradeOwned(state, upgrade.id);
  if (upgrade.cost.kind === 'money') {
    return { money: costAt(upgrade.cost.base, owned) };
  }
  if (upgrade.cost.kind === 'multi') {
    const c = {};
    if (upgrade.cost.money) c.money = costAt(upgrade.cost.money, owned);
    if (upgrade.cost.faith) c.faith = costAt(upgrade.cost.faith, owned);
    if (upgrade.cost.knowledge) c.knowledge = costAt(upgrade.cost.knowledge, owned);
    return c;
  }
  return {};
};

export const canAffordUpgrade = (state, upgrade) => {
  if (!isUnlocked(state, upgrade)) return false;
  const cost = upgradeCost(state, upgrade);
  if (cost.money && state.money < cost.money) return false;
  if (cost.faith && state.faith < cost.faith) return false;
  if (cost.knowledge && state.knowledge < cost.knowledge) return false;
  const owned = upgradeOwned(state, upgrade.id);
  if (upgrade.maxOwned && owned >= upgrade.maxOwned) return false;
  return true;
};

export const memberCost = (state, member) => {
  const owned = memberOwned(state, member.id);
  const c = {};
  if (member.cost.money) c.money = memberCostAt(member.cost.money, owned, MEMBER_COST_GROWTH);
  if (member.cost.faith) c.faith = memberCostAt(member.cost.faith, owned, MEMBER_COST_GROWTH);
  if (member.cost.knowledge) c.knowledge = memberCostAt(member.cost.knowledge, owned, MEMBER_COST_GROWTH);
  return c;
};

export const canAffordMember = (state, member) => {
  if (!state.orderUnlocked) return false;
  if (!isUnlocked(state, member)) return false;
  const cost = memberCost(state, member);
  if (cost.money && state.money < cost.money) return false;
  if (cost.faith && state.faith < cost.faith) return false;
  if (cost.knowledge && state.knowledge < cost.knowledge) return false;
  const owned = memberOwned(state, member.id);
  if (member.maxOwned && owned >= member.maxOwned) return false;
  return true;
};

export const canAffordMission = (state, mission) => {
  if (!isUnlocked(state, mission)) return false;
  if (mission.cost.faith && state.faith < mission.cost.faith) return false;
  return true;
};

// ---------- Unlocks ----------

const upgradeMap = UPGRADES_BY_ID;
const memberMap = MEMBERS_BY_ID;

export const checkCondition = (state, cond) => {
  switch (cond.kind) {
    case 'always':
      return true;
    case 'totalSacrifices':
      return (state.totalSacrifices || 0) >= cond.n;
    case 'totalMissions':
      return (state.totalMissions || 0) >= cond.n;
    case 'totalMoneyEarned':
      return (state.totalMoneyEarned || 0) >= cond.n;
    case 'totalFaithEarned':
      return (state.totalFaithEarned || 0) >= cond.n;
    case 'totalKnowledgeEarned':
      return (state.totalKnowledgeEarned || 0) >= cond.n;
    case 'knowledge':
      return (state.knowledge || 0) >= cond.n;
    case 'upgradeOwned':
      return upgradeOwned(state, cond.id) >= (cond.n || 1);
    case 'memberOwned':
      return memberOwned(state, cond.id) >= (cond.n || 1);
    case 'prestigeLevel':
      return (state.prestigeLevel || 0) >= cond.n;
    case 'orderUnlocked':
      return !!state.orderUnlocked;
    default:
      return true;
  }
};

const conditionLabel = (cond) => {
  switch (cond.kind) {
    case 'totalSacrifices':
      return `${cond.n} sacrifices made`;
    case 'totalMissions':
      return `${cond.n} missions completed`;
    case 'totalMoneyEarned':
      return `${cond.n} money earned (lifetime)`;
    case 'totalFaithEarned':
      return `${cond.n} faith earned (lifetime)`;
    case 'totalKnowledgeEarned':
      return `${cond.n} knowledge earned (lifetime)`;
    case 'knowledge':
      return `${cond.n} knowledge on hand`;
    case 'upgradeOwned': {
      const u = upgradeMap[cond.id];
      return u ? `${cond.n || 1}× ${u.name}` : `Own ${cond.id}`;
    }
    case 'memberOwned': {
      const m = memberMap[cond.id];
      return m ? `${cond.n || 1}× ${m.name}` : `Own ${cond.id}`;
    }
    case 'prestigeLevel':
      return `Ascend ${cond.n} time${cond.n === 1 ? '' : 's'}`;
    case 'orderUnlocked':
      return 'Inaugurate the Order';
    default:
      return '';
  }
};

export const isUnlocked = (state, item) => {
  const conds = item?.unlock;
  if (!conds || conds.length === 0) return true;
  return conds.every((c) => checkCondition(state, c));
};

export const unlockHints = (state, item) => {
  const conds = item?.unlock;
  if (!conds) return [];
  return conds
    .filter((c) => !checkCondition(state, c))
    .map((c) => conditionLabel(c))
    .filter(Boolean);
};

// Compares a mission/upgrade/member against a state to decide ordering.
const byTier = (a, b) => (a.tier || 99) - (b.tier || 99);

const nextLockedFrom = (state, items) => {
  const locked = items.filter((it) => !isUnlocked(state, it)).sort(byTier);
  return locked[0] || null;
};

export const visibleMissions = (state) => MISSIONS.filter((m) => isUnlocked(state, m)).slice().sort(byTier);
export const nextLockedMission = (state) => nextLockedFrom(state, MISSIONS);

export const visibleUpgrades = (state) => UPGRADES.filter((u) => isUnlocked(state, u)).slice().sort(byTier);
export const nextLockedUpgrade = (state) => nextLockedFrom(state, UPGRADES);
export const nextLockedUpgradeInCategory = (state, category) =>
  nextLockedFrom(state, UPGRADES.filter((u) => u.category === category));

const memberWithOrderGate = (state, m) => {
  // Inherit the global Order knowledge gate so individual members don't have
  // to repeat it. Once orderUnlocked is true, only the per-member rules count.
  if (!state.orderUnlocked) return false;
  return isUnlocked(state, m);
};

export const visibleMembers = (state) =>
  MEMBERS.filter((m) => memberWithOrderGate(state, m)).slice().sort(byTier);
export const nextLockedMember = (state) => {
  if (!state.orderUnlocked) return null;
  return nextLockedFrom(state, MEMBERS);
};

export const orderUnlockCost = () => ORDER_UNLOCK_KNOWLEDGE_COST;
export const canUnlockOrder = (state) =>
  !state.orderUnlocked && (state.knowledge || 0) >= orderUnlockCost();

// ---------- Prestige ----------

export const currentPrestigeMoneyThreshold = (state) =>
  prestigeMoneyThreshold(state.prestigeLevel);
export const currentPrestigeFaithThreshold = (state) =>
  prestigeFaithThreshold(state.prestigeLevel);
export const currentPrestigeKnowledgeThreshold = (state) =>
  prestigeKnowledgeThreshold(state.prestigeLevel);

export const canPrestige = (state) =>
  state.money >= currentPrestigeMoneyThreshold(state) &&
  state.faith >= currentPrestigeFaithThreshold(state) &&
  state.knowledge >= currentPrestigeKnowledgeThreshold(state) &&
  skGainOnPrestige(state) > 0;

export const skGainOnPrestige = (state) => {
  const total = skFromTotalMoney(state.totalMoneyEarned);
  return Math.max(0, total - state.totalSkEarned);
};

export const boonCost = (state, boon) => boonCostAt(boon, boonOwned(state, boon.id));

export const isBoonRevealed = (state, boon) => (state.boons[boon.id] || 0) > 0;

export const revealedBoonCount = (state) =>
  Object.values(BOONS_BY_ID).reduce((n, b) => n + (isBoonRevealed(state, b) ? 1 : 0), 0);

export const unrevealedBoonIds = (state) =>
  Object.values(BOONS_BY_ID).filter((b) => !isBoonRevealed(state, b)).map((b) => b.id);

export const canAffordBoon = (state, boon) => {
  const owned = boonOwned(state, boon.id);
  if (boon.maxOwned && owned >= boon.maxOwned) return false;
  if (owned <= 0) return false; // must reveal first
  return state.secretKnowledge >= boonCost(state, boon);
};

// ---------- Offline cap ----------

export const offlineCapMs = (state) => {
  let mult = 1;
  for (const b of Object.values(BOONS_BY_ID)) {
    const owned = boonOwned(state, b.id);
    if (owned && b.effect.kind === 'addOfflineCap') {
      mult += b.effect.perLevel * owned;
    }
  }
  return OFFLINE_CAP_MS * mult;
};

// ---------- Start-of-run boons ----------

export const startMoneyBonus = (state) => {
  let acc = 0;
  for (const b of Object.values(BOONS_BY_ID)) {
    const owned = boonOwned(state, b.id);
    if (owned && b.effect.kind === 'addStartMoney') acc += b.effect.perLevel * owned;
  }
  return acc;
};

export const startFaithBonus = (state) => {
  let acc = 0;
  for (const b of Object.values(BOONS_BY_ID)) {
    const owned = boonOwned(state, b.id);
    if (owned && b.effect.kind === 'addStartFaith') acc += b.effect.perLevel * owned;
  }
  return acc;
};

export const getMission = (id) => MISSIONS_BY_ID[id];
export const getUpgrade = (id) => UPGRADES_BY_ID[id];
export const getBoon = (id) => BOONS_BY_ID[id];
export const getMember = (id) => MEMBERS_BY_ID[id];
