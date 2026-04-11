import { describe, it, expect } from 'vitest';
import { has6ConnectedCities, updateItalyControl } from '../src/victory';
import { createGame, addPlayer, setStartingCity } from '../src/game';
import { changeCityControl } from '../src/resolution';
import type { GameState } from '../src/types';

function setupState(): GameState {
  const g = createGame('test-vic');
  addPlayer(g, 'p1', 'Barb', 'Barbarossa');
  addPlayer(g, 'p2', 'Leg', 'Lega');
  setStartingCity(g, 'p1', 'Milano');
  setStartingCity(g, 'p2', 'Venezia');
  return g;
}

describe('victory', () => {
  it('has6ConnectedCities returns false with <6 cities', () => {
    const g = setupState();
    const barb = g.players.find((p) => p.faction === 'Barbarossa')!;
    // Give Barbarossa 5 connected cities
    for (const city of ['Milano', 'Asti', 'Lodi', 'Modena', 'Bergamo']) {
      const c = g.cities.find((ci) => ci.name === city)!;
      changeCityControl(g, c, 'Barbarossa');
    }
    expect(barb.citiesControlled).toHaveLength(5);
    expect(has6ConnectedCities(g, 'Barbarossa')).toBe(false);
  });

  it('has6ConnectedCities returns true with 6 connected cities', () => {
    const g = setupState();
    // Milano → Asti, Lodi, Bergamo, Modena → Verona
    // Milano-Asti, Milano-Lodi, Milano-Bergamo, Milano-Modena, Modena-Verona, Verona-Bologna
    // Wait: Verona connects to Modena,Trento,Bologna,Padova
    // So: Milano, Asti, Lodi, Bergamo, Modena, Verona are all connected
    for (const city of ['Milano', 'Asti', 'Lodi', 'Bergamo', 'Modena', 'Verona']) {
      const c = g.cities.find((ci) => ci.name === city)!;
      changeCityControl(g, c, 'Barbarossa');
    }
    expect(has6ConnectedCities(g, 'Barbarossa')).toBe(true);
  });

  it('6 cities not connected returns false', () => {
    const g = setupState();
    // Give 6 disconnected cities (these form two separate components)
    // Milano area: Milano, Asti, Lodi (3)
    // Far east: Venezia, Ferrara, Ravenna (3) — connected but separate from Milano
    for (const city of ['Milano', 'Asti', 'Lodi', 'Venezia', 'Ferrara', 'Ravenna']) {
      const c = g.cities.find((ci) => ci.name === city)!;
      changeCityControl(g, c, 'Lega');
    }
    // Milano cluster only has 3, Venezia cluster only has 3
    expect(has6ConnectedCities(g, 'Lega')).toBe(false);
  });

  it('special cities act as bridges', () => {
    const g = setupState();
    // Connected through Roma: Firenze-Roma-Ancona
    // Firenze, Pisa (via Firenze), Bologna (via Firenze), Ravenna (via Bologna), Ancona (via Roma), + one more through Ravenna-Ferrara
    for (const city of ['Firenze', 'Pisa', 'Bologna', 'Ravenna', 'Ancona', 'Ferrara']) {
      const c = g.cities.find((ci) => ci.name === city)!;
      changeCityControl(g, c, 'Lega');
    }
    // Firenze→Bologna→Ravenna→Ferrara (4 connected)
    // Firenze→Pisa (2+4=5 if Pisa reachable from Firenze — yes it is)
    // Firenze→Roma→Ancona: Roma is special, Ancona via Roma
    // So: Firenze-Pisa-Bologna-Ravenna-Ancona(via Roma)-Ferrara = 6 connected through Roma
    expect(has6ConnectedCities(g, 'Lega')).toBe(true);
  });

  it('updateItalyControl adjusts based on city difference', () => {
    const g = setupState();
    const barb = g.players.find((p) => p.faction === 'Barbarossa')!;
    barb.citiesControlled = ['Milano', 'Asti', 'Lodi'];
    const lega = g.players.find((p) => p.faction === 'Lega')!;
    lega.citiesControlled = ['Venezia'];

    g.italyControl = 0;
    updateItalyControl(g);
    expect(g.italyControl).toBe(2); // 3 - 1 = +2
  });

  it('victory at italyControl ±5', () => {
    const g = setupState();
    g.italyControl = 4;
    const barb = g.players.find((p) => p.faction === 'Barbarossa')!;
    barb.citiesControlled = ['Milano', 'Asti'];
    const lega = g.players.find((p) => p.faction === 'Lega')!;
    lega.citiesControlled = ['Venezia'];
    // updateItalyControl adds diff = 2 - 1 = 1 → italyControl = 5
    updateItalyControl(g);
    expect(g.italyControl).toBe(5);
  });
});
