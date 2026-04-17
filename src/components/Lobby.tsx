import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const Lobby: React.FC = () => {
  const game = useGameStore((s) => s.game)!;
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const renamePlayer = useGameStore((s) => s.renamePlayer);
  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.resetGame);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPlayer(newName.trim());
    setNewName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-amber-600 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto py-6">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">Sala de espera</h2>
              <p className="text-sm text-gray-500">Añade los jugadores antes de empezar</p>
            </div>
            <div className="bg-emerald-100 text-emerald-800 font-mono font-bold px-3 py-1 rounded-lg text-sm">
              #{game.code}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
            🎲 <strong>Saldo inicial:</strong> {game.rules.initialBalance.toLocaleString('es-ES')} M ·{' '}
            <strong>Parking:</strong> {game.rules.freeParking ? 'ON' : 'OFF'} ·{' '}
            <strong>Tablero:</strong>{' '}
            {game.rules.propertySet === 'spanish' ? 'España' : 'Clásico'}
          </div>

          <div className="space-y-2 mb-4">
            {game.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: p.color }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                {editingId === p.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => {
                      if (editName.trim()) renamePlayer(p.id, editName.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editName.trim()) renamePlayer(p.id, editName.trim());
                        setEditingId(null);
                      }
                    }}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                ) : (
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditName(p.name);
                    }}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.id === game.adminId ? '👑 Admin' : 'Jugador'}
                    </div>
                  </div>
                )}
                {p.id !== game.adminId && (
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nombre del jugador"
              className="flex-1 px-4 py-3 border-2 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 rounded-lg"
            >
              +
            </button>
          </div>

          <button
            onClick={startGame}
            disabled={game.players.length < 2}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg shadow-lg"
          >
            🎲 Empezar partida ({game.players.length}/8)
          </button>
          {game.players.length < 2 && (
            <p className="text-center text-xs text-gray-500 mt-2">
              Mínimo 2 jugadores
            </p>
          )}

          <button
            onClick={() => {
              if (confirm('¿Cancelar partida?')) resetGame();
            }}
            className="w-full mt-3 text-sm text-gray-500 hover:text-red-600"
          >
            Cancelar partida
          </button>
        </div>
      </div>
    </div>
  );
};
