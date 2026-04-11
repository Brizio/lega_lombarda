import { describe, it, expect } from 'vitest';
import { getCard, getAllCardNames, getRecruitment, buildDeck, CARDS } from '../src/cards';
import { CITY_NAMES } from '../src/types';

describe('cards', () => {
  it('should have exactly 15 city cards', () => {
    expect(getAllCardNames()).toHaveLength(15);
  });

  it('should match all CITY_NAMES', () => {
    const names = getAllCardNames();
    for (const cn of CITY_NAMES) {
      expect(names).toContain(cn);
    }
  });

  it('getCard returns correct data for Milano', () => {
    const c = getCard('Milano');
    expect(c.name).toBe('Milano');
    expect(c.power).toBe('capitale_lega');
    expect(c.recruitment).toEqual({ cavalleria: 2, vescovi: 1, mercanti: 2 });
    expect(c.recruitmentControlled).toEqual({ cavalleria: 1, vescovi: 1, mercanti: 1 });
    expect(c.connections).toEqual(expect.arrayContaining(['Asti', 'Lodi', 'Bergamo', 'Modena']));
  });

  it('getCard throws for unknown city', () => {
    expect(() => getCard('Atlantide' as any)).toThrow();
  });

  it('getRecruitment returns base when not controlled', () => {
    const r = getRecruitment('Trento', false);
    expect(r).toEqual({ cavalleria: 2, vescovi: 1, mercanti: 0 });
  });

  it('getRecruitment returns controlled values when controlled', () => {
    const r = getRecruitment('Trento', true);
    expect(r).toEqual({ cavalleria: 1, vescovi: 1, mercanti: 0 });
  });

  it('cities without powers have power=null', () => {
    expect(getCard('Bergamo').power).toBeNull();
    expect(getCard('Lodi').power).toBeNull();
    expect(getCard('Modena').power).toBeNull();
    expect(getCard('Ancona').power).toBeNull();
  });

  it('cities with powers have correct power', () => {
    expect(getCard('Milano').power).toBe('capitale_lega');
    expect(getCard('Asti').power).toBe('sede_vescovile');
    expect(getCard('Ferrara').power).toBe('mercato');
    expect(getCard('Firenze').power).toBe('fortezza');
    expect(getCard('Pisa').power).toBe('porto_navale');
    expect(getCard('Verona').power).toBe('crocevia');
    expect(getCard('Venezia').power).toBe('potenza_navale');
    expect(getCard('Padova').power).toBe('universita');
    expect(getCard('Ravenna').power).toBe('via_commerciale');
    expect(getCard('Bologna').power).toBe('diritto_canonico');
    expect(getCard('Trento').power).toBe('controllo_imperiale');
  });

  it('buildDeck returns shuffled 15 cards', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(15);
    expect(new Set(deck).size).toBe(15);
  });
});
