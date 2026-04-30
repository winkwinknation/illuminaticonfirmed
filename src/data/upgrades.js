// Effect descriptors are interpreted by selectors.js. Never put closures here —
// upgrade ids are saved, the math is not.
//
// effect kinds:
//   multSacrifice    : multiplies faith gained per sacrifice
//   multMission      : multiplies money/knowledge from missions of `category`
//   addMaxHp         : flat addition to max HP per level
//   multHpRegen      : multiplies HP regen per second
//   addPassiveFaith  : faith per second per level
//   addPassiveMoney  : money per second per level
//   reduceMissionCd  : multiplies mission cooldown duration (lower is faster)
//
// cost: { kind: 'money'|'faith'|'knowledge'|'multi', amount or amounts }

export const UPGRADES = [
  // --- Sacrifice tree ---
  {
    id: 'sac_1',
    name: 'Devout Hand',
    category: 'Sacrifice',
    desc: '+1 faith per sacrifice.',
    maxOwned: 25,
    cost: { kind: 'money', base: 15 },
    effect: { kind: 'multSacrifice', addPerLevel: 1 },
    flavor: 'Practice makes the pact firmer.',
  },
  {
    id: 'sac_2',
    name: 'Crimson Vow',
    category: 'Sacrifice',
    desc: '×1.5 faith per sacrifice (multiplicative).',
    maxOwned: 10,
    cost: { kind: 'multi', money: 250, faith: 25 },
    effect: { kind: 'multSacrificeMul', perLevel: 1.5 },
    flavor: 'A wound that remembers.',
  },
  {
    id: 'sac_3',
    name: 'Ritual Steel',
    category: 'Sacrifice',
    desc: '+5 max HP, so each sacrifice yields more raw blood.',
    maxOwned: 30,
    cost: { kind: 'money', base: 60 },
    effect: { kind: 'addMaxHp', perLevel: 5 },
    flavor: 'A larger vessel pours a larger libation.',
  },

  // --- Skills (boost society missions) ---
  {
    id: 'barter_1',
    name: 'Bartering Tongue',
    category: 'Skills',
    desc: '+25% money from Barter missions.',
    maxOwned: 30,
    cost: { kind: 'money', base: 30 },
    effect: { kind: 'multMission', category: 'barter', perLevel: 0.25 },
    flavor: 'Every coin has two prices: one printed, one whispered.',
  },
  {
    id: 'speech_1',
    name: 'Silver Speech',
    category: 'Skills',
    desc: '+25% knowledge from Rumor missions.',
    maxOwned: 30,
    cost: { kind: 'multi', money: 50, faith: 5 },
    effect: { kind: 'multMission', category: 'rumor', perLevel: 0.25 },
    flavor: 'A well-placed question is worth a thousand answers.',
  },
  {
    id: 'fight_1',
    name: 'Strong Arm',
    category: 'Skills',
    desc: '+30% reward from Dangerous missions.',
    maxOwned: 30,
    cost: { kind: 'money', base: 80 },
    effect: { kind: 'multMission', category: 'danger', perLevel: 0.30 },
    flavor: 'The order frowns on violence and depends on it equally.',
  },
  {
    id: 'fast_feet',
    name: 'Quiet Footwork',
    category: 'Skills',
    desc: '−5% mission cooldown (multiplicative).',
    maxOwned: 12,
    cost: { kind: 'multi', money: 200, faith: 10 },
    effect: { kind: 'reduceMissionCd', perLevel: 0.95 },
    flavor: 'Arrive before they expect; leave before they remember.',
  },

  // --- Vitality ---
  {
    id: 'vit_1',
    name: 'Iron Constitution',
    category: 'Vitality',
    desc: '+10 max HP.',
    maxOwned: 50,
    cost: { kind: 'money', base: 40 },
    effect: { kind: 'addMaxHp', perLevel: 10 },
    flavor: null,
  },
  {
    id: 'vit_2',
    name: 'Mended Sinew',
    category: 'Vitality',
    desc: '+0.5 HP regen per second.',
    maxOwned: 50,
    cost: { kind: 'multi', money: 75, faith: 3 },
    effect: { kind: 'addHpRegen', perLevel: 0.5 },
    flavor: null,
  },

  // --- Idle ---
  {
    id: 'idle_faith',
    name: 'Whispered Vigil',
    category: 'Idle',
    desc: '+0.05 faith per second (passive).',
    maxOwned: 100,
    cost: { kind: 'multi', money: 120, faith: 8 },
    effect: { kind: 'addPassiveFaith', perLevel: 0.05 },
    flavor: 'Beads that pray themselves.',
  },
  {
    id: 'idle_money',
    name: 'Coin Conduit',
    category: 'Idle',
    desc: '+0.10 money per second (passive).',
    maxOwned: 100,
    cost: { kind: 'money', base: 200 },
    effect: { kind: 'addPassiveMoney', perLevel: 0.10 },
    flavor: 'A small leak in the world\'s pocket.',
  },
  {
    id: 'idle_knowledge',
    name: 'Listening Stones',
    category: 'Idle',
    desc: '+0.02 knowledge per second (passive).',
    maxOwned: 100,
    cost: { kind: 'multi', money: 400, knowledge: 5 },
    effect: { kind: 'addPassiveKnowledge', perLevel: 0.02 },
    flavor: null,
  },
];

export const UPGRADES_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export const UPGRADE_CATEGORIES = ['Sacrifice', 'Skills', 'Vitality', 'Idle'];
