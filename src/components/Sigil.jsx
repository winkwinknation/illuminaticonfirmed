import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { claimSigil, expireSigil } from '../game/actions';
import { SIGIL_LIFETIME_MS } from '../game/constants';
import { formatNumber } from './Number';
import './Sigil.css';

// Golden-Cookie analogue. The reducer's TICK already handles spawn timing
// and lifetime; this component is purely UI: it renders the sigil when one
// is in state, ticks a local "ms remaining" for the decay ring, and
// dispatches CLAIM_SIGIL on click.
//
// The post-claim toast is derived directly from state.lastSigilGain — if the
// claim happened within the last TOAST_MS, render the toast. The local tick
// keeps the comparison fresh.

const TOAST_MS = 2600;

const useTick = (ms = 200) => {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
};

const Toast = ({ gain }) => (
  <div className="sigil-toast" role="status">
    <strong>The order rewards you.</strong>
    <span>
      +{formatNumber(gain.faith)} faith · +{formatNumber(gain.money)} money · +{formatNumber(gain.knowledge)} knowledge
    </span>
  </div>
);

export const Sigil = () => {
  const { state, dispatch } = useGame();
  useTick(120);

  const sigil = state.sigil;
  const now = Date.now();

  const recentGain = state.lastSigilGain;
  const toastVisible = recentGain && now - recentGain.at < TOAST_MS;

  if (!sigil) {
    return toastVisible ? <Toast gain={recentGain} /> : null;
  }

  const remaining = Math.max(0, sigil.expiresAt - now);
  const ringPct = Math.max(0, Math.min(100, (remaining / SIGIL_LIFETIME_MS) * 100));

  if (remaining <= 0) {
    // Defensive: reducer's tickSigil should have already cleared this, but in
    // case the player let it expire between ticks, fire the action.
    dispatch(expireSigil());
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="sigil"
        onClick={() => dispatch(claimSigil())}
        title="A sigil of providence — click for a blessing."
        style={{ '--sigil-pct': `${ringPct}%` }}
      >
        <span className="sigil__eye" aria-hidden="true">◉</span>
        <span className="sigil__pulse" aria-hidden="true" />
      </button>
      {toastVisible && <Toast gain={recentGain} />}
    </>
  );
};
