import { describe, it, expect } from 'vitest';
import {
  createPlayer,
  hasUnitsInReserve,
  hasAvailableUnits,
  recruit,
  consumeAvailable,
  returnToReserve,
  applyMerchantIncome,
  addCard,
  removeCard,
} from '../src/player';

describe('player', () => {
  it('creates Barbarossa with correct starting reserves', () => {
    const p = createPlayer('p1', 'Test', 'Barbarossa');
    expect(p.faction).toBe('Barbarossa');
    expect(p.color).toBe('Giallo');
    expect(p.reserve).toEqual({ cavalleria: 6, vescovi: 4, mercanti: 3 });
    expect(p.available).toEqual({ cavalleria: 0, vescovi: 0, mercanti: 0 });
    expect(p.hand).toEqual([]);
  });

  it('creates Lega with correct starting reserves', () => {
    const p = createPlayer('p2', 'Test', 'Lega');
    expect(p.faction).toBe('Lega');
    expect(p.color).toBe('Verde');
    expect(p.reserve).toEqual({ cavalleria: 5, vescovi: 3, mercanti: 4 });
  });

  it('recruit moves units from reserve to available', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    recruit(p, 'cavalleria', 2);
    expect(p.reserve.cavalleria).toBe(4);
    expect(p.available.cavalleria).toBe(2);
  });

  it('recruit is capped by reserve', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    recruit(p, 'mercanti', 10); // only 3 in Barbarossa reserve
    expect(p.reserve.mercanti).toBe(0);
    expect(p.available.mercanti).toBe(3);
  });

  it('consumeAvailable decreases available', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    recruit(p, 'cavalleria', 3);
    consumeAvailable(p, 'cavalleria', 2);
    expect(p.available.cavalleria).toBe(1);
  });

  it('consumeAvailable throws if not enough', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    expect(() => consumeAvailable(p, 'cavalleria', 1)).toThrow();
  });

  it('returnToReserve increases reserve', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    recruit(p, 'vescovi', 2);
    returnToReserve(p, 'vescovi', 2);
    expect(p.reserve.vescovi).toBe(4);
    expect(p.available.vescovi).toBe(0);
  });

  it('hasUnitsInReserve checks correctly', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    expect(hasUnitsInReserve(p, 'cavalleria', 6)).toBe(true);
    expect(hasUnitsInReserve(p, 'cavalleria', 7)).toBe(false);
  });

  it('hasAvailableUnits checks correctly', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    expect(hasAvailableUnits(p, 'cavalleria', 1)).toBe(false);
    recruit(p, 'cavalleria', 2);
    expect(hasAvailableUnits(p, 'cavalleria', 2)).toBe(true);
  });

  it('applyMerchantIncome moves merchants from reserve to available', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    const added = applyMerchantIncome(p, 2);
    expect(added).toBe(2);
    expect(p.reserve.mercanti).toBe(1);
    expect(p.available.mercanti).toBe(2);
  });

  it('addCard and removeCard work correctly', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    addCard(p, 'Milano');
    addCard(p, 'Asti');
    expect(p.hand).toEqual(['Milano', 'Asti']);
    removeCard(p, 'Milano');
    expect(p.hand).toEqual(['Asti']);
  });

  it('removeCard throws for card not in hand', () => {
    const p = createPlayer('p1', 'T', 'Barbarossa');
    expect(() => removeCard(p, 'Milano')).toThrow();
  });
});
