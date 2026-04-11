import type { GameState, Faction, CityName } from './types';
import { UNIT_TYPES } from './types';
import { getConnections, isSpecialCity } from './cities';
import { applyMerchantIncome } from './player';
import { resolveConflicts } from './resolution';
import { startDraft } from './draft';

// ─── End of Round ────────────────────────────────────────────

export function endRound(state: GameState): void {
  // 1. Resolve all conflicts
  resolveConflicts(state);

  // 2. Check victory by connection (6 connected cities)
  for (const player of state.players) {
    if (has6ConnectedCities(state, player.faction)) {
      state.winner = player.faction;
      endGame(state, `${player.faction} ha connesso 6 città!`);
      return;
    }
  }

  // 3. Update Italy Control
  updateItalyControl(state);

  // 4. Check victory by Italy Control track (reached ±5)
  if (state.italyControl >= 5) {
    state.winner = 'Barbarossa';
    endGame(state, 'Barbarossa ha raggiunto 5 su Controllo Italia!');
    return;
  }
  if (state.italyControl <= -5) {
    state.winner = 'Lega';
    endGame(state, 'Lega ha raggiunto 5 su Controllo Italia!');
    return;
  }

  // 5. Merchant income
  applyMerchantIncomeForAll(state);

  // 6. Check game end by time (5 rounds)
  state.timeMarker++;
  if (state.timeMarker >= 5) {
    if (state.italyControl > 0) {
      state.winner = 'Barbarossa';
    } else if (state.italyControl < 0) {
      state.winner = 'Lega';
    } else {
      state.winner = 'Pareggio';
    }
    endGame(state, `Fine 5 round. Controllo Italia: ${state.italyControl}`);
    return;
  }

  // 7. New round
  state.round++;
  state.conflictOrder = 0;
  state.log.push(`Round ${state.round} iniziato`);
  startDraft(state);
}

// ─── Italy Control ───────────────────────────────────────────

export function updateItalyControl(state: GameState): void {
  const barbarossa = state.players.find((p) => p.faction === 'Barbarossa');
  const lega = state.players.find((p) => p.faction === 'Lega');
  const bCities = barbarossa?.citiesControlled.length ?? 0;
  const lCities = lega?.citiesControlled.length ?? 0;
  state.italyControl += bCities - lCities;
}

// ─── Merchant Income ─────────────────────────────────────────

function applyMerchantIncomeForAll(state: GameState): void {
  for (const player of state.players) {
    let merchantsOnMap = 0;
    for (const city of state.cities) {
      for (const group of city.units) {
        if (group.faction === player.faction && group.type === UNIT_TYPES.MERCANTI) {
          merchantsOnMap += group.quantity;
        }
      }
    }
    if (merchantsOnMap > 0) {
      const added = applyMerchantIncome(player, merchantsOnMap);
      if (added > 0) {
        state.log.push(`${player.faction}: rendita ${added} mercanti`);
      }
    }
  }
}

// ─── Victory: 6 Connected Cities ─────────────────────────────

/**
 * BFS to check if a faction controls at least 6 cities
 * that are connected through controlled cities or special cities (Roma, Germania).
 */
export function has6ConnectedCities(state: GameState, faction: Faction): boolean {
  const player = state.players.find((p) => p.faction === faction);
  if (!player || player.citiesControlled.length < 6) return false;

  const controlled = new Set<string>(player.citiesControlled);
  const visited = new Set<string>();
  let maxComponent = 0;

  for (const start of controlled) {
    if (visited.has(start)) continue;

    let count = 0;
    const queue: string[] = [start];
    const inComponent = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (inComponent.has(current)) continue;
      inComponent.add(current);

      if (controlled.has(current)) {
        count++;
        visited.add(current);
      }

      const connections = getConnections(current as CityName);
      for (const neighbor of connections) {
        if (inComponent.has(neighbor)) continue;
        // Can traverse through controlled cities or special cities
        if (controlled.has(neighbor) || isSpecialCity(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    maxComponent = Math.max(maxComponent, count);
    if (maxComponent >= 6) return true;
  }

  return false;
}

// ─── End Game ────────────────────────────────────────────────

function endGame(state: GameState, reason: string): void {
  state.status = 'finished';
  state.log.push(`Partita terminata! ${reason} Vincitore: ${state.winner}`);
}
