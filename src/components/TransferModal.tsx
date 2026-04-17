import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  presetFrom?: string;
  presetTo?: string;
  onClose: () => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];
const QUICK_REASONS = [
  'Alquiler',
  'Pasar por Salida',
  'Impuestos',
  'Multa',
  'Compra propiedad',
  'Casa de Suerte',
  'Caja de Comunidad',
];

export const TransferModal: React.FC<Props> = ({ presetFrom, presetTo, onClose }) => {
  const game = useGameStore((s) => s.game)!;
  const transferMoney = useGameStore((s) => s.transferMoney);
  const collectFromAll = useGameStore((s) => s.collectFromAll);
  const payToAll = useGameStore((s) => s.payToAll);

  const [from, setFrom] = useState<string>(presetFrom ?? '');
  const [to, setTo] = useState<string>(presetTo ?? '');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [allMode, setAllMode] = useState<'none' | 'collect-all' | 'pay-all'>('none');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) {
      setError('Importe inválido');
      return;
    }
    const motivo = reason.trim() || 'Transferencia';

    if (allMode === 'collect-all') {
      if (!to) return setError('Selecciona quién recibe');
      collectFromAll(to, amt, motivo);
      onClose();
      return;
    }
    if (allMode === 'pay-all') {
      if (!from || from === 'bank') return setError('Selecciona quién paga');
      const ok = payToAll(from, amt, motivo);
      if (!ok) return setError('Saldo insuficiente para pagar a todos');
      onClose();
      return;
    }

    if (!from || !to) return setError('Selecciona origen y destino');
    if (from === to) return setError('Origen y destino deben ser distintos');
    const ok = transferMoney(from, to, amt, motivo);
    if (!ok) return setError('Saldo insuficiente');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">💰 Transferencia</h3>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          {/* Modos rápidos */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setAllMode('none')}
              className={`text-xs py-2 rounded-lg font-semibold ${
                allMode === 'none' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => {
                setAllMode('collect-all');
                setFrom('');
              }}
              className={`text-xs py-2 rounded-lg font-semibold ${
                allMode === 'collect-all' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Cobrar a todos
            </button>
            <button
              onClick={() => {
                setAllMode('pay-all');
                setTo('');
              }}
              className={`text-xs py-2 rounded-lg font-semibold ${
                allMode === 'pay-all' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Pagar a todos
            </button>
          </div>

          {allMode !== 'collect-all' && (
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">DESDE</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-3 border-2 rounded-lg bg-white"
              >
                <option value="">— Seleccionar —</option>
                <option value="bank">🏦 Banca</option>
                {game.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.balance.toLocaleString('es-ES')}M)
                  </option>
                ))}
              </select>
            </div>
          )}

          {allMode !== 'pay-all' && (
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">HACIA</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-3 border-2 rounded-lg bg-white"
              >
                <option value="">— Seleccionar —</option>
                <option value="bank">🏦 Banca</option>
                {game.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">IMPORTE</label>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-3 border-2 rounded-lg text-2xl font-bold text-center"
              autoFocus
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() =>
                    setAmount(String((parseInt(amount, 10) || 0) + amt))
                  }
                  className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-xs font-semibold"
                >
                  +{amt}
                </button>
              ))}
              <button
                onClick={() => setAmount('')}
                className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold"
              >
                C
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">MOTIVO</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2 border-2 rounded-lg"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-xs"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-lg"
          >
            Confirmar transferencia
          </button>
        </div>
      </div>
    </div>
  );
};
