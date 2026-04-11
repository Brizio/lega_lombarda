import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, addPlayer, setStartingCity, startGame, playCard, deployUnits, endTurn, executeSetupRound1 } from '../src/game';
import { chooseDraftCards } from '../src/draft';
import { recruit } from '../src/player';
import type { GameState } from '../src/types';

function completeDraft(g: GameState): void {
  // Step 1
  const p1s1 = g.draftState.drawnCards['p1'];
  const p2s1 = g.draftState.drawnCards['p2'];
  chooseDraftCards(g, 'p1', [p1s1[0]], [p1s1[1]]);
  chooseDraftCards(g, 'p2', [p2s1[0]], [p2s1[1]]);

  // Step 2
  const p1s2 = g.draftState.drawnCards['p1'];
  const p2s2 = g.draftState.drawnCards['p2'];
  chooseDraftCards(g, 'p1', [p1s2[0]], [p1s2[1], p1s2[2]]);
  chooseDraftCards(g, 'p2', [p2s2[0]], [p2s2[1], p2s2[2]]);
}

function setupToActions(g: GameState): void {
  completeDraft(g);
  // Setup round 1: place 1 unit each
  executeSetupRound1(g, 'p1', 'cavalleria');
  executeSetupRound1(g, 'p2', 'cavalleria');
}

function createTestGame(): GameState {
  const g = createGame('test-actions', 'Actions Test');
  addPlayer(g, 'p1', 'Barb', 'Barbarossa');
  addPlayer(g, 'p2', 'Lega', 'Lega');
  setStartingCity(g, 'p1', 'Milano');
  setStartingCity(g, 'p2', 'Venezia');
  startGame(g);
  return g;
}

describe('actions', () => {
  let g: GameState;

  beforeEach(() => {
    g = createTestGame();
    setupToActions(g);
  });

  it('after setup, game is in phase 2 (actions)', () => {
    expect(g.phase).toBe(2);
    expect(g.status).toBe('playing');
    expect(g.activePlayerId).toBeTruthy();
  });

  it('active player can play a card as conflitto', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    const card = active.hand[0];
    playCard(g, active.id, card, 'conflitto');
    expect(g.activeConflicts).toHaveLength(1);
    expect(g.activeConflicts[0].city).toBe(card);
    expect(g.turnState.cardPlayed).toBe(true);
  });

  it('active player can play a card as recluta', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    const card = active.hand[0];
    const reserveBefore = { ...active.reserve };
    playCard(g, active.id, card, 'recluta');
    // Recruitment should have moved units from reserve to available
    expect(g.turnState.cardPlayed).toBe(true);
  });

  it('non-active player cannot play a card', () => {
    const inactive = g.players.find((p) => p.id !== g.activePlayerId)!;
    if (inactive.hand.length > 0) {
      expect(() => playCard(g, inactive.id, inactive.hand[0], 'conflitto')).toThrow('Non è il tuo turno');
    }
  });

  it('cannot play two cards in one turn', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    playCard(g, active.id, active.hand[0], 'conflitto');
    if (active.hand.length > 0) {
      expect(() => playCard(g, active.id, active.hand[0], 'recluta')).toThrow('già giocato');
    }
  });

  it('deploy units to a conflict', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    // Recruit some units first
    recruit(active, 'cavalleria', 2);

    playCard(g, active.id, active.hand[0], 'conflitto');
    const conflictCity = g.activeConflicts[0].city;

    deployUnits(g, active.id, conflictCity, 'cavalleria', 1);
    expect(g.turnState.deploymentDone).toBe(true);
    expect(g.activeConflicts[0].deployments[active.faction]).toBeDefined();
  });

  it('cannot deploy without playing a card first', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    expect(() => deployUnits(g, active.id, 'Milano', 'cavalleria', 1)).toThrow('Devi prima giocare');
  });

  it('endTurn passes to the other player', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    playCard(g, active.id, active.hand[0], 'conflitto');
    const prevActiveId = g.activePlayerId;
    endTurn(g, active.id);
    expect(g.activePlayerId).not.toBe(prevActiveId);
  });

  it('cannot end turn without playing a card', () => {
    const active = g.players.find((p) => p.id === g.activePlayerId)!;
    expect(() => endTurn(g, active.id)).toThrow('Devi giocare una carta');
  });
});
