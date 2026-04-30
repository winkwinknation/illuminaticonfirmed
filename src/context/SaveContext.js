import React, { createContext, useCallback, useContext, useState } from 'react';
import { META_KEY, SLOT_COUNT, slotKey } from '../game/constants';
import { makeNewGame } from '../game/initialState';
import { decode, encode, migrate, validate, wrapSave } from '../game/saveCodec';

const SaveContext = createContext(null);

const safeParse = (s) => {
  try { return JSON.parse(s); } catch { return null; }
};

const readSlot = (i) => {
  try {
    const raw = localStorage.getItem(slotKey(i));
    if (!raw) return null;
    const parsed = safeParse(raw);
    if (!parsed || !validate(parsed)) return null;
    return migrate(parsed);
  } catch {
    return null;
  }
};

const writeSlot = (i, blob) => {
  try { localStorage.setItem(slotKey(i), JSON.stringify(blob)); return true; }
  catch { return false; }
};

const readMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return safeParse(raw) || { activeSlotId: null, names: {} };
  } catch {
    return { activeSlotId: null, names: {} };
  }
};

const writeMeta = (meta) => {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {}
};

const summarize = (blob) => {
  if (!blob) return null;
  const s = blob.state;
  return {
    savedAt: blob.savedAt,
    createdAt: blob.createdAt,
    faith: Math.floor(s.faith),
    money: Math.floor(s.money),
    knowledge: Math.floor(s.knowledge),
    prestigeLevel: s.prestigeLevel,
    secretKnowledge: s.secretKnowledge,
    playtimeMs: s.playtimeMs,
  };
};

export const SaveProvider = ({ children }) => {
  const [slots, setSlots] = useState(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => summarize(readSlot(i)))
  );
  const [meta, setMeta] = useState(() => readMeta());
  const [activeSlotId, setActiveSlotId] = useState(null);

  const refreshSlot = useCallback((i) => {
    const blob = readSlot(i);
    setSlots((prev) => {
      const next = [...prev];
      next[i] = summarize(blob);
      return next;
    });
  }, []);

  const updateMeta = useCallback((updater) => {
    setMeta((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeMeta(next);
      return next;
    });
  }, []);

  const newGame = useCallback((slotId, name) => {
    const state = makeNewGame();
    const blob = wrapSave(state);
    writeSlot(slotId, blob);
    updateMeta((m) => ({ ...m, names: { ...m.names, [slotId]: name || `Save ${slotId + 1}` } }));
    refreshSlot(slotId);
    return state;
  }, [refreshSlot, updateMeta]);

  const loadSlotState = useCallback((slotId) => {
    const blob = readSlot(slotId);
    if (!blob) return null;
    return blob.state;
  }, []);

  const persistSlot = useCallback((slotId, state) => {
    const blob = wrapSave(state);
    const ok = writeSlot(slotId, blob);
    if (ok) refreshSlot(slotId);
    return ok;
  }, [refreshSlot]);

  const deleteSlot = useCallback((slotId) => {
    try { localStorage.removeItem(slotKey(slotId)); } catch {}
    updateMeta((m) => {
      const names = { ...m.names };
      delete names[slotId];
      return { ...m, names, activeSlotId: m.activeSlotId === slotId ? null : m.activeSlotId };
    });
    refreshSlot(slotId);
    if (activeSlotId === slotId) setActiveSlotId(null);
  }, [activeSlotId, refreshSlot, updateMeta]);

  const exportSlot = useCallback((slotId) => {
    const blob = readSlot(slotId);
    if (!blob) return null;
    return encode(blob.state);
  }, []);

  const importToSlot = useCallback((slotId, encoded, name) => {
    try {
      const blob = decode(encoded);
      if (!validate(blob)) return { ok: false, error: 'Save data is invalid.' };
      const migrated = migrate(blob);
      writeSlot(slotId, migrated);
      updateMeta((m) => ({ ...m, names: { ...m.names, [slotId]: name || m.names[slotId] || `Save ${slotId + 1}` } }));
      refreshSlot(slotId);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Could not parse save string.' };
    }
  }, [refreshSlot, updateMeta]);

  const value = {
    slots,
    meta,
    activeSlotId,
    setActiveSlotId,
    newGame,
    loadSlotState,
    persistSlot,
    deleteSlot,
    exportSlot,
    importToSlot,
  };

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
};

export const useSaves = () => {
  const ctx = useContext(SaveContext);
  if (!ctx) throw new Error('useSaves must be used inside SaveProvider');
  return ctx;
};
