import type { UnitType, Faction, UnitGroup } from './types';
import { UNIT_TYPES, FACTION_COLORS } from './types';

export function createUnitGroup(faction: Faction, type: UnitType, quantity: number): UnitGroup {
  return { faction, type, quantity };
}

export function getUnitAssetPath(type: UnitType, faction: Faction): string {
  const color = FACTION_COLORS[faction];
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  return `/assets/Pedine/${typeLabel}-${color}.png`;
}

export function getCardAssetPath(cityName: string): string {
  return `/assets/CarteCitta/${cityName}.png`;
}

export function getMapAssetPath(variant: 'big' | 'small' = 'big'): string {
  return variant === 'big' ? '/assets/Mappa/0_Big.png' : '/assets/Mappa/0_small.png';
}

export function isValidUnitType(type: string): type is UnitType {
  return Object.values(UNIT_TYPES).includes(type as UnitType);
}

export { UNIT_TYPES };
