import React, { useState } from 'react';
import { Button } from '../components/Button/Button';
import { N, formatNumber, formatRate } from '../components/Number';
import { useGame } from '../context/GameContext';
import { sacrifice, sacrificeMember } from '../game/actions';
import { TUTORIAL } from '../game/constants';
import { MEMBERS } from '../data/members';
import {
  hpRegenPerSec,
  memberSacrificeFaith,
  passiveFaithPerSec,
  sacrificeFaithGain,
  sacrificeHpCost,
} from '../game/selectors';
import './FaithScreen.css';

export const FaithScreen = () => {
  const { state, dispatch } = useGame();
  const [floats, setFloats] = useState([]);

  const hpCost = sacrificeHpCost(state);
  const faithGain = sacrificeFaithGain(state);
  const tooLow = state.hp < hpCost;

  const ownedMembers = MEMBERS
    .map((m) => ({ member: m, count: (state.members || {})[m.id] || 0 }))
    .filter((x) => x.count > 0);

  const popFloat = (text) => {
    const id = Math.random();
    setFloats((prev) => [...prev, { id, text }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 900);
  };

  const onSacrifice = () => {
    if (tooLow) return;
    dispatch(sacrifice());
    popFloat(`+${formatNumber(faithGain)}`);
  };

  const onSacrificeMember = (member) => {
    const gain = memberSacrificeFaith(state, member);
    dispatch(sacrificeMember(member.id));
    popFloat(`+${formatNumber(gain)}`);
  };

  return (
    <section className="faith">
      <header className="faith__head">
        <h1>Faith</h1>
        <p>Spill the vessel; fill the cup. Each sacrifice draws faith from your blood.</p>
      </header>

      <div className="faith__panel">
        <div className="faith__readouts">
          <div className="readout">
            <span className="readout__lbl">Per sacrifice</span>
            <span className="readout__val"><N value={faithGain} /> faith</span>
          </div>
          <div className="readout">
            <span className="readout__lbl">HP cost</span>
            <span className="readout__val"><N value={hpCost} /> HP</span>
          </div>
          <div className="readout">
            <span className="readout__lbl">Regen</span>
            <span className="readout__val">{formatRate(hpRegenPerSec(state))}/s</span>
          </div>
          <div className="readout">
            <span className="readout__lbl">Passive faith</span>
            <span className="readout__val">{formatRate(passiveFaithPerSec(state))}/s</span>
          </div>
        </div>

        <div className="faith__altar">
          <Button
            variant="primary"
            size="lg"
            disabled={tooLow}
            onClick={onSacrifice}
            className={`faith__btn ${state.tutorialStep === TUTORIAL.SACRIFICE ? 'tut-glow' : ''}`}
          >
            Sacrifice <N value={hpCost} /> HP → +<N value={faithGain} /> Faith
          </Button>

          <div className="faith__floats" aria-hidden="true">
            {floats.map((f) => (
              <span key={f.id} className="faith__float">{f.text}</span>
            ))}
          </div>

          {tooLow && <p className="faith__hint">You are too weak. Wait for your strength to return.</p>}
        </div>

        <p className="faith__total">Total sacrifices made: <strong>{state.totalSacrifices}</strong></p>
      </div>

      {state.orderUnlocked && (
        <div className="faith__panel faith__panel--members">
          <h2 className="faith__sub">Sacrifice a Member</h2>
          <p className="faith__lead">
            Their devotion was theirs to give. Spend a member of your order to draw a deeper draught of faith.
          </p>
          {ownedMembers.length === 0 ? (
            <p className="faith__empty">No members yet. Recruit some on the Order screen, then return here when their use is at hand.</p>
          ) : (
            <ul className="faith__mem-grid">
              {ownedMembers.map(({ member, count }) => {
                const gain = memberSacrificeFaith(state, member);
                return (
                  <li key={member.id} className="faith__mem">
                    <div className="faith__mem-info">
                      <span className="faith__mem-name">{member.name}</span>
                      <span className="faith__mem-count">×{count}</span>
                    </div>
                    <div className="faith__mem-row">
                      <span className="faith__mem-gain">+{gain} faith</span>
                      <Button variant="danger" size="sm" onClick={() => onSacrificeMember(member)}>Sacrifice 1</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
