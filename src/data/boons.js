// Prestige boons are bought with Secret Knowledge (SK).
// Effect kinds (interpreted in selectors.js applyBoons):
//   multAllFaith     : multiplies all faith gains
//   multAllMoney     : multiplies all money gains
//   multAllKnowledge : multiplies all knowledge gains
//   addStartMoney    : flat money on new prestige run
//   addStartFaith    : flat faith on new prestige run
//   addOfflineCap    : adds % to offline cap
//   addMaxHpPct      : multiplies max HP
//   skGainMul        : multiplies SK awarded on prestige
//
// Boons no longer have a hard purchase cap — costGrowth makes them naturally
// expensive as you stack them, so endless prestige can keep deepening them.

export const BOONS = [
  {
    id: 'eye_seer',
    name: 'Eye of the Seer',
    desc: '+10% faith from all sources, per level.',
    cost: 1,
    costGrowth: 1.6,
    effect: { kind: 'multAllFaith', perLevel: 0.10 },
    loreId: 'eye_of_providence',
  },
  {
    id: 'novus_ordo',
    name: 'Novus Ordo',
    desc: 'Begin each new age with 50 money per level.',
    cost: 1,
    costGrowth: 1.5,
    effect: { kind: 'addStartMoney', perLevel: 50 },
    loreId: 'novus_ordo_seclorum',
  },
  {
    id: 'ordo_ab_chao',
    name: 'Ordo ab Chao',
    desc: '+15% money from all sources, per level.',
    cost: 2,
    costGrowth: 1.7,
    effect: { kind: 'multAllMoney', perLevel: 0.15 },
    loreId: 'ordo_ab_chao',
  },
  {
    id: 'weishaupt',
    name: "Weishaupt's Cipher",
    desc: 'Begin each new age with 10 faith per level.',
    cost: 2,
    costGrowth: 1.6,
    effect: { kind: 'addStartFaith', perLevel: 10 },
    loreId: 'weishaupt_1776',
  },
  {
    id: 'thirteen',
    name: 'Thirteen Layers',
    desc: '+20% max HP, per level.',
    cost: 3,
    costGrowth: 1.8,
    effect: { kind: 'addMaxHpPct', perLevel: 0.20 },
    loreId: 'thirteen_families',
  },
  {
    id: 'silence',
    name: 'Silentium Aurum',
    desc: '+12% knowledge from all sources, per level.',
    cost: 2,
    costGrowth: 1.6,
    effect: { kind: 'multAllKnowledge', perLevel: 0.12 },
    loreId: 'silence_is_gold',
  },
  {
    id: 'long_view',
    name: 'The Long View',
    desc: '+25% offline cap, per level.',
    cost: 4,
    costGrowth: 1.5,
    effect: { kind: 'addOfflineCap', perLevel: 0.25 },
    loreId: 'longue_duree',
  },
  {
    id: 'iron_law',
    name: 'Iron Law',
    desc: '+8% to all gains, per level.',
    cost: 5,
    costGrowth: 1.9,
    effect: { kind: 'multAll', perLevel: 0.08 },
    loreId: 'iron_law',
  },
  {
    id: 'smoke_room',
    name: 'The Smoke-Filled Room',
    desc: '+20% money AND +20% faith, per level.',
    cost: 6,
    costGrowth: 2.0,
    effect: { kind: 'multMoneyAndFaith', perLevel: 0.20 },
    loreId: 'smoke_filled_room',
  },
  {
    id: 'capstone',
    name: 'The Capstone',
    desc: 'Doubles all gains. (×2 per level, multiplicative)',
    cost: 25,
    costGrowth: 4.0,
    effect: { kind: 'multAllMul', perLevel: 2.0 },
    loreId: 'pyramid_capstone',
  },

  // ---------- Endless-tier boons ----------
  {
    id: 'gilded_chain',
    name: 'The Gilded Chain',
    desc: '+25% money AND +15% knowledge, per level.',
    cost: 8,
    costGrowth: 2.1,
    effect: { kind: 'multMoneyAndKnowledge', perLevel: 0.25, knowledgePerLevel: 0.15 },
    loreId: 'gilded_chain',
  },
  {
    id: 'unsleeping_eye',
    name: 'The Unsleeping Eye',
    desc: '+50% to all idle/passive rates, per level.',
    cost: 10,
    costGrowth: 2.2,
    effect: { kind: 'multPassive', perLevel: 0.50 },
    loreId: 'unsleeping_eye',
  },
  {
    id: 'silver_tongue',
    name: 'Silver Tongue',
    desc: '+30% mission rewards, per level.',
    cost: 7,
    costGrowth: 1.9,
    effect: { kind: 'multMissionReward', perLevel: 0.30 },
    loreId: 'silver_tongue',
  },
  {
    id: 'aurum_solis',
    name: 'Aurum Solis',
    desc: '+25% Secret Knowledge gained on ascension, per level.',
    cost: 15,
    costGrowth: 2.5,
    effect: { kind: 'skGainMul', perLevel: 0.25 },
    loreId: 'aurum_solis',
  },
  {
    id: 'bloodline',
    name: 'The Bloodline',
    desc: '×1.5 ALL gains, per level (multiplicative).',
    cost: 60,
    costGrowth: 3.5,
    effect: { kind: 'multAllMul', perLevel: 1.5 },
    loreId: 'bloodline',
  },
];

export const BOONS_BY_ID = Object.fromEntries(BOONS.map((b) => [b.id, b]));

export const boonCostAt = (boon, owned) =>
  Math.ceil(boon.cost * Math.pow(boon.costGrowth, owned));
