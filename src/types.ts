// Tipos principales de la aplicación

export type PropertyType = 'street' | 'station' | 'utility' | 'tax' | 'special';
export type GameStatus = 'lobby' | 'playing' | 'finished';
export type BanktuptcyRule = 'to_creditor' | 'to_bank';
export type PlayerRole = 'player' | 'banker' | 'admin';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  color?: string; // hex color para grupos de calles
  purchasePrice: number;
  mortgageValue: number;
  rentBase: number;
  rentWithHouse: number[];
  rentWithHotel: number;
  housePrice: number;
  hotelPrice: number;
  boardPosition: number;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  properties: string[]; // IDs de propiedades
  mortgagedProperties: string[]; // IDs de propiedades hipotecadas
  houses: number; // Cantidad de casas
  hotels: number; // Cantidad de hoteles
  role: PlayerRole;
  color: string; // Color visual del jugador
  isActive: boolean;
}

export interface Game {
  id: string;
  code: string; // Código de 6 caracteres
  createdAt: number;
  status: GameStatus;
  adminId: string;
  bankerId: string;
  players: Player[];
  rules: GameRules;
  currentPlayerId: string;
  round: number;
  totalTime: number; // en segundos
  freeParking: number; // Bote central si Parking Gratuito está ON
  transactions: Transaction[];
  trades: Trade[];
  undoHistory: UndoAction[];
}

export interface GameRules {
  initialBalance: number;
  freeParking: boolean;
  doubleOnExactStart: boolean;
  bankruptcyRule: BanktuptcyRule;
  propertySet: 'standard' | 'custom';
  customProperties?: Property[];
}

export interface Transaction {
  id: string;
  timestamp: number;
  fromPlayerId: string | 'bank'; // 'bank' para transacciones del banco
  toPlayerId: string | 'bank';
  amount: number;
  reason: string; // "Rent", "Tax", "Free Parking", etc.
  propertyId?: string;
  metadata?: Record<string, any>;
}

export interface Trade {
  id: string;
  createdAt: number;
  initiatorId: string;
  recipientId: string;
  offersProperties: string[];
  offersMoney: number;
  requestsProperties: string[];
  requestsMoney: number;
  specialClauses?: SpecialClause[];
  status: 'pending' | 'accepted' | 'rejected';
  executedAt?: number;
}

export interface SpecialClause {
  id: string;
  type: 'rent_immunity' | 'profit_share' | 'conditional';
  description: string;
  affectedProperty?: string;
  affectedPlayer?: string;
  condition?: string;
  duration?: number; // en turnos
}

export interface UndoAction {
  id: string;
  gameId: string;
  timestamp: number;
  action: Transaction | Trade;
  reversalAction: Transaction | Trade;
}

export interface GameSession {
  roomId: string;
  playerId: string;
  playerName: string;
}
