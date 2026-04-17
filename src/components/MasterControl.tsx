import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Lobby } from './Lobby';
import { PlayerHub } from './PlayerHub';
import { TransferModal } from './TransferModal';
import { PropertiesModal } from './PropertiesModal';
import { TransactionsLog } from './TransactionsLog';
import { TradeModal } from './TradeModal';
import { EndGameScreen } from './EndGameScreen';

export const MasterControl: React.FC = () => {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  const undoLastAction = useGameStore((s) => s.undoLastAction);
  const claimFreeParking = useGameStore((s) => s.claimFreeParking);

  const [activeTab, setActiveTab] = useState<'players' | 'log'>('players');
  const [transferModal, setTransferModal] = useState<{ from?: string; to?: string } | null>(null);
  const [propertiesModalForPlayer, setPropertiesModalForPlayer] = useState<string | null>(null);
  const [tradeModal, setTradeModal] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [claimParkingFor, setClaimParkingFor] = useState<string | null>(null);

  if (!game) return null;
  if (game.status === 'lobby') return <Lobby />;
  if (game.status === 'finished') return <EndGameScreen />;

  const fmt = (n: number) => `${n.toLocaleString('es-ES')} M`;

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white sticky top-0 z-30 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">🏦 Banca Monopoly</div>
            <div className="text-xs text-emerald-100">
              Partida #{game.code} · Ronda {game.round}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => undoLastAction()}
              disabled={game.undoHistory.length === 0}
              className="bg-white/15 hover:bg-white/25 disabled:opacity-30 px-3 py-2 rounded-lg text-sm font-medium"
              title="Deshacer última acción"
            >
              ↶
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Bote de Parking */}
        {game.rules.freeParking && game.freeParking > 0 && (
          <div className="px-4 pb-3">
            <div className="bg-amber-400 text-amber-900 rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="font-semibold text-sm">
                💰 Bote Parking: {fmt(game.freeParking)}
              </div>
              <button
                onClick={() => setClaimParkingFor('select')}
                className="bg-amber-900 text-white text-xs px-3 py-1 rounded-full font-semibold"
              >
                Reclamar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="absolute right-3 top-16 z-40 bg-white rounded-xl shadow-2xl py-2 w-56 border">
          <button
            onClick={() => {
              if (confirm('¿Finalizar partida y ver resultados?')) {
                useGameStore.getState().endGame();
              }
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-100"
          >
            🏁 Finalizar partida
          </button>
          <button
            onClick={() => {
              if (confirm('¿Salir y borrar partida actual?')) {
                resetGame();
              }
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600"
          >
            🚪 Salir / Nueva partida
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-3 pt-3 flex gap-2">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
            activeTab === 'players'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white text-slate-600'
          }`}
        >
          👥 Jugadores
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
            activeTab === 'log'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white text-slate-600'
          }`}
        >
          📜 Movimientos
        </button>
      </div>

      <div className="p-3 space-y-3">
        {activeTab === 'players' ? (
          <>
            {game.players.map((player) => (
              <PlayerHub
                key={player.id}
                player={player}
                onPay={(toId) => setTransferModal({ from: player.id, to: toId })}
                onReceive={(fromId) => setTransferModal({ from: fromId, to: player.id })}
                onOpenProperties={() => setPropertiesModalForPlayer(player.id)}
                onTrade={() => setTradeModal(player.id)}
              />
            ))}
          </>
        ) : (
          <TransactionsLog />
        )}
      </div>

      {/* Acciones rápidas globales fijas abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-3 flex gap-2 z-20">
        <button
          onClick={() => setTransferModal({ from: 'bank' })}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg text-sm"
        >
          💸 Banca paga
        </button>
        <button
          onClick={() => setTransferModal({ to: 'bank' })}
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-lg text-sm"
        >
          🧾 Cobrar a jugador
        </button>
      </div>

      {transferModal && (
        <TransferModal
          presetFrom={transferModal.from}
          presetTo={transferModal.to}
          onClose={() => setTransferModal(null)}
        />
      )}

      {propertiesModalForPlayer && (
        <PropertiesModal
          playerId={propertiesModalForPlayer}
          onClose={() => setPropertiesModalForPlayer(null)}
        />
      )}

      {tradeModal && (
        <TradeModal
          initiatorId={tradeModal}
          onClose={() => setTradeModal(null)}
        />
      )}

      {claimParkingFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setClaimParkingFor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-3">¿Quién reclama el bote?</h3>
            <div className="space-y-2">
              {game.players.filter(p => p.isActive).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    claimFreeParking(p.id);
                    setClaimParkingFor(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-slate-50"
                >
                  <div className="w-8 h-8 rounded-full" style={{ background: p.color }} />
                  <div className="font-medium">{p.name}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setClaimParkingFor(null)} className="mt-3 w-full py-2 text-slate-500">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
