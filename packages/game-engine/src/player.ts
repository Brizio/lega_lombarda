import type { Faction, UnitType, CityName, PlayerState } from './types';
import { STARTING_RESERVES, UNIT_TYPES, FACTION_COLORS } from './types';

export function createPlayer(id: string, name: string, faction: Faction): PlayerState {
  const reserve = { ...STARTING_RESERVES[faction] };
  return {
    id,
    name,
    faction,
    color: FACTION_COLORS[faction],
    hand: [],
    reserve,
    available: { cavalleria: 0, vescovi: 0, mercanti: 0 },
    citiesControlled: [],
    startingCity: null,
    turnCompleted: false,
    isReady: false,
  };
}

export function hasUnitsInReserve(player: PlayerState, type: UnitType, qty: number): boolean {
  return player.reserve[type] >= qty;
}

export function hasAvailableUnits(player: PlayerState, type: UnitType, qty: number): boolean {
  return player.available[type] >= qty;
}

/** Move units from reserve → available (recruitment) */
export function recruit(player: PlayerState, type: UnitType, qty: number): void {
  const effective = Math.min(qty, player.reserve[type]);
  if (effective <= 0) return;
  player.reserve[type] -= effective;
  player.available[type] += effective;
}

/** Consume available units (when deploying to a conflict) */
export function consumeAvailable(player: PlayerState, type: UnitType, qty: number): void {
  if (player.available[type] < qty) {
    throw new Error(`Non hai abbastanza ${type} disponibili`);
  }
  player.available[type] -= qty;
}

/** Return units back to reserve (after conflict resolution) */
export function returnToReserve(player: PlayerState, type: UnitType, qty: number): void {
  player.available[type] -= qty;
  player.reserve[type] += qty;
}

/** Merchant income: for each merchant on the map, move 1 merchant from reserve → available */
export function applyMerchantIncome(player: PlayerState, merchantsOnMap: number): number {
  const toRecruit = Math.min(merchantsOnMap, player.reserve[UNIT_TYPES.MERCANTI]);
  if (toRecruit > 0) {
    player.reserve[UNIT_TYPES.MERCANTI] -= toRecruit;
    player.available[UNIT_TYPES.MERCANTI] += toRecruit;
  }
  return toRecruit;
}

export function addCard(player: PlayerState, card: CityName): void {
  player.hand.push(card);
}

export function removeCard(player: PlayerState, card: CityName): void {
  const idx = player.hand.indexOf(card);
  if (idx === -1) throw new Error(`Carta ${card} non in mano`);
  player.hand.splice(idx, 1);
}

/** Public view — hides hand and reserves from opponent */
export function toClientData(player: PlayerState) {
  return {
    id: player.id,
    name: player.name,
    faction: player.faction,
    color: player.color,
    handSize: player.hand.length,
    citiesControlled: [...player.citiesControlled],
    startingCity: player.startingCity,
    isReady: player.isReady,
  };
}

/** Owner view — full data including hand */
export function toOwnerData(player: PlayerState) {
  return {
    ...player,
    hand: [...player.hand],
    reserve: { ...player.reserve },
    available: { ...player.available },
    citiesControlled: [...player.citiesControlled],
  };
}
