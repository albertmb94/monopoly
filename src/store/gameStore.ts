import { create } from 'zustand';
import { Game, Player, Transaction, Trade, GameSession } from '../types';

interface GameStore {
  // Estado
  currentGame: Game | null;
  currentPlayer: Player | null;
  currentSession: GameSession | null;
  isLoading: boolean;
  error: string | null;

  // Getters
  isAdmin: () => boolean;
  isBanker: () => boolean;
  isCurrentPlayer: () => boolean;

  // Acciones de sesión
  setSession: (session: GameSession) => void;
  clearSession: () => void;

  // Acciones de juego
  setGame: (game: Game) => void;
  setCurrentPlayer: (player: Player) => void;
  updateGameStatus: (game: Game) => void;
  clearGame: () => void;

  // Acciones de jugador
  updatePlayerBalance: (playerId: string, amount: number) => void;
  addPropertyToPlayer: (playerId: string, propertyId: string) => void;
  removePropertyFromPlayer: (playerId: string, propertyId: string) => void;
  mortgageProperty: (playerId: string, propertyId: string) => void;
  unMortgageProperty: (playerId: string, propertyId: string) => void;
  addHouses: (playerId: string, count: number) => void;
  addHotels: (playerId: string, count: number) => void;

  // Acciones de transacciones
  addTransaction: (transaction: Transaction) => void;
  updateFreeParkingBalance: (amount: number) => void;

  // Acciones de trades
  addTrade: (trade: Trade) => void;
  updateTrade: (tradeId: string, trade: Trade) => void;

  // Acciones de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGame: null,
  currentPlayer: null,
  currentSession: null,
  isLoading: false,
  error: null,

  isAdmin: () => {
    const { currentSession, currentGame } = get();
    return currentSession?.playerId === currentGame?.adminId;
  },

  isBanker: () => {
    const { currentSession, currentGame } = get();
    return currentSession?.playerId === currentGame?.bankerId;
  },

  isCurrentPlayer: () => {
    const { currentSession, currentGame } = get();
    return currentSession?.playerId === currentGame?.currentPlayerId;
  },

  setSession: (session) =>
    set({
      currentSession: session,
    }),

  clearSession: () =>
    set({
      currentSession: null,
      currentGame: null,
      currentPlayer: null,
    }),

  setGame: (game) =>
    set({
      currentGame: game,
    }),

  setCurrentPlayer: (player) =>
    set({
      currentPlayer: player,
    }),

  updateGameStatus: (game) => {
    set({ currentGame: game });
  },

  clearGame: () =>
    set({
      currentGame: null,
      currentPlayer: null,
    }),

  updatePlayerBalance: (playerId, amount) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId ? { ...p, balance: p.balance + amount } : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  addPropertyToPlayer: (playerId, propertyId) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId
          ? { ...p, properties: [...p.properties, propertyId] }
          : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  removePropertyFromPlayer: (playerId, propertyId) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              properties: p.properties.filter((propId) => propId !== propertyId),
            }
          : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  mortgageProperty: (playerId, propertyId) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              mortgagedProperties: [...p.mortgagedProperties, propertyId],
            }
          : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  unMortgageProperty: (playerId, propertyId) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              mortgagedProperties: p.mortgagedProperties.filter(
                (propId) => propId !== propertyId
              ),
            }
          : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  addHouses: (playerId, count) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId ? { ...p, houses: p.houses + count } : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  addHotels: (playerId, count) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedPlayers = state.currentGame.players.map((p) =>
        p.id === playerId ? { ...p, hotels: p.hotels + count } : p
      );
      return {
        currentGame: {
          ...state.currentGame,
          players: updatedPlayers,
        },
      };
    }),

  addTransaction: (transaction) =>
    set((state) => {
      if (!state.currentGame) return state;
      return {
        currentGame: {
          ...state.currentGame,
          transactions: [...state.currentGame.transactions, transaction],
        },
      };
    }),

  updateFreeParkingBalance: (amount) =>
    set((state) => {
      if (!state.currentGame) return state;
      return {
        currentGame: {
          ...state.currentGame,
          freeParking: state.currentGame.freeParking + amount,
        },
      };
    }),

  addTrade: (trade) =>
    set((state) => {
      if (!state.currentGame) return state;
      return {
        currentGame: {
          ...state.currentGame,
          trades: [...state.currentGame.trades, trade],
        },
      };
    }),

  updateTrade: (tradeId, trade) =>
    set((state) => {
      if (!state.currentGame) return state;
      const updatedTrades = state.currentGame.trades.map((t) =>
        t.id === tradeId ? trade : t
      );
      return {
        currentGame: {
          ...state.currentGame,
          trades: updatedTrades,
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
