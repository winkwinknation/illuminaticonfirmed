import { useEffect } from 'react';
import { resolveMissions } from '../game/actions';

// Polls every 250ms and dispatches RESOLVE_MISSIONS so finished mission timers
// pay out promptly even if the next TICK is throttled (e.g. background tab).
export const useMissionResolver = (state, dispatch) => {
  useEffect(() => {
    const id = setInterval(() => {
      const running = state.runningMissions || {};
      const now = Date.now();
      for (const r of Object.values(running)) {
        if (r && r.endsAt <= now) {
          dispatch(resolveMissions(now));
          return;
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [state.runningMissions, dispatch]);
};
