import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { applyOffline } from '../game/actions';
import { makeNewGame } from '../game/initialState';
import { reducer } from '../game/reducer';
import { offlineCapMs } from '../game/selectors';

const GameContext = createContext(null);

export const GameProvider = ({ initialState, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState || makeNewGame());

  const appliedOfflineRef = useRef(false);

  useEffect(() => {
    if (appliedOfflineRef.current) return;
    appliedOfflineRef.current = true;
    const now = Date.now();
    const last = state.lastSavedAt || now;
    const cap = offlineCapMs(state);
    const delta = Math.max(0, Math.min(now - last, cap));
    if (delta > 0) dispatch(applyOffline(delta));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
