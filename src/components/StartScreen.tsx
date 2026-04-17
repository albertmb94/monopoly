import React, { useState } from 'react';
import { GameService } from '../services/gameService';
import { GameRules } from '../types';
import { useGameStore } from '../store/gameStore';

interface StartScreenProps {
  onGameCreated: (gameCode: string) => void;
  onGameJoined: (gameCode: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onGameCreated,
  onGameJoined,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [gameRules, setGameRules] = useState<GameRules>({
    initialBalance: 2000,
    freeParking: false,
    doubleOnExactStart: false,
    bankruptcyRule: 'to_creditor',
    propertySet: 'standard',
  });

  const { setGame, setSession } = useGameStore();

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const game = GameService.createGame(
      `player_${Date.now()}`,
      playerName,
      gameRules
    );

    setGame(game);
    setSession({
      roomId: game.id,
      playerId: game.adminId,
      playerName,
    });

    onGameCreated(game.code);
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !joinCode.trim()) return;

    const game = GameService.getGameByCode(joinCode.toUpperCase());
    if (!game) {
      alert('Código de partida no válido');
      return;
    }

    const player = GameService.addPlayerToGame(game.id, playerName);
    const updatedGame = GameService.getGameById(game.id);

    if (updatedGame) {
      setGame(updatedGame);
      setSession({
        roomId: game.id,
        playerId: player.id,
        playerName,
      });

      onGameJoined(game.code);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-400/50 mb-4">
            <span className="text-4xl font-bold text-white">M</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MONOPOLY</h1>
          <p className="text-slate-400">Gestor de partidas en tiempo real</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nueva Partida
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
              activeTab === 'join'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unirse
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Saldo Inicial
                </label>
                <input
                  type="number"
                  value={gameRules.initialBalance}
                  onChange={(e) =>
                    setGameRules({
                      ...gameRules,
                      initialBalance: parseInt(e.target.value),
                    })
                  }
                  min="500"
                  step="100"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameRules.freeParking}
                    onChange={(e) =>
                      setGameRules({
                        ...gameRules,
                        freeParking: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    Parking Gratuito (bote central)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameRules.doubleOnExactStart}
                    onChange={(e) =>
                      setGameRules({
                        ...gameRules,
                        doubleOnExactStart: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    Doble al caer exactamente en Salida
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Regla de Bancarrota
                </label>
                <select
                  value={gameRules.bankruptcyRule}
                  onChange={(e) =>
                    setGameRules({
                      ...gameRules,
                      bankruptcyRule: e.target.value as 'to_creditor' | 'to_bank',
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="to_creditor">
                    Bienes pasan al acreedor
                  </option>
                  <option value="to_bank">Bienes van a la Banca</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Crear Partida
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código de Partida (6 caracteres)
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                  }
                  placeholder="Ej: ABC123"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-lg text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Unirse a Partida
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Versión 1.0 • Monopoly Game Manager</p>
        </div>
      </div>
    </div>
  );
};
