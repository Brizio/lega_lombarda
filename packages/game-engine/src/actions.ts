import type { GameState, CityName, PlayerState, UnitType, CardAction, UnitCounts } from './types';
import { UNIT_TYPES } from './types';
import { getCard, getRecruitment } from './cards';
import { recruit, consumeAvailable, removeCard, hasUnitsInReserve } from './player';
import { executePower } from './powers';
import { resetTurnState } from './draft';

// ─── Setup Round 1 ───────────────────────────────────────────

/**
 * After the first draft, each player places 1 unit of their choice
 * in their starting city.
 */
export function executeSetupRound1(
  state: GameState,
  playerId: string,
  unitType: UnitType,
): void {
  if (state.setupRound1Complete) throw new Error('Setup round 1 già completato');

  const player = getPlayer(state, playerId);
  if (!Object.values(UNIT_TYPES).includes(unitType)) throw new Error('Tipo unità non valido');
  if (!hasUnitsInReserve(player, unitType, 1)) throw new Error('Non hai questa unità in riserva');

  // Place 1 unit in starting city
  player.reserve[unitType] -= 1;
  const city = getCity(state, player.startingCity!);
  addUnitToCity(city, player.faction, unitType, 1);
  player.turnCompleted = true;

  // When both have placed, complete setup
  if (state.players.every((p) => p.turnCompleted)) {
    state.setupRound1Complete = true;
    state.players.forEach((p) => (p.turnCompleted = false));

    // Advance to Phase 2
    state.phase = 2;
    state.status = 'playing';
    const adv = state.players.find((p) =>
      state.italyControl >= 0 ? p.faction === 'Barbarossa' : p.faction === 'Lega',
    ) ?? state.players[0];
    state.activePlayerId = adv.id;
    resetTurnState(state);
    state.log.push('Setup round 1 completato. Fase azioni iniziata.');
  }
  state.lastUpdate = new Date();
}

/**
 * Choose bonus units for round 1.
 * Barbarossa picks 2 units, Lega picks 1 (reserve → available).
 */
export function chooseBonusUnits(
  state: GameState,
  playerId: string,
  units: Partial<UnitCounts>,
): void {
  const player = getPlayer(state, playerId);
  const max = player.faction === 'Barbarossa' ? 2 : 1;

  let total = 0;
  for (const type of Object.values(UNIT_TYPES)) {
    total += units[type] ?? 0;
  }
  if (total !== max) throw new Error(`Devi scegliere esattamente ${max} unità`);

  for (const type of Object.values(UNIT_TYPES)) {
    const qty = units[type] ?? 0;
    if (qty > 0) recruit(player, type, qty);
  }

  state.log.push(`${player.faction} ha ricevuto ${max} unità bonus`);
  state.lastUpdate = new Date();
}

// ─── Play Card ───────────────────────────────────────────────

export function playCard(
  state: GameState,
  playerId: string,
  cardName: CityName,
  action: CardAction,
  details: Record<string, unknown> = {},
): void {
  const player = getPlayer(state, playerId);
  if (state.phase !== 2) throw new Error('Non è la fase di gioco delle carte');
  if (state.activePlayerId !== playerId) throw new Error('Non è il tuo turno');
  if (state.turnState.cardPlayed) throw new Error('Hai già giocato una carta in questo turno');
  if (!player.hand.includes(cardName)) throw new Error('Non hai questa carta in mano');

  const card = getCard(cardName);

  switch (action) {
    case 'conflitto':
      executeConflict(state, player, card.name);
      break;
    case 'recluta':
      executeRecruitment(state, player, card.name);
      break;
    case 'potere':
      executePower(state, player, card.name, details);
      break;
    default:
      throw new Error('Azione non valida. Usa: conflitto, recluta, potere');
  }

  removeCard(player, cardName);

  // Conflict card stays in play (not discarded until resolution)
  if (action !== 'conflitto') {
    state.discards.push(cardName);
  }

  state.turnState.cardPlayed = true;
  state.log.push(`${player.faction} ha giocato ${cardName} per ${action}`);
  state.lastUpdate = new Date();
}

// ─── Conflict Action ─────────────────────────────────────────

function executeConflict(state: GameState, _player: PlayerState, cityName: CityName): void {
  if (state.activeConflicts.some((c) => c.city === cityName && !c.resolved)) {
    throw new Error(`C'è già un conflitto aperto per ${cityName}`);
  }

  state.conflictOrder++;
  state.activeConflicts.push({
    city: cityName,
    order: state.conflictOrder,
    typeConstraint: null,
    deployments: {},
    resolved: false,
  });

  state.log.push(`Zona di conflitto aperta: ${cityName}`);
}

// ─── Recruitment Action ──────────────────────────────────────

function executeRecruitment(state: GameState, player: PlayerState, cityName: CityName): void {
  const city = state.cities.find((c) => c.name === cityName);
  const controlled = city?.controlledBy === player.faction;
  const recruitment = getRecruitment(cityName, controlled);

  for (const type of Object.values(UNIT_TYPES)) {
    const qty = recruitment[type] ?? 0;
    if (qty > 0) {
      const effective = Math.min(qty, player.reserve[type]);
      if (effective > 0) recruit(player, type, effective);
    }
  }
}

// ─── Deploy Units ────────────────────────────────────────────

export function deployUnits(
  state: GameState,
  playerId: string,
  conflictCity: CityName,
  unitType: UnitType,
  quantity: number,
): void {
  const player = getPlayer(state, playerId);
  if (state.phase !== 2) throw new Error('Non è la fase di azioni');
  if (state.activePlayerId !== playerId) throw new Error('Non è il tuo turno');
  if (!state.turnState.cardPlayed) throw new Error('Devi prima giocare una carta');
  if (state.turnState.deploymentDone) throw new Error('Hai già schierato unità in questo turno');
  if (!Object.values(UNIT_TYPES).includes(unitType)) throw new Error('Tipo unità non valido');

  const conflict = state.activeConflicts.find((c) => c.city === conflictCity && !c.resolved);
  if (!conflict) throw new Error(`Nessun conflitto aperto per ${conflictCity}`);

  // Type constraint check
  if (conflict.typeConstraint && conflict.typeConstraint !== unitType) {
    throw new Error(`Il conflitto è vincolato al tipo ${conflict.typeConstraint}`);
  }

  if (player.available[unitType] < quantity) {
    throw new Error(`Non hai abbastanza ${unitType} disponibili`);
  }

  consumeAvailable(player, unitType, quantity);

  if (!conflict.deployments[player.faction]) {
    conflict.deployments[player.faction] = [];
  }

  const existing = conflict.deployments[player.faction]!.find((s) => s.type === unitType);
  if (existing) {
    existing.quantity += quantity;
  } else {
    conflict.deployments[player.faction]!.push({ type: unitType, quantity });
  }

  // Lock type constraint on first deployment
  if (!conflict.typeConstraint) {
    conflict.typeConstraint = unitType;
  }

  state.turnState.deploymentDone = true;
  state.log.push(
    `${player.faction} ha schierato ${quantity} ${unitType} nel conflitto di ${conflictCity}`,
  );
  state.lastUpdate = new Date();
}

// ─── End Turn ────────────────────────────────────────────────

export function endTurn(state: GameState, playerId: string): void {
  const player = getPlayer(state, playerId);
  if (state.phase !== 2) throw new Error('Non è la fase di azioni');
  if (state.activePlayerId !== playerId) throw new Error('Non è il tuo turno');
  if (!state.turnState.cardPlayed) throw new Error('Devi giocare una carta prima di terminare il turno');

  player.turnCompleted = true;
  passTurn(state);
  state.lastUpdate = new Date();
}

export function passTurn(state: GameState): void {
  resetTurnState(state);

  // Check if all players are out of cards
  if (state.players.every((p) => p.hand.length === 0)) {
    advancePhase(state);
    return;
  }

  const activeIdx = state.players.findIndex((p) => p.id === state.activePlayerId);
  const nextIdx = (activeIdx + 1) % state.players.length;
  const next = state.players[nextIdx];

  if (next.hand.length === 0) {
    // Opponent has no cards, current player continues
    const current = state.players[activeIdx];
    if (current.hand.length > 0) return;
    advancePhase(state);
    return;
  }

  state.activePlayerId = next.id;
}

function advancePhase(state: GameState): void {
  if (state.phase === 2) {
    state.phase = 3;
    // Resolution is triggered from game.ts
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function getPlayer(state: GameState, id: string): PlayerState {
  const p = state.players.find((pl) => pl.id === id);
  if (!p) throw new Error('Giocatore non trovato');
  return p;
}

function getCity(state: GameState, name: CityName) {
  const c = state.cities.find((ci) => ci.name === name);
  if (!c) throw new Error(`Città non trovata: ${name}`);
  return c;
}

export function addUnitToCity(
  city: { units: { faction: string; type: string; quantity: number }[] },
  faction: string,
  type: string,
  quantity: number,
): void {
  const group = city.units.find((u) => u.faction === faction && u.type === type);
  if (group) {
    group.quantity += quantity;
  } else {
    city.units.push({ faction, type, quantity });
  }
}
