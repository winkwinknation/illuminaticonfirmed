import React from 'react';
import { Button } from '../components/Button/Button';
import { N } from '../components/Number';
import { useGame } from '../context/GameContext';
import { buyUpgrade } from '../game/actions';
import { UPGRADES, UPGRADE_CATEGORIES } from '../data/upgrades';
import { canAffordUpgrade, upgradeCost } from '../game/selectors';
import './ShopScreen.css';

const CostLine = ({ cost }) => (
  <span className="up__cost">
    {cost.money != null && <span className="up__money"><N value={cost.money} /> money</span>}
    {cost.faith != null && <span className="up__faith"><N value={cost.faith} /> faith</span>}
    {cost.knowledge != null && <span className="up__know"><N value={cost.knowledge} /> knowledge</span>}
  </span>
);

const UpgradeRow = ({ upgrade }) => {
  const { state, dispatch } = useGame();
  const owned = state.upgrades[upgrade.id] || 0;
  const cost = upgradeCost(state, upgrade);
  const maxed = upgrade.maxOwned && owned >= upgrade.maxOwned;
  const afford = canAffordUpgrade(state, upgrade);

  return (
    <article className="up">
      <header className="up__head">
        <h3 className="up__title">{upgrade.name}</h3>
        <span className="up__owned">{owned}{upgrade.maxOwned ? ` / ${upgrade.maxOwned}` : ''}</span>
      </header>
      <p className="up__desc">{upgrade.desc}</p>
      {upgrade.flavor && <p className="up__flavor">{upgrade.flavor}</p>}
      <div className="up__row">
        {!maxed && <CostLine cost={cost} />}
        <Button
          variant={afford ? 'primary' : 'secondary'}
          size="sm"
          disabled={!afford}
          onClick={() => dispatch(buyUpgrade(upgrade.id))}
        >
          {maxed ? 'Mastered' : 'Acquire'}
        </Button>
      </div>
    </article>
  );
};

export const ShopScreen = () => {
  return (
    <section className="shop">
      <header className="shop__head">
        <h1>The Shop</h1>
        <p>The order accepts coin and conviction in equal measure.</p>
      </header>

      {UPGRADE_CATEGORIES.map((cat) => {
        const items = UPGRADES.filter((u) => u.category === cat);
        return (
          <div key={cat} className="shop__cat">
            <h2 className="shop__cat-title">{cat}</h2>
            <div className="shop__grid">
              {items.map((u) => <UpgradeRow key={u.id} upgrade={u} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
};
