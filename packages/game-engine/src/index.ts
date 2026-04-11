// @barbarossa/game-engine — barrel export

// Types
export type {
  UnitType,
  Faction,
  Power,
  CityName,
  SpecialCityName,
  AnyCityName,
  CardData,
  CityPosition,
  UnitGroup,
  CityState,
  ConflictDeployment,
  Conflict,
  DraftState,
  TurnState,
  PlayerState,
  GameStatus,
  GamePhase,
  CardAction,
  GameState,
  Recruitment,
  UnitCounts,
} from './types';

// Constants
export {
  UNIT_TYPES,
  FACTIONS,
  FACTION_COLORS,
  STARTING_RESERVES,
  POWERS,
  CITY_NAMES,
  SPECIAL_CITY_NAMES,
} from './types';

// Cards
export { getCard, getRecruitment, getAllCardNames, buildDeck, CARDS } from './cards';

// Cities
export {
  getConnections,
  isSpecialCity,
  isPlayableCity,
  getCityPosition,
  initializeCities,
  areAdjacent,
  ADJACENCY,
  CITY_POSITIONS,
  SPECIAL_CITIES,
} from './cities';

// Units
export { createUnitGroup, getUnitAssetPath, getCardAssetPath, getMapAssetPath, isValidUnitType } from './units';

// Player
export {
  createPlayer,
  hasUnitsInReserve,
  hasAvailableUnits,
  recruit,
  consumeAvailable,
  returnToReserve,
  applyMerchantIncome,
  addCard,
  removeCard,
  toClientData,
  toOwnerData,
} from './player';

// Draft
export { startDraft, chooseDraftCards, startActionsPhase, resetTurnState, getPlayerInAdvantage } from './draft';

// Actions
export {
  playCard,
  deployUnits,
  endTurn,
  passTurn,
  executeSetupRound1,
  chooseBonusUnits,
  addUnitToCity,
} from './actions';

// Powers
export { executePower } from './powers';

// Resolution
export { resolveConflicts, calculateConflictStrength, changeCityControl } from './resolution';

// Victory
export {
  endRound,
  updateItalyControl,
  has6ConnectedCities,
} from './victory';

// Game (state machine)
export {
  createGame,
  addPlayer,
  swapFactions,
  setStartingCity,
  startGame,
  toSpectatorData,
  toPlayerData,
  toJSON,
} from './game';

// Validation schemas
export {
  AddPlayerSchema,
  SetStartingCitySchema,
  DraftChoiceSchema,
  SetupRound1Schema,
  BonusUnitsSchema,
  PlayCardSchema,
  DeployUnitsSchema,
  EndTurnSchema,
} from './validation';
