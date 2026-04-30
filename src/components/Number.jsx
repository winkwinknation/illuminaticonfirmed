import React from 'react';

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export const formatNumber = (n, decimals = 1) => {
  if (n == null || isNaN(n)) return '0';
  const abs = Math.abs(n);
  if (abs < 1000) {
    if (abs < 10 && !Number.isInteger(n)) return n.toFixed(1);
    return Math.floor(n).toString();
  }
  let tier = Math.floor(Math.log10(abs) / 3);
  if (tier >= SUFFIXES.length) {
    return n.toExponential(2);
  }
  const scaled = n / Math.pow(10, tier * 3);
  return `${scaled.toFixed(decimals)}${SUFFIXES[tier]}`;
};

export const N = ({ value, decimals = 1 }) => <>{formatNumber(value, decimals)}</>;

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
