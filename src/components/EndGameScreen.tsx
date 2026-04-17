import React from 'react';
import { useGameStore } from '../store/gameStore';

export const EndGameScreen: React.FC = () => {
  const game = useGameStore((s) => s.game)!;
  const properties = useGameStore((s) => s.getProperties)();
  const resetGame = useGameStore((s) => s.resetGame);
  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;

  const ranking = game.players
    .map((p) => {
      const ownedProps = properties.filter((prop) => p.properties.includes(prop.id));
      const propValue = ownedProps.reduce((sum, prop) => {
        const isMortgaged = p.mortgagedProperties.includes(prop.id);
        return sum + (isMortgaged ? prop.mortgageValue : prop.purchasePrice);
      }, 0);
      const buildingsValue = ownedProps.reduce((sum, prop) => {
        const houses = p.housesPerProperty?.[prop.id] || 0;
        if (houses === 5) return sum + prop.hotelPrice + prop.housePrice * 4;
        return sum + houses * prop.housePrice;
      }, 0);
      const total = p.balance + propValue + buildingsValue;
      return { player: p, cash: p.balance, propValue, buildingsValue, total };
    })
    .sort((a, b) => b.total - a.total);

  const podium = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto py-6">
        <div className="text-center text-white mb-6">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="text-4xl font-extrabold">¡Fin de la Partida!</h1>
          <p className="opacity-90">
            Duración: {Math.floor((Date.now() - game.createdAt) / 60000)} minutos
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {ranking.map((r, idx) => (
            <div
              key={r.player.id}
              className={`bg-white rounded-2xl shadow-xl p-4 ${
                idx === 0 ? 'ring-4 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{podium[idx] || `${idx + 1}.`}</div>
                  <div>
                    <div className="font-bold text-lg">{r.player.name}</div>
                    <div className="text-xs text-gray-500">
                      {r.player.properties.length} propiedades
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-emerald-700">
                    {fmt(r.total)}
                  </div>
                  <div className="text-xs text-gray-400">Patrimonio total</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 grid grid-cols-3 gap-2 pt-2 border-t">
                <div>💵 {fmt(r.cash)}</div>
                <div>🏘️ {fmt(r.propValue)}</div>
                <div>🏠 {fmt(r.buildingsValue)}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-white text-amber-800 font-bold py-4 rounded-xl shadow-lg"
        >
          🎲 Nueva Partida
        </button>
      </div>
    </div>
  );
};
