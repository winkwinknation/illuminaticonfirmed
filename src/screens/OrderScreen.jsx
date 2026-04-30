import React from 'react';
import { Button } from '../components/Button/Button';
import { N } from '../components/Number';
import { useGame } from '../context/GameContext';
import { recruitMember } from '../game/actions';
import { MEMBERS } from '../data/members';
import { canAffordMember, memberCost } from '../game/selectors';
import './OrderScreen.css';

const CostLine = ({ cost }) => (
  <span className="mem__cost">
    {cost.money != null && <span className="mem__money"><N value={cost.money} /> money</span>}
    {cost.faith != null && <span className="mem__faith"><N value={cost.faith} /> faith</span>}
    {cost.knowledge != null && <span className="mem__know"><N value={cost.knowledge} /> knowledge</span>}
  </span>
);

const behaviorLabel = (m) => {
  if (m.behavior?.kind === 'autoSacrifice') return 'Active · Auto-sacrifice';
  if (m.behavior?.kind === 'autoMission') return 'Active · Auto-mission';
  if (m.behavior?.kind === 'autoBuyUpgrade') return 'Active · Auto-buy';
  if (m.effect) return 'Passive · Multiplier';
  return '';
};

const MemberCard = ({ member }) => {
  const { state, dispatch } = useGame();
  const owned = (state.members || {})[member.id] || 0;
  const cost = memberCost(state, member);
  const maxed = member.maxOwned && owned >= member.maxOwned;
  const afford = canAffordMember(state, member);

  return (
    <article className={`mem ${member.behavior ? 'mem--active' : 'mem--passive'} ${owned ? 'mem--owned' : ''}`}>
      <header className="mem__head">
        <h3 className="mem__title">{member.name}</h3>
        <span className="mem__count">{owned}{member.maxOwned ? ` / ${member.maxOwned}` : ''}</span>
      </header>
      <p className="mem__role">{behaviorLabel(member)}</p>
      <p className="mem__desc">{member.desc}</p>
      {member.flavor && <p className="mem__flavor">{member.flavor}</p>}
      <div className="mem__row">
        {!maxed && <CostLine cost={cost} />}
        <Button
          variant={afford ? 'primary' : 'secondary'}
          size="sm"
          disabled={!afford}
          onClick={() => dispatch(recruitMember(member.id))}
        >
          {maxed ? 'Order full' : owned ? 'Recruit another' : 'Recruit'}
        </Button>
      </div>
    </article>
  );
};

export const OrderScreen = () => {
  const active = MEMBERS.filter((m) => m.behavior);
  const passive = MEMBERS.filter((m) => m.effect);

  return (
    <section className="order">
      <header className="order__head">
        <h1>Your Order</h1>
        <p>Recruit acolytes, hawkers, scribes. The order grows. Hands and minds bend toward your work.</p>
        <p className="order__note">Active members act only while the game is open. Passive members compound their bonuses even while you are away.</p>
      </header>

      <h2 className="order__sub">Active Hands</h2>
      <div className="order__grid">
        {active.map((m) => <MemberCard key={m.id} member={m} />)}
      </div>

      <h2 className="order__sub">Quiet Influence</h2>
      <div className="order__grid">
        {passive.map((m) => <MemberCard key={m.id} member={m} />)}
      </div>
    </section>
  );
};
