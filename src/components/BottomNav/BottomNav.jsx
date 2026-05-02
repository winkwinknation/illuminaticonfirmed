import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { TUTORIAL } from '../../game/constants';
import { canUnlockOrder, hasActionableSecrets } from '../../game/selectors';
import './BottomNav.css';

const TABS = [
  { to: '/play/faith', label: 'Faith', icon: '✦' },
  { to: '/play/society', label: 'Society', icon: '⚜' },
  { to: '/play/shop', label: 'Shop', icon: '⛁' },
  { to: '/play/order', label: 'Order', icon: '☩' },
  { to: '/play/rivals', label: 'Rivals', icon: '⚔' },
  { to: '/play/knowledge', label: 'Secrets', icon: '△' },
];

const tutorialTargetTab = (step) => {
  if (step === TUTORIAL.SACRIFICE) return '/play/faith';
  if (step === TUTORIAL.GO_SOCIETY) return '/play/society';
  if (step === TUTORIAL.GO_SHOP) return '/play/shop';
  return null;
};

export const BottomNav = () => {
  const { state } = useGame();
  // Pulse the Secrets dot only when there's something the player can act on
  // — prestige available, an unrevealed boon affordable, or a deepenable boon.
  // Otherwise it would stay lit forever after the first prestige.
  const knowledgeReady = hasActionableSecrets(state);
  const orderReady = canUnlockOrder(state);
  const orderLocked = !state.orderUnlocked;
  const tutTab = tutorialTargetTab(state.tutorialStep);

  return (
    <nav className="nav" aria-label="Game navigation">
      {TABS.map((t) => {
        const isOrder = t.to === '/play/order';
        const isRivals = t.to === '/play/rivals';
        const isSecrets = t.to === '/play/knowledge';
        const showBadge = (isSecrets && knowledgeReady) || (isOrder && orderReady);
        // Rivals tab shares the Order knowledge gate.
        const lockedTab = (isOrder || isRivals) && orderLocked;
        const tutorialGlow = tutTab === t.to;

        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              [
                'nav__item',
                isActive ? 'nav__item--active' : '',
                lockedTab ? 'nav__item--locked' : '',
                tutorialGlow ? 'tut-glow' : '',
              ].filter(Boolean).join(' ')
            }
          >
            <span className="nav__icon" aria-hidden="true">{lockedTab ? '🔒' : t.icon}</span>
            <span className="nav__label">{t.label}</span>
            {showBadge && <span className="nav__badge" />}
          </NavLink>
        );
      })}
    </nav>
  );
};
