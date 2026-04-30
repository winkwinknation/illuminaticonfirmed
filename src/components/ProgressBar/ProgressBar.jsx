import React from 'react';
import './ProgressBar.css';

export const ProgressBar = ({ value, max, color = 'var(--gold-500)', label, height = 14 }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="pbar" style={{ '--pbar-h': `${height}px`, '--pbar-color': color }}>
      <div className="pbar__track">
        <div className="pbar__fill" style={{ width: `${pct}%` }} />
      </div>
      {label && <div className="pbar__label">{label}</div>}
    </div>
  );
};
