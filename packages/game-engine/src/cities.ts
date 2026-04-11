import type { CityName, SpecialCityName, AnyCityName, CityPosition, CityState } from './types';
import { CITY_NAMES } from './types';

// ─── Adjacency Graph ─────────────────────────────────────────
// Includes 15 playable cities + 2 special (Roma, Germania)

const ADJACENCY: Record<AnyCityName, AnyCityName[]> = {
  Milano: ['Asti', 'Lodi', 'Bergamo', 'Modena'],
  Asti: ['Lodi', 'Milano'],
  Ferrara: ['Padova', 'Venezia', 'Ravenna'],
  Firenze: ['Pisa', 'Bologna', 'Roma'],
  Bergamo: ['Milano', 'Modena', 'Germania'],
  Pisa: ['Firenze'],
  Lodi: ['Milano', 'Modena', 'Asti'],
  Verona: ['Modena', 'Trento', 'Bologna', 'Padova'],
  Venezia: ['Padova', 'Ferrara'],
  Padova: ['Trento', 'Verona', 'Ferrara', 'Venezia'],
  Ravenna: ['Ferrara', 'Bologna', 'Ancona'],
  Bologna: ['Verona', 'Firenze', 'Ravenna'],
  Modena: ['Bergamo', 'Milano', 'Lodi', 'Verona'],
  Ancona: ['Ravenna', 'Roma'],
  Trento: ['Verona', 'Padova', 'Germania'],
  Roma: ['Firenze', 'Ancona'],
  Germania: ['Bergamo', 'Trento'],
};

// ─── City Positions (% on map image) ─────────────────────────
const CITY_POSITIONS: Record<CityName, CityPosition> = {
  Milano: { top: 77.7, left: 80.1 },
  Asti: { top: 83.9, left: 92.9 },
  Ferrara: { top: 82.4, left: 12.5 },
  Firenze: { top: 38.4, left: 39.2 },
  Bergamo: { top: 88.1, left: 66.8 },
  Pisa: { top: 33.0, left: 56.4 },
  Lodi: { top: 62.6, left: 92.5 },
  Verona: { top: 71.1, left: 49.5 },
  Venezia: { top: 96.8, left: 6.7 },
  Padova: { top: 87.5, left: 28.4 },
  Ravenna: { top: 66.1, left: 8.9 },
  Bologna: { top: 64.4, left: 33.7 },
  Modena: { top: 67.5, left: 63.9 },
  Ancona: { top: 48.4, left: 6.3 },
  Trento: { top: 88.6, left: 45.1 },
};

// ─── Special Cities ──────────────────────────────────────────
const SPECIAL_CITIES: Record<SpecialCityName, { name: SpecialCityName; connections: AnyCityName[]; description: string }> = {
  Roma: { name: 'Roma', connections: ['Firenze', 'Ancona'], description: 'Sede del Papa.' },
  Germania: { name: 'Germania', connections: ['Bergamo', 'Trento'], description: 'Sacro Romano Impero.' },
};

export function getConnections(city: AnyCityName): AnyCityName[] {
  return ADJACENCY[city] ?? [];
}

export function isSpecialCity(name: string): name is SpecialCityName {
  return name === 'Roma' || name === 'Germania';
}

export function isPlayableCity(name: string): name is CityName {
  return (CITY_NAMES as readonly string[]).includes(name);
}

export function getCityPosition(name: CityName): CityPosition {
  return CITY_POSITIONS[name];
}

export function initializeCities(): CityState[] {
  return CITY_NAMES.map((name) => ({
    name,
    controlledBy: null,
    units: [],
  }));
}

export function areAdjacent(a: AnyCityName, b: AnyCityName): boolean {
  return (ADJACENCY[a] ?? []).includes(b);
}

export { ADJACENCY, CITY_POSITIONS, SPECIAL_CITIES };
