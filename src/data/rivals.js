// Rival orders the player competes against. Used as flavor / target for
// rivalry missions. No mechanical state — colors and names live here so
// missions can render accents and the screen can group missions by rival.

export const RIVALS = [
  {
    id: 'crimson',
    name: 'The Crimson Brotherhood',
    short: 'Crimson Brotherhood',
    color: '#a3252e',
    blurb: 'Knife-fighters and arsonists. Loud. Easy to find. Hard to keep down.',
  },
  {
    id: 'iron_lodge',
    name: 'The Iron Lodge',
    short: 'Iron Lodge',
    color: '#7a8a9a',
    blurb: 'Disciplined militants in matching coats. Keep ledgers, keep grudges.',
  },
  {
    id: 'pale_court',
    name: 'The Pale Court',
    short: 'Pale Court',
    color: '#d8c8a0',
    blurb: 'Old money, deep cellars, longer memories. Polite when armed.',
  },
  {
    id: 'glass_cabal',
    name: 'The Glass Cabal',
    short: 'Glass Cabal',
    color: '#7faec0',
    blurb: 'Espionage masters who have never confirmed they exist.',
  },
];

export const RIVALS_BY_ID = Object.fromEntries(RIVALS.map((r) => [r.id, r]));
