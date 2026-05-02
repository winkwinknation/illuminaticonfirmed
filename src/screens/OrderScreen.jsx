import React from 'react';
import { Button } from '../components/Button/Button';
import { N } from '../components/Number';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { useGame } from '../context/GameContext';
import { recruitMember, unlockOrder } from '../game/actions';
import {
  canAffordMember,
  canUnlockOrder,
  memberCost,
  nextLockedMember,
  orderUnlockCost,
  unlockHints,
  visibleMembers,
} from '../game/selectors';
import './OrderScreen.css';

const CostLine = ({ cost }) => (
  <span className="mem__cost">
    {cost.money != null && <span className="mem__money"><N value={cost.money} /> money</span>}
    {cost.faith != null && <span className="mem__faith"><N value={cost.faith} /> faith</span>}
    {cost.knowledge != null && <span className="mem__know"><N value={cost.knowledge} /> knowledge</span>}
  </span>
);

const behaviorLabel = (m) => {
  if (m.unitKind === 'soldier') return 'Roster · Soldier';
  if (m.unitKind === 'spy') return 'Roster · Spy';
  if (m.unitKind === 'war_engine') return 'Roster · War Engine';
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
    <article className={`mem ${member.unitKind ? 'mem--roster' : member.behavior ? 'mem--active' : 'mem--passive'} ${owned ? 'mem--owned' : ''}`}>
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

const LockedMemberCard = ({ member, hints }) => (
  <article className={`mem ${member.behavior ? 'mem--active' : 'mem--passive'} mem--locked`}>
    <header className="mem__head">
      <h3 className="mem__title">A name unspoken…</h3>
      <span className="mem__count">Locked</span>
    </header>
    <p className="mem__role">{behaviorLabel(member)}</p>
    <p className="mem__desc">A future hand awaits the order's call.</p>
    <ul className="mem__lock-list">
      {hints.map((h, i) => <li key={i}>· {h}</li>)}
    </ul>
  </article>
);

const OrderLockedView = () => {
  const { state, dispatch } = useGame();
  const cost = orderUnlockCost();
  const can = canUnlockOrder(state);
  const need = Math.max(0, cost - (state.knowledge || 0));

  return (
    <section className="order">
      <header className="order__head">
        <h1>Your Order</h1>
        <p>The order does not gather where there is nothing to learn. Spend knowledge to inaugurate it.</p>
      </header>

      <div className="order__lock">
        <h2 className="order__lock-title">Inaugurate the Order</h2>
        <p className="order__lock-text">
          Knowledge is the price of membership. Once paid, the doors open — and they remain open
          through every age that follows.
        </p>

        <div className="order__lock-progress">
          <div className="order__lock-row">
            <span>Knowledge required</span>
            <span><N value={state.knowledge || 0} /> / {cost}</span>
          </div>
          <ProgressBar
            value={Math.min(state.knowledge || 0, cost)}
            max={cost}
            color="var(--knowledge)"
            height={10}
          />
        </div>

        <div className="order__lock-cta">
          <Button
            variant="primary"
            size="lg"
            disabled={!can}
            onClick={() => dispatch(unlockOrder())}
          >
            {can ? `Spend ${cost} knowledge → Inaugurate` : `Need ${need} more knowledge`}
          </Button>
        </div>

        <p className="order__lock-hint">
          Knowledge is gathered chiefly from rumor missions on the Society tab. Once the Order is
          opened, you may recruit acolytes, hawkers, scribes, and more.
        </p>
      </div>
    </section>
  );
};

export const OrderScreen = () => {
  const { state } = useGame();

  if (!state.orderUnlocked) return <OrderLockedView />;

  const visible = visibleMembers(state);
  const active = visible.filter((m) => m.behavior);
  const passive = visible.filter((m) => m.effect);
  const roster = visible.filter((m) => m.unitKind);
  const next = nextLockedMember(state);
  const nextHints = next ? unlockHints(state, next) : [];

  return (
    <section className="order">
      <header className="order__head">
        <h1>Your Order</h1>
        <p>Recruit acolytes, hawkers, scribes. The order grows. Hands and minds bend toward your work.</p>
        <p className="order__note">Active members act only while the game is open. Passive members compound their bonuses even while you are away.</p>
      </header>

      {active.length > 0 && (
        <>
          <h2 className="order__sub">Active Hands</h2>
          <div className="order__grid">
            {active.map((m) => <MemberCard key={m.id} member={m} />)}
          </div>
        </>
      )}

      {passive.length > 0 && (
        <>
          <h2 className="order__sub">Quiet Influence</h2>
          <div className="order__grid">
            {passive.map((m) => <MemberCard key={m.id} member={m} />)}
          </div>
        </>
      )}

      {roster.length > 0 && (
        <>
          <h2 className="order__sub">War Roster</h2>
          <p className="order__roster-note">
            Soldiers, Spies, and War Engines are <em>spent</em> on the Rivals tab. Send them on
            campaigns of conflict or espionage — survivors return, the unfortunate do not.
          </p>
          <div className="order__grid">
            {roster.map((m) => <MemberCard key={m.id} member={m} />)}
          </div>
        </>
      )}

      {next && (
        <>
          <h2 className="order__sub">Next to Reveal</h2>
          <div className="order__grid">
            <LockedMemberCard member={next} hints={nextHints} />
          </div>
        </>
      )}
    </section>
  );
};
