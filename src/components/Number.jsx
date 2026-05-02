import React from 'react';
import Decimal from 'break_infinity.js';
import { MixedScientificNotation } from '@antimatter-dimensions/notations';

// Antimatter Dimensions' MixedScientific shows letter suffixes (K/M/B/T/Qa/Qi…)
// up to a threshold, then switches to scientific (1.23e123). Plays well with
// our scale and the fonts already in the game.
const NOTATION = new MixedScientificNotation();

const tinyExponent = (n, places) => n.toExponential(places).replace('e+', 'e');

// Single source of truth for number rendering.
//
//   places            — significant digits for big numbers (1234567 → "1.23M" if 2)
//   placesUnder1000   — decimal places for values 0..1000. 2 keeps slow idle
//                       rates ("0.05 faith/s") clean instead of long floats.
export const formatNumber = (value, places = 2, placesUnder1000 = 2) => {
  if (value == null || Number.isNaN(value)) return '0';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  // Sub-resolution numbers: keep them visible as significant figures rather
  // than rounding them to "0" silently.
  if (abs < Math.pow(10, -placesUnder1000)) {
    return tinyExponent(value, 2);
  }
  return NOTATION.format(new Decimal(value), places, placesUnder1000);
};

// Format a per-second rate. Rates routinely live well below 1, so this picks
// 3 decimals under 1000 (so 0.025/s reads cleanly) and 2 sig-figs above.
export const formatRate = (value) => formatNumber(value, 2, 3);

export const N = ({ value, places = 2, placesUnder1000 = 2 }) => (
  <>{formatNumber(value, places, placesUnder1000)}</>
);

export const formatDuration = (ms) => {
  if (!ms || ms < 0) return '0s';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};
