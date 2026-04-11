// ─── Unit Types ──────────────────────────────────────────────
export const UNIT_TYPES = {
  CAVALLERIA: 'cavalleria',
  VESCOVI: 'vescovi',
  MERCANTI: 'mercanti',
} as const;

export type UnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES];

// ─── Factions ────────────────────────────────────────────────
export const FACTIONS = {
  BARBAROSSA: 'Barbarossa',
  LEGA: 'Lega',
} as const;

export type Faction = (typeof FACTIONS)[keyof typeof FACTIONS];

// ─── Colors ──────────────────────────────────────────────────
export const FACTION_COLORS: Record<Faction, string> = {
  Barbarossa: 'Giallo',
  Lega: 'Verde',
};

// ─── Starting Reserves ──────────────────────────────────────
export type UnitCounts = Record<UnitType, number>;

export const STARTING_RESERVES: Record<Faction, UnitCounts> = {
  Barbarossa: { cavalleria: 6, vescovi: 4, mercanti: 3 },
  Lega: { cavalleria: 5, vescovi: 3, mercanti: 4 },
};

// ─── Recruitment ─────────────────────────────────────────────
export interface Recruitment {
  cavalleria: number;
  vescovi: number;
  mercanti: number;
}

// ─── Powers ──────────────────────────────────────────────────
export const POWERS = {
  CAPITALE_LEGA: 'capitale_lega',
  SEDE_VESCOVILE: 'sede_vescovile',
  MERCATO: 'mercato',
  FORTEZZA: 'fortezza',
  PORTO_NAVALE: 'porto_navale',
  CROCEVIA: 'crocevia',
  POTENZA_NAVALE: 'potenza_navale',
  UNIVERSITA: 'universita',
  VIA_COMMERCIALE: 'via_commerciale',
  DIRITTO_CANONICO: 'diritto_canonico',
  CONTROLLO_IMPERIALE: 'controllo_imperiale',
} as const;

export type Power = (typeof POWERS)[keyof typeof POWERS];

// ─── City Names ──────────────────────────────────────────────
export const CITY_NAMES = [
  'Milano', 'Asti', 'Ferrara', 'Firenze', 'Bergamo',
  'Pisa', 'Lodi', 'Verona', 'Venezia', 'Padova',
  'Ravenna', 'Bologna', 'Modena', 'Ancona', 'Trento',
] as const;

export type CityName = (typeof CITY_NAMES)[number];

export const SPECIAL_CITY_NAMES = ['Roma', 'Germania'] as const;
export type SpecialCityName = (typeof SPECIAL_CITY_NAMES)[number];
export type AnyCityName = CityName | SpecialCityName;

// ─── Card Data ───────────────────────────────────────────────
export interface CardData {
  name: CityName;
  recruitment: Recruitment;
  recruitmentControlled: Recruitment;
  power: Power | null;
  description: string;
  connections: AnyCityName[];
}

// ─── City Position (% on map) ────────────────────────────────
export interface CityPosition {
  top: number;
  left: number;
}

// ─── Unit Group on Map ───────────────────────────────────────
export interface UnitGroup {
  faction: Faction;
  type: UnitType;
  quantity: number;
}

// ─── City State (in game) ────────────────────────────────────
export interface CityState {
  name: CityName;
  controlledBy: Faction | null;
  units: UnitGroup[];
}

// ─── Conflict ────────────────────────────────────────────────
export interface ConflictDeployment {
  type: UnitType;
  quantity: number;
}

export interface Conflict {
  city: CityName;
  order: number;
  typeConstraint: UnitType | null;
  deployments: Partial<Record<Faction, ConflictDeployment[]>>;
  resolved: boolean;
}

// ─── Draft State ─────────────────────────────────────────────
export interface DraftState {
  step: 0 | 1 | 2;
  drawnCards: Record<string, CityName[]>;
  choices: Record<string, { kept: CityName[]; passed: CityName[] }>;
}

// ─── Turn State ──────────────────────────────────────────────
export interface TurnState {
  cardPlayed: boolean;
  deploymentDone: boolean;
}

// ─── Player State ────────────────────────────────────────────
export interface PlayerState {
  id: string;
  name: string;
  faction: Faction;
  color: string;
  hand: CityName[];
  reserve: UnitCounts;
  available: UnitCounts;
  citiesControlled: CityName[];
  startingCity: CityName | null;
  turnCompleted: boolean;
  isReady: boolean;
}

// ─── Game Status ─────────────────────────────────────────────
export type GameStatus = 'waiting' | 'draft' | 'playing' | 'finished';
export type GamePhase = 1 | 2 | 3; // 1=Draft, 2=Actions, 3=Resolution

// ─── Card Action ─────────────────────────────────────────────
export type CardAction = 'conflitto' | 'recluta' | 'potere';

// ─── Game State ──────────────────────────────────────────────
export interface GameState {
  id: string;
  name: string;
  status: GameStatus;
  phase: GamePhase;
  round: number;
  timeMarker: number;
  italyControl: number;
  players: PlayerState[];
  activePlayerId: string | null;
  deck: CityName[];
  discards: CityName[];
  cities: CityState[];
  activeConflicts: Conflict[];
  conflictOrder: number;
  draftState: DraftState;
  turnState: TurnState;
  setupRound1Complete: boolean;
  winner: Faction | 'Pareggio' | null;
  log: string[];
  createdAt: Date;
  lastUpdate: Date;
}
