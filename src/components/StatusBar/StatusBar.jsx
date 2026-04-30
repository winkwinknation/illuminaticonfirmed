import React from 'react';
import { useGame } from '../../context/GameContext';
import { maxHp } from '../../game/selectors';
import { N } from '../Number';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './StatusBar.css';

export const StatusBar = () => {
  const { state } = useGame();
  const cap = maxHp(state);

  return (
    <header className="status">
      <div className="status__hp">
        <ProgressBar
          value={state.hp}
          max={cap}
          color="var(--hp)"
          label={`HP ${Math.floor(state.hp)} / ${cap}`}
          height={16}
        />
      </div>
      <div className="status__resources">
        <div className="status__r" data-kind="faith" title="Faith">
          <span className="status__icon">✦</span>
          <span className="status__val"><N value={state.faith} /></span>
          <span className="status__lbl">Faith</span>
        </div>
        <div className="status__r" data-kind="money" title="Money">
          <span className="status__icon">⛁</span>
          <span className="status__val"><N value={state.money} /></span>
          <span className="status__lbl">Money</span>
        </div>
        <div className="status__r" data-kind="knowledge" title="Knowledge">
          <span className="status__icon">⌬</span>
          <span className="status__val"><N value={state.knowledge} /></span>
          <span className="status__lbl">Knowledge</span>
        </div>
        {state.prestigeLevel > 0 && (
          <div className="status__r" data-kind="prestige" title="Prestige tier">
            <span className="status__icon">△</span>
            <span className="status__val">{state.prestigeLevel}</span>
            <span className="status__lbl">Tier</span>
          </div>
        )}
        {state.secretKnowledge > 0 && (
          <div className="status__r" data-kind="sk" title="Secret Knowledge">
            <span className="status__icon">◉</span>
            <span className="status__val">{state.secretKnowledge}</span>
            <span className="status__lbl">SK</span>
          </div>
        )}
      </div>
    </header>
  );
};
