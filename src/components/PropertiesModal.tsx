import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Property } from '../types';

interface Props {
  playerId: string;
  onClose: () => void;
}

export const PropertiesModal: React.FC<Props> = ({ playerId, onClose }) => {
  const game = useGameStore((s) => s.game)!;
  const properties = useGameStore((s) => s.getProperties)();
  const buyProperty = useGameStore((s) => s.buyProperty);
  const mortgageProperty = useGameStore((s) => s.mortgageProperty);
  const unmortgageProperty = useGameStore((s) => s.unmortgageProperty);
  const buildHouse = useGameStore((s) => s.buildHouse);
  const sellHouse = useGameStore((s) => s.sellHouse);
  const renameProperty = useGameStore((s) => s.renameProperty);

  const player = game.players.find((p) => p.id === playerId)!;
  const [tab, setTab] = useState<'mine' | 'available'>('mine');
  const [editingProp, setEditingProp] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const owned = properties.filter((p) => player.properties.includes(p.id));
  const allOwnedIds = new Set(game.players.flatMap((p) => p.properties));
  const available = properties.filter(
    (p) => !allOwnedIds.has(p.id) && p.type !== 'tax' && p.type !== 'special'
  );

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;

  const renderProperty = (prop: Property, isOwned: boolean) => {
    const isMortgaged = player.mortgagedProperties.includes(prop.id);
    const houses = player.housesPerProperty?.[prop.id] || 0;

    return (
      <div
        key={prop.id}
        className={`border-2 rounded-lg p-3 ${
          isMortgaged ? 'bg-amber-50 border-amber-300' : 'bg-white'
        }`}
        style={prop.color ? { borderTopColor: prop.color, borderTopWidth: '6px' } : undefined}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {editingProp === prop.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  if (editName.trim()) renameProperty(prop.id, editName.trim());
                  setEditingProp(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editName.trim()) renameProperty(prop.id, editName.trim());
                    setEditingProp(null);
                  }
                }}
                className="font-bold w-full px-1 border rounded"
              />
            ) : (
              <div
                className="font-bold cursor-pointer"
                onClick={() => {
                  setEditingProp(prop.id);
                  setEditName(prop.name);
                }}
                title="Click para renombrar"
              >
                {prop.name} ✎
              </div>
            )}
            <div className="text-xs text-gray-500">
              {prop.type === 'street' ? '🏘️ Calle' :
                prop.type === 'station' ? '🚂 Estación' :
                  prop.type === 'utility' ? '💡 Servicio' : prop.type}
              {' · '}
              Compra {fmt(prop.purchasePrice)} · Hipoteca {fmt(prop.mortgageValue)}
            </div>
          </div>
        </div>

        {isOwned && (
          <>
            {houses > 0 && (
              <div className="text-sm mb-2">
                {houses === 5 ? '🏨 1 Hotel' : `🏠 ${houses} casa${houses > 1 ? 's' : ''}`}
              </div>
            )}
            {isMortgaged && (
              <div className="text-xs text-amber-700 font-semibold mb-2">
                ⚠️ Hipotecada · No genera alquiler
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {!isMortgaged && (
                <button
                  onClick={() => mortgageProperty(playerId, prop.id)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded font-semibold"
                >
                  Hipotecar (+{fmt(prop.mortgageValue)})
                </button>
              )}
              {isMortgaged && (
                <button
                  onClick={() => unmortgageProperty(playerId, prop.id)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded font-semibold"
                >
                  Deshipotecar (−{fmt(Math.ceil(prop.mortgageValue * 1.1))})
                </button>
              )}
              {prop.type === 'street' && !isMortgaged && houses < 5 && (
                <button
                  onClick={() => buildHouse(playerId, prop.id)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded font-semibold"
                >
                  +{houses === 4 ? '🏨' : '🏠'} ({fmt(houses === 4 ? prop.hotelPrice : prop.housePrice)})
                </button>
              )}
              {prop.type === 'street' && houses > 0 && (
                <button
                  onClick={() => sellHouse(playerId, prop.id)}
                  className="bg-slate-100 hover:bg-slate-200 text-xs px-2 py-1 rounded font-semibold"
                >
                  Vender
                </button>
              )}
            </div>
          </>
        )}

        {!isOwned && (
          <button
            onClick={() => buyProperty(playerId, prop.id)}
            disabled={player.balance < prop.purchasePrice}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 text-white font-semibold py-2 rounded text-sm"
          >
            Comprar por {fmt(prop.purchasePrice)}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-slate-50 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b bg-white sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">🏘️ Propiedades · {player.name}</h3>
            <button onClick={onClose} className="text-2xl text-gray-400">×</button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setTab('mine')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                tab === 'mine' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Mías ({owned.length})
            </button>
            <button
              onClick={() => setTab('available')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                tab === 'available' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Disponibles ({available.length})
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3 space-y-2">
          {tab === 'mine' ? (
            owned.length > 0 ? (
              owned.map((p) => renderProperty(p, true))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aún no posees propiedades
              </div>
            )
          ) : (
            available.map((p) => renderProperty(p, false))
          )}
        </div>
      </div>
    </div>
  );
};
