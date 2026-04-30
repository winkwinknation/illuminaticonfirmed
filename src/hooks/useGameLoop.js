import { useEffect, useRef } from 'react';
import { tick } from '../game/actions';
import { TICK_MS } from '../game/constants';

export const useGameLoop = (dispatch) => {
  const lastRef = useRef(null);

  useEffect(() => {
    lastRef.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = now - lastRef.current;
      lastRef.current = now;
      if (dt > 0) dispatch(tick(dt));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);
};
