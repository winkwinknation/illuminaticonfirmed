import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { claimSigil, expireSigil } from '../game/actions';
import {
  SIGIL_AD_DURATION_MS,
  SIGIL_AD_MULTIPLIER,
  SIGIL_LIFETIME_MS,
} from '../game/constants';
import { Button } from './Button/Button';
import { Modal } from './Modal';
import { formatNumber } from './Number';
import './Sigil.css';

// Golden-Cookie analogue with a satirical "rewarded ad" gate.
//
// Reducer's TICK handles spawn timing and lifetime; this component is purely
// UI. Three phases:
//
//   null       — hidden, or showing the spawned sigil button
//   'choosing' — modal asking Claim Now vs Watch the Order's Message
//   'watching' — fake propaganda screen with countdown; locks in 3× reward
//
// To avoid the sigil expiring mid-decision (and stranding the player), the
// reducer dispatches happen up-front: claimSigil is called as soon as the
// player commits, with the appropriate multiplier. The modal continues
// playing the "ad" purely as flavor + payoff theatre.

const TOAST_MS = 2600;

const PROPAGANDA = [
  'A reminder from the Council: Inform on a neighbor today.',
  'Have you spoken with your local Lodge this week?',
  'Subscribe to the Order\'s Monthly Bulletin — eight pages, no signatures.',
  'Ask your Confessor about our new compounded indulgence plans.',
  'Friends of the All-Seeing Eye save 10% on initiation rites.',
  'A finished pyramid is a tomb. Your subscription keeps it open.',
  'Have you considered the freemason in your life?',
  'Tell three trusted persons about us. We\'ll tell three about them.',
  'The Order does not endorse this message. It does not deny it either.',
  'Are you sure your neighbor isn\'t one of us? Call the hotline.',
];

const useTick = (ms = 200) => {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
};

const Toast = ({ gain }) => (
  <div className="sigil-toast" role="status">
    <strong>
      {gain.mul && gain.mul > 1
        ? `The Order rewards your patience. ×${gain.mul}.`
        : 'The Order rewards you.'}
    </strong>
    <span>
      +{formatNumber(gain.faith)} faith · +{formatNumber(gain.money)} money · +{formatNumber(gain.knowledge)} knowledge
    </span>
  </div>
);

const ChooseModal = ({ onClaim, onWatch, onCancel }) => (
  <Modal
    open
    onClose={onCancel}
    title="A Sigil of Providence"
    footer={
      <>
        <Button variant="ghost" size="sm" onClick={onCancel}>Forfeit</Button>
        <Button variant="secondary" size="sm" onClick={onClaim}>Claim now</Button>
        <Button variant="primary" size="sm" onClick={onWatch}>
          Watch the Order's Message · ×{SIGIL_AD_MULTIPLIER}
        </Button>
      </>
    }
  >
    <p>The eye opens; a blessing is offered. You may take it now, or sit through the Order's brief address for a larger pour.</p>
    <p className="sigil-modal__note">
      The "address" is a {Math.round(SIGIL_AD_DURATION_MS / 1000)}-second devotional message — a flavor of in-game rewarded-ad,
      no real ad network. Closes when finished.
    </p>
  </Modal>
);

const WatchModal = ({ remainingMs, copy, canSkip, onSkip }) => {
  const totalSec = Math.ceil(SIGIL_AD_DURATION_MS / 1000);
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const pct = Math.max(0, Math.min(100, ((SIGIL_AD_DURATION_MS - remainingMs) / SIGIL_AD_DURATION_MS) * 100));

  return (
    <Modal
      open
      onClose={canSkip ? onSkip : () => {}}
      title="The Order's Message"
      footer={
        <Button
          variant={canSkip ? 'primary' : 'secondary'}
          size="sm"
          disabled={!canSkip}
          onClick={onSkip}
        >
          {canSkip ? 'Receive your blessing' : `Skip in ${remainingSec}s`}
        </Button>
      }
    >
      <div className="sigil-ad">
        <div className="sigil-ad__chrome">
          <span className="sigil-ad__sponsor">SPONSORED · DEVOTIONAL</span>
          <span className="sigil-ad__timer">{remainingSec}s / {totalSec}s</span>
        </div>
        <div className="sigil-ad__stage">
          <div className="sigil-ad__eye" aria-hidden="true">◉</div>
          <p className="sigil-ad__copy">{copy}</p>
        </div>
        <div className="sigil-ad__bar"><div className="sigil-ad__fill" style={{ width: `${pct}%` }} /></div>
        <p className="sigil-ad__fineprint">
          ×{SIGIL_AD_MULTIPLIER} reward already locked in. This is the celebration.
        </p>
      </div>
    </Modal>
  );
};

export const Sigil = () => {
  const { state, dispatch } = useGame();
  useTick(120);

  const [phase, setPhase] = useState(null); // null | 'choosing' | 'watching'
  const [watchStartedAt, setWatchStartedAt] = useState(0);
  const copyRef = useRef(PROPAGANDA[Math.floor(Math.random() * PROPAGANDA.length)]);

  const sigil = state.sigil;
  const now = Date.now();

  const recentGain = state.lastSigilGain;
  const toastVisible = phase === null && recentGain && now - recentGain.at < TOAST_MS;

  // Sigil expired while the player was deciding — close the modal.
  useEffect(() => {
    if (phase === 'choosing' && !sigil) {
      setPhase(null);
    }
  }, [phase, sigil]);

  // Watching countdown auto-closes itself.
  useEffect(() => {
    if (phase !== 'watching') return undefined;
    const id = setTimeout(() => setPhase(null), SIGIL_AD_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const onSigilClick = () => {
    if (!sigil) return;
    copyRef.current = PROPAGANDA[Math.floor(Math.random() * PROPAGANDA.length)];
    setPhase('choosing');
  };

  const onClaimNow = () => {
    dispatch(claimSigil(1));
    setPhase(null);
  };

  const onWatch = () => {
    // Lock the reward in immediately so a sigil expiry mid-ad can't strand
    // the player. The modal then plays out the propaganda as celebration.
    dispatch(claimSigil(SIGIL_AD_MULTIPLIER));
    setWatchStartedAt(Date.now());
    setPhase('watching');
  };

  const onCancel = () => {
    if (sigil) dispatch(expireSigil());
    setPhase(null);
  };

  const onSkipWatch = () => {
    setPhase(null);
  };

  const adRemaining = phase === 'watching'
    ? Math.max(0, SIGIL_AD_DURATION_MS - (now - watchStartedAt))
    : 0;
  const canSkipAd = adRemaining <= 0;

  const sigilButton = sigil ? (() => {
    const remaining = Math.max(0, sigil.expiresAt - now);
    const ringPct = Math.max(0, Math.min(100, (remaining / SIGIL_LIFETIME_MS) * 100));
    if (remaining <= 0) {
      dispatch(expireSigil());
      return null;
    }
    return (
      <button
        type="button"
        className="sigil"
        onClick={onSigilClick}
        title="A sigil of providence — click for a blessing."
        style={{ '--sigil-pct': `${ringPct}%` }}
      >
        <span className="sigil__eye" aria-hidden="true">◉</span>
        <span className="sigil__pulse" aria-hidden="true" />
      </button>
    );
  })() : null;

  return (
    <>
      {sigilButton}
      {phase === 'choosing' && (
        <ChooseModal onClaim={onClaimNow} onWatch={onWatch} onCancel={onCancel} />
      )}
      {phase === 'watching' && (
        <WatchModal
          remainingMs={adRemaining}
          copy={copyRef.current}
          canSkip={canSkipAd}
          onSkip={onSkipWatch}
        />
      )}
      {toastVisible && <Toast gain={recentGain} />}
    </>
  );
};
