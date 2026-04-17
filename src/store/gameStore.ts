import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, Player, Transaction, Trade, GameRules, Property } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { STANDARD_PROPERTIES, SPANISH_PROPERTIES } from '../data/monopolyProperties';

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

function getProperties(game: Game): Property[] {
  if (game.rules.propertySet === 'custom' && game.rules.customProperties) {
    return game.rules.customProperties;
  }
  if (game.rules.propertySet === 'spanish') return SPANISH_PROPERTIES;
  return STANDARD_PROPERTIES;
}

interface GameStore {
  game: Game | null;
  // Identidad del usuario en este dispositivo (admin en single-device)
  myPlayerId: string | null;
  // Modo de juego
  mode: 'single' | 'multi';

  // Crear partida nueva
  createGame: (adminName: string, rules: GameRules, mode: 'single' | 'multi') => Game;
  loadGame: (game: Game) => void;
  resetGame: () => void;

  // Gestión de jugadores (admin)
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  renamePlayer: (playerId: string, newName: string) => void;
  setBanker: (playerId: string) => void;
  startGame: () => void;

  // Transacciones
  transferMoney: (fromId: string | 'bank', toId: string | 'bank', amount: number, reason: string, propertyId?: string) => boolean;
  collectFromAll: (toId: string, amount: number, reason: string) => void;
  payToAll: (fromId: string, amount: number, reason: string) => boolean;
  claimFreeParking: (playerId: string) => boolean;

  // Propiedades
  buyProperty: (playerId: string, propertyId: string, customPrice?: number) => boolean;
  transferProperty: (fromId: string, toId: string, propertyId: string) => void;
  mortgageProperty: (playerId: string, propertyId: string) => boolean;
  unmortgageProperty: (playerId: string, propertyId: string) => boolean;
  buildHouse: (playerId: string, propertyId: string) => boolean;
  sellHouse: (playerId: string, propertyId: string) => boolean;

  // Tratos
  proposeTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'status'>) => void;
  acceptTrade: (tradeId: string) => boolean;
  rejectTrade: (tradeId: string) => void;

  // Personalización de propiedades
  renameProperty: (propertyId: string, newName: string) => void;

  // Utilidades
  undoLastAction: () => void;
  endGame: () => void;
  getProperties: () => Property[];
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      myPlayerId: null,
      mode: 'single',

      createGame: (adminName, rules, mode) => {
        const adminId = uuidv4();
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const adminPlayer: Player = {
          id: adminId,
          name: adminName,
          balance: rules.initialBalance,
          properties: [],
          mortgagedProperties: [],
          houses: 0,
          hotels: 0,
          housesPerProperty: {},
          role: 'admin',
          color: PLAYER_COLORS[0],
          isActive: true,
        };

        const game: Game = {
          id: uuidv4(),
          code,
          createdAt: Date.now(),
          status: 'lobby',
          adminId,
          bankerId: adminId,
          players: [adminPlayer],
          rules,
          currentPlayerId: adminId,
          round: 1,
          totalTime: 0,
          freeParking: 0,
          transactions: [],
          trades: [],
          undoHistory: [],
        };

        set({ game, myPlayerId: adminId, mode });
        return game;
      },

      loadGame: (game) => set({ game }),

      resetGame: () => set({ game: null, myPlayerId: null }),

      addPlayer: (name) => {
        const { game } = get();
        if (!game || game.status !== 'lobby') return;
        const usedColors = new Set(game.players.map((p) => p.color));
        const color = PLAYER_COLORS.find((c) => !usedColors.has(c)) || PLAYER_COLORS[0];
        const player: Player = {
          id: uuidv4(),
          name,
          balance: game.rules.initialBalance,
          properties: [],
          mortgagedProperties: [],
          houses: 0,
          hotels: 0,
          housesPerProperty: {},
          role: 'player',
          color,
          isActive: true,
        };
        set({ game: { ...game, players: [...game.players, player] } });
      },

      removePlayer: (playerId) => {
        const { game } = get();
        if (!game || game.status !== 'lobby') return;
        if (playerId === game.adminId) return;
        set({ game: { ...game, players: game.players.filter((p) => p.id !== playerId) } });
      },

      renamePlayer: (playerId, newName) => {
        const { game } = get();
        if (!game) return;
        const players = game.players.map((p) => (p.id === playerId ? { ...p, name: newName } : p));
        set({ game: { ...game, players } });
      },

      setBanker: (playerId) => {
        const { game } = get();
        if (!game) return;
        set({ game: { ...game, bankerId: playerId } });
      },

      startGame: () => {
        const { game } = get();
        if (!game) return;
        set({ game: { ...game, status: 'playing', currentPlayerId: game.players[0].id } });
      },

      transferMoney: (fromId, toId, amount, reason, propertyId) => {
        const { game } = get();
        if (!game || amount <= 0) return false;

        const newPlayers = [...game.players];
        if (fromId !== 'bank') {
          const idx = newPlayers.findIndex((p) => p.id === fromId);
          if (idx === -1) return false;
          if (newPlayers[idx].balance < amount) return false;
          newPlayers[idx] = { ...newPlayers[idx], balance: newPlayers[idx].balance - amount };
        }
        let freeParking = game.freeParking;
        if (toId !== 'bank') {
          const idx = newPlayers.findIndex((p) => p.id === toId);
          if (idx === -1) return false;
          newPlayers[idx] = { ...newPlayers[idx], balance: newPlayers[idx].balance + amount };
        } else if (game.rules.freeParking && fromId !== 'bank') {
          // El dinero va al bote del Parking Gratuito en vez de desaparecer
          freeParking += amount;
        }

        const transaction: Transaction = {
          id: uuidv4(),
          timestamp: Date.now(),
          fromPlayerId: fromId,
          toPlayerId: toId,
          amount,
          reason,
          propertyId,
        };

        set({
          game: {
            ...game,
            players: newPlayers,
            freeParking,
            transactions: [transaction, ...game.transactions].slice(0, 200),
            undoHistory: [
              { id: uuidv4(), gameId: game.id, type: 'transaction' as const, data: transaction, timestamp: Date.now() },
              ...game.undoHistory,
            ].slice(0, 20),
          },
        });
        return true;
      },

      collectFromAll: (toId, amount, reason) => {
        const { game, transferMoney } = get();
        if (!game) return;
        game.players.forEach((p) => {
          if (p.id !== toId && p.isActive) {
            transferMoney(p.id, toId, amount, reason);
          }
        });
      },

      payToAll: (fromId, amount, reason) => {
        const { game, transferMoney } = get();
        if (!game) return false;
        const others = game.players.filter((p) => p.id !== fromId && p.isActive);
        const total = others.length * amount;
        const payer = game.players.find((p) => p.id === fromId);
        if (!payer || payer.balance < total) return false;
        others.forEach((p) => transferMoney(fromId, p.id, amount, reason));
        return true;
      },

      claimFreeParking: (playerId) => {
        const { game } = get();
        if (!game || game.freeParking <= 0) return false;
        const amount = game.freeParking;
        const players = game.players.map((p) =>
          p.id === playerId ? { ...p, balance: p.balance + amount } : p
        );
        const transaction: Transaction = {
          id: uuidv4(),
          timestamp: Date.now(),
          fromPlayerId: 'bank',
          toPlayerId: playerId,
          amount,
          reason: 'Parking Gratuito',
        };
        set({
          game: {
            ...game,
            players,
            freeParking: 0,
            transactions: [transaction, ...game.transactions].slice(0, 200),
          },
        });
        return true;
      },

      buyProperty: (playerId, propertyId, customPrice) => {
        const { game, transferMoney } = get();
        if (!game) return false;
        const property = get().getProperties().find((p) => p.id === propertyId);
        if (!property) return false;
        // Verificar que nadie sea ya el dueño
        const owner = game.players.find((p) => p.properties.includes(propertyId));
        if (owner) return false;
        const price = customPrice ?? property.purchasePrice;
        const player = game.players.find((p) => p.id === playerId);
        if (!player || player.balance < price) return false;

        // Cobrar
        transferMoney(playerId, 'bank', price, `Compra: ${property.name}`, propertyId);

        // Asignar la propiedad
        const updated = get().game!;
        const players = updated.players.map((p) =>
          p.id === playerId ? { ...p, properties: [...p.properties, propertyId] } : p
        );
        set({ game: { ...updated, players } });
        return true;
      },

      transferProperty: (fromId, toId, propertyId) => {
        const { game } = get();
        if (!game) return;
        const players = game.players.map((p) => {
          if (p.id === fromId) {
            return {
              ...p,
              properties: p.properties.filter((id) => id !== propertyId),
              mortgagedProperties: p.mortgagedProperties.filter((id) => id !== propertyId),
            };
          }
          if (p.id === toId) {
            return { ...p, properties: [...p.properties, propertyId] };
          }
          return p;
        });
        set({ game: { ...game, players } });
      },

      mortgageProperty: (playerId, propertyId) => {
        const { game } = get();
        if (!game) return false;
        const property = get().getProperties().find((p) => p.id === propertyId);
        if (!property) return false;
        const player = game.players.find((p) => p.id === playerId);
        if (!player || !player.properties.includes(propertyId)) return false;
        if (player.mortgagedProperties.includes(propertyId)) return false;

        const players = game.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                balance: p.balance + property.mortgageValue,
                mortgagedProperties: [...p.mortgagedProperties, propertyId],
              }
            : p
        );
        const transaction: Transaction = {
          id: uuidv4(),
          timestamp: Date.now(),
          fromPlayerId: 'bank',
          toPlayerId: playerId,
          amount: property.mortgageValue,
          reason: `Hipoteca: ${property.name}`,
          propertyId,
        };
        set({
          game: {
            ...game,
            players,
            transactions: [transaction, ...game.transactions].slice(0, 200),
          },
        });
        return true;
      },

      unmortgageProperty: (playerId, propertyId) => {
        const { game } = get();
        if (!game) return false;
        const property = get().getProperties().find((p) => p.id === propertyId);
        if (!property) return false;
        const player = game.players.find((p) => p.id === playerId);
        if (!player || !player.mortgagedProperties.includes(propertyId)) return false;
        const cost = Math.ceil(property.mortgageValue * 1.1);
        if (player.balance < cost) return false;

        const players = game.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                balance: p.balance - cost,
                mortgagedProperties: p.mortgagedProperties.filter((id) => id !== propertyId),
              }
            : p
        );
        const transaction: Transaction = {
          id: uuidv4(),
          timestamp: Date.now(),
          fromPlayerId: playerId,
          toPlayerId: 'bank',
          amount: cost,
          reason: `Deshipotecar: ${property.name}`,
          propertyId,
        };
        set({
          game: {
            ...game,
            players,
            transactions: [transaction, ...game.transactions].slice(0, 200),
          },
        });
        return true;
      },

      buildHouse: (playerId, propertyId) => {
        const { game } = get();
        if (!game) return false;
        const property = get().getProperties().find((p) => p.id === propertyId);
        if (!property || property.type !== 'street') return false;
        const player = game.players.find((p) => p.id === playerId);
        if (!player || !player.properties.includes(propertyId)) return false;
        if (player.mortgagedProperties.includes(propertyId)) return false;
        const current = player.housesPerProperty?.[propertyId] || 0;
        if (current >= 5) return false; // 4 casas + 1 hotel
        const cost = current === 4 ? property.hotelPrice : property.housePrice;
        if (player.balance < cost) return false;

        const players = game.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                balance: p.balance - cost,
                housesPerProperty: { ...(p.housesPerProperty || {}), [propertyId]: current + 1 },
                houses: current + 1 === 5 ? p.houses - 4 : p.houses + 1,
                hotels: current + 1 === 5 ? p.hotels + 1 : p.hotels,
              }
            : p
        );
        const transaction: Transaction = {
          id: uuidv4(),
          timestamp: Date.now(),
          fromPlayerId: playerId,
          toPlayerId: 'bank',
          amount: cost,
          reason: `${current === 4 ? 'Hotel' : 'Casa'} en ${property.name}`,
          propertyId,
        };
        set({
          game: {
            ...game,
            players,
            transactions: [transaction, ...game.transactions].slice(0, 200),
          },
        });
        return true;
      },

      sellHouse: (playerId, propertyId) => {
        const { game } = get();
        if (!game) return false;
        const property = get().getProperties().find((p) => p.id === propertyId);
        if (!property) return false;
        const player = game.players.find((p) => p.id === playerId);
        if (!player) return false;
        const current = player.housesPerProperty?.[propertyId] || 0;
        if (current === 0) return false;
        const refund = Math.floor((current === 5 ? property.hotelPrice : property.housePrice) / 2);

        const players = game.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                balance: p.balance + refund,
                housesPerProperty: { ...(p.housesPerProperty || {}), [propertyId]: current - 1 },
                houses: current === 5 ? p.houses + 4 : p.houses - 1,
                hotels: current === 5 ? p.hotels - 1 : p.hotels,
              }
            : p
        );
        const transaction: Transaction = {
          id: uuidv4(),
          timestamp: Date.now(),
          fromPlayerId: 'bank',
          toPlayerId: playerId,
          amount: refund,
          reason: `Vende construcción en ${property.name}`,
          propertyId,
        };
        set({
          game: {
            ...game,
            players,
            transactions: [transaction, ...game.transactions].slice(0, 200),
          },
        });
        return true;
      },

      proposeTrade: (tradeData) => {
        const { game } = get();
        if (!game) return;
        const trade: Trade = {
          ...tradeData,
          id: uuidv4(),
          createdAt: Date.now(),
          status: 'pending',
        };
        set({ game: { ...game, trades: [trade, ...game.trades] } });
      },

      acceptTrade: (tradeId) => {
        const { game, transferMoney, transferProperty } = get();
        if (!game) return false;
        const trade = game.trades.find((t) => t.id === tradeId);
        if (!trade || trade.status !== 'pending') return false;

        const initiator = game.players.find((p) => p.id === trade.initiatorId);
        const recipient = game.players.find((p) => p.id === trade.recipientId);
        if (!initiator || !recipient) return false;
        if (initiator.balance < trade.offersMoney) return false;
        if (recipient.balance < trade.requestsMoney) return false;

        // Transferir dinero
        if (trade.offersMoney > 0) {
          transferMoney(trade.initiatorId, trade.recipientId, trade.offersMoney, 'Trato: dinero ofrecido');
        }
        if (trade.requestsMoney > 0) {
          transferMoney(trade.recipientId, trade.initiatorId, trade.requestsMoney, 'Trato: dinero pedido');
        }
        // Transferir propiedades
        trade.offersProperties.forEach((pid) =>
          transferProperty(trade.initiatorId, trade.recipientId, pid)
        );
        trade.requestsProperties.forEach((pid) =>
          transferProperty(trade.recipientId, trade.initiatorId, pid)
        );

        const updated = get().game!;
        const trades = updated.trades.map((t) =>
          t.id === tradeId ? { ...t, status: 'accepted' as const, executedAt: Date.now() } : t
        );
        set({ game: { ...updated, trades } });
        return true;
      },

      rejectTrade: (tradeId) => {
        const { game } = get();
        if (!game) return;
        const trades = game.trades.map((t) =>
          t.id === tradeId ? { ...t, status: 'rejected' as const } : t
        );
        set({ game: { ...game, trades } });
      },

      renameProperty: (propertyId, newName) => {
        const { game } = get();
        if (!game) return;
        const baseProps = get().getProperties();
        const customProps = baseProps.map((p) =>
          p.id === propertyId ? { ...p, name: newName } : p
        );
        set({
          game: {
            ...game,
            rules: { ...game.rules, propertySet: 'custom', customProperties: customProps },
          },
        });
      },

      undoLastAction: () => {
        const { game } = get();
        if (!game || game.undoHistory.length === 0) return;
        const [last, ...rest] = game.undoHistory;
        if (last.type === 'transaction') {
          const t = last.data as Transaction;
          // Revertir
          const newPlayers = [...game.players];
          if (t.fromPlayerId !== 'bank') {
            const idx = newPlayers.findIndex((p) => p.id === t.fromPlayerId);
            if (idx >= 0) newPlayers[idx] = { ...newPlayers[idx], balance: newPlayers[idx].balance + t.amount };
          }
          if (t.toPlayerId !== 'bank') {
            const idx = newPlayers.findIndex((p) => p.id === t.toPlayerId);
            if (idx >= 0) newPlayers[idx] = { ...newPlayers[idx], balance: newPlayers[idx].balance - t.amount };
          }
          set({
            game: {
              ...game,
              players: newPlayers,
              transactions: game.transactions.filter((tx) => tx.id !== t.id),
              undoHistory: rest,
            },
          });
        }
      },

      endGame: () => {
        const { game } = get();
        if (!game) return;
        set({ game: { ...game, status: 'finished' } });
      },

      getProperties: () => {
        const { game } = get();
        if (!game) return [];
        return getProperties(game);
      },
    }),
    {
      name: 'monopoly-bank-state',
    }
  )
);
