import React, { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal';
import { N, formatNumber } from '../components/Number';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { useGame } from '../context/GameContext';
import { buyBoon, prestige, revealBoon } from '../game/actions';
import { BOONS } from '../data/boons';
import { LORE } from '../data/lore';
import { revealBoonCost } from '../game/formulas';
import {
  boonCost,
  canAffordBoon,
  canPrestige,
  currentPrestigeFaithThreshold,
  currentPrestigeKnowledgeThreshold,
  currentPrestigeMoneyThreshold,
  isBoonRevealed,
  revealedBoonCount,
  skGainOnPrestige,
  unrevealedBoonIds,
} from '../game/selectors';
import './KnowledgeScreen.css';

export const KnowledgeScreen = () => {
  const { state, dispatch } = useGame();
  const [loreOpen, setLoreOpen] = useState(null);
  const [confirmPrestige, setConfirmPrestige] = useState(false);
  const [revealResult, setRevealResult] = useState(null);

  const moneyThreshold = currentPrestigeMoneyThreshold(state);
  const faithThreshold = currentPrestigeFaithThreshold(state);
  const knowledgeThreshold = currentPrestigeKnowledgeThreshold(state);
  const skGain = skGainOnPrestige(state);
  const ready = canPrestige(state);

  const revealedCount = revealedBoonCount(state);
  const unrevealedIds = unrevealedBoonIds(state);
  const revealCost = revealBoonCost(revealedCount);
  const canReveal = unrevealedIds.length > 0 && state.secretKnowledge >= revealCost;

  const onReveal = () => {
    if (unrevealedIds.length === 0) return;
    const pickedId = unrevealedIds[Math.floor(Math.random() * unrevealedIds.length)];
    dispatch(revealBoon(pickedId));
    setRevealResult(pickedId);
  };

  return (
    <section className="kn">
      <header className="kn__head">
        <h1>Secret Knowledge</h1>
        <p>Some truths are bought only by surrendering everything else.</p>
      </header>

      <div className="kn__panel">
        <div className="kn__progress">
          <div className="kn__row">
            <span>Money required</span>
            <span><N value={state.money} /> / {formatNumber(moneyThreshold)}</span>
          </div>
          <ProgressBar value={state.money} max={moneyThreshold} color="var(--money)" height={10} />
          <div className="kn__row">
            <span>Faith required</span>
            <span><N value={state.faith} /> / {formatNumber(faithThreshold)}</span>
          </div>
          <ProgressBar value={state.faith} max={faithThreshold} color="var(--faith)" height={10} />
          <div className="kn__row">
            <span>Knowledge required</span>
            <span><N value={state.knowledge} /> / {formatNumber(knowledgeThreshold)}</span>
          </div>
          <ProgressBar value={state.knowledge} max={knowledgeThreshold} color="var(--knowledge)" height={10} />
        </div>

        <div className="kn__cta">
          <div className="kn__sk">
            Prestige tier: <strong>{state.prestigeLevel}</strong> · SK held: <strong><N value={state.secretKnowledge} placesUnder1000={0} /></strong>
          </div>
          <Button
            variant="primary"
            size="lg"
            disabled={!ready}
            onClick={() => setConfirmPrestige(true)}
          >
            {ready ? `Ascend → +${skGain} SK` : 'Sealed'}
          </Button>
        </div>
      </div>

      <div className="kn__reveal-bar">
        <div>
          <h2 className="kn__sub">Boons of the Order</h2>
          <p className="kn__lead">
            {unrevealedIds.length > 0
              ? `${revealedCount} of ${revealedCount + unrevealedIds.length} truths revealed. Spend Secret Knowledge to uncover one at random.`
              : 'All truths revealed. Deepen them with further Secret Knowledge.'}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          disabled={!canReveal}
          onClick={onReveal}
        >
          {unrevealedIds.length === 0 ? 'All revealed' : <>Reveal a Truth · <N value={revealCost} placesUnder1000={0} /> SK</>}
        </Button>
      </div>

      <div className="kn__grid">
        {BOONS.map((b) => {
          const revealed = isBoonRevealed(state, b);
          if (!revealed) {
            return (
              <article key={b.id} className="boon boon--hidden">
                <header className="boon__head">
                  <h3 className="boon__title">???</h3>
                  <span className="boon__owned">—</span>
                </header>
                <p className="boon__desc">An unspoken truth, sealed until the order deems you ready.</p>
              </article>
            );
          }
          const owned = state.boons[b.id] || 0;
          const cost = boonCost(state, b);
          const maxed = b.maxOwned && owned >= b.maxOwned;
          const afford = canAffordBoon(state, b);

          return (
            <article key={b.id} className="boon boon--owned">
              <header className="boon__head">
                <h3 className="boon__title">{b.name}</h3>
                <span className="boon__owned">×{owned}{b.maxOwned ? `/${b.maxOwned}` : ''}</span>
              </header>
              <p className="boon__desc">{b.desc}</p>
              <div className="boon__row">
                {!maxed && <span className="boon__cost"><N value={cost} placesUnder1000={0} /> SK</span>}
                <div className="boon__actions">
                  <Button variant="ghost" size="sm" onClick={() => setLoreOpen(b.loreId)}>Lore</Button>
                  <Button
                    variant={afford ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!afford}
                    onClick={() => dispatch(buyBoon(b.id))}
                  >
                    {maxed ? 'Mastered' : 'Deepen'}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        open={loreOpen != null}
        onClose={() => setLoreOpen(null)}
        title={loreOpen ? LORE[loreOpen]?.title : ''}
        footer={<Button variant="secondary" size="sm" onClick={() => setLoreOpen(null)}>Close</Button>}
      >
        {loreOpen && <p>{LORE[loreOpen]?.body}</p>}
      </Modal>

      <Modal
        open={revealResult != null}
        onClose={() => setRevealResult(null)}
        title="A Truth is Revealed"
        footer={<Button variant="primary" size="sm" onClick={() => setRevealResult(null)}>Read on</Button>}
      >
        {revealResult && (
          <>
            <p><strong>{BOONS.find((b) => b.id === revealResult)?.name}</strong></p>
            <p>{BOONS.find((b) => b.id === revealResult)?.desc}</p>
          </>
        )}
      </Modal>

      <Modal
        open={confirmPrestige}
        onClose={() => setConfirmPrestige(false)}
        title="Ascend to a New Order"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmPrestige(false)}>Wait</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { dispatch(prestige()); setConfirmPrestige(false); }}
            >
              Ascend
            </Button>
          </>
        }
      >
        <p>
          You will gain <strong>+{skGain} Secret Knowledge</strong>. Money, faith, knowledge, HP, shop upgrades and members will be reset.
          Boons, prestige tier, SK, and unlocked lore are kept. The next ascension will require even more.
        </p>
      </Modal>
    </section>
  );
};
