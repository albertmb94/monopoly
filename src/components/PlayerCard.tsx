import React from 'react';
import { Player, Game, Property } from '../types';
import { STANDARD_PROPERTIES, SPANISH_PROPERTIES } from '../data/monopolyProperties';

interface PlayerCardProps {
  player: Player;
  game: Game;
  isCurrentPlayer: boolean;
  isBanker?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  game,
  isCurrentPlayer,
}) => {
  const properties =
    game.rules.propertySet === 'standard'
      ? STANDARD_PROPERTIES
      : SPANISH_PROPERTIES;

  const getPropertyNames = (propertyIds: string[]): Property[] => {
    return propertyIds
      .map((id) => properties.find((p) => p.id === id))
      .filter((p): p is Property => !!p);
  };

  const ownedProperties = getPropertyNames(player.properties);

  return (
    <div
      className={`rounded-lg p-4 border-2 transition-all ${
        isCurrentPlayer
          ? 'border-emerald-500 bg-slate-800 ring-2 ring-emerald-500'
          : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: player.color }}
          />
          <div>
            <h3 className="font-bold text-white">{player.name}</h3>
            <p className="text-xs text-slate-400">
              {player.role === 'admin' && 'Admin'}{' '}
              {player.role === 'banker' && 'Banca'}
            </p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-slate-700 rounded">
          {player.isActive ? 'Activo' : 'Eliminado'}
        </span>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-3 mb-3">
        <p className="text-xs text-emerald-100">Saldo</p>
        <p className="text-2xl font-bold text-white">${player.balance}</p>
      </div>

      {/* Properties */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-300 mb-1">Propiedades</p>
        <div className="space-y-1">
          {ownedProperties.length > 0 ? (
            ownedProperties.map((prop) => (
              <div
                key={prop.id}
                className="text-xs p-2 bg-slate-700 rounded flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {prop.color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: prop.color }}
                    />
                  )}
                  {prop.name}
                </span>
                {player.mortgagedProperties.includes(prop.id) && (
                  <span className="text-red-400 text-xs">Hipotecada</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">Sin propiedades</p>
          )}
        </div>
      </div>

      {/* Buildings */}
      {(player.houses > 0 || player.hotels > 0) && (
        <div className="text-xs space-y-1 p-2 bg-slate-700/50 rounded">
          {player.houses > 0 && (
            <p>
              🏠 Casas: <span className="font-bold">{player.houses}</span>
            </p>
          )}
          {player.hotels > 0 && (
            <p>
              🏨 Hoteles: <span className="font-bold">{player.hotels}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
