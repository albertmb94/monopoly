import React, { useState } from 'react';
import { Player, Game } from '../types';
import { GameService } from '../services/gameService';
import { useGameStore } from '../store/gameStore';

interface PlayerInteractionProps {
  player: Player;
  game: Game;
}

export const PlayerInteraction: React.FC<PlayerInteractionProps> = ({
  player,
  game,
}) => {
  const { setGame } = useGameStore();
  const [showPayMenu, setShowPayMenu] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);

  const handlePayPlayer = () => {
    if (!selectedRecipient || payAmount <= 0) return;

    GameService.transferMoney(
      game.id,
      player.id,
      selectedRecipient,
      payAmount,
      'Player Payment'
    );

    const updatedGame = GameService.getGameById(game.id);
    if (updatedGame) {
      setGame(updatedGame);
    }

    setShowPayMenu(false);
    setPayAmount(0);
    setSelectedRecipient('');
  };

  const handleClaimFreeParking = () => {
    if (game.rules.freeParking && game.freeParking > 0) {
      GameService.claimFreeParking(game.id, player.id);
      const updatedGame = GameService.getGameById(game.id);
      if (updatedGame) {
        setGame(updatedGame);
      }
    }
  };

  const otherPlayers = game.players.filter((p) => p.id !== player.id);

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 className="text-lg font-bold mb-4">Acciones</h2>

      <div className="space-y-2">
        <button
          onClick={() => setShowPayMenu(!showPayMenu)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
        >
          💳 Pagar a Jugador
        </button>

        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all">
          🏦 Pagar a Banca
        </button>

        <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all">
          🤝 Proponer Trato
        </button>

        {game.rules.freeParking && game.freeParking > 0 && (
          <button
            onClick={handleClaimFreeParking}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
          >
            🎁 Reclamar Parking (${game.freeParking})
          </button>
        )}

        <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all">
          🏠 Hipotecar Propiedad
        </button>
      </div>

      {/* Pay Menu */}
      {showPayMenu && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Selecciona jugador
            </label>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            >
              <option value="">-- Elegir --</option>
              {otherPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.balance})
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
              value={payAmount}
              onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
              min="0"
              max={player.balance}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>

          <button
            onClick={handlePayPlayer}
            disabled={!selectedRecipient || payAmount <= 0}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all"
          >
            Confirmar Pago
          </button>
        </div>
      )}
    </div>
  );
};
