import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameRules, PropertySet } from '../types';

export const StartScreen: React.FC = () => {
  const [step, setStep] = useState<'mode' | 'config' | 'multi-info'>('mode');
  const [adminName, setAdminName] = useState('');
  const [rules, setRules] = useState<GameRules>({
    initialBalance: 1500,
    freeParking: false,
    doubleOnExactStart: false,
    bankruptcyRule: 'to_creditor',
    propertySet: 'standard',
  });

  const createGame = useGameStore((s) => s.createGame);

  const handleCreate = () => {
    if (!adminName.trim()) return;
    createGame(adminName.trim(), rules, 'single');
  };

  if (step === 'mode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-amber-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
              🏦 Banca Monopoly
            </h1>
            <p className="text-emerald-100">
              Reemplaza el dinero físico y automatiza tu partida
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('config')}
              className="w-full bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl p-5 shadow-2xl transition transform hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">📱</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">Modo en este dispositivo</div>
                  <div className="text-sm text-gray-600">
                    Un solo móvil pasa entre jugadores. El admin gestiona todo.
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                ✓ Recomendado · Funciona sin conexión
              </div>
            </button>

            <button
              onClick={() => setStep('multi-info')}
              className="w-full bg-white/10 backdrop-blur hover:bg-white/20 border-2 border-white/30 text-white rounded-2xl p-5 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">🌐</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">Modo multi-dispositivo</div>
                  <div className="text-sm text-white/80">
                    Cada jugador en su móvil. Requiere configurar Turso.
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'multi-info') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8">
          <button
            onClick={() => setStep('mode')}
            className="text-emerald-400 mb-6 hover:underline"
          >
            ← Volver
          </button>

          <h2 className="text-3xl font-bold mb-4">🌐 Modo multi-dispositivo</h2>
          <p className="text-slate-300 mb-6">
            Para que varios dispositivos se sincronicen en tiempo real, necesitas
            configurar una base de datos serverless. Esta app está preparada para{' '}
            <span className="text-emerald-400 font-semibold">Turso (libSQL)</span> +{' '}
            <span className="text-emerald-400 font-semibold">Vercel Functions</span>.
          </p>

          <div className="bg-amber-900/40 border border-amber-600 rounded-lg p-4 mb-6">
            <div className="font-semibold text-amber-200 mb-2">⚠️ Por qué no funciona el join ahora</div>
            <p className="text-amber-100 text-sm">
              Sin un backend real, las partidas se guardan en el navegador local de
              cada dispositivo (localStorage). El dispositivo que se intenta unir
              no puede &quot;ver&quot; la partida del creador, por eso aparece el código como inválido.
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="font-bold text-xl">Pasos de configuración</h3>

            <div>
              <div className="font-semibold text-emerald-400">1. Crear DB en Turso</div>
              <pre className="bg-black/40 p-3 rounded text-xs mt-1 overflow-x-auto"><code>turso db create monopoly-bank
turso db tokens create monopoly-bank</code></pre>
            </div>

            <div>
              <div className="font-semibold text-emerald-400">2. Variables de entorno en Vercel</div>
              <pre className="bg-black/40 p-3 rounded text-xs mt-1 overflow-x-auto"><code>TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...</code></pre>
            </div>

            <div>
              <div className="font-semibold text-emerald-400">3. Esquema SQL</div>
              <pre className="bg-black/40 p-3 rounded text-xs mt-1 overflow-x-auto"><code>{`CREATE TABLE games (
  code TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);`}</code></pre>
              <p className="text-xs text-slate-400 mt-1">
                El proyecto incluye las API routes en <code className="bg-slate-700 px-1 rounded">/api/games/</code> listas
                para usar. Solo necesitas configurar las variables de entorno y
                ejecutar el SQL anterior.
              </p>
            </div>

            <div>
              <div className="font-semibold text-emerald-400">4. Re-deploy en Vercel</div>
              <p className="text-sm text-slate-300">
                Una vez configurado, el botón de modo multi-dispositivo será funcional.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep('config')}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl"
          >
            Mientras tanto, jugar en este dispositivo →
          </button>
        </div>
      </div>
    );
  }

  // Configuración
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-amber-600 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto py-6">
        <button
          onClick={() => setStep('mode')}
          className="text-white mb-4 hover:underline"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
          <h2 className="text-2xl font-bold text-emerald-900">Nueva Partida</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tu nombre (Admin)
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Ej: Banquero"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Saldo inicial por jugador
            </label>
            <input
              type="number"
              value={rules.initialBalance}
              onChange={(e) =>
                setRules({ ...rules, initialBalance: Number(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Edición del tablero
            </label>
            <select
              value={rules.propertySet}
              onChange={(e) =>
                setRules({ ...rules, propertySet: e.target.value as PropertySet })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="standard">Clásico (Estados Unidos)</option>
              <option value="spanish">España (Madrid / Barcelona)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Podrás renombrar cualquier calle durante la partida.
            </p>
          </div>

          <h3 className="font-semibold text-emerald-900 pt-2 border-t">
            Reglas de la casa
          </h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.freeParking}
              onChange={(e) =>
                setRules({ ...rules, freeParking: e.target.checked })
              }
              className="mt-1 w-5 h-5 accent-emerald-600"
            />
            <div className="flex-1">
              <div className="font-medium">Parking Gratuito 💰</div>
              <div className="text-xs text-gray-500">
                Los impuestos van a un bote central que recoge quien cae en Parking.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.doubleOnExactStart}
              onChange={(e) =>
                setRules({ ...rules, doubleOnExactStart: e.target.checked })
              }
              className="mt-1 w-5 h-5 accent-emerald-600"
            />
            <div className="flex-1">
              <div className="font-medium">Doble en Salida exacta</div>
              <div className="text-xs text-gray-500">
                Si caes exactamente en Salida, cobras el doble.
              </div>
            </div>
          </label>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bancarrota: ¿qué pasa con los bienes?
            </label>
            <select
              value={rules.bankruptcyRule}
              onChange={(e) =>
                setRules({
                  ...rules,
                  bankruptcyRule: e.target.value as GameRules['bankruptcyRule'],
                })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white"
            >
              <option value="to_creditor">Pasan al acreedor</option>
              <option value="to_bank">Van a la banca para subasta</option>
            </select>
          </div>

          <button
            onClick={handleCreate}
            disabled={!adminName.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition"
          >
            Crear partida →
          </button>
        </div>
      </div>
    </div>
  );
};
