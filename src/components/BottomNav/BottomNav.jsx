import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { canPrestige } from '../../game/selectors';
import './BottomNav.css';

const TABS = [
  { to: '/play/faith', label: 'Faith', icon: '✦' },
  { to: '/play/society', label: 'Society', icon: '⚜' },
  { to: '/play/shop', label: 'Shop', icon: '⛁' },
  { to: '/play/order', label: 'Order', icon: '☩' },
  { to: '/play/knowledge', label: 'Secrets', icon: '△' },
];

export const BottomNav = () => {
  const { state } = useGame();
  const knowledgeReady = canPrestige(state) || state.prestigeLevel > 0 || state.secretKnowledge > 0;

  return (
    <nav className="nav" aria-label="Game navigation">
      {TABS.map((t) => {
        const showBadge = t.to === '/play/knowledge' && knowledgeReady;
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `nav__item ${isActive ? 'nav__item--active' : ''}`}
          >
            <span className="nav__icon" aria-hidden="true">{t.icon}</span>
            <span className="nav__label">{t.label}</span>
            {showBadge && <span className="nav__badge" />}
          </NavLink>
        );
      })}
    </nav>
  );
};
