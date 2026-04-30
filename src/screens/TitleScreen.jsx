import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { EyeOfProvidence } from '../components/EyeOfProvidence/EyeOfProvidence';
import './TitleScreen.css';

export const TitleScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="title">
      <header className="title__header">
        <h1 className="title__h1">Illuminati Confirmed</h1>
        <p className="title__sub">Ordo Ab Chao · Anno Lucis</p>
      </header>

      <div className="title__art">
        <EyeOfProvidence size={280} />
      </div>

      <div className="title__cta">
        <Button variant="primary" size="lg" onClick={() => navigate('/saves')}>
          Begin the Rite
        </Button>
      </div>

      <footer className="title__footer">A humble idle game</footer>
    </div>
  );
};
