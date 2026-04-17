// Tipos principales de la aplicación

export type PropertyType = 'street' | 'station' | 'utility' | 'tax' | 'special';
export type GameStatus = 'lobby' | 'playing' | 'finished';
export type BankruptcyRule = 'to_creditor' | 'to_bank';
export type PlayerRole = 'player' | 'banker' | 'admin';
export type PropertySet = 'standard' | 'spanish' | 'custom';
export type GameMode = 'single' | 'multi';

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
  properties: string[];
  mortgagedProperties: string[];
  houses: number;
  hotels: number;
  housesPerProperty?: Record<string, number>; // 0-4 = casas, 5 = hotel
  role: PlayerRole;
  color: string;
  isActive: boolean;
}

export interface Game {
  id: string;
  code: string;
  createdAt: number;
  status: GameStatus;
  adminId: string;
  bankerId: string;
  players: Player[];
  rules: GameRules;
  currentPlayerId: string;
  round: number;
  totalTime: number;
  freeParking: number;
  transactions: Transaction[];
  trades: Trade[];
  undoHistory: UndoAction[];
}

export interface GameRules {
  initialBalance: number;
  freeParking: boolean;
  doubleOnExactStart: boolean;
  bankruptcyRule: BankruptcyRule;
  propertySet: PropertySet;
  customProperties?: Property[];
}

export interface Transaction {
  id: string;
  timestamp: number;
  fromPlayerId: string | 'bank';
  toPlayerId: string | 'bank';
  amount: number;
  reason: string;
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
  duration?: number;
}

export interface UndoAction {
  id: string;
  gameId: string;
  type: 'transaction' | 'property' | 'mortgage';
  data: any;
  timestamp: number;
}

export interface GameSession {
  roomId: string;
  playerId: string;
  playerName: string;
}
