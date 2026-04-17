import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameService } from '../services/gameService';
import { PlayerCard } from './PlayerCard';
import { TransactionLog } from './TransactionLog';
import { PlayerInteraction } from './PlayerInteraction';
import { BankerPanel } from './BankerPanel';
import { GameSettings } from './GameSettings';
import { GameEndScreen } from './GameEndScreen';


interface GameScreenProps {
  gameCode: string;
  onExit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  gameCode,
  onExit,
}) => {
  const { currentGame, currentSession, setGame, isAdmin, isBanker } =
    useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [gameTime, setGameTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime((prev) => prev + 1);
      // Actualizar juego desde almacenamiento
      const updatedGame = GameService.getGameByCode(gameCode);
      if (updatedGame) {
        setGame(updatedGame);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameCode, setGame]);

  if (!currentGame || !currentSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando partida...</div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPlayer = currentGame.players.find(
    (p) => p.id === currentSession.playerId
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MONOPOLY</h1>
            <p className="text-sm text-slate-400">Código: {currentGame.code}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Tiempo</p>
              <p className="text-lg font-mono">{formatTime(gameTime)}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-all"
              >
                🔗 QR
              </button>

              {isAdmin() && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-all"
                >
                  ⚙️ Reglas
                </button>
              )}

              <button
                onClick={onExit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Código para unirte</h2>
              <button
                onClick={() => setShowQR(false)}
                className="text-2xl hover:text-slate-400"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-700 p-6 rounded-lg mb-4 flex justify-center items-center h-48">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Código</p>
                <p className="text-4xl font-mono font-bold text-emerald-400">
                  {currentGame.code}
                </p>
              </div>
            </div>

            <p className="text-center text-slate-300 text-sm">
              Comparte este código con otros jugadores para que se unan
            </p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && isAdmin() && (
        <GameSettings game={currentGame} onClose={() => setShowSettings(false)} />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {currentGame.status === 'finished' ? (
          <GameEndScreen game={currentGame} onNewGame={onExit} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Players and Interactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Players Grid */}
              <div>
                <h2 className="text-xl font-bold mb-4">Jugadores</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentGame.players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      game={currentGame}
                      isCurrentPlayer={player.id === currentSession.playerId}
                      isBanker={isBanker() && player.id !== currentSession.playerId}
                    />
                  ))}
                </div>
              </div>

              {/* Current Player Actions */}
              {currentPlayer && (
                <PlayerInteraction
                  player={currentPlayer}
                  game={currentGame}
                />
              )}
            </div>

            {/* Right: Banker Panel or Transaction Log */}
            <div className="space-y-6">
              {isBanker() && (
                <BankerPanel game={currentGame} />
              )}

              <TransactionLog game={currentGame} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
