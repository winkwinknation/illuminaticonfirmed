// Members of Your Order. Two flavors:
//
//   1. Passive members — `effect.kind` interpreted by selectors (multipliers / regen).
//      Work whether the game is open or not (their bonus rolls into TICK income).
//
//   2. Active members — `behavior` describes what they auto-do in foreground.
//      Run via the useAutomation hook.
//
// Active behaviors:
//   { kind: 'autoSacrifice', minHpFraction, intervalMs }
//   { kind: 'autoMission', missionId, minHpFraction? }
//   { kind: 'autoBuyUpgrade', category, intervalMs }
//
// Costs are paid at recruit time. `costGrowth` defaults to MEMBER_COST_GROWTH.
//
// `tier` controls display order. `unlock` is interpreted by selectors.isUnlocked
// and is implicitly ANDed with the global Order knowledge gate (orderUnlocked).

export const MEMBERS = [
  // ---------- Active members ----------
  {
    id: 'acolyte',
    name: 'Acolyte',
    desc: 'Sacrifices on your behalf every 3s while you have the strength.',
    flavor: 'A novice with willing veins.',
    cost: { money: 200, faith: 50 },
    maxOwned: 20,
    behavior: { kind: 'autoSacrifice', minHpFraction: 0.5, intervalMs: 3000 },
    tier: 1,
  },
  {
    id: 'hawker',
    name: 'Hawker',
    desc: 'Auto-runs Barter at the Market whenever it is free and affordable.',
    flavor: 'Counts coins in their sleep.',
    cost: { money: 300, faith: 30 },
    maxOwned: 15,
    behavior: { kind: 'autoMission', missionId: 'barter_market' },
    tier: 2,
    unlock: [{ kind: 'totalMoneyEarned', n: 250 }],
  },
  {
    id: 'eavesdropper',
    name: 'Eavesdropper',
    desc: 'Auto-runs Listen at the Tavern. Whispers paid in knowledge.',
    flavor: 'Eyes that pretend to be elsewhere.',
    cost: { money: 500, faith: 75 },
    maxOwned: 15,
    behavior: { kind: 'autoMission', missionId: 'rumor_tavern' },
    tier: 3,
    unlock: [{ kind: 'totalKnowledgeEarned', n: 5 }, { kind: 'memberOwned', id: 'hawker', n: 1 }],
  },
  {
    id: 'enforcer',
    name: 'Enforcer',
    desc: 'Auto-runs Midnight Heist when affordable and HP ≥ 60%.',
    flavor: 'Asks twice. Never thrice.',
    cost: { money: 2500, faith: 200 },
    maxOwned: 12,
    behavior: { kind: 'autoMission', missionId: 'danger_heist', minHpFraction: 0.6 },
    tier: 5,
    unlock: [
      { kind: 'totalMoneyEarned', n: 2000 },
      { kind: 'totalMissions', n: 15 },
    ],
  },
  {
    id: 'scribe',
    name: 'Scribe',
    desc: 'Auto-runs Crack the Archives. Long, lucrative, leaves no marks.',
    flavor: 'Spends days on a paragraph and an evening on the ledger.',
    cost: { money: 8000, faith: 600, knowledge: 50 },
    maxOwned: 10,
    behavior: { kind: 'autoMission', missionId: 'rumor_archive', minHpFraction: 0.4 },
    tier: 7,
    unlock: [{ kind: 'totalKnowledgeEarned', n: 80 }, { kind: 'memberOwned', id: 'eavesdropper', n: 1 }],
  },
  {
    id: 'steward',
    name: 'Steward',
    desc: 'Every 6s, automatically purchases the cheapest affordable shop upgrade.',
    flavor: 'Allergic to surplus and slack.',
    cost: { money: 5000, faith: 250, knowledge: 30 },
    maxOwned: 5,
    behavior: { kind: 'autoBuyUpgrade', intervalMs: 6000 },
    tier: 6,
    unlock: [{ kind: 'totalMoneyEarned', n: 6000 }, { kind: 'totalMissions', n: 25 }],
  },

  // ---------- Passive members ----------
  {
    id: 'apothecary',
    name: 'Apothecary',
    desc: '+0.4 HP regen per second per Apothecary.',
    flavor: 'Stitches what zealotry tears.',
    cost: { money: 800, faith: 80 },
    maxOwned: 25,
    effect: { kind: 'addHpRegen', perLevel: 0.4 },
    tier: 2,
    unlock: [{ kind: 'totalSacrifices', n: 10 }],
  },
  {
    id: 'cantor',
    name: 'Cantor',
    desc: '+15% to all faith gains per Cantor (additive).',
    flavor: 'Sings the names that should not be spoken.',
    cost: { money: 1000, faith: 150 },
    maxOwned: 20,
    effect: { kind: 'multAllFaith', perLevel: 0.15 },
    tier: 4,
    unlock: [{ kind: 'totalFaithEarned', n: 250 }],
  },
  {
    id: 'treasurer',
    name: 'Treasurer',
    desc: '+18% to all money gains per Treasurer (additive).',
    flavor: 'A ledger always in two columns and three currencies.',
    cost: { money: 2500, faith: 120 },
    maxOwned: 20,
    effect: { kind: 'multAllMoney', perLevel: 0.18 },
    tier: 4,
    unlock: [{ kind: 'totalMoneyEarned', n: 1500 }],
  },
  {
    id: 'cryptographer',
    name: 'Cryptographer',
    desc: '+18% to all knowledge gains per Cryptographer (additive).',
    flavor: 'Reads the gaps between the words.',
    cost: { money: 3500, faith: 160, knowledge: 16 },
    maxOwned: 20,
    effect: { kind: 'multAllKnowledge', perLevel: 0.18 },
    tier: 5,
    unlock: [{ kind: 'totalKnowledgeEarned', n: 30 }],
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    desc: '+22% mission rewards per Diplomat (additive, stacks with skill upgrades).',
    flavor: 'Has dined with everyone you fear.',
    cost: { money: 5000, faith: 320, knowledge: 32 },
    maxOwned: 12,
    effect: { kind: 'multAllMissionRewards', perLevel: 0.22 },
    tier: 6,
    unlock: [{ kind: 'totalMissions', n: 30 }],
  },
  {
    id: 'archivist',
    name: 'Archivist',
    desc: '+0.06 knowledge per second per Archivist (passive).',
    flavor: 'Older than the ledger they keep.',
    cost: { money: 7500, faith: 350, knowledge: 30 },
    maxOwned: 15,
    effect: { kind: 'addPassiveKnowledge', perLevel: 0.06 },
    tier: 7,
    unlock: [{ kind: 'totalKnowledgeEarned', n: 120 }, { kind: 'memberOwned', id: 'cryptographer', n: 1 }],
  },
  {
    id: 'patriarch',
    name: 'Patriarch',
    desc: '+12% to ALL gains per Patriarch (additive).',
    flavor: 'Signs nothing. Decides everything.',
    cost: { money: 25000, faith: 1500, knowledge: 150 },
    maxOwned: 8,
    effect: { kind: 'multAll', perLevel: 0.20 },
    tier: 8,
    unlock: [{ kind: 'prestigeLevel', n: 1 }],
  },
  {
    id: 'inquisitor',
    name: 'Inquisitor',
    desc: 'Auto-runs Quiet a Voice. Long, dangerous, paid in coin and quiet.',
    flavor: 'Asks the questions you do not write down.',
    cost: { money: 18000, faith: 1000, knowledge: 80 },
    maxOwned: 8,
    behavior: { kind: 'autoMission', missionId: 'danger_assassinate', minHpFraction: 0.6 },
    tier: 9,
    unlock: [{ kind: 'totalMissions', n: 100 }, { kind: 'memberOwned', id: 'enforcer', n: 3 }],
  },
  {
    id: 'oracle',
    name: 'Oracle',
    desc: 'Auto-runs Court the Oracle. Speaks the future for a price.',
    flavor: 'Mistaken for mad until proven correct.',
    cost: { money: 30000, faith: 1500, knowledge: 250 },
    maxOwned: 8,
    behavior: { kind: 'autoMission', missionId: 'rumor_oracle', minHpFraction: 0.3 },
    tier: 10,
    unlock: [{ kind: 'totalKnowledgeEarned', n: 2000 }, { kind: 'memberOwned', id: 'archivist', n: 1 }],
  },
  {
    id: 'matriarch',
    name: 'Matriarch',
    desc: '+18% to ALL gains per Matriarch (additive). Stacks with Patriarch.',
    flavor: 'Signs everything. Reads it later.',
    cost: { money: 80000, faith: 4500, knowledge: 400 },
    maxOwned: 6,
    effect: { kind: 'multAll', perLevel: 0.30 },
    tier: 10,
    unlock: [{ kind: 'prestigeLevel', n: 2 }, { kind: 'memberOwned', id: 'patriarch', n: 3 }],
  },

  // ---------- War Roster ----------
  // Consumable units committed to Rivalry missions. They have no behavior or
  // passive effect — they are inventory the Rivals tab spends and may lose.
  {
    id: 'soldier',
    name: 'Soldier',
    desc: 'A devoted body, drilled and armed. Sent to fight rival orders.',
    flavor: 'Faith first; fear, second; orders, always.',
    cost: { money: 400, faith: 50 },
    maxOwned: 100,
    unitKind: 'soldier',
    tier: 1,
    unlock: [{ kind: 'orderUnlocked' }],
  },
  {
    id: 'spy',
    name: 'Spy',
    desc: 'A face that fits any room. Sent to steal or to die unmarked.',
    flavor: 'Loyal in inverse proportion to what is known of them.',
    cost: { money: 700, faith: 60, knowledge: 8 },
    maxOwned: 60,
    unitKind: 'spy',
    tier: 2,
    unlock: [{ kind: 'orderUnlocked' }, { kind: 'totalKnowledgeEarned', n: 120 }],
  },
  {
    id: 'war_engine',
    name: 'War Engine',
    desc: 'A siege apparatus blessed and bolted together. Devastating, irreplaceable.',
    flavor: 'Some prayers are answered with a hinge and a counterweight.',
    cost: { money: 6000, faith: 300, knowledge: 40 },
    maxOwned: 25,
    unitKind: 'war_engine',
    tier: 3,
    unlock: [
      { kind: 'orderUnlocked' },
      { kind: 'memberOwned', id: 'soldier', n: 5 },
      { kind: 'totalKnowledgeEarned', n: 200 },
    ],
  },
];

export const MEMBERS_BY_ID = Object.fromEntries(MEMBERS.map((m) => [m.id, m]));
