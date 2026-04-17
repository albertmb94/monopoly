import React, { useState } from 'react';
import { Game } from '../types';
import { GameService } from '../services/gameService';
import { useGameStore } from '../store/gameStore';

interface BankerPanelProps {
  game: Game;
}

export const BankerPanel: React.FC<BankerPanelProps> = ({ game }) => {
  const { setGame } = useGameStore();
  const [showEmitMoney, setShowEmitMoney] = useState(false);
  const [emitAmount, setEmitAmount] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  const handleEmitMoney = () => {
    if (!selectedPlayer || emitAmount <= 0) return;

    const player = game.players.find((p) => p.id === selectedPlayer);
    if (player) {
      player.balance += emitAmount;
      GameService.recordTransaction(
        game.id,
        'bank',
        selectedPlayer,
        emitAmount,
        'Money Emission'
      );
      GameService.saveGame(game);
      setGame(game);
      setEmitAmount(0);
      setSelectedPlayer('');
      setShowEmitMoney(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border-2 border-amber-600">
      <h2 className="text-lg font-bold mb-4 text-amber-400">Panel de Banca</h2>

      <div className="space-y-2">
        <button
          onClick={() => setShowEmitMoney(!showEmitMoney)}
          className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all"
        >
          💰 Emitir Dinero
        </button>

        <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all">
          🏛️ Cobrar Impuestos
        </button>

        <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all">
          🏠 Subastar Propiedades
        </button>

        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all">
          ↩️ Deshacer Última Acción
        </button>
      </div>

      {showEmitMoney && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Selecciona jugador
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            >
              <option value="">-- Elegir --</option>
              {game.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Cantidad
            </label>
            <input
              type="number"
              value={emitAmount}
              onChange={(e) => setEmitAmount(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>

          <button
            onClick={handleEmitMoney}
            disabled={!selectedPlayer || emitAmount <= 0}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
};
