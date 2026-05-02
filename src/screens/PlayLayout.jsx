import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav/BottomNav';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal';
import { formatDuration, formatNumber } from '../components/Number';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { Tutorial } from '../components/Tutorial';
import { GameProvider, useGame } from '../context/GameContext';
import { useSaves } from '../context/SaveContext';
import { OFFLINE_NOTIFY_MIN_MS } from '../game/constants';
import { useAutoSave } from '../hooks/useAutoSave';
import { useAutomation } from '../hooks/useAutomation';
import { useGameLoop } from '../hooks/useGameLoop';
import { useMissionResolver } from '../hooks/useMissionResolver';
import './PlayLayout.css';

const SummaryRow = ({ label, value, color }) => (
  <li className="offline__row">
    <span className="offline__lbl">{label}</span>
    <span className="offline__val" style={color ? { color } : undefined}>{value}</span>
  </li>
);

const formatGain = (n) => (n > 0 ? `+${formatNumber(n)}` : `${formatNumber(n)}`);

const OfflineToast = () => {
  const { state } = useGame();
  const [dismissed, setDismissed] = useState(false);
  const summary = state.lastOfflineSummary;
  const meaningful = summary && summary.dtMs >= OFFLINE_NOTIFY_MIN_MS;

  if (!meaningful || dismissed) return null;

  const hasActive = summary.sacrifices > 0 || summary.missions > 0 || summary.upgradesBought > 0;
  const hasPassive = summary.passiveFaith > 0 || summary.passiveMoney > 0 || summary.passiveKnowledge > 0;

  return (
    <Modal
      open={true}
      onClose={() => setDismissed(true)}
      title="The Order Did Not Sleep"
      footer={<Button variant="primary" size="sm" onClick={() => setDismissed(true)}>Resume</Button>}
    >
      <p>
        {formatDuration(summary.dtMs)} passed in your absence. The order continued its work.
      </p>

      {hasActive && (
        <>
          <h3 className="offline__sub">Active hands</h3>
          <ul className="offline__list">
            {summary.sacrifices > 0 && (
              <SummaryRow
                label={`Sacrifices: ${summary.sacrifices}`}
                value={`${formatGain(summary.sacFaith)} faith`}
                color="var(--faith)"
              />
            )}
            {summary.missions > 0 && (
              <SummaryRow
                label={`Missions completed: ${summary.missions}`}
                value={[
                  summary.missionMoney > 0 && `${formatGain(summary.missionMoney)} money`,
                  summary.missionKnowledge > 0 && `${formatGain(summary.missionKnowledge)} knowledge`,
                  summary.missionFaithNet !== 0 && `${formatGain(summary.missionFaithNet)} faith`,
                ].filter(Boolean).join(' · ')}
              />
            )}
            {summary.upgradesBought > 0 && (
              <SummaryRow
                label="Stewards purchased"
                value={`${summary.upgradesBought} upgrade${summary.upgradesBought === 1 ? '' : 's'}`}
                color="var(--gold-300)"
              />
            )}
          </ul>
        </>
      )}

      {hasPassive && (
        <>
          <h3 className="offline__sub">Quiet streams</h3>
          <ul className="offline__list">
            {summary.passiveFaith > 0 && (
              <SummaryRow label="Whispered faith" value={`${formatGain(summary.passiveFaith)} faith`} color="var(--faith)" />
            )}
            {summary.passiveMoney > 0 && (
              <SummaryRow label="Coin conduit" value={`${formatGain(summary.passiveMoney)} money`} color="var(--money)" />
            )}
            {summary.passiveKnowledge > 0 && (
              <SummaryRow label="Listening stones" value={`${formatGain(summary.passiveKnowledge)} knowledge`} color="var(--knowledge)" />
            )}
          </ul>
        </>
      )}

      {!hasActive && !hasPassive && (
        <p className="offline__empty">No active members or passive income yet — your absence merely passed.</p>
      )}
    </Modal>
  );
};

const InnerShell = ({ slotId }) => {
  const { state, dispatch } = useGame();
  const { persistSlot } = useSaves();
  useGameLoop(dispatch);
  useMissionResolver(state, dispatch);
  useAutomation({ state, dispatch });
  useAutoSave({ state, dispatch, slotId, persistSlot });

  return (
    <div className="play">
      <StatusBar />
      <main className="play__main">
        <Outlet />
      </main>
      <BottomNav />
      <OfflineToast />
      <Tutorial />
    </div>
  );
};

export const PlayLayout = () => {
  const { activeSlotId, loadSlotState } = useSaves();
  if (activeSlotId == null) return <Navigate to="/saves" replace />;

  const initial = loadSlotState(activeSlotId);
  if (!initial) return <Navigate to="/saves" replace />;

  return (
    <GameProvider initialState={initial} key={activeSlotId}>
      <InnerShell slotId={activeSlotId} />
    </GameProvider>
  );
};
