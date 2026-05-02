// Rivalry missions consume units (soldier / spy / war_engine), run for
// `durationMs`, then resolve with a single random roll. Resolution math
// lives in reducer.js (see resolveDueRivalryMissions).
//
// Schema:
//   id, kind: 'conflict' | 'espionage'
//   rivalId            — which rival this targets (lookup in data/rivals.js)
//   cost.units         — { soldier?, spy?, war_engine? } unit counts committed at start
//   durationMs
//   successChance      — 0..1 base chance (modifiers may apply later)
//   rewardOnSuccess    — { money?, faith?, knowledge? } each as [min, max] inclusive
//   losses             — { soldier?, spy?, war_engine? } each as [min, max] applied on FAILURE
//   hpDrainOnFail      — espionage only: [min, max] HP drained on failure
//   tier, unlock       — same conventions as other content
//
// Ranges are interpreted by `randInt(min, max)` at resolution time. If a
// resource isn't listed for success, none is granted. Lost units are deducted
// after the player's committed pool is returned, so losses can never exceed
// what was sent.

export const RIVALRY_MISSIONS = [
  // ---------- Direct conflict (soldiers, war engines) ----------
  {
    id: 'raid_outpost',
    kind: 'conflict',
    rivalId: 'crimson',
    name: 'Raid an Outpost',
    desc: 'A small Crimson Brotherhood waystation. Quick hands, quicker blades.',
    flavor: 'Take the strongbox; leave the door.',
    cost: { units: { soldier: 1 } },
    durationMs: 30000,
    successChance: 0.7,
    rewardOnSuccess: {
      money: [200, 400],
      faith: [30, 60],
    },
    losses: { soldier: [1, 1] },
    tier: 1,
  },
  {
    id: 'sack_chapter',
    kind: 'conflict',
    rivalId: 'iron_lodge',
    name: 'Sack a Chapter House',
    desc: 'Storm an Iron Lodge meeting hall. Take what is owed, twice over.',
    flavor: 'They keep their accounts in iron and ink. Both burn.',
    cost: { units: { soldier: 3 } },
    durationMs: 60000,
    successChance: 0.65,
    rewardOnSuccess: {
      money: [800, 1500],
      knowledge: [5, 15],
    },
    losses: { soldier: [1, 3] },
    tier: 2,
    unlock: [{ kind: 'memberOwned', id: 'soldier', n: 3 }],
  },
  {
    id: 'siege_estate',
    kind: 'conflict',
    rivalId: 'pale_court',
    name: 'Siege a Pale Estate',
    desc: 'Surround a Pale Court manor and break it open. Bring engines.',
    flavor: 'Old money survives sieges. Old men do not.',
    cost: { units: { soldier: 5, war_engine: 1 } },
    durationMs: 120000,
    successChance: 0.6,
    rewardOnSuccess: {
      money: [3000, 6000],
      faith: [200, 400],
      knowledge: [20, 50],
    },
    losses: { soldier: [2, 5], war_engine: [0, 1] },
    tier: 3,
    unlock: [{ kind: 'memberOwned', id: 'war_engine', n: 1 }],
  },
  {
    id: 'crusade',
    kind: 'conflict',
    rivalId: 'iron_lodge',
    name: 'Open Crusade',
    desc: 'A field-pitched campaign against the Iron Lodge. Costly. Decisive.',
    flavor: 'Banners come home or they do not come home.',
    cost: { units: { soldier: 10, war_engine: 3 } },
    durationMs: 240000,
    successChance: 0.55,
    rewardOnSuccess: {
      money: [10000, 20000],
      faith: [800, 1500],
      knowledge: [60, 140],
    },
    losses: { soldier: [4, 10], war_engine: [1, 3] },
    tier: 5,
    unlock: [{ kind: 'memberOwned', id: 'war_engine', n: 3 }, { kind: 'totalRivalryWins', n: 5 }],
  },

  // ---------- Espionage (spies, HP drain on fail) ----------
  {
    id: 'infiltrate_lodge',
    kind: 'espionage',
    rivalId: 'iron_lodge',
    name: 'Infiltrate the Lodge',
    desc: 'Send a face nobody knows into a room where everybody does.',
    flavor: 'They mark the cards. We read the marks.',
    cost: { units: { spy: 1 } },
    durationMs: 45000,
    successChance: 0.75,
    rewardOnSuccess: {
      knowledge: [10, 25],
      faith: [20, 40],
    },
    losses: { spy: [1, 1] },
    hpDrainOnFail: [10, 25],
    tier: 1,
    unlock: [{ kind: 'memberOwned', id: 'spy', n: 1 }],
  },
  {
    id: 'steal_codex',
    kind: 'espionage',
    rivalId: 'glass_cabal',
    name: 'Steal a Codex',
    desc: 'Lift a Glass Cabal cipher-book before they notice it is gone. They will.',
    flavor: 'Pages, the moment they are read, become other pages.',
    cost: { units: { spy: 2 } },
    durationMs: 90000,
    successChance: 0.65,
    rewardOnSuccess: {
      knowledge: [30, 70],
      faith: [50, 100],
    },
    losses: { spy: [1, 2] },
    hpDrainOnFail: [20, 50],
    tier: 2,
    unlock: [{ kind: 'memberOwned', id: 'spy', n: 2 }],
  },
  {
    id: 'unmask_grandmaster',
    kind: 'espionage',
    rivalId: 'pale_court',
    name: 'Unmask the Grandmaster',
    desc: 'Pry the name behind a Pale Court mask. The court will not forgive it.',
    flavor: 'A name is a wound. Walk softly with it.',
    cost: { units: { spy: 3 } },
    durationMs: 150000,
    successChance: 0.55,
    rewardOnSuccess: {
      money: [500, 1500],
      knowledge: [100, 200],
      faith: [200, 400],
    },
    losses: { spy: [2, 3] },
    hpDrainOnFail: [40, 80],
    tier: 3,
    unlock: [{ kind: 'memberOwned', id: 'spy', n: 3 }, { kind: 'totalRivalryWins', n: 3 }],
  },

  // ---------- Endless-tier campaigns ----------
  {
    id: 'great_war',
    kind: 'conflict',
    rivalId: 'pale_court',
    name: 'The Great War',
    desc: 'A coordinated, generational war against the Pale Court. Bring everything.',
    flavor: 'War is bookkeeping at its loudest.',
    cost: { units: { soldier: 25, war_engine: 8 } },
    durationMs: 360000,
    successChance: 0.5,
    rewardOnSuccess: {
      money: [60000, 120000],
      faith: [4000, 8000],
      knowledge: [400, 900],
    },
    losses: { soldier: [10, 20], war_engine: [3, 7] },
    tier: 6,
    unlock: [{ kind: 'memberOwned', id: 'war_engine', n: 8 }, { kind: 'totalRivalryWins', n: 12 }],
  },
  {
    id: 'shadow_war',
    kind: 'espionage',
    rivalId: 'glass_cabal',
    name: 'Shadow War',
    desc: 'A campaign of mirrors against the Glass Cabal. Spies on spies on spies.',
    flavor: 'They watch us watch them. The trick is to forget who started.',
    cost: { units: { spy: 8 } },
    durationMs: 300000,
    successChance: 0.5,
    rewardOnSuccess: {
      money: [3000, 8000],
      knowledge: [600, 1400],
      faith: [800, 1600],
    },
    losses: { spy: [5, 8] },
    hpDrainOnFail: [80, 150],
    tier: 6,
    unlock: [{ kind: 'memberOwned', id: 'spy', n: 8 }, { kind: 'totalRivalryWins', n: 10 }],
  },
  {
    id: 'topple_throne',
    kind: 'conflict',
    rivalId: 'iron_lodge',
    name: 'Topple the Throne',
    desc: 'A coordinated regicide against the Iron Lodge\'s anointed seat.',
    flavor: 'The chair is heavier than the man. The chair is the point.',
    cost: { units: { soldier: 50, war_engine: 15, spy: 10 } },
    durationMs: 600000,
    successChance: 0.45,
    rewardOnSuccess: {
      money: [200000, 500000],
      faith: [15000, 30000],
      knowledge: [2000, 4000],
    },
    losses: { soldier: [25, 45], war_engine: [8, 14], spy: [6, 10] },
    tier: 8,
    unlock: [{ kind: 'prestigeLevel', n: 1 }, { kind: 'totalRivalryWins', n: 25 }],
  },
];

export const RIVALRY_MISSIONS_BY_ID = Object.fromEntries(
  RIVALRY_MISSIONS.map((m) => [m.id, m])
);
