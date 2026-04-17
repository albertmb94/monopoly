import React from 'react';
import { useGameStore } from '../store/gameStore';

export const TransactionsLog: React.FC = () => {
  const game = useGameStore((s) => s.game)!;
  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;

  const playerName = (id: string) => {
    if (id === 'bank') return '🏦 Banca';
    return game.players.find((p) => p.id === id)?.name || '???';
  };

  const time = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (game.transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
        Sin movimientos todavía
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md divide-y">
      {game.transactions.map((tx) => (
        <div key={tx.id} className="p-3 flex items-center gap-3">
          <div className="text-xs text-gray-400 w-12 flex-shrink-0">{time(tx.timestamp)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className="font-medium">{playerName(tx.fromPlayerId)}</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="font-medium">{playerName(tx.toPlayerId)}</span>
            </div>
            <div className="text-xs text-gray-500 truncate">{tx.reason}</div>
          </div>
          <div className="font-bold text-emerald-700 text-sm">{fmt(tx.amount)}</div>
        </div>
      ))}
    </div>
  );
};
