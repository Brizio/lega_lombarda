import type { GameState, CityName, PlayerState } from './types';
import { addCard } from './player';

/**
 * Start draft phase: set phase=1, status=draft.
 * Step 1: draw 2 cards per player, each keeps 1 passes 1.
 * Step 2: draw 3 cards per player, each keeps 1 passes 2.
 */
export function startDraft(state: GameState): void {
  state.phase = 1;
  state.status = 'draft';
  state.draftState = {
    step: 1,
    drawnCards: {},
    choices: {},
  };

  // Step 1: draw 2 cards per player
  for (const player of state.players) {
    state.draftState.drawnCards[player.id] = [];
    for (let i = 0; i < 2; i++) {
      const card = drawCard(state);
      if (card) state.draftState.drawnCards[player.id].push(card);
    }
  }

  state.players.forEach((p) => (p.turnCompleted = false));
  state.log.push(`Draft round ${state.round}: pesca 2 carte`);
}

/**
 * Player makes their draft choice.
 * Step 1: keep 1, pass 1
 * Step 2: keep 1, pass 2
 */
export function chooseDraftCards(
  state: GameState,
  playerId: string,
  kept: CityName[],
  passed: CityName[],
): void {
  const player = getPlayer(state, playerId);
  if (state.phase !== 1) throw new Error('Non è la fase di draft');
  if (player.turnCompleted) throw new Error('Hai già fatto la tua scelta');

  const step = state.draftState.step;
  const drawn = state.draftState.drawnCards[playerId];
  if (!drawn) throw new Error('Nessuna carta pescata per questo step');

  // Validate all chosen cards match drawn cards
  const allChosen = [...kept, ...passed];
  if (allChosen.length !== drawn.length) {
    throw new Error(`Devi selezionare tutte le ${drawn.length} carte`);
  }
  for (const c of allChosen) {
    if (!drawn.includes(c)) throw new Error(`Carta ${c} non è tra quelle pescate`);
  }

  // Validate counts per step
  if (step === 1) {
    if (kept.length !== 1 || passed.length !== 1) {
      throw new Error('Step 1: devi tenere 1 carta e passarne 1');
    }
  } else if (step === 2) {
    if (kept.length !== 1 || passed.length !== 2) {
      throw new Error('Step 2: devi tenere 1 carta e passarne 2');
    }
  }

  state.draftState.choices[playerId] = { kept, passed };
  player.turnCompleted = true;

  // When both have chosen, execute the swap
  if (state.players.every((p) => p.turnCompleted)) {
    executeDraftSwap(state);
  }
}

function executeDraftSwap(state: GameState): void {
  const [p1, p2] = state.players;
  const choice1 = state.draftState.choices[p1.id];
  const choice2 = state.draftState.choices[p2.id];

  // Each player keeps their cards + receives opponent's passed cards
  for (const c of choice1.kept) addCard(p1, c);
  for (const c of choice2.passed) addCard(p1, c);
  for (const c of choice2.kept) addCard(p2, c);
  for (const c of choice1.passed) addCard(p2, c);

  state.players.forEach((p) => (p.turnCompleted = false));

  if (state.draftState.step === 1) {
    // Advance to step 2: draw 3 cards per player
    state.draftState.step = 2;
    state.draftState.drawnCards = {};
    state.draftState.choices = {};

    for (const player of state.players) {
      state.draftState.drawnCards[player.id] = [];
      for (let i = 0; i < 3; i++) {
        const card = drawCard(state);
        if (card) state.draftState.drawnCards[player.id].push(card);
      }
    }

    state.log.push(`Draft round ${state.round}: pesca 3 carte`);
  } else {
    // Draft complete
    state.draftState.step = 0;
    state.draftState.drawnCards = {};
    state.draftState.choices = {};

    state.log.push(
      `Draft round ${state.round} completato. Ogni giocatore ha ${p1.hand.length} carte.`,
    );

    // Round 1: need setup (unit placement) before actions
    if (state.round === 1 && !state.setupRound1Complete) {
      state.log.push('Piazzare 1 unità nella città di partenza.');
      return;
    }

    // Advance to Phase 2 (Actions)
    startActionsPhase(state);
  }
}

export function startActionsPhase(state: GameState): void {
  state.phase = 2;
  state.status = 'playing';
  state.activePlayerId = getPlayerInAdvantage(state).id;
  resetTurnState(state);
  state.log.push('Fase azioni iniziata');
}

// ─── Helpers ─────────────────────────────────────────────────

function drawCard(state: GameState): CityName | null {
  if (state.deck.length === 0) reshuffleDeck(state);
  if (state.deck.length === 0) return null;
  return state.deck.pop()!;
}

function reshuffleDeck(state: GameState): void {
  state.deck = [...state.discards];
  state.discards = [];
  for (let i = state.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
  }
}

export function resetTurnState(state: GameState): void {
  state.turnState = { cardPlayed: false, deploymentDone: false };
  state.players.forEach((p) => (p.turnCompleted = false));
}

export function getPlayerInAdvantage(state: GameState): PlayerState {
  if (state.italyControl >= 0) {
    return state.players.find((p) => p.faction === 'Barbarossa') ?? state.players[0];
  }
  return state.players.find((p) => p.faction === 'Lega') ?? state.players[0];
}

function getPlayer(state: GameState, id: string): PlayerState {
  const p = state.players.find((pl) => pl.id === id);
  if (!p) throw new Error('Giocatore non trovato');
  return p;
}
