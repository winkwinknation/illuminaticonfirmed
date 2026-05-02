import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button/Button';
import { N, formatDuration } from '../components/Number';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { useGame } from '../context/GameContext';
import {
  clearRivalryLog,
  dismissRivalryResult,
  startRivalryMission,
} from '../game/actions';
import { RIVALS_BY_ID } from '../data/rivals';
import {
  canAffordRivalry,
  isRivalryRunning,
  nextLockedRivalryMission,
  rivalryRemainingMs,
  unlockHints,
  visibleRivalryMissions,
} from '../game/selectors';
import './RivalsScreen.css';

const useTick = (ms = 200) => {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
};

const UNIT_LABEL = {
  soldier: 'soldier',
  spy: 'spy',
  war_engine: 'war engine',
};

const pluralizeUnit = (id, n) => {
  const lbl = UNIT_LABEL[id] || id;
  if (n === 1) return `1 ${lbl}`;
  if (id === 'spy') return `${n} spies`;
  return `${n} ${lbl}s`;
};

const RangeLine = ({ label, range, color }) => (
  <li style={color ? { color } : undefined}>
    {label}: <strong>{range[0]}–{range[1]}</strong>
  </li>
);

const MissionCard = ({ mission }) => {
  const { state, dispatch } = useGame();
  useTick(250);
  const rival = RIVALS_BY_ID[mission.rivalId];
  const running = isRivalryRunning(state, mission);
  const remaining = rivalryRemainingMs(state, mission);
  const total = mission.durationMs;
  const afford = canAffordRivalry(state, mission);
  const need = mission.cost?.units || {};
  const have = state.members || {};

  const missingLines = Object.keys(need)
    .filter((id) => (have[id] || 0) < need[id])
    .map((id) => `Need ${pluralizeUnit(id, need[id] - (have[id] || 0))} more`);

  const r = mission.rewardOnSuccess || {};
  const losses = mission.losses || {};

  return (
    <article
      className={`riv riv--${mission.kind}`}
      style={rival ? { borderLeftColor: rival.color } : undefined}
    >
      <header className="riv__head">
        <h3 className="riv__title">{mission.name}</h3>
        <span className={`riv__tag riv__tag--${mission.kind}`}>{mission.kind}</span>
      </header>
      {rival && (
        <p className="riv__rival" style={{ color: rival.color }}>
          vs. {rival.short}
        </p>
      )}
      <p className="riv__desc">{mission.desc}</p>

      <div className="riv__stats">
        <span className="riv__chance">
          {Math.round(mission.successChance * 100)}% success
        </span>
        <span className="riv__dur">{formatDuration(total)}</span>
      </div>

      <div className="riv__cost">
        <span className="riv__sub">Send</span>
        <ul>
          {Object.keys(need).map((id) => (
            <li key={id}>
              {pluralizeUnit(id, need[id])}{' '}
              <span className="riv__inv">
                ({have[id] || 0} on roster)
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="riv__rewards">
        <span className="riv__sub">On success</span>
        <ul>
          {r.money && <RangeLine label="money" range={r.money} color="var(--money)" />}
          {r.faith && <RangeLine label="faith" range={r.faith} color="var(--faith)" />}
          {r.knowledge && <RangeLine label="knowledge" range={r.knowledge} color="var(--knowledge)" />}
        </ul>
      </div>

      <div className="riv__losses">
        <span className="riv__sub">On failure</span>
        <ul>
          {Object.keys(losses).map((id) => (
            <li key={id}>
              lose <strong>{losses[id][0]}–{losses[id][1]}</strong> {UNIT_LABEL[id] || id}
              {id === 'spy' ? '' : losses[id][1] === 1 ? '' : 's'}
            </li>
          ))}
          {mission.kind === 'espionage' && mission.hpDrainOnFail && (
            <li style={{ color: 'var(--hp)' }}>
              <strong>{mission.hpDrainOnFail[0]}–{mission.hpDrainOnFail[1]}</strong> HP drained
            </li>
          )}
        </ul>
      </div>

      {running ? (
        <div className="riv__cd">
          <ProgressBar value={total - remaining} max={total} color="var(--gold-500)" height={8} />
          <span className="riv__cd-text">{formatDuration(remaining)}</span>
        </div>
      ) : (
        <Button
          variant={afford ? 'primary' : 'secondary'}
          size="sm"
          disabled={!afford}
          onClick={() => dispatch(startRivalryMission(mission.id))}
        >
          {afford ? 'Commit forces' : (missingLines[0] || 'Not enough')}
        </Button>
      )}

      {mission.flavor && <p className="riv__flavor">{mission.flavor}</p>}
    </article>
  );
};

const NextLockedCard = ({ item, hints }) => (
  <article className="riv riv--locked">
    <header className="riv__head">
      <h3 className="riv__title">A campaign you cannot yet wage…</h3>
      <span className="riv__tag riv__tag--locked">Locked</span>
    </header>
    <p className="riv__desc">A future campaign waits to be unlocked. Requires:</p>
    <ul className="riv__lock-list">
      {hints.map((h, i) => <li key={i}>· {h}</li>)}
    </ul>
  </article>
);

const ResultEntry = ({ entry, onDismiss }) => {
  const rival = RIVALS_BY_ID[entry.rivalId];
  const { rewards, losses } = entry;
  const wonAny = rewards.money || rewards.faith || rewards.knowledge;
  const lostAny = losses.soldier || losses.spy || losses.war_engine || entry.hpDrain;

  return (
    <li className={`rivlog__entry rivlog__entry--${entry.success ? 'win' : 'loss'}`}>
      <div className="rivlog__head">
        <span className="rivlog__title">
          {entry.success ? 'Victory' : 'Defeat'}: <strong>{entry.missionName}</strong>
        </span>
        {rival && (
          <span className="rivlog__rival" style={{ color: rival.color }}>{rival.short}</span>
        )}
        <button className="rivlog__close" onClick={() => onDismiss(entry.id)} aria-label="Dismiss">×</button>
      </div>
      <div className="rivlog__body">
        {wonAny ? (
          <span className="rivlog__rewards">
            {rewards.money > 0 && <span style={{ color: 'var(--money)' }}>+<N value={rewards.money} /> money </span>}
            {rewards.faith > 0 && <span style={{ color: 'var(--faith)' }}>+<N value={rewards.faith} /> faith </span>}
            {rewards.knowledge > 0 && <span style={{ color: 'var(--knowledge)' }}>+<N value={rewards.knowledge} /> knowledge </span>}
          </span>
        ) : null}
        {lostAny ? (
          <span className="rivlog__losses">
            {losses.soldier > 0 && <>−{losses.soldier} soldier{losses.soldier === 1 ? '' : 's'} </>}
            {losses.spy > 0 && <>−{losses.spy} spy{losses.spy === 1 ? '' : ' (multiple)'} </>}
            {losses.war_engine > 0 && <>−{losses.war_engine} war engine{losses.war_engine === 1 ? '' : 's'} </>}
            {entry.hpDrain > 0 && <span style={{ color: 'var(--hp)' }}>−{entry.hpDrain} HP </span>}
          </span>
        ) : null}
      </div>
    </li>
  );
};

export const RivalsScreen = () => {
  const { state, dispatch } = useGame();
  const missions = visibleRivalryMissions(state);
  const next = nextLockedRivalryMission(state);
  const hints = next ? unlockHints(state, next) : [];
  const log = state.rivalryLog || [];

  const have = state.members || {};
  const rosterEmpty = !have.soldier && !have.spy && !have.war_engine;

  return (
    <section className="rivals">
      <header className="rivals__head">
        <h1>Rivals</h1>
        <p>The order does not move alone. Other orders move with it, against it, around it. Send your roster to fight, to steal, to pry.</p>
      </header>

      <div className="rivals__roster">
        <span className="rivals__roster-lbl">Your roster:</span>
        <span className="rivals__roster-pip" data-kind="soldier">⚔ <strong>{have.soldier || 0}</strong> soldiers</span>
        <span className="rivals__roster-pip" data-kind="spy">◐ <strong>{have.spy || 0}</strong> spies</span>
        <span className="rivals__roster-pip" data-kind="war_engine">⚙ <strong>{have.war_engine || 0}</strong> war engines</span>
        <span className="rivals__roster-stats">
          {state.totalRivalryWins || 0} won · {state.totalRivalryLosses || 0} lost
        </span>
      </div>

      {rosterEmpty && (
        <p className="rivals__empty">
          You have no roster yet. Recruit Soldiers, Spies, or War Engines on the Order tab, then return here.
        </p>
      )}

      {log.length > 0 && (
        <aside className="rivlog">
          <header className="rivlog__bar">
            <h2 className="rivlog__title-bar">Recent Skirmishes</h2>
            <Button variant="ghost" size="sm" onClick={() => dispatch(clearRivalryLog())}>Clear</Button>
          </header>
          <ul className="rivlog__list">
            {log.map((e) => (
              <ResultEntry key={e.id} entry={e} onDismiss={(id) => dispatch(dismissRivalryResult(id))} />
            ))}
          </ul>
        </aside>
      )}

      <div className="rivals__grid">
        {missions.map((m) => <MissionCard key={m.id} mission={m} />)}
        {next && <NextLockedCard item={next} hints={hints} />}
      </div>
    </section>
  );
};
