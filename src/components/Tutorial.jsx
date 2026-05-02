import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button/Button';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';
import { completeTutorial, setTutorialStep } from '../game/actions';
import { TUTORIAL } from '../game/constants';
import './Tutorial.css';

// The tutorial leans on three mechanisms:
//   1. Modals at the bookends (welcome + closing) — the only blocking pieces.
//   2. A non-blocking floating hint that names the next action and surfaces a
//      Skip option throughout.
//   3. Reducer-side advancement: SACRIFICE / START_MISSION / BUY_UPGRADE bump
//      the step on success. PlayLayout-side route watching covers tab visits.
//
// Visual highlight (pulsing border on the relevant nav button or action card)
// is done by the consuming screens reading state.tutorialStep directly. This
// component just orchestrates step transitions and renders the prompts.

const HINTS = {
  [TUTORIAL.SACRIFICE]: {
    title: 'Step 1 — Sacrifice',
    body: 'Tap the glowing Sacrifice button on the Faith tab. It costs 25 HP and grants your first faith.',
  },
  [TUTORIAL.GO_SOCIETY]: {
    title: 'Step 2 — Open the Society',
    body: 'Tap the Society tab in the menu — it is highlighted. Faith is spent on missions there.',
  },
  [TUTORIAL.START_MISSION]: {
    title: 'Step 3 — Run a Mission',
    body: 'Tap Begin Mission on Barter at the Market. The reward arrives when the timer fills.',
  },
  [TUTORIAL.GO_SHOP]: {
    title: 'Step 4 — Open the Shop',
    body: 'When the mission resolves, money will arrive. Tap the Shop tab — it is highlighted.',
  },
  [TUTORIAL.BUY_UPGRADE]: {
    title: 'Step 5 — Acquire an Upgrade',
    body: 'Tap Acquire on the glowing Devout Hand. If you cannot afford it yet, run another mission first.',
  },
};

const WelcomeModal = ({ onBegin, onSkip }) => (
  <Modal
    open
    onClose={onSkip}
    title="Welcome to the Order"
    footer={
      <>
        <Button variant="ghost" size="sm" onClick={onSkip}>Skip tutorial</Button>
        <Button variant="primary" size="sm" onClick={onBegin}>Begin</Button>
      </>
    }
  >
    <p>A gentle word before the rite begins. The order moves through three currencies:</p>
    <ul className="tut__list">
      <li><span className="tut__pip" data-kind="faith">✦</span> <strong>Faith</strong> — drawn from your blood, the lever of every other system.</li>
      <li><span className="tut__pip" data-kind="money">⛁</span> <strong>Money</strong> — earned in the Society, spent in the Shop.</li>
      <li><span className="tut__pip" data-kind="knowledge">⌬</span> <strong>Knowledge</strong> — the rarest. It opens doors that money cannot.</li>
    </ul>
    <p className="tut__hint">I will guide you through your first few moves. The order will glow where you should look.</p>
  </Modal>
);

const ClosingModal = ({ onDone }) => (
  <Modal
    open
    onClose={onDone}
    title="The Rest is Yours"
    footer={<Button variant="primary" size="sm" onClick={onDone}>Begin in earnest</Button>}
  >
    <p>You know enough to keep the engine turning: sacrifice for faith, run missions for coin and knowledge, spend coin on the Shop.</p>
    <p>
      The <strong>Order</strong> tab will open once you have spent enough <em>knowledge</em> to inaugurate it.
      Far past that, the <strong>Secrets</strong> tab will let you ascend, trading this age for permanent boons in the next.
    </p>
    <p className="tut__hint">Watch the dashed cards on each screen — they tell you what unlocks next.</p>
  </Modal>
);

const Hint = ({ step, onSkip }) => {
  const h = HINTS[step];
  if (!h) return null;
  return (
    <aside className="tut-hint" role="note" aria-live="polite">
      <div className="tut-hint__inner">
        <h3 className="tut-hint__title">{h.title}</h3>
        <p className="tut-hint__body">{h.body}</p>
      </div>
      <button className="tut-hint__skip" onClick={onSkip} type="button" aria-label="Skip tutorial">Skip</button>
    </aside>
  );
};

export const Tutorial = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const step = state.tutorialStep ?? TUTORIAL.DONE;

  // Watch route changes to advance tab-visit steps.
  useEffect(() => {
    if (step === TUTORIAL.GO_SOCIETY && location.pathname === '/play/society') {
      dispatch(setTutorialStep(TUTORIAL.START_MISSION));
    } else if (step === TUTORIAL.GO_SHOP && location.pathname === '/play/shop') {
      dispatch(setTutorialStep(TUTORIAL.BUY_UPGRADE));
    }
  }, [step, location.pathname, dispatch]);

  if (step === TUTORIAL.DONE) return null;

  const skip = () => dispatch(completeTutorial());

  if (step === TUTORIAL.WELCOME) {
    return (
      <WelcomeModal
        onBegin={() => {
          // Make sure we're on /play/faith before pointing at the altar.
          if (location.pathname !== '/play/faith') navigate('/play/faith');
          dispatch(setTutorialStep(TUTORIAL.SACRIFICE));
        }}
        onSkip={skip}
      />
    );
  }

  if (step === TUTORIAL.CLOSING) {
    return <ClosingModal onDone={skip} />;
  }

  return <Hint step={step} onSkip={skip} />;
};
