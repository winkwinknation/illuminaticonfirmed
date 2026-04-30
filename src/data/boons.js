// Prestige boons are bought with Secret Knowledge (SK).
// Effect kinds (interpreted in selectors.js applyBoons):
//   multAllFaith     : multiplies all faith gains
//   multAllMoney     : multiplies all money gains
//   multAllKnowledge : multiplies all knowledge gains
//   addStartMoney    : flat money on new prestige run
//   addStartFaith    : flat faith on new prestige run
//   addOfflineCap    : adds % to offline cap
//   addMaxHpPct      : multiplies max HP

export const BOONS = [
  {
    id: 'eye_seer',
    name: 'Eye of the Seer',
    desc: '+10% faith from all sources, per level.',
    cost: 1,
    maxOwned: 10,
    costGrowth: 1.6,
    effect: { kind: 'multAllFaith', perLevel: 0.10 },
    loreId: 'eye_of_providence',
  },
  {
    id: 'novus_ordo',
    name: 'Novus Ordo',
    desc: 'Begin each new age with 50 money per level.',
    cost: 1,
    maxOwned: 10,
    costGrowth: 1.5,
    effect: { kind: 'addStartMoney', perLevel: 50 },
    loreId: 'novus_ordo_seclorum',
  },
  {
    id: 'ordo_ab_chao',
    name: 'Ordo ab Chao',
    desc: '+15% money from all sources, per level.',
    cost: 2,
    maxOwned: 8,
    costGrowth: 1.7,
    effect: { kind: 'multAllMoney', perLevel: 0.15 },
    loreId: 'ordo_ab_chao',
  },
  {
    id: 'weishaupt',
    name: "Weishaupt's Cipher",
    desc: 'Begin each new age with 10 faith per level.',
    cost: 2,
    maxOwned: 10,
    costGrowth: 1.6,
    effect: { kind: 'addStartFaith', perLevel: 10 },
    loreId: 'weishaupt_1776',
  },
  {
    id: 'thirteen',
    name: 'Thirteen Layers',
    desc: '+20% max HP, per level.',
    cost: 3,
    maxOwned: 5,
    costGrowth: 1.8,
    effect: { kind: 'addMaxHpPct', perLevel: 0.20 },
    loreId: 'thirteen_families',
  },
  {
    id: 'silence',
    name: 'Silentium Aurum',
    desc: '+12% knowledge from all sources, per level.',
    cost: 2,
    maxOwned: 8,
    costGrowth: 1.6,
    effect: { kind: 'multAllKnowledge', perLevel: 0.12 },
    loreId: 'silence_is_gold',
  },
  {
    id: 'long_view',
    name: 'The Long View',
    desc: '+25% offline cap, per level.',
    cost: 4,
    maxOwned: 6,
    costGrowth: 1.5,
    effect: { kind: 'addOfflineCap', perLevel: 0.25 },
    loreId: 'longue_duree',
  },
  {
    id: 'iron_law',
    name: 'Iron Law',
    desc: '+8% to all gains, per level.',
    cost: 5,
    maxOwned: 10,
    costGrowth: 1.9,
    effect: { kind: 'multAll', perLevel: 0.08 },
    loreId: 'iron_law',
  },
  {
    id: 'smoke_room',
    name: 'The Smoke-Filled Room',
    desc: '+20% money AND +20% faith, per level.',
    cost: 6,
    maxOwned: 6,
    costGrowth: 2.0,
    effect: { kind: 'multMoneyAndFaith', perLevel: 0.20 },
    loreId: 'smoke_filled_room',
  },
  {
    id: 'capstone',
    name: 'The Capstone',
    desc: 'Doubles all gains. (+100% per level, multiplicative)',
    cost: 25,
    maxOwned: 3,
    costGrowth: 4.0,
    effect: { kind: 'multAllMul', perLevel: 2.0 },
    loreId: 'pyramid_capstone',
  },
];

export const BOONS_BY_ID = Object.fromEntries(BOONS.map((b) => [b.id, b]));

export const boonCostAt = (boon, owned) =>
  Math.ceil(boon.cost * Math.pow(boon.costGrowth, owned));
