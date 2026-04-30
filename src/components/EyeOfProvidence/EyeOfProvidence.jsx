import React from 'react';
import './EyeOfProvidence.css';

export const EyeOfProvidence = ({ size = 240, animated = true }) => (
  <div className={`eye ${animated ? 'eye--animated' : ''}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="eyeRays" cx="50%" cy="48%" r="65%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#f0d77a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d77a" />
          <stop offset="100%" stopColor="#9c7d18" />
        </linearGradient>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1c2d63" />
          <stop offset="60%" stopColor="#0a1226" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="98" r="92" fill="url(#eyeRays)" className="eye__rays" />

      <g className="eye__rays-spokes">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x1 = 100 + Math.cos(a) * 30;
          const y1 = 98 + Math.sin(a) * 30;
          const x2 = 100 + Math.cos(a) * 92;
          const y2 = 98 + Math.sin(a) * 92;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0d77a" strokeOpacity="0.15" strokeWidth="1" />;
        })}
      </g>

      <polygon
        points="100,18 184,170 16,170"
        fill="rgba(10,18,38,0.85)"
        stroke="url(#goldStroke)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        className="eye__triangle"
      />

      <g className="eye__pupil">
        <ellipse cx="100" cy="120" rx="34" ry="20" fill="#0a1226" stroke="#f0d77a" strokeWidth="2" />
        <ellipse cx="100" cy="120" rx="14" ry="14" fill="url(#iris)" />
        <circle cx="95" cy="116" r="3" fill="#f0d77a" opacity="0.9" />
      </g>
    </svg>
  </div>
);
