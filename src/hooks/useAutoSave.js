import { useEffect, useRef } from 'react';
import { stampSaved } from '../game/actions';
import { AUTOSAVE_MS } from '../game/constants';

export const useAutoSave = ({ state, dispatch, slotId, persistSlot }) => {
  const stateRef = useRef(state);
  const slotRef = useRef(slotId);
  stateRef.current = state;
  slotRef.current = slotId;

  useEffect(() => {
    if (slotId == null) return;
    const id = setInterval(() => {
      const now = Date.now();
      const stamped = { ...stateRef.current, lastSavedAt: now };
      const ok = persistSlot(slotRef.current, stamped);
      if (ok) dispatch(stampSaved(now));
    }, AUTOSAVE_MS);
    return () => clearInterval(id);
  }, [slotId, persistSlot, dispatch]);

  useEffect(() => {
    if (slotId == null) return;
    const flush = () => {
      const now = Date.now();
      const stamped = { ...stateRef.current, lastSavedAt: now };
      persistSlot(slotRef.current, stamped);
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      flush();
    };
  }, [slotId, persistSlot]);
};
