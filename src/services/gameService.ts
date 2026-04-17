import { Game, Player, GameRules, Transaction, Trade, SpecialClause } from '../types';
import { STANDARD_PROPERTIES, SPANISH_PROPERTIES } from '../data/monopolyProperties';
import { v4 as uuidv4 } from 'uuid';

// Servicio para gestionar la lógica del juego
// Actualmente usa localStorage como backend. En producción, usar Firebase/Supabase

const GAMES_KEY = 'monopoly_games';

export class GameService {
  // Generar código de 6 caracteres único
  static generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Crear una nueva partida
  static createGame(
    adminPlayerId: string,
    adminPlayerName: string,
    rules: GameRules
  ): Game {
    const gameId = uuidv4();
    const gameCode = this.generateGameCode();

    const adminPlayer: Player = {
      id: adminPlayerId,
      name: adminPlayerName,
      balance: rules.initialBalance,
      properties: [],
      mortgagedProperties: [],
      houses: 0,
      hotels: 0,
      role: 'admin',
      color: '#FF6B6B',
      isActive: true,
    };

    const game: Game = {
      id: gameId,
      code: gameCode,
      createdAt: Date.now(),
      status: 'lobby',
      adminId: adminPlayerId,
      bankerId: adminPlayerId, // El admin es banker inicialmente
      players: [adminPlayer],
      rules,
      currentPlayerId: adminPlayerId,
      round: 0,
      totalTime: 0,
      freeParking: 0,
      transactions: [],
      trades: [],
      undoHistory: [],
    };

    this.saveGame(game);
    return game;
  }

  // Obtener juego por código
  static getGameByCode(code: string): Game | null {
    const games = this.getAllGames();
    return games.find((g) => g.code === code) || null;
  }

  // Obtener juego por ID
  static getGameById(id: string): Game | null {
    const games = this.getAllGames();
    return games.find((g) => g.id === id) || null;
  }

  // Obtener todos los juegos
  static getAllGames(): Game[] {
    const gamesJson = localStorage.getItem(GAMES_KEY);
    return gamesJson ? JSON.parse(gamesJson) : [];
  }

  // Guardar juego
  static saveGame(game: Game): void {
    const games = this.getAllGames();
    const index = games.findIndex((g) => g.id === game.id);
    if (index >= 0) {
      games[index] = game;
    } else {
      games.push(game);
    }
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  }

  // Añadir jugador a partida
  static addPlayerToGame(gameId: string, playerName: string): Player {
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Game not found');

    const playerId = uuidv4();
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
    ];
    const usedColors = new Set(game.players.map((p) => p.color));
    const availableColor = colors.find((c) => !usedColors.has(c)) || colors[0];

    const player: Player = {
      id: playerId,
      name: playerName,
      balance: game.rules.initialBalance,
      properties: [],
      mortgagedProperties: [],
      houses: 0,
      hotels: 0,
      role: 'player',
      color: availableColor,
      isActive: true,
    };

    game.players.push(player);
    this.saveGame(game);
    return player;
  }

  // Registrar transacción
  static recordTransaction(
    gameId: string,
    fromPlayerId: string | 'bank',
    toPlayerId: string | 'bank',
    amount: number,
    reason: string,
    propertyId?: string,
    metadata?: Record<string, any>
  ): Transaction {
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: Date.now(),
      fromPlayerId,
      toPlayerId,
      amount,
      reason,
      propertyId,
      metadata,
    };

    const game = this.getGameById(gameId);
    if (game) {
      game.transactions.push(transaction);
      this.saveGame(game);
    }

    return transaction;
  }

  // Transferir dinero entre jugadores
  static transferMoney(
    gameId: string,
    fromPlayerId: string,
    toPlayerId: string,
    amount: number,
    reason: string
  ): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;

    const fromPlayer = game.players.find((p) => p.id === fromPlayerId);
    const toPlayer = game.players.find((p) => p.id === toPlayerId);

    if (!fromPlayer || !toPlayer) return false;
    if (fromPlayer.balance < amount) return false;

    fromPlayer.balance -= amount;
    toPlayer.balance += amount;

    this.recordTransaction(gameId, fromPlayerId, toPlayerId, amount, reason);
    this.saveGame(game);
    return true;
  }

  // Pagar a la banca (impuestos, etc.)
  static payToBank(
    gameId: string,
    playerId: string,
    amount: number,
    reason: string
  ): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return false;
    if (player.balance < amount) return false;

    player.balance -= amount;

    if (game.rules.freeParking && reason.includes('tax')) {
      game.freeParking += amount;
    }

    this.recordTransaction(gameId, playerId, 'bank', amount, reason);
    this.saveGame(game);
    return true;
  }

  // Reclamar bote de parking gratuito
  static claimFreeParking(gameId: string, playerId: string): boolean {
    const game = this.getGameById(gameId);
    if (!game || !game.rules.freeParking) return false;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return false;

    const amount = game.freeParking;
    player.balance += amount;
    game.freeParking = 0;

    this.recordTransaction(gameId, 'bank', playerId, amount, 'Free Parking');
    this.saveGame(game);
    return true;
  }

  // Hipotecar propiedad
  static mortgageProperty(
    gameId: string,
    playerId: string,
    propertyId: string
  ): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return false;

    const properties =
      game.rules.propertySet === 'custom' && game.rules.customProperties
        ? game.rules.customProperties
        : game.rules.propertySet === 'standard'
          ? STANDARD_PROPERTIES
          : SPANISH_PROPERTIES;

    const property = properties.find((p) => p.id === propertyId);
    if (!property) return false;

    if (
      !player.properties.includes(propertyId) ||
      player.mortgagedProperties.includes(propertyId)
    )
      return false;

    player.mortgagedProperties.push(propertyId);
    player.balance += property.mortgageValue;

    this.recordTransaction(
      gameId,
      'bank',
      playerId,
      property.mortgageValue,
      `Mortgage: ${property.name}`
    );
    this.saveGame(game);
    return true;
  }

  // Deshipotecar propiedad
  static unMortgageProperty(
    gameId: string,
    playerId: string,
    propertyId: string
  ): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return false;

    const properties =
      game.rules.propertySet === 'custom' && game.rules.customProperties
        ? game.rules.customProperties
        : game.rules.propertySet === 'standard'
          ? STANDARD_PROPERTIES
          : SPANISH_PROPERTIES;

    const property = properties.find((p) => p.id === propertyId);
    if (!property) return false;

    if (!player.mortgagedProperties.includes(propertyId)) return false;

    const unMortgageCost = Math.ceil(property.mortgageValue * 1.1);
    if (player.balance < unMortgageCost) return false;

    player.mortgagedProperties = player.mortgagedProperties.filter(
      (pId) => pId !== propertyId
    );
    player.balance -= unMortgageCost;

    this.recordTransaction(
      gameId,
      playerId,
      'bank',
      unMortgageCost,
      `Unmortgage: ${property.name}`
    );
    this.saveGame(game);
    return true;
  }

  // Calcular alquiler
  static calculateRent(
    propertyId: string,
    propertySet: 'standard' | 'spanish' | 'custom',
    ownerProperties: string[],
    customProperties?: any[]
  ): number {
    const properties =
      propertySet === 'custom' && customProperties
        ? customProperties
        : propertySet === 'standard'
          ? STANDARD_PROPERTIES
          : SPANISH_PROPERTIES;

    const property = properties.find((p) => p.id === propertyId);
    if (!property) return 0;

    // Para servicios públicos, el alquiler se calcula por dados
    if (property.type === 'utility') {
      return property.rentBase; // Se multiplica por resultado de dados
    }

    // Para calles, revisar si hay monopolio
    if (property.type === 'street') {
      const colorGroup = properties.filter((p) => p.color === property.color);
      const hasMonopoly = colorGroup.every((p) =>
        ownerProperties.includes(p.id)
      );

      if (hasMonopoly) {
        return property.rentBase * 2;
      }
    }

    return property.rentBase;
  }

  // Crear trade/propuesta
  static createTrade(
    gameId: string,
    initiatorId: string,
    recipientId: string,
    offersProperties: string[],
    offersMoney: number,
    requestsProperties: string[],
    requestsMoney: number,
    specialClauses: SpecialClause[] = []
  ): Trade {
    const trade: Trade = {
      id: uuidv4(),
      createdAt: Date.now(),
      initiatorId,
      recipientId,
      offersProperties,
      offersMoney,
      requestsProperties,
      requestsMoney,
      specialClauses,
      status: 'pending',
    };

    const game = this.getGameById(gameId);
    if (game) {
      game.trades.push(trade);
      this.saveGame(game);
    }

    return trade;
  }

  // Aceptar trade
  static acceptTrade(gameId: string, tradeId: string): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;

    const trade = game.trades.find((t) => t.id === tradeId);
    if (!trade || trade.status !== 'pending') return false;

    const initiator = game.players.find((p) => p.id === trade.initiatorId);
    const recipient = game.players.find((p) => p.id === trade.recipientId);

    if (!initiator || !recipient) return false;

    // Validar dinero
    if (initiator.balance < trade.offersMoney) return false;
    if (recipient.balance < trade.requestsMoney) return false;

    // Transferir dinero
    initiator.balance -= trade.offersMoney;
    recipient.balance += trade.offersMoney;

    recipient.balance -= trade.requestsMoney;
    initiator.balance += trade.requestsMoney;

    // Transferir propiedades
    trade.offersProperties.forEach((propId) => {
      initiator.properties = initiator.properties.filter((p) => p !== propId);
      recipient.properties.push(propId);
    });

    trade.requestsProperties.forEach((propId) => {
      recipient.properties = recipient.properties.filter((p) => p !== propId);
      initiator.properties.push(propId);
    });

    trade.status = 'accepted';
    trade.executedAt = Date.now();

    this.saveGame(game);
    return true;
  }

  // Rechazar trade
  static rejectTrade(gameId: string, tradeId: string): boolean {
    const game = this.getGameById(gameId);
    if (!game) return false;

    const trade = game.trades.find((t) => t.id === tradeId);
    if (!trade) return false;

    trade.status = 'rejected';
    this.saveGame(game);
    return true;
  }

  // Calcular patrimonio total de un jugador
  static calculateNetWorth(
    player: Player,
    propertySet: 'standard' | 'spanish' | 'custom',
    customProperties?: any[]
  ): { cash: number; properties: number; total: number } {
    const properties =
      propertySet === 'custom' && customProperties
        ? customProperties
        : propertySet === 'standard'
          ? STANDARD_PROPERTIES
          : SPANISH_PROPERTIES;

    let propertiesValue = 0;

    player.properties.forEach((propId) => {
      const property = properties.find((p) => p.id === propId);
      if (!property) return;

      let value = property.purchasePrice;

      // Si está hipotecada, no cuenta su valor completo
      if (player.mortgagedProperties.includes(propId)) {
        value = property.mortgageValue;
      }

      propertiesValue += value;
    });

    // Añadir valor de casas y hoteles (aproximadamente)
    propertiesValue += player.houses * 50 + player.hotels * 200;

    return {
      cash: player.balance,
      properties: propertiesValue,
      total: player.balance + propertiesValue,
    };
  }
}
