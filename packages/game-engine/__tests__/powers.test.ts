import { describe, it, expect } from 'vitest';
import { executePower } from '../src/powers';
import type { GameState, PlayerState } from '../src/types';

function mockState(): GameState {
  return {
    log: [],
  } as unknown as GameState;
}

function mockPlayer(faction: string = 'Lega'): PlayerState {
  return { faction } as unknown as PlayerState;
}

describe('powers', () => {
  it('executePower logs for capitale_lega', () => {
    const s = mockState();
    executePower(s, mockPlayer(), 'Milano', {});
    expect(s.log).toHaveLength(1);
    expect(s.log[0]).toContain('Capitale della Lega');
  });

  it('executePower logs for sede_vescovile', () => {
    const s = mockState();
    executePower(s, mockPlayer(), 'Asti', {});
    expect(s.log[0]).toContain('Sede Vescovile');
  });

  it('executePower logs for all 11 powered cities', () => {
    const powered: Array<[string, string]> = [
      ['Milano', 'Capitale'],
      ['Asti', 'Sede Vescovile'],
      ['Ferrara', 'Mercato'],
      ['Firenze', 'Fortezza'],
      ['Pisa', 'Porto Navale'],
      ['Verona', 'Crocevia'],
      ['Venezia', 'Potenza Navale'],
      ['Padova', 'Università'],
      ['Ravenna', 'Via Commerciale'],
      ['Bologna', 'Diritto Canonico'],
      ['Trento', 'Controllo Imperiale'],
    ];

    for (const [city, keyword] of powered) {
      const s = mockState();
      executePower(s, mockPlayer(), city as any, {});
      expect(s.log).toHaveLength(1);
      expect(s.log[0]).toContain(keyword);
    }
  });

  it('throws for city without power', () => {
    const s = mockState();
    expect(() => executePower(s, mockPlayer(), 'Bergamo', {})).toThrow('non ha un potere speciale');
    expect(() => executePower(s, mockPlayer(), 'Lodi', {})).toThrow('non ha un potere speciale');
    expect(() => executePower(s, mockPlayer(), 'Modena', {})).toThrow('non ha un potere speciale');
    expect(() => executePower(s, mockPlayer(), 'Ancona', {})).toThrow('non ha un potere speciale');
  });
});
