import { SAVE_VERSION } from './constants';

const migrations = {
  1: (blob) => {
    // v1 → v2: introduce members, runningMissions, autoTimers; drop missionCooldowns.
    const state = { ...blob.state };
    if (state.members == null) state.members = {};
    if (state.runningMissions == null) state.runningMissions = {};
    if (state.autoTimers == null) state.autoTimers = {};
    delete state.missionCooldowns;
    return { ...blob, saveVersion: 2, state };
  },
};

export const wrapSave = (state, now = Date.now()) => ({
  saveVersion: SAVE_VERSION,
  createdAt: state.createdAt,
  savedAt: now,
  state,
});

const toBase64 = (str) => {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, 'utf-8').toString('base64');
};

const fromBase64 = (str) => {
  if (typeof window !== 'undefined' && window.atob) {
    return decodeURIComponent(escape(window.atob(str)));
  }
  return Buffer.from(str, 'base64').toString('utf-8');
};

export const encode = (state) => toBase64(JSON.stringify(wrapSave(state)));

export const decode = (encoded) => {
  const json = fromBase64(encoded.trim());
  return JSON.parse(json);
};

export const validate = (blob) => {
  if (!blob || typeof blob !== 'object') return false;
  if (typeof blob.saveVersion !== 'number') return false;
  if (!blob.state || typeof blob.state !== 'object') return false;
  if (typeof blob.state.hp !== 'number') return false;
  if (typeof blob.state.faith !== 'number') return false;
  return true;
};

export const migrate = (blob) => {
  let cur = blob;
  while (cur.saveVersion < SAVE_VERSION) {
    const fn = migrations[cur.saveVersion];
    if (!fn) break;
    cur = fn(cur);
  }
  return cur;
};
