import type { GameState, Faction, Conflict, CityState } from './types';
import { UNIT_TYPES } from './types';

import { getConnections, isSpecialCity } from './cities';
import { returnToReserve } from './player';
import { addUnitToCity } from './actions';

/**
 * Resolve all active conflicts in placement order.
 */
export function resolveConflicts(state: GameState): void {
  const toResolve = state.activeConflicts
    .filter((c) => !c.resolved)
    .sort((a, b) => a.order - b.order);

  for (const conflict of toResolve) {
    resolveSingleConflict(state, conflict, toResolve);
  }

  // Resolved conflict cards go to discards
  for (const conflict of state.activeConflicts) {
    if (conflict.resolved) {
      state.discards.push(conflict.city);
    }
  }

  // Clear resolved conflicts
  state.activeConflicts = state.activeConflicts.filter((c) => !c.resolved);
}

/**
 * Resolve a single conflict:
 * 1. Count units + bishop adjacency bonus
 * 2. Tie → winner is the player ahead on Italy Control
 * 3. Winner places 1 unit on city, all others return to reserve
 * 4. Cavalry cascade to next conflict
 */
function resolveSingleConflict(
  state: GameState,
  conflict: Conflict,
  allConflicts: Conflict[],
): void {
  const factions = Object.keys(conflict.deployments) as Faction[];

  if (factions.length < 2) {
    // Only one faction or none → auto-win
    if (factions.length === 1) {
      assignConflictVictory(state, conflict, factions[0], null);
    }
    conflict.resolved = true;
    return;
  }

  const [f1, f2] = factions;
  const strength1 = calculateConflictStrength(state, conflict, f1);
  const strength2 = calculateConflictStrength(state, conflict, f2);

  let winner: Faction;
  let loser: Faction;

  if (strength1 > strength2) {
    winner = f1;
    loser = f2;
  } else if (strength2 > strength1) {
    winner = f2;
    loser = f1;
  } else {
    // Tie: winner is the player ahead on Italy Control
    winner = state.italyControl >= 0 ? 'Barbarossa' : 'Lega';
    loser = winner === f1 ? f2 : f1;
  }

  assignConflictVictory(state, conflict, winner, loser);
  executeCavalryCascade(state, conflict, winner, allConflicts);

  conflict.resolved = true;
  state.log.push(
    `Conflitto a ${conflict.city}: vince ${winner} (${strength1} vs ${strength2})`,
  );
}

/**
 * Calculate a faction's strength in a conflict:
 * deployed units + adjacent bishop bonus from map
 */
export function calculateConflictStrength(
  state: GameState,
  conflict: Conflict,
  faction: Faction,
): number {
  let count = 0;

  // Count deployed units
  const deployments = conflict.deployments[faction] ?? [];
  for (const d of deployments) {
    count += d.quantity;
  }

  // Bishop adjacency bonus: +1 for each bishop of this faction on map in adjacent cities
  const connections = getConnections(conflict.city);
  for (const adj of connections) {
    if (isSpecialCity(adj)) continue;
    const city = state.cities.find((c) => c.name === adj);
    if (!city) continue;
    for (const group of city.units) {
      if (group.faction === faction && group.type === UNIT_TYPES.VESCOVI) {
        count += group.quantity;
      }
    }
  }

  return count;
}

/**
 * Assign conflict victory: winner places 1 unit, rest return to reserve.
 * All loser units return to reserve.
 */
function assignConflictVictory(
  state: GameState,
  conflict: Conflict,
  winner: Faction,
  loser: Faction | null,
): void {
  const city = state.cities.find((c) => c.name === conflict.city);

  // Winner places 1 unit on the city (first group type)
  const winnerDeployments = conflict.deployments[winner] ?? [];
  if (winnerDeployments.length > 0 && city) {
    const firstGroup = winnerDeployments[0];
    addUnitToCity(city, winner, firstGroup.type, 1);
    firstGroup.quantity -= 1;

    // Change city control
    changeCityControl(state, city, winner);
  }

  // All remaining winner units → reserve
  const winnerPlayer = state.players.find((p) => p.faction === winner);
  for (const d of winnerDeployments) {
    if (d.quantity > 0 && winnerPlayer) {
      returnToReserve(winnerPlayer, d.type, d.quantity);
    }
  }

  // All loser units → reserve
  if (loser) {
    const loserPlayer = state.players.find((p) => p.faction === loser);
    const loserDeployments = conflict.deployments[loser] ?? [];
    for (const d of loserDeployments) {
      if (d.quantity > 0 && loserPlayer) {
        returnToReserve(loserPlayer, d.type, d.quantity);
      }
    }
  }
}

/**
 * Cavalry cascade: remaining cavalry from winner cascade to the next unresolved conflict.
 */
function executeCavalryCascade(
  state: GameState,
  conflict: Conflict,
  winner: Faction,
  allConflicts: Conflict[],
): void {
  const winnerDeployments = conflict.deployments[winner] ?? [];
  const cavalryGroup = winnerDeployments.find((d) => d.type === UNIT_TYPES.CAVALLERIA);
  if (!cavalryGroup) return;

  // The cavalry that were returned to reserve in assignConflictVictory can cascade
  const cascadeCount = cavalryGroup.quantity; // already 0 after return, but was counted before
  // Actually: assignConflictVictory already returned them to reserve.
  // We need to "take back" from reserve and put into next conflict.
  if (cascadeCount <= 0) return;

  const currentIdx = allConflicts.indexOf(conflict);
  let nextConflict: Conflict | null = null;
  for (let i = currentIdx + 1; i < allConflicts.length; i++) {
    if (!allConflicts[i].resolved) {
      nextConflict = allConflicts[i];
      break;
    }
  }
  if (!nextConflict) return;

  const winnerPlayer = state.players.find((p) => p.faction === winner);
  if (!winnerPlayer) return;

  const effective = Math.min(cascadeCount, winnerPlayer.reserve[UNIT_TYPES.CAVALLERIA]);
  if (effective <= 0) return;

  winnerPlayer.reserve[UNIT_TYPES.CAVALLERIA] -= effective;

  if (!nextConflict.deployments[winner]) {
    nextConflict.deployments[winner] = [];
  }

  const existing = nextConflict.deployments[winner]!.find(
    (d) => d.type === UNIT_TYPES.CAVALLERIA,
  );
  if (existing) {
    existing.quantity += effective;
  } else {
    nextConflict.deployments[winner]!.push({
      type: UNIT_TYPES.CAVALLERIA,
      quantity: effective,
    });
  }

  state.log.push(
    `Cascata: ${effective} cavalieri di ${winner} al conflitto di ${nextConflict.city}`,
  );
}

// ─── City Control ────────────────────────────────────────────

export function changeCityControl(state: GameState, city: CityState, newController: Faction): void {
  if (city.controlledBy) {
    const prev = state.players.find((p) => p.faction === city.controlledBy);
    if (prev) {
      prev.citiesControlled = prev.citiesControlled.filter((c) => c !== city.name);
    }
  }
  city.controlledBy = newController;
  const owner = state.players.find((p) => p.faction === newController);
  if (owner && !owner.citiesControlled.includes(city.name)) {
    owner.citiesControlled.push(city.name);
  }
}
