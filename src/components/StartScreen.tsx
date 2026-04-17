import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameRules, PropertySet } from '../types';

export const StartScreen: React.FC = () => {
  const [step, setStep] = useState<
    'mode' | 'config' | 'multi-menu' | 'multi-create' | 'multi-join'
  >('mode');

  // Single device config
  const [adminName, setAdminName] = useState('');
  const [rules, setRules] = useState<GameRules>({
    initialBalance: 1500,
    freeParking: false,
    doubleOnExactStart: false,
    bankruptcyRule: 'to_creditor',
    propertySet: 'standard',
  });

  // Multi device join
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Multi device create
  const [multiAdminName, setMultiAdminName] = useState('');
  const [multiRules, setMultiRules] = useState<GameRules>({
    initialBalance: 1500,
    freeParking: false,
    doubleOnExactStart: false,
    bankruptcyRule: 'to_creditor',
    propertySet: 'standard',
  });
  const [multiCreateLoading, setMultiCreateLoading] = useState(false);
  const [multiCreateError, setMultiCreateError] = useState<string | null>(null);

  const createGame = useGameStore(s => s.createGame);
  const syncToCloud = useGameStore(s => s.syncToCloud);
  const joinGameCloud = useGameStore(s => s.joinGameCloud);
  const cloudError = useGameStore(s => s.cloudError);

  const handleCreateSingle = () => {
    if (!adminName.trim()) return;
    createGame(adminName.trim(), rules, 'single');
  };

  const handleCreateMulti = async () => {
    if (!multiAdminName.trim()) return;
    setMultiCreateLoading(true);
    setMultiCreateError(null);
    try {
      createGame(multiAdminName.trim(), multiRules, 'multi');
      await syncToCloud();
      const err = useGameStore.getState().cloudError;
      if (err) {
        setMultiCreateError(err);
        setMultiCreateLoading(false);
        return;
      }
    } catch (e: any) {
      setMultiCreateError(e.message || 'Error al crear la partida en la nube');
      setMultiCreateLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim() || !joinName.trim()) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      const result = await joinGameCloud(joinCode.trim(), joinName.trim());
      if (!result) {
        setJoinError(useGameStore.getState().cloudError || 'No se pudo unir a la partida');
      }
    } catch (e: any) {
      setJoinError(e.message || 'Error de conexión');
    } finally {
      setJoinLoading(false);
    }
  };

  // ──── Step: Mode selection ────
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
              onClick={() => setStep('multi-menu')}
              className="w-full bg-white/10 backdrop-blur hover:bg-white/20 border-2 border-white/30 text-white rounded-2xl p-5 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">🌐</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">Modo multi-dispositivo</div>
                  <div className="text-sm text-white/80">
                    Cada jugador en su propio móvil. Sincronización en tiempo real.
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs bg-white/20 text-white/90 px-2 py-1 rounded-full font-semibold">
                Requiere Turso configurado
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Step: Multi-device menu ────
  if (step === 'multi-menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setStep('mode')}
            className="text-white/70 hover:text-white mb-6 inline-block"
          >
            ← Volver
          </button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">🌐 Multi-dispositivo</h2>
            <p className="text-white/60 text-sm">
              Cada jugador usa su propio móvil. Sincronizado en tiempo real vía Turso.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('multi-create')}
              className="w-full bg-white hover:bg-indigo-50 text-indigo-900 rounded-2xl p-5 shadow-2xl transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏗️</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">Crear partida</div>
                  <div className="text-sm text-gray-600">
                    Configuras las reglas y gestionas todo como Admin.
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('multi-join')}
              className="w-full bg-white hover:bg-indigo-50 text-indigo-900 rounded-2xl p-5 shadow-2xl transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🚪</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">Unirse a partida</div>
                  <div className="text-sm text-gray-600">
                    Introduce el código que te dé el creador.
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Step: Join game ────
  if (step === 'multi-join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4">
        <div className="max-w-md mx-auto py-6">
          <button onClick={() => setStep('multi-menu')} className="text-white/70 hover:text-white mb-6">
            ← Volver
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
            <h2 className="text-2xl font-bold text-indigo-900">🚪 Unirse a partida</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Código de la partida
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tu nombre
              </label>
              <input
                type="text"
                value={joinName}
                onChange={e => setJoinName(e.target.value)}
                placeholder="Ej: Carlos"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {(joinError || cloudError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                ❌ {joinError || cloudError}
              </div>
            )}

            <button
              onClick={handleJoinGame}
              disabled={!joinCode.trim() || !joinName.trim() || joinLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition"
            >
              {joinLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Conectando...
                </span>
              ) : (
                'Unirse →'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Step: Create multi game ────
  if (step === 'multi-create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto py-6">
          <button onClick={() => setStep('multi-menu')} className="text-white/70 hover:text-white mb-4">
            ← Volver
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
            <h2 className="text-2xl font-bold text-indigo-900">🏗️ Crear partida online</h2>

            {multiCreateError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                ❌ {multiCreateError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tu nombre (Admin)
              </label>
              <input
                type="text"
                value={multiAdminName}
                onChange={e => setMultiAdminName(e.target.value)}
                placeholder="Ej: Banquero"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Saldo inicial por jugador
              </label>
              <input
                type="number"
                value={multiRules.initialBalance}
                onChange={e => setMultiRules({ ...multiRules, initialBalance: Number(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Edición del tablero
              </label>
              <select
                value={multiRules.propertySet}
                onChange={e => setMultiRules({ ...multiRules, propertySet: e.target.value as PropertySet })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="standard">Clásico (Estados Unidos)</option>
                <option value="spanish">España (Madrid / Barcelona)</option>
              </select>
            </div>

            <h3 className="font-semibold text-indigo-900 pt-2 border-t">Reglas de la casa</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={multiRules.freeParking}
                onChange={e => setMultiRules({ ...multiRules, freeParking: e.target.checked })}
                className="mt-1 w-5 h-5 accent-indigo-600"
              />
              <div>
                <div className="font-medium">Parking Gratuito 💰</div>
                <div className="text-xs text-gray-500">Impuestos y multas van a un bote central.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={multiRules.doubleOnExactStart}
                onChange={e => setMultiRules({ ...multiRules, doubleOnExactStart: e.target.checked })}
                className="mt-1 w-5 h-5 accent-indigo-600"
              />
              <div>
                <div className="font-medium">Doble en Salida exacta</div>
                <div className="text-xs text-gray-500">Cobrar el doble al caer exactamente en Salida.</div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bancarrota
              </label>
              <select
                value={multiRules.bankruptcyRule}
                onChange={e => setMultiRules({ ...multiRules, bankruptcyRule: e.target.value as GameRules['bankruptcyRule'] })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white"
              >
                <option value="to_creditor">Bienes pasan al acreedor</option>
                <option value="to_bank">Bienes van a la banca para subasta</option>
              </select>
            </div>

            <button
              onClick={handleCreateMulti}
              disabled={!multiAdminName.trim() || multiCreateLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition"
            >
              {multiCreateLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando en la nube...
                </span>
              ) : (
                'Crear partida online →'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Step: Config (single device) ────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-amber-600 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto py-6">
        <button onClick={() => setStep('mode')} className="text-white mb-4 hover:underline">
          ← Volver
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
          <h2 className="text-2xl font-bold text-emerald-900">📱 Nueva Partida Local</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tu nombre (Admin)
            </label>
            <input
              type="text"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
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
              onChange={e => setRules({ ...rules, initialBalance: Number(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Edición del tablero
            </label>
            <select
              value={rules.propertySet}
              onChange={e => setRules({ ...rules, propertySet: e.target.value as PropertySet })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="standard">Clásico (Estados Unidos)</option>
              <option value="spanish">España (Madrid / Barcelona)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Podrás renombrar cualquier calle durante la partida.</p>
          </div>

          <h3 className="font-semibold text-emerald-900 pt-2 border-t">Reglas de la casa</h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={rules.freeParking}
              onChange={e => setRules({ ...rules, freeParking: e.target.checked })}
              className="mt-1 w-5 h-5 accent-emerald-600" />
            <div className="flex-1">
              <div className="font-medium">Parking Gratuito 💰</div>
              <div className="text-xs text-gray-500">Los impuestos van a un bote central.</div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={rules.doubleOnExactStart}
              onChange={e => setRules({ ...rules, doubleOnExactStart: e.target.checked })}
              className="mt-1 w-5 h-5 accent-emerald-600" />
            <div className="flex-1">
              <div className="font-medium">Doble en Salida exacta</div>
              <div className="text-xs text-gray-500">Cobrar el doble al caer exactamente en Salida.</div>
            </div>
          </label>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bancarrota</label>
            <select
              value={rules.bankruptcyRule}
              onChange={e => setRules({ ...rules, bankruptcyRule: e.target.value as GameRules['bankruptcyRule'] })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white"
            >
              <option value="to_creditor">Pasan al acreedor</option>
              <option value="to_bank">Van a la banca para subasta</option>
            </select>
          </div>

          <button
            onClick={handleCreateSingle}
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
