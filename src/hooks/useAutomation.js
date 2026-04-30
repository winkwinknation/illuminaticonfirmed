import { useEffect, useRef } from 'react';
import { buyUpgrade, sacrifice, startMission } from '../game/actions';
import { AUTOMATION_TICK_MS } from '../game/constants';
import { MEMBERS } from '../data/members';
import { MISSIONS_BY_ID } from '../data/missions';
import { UPGRADES } from '../data/upgrades';
import {
  canAffordMission,
  canAffordUpgrade,
  isMissionRunning,
  maxHp,
  sacrificeHpCost,
  upgradeCost,
} from '../game/selectors';

const cheapestAffordableUpgradeId = (state) => {
  let best = null;
  let bestScore = Infinity;
  for (const u of UPGRADES) {
    if (!canAffordUpgrade(state, u)) continue;
    const c = upgradeCost(state, u);
    const score = (c.money || 0) + (c.faith || 0) * 10 + (c.knowledge || 0) * 25;
    if (score < bestScore) { bestScore = score; best = u; }
  }
  return best ? best.id : null;
};

export const useAutomation = ({ state, dispatch }) => {
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastFireRef = useRef({}); // memberId -> timestamp

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      if (!s) return;
      const now = Date.now();
      const last = lastFireRef.current;

      for (const m of MEMBERS) {
        if (!m.behavior) continue;
        const owned = (s.members || {})[m.id] || 0;
        if (!owned) continue;

        const b = m.behavior;

        if (b.kind === 'autoSacrifice') {
          const interval = b.intervalMs || 3000;
          const eff = interval / Math.max(1, owned);
          if (now - (last[m.id] || 0) < eff) continue;
          const minHp = b.minHpFraction != null ? maxHp(s) * b.minHpFraction : 0;
          if (s.hp < sacrificeHpCost(s)) continue;
          if (s.hp < minHp) continue;
          dispatch(sacrifice());
          last[m.id] = now;
        } else if (b.kind === 'autoMission') {
          const fullMission = MISSIONS_BY_ID[b.missionId];
          if (!fullMission) continue;
          if (isMissionRunning(s, fullMission, now)) continue;
          if (!canAffordMission(s, fullMission)) continue;
          if (b.minHpFraction != null) {
            if (s.hp < maxHp(s) * b.minHpFraction) continue;
          }
          const hpCost = fullMission.cost.hpFraction ? Math.ceil(s.hp * fullMission.cost.hpFraction) : 0;
          if (hpCost && s.hp <= hpCost) continue;
          dispatch(startMission(fullMission.id));
          last[m.id] = now;
        } else if (b.kind === 'autoBuyUpgrade') {
          const interval = b.intervalMs || 6000;
          const eff = interval / Math.max(1, owned);
          if (now - (last[m.id] || 0) < eff) continue;
          const id2 = cheapestAffordableUpgradeId(s);
          if (!id2) continue;
          dispatch(buyUpgrade(id2));
          last[m.id] = now;
        }
      }
    }, AUTOMATION_TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);
};
