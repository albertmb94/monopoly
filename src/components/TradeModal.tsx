import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  initiatorId: string;
  onClose: () => void;
}

export const TradeModal: React.FC<Props> = ({ initiatorId, onClose }) => {
  const game = useGameStore((s) => s.game)!;
  const properties = useGameStore((s) => s.getProperties)();
  const proposeTrade = useGameStore((s) => s.proposeTrade);
  const acceptTrade = useGameStore((s) => s.acceptTrade);
  const rejectTrade = useGameStore((s) => s.rejectTrade);

  const initiator = game.players.find((p) => p.id === initiatorId)!;
  const otherPlayers = game.players.filter((p) => p.id !== initiatorId && p.isActive);

  const [recipientId, setRecipientId] = useState<string>(otherPlayers[0]?.id || '');
  const [offersMoney, setOffersMoney] = useState('0');
  const [requestsMoney, setRequestsMoney] = useState('0');
  const [offersProperties, setOffersProperties] = useState<string[]>([]);
  const [requestsProperties, setRequestsProperties] = useState<string[]>([]);
  const [clauseText, setClauseText] = useState('');
  const [view, setView] = useState<'create' | 'pending'>('create');

  const recipient = game.players.find((p) => p.id === recipientId);

  const initiatorProps = properties.filter((p) => initiator.properties.includes(p.id));
  const recipientProps = recipient
    ? properties.filter((p) => recipient.properties.includes(p.id))
    : [];

  const toggleProperty = (list: string[], setList: (l: string[]) => void, id: string) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else setList([...list, id]);
  };

  const handleCreate = () => {
    if (!recipientId) return;
    proposeTrade({
      initiatorId,
      recipientId,
      offersMoney: parseInt(offersMoney) || 0,
      requestsMoney: parseInt(requestsMoney) || 0,
      offersProperties,
      requestsProperties,
      specialClauses: clauseText.trim()
        ? [{ id: 'c1', type: 'conditional', description: clauseText.trim() }]
        : undefined,
    });
    onClose();
  };

  const pendingTrades = game.trades.filter(
    (t) => t.status === 'pending' &&
      (t.initiatorId === initiatorId || t.recipientId === initiatorId)
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">🤝 Tratos · {initiator.name}</h3>
            <button onClick={onClose} className="text-2xl text-gray-400">×</button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setView('create')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                view === 'create' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Nueva propuesta
            </button>
            <button
              onClick={() => setView('pending')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                view === 'pending' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              Pendientes ({pendingTrades.length})
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {view === 'create' ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Con quién
                </label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg bg-white"
                >
                  {otherPlayers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg">
                <div className="font-semibold text-emerald-900 mb-2">Yo OFREZCO</div>
                <input
                  type="number"
                  placeholder="Dinero"
                  value={offersMoney}
                  onChange={(e) => setOffersMoney(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {initiatorProps.length === 0 && (
                    <div className="text-xs text-gray-500">Sin propiedades</div>
                  )}
                  {initiatorProps.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offersProperties.includes(p.id)}
                        onChange={() => toggleProperty(offersProperties, setOffersProperties, p.id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="font-semibold text-amber-900 mb-2">Yo PIDO</div>
                <input
                  type="number"
                  placeholder="Dinero"
                  value={requestsMoney}
                  onChange={(e) => setRequestsMoney(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {recipientProps.length === 0 && (
                    <div className="text-xs text-gray-500">Sin propiedades</div>
                  )}
                  {recipientProps.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestsProperties.includes(p.id)}
                        onChange={() => toggleProperty(requestsProperties, setRequestsProperties, p.id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Cláusula especial (opcional)
                </label>
                <textarea
                  value={clauseText}
                  onChange={(e) => setClauseText(e.target.value)}
                  placeholder="Ej: Inmunidad de alquiler en Paseo del Prado durante 5 turnos"
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                  rows={2}
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl"
              >
                Proponer trato
              </button>
            </>
          ) : (
            <>
              {pendingTrades.length === 0 && (
                <div className="text-center text-gray-500 py-8">Sin tratos pendientes</div>
              )}
              {pendingTrades.map((t) => {
                const init = game.players.find((p) => p.id === t.initiatorId)!;
                const recip = game.players.find((p) => p.id === t.recipientId)!;
                const isReceiver = t.recipientId === initiatorId;
                return (
                  <div key={t.id} className="border-2 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-2">
                      {init.name} → {recip.name}
                    </div>
                    <div className="text-xs space-y-1 mb-3">
                      <div>
                        <strong>Ofrece:</strong> {t.offersMoney}M
                        {t.offersProperties.length > 0 &&
                          ` + ${t.offersProperties.length} props`}
                      </div>
                      <div>
                        <strong>Pide:</strong> {t.requestsMoney}M
                        {t.requestsProperties.length > 0 &&
                          ` + ${t.requestsProperties.length} props`}
                      </div>
                      {t.specialClauses && t.specialClauses.length > 0 && (
                        <div className="text-purple-700">
                          📜 {t.specialClauses[0].description}
                        </div>
                      )}
                    </div>
                    {isReceiver ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptTrade(t.id)}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded font-semibold text-sm"
                        >
                          ✓ Aceptar
                        </button>
                        <button
                          onClick={() => rejectTrade(t.id)}
                          className="flex-1 bg-red-100 text-red-700 py-2 rounded font-semibold text-sm"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">
                        Esperando respuesta...
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
