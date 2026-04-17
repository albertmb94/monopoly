import React from 'react';
import { Game } from '../types';

interface GameSettingsProps {
  game: Game;
  onClose: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  game,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Reglas de la Casa</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-slate-400"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-slate-700/50 rounded">
            <p className="text-sm font-semibold">Saldo Inicial</p>
            <p className="text-lg font-bold text-emerald-400">
              ${game.rules.initialBalance}
            </p>
          </div>

          <div className="p-3 bg-slate-700/50 rounded">
            <p className="text-sm font-semibold">Parking Gratuito</p>
            <p className="text-lg">
              {game.rules.freeParking ? '✅ Activado' : '❌ Desactivado'}
            </p>
          </div>

          <div className="p-3 bg-slate-700/50 rounded">
            <p className="text-sm font-semibold">Doble en Salida</p>
            <p className="text-lg">
              {game.rules.doubleOnExactStart ? '✅ Activado' : '❌ Desactivado'}
            </p>
          </div>

          <div className="p-3 bg-slate-700/50 rounded">
            <p className="text-sm font-semibold">Bancarrota</p>
            <p className="text-lg">
              {game.rules.bankruptcyRule === 'to_creditor'
                ? 'Bienes al acreedor'
                : 'Bienes a la Banca'}
            </p>
          </div>

          <div className="p-3 bg-slate-700/50 rounded">
            <p className="text-sm font-semibold">Set de Propiedades</p>
            <p className="text-lg capitalize">
              {game.rules.propertySet === 'standard'
                ? 'Estándar (Inglés)'
                : 'Español'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
