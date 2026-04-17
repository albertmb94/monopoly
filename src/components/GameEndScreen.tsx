import React from 'react';
import { Game } from '../types';
import { GameService } from '../services/gameService';

interface GameEndScreenProps {
  game: Game;
  onNewGame: () => void;
}

export const GameEndScreen: React.FC<GameEndScreenProps> = ({
  game,
  onNewGame,
}) => {
  const playersWithNetWorth = game.players
    .map((player) => ({
      player,
      netWorth: GameService.calculateNetWorth(
        player,
        game.rules.propertySet as 'standard' | 'spanish' | 'custom',
        game.rules.customProperties
      ),
    }))
    .sort((a, b) => b.netWorth.total - a.netWorth.total);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">🎉 ¡PARTIDA FINALIZADA!</h1>
          <p className="text-xl text-slate-400">Podio Final</p>
        </div>

        <div className="space-y-4 mb-8">
          {playersWithNetWorth.map((item, index) => (
            <div
              key={item.player.id}
              className={`p-4 rounded-lg border-2 ${
                index === 0
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : index === 1
                    ? 'border-gray-400 bg-gray-400/10'
                    : index === 2
                      ? 'border-orange-600 bg-orange-600/10'
                      : 'border-slate-700 bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{medals[index] || '👤'}</span>
                  <div>
                    <p className="text-lg font-bold">{item.player.name}</p>
                    <p className="text-sm text-slate-400">
                      Posición #{index + 1}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    ${item.netWorth.total.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-slate-700/50 p-2 rounded">
                  <p className="text-slate-400">Efectivo</p>
                  <p className="font-bold">${item.netWorth.cash}</p>
                </div>
                <div className="bg-slate-700/50 p-2 rounded">
                  <p className="text-slate-400">Propiedades</p>
                  <p className="font-bold">${item.netWorth.properties}</p>
                </div>
                <div className="bg-slate-700/50 p-2 rounded">
                  <p className="text-slate-400">Total</p>
                  <p className="font-bold">${item.netWorth.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNewGame}
          className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all text-lg"
        >
          Nueva Partida
        </button>
      </div>
    </div>
  );
};
