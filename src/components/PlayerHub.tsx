import React from 'react';
import { Player } from '../types';
import { useGameStore } from '../store/gameStore';

interface Props {
  player: Player;
  onPay: (toId?: string) => void;
  onReceive: (fromId?: string) => void;
  onOpenProperties: () => void;
  onTrade: () => void;
}

export const PlayerHub: React.FC<Props> = ({
  player,
  onPay,
  onReceive,
  onOpenProperties,
  onTrade,
}) => {
  const game = useGameStore((s) => s.game)!;
  const properties = useGameStore((s) => s.getProperties)();
  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;

  const ownedProperties = properties.filter((p) => player.properties.includes(p.id));
  const propertyValue = ownedProperties.reduce((sum, p) => {
    const isMortgaged = player.mortgagedProperties.includes(p.id);
    return sum + (isMortgaged ? p.mortgageValue : p.purchasePrice);
  }, 0);

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4"
      style={{ borderLeftColor: player.color }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
              style={{ background: player.color }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold flex items-center gap-1">
                {player.name}
                {player.id === game.adminId && <span className="text-xs">👑</span>}
                {player.id === game.bankerId && <span className="text-xs">🏦</span>}
              </div>
              <div className="text-xs text-gray-500">
                {ownedProperties.length} props · {player.houses} 🏠 · {player.hotels} 🏨
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-2xl text-emerald-700">
              {fmt(player.balance)}
            </div>
            {propertyValue > 0 && (
              <div className="text-xs text-gray-400">
                + {fmt(propertyValue)} en bienes
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onPay()}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold py-2 rounded-lg"
            title="Pagar"
          >
            💸<br/>Pagar
          </button>
          <button
            onClick={() => onReceive('bank')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold py-2 rounded-lg"
            title="Cobrar de banca"
          >
            🏦<br/>Cobrar
          </button>
          <button
            onClick={onOpenProperties}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2 rounded-lg"
          >
            🏘️<br/>Props
          </button>
          <button
            onClick={onTrade}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold py-2 rounded-lg"
          >
            🤝<br/>Trato
          </button>
        </div>
      </div>
    </div>
  );
};
