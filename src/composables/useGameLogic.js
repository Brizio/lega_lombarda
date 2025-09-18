import { ref } from 'vue';
import cardsData from '../data/cards.js';

// --- Game State ---
const round = ref(1);
const maxRounds = 5;
const controlloItalia = ref(1); // 1 = lato Barbarossa, 5 = lato Lega

const barbarossa = ref({
  name: 'Federico Barbarossa',
  color: 'yellow',
  hand: [],
  units: { cavalleria: 0, vescovi: 0, mercanti: 0 },
  cities: [],
  markets: 0,
  // explicit reserve per tipo unità
  reserve: { cavalleria: 10, vescovi: 5, mercanti: 8 },
});
const lega = ref({
  name: 'Lega Lombarda',
  color: 'green',
  hand: [],
  units: { cavalleria: 0, vescovi: 0, mercanti: 0 },
  cities: [],
  markets: 0,
  // explicit reserve per tipo unità
  reserve: { cavalleria: 10, vescovi: 5, mercanti: 8 },
});

const deck = ref([...cardsData]);
const discardPile = ref([]);

const draftPhase = ref(1); // 1: 2 carte, 2: 3 carte
const draftCards = ref({ barbarossa: [], lega: [] });

const conflicts = ref([]); // { city, type, units: { barbarossa: [], lega: [] } }

const phase = ref('menu'); // 'menu', 'draft', 'initialPlacement', 'showHands', 'azioni', 'risoluzione'
const currentPlayer = ref('barbarossa');

// --- Utility ---
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// --- Game Logic Functions ---

function startGame() {
  resetGame();
  startDraft();
}

function startDraft() {
  phase.value = 'draft';
  draftPhase.value = 1;
  deck.value = shuffle([...cardsData]);
  discardPile.value = [];
  barbarossa.value.hand = [];
  lega.value.hand = [];
  draftCards.value.barbarossa = deck.value.splice(0, 2);
  draftCards.value.lega = deck.value.splice(0, 2);
}

function draftPickPhase1(player, pickedCard) {
  const otherPlayer = player === 'barbarossa' ? 'lega' : 'barbarossa';
  const cards = draftCards.value[player];
  const otherCard = cards.find(c => c !== pickedCard);
  if (player === 'barbarossa') {
    barbarossa.value.hand.push(pickedCard);
    lega.value.hand.push(otherCard);
    draftCards.value.lega = deck.value.splice(0, 2);
    draftPhase.value = 1.5;
  } else {
    lega.value.hand.push(pickedCard);
    barbarossa.value.hand.push(otherCard);
    draftPhase.value = 2;
    draftCards.value.barbarossa = deck.value.splice(0, 3);
    draftCards.value.lega = deck.value.splice(0, 3);
  }
}

function draftPickPhase2(player, pickedCard) {
  const otherPlayer = player === 'barbarossa' ? 'lega' : 'barbarossa';
  const cards = draftCards.value[player];
  const others = cards.filter(c => c !== pickedCard);
  if (player === 'barbarossa') {
    barbarossa.value.hand.push(pickedCard);
    lega.value.hand.push(...others);
    draftPhase.value = 2.5;
    draftCards.value.barbarossa = [];
  } else {
    lega.value.hand.push(pickedCard);
    barbarossa.value.hand.push(...others);
    draftPhase.value = 3;
    draftCards.value.lega = [];
    draftCards.value.barbarossa = [];
    // Nuova fase: piazzamento iniziale
    if (round.value === 1) {
      phase.value = 'initialPlacement';
    } else {
      phase.value = 'showHands';
    }
  }
}

function proceedToActions() {
  initialSetup();
  phase.value = 'azioni';
}

function initialSetup() {
  if (round.value === 1) {
    lega.value.units.cavalleria = 2;
    barbarossa.value.units.cavalleria = 3;
  }
}

function startActions() {
  phase.value = 'azioni';
  currentPlayer.value = controlloItalia.value <= 3 ? 'barbarossa' : 'lega';
}

function playCard(player, card, actionType) {
  const hand = player === 'barbarossa' ? barbarossa.value.hand : lega.value.hand;
  hand.splice(hand.indexOf(card), 1);

  if (actionType === 'conflitto') {
    conflicts.value.push({
      city: card.city,
      type: null,
      units: { barbarossa: [], lega: [] },
    });
    discardPile.value.push(card);
  } else if (actionType === 'reclutamento') {
    const units = player === 'barbarossa' ? barbarossa.value.units : lega.value.units;
    const controlled = (player === 'barbarossa' ? barbarossa.value.cities : lega.value.cities).includes(card.city);
    const num = controlled ? card.recruitmentControlled : card.recruitmentFree;
    units.cavalleria += num;
    discardPile.value.push(card);
  } else if (actionType === 'potere') {
    discardPile.value.push(card);
  }
}

function deployUnits(player, conflictIndex, unitType, num) {
  const units = player === 'barbarossa' ? barbarossa.value.units : lega.value.units;
  if (units[unitType] >= num) {
    units[unitType] -= num;
    conflicts.value[conflictIndex].units[player].push({ type: unitType, num });
    if (!conflicts.value[conflictIndex].type) {
      conflicts.value[conflictIndex].type = unitType;
    }
  }
}

function resolveConflicts() {
  phase.value = 'risoluzione';
  conflicts.value.forEach((conflict) => {
    const barbTotal = conflict.units.barbarossa.reduce((sum, u) => sum + u.num, 0);
    const legaTotal = conflict.units.lega.reduce((sum, u) => sum + u.num, 0);
    let winner = null;
    if (barbTotal > legaTotal) winner = 'barbarossa';
    else if (legaTotal > barbTotal) winner = 'lega';
    else winner = currentPlayer.value;

    if (winner === 'barbarossa') barbarossa.value.cities.push(conflict.city);
    else lega.value.cities.push(conflict.city);
  });

  checkVictory();
  updateControlloItalia();
  if (!checkVictory() && round.value < maxRounds) {
    startNewRound();
  }
}

function checkVictory() {
  if (barbarossa.value.cities.length >= 6) return 'barbarossa';
  if (lega.value.cities.length >= 6) return 'lega';
  if (controlloItalia.value === 5) return 'lega';
  if (controlloItalia.value === 1) return 'barbarossa';
  if (round.value === maxRounds) {
    return controlloItalia.value <= 3 ? 'barbarossa' : 'lega';
  }
  return null;
}

function updateControlloItalia() {
  const diff = barbarossa.value.cities.length - lega.value.cities.length;
  controlloItalia.value += diff;
  if (controlloItalia.value < 1) controlloItalia.value = 1;
  if (controlloItalia.value > 5) controlloItalia.value = 5;
}

function startNewRound() {
  round.value += 1;
  barbarossa.value.units.mercanti += barbarossa.value.markets;
  lega.value.units.mercanti += lega.value.markets;
  startDraft();
}

function resetGame() {
  round.value = 1;
  controlloItalia.value = 1;
  barbarossa.value.hand = [];
  barbarossa.value.units = { cavalleria: 0, vescovi: 0, mercanti: 0 };
  barbarossa.value.cities = [];
  barbarossa.value.markets = 0;
  // reset explicit reserves
  barbarossa.value.reserve = { cavalleria: 10, vescovi: 5, mercanti: 8 };

  lega.value.hand = [];
  lega.value.units = { cavalleria: 0, vescovi: 0, mercanti: 0 };
  lega.value.cities = [];
  lega.value.markets = 0;
  // reset explicit reserves
  lega.value.reserve = { cavalleria: 10, vescovi: 5, mercanti: 8 };

  deck.value = shuffle([...cardsData]);
  discardPile.value = [];
  draftPhase.value = 1;
  draftCards.value = { barbarossa: [], lega: [] };
  conflicts.value = [];
  phase.value = 'menu';
  currentPlayer.value = 'barbarossa';
}

// optional helper to take units from reserve (example)
function takeFromReserve(faction, unitType, qty = 1) {
  const target = faction === 'barbarossa' ? barbarossa.value : lega.value;
  if (!target.reserve || (target.reserve[unitType] || 0) < qty) return false;
  target.reserve[unitType] -= qty;
  target.units[unitType] = (target.units[unitType] || 0) + qty;
  return true;
}

export function useGameLogic() {
  return {
    // State
    round,
    phase,
    barbarossa,
    lega,
    deck,
    discardPile,
    draftPhase,
    draftCards,
    conflicts,
    controlloItalia,
    currentPlayer,
    // Functions
    startGame,
    startDraft,
    draftPickPhase1,
    draftPickPhase2,
    proceedToActions,
    initialSetup,
    startActions,
    playCard,
    deployUnits,
    resolveConflicts,
    checkVictory,
    updateControlloItalia,
    startNewRound,
    resetGame,
    takeFromReserve,
  };
}