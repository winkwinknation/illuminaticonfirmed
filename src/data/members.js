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

export const MEMBERS = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    desc: 'Sacrifices on your behalf every 3s while you have the strength.',
    flavor: 'A novice with willing veins.',
    cost: { money: 200, faith: 50 },
    maxOwned: 20,
    behavior: { kind: 'autoSacrifice', minHpFraction: 0.5, intervalMs: 3000 },
  },
  {
    id: 'hawker',
    name: 'Hawker',
    desc: 'Auto-runs Barter at the Market whenever it is free and affordable.',
    flavor: 'Counts coins in their sleep.',
    cost: { money: 300, faith: 30 },
    maxOwned: 15,
    behavior: { kind: 'autoMission', missionId: 'barter_market' },
  },
  {
    id: 'spy',
    name: 'Spy',
    desc: 'Auto-runs Listen at the Tavern. Whispers paid in knowledge.',
    flavor: 'Eyes that pretend to be elsewhere.',
    cost: { money: 500, faith: 75 },
    maxOwned: 15,
    behavior: { kind: 'autoMission', missionId: 'rumor_tavern' },
  },
  {
    id: 'enforcer',
    name: 'Enforcer',
    desc: 'Auto-runs Midnight Heist when affordable and HP ≥ 60%.',
    flavor: 'Asks twice. Never thrice.',
    cost: { money: 2500, faith: 200 },
    maxOwned: 12,
    behavior: { kind: 'autoMission', missionId: 'danger_heist', minHpFraction: 0.6 },
  },
  {
    id: 'scribe',
    name: 'Scribe',
    desc: 'Auto-runs Crack the Archives. Long, lucrative, leaves no marks.',
    flavor: 'Spends days on a paragraph and an evening on the ledger.',
    cost: { money: 8000, faith: 600, knowledge: 50 },
    maxOwned: 10,
    behavior: { kind: 'autoMission', missionId: 'rumor_archive', minHpFraction: 0.4 },
  },
  {
    id: 'steward',
    name: 'Steward',
    desc: 'Every 6s, automatically purchases the cheapest affordable shop upgrade.',
    flavor: 'Allergic to surplus and slack.',
    cost: { money: 5000, faith: 250, knowledge: 30 },
    maxOwned: 5,
    behavior: { kind: 'autoBuyUpgrade', intervalMs: 6000 },
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
  },
  {
    id: 'cantor',
    name: 'Cantor',
    desc: '+8% to all faith gains per Cantor (additive).',
    flavor: 'Sings the names that should not be spoken.',
    cost: { money: 1200, faith: 200 },
    maxOwned: 20,
    effect: { kind: 'multAllFaith', perLevel: 0.08 },
  },
  {
    id: 'treasurer',
    name: 'Treasurer',
    desc: '+10% to all money gains per Treasurer (additive).',
    flavor: 'A ledger always in two columns and three currencies.',
    cost: { money: 3000, faith: 150 },
    maxOwned: 20,
    effect: { kind: 'multAllMoney', perLevel: 0.10 },
  },
  {
    id: 'cryptographer',
    name: 'Cryptographer',
    desc: '+10% to all knowledge gains per Cryptographer (additive).',
    flavor: 'Reads the gaps between the words.',
    cost: { money: 4000, faith: 200, knowledge: 20 },
    maxOwned: 20,
    effect: { kind: 'multAllKnowledge', perLevel: 0.10 },
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    desc: '+15% mission rewards per Diplomat (additive, stacks with skill upgrades).',
    flavor: 'Has dined with everyone you fear.',
    cost: { money: 6000, faith: 400, knowledge: 40 },
    maxOwned: 12,
    effect: { kind: 'multAllMissionRewards', perLevel: 0.15 },
  },
];

export const MEMBERS_BY_ID = Object.fromEntries(MEMBERS.map((m) => [m.id, m]));
