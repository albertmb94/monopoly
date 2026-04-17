import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Property } from '../types';

export const PlayerView: React.FC = () => {
  const game = useGameStore(s => s.game);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const mode = useGameStore(s => s.mode);
  const syncFromCloud = useGameStore(s => s.syncFromCloud);
  const resetGame = useGameStore(s => s.resetGame);
  const getProperties = useGameStore(s => s.getProperties);
  const isCloudSyncing = useGameStore(s => s.isCloudSyncing);
  const cloudError = useGameStore(s => s.cloudError);

  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'log'>('overview');

  // Polling: sync from cloud every 3 seconds
  useEffect(() => {
    if (mode !== 'multi') return;
    const interval = setInterval(() => {
      syncFromCloud();
    }, 3000);
    return () => clearInterval(interval);
  }, [mode, syncFromCloud]);

  if (!game || !myPlayerId) return null;

  const player = game.players.find(p => p.id === myPlayerId);
  if (!player) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <p className="mb-4">Ya no estás en esta partida.</p>
          <button onClick={resetGame} className="bg-red-600 px-6 py-2 rounded-lg">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const properties = getProperties();
  const myProperties = properties.filter(p => player.properties.includes(p.id));
  const myTransactions = game.transactions.filter(
    t => t.fromPlayerId === myPlayerId || t.toPlayerId === myPlayerId
  );

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;
  const time = (ts: number) => new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const playerName = (id: string) => {
    if (id === 'bank') return '🏦 Banca';
    return game!.players.find(p => p.id === id)?.name || '???';
  };

  // Patrimonio total
  const propValue = myProperties.reduce((sum, p) => {
    const isMortgaged = player.mortgagedProperties.includes(p.id);
    return sum + (isMortgaged ? p.mortgageValue : p.purchasePrice);
  }, 0);
  const buildingsValue = myProperties.reduce((sum, p) => {
    const houses = player.housesPerProperty?.[p.id] || 0;
    if (houses === 5) return sum + p.hotelPrice;
    return sum + houses * p.housePrice;
  }, 0);
  const totalWealth = player.balance + propValue + buildingsValue;

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <header className="text-white sticky top-0 z-30 shadow-lg" style={{ background: player.color }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-lg">{player.name}</div>
                <div className="text-xs opacity-80">
                  Partida #{game.code}
                  {isCloudSyncing && ' · Sincronizando...'}
                </div>
              </div>
            </div>
            <button
              onClick={() => { if (confirm('¿Salir de la partida?')) resetGame(); }}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Balance principal */}
        <div className="px-4 pb-4 bg-black/10">
          <div className="text-center">
            <div className="text-4xl font-extrabold">{fmt(player.balance)}</div>
            <div className="text-sm opacity-80">Saldo disponible</div>
            <div className="text-xs opacity-60 mt-1">
              Patrimonio total: {fmt(totalWealth)}
              {' '}({fmt(player.balance)} + {fmt(propValue)} props + {fmt(buildingsValue)} edif.)
            </div>
          </div>
        </div>

        {cloudError && (
          <div className="px-4 pb-3">
            <div className="bg-red-500/80 text-white text-xs p-2 rounded-lg">
              ⚠️ {cloudError}
            </div>
          </div>
        )}

        {game.status === 'lobby' && (
          <div className="px-4 pb-3">
            <div className="bg-white/20 rounded-lg px-3 py-2 text-center text-sm">
              ⏳ Esperando a que el admin inicie la partida...
              <br />
              <span className="text-xs opacity-70">{game.players.length} jugador(es) conectados</span>
            </div>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="px-3 pt-3 flex gap-2 sticky top-[140px] z-20 bg-slate-100 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
            activeTab === 'overview' ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-600'
          }`}
        >
          📊 Resumen
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
            activeTab === 'properties' ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-600'
          }`}
        >
          🏘️ Props ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
            activeTab === 'log' ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-600'
          }`}
        >
          📜 Movimientos
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Otros jugadores */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase">👥 Jugadores</h3>
              <div className="space-y-2">
                {game.players.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: p.color }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm">
                        {p.name}
                        {p.id === game.adminId && ' 👑'}
                      </span>
                    </div>
                    <div className="font-bold text-sm" style={{ color: p.color }}>
                      {fmt(p.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bote de Parking */}
            {game.rules.freeParking && game.freeParking > 0 && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
                <div className="text-sm font-semibold text-amber-800">💰 Bote de Parking Gratuito</div>
                <div className="text-2xl font-extrabold text-amber-900">{fmt(game.freeParking)}</div>
              </div>
            )}

            {/* Mis propiedades resumen */}
            {myProperties.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase">🏘️ Mis propiedades ({myProperties.length})</h3>
                <div className="space-y-2">
                  {myProperties.map(prop => {
                    const isMortgaged = player.mortgagedProperties.includes(prop.id);
                    const houses = player.housesPerProperty?.[prop.id] || 0;
                    return (
                      <div
                        key={prop.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${isMortgaged ? 'bg-amber-50' : 'bg-slate-50'}`}
                        style={{ borderLeftColor: prop.color || '#666' }}
                      >
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${isMortgaged ? 'line-through text-amber-700' : ''}`}>
                            {prop.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isMortgaged ? '⚠️ Hipotecada' : ''}
                            {houses > 0 && (houses === 5 ? ' 🏨' : ` 🏠×${houses}`)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {fmt(prop.purchasePrice)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tratos pendientes que me involucran */}
            {game.trades.filter(t => t.status === 'pending' && t.recipientId === myPlayerId).length > 0 && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
                <h3 className="font-bold text-sm text-purple-800 mb-2">🤝 Tratos pendientes para ti</h3>
                {game.trades
                  .filter(t => t.status === 'pending' && t.recipientId === myPlayerId)
                  .map(t => {
                    const initiator = game.players.find(p => p.id === t.initiatorId);
                    return (
                      <div key={t.id} className="text-sm mb-2">
                        <strong>{initiator?.name}</strong> te ofrece {t.offersMoney}M
                        {t.offersProperties.length > 0 && ` + ${t.offersProperties.length} props`}
                        {' '}a cambio de {t.requestsMoney}M
                        {t.requestsProperties.length > 0 && ` + ${t.requestsProperties.length} props`}
                        <br />
                        <span className="text-xs text-purple-600">
                          (El admin debe aceptar/rechazar este trato)
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <>
            {myProperties.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
                Aún no tienes propiedades
              </div>
            ) : (
              myProperties.map(prop => (
                <PropertyCard key={prop.id} prop={prop} player={player} />
              ))
            )}
          </>
        )}

        {/* Log Tab */}
        {activeTab === 'log' && (
          <>
            {myTransactions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
                Sin movimientos todavía
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md divide-y">
                {myTransactions.map(tx => (
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
                    <div className={`font-bold text-sm ${
                      tx.toPlayerId === myPlayerId ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.toPlayerId === myPlayerId ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Subcomponent for property card
const PropertyCard: React.FC<{ prop: Property; player: any }> = ({ prop, player }) => {
  const isMortgaged = player.mortgagedProperties.includes(prop.id);
  const houses = player.housesPerProperty?.[prop.id] || 0;
  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${isMortgaged ? 'opacity-70' : ''}`}
      style={{ borderLeftColor: prop.color || '#666' }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-bold">{prop.name}</div>
            <div className="text-xs text-gray-500">
              {prop.type === 'street' ? '🏘️ Calle' : prop.type === 'station' ? '🚂 Estación' : '💡 Servicio'}
            </div>
          </div>
          {houses > 0 && (
            <div className="text-lg">
              {houses === 5 ? '🏨' : '🏠'.repeat(houses)}
            </div>
          )}
        </div>

        {isMortgaged && (
          <div className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded inline-block mb-2">
            ⚠️ Hipotecada · No genera alquiler
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>Compra: {fmt(prop.purchasePrice)} · Hipoteca: {fmt(prop.mortgageValue)}</div>
          {prop.type === 'street' && (
            <div>
              Alquiler base: {fmt(prop.rentBase)}
              {houses > 0 && houses < 5 && ` · Con ${houses} casa(s): ${fmt(prop.rentWithHouse[houses - 1])}`}
              {houses === 5 && ` · Con hotel: ${fmt(prop.rentWithHotel)}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
