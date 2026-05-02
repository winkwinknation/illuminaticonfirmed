// Prestige boons are bought with Secret Knowledge (SK).
// Effect kinds (interpreted in selectors.js applyBoons):
//   multAllFaith     : multiplies all faith gains (additive per level)
//   multAllMoney     : multiplies all money gains (additive per level)
//   multAllKnowledge : multiplies all knowledge gains (additive per level)
//   multAll          : multiplies faith + money + knowledge (additive per level)
//   multAllMul       : pure multiplicative all-gains (×perLevel ^ owned)
//   multMoneyAndFaith / multMoneyAndKnowledge : pair multipliers
//   addStartMoney    : flat money on new prestige run
//   addStartFaith    : flat faith on new prestige run
//   addOfflineCap    : adds % to offline cap
//   addMaxHpPct      : multiplies max HP
//   skGainMul        : multiplies SK awarded on prestige
//   multPassive      : ×N to all idle/passive streams
//   multMissionReward: ×N to mission rewards
//
// Boons have no purchase cap — costGrowth keeps deepening expensive enough
// to support endless prestige. Per-level numbers are sized so that one or
// two levels of any boon visibly reshape the next run.

export const BOONS = [
  {
    id: 'eye_seer',
    name: 'Eye of the Seer',
    desc: '+20% faith from all sources, per level.',
    cost: 1,
    costGrowth: 1.6,
    effect: { kind: 'multAllFaith', perLevel: 0.20 },
    loreId: 'eye_of_providence',
  },
  {
    id: 'novus_ordo',
    name: 'Novus Ordo',
    desc: 'Begin each new age with 200 money per level.',
    cost: 1,
    costGrowth: 1.5,
    effect: { kind: 'addStartMoney', perLevel: 200 },
    loreId: 'novus_ordo_seclorum',
  },
  {
    id: 'ordo_ab_chao',
    name: 'Ordo ab Chao',
    desc: '+25% money from all sources, per level.',
    cost: 2,
    costGrowth: 1.7,
    effect: { kind: 'multAllMoney', perLevel: 0.25 },
    loreId: 'ordo_ab_chao',
  },
  {
    id: 'weishaupt',
    name: "Weishaupt's Cipher",
    desc: 'Begin each new age with 30 faith per level.',
    cost: 2,
    costGrowth: 1.6,
    effect: { kind: 'addStartFaith', perLevel: 30 },
    loreId: 'weishaupt_1776',
  },
  {
    id: 'thirteen',
    name: 'Thirteen Layers',
    desc: '+30% max HP, per level.',
    cost: 3,
    costGrowth: 1.8,
    effect: { kind: 'addMaxHpPct', perLevel: 0.30 },
    loreId: 'thirteen_families',
  },
  {
    id: 'silence',
    name: 'Silentium Aurum',
    desc: '+20% knowledge from all sources, per level.',
    cost: 2,
    costGrowth: 1.6,
    effect: { kind: 'multAllKnowledge', perLevel: 0.20 },
    loreId: 'silence_is_gold',
  },
  {
    id: 'long_view',
    name: 'The Long View',
    desc: '+30% offline cap, per level.',
    cost: 4,
    costGrowth: 1.5,
    effect: { kind: 'addOfflineCap', perLevel: 0.30 },
    loreId: 'longue_duree',
  },
  {
    id: 'iron_law',
    name: 'Iron Law',
    desc: '+15% to all gains, per level.',
    cost: 5,
    costGrowth: 1.9,
    effect: { kind: 'multAll', perLevel: 0.15 },
    loreId: 'iron_law',
  },
  {
    id: 'smoke_room',
    name: 'The Smoke-Filled Room',
    desc: '+30% money AND +30% faith, per level.',
    cost: 6,
    costGrowth: 2.0,
    effect: { kind: 'multMoneyAndFaith', perLevel: 0.30 },
    loreId: 'smoke_filled_room',
  },
  {
    id: 'capstone',
    name: 'The Capstone',
    desc: '×3 all gains per level (multiplicative).',
    cost: 25,
    costGrowth: 4.0,
    effect: { kind: 'multAllMul', perLevel: 3.0 },
    loreId: 'pyramid_capstone',
  },

  // ---------- Endless-tier boons ----------
  {
    id: 'gilded_chain',
    name: 'The Gilded Chain',
    desc: '+35% money AND +25% knowledge, per level.',
    cost: 8,
    costGrowth: 2.1,
    effect: { kind: 'multMoneyAndKnowledge', perLevel: 0.35, knowledgePerLevel: 0.25 },
    loreId: 'gilded_chain',
  },
  {
    id: 'unsleeping_eye',
    name: 'The Unsleeping Eye',
    desc: '+75% to all idle/passive rates, per level.',
    cost: 10,
    costGrowth: 2.2,
    effect: { kind: 'multPassive', perLevel: 0.75 },
    loreId: 'unsleeping_eye',
  },
  {
    id: 'silver_tongue',
    name: 'Silver Tongue',
    desc: '+40% mission rewards, per level.',
    cost: 7,
    costGrowth: 1.9,
    effect: { kind: 'multMissionReward', perLevel: 0.40 },
    loreId: 'silver_tongue',
  },
  {
    id: 'aurum_solis',
    name: 'Aurum Solis',
    desc: '+30% Secret Knowledge gained on ascension, per level.',
    cost: 15,
    costGrowth: 2.5,
    effect: { kind: 'skGainMul', perLevel: 0.30 },
    loreId: 'aurum_solis',
  },
  {
    id: 'bloodline',
    name: 'The Bloodline',
    desc: '×2 ALL gains, per level (multiplicative).',
    cost: 60,
    costGrowth: 3.5,
    effect: { kind: 'multAllMul', perLevel: 2.0 },
    loreId: 'bloodline',
  },
];

export const BOONS_BY_ID = Object.fromEntries(BOONS.map((b) => [b.id, b]));

export const boonCostAt = (boon, owned) =>
  Math.ceil(boon.cost * Math.pow(boon.costGrowth, owned));
