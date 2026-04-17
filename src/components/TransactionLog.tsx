import React from 'react';
import { Game } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionLogProps {
  game: Game;
}

export const TransactionLog: React.FC<TransactionLogProps> = ({ game }) => {
  const recentTransactions = game.transactions.slice(-10).reverse();

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 className="text-lg font-bold mb-4">Registro de Transacciones</h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="text-xs p-3 bg-slate-700/50 rounded border-l-2 border-emerald-500"
            >
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-emerald-400">
                  {transaction.reason}
                </span>
                <span className="text-slate-400">
                  ${transaction.amount}
                </span>
              </div>
              <div className="text-slate-400">
                {transaction.fromPlayerId !== 'bank' &&
                game.players.find((p) => p.id === transaction.fromPlayerId)
                  ?.name} →{' '}
                {transaction.toPlayerId !== 'bank' &&
                  game.players.find((p) => p.id === transaction.toPlayerId)
                    ?.name}
              </div>
              <div className="text-slate-500">
                {formatDistanceToNow(transaction.timestamp, {
                  addSuffix: true,
                  locale: es,
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 py-4">
            Sin transacciones aún
          </p>
        )}
      </div>
    </div>
  );
};
