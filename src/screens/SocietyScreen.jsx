import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button/Button';
import { N } from '../components/Number';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { useGame } from '../context/GameContext';
import { startMission } from '../game/actions';
import { MISSIONS } from '../data/missions';
import {
  canAffordMission,
  isMissionRunning,
  missionDurationMs,
  missionRemainingMs,
  missionRewardKnowledge,
  missionRewardMoney,
} from '../game/selectors';
import './SocietyScreen.css';

const useTick = (ms = 200) => {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
};

const MissionCard = ({ mission }) => {
  const { state, dispatch } = useGame();
  useTick(200);
  const running = isMissionRunning(state, mission);
  const remaining = missionRemainingMs(state, mission);
  const total = missionDurationMs(state, mission);
  const cantAfford = !canAffordMission(state, mission);
  const hpCost = mission.cost.hpFraction ? Math.ceil(state.hp * mission.cost.hpFraction) : 0;
  const tooHurt = hpCost > 0 && state.hp <= hpCost;

  const moneyReward = missionRewardMoney(state, mission);
  const knowReward = missionRewardKnowledge(state, mission);

  const disabled = running || cantAfford || tooHurt;

  return (
    <article className={`mission mission--${mission.category}`}>
      <header className="mission__head">
        <h3 className="mission__title">{mission.name}</h3>
        <span className={`mission__tag mission__tag--${mission.category}`}>{mission.category}</span>
      </header>
      <p className="mission__desc">{mission.desc}</p>

      <ul className="mission__cost">
        <li>−<N value={mission.cost.faith || 0} /> faith</li>
        {hpCost > 0 && <li>−{hpCost} HP</li>}
      </ul>
      <ul className="mission__rew">
        {moneyReward > 0 && <li>+<N value={moneyReward} /> money</li>}
        {knowReward > 0 && <li>+<N value={knowReward} /> knowledge</li>}
      </ul>

      {running ? (
        <div className="mission__cd">
          <ProgressBar value={total - remaining} max={total} color="var(--gold-500)" height={8} />
          <span className="mission__cd-text">{(remaining / 1000).toFixed(1)}s</span>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => dispatch(startMission(mission.id))}
        >
          {tooHurt ? 'Too wounded' : cantAfford ? 'Need more faith' : 'Begin mission'}
        </Button>
      )}
      {mission.flavor && <p className="mission__flavor">{mission.flavor}</p>}
    </article>
  );
};

export const SocietyScreen = () => {
  return (
    <section className="society">
      <header className="society__head">
        <h1>The Society</h1>
        <p>Faith spent in the right rooms returns in coin and confidences. Rewards arrive when the work is done.</p>
      </header>

      <div className="society__grid">
        {MISSIONS.map((m) => <MissionCard key={m.id} mission={m} />)}
      </div>
    </section>
  );
};
