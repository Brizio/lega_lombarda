import type { GameState, Faction, CityName } from './types';
import { CITY_NAMES } from './types';
import { buildDeck } from './cards';
import { initializeCities } from './cities';
import { createPlayer } from './player';
import { startDraft } from './draft';
import { playCard, deployUnits, endTurn, executeSetupRound1, chooseBonusUnits } from './actions';
import { endRound } from './victory';

// ─── Create Game ─────────────────────────────────────────────

export function createGame(id: string, name: string = ''): GameState {
  return {
    id,
    name,
    status: 'waiting',
    phase: 1,
    round: 1,
    timeMarker: 0,
    italyControl: 0,
    players: [],
    activePlayerId: null,
    deck: buildDeck(),
    discards: [],
    cities: initializeCities(),
    activeConflicts: [],
    conflictOrder: 0,
    draftState: { step: 0, drawnCards: {}, choices: {} },
    turnState: { cardPlayed: false, deploymentDone: false },
    setupRound1Complete: false,
    winner: null,
    log: [],
    createdAt: new Date(),
    lastUpdate: new Date(),
  };
}

// ─── Add Player ──────────────────────────────────────────────

export function addPlayer(state: GameState, playerId: string, playerName: string, faction: Faction): void {
  if (state.players.length >= 2) throw new Error('La partita è piena');
  if (state.players.some((p) => p.faction === faction)) {
    throw new Error(`Fazione ${faction} già presa`);
  }
  if (state.players.some((p) => p.id === playerId)) {
    throw new Error('Giocatore già nella partita');
  }

  const player = createPlayer(playerId, playerName, faction);
  state.players.push(player);
  state.log.push(`${playerName} si è unito come ${faction}`);
  state.lastUpdate = new Date();
}

// ─── Swap Factions ───────────────────────────────────────────

export function swapFactions(state: GameState): void {
  if (state.players.length !== 2) throw new Error('Servono 2 giocatori per scambiare fazioni');
  const [p1, p2] = state.players;
  const tempFaction = p1.faction;
  p1.faction = p2.faction;
  p2.faction = tempFaction;
  const tempColor = p1.color;
  p1.color = p2.color;
  p2.color = tempColor;
  state.log.push('Fazioni scambiate');
  state.lastUpdate = new Date();
}

// ─── Set Starting City ───────────────────────────────────────

export function setStartingCity(state: GameState, playerId: string, city: CityName): void {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Giocatore non trovato');
  if (!(CITY_NAMES as readonly string[]).includes(city)) throw new Error('Città non valida');

  // Check no other player has this city
  if (state.players.some((p) => p.startingCity === city && p.id !== playerId)) {
    throw new Error('Città già scelta da un altro giocatore');
  }

  player.startingCity = city;
  state.log.push(`${player.faction} ha scelto ${city} come città di partenza`);
  state.lastUpdate = new Date();
}

// ─── Start Game ──────────────────────────────────────────────

export function startGame(state: GameState): void {
  if (state.players.length !== 2) throw new Error('Servono 2 giocatori');
  if (!state.players.every((p) => p.startingCity)) {
    throw new Error('Tutti i giocatori devono scegliere una città di partenza');
  }

  state.status = 'draft';
  state.round = 1;
  state.log.push('Partita iniziata!');

  // Start first draft
  startDraft(state);
  state.lastUpdate = new Date();
}

// ─── Serialization ───────────────────────────────────────────

export function toSpectatorData(state: GameState) {
  return {
    id: state.id,
    status: state.status,
    phase: state.phase,
    round: state.round,
    timeMarker: state.timeMarker,
    italyControl: state.italyControl,
    activePlayerId: state.activePlayerId,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      faction: p.faction,
      color: p.color,
      handSize: p.hand.length,
      citiesControlled: [...p.citiesControlled],
      isReady: p.isReady,
    })),
    cities: state.cities.map((c) => ({ ...c, units: c.units.map((u) => ({ ...u })) })),
    activeConflicts: state.activeConflicts.map((c) => ({ ...c })),
    draftState: { step: state.draftState.step },
    turnState: { ...state.turnState },
    setupRound1Complete: state.setupRound1Complete,
    deckSize: state.deck.length,
    discardsSize: state.discards.length,
    winner: state.winner,
    log: [...state.log],
    lastUpdate: state.lastUpdate,
  };
}

export function toPlayerData(state: GameState, playerId: string) {
  const player = state.players.find((p) => p.id === playerId);
  const opponent = state.players.find((p) => p.id !== playerId);

  return {
    id: state.id,
    name: state.name,
    status: state.status,
    phase: state.phase,
    round: state.round,
    timeMarker: state.timeMarker,
    italyControl: state.italyControl,
    activePlayerId: state.activePlayerId,
    player: player
      ? {
          ...player,
          hand: [...player.hand],
          reserve: { ...player.reserve },
          available: { ...player.available },
          citiesControlled: [...player.citiesControlled],
        }
      : null,
    opponent: opponent
      ? {
          id: opponent.id,
          name: opponent.name,
          faction: opponent.faction,
          color: opponent.color,
          handSize: opponent.hand.length,
          citiesControlled: [...opponent.citiesControlled],
          isReady: opponent.isReady,
        }
      : null,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      faction: p.faction,
      color: p.color,
      isReady: p.isReady,
    })),
    cities: state.cities.map((c) => ({ ...c, units: c.units.map((u) => ({ ...u })) })),
    activeConflicts: state.activeConflicts.map((c) => ({ ...c })),
    draftState: {
      step: state.draftState.step,
      drawnCards: state.draftState.drawnCards[playerId] ?? [],
    },
    turnState: { ...state.turnState },
    setupRound1Complete: state.setupRound1Complete,
    deckSize: state.deck.length,
    discardsSize: state.discards.length,
    winner: state.winner,
    log: [...state.log],
    lastUpdate: state.lastUpdate,
  };
}

export function toJSON(state: GameState) {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      reserve: { ...p.reserve },
      available: { ...p.available },
      citiesControlled: [...p.citiesControlled],
    })),
    deck: [...state.deck],
    discards: [...state.discards],
    cities: state.cities.map((c) => ({ ...c, units: c.units.map((u) => ({ ...u })) })),
    activeConflicts: state.activeConflicts.map((c) => ({ ...c })),
    draftState: { ...state.draftState },
    turnState: { ...state.turnState },
    log: [...state.log],
  };
}

// Re-export action functions for convenience
export {
  playCard,
  deployUnits,
  endTurn,
  executeSetupRound1,
  chooseBonusUnits,
  endRound,
};
