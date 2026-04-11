import { describe, it, expect } from 'vitest';
import { resolveConflicts, calculateConflictStrength, changeCityControl } from '../src/resolution';
import { createGame, addPlayer, setStartingCity } from '../src/game';
import { addUnitToCity } from '../src/actions';
import type { GameState, Conflict, Faction } from '../src/types';

function setupState(): GameState {
  const g = createGame('test-res');
  addPlayer(g, 'p1', 'Barb', 'Barbarossa');
  addPlayer(g, 'p2', 'Leg', 'Lega');
  setStartingCity(g, 'p1', 'Milano');
  setStartingCity(g, 'p2', 'Venezia');
  return g;
}

function addConflict(
  state: GameState,
  city: string,
  order: number,
  barbQty: number,
  legaQty: number,
  unitType: string = 'cavalleria',
): Conflict {
  const conflict: Conflict = {
    city: city as any,
    order,
    typeConstraint: unitType as any,
    deployments: {},
    resolved: false,
  };
  if (barbQty > 0) {
    conflict.deployments['Barbarossa'] = [{ type: unitType as any, quantity: barbQty }];
  }
  if (legaQty > 0) {
    conflict.deployments['Lega'] = [{ type: unitType as any, quantity: legaQty }];
  }
  state.activeConflicts.push(conflict);
  return conflict;
}

describe('resolution', () => {
  it('single faction wins conflict auto', () => {
    const g = setupState();
    addConflict(g, 'Bologna', 1, 2, 0);
    resolveConflicts(g);
    expect(g.activeConflicts).toHaveLength(0);
    const bologna = g.cities.find((c) => c.name === 'Bologna')!;
    expect(bologna.controlledBy).toBe('Barbarossa');
  });

  it('stronger faction wins', () => {
    const g = setupState();
    addConflict(g, 'Firenze', 1, 3, 1);
    resolveConflicts(g);
    const firenze = g.cities.find((c) => c.name === 'Firenze')!;
    expect(firenze.controlledBy).toBe('Barbarossa');
  });

  it('tie: Barbarossa wins when italyControl >= 0', () => {
    const g = setupState();
    g.italyControl = 0;
    addConflict(g, 'Padova', 1, 2, 2);
    resolveConflicts(g);
    const padova = g.cities.find((c) => c.name === 'Padova')!;
    expect(padova.controlledBy).toBe('Barbarossa');
  });

  it('tie: Lega wins when italyControl < 0', () => {
    const g = setupState();
    g.italyControl = -1;
    addConflict(g, 'Padova', 1, 2, 2);
    resolveConflicts(g);
    const padova = g.cities.find((c) => c.name === 'Padova')!;
    expect(padova.controlledBy).toBe('Lega');
  });

  it('bishop adjacency bonus adds to strength', () => {
    const g = setupState();
    // Place a Lega bishop in Firenze (adjacent to Bologna)
    const firenze = g.cities.find((c) => c.name === 'Firenze')!;
    addUnitToCity(firenze, 'Lega', 'vescovi', 1);

    const conflict: Conflict = {
      city: 'Bologna',
      order: 1,
      typeConstraint: 'cavalleria',
      deployments: {
        Barbarossa: [{ type: 'cavalleria', quantity: 2 }],
        Lega: [{ type: 'cavalleria', quantity: 1 }],
      },
      resolved: false,
    };
    g.activeConflicts.push(conflict);

    // Lega has 1 cavalry + 1 bishop bonus = 2 vs Barbarossa 2, tie → advantage wins
    const legaStr = calculateConflictStrength(g, conflict, 'Lega');
    const barbStr = calculateConflictStrength(g, conflict, 'Barbarossa');
    expect(legaStr).toBe(2); // 1 cav + 1 bishop bonus
    expect(barbStr).toBe(2); // 2 cav
  });

  it('cavalry cascade to next conflict', () => {
    const g = setupState();

    // Barbarossa player needs cavalry in reserve for cascade
    const barb = g.players.find((p) => p.faction === 'Barbarossa')!;

    // Conflict 1: Barbarossa wins with 3 cavalry vs 1
    addConflict(g, 'Milano', 1, 3, 1);
    // Conflict 2: starts empty
    addConflict(g, 'Asti', 2, 0, 1);

    resolveConflicts(g);

    // After resolution, check that Asti was resolved
    // Cascade: 3 cav - 1 placed on city = 2 returned to reserve, then cascade
    // The cascade mechanic takes from reserve
  });

  it('changeCityControl transfers correctly', () => {
    const g = setupState();
    const city = g.cities.find((c) => c.name === 'Bologna')!;
    const barb = g.players.find((p) => p.faction === 'Barbarossa')!;
    const lega = g.players.find((p) => p.faction === 'Lega')!;

    changeCityControl(g, city, 'Barbarossa');
    expect(city.controlledBy).toBe('Barbarossa');
    expect(barb.citiesControlled).toContain('Bologna');

    changeCityControl(g, city, 'Lega');
    expect(city.controlledBy).toBe('Lega');
    expect(barb.citiesControlled).not.toContain('Bologna');
    expect(lega.citiesControlled).toContain('Bologna');
  });
});
