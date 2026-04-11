import { describe, it, expect } from 'vitest';
import { createGame, addPlayer, setStartingCity, startGame } from '../src/game';
import { chooseDraftCards } from '../src/draft';
import type { GameState } from '../src/types';

function setupGameForDraft(): GameState {
  const g = createGame('test-1', 'Test Draft');
  addPlayer(g, 'p1', 'Player1', 'Barbarossa');
  addPlayer(g, 'p2', 'Player2', 'Lega');
  setStartingCity(g, 'p1', 'Milano');
  setStartingCity(g, 'p2', 'Venezia');
  startGame(g);
  return g;
}

describe('draft', () => {
  it('startGame triggers draft phase', () => {
    const g = setupGameForDraft();
    expect(g.status).toBe('draft');
    expect(g.phase).toBe(1);
    expect(g.draftState.step).toBe(1);
  });

  it('step 1: each player receives 2 drawn cards', () => {
    const g = setupGameForDraft();
    expect(g.draftState.drawnCards['p1']).toHaveLength(2);
    expect(g.draftState.drawnCards['p2']).toHaveLength(2);
  });

  it('step 1: keep 1, pass 1', () => {
    const g = setupGameForDraft();
    const p1Cards = g.draftState.drawnCards['p1'];
    const p2Cards = g.draftState.drawnCards['p2'];

    chooseDraftCards(g, 'p1', [p1Cards[0]], [p1Cards[1]]);
    expect(g.draftState.step).toBe(1); // still step 1, waiting for p2

    chooseDraftCards(g, 'p2', [p2Cards[0]], [p2Cards[1]]);
    // After both choose, advances to step 2
    expect(g.draftState.step).toBe(2);
  });

  it('refuses wrong number of cards in step 1', () => {
    const g = setupGameForDraft();
    const p1Cards = g.draftState.drawnCards['p1'];

    expect(() => chooseDraftCards(g, 'p1', p1Cards, [])).toThrow();
  });

  it('full draft results in correct hand sizes', () => {
    const g = setupGameForDraft();

    // Step 1
    const p1Step1 = g.draftState.drawnCards['p1'];
    const p2Step1 = g.draftState.drawnCards['p2'];
    chooseDraftCards(g, 'p1', [p1Step1[0]], [p1Step1[1]]);
    chooseDraftCards(g, 'p2', [p2Step1[0]], [p2Step1[1]]);

    // Step 2
    expect(g.draftState.step).toBe(2);
    const p1Step2 = g.draftState.drawnCards['p1'];
    const p2Step2 = g.draftState.drawnCards['p2'];
    expect(p1Step2).toHaveLength(3);
    expect(p2Step2).toHaveLength(3);

    chooseDraftCards(g, 'p1', [p1Step2[0]], [p1Step2[1], p1Step2[2]]);
    chooseDraftCards(g, 'p2', [p2Step2[0]], [p2Step2[1], p2Step2[2]]);

    // Each player: kept 1 from step1 + received 1 passed from opponent in step1
    // + kept 1 from step2 + received 2 passed from opponent in step2 = 5 cards
    const p1 = g.players.find((p) => p.id === 'p1')!;
    const p2 = g.players.find((p) => p.id === 'p2')!;
    // In round 1, need setup before actions
    expect(p1.hand.length + p2.hand.length).toBe(10);
    expect(p1.hand).toHaveLength(5);
    expect(p2.hand).toHaveLength(5);
  });

  it('throws if player already chose', () => {
    const g = setupGameForDraft();
    const p1Cards = g.draftState.drawnCards['p1'];
    chooseDraftCards(g, 'p1', [p1Cards[0]], [p1Cards[1]]);
    expect(() => chooseDraftCards(g, 'p1', [p1Cards[0]], [p1Cards[1]])).toThrow('già fatto');
  });
});
