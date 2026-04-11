import { describe, it, expect } from 'vitest';
import {
  getConnections,
  isSpecialCity,
  isPlayableCity,
  getCityPosition,
  initializeCities,
  areAdjacent,
  ADJACENCY,
  CITY_POSITIONS,
} from '../src/cities';

describe('cities', () => {
  it('adjacency graph has 17 entries (15 + Roma + Germania)', () => {
    expect(Object.keys(ADJACENCY)).toHaveLength(17);
  });

  it('adjacency is symmetric for playable cities', () => {
    for (const [city, neighbors] of Object.entries(ADJACENCY)) {
      for (const n of neighbors) {
        expect(ADJACENCY[n as keyof typeof ADJACENCY]).toContain(city);
      }
    }
  });

  it('Roma connects Firenze and Ancona', () => {
    expect(getConnections('Roma')).toEqual(expect.arrayContaining(['Firenze', 'Ancona']));
  });

  it('Germania connects Bergamo and Trento', () => {
    expect(getConnections('Germania')).toEqual(expect.arrayContaining(['Bergamo', 'Trento']));
  });

  it('isSpecialCity returns true for Roma and Germania', () => {
    expect(isSpecialCity('Roma')).toBe(true);
    expect(isSpecialCity('Germania')).toBe(true);
    expect(isSpecialCity('Milano')).toBe(false);
  });

  it('isPlayableCity returns true for all 15 cities', () => {
    expect(isPlayableCity('Milano')).toBe(true);
    expect(isPlayableCity('Trento')).toBe(true);
    expect(isPlayableCity('Roma')).toBe(false);
  });

  it('all 15 playable cities have positions', () => {
    expect(Object.keys(CITY_POSITIONS)).toHaveLength(15);
  });

  it('city positions are percentages (0-100)', () => {
    for (const pos of Object.values(CITY_POSITIONS)) {
      expect(pos.top).toBeGreaterThanOrEqual(0);
      expect(pos.top).toBeLessThanOrEqual(100);
      expect(pos.left).toBeGreaterThanOrEqual(0);
      expect(pos.left).toBeLessThanOrEqual(100);
    }
  });

  it('initializeCities creates 15 neutral cities', () => {
    const cities = initializeCities();
    expect(cities).toHaveLength(15);
    cities.forEach((c) => {
      expect(c.controlledBy).toBeNull();
      expect(c.units).toEqual([]);
    });
  });

  it('areAdjacent works correctly', () => {
    expect(areAdjacent('Milano', 'Asti')).toBe(true);
    expect(areAdjacent('Milano', 'Venezia')).toBe(false);
    expect(areAdjacent('Firenze', 'Roma')).toBe(true);
  });

  it('Verona connects to Modena, Trento, Bologna, Padova', () => {
    const conn = getConnections('Verona');
    expect(conn).toContain('Modena');
    expect(conn).toContain('Trento');
    expect(conn).toContain('Bologna');
    expect(conn).toContain('Padova');
  });
});
