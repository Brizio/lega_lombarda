import type { GameState, PlayerState, CityName } from './types';
import { getCard } from './cards';

/**
 * Execute the special power of a city card.
 * Powers are stubs that log activation — detailed effects to be implemented
 * as the game design solidifies.
 */
export function executePower(
  state: GameState,
  player: PlayerState,
  cardName: CityName,
  _details: Record<string, unknown> = {},
): void {
  const card = getCard(cardName);
  if (!card.power) {
    throw new Error(`${cardName} non ha un potere speciale`);
  }

  switch (card.power) {
    case 'capitale_lega':
      // Milano: Bonus difesa +1 when defending Milano
      state.log.push(`${player.faction} attiva Capitale della Lega (Milano): bonus difesa +1`);
      break;

    case 'sede_vescovile':
      // Asti: Bishops cost -1
      state.log.push(`${player.faction} attiva Sede Vescovile (Asti): vescovi costano -1`);
      break;

    case 'mercato':
      // Ferrara: Recruit 1 merchant for free
      state.log.push(`${player.faction} attiva Mercato (Ferrara): recluta mercanti gratis`);
      break;

    case 'fortezza':
      // Firenze: Defense +2 against sieges
      state.log.push(`${player.faction} attiva Fortezza (Firenze): difesa +2 contro assedi`);
      break;

    case 'porto_navale':
      // Pisa: Naval routes control
      state.log.push(`${player.faction} attiva Porto Navale (Pisa): controlla rotte tirreniche`);
      break;

    case 'crocevia':
      // Verona: Commercial crossroads
      state.log.push(`${player.faction} attiva Crocevia (Verona): crocevia commerciale`);
      break;

    case 'potenza_navale':
      // Venezia: Naval power
      state.log.push(`${player.faction} attiva Potenza Navale (Venezia): potenza marittima`);
      break;

    case 'universita':
      // Padova: Bishops +1 in combat
      state.log.push(`${player.faction} attiva Università (Padova): vescovi +1 in combattimento`);
      break;

    case 'via_commerciale':
      // Ravenna: Adriatic trade route
      state.log.push(`${player.faction} attiva Via Commerciale (Ravenna): rotta commerciale adriatica`);
      break;

    case 'diritto_canonico':
      // Bologna: Bishops cannot be eliminated
      state.log.push(`${player.faction} attiva Diritto Canonico (Bologna): vescovi non eliminabili`);
      break;

    case 'controllo_imperiale':
      // Trento: Imperial control
      state.log.push(`${player.faction} attiva Controllo Imperiale (Trento): controllo imperiale diretto`);
      break;

    default:
      throw new Error(`Potere ${card.power} non riconosciuto`);
  }
}
